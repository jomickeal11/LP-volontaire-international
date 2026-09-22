import type { Language } from "@/types"

export interface PartnerFieldDefinition {
  key: string
  label: string
  description: string
  type: "text" | "textarea" | "image"
  section:
    | "HERO"
    | "WHY"
    | "FRAMEWORKS"
    | "LOGISTICS"
    | "PROCESS"
    | "FAQ"
    | "CTA"
  isTranslatable: boolean
  required: boolean
}

export const PARTNER_SECTIONS = [
  { id: "HERO", label: "1. Hero & Accroche Institutionnelle" },
  { id: "WHY", label: "2. Pourquoi coopérer avec APTIC-R (4 Garanties)" },
  { id: "FRAMEWORKS", label: "3. Modalités & Formats de partenariat (4 Typologies)" },
  { id: "LOGISTICS", label: "4. Cadre Logistique & Terrain (Agbélouvé)" },
  { id: "PROCESS", label: "5. Processus de Partenariat (4 étapes)" },
  { id: "FAQ", label: "6. FAQ Partenaires" },
  { id: "CTA", label: "7. Appel à l'action final (CTA)" },
] as const

export const PARTNER_FIELDS: PartnerFieldDefinition[] = [
  // ── 1. HERO ──
  {
    key: "partner_hero_badge",
    label: "Surtitre badge Hero",
    description: "Badge au-dessus du grand titre (ex: Partenariats & Coopération Internationale).",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_line1",
    label: "Ligne de titre 1 (Blanc)",
    description: "Première ligne (ex: Construisons ensemble)",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_line2",
    label: "Ligne de titre 2 (Vert accent)",
    description: "Deuxième ligne mise en valeur (ex: un partenariat à fort impact)",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_line3",
    label: "Ligne de titre 3 (Complément)",
    description: "Troisième ligne (ex: au Togo.)",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_desc",
    label: "Paragraphe descriptif Hero",
    description: "Texte de présentation sous le titre.",
    type: "textarea",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_cta_primary",
    label: "Bouton principal (Vert)",
    description: "Ex: PROPOSER UN PARTENARIAT",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_cta_secondary",
    label: "Bouton secondaire (Transparent)",
    description: "Ex: DÉCOUVRIR LE CADRE",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_image",
    label: "Photo d'ambiance Hero",
    description: "Photo haute qualité montrant la réunion de partenariat.",
    type: "image",
    section: "HERO",
    isTranslatable: false,
    required: true,
  },
  {
    key: "partner_hero_stat1_label",
    label: "Compteur 1 - Valeur",
    description: "Ex: 6 à 12 mois",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_stat1_sub",
    label: "Compteur 1 - Libellé",
    description: "Ex: Durée modulable",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_stat2_label",
    label: "Compteur 2 - Valeur",
    description: "Ex: Agbélouvé",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_stat2_sub",
    label: "Compteur 2 - Libellé",
    description: "Ex: Ancrage communautaire",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_stat3_label",
    label: "Compteur 3 - Valeur",
    description: "Ex: Conventions",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_hero_stat3_sub",
    label: "Compteur 3 - Libellé",
    description: "Ex: VSI · Césure · Co-projets",
    type: "text",
    section: "HERO",
    isTranslatable: true,
    required: true,
  },

  // ── 2. POURQUOI COOPÉRER AVEC APTIC-R (4 GARANTIES) ──
  {
    key: "partner_why_tag",
    label: "Surtitre Pourquoi coopérer",
    description: "Ex: POURQUOI COOPÉRER AVEC APTIC-R",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_title",
    label: "Titre Pourquoi coopérer",
    description: "Ex: Quatre garanties pour une collaboration réussie",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card1_title",
    label: "Garantie 01 - Titre",
    description: "Ex: Missions structurées & encadrées",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card1_desc",
    label: "Garantie 01 - Description",
    description: "Description sur les fiches de poste précises et l'encadrement sur place.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card2_title",
    label: "Garantie 02 - Titre",
    description: "Ex: Sécurité & intégration quotidienne",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card2_desc",
    label: "Garantie 02 - Description",
    description: "Description sur la localisation privilégiée et l'intégration à Agbélouvé.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card3_title",
    label: "Garantie 03 - Titre",
    description: "Ex: Transparence & redevabilité",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card3_desc",
    label: "Garantie 03 - Description",
    description: "Description sur l'enregistrement officiel au Togo et le suivi budgétaire.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card4_title",
    label: "Garantie 04 - Titre",
    description: "Ex: Open-source & pérennité",
    type: "text",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_why_card4_desc",
    label: "Garantie 04 - Description",
    description: "Description sur la documentation libre et l'appropriation locale.",
    type: "textarea",
    section: "WHY",
    isTranslatable: true,
    required: true,
  },

  // ── 3. MODALITÉS & FORMATS DE PARTENARIAT ──
  {
    key: "partner_frameworks_tag",
    label: "Surtitre Modalités",
    description: "Ex: MODALITÉS DE PARTENARIAT",
    type: "text",
    section: "FRAMEWORKS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_frameworks_title",
    label: "Titre Modalités",
    description: "Ex: Des formats de coopération adaptés à vos besoins",
    type: "text",
    section: "FRAMEWORKS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_frameworks_subtitle",
    label: "Sous-titre Modalités",
    description: "Ex: Que vous soyez un organisme d'envoi, une université, une entreprise...",
    type: "textarea",
    section: "FRAMEWORKS",
    isTranslatable: true,
    required: true,
  },

  // ── 4. CADRE LOGISTIQUE & TERRAIN ──
  {
    key: "partner_logistics_tag",
    label: "Surtitre Logistique & Terrain",
    description: "Ex: CADRE LOGISTIQUE & TERRAIN",
    type: "text",
    section: "LOGISTICS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_logistics_title",
    label: "Titre Logistique & Terrain",
    description: "Ex: Un accueil sécurisé et structuré à Agbélouvé",
    type: "text",
    section: "LOGISTICS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_logistics_subtitle",
    label: "Sous-titre Logistique & Terrain",
    description: "Ex: Située à 60 km au nord de Lomé sur la route nationale RN1...",
    type: "textarea",
    section: "LOGISTICS",
    isTranslatable: true,
    required: true,
  },

  // ── 5. PROCESSUS DE PARTENARIAT (4 ÉTAPES) ──
  {
    key: "partner_process_tag",
    label: "Surtitre Démarche",
    description: "Ex: DÉMARCHE EN 4 ÉTAPES",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_title",
    label: "Titre Démarche",
    description: "Ex: Comment construire notre partenariat ?",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_subtitle",
    label: "Sous-titre Démarche",
    description: "Ex: Un processus fluide et transparent pour officialiser et déployer notre collaboration.",
    type: "textarea",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step1_title",
    label: "Étape 1 - Titre",
    description: "Ex: Prise de contact & Note de cadrage",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step1_desc",
    label: "Étape 1 - Description",
    description: "Ex: Remplissez le formulaire en ligne pour nous présenter votre organisation...",
    type: "textarea",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step2_title",
    label: "Étape 2 - Titre",
    description: "Ex: Échange vidéo de cadrage",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step2_desc",
    label: "Étape 2 - Description",
    description: "Ex: Un rendez-vous de 30 minutes avec l'équipe de coordination...",
    type: "textarea",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step3_title",
    label: "Étape 3 - Titre",
    description: "Ex: Signature de la convention",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step3_desc",
    label: "Étape 3 - Description",
    description: "Ex: Établissement d'une convention formelle précisant les rôles...",
    type: "textarea",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step4_title",
    label: "Étape 4 - Titre",
    description: "Ex: Lancement opérationnel & Suivi",
    type: "text",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_process_step4_desc",
    label: "Étape 4 - Description",
    description: "Ex: Accueil des volontaires ou déploiement des actions sur le terrain...",
    type: "textarea",
    section: "PROCESS",
    isTranslatable: true,
    required: true,
  },

  // ── 6. FAQ PARTENAIRES ──
  {
    key: "partner_faq_tag",
    label: "Surtitre FAQ",
    description: "Ex: FAQ PARTENAIRES",
    type: "text",
    section: "FAQ",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_faq_title",
    label: "Titre FAQ",
    description: "Ex: Questions fréquentes des organisations",
    type: "text",
    section: "FAQ",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_faq_subtitle",
    label: "Sous-titre FAQ",
    description: "Ex: Toutes les réponses pour cadrer juridiquement et logistiquement votre partenariat.",
    type: "textarea",
    section: "FAQ",
    isTranslatable: true,
    required: true,
  },

  // ── 7. APPEL À L'ACTION FINAL (CTA) ──
  {
    key: "partner_cta_badge",
    label: "Surtitre badge CTA Final",
    description: "Ex: CO-CONSTRUISONS L'AVENIR",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_cta_title",
    label: "Titre CTA Final",
    description: "Ex: Prêt à officialiser un partenariat avec APTIC-R ?",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_cta_desc",
    label: "Texte de motivation CTA Final",
    description: "Ex: Rejoignez notre réseau d'organisations partenaires en Europe et en Afrique de l'Ouest...",
    type: "textarea",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_cta_btn_primary",
    label: "Bouton principal CTA Final",
    description: "Ex: REMPLIR LE FORMULAIRE DE PARTENARIAT",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
  {
    key: "partner_cta_btn_secondary",
    label: "Bouton secondaire CTA Final",
    description: "Ex: Découvrir l'espace des volontaires",
    type: "text",
    section: "CTA",
    isTranslatable: true,
    required: true,
  },
]

/**
 * Generates database key for a field according to language.
 */
export function getPartnerFieldDbKey(baseKey: string, lang: Language): string {
  const field = PARTNER_FIELDS.find((f) => f.key === baseKey)
  if (!field || !field.isTranslatable) {
    return baseKey
  }
  return `${baseKey}_${lang.toLowerCase()}`
}

/**
 * Calculates completeness percentage and missing required fields for a given language.
 */
export function calculatePartnerCompleteness(
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

  for (const field of PARTNER_FIELDS) {
    if (!field.required) continue
    totalCount++
    const dbKey = getPartnerFieldDbKey(field.key, lang)
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
