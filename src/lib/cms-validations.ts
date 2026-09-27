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
  email: z.string().email("Adresse email invalide"),
  firstName: z.string().optional().nullable(),
  lang: z.enum(["FR", "EN", "DE"]).default("FR"),
  consent: z.boolean().refine(val => val === true, "Le consentement est obligatoire"),
})

export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>

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
