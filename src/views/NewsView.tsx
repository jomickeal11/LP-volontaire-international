"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { getArticles, getArticleCategories } from "@/lib/cms-actions"

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
  },
}

export default function NewsView({ lang }: NewsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [articles, setArticles] = useState<ArticleRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  useEffect(() => {
    Promise.all([
      getArticles({ publishedOnly: true }),
      getArticleCategories(),
    ])
      .then(([arts, cats]) => {
        setArticles(arts as any)
        setCategories(cats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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

  // Helper for reading time estimation
  const getReadTime = (contentLength?: number) => {
    if (!contentLength || contentLength < 500) return 3
    return Math.min(8, Math.max(3, Math.ceil(contentLength / 800)))
  }

  // Format date cleanly: 18 SEPTEMBRE 2026
  const formatDate = (dateInput?: Date | null) => {
    if (!dateInput) return ""
    const d = new Date(dateInput)
    return d.toLocaleDateString(lang === "EN" ? "en-US" : lang === "DE" ? "de-DE" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="news" navigate={navigate} />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* ── 1. Compact Editorial Hero (#FFFFFF with subtle bottom border) ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 max-w-[1260px] mx-auto w-full">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
            <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
              {t.badge}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight mb-3">
            {t.title}
          </h1>

          <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
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
                    const title =
                      lang === "EN" && featuredArticle.titleEn
                        ? featuredArticle.titleEn
                        : lang === "DE" && featuredArticle.titleDe
                        ? featuredArticle.titleDe
                        : featuredArticle.titleFr
                    const excerpt =
                      lang === "EN" && featuredArticle.excerptEn
                        ? featuredArticle.excerptEn
                        : lang === "DE" && featuredArticle.excerptDe
                        ? featuredArticle.excerptDe
                        : featuredArticle.excerptFr
                    const catName =
                      lang === "EN" && featuredArticle.category?.nameEn
                        ? featuredArticle.category.nameEn
                        : lang === "DE" && featuredArticle.category?.nameDe
                        ? featuredArticle.category.nameDe
                        : featuredArticle.category?.nameFr || "ACTUALITÉ"

                    const articleUrl = `/${lang.toLowerCase()}/actualites/${featuredArticle.slug}`
                    const imageSrc = featuredArticle.featuredImage || "/photo-ancrage-togo.png"
                    const readMins = getReadTime(featuredArticle.contentFr?.length)

                    return (
                      <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                        <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] overflow-hidden bg-slate-100">
                          <img
                            src={imageSrc}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                          />
                        </div>

                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                          <div>
                            {/* Metadata */}
                            <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-[#003366] uppercase mb-3">
                              <span>{catName}</span>
                              {featuredArticle.publishedAt && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-[#5E6B76] font-medium">
                                    {formatDate(featuredArticle.publishedAt)}
                                  </span>
                                </>
                              )}
                              <span className="text-slate-300">·</span>
                              <span className="text-[#5E6B76] font-medium">
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
                      const title =
                        lang === "EN" && art.titleEn
                          ? art.titleEn
                          : lang === "DE" && art.titleDe
                          ? art.titleDe
                          : art.titleFr
                      const excerpt =
                        lang === "EN" && art.excerptEn
                          ? art.excerptEn
                          : lang === "DE" && art.excerptDe
                          ? art.excerptDe
                          : art.excerptFr
                      const catName =
                        lang === "EN" && art.category?.nameEn
                          ? art.category.nameEn
                          : lang === "DE" && art.category?.nameDe
                          ? art.category.nameDe
                          : art.category?.nameFr || "ACTUALITÉ"

                      const articleUrl = `/${lang.toLowerCase()}/actualites/${art.slug}`
                      const imageSrc = art.featuredImage || "/photo-projet-phare.jpg"
                      const readMins = getReadTime(art.contentFr?.length)

                      return (
                        <article
                          key={art.id}
                          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                        >
                          {/* Image */}
                          <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                            <img
                              src={imageSrc}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                            />
                          </div>

                          {/* Content */}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Metadata */}
                              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#003366] uppercase mb-2.5">
                                <span>{catName}</span>
                                {art.publishedAt && (
                                  <>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-[#5E6B76] font-medium">
                                      {formatDate(art.publishedAt)}
                                    </span>
                                  </>
                                )}
                                <span className="text-slate-300">·</span>
                                <span className="text-[#5E6B76] font-medium">
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
                {t.ctaTitle}
              </h2>
              <p className="text-sm text-[#5E6B76] max-w-md mx-auto mb-6 leading-relaxed">
                {t.ctaDesc}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={getPageUrl("projects", lang)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-xs"
                >
                  {t.ctaProjects}
                </Link>
                <Link
                  href={getPageUrl("partner", lang)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#007BFF] text-white hover:bg-[#0060c8] transition-colors shadow-xs"
                >
                  {t.ctaPartner}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
