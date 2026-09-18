"use client"

import React, { useState, useEffect, useRef } from "react"
import { getEvents, createEvent, deleteEvent } from "@/lib/cms-actions"

interface EventItem {
  id: string
  slug: string
  titleFr: string
  category: string
  location: string
  startDate: Date
  endDate?: Date | null
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
  const [submitting, setSubmitting] = useState(false)
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
      const res = await createEvent({
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
      })

      if (res.success) {
        setModalOpen(false)
        setActiveLangTab("FR")
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
          onClick={() => {
            setActiveLangTab("FR")
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel Événement</span>
        </button>
      </div>

      {/* ── Events Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Événement</th>
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
                      <button
                        onClick={() => handleDelete(ev.id, ev.titleFr)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                        title="Supprimer"
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
                  Planifier un Événement
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez les détails de l&apos;événement et ses traductions optionnelles.
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Title (English - Optionnel)
                  </label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Veranstaltungstitel (Deutsch - Optionnel)
                  </label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Description (English - Optionnel)
                  </label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kurze Beschreibung (Deutsch - Optionnel)
                  </label>
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
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Enregistrement..." : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

