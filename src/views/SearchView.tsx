"use client"

import React, { useMemo, useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Footer from "@/components/Footer"
import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import type { SearchPublicContentResult } from "@/lib/cms-actions"

interface SearchViewProps {
  lang: Language
  initialData: SearchPublicContentResult
}

const I18N = {
  FR: {
    title: "Rechercher",
    subtitle: "Trouvez des articles, projets et ressources publiés par APTIC-R.",
    placeholder: "Rechercher un mot-clé…",
    searchButton: "Rechercher",
    categoryArticles: "Articles",
    categoryProjects: "Projets",
    categoryResources: "Ressources",
    emptyTitle: "Aucun résultat pour cette recherche.",
    emptyText: "Essayez un autre mot-clé ou explorez les contenus publiés directement.",
    loading: "Recherche en cours…",
    errorTitle: "Recherche indisponible",
    errorText: "La recherche n’a pas pu être exécutée pour le moment. Merci de réessayer plus tard.",
    noQueryTitle: "Que souhaitez-vous trouver ?",
    noQueryText: "Saisissez un mot-clé pour explorer les contenus publiés d’APTIC-R.",
    resultCount: (count: number) => `${count} résultat${count > 1 ? "s" : ""}`,
    labelReadMore: "Voir plus",
    quickLinks: "Explorer aussi",
  },
  EN: {
    title: "Search",
    subtitle: "Find published articles, projects and resources from APTIC-R.",
    placeholder: "Search by keyword…",
    searchButton: "Search",
    categoryArticles: "Articles",
    categoryProjects: "Projects",
    categoryResources: "Resources",
    emptyTitle: "No results found for this search.",
    emptyText: "Try another keyword or explore the published content directly.",
    loading: "Searching…",
    errorTitle: "Search unavailable",
    errorText: "The search could not be completed right now. Please try again later.",
    noQueryTitle: "What are you looking for?",
    noQueryText: "Enter a keyword to browse APTIC-R’s published content.",
    resultCount: (count: number) => `${count} result${count > 1 ? "s" : ""}`,
    labelReadMore: "Read more",
    quickLinks: "Explore also",
  },
  DE: {
    title: "Suche",
    subtitle: "Finden Sie veröffentlichte Artikel, Projekte und Ressourcen von APTIC-R.",
    placeholder: "Nach Stichwort suchen…",
    searchButton: "Suchen",
    categoryArticles: "Artikel",
    categoryProjects: "Projekte",
    categoryResources: "Ressourcen",
    emptyTitle: "Für diese Suche wurden keine Ergebnisse gefunden.",
    emptyText: "Versuchen Sie ein anderes Stichwort oder entdecken Sie die veröffentlichten Inhalte direkt.",
    loading: "Suche wird ausgeführt…",
    errorTitle: "Suche nicht verfügbar",
    errorText: "Die Suche konnte derzeit nicht ausgeführt werden. Bitte versuchen Sie es später erneut.",
    noQueryTitle: "Wonach suchen Sie?",
    noQueryText: "Geben Sie ein Stichwort ein, um die veröffentlichten Inhalte von APTIC-R zu durchsuchen.",
    resultCount: (count: number) => `${count} Ergebnis${count > 1 ? "se" : ""}`,
    labelReadMore: "Mehr erfahren",
    quickLinks: "Entdecken Sie auch",
  },
} as const

function formatDate(lang: Language, iso?: string | null) {
  if (!iso) return ""

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(lang === "EN" ? "en-GB" : lang === "DE" ? "de-DE" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default function SearchView({ lang, initialData }: SearchViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = I18N[lang] || I18N.FR
  const currentQuery = (searchParams.get("q") ?? initialData.query ?? "").trim()
  const [query, setQuery] = useState(currentQuery)
  const [isLoading, startTransition] = useTransition()
  const [results, setResults] = useState<SearchPublicContentResult>(initialData)

  useEffect(() => {
    setQuery(currentQuery)
    setResults(initialData)
  }, [currentQuery, initialData])

  const categories = useMemo(
    () => [
      { key: "articles", label: t.categoryArticles },
      { key: "projects", label: t.categoryProjects },
      { key: "resources", label: t.categoryResources },
    ],
    [t],
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = query.trim()

    const target = getPageUrl("search", lang)
    const nextUrl = nextQuery ? `${target}?q=${encodeURIComponent(nextQuery)}` : target
    startTransition(() => router.push(nextUrl))
  }

  const handleLangChange = (nextLang: Language) => {
    const target = getPageUrl("search", nextLang)
    const nextUrl = currentQuery ? `${target}?q=${encodeURIComponent(currentQuery)}` : target
    router.push(nextUrl)
  }

  const activeResults = categories
    .map((category) => ({
      ...category,
      items: results[category.key as keyof SearchPublicContentResult] as Array<{ id: string; title: string; description: string; category: string; url: string; date?: string | null }>,
    }))
    .filter((category) => category.items.length > 0)

  const totalCount = results.total || 0

  return (
    <div className="min-h-screen overflow-hidden bg-[#F4F7FA] text-[#12314A]">
      <PageHeader
        mode={getHeaderMode(ROUTES.search)}
        currentPage="search"
        lang={lang}
        setLang={handleLangChange}
        navigate={(page: Page) => router.push(getPageUrl(page, lang))}
      />

      <main className="relative pt-24 pb-16 md:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[440px] bg-[radial-gradient(ellipse_at_top_right,_rgba(0,123,255,0.13),_transparent_52%),linear-gradient(180deg,_#EAF2FA_0%,_#F4F7FA_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_24px_70px_rgba(0,51,102,0.10)]">
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-[#007BFF]/[0.04] sm:h-80 sm:w-80" />
            <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#007BFF] sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#28A745]" />
                    APTIC-R
                  </p>
                  <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-[#003366] sm:text-5xl lg:text-6xl">
                    {t.title}
                    <span className="text-[#007BFF]">.</span>
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[#52677A] sm:text-lg sm:leading-8">
                    {t.subtitle}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2.5 rounded-2xl border border-[#DCE8F3] bg-[#F5F9FD] px-4 py-3 sm:mb-1">
                  <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-[#003366] px-2 text-sm font-extrabold tabular-nums text-white">
                    {currentQuery ? totalCount : "—"}
                  </span>
                  <span className="text-xs font-semibold leading-4 text-[#52677A] sm:text-sm">
                    {currentQuery ? t.resultCount(totalCount) : t.quickLinks}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 rounded-[22px] border border-[#D7E2EC] bg-[#F6F9FC] p-2 shadow-[inset_0_1px_2px_rgba(0,51,102,0.03)] transition focus-within:border-[#007BFF]/60 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(0,123,255,0.08)] sm:mt-10 sm:flex sm:items-center">
                <label className="sr-only" htmlFor="global-search-input">{t.title}</label>
                <div className="relative min-w-0 flex-1">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6D87A0] sm:left-4 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20L16.65 16.65" />
                  </svg>
                  <input
                    id="global-search-input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t.placeholder}
                    className="w-full bg-transparent py-3.5 pl-11 pr-3 text-sm font-medium text-[#183B5A] outline-none placeholder:font-normal placeholder:text-[#8A9BAC] sm:py-4 sm:pl-12 sm:text-base"
                    aria-label={t.title}
                  />
                </div>
                <button
                  type="submit"
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[15px] bg-[#003366] px-6 py-3.5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(0,51,102,0.18)] transition hover:bg-[#004680] hover:shadow-[0_9px_22px_rgba(0,51,102,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#007BFF]/25 disabled:cursor-wait disabled:opacity-75 sm:mt-0 sm:w-auto sm:px-7"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      {t.searchButton}
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3.5 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          <section aria-live="polite" className="mt-9 sm:mt-12">
            {results.error ? (
              <div className="rounded-[26px] border border-rose-200 bg-white p-6 shadow-[0_16px_45px_rgba(100,20,30,0.06)] sm:p-10">
                <div className="mx-auto max-w-xl text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M12 8v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[#003366] sm:text-2xl">{t.errorTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#607386] sm:text-base">{t.errorText}</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="rounded-[26px] border border-[#DFE8F0] bg-white p-6 shadow-[0_16px_45px_rgba(0,51,102,0.05)] sm:p-10">
                <div className="mx-auto flex min-h-[180px] max-w-xl flex-col items-center justify-center text-center">
                  <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF3FC]">
                    <span className="absolute inset-0 animate-ping rounded-2xl bg-[#007BFF]/10" />
                    <span className="relative h-6 w-6 animate-spin rounded-full border-[3px] border-[#007BFF]/20 border-t-[#007BFF]" />
                  </span>
                  <p className="mt-5 text-base font-bold text-[#003366]">{t.loading}</p>
                </div>
              </div>
            ) : !currentQuery || activeResults.length === 0 ? (
              <div className="relative overflow-hidden rounded-[26px] border border-[#DFE8F0] bg-white px-6 py-10 shadow-[0_16px_45px_rgba(0,51,102,0.05)] sm:px-10 sm:py-14">
                <div aria-hidden="true" className="absolute -bottom-20 -right-14 h-56 w-56 rounded-full bg-[#EAF3FC] blur-2xl" />
                <div className="relative mx-auto max-w-xl text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF3FC] text-[#007BFF]">
                    {currentQuery ? (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <circle cx="10.8" cy="10.8" r="6.8" />
                        <path d="m16 16 4.5 4.5M8.5 10.8h4.6" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20 16.6 16.6M8.5 11h5" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                  <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[#003366] sm:text-2xl">
                    {currentQuery ? t.emptyTitle : t.noQueryTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#607386] sm:text-base">
                    {currentQuery ? t.emptyText : t.noQueryText}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-9 sm:space-y-12">
                {activeResults.map((category, categoryIndex) => (
                  <section key={category.key} aria-labelledby={`search-category-${category.key}`}>
                    <div className="mb-4 flex items-center gap-3 sm:mb-5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#003366] text-xs font-extrabold text-white">
                        0{categoryIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 id={`search-category-${category.key}`} className="text-lg font-extrabold tracking-tight text-[#003366] sm:text-xl">
                          {category.label}
                        </h2>
                        <span className="text-xs font-medium text-[#7B8D9E]">
                          {category.items.length} {t.resultCount(category.items.length).replace(/^\d+\s*/, "")}
                        </span>
                      </div>
                      <span className="rounded-full border border-[#DCE8F3] bg-white px-3 py-1.5 text-xs font-bold tabular-nums text-[#31516E]">
                        {String(category.items.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="divide-y divide-[#E6EDF3] overflow-hidden rounded-[22px] border border-[#DFE8F0] bg-white shadow-[0_12px_35px_rgba(0,51,102,0.045)]">
                      {category.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.url}
                          className="group relative block px-5 py-5 transition-colors hover:bg-[#F8FBFE] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#007BFF] sm:px-7 sm:py-6"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-7">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#007BFF] sm:text-[11px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#28A745]" />
                                  {item.category}
                                </span>
                                {item.date && (
                                  <>
                                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#B7C5D2]" />
                                    <time dateTime={item.date} className="text-xs font-medium text-[#7B8D9E]">
                                      {formatDate(lang, item.date)}
                                    </time>
                                  </>
                                )}
                              </div>
                              <h3 className="text-lg font-bold leading-snug tracking-[-0.02em] text-[#123B60] transition-colors group-hover:text-[#007BFF] sm:text-xl">
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="mt-2 max-w-3xl line-clamp-3 text-sm leading-6 text-[#607386] sm:text-[15px] sm:leading-7">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full px-1 py-1 text-xs font-bold text-[#31516E] transition-colors group-hover:text-[#007BFF] sm:mt-1 sm:self-center sm:text-sm">
                              {t.labelReadMore}
                              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-1" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="M3.5 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer lang={lang} navigate={(page: Page) => router.push(getPageUrl(page, lang))} />
    </div>
  )
}
