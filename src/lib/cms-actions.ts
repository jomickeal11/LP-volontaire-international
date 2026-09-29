"use server"

import prisma from "./prisma"
import {
  memberApplicationSchema,
  newsletterSubscriptionSchema,
  institutionalContactSchema,
  teamMemberCreateSchema,
  teamMemberUpdateSchema,
  teamMemberReorderSchema,
} from "./cms-validations"
import { verifySession } from "./auth"
import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import type { LanguageCode } from "@prisma/client"
import type { TeamMemberDTO } from "./cms-types"

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

// ─── 1. MEMBRES (Demande d'adhésion & Répertoire) ─────────────────────────────

export async function submitMemberApplication(formData: unknown) {
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

    const { email, firstName, lang, consent } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    await prisma.newsletterAbonne.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        firstName: firstName?.trim() || null,
        lang: lang as LanguageCode,
        consent,
        active: true,
      },
      update: {
        firstName: firstName?.trim() || undefined,
        lang: lang as LanguageCode,
        active: true,
      },
    })

    return {
      success: true,
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
export async function getArticleBySlug(slug: string, lang: string) {
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
    if (article) {
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
}) {
  try {
    const where: any = { published: true }

    if (options?.upcomingOnly) {
      where.startDate = { gte: new Date() }
    }
    if (options?.category) {
      where.category = options.category
    }

    return await prisma.evenement.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: options?.limit,
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

// ─── 8. GALERIE MÉDIAS ────────────────────────────────────────────────────────

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

    return await prisma.media.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: options?.limit,
    })
  } catch (error) {
    console.error("Error fetching media:", error)
    return []
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

    // Enregistrer l'événement de communication dans EmailLog pour traçabilité
    try {
      await prisma.emailLog.create({
        data: {
          recipient: member.email,
          recipientName: `${member.firstName} ${member.lastName}`,
          subject: `Bienvenue au sein d'APTIC-R - Adhésion confirmée (${member.referenceNumber})`,
          bodyHtml: `<p>Bonjour ${member.firstName},</p><p>Nous avons le plaisir de vous informer que votre demande d'adhésion a été validée. Votre référence membre officielle est <strong>${member.referenceNumber}</strong>.</p>`,
          status: "SENT",
          actionType: "MEMBER_CONFIRMATION",
          templateKey: "MEMBER_WELCOME",
          metadata: {
            applicationId: application.id,
            memberId: member.id,
            memberReference: member.referenceNumber,
            applicationReference: application.referenceNumber,
          },
        },
      })
    } catch (logErr) {
      console.warn("Could not log member welcome email in EmailLog:", logErr)
    }

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      member,
      application: updatedApplication,
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
    const application = await prisma.demandeAdhesion.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { success: false, error: "Demande d'adhésion introuvable." }
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

    safeRevalidatePath("/backoffice/members")
    safeRevalidatePath("/backoffice/members/applications")

    return {
      success: true,
      application: updated,
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
}) {
  try {
    const baseSlug = slugify(data.titleFr)
    let slug = baseSlug
    let counter = 1
    while (await prisma.projet.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const projet = await prisma.projet.create({
      data: {
        slug,
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
        publishedFr: data.publishedFr !== undefined ? Boolean(data.publishedFr) : true,
        publishedEn: data.publishedEn !== undefined ? Boolean(data.publishedEn) : false,
        publishedDe: data.publishedDe !== undefined ? Boolean(data.publishedDe) : false,
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
      await prisma.projet.updateMany({
        where: { id: { not: projet.id } },
        data: { isFeatured: false },
      })
    }

    revalidatePath("/backoffice/projects")
    revalidatePath("/[lang]/projets", "page")
    revalidatePath(`/[lang]/projets/${slug}`, "page")
    return { success: true, project: projet }
  } catch (error: any) {
    console.error("Error creating project:", error)
    return { success: false, error: error.message || "Erreur lors de la création du projet." }
  }
}

export async function updateProject(id: string, data: any) {
  try {
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
  titleEn?: string
  titleDe?: string
  descriptionFr: string
  descriptionEn?: string
  descriptionDe?: string
  category: string
  location: string
  startDate: Date
  endDate?: Date
  isOnline?: boolean
  meetingUrl?: string
  registrationUrl?: string
  featuredImage?: string
  published?: boolean
}) {
  try {
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
        descriptionFr: data.descriptionFr.trim(),
        descriptionEn: data.descriptionEn?.trim() || null,
        descriptionDe: data.descriptionDe?.trim() || null,
        category: data.category || "WORKSHOP",
        location: data.location.trim(),
        startDate: data.startDate,
        endDate: data.endDate || null,
        isOnline: Boolean(data.isOnline),
        meetingUrl: data.meetingUrl?.trim() || null,
        registrationUrl: data.registrationUrl?.trim() || null,
        featuredImage: data.featuredImage || null,
        published: data.published !== false,
      },
    })

    revalidatePath("/backoffice/events")
    return { success: true, event }
  } catch (error: any) {
    console.error("Error creating event:", error)
    return { success: false, error: error.message || "Erreur lors de la création de l'événement." }
  }
}

export async function updateEvent(id: string, data: any) {
  try {
    const event = await prisma.evenement.update({
      where: { id },
      data,
    })
    revalidatePath("/backoffice/events")
    return { success: true, event }
  } catch (error: any) {
    console.error("Error updating event:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour de l'événement." }
  }
}

export async function deleteEvent(id: string) {
  try {
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

    return await prisma.newsletterAbonne.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return []
  }
}

export async function toggleNewsletterSubscriberStatus(id: string) {
  try {
    const subscriber = await prisma.newsletterAbonne.findUnique({ where: { id } })
    if (!subscriber) return { success: false, error: "Abonné introuvable" }

    const updated = await prisma.newsletterAbonne.update({
      where: { id },
      data: {
        active: !subscriber.active,
        unsubscribedAt: subscriber.active ? new Date() : null,
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
    await prisma.newsletterAbonne.delete({ where: { id } })
    revalidatePath("/backoffice/newsletter")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting subscriber:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}

export async function adminAddNewsletterSubscriber(data: {
  email: string
  firstName?: string
  lang?: LanguageCode
}) {
  try {
    const normalizedEmail = data.email.toLowerCase().trim()
    const existing = await prisma.newsletterAbonne.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (!existing.active) {
        await prisma.newsletterAbonne.update({
          where: { id: existing.id },
          data: {
            active: true,
            unsubscribedAt: null,
            firstName: data.firstName?.trim() || existing.firstName,
            lang: data.lang || existing.lang,
          },
        })
        revalidatePath("/backoffice/newsletter")
        return { success: true, message: "L'abonné existant a été réactivé." }
      }
      return { success: false, error: "Cet email est déjà abonné." }
    }

    await prisma.newsletterAbonne.create({
      data: {
        email: normalizedEmail,
        firstName: data.firstName?.trim() || null,
        lang: data.lang || "FR",
        active: true,
        consent: true,
      },
    })

    revalidatePath("/backoffice/newsletter")
    return { success: true, message: "Abonné ajouté avec succès." }
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

    const domaines = await (prisma as any).domaine.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        projets: {
          select: {
            id: true,
            slug: true,
            titleFr: true,
            titleEn: true,
            titleDe: true,
            summaryFr: true,
            summaryEn: true,
            summaryDe: true,
            status: true,
            featuredImage: true,
            location: true,
          },
        },
      },
    })
    return options?.lang ? domaines.filter((domaine: any) => hasDomaineContentInLanguage(domaine, options.lang!)) : domaines
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


