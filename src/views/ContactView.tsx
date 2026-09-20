"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import RequiredAsterisk from "@/components/RequiredAsterisk"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface ContactViewProps {
  lang: Language
}

const BG_HERO = "#F7F8FA"
const BG_SECTION_ALT = "#F7F8FA"

const I18N = {
  FR: {
    badge: "CONTACT",
    title: "Contactez l’équipe APTIC-R",
    subtitle:
      "Une question, un projet, une candidature ou une proposition de partenariat ? Notre équipe est à votre écoute.",
    infoTitle: "INFORMATIONS & ACCÈS",
    headquartersLabel: "SIÈGE SOCIAL & FABLAB",
    headquartersAddress: "Agbélouvé — Centre communautaire\nPréfecture du Zio, Région Maritime\nTogo (Afrique de l'Ouest)",
    accessInfo: "À 65 km au nord de Lomé sur la route nationale RN1 (axe Lomé-Tsévié-Atakpamé).",
    phoneLabel: "TÉLÉPHONE & WHATSAPP",
    phoneNum: "+228 91 20 19 90",
    phoneDesc: "Lundi – Vendredi, 08h00 – 18h00 GMT",
    emailLabel: "EMAIL GÉNÉRAL",
    emailMain: "aptic.rural19@gmail.com",
    hoursLabel: "HORAIRES D'OUVERTURE",
    hoursFablab: "Lundi – Vendredi : 08h00 – 18h00 GMT",
    hoursSat: "Samedi : 09h00 – 14h00 (Ateliers jeunes)",
    hoursSun: "Dimanche : Fermé",
    whatsappBtn: "Échanger sur WhatsApp",
    formSectionTitle: "ENVOYEZ-NOUS UN MESSAGE",
    formSubtitle: "Remplissez ce formulaire et notre équipe vous répondra sous 48 heures ouvrées.",
    fieldName: "Nom complet",
    namePlaceholder: "ex: Jean Dupont",
    fieldEmail: "Adresse email",
    emailPlaceholder: "ex: jean.dupont@exemple.org",
    fieldOrg: "Organisation / Institution",
    fieldOrgOptional: "(facultatif)",
    orgPlaceholder: "ex: ONG, Mairie, Université...",
    fieldPhone: "Téléphone / WhatsApp",
    fieldPhoneOptional: "(facultatif)",
    phonePlaceholder: "+228 90 00 00 00",
    fieldSubject: "Sujet de votre demande",
    subjectSelect: "Sélectionnez un motif",
    subjectGeneral: "Information générale",
    subjectVolontariat: "Candidature / Volontariat",
    subjectPartenariat: "Partenariat institutionnel & Projets",
    subjectFablab: "Formations & FabLab d'Agbélouvé",
    subjectMedia: "Presse & Médias",
    subjectOther: "Autre demande",
    fieldMessage: "Votre message",
    messagePlaceholder: "Précisez votre demande ou votre projet...",
    fieldConsent: "J'accepte que mes coordonnées soient traitées par APTIC-R pour répondre à ma demande.",
    submitBtn: "Envoyer le message",
    submitting: "Envoi en cours...",
    successTitle: "Message Envoyé !",
    successMsg: "Votre message a été transmis avec succès. Un coordinateur d'APTIC-R vous répondra dans les plus brefs délais.",
    errorMsg: "Veuillez vérifier les champs obligatoires du formulaire.",
    sendAnother: "Envoyer un autre message",
    mapTitle: "LOCALISATION & PLAN D'ACCÈS",
    mapSubtitle: "Le FabLab et siège communautaire d'APTIC-R au cœur du canton d'Agbélouvé.",
    openOsm: "Ouvrir dans OpenStreetMap",
    ctaTitle: "Vous préférez échanger de vive voix sur un projet ?",
    ctaDesc: "Nos coordinateurs de programmes organisent des réunions en visioconférence ou directement à Agbélouvé.",
    ctaPartner: "Proposer un partenariat",
    ctaVolunteering: "Postuler comme volontaire",
  },
  EN: {
    badge: "CONTACT",
    title: "Contact the APTIC-R Team",
    subtitle:
      "A question, a project, an application, or a partnership proposal? We are at your service.",
    infoTitle: "INFORMATION & ACCESS",
    headquartersLabel: "HEADQUARTERS & FABLAB",
    headquartersAddress: "Agbélouvé Community Hub\nZio Prefecture, Maritime Region\nTogo (West Africa)",
    accessInfo: "Located 65 km north of Lomé along National Highway RN1.",
    phoneLabel: "PHONE & WHATSAPP",
    phoneNum: "+228 91 20 19 90",
    phoneDesc: "Monday – Friday, 08:00 – 18:00 GMT",
    emailLabel: "GENERAL EMAIL",
    emailMain: "aptic.rural19@gmail.com",
    hoursLabel: "WORKING HOURS",
    hoursFablab: "Monday – Friday: 08:00 – 18:00 GMT",
    hoursSat: "Saturday: 09:00 – 14:00 (Youth workshops)",
    hoursSun: "Sunday: Closed",
    whatsappBtn: "Chat on WhatsApp",
    formSectionTitle: "SEND US A MESSAGE",
    formSubtitle: "Fill in this form and our team will get back to you within 48 business hours.",
    fieldName: "Full Name",
    namePlaceholder: "e.g., Jane Doe",
    fieldEmail: "Email Address",
    emailPlaceholder: "e.g., jane.doe@example.org",
    fieldOrg: "Organization / Institution",
    fieldOrgOptional: "(optional)",
    orgPlaceholder: "e.g., NGO, City Council, University...",
    fieldPhone: "Phone / WhatsApp",
    fieldPhoneOptional: "(optional)",
    phonePlaceholder: "+228 90 00 00 00",
    fieldSubject: "Subject",
    subjectSelect: "Select an inquiry subject",
    subjectGeneral: "General Information",
    subjectVolontariat: "Volunteering & Application",
    subjectPartenariat: "Institutional Partnership & Projects",
    subjectFablab: "Training & Agbélouvé FabLab",
    subjectMedia: "Press & Media",
    subjectOther: "Other inquiry",
    fieldMessage: "Your Message",
    messagePlaceholder: "Describe your project or question...",
    fieldConsent: "I agree to have my details processed by APTIC-R to handle my inquiry.",
    submitBtn: "Send Message",
    submitting: "Sending...",
    successTitle: "Message Sent!",
    successMsg: "Your message has been sent successfully. An APTIC-R coordinator will reach out shortly.",
    errorMsg: "Please complete all required fields.",
    sendAnother: "Send another message",
    mapTitle: "LOCATION & ACCESS MAP",
    mapSubtitle: "APTIC-R FabLab and community hub in Agbélouvé, Zio Prefecture.",
    openOsm: "Open in OpenStreetMap",
    ctaTitle: "Prefer to discuss your project directly?",
    ctaDesc: "Our project coordinators are available for video calls or on-site visits in Agbélouvé.",
    ctaPartner: "Propose a partnership",
    ctaVolunteering: "Apply as volunteer",
  },
  DE: {
    badge: "KONTAKT",
    title: "Kontaktieren Sie das APTIC-R Team",
    subtitle:
      "Eine Frage, ein Projekt, eine Bewerbung oder ein Partnerschaftsvorschlag? Wir sind für Sie da.",
    infoTitle: "INFORMATION & ANFAHRT",
    headquartersLabel: "HAUPTSITZ & FABLAB",
    headquartersAddress: "Agbélouvé Gemeindezentrum\nPräfektur Zio, Maritime Region\nTogo (Westafrika)",
    accessInfo: "65 km nördlich von Lomé an der Nationalstraße RN1.",
    phoneLabel: "TELEFON & WHATSAPP",
    phoneNum: "+228 91 20 19 90",
    phoneDesc: "Montag – Freitag, 08:00 – 18:00 Uhr GMT",
    emailLabel: "HAUPT-E-MAIL",
    emailMain: "aptic.rural19@gmail.com",
    hoursLabel: "ÖFFNUNGSZEITEN",
    hoursFablab: "Montag – Freitag: 08:00 – 18:00 Uhr GMT",
    hoursSat: "Samstag: 09:00 – 14:00 Uhr (Jugendworkshops)",
    hoursSun: "Sonntag: Geschlossen",
    whatsappBtn: "Über WhatsApp schreiben",
    formSectionTitle: "SCHREIBEN SIE UNS EINE NACHRICHT",
    formSubtitle: "Füllen Sie das Formular aus, wir antworten innerhalb von 48 Geschäftsstunden.",
    fieldName: "Vollständiger Name",
    namePlaceholder: "z.B. Max Mustermann",
    fieldEmail: "E-Mail-Adresse",
    emailPlaceholder: "z.B. max@beispiel.de",
    fieldOrg: "Organisation / Institution",
    fieldOrgOptional: "(optional)",
    orgPlaceholder: "z.B. NGO, Universität, Stiftung...",
    fieldPhone: "Telefon / WhatsApp",
    fieldPhoneOptional: "(optional)",
    phonePlaceholder: "+49 170 0000000",
    fieldSubject: "Betreff",
    subjectSelect: "Thema auswählen",
    subjectGeneral: "Allgemeine Information",
    subjectVolontariat: "Bewerbung / Freiwilligendienst",
    subjectPartenariat: "Partnerschaft & Projekte",
    subjectFablab: "Ausbildung & FabLab",
    subjectMedia: "Presse & Medien",
    subjectOther: "Sonstiges",
    fieldMessage: "Ihre Nachricht",
    messagePlaceholder: "Beschreiben Sie Ihr Anliegen...",
    fieldConsent: "Ich willige in die Verarbeitung meiner Daten zur Bearbeitung der Anfrage ein.",
    submitBtn: "Nachricht senden",
    submitting: "Wird gesendet...",
    successTitle: "Nachricht gesendet!",
    successMsg: "Ihre Nachricht wurde erfolgreich übermittelt. Wir melden uns in Kürze.",
    errorMsg: "Bitte füllen Sie alle Pflichtfelder aus.",
    sendAnother: "Weitere Nachricht senden",
    mapTitle: "STANDORT & ANFAHRT",
    mapSubtitle: "Das APTIC-R FabLab im Herzen von Agbélouvé.",
    openOsm: "In OpenStreetMap öffnen",
    ctaTitle: "Möchten Sie ein Projekt persönlich besprechen?",
    ctaDesc: "Unsere Programmkoordinatoren stehen für Videokonferenzen oder Treffen in Agbélouvé bereit.",
    ctaPartner: "Partnerschaft vorschlagen",
    ctaVolunteering: "Als Freiwilliger bewerben",
  },
}

const SPECIALIZED_CONTACTS = [
  {
    role: "Informations Générales & Accueil",
    email: "contact@aptic-r.org",
    desc: "Renseignements généraux, adhésions et vie associative",
  },
  {
    role: "Volontariat & Missions",
    email: "volontariat@aptic-r.org",
    desc: "Candidatures, immersion communautaire et suivi des volontaires",
  },
  {
    role: "Programmes & Partenariats",
    email: "programmes@aptic-r.org",
    desc: "Coopération décentralisée, bailleurs de fonds et projets conjoints",
  },
  {
    role: "Direction Exécutive",
    email: "direction@aptic-r.org",
    desc: "Gouvernance, relations officielles et partenariats stratégiques",
  },
]

interface ContactViewProps {
  lang: Language
  initialSettings?: Record<string, string>
}

export default function ContactView({ lang, initialSettings = {} }: ContactViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [settings, setSettings] = useState<Record<string, string>>(initialSettings)

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      Promise.all([getSiteSettings("CONTACT"), getSiteSettings("GENERAL")]).then(([resContact, resGeneral]) => {
        const merged: Record<string, string> = {}
        if (resContact.success && resContact.dict) Object.assign(merged, resContact.dict)
        if (resGeneral.success && resGeneral.dict) Object.assign(merged, resGeneral.dict)
        setSettings((prev) => ({ ...prev, ...merged }))
      }).catch(console.error)
    })
  }, [])

  // Dynamic values with i18n fallbacks
  const addressText = settings["site_location_address"] 
    ? `${settings["site_location_address"]}\n${settings["site_location_region"] || ""}\n${settings["site_location_country"] || "Togo"}`
    : settings["contact_address"] || t.headquartersAddress
  const accessInfoText = settings["contact_access_info"] || t.accessInfo
  const phoneNum = settings["site_contact_phone"] || settings["contact_phone"] || t.phoneNum
  const phoneDesc = settings["contact_phone_desc"] || t.phoneDesc
  const emailMain = settings["site_contact_email"] || settings["contact_email"] || t.emailMain
  const whatsappNum = (settings["site_social_whatsapp"] || settings["social_whatsapp"] || "22891201990").replace(/\D/g, "")
  const hoursWeek = settings["contact_hours_week"] || t.hoursFablab
  const hoursSat = settings["contact_hours_sat"] || t.hoursSat
  const hoursSun = settings["contact_hours_sun"] || t.hoursSun

  const dynamicSpecialized = [
    {
      role: lang === "EN" ? "General Info & Reception" : lang === "DE" ? "Allgemeine Info & Empfang" : "Informations Générales & Accueil",
      email: settings["contact_email_general"] || "contact@aptic-r.org",
      desc: lang === "EN" ? "General questions, memberships and association life" : lang === "DE" ? "Allgemeine Anfragen, Mitgliedschaften" : "Renseignements généraux, adhésions et vie associative",
    },
    {
      role: lang === "EN" ? "Volunteering & Missions" : lang === "DE" ? "Freiwilligendienst & Einsätze" : "Volontariat & Missions",
      email: settings["contact_email_volunteer"] || "volontariat@aptic-r.org",
      desc: lang === "EN" ? "Applications, field placement and volunteer mentorship" : lang === "DE" ? "Bewerbungen, Vor-Ort-Einsatz und Betreuung" : "Candidatures, immersion communautaire et suivi des volontaires",
    },
    {
      role: lang === "EN" ? "Programs & Partnerships" : lang === "DE" ? "Programme & Partnerschaften" : "Programmes & Partenariats",
      email: settings["contact_email_programs"] || "programmes@aptic-r.org",
      desc: lang === "EN" ? "Institutional cooperation, grant funding and joint projects" : lang === "DE" ? "Institutionelle Kooperationen und gemeinsame Projekte" : "Coopération décentralisée, bailleurs de fonds et projets conjoints",
    },
    {
      role: lang === "EN" ? "Executive Direction" : lang === "DE" ? "Geschäftsführung" : "Direction Exécutive",
      email: settings["contact_email_direction"] || "direction@aptic-r.org",
      desc: lang === "EN" ? "Governance, official relations and strategic partnerships" : lang === "DE" ? "Leitung, offizielle Beziehungen und Partnerschaften" : "Gouvernance, relations officielles et partenariats stratégiques",
    },
  ]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  })

  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE")
  const [errorMessage, setErrorMessage] = useState("")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("SUBMITTING")
    setErrorMessage("")

    if (!formData.name || !formData.email || !formData.subject || !formData.message || !formData.consent) {
      setStatus("ERROR")
      setErrorMessage(t.errorMsg)
      return
    }

    // Simulation d'envoi réussi
    setTimeout(() => {
      setStatus("SUCCESS")
      setFormData({
        name: "",
        email: "",
        organization: "",
        phone: "",
        subject: "",
        message: "",
        consent: false,
      })
    }, 700)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="contact" navigate={navigate} />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* ── 1. Compact Hero (#F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ backgroundColor: BG_HERO }}>
          <div className="max-w-[1260px] mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#28A745]" />
              <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
                {t.badge}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight mb-3 leading-tight">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Unified 2-Column Section : INFORMATIONS & ACCÈS vs FORMULAIRE (#FFFFFF) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-[1260px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Consolidated Institutional Info (w ~ 480px / 5 cols) */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#003366] block mb-2">
                    {t.infoTitle}
                  </span>
                  <div className="h-0.5 w-12 bg-[#003366] mb-6" />
                </div>

                {/* 1. Siège Social & FabLab */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#28A745]" />
                    <span>{t.headquartersLabel}</span>
                  </div>
                  <p className="text-[15px] text-[#5E6B76] whitespace-pre-line leading-relaxed font-medium">
                    {addressText}
                  </p>
                  <p className="text-xs text-[#5E6B76]/80 leading-relaxed pt-1">
                    {accessInfoText}
                  </p>
                </div>

                {/* 2. Téléphone & WhatsApp */}
                <div className="space-y-2 pt-4 border-t border-slate-150">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
                    <span>{t.phoneLabel}</span>
                  </div>
                  <div>
                    <a
                      href={`tel:${phoneNum.replace(/\s+/g, "")}`}
                      className="text-2xl font-black text-[#003366] hover:text-[#007BFF] transition-colors"
                    >
                      {phoneNum}
                    </a>
                    <p className="text-xs text-[#5E6B76] mt-0.5">{phoneDesc}</p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${whatsappNum}?text=Bonjour%20APTIC-R,%20je%20vous%20contacte%20depuis%20le%20site%20internet.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#28A745] text-white hover:bg-[#218838] transition-colors shadow-xs"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                      <span>{t.whatsappBtn}</span>
                    </a>
                  </div>
                </div>

                {/* 3. Email Principal */}
                <div className="space-y-2 pt-4 border-t border-slate-150">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
                    <span>{t.emailLabel}</span>
                  </div>
                  <div>
                    <a
                      href={`mailto:${emailMain}`}
                      className="text-base font-bold text-[#007BFF] hover:text-[#003366] transition-colors"
                    >
                      {emailMain}
                    </a>
                  </div>
                </div>

                {/* 4. Horaires */}
                <div className="space-y-2 pt-4 border-t border-slate-150">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
                    <span>{t.hoursLabel}</span>
                  </div>
                  <div className="text-sm text-[#5E6B76] space-y-1">
                    <p>{hoursWeek}</p>
                    <p>{hoursSat}</p>
                    <p className="text-xs text-slate-400 font-medium">{hoursSun}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Wide Institutional Contact Form (7 cols) */}
              <div className="lg:col-span-7">
                <div className="bg-[#F7F8FA] rounded-2xl p-8 sm:p-12 border border-[#E5EAF0] shadow-xs">
                  <div className="mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#003366] block mb-2">
                      {t.formSectionTitle}
                    </span>
                    <p className="text-sm text-[#5E6B76] leading-relaxed">
                      {t.formSubtitle}
                    </p>
                  </div>

                  {status === "SUCCESS" ? (
                    <div className="p-8 rounded-xl bg-white border border-[#28A745]/30 text-center space-y-4 shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-[#28A745]/10 text-[#28A745] flex items-center justify-center text-2xl mx-auto font-bold">
                        ✓
                      </div>
                      <h3 className="text-xl font-bold text-[#003366]">
                        {t.successTitle}
                      </h3>
                      <p className="text-sm text-[#5E6B76] max-w-md mx-auto leading-relaxed">
                        {t.successMsg}
                      </p>
                      <button
                        onClick={() => setStatus("IDLE")}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#003366] text-white hover:bg-[#002244] transition-colors"
                      >
                        {t.sendAnother}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {status === "ERROR" && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                          {errorMessage || t.errorMsg}
                        </div>
                      )}

                      {/* Row 1: Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center">
                            <span>{t.fieldName}</span>
                            <RequiredAsterisk />
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t.namePlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center">
                            <span>{t.fieldEmail}</span>
                            <RequiredAsterisk />
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t.emailPlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                          />
                        </div>
                      </div>

                      {/* Row 2: Org + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center justify-between">
                            <span>{t.fieldOrg}</span>
                            <span className="text-[10px] text-slate-400 font-normal lowercase">{t.fieldOrgOptional}</span>
                          </label>
                          <input
                            type="text"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            placeholder={t.orgPlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center justify-between">
                            <span>{t.fieldPhone}</span>
                            <span className="text-[10px] text-slate-400 font-normal lowercase">{t.fieldPhoneOptional}</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={t.phonePlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                          />
                        </div>
                      </div>

                      {/* Row 3: Subject */}
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center">
                          <span>{t.fieldSubject}</span>
                          <RequiredAsterisk />
                        </label>
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                        >
                          <option value="">{t.subjectSelect}</option>
                          <option value="GENERAL">{t.subjectGeneral}</option>
                          <option value="VOLONTARIAT">{t.subjectVolontariat}</option>
                          <option value="PARTENARIAT">{t.subjectPartenariat}</option>
                          <option value="FABLAB">{t.subjectFablab}</option>
                          <option value="MEDIA">{t.subjectMedia}</option>
                          <option value="AUTRE">{t.subjectOther}</option>
                        </select>
                      </div>

                      {/* Row 4: Message */}
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center">
                          <span>{t.fieldMessage}</span>
                          <RequiredAsterisk />
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={t.messagePlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332] resize-y"
                        />
                      </div>

                      {/* Consent checkbox */}
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="consent"
                          required
                          checked={formData.consent}
                          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded text-[#003366] focus:ring-[#003366] border-slate-300"
                        />
                        <label htmlFor="consent" className="text-xs text-[#5E6B76] leading-relaxed cursor-pointer select-none">
                          <span>{t.fieldConsent}</span>
                          <RequiredAsterisk />
                        </label>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={status === "SUBMITTING"}
                          className="px-8 py-3.5 rounded-xl font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-xs disabled:opacity-50 text-sm"
                        >
                          {status === "SUBMITTING" ? t.submitting : t.submitBtn} →
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Interactive Map & Access Section (#F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200" style={{ backgroundColor: BG_SECTION_ALT }}>
          <div className="max-w-[1260px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#003366] block mb-1">
                  {t.mapTitle}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366]">
                  Agbélouvé · Préfecture du Zio
                </h2>
                <p className="text-sm text-[#5E6B76] mt-1">
                  {t.mapSubtitle}
                </p>
              </div>

              <a
                href="https://www.openstreetmap.org/#map=13/6.5786/1.1894"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs sm:text-sm font-bold text-[#007BFF] hover:text-[#003366] transition-colors self-start sm:self-auto"
              >
                {t.openOsm} <span className="ml-1">↗</span>
              </a>
            </div>

            {/* Embedded OpenStreetMap / Map Container */}
            <div className="rounded-2xl overflow-hidden border border-[#E5EAF0] shadow-xs aspect-[16/9] sm:aspect-[21/9] bg-slate-100 relative">
              <iframe
                title="Carte Agbélouvé APTIC-R"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://www.openstreetmap.org/export/embed.html?bbox=1.1550%2C6.5500%2C1.2250%2C6.6100&amp;layer=mapnik&amp;marker=6.5786%2C1.1894"
                className="w-full h-full filter contrast-[1.02]"
              />
              
              {/* Overlay Location Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-xs space-y-0.5">
                <div className="font-bold text-[#003366] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#28A745]" />
                  <span>Siège & FabLab APTIC-R</span>
                </div>
                <div className="text-[#5E6B76]">Agbélouvé, RN1 (65 km nord Lomé)</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Clean Institutional CTA Box (#F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#F7F8FA] border-t border-slate-200">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#28A745] block mb-2">
              ÉCHANGES & COLLABORATIONS
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] mb-3">
              {t.ctaTitle}
            </h2>
            <p className="text-sm text-[#5E6B76] max-w-md mx-auto mb-6 leading-relaxed">
              {t.ctaDesc}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={getPageUrl("partner", lang)}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-xs"
              >
                {t.ctaPartner}
              </Link>
              <Link
                href={getPageUrl("apply", lang)}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#007BFF] text-white hover:bg-[#0060c8] transition-colors shadow-xs"
              >
                {t.ctaVolunteering}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
