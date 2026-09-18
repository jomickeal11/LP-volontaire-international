"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { getTeamMembers } from "@/lib/cms-actions"

interface TeamViewProps {
  lang: Language
}

const BG = "#F7F8FA"

interface Member {
  id: string
  name: string
  roleFr: string
  roleEn?: string | null
  roleDe?: string | null
  category: string
  bioFr?: string | null
  bioEn?: string | null
  bioDe?: string | null
  email?: string | null
  photoUrl?: string | null
  skills?: string | null
  order: number
}

const INITIAL_FALLBACK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Kokouvi Mensah",
    roleFr: "Président & Fondateur d'APTIC-R",
    roleEn: "President & Founder of APTIC-R",
    roleDe: "Präsident & Gründer von APTIC-R",
    category: "DIRECTION",
    bioFr:
      "Ingénieur en systèmes d'information formé à Lomé et à Dakar. Engagé depuis plus de 10 ans pour le désenclavement numérique et l'accès universel aux technologies en milieu rural, il coordonne les partenariats stratégiques et porte la vision institutionnelle de l'association.",
    bioEn:
      "Information Systems Engineer trained in Lomé and Dakar. Dedicated for over a decade to digital inclusion and rural technology access across West Africa, leading strategic partnerships and institutional development.",
    bioDe:
      "IT-Ingenieur mit Ausbildung in Lomé und Dakar. Seit über 10 Jahren engagiert für digitale Inklusion im ländlichen Raum, strategische Partnerschaften und Organisationsentwicklung.",
    email: "direction@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Gouvernance", "Stratégie IT", "Plaidoyer institutionnel", "Partenariats"]),
    order: 1,
  },
  {
    id: "2",
    name: "Afiwa Lawson",
    roleFr: "Coordinatrice des Programmes & Ingénierie Pédagogique",
    roleEn: "Program & Pedagogy Coordinator",
    roleDe: "Programm- & Pädagogikkoordinatorin",
    category: "COORDINATION",
    bioFr:
      "Spécialiste de l'éducation populaire et de l'ingénierie pédagogique. Elle conçoit les parcours de formation numérique, supervise les formateurs et assure l'accueil et le suivi des volontaires internationaux à Agbélouvé.",
    bioEn:
      "Expert in grassroots education and pedagogical engineering. She designs training curricula, supervises trainers, and oversees international volunteer onboarding in Agbélouvé.",
    bioDe:
      "Expertin für Pädagogik und Bildungsprogramme. Zuständig für Lehrpläne, Ausbilder und die Betreuung internationaler Freiwilliger vor Ort.",
    email: "programmes@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Ingénierie pédagogique", "Coordination", "Égalité F/H"]),
    order: 2,
  },
  {
    id: "3",
    name: "Kodjo Agbodjan",
    roleFr: "Responsable Technique & FabLab Rural",
    roleEn: "Technical & Rural FabLab Lead",
    roleDe: "Technischer Leiter & FabLab",
    category: "FORMATION",
    bioFr:
      "Maker et électronicien passionné, spécialiste du prototypage Arduino/Raspberry Pi, de l'impression 3D et de la maintenance d'équipements reconditionnés à basse consommation énergétique adaptés au milieu rural.",
    bioEn:
      "Passionate maker and electronics technician specializing in Arduino/Raspberry Pi prototyping, 3D printing, and maintenance of energy-efficient refurbished hardware.",
    bioDe:
      "Maker und Techniker, spezialisiert auf 3D-Druck, Arduino/Raspberry Pi und nachhaltige Hardware-Wartung für ländliche Gebiete.",
    email: "fablab@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["FabLab & Prototypage", "Impression 3D", "Low-Tech"]),
    order: 3,
  },
  {
    id: "4",
    name: "Essivi Kpogo",
    roleFr: "Chargée de Mobilisation Communautaire & Genre",
    roleEn: "Community Engagement & Gender Officer",
    roleDe: "Referentin für Gemeindeengagement & Gleichstellung",
    category: "COORDINATION",
    bioFr:
      "Travailleuse sociale et animatrice de terrain, elle coordonne les relations avec les groupements de femmes maraîchères et anime le programme d'initiation au numérique « Elles Codent pour le Changement ».",
    bioEn:
      "Social worker and community organizer leading partnerships with women farming cooperatives and coordinating the 'Girls Code for Change' empowerment initiative.",
    bioDe:
      "Sozialarbeiterin und Koordinatorin für Frauenkooperativen und das Bildungsprogramm für Mädchen und Frauen im ländlichen Raum.",
    email: "communaute@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Animation rurale", "Autonomisation des femmes", "Médiation"]),
    order: 4,
  },
  {
    id: "5",
    name: "Dr. Yao Tete",
    roleFr: "Conseiller Scientifique & Agro-écologie",
    roleEn: "Scientific & Agro-Ecology Advisor",
    roleDe: "Wissenschaftlicher Berater & Agrarökologie",
    category: "CONSEIL",
    bioFr:
      "Enseignant-chercheur agronome, il oriente les projets appliqués d'APTIC-R sur la résilience climatique, la régénération des sols et l'intégration de capteurs d'irrigation solaire Low-Tech.",
    bioEn:
      "Agronomy researcher advising APTIC-R projects on climate resilience, soil regeneration, and solar-powered Low-Tech irrigation sensors.",
    bioDe:
      "Agrarwissenschaftler mit Schwerpunkt auf Klimaresilienz, Bodenfruchtbarkeit und sparsamer solarer Bewässerungstechnik.",
    email: "conseil@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Agro-écologie", "Recherche appliquée", "Climat"]),
    order: 5,
  },
  {
    id: "6",
    name: "Léa Dupont",
    roleFr: "Volontaire Internationale — UI/UX & Design Numérique",
    roleEn: "International Volunteer — UI/UX & Digital Design",
    roleDe: "Internationale Freiwillige — UI/UX & Webdesign",
    category: "VOLONTAIRE",
    bioFr:
      "Designer d'interface diplômée, en mission de volontariat à Agbélouvé pour former les jeunes aux fondamentaux du design graphique, du prototypage web et documenter les actions du FabLab.",
    bioEn:
      "UX/UI designer on a volunteer mission in Agbélouvé, mentoring youth in visual design and web prototyping while documenting local FabLab projects.",
    bioDe:
      "UX/UI-Designerin im Freiwilligendienst in Agbélouvé zur Ausbildung junger Menschen in Webdesign und Mediengestaltung.",
    email: "volontariat@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["UI/UX Design", "Formation & Mentorat", "Documentation"]),
    order: 6,
  },
]

const I18N = {
  FR: {
    badge: "Gouvernance, Coordination & Terrain",
    title: "Notre équipe",
    subtitle:
      "Les personnes qui portent les programmes d'APTIC-R et s'engagent au quotidien auprès des communautés rurales du Togo.",
    leadershipSectionTitle: "DIRECTION & FONDATEURS",
    leadershipSectionSubtitle:
      "Gouvernance stratégique, représentativité institutionnelle et orientation générale des programmes.",
    coordinationSectionTitle: "COORDINATION & EXPERTISE",
    coordinationSectionSubtitle:
      "Coordination pédagogique, FabLab, inclusion numérique et mobilisation de terrain.",
    advisorySectionTitle: "CONSEIL & VOLONTAIRES",
    advisorySectionSubtitle:
      "Accompagnement scientifique et appui des volontaires internationaux en mission.",
    joinTitle: "Vous souhaitez rejoindre l'équipe ou contribuer à nos projets ?",
    joinDesc:
      "Nous accueillons régulièrement des volontaires, des experts et des membres engagés pour renforcer nos actions sur le terrain.",
    joinVolunteer: "Devenir volontaire",
    joinMember: "Devenir membre",
    contactEmail: "Contacter par email",
  },
  EN: {
    badge: "Governance, Coordination & Field Action",
    title: "Our Team",
    subtitle:
      "The dedicated people behind APTIC-R programs, working daily alongside rural communities in Togo.",
    leadershipSectionTitle: "LEADERSHIP & FOUNDERS",
    leadershipSectionSubtitle:
      "Strategic governance, institutional representation, and overall program direction.",
    coordinationSectionTitle: "COORDINATION & EXPERTISE",
    coordinationSectionSubtitle:
      "Educational coordination, FabLab management, digital inclusion, and grassroots organizing.",
    advisorySectionTitle: "ADVISORY & VOLUNTEERS",
    advisorySectionSubtitle:
      "Scientific guidance and international volunteer support on the ground.",
    joinTitle: "Would you like to join our team or contribute to our projects?",
    joinDesc:
      "We regularly welcome volunteers, technical experts, and committed members to expand our field initiatives.",
    joinVolunteer: "Become a volunteer",
    joinMember: "Become a member",
    contactEmail: "Contact via email",
  },
  DE: {
    badge: "Führung, Koordination & Einsatz vor Ort",
    title: "Unser Team",
    subtitle:
      "Die Menschen hinter den Programmen von APTIC-R im täglichen Einsatz für ländliche Gemeinden in Togo.",
    leadershipSectionTitle: "LEITUNG & GRÜNDER",
    leadershipSectionSubtitle:
      "Strategische Führung, institutionelle Vertretung und Programmkoordination.",
    coordinationSectionTitle: "KOORDINATION & EXPERTISE",
    coordinationSectionSubtitle:
      "Pädagogische Leitung, FabLab-Management, digitale Inklusion und Gemeindearbeit.",
    advisorySectionTitle: "BEIRAT & FREIWILLIGE",
    advisorySectionSubtitle:
      "Wissenschaftliche Beratung und Unterstützung durch internationale Freiwillige.",
    joinTitle: "Möchten Sie sich unserem Team anschließen oder mitwirken?",
    joinDesc:
      "Wir freuen uns über engagierte Freiwillige, Experten und Mitglieder zur Stärkung unserer Aktionen vor Ort.",
    joinVolunteer: "Freiwilliger werden",
    joinMember: "Mitglied werden",
    contactEmail: "Kontakt per E-Mail",
  },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function parseSkills(skillsStr?: string | null): string[] {
  if (!skillsStr) return []
  try {
    const parsed = JSON.parse(skillsStr)
    return Array.isArray(parsed) ? parsed : [skillsStr]
  } catch {
    return skillsStr.split(",").map((s) => s.trim()).filter(Boolean)
  }
}

function MemberAvatar({
  initials,
  photoUrl,
  name,
  size = "normal",
}: {
  initials: string
  photoUrl?: string | null
  name: string
  size?: "large" | "normal"
}) {
  const isLarge = size === "large"

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm bg-[#003366] flex items-center justify-center text-white ${
        isLarge
          ? "w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44"
          : "w-24 h-24 sm:w-28 sm:h-28"
      }`}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes={isLarge ? "(max-width: 768px) 144px, 176px" : "112px"}
          className="object-cover"
        />
      ) : (
        <span
          className={`font-black tracking-wider text-white ${
            isLarge ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
          }`}
        >
          {initials}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#28A745]" />
    </div>
  )
}

export default function TeamView({ lang }: TeamViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [members, setMembers] = useState<Member[]>(INITIAL_FALLBACK_MEMBERS)

  useEffect(() => {
    getTeamMembers({ activeOnly: true })
      .then((res) => {
        if (res?.success && Array.isArray(res.members) && res.members.length > 0) {
          setMembers(res.members)
        }
      })
      .catch((err) => {
        console.error("Erreur de chargement des membres d'équipe:", err)
      })
  }, [])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const getRole = (m: Member) => {
    if (lang === "EN" && m.roleEn?.trim()) return m.roleEn
    if (lang === "DE" && m.roleDe?.trim()) return m.roleDe
    return m.roleFr
  }

  const getBio = (m: Member) => {
    if (lang === "EN" && m.bioEn?.trim()) return m.bioEn
    if (lang === "DE" && m.bioDe?.trim()) return m.bioDe
    return m.bioFr || ""
  }

  const leadershipList = members.filter((m) => m.category === "DIRECTION")
  const coordinationList = members.filter((m) => m.category === "COORDINATION" || m.category === "FORMATION")
  const advisoryList = members.filter((m) => m.category === "CONSEIL" || m.category === "VOLONTAIRE")

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="team" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero Header ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-[#003366] mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#28A745]" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Content Container ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16 sm:space-y-20">
          {/* ── Direction & Fondateurs ── */}
          {leadershipList.length > 0 && (
            <section>
              <div className="border-b border-slate-200 pb-3 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-4 bg-[#28A745] rounded-full" />
                  <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#003366] uppercase">
                    {t.leadershipSectionTitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.leadershipSectionSubtitle}
                </p>
              </div>

              <div className="space-y-6">
                {leadershipList.map((m) => {
                  const skills = parseSkills(m.skills)
                  const bio = getBio(m)
                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-8"
                    >
                      <MemberAvatar
                        initials={getInitials(m.name)}
                        photoUrl={m.photoUrl}
                        name={m.name}
                        size="large"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="mb-3">
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#142332] tracking-tight">
                            {m.name}
                          </h3>
                          <p className="text-sm sm:text-base font-semibold text-[#007BFF] mt-0.5">
                            {getRole(m)}
                          </p>
                        </div>

                        {bio && (
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-3xl">
                            {bio}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-xs font-medium px-3 py-1 rounded-md bg-[#F7F8FA] border border-slate-200/80 text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {m.email && (
                            <a
                              href={`mailto:${m.email}`}
                              className="inline-flex items-center gap-2 text-xs font-semibold text-[#003366] hover:text-[#007BFF] transition-colors"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{m.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Coordination & Expertise ── */}
          {coordinationList.length > 0 && (
            <section>
              <div className="border-b border-slate-200 pb-3 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-4 bg-[#28A745] rounded-full" />
                  <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#003366] uppercase">
                    {t.coordinationSectionTitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.coordinationSectionSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {coordinationList.map((m) => {
                  const skills = parseSkills(m.skills)
                  const bio = getBio(m)
                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4 sm:gap-5 mb-5">
                          <MemberAvatar
                            initials={getInitials(m.name)}
                            photoUrl={m.photoUrl}
                            name={m.name}
                            size="normal"
                          />
                          <div className="min-w-0 pt-1">
                            <h3 className="text-lg sm:text-xl font-bold text-[#142332] leading-snug">
                              {m.name}
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-[#007BFF] mt-1">
                              {getRole(m)}
                            </p>
                          </div>
                        </div>

                        {bio && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                            {bio}
                          </p>
                        )}
                      </div>

                      <div>
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#F7F8FA] border border-slate-200/80 text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {m.email && (
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <a
                              href={`mailto:${m.email}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] hover:text-[#007BFF] transition-colors"
                            >
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{m.email}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Conseil & Volontaires ── */}
          {advisoryList.length > 0 && (
            <section>
              <div className="border-b border-slate-200 pb-3 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-4 bg-[#28A745] rounded-full" />
                  <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#003366] uppercase">
                    {t.advisorySectionTitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.advisorySectionSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {advisoryList.map((m) => {
                  const skills = parseSkills(m.skills)
                  const bio = getBio(m)
                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4 sm:gap-5 mb-5">
                          <MemberAvatar
                            initials={getInitials(m.name)}
                            photoUrl={m.photoUrl}
                            name={m.name}
                            size="normal"
                          />
                          <div className="min-w-0 pt-1">
                            <h3 className="text-lg sm:text-xl font-bold text-[#142332] leading-snug">
                              {m.name}
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-[#007BFF] mt-1">
                              {getRole(m)}
                            </p>
                          </div>
                        </div>

                        {bio && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                            {bio}
                          </p>
                        )}
                      </div>

                      <div>
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#F7F8FA] border border-slate-200/80 text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {m.email && (
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <a
                              href={`mailto:${m.email}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] hover:text-[#007BFF] transition-colors"
                            >
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{m.email}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── 3. Light Call to Action Section ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80 bg-[#F7F8FA]">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
              {t.joinTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              {t.joinDesc}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
              <Link
                href={getPageUrl("apply", lang)}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-[#007BFF] text-white hover:bg-[#0066d6] transition-colors shadow-sm"
              >
                {t.joinVolunteer}
              </Link>
              <Link
                href={getPageUrl("membership", lang)}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-[#003366] border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
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
