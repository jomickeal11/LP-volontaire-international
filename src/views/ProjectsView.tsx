"use client"

import React, { useState, useEffect, useMemo } from "react"
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
  isFeatured: boolean
  displayOrder: number
  featuredImage?: string | null
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

const BG_HERO = "#F7F8FA"
const BG_LIST = "#F1F5F8"
const BG_CTA = "#F7F8FA"

const I18N = {
  FR: {
    eyebrow: "NOS PROJETS",
    title: "Des initiatives concrètes,\nau service des territoires ruraux.",
    subtitle: "Découvrez les projets menés ou accompagnés par l’APTIC-R au Togo.",
    filterAllStatus: "Tous",
    filterAllDomains: "Tous les domaines",
    statusInProgress: "En cours",
    statusCompleted: "Réalisés",
    statusPlanned: "À venir",
    beneficiariesLabel: "Bénéficiaires",
    locationLabel: "Lieu",
    detailsBtn: "Voir le projet",
    ctaTitle: "Collaborer avec nous",
    ctaSubtitle: "Nous mettons en place des conventions de partenariat transparentes pour le déploiement de projets à impact.",
    ctaPartner: "Devenir partenaire",
    projectCount: (count: number) => `${count} projet${count > 1 ? "s" : ""}`,
  },
  EN: {
    eyebrow: "OUR PROJECTS",
    title: "Concrete initiatives,\nserving rural territories.",
    subtitle: "Discover the projects led or supported by APTIC-R in Togo.",
    filterAllStatus: "All",
    filterAllDomains: "All domains",
    statusInProgress: "In progress",
    statusCompleted: "Completed",
    statusPlanned: "Upcoming",
    beneficiariesLabel: "Beneficiaries",
    locationLabel: "Location",
    detailsBtn: "View project",
    ctaTitle: "Collaborate with us",
    ctaSubtitle: "We establish transparent partnership agreements to deploy impactful projects.",
    ctaPartner: "Become a partner",
    projectCount: (count: number) => `${count} project${count > 1 ? "s" : ""}`,
  },
  DE: {
    eyebrow: "UNSERE PROJEKTE",
    title: "Konkrete Initiativen,\nim Dienste ländlicher Gebiete.",
    subtitle: "Entdecken Sie die Projekte, die von APTIC-R in Togo geleitet oder unterstützt werden.",
    filterAllStatus: "Alle",
    filterAllDomains: "Alle Bereiche",
    statusInProgress: "Laufend",
    statusCompleted: "Abgeschlossen",
    statusPlanned: "Geplant",
    beneficiariesLabel: "Begünstigte",
    locationLabel: "Ort",
    detailsBtn: "Projekt ansehen",
    ctaTitle: "Arbeiten Sie mit uns zusammen",
    ctaSubtitle: "Wir schließen transparente Partnerschaftsvereinbarungen ab, um wirkungsvolle Projekte umzusetzen.",
    ctaPartner: "Partner werden",
    projectCount: (count: number) => `${count} Projekt${count > 1 ? "e" : ""}`,
  },
}

export default function ProjectsView({ lang }: ProjectsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [domainFilter, setDomainFilter] = useState("ALL")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  useEffect(() => {
    setLoading(true)
    getProjects({ lang })
      .then((data) => setProjects(data as any))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lang])

  // Extract unique domains
  const availableDomains = useMemo(() => {
    const domains = new Map<string, string>()
    projects.forEach((p) => {
      if (p.domaine) {
        const name =
          lang === "EN" && p.domaine.nameEn
            ? p.domaine.nameEn
            : lang === "DE" && p.domaine.nameDe
            ? p.domaine.nameDe
            : p.domaine.nameFr
        domains.set(p.domaine.id, name)
      }
    })
    return Array.from(domains.entries()).map(([id, name]) => ({ id, name }))
  }, [projects, lang])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter
      const matchDomain = domainFilter === "ALL" || (p.domaine && p.domaine.id === domainFilter)
      return matchStatus && matchDomain
    })
  }, [projects, statusFilter, domainFilter])

  const featuredProject = useMemo(() => {
    return filteredProjects.find((p) => p.isFeatured) || null
  }, [filteredProjects])

  const standardProjects = useMemo(() => {
    return filteredProjects.filter((p) => !p.isFeatured)
  }, [filteredProjects])

  const renderProjectCard = (p: ProjectRecord, isLarge: boolean, index: number) => {
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
      <Link
        key={p.id}
        href={`/${lang.toLowerCase()}/projets/${p.slug}`}
        className={isLarge 
          ? "group flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/80 overflow-hidden col-span-1 md:col-span-2" 
          : "group flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/80 overflow-hidden col-span-1"
        }
      >
        {/* Image holder - Pleine largeur en haut de la carte (full-bleed) */}
        <div className={isLarge
          ? "bg-slate-200 relative shrink-0 w-full aspect-video md:aspect-[21/9] overflow-hidden"
          : "bg-slate-200 relative shrink-0 w-full aspect-video overflow-hidden"
        }>
          {/* Status Label Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md shadow-sm ${
              p.status === "COMPLETED"
                ? "bg-white text-slate-700"
                : p.status === "IN_PROGRESS"
                ? "bg-[#28A745] text-white"
                : "bg-[#007BFF] text-white"
            }`}>
              {p.status === "COMPLETED" ? t.statusCompleted : p.status === "IN_PROGRESS" ? t.statusInProgress : t.statusPlanned}
            </span>
          </div>
          {p.featuredImage ? (
            <img src={p.featuredImage} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <img src={['/photo-projet-phare.jpg', '/photo-recit-documentaire.jpg', '/photo-ancrage-togo.png'][index % 3]} alt="Placeholder projet" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
        </div>

        {/* Content avec padding intérieur */}
        <div className={isLarge 
          ? "p-6 sm:p-8 flex flex-col flex-1" 
          : "p-5 sm:p-6 flex flex-col flex-1"
        }>
          <div className="flex items-center gap-3 mb-3">
            {p.domaine && (
              <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                {domaineName}
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">
              {p.location}
            </span>
          </div>
          
          <h3 className={`font-bold text-[#003366] mb-3 leading-tight group-hover:text-[#007BFF] transition-colors ${isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {title}
          </h3>
          
          <p className={`text-[#5E6B76] leading-relaxed mb-6 ${isLarge ? 'text-base sm:text-lg max-w-4xl' : 'text-sm'}`}>
            {summary}
          </p>
          
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-sm font-bold text-[#007BFF] group-hover:text-[#003366] transition-colors">
              {t.detailsBtn} <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="projects" navigate={navigate} />

      <main className="flex-1">
        {/* ── 1. Hero (#F7F8FA) - Fond gris montant jusqu'en haut derrière le header ── */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 border-b border-slate-200/80"
          style={{ backgroundColor: BG_HERO }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
              <span className="text-[#28A745] font-bold tracking-widest text-xs sm:text-sm uppercase">
                {t.eyebrow}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight mb-3 whitespace-pre-line leading-tight">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Transition Band & Filters (#FFFFFF) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "ALL", label: t.filterAllStatus },
                  { id: "IN_PROGRESS", label: t.statusInProgress },
                  { id: "COMPLETED", label: t.statusCompleted },
                  { id: "PLANNED", label: t.statusPlanned },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                      statusFilter === tab.id
                        ? "bg-[#003366] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Domain Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer focus:ring-2 focus:ring-[#003366] outline-none appearance-none pr-8 relative"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%235E6B76\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                >
                  <option value="ALL">{t.filterAllDomains}</option>
                  {availableDomains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-400">
              {loading ? "..." : t.projectCount(filteredProjects.length)}
            </div>
          </div>
        </section>

        {/* ── 3. Projects Grid (#F1F5F8) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ backgroundColor: BG_LIST }}>
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                Chargement...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                Aucun projet trouvé.
              </div>
            ) : (
              <div className="flex flex-col gap-10 sm:gap-12">
                {featuredProject && (
                  <div>
                    {renderProjectCard(featuredProject, true, 0)}
                  </div>
                )}
                
                {standardProjects.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {standardProjects.map((p, index) => renderProjectCard(p, false, index + 1))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. Structured CTA Section (#FFFFFF surrounding with #F7F8FA Card) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-2xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
              style={{ backgroundColor: BG_CTA, minHeight: "220px" }}
            >
              <div className="text-center md:text-left">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#28A745] mb-2">
                  Partenariats & Impact
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] mb-3">
                  {t.ctaTitle}
                </h2>
                <p className="text-[#5E6B76] text-sm sm:text-base max-w-lg leading-relaxed">
                  {t.ctaSubtitle}
                </p>
              </div>
              
              <div className="shrink-0">
                <Link
                  href={getPageUrl("partner", lang)}
                  className="px-7 py-3.5 rounded-xl font-bold text-sm bg-[#007BFF] text-white hover:bg-[#003366] transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow"
                >
                  {t.ctaPartner} <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
