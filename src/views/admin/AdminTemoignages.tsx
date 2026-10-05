"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  getAllTemoignages,
  createTemoignage,
  updateTemoignage,
  deleteTemoignage,
} from "@/lib/cms-actions"
import { useConfirm } from "@/components/admin/ConfirmProvider"

interface TemoignageItem {
  id: string
  authorName: string
  authorRole: string
  authorType: string
  authorOrg?: string | null
  photoUrl?: string | null
  quoteFr: string
  quoteEn?: string | null
  quoteDe?: string | null
  rating?: number | null
  featured: boolean
  order: number
  createdAt: string | Date
}

const AUTHOR_TYPES: Record<string, string> = {
  BENEFICIARY: "Bénéficiaire",
  VOLUNTEER: "Volontaire",
  PARTNER: "Partenaire",
  TRAINER: "Formateur",
}

const EMPTY_FORM = {
  authorName: "",
  authorRole: "",
  authorType: "VOLUNTEER",
  authorOrg: "",
  photoUrl: "",
  quoteFr: "",
  quoteEn: "",
  quoteDe: "",
  rating: "5",
  featured: true,
  order: "",
}

export default function AdminTemoignages() {
  const confirm = useConfirm()
  const [items, setItems] = useState<TemoignageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await getAllTemoignages()
    if (res.success && res.items) {
      setItems(res.items as unknown as TemoignageItem[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const data = new FormData()
      data.append("file", file)
      const response = await fetch("/api/upload/image", { method: "POST", body: data })
      const result = await response.json()
      if (result.success && result.url) {
        setForm((prev) => ({ ...prev, photoUrl: result.url }))
      } else {
        setError(result.error || "Erreur lors du téléversement de la photo.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau.")
    } finally {
      setUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setError("")
    setModalOpen(true)
  }

  const openEdit = (item: TemoignageItem) => {
    setEditingId(item.id)
    setForm({
      authorName: item.authorName || "",
      authorRole: item.authorRole || "",
      authorType: item.authorType || "VOLUNTEER",
      authorOrg: item.authorOrg || "",
      photoUrl: item.photoUrl || "",
      quoteFr: item.quoteFr || "",
      quoteEn: item.quoteEn || "",
      quoteDe: item.quoteDe || "",
      rating: item.rating != null ? String(item.rating) : "5",
      featured: !!item.featured,
      order: item.order != null ? String(item.order) : "",
    })
    setError("")
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const payload: Record<string, unknown> = {
      authorName: form.authorName,
      authorRole: form.authorRole,
      authorType: form.authorType,
      authorOrg: form.authorOrg || null,
      photoUrl: form.photoUrl || null,
      quoteFr: form.quoteFr,
      quoteEn: form.quoteEn || null,
      quoteDe: form.quoteDe || null,
      rating: form.rating ? Number(form.rating) : null,
      featured: form.featured,
    }
    if (form.order.trim()) payload.order = Number(form.order)

    setSubmitting(true)
    try {
      const res = editingId
        ? await updateTemoignage(editingId, payload)
        : await createTemoignage(payload)

      if (res.success) {
        setFeedback(editingId ? "Témoignage modifié." : "Témoignage ajouté.")
        closeModal()
        await loadData()
      } else {
        setError(res.error || "Erreur lors de l'enregistrement.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: TemoignageItem) => {
    const ok = await confirm({
      title: "Supprimer le témoignage ?",
      message: (
        <>
          <p>
            Voulez-vous vraiment supprimer définitivement le témoignage de{" "}
            <strong>{item.authorName}</strong> ?
          </p>
          <p className="mt-2">
            Cette action est <strong>irréversible</strong> : le témoignage sera retiré du site
            public.
          </p>
        </>
      ) as React.ReactNode,
      confirmLabel: "Supprimer définitivement",
    })
    if (!ok) return

    const res = await deleteTemoignage(item.id)
    if (res.success) {
      setItems((prev) => prev.filter((t) => t.id !== item.id))
      setFeedback("Témoignage supprimé définitivement.")
    } else {
      setError(res.error || "Erreur lors de la suppression.")
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#003366]">Témoignages</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestion des témoignages publiés sur le site public.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#003366] hover:bg-[#002244] shadow-sm transition-all text-xs cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajouter un témoignage</span>
        </button>
      </div>

      {feedback && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </p>
      )}

      <div className="rounded-xl border border-[#EAF0F4] bg-white overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            Aucun témoignage enregistré. Cliquez sur « Ajouter un témoignage » pour commencer.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {item.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photoUrl} alt={item.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      {item.authorName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.authorName}</p>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {AUTHOR_TYPES[item.authorType] || item.authorType}
                    </span>
                    {item.featured ? (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Mis en avant
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.authorRole}
                    {item.authorOrg ? ` · ${item.authorOrg}` : ""}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">{item.quoteFr}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#003366] hover:text-[#003366] transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editingId ? "Modifier le témoignage" : "Nouveau témoignage"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nom de l&apos;auteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rôle *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.authorRole}
                    onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type d&apos;auteur
                  </label>
                  <select
                    value={form.authorType}
                    onChange={(e) => setForm({ ...form, authorType: e.target.value })}
                    className={inputClass}
                  >
                    {Object.entries(AUTHOR_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Organisation
                  </label>
                  <input
                    type="text"
                    value={form.authorOrg}
                    onChange={(e) => setForm({ ...form, authorOrg: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Témoignage (français) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.quoteFr}
                  onChange={(e) => setForm({ ...form, quoteFr: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Témoignage (anglais)
                  </label>
                  <textarea
                    rows={3}
                    value={form.quoteEn}
                    onChange={(e) => setForm({ ...form, quoteEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Témoignage (allemand)
                  </label>
                  <textarea
                    rows={3}
                    value={form.quoteDe}
                    onChange={(e) => setForm({ ...form, quoteDe: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Note (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5 flex items-end">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                    Mis en avant
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Photo
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => photoInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#003366] hover:text-[#003366] transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Téléversement…" : "Choisir une image"}
                  </button>
                  {form.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoUrl} alt="Aperçu" className="w-12 h-12 rounded-full object-cover" />
                  )}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-red-600">✗ {error}</p>
              )}
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244] transition-colors disabled:opacity-40"
              >
                {submitting ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}