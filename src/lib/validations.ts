import { z } from "zod"

export const candidateApplicationSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit comporter au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse e-mail invalide"),
  phone: z.string().optional(),
  country: z.string().min(2, "Veuillez sélectionner un pays"),
  city: z.string().optional(),
  dob: z
    .string()
    .min(1, "Veuillez renseigner votre date de naissance")
    .refine((val) => !isNaN(Date.parse(val)), "Date de naissance invalide"),

  education: z.string().min(1, "Veuillez renseigner votre formation"),
  fieldOfStudy: z.string().min(1, "Veuillez renseigner votre domaine d'études"),
  profession: z.string().min(1, "Veuillez renseigner votre profession"),
  experience: z.enum([
    "LESS_THAN_1_YEAR",
    "ONE_TO_TWO_YEARS",
    "TWO_TO_FIVE_YEARS",
    "FIVE_PLUS_YEARS",
  ]),

  digitalSkillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  languages: z.string().optional(),

  skills: z
    .array(z.string())
    .min(1, "Veuillez sélectionner au moins une compétence"),

  arrivalDate: z
    .string()
    .min(1, "Veuillez renseigner votre date d'arrivée souhaitée")
    .refine((val) => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    }, "La date d'arrivée ne peut pas être dans le passé"),
  duration: z.enum(["SIX_MONTHS", "NINE_MONTHS", "TWELVE_MONTHS"]),

  motivation: z
    .string()
    .min(50, "La motivation doit comporter au moins 50 caractères")
    .max(5000, "La motivation ne doit pas dépasser 5000 caractères"),
  projectExp: z
    .string()
    .min(50, "L'expérience projet doit comporter au moins 50 caractères")
    .max(5000, "L'expérience projet ne doit pas dépasser 5000 caractères"),

  cvFile: z.string().min(1, "Le CV est obligatoire"),
  motivationFile: z.string().min(1, "La lettre de motivation est obligatoire"),
  portfolioFile: z.string().optional(),

  source: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Le consentement au traitement des données est obligatoire",
  }),
})

export type CandidateApplicationInput = z.infer<typeof candidateApplicationSchema>

export const partnerRequestSchema = z.object({
  orgName: z.string().min(2, "Le nom de l'organisation est obligatoire"),
  country: z.string().min(2, "Veuillez sélectionner un pays"),
  website: z.string().url("Format d'URL invalide").optional().or(z.literal("")),
  contactPerson: z.string().min(2, "Nom du contact obligatoire"),
  email: z.string().email("Adresse e-mail professionnelle invalide"),
  phone: z.string().optional(),
  orgType: z.string().min(2, "Veuillez préciser le type d'organisation"),
  volunteerCount: z.string().min(1, "Veuillez indiquer le nombre potentiel de volontaires"),
  targetCountries: z.string().optional(),
  programme: z.string().optional(),
  message: z
    .string()
    .min(50, "Votre message doit comporter au moins 50 caractères"),
  docFile: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Le consentement est obligatoire",
  }),
})

export type PartnerRequestInput = z.infer<typeof partnerRequestSchema>

export const updateStatusSchema = z.object({
  candidateId: z.string(),
  newStatus: z.enum([
    "NEW",
    "REVIEW",
    "SELECTED",
    "INTERVIEW",
    "CHOSEN",
    "PARTNER_VALIDATION",
    "PREPARATION",
    "ARRIVED",
    "COMPLETED",
    "REJECTED",
    "ARCHIVED",
  ]),
})

export const addNoteSchema = z.object({
  candidateId: z.string(),
  author: z.string().default("Admin APTIC-R"),
  content: z.string().min(2, "Le contenu de la note ne peut être vide"),
})
