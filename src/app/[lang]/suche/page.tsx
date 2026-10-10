import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"
import SearchPage from "@/app/[lang]/search/page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata("search", lang)
}

export default SearchPage
