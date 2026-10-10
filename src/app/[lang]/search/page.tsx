import type { Metadata } from "next"
import SearchView from "@/views/SearchView"
import { searchPublicContent } from "@/lib/cms-actions"

interface SearchPageProps {
  params: Promise<{ lang: string }>
  searchParams?: Promise<{ q?: string | string[] }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const normalized = (lang?.toUpperCase() === "EN" ? "EN" : lang?.toUpperCase() === "DE" ? "DE" : "FR") as "FR" | "EN" | "DE"
  const titles = {
    FR: "Recherche",
    EN: "Search",
    DE: "Suche",
  }

  return {
    title: `${titles[normalized]} | APTIC-R`,
    description: "Search APTIC-R published articles, projects and resources.",
  }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params
  const safeLang = (lang?.toUpperCase() === "EN" || lang?.toUpperCase() === "DE" ? lang.toUpperCase() : "FR") as "FR" | "EN" | "DE"
  const resolvedSearchParams = (await searchParams) ?? {}
  const query = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q
  const initialData = await searchPublicContent({ lang: safeLang, query })

  return <SearchView lang={safeLang} initialData={initialData} />
}
