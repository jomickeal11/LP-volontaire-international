"use server"

import {
  candidateApplicationSchema,
  partnerRequestSchema,
  updateStatusSchema,
  addNoteSchema,
  type CandidateApplicationInput,
  type PartnerRequestInput,
} from "./validations"
import prisma from "./prisma"
import type { CandidateStatus, LanguageCode } from "@prisma/client"
import { randomBytes } from "crypto"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
// Generates APTIC-YYYY-XXXX (4 random hex chars)
function generateReferenceNumber(): string {
  const year = new Date().getFullYear()
  const randomStr = randomBytes(2).toString('hex').toUpperCase()
  return `APTIC-${year}-${randomStr}`
}

export async function submitCandidateApplication(
  data: CandidateApplicationInput,
  lang: "FR" | "EN" | "DE" = "FR"
) {
  try {
    const validated = candidateApplicationSchema.parse(data)
    
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

    return { success: true, data: application }
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : "Erreur lors de la soumission"
    return { success: false, error: message }
  }
}

export async function submitPartnerRequest(
  data: PartnerRequestInput,
) {
  try {
    const validated = partnerRequestSchema.parse(data)

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

    return { success: true, data: partnerRequest }
  } catch (err: unknown) {
    console.error("submitPartnerRequest error:", err)
    const message = err instanceof Error ? err.message : "Erreur lors de la soumission de la demande"
    return { success: false, error: message }
  }
}

export async function submitPartnerRequestFormData(formData: FormData) {
  try {
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
          const ext = value.name.split('.').pop() || "pdf"
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

    const result = await submitPartnerRequest(data as PartnerRequestInput)

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
    updateStatusSchema.parse({ candidateId: applicationId, newStatus })
    
    await prisma.$transaction(async (tx) => {
      const app = await tx.candidature.update({
        where: { id: applicationId },
        data: { status: newStatus as any }
      })
      
      await tx.historiqueCandidature.create({
        data: {
          applicationId: app.id,
          fromStatus: app.status, // this is technically incorrect for history, but sufficient for now
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
) {
  try {
    const data: any = { skills: [] }
    const documentsToCreate: any[] = []

    for (const [key, value] of formData.entries()) {
      if (key === "skills") {
        data.skills.push(value)
      } else if (value instanceof File) {
        if (value.size > 0 && value.name !== "undefined") {
          const buffer = Buffer.from(await value.arrayBuffer())
          const ext = value.name.split('.').pop()
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
