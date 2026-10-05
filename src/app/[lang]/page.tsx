"use client"

import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import InstitutionalHome from "@/views/InstitutionalHome"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname, useParams } from "next/navigation"
import { use } from "react"

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const clientParams = useParams()
  const { lang: initialLang } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const rawLang = ((clientParams?.lang as string) || initialLang || "FR").toUpperCase()
  const language = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  const handleNavigate = (page: Page) => {
    const url = getPageUrl(page, language)
    if (page === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push(url)
    }
  }

  const handleSetLang = (newLang: Language) => {
    const target = newLang.toLowerCase()
    const newPath = pathname.replace(/^\/(fr|en|de)(\/.*)?$/i, `/${target}$2`) || `/${target}`
    router.push(newPath.startsWith(`/${target}`) ? newPath : `/${target}${newPath}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader mode={getHeaderMode(ROUTES.home)}
        lang={language}
        setLang={handleSetLang}
        currentPage="home"
        navigate={handleNavigate}
      />
      <main className="flex-1">
        <InstitutionalHome lang={language} navigate={handleNavigate} />
      </main>
      <Footer lang={language} navigate={handleNavigate} />
    </div>
  )
}
