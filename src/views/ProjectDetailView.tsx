"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import Footer from "@/components/Footer"
import { DomainCharterIcon } from "@/components/DomainIcons"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Download,
  FileText,
  Layers,
  ChevronRight,
  Share2,
  Check,
  X,
  Building2,
  Mail,
  ShieldCheck,
} from "lucide-react"

interface ProjectDetailViewProps {
  project: any
  lang: Language
}

function parseList(raw: any): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch {
        // Continue to newline fallback
      }
    }
    return trimmed
      .split("\n")
      .map((s) => s.replace(/^[-*•●\d.]+\s*/, "").trim())
      .filter((s) => s.length > 0)
  }
  return []
}

function formatPeriod(
  startDate?: Date | string | null,
  endDate?: Date | string | null,
  lang: Language = "FR"
): string {
  if (!startDate) return ""
  const start = new Date(startDate)
  const isEn = lang === "EN"
  const isDe = lang === "DE"
  const loc = isEn ? "en-US" : isDe ? "de-DE" : "fr-FR"

  const startMonth = start.toLocaleDateString(loc, { month: "short", year: "numeric" })
  if (!endDate) {
    return isEn ? `Since ${startMonth}` : isDe ? `Seit ${startMonth}` : `Depuis ${startMonth}`
  }
  const end = new Date(endDate)
  const endMonth = end.toLocaleDateString(loc, { month: "short", year: "numeric" })
  return `${startMonth} - ${endMonth}`
}

const I18N_PROJECT: Record<string, any> = {
  FR: {
    breadcrumbHome: "Accueil",
    breadcrumbProjects: "Projets de terrain",
    badgeFlagship: "Projet Phare",
    statusInProgress: "En cours",
    statusCompleted: "Clôturé",
    statusPlanned: "En préparation",
    locationLabel: "Zone d'intervention",
    periodLabel: "Calendrier",
    beneficiariesLabel: "Bénéficiaires directs",
    budgetLabel: "Budget d'action",
    partnersLabel: "Partenaires associés",
    volunteersCountLabel: "Volontaires mobilisés",
    share: "Partager",
    copied: "Lien copié !",
    backToCatalog: "Tous les projets",
    aboutTitle: "Présentation & Contexte du Projet",
    aboutEyebrow: "Contexte territorial",
    objectivesTitle: "Objectifs Opérationnels & Impacts Visés",
    objectivesEyebrow: "Objectifs du programme",
    actionsTitle: "Actions & Déploiements sur le Terrain",
    actionsEyebrow: "Mise en œuvre concrète",
    resultsTitle: "Résultats Obtenus & Indicateurs de Suivi",
    resultsEyebrow: "Indicateurs validés",
    galleryTitle: "Galerie & Documentation Photographique",
    galleryEyebrow: "Aperçu de terrain",
    resourcesTitle: "Ressources Officielles & Fiches Téléchargeables",
    resourcesEyebrow: "Documents & Bilans",
    downloadBtn: "Télécharger",
    domainSectionTitle: "Domaine d'intervention rattaché",
    domainSectionEyebrow: "Pôle Stratégique APTIC-R",
    domainExploreBtn: "Découvrir ce domaine d'action",
    ctaTitle: "Participez à ce projet ou soutenez nos actions de terrain",
    ctaSubtitle:
      "L'APTIC-R accueille des volontaires internationaux et coopère avec des organisations pour amplifier l'impact de chaque initiative locale.",
    ctaPartner: "Proposer un partenariat",
    ctaApply: "Candidater comme volontaire",
    ctaAllProjects: "Explorer tous les projets de l'APTIC-R →",
    frameworkEyebrow: "Gouvernance du projet",
    frameworkTitle: "Cadre d'action & encadrement local",
    frameworkOperatorLabel: "Organisation porteuse",
    frameworkOperatorVal: "Association APTIC-R • Agbélouvé",
    frameworkSupervisionLabel: "Coordination & mentorat",
    frameworkSupervisionVal: "Chef de projet dédié & tuteurs locaux",
    frameworkMonitoringLabel: "Suivi & évaluation",
    frameworkMonitoringVal: "Indicateurs d'impact validés & rapports de mission",
    frameworkContactBtn: "Une question sur ce projet ? Contacter l'équipe →",
    institutionalSeal: "Initiative portée par l'Association APTIC-R • République Togolaise",
  },
  EN: {
    breadcrumbHome: "Home",
    breadcrumbProjects: "Field Projects",
    badgeFlagship: "Flagship Initiative",
    statusInProgress: "In progress",
    statusCompleted: "Completed",
    statusPlanned: "Planned",
    locationLabel: "Operational area",
    periodLabel: "Timeline",
    beneficiariesLabel: "Direct beneficiaries",
    budgetLabel: "Budget",
    partnersLabel: "Key partners",
    volunteersCountLabel: "Mobilized volunteers",
    share: "Share",
    copied: "Link copied!",
    backToCatalog: "All projects",
    aboutTitle: "Project Overview & Background",
    aboutEyebrow: "Territorial Context",
    objectivesTitle: "Operational Objectives & Targeted Impacts",
    objectivesEyebrow: "Program goals",
    actionsTitle: "Field Actions & Concrete Deployments",
    actionsEyebrow: "Implementation",
    resultsTitle: "Achieved Results & Key Indicators",
    resultsEyebrow: "Validated indicators",
    galleryTitle: "Field Gallery & Photo Documentation",
    galleryEyebrow: "On-site views",
    resourcesTitle: "Official Resources & Downloadable Files",
    resourcesEyebrow: "Reports & Datasheets",
    downloadBtn: "Download",
    domainSectionTitle: "Associated action domain",
    domainSectionEyebrow: "APTIC-R Strategic Pillar",
    domainExploreBtn: "Discover this action domain",
    ctaTitle: "Join this project or support our grassroots work",
    ctaSubtitle:
      "APTIC-R welcomes international volunteers and collaborates with partner institutions to maximize the local impact of every initiative.",
    ctaPartner: "Propose a partnership",
    ctaApply: "Apply as a volunteer",
    ctaAllProjects: "Explore all APTIC-R projects →",
    frameworkEyebrow: "Project Governance",
    frameworkTitle: "Mission Framework & Local Supervision",
    frameworkOperatorLabel: "Lead Organization",
    frameworkOperatorVal: "APTIC-R Association • Agbélouvé",
    frameworkSupervisionLabel: "Mentorship & Lead",
    frameworkSupervisionVal: "Dedicated project lead & local mentors",
    frameworkMonitoringLabel: "Impact & Evaluation",
    frameworkMonitoringVal: "Verified impact metrics & mission debriefs",
    frameworkContactBtn: "Questions about this project? Contact our team →",
    institutionalSeal: "Initiative led by APTIC-R Association • Republic of Togo",
  },
  DE: {
    breadcrumbHome: "Startseite",
    breadcrumbProjects: "Feldprojekte",
    badgeFlagship: "Leuchtturmprojekt",
    statusInProgress: "Laufend",
    statusCompleted: "Abgeschlossen",
    statusPlanned: "In Planung",
    locationLabel: "Einsatzregion",
    periodLabel: "Zeitplan",
    beneficiariesLabel: "Direkte Begünstigte",
    budgetLabel: "Projektbudget",
    partnersLabel: "Beteiligte Partner",
    volunteersCountLabel: "Freiwillige vor Ort",
    share: "Teilen",
    copied: "Link kopiert!",
    backToCatalog: "Alle Projekte",
    aboutTitle: "Projektübersicht & Hintergrund",
    aboutEyebrow: "Regionaler Kontext",
    objectivesTitle: "Operationelle Ziele & Wirkungsbereiche",
    objectivesEyebrow: "Programmziele",
    actionsTitle: "Maßnahmen vor Ort",
    actionsEyebrow: "Konkrete Umsetzung",
    resultsTitle: "Ergebnisse & Wirkung",
    resultsEyebrow: "Validierte Indikatoren",
    galleryTitle: "Fotogalerie & Dokumentation",
    galleryEyebrow: "Einblicke vor Ort",
    resourcesTitle: "Offizielle Ressourcen & Dokumente",
    resourcesEyebrow: "Datenblätter & Berichte",
    downloadBtn: "Herunterladen",
    domainSectionTitle: "Zugeordnetes Handlungsfeld",
    domainSectionEyebrow: "APTIC-R Programmsäule",
    domainExploreBtn: "Dieses Handlungsfeld entdecken",
    ctaTitle: "Beteiligen Sie sich an diesem Projekt oder unterstützen Sie unsere Arbeit",
    ctaSubtitle:
      "APTIC-R geht institutionelle Partnerschaften ein und empfängt internationale Freiwillige, um die Wirkung jeder Initiative vor Ort zu stärken.",
    ctaPartner: "Partnerschaft vorschlagen",
    ctaApply: "Als Freiwilliger bewerben",
    ctaAllProjects: "Alle APTIC-R Projekte entdecken →",
    frameworkEyebrow: "Projekt-Governance",
    frameworkTitle: "Einsatzrahmen & Vor-Ort-Betreuung",
    frameworkOperatorLabel: "Trägerorganisation",
    frameworkOperatorVal: "Verein APTIC-R • Agbélouvé",
    frameworkSupervisionLabel: "Betreuung & Mentoring",
    frameworkSupervisionVal: "Projektkoordinator & lokale Mentoren",
    frameworkMonitoringLabel: "Wirkung & Evaluation",
    frameworkMonitoringVal: "Geprüfte Indikatoren & Wirkungsberichte",
    frameworkContactBtn: "Fragen zu diesem Projekt? Team kontaktieren →",
    institutionalSeal: "Initiative des Vereins APTIC-R • Republik Togo",
  },
}

export default function ProjectDetailView({ project, lang }: ProjectDetailViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null)

  const t = I18N_PROJECT[lang] || I18N_PROJECT.FR

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // Localized texts
  const title =
    lang === "EN"
      ? project.titleEn || project.titleFr
      : lang === "DE"
      ? project.titleDe || project.titleFr
      : project.titleFr

  const summary =
    lang === "EN"
      ? project.summaryEn || project.summaryFr
      : lang === "DE"
      ? project.summaryDe || project.summaryFr
      : project.summaryFr

  const description =
    lang === "EN"
      ? project.descriptionEn || project.descriptionFr
      : lang === "DE"
      ? project.descriptionDe || project.descriptionFr
      : project.descriptionFr

  // Parse structured objectives, actions, results
  const rawObjectives =
    lang === "EN"
      ? project.objectivesEn || project.objectivesFr
      : lang === "DE"
      ? project.objectivesDe || project.objectivesFr
      : project.objectivesFr

  const rawActions =
    lang === "EN"
      ? project.actionsEn || project.actionsFr
      : lang === "DE"
      ? project.actionsDe || project.actionsFr
      : project.actionsFr

  const rawResults =
    lang === "EN"
      ? project.resultsEn || project.resultsFr
      : lang === "DE"
      ? project.resultsDe || project.resultsFr
      : project.resultsFr

  const objectives = parseList(rawObjectives)
  const actions = parseList(rawActions)
  const results = parseList(rawResults)

  // Parent Domaine
  const domaine = project.domaine
  const domaineName = domaine
    ? lang === "EN"
      ? domaine.nameEn || domaine.nameFr
      : lang === "DE"
      ? domaine.nameDe || domaine.nameFr
      : domaine.nameFr
    : null

  const domaineSubtitle = domaine
    ? lang === "EN"
      ? domaine.subtitleEn || domaine.subtitleFr
      : lang === "DE"
      ? domaine.subtitleDe || domaine.subtitleFr
      : domaine.subtitleFr
    : null

  // Timeline / Period
  const periodText = formatPeriod(project.startDate, project.endDate, lang)

  // Operational status styling
  const statusMeta = {
    IN_PROGRESS: {
      label: t.statusInProgress,
      color: "bg-[#28A745] text-white",
      dot: "bg-emerald-400",
      border: "border-emerald-200",
    },
    COMPLETED: {
      label: t.statusCompleted,
      color: "bg-slate-700 text-white",
      dot: "bg-slate-400",
      border: "border-slate-300",
    },
    PLANNED: {
      label: t.statusPlanned,
      color: "bg-[#007BFF] text-white",
      dot: "bg-blue-300",
      border: "border-blue-200",
    },
  }[project.status as string] || {
    label: t.statusInProgress,
    color: "bg-[#28A745] text-white",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  }

  // Gallery items from relation `medias` or fallback `gallery` JSON
  let galleryItems: { url: string; caption?: string }[] = []
  if (Array.isArray(project.medias) && project.medias.length > 0) {
    galleryItems = project.medias.map((m: any) => ({
      url: m.url,
      caption: lang === "EN" ? m.captionEn || m.captionFr : lang === "DE" ? m.captionDe || m.captionFr : m.captionFr,
    }))
  } else if (project.gallery) {
    try {
      const parsed = JSON.parse(project.gallery)
      if (Array.isArray(parsed)) {
        galleryItems = parsed.map((item: any) =>
          typeof item === "string" ? { url: item } : { url: item.url, caption: item.caption }
        )
      }
    } catch {
      // Ignored
    }
  }

  // Resources from relation `ressources`
  const resources: any[] = Array.isArray(project.ressources) ? project.ressources : []

  // Sub-navigation items for the project page
  const subNavItems = [
    { id: "about", label: lang === "DE" ? "Präsentation" : lang === "EN" ? "Overview" : "Présentation" },
    ...(objectives.length > 0
      ? [{ id: "objectives", label: lang === "DE" ? "Ziele" : lang === "EN" ? "Objectives" : "Objectifs" }]
      : []),
    ...(actions.length > 0
      ? [{ id: "actions", label: lang === "DE" ? "Aktionen" : lang === "EN" ? "Actions" : "Actions" }]
      : []),
    ...(results.length > 0
      ? [{ id: "results", label: lang === "DE" ? "Ergebnisse" : lang === "EN" ? "Results" : "Résultats" }]
      : []),
    ...(galleryItems.length > 0
      ? [{ id: "gallery", label: lang === "DE" ? "Galerie" : lang === "EN" ? "Gallery" : "Galerie" }]
      : []),
    ...(resources.length > 0
      ? [{ id: "resources", label: lang === "DE" ? "Ressourcen" : lang === "EN" ? "Resources" : "Ressources" }]
      : []),
  ]

  const navBadgeTitle = lang === "DE" ? "PROJEKT" : lang === "EN" ? "PROJECT" : "PROJET"

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#007BFF]/10 selection:text-[#003366]">
      {/* ── 01. STICKY INSTITUTIONAL HEADER BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Left: Logo & Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href={`/${lang.toLowerCase()}`}
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
              title="Accueil APTIC-R"
            >
              <Image
                src="/logo-aptic-emblem.png"
                alt="Logo APTIC-R"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform"
                priority
              />
              <span className="font-extrabold text-[#003366] text-sm sm:text-base tracking-tight hidden sm:inline">
                APTIC-R
              </span>
            </Link>

            <span className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />

            <nav
              aria-label="Fil d'ariane"
              className="flex items-center gap-2 text-xs sm:text-sm text-[#5E6B76] overflow-x-auto no-scrollbar py-1 min-w-0"
            >
              <Link
                href={`/${lang.toLowerCase()}`}
                className="hover:text-[#003366] transition-colors whitespace-nowrap shrink-0 hidden md:inline"
              >
                {t.breadcrumbHome}
              </Link>
              <span className="hidden md:inline text-slate-300">/</span>
              <Link
                href={`/${lang.toLowerCase()}/projets`}
                className="hover:text-[#003366] transition-colors whitespace-nowrap shrink-0 font-medium"
              >
                {t.breadcrumbProjects}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#003366] truncate max-w-[180px] sm:max-w-[280px] md:max-w-[420px]">
                {title}
              </span>
            </nav>
          </div>

          {/* Right: Actions & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#003366] bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
              title={t.share}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#28A745]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.share}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs font-semibold">
              {(["FR", "EN", "DE"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => handleSetLang(l)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    lang === l
                      ? "bg-white text-[#003366] shadow-2xs font-bold"
                      : "text-slate-500 hover:text-[#003366]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Back to catalog button */}
            <Link
              href={`/${lang.toLowerCase()}/projets`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-2xs transition-all active:scale-98"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t.backToCatalog}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── 01. EN-TÊTE INSTITUTIONNEL DU PROJET (HERO) ── */}
        <section className="bg-[#F7F8FA] border-b border-slate-200/80 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badges & Meta top */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">
              {domaine && (
                <Link
                  href={`/${lang.toLowerCase()}/domaines/${domaine.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003366]/10 text-[#003366] hover:bg-[#003366] hover:text-white transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#007BFF]" />
                  <span>{domaineName}</span>
                </Link>
              )}

              {project.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  {t.badgeFlagship}
                </span>
              )}

              {/* Statut opérationnel terrain */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusMeta.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>

            {/* Titre Principal H1 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#003366] leading-[1.15] tracking-tight mb-4 max-w-4xl">
              {title}
            </h1>

            {/* Phrase courte de synthèse */}
            {summary && (
              <p className="text-lg sm:text-xl text-[#5E6B76] leading-relaxed max-w-3xl mb-8 font-medium">
                {summary}
              </p>
            )}

            {/* Image Principale (Widescreen Full-Bleed Card) */}
            <div className="relative w-full aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-200 mb-8">
              <img
                src={project.featuredImage || "/photo-projet-phare.jpg"}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Badge discret sur l'image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium drop-shadow-md">
                <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-[#007BFF]" />
                  {project.location}, {project.country || "Togo"}
                </span>
                {periodText && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {periodText}
                  </span>
                )}
              </div>
            </div>

            {/* Métadonnées Institutionnelles Clés (Design unifié et sobre) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              {/* 1. Lieu */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#003366] border border-slate-200/60 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.locationLabel}
                  </div>
                  <div className="text-sm font-extrabold text-[#003366] mt-0.5">
                    {project.location}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {project.country || "Togo"}
                  </div>
                </div>
              </div>

              {/* 2. Période */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#003366] border border-slate-200/60 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.periodLabel}
                  </div>
                  <div className="text-sm font-extrabold text-[#003366] mt-0.5">
                    {periodText || "2024 - 2026"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {statusMeta.label}
                  </div>
                </div>
              </div>

              {/* 3. Bénéficiaires certifiés */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#003366] border border-slate-200/60 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.beneficiariesLabel}
                  </div>
                  <div className="text-sm font-extrabold text-[#003366] mt-0.5">
                    {project.beneficiaries ? project.beneficiaries : "Groupements communautaires"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Ancrage local certifié
                  </div>
                </div>
              </div>

              {/* 4. Domaine de rattachement */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#003366] border border-slate-200/60 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Pôle APTIC-R
                  </div>
                  <div className="text-sm font-extrabold text-[#003366] mt-0.5 truncate max-w-[180px]">
                    {domaineName || "Général"}
                  </div>
                  {domaine && (
                    <Link
                      href={`/${lang.toLowerCase()}/domaines/${domaine.slug}`}
                      className="text-xs text-[#003366] hover:underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Voir le pôle <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CORPS DE PAGE : CONTENU ÉDITORIAL & DÉPLOIEMENT ── */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Colonne Principale (8 cols) */}
            <div className="lg:col-span-8 space-y-12 sm:space-y-16">
              {/* ── 02. PRÉSENTATION DU PROJET (À PROPOS) ── */}
              <section id="about" className="scroll-mt-24">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#007BFF] mb-2">
                  <span className="w-6 h-0.5 bg-[#007BFF]" />
                  <span>{t.aboutEyebrow}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-6">
                  {t.aboutTitle}
                </h2>

                <div className="prose prose-slate max-w-none text-[#5E6B76] text-base sm:text-lg leading-relaxed space-y-4">
                  {description ? (
                    description.split("\n\n").map((para: string, idx: number) => (
                      <p key={idx} className="whitespace-pre-line">
                        {para.trim()}
                      </p>
                    ))
                  ) : (
                    <p>{summary}</p>
                  )}
                </div>
              </section>

              {/* ── 03. OBJECTIFS ── */}
              {objectives.length > 0 && (
                <section id="objectives" className="scroll-mt-24 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#28A745] mb-2">
                    <span className="w-6 h-0.5 bg-[#28A745]" />
                    <span>{t.objectivesEyebrow}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-6">
                    {t.objectivesTitle}
                  </h2>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {objectives.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#28A745] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-[#003366] leading-snug">
                          {obj}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 04. ACTIONS SUR LE TERRAIN (MISE EN ŒUVRE) ── */}
              {actions.length > 0 && (
                <section id="actions" className="scroll-mt-24 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#007BFF] mb-2">
                    <span className="w-6 h-0.5 bg-[#007BFF]" />
                    <span>{t.actionsEyebrow}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-6">
                    {t.actionsTitle}
                  </h2>

                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 sm:pl-8 space-y-6">
                    {actions.map((act, i) => (
                      <div key={i} className="relative group">
                        {/* Numéro jalonneur 01, 02... */}
                        <div className="absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[#007BFF] text-[#007BFF] font-extrabold text-xs flex items-center justify-center shadow-xs group-hover:bg-[#007BFF] group-hover:text-white transition-colors">
                          {i < 9 ? `0${i + 1}` : `${i + 1}`}
                        </div>
                        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
                          <p className="text-sm sm:text-base font-semibold text-[#003366] leading-relaxed">
                            {act}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 05. RÉSULTATS & IMPACT (INDICATEURS VALIDÉS) ── */}
              {results.length > 0 && (
                <section id="results" className="scroll-mt-24 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366] mb-2">
                    <span className="w-6 h-0.5 bg-[#003366]" />
                    <span>{t.resultsEyebrow}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-6">
                    {t.resultsTitle}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((res, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex items-start gap-3"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28A745] shrink-0 mt-1.5" />
                        <div>
                          <p className="text-sm sm:text-base font-bold text-[#003366] leading-snug">
                            {res}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 06. GALERIE DE TERRAIN (PHOTOS) ── */}
              {galleryItems.length > 0 && (
                <section id="gallery" className="scroll-mt-24 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#007BFF] mb-2">
                    <span className="w-6 h-0.5 bg-[#007BFF]" />
                    <span>{t.galleryEyebrow}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-6">
                    {t.galleryTitle}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {galleryItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer"
                        onClick={() => setActiveImageModal(item.url)}
                      >
                        <img
                          src={item.url}
                          alt={item.caption || `${title} - photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.caption && (
                          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-black/60 text-white text-[11px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                            {item.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 07. RESSOURCES & DOCUMENTS TÉLÉCHARGEABLES ── */}
              {resources.length > 0 && (
                <section id="resources" className="scroll-mt-24 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366] mb-2">
                    <span className="w-6 h-0.5 bg-[#003366]" />
                    <span>{t.resourcesEyebrow}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-6">
                    {t.resourcesTitle}
                  </h2>

                  <div className="space-y-3">
                    {resources.map((res: any) => {
                      const resTitle =
                        lang === "EN"
                          ? res.titleEn || res.titleFr
                          : lang === "DE"
                          ? res.titleDe || res.titleFr
                          : res.titleFr

                      const resDesc =
                        lang === "EN"
                          ? res.descriptionEn || res.descriptionFr
                          : lang === "DE"
                          ? res.descriptionDe || res.descriptionFr
                          : res.descriptionFr

                      return (
                        <div
                          key={res.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#007BFF] flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm sm:text-base text-[#003366] truncate">
                                {resTitle}
                              </h3>
                              {resDesc && (
                                <p className="text-xs text-[#5E6B76] line-clamp-2 mt-0.5">
                                  {resDesc}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-1">
                                {res.format && <span className="uppercase">{res.format}</span>}
                                {res.fileSize && <span>• {res.fileSize}</span>}
                                {res.year && <span>• {res.year}</span>}
                              </div>
                            </div>
                          </div>

                          <a
                            href={res.fileUrl || `/api/documents/download?id=${res.id}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#007BFF] hover:bg-[#003366] transition-colors shrink-0 active:scale-98"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t.downloadBtn}</span>
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Colonne Latérale (4 cols) : Rattachement Domaine & Actions Directes */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* ── 08. DOMAINE D'INTERVENTION RATTACHÉ ── */}
              {domaine && (
                <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#007BFF] mb-3">
                    <span className="w-4 h-0.5 bg-[#007BFF]" />
                    <span>{t.domainSectionEyebrow}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#003366] border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <DomainCharterIcon code={domaine.code} size={22} color="#003366" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#003366] leading-tight">
                        {domaineName}
                      </h3>
                      {domaine.code && (
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          Pôle {domaine.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {domaineSubtitle && (
                    <p className="text-xs text-[#5E6B76] leading-relaxed mb-5 font-medium">
                      {domaineSubtitle}
                    </p>
                  )}

                  <Link
                    href={`/${lang.toLowerCase()}/domaines/${domaine.slug}`}
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold text-[#003366] bg-white hover:bg-[#003366] hover:text-white border border-slate-200/80 shadow-2xs transition-all group"
                  >
                    <span>{t.domainExploreBtn}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              )}

              {/* Encadré Repères opérationnels & Cadre d'intervention */}
              <div className="p-6 rounded-2xl bg-[#F7F8FA] border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366]">
                  <ShieldCheck className="w-4 h-4 text-[#28A745]" />
                  <span>{t.frameworkEyebrow}</span>
                </div>

                <h3 className="font-extrabold text-base text-[#003366] leading-snug">
                  {t.frameworkTitle}
                </h3>

                <div className="space-y-3 pt-1 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-[#007BFF] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-700">{t.frameworkOperatorLabel}</div>
                      <div className="text-[#5E6B76]">{t.frameworkOperatorVal}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-[#28A745] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-700">{t.frameworkSupervisionLabel}</div>
                      <div className="text-[#5E6B76]">{t.frameworkSupervisionVal}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-700">{t.frameworkMonitoringLabel}</div>
                      <div className="text-[#5E6B76]">{t.frameworkMonitoringVal}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80">
                  <Link
                    href={getPageUrl("contact", lang)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007BFF] hover:text-[#003366] transition-colors"
                  >
                    <span>{t.frameworkContactBtn}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 09. SECTION CTA INSTITUTIONNELLE EN PLEINE LARGEUR ── */}
        <section className="bg-[#F7F8FA] border-t border-slate-200/80 py-12 sm:py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#007BFF] mb-4">
                Solidarité & Territoires
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-3">
                {t.ctaTitle}
              </h2>

              <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed max-w-2xl mx-auto mb-8 font-medium">
                {t.ctaSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link
                  href={getPageUrl("partner", lang)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#007BFF] hover:bg-[#003366] shadow-sm transition-all"
                >
                  {t.ctaPartner}
                </Link>

                <Link
                  href={getPageUrl("apply", lang)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#28A745] hover:bg-emerald-600 shadow-sm transition-all"
                >
                  {t.ctaApply}
                </Link>
              </div>

              <div className="mt-5">
                <Link
                  href={`/${lang.toLowerCase()}/projets`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#003366] hover:text-[#007BFF] transition-colors"
                >
                  <span>{t.ctaAllProjects}</span>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 font-medium">
                {t.institutionalSeal}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal for Gallery Photos */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImageModal}
              alt="Photo grand format"
              className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl mx-auto"
            />
          </div>
        </div>
      )}

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
