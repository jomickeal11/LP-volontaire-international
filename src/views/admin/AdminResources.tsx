"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  getRessources,
  createRessource,
  updateRessource,
  deleteRessource,
  toggleRessourcePublished,
  getDomaines,
} from "@/lib/cms-actions"

interface DomaineItem {
  id: string
  nameFr: string
  slug: string
}

interface RessourceItem {
  id: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  type: string
  year: number
  lang: string
  fileUrl: string
  fileName: string
  fileSizeStr?: string | null
  domaineId?: string | null
  domaine?: {
    id: string
    nameFr: string
    slug: string
  } | null
  downloadCount: number
  published: boolean
  createdAt: Date
}

const RESOURCE_TYPES: Record<string, { label: string; badgeBg: string }> = {
  REPORT: { label: "Rapport", badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
  GUIDE: { label: "Guide", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PROJECT_SHEET: { label: "Projet", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" },
  STATUTE: { label: "Statuts & Juridique", badgeBg: "bg-amber-50 text-amber-800 border-amber-200" },
  OTHER: { label: "Autre", badgeBg: "bg-slate-100 text-slate-700 border-slate-200" },
}

export default function AdminResources() {
  const [resources, setResources] = useState<RessourceItem[]>([])
  const [domaines, setDomaines] = useState<DomaineItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filtres
  const [filterType, setFilterType] = useState<string>("ALL")
  const [filterYear, setFilterYear] = useState<string>("ALL")
  const [search, setSearch] = useState<string>("")

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Upload PDF
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement | null>(null)

  // Form State
  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "REPORT",
    customType: "",
    year: currentYear,
    domaineId: "",
    fileUrl: "",
    fileName: "",
    fileSizeStr: "",
    lang: "FR",
    published: true,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [items, doms] = await Promise.all([
        getRessources({ publishedOnly: false }),
        getDomaines({ activeOnly: false }),
      ])
      setResources(items as any)
      setDomaines(doms as any)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPdf(true)
    setError("")

    try {
      const data = new FormData()
      data.append("file", file)

      const response = await fetch("/api/upload/resource-pdf", {
        method: "POST",
        body: data,
      })
      const result = await response.json()

      if (result.success && result.url) {
        setFormData((prev) => ({
          ...prev,
          fileUrl: result.url,
          fileName: result.fileName,
          fileSizeStr: result.fileSizeStr,
          // Remplir automatiquement le titre si vide
          title: prev.title || result.fileName.replace(/\.pdf$/i, "").replace(/[_-]/g, " "),
        }))
      } else {
        setError(result.error || "Erreur lors du téléversement du PDF.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau lors de l'envoi du fichier.")
    } finally {
      setUploadingPdf(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ""
    }
  }

  const handleOpenModal = (res?: RessourceItem) => {
    setError("")
    if (res) {
      setEditingId(res.id)
      const standardTypes = ["REPORT", "GUIDE", "PROJECT_SHEET", "STATUTE"]
      const isCustom = res.type && !standardTypes.includes(res.type)
      setFormData({
        title: res.titleFr,
        description: res.descriptionFr || "",
        type: isCustom ? "OTHER" : (res.type || "REPORT"),
        customType: isCustom ? res.type : "",
        year: res.year || currentYear,
        domaineId: res.domaineId || "",
        fileUrl: res.fileUrl || "",
        fileName: res.fileName || "",
        fileSizeStr: res.fileSizeStr || "",
        lang: res.lang || "FR",
        published: res.published,
      })
    } else {
      setEditingId(null)
      setFormData({
        title: "",
        description: "",
        type: "REPORT",
        customType: "",
        year: currentYear,
        domaineId: "",
        fileUrl: "",
        fileName: "",
        fileSizeStr: "",
        lang: "FR",
        published: true,
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Veuillez renseigner un titre pour la ressource.")
      return
    }

    if (!formData.fileUrl.trim()) {
      setError("Veuillez téléverser un fichier PDF officiel.")
      return
    }

    const finalType = formData.type === "OTHER"
      ? (formData.customType.trim() || "Autre")
      : formData.type

    setSubmitting(true)
    try {
      if (editingId) {
        const res = await updateRessource(editingId, {
          title: formData.title,
          description: formData.description,
          type: finalType,
          year: Number(formData.year),
          domaineId: formData.domaineId || null,
          fileUrl: formData.fileUrl,
          fileName: formData.fileName,
          fileSizeStr: formData.fileSizeStr,
          lang: formData.lang,
          published: formData.published,
        })
        if (res.success) {
          setFeedbackMessage("Ressource modifiée avec succès.")
          handleCloseModal()
          await loadData()
        } else {
          setError(res.error || "Erreur lors de la modification.")
        }
      } else {
        const res = await createRessource({
          title: formData.title,
          description: formData.description,
          type: finalType,
          year: Number(formData.year),
          domaineId: formData.domaineId || null,
          fileUrl: formData.fileUrl,
          fileName: formData.fileName,
          fileSizeStr: formData.fileSizeStr,
          lang: formData.lang,
          published: formData.published,
        })
        if (res.success) {
          setFeedbackMessage("Ressource ajoutée avec succès.")
          handleCloseModal()
          await loadData()
        } else {
          setError(res.error || "Erreur lors de l'enregistrement.")
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleRessourcePublished(id, !currentStatus)
      if (res.success) {
        setResources((prev) =>
          prev.map((r) => (r.id === id ? { ...r, published: !currentStatus } : r))
        )
        setFeedbackMessage(res.message || "Statut mis à jour.")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la ressource « ${title} » ?`)) {
      try {
        const res = await deleteRessource(id)
        if (res.success) {
          setResources((prev) => prev.filter((r) => r.id !== id))
          setFeedbackMessage("Ressource supprimée.")
        } else {
          alert(res.error)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  // Filtrage
  const filteredResources = resources.filter((res) => {
    if (filterType !== "ALL" && res.type !== filterType) return false
    if (filterYear !== "ALL" && res.year.toString() !== filterYear) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchTitle = res.titleFr.toLowerCase().includes(q)
      const matchDesc = res.descriptionFr?.toLowerCase().includes(q) || false
      const matchDomaine = res.domaine?.nameFr.toLowerCase().includes(q) || false
      if (!matchTitle && !matchDesc && !matchDomaine) return false
    }
    return true
  })

  // Années distinctes
  const years = Array.from(new Set(resources.map((r) => r.year))).sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      {/* ── En-tête Back-office ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#003366]">
            Ressources
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestion des rapports, guides, fiches projets et documents officiels téléchargeables par le public.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#003366] hover:bg-[#002244] shadow-sm transition-all text-xs cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajouter une ressource</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* ── Filtres & Recherche ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <input
            type="text"
            placeholder="Rechercher par titre, description, domaine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] bg-slate-50/50"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
        >
          <option value="ALL">Tous les types</option>
          {Object.entries(RESOURCE_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
        >
          <option value="ALL">Toutes les années</option>
          {years.map((y) => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>

        {(search || filterType !== "ALL" || filterYear !== "ALL") && (
          <button
            onClick={() => {
              setSearch("")
              setFilterType("ALL")
              setFilterYear("ALL")
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* ── Tableau des Ressources ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Titre</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Année</th>
                <th className="py-3.5 px-4">Domaine</th>
                <th className="py-3.5 px-4">Langue</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chargement des ressources...
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">Aucune ressource trouvée.</p>
                    <p className="text-xs text-slate-400 mt-1">Cliquez sur « Ajouter une ressource » pour téléverser votre premier document.</p>
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => {
                  const typeCfg = RESOURCE_TYPES[res.type] || RESOURCE_TYPES.OTHER
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div
                          className="font-semibold text-slate-900 hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                          onClick={() => handleOpenModal(res)}
                        >
                          {res.titleFr}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{res.fileName}</span>
                          {res.fileSizeStr && (
                            <>
                              <span>·</span>
                              <span>{res.fileSizeStr}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeCfg.badgeBg}`}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                        {res.year}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#174F7A]">
                        {res.domaine?.nameFr || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-600">
                        {res.lang}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(res.id, res.published)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            res.published
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {res.published ? "✓ Publié" : "Brouillon"}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={res.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={res.fileName}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#007BFF] hover:bg-blue-50 transition-colors"
                            title="Télécharger / Ouvrir le fichier PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                          <button
                            onClick={() => handleOpenModal(res)}
                            className="px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 text-xs font-semibold transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(res.id, res.titleFr)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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

      {/* ── Modal d'Ajout / Modification ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Modifier la ressource" : "Ajouter une ressource"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez les métadonnées et le fichier PDF officiel.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre du document *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rapport d'activité 2025, Guide du volontaire..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Courte description ou synthèse du contenu du document..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366]"
                />
              </div>

              {/* Type & Année */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Type de document *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366] bg-white font-medium"
                  >
                    <option value="REPORT">Rapport</option>
                    <option value="GUIDE">Guide</option>
                    <option value="PROJECT_SHEET">Projet</option>
                    <option value="STATUTE">Statuts & Juridique</option>
                    <option value="OTHER">Autre</option>
                  </select>
                  {formData.type === "OTHER" && (
                    <input
                      type="text"
                      placeholder="Précisez le type (ex: Communiqué, Étude, Brochure...)"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366] bg-white animate-fadeIn"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Année de publication *
                  </label>
                  <input
                    type="number"
                    required
                    min={2015}
                    max={2035}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366]"
                  />
                </div>
              </div>

              {/* Domaine & Langue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Domaine associé
                  </label>
                  <select
                    value={formData.domaineId}
                    onChange={(e) => setFormData({ ...formData, domaineId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366] bg-white font-medium"
                  >
                    <option value="">Aucun domaine particulier</option>
                    {domaines.map((d) => (
                      <option key={d.id} value={d.id}>{d.nameFr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Langue du document *
                  </label>
                  <select
                    value={formData.lang}
                    onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#003366] bg-white font-medium"
                  >
                    <option value="FR">Français (FR)</option>
                    <option value="EN">Anglais (EN)</option>
                    <option value="DE">Allemand (DE)</option>
                  </select>
                </div>
              </div>

              {/* Fichier PDF */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fichier PDF officiel *
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="resource-pdf-upload"
                  />
                  {formData.fileUrl ? (
                    <div className="flex items-center justify-between gap-3 text-left bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{formData.fileName}</p>
                          <p className="text-[11px] text-slate-400">{formData.fileSizeStr || "Fichier prêt"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="resource-pdf-upload"
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                        >
                          Remplacer
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">
                        Sélectionnez le document PDF officiel
                      </p>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Format PDF jusqu'à 50 Mo. Le fichier est conservé exactement à l'identique.
                      </p>
                      <label
                        htmlFor="resource-pdf-upload"
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] cursor-pointer transition-colors ${
                          uploadingPdf ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        {uploadingPdf ? "Téléversement..." : "Parcourir les fichiers..."}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Publié / Brouillon */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-[#003366] accent-[#003366] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Ressource publiée immédiatement
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Si décoché, la ressource est enregistrée en brouillon et non visible côté public.
                    </p>
                  </div>
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingPdf}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter la ressource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
