import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata("partner-apply", lang)
}

export default function DemandePartenariatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
