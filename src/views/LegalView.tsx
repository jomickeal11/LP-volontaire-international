"use client"

import React from "react"
import type { LegalDocument } from "@/lib/legalContent"
import type { Language, Page } from "@/types"

interface LegalViewProps {
  doc: LegalDocument
  lang: Language
  navigate: (p: Page) => void
}

export default function LegalView({ doc, lang, navigate }: LegalViewProps) {
  const homeLabel = lang === "DE" ? "Startseite" : lang === "EN" ? "Home" : "Accueil"
  const legalHubLabel = lang === "DE" ? "Rechtliches" : lang === "EN" ? "Legal" : "Mentions légales"

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      // Update hash without jumping
      window.history.pushState(null, "", `#${id}`)
    }
  }

  return (
    <div className="pt-24 sm:pt-28 pb-20 sm:pb-28 bg-[#F5F7F9]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fil d'Ariane sobre */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-[#7A8A9A]">
            <li>
              <button
                onClick={() => navigate("home")}
                className="hover:text-[#174F7A] transition-colors cursor-pointer font-medium"
              >
                {homeLabel}
              </button>
            </li>
            <li>/</li>
            <li>
              <span className="font-medium text-[#7A8A9A]">{legalHubLabel}</span>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#174F7A] truncate">
              {doc.title}
            </li>
          </ol>
        </nav>

        {/* Document Principal Unique (Format Document Officiel Sobre) */}
        <article className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAF0F4] p-6 sm:p-12 lg:p-16 shadow-xs">
          {/* En-tête du document */}
          <header className="border-b border-[#EAF0F4] pb-8 sm:pb-12 mb-10 sm:mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-[#7A8A9A] mb-3">
              APTIC-R • {doc.tag}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#174F7A] tracking-tight uppercase mb-4 leading-tight">
              {doc.title}
            </h1>

            <div className="text-xs sm:text-sm text-[#7A8A9A] font-medium mb-6">
              {doc.lastUpdated}
            </div>

            {/* Notice d'information officielle & transparence */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#F5F7F9] border-l-4 border-[#174F7A] text-xs sm:text-sm text-[#4A5A6A] leading-relaxed mb-6">
              <span className="font-bold text-[#174F7A] block mb-1">
                Notice d'information
              </span>
              <p className="italic">
                {doc.disclaimer}
              </p>
            </div>

            <p className="text-base sm:text-lg text-[#233B4D] leading-relaxed">
              {doc.intro}
            </p>
          </header>

          {/* Sommaire éditorial avec ancres fluides */}
          {doc.sections && doc.sections.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F5F7F9] border border-[#EAF0F4] mb-12 sm:mb-16">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#174F7A] mb-4">
                {doc.tocTitle || "Sommaire"}
              </h2>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => scrollToSection(e, s.id)}
                      className="text-xs sm:text-sm text-[#4A5A6A] hover:text-[#174F7A] hover:underline underline-offset-4 transition-colors font-medium flex items-center gap-2"
                    >
                      <span className="text-[#7A8A9A] font-mono text-xs">{s.number}</span>
                      <span className="truncate">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Sections numérotées successives (corps de document continu) */}
          <div className="space-y-12 sm:space-y-16">
            {doc.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 sm:scroll-mt-28 border-b border-[#EAF0F4] last:border-b-0 pb-10 sm:pb-14 last:pb-0"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-[#174F7A] tracking-tight mb-4 sm:mb-6">
                  {section.number} — {section.title}
                </h2>
                <div className="space-y-3.5 text-sm sm:text-base text-[#4A5A6A] leading-relaxed">
                  {section.content.map((paragraph, pIdx) => {
                    const isBullet = paragraph.startsWith("•")
                    return (
                      <p
                        key={pIdx}
                        className={isBullet ? "pl-4 text-[#233B4D]" : ""}
                      >
                        {paragraph}
                      </p>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Coordonnées institutionnelles de clôture */}
          <footer className="mt-14 pt-10 border-t border-[#EAF0F4]">
            <div className="text-xs uppercase tracking-wider text-[#7A8A9A] font-bold mb-2">
              APTIC-R • Agbélouvé, Togo
            </div>
            <p className="text-sm text-[#4A5A6A] mb-4">
              {doc.contactBox.desc}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#174F7A] font-medium">
              <a
                href={`mailto:${doc.contactBox.email}`}
                className="hover:underline underline-offset-2"
              >
                {doc.contactBox.email}
              </a>
              {doc.contactBox.phone && (
                <span>{doc.contactBox.phone}</span>
              )}
              <span>{doc.contactBox.address}</span>
            </div>
          </footer>
        </article>

        {/* Retour Accueil */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("home")}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174F7A] hover:underline underline-offset-4 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{homeLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
