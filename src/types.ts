export type Page =
  // Institutional pages
  | "home"                        // Nouvel accueil institutionnel
  | "about"                       // À propos
  | "domains"                     // Nos domaines
  | "projects"                    // Nos projets
  | "team"                        // Équipe
  | "news"                        // Actualités
  | "events"                      // Événements & Formations
  | "contact"                     // Contact
  | "resources"                   // Ressources
  | "gallery"                     // Galerie
  // Mobilisation pages
  | "volunteering"                // Portail volontariat (ancienne landing)
  | "apply"                       // Formulaire candidature volontariat
  | "partner"                     // Partenariats (page de présentation / cadre)
  | "partner-apply"               // Formulaire demande de partenariat
  | "membership"                  // Devenir membre
  | "support"                     // Soutenir / Faire un don
  // Admin pages
  | "admin-login"
  | "admin-dashboard"
  | "admin-applications"
  | "admin-candidate"
  | "admin-candidates"
  | "admin-analytics"
  | "admin-partner-requests"
  | "admin-partner-request-detail"
  | "admin-partners"
  | "admin-member-applications"
  | "admin-members"
  | "admin-articles"
  | "admin-projects"
  | "admin-domains"
  | "admin-events"
  | "admin-resources"
  | "admin-newsletter"
  | "admin-messages"
  | "admin-temoignages"
  | "admin-medias"
  | "admin-settings"
  | "admin-account"

export type Language = "FR" | "EN" | "DE"

/**
 * IMPORTANT — une seule URL canonique par contenu.
 * Les segments ci-dessous correspondent aux dossiers réellement présents sous
 * `src/app/[lang]/` et réellement servis par Next.js. Les anciens slugs localisés
 * (`about`, `news`, `projects`, `become-member`…) ne sont plus émis : le
 * middleware les redirige en 301 vers ces routes canoniques.
 */
export const PAGE_ROUTES: Record<string, Record<string, string>> = {
  home:          { fr: "",                 en: "",                 de: ""                   },
  about:         { fr: "a-propos",         en: "a-propos",         de: "a-propos"           },
  domains:       { fr: "domaines",         en: "domaines",         de: "domaines"           },
  projects:      { fr: "projets",          en: "projets",          de: "projets"            },
  team:          { fr: "equipe",           en: "equipe",           de: "equipe"             },
  news:          { fr: "actualites",       en: "actualites",       de: "actualites"         },
  events:        { fr: "evenements",       en: "evenements",       de: "evenements"         },
  contact:       { fr: "contact",          en: "contact",          de: "contact"            },
  resources:     { fr: "ressources",       en: "ressources",       de: "ressources"         },
  gallery:       { fr: "galerie",          en: "galerie",          de: "galerie"            },
  volunteering:  { fr: "volontariat",      en: "volontariat",      de: "volontariat"        },
  apply:         { fr: "volontariat/postuler", en: "volontariat/postuler", de: "volontariat/postuler" },
  partner:       { fr: "partenaires",      en: "partenaires",      de: "partenaires"        },
  "partner-apply": { fr: "partenaires/demande", en: "partenaires/demande", de: "partenaires/demande" },
  membership:    { fr: "devenir-membre",   en: "devenir-membre",   de: "devenir-membre"     },
  support:       { fr: "soutenir",         en: "support",          de: "unterstuetzen"      },
}

/**
 * Build a localized URL path for a given page.
 */
export function getPageUrl(page: Page, lang: Language): string {
  const langLower = lang.toLowerCase()
  const route = PAGE_ROUTES[page]
  if (!route) return `/${langLower}`
  const segment = route[langLower] || route.fr
  return segment ? `/${langLower}/${segment}` : `/${langLower}`
}
