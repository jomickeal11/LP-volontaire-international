"use client"

import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import PartnerLandingView from "@/views/PartnerLandingView"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { use } from "react"

export default function PartenairesRoute({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigate = (page: Page) => {
    const language = (lang.toUpperCase() as Language) || "FR"
    const url = getPageUrl(page, language)
    if (page === "partner") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push(url)
    }
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const language = (lang.toUpperCase() as Language) || "FR"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader mode={getHeaderMode(ROUTES.partner)}
        lang={language}
        setLang={handleSetLang}
        currentPage="partner"
        navigate={handleNavigate}
      />
      <main className="flex-1">
        <PartnerLandingView
          lang={language}
          navigate={handleNavigate}
        />
      </main>
      <Footer lang={language} navigate={handleNavigate} />
    </div>
  )
}

