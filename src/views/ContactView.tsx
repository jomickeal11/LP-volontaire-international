"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import RequiredAsterisk from "@/components/RequiredAsterisk"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { isContactPageAvailable } from "@/lib/contact-cms-config"
import { submitContactMessageAction } from "@/lib/contact-actions"
import { FREQUENT_COUNTRIES, ALL_COUNTRY_CODES } from "@/data/countryPhoneCodes"
import { GlobeIcon, SearchIcon } from "@/components/Icons"

function PhoneInputField({
  label,
  countryCode,
  countryIso,
  onCountrySelect,
  phone,
  onPhoneChange,
  placeholder,
  required,
  lang = "FR",
}: {
  label: string
  countryCode: string
  countryIso: string
  onCountrySelect: (dial: string, iso: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  placeholder?: string
  required?: boolean
  lang?: Language
}) {
  const currentLang = (lang || "FR").toUpperCase()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Find active country
  const currentCountry =
    ALL_COUNTRY_CODES.find((c) => (countryIso ? c.code === countryIso : c.dial === countryCode)) ||
    FREQUENT_COUNTRIES.find((c) => (countryIso ? c.code === countryIso : c.dial === countryCode))

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const filteredFrequent = search.trim()
    ? FREQUENT_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : FREQUENT_COUNTRIES

  const filteredAll = search.trim()
    ? ALL_COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_COUNTRY_CODES

  const handleSelect = (c: { dial: string; code: string }) => {
    onCountrySelect(c.dial, c.code)
    setOpen(false)
    setSearch("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const optionalText = currentLang === "DE" ? "— optional" : currentLang === "EN" ? "— optional" : "— optionnel"
  const codeLabel = currentLang === "DE" ? "Vorwahl" : currentLang === "EN" ? "Code" : "Indicatif"
  const searchPlaceholder = currentLang === "DE" ? "Land oder Vorwahl suchen..." : currentLang === "EN" ? "Search country or dial code..." : "Rechercher pays ou indicatif (ex: Togo, +228)..."
  const frequentLabel = currentLang === "DE" ? "Häufige Länder" : currentLang === "EN" ? "Frequent countries" : "Pays fréquents"
  const allCountriesLabel = currentLang === "DE" ? "Alle Länder" : currentLang === "EN" ? "All countries" : "Tous les pays"
  const noCountryText = currentLang === "DE" ? `Kein Land gefunden für "${search}"` : currentLang === "EN" ? `No country found for "${search}"` : `Aucun pays trouvé pour "${search}"`

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      <label className="text-xs font-bold text-[#003366] uppercase flex items-center justify-between">
        <span>{label}</span>
        {required ? (
          <RequiredAsterisk />
        ) : (
          <span className="text-[10px] text-slate-400 font-normal lowercase">{optionalText}</span>
        )}
      </label>

      <div
        className="flex items-center w-full rounded-xl transition-all duration-200 bg-white border border-slate-200 focus-within:border-[#003366] focus-within:ring-1 focus-within:ring-[#003366] overflow-hidden"
        style={{
          height: "48px",
        }}
      >
        {/* Trigger Button with Flag */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-full px-3 flex items-center gap-2 border-r border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          style={{ minWidth: "105px" }}
          aria-expanded={open}
        >
          {currentCountry ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={`https://flagcdn.com/w40/${currentCountry.code.toLowerCase()}.png`}
                alt={currentCountry.name}
                className="w-5 h-3.5 object-cover rounded-xs shrink-0 shadow-2xs"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 font-mono">
                {currentCountry.dial}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500">
              <GlobeIcon size={16} className="shrink-0 text-slate-400" />
              <span className="text-xs font-medium">{codeLabel}</span>
            </div>
          )}
          <svg
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ml-auto ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Telephone Number Input */}
        <input
          ref={inputRef}
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={placeholder || "90 12 34 56"}
          className="flex-1 h-full px-3.5 text-sm outline-none bg-transparent text-[#142332]"
        />
      </div>

      {/* Dropdown Popover with Flags */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          />
          <div
            className="absolute left-0 top-[76px] z-50 w-full sm:w-[360px] bg-white rounded-2xl shadow-xl border border-[#D8E2E9] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ maxHeight: "380px" }}
          >
            <div className="p-2.5 border-b border-slate-100 bg-[#FAFCFD]">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 focus-within:border-[#003366]">
                <SearchIcon size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-50" style={{ maxHeight: "310px" }}>
              {!search && filteredFrequent.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                    {frequentLabel}
                  </div>
                  {filteredFrequent.map((c) => {
                    const isSelected = countryIso === c.code || (!countryIso && countryCode === c.dial)
                    return (
                      <button
                        key={`freq-${c.code}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelect(c)
                        }}
                        onClick={() => handleSelect(c)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer hover:bg-[#F0F5FA] ${
                          isSelected ? "bg-[#EAF2F9] font-bold text-[#003366]" : "text-slate-700"
                        }`}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-xs shrink-0 shadow-2xs"
                          loading="lazy"
                        />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0 font-semibold">
                          {c.dial}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div>
                {!search && (
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                    {allCountriesLabel}
                  </div>
                )}
                {filteredAll.length > 0 ? (
                  filteredAll.map((c) => {
                    const isSelected = countryIso === c.code || (!countryIso && countryCode === c.dial)
                    return (
                      <button
                        key={`all-${c.code}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelect(c)
                        }}
                        onClick={() => handleSelect(c)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer hover:bg-[#F0F5FA] ${
                          isSelected ? "bg-[#EAF2F9] font-bold text-[#003366]" : "text-slate-700"
                        }`}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-xs shrink-0 shadow-2xs"
                          loading="lazy"
                        />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0 font-semibold">
                          {c.dial}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {noCountryText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
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
    headquartersAddress: "Agbélouvé, Centre communautaire\nPréfecture du Zio, Région Maritime\nTogo (Afrique de l'Ouest)",
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
    subjectFinancement: "Financement de projet / Parrainage",
    subjectMateriel: "Don de matériel (informatique, solaire...)",
    subjectCompetences: "Mécénat de compétences / Pro Bono",
    subjectVolontariat: "Candidature / Volontariat",
    subjectPartenariat: "Partenariat institutionnel & Projets",
    subjectFablab: "Formations & FabLab d'Agbélouvé",
    subjectMedia: "Presse & Médias",
    subjectOther: "Autre demande",
    customSubjectLabel: "Précisez le sujet de votre demande",
    customSubjectPlaceholder: "ex: Proposition spécifique, question diverse...",
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
    subjectFinancement: "Project Funding / Sponsorship",
    subjectMateriel: "Hardware Donation (IT, solar...)",
    subjectCompetences: "Skills Sponsorship / Pro Bono",
    subjectVolontariat: "Volunteering & Application",
    subjectPartenariat: "Institutional Partnership & Projects",
    subjectFablab: "Training & Agbélouvé FabLab",
    subjectMedia: "Press & Media",
    subjectOther: "Other inquiry",
    customSubjectLabel: "Specify your subject",
    customSubjectPlaceholder: "e.g., Specific request, other topic...",
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
    subjectFinancement: "Projektfinanzierung / Patenschaft",
    subjectMateriel: "Sachspenden (IT, Solar...)",
    subjectCompetences: "Kompetenzspende / Pro Bono",
    subjectVolontariat: "Bewerbung / Freiwilligendienst",
    subjectPartenariat: "Partnerschaft & Projekte",
    subjectFablab: "Ausbildung & FabLab",
    subjectMedia: "Presse & Medien",
    subjectOther: "Sonstiges",
    customSubjectLabel: "Thema präzisieren",
    customSubjectPlaceholder: "z.B. Spezifische Anfrage, Sonstiges...",
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

const CONTEXTUAL_INTENTIONS: Record<
  string,
  Record<
    Language,
    {
      tag: string
      title: string
      desc: string
      placeholder: string
      whatsappText: string
    }
  >
> = {
  SOUTIEN_FINANCIER: {
    FR: {
      tag: "FINANCEMENT DE PROJETS",
      title: "Soutien direct aux projets ruraux d'APTIC-R",
      desc: "Votre contribution financière permet de déployer des kits solaires pour écoles hors-réseau, d'équiper des espaces numériques communautaires et de financer des bourses pour les jeunes et femmes.",
      placeholder: "Précisez le projet que vous souhaitez financer (électrification solaire d'écoles, FabLab Agbélouvé, bourses d'apprentissage...) ou le montant/format envisagé...",
      whatsappText: "Bonjour APTIC-R, je souhaite échanger au sujet du financement d'un projet.",
    },
    EN: {
      tag: "PROJECT FUNDING",
      title: "Direct funding for rural community projects",
      desc: "Your financial support powers solar kits for off-grid schools, equips community tech centers, and provides training grants for youth and women.",
      placeholder: "Specify the initiative you wish to sponsor (school solar kits, FabLab equipment, youth scholarships) or your funding scope...",
      whatsappText: "Hello APTIC-R, I would like to discuss project funding.",
    },
    DE: {
      tag: "PROJEKTFÖRDERUNG",
      title: "Direkte Unterstützung für ländliche Projekte",
      desc: "Ihre finanzielle Förderung ermöglicht Solar-Kits für Schulen, Ausstattung unserer FabLabs und Ausbildungsstipendien für Jugendliche und Frauen.",
      placeholder: "Geben Sie an, welches Projekt Sie unterstützen möchten (Solarstationen, FabLab-Ausstattung, Stipendien) oder den gewünschten Rahmen...",
      whatsappText: "Hallo APTIC-R, ich möchte über eine Projektförderung sprechen.",
    },
  },
  DON_MATERIEL: {
    FR: {
      tag: "DON DE MATÉRIEL",
      title: "Proposition de don d'équipements informatiques ou solaires",
      desc: "Merci pour votre générosité ! Vos ordinateurs portables, serveurs locaux, routeurs ou composants solaires équiperont directement nos FabLabs et salles communautaires au Togo.",
      placeholder: "Précisez la nature des équipements (ordinateurs, routeurs, onduleurs, etc.), leur état (fonctionnel, reconditionné), la quantité approximative et votre localisation...",
      whatsappText: "Bonjour APTIC-R, je souhaite vous proposer un don de matériel informatique ou solaire.",
    },
    EN: {
      tag: "HARDWARE DONATION",
      title: "In-kind donation of IT or solar hardware",
      desc: "Thank you for your support! Your laptops, servers, network equipment, or solar components will directly power our community FabLabs in Togo.",
      placeholder: "Please describe the hardware items, condition (functional, refurbished), approximate quantity, and pickup/shipping location...",
      whatsappText: "Hello APTIC-R, I would like to offer a hardware donation.",
    },
    DE: {
      tag: "SACHSPENDE",
      title: "Spende von IT- oder Solargeräten",
      desc: "Vielen Dank für Ihre Unterstützung! Ihre Laptops, Server, Netzwerk- oder Solarkomponenten kommen direkt unseren Bildungszentren in Togo zugute.",
      placeholder: "Bitte beschreiben Sie die Geräte, Zustand (funktionsfähig, wiederaufbereitet), ungefähre Menge und Standort...",
      whatsappText: "Hallo APTIC-R, ich möchte eine Sachspende anbieten.",
    },
  },
  MECENAT_COMPETENCES: {
    FR: {
      tag: "MÉCÉNAT DE COMPÉTENCES",
      title: "Partage d'expertise & Bénévolat pro bono",
      desc: "Mettez votre expertise technique, pédagogique ou organisationnelle à disposition des projets : développement low-tech, énergie solaire, cybersécurité, formation.",
      placeholder: "Indiquez votre domaine de compétences, votre disponibilité approximative et si vous souhaitez intervenir à distance ou sur place à Agbélouvé...",
      whatsappText: "Bonjour APTIC-R, je souhaite mettre mes compétences à disposition de vos actions.",
    },
    EN: {
      tag: "SKILLS SPONSORSHIP",
      title: "Pro bono expertise & skills sharing",
      desc: "Contribute your technical, educational, or management skills to local programs: low-tech development, solar energy, cybersecurity, or training.",
      placeholder: "Please describe your field of expertise, availability, and preferred mode (remote coaching or on-site in Togo)...",
      whatsappText: "Hello APTIC-R, I would like to offer pro bono skills.",
    },
    DE: {
      tag: "KOMPETENZSPENDE",
      title: "Pro Bono Expertise & Wissenstransfer",
      desc: "Bringen Sie Ihre Fachkenntnisse in unsere Projekte ein: Low-Tech-Lösungen, Solarenergie, IT-Schulungen oder Projektbegleitung.",
      placeholder: "Beschreiben Sie Ihr Fachgebiet, Ihre zeitliche Verfügbarkeit und ob remote oder vor Ort in Togo...",
      whatsappText: "Hallo APTIC-R, ich möchte mein Fachwissen für Ihre Projekte zur Verfügung stellen.",
    },
  },
}

interface ContactViewProps {
  lang: Language
  initialSettings?: Record<string, string>
}

export default function ContactView({ lang, initialSettings = {} }: ContactViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = I18N[lang] || I18N.FR

  const [settings, setSettings] = useState<Record<string, string>>(initialSettings)
  const [loading, setLoading] = useState(Object.keys(initialSettings).length === 0)

  useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      Promise.all([getSiteSettings("CONTACT"), getSiteSettings("GENERAL")])
        .then(([resContact, resGeneral]) => {
          const merged: Record<string, string> = {}
          if (resContact.success && resContact.dict) Object.assign(merged, resContact.dict)
          if (resGeneral.success && resGeneral.dict) Object.assign(merged, resGeneral.dict)
          setSettings((prev) => ({ ...prev, ...merged }))
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    })
  }, [])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  // Vérification de disponibilité des contenus CMS pour la langue sélectionnée (Politique stricte sans fallback silencieux)
  const isAvailable = isContactPageAvailable(settings, lang)

  // ── Écran d'attente institutionnel si la langue est en cours de finalisation éditoriale ──
  if (!loading && !isAvailable) {
    const isEn = lang === "EN"
    const isDe = lang === "DE"

    const heading = isDe
      ? "Die deutsche Version der Kontaktseite wird derzeit finalisiert"
      : isEn
      ? "English version of the Contact page is being finalized"
      : "Version française en cours de révision éditoriale"

    const description = isDe
      ? "Unser Redaktionsteam vervollständigt derzeit die offiziellen Angaben (Öffnungszeiten, Anfahrtswege) für diesen Bereich. Gemäß unseren Standards werden Inhalte erst nach vollständiger Validierung freigeschaltet."
      : isEn
      ? "Our editorial team is currently verifying the official details (access instructions, opening hours) for this section. In accordance with our publication standards, content is only published once fully verified."
      : "Cette page institutionnelle est actuellement en cours de révision par l'équipe éditoriale."

    const statusLabel = isDe
      ? "Status : In Bearbeitung"
      : isEn
      ? "Status : Under review"
      : "Statut : Révision éditoriale"

    const btnFrench = isDe
      ? "Geprüfte französische Version lesen"
      : isEn
      ? "Read verified French version"
      : "Consulter la version française"

    const btnHome = isDe ? "Zur Startseite" : isEn ? "Return to homepage" : "Retour à l'accueil"

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header lang={lang} setLang={handleSetLang} currentPage="contact" navigate={navigate} />
        <main className="flex-1 pt-28 pb-16 flex items-center justify-center px-4 bg-[#F7F8FA]">
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{statusLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-4">
              {heading}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/fr/contact"
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#003366] text-white hover:bg-[#002244] transition-all shadow-sm"
              >
                {btnFrench}
              </Link>
              <button
                onClick={() => navigate("home")}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
              >
                {btnHome}
              </button>
            </div>
          </div>
        </main>
        <Footer lang={lang} navigate={navigate} />
      </div>
    )
  }

  // Helper pour les suffixes multilingues stricts CMS (_fr, _en, _de)
  const langSuffix = lang.toLowerCase()

  // Adresse from GENERAL (global, not localized)
  const addressText = settings["site_location_address"]
    ? `${settings["site_location_address"]}\n${settings["site_location_region"] || ""}\n${settings["site_location_country"] || "Togo"}`
    : t.headquartersAddress

  // CMS Contact content — strict multilingual (no I18N fallback)
  const accessInfoText = settings[`contact_access_info_${langSuffix}`] || ""
  const hoursWeek = settings[`contact_hours_week_${langSuffix}`] || ""
  const hoursSat = settings[`contact_hours_sat_${langSuffix}`] || ""
  const hoursSun = settings[`contact_hours_sun_${langSuffix}`] || ""

  // GENERAL settings (global, not localized)
  const phoneNum = settings["site_contact_phone"] || t.phoneNum
  const emailMain = settings["site_contact_email"] || t.emailMain
  const whatsappNum = (settings["site_social_whatsapp"] || "22891201990").replace(/\D/g, "")

  // GPS configuration from CMS (non-localized technical configuration, OPTIONNELLE)
  const hasValidGps = Boolean(
    settings["contact_map_lat"] &&
    settings["contact_map_lng"] &&
    !isNaN(Number(settings["contact_map_lat"])) &&
    !isNaN(Number(settings["contact_map_lng"]))
  )
  const mapLat = settings["contact_map_lat"] || ""
  const mapLng = settings["contact_map_lng"] || ""
  const mapZoom = settings["contact_map_zoom"] || "13"
  const mapLabel = settings["contact_map_label"] || ""

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    phoneCountryCode: "+228",
    phoneCountryIso: "TG",
    phone: "",
    subject: "",
    customSubject: "",
    message: "",
    consent: false,
  })

  // Synchronisation contextuelle automatique via paramètre URL (?subject=...)
  const rawSubjectParam = searchParams?.get("subject")?.toLowerCase() || ""

  useEffect(() => {
    if (!rawSubjectParam) return
    if (["materiel", "don_materiel", "materiel_it", "hardware", "don-de-materiel"].includes(rawSubjectParam)) {
      setFormData((prev) => ({ ...prev, subject: "DON_MATERIEL" }))
    } else if (["financement", "don_financier", "finance", "don", "soutien", "funding", "financement-de-projets"].includes(rawSubjectParam)) {
      setFormData((prev) => ({ ...prev, subject: "SOUTIEN_FINANCIER" }))
    } else if (["competences", "mecenat", "probono", "skills", "mecenat-de-competences"].includes(rawSubjectParam)) {
      setFormData((prev) => ({ ...prev, subject: "MECENAT_COMPETENCES" }))
    } else if (["volontariat", "candidature", "volunteer"].includes(rawSubjectParam)) {
      setFormData((prev) => ({ ...prev, subject: "VOLONTARIAT" }))
    } else if (["partenariat", "partenaire", "partnership"].includes(rawSubjectParam)) {
      setFormData((prev) => ({ ...prev, subject: "PARTENARIAT" }))
    } else if (["fablab", "formation"].includes(rawSubjectParam)) {
      setFormData((prev) => ({ ...prev, subject: "FABLAB" }))
    }
  }, [rawSubjectParam])

  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as Language
  const activeContext = CONTEXTUAL_INTENTIONS[formData.subject]?.[safeLang] || null
  const whatsappPrefill = activeContext
    ? encodeURIComponent(activeContext.whatsappText)
    : encodeURIComponent("Bonjour APTIC-R, je vous contacte depuis le site internet.")

  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("SUBMITTING")
    setErrorMessage("")

    if (!formData.name || !formData.email || !formData.subject || !formData.message || !formData.consent) {
      setStatus("ERROR")
      setErrorMessage(t.errorMsg)
      return
    }

    if (formData.subject === "AUTRE" && !formData.customSubject.trim()) {
      setStatus("ERROR")
      setErrorMessage(
        lang === "EN"
          ? "Please specify the subject of your request."
          : lang === "DE"
          ? "Bitte präzisieren Sie das Thema Ihrer Anfrage."
          : "Veuillez préciser le sujet de votre demande."
      )
      return
    }

    const finalSubject =
      formData.subject === "AUTRE" && formData.customSubject.trim()
        ? `Autre : ${formData.customSubject.trim()}`
        : formData.subject

    const fullPhoneNumber = formData.phone.trim()
      ? formData.phone.startsWith("+")
        ? formData.phone.trim()
        : `${formData.phoneCountryCode} ${formData.phone.trim()}`
      : ""

    try {
      const res = await submitContactMessageAction({
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        phone: fullPhoneNumber,
        subject: finalSubject,
        message: formData.message,
        consent: formData.consent,
        lang: safeLang,
      })

      if (res.success) {
        setStatus("SUCCESS")
        setFormData({
          name: "",
          email: "",
          organization: "",
          phoneCountryCode: "+228",
          phoneCountryIso: "TG",
          phone: "",
          subject: "",
          customSubject: "",
          message: "",
          consent: false,
        })
      } else {
        setStatus("ERROR")
        setErrorMessage(res.error || t.errorMsg)
      }
    } catch (err: unknown) {
      console.error("Erreur soumission contact :", err)
      setStatus("ERROR")
      setErrorMessage(t.errorMsg)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="contact" navigate={navigate} />

      <main className="flex-1">
        {/* ── 1. Compact Hero (#F7F8FA) - Fond gris montant jusqu'en haut derrière le header ── */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 border-b border-slate-200/80"
          style={{ backgroundColor: BG_HERO }}
        >
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
                <div id="coordonnees" className="space-y-2 scroll-mt-36">
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
                    <p className="text-xs text-[#5E6B76] mt-0.5">{t.phoneDesc}</p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${whatsappNum}?text=${whatsappPrefill}`}
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
                <div id="acces-horaires" className="space-y-2 pt-4 border-t border-slate-150 scroll-mt-36">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003366]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
                    <span>{t.hoursLabel}</span>
                  </div>
                  <div className="text-sm text-[#5E6B76] space-y-1">
                    {hoursWeek && <p>{hoursWeek}</p>}
                    {hoursSat && <p>{hoursSat}</p>}
                    {hoursSun && <p className="text-xs text-slate-400 font-medium">{hoursSun}</p>}
                  </div>
                </div>
              </div>

              {/* Right Column: Wide Institutional Contact Form (7 cols) */}
              <div id="formulaire" className="lg:col-span-7 scroll-mt-36">
                <div className="bg-[#F7F8FA] rounded-2xl p-8 sm:p-12 border border-[#E5EAF0] shadow-xs">
                  {status === "SUCCESS" ? (
                    <div className="py-8 sm:py-12 text-center space-y-5">
                      <div className="w-16 h-16 rounded-full bg-[#28A745]/10 text-[#28A745] flex items-center justify-center text-3xl mx-auto font-bold shadow-2xs">
                        ✓
                      </div>
                      <div className="space-y-2 max-w-lg mx-auto">
                        <h3 className="text-2xl font-extrabold text-[#003366] tracking-tight">
                          {t.successTitle}
                        </h3>
                        <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed">
                          {t.successMsg}
                        </p>
                      </div>
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={() => setStatus("IDLE")}
                          className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-bold text-sm bg-[#003366] text-white hover:bg-[#002244] transition-all shadow-sm cursor-pointer"
                        >
                          {t.sendAnother}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#003366] block mb-2">
                          {t.formSectionTitle}
                        </span>
                        <p className="text-sm text-[#5E6B76] leading-relaxed">
                          {t.formSubtitle}
                        </p>
                      </div>

                      {/* Contextual Intention Banner */}
                      {activeContext && (
                        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#007BFF]/30 shadow-2xs relative transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-black uppercase tracking-wider text-[#007BFF] block">
                                {activeContext.tag}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-[#003366]">
                                {activeContext.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed">
                                {activeContext.desc}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, subject: "" }))}
                              className="text-slate-400 hover:text-slate-700 p-1 text-xs shrink-0 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                              title="Réinitialiser le motif"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
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

                      {/* Row 2: Org + Phone with Country Code Selector */}
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
                            className="w-full px-4 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                            style={{ height: "48px" }}
                          />
                        </div>

                        <div>
                          <PhoneInputField
                            label={t.fieldPhone}
                            countryCode={formData.phoneCountryCode}
                            countryIso={formData.phoneCountryIso}
                            onCountrySelect={(dial, iso) =>
                              setFormData((prev) => ({
                                ...prev,
                                phoneCountryCode: dial,
                                phoneCountryIso: iso,
                              }))
                            }
                            phone={formData.phone}
                            onPhoneChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                            placeholder={t.phonePlaceholder}
                            required={false}
                            lang={safeLang}
                          />
                        </div>
                      </div>

                      {/* Row 3: Subject */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center">
                            <span>{t.fieldSubject}</span>
                            <RequiredAsterisk />
                          </label>
                          <select
                            required
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                                ...(e.target.value !== "AUTRE" ? { customSubject: "" } : {}),
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332]"
                          >
                            <option value="">{t.subjectSelect}</option>
                            <option value="GENERAL">{t.subjectGeneral}</option>
                            <option value="SOUTIEN_FINANCIER">{t.subjectFinancement}</option>
                            <option value="DON_MATERIEL">{t.subjectMateriel}</option>
                            <option value="MECENAT_COMPETENCES">{t.subjectCompetences}</option>
                            <option value="VOLONTARIAT">{t.subjectVolontariat}</option>
                            <option value="PARTENARIAT">{t.subjectPartenariat}</option>
                            <option value="FABLAB">{t.subjectFablab}</option>
                            <option value="MEDIA">{t.subjectMedia}</option>
                            <option value="AUTRE">{t.subjectOther}</option>
                          </select>
                        </div>

                        {/* Champ de saisie dynamique si « Autre demande » est sélectionné */}
                        {formData.subject === "AUTRE" && (
                          <div className="pt-1">
                            <label className="block text-xs font-bold text-[#003366] mb-1.5 uppercase flex items-center">
                              <span>{t.customSubjectLabel || "Précisez le sujet de votre demande"}</span>
                              <RequiredAsterisk />
                            </label>
                            <input
                              type="text"
                              required
                              autoFocus
                              value={formData.customSubject}
                              onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                              placeholder={t.customSubjectPlaceholder || "ex: Proposition spécifique, question diverse..."}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-sm text-[#142332] shadow-2xs"
                            />
                          </div>
                        )}
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
                          placeholder={activeContext?.placeholder || t.messagePlaceholder}
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
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Interactive Map & Access Section (#F7F8FA) (Optionnel : GPS administré) ── */}
        <section id="carte" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200 scroll-mt-24" style={{ backgroundColor: BG_SECTION_ALT }}>
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

              {hasValidGps && (
                <a
                  href={`https://www.openstreetmap.org/#map=${mapZoom}/${mapLat}/${mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs sm:text-sm font-bold text-[#007BFF] hover:text-[#003366] transition-colors self-start sm:self-auto gap-1"
                >
                  <span>{t.openOsm}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Embedded OpenStreetMap / Map Container ou Carte d'accès terrain */}
            {hasValidGps ? (
              <div className="rounded-2xl overflow-hidden border border-[#E5EAF0] shadow-xs aspect-[16/9] sm:aspect-[21/9] bg-slate-100 relative">
                <iframe
                  title="Carte Agbélouvé APTIC-R"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapLng) - 0.035}%2C${parseFloat(mapLat) - 0.03}%2C${parseFloat(mapLng) + 0.035}%2C${parseFloat(mapLat) + 0.03}&layer=mapnik&marker=${mapLat}%2C${mapLng}`}
                  className="w-full h-full filter contrast-[1.02]"
                />
                
                {/* Overlay Location Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-xs space-y-0.5">
                  <div className="font-bold text-[#003366] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#28A745]" />
                    <span>{mapLabel || "Siège APTIC-R"}</span>
                  </div>
                  <div className="text-[#5E6B76]">{accessInfoText || mapLabel || ""}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003366] text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#007BFF]" />
                    <span>Localisation & Itinéraire</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#003366]">
                    Centre Communautaire & FabLab d&apos;Agbélouvé
                  </h3>
                  <p className="text-sm text-[#5E6B76] leading-relaxed">
                    {accessInfoText || "À 65 km au nord de Lomé sur la route nationale RN1 (axe Lomé–Tsévié–Atakpamé)."}
                  </p>
                  <p className="text-xs text-slate-400">
                    Les coordonnées GPS précises peuvent être renseignées dans le panneau d&apos;administration dès leur validation officielle.
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href={`https://wa.me/${whatsappNum}?text=Bonjour%20APTIC-R,%20je%20souhaite%20des%20indications%20pour%20me%20rendre%20au%20si%C3%A8ge%20%C3%A0%20Agb%C3%A9louv%C3%A9.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#28A745] text-white hover:bg-[#218838] transition-colors shadow-xs"
                  >
                    Demander l&apos;itinéraire sur WhatsApp
                  </a>
                </div>
              </div>
            )}
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
