"use server"

import prisma from "./prisma"
import { z } from "zod"
import { EmailService } from "./email"

const contactMessageSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  organization: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(1, "Veuillez choisir un motif"),
  message: z.string().min(10, "Le message doit comporter au moins 10 caractères"),
  consent: z.boolean().refine((val) => val === true, "Le consentement est obligatoire"),
  lang: z
    .string()
    .optional()
    .transform((val) => ((val || "FR").toUpperCase() as "FR" | "EN" | "DE"))
    .refine((val) => ["FR", "EN", "DE"].includes(val), "Langue invalide")
    .default("FR"),
})

export type ContactFormSubmissionInput = z.infer<typeof contactMessageSchema>

/**
 * Résout dynamiquement l'adresse de réception interne en fonction du motif choisi et du CMS Contact.
 *
 * Règles de routage spécialisé :
 *   - VOLONTARIAT → contact_email_volunteer
 *   - PARTENARIAT → contact_email_partnership
 *   - DIRECTION   → contact_email_direction
 *   - GENERAL     → contact_email_general
 *
 * Sécurisation du routage interne (Fallback interne strict) :
 *   Si l'adresse spécialisée est renseignée dans le CMS :
 *     → Envoi direct vers cette adresse spécialisée
 *   Si l'adresse spécialisée est ABSENTE ou non configurée :
 *     → Repli interne automatique et sécurisé vers contact_form_recipient (ou site_contact_email)
 *   (Ce repli interne évite toute perte de message sans jamais exposer de fallback linguistique au visiteur).
 */
export async function getContactRoutingRecipient(subject: string): Promise<string> {
  try {
    const settings = await prisma.parametreSite.findMany({
      where: {
        key: {
          in: [
            "contact_form_recipient",
            "contact_email_general",
            "contact_email_volunteer",
            "contact_email_partnership",
            "contact_email_direction",
            "site_contact_email",
          ],
        },
      },
      select: { key: true, value: true },
    })

    const dict: Record<string, string> = {}
    settings.forEach((s) => {
      if (s.value && s.value.trim().length > 0) {
        dict[s.key] = s.value.trim()
      }
    })

    const subjectUpper = (subject || "").toUpperCase()
    let specializedKey: string | undefined

    if (subjectUpper === "VOLONTARIAT" || subjectUpper.includes("VOLONTAIRE")) {
      specializedKey = "contact_email_volunteer"
    } else if (subjectUpper === "PARTENARIAT" || subjectUpper.includes("PARTENAIRE")) {
      specializedKey = "contact_email_partnership"
    } else if (subjectUpper === "DIRECTION") {
      specializedKey = "contact_email_direction"
    } else if (subjectUpper === "GENERAL") {
      specializedKey = "contact_email_general"
    }

    // 1. Cas où l'adresse spécialisée est configurée dans le CMS
    if (specializedKey && dict[specializedKey]) {
      const specializedEmail = dict[specializedKey]
      console.log(
        `🎯 [Contact Routing] Motif "${subject}" routé vers l'adresse spécialisée "${specializedKey}": ${specializedEmail}`
      )
      return specializedEmail
    }

    // 2. Fallback de routage interne sécurisé (adresse spécialisée absente ou motif non spécifié)
    const fallbackEmail =
      dict["contact_form_recipient"] ||
      dict["site_contact_email"] ||
      process.env.MAIL_ADMIN ||
      "aptic.rural19@gmail.com"

    if (specializedKey) {
      console.log(
        `ℹ️ [Contact Routing] Adresse spécialisée "${specializedKey}" non renseignée pour le motif "${subject}". Repli de routage interne sécurisé vers: ${fallbackEmail}`
      )
    } else {
      console.log(
        `ℹ️ [Contact Routing] Motif standard "${subject}". Routage interne vers: ${fallbackEmail}`
      )
    }

    return fallbackEmail
  } catch (error) {
    console.error("Erreur lors de la résolution de l'adresse de routage Contact :", error)
    return "aptic.rural19@gmail.com"
  }
}

/**
 * Server Action pour soumettre un message depuis la page Contact.
 * Acheline le message à l'adresse interne configurée sans l'exposer publiquement.
 */
export async function submitContactMessageAction(rawInput: ContactFormSubmissionInput): Promise<{
  success: boolean
  error?: string
  routedTo?: string
}> {
  try {
    const validated = contactMessageSchema.parse(rawInput)
    const recipientEmail = await getContactRoutingRecipient(validated.subject)

    console.log(
      `📬 [Contact Form] Nouveau message de "${validated.name}" (${validated.email}) - Motif: "${validated.subject}" → Acheminement vers: "${recipientEmail}"`
    )

    // 1. Enregistrement persistant en base de données pour l'historique du back-office
    try {
      await (prisma as any).messageContact.create({
        data: {
          name: validated.name,
          email: validated.email,
          organization: validated.organization || null,
          phone: validated.phone || null,
          subject: validated.subject,
          message: validated.message,
          routedTo: recipientEmail,
          lang: (validated.lang || "FR") as any,
          status: "UNREAD",
        },
      })
    } catch (dbErr) {
      console.error("⚠️ [Contact Form] Impossible d'enregistrer le message en DB :", dbErr)
    }

    // 2. Envoi de l'e-mail de notification
    const sendResult = await EmailService.sendContactMessageNotification({
      name: validated.name,
      email: validated.email,
      organization: validated.organization,
      phone: validated.phone,
      subject: validated.subject,
      message: validated.message,
      routedTo: recipientEmail,
      lang: validated.lang,
    })

    return {
      success: true,
      routedTo: recipientEmail,
    }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const firstIssue = err.issues[0]
      return { success: false, error: firstIssue?.message || "Erreur de validation du formulaire." }
    }
    console.error("❌ [submitContactMessageAction] Erreur inattendue :", err)
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
    }
  }
}

// ─── ACTIONS BACK-OFFICE : GESTION DES MESSAGES DE CONTACT ────────────────────

export interface ContactMessageRecord {
  id: string
  name: string
  email: string
  organization?: string | null
  phone?: string | null
  subject: string
  message: string
  routedTo?: string | null
  lang: string
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED"
  notes?: string | null
  repliedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export async function getContactMessagesAction(params?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  messages: ContactMessageRecord[]
  total: number
  unreadCount: number
  error?: string
}> {
  try {
    const page = params?.page || 1
    const limit = params?.limit || 50
    const skip = (page - 1) * limit

    const where: any = {}
    if (params?.status && params.status !== "ALL") {
      where.status = params.status
    }

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { organization: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ]
    }

    const [messages, total, unreadCount] = await Promise.all([
      (prisma as any).messageContact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (prisma as any).messageContact.count({ where }),
      (prisma as any).messageContact.count({ where: { status: "UNREAD" } }),
    ])

    return {
      success: true,
      messages: messages as ContactMessageRecord[],
      total,
      unreadCount,
    }
  } catch (err: unknown) {
    console.error("❌ [getContactMessagesAction] Erreur récupération messages :", err)
    return {
      success: false,
      messages: [],
      total: 0,
      unreadCount: 0,
      error: "Erreur lors de la récupération des messages.",
    }
  }
}

export async function updateContactMessageStatusAction(
  id: string,
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED",
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = { status }
    if (notes !== undefined) updateData.notes = notes
    if (status === "REPLIED") updateData.repliedAt = new Date()

    await (prisma as any).messageContact.update({
      where: { id },
      data: updateData,
    })

    return { success: true }
  } catch (err: unknown) {
    console.error("❌ [updateContactMessageStatusAction] Erreur mise à jour :", err)
    return { success: false, error: "Erreur lors de la mise à jour du statut." }
  }
}

export async function deleteContactMessageAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await (prisma as any).messageContact.delete({
      where: { id },
    })

    return { success: true }
  } catch (err: unknown) {
    console.error("❌ [deleteContactMessageAction] Erreur suppression :", err)
    return { success: false, error: "Erreur lors de la suppression du message." }
  }
}

export async function getContactMessagesStatsAction(): Promise<{
  success: boolean
  total: number
  unread: number
  replied: number
  archived: number
}> {
  try {
    const [total, unread, replied, archived] = await Promise.all([
      (prisma as any).messageContact.count(),
      (prisma as any).messageContact.count({ where: { status: "UNREAD" } }),
      (prisma as any).messageContact.count({ where: { status: "REPLIED" } }),
      (prisma as any).messageContact.count({ where: { status: "ARCHIVED" } }),
    ])

    return {
      success: true,
      total,
      unread,
      replied,
      archived,
    }
  } catch (err) {
    console.error("❌ [getContactMessagesStatsAction] Erreur stats :", err)
    return { success: false, total: 0, unread: 0, replied: 0, archived: 0 }
  }
}

