"use client"

import { useState, useEffect, useRef } from "react"
import type { Page, Language } from "../types"
import { getPageUrl, PAGE_ROUTES } from "../types"
import translations from "../i18n/translations"
import { useRouter } from "next/navigation"
import { trackEvent } from "../lib/tracker"
import Image from "next/image"
import ApticLogo from "./ApticLogo"

interface HeaderProps {
  currentPage: Page
  lang: Language
  setLang: (l: Language) => void
  navigate: (p: Page) => void
}

const GREEN = "#28A745"
const GREEN_HOVER = "#218838"
const BLUE = "#003366"

/* ── Types for nav items ─────────────────────────────────────────────── */
interface NavItem {
  label: string
  page?: Page
  href?: string
  children?: NavItem[]
}

export default function Header({
  currentPage,
  lang,
  setLang,
  navigate,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

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
  const langLower = currentLang.toLowerCase()

  /* ── Build institutional navigation ──────────────────────────────── */
  const NAV: NavItem[] = [
    {
      label: t.aboutInstitutional,
      children: [
        { label: t.aboutHistory, page: "about" as Page, href: `/${langLower}/${PAGE_ROUTES.about?.[langLower] || "a-propos"}#histoire` },
        { label: t.aboutMission, page: "about" as Page, href: `/${langLower}/${PAGE_ROUTES.about?.[langLower] || "a-propos"}#missions` },
        { label: t.aboutValues, page: "about" as Page, href: `/${langLower}/${PAGE_ROUTES.about?.[langLower] || "a-propos"}#valeurs` },
        { label: t.team, page: "team" as Page },
      ],
    },
    { label: t.domains, page: "domains" as Page },
    { label: t.projects, page: "projects" as Page },
    {
      label: t.getInvolved,
      children: [
        { label: t.volunteering, page: "volunteering" as Page },
        { label: t.partners, page: "partner" as Page },
        { label: t.membership, page: "membership" as Page },
        { label: (t as any).support || "Faire un don / Nous soutenir", page: "support" as Page },
      ],
    },
    { label: t.news, page: "news" as Page },
    { label: t.contact, page: "contact" as Page },
  ]

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      // If there is an explicit href with an anchor hash
      if (item.href.includes("#")) {
        const [targetPath, hash] = item.href.split("#")
        const currentPath = window.location.pathname

        if (currentPage === item.page || currentPath.endsWith(targetPath) || currentPath === targetPath) {
          // Already on the page, smoothly scroll to element
          const targetEl = document.getElementById(hash)
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth" })
            window.history.pushState(null, "", `#${hash}`)
            return
          }
        }
      }
      router.push(item.href)
      return
    }

    if (item.page) {
      if (item.page === "apply" || item.page === "volunteering") {
        trackEvent("apply_now_click", { lang, source: "header_nav" })
      } else if (item.page === "partner") {
        trackEvent("partner_request_click", { lang, source: "header_nav" })
      }

      setTimeout(() => {
        if (item.page) {
          const url = getPageUrl(item.page, lang)
          router.push(url)
        }
      }, 100)
    }
  }

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setActiveDropdown(label)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200)
  }

  // Hide header on apply page (existing behavior)
  if (currentPage === "apply") {
    return null
  }

  const isPageActive = (page?: Page): boolean => {
    if (!page) return false
    if (page === currentPage) return true
    // Volunteering section: volunteering and apply are both "active" under the volunteering parent
    const cp = currentPage as string
    if (page === "volunteering" && (cp === "volunteering" || cp === "apply")) return true
    return false
  }

  const isDropdownActive = (item: NavItem): boolean => {
    if (item.children) {
      return item.children.some(child => isPageActive(child.page))
    }
    return isPageActive(item.page)
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
            className="flex items-center group text-left cursor-pointer transition-transform hover:scale-[1.02]"
            aria-label="APTIC-R Home"
          >
            <ApticLogo variant="header" lang={lang} />
          </button>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex flex-[2] items-center justify-center gap-1 xl:gap-2">
          {NAV.map((item) => {
            const isActive = isDropdownActive(item)
            const hasChildren = item.children && item.children.length > 0

            if (hasChildren) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className="flex items-center gap-1 text-[11px] xl:text-xs font-bold uppercase tracking-[0.12em] transition-colors whitespace-nowrap relative py-2 px-2.5 rounded-lg cursor-pointer"
                    style={{ color: isActive ? BLUE : "#233B4D" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isActive ? BLUE : "#233B4D"
                    }}
                  >
                    {item.label}
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-t-full"
                        style={{ backgroundColor: GREEN }}
                      />
                    )}
                  </button>

                  {/* Dropdown */}
                  {activeDropdown === item.label && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 py-2 rounded-xl shadow-xl border border-gray-100 z-50"
                      style={{ backgroundColor: "rgba(255,255,255,0.98)", backdropFilter: "blur(16px)" }}
                    >
                      {item.children!.map((child) => {
                        const childActive = isPageActive(child.page)
                        return (
                          <button
                            key={child.label}
                            onClick={() => {
                              handleNavClick(child)
                              setActiveDropdown(null)
                            }}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer hover:bg-[#F5F7F9]"
                            style={{ color: childActive ? BLUE : "#4A5A6A" }}
                          >
                            {child.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="text-[11px] xl:text-xs font-bold uppercase tracking-[0.12em] transition-colors whitespace-nowrap relative py-2 px-2.5 rounded-lg cursor-pointer"
                style={{ color: isActive ? BLUE : "#233B4D" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActive ? BLUE : "#233B4D"
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-t-full"
                    style={{ backgroundColor: GREEN }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
          {/* Language selector */}
          <div
            className="flex items-center p-0.5 rounded-full border"
            style={{ borderColor: "rgba(0,51,102,0.10)" }}
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
                  backgroundColor: lang === l ? "rgba(0,51,102,0.06)" : "transparent",
                  color: lang === l ? BLUE : "#233B4D",
                }}
                aria-current={lang === l ? "true" : undefined}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Primary CTA (Desktop only) */}
          {(() => {
            const isVolunteering = currentPage === "volunteering"
            const ctaLabel = isVolunteering
              ? (t as any).applyDirect || (lang === "DE" ? "JETZT BEWERBEN" : lang === "EN" ? "APPLY NOW" : "POSTULEZ")
              : t.applyNow

            return (
              <button
                onClick={() => {
                  trackEvent("apply_now_click", { lang, source: "header_button" })
                  setTimeout(() => navigate(isVolunteering ? "apply" : "volunteering"), 100)
                }}
                className="hidden lg:inline-flex items-center gap-2 font-bold text-[11px] px-6 py-2.5 rounded-full transition-all cursor-pointer text-white shadow-sm hover:scale-105"
                style={{ backgroundColor: GREEN }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = GREEN_HOVER)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = GREEN)
                }
              >
                <span>{ctaLabel}</span>
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
            )
          })()}

          {/* Mobile & Tablet Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-full cursor-pointer transition-all duration-200 border border-[rgba(0,51,102,0.12)] bg-[#F5F7F9] hover:bg-[#EAF0F4] active:scale-95"
            aria-label="Menu"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between">
              <span
                className="block h-0.5 w-full rounded-full bg-[#003366] origin-center transition-transform duration-200"
                style={{
                  transform: mobileOpen ? "translateY(5px) rotate(45deg)" : "",
                }}
              />
              <span
                className="block h-0.5 w-full rounded-full bg-[#003366] transition-opacity duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }}
              />
              <span
                className="block h-0.5 w-full rounded-full bg-[#003366] origin-center transition-transform duration-200"
                style={{
                  transform: mobileOpen
                    ? "translateY(-5px) rotate(-45deg)"
                    : "",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet menu dropdown */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-[rgba(0,51,102,0.2)] backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-[64px] sm:top-[74px] right-3 sm:right-4 md:right-6 w-[300px] sm:w-[360px] max-w-[calc(100vw-1.5rem)] z-50 bg-white rounded-2xl shadow-2xl border border-[#EAF0F4] overflow-hidden max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="relative p-4 sm:p-5 pt-10 sm:pt-12 flex flex-col w-full">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-2.5 right-3 p-1.5 sm:p-2 text-[#7A8A9A] hover:text-[#003366] bg-[#F5F7F9] hover:bg-[#EAF0F4] rounded-full transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col gap-0.5 sm:gap-1">
                {NAV.map((item) => {
                  const hasChildren = item.children && item.children.length > 0

                  if (hasChildren) {
                    return (
                      <div key={item.label}>
                        {/* Section header */}
                        <div
                          className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 pt-4 pb-1"
                          style={{ color: "#7A8A9A" }}
                        >
                          {item.label}
                        </div>
                        {item.children!.map((child) => {
                          const childActive = isPageActive(child.page)
                          return (
                            <button
                              key={child.label}
                              onClick={() => {
                                handleNavClick(child)
                                setMobileOpen(false)
                              }}
                              className="w-full text-left text-sm sm:text-[15px] font-bold tracking-tight transition-colors py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-xl hover:bg-[#F5F7F9]"
                              style={{
                                color: childActive ? BLUE : "#4A5A6A",
                                backgroundColor: childActive ? "rgba(0,51,102,0.06)" : "transparent",
                              }}
                            >
                              {child.label}
                            </button>
                          )
                        })}
                      </div>
                    )
                  }

                  const isActive = isPageActive(item.page)
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        handleNavClick(item)
                        setMobileOpen(false)
                      }}
                      className="text-left text-sm sm:text-[15px] font-bold tracking-tight transition-colors py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-xl hover:bg-[#F5F7F9]"
                      style={{
                        color: isActive ? BLUE : "#4A5A6A",
                        backgroundColor: isActive ? "rgba(0,51,102,0.06)" : "transparent",
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
              
              <div className="mt-3 pt-3 sm:pt-4 border-t border-slate-100 flex justify-center pb-1">
                {(() => {
                  const isVolunteering = currentPage === "volunteering"
                  const ctaLabel = isVolunteering
                    ? (t as any).applyDirect || (lang === "DE" ? "JETZT BEWERBEN" : lang === "EN" ? "APPLY NOW" : "POSTULEZ")
                    : t.applyNow

                  return (
                    <button
                      onClick={() => {
                        navigate(isVolunteering ? "apply" : "volunteering")
                        setMobileOpen(false)
                      }}
                      className="w-full text-center font-bold uppercase tracking-widest px-5 py-3 sm:py-3.5 rounded-xl text-white shadow-md text-xs hover:scale-102 transition-transform"
                      style={{ backgroundColor: GREEN }}
                    >
                      {ctaLabel}
                    </button>
                  )
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
