"use client"

import Footer from "@/components/Footer"
import PartnerPage from "@/views/PartnerPage"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { use } from "react"

export default function PartenairesDemandeRoute({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigate = (page: Page) => {
    const language = (lang.toUpperCase() as Language) || "FR"
    router.push(getPageUrl(page, language))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const language = (lang.toUpperCase() as Language) || "FR"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <PartnerPage
          lang={language}
          navigate={handleNavigate}
          setLang={handleSetLang}
        />
      </main>
      <Footer lang={language} navigate={handleNavigate} />
    </div>
  )
}
