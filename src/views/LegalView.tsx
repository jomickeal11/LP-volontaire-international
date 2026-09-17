"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import type { LegalDocument } from "@/lib/legalContent"
import { LEGAL_SLUGS, type LegalDocType } from "@/lib/legalContent"
import type { Language, Page } from "@/types"

interface LegalViewProps {
  doc: LegalDocument
  lang: Language
  navigate: (p: Page) => void
}

export default function LegalView({ doc, lang, navigate }: LegalViewProps) {
  const [activeSection, setActiveSection] = useState<string>("")
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false)
  const langKey = lang.toLowerCase() as "fr" | "en" | "de"

  const homeLabel = lang === "DE" ? "Startseite" : lang === "EN" ? "Home" : "Accueil"
  const legalHubLabel = lang === "DE" ? "Mentions légales" : lang === "EN" ? "Legal" : "Mentions légales"
  const otherDocsLabel = lang === "DE" ? "Weitere Dokumente" : lang === "EN" ? "Other documents" : "Autres documents"
  const backHomeLabel = lang === "DE" ? "← Startseite" : lang === "EN" ? "← Back to home" : "← Retour à l'accueil"

  // Other legal documents for transversal navigation (discreet text links)
  const otherDocs: { type: LegalDocType; label: string }[] = (
    [
      {
        type: "privacy" as const,
        label: lang === "DE" ? "Datenschutzerklärung" : lang === "EN" ? "Privacy Policy" : "Politique de confidentialité",
      },
      {
        type: "terms" as const,
        label: lang === "DE" ? "Nutzungsbedingungen" : lang === "EN" ? "Terms of Use" : "Conditions d'utilisation",
      },
      {
        type: "cookies" as const,
        label: lang === "DE" ? "Cookie-Richtlinie" : lang === "EN" ? "Cookie Policy" : "Politique de cookies",
      },
    ] satisfies { type: LegalDocType; label: string }[]
  ).filter((d) => d.type !== doc.docType)

  // Scroll spy to highlight active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140
      const sections = doc.sections || []

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id)
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id)
          return
        }
      }
      if (sections.length > 0 && window.scrollY < 200) {
        setActiveSection(sections[0].id)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [doc.sections])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveSection(id)
      window.history.pushState(null, "", `#${id}`)
    }
  }

  return (
    <div className="pt-24 sm:pt-28 pb-20 sm:pb-28 bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 2. BREADCRUMB — Style discret sans badge ni couleur forte */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs text-[#7A8A9A]">
            <li>
              <button
                onClick={() => navigate("home")}
                className="hover:text-[#003366] transition-colors cursor-pointer"
              >
                {homeLabel}
              </button>
            </li>
            <li className="text-[#CBD5E1]">/</li>
            <li>
              <span>{legalHubLabel}</span>
            </li>
            <li className="text-[#CBD5E1]">/</li>
            <li className="text-[#1A2B3C] font-medium truncate">
              {doc.title}
            </li>
          </ol>
        </nav>

        {/* 3. STRUCTURE DESKTOP (2 COLONNES) & MOBILE (1 COLONNE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* =========================================================================
              SOMMAIRE LATÉRAL (DESKTOP UNIQUEMENT)
              Pas de grosse carte décorative, simple surface sobre, lien actif avec indicateur bleu discret
              ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28 space-y-6">
            {/* Sommaire */}
            {doc.sections && doc.sections.length > 0 && (
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#7A8A9A] mb-3 pb-2 border-b border-[#F1F5F9]">
                  {doc.tocTitle || "Sommaire"}
                </div>

                <nav className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                  {doc.sections.map((s) => {
                    const isActive = activeSection === s.id
                    return (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={(e) => scrollToSection(e, s.id)}
                        className={`group flex items-start gap-2 py-1.5 px-2.5 rounded text-xs transition-colors ${
                          isActive
                            ? "text-[#003366] font-semibold bg-[#F1F5F9]"
                            : "text-[#4A5A6A] hover:text-[#003366] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <span className="font-mono text-[#7A8A9A] shrink-0 text-[11px] pt-0.5">
                          {s.number}
                        </span>
                        <span className="leading-snug">{s.title}</span>
                      </a>
                    )
                  })}
                </nav>
              </div>
            )}

            {/* 8. AUTRES DOCUMENTS — Liens textuels discrets */}
            {otherDocs.length > 0 && (
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A8A9A] mb-2.5">
                  {otherDocsLabel}
                </div>
                <div className="space-y-1.5">
                  {otherDocs.map((item) => {
                    const slug = LEGAL_SLUGS[item.type][langKey]
                    return (
                      <Link
                        key={item.type}
                        href={`/${langKey}/${slug}`}
                        className="block text-xs text-[#4A5A6A] hover:text-[#003366] hover:underline py-1 transition-colors"
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Retour Accueil discret */}
            <div className="px-1">
              <button
                onClick={() => navigate("home")}
                className="text-xs text-[#7A8A9A] hover:text-[#003366] transition-colors cursor-pointer"
              >
                {backHomeLabel}
              </button>
            </div>
          </aside>

          {/* =========================================================================
              DOCUMENT PRINCIPAL (SURFACE BLANCHE UNIQUE, BORD DISCRET, RAYON MODÉRÉ)
              ========================================================================= */}
          <article className="col-span-1 lg:col-span-8 xl:col-span-9 bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-10 lg:p-14">
            {/* 4. EN-TÊTE DU DOCUMENT — Sobre, sans badge superflu */}
            <header className="mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#003366] tracking-tight uppercase mb-2 leading-tight">
                {doc.title}
              </h1>

              <div className="text-xs text-[#7A8A9A] font-medium mb-6">
                {doc.lastUpdated}
              </div>

              {/* 9. MOBILE UNIQUEMENT : Bouton discret Sommaire repliable */}
              {doc.sections && doc.sections.length > 0 && (
                <div className="lg:hidden mb-6">
                  <button
                    type="button"
                    onClick={() => setMobileTocOpen(!mobileTocOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#003366] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#7A8A9A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <span>{doc.tocTitle || "Sommaire"}</span>
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-[#7A8A9A] transition-transform ${mobileTocOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {mobileTocOpen && (
                    <nav className="mt-2 p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-1 text-xs">
                      {doc.sections.map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          onClick={(e) => {
                            scrollToSection(e, s.id)
                            setMobileTocOpen(false)
                          }}
                          className="flex items-center gap-2 px-2 py-1.5 rounded text-[#4A5A6A] hover:text-[#003366] hover:bg-[#F8FAFC] transition-colors"
                        >
                          <span className="font-mono text-[#7A8A9A] text-[11px]">{s.number}</span>
                          <span className="truncate">{s.title}</span>
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              )}

              {/* 6. ENCART « NOTICE D'INFORMATION » — Simple note informative sobre sans barre bleue */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-xs sm:text-sm text-[#4A5A6A] leading-relaxed mb-6">
                <p className="italic">
                  {doc.disclaimer}
                </p>
              </div>

              {/* Introduction */}
              <p className="text-base sm:text-lg text-[#1A2B3C] leading-relaxed">
                {doc.intro}
              </p>
            </header>

            {/* 5. SECTIONS NUMÉROTÉES (01 à 10) — Titres bleus, texte sombre, espacements généreux */}
            <div className="space-y-10 sm:space-y-12">
              {doc.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`scroll-mt-28 ${index > 0 ? "pt-8 sm:pt-10 border-t border-[#F1F5F9]" : ""}`}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-[#003366] tracking-tight mb-3 sm:mb-4">
                    {section.number} - {section.title}
                  </h2>
                  <div className="space-y-3 text-sm sm:text-base text-[#1A2B3C] leading-relaxed">
                    {section.content.map((paragraph, pIdx) => {
                      const isBullet = paragraph.startsWith("•")
                      return (
                        <p
                          key={pIdx}
                          className={isBullet ? "pl-4 text-[#1A2B3C]" : ""}
                        >
                          {paragraph}
                        </p>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* 7. CONTACT — Bloc final très simple : email, téléphone, adresse */}
            <footer className="mt-12 sm:mt-16 pt-8 border-t border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#003366] mb-2">
                {doc.contactBox.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5A6A] mb-4">
                {doc.contactBox.desc}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#1A2B3C]">
                <a
                  href={`mailto:${doc.contactBox.email}`}
                  className="text-[#003366] hover:underline font-medium"
                >
                  {doc.contactBox.email}
                </a>
                {doc.contactBox.phone && (
                  <span className="text-[#4A5A6A]">{doc.contactBox.phone}</span>
                )}
                <span className="text-[#4A5A6A]">{doc.contactBox.address}</span>
              </div>
            </footer>
          </article>
        </div>

        {/* Liens transversaux en bas de page sur Mobile uniquement */}
        {otherDocs.length > 0 && (
          <div className="lg:hidden mt-8 pt-6 border-t border-[#E2E8F0] text-center space-y-2">
            <div className="text-xs font-semibold text-[#7A8A9A] uppercase tracking-wider">
              {otherDocsLabel}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {otherDocs.map((item) => {
                const slug = LEGAL_SLUGS[item.type][langKey]
                return (
                  <Link
                    key={item.type}
                    href={`/${langKey}/${slug}`}
                    className="text-[#003366] hover:underline"
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate("home")}
                className="text-xs text-[#7A8A9A] hover:text-[#003366] transition-colors cursor-pointer"
              >
                {backHomeLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


