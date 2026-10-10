"use server"

import prisma from "./prisma"
import {
  memberApplicationSchema,
  newsletterSubscriptionSchema,
  adminNewsletterSubscriberSchema,
  newsletterCampaignSchema,
  newsletterCampaignTestEmailSchema,
  newsletterCampaignLaunchSchema,
  institutionalContactSchema,
  teamMemberCreateSchema,
  teamMemberUpdateSchema,
  teamMemberReorderSchema,
} from "./cms-validations"
import { verifySession } from "./auth"
import { escapeHtml } from "./email/variableEngine"
import { wrapEmailHtml } from "./email/templates/emailTheme"
import { createHash, randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import type { LanguageCode, Prisma } from "@prisma/client"
import type { TeamMemberDTO } from "./cms-types"
import { EmailService } from "./email/emailService"
import { getProjectProposalAdmin } from "./project-proposal-access"
import {
  isNewsletterConsentVerifiable,
  isNewsletterEligibleForCampaign,
  createNewsletterUnsubscribeToken,
  newsletterUnsubscribePath,
  registerNewsletterSubscriber,
  processNewsletterUnsubscribe,
} from "./newsletter-consent"
import {
  buildNewsletterCampaignSendPayload,
  buildNewsletterCampaignTestPayload,
  selectEligibleNewsletterRecipients,
} from "./newsletter-campaign"
import { getSiteUrl } from "./seo"

function safeRevalidatePath(path: string, type?: "page" | "layout") {
  try {
    if (type) {
      revalidatePath(path, type)
    } else {
      revalidatePath(path)
    }
  } catch {
    // Ignore outside Next.js request context
  }
}

function generateApplicationReference(): string {
  const year = new Date().getFullYear()
  const randomStr = randomBytes(2).toString("hex").toUpperCase()
  return `ADH-${year}-${randomStr}`
}

function generateMemberReference(): string {
  const year = new Date().getFullYear()
  const randomStr = randomBytes(2).toString("hex").toUpperCase()
  return `MBR-${year}-${randomStr}`
}

// ─── GARDE D'AUTORISATION ────────────────────────────────────────────────────
// Toutes les actions de mutation du back-office vérifient la session côté
// serveur. Le middleware ne suffit pas : une Server Action peut être invoquée
// depuis n'importe quel chemin public avec un identifiant d'action connu.
const UNAUTHORIZED_ACTION = "Action non autorisée : connexion administrateur requise."

async function isAdminSession(): Promise<boolean> {
  const session = await verifySession()
  return Boolean(
    session?.userId &&
    ["SUPERADMIN", "ADMIN", "COORDINATOR", "CONTENT_MANAGER"].includes(session.role)
  )
}

// Identifiants non fiables côté client : on vérifie toujours l'existence
// d'un album en base avant d'associer un média.
async function albumExists(id: string): Promise<boolean> {
  const found = await (prisma as any).album.findUnique({
    where: { id },
    select: { id: true },
  })
  return Boolean(found)
}

// ─── 1. MEMBRES (Demande d'adhésion & Répertoire) ─────────────────────────────

export async function submitMemberApplication(
  formData: unknown,
  lang: "FR" | "EN" | "DE" = "FR"
) {
  try {
    const parsed = memberApplicationSchema.safeParse(formData)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Données de formulaire invalides",
      }
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      profession,
      organization,
      country,
      city,
      domainsOfInterest,
      contributionType,
      availability,
      motivation,
      consentData,
    } = parsed.data

    const cleanEmail = email.toLowerCase().trim()

    // Vérifier si une demande en attente existe déjà pour cet email
    const existingPending = await prisma.demandeAdhesion.findFirst({
      where: {
        email: cleanEmail,
        status: "PENDING",
      },
    })

    if (existingPending) {
      return {
        success: false,
        error: `Une demande d'adhésion (${existingPending.referenceNumber}) est déjà en cours d'examen pour cette adresse email.`,
      }
    }

    // Vérifier si la personne est déjà membre actif
    const existingMember = await prisma.membre.findFirst({
      where: { email: cleanEmail },
    })

    if (existingMember && existingMember.membershipStatus === "ACTIVE") {
      return {
        success: false,
        error: `Vous êtes déjà membre officiel d'APTIC-R (Référence : ${existingMember.referenceNumber}).`,
      }
    }

    const referenceNumber = generateApplicationReference()

    const application = await prisma.demandeAdhesion.create({
      data: {
        referenceNumber,
        lang: lang as LanguageCode,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        profession: profession?.trim() || null,
        organization: organization?.trim() || null,
        country,
        city: city?.trim() || null,
        domainsOfInterest: JSON.stringify(domainsOfInterest),
        contributionType,
        availability,
        motivation: motivation.trim(),
        consentData,
        status: "PENDING",
        history: {
          create: {
            action: "APPLICATION_SUBMITTED",
            toStatus: "PENDING",
            authorName: `${firstName.trim()} ${lastName.trim()} (Demandeur)`,
            note: "Soumission en ligne du formulaire d'adhésion.",
          },
        },
      },
    })

    await EmailService.sendAdminSubmissionNotification({
      notificationKey: `membership-submission:${application.id}:admin`,
      formName: "MEMBERSHIP_APPLICATION",
      subject: `Nouvelle demande d’adhésion — ${application.referenceNumber}`,
      details: [
        `Référence : ${application.referenceNumber}`,
        `Nom : ${application.firstName} ${application.lastName}`,
        `E-mail : ${application.email}`,
        `Pays : ${application.country}`,
      ].join("\n"),
      lang,
      replyTo: application.email,
      recipientName: `${application.firstName} ${application.lastName}`,
    })

    return {
      success: true,
      referenceNumber: application.referenceNumber,
      message: "Votre demande d'adhésion a été enregistrée avec succès. Elle sera examinée prochainement par l'équipe APTIC-R.",
    }
  } catch (error) {
    console.error("Error submitting member application:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de l'enregistrement de votre demande.",
    }
  }
}

// ─── 2. NEWSLETTER ────────────────────────────────────────────────────────────

export async function subscribeNewsletter(formData: unknown) {
  try {
    const parsed = newsletterSubscriptionSchema.safeParse(formData)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Adresse email invalide",
      }
    }

    const { lang } = parsed.data
    const now = new Date()
    const registration = await prisma.$transaction((tx) =>
      registerNewsletterSubscriber(
        {
          findByEmail: (email) => tx.newsletterAbonne.findUnique({ where: { email } }),
          createSubscriber: (data) => tx.newsletterAbonne.create({ data }),
          reactivateSubscriber: (id, data) => tx.newsletterAbonne.update({ where: { id }, data }),
          addUnsubscribeToken: async (subscriberId, tokenHash) => {
            await tx.newsletterUnsubscribeToken.create({ data: { subscriberId, tokenHash } })
          },
        },
        parsed.data,
        "PUBLIC_FORM",
        now,
      ),
    )

    if (!registration.success) return registration
    if (registration.alreadySubscribed) {
      return {
        success: true,
        alreadySubscribed: true,
        message: "Cette adresse est déjà inscrite à la newsletter APTIC-R.",
      }
    }

    await EmailService.sendAdminSubmissionNotification({
      notificationKey: `newsletter-subscription:${registration.subscriberId}:${now.toISOString()}:admin`,
      formName: "NEWSLETTER_SUBSCRIPTION",
      subject: "Nouvelle inscription à la lettre d’information APTIC-R",
      details: "Une inscription à la newsletter a été enregistrée.",
      lang,
    })

    return {
      success: true,
      alreadySubscribed: false,
      unsubscribePath: registration.unsubscribePath,
      message: "Merci pour votre inscription à la lettre d'information APTIC-R !",
    }
  } catch (error) {
    console.error("Error subscribing newsletter:", error)
    return {
      success: false,
      error: "Une erreur est survenue lors de votre inscription.",
    }
  }
}

// ─── 4. PROJETS ───────────────────────────────────────────────────────────────

export async function getNewsletterCampaigns() {
  try {
    if (!(await isAdminSession())) return []
    const campaigns = await prisma.newsletterCampagne.findMany({ orderBy: { updatedAt: "desc" } })
    if (!campaigns.length) return []
    const grouped = await prisma.newsletterCampagneDestinataire.groupBy({
      by: ["campaignId", "status"],
      where: { campaignId: { in: campaigns.map((campaign) => campaign.id) } },
      _count: { _all: true },
    })
    const counts = new Map<string, Record<string, number>>()
    for (const row of grouped) {
      const rowCounts = counts.get(row.campaignId) || {}
      rowCounts[row.status] = row._count._all
      counts.set(row.campaignId, rowCounts)
    }
    return campaigns.map((campaign) => ({
      ...campaign,
      deliveryCounts: {
        sent: counts.get(campaign.id)?.SENT || 0,
        failed: counts.get(campaign.id)?.FAILED || 0,
        pending: counts.get(campaign.id)?.PENDING || 0,
        sending: counts.get(campaign.id)?.SENDING || 0,
      },
    }))
  } catch (error) {
    console.error("Error fetching newsletter campaigns:", error)
    return []
  }
}

export async function saveNewsletterCampaign(input: unknown) {
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    const parsed = newsletterCampaignSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données de campagne invalides." }
    }

    const { id, ...data } = parsed.data
    const campaign = id
      ? await prisma.newsletterCampagne.updateMany({ where: { id, status: "DRAFT" }, data })
          .then(async (result) => result.count ? prisma.newsletterCampagne.findUnique({ where: { id } }) : null)
      : await prisma.newsletterCampagne.create({ data: { ...data, status: "DRAFT" } })
    if (!campaign) return { success: false, error: "Brouillon introuvable ou non modifiable." }

    revalidatePath("/backoffice/newsletter/campaigns")
    return { success: true, campaign }
  } catch (error) {
    console.error("Error saving newsletter campaign:", error)
    return { success: false, error: "Impossible d’enregistrer le brouillon." }
  }
}

export async function deleteNewsletterCampaign(id: unknown) {
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    if (typeof id !== "string" || !id.trim()) return { success: false, error: "Campagne invalide." }
    const result = await prisma.newsletterCampagne.deleteMany({ where: { id, status: "DRAFT" } })
    if (!result.count) return { success: false, error: "Seuls les brouillons peuvent être supprimés." }
    revalidatePath("/backoffice/newsletter/campaigns")
    return { success: true }
  } catch (error) {
    console.error("Error deleting newsletter campaign:", error)
    return { success: false, error: "Impossible de supprimer ce brouillon." }
  }
}

export async function sendNewsletterCampaignTestEmail(input: unknown) {
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    const parsed = newsletterCampaignTestEmailSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Adresse de test invalide." }
    }
    const campaign = await prisma.newsletterCampagne.findUnique({ where: { id: parsed.data.campaignId } })
    if (!campaign || campaign.status !== "DRAFT") return { success: false, error: "Brouillon introuvable." }

    const testPayload = buildNewsletterCampaignTestPayload(campaign, campaign.lang)
    const contentField = `content${campaign.lang[0]}${campaign.lang.slice(1).toLowerCase()}` as "contentFr" | "contentEn" | "contentDe"
    if (!testPayload.subject.replace(/^\[TEST\]\s*/, "").trim() || !campaign[contentField].trim()) {
      return { success: false, error: "Renseignez le sujet et le contenu dans la langue choisie avant le test." }
    }

    const result = await EmailService.sendTrackedEmail({
      notificationKey: `newsletter-campaign-test:${campaign.id}:${parsed.data.recipient.toLowerCase()}:${randomBytes(16).toString("hex")}`,
      actionType: "NEWSLETTER_CAMPAIGN_TEST",
      templateKey: "NEWSLETTER_CAMPAIGN_TEST",
      metadata: { campaignId: campaign.id, lang: campaign.lang },
      payload: {
        to: parsed.data.recipient,
        subject: testPayload.subject,
        html: wrapEmailHtml(testPayload.htmlContent, campaign.lang),
        text: testPayload.text,
      },
    })
    if (!result.success) return { success: false, error: result.error || "Le fournisseur email a refusé le test." }

    await prisma.newsletterCampagne.update({ where: { id: campaign.id }, data: { lastTestSentAt: new Date() } })
    revalidatePath("/backoffice/newsletter/campaigns")
    return { success: true, message: "Email de test envoyé à l’adresse indiquée." }
  } catch (error) {
    console.error("Error sending newsletter campaign test:", error)
    return { success: false, error: "Impossible d’envoyer l’email de test." }
  }
}

const NEWSLETTER_DELIVERY_BATCH_SIZE = 3
const STALE_NEWSLETTER_DELIVERY_MS = 15 * 60 * 1000

async function newsletterCampaignCounts(campaignId: string) {
  const [sentCount, failedCount, pendingCount, sendingCount] = await Promise.all([
    prisma.newsletterCampagneDestinataire.count({ where: { campaignId, status: "SENT" } }),
    prisma.newsletterCampagneDestinataire.count({ where: { campaignId, status: "FAILED" } }),
    prisma.newsletterCampagneDestinataire.count({ where: { campaignId, status: "PENDING" } }),
    prisma.newsletterCampagneDestinataire.count({ where: { campaignId, status: "SENDING" } }),
  ])
  return { sentCount, failedCount, pendingCount, sendingCount }
}

async function reconcileStaleNewsletterDeliveries(campaignId: string) {
  const cutoff = new Date(Date.now() - STALE_NEWSLETTER_DELIVERY_MS)
  const stale = await prisma.newsletterCampagneDestinataire.findMany({
    where: { campaignId, status: "SENDING", lastAttemptAt: { lt: cutoff } },
    select: { id: true, emailLogId: true },
    take: 50,
  })

  for (const delivery of stale) {
    const log = delivery.emailLogId
      ? await prisma.emailLog.findUnique({ where: { id: delivery.emailLogId }, select: { status: true, sentAt: true } })
      : null

    if (!log) {
      await prisma.newsletterCampagneDestinataire.updateMany({
        where: { id: delivery.id, status: "SENDING" },
        data: { status: "PENDING", error: null },
      })
    } else if (log.status === "SENT") {
      await prisma.newsletterCampagneDestinataire.updateMany({
        where: { id: delivery.id, status: "SENDING" },
        data: { status: "SENT", sentAt: log.sentAt, error: null },
      })
    } else {
      // Never resend an ambiguous provider attempt automatically.
      await prisma.newsletterCampagneDestinataire.updateMany({
        where: { id: delivery.id, status: "SENDING" },
        data: { status: "FAILED", error: "DELIVERY_RESULT_UNKNOWN" },
      })
    }
  }
}

async function processNewsletterCampaignBatchInternal(campaignId: string) {
  const campaign = await prisma.newsletterCampagne.findUnique({ where: { id: campaignId } })
  if (!campaign || campaign.status !== "SENDING") {
    return { success: false as const, error: "Cette campagne n’est pas en cours d’envoi." }
  }

  await reconcileStaleNewsletterDeliveries(campaignId)
  const pending = await prisma.newsletterCampagneDestinataire.findMany({
    where: { campaignId, status: "PENDING", subscriberId: { not: null } },
    orderBy: { createdAt: "asc" },
    take: NEWSLETTER_DELIVERY_BATCH_SIZE,
  })

  for (const delivery of pending) {
    const claimed = await prisma.newsletterCampagneDestinataire.updateMany({
      where: { id: delivery.id, status: "PENDING" },
      data: { status: "SENDING", attempts: { increment: 1 }, lastAttemptAt: new Date(), error: null },
    })
    if (!claimed.count || !delivery.subscriberId) continue

    const subscriber = await prisma.newsletterAbonne.findUnique({ where: { id: delivery.subscriberId } })
    if (!subscriber || !isNewsletterEligibleForCampaign(subscriber)) {
      await prisma.newsletterCampagneDestinataire.update({
        where: { id: delivery.id },
        data: { status: "FAILED", error: "SUBSCRIBER_NOT_ELIGIBLE" },
      })
      continue
    }

    const lang = subscriber.lang
    const localized = buildNewsletterCampaignSendPayload(campaign, lang, "")
    if (!localized.subject.trim() || !localized.text.trim()) {
      await prisma.newsletterCampagneDestinataire.update({
        where: { id: delivery.id },
        data: { status: "FAILED", error: `MISSING_CONTENT_${lang}` },
      })
      continue
    }

    const { token, tokenHash } = createNewsletterUnsubscribeToken()
    await prisma.newsletterUnsubscribeToken.create({ data: { subscriberId: subscriber.id, tokenHash } })
    const unsubscribeUrl = new URL(newsletterUnsubscribePath(lang, token), getSiteUrl()).toString()
    const actualPayload = buildNewsletterCampaignSendPayload(campaign, lang, unsubscribeUrl)
    const notificationKey = `newsletter-campaign:${campaign.id}:${delivery.id}`
    const emailLogId = `notification_${createHash("sha256").update(notificationKey).digest("hex")}`
    await prisma.newsletterCampagneDestinataire.update({ where: { id: delivery.id }, data: { emailLogId } })

    const result = await EmailService.sendTrackedEmail({
      notificationKey,
      actionType: "NEWSLETTER_CAMPAIGN",
      templateKey: "NEWSLETTER_CAMPAIGN",
      metadata: { campaignId: campaign.id, deliveryId: delivery.id, lang },
      redactValues: [token, unsubscribeUrl],
      payload: {
        to: subscriber.email,
        subject: actualPayload.subject,
        html: wrapEmailHtml(actualPayload.htmlContent, lang),
        text: actualPayload.text,
      },
      // The raw unsubscribe token remains only in the outbound message, not in EmailLog.
      logPayload: {
        to: subscriber.email,
        subject: actualPayload.subject,
        html: wrapEmailHtml(localized.logHtmlContent, lang),
        text: localized.logText,
      },
    })

    await prisma.newsletterCampagneDestinataire.update({
      where: { id: delivery.id },
      data: result.success
        ? { status: "SENT", sentAt: new Date(), error: null }
        : { status: "FAILED", error: "PROVIDER_REJECTED" },
    })
  }

  const counts = await newsletterCampaignCounts(campaignId)
  const complete = counts.pendingCount === 0 && counts.sendingCount === 0
  const campaignStatus = complete
    ? counts.failedCount > 0 ? "COMPLETED_WITH_ERRORS" : "SENT"
    : "SENDING"

  await prisma.newsletterCampagne.updateMany({
    where: { id: campaignId, status: "SENDING" },
    data: {
      sentCount: counts.sentCount,
      failedCount: counts.failedCount,
      ...(complete ? { status: campaignStatus, completedAt: new Date() } : {}),
    },
  })

  return { success: true as const, complete, stalled: counts.sendingCount > 0, status: campaignStatus, ...counts }
}

export async function launchNewsletterCampaign(input: unknown) {
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    const parsed = newsletterCampaignLaunchSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: "Campagne invalide." }

    const campaign = await prisma.newsletterCampagne.findUnique({ where: { id: parsed.data.campaignId } })
    if (!campaign || campaign.status !== "DRAFT") {
      return { success: false, error: "Seul un brouillon peut être lancé; cet envoi ne peut pas être relancé." }
    }

    const candidates = await prisma.newsletterAbonne.findMany({
      where: {
        active: true,
        consent: true,
        consentAt: { not: null },
        consentSource: { not: null },
        consentVersion: { not: null },
      },
      select: { id: true, email: true, lang: true, firstName: true, active: true, consent: true, consentAt: true, consentSource: true, consentVersion: true },
    })
    const eligible = selectEligibleNewsletterRecipients(candidates)
    if (eligible.length === 0) return { success: false, error: "Aucun abonné actif avec consentement vérifiable." }

    const missingLanguages = [...new Set(eligible.map((subscriber) => subscriber.lang))].filter((lang) => {
      const content = buildNewsletterCampaignSendPayload(campaign, lang, "")
      return !content.subject.trim() || !content.text.trim()
    })
    if (missingLanguages.length) {
      return { success: false, error: `Sujet ou contenu manquant pour : ${missingLanguages.join(", ")}.` }
    }

    const startedAt = new Date()
    const launched = await prisma.$transaction(async (tx) => {
      const claimed = await tx.newsletterCampagne.updateMany({
        where: { id: campaign.id, status: "DRAFT" },
        data: { status: "SENDING", startedAt, completedAt: null, totalRecipients: eligible.length, sentCount: 0, failedCount: 0 },
      })
      if (!claimed.count) return false
      await tx.newsletterCampagneDestinataire.createMany({
        data: eligible.map((subscriber) => ({ campaignId: campaign.id, subscriberId: subscriber.id, lang: subscriber.lang, status: "PENDING" })),
      })
      return true
    })
    if (!launched) return { success: false, error: "Cette campagne a déjà été lancée." }

    revalidatePath("/backoffice/newsletter/campaigns")
    return await processNewsletterCampaignBatchInternal(campaign.id)
  } catch (error) {
    console.error("Error launching newsletter campaign.", error instanceof Error ? error.name : "unknown")
    return { success: false, error: "Le lancement de la campagne a échoué." }
  }
}

export async function processNewsletterCampaignBatch(campaignId: unknown) {
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    if (typeof campaignId !== "string" || !campaignId.trim()) return { success: false, error: "Campagne invalide." }
    const result = await processNewsletterCampaignBatchInternal(campaignId)
    revalidatePath("/backoffice/newsletter/campaigns")
    return result
  } catch (error) {
    console.error("Error processing newsletter campaign batch.", error instanceof Error ? error.name : "unknown")
    return { success: false, error: "Le traitement du lot a échoué. Consultez les statuts avant toute reprise." }
  }
}

/**
 * Validation linguistique stricte pour la publication d'un projet :
 * - Le projet doit être explicitement marqué comme publié dans la langue cible (publishedFr / publishedEn / publishedDe)
 * - Le titre et le résumé/description doivent être renseignés dans la langue cible
 * - Si le projet est rattaché à un domaine, ce domaine doit également être disponible et traduit dans la langue cible
 */
function isProjectPublishedForLang(p: any, lang: string): boolean {
  if (!p) return false
  const l = (lang || "FR").toUpperCase()

  if (l === "EN") {
    if (!p.publishedEn) return false
    if (!p.titleEn || !p.titleEn.trim()) return false
    if (!((p.summaryEn && p.summaryEn.trim()) || (p.descriptionEn && p.descriptionEn.trim()))) return false
    if (p.domaine && (!p.domaine.nameEn || !p.domaine.nameEn.trim())) return false
    return true
  }

  if (l === "DE") {
    if (!p.publishedDe) return false
    if (!p.titleDe || !p.titleDe.trim()) return false
    if (!((p.summaryDe && p.summaryDe.trim()) || (p.descriptionDe && p.descriptionDe.trim()))) return false
    if (p.domaine && (!p.domaine.nameDe || !p.domaine.nameDe.trim())) return false
    return true
  }

  // Défaut : FR
  if (p.publishedFr === false) return false
  if (!p.titleFr || !p.titleFr.trim()) return false
  if (!((p.summaryFr && p.summaryFr.trim()) || (p.descriptionFr && p.descriptionFr.trim()))) return false
  if (p.domaine && (!p.domaine.nameFr || !p.domaine.nameFr.trim())) return false
  return true
}

export async function getProjects(options?: {
  domaineSlug?: string
  status?: string
  featuredOnly?: boolean
  limit?: number
  lang?: string
}) {
  try {
    const where: any = {}

    if (options?.status && options.status !== "ALL") {
      where.status = options.status
    }
    if (options?.featuredOnly) {
      where.isFeatured = true
    }
    if (options?.domaineSlug) {
      where.domaine = { slug: options.domaineSlug }
    }

    const lang = options?.lang ? options.lang.toUpperCase() : null
    if (lang === "EN") {
      where.publishedEn = true
    } else if (lang === "DE") {
      where.publishedDe = true
    } else if (lang === "FR") {
      where.publishedFr = true
    }

    const projects = await prisma.projet.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: options?.limit,
      include: {
        domaine: {
          select: {
            id: true,
            slug: true,
            code: true,
            nameFr: true,
            nameEn: true,
            nameDe: true,
            icon: true,
            color: true,
          },
        },
        ressources: {
          where: { published: true },
        },
        medias: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (lang) {
      return projects.filter((p) => isProjectPublishedForLang(p, lang))
    }

    return projects
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

/** Version allégée pour les menus déroulants Admin (id + titre FR uniquement). */
export async function getProjectsForSelect(): Promise<{ id: string; titleFr: string; slug: string }[]> {
  try {
    const projects = await prisma.projet.findMany({
      select: { id: true, titleFr: true, slug: true },
      orderBy: { titleFr: "asc" },
    })
    return projects
  } catch {
    return []
  }
}

export async function getProjectBySlug(slug: string, lang?: string) {
  try {
    const project = await prisma.projet.findUnique({
      where: { slug },
      include: {
        domaine: true,
        ressources: {
          where: { published: true },
          orderBy: { year: "desc" },
        },
        medias: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!project) return null

    // Stricte étanchéité multilingue si lang est spécifié
    if (lang && !isProjectPublishedForLang(project, lang)) {
      return null
    }

    return project
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error)
    return null
  }
}

// ─── 5. ARTICLES & ACTUALITÉS ─────────────────────────────────────────────────

export async function getArticles(options?: {
  categorySlug?: string
  publishedOnly?: boolean
  lang?: string
  limit?: number
  skip?: number
}) {
  try {
    const where: any = {}
    const lang = options?.lang?.toUpperCase()
    if (options?.publishedOnly !== false) {
      if (lang === "EN" || lang === "DE" || lang === "FR") {
        where[`published${lang[0]}${lang.slice(1).toLowerCase()}`] = true
      } else {
        where.published = true
      }
    }
    if (options?.categorySlug) {
      where.category = { slug: options.categorySlug }
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: options?.limit,
      skip: options?.skip,
      include: { category: true },
    })

    if (!options?.publishedOnly || !lang) return articles

    return articles.filter((article: any) => {
      const localizedFields =
        lang === "EN"
          ? [article.titleEn, article.excerptEn, article.contentEn]
          : lang === "DE"
            ? [article.titleDe, article.excerptDe, article.contentDe]
            : [article.titleFr, article.excerptFr, article.contentFr]
      return localizedFields.every((field) => Boolean(field?.trim()))
    })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return []
  }
}
export async function getArticleBySlug(slug: string, lang: string, options?: { incrementViews?: boolean }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: { name: true, role: true },
        },
      },
    })

    if (!article) return null

    const language = lang.toUpperCase()
    const localizedFields =
      language === "EN"
        ? [article.titleEn, article.excerptEn, article.contentEn]
        : language === "DE"
          ? [article.titleDe, article.excerptDe, article.contentDe]
          : [article.titleFr, article.excerptFr, article.contentFr]
    if (localizedFields.some((field) => !field?.trim())) return null
    const publishedKey = `published${language[0]}${language.slice(1).toLowerCase()}`
    if (!(article as any)[publishedKey]) return null
    if (article && options?.incrementViews !== false) {
      // Incrémentation asynchrone non-bloquante des vues
      prisma.article.update({
        where: { id: article.id },
        data: { viewsCount: { increment: 1 } },
      }).catch(err => console.error("Error incrementing views:", err))
    }

    return article
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error)
    return null
  }
}

export async function getArticleCategories() {
  try {
    let cats = await prisma.categorieArticle.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            articles: {
              where: { published: true },
            },
          },
        },
      },
    })

    if (cats.length === 0) {
      // Auto-initialisation des catégories par défaut
      const defaultCategories = [
        { slug: "inclusion-numerique", nameFr: "Inclusion Numérique", nameEn: "Digital Inclusion", nameDe: "Digitale Inklusion", order: 1 },
        { slug: "volontariat-international", nameFr: "Volontariat International", nameEn: "International Volunteering", nameDe: "Internationaler Freiwilligendienst", order: 2 },
        { slug: "partenariats-impact", nameFr: "Partenariats & Impact", nameEn: "Partnerships & Impact", nameDe: "Partnerschaften & Wirkung", order: 3 },
        { slug: "evenements-communaute", nameFr: "Événements & Communauté", nameEn: "Events & Community", nameDe: "Veranstaltungen & Gemeinschaft", order: 4 },
        { slug: "projets-de-terrain", nameFr: "Projets de Terrain", nameEn: "Field Projects", nameDe: "Feldprojekte", order: 5 },
      ]

      for (const item of defaultCategories) {
        await prisma.categorieArticle.upsert({
          where: { slug: item.slug },
          create: item,
          update: {},
        })
      }

      cats = await prisma.categorieArticle.findMany({
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: {
              articles: {
                where: { published: true },
              },
            },
          },
        },
      })
    }

    return cats
  } catch (error) {
    console.error("Error fetching article categories:", error)
    return []
  }
}

export async function createArticleCategory(nameFr: string, nameEn?: string, nameDe?: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const trimmed = nameFr.trim()
    if (!trimmed) {
      return { success: false, error: "Le nom de la catégorie est obligatoire." }
    }
    const slug = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cat-" + Date.now()

    let existing = await prisma.categorieArticle.findFirst({
      where: {
        OR: [
          { slug },
          { nameFr: { equals: trimmed, mode: "insensitive" } },
        ],
      },
    })

    if (existing) {
      return { success: true, category: existing }
    }

    const maxOrderCat = await prisma.categorieArticle.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })
    const nextOrder = (maxOrderCat?.order ?? 0) + 1

    const newCat = await prisma.categorieArticle.create({
      data: {
        slug,
        nameFr: trimmed,
        nameEn: nameEn?.trim() || trimmed,
        nameDe: nameDe?.trim() || trimmed,
        order: nextOrder,
      },
    })

    return { success: true, category: newCat }
  } catch (error: any) {
    console.error("Error creating article category:", error)
    return { success: false, error: error.message || "Erreur lors de la création de la catégorie" }
  }
}

// ─── 6. ÉVÉNEMENTS ────────────────────────────────────────────────────────────

export async function getEvents(options?: {
  upcomingOnly?: boolean
  category?: string
  limit?: number
  lang?: string
}) {
  try {
    const where: any = {}
    const isPublicQuery = Boolean(options?.lang)

    if (isPublicQuery) {
      // Publication globale : l'événement doit être publié dans au moins une langue.
      where.published = true
    }

    if (options?.upcomingOnly) {
      where.startDate = { gte: new Date() }
    }
    if (options?.category) {
      where.category = options.category
    }
    if (isPublicQuery) {
      const l = (options!.lang! || "FR").toUpperCase()
      const publishedKey =
        l === "EN" ? "publishedEn" : l === "DE" ? "publishedDe" : "publishedFr"
      const titleKey = l === "EN" ? "titleEn" : l === "DE" ? "titleDe" : "titleFr"
      const descKey = l === "EN" ? "descriptionEn" : l === "DE" ? "descriptionDe" : "descriptionFr"
      // Pré-filtrage SQL : publication explicite + titre/description non vides.
      // `not: ""` exclut à la fois les valeurs vides et les NULL en SQL.
      where[publishedKey] = true
      where.AND = [{ [titleKey]: { not: "" } }, { [descKey]: { not: "" } }]
    }

    return await prisma.evenement.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: options?.limit,
      // Projection limitée aux colonnes réellement consommées (vue publique,
      // back-office, sitemap). Évite de transporter le reste de la ligne.
      select: {
        id: true,
        slug: true,
        titleFr: true,
        titleEn: true,
        titleDe: true,
        descriptionFr: true,
        descriptionEn: true,
        descriptionDe: true,
        programmeFr: true,
        programmeEn: true,
        programmeDe: true,
        category: true,
        categoryOther: true,
        location: true,
        startDate: true,
        endDate: true,
        isOnline: true,
        meetingUrl: true,
        registrationUrl: true,
        registrationOpen: true,
        maxParticipants: true,
        featuredImage: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        published: true,
        publishedFr: true,
        publishedEn: true,
        publishedDe: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

// ─── 7. RESSOURCES DOCUMENTAIRES ──────────────────────────────────────────────

export async function getResources(options?: {
  type?: string
  domaineSlug?: string
  year?: number
  limit?: number
}) {
  try {
    const where: any = { published: true }

    if (options?.type) {
      where.type = options.type
    }
    if (options?.year) {
      where.year = options.year
    }
    if (options?.domaineSlug) {
      where.domaine = { slug: options.domaineSlug }
    }

    return await prisma.ressource.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: options?.limit,
      include: {
        domaine: true,
      },
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return []
  }
}

function normalizeSearchValue(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function localizedTextForRecord<T extends Record<string, any>>(record: T, lang: string, keys: string[]): string {
  const languageKey = (lang || "FR").toUpperCase()
  const match = languageKey === "EN"
    ? keys[1]
    : languageKey === "DE"
      ? keys[2]
      : keys[0]

  return String(record?.[match] ?? "")
}

function matchesQuery(value: string | null | undefined, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true
  return normalizeSearchValue(value).includes(normalizedQuery)
}

export type SearchPublicContentResult = {
  articles: Array<{
    id: string
    title: string
    description: string
    url: string
    category: string
    date?: string | null
  }>
  projects: Array<{
    id: string
    title: string
    description: string
    url: string
    category: string
    date?: string | null
  }>
  resources: Array<{
    id: string
    title: string
    description: string
    url: string
    category: string
    date?: string | null
  }>
  total: number
  query: string
  error?: string
}

export async function searchPublicContent({
  lang,
  query,
}: {
  lang?: string
  query?: string | string[]
}): Promise<SearchPublicContentResult> {
  const normalizedLang = ((lang || "FR").toUpperCase() as "FR" | "EN" | "DE")
  const rawQuery = Array.isArray(query) ? query[0] ?? "" : query ?? ""
  const trimmedQuery = rawQuery.trim()

  if (!trimmedQuery) {
    return { articles: [], projects: [], resources: [], total: 0, query: "" }
  }

  if (trimmedQuery.length > 80) {
    return {
      articles: [],
      projects: [],
      resources: [],
      total: 0,
      query: trimmedQuery,
      error: "SEARCH_QUERY_TOO_LONG",
    }
  }

  const normalizedQuery = normalizeSearchValue(trimmedQuery)

  try {
    const [articles, projects, resources] = await Promise.all([
      getArticles({ publishedOnly: true, lang: normalizedLang }),
      getProjects({ lang: normalizedLang }),
      getResources({}),
    ])

    const filteredArticles = articles.filter((article: any) => {
      const content = [
        localizedTextForRecord(article, normalizedLang, ["titleFr", "titleEn", "titleDe"]),
        localizedTextForRecord(article, normalizedLang, ["excerptFr", "excerptEn", "excerptDe"]),
        localizedTextForRecord(article, normalizedLang, ["contentFr", "contentEn", "contentDe"]),
      ].join(" ")
      return matchesQuery(content, normalizedQuery)
    }).map((article: any) => ({
      id: article.id,
      title: localizedTextForRecord(article, normalizedLang, ["titleFr", "titleEn", "titleDe"]),
      description: localizedTextForRecord(article, normalizedLang, ["excerptFr", "excerptEn", "excerptDe"]) || "",
      url: `/${normalizedLang.toLowerCase()}/actualites/${article.slug}`,
      category: article.category?.nameFr || article.category?.nameEn || article.category?.nameDe || "Article",
      date: article.publishedAt ? new Date(article.publishedAt).toISOString() : null,
    }))

    const filteredProjects = projects.filter((project: any) => {
      const content = [
        localizedTextForRecord(project, normalizedLang, ["titleFr", "titleEn", "titleDe"]),
        localizedTextForRecord(project, normalizedLang, ["summaryFr", "summaryEn", "summaryDe"]),
        localizedTextForRecord(project, normalizedLang, ["descriptionFr", "descriptionEn", "descriptionDe"]),
      ].join(" ")
      return matchesQuery(content, normalizedQuery)
    }).map((project: any) => ({
      id: project.id,
      title: localizedTextForRecord(project, normalizedLang, ["titleFr", "titleEn", "titleDe"]),
      description: localizedTextForRecord(project, normalizedLang, ["summaryFr", "summaryEn", "summaryDe"]) || "",
      url: `/${normalizedLang.toLowerCase()}/projets/${project.slug}`,
      category: project.domaine?.nameFr || project.domaine?.nameEn || project.domaine?.nameDe || "Projet",
      date: project.createdAt ? new Date(project.createdAt).toISOString() : null,
    }))

    const filteredResources = resources.filter((resource: any) => {
      const content = [
        localizedTextForRecord(resource, normalizedLang, ["titleFr", "titleEn", "titleDe"]),
        localizedTextForRecord(resource, normalizedLang, ["descriptionFr", "descriptionEn", "descriptionDe"]),
        resource.type,
      ].join(" ")
      return matchesQuery(content, normalizedQuery)
    }).map((resource: any) => ({
      id: resource.id,
      title: localizedTextForRecord(resource, normalizedLang, ["titleFr", "titleEn", "titleDe"]),
      description: localizedTextForRecord(resource, normalizedLang, ["descriptionFr", "descriptionEn", "descriptionDe"]) || resource.type || "",
      url: resource.fileUrl || `/${normalizedLang.toLowerCase()}/ressources`,
      category: resource.type || "Resource",
      date: resource.createdAt ? new Date(resource.createdAt).toISOString() : null,
    }))

    const results = {
      articles: filteredArticles,
      projects: filteredProjects,
      resources: filteredResources,
      total: filteredArticles.length + filteredProjects.length + filteredResources.length,
      query: trimmedQuery,
    }

    return results
  } catch (error) {
    console.error("Error searching public content:", error)
    return {
      articles: [],
      projects: [],
      resources: [],
      total: 0,
      query: trimmedQuery,
      error: "SEARCH_FAILED",
    }
  }
}

// ─── 8. ALBUMS ───────────────────────────────────────────────────────────────

export async function getPublishedAlbums() {
  try {
    return await (prisma as any).album.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })
  } catch (error) {
    console.error("Error fetching published albums:", error)
    return []
  }
}

export async function getAllAlbums() {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION, items: [] }
    }
    const items = await (prisma as any).album.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { medias: true } },
      },
    })
    return { success: true, items }
  } catch (error: any) {
    console.error("Error fetching all albums:", error)
    return { success: false, error: error.message || "Erreur lors de la récupération des albums.", items: [] }
  }
}

export async function getAlbumById(id: string) {
  try {
    return await (prisma as any).album.findUnique({
      where: { id },
      include: {
        medias: {
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        },
        _count: { select: { medias: true } },
      },
    })
  } catch (error) {
    console.error("Error fetching album by id:", error)
    return null
  }
}

export async function createAlbum(data: {
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  coverImage?: string | null
  published?: boolean
  order?: number
}) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!data.titleFr?.trim()) {
      return { success: false, error: "Le titre (FR) est requis." }
    }
    if (!data.slug?.trim()) {
      return { success: false, error: "Le slug est requis." }
    }
    if (data.titleFr.trim().length > 200) {
      return { success: false, error: "Le titre (FR) ne doit pas dépasser 200 caractères." }
    }
    if ((data.titleEn?.trim().length ?? 0) > 200 || (data.titleDe?.trim().length ?? 0) > 200) {
      return { success: false, error: "Les titres traduits ne doivent pas dépasser 200 caractères." }
    }
    if ((data.descriptionFr?.length ?? 0) > 3000 || (data.descriptionEn?.length ?? 0) > 3000 || (data.descriptionDe?.length ?? 0) > 3000) {
      return { success: false, error: "Les descriptions ne doivent pas dépasser 3000 caractères." }
    }
    if (data.slug.trim().length > 120) {
      return { success: false, error: "Le slug ne doit pas dépasser 120 caractères." }
    }

    const existing = await (prisma as any).album.findUnique({ where: { slug: data.slug.trim() } })
    if (existing) {
      return { success: false, error: "Ce slug est déjà utilisé par un autre album." }
    }

    const album = await (prisma as any).album.create({
      data: {
        slug: data.slug.trim(),
        titleFr: data.titleFr.trim(),
        titleEn: data.titleEn?.trim() || null,
        titleDe: data.titleDe?.trim() || null,
        descriptionFr: data.descriptionFr?.trim() || null,
        descriptionEn: data.descriptionEn?.trim() || null,
        descriptionDe: data.descriptionDe?.trim() || null,
        coverImage: data.coverImage?.trim() || null,
        published: data.published ?? true,
        order: data.order ?? 0,
      },
    })

    safeRevalidatePath("/backoffice/albums")
    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true, album, message: "Album créé." }
  } catch (error: any) {
    console.error("Error creating album:", error)
    return { success: false, error: error.message || "Erreur lors de la création de l'album." }
  }
}

export async function updateAlbum(id: string, data: {
  slug?: string
  titleFr?: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  coverImage?: string | null
  published?: boolean
  order?: number
}) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (data.titleFr !== undefined && !data.titleFr.trim()) {
      return { success: false, error: "Le titre (FR) est requis." }
    }
    if (data.titleFr !== undefined && data.titleFr.trim().length > 200) {
      return { success: false, error: "Le titre (FR) ne doit pas dépasser 200 caractères." }
    }
    if ((data.titleEn?.trim().length ?? 0) > 200 || (data.titleDe?.trim().length ?? 0) > 200) {
      return { success: false, error: "Les titres traduits ne doivent pas dépasser 200 caractères." }
    }
    if ((data.descriptionFr?.length ?? 0) > 3000 || (data.descriptionEn?.length ?? 0) > 3000 || (data.descriptionDe?.length ?? 0) > 3000) {
      return { success: false, error: "Les descriptions ne doivent pas dépasser 3000 caractères." }
    }
    if (data.slug !== undefined) {
      if (!data.slug.trim()) {
        return { success: false, error: "Le slug est requis." }
      }
      if (data.slug.trim().length > 120) {
        return { success: false, error: "Le slug ne doit pas dépasser 120 caractères." }
      }
      const existing = await (prisma as any).album.findFirst({
        where: { slug: data.slug.trim(), NOT: { id } },
      })
      if (existing) {
        return { success: false, error: "Ce slug est déjà utilisé par un autre album." }
      }
    }

    const updateData: any = {}
    if (data.slug !== undefined) updateData.slug = data.slug.trim()
    if (data.titleFr !== undefined) updateData.titleFr = data.titleFr.trim()
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn?.trim() || null
    if (data.titleDe !== undefined) updateData.titleDe = data.titleDe?.trim() || null
    if (data.descriptionFr !== undefined) updateData.descriptionFr = data.descriptionFr?.trim() || null
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn?.trim() || null
    if (data.descriptionDe !== undefined) updateData.descriptionDe = data.descriptionDe?.trim() || null
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage?.trim() || null
    if (data.published !== undefined) updateData.published = Boolean(data.published)
    if (data.order !== undefined) updateData.order = Number(data.order)

    const album = await (prisma as any).album.update({ where: { id }, data: updateData })

    safeRevalidatePath("/backoffice/albums")
    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true, album, message: "Album mis à jour." }
  } catch (error: any) {
    console.error("Error updating album:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour de l'album." }
  }
}

export async function deleteAlbum(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    // Unlink medias before deleting album
    await (prisma as any).media.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    })
    await (prisma as any).album.delete({ where: { id } })

    safeRevalidatePath("/backoffice/albums")
    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true, message: "Album supprimé." }
  } catch (error: any) {
    console.error("Error deleting album:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression de l'album." }
  }
}

export async function linkMediaToAlbum(mediaId: string, albumId: string | null) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!mediaId) {
      return { success: false, error: "Média introuvable." }
    }
    const media = await (prisma as any).media.findUnique({ where: { id: mediaId }, select: { id: true } })
    if (!media) {
      return { success: false, error: "Média introuvable." }
    }
    if (albumId && !(await albumExists(albumId))) {
      return { success: false, error: "Album introuvable." }
    }
    await (prisma as any).media.update({
      where: { id: mediaId },
      data: { albumId: albumId || null },
    })
    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/backoffice/albums")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true }
  } catch (error: any) {
    console.error("Error linking media to album:", error)
    return { success: false, error: error.message || "Erreur lors de la liaison." }
  }
}

// ─── 9. GALERIE MÉDIAS ────────────────────────────────────────────────────────

export async function getMedia(options?: {
  album?: string
  category?: string
  featuredOnly?: boolean
  limit?: number
}) {
  try {
    const where: any = {}

    if (options?.album) {
      where.album = options.album
    }
    if (options?.category) {
      where.category = options.category
    }
    if (options?.featuredOnly) {
      where.featured = true
    }

    return await (prisma as any).media.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: options?.limit,
    })
  } catch (error) {
    console.error("Error fetching media:", error)
    return []
  }
}

export async function getAllMedias() {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION, items: [] }
    }
    const items = await (prisma as any).media.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    })
    return { success: true, items }
  } catch (error: any) {
    console.error("Error fetching all medias:", error)
    return { success: false, error: error.message || "Erreur lors de la récupération des médias." }
  }
}

export async function createMedia(data: any) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!data.titleFr?.trim()) {
      return { success: false, error: "Le titre (FR) est requis." }
    }
    if (!data.url?.trim()) {
      return { success: false, error: "L'URL du média est requise." }
    }

    // Validation stricte du type selon ce qui est reçu du serveur (PHOTO ou VIDEO)
    // Le contrôle réel se fera via Zod et dans le front, mais on bloque ici aussi.
    const allowedTypes = ["PHOTO", "VIDEO"]
    const type = allowedTypes.includes(data.type) ? data.type : "PHOTO"

    if (data.albumId && !(await albumExists(data.albumId))) {
      return { success: false, error: "Album introuvable." }
    }

    const urlLower = data.url.toLowerCase()
    if (type === "PHOTO") {
       if (urlLower.endsWith(".mp4") || urlLower.endsWith(".webm") || urlLower.endsWith(".mov")) {
          return { success: false, error: "Cohérence invalide : l'URL fournie correspond à une vidéo, mais le type sélectionné est PHOTO." }
       }
    } else if (type === "VIDEO") {
       if (urlLower.endsWith(".jpg") || urlLower.endsWith(".jpeg") || urlLower.endsWith(".png") || urlLower.endsWith(".webp") || urlLower.endsWith(".avif")) {
          return { success: false, error: "Cohérence invalide : l'URL fournie correspond à une image, mais le type sélectionné est VIDEO." }
       }
    }

    const media = await (prisma as any).media.create({
      data: {
        titleFr: data.titleFr.trim(),
        titleEn: data.titleEn?.trim() || null,
        titleDe: data.titleDe?.trim() || null,
        captionFr: data.captionFr?.trim() || null,
        captionEn: data.captionEn?.trim() || null,
        captionDe: data.captionDe?.trim() || null,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl || null,
        type,
        album: data.album || null,
        albumId: data.albumId || null,
        category: data.category || null,
        featured: data.featured || false,
        order: data.order !== undefined ? Number(data.order) : 0,
        projetId: data.projetId || null,
      },
    })
    
    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true, media, message: "Média créé." }
  } catch (error: any) {
    console.error("Error creating media:", error)
    return { success: false, error: error.message || "Erreur lors de la création du média." }
  }
}

export async function updateMedia(id: string, data: any) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const updateData: any = {}
    if (data.titleFr !== undefined) updateData.titleFr = data.titleFr.trim()
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn?.trim() || null
    if (data.titleDe !== undefined) updateData.titleDe = data.titleDe?.trim() || null
    if (data.captionFr !== undefined) updateData.captionFr = data.captionFr?.trim() || null
    if (data.captionEn !== undefined) updateData.captionEn = data.captionEn?.trim() || null
    if (data.captionDe !== undefined) updateData.captionDe = data.captionDe?.trim() || null
    if (data.url !== undefined) updateData.url = data.url
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl
    
    if (data.type !== undefined) {
       const allowedTypes = ["PHOTO", "VIDEO"]
       updateData.type = allowedTypes.includes(data.type) ? data.type : "PHOTO"
    }

    const typeToCheck = updateData.type || data.type
    const urlToCheck = updateData.url || data.url
    if (typeToCheck && urlToCheck) {
       const urlLower = urlToCheck.toLowerCase()
       if (typeToCheck === "PHOTO") {
          if (urlLower.endsWith(".mp4") || urlLower.endsWith(".webm") || urlLower.endsWith(".mov")) {
             return { success: false, error: "Cohérence invalide : l'URL fournie correspond à une vidéo, mais le type sélectionné est PHOTO." }
          }
       } else if (typeToCheck === "VIDEO") {
          if (urlLower.endsWith(".jpg") || urlLower.endsWith(".jpeg") || urlLower.endsWith(".png") || urlLower.endsWith(".webp") || urlLower.endsWith(".avif")) {
             return { success: false, error: "Cohérence invalide : l'URL fournie correspond à une image, mais le type sélectionné est VIDEO." }
          }
       }
    }

    if (data.albumId !== undefined) {
      if (data.albumId && !(await albumExists(data.albumId))) {
        return { success: false, error: "Album introuvable." }
      }
      updateData.albumId = data.albumId || null
    }
    if (data.album !== undefined) updateData.album = data.album || null
    if (data.category !== undefined) updateData.category = data.category || null
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured)
    if (data.order !== undefined) updateData.order = Number(data.order)
    if (data.projetId !== undefined) updateData.projetId = data.projetId || null

    const media = await (prisma as any).media.update({
      where: { id },
      data: updateData,
    })

    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true, media, message: "Média mis à jour." }
  } catch (error: any) {
    console.error("Error updating media:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteMedia(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    await (prisma as any).media.delete({
      where: { id },
    })

    safeRevalidatePath("/backoffice/medias")
    safeRevalidatePath("/[lang]/galerie")
    return { success: true, message: "Média supprimé." }
  } catch (error: any) {
    console.error("Error deleting media:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}


// ─── 10. TÉMOIGNAGES ─────────────────────────────────────────────────────────

export async function getTestimonials(options?: {
  authorType?: string
  featuredOnly?: boolean
  limit?: number
}) {
  try {
    const where: any = {}

    if (options?.authorType) {
      where.authorType = options.authorType
    }
    if (options?.featuredOnly !== false) {
      where.featured = true
    }

    return await prisma.temoignage.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: options?.limit,
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}

// ─── 11. ADMIN : DEMANDES D'ADHÉSION & RÉPERTOIRE DES MEMBRES ───────────────

export async function getMemberApplications(options?: {
  status?: string
  search?: string
  country?: string
  limit?: number
  skip?: number
}) {
  try {
    if (!(await isAdminSession())) {
      return {
        applications: [],
        counts: { total: 0, pending: 0, approved: 0, rejected: 0 },
      }
    }
    const where: any = {}

    if (options?.status && options.status !== "ALL") {
      where.status = options.status
    }

    if (options?.country && options.country !== "ALL") {
      where.country = options.country
    }

    if (options?.search) {
      const q = options.search.trim()
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { referenceNumber: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { organization: { contains: q, mode: "insensitive" } },
      ]
    }

    const [applications, total, pending, approved, rejected] = await Promise.all([
      prisma.demandeAdhesion.findMany({
        where,
        include: {
          member: true,
          history: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.skip,
      }),
      prisma.demandeAdhesion.count(),
      prisma.demandeAdhesion.count({ where: { status: "PENDING" } }),
      prisma.demandeAdhesion.count({ where: { status: "APPROVED" } }),
      prisma.demandeAdhesion.count({ where: { status: "REJECTED" } }),
    ])

    return {
      applications,
      counts: {
        total,
        pending,
        approved,
        rejected,
      },
    }
  } catch (error) {
    console.error("Error fetching member applications:", error)
    return {
      applications: [],
      counts: { total: 0, pending: 0, approved: 0, rejected: 0 },
    }
  }
}

export async function approveMemberApplication(
  applicationId: string,
  adminName: string = "Admin APTIC-R",
  adminNote?: string
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const application = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
      include: { member: true },
    })

    if (!application) {
      return { success: false, error: "Demande d'adhésion introuvable." }
    }

    // ── Idempotence : Ne pas créer de doublon si déjà validée ──
    if (application.status === "APPROVED" && application.memberId && application.member) {
      return {
        success: true,
        member: application.member,
        message: "Cette demande est déjà validée et le membre existe déjà.",
      }
    }

    const cleanEmail = application.email.toLowerCase().trim()

    // Vérifier si un membre ACTIF existe déjà avec cet email
    let member = await prisma.membre.findFirst({
      where: { email: cleanEmail, membershipStatus: "ACTIVE" },
    })

    if (member) {
      // Mettre à jour les informations du membre actif existant
      member = await prisma.membre.update({
        where: { id: member.id },
        data: {
          membershipDate: member.membershipDate || new Date(),
          notes: adminNote ? `${member.notes ? member.notes + "\n" : ""}[${new Date().toLocaleDateString("fr-FR")}] ${adminNote}` : member.notes,
        },
      })
    } else {
      // Créer un nouveau membre officiel avec sa référence MBR-YYYY-XXXX unique (ne réutilise jamais un ancien matricule annulé)
      const memberRef = generateMemberReference()
      member = await prisma.membre.create({
        data: {
          referenceNumber: memberRef,
          firstName: application.firstName,
          lastName: application.lastName,
          email: cleanEmail,
          phone: application.phone,
          profession: application.profession,
          organization: application.organization,
          country: application.country,
          city: application.city,
          domainsOfInterest: application.domainsOfInterest,
          contributionType: application.contributionType,
          availability: application.availability,
          motivation: application.motivation,
          membershipStatus: "ACTIVE",
          membershipDate: new Date(),
          notes: adminNote || null,
        },
      })
    }

    // Mettre à jour la demande en APPROVED avec le lien memberId
    const updatedApplication = await prisma.demandeAdhesion.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        memberId: member.id,
        notes: adminNote ? adminNote : application.notes,
      },
    })

    // Enregistrer les entrées d'audit trail dans HistoriqueAdhesion (chronologique : APPROVED puis ACTIVATED)
    const approvedAt = new Date()
    await prisma.historiqueAdhesion.create({
      data: {
        applicationId: application.id,
        memberId: member.id,
        action: "APPLICATION_APPROVED",
        fromStatus: application.status,
        toStatus: "APPROVED",
        authorName: adminName,
        note: adminNote?.trim() || "Validation initiale",
        createdAt: approvedAt,
      },
    })

    await prisma.historiqueAdhesion.create({
      data: {
        applicationId: application.id,
        memberId: member.id,
        action: "MEMBER_ACTIVATED",
        fromStatus: null,
        toStatus: "ACTIVE",
        authorName: adminName,
        note: `Membre créé : ${member.referenceNumber}`,
        createdAt: new Date(approvedAt.getTime() + 100),
      },
    })

    const notification = await EmailService.sendMembershipDecisionEmail({
      notificationKey: `membership-decision:${application.id}:${application.updatedAt.toISOString()}:APPROVED`,
      email: application.email,
      firstName: application.firstName,
      referenceNumber: application.referenceNumber,
      memberReference: member.referenceNumber,
      status: "APPROVED",
      lang: application.lang,
    })
    if (!notification.success) {
      console.error("Membership approval notification failed:", notification.error)
    }

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      member,
      application: updatedApplication,
      notificationSent: notification.success,
      notificationError: notification.error,
      notificationEmailLogId: notification.emailLogId,
      message: `Demande validée avec succès. Membre officiel ${member.referenceNumber} créé et actif.`,
    }
  } catch (error: any) {
    console.error("Error approving member application:", error)
    return { success: false, error: error.message || "Impossible de valider la demande." }
  }
}

export async function rejectMemberApplication(
  applicationId: string,
  adminName: string = "Admin APTIC-R",
  adminNote?: string
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const application = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { success: false, error: "Demande d'adhésion introuvable." }
    }
    if (application.status === "REJECTED") {
      return { success: true, application, message: "Cette demande a déjà été refusée." }
    }

    const noteText = adminNote?.trim() || "Demande d'adhésion refusée."

    const updated = await prisma.demandeAdhesion.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        notes: noteText,
      },
    })

    await prisma.historiqueAdhesion.create({
      data: {
        applicationId: application.id,
        action: "APPLICATION_REJECTED",
        fromStatus: application.status,
        toStatus: "REJECTED",
        authorName: adminName,
        note: noteText,
      },
    })

    const notification = await EmailService.sendMembershipDecisionEmail({
      notificationKey: `membership-decision:${application.id}:${application.updatedAt.toISOString()}:REJECTED`,
      email: application.email,
      firstName: application.firstName,
      referenceNumber: application.referenceNumber,
      status: "REJECTED",
      lang: application.lang,
    })
    if (!notification.success) {
      console.error("Membership rejection notification failed:", notification.error)
    }

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      application: updated,
      notificationSent: notification.success,
      notificationError: notification.error,
      notificationEmailLogId: notification.emailLogId,
      message: "La demande d'adhésion a été refusée et reste consignée dans l'historique.",
    }
  } catch (error: any) {
    console.error("Error rejecting member application:", error)
    return { success: false, error: error.message || "Impossible de refuser la demande." }
  }
}

export async function resetMemberApplicationToPending(
  applicationId: string,
  adminName: string = "Admin APTIC-R",
  reason: string
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!reason || !reason.trim()) {
      return { success: false, error: "Le motif du retour en attente est obligatoire." }
    }

    const application = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
      include: { member: true },
    })

    if (!application) {
      return { success: false, error: "Demande d'adhésion introuvable." }
    }

    const previousMemberId = application.memberId
    const previousMemberRef = application.member?.referenceNumber

    // Si un membre avait été créé, on le neutralise à CANCELLED (sort du répertoire actif, matricule jamais réutilisé)
    if (previousMemberId) {
      await prisma.membre.update({
        where: { id: previousMemberId },
        data: {
          membershipStatus: "CANCELLED",
          notes: `${application.member?.notes ? application.member.notes + "\n" : ""}[${new Date().toLocaleDateString("fr-FR")}] Adhésion annulée / retour en attente par ${adminName} : ${reason.trim()}`,
        },
      })
    }

    // On remet la demande à PENDING et on dissocie memberId = null
    const updatedApplication = await prisma.demandeAdhesion.update({
      where: { id: applicationId },
      data: {
        status: "PENDING",
        memberId: null,
        notes: `[Retour en attente le ${new Date().toLocaleDateString("fr-FR")} par ${adminName}] ${reason.trim()}`,
      },
    })

    const historyNote = previousMemberRef
      ? `Retour en attente d'examen.\nMotif : ${reason.trim()}\n\nAncien membre : ${previousMemberRef}\nMatricule neutralisé après remise en attente.`
      : `Retour en attente d'examen.\nMotif : ${reason.trim()}`

    // On trace l'audit trail complet
    await prisma.historiqueAdhesion.create({
      data: {
        applicationId: application.id,
        memberId: previousMemberId,
        action: "APPLICATION_RESET_TO_PENDING",
        fromStatus: application.status,
        toStatus: "PENDING",
        authorName: adminName,
        note: historyNote,
      },
    })

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      application: updatedApplication,
      message: "La demande a été remise en attente et le membre a été retiré du répertoire actif.",
    }
  } catch (error: any) {
    console.error("Error resetting member application:", error)
    return { success: false, error: error.message || "Impossible de remettre la demande en attente." }
  }
}

export async function revokeMembership(
  applicationId: string,
  adminName: string = "Admin APTIC-R",
  reason: string
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!reason || !reason.trim()) {
      return { success: false, error: "Le motif officiel de la révocation est obligatoire." }
    }

    const application = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
      include: { member: true },
    })

    if (!application) {
      return { success: false, error: "Demande d'adhésion introuvable." }
    }

    // Si un membre est lié, passer son statut à REVOKED (sorti du répertoire actif)
    if (application.memberId) {
      await prisma.membre.update({
        where: { id: application.memberId },
        data: {
          membershipStatus: "REVOKED",
          notes: `${application.member?.notes ? application.member.notes + "\n" : ""}[${new Date().toLocaleDateString("fr-FR")}] Adhésion révoquée par ${adminName} : ${reason.trim()}`,
        },
      })
    }

    // Passer la demande à REJECTED pour refléter l'état final du dossier
    const updatedApplication = await prisma.demandeAdhesion.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        notes: `[Adhésion révoquée le ${new Date().toLocaleDateString("fr-FR")} par ${adminName}] ${reason.trim()}`,
      },
    })

    // Tracer la révocation dans HistoriqueAdhesion
    await prisma.historiqueAdhesion.create({
      data: {
        applicationId: application.id,
        memberId: application.memberId,
        action: "MEMBERSHIP_REVOKED",
        fromStatus: application.status,
        toStatus: "REJECTED",
        authorName: adminName,
        note: `Adhésion révoquée. Motif officiel : ${reason.trim()}`,
      },
    })

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      application: updatedApplication,
      message: "L'adhésion a été révoquée et le membre a été retiré du répertoire actif.",
    }
  } catch (error: any) {
    console.error("Error revoking membership:", error)
    return { success: false, error: error.message || "Impossible de révoquer l'adhésion." }
  }
}

export async function revokeMembershipDirect(
  memberId: string,
  adminName: string = "Admin APTIC-R",
  reason: string
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!reason || !reason.trim()) {
      return { success: false, error: "Le motif officiel de la révocation est obligatoire." }
    }

    const member = await prisma.membre.findUnique({
      where: { id: memberId },
      include: { applications: true },
    })

    if (!member) {
      return { success: false, error: "Membre introuvable." }
    }

    await prisma.membre.update({
      where: { id: memberId },
      data: {
        membershipStatus: "REVOKED",
        notes: `${member.notes ? member.notes + "\n" : ""}[${new Date().toLocaleDateString("fr-FR")}] Adhésion révoquée par ${adminName} : ${reason.trim()}`,
      },
    })

    let linkedAppId: string | null = null
    if (member.applications && member.applications.length > 0) {
      const app = member.applications[0]
      linkedAppId = app.id
      await prisma.demandeAdhesion.update({
        where: { id: app.id },
        data: {
          status: "REJECTED",
          notes: `[Adhésion révoquée le ${new Date().toLocaleDateString("fr-FR")} par ${adminName}] ${reason.trim()}`,
        },
      })
    }

    await prisma.historiqueAdhesion.create({
      data: {
        memberId,
        applicationId: linkedAppId,
        action: "MEMBERSHIP_REVOKED",
        fromStatus: member.membershipStatus,
        toStatus: "REVOKED",
        authorName: adminName,
        note: `Adhésion révoquée depuis le répertoire des membres. Motif : ${reason.trim()}`,
      },
    })

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      message: `L'adhésion de ${member.firstName} ${member.lastName} (${member.referenceNumber}) a été révoquée.`,
    }
  } catch (error: any) {
    console.error("Error revoking membership directly:", error)
    return { success: false, error: error.message || "Impossible de révoquer l'adhésion." }
  }
}

export async function updateMemberDetails(
  memberId: string,
  data: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string | null
    profession?: string | null
    organization?: string | null
    country?: string
    city?: string | null
    domainsOfInterest?: string[] | string
    contributionType?: string
    availability?: string
    motivation?: string
  },
  adminName: string = "Admin APTIC-R"
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const existing = await prisma.membre.findUnique({
      where: { id: memberId },
    })

    if (!existing) {
      return { success: false, error: "Membre introuvable." }
    }

    const domainsJson = Array.isArray(data.domainsOfInterest)
      ? JSON.stringify(data.domainsOfInterest)
      : typeof data.domainsOfInterest === "string"
      ? data.domainsOfInterest
      : existing.domainsOfInterest

    const updated = await prisma.membre.update({
      where: { id: memberId },
      data: {
        firstName: data.firstName !== undefined ? data.firstName.trim() : existing.firstName,
        lastName: data.lastName !== undefined ? data.lastName.trim() : existing.lastName,
        email: data.email !== undefined ? data.email.toLowerCase().trim() : existing.email,
        phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : existing.phone,
        profession: data.profession !== undefined ? (data.profession ? data.profession.trim() : null) : existing.profession,
        organization: data.organization !== undefined ? (data.organization ? data.organization.trim() : null) : existing.organization,
        country: data.country !== undefined ? data.country : existing.country,
        city: data.city !== undefined ? (data.city ? data.city.trim() : null) : existing.city,
        domainsOfInterest: domainsJson,
        contributionType: data.contributionType !== undefined ? data.contributionType : existing.contributionType,
        availability: data.availability !== undefined ? data.availability : existing.availability,
        motivation: data.motivation !== undefined ? data.motivation.trim() : existing.motivation,
      },
    })

    await prisma.historiqueAdhesion.create({
      data: {
        memberId,
        action: "MEMBER_UPDATED",
        fromStatus: existing.membershipStatus,
        toStatus: existing.membershipStatus,
        authorName: adminName,
        note: "Mise à jour des coordonnées / informations de la fiche membre.",
      },
    })

    safeRevalidatePath("/backoffice/members")

    return {
      success: true,
      member: updated,
      message: "Fiche membre mise à jour avec succès.",
    }
  } catch (error: any) {
    console.error("Error updating member details:", error)
    return { success: false, error: error.message || "Impossible de mettre à jour le membre." }
  }
}

export async function updateMemberApplicationData(
  applicationId: string,
  data: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string | null
    profession?: string | null
    organization?: string | null
    country?: string
    city?: string | null
    contributionType?: string
    availability?: string
    motivation?: string
  },
  adminName: string = "Admin APTIC-R"
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const existing = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
      include: { member: true },
    })

    if (!existing) {
      return { success: false, error: "Demande d'adhésion introuvable." }
    }

    const updated = await prisma.demandeAdhesion.update({
      where: { id: applicationId },
      data: {
        firstName: data.firstName !== undefined ? data.firstName.trim() : existing.firstName,
        lastName: data.lastName !== undefined ? data.lastName.trim() : existing.lastName,
        email: data.email !== undefined ? data.email.toLowerCase().trim() : existing.email,
        phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : existing.phone,
        profession: data.profession !== undefined ? (data.profession ? data.profession.trim() : null) : existing.profession,
        organization: data.organization !== undefined ? (data.organization ? data.organization.trim() : null) : existing.organization,
        country: data.country !== undefined ? data.country : existing.country,
        city: data.city !== undefined ? (data.city ? data.city.trim() : null) : existing.city,
        contributionType: data.contributionType !== undefined ? data.contributionType : existing.contributionType,
        availability: data.availability !== undefined ? data.availability : existing.availability,
        motivation: data.motivation !== undefined ? data.motivation.trim() : existing.motivation,
      },
    })

    // Si un membre est lié, synchroniser sa fiche sans toucher à son matricule ni à son statut
    if (existing.memberId) {
      await prisma.membre.update({
        where: { id: existing.memberId },
        data: {
          firstName: data.firstName !== undefined ? data.firstName.trim() : existing.firstName,
          lastName: data.lastName !== undefined ? data.lastName.trim() : existing.lastName,
          email: data.email !== undefined ? data.email.toLowerCase().trim() : existing.email,
          phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : existing.phone,
          profession: data.profession !== undefined ? (data.profession ? data.profession.trim() : null) : existing.profession,
          organization: data.organization !== undefined ? (data.organization ? data.organization.trim() : null) : existing.organization,
          country: data.country !== undefined ? data.country : existing.country,
          city: data.city !== undefined ? (data.city ? data.city.trim() : null) : existing.city,
          contributionType: data.contributionType !== undefined ? data.contributionType : existing.contributionType,
          availability: data.availability !== undefined ? data.availability : existing.availability,
          motivation: data.motivation !== undefined ? data.motivation.trim() : existing.motivation,
        },
      })

      await prisma.historiqueAdhesion.create({
        data: {
          applicationId: existing.id,
          memberId: existing.memberId,
          action: "MEMBER_UPDATED",
          fromStatus: existing.status,
          toStatus: existing.status,
          authorName: adminName,
          note: "Modification des données du dossier et de la fiche membre (matricule conservé).",
        },
      })
    } else {
      await prisma.historiqueAdhesion.create({
        data: {
          applicationId: existing.id,
          action: "APPLICATION_UPDATED",
          fromStatus: existing.status,
          toStatus: existing.status,
          authorName: adminName,
          note: "Modification des données du dossier sans changement de statut.",
        },
      })
    }

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      application: updated,
      message: "Données du dossier mises à jour avec succès.",
    }
  } catch (error: any) {
    console.error("Error updating application data:", error)
    return { success: false, error: error.message || "Impossible de mettre à jour la demande." }
  }
}

export async function setMemberApplicationPending(
  applicationId: string,
  adminName: string = "Admin APTIC-R",
  adminNote?: string
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const application = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { success: false, error: "Demande d'adhésion introuvable." }
    }

    const updated = await prisma.demandeAdhesion.update({
      where: { id: applicationId },
      data: {
        status: "PENDING",
        notes: adminNote ? adminNote : application.notes,
      },
    })

    const noteText = adminNote?.trim() || "Réexamen de la demande."

    await prisma.historiqueAdhesion.create({
      data: {
        applicationId: application.id,
        action: "APPLICATION_RESET_TO_PENDING",
        fromStatus: application.status,
        toStatus: "PENDING",
        authorName: adminName,
        note: `Retour en attente d'examen.\nMotif : ${noteText}`,
      },
    })

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      application: updated,
      message: "La demande a été remise en attente d'examen.",
    }
  } catch (error: any) {
    console.error("Error setting application pending:", error)
    return { success: false, error: error.message || "Impossible de mettre à jour le statut." }
  }
}


export async function getMembersDirectory(options?: {
  search?: string
  status?: string
  country?: string
  limit?: number
  skip?: number
}) {
  try {
    if (!(await isAdminSession())) {
      return {
        members: [],
        stats: { activeMembers: 0, countriesCount: 0, domainsCount: 0, newThisMonth: 0 },
      }
    }
    const where: any = {}

    // Par défaut, le répertoire des membres n'affiche QUE les membres actifs
    where.membershipStatus = options?.status && options.status !== "ALL" ? options.status : "ACTIVE"

    if (options?.country && options.country !== "ALL") {
      where.country = options.country
    }

    if (options?.search) {
      const q = options.search.trim()
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { referenceNumber: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { organization: { contains: q, mode: "insensitive" } },
        { profession: { contains: q, mode: "insensitive" } },
      ]
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [members, activeCount, allMembersForStats, newThisMonthCount] = await Promise.all([
      prisma.membre.findMany({
        where,
        include: {
          history: {
            orderBy: { createdAt: "desc" },
          },
          applications: {
            select: {
              id: true,
              referenceNumber: true,
              createdAt: true,
              status: true,
            },
          },
        },
        orderBy: { membershipDate: "desc" },
        take: options?.limit,
        skip: options?.skip,
      }),
      prisma.membre.count({
        where: { membershipStatus: "ACTIVE" },
      }),
      prisma.membre.findMany({
        where: { membershipStatus: "ACTIVE" },
        select: { country: true, domainsOfInterest: true },
      }),
      prisma.membre.count({
        where: {
          membershipStatus: "ACTIVE",
          membershipDate: { gte: startOfMonth },
        },
      }),
    ])

    // Calcul des statistiques
    const countriesSet = new Set<string>()
    const domainsSet = new Set<string>()

    allMembersForStats.forEach((m) => {
      if (m.country) countriesSet.add(m.country)
      try {
        const parsed = JSON.parse(m.domainsOfInterest)
        if (Array.isArray(parsed)) {
          parsed.forEach((d) => domainsSet.add(d))
        }
      } catch {
        if (m.domainsOfInterest) domainsSet.add(m.domainsOfInterest)
      }
    })

    return {
      members,
      stats: {
        activeMembers: activeCount,
        countriesCount: countriesSet.size,
        domainsCount: domainsSet.size,
        newThisMonth: newThisMonthCount,
      },
    }
  } catch (error) {
    console.error("Error fetching members directory:", error)
    return {
      members: [],
      stats: { activeMembers: 0, countriesCount: 0, domainsCount: 0, newThisMonth: 0 },
    }
  }
}

export async function getMemberHistory(memberId: string) {
  try {
    if (!(await isAdminSession())) {
      return []
    }
    return await prisma.historiqueAdhesion.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching member history:", error)
    return []
  }
}

export async function getApplicationHistory(applicationId: string) {
  try {
    if (!(await isAdminSession())) {
      return []
    }
    return await prisma.historiqueAdhesion.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching application history:", error)
    return []
  }
}

// ── Rétro-compatibilité pour l'ancien code existant ──
export async function getMembers(options?: {
  status?: string
  search?: string
  limit?: number
  skip?: number
}) {
  const res = await getMemberApplications(options)
  return res.applications
}

export async function updateMemberStatus(id: string, status: string, notes?: string) {
  if (status === "APPROVED") {
    return await approveMemberApplication(id, "Admin APTIC-R", notes)
  } else if (status === "REJECTED") {
    return await rejectMemberApplication(id, "Admin APTIC-R", notes)
  } else {
    return await setMemberApplicationPending(id, "Admin APTIC-R", notes)
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ─── 12. CMS : GESTION ARTICLES ──────────────────────────────────────────────

export async function createArticle(data: {
  titleFr: string
  titleEn?: string
  titleDe?: string
  excerptFr: string
  excerptEn?: string
  excerptDe?: string
  contentFr: string
  contentEn?: string
  contentDe?: string
  categoryId?: string
  authorName?: string
  readingTime?: number
  featuredImage?: string
  published?: boolean
  publishedFr?: boolean
  publishedEn?: boolean
  publishedDe?: boolean
  metaTitle?: string
  metaDescription?: string
}) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const baseSlug = slugify(data.titleFr)
    let slug = baseSlug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const article = await prisma.article.create({
      data: ({

        slug,
        titleFr: data.titleFr.trim(),
        titleEn: data.titleEn?.trim() || null,
        titleDe: data.titleDe?.trim() || null,
        excerptFr: data.excerptFr.trim(),
        excerptEn: data.excerptEn?.trim() || null,
        excerptDe: data.excerptDe?.trim() || null,
        contentFr: data.contentFr.trim(),
        contentEn: data.contentEn?.trim() || null,
        contentDe: data.contentDe?.trim() || null,
        categoryId: data.categoryId || null,
        authorName: data.authorName?.trim() || "Équipe APTIC-R",
        readingTime: data.readingTime ?? 3,
        featuredImage: data.featuredImage || null,
        published: Boolean(data.publishedFr || data.publishedEn || data.publishedDe || data.published),
        publishedFr: Boolean(data.publishedFr ?? data.published),
        publishedEn: Boolean(data.publishedEn),
        publishedDe: Boolean(data.publishedDe),
        publishedAt: data.publishedFr || data.publishedEn || data.publishedDe || data.published ? new Date() : null,
        metaTitle: data.metaTitle?.trim() || null,
        metaDescription: data.metaDescription?.trim() || null,
      }) as any,
    })

    revalidatePath("/backoffice/articles")
    revalidatePath("/[lang]/actualites", "page")
    return { success: true, article }
  } catch (error: any) {
    console.error("Error creating article:", error)
    return { success: false, error: error.message || "Erreur lors de la création de l'article." }
  }
}

export async function updateArticle(
  id: string,
  data: Partial<{
    titleFr: string
    titleEn?: string
    titleDe?: string
    excerptFr: string
    excerptEn?: string
    excerptDe?: string
    contentFr: string
    contentEn?: string
    contentDe?: string
    categoryId?: string
    authorName?: string
    readingTime?: number
    featuredImage?: string
    published: boolean
    publishedFr: boolean
    publishedEn: boolean
    publishedDe: boolean
    metaTitle?: string
    metaDescription?: string
  }>
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: "Article introuvable." }
    }

    const updateData: any = { ...data }
    if (data.publishedFr !== undefined || data.publishedEn !== undefined || data.publishedDe !== undefined) {
      const nextPublished = {
        publishedFr: data.publishedFr ?? existing.publishedFr ?? existing.published,
        publishedEn: data.publishedEn ?? existing.publishedEn ?? false,
        publishedDe: data.publishedDe ?? existing.publishedDe ?? false,
      }
      updateData.published = Object.values(nextPublished).some(Boolean)
      if (updateData.published && !existing.publishedAt) updateData.publishedAt = new Date()
    } else if (data.published && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/backoffice/articles")
    revalidatePath("/[lang]/actualites", "page")
    return { success: true, article }
  } catch (error: any) {
    console.error("Error updating article:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour de l'article." }
  }
}

export async function toggleArticleFeatured(id: string, isFeatured: boolean) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const existing = await prisma.article.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: "Article introuvable." }
    }

    if (isFeatured) {
      // Transaction atomique : désactiver tous les autres articles à la une, puis activer celui-ci
      await prisma.$transaction([
        prisma.article.updateMany({
          where: { isFeatured: true },
          data: { isFeatured: false },
        }),
        prisma.article.update({
          where: { id },
          data: { isFeatured: true },
        }),
      ])
    } else {
      await prisma.article.update({
        where: { id },
        data: { isFeatured: false },
      })
    }

    revalidatePath("/backoffice/articles")
    revalidatePath("/[lang]/actualites", "page")
    return { success: true, message: isFeatured ? "Cet article est maintenant à la une." : "Cet article n'est plus à la une." }
  } catch (error: any) {
    console.error("Error toggling featured article:", error)
    return { success: false, error: error.message || "Impossible de modifier la mise à la une." }
  }
}

export async function deleteArticle(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    await prisma.article.delete({ where: { id } })
    revalidatePath("/backoffice/articles")
    revalidatePath("/[lang]/actualites", "page")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting article:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

// ─── 13. CMS : GESTION PROJETS ───────────────────────────────────────────────

export async function getProjectProposalForConversion(proposalId: string) {
  try {
    if (!(await getProjectProposalAdmin())) {
      return { success: false as const, error: UNAUTHORIZED_ACTION }
    }
    if (typeof proposalId !== "string" || proposalId.length < 1 || proposalId.length > 100) {
      return { success: false as const, error: "Identifiant de proposition invalide." }
    }

    const proposal = await prisma.propositionProjet.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        referenceNumber: true,
        proposerName: true,
        organization: true,
        email: true,
        country: true,
        title: true,
        domain: true,
        description: true,
        objectives: true,
        targetAudience: true,
        expectedResults: true,
        collaboration: true,
        timeline: true,
        budget: true,
        message: true,
        status: true,
        convertedProject: {
          select: { id: true, titleFr: true, slug: true },
        },
      },
    })
    if (!proposal) {
      return { success: false as const, error: "Proposition introuvable." }
    }

    const normalizedDomain = proposal.domain.trim().toLocaleLowerCase()
    const domains = await prisma.domaine.findMany({
      select: { id: true, slug: true, nameFr: true, nameEn: true, nameDe: true },
    })
    const matchingDomain = domains.find((domain) =>
      [domain.slug, domain.nameFr, domain.nameEn, domain.nameDe]
        .some((value) => value?.trim().toLocaleLowerCase() === normalizedDomain)
    )

    return {
      success: true as const,
      proposal,
      suggestedDomainId: matchingDomain?.id || null,
    }
  } catch (error) {
    console.error("getProjectProposalForConversion error:", error)
    return { success: false as const, error: "Impossible de charger la proposition." }
  }
}

export async function createProject(data: {
  titleFr: string
  titleEn?: string
  titleDe?: string
  summaryFr: string
  summaryEn?: string
  summaryDe?: string
  descriptionFr: string
  descriptionEn?: string
  descriptionDe?: string
  objectivesFr?: string
  objectivesEn?: string
  objectivesDe?: string
  actionsFr?: string
  actionsEn?: string
  actionsDe?: string
  resultsFr?: string
  resultsEn?: string
  resultsDe?: string
  publishedFr?: boolean
  publishedEn?: boolean
  publishedDe?: boolean
  location: string
  country?: string
  status?: string
  domaineId?: string
  beneficiaries?: string
  startDate?: Date | null
  endDate?: Date | null
  isFeatured?: boolean
  displayOrder?: number
  featuredImage?: string
  sourceProposalId?: string
}) {
  try {
    if (!(await getProjectProposalAdmin())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (data.sourceProposalId !== undefined &&
        (typeof data.sourceProposalId !== "string" || data.sourceProposalId.length < 1 || data.sourceProposalId.length > 100)) {
      return { success: false, error: "Identifiant de proposition invalide." }
    }
    if (data.sourceProposalId && [
      data.titleFr,
      data.summaryFr,
      data.descriptionFr,
      data.location,
    ].some((value) => typeof value !== "string" || !value.trim())) {
      return { success: false, error: "Le titre, le résumé, la description et le lieu du projet sont obligatoires." }
    }
    const baseSlug = slugify(data.titleFr)
    let slug = baseSlug
    let counter = 1
    while (await prisma.projet.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.sourceProposalId) {
        const proposal = await tx.propositionProjet.findUnique({
          where: { id: data.sourceProposalId },
          select: {
            status: true,
            convertedProject: { select: { id: true, titleFr: true, slug: true } },
          },
        })
        if (!proposal) throw new Error("Proposition introuvable.")
        if (proposal.convertedProject) {
          return { alreadyConverted: proposal.convertedProject }
        }
        if (proposal.status !== "ACCEPTE_COLLABORATION") {
          throw new Error("La proposition doit être acceptée avant de créer un projet.")
        }
      }

      const projet = await tx.projet.create({
        data: {
        slug,
        sourceProposalId: data.sourceProposalId || null,
        titleFr: data.titleFr.trim(),
        titleEn: data.titleEn?.trim() || null,
        titleDe: data.titleDe?.trim() || null,
        summaryFr: data.summaryFr.trim(),
        summaryEn: data.summaryEn?.trim() || null,
        summaryDe: data.summaryDe?.trim() || null,
        descriptionFr: data.descriptionFr.trim(),
        descriptionEn: data.descriptionEn?.trim() || null,
        descriptionDe: data.descriptionDe?.trim() || null,
        objectivesFr: data.objectivesFr?.trim() || null,
        objectivesEn: data.objectivesEn?.trim() || null,
        objectivesDe: data.objectivesDe?.trim() || null,
        actionsFr: data.actionsFr?.trim() || null,
        actionsEn: data.actionsEn?.trim() || null,
        actionsDe: data.actionsDe?.trim() || null,
        resultsFr: data.resultsFr?.trim() || null,
        resultsEn: data.resultsEn?.trim() || null,
        resultsDe: data.resultsDe?.trim() || null,
        publishedFr: data.sourceProposalId
          ? Boolean(data.publishedFr)
          : data.publishedFr !== undefined ? Boolean(data.publishedFr) : true,
        publishedEn: data.sourceProposalId
          ? Boolean(data.publishedEn)
          : data.publishedEn !== undefined ? Boolean(data.publishedEn) : false,
        publishedDe: data.sourceProposalId
          ? Boolean(data.publishedDe)
          : data.publishedDe !== undefined ? Boolean(data.publishedDe) : false,
        location: data.location.trim(),
        country: data.country || "Togo",
        status: data.status || "IN_PROGRESS",
        domaineId: data.domaineId || null,
        beneficiaries: data.beneficiaries?.trim() || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        isFeatured: Boolean(data.isFeatured),
        displayOrder: data.displayOrder || 0,
        featuredImage: data.featuredImage || null,
        },
      })

      if (data.isFeatured) {
        await tx.projet.updateMany({
          where: { id: { not: projet.id } },
          data: { isFeatured: false },
        })
      }
      return { project: projet }
    })

    if ("alreadyConverted" in result) {
      return {
        success: false,
        error: "Cette proposition a déjà été convertie en projet.",
        existingProject: result.alreadyConverted,
      }
    }

    revalidatePath("/backoffice/projects")
    revalidatePath("/backoffice/project-proposals")
    revalidatePath("/[lang]/projets", "page")
    revalidatePath(`/[lang]/projets/${result.project.slug}`, "page")
    return { success: true, project: result.project }
  } catch (error: any) {
    if (error?.code === "P2002" && data.sourceProposalId) {
      const existingProject = await prisma.projet.findUnique({
        where: { sourceProposalId: data.sourceProposalId },
        select: { id: true, titleFr: true, slug: true },
      })
      if (existingProject) {
        return {
          success: false,
          error: "Cette proposition a déjà été convertie en projet.",
          existingProject,
        }
      }
    }
    console.error("Error creating project:", error)
    return { success: false, error: error.message || "Erreur lors de la création du projet." }
  }
}

export async function updateProject(id: string, data: any) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (data.isFeatured) {
      await prisma.projet.updateMany({
        where: { id: { not: id } },
        data: { isFeatured: false },
      })
    }

    const project = await prisma.projet.update({
      where: { id },
      data,
    })
    revalidatePath("/backoffice/projects")
    revalidatePath("/[lang]/projets", "page")
    revalidatePath(`/[lang]/projets/${project.slug}`, "page")
    return { success: true, project }
  } catch (error: any) {
    console.error("Error updating project:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteProject(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    await prisma.projet.delete({ where: { id } })
    revalidatePath("/backoffice/projects")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting project:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

// ─── 14. CMS : GESTION ÉVÉNEMENTS ────────────────────────────────────────────

export async function createEvent(data: {
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  category: string
  location?: string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  isOnline?: boolean
  meetingUrl?: string | null
  registrationUrl?: string | null
  featuredImage?: string | null
  published?: boolean
  [key: string]: any
}) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION, errors: [] as string[] }
    }
    const baseSlug = slugify(data.titleFr)
    let slug = baseSlug
    let counter = 1
    while (await prisma.evenement.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const event = await prisma.evenement.create({
      data: {
        slug,
        titleFr: data.titleFr.trim(),
        titleEn: data.titleEn?.trim() || null,
        titleDe: data.titleDe?.trim() || null,
        descriptionFr: (data.descriptionFr ?? "").trim(),
        descriptionEn: data.descriptionEn?.trim() || null,
        descriptionDe: data.descriptionDe?.trim() || null,
        category: data.category || "WORKSHOP",
        location: (data.location ?? "").trim(),
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate || null,
        isOnline: Boolean(data.isOnline),
        meetingUrl: data.meetingUrl?.trim() || null,
        registrationUrl: data.registrationUrl?.trim() || null,
        featuredImage: data.featuredImage || null,
        published: data.published !== false,
      },
    })

    revalidatePath("/backoffice/events")
    return { success: true, event, errors: [] as string[] }
  } catch (error: any) {
    console.error("Error creating event:", error)
    return { success: false, error: error.message || "Erreur lors de la création de l'événement.", errors: [error.message || "Erreur"] as string[] }
  }
}

export async function updateEvent(id: string, data: any) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION, errors: [] as string[] }
    }
    const event = await prisma.evenement.update({
      where: { id },
      data,
    })
    revalidatePath("/backoffice/events")
    return { success: true, event, errors: [] as string[] }
  } catch (error: any) {
    console.error("Error updating event:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour de l'événement.", errors: [error.message || "Erreur"] as string[] }
  }
}

export async function deleteEvent(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    await prisma.evenement.delete({ where: { id } })
    revalidatePath("/backoffice/events")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

// ─── 15. CMS : GESTION ABONNÉS NEWSLETTER ─────────────────────────────────────

export async function getNewsletterSubscribers(filters?: {
  search?: string
  lang?: string
  active?: boolean
}) {
  try {
    if (!(await isAdminSession())) {
      return []
    }
    const where: any = {}
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { firstName: { contains: filters.search, mode: "insensitive" } },
      ]
    }
    if (filters?.lang && filters.lang !== "ALL") {
      where.lang = filters.lang as LanguageCode
    }
    if (filters?.active !== undefined) {
      where.active = filters.active
    }

    const subscribers = await prisma.newsletterAbonne.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
    })
    return subscribers.map((subscriber) => ({
      ...subscriber,
      consentVerifiable: isNewsletterConsentVerifiable(subscriber),
      campaignEligible: isNewsletterEligibleForCampaign(subscriber),
    }))
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return []
  }
}

export async function toggleNewsletterSubscriberStatus(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const subscriber = await prisma.newsletterAbonne.findUnique({ where: { id } })
    if (!subscriber) return { success: false, error: "Abonné introuvable" }

    if (!subscriber.active) {
      return {
        success: false,
        error: "La réactivation exige un nouveau consentement explicite via le formulaire d’ajout.",
      }
    }

    const updated = await prisma.newsletterAbonne.update({
      where: { id },
      data: {
        active: false,
        unsubscribedAt: new Date(),
      },
    })

    revalidatePath("/backoffice/newsletter")
    return { success: true, subscriber: updated }
  } catch (error: any) {
    console.error("Error toggling subscriber status:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    await prisma.newsletterAbonne.delete({ where: { id } })
    revalidatePath("/backoffice/newsletter")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting subscriber:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

export async function adminAddNewsletterSubscriber(input: unknown) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const parsed = adminNewsletterSubscriberSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Données d’inscription invalides.",
      }
    }

    const registration = await prisma.$transaction((tx) =>
      registerNewsletterSubscriber(
        {
          findByEmail: (email) => tx.newsletterAbonne.findUnique({ where: { email } }),
          createSubscriber: (data) => tx.newsletterAbonne.create({ data }),
          reactivateSubscriber: (id, data) => tx.newsletterAbonne.update({ where: { id }, data }),
          addUnsubscribeToken: async (subscriberId, tokenHash) => {
            await tx.newsletterUnsubscribeToken.create({ data: { subscriberId, tokenHash } })
          },
        },
        parsed.data,
        "ADMIN_FORM",
      ),
    )

    if (!registration.success) return registration
    if (registration.alreadySubscribed) {
      return { success: false, error: "Cet email est déjà abonné." }
    }

    revalidatePath("/backoffice/newsletter")
    return {
      success: true,
      message: "Abonné ajouté ou réactivé avec un nouveau consentement explicite.",
      unsubscribePath: registration.unsubscribePath,
    }
  } catch (error: any) {
    console.error("Error adding subscriber:", error)
    return { success: false, error: error.message || "Erreur lors de l'ajout de l'abonné." }
  }
}

// ─── 16. CMS : PARAMÈTRES & MÉDIAS DU SITE ───────────────────────────────────

import { INITIAL_ABOUT_SETTINGS } from "./about-seed-data"
import { INITIAL_SUPPORT_SETTINGS } from "./support-seed-data"

export async function getSiteSettings(group?: string) {
  try {
    const where: any = {}
    if (group && group !== "ALL") {
      where.group = group
    }

    const settings = await (prisma as any).parametreSite.findMany({
      where,
      orderBy: { key: "asc" },
    })
    const dict: Record<string, string> = {}
    settings.forEach((setting: any) => {
      dict[setting.key] = setting.value
    })

    return { success: true, settings, dict }
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return { success: false, settings: [], dict: {} }
  }
}
export async function getSiteSetting(key: string, defaultValue = ""): Promise<string> {
  try {
    const record = await (prisma as any).parametreSite.findUnique({
      where: { key },
    })
    return record?.value ?? defaultValue
  } catch (error) {
    console.error(`Error fetching site setting ${key}:`, error)
    return defaultValue
  }
}

export async function updateSiteSettings(
  entries: { key: string; value: string; group?: string; description?: string }[],
  groupHint: string[] = [],
) {
  if (!(await isAdminSession())) {
    return { success: false, error: UNAUTHORIZED_ACTION, savedCount: 0 }
  }
  const startedAt = performance.now()
  let transactionMs = 0
  let revalidationMs = 0
  let entriesSaved = 0
  let groups: string[] = []

  const logMetrics = (success: boolean) => {
    if (process.env.NODE_ENV !== "development") return
    console.info("[AdminSettings:save-server]", {
      groups,
      entriesSaved,
      transactionMs: Number(transactionMs.toFixed(2)),
      revalidationMs: Number(revalidationMs.toFixed(2)),
      totalMs: Number((performance.now() - startedAt).toFixed(2)),
      success,
    })
  }

  try {
    const uniqueEntries = Array.from(
      new Map(entries.map((entry) => [entry.key, entry])).values(),
    )
    entriesSaved = uniqueEntries.length
    groups = uniqueEntries.length
      ? ([...new Set(uniqueEntries.map((entry) => entry.group).filter(Boolean))] as string[])
      : groupHint

    if (uniqueEntries.length === 0) {
      logMetrics(true)
      return {
        success: true,
        message: "Aucune modification n'était nécessaire.",
        savedCount: 0,
      }
    }

    const queries = uniqueEntries.map((item) =>
      (prisma as any).parametreSite.upsert({
        where: { key: item.key },
        update: {
          value: item.value,
          ...(item.group ? { group: item.group } : {}),
          ...(item.description ? { description: item.description } : {}),
        },
        create: {
          key: item.key,
          value: item.value,
          group: item.group || "GENERAL",
          description: item.description || null,
        },
      })
    )

    const transactionStartedAt = performance.now()
    try {
      await (prisma as any).$transaction(queries)
    } finally {
      transactionMs = performance.now() - transactionStartedAt
    }

    const pageSegmentsByGroup: Record<string, Record<string, string>> = {
      ABOUT: { fr: "a-propos", en: "a-propos", de: "a-propos" },
      VOLUNTEER: { fr: "volontariat", en: "volontariat", de: "volontariat" },
      PARTNER: { fr: "partenaires", en: "partners", de: "partenaires" },
      MEMBERSHIP: {
        fr: "devenir-membre",
        en: "devenir-membre",
        de: "devenir-membre",
      },
      SUPPORT: { fr: "soutenir", en: "support", de: "unterstuetzen" },
      NEWS: { fr: "actualites", en: "actualites", de: "actualites" },
      CONTACT: { fr: "contact", en: "contact", de: "contact" },
    }
    const changedLanguages = new Set<string>()
    let hasNonLocalizedSetting = false

    uniqueEntries.forEach((entry) => {
      const language = entry.key.match(/_(fr|en|de)$/i)?.[1]?.toLowerCase()
      if (language) changedLanguages.add(language)
      else hasNonLocalizedSetting = true
    })

    const revalidationPaths = new Set<string>()
    if (groups.includes("GENERAL")) {
      revalidationPaths.add("/[lang]")
    }

    groups.forEach((group) => {
      const routes = pageSegmentsByGroup[group]
      if (!routes) return

      const languages = hasNonLocalizedSetting
        ? ["fr", "en", "de"]
        : Array.from(changedLanguages)

      languages.forEach((language) => {
        const route = routes[language]
        if (route) revalidationPaths.add(`/${language}/${route}`)
      })
    })

    const revalidationStartedAt = performance.now()
    try {
      revalidationPaths.forEach((path) => {
        if (path === "/[lang]") revalidatePath(path, "layout")
        else revalidatePath(path)
      })
    } finally {
      revalidationMs = performance.now() - revalidationStartedAt
    }

    logMetrics(true)
    return {
      success: true,
      message: "Paramètres enregistrés avec succès.",
      savedCount: entriesSaved,
    }
  } catch (error: any) {
    logMetrics(false)
    console.error("Error updating site settings:", error)
    return { success: false, error: error.message || "Erreur lors de l'enregistrement des paramètres." }
  }
}

export async function seedAboutPageSettings(force = false) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const existing = await (prisma as any).parametreSite.findUnique({
      where: { key: "about_title_fr" },
    })

    if (existing && !force) {
      return { success: true, message: "Paramètres À Propos déjà initialisés." }
    }

    const entries = Object.entries(INITIAL_ABOUT_SETTINGS).map(([key, value]) => ({
      key,
      value,
      group: "ABOUT",
    }))

    await updateSiteSettings(entries)
    return { success: true, message: "Paramètres À Propos initialisés avec succès." }
  } catch (err: any) {
    console.error("Error seeding about page settings:", err)
    return { success: false, error: err.message }
  }
}

export async function seedSupportPageSettings(force = false) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    let settings = Object.entries(INITIAL_SUPPORT_SETTINGS)

    if (!force) {
      const existingSettings = await (prisma as any).parametreSite.findMany({
        where: { key: { in: settings.map(([key]) => key) } },
        select: { key: true, value: true },
      })
      const valuesByKey = new Map<string, string>()
      existingSettings.forEach((setting: { key: string; value: string }) => {
        valuesByKey.set(setting.key, setting.value)
      })
      settings = settings.filter(([key]) => !valuesByKey.get(key)?.trim())
    }

    if (settings.length === 0) {
      return { success: true, message: "Paramètres Soutien déjà initialisés." }
    }

    const entries = settings.map(([key, value]) => ({
      key,
      value,
      group: "SUPPORT",
    }))

    await updateSiteSettings(entries)
    return { success: true, message: "Paramètres Soutien initialisés avec succès." }
  } catch (err: any) {
    console.error("Error seeding support page settings:", err)
    return { success: false, error: err.message }
  }
}

// ─── 17. CMS : ÉQUIPE & GOUVERNANCE (MembreEquipe) ───────────────────────────

const DEFAULT_TEAM_MEMBERS = [
  {
    firstName: "Komal",
    lastName: "DAGNON",
    roleFr: "Directeur Exécutif & Co-fondateur",
    roleEn: "Executive Director & Co-Founder",
    roleDe: "Geschäftsführender Direktor & Mitgründer",
    category: "DIRECTION",
    bioFr:
      "Fondateur et Directeur Exécutif d'APTIC-R à Agbélouvé. Engagé depuis 2018 pour le désenclavement numérique, l'autonomie technologique des zones rurales et le développement socio-économique communautaire dans la préfecture du Zio et la région Maritime au Togo.",
    bioEn:
      "Founder and Executive Director of APTIC-R in Agbélouvé. Dedicated since 2018 to digital inclusion, technological self-reliance for rural communities, and grassroots socio-economic development across the Zio Prefecture and Maritime Region of Togo.",
    bioDe:
      "Gründer und geschäftsführender Direktor von APTIC-R in Agbélouvé. Seit 2018 engagiert für digitale Inklusion, technologische Eigenständigkeit im ländlichen Raum und sozioökonomische Entwicklung in der Region Maritime in Togo.",
    email: "direction@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Gouvernance institutionnelle", "Développement rural", "Plaidoyer numérique", "Partenariats stratégiques"]),
    order: 1,
    active: true,
  },
  {
    firstName: "Kokouvi",
    lastName: "Mensah",
    roleFr: "Président du Conseil d'Administration",
    roleEn: "President of the Board of Directors",
    roleDe: "Vorsitzender des Verwaltungsrats",
    category: "DIRECTION",
    bioFr:
      "Ingénieur en systèmes d'information formé à Lomé et à Dakar. Engagé pour l'accès universel aux technologies en milieu rural, il veille au respect des orientations stratégiques, de la charte éthique et des engagements statutaires de l'association.",
    bioEn:
      "Information Systems Engineer trained in Lomé and Dakar. Dedicated to digital inclusion and rural technology access across West Africa, steering strategic governance and institutional partnerships.",
    bioDe:
      "IT-Ingenieur mit Ausbildung in Lomé und Dakar. Engagiert für digitale Inklusion im ländlichen Raum, strategische Partnerschaften und ethische Organisationsentwicklung.",
    email: "presidence@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Gouvernance", "Stratégie IT", "Plaidoyer institutionnel", "Partenariats"]),
    order: 2,
    active: true,
  },
  {
    firstName: "Afiwa",
    lastName: "Lawson",
    roleFr: "Coordinatrice des Programmes & Ingénierie Pédagogique",
    roleEn: "Programs & Pedagogical Engineering Coordinator",
    roleDe: "Programm- & Pädagogikkoordinatorin",
    category: "COORDINATION",
    bioFr:
      "Spécialiste de l'éducation populaire et de la formation professionnelle. Elle conçoit les parcours d'alphabétisation numérique, supervise les formateurs et assure l'accueil et le suivi personnalisé des volontaires internationaux à Agbélouvé.",
    bioEn:
      "Specialist in popular education and curriculum design. She oversees digital literacy training modules, trainer capacity building, and international volunteer mentorship in Agbélouvé.",
    bioDe:
      "Fachkraft für Bildungswesen und Lehrplanentwicklung. Verantwortlich für digitale Alphabetisierung, Trainerausbildung und Betreuung internationaler Freiwilliger vor Ort.",
    email: "programmes@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Ingénierie pédagogique", "Coordination de projets", "Égalité F/H", "Formation"]),
    order: 3,
    active: true,
  },
  {
    firstName: "Kodjo",
    lastName: "Agbodjan",
    roleFr: "Responsable Technique & FabLab Rural",
    roleEn: "Technical Lead & Rural FabLab Manager",
    roleDe: "Technischer Leiter & Rural FabLab",
    category: "FORMATION",
    bioFr:
      "Électronicien et maker engagé. Il anime les ateliers de prototypage Low-Tech, supervise l'impression 3D, la maintenance du parc informatique reconditionné et l'expérimentation de capteurs solaires adaptés à l'agriculture locale.",
    bioEn:
      "Electronics technician and passionate maker. He leads Low-Tech prototyping workshops, 3D printing, refurbished hardware maintenance, and solar-powered sensors for local farming.",
    bioDe:
      "Elektroniker und Maker. Leitet Low-Tech-Prototyping-Workshops, 3D-Druck, Hardware-Instandsetzung und solarbetriebene Sensorsysteme für die Landwirtschaft.",
    email: "fablab@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["FabLab & Prototypage", "Impression 3D", "Électronique Low-Tech", "Maintenance IT"]),
    order: 4,
    active: true,
  },
  {
    firstName: "Essivi",
    lastName: "Kpogo",
    roleFr: "Chargée de Mobilisation Communautaire & Genre",
    roleEn: "Community Engagement & Gender Officer",
    roleDe: "Referentin für Gemeindeengagement & Gleichstellung",
    category: "COORDINATION",
    bioFr:
      "Travailleuse sociale et médiatrice de terrain. Elle coordonne les relations avec les chefferies et les groupements de femmes maraîchères, et anime le programme d'initiation au numérique « Elles Codent pour le Changement ».",
    bioEn:
      "Social worker and community organizer leading partnerships with traditional leaders and women farming cooperatives, while coordinating the 'Girls Code for Change' empowerment initiative.",
    bioDe:
      "Sozialarbeiterin und Koordinatorin für Frauenkooperativen und das Bildungsprogramm für Mädchen und Frauen im ländlichen Raum.",
    email: "communaute@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Animation rurale", "Autonomisation des femmes", "Médiation communautaire"]),
    order: 5,
    active: true,
  },
  {
    firstName: "Yao",
    lastName: "Tete",
    roleFr: "Conseiller Scientifique, Climat & Agro-Écologie",
    roleEn: "Scientific Advisor, Climate & Agro-Ecology",
    roleDe: "Wissenschaftlicher Berater für Klima & Agrarökologie",
    category: "CONSEIL",
    bioFr:
      "Enseignant-chercheur agronome. Il oriente les projets appliqués d'APTIC-R sur la résilience climatique, la régénération des sols et l'intégration de capteurs d'irrigation solaire Low-Tech au service des coopératives maraîchères.",
    bioEn:
      "Agronomy researcher advising APTIC-R projects on climate resilience, soil regeneration, and solar-powered Low-Tech irrigation sensors for agricultural cooperatives.",
    bioDe:
      "Agrarwissenschaftler mit Schwerpunkt auf Klimaresilienz, Bodenfruchtbarkeit und sparsamer solarer Bewässerungstechnik für landwirtschaftliche Genossenschaften.",
    email: "conseil@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Agro-écologie", "Recherche appliquée", "Résilience climatique"]),
    order: 6,
    active: true,
  },
  {
    firstName: "Léa",
    lastName: "Dupont",
    roleFr: "Volontaire Internationale — UI/UX & Documentation",
    roleEn: "International Volunteer — UI/UX & Digital Design",
    roleDe: "Internationale Freiwillige — UI/UX & Mediengestaltung",
    category: "VOLONTAIRE",
    bioFr:
      "Designer d'interface diplômée en mission de solidarité internationale à Agbélouvé. Elle forme les apprenants aux fondamentaux du design graphique et du prototypage web, et documente en images les projets du FabLab.",
    bioEn:
      "UI/UX designer on an international volunteer mission in Agbélouvé, mentoring youth in visual design and web prototyping while documenting local FabLab community projects.",
    bioDe:
      "UI/UX-Designerin im Freiwilligendienst in Agbélouvé zur Ausbildung junger Menschen in Webdesign und Dokumentation der FabLab-Aktivitäten.",
    email: "volontariat@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["UI/UX Design", "Formation & Mentorat", "Documentation visuelle"]),
    order: 7,
    active: true,
  },
]

function serializeTeamMembers(
  members: Array<Omit<TeamMemberDTO, "skills"> & { skills: unknown }>
): TeamMemberDTO[] {
  return members.map((member) => ({
    ...member,
    skills: (() => {
      if (Array.isArray(member.skills)) return member.skills
      if (typeof member.skills !== "string") return []

      const legacySkills = member.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)

      try {
        const skills = JSON.parse(member.skills)
        return Array.isArray(skills)
          ? skills.filter((skill): skill is string => typeof skill === "string")
          : legacySkills
      } catch {
        return legacySkills
      }
    })(),
  }))
}

export async function getTeamMembers(options?: { category?: string; activeOnly?: boolean }) {
  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const where: any = {}
      if (options?.category && options.category !== "ALL") {
        where.category = options.category
      }
      if (options?.activeOnly !== false) {
        where.active = true
      }

      let members = await (prisma as any).membreEquipe.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })

      if (members.length === 0 && !options?.category) {
        const totalMembers = await (prisma as any).membreEquipe.count()
        if (totalMembers === 0) {
          for (const member of DEFAULT_TEAM_MEMBERS) {
            await (prisma as any).membreEquipe.create({ data: member })
          }
          members = await (prisma as any).membreEquipe.findMany({
            where,
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          })
        }
      }

      return { success: true, members: serializeTeamMembers(members) }
    } catch (error: any) {
      lastError = error
      console.warn(`[getTeamMembers] Tentative ${attempt}/${maxRetries} échouée:`, error?.message || error)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
      }
    }
  }

  console.error("Error fetching team members after all retries:", lastError)
  return { success: false, members: [], error: lastError?.message }
}

export async function createTeamMember(data: unknown) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Vous devez être connecté pour ajouter un membre." }
    }

    const parsed = teamMemberCreateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." }
    }

    const memberData = parsed.data
    const maxOrder = memberData.order === undefined
      ? await (prisma as any).membreEquipe.aggregate({ _max: { order: true } })
      : null
    const member = await (prisma as any).membreEquipe.create({
      data: {
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        roleFr: memberData.roleFr,
        roleEn: memberData.roleEn || null,
        roleDe: memberData.roleDe || null,
        category: memberData.category,
        bioFr: memberData.bioFr,
        bioEn: memberData.bioEn || null,
        bioDe: memberData.bioDe || null,
        photoUrl: memberData.photoUrl,
        email: memberData.email?.toLowerCase() || null,
        skills: JSON.stringify(memberData.skills),
        order: memberData.order ?? (maxOrder?._max.order || 0) + 1,
        active: memberData.active ?? true,
      },
    })

    safeRevalidatePath("/backoffice/settings")
    safeRevalidatePath("/backoffice/team")
    safeRevalidatePath("/[lang]/equipe", "page")
    safeRevalidatePath("/[lang]/team", "page")
    return { success: true, member, message: "Membre ajouté avec succès." }
  } catch (error: any) {
    console.error("Error creating team member:", error)
    return { success: false, error: error.message || "Erreur lors de la création du membre." }
  }
}

export async function updateTeamMember(id: string, data: unknown) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Vous devez être connecté pour modifier un membre." }
    }

    const parsed = teamMemberUpdateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données invalides." }
    }

    const memberData = parsed.data
    const updateData: any = {}
    if (memberData.firstName !== undefined) updateData.firstName = memberData.firstName
    if (memberData.lastName !== undefined) updateData.lastName = memberData.lastName
    if (memberData.roleFr !== undefined) updateData.roleFr = memberData.roleFr
    if (memberData.roleEn !== undefined) updateData.roleEn = memberData.roleEn || null
    if (memberData.roleDe !== undefined) updateData.roleDe = memberData.roleDe || null
    if (memberData.category !== undefined) updateData.category = memberData.category
    if (memberData.bioFr !== undefined) updateData.bioFr = memberData.bioFr
    if (memberData.bioEn !== undefined) updateData.bioEn = memberData.bioEn || null
    if (memberData.bioDe !== undefined) updateData.bioDe = memberData.bioDe || null
    if (memberData.photoUrl !== undefined) updateData.photoUrl = memberData.photoUrl
    if (memberData.email !== undefined) updateData.email = memberData.email.toLowerCase() || null
    if (memberData.skills !== undefined) updateData.skills = JSON.stringify(memberData.skills)
    if (memberData.order !== undefined) updateData.order = memberData.order
    if (memberData.active !== undefined) updateData.active = memberData.active

    const member = await (prisma as any).membreEquipe.update({
      where: { id },
      data: updateData,
    })

    safeRevalidatePath("/backoffice/settings")
    safeRevalidatePath("/backoffice/team")
    safeRevalidatePath("/[lang]/equipe", "page")
    safeRevalidatePath("/[lang]/team", "page")
    return { success: true, member, message: "Membre mis à jour avec succès." }
  } catch (error: any) {
    console.error("Error updating team member:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteTeamMember(id: string) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Vous devez être connecté pour supprimer un membre." }
    }

    await (prisma as any).membreEquipe.delete({ where: { id } })
    safeRevalidatePath("/backoffice/settings")
    safeRevalidatePath("/backoffice/team")
    safeRevalidatePath("/[lang]/equipe", "page")
    safeRevalidatePath("/[lang]/team", "page")
    return { success: true, message: "Membre supprimé avec succès." }
  } catch (error: any) {
    console.error("Error deleting team member:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

export async function reorderTeamMembersAction(orderedIds: string[]) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Vous devez être connecté pour réorganiser l'équipe." }
    }

    const parsed = teamMemberReorderSchema.safeParse({ orderedIds })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Ordre invalide." }
    }

    const activeMembers = await (prisma as any).membreEquipe.findMany({
      where: { active: true },
      select: { id: true },
    })
    const activeIds = new Set(activeMembers.map((member: { id: string }) => member.id))
    const ids = parsed.data.orderedIds
    if (ids.length !== activeIds.size || ids.some((id) => !activeIds.has(id))) {
      return { success: false, error: "La liste doit contenir tous les membres actifs." }
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.membreEquipe.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    )

    safeRevalidatePath("/backoffice/settings")
    safeRevalidatePath("/backoffice/team")
    safeRevalidatePath("/[lang]/equipe", "page")
    safeRevalidatePath("/[lang]/team", "page")
    return { success: true, message: "Ordre de l'équipe mis à jour." }
  } catch (error: any) {
    console.error("Error reordering team members:", error)
    return { success: false, error: error.message || "Erreur lors de la réorganisation." }
  }
}

// ─── 22. CMS : GESTION DES DOMAINES D'ACTION ─────────────────────────────────

function hasDomaineContentInLanguage(domaine: any, lang: string): boolean {
  const language = lang.toUpperCase()
  const name = language === "EN" ? domaine.nameEn : language === "DE" ? domaine.nameDe : domaine.nameFr
  const description = language === "EN" ? domaine.descEn : language === "DE" ? domaine.descDe : domaine.descFr
  return Boolean(name?.trim() && description?.trim())
}

export async function getDomaines(options?: { activeOnly?: boolean; lang?: string }) {
  try {
    const where: any = {}
    if (options?.activeOnly) {
      where.active = true
    }
    // Filtre de langue poussé en base (équivalent exact de
    // hasDomaineContentInLanguage) : évite de charger puis filtrer en mémoire.
    if (options?.lang) {
      const language = options.lang.toUpperCase()
      const nameKey = language === "EN" ? "nameEn" : language === "DE" ? "nameDe" : "nameFr"
      const descKey = language === "EN" ? "descEn" : language === "DE" ? "descDe" : "descFr"
      where[nameKey] = { not: "" }
      where[descKey] = { not: "" }
    }

    const domaines = await (prisma as any).domaine.findMany({
      where,
      orderBy: { order: "asc" },
      // La vue n'utilise que le nombre de projets rattachés (badge).
      include: {
        _count: {
          select: { projets: true },
        },
      },
    })
    return domaines
  } catch (error) {
    console.error("Error fetching domaines:", error)
    return []
  }
}

export async function getDomaineBySlug(slugOrId: string, lang?: string) {
  const maxRetries = 2
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const domaine = await (prisma as any).domaine.findFirst({
        where: {
          OR: [{ slug: slugOrId }, { id: slugOrId }],
        },
        include: {
          projets: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          },
          ressources: {
            where: { published: true },
            orderBy: { year: "desc" },
          },
        },
      })
      if (domaine && lang) {
        if (!hasDomaineContentInLanguage(domaine, lang)) return null
        domaine.projets = (domaine.projets || []).filter((project: any) => isProjectPublishedForLang(project, lang))
      }
      return domaine
    } catch (error: any) {
      console.warn(`[getDomaineBySlug] Tentative ${attempt}/${maxRetries} échouée:`, error?.message || error)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }
  return null
}

export async function createDomaine(data: {
  code: string
  nameFr: string
  nameEn?: string
  nameDe?: string
  subtitleFr?: string
  subtitleEn?: string
  subtitleDe?: string
  tagLabel?: string
  descFr: string
  descEn?: string
  descDe?: string
  objectivesFr?: string
  objectivesEn?: string
  objectivesDe?: string
  actionsFr?: string
  actionsEn?: string
  actionsDe?: string
  targetAudienceFr?: string
  targetAudienceEn?: string
  targetAudienceDe?: string
  icon?: string
  imageUrl?: string
  imageCaptionFr?: string
  imageCaptionEn?: string
  imageCaptionDe?: string
  imageTag?: string
  order?: number
  active?: boolean
}) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const baseSlug = slugify(data.nameFr)
    let slug = baseSlug
    let counter = 1
    while (await (prisma as any).domaine.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const domaine = await (prisma as any).domaine.create({
      data: {
        slug,
        code: data.code.toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_"),
        nameFr: data.nameFr.trim(),
        nameEn: data.nameEn?.trim() || null,
        nameDe: data.nameDe?.trim() || null,
        subtitleFr: data.subtitleFr?.trim() || null,
        subtitleEn: data.subtitleEn?.trim() || null,
        subtitleDe: data.subtitleDe?.trim() || null,
        tagLabel: data.tagLabel?.trim() || "Pôle Stratégique",
        descFr: data.descFr.trim(),
        descEn: data.descEn?.trim() || null,
        descDe: data.descDe?.trim() || null,
        objectivesFr: data.objectivesFr || "[]",
        objectivesEn: data.objectivesEn || "[]",
        objectivesDe: data.objectivesDe || "[]",
        actionsFr: data.actionsFr || "[]",
        actionsEn: data.actionsEn || "[]",
        actionsDe: data.actionsDe || "[]",
        targetAudienceFr: data.targetAudienceFr?.trim() || null,
        targetAudienceEn: data.targetAudienceEn?.trim() || null,
        targetAudienceDe: data.targetAudienceDe?.trim() || null,
        icon: data.icon || "MonitorIcon",
        imageUrl: data.imageUrl || null,
        imageCaptionFr: data.imageCaptionFr?.trim() || null,
        imageCaptionEn: data.imageCaptionEn?.trim() || null,
        imageCaptionDe: data.imageCaptionDe?.trim() || null,
        imageTag: data.imageTag || "Ancrage Terrain",
        order: Number(data.order) || 0,
        active: data.active !== undefined ? Boolean(data.active) : true,
      },
    })

    revalidatePath("/backoffice/domains")
    revalidatePath("/[lang]/domaines", "page")
    revalidatePath("/[lang]/domains", "page")
    revalidatePath("/[lang]/devenir-membre", "page")
    revalidatePath("/[lang]/projets", "page")
    return { success: true, domaine, message: "Domaine créé avec succès." }
  } catch (error: any) {
    console.error("Error creating domaine:", error)
    return { success: false, error: error.message || "Erreur lors de la création du domaine." }
  }
}

export async function updateDomaine(
  id: string,
  data: Partial<{
    nameFr: string
    nameEn: string
    nameDe: string
    subtitleFr: string
    subtitleEn: string
    subtitleDe: string
    tagLabel: string
    descFr: string
    descEn: string
    descDe: string
    objectivesFr: string
    objectivesEn: string
    objectivesDe: string
    actionsFr: string
    actionsEn: string
    actionsDe: string
    targetAudienceFr: string
    targetAudienceEn: string
    targetAudienceDe: string
    icon: string
    imageUrl: string
    imageCaptionFr: string
    imageCaptionEn: string
    imageCaptionDe: string
    imageTag: string
    order: number
    active: boolean
  }>
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const updateData: any = { ...data }
    if (data.order !== undefined) updateData.order = Number(data.order)
    if (data.active !== undefined) updateData.active = Boolean(data.active)

    const domaine = await (prisma as any).domaine.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/backoffice/domains")
    revalidatePath("/[lang]/domaines", "page")
    revalidatePath("/[lang]/domains", "page")
    revalidatePath("/[lang]/devenir-membre", "page")
    revalidatePath("/[lang]/projets", "page")
    return { success: true, domaine, message: "Domaine mis à jour avec succès." }
  } catch (error: any) {
    console.error("Error updating domaine:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function toggleDomaineActive(id: string, active: boolean) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const domaine = await (prisma as any).domaine.update({
      where: { id },
      data: { active },
    })

    revalidatePath("/backoffice/domains")
    revalidatePath("/[lang]/domaines", "page")
    revalidatePath("/[lang]/domains", "page")
    revalidatePath("/[lang]/devenir-membre", "page")
    return { success: true, message: active ? "Domaine publié." : "Domaine masqué." }
  } catch (error: any) {
    console.error("Error toggling domaine active:", error)
    return { success: false, error: error.message || "Erreur lors du changement de statut." }
  }
}

export async function deleteDomaine(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    // Vérifier si des projets sont liés
    const projectCount = await (prisma as any).projet.count({
      where: { domaineId: id },
    })

    if (projectCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer ce domaine : il est associé à ${projectCount} projet(s). Détachez ou réassignez d'abord ces projets.`,
      }
    }

    await (prisma as any).domaine.delete({
      where: { id },
    })

    revalidatePath("/backoffice/domains")
    revalidatePath("/[lang]/domaines", "page")
    revalidatePath("/[lang]/domains", "page")
    revalidatePath("/[lang]/devenir-membre", "page")
    return { success: true, message: "Domaine supprimé avec succès." }
  } catch (error: any) {
    console.error("Error deleting domaine:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

export async function reorderDomainesAction(orderedIds: string[]) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const updates = orderedIds.map((id, index) =>
      (prisma as any).domaine.update({
        where: { id },
        data: { order: index + 1 },
      })
    )
    await (prisma as any).$transaction(updates)

    revalidatePath("/backoffice/domains")
    revalidatePath("/[lang]/domaines", "page")
    revalidatePath("/[lang]/domains", "page")
    return { success: true }
  } catch (error: any) {
    console.error("Error reordering domaines:", error)
    return { success: false, error: error.message || "Erreur lors de la réorganisation." }
  }
}

export async function duplicateDomaineAction(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const source = await (prisma as any).domaine.findUnique({
      where: { id },
    })
    if (!source) {
      return { success: false, error: "Domaine source introuvable." }
    }

    const maxOrder = await (prisma as any).domaine.aggregate({
      _max: { order: true },
    })
    const nextOrder = (maxOrder?._max?.order || 0) + 1

    const baseCode = `${source.code}_COPIE`
    let code = baseCode.slice(0, 30)
    let cCounter = 1
    while (await (prisma as any).domaine.findFirst({ where: { code } })) {
      code = `${baseCode.slice(0, 25)}_${cCounter}`
      cCounter++
    }

    const baseSlug = `${source.slug}-copie`
    let slug = baseSlug
    let sCounter = 1
    while (await (prisma as any).domaine.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${sCounter}`
      sCounter++
    }

    const duplicated = await (prisma as any).domaine.create({
      data: {
        slug,
        code,
        nameFr: `${source.nameFr} (Copie)`,
        nameEn: source.nameEn ? `${source.nameEn} (Copy)` : null,
        nameDe: source.nameDe ? `${source.nameDe} (Kopie)` : null,
        subtitleFr: source.subtitleFr,
        subtitleEn: source.subtitleEn,
        subtitleDe: source.subtitleDe,
        tagLabel: source.tagLabel,
        descFr: source.descFr,
        descEn: source.descEn,
        descDe: source.descDe,
        objectivesFr: source.objectivesFr,
        objectivesEn: source.objectivesEn,
        objectivesDe: source.objectivesDe,
        actionsFr: source.actionsFr,
        actionsEn: source.actionsEn,
        actionsDe: source.actionsDe,
        targetAudienceFr: source.targetAudienceFr,
        targetAudienceEn: source.targetAudienceEn,
        targetAudienceDe: source.targetAudienceDe,
        icon: source.icon,
        imageUrl: source.imageUrl,
        imageCaptionFr: source.imageCaptionFr,
        imageCaptionEn: source.imageCaptionEn,
        imageCaptionDe: source.imageCaptionDe,
        imageTag: source.imageTag,
        order: nextOrder,
        active: false, // Inactif par défaut pour révision
      },
    })

    revalidatePath("/backoffice/domains")
    return { success: true, domaine: duplicated, message: "Domaine dupliqué avec succès." }
  } catch (error: any) {
    console.error("Error duplicating domaine:", error)
    return { success: false, error: error.message || "Erreur lors de la duplication." }
  }
}

// ─── 13. CMS : RESSOURCES DOCUMENTAIRES ──────────────────────────────────────

export async function getRessources(options?: {
  publishedOnly?: boolean
  type?: string
  lang?: string
}) {
  try {
    const where: any = {}
    if (options?.publishedOnly) {
      where.published = true
    }
    if (options?.type && options.type !== "ALL") {
      where.type = options.type
    }
    if (options?.lang) {
      where.lang = options.lang.toUpperCase()
    }

    const items = await (prisma as any).ressource.findMany({
      where,
      include: {
        domaine: {
          select: { id: true, nameFr: true, slug: true },
        },
      },
      orderBy: [
        { year: "desc" },
        { createdAt: "desc" },
      ],
    })

    return items
  } catch (error) {
    console.error("Error fetching ressources:", error)
    return []
  }
}

export async function createRessource(data: {
  title: string
  description?: string
  type: string
  year: number
  domaineId?: string | null
  fileUrl: string
  fileName: string
  fileSize?: number | null
  fileSizeStr?: string | null
  lang?: string
  published?: boolean
}) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!data.title?.trim()) {
      return { success: false, error: "Le titre de la ressource est requis." }
    }
    if (!data.fileUrl?.trim()) {
      return { success: false, error: "Le fichier PDF est requis." }
    }

    const langCode = (data.lang || "FR").toUpperCase() as any

    const ressource = await (prisma as any).ressource.create({
      data: {
        titleFr: data.title.trim(),
        titleEn: data.title.trim(),
        titleDe: data.title.trim(),
        descriptionFr: data.description?.trim() || null,
        descriptionEn: data.description?.trim() || null,
        descriptionDe: data.description?.trim() || null,
        type: data.type || "REPORT",
        year: Number(data.year) || new Date().getFullYear(),
        lang: langCode,
        fileUrl: data.fileUrl.trim(),
        fileName: data.fileName || "document.pdf",
        fileSize: data.fileSize ? Number(data.fileSize) : null,
        fileSizeStr: data.fileSizeStr || null,
        domaineId: data.domaineId || null,
        published: data.published !== undefined ? Boolean(data.published) : true,
      },
    })

    safeRevalidatePath("/backoffice/resources")
    safeRevalidatePath("/[lang]/ressources")
    safeRevalidatePath("/[lang]/resources")
    return { success: true, ressource, message: "Ressource créée avec succès." }
  } catch (error: any) {
    console.error("Error creating ressource:", error)
    return { success: false, error: error.message || "Erreur lors de la création de la ressource." }
  }
}

export async function updateRessource(
  id: string,
  data: Partial<{
    title: string
    description: string
    type: string
    year: number
    domaineId: string | null
    fileUrl: string
    fileName: string
    fileSize: number | null
    fileSizeStr: string | null
    lang: string
    published: boolean
  }>
) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const updateData: any = {}
    if (data.title !== undefined) {
      updateData.titleFr = data.title.trim()
      updateData.titleEn = data.title.trim()
      updateData.titleDe = data.title.trim()
    }
    if (data.description !== undefined) {
      updateData.descriptionFr = data.description.trim() || null
      updateData.descriptionEn = data.description.trim() || null
      updateData.descriptionDe = data.description.trim() || null
    }
    if (data.type !== undefined) updateData.type = data.type
    if (data.year !== undefined) updateData.year = Number(data.year)
    if (data.lang !== undefined) updateData.lang = data.lang.toUpperCase()
    if (data.domaineId !== undefined) updateData.domaineId = data.domaineId || null
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl
    if (data.fileName !== undefined) updateData.fileName = data.fileName
    if (data.fileSize !== undefined) updateData.fileSize = data.fileSize ? Number(data.fileSize) : null
    if (data.fileSizeStr !== undefined) updateData.fileSizeStr = data.fileSizeStr
    if (data.published !== undefined) updateData.published = Boolean(data.published)

    const ressource = await (prisma as any).ressource.update({
      where: { id },
      data: updateData,
    })

    safeRevalidatePath("/backoffice/resources")
    safeRevalidatePath("/[lang]/ressources")
    safeRevalidatePath("/[lang]/resources")
    return { success: true, ressource, message: "Ressource mise à jour avec succès." }
  } catch (error: any) {
    console.error("Error updating ressource:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function toggleRessourcePublished(id: string, published: boolean) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const ressource = await (prisma as any).ressource.update({
      where: { id },
      data: { published },
    })

    safeRevalidatePath("/backoffice/resources")
    safeRevalidatePath("/[lang]/ressources")
    safeRevalidatePath("/[lang]/resources")
    return { success: true, message: published ? "Ressource publiée." : "Ressource passée en brouillon." }
  } catch (error: any) {
    console.error("Error toggling ressource published:", error)
    return { success: false, error: error.message || "Erreur lors du changement de statut." }
  }
}

export async function deleteRessource(id: string) {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    await (prisma as any).ressource.delete({
      where: { id },
    })

    safeRevalidatePath("/backoffice/resources")
    safeRevalidatePath("/[lang]/ressources")
    safeRevalidatePath("/[lang]/resources")
    return { success: true, message: "Ressource supprimée avec succès." }
  } catch (error: any) {
    console.error("Error deleting ressource:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

// ─── HREFLANG HELPERS ────────────────────────────────────────────────────────
// Ces fonctions déterminent les langues réellement disponibles pour un contenu
// afin de générer des balises hreflang strictes (sans repli FR→EN/DE).

/**
 * Retourne la liste des langues (["FR", "EN", "DE"]) dans lesquelles
 * un article est publié et dispose d'un titre non vide.
 */
export async function getArticleAvailableLanguages(slug: string): Promise<string[]> {
  try {
    const article = await prisma.article.findFirst({
      where: { slug },
      select: { titleFr: true, titleEn: true, titleDe: true, publishedFr: true, publishedEn: true, publishedDe: true },
    })
    if (!article) return []
    const langs: string[] = []
    if ((article as any).publishedFr && (article as any).titleFr?.trim()) langs.push("FR")
    if ((article as any).publishedEn && (article as any).titleEn?.trim()) langs.push("EN")
    if ((article as any).publishedDe && (article as any).titleDe?.trim()) langs.push("DE")
    return langs
  } catch {
    return ["FR"]
  }
}

/**
 * Retourne les langues disponibles pour un domaine (slug).
 */
export async function getDomaineAvailableLanguages(slug: string): Promise<string[]> {
  try {
    const domaine = await (prisma as any).domaine.findFirst({
      where: { slug },
      select: { nameFr: true, nameEn: true, nameDe: true, active: true },
    })
    if (!domaine || !domaine.active) return []
    const langs: string[] = []
    if (domaine.nameFr?.trim()) langs.push("FR")
    if (domaine.nameEn?.trim()) langs.push("EN")
    if (domaine.nameDe?.trim()) langs.push("DE")
    return langs.length > 0 ? langs : ["FR"]
  } catch {
    return ["FR"]
  }
}

/**
 * Récupère un événement par son slug pour la langue demandée.
 * Retourne null si l'événement est inexistant, non publié,
 * ou incomplet dans la langue demandée.
 */
export async function getEventBySlug(slug: string, lang: string = "FR") {
  try {
    const l = lang.toUpperCase()
    const publishedKey = l === "EN" ? "publishedEn" : l === "DE" ? "publishedDe" : "publishedFr"
    const titleKey = l === "EN" ? "titleEn" : l === "DE" ? "titleDe" : "titleFr"
    const descKey = l === "EN" ? "descriptionEn" : l === "DE" ? "descriptionDe" : "descriptionFr"

    const event = await prisma.evenement.findFirst({
      where: {
        slug,
        published: true,
        [publishedKey]: true,
        [titleKey]: { not: "" },
        [descKey]: { not: "" },
      },
      select: {
        id: true,
        slug: true,
        titleFr: true,
        titleEn: true,
        titleDe: true,
        descriptionFr: true,
        descriptionEn: true,
        descriptionDe: true,
        programmeFr: true,
        programmeEn: true,
        programmeDe: true,
        category: true,
        categoryOther: true,
        location: true,
        startDate: true,
        endDate: true,
        isOnline: true,
        meetingUrl: true,
        registrationUrl: true,
        registrationOpen: true,
        maxParticipants: true,
        featuredImage: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        published: true,
        publishedFr: true,
        publishedEn: true,
        publishedDe: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return event ?? null
  } catch (error) {
    console.error(`Error fetching event ${slug}:`, error)
    return null
  }
}

/**
 * Retourne les langues disponibles pour un événement (slug).
 */
export async function getEventAvailableLanguages(slug: string): Promise<string[]> {
  try {
    const event = await prisma.evenement.findFirst({
      where: { slug },
      select: {
        published: true,
        publishedFr: true,
        publishedEn: true,
        publishedDe: true,
        titleFr: true,
        titleEn: true,
        titleDe: true,
        descriptionFr: true,
        descriptionEn: true,
        descriptionDe: true,
      },
    })
    if (!event || !(event as any).published) return []
    const langs: string[] = []
    if ((event as any).publishedFr && (event as any).titleFr?.trim() && (event as any).descriptionFr?.trim()) langs.push("FR")
    if ((event as any).publishedEn && (event as any).titleEn?.trim() && (event as any).descriptionEn?.trim()) langs.push("EN")
    if ((event as any).publishedDe && (event as any).titleDe?.trim() && (event as any).descriptionDe?.trim()) langs.push("DE")
    return langs.length > 0 ? langs : ["FR"]
  } catch {
    return ["FR"]
  }
}

/**
 * Retourne les langues disponibles pour un projet (slug).
 */
export async function getProjectAvailableLanguages(slug: string): Promise<string[]> {
  try {
    const project = await (prisma as any).projet.findFirst({
      where: { slug },
      select: { titleFr: true, titleEn: true, titleDe: true, published: true },
    })
    if (!project) return []
    const langs: string[] = []
    if (project.titleFr?.trim()) langs.push("FR")
    if (project.titleEn?.trim()) langs.push("EN")
    if (project.titleDe?.trim()) langs.push("DE")
    return langs.length > 0 ? langs : ["FR"]
  } catch {
    return ["FR"]
  }
}

// ─── ADMIN CREATE MEMBER ─────────────────────────────────────────────────────

/**
 * Création administrative directe d'un membre (sans demande d'adhésion).
 */
export async function adminCreateMember(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  profession?: string
  organization?: string
  country: string
  city?: string
  domainsOfInterest?: string | string[]
  contributionType?: string
  availability?: string
  motivation?: string
  membershipStatus?: string
  membershipDate?: string
  notes?: string
}) {
  "use server"
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!data.firstName?.trim() || !data.lastName?.trim() || !data.email?.trim() || !data.country?.trim()) {
      return { success: false, error: "Prénom, nom, email et pays sont obligatoires." }
    }

    const domainsArray = typeof data.domainsOfInterest === "string"
      ? data.domainsOfInterest.split(",").map((d) => d.trim()).filter(Boolean)
      : Array.isArray(data.domainsOfInterest)
      ? data.domainsOfInterest
      : []

    // Génère un numéro de référence unique
    const referenceNumber = `MBR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const member = await prisma.membre.create({
      data: {
        referenceNumber,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        profession: data.profession?.trim() || null,
        organization: data.organization?.trim() || null,
        country: data.country.trim(),
        city: data.city?.trim() || null,
        domainsOfInterest: JSON.stringify(domainsArray),
        contributionType: data.contributionType || "COMPETENCES",
        availability: data.availability || "HEBDOMADAIRE",
        motivation: data.motivation?.trim() || "Création administrative directe.",
        membershipStatus: data.membershipStatus || "ACTIVE",
        membershipDate: data.membershipDate ? new Date(data.membershipDate) : new Date(),
        notes: data.notes?.trim() || null,
      },
    })

    safeRevalidatePath("/backoffice/members")
    return { success: true, member, message: "Membre créé avec succès." }
  } catch (error: any) {
    console.error("Error creating member administratively:", error)
    if (error.code === "P2002") {
      return { success: false, error: "Un membre avec cette adresse email existe déjà." }
    }
    return { success: false, error: error.message || "Erreur lors de la création du membre." }
  }
}

export async function adminCreateCandidate(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  country: string
  city?: string
  dateOfBirth: string
  education?: string
  fieldOfStudy?: string
  profession?: string
  experienceLevel?: string
  digitalSkillLevel?: string
  skills?: string[]
  arrivalDate?: string
  duration?: string
  motivation?: string
  projectExperience?: string
  notes?: string
  status?: string
}) {
  "use server"
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!data.firstName?.trim() || !data.lastName?.trim() || !data.email?.trim() || !data.country?.trim() || !data.dateOfBirth) {
      return { success: false, error: "Prénom, nom, email, pays et date de naissance sont obligatoires." }
    }

    const referenceNumber = `CAND-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    
    // Check if candidate exists, if not create
    const email = data.email.trim().toLowerCase()
    let candidate = await prisma.candidat.findUnique({ where: { email } })
    
    if (!candidate) {
      candidate = await prisma.candidat.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email,
          phone: data.phone?.trim() || null,
          country: data.country.trim(),
          city: data.city?.trim() || null,
          dateOfBirth: new Date(data.dateOfBirth),
        }
      })
    }

    const application = await prisma.candidature.create({
      data: {
        referenceNumber,
        candidateId: candidate.id,
        status: (data.status as any) || "NEW",
        lang: "FR",
        communicationLanguage: "FR",
        education: data.education || "Non renseigné",
        fieldOfStudy: data.fieldOfStudy || "Non renseigné",
        profession: data.profession || "Non renseigné",
        experienceLevel: (data.experienceLevel as any) || "LESS_THAN_1_YEAR",
        digitalSkillLevel: data.digitalSkillLevel || "BEGINNER",
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : new Date(),
        duration: (data.duration as any) || "SIX_MONTHS",
        motivation: data.motivation?.trim() || "Création administrative directe.",
        projectExperience: data.projectExperience?.trim() || null,
        source: "Création administrative",
        consentData: true,
      }
    })

    if (data.skills && data.skills.length > 0) {
      const dbSkills = await prisma.competence.findMany({
        where: { slug: { in: data.skills } }
      })
      if (dbSkills.length > 0) {
        await prisma.competenceCandidature.createMany({
          data: dbSkills.map(s => ({
            applicationId: application.id,
            skillId: s.id
          }))
        })
      }
    }

    if (data.notes?.trim()) {
      await prisma.noteCandidature.create({
        data: {
          applicationId: application.id,
          content: data.notes.trim(),
          authorName: "Admin (Création directe)"
        }
      })
    }

    safeRevalidatePath("/backoffice/candidates")
    safeRevalidatePath("/backoffice/applications")
    return { success: true, application }
  } catch (error: any) {
    console.error("Error creating candidate administratively:", error)
    return { success: false, error: error.message || "Erreur lors de la création." }
  }
}

export async function adminCreatePartner(data: {
  orgName: string
  country: string
  website?: string
  orgType?: string
  contactPerson: string
  email: string
  phone?: string
  volunteerCount?: string
  targetCountries?: string
  programme?: string
  message?: string
}) {
  "use server"
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    if (!data.orgName?.trim() || !data.country?.trim() || !data.contactPerson?.trim() || !data.email?.trim()) {
      return { success: false, error: "Nom de l'organisation, pays, personne de contact et email sont obligatoires." }
    }

    const referenceNumber = `PART-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const partner = await prisma.partenaire.create({
      data: {
        orgName: data.orgName.trim(),
        country: data.country.trim(),
        website: data.website?.trim() || null,
        orgType: data.orgType || "NGO",
      }
    })

    const request = await prisma.demandePartenariat.create({
      data: {
        referenceNumber,
        partnerId: partner.id,
        orgName: partner.orgName,
        country: partner.country,
        website: partner.website,
        orgType: partner.orgType,
        contactPerson: data.contactPerson.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        volunteerCount: data.volunteerCount || null,
        targetCountries: data.targetCountries || null,
        programme: data.programme || null,
        message: data.message?.trim() || "Création administrative directe.",
        consent: true,
        status: "PARTNER",
      }
    })

    safeRevalidatePath("/backoffice/partners")
    safeRevalidatePath("/backoffice/partners/requests")
    return { success: true, partner, request }
  } catch (error: any) {
    console.error("Error creating partner administratively:", error)
    return { success: false, error: error.message || "Erreur lors de la création." }
  }
}

export async function getSkills() {
  "use server"
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION, skills: [] }
    }
    const skills = await prisma.competence.findMany({
      orderBy: { nameFr: 'asc' }
    })
    return { success: true, skills }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ─── NEWSLETTER EXPORTS ──────────────────────────────────────────────────────

/**
 * Exporte les abonnés newsletter au format CSV.
 */
export async function exportNewsletterSubscribersCsv(options: {
  lang?: "ALL" | "FR" | "EN" | "DE"
  activeOnly?: boolean
}): Promise<{ success: true; csv: string; filename: string; count: number } | { success: false; error: string }> {
  "use server"
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const where: { active?: boolean; lang?: LanguageCode } = {}
    if (options.activeOnly) where.active = true
    if (options.lang && options.lang !== "ALL") where.lang = options.lang as LanguageCode

    const subscribers = await prisma.newsletterAbonne.findMany({
      where,
      orderBy: [{ lang: "asc" }, { subscribedAt: "desc" }],
      select: {
        email: true,
        firstName: true,
        lang: true,
        active: true,
        consent: true,
        consentAt: true,
        consentSource: true,
        consentVersion: true,
        subscribedAt: true,
        unsubscribedAt: true,
      },
    })

    const header = "Email,Prénom,Langue,Statut,Consentement déclaré,Consentement vérifiable,Éligible campagne,Date consentement,Source consentement,Version consentement,Date d'abonnement,Date de désinscription"
    const rows = subscribers.map((s) => {
      const date = s.subscribedAt ? new Date(s.subscribedAt).toISOString().split("T")[0] : ""
      const consentDate = s.consentAt ? new Date(s.consentAt).toISOString().split("T")[0] : ""
      const verifiable = isNewsletterConsentVerifiable(s)
      const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`
      return [
        esc(s.email),
        esc(s.firstName ?? ""),
        esc(s.lang),
        esc(s.active ? "ACTIF" : "DÉSINSCRIT"),
        esc(s.consent ? "Oui" : "Non"),
        esc(verifiable ? "Oui" : "Non"),
        esc(isNewsletterEligibleForCampaign(s) ? "Oui" : "Non"),
        esc(consentDate),
        esc(s.consentSource ?? ""),
        esc(s.consentVersion ?? ""),
        esc(date),
        esc(s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString().split("T")[0] : ""),
      ].join(",")
    })

    const csv = [header, ...rows].join("\r\n")
    const langSuffix = options.lang && options.lang !== "ALL" ? `_${options.lang}` : ""
    const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const filename = `newsletter_abonnes${langSuffix}_${dateSuffix}.csv`

    return { success: true, csv, filename, count: subscribers.length }
  } catch (error: any) {
    console.error("Error exporting newsletter CSV:", error)
    return { success: false, error: error.message || "Erreur lors de l'export CSV." }
  }
}

/**
 * Exporte les abonnés newsletter actifs par langue dans une archive ZIP (base64).
 */
export async function exportNewsletterByLanguageZip(options: {
  activeOnly?: boolean
}): Promise<{ success: true; base64: string; filename: string; files: string[] } | { success: false; error: string }> {
  "use server"
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION }
    }
    const where: { active?: boolean } = {}
    if (options.activeOnly) where.active = true

    const subscribers = await prisma.newsletterAbonne.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      select: {
        email: true,
        firstName: true,
        lang: true,
        active: true,
        consent: true,
        consentAt: true,
        consentSource: true,
        consentVersion: true,
        subscribedAt: true,
        unsubscribedAt: true,
      },
    })

    // Regroupement par langue
    const byLang: Record<string, any[]> = { FR: [], EN: [], DE: [] }
    for (const s of subscribers) {
      const key = ["FR", "EN", "DE"].includes(s.lang) ? s.lang : "FR"
      byLang[key].push(s)
    }

    // Construction d'une archive ZIP simple sans dépendance native :
    // On retourne un JSON structuré encodé en base64 car jszip n'est pas disponible en RSC.
    // L'UI décode ce JSON et peut le traiter comme plusieurs fichiers CSV.
    const header = "Email,Prénom,Langue,Statut,Consentement déclaré,Consentement vérifiable,Éligible campagne,Date consentement,Source consentement,Version consentement,Date d'abonnement,Date de désinscription"
    const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`
    const makeCsv = (rows: any[]) =>
      [header, ...rows.map((s) => {
        const date = s.subscribedAt ? new Date(s.subscribedAt).toISOString().split("T")[0] : ""
        const consentDate = s.consentAt ? new Date(s.consentAt).toISOString().split("T")[0] : ""
        const verifiable = isNewsletterConsentVerifiable(s)
        return [
          esc(s.email),
          esc(s.firstName ?? ""),
          esc(s.lang),
          esc(s.active ? "ACTIF" : "DÉSINSCRIT"),
          esc(s.consent ? "Oui" : "Non"),
          esc(verifiable ? "Oui" : "Non"),
          esc(isNewsletterEligibleForCampaign(s) ? "Oui" : "Non"),
          esc(consentDate),
          esc(s.consentSource ?? ""),
          esc(s.consentVersion ?? ""),
          esc(date),
          esc(s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString().split("T")[0] : ""),
        ].join(",")
      })].join("\r\n")

    const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const filesData: { name: string; content: string }[] = []
    const fileNames: string[] = []

    for (const lang of ["FR", "EN", "DE"]) {
      if (byLang[lang].length > 0) {
        const name = `newsletter_${lang}_${dateSuffix}.csv`
        filesData.push({ name, content: makeCsv(byLang[lang]) })
        fileNames.push(name)
      }
    }

    if (filesData.length === 0) {
      return { success: false, error: "Aucun abonné actif à exporter." }
    }

    // Encodage base64 du JSON des fichiers (le client reconstruit les CSV)
    const payload = JSON.stringify(filesData)
    const base64 = Buffer.from(payload).toString("base64")
    const filename = `newsletter_export_${dateSuffix}.zip`

    return { success: true, base64, filename, files: fileNames }
  } catch (error: any) {
    console.error("Error exporting newsletter ZIP:", error)
    return { success: false, error: error.message || "Erreur lors de l'export." }
  }
}

// ─── TEAM CATEGORIES ─────────────────────────────────────────────────────────

export async function getTeamCategories() {
  try {
    if (!(await isAdminSession())) {
      return []
    }
    const categories = await prisma.categorieEquipe.findMany({
      orderBy: { order: "asc" },
    })
    if (categories && categories.length > 0) {
      return categories
    }
    // Si la table est encore vide, on retourne les catégories historiques par défaut
    return [
      { id: "DIRECTION", slug: "DIRECTION", name: "Direction", order: 1 },
      { id: "COORDINATION", slug: "COORDINATION", name: "Coordination", order: 2 },
      { id: "FORMATION", slug: "FORMATION", name: "Formation", order: 3 },
      { id: "CONSEIL", slug: "CONSEIL", name: "Conseil", order: 4 },
      { id: "VOLONTAIRE", slug: "VOLONTAIRE", name: "Volontaire", order: 5 },
    ]
  } catch {
    return [
      { id: "DIRECTION", slug: "DIRECTION", name: "Direction", order: 1 },
      { id: "COORDINATION", slug: "COORDINATION", name: "Coordination", order: 2 },
      { id: "FORMATION", slug: "FORMATION", name: "Formation", order: 3 },
      { id: "CONSEIL", slug: "CONSEIL", name: "Conseil", order: 4 },
      { id: "VOLONTAIRE", slug: "VOLONTAIRE", name: "Volontaire", order: 5 },
    ]
  }
}

export async function createTeamCategory(data: { nameFr: string; nameEn?: string; nameDe?: string; order?: number } | string) {
  "use server"
  // Compatibilité avec l'appel `createTeamCategory(name)` depuis AdminSettings
  const normalized = typeof data === "string"
    ? { nameFr: data }
    : data
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    if (!normalized.nameFr?.trim()) return { success: false, error: "Le nom (FR) est obligatoire." }
    const slug = normalized.nameFr.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").toUpperCase()
    const category = await prisma.categorieEquipe.create({
      data: {
        slug,
        name: normalized.nameFr.trim(),
        order: normalized.order ?? 99,
      },
    })
    safeRevalidatePath("/backoffice/settings")
    return { success: true, category }
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la création." }
  }
}

export async function updateTeamCategory(id: string, data: { nameFr?: string; nameEn?: string; nameDe?: string; order?: number } | string) {
  "use server"
  // Compatibilité avec l'appel `updateTeamCategory(id, name)` depuis AdminSettings
  const normalized: { nameFr?: string; name?: string; order?: number } =
    typeof data === "string"
      ? { nameFr: data, name: data }
      : { ...data, name: (data as any).name ?? data.nameFr }
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    const updateData: { name?: string; order?: number } = {}
    if (normalized.nameFr !== undefined && normalized.nameFr.trim()) {
      updateData.name = normalized.nameFr.trim()
    } else if (normalized.name !== undefined && normalized.name.trim()) {
      updateData.name = normalized.name.trim()
    }
    if (normalized.order !== undefined) {
      updateData.order = Number(normalized.order)
    }

    const category = await prisma.categorieEquipe.update({
      where: { id },
      data: updateData,
    })
    safeRevalidatePath("/backoffice/settings")
    return { success: true, category }
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteTeamCategory(id: string) {
  "use server"
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    await prisma.categorieEquipe.delete({ where: { id } })
    safeRevalidatePath("/backoffice/settings")
    return { success: true, message: "Catégorie supprimée." }
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

// ─── TÉMOIGNAGES CRUD ────────────────────────────────────────────────────────

export async function getAllTemoignages() {
  try {
    if (!(await isAdminSession())) {
      return { success: false, error: UNAUTHORIZED_ACTION, items: [] }
    }
    const items = await (prisma as any).temoignage.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    })
    return { success: true, items }
  } catch (error: any) {
    console.error("Error fetching temoignages:", error)
    return { success: false, error: error.message || "Erreur lors de la récupération.", items: [] }
  }
}

export async function createTemoignage(data: any) {
  "use server"
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    if (!data.authorName?.trim()) return { success: false, error: "Le nom de l'auteur est obligatoire." }
    if (!data.quoteFr?.trim()) return { success: false, error: "Le témoignage en français est obligatoire." }

    const item = await (prisma as any).temoignage.create({
      data: {
        authorName: data.authorName.trim(),
        authorRole: data.authorRole?.trim() || "",
        authorType: data.authorType || "VOLUNTEER",
        authorOrg: data.authorOrg?.trim() || null,
        photoUrl: data.photoUrl?.trim() || null,
        quoteFr: data.quoteFr.trim(),
        quoteEn: data.quoteEn?.trim() || null,
        quoteDe: data.quoteDe?.trim() || null,
        rating: data.rating ?? null,
        featured: data.featured ?? false,
        order: data.order ?? 0,
      },
    })
    safeRevalidatePath("/backoffice/temoignages")
    safeRevalidatePath("/[lang]")
    return { success: true, item, message: "Témoignage créé." }
  } catch (error: any) {
    console.error("Error creating temoignage:", error)
    return { success: false, error: error.message || "Erreur lors de la création." }
  }
}

export async function updateTemoignage(id: string, data: any) {
  "use server"
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    const updateData: any = {}
    if (data.authorName !== undefined) updateData.authorName = data.authorName.trim()
    if (data.authorRole !== undefined) updateData.authorRole = data.authorRole.trim()
    if (data.authorType !== undefined) updateData.authorType = data.authorType
    if (data.authorOrg !== undefined) updateData.authorOrg = data.authorOrg?.trim() || null
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl?.trim() || null
    if (data.quoteFr !== undefined) updateData.quoteFr = data.quoteFr.trim()
    if (data.quoteEn !== undefined) updateData.quoteEn = data.quoteEn?.trim() || null
    if (data.quoteDe !== undefined) updateData.quoteDe = data.quoteDe?.trim() || null
    if (data.rating !== undefined) updateData.rating = data.rating
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured)
    if (data.order !== undefined) updateData.order = Number(data.order)

    const item = await (prisma as any).temoignage.update({ where: { id }, data: updateData })
    safeRevalidatePath("/backoffice/temoignages")
    safeRevalidatePath("/[lang]")
    return { success: true, item, message: "Témoignage mis à jour." }
  } catch (error: any) {
    console.error("Error updating temoignage:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteTemoignage(id: string) {
  "use server"
  try {
    if (!(await isAdminSession())) return { success: false, error: UNAUTHORIZED_ACTION }
    await (prisma as any).temoignage.delete({ where: { id } })
    safeRevalidatePath("/backoffice/temoignages")
    safeRevalidatePath("/[lang]")
    return { success: true, message: "Témoignage supprimé." }
  } catch (error: any) {
    console.error("Error deleting temoignage:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}
