import type { Page } from "@/types"

/* ============================================================================
   CONVENTION GLOBALE DU HEADER PUBLIC
   ============================================================================

   Règle unique, décidée ici et nulle part ailleurs. Le type de header d'une
   page est déterminé par son PATRONE DE ROUTE, pas par son nom de page ni par
   une condition dispersée dans les composants.

   Trois modes :

   - fullHeader        Navigation principale + sélecteur de langue + CTA
                       « Devenir volontaire ». Pages de navigation, listings,
                       pages institutionnelles et pages légales.
   - simplifiedHeader  Identité APTIC-R réduite : logo, retour éventuel vers le
                       portail, sélecteur de langue. Aucune navigation.
                       Parcours de formulaire.
   - noHeader          Aucun header global. Pages de détail immersives, qui
                       n'affichent qu'un lien de retour vers leur liste.
                       Le Footer global reste présent.

   `Header.tsx` n'est jamais modifié : c'est `PageHeader` qui décide du mode
   et qui rend `Header`, `SimplifiedHeader`, ou rien.
   ========================================================================= */

export const HEADER_MODES = {
  full: "fullHeader",
  simplified: "simplifiedHeader",
  none: "noHeader",
} as const

export type HeaderMode = (typeof HEADER_MODES)[keyof typeof HEADER_MODES]

export const DEFAULT_HEADER_MODE: HeaderMode = HEADER_MODES.full

/* ── Motifs de route du site public ──────────────────────────────────────── *
 * Centralisés pour éviter tout littéral de route répété dans les vues.        */

export const ROUTES = {
  home: "",
  about: "/a-propos",
  team: "/equipe",
  domainsList: "/domaines",
  domainDetail: "/domaines/[slug]",
  projectsList: "/projets",
  projectDetail: "/projets/[slug]",
  newsList: "/actualites",
  newsDetail: "/actualites/[slug]",
  eventsList: "/evenements",
  eventDetail: "/evenements/[slug]",
  resources: "/ressources",
  gallery: "/galerie",
  contact: "/contact",
  membership: "/devenir-membre",
  support: "/soutenir",
  volunteering: "/volontariat",
  apply: "/volontariat/postuler",
  partner: "/partenaires",
  partnerApply: "/partenaires/demande",
  legal: "/[slug]",
} as const

/* ── Registre : motif de route → mode de header ───────────────────────────── *
 * Seule source de vérité. Toute nouvelle route doit être déclarée ici.        */

export const ROUTE_HEADER_MODE: Record<string, HeaderMode> = {
  /* 2. Pages principales / listings → header complet */
  [ROUTES.home]: HEADER_MODES.full,
  [ROUTES.about]: HEADER_MODES.full,
  [ROUTES.team]: HEADER_MODES.full,
  [ROUTES.domainsList]: HEADER_MODES.full,
  [ROUTES.projectsList]: HEADER_MODES.full,
  [ROUTES.newsList]: HEADER_MODES.full,
  [ROUTES.eventsList]: HEADER_MODES.full,
  [ROUTES.resources]: HEADER_MODES.full,
  [ROUTES.gallery]: HEADER_MODES.full,
  [ROUTES.contact]: HEADER_MODES.full,
  [ROUTES.membership]: HEADER_MODES.full,
  [ROUTES.support]: HEADER_MODES.full,
  [ROUTES.volunteering]: HEADER_MODES.full,
  [ROUTES.partner]: HEADER_MODES.full,

  /* 1. Pages de détail immersives → aucun header global */
  [ROUTES.newsDetail]: HEADER_MODES.none,
  [ROUTES.eventDetail]: HEADER_MODES.none,
  [ROUTES.projectDetail]: HEADER_MODES.none,
  [ROUTES.domainDetail]: HEADER_MODES.none,

  /* 3. Formulaires / parcours → header simplifié */
  [ROUTES.apply]: HEADER_MODES.simplified,
  [ROUTES.partnerApply]: HEADER_MODES.simplified,

  /* 4. Pages légales → header complet */
  [ROUTES.legal]: HEADER_MODES.full,
}

/**
 * Mode de header d'une page, à partir de son motif de route.
 * Route non déclarée → header complet (comportement historique).
 */
export function getHeaderMode(routePattern: string): HeaderMode {
  return ROUTE_HEADER_MODE[routePattern] ?? DEFAULT_HEADER_MODE
}

/** `true` si la page de détail immerse d'une liste (aucun header global). */
export function isImmersiveDetail(routePattern: string): boolean {
  return getHeaderMode(routePattern) === HEADER_MODES.none
}

/** `true` si la page est un formulaire (header simplifié). */
export function isFormRoute(routePattern: string): boolean {
  return getHeaderMode(routePattern) === HEADER_MODES.simplified
}

/**
 * Liste de retour d'une page de détail vers sa listing.
 * Utilisée par les pages de détail à la place d'un header global.
 */
export function getDetailBackPage(routePattern: string): Page | null {
  const map: Record<string, Page> = {
    [ROUTES.newsDetail]: "news",
    [ROUTES.eventDetail]: "events",
    [ROUTES.projectDetail]: "projects",
    [ROUTES.domainDetail]: "domains",
  }
  return map[routePattern] ?? null
}
