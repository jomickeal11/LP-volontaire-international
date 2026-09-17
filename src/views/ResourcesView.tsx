"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

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
    },
    downloadBtn: "Télécharger (PDF)",
    transparencyTitle: "Notre Engagement pour la Transparence",
    transparencyText:
      "Conformément à nos valeurs associatives, tous les bilans moraux, financiers et rapports d'impact annuels d'APTIC-R sont publics et accessibles à nos adhérents, partenaires et bénéficiaires.",
    yearLabel: "Année :",
    typeLabel: "Catégorie :",
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
    },
    downloadBtn: "Download (PDF)",
    transparencyTitle: "Our Commitment to Transparency",
    transparencyText:
      "In accordance with our core non-profit principles, all moral and financial audits, annual statements, and impact reviews are open and publicly accessible.",
    yearLabel: "Year:",
    typeLabel: "Category:",
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
    },
    downloadBtn: "Herunterladen (PDF)",
    transparencyTitle: "Unser Engagement für Transparenz",
    transparencyText:
      "Gemäß unseren Grundsätzen sind alle Berichte und Prüfungen öffentlich zugänglich.",
    yearLabel: "Jahr:",
    typeLabel: "Kategorie:",
  },
}

const RESOURCES = [
  {
    id: "1",
    titleFr: "Rapport d'Activité Annuel 2024 / 2025",
    titleEn: "Annual Activity Report 2024 / 2025",
    titleDe: "Jahresbericht 2024 / 2025",
    type: "REPORT",
    year: 2025,
    size: "2.4 Mo",
    descFr: "Bilan complet des 12 mois d'action : 3 200 apprenants formés, expansion du FabLab d'Agbélouvé et accueil de 8 volontaires internationaux.",
    descEn: "Full 12-month review: 3,200 participants trained, Agbélouvé FabLab scale-up, and onboarding of 8 international volunteers.",
    descDe: "Umfassender Jahresrückblick: 3.200 geschulte Teilnehmer und Ausbau des FabLabs.",
    fileName: "APTIC-R_Rapport_Activite_2024-2025.pdf",
  },
  {
    id: "2",
    titleFr: "Statuts Officiels et Règlement Intérieur d'APTIC-R",
    titleEn: "Official Statutes and Internal Regulations",
    titleDe: "Offizielle Vereinssatzung und Geschäftsordnung",
    type: "STATUTE",
    year: 2024,
    size: "850 Ko",
    descFr: "Texte fondateur régissant les organes d'administration, l'Assemblée Générale, le Bureau Exécutif et les droits des membres adhérents.",
    descEn: "Foundational charter detailing the governance bodies, annual assemblies, and rights of registered members.",
    descDe: "Rechtliche Satzung mit allen Regelungen zur Mitgliedschaft und Vorstandsarbeit.",
    fileName: "APTIC-R_Statuts_Officiels_Enregistres.pdf",
  },
  {
    id: "3",
    titleFr: "Guide Pratique d'Hygiène Numérique & Sécurité Mobile",
    titleEn: "Practical Guide to Digital Hygiene & Mobile Security",
    titleDe: "Leitfaden für digitale Hygiene und Smartphonesicherheit",
    type: "GUIDE",
    year: 2025,
    size: "1.8 Mo",
    descFr: "Manuel illustré destiné aux formateurs et animateurs pour sensibiliser aux arnaques mobile money, au phishing et à la protection des données.",
    descEn: "Illustrated field manual for trainers and community organizers tackling phone scams, phishing, and privacy.",
    descDe: "Praxisorientiertes Handbuch zur Sensibilisierung gegen Online-Betrug.",
    fileName: "APTIC-R_Guide_Cyber_Hygiene_Mobile.pdf",
  },
  {
    id: "4",
    titleFr: "Fiche Projet : Parcelle Maraîchère & Irrigation Solaire Low-Tech",
    titleEn: "Project Brief: Solar Drip Irrigation Parcel",
    titleDe: "Projektsteckbrief: Solare Tröpfchenbewässerung",
    type: "PROJECT_SHEET",
    year: 2024,
    size: "1.1 Mo",
    descFr: "Schémas techniques, nomenclature des composants locaux et protocole de mesure des rendements agronomiques.",
    descEn: "Technical schematics, locally sourced bill of materials, and yield measurement methodology.",
    descDe: "Technische Pläne und Dokumentation des solaren Bewässerungssystems.",
    fileName: "APTIC-R_Fiche_Projet_Agri_LowTech.pdf",
  },
  {
    id: "5",
    titleFr: "Livret d'Accueil du Volontaire International au Togo",
    titleEn: "Welcome Handbook for International Volunteers in Togo",
    titleDe: "Willkommensbroschüre für internationale Freiwillige in Togo",
    type: "GUIDE",
    year: 2025,
    size: "3.2 Mo",
    descFr: "Préparation au départ, formalités de visa, santé, coutumes locales, vie à Agbélouvé et déroulement de la mission.",
    descEn: "Pre-departure preparation, visas, health, cultural etiquette, life in Agbélouvé, and volunteer onboarding.",
    descDe: "Reisevorbereitung, Visa, Gesundheit, Kultur und Leben in Agbélouvé.",
    fileName: "APTIC-R_Livret_Accueil_Volontaire_Togo.pdf",
  },
  {
    id: "6",
    titleFr: "Bilan Financier & Rapport de Gestion 2023 / 2024",
    titleEn: "Financial Audit & Management Review 2023 / 2024",
    titleDe: "Finanzbericht und Jahresabschluss 2023 / 2024",
    type: "REPORT",
    year: 2024,
    size: "1.5 Mo",
    descFr: "Compte d'exploitation associatif certifié, ventilation des charges de projets et origine des financements.",
    descEn: "Audited financial statements, program expenditure breakdown, and funding provenance.",
    descDe: "Geprüfter Jahresabschluss mit Aufschlüsselung aller Ausgaben.",
    fileName: "APTIC-R_Bilan_Financier_2023-2024.pdf",
  },
]

export default function ResourcesView({ lang }: ResourcesViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [typeFilter, setTypeFilter] = useState("ALL")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const filteredResources =
    typeFilter === "ALL"
      ? RESOURCES
      : RESOURCES.filter((r) => r.type === typeFilter)

  const handleDownload = (fileName: string, title: string) => {
    alert(`Téléchargement de : ${title} (${fileName})\n\nLe document est en cours de transfert.`);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="resources" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#003366]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#003366] mb-6">
              <span>📚</span>
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

        {/* ── 2. Filter Pills ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
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
        </section>

        {/* ── 3. Resources Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((res) => {
              const title =
                lang === "EN" ? res.titleEn : lang === "DE" ? res.titleDe : res.titleFr
              const desc =
                lang === "EN" ? res.descEn : lang === "DE" ? res.descDe : res.descFr
              const typeLabel = t.types[res.type as keyof typeof t.types] || res.type

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#003366]/10 text-[#003366]">
                        {typeLabel}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {res.year} · {res.size}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#142332] mb-2 leading-snug">
                      {title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleDownload(res.fileName, title)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors text-xs shadow-sm"
                    >
                      <span>📥</span>
                      <span>{t.downloadBtn}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 4. Transparency Commitment ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#F0F4F8] border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#28A745]/10 text-[#28A745] text-2xl flex items-center justify-center mx-auto">
              ⚖️
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
