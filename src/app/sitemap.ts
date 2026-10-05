import type { MetadataRoute } from "next"
import { getPageUrl, type Language, type Page } from "@/types"
import { getSiteUrl } from "@/lib/seo"
import {
  getArticles,
  getProjects,
  getEvents,
  getDomaines,
} from "@/lib/cms-actions"
import { LEGAL_SLUGS, type LegalDocType } from "@/lib/legalContent"

export const revalidate = 3600

const BASE = getSiteUrl()
const LANGS: Language[] = ["FR", "EN", "DE"]

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>

interface StaticPage {
  page: Page
  priority: number
  freq: ChangeFreq
}

/**
 * Pages d'institution dont l'URL canonique est réellement servie, avec leur
 * priorité et fréquence de changement.
 */
const STATIC_PAGES: StaticPage[] = [
  { page: "home", priority: 1.0, freq: "weekly" },
  { page: "volunteering", priority: 0.95, freq: "weekly" },
  { page: "apply", priority: 0.9, freq: "monthly" },
  { page: "partner", priority: 0.85, freq: "monthly" },
  { page: "partner-apply", priority: 0.8, freq: "monthly" },
  { page: "about", priority: 0.8, freq: "monthly" },
  { page: "domains", priority: 0.8, freq: "monthly" },
  { page: "projects", priority: 0.8, freq: "weekly" },
  { page: "news", priority: 0.8, freq: "daily" },
  { page: "events", priority: 0.7, freq: "weekly" },
  { page: "team", priority: 0.6, freq: "monthly" },
  { page: "contact", priority: 0.7, freq: "monthly" },
  { page: "membership", priority: 0.75, freq: "monthly" },
  { page: "resources", priority: 0.7, freq: "weekly" },
  { page: "gallery", priority: 0.6, freq: "weekly" },
  { page: "support", priority: 0.7, freq: "monthly" },
]

interface DynamicGroupItem {
  lang: Language
  slug: string
  lastModified?: Date | null
}

/**
 * Construit les entrées d'un type de contenu dynamique à partir des contenus
 * réellement publics dans chaque langue. L'`hreflang` ne référence que les
 * langues où la ressource est effectivement servie.
 */
function buildDynamicEntries(
  items: DynamicGroupItem[],
  pathPrefix: string,
  priority: number,
  freq: ChangeFreq,
): MetadataRoute.Sitemap {
  const bySlug = new Map<string, { langs: Set<Language>; lastModified?: Date }>()

  for (const item of items) {
    if (!item.slug) continue
    const existing = bySlug.get(item.slug) ?? { langs: new Set<Language>() }
    existing.langs.add(item.lang)
    const lm = item.lastModified ?? undefined
    if (lm && (!existing.lastModified || lm > existing.lastModified)) {
      existing.lastModified = lm
    }
    bySlug.set(item.slug, existing)
  }

  const entries: MetadataRoute.Sitemap = []

  for (const [slug, info] of bySlug) {
    const available = LANGS.filter((l) => info.langs.has(l))
    if (available.length === 0) continue

    const languageAlternates: Record<string, string> = {}
    for (const l of available) {
      languageAlternates[l.toLowerCase()] = `${BASE}/${l.toLowerCase()}/${pathPrefix}/${slug}`
    }
    const defaultLang = available.includes("FR") ? "FR" : available[0]
    languageAlternates["x-default"] = `${BASE}/${defaultLang.toLowerCase()}/${pathPrefix}/${slug}`

    for (const l of available) {
      entries.push({
        url: `${BASE}/${l.toLowerCase()}/${pathPrefix}/${slug}`,
        ...(info.lastModified ? { lastModified: info.lastModified } : {}),
        changeFrequency: freq,
        priority,
        alternates: { languages: languageAlternates },
      })
    }
  }

  return entries
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // ── Pages d'institution ──────────────────────────────────────────────────
  for (const { page, priority, freq } of STATIC_PAGES) {
    const languageAlternates: Record<string, string> = {
      fr: `${BASE}${getPageUrl(page, "FR")}`,
      en: `${BASE}${getPageUrl(page, "EN")}`,
      de: `${BASE}${getPageUrl(page, "DE")}`,
      "x-default": `${BASE}${getPageUrl(page, "FR")}`,
    }
    for (const lang of LANGS) {
      entries.push({
        url: `${BASE}${getPageUrl(page, lang)}`,
        changeFrequency: freq,
        priority,
        alternates: { languages: languageAlternates },
      })
    }
  }

  // ── Contenus dynamiques publics (aucune URL vers une 404) ─────────────────
  const projectItems: DynamicGroupItem[] = []
  const articleItems: DynamicGroupItem[] = []
  const eventItems: DynamicGroupItem[] = []
  const domainItems: DynamicGroupItem[] = []

  for (const lang of LANGS) {
    const [projects, articles, events, domaines] = await Promise.all([
      getProjects({ lang }),
      getArticles({ lang, publishedOnly: true }),
      getEvents({ lang }),
      getDomaines({ activeOnly: true, lang }),
    ])

    for (const project of projects) {
      projectItems.push({ lang, slug: project.slug, lastModified: project.updatedAt })
    }
    for (const article of articles) {
      articleItems.push({
        lang,
        slug: article.slug,
        lastModified: article.updatedAt ?? article.publishedAt,
      })
    }
    for (const event of events) {
      eventItems.push({ lang, slug: event.slug, lastModified: event.updatedAt })
    }
    for (const domaine of domaines) {
      domainItems.push({ lang, slug: domaine.slug, lastModified: domaine.updatedAt })
    }
  }

  entries.push(...buildDynamicEntries(projectItems, "projets", 0.7, "weekly"))
  entries.push(...buildDynamicEntries(articleItems, "actualites", 0.6, "weekly"))
  entries.push(...buildDynamicEntries(eventItems, "evenements", 0.6, "weekly"))
  entries.push(...buildDynamicEntries(domainItems, "domaines", 0.6, "monthly"))

  // ── Pages légales publiques (une URL par langue, slug localisé) ─────────────
  for (const docType of Object.keys(LEGAL_SLUGS) as LegalDocType[]) {
    const slugs = LEGAL_SLUGS[docType]
    const languageAlternates: Record<string, string> = {
      fr: `${BASE}/fr/${slugs.fr}`,
      en: `${BASE}/en/${slugs.en}`,
      de: `${BASE}/de/${slugs.de}`,
      "x-default": `${BASE}/fr/${slugs.fr}`,
    }
    for (const lang of LANGS) {
      entries.push({
        url: `${BASE}/${lang.toLowerCase()}/${slugs[lang.toLowerCase() as "fr" | "en" | "de"]}`,
        changeFrequency: "yearly",
        priority: 0.2,
        alternates: { languages: languageAlternates },
      })
    }
  }

  return entries
}
