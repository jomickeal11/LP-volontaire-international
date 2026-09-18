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
  { id: "SUPPORT", label: "Page Soutien" },
  { id: "MEMBERSHIP", label: "Page Devenir membre" },
  { id: "ABOUT", label: "Page À Propos" },
  { id: "VOLUNTEER", label: "Page Volontariat" },
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
  ABOUT: [
    {
      key: "about_story_image",
      label: "Photo du récit documentaire",
      description: "Photo de terrain montrant les actions et l'ancrage à Agbélouvé.",
      type: "image",
    },
    {
      key: "foundation_year",
      label: "Année de création de l'initiative",
      description: "Année de départ des premières actions terrain (ex: 2018).",
      type: "text",
    },
    {
      key: "formalization_year",
      label: "Année d'enregistrement officiel",
      description: "Année d'obtention du récépissé préfectoral (ex: 2020).",
      type: "text",
    },
    {
      key: "about_story_location",
      label: "Lieu mentionné sur la photo",
      description: "Légende de localisation (ex: Agbélouvé, Région Maritime).",
      type: "text",
    },
  ],
  VOLUNTEER: [
    {
      key: "volunteer_hero_image",
      label: "Photo d'ambiance Volontariat (Hero)",
      description: "Image de fond en haute définition pour la bannière principale.",
      type: "image",
    },
    {
      key: "volunteer_contact_whatsapp",
      label: "Numéro WhatsApp du tuteur de mission",
      description: "Numéro avec indicatif international (ex: +228 91 20 19 90).",
      type: "text",
    },
  ],
  GENERAL: [
    {
      key: "site_contact_email",
      label: "Email institutionnel principal",
      description: "Adresse email affichée dans le pied de page et les formulaires.",
      type: "text",
    },
    {
      key: "site_contact_phone",
      label: "Téléphone standard / Siège",
      description: "Numéro de contact officiel du siège d'Agbélouvé.",
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
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#28A745]" />
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

      {/* ─── ONGLET SETTINGS GÉNÉRAUX & MÉDIAS ─── */}
      {activeTab !== "TEAM" && (
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
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#28A745]" />
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                    Contenu multilingue (Rôle & Biographie)
                  </span>
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
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Title / Role (English - Optional)
                      </label>
                      <input
                        type="text"
                        value={teamFormData.roleEn}
                        onChange={(e) => setTeamFormData({ ...teamFormData, roleEn: e.target.value })}
                        placeholder="ex: Program & Pedagogy Coordinator"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Biography (English - Optional)
                      </label>
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
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Funktion / Rolle (Deutsch - Optional)
                      </label>
                      <input
                        type="text"
                        value={teamFormData.roleDe}
                        onChange={(e) => setTeamFormData({ ...teamFormData, roleDe: e.target.value })}
                        placeholder="ex: Programmkoordinatorin"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 outline-none text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Biografie (Deutsch - Optional)
                      </label>
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
