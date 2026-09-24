"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  getArticles,
  getArticleCategories,
  createArticle,
  deleteArticle,
  updateArticle,
  toggleArticleFeatured,
} from "@/lib/cms-actions"

interface ArticleItem {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  excerptFr: string
  excerptEn?: string | null
  excerptDe?: string | null
  contentFr: string
  contentEn?: string | null
  contentDe?: string | null
  featuredImage?: string | null
  published: boolean
  isFeatured: boolean
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

import { translateCmsFieldsAction } from "@/lib/translator"

export default function AdminArticles() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translatingField, setTranslatingField] = useState<string | null>(null)
  const [translationNotice, setTranslationNotice] = useState("")
  const [showTranslationHelp, setShowTranslationHelp] = useState(true)
  const [error, setError] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Sub-tab de langue dans le modal
  const [articleLangTab, setArticleLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState({
    titleFr: "",
    titleEn: "",
    titleDe: "",
    excerptFr: "",
    excerptEn: "",
    excerptDe: "",
    contentFr: "",
    contentEn: "",
    contentDe: "",
    categoryId: "",
    authorName: "Équipe APTIC-R",
    featuredImage: "",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleOpenModal = (article?: ArticleItem) => {
    setError("")
    setTranslationNotice("")
    setArticleLangTab("FR")
    if (article) {
      setEditingId(article.id)
      setFormData({
        titleFr: article.titleFr || "",
        titleEn: article.titleEn || "",
        titleDe: article.titleDe || "",
        excerptFr: article.excerptFr || "",
        excerptEn: article.excerptEn || "",
        excerptDe: article.excerptDe || "",
        contentFr: article.contentFr || "",
        contentEn: article.contentEn || "",
        contentDe: article.contentDe || "",
        categoryId: article.categoryId || categories[0]?.id || "",
        authorName: article.authorName || "Équipe APTIC-R",
        featuredImage: article.featuredImage || "",
        published: article.published || false,
      })
    } else {
      setEditingId(null)
      setFormData({
        titleFr: "",
        titleEn: "",
        titleDe: "",
        excerptFr: "",
        excerptEn: "",
        excerptDe: "",
        contentFr: "",
        contentEn: "",
        contentDe: "",
        categoryId: categories[0]?.id || "",
        authorName: "Équipe APTIC-R",
        featuredImage: "",
        published: false,
      })
    }
    setModalOpen(true)
  }

  const handleAutoTranslate = async () => {
    if (!formData.titleFr.trim() && !formData.excerptFr.trim()) {
      setError("Veuillez saisir au moins le titre ou le résumé en français avant de traduire.")
      return
    }

    setTranslating(true)
    setError("")
    setTranslationNotice("")

    try {
      const res = await translateCmsFieldsAction({
        texts: {
          title: formData.titleFr,
          excerpt: formData.excerptFr,
          content: formData.contentFr || formData.excerptFr,
        },
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          titleEn: res.translations.EN.title || prev.titleEn,
          excerptEn: res.translations.EN.excerpt || prev.excerptEn,
          contentEn: res.translations.EN.content || prev.contentEn,
          titleDe: res.translations.DE.title || prev.titleDe,
          excerptDe: res.translations.DE.excerpt || prev.excerptDe,
          contentDe: res.translations.DE.content || prev.contentDe,
        }))
        const providerName = res.providerUsed === "deepl" ? "DeepL API" : "Traducteur automatique"
        setTranslationNotice(`Article traduit avec succès via ${providerName}. Consultez les onglets English et Deutsch.`)
      } else {
        setError(res.error || "Erreur lors de la traduction automatique.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion lors de la traduction")
    } finally {
      setTranslating(false)
    }
  }

  const handleTranslateSingleField = async (field: "title" | "excerpt" | "content", targetLang: "EN" | "DE") => {
    const sourceMap = {
      title: formData.titleFr,
      excerpt: formData.excerptFr,
      content: formData.contentFr || formData.excerptFr,
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
          ? (field === "title" ? "titleEn" : field === "excerpt" ? "excerptEn" : "contentEn")
          : (field === "title" ? "titleDe" : field === "excerpt" ? "excerptDe" : "contentDe")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titleFr.trim() || !formData.contentFr.trim()) {
      setError("Le titre et le contenu en français sont obligatoires.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const payload = {
        titleFr: formData.titleFr,
        titleEn: formData.titleEn || undefined,
        titleDe: formData.titleDe || undefined,
        excerptFr: formData.excerptFr || formData.contentFr.slice(0, 150),
        excerptEn: formData.excerptEn || undefined,
        excerptDe: formData.excerptDe || undefined,
        contentFr: formData.contentFr,
        contentEn: formData.contentEn || undefined,
        contentDe: formData.contentDe || undefined,
        categoryId: formData.categoryId || undefined,
        authorName: formData.authorName,
        featuredImage: formData.featuredImage || undefined,
        published: formData.published,
      }

      const res = editingId
        ? await updateArticle(editingId, payload)
        : await createArticle(payload)

      if (res.success) {
        setModalOpen(false)
        setEditingId(null)
        setArticleLangTab("FR")
        setFormData({
          titleFr: "",
          titleEn: "",
          titleDe: "",
          excerptFr: "",
          excerptEn: "",
          excerptDe: "",
          contentFr: "",
          contentEn: "",
          contentDe: "",
          categoryId: categories[0]?.id || "",
          authorName: "Équipe APTIC-R",
          featuredImage: "",
          published: false,
        })
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

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const nextFeatured = !currentFeatured
      const res = await toggleArticleFeatured(id, nextFeatured)
      if (res.success) {
        setFeedbackMessage(nextFeatured ? "Cet article est maintenant à la une." : "Cet article n'est plus à la une.")
        setTimeout(() => setFeedbackMessage(null), 2000)
        setArticles((prev) =>
          prev.map((a) => {
            if (a.id === id) {
              return { ...a, isFeatured: nextFeatured }
            }
            if (nextFeatured) {
              return { ...a, isFeatured: false }
            }
            return a
          })
        )
      } else {
        alert(res.error || "Erreur lors de la mise à la une.")
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── Feedback Notification ── */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <span className="text-[#28A745]">✓</span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">
            Articles & Actualités
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les publications, actualités de terrain et récits d&apos;APTIC-R.
          </p>
        </div>

        <button
          onClick={() => {
            setArticleLangTab("FR")
            setModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003366] text-white font-medium text-sm rounded-xl hover:bg-[#002244] transition-colors shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* ── Articles Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Titre</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">À la une</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Vues</th>
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
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span
                        className="hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                        onClick={() => handleOpenModal(art)}
                      >
                        {art.titleFr}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {art.category?.nameFr || "Non classé"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(art.id, art.isFeatured)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          art.isFeatured
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {art.isFeatured ? "✓ À la une" : "Mettre à la une"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(art.id, art.published)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          art.published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {art.published ? "✓ Publié" : "Brouillon"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-700">
                      {art.viewsCount}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(art.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(art)}
                          className="px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 text-xs font-semibold transition-colors cursor-pointer"
                          title="Modifier l'article"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(art.id, art.titleFr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Supprimer l'article"
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

      {/* ── Create / Edit Article Modal avec Onglets Multilingues & Sélecteur Image ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#003366]">
                {editingId ? "Modifier l'Article" : "Créer un Nouvel Article"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
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
                  Le site applique une <strong>séparation stricte des langues</strong> : un article non traduit en anglais ou en allemand 
                  <strong>ne sera pas visible</strong> sur <em>/en/actualites</em> et <em>/de/aktuelles</em> afin de maintenir un contenu éditorial irréprochable.
                </p>
                <p className="text-amber-700 text-[11px]">
                  Cliquez sur <strong>« Traduire vers EN & DE »</strong> dans l'onglet français pour traduire le titre, l'extrait et le contenu en un clic.
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

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {/* Catégorie & Auteur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                  >
                    {categories.length === 0 ? (
                      <option value="">Chargement des catégories...</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameFr}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nom de l&apos;auteur
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Image à la une avec sélection de fichier */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/80">
                <label className="block text-xs font-bold text-[#003366] uppercase mb-2">
                  Image principale / Couverture (Optionnelle)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.featuredImage && (
                    <div className="w-24 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                      <img src={formData.featuredImage} alt="Couverture" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                        <svg className="w-4 h-4 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{uploadingImage ? "Téléversement..." : "Choisir une image"}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                        />
                      </label>
                      {formData.featuredImage && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, featuredImage: "" }))}
                          className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Formats acceptés : JPG, PNG, WEBP, AVIF (Max 5 Mo).
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── Onglets Multilingues (FR / EN / DE) ─── */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                    Rédaction multilingue
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-white rounded-xl p-1 border border-slate-200 gap-1">
                      {(["FR", "EN", "DE"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setArticleLangTab(l)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            articleLangTab === l
                              ? "bg-[#003366] text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {l === "FR" ? "Français *" : l === "EN" ? `English ${formData.titleEn ? "✓" : ""}` : `Deutsch ${formData.titleDe ? "✓" : ""}`}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoTranslate}
                      disabled={translating || !formData.titleFr.trim()}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#003366] text-white shadow-xs hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                      title="Traduit automatiquement le titre, le résumé et le contenu vers l'anglais et l'allemand"
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
                </div>

                {/* Contenu FR */}
                {articleLangTab === "FR" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Titre de l&apos;article (Français) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Lancement des ateliers de fabrication numérique à Agbélouvé"
                        value={formData.titleFr}
                        onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Résumé / Chapô (Français) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Courte description d'accroche pour la liste..."
                        value={formData.excerptFr}
                        onChange={(e) => setFormData({ ...formData, excerptFr: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Corps de l&apos;article (Français) *
                      </label>
                      <textarea
                        required
                        rows={6}
                        placeholder="Contenu complet de l'article..."
                        value={formData.contentFr}
                        onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* Contenu EN */}
                {articleLangTab === "EN" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Article Title (English - Optional)
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
                        placeholder="ex: Launch of digital fabrication workshops in Agbélouvé"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Summary / Excerpt (English - Optional)
                        </label>
                        {formData.excerptFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("excerpt", "EN")}
                            disabled={translatingField === "excerpt_EN"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "excerpt_EN" ? "Traduction..." : "Traduire ce champ"}</span>
                          </button>
                        )}
                      </div>
                      {formData.excerptFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.excerptFr}
                        </div>
                      )}
                      <textarea
                        rows={2}
                        placeholder="Short summary for the English list..."
                        value={formData.excerptEn}
                        onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Article Content (English - Optional)
                        </label>
                        {formData.contentFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("content", "EN")}
                            disabled={translatingField === "content_EN"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "content_EN" ? "Traduction..." : "Traduire ce champ"}</span>
                          </button>
                        )}
                      </div>
                      {formData.contentFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.contentFr.length > 200 ? formData.contentFr.slice(0, 200) + "..." : formData.contentFr}
                        </div>
                      )}
                      <textarea
                        rows={6}
                        placeholder="Full article body in English..."
                        value={formData.contentEn}
                        onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Contenu DE */}
                {articleLangTab === "DE" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Artikel-Titel (Deutsch - Optional)
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
                        placeholder="ex: Start der digitalen Werkstätten in Agbélouvé"
                        value={formData.titleDe}
                        onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Zusammenfassung (Deutsch - Optional)
                        </label>
                        {formData.excerptFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("excerpt", "DE")}
                            disabled={translatingField === "excerpt_DE"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "excerpt_DE" ? "Traduction..." : "Traduire ce champ"}</span>
                          </button>
                        )}
                      </div>
                      {formData.excerptFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.excerptFr}
                        </div>
                      )}
                      <textarea
                        rows={2}
                        placeholder="Kurzbeschreibung auf Deutsch..."
                        value={formData.excerptDe}
                        onChange={(e) => setFormData({ ...formData, excerptDe: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Vollständiger Text (Deutsch - Optional)
                        </label>
                        {formData.contentFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("content", "DE")}
                            disabled={translatingField === "content_DE"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "content_DE" ? "Traduction..." : "Traduire ce champ"}</span>
                          </button>
                        )}
                      </div>
                      {formData.contentFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.contentFr.length > 200 ? formData.contentFr.slice(0, 200) + "..." : formData.contentFr}
                        </div>
                      )}
                      <textarea
                        rows={6}
                        placeholder="Vollständiger Artikelinhalt auf Deutsch..."
                        value={formData.contentDe}
                        onChange={(e) => setFormData({ ...formData, contentDe: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none bg-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-[#003366] focus:ring-[#003366]"
                />
                <label htmlFor="pubCheck" className="text-xs font-semibold text-slate-700 select-none">
                  Publier immédiatement cet article sur le site
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                  * Champs obligatoires
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#007BFF] text-white hover:bg-[#0069d9] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {submitting
                      ? "Enregistrement..."
                      : editingId
                      ? "Enregistrer les modifications"
                      : "Créer l'article"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
