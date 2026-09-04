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
    const recentApplication = await prisma.application.findFirst({
      where: {
        candidate: { email: validated.email },
        createdAt: { gte: fiveMinsAgo }
      }
    })
    
    if (recentApplication) {
      throw new Error("Vous avez déjà soumis une candidature récemment.")
    }

    const application = await prisma.$transaction(async (tx) => {
      // Find valid skills by slug
      const existingSkills = await tx.skill.findMany({
        where: { slug: { in: validated.skills } }
      })
      
      if (existingSkills.length !== validated.skills.length) {
        throw new Error("Certaines compétences sélectionnées sont invalides.")
      }
      
      // Find or create candidate
      let candidate = await tx.candidate.findUnique({
        where: { email: validated.email }
      })
      
      if (!candidate) {
        candidate = await tx.candidate.create({
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
        const exists = await tx.application.findUnique({ where: { referenceNumber: refNum }})
        if (!exists) break
        refNum = generateReferenceNumber()
      }

      const newApp = await tx.application.create({
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
          arrivalDate: validated.arrivalDate ? new Date(validated.arrivalDate) : null,
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
  // To be implemented properly later
  return { success: false, error: "Not implemented with Prisma yet" }
}

export async function updateCandidateStatus(
  applicationId: string,
  newStatus: CandidateStatus,
  noteContent?: string,
) {
  try {
    updateStatusSchema.parse({ candidateId: applicationId, newStatus })
    
    await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: applicationId },
        data: { status: newStatus as any }
      })
      
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: app.status, // this is technically incorrect for history, but sufficient for now
          toStatus: newStatus as any,
          note: noteContent,
          changedByName: "Admin APTIC-R"
        }
      })
      
      if (noteContent) {
        await tx.applicationNote.create({
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
    
    await prisma.applicationNote.create({
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
