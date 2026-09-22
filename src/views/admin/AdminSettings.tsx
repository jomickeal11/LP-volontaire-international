"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  getSiteSettings,
  updateSiteSettings,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
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

interface TeamMemberItem {
  id: string
  name: string
  roleFr: string
  roleEn?: string | null
  roleDe?: string | null
  category: string
  bioFr?: string | null
  bioEn?: string | null
  bioDe?: string | null
  photoUrl?: string | null
  email?: string | null
  skills?: string | null
  order: number
  active: boolean
}

// ─── Definition of Tabs (No emojis, clean institutional layout) ──────
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

const CATEGORY_LABELS: Record<string, string> = {
  DIRECTION: "Direction & Fondateurs",
  COORDINATION: "Coordination des programmes",
  FORMATION: "Formateurs & FabLab",
  CONSEIL: "Conseil & Experts",
  VOLONTAIRE: "Volontaires & Bénévoles",
}

const SETTINGS_CONFIG: Record<
  string,
  { key: string; label: string; description: string; type: "text" | "image" | "textarea" }[]
> = {
  SUPPORT: [
    {
      key: "support_hero_image",
      label: "Photo principale (Hero)",
      description: "Image de terrain affichée à droite du titre sur la page Soutien.",
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
      description: "Image d'illustration pour la vie associative et l'adhésion.",
      type: "image",
    },
    {
      key: "membership_charte_url",
      label: "Lien vers la charte éthique / Statuts",
      description: "Lien PDF de consultation des statuts et du règlement intérieur.",
      type: "text",
    },
  ],
  GENERAL: [
    {
      key: "site_location_city",
      label: "Ville du siège social / Territoire",
      description: "Nom de la ville principale affichée sur tout le site (ex: Agbélouvé).",
      type: "text",
    },
    {
      key: "site_location_address",
      label: "Adresse complète du siège",
      description: "Adresse physique officielle (ex: Centre Communautaire & FabLab d'Agbélouvé).",
      type: "text",
    },
    {
      key: "site_location_region",
      label: "Région / Préfecture",
      description: "Région administrative (ex: Préfecture du Zio, Région Maritime).",
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
      description: "Adresse email affichée dans le pied de page et les formulaires.",
      type: "text",
    },
    {
      key: "site_contact_phone",
      label: "Téléphone standard / Siège",
      description: "Numéro de contact officiel du siège avec indicatif (ex: +228 91 20 19 90).",
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
      description: "URL complète vers la page LinkedIn officielle de l'association.",
      type: "text",
    },
    {
      key: "site_social_facebook",
      label: "Lien page Facebook",
      description: "URL complète vers la page Facebook officielle de l'association.",
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
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Team members CMS state
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([])
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null)
  const [teamFormSubmitting, setTeamFormSubmitting] = useState(false)
  const [teamFormError, setTeamFormError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Modal Language Sub-tab (FR / EN / DE)
  const [memberLangTab, setMemberLangTab] = useState<"FR" | "EN" | "DE">("FR")

  const teamFileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingSettingKey, setUploadingSettingKey] = useState<string | null>(null)

  const [teamFormData, setTeamFormData] = useState({
    name: "",
    category: "COORDINATION",
    photoUrl: "",
    email: "",
    skillsInput: "",
    order: 0,
    active: true,
    // Multilingual content
    roleFr: "",
    bioFr: "",
    roleEn: "",
    bioEn: "",
    roleDe: "",
    bioDe: "",
  })

  // Team member translation state
  const [teamTranslating, setTeamTranslating] = useState(false)
  const [teamTranslateNotice, setTeamTranslateNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ─── Static Page Editor: Page À Propos State ──────────────────────────
  const [aboutLangTab, setAboutLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [aboutTranslating, setAboutTranslating] = useState(false)
  const [aboutSectionTranslating, setAboutSectionTranslating] = useState<string | null>(null)
  const [aboutFieldTranslating, setAboutFieldTranslating] = useState<string | null>(null)
  const [aboutNotice, setAboutNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [aboutExpandedSections, setAboutExpandedSections] = useState<Record<string, boolean>>({
    HERO: true,
    STORY: true,
    PILLARS: true,
    STATS: true,
    VALUES: true,
    GOVERNANCE: true,
    CTA: true,
  })

  // ─── Static Page Editor: Page Volontariat State ────────────────────────
  const [volunteerLangTab, setVolunteerLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [volunteerTranslating, setVolunteerTranslating] = useState(false)
  const [volunteerSectionTranslating, setVolunteerSectionTranslating] = useState<string | null>(null)
  const [volunteerFieldTranslating, setVolunteerFieldTranslating] = useState<string | null>(null)
  const [volunteerNotice, setVolunteerNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [volunteerExpandedSections, setVolunteerExpandedSections] = useState<Record<string, boolean>>({
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

  const toggleVolunteerSection = (sectionId: string) => {
    setVolunteerExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
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
        await updateSiteSettings([
          {
            key: pubKey,
            value: nextVal,
            group: "VOLUNTEER",
            description: `Statut publication Volontariat (${lang})`,
          },
        ])
        setVolunteerNotice({
          type: "info",
          text: `La version ${lang} est repassée en BROUILLON (les visiteurs voient la page de finalisation).`,
        })
      } catch (err: any) {
        setVolunteerNotice({ type: "error", text: err.message || "Erreur réseau." })
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
        await updateSiteSettings([
          {
            key: pubKey,
            value: nextVal,
            group: "VOLUNTEER",
            description: `Statut publication Volontariat (${lang})`,
          },
        ])
        setVolunteerNotice({
          type: "success",
          text: `La version ${lang} est maintenant PUBLIÉE et accessible en ligne.`,
        })
      } catch (err: any) {
        setVolunteerNotice({ type: "error", text: err.message || "Erreur réseau." })
      }
    }
  }

  const handleAutoTranslateVolunteer = async () => {
    setVolunteerTranslating(true)
    setVolunteerNotice(null)

    const textsToTranslate: Record<string, string> = {}
    VOLUNTEER_FIELDS.filter((f) => f.isTranslatable).forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setVolunteerNotice({
        type: "error",
        text: "Aucun champ français n'est renseigné pour le moment. Remplissez d'abord les champs en français.",
      })
      setVolunteerTranslating(false)
      return
    }

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success && res.translations) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        if (res.translations.EN) {
          Object.entries(res.translations.EN).forEach(([k, text]) => {
            const dbKey = `${k}_en`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "VOLUNTEER" })
          })
        }

        if (res.translations.DE) {
          Object.entries(res.translations.DE).forEach(([k, text]) => {
            const dbKey = `${k}_de`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "VOLUNTEER" })
          })
        }

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre (MyMemory)"
        setVolunteerNotice({
          type: "success",
          text: `Traduction automatique (${providerLabel}) réussie et enregistrée pour l'anglais et l'allemand !`,
        })
      } else {
        setVolunteerNotice({
          type: "error",
          text: res.error || "Une erreur est survenue lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setVolunteerNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setVolunteerTranslating(false)
    }
  }

  const handleTranslateVolunteerSection = async (sectionId: string) => {
    const fields = VOLUNTEER_FIELDS.filter((f) => f.section === sectionId && f.isTranslatable)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setVolunteerNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}. Renseignez d'abord les champs en français.`,
      })
      return
    }

    setVolunteerSectionTranslating(sectionId)
    setVolunteerNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success && res.translations) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        if (res.translations.EN) {
          Object.entries(res.translations.EN).forEach(([k, text]) => {
            const dbKey = `${k}_en`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "VOLUNTEER" })
          })
        }

        if (res.translations.DE) {
          Object.entries(res.translations.DE).forEach(([k, text]) => {
            const dbKey = `${k}_de`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "VOLUNTEER" })
          })
        }

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setVolunteerNotice({
          type: "success",
          text: `Section ${sectionId} traduite avec succès vers l'anglais et l'allemand (${providerLabel}) !`,
        })
      } else {
        setVolunteerNotice({
          type: "error",
          text: res.error || "Une erreur est survenue lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setVolunteerNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setVolunteerSectionTranslating(null)
    }
  }

  const handleTranslateVolunteerSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setVolunteerNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d'abord la version française.",
      })
      return
    }

    setVolunteerFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "VOLUNTEER" }])
        setVolunteerNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistré.`,
        })
      } else {
        setVolunteerNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setVolunteerNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setVolunteerFieldTranslating(null)
    }
  }

  const handleSaveVolunteerTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setVolunteerNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setVolunteerNotice({
          type: "success",
          text: "Tous les contenus de la page Volontariat ont été enregistrés avec succès !",
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

  // ─── Static Page Editor: Page Partenaires State & Handlers ────────────
  const [partnerLangTab, setPartnerLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [partnerTranslating, setPartnerTranslating] = useState(false)
  const [partnerSectionTranslating, setPartnerSectionTranslating] = useState<string | null>(null)
  const [partnerFieldTranslating, setPartnerFieldTranslating] = useState<string | null>(null)
  const [partnerNotice, setPartnerNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [partnerExpandedSections, setPartnerExpandedSections] = useState<Record<string, boolean>>({
    HERO: true,
    WHY: true,
    FRAMEWORKS: true,
    LOGISTICS: true,
    PROCESS: true,
    FAQ: true,
    CTA: true,
  })

  const togglePartnerSection = (sectionId: string) => {
    setPartnerExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleAutoTranslatePartner = async (targetLang: "EN" | "DE") => {
    const textsToTranslate: Record<string, string> = {}
    PARTNER_FIELDS.forEach((f) => {
      if (f.isTranslatable) {
        const frVal = values[`${f.key}_fr`]
        if (frVal && frVal.trim()) {
          textsToTranslate[f.key] = frVal.trim()
        }
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setPartnerNotice({
        type: "error",
        text: "Aucun champ français n'est renseigné. Veuillez d'abord renseigner la version française.",
      })
      return
    }

    setPartnerTranslating(true)
    setPartnerNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "PARTNER",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setPartnerNotice({
          type: "success",
          text: `Traduction ${targetLang === "EN" ? "anglaise" : "allemande"} générée avec succès via ${providerLabel} et enregistrée !`,
        })
      } else {
        setPartnerNotice({
          type: "error",
          text: res.error || "Une erreur est survenue lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setPartnerNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setPartnerTranslating(false)
    }
  }

  const handleTranslatePartnerSection = async (sectionId: string) => {
    const fields = PARTNER_FIELDS.filter((f) => f.section === sectionId && f.isTranslatable)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setPartnerNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}. Renseignez d'abord les champs en français.`,
      })
      return
    }

    setPartnerSectionTranslating(sectionId)
    setPartnerNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success && res.translations) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        if (res.translations.EN) {
          Object.entries(res.translations.EN).forEach(([k, text]) => {
            const dbKey = `${k}_en`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "PARTNER" })
          })
        }

        if (res.translations.DE) {
          Object.entries(res.translations.DE).forEach(([k, text]) => {
            const dbKey = `${k}_de`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "PARTNER" })
          })
        }

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setPartnerNotice({
          type: "success",
          text: `Section ${sectionId} traduite avec succès vers l'anglais et l'allemand (${providerLabel}) !`,
        })
      } else {
        setPartnerNotice({
          type: "error",
          text: res.error || "Une erreur est survenue lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setPartnerNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setPartnerSectionTranslating(null)
    }
  }

  const handleTranslatePartnerSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setPartnerNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d'abord la version française.",
      })
      return
    }

    setPartnerFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "PARTNER" }])
        setPartnerNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistré.`,
        })
      } else {
        setPartnerNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setPartnerNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setPartnerFieldTranslating(null)
    }
  }

  const handleSavePartnerTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setPartnerNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setPartnerNotice({
          type: "success",
          text: "Tous les contenus de la page Partenaires ont été enregistrés avec succès !",
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

  // ─── Static Page Editor: Page Adhésion / Membres State & Handlers ────
  const [membershipLangTab, setMembershipLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [membershipTranslating, setMembershipTranslating] = useState(false)
  const [membershipSectionTranslating, setMembershipSectionTranslating] = useState<string | null>(null)
  const [membershipFieldTranslating, setMembershipFieldTranslating] = useState<string | null>(null)
  const [membershipNotice, setMembershipNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [membershipExpandedSections, setMembershipExpandedSections] = useState<Record<string, boolean>>({
    HERO: true,
    WHY: true,
    CONTRIBUTE: true,
    WHO: true,
    CTA: true,
    FORM: true,
  })

  const toggleMembershipSection = (sectionId: string) => {
    setMembershipExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleAutoTranslateMembership = async (targetLang: "EN" | "DE") => {
    const textsToTranslate: Record<string, string> = {}
    MEMBERSHIP_FIELDS.forEach((f) => {
      if (f.multilingual) {
        const frVal = values[`${f.key}_fr`]
        if (frVal && frVal.trim()) {
          textsToTranslate[f.key] = frVal.trim()
        }
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setMembershipNotice({
        type: "error",
        text: "Aucun champ français n'est renseigné. Veuillez d'abord renseigner la version française.",
      })
      return
    }

    setMembershipTranslating(true)
    setMembershipNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "MEMBERSHIP",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setMembershipNotice({
          type: "success",
          text: `Traduction ${targetLang === "EN" ? "anglaise" : "allemande"} générée avec succès via ${providerLabel} et enregistrée !`,
        })
      } else {
        setMembershipNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setMembershipNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setMembershipTranslating(false)
    }
  }

  const handleTranslateMembershipSection = async (sectionId: string, targetLang: "EN" | "DE") => {
    const fields = MEMBERSHIP_FIELDS.filter((f) => f.section === sectionId && f.multilingual)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setMembershipNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}.`,
      })
      return
    }

    setMembershipSectionTranslating(sectionId)
    setMembershipNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "MEMBERSHIP",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        setMembershipNotice({
          type: "success",
          text: `Section traduite vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistrée !`,
        })
      } else {
        setMembershipNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setMembershipNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setMembershipSectionTranslating(null)
    }
  }

  const handleTranslateMembershipSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setMembershipNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d'abord la version française.",
      })
      return
    }

    setMembershipFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "MEMBERSHIP" }])
        setMembershipNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistré.`,
        })
      } else {
        setMembershipNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setMembershipNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setMembershipFieldTranslating(null)
    }
  }

  const handleSaveMembershipTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setMembershipNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setMembershipNotice({
          type: "success",
          text: "Tous les contenus de la page Adhésion ont été enregistrés avec succès !",
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

  // ─── Static Page Editor: Page Soutien State & Handlers ──────────────
  const [supportLangTab, setSupportLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [supportTranslating, setSupportTranslating] = useState(false)
  const [supportSectionTranslating, setSupportSectionTranslating] = useState<string | null>(null)
  const [supportFieldTranslating, setSupportFieldTranslating] = useState<string | null>(null)
  const [supportNotice, setSupportNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [supportExpandedSections, setSupportExpandedSections] = useState<Record<string, boolean>>({
    HERO: true,
    AXES: true,
    WHY: true,
    TRANSPARENCY: true,
    FUTURE: true,
    CTA: true,
  })

  const toggleSupportSection = (sectionId: string) => {
    setSupportExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleAutoTranslateSupport = async (targetLang: "EN" | "DE") => {
    const textsToTranslate: Record<string, string> = {}
    SUPPORT_FIELDS.forEach((f) => {
      if (f.multilingual) {
        const frVal = values[`${f.key}_fr`]
        if (frVal && frVal.trim()) {
          textsToTranslate[f.key] = frVal.trim()
        }
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setSupportNotice({
        type: "error",
        text: "Aucun champ français n'est renseigné. Veuillez d'abord renseigner la version française.",
      })
      return
    }

    setSupportTranslating(true)
    setSupportNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "SUPPORT",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setSupportNotice({
          type: "success",
          text: `Traduction ${targetLang === "EN" ? "anglaise" : "allemande"} générée avec succès via ${providerLabel} et enregistrée !`,
        })
      } else {
        setSupportNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setSupportNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setSupportTranslating(false)
    }
  }

  const handleTranslateSupportSection = async (sectionId: string, targetLang: "EN" | "DE") => {
    const fields = SUPPORT_FIELDS.filter((f) => f.section === sectionId && f.multilingual)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setSupportNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}.`,
      })
      return
    }

    setSupportSectionTranslating(sectionId)
    setSupportNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "SUPPORT",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        setSupportNotice({
          type: "success",
          text: `Section traduite vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistrée !`,
        })
      } else {
        setSupportNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setSupportNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setSupportSectionTranslating(null)
    }
  }

  const handleTranslateSupportSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setSupportNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d'abord la version française.",
      })
      return
    }

    setSupportFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "SUPPORT" }])
        setSupportNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistré.`,
        })
      } else {
        setSupportNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setSupportNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setSupportFieldTranslating(null)
    }
  }

  const handleSaveSupportTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSupportNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

    SUPPORT_FIELDS.forEach((f) => {
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

    try {
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setSupportNotice({
          type: "success",
          text: "Tous les contenus de la page Soutien ont été enregistrés avec succès !",
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

  // ─── Static Page Editor: Page Actualités State & Handlers ───────────
  const [newsLangTab, setNewsLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [newsTranslating, setNewsTranslating] = useState(false)
  const [newsSectionTranslating, setNewsSectionTranslating] = useState<string | null>(null)
  const [newsFieldTranslating, setNewsFieldTranslating] = useState<string | null>(null)
  const [newsNotice, setNewsNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [newsExpandedSections, setNewsExpandedSections] = useState<Record<string, boolean>>({
    HERO: true,
    CTA: true,
  })

  const toggleNewsSection = (sectionId: string) => {
    setNewsExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleAutoTranslateNews = async (targetLang: "EN" | "DE") => {
    const textsToTranslate: Record<string, string> = {}
    NEWS_FIELDS.forEach((f) => {
      if (f.multilingual) {
        const frVal = values[`${f.key}_fr`]
        if (frVal && frVal.trim()) {
          textsToTranslate[f.key] = frVal.trim()
        }
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setNewsNotice({
        type: "error",
        text: "Aucun champ français n'est renseigné. Veuillez d'abord renseigner la version française.",
      })
      return
    }

    setNewsTranslating(true)
    setNewsNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "NEWS",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setNewsNotice({
          type: "success",
          text: `Traduction ${targetLang === "EN" ? "anglaise" : "allemande"} générée avec succès via ${providerLabel} et enregistrée !`,
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
      setNewsTranslating(false)
    }
  }

  const handleTranslateNewsSection = async (sectionId: string, targetLang: "EN" | "DE") => {
    const fields = NEWS_FIELDS.filter((f) => f.section === sectionId && f.multilingual)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setNewsNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}.`,
      })
      return
    }

    setNewsSectionTranslating(sectionId)
    setNewsNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "NEWS",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        setNewsNotice({
          type: "success",
          text: `Section traduite vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistrée !`,
        })
      } else {
        setNewsNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setNewsNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setNewsSectionTranslating(null)
    }
  }

  const handleTranslateNewsSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setNewsNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d'abord la version française.",
      })
      return
    }

    setNewsFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "NEWS" }])
        setNewsNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistré.`,
        })
      } else {
        setNewsNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setNewsNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setNewsFieldTranslating(null)
    }
  }

  const handleSaveNewsTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setNewsNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setNewsNotice({
          type: "success",
          text: "Tous les contenus de la page Actualités ont été enregistrés avec succès !",
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

  // ─── Static Page Editor: Page Contact State & Handlers ──────────────
  const [contactLangTab, setContactLangTab] = useState<"FR" | "EN" | "DE">("FR")
  const [contactTranslating, setContactTranslating] = useState(false)
  const [contactSectionTranslating, setContactSectionTranslating] = useState<string | null>(null)
  const [contactFieldTranslating, setContactFieldTranslating] = useState<string | null>(null)
  const [contactNotice, setContactNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [contactExpandedSections, setContactExpandedSections] = useState<Record<string, boolean>>({
    CONTENT: true,
    MAP: true,
    ROUTING: true,
  })

  const toggleContactSection = (sectionId: string) => {
    setContactExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleAutoTranslateContact = async (targetLang: "EN" | "DE") => {
    const textsToTranslate: Record<string, string> = {}
    CONTACT_FIELDS.forEach((f) => {
      if (f.multilingual) {
        const frVal = values[`${f.key}_fr`]
        if (frVal && frVal.trim()) {
          textsToTranslate[f.key] = frVal.trim()
        }
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setContactNotice({
        type: "error",
        text: "Aucun champ français n\u0027est renseigné. Veuillez d\u0027abord renseigner la version française.",
      })
      return
    }

    setContactTranslating(true)
    setContactNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "CONTACT",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setContactNotice({
          type: "success",
          text: `Traduction ${targetLang === "EN" ? "anglaise" : "allemande"} générée via ${providerLabel} et enregistrée !`,
        })
      } else {
        setContactNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setContactNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setContactTranslating(false)
    }
  }

  const handleTranslateContactSection = async (sectionId: string, targetLang: "EN" | "DE") => {
    const fields = CONTACT_FIELDS.filter((f) => f.section === sectionId && f.multilingual)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setContactNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}.`,
      })
      return
    }

    setContactSectionTranslating(sectionId)
    setContactNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        Object.entries(res.translations[targetLang]).forEach(([k, text]) => {
          const dbKey = `${k}_${targetLang.toLowerCase()}`
          updatedValues[dbKey] = text
          settingsPayload.push({
            key: dbKey,
            value: text,
            group: "CONTACT",
          })
        })

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        setContactNotice({
          type: "success",
          text: `Section traduite vers ${targetLang === "EN" ? "l\u0027anglais" : "l\u0027allemand"} et enregistrée !`,
        })
      } else {
        setContactNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setContactNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setContactSectionTranslating(null)
    }
  }

  const handleTranslateContactSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setContactNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d\u0027abord la version française.",
      })
      return
    }

    setContactFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "CONTACT" }])
        setContactNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l\u0027anglais" : "l\u0027allemand"} et enregistré.`,
        })
      } else {
        setContactNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setContactNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setContactFieldTranslating(null)
    }
  }

  const handleSaveContactTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setContactNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setContactNotice({
          type: "success",
          text: "Tous les paramètres de la page Contact ont été enregistrés avec succès !",
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
    setAboutExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
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
        await updateSiteSettings([
          {
            key: pubKey,
            value: nextVal,
            group: "ABOUT",
            description: `Statut publication À Propos (${lang})`,
          },
        ])
        setAboutNotice({
          type: "info",
          text: `La version ${lang} est repassée en BROUILLON (les visiteurs voient la page de finalisation).`,
        })
      } catch (err: any) {
        setAboutNotice({ type: "error", text: err.message || "Erreur réseau." })
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
        await updateSiteSettings([
          {
            key: pubKey,
            value: nextVal,
            group: "ABOUT",
            description: `Statut publication À Propos (${lang})`,
          },
        ])
        setAboutNotice({
          type: "success",
          text: `La version ${lang} est maintenant PUBLIÉE et accessible en ligne.`,
        })
      } catch (err: any) {
        setAboutNotice({ type: "error", text: err.message || "Erreur réseau." })
      }
    }
  }

  const handleAutoTranslateAbout = async () => {
    setAboutTranslating(true)
    setAboutNotice(null)

    const textsToTranslate: Record<string, string> = {}
    ABOUT_FIELDS.filter((f) => f.isTranslatable).forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setAboutNotice({
        type: "error",
        text: "Aucun champ français n'est renseigné pour le moment. Remplissez d'abord les champs en français.",
      })
      setAboutTranslating(false)
      return
    }

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success && res.translations) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        if (res.translations.EN) {
          Object.entries(res.translations.EN).forEach(([k, text]) => {
            const dbKey = `${k}_en`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "ABOUT" })
          })
        }

        if (res.translations.DE) {
          Object.entries(res.translations.DE).forEach(([k, text]) => {
            const dbKey = `${k}_de`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "ABOUT" })
          })
        }

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre (MyMemory)"
        setAboutNotice({
          type: "success",
          text: `Traduction automatique (${providerLabel}) réussie et enregistrée pour l'anglais et l'allemand !`,
        })
      } else {
        setAboutNotice({
          type: "error",
          text: res.error || "Une erreur est survenue lors de la traduction automatique.",
        })
      }
    } catch (err: any) {
      setAboutNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setAboutTranslating(false)
    }
  }

  // ─── Section-level Auto-Translate for À Propos ────────────────────────
  const handleTranslateAboutSection = async (sectionId: string) => {
    const fields = ABOUT_FIELDS.filter((f) => f.section === sectionId && f.isTranslatable)
    const textsToTranslate: Record<string, string> = {}

    fields.forEach((f) => {
      const frVal = values[`${f.key}_fr`]
      if (frVal && frVal.trim()) {
        textsToTranslate[f.key] = frVal.trim()
      }
    })

    if (Object.keys(textsToTranslate).length === 0) {
      setAboutNotice({
        type: "error",
        text: `Aucun champ français renseigné pour la section ${sectionId}. Renseignez d'abord les champs en français.`,
      })
      return
    }

    setAboutSectionTranslating(sectionId)
    setAboutNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: textsToTranslate,
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success && res.translations) {
        const updatedValues = { ...values }
        const settingsPayload: { key: string; value: string; group: string; description?: string }[] = []

        if (res.translations.EN) {
          Object.entries(res.translations.EN).forEach(([k, text]) => {
            const dbKey = `${k}_en`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "ABOUT" })
          })
        }

        if (res.translations.DE) {
          Object.entries(res.translations.DE).forEach(([k, text]) => {
            const dbKey = `${k}_de`
            updatedValues[dbKey] = text
            settingsPayload.push({ key: dbKey, value: text, group: "ABOUT" })
          })
        }

        setValues(updatedValues)

        if (settingsPayload.length > 0) {
          await updateSiteSettings(settingsPayload)
        }

        const providerLabel = res.providerUsed === "deepl" ? "DeepL Pro" : "Moteur libre"
        setAboutNotice({
          type: "success",
          text: `Section ${sectionId} traduite avec succès vers l'anglais et l'allemand (${providerLabel}) !`,
        })
      } else {
        setAboutNotice({
          type: "error",
          text: res.error || "Une erreur est survenue lors de la traduction de la section.",
        })
      }
    } catch (err: any) {
      setAboutNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setAboutSectionTranslating(null)
    }
  }

  // ─── Single-field Auto-Translate for À Propos ─────────────────────────
  const handleTranslateAboutSingleField = async (fieldKey: string, targetLang: "EN" | "DE") => {
    const frKey = `${fieldKey}_fr`
    const frVal = values[frKey]
    if (!frVal || !frVal.trim()) {
      setAboutNotice({
        type: "error",
        text: "Le texte source en français est vide pour ce champ. Saisissez d'abord la version française.",
      })
      return
    }

    setAboutFieldTranslating(fieldKey)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [fieldKey]: frVal.trim() },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[fieldKey]) {
        const translated = res.translations[targetLang][fieldKey]
        const dbKey = `${fieldKey}_${targetLang.toLowerCase()}`
        setValues((prev) => ({ ...prev, [dbKey]: translated }))
        await updateSiteSettings([{ key: dbKey, value: translated, group: "ABOUT" }])
        setAboutNotice({
          type: "success",
          text: `Champ traduit vers ${targetLang === "EN" ? "l'anglais" : "l'allemand"} et enregistré.`,
        })
      } else {
        setAboutNotice({
          type: "error",
          text: res.error || "Erreur lors de la traduction du champ.",
        })
      }
    } catch (err: any) {
      setAboutNotice({
        type: "error",
        text: err.message || "Erreur de connexion au service de traduction.",
      })
    } finally {
      setAboutFieldTranslating(null)
    }
  }

  // ─── Team Member Auto-Translate ─────────────────────────────────────
  const handleAutoTranslateTeamMember = async () => {
    if (!teamFormData.roleFr.trim() && !teamFormData.bioFr.trim()) {
      setTeamFormError("Veuillez saisir au moins la fonction/rôle en français avant de traduire.")
      return
    }

    setTeamTranslating(true)
    setTeamFormError("")
    setTeamTranslateNotice(null)

    try {
      const res = await translateCmsFieldsAction({
        texts: {
          role: teamFormData.roleFr,
          bio: teamFormData.bioFr || "",
        },
        sourceLang: "FR",
        targetLangs: ["EN", "DE"],
      })

      if (res.success && res.translations) {
        setTeamFormData((prev) => ({
          ...prev,
          roleEn: res.translations.EN.role || prev.roleEn,
          bioEn: res.translations.EN.bio || prev.bioEn,
          roleDe: res.translations.DE.role || prev.roleDe,
          bioDe: res.translations.DE.bio || prev.bioDe,
        }))
        const providerName = res.providerUsed === "deepl" ? "DeepL Pro" : "Traducteur automatique"
        setTeamTranslateNotice({
          type: "success",
          text: `Rôle et biographie traduits vers l'anglais et l'allemand (${providerName}).`,
        })
      } else {
        setTeamFormError(res.error || "Erreur lors de la traduction automatique.")
      }
    } catch (err: any) {
      setTeamFormError(err.message || "Erreur de connexion lors de la traduction.")
    } finally {
      setTeamTranslating(false)
    }
  }

  const handleTranslateSingleTeamField = async (field: "role" | "bio", targetLang: "EN" | "DE") => {
    const sourceText = field === "role" ? teamFormData.roleFr : teamFormData.bioFr
    if (!sourceText || !sourceText.trim()) return

    setTeamTranslating(true)
    try {
      const res = await translateCmsFieldsAction({
        texts: { [field]: sourceText },
        sourceLang: "FR",
        targetLangs: [targetLang],
      })

      if (res.success && res.translations?.[targetLang]?.[field]) {
        const val = res.translations[targetLang][field]
        if (field === "role") {
          setTeamFormData((prev) => ({ ...prev, [targetLang === "EN" ? "roleEn" : "roleDe"]: val }))
        } else {
          setTeamFormData((prev) => ({ ...prev, [targetLang === "EN" ? "bioEn" : "bioDe"]: val }))
        }
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setTeamTranslating(false)
    }
  }

  const handleSaveAboutTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setAboutNotice(null)

    const payload: { key: string; value: string; group: string; description?: string }[] = []

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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setAboutNotice({
          type: "success",
          text: "Tous les contenus de la page À Propos ont été enregistrés avec succès !",
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
        setValues(res.dict)
      }
    } catch (err) {
      console.error("Erreur de chargement des paramètres:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamData = async () => {
    try {
      const res = await getTeamMembers({ activeOnly: false })
      if (res.success && res.members) {
        setTeamMembers(res.members)
      }
    } catch (err) {
      console.error("Erreur de chargement des membres:", err)
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
      const res = await updateSiteSettings(payload)
      if (res.success) {
        setStatusMessage({ type: "success", text: "Modifications enregistrées avec succès." })
      } else {
        setStatusMessage({ type: "error", text: res.error || "Erreur lors de l'enregistrement." })
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Erreur réseau." })
    } finally {
      setSaving(false)
    }
  }

  // ─── Image Upload Handlers ────────────────────────────────────────────────

  const handleTeamImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setTeamFormError(result.error || "Erreur lors du téléversement de la photo.")
      }
    } catch (err: any) {
      setTeamFormError(err.message || "Erreur de connexion au serveur d'upload.")
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

  // ─── Team Modal Handlers ──────────────────────────────────────────────────

  const openCreateTeamModal = () => {
    setEditingMember(null)
    setMemberLangTab("FR")
    setTeamFormData({
      name: "",
      category: "COORDINATION",
      photoUrl: "",
      email: "",
      skillsInput: "",
      order: teamMembers.length + 1,
      active: true,
      roleFr: "",
      bioFr: "",
      roleEn: "",
      bioEn: "",
      roleDe: "",
      bioDe: "",
    })
    setTeamFormError("")
    setTeamModalOpen(true)
  }

  const openEditTeamModal = (m: TeamMemberItem) => {
    setEditingMember(m)
    setMemberLangTab("FR")
    let skillsFormatted = ""
    try {
      if (m.skills) {
        const arr = JSON.parse(m.skills)
        skillsFormatted = Array.isArray(arr) ? arr.join(", ") : m.skills
      }
    } catch {
      skillsFormatted = m.skills || ""
    }

    setTeamFormData({
      name: m.name,
      category: m.category,
      photoUrl: m.photoUrl || "",
      email: m.email || "",
      skillsInput: skillsFormatted,
      order: m.order,
      active: m.active,
      roleFr: m.roleFr || "",
      bioFr: m.bioFr || "",
      roleEn: m.roleEn || "",
      bioEn: m.bioEn || "",
      roleDe: m.roleDe || "",
      bioDe: m.bioDe || "",
    })
    setTeamFormError("")
    setTeamModalOpen(true)
  }

  const isFormValid =
    Boolean(teamFormData.name.trim()) &&
    Boolean(teamFormData.roleFr.trim()) &&
    Boolean(teamFormData.category) &&
    Boolean(teamFormData.photoUrl.trim())

  const handleTeamFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      setTeamFormError("Veuillez remplir tous les champs obligatoires : Nom, Fonction (FR), Catégorie et Photo.")
      return
    }

    setTeamFormSubmitting(true)
    setTeamFormError("")

    const skillsArray = teamFormData.skillsInput
      ? teamFormData.skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : []

    try {
      if (editingMember) {
        const res = await updateTeamMember(editingMember.id, {
          name: teamFormData.name,
          roleFr: teamFormData.roleFr,
          roleEn: teamFormData.roleEn || undefined,
          roleDe: teamFormData.roleDe || undefined,
          category: teamFormData.category,
          bioFr: teamFormData.bioFr || undefined,
          bioEn: teamFormData.bioEn || undefined,
          bioDe: teamFormData.bioDe || undefined,
          photoUrl: teamFormData.photoUrl || undefined,
          email: teamFormData.email || undefined,
          skills: skillsArray,
          order: teamFormData.order,
          active: teamFormData.active,
        })
        if (res.success) {
          setTeamModalOpen(false)
          await loadTeamData()
        } else {
          setTeamFormError(res.error || "Erreur lors de la mise à jour")
        }
      } else {
        const res = await createTeamMember({
          name: teamFormData.name,
          roleFr: teamFormData.roleFr,
          roleEn: teamFormData.roleEn || undefined,
          roleDe: teamFormData.roleDe || undefined,
          category: teamFormData.category,
          bioFr: teamFormData.bioFr || undefined,
          bioEn: teamFormData.bioEn || undefined,
          bioDe: teamFormData.bioDe || undefined,
          photoUrl: teamFormData.photoUrl || undefined,
          email: teamFormData.email || undefined,
          skills: skillsArray,
          order: teamFormData.order,
          active: teamFormData.active,
        })
        if (res.success) {
          setTeamModalOpen(false)
          await loadTeamData()
        } else {
          setTeamFormError(res.error || "Erreur lors de la création")
        }
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
          prev.map((item) => (item.id === m.id ? { ...item, active: !item.active } : item))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Paramètres, Médias & Équipe</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez le personnel, leurs rôles institutionnels, ainsi que les photos et contenus clés du portail.
          </p>
        </div>
      </div>

      {/* Onglets de navigation sans emoji */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setStatusMessage(null)
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

      {/* ─── ONGLET GESTION DE L'ÉQUIPE (CMS MembreEquipe) ─── */}
      {activeTab === "TEAM" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gestion de l&apos;Équipe & du Personnel</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Ajoutez, modifiez ou organisez les rôles, photos, biographies et compétences de l&apos;équipe APTIC-R.
                </p>
              </div>
              <button
                onClick={openCreateTeamModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Ajouter un membre</span>
              </button>
            </div>

            {/* Liste des membres */}
            <div className="divide-y divide-slate-100 mt-4">
              {teamMembers.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Aucun membre enregistré pour le moment.
                </div>
              ) : (
                teamMembers.map((m) => (
                  <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-slate-200 relative">
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{m.name}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {CATEGORY_LABELS[m.category] || m.category}
                          </span>
                          {!m.active && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                              Masqué
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#007BFF] font-medium mt-0.5">{m.roleFr}</p>
                        {m.email && <p className="text-[11px] text-slate-400 mt-0.5">{m.email}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleTeamActive(m)}
                        title={m.active ? "Désactiver / Masquer" : "Activer / Afficher"}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                          m.active
                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {m.active ? "Masquer" : "Publier"}
                      </button>
                      <button
                        onClick={() => openEditTeamModal(m)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(m.id, m.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ONGLET ÉDITEUR DE PAGE STATIQUE : À PROPOS ─── */}
      {activeTab === "ABOUT" && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#007BFF] border border-blue-200">
                    Module CMS • Page Statique
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#003366] mt-1.5">
                  Éditeur de Page Statique : « À Propos d&apos;APTIC-R »
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Gérez l&apos;intégralité des contenus institutionnels : Hero, Chronologie, Piliers d&apos;action, Chiffres d&apos;impact, Valeurs et Gouvernance. Zéro texte codé en dur, contrôle 100% CMS par langue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAutoTranslateAbout}
                  disabled={aboutTranslating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Traduit automatiquement les contenus français vers l'anglais et l'allemand"
                >
                  {aboutTranslating ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Traduction IA en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                      </svg>
                      <span>Traduire vers EN &amp; DE</span>
                    </>
                  )}
                </button>

                <a
                  href={`/${aboutLangTab.toLowerCase()}/a-propos`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#003366] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <span>Aperçu public ({aboutLangTab})</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {aboutNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-4 ${
                  aboutNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : aboutNotice.type === "error"
                    ? "bg-rose-50 border border-rose-200 text-rose-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                <span>{aboutNotice.text}</span>
                <button
                  type="button"
                  onClick={() => setAboutNotice(null)}
                  className="text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

            {/* ─── Cartes de Statut & Complétude par Langue ─── */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FR", "EN", "DE"] as const).map((lang) => {
                const completeness = calculateAboutCompleteness(values, lang)
                const isPub = isAboutPagePublished(values, lang)
                const langTitle = lang === "FR" ? "Français (Source)" : lang === "EN" ? "English (Anglais)" : "Deutsch (Allemand)"

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
                        <span className="text-sm font-bold text-slate-800">{langTitle}</span>
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
                        <span className="text-slate-500 font-medium">Complétude :</span>
                        <span className={`font-bold ${completeness.isComplete ? "text-emerald-700" : "text-amber-700"}`}>
                          {completeness.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completeness.isComplete ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${completeness.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {completeness.filledCount} / {completeness.totalCount} champs requis
                        {!completeness.isComplete && ` (${completeness.missingFields.length} manquant${completeness.missingFields.length > 1 ? "s" : ""})`}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setAboutLangTab(lang)}
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
                        {isPub ? "Passer en Brouillon" : completeness.isComplete ? "Publier" : "Non publiable"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ─── Sélecteur d'Onglet de Langue pour le Formulaire ─── */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Langue en cours d&apos;édition :
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 self-start sm:self-auto">
                  {(["FR", "EN", "DE"] as const).map((lang) => {
                    const completeness = calculateAboutCompleteness(values, lang)
                    const isActive = aboutLangTab === lang
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setAboutLangTab(lang)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isActive
                            ? "bg-[#003366] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        <span>{lang === "FR" ? "Français" : lang === "EN" ? "English" : "Deutsch"}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? "bg-white/20 text-white"
                              : completeness.isComplete
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {completeness.percentage}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {aboutLangTab !== "FR" && (
                <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#007BFF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Vous éditez actuellement la version <strong>{aboutLangTab === "EN" ? "Anglaise" : "Allemande"}</strong>.
                    Pour chaque champ multilingue, le texte de référence français est affiché pour vous guider.
                    Vous pouvez aussi utiliser le bouton <strong>« Traduire vers EN &amp; DE »</strong> ci-dessus pour pré-remplir automatiquement.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Formulaire par Sections Accordéon ─── */}
          <form onSubmit={handleSaveAboutTab} className="space-y-6">
            {ABOUT_SECTIONS.map((section) => {
              const fields = ABOUT_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = aboutExpandedSections[section.id] !== false

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Section Header (Toggleable) */}
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
                      {/* Bouton de traduction de la section entière */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTranslateAboutSection(section.id)
                        }}
                        disabled={aboutSectionTranslating === section.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#007BFF] bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Traduire automatiquement la section « ${section.label} » vers l'anglais et l'allemand`}
                      >
                        {aboutSectionTranslating === section.id ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Traduction section...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire cette section</span>
                          </>
                        )}
                      </button>

                      {/* Bouton Masquer / Déplier */}
                      <button
                        type="button"
                        onClick={() => toggleAboutSection(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg cursor-pointer"
                      >
                        <span>{isExpanded ? "Masquer" : "Déplier"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 space-y-6 divide-y divide-slate-100">
                      {fields.map((field, idx) => {
                        const dbKey = field.isTranslatable ? getAboutFieldDbKey(field.key, aboutLangTab) : field.key
                        const frKey = `${field.key}_fr`
                        const frValue = field.isTranslatable ? values[frKey] || "" : ""
                        const currentValue = values[dbKey] || ""

                        return (
                          <div key={field.key} className={idx > 0 ? "pt-6" : ""}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                  {field.label}
                                </label>
                                {field.required ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    Requis
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                    Optionnel
                                  </span>
                                )}
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                  {field.isTranslatable ? `Multilingue (${aboutLangTab})` : "Commun (Toutes langues)"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {aboutLangTab !== "FR" && field.isTranslatable && (
                                  <button
                                    type="button"
                                    onClick={() => handleTranslateAboutSingleField(field.key, aboutLangTab)}
                                    disabled={aboutFieldTranslating === field.key || !frValue}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#007BFF] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-40 cursor-pointer"
                                    title="Traduire automatiquement ce champ spécifique depuis la source française"
                                  >
                                    {aboutFieldTranslating === field.key ? (
                                      <>
                                        <svg className="animate-spin w-3 h-3 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>Traduction...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                                        </svg>
                                        <span>Traduire ce champ</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <span className="text-[11px] font-mono text-slate-400">
                                  Clé BD : {dbKey}
                                </span>
                              </div>
                            </div>

                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {/* Reference source block in French when editing EN or DE */}
                            {aboutLangTab !== "FR" && field.isTranslatable && frValue && (
                              <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-2 font-bold text-[#003366] text-[11px] uppercase tracking-wider mb-1">
                                  <span>Référence source (Français) :</span>
                                  <button
                                    type="button"
                                    onClick={() => handleTranslateAboutSingleField(field.key, aboutLangTab)}
                                    disabled={aboutFieldTranslating === field.key}
                                    className="text-[10px] font-semibold text-[#007BFF] hover:underline cursor-pointer lowercase"
                                  >
                                    traduire ce texte vers {aboutLangTab}
                                  </button>
                                </div>
                                <p className="italic leading-relaxed whitespace-pre-line text-slate-700">
                                  {frValue}
                                </p>
                              </div>
                            )}

                            {/* Field input according to type */}
                            {field.type === "image" ? (
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                    placeholder="https://... ou /uploads/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-xs font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
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
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu actuel :
                                    </span>
                                    <div className="w-56 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display = "none"
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
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page « À Propos » ({aboutLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les contenus"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET ÉDITEUR DE PAGE STATIQUE : VOLONTARIAT ─── */}
      {activeTab === "VOLUNTEER" && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#007BFF] border border-blue-200">
                    Module CMS • Page Volontariat
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#003366] mt-1.5">
                  Éditeur de Page : « Volontariat International &amp; Missions »
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Gérez l&apos;intégralité des 12 sections de recrutement de volontaires : Accroche Hero, Pourquoi cette mission, Défi terrain, Activités concrètes, Profils recherchés, Semaine type, Immersion Togo, Conditions transparentes, Processus de candidature, FAQ et Appel à l&apos;action final.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAutoTranslateVolunteer}
                  disabled={volunteerTranslating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Traduit automatiquement les contenus français vers l'anglais et l'allemand"
                >
                  {volunteerTranslating ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Traduction IA en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                      </svg>
                      <span>Traduire vers EN &amp; DE</span>
                    </>
                  )}
                </button>

                <a
                  href={`/${volunteerLangTab.toLowerCase()}/volontariat`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#003366] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <span>Aperçu public ({volunteerLangTab})</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {volunteerNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-4 ${
                  volunteerNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : volunteerNotice.type === "error"
                    ? "bg-rose-50 border border-rose-200 text-rose-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                <span>{volunteerNotice.text}</span>
                <button
                  type="button"
                  onClick={() => setVolunteerNotice(null)}
                  className="text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

            {/* ─── Cartes de Statut & Complétude par Langue ─── */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FR", "EN", "DE"] as const).map((lang) => {
                const completeness = calculateVolunteerCompleteness(values, lang)
                const isPub = isVolunteerPagePublished(values, lang)
                const langTitle = lang === "FR" ? "Français (Source)" : lang === "EN" ? "English (Anglais)" : "Deutsch (Allemand)"

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
                        <span className="text-sm font-bold text-slate-800">{langTitle}</span>
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
                        <span className="text-slate-500 font-medium">Complétude :</span>
                        <span className={`font-bold ${completeness.isComplete ? "text-emerald-700" : "text-amber-700"}`}>
                          {completeness.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completeness.isComplete ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${completeness.percentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {completeness.filledCount} / {completeness.totalCount} champs requis
                        {!completeness.isComplete && ` (${completeness.missingFields.length} manquant${completeness.missingFields.length > 1 ? "s" : ""})`}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setVolunteerLangTab(lang)}
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
                        {isPub ? "Passer en Brouillon" : completeness.isComplete ? "Publier" : "Non publiable"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ─── Sélecteur d'Onglet de Langue pour le Formulaire ─── */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Langue en cours d&apos;édition :
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 self-start sm:self-auto">
                  {(["FR", "EN", "DE"] as const).map((lang) => {
                    const completeness = calculateVolunteerCompleteness(values, lang)
                    const isActive = volunteerLangTab === lang
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setVolunteerLangTab(lang)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isActive
                            ? "bg-[#003366] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        <span>{lang === "FR" ? "Français" : lang === "EN" ? "English" : "Deutsch"}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? "bg-white/20 text-white"
                              : completeness.isComplete
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {completeness.percentage}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {volunteerLangTab !== "FR" && (
                <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#007BFF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Vous éditez actuellement la version <strong>{volunteerLangTab === "EN" ? "Anglaise" : "Allemande"}</strong>.
                    Pour chaque champ multilingue, le texte de référence français est affiché pour vous guider.
                    Vous pouvez aussi utiliser le bouton <strong>« Traduire vers EN &amp; DE »</strong> ci-dessus pour pré-remplir automatiquement.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Formulaire par Sections Accordéon ─── */}
          <form onSubmit={handleSaveVolunteerTab} className="space-y-6">
            {VOLUNTEER_SECTIONS.map((section, sIdx) => {
              const fields = VOLUNTEER_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = volunteerExpandedSections[section.id] !== false
              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Section Header (Toggleable) */}
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
                      {/* Bouton de traduction de la section entière */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTranslateVolunteerSection(section.id)
                        }}
                        disabled={volunteerSectionTranslating === section.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#007BFF] bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Traduire automatiquement la section « ${section.label} » vers l'anglais et l'allemand`}
                      >
                        {volunteerSectionTranslating === section.id ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Traduction section...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire cette section</span>
                          </>
                        )}
                      </button>

                      {/* Bouton Masquer / Déplier */}
                      <button
                        type="button"
                        onClick={() => toggleVolunteerSection(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg cursor-pointer"
                      >
                        <span>{isExpanded ? "Masquer" : "Déplier"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 space-y-6 divide-y divide-slate-100">
                      {fields.map((field, idx) => {
                        const dbKey = field.isTranslatable ? getVolunteerFieldDbKey(field.key, volunteerLangTab) : field.key
                        const frKey = `${field.key}_fr`
                        const frValue = field.isTranslatable ? values[frKey] || "" : ""
                        const currentValue = values[dbKey] || ""

                        return (
                          <div key={field.key} className={idx > 0 ? "pt-6" : ""}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                  {field.label}
                                </label>
                                {field.required ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    Requis
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                    Optionnel
                                  </span>
                                )}
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                  {field.isTranslatable ? `Multilingue (${volunteerLangTab})` : "Commun (Toutes langues)"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {volunteerLangTab !== "FR" && field.isTranslatable && (
                                  <button
                                    type="button"
                                    onClick={() => handleTranslateVolunteerSingleField(field.key, volunteerLangTab)}
                                    disabled={volunteerFieldTranslating === field.key || !frValue}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#007BFF] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-40 cursor-pointer"
                                    title="Traduire automatiquement ce champ spécifique depuis la source française"
                                  >
                                    {volunteerFieldTranslating === field.key ? (
                                      <>
                                        <svg className="animate-spin w-3 h-3 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>Traduction...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                                        </svg>
                                        <span>Traduire ce champ</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <span className="text-[11px] font-mono text-slate-400">
                                  Clé BD : {dbKey}
                                </span>
                              </div>
                            </div>

                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {/* Reference source block in French when editing EN or DE */}
                            {volunteerLangTab !== "FR" && field.isTranslatable && frValue && (
                              <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-2 font-bold text-[#003366] text-[11px] uppercase tracking-wider mb-1">
                                  <span>Référence source (Français) :</span>
                                  <button
                                    type="button"
                                    onClick={() => handleTranslateVolunteerSingleField(field.key, volunteerLangTab)}
                                    disabled={volunteerFieldTranslating === field.key}
                                    className="text-[10px] font-semibold text-[#007BFF] hover:underline cursor-pointer lowercase"
                                  >
                                    traduire ce texte vers {volunteerLangTab}
                                  </button>
                                </div>
                                <p className="italic leading-relaxed whitespace-pre-line text-slate-700">
                                  {frValue}
                                </p>
                              </div>
                            )}

                            {/* Field input according to type */}
                            {field.type === "image" ? (
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                    placeholder="https://... ou /uploads/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-xs font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
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
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu actuel :
                                    </span>
                                    <div className="w-56 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display = "none"
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
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page « Volontariat » ({volunteerLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#003366] hover:bg-[#002244] transition-all shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les contenus"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET PAGE PARTENAIRES (CMS Dynamique 7 sections) ─── */}
      {activeTab === "PARTNER" && (
        <div className="space-y-6">
          {/* Header & Completeness Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Éditeur de la Page Partenaires</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Personnalisez les 7 sections institutionnelles, les garanties, formats de partenariat et FAQ en français, anglais et allemand.
                </p>
              </div>

              {/* Multi-language Selector Sub-tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(["FR", "EN", "DE"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setPartnerLangTab(lang)
                      setPartnerNotice(null)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      partnerLangTab === lang
                        ? "bg-[#003366] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {lang === "FR" ? "Français" : lang === "EN" ? "English" : "Deutsch"}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic de complétude */}
            {(() => {
              const completeness = calculatePartnerCompleteness(values, partnerLangTab)
              return (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Complétude des contenus ({partnerLangTab}) :
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          completeness.percentage === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : completeness.percentage > 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {completeness.percentage}% ({completeness.filledCount}/{completeness.totalCount} champs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {partnerLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslatePartner(partnerLangTab)}
                          disabled={partnerTranslating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          title="Traduire automatiquement tous les champs depuis la source française"
                        >
                          {partnerTranslating ? (
                            <>
                              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                              </svg>
                              <span>Traduction globale...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                              </svg>
                              <span>Traduire toute la page ({partnerLangTab})</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completeness.percentage === 100
                          ? "bg-emerald-500"
                          : completeness.percentage > 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${completeness.percentage}%` }}
                    />
                  </div>

                  {completeness.missingFields.length > 0 && (
                    <div className="mt-3 text-[11px] text-slate-500">
                      <span className="font-semibold text-rose-600">Champs requis manquants : </span>
                      {completeness.missingFields.map((f, i) => (
                        <span key={f.key}>
                          {f.label}
                          {i < completeness.missingFields.length - 1 ? ", " : "."}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {partnerNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs font-semibold ${
                  partnerNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : partnerNotice.type === "info"
                    ? "bg-blue-50 border border-blue-200 text-blue-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {partnerNotice.text}
              </div>
            )}
          </div>

          {/* Form with 7 Accordion Sections */}
          <form onSubmit={handleSavePartnerTab} className="space-y-4">
            {PARTNER_SECTIONS.map((section, sIdx) => {
              const fields = PARTNER_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = partnerExpandedSections[section.id] ?? true
              const sectionNum = `0${sIdx + 1}`

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-shadow"
                >
                  {/* Section Accordion Header */}
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
                      {/* Bouton de traduction de la section entière */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTranslatePartnerSection(section.id)
                        }}
                        disabled={partnerSectionTranslating === section.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#007BFF] bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Traduire automatiquement la section « ${section.label} » vers l'anglais et l'allemand`}
                      >
                        {partnerSectionTranslating === section.id ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Traduction section...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire cette section</span>
                          </>
                        )}
                      </button>

                      {/* Bouton Masquer / Déplier */}
                      <button
                        type="button"
                        onClick={() => togglePartnerSection(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg cursor-pointer"
                      >
                        <span>{isExpanded ? "Masquer" : "Déplier"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 space-y-6 divide-y divide-slate-100">
                      {fields.map((field, idx) => {
                        const dbKey = field.isTranslatable ? getPartnerFieldDbKey(field.key, partnerLangTab) : field.key
                        const frKey = `${field.key}_fr`
                        const frValue = field.isTranslatable ? values[frKey] || "" : ""
                        const currentValue = values[dbKey] || ""

                        return (
                          <div key={field.key} className={idx > 0 ? "pt-6" : ""}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                  {field.label}
                                </label>
                                {field.required ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    Requis
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                    Optionnel
                                  </span>
                                )}
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                  {field.isTranslatable ? `Multilingue (${partnerLangTab})` : "Commun (Toutes langues)"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {partnerLangTab !== "FR" && field.isTranslatable && (
                                  <button
                                    type="button"
                                    onClick={() => handleTranslatePartnerSingleField(field.key, partnerLangTab)}
                                    disabled={partnerFieldTranslating === field.key || !frValue}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#007BFF] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-40 cursor-pointer"
                                    title="Traduire automatiquement ce champ spécifique depuis la source française"
                                  >
                                    {partnerFieldTranslating === field.key ? (
                                      <>
                                        <svg className="animate-spin w-3 h-3 text-[#007BFF]" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>Traduction...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                                        </svg>
                                        <span>Traduire ce champ</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <span className="text-[11px] font-mono text-slate-400">
                                  Clé BD : {dbKey}
                                </span>
                              </div>
                            </div>

                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                {field.description}
                              </p>
                            )}

                            {/* Reference source block in French when editing EN or DE */}
                            {partnerLangTab !== "FR" && field.isTranslatable && frValue && (
                              <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-2 font-bold text-[#003366] text-[11px] uppercase tracking-wider mb-1">
                                  <span>Référence source (Français) :</span>
                                  <button
                                    type="button"
                                    onClick={() => handleTranslatePartnerSingleField(field.key, partnerLangTab)}
                                    disabled={partnerFieldTranslating === field.key}
                                    className="text-[10px] font-semibold text-[#007BFF] hover:underline cursor-pointer lowercase"
                                  >
                                    traduire ce texte vers {partnerLangTab}
                                  </button>
                                </div>
                                <p className="italic leading-relaxed whitespace-pre-line text-slate-700">
                                  {frValue}
                                </p>
                              </div>
                            )}

                            {/* Field input according to type */}
                            {field.type === "image" ? (
                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                    placeholder="https://... ou /uploads/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-xs font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
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
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu actuel :
                                    </span>
                                    <div className="w-56 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display = "none"
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
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page « Partenaires » ({partnerLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les contenus"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET PAGE ADHÉSION / MEMBRES (CMS Dynamique 6 sections) ─── */}
      {activeTab === "MEMBERSHIP" && (
        <div className="space-y-6">
          {/* Header & Completeness Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Éditeur de la Page Adhésion & Membres</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Personnalisez les 6 sections, les 4 piliers d'impact, les modes d'engagement et le formulaire d'adhésion en français, anglais et allemand.
                </p>
              </div>

              {/* Multi-language Selector Sub-tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(["FR", "EN", "DE"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setMembershipLangTab(lang)
                      setMembershipNotice(null)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      membershipLangTab === lang
                        ? "bg-[#003366] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {lang === "FR" ? "Français" : lang === "EN" ? "English" : "Deutsch"}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic de complétude */}
            {(() => {
              const completeness = calculateMembershipCompleteness(values, membershipLangTab)
              return (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Complétude des contenus ({membershipLangTab}) :
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          completeness.percentage === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : completeness.percentage > 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {completeness.percentage}% ({completeness.filledCount}/{completeness.totalCount} champs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {membershipLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslateMembership(membershipLangTab === "EN" ? "EN" : "DE")}
                          disabled={membershipTranslating}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF] text-white hover:bg-[#0069d9] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {membershipTranslating ? (
                            <span>Traduction en cours...</span>
                          ) : (
                            <>
                              <span>Pré-remplir via Traduction IA</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completeness.percentage === 100
                          ? "bg-emerald-500"
                          : completeness.percentage > 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${completeness.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {membershipNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-medium ${
                  membershipNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : membershipNotice.type === "info"
                    ? "bg-blue-50 border border-blue-200 text-blue-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {membershipNotice.text}
              </div>
            )}
          </div>

          {/* Formulaire par Sections Accordéon */}
          <form onSubmit={handleSaveMembershipTab} className="space-y-6">
            {MEMBERSHIP_SECTIONS.map((section, sIdx) => {
              const fields = MEMBERSHIP_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = membershipExpandedSections[section.id] !== false
              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Section Header */}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleMembershipSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {membershipLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleTranslateMembershipSection(section.id, membershipLangTab === "EN" ? "EN" : "DE")}
                          disabled={membershipSectionTranslating === section.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {membershipSectionTranslating === section.id ? "Traduction..." : `Traduire cette section (${membershipLangTab})`}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleMembershipSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 bg-white">
                      {fields.map((field) => {
                        const dbKey = getMembershipFieldDbKey(field, membershipLangTab)
                        const currentValue = values[dbKey] || ""
                        const frReferenceKey = `${field.key}_fr`
                        const frReferenceValue = values[frReferenceKey]

                        return (
                          <div key={field.key} className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-bold text-slate-700">
                                {field.label}
                                {field.multilingual && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                                    {membershipLangTab}
                                  </span>
                                )}
                              </label>

                              {field.multilingual && membershipLangTab !== "FR" && frReferenceValue && (
                                <button
                                  type="button"
                                  onClick={() => handleTranslateMembershipSingleField(field.key, membershipLangTab === "EN" ? "EN" : "DE")}
                                  disabled={membershipFieldTranslating === field.key}
                                  className="text-[11px] font-semibold text-[#007BFF] hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {membershipFieldTranslating === field.key ? "Traduction..." : "Traduire depuis FR"}
                                </button>
                              )}
                            </div>

                            {/* Reference FR */}
                            {field.multilingual && membershipLangTab !== "FR" && frReferenceValue && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                                <span className="font-bold text-slate-700 block mb-0.5">Version Française de référence :</span>
                                <p className="italic">{frReferenceValue}</p>
                              </div>
                            )}

                            {field.type === "textarea" ? (
                              <textarea
                                rows={4}
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page « Adhésion & Membres » ({membershipLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les contenus"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET PAGE SOUTIEN (CMS COMPLET 6 SECTIONS) ─── */}
      {activeTab === "SUPPORT" && (
        <div className="space-y-6">
          {/* Header & Sub-Tabs Langues */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Gestionnaire de contenus : Page Soutien & Mécénat
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Configurez l&apos;ensemble des 6 sections, titres, axes d&apos;impact et boutons d&apos;action en 3 langues.
                </p>
              </div>

              {/* Lang switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
                {(["FR", "EN", "DE"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSupportLangTab(lang)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      supportLangTab === lang
                        ? "bg-white text-[#003366] shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {lang === "FR" ? "🇫🇷 Français" : lang === "EN" ? "🇬🇧 English" : "🇩🇪 Deutsch"}
                  </button>
                ))}
              </div>
            </div>

            {/* Completeness Bar & Auto-translate Button */}
            {(() => {
              const completeness = calculateSupportCompleteness(values, supportLangTab)
              return (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Complétude des contenus ({supportLangTab}) :
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          completeness.percentage === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : completeness.percentage > 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {completeness.percentage}% ({completeness.filledCount}/{completeness.totalCount} champs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {supportLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslateSupport(supportLangTab === "EN" ? "EN" : "DE")}
                          disabled={supportTranslating}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF] text-white hover:bg-[#0069d9] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {supportTranslating ? (
                            <span>Traduction en cours...</span>
                          ) : (
                            <>
                              <span>Pré-remplir via Traduction IA</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completeness.percentage === 100
                          ? "bg-emerald-500"
                          : completeness.percentage > 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${completeness.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {supportNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-medium ${
                  supportNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : supportNotice.type === "info"
                    ? "bg-blue-50 border border-blue-200 text-blue-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {supportNotice.text}
              </div>
            )}
          </div>

          {/* Formulaire par Sections Accordéon */}
          <form onSubmit={handleSaveSupportTab} className="space-y-6">
            {SUPPORT_SECTIONS.map((section, sIdx) => {
              const fields = SUPPORT_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = supportExpandedSections[section.id] !== false
              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Section Header */}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleSupportSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {supportLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleTranslateSupportSection(section.id, supportLangTab === "EN" ? "EN" : "DE")}
                          disabled={supportSectionTranslating === section.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {supportSectionTranslating === section.id ? "Traduction..." : `Traduire cette section (${supportLangTab})`}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleSupportSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 bg-white">
                      {fields.map((field) => {
                        const dbKey = getSupportFieldDbKey(field, supportLangTab)
                        const currentValue = values[dbKey] || ""
                        const frReferenceKey = `${field.key}_fr`
                        const frReferenceValue = values[frReferenceKey]

                        return (
                          <div key={field.key} className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-bold text-slate-700">
                                {field.label}
                                {field.multilingual && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                                    {supportLangTab}
                                  </span>
                                )}
                              </label>

                              {field.multilingual && supportLangTab !== "FR" && frReferenceValue && (
                                <button
                                  type="button"
                                  onClick={() => handleTranslateSupportSingleField(field.key, supportLangTab === "EN" ? "EN" : "DE")}
                                  disabled={supportFieldTranslating === field.key}
                                  className="text-[11px] font-semibold text-[#007BFF] hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {supportFieldTranslating === field.key ? "Traduction..." : "Traduire depuis FR"}
                                </button>
                              )}
                            </div>

                            {/* Reference FR */}
                            {field.multilingual && supportLangTab !== "FR" && frReferenceValue && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                                <span className="font-bold text-slate-700 block mb-0.5">Version Française de référence :</span>
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
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm font-mono text-slate-800"
                                  />
                                  <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
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
                                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                                      Aperçu :
                                    </span>
                                    <div className="w-48 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                                      <img
                                        src={currentValue}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLElement).style.display = "none"
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
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page « Soutien & Mécénat » ({supportLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les contenus"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET PAGE ACTUALITÉS (CMS COMPLET 2 SECTIONS) ─── */}
      {activeTab === "NEWS" && (
        <div className="space-y-6">
          {/* Header & Sub-Tabs Langues */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Gestionnaire de contenus : Page Actualités & Journal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Configurez l&apos;en-tête, le titre du journal et le bandeau d&apos;action de fin de page en 3 langues.
                </p>
              </div>

              {/* Lang switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
                {(["FR", "EN", "DE"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setNewsLangTab(lang)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      newsLangTab === lang
                        ? "bg-white text-[#003366] shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {lang === "FR" ? "🇫🇷 Français" : lang === "EN" ? "🇬🇧 English" : "🇩🇪 Deutsch"}
                  </button>
                ))}
              </div>
            </div>

            {/* Completeness Bar & Auto-translate Button */}
            {(() => {
              const completeness = calculateNewsCompleteness(values, newsLangTab)
              return (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Complétude des contenus ({newsLangTab}) :
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          completeness.percentage === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : completeness.percentage > 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {completeness.percentage}% ({completeness.filledCount}/{completeness.totalCount} champs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {newsLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslateNews(newsLangTab === "EN" ? "EN" : "DE")}
                          disabled={newsTranslating}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF] text-white hover:bg-[#0069d9] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {newsTranslating ? (
                            <span>Traduction en cours...</span>
                          ) : (
                            <>
                              <span>Pré-remplir via Traduction IA</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completeness.percentage === 100
                          ? "bg-emerald-500"
                          : completeness.percentage > 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${completeness.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {newsNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-medium ${
                  newsNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : newsNotice.type === "info"
                    ? "bg-blue-50 border border-blue-200 text-blue-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {newsNotice.text}
              </div>
            )}
          </div>

          {/* Formulaire par Sections Accordéon */}
          <form onSubmit={handleSaveNewsTab} className="space-y-6">
            {NEWS_SECTIONS.map((section, sIdx) => {
              const fields = NEWS_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = newsExpandedSections[section.id] !== false
              const sectionNum = String(sIdx + 1).padStart(2, "0")

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Section Header */}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleNewsSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {newsLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleTranslateNewsSection(section.id, newsLangTab === "EN" ? "EN" : "DE")}
                          disabled={newsSectionTranslating === section.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {newsSectionTranslating === section.id ? "Traduction..." : `Traduire cette section (${newsLangTab})`}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleNewsSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 bg-white">
                      {fields.map((field) => {
                        const dbKey = getNewsFieldDbKey(field, newsLangTab)
                        const currentValue = values[dbKey] || ""
                        const frReferenceKey = `${field.key}_fr`
                        const frReferenceValue = values[frReferenceKey]

                        return (
                          <div key={field.key} className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-bold text-slate-700">
                                {field.label}
                                {field.multilingual && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                                    {newsLangTab}
                                  </span>
                                )}
                              </label>

                              {field.multilingual && newsLangTab !== "FR" && frReferenceValue && (
                                <button
                                  type="button"
                                  onClick={() => handleTranslateNewsSingleField(field.key, newsLangTab === "EN" ? "EN" : "DE")}
                                  disabled={newsFieldTranslating === field.key}
                                  className="text-[11px] font-semibold text-[#007BFF] hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {newsFieldTranslating === field.key ? "Traduction..." : "Traduire depuis FR"}
                                </button>
                              )}
                            </div>

                            {/* Reference FR */}
                            {field.multilingual && newsLangTab !== "FR" && frReferenceValue && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                                <span className="font-bold text-slate-700 block mb-0.5">Version Française de référence :</span>
                                <p className="italic">{frReferenceValue}</p>
                              </div>
                            )}

                            {field.type === "textarea" ? (
                              <textarea
                                rows={3}
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page « Actualités » ({newsLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les contenus"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET PAGE CONTACT (CMS) ─── */}
      {activeTab === "CONTACT" && (
        <div className="space-y-6">
          {/* Header & Sub-Tabs Langues */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Gestionnaire de contenus : Page Contact
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Horaires, indication d&apos;accès, coordonnées GPS et configuration des emails de réception.
                </p>
              </div>

              {/* Lang switcher — uniquement pour les champs CONTENT */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
                {(["FR", "EN", "DE"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setContactLangTab(lang)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      contactLangTab === lang
                        ? "bg-white text-[#003366] shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {lang === "FR" ? "🇫🇷 Français" : lang === "EN" ? "🇬🇧 English" : "🇩🇪 Deutsch"}
                  </button>
                ))}
              </div>
            </div>

            {/* Completeness Bar & Auto-translate Button */}
            {(() => {
              const completeness = calculateContactCompleteness(values, contactLangTab)
              return (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Complétude des contenus ({contactLangTab}) :
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          completeness.percentage === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : completeness.percentage > 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {completeness.percentage}% ({completeness.filledCount}/{completeness.totalCount} champs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {contactLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleAutoTranslateContact(contactLangTab === "EN" ? "EN" : "DE")}
                          disabled={contactTranslating}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF] text-white hover:bg-[#0069d9] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {contactTranslating ? (
                            <span>Traduction en cours...</span>
                          ) : (
                            <>
                              <span>Pré-remplir via Traduction IA</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completeness.percentage === 100
                          ? "bg-emerald-500"
                          : completeness.percentage > 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${completeness.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {contactNotice && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm font-medium ${
                  contactNotice.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : contactNotice.type === "info"
                    ? "bg-blue-50 border border-blue-200 text-blue-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {contactNotice.text}
              </div>
            )}
          </div>

          {/* Formulaire par Sections Accordéon */}
          <form onSubmit={handleSaveContactTab} className="space-y-6">
            {CONTACT_SECTIONS.map((section, sIdx) => {
              const fields = CONTACT_FIELDS.filter((f) => f.section === section.id)
              const isExpanded = contactExpandedSections[section.id] !== false
              const sectionNum = String(sIdx + 1).padStart(2, "0")
              const hasMultilingualFields = fields.some((f) => f.multilingual)

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Section Header */}
                  <div className="w-full px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div
                      onClick={() => toggleContactSection(section.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#003366] shrink-0">
                        {sectionNum}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {hasMultilingualFields && contactLangTab !== "FR" && (
                        <button
                          type="button"
                          onClick={() => handleTranslateContactSection(section.id, contactLangTab === "EN" ? "EN" : "DE")}
                          disabled={contactSectionTranslating === section.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {contactSectionTranslating === section.id ? "Traduction..." : `Traduire cette section (${contactLangTab})`}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleContactSection(section.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <span className="text-xs font-bold">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 bg-white">
                      {fields.map((field) => {
                        const dbKey = getContactFieldDbKey(field, contactLangTab)
                        const currentValue = values[dbKey] || ""
                        const frReferenceKey = `${field.key}_fr`
                        const frReferenceValue = values[frReferenceKey]

                        return (
                          <div key={field.key + (field.multilingual ? contactLangTab : "")} className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-bold text-slate-700">
                                {field.label}
                                {field.multilingual && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                                    {contactLangTab}
                                  </span>
                                )}
                                {!field.multilingual && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-mono">
                                    CONFIG
                                  </span>
                                )}
                              </label>

                              {field.multilingual && contactLangTab !== "FR" && frReferenceValue && (
                                <button
                                  type="button"
                                  onClick={() => handleTranslateContactSingleField(field.key, contactLangTab === "EN" ? "EN" : "DE")}
                                  disabled={contactFieldTranslating === field.key}
                                  className="text-[11px] font-semibold text-[#007BFF] hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {contactFieldTranslating === field.key ? "Traduction..." : "Traduire depuis FR"}
                                </button>
                              )}
                            </div>

                            {field.description && (
                              <p className="text-[11px] text-slate-400 leading-relaxed">{field.description}</p>
                            )}

                            {/* Reference FR */}
                            {field.multilingual && contactLangTab !== "FR" && frReferenceValue && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                                <span className="font-bold text-slate-700 block mb-0.5">Version Française de référence :</span>
                                <p className="italic">{frReferenceValue}</p>
                              </div>
                            )}

                            {field.type === "textarea" ? (
                              <textarea
                                rows={3}
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                placeholder={field.placeholder || ""}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleInputChange(dbKey, e.target.value)}
                                placeholder={field.placeholder || ""}
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

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#28A745] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Modifications de la page Contact ({contactLangTab})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement en cours..." : "Enregistrer tous les paramètres"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── ONGLET SETTINGS GÉNÉRAUX & MÉDIAS ─── */}
      {activeTab !== "TEAM" && activeTab !== "ABOUT" && activeTab !== "VOLUNTEER" && activeTab !== "PARTNER" && activeTab !== "MEMBERSHIP" && activeTab !== "SUPPORT" && activeTab !== "NEWS" && activeTab !== "CONTACT" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Chargement des paramètres...</div>
          ) : (
            <form onSubmit={handleSaveTab} className="space-y-8">
              {statusMessage && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border border-rose-200 text-rose-800"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

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
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            placeholder="https://... ou /uploads/..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm font-mono text-slate-800"
                          />
                          <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shrink-0">
                            <span>
                              {uploadingSettingKey === field.key ? "Téléversement..." : "Choisir une image"}
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
                                  ;(e.target as HTMLElement).style.display = "none"
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
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800"
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm text-slate-800"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ─── MODAL D'AJOUT / ÉDITION D'UN MEMBRE DE L'ÉQUIPE ─── */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-[#003366]">
                {editingMember ? `Modifier : ${editingMember.name}` : "Ajouter un membre à l'équipe"}
              </h3>
              <button
                onClick={() => setTeamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {teamFormError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {teamFormError}
              </div>
            )}

            <form onSubmit={handleTeamFormSubmit} className="space-y-6">
              {/* Photo Portrait OBLIGATOIRE avec sélection réelle de fichier */}
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
                      <img src={teamFormData.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                    ) : (
                      <span>
                        {teamFormData.name
                          ? teamFormData.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                          : "PHOTO"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                        <svg className="w-4 h-4 text-[#007BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{uploadingImage ? "Téléversement en cours..." : "Sélectionner une photo"}</span>
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
                          onClick={() => setTeamFormData((prev) => ({ ...prev, photoUrl: "" }))}
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

              {/* Informations générales (Nom & Catégorie) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                    placeholder="ex: Dr. Yao Mensah"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Catégorie / Groupe *
                  </label>
                  <select
                    value={teamFormData.category}
                    onChange={(e) => setTeamFormData({ ...teamFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                  >
                    <option value="DIRECTION">Direction & Fondateurs</option>
                    <option value="COORDINATION">Coordination & Pédagogie</option>
                    <option value="FORMATION">Formateurs & FabLab</option>
                    <option value="CONSEIL">Conseil scientifique & Experts</option>
                    <option value="VOLONTAIRE">Volontaires & Bénévoles</option>
                  </select>
                </div>
              </div>

              {/* ─── Onglets de langues pour la fonction et la biographie ─── */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider block">
                      Contenu multilingue (Rôle &amp; Biographie)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Renseignez le français, puis traduisez automatiquement vers l&apos;anglais et l&apos;allemand.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoTranslateTeamMember}
                      disabled={teamTranslating || !teamFormData.roleFr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      title="Traduit automatiquement le rôle et la biographie vers l'anglais et l'allemand"
                    >
                      {teamTranslating ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Traduction...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                          </svg>
                          <span>Traduire vers EN &amp; DE</span>
                        </>
                      )}
                    </button>

                    <div className="flex bg-white rounded-xl p-1 border border-slate-200 gap-1">
                      {(["FR", "EN", "DE"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setMemberLangTab(l)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            memberLangTab === l
                              ? "bg-[#003366] text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {l === "FR" ? "Français *" : l === "EN" ? "English" : "Deutsch"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {teamTranslateNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                    <span>{teamTranslateNotice.text}</span>
                    <button
                      type="button"
                      onClick={() => setTeamTranslateNotice(null)}
                      className="text-xs font-bold underline ml-2 cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                )}

                {/* Contenu FR */}
                {memberLangTab === "FR" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Fonction / Rôle (Français) *
                      </label>
                      <input
                        type="text"
                        required
                        value={teamFormData.roleFr}
                        onChange={(e) => setTeamFormData({ ...teamFormData, roleFr: e.target.value })}
                        placeholder="ex: Coordinatrice des Programmes & Pédagogie"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Biographie (Français - Optionnelle)
                      </label>
                      <textarea
                        rows={3}
                        value={teamFormData.bioFr}
                        onChange={(e) => setTeamFormData({ ...teamFormData, bioFr: e.target.value })}
                        placeholder="Présentation du parcours, missions principales et engagement..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Contenu EN */}
                {memberLangTab === "EN" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Title / Role (English - Optional)
                        </label>
                        {teamFormData.roleFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleTeamField("role", "EN")}
                            disabled={teamTranslating}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire ce champ</span>
                          </button>
                        )}
                      </div>
                      {teamFormData.roleFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {teamFormData.roleFr}
                        </div>
                      )}
                      <input
                        type="text"
                        value={teamFormData.roleEn}
                        onChange={(e) => setTeamFormData({ ...teamFormData, roleEn: e.target.value })}
                        placeholder="ex: Program & Pedagogy Coordinator"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Biography (English - Optional)
                        </label>
                        {teamFormData.bioFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleTeamField("bio", "EN")}
                            disabled={teamTranslating}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire ce champ</span>
                          </button>
                        )}
                      </div>
                      {teamFormData.bioFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {teamFormData.bioFr}
                        </div>
                      )}
                      <textarea
                        rows={3}
                        value={teamFormData.bioEn}
                        onChange={(e) => setTeamFormData({ ...teamFormData, bioEn: e.target.value })}
                        placeholder="Short presentation in English..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Contenu DE */}
                {memberLangTab === "DE" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Funktion / Rolle (Deutsch - Optional)
                        </label>
                        {teamFormData.roleFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleTeamField("role", "DE")}
                            disabled={teamTranslating}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire ce champ</span>
                          </button>
                        )}
                      </div>
                      {teamFormData.roleFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {teamFormData.roleFr}
                        </div>
                      )}
                      <input
                        type="text"
                        value={teamFormData.roleDe}
                        onChange={(e) => setTeamFormData({ ...teamFormData, roleDe: e.target.value })}
                        placeholder="ex: Programmkoordinatorin"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Biografie (Deutsch - Optional)
                        </label>
                        {teamFormData.bioFr && (
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleTeamField("bio", "DE")}
                            disabled={teamTranslating}
                            className="text-[11px] font-bold text-[#007BFF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9c-1.85-3.32-3.8-6.42-5.412-9m0 0a24.25 24.25 0 00-2.088 4.5M15.5 15l2.5 5 2.5-5m-4.5 3h4" />
                            </svg>
                            <span>Traduire ce champ</span>
                          </button>
                        )}
                      </div>
                      {teamFormData.bioFr && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 italic">
                          Source (FR) : {teamFormData.bioFr}
                        </div>
                      )}
                      <textarea
                        rows={3}
                        value={teamFormData.bioDe}
                        onChange={(e) => setTeamFormData({ ...teamFormData, bioDe: e.target.value })}
                        placeholder="Kurze Biografie auf Deutsch..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Email & Ordre */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email de contact (Optionnel)
                  </label>
                  <input
                    type="email"
                    value={teamFormData.email}
                    onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                    placeholder="ex: contact@aptic-r.org"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ordre d&apos;affichage
                  </label>
                  <input
                    type="number"
                    value={teamFormData.order}
                    onChange={(e) => setTeamFormData({ ...teamFormData, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Compétences (Optionnelles) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Compétences clés (Optionnelles, séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={teamFormData.skillsInput}
                  onChange={(e) => setTeamFormData({ ...teamFormData, skillsInput: e.target.value })}
                  placeholder="ex: Pédagogie, FabLab, Agro-écologie"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={teamFormData.active}
                  onChange={(e) => setTeamFormData({ ...teamFormData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#003366] focus:ring-[#003366]"
                />
                <label htmlFor="active" className="text-xs font-semibold text-slate-700">
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
                    disabled={!isFormValid || teamFormSubmitting || uploadingImage}
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
