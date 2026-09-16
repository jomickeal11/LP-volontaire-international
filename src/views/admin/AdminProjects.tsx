"use client"

import React, { useState, useEffect } from "react"
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
  featured: boolean
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
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    titleFr: "",
    domaineId: "",
    summaryFr: "",
    descriptionFr: "",
    location: "Agbélouvé, Préfecture du Zio",
    country: "Togo",
    status: "IN_PROGRESS",
    beneficiaries: "",
    featured: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const res = await createProject({
        titleFr: formData.titleFr,
        domaineId: formData.domaineId || undefined,
        summaryFr: formData.summaryFr,
        descriptionFr: formData.descriptionFr || formData.summaryFr,
        location: formData.location,
        country: formData.country,
        status: formData.status,
        beneficiaries: formData.beneficiaries || undefined,
        featured: formData.featured,
      })

      if (res.success) {
        setModalOpen(false)
        setFormData({
          titleFr: "",
          domaineId: domaines[0]?.id || "",
          summaryFr: "",
          descriptionFr: "",
          location: "Agbélouvé, Préfecture du Zio",
          country: "Togo",
          status: "IN_PROGRESS",
          beneficiaries: "",
          featured: false,
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
      await updateProject(id, { featured: !current })
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: !current } : p))
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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>🚀</span>
          <span>Nouveau Projet</span>
        </button>
      </div>

      {/* ── Projects Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Titre du Projet</th>
                <th className="py-3.5 px-4">Domaine d&apos;Action</th>
                <th className="py-3.5 px-4">Lieu</th>
                <th className="py-3.5 px-4">Bénéficiaires</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Phare ⭐</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chargement des projets...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun projet enregistré.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
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
                        onClick={() => handleToggleFeatured(proj.id, proj.featured)}
                        className={`text-lg transition-transform ${
                          proj.featured ? "scale-110" : "opacity-30 hover:opacity-100"
                        }`}
                        title={proj.featured ? "Projet mis en avant (Accueil)" : "Mettre en avant"}
                      >
                        ⭐
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(proj.id, proj.titleFr)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold"
                        title="Supprimer le projet"
                      >
                        🗑️
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
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Créer un Nouveau Projet
              </h2>
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

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom / Titre du projet *
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
                    Lieu d&apos;exécution
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Résumé du projet *
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={4}
                  placeholder="Détails techniques, méthodologie et résultats attendus..."
                  value={formData.descriptionFr}
                  onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="feat"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300"
                />
                <label htmlFor="feat" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mettre ce projet en avant sur la page d&apos;accueil (Projet Phare ⭐)
                </label>
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
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors disabled:opacity-50"
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
