/**
 * Configuration & Définitions du CMS pour la Page Contact
 *
 * Séparation stricte :
 *   CONTENU  → données publiques, traduisibles (accès, horaires, label carte)
 *   CONFIG   → paramètres internes, NON traduisibles (GPS, zoom, emails de routage)
 *
 * Les coordonnées globales (téléphone, email public, WhatsApp, adresse)
 * sont gérées dans l'onglet GENERAL et NE SONT PAS dupliquées ici.
 */

// ─── Types ───────────────────────────────────────────────────────────────

export interface ContactCmsSection {
  id: "CONTENT" | "MAP" | "ROUTING"
  title: string
  description: string
}

export interface ContactCmsField {
  key: string
  label: string
  section: "CONTENT" | "MAP" | "ROUTING"
  type: "text" | "textarea"
  multilingual: boolean
  required?: boolean
  description?: string
  placeholder?: string
}

// ─── Sections ────────────────────────────────────────────────────────────

export const CONTACT_SECTIONS: ContactCmsSection[] = [
  {
    id: "CONTENT",
    title: "01. Informations publiques",
    description:
      "Indication d'accès et horaires d'ouverture affichés sur la page Contact. Champs multilingues (FR / EN / DE).",
  },
  {
    id: "MAP",
    title: "02. Carte & localisation",
    description:
      "Coordonnées GPS et paramètres d'affichage de la carte OpenStreetMap intégrée.",
  },
  {
    id: "ROUTING",
    title: "03. Réception des demandes",
    description:
      "Adresses email internes vers lesquelles les formulaires et demandes sont acheminés. Ces adresses ne sont PAS affichées publiquement.",
  },
]

// ─── Champs ──────────────────────────────────────────────────────────────

export const CONTACT_FIELDS: ContactCmsField[] = [
  // ── SECTION CONTENT (traduisible) ──────────────────────────────────

  {
    key: "contact_access_info",
    label: "Indication d'accès",
    section: "CONTENT",
    type: "textarea",
    multilingual: true,
    required: true,
    description:
      "Comment se rendre au siège (ex: À 65 km au nord de Lomé sur la RN1).",
  },
  {
    key: "contact_hours_week",
    label: "Horaires semaine",
    section: "CONTENT",
    type: "text",
    multilingual: true,
    required: true,
    description: "Horaires du lundi au vendredi.",
    placeholder: "Lundi – Vendredi : 08h00 – 18h00 GMT",
  },
  {
    key: "contact_hours_sat",
    label: "Horaires samedi",
    section: "CONTENT",
    type: "text",
    multilingual: true,
    required: true,
    description: "Horaires du samedi.",
    placeholder: "Samedi : 09h00 – 14h00 (Ateliers jeunes)",
  },
  {
    key: "contact_hours_sun",
    label: "Horaires dimanche",
    section: "CONTENT",
    type: "text",
    multilingual: true,
    required: true,
    description: "Horaires ou fermeture le dimanche.",
    placeholder: "Dimanche : Fermé",
  },

  // ── SECTION MAP (non traduisible — configuration) ──────────────────

  {
    key: "contact_map_lat",
    label: "Latitude",
    section: "MAP",
    type: "text",
    multilingual: false,
    required: true,
    description: "Latitude du marqueur de la carte (ex: 6.5786).",
    placeholder: "6.5786",
  },
  {
    key: "contact_map_lng",
    label: "Longitude",
    section: "MAP",
    type: "text",
    multilingual: false,
    required: true,
    description: "Longitude du marqueur de la carte (ex: 1.1894).",
    placeholder: "1.1894",
  },
  {
    key: "contact_map_zoom",
    label: "Zoom de la carte",
    section: "MAP",
    type: "text",
    multilingual: false,
    required: false,
    description: "Niveau de zoom OpenStreetMap (défaut : 13).",
    placeholder: "13",
  },
  {
    key: "contact_map_label",
    label: "Nom du lieu affiché sur la carte",
    section: "MAP",
    type: "text",
    multilingual: false,
    required: false,
    description: "Libellé du badge de localisation (ex: Siège & FabLab APTIC-R).",
    placeholder: "Siège & FabLab APTIC-R",
  },

  // ── SECTION ROUTING (non traduisible — configuration interne) ──────

  {
    key: "contact_form_recipient",
    label: "Email de réception du formulaire",
    section: "ROUTING",
    type: "text",
    multilingual: false,
    required: true,
    description:
      "Adresse email qui reçoit les messages envoyés depuis le formulaire de contact.",
    placeholder: "aptic.rural19@gmail.com",
  },
  {
    key: "contact_email_general",
    label: "Email : Informations générales",
    section: "ROUTING",
    type: "text",
    multilingual: false,
    required: false,
    description:
      "Adresse de routage pour les demandes de type « Information générale ». Laisser vide = email formulaire par défaut.",
  },
  {
    key: "contact_email_volunteer",
    label: "Email : Volontariat & Missions",
    section: "ROUTING",
    type: "text",
    multilingual: false,
    required: false,
    description:
      "Adresse de routage pour les candidatures et demandes de volontariat.",
  },
  {
    key: "contact_email_partnership",
    label: "Email : Partenariats & Projets",
    section: "ROUTING",
    type: "text",
    multilingual: false,
    required: false,
    description:
      "Adresse de routage pour les propositions de partenariats et la coopération institutionnelle.",
  },
  {
    key: "contact_email_direction",
    label: "Email : Direction exécutive",
    section: "ROUTING",
    type: "text",
    multilingual: false,
    required: false,
    description:
      "Adresse de routage pour les questions de gouvernance et relations stratégiques.",
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Retourne la clé DB d'un champ.
 * Si le champ est multilingue, suffixe avec `_fr`, `_en` ou `_de`.
 */
export function getContactFieldDbKey(
  field: ContactCmsField,
  lang: "FR" | "EN" | "DE"
): string {
  if (!field.multilingual) return field.key
  return `${field.key}_${lang.toLowerCase()}`
}

/**
 * Calcul de complétude du CMS Contact pour une langue donnée.
 */
export function calculateContactCompleteness(
  values: Record<string, string>,
  lang: "FR" | "EN" | "DE"
): {
  totalCount: number
  filledCount: number
  percentage: number
  isComplete: boolean
  missingFields: ContactCmsField[]
} {
  const missingFields: ContactCmsField[] = []
  let filledCount = 0

  CONTACT_FIELDS.forEach((f) => {
    const dbKey = getContactFieldDbKey(f, lang)
    const val = values[dbKey]
    if (val && val.trim().length > 0) {
      filledCount++
    } else if (f.required) {
      missingFields.push(f)
    }
  })

  const totalCount = CONTACT_FIELDS.length
  const percentage =
    totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 100

  return {
    totalCount,
    filledCount,
    percentage,
    isComplete: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Vérifie si les contenus CMS essentiels (accès, horaires) de la page Contact sont renseignés pour la langue donnée.
 *
 * Hiérarchie :
 *   - CONTENU OBLIGATOIRE : Indication d'accès, horaires (conditionne la version linguistique)
 *   - CONTENU OPTIONNEL   : Carte GPS, zoom, label carte, emails spécialisés (ne bloquent jamais la page)
 *
 * Pas de fallback silencieux vers le français.
 */
export function isContactPageAvailable(
  settings: Record<string, string>,
  lang: "FR" | "EN" | "DE"
): boolean {
  const suffix = lang.toLowerCase()
  const access = settings[`contact_access_info_${suffix}`]
  const hours = settings[`contact_hours_week_${suffix}`]
  return Boolean(access && access.trim().length > 0 && hours && hours.trim().length > 0)
}
