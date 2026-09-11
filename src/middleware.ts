import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "./lib/auth"

const locales = ["fr", "en", "de"]
const defaultLocale = "fr"

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

  if (isBackoffice && !isBackofficeLogin) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)

    if (!session?.userId) {
      return NextResponse.redirect(new URL("/backoffice/login", request.url))
    }
  }

  // If going to login page but already authenticated, redirect to dashboard
  if (isBackofficeLogin) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)
    if (session?.userId) {
      return NextResponse.redirect(new URL("/backoffice/dashboard", request.url))
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

  // Redirect if there is no locale (e.g. /apply -> /fr/apply)
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(
        `/${defaultLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    )
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
