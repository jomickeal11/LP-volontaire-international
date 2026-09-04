"use client"

import { useState } from "react"
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

export type CandidateStatus =
  | "NEW"
  | "REVIEW"
  | "SELECTED"
  | "INTERVIEW"
  | "CHOSEN"
  | "PARTNER_VALIDATION"
  | "PREPARATION"
  | "ARRIVED"
  | "COMPLETED"
  | "REJECTED"
  | "ARCHIVED"

export const statusColors: Record<
  CandidateStatus,
  { bg: string; text: string; label: string }
> = {
  NEW: { bg: "#E8F2FA", text: "#1B4F7C", label: "NEW" },
  REVIEW: { bg: "#FFF4E5", text: "#B25E09", label: "REVIEW" },
  SELECTED: { bg: "#E6F4EC", text: "#2E7D52", label: "SELECTED" },
  INTERVIEW: { bg: "#F3E8FF", text: "#6B21A8", label: "INTERVIEW" },
  CHOSEN: { bg: "#E0F2FE", text: "#0369A1", label: "CHOSEN" },
  PARTNER_VALIDATION: { bg: "#FEF3C7", text: "#92400E", label: "PARTNER VAL" },
  PREPARATION: { bg: "#FFEDD5", text: "#9A3412", label: "PREPARATION" },
  ARRIVED: { bg: "#ECFCCB", text: "#3F6212", label: "ARRIVED" },
  COMPLETED: { bg: "#F1F5F9", text: "#334155", label: "COMPLETED" },
  REJECTED: { bg: "#FEE2E2", text: "#991B1B", label: "REJECTED" },
  ARCHIVED: { bg: "#F3F4F6", text: "#374151", label: "ARCHIVED" },
}

export interface CandidateUI {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  fieldOfStudy: string
  language: string
  appliedAt: string
  duration: string
  status: CandidateStatus
  skills: string[]
}

interface Props {
  navigate: (p: Page) => void
  onSelectCandidate: (id: string) => void
  applications: CandidateUI[]
  onStatusChange: (id: string, status: CandidateStatus) => void
}

export default function AdminApplications({ navigate, onSelectCandidate, applications, onStatusChange }: Props) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<CandidateStatus | "">("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterDuration, setFilterDuration] = useState("")
  const [sortBy, setSortBy] = useState<"appliedAt" | "lastName" | "status">(
    "appliedAt",
  )
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [exportOpen, setExportOpen] = useState(false)

  const candidates = applications

  const PAGE_SIZE = 6

  const countries = [...new Set(candidates.map((c) => c.country))]

  const filtered = candidates
    .filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        `${c.firstName} ${c.lastName} ${c.email} ${c.country}`
          .toLowerCase()
          .includes(q)
      const matchStatus = !filterStatus || c.status === filterStatus
      const matchCountry = !filterCountry || c.country === filterCountry
      const matchDuration = !filterDuration || c.duration === filterDuration
      return matchSearch && matchStatus && matchCountry && matchDuration
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === "appliedAt") cmp = a.appliedAt.localeCompare(b.appliedAt)
      else if (sortBy === "lastName") cmp = a.lastName.localeCompare(b.lastName)
      else if (sortBy === "status")
        cmp =
          STATUS_WORKFLOW.indexOf(a.status) - STATUS_WORKFLOW.indexOf(b.status)
      return sortDir === "asc" ? cmp : -cmp
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortBy(key)
      setSortDir("desc")
    }
  }

  const toggleSelect = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )

  const toggleAll = () =>
    setSelected(
      selected.length === paginated.length ? [] : paginated.map((c) => c.id),
    )

  const changeStatus = (id: string, status: CandidateStatus) => {
    onStatusChange(id, status)
  }

  const handleExportCSV = () => {
    const headers = "ID,Prénom,Nom,Email,Pays,Filière,Statut,Durée,Date\n"
    const rows = candidates
      .map(
        (c) =>
          `"${c.id}","${c.firstName}","${c.lastName}","${c.email}","${c.country}","${c.fieldOfStudy}","${c.status}","${c.duration}","${c.appliedAt}"`,
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `candidatures_apticr_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  const SortIcon = ({ field }: { field: typeof sortBy }) => (
    <span style={{ color: sortBy === field ? BLUE : "#D1DCE5" }}>
      {sortBy === field && sortDir === "asc" ? " ↑" : " ↓"}
    </span>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl" style={{ color: TEXT_DARK }}>
            Applications
          </h1>
          <p className="text-sm" style={{ color: TEXT_MID }}>
            {filtered.length} candidate{filtered.length !== 1 ? "s" : ""} ·{" "}
            {candidates.length} total
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selected.length > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "#E8F2FA", color: BLUE }}
            >
              <span className="font-semibold">{selected.length} selected</span>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: "#fff",
                color: TEXT_MID,
                border: "1.5px solid #D1DCE5",
              }}
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
            {exportOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden shadow-lg bg-white"
                style={{ border: "1px solid #E8ECF2", minWidth: 180 }}
              >
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-slate-50 text-slate-800"
                >
                  📄 Télécharger en CSV
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-slate-50 text-slate-800 border-t border-slate-100"
                >
                  📊 Télécharger pour Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div
        className="bg-white rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center"
        style={{ border: "1.5px solid #E8ECF2" }}
      >
        <div className="flex-1 min-w-52 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#9AA8B4" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, country..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              border: "1.5px solid #D1DCE5",
              backgroundColor: BG,
              color: TEXT_DARK,
            }}
            onFocus={(e) =>
              (e.currentTarget.style.border = `1.5px solid ${BLUE}`)
            }
            onBlur={(e) =>
              (e.currentTarget.style.border = "1.5px solid #D1DCE5")
            }
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as CandidateStatus | "")
            setPage(1)
          }}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            border: "1.5px solid #D1DCE5",
            backgroundColor: BG,
            color: TEXT_DARK,
          }}
        >
          <option value="">All statuses</option>
          {STATUS_WORKFLOW.map((s) => (
            <option key={s} value={s}>
              {statusColors[s].label}
            </option>
          ))}
        </select>

        <select
          value={filterCountry}
          onChange={(e) => {
            setFilterCountry(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            border: "1.5px solid #D1DCE5",
            backgroundColor: BG,
            color: TEXT_DARK,
          }}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filterDuration}
          onChange={(e) => {
            setFilterDuration(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            border: "1.5px solid #D1DCE5",
            backgroundColor: BG,
            color: TEXT_DARK,
          }}
        >
          <option value="">All durations</option>
          <option>6 months</option>
          <option>9 months</option>
          <option>12 months</option>
        </select>

        {(search || filterStatus || filterCountry || filterDuration) && (
          <button
            onClick={() => {
              setSearch("")
              setFilterStatus("")
              setFilterCountry("")
              setFilterDuration("")
              setPage(1)
            }}
            className="text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ color: "#DC2626", backgroundColor: "#FEE2E2" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl overflow-hidden mb-5"
        style={{
          border: "1.5px solid #E8ECF2",
          boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr
                style={{
                  backgroundColor: BG,
                  borderBottom: "1px solid #E8ECF2",
                }}
              >
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleAll}
                    style={{ accentColor: BLUE, width: 15, height: 15 }}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                  style={{ color: "#9AA8B4" }}
                  onClick={() => toggleSort("lastName")}
                >
                  Candidate <SortIcon field="lastName" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#9AA8B4" }}
                >
                  Skills
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                  style={{ color: "#9AA8B4" }}
                  onClick={() => toggleSort("appliedAt")}
                >
                  Applied <SortIcon field="appliedAt" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#9AA8B4" }}
                >
                  Duration
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                  style={{ color: "#9AA8B4" }}
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon field="status" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#9AA8B4" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-10 h-10"
                        style={{ color: "#D1DCE5" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p
                        className="text-sm font-medium"
                        style={{ color: TEXT_MID }}
                      >
                        No applications match your filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {paginated.map((c, i) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  selected={selected.includes(c.id)}
                  onToggle={() => toggleSelect(c.id)}
                  onOpen={() => onSelectCandidate(c.id)}
                  onStatusChange={(s) => changeStatus(c.id, s)}
                  even={i % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid #E8ECF2" }}
          >
            <span className="text-xs" style={{ color: TEXT_MID }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: page === 1 ? "transparent" : BG,
                  color: page === 1 ? "#D1DCE5" : TEXT_MID,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: page === p ? BLUE : "transparent",
                    color: page === p ? "white" : TEXT_MID,
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: page === totalPages ? "transparent" : BG,
                  color: page === totalPages ? "#D1DCE5" : TEXT_MID,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CandidateRow({
  candidate: c,
  selected,
  onToggle,
  onOpen,
  onStatusChange,
  even,
}: {
  candidate: CandidateUI
  selected: boolean
  onToggle: () => void
  onOpen: () => void
  onStatusChange: (s: CandidateStatus) => void
  even: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [statusMenu, setStatusMenu] = useState(false)
  const BLUE = "#1B4F7C"

  const { bg, text, label } = statusColors[c.status]

  return (
    <tr
      style={{
        backgroundColor: selected ? "#E8F2FA" : even ? "#fff" : "#FAFBFC",
        borderBottom: "1px solid #F0F3F7",
      }}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          style={{ accentColor: BLUE, width: 15, height: 15 }}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: BLUE }}
          >
            {c.firstName.charAt(0)}
            {c.lastName.charAt(0)}
          </div>
          <div>
            <button
              onClick={onOpen}
              className="text-sm font-semibold hover:underline text-left"
              style={{ color: "#1A2B3C" }}
            >
              {c.firstName} {c.lastName}
            </button>
            <div
              className="text-xs flex items-center gap-1"
              style={{ color: "#9AA8B4" }}
            >
              <span>{c.country}</span>
              <span>·</span>
              <span>{c.language}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {c.skills.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#E8F2FA", color: BLUE }}
            >
              {s}
            </span>
          ))}
          {c.skills.length > 2 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#E8ECF2", color: "#7A8A9A" }}
            >
              +{c.skills.length - 2}
            </span>
          )}
        </div>
      </td>
      <td
        className="px-4 py-3 text-xs"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "#7A8A9A" }}
      >
        {c.appliedAt}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium" style={{ color: "#4A5A6A" }}>
          {c.duration}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="relative inline-block">
          <button
            onClick={() => setStatusMenu(!statusMenu)}
            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md transition-colors"
            style={{ backgroundColor: bg, color: text }}
          >
            {label}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {statusMenu && (
            <div
              className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E8ECF2",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                minWidth: 160,
              }}
            >
              {([
                "NEW",
                "REVIEW",
                "SELECTED",
                "INTERVIEW",
                "CHOSEN",
                "PARTNER_VALIDATION",
                "PREPARATION",
                "ARRIVED",
                "COMPLETED",
              ] as CandidateStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s)
                    setStatusMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F4F6F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: statusColors[s].bg,
                      color: statusColors[s].text,
                    }}
                  >
                    {statusColors[s].label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onOpen}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#9AA8B4" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E8F2FA"
              e.currentTarget.style.color = BLUE
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "#9AA8B4"
            }}
            title="View profile"
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
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#9AA8B4" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E8F2FA"
              e.currentTarget.style.color = BLUE
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "#9AA8B4"
            }}
            title="Send email"
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
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
