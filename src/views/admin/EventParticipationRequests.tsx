"use client"

/**
 * Back-office — « Demandes de participation » d'un événement.
 *
 * Composition pensée pour une fenêtre de gestion, pas pour un tableau de bord :
 * un en-tête qui nomme l'événement, une barre de synthèse compacte, puis une
 * liste en tableau administratif. Les informations de chaque demande longue
 * (coordonnées, message, historique) ne sont pas étalées dans la liste : elles
 * appartiennent au panneau « Voir », ouvert à la demande.
 *
 * Règles appliquées ici — aucune n'est un calcul de navigateur :
 * - les compteurs proviennent de `getEventParticipationAdminData()`, donc du
 *   serveur, et sont remplacés tels quels par la réponse de chaque décision ;
 * - les actions proposées dépendent strictement du statut de la demande ;
 * - « Valider » est refusé par le serveur si l'événement est complet ; le
 *   bouton n'est désactivé que pour ne pas proposer une décision impossible,
 *   le serveur restant seul juge ;
 * - les confirmations de validation et de refus sont de petites fenêtres
 *   secondaires : la modale principale garde sa taille.
 *
 * Le back-office du projet est rédigé en français, comme le reste de
 * `AdminEvents`.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  getEventParticipationAdminData,
  approveEventParticipationRequest,
  rejectEventParticipationRequest,
  cancelEventParticipationRequest,
  logEventParticipationContact,
  type EventParticipationRequestRow,
} from "@/lib/event-participation-actions"
import type { EventCapacityStats } from "@/lib/event-participation"
import {
  buildMailtoUrl,
  buildWhatsAppUrl,
  checkContactAvailability,
  renderParticipationEmailMessage,
  renderParticipationWhatsAppMessage,
  CONTACT_OPEN_LABELS,
  CONTACT_UNAVAILABLE_LABELS,
  type ContactChannel,
} from "@/lib/event-participation-contact"

const BRAND = "#003366"
const ACTION = "#007BFF"
const SURFACE = "#F7F8FA"

type Status = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

/** Badges sobres : fond très léger, anneau discret, aucune masse colorée. */
const STATUS_META: Record<Status, { label: string; chip: string }> = {
  PENDING: { label: "En attente", chip: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/80" },
  APPROVED: { label: "Validée", chip: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80" },
  REJECTED: { label: "Refusée", chip: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/80" },
  CANCELLED: { label: "Annulée", chip: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200" },
}

const STATUS_ORDER: Status[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"]

/* ─────────────────────────────── Helpers ─────────────────────────────── */

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}

function formatDateFr(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatDateShortFr(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTimeFr(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const day = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  return `${day} à ${time}`
}

function fullName(row: EventParticipationRequestRow): string {
  return `${row.firstName} ${row.lastName}`.trim()
}

function locationOf(row: EventParticipationRequestRow): string {
  return [row.city, row.country].filter(Boolean).join(", ")
}

/** Nombre de places : la valeur nulle signifie « aucune capacité déclarée ». */
function capacityText(stats: EventCapacityStats | null): string {
  if (!stats) return "—"
  return stats.capacity === null ? "Illimité" : String(stats.capacity)
}

function remainingText(stats: EventCapacityStats | null): string {
  if (!stats) return "—"
  if (stats.capacity === null) return "Illimité"
  return String(stats.remainingPlaces ?? 0)
}

/* ─────────────────────────── Briques visuelles ───────────────────────── */

const BTN_BASE =
  "inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold " +
  "transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"

const BTN_NEUTRAL = cx(BTN_BASE, "bg-slate-100 text-slate-700 hover:bg-slate-200")
const BTN_DANGER = cx(BTN_BASE, "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100")
const BTN_WARNING = cx(BTN_BASE, "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-100")
const BTN_WHATSAPP = cx(BTN_BASE, "bg-[#128C4A]/8 text-[#0F6B3A] hover:bg-[#128C4A]/15")
const BTN_EMAIL = cx(BTN_BASE, "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50")

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        meta.chip
      )}
    >
      {meta.label}
    </span>
  )
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx("h-3.5 w-3.5 shrink-0", className)}
    >
      <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5.1" r="0.85" fill="currentColor" />
    </svg>
  )
}

/**
 * Barre de synthèse : une seule surface neutre, colonnes séparées par un filet.
 *
 * Les compteurs sont volontairement distincts — « non lues » n'est jamais
 * confondu avec « en attente » : une demande lue reste en attente, et une
 * demande non lue est forcément en attente.
 */
function SummaryBar({ stats }: { stats: EventCapacityStats }) {
  const isFull = stats.hasCapacityLimit && stats.remainingPlaces === 0

  const cells = [
    { label: "Capacité", value: capacityText(stats), tone: "text-slate-800" },
    {
      label: "Validés",
      value: String(stats.validatedParticipants),
      tone: stats.validatedParticipants > 0 ? "text-emerald-700" : "text-slate-800",
    },
    {
      label: "En attente",
      value: String(stats.pendingRequests),
      tone: stats.pendingRequests > 0 ? "text-amber-700" : "text-slate-800",
    },
    {
      label: "Non lues",
      value: String(stats.unreadRequests),
      tone: stats.unreadRequests > 0 ? "text-[#007BFF]" : "text-slate-800",
      emphasis: true,
    },
    {
      label: "Places restantes",
      value: remainingText(stats),
      tone: isFull ? "text-rose-700" : "text-[#003366]",
      emphasis: true,
    },
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200" style={{ backgroundColor: SURFACE }}>
      <dl className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5 lg:divide-y-0">
        {cells.map((cell) => (
          <div key={cell.label} className="px-3.5 py-2.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-500">
              {cell.label}
            </dt>
            <dd
              className={cx(
                "mt-0.5 tabular-nums",
                cell.emphasis ? "text-2xl font-bold" : "text-xl font-semibold",
                cell.tone
              )}
            >
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-slate-200 px-3.5 py-1.5 text-[11px] text-slate-500">
        <span>
          Total&nbsp;: <span className="font-semibold tabular-nums text-slate-700">{stats.totalRequests}</span>
        </span>
        <span className="px-2 text-slate-300">•</span>
        <span>
          Refusées&nbsp;: <span className="font-semibold tabular-nums text-slate-700">{stats.rejectedRequests}</span>
        </span>
        <span className="px-2 text-slate-300">•</span>
        <span>
          Annulées&nbsp;: <span className="font-semibold tabular-nums text-slate-700">{stats.cancelledRequests}</span>
        </span>
      </p>
    </div>
  )
}

/* ──────────────────────────────── Ligne ──────────────────────────────── */

interface RowProps {
  row: EventParticipationRequestRow
  busy: boolean
  canValidate: boolean
  onView: () => void
  onContact: (channel: ContactChannel) => void
  onValidate: () => void
  onReject: () => void
  onCancel: () => void
}

function RequestRow({
  row,
  busy,
  canValidate,
  onView,
  onContact,
  onValidate,
  onReject,
  onCancel,
}: RowProps) {
  const location = locationOf(row)
  const blocked = !canValidate
  const isUnread = row.readAt === null

  const availability = useMemo(
    () => checkContactAvailability({ phone: row.phone, email: row.email }),
    [row.phone, row.email]
  )

  const contactButtons = (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={busy || !availability.whatsapp.available}
        onClick={() => onContact("WHATSAPP")}
        title={
          availability.whatsapp.available
            ? "Préparer un message WhatsApp"
            : CONTACT_UNAVAILABLE_LABELS[availability.whatsapp.reason]
        }
        className={BTN_WHATSAPP}
      >
        WhatsApp
      </button>
      <button
        type="button"
        disabled={busy || !availability.email.available}
        onClick={() => onContact("EMAIL")}
        title={
          availability.email.available
            ? "Préparer un e-mail"
            : CONTACT_UNAVAILABLE_LABELS[availability.email.reason]
        }
        className={BTN_EMAIL}
      >
        Email
      </button>
    </div>
  )

  const decisionButtons = (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={onView} className={BTN_NEUTRAL}>
        Voir
      </button>

      {row.status === "PENDING" && (
        <>
          <button type="button" disabled={busy} onClick={onReject} className={BTN_DANGER}>
            Refuser
          </button>
          <button
            type="button"
            disabled={busy || blocked}
            onClick={onValidate}
            title={blocked ? "Événement complet" : "Valider la participation"}
            style={{ backgroundColor: ACTION }}
            className={cx(BTN_BASE, "text-white hover:brightness-95")}
          >
            Valider
          </button>
        </>
      )}

      {row.status === "APPROVED" && (
        <button type="button" disabled={busy} onClick={onCancel} className={BTN_WARNING}>
          Annuler la validation
        </button>
      )}
    </div>
  )

  return (
    <div className={cx(
      "flex flex-col gap-4 border border-slate-200 bg-white rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md",
      busy && "opacity-60"
    )}>
      {/* 1. En-tête de la fiche */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-bold text-slate-800">{fullName(row)}</h4>
            <StatusBadge status={row.status} />
            {isUnread && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[#007BFF]"
                title="Demande non consultée"
              />
            )}
          </div>
          {location && <p className="text-[13px] text-slate-500">{location}</p>}
          {row.organization && (
            <p className="text-[13px] text-slate-400 mt-0.5">{row.organization}</p>
          )}
        </div>
        <div className="text-left sm:text-right text-[12px] text-slate-500">
          <p>Soumise le {formatDateShortFr(row.createdAt)}</p>
          {row.status === "APPROVED" && row.reviewedAt && (
            <p className="mt-1 text-emerald-700 font-semibold">Validée le {formatDateShortFr(row.reviewedAt)}</p>
          )}
        </div>
      </div>

      {/* 2. Motif de refus s'il existe */}
      {row.status === "REJECTED" && row.rejectionReason && (
        <div className="bg-rose-50 text-rose-800 text-[12px] p-3 rounded-lg border border-rose-100">
          <span className="font-semibold block mb-0.5">Motif du refus :</span>
          {row.rejectionReason}
        </div>
      )}

      {/* 3. Pied de la fiche : Contact & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-2">
        <div className="text-[13px] leading-relaxed">
          <a
            href={`mailto:${row.email}`}
            className="block text-slate-700 hover:text-[#007BFF] hover:underline"
          >
            {row.email}
          </a>
          {row.phone && (
            <a
              href={`tel:${row.phone.replace(/\s+/g, "")}`}
              className="block text-slate-700 hover:text-[#007BFF] hover:underline"
            >
              {row.phone}
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {contactButtons}
          <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
          {decisionButtons}
        </div>
      </div>
    </div>
  )
}

/**
 * Barre d'actions du panneau « Voir » pour une demande en attente.
 *
 * Mêmes règles que la liste : contacter ne change rien, valider consomme une
 * place. Les canaux indisponibles sont désactivés avec une explication.
 */
function DetailContactButtons({
  row,
  busy,
  onContact,
  canValidate,
  onValidate,
  onReject,
}: {
  row: EventParticipationRequestRow
  busy: boolean
  onContact: (channel: ContactChannel) => void
  canValidate: boolean
  onValidate: () => void
  onReject: () => void
}) {
  const availability = useMemo(
    () => checkContactAvailability({ phone: row.phone, email: row.email }),
    [row.phone, row.email]
  )

  return (
    <>
      <button
        type="button"
        disabled={busy || !availability.whatsapp.available}
        onClick={() => onContact("WHATSAPP")}
        title={
          availability.whatsapp.available
            ? "Préparer un message WhatsApp : l'envoi reste à votre main."
            : CONTACT_UNAVAILABLE_LABELS[availability.whatsapp.reason]
        }
        className={BTN_WHATSAPP}
      >
        WhatsApp
      </button>
      <button
        type="button"
        disabled={busy || !availability.email.available}
        onClick={() => onContact("EMAIL")}
        title={
          availability.email.available
            ? "Préparer un e-mail : l'envoi reste à votre main."
            : CONTACT_UNAVAILABLE_LABELS[availability.email.reason]
        }
        className={BTN_EMAIL}
      >
        Email
      </button>
      <button
        type="button"
        disabled={busy || !canValidate}
        onClick={onValidate}
        title={!canValidate ? "Événement complet : aucune place disponible." : undefined}
        style={{ backgroundColor: ACTION }}
        className={cx(BTN_BASE, "text-white hover:brightness-95")}
      >
        Valider
      </button>
      <button type="button" disabled={busy} onClick={onReject} className={BTN_DANGER}>
        Refuser
      </button>
    </>
  )
}

/* ───────────────────────────── Panneau « Voir » ───────────────────────── */

/**
 * Panneau latéral : la modale principale n'est ni agrandie ni reconstruite.
 * Affiche la demande complète et l'historique réellement disponible — dates de
 * dépôt et de traitement, auteur de la décision, motif de refus.
 */
function DetailDrawer({
  row,
  stats,
  busy,
  onClose,
  onContact,
  onValidate,
  onReject,
  onCancel,
}: {
  row: EventParticipationRequestRow
  stats: EventCapacityStats
  busy: boolean
  onClose: () => void
  onContact: (channel: ContactChannel) => void
  onValidate: () => void
  onReject: () => void
  onCancel: () => void
}) {
  const location = locationOf(row)
  const canValidate = !stats.hasCapacityLimit || (stats.remainingPlaces ?? 1) > 0

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">{label}</p>
      <div className="mt-0.5 text-[13px] leading-relaxed text-slate-700">{children}</div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[140] flex justify-end bg-[#003366]/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Demande de participation — ${fullName(row)}`}
        className="flex h-full w-full max-w-[26rem] flex-col border-l border-slate-200 bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold" style={{ color: BRAND }}>
              Demande de participation
            </h3>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{fullName(row)}</p>
            <div className="mt-1.5">
              <StatusBadge status={row.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panneau"
            className="-mr-1.5 -mt-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
              Coordonnées
            </p>
            <div className="space-y-3">
              <Field label="Email">
                <a href={`mailto:${row.email}`} className="text-[#007BFF] hover:underline break-all">
                  {row.email}
                </a>
              </Field>
              <Field label="Téléphone">
                {row.phone ? (
                  <a
                    href={`tel:${row.phone.replace(/\s+/g, "")}`}
                    className="text-[#007BFF] hover:underline"
                  >
                    {row.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Non renseigné</span>
                )}
              </Field>
              <Field label="Ville">{location || <span className="text-slate-400">Non renseignée</span>}</Field>
              {row.country && <Field label="Pays">{row.country}</Field>}
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
              Informations complémentaires
            </p>
            <div className="space-y-3">
              <Field label="Organisation">
                {row.organization || <span className="text-slate-400">Non renseignée</span>}
              </Field>
              <Field label="Message">
                {row.message ? (
                  <span className="whitespace-pre-line">{row.message}</span>
                ) : (
                  <span className="text-slate-400">Aucun message</span>
                )}
              </Field>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
              Historique
            </p>
            <div className="space-y-3">
              <Field label="Demande reçue">{formatDateTimeFr(row.createdAt)}</Field>
              <Field label="Statut actuel">
                <StatusBadge status={row.status} />
              </Field>
              {row.reviewedAt && (
                <Field label="Décision">
                  {formatDateTimeFr(row.reviewedAt)}
                  {row.reviewedByName ? ` · par ${row.reviewedByName}` : ""}
                </Field>
              )}
              {row.rejectionReason && (
                <Field label="Motif du refus">
                  <span className="text-rose-700">{row.rejectionReason}</span>
                </Field>
              )}
              <Field label="Langue du formulaire">{row.lang}</Field>
            </div>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button type="button" onClick={onClose} className={BTN_NEUTRAL}>
            Fermer
          </button>
          {row.status === "PENDING" && (
            <DetailContactButtons
              row={row}
              busy={busy}
              onContact={onContact}
              canValidate={canValidate}
              onValidate={onValidate}
              onReject={onReject}
            />
          )}
          {row.status === "APPROVED" && (
            <button type="button" disabled={busy} onClick={onCancel} className={BTN_WARNING}>
              Annuler la participation
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

/* ───────────────────────── Confirmations secondaires ─────────────────── */

/** Cadre commun des deux confirmations : fenêtre étroite, hors de la modale. */
function ConfirmShell({
  title,
  children,
  onCancel,
  cancelLabel,
  confirmLabel,
  confirmStyle,
  onConfirm,
  disabled,
}: {
  title: string
  children: React.ReactNode
  onCancel: () => void
  cancelLabel: string
  confirmLabel: string
  confirmStyle?: React.CSSProperties
  onConfirm: () => void
  disabled?: boolean
}) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#003366]/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h3 className="text-sm font-bold" style={{ color: BRAND }}>
          {title}
        </h3>
        <div className="mt-3">{children}</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className={BTN_NEUTRAL}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            style={confirmStyle}
            className={cx(BTN_BASE, "text-white")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────── Fenêtre « Contacter le participant » ────────────────── */

/**
 * Aperçu avant contact.
 *
 * Le message est déjà rédigé et prérempli : l'administrateur le relit, peut le
 * retoucher pour CE contact, puis ouvre le canal. Le serveur n'envoie rien.
 *
 * Une retouche ici reste locale : le modèle global n'est jamais modifié, et
 * aucune retouche n'est enregistrée comme nouveau modèle.
 */
function ContactDialog({
  row,
  eventTitle,
  onClose,
  onOpened,
}: {
  row: EventParticipationRequestRow
  eventTitle: string
  onClose: () => void
  onOpened: (channel: ContactChannel) => void
}) {
  const availability = useMemo(
    () => checkContactAvailability({ phone: row.phone, email: row.email }),
    [row.phone, row.email]
  )

  /** Modèle du canal choisi, variables déjà résolues. */
  const draftFor = useCallback(
    (channel: ContactChannel) => {
      const input = { channel, lang: row.lang, firstName: row.firstName, eventTitle }
      if (channel === "WHATSAPP") {
        return { subject: "", body: renderParticipationWhatsAppMessage(input) }
      }
      const email = renderParticipationEmailMessage(input)
      return { subject: email.subject, body: email.body }
    },
    [row.lang, row.firstName, eventTitle]
  )

  const [channel, setChannel] = useState<ContactChannel>(() =>
    availability.whatsapp.available ? "WHATSAPP" : "EMAIL"
  )
  const [subject, setSubject] = useState(() => draftFor(channel).subject)
  const [body, setBody] = useState(() => draftFor(channel).body)
  const [error, setError] = useState("")

  function switchChannel(next: ContactChannel) {
    const draft = draftFor(next)
    setChannel(next)
    setSubject(draft.subject)
    setBody(draft.body)
    setError("")
  }

  function openChannel() {
    const url =
      channel === "WHATSAPP"
        ? buildWhatsAppUrl(row.phone, body)
        : buildMailtoUrl(row.email, subject, body)

    if (!url) {
      setError(
        channel === "WHATSAPP"
          ? CONTACT_UNAVAILABLE_LABELS[
              availability.whatsapp.available ? "INVALID_PHONE" : availability.whatsapp.reason
            ]
          : CONTACT_UNAVAILABLE_LABELS.NO_EMAIL
      )
      return
    }

    // Le navigateur ouvre un canal externe ; l'envoi reste manuel.
    if (channel === "WHATSAPP") {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      window.location.href = url
    }
    onOpened(channel)
  }

  const channels: Array<{ id: ContactChannel; label: string; enabled: boolean; reason?: string }> = [
    {
      id: "WHATSAPP",
      label: "WhatsApp",
      enabled: availability.whatsapp.available,
      reason: availability.whatsapp.available ? undefined : CONTACT_UNAVAILABLE_LABELS[availability.whatsapp.reason],
    },
    {
      id: "EMAIL",
      label: "Email",
      enabled: availability.email.available,
      reason: availability.email.available ? undefined : CONTACT_UNAVAILABLE_LABELS[availability.email.reason],
    },
  ]

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#003366]/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Contacter ${fullName(row)}`}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <header className="shrink-0 border-b border-slate-200 px-5 py-3.5">
          <h3 className="text-sm font-bold" style={{ color: BRAND }}>
            Contacter le participant
          </h3>
          <p className="mt-0.5 text-xs text-slate-600">
            Participant&nbsp;: <span className="font-semibold text-slate-800">{fullName(row)}</span>
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {/* Choix du canal : un onglet indisponible explique pourquoi. */}
          <div className="flex gap-1.5" role="group" aria-label="Canal de contact">
            {channels.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!item.enabled}
                onClick={() => switchChannel(item.id)}
                title={item.reason}
                className={cx(
                  "flex-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                  channel === item.id
                    ? "border-[#003366] bg-[#EAF2F9] text-[#003366]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  !item.enabled && "cursor-not-allowed opacity-55 hover:bg-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {!availability.whatsapp.available && (
            <p className="text-[11px] text-slate-500">
              {CONTACT_UNAVAILABLE_LABELS[availability.whatsapp.reason]}
            </p>
          )}
          {!availability.email.available && (
            <p className="text-[11px] text-slate-500">
              {CONTACT_UNAVAILABLE_LABELS[availability.email.reason]}
            </p>
          )}

          {channel === "EMAIL" && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
                Objet
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none transition-colors focus:border-[#174F7A]"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
              Message
            </label>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full resize-y rounded-md border border-slate-200 px-2.5 py-2 text-xs leading-relaxed text-slate-800 outline-none transition-colors focus:border-[#174F7A]"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Modification valable pour ce contact uniquement&nbsp;: le modèle global n&apos;est pas
              modifié.
            </p>
          </div>

          {/* Rappel de la règle métier : contacter n'est pas valider. */}
          <p className="rounded-md border border-slate-200 bg-[#F7F8FA] px-2.5 py-2 text-[11px] leading-relaxed text-slate-600">
            Ouvrir ce canal n&apos;envoie rien à votre place et ne modifie pas la demande : elle reste
            en attente. Aucune place n&apos;est consommée tant que vous n&apos;avez pas validé la
            participation.
          </p>

          {error && <p className="text-[11px] font-semibold text-rose-700">{error}</p>}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button type="button" onClick={onClose} className={BTN_NEUTRAL}>
            Annuler
          </button>
          <button
            type="button"
            onClick={openChannel}
            style={{ backgroundColor: channel === "WHATSAPP" ? "#128C4A" : ACTION }}
            className={cx(BTN_BASE, "text-white hover:brightness-95")}
          >
            {CONTACT_OPEN_LABELS[channel]}
          </button>
        </footer>
      </div>
    </div>
  )
}

/* ──────────────────────────────── Modale ─────────────────────────────── */

interface Props {
  eventId: string
  eventTitle: string
  onClose: () => void
}

export default function EventParticipationRequests({ eventId, eventTitle, onClose }: Props) {
  const [stats, setStats] = useState<EventCapacityStats | null>(null)
  const [requests, setRequests] = useState<EventParticipationRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: "ok" | "ko"; text: string } | null>(null)

  const [detailId, setDetailId] = useState<string | null>(null)
  const [validatingId, setValidatingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  /** Demande et canal choisis pour la fenêtre de contact. */
  const [contact, setContact] = useState<{ id: string; channel: ContactChannel } | null>(null)

  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING")

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      const res = await getEventParticipationAdminData(eventId)
      if (!res.success) {
        setLoadError(res.error || "Chargement impossible.")
      } else {
        setStats(res.stats)
        setRequests(res.requests)
      }
    } catch {
      setLoadError("Chargement impossible.")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    void load()
  }, [load])

  /**
   * Exécute une décision. Les compteurs affichés après coup sont ceux renvoyés
   * par le serveur : le navigateur ne recalcule jamais une place.
   */
  const run = useCallback(
    async (
      row: EventParticipationRequestRow,
      action: () => Promise<{ success: boolean; error?: string; stats?: EventCapacityStats }>,
      successText: (next: EventCapacityStats) => string
    ) => {
      setBusyId(row.id)
      setNotice(null)
      try {
        const res = await action()
        if (!res.success) {
          setNotice({ tone: "ko", text: res.error || "Action impossible." })
          return false
        }
        // Les compteurs affichés sont ceux renvoyés par le serveur, jamais recalculés.
        if (res.stats) setStats(res.stats)
        setNotice({ tone: "ok", text: res.stats ? successText(res.stats) : "Action effectuée." })
        // Le rafraîchissement ne peut pas faire échouer une décision déjà acceptée :
        // en cas de souci, `loadError` s'affiche mais la décision reste confirmée.
        void load()
        return true
      } catch {
        setNotice({ tone: "ko", text: "Action impossible." })
        return false
      } finally {
        setBusyId(null)
      }
    },
    [load]
  )

  const sorted = useMemo(
    () =>
      [...requests].sort((a, b) => {
        const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
        if (byStatus !== 0) return byStatus
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
    [requests]
  )

  const displayedRequests = useMemo(() => {
    if (activeTab === "ALL") return sorted;
    return sorted.filter(r => r.status === activeTab);
  }, [sorted, activeTab]);

  const detailRow = useMemo(
    () => sorted.find((r) => r.id === detailId) ?? null,
    [sorted, detailId]
  )
  const validatingRow = useMemo(
    () => sorted.find((r) => r.id === validatingId) ?? null,
    [sorted, validatingId]
  )
  const rejectingRow = useMemo(
    () => sorted.find((r) => r.id === rejectingId) ?? null,
    [sorted, rejectingId]
  )
  const contactRow = useMemo(
    () => (contact ? sorted.find((r) => r.id === contact.id) ?? null : null),
    [sorted, contact]
  )

  const isFull = Boolean(stats?.hasCapacityLimit && stats?.remainingPlaces === 0)
  const canValidate = !stats?.hasCapacityLimit || (stats?.remainingPlaces ?? 1) > 0

  // Échap ferme la couche supérieure : panneau, puis contact, puis confirmation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (validatingId) setValidatingId(null)
      else if (rejectingId) setRejectingId(null)
      else if (contact) setContact(null)
      else if (detailId) setDetailId(null)
      else onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [validatingId, rejectingId, contact, detailId, onClose])

  /**
   * Ouvre le canal choisi par l'administrateur.
   *
   * Le navigateur ouvre WhatsApp ou le composeur d'e-mail : rien n'est envoyé
   * par le serveur, le statut ne bouge pas, aucune place n'est consommée. Seule
   * l'ouverture du canal est journalisée, jamais un « message envoyé ».
   */
  const onContactOpened = useCallback((row: EventParticipationRequestRow, channel: ContactChannel) => {
    void logEventParticipationContact(row.id, channel)
    setNotice({
      tone: "ok",
      text:
        channel === "WHATSAPP"
          ? `WhatsApp ouvert pour ${fullName(row)} : le message est prérempli, l'envoi reste à votre main. La demande reste en attente.`
          : `Composeur d'e-mail ouvert pour ${fullName(row)} : le message est prérempli, l'envoi reste à votre main. La demande reste en attente.`,
    })
    setContact(null)
  }, [])

  const confirmValidate = async () => {
    if (!validatingRow) return
    const row = validatingRow
    const ok = await run(
      row,
      () => approveEventParticipationRequest(row.id),
      (next) =>
        `Participation validée : ${fullName(row)} consomme 1 place. ` +
        `Validés ${next.validatedParticipants} · Places restantes ${remainingText(next)}.`
    )
    if (ok) setValidatingId(null)
  }

  const confirmReject = async () => {
    if (!rejectingRow) return
    const row = rejectingRow
    const ok = await run(
      row,
      () => rejectEventParticipationRequest(row.id, rejectReason),
      () => `Demande refusée : aucune place consommée pour ${fullName(row)}.`
    )
    if (ok) {
      setRejectingId(null)
      setRejectReason("")
    }
  }

  const cancelApproval = async (row: EventParticipationRequestRow) => {
    await run(
      row,
      () => cancelEventParticipationRequest(row.id),
      (next) =>
        `Participation annulée : la place est de nouveau disponible pour ${fullName(row)}. ` +
        `Places restantes ${remainingText(next)}.`
    )
  }

  /* --- Rendu --- */

  const confirmNumbers = stats ? (
    <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-[#F7F8FA] px-3">
      {[
        ["Capacité", capacityText(stats)],
        ["Validés actuellement", String(stats.validatedParticipants)],
        ["Places restantes", remainingText(stats)],
      ].map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-1.5">
          <dt className="text-xs text-slate-600">{label}</dt>
          <dd className="text-xs font-semibold tabular-nums" style={{ color: BRAND }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  ) : null

  const tabs: { value: typeof activeTab; label: string }[] = [
    { value: "PENDING", label: "À traiter" },
    { value: "APPROVED", label: "Validées" },
    { value: "REJECTED", label: "Refusées" },
    { value: "ALL", label: "Toutes" },
  ]

  return (
    <>
      <div className="flex h-full flex-col bg-[#F7F8FA]">
        {/* En-tête de la page */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-6 py-6 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mb-3"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor">
                  <path d="M10 12L6 8l4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Retour aux événements
              </button>
              <h2 id="participation-title" className="text-2xl font-bold tracking-tight text-[#003366]">
                Demandes de participation
              </h2>
              <p className="mt-1.5 truncate text-sm font-semibold text-slate-600">
                {eventTitle}
              </p>
            </div>
            
            {stats && (
              <div className="shrink-0">
                <SummaryBar stats={stats} />
              </div>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <div className="max-w-4xl mx-auto">
            {notice && (
              <p
                role="status"
                className={cx(
                  "mb-6 rounded-lg border px-4 py-3 text-sm font-semibold",
                  notice.tone === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                )}
              >
                {notice.text}
              </p>
            )}

            {loading && <p className="text-sm text-slate-400">Chargement des demandes…</p>}
            {loadError && <p className="text-sm text-rose-600">{loadError}</p>}

            {!loading && stats && (
              <>
                {/* Filtres par onglets */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={cx(
                        "rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer border",
                        activeTab === tab.value
                          ? "bg-[#003366] text-white border-[#003366]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {isFull && (
                  <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-900 leading-relaxed">
                    Événement complet — aucune place restante. Les demandes en attente restent
                    visibles, mais la validation est bloquée tant qu&apos;une place n&apos;est pas
                    libérée par une annulation.
                  </p>
                )}

                {displayedRequests.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
                    <p className="text-sm font-bold text-slate-700">Aucune demande trouvée</p>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                      Il n&apos;y a actuellement aucune demande correspondant à ce statut.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      {displayedRequests.map((row) => (
                        <RequestRow
                          key={row.id}
                          row={row}
                          busy={busyId === row.id}
                          canValidate={canValidate}
                          onView={() => setDetailId(row.id === detailId ? null : row.id)}
                          onContact={(channel) => setContact({ id: row.id, channel })}
                          onValidate={() => setValidatingId(row.id)}
                          onReject={() => {
                            setRejectReason("")
                            setRejectingId(row.id)
                          }}
                          onCancel={() => void cancelApproval(row)}
                        />
                      ))}
                    </div>

                    <p className="mt-6 mb-2 text-[12px] font-semibold text-center text-slate-500">
                      {sorted.length} demande{sorted.length > 1 ? "s" : ""} au total ·{" "}
                      {stats.pendingRequests} en attente
                    </p>
                  </>
              )}
            </>
          )}
        </div>
      </div>
    </div>

      {/* Fenêtre « Contacter le participant » */}
      {contactRow && (
        <ContactDialog
          row={contactRow}
          eventTitle={eventTitle}
          onClose={() => setContact(null)}
          onOpened={(channel) => onContactOpened(contactRow, channel)}
        />
      )}

      {/* Panneau « Voir » */}
      {detailRow && stats && (
        <DetailDrawer
          row={detailRow}
          stats={stats}
          busy={busyId === detailRow.id}
          onClose={() => setDetailId(null)}
          onContact={(channel) => {
            setDetailId(null)
            setContact({ id: detailRow.id, channel })
          }}
          onValidate={() => {
            setDetailId(null)
            setValidatingId(detailRow.id)
          }}
          onReject={() => {
            setRejectReason("")
            setRejectingId(detailRow.id)
          }}
          onCancel={() => void cancelApproval(detailRow)}
        />
      )}

      {/* Confirmation de validation */}
      {validatingRow && stats && (
        <ConfirmShell
          title="Confirmer la validation de cette participation ?"
          onCancel={() => setValidatingId(null)}
          cancelLabel="Annuler"
          confirmLabel="Valider la demande"
          confirmStyle={{ backgroundColor: ACTION }}
          onConfirm={() => void confirmValidate()}
          disabled={busyId === validatingRow.id}
        >
          <p className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">{fullName(validatingRow)}</span> sera
            marqué comme valide. Une place sera consommée ; la capacité, elle, ne change pas.
          </p>
          <div className="mt-3">{confirmNumbers}</div>
        </ConfirmShell>
      )}

      {/* Confirmation de refus */}
      {rejectingRow && (
        <ConfirmShell
          title="Refuser cette demande de participation ?"
          onCancel={() => {
            setRejectingId(null)
            setRejectReason("")
          }}
          cancelLabel="Annuler"
          confirmLabel="Refuser la demande"
          confirmStyle={{ backgroundColor: "#C0392B" }}
          onConfirm={() => void confirmReject()}
          disabled={busyId === rejectingRow.id}
        >
          <p className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">{fullName(rejectingRow)}</span> sera
            marqué comme refusée. Aucune place n&apos;est consommée.
          </p>
          <label className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
            Motif du refus (facultatif)
          </label>
          <textarea
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Conservé dans l'historique de la demande."
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none transition-colors focus:border-[#174F7A]"
          />
        </ConfirmShell>
      )}
    </>
  )
}
