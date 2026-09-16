"use client"

import React, { useState, useEffect } from "react"
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
  published: boolean
}

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    titleFr: "",
    category: "WORKSHOP",
    location: "FabLab d'Agbélouvé",
    startDate: new Date().toISOString().split("T")[0],
    isOnline: false,
    meetingUrl: "",
    registrationUrl: "",
    descriptionFr: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const res = await createEvent({
        titleFr: formData.titleFr,
        category: formData.category,
        location: formData.location,
        startDate: new Date(formData.startDate),
        isOnline: formData.isOnline,
        meetingUrl: formData.meetingUrl || undefined,
        registrationUrl: formData.registrationUrl || undefined,
        descriptionFr: formData.descriptionFr || formData.titleFr,
      })

      if (res.success) {
        setModalOpen(false)
        setFormData({
          titleFr: "",
          category: "WORKSHOP",
          location: "FabLab d'Agbélouvé",
          startDate: new Date().toISOString().split("T")[0],
          isOnline: false,
          meetingUrl: "",
          registrationUrl: "",
          descriptionFr: "",
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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>📅</span>
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
                      {ev.isOnline ? "🌐 En ligne" : `📍 ${ev.location}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {ev.published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(ev.id, ev.titleFr)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold"
                        title="Supprimer"
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

      {/* ── Create Event Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Planifier un Événement
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
                  Titre de l&apos;événement *
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

              <div className="grid grid-cols-2 gap-4">
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
                    Date de début *
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
                  Lieu
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
