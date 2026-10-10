"use client"

import React from "react"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface ArticleDetailViewProps {
  lang: Language
  article: ArticleDetail | null
}

interface ArticleDetail {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  excerptFr: string
  excerptEn?: string | null
  excerptDe?: string | null
  contentFr: string
  contentEn?: string | null
  contentDe?: string | null
  featuredImage?: string | null
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

const BG = "#F7F8FA"
const ARTICLE_COPY = {
  FR: {
    back: "Retour aux actualités",
    allNews: "Toutes les actualités",
    author: "Par",
    views: "lectures",
    publishedBy: "Publié par l'Association APTIC-R · Agbélouvé, Togo",
    otherArticles: "Autres articles",
    join: "Rejoindre l'association",
    notFound: "Article introuvable",
    notFoundText: "L'article que vous cherchez n'existe pas ou a été déplacé.",
    viewCount: (count: number) => `${new Intl.NumberFormat("fr-FR").format(count)} lecture${count === 1 ? "" : "s"}`,
  },
  EN: {
    back: "Back to news",
    allNews: "All news",
    author: "By",
    views: "views",
    publishedBy: "Published by APTIC-R Association · Agbélouvé, Togo",
    otherArticles: "More articles",
    join: "Join the association",
    notFound: "Article not found",
    notFoundText: "The article you are looking for does not exist or has been moved.",
    viewCount: (count: number) => `${new Intl.NumberFormat("en-GB").format(count)} ${count === 1 ? "view" : "views"}`,
  },
  DE: {
    back: "Zurück zu den Nachrichten",
    allNews: "Alle Nachrichten",
    author: "Von",
    views: "Aufrufe",
    publishedBy: "Veröffentlicht vom Verein APTIC-R · Agbélouvé, Togo",
    otherArticles: "Weitere Artikel",
    join: "Mitglied werden",
    notFound: "Artikel nicht gefunden",
    notFoundText: "Der gesuchte Artikel existiert nicht oder wurde verschoben.",
    viewCount: (count: number) => `${new Intl.NumberFormat("de-DE").format(count)} Aufrufe`,
  },
} as const

export default function ArticleDetailView({ lang, article }: ArticleDetailViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const copy = ARTICLE_COPY[lang] || ARTICLE_COPY.FR

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F7F8FA]">
        <PageHeader mode={getHeaderMode(ROUTES.newsDetail)} lang={lang} setLang={handleSetLang} currentPage="news" navigate={navigate} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{copy.notFound}</h1>
          <p className="text-slate-500 text-sm mb-6">
            {copy.notFoundText}
          </p>
          <Link
            href={getPageUrl("news", lang)}
            className="px-6 py-2.5 rounded-xl font-bold bg-[#003366] text-white text-sm"
          >
            {copy.back}
          </Link>
        </main>
        <Footer lang={lang} navigate={navigate} />
      </div>
    )
  }

  const title = lang === "EN" ? article.titleEn ?? "" : lang === "DE" ? article.titleDe ?? "" : article.titleFr
  const excerpt = lang === "EN" ? article.excerptEn ?? "" : lang === "DE" ? article.excerptDe ?? "" : article.excerptFr
  const content = lang === "EN" ? article.contentEn ?? "" : lang === "DE" ? article.contentDe ?? "" : article.contentFr
  const catName = lang === "EN" ? article.category?.nameEn ?? "" : lang === "DE" ? article.category?.nameDe ?? "" : article.category?.nameFr ?? ""
  const locale = lang === "EN" ? "en-GB" : lang === "DE" ? "de-DE" : "fr-FR"
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA]" style={{ backgroundColor: BG }}>
      <PageHeader mode={getHeaderMode(ROUTES.newsDetail)} lang={lang} setLang={handleSetLang} currentPage="news" navigate={navigate} />

      <main className="flex-1 px-4 pb-16 pt-7 sm:px-6 sm:pb-20 sm:pt-9 lg:px-8 lg:pb-24">
        <article className="mx-auto max-w-7xl">
          <div className="mb-7 sm:mb-9">
            <Link
              href={getPageUrl("news", lang)}
              className="group inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#587189] transition hover:text-[#007BFF]"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 10H4m5 5-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {copy.back}
            </Link>
          </div>

          <header className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] sm:text-xs">
              {article.category && (
                <span className="inline-flex items-center gap-2 font-extrabold uppercase tracking-[0.16em] text-[#007BFF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#28A745]" />
                  {catName}
                </span>
              )}
              {article.publishedAt && (
                <time dateTime={new Date(article.publishedAt).toISOString()} className="text-[#718497]">
                  {new Date(article.publishedAt).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              )}
              <span className="hidden text-[#B2C0CC] sm:inline" aria-hidden="true">·</span>
              <span className="text-[#718497]">
                {copy.author} <span className="font-semibold text-[#31516E]">{article.authorName || "APTIC-R"}</span>
              </span>
              <span className="hidden text-[#B2C0CC] sm:inline" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 text-[#718497]">
                <svg aria-hidden="true" className="h-4 w-4 text-[#8295A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {copy.viewCount(article.viewsCount)}
              </span>
            </div>

            <h1 className="mt-5 max-w-5xl text-[2rem] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#003366] sm:mt-6 sm:text-4xl lg:text-[3.5rem]">
              {title}
            </h1>
          </header>

          {article.featuredImage && (
            <figure className="mt-7 overflow-hidden bg-[#E7EDF2] sm:mt-9 lg:mt-11">
              <div className="relative aspect-[4/3] sm:aspect-[16/8] lg:aspect-[2.1/1]">
                <img
                  src={article.featuredImage}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
            </figure>
          )}

          <div className="mx-auto grid max-w-6xl gap-7 px-1 pb-8 pt-8 sm:px-4 sm:pb-10 sm:pt-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-14 lg:pt-12">
            {excerpt && (
              <p className="max-w-xl text-lg font-medium leading-[1.75] text-[#31516E] sm:text-xl sm:leading-[1.7] lg:text-[1.3rem]">
                {excerpt}
              </p>
            )}
            <div className="min-w-0 border-t border-[#DCE6EF] pt-6 sm:pt-7 lg:border-t-0 lg:pt-0">
              <div className="whitespace-pre-wrap text-[1rem] leading-[1.8] text-[#344B60] sm:text-[1.0625rem] sm:leading-[1.85]">
                {content}
              </div>
            </div>
          </div>

          <footer className="mx-auto mt-2 max-w-6xl border-t border-[#DCE6EF] pt-7 sm:pt-8">
            <p className="text-xs font-medium text-[#7B8D9E] sm:text-sm">{copy.publishedBy}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={getPageUrl("news", lang)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#C9D8E5] bg-white px-5 py-3 text-sm font-bold text-[#244765] transition hover:border-[#A9C4DA] hover:bg-[#F8FBFE]"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M16 10H4m5 5-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copy.otherArticles}
              </Link>
              <Link
                href={getPageUrl("membership", lang)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#28A745] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(40,167,69,0.18)] transition hover:bg-[#218838] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#28A745]/25"
              >
                {copy.join}
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3.5 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
