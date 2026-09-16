"use client"

import React, { useState, useEffect } from "react"
import { getArticles, getArticleCategories, createArticle, deleteArticle, updateArticle } from "@/lib/cms-actions"

interface ArticleItem {
  id: string
  slug: string
  titleFr: string
  excerptFr: string
  contentFr: string
  published: boolean
  publishedAt?: Date | null
  authorName?: string | null
  viewsCount: number
  categoryId?: string | null
  category?: {
    id: string
    nameFr: string
  } | null
  createdAt: Date
}

interface CategoryItem {
  id: string
  slug: string
  nameFr: string
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    titleFr: "",
    categoryId: "",
    authorName: "Équipe APTIC-R",
    excerptFr: "",
    contentFr: "",
    published: false,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [arts, cats] = await Promise.all([
        getArticles({ publishedOnly: false }),
        getArticleCategories(),
      ])
      setArticles(arts as any)
      setCategories(cats)
      if (cats.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }))
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
      const res = await createArticle({
        titleFr: formData.titleFr,
        categoryId: formData.categoryId || undefined,
        authorName: formData.authorName,
        excerptFr: formData.excerptFr,
        contentFr: formData.contentFr,
        published: formData.published,
      })

      if (res.success) {
        setModalOpen(false)
        setFormData({
          titleFr: "",
          categoryId: categories[0]?.id || "",
          authorName: "Équipe APTIC-R",
          excerptFr: "",
          contentFr: "",
          published: false,
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
    if (!confirm(`Supprimer l'article "${title}" ? Cette action est irréversible.`)) {
      return
    }
    try {
      await deleteArticle(id)
      setArticles((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateArticle(id, { published: !current })
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !current } : a))
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
            CMS : Articles & Actualités
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rédigez, publiez et gérez les actualités, communiqués et articles du blog d&apos;APTIC-R.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>✍️</span>
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* ── Articles Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Titre</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Auteur</th>
                <th className="py-3.5 px-4">Vues</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chargement des articles...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun article publié pour le moment.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {art.titleFr}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#174F7A]">
                      {art.category?.nameFr || "Sans catégorie"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {art.authorName || "Équipe"}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-700">
                      {art.viewsCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(art.id, art.published)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          art.published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {art.published ? "✓ Publié" : "Brouillon"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(art.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(art.id, art.titleFr)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold"
                          title="Supprimer l'article"
                        >
                          🗑️
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

      {/* ── Create Article Modal ── */}
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
              <h2 className="text-xl font-bold text-slate-800">
                Créer un Nouvel Article
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
                  Titre de l&apos;article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Lancement des ateliers de fabrication numérique à Agbélouvé"
                  value={formData.titleFr}
                  onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de l&apos;auteur
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Extrait / Chapô (court résumé) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Résumé percutant qui apparaîtra dans les cartes de listing..."
                  value={formData.excerptFr}
                  onChange={(e) => setFormData({ ...formData, excerptFr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contenu complet de l&apos;article *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Rédigez votre article ici..."
                  value={formData.contentFr}
                  onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none font-sans resize-y"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300"
                />
                <label htmlFor="pub" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Publier immédiatement cet article sur le site public
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
                  {submitting ? "Enregistrement..." : "Créer l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
