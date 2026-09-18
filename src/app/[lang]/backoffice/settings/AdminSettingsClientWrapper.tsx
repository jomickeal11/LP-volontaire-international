"use client"

import React, { useState, useEffect } from "react"
import { getSiteSettings, updateSiteSettings } from "@/lib/cms-actions"

interface AdminSettingsClientWrapperProps {
  lang: string
}

export default function AdminSettingsClientWrapper({ lang }: AdminSettingsClientWrapperProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form states aligned with Cahier des Charges Version 1.0
  const [form, setForm] = useState({
    // Dates institutionnelles (Cahier des charges Version 1.0)
    foundation_year: "2018",
    formalization_year: "2020",

    // Institutional Contact (Cahier des charges Version 1.0)
    contact_director: "DAGNON Komal",
    contact_phone: "+228 91 20 19 90",
    contact_phone_desc: "Lundi – Vendredi, 08h00 – 18h00 GMT",
    contact_email: "aptic.rural19@gmail.com",
    contact_address: "Agbélouvé — Centre communautaire, Préfecture du Zio, Région Maritime, Togo",
    contact_access_info: "À 65 km au nord de Lomé sur la route nationale RN1 (axe Lomé-Tsévié-Atakpamé).",
    contact_location_city: "Agbélouvé, Région Maritime",

    // Working Hours
    contact_hours_week: "Lundi – Vendredi : 08h00 – 18h00 GMT",
    contact_hours_sat: "Samedi : 09h00 – 14h00 (Ateliers jeunes)",
    contact_hours_sun: "Dimanche : Fermé",

    // Specialized inboxes
    contact_email_general: "contact@aptic-r.org",
    contact_email_volunteer: "volontariat@aptic-r.org",
    contact_email_programs: "programmes@aptic-r.org",
    contact_email_direction: "direction@aptic-r.org",

    // About Page Visuals & Story Media
    about_story_image: "/photo-recit-documentaire.jpg",
    about_story_tag: "Ancrage communautaire",
    about_story_location: "Agbélouvé, Région Maritime",

    // Volunteer Mission & Home Visuals
    home_hero_title: "LE NUMÉRIQUE AU SERVICE DES TERRITOIRES RURAUX",
    home_hero_subtitle: "Nous développons des initiatives numériques, des compétences et des solutions innovantes adaptées aux besoins des communautés rurales au Togo.",
    volunteer_hero_image: "/togo-volunteer.jpg",

    // Photos & Légendes des 6 Domaines d'Intervention
    domain_photo_inclusion: "/photo-ancrage-togo.png",
    domain_caption_inclusion: "Atelier d'alphabétisation numérique et équipement solaire à Agbélouvé",
    domain_photo_jeunesse: "/hero-volunteer-collab.jpg",
    domain_caption_jeunesse: "Formation des jeunes aux métiers du web et du code",
    domain_photo_cyber: "/togo-volunteer.jpg",
    domain_caption_cyber: "Sensibilisation communautaire à la sécurité mobile et numérique",
    domain_photo_agri: "/photo-projet-phare.jpg",
    domain_caption_agri: "Capteurs d'irrigation et innovations Low-Tech pour les groupements maraîchers",
    domain_photo_data: "/photo-recit-documentaire.jpg",
    domain_caption_data: "Collecte de données participative et cartographie des ressources rurales",
    domain_photo_rural: "/meeting-org.jpg",
    domain_caption_rural: "Tiers-lieu FabLab et artisanat connecté au cœur du territoire",

    // Social Links
    social_whatsapp: "+22891201990",
    social_facebook: "https://facebook.com/apticr",
    social_linkedin: "https://linkedin.com/company/aptic-r",
    social_instagram: "https://instagram.com/aptic_r",
    social_youtube: "",
  })

  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        if (res.success && res.dict) {
          setForm((prev) => ({
            ...prev,
            ...res.dict,
          }))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    const entries = [
      { key: "foundation_year", value: form.foundation_year, group: "ABOUT", description: "Année de fondation/création de l'association" },
      { key: "formalization_year", value: form.formalization_year, group: "ABOUT", description: "Année de formalisation officielle (Loi 1901)" },

      { key: "contact_director", value: form.contact_director, group: "CONTACT", description: "Nom du directeur exécutif" },
      { key: "contact_phone", value: form.contact_phone, group: "CONTACT", description: "Téléphone officiel" },
      { key: "contact_phone_desc", value: form.contact_phone_desc, group: "CONTACT", description: "Disponibilité téléphonique" },
      { key: "contact_email", value: form.contact_email, group: "CONTACT", description: "Email institutionnel" },
      { key: "contact_address", value: form.contact_address, group: "CONTACT", description: "Adresse postale / siège" },
      { key: "contact_access_info", value: form.contact_access_info, group: "CONTACT", description: "Consignes d'accès et localisation" },
      { key: "contact_location_city", value: form.contact_location_city, group: "CONTACT", description: "Base opérationnelle" },

      { key: "contact_hours_week", value: form.contact_hours_week, group: "CONTACT", description: "Horaires en semaine" },
      { key: "contact_hours_sat", value: form.contact_hours_sat, group: "CONTACT", description: "Horaires le samedi" },
      { key: "contact_hours_sun", value: form.contact_hours_sun, group: "CONTACT", description: "Horaires le dimanche" },

      { key: "contact_email_general", value: form.contact_email_general, group: "CONTACT", description: "Email accueil et info générale" },
      { key: "contact_email_volunteer", value: form.contact_email_volunteer, group: "CONTACT", description: "Email volontariat et missions" },
      { key: "contact_email_programs", value: form.contact_email_programs, group: "CONTACT", description: "Email programmes et partenariats" },
      { key: "contact_email_direction", value: form.contact_email_direction, group: "CONTACT", description: "Email direction exécutive" },

      { key: "about_story_image", value: form.about_story_image, group: "ABOUT", description: "Image de la section Notre Histoire" },
      { key: "about_story_tag", value: form.about_story_tag, group: "ABOUT", description: "Tag d'overlay de l'image Histoire" },
      { key: "about_story_location", value: form.about_story_location, group: "ABOUT", description: "Lieu d'overlay de l'image Histoire" },

      { key: "home_hero_title", value: form.home_hero_title, group: "HOME", description: "Titre Hero Accueil" },
      { key: "home_hero_subtitle", value: form.home_hero_subtitle, group: "HOME", description: "Sous-titre Hero Accueil" },
      { key: "volunteer_hero_image", value: form.volunteer_hero_image, group: "VOLUNTEER", description: "Visuel Hero Volontariat" },

      // Photos & Légendes des 6 Domaines
      { key: "domain_photo_inclusion", value: form.domain_photo_inclusion, group: "DOMAINS", description: "Photo Domaine 01 Inclusion" },
      { key: "domain_caption_inclusion", value: form.domain_caption_inclusion, group: "DOMAINS", description: "Légende Domaine 01 Inclusion" },
      { key: "domain_photo_jeunesse", value: form.domain_photo_jeunesse, group: "DOMAINS", description: "Photo Domaine 02 Jeunesse" },
      { key: "domain_caption_jeunesse", value: form.domain_caption_jeunesse, group: "DOMAINS", description: "Légende Domaine 02 Jeunesse" },
      { key: "domain_photo_cyber", value: form.domain_photo_cyber, group: "DOMAINS", description: "Photo Domaine 03 Cybersécurité" },
      { key: "domain_caption_cyber", value: form.domain_caption_cyber, group: "DOMAINS", description: "Légende Domaine 03 Cybersécurité" },
      { key: "domain_photo_agri", value: form.domain_photo_agri, group: "DOMAINS", description: "Photo Domaine 04 Agriculture" },
      { key: "domain_caption_agri", value: form.domain_caption_agri, group: "DOMAINS", description: "Légende Domaine 04 Agriculture" },
      { key: "domain_photo_data", value: form.domain_photo_data, group: "DOMAINS", description: "Photo Domaine 05 Données" },
      { key: "domain_caption_data", value: form.domain_caption_data, group: "DOMAINS", description: "Légende Domaine 05 Données" },
      { key: "domain_photo_rural", value: form.domain_photo_rural, group: "DOMAINS", description: "Photo Domaine 06 Dév Rural" },
      { key: "domain_caption_rural", value: form.domain_caption_rural, group: "DOMAINS", description: "Légende Domaine 06 Dév Rural" },

      { key: "social_whatsapp", value: form.social_whatsapp, group: "SOCIAL", description: "Numéro WhatsApp officiel" },
      { key: "social_facebook", value: form.social_facebook, group: "SOCIAL", description: "Lien page Facebook" },
      { key: "social_linkedin", value: form.social_linkedin, group: "SOCIAL", description: "Lien page LinkedIn" },
      { key: "social_instagram", value: form.social_instagram, group: "SOCIAL", description: "Lien page Instagram" },
      { key: "social_youtube", value: form.social_youtube, group: "SOCIAL", description: "Chaîne YouTube" },
    ]

    const res = await updateSiteSettings(entries)
    setSaving(false)
    if (res.success) {
      setSuccessMessage("Tous les paramètres et médias du site ont été enregistrés avec succès !")
      setTimeout(() => setSuccessMessage(null), 5000)
    } else {
      setErrorMessage(res.error || "Erreur lors de l'enregistrement.")
    }
  }

  // Predefined options of high quality images in public folder
  const availableImages = [
    { url: "/photo-recit-documentaire.jpg", label: "Récit Documentaire (Terrain)" },
    { url: "/photo-ancrage-togo.png", label: "Ancrage Togo (Bénéficiaire)" },
    { url: "/photo-projet-phare.jpg", label: "Projet Phare (FabLab / Équipement)" },
    { url: "/togo-volunteer.jpg", label: "Volontariat Terrain" },
    { url: "/meeting-org.jpg", label: "Réunion & Gouvernance" },
    { url: "/hero-volunteer-collab.jpg", label: "Collaboration Interculturelle" },
  ]

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Chargement des paramètres du site...
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2B3C]">
          Paramètres & Médias du Site
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les coordonnées officielles (cahier des charges V1.0) et les visuels stratégiques des pages publiques.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ── Section 1 : Médias Page À Propos ── */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#28A745] block mb-1">
              Page « À Propos »
            </span>
            <h2 className="text-lg font-bold text-[#003366]">
              Visuel de la section « Notre Histoire »
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choisissez l'image documentaire à afficher à côté de la narration de création de l'association.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Aperçu actuel
              </label>
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200 shadow-inner">
                <img
                  src={form.about_story_image}
                  alt="Aperçu Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/85 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="text-white/90 text-[10px] uppercase tracking-wider font-semibold">
                    {form.about_story_tag}
                  </div>
                  <div className="text-white text-sm font-bold">
                    {form.about_story_location}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sélectionner parmi les photos disponibles
                </label>
                <select
                  name="about_story_image"
                  value={form.about_story_image}
                  onChange={(e) => setForm((prev) => ({ ...prev, about_story_image: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label} ({img.url})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ou saisir une URL personnalisée d'image
                </label>
                <input
                  type="text"
                  name="about_story_image"
                  value={form.about_story_image}
                  onChange={handleChange}
                  placeholder="/chemin-image.jpg ou https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tag d'overlay
                  </label>
                  <input
                    type="text"
                    name="about_story_tag"
                    value={form.about_story_tag}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lieu d'overlay
                  </label>
                  <input
                    type="text"
                    name="about_story_location"
                    value={form.about_story_location}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Année de création / fondation
                  </label>
                  <input
                    type="text"
                    name="foundation_year"
                    value={form.foundation_year}
                    onChange={handleChange}
                    placeholder="2018"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Année de formalisation (Loi 1901)
                  </label>
                  <input
                    type="text"
                    name="formalization_year"
                    value={form.formalization_year}
                    onChange={handleChange}
                    placeholder="2020"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2 : Coordonnées Officielles (Cahier des charges V1.0) ── */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007BFF] block mb-1">
              Informations Institutionnelles (Cahier des charges)
            </span>
            <h2 className="text-lg font-bold text-[#003366]">
              Coordonnées & Direction
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ces informations alimentent la page Contact, le Footer et les mentions officielles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Directeur exécutif
              </label>
              <input
                type="text"
                name="contact_director"
                value={form.contact_director}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Téléphone officiel
              </label>
              <input
                type="text"
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disponibilité téléphonique (horaires)
              </label>
              <input
                type="text"
                name="contact_phone_desc"
                value={form.contact_phone_desc}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Numéro WhatsApp
              </label>
              <input
                type="text"
                name="social_whatsapp"
                value={form.social_whatsapp}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail officiel principal
              </label>
              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse postale & Siège (Togo)
              </label>
              <input
                type="text"
                name="contact_address"
                value={form.contact_address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consignes d'accès & localisation (ex: 65 km au nord de Lomé...)
              </label>
              <input
                type="text"
                name="contact_access_info"
                value={form.contact_access_info}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            {/* Horaires d'ouverture */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003366] mb-3">
                Horaires d'Ouverture du FabLab & Siège
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semaine (Lun–Ven)</label>
                  <input
                    type="text"
                    name="contact_hours_week"
                    value={form.contact_hours_week}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Samedi</label>
                  <input
                    type="text"
                    name="contact_hours_sat"
                    value={form.contact_hours_sat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dimanche</label>
                  <input
                    type="text"
                    name="contact_hours_sun"
                    value={form.contact_hours_sun}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Adresses emails spécialisées */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003366] mb-3">
                Contacts Spécialisés (Adresses directes)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Informations Générales & Accueil</label>
                  <input
                    type="email"
                    name="contact_email_general"
                    value={form.contact_email_general}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Volontariat & Missions</label>
                  <input
                    type="email"
                    name="contact_email_volunteer"
                    value={form.contact_email_volunteer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Programmes & Partenariats</label>
                  <input
                    type="email"
                    name="contact_email_programs"
                    value={form.contact_email_programs}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Direction Exécutive</label>
                  <input
                    type="email"
                    name="contact_email_direction"
                    value={form.contact_email_direction}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Section 3 : Photographies & Légendes des 6 Domaines d'Intervention ── */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003366] block mb-1">
              Page « Nos Domaines » & Page d'Accueil
            </span>
            <h2 className="text-lg font-bold text-[#003366]">
              Photographies documentaires des 6 Domaines d'Intervention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personnalisez les photos de terrain et légendes qui illustrent chacun des 6 pôles stratégiques sur le site.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domaine 01 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003366] bg-slate-200 px-2 py-0.5 rounded">01</span>
                <span className="text-xs font-bold text-slate-700">Inclusion Numérique</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo (sélectionner ou URL)</label>
                <select
                  name="domain_photo_inclusion"
                  value={form.domain_photo_inclusion}
                  onChange={(e) => setForm((prev) => ({ ...prev, domain_photo_inclusion: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>{img.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="domain_photo_inclusion"
                  value={form.domain_photo_inclusion}
                  onChange={handleChange}
                  placeholder="/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Légende de terrain</label>
                <input
                  type="text"
                  name="domain_caption_inclusion"
                  value={form.domain_caption_inclusion}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Domaine 02 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003366] bg-slate-200 px-2 py-0.5 rounded">02</span>
                <span className="text-xs font-bold text-slate-700">Jeunesse & Éducation</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo (sélectionner ou URL)</label>
                <select
                  name="domain_photo_jeunesse"
                  value={form.domain_photo_jeunesse}
                  onChange={(e) => setForm((prev) => ({ ...prev, domain_photo_jeunesse: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>{img.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="domain_photo_jeunesse"
                  value={form.domain_photo_jeunesse}
                  onChange={handleChange}
                  placeholder="/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Légende de terrain</label>
                <input
                  type="text"
                  name="domain_caption_jeunesse"
                  value={form.domain_caption_jeunesse}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Domaine 03 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003366] bg-slate-200 px-2 py-0.5 rounded">03</span>
                <span className="text-xs font-bold text-slate-700">Cybersécurité & Citoyenneté</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo (sélectionner ou URL)</label>
                <select
                  name="domain_photo_cyber"
                  value={form.domain_photo_cyber}
                  onChange={(e) => setForm((prev) => ({ ...prev, domain_photo_cyber: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>{img.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="domain_photo_cyber"
                  value={form.domain_photo_cyber}
                  onChange={handleChange}
                  placeholder="/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Légende de terrain</label>
                <input
                  type="text"
                  name="domain_caption_cyber"
                  value={form.domain_caption_cyber}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Domaine 04 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003366] bg-slate-200 px-2 py-0.5 rounded">04</span>
                <span className="text-xs font-bold text-slate-700">Agriculture & Low-Tech</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo (sélectionner ou URL)</label>
                <select
                  name="domain_photo_agri"
                  value={form.domain_photo_agri}
                  onChange={(e) => setForm((prev) => ({ ...prev, domain_photo_agri: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>{img.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="domain_photo_agri"
                  value={form.domain_photo_agri}
                  onChange={handleChange}
                  placeholder="/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Légende de terrain</label>
                <input
                  type="text"
                  name="domain_caption_agri"
                  value={form.domain_caption_agri}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Domaine 05 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003366] bg-slate-200 px-2 py-0.5 rounded">05</span>
                <span className="text-xs font-bold text-slate-700">Données & Innovation</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo (sélectionner ou URL)</label>
                <select
                  name="domain_photo_data"
                  value={form.domain_photo_data}
                  onChange={(e) => setForm((prev) => ({ ...prev, domain_photo_data: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>{img.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="domain_photo_data"
                  value={form.domain_photo_data}
                  onChange={handleChange}
                  placeholder="/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Légende de terrain</label>
                <input
                  type="text"
                  name="domain_caption_data"
                  value={form.domain_caption_data}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Domaine 06 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003366] bg-slate-200 px-2 py-0.5 rounded">06</span>
                <span className="text-xs font-bold text-slate-700">Développement Rural & FabLabs</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo (sélectionner ou URL)</label>
                <select
                  name="domain_photo_rural"
                  value={form.domain_photo_rural}
                  onChange={(e) => setForm((prev) => ({ ...prev, domain_photo_rural: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.url} value={img.url}>{img.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="domain_photo_rural"
                  value={form.domain_photo_rural}
                  onChange={handleChange}
                  placeholder="/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Légende de terrain</label>
                <input
                  type="text"
                  name="domain_caption_rural"
                  value={form.domain_caption_rural}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4 : Réseaux Sociaux ── */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003366] block mb-1">
              Réseaux Sociaux
            </span>
            <h2 className="text-lg font-bold text-[#003366]">
              Liens de communication
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facebook</label>
              <input
                type="text"
                name="social_facebook"
                value={form.social_facebook}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn</label>
              <input
                type="text"
                name="social_linkedin"
                value={form.social_linkedin}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instagram</label>
              <input
                type="text"
                name="social_instagram"
                value={form.social_instagram}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube</label>
              <input
                type="text"
                name="social_youtube"
                value={form.social_youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-bold text-sm bg-[#003366] text-white hover:bg-[#007BFF] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
