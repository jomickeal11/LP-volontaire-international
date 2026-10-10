import { z } from "zod"

export const memberApplicationSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  country: z.string().min(2, "Veuillez sélectionner un pays"),
  city: z.string().optional().nullable(),
  domainsOfInterest: z.array(z.string()).min(1, "Veuillez sélectionner au moins un domaine d'intérêt"),
  contributionType: z.enum(["COMPETENCES", "FINANCIER", "VOLONTARIAT", "RESEAU", "AUTRE"]),
  availability: z.enum(["HEBDOMADAIRE", "MENSUEL", "PONCTUEL", "TEMPS_PLEIN"]),
  motivation: z.string().min(30, "Votre motivation doit comporter au moins 30 caractères").max(3000),
  consentData: z.boolean().refine(val => val === true, "Le consentement est obligatoire"),
})

export type MemberApplicationInput = z.infer<typeof memberApplicationSchema>

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().max(254, "Adresse email trop longue").email("Adresse email invalide"),
  firstName: z.string().trim().min(1, "Le prénom est obligatoire").max(80, "Le prénom est trop long"),
  lang: z.enum(["FR", "EN", "DE"]).default("FR"),
  consent: z.boolean().refine(val => val === true, "Le consentement est obligatoire"),

  // Attribution UTM first-touch (facultative, non bloquante)
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
})

export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>

export const adminNewsletterSubscriberSchema = z.object({
  email: z.string().trim().max(254, "Adresse email trop longue").email("Adresse email invalide"),
  firstName: z.string().trim().max(80, "Le prénom est trop long").optional(),
  lang: z.enum(["FR", "EN", "DE"]).default("FR"),
  consent: z.boolean().refine(val => val === true, "Le consentement explicite est obligatoire"),
})

export type AdminNewsletterSubscriberInput = z.infer<typeof adminNewsletterSubscriberSchema>

export const newsletterCampaignSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, "Le nom de la campagne est obligatoire").max(120),
  lang: z.enum(["FR", "EN", "DE"]),
  subjectFr: z.string().trim().max(200).refine((value) => !/[\r\n]/.test(value), "Le sujet ne peut contenir de retour à la ligne"),
  subjectEn: z.string().trim().max(200).refine((value) => !/[\r\n]/.test(value), "Le sujet ne peut contenir de retour à la ligne"),
  subjectDe: z.string().trim().max(200).refine((value) => !/[\r\n]/.test(value), "Le sujet ne peut contenir de retour à la ligne"),
  contentFr: z.string().max(30_000),
  contentEn: z.string().max(30_000),
  contentDe: z.string().max(30_000),
})

export const newsletterCampaignTestEmailSchema = z.object({
  campaignId: z.string().trim().min(1),
  recipient: z.string().trim().max(254).email("Adresse email invalide"),
})

export const newsletterCampaignLaunchSchema = z.object({ campaignId: z.string().trim().min(1) })

export type NewsletterCampaignInput = z.infer<typeof newsletterCampaignSchema>

export const institutionalContactSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  subject: z.string().min(3, "Le sujet doit comporter au moins 3 caractères"),
  message: z.string().min(20, "Le message doit comporter au moins 20 caractères"),
  organization: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  consent: z.boolean().refine(val => val === true, "Le consentement est obligatoire"),
})

export type InstitutionalContactInput = z.infer<typeof institutionalContactSchema>

/**
 * Demande de participation à un événement.
 *
 * Le téléphone est obligatoire (APTIC-R doit pouvoir joindre la personne pour
 * confirmer) ; organisation, ville, pays et message restent facultatifs.
 * Une demande n'est JAMAIS une inscription : aucun champ de place n'existe ici,
 * et le serveur ne lit jamais un compteur transmis par le navigateur.
 */
export const eventParticipationRequestSchema = z.object({
  eventId: z.string().trim().min(1, "L'événement est obligatoire"),
  firstName: z.string().trim().min(1, "Le prénom est obligatoire").max(80, "Le prénom est trop long"),
  lastName: z.string().trim().min(1, "Le nom est obligatoire").max(80, "Le nom est trop long"),
  email: z.string().trim().email("Adresse email invalide").max(254, "L'adresse email est trop longue"),
  phone: z
    .string()
    .trim()
    .min(6, "Le numéro de téléphone est obligatoire")
    .max(40, "Le numéro de téléphone est trop long"),
  organization: z.string().trim().max(160, "L'organisation est trop longue").optional().nullable(),
  city: z.string().trim().max(120, "La ville est trop longue").optional().nullable(),
  country: z.string().trim().max(120, "Le pays est trop long").optional().nullable(),
  message: z.string().trim().max(2000, "Le message ne peut pas dépasser 2 000 caractères").optional().nullable(),
  lang: z.enum(["FR", "EN", "DE"]).default("FR"),
  consent: z.boolean().refine((value) => value === true, "Le consentement est obligatoire"),
})

export type EventParticipationRequestInput = z.infer<typeof eventParticipationRequestSchema>

const teamCategorySchema = z.enum(["DIRECTION", "COORDINATION", "FORMATION", "CONSEIL", "VOLONTAIRE"])
const teamEmailSchema = z
  .string()
  .trim()
  .max(254, "L'email professionnel est trop long")
  .refine((value) => value === "" || z.string().email().safeParse(value).success, "Adresse email invalide")
const teamSkillSchema = z.string().trim().min(1, "Une compétence ne peut pas être vide").max(80, "Une compétence ne peut pas dépasser 80 caractères")
const teamSkillsSchema = z.array(teamSkillSchema).max(12, "Douze compétences maximum")

export const teamMemberCreateSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est obligatoire").max(80, "Le prénom est trop long"),
  lastName: z.string().trim().min(1, "Le nom est obligatoire").max(80, "Le nom est trop long"),
  roleFr: z.string().trim().min(1, "La fonction en français est obligatoire").max(200, "La fonction est trop longue"),
  roleEn: z.string().trim().max(200, "La fonction anglaise est trop longue").optional(),
  roleDe: z.string().trim().max(200, "La fonction allemande est trop longue").optional(),
  category: teamCategorySchema,
  bioFr: z.string().trim().min(1, "La biographie en français est obligatoire").max(1500, "La biographie ne peut pas dépasser 1 500 caractères"),
  bioEn: z.string().trim().max(1500, "La biographie anglaise ne peut pas dépasser 1 500 caractères").optional(),
  bioDe: z.string().trim().max(1500, "La biographie allemande ne peut pas dépasser 1 500 caractères").optional(),
  photoUrl: z.string().trim().min(1, "La photo de profil est obligatoire").max(2048, "L'adresse de la photo est trop longue"),
  email: teamEmailSchema.optional(),
  skills: teamSkillsSchema.default([]),
  order: z.number().int().min(1).optional(),
  active: z.boolean().optional(),
})

export const teamMemberUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1, "Le prénom est obligatoire").max(80, "Le prénom est trop long"),
    lastName: z.string().trim().min(1, "Le nom est obligatoire").max(80, "Le nom est trop long"),
    roleFr: z.string().trim().min(1, "La fonction en français est obligatoire").max(200, "La fonction est trop longue"),
    roleEn: z.string().trim().max(200, "La fonction anglaise est trop longue").optional(),
    roleDe: z.string().trim().max(200, "La fonction allemande est trop longue").optional(),
    category: teamCategorySchema,
    bioFr: z.string().trim().min(1, "La biographie en français est obligatoire").max(1500, "La biographie ne peut pas dépasser 1 500 caractères"),
    bioEn: z.string().trim().max(1500, "La biographie anglaise ne peut pas dépasser 1 500 caractères").optional(),
    bioDe: z.string().trim().max(1500, "La biographie allemande ne peut pas dépasser 1 500 caractères").optional(),
    photoUrl: z.string().trim().min(1, "La photo de profil est obligatoire").max(2048, "L'adresse de la photo est trop longue"),
    email: teamEmailSchema.optional(),
    skills: teamSkillsSchema.optional(),
    order: z.number().int().min(1).optional(),
    active: z.boolean().optional(),
  })
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), "Aucune modification fournie")

export const teamMemberReorderSchema = z.object({
  orderedIds: z
    .array(z.string().min(1))
    .min(1, "La liste de réorganisation est vide")
    .max(1000, "La liste de réorganisation est trop longue")
    .refine((ids) => new Set(ids).size === ids.length, "La liste de réorganisation contient des doublons"),
})

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null))

export const adminCreateMemberSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom doit comporter au moins 2 caractères").max(80),
  lastName: z.string().trim().min(2, "Le nom doit comporter au moins 2 caractères").max(80),
  email: z.string().trim().email("Adresse email invalide").max(254),
  phone: optionalText(40),
  profession: optionalText(160),
  organization: optionalText(160),
  country: z.string().trim().min(2, "Veuillez indiquer un pays"),
  city: optionalText(120),
  domainsOfInterest: z.array(z.string().trim().min(1)).min(1, "Sélectionnez au moins un domaine d'intérêt"),
  contributionType: z.enum(["COMPETENCES", "FINANCIER", "VOLONTARIAT", "RESEAU", "AUTRE"]),
  availability: z.enum(["HEBDOMADAIRE", "MENSUEL", "PONCTUEL", "TEMPS_PLEIN"]),
  motivation: z
    .string()
    .trim()
    .min(10, "La motivation doit comporter au moins 10 caractères")
    .max(3000),
})

export type AdminCreateMemberInput = z.infer<typeof adminCreateMemberSchema>

export const adminCreatePartnerSchema = z.object({
  orgName: z.string().trim().min(2, "Le nom de l'organisation est obligatoire").max(200),
  country: z.string().trim().min(2, "Veuillez indiquer un pays"),
  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  orgType: z.string().trim().min(2, "Le type d'organisation est obligatoire"),
  contactPerson: z.string().trim().min(2, "Le contact est obligatoire").max(160),
  email: z.string().trim().email("Adresse email invalide").max(254),
  phone: optionalText(40),
  volunteerCount: optionalText(40),
})

export type AdminCreatePartnerInput = z.infer<typeof adminCreatePartnerSchema>

export const adminCreateCandidateSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom doit comporter au moins 2 caractères").max(80),
  lastName: z.string().trim().min(2, "Le nom doit comporter au moins 2 caractères").max(80),
  email: z.string().trim().email("Adresse email invalide").max(254),
  phone: optionalText(40),
  country: z.string().trim().min(2, "Veuillez indiquer un pays"),
  city: optionalText(120),
  dateOfBirth: z.string().trim().min(1, "La date de naissance est obligatoire"),
  education: z.string().trim().min(2, "La formation est obligatoire").max(200),
  fieldOfStudy: z.string().trim().min(2, "Le domaine d'études est obligatoire").max(200),
  profession: z.string().trim().min(2, "La profession est obligatoire").max(200),
  experienceLevel: z.enum([
    "LESS_THAN_1_YEAR",
    "ONE_TO_TWO_YEARS",
    "TWO_TO_FIVE_YEARS",
    "FIVE_PLUS_YEARS",
  ]),
  digitalSkillLevel: z.string().trim().min(1, "Le niveau numérique est obligatoire"),
  arrivalDate: z.string().trim().min(1, "La date d'arrivée souhaitée est obligatoire"),
  duration: z.enum(["SIX_MONTHS", "NINE_MONTHS", "TWELVE_MONTHS"]),
  motivation: z
    .string()
    .trim()
    .min(10, "La motivation doit comporter au moins 10 caractères")
    .max(5000),
})

export type AdminCreateCandidateInput = z.infer<typeof adminCreateCandidateSchema>

const TEMOIGNAGE_AUTHOR_TYPES = ["BENEFICIARY", "VOLUNTEER", "PARTNER", "TRAINER"] as const

export const temoignageCreateSchema = z.object({
  authorName: z.string().trim().min(2, "Le nom de l'auteur doit comporter au moins 2 caractères").max(200),
  authorRole: z.string().trim().min(2, "Le rôle de l'auteur est obligatoire").max(200),
  authorType: z.enum(TEMOIGNAGE_AUTHOR_TYPES).default("VOLUNTEER"),
  authorOrg: z.string().trim().max(200).optional().nullable(),
  photoUrl: z.string().trim().max(2048).optional().nullable(),
  quoteFr: z.string().trim().min(10, "Le témoignage en français doit comporter au moins 10 caractères").max(3000),
  quoteEn: z.string().trim().max(3000).optional().nullable(),
  quoteDe: z.string().trim().max(3000).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export type TemoignageCreateInput = z.infer<typeof temoignageCreateSchema>

export const temoignageUpdateSchema = temoignageCreateSchema.partial().refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  "Aucune modification fournie"
)

export type TemoignageUpdateInput = z.infer<typeof temoignageUpdateSchema>

const mediaTypeSchema = z.enum(["PHOTO", "VIDEO"])

export const mediaCreateSchema = z.object({
  titleFr: z.string().trim().min(2, "Le titre doit comporter au moins 2 caractères").max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  titleDe: z.string().trim().max(200).optional().nullable(),
  captionFr: z.string().trim().max(1000).optional().nullable(),
  captionEn: z.string().trim().max(1000).optional().nullable(),
  captionDe: z.string().trim().max(1000).optional().nullable(),
  url: z.string().trim().min(1, "L'URL est obligatoire").max(2048),
  thumbnailUrl: z.string().trim().max(2048).optional().nullable(),
  type: mediaTypeSchema.default("PHOTO"),
  album: z.string().trim().max(200).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  projetId: z.string().trim().max(50).optional().nullable(),
})

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>

export const mediaUpdateSchema = mediaCreateSchema.partial().refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  "Aucune modification fournie"
)

export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>
