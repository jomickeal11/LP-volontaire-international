"use client"

import { useState } from "react"
import { adminCreatePartner } from "@/lib/cms-actions"
import type { Page } from "../../types"

export interface PartnerUI {
  id: string
  orgName: string
  country: string
  orgType: string
  website?: string | null
  contactPerson?: string
  volunteerCount?: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  requestsCount: number
}

interface Props {
  partners: PartnerUI[]
  navigate: (p: Page) => void
  onSelectPartner?: (partner: PartnerUI) => void
}

const PAGE_SIZE = 10

export default function AdminPartners({ partners, navigate, onSelectPartner }: Props) {
  const [search, setSearch] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterType, setFilterType] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [orgType, setOrgType] = useState("NGO")

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      orgName: formData.get("orgName") as string,
      country: formData.get("country") as string,
      website: formData.get("website") as string,
      orgType: (formData.get("orgType") === "OTHER" ? formData.get("orgTypeOther") : formData.get("orgType")) as string,
      contactPerson: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") ? `${formData.get("phoneCode")} ${formData.get("phone")}` : "",
      volunteerCount: formData.get("volunteerCount") as string,
      targetCountries: formData.get("targetCountries") as string,
      programme: formData.get("programme") as string,
      message: formData.get("message") as string,
    }
    const res = await adminCreatePartner(data)
    setIsSubmitting(false)
    if (res.success) {
      setSuccess("Partenaire créé avec succès.")
      setTimeout(() => {
        setIsAddModalOpen(false)
        setSuccess("")
        window.location.reload()
      }, 1500)
    } else {
      setError(res.error || "Une erreur est survenue.")
    }
  }



  const countries = [...new Set(partners.map((p) => p.country).filter(Boolean))].sort()
  const types = [...new Set(partners.map((p) => p.orgType).filter(Boolean))].sort()

  const filtered = partners.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      p.orgName.toLowerCase().includes(q) ||
      (p.contactPerson && p.contactPerson.toLowerCase().includes(q)) ||
      p.country.toLowerCase().includes(q)
    const matchCountry = !filterCountry || p.country === filterCountry
    const matchType = !filterType || p.orgType === filterType
    return matchSearch && matchCountry && matchType
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const toggleAll = () =>
    setSelected(selected.length === paginated.length ? [] : paginated.map((p) => p.id))

  const exportCSV = () => {
    const dataToExport = selected.length > 0
      ? filtered.filter((p) => selected.includes(p.id))
      : filtered

    const headers = [
      "Organisation",
      "Site web",
      "Pays",
      "Type d'organisation",
      "Personne de contact",
      "Volontaires potentiels",
      "Date d'ajout",
    ]
    const rows = dataToExport.map((p) => [
      `"${(p.orgName || "").replace(/"/g, '""')}"`,
      `"${(p.website || "").replace(/"/g, '""')}"`,
      `"${(p.country || "").replace(/"/g, '""')}"`,
      `"${(p.orgType || "").replace(/"/g, '""')}"`,
      `"${(p.contactPerson || "").replace(/"/g, '""')}"`,
      `"${(p.volunteerCount ? String(p.volunteerCount) : "").replace(/"/g, '""')}"`,
      `"${(p.createdAt || "").replace(/"/g, '""')}"`,
    ])
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `partenaires_aptic_${new Date().toISOString().slice(0, 10)}.csv`
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
          <h1 className="text-2xl font-bold tracking-tight text-[#003366]">
            Partenaires
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Répertoire des organisations partenaires d&apos;APTIC-R.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter un partenaire
          </button>
          <button
            onClick={() => navigate("admin-partner-requests")}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border"
            style={{
              backgroundColor: "#E8F2FA",
              color: "#1B4F7C",
              borderColor: "#D1DCE5",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
            </svg>
            Consulter les demandes en attente
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
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
              placeholder="Rechercher une organisation partenaire..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            />
          </div>

          <div className="md:col-span-3">
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

          <div className="md:col-span-3">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
            >
              <option value="">Tous les types ({types.length})</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Partners Table or Clean Zero State */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {partners.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              0 partenaire confirmé actuellement
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Les partenaires confirmés apparaissent ici dès qu&apos;une demande de partenariat est approuvée par l&apos;équipe APTIC-R.
            </p>
            <button
              onClick={() => navigate("admin-partner-requests")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              Gérer les demandes de partenariat
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
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
                  <th className="px-4 py-3.5">Organisation</th>
                  <th className="px-4 py-3.5">Pays</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Volontaires potentiels</th>
                  <th className="px-4 py-3.5">Date d&apos;ajout</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((partner) => {
                  const isChecked = selected.includes(partner.id)
                  return (
                    <tr
                      key={partner.id}
                      onClick={() => toggleSelect(partner.id)}
                      className="transition-colors cursor-pointer select-none"
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
                          onChange={() => toggleSelect(partner.id)}
                          style={{ accentColor: "#1B4F7C", width: 15, height: 15 }}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div
                          className="text-sm font-semibold text-slate-900 hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectPartner && onSelectPartner(partner)
                          }}
                        >
                          {partner.orgName}
                        </div>
                        {partner.website && (
                          <a
                            href={partner.website.startsWith("http") ? partner.website : `https://${partner.website}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-600 hover:underline truncate max-w-[170px] inline-block mt-0.5"
                          >
                            {partner.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{partner.country}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{partner.orgType}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
                        {partner.contactPerson ? (
                          <span
                            className="hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectPartner && onSelectPartner(partner)
                            }}
                          >
                            {partner.contactPerson}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{partner.volunteerCount ? `${partner.volunteerCount} volontaires` : "—"}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {partner.createdAt}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectPartner && onSelectPartner(partner)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#174F7A] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Voir demandes →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination if multiple pages */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} partenaires
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-[#003366]">Ajouter un partenaire (Création Admin)</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{success}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IDENTITÉ */}
                <div className="md:col-span-2"><h3 className="font-bold text-slate-700 border-b pb-1">Identité de l'organisation</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Nom de l'organisation *</label><input required name="orgName" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays *</label><input required name="country" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Site web</label><input name="website" placeholder="https://" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                                    <label className="block text-xs font-semibold mb-1">Type d'organisation</label>
                  <select name="orgType" value={orgType} onChange={(e) => setOrgType(e.target.value)} className="w-full border rounded p-2 text-sm mb-2">
                    <option value="NGO">ONG / Association</option>
                    <option value="UNIVERSITY">Université / École</option>
                    <option value="GOVERNMENT">Institution publique</option>
                    <option value="COMPANY">Entreprise</option>
                    <option value="OTHER">Autre</option>
                  </select>
                  {orgType === "OTHER" && (
                    <input name="orgTypeOther" required placeholder="Précisez le type d'organisation..." className="w-full border rounded p-2 text-sm" />
                  )}
                </div>

                {/* CONTACT */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Contact</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Personne de contact *</label><input required name="contactPerson" className="w-full border rounded p-2 text-sm" /></div>
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
                
                {/* PARTENARIAT */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Partenariat</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Volontaires potentiels / an</label><input type="number" name="volunteerCount" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays ciblés</label><input name="targetCountries" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Programme / Financement</label><input name="programme" className="w-full border rounded p-2 text-sm" /></div>
                
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Notes / Message interne</label><textarea name="message" rows={3} className="w-full border rounded p-2 text-sm" placeholder="Création administrative directe..."></textarea></div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg disabled:opacity-50">
                  {isSubmitting ? "Création..." : "Créer le partenaire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
