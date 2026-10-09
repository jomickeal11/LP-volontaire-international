"use client"

import React, { useState, useEffect, useRef } from "react"
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/cms-actions"
import { uploadMediaFile } from "@/lib/upload-client"
import { translateCmsFieldsAction } from "@/lib/translator"
import {
  OTHER_CATEGORY,
  validateEventBasics,
  validateEventForPublication,
  type EventInput,
} from "@/lib/events"
import EventParticipationRequests from "./EventParticipationRequests"
import { getEventsParticipationSummary } from "@/lib/event-participation-actions"
import type { EventCapacityStats } from "@/lib/event-participation"
import { useConfirm } from "@/components/admin/ConfirmProvider"

type Lang = "FR" | "EN" | "DE"
type Intent = "draft" | "publish"

interface EventItem {
  id: string
  slug: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  programmeFr?: string | null
  programmeEn?: string | null
  programmeDe?: string | null
  category: string
  categoryOther?: string | null
  location?: string | null
  startDate: Date | string
  endDate?: Date | string | null
  isOnline: boolean
  meetingUrl?: string | null
  registrationUrl?: string | null
  registrationOpen: boolean
  maxParticipants?: number | null
  featuredImage?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  published: boolean
  publishedFr: boolean
  publishedEn: boolean
  publishedDe: boolean
}

const CATEGORY_OPTIONS = [
  { value: "WORKSHOP", label: "Atelier pratique" },
  { value: "TRAINING", label: "Formation certifiante" },
  { value: "CONFERENCE", label: "Conférence / Table ronde" },
  { value: "HACKATHON", label: "Hackathon / Défi" },
  { value: "CEREMONY", label: "Cérémonie de remise" },
  { value: OTHER_CATEGORY, label: "Autre (préciser ci-dessous)" },
]

const LANG_TABS: { key: Lang; label: string }[] = [
  { key: "FR", label: "Français" },
  { key: "EN", label: "English" },
  { key: "DE", label: "Deutsch" },
]

const INPUT =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none"
const LABEL = "block text-xs font-bold text-slate-700 mb-1"
const HINT = "text-[11px] text-slate-500 mt-1 leading-relaxed"

/** Date et heure locales au format attendu par <input type="datetime-local">. */
function toDateTimeLocal(value?: string | Date | null): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

/** Une date « YYYY-MM-DDTHH:MM » est lue en heure locale par le navigateur. */
function fromDateTimeLocal(value: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function categoryLabel(ev: EventItem): string {
  if (ev.category === OTHER_CATEGORY) return ev.categoryOther?.trim() || "Autre"
  return CATEGORY_OPTIONS.find((c) => c.value === ev.category)?.label || ev.category
}

/** Langues réellement publiées d'un événement, dans l'ordre de la charte. */
function publishedLangs(ev: EventItem): Lang[] {
  const langs: Lang[] = []
  if (ev.publishedFr) langs.push("FR")
  if (ev.publishedEn) langs.push("EN")
  if (ev.publishedDe) langs.push("DE")
  return langs
}

/** Format de participation tel qu'affiché, sans inventer de modalité absente. */
function formatLabel(ev: EventItem): string {
  if (ev.isOnline) return ev.location ? "En ligne + présentiel" : "En ligne"
  return "Présentiel"
}

/**
 * Lien public d'un événement dans une langue où il est publié.
 *
 * Renvoie null si aucune langue n'est publiée : le back-office n'expose alors
 * aucune action « Voir la page publique » plutôt qu'un lien vers une page 404.
 */
function publicEventPath(ev: EventItem): string | null {
  const lang = publishedLangs(ev)[0]?.toLowerCase()
  return lang ? `/${lang}/evenements/${ev.slug}` : null
}

/** Indicateur de participation d'une ligne : jamais un contenu inventé. */
function participationMeta(stats: EventCapacityStats | undefined): {
  label: string
  tone: string
  dot: boolean
} {
  if (!stats || stats.totalRequests === 0) {
    return { label: "0 demande", tone: "text-slate-400", dot: false }
  }
  if (stats.unreadRequests > 0) {
    return {
      label: `${stats.unreadRequests} nouvelle${stats.unreadRequests > 1 ? "s" : ""}`,
      tone: "text-[#007BFF]",
      dot: true,
    }
  }
  if (stats.pendingRequests > 0) {
    return {
      label: `${stats.pendingRequests} en attente`,
      tone: "text-amber-700",
      dot: false,
    }
  }
  return {
    label: `${stats.validatedParticipants} validée${stats.validatedParticipants > 1 ? "s" : ""}`,
    tone: "text-emerald-700",
    dot: false,
  }
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3.5">
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 shrink-0 rounded-full bg-[#003366] text-white text-[11px] font-bold flex items-center justify-center">
            {step}
          </span>
          <h3 className="text-sm font-bold text-[#003366]">{title}</h3>
        </div>
        {hint && <p className="text-[11px] text-slate-500 leading-relaxed">{hint}</p>}
      </header>
      {children}
    </section>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#003366] focus:ring-[#007BFF]/30 cursor-pointer shrink-0"
      />
      <span className="min-w-0">
        <span className="block text-xs font-bold text-slate-700">{label}</span>
        {hint && <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">{hint}</span>}
      </span>
    </label>
  )
}

export default function AdminEvents() {
  const confirm = useConfirm()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translatingField, setTranslatingField] = useState<string | null>(null)
  const [showTranslationHelp, setShowTranslationHelp] = useState(false)
  const [translationNotice, setTranslationNotice] = useState<{
    tone: "success" | "warning"
    text: string
  } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState<Lang>("FR")
  const [errors, setErrors] = useState<string[]>([])
  const [requestsFor, setRequestsFor] = useState<{ id: string; title: string } | null>(null)
  const [statsByEvent, setStatsByEvent] = useState<Record<string, EventCapacityStats>>({})
  const [filter, setFilter] = useState<"all" | "upcoming" | "published" | "draft">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState(() => ({
    titleFr: "",
    titleEn: "",
    titleDe: "",
    descriptionFr: "",
    descriptionEn: "",
    descriptionDe: "",
    programmeFr: "",
    programmeEn: "",
    programmeDe: "",
    category: "WORKSHOP",
    categoryOther: "",
    location: "",
    startDate: toDateTimeLocal(new Date()),
    endDate: "",
    isOnline: false,
    meetingUrl: "",
    registrationOpen: false,
    registrationUrl: "",
    maxParticipants: "",
    featuredImage: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    publishedFr: false,
    publishedEn: false,
    publishedDe: false,
  }))

  const update = (patch: Partial<typeof formData>) => setFormData((prev) => ({ ...prev, ...patch }))

  const canSubmit = !!(
    formData.titleFr.trim() &&
    formData.startDate.trim() &&
    formData.location.trim()
  )

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getEvents()
      setEvents(data as any)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Demandes de participation, par événement.
   *
   * Tout provient d'un calcul en base : non lues, en attente, validées et total.
   * « Lue » ne veut pas dire « validée » : le compteur de non lues est distinct
   * du nombre de demandes en attente.
   */
  const loadParticipationSummary = async () => {
    try {
      const res = await getEventsParticipationSummary()
      if (res.success) setStatsByEvent(res.byEvent)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
    void loadParticipationSummary()
  }, [])

  // Une liste de demandes consultée marque les demandes comme lues : au retour,
  // la liste et la barre latérale sont relues depuis la base.
  const closeRequests = () => {
    setRequestsFor(null)
    void loadParticipationSummary()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aptic:participation-updated"))
    }
  }

  // Ferme le menu d'actions au premier clic hors de celui-ci.
  useEffect(() => {
    if (!menuFor) return
    const close = () => setMenuFor(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [menuFor])

  const now = Date.now()
  const summary = {
    total: events.length,
    published: events.filter((ev) => publishedLangs(ev).length > 0).length,
    upcoming: events.filter((ev) => {
      const time = new Date(ev.startDate).getTime()
      return Number.isFinite(time) && time >= now
    }).length,
    unread: events.reduce(
      (sum, ev) => sum + (statsByEvent[ev.id]?.unreadRequests ?? 0),
      0
    ),
  }

  const filtered = events.filter((ev) => {
    const isPublished = publishedLangs(ev).length > 0
    const start = new Date(ev.startDate).getTime()
    const isUpcoming = Number.isFinite(start) && start >= now

    if (filter === "published" && !isPublished) return false
    if (filter === "draft" && isPublished) return false
    if (filter === "upcoming" && !isUpcoming) return false
    if (categoryFilter !== "ALL" && ev.category !== categoryFilter) return false
    if (onlyUnread && (statsByEvent[ev.id]?.unreadRequests ?? 0) === 0) return false

    const query = search.trim().toLowerCase()
    if (query) {
      const haystack = [ev.titleFr, ev.titleEn, ev.titleDe, ev.location, categoryLabel(ev)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })

  // Verrouille le défilement de la page derrière la modale et restaure
  // l'état initial à la fermeture (et si le composant est démonté).
  useEffect(() => {
    if (!modalOpen) return
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = "hidden"
    body.classList.add("modal-scroll-locked")
    return () => {
      body.style.overflow = previousOverflow
      body.classList.remove("modal-scroll-locked")
    }
  }, [modalOpen])

  const handleOpenModal = (ev?: EventItem) => {
    setErrors([])
    setActiveLangTab("FR")
    if (ev) {
      setEditingId(ev.id)
      setFormData({
        titleFr: ev.titleFr || "",
        titleEn: ev.titleEn || "",
        titleDe: ev.titleDe || "",
        descriptionFr: ev.descriptionFr || "",
        descriptionEn: ev.descriptionEn || "",
        descriptionDe: ev.descriptionDe || "",
        programmeFr: ev.programmeFr || "",
        programmeEn: ev.programmeEn || "",
        programmeDe: ev.programmeDe || "",
        category: ev.category || "WORKSHOP",
        categoryOther: ev.categoryOther || "",
        location: ev.location || "",
        startDate: toDateTimeLocal(ev.startDate),
        endDate: ev.endDate ? toDateTimeLocal(ev.endDate) : "",
        isOnline: Boolean(ev.isOnline),
        meetingUrl: ev.meetingUrl || "",
        registrationOpen: Boolean(ev.registrationOpen),
        registrationUrl: ev.registrationUrl || "",
        maxParticipants:
          ev.maxParticipants === null || ev.maxParticipants === undefined
            ? ""
            : String(ev.maxParticipants),
        featuredImage: ev.featuredImage || "",
        contactName: ev.contactName || "",
        contactEmail: ev.contactEmail || "",
        contactPhone: ev.contactPhone || "",
        publishedFr: Boolean(ev.publishedFr),
        publishedEn: Boolean(ev.publishedEn),
        publishedDe: Boolean(ev.publishedDe),
      })
    } else {
      setEditingId(null)
      setFormData((prev) => ({
        ...prev,
        titleFr: "",
        titleEn: "",
        titleDe: "",
        descriptionFr: "",
        descriptionEn: "",
        descriptionDe: "",
        programmeFr: "",
        programmeEn: "",
        programmeDe: "",
        category: "WORKSHOP",
        categoryOther: "",
        location: "",
        startDate: toDateTimeLocal(new Date()),
        endDate: "",
        isOnline: false,
        meetingUrl: "",
        registrationOpen: false,
        registrationUrl: "",
        maxParticipants: "",
        featuredImage: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        publishedFr: false,
        publishedEn: false,
        publishedDe: false,
      }))
    }
    setModalOpen(true)
  }

  const buildEventInput = (): EventInput => ({
    titleFr: formData.titleFr,
    titleEn: formData.titleEn,
    titleDe: formData.titleDe,
    descriptionFr: formData.descriptionFr,
    descriptionEn: formData.descriptionEn,
    descriptionDe: formData.descriptionDe,
    programmeFr: formData.programmeFr,
    programmeEn: formData.programmeEn,
    programmeDe: formData.programmeDe,
    category: formData.category,
    categoryOther: formData.categoryOther,
    location: formData.location,
    startDate: fromDateTimeLocal(formData.startDate),
    endDate: formData.endDate ? fromDateTimeLocal(formData.endDate) : null,
    isOnline: formData.isOnline,
    meetingUrl: formData.meetingUrl,
    registrationUrl: formData.registrationUrl,
    registrationOpen: formData.registrationOpen,
    maxParticipants: formData.maxParticipants === "" ? null : Number(formData.maxParticipants),
    // Doit être renvoyé explicitement : sans ce champ, la normalisation
    // remit featuredImage à null et tout enregistrement effacerait l'image.
    featuredImage: formData.featuredImage,
    contactName: formData.contactName,
    contactEmail: formData.contactEmail,
    contactPhone: formData.contactPhone,
    publishedFr: formData.publishedFr,
    publishedEn: formData.publishedEn,
    publishedDe: formData.publishedDe,
  })

  const handleAutoTranslate = async () => {
    if (!formData.titleFr.trim()) {
      setErrors(["Saisissez d'abord un titre en français avant de lancer la traduction."])
      return
    }

    setTranslating(true)
    setErrors([])
    setTranslationNotice(null)
    try {
      const res = await translateCmsFieldsAction({
        texts: {
          title: formData.titleFr,
          description: formData.descriptionFr || "",
          programme: formData.programmeFr || "",
        },
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success) {
        const t = (lang: "EN" | "DE", key: string, fallback: string) => {
          const field = res.translations[lang]?.[key]
          return field && field.status !== "failed" ? field.text : fallback
        }
        setFormData((prev) => ({
          ...prev,
          titleEn: t("EN", "title", prev.titleEn),
          descriptionEn: t("EN", "description", prev.descriptionEn),
          programmeEn: t("EN", "programme", prev.programmeEn),
          titleDe: t("DE", "title", prev.titleDe),
          descriptionDe: t("DE", "description", prev.descriptionDe),
          programmeDe: t("DE", "programme", prev.programmeDe),
        }))
        setTranslationNotice({
          tone: res.outcome.level === "success" ? "success" : "warning",
          text: res.outcome.message,
        })
      } else {
        setErrors([res.error || res.outcome.message || "Service indisponible"])
      }
    } catch (err: any) {
      setErrors([`Erreur de connexion lors de la traduction : ${err.message || "inconnue"}`])
    } finally {
      setTranslating(false)
    }
  }

  const handleTranslateSingleField = async (
    field: "title" | "description" | "programme",
    targetLang: "EN" | "DE"
  ) => {
    const source = { title: formData.titleFr, description: formData.descriptionFr, programme: formData.programmeFr }[field]
    if (!source || !source.trim()) {
      setErrors(["Le texte source en français est vide pour ce champ."])
      return
    }

    setTranslatingField(`${field}_${targetLang}`)
    setErrors([])
    setTranslationNotice(null)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [field]: source },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })
      const result = res.translations?.[targetLang]?.[field]
      if (res.success && result && result.status !== "failed") {
        setFormData((prev) => ({
          ...prev,
          [`${field}${targetLang}`]: result.text,
        }))
        setTranslationNotice({
          tone: result.provider === "deepl" ? "success" : "warning",
          text: `Champ « ${field} » traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} (${result.provider === "deepl" ? "DeepL" : "moteur de secours"}).`,
        })
      } else {
        setErrors([res.error || res.outcome.message || "Erreur lors de la traduction."])
      }
    } catch (err: any) {
      setErrors([err.message || "Erreur de connexion."])
    } finally {
      setTranslatingField(null)
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setErrors([])

    try {
      const result = await uploadMediaFile(file, "image")

      if (result.success) {
        update({ featuredImage: result.url })
      } else {
        setErrors([result.error || "Erreur lors du téléversement de l'image."])
      }
    } catch (err: any) {
      setErrors([err.message || "Erreur réseau"])
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (intent: Intent) => {
    const input = buildEventInput()
    const validationErrors =
      intent === "publish" ? validateEventForPublication(input) : validateEventBasics(input)

    setErrors(validationErrors)
    if (validationErrors.length > 0) return

    setSubmitting(true)
    try {
      const payload = {
        ...input,
        titleFr: formData.titleFr,
        category: formData.category,
        intent,
      }
      const res = editingId
        ? await updateEvent(editingId, payload)
        : await createEvent(payload)

      if (res.success) {
        setModalOpen(false)
        setEditingId(null)
        await loadData()
      } else {
        setErrors(res.errors?.length ? res.errors : [res.error || "Erreur lors de l'enregistrement"])
      }
    } catch (err: any) {
      setErrors([err.message || "Erreur réseau"])
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: "Supprimer l'événement ?",
      message: `Supprimer l'événement « ${title} » ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
    })
    if (!ok) return
    try {
      const res = await deleteEvent(id)
      if (res.success) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id))
      } else {
        alert(res.error || "Erreur lors de la suppression.")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const langFields = {
    FR: { title: "titleFr", description: "descriptionFr", programme: "programmeFr" },
    EN: { title: "titleEn", description: "descriptionEn", programme: "programmeEn" },
    DE: { title: "titleDe", description: "descriptionDe", programme: "programmeDe" },
  } as const
  const fields = langFields[activeLangTab]
  const isFr = activeLangTab === "FR"

  const FILTERS: { value: "all" | "upcoming" | "published" | "draft"; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "upcoming", label: "À venir" },
    { value: "published", label: "Publiés" },
    { value: "draft", label: "Brouillons" },
  ]

  /**
   * Menu d'actions secondaires d'une ligne.
   *
   * Contient uniquement des actions qui existent réellement. « Voir la page
   * publique » n'est proposé que si au moins une langue est publiée, sinon le
   * lien mènerait à une page inexistante.
   */
  const renderMenu = (ev: EventItem, align: "left" | "right") => {
    const publicPath = publicEventPath(ev)
    const itemClass =
      "block w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setMenuFor(menuFor === ev.id ? null : ev.id)}
          aria-label="Autres actions"
          aria-haspopup="menu"
          aria-expanded={menuFor === ev.id}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="3" r="1.3" />
            <circle cx="8" cy="8" r="1.3" />
            <circle cx="8" cy="13" r="1.3" />
          </svg>
        </button>
        {menuFor === ev.id && (
          <div
            role="menu"
            className={`absolute top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuFor(null)
                handleOpenModal(ev)
              }}
              className={itemClass}
            >
              Modifier
            </button>
            {publicPath ? (
              <a
                role="menuitem"
                href={publicPath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuFor(null)}
                className={itemClass}
              >
                Voir la page publique
              </a>
            ) : (
              <span
                className="block w-full cursor-not-allowed px-3 py-2 text-left text-xs font-semibold text-slate-300"
                title="Aucune langue n&apos;est publiée pour cet événement"
              >
                Voir la page publique
              </span>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuFor(null)
                void handleDelete(ev.id, ev.titleFr)
              }}
              className="block w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderPublication = (ev: EventItem) => {
    const langs = publishedLangs(ev)
    if (langs.length === 0) {
      return (
        <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Brouillon
        </span>
      )
    }
    return (
      <div className="flex flex-wrap gap-1">
        {langs.map((l) => (
          <span
            key={l}
            className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
          >
            {l}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">
            Événements & Formations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Planifiez et annoncez les ateliers, conférences, hackathons et formations d&apos;APTIC-R.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003366] text-white font-medium text-sm rounded-xl hover:bg-[#002244] transition-colors shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel événement</span>
        </button>
      </div>

      {/* ── Synthèse ── */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
        {[
          { label: "Événements", value: summary.total, tone: "text-slate-800" },
          { label: "Publiés", value: summary.published, tone: "text-[#003366]" },
          { label: "À venir", value: summary.upcoming, tone: "text-slate-800" },
          {
            label: "Demandes non lues",
            value: summary.unread,
            tone: summary.unread > 0 ? "text-[#007BFF]" : "text-slate-800",
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-500">
              {cell.label}
            </p>
            <p className={`mt-0.5 text-xl font-bold tabular-nums ${cell.tone}`}>{cell.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === item.value
                  ? "bg-[#003366] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyUnread((value) => !value)}
            aria-pressed={onlyUnread}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              onlyUnread
                ? "bg-[#007BFF] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Avec nouvelles demandes
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-[#174F7A] cursor-pointer"
          >
            <option value="ALL">Toutes les catégories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement..."
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none transition-colors focus:border-[#174F7A] sm:w-64"
          />
        </div>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
          Chargement des événements...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm font-semibold text-slate-600">
            {events.length === 0
              ? "Aucun événement programmé."
              : "Aucun événement ne correspond à ces filtres."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden rounded-2xl border border-slate-200 bg-white xl:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-500">
                  <th className="px-4 py-2.5">Événement</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Format</th>
                  <th className="px-4 py-2.5">Participation</th>
                  <th className="px-4 py-2.5">Pub.</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ev) => {
                  const participation = participationMeta(statsByEvent[ev.id])
                  return (
                    <tr key={ev.id} className="align-middle transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(ev)}
                          className="block max-w-[16rem] truncate text-left text-sm font-semibold text-slate-800 transition-colors hover:text-[#174F7A] cursor-pointer"
                        >
                          {ev.titleFr || "(sans titre)"}
                        </button>
                        <p className="mt-0.5 text-[11px] text-slate-500">{categoryLabel(ev)}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium tabular-nums text-slate-700">
                        {toDateTimeLocal(ev.startDate).replace("T", " ")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                        {formatLabel(ev)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${participation.tone}`}
                        >
                          {participation.dot && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#007BFF]" />
                          )}
                          {participation.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">{renderPublication(ev)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setRequestsFor({ id: ev.id, title: ev.titleFr || "Événement" })
                            }
                            className="rounded-md bg-[#28A745]/10 px-2.5 py-1 text-xs font-semibold text-[#1e7e35] transition-colors hover:bg-[#28A745]/20 cursor-pointer"
                            title="Consulter et traiter les demandes de participation"
                          >
                            Demandes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(ev)}
                            className="rounded-md bg-[#003366]/10 px-2.5 py-1 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#003366]/20 cursor-pointer"
                            title="Modifier l'événement"
                          >
                            Modifier
                          </button>
                          {renderMenu(ev, "right")}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablette */}
          <div className="space-y-2 xl:hidden">
            {filtered.map((ev) => {
              const participation = participationMeta(statsByEvent[ev.id])
              return (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(ev)}
                        className="block max-w-full truncate text-left text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {ev.titleFr || "(sans titre)"}
                      </button>
                      <p className="mt-0.5 text-[11px] text-slate-500">{categoryLabel(ev)}</p>
                    </div>
                    <div className="shrink-0">{renderPublication(ev)}</div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                    <div>
                      <dt className="font-semibold uppercase tracking-[0.09em] text-slate-400">
                        Date
                      </dt>
                      <dd className="mt-0.5 tabular-nums text-slate-700">
                        {toDateTimeLocal(ev.startDate).replace("T", " ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold uppercase tracking-[0.09em] text-slate-400">
                        Format
                      </dt>
                      <dd className="mt-0.5 text-slate-700">{formatLabel(ev)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold uppercase tracking-[0.09em] text-slate-400">
                        Participation
                      </dt>
                      <dd className={`mt-0.5 flex items-center gap-1.5 font-semibold ${participation.tone}`}>
                        {participation.dot && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#007BFF]" />
                        )}
                        {participation.label}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setRequestsFor({ id: ev.id, title: ev.titleFr || "Événement" })
                      }
                      className="rounded-md bg-[#28A745]/10 px-2.5 py-1 text-xs font-semibold text-[#1e7e35] transition-colors hover:bg-[#28A745]/20 cursor-pointer"
                    >
                      Demandes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(ev)}
                      className="rounded-md bg-[#003366]/10 px-2.5 py-1 text-xs font-semibold text-[#003366] transition-colors hover:bg-[#003366]/20 cursor-pointer"
                    >
                      Modifier
                    </button>
                    <div className="ml-auto">{renderMenu(ev, "right")}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Formulaire ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs overscroll-none"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-viewport-fit flex flex-col w-full max-w-3xl max-h-[var(--modal-max-h)] overflow-hidden bg-slate-50 rounded-none sm:rounded-3xl sm:p-6 sm:p-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? "Modifier l'événement" : "Planifier un événement"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez le contenu, le format et la publication. Créer un événement ne le
                  publie pas : la publication se décide en section 6.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 shrink-0 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corps : unique zone scrollable de la modale. min-h-0 est
                indispensable pour que le contenu défile au lieu d'agrandir
                la modale au-delà de max-height. */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
                {errors.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <p className="font-bold mb-1.5">
                    {errors.length > 1
                      ? `Publication impossible : ${errors.length} points à corriger`
                      : "Enregistrement impossible"}
                  </p>
                  <ul className="space-y-1 list-disc pl-4">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit("draft")
                }}
                className="mt-4 space-y-4"
              >
                {/* 1. Contenu multilingue */}
                <Section
                  step={1}
                  title="Contenu multilingue"
                  hint="Le français est la langue de référence. Le programme est facultatif : laissez-le vide si vous ne souhaitez pas en publier."
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                        Langue :
                      </span>
                      {LANG_TABS.map((tab) => (
                        <button
                          type="button"
                          key={tab.key}
                          onClick={() => setActiveLangTab(tab.key)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeLangTab === tab.key
                              ? "bg-[#003366] text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {tab.label}
                          {isFr ? "*" : (formData[fields.title] as string) ? " ✓" : ""}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoTranslate}
                      disabled={translating || !formData.titleFr.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF]/10 text-[#007BFF] hover:bg-[#007BFF]/20 transition-all border border-[#007BFF]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {translating ? "Traduction en cours..." : "Traduire vers EN & DE"}
                    </button>
                  </div>

                  {showTranslationHelp && (
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs leading-relaxed relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Pourquoi traduire ?</span>
                        <button
                          type="button"
                          onClick={() => setShowTranslationHelp(false)}
                          className="text-amber-700 hover:text-amber-950 font-bold px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="mt-1">
                        Le site n&apos;affiche <strong>jamais</strong> une version française à la place
                        d&apos;une traduction. Un événement publié en anglais ou allemand exige donc un
                        titre <em>et</em> une description dans cette langue.
                      </p>
                    </div>
                  )}

                  {translationNotice && (
                    <div
                      className={`inline-flex w-fit max-w-full items-center justify-between gap-3 p-2.5 rounded-xl border text-xs font-semibold ${
                        translationNotice.tone === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      <span>{translationNotice.text}</span>
                      <button
                        type="button"
                        onClick={() => setTranslationNotice(null)}
                        className="font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className={LABEL}>
                          Titre {isFr && <span className="text-rose-500">*</span>}
                        </label>
                        {!isFr && formData.titleFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("title", activeLangTab)}
                            disabled={translatingField === `title_${activeLangTab}`}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer"
                          >
                            {translatingField === `title_${activeLangTab}`
                              ? "Traduction..."
                              : "Traduire ce champ"}
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData[fields.title] as string}
                        onChange={(e) => update({ [fields.title]: e.target.value } as any)}
                        placeholder={isFr ? "ex: Atelier d'initiation à l'impression 3D" : "Titre traduit"}
                        className={INPUT}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className={LABEL}>
                          Description {isFr && <span className="text-rose-500">*</span>}
                        </label>
                        {!isFr && formData.descriptionFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("description", activeLangTab)}
                            disabled={translatingField === `description_${activeLangTab}`}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer"
                          >
                            {translatingField === `description_${activeLangTab}`
                              ? "Traduction..."
                              : "Traduire ce champ"}
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={4}
                        value={formData[fields.description] as string}
                        onChange={(e) => update({ [fields.description]: e.target.value } as any)}
                        placeholder={
                          isFr
                            ? "Objectifs, prérequis, public visé…"
                            : "Description traduite"
                        }
                        className={`${INPUT} resize-y`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className={LABEL}>Programme (facultatif)</label>
                        {!isFr && formData.programmeFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleField("programme", activeLangTab)}
                            disabled={translatingField === `programme_${activeLangTab}`}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer"
                          >
                            {translatingField === `programme_${activeLangTab}`
                              ? "Traduction..."
                              : "Traduire ce champ"}
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={4}
                        value={formData[fields.programme] as string}
                        onChange={(e) => update({ [fields.programme]: e.target.value } as any)}
                        placeholder={
                          isFr
                            ? "Déroulé, horaires, intervenants — une ligne par moment"
                            : "Programme traduit"
                        }
                        className={`${INPUT} resize-y`}
                      />
                      <p className={HINT}>
                        Affiché uniquement si renseigné, dans la langue de la page visitée.
                      </p>
                    </div>
                  </div>
                </Section>

                {/* 2. Type et participation */}
                <Section
                  step={2}
                  title="Type et mode de participation"
                  hint="Un événement en ligne n'a pas d'adresse physique ; un événement hybride indique à la fois un lieu et un lien de réunion."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Catégorie</label>
                      <select
                        value={formData.category}
                        onChange={(e) => update({ category: e.target.value })}
                        className={`${INPUT} bg-white`}
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className={HINT}>
                        Une formation reste un événement, avec la catégorie « Formation certifiante ».
                      </p>
                    </div>

                    {formData.category === OTHER_CATEGORY && (
                      <div>
                        <label className={LABEL}>
                          Précision de catégorie <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          list="category-suggestions"
                          value={formData.categoryOther}
                          onChange={(e) => update({ categoryOther: e.target.value })}
                          placeholder="ex: Forum, Sensibilisation, Webinaire"
                          className={INPUT}
                        />
                        <datalist id="category-suggestions">
                          <option value="Forum" />
                          <option value="Sensibilisation" />
                          <option value="Webinaire" />
                          <option value="Conférence" />
                        </datalist>
                        <p className={HINT}>Ce texte est affiché tel quel sur le site public.</p>
                      </div>
                    )}
                  </div>

                  <fieldset className="space-y-2">
                    <legend className={LABEL}>Type de participation</legend>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="isOnline"
                          checked={!formData.isOnline}
                          onChange={() => update({ isOnline: false })}
                          className="w-4 h-4 text-[#003366] focus:ring-[#007BFF]/30 cursor-pointer"
                        />
                        En présentiel
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="isOnline"
                          checked={formData.isOnline}
                          onChange={() => update({ isOnline: true })}
                          className="w-4 h-4 text-[#003366] focus:ring-[#007BFF]/30 cursor-pointer"
                        />
                        En ligne
                      </label>
                    </div>
                    <p className={HINT}>
                      Pour un événement hybride, choisissez « En ligne » et renseignez aussi le lieu :
                      les deux informations seront affichées.
                    </p>
                  </fieldset>

                  <div>
                    <label className={LABEL}>
                      Lieu {!formData.isOnline && <span className="text-rose-500">*</span>}
                      {formData.isOnline && <span className="font-normal text-slate-400">(facultatif si hybride)</span>}
                    </label>
                    <input
                      type="text"
                      list="location-suggestions"
                      value={formData.location}
                      onChange={(e) => update({ location: e.target.value })}
                      placeholder="ex: FabLab d'Agbélouvé, Lomé"
                      className={INPUT}
                    />
                    <datalist id="location-suggestions">
                      <option value="FabLab d'Agbélouvé" />
                      <option value="Siège APTIC-R, Lomé" />
                      <option value="Lycée d'Agbélouvé" />
                      <option value="Mairie de Zio 1" />
                    </datalist>
                  </div>

                  {formData.isOnline && (
                    <div>
                      <label className={LABEL}>
                        Lien de réunion <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.meetingUrl}
                        onChange={(e) => update({ meetingUrl: e.target.value })}
                        placeholder="https://meet.google.com/…"
                        className={INPUT}
                      />
                    </div>
                  )}
                </Section>

                {/* 3. Date et durée */}
                <Section
                  step={3}
                  title="Date, durée et capacité"
                  hint="La date de début porte la date ET l'heure affichées sur le site. La date de fin est facultative."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>
                        Début <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => update({ startDate: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Fin (facultative)</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => update({ endDate: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Places (facultatif)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.maxParticipants}
                        onChange={(e) => update({ maxParticipants: e.target.value })}
                        placeholder="ex: 30"
                        className={INPUT}
                      />
                      <p className={HINT}>
                        Laissez vide pour ne pas afficher de limite : aucune mention ne sera inventée.
                      </p>
                    </div>
                  </div>
                </Section>

                {/* 4. Demandes de participation */}
                <Section
                  step={4}
                  title="Demandes de participation"
                  hint="Les personnes demandent à participer ; vous les contactez puis vous validez. Seules les validations consomment une place, et l'événement affiche « Complet » une fois la capacité atteinte."
                >
                  <Toggle
                    checked={formData.registrationOpen}
                    onChange={(value) => update({ registrationOpen: value })}
                    label="Demandes de participation ouvertes"
                    hint="Le formulaire de demande n'apparaît sur la page publique que si cette option est active."
                  />
                  {formData.registrationOpen && (
                    <p className={HINT}>
                      Le nombre de places saisi à l&apos;étape 3 sert de plafond : il n&apos;est jamais
                      décrémenté automatiquement, il sert uniquement à calculer les places restantes à
                      partir des demandes validées.
                    </p>
                  )}
                </Section>

                {/* 5. Contact et visuel */}
                <Section
                  step={5}
                  title="Contact de l'événement et visuel"
                  hint="Contact propre à cet événement, à ne pas confondre avec les coordonnées institutionnelles APTIC-R. Tout est facultatif."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Nom du contact</label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => update({ contactName: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>E-mail</label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => update({ contactEmail: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Téléphone</label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => update({ contactPhone: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-700">
                        Image / affiche (facultative)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/webp, image/jpg"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {uploadingImage ? "Téléversement..." : "Choisir un fichier"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Format recommandé : 16:9 — 1200 × 675 px. L&apos;image est affichée
                      en entier, sans recadrage : les autres formats restent acceptés.
                    </p>
                    {formData.featuredImage && (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-9 rounded-lg overflow-hidden border border-slate-200 bg-[#F7F8FA]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.featuredImage}
                            alt="Aperçu"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => update({ featuredImage: "" })}
                          className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                        >
                          Retirer l'image
                        </button>
                      </div>
                    )}
                  </div>
                </Section>

                {/* 6. Publication */}
                <Section
                  step={6}
                  title="Publication"
                  hint="La publication est décidée langue par langue. Une langue cochée sans titre ni description dans cette langue reste invisible sur le site."
                >
                  <div className="space-y-2.5">
                    {LANG_TABS.map((tab) => {
                      const key = `published${tab.key}` as "publishedFr" | "publishedEn" | "publishedDe"
                      const titleKey = langFields[tab.key].title
                      const descKey = langFields[tab.key].description
                      const ready = Boolean(
                        (formData[titleKey] as string).trim() && (formData[descKey] as string).trim()
                      )
                      return (
                        <div
                          key={tab.key}
                          className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData[key]}
                            onChange={(e) => update({ [key]: e.target.checked } as any)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#003366] focus:ring-[#007BFF]/30 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700">
                              Publié en {tab.label.toLowerCase()}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {ready
                                ? "Titre et description disponibles dans cette langue."
                                : "Titre ou description manquant : la publication sera refusée."}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ready ? "Prêt" : "Incomplet"}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <p className={HINT}>
                    Enregistrer comme brouillon conserve vos saisies sans rien publier.
                  </p>
                </Section>
              </form>
            </div>

            {/* Pied de modale : hors de la zone scrollable, donc toujours
                accessible même avec un formulaire très long. */}
            <div className="flex shrink-0 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer le brouillon"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit("publish")}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#28A745] text-white hover:bg-[#1e7e35] transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {submitting ? "Enregistrement..." : "Publier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Demandes de participation ── */}
      {requestsFor && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-white">
          <EventParticipationRequests
            eventId={requestsFor.id}
            eventTitle={requestsFor.title}
            onClose={closeRequests}
          />
        </div>
      )}
    </div>
  )
}
