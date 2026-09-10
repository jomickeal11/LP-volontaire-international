"use server"

import {
  getCandidateApplicationSchema,
  getPartnerRequestSchema,
  formatZodError,
  candidateApplicationSchema,
  partnerRequestSchema,
  updateStatusSchema,
  addNoteSchema,
  type CandidateApplicationInput,
  type PartnerRequestInput,
} from "./validations"
import prisma from "./prisma"
import { verifySession } from "./auth"
import { verifyMagicBytes, checkRateLimit, getClientIp } from "./security"
import type { CandidateStatus, LanguageCode } from "@prisma/client"
import { randomBytes, randomUUID } from "crypto"
import { writeFile } from "fs/promises"
import { join } from "path"
import { EmailService } from "./email"

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
  lang: "FR" | "EN" | "DE" = "FR"
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
      
      return newApp
    })

    // Envoi des e-mails transactionnels (candidat + alerte équipe APTIC-R)
    // Asynchrone et résilient : ne bloque jamais la réponse
    EmailService.sendCandidateApplicationEmails({
      firstName: application.candidate.firstName,
      lastName: application.candidate.lastName,
      email: application.candidate.email,
      referenceNumber: application.referenceNumber,
      country: application.candidate.country,
      profession: application.profession || undefined,
      skills: application.skills.map((s: any) => s.skill.nameFr || s.skill.nameEn),
      arrivalDate: application.arrivalDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(application.arrivalDate)) : undefined,
      duration: application.duration === "SIX_MONTHS" ? "6 mois" : application.duration === "NINE_MONTHS" ? "9 mois" : "12 mois",
      lang: lang as "FR" | "EN" | "DE",
    }).catch(err => console.error("Email delivery failed for candidate:", err))

    return { success: true as const, data: application }
  } catch (err: unknown) {
    console.error(err)
    const message = formatZodError(err, lang)
    return { success: false as const, error: message }
  }
}

export async function submitPartnerRequest(
  data: PartnerRequestInput,
  lang: "FR" | "EN" | "DE" = "FR"
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
      }
    })

    // Envoi des e-mails transactionnels (partenaire + alerte équipe APTIC-R)
    EmailService.sendPartnerRequestEmails({
      orgName: partnerRequest.orgName,
      contactPerson: partnerRequest.contactPerson,
      email: partnerRequest.email,
      referenceNumber: partnerRequest.referenceNumber || refNum,
      country: partnerRequest.country,
      orgType: partnerRequest.orgType,
    }).catch(err => console.error("Email delivery failed for partner request:", err))

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
          const filepath = join(process.cwd(), "uploads", filename)
          await writeFile(filepath, buffer)

          uploadedFile = {
            originalName: value.name,
            storageKey: filename,
            mimeType: value.type || "application/octet-stream",
            size: value.size,
          }
          data[key] = filename
        }
      } else {
        data[key] = value === "true" ? true : value === "false" ? false : value
      }
    }

    const result = await submitPartnerRequest(data as PartnerRequestInput, lang)

    if (result.success && result.data && uploadedFile) {
      // Create DocumentPartenaire entry linked to the partner request
      await (prisma as any).documentPartenaire.create({
        data: {
          partnerRequestId: result.data.id,
          originalName: uploadedFile.originalName,
          storageKey: uploadedFile.storageKey,
          mimeType: uploadedFile.mimeType,
          size: uploadedFile.size,
        }
      })
    }

    return result
  } catch (err: unknown) {
    console.error("submitPartnerRequestFormData error:", err)
    const message = err instanceof Error ? err.message : "Erreur lors de la soumission du dossier"
    return { success: false, error: message }
  }
}

export async function updateCandidateStatus(
  applicationId: string,
  newStatus: CandidateStatus,
  noteContent?: string,
) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    updateStatusSchema.parse({ candidateId: applicationId, newStatus })
    
    await prisma.$transaction(async (tx) => {
      const currentApp = await tx.candidature.findUnique({
        where: { id: applicationId }
      })
      
      if (!currentApp) {
        throw new Error("Candidature introuvable")
      }
      
      if (currentApp.status === newStatus) {
        return { success: true } // Already at this status
      }

      const app = await tx.candidature.update({
        where: { id: applicationId },
        data: { status: newStatus as any }
      })
      
      await tx.historiqueCandidature.create({
        data: {
          applicationId: app.id,
          fromStatus: currentApp.status,
          toStatus: newStatus as any,
          note: noteContent,
          changedByName: "Admin APTIC-R"
        }
      })
      
      if (noteContent) {
        await tx.noteCandidature.create({
          data: {
            applicationId: app.id,
            authorName: "Admin APTIC-R",
            content: noteContent
          }
        })
      }
    })
    
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de mise à jour"
    return { success: false, error: message }
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
      } else if (value instanceof File) {
        if (value.size > 0 && value.name !== "undefined") {
          const buffer = Buffer.from(await value.arrayBuffer())
          const fileCheck = validateUploadedFile(value, buffer)
          if (!fileCheck.valid) {
            return { success: false as const, error: fileCheck.error || "Fichier non autorisé" }
          }
          const ext = (value.name.split('.').pop() || "pdf").toLowerCase()
          const filename = `${randomUUID()}.${ext}`
          const filepath = join(process.cwd(), "uploads", filename)
          await writeFile(filepath, buffer)
          
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

    const result = await submitCandidateApplication(data as CandidateApplicationInput, lang)
    
    if (result.success && result.data && documentsToCreate.length > 0) {
      // Add documents to the created application
      await prisma.documentCandidature.createMany({
        data: documentsToCreate.map(doc => ({
          ...doc,
          applicationId: result.data.id
        }))
      })
    }
    
    return result
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Erreur lors de la soumission avec fichiers"
    return { success: false, error: message }
  }
}

export async function getApplicationsCount() {
  return await prisma.candidature.count()
}

export async function getPartnerRequestsCount() {
  try {
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
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    const updated = await (prisma as any).demandePartenariat.update({
      where: { id: requestId },
      data: { status: newStatus },
      include: { partner: true, documents: true },
    })

    // If APPROVED, ensure or link to a Partenaire entry in the database
    if (newStatus === "APPROVED" && !updated.partnerId) {
      // Check if partner with same name exists or create one
      const existingPartner = await (prisma as any).partenaire.findFirst({
        where: { orgName: updated.orgName },
      })

      let partner = existingPartner
      if (!partner) {
        partner = await (prisma as any).partenaire.create({
          data: {
            orgName: updated.orgName,
            country: updated.country,
            website: updated.website,
            orgType: updated.orgType,
          },
        })
      }

      await (prisma as any).demandePartenariat.update({
        where: { id: requestId },
        data: { partnerId: partner.id },
      })
    }

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
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    if (!recipientEmail || !subject.trim() || !message.trim()) {
      return { success: false, error: "Destinataire, objet et message sont requis." }
    }

    const { renderAdminDirectEmail } = await import("./email/templates/adminDirectEmail")
    const { getEmailProvider } = await import("./email")

    const adminUser = await prisma.utilisateur.findUnique({
      where: { id: session.userId },
      select: { name: true },
    })
    const adminName = adminUser?.name || "Coordination APTIC-R"

    const emailTemplate = renderAdminDirectEmail({
      candidateName: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      adminName,
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
        content: `✉️ E-mail envoyé au candidat : "${subject.trim()}"\n\n${message.trim()}`,
        authorId: session.userId,
        authorName: adminName,
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
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    if (!recipientEmail || !subject.trim() || !message.trim()) {
      return { success: false, error: "Destinataire, objet et message sont requis." }
    }

    const { renderAdminDirectEmail } = await import("./email/templates/adminDirectEmail")
    const { getEmailProvider } = await import("./email")

    const adminUser = await prisma.utilisateur.findUnique({
      where: { id: session.userId },
      select: { name: true },
    })
    const adminName = adminUser?.name || "Coordination APTIC-R"

    const emailTemplate = renderAdminDirectEmail({
      candidateName: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      adminName,
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


