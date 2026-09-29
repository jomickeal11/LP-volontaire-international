"use client"

// ─── Definition of Tabs (No emojis, clean institutional layout) ──────

// Team members CMS state

// Modal Language Sub-tab (FR / EN / DE)

// Multilingual content

// ─── Static Page Editor: Page À Propos State ──────────────────────────

// ─── Static Page Editor: Page Volontariat State ────────────────────────

// ─── Static Page Editor: Page Partenaires State & Handlers ────────────

// ─── Static Page Editor: Page Adhésion / Membres State & Handlers ────

// ─── Static Page Editor: Page Soutien State & Handlers ──────────────

// Les sections AXES et WHY possèdent des champs dynamiques absents de SUPPORT_FIELDS :

// on les expose au moteur de traduction sous forme de clés virtuelles.

// Non-AXES, non-WHY static fields

// AXES header fields

// Dynamic axes count + per-axe fields

// WHY header fields

// Dynamic WHY pillars count + per-pillar fields

// ─── Static Page Editor: Page Actualités State & Handlers ───────────

// Le sélecteur de langue est un simple changement de CONTEXTE d'édition :

// il n'appelle jamais le service de traduction et n'enregistre jamais rien.

// Instantané des contenus réellement enregistrés (détection des modifications non enregistrées)

// Proposition de traduction IA en attente de confirmation (remplacement de contenus existants)

// Changement de langue = changement de contexte d'édition uniquement.

// Aucune traduction, aucune écriture en base : on affiche simplement les contenus existants.

/**
 * Traduction IA — action volontaire de l'administrateur.
 * Génère une PROPOSITION : les champs de la langue cible sont pré-remplis,
 * restent entièrement modifiables et ne sont persistés qu'après enregistrement explicite.
 * Ne remplace jamais silencieusement des contenus existants (confirmation requise).
 */

// Pré-remplissage local : rien n'est enregistré tant que l'administrateur ne valide pas.

// ─── Static Page Editor: Page Contact State & Handlers ──────────────

// Baseline commune à chaque onglet CMS multilingue : les onglets suivent

// ainsi l'onglet actif et signalent l'état non enregistré dès le 1er clic.

// ─── Image Upload Handlers ────────────────────────────────────────────────

// ─── Team Modal Handlers ──────────────────────────────────────────────────

/* En-tête */ /* Onglets de navigation sans emoji */ /* ─── ONGLET GESTION DE L'ÉQUIPE (CMS MembreEquipe) ─── */ /* Liste des membres */ /* ─── ONGLET ÉDITEUR DE PAGE STATIQUE : À PROPOS ─── */ /* Header & Quick Action */ /* ─── Cartes de Statut & Complétude par Langue ─── */ /* ── Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) ── */ /* ─── Formulaire par Sections Accordéon ─── */ /* Section Header (Toggleable) */ /* Bouton Masquer / Déplier */ /* Section Fields */ /* Reference source block in French when editing EN or DE */ /* Field input according to type */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* Confirmation avant remplacement de contenus existants (ABOUT) */ /* ─── ONGLET ÉDITEUR DE PAGE STATIQUE : VOLONTARIAT ─── */ /* Header & Quick Action */ /* ─── Cartes de Statut & Complétude par Langue ─── */ /* ── Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) ── */ /* ─── Formulaire par Sections Accordéon ─── */ /* Section Header (Toggleable) */ /* Bouton de traduction de la section entière */ /* Bouton Masquer / Déplier */ /* Section Fields */ /* Reference source block in French when editing EN or DE */ /* Field input according to type */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* Confirmation avant remplacement de contenus existants (VOLUNTEER) */ /* ─── ONGLET PAGE PARTENAIRES (CMS Dynamique 7 sections) ─── */ /* Header & Completeness Bar */ /* Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) */ /* Complétude compacte + traduction globale IA */ /* Form with 7 Accordion Sections */ /* Section Accordion Header */ /* Bouton Masquer / Déplier */ /* Section Fields */ /* Reference source block in French when editing EN or DE */ /* Field input according to type */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* Confirmation avant remplacement de contenus existants (PARTNER) */ /* ─── ONGLET PAGE ADHÉSION / MEMBRES (CMS Dynamique 6 sections) ─── */ /* Header & Completeness Bar */ /* Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) */ /* Complétude compacte + traduction globale IA */ /* Formulaire par Sections Accordéon */ /* Section Header */ /* Section Fields */ /* Reference FR */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* Confirmation avant remplacement de contenus existants (MEMBERSHIP) */ /* ─── ONGLET PAGE SOUTIEN (CMS COMPLET 6 SECTIONS) ─── */ /* Header & Sub-Tabs Langues */ /* Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) */ /* Complétude compacte + traduction globale IA */ /* Formulaire par Sections Accordéon */ /* Section Header */ /* Section Fields */

// ── DYNAMIC AXES EDITOR ──────────────────────────────────────

/* Header fields: tag, title, subtitle */ /* Separator */

// Shift all axes down from idx+1

// Clear last

/* Title */ /* Desc */ /* Link text */ /* Add button — bottom right */

// ── DYNAMIC PILIERS EDITOR ──────────────────────────────────

/* Header fields: tag, title, desc */ /* Pilier cards */ /* Add button — bottom right */

// ── STANDARD STATIC FIELDS ──────────────────────────────────

/* Reference FR */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* Confirmation avant remplacement de contenus existants (SUPPORT) */ /* ─── ONGLET PAGE ACTUALITÉS (CMS COMPLET 2 SECTIONS) ─── */ /* ── En-tête : titre, sous-titre, sélecteur de langue, complétude, action IA globale ── */ /* Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) */ /* Complétude compacte + traduction globale IA */ /* ── Sections en accordéon ── */ /* En-tête de section compact */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* ── Confirmation avant remplacement de contenus existants ── */ /* ─── ONGLET PAGE CONTACT (CMS) ─── */ /* Header & Sub-Tabs Langues */ /* Sélecteur de langue = contexte d'édition (aucune traduction déclenchée) */ /* Complétude compacte + traduction globale IA */ /* Formulaire par Sections Accordéon */ /* Section Header */ /* Section Fields */ /* Reference FR */ /* ── Barre d'action fixe en bas de fenêtre ── */ /* Confirmation avant remplacement de contenus existants (CONTACT) */ /* ─── ONGLET SETTINGS GÉNÉRAUX & MÉDIAS ─── */ /* ─── MODAL D'AJOUT / ÉDITION D'UN MEMBRE DE L'ÉQUIPE ─── */ /* Photo Portrait OBLIGATOIRE avec sélection réelle de fichier */ /* Informations générales (Nom & Catégorie) */

import React, { useState, useEffect, useRef } from "react"
import ContactMapLocationPicker from "./ContactMapLocationPicker"

import {
  getSiteSettings,
  updateSiteSettings,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  reorderTeamMembersAction,
} from "@/lib/cms-actions"

import {
  ABOUT_SECTIONS,
  ABOUT_FIELDS,
  getAboutFieldDbKey,
  calculateAboutCompleteness,
  isAboutPagePublished,
} from "@/lib/about-cms-config"

import {
  VOLUNTEER_SECTIONS,
  VOLUNTEER_FIELDS,
  getVolunteerFieldDbKey,
  calculateVolunteerCompleteness,
  isVolunteerPagePublished,
} from "@/lib/volunteer-cms-config"

import {
  PARTNER_SECTIONS,
  PARTNER_FIELDS,
  getPartnerFieldDbKey,
  calculatePartnerCompleteness,
} from "@/lib/partner-cms-config"

import {
  MEMBERSHIP_SECTIONS,
  MEMBERSHIP_FIELDS,
  getMembershipFieldDbKey,
  calculateMembershipCompleteness,
} from "@/lib/membership-cms-config"

import {
  SUPPORT_SECTIONS,
  SUPPORT_FIELDS,
  getSupportFieldDbKey,
  calculateSupportCompleteness,
} from "@/lib/support-cms-config"

import {
  NEWS_SECTIONS,
  NEWS_FIELDS,
  getNewsFieldDbKey,
  calculateNewsCompleteness,
} from "@/lib/news-cms-config"

import {
  CONTACT_SECTIONS,
  CONTACT_FIELDS,
  getContactFieldDbKey,
  calculateContactCompleteness,
} from "@/lib/contact-cms-config"

import { translateCmsFieldsAction } from "@/lib/translator"

import {
  useCmsTabEditor,
  CmsLangSwitcher,
  CmsCompletenessBar,
  CmsSectionTranslateButton,
  CmsNoticeBanner,
  CmsSaveBar,
  CmsReplaceConfirmDialog,
  cmsTargetLang,
  diffCmsSettings,
  type CmsLang,
} from "./cms-tab-editor"

type SiteSettingUpdate = {
  key: string
  value: string
  group: string
  description?: string
}

function CmsPagePublicationControls({
  group,
  values,
  onToggle,
}: {
  group: "SUPPORT" | "MEMBERSHIP" | "PARTNER"
  values: Record<string, string>
  onToggle: (group: "SUPPORT" | "MEMBERSHIP" | "PARTNER", lang: "FR" | "EN" | "DE") => void
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-600">Publication :</span>
      {(["FR", "EN", "DE"] as const).map((lang) => {
        const key = `${group.toLowerCase()}_published_${lang.toLowerCase()}`
        const isPublished = values[key] !== "DRAFT"
        return (
          <button
            key={lang}
            type="button"
            aria-pressed={isPublished}
            onClick={() => onToggle(group, lang)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${isPublished ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
          >
            {lang} · {isPublished ? "Publié" : "Brouillon"}
          </button>
        )
      })}
    </div>
  )
}
interface TeamMemberItem {
  id: string

  firstName: string

  lastName: string

  roleFr: string

  roleEn?: string | null

  roleDe?: string | null

  category: string

  bioFr: string

  bioEn?: string | null

  bioDe?: string | null

  photoUrl?: string | null

  email?: string | null

  skills: string[]

  order: number

  active: boolean
}

function getTeamMemberName(member: TeamMemberItem) {
  return `${member.firstName} ${member.lastName}`
}

const TABS = [
  { id: "TEAM", label: "Équipe & Rôles" },
  { id: "NEWS", label: "Page Actualités" },
  { id: "SUPPORT", label: "Page Soutien" },
  { id: "MEMBERSHIP", label: "Page Devenir membre" },
  { id: "ABOUT", label: "Page À Propos" },
  { id: "VOLUNTEER", label: "Page Volontariat" },
  { id: "PARTNER", label: "Page Partenaires" },
  { id: "CONTACT", label: "Page Contact" },
  { id: "GENERAL", label: "Coordonnées & Réseaux" },
] as const
const ACTIVE_SETTINGS_TAB_KEY = "aptic-admin-settings-active-tab"

function cmsFieldWidthClass(type: string, key = "") {
  if (type === "textarea") return "w-full max-w-4xl lg:col-span-2"
  if (/(title|headline|line\d)/i.test(key)) return "w-full max-w-3xl"
  return "w-full max-w-2xl"
}

const CATEGORY_LABELS: Record<string, string> = {
  DIRECTION: "Direction & Fondateurs",

  COORDINATION: "Coordination des programmes",

  FORMATION: "Formateurs & FabLab",

  CONSEIL: "Conseil & Experts",

  VOLONTAIRE: "Volontaires & Bénévoles",
}

const SETTINGS_CONFIG: Record<string, {
  key: string

  label: string

  description: string

  type: "text" | "image" | "textarea"
}[]> = {
  SUPPORT: [
    {
      key: "support_hero_image",

      label: "Photo principale (Hero)",

      description:
        "Image de terrain affichée à droite du titre sur la page Soutien.",

      type: "image",
    },

    {
      key: "support_contact_email",

      label: "Email de contact Soutien & Mécénat",

      description: "Adresse email de destination pour les demandes de soutien.",

      type: "text",
    },
  ],

  MEMBERSHIP: [
    {
      key: "membership_hero_image",

      label: "Visuel d'engagement communautaire",

      description:
        "Image d'illustration pour la vie associative et l'adhésion.",

      type: "image",
    },

    {
      key: "membership_charte_url",

      label: "Lien vers la charte éthique / Statuts",

      description:
        "Lien PDF de consultation des statuts et du règlement intérieur.",

      type: "text",
    },
  ],

  GENERAL: [
    {
      key: "site_location_city",

      label: "Ville du siège social / Territoire",

      description:
        "Nom de la ville principale affichée sur tout le site (ex: Agbélouvé).",

      type: "text",
    },

    {
      key: "site_location_address",

      label: "Adresse complète du siège",

      description:
        "Adresse physique officielle (ex: Centre Communautaire & FabLab d'Agbélouvé).",

      type: "text",
    },

    {
      key: "site_location_region",

      label: "Région / Préfecture",

      description:
        "Région administrative (ex: Préfecture du Zio, Région Maritime).",

      type: "text",
    },

    {
      key: "site_location_country",

      label: "Pays du siège",

      description: "Pays officiel (ex: Togo).",

      type: "text",
    },

    {
      key: "site_contact_email",

      label: "Email institutionnel principal",

      description:
        "Adresse email affichée dans le pied de page et les formulaires.",

      type: "text",
    },

    {
      key: "site_contact_phone",

      label: "Téléphone standard / Siège",

      description:
        "Numéro de contact officiel du siège avec indicatif (ex: +228 91 20 19 90).",

      type: "text",
    },

    {
      key: "site_social_whatsapp",

      label: "Numéro WhatsApp officiel",

      description: "Numéro pour le bouton de contact direct WhatsApp.",

      type: "text",
    },

    {
      key: "site_social_linkedin",

      label: "Lien page LinkedIn",

      description:
        "URL complète vers la page LinkedIn officielle de l'association.",

      type: "text",
    },

{
      key: "site_social_facebook",

      label: "Lien page Facebook",

      description:
        "URL complète vers la page Facebook officielle de l'association.",

      type: "text",
    },
    {
      key: "site_social_instagram",

      label: "Lien page Instagram",

      description:
        "URL complète vers la page Instagram officielle de l'association.",

      type: "text",
    },
  ],
}

const SECTION_NUMBERS: Record<string, string> = {
  HERO: "01",

  STORY: "02",

  PILLARS: "03",

  STATS: "04",

  VALUES: "05",

  GOVERNANCE: "06",

  CTA: "07",
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>("TEAM")
  const [tabPreferenceReady, setTabPreferenceReady] = useState(false)

  useEffect(() => {
    try {
      const savedTab = localStorage.getItem(ACTIVE_SETTINGS_TAB_KEY)
      if (savedTab && TABS.some((tab) => tab.id === savedTab)) {
        setActiveTab(savedTab)
      }
    } catch {
      // The default tab remains available when browser storage is disabled.
    } finally {
      setTabPreferenceReady(true)
    }
  }, [])

  const [values, setValues] = useState<Record<string, string>>({})

  const savedSettingsRef = useRef<Record<string, string>>({})

  const saveInFlightRef = useRef(false)

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [saveConfirmed, setSaveConfirmed] = useState(false)

  const saveConfirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"

    text: string
  } | null>(null)

  const persistSettings = async (entries: SiteSettingUpdate[]) => {
    if (saveInFlightRef.current) {
      return {
        result: { success: false, error: "Une sauvegarde est déjà en cours." },
        changedEntries: [] as SiteSettingUpdate[],
      }
    }

    const changedEntries = diffCmsSettings(entries, savedSettingsRef.current)
    const requestedGroups = [...new Set(entries.map((entry) => entry.group))]
    const clientStartedAt = performance.now()
    saveInFlightRef.current = true
    setSaveConfirmed(false)

    try {
      const result = await updateSiteSettings(changedEntries, requestedGroups)
      const clientDurationMs = Number(
        (performance.now() - clientStartedAt).toFixed(2),
      )

      if (result.success) {
        changedEntries.forEach((entry) => {
          savedSettingsRef.current[entry.key] = entry.value
        })
        if (changedEntries.length > 0) {
          try {
            localStorage.setItem(
              "aptic-cms-settings-updated",
              JSON.stringify({
                groups: [...new Set(changedEntries.map((entry) => entry.group))],
                revision: Date.now(),
              }),
            )
          } catch {
            // Cross-tab refresh is best-effort; the database save already succeeded.
          }
        }
        setSaveConfirmed(true)
        if (saveConfirmationTimerRef.current) {
          clearTimeout(saveConfirmationTimerRef.current)
        }
        saveConfirmationTimerRef.current = setTimeout(
          () => setSaveConfirmed(false),
          1800,
        )
      }

      if (process.env.NODE_ENV === "development") {
        console.info("[AdminSettings:save-client]", {
          groups: requestedGroups,
          entriesSent: changedEntries.length,
          clientDurationMs,
          success: result.success,
        })
        if (result.success) {
          requestAnimationFrame(() => {
            console.info("[AdminSettings:save-ui]", {
              groups: requestedGroups,
              confirmationPaintMs: Number(
                (performance.now() - clientStartedAt).toFixed(2),
              ),
            })
          })
        }
      }

      return { result, changedEntries }
    } finally {
      saveInFlightRef.current = false
    }
  }

  const handleToggleCmsPagePublication = async (
    group: "SUPPORT" | "MEMBERSHIP" | "PARTNER",
    lang: "FR" | "EN" | "DE",
  ) => {
    const key = `${group.toLowerCase()}_published_${lang.toLowerCase()}`
    const nextValue = values[key] === "DRAFT" ? "PUBLISHED" : "DRAFT"
    setValues((current) => ({ ...current, [key]: nextValue }))
    try {
      const { result } = await persistSettings([{
        key,
        value: nextValue,
        group,
        description: `Publication de la page ${group} (${lang})`,
      }])
      if (!result.success) throw new Error(result.error || "Enregistrement impossible.")
      setStatusMessage({ type: "success", text: `Page ${group} ${lang} : ${nextValue === "PUBLISHED" ? "publiée" : "retirée"}.` })
    } catch (error: any) {
      setValues((current) => ({ ...current, [key]: values[key] ?? "PUBLISHED" }))
      setStatusMessage({ type: "error", text: error.message || "Erreur réseau." })
    }
  }
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamLoadError, setTeamLoadError] = useState("")

  const [teamModalOpen, setTeamModalOpen] = useState(false)

  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(
    null,
  )

  const [teamFormSubmitting, setTeamFormSubmitting] = useState(false)

  const [teamFormError, setTeamFormError] = useState("")

  const [uploadingImage, setUploadingImage] = useState(false)

  const [reorderingTeam, setReorderingTeam] = useState(false)

  const [teamOrderError, setTeamOrderError] = useState("")

  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null)

  const [memberLangTab, setMemberLangTab] = useState<"FR" | "EN" | "DE">("FR")

  const teamFileInputRef = useRef<HTMLInputElement | null>(null)

  const [uploadingSettingKey, setUploadingSettingKey] = useState<string | null>(
    null,
  )

  const [teamFormData, setTeamFormData] = useState({
    firstName: "",

    lastName: "",

    category: "COORDINATION",

    photoUrl: "",

    email: "",

    skills: [] as string[],

    order: 0,

    active: true,

    roleFr: "",

    bioFr: "",

    roleEn: "",

    bioEn: "",

    roleDe: "",

    bioDe: "",
  })

  const [skillInput, setSkillInput] = useState("")

  const [aboutExpandedSections, setAboutExpandedSections] =
    useState<Record<string, boolean>>({
      HERO: true,

      STORY: true,

      PILLARS: true,

      STATS: true,

      VALUES: true,

      GOVERNANCE: true,

      CTA: true,
    })

  const aboutEditor = useCmsTabEditor(values, setValues, {
    translatableKeys: (scope) =>
      ABOUT_FIELDS.filter(
        (f) => f.isTranslatable && (scope === "ALL" || f.section === scope),
      ),

    baseKey: (field) => field.key,

    trackedKeys: () => [
      "about_published_fr",

      "about_published_en",

      "about_published_de",
    ],
  })

  const { langTab: aboutLangTab, setNotice: setAboutNotice } = aboutEditor

  const aboutNotice = aboutEditor.notice

  const [volunteerExpandedSections, setVolunteerExpandedSections] =
    useState<Record<string, boolean>>({
      HERO: true,

      WHY: true,

      CHALLENGE: true,

      MISSION: true,

      BUILD: true,

      PROFILES: true,

      WEEK: true,

      TOGO: true,

      CONDITIONS: true,

      PROCESS: true,

      FAQ: true,

      CTA: true,
    })

  const volunteerEditor = useCmsTabEditor(values, setValues, {
    translatableKeys: (scope) =>
      VOLUNTEER_FIELDS.filter(
        (f) => f.isTranslatable && (scope === "ALL" || f.section === scope),
      ),

    baseKey: (field) => field.key,

    trackedKeys: () => [
      "volunteer_published_fr",

      "volunteer_published_en",

      "volunteer_published_de",
    ],
  })

  const { langTab: volunteerLangTab, setNotice: setVolunteerNotice } =
    volunteerEditor

  const volunteerNotice = volunteerEditor.notice

  const toggleVolunteerSection = (sectionId: string) => {
    setVolunteerExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const handleToggleVolunteerPublish = async (lang: "FR" | "EN" | "DE") => {
    const completeness = calculateVolunteerCompleteness(values, lang)

    const langLower = lang.toLowerCase()

    const pubKey = `volunteer_published_${langLower}`

    const currentlyPublished = isVolunteerPagePublished(values, lang)

    if (currentlyPublished) {
      const nextVal = "DRAFT"

      setValues((prev) => ({ ...prev, [pubKey]: nextVal }))

      try {
        const { changedEntries } = await persistSettings([
          {
            key: pubKey,

            value: nextVal,

            group: "VOLUNTEER",

            description: `Statut publication Volontariat (${lang})`,
          },
        ])

        volunteerEditor.markSaved(changedEntries)

        setVolunteerNotice({
          type: "info",

          text: `La version ${lang} est repassée en BROUILLON (les visiteurs voient la page de finalisation).`,
        })
      } catch (err: any) {
        setVolunteerNotice({
          type: "error",

          text: err.message || "Erreur réseau.",
        })
      }
    } else {
      if (!completeness.isComplete) {
        setVolunteerNotice({
          type: "error",

          text: `Publication impossible pour la version ${lang} : ${completeness.missingFields.length} champ(s) obligatoire(s) non renseigné(s). Complétude actuelle : ${completeness.percentage}%.`,
        })

        return
      }

      const nextVal = "PUBLISHED"

      setValues((prev) => ({ ...prev, [pubKey]: nextVal }))

      try {
        const { result: res, changedEntries } = await persistSettings([
          {
            key: pubKey,

            value: nextVal,

            group: "VOLUNTEER",

            description: `Statut publication Volontariat (${lang})`,
          },
        ])

        volunteerEditor.markSaved(changedEntries)

        setVolunteerNotice({
          type: "success",

          text: `Version ${lang} publiée.`,
        })
      } catch (err: any) {
        setVolunteerNotice({
          type: "error",

          text: err.message || "Erreur réseau.",
        })
      }
    }
  }

  const handleSaveVolunteerTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setVolunteerNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    VOLUNTEER_FIELDS.forEach((f) => {
      if (f.isTranslatable) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "VOLUNTEER",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "VOLUNTEER",

          description: f.label,
        })
      }
    })
    ;(["fr", "en", "de"] as const).forEach((l) => {
      const k = `volunteer_published_${l}`

      payload.push({
        key: k,

        value: values[k] || "DRAFT",

        group: "VOLUNTEER",

        description: `Statut publication Volontariat (${l.toUpperCase()})`,
      })
    })

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        volunteerEditor.markSaved(changedEntries)

        setVolunteerNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setVolunteerNotice({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setVolunteerNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const [partnerExpandedSections, setPartnerExpandedSections] =
    useState<Record<string, boolean>>({
      HERO: true,

      WHY: true,

      FRAMEWORKS: true,

      LOGISTICS: true,

      PROCESS: true,

      FAQ: true,

      CTA: true,
    })

  const partnerEditor = useCmsTabEditor(values, setValues, {
    translatableKeys: (scope) =>
      PARTNER_FIELDS.filter(
        (f) => f.isTranslatable && (scope === "ALL" || f.section === scope),
      ),

    baseKey: (field) => field.key,
  })

  const { langTab: partnerLangTab, setNotice: setPartnerNotice } = partnerEditor

  const partnerNotice = partnerEditor.notice

  const togglePartnerSection = (sectionId: string) => {
    setPartnerExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const handleSavePartnerTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setPartnerNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    PARTNER_FIELDS.forEach((f) => {
      if (f.isTranslatable) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "PARTNER",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "PARTNER",

          description: f.label,
        })
      }
    })

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        partnerEditor.markSaved(changedEntries)

        setPartnerNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setPartnerNotice({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setPartnerNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const [membershipExpandedSections, setMembershipExpandedSections] =
    useState<Record<string, boolean>>({
      HERO: true,

      WHY: true,

      CONTRIBUTE: true,

      WHO: true,

      CTA: true,

      FORM: true,
    })

  const toggleMembershipSection = (sectionId: string) => {
    setMembershipExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const membershipEditor = useCmsTabEditor(values, setValues, {
    translatableKeys: (scope) =>
      MEMBERSHIP_FIELDS.filter(
        (f) => f.multilingual && (scope === "ALL" || f.section === scope),
      ),

    baseKey: (field) => field.key,
  })

  const {
    langTab: membershipLangTab,

    notice: membershipNotice,

    setNotice: setMembershipNotice,
  } = membershipEditor

  const handleSaveMembershipTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setMembershipNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    MEMBERSHIP_FIELDS.forEach((f) => {
      if (f.multilingual) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "MEMBERSHIP",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "MEMBERSHIP",

          description: f.label,
        })
      }
    })

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        membershipEditor.markSaved(changedEntries)

        setMembershipNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setMembershipNotice({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setMembershipNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const [supportExpandedSections, setSupportExpandedSections] =
    useState<Record<string, boolean>>({
      HERO: true,

      AXES: true,

      WHY: true,

      TRANSPARENCY: true,

      FUTURE: true,

      CTA: true,
    })

  const toggleSupportSection = (sectionId: string) => {
    setSupportExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const getSupportDynamicKeys = (
    sectionId: "AXES" | "WHY",

    scope: "ALL" | string,
  ) => {
    const keys: string[] = []

    if (scope === "ALL" || scope === "AXES") {
      keys.push(
        "support_axes_tag",

        "support_axes_title",

        "support_axes_subtitle",
      )

      const axesCount = Math.max(
        0,

        parseInt(
          values["support_axes_count"] || "4",

          10,
        ),
      )

      for (let i = 1; i <= axesCount; i++) {
        keys.push(
          `support_axes_${i}_title`,

          `support_axes_${i}_desc`,

          `support_axes_${i}_link`,
        )
      }
    }

    if (scope === "ALL" || scope === "WHY") {
      keys.push("support_why_tag", "support_why_title", "support_why_desc")

      const whyCount = Math.max(
        0,

        parseInt(
          values["support_why_count"] || "3",

          10,
        ),
      )

      for (let i = 1; i <= whyCount; i++) {
        keys.push(`support_why_${i}_title`, `support_why_${i}_desc`)
      }
    }

    return keys
  }

  const supportEditor = useCmsTabEditor(values, setValues, {
    translatableKeys: (scope) => {
      const staticFields = SUPPORT_FIELDS.filter(
        (f) =>
          f.multilingual &&
          f.section !== "AXES" &&
          f.section !== "WHY" &&
          (scope === "ALL" || f.section === scope),
      ).map((f) => ({ key: f.key, id: `field:${f.key}` }))

      const dynamicScopes: ("AXES" | "WHY")[] =
        scope === "ALL" ? ["AXES", "WHY"] : [scope as "AXES" | "WHY"]

      const dynamicFields = dynamicScopes

        .filter((s) => s === "AXES" || s === "WHY")

        .flatMap((s) =>
          getSupportDynamicKeys(s, "ALL").map((key) => ({
            key,

            id: `${s}:${key}`,
          })),
        )

      return [...staticFields, ...dynamicFields]
    },

    baseKey: (field) => field.key,

    trackedKeys: () => ["support_axes_count", "support_why_count"],
  })

  const {
    langTab: supportLangTab,

    notice: supportNotice,

    setNotice: setSupportNotice,
  } = supportEditor

  const handleSaveSupportTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setSupportNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    SUPPORT_FIELDS.filter(
      (f) => f.section !== "AXES" && f.section !== "WHY",
    ).forEach((f) => {
      if (f.multilingual) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "SUPPORT",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "SUPPORT",

          description: f.label,
        })
      }
    })
    ;[
      "support_axes_tag",

      "support_axes_title",

      "support_axes_subtitle",
    ].forEach((k) => {
      const label = k.replace("support_axes_", "")
      ;(["fr", "en", "de"] as const).forEach((l) => {
        const dk = `${k}_${l}`

        payload.push({
          key: dk,

          value: values[dk] || "",

          group: "SUPPORT",

          description: `Axes ${label} (${l.toUpperCase()})`,
        })
      })
    })

    const axesCount = Math.max(
      0,

      parseInt(
        values["support_axes_count"] || "4",

        10,
      ),
    )

    payload.push({
      key: "support_axes_count",

      value: String(axesCount),

      group: "SUPPORT",

      description: "Nombre d'axes",
    })

    for (let i = 1; i <= axesCount; i++) {
      ;[
        `support_axes_${i}_title`,

        `support_axes_${i}_desc`,

        `support_axes_${i}_link`,
      ].forEach((k) => {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const dk = `${k}_${l}`

          payload.push({
            key: dk,

            value: values[dk] || "",

            group: "SUPPORT",
          })
        })
      })
    }
    ;["support_why_tag", "support_why_title", "support_why_desc"].forEach(
      (k) => {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const dk = `${k}_${l}`

          payload.push({
            key: dk,

            value: values[dk] || "",

            group: "SUPPORT",
          })
        })
      },
    )

    const whyCount = Math.max(
      0,

      parseInt(
        values["support_why_count"] || "3",

        10,
      ),
    )

    payload.push({
      key: "support_why_count",

      value: String(whyCount),

      group: "SUPPORT",

      description: "Nombre de piliers",
    })

    for (let i = 1; i <= whyCount; i++) {
      ;[`support_why_${i}_title`, `support_why_${i}_desc`].forEach((k) => {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const dk = `${k}_${l}`

          payload.push({
            key: dk,

            value: values[dk] || "",

            group: "SUPPORT",
          })
        })
      })
    }

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        supportEditor.markSaved(changedEntries)

        setSupportNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setSupportNotice({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setSupportNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const [newsLangTab, setNewsLangTab] = useState<"FR" | "EN" | "DE">("FR")

  const [newsTranslating, setNewsTranslating] = useState(false)

  const [newsSectionTranslating, setNewsSectionTranslating] =
    useState<string | null>(null)

  const [newsNotice, setNewsNotice] = useState<{
    type: "success" | "error" | "info"

    text: string
  } | null>(null)

  const [newsExpandedSections, setNewsExpandedSections] =
    useState<Record<string, boolean>>({
      HERO: true,

      CTA: true,
    })

  const [newsBaseline, setNewsBaseline] =
    useState<Record<string, string> | null>(null)

  const [newsPendingTranslation, setNewsPendingTranslation] = useState<{
    scope: "ALL" | string

    targetLang: "EN" | "DE"
  } | null>(null)

  const toggleNewsSection = (sectionId: string) => {
    setNewsExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const newsLangLabel = (lang: "FR" | "EN" | "DE") =>
    lang === "FR" ? "Français" : lang === "EN" ? "English" : "Deutsch"

  const newsLangAdjective = (lang: "EN" | "DE") =>
    lang === "EN" ? "anglais" : "allemand"

  const handleNewsLangSwitch = (lang: "FR" | "EN" | "DE") => {
    setNewsLangTab(lang)

    setNewsNotice(null)
  }

  const buildNewsSnapshot = (source: Record<string, string>) => {
    const snapshot: Record<string, string> = {}

    NEWS_FIELDS.forEach((f) => {
      if (f.multilingual) {
        ;(["FR", "EN", "DE"] as const).forEach((l) => {
          const key = getNewsFieldDbKey(f, l)

          snapshot[key] = source[key] || ""
        })
      } else {
        snapshot[f.key] = source[f.key] || ""
      }
    })

    return snapshot
  }

  const newsIsDirty = (() => {
    if (!newsBaseline) return false

    return Object.keys(newsBaseline).some(
      (k) => (values[k] || "") !== (newsBaseline[k] || ""),
    )
  })()

  const handleCancelNewsChanges = () => {
    if (!newsBaseline) return

    setValues((prev) => ({ ...prev, ...newsBaseline }))

    setNewsNotice({
      type: "info",

      text: "Modifications non enregistrées annulées. Les contenus enregistrés ont été restaurés.",
    })
  }

  const requestNewsTranslation = (
    scope: "ALL" | string,

    targetLang: "EN" | "DE",
  ) => {
    const targetFields = NEWS_FIELDS.filter(
      (f) => f.multilingual && (scope === "ALL" || f.section === scope),
    )

    const hasFrenchSource = targetFields.some(
      (f) =>
        (values[getNewsFieldDbKey(f, "FR")] || "")

          .trim().length > 0,
    )

    if (!hasFrenchSource) {
      setNewsNotice({
        type: "error",

        text:
          scope === "ALL"
            ? "Aucun contenu français n'est renseigné. Complétez d'abord la version française de référence."
            : "Aucun contenu français n'est renseigné pour cette section. Complétez d'abord la version française.",
      })

      return
    }

    const hasExistingTarget = targetFields.some(
      (f) =>
        (values[getNewsFieldDbKey(f, targetLang)] || "")

          .trim().length > 0,
    )

    if (hasExistingTarget) {
      setNewsPendingTranslation({ scope, targetLang })

      return
    }

    void runNewsTranslation(scope, targetLang)
  }

  const runNewsTranslation = async (
    scope: "ALL" | string,

    targetLang: "EN" | "DE",
  ) => {
    const targetFields = NEWS_FIELDS.filter(
      (f) => f.multilingual && (scope === "ALL" || f.section === scope),
    )

    const textsToTranslate: Record<string, string> = {}

    targetFields.forEach((f) => {
      const frValue = (values[getNewsFieldDbKey(f, "FR")] || "")

        .trim()

      if (frValue) textsToTranslate[f.key] = frValue
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setNewsNotice({
        type: "error",

        text: "Aucun contenu français renseigné pour cette action de traduction.",
      })

      return
    }

    if (scope === "ALL") setNewsTranslating(true)
    else setNewsSectionTranslating(scope)

    setNewsNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,

        sourceLang: "FR",

        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const proposal: Record<string, string> = {}

        Object.entries(res.translations[targetLang]).forEach(([key, text]) => {
          proposal[`${key}_${targetLang.toLowerCase()}`] = text
        })

        setValues((prev) => ({ ...prev, ...proposal }))

        const providerLabel =
          res.providerUsed === "deepl" ? "DeepL Pro" : "moteur libre"

        setNewsNotice({
          type: "info",

          text: `Proposition de traduction ${newsLangLabel(targetLang)} générée via ${providerLabel} (${Object.keys(proposal).length} champ(s)). Vérifiez et ajustez les textes, puis cliquez sur « Enregistrer » pour les valider.`,
        })
      } else {
        setNewsNotice({
          type: "error",

          text: res.error || "Erreur lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setNewsNotice({
        type: "error",

        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      if (scope === "ALL") setNewsTranslating(false)
      else setNewsSectionTranslating(null)
    }
  }

  const handleSaveNewsTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setNewsNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    NEWS_FIELDS.forEach((f) => {
      if (f.multilingual) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "NEWS",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "NEWS",

          description: f.label,
        })
      }
    })

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        setNewsBaseline((current) => ({
          ...(current || buildNewsSnapshot(savedSettingsRef.current)),
          ...Object.fromEntries(
            changedEntries.map(({ key, value }) => [key, value]),
          ),
        }))

        setNewsNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setNewsNotice({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setNewsNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const [contactExpandedSections, setContactExpandedSections] =
    useState<Record<string, boolean>>({
      CONTENT: true,

      MAP: true,

      ROUTING: true,
    })
  const [contactMapPickerOpen, setContactMapPickerOpen] = useState(false)

  const toggleContactSection = (sectionId: string) => {
    setContactExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const contactEditor = useCmsTabEditor(values, setValues, {
    translatableKeys: (scope) =>
      CONTACT_FIELDS.filter(
        (f) => f.multilingual && (scope === "ALL" || f.section === scope),
      ),

    baseKey: (field) => field.key,
  })

  const {
    langTab: contactLangTab,

    notice: contactNotice,

    setNotice: setContactNotice,
  } = contactEditor

  const handleSaveContactTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setContactNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    CONTACT_FIELDS.forEach((f) => {
      if (f.multilingual) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "CONTACT",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "CONTACT",

          description: f.label,
        })
      }
    })

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        contactEditor.markSaved(changedEntries)

        setContactNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setContactNotice({
          type: "error",

          text: res.error || "Erreur lors de l\u0027enregistrement.",
        })
      }
    } catch (err: any) {
      setContactNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleAboutSection = (sectionId: string) => {
    setAboutExpandedSections((prev) => ({
      ...prev,

      [sectionId]: !prev[sectionId],
    }))
  }

  const handleToggleAboutPublish = async (lang: "FR" | "EN" | "DE") => {
    const completeness = calculateAboutCompleteness(values, lang)

    const langLower = lang.toLowerCase()

    const pubKey = `about_published_${langLower}`

    const currentlyPublished = isAboutPagePublished(values, lang)

    if (currentlyPublished) {
      const nextVal = "DRAFT"

      setValues((prev) => ({ ...prev, [pubKey]: nextVal }))

      try {
        const { changedEntries } = await persistSettings([
          {
            key: pubKey,

            value: nextVal,

            group: "ABOUT",

            description: `Statut publication À Propos (${lang})`,
          },
        ])

        aboutEditor.markSaved(changedEntries)

        setAboutNotice({
          type: "info",

          text: `La version ${lang} est repassée en BROUILLON (les visiteurs voient la page de finalisation).`,
        })
      } catch (err: any) {
        setAboutNotice({
          type: "error",

          text: err.message || "Erreur réseau.",
        })
      }
    } else {
      if (!completeness.isComplete) {
        setAboutNotice({
          type: "error",

          text: `Publication impossible pour la version ${lang} : ${completeness.missingFields.length} champ(s) obligatoire(s) non renseigné(s). Complétude actuelle : ${completeness.percentage}%.`,
        })

        return
      }

      const nextVal = "PUBLISHED"

      setValues((prev) => ({ ...prev, [pubKey]: nextVal }))

      try {
        const { result: res, changedEntries } = await persistSettings([
          {
            key: pubKey,

            value: nextVal,

            group: "ABOUT",

            description: `Statut publication À Propos (${lang})`,
          },
        ])

        aboutEditor.markSaved(changedEntries)

        setAboutNotice({
          type: "success",

          text: `Version ${lang} publiée.`,
        })
      } catch (err: any) {
        setAboutNotice({
          type: "error",

          text: err.message || "Erreur réseau.",
        })
      }
    }
  }

  const handleSaveAboutTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSaving(true)

    setAboutNotice(null)

    const payload: {
      key: string

      value: string

      group: string

      description?: string
    }[] = []

    ABOUT_FIELDS.forEach((f) => {
      if (f.isTranslatable) {
        ;(["fr", "en", "de"] as const).forEach((l) => {
          const k = `${f.key}_${l}`

          payload.push({
            key: k,

            value: values[k] || "",

            group: "ABOUT",

            description: `${f.label} (${l.toUpperCase()})`,
          })
        })
      } else {
        payload.push({
          key: f.key,

          value: values[f.key] || "",

          group: "ABOUT",

          description: f.label,
        })
      }
    })
    ;(["fr", "en", "de"] as const).forEach((l) => {
      const k = `about_published_${l}`

      payload.push({
        key: k,

        value: values[k] || "DRAFT",

        group: "ABOUT",

        description: `Statut publication À Propos (${l.toUpperCase()})`,
      })
    })

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        aboutEditor.markSaved(changedEntries)

        setAboutNotice({
          type: "success",

          text: "Modifications enregistrées.",
        })
      } else {
        setAboutNotice({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setAboutNotice({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadSettings()

    loadTeamData()
  }, [])

  const loadSettings = async () => {
    setLoading(true)

    try {
      const res = await getSiteSettings("ALL")

      if (res.success && res.dict) {
        savedSettingsRef.current = { ...res.dict }

        setValues(res.dict)

        setNewsBaseline(buildNewsSnapshot(res.dict))

        contactEditor.markLoaded(res.dict)

        supportEditor.markLoaded(res.dict)

        membershipEditor.markLoaded(res.dict)

        aboutEditor.markLoaded(res.dict)

        volunteerEditor.markLoaded(res.dict)

        partnerEditor.markLoaded(res.dict)
      }
    } catch (err) {
      console.error("Erreur de chargement des paramètres:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamData = async () => {
    setTeamLoading(true)
    setTeamLoadError("")
    try {
      const res = await getTeamMembers({ activeOnly: false })

      if (!res.success) throw new Error(res.error || "Impossible de charger l’équipe.")
      setTeamMembers(res.members || [])
    } catch (err) {
      console.error("Erreur de chargement des membres:", err)
      setTeamLoadError("Impossible de charger l’équipe. Réessayez.")
    } finally {
      setTeamLoading(false)
    }
  }

  const handleInputChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const handleSaveTab = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)

    setStatusMessage(null)

    const currentConfigs = SETTINGS_CONFIG[activeTab] || []

    const payload = currentConfigs.map((cfg) => ({
      key: cfg.key,

      value: values[cfg.key] || "",

      group: activeTab,

      description: cfg.description,
    }))

    try {
      const { result: res, changedEntries } = await persistSettings(payload)

      if (res.success) {
        setStatusMessage({
          type: "success",

          text: changedEntries.length
            ? "Modifications enregistrées."
            : "Aucune modification à enregistrer.",
        })
      } else {
        setStatusMessage({
          type: "error",

          text: res.error || "Erreur lors de l'enregistrement.",
        })
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",

        text: err.message || "Erreur réseau.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTeamImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    setUploadingImage(true)

    setTeamFormError("")

    try {
      const data = new FormData()

      data.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",

        body: data,
      })

      const result = await response.json()

      if (result.success && result.url) {
        setTeamFormData((prev) => ({ ...prev, photoUrl: result.url }))
      } else {
        setTeamFormError(
          result.error || "Erreur lors du téléversement de la photo.",
        )
      }
    } catch (err: any) {
      setTeamFormError(
        err.message || "Erreur de connexion au serveur d'upload.",
      )
    } finally {
      setUploadingImage(false)

      if (teamFileInputRef.current) teamFileInputRef.current.value = ""
    }
  }

  const handleSettingImageUpload = async (key: string, file: File) => {
    setUploadingSettingKey(key)

    try {
      const data = new FormData()

      data.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",

        body: data,
      })

      const result = await response.json()

      if (result.success && result.url) {
        handleInputChange(key, result.url)
      } else {
        alert(result.error || "Erreur lors du téléversement de l'image.")
      }
    } catch (err: any) {
      alert(err.message || "Erreur réseau lors de l'envoi de l'image.")
    } finally {
      setUploadingSettingKey(null)
    }
  }

  const openCreateTeamModal = () => {
    setEditingMember(null)

    setMemberLangTab("FR")

    setTeamFormData({
      firstName: "",

      lastName: "",

      category: "COORDINATION",

      photoUrl: "",

      email: "",

      skills: [],

      order: teamMembers.length + 1,

      active: true,

      roleFr: "",

      bioFr: "",

      roleEn: "",

      bioEn: "",

      roleDe: "",

      bioDe: "",
    })

    setSkillInput("")

    setTeamFormError("")

    setTeamModalOpen(true)
  }

  const openEditTeamModal = (m: TeamMemberItem) => {
    setEditingMember(m)

    setMemberLangTab("FR")

    setTeamFormData({
      firstName: m.firstName,

      lastName: m.lastName,

      category: m.category,

      photoUrl: m.photoUrl || "",

      email: m.email || "",

      skills: [...m.skills],

      order: m.order,

      active: m.active,

      roleFr: m.roleFr,

      bioFr: m.bioFr,

      roleEn: m.roleEn || "",

      bioEn: m.bioEn || "",

      roleDe: m.roleDe || "",

      bioDe: m.bioDe || "",
    })

    setSkillInput("")

    setTeamFormError("")

    setTeamModalOpen(true)
  }

  const addTeamSkill = (value = skillInput) => {
    const skill = value.trim().replace(/\s+/g, " ")

    if (!skill) return

    if (skill.length > 80) {
      setTeamFormError("Une compétence ne peut pas dépasser 80 caractères.")

      return
    }

    if (teamFormData.skills.length >= 12) {
      setTeamFormError("Douze compétences maximum.")

      return
    }

    if (
      teamFormData.skills.some(
        (item) => item.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      setTeamFormError("Cette compétence est déjà ajoutée.")

      return
    }

    setTeamFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }))

    setSkillInput("")

    setTeamFormError("")
  }

  const removeTeamSkill = (index: number) => {
    setTeamFormData((prev) => ({
      ...prev,

      skills: prev.skills.filter((_, skillIndex) => skillIndex !== index),
    }))
  }

  const isFormValid =
    Boolean(teamFormData.firstName.trim()) &&
    Boolean(teamFormData.lastName.trim()) &&
    Boolean(teamFormData.roleFr.trim()) &&
    Boolean(teamFormData.bioFr.trim()) &&
    Boolean(teamFormData.category) &&
    Boolean(teamFormData.photoUrl.trim()) &&
    teamFormData.bioFr.length <= 1500 &&
    teamFormData.bioEn.length <= 1500 &&
    teamFormData.bioDe.length <= 1500

  const handleTeamFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const pendingSkill = skillInput.trim().replace(/\s+/g, " ")

    const skills =
      pendingSkill &&
      !teamFormData.skills.some(
        (item) => item.toLowerCase() === pendingSkill.toLowerCase(),
      )
        ? [...teamFormData.skills, pendingSkill]
        : teamFormData.skills

    if (pendingSkill.length > 80 || skills.length > 12) {
      setTeamFormError(
        "Les compétences sont limitées à 80 caractères et 12 entrées.",
      )

      return
    }

    if (!isFormValid) {
      setTeamFormError(
        "Veuillez renseigner le prénom, le nom, la fonction FR, la biographie FR, la catégorie et la photo.",
      )

      return
    }

    setTeamFormSubmitting(true)

    setTeamFormError("")

    const payload = {
      firstName: teamFormData.firstName,

      lastName: teamFormData.lastName,

      roleFr: teamFormData.roleFr,

      roleEn: teamFormData.roleEn,

      roleDe: teamFormData.roleDe,

      category: teamFormData.category,

      bioFr: teamFormData.bioFr,

      bioEn: teamFormData.bioEn,

      bioDe: teamFormData.bioDe,

      photoUrl: teamFormData.photoUrl,

      email: teamFormData.email,

      skills,

      order: teamFormData.order,

      active: teamFormData.active,
    }

    try {
      const res = editingMember
        ? await updateTeamMember(editingMember.id, payload)
        : await createTeamMember(payload)

      if (res.success) {
        setTeamModalOpen(false)

        await loadTeamData()
      } else {
        setTeamFormError(res.error || "Erreur lors de l'enregistrement")
      }
    } catch (err: any) {
      setTeamFormError(err.message || "Erreur réseau")
    } finally {
      setTeamFormSubmitting(false)
    }
  }

  const handleDeleteTeamMember = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement le profil de "${name}" ?`)) return

    try {
      const res = await deleteTeamMember(id)

      if (res.success) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleTeamActive = async (m: TeamMemberItem) => {
    try {
      const res = await updateTeamMember(m.id, { active: !m.active })

      if (res.success) {
        setTeamMembers((prev) =>
          prev.map((item) =>
            item.id === m.id ? { ...item, active: !item.active } : item,
          ),
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const persistTeamOrder = async (orderedMembers: TeamMemberItem[]) => {
    const previousMembers = teamMembers

    setTeamMembers(
      orderedMembers.map((member, index) => ({
        ...member,

        order: index + 1,
      })),
    )

    setReorderingTeam(true)

    setTeamOrderError("")

    try {
      const res = await reorderTeamMembersAction(
        orderedMembers

          .filter((member) => member.active)

          .map((member) => member.id),
      )

      if (!res.success) {
        setTeamMembers(previousMembers)

        setTeamOrderError(res.error || "Impossible de réorganiser l'équipe.")

        return
      }

      await loadTeamData()
    } catch (err) {
      setTeamMembers(previousMembers)

      setTeamOrderError("Erreur réseau lors de la réorganisation.")
    } finally {
      setReorderingTeam(false)

      setDraggedMemberId(null)
    }
  }

  const moveTeamMember = (memberId: string, direction: -1 | 1) => {
    const activeMembers = teamMembers.filter((member) => member.active)

    const index = activeMembers.findIndex((member) => member.id === memberId)

    const targetIndex = index + direction

    if (index < 0 || targetIndex < 0 || targetIndex >= activeMembers.length)
      return

    const reorderedActive = [...activeMembers]

    const [member] = reorderedActive.splice(index, 1)

    reorderedActive.splice(targetIndex, 0, member)

    let activeIndex = 0

    const reordered = teamMembers.map((item) =>
      item.active ? reorderedActive[activeIndex++] : item,
    )

    void persistTeamOrder(reordered)
  }

  const handleTeamMemberDrop = (targetId: string) => {
    if (!draggedMemberId || draggedMemberId === targetId) return

    const activeMembers = teamMembers.filter((member) => member.active)

    const sourceIndex = activeMembers.findIndex(
      (member) => member.id === draggedMemberId,
    )

    const targetIndex = activeMembers.findIndex(
      (member) => member.id === targetId,
    )

    if (sourceIndex < 0 || targetIndex < 0) return

    const reorderedActive = [...activeMembers]

    const [member] = reorderedActive.splice(sourceIndex, 1)

    reorderedActive.splice(targetIndex, 0, member)

    let activeIndex = 0

    const reordered = teamMembers.map((item) =>
      item.active ? reorderedActive[activeIndex++] : item,
    )

    void persistTeamOrder(reordered)
  }

  const activeTeamMembers = teamMembers.filter((member) => member.active)

  if (!tabPreferenceReady) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm text-slate-500" role="status">
        Chargement des paramètres…
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">
            Paramètres, Médias & Équipe
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez le personnel, leurs rôles institutionnels, ainsi que les
            photos et contenus clés du portail.
          </p>
        </div>
      </div>

      {}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setStatusMessage(null)
                try {
                  localStorage.setItem(ACTIVE_SETTINGS_TAB_KEY, tab.id)
                } catch {
                  // The selected tab still changes for this visit.
                }
              }}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {}
      {activeTab === "TEAM" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Gestion de l&apos;Équipe & du Personnel
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Ajoutez, modifiez ou organisez les rôles, photos, biographies
                  et compétences de l&apos;équipe APTIC-R.
                </p>
              </div>
              <button
                onClick={openCreateTeamModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003366] text-white font-medium text-sm rounded-xl hover:bg-[#002244] transition-colors shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Ajouter un membre</span>
              </button>
            </div>

            {}
            <div className="mt-4">
              {reorderingTeam && (
                <p className="mb-3 text-xs font-semibold text-[#007BFF]">
                  Enregistrement de l&apos;ordre...
                </p>
              )}
              {teamOrderError && (
                <p className="mb-3 text-xs font-semibold text-rose-600">
                  {teamOrderError}
                </p>
              )}
              <div className="divide-y divide-slate-100">
                {teamLoading ? (
                  <div className="py-12 text-center text-sm text-slate-400" role="status" aria-live="polite">
                    Chargement de l’équipe…
                  </div>
                ) : teamLoadError ? (
                  <div className="py-12 flex flex-col items-center gap-3 text-center text-sm text-rose-600" role="alert">
                    <span>{teamLoadError}</span>
                    <button
                      type="button"
                      onClick={() => void loadTeamData()}
                      className="font-semibold text-[#003366] hover:underline"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400">
                    Aucun membre enregistré pour le moment.
                  </div>
                ) : (
                  teamMembers.map((m) => {
                    const memberName = getTeamMemberName(m)

                    const activeIndex = activeTeamMembers.findIndex(
                      (member) => member.id === m.id,
                    )

                    return (
                      <div
                        key={m.id}
                        draggable={m.active && !reorderingTeam}
                        onDragStart={() => setDraggedMemberId(m.id)}
                        onDragOver={(event) =>
                          m.active && event.preventDefault()
                        }
                        onDrop={() => handleTeamMemberDrop(m.id)}
                        className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-opacity ${
                          draggedMemberId === m.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {m.active && (
                            <span
                              className="text-slate-300 cursor-grab active:cursor-grabbing"
                              title="Glisser pour réorganiser"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"
                                />
                              </svg>
                            </span>
                          )}
                          <div className="w-14 h-14 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-slate-200 relative">
                            {m.photoUrl ? (
                              <img
                                src={m.photoUrl}
                                alt={memberName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              `${m.firstName[0] || ""}${
                                m.lastName[0] || ""
                              }`.toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">
                                {memberName}
                              </h3>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {CATEGORY_LABELS[m.category] || m.category}
                              </span>
                              {!m.active && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                  Masqué
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#007BFF] font-medium mt-0.5">
                              {m.roleFr}
                            </p>
                            {m.email && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {m.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                          {m.active && (
                            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                              <button
                                type="button"
                                onClick={() => moveTeamMember(m.id, -1)}
                                disabled={activeIndex === 0 || reorderingTeam}
                                aria-label={`Monter ${memberName}`}
                                className="p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTeamMember(m.id, 1)}
                                disabled={
                                  activeIndex ===
                                    activeTeamMembers.length - 1 ||
                                  reorderingTeam
                                }
                                aria-label={`Descendre ${memberName}`}
                                className="p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleTeamActive(m)}
                            title={
                              m.active
                                ? "Désactiver / Masquer"
                                : "Activer / Afficher"
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                              m.active
                                ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {m.active ? "Masquer" : "Publier"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditTeamModal(m)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteTeamMember(m.id, memberName)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === "ABOUT" && (
        <div className="space-y-6 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#007BFF] border border-blue-200">
                    Page Statique
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#003366] mt-1.5">
                  Éditeur de Page Statique : « À Propos d&apos;APTIC-R »
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Gérez l&apos;intégralité des contenus institutionnels : Hero,
                  Chronologie, Piliers d&apos;action, Chiffres d&apos;impact,
                  Valeurs et Gouvernance. Zéro texte codé en dur, contrôle
                  multilingue par langue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/${aboutLangTab.toLowerCase()}/a-propos`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#003366] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <span>Aperçu public ({aboutLangTab})</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {aboutNotice && (
              <div className="mt-4">
                <CmsNoticeBanner
                  notice={aboutNotice}
                  onClose={() => setAboutNotice(null)}
                />
              </div>
            )}

            {}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FR", "EN", "DE"] as const).map((lang) => {
                const completeness = calculateAboutCompleteness(values, lang)

                const isPub = isAboutPagePublished(values, lang)

                const langTitle =
                  lang === "FR"
                    ? "Français (Source)"
                    : lang === "EN"
                      ? "English (Anglais)"
                      : "Deutsch (Allemand)"

                return (
                  <div
                    key={lang}
                    className={`p-5 rounded-2xl border transition-all ${
                      aboutLangTab === lang
                        ? "bg-white border-[#003366] shadow-sm ring-2 ring-[#003366]/10"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[#003366] text-[11px] font-bold font-mono tracking-wider">
                          {lang}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {langTitle}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPub
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isPub ? "● Publié" : "○ Brouillon"}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Complétude :
                        </span>
                        <span
                          className={`font-bold ${
                            completeness.isComplete
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {completeness.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completeness.isComplete
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${completeness.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {completeness.filledCount} / {completeness.totalCount}{" "}
                        champs requis
                        {!completeness.isComplete &&
                          ` (${completeness.missingFields.length} manquant${
                            completeness.missingFields.length > 1 ? "s" : ""
                          })`}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => aboutEditor.switchLang(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          aboutLangTab === lang
                            ? "bg-[#003366] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        Éditer {lang}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAboutPublish(lang)}
                        disabled={!isPub && !completeness.isComplete}
                        title={
                          !isPub && !completeness.isComplete
                            ? `Complétude à 100% requise pour publier cette langue (${completeness.missingFields.length} champ(s) restant(s))`
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isPub
                            ? "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                            : completeness.isComplete
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60"
                        }`}
                      >
                        {isPub
                          ? "Passer en Brouillon"
                          : completeness.isComplete
                            ? "Publier"
                            : "Non publiable"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CmsLangSwitcher
                  value={aboutLangTab}
                  onChange={aboutEditor.switchLang}
                />
              </div>

              {aboutLangTab !== "FR" && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-[#007BFF]/5 border border-[#007BFF]/20 text-[#003366] text-xs flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-[#007BFF] shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Vous éditez actuellement la version{" "}
                    <strong>
                      {aboutLangTab === "EN" ? "anglaise" : "allemande"}
                    </strong>
                    . Le texte de référence français est affiché sous chaque
                    champ, et rien n&apos;est enregistré avant votre clic sur «
                    Enregistrer ».
                  </span>
                </div>
              )}
            </div>
          </div>

          {}
          <form onSubmit={handleSaveAboutTab} className="space-y-6">
            {ABOUT_SECTIONS.map((section) => {
              const fields = ABOUT_FIELDS.filter(
                (f) => f.section === section.id,
              )

              const isExpanded = aboutExpandedSections[section.id] !== false

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleAboutSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {SECTION_NUMBERS[section.id] || "01"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span>{section.label}</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            ({fields.length} champs)
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Section : {section.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <span onClick={(e) => e.stopPropagation()}>
                        <CmsSectionTranslateButton
                          lang={aboutLangTab}
                          busy={aboutEditor.sectionTranslating === section.id}
                          onClick={() =>
                            aboutEditor.requestTranslation(
                              section.id,

                              cmsTargetLang(aboutLangTab),
                            )
                          }
                        />
                      </span>

                      {}
                      <button
                        type="button"
                        onClick={() => toggleAboutSection(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg cursor-pointer"
                      >
                        <span>{isExpanded ? "Masquer" : "Déplier"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                      {fields.map((field) => {
                        const dbKey = field.isTranslatable
                          ? getAboutFieldDbKey(field.key, aboutLangTab)
                          : field.key

                        const frKey = `${field.key}_fr`

                        const frValue = field.isTranslatable
                          ? values[frKey] || ""
                          : ""

                        const currentValue = values[dbKey] || ""

                        return (
                          <div
                            key={field.key}
                            className={cmsFieldWidthClass(field.type, field.key)}
                          >
                            <div className="mb-2">
                              <label className="block text-sm font-semibold text-slate-800">
                                {field.label}
                                {"required" in field && field.required && (
                                  <span className="ml-1 text-red-500" aria-label="Champ obligatoire">*</span>
                                )}
                              </label>
                            </div>

                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {}
                            {aboutLangTab !== "FR" &&
                              field.isTranslatable &&
                              frValue && (
                                <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                  <div className="flex items-center justify-between gap-2 font-bold text-[#003366] text-[11px] uppercase tracking-wider mb-1">
                                    <span>Référence source (Français) :</span>
                                  </div>
                                  <p className="italic leading-relaxed whitespace-pre-line text-slate-700">
                                    {frValue}
                                  </p>
                                </div>
                              )}

                            {}
                            {field.type === "image" ? (
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) =>
                                      handleInputChange(dbKey, e.target.value)
                                    }
                                    placeholder="https://... ou /uploads/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-xs font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
                                    <span>
                                      {uploadingSettingKey === dbKey
                                        ? "Téléversement..."
                                        : "Choisir une image"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/avif"
                                      className="hidden"
                                      disabled={uploadingSettingKey === dbKey}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0]

                                        if (f)
                                          handleSettingImageUpload(dbKey, f)
                                      }}
                                    />
                                  </label>
                                </div>

                                {currentValue && (
                                  <div className="mt-2">
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu actuel :
                                    </span>
                                    <div className="w-56 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display =
                                            "none"
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : field.type === "textarea" ? (
                              <textarea
                                rows={4}
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <CmsSaveBar
              isDirty={aboutEditor.isDirty}
              isReady={aboutEditor.isReady}
              saving={saving}
              saved={saveConfirmed}
              lang={aboutLangTab}
              onCancel={aboutEditor.cancelChanges}
              onSubmit={() => {
                void handleSaveAboutTab()
              }}
            />
          </form>

        </div>
      )}

      {}
      <CmsReplaceConfirmDialog
        pending={aboutEditor.pendingTranslation}
        onCancel={aboutEditor.cancelPendingTranslation}
        onConfirm={aboutEditor.confirmPendingTranslation}
      />

      {}
      {activeTab === "VOLUNTEER" && (
        <div className="space-y-6 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#007BFF] border border-blue-200">
                    Page Volontariat
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#003366] mt-1.5">
                  Éditeur de Page : « Volontariat International &amp; Missions »
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Gérez l&apos;intégralité des 12 sections de recrutement de
                  volontaires : Accroche Hero, Pourquoi cette mission, Défi
                  terrain, Activités concrètes, Profils recherchés, Semaine
                  type, Immersion Togo, Conditions transparentes, Processus de
                  candidature, FAQ et Appel à l&apos;action final.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/${volunteerLangTab.toLowerCase()}/volontariat`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#003366] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <span>Aperçu public ({volunteerLangTab})</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {volunteerNotice && (
              <div className="mt-4">
                <CmsNoticeBanner
                  notice={volunteerNotice}
                  onClose={() => setVolunteerNotice(null)}
                />
              </div>
            )}

            {}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FR", "EN", "DE"] as const).map((lang) => {
                const completeness = calculateVolunteerCompleteness(
                  values,

                  lang,
                )

                const isPub = isVolunteerPagePublished(values, lang)

                const langTitle =
                  lang === "FR"
                    ? "Français (Source)"
                    : lang === "EN"
                      ? "English (Anglais)"
                      : "Deutsch (Allemand)"

                return (
                  <div
                    key={lang}
                    className={`p-5 rounded-2xl border transition-all ${
                      volunteerLangTab === lang
                        ? "bg-white border-[#003366] shadow-sm ring-2 ring-[#003366]/10"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[#003366] text-[11px] font-bold font-mono tracking-wider">
                          {lang}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {langTitle}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPub
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isPub ? "● Publié" : "○ Brouillon"}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Complétude :
                        </span>
                        <span
                          className={`font-bold ${
                            completeness.isComplete
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {completeness.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completeness.isComplete
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${completeness.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {completeness.filledCount} / {completeness.totalCount}{" "}
                        champs requis
                        {!completeness.isComplete &&
                          ` (${completeness.missingFields.length} manquant${
                            completeness.missingFields.length > 1 ? "s" : ""
                          })`}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => volunteerEditor.switchLang(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          volunteerLangTab === lang
                            ? "bg-[#003366] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        Éditer {lang}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVolunteerPublish(lang)}
                        disabled={!isPub && !completeness.isComplete}
                        title={
                          !isPub && !completeness.isComplete
                            ? `Complétude à 100% requise pour publier cette langue (${completeness.missingFields.length} champ(s) restant(s))`
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isPub
                            ? "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                            : completeness.isComplete
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60"
                        }`}
                      >
                        {isPub
                          ? "Passer en Brouillon"
                          : completeness.isComplete
                            ? "Publier"
                            : "Non publiable"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CmsLangSwitcher
                  value={volunteerLangTab}
                  onChange={volunteerEditor.switchLang}
                />
              </div>

              {volunteerLangTab !== "FR" && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-[#007BFF]/5 border border-[#007BFF]/20 text-[#003366] text-xs flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-[#007BFF] shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Vous éditez actuellement la version{" "}
                    <strong>
                      {volunteerLangTab === "EN" ? "anglaise" : "allemande"}
                    </strong>
                    . Le texte de référence français est affiché sous chaque
                    champ, et rien n&apos;est enregistré avant votre clic sur «
                    Enregistrer ».
                  </span>
                </div>
              )}
            </div>
          </div>

          {}
          <form onSubmit={handleSaveVolunteerTab} className="space-y-6">
            {VOLUNTEER_SECTIONS.map((section, sIdx) => {
              const fields = VOLUNTEER_FIELDS.filter(
                (f) => f.section === section.id,
              )

              const isExpanded = volunteerExpandedSections[section.id] !== false

              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleVolunteerSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span>{section.label}</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            ({fields.length} champs)
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Section : {section.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      {}
                      <span onClick={(e) => e.stopPropagation()}>
                        <CmsSectionTranslateButton
                          lang={volunteerLangTab}
                          busy={
                            volunteerEditor.sectionTranslating === section.id
                          }
                          onClick={() =>
                            volunteerEditor.requestTranslation(
                              section.id,

                              cmsTargetLang(volunteerLangTab),
                            )
                          }
                        />
                      </span>

                      {}
                      <button
                        type="button"
                        onClick={() => toggleVolunteerSection(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg cursor-pointer"
                      >
                        <span>{isExpanded ? "Masquer" : "Déplier"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                      {fields.map((field) => {
                        const dbKey = field.isTranslatable
                          ? getVolunteerFieldDbKey(field.key, volunteerLangTab)
                          : field.key

                        const frKey = `${field.key}_fr`

                        const frValue = field.isTranslatable
                          ? values[frKey] || ""
                          : ""

                        const currentValue = values[dbKey] || ""

                        return (
                          <div
                            key={field.key}
                            className={cmsFieldWidthClass(field.type, field.key)}
                          >
                            <div className="mb-2">
                              <label className="block text-sm font-semibold text-slate-800">
                                {field.label}
                                {"required" in field && field.required && (
                                  <span className="ml-1 text-red-500" aria-label="Champ obligatoire">*</span>
                                )}
                              </label>
                            </div>

                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {}
                            {volunteerLangTab !== "FR" &&
                              field.isTranslatable &&
                              frValue && (
                                <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                  <div className="flex items-center justify-between gap-2 font-bold text-[#003366] text-[11px] uppercase tracking-wider mb-1">
                                    <span>Référence source (Français) :</span>
                                  </div>
                                  <p className="italic leading-relaxed whitespace-pre-line text-slate-700">
                                    {frValue}
                                  </p>
                                </div>
                              )}

                            {}
                            {field.type === "image" ? (
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) =>
                                      handleInputChange(dbKey, e.target.value)
                                    }
                                    placeholder="https://... ou /uploads/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-xs font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
                                    <span>
                                      {uploadingSettingKey === dbKey
                                        ? "Téléversement..."
                                        : "Choisir une image"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/avif"
                                      className="hidden"
                                      disabled={uploadingSettingKey === dbKey}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0]

                                        if (f)
                                          handleSettingImageUpload(dbKey, f)
                                      }}
                                    />
                                  </label>
                                </div>

                                {currentValue && (
                                  <div className="mt-2">
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu actuel :
                                    </span>
                                    <div className="w-56 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display =
                                            "none"
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : field.type === "textarea" ? (
                              <textarea
                                rows={4}
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <CmsSaveBar
              isDirty={volunteerEditor.isDirty}
              isReady={volunteerEditor.isReady}
              saving={saving}
              saved={saveConfirmed}
              lang={volunteerLangTab}
              onCancel={volunteerEditor.cancelChanges}
              onSubmit={() => {
                void handleSaveVolunteerTab()
              }}
            />
          </form>
        </div>
      )}

      {}
      <CmsReplaceConfirmDialog
        pending={volunteerEditor.pendingTranslation}
        onCancel={volunteerEditor.cancelPendingTranslation}
        onConfirm={volunteerEditor.confirmPendingTranslation}
      />

      {}
      {activeTab === "PARTNER" && (
        <div className="space-y-6 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Éditeur de la Page Partenaires
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Personnalisez les 7 sections institutionnelles, les garanties,
                  formats de partenariat et FAQ en français, anglais et
                  allemand.
                </p>
              </div>

              {}
            <CmsPagePublicationControls group="PARTNER" values={values} onToggle={handleToggleCmsPagePublication} />

              <CmsLangSwitcher
                value={partnerLangTab}
                onChange={partnerEditor.switchLang}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FR", "EN", "DE"] as const).map((lang) => {
                const completeness = calculatePartnerCompleteness(values, lang)
                const langTitle =
                  lang === "FR"
                    ? "Français (Source)"
                    : lang === "EN"
                      ? "English (Anglais)"
                      : "Deutsch (Allemand)"

                return (
                  <div
                    key={lang}
                    className={`p-5 rounded-2xl border transition-all ${
                      partnerLangTab === lang
                        ? "bg-white border-[#003366] shadow-sm ring-2 ring-[#003366]/10"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[#003366] text-[11px] font-bold font-mono tracking-wider">
                          {lang}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {langTitle}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          completeness.isComplete
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {completeness.isComplete ? "Complet" : "Incomplet"}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Complétude :
                        </span>
                        <span
                          className={`font-bold ${
                            completeness.isComplete
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {completeness.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completeness.isComplete
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${completeness.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {completeness.filledCount} / {completeness.totalCount} champs requis
                        {!completeness.isComplete &&
                          ` (${completeness.missingFields.length} manquant${completeness.missingFields.length > 1 ? "s" : ""})`}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => partnerEditor.switchLang(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          partnerLangTab === lang
                            ? "bg-[#003366] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        Éditer {lang}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {}
            <CmsCompletenessBar
              completeness={calculatePartnerCompleteness(
                values,

                partnerLangTab,
              )}
              lang={partnerLangTab}
              translating={partnerEditor.translating}
              sectionTranslating={partnerEditor.sectionTranslating}
              onTranslate={() =>
                partnerEditor.requestTranslation(
                  "ALL",

                  cmsTargetLang(partnerLangTab),
                )
              }
            />

            {partnerNotice && (
              <div className="mt-4">
                <CmsNoticeBanner
                  notice={partnerNotice}
                  onClose={() => setPartnerNotice(null)}
                />
              </div>
            )}
          </div>

          {}
          <form onSubmit={handleSavePartnerTab} className="space-y-4">
            {PARTNER_SECTIONS.map((section, sIdx) => {
              const fields = PARTNER_FIELDS.filter(
                (f) => f.section === section.id,
              )

              const isExpanded = partnerExpandedSections[section.id] ?? true

              const sectionNum = `0${sIdx + 1}`

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-shadow"
                >
                  {}
                  <div
                    onClick={() => togglePartnerSection(section.id)}
                    className="p-5 sm:px-8 sm:py-6 bg-slate-50/50 hover:bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {sectionNum}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800">
                          {section.label}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {fields.length} champ(s) configurables
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <span onClick={(e) => e.stopPropagation()}>
                        <CmsSectionTranslateButton
                          lang={partnerLangTab}
                          busy={partnerEditor.sectionTranslating === section.id}
                          onClick={() =>
                            partnerEditor.requestTranslation(
                              section.id,

                              cmsTargetLang(partnerLangTab),
                            )
                          }
                        />
                      </span>

                      {}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          togglePartnerSection(section.id)
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg cursor-pointer"
                      >
                        <span>{isExpanded ? "Masquer" : "Déplier"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                      {fields.map((field) => {
                        const dbKey = field.isTranslatable
                          ? getPartnerFieldDbKey(field.key, partnerLangTab)
                          : field.key

                        const frKey = `${field.key}_fr`

                        const frValue = field.isTranslatable
                          ? values[frKey] || ""
                          : ""

                        const currentValue = values[dbKey] || ""

                        return (
                          <div
                            key={field.key}
                            className={cmsFieldWidthClass(field.type, field.key)}
                          >
                            <div className="mb-2">
                              <label className="block text-sm font-semibold text-slate-800">
                                {field.label}
                                {"required" in field && field.required && (
                                  <span className="ml-1 text-red-500" aria-label="Champ obligatoire">*</span>
                                )}
                              </label>
                            </div>

                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {}
                            {partnerLangTab !== "FR" &&
                              field.isTranslatable &&
                              frValue && (
                                <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                  <div className="flex items-center justify-between gap-2 font-bold text-[#003366] text-[11px] uppercase tracking-wider mb-1">
                                    <span>Référence source (Français) :</span>
                                  </div>
                                  <p className="italic leading-relaxed whitespace-pre-line text-slate-700">
                                    {frValue}
                                  </p>
                                </div>
                              )}

                            {}
                            {field.type === "image" ? (
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) =>
                                      handleInputChange(dbKey, e.target.value)
                                    }
                                    placeholder="https://... ou /uploads/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-xs font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
                                    <span>
                                      {uploadingSettingKey === dbKey
                                        ? "Téléversement..."
                                        : "Choisir une image"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/avif"
                                      className="hidden"
                                      disabled={uploadingSettingKey === dbKey}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0]

                                        if (f)
                                          handleSettingImageUpload(dbKey, f)
                                      }}
                                    />
                                  </label>
                                </div>

                                {currentValue && (
                                  <div className="mt-2">
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu actuel :
                                    </span>
                                    <div className="w-56 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display =
                                            "none"
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : field.type === "textarea" ? (
                              <textarea
                                rows={4}
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <CmsSaveBar
              isDirty={partnerEditor.isDirty}
              isReady={partnerEditor.isReady}
              saving={saving}
              saved={saveConfirmed}
              lang={partnerLangTab}
              onCancel={partnerEditor.cancelChanges}
              onSubmit={() => {
                void handleSavePartnerTab()
              }}
            />
          </form>
        </div>
      )}

      {}
      <CmsReplaceConfirmDialog
        pending={partnerEditor.pendingTranslation}
        onCancel={partnerEditor.cancelPendingTranslation}
        onConfirm={partnerEditor.confirmPendingTranslation}
      />

      {}
      {activeTab === "MEMBERSHIP" && (
        <div className="space-y-6 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Éditeur de la Page Adhésion & Membres
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Personnalisez les 6 sections, les 4 piliers d'impact, les
                  modes d'engagement et le formulaire d'adhésion en français,
                  anglais et allemand.
                </p>
              </div>

              {}
              <CmsPagePublicationControls group="MEMBERSHIP" values={values} onToggle={handleToggleCmsPagePublication} />

              <CmsLangSwitcher
                value={membershipLangTab}
                onChange={membershipEditor.switchLang}
              />
            </div>

            {}
            <CmsCompletenessBar
              completeness={calculateMembershipCompleteness(
                values,

                membershipLangTab,
              )}
              lang={membershipLangTab}
              translating={membershipEditor.translating}
              sectionTranslating={membershipEditor.sectionTranslating}
              onTranslate={() =>
                membershipEditor.requestTranslation(
                  "ALL",

                  cmsTargetLang(membershipLangTab),
                )
              }
            />

            {membershipNotice && (
              <div className="mt-4">
                <CmsNoticeBanner
                  notice={membershipNotice}
                  onClose={() => setMembershipNotice(null)}
                />
              </div>
            )}
          </div>

          {}
          <form onSubmit={handleSaveMembershipTab} className="space-y-6">
            {MEMBERSHIP_SECTIONS.map((section, sIdx) => {
              const fields = MEMBERSHIP_FIELDS.filter(
                (f) => f.section === section.id,
              )

              const isExpanded =
                membershipExpandedSections[section.id] !== false

              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleMembershipSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {section.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <CmsSectionTranslateButton
                        lang={membershipLangTab}
                        busy={
                          membershipEditor.sectionTranslating === section.id
                        }
                        onClick={() =>
                          membershipEditor.requestTranslation(
                            section.id,

                            cmsTargetLang(membershipLangTab),
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() => toggleMembershipSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-white">
                      {(() => {
                        const renderField = (field: any) => {
                          const dbKey = getMembershipFieldDbKey(field, membershipLangTab)
                          const currentValue = values[dbKey] || ""
                          const isRequired = "required" in field && Boolean(field.required)
                          const frReferenceKey = `${field.key}_fr`
                          const frReferenceValue = values[frReferenceKey]

                          return (
                            <div key={field.key} className="space-y-1.5">
                              <label className="block text-sm font-semibold text-slate-800">
                                {field.label}
                                {isRequired && <span className="ml-1 text-red-500">*</span>}
                              </label>
                              {field.multilingual && membershipLangTab !== "FR" && frReferenceValue && (
                                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                                  <span className="font-bold text-slate-700 block mb-0.5">Réf. FR :</span>
                                  <p className="italic">{frReferenceValue}</p>
                                </div>
                              )}
                              {field.type === "textarea" ? (
                                <textarea
                                  rows={3}
                                  value={currentValue}
                                  onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                  className="w-full max-w-3xl px-3 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={currentValue}
                                  onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                  className="w-full max-w-xl px-3 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                />
                              )}
                            </div>
                          )
                        }

                        if (section.id === "WHY") {
                          const whyCount = Math.max(0, parseInt(values["membership_why_count"] || "6", 10))
                          const headerFields = fields.filter(f => ["membership_why_tag", "membership_why_title", "membership_why_subtitle"].includes(f.key))
                          
                          return (
                            <div className="space-y-5">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                                {headerFields.map(f => (
                                  <div key={f.key} className={f.key === "membership_why_subtitle" ? "lg:col-span-2" : ""}>
                                    {renderField(f)}
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-3">
                                  Blocs ({whyCount})
                                </span>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  {Array.from({ length: whyCount }, (_, i) => i + 1).map((idx) => {
                                    const tKey = `membership_why_card${idx}_title`
                                    const dKey = `membership_why_card${idx}_desc`
                                    const lang = membershipLangTab.toLowerCase()
                                    const tDbKey = `${tKey}_${lang}`
                                    const dDbKey = `${dKey}_${lang}`

                                    return (
                                      <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-black uppercase tracking-widest text-[#007BFF]">
                                            Bloc {String(idx).padStart(2, "0")}
                                          </span>
                                          {whyCount > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated: Record<string, string> = { ...values }
                                                for (let j = idx; j < whyCount; j++) {
                                                  for (const sfx of ["fr", "en", "de"]) {
                                                    updated[`membership_why_card${j}_title_${sfx}`] = values[`membership_why_card${j + 1}_title_${sfx}`] || ""
                                                    updated[`membership_why_card${j}_desc_${sfx}`] = values[`membership_why_card${j + 1}_desc_${sfx}`] || ""
                                                  }
                                                }
                                                for (const sfx of ["fr", "en", "de"]) {
                                                  updated[`membership_why_card${whyCount}_title_${sfx}`] = ""
                                                  updated[`membership_why_card${whyCount}_desc_${sfx}`] = ""
                                                }
                                                updated["membership_why_count"] = String(whyCount - 1)
                                                setValues(updated)
                                              }}
                                              className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors"
                                            >
                                              ✕ Supprimer
                                            </button>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600">Titre</label>
                                          {membershipLangTab !== "FR" && values[`${tKey}_fr`] && (
                                            <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${tKey}_fr`]}</p>
                                          )}
                                          <input
                                            type="text"
                                            value={values[tDbKey] || ""}
                                            onChange={(e) => handleInputChange(tDbKey, e.target.value)}
                                            placeholder={`Titre du bloc ${idx}...`}
                                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600">Description</label>
                                          {membershipLangTab !== "FR" && values[`${dKey}_fr`] && (
                                            <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${dKey}_fr`]}</p>
                                          )}
                                          <textarea
                                            rows={2}
                                            value={values[dDbKey] || ""}
                                            onChange={(e) => handleInputChange(dDbKey, e.target.value)}
                                            placeholder={`Description du bloc ${idx}...`}
                                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange("membership_why_count", String(whyCount + 1))}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-500 text-[11px] font-bold hover:border-[#003366] hover:text-[#003366] transition-colors cursor-pointer"
                                  >
                                    <span>+</span> Ajouter un bloc
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        }

                        if (section.id === "CONTRIBUTE") {
                          const headerFields = fields.filter(f => ["membership_contribute_tag", "membership_contribute_title", "membership_contribute_subtitle"].includes(f.key))
                          return (
                            <div className="space-y-5">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                                {headerFields.map(f => (
                                  <div key={f.key} className={f.key === "membership_contribute_subtitle" ? "lg:col-span-2" : ""}>
                                    {renderField(f)}
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-3">
                                  Modes d'engagement (6)
                                </span>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  {Array.from({ length: 6 }, (_, i) => i + 1).map((idx) => {
                                    const tKey = `membership_contribute_item${idx}_title`
                                    const dKey = `membership_contribute_item${idx}_desc`
                                    const lang = membershipLangTab.toLowerCase()
                                    const tDbKey = `${tKey}_${lang}`
                                    const dDbKey = `${dKey}_${lang}`

                                    return (
                                      <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-black uppercase tracking-widest text-[#28A745]">
                                            Mode {String(idx).padStart(2, "0")}
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600">Titre</label>
                                          {membershipLangTab !== "FR" && values[`${tKey}_fr`] && (
                                            <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${tKey}_fr`]}</p>
                                          )}
                                          <input
                                            type="text"
                                            value={values[tDbKey] || ""}
                                            onChange={(e) => handleInputChange(tDbKey, e.target.value)}
                                            placeholder={`Titre du mode ${idx}...`}
                                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600">Description</label>
                                          {membershipLangTab !== "FR" && values[`${dKey}_fr`] && (
                                            <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${dKey}_fr`]}</p>
                                          )}
                                          <textarea
                                            rows={2}
                                            value={values[dDbKey] || ""}
                                            onChange={(e) => handleInputChange(dDbKey, e.target.value)}
                                            placeholder={`Description du mode ${idx}...`}
                                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )
                        }

                        if (section.id === "WHO") {
                          const headerFields = fields.filter(f => ["membership_who_tag", "membership_who_title", "membership_who_text", "membership_who_subtext"].includes(f.key))
                          const messageFields = fields.filter(f => ["membership_who_message_title", "membership_who_message_desc"].includes(f.key))
                          const profilesCount = Math.max(0, parseInt(values["membership_who_profiles_count"] || "0", 10))

                          return (
                            <div className="space-y-5">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                                {headerFields.map(f => (
                                  <div key={f.key} className={(f.type === "textarea" || f.key === "membership_who_text" || f.key === "membership_who_subtext") ? "lg:col-span-2" : ""}>
                                    {renderField(f)}
                                  </div>
                                ))}
                              </div>

                              <div className="border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-3">
                                  Message Important (Inclusion)
                                </span>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                  {messageFields.map(f => (
                                    <div key={f.key} className={f.type === "textarea" ? "lg:col-span-2" : ""}>
                                      {renderField(f)}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-3">
                                  Profils Cibles ({profilesCount})
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: profilesCount }, (_, i) => i + 1).map((idx) => {
                                    const pKey = `membership_who_profile_${idx}`
                                    const lang = membershipLangTab.toLowerCase()
                                    const pDbKey = `${pKey}_${lang}`

                                    return (
                                      <div key={idx} className="flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-1 py-1">
                                        <input
                                          type="text"
                                          value={values[pDbKey] || ""}
                                          onChange={(e) => handleInputChange(pDbKey, e.target.value)}
                                          placeholder={`Profil ${idx}`}
                                          className="bg-transparent outline-none text-sm text-slate-800 w-32 focus:w-40 transition-all"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated: Record<string, string> = { ...values }
                                            for (let j = idx; j < profilesCount; j++) {
                                              for (const sfx of ["fr", "en", "de"]) {
                                                updated[`membership_who_profile_${j}_${sfx}`] = values[`membership_who_profile_${j + 1}_${sfx}`] || ""
                                              }
                                            }
                                            for (const sfx of ["fr", "en", "de"]) {
                                              updated[`membership_who_profile_${profilesCount}_${sfx}`] = ""
                                            }
                                            updated["membership_who_profiles_count"] = String(profilesCount - 1)
                                            setValues(updated)
                                          }}
                                          className="text-slate-400 hover:text-rose-500 p-1"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    )
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange("membership_who_profiles_count", String(profilesCount + 1))}
                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 border-dashed text-slate-500 text-[11px] font-bold hover:border-[#003366] hover:text-[#003366] transition-colors cursor-pointer"
                                  >
                                    + Ajouter un profil
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        }

                        // HERO, CTA, FORM
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                            {fields.map(f => (
                              <div key={f.key} className={f.type === "textarea" ? "lg:col-span-2" : ""}>
                                {renderField(f)}
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <CmsSaveBar
              isDirty={membershipEditor.isDirty}
              isReady={membershipEditor.isReady}
              saving={saving}
              saved={saveConfirmed}
              lang={membershipLangTab}
              onCancel={membershipEditor.cancelChanges}
              onSubmit={() => {
                void handleSaveMembershipTab()
              }}
            />
          </form>
        </div>
      )}

      {}
      <CmsReplaceConfirmDialog
        pending={membershipEditor.pendingTranslation}
        onCancel={membershipEditor.cancelPendingTranslation}
        onConfirm={membershipEditor.confirmPendingTranslation}
      />

      {}
      {activeTab === "SUPPORT" && (
        <div className="space-y-6 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Gestionnaire de contenus : Page Soutien & Mécénat
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Configurez l&apos;ensemble des 6 sections, titres, axes
                  d&apos;impact et boutons d&apos;action en 3 langues.
                </p>
              </div>

              {}
              <CmsPagePublicationControls group="SUPPORT" values={values} onToggle={handleToggleCmsPagePublication} />

              <CmsLangSwitcher
                value={supportLangTab}
                onChange={supportEditor.switchLang}
              />
            </div>

            {}
            <CmsCompletenessBar
              completeness={calculateSupportCompleteness(
                values,

                supportLangTab,
              )}
              lang={supportLangTab}
              translating={supportEditor.translating}
              sectionTranslating={supportEditor.sectionTranslating}
              onTranslate={() =>
                supportEditor.requestTranslation(
                  "ALL",

                  cmsTargetLang(supportLangTab),
                )
              }
            />

            {supportNotice && (
              <div className="mt-4">
                <CmsNoticeBanner
                  notice={supportNotice}
                  onClose={() => setSupportNotice(null)}
                />
              </div>
            )}
          </div>

          {}
          <form onSubmit={handleSaveSupportTab} className="space-y-6">
            {SUPPORT_SECTIONS.map((section, sIdx) => {
              const fields = SUPPORT_FIELDS.filter(
                (f) => f.section === section.id,
              )

              const isExpanded = supportExpandedSections[section.id] !== false

              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleSupportSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-sm text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {section.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <CmsSectionTranslateButton
                        lang={supportLangTab}
                        busy={supportEditor.sectionTranslating === section.id}
                        onClick={() =>
                          supportEditor.requestTranslation(
                            section.id,

                            cmsTargetLang(supportLangTab),
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() => toggleSupportSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-white">
                      {/* ── SECTION AXES : header 2 cols + cartes grille 2×2 ── */}
                      {section.id === "AXES"
                        ? (() => {
                            const axesCount = Math.max(
                              0,
                              parseInt(values["support_axes_count"] || "4", 10),
                            )
                            const headerFields = SUPPORT_FIELDS.filter(
                              (f) =>
                                f.section === "AXES" &&
                                ["support_axes_tag", "support_axes_title", "support_axes_subtitle"].includes(f.key),
                            )

                            return (
                              <div className="space-y-5">
                                {/* Header fields in 2 columns: tag+title left, subtitle full-width */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                                  {headerFields.map((field) => {
                                    const dbKey = getSupportFieldDbKey(field, supportLangTab)
                                    const currentValue = values[dbKey] || ""
                                    const frRef = values[`${field.key}_fr`]
                                    const isSubtitle = field.key === "support_axes_subtitle"

                                    return (
                                      <div
                                        key={field.key}
                                        className={`space-y-1.5 ${isSubtitle ? "lg:col-span-2" : ""}`}
                                      >
                                        <label className="block text-sm font-semibold text-slate-800">
                                          {field.label}
                                        </label>
                                        {supportLangTab !== "FR" && frRef && (
                                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                                            <span className="font-bold text-slate-700 block mb-0.5">Réf. FR :</span>
                                            <p className="italic">{frRef}</p>
                                          </div>
                                        )}
                                        {field.type === "textarea" ? (
                                          <textarea
                                            rows={2}
                                            value={currentValue}
                                            onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                            className="w-full max-w-3xl px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                          />
                                        ) : (
                                          <input
                                            type="text"
                                            value={currentValue}
                                            onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                            className={`w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white ${field.key === "support_axes_tag" ? "max-w-xs" : "max-w-xl"}`}
                                          />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Cartes d'axes en grille 2×2 */}
                                <div className="border-t border-slate-100 pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                      Cartes d&apos;axes ({axesCount})
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {Array.from({ length: axesCount }, (_, i) => i + 1).map((idx) => {
                                      const tKey = `support_axes_${idx}_title`
                                      const dKey = `support_axes_${idx}_desc`
                                      const lKey = `support_axes_${idx}_link`
                                      const lang = supportLangTab.toLowerCase()
                                      const tDbKey = `${tKey}_${lang}`
                                      const dDbKey = `${dKey}_${lang}`
                                      const lDbKey = `${lKey}_${lang}`

                                      return (
                                        <div
                                          key={idx}
                                          className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-[#28A745]">
                                              Axe {String(idx).padStart(2, "0")}
                                            </span>
                                            {axesCount > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated: Record<string, string> = { ...values }
                                                  for (let j = idx; j < axesCount; j++) {
                                                    for (const sfx of ["fr", "en", "de"]) {
                                                      updated[`support_axes_${j}_title_${sfx}`] = values[`support_axes_${j + 1}_title_${sfx}`] || ""
                                                      updated[`support_axes_${j}_desc_${sfx}`] = values[`support_axes_${j + 1}_desc_${sfx}`] || ""
                                                      updated[`support_axes_${j}_link_${sfx}`] = values[`support_axes_${j + 1}_link_${sfx}`] || ""
                                                    }
                                                  }
                                                  for (const sfx of ["fr", "en", "de"]) {
                                                    updated[`support_axes_${axesCount}_title_${sfx}`] = ""
                                                    updated[`support_axes_${axesCount}_desc_${sfx}`] = ""
                                                    updated[`support_axes_${axesCount}_link_${sfx}`] = ""
                                                  }
                                                  updated["support_axes_count"] = String(axesCount - 1)
                                                  setValues(updated)
                                                }}
                                                className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors"
                                              >
                                                ✕ Supprimer
                                              </button>
                                            )}
                                          </div>

                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-600">
                                              Titre
                                            </label>
                                            {supportLangTab !== "FR" && values[`${tKey}_fr`] && (
                                              <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${tKey}_fr`]}</p>
                                            )}
                                            <input
                                              type="text"
                                              value={values[tDbKey] || ""}
                                              onChange={(e) => handleInputChange(tDbKey, e.target.value)}
                                              placeholder={`Titre de l'axe ${idx}...`}
                                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                            />
                                          </div>

                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-600">
                                              Description
                                            </label>
                                            {supportLangTab !== "FR" && values[`${dKey}_fr`] && (
                                              <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${dKey}_fr`]}</p>
                                            )}
                                            <textarea
                                              rows={2}
                                              value={values[dDbKey] || ""}
                                              onChange={(e) => handleInputChange(dDbKey, e.target.value)}
                                              placeholder={`Description de l'axe ${idx}...`}
                                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                            />
                                          </div>

                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-600">
                                              Texte du lien
                                            </label>
                                            <input
                                              type="text"
                                              value={values[lDbKey] || ""}
                                              onChange={(e) => handleInputChange(lDbKey, e.target.value)}
                                              placeholder="Ex: Échanger avec l'équipe"
                                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                            />
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>

                                  <div className="mt-3 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleInputChange("support_axes_count", String(axesCount + 1))
                                      }}
                                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-500 text-[11px] font-bold hover:border-[#003366] hover:text-[#003366] transition-colors cursor-pointer"
                                    >
                                      <span>+</span> Ajouter un axe
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })()

                        /* ── SECTION WHY : header 2 cols + piliers grille 2 cols ── */
                        : section.id === "WHY"
                          ? (() => {
                              const whyCount = Math.max(
                                0,
                                parseInt(values["support_why_count"] || "3", 10),
                              )
                              const whyHeaderFields = SUPPORT_FIELDS.filter(
                                (f) =>
                                  f.section === "WHY" &&
                                  ["support_why_tag", "support_why_title", "support_why_desc"].includes(f.key),
                              )

                              return (
                                <div className="space-y-5">
                                  {/* Header: tag + title side-by-side, desc full-width */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                                    {whyHeaderFields.map((field) => {
                                      const dbKey = getSupportFieldDbKey(field, supportLangTab)
                                      const currentValue = values[dbKey] || ""
                                      const frRef = values[`${field.key}_fr`]
                                      const isDesc = field.key === "support_why_desc"

                                      return (
                                        <div
                                          key={field.key}
                                          className={`space-y-1.5 ${isDesc ? "lg:col-span-2" : ""}`}
                                        >
                                          <label className="block text-sm font-semibold text-slate-800">
                                            {field.label}
                                          </label>
                                          {supportLangTab !== "FR" && frRef && (
                                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                                              <span className="font-bold text-slate-700 block mb-0.5">Réf. FR :</span>
                                              <p className="italic">{frRef}</p>
                                            </div>
                                          )}
                                          {field.type === "textarea" ? (
                                            <textarea
                                              rows={3}
                                              value={currentValue}
                                              onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                              className="w-full max-w-3xl px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                            />
                                          ) : (
                                            <input
                                              type="text"
                                              value={currentValue}
                                              onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                              className={`w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white ${field.key === "support_why_tag" ? "max-w-xs" : "max-w-xl"}`}
                                            />
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>

                                  {/* Pilier cards in 2-col grid */}
                                  <div className="border-t border-slate-100 pt-4">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-3">
                                      Piliers ({whyCount})
                                    </span>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                      {Array.from({ length: whyCount }, (_, i) => i + 1).map((idx) => {
                                        const tKey = `support_why_${idx}_title`
                                        const dKey = `support_why_${idx}_desc`
                                        const lang = supportLangTab.toLowerCase()
                                        const tDbKey = `${tKey}_${lang}`
                                        const dDbKey = `${dKey}_${lang}`

                                        return (
                                          <div
                                            key={idx}
                                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="text-[11px] font-black uppercase tracking-widest text-[#007BFF]">
                                                Pilier {String(idx).padStart(2, "0")}
                                              </span>
                                              {whyCount > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const updated: Record<string, string> = { ...values }
                                                    for (let j = idx; j < whyCount; j++) {
                                                      for (const sfx of ["fr", "en", "de"]) {
                                                        updated[`support_why_${j}_title_${sfx}`] = values[`support_why_${j + 1}_title_${sfx}`] || ""
                                                        updated[`support_why_${j}_desc_${sfx}`] = values[`support_why_${j + 1}_desc_${sfx}`] || ""
                                                      }
                                                    }
                                                    for (const sfx of ["fr", "en", "de"]) {
                                                      updated[`support_why_${whyCount}_title_${sfx}`] = ""
                                                      updated[`support_why_${whyCount}_desc_${sfx}`] = ""
                                                    }
                                                    updated["support_why_count"] = String(whyCount - 1)
                                                    setValues(updated)
                                                  }}
                                                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors"
                                                >
                                                  ✕ Supprimer
                                                </button>
                                              )}
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-slate-600">Titre</label>
                                              {supportLangTab !== "FR" && values[`${tKey}_fr`] && (
                                                <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${tKey}_fr`]}</p>
                                              )}
                                              <input
                                                type="text"
                                                value={values[tDbKey] || ""}
                                                onChange={(e) => handleInputChange(tDbKey, e.target.value)}
                                                placeholder={`Titre du pilier ${idx}...`}
                                                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-slate-600">Description</label>
                                              {supportLangTab !== "FR" && values[`${dKey}_fr`] && (
                                                <p className="text-[10px] italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{values[`${dKey}_fr`]}</p>
                                              )}
                                              <textarea
                                                rows={2}
                                                value={values[dDbKey] || ""}
                                                onChange={(e) => handleInputChange(dDbKey, e.target.value)}
                                                placeholder={`Description du pilier ${idx}...`}
                                                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                              />
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>

                                    <div className="mt-3 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleInputChange("support_why_count", String(whyCount + 1))}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-500 text-[11px] font-bold hover:border-[#007BFF] hover:text-[#007BFF] transition-colors cursor-pointer"
                                      >
                                        <span>+</span> Ajouter un pilier
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })()

                          /* ── SECTIONS STATIQUES (TRANSPARENCY, FUTURE, CTA) : 2 colonnes ── */
                          : (() => {
                              const sectionFields = fields
                              return (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                                  {sectionFields.map((field) => {
                                    const dbKey = getSupportFieldDbKey(field, supportLangTab)
                                    const currentValue = values[dbKey] || ""
                                    const frReferenceKey = `${field.key}_fr`
                                    const frReferenceValue = values[frReferenceKey]
                                    const isRequired = "required" in field && Boolean(field.required)

                                    // Textarea spans full width, everything else stays in its column
                                    const spanFull = field.type === "textarea"

                                    return (
                                      <div
                                        key={field.key}
                                        className={`space-y-1.5 ${spanFull ? "lg:col-span-2" : ""}`}
                                      >
                                        <label className="block text-sm font-semibold text-slate-800">
                                          {field.label}
                                          {isRequired && (
                                            <span className="ml-1 text-red-500" aria-label="Champ obligatoire">*</span>
                                          )}
                                        </label>

                                        {field.multilingual &&
                                          supportLangTab !== "FR" &&
                                          frReferenceValue && (
                                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                                              <span className="font-bold text-slate-700 block mb-0.5">Réf. FR :</span>
                                              <p className="italic">{frReferenceValue}</p>
                                            </div>
                                          )}

                                        {field.type === "image" ? (
                                          <div className="space-y-3">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                              <input
                                                type="text"
                                                value={currentValue}
                                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                                placeholder="https://... ou /uploads/..."
                                                className="flex-1 max-w-lg px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm font-mono text-slate-800"
                                              />
                                              <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
                                                <span>
                                                  {uploadingSettingKey === dbKey ? "Téléversement..." : "Choisir une image"}
                                                </span>
                                                <input
                                                  type="file"
                                                  accept="image/jpeg,image/png,image/webp,image/avif"
                                                  className="hidden"
                                                  disabled={uploadingSettingKey === dbKey}
                                                  onChange={(e) => {
                                                    const f = e.target.files?.[0]
                                                    if (f) handleSettingImageUpload(dbKey, f)
                                                  }}
                                                />
                                              </label>
                                            </div>

                                            {currentValue && (
                                              <div className="mt-2">
                                                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Aperçu :</span>
                                                <div className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                                  <img
                                                    src={currentValue}
                                                    alt="Aperçu"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { ;(e.target as HTMLElement).style.display = "none" }}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : field.type === "textarea" ? (
                                          <textarea
                                            rows={3}
                                            value={currentValue}
                                            onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                            className="w-full max-w-3xl px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                                          />
                                        ) : (
                                          <input
                                            type="text"
                                            value={currentValue}
                                            onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                            className={`w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white ${/(tag|badge|btn)/i.test(field.key) ? "max-w-xs" : "max-w-xl"}`}
                                          />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <CmsSaveBar
              isDirty={supportEditor.isDirty}
              isReady={supportEditor.isReady}
              saving={saving}
              saved={saveConfirmed}
              lang={supportLangTab}
              onCancel={supportEditor.cancelChanges}
              onSubmit={() => {
                void handleSaveSupportTab()
              }}
            />
          </form>
        </div>
      )}

      {}
      <CmsReplaceConfirmDialog
        pending={supportEditor.pendingTranslation}
        onCancel={supportEditor.cancelPendingTranslation}
        onConfirm={supportEditor.confirmPendingTranslation}
      />

      {}
      {activeTab === "NEWS" && (
        <div className="space-y-4 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Page Actualités
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gérez le contenu éditorial de la page Actualités dans les
                  trois langues.
                </p>
              </div>

              {}
              <div className="flex items-center gap-1 bg-[#F7F8FA] border border-slate-200 rounded-xl p-1 self-start lg:self-auto shrink-0">
                {(["FR", "EN", "DE"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleNewsLangSwitch(lang)}
                    aria-pressed={newsLangTab === lang}
                    className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      newsLangTab === lang
                        ? "bg-[#003366] text-white shadow-xs"
                        : "text-slate-500 hover:text-[#003366] hover:bg-white"
                    }`}
                  >
                    {newsLangLabel(lang)}
                  </button>
                ))}
              </div>
            </div>

            {}
            {(() => {
              const completeness = calculateNewsCompleteness(
                values,

                newsLangTab,
              )

              const statusColor = completeness.isComplete
                ? "bg-[#28A745]"
                : completeness.percentage > 60
                  ? "bg-amber-500"
                  : "bg-rose-400"

              return (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-slate-600">
                      Contenu {newsLangLabel(newsLangTab)} ·{" "}
                      {completeness.filledCount}/{completeness.totalCount}{" "}
                      champs ·{" "}
                      <span
                        className={
                          completeness.isComplete
                            ? "text-[#28A745]"
                            : "text-amber-600"
                        }
                      >
                        {completeness.isComplete ? "Complet" : "Incomplet"}
                      </span>
                    </span>
                    <span className="hidden sm:block w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <span
                        className={`block h-full ${statusColor}`}
                        style={{ width: `${completeness.percentage}%` }}
                      />
                    </span>
                  </div>

                  {newsLangTab !== "FR" && (
                    <button
                      type="button"
                      onClick={() =>
                        requestNewsTranslation(
                          "ALL",

                          newsLangTab === "EN" ? "EN" : "DE",
                        )
                      }
                      disabled={
                        newsTranslating || newsSectionTranslating !== null
                      }
                      title="L'IA pré-remplit les champs de cette langue à partir du français. La proposition reste modifiable et n'est enregistrée qu'après validation."
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#007BFF] text-white hover:bg-[#0069d9] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {newsTranslating ? (
                        <span>Traduction en cours…</span>
                      ) : (
                        <>
                          <span>Pré-remplir {newsLangTab} depuis FR</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/25 text-[10px] font-bold tracking-wide">
                            IA
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })()}
          </div>

          {newsNotice && (
            <div
              className={`inline-flex w-fit max-w-full items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium border ${
                newsNotice.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : newsNotice.type === "info"
                    ? "bg-[#007BFF]/5 border-[#007BFF]/20 text-[#003366]"
                    : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <span>{newsNotice.text}</span>
              <button
                type="button"
                onClick={() => setNewsNotice(null)}
                aria-label="Fermer le message"
                className="shrink-0 text-current opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {}
          <form onSubmit={handleSaveNewsTab} className="space-y-4">
            {NEWS_SECTIONS.map((section, sIdx) => {
              const fields = NEWS_FIELDS.filter((f) => f.section === section.id)

              const fullWidthFields = fields.filter((f) => f.layout !== "half")

              const halfWidthFields = fields.filter((f) => f.layout === "half")

              const isExpanded = newsExpandedSections[section.id] !== false

              const sectionNum = String(sIdx + 1).padStart(2, "0")

              const renderField = (field: typeof NEWS_FIELDS[number]) => {
                const dbKey = getNewsFieldDbKey(field, newsLangTab)

                const currentValue = values[dbKey] || ""

                const frReferenceValue =
                  values[getNewsFieldDbKey(field, "FR")] || ""

                const showReference =
                  field.multilingual &&
                  newsLangTab !== "FR" &&
                  frReferenceValue.trim().length > 0

                return (
                  <div
                    key={field.key}
                    className={`space-y-1.5 ${cmsFieldWidthClass(field.type, field.key)}`}
                  >
                    <label
                      htmlFor={dbKey}
                      className="block text-xs font-bold text-slate-700"
                    >
                      {field.label}
                    </label>

                    {showReference && (
                      <div className="rounded-lg bg-[#F7F8FA] border border-slate-200/70 px-3 py-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          FR · Référence
                        </span>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-500 line-clamp-3">
                          {frReferenceValue}
                        </p>
                      </div>
                    )}

                    {showReference && (
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {newsLangTab}
                      </span>
                    )}

                    {field.type === "textarea" ? (
                      <textarea
                        id={dbKey}
                        value={currentValue}
                        onChange={(e) =>
                          handleInputChange(dbKey, e.target.value)
                        }
                        className="w-full min-h-[88px] px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white resize-y"
                      />
                    ) : (
                      <input
                        id={dbKey}
                        type="text"
                        value={currentValue}
                        onChange={(e) =>
                          handleInputChange(dbKey, e.target.value)
                        }
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                      />
                    )}
                  </div>
                )
              }

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-[#F7F8FA]">
                    <button
                      type="button"
                      onClick={() => toggleNewsSection(section.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono text-[11px] font-bold text-[#003366] shrink-0">
                        {sectionNum}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-slate-800 truncate">
                          {section.title}
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          {section.description}
                        </span>
                      </span>
                    </button>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {newsLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() =>
                            requestNewsTranslation(
                              section.id,

                              newsLangTab === "EN" ? "EN" : "DE",
                            )
                          }
                          disabled={
                            newsSectionTranslating === section.id ||
                            newsTranslating
                          }
                          title="L'IA pré-remplit uniquement les champs de cette section à partir du français."
                          className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-[#003366]/25 text-[#003366] hover:bg-[#003366]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {newsSectionTranslating === section.id
                            ? "Traduction…"
                            : "Traduire cette section depuis FR"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleNewsSection(section.id)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? "Replier la section"
                            : "Déplier la section"
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#003366] hover:bg-white cursor-pointer"
                      >
                        <span className="text-[10px] font-bold">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
                      {fullWidthFields.map((field) => renderField(field))}

                      {halfWidthFields.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {halfWidthFields.map((field) => renderField(field))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <div className="pointer-events-auto fixed bottom-0 left-0 lg:left-60 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 lg:px-12 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      newsIsDirty ? "bg-amber-500" : "bg-[#28A745]"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {newsIsDirty
                      ? "Modifications non enregistrées"
                      : "Toutes les modifications sont enregistrées"}
                  </span>
                  <span className="hidden md:inline text-[11px] text-slate-400 truncate">
                    · Édition en {newsLangLabel(newsLangTab)}
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelNewsChanges}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {saving
                      ? "Enregistrement…"
                      : saveConfirmed
                        ? "Enregistré"
                        : "Enregistrer"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {}
          {newsPendingTranslation && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              onClick={() => setNewsPendingTranslation(null)}
            >
              <div
                className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-bold text-slate-800">
                  Remplacer les contenus{" "}
                  {newsLangAdjective(newsPendingTranslation.targetLang)}{" "}
                  existants ?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Des contenus{" "}
                  {newsLangAdjective(newsPendingTranslation.targetLang)}{" "}
                  existent déjà. Voulez-vous les remplacer par une nouvelle
                  proposition de traduction depuis le français ? La proposition
                  restera modifiable et ne sera enregistrée qu&apos;après votre
                  validation.
                </p>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewsPendingTranslation(null)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pending = newsPendingTranslation

                      setNewsPendingTranslation(null)

                      if (pending)
                        void runNewsTranslation(
                          pending.scope,

                          pending.targetLang,
                        )
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#007BFF] hover:bg-[#0069d9] cursor-pointer"
                  >
                    Remplacer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {}
      {activeTab === "CONTACT" && (
        <div className="space-y-6 pb-28">
          {}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Gestionnaire de contenus : Page Contact
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Le sélecteur de langue concerne les textes affichés. La carte
                  et les emails de réception, communs aux trois langues, sont
                  configurés dans l&apos;onglet FR.
                </p>
              </div>

              {}
              <CmsLangSwitcher
                value={contactLangTab}
                onChange={contactEditor.switchLang}
              />
            </div>

            {}
            <CmsCompletenessBar
              completeness={calculateContactCompleteness(
                values,

                contactLangTab,
              )}
              lang={contactLangTab}
              summaryLabel={
                contactLangTab === "FR"
                  ? "Configuration française"
                  : contactLangTab === "EN"
                    ? "Configuration anglaise"
                    : "Configuration allemande"
              }
              alwaysShowProgress
              translating={contactEditor.translating}
              sectionTranslating={contactEditor.sectionTranslating}
              onTranslate={() =>
                contactEditor.requestTranslation(
                  "ALL",

                  cmsTargetLang(contactLangTab),
                )
              }
            />
            {(() => {
              const completeness = calculateContactCompleteness(
                values,
                contactLangTab,
              )
              const optionalEmptyCount = CONTACT_FIELDS.filter(
                (field) =>
                  !field.required &&
                  !values[
                    getContactFieldDbKey(field, contactLangTab)
                  ]?.trim(),
              ).length

              return (
                <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 sm:px-5 pb-2 text-[10px]">
                  <span className={completeness.missingFields.length > 0 ? "text-rose-600" : "text-emerald-700"}>
                    {completeness.missingFields.length > 0
                      ? `${completeness.missingFields.length} champ(s) obligatoire(s) manquant(s)`
                      : "Champs obligatoires renseignés"}
                  </span>
                  {optionalEmptyCount > 0 && (
                    <span className="text-slate-400">
                      {optionalEmptyCount} champ(s) facultatif(s) non renseigné(s)
                    </span>
                  )}
                </div>
              )
            })()}

            {contactNotice && (
              <div className="mt-4">
                <CmsNoticeBanner
                  notice={contactNotice}
                  onClose={() => setContactNotice(null)}
                />
              </div>
            )}
          </div>

          {}
          <form onSubmit={handleSaveContactTab} className="space-y-6">
            {CONTACT_SECTIONS.filter(
              (section) => section.id === "CONTENT" || contactLangTab === "FR",
            ).map((section, sIdx) => {
              const fields = CONTACT_FIELDS.filter(
                (f) => f.section === section.id,
              )
              const mapZoomField =
                section.id === "MAP"
                  ? fields.find((field) => field.key === "contact_map_zoom")
                  : undefined
              const visibleFields =
                section.id === "MAP"
                  ? fields.filter(
                      (field) => field.key === "contact_map_label",
                    )
                  : fields

              const isExpanded = contactExpandedSections[section.id] !== false

              const savedMapLatitude = values.contact_map_lat?.trim() || ""
              const savedMapLongitude = values.contact_map_lng?.trim() || ""
              const parsedMapLatitude = Number(savedMapLatitude)
              const parsedMapLongitude = Number(savedMapLongitude)
              const hasSavedMapPosition =
                savedMapLatitude !== "" &&
                savedMapLongitude !== "" &&
                Number.isFinite(parsedMapLatitude) &&
                Number.isFinite(parsedMapLongitude) &&
                Math.abs(parsedMapLatitude) <= 90 &&
                Math.abs(parsedMapLongitude) <= 180
              const savedMapLabel = values.contact_map_label?.trim() || ""

              const sectionNum = String(sIdx + 1).padStart(2, "0")

              const hasMultilingualFields = fields.some((f) => f.multilingual)

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleContactSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                          <span>{section.title}</span>
                          {section.id !== "ROUTING" && (
                            <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                              {section.id === "CONTENT"
                                ? "FR / EN / DE"
                                : "Commun aux 3 langues"}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {hasMultilingualFields && (
                        <CmsSectionTranslateButton
                          lang={contactLangTab}
                          busy={contactEditor.sectionTranslating === section.id}
                          onClick={() =>
                            contactEditor.requestTranslation(
                              section.id,

                              cmsTargetLang(contactLangTab),
                            )
                          }
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => toggleContactSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {}
                  {isExpanded && (
                    <div
                      className={`grid grid-cols-1 bg-white ${
                        section.id === "MAP"
                          ? "p-4 sm:p-5 sm:grid-cols-2 gap-4"
                          : "p-6 lg:grid-cols-2 gap-x-10 gap-y-6"
                      }`}
                    >
                      {visibleFields.map((field) => {
                        const dbKey = getContactFieldDbKey(
                          field,

                          contactLangTab,
                        )

                        const currentValue = values[dbKey] || ""

                        const frReferenceKey = `${field.key}_fr`

                        const frReferenceValue = values[frReferenceKey]
                        const isEmpty = !currentValue.trim()
                        const isRequiredMissing = Boolean(field.required && isEmpty)
                        const isOptionalEmpty = !field.required && isEmpty

                        return (
                          <div
                            key={
                              field.key +
                              (field.multilingual ? contactLangTab : "")
                            }
                            className={`space-y-2 ${cmsFieldWidthClass(field.type, field.key)}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <label className="block text-sm font-semibold text-slate-800">
                                {field.key === "contact_map_label"
                                  ? "Lieu"
                                  : field.key === "contact_access_info"
                                    ? "Adresse / indication d'accès"
                                    : field.label}
                                {"required" in field && field.required && (
                                  <span className="ml-1 text-red-500" aria-label="Champ obligatoire">*</span>
                                )}
                              </label>
                              {isRequiredMissing ? (
                                <span className="text-[10px] font-medium text-rose-600">
                                  À renseigner
                                </span>
                              ) : isOptionalEmpty ? (
                                <span className="text-[10px] font-medium text-slate-400">
                                  Facultatif
                                </span>
                              ) : null}
                            </div>

                            {field.description && (
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {}
                            {field.multilingual &&
                              contactLangTab !== "FR" &&
                              frReferenceValue && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                                  <span className="font-bold text-slate-700 block mb-0.5">
                                    Version Française de référence :
                                  </span>
                                  <p className="italic">{frReferenceValue}</p>
                                </div>
                              )}

                            {field.type === "textarea" ? (
                              <textarea
                                rows={3}
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                placeholder={field.placeholder || ""}
                                className={`w-full px-4 py-2.5 rounded-xl border ${isRequiredMissing ? "border-rose-300 bg-rose-50/30" : "border-slate-200"} focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(dbKey, e.target.value)
                                }
                                placeholder={
                                  field.section === "ROUTING" ||
                                  field.key === "contact_map_label"
                                    ? ""
                                    : field.placeholder || ""
                                }
                                className={`w-full px-4 py-2.5 rounded-xl border ${isRequiredMissing ? "border-rose-300 bg-rose-50/30" : "border-slate-200"} focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white`}
                              />
                            )}
                          </div>
                        )
                      })}

                      {section.id === "MAP" && (
                        <div className="space-y-2 self-end">
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            {hasSavedMapPosition && (
                              <span aria-hidden="true">📍</span>
                            )}
                            {hasSavedMapPosition
                              ? savedMapLabel || "Position enregistrée"
                              : "Position sur la carte"}
                          </span>
                          {hasSavedMapPosition ? (
                            <p className="text-[11px] text-emerald-700" role="status">
                                {savedMapLabel
                                  ? "Position enregistrée"
                                  : "Position définie sur la carte"}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500" role="status">
                              Aucune position n&apos;est encore définie.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => setContactMapPickerOpen(true)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#003366]/20 bg-[#003366]/5 px-4 py-2.5 text-sm font-semibold text-[#003366] transition-colors hover:bg-[#003366]/10"
                          >
                            {!hasSavedMapPosition && (
                              <span aria-hidden="true">📍</span>
                            )}
                            {hasSavedMapPosition
                              ? "Modifier la position"
                              : "Positionner sur la carte"}
                          </button>
                        </div>
                      )}

                      {section.id === "MAP" && mapZoomField && (
                        <details className="col-span-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                            Réglages techniques
                          </summary>
                          <div className="mt-3 max-w-sm space-y-2">
                            <label
                              htmlFor={mapZoomField.key}
                              className="block text-xs font-semibold text-slate-700"
                            >
                              {mapZoomField.label}
                            </label>
                            <p className="text-[11px] text-slate-400">
                              {mapZoomField.description}
                            </p>
                            <input
                              id={mapZoomField.key}
                              type="text"
                              value={values[mapZoomField.key] || ""}
                              onChange={(event) =>
                                handleInputChange(
                                  mapZoomField.key,
                                  event.target.value,
                                )
                              }
                              placeholder={mapZoomField.placeholder || ""}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10"
                            />
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {}
            <div className="h-14" aria-hidden="true" />
            <CmsSaveBar
              isDirty={contactEditor.isDirty}
              isReady={contactEditor.isReady}
              saving={saving}
              saved={saveConfirmed}
              lang={contactLangTab}
              onCancel={contactEditor.cancelChanges}
              onSubmit={() => {
                void handleSaveContactTab()
              }}
            />
          </form>

          {contactMapPickerOpen && (
            <ContactMapLocationPicker
              latitude={values.contact_map_lat || ""}
              longitude={values.contact_map_lng || ""}
              zoom={values.contact_map_zoom || ""}
              onClose={() => setContactMapPickerOpen(false)}
              onConfirm={(point, locationName) => {
                handleInputChange("contact_map_lat", point.lat.toFixed(6))
                handleInputChange("contact_map_lng", point.lng.toFixed(6))
                if (locationName !== undefined) {
                  handleInputChange("contact_map_label", locationName)
                }
                setContactMapPickerOpen(false)
              }}
            />
          )}
        </div>
      )}

      {}
      <CmsReplaceConfirmDialog
        pending={contactEditor.pendingTranslation}
        onCancel={contactEditor.cancelPendingTranslation}
        onConfirm={contactEditor.confirmPendingTranslation}
      />

      {}
      {activeTab !== "TEAM" &&
        activeTab !== "ABOUT" &&
        activeTab !== "VOLUNTEER" &&
        activeTab !== "PARTNER" &&
        activeTab !== "MEMBERSHIP" &&
        activeTab !== "SUPPORT" &&
        activeTab !== "NEWS" &&
        activeTab !== "CONTACT" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Chargement des paramètres...
              </div>
            ) : (
              <form onSubmit={handleSaveTab} className="space-y-8">
                {statusMessage && (
                  <div
                    className={`inline-flex w-fit max-w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                      statusMessage.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}
                  >
                    <span>{statusMessage.text}</span>
                    <button
                      type="button"
                      onClick={() => setStatusMessage(null)}
                      aria-label="Fermer le message"
                      className="shrink-0 text-current opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                )}

                {activeTab === "GENERAL" ? (
                  <div className="space-y-5">
                    {[
                      {
                        number: "01",
                        title: "Coordonnées institutionnelles",
                        keys: ["site_location_city", "site_location_region", "site_location_address", "site_location_country"],
                      },
                      {
                        number: "02",
                        title: "Contacts officiels",
                        keys: ["site_contact_email", "site_contact_phone", "site_social_whatsapp"],
                      },
{
                        number: "03",
                        title: "Réseaux sociaux",
                        keys: ["site_social_linkedin", "site_social_facebook", "site_social_instagram"],
                      },
                    ].map((section) => (
                      <section key={section.number} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="mb-4 flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366]/5 text-xs font-bold text-[#003366]">
                            {section.number}
                          </span>
                          <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                          {section.keys.map((key) => {
                            const field = SETTINGS_CONFIG.GENERAL.find((item) => item.key === key)
                            if (!field) return null

                            return (
                              <div key={field.key} className="space-y-2">
                                <label className="block text-sm font-bold text-slate-800">{field.label}</label>
                                <p className="text-xs text-slate-500 leading-relaxed">{field.description}</p>
                                <input
                                  type="text"
                                  value={values[field.key] || ""}
                                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                <div className="space-y-6">
                  {(SETTINGS_CONFIG[activeTab] || []).map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-bold text-slate-800">
                        {field.label}
                      </label>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {field.description}
                      </p>

                      {field.type === "image" ? (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={values[field.key] || ""}
                              onChange={(e) =>
                                handleInputChange(field.key, e.target.value)
                              }
                              placeholder="https://... ou /uploads/..."
                              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm font-mono text-slate-800"
                            />
                            <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
                              <span>
                                {uploadingSettingKey === field.key
                                  ? "Téléversement..."
                                  : "Choisir une image"}
                              </span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                className="hidden"
                                disabled={uploadingSettingKey === field.key}
                                onChange={(e) => {
                                  const f = e.target.files?.[0]

                                  if (f) handleSettingImageUpload(field.key, f)
                                }}
                              />
                            </label>
                          </div>

                          {values[field.key] && (
                            <div className="mt-2">
                              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                Aperçu actuel :
                              </span>
                              <div className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                <img
                                  src={values[field.key]}
                                  alt="Aperçu"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    ;(e.target as HTMLElement).style.display =
                                      "none"
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          rows={4}
                          value={values[field.key] || ""}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800"
                        />
                      ) : (
                        <input
                          type="text"
                          value={values[field.key] || ""}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800"
                        />
                      )}
                    </div>
                  ))}
                </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {saving
                      ? "Enregistrement..."
                      : saveConfirmed
                        ? "Enregistré"
                        : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      {}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-[#003366]">
                {editingMember
                  ? `Modifier : ${getTeamMemberName(editingMember)}`
                  : "Ajouter un membre à l'équipe"}
              </h3>
              <button
                onClick={() => setTeamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {teamFormError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {teamFormError}
              </div>
            )}

            <form onSubmit={handleTeamFormSubmit} className="space-y-6">
              {}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#003366] uppercase">
                    Photo de profil (Portrait) *
                  </label>
                  {!teamFormData.photoUrl && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Photo obligatoire
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-[#003366] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-slate-200 relative shadow-sm">
                    {teamFormData.photoUrl ? (
                      <img
                        src={teamFormData.photoUrl}
                        alt="Portrait"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {teamFormData.firstName || teamFormData.lastName
                          ? `${teamFormData.firstName[0] || ""}${teamFormData.lastName[0] || ""}`.toUpperCase()
                          : "PHOTO"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                        <svg
                          className="w-4 h-4 text-[#007BFF]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {uploadingImage
                            ? "Téléversement en cours..."
                            : "Sélectionner une photo"}
                        </span>
                        <input
                          ref={teamFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={handleTeamImageFileChange}
                        />
                      </label>
                      {teamFormData.photoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setTeamFormData((prev) => ({
                              ...prev,

                              photoUrl: "",
                            }))
                          }
                          className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Supprimer la photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Formats acceptés : JPG, PNG, WEBP, AVIF (Max 5 Mo).
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={teamFormData.firstName}
                    onChange={(e) =>
                      setTeamFormData({
                        ...teamFormData,

                        firstName: e.target.value,
                      })
                    }
                    placeholder="ex: Yao"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={teamFormData.lastName}
                    onChange={(e) =>
                      setTeamFormData({
                        ...teamFormData,

                        lastName: e.target.value,
                      })
                    }
                    placeholder="ex: Tete"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Catégorie / Groupe *
                  </label>
                  <select
                    value={teamFormData.category}
                    onChange={(e) =>
                      setTeamFormData({
                        ...teamFormData,

                        category: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider block">
                      Contenu multilingue (Rôle &amp; Biographie)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Saisissez directement chaque version disponible.
                    </span>
                  </div>

                  <div className="flex bg-white rounded-xl p-1 border border-slate-200 gap-1">
                    {(["FR", "EN", "DE"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setMemberLangTab(lang)}
                        className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          memberLangTab === lang
                            ? "bg-[#003366] text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {lang === "FR"
                          ? "Français\u00A0*"
                          : lang === "EN"
                            ? "English"
                            : "Deutsch"}
                      </button>
                    ))}
                  </div>
                </div>

                {memberLangTab === "FR" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Fonction / Rôle (Français) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={200}
                        value={teamFormData.roleFr}
                        onChange={(e) =>
                          setTeamFormData({
                            ...teamFormData,

                            roleFr: e.target.value,
                          })
                        }
                        placeholder="ex: Coordinatrice des Programmes & Pédagogie"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Biographie (Français) *
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {teamFormData.bioFr.length}/1500
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        required
                        maxLength={1500}
                        value={teamFormData.bioFr}
                        onChange={(e) =>
                          setTeamFormData({
                            ...teamFormData,

                            bioFr: e.target.value,
                          })
                        }
                        placeholder="Présentation du parcours, missions principales et engagement..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {memberLangTab === "EN" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Title / Role (English)
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        value={teamFormData.roleEn}
                        onChange={(e) =>
                          setTeamFormData({
                            ...teamFormData,

                            roleEn: e.target.value,
                          })
                        }
                        placeholder="ex: Program & Pedagogy Coordinator"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Biography (English)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {teamFormData.bioEn.length}/1500
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={1500}
                        value={teamFormData.bioEn}
                        onChange={(e) =>
                          setTeamFormData({
                            ...teamFormData,

                            bioEn: e.target.value,
                          })
                        }
                        placeholder="Short presentation in English..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {memberLangTab === "DE" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Funktion / Rolle (Deutsch)
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        value={teamFormData.roleDe}
                        onChange={(e) =>
                          setTeamFormData({
                            ...teamFormData,

                            roleDe: e.target.value,
                          })
                        }
                        placeholder="ex: Programmkoordinatorin"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Biografie (Deutsch)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {teamFormData.bioDe.length}/1500
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={1500}
                        value={teamFormData.bioDe}
                        onChange={(e) =>
                          setTeamFormData({
                            ...teamFormData,

                            bioDe: e.target.value,
                          })
                        }
                        placeholder="Kurze Biografie auf Deutsch..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email professionnel (optionnel)
                </label>
                <input
                  type="email"
                  value={teamFormData.email}
                  onChange={(e) =>
                    setTeamFormData({ ...teamFormData, email: e.target.value })
                  }
                  placeholder="ex: contact@aptic-r.org"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Compétences clés (12 maximum)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {teamFormData.skills.length}/12
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault()

                        addTeamSkill()
                      }
                    }}
                    placeholder="ex: Pédagogie"
                    className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addTeamSkill()}
                    disabled={
                      !skillInput.trim() || teamFormData.skills.length >= 12
                    }
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
                {teamFormData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {teamFormData.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeTeamSkill(index)}
                          aria-label={`Supprimer ${skill}`}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={teamFormData.active}
                  onChange={(e) =>
                    setTeamFormData({
                      ...teamFormData,

                      active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-[#003366] focus:ring-[#003366]"
                />
                <label
                  htmlFor="active"
                  className="text-xs font-semibold text-slate-700"
                >
                  Afficher ce membre publiquement sur la page « Notre équipe »
                </label>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  * Champs obligatoires
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTeamModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !isFormValid || teamFormSubmitting || uploadingImage
                    }
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {teamFormSubmitting
                      ? "Enregistrement..."
                      : editingMember
                        ? "Mettre à jour"
                        : "Ajouter le membre"}
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
