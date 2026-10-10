"use server"

import prisma from "./prisma"
import { z } from "zod"
import { verifySession } from "./auth"
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

  // Attribution UTM first-touch (facultative, non bloquante)
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
})

export type ContactFormSubmissionInput = z.infer<typeof contactMessageSchema>

/** Resolves the single recipient configured for the contact form (interne uniquement). */
async function getContactFormRecipient(): Promise<string | null> {
  try {
    const settings = await prisma.parametreSite.findMany({
      where: {
        key: "contact_form_recipient",
      },
      select: { key: true, value: true },
    })

    const recipientEmail = settings[0]?.value?.trim()
    return recipientEmail || null
  } catch (error) {
    console.error("Erreur lors de la résolution de l'adresse de routage Contact :", error)
    return null
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
    const recipientEmail = await getContactFormRecipient()
    if (!recipientEmail) {
      return {
        success: false,
        error: "L’adresse de réception du formulaire de contact n’est pas configurée.",
      }
    }

    console.log(
      `📬 [Contact Form] Nouveau message de "${validated.name}" (${validated.email}) - Motif: "${validated.subject}" → Acheminement vers: "${recipientEmail}"`
    )

    // 1. Enregistrement persistant en base de données pour l'historique du back-office
    const contactMessage = await (prisma as any).messageContact.create({
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
          utmSource: validated.utmSource || null,
          utmMedium: validated.utmMedium || null,
          utmCampaign: validated.utmCampaign || null,
          utmContent: validated.utmContent || null,
          utmTerm: validated.utmTerm || null,
        },
      })

    // 2. Envoi de l'e-mail de notification
    const sendResult = await EmailService.sendContactMessageNotification({
      notificationKey: `contact-message:${contactMessage.id}:admin`,
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
    const session = await verifySession()
    if (!session?.userId) {
      return {
        success: false,
        messages: [],
        total: 0,
        unreadCount: 0,
        error: "Authentification requise.",
      }
    }
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
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Authentification requise." }
    }
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
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Authentification requise." }
    }
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
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, total: 0, unread: 0, replied: 0, archived: 0 }
    }
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
