"use client"

import React, { useState, useEffect, useRef } from "react"
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/cms-actions"
import { translateCmsFieldsAction } from "@/lib/translator"

interface EventItem {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  category: string
  location: string
  startDate: Date | string
  endDate?: Date | string | null
  isOnline: boolean
  meetingUrl?: string | null
  registrationUrl?: string | null
  featuredImage?: string | null
  published: boolean
}

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translatingField, setTranslatingField] = useState<string | null>(null)
  const [showTranslationHelp, setShowTranslationHelp] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    titleFr: "",
    titleEn: "",
    titleDe: "",
    category: "WORKSHOP",
    location: "FabLab d'Agbélouvé",
    startDate: new Date().toISOString().split("T")[0],
    isOnline: false,
    meetingUrl: "",
    registrationUrl: "",
    descriptionFr: "",
    descriptionEn: "",
    descriptionDe: "",
    featuredImage: "",
    published: true,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getEvents()
      setEvents(data as any)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = (ev?: EventItem) => {
    if (ev) {
      setEditingId(ev.id)
      const formattedDate = typeof ev.startDate === "string" 
        ? ev.startDate.split("T")[0] 
        : new Date(ev.startDate).toISOString().split("T")[0]

      setFormData({
        titleFr: ev.titleFr || "",
        titleEn: ev.titleEn || "",
        titleDe: ev.titleDe || "",
        category: ev.category || "WORKSHOP",
        location: ev.location || "FabLab d'Agbélouvé",
        startDate: formattedDate,
        isOnline: Boolean(ev.isOnline),
        meetingUrl: ev.meetingUrl || "",
        registrationUrl: ev.registrationUrl || "",
        descriptionFr: ev.descriptionFr || "",
        descriptionEn: ev.descriptionEn || "",
        descriptionDe: ev.descriptionDe || "",
        featuredImage: ev.featuredImage || "",
        published: ev.published !== false,
      })
    } else {
      setEditingId(null)
      setFormData({
        titleFr: "",
        titleEn: "",
        titleDe: "",
        category: "WORKSHOP",
        location: "FabLab d'Agbélouvé",
        startDate: new Date().toISOString().split("T")[0],
        isOnline: false,
        meetingUrl: "",
        registrationUrl: "",
        descriptionFr: "",
        descriptionEn: "",
        descriptionDe: "",
        featuredImage: "",
        published: true,
      })
    }
    setActiveLangTab("FR")
    setError("")
    setModalOpen(true)
  }

  const handleAutoTranslate = async () => {
    if (!formData.titleFr.trim()) {
      alert("Veuillez d'abord saisir au moins le titre en français.")
      return
    }

    setTranslating(true)
    try {
      const fieldsToTranslate = {
        title: formData.titleFr,
        description: formData.descriptionFr || "",
      }

      const res = await translateCmsFieldsAction({
        texts: {
          title: formData.titleFr,
          description: formData.descriptionFr || "",
        },
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          titleEn: res.translations.EN.title || prev.titleEn,
          descriptionEn: res.translations.EN.description || prev.descriptionEn,
          titleDe: res.translations.DE.title || prev.titleDe,
          descriptionDe: res.translations.DE.description || prev.descriptionDe,
        }))
      } else {
        alert("Erreur lors de la traduction : " + (res.error || "Service indisponible"))
      }
    } catch (err: any) {
      alert("Erreur de connexion lors de la traduction : " + (err.message || "Inconnue"))
    } finally {
      setTranslating(false)
    }
  }

  const handleTranslateSingleField = async (field: "title" | "description", targetLang: "EN" | "DE") => {
    const sourceMap = {
      title: formData.titleFr,
      description: formData.descriptionFr || "",
    }
    const sourceText = sourceMap[field]
    if (!sourceText || !sourceText.trim()) {
      alert("Le texte source en français est vide pour ce champ.")
      return
    }

    setTranslatingField(`${field}_${targetLang}`)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [field]: sourceText },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })
      if (res.success && res.translations?.[targetLang]?.[field]) {
        const val = res.translations[targetLang][field]
        const stateKey = targetLang === "EN"
          ? (field === "title" ? "titleEn" : "descriptionEn")
          : (field === "title" ? "titleDe" : "descriptionDe")
        setFormData((prev) => ({ ...prev, [stateKey]: val }))
      } else {
        alert(res.error || "Erreur lors de la traduction.")
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion.")
    } finally {
      setTranslatingField(null)
    }
  }

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
    if (!formData.titleFr.trim()) {
      setError("Le titre en français est obligatoire.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const payload = {
        titleFr: formData.titleFr,
        titleEn: formData.titleEn || undefined,
        titleDe: formData.titleDe || undefined,
        category: formData.category,
        location: formData.location,
        startDate: new Date(formData.startDate),
        isOnline: formData.isOnline,
        meetingUrl: formData.meetingUrl || undefined,
        registrationUrl: formData.registrationUrl || undefined,
        descriptionFr: formData.descriptionFr || formData.titleFr,
        descriptionEn: formData.descriptionEn || undefined,
        descriptionDe: formData.descriptionDe || undefined,
        featuredImage: formData.featuredImage || undefined,
        published: formData.published,
      }

      const res = editingId
        ? await updateEvent(editingId, payload)
        : await createEvent(payload)

      if (res.success) {
        setModalOpen(false)
        setEditingId(null)
        setActiveLangTab("FR")
        await loadData()
      } else {
        setError(res.error || "Erreur lors de l'enregistrement")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'événement "${title}" ?`)) return
    try {
      await deleteEvent(id)
      setEvents((prev) => prev.filter((ev) => ev.id !== id))
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
            CMS : Événements & Formations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Planifiez et annoncez les ateliers, conférences, hackathons et bootcamps d&apos;APTIC-R.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel événement</span>
        </button>
      </div>

      {/* ── Events Table ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Titre</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Lieu / Format</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chargement des événements...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun événement programmé.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {ev.titleFr}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#174F7A]">
                      {ev.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {new Date(ev.startDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {ev.isOnline ? "En ligne" : ev.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {ev.published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(ev)}
                          className="px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 text-xs font-semibold transition-colors cursor-pointer"
                          title="Modifier l'événement"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, ev.titleFr)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                          title="Supprimer"
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

      {/* ── Create Event Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? "Modifier l'Événement" : "Planifier un Événement"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez les détails de l&apos;événement et ses traductions multilingues.
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

            {/* Note d'explication sur la politique multilingue stricte */}
            {showTranslationHelp && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs leading-relaxed space-y-1 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pourquoi traduire ? Règle d'affichage public</span>
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
                  Le site applique une <strong>séparation stricte des langues</strong> : un événement sans traduction anglaise ou allemande 
                  <strong>ne sera pas visible</strong> sur les versions internationales afin de garantir une vitrine bilingue/trilingue parfaite.
                </p>
                <p className="text-amber-700 text-[11px]">
                  Le bouton <strong>« Traduire vers EN & DE »</strong> génère automatiquement ces versions en un instant.
                </p>
              </div>
            )}

            {/* Language Sub-tabs + Auto translate */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Langue :</span>
                <button
                  type="button"
                  onClick={() => setActiveLangTab("FR")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLangTab === "DE"
                      ? "bg-[#003366] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Deutsch {formData.titleDe && "✓"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating || !formData.titleFr.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF]/10 text-[#007BFF] hover:bg-[#007BFF]/20 transition-all border border-[#007BFF]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Traduit automatiquement les champs français vers l'anglais et l'allemand"
              >
                {translating ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Traduction en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>Traduire vers EN & DE</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Multilingual Title */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titre de l&apos;événement <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Atelier d'Initiation à l'Impression 3D"
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
                      Event Title (English - Optionnel)
                    </label>
                    {formData.titleFr && (
                      <button
                        type="button"
                        onClick={() => handleTranslateSingleField("title", "EN")}
                        disabled={translatingField === "title_EN"}
                        className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                        </svg>
                        <span>{translatingField === "title_EN" ? "Traduction..." : "Traduire ce champ"}</span>
                      </button>
                    )}
                  </div>
                  {formData.titleFr && (
                    <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                      Source (FR) : {formData.titleFr}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="ex: 3D Printing Workshop"
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
                      Veranstaltungstitel (Deutsch - Optionnel)
                    </label>
                    {formData.titleFr && (
                      <button
                        type="button"
                        onClick={() => handleTranslateSingleField("title", "DE")}
                        disabled={translatingField === "title_DE"}
                        className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                        </svg>
                        <span>{translatingField === "title_DE" ? "Traduction..." : "Traduire ce champ"}</span>
                      </button>
                    )}
                  </div>
                  {formData.titleFr && (
                    <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                      Source (FR) : {formData.titleFr}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="ex: 3D-Druck Workshop"
                    value={formData.titleDe}
                    onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none bg-white"
                  >
                    <option value="WORKSHOP">Atelier pratique</option>
                    <option value="TRAINING">Formation certifiante</option>
                    <option value="CONFERENCE">Conférence / Table ronde</option>
                    <option value="HACKATHON">Hackathon / Défi</option>
                    <option value="CEREMONY">Cérémonie de remise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de début <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lieu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                />
              </div>

              {/* Multilingual Description */}
              {activeLangTab === "FR" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Courte description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    placeholder="Objectifs pédagogiques, prérequis et programme..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "EN" && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Short Description (English - Optionnel)
                    </label>
                    {formData.descriptionFr && (
                      <button
                        type="button"
                        onClick={() => handleTranslateSingleField("description", "EN")}
                        disabled={translatingField === "description_EN"}
                        className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                        </svg>
                        <span>{translatingField === "description_EN" ? "Traduction..." : "Traduire ce champ"}</span>
                      </button>
                    )}
                  </div>
                  {formData.descriptionFr && (
                    <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                      Source (FR) : {formData.descriptionFr}
                    </div>
                  )}
                  <textarea
                    rows={3}
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Objectives, prerequisites and program in English..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}
              {activeLangTab === "DE" && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Kurze Beschreibung (Deutsch - Optionnel)
                    </label>
                    {formData.descriptionFr && (
                      <button
                        type="button"
                        onClick={() => handleTranslateSingleField("description", "DE")}
                        disabled={translatingField === "description_DE"}
                        className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                        </svg>
                        <span>{translatingField === "description_DE" ? "Traduction..." : "Traduire ce champ"}</span>
                      </button>
                    )}
                  </div>
                  {formData.descriptionFr && (
                    <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                      Source (FR) : {formData.descriptionFr}
                    </div>
                  )}
                  <textarea
                    rows={3}
                    value={formData.descriptionDe}
                    onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                    placeholder="Ziele, Voraussetzungen und Programm auf Deutsch..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Image / Affiche de l&apos;événement
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
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {submitting
                    ? "Enregistrement..."
                    : editingId
                    ? "Enregistrer les modifications"
                    : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

