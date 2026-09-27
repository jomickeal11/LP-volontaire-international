import type { Language } from "@/types"

export type CmsPagePublicationGroup = "SUPPORT" | "MEMBERSHIP" | "PARTNER"

export function cmsPagePublicationKey(group: CmsPagePublicationGroup, lang: Language): string {
  return `${group.toLowerCase()}_published_${lang.toLowerCase()}`
}

/** Missing status keeps the pre-status page available; DRAFT explicitly withdraws one locale. */
export function isCmsPagePublished(
  settings: Record<string, string>,
  group: CmsPagePublicationGroup,
  lang: Language,
): boolean {
  return settings[cmsPagePublicationKey(group, lang)] !== "DRAFT"
}

export function unavailablePageMessage(lang: Language): string {
  if (lang === "EN") return "This page is currently unavailable."
  if (lang === "DE") return "Diese Seite ist derzeit nicht verf\u00FCgbar."
  return "Cette page est indisponible pour le moment."
}