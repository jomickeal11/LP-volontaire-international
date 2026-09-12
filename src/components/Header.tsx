import { useState, useEffect } from "react"
import type { Page, Language } from "../types"
import translations from "../i18n/translations"
import { useRouter } from "next/navigation"
import { trackEvent } from "../lib/tracker"
import Image from "next/image"

interface HeaderProps {
  currentPage: Page
  lang: Language
  setLang: (l: Language) => void
  navigate: (p: Page) => void
}

const GREEN = "#35A85A"
const GREEN_HOVER = "#2E914E"
const BLUE = "#174F7A"
const NAV_TEXT = "#19324A"
const NAV_INACTIVE = "#4A5A6A"

export default function Header({
  currentPage,
  lang,
  setLang,
  navigate,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])
  const currentLang = (lang || "FR").toUpperCase() as keyof typeof translations
  const t = (translations[currentLang] || translations.FR).nav
  const router = useRouter()

  const NAV = [
    { label: t.about, page: "home" as Page, hash: "about" },
    { label: t.mission, page: "home" as Page, hash: "mission" },
    { label: t.activities, page: "home" as Page, hash: "activities" },
    { label: t.lifeInTogo, page: "home" as Page, hash: "togo" },
    { label: t.apply, page: "apply" as Page },
    { label: t.faq, page: "home" as Page, hash: "faq" },
    { label: t.partners, page: "partner" as Page },
  ]

  const handleNavClick = (item: typeof NAV[0]) => {
    if (item.page === "apply") {
      trackEvent("apply_now_click", { lang, source: "header_nav" })
    } else if (item.page === "partner") {
      trackEvent("partner_request_click", { lang, source: "header_nav" })
    }
    
    // Give GA4 100ms to process the event before navigating
    setTimeout(() => {
      if (item.hash) {
        if (currentPage === "home") {
          const el = document.getElementById(item.hash)
          if (el) {
            el.scrollIntoView({ behavior: "smooth" })
          } else {
            // If section doesn't exist yet, scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        } else {
          router.push(`/${lang.toLowerCase()}#${item.hash}`)
        }
      } else {
        navigate(item.page)
      }
    }, 100)
  }

  if (currentPage === "apply") {
    return null
  }

  return (
    <header className="fixed top-2 left-2 right-2 lg:top-4 lg:left-4 lg:right-4 z-50">
      <div
        className="rounded-xl px-4 sm:px-6 h-14 lg:h-16 flex items-center justify-between transition-all duration-300"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 4px 20px rgba(18,59,90,0.08)",
          border: "1px solid rgba(255,255,255,0.55)",
        }}
      >
        {/* Left: Logo */}
        <div className="flex-1 flex items-center justify-start">
          <button
            onClick={() => navigate("home")}
            className="flex items-center group text-left cursor-pointer"
            aria-label="APTIC-R Home"
          >
            <div
              className="rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 overflow-hidden"
              style={{
                width: 42,
                height: 42,
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(23,79,122,0.10)",
              }}
            >
              <Image src="/logo-aptic.png" alt="APTIC-R Logo" width={40} height={40} className="w-[85%] h-[85%] object-contain" priority unoptimized />
            </div>
            <div className="ml-3">
              <div
                className="font-extrabold text-sm leading-none tracking-tight"
                style={{ color: "#174F7A" }}
              >
                APTIC-R
              </div>
              <div
                className="text-[9px] font-bold tracking-[0.1em] uppercase mt-0.5 hidden sm:block"
                style={{ color: "#174F7A" }}
              >
                International Volunteers
              </div>
            </div>
          </button>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex flex-[2] items-center justify-center gap-5 xl:gap-7">
          {NAV.map((item) => {
            const isActive = currentPage === item.page && item.page !== "home"
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="text-[11px] xl:text-xs font-bold uppercase tracking-[0.15em] transition-colors whitespace-nowrap relative py-2 cursor-pointer"
                style={{ color: isActive ? "#174F7A" : "#233B4D" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#174F7A")}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActive
                    ? "#174F7A"
                    : "#233B4D"
                }}
              >
                {item.label}
                {/* Active Underline Indicator */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 rounded-t-full"
                    style={{ backgroundColor: "#35A85A" }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          {/* Language selector (Pill style like image) */}
          <div
            className="flex items-center p-0.5 rounded-full border"
            style={{ borderColor: "rgba(23,79,122,0.10)" }}
          >
            {(["FR", "EN", "DE"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  trackEvent("language_switch", { lang: l, metadata: { from: lang, to: l } })
                  setTimeout(() => setLang(l), 150)
                }}
                className="px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-full transition-all cursor-pointer uppercase"
                style={{
                  backgroundColor: lang === l ? "rgba(23,79,122,0.06)" : "transparent",
                  color: lang === l ? "#174F7A" : "#233B4D",
                }}
                aria-current={lang === l ? "true" : undefined}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Primary CTA / Menu Button */}
          <button
            onClick={() => {
              trackEvent("apply_now_click", { lang, source: "header_button" })
              setTimeout(() => navigate("apply"), 100)
            }}
            className="hidden sm:inline-flex items-center gap-2 font-bold text-[11px] px-6 py-2.5 rounded-full transition-all cursor-pointer text-white shadow-sm hover:scale-105"
            style={{ backgroundColor: "#35A85A" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = GREEN_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = GREEN)
            }
          >
            <span>{t.applyNow}</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full text-white cursor-pointer"
            style={{ backgroundColor: GREEN }}
            aria-label="Menu"
          >
            <div className="w-4 h-4 flex flex-col justify-center gap-1">
              <span
                className="block h-0.5 bg-white origin-center transition-transform duration-200"
                style={{
                  transform: mobileOpen ? "rotate(45deg) translateY(5px)" : "",
                }}
              />
              <span
                className="block h-0.5 bg-white transition-opacity duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }}
              />
              <span
                className="block h-0.5 bg-white origin-center transition-transform duration-200"
                style={{
                  transform: mobileOpen
                    ? "rotate(-45deg) translateY(-5px)"
                    : "",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-white"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 z-40 bg-white overflow-y-auto">
            <div className="px-6 py-8 flex flex-col h-full max-w-sm mx-auto">
              <div className="flex-1 flex flex-col gap-6">
                {NAV.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      handleNavClick(item)
                      setMobileOpen(false)
                    }}
                    className="text-left text-2xl font-extrabold tracking-tight transition-colors"
                    style={{
                      color: currentPage === item.page ? "#174F7A" : "#1A2B3C",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-6">
                <button
                  onClick={() => {
                    navigate("apply")
                    setMobileOpen(false)
                  }}
                  className="w-full text-center font-bold uppercase tracking-widest px-6 py-4 rounded-xl text-white shadow-md text-sm"
                  style={{ backgroundColor: GREEN }}
                >
                  {t.applyNow}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
