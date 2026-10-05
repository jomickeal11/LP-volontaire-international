import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ArticleDetailView from "@/views/ArticleDetailView"
import { getArticleBySlug, getArticleAvailableLanguages } from "@/lib/cms-actions"
import { getSiteUrl, localeCode } from "@/lib/seo"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"
  const l = upperLang.toLowerCase()

  // `incrementViews: false` : la lecture de métadonnées ne consomme pas de vue,
  // seul le rendu réel de la page l'incrémente.
  const article = await getArticleBySlug(slug, upperLang, { incrementViews: false })

  if (!article) {
    return {
      title: "Article introuvable | APTIC-R",
      robots: { index: false, follow: false },
    }
  }

  const title =
    upperLang === "EN"
      ? article.titleEn ?? ""
      : upperLang === "DE"
        ? article.titleDe ?? ""
        : article.titleFr

  const excerpt =
    upperLang === "EN"
      ? article.excerptEn ?? ""
      : upperLang === "DE"
        ? article.excerptDe ?? ""
        : article.excerptFr

  const articleSlug = article.slug || slug
  const available = await getArticleAvailableLanguages(articleSlug)

  // hreflang strict : uniquement les langues où l'article est réellement servi.
  const languageAlternates: Record<string, string> = {}
  for (const availableLang of available) {
    languageAlternates[availableLang.toLowerCase()] = `/${availableLang.toLowerCase()}/actualites/${articleSlug}`
  }
  const defaultLang = available.includes("FR") ? "fr" : available[0]?.toLowerCase() ?? l
  languageAlternates["x-default"] = `/${defaultLang}/actualites/${articleSlug}`

  const description = excerpt ? excerpt.slice(0, 160) : undefined
  const canonical = `/${l}/actualites/${articleSlug}`

  return {
    title: `${title} | APTIC-R`,
    description,
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title: `${title} — APTIC-R`,
      description,
      url: `${getSiteUrl()}${canonical}`,
      siteName: "APTIC-R",
      locale: localeCode(upperLang),
      type: "article",
      images: article.featuredImage ? [{ url: article.featuredImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — APTIC-R`,
      description,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const language = lang.toUpperCase() as Language
  const article = await getArticleBySlug(slug, language)

  if (!article) notFound()

  return <ArticleDetailView lang={language} article={article} />
}
