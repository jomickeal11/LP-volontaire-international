"use client"

import React from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { isAboutPagePublished } from "@/lib/about-cms-config"

interface AboutViewProps {
  lang: Language
  initialSettings?: Record<string, string>
}

const BLUE = "#003366"
const GREEN = "#28A745"
const BG_SURFACE = "#F7F8FA"
const TEXT_MUTED = "#5E6B76"

export default function AboutView({ lang, initialSettings = {} }: AboutViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const langLower = lang.toLowerCase() as "fr" | "en" | "de"

  const [settings, setSettings] = React.useState<Record<string, string>>(initialSettings)
  const [loading, setLoading] = React.useState<boolean>(Object.keys(initialSettings).length === 0)

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      Promise.all([getSiteSettings("ABOUT"), getSiteSettings("GENERAL")]).then(([resAbout, resGeneral]) => {
        const merged: Record<string, string> = {}
        if (resAbout.success && resAbout.dict) Object.assign(merged, resAbout.dict)
        if (resGeneral.success && resGeneral.dict) Object.assign(merged, resGeneral.dict)
        setSettings((prev) => ({ ...prev, ...merged }))
        setLoading(false)
      }).catch((err) => {
        console.error(err)
        setLoading(false)
      })
    })
  }, [])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const isPublished = isAboutPagePublished(settings, lang)

  // ── Écran d'attente institutionnel si la langue est en cours de finalisation (BROUILLON) ──
  if (!loading && !isPublished) {
    const isEn = lang === "EN"
    const isDe = lang === "DE"

    const heading = isDe
      ? "Die deutsche Version wird derzeit finalisiert"
      : isEn
      ? "English version being finalized"
      : "Version française en cours de révision éditoriale"

    const description = isDe
      ? "Unser Redaktionsteam prüft und vervollständigt derzeit die offizielle deutsche Dokumentation für diesen Bereich. Gemäß unseren redaktionellen Standards werden Inhalte erst nach vollständiger Prüfung freigeschaltet."
      : isEn
      ? "Our editorial team is currently reviewing and verifying the official English documentation for this section. In accordance with our publication standards, content is only published once fully verified."
      : "Cette page institutionnelle est actuellement en cours de révision par l'équipe éditoriale."

    const statusLabel = isDe
      ? "Status : Entwurf / In Bearbeitung"
      : isEn
      ? "Status : Draft / In review"
      : "Statut : Brouillon / En révision"

    const btnFrench = isDe
      ? "Geprüfte französische Version lesen"
      : isEn
      ? "Read verified French version"
      : "Consulter la version française"

    const btnHome = isDe ? "Zur Startseite" : isEn ? "Return to homepage" : "Retour à l'accueil"

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header lang={lang} setLang={handleSetLang} currentPage="about" navigate={navigate} />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center px-4 bg-[#F7F8FA]">
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{statusLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-4">
              {heading}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/fr/a-propos"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#003366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#002244] transition-all shadow-xs"
              >
                {btnFrench}
              </Link>
              <Link
                href={`/${lang.toLowerCase()}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all border border-slate-200"
              >
                {btnHome}
              </Link>
            </div>
          </div>
        </main>
        <Footer lang={lang} navigate={navigate} />
      </div>
    )
  }

  // ── Contenus 100% issus du CMS (Aucun fallback éditorial) ──
  const heroEyebrow = settings[`about_eyebrow_${langLower}`] || ""
  const heroTitle = settings[`about_title_${langLower}`] || ""
  const heroSubtitle = settings[`about_subtitle_${langLower}`] || ""

  const storyEyebrow = settings[`about_story_eyebrow_${langLower}`] || ""
  const storyHeadline = settings[`about_story_headline_${langLower}`] || ""
  const storyP1 = settings[`about_story_p1_${langLower}`] || ""
  const storyP2 = settings[`about_story_p2_${langLower}`] || ""
  const storyP3 = settings[`about_story_p3_${langLower}`] || ""
  const storyImage = settings["about_story_image"] || "/photo-recit-documentaire.jpg"
  const storyImageAlt = settings[`about_story_image_alt_${langLower}`] || "APTIC-R"
  const storyLocationTag = settings[`about_story_location_tag_${langLower}`] || ""
  const storyLocationText = settings[`about_story_location_${langLower}`] 
    || (settings["site_location_city"] ? `${settings["site_location_city"]}, ${settings["site_location_region"] || "Région Maritime"}` : "")

  const step1Year = settings["about_step1_year"] || "2018"
  const step1Label = settings[`about_step1_label_${langLower}`] || ""
  const step2Year = settings["about_step2_year"] || "2020"
  const step2Label = settings[`about_step2_label_${langLower}`] || ""
  const step3Year = settings[`about_step3_year_${langLower}`] || ""
  const step3Label = settings[`about_step3_label_${langLower}`] || ""

  const pillarsEyebrow = settings[`about_pillars_eyebrow_${langLower}`] || ""
  const pillarsTitle = settings[`about_pillars_title_${langLower}`] || ""
  const missionTitle = settings[`about_mission_title_${langLower}`] || ""
  const missionDesc = settings[`about_mission_desc_${langLower}`] || ""
  const visionTitle = settings[`about_vision_title_${langLower}`] || ""
  const visionDesc = settings[`about_vision_desc_${langLower}`] || ""
  const philosophyTitle = settings[`about_philosophy_title_${langLower}`] || ""
  const philosophyDesc = settings[`about_philosophy_desc_${langLower}`] || ""

  const statsList = [
    { value: settings["about_stat1_val"] || "5+", label: settings[`about_stat1_lbl_${langLower}`] || "" },
    { value: settings["about_stat2_val"] || "3 200+", label: settings[`about_stat2_lbl_${langLower}`] || "" },
    { value: settings["about_stat3_val"] || "14", label: settings[`about_stat3_lbl_${langLower}`] || "" },
    { value: settings["about_stat4_val"] || "100%", label: settings[`about_stat4_lbl_${langLower}`] || "" },
  ]

  const valuesEyebrow = settings[`about_values_eyebrow_${langLower}`] || ""
  const valuesTitle = settings[`about_values_title_${langLower}`] || ""
  const valuesSubtitle = settings[`about_values_subtitle_${langLower}`] || ""
  const valuesList = [
    { num: "01", title: settings[`about_val1_title_${langLower}`] || "", desc: settings[`about_val1_desc_${langLower}`] || "" },
    { num: "02", title: settings[`about_val2_title_${langLower}`] || "", desc: settings[`about_val2_desc_${langLower}`] || "" },
    { num: "03", title: settings[`about_val3_title_${langLower}`] || "", desc: settings[`about_val3_desc_${langLower}`] || "" },
    { num: "04", title: settings[`about_val4_title_${langLower}`] || "", desc: settings[`about_val4_desc_${langLower}`] || "" },
    { num: "05", title: settings[`about_val5_title_${langLower}`] || "", desc: settings[`about_val5_desc_${langLower}`] || "" },
  ]

  const govEyebrow = settings[`about_gov_eyebrow_${langLower}`] || ""
  const govTitle = settings[`about_gov_title_${langLower}`] || ""
  const govSubtitle = settings[`about_gov_subtitle_${langLower}`] || ""
  const gov1Role = settings[`about_gov1_role_${langLower}`] || ""
  const gov1Title = settings[`about_gov1_title_${langLower}`] || ""
  const gov1Desc = settings[`about_gov1_desc_${langLower}`] || ""
  const gov2Role = settings[`about_gov2_role_${langLower}`] || ""
  const gov2Title = settings[`about_gov2_title_${langLower}`] || ""
  const gov2Desc = settings[`about_gov2_desc_${langLower}`] || ""
  const gov3Role = settings[`about_gov3_role_${langLower}`] || ""
  const gov3Title = settings[`about_gov3_title_${langLower}`] || ""
  const gov3Desc = settings[`about_gov3_desc_${langLower}`] || ""

  const ctaEyebrow = settings[`about_cta_eyebrow_${langLower}`] || ""
  const ctaTitle = settings[`about_cta_title_${langLower}`] || ""
  const ctaSubtitle = settings[`about_cta_subtitle_${langLower}`] || ""
  const ctaBtnMember = settings[`about_cta_btn_member_${langLower}`] || ""
  const ctaBtnVolunteer = settings[`about_cta_btn_volunteer_${langLower}`] || ""
  const ctaBtnPartner = settings[`about_cta_btn_partner_${langLower}`] || ""

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="about" navigate={navigate} />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* ── 1. Editorial Hero (#FFFFFF) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto">
            {heroEyebrow && (
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
                <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
                  {heroEyebrow}
                </span>
              </div>
            )}
            
            <h1 
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] whitespace-pre-line"
              style={{ color: BLUE }}
            >
              {heroTitle}
            </h1>
            
            <p 
              className="text-base sm:text-xl max-w-3xl leading-relaxed mb-8 whitespace-pre-line"
              style={{ color: TEXT_MUTED }}
            >
              {heroSubtitle}
            </p>

            {/* Barre de navigation rapide par ancre sur la page */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                {lang === "DE" ? "Bereiche :" : lang === "EN" ? "Jump to :" : "Accès direct :"}
              </span>
              <a
                href="#histoire"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-[#003366] hover:bg-[#003366] hover:text-white transition-all shadow-2xs"
              >
                {storyEyebrow || "Histoire"}
              </a>
              <a
                href="#missions"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-[#003366] hover:bg-[#003366] hover:text-white transition-all shadow-2xs"
              >
                {pillarsTitle || "Mission"}
              </a>
              <a
                href="#impact"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-[#003366] hover:bg-[#003366] hover:text-white transition-all shadow-2xs"
              >
                {lang === "DE" ? "Wirkung" : lang === "EN" ? "Impact" : "Chiffres Clés"}
              </a>
              <a
                href="#valeurs"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-[#003366] hover:bg-[#003366] hover:text-white transition-all shadow-2xs"
              >
                {valuesTitle || "Valeurs"}
              </a>
              <a
                href="#gouvernance"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-[#003366] hover:bg-[#003366] hover:text-white transition-all shadow-2xs"
              >
                {govTitle || "Gouvernance"}
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. Notre Histoire (Narrative + Large Field Photo on #F7F8FA) ── */}
        <section id="histoire" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 sm:py-24" style={{ backgroundColor: BG_SURFACE }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Narrative */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-[#003366] tracking-widest uppercase">
                    {storyEyebrow}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-[#28A745]">
                    {step1Year ? `${lang === "DE" ? "Seit" : lang === "EN" ? "Since" : "Depuis"} ${step1Year}` : ""}
                  </span>
                </div>

                <h2 
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight"
                  style={{ color: BLUE }}
                >
                  {storyHeadline}
                </h2>

                <div className="space-y-4 text-base sm:text-lg leading-relaxed mb-8" style={{ color: TEXT_MUTED }}>
                  <p className="whitespace-pre-line">{storyP1}</p>
                  <p className="whitespace-pre-line">{storyP2}</p>
                  <p className="font-medium text-[#16324A] whitespace-pre-line">{storyP3}</p>
                </div>

                {/* Timeline Summary Line (3 étapes de dates) */}
                <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#003366]">{step1Year}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{step1Label}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#003366]">{step2Year}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{step2Label}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#003366]">{step3Year}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{step3Label}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: High Quality Field Photo */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/5] bg-white">
                  <img 
                    src={storyImage} 
                    alt={storyImageAlt} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/85 via-[#003366]/20 to-transparent flex flex-col justify-end p-6">
                    {storyLocationTag && (
                      <div className="text-white/90 text-xs uppercase tracking-wider font-semibold">
                        {storyLocationTag}
                      </div>
                    )}
                    {storyLocationText && (
                      <div className="text-white text-lg font-bold">
                        {storyLocationText}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Mission · Vision · Philosophie (3 Editorial Columns on #FFFFFF) ── */}
        <section id="missions" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              {pillarsEyebrow && (
                <span className="text-xs font-bold text-[#28A745] tracking-widest uppercase block mb-2">
                  {pillarsEyebrow}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003366]">
                {pillarsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {/* Mission */}
              <div className="flex flex-col border-t-2 border-[#003366] pt-6">
                <span className="text-3xl font-black text-slate-300 mb-4">01</span>
                <h3 className="text-xl font-bold text-[#003366] mb-3">
                  {missionTitle}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed whitespace-pre-line">
                  {missionDesc}
                </p>
              </div>

              {/* Vision */}
              <div className="flex flex-col border-t-2 border-[#003366] pt-6">
                <span className="text-3xl font-black text-slate-300 mb-4">02</span>
                <h3 className="text-xl font-bold text-[#003366] mb-3">
                  {visionTitle}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed whitespace-pre-line">
                  {visionDesc}
                </p>
              </div>

              {/* Philosophy */}
              <div className="flex flex-col border-t-2 border-[#003366] pt-6">
                <span className="text-3xl font-black text-slate-300 mb-4">03</span>
                <h3 className="text-xl font-bold text-[#003366] mb-3">
                  {philosophyTitle}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed whitespace-pre-line">
                  {philosophyDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Chiffres Clés (Institutional #003366 Band, White Numbers) ── */}
        <section id="impact" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 text-white" style={{ backgroundColor: BLUE }}>
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsList.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                  {s.value}
                </div>
                <div className="w-6 h-0.5 bg-[#28A745] mb-3" />
                <div className="text-xs sm:text-sm text-white/80 font-medium max-w-[200px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Nos 5 Valeurs Cardinales (Editorial Wide Horizontal Layout on #FFFFFF) ── */}
        <section id="valeurs" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-14">
              {valuesEyebrow && (
                <span className="text-xs font-bold text-[#28A745] tracking-widest uppercase block mb-2">
                  {valuesEyebrow}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003366] mb-3">
                {valuesTitle}
              </h2>
              <p className="text-[#5E6B76] text-base sm:text-lg">
                {valuesSubtitle}
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {valuesList.map((v, idx) => (
                <div 
                  key={idx} 
                  className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start group"
                >
                  <div className="md:col-span-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#003366]/30 group-hover:text-[#007BFF] transition-colors">
                      {v.num}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#003366] uppercase tracking-wide leading-tight">
                      {v.title}
                    </h3>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-base text-[#5E6B76] leading-relaxed whitespace-pre-line">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Gouvernance & Structure (Compact Schema on #F7F8FA) ── */}
        <section id="gouvernance" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200/80" style={{ backgroundColor: BG_SURFACE }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              {govEyebrow && (
                <span className="text-xs font-bold text-[#28A745] tracking-widest uppercase block mb-2">
                  {govEyebrow}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003366] mb-2">
                {govTitle}
              </h2>
              <p className="text-[#5E6B76] text-sm sm:text-base whitespace-pre-line">
                {govSubtitle}
              </p>
            </div>

            {/* Compact Hierarchical Flow (3 instances) */}
            <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
              
              {/* Block 1: Assemblée Générale */}
              <div className="w-full bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#28A745] block mb-0.5">
                  {gov1Role}
                </span>
                <h3 className="text-lg font-extrabold text-[#003366] mb-1.5">
                  {gov1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6B76] max-w-lg mx-auto leading-relaxed">
                  {gov1Desc}
                </p>
              </div>

              {/* Connecting arrow */}
              <div className="text-[#003366] text-sm font-bold opacity-60 leading-none py-1">
                ↓
              </div>

              {/* Block 2: Bureau Exécutif & Direction */}
              <div className="w-full bg-white rounded-xl p-5 sm:p-6 border-2 border-[#003366]/20 shadow-2xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#007BFF] block mb-0.5">
                  {gov2Role}
                </span>
                <h3 className="text-lg font-extrabold text-[#003366] mb-1.5">
                  {gov2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6B76] max-w-lg mx-auto leading-relaxed">
                  {gov2Desc}
                </p>
              </div>

              {/* Connecting arrow */}
              <div className="text-[#003366] text-sm font-bold opacity-60 leading-none py-1">
                ↓
              </div>

              {/* Block 3: Comité Consultatif Communautaire */}
              <div className="w-full bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#28A745] block mb-0.5">
                  {gov3Role}
                </span>
                <h3 className="text-lg font-extrabold text-[#003366] mb-1.5">
                  {gov3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6B76] max-w-lg mx-auto leading-relaxed">
                  {gov3Desc}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. Full-Width Generous CTA on #FFFFFF ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            {ctaEyebrow && (
              <span className="text-xs sm:text-sm font-bold text-[#28A745] tracking-widest uppercase block mb-3">
                {ctaEyebrow}
              </span>
            )}
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#003366] mb-4 tracking-tight leading-tight">
              {ctaTitle}
            </h2>
            <p className="text-[#5E6B76] text-base sm:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed whitespace-pre-line">
              {ctaSubtitle}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {ctaBtnMember && (
                <Link
                  href={getPageUrl("membership", lang)}
                  className="px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-[#003366] text-white hover:bg-[#002244] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {ctaBtnMember}
                </Link>
              )}
              {ctaBtnVolunteer && (
                <Link
                  href={getPageUrl("apply", lang)}
                  className="px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-[#007BFF] text-white hover:bg-[#0060c8] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {ctaBtnVolunteer}
                </Link>
              )}
              {ctaBtnPartner && (
                <Link
                  href={getPageUrl("partner", lang)}
                  className="px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-slate-100 text-[#003366] hover:bg-slate-200 transition-all border border-slate-300"
                >
                  {ctaBtnPartner}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}

