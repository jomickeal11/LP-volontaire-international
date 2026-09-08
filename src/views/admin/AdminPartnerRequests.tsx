"use client"

import { useState } from "react"
import type { Page } from "../../types"

export type PartnerRequestStatus = "NEW" | "REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"

export const partnerStatusConfig: Record<
  PartnerRequestStatus,
  { bg: string; text: string; label: string; border: string }
> = {
  NEW: { bg: "#E8F2FA", text: "#1B4F7C", label: "Nouvelle", border: "#C5DCED" },
  REVIEW: { bg: "#FFF4E5", text: "#B25E09", label: "En étude", border: "#FED7AA" },
  APPROVED: { bg: "#E6F4EC", text: "#2E7D52", label: "Approuvée", border: "#A7F3D0" },
  REJECTED: { bg: "#FEE2E2", text: "#991B1B", label: "Refusée", border: "#FECACA" },
  ARCHIVED: { bg: "#F3F4F6", text: "#4B5563", label: "Archivée", border: "#E5E7EB" },
}

export interface PartnerRequestUI {
  id: string
  referenceNumber?: string
  orgName: string
  country: string
  website?: string | null
  orgType: string
  contactPerson: string
  email: string
  phone?: string | null
  volunteerCount?: string | null
  targetCountries?: string | null
  programme?: string | null
  message: string
  status: PartnerRequestStatus
  createdAt: string
  documentsCount: number
}

interface Props {
  requests: PartnerRequestUI[]
  navigate: (p: Page) => void
  onSelectRequest: (id: string) => void
  onStatusChange: (id: string, status: PartnerRequestStatus) => void
  initialSearch?: string
}

const PAGE_SIZE = 8

export default function AdminPartnerRequests({
  requests,
  navigate,
  onSelectRequest,
  onStatusChange,
  initialSearch = "",
}: Props) {
  const [search, setSearch] = useState(initialSearch)
  const [filterStatus, setFilterStatus] = useState<PartnerRequestStatus | "">("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterOrgType, setFilterOrgType] = useState("")
  const [sortBy, setSortBy] = useState<"createdAt" | "orgName" | "country">("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const countries = [...new Set(requests.map((r) => r.country).filter(Boolean))].sort()
  const orgTypes = [...new Set(requests.map((r) => r.orgType).filter(Boolean))].sort()

  const filtered = requests
    .filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        r.orgName.toLowerCase().includes(q) ||
        r.contactPerson.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.referenceNumber && r.referenceNumber.toLowerCase().includes(q))
      const matchStatus = !filterStatus || r.status === filterStatus
      const matchCountry = !filterCountry || r.country === filterCountry
      const matchOrgType = !filterOrgType || r.orgType === filterOrgType
      return matchSearch && matchStatus && matchCountry && matchOrgType
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt)
      else if (sortBy === "orgName") cmp = a.orgName.localeCompare(b.orgName)
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
    setSelected(selected.length === paginated.length ? [] : paginated.map((r) => r.id))

  const exportCSV = () => {
    const dataToExport = selected.length > 0
      ? filtered.filter((r) => selected.includes(r.id))
      : filtered

    const headers = [
      "Référence",
      "Organisation",
      "Pays",
      "Type",
      "Contact",
      "Email",
      "Téléphone",
      "Volontaires potentiels",
      "Statut",
      "Date",
    ]
    const rows = dataToExport.map((r) => [
      `"${(r.referenceNumber || r.id || "").replace(/"/g, '""')}"`,
      `"${(r.orgName || "").replace(/"/g, '""')}"`,
      `"${(r.country || "").replace(/"/g, '""')}"`,
      `"${(r.orgType || "").replace(/"/g, '""')}"`,
      `"${(r.contactPerson || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${(r.phone || "").replace(/"/g, '""')}"`,
      `"${(r.volunteerCount ? String(r.volunteerCount) : "").replace(/"/g, '""')}"`,
      `"${(partnerStatusConfig[r.status]?.label || r.status || "").replace(/"/g, '""')}"`,
      `"${(r.createdAt || "").replace(/"/g, '""')}"`,
    ])
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `demandes_partenariat_${new Date().toISOString().slice(0, 10)}.csv`
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
            Demandes de partenariat
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivi et évaluation des organisations souhaitant accueillir ou envoyer des volontaires avec APTIC-R.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
          {/* Search Input */}
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
              placeholder="Rechercher une organisation, contact, email..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A] transition-all"
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

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            >
              <option value="">Tous les statuts</option>
              <option value="NEW">Nouvelle</option>
              <option value="REVIEW">En étude</option>
              <option value="APPROVED">Approuvée</option>
              <option value="REJECTED">Refusée</option>
              <option value="ARCHIVED">Archivée</option>
            </select>
          </div>

          {/* Country Filter */}
          <div className="md:col-span-2">
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            >
              <option value="">Tous les pays</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Org Type Filter */}
          <div className="md:col-span-2">
            <select
              value={filterOrgType}
              onChange={(e) => {
                setFilterOrgType(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            >
              <option value="">Tous les types</option>
              {orgTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick status tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-1">Filtre rapide :</span>
          {(["", "NEW", "REVIEW", "APPROVED", "REJECTED", "ARCHIVED"] as const).map((st) => {
            const count = st ? requests.filter((r) => r.status === st).length : requests.length
            const isSelected = filterStatus === st
            return (
              <button
                key={st || "all"}
                onClick={() => {
                  setFilterStatus(st)
                  setPage(1)
                }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#174F7A] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "" ? "Toutes" : partnerStatusConfig[st]?.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                  onClick={() => toggleSort("orgName")}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Organisation
                    {sortBy === "orgName" && (sortDir === "asc" ? " ↑" : " ↓")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("country")}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Pays
                    {sortBy === "country" && (sortDir === "asc" ? " ↑" : " ↓")}
                  </div>
                </th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Type & Volontaires</th>
                <th className="px-4 py-3.5">Statut</th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortBy === "createdAt" && (sortDir === "asc" ? " ↑" : " ↓")}
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm font-medium text-slate-600">Aucune demande trouvée</p>
                      <p className="text-xs text-slate-400 mt-0.5">Essayez de modifier vos filtres ou termes de recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const cfg = partnerStatusConfig[r.status] || partnerStatusConfig.NEW
                  const isChecked = selected.includes(r.id)
                  return (
                    <tr
                      key={r.id}
                      className="transition-colors group cursor-pointer select-none"
                      style={{
                        backgroundColor: isChecked ? "#E8F2FA" : "transparent",
                      }}
                      onClick={() => toggleSelect(r.id)}
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
                          onChange={() => toggleSelect(r.id)}
                          style={{ accentColor: "#1B4F7C", width: 15, height: 15 }}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-[#174F7A] transition-colors">
                          {r.orgName}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {r.referenceNumber && (
                            <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">
                              {r.referenceNumber}
                            </span>
                          )}
                          {r.website && (
                            <a
                              href={r.website.startsWith("http") ? r.website : `https://${r.website}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 hover:underline truncate max-w-[170px]"
                            >
                              {r.website.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
                        {r.country}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium text-slate-900">{r.contactPerson}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{r.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium text-slate-800">{r.orgType}</div>
                        {r.volunteerCount && (
                          <div className="text-xs text-slate-500 mt-0.5">{r.volunteerCount} volontaires</div>
                        )}
                      </td>
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <select
                            value={r.status}
                            onChange={(e) => onStatusChange(r.id, e.target.value as PartnerRequestStatus)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none"
                            style={{
                              backgroundColor: cfg.bg,
                              color: cfg.text,
                              borderColor: cfg.border,
                            }}
                          >
                            <option value="NEW">Nouvelle</option>
                            <option value="REVIEW">En étude</option>
                            <option value="APPROVED">Approuvée</option>
                            <option value="REJECTED">Refusée</option>
                            <option value="ARCHIVED">Archivée</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {r.createdAt}
                      </td>
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectRequest(r.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#174F7A] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Voir détails →
                        </button>
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
              {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} demandes
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
