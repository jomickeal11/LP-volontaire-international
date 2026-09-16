"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LegalView from "@/views/LegalView"
import {
  LEGAL_SLUGS,
  type LegalDocType,
  type LegalDocument,
} from "@/lib/legalContent"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"

interface LegalClientWrapperProps {
  lang: "FR" | "EN" | "DE"
  slug: string
  docType: LegalDocType
  doc: LegalDocument
}

export default function LegalClientWrapper({
  lang,
  slug,
  docType,
  doc,
}: LegalClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const targetLang = newLang.toLowerCase()
    const targetSlug = LEGAL_SLUGS[docType][targetLang] || LEGAL_SLUGS[docType].fr
    router.push(`/${targetLang}/${targetSlug}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F9]">
      <Header
        lang={lang}
        setLang={handleSetLang}
        currentPage="home"
        navigate={handleNavigate}
      />
      <main className="flex-1">
        <LegalView
          doc={doc}
          lang={lang}
          navigate={handleNavigate}
        />
      </main>
      <Footer lang={lang} navigate={handleNavigate} />
    </div>
  )
}
