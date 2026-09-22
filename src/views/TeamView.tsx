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
  initialMembers?: Member[]
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
    emptyTitle: "Aucun membre publié pour le moment",
    emptyDesc: "L'équipe d'APTIC-R est en cours de mise à jour. Revenez très bientôt.",
    errorTitle: "Connexion momentanément indisponible",
    errorDesc: "Impossible de joindre le serveur pour le moment. Veuillez vérifier votre connexion et réessayer.",
    retryButton: "Réessayer",
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
    emptyTitle: "No team members published yet",
    emptyDesc: "The APTIC-R team roster is being updated. Please check back soon.",
    errorTitle: "Connection temporarily unavailable",
    errorDesc: "Unable to reach the server at this time. Please check your network connection and try again.",
    retryButton: "Retry",
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
    emptyTitle: "Derzeit sind keine Teammitglieder veröffentlicht",
    emptyDesc: "Das APTIC-R-Team wird derzeit aktualisiert. Bitte schauen Sie bald wieder vorbei.",
    errorTitle: "Verbindung vorübergehend nicht verfügbar",
    errorDesc: "Der Server konnte nicht erreicht werden. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    retryButton: "Erneut versuchen",
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
    </div>
  )
}

export default function TeamView({ lang, initialMembers }: TeamViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [members, setMembers] = useState<Member[]>(initialMembers || [])
  const [loading, setLoading] = useState(!initialMembers || initialMembers.length === 0)
  const [loadError, setLoadError] = useState(false)

  const reloadMembers = () => {
    setLoading(true)
    setLoadError(false)
    getTeamMembers({ activeOnly: true })
      .then((res) => {
        if (res?.success && Array.isArray(res.members) && res.members.length > 0) {
          setMembers(res.members)
          setLoadError(false)
        } else if (!initialMembers || initialMembers.length === 0) {
          if (res?.error) {
            setLoadError(true)
          } else {
            setMembers(res?.members || [])
          }
        }
      })
      .catch((err) => {
        console.error("Erreur de chargement des membres d'équipe:", err)
        if (!initialMembers || initialMembers.length === 0) {
          setLoadError(true)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!initialMembers || initialMembers.length === 0) {
      reloadMembers()
    }
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

      <main className="flex-1">
        {/* ── 1. Hero Header ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 text-center">
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
          {loading ? (
            <div className="space-y-12 animate-pulse">
              {/* Skeleton Leadership */}
              <div className="space-y-4">
                <div className="h-6 w-48 bg-slate-200 rounded-md" />
                <div className="h-4 w-72 bg-slate-100 rounded-md" />
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-3 w-full">
                    <div className="h-7 w-52 bg-slate-200 rounded-md" />
                    <div className="h-4 w-40 bg-slate-100 rounded-md" />
                    <div className="h-16 w-full bg-slate-100 rounded-md" />
                  </div>
                </div>
              </div>
              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-40 bg-slate-200 rounded-md" />
                        <div className="h-4 w-28 bg-slate-100 rounded-md" />
                      </div>
                    </div>
                    <div className="h-12 w-full bg-slate-100 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ) : loadError && members.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-rose-200 shadow-xs max-w-xl mx-auto my-12">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#003366] mb-2">{t.errorTitle}</h3>
              <p className="text-sm text-slate-500 mb-6">{t.errorDesc}</p>
              <button
                type="button"
                onClick={reloadMembers}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t.retryButton}</span>
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs max-w-xl mx-auto my-12">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#003366] mb-2">{t.emptyTitle}</h3>
              <p className="text-sm text-slate-500">{t.emptyDesc}</p>
            </div>
          ) : (
            <>
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
            </>
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
