import type { Language } from "@/types"

export interface AboutFieldDefinition {
  key: string
  label: string
  description: string
  type: "text" | "textarea" | "image"
  section: "HERO" | "STORY" | "PILLARS" | "STATS" | "VALUES" | "GOVERNANCE" | "CTA" | "SHARED"
  isTranslatable: boolean
  required: boolean
}

export const ABOUT_SECTIONS = [
  { id: "HERO", label: "1. Hero & Introduction" },
  { id: "STORY", label: "2. Notre Histoire & Chronologie" },
  { id: "PILLARS", label: "3. Cadre d'intervention (Mission, Vision, Philosophie)" },
  { id: "STATS", label: "4. Chiffres Clés d'Impact" },
  { id: "VALUES", label: "5. Les 5 Valeurs Cardinales" },
  { id: "GOVERNANCE", label: "6. Gouvernance & Structure (3 instances)" },
  { id: "CTA", label: "7. Appel à l'action final (CTA & Boutons)" },
] as const

export const ABOUT_FIELDS: AboutFieldDefinition[] = [
  // ── 1. Hero & Introduction ──
  {
    key: "about_eyebrow",
    label: "Surtitre Hero",
    description: "Petit bandeau au-dessus du titre principal (ex: À PROPOS D'APTIC-R).",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_title",
    label: "Titre principal de la page",
    description: "Grand titre éditorial affiché en haut de la page.",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_subtitle",
    label: "Introduction / Sous-titre",
    description: "Paragraphe d'introduction sous le grand titre.",
    type: "textarea",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },

  // ── 2. Notre Histoire & Chronologie ──
  {
    key: "about_story_eyebrow",
    label: "Surtitre section Histoire",
    description: "Libellé de section (ex: NOTRE HISTOIRE).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_headline",
    label: "Titre d'accroche du récit historique",
    description: "Accroche narrative principale.",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_p1",
    label: "Histoire - Paragraphe 1 (Constat & Genèse)",
    description: "Premier paragraphe exposant la fracture numérique rurale.",
    type: "textarea",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_p2",
    label: "Histoire - Paragraphe 2 (Action collective)",
    description: "Deuxième paragraphe sur l'action des ingénieurs et éducateurs.",
    type: "textarea",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_p3",
    label: "Histoire - Paragraphe 3 (Tiers-lieux & FabLab)",
    description: "Troisième paragraphe résumant le laboratoire vivant d'Agbélouvé.",
    type: "textarea",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_image",
    label: "Photo documentaire de terrain",
    description: "Photo en situation réelle à Agbélouvé (partagée entre toutes les langues).",
    type: "image",
    section: "STORY",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_story_image_alt",
    label: "Texte alternatif de la photo (Accessibilité / SEO)",
    description: "Description de la photo pour les moteurs de recherche et lecteurs d'écran.",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_location_tag",
    label: "Tag sur la photo",
    description: "Petit badge sur l'image (ex: Ancrage communautaire).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_story_location",
    label: "Légende de localisation",
    description: "Indication du lieu (ex: Agbélouvé, Région Maritime).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_step1_year",
    label: "Étape 1 - Année de création",
    description: "Année de démarrage des premières actions terrain (ex: 2018).",
    type: "text",
    section: "STORY",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_step1_label",
    label: "Étape 1 - Libellé",
    description: "Libellé de la 1ère étape (ex: Création à Agbélouvé).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_step2_year",
    label: "Étape 2 - Année de formalisation",
    description: "Année d'obtention du récépissé officiel (ex: 2020).",
    type: "text",
    section: "STORY",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_step2_label",
    label: "Étape 2 - Libellé",
    description: "Libellé de la 2nde étape (ex: Formalisation officielle).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_step3_year",
    label: "Étape 3 - Période actuelle",
    description: "Repère temporel (ex: Aujourd'hui / Today / Heute).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_step3_label",
    label: "Étape 3 - Libellé",
    description: "Libellé de la 3ème étape (ex: Déploiement & Impact).",
    type: "text",
    section: "STORY",
    isTranslatable: true,
    required: true,
  },

  // ── 3. Cadre d'intervention (Mission, Vision, Philosophie) ──
  {
    key: "about_pillars_eyebrow",
    label: "Surtitre Cadre d'intervention",
    description: "Libellé de section (ex: CADRE D'INTERVENTION).",
    type: "text",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_pillars_title",
    label: "Titre Cadre d'intervention",
    description: "Grand titre (ex: Mission, Vision & Philosophie).",
    type: "text",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_mission_title",
    label: "Pilier 1 (Mission) - Titre",
    description: "Intitulé du pilier Mission (ex: NOTRE MISSION).",
    type: "text",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_mission_desc",
    label: "Pilier 1 (Mission) - Description",
    description: "Texte explicatif de la mission.",
    type: "textarea",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_vision_title",
    label: "Pilier 2 (Vision) - Titre",
    description: "Intitulé du pilier Vision (ex: NOTRE VISION).",
    type: "text",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_vision_desc",
    label: "Pilier 2 (Vision) - Description",
    description: "Texte explicatif de la vision émancipatrice.",
    type: "textarea",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_philosophy_title",
    label: "Pilier 3 (Philosophie) - Titre",
    description: "Intitulé du pilier Philosophie (ex: NOTRE PHILOSOPHIE).",
    type: "text",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_philosophy_desc",
    label: "Pilier 3 (Philosophie) - Description",
    description: "Texte explicatif de la démarche low-tech et sobre.",
    type: "textarea",
    section: "PILLARS",
    isTranslatable: true,
    required: true,
  },

  // ── 4. Chiffres Clés d'Impact ──
  {
    key: "about_stat1_val",
    label: "Métrique 1 - Valeur chiffrée",
    description: "Ex: 5+",
    type: "text",
    section: "STATS",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_stat1_lbl",
    label: "Métrique 1 - Libellé",
    description: "Ex: Années d'action sur le terrain",
    type: "text",
    section: "STATS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_stat2_val",
    label: "Métrique 2 - Valeur chiffrée",
    description: "Ex: 3 200+",
    type: "text",
    section: "STATS",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_stat2_lbl",
    label: "Métrique 2 - Libellé",
    description: "Ex: Enfants, jeunes et artisans formés",
    type: "text",
    section: "STATS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_stat3_val",
    label: "Métrique 3 - Valeur chiffrée",
    description: "Ex: 14",
    type: "text",
    section: "STATS",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_stat3_lbl",
    label: "Métrique 3 - Libellé",
    description: "Ex: Établissements scolaires partenaires",
    type: "text",
    section: "STATS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_stat4_val",
    label: "Métrique 4 - Valeur chiffrée",
    description: "Ex: 100%",
    type: "text",
    section: "STATS",
    isTranslatable: false,
    required: true,
  },
  {
    key: "about_stat4_lbl",
    label: "Métrique 4 - Libellé",
    description: "Ex: Projets co-conçus localement",
    type: "text",
    section: "STATS",
    isTranslatable: true,
    required: true,
  },

  // ── 5. Les 5 Valeurs Cardinales ──
  {
    key: "about_values_eyebrow",
    label: "Surtitre section Valeurs",
    description: "Libellé de section (ex: PRINCIPES FONDAMENTAUX).",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_values_title",
    label: "Titre section Valeurs",
    description: "Grand titre (ex: Nos 5 valeurs cardinales).",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_values_subtitle",
    label: "Sous-titre section Valeurs",
    description: "Phrase d'introduction aux valeurs intangibles.",
    type: "textarea",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val1_title",
    label: "Valeur 1 - Titre",
    description: "Ex: Ancrage communautaire",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val1_desc",
    label: "Valeur 1 - Description",
    description: "Explication de la valeur 1.",
    type: "textarea",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val2_title",
    label: "Valeur 2 - Titre",
    description: "Ex: Sobriété numérique & Low-Tech",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val2_desc",
    label: "Valeur 2 - Description",
    description: "Explication de la valeur 2.",
    type: "textarea",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val3_title",
    label: "Valeur 3 - Titre",
    description: "Ex: Égalité des chances & mixité",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val3_desc",
    label: "Valeur 3 - Description",
    description: "Explication de la valeur 3.",
    type: "textarea",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val4_title",
    label: "Valeur 4 - Titre",
    description: "Ex: Souveraineté & culture libre",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val4_desc",
    label: "Valeur 4 - Description",
    description: "Explication de la valeur 4.",
    type: "textarea",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val5_title",
    label: "Valeur 5 - Titre",
    description: "Ex: Intégrité & transparence",
    type: "text",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_val5_desc",
    label: "Valeur 5 - Description",
    description: "Explication de la valeur 5.",
    type: "textarea",
    section: "VALUES",
    isTranslatable: true,
    required: true,
  },

  // ── 6. Gouvernance & Structure (3 instances complètes) ──
  {
    key: "about_gov_eyebrow",
    label: "Surtitre Gouvernance",
    description: "Libellé de section (ex: ORGANISATION).",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov_title",
    label: "Titre Gouvernance",
    description: "Grand titre (ex: Gouvernance & Structure).",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov_subtitle",
    label: "Sous-titre Gouvernance",
    description: "Description de la gouvernance démocratique.",
    type: "textarea",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov1_role",
    label: "Instance 1 - Rôle / Label",
    description: "Ex: Instance souveraine d'orientation",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov1_title",
    label: "Instance 1 - Titre",
    description: "Ex: Assemblée Générale",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov1_desc",
    label: "Instance 1 - Description",
    description: "Texte explicatif du rôle de l'Assemblée Générale.",
    type: "textarea",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov2_role",
    label: "Instance 2 - Rôle / Label",
    description: "Ex: Pilotage opérationnel & déploiement",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov2_title",
    label: "Instance 2 - Titre",
    description: "Ex: Bureau Exécutif & Direction",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov2_desc",
    label: "Instance 2 - Description",
    description: "Texte explicatif de l'équipe de pilotage opérationnel.",
    type: "textarea",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov3_role",
    label: "Instance 3 - Rôle / Label",
    description: "Ex: Garant d'impact & ancrage local",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov3_title",
    label: "Instance 3 - Titre",
    description: "Ex: Comité Consultatif Communautaire",
    type: "text",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_gov3_desc",
    label: "Instance 3 - Description",
    description: "Texte explicatif de l'ancrage avec les villageois et artisans.",
    type: "textarea",
    section: "GOVERNANCE",
    isTranslatable: true,
    required: true,
  },

  // ── 7. Appel à l'action final (CTA & Boutons) ──
  {
    key: "about_cta_eyebrow",
    label: "Surtitre Bannière CTA",
    description: "Libellé de section (ex: ENGAGEMENT).",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_cta_title",
    label: "Titre Bannière CTA",
    description: "Grand titre d'appel à l'action.",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_cta_subtitle",
    label: "Sous-titre Bannière CTA",
    description: "Phrase d'invitation à rejoindre la communauté.",
    type: "textarea",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_cta_btn_member",
    label: "Libellé Bouton 1 (Adhésion)",
    description: "Ex: Devenir membre",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_cta_btn_volunteer",
    label: "Libellé Bouton 2 (Volontariat)",
    description: "Ex: Devenir volontaire",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "about_cta_btn_partner",
    label: "Libellé Bouton 3 (Partenariat)",
    description: "Ex: Devenir partenaire",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
]

/**
 * Returns the effective database key for a field and a given language.
 */
export function getAboutFieldDbKey(baseKey: string, lang: Language): string {
  const def = ABOUT_FIELDS.find((f) => f.key === baseKey)
  if (!def || !def.isTranslatable) {
    return baseKey
  }
  return `${baseKey}_${lang.toLowerCase()}`
}

/**
 * Calculates completeness percentage and missing required fields for a given language.
 */
export function calculateAboutCompleteness(
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

  for (const field of ABOUT_FIELDS) {
    if (!field.required) continue
    totalCount++
    const dbKey = getAboutFieldDbKey(field.key, lang)
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
 * Checks if the About page is strictly published for a given language.
 */
export function isAboutPagePublished(
  settings: Record<string, string>,
  lang: Language
): boolean {
  const publishedKey = `about_published_${lang.toLowerCase()}`
  return settings[publishedKey] === "PUBLISHED"
}
