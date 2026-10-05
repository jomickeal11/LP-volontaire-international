"use client"

/**
 * Attribution UTM first-touch.
 *
 * Règle stricte : la toute première attribution rencontrée est conservée.
 * Une visite ultérieure avec d'autres paramètres UTM n'écrase JAMAIS
 * l'attribution d'origine (sauf expiration du cookie au bout de 90 jours).
 *
 * Ces données sont des données d'attribution du parcours. Elles sont
 * conservées indépendamment du consentement Analytics : le suivi GA4 reste,
 * lui, conditionné au consentement dans `tracker.ts`.
 */

export interface UtmAttribution {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  landingPath: string
  capturedAt: string
}

export type UtmSubmissionFields = {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

const STORAGE_KEY = "apticr_utm"
const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60
const MAX_VALUE_LENGTH = 200

const UTM_PARAM_MAP: Record<string, keyof UtmAttribution> = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
}

const UTM_FIELDS: (keyof UtmSubmissionFields)[] = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
]

function sanitize(value: string): string {
  return value.trim().slice(0, MAX_VALUE_LENGTH)
}

function parseStored(raw: string | null | undefined): UtmAttribution | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<UtmAttribution>
    if (!parsed || typeof parsed !== "object") return null

    const hasAny = UTM_FIELDS.some(
      (field) => typeof parsed[field] === "string" && (parsed[field] as string).length > 0,
    )
    if (!hasAny) return null

    return {
      utmSource: parsed.utmSource || "",
      utmMedium: parsed.utmMedium || "",
      utmCampaign: parsed.utmCampaign || "",
      utmContent: parsed.utmContent || "",
      utmTerm: parsed.utmTerm || "",
      landingPath: parsed.landingPath || "",
      capturedAt: parsed.capturedAt || "",
    }
  } catch {
    return null
  }
}

/**
 * Retourne l'attribution first-touch stockée (cookie prioritaire, puis
 * sessionStorage pour les navigateurs bloquant les cookies).
 */
export function getStoredUtm(): UtmAttribution | null {
  if (typeof window === "undefined") return null

  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${STORAGE_KEY}=`))
    if (match) {
      const raw = decodeURIComponent(match.split("=").slice(1).join("="))
      const stored = parseStored(raw)
      if (stored) return stored
    }
  } catch {
    // Cookie illisible : on tente le sessionStorage.
  }

  try {
    return parseStored(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

/**
 * Capture l'attribution depuis l'URL courante UNIQUEMENT si aucune
 * attribution n'existe déjà. Ne remplace jamais un first-touch existant.
 */
export function captureUtmFromUrl(): UtmAttribution | null {
  if (typeof window === "undefined") return null

  // First-touch strict : ne jamais écraser une attribution déjà stockée.
  const existing = getStoredUtm()
  if (existing) return existing

  const params = new URLSearchParams(window.location.search)
  const captured: UtmAttribution = {
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
    landingPath: window.location.pathname,
    capturedAt: new Date().toISOString(),
  }

  let found = false
  for (const [param, field] of Object.entries(UTM_PARAM_MAP)) {
    const raw = params.get(param)
    if (raw && raw.trim()) {
      captured[field] = sanitize(raw)
      found = true
    }
  }

  // Aucun UTM dans l'URL : ne rien stocker, laisser les champs à null.
  if (!found) return null

  const serialized = JSON.stringify(captured)

  try {
    const isProd = window.location.protocol === "https:"
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(serialized)}; max-age=${NINETY_DAYS_SECONDS}; path=/; SameSite=Lax${
      isProd ? "; Secure" : ""
    }`
  } catch {
    // Cookie indisponible : le sessionStorage prend le relais.
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    // sessionStorage indisponible : l'attribution reste au moins en cookie.
  }

  return captured
}

/**
 * Champs UTM prêts à être transmis à une Server Action (soumission de
 * formulaire). Retourne un objet vide si aucune attribution n'existe.
 */
export function getUtmSubmissionFields(): UtmSubmissionFields {
  const stored = getStoredUtm()
  if (!stored) return {}

  const fields: UtmSubmissionFields = {}
  if (stored.utmSource) fields.utmSource = stored.utmSource
  if (stored.utmMedium) fields.utmMedium = stored.utmMedium
  if (stored.utmCampaign) fields.utmCampaign = stored.utmCampaign
  if (stored.utmContent) fields.utmContent = stored.utmContent
  if (stored.utmTerm) fields.utmTerm = stored.utmTerm
  return fields
}
