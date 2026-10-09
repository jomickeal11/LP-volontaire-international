"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  getAllAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "@/lib/cms-actions"
import { useConfirm } from "@/components/admin/ConfirmProvider"

interface AlbumItem {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  coverImage?: string | null
  published: boolean
  order: number
  createdAt: string | Date
  _count?: { medias: number }
}

const EMPTY_FORM = {
  slug: "",
  titleFr: "",
  titleEn: "",
  titleDe: "",
  descriptionFr: "",
  descriptionEn: "",
  descriptionDe: "",
  coverImage: "",
  published: true,
  order: "",
}

type LangCode = "FR" | "EN" | "DE"

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export default function AdminAlbums() {
  const confirm = useConfirm()
  const [items, setItems] = useState<AlbumItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [activeLang, setActiveLang] = useState<LangCode>("FR")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3200)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const loadData = useCallback(async () => {
    setLoading(true)
    const res = await getAllAlbums()
    if (res.success && res.items) {
      setItems(res.items as AlbumItem[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setSlugManual(false)
    setActiveLang("FR")
    setError("")
    setModalOpen(true)
  }

  const openEdit = (item: AlbumItem) => {
    setEditingId(item.id)
    setForm({
      slug: item.slug || "",
      titleFr: item.titleFr || "",
      titleEn: item.titleEn || "",
      titleDe: item.titleDe || "",
      descriptionFr: item.descriptionFr || "",
      descriptionEn: item.descriptionEn || "",
      descriptionDe: item.descriptionDe || "",
      coverImage: item.coverImage || "",
      published: item.published,
      order: item.order != null ? String(item.order) : "",
    })
    setSlugManual(true)
    setActiveLang("FR")
    setError("")
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setError("")
  }

  const handleTitleFrChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      titleFr: value,
      slug: slugManual ? prev.slug : slugify(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const payload = {
      slug: form.slug,
      titleFr: form.titleFr,
      titleEn: form.titleEn || null,
      titleDe: form.titleDe || null,
      descriptionFr: form.descriptionFr || null,
      descriptionEn: form.descriptionEn || null,
      descriptionDe: form.descriptionDe || null,
      coverImage: form.coverImage || null,
      published: form.published,
      order: form.order.trim() ? Number(form.order) : 0,
    }

    setSubmitting(true)
    try {
      const res = editingId
        ? await updateAlbum(editingId, payload)
        : await createAlbum(payload)

if (res.success) {
        setFeedback(editingId ? "Album modifié." : "Album créé.")
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

  const handleDelete = async (item: AlbumItem) => {
    const ok = await confirm({
      title: "Supprimer cet album ?",
      message: (
        <>
          <p>
            Voulez-vous vraiment supprimer l&apos;album{" "}
            <strong>{"<< "}{item.titleFr}{" >>"}</strong> ?
          </p>
<p className="mt-2">
            Les médias liés à cet album seront déliés (mais non supprimés).
          </p>
        </>
      ) as React.ReactNode,
      confirmLabel: "Supprimer l'album",
    })
    if (!ok) return

    const res = await deleteAlbum(item.id)
    if (res.success) {
      setItems((prev) => prev.filter((a) => a.id !== item.id))
      setFeedback("Album supprimé. Les médias associés ont été déliés.")
    } else {
      setError(res.error || "Erreur lors de la suppression.")
    }
  }

  const handleTogglePublished = async (item: AlbumItem) => {
    const res = await updateAlbum(item.id, { published: !item.published })
    if (res.success) {
      setItems((prev) =>
        prev.map((a) =>
          a.id === item.id ? { ...a, published: !a.published } : a
        )
      )
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"

  const titleField = activeLang === "FR" ? "titleFr" : activeLang === "EN" ? "titleEn" : "titleDe"
  const descField =
    activeLang === "FR"
      ? "descriptionFr"
      : activeLang === "EN"
        ? "descriptionEn"
        : "descriptionDe"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
<h1 className="text-2xl font-bold tracking-tight text-[#003366]">Albums</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Créez et organisez les collections de médias visibles dans la galerie.
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
          <span>Créer un album</span>
        </button>
      </div>

      {feedback && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </p>
      )}
      {error && !modalOpen && (
<p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          ✗ {error}
        </p>
      )}

      <div className="rounded-xl border border-[#EAF0F4] bg-white overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Chargement...</p>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
<p className="text-sm text-slate-500">
              Aucun album. Cliquez sur « Créer un album » pour commencer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
<th className="py-2.5 px-4">Couverture</th>
                  <th className="py-2.5 px-4">Titre (FR)</th>
                  <th className="py-2.5 px-4">Slug</th>
                  <th className="py-2.5 px-4">Médias</th>
                  <th className="py-2.5 px-4">Ordre</th>
                  <th className="py-2.5 px-4">Publié</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                        {item.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverImage}
                            alt={item.titleFr}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.75}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="block font-semibold text-slate-800">{item.titleFr}</span>
                      {item.descriptionFr && (
                        <span className="block text-slate-400 text-[11px] truncate max-w-[200px]">
                          {item.descriptionFr}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                      {item.slug}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {item._count?.medias ?? 0}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {item.order}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(item)}
                        className={[
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors",
                          item.published
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "inline-block w-1.5 h-1.5 rounded-full",
                            item.published ? "bg-emerald-500" : "bg-slate-400",
                          ].join(" ")}
                        />
                        {item.published ? "Publié" : "Brouillon"}
                      </button>
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
                {editingId ? "Modifier l'album" : "Nouvel album"}
              </h2>
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(["FR", "EN", "DE"] as LangCode[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={[
                      "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                      activeLang === lang
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    ].join(" ")}
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
                  {activeLang === "FR" ? (
                    <input
                      type="text"
                      required
                      value={form.titleFr}
                      onChange={(e) => handleTitleFrChange(e.target.value)}
className={inputClass}
                      placeholder="Ex : Formation numérique 2025"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[titleField]}
                      onChange={(e) => setForm({ ...form, [titleField]: e.target.value })}
                      className={inputClass}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description {activeLang}
                  </label>
                  <textarea
                    rows={3}
                    value={form[descField]}
                    onChange={(e) => setForm({ ...form, [descField]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true)
                    setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }}
                  className={inputClass + " font-mono"}
                  placeholder="formation-numerique-2025"
                />
<p className="text-[11px] text-slate-400">
                  Identifiant unique de l&apos;album. Généré automatiquement depuis le titre FR.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Image de couverture
                  </label>
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    className={inputClass}
                    placeholder="/uploads/albums/cover.jpg"
                  />
<p className="text-[11px] text-slate-400">
                    URL de l&apos;image d&apos;aperçu de l&apos;album dans la galerie.
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
                    placeholder="0"
                  />
                  <p className="text-[11px] text-slate-400">
                    Position dans la liste des albums (0 = en premier).
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Publier cet album
                </label>
<p className="text-[11px] text-slate-400 ml-5">
                  Un album non publié est invisible dans la galerie publique.
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
                disabled={submitting || !form.titleFr.trim() || !form.slug.trim()}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
