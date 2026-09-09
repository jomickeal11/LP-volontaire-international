"use client"
// Replace current lang in pathname with newLang

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Home from "@/views/Home"
import type { Language, Page } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { use } from "react"

export default function LandingPage({
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
        window.scrollTo({ top: 0, behavior: "smooth" })
        break
      case "apply":
        router.push(`/${lang}/apply`)
        break
      case "partner":
        router.push(`/${lang}/partners`)
        break
      default:
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
        currentPage="home"
        navigate={handleNavigate}
      />
      <main className="flex-1">
        <Home lang={language} navigate={handleNavigate} />
      </main>
      <Footer lang={language} navigate={handleNavigate} />
    </div>
  )
}
