"use client"

import Footer from "@/components/Footer"
import ApplyPage from "@/views/ApplyPage"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { use } from "react"

export default function PostulerPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigate = (page: Page) => {
    const language = lang.toUpperCase() as Language || "FR"
    router.push(getPageUrl(page, language))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const language = lang.toUpperCase() as Language || "FR"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header : parcours de formulaire → header simplifié. Il est rendu par
          ApplyPage (cf. convention src/lib/pageLayout.ts : ROUTES.apply). */}
      <main className="flex-1">
        <ApplyPage lang={language} navigate={handleNavigate} setLang={handleSetLang} />
      </main>
      <Footer lang={language} navigate={handleNavigate} />
    </div>
  )
}
