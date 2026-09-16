import type { LanguageCode } from "@prisma/client"

export type ContributionType = "COMPETENCES" | "FINANCIER" | "VOLONTARIAT" | "RESEAU" | "AUTRE"
export type AvailabilityType = "HEBDOMADAIRE" | "MENSUEL" | "PONCTUEL" | "TEMPS_PLEIN"
export type MemberStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "ALUMNI"

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED"
export type EventCategory = "WORKSHOP" | "TRAINING" | "CONFERENCE" | "HACKATHON" | "CEREMONY"
export type ResourceType = "REPORT" | "GUIDE" | "BROCHURE" | "PROJECT_SHEET" | "POLICY" | "STATUTE"
export type MediaType = "PHOTO" | "VIDEO"
export type TeamCategory = "DIRECTION" | "COORDINATION" | "FORMATION" | "CONSEIL" | "VOLONTAIRE"
export type TestimonialType = "BENEFICIARY" | "VOLUNTEER" | "PARTNER" | "TRAINER"

export interface DomaineDTO {
  id: string
  slug: string
  code: string
  nameFr: string
  nameEn: string
  nameDe: string
  descFr: string
  descEn: string
  descDe: string
  icon?: string | null
  color?: string | null
  order: number
  active: boolean
  _count?: {
    projets: number
    ressources: number
  }
}

export interface MemberApplicationDTO {
  id: string
  referenceNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  profession?: string | null
  organization?: string | null
  country: string
  city?: string | null
  domainsOfInterest: string[]
  contributionType: ContributionType
  availability: AvailabilityType
  motivation: string
  status: MemberStatus
  membershipDate?: Date | null
  notes?: string | null
  consentData: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ArticleDTO {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  excerptFr: string
  excerptEn?: string | null
  excerptDe?: string | null
  contentFr: string
  contentEn?: string | null
  contentDe?: string | null
  featuredImage?: string | null
  published: boolean
  publishedAt?: Date | null
  categoryId?: string | null
  category?: {
    id: string
    slug: string
    nameFr: string
    nameEn: string
    nameDe: string
  } | null
  authorName?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  tags?: string[]
  viewsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectDTO {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  summaryFr: string
  summaryEn?: string | null
  summaryDe?: string | null
  descriptionFr: string
  descriptionEn?: string | null
  descriptionDe?: string | null
  location: string
  country: string
  startDate?: Date | null
  endDate?: Date | null
  status: ProjectStatus
  featuredImage?: string | null
  gallery?: string[]
  objectives?: string | null
  results?: string | null
  beneficiaries?: string | null
  budget?: string | null
  domaineId?: string | null
  domaine?: {
    id: string
    slug: string
    nameFr: string
    nameEn: string
    nameDe: string
    icon?: string | null
  } | null
  featured: boolean
  order: number
  createdAt: Date
}

export interface EventDTO {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr: string
  descriptionEn?: string | null
  descriptionDe?: string | null
  category: EventCategory
  location: string
  startDate: Date
  endDate?: Date | null
  isOnline: boolean
  meetingUrl?: string | null
  registrationUrl?: string | null
  registrationOpen: boolean
  maxParticipants?: number | null
  featuredImage?: string | null
  published: boolean
}

export interface ResourceDTO {
  id: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  type: ResourceType
  year: number
  fileUrl: string
  fileName: string
  fileSize?: number | null
  mimeType?: string | null
  domaineId?: string | null
  domaine?: {
    id: string
    nameFr: string
    nameEn: string
    nameDe: string
  } | null
  downloadCount: number
  published: boolean
  createdAt: Date
}

export interface MediaDTO {
  id: string
  title: string
  caption?: string | null
  url: string
  thumbnailUrl?: string | null
  type: MediaType
  album?: string | null
  category?: string | null
  order: number
  featured: boolean
}

export interface TeamMemberDTO {
  id: string
  name: string
  roleFr: string
  roleEn?: string | null
  roleDe?: string | null
  category: TeamCategory
  bioFr?: string | null
  bioEn?: string | null
  bioDe?: string | null
  photoUrl?: string | null
  email?: string | null
  linkedin?: string | null
  twitter?: string | null
  skills?: string[]
  order: number
  active: boolean
}

export interface TestimonialDTO {
  id: string
  authorName: string
  authorRole: string
  authorType: TestimonialType
  authorOrg?: string | null
  photoUrl?: string | null
  quoteFr: string
  quoteEn?: string | null
  quoteDe?: string | null
  rating?: number | null
  featured: boolean
  order: number
}
