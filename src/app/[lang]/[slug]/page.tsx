import { use } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LegalView from "@/views/LegalView"
import {
  getDocTypeFromSlug,
  getCanonicalLegalPath,
  LEGAL_DOCS,
  type LegalDocType,
} from "@/lib/legalContent"
import type { Language, Page } from "@/types"
import LegalClientWrapper from "./LegalClientWrapper"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const docType = getDocTypeFromSlug(slug)
  if (!docType) {
    return { title: "Page non trouvée | APTIC-R" }
  }

  const safeLang = (["FR", "EN", "DE"].includes(lang.toUpperCase())
    ? lang.toUpperCase()
    : "FR") as "FR" | "EN" | "DE"

  const doc = LEGAL_DOCS[docType][safeLang]
  return {
    title: `${doc.title} — APTIC-R Volontariat International`,
    description: doc.intro.slice(0, 160),
    alternates: {
      canonical: getCanonicalLegalPath(docType, safeLang),
    },
  }
}

export default function LegalPageRoute({ params }: PageProps) {
  const { lang, slug } = use(params)
  const docType = getDocTypeFromSlug(slug)

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
