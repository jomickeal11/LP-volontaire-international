"use client"

import React, { useState, useEffect } from "react"
import type { Language, Page } from "@/types"
import { getMembers, updateMemberStatus, adminCreateMember, getSkills } from "@/lib/cms-actions"

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Add Member State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [contributionType, setContributionType] = useState("COMPETENCES")
  const [dbSkills, setDbSkills] = useState<{id: string, slug: string, nameFr: string}[]>([])

  useEffect(() => {
    if (isAddModalOpen && dbSkills.length === 0) {
      getSkills().then(res => {
        if (res.success) setDbSkills(res.skills as any)
      })
    }
  }, [isAddModalOpen])

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") ? `${formData.get("phoneCode")} ${formData.get("phone")}` : "",
      country: formData.get("country") as string,
      city: formData.get("city") as string,
      profession: formData.get("profession") as string,
      organization: formData.get("organization") as string,
      contributionType: (formData.get("contributionType") === "AUTRE" ? formData.get("contributionTypeOther") : formData.get("contributionType")) as string,
      availability: formData.get("availability") as string,
      domainsOfInterest: formData.getAll("domainsOfInterest") as string[],
      motivation: formData.get("motivation") as string,
      membershipStatus: formData.get("membershipStatus") as string,
      notes: formData.get("notes") as string,
    }
    const res = await adminCreateMember(data)
    setIsSubmitting(false)
    if (res.success) {
      setSuccess("Membre créé avec succès.")
      setTimeout(() => {
        setIsAddModalOpen(false)
        setSuccess("")
        window.location.reload()
      }, 1500)
    } else {
      setError(res.error || "Une erreur est survenue.")
    }
  }


  const toggleAll = () => {
    if (selectedIds.size === members.length && members.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

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
    const itemsToExport = selectedIds.size > 0 ? members.filter((m) => selectedIds.has(m.id)) : members
    const rows = itemsToExport.map((m) => [
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
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">
            Gestion des Membres & Adhésions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez, validez et gérez la communauté des adhérents et bénévoles d&apos;APTIC-R.
          </p>
        </div>

        
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Ajouter un membre</span>
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exporter CSV</span>
          </button>
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
            { id: "ALL", label: `Tous (${counts.total})` },
            { id: "PENDING", label: `En attente (${counts.pending})` },
            { id: "APPROVED", label: `Validés (${counts.approved})` },
            { id: "REJECTED", label: `Refusés (${counts.rejected})` },
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
                <th className="py-3.5 px-4 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#174F7A] focus:ring-[#174F7A] accent-[#174F7A] cursor-pointer" checked={members.length > 0 && selectedIds.size === members.length} onChange={toggleAll} />
                </th>
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
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => toggleOne(m.id)}>
                      <td className="py-3.5 px-4 w-12 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#174F7A] focus:ring-[#174F7A] accent-[#174F7A] cursor-pointer" checked={selectedIds.has(m.id)} onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#174F7A]">
                        {m.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          className="font-semibold text-slate-800 hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMember(m)
                          }}
                        >
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
                            onClick={(e) => { e.stopPropagation(); setSelectedMember(m); }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                            title="Voir la fiche"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          {m.status !== "APPROVED" && (
                            <button
                              disabled={actionLoading === m.id}
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(m.id, "APPROVED"); }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Valider l'adhésion"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              <span>Valider</span>
                            </button>
                          )}
                          {m.status !== "REJECTED" && (
                            <button
                              disabled={actionLoading === m.id}
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(m.id, "REJECTED"); }}
                              className="p-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Refuser"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-[#003366]">Ajouter un membre (Création Admin)</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{success}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IDENTITÉ */}
                <div className="md:col-span-2"><h3 className="font-bold text-slate-700 border-b pb-1">Identité</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Prénom *</label><input required name="firstName" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Nom *</label><input required name="lastName" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Email *</label><input required type="email" name="email" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Téléphone</label>
                  <div className="flex gap-2">
                    <select name="phoneCode" className="w-1/3 border rounded p-2 text-sm bg-slate-50">
                      <option value="+33">+33 (FR)</option>
                      <option value="+237">+237 (CM)</option>
                      <option value="+225">+225 (CI)</option>
                      <option value="+221">+221 (SN)</option>
                      <option value="+212">+212 (MA)</option>
                      <option value="+213">+213 (DZ)</option>
                      <option value="+216">+216 (TN)</option>
                      <option value="+241">+241 (GA)</option>
                      <option value="+243">+243 (CD)</option>
                      <option value="+228">+228 (TG)</option>
                      <option value="+229">+229 (BJ)</option>
                      <option value="+226">+226 (BF)</option>
                      <option value="+223">+223 (ML)</option>
                      <option value="+242">+242 (CG)</option>
                      <option value="+32">+32 (BE)</option>
                      <option value="+41">+41 (CH)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                    <input name="phone" type="tel" className="w-2/3 border rounded p-2 text-sm" placeholder="Numéro..." />
                  </div>
                </div>
                <div><label className="block text-xs font-semibold mb-1">Pays *</label><input required name="country" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Ville</label><input name="city" className="w-full border rounded p-2 text-sm" /></div>

                {/* PROFIL */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Profil & Engagement</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Profession</label><input name="profession" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Organisation</label><input name="organization" className="w-full border rounded p-2 text-sm" /></div>
                
                <div>
                                    <label className="block text-xs font-semibold mb-1">Type de contribution</label>
                  <select name="contributionType" value={contributionType} onChange={(e) => setContributionType(e.target.value)} className="w-full border rounded p-2 text-sm mb-2">
                    <option value="COMPETENCES">Mécénat de compétences</option>
                    <option value="FINANCIER">Soutien financier</option>
                    <option value="VOLONTARIAT">Volontariat</option>
                    <option value="RESEAU">Mise en réseau / Apporteur d'affaires</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                  {contributionType === "AUTRE" && (
                    <input name="contributionTypeOther" required placeholder="Précisez le type de contribution..." className="w-full border rounded p-2 text-sm" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Disponibilité</label>
                  <select name="availability" className="w-full border rounded p-2 text-sm">
                    <option value="PONCTUEL">Ponctuelle / À la demande</option>
                    <option value="HEBDOMADAIRE">Quelques heures par semaine</option>
                    <option value="MENSUEL">Quelques heures par mois</option>
                    <option value="TEMPS_PLEIN">Temps plein (missions dédiées)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Domaines d'intérêt</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dbSkills.map(skill => (
                      <label key={skill.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" name="domainsOfInterest" value={skill.nameFr} className="accent-[#174F7A]" />
                        {skill.nameFr}
                      </label>
                    ))}
                  </div>
                </div>

                {/* MOTIVATION */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Motivation & Admin</h3></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Motivation</label><textarea name="motivation" rows={2} className="w-full border rounded p-2 text-sm" placeholder="Création administrative directe..."></textarea></div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut initial</label>
                  <select name="membershipStatus" className="w-full border rounded p-2 text-sm">
                    <option value="APPROVED">Validé (Adhérent)</option>
                    <option value="PENDING">En attente</option>
                    <option value="SUSPENDED">Suspendu</option>
                    <option value="ALUMNI">Alumni</option>
                  </select>
                </div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Notes internes</label><textarea name="notes" rows={2} className="w-full border rounded p-2 text-sm"></textarea></div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg disabled:opacity-50">
                  {isSubmitting ? "Création..." : "Créer le membre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
