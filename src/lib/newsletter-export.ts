export interface NewsletterSubscriberRecord {
  email: string
  firstName?: string | null
  lang: string
  active: boolean
  subscribedAt: Date | string
  unsubscribedAt?: Date | string | null
}

export interface NormalizedSubscriber {
  email: string
  firstName: string
  lang: "FR" | "EN" | "DE"
  active: boolean
  subscribedAt: Date | string
  unsubscribedAt: Date | string | null
}

export const NEWSLETTER_LANGUAGES = ["FR", "EN", "DE"] as const

export function escapeCsvField(value: string | null | undefined): string {
  const str = (value ?? "").toString()
  return `"${str.replace(/"/g, '""')}"`
}

export function formatCsvDate(value: Date | string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = d.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function normalizeLanguage(value: string | null | undefined): "FR" | "EN" | "DE" {
  const raw = (value ?? "").trim().toUpperCase()
  return (NEWSLETTER_LANGUAGES as readonly string[]).includes(raw)
    ? (raw as "FR" | "EN" | "DE")
    : "FR"
}

/**
 * Nettoie les données avant export, sans jamais toucher à la base :
 * email minuscule et sans espaces, prénom nettoyé, langue normalisée,
 * et suppression des doublons (une seule ligne par email).
 */
export function normalizeNewsletterSubscribers(
  rows: NewsletterSubscriberRecord[]
): NormalizedSubscriber[] {
  const seen = new Set<string>()
  const result: NormalizedSubscriber[] = []

  for (const row of rows) {
    const email = (row.email ?? "").trim().toLowerCase()
    if (!email || seen.has(email)) continue
    seen.add(email)
    result.push({
      email,
      firstName: (row.firstName ?? "").trim(),
      lang: normalizeLanguage(row.lang),
      active: Boolean(row.active),
      subscribedAt: row.subscribedAt,
      unsubscribedAt: row.unsubscribedAt ?? null,
    })
  }

  return result
}

export function buildNewsletterCsv(rows: NormalizedSubscriber[], activeOnly: boolean): string {
  const headers = activeOnly
    ? ["Prénom", "Email", "Langue", "Date d'inscription"]
    : ["Prénom", "Email", "Langue", "Statut", "Date d'inscription", "Date de désinscription"]

  const lines = [headers.map(escapeCsvField).join(",")]

  for (const row of rows) {
    const fields = [
      escapeCsvField(row.firstName),
      escapeCsvField(row.email),
      escapeCsvField(row.lang),
    ]
    if (activeOnly) {
      fields.push(escapeCsvField(formatCsvDate(row.subscribedAt)))
    } else {
      fields.push(escapeCsvField(row.active ? "ACTIF" : "DESINSCRIT"))
      fields.push(escapeCsvField(formatCsvDate(row.subscribedAt)))
      fields.push(escapeCsvField(formatCsvDate(row.unsubscribedAt)))
    }
    lines.push(fields.join(","))
  }

  return "\uFEFF" + lines.join("\r\n")
}

export function newsletterExportFilename(
  lang: string | null | undefined,
  activeOnly: boolean
): string {
  const normalizedLang =
    lang && (NEWSLETTER_LANGUAGES as readonly string[]).includes(lang.toUpperCase())
      ? lang.toUpperCase()
      : null

  if (normalizedLang) {
    return activeOnly
      ? `APTIC-R-newsletter-${normalizedLang}.csv`
      : `APTIC-R-newsletter-${normalizedLang}-tous.csv`
  }
  return activeOnly ? "APTIC-R-newsletter-actifs.csv" : "APTIC-R-newsletter-tous.csv"
}
