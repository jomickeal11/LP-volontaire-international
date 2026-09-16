"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { use } from "react"
import translations from "@/i18n/translations"

interface StubPageProps {
  params: Promise<{ lang: string }>
  titleKey: keyof typeof translations.FR.nav
  page: Page
  icon: string
  descFr: string
  descEn: string
  descDe: string
}

function StubContent({ lang, titleKey, icon, descFr, descEn, descDe }: {
  lang: Language
  titleKey: string
  icon: string
  descFr: string
  descEn: string
  descDe: string
}) {
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as keyof typeof translations
  const t = translations[safeLang].nav
  const title = (t as any)[titleKey] || titleKey

  const desc = safeLang === "FR" ? descFr : safeLang === "DE" ? descDe : descEn
  const comingSoon = safeLang === "FR"
    ? "Cette page est en cours de développement et sera bientôt disponible."
    : safeLang === "DE"
    ? "Diese Seite wird derzeit entwickelt und wird bald verfügbar sein."
    : "This page is under development and will be available soon."

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">{icon}</div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "#142332" }}>
          {title}
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">{desc}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {comingSoon}
        </div>
      </div>
    </div>
  )
}

export function createStubPage(config: {
  titleKey: string
  page: Page
  icon: string
  descFr: string
  descEn: string
  descDe: string
}) {
  return function StubPageComponent({ params }: { params: Promise<{ lang: string }> }) {
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
      <div className="min-h-screen flex flex-col bg-[#F5F7F9]">
        <Header
          lang={language}
          setLang={handleSetLang}
          currentPage={config.page}
          navigate={handleNavigate}
        />
        <main className="flex-1 pt-20">
          <StubContent
            lang={language}
            titleKey={config.titleKey}
            icon={config.icon}
            descFr={config.descFr}
            descEn={config.descEn}
            descDe={config.descDe}
          />
        </main>
        <Footer lang={language} navigate={handleNavigate} />
      </div>
    )
  }
}
