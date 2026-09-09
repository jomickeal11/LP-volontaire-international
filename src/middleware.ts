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
  if (pathname.includes("/admin")) {
    const updatedPath = pathname.replace("/admin", "/backoffice")
    return NextResponse.redirect(new URL(updatedPath, request.url))
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale (e.g. /backoffice/login -> /fr/backoffice/login)
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(
        `/${defaultLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    )
  }

  // Determine the current locale for potential auth redirects
  let currentLocale = defaultLocale
  for (const loc of locales) {
    if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
      currentLocale = loc
      break
    }
  }

  // Back-office route protection
  const isBackoffice = pathname.includes("/backoffice")
  const isBackofficeLogin = pathname.includes("/backoffice/login")

  if (isBackoffice && !isBackofficeLogin) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)
    
    // If not authenticated, redirect to back-office login
    if (!session?.userId) {
      return NextResponse.redirect(new URL(`/${currentLocale}/backoffice/login`, request.url))
    }
  }

  // If going to login page but already authenticated, redirect to back-office dashboard
  if (isBackofficeLogin) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)
    if (session?.userId) {
      return NextResponse.redirect(new URL(`/${currentLocale}/backoffice/dashboard`, request.url))
    }
  }

  const response = NextResponse.next()

  // Add strict anti-caching headers for back-office routes to prevent bfcache issues
  if (isBackoffice) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  return response
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
