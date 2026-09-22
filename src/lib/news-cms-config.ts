/**
 * Configuration des champs éditables pour la page Actualités
 */

export interface NewsSectionConfig {
  id: "HERO" | "CTA"
  title: string
  description: string
}

export interface NewsFieldConfig {
  key: string
  label: string
  section: "HERO" | "CTA"
  type: "text" | "textarea"
  multilingual: boolean
  required?: boolean
  description?: string
}

export const NEWS_SECTIONS: NewsSectionConfig[] = [
  {
    id: "HERO",
    title: "01. En-tête & Titre de la page",
    description: "Surtitre, titre principal et description d'introduction du Journal d'APTIC-R.",
  },
  {
    id: "CTA",
    title: "02. Bandeau d'action de bas de page",
    description: "Titre, texte explicatif et libellés des boutons d'orientation vers les Projets et Partenariats.",
  },
]

export const NEWS_FIELDS: NewsFieldConfig[] = [
  // SECTION HERO
  {
    key: "news_hero_badge",
    label: "Surtitre / Badge",
    section: "HERO",
    type: "text",
    multilingual: true,
    required: true,
    description: "Petit label supérieur (ex: ACTUALITÉS).",
  },
  {
    key: "news_hero_title",
    label: "Titre principal de la page",
    section: "HERO",
    type: "text",
    multilingual: true,
    required: true,
    description: "Grand titre de la section actualités (ex: Le Journal d’APTIC-R).",
  },
  {
    key: "news_hero_subtitle",
    label: "Sous-titre descriptif",
    section: "HERO",
    type: "textarea",
    multilingual: true,
    required: true,
    description: "Phrase résumant les publications et récits de terrain.",
  },

  // SECTION CTA
  {
    key: "news_cta_title",
    label: "Titre du bandeau CTA",
    section: "CTA",
    type: "text",
    multilingual: true,
    required: true,
    description: "Titre d'invitation en fin de page.",
  },
  {
    key: "news_cta_desc",
    label: "Description du bandeau CTA",
    section: "CTA",
    type: "textarea",
    multilingual: true,
    required: true,
    description: "Texte d'explication pour découvrir les projets ou devenir partenaire.",
  },
  {
    key: "news_cta_btn_projects",
    label: "Bouton Projets",
    section: "CTA",
    type: "text",
    multilingual: true,
    required: true,
    description: "Libellé du premier bouton d'action (ex: Consulter nos projets).",
  },
  {
    key: "news_cta_btn_partner",
    label: "Bouton Partenaires",
    section: "CTA",
    type: "text",
    multilingual: true,
    required: true,
    description: "Libellé du second bouton d'action (ex: Devenir partenaire).",
  },
]

export function getNewsFieldDbKey(field: NewsFieldConfig, lang: "FR" | "EN" | "DE"): string {
  if (!field.multilingual) return field.key
  return `${field.key}_${lang.toLowerCase()}`
}

export function calculateNewsCompleteness(
  values: Record<string, string>,
  lang: "FR" | "EN" | "DE"
): { totalCount: number; filledCount: number; percentage: number; isComplete: boolean; missingFields: NewsFieldConfig[] } {
  const missingFields: NewsFieldConfig[] = []
  let filledCount = 0

  NEWS_FIELDS.forEach((f) => {
    const dbKey = getNewsFieldDbKey(f, lang)
    const val = values[dbKey]
    if (val && val.trim().length > 0) {
      filledCount++
    } else if (f.required) {
      missingFields.push(f)
    }
  })

  const totalCount = NEWS_FIELDS.length
  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 100

  return {
    totalCount,
    filledCount,
    percentage,
    isComplete: missingFields.length === 0,
    missingFields,
  }
}
