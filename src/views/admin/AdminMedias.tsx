"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { getAllMedias, createMedia, updateMedia, deleteMedia } from "@/lib/cms-actions"
import { useConfirm } from "@/components/admin/ConfirmProvider"

interface MediaItem {
  id: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  captionFr?: string | null
  captionEn?: string | null
  captionDe?: string | null
  url: string
  thumbnailUrl?: string | null
  type: string
  album?: string | null
  category?: string | null
  order: number
  featured: boolean
  projetId?: string | null
  createdAt: string | Date
}

const MEDIA_TYPES: Record<string, string> = {
  PHOTO: "Photo",
  VIDEO: "Vidéo",
}

const EMPTY_FORM = {
  titleFr: "",
  titleEn: "",
  titleDe: "",
  captionFr: "",
  captionEn: "",
  captionDe: "",
  url: "",
  thumbnailUrl: "",
  type: "PHOTO",
  album: "",
  category: "",
  order: "",
  featured: false,
  projetId: "",
}

type LangCode = "FR" | "EN" | "DE"

export default function AdminMedias() {
  const confirm = useConfirm()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [activeLang, setActiveLang] = useState<LangCode>("FR")
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const existingAlbums = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.album).filter(Boolean))).sort() as string[]
  }, [items])

  const loadData = async () => {
    setLoading(true)
    const res = await getAllMedias()
    if (res.success && res.items) {
      setItems(res.items as unknown as MediaItem[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setForm((prev) => ({
          ...prev,
          url: result.url,
          titleFr: prev.titleFr || file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
        }))
      } else {
        setError(result.error || "Erreur lors du téléversement de l'image.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setActiveLang("FR")
    setError("")
    setModalOpen(true)
  }

  const openEdit = (item: MediaItem) => {
    setEditingId(item.id)
    setForm({
      titleFr: item.titleFr || "",
      titleEn: item.titleEn || "",
      titleDe: item.titleDe || "",
      captionFr: item.captionFr || "",
      captionEn: item.captionEn || "",
      captionDe: item.captionDe || "",
      url: item.url || "",
      thumbnailUrl: item.thumbnailUrl || "",
      type: item.type || "PHOTO",
      album: item.album || "",
      category: item.category || "",
      order: item.order != null ? String(item.order) : "",
      featured: !!item.featured,
      projetId: item.projetId || "",
    })
    setActiveLang("FR")
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
      titleFr: form.titleFr,
      titleEn: form.titleEn || null,
      titleDe: form.titleDe || null,
      captionFr: form.captionFr || null,
      captionEn: form.captionEn || null,
      captionDe: form.captionDe || null,
      url: form.url,
      thumbnailUrl: form.thumbnailUrl || null,
      type: form.type,
      album: form.album || null,
      category: form.category || null,
      featured: form.featured,
      projetId: form.projetId || null,
    }
    if (form.order.trim()) payload.order = Number(form.order)

    setSubmitting(true)
    try {
      const res = editingId
        ? await updateMedia(editingId, payload)
        : await createMedia(payload)

      if (res.success) {
        setFeedback(editingId ? "Média modifié." : "Média ajouté.")
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

  const handleDelete = async (item: MediaItem) => {
    const ok = await confirm({
      title: "Supprimer ce média ?",
      message: (
        <>
          <p>
            Voulez-vous vraiment supprimer définitivement le média{" "}
            <strong>« {item.titleFr} »</strong> ?
          </p>
          <p className="mt-2">
            L&apos;enregistrement du média sera supprimé de la base de données et il n&apos;apparaîtra
            plus sur le site public.
          </p>
          <p className="mt-2 font-medium">
            Attention : le fichier physique associé (image ou vidéo) ne sera PAS supprimé du
            stockage. Il peut donc rester présent sur le serveur en tant que fichier orphelin.
          </p>
        </>
      ) as React.ReactNode,
      confirmLabel: "Supprimer le média",
    })
    if (!ok) return

    const res = await deleteMedia(item.id)
    if (res.success) {
      setItems((prev) => prev.filter((m) => m.id !== item.id))
      setFeedback(
        "Média supprimé. Le fichier physique associé reste présent dans le stockage."
      )
    } else {
      setError(res.error || "Erreur lors de la suppression.")
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"

  const titleField = activeLang === "FR" ? "titleFr" : activeLang === "EN" ? "titleEn" : "titleDe"
  const captionField = activeLang === "FR" ? "captionFr" : activeLang === "EN" ? "captionEn" : "captionDe"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#003366]">Médias & Galerie</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestion des médias de la galerie et des visuels de projets.
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
          <span>Ajouter un média</span>
        </button>
      </div>

      {feedback && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </p>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs text-amber-800">
          <strong>Note :</strong> la suppression d&apos;un média supprime uniquement son
          enregistrement en base de données. Le fichier physique associé n&apos;est pas supprimé du
          stockage et peut rester présent sur le serveur.
        </p>
      </div>

      <div className="rounded-xl border border-[#EAF0F4] bg-white overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            Aucun média enregistré. Cliquez sur « Ajouter un média » pour commencer.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Aperçu</th>
                  <th className="py-2.5 px-4">Titre (FR)</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Album</th>
                  <th className="py-2.5 px-4">Ordre</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                        {item.thumbnailUrl || item.type === "PHOTO" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={(item.thumbnailUrl || item.url) as string}
                            alt={item.titleFr}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.75}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="block font-semibold text-slate-800">{item.titleFr}</span>
                      {item.captionFr && (
                        <span className="block text-slate-400 text-[11px] truncate max-w-[220px]">
                          {item.captionFr}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {MEDIA_TYPES[item.type] || item.type}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{item.album || "—"}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {item.order}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#003366] hover:text-[#003366] transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                {editingId ? "Modifier le média" : "Nouveau média"}
              </h2>
              {/* Sélecteur de langue */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(["FR", "EN", "DE"] as LangCode[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      activeLang === lang
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contenus éditoriaux ({activeLang})
                </h3>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Titre {activeLang} {activeLang === "FR" && "*"}
                  </label>
                  <input
                    type="text"
                    required={activeLang === "FR"}
                    value={form[titleField]}
                    onChange={(e) => setForm({ ...form, [titleField]: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Légende {activeLang}
                  </label>
                  <textarea
                    rows={2}
                    value={form[captionField]}
                    onChange={(e) => setForm({ ...form, [captionField]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inputClass}
                  >
                    {Object.entries(MEDIA_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Album
                  </label>
                  <input
                    type="text"
                    list="album-suggestions"
                    value={form.album}
                    onChange={(e) => setForm({ ...form, album: e.target.value })}
                    className={inputClass}
                    placeholder="Sélectionner ou créer..."
                  />
                  <datalist id="album-suggestions">
                    {existingAlbums.map((a) => (
                      <option key={a as string} value={a as string} />
                    ))}
                  </datalist>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Collection de médias liée à un événement ou une mission (ex : « Formation Arduino 2026 »). Plusieurs médias peuvent appartenir au même album.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Thématique générale visible comme filtre dans la galerie (ex : TERRAIN, FORMATION, COMMUNAUTÉ).
                  </p>
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
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Position d'affichage dans la galerie (0 = premier). Laissez vide pour un ordre automatique par date.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {form.type === "VIDEO" ? "Vidéo *" : "Fichier *"}
                </label>
                {form.type === "VIDEO" ? (
                  /* ── Vidéo : fichier MP4/WebM OU URL externe ──────────── */
                  <div className="space-y-3">
                    {/* Option 1 : téléverser un fichier vidéo */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#003366] hover:text-[#003366] transition-colors disabled:opacity-50"
                      >
                        {uploading ? "Téléversement…" : "Téléverser un fichier vidéo (.mp4 / .webm)"}
                      </button>
                      {form.url && form.url.startsWith("/") && (
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[280px]">
                          {form.url}
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {/* Séparateur OU */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ou</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    {/* Option 2 : URL externe (YouTube / Vimeo / directe) */}
                    <input
                      type="text"
                      required={!form.url || !form.url.startsWith("/")}
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=… ou https://vimeo.com/…"
                      className={inputClass}
                    />
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Coller un lien YouTube, Vimeo ou une URL directe (.mp4 / .webm).
                      Ajoutez une miniature ci-dessous pour l&apos;aperçu dans la galerie.
                    </p>
                  </div>
                ) : (
                  /* ── Photo : téléversement de fichier ───────────────────── */
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-[#003366] hover:text-[#003366] transition-colors disabled:opacity-50"
                      >
                        {uploading ? "Téléversement…" : "Téléverser une image"}
                      </button>
                      {form.url && (
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[280px]">
                          {form.url}
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <input
                      type="text"
                      required
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="/uploads/team/…"
                      className={inputClass}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    URL miniature
                  </label>
                  <input
                    type="text"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Image de prévisualisation dans la grille. Pour YouTube, coller l’URL de la vignette (ex : <code className="font-mono">https://img.youtube.com/vi/ID/maxresdefault.jpg</code>).
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Identifiant projet lié (facultatif)
                  </label>
                  <input
                    type="text"
                    value={form.projetId}
                    onChange={(e) => setForm({ ...form, projetId: e.target.value })}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Relier ce média à un projet institutionnel spécifique. Sans effet sur la galerie publique.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  Mettre en avant
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed ml-5">
                  Affiche ce média en taille agrandie dans la section « À la une » en haut de la galerie.
                </p>
              </div>

              {error && <p className="text-xs font-medium text-red-600">✗ {error}</p>}
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
                disabled={submitting || !form.titleFr.trim() || !form.url.trim()}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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