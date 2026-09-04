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

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale
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

  // Admin route protection
  if (pathname.includes("/admin") && !pathname.includes("/admin/login")) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)
    
    // If not authenticated, redirect to login
    if (!session?.userId) {
      return NextResponse.redirect(new URL(`/${currentLocale}/admin/login`, request.url))
    }
  }

  // If going to login page but already authenticated, redirect to dashboard
  if (pathname.includes("/admin/login")) {
    const sessionCookie = request.cookies.get("session")?.value
    const session = await decrypt(sessionCookie)
    if (session?.userId) {
      return NextResponse.redirect(new URL(`/${currentLocale}/admin/dashboard`, request.url))
    }
  }

  const response = NextResponse.next()

  // Add strict anti-caching headers for admin routes to prevent bfcache (Back-Forward Cache) issues
  if (pathname.includes("/admin")) {
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
