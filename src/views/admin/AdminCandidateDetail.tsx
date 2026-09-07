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



const BLUE = "#1B4F7C"
const GREEN = "#2E7D52"
const BG = "#F4F6F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"

const STATUS_WORKFLOW: CandidateStatus[] = [
  "NEW",
  "REVIEW",
  "SELECTED",
  "INTERVIEW",
  "CHOSEN",
  "PARTNER_VALIDATION",
  "PREPARATION",
  "ARRIVED",
  "COMPLETED",
]

interface Props {
  candidateId: string
  navigate: (p: Page) => void
  application: any // Using any for fast prototyping, maps to full application record
  onStatusChange?: (id: string, status: CandidateStatus) => void
  onAddNote?: (id: string, note: string) => void
  onDeleteNote?: (id: string) => void
}

export default function AdminCandidateDetail({ navigate, application, onStatusChange, onAddNote, onDeleteNote }: Props) {
  const [candidate, setCandidate] = useState(application)
  const [activeTab, setActiveTab] = useState<"profile" | "dossier">("profile")
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState(candidate.notes || [])
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [status, setStatus] = useState<CandidateStatus>(candidate.status)
  const [confirmStatusChange, setConfirmStatusChange] =
    useState<CandidateStatus | null>(null)

  useEffect(() => {
    setCandidate(application)
    setStatus(application.status)
    setNotes(application.notes || [])
  }, [application])

  const currentStepIndex = STATUS_WORKFLOW.indexOf(status)

  const addNote = () => {
    if (!newNote.trim()) return
    const newNoteObj = {
      id: "temp-" + Date.now(), // Optimistic UI
      content: newNote,
      createdAt: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
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

  const sendEmail = () => {
    setEmailLoading(true)
    setTimeout(() => {
      setEmailLoading(false)
      setEmailSent(true)
      store.addNote(
        candidate.id,
        "Email",
        `Email envoyé : ${emailSubject || "Contact coordination"}`,
      )
    }, 1200)
  }

  return (
    <div className="w-full pb-16">
      {/* Top action bar: Back link */}
      <div className="mb-4">
        <button
          onClick={() => navigate("admin-applications")}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
          style={{ color: "#5E6B76" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#174F7A")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5E6B76")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux candidatures
        </button>
      </div>

      {/* Persistent Candidate Header */}
      <div className="bg-white rounded-xl p-5 sm:p-6 mb-5 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#174F7A" }}>
              {candidate.lastName} {candidate.firstName}
            </h1>
            
            {/* Status selector dropdown */}
            <div className="relative inline-block">
              <select
                value={status}
                onChange={(e) => setConfirmStatusChange(e.target.value as CandidateStatus)}
                className="appearance-none font-bold text-xs pl-3 pr-7 py-1.5 rounded-md cursor-pointer transition-shadow shadow-xs focus:ring-2 focus:ring-blue-500/20"
                style={{
                  backgroundColor: statusColors[status]?.bg || "#EEF5F8",
                  color: statusColors[status]?.text || "#174F7A",
                  border: "1px solid rgba(0,0,0,0.08)"
                }}
              >
                {STATUS_WORKFLOW.map((s) => (
                  <option key={s} value={s}>
                    {statusColors[s]?.label || s}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3" style={{ color: statusColors[status]?.text || "#174F7A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {candidate.reference || candidate.referenceNumber || "APTIC-2026-0001"}
            </span>
            <span>·</span>
            <span>{candidate.country}</span>
            <span>·</span>
            <span>{candidate.language}</span>
            <span>·</span>
            <span>Reçue le {candidate.appliedAt}</span>
          </div>
        </div>

        {/* Right side: Mission info & action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
          <div className="text-xs text-slate-500 flex sm:flex-col gap-4 sm:gap-1">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Arrivée souhaitée : </span>
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-xs"
                style={{ color: "#1A2B3C", border: "1px solid #E2E8F0" }}
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CV
              </a>
            )}

            <button
              onClick={() => setEmailOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-colors shadow-xs cursor-pointer"
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

      {/* Persistent Workflow Bar */}
      <div className="bg-white rounded-xl px-5 py-4 mb-5 shadow-xs border border-slate-100">
        <div className="overflow-x-auto">
          <div className="flex items-center min-w-max py-1 px-1">
            {STATUS_WORKFLOW.map((s, i) => {
              const done = i < currentStepIndex
              const current = i === currentStepIndex
              const sc = statusColors[s] || { label: s }

              let dotBg = "#E2E8F0"
              let textColor = "#94A3B8"

              if (done) {
                dotBg = "#35A85A"
                textColor = "#35A85A"
              } else if (current) {
                dotBg = "#174F7A"
                textColor = "#174F7A"
              }

              return (
                <div key={s} className="flex items-center">
                  <button
                    onClick={() => setConfirmStatusChange(s)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer px-1.5 focus:outline-none"
                    title={`Changer pour : ${sc.label}`}
                  >
                    <div
                      className={`rounded-full transition-all flex items-center justify-center ${
                        current ? "w-4 h-4 ring-4 ring-blue-100" : "w-2.5 h-2.5 group-hover:scale-125"
                      }`}
                      style={{
                        backgroundColor: dotBg,
                      }}
                    >
                      {done && (
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[11px] whitespace-nowrap transition-colors ${
                        current ? "font-bold text-[12px]" : done ? "font-semibold" : "font-medium"
                      }`}
                      style={{ color: textColor }}
                    >
                      {sc.label}
                    </span>
                  </button>

                  {i < STATUS_WORKFLOW.length - 1 && (
                    <div
                      className="h-[2px] w-6 sm:w-9 mx-1 rounded-full transition-colors"
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
      </div>

      {/* 2 Main Tabs: PROFIL / DOSSIER */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === "profile" ? "text-[#174F7A]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          PROFIL
          {activeTab === "profile" && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#174F7A]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("dossier")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === "dossier" ? "text-[#174F7A]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          DOSSIER
          {notes.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
              {notes.length}
            </span>
          )}
          {activeTab === "dossier" && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#174F7A]" />
          )}
        </button>
      </div>

      {/* TAB 1: PROFIL */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl p-7 shadow-xs border border-slate-100 max-w-[1400px]">
          {/* 2 Columns: Informations personnelles & Profil professionnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pb-8 border-b border-slate-100">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
                Informations personnelles
              </h3>
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Nom complet</span>
                  <span className="font-semibold text-slate-800">{candidate.lastName} {candidate.firstName}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Email</span>
                  <a href={`mailto:${candidate.email}`} className="font-semibold text-blue-600 hover:underline break-all">
                    {candidate.email}
                  </a>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Téléphone</span>
                  <span className="font-semibold text-slate-800">{candidate.phone || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Pays</span>
                  <span className="font-semibold text-slate-800">{candidate.country}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Ville</span>
                  <span className="font-semibold text-slate-800">{candidate.city || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Date de naissance</span>
                  <span className="font-semibold text-slate-800">{candidate.dob || "—"}</span>
                </div>
              </div>
            </div>

            {/* Profil professionnel */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
                Profil professionnel
              </h3>
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Formation</span>
                  <span className="font-semibold text-slate-800">{candidate.education || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Domaine d'études</span>
                  <span className="font-semibold text-slate-800">{candidate.fieldOfStudy || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Profession</span>
                  <span className="font-semibold text-slate-800">{candidate.profession || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Expérience</span>
                  <span className="font-semibold text-slate-800">{candidate.experience || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Compétences numériques</span>
                  <span className="font-semibold text-slate-800">{candidate.digitalSkillLevel || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2 Columns: Compétences & Disponibilité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 py-8 border-b border-slate-100">
            {/* Compétences */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map((s: string) => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
                      style={{
                        backgroundColor: "#EEF5F8",
                        color: "#174F7A",
                        borderColor: "#D6E4EE"
                      }}
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Aucune compétence renseignée</span>
                )}
              </div>
            </div>

            {/* Disponibilité */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
                Disponibilité
              </h3>
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Arrivée souhaitée</span>
                  <span className="font-semibold text-slate-800">{candidate.arrivalDate}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Durée</span>
                  <span className="font-semibold text-slate-800">{candidate.duration}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-0.5">Source</span>
                  <span className="font-semibold text-slate-800">{candidate.source || "Non renseignée"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="py-8 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
              Motivation
            </h3>
            <div
              className="pl-4 py-3 pr-4 rounded-r-lg"
              style={{
                backgroundColor: "#F8FAFC",
                borderLeft: "4px solid #35A85A",
              }}
            >
              <p className="text-sm italic leading-relaxed text-slate-700">
                {candidate.motivation ? `« ${candidate.motivation} »` : "Aucun texte de motivation renseigné."}
              </p>
            </div>
          </div>

          {/* Expérience de projet */}
          <div className="pt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
              Expérience de projet
            </h3>
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {candidate.projectExperience || "Aucune expérience de projet détaillée."}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOSSIER */}
      {activeTab === "dossier" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1400px]">
          {/* Left Side (2 cols): Documents & Notes internes */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Documents */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Documents</span>
                <span className="text-[11px] font-normal text-slate-400 lowercase">
                  {candidate.documents ? candidate.documents.length : 0} fichier(s)
                </span>
              </h3>

              <div className="space-y-3">
                {[
                  { type: "CV", label: "CV" },
                  { type: "MOTIVATION_LETTER", label: "Lettre de motivation" },
                  { type: "PORTFOLIO", label: "Portfolio" },
                  { type: "PASSPORT", label: "Pièce d'identité / Passeport" },
                ].map((docType) => {
                  const doc = candidate.documents?.find((d: any) => d.type === docType.type)
                  return (
                    <div
                      key={docType.type}
                      className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          doc ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-slate-800 truncate">{docType.label}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {doc ? doc.name : "Non fourni"}
                          </div>
                        </div>
                      </div>

                      {doc ? (
                        <a
                          href={`/api/documents/${doc.id}`}
                          download
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-colors shadow-2xs"
                        >
                          Télécharger
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 shrink-0 italic pr-1">Non fourni</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Section 2: Notes internes */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Notes internes</span>
                <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {notes.length}
                </span>
              </h3>

              {/* Note input form */}
              <div className="flex flex-col gap-2.5 mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ajouter une observation..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="self-end px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
                  style={{ backgroundColor: "#174F7A" }}
                >
                  Ajouter la note
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Aucune note enregistrée.
                  </p>
                ) : (
                  notes.map((note: any, i: number) => (
                    <div key={note.id || i} className="group relative bg-slate-50/70 p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 pb-1 border-b border-slate-200/50">
                        <span className="font-bold text-slate-700">{note.author}</span>
                        <span className="text-[11px]">{note.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      
                      {note.id && !note.id.toString().startsWith("temp-") && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 bottom-3 text-[10px] font-semibold text-red-500 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded cursor-pointer"
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

          {/* Right Side (1 col): Section 3: Historique */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-100 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 pb-2 border-b border-slate-100">
              Historique
            </h3>

            <div className="flex flex-col pl-1">
              {candidate.statusHistory && candidate.statusHistory.length > 0 ? (
                candidate.statusHistory.map((h: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 ${
                          i === 0 ? "bg-blue-600 ring-2 ring-blue-100" : "bg-emerald-500"
                        }`}
                      />
                      {i < candidate.statusHistory.length - 1 && (
                        <div className="w-[1.5px] bg-slate-200 flex-1 my-1" style={{ minHeight: 32 }} />
                      )}
                    </div>
                    <div className="pb-5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: statusColors[h.status as CandidateStatus]?.bg || "#F1F5F9",
                            color: statusColors[h.status as CandidateStatus]?.text || "#1E293B",
                          }}
                        >
                          {statusColors[h.status as CandidateStatus]?.label || h.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {h.date} {h.by ? `· ${h.by}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Aucun historique disponible.
                </p>
              )}
            </div>
          </div>

        </div>
      )}

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
                  Votre message à {candidate.firstName} a bien été envoyé.
                </p>
                <button
                  onClick={() => {
                    setEmailOpen(false)
                    setEmailSent(false)
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                <div className="flex flex-col gap-3 mb-5">
                  <input
                    type="text"
                    placeholder="Objet de l'email"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-200 outline-none focus:border-blue-500"
                  />
                  <textarea
                    placeholder="Rédigez votre message..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-200 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEmailOpen(false)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={emailLoading || !emailSubject}
                    className="flex-1 py-2.5 text-sm font-bold rounded-lg text-white flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: emailLoading ? "#9AA8B4" : "#174F7A",
                      cursor: emailLoading ? "not-allowed" : "pointer",
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
