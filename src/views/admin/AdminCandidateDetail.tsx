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
}

export default function AdminCandidateDetail({ navigate, application, onStatusChange, onAddNote }: Props) {
  const [candidate, setCandidate] = useState(application)
  const [activeTab, setActiveTab] =
    useState<"profile" | "documents" | "notes" | "history">("profile")
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState(candidate.notes)
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
    setNotes(application.notes)
  }, [application])

  const { bg, text, label } = statusColors[status]
  const currentStepIndex = STATUS_WORKFLOW.indexOf(status)

  const addNote = () => {
    if (!newNote.trim()) return
    if (onAddNote) onAddNote(candidate.id, newNote.trim())
    setNewNote("")
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

  const TABS = [
    { id: "profile" as const, label: "Profile" },
    { id: "documents" as const, label: "Documents" },
    { id: "notes" as const, label: `Notes (${notes.length})` },
    { id: "history" as const, label: "History" },
  ]

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate("admin-applications")}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: TEXT_MID }}
        onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
        onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MID)}
      >
        ← Back to applications
      </button>

      {/* Header card */}
      <div
        className="bg-white rounded-2xl p-6 mb-5 flex flex-col sm:flex-row sm:items-start gap-4"
        style={{
          border: "1.5px solid #E8ECF2",
          boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: BLUE }}
        >
          {candidate.firstName.charAt(0)}
          {candidate.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="text-2xl" style={{ color: TEXT_DARK }}>
              {candidate.firstName} {candidate.lastName}
            </h1>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg self-center"
              style={{ backgroundColor: bg, color: text }}
            >
              {label}
            </span>
          </div>
          <div
            className="flex flex-wrap gap-3 text-sm mb-3"
            style={{ color: TEXT_MID }}
          >
            <span>
              📍 {candidate.city}, {candidate.country}
            </span>
            <span>✉️ {candidate.email}</span>
            <span>📱 {candidate.phone}</span>
            <span>🌐 {candidate.language}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s: string) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-md font-medium"
                style={{ backgroundColor: "#E8F2FA", color: BLUE }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-32">
          <button
            onClick={() => setEmailOpen(true)}
            className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white"
            style={{ backgroundColor: BLUE }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send email
          </button>
          <button
            className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg"
            style={{
              backgroundColor: BG,
              color: TEXT_MID,
              border: "1.5px solid #D1DCE5",
            }}
          >
            Download CV
          </button>
        </div>
      </div>

      {/* Status workflow */}
      <div
        className="bg-white rounded-xl p-5 mb-5"
        style={{
          border: "1.5px solid #E8ECF2",
          boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
        }}
      >
        <h3 className="text-sm mb-4" style={{ color: TEXT_DARK }}>
          Status workflow
        </h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {STATUS_WORKFLOW.map((s, i) => {
              const done = i <= currentStepIndex
              const current = i === currentStepIndex
              const sc = statusColors[s]
              return (
                <div key={s} className="flex items-center">
                  <button
                    onClick={() => setConfirmStatusChange(s)}
                    className="flex flex-col items-center gap-1.5 px-2"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        backgroundColor: current
                          ? BLUE
                          : done
                            ? "#E8F2FA"
                            : "#F4F6F9",
                        color: current ? "#fff" : done ? BLUE : "#D1DCE5",
                        border: `2px solid ${
                          current ? BLUE : done ? BLUE + "40" : "#E8ECF2"
                        }`,
                        boxShadow: current ? `0 0 0 3px ${BLUE}20` : "none",
                      }}
                    >
                      {done && !current ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-xs font-medium whitespace-nowrap"
                      style={{
                        color: current ? BLUE : done ? "#4A5A6A" : "#D1DCE5",
                      }}
                    >
                      {sc.label}
                    </span>
                  </button>
                  {i < STATUS_WORKFLOW.length - 1 && (
                    <div
                      className="h-0.5 w-6"
                      style={{
                        backgroundColor:
                          i < currentStepIndex ? BLUE + "40" : "#E8ECF2",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
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
            <h3 className="text-base mb-2" style={{ color: TEXT_DARK }}>
              Change application status?
            </h3>
            <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
              Set{" "}
              <strong>
                {candidate.firstName} {candidate.lastName}
              </strong>
              's status to{" "}
              <span
                className="font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: statusColors[confirmStatusChange].bg,
                  color: statusColors[confirmStatusChange].text,
                }}
              >
                {statusColors[confirmStatusChange].label}
              </span>
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmStatusChange(null)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: BG, color: TEXT_MID }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmStatusChange)
                    handleStatusChange(confirmStatusChange)
                }}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all hover:bg-slate-800"
                style={{ backgroundColor: BLUE }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ backgroundColor: "#E8ECF2" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? BLUE : TEXT_MID,
              boxShadow:
                activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{
          border: "1.5px solid #E8ECF2",
          boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
        }}
      >
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Personal Information",
                fields: [
                  {
                    label: "Full name",
                    value: `${candidate.firstName} ${candidate.lastName}`,
                  },
                  { label: "Email", value: candidate.email },
                  { label: "Phone", value: candidate.phone },
                  {
                    label: "Country / City",
                    value: `${candidate.country}, ${candidate.city}`,
                  },
                  { label: "Date of birth", value: candidate.dob },
                ],
              },
              {
                title: "Professional Profile",
                fields: [
                  { label: "Education", value: candidate.education },
                  { label: "Field of study", value: candidate.fieldOfStudy },
                  { label: "Profession", value: candidate.profession },
                  { label: "Experience", value: candidate.experience },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="text-sm mb-3" style={{ color: TEXT_DARK }}>
                  {section.title}
                </h3>
                <div className="flex flex-col gap-2">
                  {section.fields.map((f) => (
                    <div key={f.label} className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: "#9AA8B4" }}>
                        {f.label}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: TEXT_DARK }}
                      >
                        {f.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="md:col-span-2">
              <h3 className="text-sm mb-2" style={{ color: TEXT_DARK }}>
                Availability
              </h3>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs" style={{ color: "#9AA8B4" }}>
                    Desired arrival
                  </span>
                  <div
                    className="text-sm font-medium"
                    style={{ color: TEXT_DARK }}
                  >
                    {candidate.arrivalDate}
                  </div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#9AA8B4" }}>
                    Duration
                  </span>
                  <div
                    className="text-sm font-medium"
                    style={{ color: TEXT_DARK }}
                  >
                    {candidate.duration}
                  </div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#9AA8B4" }}>
                    Source
                  </span>
                  <div
                    className="text-sm font-medium"
                    style={{ color: TEXT_DARK }}
                  >
                    {candidate.source}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm mb-2" style={{ color: TEXT_DARK }}>
                Motivation
              </h3>
              <p
                className="text-sm leading-relaxed p-4 rounded-lg"
                style={{
                  backgroundColor: BG,
                  color: TEXT_MID,
                  fontStyle: "italic",
                }}
              >
                "{candidate.motivation}"
              </p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm mb-2" style={{ color: TEXT_DARK }}>
                Project experience
              </h3>
              <p
                className="text-sm leading-relaxed p-4 rounded-lg"
                style={{ backgroundColor: BG, color: TEXT_MID }}
              >
                {candidate.projectExperience}
              </p>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="flex flex-col gap-4">
            {[
              {
                name: "CV / Résumé",
                file: `cv_${candidate.lastName.toLowerCase()}.pdf`,
                available: true,
              },
              {
                name: "Cover Letter",
                file: `motivation_${candidate.lastName.toLowerCase()}.pdf`,
                available: true,
              },
              { name: "Portfolio", file: null, available: false },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  border: "1.5px solid #E8ECF2",
                  backgroundColor: doc.available ? "#fff" : BG,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: doc.available ? "#E8F2FA" : "#F4F6F9",
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: doc.available ? BLUE : "#D1DCE5" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: doc.available ? TEXT_DARK : "#D1DCE5" }}
                    >
                      {doc.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: doc.available ? "#9AA8B4" : "#D1DCE5" }}
                    >
                      {doc.available ? doc.file : "Not provided"}
                    </div>
                  </div>
                </div>
                {doc.available && (
                  <div className="flex gap-2">
                    <button
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "#E8F2FA", color: BLUE }}
                    >
                      View
                    </button>
                    <button
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: BG, color: TEXT_MID }}
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <div className="flex flex-col gap-3 mb-5">
              {notes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: "#9AA8B4" }}>
                    No notes yet.
                  </p>
                </div>
              )}
              {notes.map((note: string, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 items-start p-4 rounded-xl"
                  style={{ backgroundColor: BG }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: BLUE }}
                  >
                    AD
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: TEXT_MID }}
                    >
                      Admin · Today
                    </div>
                    <p className="text-sm" style={{ color: TEXT_DARK }}>
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note..."
                rows={2}
                className="flex-1 px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{
                  border: "1.5px solid #D1DCE5",
                  backgroundColor: "#fff",
                  color: TEXT_DARK,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border = `1.5px solid ${BLUE}`)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border = "1.5px solid #D1DCE5")
                }
              />
              <button
                onClick={addNote}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white self-end"
                style={{ backgroundColor: BLUE }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-0">
            {candidate.statusHistory.map(
              (
                h: { status: CandidateStatus; date: string; by: string },
                i: number,
              ) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mt-0.5"
                      style={{
                        backgroundColor:
                          i === candidate.statusHistory.length - 1
                            ? BLUE
                            : "#D1DCE5",
                      }}
                    />
                    {i < candidate.statusHistory.length - 1 && (
                      <div
                        className="w-0.5 flex-1 my-1"
                        style={{ backgroundColor: "#E8ECF2", minHeight: 20 }}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            statusColors[h.status]?.bg || "#EEF1F6",
                          color: statusColors[h.status]?.text || "#4A5A6A",
                        }}
                      >
                        {statusColors[h.status]?.label || h.status}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "#9AA8B4" }}>
                      {h.date} · by {h.by}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

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
                  <svg
                    className="w-7 h-7"
                    style={{ color: GREEN }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-base mb-2" style={{ color: TEXT_DARK }}>
                  Email sent
                </h3>
                <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
                  Your email to {candidate.firstName} has been sent
                  successfully.
                </p>
                <button
                  onClick={() => {
                    setEmailOpen(false)
                    setEmailSent(false)
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-lg"
                  style={{ backgroundColor: BG, color: TEXT_MID }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base mb-1" style={{ color: TEXT_DARK }}>
                  Send email
                </h3>
                <p className="text-sm mb-5" style={{ color: TEXT_MID }}>
                  To:{" "}
                  <strong>
                    {candidate.firstName} {candidate.lastName}
                  </strong>{" "}
                  · {candidate.email}
                </p>
                <div className="flex flex-col gap-3 mb-5">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: "1.5px solid #D1DCE5", color: TEXT_DARK }}
                  />
                  <textarea
                    placeholder="Your message..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ border: "1.5px solid #D1DCE5", color: TEXT_DARK }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEmailOpen(false)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg"
                    style={{ backgroundColor: BG, color: TEXT_MID }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={emailLoading || !emailSubject}
                    className="flex-1 py-2.5 text-sm font-bold rounded-lg text-white flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: emailLoading ? "#9AA8B4" : BLUE,
                      cursor: emailLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {emailLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      "Send"
                    )}
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
