import { notFound } from "next/navigation"
import ArticleDetailView from "@/views/ArticleDetailView"
import { getArticleBySlug } from "@/lib/cms-actions"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export const revalidate = 60

export default async function ArticleDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const language = lang.toUpperCase() as Language
  const article = await getArticleBySlug(slug, language)

  if (!article) notFound()

  return <ArticleDetailView lang={language} article={article} />
}
