"use client"

import React from "react"
import Link from "next/link"
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

  return (
    <div className="pt-24 sm:pt-28 pb-20 lg:pb-32 bg-[#F5F7F9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
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
            <li className="font-semibold text-[#174F7A] truncate max-w-[200px] sm:max-w-none">
              {doc.title}
            </li>
          </ol>
        </nav>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#EAF0F4] shadow-sm mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[rgba(23,79,122,0.06)] text-[#174F7A] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35A85A]" />
            {doc.tag}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#174F7A] tracking-tight mb-4">
            {doc.title}
          </h1>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-[#7A8A9A] font-medium mb-6">
            <span>{doc.lastUpdated}</span>
            <span>•</span>
            <span>Agbélouvé, Togo</span>
          </div>

          {/* Notice officielle de validation préalable */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7F9] border-l-4 border-[#35A85A] text-xs sm:text-sm text-[#4A5A6A] leading-relaxed mb-6">
            <div className="font-bold text-[#174F7A] mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#35A85A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Notice d'information & Cadre de transparence</span>
            </div>
            <p className="italic">{doc.disclaimer}</p>
          </div>

          <p className="text-base sm:text-lg text-[#4A5A6A] leading-relaxed">
            {doc.intro}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {doc.sections.map((section, idx) => (
            <section
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#EAF0F4] shadow-sm transition-all"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#174F7A] mb-4 sm:mb-6 tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-[#4A5A6A] leading-relaxed">
                {section.content.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className={paragraph.startsWith("•") ? "pl-4 text-[#233B4D]" : ""}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact direct box */}
        <div className="mt-8 sm:mt-12 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#EAF0F4] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#174F7A] mb-1">
              {doc.contactBox.title}
            </h3>
            <p className="text-sm text-[#5E6B76] mb-2">
              {doc.contactBox.desc}
            </p>
            <p className="text-xs text-[#7A8A9A]">
              Siège : {doc.contactBox.address}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href={`mailto:${doc.contactBox.email}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#174F7A] text-white text-xs sm:text-sm font-bold hover:bg-[#123E60] transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{doc.contactBox.email}</span>
            </a>
            <button
              onClick={() => navigate("home")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F5F7F9] hover:bg-[#EAF0F4] border border-[#EAF0F4] text-[#174F7A] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <span>{homeLabel}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
