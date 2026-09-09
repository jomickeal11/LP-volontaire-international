import { useState, useEffect } from "react"
import {
  getLiveCandidates,
  mapLegacyToStoreStatus,
  statusColors,
  transformRecordToCandidate,
} from "../../data/mockCandidates"
import type { CandidateStatus } from "../../data/mockCandidates"
import { store } from "../../lib/store"
import type { Page } from "../../types"
import { MapPinIcon, MailIcon, PhoneIcon, GlobeIcon, CheckIcon } from "../../components/Icons"
import { useAdminHeader } from "../../lib/AdminHeaderContext"
import { sendCandidateDirectEmail } from "@/lib/actions"

const BLUE = "#1B4F7C"
const GREEN = "#2E7D52"
const BG = "#F4F6F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"

const STATUS_WORKFLOW: CandidateStatus[] = [
  "NEW",
  "REVIEW",
  "INTERVIEW",
  "SELECTED",
  "CHOSEN",
  "PARTNER_VALIDATION",
  "PREPARATION",
  "ARRIVED",
  "COMPLETED",
]

const parseCandidateLanguages = (raw: any): { label: string; level: string }[] => {
  if (!raw) return []
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw
    if (!obj || typeof obj !== "object") return []
    const levelLabels: Record<string, string> = {
      none: "Aucun",
      basic: "Notions",
      intermediate: "Intermédiaire",
      advanced: "Courant",
      native: "Langue maternelle",
    }
    const res: { label: string; level: string }[] = []
    if (obj.french) {
      res.push({ label: "Français", level: levelLabels[obj.french] || obj.french })
    }
    if (obj.english) {
      res.push({ label: "Anglais", level: levelLabels[obj.english] || obj.english })
    }
    if (obj.german && obj.german !== "none") {
      res.push({ label: "Allemand", level: levelLabels[obj.german] || obj.german })
    }
    return res
  } catch {
    return []
  }
}

interface Props {
  candidateId: string
  navigate: (p: Page) => void
  application: any // Using any for fast prototyping, maps to full application record
  locale?: string
  onStatusChange?: (id: string, status: CandidateStatus) => void
  onAddNote?: (id: string, note: string) => void
  onDeleteNote?: (id: string) => void
}

export default function AdminCandidateDetail({ navigate, application, locale = "fr-FR", onStatusChange, onAddNote, onDeleteNote }: Props) {
  const [candidate, setCandidate] = useState(application)
  const [activeTab, setActiveTab] = useState<"profile" | "dossier">("profile")
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState(candidate.notes || [])
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [status, setStatus] = useState<CandidateStatus>(candidate.status)
  const [confirmStatusChange, setConfirmStatusChange] =
    useState<CandidateStatus | null>(null)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const { setBreadcrumb } = useAdminHeader()

  useEffect(() => {
    setCandidate(application)
    setStatus(application.status)
    setNotes(application.notes || [])
  }, [application])

  useEffect(() => {
    setBreadcrumb([
      { label: "Candidatures" },
    ])
    return () => {
      setBreadcrumb([])
    }
  }, [setBreadcrumb])

  const currentStepIndex = STATUS_WORKFLOW.indexOf(status)

  const addNote = () => {
    if (!newNote.trim()) return
    const newNoteObj = {
      id: "temp-" + Date.now(), // Optimistic UI
      content: newNote,
      createdAt: new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
      author: "Admin APTIC-R",
    }
    setNotes([newNoteObj, ...notes])
    if (onAddNote) {
      onAddNote(candidate.id, newNote)
    }
    setNewNote("")
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((n: any) => n.id !== noteId))
    if (onDeleteNote) {
      onDeleteNote(noteId)
    }
  }

  const handleStatusChange = (newStatus: CandidateStatus) => {
    if (onStatusChange) onStatusChange(candidate.id, newStatus)
    setStatus(newStatus)
    setConfirmStatusChange(null)
  }

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return
    setEmailLoading(true)
    setEmailError(null)

    try {
      const res = await sendCandidateDirectEmail({
        candidateId: candidate.id,
        recipientEmail: candidate.email,
        recipientName: `${candidate.firstName} ${candidate.lastName}`,
        subject: emailSubject,
        message: emailBody,
      })

      if (res.success) {
        setEmailLoading(false)
        setEmailSent(true)
        const noteObj = {
          id: "email-" + Date.now(),
          content: `Email envoyé au candidat : « ${emailSubject} »\n${emailBody}`,
          createdAt: new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
          author: "Admin APTIC-R",
        }
        setNotes([noteObj, ...notes])
      } else {
        setEmailLoading(false)
        setEmailError(res.error || "Une erreur est survenue lors de l'envoi de l'email.")
      }
    } catch (err: any) {
      setEmailLoading(false)
      setEmailError(err?.message || "Erreur de communication avec le serveur d'emails.")
    }
  }

  return (
    <div className="w-full pb-16">
      {/* Centered container with max-w-[1200px] for natural body breathing space */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Top action bar: Back link */}
        <div className="mb-3">
          <button
            onClick={() => navigate("admin-applications")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#174F7A] transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Candidatures
          </button>
        </div>

        {/* Compact Persistent Candidate Header: The ONE clean white card */}
        <div className="bg-white rounded-xl px-6 py-4 mb-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#174F7A]">
                {candidate.lastName} {candidate.firstName}
              </h1>
              
              {/* Status selector custom dropdown: Colored badge when closed, clean white menu when opened */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="inline-flex items-center gap-1.5 font-bold text-xs pl-3 pr-2.5 py-1.5 rounded-lg cursor-pointer transition-shadow shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    backgroundColor: statusColors[status]?.bg || "#EEF5F8",
                    color: statusColors[status]?.text || "#174F7A",
                    border: "1px solid rgba(0,0,0,0.08)"
                  }}
                >
                  <span>{statusColors[status]?.label || status}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
                    style={{ color: statusColors[status]?.text || "#174F7A" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu: Clean neutral white surface */}
                {statusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setStatusDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Changer le statut
                      </div>
                      {STATUS_WORKFLOW.map((s) => {
                        const isCurrent = s === status
                        const sc = statusColors[s]
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setStatusDropdownOpen(false)
                              if (s !== status) {
                                setConfirmStatusChange(s)
                              }
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isCurrent ? "bg-slate-50 text-[#174F7A]" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: sc?.text || "#174F7A" }}
                              />
                              {sc?.label || s}
                            </span>
                            {isCurrent && (
                              <svg className="w-3.5 h-3.5 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded text-[11px] text-slate-600 font-semibold">
                {candidate.reference || candidate.referenceNumber || "CAND-2026-0001"}
              </span>
              <span>·</span>
              <span>{candidate.country}</span>
              <span>·</span>
              <span>{candidate.language}</span>
              <span>·</span>
              <span>Reçue le {candidate.appliedAt}</span>
            </div>
          </div>

          {/* Right side: Compact Mission info & action buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-5">
            <div className="text-xs text-slate-500 flex sm:flex-col gap-3 sm:gap-0.5">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Arrivée : </span>
                <span className="font-semibold text-slate-800">{candidate.arrivalDate}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Durée : </span>
                <span className="font-semibold text-slate-800">{candidate.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {candidate.documents?.find((d: any) => d.type === "CV") && (
                <a
                  href={`/api/documents/${candidate.documents.find((d: any) => d.type === "CV").id}`}
                  download
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs border border-slate-200"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CV
                </a>
              )}

              <button
                onClick={() => {
                  setEmailError(null)
                  setEmailSent(false)
                  setEmailOpen(true)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-colors shadow-2xs cursor-pointer"
                style={{ backgroundColor: "#174F7A" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#123d60")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#174F7A")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacter
              </button>
            </div>
          </div>
        </div>

        {/* Single Main White Card: Enclosing Progression all the way down to Expérience / Dossier */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 sm:p-8 mb-8">
          {/* Workflow: Progression du recrutement - Fit 100% inside card without horizontal scroll */}
          <div className="mb-7 pb-6 border-b border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              PROGRESSION DU RECRUTEMENT
            </div>
            
            {/* Fully responsive layout that fits 100% width without scrolling */}
            <div className="w-full flex items-center justify-between">
              {STATUS_WORKFLOW.map((s, i) => {
                const done = i < currentStepIndex
                const current = i === currentStepIndex
                const sc = statusColors[s] || { label: s }

                let dotBg = "#CBD5E1"
                if (done) dotBg = "#35A85A"
                else if (current) dotBg = "#174F7A"

                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => setConfirmStatusChange(s)}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                      title={`Changer pour : ${sc.label}`}
                    >
                      <div
                        className={`rounded-full transition-all flex items-center justify-center shrink-0 ${
                          current
                            ? "w-6 h-6 ring-4 ring-[#174F7A]/20 shadow-xs"
                            : done
                            ? "w-5 h-5 group-hover:scale-110"
                            : "w-4 h-4 group-hover:scale-125"
                        }`}
                        style={{ backgroundColor: dotBg }}
                      >
                        {done && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {current && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-center transition-colors px-0.5 leading-tight ${
                          current
                            ? "text-xs sm:text-[12.5px] font-bold text-[#174F7A]"
                            : done
                            ? "text-[11px] sm:text-xs font-semibold text-[#35A85A]"
                            : "text-[10.5px] sm:text-[11px] text-slate-400 font-medium group-hover:text-slate-600"
                        }`}
                      >
                        {sc.label}
                      </span>
                    </button>

                    {i < STATUS_WORKFLOW.length - 1 && (
                      <div
                        className="h-[2.5px] flex-1 mx-1.5 sm:mx-2.5 rounded-full transition-colors self-center -mt-4.5"
                        style={{
                          backgroundColor: done ? "#35A85A" : "#E2E8F0",
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2 Main Navigation Tabs: Centered and widened Segmented Control with sliding white background */}
          <div className="mb-9 flex justify-center">
            <div className="relative flex w-full max-w-xl p-1 bg-slate-100 rounded-xl border border-slate-200/70 shadow-inner">
              {/* Sliding white background indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-black/5 transition-all duration-300 ease-out ${
                  activeTab === "profile" ? "left-1 translate-x-0" : "left-1 translate-x-full"
                }`}
              />

              {/* Tab: PROFIL */}
              <button
                onClick={() => setActiveTab("profile")}
                className={`relative z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                  activeTab === "profile" ? "text-[#174F7A]" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Profil
              </button>

              {/* Tab: DOSSIER */}
              <button
                onClick={() => setActiveTab("dossier")}
                className={`relative z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer flex items-center gap-2 justify-center ${
                  activeTab === "dossier" ? "text-[#174F7A]" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Dossier
                {notes.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold transition-colors ${
                      activeTab === "dossier" ? "bg-slate-100 text-[#174F7A]" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {notes.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: PROFIL - Editorial layout inside the card with enhanced scale */}
          {activeTab === "profile" && (
            <div>
              {/* Section 1: Informations personnelles & Profil professionnel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 pb-8 mb-8 border-b border-slate-100">
                {/* Colonne Gauche: Informations personnelles */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-5 pb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Informations personnelles
                  </h3>
                  
                  <div className="space-y-3.5 text-sm">
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Prénom</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.firstName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Nom</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.lastName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Email</span>
                      <a href={`mailto:${candidate.email}`} className="col-span-2 font-semibold text-blue-600 hover:underline break-all text-sm">
                        {candidate.email}
                      </a>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Téléphone</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.phone || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Date de naissance</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.dob || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Pays</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.country}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Ville</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.city || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Colonne Droite: Profil professionnel */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-5 pb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Profil professionnel
                  </h3>
                  
                  <div className="space-y-3.5 text-sm">
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Formation</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.education || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Domaine</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.fieldOfStudy || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Profession</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.profession || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Expérience</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.experience || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Niveau num.</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.digitalSkillLevel || "—"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Langues</span>
                      <div className="col-span-2 flex flex-wrap gap-1.5">
                        {(() => {
                          const langs = parseCandidateLanguages(candidate.languages)
                          if (langs.length === 0) {
                            return <span className="text-slate-400 text-sm italic">—</span>
                          }
                          return langs.map((l) => (
                            <span
                              key={l.label}
                              className="text-xs px-2.5 py-1 rounded-md font-semibold bg-[#EAF5ED] text-[#174F7A] border border-[#D8E2E9]"
                            >
                              <strong className="text-slate-800">{l.label} :</strong> {l.level}
                            </span>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Compétences & Disponibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 pb-8 mb-8 border-b border-slate-100">
                {/* Compétences */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Compétences
                  </h3>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.map((s: string) => (
                        <span
                          key={s}
                          className="text-sm px-3 py-1.5 rounded-lg font-semibold bg-slate-50 border border-slate-200 text-[#174F7A]"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">Aucune compétence renseignée</span>
                    )}
                  </div>
                </div>

                {/* Disponibilité */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Disponibilité
                  </h3>
                  <div className="space-y-3.5 text-sm">
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Arrivée</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.arrivalDate}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Durée</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.duration}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-baseline">
                      <span className="text-slate-400 text-[13px]">Source</span>
                      <span className="col-span-2 font-semibold text-slate-800 text-sm">{candidate.source || "Non renseignée"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 & 4: Motivation & Expérience de projet côte à côte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
                {/* Motivation */}
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Motivation
                  </h3>
                  <div className="flex-1 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/70 p-5 rounded-lg border border-slate-100 min-h-[110px] h-auto">
                    {candidate.motivation || "Aucun texte de motivation renseigné."}
                  </div>
                </div>

                {/* Expérience de projet */}
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Expérience de projet
                  </h3>
                  <div className="flex-1 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/70 p-5 rounded-lg border border-slate-100 min-h-[110px] h-auto">
                    {candidate.projectExperience || "Aucune expérience de projet détaillée."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOSSIER - Enhanced Scale & Only Actual Documents */}
          {activeTab === "dossier" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* Left Side (2 cols): Documents & Notes internes */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Section 1: Documents - Show ONLY actual uploaded documents */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                      Documents
                    </span>
                    <span className="text-xs font-normal text-slate-400 lowercase">
                      {candidate.documents ? candidate.documents.length : 0} fichier(s)
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {candidate.documents && candidate.documents.length > 0 ? (
                      candidate.documents.map((doc: any, i: number) => {
                        const typeLabels: Record<string, string> = {
                          CV: "Curriculum Vitae (CV)",
                          MOTIVATION_LETTER: "Lettre de motivation",
                          PORTFOLIO: "Portfolio",
                          PASSPORT: "Pièce d'identité / Passeport",
                        }
                        const label = typeLabels[doc.type] || doc.name || `Document ${i + 1}`

                        return (
                          <div
                            key={doc.id || i}
                            className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-sm font-semibold text-slate-800 truncate">{label}</div>
                                <div className="text-xs text-slate-400 truncate">
                                  {doc.name}
                                </div>
                              </div>
                            </div>

                            <a
                              href={`/api/documents/${doc.id}`}
                              download
                              className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-colors shadow-2xs cursor-pointer"
                            >
                              Télécharger
                            </a>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 text-center">
                        <p className="text-sm text-slate-400 italic">
                          Aucun document n'a été déposé pour cette candidature.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Notes internes */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                      Notes internes
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                      {notes.length}
                    </span>
                  </h3>

                  {/* Note input form */}
                  <div className="flex flex-col gap-2.5 mb-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ajouter une observation ou note interne..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim()}
                      className="self-end px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-40 cursor-pointer shadow-2xs"
                      style={{ backgroundColor: "#174F7A" }}
                    >
                      Ajouter la note
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="text-sm text-slate-400 italic text-center py-3">
                        Aucune note enregistrée.
                      </p>
                    ) : (
                      notes.map((note: any, i: number) => (
                        <div key={note.id || i} className="group relative bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                            <span className="font-bold text-slate-700 text-xs sm:text-[13px]">{note.author}</span>
                            <span className="text-xs">{note.createdAt}</span>
                          </div>
                          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                          
                          {note.id && !note.id.toString().startsWith("temp-") && (
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 bottom-3 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded cursor-pointer"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Side (1 col): Section 3: Historique Timeline - Combined A & B */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174F7A]" />
                    Historique
                  </span>
                  {candidate.statusHistory && candidate.statusHistory.length > 0 && (
                    <span className="text-xs text-slate-400 font-normal">
                      {candidate.statusHistory.length} événement(s)
                    </span>
                  )}
                </h3>

                {/* Option A: Max-height with custom subtle scrollbar */}
                <div className="flex flex-col pl-1 pt-1 max-h-[400px] overflow-y-auto pr-1">
                  {candidate.statusHistory && candidate.statusHistory.length > 0 ? (
                    <>
                      {/* Option B: Slice to 4 items unless showAllHistory is true */}
                      {(showAllHistory
                        ? candidate.statusHistory
                        : candidate.statusHistory.slice(0, 4)
                      ).map((h: any, i: number) => {
                        const totalVisible = showAllHistory
                          ? candidate.statusHistory.length
                          : Math.min(candidate.statusHistory.length, 4)
                        const isLast = i === totalVisible - 1

                        return (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                  i === 0 ? "bg-[#174F7A] ring-2 ring-blue-100" : "bg-[#35A85A]"
                                }`}
                              />
                              {!isLast && (
                                <div className="w-[1.5px] bg-slate-200 flex-1 my-0.5" style={{ minHeight: 28 }} />
                              )}
                            </div>
                            <div className="pb-3.5">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                                  style={{
                                    backgroundColor: statusColors[h.status as CandidateStatus]?.bg || "#F1F5F9",
                                    color: statusColors[h.status as CandidateStatus]?.text || "#1E293B",
                                  }}
                                >
                                  {statusColors[h.status as CandidateStatus]?.label || h.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                {h.date} {h.by ? `· ${h.by}` : ""}
                              </p>
                            </div>
                          </div>
                        )
                      })}

                      {/* Option B: Toggle Button when history has more than 4 items */}
                      {candidate.statusHistory.length > 4 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174F7A] hover:text-[#123d60] bg-blue-50/60 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {showAllHistory ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Réduire l'historique
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Voir les {candidate.statusHistory.length - 4} étapes précédentes
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic text-center py-3">
                      Aucun historique disponible.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm status change modal */}
      {confirmStatusChange && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setConfirmStatusChange(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-2 text-slate-900">
              Changer le statut ?
            </h3>
            <p className="text-sm mb-4 text-slate-600 leading-relaxed">
              Passer la candidature de{" "}
              <strong>
                {candidate.firstName} {candidate.lastName}
              </strong>{" "}
              au statut{" "}
              <span
                className="font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: statusColors[confirmStatusChange]?.bg || "#EEF5F8",
                  color: statusColors[confirmStatusChange]?.text || "#174F7A",
                }}
              >
                {statusColors[confirmStatusChange]?.label || confirmStatusChange}
              </span>{" "}
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmStatusChange(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (confirmStatusChange) handleStatusChange(confirmStatusChange)
                }}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: "#174F7A" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#123d60")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#174F7A")}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email modal */}
      {emailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => {
            setEmailOpen(false)
            setEmailSent(false)
            setEmailError(null)
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {emailSent ? (
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#E6F4EC" }}
                >
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-bold mb-2 text-slate-900">Email envoyé</h3>
                <p className="text-sm mb-4 text-slate-600">
                  Votre message à {candidate.firstName} a bien été envoyé via le service d&apos;email.
                </p>
                <button
                  onClick={() => {
                    setEmailOpen(false)
                    setEmailSent(false)
                    setEmailError(null)
                    setEmailSubject("")
                    setEmailBody("")
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold mb-1 text-slate-900">Envoyer un email</h3>
                <p className="text-xs mb-4 text-slate-500">
                  Destinataire : <strong>{candidate.firstName} {candidate.lastName}</strong> ({candidate.email})
                </p>

                {emailError && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 mb-5">
                  <input
                    type="text"
                    placeholder="Objet de l'email"
                    value={emailSubject}
                    onChange={(e) => {
                      setEmailSubject(e.target.value)
                      if (emailError) setEmailError(null)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-200 outline-none focus:border-blue-500"
                  />
                  <textarea
                    placeholder="Rédigez votre message..."
                    value={emailBody}
                    onChange={(e) => {
                      setEmailBody(e.target.value)
                      if (emailError) setEmailError(null)
                    }}
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-200 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEmailOpen(false)
                      setEmailError(null)
                    }}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={emailLoading || !emailSubject.trim() || !emailBody.trim()}
                    className="flex-1 py-2.5 text-sm font-bold rounded-lg text-white flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: emailLoading || !emailSubject.trim() || !emailBody.trim() ? "#9AA8B4" : "#174F7A",
                      cursor: emailLoading || !emailSubject.trim() || !emailBody.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {emailLoading ? "Envoi en cours..." : "Envoyer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
