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
  publishedAt?: Date | null
  authorName?: string | null
  viewsCount: number
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

const BG = "#F5F7F9"

const I18N = {
  FR: {
    badge: "Actualités, Terrains & Communiqués",
    title: "Le Journal d'APTIC-R",
    subtitle:
      "Suivez l'avancement de nos projets, les récits de nos volontaires, nos événements à venir et les communiqués officiels de l'association.",
    filterAll: "Toutes les publications",
    readArticle: "Lire l'article",
    noArticles: "Aucun article publié dans cette catégorie pour le moment.",
    viewsLabel: "vues",
    byLabel: "Par",
  },
  EN: {
    badge: "News, Field Updates & Press",
    title: "APTIC-R Dispatch",
    subtitle:
      "Follow our field projects, volunteer stories, upcoming events, and official press releases.",
    filterAll: "All posts",
    readArticle: "Read full story",
    noArticles: "No articles published in this category yet.",
    viewsLabel: "views",
    byLabel: "By",
  },
  DE: {
    badge: "Neuigkeiten, Berichte & Mitteilungen",
    title: "APTIC-R Magazin",
    subtitle:
      "Erfahren Sie mehr über unsere Projekte, Berichte von Freiwilligen und bevorstehende Veranstaltungen.",
    filterAll: "Alle Beiträge",
    readArticle: "Artikel lesen",
    noArticles: "Derzeit keine Artikel in dieser Kategorie.",
    viewsLabel: "Aufrufe",
    byLabel: "Von",
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

  const filteredArticles =
    categoryFilter === "ALL"
      ? articles
      : articles.filter((a) => a.category?.slug === categoryFilter)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="news" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>📰</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Category Filters ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                categoryFilter === "ALL"
                  ? "bg-[#174F7A] text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.filterAll}
            </button>
            {categories.map((c) => {
              const catName =
                lang === "EN" ? c.nameEn : lang === "DE" ? c.nameDe : c.nameFr
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.slug)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                    categoryFilter === c.slug
                      ? "bg-[#174F7A] text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {catName}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── 3. Articles Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                Chargement des articles...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200">
                {t.noArticles}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((art) => {
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
                      : art.category?.nameFr

                  const articleUrl = `/${lang.toLowerCase()}/actualites/${art.slug}`

                  return (
                    <article
                      key={art.id}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Meta header */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          {art.category ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#174F7A]/10 text-[#174F7A]">
                              {catName}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                              Article
                            </span>
                          )}

                          <span className="text-xs text-slate-400">
                            {art.publishedAt
                              ? new Date(art.publishedAt).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-[#142332] mb-2 leading-snug line-clamp-2">
                          <Link href={articleUrl} className="hover:text-[#174F7A] transition-colors">
                            {title}
                          </Link>
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                          {excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {t.byLabel} {art.authorName || "APTIC-R"}
                        </span>

                        <Link
                          href={articleUrl}
                          className="font-bold text-[#174F7A] hover:underline flex items-center gap-1"
                        >
                          <span>{t.readArticle}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
