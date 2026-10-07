"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import OptimizedPhoto from "@/components/OptimizedPhoto"
import { getArticles, getArticleCategories } from "@/lib/cms-actions"
import SocialLinks from "@/components/SocialLinks"

interface NewsViewProps {
  lang: Language
}

interface ArticleRecord {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  excerptFr: string
  excerptEn?: string | null
  excerptDe?: string | null
  contentFr?: string
  contentEn?: string | null
  contentDe?: string | null
  featuredImage?: string | null
  published?: boolean
  publishedAt?: Date | null
  authorName?: string | null
  viewsCount: number
  readingTime?: number | null
  isFeatured?: boolean
  category?: {
    id: string
    slug: string
    nameFr: string
    nameEn: string
    nameDe: string
  } | null
}

interface CategoryRecord {
  id: string
  slug: string
  nameFr: string
  nameEn: string
  nameDe: string
}

const BG_PAGE = "#FFFFFF"
const BG_SECTION_ALT = "#F7F8FA"

const I18N = {
  FR: {
    badge: "ACTUALITÉS",
    title: "Le Journal d’APTIC-R",
    subtitle: "Projets, initiatives, événements et actualités de l’association.",
    filterAll: "Toutes les publications",
    featuredBadge: "À LA UNE",
    latestBadge: "DERNIÈRES PUBLICATIONS",
    readArticle: "Lire l'article",
    emptyPreTitle: "ACTUALITÉS À VENIR",
    emptyTitle: "Les premières actualités d’APTIC-R seront bientôt publiées ici.",
    emptyAction: "Découvrir nos projets",
    ctaTitle: "Vous souhaitez suivre ou soutenir nos actions de terrain ?",
    ctaDesc: "Découvrez nos programmes en cours et les opportunités d'engagement solidaire.",
    ctaProjects: "Consulter nos projets",
    ctaPartner: "Devenir partenaire",
    readTime: "min de lecture",
    socialTitle: "Suivez nos actualités",
    socialText:
      "Ne manquez aucune actualité, initiative ou évolution d’APTIC-R. Retrouvez-nous sur nos réseaux sociaux.",
  },
  EN: {
    badge: "NEWS & UPDATES",
    title: "APTIC-R Dispatch",
    subtitle: "Projects, field initiatives, upcoming events, and official releases.",
    filterAll: "All publications",
    featuredBadge: "FEATURED STORY",
    latestBadge: "LATEST STORIES",
    readArticle: "Read full story",
    emptyPreTitle: "UPCOMING UPDATES",
    emptyTitle: "The first official stories from APTIC-R will be published here soon.",
    emptyAction: "Explore our projects",
    ctaTitle: "Want to follow or support our field initiatives?",
    ctaDesc: "Discover our current programs and community engagement opportunities.",
    ctaProjects: "Explore our projects",
    ctaPartner: "Become a partner",
    readTime: "min read",
    socialTitle: "Follow our latest news",
    socialText:
      "Don't miss APTIC-R news, initiatives and updates. Follow us on our social media channels.",
  },
  DE: {
    badge: "AKTUELL",
    title: "APTIC-R Magazin",
    subtitle: "Projekte, Initiativen, Veranstaltungen und offizielle Mitteilungen.",
    filterAll: "Alle Veröffentlichungen",
    featuredBadge: "IM FOKUS",
    latestBadge: "NEUESTE BEITRÄGE",
    readArticle: "Artikel lesen",
    emptyPreTitle: "NEUE BEITRÄGE IN KÜRZE",
    emptyTitle: "Die ersten Berichte von APTIC-R werden in Kürze hier veröffentlicht.",
    emptyAction: "Unsere Projekte entdecken",
    ctaTitle: "Möchten Sie unsere Aktionen vor Ort unterstützen?",
    ctaDesc: "Entdecken Sie unsere laufenden Programme und Möglichkeiten zur Zusammenarbeit.",
    ctaProjects: "Projekte ansehen",
    ctaPartner: "Partner werden",
    readTime: "Min. Lesezeit",
    socialTitle: "Folgen Sie unseren Neuigkeiten",
    socialText:
      "Verpassen Sie keine Neuigkeiten, Initiativen oder Entwicklungen von APTIC-R. Folgen Sie uns in den sozialen Netzwerken.",
  },
}

function hasArticleLanguage(article: ArticleRecord, lang: "FR" | "EN" | "DE") {
  const fields =
    lang === "EN"
      ? [article.titleEn, article.excerptEn, article.contentEn]
      : lang === "DE"
        ? [article.titleDe, article.excerptDe, article.contentDe]
        : [article.titleFr, article.excerptFr, article.contentFr]
  return fields.every((field) => Boolean(field?.trim()))
}

function articleTitle(article: ArticleRecord, lang: "FR" | "EN" | "DE") {
  return lang === "EN" ? article.titleEn ?? "" : lang === "DE" ? article.titleDe ?? "" : article.titleFr
}

function articleExcerpt(article: ArticleRecord, lang: "FR" | "EN" | "DE") {
  return lang === "EN" ? article.excerptEn ?? "" : lang === "DE" ? article.excerptDe ?? "" : article.excerptFr
}

function articleBody(article: ArticleRecord, lang: "FR" | "EN" | "DE") {
  return lang === "EN" ? article.contentEn ?? "" : lang === "DE" ? article.contentDe ?? "" : article.contentFr ?? ""
}

function articleCategoryName(category: CategoryRecord | null | undefined, lang: "FR" | "EN" | "DE") {
  if (!category) return ""
  return lang === "EN" ? category.nameEn ?? "" : lang === "DE" ? category.nameDe ?? "" : category.nameFr
}
export default function NewsView({ lang, initialSettings = {} }: NewsViewProps & { initialSettings?: Record<string, string> }) {
  const router = useRouter()
  const pathname = usePathname()
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const l = safeLang.toLowerCase()
  const t = I18N[safeLang] || I18N.FR

  const [settings, setSettings] = useState<Record<string, string>>(initialSettings)
  const [articles, setArticles] = useState<ArticleRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, safeLang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${safeLang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  useEffect(() => {
    Promise.all([
      getArticles({ publishedOnly: true, lang: safeLang }),
      getArticleCategories(),
      import("@/lib/cms-actions").then(({ getSiteSettings }) => getSiteSettings("NEWS")),
    ])
      .then(([arts, cats, settingsRes]) => {
        setArticles((arts as ArticleRecord[]).filter((article) => hasArticleLanguage(article, safeLang)))
        setCategories(cats)
        if (settingsRes && settingsRes.success && settingsRes.dict) {
          setSettings((prev) => ({ ...prev, ...settingsRes.dict }))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [safeLang])

  // ─── Dynamic CMS Bindings with Fallbacks ──────────────────────────────────
  const heroBadge = settings[`news_hero_badge_${l}`] ?? ""
  const heroTitle = settings[`news_hero_title_${l}`] ?? ""
  const heroSubtitle = settings[`news_hero_subtitle_${l}`] ?? ""

  const ctaTitle = settings[`news_cta_title_${l}`] ?? ""
  const ctaDesc = settings[`news_cta_desc_${l}`] ?? ""
  const ctaBtnProjects = settings[`news_cta_btn_projects_${l}`] ?? ""
  const ctaBtnPartner = settings[`news_cta_btn_partner_${l}`] ?? ""

  // 1. Filtrer d'abord les articles publiés selon la catégorie
  const filteredArticles =
    categoryFilter === "ALL"
      ? articles
      : articles.filter((a) => a.category?.slug === categoryFilter)

  // 2. Règle « À LA UNE » :
  // - Chercher un article avec isFeatured = true parmi les articles filtrés
  // - S'il n'y en a pas, utiliser l'article publié le plus récent (trié par date desc)
  let featuredArticle: ArticleRecord | null = null
  let regularArticles: ArticleRecord[] = []

  if (filteredArticles.length > 0) {
    const explicitFeatured = filteredArticles.find((a) => a.isFeatured === true)
    if (explicitFeatured) {
      featuredArticle = explicitFeatured
      // Les autres articles dans "Dernières publications" (sans répéter le featured)
      regularArticles = filteredArticles.filter((a) => a.id !== explicitFeatured.id)
    } else {
      // Fallback : premier article le plus récent
      featuredArticle = filteredArticles[0]
      regularArticles = filteredArticles.slice(1)
    }
  }

  // Helper for reading time — uses stored value if available, else estimate
  const getReadTime = (article: ArticleRecord, contentLength?: number) => {
    if (article.readingTime && article.readingTime > 0) return article.readingTime
    if (!contentLength || contentLength < 500) return 3
    return Math.min(8, Math.max(3, Math.ceil(contentLength / 800)))
  }

  // Format date cleanly: 18 SEPTEMBRE 2026
  const formatDate = (dateInput?: Date | null) => {
    if (!dateInput) return ""
    const d = new Date(dateInput)
    return d.toLocaleDateString(safeLang === "EN" ? "en-US" : safeLang === "DE" ? "de-DE" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader mode={getHeaderMode(ROUTES.newsList)} lang={safeLang} setLang={handleSetLang} currentPage="news" navigate={navigate} />

      <main className="flex-1">
        {/* ── 1. Compact Hero (#F7F8FA) - Fond gris montant jusqu'en haut derrière le header ── */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 border-b border-slate-200/80"
          style={{ backgroundColor: BG_SECTION_ALT }}
        >
          <div className="max-w-[1260px] mx-auto">
            {heroBadge && (
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#28A745]"></span>
                <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
                  {heroBadge}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight mb-3 leading-tight">
              {heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Editorial Tab Navigation / Filters (underline style, no floating bubble pills) ── */}
        <section className="border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 sticky top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-md">
          <div className="max-w-[1260px] mx-auto flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-0">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap shrink-0 border-b-2 ${
                categoryFilter === "ALL"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-[#5E6B76] hover:text-[#003366]"
              }`}
            >
              {t.filterAll}
            </button>

            {categories.map((c) => {
              const catName =
                lang === "EN" ? c.nameEn : lang === "DE" ? c.nameDe : c.nameFr
              const isActive = categoryFilter === c.slug

              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.slug)}
                  className={`py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? "border-[#003366] text-[#003366]"
                      : "border-transparent text-[#5E6B76] hover:text-[#003366]"
                  }`}
                >
                  {catName}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 3. Content Area : Articles Grid OR Compact Editorial Empty State ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-[1260px] mx-auto w-full">
          {loading ? (
            <div className="py-20 text-center text-[#5E6B76] text-sm">
              Chargement des publications...
            </div>
          ) : filteredArticles.length === 0 ? (
            /* ── Compact Editorial Empty State (Height 220–260px on #F7F8FA, border #E5EAF0) ── */
            <div 
              className="rounded-2xl p-8 sm:p-12 border border-[#E5EAF0] text-center shadow-2xs my-4"
              style={{ backgroundColor: BG_SECTION_ALT }}
            >
              <span className="text-xs font-bold tracking-widest text-[#003366] uppercase block mb-2">
                {t.emptyPreTitle}
              </span>
              <p className="text-base sm:text-lg text-[#5E6B76] max-w-xl mx-auto mb-6 leading-relaxed">
                {t.emptyTitle}
              </p>
              <Link
                href={getPageUrl("projects", lang)}
                className="inline-flex items-center text-sm font-bold text-[#007BFF] hover:text-[#003366] transition-colors"
              >
                {t.emptyAction} <span className="ml-1.5 font-bold">→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {/* ── 3.1 À LA UNE (Featured Story) ── */}
              {featuredArticle && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                      {t.featuredBadge}
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {(() => {
                    const title = articleTitle(featuredArticle, safeLang)
                    const excerpt = articleExcerpt(featuredArticle, safeLang)
                    const catName = articleCategoryName(featuredArticle.category, safeLang)
                    const articleUrl = `/${lang.toLowerCase()}/actualites/${featuredArticle.slug}`
                    const imageSrc = featuredArticle.featuredImage || "/photo-ancrage-togo.png"
                    const readMins = getReadTime(featuredArticle, articleBody(featuredArticle, safeLang).length)

                    return (
                      <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                        <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] overflow-hidden bg-slate-100">
                          <OptimizedPhoto
                            src={imageSrc}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                            loading="eager"
                            fetchPriority="high"
                          />
                        </div>

                          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]">
                          <div>
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold tracking-wider text-[#003366] uppercase mb-3 whitespace-nowrap overflow-hidden">
                              <span>{catName}</span>
                              {featuredArticle.publishedAt && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-[#5E6B76] font-medium whitespace-nowrap">
                                    {formatDate(featuredArticle.publishedAt)}
                                  </span>
                                </>
                              )}
                              <span className="text-slate-300">·</span>
                              <span className="text-[#5E6B76] font-medium whitespace-nowrap">
                                {readMins} {t.readTime}
                              </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] leading-tight mb-4 group-hover:text-[#007BFF] transition-colors">
                              <Link href={articleUrl}>{title}</Link>
                            </h2>

                            <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed mb-6 line-clamp-3">
                              {excerpt}
                            </p>
                          </div>

                          <div>
                            <Link
                              href={articleUrl}
                              className="inline-flex items-center text-sm font-bold text-[#007BFF] group-hover:text-[#003366] transition-colors"
                            >
                              {t.readArticle} <span className="ml-1.5">→</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  })()}
                </div>
              )}

              {/* ── 3.2 DERNIÈRES PUBLICATIONS (3 cols Desktop, 2 cols Tablet, 1 col Mobile) ── */}
              {regularArticles.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                      {t.latestBadge}
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularArticles.map((art) => {
                      const title = articleTitle(art, safeLang)
                      const excerpt = articleExcerpt(art, safeLang)
                      const catName = articleCategoryName(art.category, safeLang)
                      const articleUrl = `/${lang.toLowerCase()}/actualites/${art.slug}`
                      const imageSrc = art.featuredImage || "/photo-projet-phare.jpg"
                      const readMins = getReadTime(art, articleBody(art, safeLang).length)

                      return (
                        <article
                          key={art.id}
                          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                        >
                          {/* Image */}
                          <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                            <OptimizedPhoto
                              src={imageSrc}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>

                          {/* Content */}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Metadata */}
                              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#003366] uppercase mb-2.5 whitespace-nowrap overflow-hidden">
                                <span>{catName}</span>
                                {art.publishedAt && (
                                  <>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-[#5E6B76] font-medium whitespace-nowrap">
                                      {formatDate(art.publishedAt)}
                                    </span>
                                  </>
                                )}
                                <span className="text-slate-300">·</span>
                                <span className="text-[#5E6B76] font-medium whitespace-nowrap">
                                  {readMins} {t.readTime}
                                </span>
                              </div>

                              <h3 className="text-lg font-bold text-[#003366] mb-2.5 leading-snug line-clamp-2 group-hover:text-[#007BFF] transition-colors">
                                <Link href={articleUrl}>{title}</Link>
                              </h3>

                              <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed mb-6 line-clamp-3">
                                {excerpt}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                              <Link
                                href={articleUrl}
                                className="inline-flex items-center text-xs sm:text-sm font-bold text-[#007BFF] group-hover:text-[#003366] transition-colors"
                              >
                                {t.readArticle} <span className="ml-1.5">→</span>
                              </Link>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── 4. Subtle Discovery CTA (#F7F8FA) before Footer ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white border-t border-slate-200">
          <div className="max-w-2xl mx-auto">
            <div 
              className="rounded-2xl p-8 sm:p-10 border border-slate-200 text-center shadow-2xs"
              style={{ backgroundColor: BG_SECTION_ALT }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#28A745] block mb-2">
                ENGAGEMENT & IMPACT
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] mb-3">
                {ctaTitle}
              </h2>
              <p className="text-sm text-[#5E6B76] max-w-md mx-auto mb-6 leading-relaxed">
                {ctaDesc}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={getPageUrl("projects", safeLang)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-xs"
                >
                  {ctaBtnProjects}
                </Link>
                <Link
                  href={getPageUrl("partner", safeLang)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#007BFF] text-white hover:bg-[#0060c8] transition-colors shadow-xs"
                >
                  {ctaBtnPartner}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Réseaux sociaux : Suivez nos actualités ── */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 border-t border-slate-200"
          style={{ backgroundColor: BG_SECTION_ALT }}
          aria-label={t.socialTitle}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg sm:text-xl font-bold text-[#003366] mb-1.5">
              {t.socialTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#5E6B76] max-w-md mx-auto mb-5 leading-relaxed">
              {t.socialText}
            </p>
            <div className="flex justify-center">
              <SocialLinks variant="section" overrides={settings} />
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
