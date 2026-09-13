"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getCookieConsent, purgeGoogleAnalyticsCookies } from "@/lib/cookieConsent"

interface GoogleAnalyticsLoaderProps {
  gaId: string | null
}

export default function GoogleAnalyticsLoader({ gaId }: GoogleAnalyticsLoaderProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!gaId) return

    const loadGA4 = () => {
      // Si déjà chargé
      if (document.getElementById("gtag-script-src")) {
        // Juste renvoyer pageview
        if (typeof (window as any).gtag === "function") {
          ;(window as any).gtag("config", gaId, {
            page_path: window.location.pathname,
          })
        }
        return
      }

      // Re-enable in window if was previously disabled
      delete (window as any)[`ga-disable-${gaId}`]

      // 1. Script externe Google Tag Manager
      const script = document.createElement("script")
      script.id = "gtag-script-src"
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script)

      // 2. Initialisation gtag dataLayer
      ;(window as any).dataLayer = (window as any).dataLayer || []
      function gtag(...args: any[]) {
        ;(window as any).dataLayer.push(args)
      }
      ;(window as any).gtag = gtag
      gtag("js", new Date())
      gtag("config", gaId, {
        page_path: window.location.pathname,
      })
    }

    const disableGA4 = () => {
      ;(window as any)[`ga-disable-${gaId}`] = true
      purgeGoogleAnalyticsCookies()

      // Retirer les balises scripts si présentes
      const srcEl = document.getElementById("gtag-script-src")
      if (srcEl) srcEl.remove()
    }

    // Vérifier l'état initial du consentement
    const consent = getCookieConsent()
    if (consent?.analytics) {
      loadGA4()
    } else {
      disableGA4()
    }

    // Écouter les changements dynamiques de consentement (sans rechargement de page)
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.analytics) {
        loadGA4()
      } else {
        disableGA4()
      }
    }

    window.addEventListener("apticr_consent_changed", handleConsentChange)
    return () => {
      window.removeEventListener("apticr_consent_changed", handleConsentChange)
    }
  }, [gaId])

  // Track page view upon client route transitions if analytics is consented
  useEffect(() => {
    if (!gaId) return
    const consent = getCookieConsent()
    if (consent?.analytics && typeof (window as any).gtag === "function") {
      ;(window as any).gtag("config", gaId, {
        page_path: pathname,
      })
    }
  }, [pathname, gaId])

  return null
}
