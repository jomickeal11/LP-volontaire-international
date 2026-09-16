"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { getArticleBySlug } from "@/lib/cms-actions"

interface ArticleDetailViewProps {
  lang: Language
  slug: string
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

const BG = "#F5F7F9"

export default function ArticleDetailView({ lang, slug }: ArticleDetailViewProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  useEffect(() => {
    getArticleBySlug(slug)
      .then((data) => setArticle(data as any))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F9]">
        <div className="text-slate-400 text-sm">Chargement de l&apos;article...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F5F7F9]">
        <Header lang={lang} setLang={handleSetLang} currentPage="news" navigate={navigate} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Article introuvable</h1>
          <p className="text-slate-500 text-sm mb-6">
            L&apos;article que vous cherchez n&apos;existe pas ou a été déplacé.
          </p>
          <Link
            href={getPageUrl("news", lang)}
            className="px-6 py-2.5 rounded-xl font-bold bg-[#174F7A] text-white text-sm"
          >
            Retour aux actualités
          </Link>
        </main>
        <Footer lang={lang} navigate={navigate} />
      </div>
    )
  }

  const title =
    lang === "EN" && article.titleEn
      ? article.titleEn
      : lang === "DE" && article.titleDe
      ? article.titleDe
      : article.titleFr

  const excerpt =
    lang === "EN" && article.excerptEn
      ? article.excerptEn
      : lang === "DE" && article.excerptDe
      ? article.excerptDe
      : article.excerptFr

  const content =
    lang === "EN" && article.contentEn
      ? article.contentEn
      : lang === "DE" && article.contentDe
      ? article.contentDe
      : article.contentFr

  const catName =
    lang === "EN" && article.category?.nameEn
      ? article.category.nameEn
      : lang === "DE" && article.category?.nameDe
      ? article.category.nameDe
      : article.category?.nameFr

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="news" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32 pb-24">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Breadcrumb & Back Link ── */}
          <div className="mb-8">
            <Link
              href={getPageUrl("news", lang)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174F7A] hover:underline"
            >
              <span>←</span>
              <span>Retour à toutes les actualités</span>
            </Link>
          </div>

          {/* ── Article Header Card ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {article.category && (
                <span className="px-3 py-1 rounded-full font-bold bg-[#174F7A]/10 text-[#174F7A]">
                  {catName}
                </span>
              )}
              <span className="text-slate-400">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">
                Par {article.authorName || "APTIC-R"}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">👁️ {article.viewsCount} lectures</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#142332] tracking-tight leading-tight">
              {title}
            </h1>

            {/* Chapô */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed border-l-4 border-[#35A85A] pl-4 py-1 bg-slate-50 rounded-r-xl">
              {excerpt}
            </p>

            {/* Content body */}
            <div className="pt-6 border-t border-slate-100 text-slate-700 leading-relaxed text-base space-y-4 whitespace-pre-wrap">
              {content}
            </div>

            {/* Share / Footer actions */}
            <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Publié par l&apos;Association APTIC-R · Agbélouvé, Togo
              </div>
              <div className="flex gap-2">
                <Link
                  href={getPageUrl("news", lang)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  ← Autres articles
                </Link>
                <Link
                  href={getPageUrl("membership", lang)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#35A85A] hover:bg-[#2e924e] transition-colors"
                >
                  Rejoindre l&apos;association
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
