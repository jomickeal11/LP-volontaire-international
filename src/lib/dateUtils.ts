export type SupportedLang = "fr" | "en" | "de" | "FR" | "EN" | "DE"

export function getLocaleFromLang(lang?: string): string {
  const l = (lang || "fr").toLowerCase()
  if (l.startsWith("en")) return "en-GB"
  if (l.startsWith("de")) return "de-DE"
  return "fr-FR"
}

/**
 * Formate une date de manière robuste selon la langue active.
 * FR -> "fr-FR" (ex: 12/03/2026)
 * EN -> "en-GB" (ex: 12/03/2026)
 * DE -> "de-DE" (ex: 12.03.2026)
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  lang?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return ""
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ""
  const locale = getLocaleFromLang(lang)
  return new Intl.DateTimeFormat(
    locale,
    options || { day: "2-digit", month: "2-digit", year: "numeric" }
  ).format(d)
}

/**
 * Formate une date avec heure pour l'historique et les notes.
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  lang?: string
): string {
  return formatDate(date, lang, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
