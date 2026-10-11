import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/jwt"

const locales = ["fr", "en", "de"]
const defaultLocale = "fr"

/**
 * Legacy route redirects: map old paths to new institutional paths.
 * Format: { oldSegment: newSegment }
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  // Ancien formulaire de candidature → nouvelle route canonique
  "apply": "volontariat/postuler",
  // Anciens slugs localisés → routes canoniques réellement servies
  "partners": "partenaires",
  "partner": "partenaires",
  "domains": "domaines",
  "bereiche": "domaines",
  "projects": "projets",
  "projekte": "projets",
  "about": "a-propos",
  "ueber-uns": "a-propos",
  "team": "equipe",
  "news": "actualites",
  "aktuelles": "actualites",
  "resources": "ressources",
  "ressourcen": "ressources",
  "gallery": "galerie",
  "become-member": "devenir-membre",
  "mitglied-werden": "devenir-membre",
  "kontakt": "contact",
  "volunteering": "volontariat",
  "freiwilligendienst": "volontariat",
}

/**
 * Anciennes routes à plusieurs segments → routes canoniques.
 */
const LEGACY_MULTI_REDIRECTS: Record<string, string> = {
  "/fr/partners/apply": "/fr/partenaires/demande",
  "/en/partners/apply": "/en/partenaires/demande",
  "/de/partners/apply": "/de/partenaires/demande",
  "/fr/partner/anfrage": "/fr/partenaires/demande",
  "/en/partner/anfrage": "/en/partenaires/demande",
  "/de/partner/anfrage": "/de/partenaires/demande",
  "/en/volunteering/apply": "/en/volontariat/postuler",
  "/de/freiwilligendienst/bewerben": "/de/volontariat/postuler",
}

/**
 * Alias localisés du même contenu : une seule URL canonique par langue.
 * `/fr/support` → `/fr/soutenir`, `/en/soutenir` → `/en/support`, etc.
 */
const LOCALIZED_ALIASES: Record<string, Record<string, string>> = {
  fr: { support: "soutenir", unterstuetzen: "soutenir" },
  en: { soutenir: "support", unterstuetzen: "support" },
  de: { soutenir: "unterstuetzen", support: "unterstuetzen" },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclude API routes, next internal routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Backward compatibility: redirect any legacy /admin path to /backoffice
  if (pathname.includes("/admin") && !pathname.includes("/backoffice")) {
    const updatedPath = pathname.replace("/admin", "/backoffice")
    return NextResponse.redirect(new URL(updatedPath, request.url))
  }

  // Legacy redirect: /fr/backoffice/... -> /backoffice/...
  // /en/backoffice/... -> /backoffice/...
  // /de/backoffice/... -> /backoffice/...
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/backoffice`)) {
      const newPath = pathname.slice(`/${locale}`.length)
      return NextResponse.redirect(new URL(newPath, request.url), { status: 301 })
    }
  }

  // Back-office route protection (no locale prefix)
  const isBackoffice = pathname.startsWith("/backoffice")
  const isBackofficeLogin = pathname === "/backoffice/login"
  const isPublicAccountRecoveryPage =
    pathname === "/backoffice/confirmer-email" ||
    pathname === "/backoffice/reinitialiser-mot-de-passe" ||
    pathname === "/backoffice/invitation"

  if (isBackoffice && !isBackofficeLogin && !isPublicAccountRecoveryPage) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)

    if (!session?.userId) {
      return NextResponse.redirect(new URL("/backoffice/login", request.url))
    }
  }

  // If going to login page but already authenticated, redirect to dashboard.
  // Le marqueur `session=invalid` (posé par le layout de protection lorsque le
  // compte n'existe plus en base) doit afficher la page de connexion même si
  // le cookie JWT reste techniquement valide : sans ce skip, on entrerait
  // dans une boucle de redirection login <-> dashboard.
  if (isBackofficeLogin) {
    const sessionInvalid =
      request.nextUrl.searchParams.get("session") === "invalid"
    if (!sessionInvalid) {
      const sessionCookie = request.cookies.get("session")?.value
      const session = await decrypt(sessionCookie)
      if (session?.userId) {
        return NextResponse.redirect(new URL("/backoffice/dashboard", request.url))
      }
    }
  }

  // For backoffice routes, add anti-caching headers and skip locale logic
  if (isBackoffice) {
    const response = NextResponse.next()
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  }

  // ── Public multilingual routes ──────────────────────────────────────────────

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale (e.g. /apply -> /fr/apply).
  // Conserve la query string (utm_*, etc.) : les liens de campagne arrivent
  // sans préfixe de langue et l'attribution UTM first-touch en dépend.
  if (pathnameIsMissingLocale) {
    const url = new URL(
      `/${defaultLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
      request.url,
    )
    url.search = request.nextUrl.search
    return NextResponse.redirect(url)
  }

  // ── Legacy route redirects (301 permanent) ──────────────────────────────────
  // Redirect old route segments to new institutional routes
  // Alias multi-segments (ex. /en/partners/apply → /en/partenaires/demande)
  const multiSegmentTarget = LEGACY_MULTI_REDIRECTS[pathname]
  if (multiSegmentTarget) {
    const url = new URL(multiSegmentTarget, request.url)
    url.search = request.nextUrl.search
    return NextResponse.redirect(url, {
      status: 301,
    })
  }

  for (const locale of locales) {
    // Alias localisés : une seule URL canonique par contenu dans chaque langue.
    const aliases = LOCALIZED_ALIASES[locale]
    if (aliases) {
      for (const [alias, target] of Object.entries(aliases)) {
        if (pathname === `/${locale}/${alias}` || pathname === `/${locale}/${alias}/`) {
          const url = new URL(`/${locale}/${target}`, request.url)
          url.search = request.nextUrl.search
          return NextResponse.redirect(url, {
            status: 301,
          })
        }
      }
    }

    for (const [oldSegment, newSegment] of Object.entries(LEGACY_REDIRECTS)) {
      const oldPath = `/${locale}/${oldSegment}`
      if (pathname === oldPath || pathname === `${oldPath}/`) {
        const url = new URL(`/${locale}/${newSegment}`, request.url)
        url.search = request.nextUrl.search
        return NextResponse.redirect(url, { status: 301 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/` and `/uploads/` (médias publics servis par leur route)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
}
