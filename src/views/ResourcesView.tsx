"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { getRessources } from "@/lib/cms-actions"

interface ResourcesViewProps {
  lang: Language
}

const BG = "#F7F8FA"

const I18N = {
  FR: {
    badge: "Transparence, Documentation & Savoirs Partagés",
    title: "Centre de Ressources Documentaires",
    subtitle:
      "Consultez et téléchargez librement nos rapports d'activité, guides pratiques, fiches projets et documents officiels de gouvernance.",
    filterAll: "Tous les documents",
    types: {
      REPORT: "Rapports & Bilans",
      GUIDE: "Guides & Manuels",
      PROJECT_SHEET: "Fiches Projets",
      STATUTE: "Statuts & Juridique",
      OTHER: "Autres documents",
    },
    downloadBtn: "Télécharger le PDF",
    transparencyTitle: "Notre Engagement pour la Transparence",
    transparencyText:
      "Conformément à nos valeurs associatives, tous les bilans moraux, financiers et rapports d'impact annuels d'APTIC-R sont publics et accessibles à nos adhérents, partenaires et bénéficiaires.",
    yearLabel: "Année :",
    typeLabel: "Catégorie :",
    langFilterLabel: "Langue du document :",
    langAll: "Toutes les langues",
    languages: {
      FR: "Français",
      EN: "English",
      DE: "Deutsch",
    },
    noResults: "Aucun document trouvé pour les critères sélectionnés.",
    emptyLibrary: "Aucune ressource n'a encore été publiée.",
    emptyNotice: "L'équipe administrative mettra prochainement en ligne les premiers rapports et documents officiels.",
  },
  EN: {
    badge: "Transparency, Knowledge & Open Access",
    title: "Document & Resource Library",
    subtitle:
      "Freely consult and download our annual activity reports, practical field guides, project briefs, and official organizational bylaws.",
    filterAll: "All documents",
    types: {
      REPORT: "Reports & Financials",
      GUIDE: "Guides & Manuals",
      PROJECT_SHEET: "Project Briefs",
      STATUTE: "Statutes & Governance",
      OTHER: "Other documents",
    },
    downloadBtn: "Download PDF",
    transparencyTitle: "Our Commitment to Transparency",
    transparencyText:
      "In accordance with our core non-profit principles, all moral and financial audits, annual statements, and impact reviews are open and publicly accessible.",
    yearLabel: "Year:",
    typeLabel: "Category:",
    langFilterLabel: "Document language:",
    langAll: "All languages",
    languages: {
      FR: "French",
      EN: "English",
      DE: "German",
    },
    noResults: "No document found matching selected criteria.",
    emptyLibrary: "No resources published yet.",
    emptyNotice: "Our administrative team will soon publish official reports and documents.",
  },
  DE: {
    badge: "Transparenz, Wissen & Offene Dokumentation",
    title: "Dokumenten- und Ressourcenarchiv",
    subtitle:
      "Laden Sie Jahresberichte, Leitfäden und offizielle Satzungsdokumente von APTIC-R kostenfrei herunter.",
    filterAll: "Alle Dokumente",
    types: {
      REPORT: "Jahresberichte",
      GUIDE: "Leitfäden & Handbücher",
      PROJECT_SHEET: "Projektsteckbriefe",
      STATUTE: "Satzung & Rechtliches",
      OTHER: "Weitere Dokumente",
    },
    downloadBtn: "PDF herunterladen",
    transparencyTitle: "Unser Engagement für Transparenz",
    transparencyText:
      "Gemäß unseren Grundsätzen sind alle Berichte und Prüfungen öffentlich zugänglich.",
    yearLabel: "Jahr:",
    typeLabel: "Kategorie:",
    langFilterLabel: "Dokumentensprache:",
    langAll: "Alle Sprachen",
    languages: {
      FR: "Französisch",
      EN: "Englisch",
      DE: "Deutsch",
    },
    noResults: "Keine Dokumente für die ausgewählten Kriterien gefunden.",
    emptyLibrary: "Bisher wurden keine Ressourcen veröffentlicht.",
    emptyNotice: "Das Verwaltungsteam wird in Kürze offizielle Berichte und Dokumente bereitstellen.",
  },
}

export default function ResourcesView({ lang }: ResourcesViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [docLangFilter, setDocLangFilter] = useState("ALL")

  useEffect(() => {
    async function load() {
      try {
        const dbItems = await getRessources({ publishedOnly: true })
        setResources(dbItems || [])
      } catch (err) {
        console.error("Error loading resources:", err)
        setResources([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const filteredResources = resources.filter((r) => {
    const matchesType = typeFilter === "ALL" || r.type === typeFilter
    const matchesDocLang = docLangFilter === "ALL" || (r.lang || "FR").toUpperCase() === docLangFilter.toUpperCase()
    return matchesType && matchesDocLang
  })

  // Helper pour afficher le drapeau et libellé de la langue du document
  const getDocLangInfo = (docLang?: string) => {
    const code = (docLang || "FR").toUpperCase()
    switch (code) {
      case "FR":
        return { flag: "🇫🇷", label: "Français", code: "FR" }
      case "EN":
        return { flag: "🇬🇧", label: "English", code: "EN" }
      case "DE":
        return { flag: "🇩🇪", label: "Deutsch", code: "DE" }
      default:
        return { flag: "🌐", label: code, code }
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="resources" navigate={navigate} />

      <main className="flex-1">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 text-center bg-gradient-to-b from-[#003366]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#003366] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#003366]" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-4 uppercase">
              {lang === "FR" ? "Ressources" : t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Filter Pills ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12 space-y-4">
          {/* Filtres par Type de document */}
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                typeFilter === "ALL"
                  ? "bg-[#003366] text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.filterAll}
            </button>
            {Object.entries(t.types).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  typeFilter === key
                    ? "bg-[#003366] text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filtres par Langue du document (Toutes · Français · English · Deutsch) */}
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 mr-2">
              {t.langFilterLabel}
            </span>
            <button
              onClick={() => setDocLangFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docLangFilter === "ALL"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.langAll}
            </button>
            <button
              onClick={() => setDocLangFilter("FR")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                docLangFilter === "FR"
                  ? "bg-[#003366] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>🇫🇷</span>
              <span>Français</span>
            </button>
            <button
              onClick={() => setDocLangFilter("EN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                docLangFilter === "EN"
                  ? "bg-[#003366] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              onClick={() => setDocLangFilter("DE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                docLangFilter === "DE"
                  ? "bg-[#003366] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>🇩🇪</span>
              <span>Deutsch</span>
            </button>
          </div>
        </section>

        {/* ── 3. Resources Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-20 text-slate-400">
                <div className="w-8 h-8 border-3 border-[#003366] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Chargement des documents officiels...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {resources.length === 0 ? t.emptyLibrary : t.noResults}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  {t.emptyNotice}
                </p>
                {resources.length > 0 && (typeFilter !== "ALL" || docLangFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setTypeFilter("ALL")
                      setDocLangFilter("ALL")
                    }}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#003366] bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((res) => {
                  const title =
                    lang === "EN"
                      ? res.titleEn || res.titleFr
                      : lang === "DE"
                      ? res.titleDe || res.titleFr
                      : res.titleFr
                  const desc =
                    lang === "EN"
                      ? res.descriptionEn || res.descriptionFr
                      : lang === "DE"
                      ? res.descriptionDe || res.descriptionFr
                      : res.descriptionFr
                  const typeLabel = t.types[res.type as keyof typeof t.types] || res.type
                  const docLangInfo = getDocLangInfo(res.lang)

                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* En-tête de carte : Type · Année */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                            {typeLabel} · {res.year}
                          </span>
                          {res.fileSizeStr && (
                            <span className="text-xs font-semibold text-slate-400">
                              {res.fileSizeStr}
                            </span>
                          )}
                        </div>

                        {/* Badge clair de la langue du document PDF */}
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
                            <span>{docLangInfo.flag}</span>
                            <span>{docLangInfo.label}</span>
                          </span>
                        </div>

                        {/* Titre */}
                        <h3 className="text-xl font-bold text-[#142332] mb-2 leading-snug">
                          {title}
                        </h3>

                        {/* Description */}
                        {desc && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                            {desc}
                          </p>
                        )}
                      </div>

                      {/* Bouton de téléchargement exact */}
                      <div className="pt-4 border-t border-slate-100">
                        <a
                          href={res.fileUrl}
                          download={res.fileName || "document.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors text-xs shadow-sm cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>{t.downloadBtn}</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. Transparency Commitment ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#F0F4F8] border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#28A745]/10 text-[#28A745] flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-[#28A745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142332]">
              {t.transparencyTitle}
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
              {t.transparencyText}
            </p>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
