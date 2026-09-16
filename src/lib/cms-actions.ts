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
          orderBy: { order: "asc" },
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
      where.featured = true
    }
    if (options?.domaineSlug) {
      where.domaine = { slug: options.domaineSlug }
    }

    return await prisma.projet.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
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
    return await prisma.categorieArticle.findMany({
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

// ─── 9. ÉQUIPE & TROMBINOSCOPE ────────────────────────────────────────────────

export async function getTeamMembers() {
  try {
    return await prisma.membreEquipe.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    })
  } catch (error) {
    console.error("Error fetching team members:", error)
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
  contentFr: string
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
        contentFr: data.contentFr.trim(),
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
    contentFr: string
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

export async function deleteArticle(id: string) {
  try {
    await prisma.article.delete({ where: { id } })
    revalidatePath("/backoffice/articles")
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
  descriptionFr: string
  location: string
  country?: string
  status?: string
  domaineId?: string
  beneficiaries?: string
  featured?: boolean
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
        descriptionFr: data.descriptionFr.trim(),
        location: data.location.trim(),
        country: data.country || "Togo",
        status: data.status || "IN_PROGRESS",
        domaineId: data.domaineId || null,
        beneficiaries: data.beneficiaries?.trim() || null,
        featured: Boolean(data.featured),
        featuredImage: data.featuredImage || null,
      },
    })

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
  descriptionFr: string
  category: string
  location: string
  startDate: Date
  endDate?: Date
  isOnline?: boolean
  meetingUrl?: string
  registrationUrl?: string
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
        descriptionFr: data.descriptionFr.trim(),
        category: data.category || "WORKSHOP",
        location: data.location.trim(),
        startDate: data.startDate,
        endDate: data.endDate || null,
        isOnline: Boolean(data.isOnline),
        meetingUrl: data.meetingUrl?.trim() || null,
        registrationUrl: data.registrationUrl?.trim() || null,
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
