export type Page =
  // Institutional pages
  | "home"                        // Nouvel accueil institutionnel
  | "about"                       // À propos
  | "domains"                     // Nos domaines
  | "projects"                    // Nos projets
  | "team"                        // Équipe
  | "news"                        // Actualités
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
  | "admin-members"
  | "admin-articles"
  | "admin-projects"
  | "admin-domains"
  | "admin-events"
  | "admin-newsletter"
  | "admin-settings"

export type Language = "FR" | "EN" | "DE"

/**
 * Route mapping for institutional pages.
 * Maps Page type to URL path segments per language.
 */
export const PAGE_ROUTES: Record<string, Record<string, string>> = {
  home:          { fr: "",                 en: "",                 de: ""                   },
  about:         { fr: "a-propos",         en: "about",            de: "ueber-uns"          },
  domains:       { fr: "domaines",         en: "domains",          de: "bereiche"           },
  projects:      { fr: "projets",          en: "projects",         de: "projekte"           },
  team:          { fr: "equipe",           en: "team",             de: "team"               },
  news:          { fr: "actualites",       en: "news",             de: "aktuelles"          },
  contact:       { fr: "contact",          en: "contact",          de: "kontakt"            },
  resources:     { fr: "ressources",       en: "resources",        de: "ressourcen"         },
  gallery:       { fr: "galerie",          en: "gallery",          de: "galerie"            },
  volunteering:  { fr: "volontariat",      en: "volunteering",     de: "freiwilligendienst" },
  apply:         { fr: "volontariat/postuler", en: "volunteering/apply", de: "freiwilligendienst/bewerben" },
  partner:       { fr: "partenaires",      en: "partners",         de: "partner"            },
  "partner-apply": { fr: "partenaires/demande", en: "partners/apply", de: "partner/anfrage" },
  membership:    { fr: "devenir-membre",   en: "become-member",    de: "mitglied-werden"    },
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
