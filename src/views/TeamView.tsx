"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface TeamViewProps {
  lang: Language
}

const BG = "#F5F7F9"

const I18N = {
  FR: {
    badge: "Gouvernance, Coordination & Terrain",
    title: "L'Équipe d'APTIC-R",
    subtitle:
      "Des ingénieurs, éducateurs, makers et animateurs passionnés, engagés au quotidien aux côtés des communautés villageoises du Togo.",
    filterAll: "Toute l'équipe",
    categories: {
      DIRECTION: "Direction & Fondateurs",
      COORDINATION: "Coordination des programmes",
      FORMATION: "Formateurs & FabLab",
      CONSEIL: "Conseil consultatif",
      VOLONTAIRE: "Volontaires & Bénévoles",
    },
    joinTitle: "Envie de mettre vos compétences au service d'APTIC-R ?",
    joinDesc: "Nous accueillons régulièrement des volontaires, bénévoles et experts passionnés pour enrichir nos programmes.",
    joinVolunteer: "CANDIDATER COMME VOLONTAIRE",
    joinMember: "DEVENIR MEMBRE",
    contactEmail: "Contacter",
  },
  EN: {
    badge: "Governance, Coordination & Field Action",
    title: "The APTIC-R Team",
    subtitle:
      "Dedicated engineers, educators, makers, and grassroots coordinators working hand-in-hand with Togolese rural communities.",
    filterAll: "All members",
    categories: {
      DIRECTION: "Leadership & Founders",
      COORDINATION: "Program Coordination",
      FORMATION: "Trainers & FabLab",
      CONSEIL: "Advisory Board",
      VOLONTAIRE: "Volunteers",
    },
    joinTitle: "Want to bring your skills to APTIC-R?",
    joinDesc: "We continuously welcome passionate volunteers, mentors, and field experts to join our initiatives.",
    joinVolunteer: "APPLY AS VOLUNTEER",
    joinMember: "BECOME A MEMBER",
    contactEmail: "Contact",
  },
  DE: {
    badge: "Führung, Koordination & Einsatz vor Ort",
    title: "Das Team von APTIC-R",
    subtitle:
      "Engagierte Ingenieure, Pädagogen und Macher im täglichen Einsatz für ländliche Gemeinden in Togo.",
    filterAll: "Gesamtes Team",
    categories: {
      DIRECTION: "Leitung & Gründer",
      COORDINATION: "Programmkoordination",
      FORMATION: "Ausbilder & FabLab",
      CONSEIL: "Beirat",
      VOLONTAIRE: "Freiwillige",
    },
    joinTitle: "Möchten Sie sich bei APTIC-R einbringen?",
    joinDesc: "Wir freuen uns über engagierte Freiwillige und Experten für unsere Programme vor Ort.",
    joinVolunteer: "ALS FREIWILLIGER BEWERBEN",
    joinMember: "MITGLIED WERDEN",
    contactEmail: "Kontakt",
  },
}

const MEMBERS = [
  {
    id: "1",
    name: "Kokouvi Mensah",
    roleFr: "Président & Fondateur",
    roleEn: "President & Founder",
    roleDe: "Präsident & Gründer",
    category: "DIRECTION",
    bioFr:
      "Ingénieur en systèmes d'information formé à Lomé et à Dakar. Engagé depuis plus de 10 ans pour le désenclavement numérique et l'accès universel aux technologies en milieu rural.",
    bioEn:
      "Information Systems Engineer trained in Lomé and Dakar. Dedicated for over a decade to digital inclusion and rural technology access across West Africa.",
    bioDe:
      "IT-Ingenieur mit Ausbildung in Lomé und Dakar. Seit über 10 Jahren engagiert für digitale Inklusion im ländlichen Raum.",
    email: "direction@aptic-r.org",
    initials: "KM",
    color: "#174F7A",
    skills: ["Gouvernance", "Stratégie IT", "Plaidoyer", "Partenariats"],
  },
  {
    id: "2",
    name: "Afiwa Lawson",
    roleFr: "Coordinatrice des Programmes & Pédagogie",
    roleEn: "Program & Pedagogy Coordinator",
    roleDe: "Programm- & Pädagogikkoordinatorin",
    category: "COORDINATION",
    bioFr:
      "Spécialiste de l'éducation populaire et de l'ingénierie pédagogique. Elle conçoit les parcours de formation et assure l'accueil et l'intégration des volontaires à Agbélouvé.",
    bioEn:
      "Expert in grassroots education and pedagogical engineering. She designs training curricula and coordinates volunteer onboarding in Agbélouvé.",
    bioDe:
      "Expertin für Pädagogik und Bildungsprogramme. Zuständig für Lehrpläne und die Betreuung von Freiwilligen.",
    email: "programmes@aptic-r.org",
    initials: "AL",
    color: "#35A85A",
    skills: ["Pédagogie", "Coordination", "Égalité F/H", "Formation"],
  },
  {
    id: "3",
    name: "Kodjo Agbodjan",
    roleFr: "Responsable Technique & FabLab",
    roleEn: "Technical & FabLab Lead",
    roleDe: "Technischer Leiter & FabLab",
    category: "FORMATION",
    bioFr:
      "Maker passionné, expert en prototypage électronique Arduino/Raspberry Pi, impression 3D et maintenance d'équipements reconditionnés à faible consommation.",
    bioEn:
      "Passionate maker, expert in Arduino/Raspberry Pi prototyping, 3D printing, and low-power refurbished computer maintenance.",
    bioDe:
      "Maker und Techniker, spezialisiert auf 3D-Druck, Arduino/Raspberry Pi und nachhaltige Hardware-Wartung.",
    email: "fablab@aptic-r.org",
    initials: "KA",
    color: "#E65100",
    skills: ["FabLab", "Impression 3D", "Arduino", "Low-Tech"],
  },
  {
    id: "4",
    name: "Essivi Kpogo",
    roleFr: "Chargée de Mobilisation Communautaire & Genre",
    roleEn: "Community Engagement & Gender Officer",
    roleDe: "Referentin für Gemeindeengagement & Gleichstellung",
    category: "COORDINATION",
    bioFr:
      "Travailleuse sociale et animatrice de terrain, elle coordonne les relations avec les groupements de femmes maraîchères et le programme « Elles Codent pour le Changement ».",
    bioEn:
      "Social worker and community organizer leading partnerships with women farming cooperatives and the 'Girls Code for Change' program.",
    bioDe:
      "Sozialarbeiterin und Koordinatorin für Frauenkooperativen und Gleichstellungsprogramme.",
    email: "communaute@aptic-r.org",
    initials: "EK",
    color: "#9C27B0",
    skills: ["Animation rurale", "Autonomisation", "Sensibilisation", "Éwé"],
  },
  {
    id: "5",
    name: "Dr. Yao Tete",
    roleFr: "Conseiller Scientifique & Agro-écologie",
    roleEn: "Scientific & Agro-Ecology Advisor",
    roleDe: "Wissenschaftlicher Berater & Agrarökologie",
    category: "CONSEIL",
    bioFr:
      "Enseignant-chercheur agronome, il oriente les recherches appliquées d'APTIC-R sur la résilience climatique, les sols et les capteurs d'irrigation solaire Low-Tech.",
    bioEn:
      "Agronomy researcher advising APTIC-R applied research on climate resilience, soil conservation, and solar Low-Tech irrigation sensors.",
    bioDe:
      "Agrarwissenschaftler mit Schwerpunkt auf Klimaresilienz und sparsamer Bewässerungstechnologie.",
    email: "conseil@aptic-r.org",
    initials: "YT",
    color: "#2E7D32",
    skills: ["Agro-écologie", "Recherche", "Sols", "Climat"],
  },
  {
    id: "6",
    name: "Léa Dupont",
    roleFr: "Volontaire Internationale 2025/2026 — UI/UX & Web",
    roleEn: "International Volunteer 2025/2026 — UI/UX & Web",
    roleDe: "Internationale Freiwillige 2025/2026 — UI/UX & Web",
    category: "VOLONTAIRE",
    bioFr:
      "Designer d'interface diplômée de Lyon, en mission de 9 mois à Agbélouvé pour former les jeunes au design web et documenter les projets du FabLab.",
    bioEn:
      "UX/UI designer from Lyon on a 9-month volunteer placement in Agbélouvé teaching web design and documenting local FabLab projects.",
    bioDe:
      "UX/UI-Designerin aus Lyon für 9 Monate in Agbélouvé zur Ausbildung junger Webdesigner.",
    email: "volontariat@aptic-r.org",
    initials: "LD",
    color: "#0288D1",
    skills: ["Figma", "UI/UX", "Mentorat", "Design"],
  },
]

export default function TeamView({ lang }: TeamViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR
  const [activeCategory, setActiveCategory] = useState<string>("ALL")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const filteredMembers =
    activeCategory === "ALL"
      ? MEMBERS
      : MEMBERS.filter((m) => m.category === activeCategory)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="team" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>👥</span>
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

        {/* ── 2. Filter Category Pills ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                activeCategory === "ALL"
                  ? "bg-[#174F7A] text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.filterAll}
            </button>
            {Object.entries(t.categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  activeCategory === key
                    ? "bg-[#174F7A] text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Team Cards Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((m) => {
              const role =
                lang === "EN" ? m.roleEn : lang === "DE" ? m.roleDe : m.roleFr
              const bio =
                lang === "EN" ? m.bioEn : lang === "DE" ? m.bioDe : m.bioFr
              const categoryLabel =
                t.categories[m.category as keyof typeof t.categories] || m.category

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Monogram / Avatar */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.initials}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        {categoryLabel}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#142332] mb-1">
                      {m.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#174F7A] mb-4">
                      {role}
                    </p>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {bio}
                    </p>
                  </div>

                  <div>
                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {m.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Contact email */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href={`mailto:${m.email}`}
                        className="text-[#174F7A] hover:underline font-semibold flex items-center gap-1.5"
                      >
                        <span>✉️</span>
                        <span>{m.email}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 4. Join Section ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#174F7A] text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              {t.joinTitle}
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
              {t.joinDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href={getPageUrl("apply", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-[#35A85A] text-white hover:bg-[#2e924e] transition-colors shadow-md"
              >
                {t.joinVolunteer}
              </Link>
              <Link
                href={getPageUrl("membership", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-white text-[#174F7A] hover:bg-slate-100 transition-colors shadow-md"
              >
                {t.joinMember}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
