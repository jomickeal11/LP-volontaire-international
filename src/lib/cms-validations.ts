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
