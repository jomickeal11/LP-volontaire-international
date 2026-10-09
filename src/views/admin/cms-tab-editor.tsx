"use client"

/**
 * Descripteur minimal d'un onglet CMS, indépendant de sa configuration métier.
 * Chaque onglet fournit sa propre logique de complétion et de résolution de clés.
 */
/** Clés de base des champs traduisibles de l'onglet, tous langages confondus. */
/** Résout la clé de base d'un champ traduisible (suffixe de langue exclu). */
/**
 * Clés de base supplémentaires suivies par la baseline (champs non traduisibles,
 * clés de publication, compteurs de blocs dynamiques). Par défaut, seules les
 * clés traduisibles sont suivies.
 */

/**
 * Comportement commun à tous les onglets CMS multilingues :
 * - changement de langue = simple contexte d'édition (aucune traduction, aucune écriture) ;
 * - traduction IA = proposition pré-remplie localement, persistée uniquement sur enregistrement ;
 * - confirmation avant remplacement de contenus existants ;
 * - suivi des modifications non enregistrées + restauration via « Annuler ».
 */

/**
 * Ensemble des clés de base suivies par la baseline : champs traduisibles
 * (les 3 langues) + éventuelles clés non multilingues declarées par l'onglet.
 */
// Conserver les valeurs déjà connues pour les clés absentes du payload.

// ─── Composants d'interface partagés ────────────────────────────────────────

import React, { useState } from "react"
import { translateCmsFieldsAction } from "@/lib/translator"

export type CmsLang = "FR" | "EN" | "DE"
export type CmsNotice = {
  type: "success" | "error" | "info"
  text: string
} | null

export interface CmsCompleteness {
  totalCount: number
  filledCount: number
  percentage: number
  isComplete?: boolean
}

export function cmsLangLabel(lang: CmsLang): string {
  return lang === "FR" ? "Français" : lang === "EN" ? "English" : "Deutsch"
}

export function cmsLangAdjective(lang: CmsLang): string {
  return lang === "FR" ? "français" : lang === "EN" ? "anglais" : "allemand"
}

export function cmsTargetLang(lang: CmsLang): "EN" | "DE" {
  return lang === "DE" ? "DE" : "EN"
}
export interface CmsTabEditorOptions<Field> {
  translatableKeys: (scope: "ALL" | string) => Field[]
  baseKey: (field: Field) => string
  trackedKeys?: () => string[]
}

export type CmsPendingTranslation = {
  scope: "ALL" | string
  targetLang: "EN" | "DE"
}

export type CmsSettingPair = {
  key: string
  value: string
}

export function diffCmsSettings<Entry extends CmsSettingPair>(
  entries: Entry[],
  baseline: Record<string, string>,
): Entry[] {
  const uniqueEntries = new Map<string, Entry>()
  entries.forEach((entry) => uniqueEntries.set(entry.key, entry))

  return Array.from(uniqueEntries.values()).filter(
    (entry) => (baseline[entry.key] ?? "") !== entry.value,
  )
}

export interface CmsTabEditor<Field> {
  langTab: CmsLang
  setLangTab: (lang: CmsLang) => void
  notice: CmsNotice
  setNotice: React.Dispatch<React.SetStateAction<CmsNotice>>
  isDirty: boolean
  isReady: boolean
  translating: boolean
  sectionTranslating: string | null
  pendingTranslation: CmsPendingTranslation | null
  switchLang: (lang: CmsLang) => void
  requestTranslation: (scope: "ALL" | string, targetLang: "EN" | "DE") => void
  confirmPendingTranslation: () => void
  cancelPendingTranslation: () => void
  cancelChanges: () => void
  markLoaded: (source?: Record<string, string>) => void
  markSaved: (payload: CmsSettingPair[]) => void
}
export function useCmsTabEditor<Field>(
  values: Record<string, string>,
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  options: CmsTabEditorOptions<Field>,
): CmsTabEditor<Field> {
  const [langTab, setLangTab] = useState<CmsLang>("FR")
  const [notice, setNotice] = useState<CmsNotice>(null)
  const [baseline, setBaseline] = useState<Record<string, string> | null>(null)
  const [translating, setTranslating] = useState(false)
  const [sectionTranslating, setSectionTranslating] = useState<string | null>(
    null,
  )
  const [pendingTranslation, setPendingTranslation] = useState<{
    scope: "ALL" | string
    targetLang: "EN" | "DE"
  } | null>(null)

  const { translatableKeys, baseKey, trackedKeys } = options

  const scopeFields = (scope: "ALL" | string) => translatableKeys(scope)
  const trackedBaseKeys = () => {
    const keys: string[] = []
    scopeFields("ALL").forEach((field) => {
      const key = baseKey(field)
      if (!keys.includes(key)) keys.push(key)
    })
    if (trackedKeys) {
      trackedKeys().forEach((key) => {
        if (!keys.includes(key)) keys.push(key)
      })
    }
    return keys
  }

  const snapshot = (source: Record<string, string>, fields: Field[]) => {
    const snap: Record<string, string> = {}
    fields.forEach((field) => {
      const key = baseKey(field)
      ;(["FR", "EN", "DE"] as const).forEach((lang) => {
        const dbKey = `${key}_${lang.toLowerCase()}`
        snap[dbKey] = source[dbKey] || ""
      })
    })
    return snap
  }

  const buildBaseline = (source: Record<string, string>) => {
    const fields = scopeFields("ALL")
    const snap = snapshot(source, fields)
    if (trackedKeys) {
      trackedKeys().forEach((key) => {
        snap[key] = source[key] || ""
      })
    }
    return snap
  }

  const isDirty = (() => {
    if (!baseline) return false
    return Object.keys(baseline).some(
      (key) => (values[key] || "") !== (baseline[key] || ""),
    )
  })()

  const markLoaded = (source?: Record<string, string>) => {
    setBaseline(buildBaseline(source || values))
  }

  const markSaved = (payload: CmsSettingPair[]) => {
    setBaseline((current) => {
      const updated = { ...(current ?? buildBaseline(values)) }
      payload.forEach((item) => {
        updated[item.key] = item.value
      })
      return updated
    })
  }

  const switchLang = (lang: CmsLang) => {
    setLangTab(lang)
    setNotice(null)
  }

  const cancelChanges = () => {
    if (!baseline) return
    setValues((prev) => ({ ...prev, ...baseline }))
    setNotice({
      type: "info",
      text: "Modifications non enregistrées annulées. Les contenus enregistrés ont été restaurés.",
    })
  }

  const runTranslation = async (
    scope: "ALL" | string,
    targetLang: "EN" | "DE",
  ) => {
    const fields = scopeFields(scope)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((field) => {
      const frValue = (values[`${baseKey(field)}_fr`] || "").trim()
      if (frValue) textsToTranslate[baseKey(field)] = frValue
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setNotice({
        type: "error",
        text: "Aucun contenu français renseigné. Complétez d'abord la version française de référence.",
      })
      return
    }

    if (scope === "ALL") setTranslating(true)
    else setSectionTranslating(scope)
    setNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const proposal: Record<string, string> = {}
        Object.entries(res.translations[targetLang]).forEach(([key, field]) => {
          if (field.status === "failed") return
          proposal[`${key}_${targetLang.toLowerCase()}`] = field.text
        })

        setValues((prev) => ({ ...prev, ...proposal }))

        setNotice({
          type: res.outcome.level === "success" ? "success" : "info",
          text: `${res.outcome.message} ${Object.keys(proposal).length} champ(s) prérempli(s) en ${cmsLangLabel(targetLang)}. Vérifiez et ajustez les textes, puis cliquez sur « Enregistrer » pour les valider.`,
        })
      } else {
        setNotice({
          type: "error",
          text: res.error || res.outcome.message || "Erreur lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      if (scope === "ALL") setTranslating(false)
      else setSectionTranslating(null)
    }
  }

  const requestTranslation = (
    scope: "ALL" | string,
    targetLang: "EN" | "DE",
  ) => {
    const fields = scopeFields(scope)

    const hasFrenchSource = fields.some(
      (field) => (values[`${baseKey(field)}_fr`] || "").trim().length > 0,
    )

    if (!hasFrenchSource) {
      setNotice({
        type: "error",
        text:
          scope === "ALL"
            ? "Aucun contenu français n'est renseigné. Complétez d'abord la version française de référence."
            : "Aucun contenu français n'est renseigné pour cette section. Complétez d'abord la version française.",
      })
      return
    }

    const hasExistingTarget = fields.some(
      (field) =>
        (values[`${baseKey(field)}_${targetLang.toLowerCase()}`] || "").trim()
          .length > 0,
    )

    if (hasExistingTarget) {
      setPendingTranslation({ scope, targetLang })
      return
    }

    void runTranslation(scope, targetLang)
  }

  const confirmPendingTranslation = () => {
    const pending = pendingTranslation
    setPendingTranslation(null)
    if (pending) void runTranslation(pending.scope, pending.targetLang)
  }

  const cancelPendingTranslation = () => {
    setPendingTranslation(null)
  }

  return {
    langTab,
    setLangTab,
    notice,
    setNotice,
    isDirty,
    isReady: baseline !== null,
    translating,
    sectionTranslating,
    pendingTranslation,
    switchLang,
    requestTranslation,
    confirmPendingTranslation,
    cancelPendingTranslation,
    cancelChanges,
    markLoaded,
    markSaved,
  }
}

export function CmsLangSwitcher({
  value,
  onChange,
}: {
  value: CmsLang
  onChange: (lang: CmsLang) => void
}) {
  return (
    <div className="flex items-center gap-1 bg-[#F7F8FA] border border-slate-200 rounded-xl p-1 self-start lg:self-auto shrink-0">
      {(["FR", "EN", "DE"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          aria-pressed={value === lang}
          className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            value === lang
              ? "bg-[#003366] text-white shadow-xs"
              : "text-slate-500 hover:text-[#003366] hover:bg-white"
          }`}
        >
          {cmsLangLabel(lang)}
        </button>
      ))}
    </div>
  )
}

export function CmsCompletenessBar({
  completeness,
  lang,
  summaryLabel,
  alwaysShowProgress = false,
  onTranslate,
  translating,
  sectionTranslating,
}: {
  completeness: CmsCompleteness
  lang: CmsLang
  summaryLabel?: string
  alwaysShowProgress?: boolean
  onTranslate?: () => void
  translating: boolean
  sectionTranslating: string | null
}) {
  const isComplete = completeness.isComplete ?? completeness.percentage === 100
  const statusColor = isComplete
    ? "bg-[#28A745]"
    : completeness.percentage > 60
      ? "bg-amber-500"
      : "bg-rose-400"

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2 border-t border-slate-100 bg-slate-50/30">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-medium text-slate-500">
          {summaryLabel ? (
            <>
              {summaryLabel} · {completeness.filledCount}/
              {completeness.totalCount} champs renseignés
            </>
          ) : (
            <>
              Contenu {cmsLangLabel(lang)} · {completeness.filledCount}/
              {completeness.totalCount} champs ·{" "}
              <span className={isComplete ? "text-[#28A745] font-semibold" : "text-amber-500 font-semibold"}>
                {isComplete ? "Complet" : "Incomplet"}
              </span>
            </>
          )}
        </span>
        <span className={`${alwaysShowProgress ? "block" : "hidden sm:block"} w-12 h-1 rounded-full bg-slate-200 overflow-hidden`}>
          <span
            className={`block h-full ${statusColor}`}
            style={{ width: `${completeness.percentage}%` }}
          />
        </span>
      </div>

      {onTranslate && lang !== "FR" && (
        <button
          type="button"
          onClick={onTranslate}
          disabled={translating || sectionTranslating !== null}
          title="L'IA pré-remplit les champs de cette langue à partir du français. La proposition reste modifiable et n'est enregistrée qu'après validation."
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#007BFF] text-white hover:bg-[#0069d9] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {translating ? (
            <span>Traduction en cours…</span>
          ) : (
            <>
              <span>Pré-remplir {lang} depuis FR</span>
              <span className="px-1.5 py-0.5 rounded bg-white/25 text-[10px] font-bold tracking-wide">
                IA
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export function CmsSectionTranslateButton({
  lang,
  onClick,
  busy,
}: {
  lang: CmsLang
  onClick: () => void
  busy: boolean
}) {
  if (lang === "FR") return null
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title="L'IA pré-remplit uniquement les champs de cette section à partir du français."
      className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-[#003366]/25 text-[#003366] hover:bg-[#003366]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {busy ? "Traduction…" : "Traduire cette section depuis FR"}
    </button>
  )
}

export function CmsNoticeBanner({
  notice,
  onClose,
}: {
  notice: CmsNotice
  onClose?: () => void
}) {
  if (!notice) return null
  return (
    <div
      className={`inline-flex w-fit max-w-full items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium border ${
        notice.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : notice.type === "info"
            ? "bg-[#007BFF]/5 border-[#007BFF]/20 text-[#003366]"
            : "bg-rose-50 border-rose-200 text-rose-800"
      }`}
    >
      <span className="min-w-0">{notice.text}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le message"
          className="shrink-0 text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  )
}

export function CmsSaveBar({
  isDirty,
  isReady,
  saving,
  saved = false,
  lang,
  onCancel,
  onSubmit,
}: {
  isDirty: boolean
  isReady: boolean
  saving: boolean
  saved?: boolean
  lang: CmsLang
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <div className="pointer-events-auto fixed bottom-0 left-0 lg:left-60 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 lg:px-12 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isDirty ? "bg-amber-500" : "bg-[#28A745]"
            }`}
          />
          <span className="text-xs font-bold text-slate-700 truncate">
            {isDirty
              ? "Modifications non enregistrées"
              : "Toutes les modifications sont enregistrées"}
          </span>
          <span className="hidden md:inline text-[11px] text-slate-400 truncate">
            · Édition en {cmsLangLabel(lang)}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CmsReplaceConfirmDialog({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: CmsPendingTranslation | null
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!pending) return null
  const adjective = cmsLangAdjective(pending.targetLang)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-slate-800">
          Remplacer les contenus {adjective} existants ?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Des contenus {adjective} existent déjà. Voulez-vous les remplacer par
          une nouvelle proposition de traduction depuis le français ? La
          proposition restera modifiable et ne sera enregistrée qu&apos;après
          votre validation.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#007BFF] hover:bg-[#0069d9] cursor-pointer"
          >
            Remplacer
          </button>
        </div>
      </div>
    </div>
  )
}
