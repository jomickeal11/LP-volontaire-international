"use client"

export interface CookieConsent {
  analytics: boolean
  timestamp: string
  version: string
}

const CONSENT_KEY = "apticr_consent"
const CONSENT_VERSION = "1.0"
// 6 mois en secondes (180 jours) conformément à la durée retenue pour le projet
const SIX_MONTHS_SECONDS = 180 * 24 * 60 * 60

/**
 * Récupère le consentement stocké (cookie ou localStorage).
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null

  // 1. Recherche dans les cookies du navigateur
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_KEY}=`))
    if (match) {
      const value = decodeURIComponent(match.split("=")[1])
      const parsed = JSON.parse(value) as CookieConsent
      if (typeof parsed.analytics === "boolean") {
        return parsed
      }
    }
  } catch {
    // Échec parsing cookie, fallback vers localStorage
  }

  // 2. Fallback localStorage
  try {
    const local = localStorage.getItem(CONSENT_KEY)
    if (local) {
      const parsed = JSON.parse(local) as CookieConsent
      if (typeof parsed.analytics === "boolean") {
        return parsed
      }
    }
  } catch {
    // localStorage non disponible
  }

  return null
}

/**
 * Enregistre le choix de consentement dans un cookie (6 mois) et dans le localStorage.
 */
export function setCookieConsent(analyticsAccepted: boolean): CookieConsent {
  const consent: CookieConsent = {
    analytics: analyticsAccepted,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  }

  if (typeof window !== "undefined") {
    const serialized = encodeURIComponent(JSON.stringify(consent))
    // Écriture du cookie (durée 6 mois)
    const isProd = window.location.protocol === "https:"
    document.cookie = `${CONSENT_KEY}=${serialized}; max-age=${SIX_MONTHS_SECONDS}; path=/; SameSite=Lax${
      isProd ? "; Secure" : ""
    }`

    // Écriture localStorage
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    } catch (e) {
      console.warn("[CookieConsent] Impossible d'écrire dans le localStorage:", e)
    }

    // Si analytics refusé, purger immédiatement les cookies Google Analytics existants
    if (!analyticsAccepted) {
      purgeGoogleAnalyticsCookies()
    }

    // Notification globale pour que les composants (GA loader, tracker) s'actualisent sans recharger la page
    window.dispatchEvent(
      new CustomEvent("apticr_consent_changed", { detail: consent }),
    )
  }

  return consent
}

/**
 * Purge les cookies résiduels de Google Analytics (_ga, _ga_*, _gid)
 */
export function purgeGoogleAnalyticsCookies(): void {
  if (typeof window === "undefined") return

  const hostname = window.location.hostname
  const hostParts = hostname.split(".")
  const domainsToClear = [
    hostname,
    `.${hostname}`,
    "",
    hostParts.length > 2 ? `.${hostParts.slice(-2).join(".")}` : "",
  ].filter(Boolean)

  const cookies = document.cookie.split("; ")
  for (const cookie of cookies) {
    const cookieName = cookie.split("=")[0]
    if (
      cookieName.startsWith("_ga") ||
      cookieName.startsWith("_gid") ||
      cookieName.startsWith("_gat")
    ) {
      for (const domain of domainsToClear) {
        document.cookie = `${cookieName}=; max-age=0; path=/; domain=${domain}`
      }
      document.cookie = `${cookieName}=; max-age=0; path=/;`
    }
  }
}

/**
 * Ouvre le panneau modal de préférences des cookies
 */
export function triggerOpenCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open_cookie_preferences"))
  }
}
