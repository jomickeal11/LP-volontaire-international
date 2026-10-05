import { use } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
/* Les pages légales sont rendues par LegalClientWrapper, qui porte le header
   complet (cf. convention ROUTES.legal → fullHeader) et le Footer global. */
import {
  getLegalDocTypeForLang,
  getCanonicalLegalPath,
  LEGAL_DOCS,
  LEGAL_SLUGS,
  type LegalDocType,
} from "@/lib/legalContent"
import { getSiteUrl } from "@/lib/seo"
import type { Language, Page } from "@/types"
import LegalClientWrapper from "./LegalClientWrapper"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  // Le slug doit correspondre à la langue demandée : sinon l'URL est un doublon
  // du même document dans une autre langue et ne doit pas être indexée.
  const docType = getLegalDocTypeForLang(slug, lang)
  if (!docType) {
    return {
      title: "Page non trouvée | APTIC-R",
      robots: { index: false, follow: false },
    }
  }

  const safeLang = (["FR", "EN", "DE"].includes(lang.toUpperCase())
    ? lang.toUpperCase()
    : "FR") as "FR" | "EN" | "DE"

  const doc = LEGAL_DOCS[docType][safeLang]
  const localizedSlugs = LEGAL_SLUGS[docType]
  const canonical = getCanonicalLegalPath(docType, safeLang)
  const title = `${doc.title} | APTIC-R`
  const description = doc.intro.slice(0, 160)
  const l = safeLang.toLowerCase()

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: `/fr/${localizedSlugs.fr}`,
        en: `/en/${localizedSlugs.en}`,
        de: `/de/${localizedSlugs.de}`,
        "x-default": `/fr/${localizedSlugs.fr}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}${canonical}`,
      siteName: "APTIC-R",
      locale: l === "fr" ? "fr_FR" : l === "de" ? "de_DE" : "en_US",
      type: "article",
      images: [{ url: "/hero_volunteer_collab.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/hero_volunteer_collab.jpg"],
    },
  }
}

export default function LegalPageRoute({ params }: PageProps) {
  const { lang, slug } = use(params)
  const docType = getLegalDocTypeForLang(slug, lang)

  if (!docType) {
    notFound()
  }

  const safeLang = (["FR", "EN", "DE"].includes(lang.toUpperCase())
    ? lang.toUpperCase()
    : "FR") as "FR" | "EN" | "DE"

  const doc = LEGAL_DOCS[docType][safeLang]

  return (
    <LegalClientWrapper
      lang={safeLang}
      slug={slug}
      docType={docType}
      doc={doc}
    />
  )
}
