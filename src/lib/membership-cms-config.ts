/**
 * Configuration & Définitions du CMS pour la Page Adhésion / Membres (Membership)
 * Gère les sections dynamiques, les clés multilingues (FR, EN, DE),
 * et le calcul de complétude.
 */

export interface MembershipCmsField {
  key: string
  label: string
  type: "text" | "textarea" | "number"
  section: "HERO" | "WHY" | "CONTRIBUTE" | "WHO" | "CTA" | "FORM"
  multilingual: boolean
  description?: string
  placeholder?: string
}

export interface MembershipCmsSection {
  id: "HERO" | "WHY" | "CONTRIBUTE" | "WHO" | "CTA" | "FORM"
  title: string
  description: string
  iconName: string
}

export const MEMBERSHIP_SECTIONS: MembershipCmsSection[] = [
  {
    id: "HERO",
    title: "01. En-tête & Titre Principal (Hero)",
    description: "Badge thématique, grand titre, descriptif d'introduction et bouton vers le formulaire.",
    iconName: "ShieldIcon",
  },
  {
    id: "WHY",
    title: "02. Pourquoi Devenir Membre ?",
    description: "Surtitre, titre de section, sous-titre et les cartes piliers d'impact (numérotées dynamiquement).",
    iconName: "HeartPulseIcon",
  },
  {
    id: "CONTRIBUTE",
    title: "03. Modes d'Engagement & Contribution",
    description: "Surtitre, titre de section, sous-titre et les cartes de formats de contribution.",
    iconName: "UsersIcon",
  },
  {
    id: "WHO",
    title: "04. Qui Peut Rejoindre APTIC-R ?",
    description: "Surtitre, titre, texte principal, texte de solidarité et badges de profils cibles.",
    iconName: "UserCheckIcon",
  },
  {
    id: "CTA",
    title: "05. Bannière d'Appel à l'Action (CTA)",
    description: "Surtitre, titre d'incitation, texte d'encouragement et bouton d'action.",
    iconName: "ArrowRightIcon",
  },
  {
    id: "FORM",
    title: "06. Formulaire d'Adhésion (Titres & Libellés)",
    description: "Surtitre, titre du formulaire et sous-titre descriptif.",
    iconName: "FileTextIcon",
  },
]

export const MEMBERSHIP_FIELDS: MembershipCmsField[] = [
  // ── 01. HERO ──
  { key: "membership_hero_badge", label: "Badge thématique Hero", type: "text", section: "HERO", multilingual: true },
  { key: "membership_hero_title", label: "Grand Titre Hero", type: "text", section: "HERO", multilingual: true },
  { key: "membership_hero_desc", label: "Description d'introduction Hero", type: "textarea", section: "HERO", multilingual: true },
  { key: "membership_hero_cta", label: "Libellé du Bouton Hero", type: "text", section: "HERO", multilingual: true },

  // ── 02. WHY (POURQUOI DEVENIR MEMBRE) ──
  { key: "membership_why_tag", label: "Surtitre / Tag Section", type: "text", section: "WHY", multilingual: true },
  { key: "membership_why_title", label: "Titre de la Section", type: "text", section: "WHY", multilingual: true },
  { key: "membership_why_subtitle", label: "Sous-titre explicatif", type: "textarea", section: "WHY", multilingual: true },

  { key: "membership_why_card1_title", label: "Pilier 1 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "membership_why_card1_desc", label: "Pilier 1 - Description", type: "textarea", section: "WHY", multilingual: true },

  { key: "membership_why_card2_title", label: "Pilier 2 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "membership_why_card2_desc", label: "Pilier 2 - Description", type: "textarea", section: "WHY", multilingual: true },

  { key: "membership_why_card3_title", label: "Pilier 3 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "membership_why_card3_desc", label: "Pilier 3 - Description", type: "textarea", section: "WHY", multilingual: true },

  { key: "membership_why_card4_title", label: "Pilier 4 - Titre", type: "text", section: "WHY", multilingual: true },
  { key: "membership_why_card4_desc", label: "Pilier 4 - Description", type: "textarea", section: "WHY", multilingual: true },

  // ── 03. CONTRIBUTE (MODES D'ENGAGEMENT) ──
  { key: "membership_contribute_tag", label: "Surtitre / Tag Section", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_title", label: "Titre de la Section", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_subtitle", label: "Sous-titre explicatif", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  { key: "membership_contribute_item1_title", label: "Mode 1 - Titre", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_item1_desc", label: "Mode 1 - Description", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  { key: "membership_contribute_item2_title", label: "Mode 2 - Titre", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_item2_desc", label: "Mode 2 - Description", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  { key: "membership_contribute_item3_title", label: "Mode 3 - Titre", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_item3_desc", label: "Mode 3 - Description", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  { key: "membership_contribute_item4_title", label: "Mode 4 - Titre", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_item4_desc", label: "Mode 4 - Description", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  { key: "membership_contribute_item5_title", label: "Mode 5 - Titre", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_item5_desc", label: "Mode 5 - Description", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  { key: "membership_contribute_item6_title", label: "Mode 6 - Titre", type: "text", section: "CONTRIBUTE", multilingual: true },
  { key: "membership_contribute_item6_desc", label: "Mode 6 - Description", type: "textarea", section: "CONTRIBUTE", multilingual: true },

  // ── 04. WHO (QUI PEUT REJOINDRE) ──
  { key: "membership_who_tag", label: "Surtitre / Tag Section", type: "text", section: "WHO", multilingual: true },
  { key: "membership_who_title", label: "Titre de la Section", type: "text", section: "WHO", multilingual: true },
  { key: "membership_who_text", label: "Texte principal d'inclusion", type: "textarea", section: "WHO", multilingual: true },
  { key: "membership_who_subtext", label: "Texte secondaire / Valeurs", type: "textarea", section: "WHO", multilingual: true },
  { key: "membership_who_badges", label: "Badges de profils (séparés par des virgules)", type: "text", section: "WHO", multilingual: true },

  // ── 05. CTA BANNER ──
  { key: "membership_cta_tag", label: "Surtitre / Tag CTA", type: "text", section: "CTA", multilingual: true },
  { key: "membership_cta_title", label: "Titre de l'incitation", type: "text", section: "CTA", multilingual: true },
  { key: "membership_cta_desc", label: "Description de la bannière", type: "textarea", section: "CTA", multilingual: true },
  { key: "membership_cta_btn", label: "Libellé du Bouton", type: "text", section: "CTA", multilingual: true },

  // ── 06. FORM HEADERS ──
  { key: "membership_form_tag", label: "Surtitre Formulaire", type: "text", section: "FORM", multilingual: true },
  { key: "membership_form_title", label: "Titre du Formulaire", type: "text", section: "FORM", multilingual: true },
  { key: "membership_form_desc", label: "Sous-titre descriptif Formulaire", type: "textarea", section: "FORM", multilingual: true },
]

export function getMembershipFieldDbKey(field: MembershipCmsField, lang: "FR" | "EN" | "DE"): string {
  if (!field.multilingual) return field.key
  return `${field.key}_${lang.toLowerCase()}`
}

export function calculateMembershipCompleteness(
  settings: Record<string, string>,
  lang: "FR" | "EN" | "DE"
): { percentage: number; filledCount: number; totalCount: number; missingKeys: string[] } {
  let filledCount = 0
  const missingKeys: string[] = []
  const totalCount = MEMBERSHIP_FIELDS.length

  for (const field of MEMBERSHIP_FIELDS) {
    const dbKey = getMembershipFieldDbKey(field, lang)
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
