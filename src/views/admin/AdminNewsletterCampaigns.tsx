"use client"

import { useEffect, useMemo, useState } from "react"
import { FilePlus2, Mail, Save, Send, Trash2 } from "lucide-react"
import {
  deleteNewsletterCampaign,
  getNewsletterCampaigns,
  launchNewsletterCampaign,
  processNewsletterCampaignBatch,
  saveNewsletterCampaign,
  sendNewsletterCampaignTestEmail,
} from "@/lib/cms-actions"

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

export default function AdminNewsletterCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [editing, setEditing] = useState(false)
  const [activeLang, setActiveLang] = useState<Lang>("FR")
  const [testRecipient, setTestRecipient] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const selected = campaigns.find((campaign) => campaign.id === selectedId) ?? null
  const suffix = activeLang[0] + activeLang.slice(1).toLowerCase()
  const subject = draft[`subject${suffix}` as "subjectFr" | "subjectEn" | "subjectDe"]
  const content = draft[`content${suffix}` as "contentFr" | "contentEn" | "contentDe"]

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
  }

  useEffect(() => {
    void refresh(null)
  }, [])

  function startNew() {
    setSelectedId(null)
    setDraft(EMPTY_DRAFT)
    setEditing(true)
    setActiveLang("FR")
    setNotice(null)
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function saveDraft() {
    if (!draft.name.trim()) {
      setNotice({ type: "error", text: "Donnez un nom à ce brouillon." })
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

  async function runCampaign(resume = false) {
    if (!selected || busy) return
    if (!resume && !window.confirm(`Lancer cette campagne à tous les abonnés actifs avec consentement vérifiable (${selected.name}) ? Cet envoi ne pourra pas être annulé.`)) return
    setBusy(true)
    setNotice(null)
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
        : await launchNewsletterCampaign({ campaignId: selected.id }))
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "L’envoi n’a pas pu démarrer." })
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
      if (!result.success) return
      setNotice(result.stalled
        ? { type: "error", text: "Un envoi est resté en cours après une interruption. Vérifiez les statuts avant toute reprise." }
        : { type: result.failedCount > 0 ? "error" : "success", text: `Campagne terminée : ${result.sentCount} envoyé(s), ${result.failedCount} échec(s).` })
      await refresh(selected.id)
    } catch {
      setNotice({ type: "error", text: "Le traitement s’est interrompu. Vérifiez les statuts avant de reprendre." })
      await refresh(selected.id)
    } finally {
      setBusy(false)
    }
  }

  const lastTestText = useMemo(() => {
    if (!selected?.lastTestSentAt) return "Aucun test envoyé."
    return `Dernier test réussi : ${new Date(selected.lastTestSentAt).toLocaleString()}`
  }, [selected?.lastTestSentAt])

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Communication</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Campagnes newsletter</h1>
            <p className="mt-1 text-sm text-slate-500">Créez, prévisualisez et envoyez explicitement une campagne aux abonnés éligibles.</p>
          </div>
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white">
            <FilePlus2 size={17} /> Nouvelle campagne
          </button>
        </header>

        {notice && (
          <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
            {notice.text}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Brouillons enregistrés</h2>
            {campaigns.length === 0 ? <p className="text-sm text-slate-500">Aucun brouillon.</p> : (
              <ul className="space-y-2">
                {campaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <button
                      onClick={() => { setSelectedId(campaign.id); setDraft(fromCampaign(campaign)); setEditing(false); setActiveLang(campaign.lang); setNotice(null) }}
                      className={`w-full rounded-xl border p-3 text-left ${selectedId === campaign.id ? "border-blue-300 bg-blue-50" : "border-slate-100 hover:bg-slate-50"}`}
                    >
                      <span className="block truncate text-sm font-semibold text-slate-800">{campaign.name}</span>
                      <span className="mt-1 block text-xs text-slate-500">{campaign.status} · {campaign.deliveryCounts.sent} envoyé(s) · {campaign.deliveryCounts.failed} échec(s) · {campaign.deliveryCounts.pending + campaign.deliveryCounts.sending} en attente</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-slate-900">{selected ? (editing ? "Modifier le brouillon" : selected.name) : "Nouveau brouillon"}</h2>
                <p className="mt-1 text-xs text-slate-500">{selected ? `Créée le ${new Date(selected.createdAt).toLocaleString()} · Modifiée le ${new Date(selected.updatedAt).toLocaleString()}` : "Les trois traductions sont enregistrées dans une seule campagne."}</p>
              </div>
              {selected && selected.status === "DRAFT" && !editing && <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Modifier</button>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Nom interne
                <input disabled={!editing} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} maxLength={120} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal disabled:bg-slate-50" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Langue de prévisualisation et de test
                <select disabled={!editing} value={draft.lang} onChange={(event) => updateDraft("lang", event.target.value as Lang)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal disabled:bg-slate-50">
                  <option value="FR">Français</option><option value="EN">English</option><option value="DE">Deutsch</option>
                </select>
              </label>
            </div>

            <div className="flex gap-2 border-b border-slate-100">
              {LANGS.map((lang) => <button key={lang} onClick={() => setActiveLang(lang)} className={`border-b-2 px-3 py-2 text-sm font-bold ${activeLang === lang ? "border-blue-700 text-blue-800" : "border-transparent text-slate-500"}`}>{lang}</button>)}
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Sujet ({activeLang})
                  <input disabled={!editing} value={subject} maxLength={200} onChange={(event) => updateDraft(`subject${suffix}` as "subjectFr" | "subjectEn" | "subjectDe", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal disabled:bg-slate-50" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">Contenu texte ({activeLang})
                  <textarea disabled={!editing} value={content} maxLength={30000} rows={13} onChange={(event) => updateDraft(`content${suffix}` as "contentFr" | "contentEn" | "contentDe", event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 font-normal leading-relaxed disabled:bg-slate-50" />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><Mail size={16} /> Prévisualisation — {activeLang}</div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">{subject || "(Sujet vide)"}</p>
                  <div className="min-h-48 whitespace-pre-wrap py-4 text-sm leading-6 text-slate-700">{content || "Votre contenu apparaîtra ici."}</div>
                  <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">Aperçu texte; le test utilise le gabarit email APTIC-R.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {editing && <button disabled={busy} onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} /> Enregistrer le brouillon</button>}
              {selected && selected.status === "DRAFT" && <button disabled={busy} onClick={deleteDraft} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"><Trash2 size={16} /> Supprimer</button>}
            </div>

            {selected && selected.status !== "DRAFT" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-semibold">État de la campagne : {selected.status}</p>
                <p className="mt-1">{selected.deliveryCounts.sent} envoyé(s), {selected.deliveryCounts.failed} échec(s), {selected.deliveryCounts.pending} en attente, {selected.deliveryCounts.sending} en cours sur {selected.totalRecipients} destinataire(s).</p>
                {selected.status === "SENDING" && <button disabled={busy} onClick={() => void runCampaign(true)} className="mt-3 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Reprendre le traitement</button>}
              </div>
            )}

            {selected && selected.status === "DRAFT" && !editing && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-bold text-red-950">Envoi à la liste</h3>
                <p className="mt-1 text-xs leading-5 text-red-900">L’action vérifie le consentement et la traduction requise, puis envoie uniquement aux abonnés éligibles. Vérifiez le fournisseur email et l’adresse d’expédition configurés avant de confirmer.</p>
                <button disabled={busy} onClick={() => void runCampaign()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send size={16} /> Lancer la campagne</button>
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950">Envoi de test seulement</h3>
              <p className="mt-1 text-xs leading-5 text-amber-900">Le fournisseur email dépend de la configuration du déploiement et n’a pas été vérifié. Le bouton envoie réellement un email à l’adresse saisie, avec un sujet préfixé [TEST]. Il n’envoie jamais à la liste des abonnés.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="email" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} placeholder="Adresse email de test" className="min-w-0 flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm" />
                <button disabled={busy || !selectedId} onClick={sendTest} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send size={15} /> Envoyer un test</button>
              </div>
              <p className="mt-2 text-xs text-amber-900">{lastTestText}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
