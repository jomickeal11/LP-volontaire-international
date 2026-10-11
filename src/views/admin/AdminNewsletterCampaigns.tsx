"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, FilePlus2, Mail, RefreshCw, Save, Send, Trash2 } from "lucide-react"
import {
  deleteNewsletterCampaign,
  getNewsletterCampaigns,
  launchNewsletterCampaign,
  previewNewsletterCampaignLaunch,
  processNewsletterCampaignBatch,
  saveNewsletterCampaign,
  sendNewsletterCampaignTestEmail,
} from "@/lib/cms-actions"
import { newsletterCampaignSchema } from "@/lib/cms-validations"
import { buildNewsletterCampaignSendPayload } from "@/lib/newsletter-campaign"
import { wrapEmailHtml } from "@/lib/email/templates/emailTheme"

type Lang = "FR" | "EN" | "DE"
type Campaign = {
  id: string
  name: string
  lang: Lang
  status: string
  startedAt: Date | null
  completedAt: Date | null
  totalRecipients: number
  sentCount: number
  failedCount: number
  deliveryCounts: { sent: number; failed: number; pending: number; sending: number }
  subjectFr: string
  subjectEn: string
  subjectDe: string
  contentFr: string
  contentEn: string
  contentDe: string
  lastTestSentAt: Date | null
  createdAt: Date
  updatedAt: Date
}
type Draft = Omit<Campaign, "id" | "status" | "startedAt" | "completedAt" | "totalRecipients" | "sentCount" | "failedCount" | "deliveryCounts" | "lastTestSentAt" | "createdAt" | "updatedAt">
type CampaignBatchResult =
  | { success: true; complete: boolean; stalled: boolean; sentCount: number; failedCount: number; pendingCount: number; sendingCount: number }
  | { success: false; error: string }
type AudiencePreview = {
  success: true
  campaignId: string
  campaignName: string
  eligibleCount: number
  countsByLanguage: Record<Lang, number>
  missingLanguages: Lang[]
  ready: boolean
}

const LANGS: Lang[] = ["FR", "EN", "DE"]
const EMPTY_DRAFT: Draft = {
  name: "",
  lang: "FR",
  subjectFr: "",
  subjectEn: "",
  subjectDe: "",
  contentFr: "",
  contentEn: "",
  contentDe: "",
}
const FIELD_BY_LANG: Record<Lang, { subject: keyof Draft; content: keyof Draft }> = {
  FR: { subject: "subjectFr", content: "contentFr" },
  EN: { subject: "subjectEn", content: "contentEn" },
  DE: { subject: "subjectDe", content: "contentDe" },
}
const LANG_LABEL: Record<Lang, string> = { FR: "Français", EN: "English", DE: "Deutsch" }
const CAMPAIGN_STATUS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENDING: "Envoi en cours",
  SENT: "Envoyée",
  COMPLETED_WITH_ERRORS: "Terminée avec des erreurs",
}

function fromCampaign(campaign: Campaign): Draft {
  return {
    name: campaign.name,
    lang: campaign.lang,
    subjectFr: campaign.subjectFr,
    subjectEn: campaign.subjectEn,
    subjectDe: campaign.subjectDe,
    contentFr: campaign.contentFr,
    contentEn: campaign.contentEn,
    contentDe: campaign.contentDe,
  }
}

function formatDate(value: Date | string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
}

export default function AdminNewsletterCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [editing, setEditing] = useState(false)
  const [activeLang, setActiveLang] = useState<Lang>("FR")
  const [testRecipient, setTestRecipient] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [audiencePreview, setAudiencePreview] = useState<AudiencePreview | null>(null)

  const selected = campaigns.find((campaign) => campaign.id === selectedId) ?? null
  const fieldKeys = FIELD_BY_LANG[activeLang]
  const subject = draft[fieldKeys.subject] as string
  const content = draft[fieldKeys.content] as string
  const validation = useMemo(() => newsletterCampaignSchema.safeParse(draft), [draft])
  const invalidFields = useMemo(() => {
    if (validation.success) return new Set<string>()
    return new Set(validation.error.issues.map((issue) => issue.path[0]?.toString() ?? ""))
  }, [validation])
  const previewHtml = useMemo(() => {
    const unsubscribeUrl = `https://apticr.org/${activeLang.toLowerCase()}/newsletter/unsubscribe#JETON_DE_PREVISUALISATION`
    return wrapEmailHtml(buildNewsletterCampaignSendPayload(draft, activeLang, unsubscribeUrl).htmlContent, activeLang)
  }, [draft, activeLang])
  const previewSubject = useMemo(() => buildNewsletterCampaignSendPayload(
    draft,
    activeLang,
    `https://apticr.org/${activeLang.toLowerCase()}/newsletter/unsubscribe#JETON_DE_PREVISUALISATION`,
  ).subject, [draft, activeLang])

  async function refresh(preferredId?: string | null) {
    const result = await getNewsletterCampaigns()
    const rows = result as Campaign[]
    setCampaigns(rows)
    const nextId = preferredId ?? selectedId
    const next = rows.find((campaign) => campaign.id === nextId) ?? rows[0]
    if (next) {
      setSelectedId(next.id)
      setDraft(fromCampaign(next))
      setEditing(false)
    } else {
      setSelectedId(null)
      setDraft(EMPTY_DRAFT)
      setEditing(true)
    }
    setAudiencePreview(null)
  }

  useEffect(() => {
    void refresh(null)
  }, [])

  function startNew() {
    setSelectedId(null)
    setDraft(EMPTY_DRAFT)
    setEditing(true)
    setActiveLang("FR")
    setAudiencePreview(null)
    setNotice(null)
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setAudiencePreview(null)
  }

  async function saveDraft() {
    if (!validation.success) {
      const first = validation.error.issues[0]
      const language = LANGS.find((lang) => Object.values(FIELD_BY_LANG[lang]).includes(first.path[0] as keyof Draft))
      if (language) setActiveLang(language)
      setNotice({ type: "error", text: first.message || "Complétez les champs obligatoires dans les trois langues." })
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      const result = await saveNewsletterCampaign({ ...draft, ...(selectedId ? { id: selectedId } : {}) })
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Enregistrement impossible." })
        return
      }
      const saved = result.campaign as Campaign
      setNotice({ type: "success", text: "Brouillon enregistré." })
      await refresh(saved.id)
    } catch {
      setNotice({ type: "error", text: "Erreur lors de l’enregistrement." })
    } finally {
      setBusy(false)
    }
  }

  async function deleteDraft() {
    if (!selected || !window.confirm("Supprimer définitivement ce brouillon ?")) return
    setBusy(true)
    try {
      const result = await deleteNewsletterCampaign(selected.id)
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Suppression impossible." })
        return
      }
      setNotice({ type: "success", text: "Brouillon supprimé." })
      await refresh(null)
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    if (!selectedId || !testRecipient.trim()) {
      setNotice({ type: "error", text: "Enregistrez le brouillon et saisissez une adresse de test." })
      return
    }
    if (!window.confirm(`Envoyer un email de TEST à ${testRecipient.trim()} via le fournisseur configuré ?`)) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await sendNewsletterCampaignTestEmail({ campaignId: selectedId, recipient: testRecipient.trim() })
      setNotice({ type: result.success ? "success" : "error", text: result.message || result.error || "Envoi du test terminé." })
      if (result.success) await refresh(selectedId)
    } catch {
      setNotice({ type: "error", text: "Erreur lors de l’envoi du test." })
    } finally {
      setBusy(false)
    }
  }

  async function prepareLaunch() {
    if (!selected || selected.status !== "DRAFT" || !validation.success || busy) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await previewNewsletterCampaignLaunch(selected.id)
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Impossible de vérifier les destinataires." })
        return
      }
      setAudiencePreview(result as AudiencePreview)
    } catch {
      setNotice({ type: "error", text: "Impossible de vérifier les destinataires éligibles." })
    } finally {
      setBusy(false)
    }
  }

  async function runCampaign(expectedRecipientCount?: number, resume = false) {
    if (!selected || busy) return
    setBusy(true)
    setNotice(null)
    setAudiencePreview(null)
    try {
      const normalizeResult = (raw: Awaited<ReturnType<typeof processNewsletterCampaignBatch>> | Awaited<ReturnType<typeof launchNewsletterCampaign>>): CampaignBatchResult => {
        if (!("complete" in raw)) return { success: false, error: raw.error || "Le traitement a échoué." }
        return {
          success: true,
          complete: raw.complete,
          stalled: raw.stalled,
          sentCount: raw.sentCount,
          failedCount: raw.failedCount,
          pendingCount: raw.pendingCount,
          sendingCount: raw.sendingCount,
        }
      }
      let result = normalizeResult(resume
        ? await processNewsletterCampaignBatch(selected.id)
        : await launchNewsletterCampaign({ campaignId: selected.id, expectedRecipientCount }))
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Le lancement n’a pas abouti." })
        await refresh(selected.id)
        return
      }
      while (result.success && !result.complete && !result.stalled) {
        const nextResult = normalizeResult(await processNewsletterCampaignBatch(selected.id))
        if (!nextResult.success) {
          setNotice({ type: "error", text: nextResult.error || "Le traitement s’est interrompu. Vérifiez les statuts avant de reprendre." })
          await refresh(selected.id)
          return
        }
        result = nextResult
      }
      setNotice(result.stalled
        ? { type: "error", text: "Un envoi est toujours en cours. Actualisez les résultats avant de reprendre." }
        : { type: result.failedCount > 0 ? "error" : "success", text: `Traitement terminé : ${result.sentCount} envoyé(s), ${result.failedCount} échec(s), ${result.pendingCount} en attente.` })
      await refresh(selected.id)
    } catch {
      setNotice({ type: "error", text: "Le traitement s’est interrompu. Actualisez les résultats avant de reprendre." })
      await refresh(selected.id)
    } finally {
      setBusy(false)
    }
  }

  const lastTestText = useMemo(() => {
    if (!selected?.lastTestSentAt) return "Aucun test envoyé."
    return `Dernier test réussi : ${formatDate(selected.lastTestSentAt)}`
  }, [selected?.lastTestSentAt])

  const completed = selected ? selected.deliveryCounts.sent + selected.deliveryCounts.failed : 0
  const progress = selected?.totalRecipients ? Math.min(100, Math.round((completed / selected.totalRecipients) * 100)) : 0

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#007BFF]">Communication</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#003366]">Campagnes newsletter</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Préparez et suivez les campagnes adressées uniquement aux abonnés avec un consentement vérifiable.</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#002a52]">
          <FilePlus2 size={16} /> Nouvelle campagne
        </button>
      </header>

      {notice && (
        <div role="status" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {notice.type === "success" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Campagnes enregistrées</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{campaigns.length}</span>
          </div>
          {campaigns.length === 0 ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Aucune campagne pour le moment.</p> : (
            <ul className="space-y-2">
              {campaigns.map((campaign) => (
                <li key={campaign.id}>
                  <button
                    onClick={() => { setSelectedId(campaign.id); setDraft(fromCampaign(campaign)); setEditing(false); setActiveLang(campaign.lang); setNotice(null); setAudiencePreview(null) }}
                    className={`w-full rounded-xl border p-3 text-left transition ${selectedId === campaign.id ? "border-[#003366]/30 bg-blue-50/70" : "border-slate-100 hover:bg-slate-50"}`}
                  >
                    <span className="block truncate text-sm font-semibold text-slate-800">{campaign.name}</span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span>{CAMPAIGN_STATUS[campaign.status] || campaign.status}</span>
                      <span>{campaign.deliveryCounts.sent}/{campaign.totalRecipients}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[#003366]">{selected ? (editing ? "Modifier la campagne" : selected.name) : "Nouvelle campagne"}</h2>
                {selected && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${selected.status === "DRAFT" ? "bg-slate-100 text-slate-600" : selected.status === "SENDING" ? "bg-blue-50 text-blue-700" : selected.status === "SENT" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{CAMPAIGN_STATUS[selected.status] || selected.status}</span>}
              </div>
              <p className="mt-1 text-xs text-slate-500">{selected ? `Créée le ${formatDate(selected.createdAt)} · Modifiée le ${formatDate(selected.updatedAt)}` : "Les sujets et contenus FR, EN et DE sont obligatoires."}</p>
            </div>
            {selected && selected.status === "DRAFT" && !editing && <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#003366] transition hover:bg-slate-50">Modifier</button>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">Nom interne <span className="text-red-600">*</span>
              <input disabled={!editing} required value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} maxLength={120} className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 disabled:bg-slate-50 ${invalidFields.has("name") ? "border-red-300" : "border-slate-200"}`} />
            </label>
            <label className="text-xs font-bold text-slate-700">Langue d’aperçu et d’envoi de test <span className="text-red-600">*</span>
              <select disabled={!editing} value={draft.lang} onChange={(event) => updateDraft("lang", event.target.value as Lang)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#003366] disabled:bg-slate-50">
                <option value="FR">Français (FR)</option><option value="EN">English (EN)</option><option value="DE">Deutsch (DE)</option>
              </select>
            </label>
          </div>

          <div className="flex gap-1 border-b border-slate-100" role="tablist" aria-label="Langue du contenu">
            {LANGS.map((lang) => {
              const complete = !invalidFields.has(FIELD_BY_LANG[lang].subject) && !invalidFields.has(FIELD_BY_LANG[lang].content)
              return <button key={lang} role="tab" aria-selected={activeLang === lang} onClick={() => setActiveLang(lang)} className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold transition ${activeLang === lang ? "border-[#003366] text-[#003366]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
                {lang}<span className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-emerald-500" : "bg-red-400"}`} aria-label={complete ? "Traduction complète" : "Traduction à compléter"} />
              </button>
            })}
            <span className="ml-auto self-center text-[11px] text-slate-500">Champs marqués * obligatoires</span>
          </div>

          <div className="grid gap-5 2xl:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">Sujet ({activeLang}) <span className="text-red-600">*</span>
                <input disabled={!editing} required value={subject} maxLength={200} onChange={(event) => updateDraft(fieldKeys.subject, event.target.value)} className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 disabled:bg-slate-50 ${invalidFields.has(fieldKeys.subject) ? "border-red-300" : "border-slate-200"}`} />
              </label>
              <label className="block text-xs font-bold text-slate-700">Contenu du message ({activeLang}) <span className="text-red-600">*</span>
                <textarea disabled={!editing} required value={content} maxLength={30000} rows={14} onChange={(event) => updateDraft(fieldKeys.content, event.target.value)} className={`mt-1.5 w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm font-normal leading-6 outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 disabled:bg-slate-50 ${invalidFields.has(fieldKeys.content) ? "border-red-300" : "border-slate-200"}`} />
              </label>
              <p className="text-[11px] text-slate-500">Texte simple. Les retours à la ligne sont conservés; le gabarit APTIC-R et le lien de désabonnement sont ajoutés automatiquement.</p>
              {editing && !validation.success && <p className="text-xs font-medium text-red-700">Complétez les champs obligatoires dans les trois langues pour enregistrer.</p>}
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Mail size={15} className="text-[#003366]" /> Aperçu de l’email final · {activeLang}</div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Aucun envoi</span>
              </div>
              <div className="border-b border-slate-200 bg-white px-4 py-3 text-xs">
                <span className="font-bold text-slate-500">Objet : </span><span className="text-slate-800">{previewSubject || "Sujet à renseigner"}</span>
              </div>
              <iframe title={`Aperçu de l’email ${LANG_LABEL[activeLang]}`} sandbox="" srcDoc={previewHtml} className="h-[520px] w-full bg-white" />
              <p className="border-t border-slate-200 px-4 py-2 text-[10px] leading-4 text-slate-500">L’aperçu utilise le gabarit d’envoi, la signature et le lien de désabonnement. Le jeton affiché est un exemple inactif.</p>
            </div>
          </div>

          {editing && <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <button disabled={busy || !validation.success} onClick={saveDraft} className="inline-flex items-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#002a52] disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} /> Enregistrer le brouillon</button>
            {selected?.status === "DRAFT" && <button disabled={busy} onClick={deleteDraft} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} /> Supprimer</button>}
          </div>}

          {selected && selected.status !== "DRAFT" && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-sm font-bold text-[#003366]">Suivi de la campagne</h3><p className="mt-1 text-xs text-slate-500">Démarrée le {formatDate(selected.startedAt)}{selected.completedAt ? ` · Terminée le ${formatDate(selected.completedAt)}` : ""}</p></div>
              <button disabled={busy} onClick={() => void refresh(selected.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={13} /> Actualiser</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Envoyés", value: selected.deliveryCounts.sent, color: "text-emerald-700" },
                { label: "Échecs", value: selected.deliveryCounts.failed, color: "text-red-700" },
                { label: "En attente", value: selected.deliveryCounts.pending, color: "text-amber-700" },
                { label: "En cours", value: selected.deliveryCounts.sending, color: "text-blue-700" },
              ].map((stat) => <div key={stat.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"><div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{stat.label}</div></div>)}
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-slate-600"><span>Progression · {completed} sur {selected.totalRecipients}</span><span>{progress}%</span></div>
              <div role="progressbar" aria-label="Progression de la campagne" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#007BFF] transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
            {selected.status === "SENDING" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3">
              <p className="text-xs leading-5 text-blue-900">Une interruption éventuelle laisse les envois déjà terminés enregistrés. La reprise ne traite que les destinataires encore en attente.</p>
              <button disabled={busy} onClick={() => void runCampaign(undefined, true)} className="shrink-0 rounded-lg bg-[#003366] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50">Reprendre les en attente</button>
            </div>}
          </div>}

          {selected && selected.status === "DRAFT" && !editing && <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 md:p-5">
            <h3 className="text-sm font-bold text-[#003366]">Envoi aux abonnés éligibles</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">Le serveur recompte les abonnés actifs avec consentement vérifiable et vérifie les traductions nécessaires. Une confirmation avec le nombre exact sera demandée avant lancement.</p>
            <button disabled={busy || !validation.success} onClick={() => void prepareLaunch()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#002a52] disabled:opacity-50"><Send size={14} /> Vérifier les destinataires</button>
          </div>}

          {audiencePreview && <div role="dialog" aria-modal="true" aria-labelledby="launch-title" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <div className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:p-6">
              <div className="flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-[#003366]"><Send size={18} /></div><div><h2 id="launch-title" className="text-lg font-bold text-[#003366]">Confirmer le lancement</h2><p className="mt-1 text-sm text-slate-600">{audiencePreview.campaignName}</p></div></div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-3xl font-bold tracking-tight text-[#003366]">{audiencePreview.eligibleCount.toLocaleString("fr-FR")}</p><p className="text-xs text-slate-600">destinataires actifs avec consentement vérifiable</p>
                <div className="mt-3 grid grid-cols-3 gap-2">{LANGS.map((lang) => <div key={lang} className="rounded-lg border border-slate-200 bg-white px-3 py-2"><div className="text-sm font-bold text-slate-800">{audiencePreview.countsByLanguage[lang]}</div><div className="text-[10px] font-semibold text-slate-500">{LANG_LABEL[lang]}</div></div>)}</div>
              </div>
              {!audiencePreview.ready && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                {audiencePreview.eligibleCount === 0 ? "Aucun destinataire éligible : la campagne ne peut pas être lancée." : `Complétez le sujet et le contenu pour les langues nécessaires : ${audiencePreview.missingLanguages.join(", ")}.`}
              </div>}
              <p className="mt-4 text-xs leading-5 text-slate-600">Chaque message inclura un lien de désabonnement dans la langue du destinataire. Les emails envoyés ne peuvent pas être rappelés.</p>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button onClick={() => setAudiencePreview(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Annuler</button>
                <button disabled={!audiencePreview.ready || busy} onClick={() => void runCampaign(audiencePreview.eligibleCount)} className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} /> Confirmer et lancer</button>
              </div>
            </div>
          </div>}

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <h3 className="text-xs font-bold text-amber-950">Envoi de test</h3>
            <p className="mt-1 text-[11px] leading-5 text-amber-900">Le fournisseur dépend de la configuration du déploiement et n’est pas validé ici. Ce bouton envoie réellement un message [TEST] à l’adresse saisie; il ne contacte pas la liste d’abonnés.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input type="email" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} placeholder="Adresse email de test" className="min-w-0 flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-300" />
              <button disabled={busy || !selectedId || !validation.success} onClick={sendTest} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"><Send size={14} /> Envoyer un test</button>
            </div>
            <p className="mt-2 text-[10px] text-amber-900">{lastTestText}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
