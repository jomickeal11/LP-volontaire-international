"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { captureUtmFromUrl } from "@/lib/utm"

/**
 * Capture l'attribution UTM first-touch au premier chargement.
 *
 * Monté au niveau du layout public. Volontairement indépendant du
 * consentement Analytics : les UTM sont des données d'attribution du
 * parcours, distinctes du suivi GA4.
 */
export default function AttributionCapture() {
  const pathname = usePathname()

  useEffect(() => {
    captureUtmFromUrl()
  }, [pathname])

  return null
}
