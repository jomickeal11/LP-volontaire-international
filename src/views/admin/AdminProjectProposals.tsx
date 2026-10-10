"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  addProjectProposalInternalNote,
  retryFailedNotificationEmailAction,
  updateProjectProposalStatus,
} from "@/lib/actions"

type ProposalStatus =
  | "NOUVEAU"
  | "EN_EXAMEN"
  | "INFORMATIONS_COMPLEMENTAIRES"
  | "ACCEPTE_COLLABORATION"
  | "REFUSE"

type Proposal = {
  id: string
  referenceNumber: string
  proposerName: string
  organization: string | null
  email: string
  country: string
  title: string
  domain: string
  description: string
  objectives: string
  targetAudience: string
  expectedResults: string
  collaboration: string
  timeline: string
  budget: string | null
  message: string | null
  status: string
  convertedProject: { id: string; titleFr: string; slug: string } | null
  lang: "FR" | "EN" | "DE"
  createdAt: string
  document: { id: string; originalName: string; size: number } | null
  notes: { id: string; authorName: string; content: string; createdAt: string }[]
  statusHistory: {
    id: string
    fromStatus: string | null
    toStatus: string
    changedByName: string
    createdAt: string
  }[]
}

const STATUSES: ProposalStatus[] = [
  "NOUVEAU",
  "EN_EXAMEN",
  "INFORMATIONS_COMPLEMENTAIRES",
  "ACCEPTE_COLLABORATION",
  "REFUSE",
]

const COPY = {
  FR: {
    eyebrow: "PARTENARIATS & IMPACT",
    title: "Propositions de projets",
    count: (n: number) => `${n} proposition${n > 1 ? "s" : ""}`,
    search: "Rechercher un titre, un porteur, un pays, un domaine…",
    all: "Tous les statuts",
    date: "Date",
    project: "Projet",
    proposer: "Porteur",
    country: "Pays",
    domain: "Domaine",
    status: "Statut",
    saveStatus: "Enregistrer le statut",
    retryEmail: "Réessayer l’envoi de l’e-mail",
    retryingEmail: "Nouvel essai…",
    informationInstructions: "Informations à demander au porteur",
    informationPlaceholder: "Précisez les informations ou documents attendus…",
    empty: "Aucune proposition reçue pour le moment.",
    noMatches: "Aucune proposition ne correspond à ces critères.",
    open: "Ouvrir la fiche",
    details: "Détails de la proposition",
    close: "Fermer",
    organization: "Organisation",
    email: "Adresse e-mail",
    description: "Description",
    objectives: "Objectifs",
    audience: "Public cible et bénéficiaires",
    results: "Résultats attendus",
    collaboration: "Collaboration souhaitée",
    timeline: "Durée / calendrier",
    budget: "Budget / financement",
    message: "Message complémentaire",
    attachment: "Document joint",
    download: "Télécharger",
    noAttachment: "Aucun document joint",
    notes: "Notes internes",
    notePlaceholder: "Ajouter une note visible uniquement par l’équipe APTIC-R…",
    addNote: "Ajouter la note",
    saving: "Enregistrement…",
    history: "Historique du traitement",
    received: "Proposition reçue",
    notificationSent: "Statut mis à jour et e-mail envoyé au porteur.",
    notificationFailed: "Statut enregistré, mais l’e-mail de notification n’a pas pu être envoyé.",
    statusSaved: "Statut mis à jour.",
    noteSaved: "Note interne ajoutée.",
    loadError: "Impossible de charger les propositions. Réessayez plus tard.",
    operationError: "L’opération n’a pas abouti.",
    dateLocale: "fr-FR",
    confidentiality: "Les notes internes sont privées et ne sont jamais incluses dans les e-mails envoyés au porteur.",
    language: "Langue du formulaire",
    createFromProposal: "Créer un projet à partir de cette proposition",
    openConvertedProject: "Ouvrir le projet associé",
  },
  EN: {
    eyebrow: "PARTNERSHIPS & IMPACT",
    title: "Project proposals",
    count: (n: number) => `${n} proposal${n === 1 ? "" : "s"}`,
    search: "Search title, proposer, country, field…",
    all: "All statuses",
    date: "Date",
    project: "Project",
    proposer: "Proposer",
    country: "Country",
    domain: "Field",
    status: "Status",
    saveStatus: "Save status",
    retryEmail: "Retry email",
    retryingEmail: "Retrying…",
    informationInstructions: "Information to request from the proposer",
    informationPlaceholder: "Specify the information or documents needed…",
    empty: "No proposals have been received yet.",
    noMatches: "No proposals match these criteria.",
    open: "Open proposal",
    details: "Proposal details",
    close: "Close",
    organization: "Organization",
    email: "Email address",
    description: "Description",
    objectives: "Objectives",
    audience: "Target audience and beneficiaries",
    results: "Expected results",
    collaboration: "Preferred collaboration",
    timeline: "Duration / timeline",
    budget: "Budget / funding",
    message: "Additional message",
    attachment: "Attachment",
    download: "Download",
    noAttachment: "No attachment",
    notes: "Internal notes",
    notePlaceholder: "Add a note visible only to the APTIC-R team…",
    addNote: "Add note",
    saving: "Saving…",
    history: "Processing history",
    received: "Proposal received",
    notificationSent: "Status updated and email sent to the proposer.",
    notificationFailed: "Status saved, but the notification email could not be sent.",
    statusSaved: "Status updated.",
    noteSaved: "Internal note added.",
    loadError: "Unable to load proposals. Please try again later.",
    operationError: "The operation could not be completed.",
    dateLocale: "en-GB",
    confidentiality: "Internal notes are private and are never included in emails sent to the proposer.",
    language: "Form language",
    createFromProposal: "Create a project from this proposal",
    openConvertedProject: "Open the associated project",
  },
  DE: {
    eyebrow: "PARTNERSCHAFTEN & WIRKUNG",
    title: "Projektvorschläge",
    count: (n: number) => `${n} Vorschlag${n === 1 ? "" : "e"}`,
    search: "Titel, einreichende Person, Land oder Bereich suchen…",
    all: "Alle Status",
    date: "Datum",
    project: "Projekt",
    proposer: "Einreichende Person",
    country: "Land",
    domain: "Bereich",
    status: "Status",
    saveStatus: "Status speichern",
    retryEmail: "E-Mail erneut senden",
    retryingEmail: "Erneuter Versuch…",
    informationInstructions: "Anzufordernde Informationen",
    informationPlaceholder: "Benötigte Informationen oder Unterlagen angeben…",
    empty: "Bisher sind keine Vorschläge eingegangen.",
    noMatches: "Keine Vorschläge entsprechen diesen Kriterien.",
    open: "Vorschlag öffnen",
    details: "Details des Vorschlags",
    close: "Schließen",
    organization: "Organisation",
    email: "E-Mail-Adresse",
    description: "Beschreibung",
    objectives: "Ziele",
    audience: "Zielgruppe und Begünstigte",
    results: "Erwartete Ergebnisse",
    collaboration: "Gewünschte Zusammenarbeit",
    timeline: "Dauer / Zeitplan",
    budget: "Budget / Finanzierung",
    message: "Zusätzliche Nachricht",
    attachment: "Anhang",
    download: "Herunterladen",
    noAttachment: "Kein Anhang",
    notes: "Interne Notizen",
    notePlaceholder: "Notiz hinzufügen, die nur das APTIC-R-Team sehen kann…",
    addNote: "Notiz hinzufügen",
    saving: "Wird gespeichert…",
    history: "Bearbeitungsverlauf",
    received: "Vorschlag eingegangen",
    notificationSent: "Status aktualisiert und E-Mail an die einreichende Person gesendet.",
    notificationFailed: "Status gespeichert, aber die Benachrichtigungs-E-Mail konnte nicht gesendet werden.",
    statusSaved: "Status aktualisiert.",
    noteSaved: "Interne Notiz hinzugefügt.",
    loadError: "Vorschläge konnten nicht geladen werden. Bitte später erneut versuchen.",
    operationError: "Der Vorgang konnte nicht abgeschlossen werden.",
    dateLocale: "de-DE",
    confidentiality: "Interne Notizen sind vertraulich und werden niemals in E-Mails an die einreichende Person aufgenommen.",
    language: "Sprache des Formulars",
    createFromProposal: "Aus diesem Vorschlag ein Projekt erstellen",
    openConvertedProject: "Zugehöriges Projekt öffnen",
  },
} as const

const STATUS_LABELS: Record<"FR" | "EN" | "DE", Record<ProposalStatus, string>> = {
  FR: {
    NOUVEAU: "Nouveau",
    EN_EXAMEN: "En examen",
    INFORMATIONS_COMPLEMENTAIRES: "Informations complémentaires",
    ACCEPTE_COLLABORATION: "Collaboration acceptée",
    REFUSE: "Refusé",
  },
  EN: {
    NOUVEAU: "New",
    EN_EXAMEN: "Under review",
    INFORMATIONS_COMPLEMENTAIRES: "Additional information",
    ACCEPTE_COLLABORATION: "Collaboration accepted",
    REFUSE: "Declined",
  },
  DE: {
    NOUVEAU: "Neu",
    EN_EXAMEN: "In Prüfung",
    INFORMATIONS_COMPLEMENTAIRES: "Weitere Informationen",
    ACCEPTE_COLLABORATION: "Zusammenarbeit angenommen",
    REFUSE: "Abgelehnt",
  },
}

function statusLabel(status: string, lang: "FR" | "EN" | "DE") {
  return STATUS_LABELS[lang][status as ProposalStatus] || status
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

export default function AdminProjectProposals({
  proposals,
  lang = "FR",
  initialError,
}: {
  proposals: Proposal[]
  lang?: "FR" | "EN" | "DE"
  initialError?: boolean
}) {
  const t = COPY[lang]
  const [items, setItems] = useState(proposals)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "">("")
  const [selectedId, setSelectedId] = useState("")
  const [pendingStatus, setPendingStatus] = useState<ProposalStatus | "">("")
  const [adminMessage, setAdminMessage] = useState("")
  const [failedEmailLogId, setFailedEmailLogId] = useState("")
  const [retryingEmail, setRetryingEmail] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState("")
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!feedback) return
    const timeoutId = window.setTimeout(() => setFeedback(""), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [feedback])

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return items.filter((proposal) => {
      const matchesStatus = !statusFilter || proposal.status === statusFilter
      const matchesQuery = !query || [
        proposal.referenceNumber,
        proposal.title,
        proposal.proposerName,
        proposal.organization || "",
        proposal.country,
        proposal.domain,
        proposal.email,
      ].some((value) => value.toLocaleLowerCase().includes(query))
      return matchesStatus && matchesQuery
    })
  }, [items, search, statusFilter])

  const selected = items.find((proposal) => proposal.id === selectedId) || null

  const changeStatus = async (proposal: Proposal, status: ProposalStatus, message: string) => {
    if (status === proposal.status) return
    setSavingStatus(true)
    setError("")
    setFeedback("")
    try {
      const result = await updateProjectProposalStatus(proposal.id, status, message)
      if (!result.success) {
        setError(result.error || t.operationError)
        return
      }
      if (result.unchanged) return
      const historyEntry = result.history
      setItems((current) => current.map((item) => item.id === proposal.id
        ? {
            ...item,
            status,
            statusHistory: historyEntry ? [historyEntry, ...item.statusHistory] : item.statusHistory,
          }
        : item))
      setPendingStatus("")
      setAdminMessage("")
      setFailedEmailLogId(result.notificationRequired && !result.emailSent ? result.emailLogId || "" : "")
      setFeedback(
        !result.notificationRequired
          ? t.statusSaved
          : result.emailSent
            ? t.notificationSent
            : t.notificationFailed
      )
    } catch (actionError) {
      console.error("Unable to update project proposal status:", actionError)
      setError(t.operationError)
    } finally {
      setSavingStatus(false)
    }

  }

  const retryStatusNotification = async () => {
    if (!failedEmailLogId) return
    setRetryingEmail(true)
    setError("")
    try {
      const result = await retryFailedNotificationEmailAction(failedEmailLogId)
      if (!result.success) {
        setError(result.error || t.notificationFailed)
        return
      }
      setFailedEmailLogId("")
      setFeedback(t.notificationSent)
    } catch (retryError) {
      console.error("Unable to retry project proposal notification:", retryError)
      setError(t.notificationFailed)
    } finally {
      setRetryingEmail(false)
    }
  }

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    setSavingNote(true)
    setError("")
    setFeedback("")
    try {
      const result = await addProjectProposalInternalNote(selected.id, noteDraft)
      if (!result.success || !result.note) {
        setError(result.error || t.operationError)
        return
      }
      setItems((current) => current.map((item) => item.id === selected.id
        ? { ...item, notes: [result.note!, ...item.notes] }
        : item))
      setNoteDraft("")
      setFeedback(t.noteSaved)
    } catch (actionError) {
      console.error("Unable to add project proposal note:", actionError)
      setError(t.operationError)
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#28A745]">{t.eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-[#003366] sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.count(items.length)}</p>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {feedback && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{feedback}</p>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_16rem]">
          <label className="sr-only" htmlFor="proposal-search">{t.search}</label>
          <input
            id="proposal-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={t.search}
            className="min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-blue-100"
          />
          <label className="sr-only" htmlFor="proposal-status-filter">{t.status}</label>
          <select
            id="proposal-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.currentTarget.value as ProposalStatus | "")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">{t.all}</option>
            {STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, lang)}</option>)}
          </select>
        </div>

        {initialError ? (
          <div className="p-10 text-center text-sm text-red-700">{t.loadError}</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">{t.empty}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">{t.noMatches}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {[t.date, t.project, t.proposer, t.country, t.domain, t.status].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((proposal) => (
                  <tr key={proposal.id} className="transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(proposal.createdAt, t.dateLocale)}</td>
                    <td className="max-w-72 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(proposal.id)
                          setFeedback("")
                          setError("")
                          setPendingStatus("")
                          setAdminMessage("")
                          setFailedEmailLogId("")
                        }}
                        className="text-left font-semibold text-[#003366] hover:text-[#007BFF] hover:underline"
                        aria-label={`${t.open}: ${proposal.title}`}
                      >
                        {proposal.title}
                      </button>
                      <p className="mt-1 font-mono text-xs text-slate-400">{proposal.referenceNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{proposal.proposerName}</td>
                    <td className="px-4 py-3 text-slate-700">{proposal.country}</td>
                    <td className="px-4 py-3 text-slate-700">{proposal.domain}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#174F7A]">
                        {statusLabel(proposal.status, lang)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedId("")
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="proposal-detail-title"
            className="max-h-[94vh] w-full max-w-5xl overflow-y-auto bg-white p-4 shadow-2xl sm:rounded-xl sm:p-7"
          >
            <div className="sticky top-[-1rem] z-10 -mx-4 -mt-4 mb-6 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4 sm:static sm:mx-0 sm:mt-[-1.75rem] sm:px-0 sm:pt-7">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-slate-500">{selected.referenceNumber}</p>
                <h2 id="proposal-detail-title" className="mt-1 text-xl font-bold text-[#003366] sm:text-2xl">{t.details}</h2>
                <p className="mt-1 truncate text-sm text-slate-600">{selected.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedId("")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.close}</button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
              <div className="space-y-8">
                <section className="border-b border-slate-200 pb-7">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#003366]">{selected.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{selected.domain} · {selected.country}</p>
                    </div>
                    <label className="flex shrink-0 flex-col gap-1.5 text-xs font-semibold text-slate-600">
                      {t.status}
                      <select
                        value={pendingStatus || selected.status}
                        disabled={savingStatus}
                        onChange={(event) => {
                          const nextStatus = event.currentTarget.value as ProposalStatus
                          setPendingStatus(nextStatus === selected.status ? "" : nextStatus)
                          if (nextStatus !== "INFORMATIONS_COMPLEMENTAIRES") setAdminMessage("")
                        }}
                        className="min-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
                      >
                        {STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, lang)}</option>)}
                      </select>
                      {savingStatus && <span className="text-slate-500">{t.saving}</span>}
                    </label>
                  </div>
                  {selected.convertedProject ? (
                    <Link
                      href={`/backoffice/projects?editProject=${encodeURIComponent(selected.convertedProject.id)}`}
                      className="mt-5 inline-flex items-center rounded-lg border border-[#007BFF]/30 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#003366] hover:border-[#007BFF] hover:bg-blue-100"
                    >
                      {t.openConvertedProject}: {selected.convertedProject.titleFr}
                    </Link>
                  ) : selected.status === "ACCEPTE_COLLABORATION" ? (
                    <Link
                      href={`/backoffice/projects?sourceProposal=${encodeURIComponent(selected.id)}`}
                      className="mt-5 inline-flex items-center rounded-lg bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#007BFF]"
                    >
                      {t.createFromProposal}
                    </Link>
                  ) : null}
                  {pendingStatus === "INFORMATIONS_COMPLEMENTAIRES" && (
                    <label className="mt-5 block text-xs font-semibold text-slate-600">
                      {t.informationInstructions}
                      <textarea
                        value={adminMessage}
                        onChange={(event) => setAdminMessage(event.currentTarget.value)}
                        minLength={2}
                        maxLength={3000}
                        required
                        rows={3}
                        placeholder={t.informationPlaceholder}
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  )}
                  {pendingStatus && (
                    <button
                      type="button"
                      disabled={savingStatus || (pendingStatus === "INFORMATIONS_COMPLEMENTAIRES" && adminMessage.trim().length < 2)}
                      onClick={() => changeStatus(selected, pendingStatus, adminMessage)}
                      className="mt-4 rounded-lg bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#007BFF] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {savingStatus ? t.saving : t.saveStatus}
                    </button>
                  )}
                  {failedEmailLogId && (
                    <button
                      type="button"
                      disabled={retryingEmail}
                      onClick={retryStatusNotification}
                      className="mt-4 text-sm font-semibold text-[#007BFF] underline underline-offset-2 disabled:opacity-60"
                    >
                      {retryingEmail ? t.retryingEmail : t.retryEmail}
                    </button>
                  )}
                  <dl className="mt-5 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
                    <Detail label={t.proposer} value={selected.proposerName} />
                    {selected.organization && <Detail label={t.organization} value={selected.organization} />}
                    <Detail label={t.email} value={selected.email} link={`mailto:${selected.email}`} />
                    <Detail label={t.country} value={selected.country} />
                    <Detail label={t.domain} value={selected.domain} />
                    <Detail label={t.language} value={selected.lang} />
                    <Detail label={t.date} value={formatDate(selected.createdAt, t.dateLocale)} />
                    <Detail label={t.collaboration} value={selected.collaboration} />
                    <Detail label={t.timeline} value={selected.timeline} />
                    <Detail label={t.description} value={selected.description} />
                    <Detail label={t.objectives} value={selected.objectives} />
                    <Detail label={t.audience} value={selected.targetAudience} />
                    <Detail label={t.results} value={selected.expectedResults} />
                    {selected.budget && <Detail label={t.budget} value={selected.budget} />}
                    {selected.message && <Detail label={t.message} value={selected.message} />}
                  </dl>
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.attachment}</h4>
                    {selected.document ? (
                      <a
                        href={`/api/documents/project-proposal/${encodeURIComponent(selected.document.id)}`}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#003366] hover:border-[#007BFF] hover:text-[#007BFF]"
                      >
                        {t.download}: {selected.document.originalName} ({(selected.document.size / (1024 * 1024)).toFixed(1)} MB)
                      </a>
                    ) : <p className="mt-2 text-sm text-slate-500">{t.noAttachment}</p>}
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-bold text-[#003366]">{t.notes}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{t.confidentiality}</p>
                  <form onSubmit={addNote} className="mt-4 space-y-3">
                    <label htmlFor="proposal-internal-note" className="sr-only">{t.notePlaceholder}</label>
                    <textarea
                      id="proposal-internal-note"
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.currentTarget.value)}
                      minLength={2}
                      maxLength={5000}
                      required
                      rows={3}
                      placeholder={t.notePlaceholder}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={savingNote || noteDraft.trim().length < 2}
                      className="rounded-lg bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#007BFF] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {savingNote ? t.saving : t.addNote}
                    </button>
                  </form>
                  {selected.notes.length ? (
                    <ul className="mt-5 divide-y divide-slate-100">
                      {selected.notes.map((note) => (
                        <li key={note.id} className="border-l-2 border-amber-300 py-3 pl-4 first:pt-0">
                          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{note.authorName}</span>
                            <time dateTime={note.createdAt}>{formatDate(note.createdAt, t.dateLocale)}</time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.content}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-4 text-sm text-slate-500">—</p>}
                </section>
              </div>

              <aside className="h-fit border-t border-slate-200 pt-6 lg:sticky lg:top-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <h3 className="text-base font-bold text-[#003366]">{t.history}</h3>
                {selected.statusHistory.length ? (
                  <ol className="mt-4 space-y-4 border-l border-slate-200 pl-4">
                    {selected.statusHistory.map((entry) => (
                      <li key={entry.id} className="relative">
                        <span className="absolute -left-[1.32rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#007BFF]" />
                        <p className="text-sm font-semibold text-slate-800">
                          {entry.fromStatus ? `${statusLabel(entry.fromStatus, lang)} → ` : ""}
                          {statusLabel(entry.toStatus, lang)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{entry.changedByName}</p>
                        <time dateTime={entry.createdAt} className="mt-1 block text-xs text-slate-400">{formatDate(entry.createdAt, t.dateLocale)}</time>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-4 text-sm text-slate-500">{t.received}</p>}
              </aside>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="whitespace-pre-wrap break-words leading-6 text-slate-700">
        {link ? <a href={link} className="font-medium text-[#007BFF] hover:underline">{value}</a> : value}
      </dd>
    </div>
  )
}
