import type { Language } from "@/types"

export interface VolunteerFieldDefinition {
  key: string
  label: string
  description: string
  type: "text" | "textarea" | "image"
  section:
    | "HERO"
    | "WHY"
    | "CHALLENGE"
    | "MISSION"
    | "BUILD"
    | "PROFILES"
    | "WEEK"
    | "TOGO"
    | "CONDITIONS"
    | "PROCESS"
    | "FAQ"
    | "CTA"
    | "SHARED"
  isTranslatable: boolean
  required: boolean
}

export const VOLUNTEER_SECTIONS = [
  { id: "HERO", label: "1. Hero & Accroche principale" },
  { id: "WHY", label: "2. Pourquoi cette mission ?" },
  { id: "CHALLENGE", label: "3. Le Défi (Problème → Innovation → Impact)" },
  { id: "MISSION", label: "4. Votre Mission (Activités de terrain)" },
  { id: "BUILD", label: "5. Que pourriez-vous construire ?" },
  { id: "PROFILES", label: "6. Profils recherchés & Non-experts" },
  { id: "WEEK", label: "7. Une semaine avec APTIC-R" },
  { id: "TOGO", label: "8. Vie & Immersion au Togo" },
  { id: "CONDITIONS", label: "9. Conditions & Tableau transparent" },
  { id: "PROCESS", label: "10. Comment postuler (5 étapes)" },
  { id: "FAQ", label: "11. FAQ Volontariat" },
  { id: "CTA", label: "12. Appel à l'action final (CTA)" },
] as const

export const VOLUNTEER_FIELDS: VolunteerFieldDefinition[] = [
  // ── 1. HERO ──
  {
    key: "volunteer_hero_badge",
    label: "Surtitre badge Hero",
    description: "Badge au-dessus du titre (ex: Agbélouvé, Togo · 6-12 mois · Candidatures ouvertes).",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_line1",
    label: "Ligne de titre 1 (Blanc)",
    description: "Première ligne de titre (ex: Volontariat au Togo.)",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_line2",
    label: "Ligne de titre 2 (Vert accent)",
    description: "Deuxième ligne mise en valeur (ex: Le numérique au service)",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_line3",
    label: "Ligne de titre 3 (Complément)",
    description: "Troisième ligne du grand titre (ex: des territoires ruraux.)",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_desc",
    label: "Paragraphe descriptif Hero",
    description: "Texte explicatif sous le grand titre.",
    type: "textarea",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_cta_primary",
    label: "Texte bouton principal",
    description: "Bouton vert principal (ex: CANDIDATER MAINTENANT).",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_cta_secondary",
    label: "Texte bouton secondaire",
    description: "Bouton transparent (ex: DÉCOUVRIR LA MISSION).",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_image",
    label: "Photo d'ambiance Hero",
    description: "Photo haute qualité montrant la co-construction terrain.",
    type: "image",
    section: "HERO",
    isTranslatable: false,
    required: true,
  },
  {
    key: "volunteer_hero_stat1_label",
    label: "Compteur 1 - Valeur",
    description: "Ex: 6 à 12 mois",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_stat1_sub",
    label: "Compteur 1 - Libellé",
    description: "Ex: Durée de mission",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_stat2_label",
    label: "Compteur 2 - Valeur",
    description: "Ex: Agbélouvé",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_stat2_sub",
    label: "Compteur 2 - Libellé",
    description: "Ex: Togo, Afrique de l'Ouest",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_stat3_label",
    label: "Compteur 3 - Valeur",
    description: "Ex: FR · EN · DE",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_hero_stat3_sub",
    label: "Compteur 3 - Libellé",
    description: "Ex: Langues d'échange",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },

  // ── 2. POURQUOI CETTE MISSION ? ──
  {
    key: "volunteer_why_tag",
    label: "Surtitre Pourquoi cette mission",
    description: "Ex: POURQUOI L'APTIC-R ?",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_title",
    label: "Titre Pourquoi cette mission",
    description: "Ex: Pourquoi faire du volontariat avec l'APTIC-R ?",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card1_title",
    label: "Carte 1 - Titre",
    description: "Ex: Impact direct",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card1_desc",
    label: "Carte 1 - Description",
    description: "Description de l'impact rural auprès des coopératives.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card2_title",
    label: "Carte 2 - Titre",
    description: "Ex: Innovation numérique",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card2_desc",
    label: "Carte 2 - Description",
    description: "Description sur la technologie au service de cas concrets.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card3_title",
    label: "Carte 3 - Titre",
    description: "Ex: Technologie simple & Low-Tech",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card3_desc",
    label: "Carte 3 - Description",
    description: "Description sur les solutions abordables et réparables.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card4_title",
    label: "Carte 4 - Titre",
    description: "Ex: Échange interculturel",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_why_card4_desc",
    label: "Carte 4 - Description",
    description: "Description sur l'immersion et les liens humains.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },

  // ── 3. LE DÉFI (Problème → Innovation → Impact) ──
  {
    key: "volunteer_challenge_tag",
    label: "Surtitre Le Défi",
    description: "Ex: LE DÉFI TERRAIN",
    type: "text",
    section: "CHALLENGE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_challenge_title",
    label: "Titre Le Défi",
    description: "Ex: La technologie devrait être accessible à tous.",
    type: "text",
    section: "CHALLENGE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_challenge_p1",
    label: "Paragraphe 1 du défi",
    description: "Constat sur la fracture numérique et l'accès limité aux outils.",
    type: "textarea",
    section: "CHALLENGE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_challenge_p2",
    label: "Paragraphe 2 du défi",
    description: "Explication sur la démarche d'innovation frugale.",
    type: "textarea",
    section: "CHALLENGE",
    isTranslatable: true,
    required: true,
  },

  // ── 4. VOTRE MISSION ──
  {
    key: "volunteer_mission_tag",
    label: "Surtitre Votre Mission",
    description: "Ex: VOTRE MISSION",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_title",
    label: "Titre Votre Mission",
    description: "Ex: Ce que vous ferez concrètement sur le terrain",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step1_title",
    label: "Étape 1 - Titre",
    description: "Ex: Diagnostic terrain",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step1_desc",
    label: "Étape 1 - Description",
    description: "Rencontrer les agriculteurs et coopératives pour comprendre leurs besoins.",
    type: "textarea",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step2_title",
    label: "Étape 2 - Titre",
    description: "Ex: Hackathons ruraux",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step2_desc",
    label: "Étape 2 - Description",
    description: "Organiser des ateliers de co-création avec les jeunes et acteurs locaux.",
    type: "textarea",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step3_title",
    label: "Étape 3 - Titre",
    description: "Ex: Prototypage Low-Tech",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step3_desc",
    label: "Étape 3 - Description",
    description: "Concevoir des solutions techniques adaptées (capteurs, SMS, apps hors-ligne).",
    type: "textarea",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step4_title",
    label: "Étape 4 - Titre",
    description: "Ex: Formation & Autonomisation",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step4_desc",
    label: "Étape 4 - Description",
    description: "Former les relais locaux pour assurer l'appropriation pérenne.",
    type: "textarea",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step5_title",
    label: "Étape 5 - Titre",
    description: "Ex: Documentation Open-Source",
    type: "text",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_mission_step5_desc",
    label: "Étape 5 - Description",
    description: "Documenter les solutions développées pour diffusion libre et réutilisation.",
    type: "textarea",
    section: "MISSION",
    isTranslatable: true,
    required: true,
  },

  // ── 5. CE QUE VOUS POURRIEZ CONSTRUIRE ──
  {
    key: "volunteer_build_tag",
    label: "Surtitre Prototypage",
    description: "Ex: PROTOTYPES & RÉALISATIONS",
    type: "text",
    section: "BUILD",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_build_title",
    label: "Titre Prototypage",
    description: "Ex: Que pourriez-vous construire ?",
    type: "text",
    section: "BUILD",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_build_featured_badge",
    label: "Projet Phare - Badge",
    description: "Ex: IoT & Capteurs",
    type: "text",
    section: "BUILD",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_build_featured_title",
    label: "Projet Phare - Titre",
    description: "Ex: Irrigation intelligente",
    type: "text",
    section: "BUILD",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_build_featured_desc",
    label: "Projet Phare - Description",
    description: "Description de l'irrigation connectée et capteurs d'humidité.",
    type: "textarea",
    section: "BUILD",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_build_featured_image",
    label: "Projet Phare - Photo d'illustration",
    description: "Image de terrain montrant le système d'irrigation.",
    type: "image",
    section: "BUILD",
    isTranslatable: false,
    required: true,
  },

  // ── 6. PROFILS RECHERCHÉS ──
  {
    key: "volunteer_profiles_tag",
    label: "Surtitre Profils",
    description: "Ex: PROFILS RECHERCHÉS",
    type: "text",
    section: "PROFILES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_profiles_title",
    label: "Titre Profils",
    description: "Ex: Et si c'était vous ?",
    type: "text",
    section: "PROFILES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_profiles_subtitle",
    label: "Sous-titre Profils",
    description: "Ex: Étudiants, jeunes diplômés ou professionnels : découvrez les compétences recherchées.",
    type: "textarea",
    section: "PROFILES",
    isTranslatable: true,
    required: true,
  },

  // ── 7. VIE AU TOGO ──
  {
    key: "volunteer_togo_tag",
    label: "Surtitre Vie au Togo",
    description: "Ex: IMMERSION & VIE LOCALE",
    type: "text",
    section: "TOGO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_togo_title",
    label: "Titre Vie au Togo",
    description: "Ex: Bien plus qu'une mission, une expérience humaine",
    type: "text",
    section: "TOGO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_togo_desc",
    label: "Description Vie au Togo",
    description: "Texte de mise en confiance sur l'accueil, la vie à Agbélouvé et la sécurité.",
    type: "textarea",
    section: "TOGO",
    isTranslatable: true,
    required: true,
  },

  // ── 8. CONDITIONS ──
  {
    key: "volunteer_conditions_tag",
    label: "Surtitre Conditions",
    description: "Ex: CADRE & LOGISTIQUE",
    type: "text",
    section: "CONDITIONS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_conditions_title",
    label: "Titre Conditions",
    description: "Ex: Des conditions d'accueil transparentes et confirmées",
    type: "text",
    section: "CONDITIONS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_conditions_subtitle",
    label: "Sous-titre Conditions",
    description: "Ex: APTIC-R s'assure que chaque volontaire bénéficie d'un environnement sécurisé et mentoré.",
    type: "textarea",
    section: "CONDITIONS",
    isTranslatable: true,
    required: true,
  },

  // ── 9. COMMENT POSTULER ──
  {
    key: "volunteer_process_tag",
    label: "Surtitre Processus",
    description: "Ex: PROCESSUS DE CANDIDATURE",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_process_title",
    label: "Titre Processus",
    description: "Ex: Comment postuler en 5 étapes claires",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_process_subtitle",
    label: "Sous-titre Processus",
    description: "Ex: Un parcours d'évaluation transparent et bienveillant.",
    type: "textarea",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },

  // ── 10. CTA FINAL ──
  {
    key: "volunteer_cta_badge",
    label: "Surtitre CTA Final",
    description: "Ex: PRÊT À AVOIR UN IMPACT ?",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_cta_title",
    label: "Titre CTA Final",
    description: "Ex: Votre prochaine aventure commence au Togo",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_cta_desc",
    label: "Texte de motivation CTA Final",
    description: "Ex: Mettez vos compétences au service de l'autonomie des territoires ruraux.",
    type: "textarea",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_cta_btn_primary",
    label: "Bouton principal CTA Final",
    description: "Ex: CANDIDATER DÈS MAINTENANT",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "volunteer_cta_btn_secondary",
    label: "Bouton secondaire CTA Final",
    description: "Ex: Proposer un partenariat",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
]

/**
 * Generates database key for a field according to language.
 */
export function getVolunteerFieldDbKey(baseKey: string, lang: Language): string {
  const field = VOLUNTEER_FIELDS.find((f) => f.key === baseKey)
  if (!field || !field.isTranslatable) {
    return baseKey
  }
  return `${baseKey}_${lang.toLowerCase()}`
}

/**
 * Calculates completeness percentage and missing required fields for a given language.
 */
export function calculateVolunteerCompleteness(
  settings: Record<string, string>,
  lang: Language
): {
  percentage: number
  totalCount: number
  filledCount: number
  missingFields: { key: string; label: string }[]
  isComplete: boolean
} {
  const missingFields: { key: string; label: string }[] = []
  let totalCount = 0
  let filledCount = 0

  for (const field of VOLUNTEER_FIELDS) {
    if (!field.required) continue
    totalCount++
    const dbKey = getVolunteerFieldDbKey(field.key, lang)
    const val = settings[dbKey]?.trim()

    if (val) {
      filledCount++
    } else {
      missingFields.push({ key: dbKey, label: field.label })
    }
  }

  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 100

  return {
    percentage,
    totalCount,
    filledCount,
    missingFields,
    isComplete: percentage === 100,
  }
}

/**
 * Checks if the Volunteer page is strictly published for a given language.
 */
export function isVolunteerPagePublished(
  settings: Record<string, string>,
  lang: Language
): boolean {
  const publishedKey = `volunteer_published_${lang.toLowerCase()}`
  return settings[publishedKey] === "PUBLISHED"
}
