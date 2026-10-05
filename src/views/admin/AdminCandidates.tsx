"use client"

import { useState, useEffect } from "react"
import { adminCreateCandidate, getSkills } from "@/lib/cms-actions"
import PhoneInputField from "@/components/PhoneInputField"
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formValues, setFormValues] = useState({ firstName: "", lastName: "", email: "", country: "", dateOfBirth: "" })

  const canSubmitCandidate = !!(
    formValues.firstName.trim() &&
    formValues.lastName.trim() &&
    formValues.email.trim() &&
    formValues.country.trim() &&
    formValues.dateOfBirth.trim()
  )

  const [success, setSuccess] = useState("")
  const [phone, setPhone] = useState("")
    const SKILLS_CATALOGUE = [
    { slug: "computer-science", title: "Informatique" },
    { slug: "data", title: "Données" },
    { slug: "web-development", title: "Développement web" },
    { slug: "mobile-development", title: "Développement mobile" },
    { slug: "project-management", title: "Gestion de projet" },
    { slug: "marketing", title: "Marketing & Communication" },
    { slug: "design", title: "Design & Création" },
    { slug: "administration", title: "Administration & RH" },
    { slug: "finance", title: "Finance & Comptabilité" },
    { slug: "agriculture", title: "Agriculture & Environnement" },
    { slug: "education", title: "Éducation & Formation" },
    { slug: "health", title: "Santé & Social" },
    { slug: "other", title: "Autre" }
  ];

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
      phone: formData.get("phone") as string,
      country: formData.get("country") as string,
      city: formData.get("city") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      education: formData.get("education") as string,
      fieldOfStudy: formData.get("fieldOfStudy") as string,
      profession: formData.get("profession") as string,
      experienceLevel: formData.get("experienceLevel") as string,
      digitalSkillLevel: formData.get("digitalSkillLevel") as string,
      skills: formData.getAll("skills") as string[],
      arrivalDate: formData.get("arrivalDate") as string,
      duration: formData.get("duration") as string,
      motivation: formData.get("motivation") as string,
      projectExperience: formData.get("projectExperience") as string,
      notes: formData.get("notes") as string,
      status: formData.get("status") as string,
    }
    const res = await adminCreateCandidate(data)
    setIsSubmitting(false)
    if (res.success) {
      setSuccess("Candidat créé avec succès.")
      setTimeout(() => {
        setIsAddModalOpen(false)
        setSuccess("")
        window.location.reload()
      }, 1500)
    } else {
      setError(res.error || "Une erreur est survenue.")
    }
  }



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
          <h1 className="text-2xl font-bold tracking-tight text-[#003366]">
            Candidats
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Vivier des candidats retenus et sélectionnés pour les missions APTIC-R.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter un candidat
          </button>
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
          <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                            <div
                              className="font-semibold text-slate-900 hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectCandidate(c)
                              }}
                            >
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-[#003366]">Ajouter un candidat (Création Admin)</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{success}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IDENTITÉ */}
                <div className="md:col-span-2"><h3 className="font-bold text-slate-700 border-b pb-1">Identité</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Prénom *</label><input required name="firstName" className="w-full border rounded p-2 text-sm" value={formValues.firstName} onChange={e => setFormValues(v => ({...v, firstName: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold mb-1">Nom *</label><input required name="lastName" className="w-full border rounded p-2 text-sm" value={formValues.lastName} onChange={e => setFormValues(v => ({...v, lastName: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold mb-1">Email *</label><input required type="email" name="email" className="w-full border rounded p-2 text-sm" value={formValues.email} onChange={e => setFormValues(v => ({...v, email: e.target.value}))} /></div>
                <PhoneInputField label="Téléphone" name="phone" value={phone} onChange={setPhone} size="sm" />
                <div><label className="block text-xs font-semibold mb-1">Date de naissance *</label><input required type="date" name="dateOfBirth" className="w-full border rounded p-2 text-sm" value={formValues.dateOfBirth} onChange={e => setFormValues(v => ({...v, dateOfBirth: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays *</label><input required name="country" className="w-full border rounded p-2 text-sm" value={formValues.country} onChange={e => setFormValues(v => ({...v, country: e.target.value}))} /></div>
                <div><label className="block text-xs font-semibold mb-1">Ville</label><input name="city" className="w-full border rounded p-2 text-sm" /></div>

                {/* PROFIL */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Profil & Compétences</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Niveau d'études</label><input name="education" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Domaine d'études</label><input name="fieldOfStudy" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Profession</label><input name="profession" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Années d'expérience</label>
                  <select name="experienceLevel" className="w-full border rounded p-2 text-sm">
                    <option value="LESS_THAN_1_YEAR">Moins d'un an</option>
                    <option value="ONE_TO_TWO_YEARS">1 à 2 ans</option>
                    <option value="TWO_TO_FIVE_YEARS">2 à 5 ans</option>
                    <option value="FIVE_PLUS_YEARS">Plus de 5 ans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Niveau numérique</label>
                  <select name="digitalSkillLevel" className="w-full border rounded p-2 text-sm">
                    <option value="BEGINNER">Débutant</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Compétences (Domaines)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SKILLS_CATALOGUE.map(skill => (
                        <label key={skill.slug} className="flex items-center gap-2 text-xs">
                          <input type="checkbox" name="skills" value={skill.slug} className="accent-[#174F7A]" />
                          {skill.title}
                        </label>
                      ))}
                  </div>
                </div>

                {/* DISPONIBILITE */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Disponibilité & Mission</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Date de disponibilité</label><input type="date" name="arrivalDate" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Durée souhaitée</label>
                  <select name="duration" className="w-full border rounded p-2 text-sm">
                    <option value="SIX_MONTHS">6 mois</option>
                    <option value="NINE_MONTHS">9 mois</option>
                    <option value="TWELVE_MONTHS">12 mois</option>
                  </select>
                </div>

                {/* MOTIVATION */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Motivation</h3></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Motivation</label><textarea name="motivation" rows={3} className="w-full border rounded p-2 text-sm" placeholder="Création administrative directe..."></textarea></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Expérience de projet</label><textarea name="projectExperience" rows={2} className="w-full border rounded p-2 text-sm"></textarea></div>

                {/* ADMIN */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Informations Admin</h3></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut initial</label>
                  <select name="status" className="w-full border rounded p-2 text-sm">
                      <option value="NEW">Nouvelle</option>
                      <option value="REVIEW">En revue</option>
                      <option value="SELECTED">Pré-sélectionnée</option>
                      <option value="INTERVIEW">Entretien</option>
                      <option value="CHOSEN">Retenue</option>
                      <option value="PARTNER_VALIDATION">Validation partenaire</option>
                      <option value="PREPARATION">Préparation</option>
                      <option value="ARRIVED">Sur le terrain</option>
                      <option value="COMPLETED">Terminée</option>
                      <option value="REJECTED">Refusée</option>
                      <option value="ARCHIVED">Archivée</option>
                    </select>
                </div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Notes internes (visibles uniquement par l'équipe)</label><textarea name="notes" rows={2} className="w-full border rounded p-2 text-sm"></textarea></div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg disabled:opacity-50">
                  {isSubmitting ? "Création..." : "Créer le candidat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
