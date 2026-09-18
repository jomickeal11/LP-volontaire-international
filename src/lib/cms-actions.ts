"use server"

import prisma from "./prisma"
import { memberApplicationSchema, newsletterSubscriptionSchema, institutionalContactSchema } from "./cms-validations"
import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import type { LanguageCode } from "@prisma/client"

function generateMemberReference(): string {
  const year = new Date().getFullYear()
  const randomStr = randomBytes(2).toString("hex").toUpperCase()
  return `MBR-${year}-${randomStr}`
}

// ─── 1. MEMBRES (Adhésion) ───────────────────────────────────────────────────

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

    // Vérifier si une demande avec cet email existe déjà
    const existing = await prisma.membre.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return {
        success: false,
        error: "Une demande d'adhésion ou un compte membre existe déjà avec cette adresse email.",
      }
    }

    const referenceNumber = generateMemberReference()

    const member = await prisma.membre.create({
      data: {
        referenceNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
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
      },
    })

    return {
      success: true,
      referenceNumber: member.referenceNumber,
      message: "Votre demande d'adhésion a été enregistrée avec succès.",
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

// ─── 3. DOMAINES D'INTERVENTION ───────────────────────────────────────────────

export async function getDomaines() {
  try {
    return await prisma.domaine.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            projets: true,
            ressources: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error fetching domaines:", error)
    return []
  }
}

export async function getDomaineBySlug(slug: string) {
  try {
    return await prisma.domaine.findUnique({
      where: { slug },
      include: {
        projets: {
          orderBy: { displayOrder: "asc" },
        },
        ressources: {
          where: { published: true },
          orderBy: { year: "desc" },
        },
      },
    })
  } catch (error) {
    console.error(`Error fetching domaine ${slug}:`, error)
    return null
  }
}

// ─── 4. PROJETS ───────────────────────────────────────────────────────────────

export async function getProjects(options?: {
  domaineSlug?: string
  status?: string
  featuredOnly?: boolean
  limit?: number
}) {
  try {
    const where: any = {}

    if (options?.status) {
      where.status = options.status
    }
    if (options?.featuredOnly) {
      where.isFeatured = true
    }
    if (options?.domaineSlug) {
      where.domaine = { slug: options.domaineSlug }
    }

    return await prisma.projet.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: options?.limit,
      include: {
        domaine: {
          select: {
            id: true,
            slug: true,
            nameFr: true,
            nameEn: true,
            nameDe: true,
            icon: true,
            color: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    return await prisma.projet.findUnique({
      where: { slug },
      include: {
        domaine: true,
      },
    })
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error)
    return null
  }
}

// ─── 5. ARTICLES & ACTUALITÉS ─────────────────────────────────────────────────

export async function getArticles(options?: {
  categorySlug?: string
  publishedOnly?: boolean
  limit?: number
  skip?: number
}) {
  try {
    const where: any = {}
    if (options?.publishedOnly !== false) {
      where.published = true
    }
    if (options?.categorySlug) {
      where.category = { slug: options.categorySlug }
    }

    return await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: options?.limit,
      skip: options?.skip,
      include: {
        category: true,
      },
    })
  } catch (error) {
    console.error("Error fetching articles:", error)
    return []
  }
}

export async function getArticleBySlug(slug: string) {
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

// ─── 11. ADMIN : GESTION DES MEMBRES ─────────────────────────────────────────

export async function getMembers(options?: {
  status?: string
  search?: string
  limit?: number
  skip?: number
}) {
  try {
    const where: any = {}

    if (options?.status && options.status !== "ALL") {
      where.status = options.status
    }

    if (options?.search) {
      const q = options.search.trim()
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { referenceNumber: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
        { organization: { contains: q, mode: "insensitive" } },
      ]
    }

    return await prisma.membre.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit,
      skip: options?.skip,
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return []
  }
}

export async function updateMemberStatus(id: string, status: string, notes?: string) {
  try {
    const updated = await prisma.membre.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        membershipDate: status === "APPROVED" ? new Date() : undefined,
      },
    })

    revalidatePath("/backoffice/members")
    return { success: true, member: updated }
  } catch (error: any) {
    console.error("Error updating member status:", error)
    return { success: false, error: error.message || "Impossible de mettre à jour le statut." }
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
  featuredImage?: string
  published?: boolean
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
      data: {
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
        featuredImage: data.featuredImage || null,
        published: Boolean(data.published),
        publishedAt: data.published ? new Date() : null,
        metaTitle: data.metaTitle?.trim() || null,
        metaDescription: data.metaDescription?.trim() || null,
      },
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
    featuredImage?: string
    published: boolean
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
    if (data.published && !existing.publishedAt) {
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
  location: string
  country?: string
  status?: string
  domaineId?: string
  beneficiaries?: string
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
        location: data.location.trim(),
        country: data.country || "Togo",
        status: data.status || "IN_PROGRESS",
        domaineId: data.domaineId || null,
        beneficiaries: data.beneficiaries?.trim() || null,
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
    settings.forEach((s: any) => {
      dict[s.key] = s.value
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
  entries: { key: string; value: string; group?: string; description?: string }[]
) {
  try {
    for (const item of entries) {
      await (prisma as any).parametreSite.upsert({
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
    }

    revalidatePath("/backoffice/settings")
    revalidatePath("/[lang]/a-propos", "page")
    revalidatePath("/[lang]/contact", "page")
    revalidatePath("/[lang]", "page")
    return { success: true, message: "Paramètres enregistrés avec succès." }
  } catch (error: any) {
    console.error("Error updating site settings:", error)
    return { success: false, error: error.message || "Erreur lors de l'enregistrement des paramètres." }
  }
}

// ─── 17. CMS : ÉQUIPE & GOUVERNANCE (MembreEquipe) ───────────────────────────

export const DEFAULT_TEAM_MEMBERS = [
  {
    name: "Kokouvi Mensah",
    roleFr: "Président & Fondateur d'APTIC-R",
    roleEn: "President & Founder of APTIC-R",
    roleDe: "Präsident & Gründer von APTIC-R",
    category: "DIRECTION",
    bioFr:
      "Ingénieur en systèmes d'information formé à Lomé et à Dakar. Engagé depuis plus de 10 ans pour le désenclavement numérique et l'accès universel aux technologies en milieu rural, il coordonne les partenariats stratégiques et porte la vision institutionnelle de l'association.",
    bioEn:
      "Information Systems Engineer trained in Lomé and Dakar. Dedicated for over a decade to digital inclusion and rural technology access across West Africa, leading strategic partnerships and institutional development.",
    bioDe:
      "IT-Ingenieur mit Ausbildung in Lomé und Dakar. Seit über 10 Jahren engagiert für digitale Inklusion im ländlichen Raum, strategische Partnerschaften und Organisationsentwicklung.",
    email: "direction@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Gouvernance", "Stratégie IT", "Plaidoyer institutionnel", "Partenariats"]),
    order: 1,
    active: true,
  },
  {
    name: "Afiwa Lawson",
    roleFr: "Coordinatrice des Programmes & Ingénierie Pédagogique",
    roleEn: "Program & Pedagogy Coordinator",
    roleDe: "Programm- & Pädagogikkoordinatorin",
    category: "COORDINATION",
    bioFr:
      "Spécialiste de l'éducation populaire et de l'ingénierie pédagogique. Elle conçoit les parcours de formation numérique, supervise les formateurs et assure l'accueil et le suivi des volontaires internationaux à Agbélouvé.",
    bioEn:
      "Expert in grassroots education and pedagogical engineering. She designs training curricula, supervises trainers, and oversees international volunteer onboarding in Agbélouvé.",
    bioDe:
      "Expertin für Pädagogik und Bildungsprogramme. Zuständig für Lehrpläne, Ausbilder und die Betreuung internationaler Freiwilliger vor Ort.",
    email: "programmes@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Ingénierie pédagogique", "Coordination", "Égalité F/H"]),
    order: 2,
    active: true,
  },
  {
    name: "Kodjo Agbodjan",
    roleFr: "Responsable Technique & FabLab Rural",
    roleEn: "Technical & Rural FabLab Lead",
    roleDe: "Technischer Leiter & FabLab",
    category: "FORMATION",
    bioFr:
      "Maker et électronicien passionné, spécialiste du prototypage Arduino/Raspberry Pi, de l'impression 3D et de la maintenance d'équipements reconditionnés à basse consommation énergétique adaptés au milieu rural.",
    bioEn:
      "Passionate maker and electronics technician specializing in Arduino/Raspberry Pi prototyping, 3D printing, and maintenance of energy-efficient refurbished hardware.",
    bioDe:
      "Maker und Techniker, spezialisiert auf 3D-Druck, Arduino/Raspberry Pi und nachhaltige Hardware-Wartung für ländliche Gebiete.",
    email: "fablab@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["FabLab & Prototypage", "Impression 3D", "Low-Tech"]),
    order: 3,
    active: true,
  },
  {
    name: "Essivi Kpogo",
    roleFr: "Chargée de Mobilisation Communautaire & Genre",
    roleEn: "Community Engagement & Gender Officer",
    roleDe: "Referentin für Gemeindeengagement & Gleichstellung",
    category: "COORDINATION",
    bioFr:
      "Travailleuse sociale et animatrice de terrain, elle coordonne les relations avec les groupements de femmes maraîchères et anime le programme d'initiation au numérique « Elles Codent pour le Changement ».",
    bioEn:
      "Social worker and community organizer leading partnerships with women farming cooperatives and coordinating the 'Girls Code for Change' empowerment initiative.",
    bioDe:
      "Sozialarbeiterin und Koordinatorin für Frauenkooperativen und das Bildungsprogramm für Mädchen und Frauen im ländlichen Raum.",
    email: "communaute@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Animation rurale", "Autonomisation des femmes", "Médiation"]),
    order: 4,
    active: true,
  },
  {
    name: "Dr. Yao Tete",
    roleFr: "Conseiller Scientifique & Agro-écologie",
    roleEn: "Scientific & Agro-Ecology Advisor",
    roleDe: "Wissenschaftlicher Berater & Agrarökologie",
    category: "CONSEIL",
    bioFr:
      "Enseignant-chercheur agronome, il oriente les projets appliqués d'APTIC-R sur la résilience climatique, la régénération des sols et l'intégration de capteurs d'irrigation solaire Low-Tech.",
    bioEn:
      "Agronomy researcher advising APTIC-R projects on climate resilience, soil regeneration, and solar-powered Low-Tech irrigation sensors.",
    bioDe:
      "Agrarwissenschaftler mit Schwerpunkt auf Klimaresilienz, Bodenfruchtbarkeit und sparsamer solarer Bewässerungstechnik.",
    email: "conseil@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Agro-écologie", "Recherche appliquée", "Climat"]),
    order: 5,
    active: true,
  },
  {
    name: "Léa Dupont",
    roleFr: "Volontaire Internationale — UI/UX & Design Numérique",
    roleEn: "International Volunteer — UI/UX & Digital Design",
    roleDe: "Internationale Freiwillige — UI/UX & Webdesign",
    category: "VOLONTAIRE",
    bioFr:
      "Designer d'interface diplômée, en mission de volontariat à Agbélouvé pour former les jeunes aux fondamentaux du design graphique, du prototypage web et documenter les actions du FabLab.",
    bioEn:
      "UX/UI designer on a volunteer mission in Agbélouvé, mentoring youth in visual design and web prototyping while documenting local FabLab projects.",
    bioDe:
      "UX/UI-Designerin im Freiwilligendienst in Agbélouvé zur Ausbildung junger Menschen in Webdesign und Mediengestaltung.",
    email: "volontariat@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["UI/UX Design", "Formation & Mentorat", "Documentation"]),
    order: 6,
    active: true,
  },
]

export async function getTeamMembers(options?: { category?: string; activeOnly?: boolean }) {
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

    // Seed initial members if database is empty
    if (members.length === 0 && !options?.category) {
      for (const m of DEFAULT_TEAM_MEMBERS) {
        await (prisma as any).membreEquipe.create({
          data: m,
        })
      }
      members = await (prisma as any).membreEquipe.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })
    }

    return { success: true, members }
  } catch (error: any) {
    console.error("Error fetching team members:", error)
    return { success: false, members: [] }
  }
}

export async function createTeamMember(data: {
  name: string
  roleFr: string
  roleEn?: string
  roleDe?: string
  category: string
  bioFr?: string
  bioEn?: string
  bioDe?: string
  photoUrl?: string
  email?: string
  skills?: string[] | string
  order?: number
  active?: boolean
}) {
  try {
    if (!data.name || !data.roleFr || !data.category) {
      return { success: false, error: "Nom, fonction et rôle/catégorie sont obligatoires." }
    }

    const skillsStr = Array.isArray(data.skills)
      ? JSON.stringify(data.skills)
      : typeof data.skills === "string"
      ? data.skills
      : "[]"

    const member = await (prisma as any).membreEquipe.create({
      data: {
        name: data.name.trim(),
        roleFr: data.roleFr.trim(),
        roleEn: data.roleEn?.trim() || null,
        roleDe: data.roleDe?.trim() || null,
        category: data.category,
        bioFr: data.bioFr?.trim() || null,
        bioEn: data.bioEn?.trim() || null,
        bioDe: data.bioDe?.trim() || null,
        photoUrl: data.photoUrl?.trim() || null,
        email: data.email?.toLowerCase().trim() || null,
        skills: skillsStr,
        order: Number(data.order) || 0,
        active: data.active !== undefined ? Boolean(data.active) : true,
      },
    })

    revalidatePath("/backoffice/settings")
    revalidatePath("/backoffice/team")
    revalidatePath("/[lang]/equipe", "page")
    revalidatePath("/[lang]/team", "page")
    return { success: true, member, message: "Membre ajouté avec succès." }
  } catch (error: any) {
    console.error("Error creating team member:", error)
    return { success: false, error: error.message || "Erreur lors de la création du membre." }
  }
}

export async function updateTeamMember(
  id: string,
  data: {
    name?: string
    roleFr?: string
    roleEn?: string
    roleDe?: string
    category?: string
    bioFr?: string
    bioEn?: string
    bioDe?: string
    photoUrl?: string
    email?: string
    skills?: string[] | string
    order?: number
    active?: boolean
  }
) {
  try {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.roleFr !== undefined) updateData.roleFr = data.roleFr.trim()
    if (data.roleEn !== undefined) updateData.roleEn = data.roleEn?.trim() || null
    if (data.roleDe !== undefined) updateData.roleDe = data.roleDe?.trim() || null
    if (data.category !== undefined) updateData.category = data.category
    if (data.bioFr !== undefined) updateData.bioFr = data.bioFr?.trim() || null
    if (data.bioEn !== undefined) updateData.bioEn = data.bioEn?.trim() || null
    if (data.bioDe !== undefined) updateData.bioDe = data.bioDe?.trim() || null
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl?.trim() || null
    if (data.email !== undefined) updateData.email = data.email?.toLowerCase().trim() || null
    if (data.skills !== undefined) {
      updateData.skills = Array.isArray(data.skills)
        ? JSON.stringify(data.skills)
        : typeof data.skills === "string"
        ? data.skills
        : "[]"
    }
    if (data.order !== undefined) updateData.order = Number(data.order)
    if (data.active !== undefined) updateData.active = Boolean(data.active)

    const updated = await (prisma as any).membreEquipe.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/backoffice/settings")
    revalidatePath("/backoffice/team")
    revalidatePath("/[lang]/equipe", "page")
    revalidatePath("/[lang]/team", "page")
    return { success: true, member: updated, message: "Membre mis à jour avec succès." }
  } catch (error: any) {
    console.error("Error updating team member:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour." }
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await (prisma as any).membreEquipe.delete({
      where: { id },
    })

    revalidatePath("/backoffice/settings")
    revalidatePath("/backoffice/team")
    revalidatePath("/[lang]/equipe", "page")
    revalidatePath("/[lang]/team", "page")
    return { success: true, message: "Membre supprimé avec succès." }
  } catch (error: any) {
    console.error("Error deleting team member:", error)
    return { success: false, error: error.message || "Erreur lors de la suppression." }
  }
}
