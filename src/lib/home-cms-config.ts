import type { Language } from "@/types"

export interface HomeFieldDefinition {
  key: string
  label: string
  description: string
  type: "text" | "textarea" | "image"
  section: "HERO" | "ABOUT" | "DOMAINS" | "IMPACT" | "PROJECTS" | "STORY" | "ENGAGEMENT" | "TESTIMONIALS" | "NEWSLETTER" | "CONTACT" | "SEO"
  isTranslatable: boolean
  required: boolean
}

export const HOME_SECTIONS = [
  { id: "HERO", label: "1. Hero" },
  { id: "ABOUT", label: "2. APTIC-R en quelques mots" },
  { id: "DOMAINS", label: "3. Nos Domaines d'Action" },
  { id: "IMPACT", label: "4. Notre Impact" },
  { id: "PROJECTS", label: "5. Nos Projets" },
  { id: "STORY", label: "6. Récit Documentaire" },
  { id: "ENGAGEMENT", label: "7. Engagement (4 façons d'agir)" },
  { id: "TESTIMONIALS", label: "8. Témoignages (Traductions de secours)" },
  { id: "NEWSLETTER", label: "9. Newsletter" },
  { id: "CONTACT", label: "10. Contact" },
  { id: "SEO", label: "11. SEO & Métadonnées" },
] as const

export const HOME_FIELDS: HomeFieldDefinition[] = [
  // ── HERO ──
  { key: "home_hero_badge", label: "Badge territoire", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_title", label: "Titre principal", description: "", type: "textarea", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_subtitle", label: "Sous-titre", description: "", type: "textarea", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_cta1_label", label: "Bouton Primaire", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_cta2_label", label: "Bouton Secondaire", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_stat1_val", label: "Stat 1 (Valeur)", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_stat1_lbl", label: "Stat 1 (Libellé)", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_stat2_val", label: "Stat 2 (Valeur)", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_stat2_lbl", label: "Stat 2 (Libellé)", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_stat3_val", label: "Stat 3 (Valeur)", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_stat3_lbl", label: "Stat 3 (Libellé)", description: "", type: "text", section: "HERO", isTranslatable: true, required: true },
  { key: "home_hero_image", label: "Image de fond (Hero)", description: "Image commune à toutes les langues.", type: "image", section: "HERO", isTranslatable: false, required: true },

  // ── ABOUT ──
  { key: "home_about_eyebrow", label: "Surtitre", description: "", type: "text", section: "ABOUT", isTranslatable: true, required: true },
  { key: "home_about_title", label: "Titre", description: "", type: "text", section: "ABOUT", isTranslatable: true, required: true },
  { key: "home_about_quote", label: "Citation d'accroche", description: "", type: "textarea", section: "ABOUT", isTranslatable: true, required: true },
  { key: "home_about_p1", label: "Paragraphe 1", description: "", type: "textarea", section: "ABOUT", isTranslatable: true, required: true },
  { key: "home_about_p2", label: "Paragraphe 2", description: "", type: "textarea", section: "ABOUT", isTranslatable: true, required: true },
  { key: "home_about_cta_label", label: "Bouton d'action", description: "", type: "text", section: "ABOUT", isTranslatable: true, required: true },

  // ── DOMAINS ──
  { key: "home_domains_tag", label: "Tag / Surtitre", description: "", type: "text", section: "DOMAINS", isTranslatable: true, required: true },
  { key: "home_domains_title", label: "Titre", description: "", type: "text", section: "DOMAINS", isTranslatable: true, required: true },
  { key: "home_domains_subtitle", label: "Sous-titre", description: "", type: "textarea", section: "DOMAINS", isTranslatable: true, required: true },
  { key: "home_domains_cta_label", label: "Bouton d'action", description: "", type: "text", section: "DOMAINS", isTranslatable: true, required: true },

  // ── IMPACT ──
  { key: "home_impact_tag", label: "Tag / Surtitre", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_title", label: "Titre", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat1_val", label: "Stat 1 (Valeur)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat1_lbl", label: "Stat 1 (Libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat1_sub", label: "Stat 1 (Sous-libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: false },
  { key: "home_impact_stat2_val", label: "Stat 2 (Valeur)", description: "Optionnel, calculé si non fourni", type: "text", section: "IMPACT", isTranslatable: true, required: false },
  { key: "home_impact_stat2_lbl", label: "Stat 2 (Libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat2_sub", label: "Stat 2 (Sous-libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: false },
  { key: "home_impact_stat3_val", label: "Stat 3 (Valeur)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat3_lbl", label: "Stat 3 (Libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat3_sub", label: "Stat 3 (Sous-libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: false },
  { key: "home_impact_stat4_val", label: "Stat 4 (Valeur)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat4_lbl", label: "Stat 4 (Libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: true },
  { key: "home_impact_stat4_sub", label: "Stat 4 (Sous-libellé)", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: false },
  { key: "home_impact_legal", label: "Mention légale", description: "", type: "text", section: "IMPACT", isTranslatable: true, required: false },

  // ── PROJECTS ──
  { key: "home_projects_tag", label: "Tag / Surtitre", description: "", type: "text", section: "PROJECTS", isTranslatable: true, required: true },
  { key: "home_projects_title", label: "Titre", description: "", type: "text", section: "PROJECTS", isTranslatable: true, required: true },
  { key: "home_projects_cta_label", label: "Bouton d'action", description: "", type: "text", section: "PROJECTS", isTranslatable: true, required: true },

  // ── STORY (Récit Documentaire) ──
  { key: "home_field_tag", label: "Tag / Surtitre", description: "", type: "text", section: "STORY", isTranslatable: true, required: true },
  { key: "home_field_quote", label: "Citation de terrain", description: "", type: "textarea", section: "STORY", isTranslatable: true, required: true },
  { key: "home_field_author", label: "Auteur", description: "", type: "text", section: "STORY", isTranslatable: true, required: true },
  { key: "home_field_location", label: "Lieu", description: "", type: "text", section: "STORY", isTranslatable: true, required: true },
  { key: "home_field_image", label: "Image documentaire", description: "Image commune.", type: "image", section: "STORY", isTranslatable: false, required: true },

  // ── ENGAGEMENT ──
  { key: "home_engagement_tag", label: "Tag / Surtitre", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_title", label: "Titre", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_subtitle", label: "Sous-titre", description: "", type: "textarea", section: "ENGAGEMENT", isTranslatable: true, required: true },
  
  { key: "home_engagement_c1_title", label: "Carte 1 - Titre", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c1_desc", label: "Carte 1 - Description", description: "", type: "textarea", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c1_cta", label: "Carte 1 - Bouton", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },

  { key: "home_engagement_c2_title", label: "Carte 2 - Titre", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c2_desc", label: "Carte 2 - Description", description: "", type: "textarea", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c2_cta", label: "Carte 2 - Bouton", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },

  { key: "home_engagement_c3_title", label: "Carte 3 - Titre", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c3_desc", label: "Carte 3 - Description", description: "", type: "textarea", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c3_cta", label: "Carte 3 - Bouton", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },

  { key: "home_engagement_c4_title", label: "Carte 4 - Titre", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c4_desc", label: "Carte 4 - Description", description: "", type: "textarea", section: "ENGAGEMENT", isTranslatable: true, required: true },
  { key: "home_engagement_c4_cta", label: "Carte 4 - Bouton", description: "", type: "text", section: "ENGAGEMENT", isTranslatable: true, required: true },

  // ── TESTIMONIALS ──
  { key: "home_testimonial_1_quote", label: "Témoignage 1 - Citation", description: "Utilisé uniquement si le témoignage EN/DE manque dans la DB.", type: "textarea", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_1_author", label: "Témoignage 1 - Auteur", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_1_role", label: "Témoignage 1 - Rôle", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_1_location", label: "Témoignage 1 - Lieu", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },

  { key: "home_testimonial_2_quote", label: "Témoignage 2 - Citation", description: "", type: "textarea", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_2_author", label: "Témoignage 2 - Auteur", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_2_role", label: "Témoignage 2 - Rôle", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_2_location", label: "Témoignage 2 - Lieu", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },

  { key: "home_testimonial_3_quote", label: "Témoignage 3 - Citation", description: "", type: "textarea", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_3_author", label: "Témoignage 3 - Auteur", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_3_role", label: "Témoignage 3 - Rôle", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },
  { key: "home_testimonial_3_location", label: "Témoignage 3 - Lieu", description: "", type: "text", section: "TESTIMONIALS", isTranslatable: true, required: false },

  // ── NEWSLETTER ──
  { key: "home_newsletter_eyebrow", label: "Surtitre", description: "", type: "text", section: "NEWSLETTER", isTranslatable: true, required: true },
  { key: "home_newsletter_title", label: "Titre", description: "", type: "text", section: "NEWSLETTER", isTranslatable: true, required: true },
  { key: "home_newsletter_desc", label: "Description", description: "", type: "textarea", section: "NEWSLETTER", isTranslatable: true, required: true },

  // ── CONTACT ──
  { key: "home_contact_tag", label: "Tag / Surtitre", description: "", type: "text", section: "CONTACT", isTranslatable: true, required: true },
  { key: "home_contact_title", label: "Titre", description: "", type: "text", section: "CONTACT", isTranslatable: true, required: true },
  { key: "home_contact_subtitle", label: "Sous-titre", description: "", type: "textarea", section: "CONTACT", isTranslatable: true, required: true },

  // ── SEO ──
  { key: "home_meta_title", label: "Méta Titre (SEO)", description: "", type: "text", section: "SEO", isTranslatable: true, required: false },
  { key: "home_meta_description", label: "Méta Description (SEO)", description: "", type: "textarea", section: "SEO", isTranslatable: true, required: false },
]

export function getHomeFieldDbKey(baseKey: string, lang: Language): string {
  const def = HOME_FIELDS.find((f) => f.key === baseKey)
  if (!def || !def.isTranslatable) {
    return baseKey
  }
  return `${baseKey}_${lang.toLowerCase()}`
}

export function calculateHomeCompleteness(
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

  for (const field of HOME_FIELDS) {
    if (!field.required) continue
    totalCount++
    const dbKey = getHomeFieldDbKey(field.key, lang)
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

export function isHomePagePublished(
  settings: Record<string, string>,
  lang: Language
): boolean {
  const publishedKey = `home_published_${lang.toLowerCase()}`
  return settings[publishedKey] === "PUBLISHED"
}
