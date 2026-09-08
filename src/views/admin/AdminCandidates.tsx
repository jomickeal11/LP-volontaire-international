"use client"

import { useState } from "react"
import type { Page } from "../../types"
import { statusColors, type CandidateStatus } from "./AdminApplications"

export interface CandidateDirectoryItemUI {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  country: string
  city?: string | null
  dateOfBirth?: string | null
  age?: number | null
  createdAt: string
  applicationsCount: number
  latestApplicationId?: string | null
  latestStatus?: CandidateStatus | null
  latestFieldOfStudy?: string | null
  skills: string[]
}

interface Props {
  candidates: CandidateDirectoryItemUI[]
  navigate: (p: Page) => void
  onSelectCandidate: (candidate: CandidateDirectoryItemUI) => void
}

const PAGE_SIZE = 8

export default function AdminCandidates({
  candidates,
  navigate,
  onSelectCandidate,
}: Props) {
  const [search, setSearch] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterSkill, setFilterSkill] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "country">("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const countries = [...new Set(candidates.map((c) => c.country).filter(Boolean))].sort()
  const allSkills = [
    ...new Set(candidates.flatMap((c) => c.skills).filter(Boolean)),
  ].sort()

  const filtered = candidates
    .filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.latestFieldOfStudy && c.latestFieldOfStudy.toLowerCase().includes(q))

      const matchCountry = !filterCountry || c.country === filterCountry
      const matchSkill = !filterSkill || c.skills.includes(filterSkill)

      return matchSearch && matchCountry && matchSkill
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt)
      else if (sortBy === "name")
        cmp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
      else if (sortBy === "country") cmp = a.country.localeCompare(b.country)
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
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const toggleAll = () =>
    setSelected(selected.length === paginated.length ? [] : paginated.map((c) => c.id))

  const exportCSV = () => {
    const dataToExport = selected.length > 0
      ? filtered.filter((c) => selected.includes(c.id))
      : filtered

    const headers = [
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Pays",
      "Ville",
      "Domaine d'études",
      "Dossiers",
      "Date d'inscription",
    ]
    const rows = dataToExport.map((c) => [
      `"${(c.firstName || "").replace(/"/g, '""')}"`,
      `"${(c.lastName || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.country || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${(c.latestFieldOfStudy || "").replace(/"/g, '""')}"`,
      c.applicationsCount,
      `"${(c.createdAt || "").replace(/"/g, '""')}"`,
    ])

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `candidats_aptic_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Candidats
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Vivier des candidats retenus et sélectionnés pour les missions APTIC-R.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("admin-applications")}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Voir les dossiers de candidature
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter en CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher par nom, prénom, email, ville..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Country Filter */}
          <div className="md:col-span-4">
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            >
              <option value="">Tous les pays ({countries.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="md:col-span-3">
            <select
              value={filterSkill}
              onChange={(e) => {
                setFilterSkill(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            >
              <option value="">Toutes les compétences</option>
              {allSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selected.length === paginated.length}
                    onChange={toggleAll}
                    style={{ accentColor: "#1B4F7C", width: 15, height: 15 }}
                  />
                </th>
                <th
                  onClick={() => toggleSort("name")}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Candidat
                    {sortBy === "name" && (sortDir === "asc" ? " ↑" : " ↓")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("country")}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Pays & Ville
                    {sortBy === "country" && (sortDir === "asc" ? " ↑" : " ↓")}
                  </div>
                </th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Spécialité & Compétences</th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Inscrit le
                    {sortBy === "createdAt" && (sortDir === "asc" ? " ↑" : " ↓")}
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-600">Aucun candidat trouvé</p>
                      <p className="text-xs text-slate-400 mt-0.5">Modifiez vos critères de recherche ou de filtre.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const isChecked = selected.includes(c.id)

                  return (
                    <tr
                      key={c.id}
                      onClick={() => toggleSelect(c.id)}
                      className="transition-colors group cursor-pointer select-none"
                      style={{
                        backgroundColor: isChecked ? "#E8F2FA" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) e.currentTarget.style.backgroundColor = "#F4F7FA"
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked) e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <td
                        className="px-4 py-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(c.id)}
                          style={{ accentColor: "#1B4F7C", width: 15, height: 15 }}
                        />
                      </td>

                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#174F7A]/10 text-[#174F7A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {c.firstName.charAt(0)}
                            {c.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-[#174F7A] transition-colors">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {c.applicationsCount} candidature{c.applicationsCount > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{c.country}</div>
                        {c.city && <div className="text-xs text-slate-400">{c.city}</div>}
                      </td>

                      {/* Contact & Phone */}
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-slate-700">{c.email}</div>
                        {c.phone ? (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {c.phone}
                          </div>
                        ) : null}
                      </td>

                      {/* Field of study & skills */}
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-slate-800 truncate max-w-[180px]">
                          {c.latestFieldOfStudy || "Profil généraliste"}
                        </div>
                        {c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.skills.slice(0, 2).map((sk) => (
                              <span
                                key={sk}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                            {c.skills.length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{c.skills.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Registered date */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {c.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {c.latestApplicationId ? (
                          <button
                            onClick={() => onSelectCandidate(c)}
                            className="px-2.5 py-1 text-xs font-medium text-[#174F7A] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            Voir candidatures →
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} candidats
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded text-center font-medium cursor-pointer ${
                    page === i + 1
                      ? "bg-[#174F7A] text-white"
                      : "border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
