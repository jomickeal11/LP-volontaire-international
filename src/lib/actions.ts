"use server"

import { revalidatePath } from "next/cache"
import {
  getCandidateApplicationSchema,
  getPartnerRequestSchema,
  projectProposalSchema,
  formatZodError,
  candidateApplicationSchema,
  partnerRequestSchema,
  updateStatusSchema,
  addNoteSchema,
  projectProposalStatusSchema,
  projectProposalInternalNoteSchema,
  type CandidateApplicationInput,
  type PartnerRequestInput,
} from "./validations"
import prisma from "./prisma"
import { verifySession } from "./auth"
import { verifyMagicBytes, checkRateLimit, getClientIp } from "./security"
import { validateStoredDocument } from "./upload-policy"
import type { CandidateStatus, LanguageCode } from "@prisma/client"
import { randomBytes, randomUUID } from "crypto"
import { files } from "./storage"
import { EmailService } from "./email"
import { getProjectProposalAdmin } from "./project-proposal-access"

async function notifyCandidateApplication(application: any): Promise<void> {
  await EmailService.sendCandidateApplicationEmails({
    applicationId: application.id,
    firstName: application.candidate.firstName,
    lastName: application.candidate.lastName,
    email: application.candidate.email,
    referenceNumber: application.referenceNumber,
    country: application.candidate.country,
    profession: application.profession || undefined,
    skills: application.skills.map((skill: any) => skill.skill.nameFr || skill.skill.nameEn),
    arrivalDate: application.arrivalDate
      ? new Intl.DateTimeFormat("fr-FR").format(new Date(application.arrivalDate))
      : undefined,
    duration: application.duration === "SIX_MONTHS"
      ? "6 mois"
      : application.duration === "NINE_MONTHS"
        ? "9 mois"
        : "12 mois",
    lang: (application.communicationLanguage || application.lang || "FR") as "FR" | "EN" | "DE",
  })
}

// Sécurité des fichiers téléversés
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 Mo max
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "odt", "ppt", "pptx", "jpg", "jpeg", "png"])

function validateUploadedFile(file: File, buffer?: Buffer): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier "${file.name}" dépasse la taille maximale autorisée de 15 Mo.`
    }
  }

  const ext = (file.name.split(".").pop() || "").toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Format de fichier non autorisé pour "${file.name}". Formats acceptés : PDF, DOC, DOCX, ODT, PPT, PPTX, JPG, PNG.`
    }
  }

  // Vérification cryptographique des Magic Bytes (OWASP Défense en profondeur)
  if (buffer) {
    const magic = verifyMagicBytes(buffer, file.name)
    if (!magic.valid) {
      return {
        valid: false,
        error: magic.reason || `Le contenu réel du fichier "${file.name}" ne correspond pas à son format annoncé.`
      }
    }
  }

  return { valid: true }
}

// Generates CAND-YYYY-XXXX (4 random hex chars)
function generateReferenceNumber(): string {
  const year = new Date().getFullYear()
  const randomStr = randomBytes(2).toString('hex').toUpperCase()
  return `CAND-${year}-${randomStr}`
}

export async function submitCandidateApplication(
  data: CandidateApplicationInput,
  lang: "FR" | "EN" | "DE" = "FR",
  sendNotifications = true,
  documents: Array<{
    type: "CV" | "MOTIVATION_LETTER" | "PORTFOLIO"
    originalName: string
    storageKey: string
    mimeType: string
    size: number
  }> = []
) {
  try {
    const schema = getCandidateApplicationSchema(lang)
    const validated = schema.parse(data)
    
    // Duplicate check: prevent same email from submitting within 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentApplication = await prisma.candidature.findFirst({
      where: {
        candidate: { email: validated.email },
        createdAt: { gte: fiveMinsAgo }
      }
    })
    
    if (recentApplication) {
      throw new Error("Vous avez déjà soumis une candidature récemment.")
    }

    const application = await prisma.$transaction(async (tx) => {
      // Ensure skills exist or create them dynamically
      const existingSkills = await Promise.all(
        validated.skills.map(async (slug) => {
          let skill = await tx.competence.findUnique({ where: { slug } })
          if (!skill) {
            skill = await tx.competence.create({
              data: {
                slug,
                nameFr: slug,
                nameEn: slug,
                nameDe: slug,
                category: "GENERAL",
              },
            })
          }
          return skill
        })
      )
      
      // Find or create candidate
      let candidate = await tx.candidat.findUnique({
        where: { email: validated.email }
      })
      
      if (!candidate) {
        candidate = await tx.candidat.create({
          data: {
            firstName: validated.firstName,
            lastName: validated.lastName,
            email: validated.email,
            phone: validated.phone,
            country: validated.country,
            city: validated.city,
            dateOfBirth: new Date(validated.dob),
          }
        })
      }

      // Create Application
      let refNum = generateReferenceNumber()
      // Collision retry logic
      for (let i = 0; i < 3; i++) {
        const exists = await tx.candidature.findUnique({ where: { referenceNumber: refNum }})
        if (!exists) break
        refNum = generateReferenceNumber()
      }

      const newApp = await tx.candidature.create({
        data: {
          referenceNumber: refNum,
          candidateId: candidate.id,
          status: "NEW",
          lang: lang as LanguageCode,
          communicationLanguage: (validated.communicationLanguage || lang) as LanguageCode,
          education: validated.education,
          fieldOfStudy: validated.fieldOfStudy,
          profession: validated.profession,
          experienceLevel: validated.experience as any,
          digitalSkillLevel: validated.digitalSkillLevel,
          languages: validated.languages || null,
          arrivalDate: validated.arrivalDate ? new Date(validated.arrivalDate) : new Date(),
          duration: validated.duration as any,
          motivation: validated.motivation,
          projectExperience: validated.projectExp,
          source: validated.source,
          utmSource: validated.utmSource || null,
          utmMedium: validated.utmMedium || null,
          utmCampaign: validated.utmCampaign || null,
          utmContent: validated.utmContent || null,
          utmTerm: validated.utmTerm || null,
          consentData: validated.consent,
          skills: {
            create: existingSkills.map(s => ({ skillId: s.id }))
          }
        },
        include: {
          candidate: true,
          skills: { include: { skill: true } }
        }
      })

      if (documents.length > 0) {
        await tx.documentCandidature.createMany({
          data: documents.map((document) => ({
            ...document,
            applicationId: newApp.id,
          })),
        })
      }
      
      return newApp
    })

    if (sendNotifications) {
      try {
        await notifyCandidateApplication(application)
      } catch (error) {
        console.warn("Emails failed to send, but application was saved:", error)
      }
    }

    return { success: true as const, data: application }
  } catch (err: unknown) {
    console.error(err)
    const message = formatZodError(err, lang)
    return { success: false as const, error: message }
  }
}

export async function submitPartnerRequest(
  data: PartnerRequestInput,
  lang: "FR" | "EN" | "DE" = "FR",
  sendNotifications = true,
  document?: {
    originalName: string
    storageKey: string
    mimeType: string
    size: number
  }
) {
  try {
    const schema = getPartnerRequestSchema(lang)
    const validated = schema.parse(data)

    // Generate reference number PART-YYYY-XXXX
    const year = new Date().getFullYear()
    let refNum = `PART-${year}-${randomBytes(2).toString('hex').toUpperCase()}`
    
    // Check collision safely
    for (let i = 0; i < 3; i++) {
      try {
        const exists = await (prisma as any).demandePartenariat.findFirst({
          where: { referenceNumber: refNum }
        })
        if (!exists) break
      } catch {
        // If query engine hasn't reloaded the unique index yet, break to proceed
        break
      }
      refNum = `PART-${year}-${randomBytes(2).toString('hex').toUpperCase()}`
    }

    const partnerRequest = await (prisma as any).demandePartenariat.create({
      data: {
        referenceNumber: refNum,
        lang: lang as LanguageCode,
        communicationLanguage: (validated.communicationLanguage || lang) as LanguageCode,
        orgName: validated.orgName,
        country: validated.country,
        website: validated.website || null,
        orgType: validated.orgType,
        contactPerson: validated.contactPerson,
        email: validated.email,
        phone: validated.phone || null,
        volunteerCount: validated.volunteerCount || null,
        targetCountries: validated.targetCountries || null,
        programme: validated.programme || null,
        message: validated.message,
        consent: validated.consent,
        status: "PENDING",
        utmSource: validated.utmSource || null,
        utmMedium: validated.utmMedium || null,
        utmCampaign: validated.utmCampaign || null,
        utmContent: validated.utmContent || null,
        utmTerm: validated.utmTerm || null,
        documents: document ? { create: document } : undefined,
      }
    })

    if (sendNotifications) {
      try {
        await EmailService.sendPartnerRequestEmails({
          orgName: partnerRequest.orgName,
          contactPerson: partnerRequest.contactPerson,
          email: partnerRequest.email,
          referenceNumber: partnerRequest.referenceNumber || refNum,
          country: partnerRequest.country,
          orgType: partnerRequest.orgType,
          lang: (partnerRequest.communicationLanguage || validated.communicationLanguage || lang) as "FR" | "EN" | "DE",
        })
      } catch (error) {
        console.warn("Partner emails failed to send, but request was saved:", error)
      }
    }

    return { success: true as const, data: partnerRequest }
  } catch (err: unknown) {
    console.error("submitPartnerRequest error:", err)
    const message = formatZodError(err, lang)
    return { success: false as const, error: message }
  }
}

export async function submitPartnerRequestFormData(
  formData: FormData,
  lang: "FR" | "EN" | "DE" = "FR"
): Promise<
  | { success: true; data: any; error?: undefined }
  | { success: false; error: string; data?: undefined }
> {
  try {
    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`submit-partner:${ip}`, 10, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return {
        success: false as const,
        error: "Trop de requêtes détectées depuis cette adresse. Veuillez patienter quelques minutes avant de renouveler votre demande."
      }
    }

    const data: any = {}
    let uploadedFile: {
      originalName: string
      storageKey: string
      mimeType: string
      size: number
    } | null = null

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0 && value.name !== "undefined") {
          const buffer = Buffer.from(await value.arrayBuffer())
          const fileCheck = validateUploadedFile(value, buffer)
          if (!fileCheck.valid) {
            return { success: false as const, error: fileCheck.error || "Fichier non autorisé" }
          }
          const ext = (value.name.split('.').pop() || "pdf").toLowerCase()
          const filename = `${randomUUID()}.${ext}`
          await files.upload(filename, buffer, { contentType: value.type || "application/octet-stream" })

          uploadedFile = {
            originalName: value.name,
            storageKey: filename,
            mimeType: value.type || "application/octet-stream",
            size: value.size,
          }
          data[key] = filename
        }
      } else if (key === "document") {
        // Téléversement direct vers le stockage : on revalide l'objet stocké
        // (taille réelle + octets magiques) avant de rattacher le document.
        const descriptor = JSON.parse(String(value))
        const check = await validateStoredDocument("partner-doc", descriptor)
        if (!check.valid) {
          return { success: false as const, error: check.error || "Fichier non autorisé" }
        }
        uploadedFile = {
          originalName: descriptor.originalName,
          storageKey: descriptor.storageKey,
          mimeType: check.mimeType || "application/octet-stream",
          size: check.size || 0,
        }
        data.docFile = descriptor.storageKey
      } else {
        data[key] = value === "true" ? true : value === "false" ? false : value
      }
    }

    const result = await submitPartnerRequest(
      data as PartnerRequestInput,
      lang,
      false,
      uploadedFile || undefined
    )

    if (result.success && result.data) {
      try {
        await EmailService.sendPartnerRequestEmails({
          orgName: result.data.orgName,
          contactPerson: result.data.contactPerson,
          email: result.data.email,
          referenceNumber: result.data.referenceNumber,
          country: result.data.country,
          orgType: result.data.orgType,
          lang: (result.data.communicationLanguage || result.data.lang || lang) as "FR" | "EN" | "DE",
        })
      } catch (error) {
        console.warn("Partner emails failed to send after request persistence:", error)
      }
    }

    return result
  } catch (err: unknown) {
    console.error("submitPartnerRequestFormData error:", err)
    const message = err instanceof Error ? err.message : "Erreur lors de la soumission du dossier"
    return { success: false, error: message }
  }
}

export async function submitProjectProposalFormData(
  formData: FormData,
  lang: "FR" | "EN" | "DE" = "FR"
): Promise<{ success: true; referenceNumber: string } | { success: false; error: string }> {
  try {
    if (!["FR", "EN", "DE"].includes(lang)) {
      return { success: false, error: "Langue invalide." }
    }
    if (String(formData.get("website") || "").trim()) {
      return { success: false, error: "Soumission invalide." }
    }

    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`submit-project-proposal:${ip}`, 5, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return { success: false, error: "Trop de soumissions depuis cette adresse. Veuillez patienter quelques minutes avant de réessayer." }
    }

    const rawData: Record<string, unknown> = Object.fromEntries(
      [...formData.entries()].filter(([key]) => key !== "document" && key !== "website")
    )
    rawData.consent = formData.get("consent") === "true"
    const data = projectProposalSchema.parse(rawData)

    let uploadedDocument: {
      originalName: string
      storageKey: string
      mimeType: string
      size: number
    } | undefined
    const documentValue = formData.get("document")
    if (typeof documentValue === "string" && documentValue) {
      let parsedDescriptor: unknown
      try {
        parsedDescriptor = JSON.parse(documentValue)
      } catch {
        return { success: false, error: "Le document joint est invalide. Veuillez le téléverser à nouveau." }
      }
      if (!parsedDescriptor || typeof parsedDescriptor !== "object") {
        return { success: false, error: "Le document joint est incomplet. Veuillez le téléverser à nouveau." }
      }
      const descriptor = parsedDescriptor as Record<string, unknown>
      if (typeof descriptor.storageKey !== "string" || typeof descriptor.originalName !== "string") {
        return { success: false, error: "Le document joint est incomplet. Veuillez le téléverser à nouveau." }
      }
      const check = await validateStoredDocument("project-proposal-doc", {
        storageKey: descriptor.storageKey,
        originalName: descriptor.originalName,
        mimeType: typeof descriptor.mimeType === "string" ? descriptor.mimeType : undefined,
      })
      if (!check.valid) {
        return { success: false, error: check.error || "Document non autorisé." }
      }
      uploadedDocument = {
        originalName: descriptor.originalName.slice(0, 255),
        storageKey: descriptor.storageKey,
        mimeType: check.mimeType || "application/octet-stream",
        size: check.size || 0,
      }
    } else if (documentValue) {
      return { success: false, error: "Le document joint est invalide." }
    }

    const recentDuplicate = await prisma.propositionProjet.findFirst({
      where: {
        email: data.email,
        title: data.title,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
      select: { referenceNumber: true },
    })
    if (recentDuplicate) {
      return { success: false, error: "Une proposition identique vient d'être envoyée avec cette adresse e-mail." }
    }

    const referenceNumber = `PROJ-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`
    const proposal = await prisma.propositionProjet.create({
      data: {
        ...data,
        organization: data.organization || null,
        budget: data.budget || null,
        message: data.message || null,
        lang: lang as LanguageCode,
        referenceNumber,
        status: "NOUVEAU",
        document: uploadedDocument ? { create: uploadedDocument } : undefined,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "NOUVEAU",
            changedByName: "APTIC-R — système",
          },
        },
      },
      select: { id: true, referenceNumber: true },
    })

    const notification = [
      `Référence : ${referenceNumber}`,
      `Pays : ${data.country}`,
      `Domaine : ${data.domain}`,
      `Type de collaboration : ${data.collaboration}`,
      `Durée / calendrier : ${data.timeline}`,
      "",
      `Description :\n${data.description}`,
      `Objectifs :\n${data.objectives}`,
      `Public cible :\n${data.targetAudience}`,
      `Résultats attendus :\n${data.expectedResults}`,
      data.budget ? `Budget / financement :\n${data.budget}` : "",
      data.message ? `Message complémentaire :\n${data.message}` : "",
      uploadedDocument ? `Document joint : ${uploadedDocument.originalName}` : "Aucun document joint.",
    ].filter(Boolean).join("\n\n")

    const emailResult = await EmailService.sendContactMessageNotification({
      notificationKey: `project-proposal-submission:${proposal.id}:admin`,
      name: data.proposerName,
      email: data.email,
      organization: data.organization || undefined,
      subject: `Nouvelle proposition de projet — ${data.title} (${referenceNumber})`,
      message: `Titre : ${data.title}\n\n${notification}`,
      routedTo: process.env.MAIL_ADMIN || "aptic.rural19@gmail.com",
      lang,
    })
    if (!emailResult.emailSent) {
      console.error("Project proposal saved but team notification failed:", emailResult.error)
    }

    return { success: true, referenceNumber: proposal.referenceNumber }
  } catch (err: unknown) {
    console.error("submitProjectProposalFormData error:", err)
    const error = formatZodError(err, lang)
    return { success: false, error: error || "Erreur lors de l'envoi de la proposition." }
  }
}

export async function updateProjectProposalStatus(
  proposalId: string,
  inputStatus: string,
  adminMessage = ""
) {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) return { success: false, error: "Action non autorisée." }
    const parsedStatus = projectProposalStatusSchema.safeParse(inputStatus)
    if (!proposalId || !parsedStatus.success) {
      return { success: false, error: "Statut ou proposition invalide." }
    }
    const status = parsedStatus.data
    const safeAdminMessage = adminMessage.trim()
    if (status === "INFORMATIONS_COMPLEMENTAIRES" && (safeAdminMessage.length < 2 || safeAdminMessage.length > 3000)) {
      return { success: false, error: "Veuillez préciser les informations demandées (2 à 3 000 caractères)." }
    }
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.propositionProjet.findUnique({ where: { id: proposalId } })
      if (!current) return { missing: true as const }
      if (current.status === status) {
        return { missing: false as const, unchanged: true as const, fromStatus: current.status }
      }
      const now = new Date()
      const updateResult = await tx.propositionProjet.updateMany({
        where: { id: proposalId, status: current.status },
        data: { status },
      })
      if (updateResult.count === 0) {
        return { missing: false as const, unchanged: true as const }
      }
      const history = await tx.historiquePropositionProjet.create({
        data: {
          proposalId,
          fromStatus: current.status,
          toStatus: status,
          changedById: admin.id,
          changedByName: admin.name,
          createdAt: now,
        },
      })
      return {
        missing: false as const,
        unchanged: false as const,
        previousStatus: current.status,
        history: {
          id: history.id,
          fromStatus: history.fromStatus,
          toStatus: history.toStatus,
          changedByName: history.changedByName,
          createdAt: history.createdAt.toISOString(),
        },
        notification: {
          notificationKey: `project-proposal-status:${history.id}`,
          email: current.email,
          proposerName: current.proposerName,
          title: current.title,
          referenceNumber: current.referenceNumber,
          lang: current.lang as "FR" | "EN" | "DE",
          status,
          adminMessage: safeAdminMessage || undefined,
        },
      }
    })
    if (result.missing) return { success: false, error: "Proposition introuvable." }
    if (result.unchanged) return { success: true, unchanged: true as const }

    const notificationRequired = [
      "INFORMATIONS_COMPLEMENTAIRES",
      "ACCEPTE_COLLABORATION",
      "REFUSE",
    ].includes(status)
    const emailResult = notificationRequired
      ? await EmailService.sendProjectProposalStatusEmail(result.notification)
      : undefined
    revalidatePath("/backoffice/project-proposals")
    return {
      success: true,
      unchanged: false as const,
      history: result.history,
      notificationRequired,
      emailSent: emailResult?.success,
      emailError: emailResult?.error,
      emailLogId: emailResult?.emailLogId,
    }
  } catch (err: unknown) {
    console.error("updateProjectProposalStatus error:", err)
    return { success: false, error: err instanceof Error ? err.message : "Erreur de mise à jour du statut." }
  }
}

export async function addProjectProposalInternalNote(proposalId: string, content: string) {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) return { success: false, error: "Action non autorisée." }
    const parsed = projectProposalInternalNoteSchema.safeParse({ proposalId, content })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Note invalide." }
    }
    const proposalExists = await prisma.propositionProjet.findUnique({
      where: { id: parsed.data.proposalId },
      select: { id: true },
    })
    if (!proposalExists) return { success: false, error: "Proposition introuvable." }

    const note = await prisma.documentPropositionNote.create({
      data: {
        proposalId: parsed.data.proposalId,
        authorId: admin.id,
        authorName: admin.name,
        content: parsed.data.content,
      },
    })
    revalidatePath("/backoffice/project-proposals")
    return {
      success: true,
      note: {
        id: note.id,
        authorName: note.authorName,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
      },
    }
  } catch (err: unknown) {
    console.error("addProjectProposalInternalNote error:", err)
    return { success: false, error: err instanceof Error ? err.message : "Impossible d'enregistrer la note." }
  }
}

export interface UpdateStatusEmailOptions {
  sendEmail?: boolean
  customSubject?: string
  customBody?: string
  interviewDetails?: {
    interviewDate?: string
    interviewTime?: string
    timezone?: string
    interviewMode?: string
    interviewLocation?: string
    interviewLink?: string
    additionalMessage?: string
  }
}

const CANDIDATE_EMAIL_STATUSES = new Set<CandidateStatus>([
  "INTERVIEW",
  "CHOSEN",
  "REJECTED",
])

export async function updateCandidateStatus(
  applicationId: string,
  newStatus: CandidateStatus,
  noteContent?: string,
  emailOptions?: UpdateStatusEmailOptions
): Promise<{
  success: boolean
  error?: string
  emailSent?: boolean
  emailError?: string
}> {
  try {
    const session = await verifySession()
    if (
      !session?.userId ||
      !["SUPERADMIN", "ADMIN", "COORDINATOR", "CONTENT_MANAGER"].includes(session.role)
    ) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    updateStatusSchema.parse({ candidateId: applicationId, newStatus })
    if (
      newStatus === "INTERVIEW" &&
      emailOptions?.sendEmail &&
      (emailOptions.interviewDetails?.additionalMessage?.trim().length || 0) < 2
    ) {
      return { success: false, error: "Les instructions de l’entretien doivent être précisées avant l’envoi." }
    }

    const adminUser = await prisma.utilisateur.findUnique({
      where: { id: session.userId },
      select: { name: true },
    })
    const adminName = adminUser?.name || "Admin APTIC-R"

    let targetAppWithCandidate: any = null
    let previousStatus: CandidateStatus | null = null
    let statusHistoryId: string | null = null
    let statusChanged = false

    await prisma.$transaction(async (tx) => {
      const currentApp = await tx.candidature.findUnique({
        where: { id: applicationId },
        include: { candidate: true },
      })

      if (!currentApp) {
        throw new Error("Candidature introuvable")
      }

      targetAppWithCandidate = currentApp
      previousStatus = currentApp.status

      if (currentApp.status === newStatus) {
        return
      }

      const statusUpdate = await tx.candidature.updateMany({
        where: { id: applicationId, status: currentApp.status },
        data: { status: newStatus as any },
      })
      if (statusUpdate.count === 0) return

      const history = await tx.historiqueCandidature.create({
        data: {
          applicationId,
          fromStatus: currentApp.status,
          toStatus: newStatus as any,
          note: noteContent,
          changedById: session.userId,
          changedByName: adminName,
        },
      })
      statusHistoryId = history.id
      statusChanged = true

      if (noteContent) {
        await tx.noteCandidature.create({
          data: {
            applicationId,
            authorId: session.userId,
            authorName: adminName,
            content: noteContent,
          },
        })
      }
    })

    // 2. Traitement d'envoi d'e-mail optionnel (TOTALEMENT NON-BLOQUANT pour la persistance en base)
    let emailSent = false
    let emailError: string | undefined

    const notificationRequired =
      newStatus === "CHOSEN" ||
      newStatus === "REJECTED" ||
      (newStatus === "INTERVIEW" && Boolean(emailOptions?.sendEmail))

    if (
      notificationRequired &&
      statusChanged &&
      statusHistoryId &&
      targetAppWithCandidate &&
      CANDIDATE_EMAIL_STATUSES.has(newStatus)
    ) {
      try {
        const candidate = targetAppWithCandidate.candidate
        const emailRes = await EmailService.sendCandidateStatusEmail({
          applicationId: targetAppWithCandidate.id,
          notificationKey: `candidate-status:${statusHistoryId}`,
          candidateEmail: candidate.email,
          candidateName: `${candidate.firstName} ${candidate.lastName}`.trim(),
          referenceNumber: targetAppWithCandidate.referenceNumber,
          status: newStatus,
          fromStatus: previousStatus || undefined,
          customSubject: emailOptions?.customSubject,
          customBody: emailOptions?.customBody,
          interviewDetails: emailOptions?.interviewDetails,
          lang: ((targetAppWithCandidate.communicationLanguage || targetAppWithCandidate.lang || "FR") as "FR" | "EN" | "DE"),
        })

        emailSent = emailRes.success
        emailError = emailRes.error
      } catch (err: unknown) {
        emailSent = false
        emailError = err instanceof Error ? err.message : "Erreur d'envoi email"
      }
    }

    return {
      success: true,
      emailSent,
      emailError,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de mise à jour"
    return { success: false, error: message }
  }
}

/**
 * Modifier la langue de communication officielle du candidat depuis le Back-office.
 */
export async function updateCandidateCommunicationLanguage(
  applicationId: string,
  communicationLanguage: "FR" | "EN" | "DE"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }
    await prisma.candidature.update({
      where: { id: applicationId },
      data: { communicationLanguage: communicationLanguage as LanguageCode },
    })
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur de mise à jour" }
  }
}

/**
 * Modifier la langue de communication officielle de la demande de partenariat depuis le Back-office.
 */
export async function updatePartnerRequestCommunicationLanguage(
  requestId: string,
  communicationLanguage: "FR" | "EN" | "DE"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }
    await (prisma as any).demandePartenariat.update({
      where: { id: requestId },
      data: { communicationLanguage: communicationLanguage as LanguageCode },
    })
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur de mise à jour" }
  }
}

/**
 * Réessayer l'envoi d'un email consigné en échec dans le Back-office.
 */
export async function resendCandidateEmailAction(emailLogId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }
    return await EmailService.resendLoggedEmail(emailLogId)
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur lors de la réexpédition" }
  }
}

export async function retryFailedNotificationEmailAction(emailLogId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) return { success: false, error: "Action non autorisée." }
    return EmailService.resendLoggedEmail(emailLogId)
  } catch (error: unknown) {
    console.error("retryFailedNotificationEmailAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Échec de la relance." }
  }
}

/**
 * Consulter les détails d'un email envoyé (pour le modal « Voir l'email »).
 */
export async function getCandidateEmailLogDetails(emailLogId: string) {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }
    const log = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    })
    if (!log) {
      return { success: false, error: "Journal d'email introuvable." }
    }
    return { success: true, data: log }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inattendue" }
  }
}

export async function addCandidateNote(
  applicationId: string,
  content: string,
  author = "Admin APTIC-R",
) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    addNoteSchema.parse({ candidateId: applicationId, content, author })
    
    await prisma.noteCandidature.create({
      data: {
        applicationId,
        content,
        authorName: author
      }
    })
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur d'ajout de note"
    return { success: false, error: message }
  }
}

export async function deleteCandidateNote(noteId: string) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    await prisma.noteCandidature.delete({
      where: { id: noteId }
    })
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de suppression de note"
    return { success: false, error: message }
  }
}

export async function submitCandidateApplicationFormData(
  formData: FormData,
  lang: "FR" | "EN" | "DE" = "FR"
): Promise<
  | { success: true; data: any; error?: undefined }
  | { success: false; error: string; data?: undefined }
> {
  try {
    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`submit-candidature:${ip}`, 10, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return {
        success: false as const,
        error: "Trop de soumissions détectées depuis cette adresse. Veuillez patienter quelques minutes avant de renouveler l'envoi."
      }
    }

    const data: any = { skills: [] }
    const documentsToCreate: any[] = []

    for (const [key, value] of formData.entries()) {
      if (key === "skills") {
        data.skills.push(value)
      } else if (key === "documents") {
        // Téléversement direct vers le stockage : les fichiers sont déjà déposés,
        // on revalide l'objet stocké (taille réelle + octets magiques) avant de le rattacher.
        const descriptors = JSON.parse(String(value))
        if (!Array.isArray(descriptors)) {
          throw new Error("Liste de documents invalide.")
        }
        const allowedTypes = new Set(["CV", "MOTIVATION_LETTER", "PORTFOLIO"])
        for (const descriptor of descriptors) {
          const check = await validateStoredDocument("candidate-doc", descriptor)
          if (!check.valid) {
            return { success: false as const, error: check.error || "Fichier non autorisé" }
          }
          const docType = allowedTypes.has(descriptor?.type) ? descriptor.type : "CV"
          documentsToCreate.push({
            type: docType as "CV" | "MOTIVATION_LETTER" | "PORTFOLIO",
            originalName: descriptor.originalName,
            storageKey: descriptor.storageKey,
            mimeType: check.mimeType || "application/octet-stream",
            size: check.size || 0,
          })
          if (docType === "CV") data.cvFile = descriptor.storageKey
          if (docType === "MOTIVATION_LETTER") data.motivationFile = descriptor.storageKey
          if (docType === "PORTFOLIO") data.portfolioFile = descriptor.storageKey
        }
      } else if (value instanceof File) {
        if (value.size > 0 && value.name !== "undefined") {
          const buffer = Buffer.from(await value.arrayBuffer())
          const fileCheck = validateUploadedFile(value, buffer)
          if (!fileCheck.valid) {
            return { success: false as const, error: fileCheck.error || "Fichier non autorisé" }
          }
          const ext = (value.name.split('.').pop() || "pdf").toLowerCase()
          const filename = `${randomUUID()}.${ext}`
          await files.upload(filename, buffer, { contentType: value.type || "application/octet-stream" })
          
          let docType = "CV"
          if (key === "motivationFile") docType = "MOTIVATION_LETTER"
          if (key === "portfolioFile") docType = "PORTFOLIO"

          documentsToCreate.push({
            type: docType as any,
            originalName: value.name,
            storageKey: filename,
            mimeType: value.type || "application/octet-stream",
            size: value.size
          })
          
          data[key] = filename
        }
      } else {
        data[key] = value === "true" ? true : value === "false" ? false : value
      }
    }

    const result = await submitCandidateApplication(
      data as CandidateApplicationInput,
      lang,
      true,
      documentsToCreate
    )
    
    return result
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Erreur lors de la soumission avec fichiers"
    return { success: false, error: message }
  }
}

export async function getApplicationsCount() {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return 0
    }
    return await prisma.candidature.count()
  } catch {
    return 0
  }
}

export async function getPartnerRequestsCount() {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return 0
    }
    return await (prisma as any).demandePartenariat.count()
  } catch {
    return 0
  }
}

export async function updatePartnerRequestStatus(
  requestId: string,
  newStatus: "NEW" | "REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"
) {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    const transition = await prisma.$transaction(async (tx) => {
      const current = await (tx as any).demandePartenariat.findUnique({
        where: { id: requestId },
      })
      if (!current) return { missing: true as const }
      if (current.status === newStatus) return { missing: false as const, unchanged: true as const }

      const statusUpdate = await (tx as any).demandePartenariat.updateMany({
        where: { id: requestId, status: current.status },
        data: { status: newStatus },
      })
      if (statusUpdate.count === 0) {
        return { missing: false as const, unchanged: true as const }
      }
      const updated = await (tx as any).demandePartenariat.findUnique({
        where: { id: requestId },
        include: { partner: true, documents: true },
      })

      if (newStatus === "APPROVED" && !updated.partnerId) {
        const existingPartner = await (tx as any).partenaire.findFirst({
          where: { orgName: updated.orgName },
        })
        const partner = existingPartner || await (tx as any).partenaire.create({
          data: {
            orgName: updated.orgName,
            country: updated.country,
            website: updated.website,
            orgType: updated.orgType,
          },
        })
        await (tx as any).demandePartenariat.update({
          where: { id: requestId },
          data: { partnerId: partner.id },
        })
      }

      return {
        missing: false as const,
        unchanged: false as const,
        notification: {
          notificationKey: `partner-status:${requestId}:${current.updatedAt.toISOString()}:${newStatus}`,
          email: current.email,
          firstName: current.contactPerson,
          organization: current.orgName,
          referenceNumber: current.referenceNumber || requestId,
          lang: (current.communicationLanguage || current.lang || "FR") as "FR" | "EN" | "DE",
        },
      }
    })

    if (transition.missing) return { success: false, error: "Demande de partenariat introuvable." }
    if (transition.unchanged) return { success: true, unchanged: true }

    if (newStatus === "APPROVED" || newStatus === "REJECTED") {
      const mailResult = await EmailService.sendPartnerDecisionEmail({
        ...transition.notification,
        status: newStatus,
        organization: transition.notification.organization,
      })
      revalidatePath("/backoffice/partners/requests")
      return {
        success: true,
        notificationRequired: true,
        emailSent: mailResult.success,
        emailError: mailResult.error,
        emailLogId: mailResult.emailLogId,
      }
    }

    revalidatePath("/backoffice/partners/requests")
    return { success: true }
  } catch (err: unknown) {
    console.error("updatePartnerRequestStatus error:", err)
    const message = err instanceof Error ? err.message : "Erreur de mise à jour du statut"
    return { success: false, error: message }
  }
}

export async function trackAnalyticsEvent(
  eventName: string,
  data?: {
    lang?: string
    country?: string
    source?: string
    metadata?: Record<string, any>
  }
) {
  try {
    await (prisma as any).evenementStatistique.create({
      data: {
        name: eventName,
        lang: data?.lang || null,
        country: data?.country || null,
        source: data?.source || null,
        metadata: data?.metadata || undefined,
      },
    })
    return { success: true }
  } catch (err) {
    // Non-blocking for UI
    console.error("trackAnalyticsEvent error:", err)
    return { success: false }
  }
}

/**
 * Envoi d'un e-mail direct au candidat depuis le Back-office (action protégée par session admin).
 */
export async function sendCandidateDirectEmail({
  candidateId,
  recipientEmail,
  recipientName,
  subject,
  message,
}: {
  candidateId: string
  recipientEmail: string
  recipientName: string
  subject: string
  message: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    if (!recipientEmail || !subject.trim() || !message.trim()) {
      return { success: false, error: "Destinataire, objet et message sont requis." }
    }

    const { renderAdminDirectEmail } = await import("./email/templates/adminDirectEmail")
    const { getEmailProvider } = await import("./email")

    const emailTemplate = renderAdminDirectEmail({
      candidateName: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      adminName: admin.name,
    })

    const provider = getEmailProvider()
    const sendResult = await provider.sendEmail({
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    })

    if (!sendResult.success) {
      return { success: false, error: sendResult.error || "Échec de l'envoi de l'e-mail." }
    }

    // Enregistrer une note interne traçant l'e-mail envoyé
    await prisma.noteCandidature.create({
      data: {
        applicationId: candidateId,
        content: `E-mail envoyé au candidat : "${subject.trim()}"\n\n${message.trim()}`,
        authorId: admin.id,
        authorName: admin.name,
      },
    })

    return { success: true }
  } catch (err: unknown) {
    console.error("sendCandidateDirectEmail error:", err)
    const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi de l'email"
    return { success: false, error: errorMessage }
  }
}

/**
 * Envoi d'un e-mail direct à une organisation partenaire depuis le Back-office (protégé par session admin).
 */
export async function sendPartnerDirectEmail({
  requestId,
  recipientEmail,
  recipientName,
  subject,
  message,
}: {
  requestId: string
  recipientEmail: string
  recipientName: string
  subject: string
  message: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    if (!recipientEmail || !subject.trim() || !message.trim()) {
      return { success: false, error: "Destinataire, objet et message sont requis." }
    }

    const { renderAdminDirectEmail } = await import("./email/templates/adminDirectEmail")
    const { getEmailProvider } = await import("./email")

    const emailTemplate = renderAdminDirectEmail({
      candidateName: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      adminName: admin.name,
    })

    const provider = getEmailProvider()
    const sendResult = await provider.sendEmail({
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    })

    if (!sendResult.success) {
      return { success: false, error: sendResult.error || "Échec de l'envoi de l'e-mail." }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error("sendPartnerDirectEmail error:", err)
    const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi de l'email"
    return { success: false, error: errorMessage }
  }
}
