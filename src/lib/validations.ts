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
  dob: z.string().min(4, "Veuillez renseigner votre date de naissance"),

  education: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  profession: z.string().optional(),
  experience: z.string().optional(),

  skills: z
    .array(z.string())
    .min(1, "Veuillez sélectionner au moins une compétence"),

  arrivalDate: z.string().optional(),
  duration: z
    .enum([
      "6 months",
      "9 months",
      "12 months",
      "6 mois",
      "9 mois",
      "12 mois",
      "6 Monate",
      "9 Monate",
      "12 Monate",
    ])
    .default("6 months"),

  motivation: z
    .string()
    .min(20, "La motivation doit comporter au moins 20 caractères"),
  projectExp: z.string().optional(),

  cvFile: z.string().optional(),
  motivationFile: z.string().optional(),
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
  email: z.string().email("Adresse e-mail invalide"),
  orgType: z.string().min(2, "Veuillez préciser le type d'organisation"),
  volunteerCount: z.string().optional(),
  targetCountries: z.string().optional(),
  programme: z.string().optional(),
  message: z
    .string()
    .min(10, "Votre message doit comporter au moins 10 caractères"),
  docFile: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Le consentement est obligatoire",
  }),
})

export type PartnerRequestInput = z.infer<typeof partnerRequestSchema>

export const updateStatusSchema = z.object({
  candidateId: z.string(),
  newStatus: z.enum([
    "NOUVEAU",
    "REVISION",
    "SELECTIONNE",
    "ENTRETIEN",
    "CHOISI",
    "VALIDATION_PARTENAIRES",
    "PREPARATION",
    "ARRIVE",
    "COMPLETE",
    "REFUSE",
  ]),
})

export const addNoteSchema = z.object({
  candidateId: z.string(),
  author: z.string().default("Admin APTIC-R"),
  content: z.string().min(2, "Le contenu de la note ne peut être vide"),
})
