import { z, ZodError } from "zod"

export type SupportedLanguage = "FR" | "EN" | "DE"

export const candidateValidationMessages = {
  FR: {
    firstNameMin: "Le prénom doit comporter au moins 2 caractères",
    lastNameMin: "Le nom doit comporter au moins 2 caractères",
    emailInvalid: "Adresse e-mail invalide",
    countryRequired: "Veuillez sélectionner un pays",
    dobRequired: "Veuillez renseigner votre date de naissance",
    dobInvalid: "Date de naissance invalide",
    educationRequired: "Veuillez renseigner votre formation",
    fieldOfStudyRequired: "Veuillez renseigner votre domaine d'études",
    professionRequired: "Veuillez renseigner votre profession",
    experienceRequired: "Veuillez sélectionner votre niveau d'expérience",
    digitalSkillLevelRequired: "Veuillez sélectionner votre niveau en numérique",
    skillsMin: "Veuillez sélectionner au moins une compétence",
    arrivalDateRequired: "Veuillez renseigner votre date d'arrivée souhaitée",
    arrivalDatePast: "La date d'arrivée ne peut pas être dans le passé",
    durationRequired: "Veuillez choisir une durée de mission",
    motivationMin: "La motivation doit comporter au moins 50 caractères",
    motivationMax: "La motivation ne doit pas dépasser 5000 caractères",
    projectExpMin: "L'expérience projet doit comporter au moins 50 caractères",
    projectExpMax: "L'expérience projet ne doit pas dépasser 5000 caractères",
    cvRequired: "Le CV est obligatoire",
    motivationFileRequired: "La lettre de motivation est obligatoire",
    consentRequired: "Le consentement au traitement des données est obligatoire",
  },
  EN: {
    firstNameMin: "First name must contain at least 2 characters",
    lastNameMin: "Last name must contain at least 2 characters",
    emailInvalid: "Invalid email address",
    countryRequired: "Please select your country of residence",
    dobRequired: "Please enter your date of birth",
    dobInvalid: "Invalid date of birth",
    educationRequired: "Please indicate your level of education",
    fieldOfStudyRequired: "Please indicate your field of study",
    professionRequired: "Please indicate your current profession",
    experienceRequired: "Please select your level of experience",
    digitalSkillLevelRequired: "Please select your digital skill level",
    skillsMin: "Please select at least one skill",
    arrivalDateRequired: "Please specify your preferred arrival date",
    arrivalDatePast: "Arrival date cannot be in the past",
    durationRequired: "Please select a mission duration",
    motivationMin: "Your statement of motivation must contain at least 50 characters",
    motivationMax: "Your statement of motivation cannot exceed 5000 characters",
    projectExpMin: "Project experience description must contain at least 50 characters",
    projectExpMax: "Project experience description cannot exceed 5000 characters",
    cvRequired: "Resume (CV) is required",
    motivationFileRequired: "Motivation letter is required",
    consentRequired: "Consent to data processing is required",
  },
  DE: {
    firstNameMin: "Der Vorname muss mindestens 2 Zeichen lang sein",
    lastNameMin: "Der Nachname muss mindestens 2 Zeichen lang sein",
    emailInvalid: "Ungültige E-Mail-Adresse",
    countryRequired: "Bitte wählen Sie Ihr Wohnsitzland aus",
    dobRequired: "Bitte geben Sie Ihr Geburtsdatum an",
    dobInvalid: "Ungültiges Geburtsdatum",
    educationRequired: "Bitte geben Sie Ihren Bildungsabschluss an",
    fieldOfStudyRequired: "Bitte geben Sie Ihren Studienbereich an",
    professionRequired: "Bitte geben Sie Ihren aktuellen Beruf an",
    experienceRequired: "Bitte wählen Sie Ihre Berufserfahrung aus",
    digitalSkillLevelRequired: "Bitte wählen Sie Ihr digitales Kompetenzniveau",
    skillsMin: "Bitte wählen Sie mindestens eine Kompetenz aus",
    arrivalDateRequired: "Bitte geben Sie das gewünschte Anreisedatum an",
    arrivalDatePast: "Das Anreisedatum darf nicht in der Vergangenheit liegen",
    durationRequired: "Bitte wählen Sie eine Einsatzdauer aus",
    motivationMin: "Das Motivationsschreiben muss mindestens 50 Zeichen umfassen",
    motivationMax: "Das Motivationsschreiben darf maximal 5000 Zeichen umfassen",
    projectExpMin: "Die Projektbeschreibung muss mindestens 50 Zeichen umfassen",
    projectExpMax: "Die Projektbeschreibung darf maximal 5000 Zeichen umfassen",
    cvRequired: "Der Lebenslauf (CV) ist erforderlich",
    motivationFileRequired: "Das Motivationsschreiben ist erforderlich",
    consentRequired: "Die Zustimmung zur Datenverarbeitung ist erforderlich",
  },
}

export const partnerValidationMessages = {
  FR: {
    orgNameMin: "Le nom de l'organisation est obligatoire (au moins 2 caractères)",
    countryRequired: "Veuillez sélectionner un pays",
    websiteInvalid: "Format d'URL de site web invalide",
    contactPersonMin: "Le nom de la personne de contact est obligatoire",
    emailInvalid: "Adresse e-mail professionnelle invalide",
    orgTypeMin: "Veuillez préciser le type d'organisation",
    volunteerCountRequired: "Veuillez indiquer le nombre potentiel de volontaires",
    messageMin: "Votre message de présentation doit comporter au moins 50 caractères",
    consentRequired: "Le consentement au traitement des informations est obligatoire",
  },
  EN: {
    orgNameMin: "Organization name is required (at least 2 characters)",
    countryRequired: "Please select a country",
    websiteInvalid: "Invalid website URL format",
    contactPersonMin: "Contact person name is required",
    emailInvalid: "Invalid professional email address",
    orgTypeMin: "Please specify the organization type",
    volunteerCountRequired: "Please indicate the estimated volunteer count",
    messageMin: "Your partnership message must contain at least 50 characters",
    consentRequired: "Consent to information processing is required",
  },
  DE: {
    orgNameMin: "Der Name der Organisation ist erforderlich (mindestens 2 Zeichen)",
    countryRequired: "Bitte wählen Sie ein Land aus",
    websiteInvalid: "Ungültiges Website-URL-Format",
    contactPersonMin: "Der Name des Ansprechpartners ist erforderlich",
    emailInvalid: "Ungültige geschäftliche E-Mail-Adresse",
    orgTypeMin: "Bitte geben Sie den Organisationstyp an",
    volunteerCountRequired: "Bitte geben Sie die geschätzte Freiwilligenzahl an",
    messageMin: "Ihre Partnerschaftsbeschreibung muss mindestens 50 Zeichen enthalten",
    consentRequired: "Die Zustimmung zur Datenverarbeitung ist erforderlich",
  },
}

export function getCandidateApplicationSchema(lang: SupportedLanguage = "FR") {
  const m = candidateValidationMessages[lang] || candidateValidationMessages.FR

  return z.object({
    firstName: z.string().min(2, m.firstNameMin),
    lastName: z.string().min(2, m.lastNameMin),
    email: z.string().email(m.emailInvalid),
    phone: z.string().optional(),
    country: z.string().min(2, m.countryRequired),
    city: z.string().optional(),
    dob: z
      .string()
      .min(1, m.dobRequired)
      .refine((val) => !isNaN(Date.parse(val)), m.dobInvalid),

    education: z.string().min(1, m.educationRequired),
    fieldOfStudy: z.string().min(1, m.fieldOfStudyRequired),
    profession: z.string().min(1, m.professionRequired),
    experience: z.enum([
      "LESS_THAN_1_YEAR",
      "ONE_TO_TWO_YEARS",
      "TWO_TO_FIVE_YEARS",
      "FIVE_PLUS_YEARS",
    ], { message: m.experienceRequired }),

    digitalSkillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"], {
      message: m.digitalSkillLevelRequired,
    }),
    languages: z.string().optional(),

    skills: z.array(z.string()).min(1, m.skillsMin),

    arrivalDate: z
      .string()
      .min(1, m.arrivalDateRequired)
      .refine((val) => {
        const date = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      }, m.arrivalDatePast),
    duration: z.enum(["SIX_MONTHS", "NINE_MONTHS", "TWELVE_MONTHS"], {
      message: m.durationRequired,
    }),

    motivation: z
      .string()
      .min(50, m.motivationMin)
      .max(5000, m.motivationMax),
    projectExp: z
      .string()
      .min(50, m.projectExpMin)
      .max(5000, m.projectExpMax),

    cvFile: z.string().min(1, m.cvRequired),
    motivationFile: z.string().min(1, m.motivationFileRequired),
    portfolioFile: z.string().optional(),

    source: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
      message: m.consentRequired,
    }),
  })
}

export function getPartnerRequestSchema(lang: SupportedLanguage = "FR") {
  const m = partnerValidationMessages[lang] || partnerValidationMessages.FR

  return z.object({
    orgName: z.string().min(2, m.orgNameMin),
    country: z.string().min(2, m.countryRequired),
    website: z.string().url(m.websiteInvalid).optional().or(z.literal("")),
    contactPerson: z.string().min(2, m.contactPersonMin),
    email: z.string().email(m.emailInvalid),
    phone: z.string().optional(),
    orgType: z.string().min(2, m.orgTypeMin),
    volunteerCount: z.string().min(1, m.volunteerCountRequired),
    targetCountries: z.string().optional(),
    programme: z.string().optional(),
    message: z.string().min(50, m.messageMin),
    docFile: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
      message: m.consentRequired,
    }),
  })
}

// Schémas par défaut en français pour la rétro-compatibilité
export const candidateApplicationSchema = getCandidateApplicationSchema("FR")
export type CandidateApplicationInput = z.infer<typeof candidateApplicationSchema>

export const partnerRequestSchema = getPartnerRequestSchema("FR")
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

/**
 * Extrait le premier message d'erreur Zod lisible pour l'utilisateur,
 * évitant l'affichage de JSON brut ou de messages techniques.
 */
export function formatZodError(error: unknown, lang: SupportedLanguage = "FR"): string {
  if (error instanceof ZodError) {
    if (error.issues && error.issues.length > 0) {
      const firstIssue = error.issues[0]
      return firstIssue.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  const fallback = {
    FR: "Une erreur de validation est survenue. Veuillez vérifier les informations saisies.",
    EN: "A validation error occurred. Please check the information provided.",
    DE: "Ein Validierungsfehler ist aufgetreten. Bitte überprüfen Sie Ihre Angaben.",
  }
  return fallback[lang] || fallback.FR
}
