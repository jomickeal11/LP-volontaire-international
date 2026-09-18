"use client"

import React, { useState, useEffect } from "react"
import type { Language, Page } from "@/types"
import { getMembers, updateMemberStatus } from "@/lib/cms-actions"

interface MemberRecord {
  id: string
  referenceNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  profession?: string | null
  organization?: string | null
  country: string
  city?: string | null
  domainsOfInterest: string
  contributionType: string
  availability: string
  motivation: string
  status: string
  membershipDate?: Date | null
  notes?: string | null
  createdAt: Date
}

interface AdminMembersProps {
  lang?: Language
  navigate?: (page: Page) => void
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "#FEF3C7", text: "#92400E", label: "En attente" },
  APPROVED: { bg: "#DEF7EC", text: "#03543F", label: "Adhérent validé" },
  REJECTED: { bg: "#FDE8E8", text: "#9B1C1C", label: "Refusé" },
  SUSPENDED: { bg: "#E1EFFE", text: "#1E429F", label: "Suspendu" },
  ALUMNI: { bg: "#EDEBFE", text: "#5521B5", label: "Alumni" },
}

export default function AdminMembers({}: AdminMembersProps) {
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getMembers({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search || undefined,
      })
      setMembers(data as any)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id)
    try {
      const res = await updateMemberStatus(id, newStatus)
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        )
        if (selectedMember?.id === id) {
          setSelectedMember((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const parseDomains = (jsonStr: string) => {
    try {
      const arr = JSON.parse(jsonStr)
      return Array.isArray(arr) ? arr : [jsonStr]
    } catch {
      return [jsonStr]
    }
  }

  const exportCSV = () => {
    const headers = [
      "Référence",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Pays",
      "Ville",
      "Profession",
      "Organisation",
      "Contribution",
      "Disponibilité",
      "Statut",
      "Date",
    ]
    const rows = members.map((m) => [
      m.referenceNumber,
      m.lastName,
      m.firstName,
      m.email,
      m.phone || "",
      m.country,
      m.city || "",
      m.profession || "",
      m.organization || "",
      m.contributionType,
      m.availability,
      m.status,
      new Date(m.createdAt).toLocaleDateString("fr-FR"),
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `membres_apticr_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const counts = {
    total: members.length,
    pending: members.filter((m) => m.status === "PENDING").length,
    approved: members.filter((m) => m.status === "APPROVED").length,
    rejected: members.filter((m) => m.status === "REJECTED").length,
  }

  return (
    <div className="space-y-6">
      {/* ── Title & Actions Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Gestion des Membres & Adhésions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez, validez et gérez la communauté des adhérents et bénévoles d&apos;APTIC-R.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>📥</span>
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* ── KPI Stat Cards (Design institutionnel sobre) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Demandes
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">
            {counts.total}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              En Attente
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">
            {counts.pending}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Membres Validés
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">
            {counts.approved}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Refusés
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">
            {counts.rejected}
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
          <input
            type="text"
            placeholder="Rechercher nom, email, pays, réf..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-1 focus:ring-[#174F7A] outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#174F7A] text-white rounded-xl text-sm font-semibold hover:bg-[#123e60] transition-colors"
          >
            Filtrer
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: "Tous" },
            { id: "PENDING", label: "En attente" },
            { id: "APPROVED", label: "Validés" },
            { id: "REJECTED", label: "Refusés" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#174F7A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Members Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4">Adhérent</th>
                <th className="py-3.5 px-4">Pays / Ville</th>
                <th className="py-3.5 px-4">Contribution</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chargement des membres...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun membre trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const sc = STATUS_COLORS[m.status] || STATUS_COLORS.PENDING
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#174F7A]">
                        {m.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {m.firstName} {m.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-medium text-slate-700">{m.country}</span>
                        {m.city && <span className="text-slate-400"> · {m.city}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {m.contributionType}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold inline-block"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                            title="Voir la fiche"
                          >
                            👁️
                          </button>
                          {m.status !== "APPROVED" && (
                            <button
                              disabled={actionLoading === m.id}
                              onClick={() => handleStatusChange(m.id, "APPROVED")}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Valider l'adhésion"
                            >
                              ✓ Valider
                            </button>
                          )}
                          {m.status !== "REJECTED" && (
                            <button
                              disabled={actionLoading === m.id}
                              onClick={() => handleStatusChange(m.id, "REJECTED")}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Refuser"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Member Detail Modal ── */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#174F7A]">
                  {selectedMember.referenceNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <p className="text-xs text-slate-500">{selectedMember.email}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Téléphone</span>
                <span className="font-medium text-slate-700">{selectedMember.phone || "Non renseigné"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Localisation</span>
                <span className="font-medium text-slate-700">{selectedMember.country} ({selectedMember.city || "N/A"})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Profession</span>
                <span className="font-medium text-slate-700">{selectedMember.profession || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Organisation</span>
                <span className="font-medium text-slate-700">{selectedMember.organization || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Contribution souhaitée</span>
                <span className="font-medium text-[#174F7A] font-bold">{selectedMember.contributionType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Disponibilité</span>
                <span className="font-medium text-slate-700">{selectedMember.availability}</span>
              </div>
            </div>

            {/* Domaines */}
            <div>
              <span className="text-xs text-slate-400 block font-semibold mb-2">
                Domaines d&apos;intérêt
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parseDomains(selectedMember.domainsOfInterest).map((d: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Motivation */}
            <div>
              <span className="text-xs text-slate-400 block font-semibold mb-1">
                Motivation exprimée
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedMember.motivation}
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              {selectedMember.status !== "APPROVED" && (
                <button
                  disabled={actionLoading === selectedMember.id}
                  onClick={() => handleStatusChange(selectedMember.id, "APPROVED")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#35A85A] text-white hover:bg-[#2e924e] transition-colors"
                >
                  ✓ Valider comme Adhérent
                </button>
              )}
              {selectedMember.status !== "REJECTED" && (
                <button
                  disabled={actionLoading === selectedMember.id}
                  onClick={() => handleStatusChange(selectedMember.id, "REJECTED")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                >
                  ✕ Rejeter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
