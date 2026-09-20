"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  getDomaines,
  createDomaine,
  updateDomaine,
  deleteDomaine,
  toggleDomaineActive,
} from "@/lib/cms-actions"
import { DomainCharterIcon } from "@/components/DomainIcons"

interface DomaineItem {
  id: string
  slug: string
  code: string
  nameFr: string
  nameEn?: string | null
  nameDe?: string | null
  subtitleFr?: string | null
  subtitleEn?: string | null
  subtitleDe?: string | null
  tagLabel?: string | null
  descFr: string
  descEn?: string | null
  descDe?: string | null
  objectivesFr?: string | null
  objectivesEn?: string | null
  objectivesDe?: string | null
  actionsFr?: string | null
  actionsEn?: string | null
  actionsDe?: string | null
  targetAudienceFr?: string | null
  targetAudienceEn?: string | null
  targetAudienceDe?: string | null
  icon?: string | null
  imageUrl?: string | null
  imageCaptionFr?: string | null
  imageCaptionEn?: string | null
  imageCaptionDe?: string | null
  imageTag?: string | null
  order: number
  active: boolean
  projets?: { id: string; titleFr: string }[]
}

const AVAILABLE_ICONS = [
  { label: "Numérique / Écran (MonitorIcon)", value: "MonitorIcon", code: "INCLUSION_NUMERIQUE" },
  { label: "Formation / Diplôme (GraduationCapIcon)", value: "GraduationCapIcon", code: "JEUNESSE" },
  { label: "Sécurité / Bouclier (ShieldIcon)", value: "ShieldIcon", code: "CYBERSECURITE" },
  { label: "Agriculture / Épi (WheatIcon)", value: "WheatIcon", code: "AGRI_LOWTECH" },
  { label: "Données / Graphique (BarChartIcon)", value: "BarChartIcon", code: "DATA_INNOVATION" },
  { label: "Développement / FabLab (CpuIcon)", value: "CpuIcon", code: "DEV_RURAL" },
]

import { translateCmsFieldsAction } from "@/lib/translator"

export default function AdminDomaines() {
  const [domaines, setDomaines] = useState<DomaineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translatingField, setTranslatingField] = useState<string | null>(null)
  const [translationNotice, setTranslationNotice] = useState("")
  const [showTranslationHelp, setShowTranslationHelp] = useState(true)
  const [activeLangTab, setActiveLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAutoTranslate = async () => {
    if (!formData.nameFr.trim() && !formData.descFr.trim()) {
      setError("Veuillez saisir au moins le nom ou la description en français avant de traduire.")
      return
    }

    setTranslating(true)
    setError("")
    setTranslationNotice("")

    try {
      const res = await translateCmsFieldsAction({
        texts: {
          name: formData.nameFr,
          subtitle: formData.subtitleFr,
          desc: formData.descFr,
          objectives: formData.objectivesFrText,
          actions: formData.actionsFrText,
          targetAudience: formData.targetAudienceFr,
          imageCaption: formData.imageCaptionFr,
        },
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          nameEn: res.translations.EN.name || prev.nameEn,
          subtitleEn: res.translations.EN.subtitle || prev.subtitleEn,
          descEn: res.translations.EN.desc || prev.descEn,
          objectivesEnText: res.translations.EN.objectives || prev.objectivesEnText,
          actionsEnText: res.translations.EN.actions || prev.actionsEnText,
          targetAudienceEn: res.translations.EN.targetAudience || prev.targetAudienceEn,
          imageCaptionEn: res.translations.EN.imageCaption || prev.imageCaptionEn,

          nameDe: res.translations.DE.name || prev.nameDe,
          subtitleDe: res.translations.DE.subtitle || prev.subtitleDe,
          descDe: res.translations.DE.desc || prev.descDe,
          objectivesDeText: res.translations.DE.objectives || prev.objectivesDeText,
          actionsDeText: res.translations.DE.actions || prev.actionsDeText,
          targetAudienceDe: res.translations.DE.targetAudience || prev.targetAudienceDe,
          imageCaptionDe: res.translations.DE.imageCaption || prev.imageCaptionDe,
        }))
        const providerName = res.providerUsed === "deepl" ? "DeepL API" : "Traducteur automatique"
        setTranslationNotice(`Pôle stratégique traduit avec succès via ${providerName}. Consultez les onglets English et Deutsch.`)
      } else {
        setError(res.error || "Erreur lors de la traduction automatique.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau lors de la traduction")
    } finally {
      setTranslating(false)
    }
  }

  const handleTranslateSingleField = async (
    field: "name" | "subtitle" | "desc" | "objectives" | "actions" | "targetAudience" | "imageCaption",
    targetLang: "EN" | "DE"
  ) => {
    const sourceMap: Record<string, string> = {
      name: formData.nameFr,
      subtitle: formData.subtitleFr,
      desc: formData.descFr,
      objectives: formData.objectivesFrText,
      actions: formData.actionsFrText,
      targetAudience: formData.targetAudienceFr,
      imageCaption: formData.imageCaptionFr,
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
        const stateKeyMap: Record<string, string> = {
          name_EN: "nameEn",
          name_DE: "nameDe",
          subtitle_EN: "subtitleEn",
          subtitle_DE: "subtitleDe",
          desc_EN: "descEn",
          desc_DE: "descDe",
          objectives_EN: "objectivesEnText",
          objectives_DE: "objectivesDeText",
          actions_EN: "actionsEnText",
          actions_DE: "actionsDeText",
          targetAudience_EN: "targetAudienceEn",
          targetAudience_DE: "targetAudienceDe",
          imageCaption_EN: "imageCaptionEn",
          imageCaption_DE: "imageCaptionDe",
        }
        const stateKey = stateKeyMap[`${field}_${targetLang}`]
        setFormData((prev) => ({ ...prev, [stateKey]: val }))
        setTranslationNotice(`Champ « ${field} » traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"}.`)
      } else {
        setError(res.error || "Erreur lors de la traduction du champ.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau.")
    } finally {
      setTranslatingField(null)
    }
  }

  const [formData, setFormData] = useState({
    code: "",
    nameFr: "",
    nameEn: "",
    nameDe: "",
    subtitleFr: "",
    subtitleEn: "",
    subtitleDe: "",
    tagLabel: "Pôle Stratégique",
    descFr: "",
    descEn: "",
    descDe: "",
    objectivesFrText: "",
    objectivesEnText: "",
    objectivesDeText: "",
    actionsFrText: "",
    actionsEnText: "",
    actionsDeText: "",
    targetAudienceFr: "",
    targetAudienceEn: "",
    targetAudienceDe: "",
    icon: "MonitorIcon",
    imageUrl: "",
    imageCaptionFr: "",
    imageCaptionEn: "",
    imageCaptionDe: "",
    imageTag: "Ancrage Terrain",
    order: 0,
    active: true,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getDomaines()
      setDomaines(res as any)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const parseArrayToLines = (raw?: string | null): string => {
    if (!raw) return ""
    try {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return arr.join("\n")
    } catch {
      // Raw string
    }
    return raw
  }

  const parseLinesToArray = (text: string): string => {
    const lines = text
      .split("\n")
      .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
      .filter(Boolean)
    return JSON.stringify(lines)
  }

  const handleOpenModal = (dom?: DomaineItem) => {
    setError("")
    if (dom) {
      setEditingId(dom.id)
      setFormData({
        code: dom.code,
        nameFr: dom.nameFr || "",
        nameEn: dom.nameEn || "",
        nameDe: dom.nameDe || "",
        subtitleFr: dom.subtitleFr || "",
        subtitleEn: dom.subtitleEn || "",
        subtitleDe: dom.subtitleDe || "",
        tagLabel: dom.tagLabel || "Pôle Stratégique",
        descFr: dom.descFr || "",
        descEn: dom.descEn || "",
        descDe: dom.descDe || "",
        objectivesFrText: parseArrayToLines(dom.objectivesFr),
        objectivesEnText: parseArrayToLines(dom.objectivesEn),
        objectivesDeText: parseArrayToLines(dom.objectivesDe),
        actionsFrText: parseArrayToLines(dom.actionsFr),
        actionsEnText: parseArrayToLines(dom.actionsEn),
        actionsDeText: parseArrayToLines(dom.actionsDe),
        targetAudienceFr: dom.targetAudienceFr || "",
        targetAudienceEn: dom.targetAudienceEn || "",
        targetAudienceDe: dom.targetAudienceDe || "",
        icon: dom.icon || "MonitorIcon",
        imageUrl: dom.imageUrl || "",
        imageCaptionFr: dom.imageCaptionFr || "",
        imageCaptionEn: dom.imageCaptionEn || "",
        imageCaptionDe: dom.imageCaptionDe || "",
        imageTag: dom.imageTag || "Ancrage Terrain",
        order: dom.order || 0,
        active: dom.active,
      })
    } else {
      setEditingId(null)
      setFormData({
        code: "",
        nameFr: "",
        nameEn: "",
        nameDe: "",
        subtitleFr: "",
        subtitleEn: "",
        subtitleDe: "",
        tagLabel: "Pôle Stratégique",
        descFr: "",
        descEn: "",
        descDe: "",
        objectivesFrText: "",
        objectivesEnText: "",
        objectivesDeText: "",
        actionsFrText: "",
        actionsEnText: "",
        actionsDeText: "",
        targetAudienceFr: "",
        targetAudienceEn: "",
        targetAudienceDe: "",
        icon: "MonitorIcon",
        imageUrl: "",
        imageCaptionFr: "",
        imageCaptionEn: "",
        imageCaptionDe: "",
        imageTag: "Ancrage Terrain",
        order: domaines.length + 1,
        active: true,
      })
    }
    setModalOpen(true)
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

      if (response.ok && result.fileUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: result.fileUrl }))
      } else {
        setError(result.error || "Erreur lors de l'upload de l'image")
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau lors de l'upload")
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nameFr || !formData.descFr || (!editingId && !formData.code)) {
      setError("Le nom (FR), la description (FR) et le code unique sont obligatoires.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const payload: any = {
        nameFr: formData.nameFr,
        nameEn: formData.nameEn || undefined,
        nameDe: formData.nameDe || undefined,
        subtitleFr: formData.subtitleFr || undefined,
        subtitleEn: formData.subtitleEn || undefined,
        subtitleDe: formData.subtitleDe || undefined,
        tagLabel: formData.tagLabel || "Pôle Stratégique",
        descFr: formData.descFr,
        descEn: formData.descEn || undefined,
        descDe: formData.descDe || undefined,
        objectivesFr: parseLinesToArray(formData.objectivesFrText),
        objectivesEn: parseLinesToArray(formData.objectivesEnText),
        objectivesDe: parseLinesToArray(formData.objectivesDeText),
        actionsFr: parseLinesToArray(formData.actionsFrText),
        actionsEn: parseLinesToArray(formData.actionsEnText),
        actionsDe: parseLinesToArray(formData.actionsDeText),
        targetAudienceFr: formData.targetAudienceFr || undefined,
        targetAudienceEn: formData.targetAudienceEn || undefined,
        targetAudienceDe: formData.targetAudienceDe || undefined,
        icon: formData.icon,
        imageUrl: formData.imageUrl || undefined,
        imageCaptionFr: formData.imageCaptionFr || undefined,
        imageCaptionEn: formData.imageCaptionEn || undefined,
        imageCaptionDe: formData.imageCaptionDe || undefined,
        imageTag: formData.imageTag || "Ancrage Terrain",
        order: Number(formData.order),
        active: formData.active,
      }

      if (editingId) {
        const res = await updateDomaine(editingId, payload)
        if (!res.success) {
          setError(res.error || "Erreur lors de la mise à jour")
          return
        }
      } else {
        payload.code = formData.code
        const res = await createDomaine(payload)
        if (!res.success) {
          setError(res.error || "Erreur lors de la création")
          return
        }
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      setError(err.message || "Erreur inattendue")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (dom: DomaineItem) => {
    if (dom.projets && dom.projets.length > 0) {
      alert(`Impossible de supprimer "${dom.nameFr}" : ${dom.projets.length} projet(s) y sont rattachés.`)
      return
    }
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le domaine "${dom.nameFr}" ?`)) {
      return
    }
    try {
      const res = await deleteDomaine(dom.id)
      if (res.success) {
        loadData()
      } else {
        alert(res.error || "Erreur de suppression")
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleToggleActive = async (dom: DomaineItem) => {
    try {
      await toggleDomaineActive(dom.id, !dom.active)
      setDomaines((prev) =>
        prev.map((d) => (d.id === dom.id ? { ...d, active: !dom.active } : d))
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-[#003366] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pôles Stratégiques</span>
          </div>
          <h1 className="text-2xl font-bold text-[#003366]">Domaines d'action (CMS)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les domaines d'intervention, leurs objectifs, actions, cibles et médias d'ancrage terrain.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003366] text-white font-medium text-sm rounded-xl hover:bg-[#002244] transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau domaine
        </button>
      </div>

      {/* ── Table / Cards ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-[#003366] border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Chargement des domaines...</p>
          </div>
        ) : domaines.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">Aucun domaine enregistré.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {domaines.map((dom, idx) => (
              <div
                key={dom.id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:bg-slate-50/70 transition-colors"
              >
                {/* Visual + Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                    {dom.imageUrl ? (
                      <img
                        src={dom.imageUrl}
                        alt={dom.nameFr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <DomainCharterIcon code={dom.code} size={24} color="#003366" />
                      </div>
                    )}
                    <span className="absolute top-1 left-1 bg-black/60 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                      0{dom.order || idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#003366]">{dom.nameFr}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {dom.code}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          dom.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {dom.active ? "Actif" : "Masqué"}
                      </span>
                    </div>

                    {dom.subtitleFr && (
                      <p className="text-xs font-semibold text-[#007BFF]">{dom.subtitleFr}</p>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dom.descFr}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Projets liés : <strong className="text-slate-700">{dom.projets?.length || 0}</strong></span>
                      {dom.targetAudienceFr && (
                        <span className="truncate max-w-[280px]">Cible : {dom.targetAudienceFr}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                  <button
                    onClick={() => handleToggleActive(dom)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      dom.active
                        ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {dom.active ? "Masquer" : "Activer"}
                  </button>

                  <button
                    onClick={() => handleOpenModal(dom)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#003366]/10 text-[#003366] font-semibold hover:bg-[#003366]/20 transition-colors cursor-pointer"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => handleDelete(dom)}
                    className="text-xs px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal d'Édition / Création ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#003366]">
                  {editingId ? "Modifier le Domaine" : "Nouveau Domaine"}
                </h3>
                <p className="text-xs text-slate-500">
                  Remplissez les informations administrables pour ce pôle stratégique.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corps Modal */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
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
                    Le site public applique une <strong>séparation stricte des langues</strong> : si ce domaine n'est pas traduit en anglais ou en allemand, 
                    il <strong>ne s'affichera pas</strong> sur les pages <em>/en/domaines</em> et <em>/de/domainen</em> pour garantir une expérience 100% traduite.
                  </p>
                  <p className="text-amber-700 text-[11px]">
                    Cliquez sur <strong>« Traduire vers EN & DE »</strong> ci-dessous pour remplir instantanément toutes les versions.
                  </p>
                </div>
              )}

              {/* Translation notice banner */}
              {translationNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
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

              {/* Onglets Multilingues & Bouton Traduction Automatique */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex gap-4">
                  {(["FR", "EN", "DE"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLangTab(lang)}
                      className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        activeLangTab === lang
                          ? "border-b-2 border-[#003366] text-[#003366]"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {lang === "FR"
                        ? "Français (Défaut) *"
                        : lang === "EN"
                        ? `English ${formData.nameEn ? "✓" : ""}`
                        : `Deutsch ${formData.nameDe ? "✓" : ""}`}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={translating || !formData.nameFr.trim()}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#003366] text-white shadow-xs hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Traduit automatiquement tous les champs du domaine vers l'anglais et l'allemand"
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

              {/* Contenu spécifique à la langue */}
              {activeLangTab === "FR" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nom du domaine (FR) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nameFr}
                        onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                        placeholder="Ex: Agriculture durable"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sous-titre / Thématique (FR)
                      </label>
                      <input
                        type="text"
                        value={formData.subtitleFr}
                        onChange={(e) => setFormData({ ...formData, subtitleFr: e.target.value })}
                        placeholder="Ex: Écologie & Low-Tech"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description complète / Présentation (FR) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.descFr}
                      onChange={(e) => setFormData({ ...formData, descFr: e.target.value })}
                      placeholder="Présentation générale du domaine et enjeux ruraux..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Objectifs clés (FR - une ligne par objectif)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.objectivesFrText}
                        onChange={(e) => setFormData({ ...formData, objectivesFrText: e.target.value })}
                        placeholder="• Former 1 000 élèves aux bases du code&#10;• Déployer 50 capteurs d'irrigation..."
                        className="w-full px-3 py-2 text-sm font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Actions & Projets (FR - une ligne par action)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.actionsFrText}
                        onChange={(e) => setFormData({ ...formData, actionsFrText: e.target.value })}
                        placeholder="• Caravane numérique itinérante&#10;• Ateliers hebdomadaires au FabLab..."
                        className="w-full px-3 py-2 text-sm font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Publics concernés (FR)
                      </label>
                      <input
                        type="text"
                        value={formData.targetAudienceFr}
                        onChange={(e) => setFormData({ ...formData, targetAudienceFr: e.target.value })}
                        placeholder="Ex: Agriculteurs, groupements maraîchers..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Légende de la photo terrain (FR)
                      </label>
                      <input
                        type="text"
                        value={formData.imageCaptionFr}
                        onChange={(e) => setFormData({ ...formData, imageCaptionFr: e.target.value })}
                        placeholder="Ex: Capteurs d'irrigation et innovations Low-Tech..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeLangTab === "EN" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Domain Name (EN)
                        </label>
                        {formData.nameFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("name", "EN")}
                            disabled={translatingField === "name_EN"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "name_EN" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.nameFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.nameFr}
                        </div>
                      )}
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="Ex: Sustainable Agriculture"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Subtitle (EN)
                        </label>
                        {formData.subtitleFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("subtitle", "EN")}
                            disabled={translatingField === "subtitle_EN"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "subtitle_EN" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.subtitleFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.subtitleFr}
                        </div>
                      )}
                      <input
                        type="text"
                        value={formData.subtitleEn}
                        onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                        placeholder="Ex: Ecology & Low-Tech"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Full Description (EN)
                      </label>
                      {formData.descFr && (
                        <button
                          type="button"
                          onClick={() => handleTranslateSingleField("desc", "EN")}
                          disabled={translatingField === "desc_EN"}
                          className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                          </svg>
                          <span>{translatingField === "desc_EN" ? "Traduction..." : "Traduire ce champ"}</span>
                        </button>
                      )}
                    </div>
                    {formData.descFr && (
                      <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                        Source (FR) : {formData.descFr.length > 200 ? formData.descFr.slice(0, 200) + "..." : formData.descFr}
                      </div>
                    )}
                    <textarea
                      rows={3}
                      value={formData.descEn}
                      onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                      placeholder="Domain overview in English..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Key Objectives (EN - one per line)
                        </label>
                        {formData.objectivesFrText && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("objectives", "EN")}
                            disabled={translatingField === "objectives_EN"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "objectives_EN" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.objectivesFrText && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic whitespace-pre-line">
                          Source (FR) : {formData.objectivesFrText}
                        </div>
                      )}
                      <textarea
                        rows={4}
                        value={formData.objectivesEnText}
                        onChange={(e) => setFormData({ ...formData, objectivesEnText: e.target.value })}
                        className="w-full px-3 py-2 text-sm font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Actions & Projects (EN - one per line)
                        </label>
                        {formData.actionsFrText && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("actions", "EN")}
                            disabled={translatingField === "actions_EN"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "actions_EN" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.actionsFrText && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic whitespace-pre-line">
                          Source (FR) : {formData.actionsFrText}
                        </div>
                      )}
                      <textarea
                        rows={4}
                        value={formData.actionsEnText}
                        onChange={(e) => setFormData({ ...formData, actionsEnText: e.target.value })}
                        className="w-full px-3 py-2 text-sm font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeLangTab === "DE" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Bereichsname (DE)
                        </label>
                        {formData.nameFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("name", "DE")}
                            disabled={translatingField === "name_DE"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "name_DE" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.nameFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.nameFr}
                        </div>
                      )}
                      <input
                        type="text"
                        value={formData.nameDe}
                        onChange={(e) => setFormData({ ...formData, nameDe: e.target.value })}
                        placeholder="Ex: Nachhaltige Landwirtschaft"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Untertitel (DE)
                        </label>
                        {formData.subtitleFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("subtitle", "DE")}
                            disabled={translatingField === "subtitle_DE"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "subtitle_DE" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.subtitleFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {formData.subtitleFr}
                        </div>
                      )}
                      <input
                        type="text"
                        value={formData.subtitleDe}
                        onChange={(e) => setFormData({ ...formData, subtitleDe: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Beschreibung (DE)
                      </label>
                      {formData.descFr && (
                        <button
                          type="button"
                          onClick={() => handleTranslateSingleField("desc", "DE")}
                          disabled={translatingField === "desc_DE"}
                          className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                          </svg>
                          <span>{translatingField === "desc_DE" ? "Traduction..." : "Traduire ce champ"}</span>
                        </button>
                      )}
                    </div>
                    {formData.descFr && (
                      <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                        Source (FR) : {formData.descFr.length > 200 ? formData.descFr.slice(0, 200) + "..." : formData.descFr}
                      </div>
                    )}
                    <textarea
                      rows={3}
                      value={formData.descDe}
                      onChange={(e) => setFormData({ ...formData, descDe: e.target.value })}
                      placeholder="Deutsche Beschreibung..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Schlüsselziele (DE - eine Zeile pro Ziel)
                        </label>
                        {formData.objectivesFrText && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("objectives", "DE")}
                            disabled={translatingField === "objectives_DE"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "objectives_DE" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.objectivesFrText && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic whitespace-pre-line">
                          Source (FR) : {formData.objectivesFrText}
                        </div>
                      )}
                      <textarea
                        rows={4}
                        value={formData.objectivesDeText}
                        onChange={(e) => setFormData({ ...formData, objectivesDeText: e.target.value })}
                        className="w-full px-3 py-2 text-sm font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Aktionen & Projekte (DE - eine Zeile pro Aktion)
                        </label>
                        {formData.actionsFrText && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("actions", "DE")}
                            disabled={translatingField === "actions_DE"}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>{translatingField === "actions_DE" ? "Traduction..." : "Traduire"}</span>
                          </button>
                        )}
                      </div>
                      {formData.actionsFrText && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic whitespace-pre-line">
                          Source (FR) : {formData.actionsFrText}
                        </div>
                      )}
                      <textarea
                        rows={4}
                        value={formData.actionsDeText}
                        onChange={(e) => setFormData({ ...formData, actionsDeText: e.target.value })}
                        className="w-full px-3 py-2 text-sm font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paramètres Généraux & Médias */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                  Paramètres Système & Médias
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Code Technique *
                    </label>
                    <input
                      type="text"
                      disabled={!!editingId}
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: AGRI_LOWTECH"
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl outline-none focus:border-[#003366] disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Icône du Domaine
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.value} value={ic.value}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ordre d'affichage (01, 02...)
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#003366]"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Photo d'Ancrage Terrain
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#003366]/10 file:text-[#003366] hover:file:bg-[#003366]/20 cursor-pointer"
                    />
                    {uploadingImage && <span className="text-xs text-slate-400">Upload en cours...</span>}
                  </div>
                </div>

                {/* Switch Actif */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="domainActive"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-[#003366] rounded border-slate-300 focus:ring-[#003366]"
                  />
                  <label htmlFor="domainActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Domaine actif et visible publiquement sur le portail
                  </label>
                </div>
              </div>

              {/* Boutons Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-[#003366] text-white hover:bg-[#002244] rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer le domaine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
