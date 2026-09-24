"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Footer from "@/components/Footer"
import { DomainCharterIcon } from "@/components/DomainIcons"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"

interface DomainDetailViewProps {
  domaine: any
  allDomaines?: any[]
  lang: Language
}

const BG_HERO = "#F7F8FA"
const BG_CARD = "#FFFFFF"

const DOMAIN_PHOTOS: Record<string, { src: string; caption: string }> = {
  "inclusion-numerique": {
    src: "/photo-ancrage-togo.png",
    caption: "Atelier d'alphabétisation numérique et équipement solaire à Agbélouvé",
  },
  "jeunesse-education": {
    src: "/hero-volunteer-collab.jpg",
    caption: "Formation des jeunes aux métiers du web et du code",
  },
  "cybersecurite-hygiene": {
    src: "/togo-volunteer.jpg",
    caption: "Sensibilisation communautaire à la sécurité mobile et numérique",
  },
  "agri-lowtech": {
    src: "/photo-projet-phare.jpg",
    caption: "Capteurs d'irrigation et innovations Low-Tech pour les groupements maraîchers",
  },
  "data-innovation": {
    src: "/photo-recit-documentaire.jpg",
    caption: "Collecte de données participative et cartographie des ressources rurales",
  },
  "dev-rural-fablabs": {
    src: "/meeting-org.jpg",
    caption: "Tiers-lieu FabLab et artisanat connecté au cœur du territoire",
  },
}

function parseList(raw: any): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch {
        // fallback
      }
    }
    return trimmed
      .split("\n")
      .map((s) => s.replace(/^[-*•●\d.]+\s*/, "").trim())
      .filter((s) => s.length > 0)
  }
  return []
}

export default function DomainDetailView({ domaine, allDomaines = [], lang }: DomainDetailViewProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  // Localized fields
  const title =
    lang === "EN"
      ? domaine.nameEn || domaine.nameFr
      : lang === "DE"
      ? domaine.nameDe || domaine.nameFr
      : domaine.nameFr

  const subtitle =
    lang === "EN"
      ? domaine.subtitleEn || domaine.subtitleFr || ""
      : lang === "DE"
      ? domaine.subtitleDe || domaine.subtitleFr || ""
      : domaine.subtitleFr || ""

  const desc =
    lang === "EN"
      ? domaine.descEn || domaine.descFr
      : lang === "DE"
      ? domaine.descDe || domaine.descFr
      : domaine.descFr

  const targetAudience =
    lang === "EN"
      ? domaine.targetAudienceEn || domaine.targetAudienceFr
      : lang === "DE"
      ? domaine.targetAudienceDe || domaine.targetAudienceFr
      : domaine.targetAudienceFr

  // Lists
  const rawObjectives =
    lang === "EN"
      ? domaine.objectivesEn || domaine.objectivesFr
      : lang === "DE"
      ? domaine.objectivesDe || domaine.objectivesFr
      : domaine.objectivesFr
  const objectives = parseList(rawObjectives)

  const rawActions =
    lang === "EN"
      ? domaine.actionsEn || domaine.actionsFr
      : lang === "DE"
      ? domaine.actionsDe || domaine.actionsFr
      : domaine.actionsFr
  const actions = parseList(rawActions)

  // Associated Projects & Resources
  const projets: any[] = Array.isArray(domaine.projets) ? domaine.projets : []
  const documents: any[] = Array.isArray(domaine.documents) ? domaine.documents : []

  // Fallback image
  const photoMeta = DOMAIN_PHOTOS[domaine.slug] || {
    src: "/photo-recit-documentaire.jpg",
    caption: "Activité de terrain APTIC-R",
  }
  const photoSrc = domaine.featuredImage || domaine.imageUrl || photoMeta.src
  const photoCaption =
    lang === "EN"
      ? domaine.imageCaptionEn || domaine.imageCaptionFr || photoMeta.caption
      : lang === "DE"
      ? domaine.imageCaptionDe || domaine.imageCaptionFr || photoMeta.caption
      : domaine.imageCaptionFr || photoMeta.caption

  // Domain number / order
  const domainOrder = (allDomaines.findIndex((d) => d.slug === domaine.slug) + 1) || domaine.order || 1
  const numStr = domainOrder < 10 ? `0${domainOrder}` : `${domainOrder}`

  // Other domains for switcher
  const otherDomains = allDomaines.filter((d) => d.id !== domaine.id && d.slug !== domaine.slug)

  // Translations
  const t = {
    FR: {
      breadcrumbHome: "Accueil",
      breadcrumbDomains: "Nos Domaines d'Action",
      poleBadge: `Pôle Stratégique ${numStr}`,
      targetAudienceTitle: "Publics cibles & bénéficiaires",
      objectivesTitle: "Objectifs clés & impacts recherchés",
      actionsTitle: "Actions prioritaires & déploiements terrain",
      projectsTitle: "Projets associés à ce pôle",
      projectsDesc: "Initiatives concrètes portées par l'APTIC-R et déployées avec les volontaires sur le terrain.",
      noProjects: "Aucun projet spécifique n'est actuellement rattaché à ce pôle dans le CMS.",
      resourcesTitle: "Documents & ressources du pôle",
      otherDomainsTitle: "Explorer les autres domaines d'action",
      frameworkTitle: "Cadre d'intervention terrain",
      frameworkBadge: "Immersion & Logistique",
      frameworkHubLabel: "Base opérationnelle",
      frameworkHubVal: "FabLab Rural d'Agbélouvé & villages associés",
      frameworkDurationLabel: "Durée type des missions",
      frameworkDurationVal: "3 à 12 mois (modulable)",
      frameworkProfilesLabel: "Profils accueillis",
      frameworkProfilesVal: "Jeunes diplômés, spécialistes techniques & profils polyvalents",
      frameworkSupportLabel: "Encadrement & vie locale",
      frameworkSupportVal: "Tuteur local dédié, hébergement sécurisé & immersion communautaire",
      frameworkContactBtn: "Une question sur ce pôle ? Contacter l'équipe →",
      ctaApply: "Postuler comme volontaire",
      ctaPartner: "Proposer un partenariat",
      quickFactsTitle: "Repères institutionnels",
      factCode: "Identifiant officiel",
      factAnchor: "Ancrage géographique",
      factStatus: "Statut d'intervention",
      factProjectsCount: "Projets rattachés",
      statusActive: "Pôle Actif & Opérationnel",
      viewProject: "Voir le projet",
      backToList: "Tous les domaines",
    },
    EN: {
      breadcrumbHome: "Home",
      breadcrumbDomains: "Our Action Domains",
      poleBadge: `Strategic Program ${numStr}`,
      targetAudienceTitle: "Target audiences & beneficiaries",
      objectivesTitle: "Key objectives & targeted impacts",
      actionsTitle: "Priority actions & field operations",
      projectsTitle: "Projects associated with this domain",
      projectsDesc: "Concrete initiatives run by APTIC-R and deployed alongside international volunteers on the ground.",
      noProjects: "No specific projects are currently linked to this program in the CMS.",
      resourcesTitle: "Domain documents & downloads",
      otherDomainsTitle: "Explore other action domains",
      frameworkTitle: "Field Mission Framework",
      frameworkBadge: "Immersion & Logistics",
      frameworkHubLabel: "Operational Hub",
      frameworkHubVal: "Agbélouvé Rural FabLab & partner villages",
      frameworkDurationLabel: "Typical Placement",
      frameworkDurationVal: "3 to 12 months (flexible)",
      frameworkProfilesLabel: "Welcomed Profiles",
      frameworkProfilesVal: "Graduates, technical specialists & versatile talents",
      frameworkSupportLabel: "Mentorship & Community",
      frameworkSupportVal: "Dedicated local mentor, secure housing & immersion",
      frameworkContactBtn: "Questions about this program? Contact team →",
      ctaApply: "Apply as volunteer",
      ctaPartner: "Propose a partnership",
      quickFactsTitle: "Key Institutional Facts",
      factCode: "Official identifier",
      factAnchor: "Geographic footprint",
      factStatus: "Operational status",
      factProjectsCount: "Associated projects",
      statusActive: "Active & Operational",
      viewProject: "View project",
      backToList: "All action domains",
    },
    DE: {
      breadcrumbHome: "Startseite",
      breadcrumbDomains: "Unsere Handlungsfelder",
      poleBadge: `Strategischer Schwerpunkt ${numStr}`,
      targetAudienceTitle: "Zielgruppen & Begünstigte",
      objectivesTitle: "Hauptziele & beabsichtigte Wirkung",
      actionsTitle: "Prioritäre Aktionen & Feldeinsätze",
      projectsTitle: "Zugeordnete Projekte",
      projectsDesc: "Konkrete Initiativen von APTIC-R, die gemeinsam mit Freiwilligen vor Ort umgesetzt werden.",
      noProjects: "Diesem Schwerpunkt sind derzeit im CMS keine Projekte direkt zugeordnet.",
      resourcesTitle: "Dokumente & Ressourcen",
      otherDomainsTitle: "Weitere Handlungsfelder entdecken",
      frameworkTitle: "Rahmenbedingungen vor Ort",
      frameworkBadge: "Einsatz & Logistik",
      frameworkHubLabel: "Einsatzbasis",
      frameworkHubVal: "FabLab Agbélouvé & Partnergemeinden",
      frameworkDurationLabel: "Typische Einsatzdauer",
      frameworkDurationVal: "3 bis 12 Monate (flexibel)",
      frameworkProfilesLabel: "Gesuchte Profile",
      frameworkProfilesVal: "Absolventen, Fachkräfte & vielseitige Engagierte",
      frameworkSupportLabel: "Betreuung & Gemeinschaft",
      frameworkSupportVal: "Fester lokaler Mentor, sichere Unterkunft & Begleitung",
      frameworkContactBtn: "Frage zu diesem Schwerpunkt stellen →",
      ctaApply: "Als Freiwilliger bewerben",
      ctaPartner: "Partnerschaft vorschlagen",
      quickFactsTitle: "Institutionelle Eckdaten",
      factCode: "Offizieller Code",
      factAnchor: "Geografischer Anker",
      factStatus: "Einsatzstatus",
      factProjectsCount: "Zugeordnete Projekte",
      statusActive: "Aktiv & Operativ",
      viewProject: "Projekt ansehen",
      backToList: "Alle Handlungsfelder",
    },
  }[lang] || {
    breadcrumbHome: "Accueil",
    breadcrumbDomains: "Nos Domaines d'Action",
    poleBadge: `Pôle Stratégique ${numStr}`,
    targetAudienceTitle: "Publics cibles & bénéficiaires",
    objectivesTitle: "Objectifs clés & impacts recherchés",
    actionsTitle: "Actions prioritaires & déploiements terrain",
    projectsTitle: "Projets associés à ce pôle",
    projectsDesc: "Initiatives concrètes portées par l'APTIC-R et déployées avec les volontaires sur le terrain.",
    noProjects: "Aucun projet spécifique n'est actuellement rattaché à ce pôle dans le CMS.",
    resourcesTitle: "Documents & ressources du pôle",
    otherDomainsTitle: "Explorer les autres domaines d'action",
    frameworkTitle: "Cadre d'intervention terrain",
    frameworkBadge: "Immersion & Logistique",
    frameworkHubLabel: "Base opérationnelle",
    frameworkHubVal: "FabLab Rural d'Agbélouvé & villages associés",
    frameworkDurationLabel: "Durée type des missions",
    frameworkDurationVal: "3 à 12 mois (modulable)",
    frameworkProfilesLabel: "Profils accueillis",
    frameworkProfilesVal: "Jeunes diplômés, spécialistes techniques & profils polyvalents",
    frameworkSupportLabel: "Encadrement & vie locale",
    frameworkSupportVal: "Tuteur local dédié, hébergement sécurisé & immersion communautaire",
    frameworkContactBtn: "Une question sur ce pôle ? Contacter l'équipe →",
    ctaApply: "Postuler comme volontaire",
    ctaPartner: "Proposer un partenariat",
    quickFactsTitle: "Repères institutionnels",
    factCode: "Identifiant officiel",
    factAnchor: "Ancrage géographique",
    factStatus: "Statut d'intervention",
    factProjectsCount: "Projets rattachés",
    statusActive: "Pôle Actif & Opérationnel",
    viewProject: "Voir le projet",
    backToList: "Tous les domaines",
  }

  const subNavItems = [
    { id: "presentation", label: lang === "DE" ? "Präsentation" : lang === "EN" ? "Overview" : "Présentation" },
    ...(objectives.length > 0
      ? [{ id: "objectifs", label: lang === "DE" ? "Ziele" : lang === "EN" ? "Objectives" : "Objectifs" }]
      : []),
    ...(actions.length > 0
      ? [{ id: "actions", label: lang === "DE" ? "Aktionen" : lang === "EN" ? "Actions" : "Actions" }]
      : []),
    ...(projets.length > 0
      ? [{ id: "projets", label: lang === "DE" ? "Projekte" : lang === "EN" ? "Projects" : "Projets" }]
      : []),
    ...(documents.length > 0
      ? [{ id: "ressources", label: lang === "DE" ? "Ressourcen" : lang === "EN" ? "Resources" : "Ressources" }]
      : []),
  ]

  const navBadgeTitle = lang === "DE" ? "HANDLUNGSFELD" : lang === "EN" ? "ACTION DOMAIN" : "DOMAINE"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── 1. Top Focused Header (Remplace le grand header global) ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Left: Logo & Fil d'ariane */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href={`/${lang.toLowerCase()}`}
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
              title="Accueil APTIC-R"
            >
              <Image
                src="/logo-aptic.png"
                alt="Logo APTIC-R"
                width={120}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </Link>

            <span className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />

            <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-xs sm:text-sm text-[#5E6B76] overflow-x-auto no-scrollbar py-1 min-w-0">
              <Link href={`/${lang.toLowerCase()}`} className="hover:text-[#003366] transition-colors whitespace-nowrap shrink-0 hidden md:inline">
                {t.breadcrumbHome}
              </Link>
              <span className="hidden md:inline text-slate-300">/</span>
              <Link href={`/${lang.toLowerCase()}/domaines`} className="hover:text-[#003366] transition-colors whitespace-nowrap shrink-0 font-medium">
                {t.breadcrumbDomains}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#003366] truncate max-w-[160px] sm:max-w-[280px] md:max-w-none">
                {title}
              </span>
            </nav>
          </div>

          {/* Right: Retour à la liste + Sélecteur de langue */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href={`/${lang.toLowerCase()}/domaines`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-[#003366] bg-slate-100 hover:bg-[#003366] hover:text-white transition-all shadow-2xs group cursor-pointer"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span className="hidden sm:inline">{t.backToList}</span>
              <span className="sm:hidden">{lang === "EN" ? "Domains" : lang === "DE" ? "Bereiche" : "Domaines"}</span>
            </Link>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] font-bold">
              {(["FR", "EN", "DE"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleSetLang(l)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    lang === l
                      ? "bg-[#003366] text-white shadow-2xs"
                      : "text-slate-600 hover:text-[#003366]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── 2. Hero Section (#F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-200/80" style={{ backgroundColor: BG_HERO }}>
          <div className="max-w-[1260px] mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1 max-w-3xl">
                
                {/* Badge Pôle + Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366] flex items-center justify-center shrink-0 shadow-2xs">
                    <DomainCharterIcon code={domaine.code} size={22} color="#003366" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#28A745] bg-[#28A745]/10 px-3 py-1 rounded-full">
                    {t.poleBadge}
                  </span>
                </div>

                {/* Main Domain Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight leading-[1.18] mb-3">
                  {title}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                  <p className="text-lg sm:text-xl font-semibold text-[#007BFF] mb-5">
                    {subtitle}
                  </p>
                )}

                {/* Presentation Paragraph */}
                <p className="text-base sm:text-lg text-[#5E6B76] leading-relaxed mb-8">
                  {desc}
                </p>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    href={`/${lang.toLowerCase()}/volontariat/postuler?domaine=${encodeURIComponent(domaine.code)}`}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-[#003366] text-white hover:bg-[#002244] shadow-xs transition-all inline-flex items-center gap-2 group"
                  >
                    <span>{t.ctaApply}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  <Link
                    href={getPageUrl("partner", lang)}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-[#007BFF] text-white hover:bg-[#0060c8] shadow-xs transition-colors"
                  >
                    {t.ctaPartner}
                  </Link>
                </div>

              </div>

              {/* Pale Big Number Badge for desktop */}
              <div className="hidden lg:flex flex-col items-end justify-start">
                <span className="text-[100px] font-black font-mono text-[#DCE5EC] leading-none select-none">
                  {numStr}
                </span>
                <span className="text-xs font-bold text-[#5E6B76] tracking-wider uppercase mt-1">
                  APTIC-R Pôle {numStr}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Main Detail Grid (Content + Sticky Sidebar) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
          <div className="max-w-[1260px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              
              {/* Left Column: Detailed Specifications (8 cols) */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* 1. Target Audience */}
                {targetAudience && (
                  <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-[#F7F8FA]/60 shadow-2xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#007BFF]/10 text-[#007BFF] flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#003366]">
                        {t.targetAudienceTitle}
                      </h2>
                    </div>
                    <p className="text-base text-[#5E6B76] leading-relaxed">
                      {targetAudience}
                    </p>
                  </div>
                )}

                {/* 2. Key Objectives */}
                {objectives.length > 0 && (
                  <div id="objectifs" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28A745]"></span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366]">
                        {t.objectivesTitle}
                      </h2>
                    </div>
                    <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        {objectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#28A745]/15 text-[#28A745] flex items-center justify-center shrink-0 mt-0.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <p className="text-sm sm:text-base text-[#2C3E50] leading-relaxed font-medium">
                              {obj}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Field Actions */}
                {actions.length > 0 && (
                  <div id="actions" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#007BFF]"></span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366]">
                        {t.actionsTitle}
                      </h2>
                    </div>
                    <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <div className="divide-y divide-slate-100">
                        {actions.map((act, i) => (
                          <div key={i} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                            <div className="w-7 h-7 rounded-lg bg-[#007BFF]/10 text-[#007BFF] flex items-center justify-center shrink-0 font-extrabold text-xs">
                              {i < 9 ? `0${i + 1}` : i + 1}
                            </div>
                            <p className="text-sm sm:text-base text-[#2C3E50] leading-relaxed font-medium">
                              {act}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Associated Projects */}
                <div id="projets" className="scroll-mt-24">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#003366]"></span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366]">
                        {t.projectsTitle}
                      </h2>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#007BFF] bg-[#007BFF]/10 px-2.5 py-1 rounded-full">
                      {projets.length} {projets.length > 1 ? (lang === "EN" ? "projects" : lang === "DE" ? "Projekte" : "projets") : (lang === "EN" ? "project" : lang === "DE" ? "Projekt" : "projet")}
                    </span>
                  </div>
                  <p className="text-sm text-[#5E6B76] mb-6">
                    {t.projectsDesc}
                  </p>

                  {projets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projets.map((p: any) => {
                        const pTitle = lang === "EN" ? p.titleEn || p.titleFr : lang === "DE" ? p.titleDe || p.titleFr : p.titleFr
                        const pSummary = lang === "EN" ? p.summaryEn || p.summaryFr : lang === "DE" ? p.summaryDe || p.summaryFr : p.summaryFr
                        const pImage = p.featuredImage || photoSrc

                        return (
                          <div
                            key={p.id}
                            className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-[#007BFF]/50 hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                              <img
                                src={pImage}
                                alt={pTitle}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#003366]/90 text-white backdrop-blur-xs">
                                  {p.location || "Togo"}
                                </span>
                              </div>
                              <div className="absolute top-3 right-3">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  p.status === "COMPLETED" ? "bg-slate-900/80 text-white" : "bg-[#28A745] text-white"
                                }`}>
                                  {p.status === "COMPLETED"
                                    ? (lang === "EN" ? "Completed" : lang === "DE" ? "Abgeschlossen" : "Clôturé")
                                    : (lang === "EN" ? "Active" : lang === "DE" ? "Aktiv" : "En cours")}
                                </span>
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="text-base font-bold text-[#003366] line-clamp-2 mb-2 group-hover:text-[#007BFF] transition-colors">
                                  {pTitle}
                                </h3>
                                {pSummary && (
                                  <p className="text-xs sm:text-sm text-[#5E6B76] line-clamp-3 leading-relaxed">
                                    {pSummary}
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                  href={`/${lang.toLowerCase()}/projets#${p.slug}`}
                                  className="text-xs font-bold text-[#007BFF] hover:text-[#003366] inline-flex items-center gap-1 transition-colors"
                                >
                                  <span>{t.viewProject}</span>
                                  <span>→</span>
                                </Link>
                                <span className="text-[11px] font-medium text-slate-400">
                                  APTIC-R
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center bg-slate-50/50">
                      <p className="text-sm text-[#5E6B76]">{t.noProjects}</p>
                      <Link
                        href={`/${lang.toLowerCase()}/projets`}
                        className="inline-flex items-center text-xs font-bold text-[#007BFF] hover:underline mt-3"
                      >
                        {lang === "EN" ? "Browse general project catalog →" : lang === "DE" ? "Alle Projekte durchsuchen →" : "Consulter le catalogue général des projets →"}
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. Resources / Downloads (if available) */}
                {Array.isArray(domaine.ressources) && domaine.ressources.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#007BFF]"></span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366]">
                        {t.resourcesTitle}
                      </h2>
                    </div>
                    <div className="space-y-2.5">
                      {domaine.ressources.map((r: any) => {
                        const rTitle = lang === "EN" ? r.titleEn || r.titleFr : lang === "DE" ? r.titleDe || r.titleFr : r.titleFr
                        return (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-[#007BFF]/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#003366]/5 text-[#003366] flex items-center justify-center shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-[#003366]">{rTitle}</h4>
                                <span className="text-xs text-[#5E6B76]">{r.type} • {r.year}</span>
                              </div>
                            </div>
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#007BFF] bg-[#007BFF]/10 hover:bg-[#007BFF]/20 transition-colors"
                            >
                              Télécharger
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Sticky Visual & Technical Card (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Visual Image Card */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img
                      src={photoSrc}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/90 via-[#003366]/20 to-transparent flex flex-col justify-end p-5">
                      <span className="text-[11px] uppercase font-bold tracking-widest text-[#28A745] mb-1">
                        {domaine.imageTag || "Ancrage Terrain"}
                      </span>
                      <p className="text-white text-xs font-medium leading-snug">
                        {photoCaption}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Institutional Facts */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-[#F7F8FA] space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#003366] pb-2 border-b border-slate-200">
                    {t.quickFactsTitle}
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#5E6B76]">{t.factCode}</span>
                      <span className="font-mono font-bold text-[#003366] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {domaine.code}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#5E6B76]">{t.factAnchor}</span>
                      <span className="font-semibold text-[#003366]">Agbélouvé / Maritime, Togo</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#5E6B76]">{t.factProjectsCount}</span>
                      <span className="font-bold text-[#007BFF]">{projets.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#5E6B76]">{t.factStatus}</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#28A745]">
                        <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
                        <span>{t.statusActive}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cadre d'intervention & Immersion terrain (Informations pratiques terrain) */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-[#F7F8FA] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#28A745] bg-[#28A745]/10 px-2.5 py-0.5 rounded-full">
                      {t.frameworkBadge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      APTIC-R Togo
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#003366]">
                    {t.frameworkTitle}
                  </h3>

                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 text-xs block font-medium">
                        {t.frameworkHubLabel}
                      </span>
                      <span className="font-semibold text-[#1A2B3C] text-xs sm:text-sm leading-snug block mt-0.5">
                        {t.frameworkHubVal}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block font-medium">
                        {t.frameworkDurationLabel}
                      </span>
                      <span className="font-semibold text-[#003366] text-xs sm:text-sm leading-snug block mt-0.5">
                        {t.frameworkDurationVal}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block font-medium">
                        {t.frameworkProfilesLabel}
                      </span>
                      <span className="text-slate-600 text-xs leading-relaxed block mt-0.5">
                        {t.frameworkProfilesVal}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block font-medium">
                        {t.frameworkSupportLabel}
                      </span>
                      <span className="text-slate-600 text-xs leading-relaxed block mt-0.5">
                        {t.frameworkSupportVal}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <Link
                      href={`/${lang.toLowerCase()}/contact?sujet=${encodeURIComponent(`Information Pôle ${title}`)}`}
                      className="text-xs font-bold text-[#007BFF] hover:text-[#003366] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>{t.frameworkContactBtn}</span>
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── 4. Cross-Navigation / Switcher (Other 5 Domains) ── */}
        {otherDomains.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#F7F8FA] border-t border-slate-200">
            <div className="max-w-[1260px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#28A745] block mb-1">
                    Panorama Institutionnel
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366]">
                    {t.otherDomainsTitle}
                  </h2>
                </div>
                <Link
                  href={`/${lang.toLowerCase()}/domaines`}
                  className="hidden sm:inline-flex items-center text-xs font-bold text-[#007BFF] hover:text-[#003366] transition-colors"
                >
                  {t.backToList}
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherDomains.map((other, idx) => {
                  const oTitle =
                    lang === "EN"
                      ? other.nameEn || other.nameFr
                      : lang === "DE"
                      ? other.nameDe || other.nameFr
                      : other.nameFr
                  const oSubtitle =
                    lang === "EN"
                      ? other.subtitleEn || other.subtitleFr
                      : lang === "DE"
                      ? other.subtitleDe || other.subtitleFr
                      : other.subtitleFr
                  const oNum = other.order ? (other.order < 10 ? `0${other.order}` : `${other.order}`) : `0${idx + 1}`

                  return (
                    <Link
                      key={other.id}
                      href={`/${lang.toLowerCase()}/domaines/${other.slug || other.id}`}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#007BFF]/50 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#003366]/10 text-[#003366] flex items-center justify-center shrink-0">
                            <DomainCharterIcon code={other.code} size={18} color="#003366" />
                          </div>
                          <span className="font-mono text-sm font-bold text-slate-300 group-hover:text-[#007BFF] transition-colors">
                            {oNum}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#003366] group-hover:text-[#007BFF] transition-colors mb-1 line-clamp-1">
                          {oTitle}
                        </h3>
                        {oSubtitle && (
                          <p className="text-xs text-[#5E6B76] line-clamp-2 leading-relaxed">
                            {oSubtitle}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#007BFF]">
                        <span>{lang === "EN" ? "Discover domain" : lang === "DE" ? "Bereich entdecken" : "Découvrir le pôle"}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
