import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata("about", lang)
}

export default function AProposLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
