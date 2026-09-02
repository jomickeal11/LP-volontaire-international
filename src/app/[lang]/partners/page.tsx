"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PartnerPage from "@/views/PartnerPage"
import type { Language, Page } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { use } from "react"

export default function PartnersRoute({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "apply":
        router.push(`/${lang}/apply`)
        break
      case "partner":
        break
      case "admin-login":
        router.push(`/${lang}/admin/login`)
        break
      case "admin-dashboard":
        router.push(`/${lang}/admin/dashboard`)
        break
      default:
        router.push(`/${lang}`)
        break
    }
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const language = lang.toUpperCase() as Language || "FR"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        lang={language}
        setLang={handleSetLang}
        currentPage="partner"
        navigate={handleNavigate}
      />
      <main className="flex-1">
        <PartnerPage lang={language} navigate={handleNavigate} />
      </main>
      <Footer lang={language} navigate={handleNavigate} />
    </div>
  )
}
