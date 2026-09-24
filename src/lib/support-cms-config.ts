/**
 * Configuration & Définitions du CMS pour la Page Soutien & Mécénat (Support)
 * Gère les sections dynamiques, les clés multilingues (FR, EN, DE),
 * l'image hero et le calcul de complétude.
 */

export interface SupportCmsField {
  key: string
  label: string
  type: "text" | "textarea" | "image"
  section: "HERO" | "AXES" | "WHY" | "TRANSPARENCY" | "FUTURE" | "CTA"
  multilingual: boolean
  description?: string
}

export interface SupportCmsSection {
  id: "HERO" | "AXES" | "WHY" | "TRANSPARENCY" | "FUTURE" | "CTA"
  title: string
  description: string
  iconName: string
}

export const SUPPORT_SECTIONS: SupportCmsSection[] = [
  {
    id: "HERO",
    title: "01. En-tête & Titre Principal (Hero)",
    description: "Badge thématique, grand titre, descriptif d'introduction, bouton d'action et photo de droite.",
    iconName: "ShieldIcon",
  },
  {
    id: "AXES",
    title: "02. Axes d'Accompagnement des Projets",
    description: "Surtitre, titre, sous-titre et les 4 cartes d'axes de soutien (Financement, Don matériel, Mécénat, Sponsoring).",
    iconName: "WheatIcon",
  },
  {
    id: "WHY",
    title: "03. Pourquoi Votre Soutien Compte ?",
    description: "Surtitre, grand titre d'impact territorial, texte d'Agbélouvé et 3 piliers de garantie.",
    iconName: "HeartPulseIcon",
  },
  {
    id: "TRANSPARENCY",
    title: "04. Transparence & Redevabilité",
    description: "Surtitre, titre de gestion responsable, texte légal (récépissé) et encart reçu fiscal/attestation.",
    iconName: "FileTextIcon",
  },
  {
    id: "FUTURE",
    title: "05. Évolution Future (Dons en Ligne)",
    description: "Surtitre, titre et texte d'information sur la future intégration des paiements en ligne.",
    iconName: "MonitorIcon",
  },
  {
    id: "CTA",
    title: "06. Appel au Contact & WhatsApp",
    description: "Titre d'incitation (« Vous souhaitez soutenir un projet spécifique ? »), descriptif et boutons de contact.",
    iconName: "ArrowRightIcon",
  },
]

export const SUPPORT_FIELDS: SupportCmsField[] = [
  // ── 01. HERO ──
  { key: "support_hero_badge", label: "Badge thématique Hero", type: "text", section: "HERO", multilingual: true },
  { key: "support_hero_title", label: "Grand Titre Hero", type: "text", section: "HERO", multilingual: true },
  { key: "support_hero_desc", label: "Description Hero", type: "textarea", section: "HERO", multilingual: true },
  { key: "support_hero_cta", label: "Libellé du Bouton Hero", type: "text", section: "HERO", multilingual: true },
  { key: "support_hero_image", label: "Photo d'illustration Hero", type: "image", section: "HERO", multilingual: false, description: "Photo affichée à droite de la section Hero" },

  // ── 02. AXES (FAÇONS D'ACCOMPAGNER DYNAMIQUES) ──
  { key: "support_axes_tag", label: "Surtitre / Tag Section", type: "text", section: "AXES", multilingual: true },
  { key: "support_axes_title", label: "Titre de la Section", type: "text", section: "AXES", multilingual: true },
  { key: "support_axes_subtitle", label: "Sous-titre explicatif", type: "textarea", section: "AXES", multilingual: true },

  { key: "support_axes_1_title", label: "Axe 1 - Titre", type: "text", section: "AXES", multilingual: true },
  { key: "support_axes_1_desc", label: "Axe 1 - Description", type: "textarea", section: "AXES", multilingual: true },
  { key: "support_axes_1_link", label: "Axe 1 - Texte du lien", type: "text", section: "AXES", multilingual: true },

  { key: "support_axes_2_title", label: "Axe 2 - Titre", type: "text", section: "AXES", multilingual: true },
  { key: "support_axes_2_desc", label: "Axe 2 - Description", type: "textarea", section: "AXES", multilingual: true },
  { key: "support_axes_2_link", label: "Axe 2 - Texte du lien", type: "text", section: "AXES", multilingual: true },

  { key: "support_axes_3_title", label: "Axe 3 - Titre", type: "text", section: "AXES", multilingual: true },
  { key: "support_axes_3_desc", label: "Axe 3 - Description", type: "textarea", section: "AXES", multilingual: true },
  { key: "support_axes_3_link", label: "Axe 3 - Texte du lien", type: "text", section: "AXES", multilingual: true },

  { key: "support_axes_4_title", label: "Axe 4 - Titre", type: "text", section: "AXES", multilingual: true },
  { key: "support_axes_4_desc", label: "Axe 4 - Description", type: "textarea", section: "AXES", multilingual: true },
  { key: "support_axes_4_link", label: "Axe 4 - Texte du lien", type: "text", section: "AXES", multilingual: true },

  // ── 03. WHY (IMPACT DIRECT & PILIERS) ──
  { key: "support_why_tag", label: "Surtitre / Tag Section", type: "text", section: "WHY", multilingual: true },
  { key: "support_why_title", label: "Titre de la Section", type: "text", section: "WHY", multilingual: true },
  { key: "support_why_desc", label: "Paragraphe principal d'impact à Agbélouvé", type: "textarea", section: "WHY", multilingual: true },

  { key: "support_why_point1_title", label: "Pilier 1 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "support_why_point1_desc", label: "Pilier 1 - Description", type: "textarea", section: "WHY", multilingual: true },

  { key: "support_why_point2_title", label: "Pilier 2 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "support_why_point2_desc", label: "Pilier 2 - Description", type: "textarea", section: "WHY", multilingual: true },

  { key: "support_why_point3_title", label: "Pilier 3 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "support_why_point3_desc", label: "Pilier 3 - Description", type: "textarea", section: "WHY", multilingual: true },

  // ── 04. TRANSPARENCY ──
  { key: "support_transparency_tag", label: "Surtitre / Tag Section", type: "text", section: "TRANSPARENCY", multilingual: true },
  { key: "support_transparency_title", label: "Titre de la Section", type: "text", section: "TRANSPARENCY", multilingual: true },
  { key: "support_transparency_desc", label: "Texte légal et de gouvernance", type: "textarea", section: "TRANSPARENCY", multilingual: true },
  { key: "support_transparency_receipt", label: "Encart reçu fiscal / attestation de don", type: "textarea", section: "TRANSPARENCY", multilingual: true },

  // ── 05. FUTURE ──
  { key: "support_future_tag", label: "Surtitre / Tag Section", type: "text", section: "FUTURE", multilingual: true },
  { key: "support_future_title", label: "Titre de la Section", type: "text", section: "FUTURE", multilingual: true },
  { key: "support_future_desc", label: "Texte sur les dons en ligne futurs", type: "textarea", section: "FUTURE", multilingual: true },

  // ── 06. CTA ──
  { key: "support_cta_title", label: "Titre de l'Appel au Contact", type: "text", section: "CTA", multilingual: true },
  { key: "support_cta_desc", label: "Sous-titre descriptif", type: "textarea", section: "CTA", multilingual: true },
  { key: "support_cta_btn_contact", label: "Bouton « Nous contacter »", type: "text", section: "CTA", multilingual: true },
  { key: "support_cta_btn_whatsapp", label: "Bouton « WhatsApp »", type: "text", section: "CTA", multilingual: true },
]

export function getSupportFieldDbKey(field: SupportCmsField, lang: "FR" | "EN" | "DE"): string {
  if (!field.multilingual) return field.key
  return `${field.key}_${lang.toLowerCase()}`
}

export function calculateSupportCompleteness(
  settings: Record<string, string>,
  lang: "FR" | "EN" | "DE"
): { percentage: number; filledCount: number; totalCount: number; missingKeys: string[] } {
  let filledCount = 0
  const missingKeys: string[] = []
  const totalCount = SUPPORT_FIELDS.length

  for (const field of SUPPORT_FIELDS) {
    const dbKey = getSupportFieldDbKey(field, lang)
    const val = settings[dbKey]
    if (val && val.trim().length > 0) {
      filledCount++
    } else {
      missingKeys.push(dbKey)
    }
  }

  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0
  return { percentage, filledCount, totalCount, missingKeys }
}
