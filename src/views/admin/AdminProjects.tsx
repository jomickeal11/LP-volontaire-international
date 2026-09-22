"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { getProjects, getDomaines, createProject, deleteProject, updateProject } from "@/lib/cms-actions"
import { translateCmsFieldsAction } from "@/lib/translator"
import { ExternalLink, Star } from "lucide-react"

interface ProjectItem {
  id: string
  slug: string
  publishedFr: boolean
  publishedEn: boolean
  publishedDe: boolean
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  summaryFr: string
  summaryEn?: string | null
  summaryDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  objectivesFr?: string | null
  objectivesEn?: string | null
  objectivesDe?: string | null
  actionsFr?: string | null
  actionsEn?: string | null
  actionsDe?: string | null
  resultsFr?: string | null
  resultsEn?: string | null
  resultsDe?: string | null
  location: string
  country: string
  status: string
  startDate?: Date | string | null
  endDate?: Date | string | null
  beneficiaries?: string | null
  featuredImage?: string | null
  isFeatured: boolean
  displayOrder: number
  domaineId?: string | null
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translatingField, setTranslatingField] = useState<string | null>(null)
  const [translationNotice, setTranslationNotice] = useState("")
  const [showTranslationHelp, setShowTranslationHelp] = useState(true)
  const [activeLangTab, setActiveLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    publishedFr: true,
    publishedEn: false,
    publishedDe: false,
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
    objectivesFr: "",
    objectivesEn: "",
    objectivesDe: "",
    actionsFr: "",
    actionsEn: "",
    actionsDe: "",
    resultsFr: "",
    resultsEn: "",
    resultsDe: "",
    location: "Agbélouvé, Préfecture du Zio",
    country: "Togo",
    status: "IN_PROGRESS",
    startDate: "",
    endDate: "",
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

  const handleAutoTranslate = async () => {
    if (!formData.titleFr.trim() && !formData.summaryFr.trim()) {
      setError("Veuillez saisir au moins le titre ou le résumé en français avant de traduire.")
      return
    }

    setTranslating(true)
    setError("")
    setTranslationNotice("")

    try {
      const textsToTranslate: Record<string, string> = {
        title: formData.titleFr,
        summary: formData.summaryFr,
      }
      if (formData.descriptionFr) textsToTranslate.description = formData.descriptionFr
      if (formData.objectivesFr) textsToTranslate.objectives = formData.objectivesFr
      if (formData.actionsFr) textsToTranslate.actions = formData.actionsFr
      if (formData.resultsFr) textsToTranslate.results = formData.resultsFr

      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          publishedEn: true,
          publishedDe: true,
          titleEn: res.translations.EN.title || prev.titleEn,
          summaryEn: res.translations.EN.summary || prev.summaryEn,
          descriptionEn: res.translations.EN.description || prev.descriptionEn,
          objectivesEn: res.translations.EN.objectives || prev.objectivesEn,
          actionsEn: res.translations.EN.actions || prev.actionsEn,
          resultsEn: res.translations.EN.results || prev.resultsEn,
          titleDe: res.translations.DE.title || prev.titleDe,
          summaryDe: res.translations.DE.summary || prev.summaryDe,
          descriptionDe: res.translations.DE.description || prev.descriptionDe,
          objectivesDe: res.translations.DE.objectives || prev.objectivesDe,
          actionsDe: res.translations.DE.actions || prev.actionsDe,
          resultsDe: res.translations.DE.results || prev.resultsDe,
        }))
        const providerName = res.providerUsed === "deepl" ? "DeepL API" : "Traducteur automatique"
        setTranslationNotice(`Champs traduits avec succès via ${providerName}. Les versions EN et DE ont été pré-remplies et cochées en publication.`)
      } else {
        setError(res.error || "Erreur lors de la traduction automatique.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion lors de la traduction")
    } finally {
      setTranslating(false)
    }
  }

  const handleTranslateSingleField = async (
    field: "title" | "summary" | "description" | "objectives" | "actions" | "results",
    targetLang: "EN" | "DE"
  ) => {
    const sourceMap: Record<string, string> = {
      title: formData.titleFr,
      summary: formData.summaryFr,
      description: formData.descriptionFr || formData.summaryFr,
      objectives: formData.objectivesFr,
      actions: formData.actionsFr,
      results: formData.resultsFr,
    }
    const sourceText = sourceMap[field]
    if (!sourceText || !sourceText.trim()) {
      setError("Le texte source en français est vide pour ce champ.")
      return
    }

    setTranslatingField(`${field}_${targetLang}`)
    setError("")
    try {
      const res = await translateCmsFieldsAction({
        texts: { [field]: sourceText },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })
      if (res.success && res.translations?.[targetLang]?.[field]) {
        const val = res.translations[targetLang][field]
        const stateKey = targetLang === "EN"
          ? (`${field}En` as keyof typeof formData)
          : (`${field}De` as keyof typeof formData)
        setFormData((prev) => ({ ...prev, [stateKey]: val }))
        setTranslationNotice(`Champ « ${field} » traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"}.`)
      } else {
        setError(res.error || "Erreur lors de la traduction du champ.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.")
    } finally {
      setTranslatingField(null)
    }
  }

  const handleOpenModal = (project?: ProjectItem) => {
    setError("")
    setTranslationNotice("")
    setActiveLangTab("FR")
    if (project) {
      setEditingId(project.id)
      setFormData({
        publishedFr: project.publishedFr ?? true,
        publishedEn: project.publishedEn ?? false,
        publishedDe: project.publishedDe ?? false,
        titleFr: project.titleFr || "",
        titleEn: project.titleEn || "",
        titleDe: project.titleDe || "",
        domaineId: project.domaineId || project.domaine?.id || (domaines[0]?.id || ""),
        summaryFr: project.summaryFr || "",
        summaryEn: project.summaryEn || "",
        summaryDe: project.summaryDe || "",
        descriptionFr: project.descriptionFr || project.summaryFr || "",
        descriptionEn: project.descriptionEn || "",
        descriptionDe: project.descriptionDe || "",
        objectivesFr: project.objectivesFr || "",
        objectivesEn: project.objectivesEn || "",
        objectivesDe: project.objectivesDe || "",
        actionsFr: project.actionsFr || "",
        actionsEn: project.actionsEn || "",
        actionsDe: project.actionsDe || "",
        resultsFr: project.resultsFr || "",
        resultsEn: project.resultsEn || "",
        resultsDe: project.resultsDe || "",
        location: project.location || "Agbélouvé, Préfecture du Zio",
        country: project.country || "Togo",
        status: project.status || "IN_PROGRESS",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
        beneficiaries: project.beneficiaries || "",
        featuredImage: project.featuredImage || "",
        isFeatured: project.isFeatured || false,
        displayOrder: project.displayOrder || 1,
      })
    } else {
      setEditingId(null)
      const maxOrder = projects.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0)
      const nextOrder = maxOrder > 0 ? maxOrder + 1 : projects.length + 1

      setFormData({
        publishedFr: true,
        publishedEn: false,
        publishedDe: false,
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
        objectivesFr: "",
        objectivesEn: "",
        objectivesDe: "",
        actionsFr: "",
        actionsEn: "",
        actionsDe: "",
        resultsFr: "",
        resultsEn: "",
        resultsDe: "",
        location: "Agbélouvé, Préfecture du Zio",
        country: "Togo",
        status: "IN_PROGRESS",
        startDate: "",
        endDate: "",
        beneficiaries: "",
        featuredImage: "",
        isFeatured: false,
        displayOrder: nextOrder,
      })
    }
    setModalOpen(true)
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
      // Détecter si un autre projet a déjà ce même ordre
      const conflictingProject = projects.find(
        (p) => p.displayOrder === Number(formData.displayOrder) && p.id !== editingId
      )

      if (conflictingProject) {
        const nextAvailable = Math.max(...projects.map((p) => p.displayOrder || 0), 0) + 1
        const confirmShift = confirm(
          `Le projet "${conflictingProject.titleFr}" utilise déjà l'ordre d'affichage n°${formData.displayOrder}.\n\nVoulez-vous réattribuer l'ordre ${nextAvailable} au projet existant pour libérer la place ?`
        )
        if (confirmShift) {
          await updateProject(conflictingProject.id, { displayOrder: nextAvailable })
        }
      }

      const payload = {
        publishedFr: formData.publishedFr,
        publishedEn: formData.publishedEn,
        publishedDe: formData.publishedDe,
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
        objectivesFr: formData.objectivesFr || undefined,
        objectivesEn: formData.objectivesEn || undefined,
        objectivesDe: formData.objectivesDe || undefined,
        actionsFr: formData.actionsFr || undefined,
        actionsEn: formData.actionsEn || undefined,
        actionsDe: formData.actionsDe || undefined,
        resultsFr: formData.resultsFr || undefined,
        resultsEn: formData.resultsEn || undefined,
        resultsDe: formData.resultsDe || undefined,
        location: formData.location,
        country: formData.country,
        status: formData.status,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        beneficiaries: formData.beneficiaries || undefined,
        featuredImage: formData.featuredImage || undefined,
        isFeatured: formData.isFeatured,
        displayOrder: Number(formData.displayOrder) || 1,
      }

      const res = editingId
        ? await updateProject(editingId, payload)
        : await createProject(payload)

      if (res.success) {
        setModalOpen(false)
        setEditingId(null)
        setActiveLangTab("FR")
        await loadData()
      } else {
        setError(res.error || (editingId ? "Erreur lors de la mise à jour" : "Erreur lors de la création"))
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
    const newFeaturedState = !current
    setProjects((prev) =>
      prev.map((p) => {
        if (newFeaturedState) {
          return { ...p, isFeatured: p.id === id }
        }
        return p.id === id ? { ...p, isFeatured: false } : p
      })
    )

    try {
      await updateProject(id, { isFeatured: newFeaturedState })
    } catch (e) {
      console.error(e)
      await loadData()
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
            Gérez les fiches projets détaillées, les statuts de publication par langue, objectifs et jalons terrain.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveLangTab("FR")
            setEditingId(null)
            const maxOrder = projects.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0)
            setFormData({
              publishedFr: true,
              publishedEn: false,
              publishedDe: false,
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
              objectivesFr: "",
              objectivesEn: "",
              objectivesDe: "",
              actionsFr: "",
              actionsEn: "",
              actionsDe: "",
              resultsFr: "",
              resultsEn: "",
              resultsDe: "",
              location: "Agbélouvé, Préfecture du Zio",
              country: "Togo",
              status: "IN_PROGRESS",
              startDate: "",
              endDate: "",
              beneficiaries: "",
              featuredImage: "",
              isFeatured: false,
              displayOrder: maxOrder + 1,
            })
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
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
                <th className="py-3.5 px-4">Domaine</th>
                <th className="py-3.5 px-4">Publication</th>
                <th className="py-3.5 px-4">Statut Terrain</th>
                <th className="py-3.5 px-4">Phare</th>
                <th className="py-3.5 px-4">Ordre</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Chargement des projets...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Aucun projet enregistré.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      {proj.featuredImage ? (
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
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
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        {proj.titleFr}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">
                        {proj.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#174F7A]">
                      {proj.domaine?.nameFr || "Non rattaché"}
                    </td>
                    {/* Publication flags */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            proj.publishedFr
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={proj.publishedFr ? "Publié en Français" : "Non publié en Français"}
                        >
                          FR
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            proj.publishedEn
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={proj.publishedEn ? "Publié en Anglais" : "Non publié en Anglais"}
                        >
                          EN
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            proj.publishedDe
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={proj.publishedDe ? "Publié en Allemand" : "Non publié en Allemand"}
                        >
                          DE
                        </span>
                      </div>
                    </td>
                    {/* Operational status */}
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
                    {/* Featured flag */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(proj.id, proj.isFeatured)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          proj.isFeatured
                            ? "bg-amber-50 border-amber-300 text-amber-600 scale-105"
                            : "bg-slate-50 border-slate-200 text-slate-300 hover:text-amber-500 hover:border-amber-200"
                        }`}
                        title={proj.isFeatured ? "Projet mis en avant (Accueil) - Cliquer pour retirer" : "Mettre en avant sur la page d'accueil"}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      {proj.displayOrder}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/fr/projets/${proj.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#007BFF] hover:bg-blue-50 transition-colors"
                          title="Ouvrir la fiche publique"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenModal(proj)}
                          className="px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 text-xs font-semibold transition-colors cursor-pointer"
                          title="Modifier le projet"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id, proj.titleFr)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                          title="Supprimer le projet"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Création / Édition de Projet ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? "Modifier la Fiche Projet" : "Créer un Nouveau Projet"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fiche institutionnelle complète avec objectifs, actions de terrain, résultats et publication multilingue.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Note d'explication sur la séparation stricte et le statut */}
            {showTranslationHelp && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs leading-relaxed space-y-1 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Règles d&apos;étanchéité multilingue et statut</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTranslationHelp(false)}
                    className="text-amber-700 hover:text-amber-950 font-bold p-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
                    title="Masquer cette note"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-amber-800 pr-6">
                  Le statut opérationnel (En cours / Réalisé / Planifié) est distinct de la publication par langue.
                  Pour qu&apos;un projet apparaisse sur <em>/en</em> ou <em>/de</em>, cochez la case de publication correspondante et remplissez les contenus traduits.
                </p>
              </div>
            )}

            {/* Translation notice banner */}
            {translationNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <span>{translationNotice}</span>
                <button
                  type="button"
                  onClick={() => setTranslationNotice("")}
                  className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Language Sub-tabs & Auto-translate Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Contenu linguistique :</span>
                <button
                  type="button"
                  onClick={() => setActiveLangTab("FR")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLangTab === "FR"
                      ? "bg-[#003366] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Français {formData.publishedFr && "●"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab("EN")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLangTab === "EN"
                      ? "bg-[#003366] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  English {formData.publishedEn && "●"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab("DE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLangTab === "DE"
                      ? "bg-[#003366] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Deutsch {formData.publishedDe && "●"}
                </button>
              </div>

              {/* Bouton Traduction Automatique */}
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating || !formData.titleFr.trim()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#003366] text-white shadow-xs hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Traduit automatiquement les textes vers l'anglais et l'allemand"
              >
                {translating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Traduction en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>Traduire vers EN &amp; DE</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {/* Publication checkbox for the active language */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      activeLangTab === "FR"
                        ? formData.publishedFr
                        : activeLangTab === "EN"
                        ? formData.publishedEn
                        : formData.publishedDe
                    }
                    onChange={(e) => {
                      const checked = e.target.checked
                      if (activeLangTab === "FR") setFormData({ ...formData, publishedFr: checked })
                      else if (activeLangTab === "EN") setFormData({ ...formData, publishedEn: checked })
                      else setFormData({ ...formData, publishedDe: checked })
                    }}
                    className="w-4 h-4 rounded text-[#28A745] focus:ring-[#28A745] border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800">
                      {activeLangTab === "FR"
                        ? "Publier cette version en Français (accessible sur /fr/projets/...)"
                        : activeLangTab === "EN"
                        ? "Publier cette version en Anglais (accessible sur /en/projets/...)"
                        : "Publier cette version en Allemand (accessible sur /de/projets/...)"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Si décoché, la page dans cette langue renverra une erreur 404 sans mélanger de langues.
                    </p>
                  </div>
                </label>
              </div>

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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Project Title (English)
                    </label>
                    {formData.titleFr && (
                      <button
                        type="button"
                        onClick={() => handleTranslateSingleField("title", "EN")}
                        disabled={translatingField === "title_EN"}
                        className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer"
                      >
                        {translatingField === "title_EN" ? "Traduction..." : "Traduire"}
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Projekttitel (Deutsch)
                    </label>
                    {formData.titleFr && (
                      <button
                        type="button"
                        onClick={() => handleTranslateSingleField("title", "DE")}
                        disabled={translatingField === "title_DE"}
                        className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer"
                      >
                        {translatingField === "title_DE" ? "Traduction..." : "Traduire"}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="ex: Solarkarawane für digitale Bildung"
                    value={formData.titleDe}
                    onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              )}

              {/* Multilingual Summary */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Résumé synthétique <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Phrase courte de synthèse décrivant l'action..."
                    value={formData.summaryFr}
                    onChange={(e) => setFormData({ ...formData, summaryFr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "EN" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Summary (English)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short project summary..."
                    value={formData.summaryEn}
                    onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "DE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zusammenfassung (Deutsch)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Kurze Projektzusammenfassung..."
                    value={formData.summaryDe}
                    onChange={(e) => setFormData({ ...formData, summaryDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}

              {/* Multilingual Description (À propos) */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    À propos du projet (Contexte & Démarche)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Contexte territorial, problématique adressée et solution apportée par APTIC-R..."
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "EN" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    About the Project (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Background, problem addressed, and APTIC-R intervention..."
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "DE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Über das Projekt (Deutsch)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Kontext, Herausforderung und Lösungsansatz..."
                    value={formData.descriptionDe}
                    onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}

              {/* Multilingual Objectives, Actions & Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Objectifs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Objectifs (un par ligne)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="• Former 100 jeunes&#10;• Équiper 3 centres..."
                    value={
                      activeLangTab === "FR"
                        ? formData.objectivesFr
                        : activeLangTab === "EN"
                        ? formData.objectivesEn
                        : formData.objectivesDe
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      if (activeLangTab === "FR") setFormData({ ...formData, objectivesFr: val })
                      else if (activeLangTab === "EN") setFormData({ ...formData, objectivesEn: val })
                      else setFormData({ ...formData, objectivesDe: val })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-xs"
                  />
                </div>

                {/* Actions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actions terrain (une par ligne)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="• Déploiement des kits&#10;• Ateliers hebdomadaires..."
                    value={
                      activeLangTab === "FR"
                        ? formData.actionsFr
                        : activeLangTab === "EN"
                        ? formData.actionsEn
                        : formData.actionsDe
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      if (activeLangTab === "FR") setFormData({ ...formData, actionsFr: val })
                      else if (activeLangTab === "EN") setFormData({ ...formData, actionsEn: val })
                      else setFormData({ ...formData, actionsDe: val })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-xs"
                  />
                </div>

                {/* Résultats */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Résultats &amp; Impact (un par ligne)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="• 45 coopératives connectées&#10;• 12 formateurs certifiés..."
                    value={
                      activeLangTab === "FR"
                        ? formData.resultsFr
                        : activeLangTab === "EN"
                        ? formData.resultsEn
                        : formData.resultsDe
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      if (activeLangTab === "FR") setFormData({ ...formData, resultsFr: val })
                      else if (activeLangTab === "EN") setFormData({ ...formData, resultsEn: val })
                      else setFormData({ ...formData, resultsDe: val })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-xs"
                  />
                </div>
              </div>

              {/* ── Paramètres Communs (Pôle, Calendrier, Lieu, Bénéficiaires) ── */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Paramètres Opérationnels &amp; Territoriaux
                </h3>

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
                      Statut opérationnel terrain
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none bg-white"
                    >
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="COMPLETED">Réalisé / Clôturé</option>
                      <option value="PLANNED">Planifié / Cadrage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date de fin (ou prévisionnelle)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-xs"
                    />
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
                      Bénéficiaires certifiés
                    </label>
                    <input
                      type="text"
                      placeholder="ex: 45 jeunes femmes diplômées"
                      value={formData.beneficiaries}
                      onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Image principale de la fiche projet
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
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{uploadingImage ? "Téléversement..." : "Sélectionner une photo"}</span>
                  </button>

                  {formData.featuredImage && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={formData.featuredImage}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featuredImage: "" })}
                        className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Options : Projet Phare & Ordre d'affichage (CONSERVÉS OBLIGATOIREMENT) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300 cursor-pointer"
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
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {submitting
                    ? "Enregistrement..."
                    : editingId
                    ? "Enregistrer les modifications"
                    : "Créer le projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
