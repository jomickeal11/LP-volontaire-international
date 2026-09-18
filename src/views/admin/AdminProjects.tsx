"use client"

import React, { useState, useEffect, useRef } from "react"
import { getProjects, getDomaines, createProject, deleteProject, updateProject } from "@/lib/cms-actions"

interface ProjectItem {
  id: string
  slug: string
  titleFr: string
  summaryFr: string
  location: string
  country: string
  status: string
  beneficiaries?: string | null
  featuredImage?: string | null
  isFeatured: boolean
  displayOrder: number
  domaine?: {
    id: string
    nameFr: string
  } | null
  createdAt: Date
}

interface DomaineItem {
  id: string
  slug: string
  nameFr: string
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [domaines, setDomaines] = useState<DomaineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    titleFr: "",
    titleEn: "",
    titleDe: "",
    domaineId: "",
    summaryFr: "",
    summaryEn: "",
    summaryDe: "",
    descriptionFr: "",
    descriptionEn: "",
    descriptionDe: "",
    location: "Agbélouvé, Préfecture du Zio",
    country: "Togo",
    status: "IN_PROGRESS",
    beneficiaries: "",
    featuredImage: "",
    isFeatured: false,
    displayOrder: 0,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [projs, doms] = await Promise.all([
        getProjects(),
        getDomaines(),
      ])
      setProjects(projs as any)
      setDomaines(doms as any)
      if (doms.length > 0 && !formData.domaineId) {
        setFormData((prev) => ({ ...prev, domaineId: doms[0].id }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError("")

    try {
      const data = new FormData()
      data.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: data,
      })
      const result = await response.json()

      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, featuredImage: result.url }))
      } else {
        setError(result.error || "Erreur lors du téléversement de l'image.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau")
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titleFr.trim() || !formData.summaryFr.trim()) {
      setError("Le titre et le résumé en français sont obligatoires.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await createProject({
        titleFr: formData.titleFr,
        titleEn: formData.titleEn || undefined,
        titleDe: formData.titleDe || undefined,
        domaineId: formData.domaineId || undefined,
        summaryFr: formData.summaryFr,
        summaryEn: formData.summaryEn || undefined,
        summaryDe: formData.summaryDe || undefined,
        descriptionFr: formData.descriptionFr || formData.summaryFr,
        descriptionEn: formData.descriptionEn || undefined,
        descriptionDe: formData.descriptionDe || undefined,
        location: formData.location,
        country: formData.country,
        status: formData.status,
        beneficiaries: formData.beneficiaries || undefined,
        featuredImage: formData.featuredImage || undefined,
        isFeatured: formData.isFeatured,
        displayOrder: formData.displayOrder,
      })

      if (res.success) {
        setModalOpen(false)
        setActiveLangTab("FR")
        setFormData({
          titleFr: "",
          titleEn: "",
          titleDe: "",
          domaineId: domaines[0]?.id || "",
          summaryFr: "",
          summaryEn: "",
          summaryDe: "",
          descriptionFr: "",
          descriptionEn: "",
          descriptionDe: "",
          location: "Agbélouvé, Préfecture du Zio",
          country: "Togo",
          status: "IN_PROGRESS",
          beneficiaries: "",
          featuredImage: "",
          isFeatured: false,
          displayOrder: 0,
        })
        await loadData()
      } else {
        setError(res.error || "Erreur lors de la création")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer le projet "${title}" ? Cette action est irréversible.`)) {
      return
    }
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateProject(id, { isFeatured: !current })
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: !current } : p))
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            CMS : Projets Institutionnels
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les projets de terrain d&apos;APTIC-R, leurs objectifs, localisations et statuts.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveLangTab("FR")
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouveau Projet</span>
        </button>
      </div>

      {/* ── Projects Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Visuel</th>
                <th className="py-3.5 px-4">Titre du Projet</th>
                <th className="py-3.5 px-4">Domaine d&apos;Action</th>
                <th className="py-3.5 px-4">Lieu</th>
                <th className="py-3.5 px-4">Bénéficiaires</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Phare</th>
                <th className="py-3.5 px-4">Ordre</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Chargement des projets...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Aucun projet enregistré.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      {proj.featuredImage ? (
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proj.featuredImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {proj.titleFr}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#174F7A]">
                      {proj.domaine?.nameFr || "Non rattaché"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {proj.location}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {proj.beneficiaries || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          proj.status === "COMPLETED"
                            ? "bg-slate-100 text-slate-700"
                            : proj.status === "IN_PROGRESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {proj.status === "COMPLETED"
                          ? "Réalisé"
                          : proj.status === "IN_PROGRESS"
                          ? "En cours"
                          : "Planifié"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(proj.id, proj.isFeatured)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          proj.isFeatured
                            ? "bg-amber-50 border-amber-300 text-amber-600"
                            : "bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-500"
                        }`}
                        title={proj.isFeatured ? "Projet mis en avant (Accueil)" : "Mettre en avant"}
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      {proj.displayOrder}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(proj.id, proj.titleFr)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                        title="Supprimer le projet"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Project Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Créer un Nouveau Projet
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez les détails du projet et ses traductions optionnelles.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Language Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Langue :</span>
              <button
                type="button"
                onClick={() => setActiveLangTab("FR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLangTab === "FR"
                    ? "bg-[#003366] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Français *
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab("EN")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLangTab === "EN"
                    ? "bg-[#003366] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                English {formData.titleEn && "✓"}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab("DE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLangTab === "DE"
                    ? "bg-[#003366] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Deutsch {formData.titleDe && "✓"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Multilingual Title */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titre du projet <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Caravane Solaire d'Alphabétisation Numérique"
                    value={formData.titleFr}
                    onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              )}
              {activeLangTab === "EN" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Title (English - Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Solar Caravan for Digital Literacy"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              )}
              {activeLangTab === "DE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Projekttitel (Deutsch - Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Solarkarawane für digitale Bildung"
                    value={formData.titleDe}
                    onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              )}

              {/* General Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Domaine d&apos;intervention
                  </label>
                  <select
                    value={formData.domaineId}
                    onChange={(e) => setFormData({ ...formData, domaineId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none bg-white"
                  >
                    {domaines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Statut du projet
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none bg-white"
                  >
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Réalisé / Terminé</option>
                    <option value="PLANNED">Planifié</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lieu d&apos;exécution <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bénéficiaires estimés
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 500+ collégiens"
                    value={formData.beneficiaries}
                    onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              </div>

              {/* Multilingual Summary */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Résumé du projet <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Résumé percutant des objectifs et actions..."
                    value={formData.summaryFr}
                    onChange={(e) => setFormData({ ...formData, summaryFr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "EN" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Summary (English - Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short summary in English..."
                    value={formData.summaryEn}
                    onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "DE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Projektzusammenfassung (Deutsch - Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Kurze Zusammenfassung auf Deutsch..."
                    value={formData.summaryDe}
                    onChange={(e) => setFormData({ ...formData, summaryDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}

              {/* Multilingual Detailed Description */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description détaillée
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Détails techniques, méthodologie et résultats attendus..."
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "EN" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Description (English - Optionnel)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed description in English..."
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "DE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ausführliche Beschreibung (Deutsch - Optionnel)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ausführliche Beschreibung auf Deutsch..."
                    value={formData.descriptionDe}
                    onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Image illustrative du projet
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{uploadingImage ? "Téléversement..." : "Sélectionner une photo"}</span>
                  </button>

                  {formData.featuredImage && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.featuredImage}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featuredImage: "" })}
                        className="text-xs text-rose-600 hover:underline font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300"
                  />
                  <span>Mettre ce projet en avant (Projet Phare sur l&apos;Accueil)</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <label htmlFor="displayOrder" className="text-xs font-bold text-slate-700">
                    Ordre d&apos;affichage :
                  </label>
                  <input
                    type="number"
                    id="displayOrder"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-[#174F7A] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Enregistrement..." : "Créer le projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

