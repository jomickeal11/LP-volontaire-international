"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { getProjects } from "@/lib/cms-actions"

interface ProjectsViewProps {
  lang: Language
}

interface ProjectRecord {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  summaryFr: string
  summaryEn?: string | null
  summaryDe?: string | null
  descriptionFr: string
  descriptionEn?: string | null
  descriptionDe?: string | null
  location: string
  country: string
  status: string
  beneficiaries?: string | null
  featured: boolean
  domaine?: {
    id: string
    slug: string
    nameFr: string
    nameEn: string
    nameDe: string
    icon?: string | null
    color?: string | null
  } | null
}

const BG = "#F7F8FA"

const I18N = {
  FR: {
    badge: "Initiatives de Terrain & Impact Durable",
    title: "Nos Projets & Réalisations",
    subtitle:
      "Découvrez les projets concrets déployés par APTIC-R avec les communautés rurales du Togo : éducation, inclusion, agro-écologie et tiers-lieux d'innovation.",
    filterAll: "Tous les statuts",
    statusInProgress: "En cours",
    statusCompleted: "Réalisés",
    statusPlanned: "À venir / Planifiés",
    beneficiariesLabel: "Bénéficiaires :",
    locationLabel: "Localisation :",
    detailsBtn: "Voir la fiche détaillée",
    ctaTitle: "Vous souhaitez co-financer ou soutenir un de ces projets ?",
    ctaSubtitle: "Nous mettons en place des conventions de partenariat transparentes avec bilans d'impact mesurables.",
    ctaPartner: "DEVENIR PARTENAIRE PROJET",
    ctaVolunteer: "CANDIDATER COMME VOLONTAIRE",
  },
  EN: {
    badge: "Grassroots Initiatives & Lasting Impact",
    title: "Our Field Projects",
    subtitle:
      "Explore the concrete projects conducted by APTIC-R alongside rural Togolese communities: digital education, inclusion, agro-ecology, and community makerspaces.",
    filterAll: "All statuses",
    statusInProgress: "In progress",
    statusCompleted: "Completed",
    statusPlanned: "Planned / Upcoming",
    beneficiariesLabel: "Beneficiaries:",
    locationLabel: "Location:",
    detailsBtn: "View project details",
    ctaTitle: "Interested in supporting or co-funding a project?",
    ctaSubtitle: "We establish transparent partnership agreements with verified impact metrics.",
    ctaPartner: "BECOME A PROJECT PARTNER",
    ctaVolunteer: "APPLY AS VOLUNTEER",
  },
  DE: {
    badge: "Praxisprojekte & Nachhaltige Wirkung",
    title: "Unsere Projekte vor Ort",
    subtitle:
      "Entdecken Sie konkrete Vorhaben von APTIC-R in ländlichen Gebieten Togos: Bildung, Inklusion und ökologische Technologien.",
    filterAll: "Alle Status",
    statusInProgress: "Laufend",
    statusCompleted: "Abgeschlossen",
    statusPlanned: "Geplant",
    beneficiariesLabel: "Begünstigte:",
    locationLabel: "Standort:",
    detailsBtn: "Projektdetails ansehen",
    ctaTitle: "Möchten Sie ein Projekt fördern?",
    ctaSubtitle: "Wir bieten transparente Kooperationsmodelle mit nachweisbarer Wirkung.",
    ctaPartner: "PROJEKTPARTNER WERDEN",
    ctaVolunteer: "ALS FREIWILLIGER BEWERBEN",
  },
}

export default function ProjectsView({ lang }: ProjectsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data as any))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredProjects =
    statusFilter === "ALL"
      ? projects
      : projects.filter((p) => p.status === statusFilter)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="projects" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#003366]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#003366] mb-6">
              <span>🚀</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Filters ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
            {[
              { id: "ALL", label: t.filterAll },
              { id: "IN_PROGRESS", label: `⚡ ${t.statusInProgress}` },
              { id: "COMPLETED", label: `✓ ${t.statusCompleted}` },
              { id: "PLANNED", label: `⏳ ${t.statusPlanned}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  statusFilter === tab.id
                    ? "bg-[#003366] text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Projects Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                Chargement des projets...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200">
                Aucun projet ne correspond à ce filtre actuellement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((p) => {
                  const title =
                    lang === "EN" && p.titleEn
                      ? p.titleEn
                      : lang === "DE" && p.titleDe
                      ? p.titleDe
                      : p.titleFr
                  const summary =
                    lang === "EN" && p.summaryEn
                      ? p.summaryEn
                      : lang === "DE" && p.summaryDe
                      ? p.summaryDe
                      : p.summaryFr
                  const domaineName =
                    lang === "EN" && p.domaine?.nameEn
                      ? p.domaine.nameEn
                      : lang === "DE" && p.domaine?.nameDe
                      ? p.domaine.nameDe
                      : p.domaine?.nameFr

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header badges */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          {p.domaine ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#003366]/10 text-[#003366]">
                              <span>{p.domaine.icon || "🎯"}</span>
                              <span className="truncate max-w-[150px]">{domaineName}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                              Projet
                            </span>
                          )}

                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              p.status === "COMPLETED"
                                ? "bg-slate-100 text-slate-700"
                                : p.status === "IN_PROGRESS"
                                ? "bg-[#D1F0DE] text-[#166534]"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {p.status === "COMPLETED"
                              ? t.statusCompleted
                              : p.status === "IN_PROGRESS"
                              ? t.statusInProgress
                              : t.statusPlanned}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#142332] mb-2 leading-snug">
                          {title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                          {summary}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold">{t.locationLabel}</span>
                          <span className="text-slate-800 font-medium truncate max-w-[180px]">
                            {p.location}
                          </span>
                        </div>

                        {p.beneficiaries && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="font-semibold">{t.beneficiariesLabel}</span>
                            <span className="text-[#28A745] font-bold">
                              {p.beneficiaries}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedProject(p)}
                          className="w-full text-center py-2.5 rounded-xl font-bold bg-[#003366]/10 text-[#003366] hover:bg-[#003366] hover:text-white transition-all text-xs"
                        >
                          {t.detailsBtn} →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. Detail Modal ── */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  {selectedProject.domaine && (
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider block">
                      {selectedProject.domaine.nameFr}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-bold text-[#142332] mt-1">
                    {selectedProject.titleFr}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    📍 {selectedProject.location}, {selectedProject.country}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Résumé du projet
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedProject.summaryFr}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Description complète & Démarche
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedProject.descriptionFr || selectedProject.summaryFr}
                </div>
              </div>

              {selectedProject.beneficiaries && (
                <div className="p-4 rounded-xl bg-[#28A745]/10 border border-[#28A745]/20 flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-700">Impact & Bénéficiaires :</span>
                  <span className="font-bold text-[#28A745]">{selectedProject.beneficiaries}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Link
                  href={getPageUrl("partner", lang)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#003366] text-white hover:bg-[#002244] transition-colors"
                >
                  Soutenir ce projet
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. CTA ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#003366] text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              {t.ctaTitle}
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
              {t.ctaSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href={getPageUrl("partner", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-[#28A745] text-white hover:bg-[#2e924e] transition-colors shadow-md"
              >
                {t.ctaPartner}
              </Link>
              <Link
                href={getPageUrl("apply", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-white text-[#003366] hover:bg-slate-100 transition-colors shadow-md"
              >
                {t.ctaVolunteer}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
