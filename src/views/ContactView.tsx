"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface ContactViewProps {
  lang: Language
}

const BG = "#F5F7F9"

const I18N = {
  FR: {
    badge: "Restons en contact",
    title: "Contactez l'Équipe APTIC-R",
    subtitle:
      "Une question sur nos programmes, un projet de partenariat ou une candidature ? Notre équipe vous répond avec écoute et réactivité.",
    addressTitle: "Siège Social & FabLab",
    addressLine1: "Agbélouvé — Centre communautaire",
    addressLine2: "Préfecture du Zio, Région Maritime",
    addressLine3: "Togo (Afrique de l'Ouest)",
    accessInfo: "À 65 km au nord de Lomé sur la RN1 (axe Lomé-Tsévié-Atakpamé). Accès facile en taxi-brousse ou minibus depuis la gare routière d'Agbalépédogan.",
    phoneTitle: "Téléphone & WhatsApp",
    phoneNum: "+228 91 20 19 90",
    phoneDesc: "Disponible du lundi au vendredi, 08h00 - 18h00 GMT",
    whatsappBtn: "Échanger sur WhatsApp",
    hoursTitle: "Horaires d'Ouverture",
    hoursFablab: "Lundi – Vendredi : 08h00 – 18h00 GMT",
    hoursSat: "Samedi : 09h00 – 14h00 (Ateliers jeunes)",
    hoursSun: "Dimanche : Fermé",
    emailsTitle: "Pôles Spécifiques",
    formTitle: "Envoyez-nous un Message",
    formSubtitle: "Remplissez ce formulaire et un coordinateur vous répondra sous 48 heures.",
    fieldName: "Nom complet *",
    namePlaceholder: "ex: Jean Dupont",
    fieldEmail: "Adresse email *",
    emailPlaceholder: "ex: contact@exemple.org",
    fieldOrg: "Organisation / Institution (facultatif)",
    orgPlaceholder: "ex: ONG, Université, Mairie...",
    fieldPhone: "Numéro de téléphone / WhatsApp",
    phonePlaceholder: "+33 6 12 34 56 78 ou +228 90 00 00 00",
    fieldSubject: "Sujet de votre demande *",
    subjectSelect: "Sélectionnez un sujet",
    subjectGeneral: "Information générale",
    subjectVolontariat: "Question sur le volontariat",
    subjectPartenariat: "Proposition de partenariat",
    subjectFablab: "Activités FabLab & Formations",
    subjectMedia: "Presse & Médias",
    subjectOther: "Autre demande",
    fieldMessage: "Votre message *",
    messagePlaceholder: "Expliquez-nous votre demande avec un maximum de précisions...",
    fieldConsent: "J'accepte que mes données soient traitées par APTIC-R pour répondre à ma demande conformément à la politique de confidentialité.",
    submitBtn: "ENVOYER MON MESSAGE",
    submitting: "Envoi en cours...",
    successMsg: "Votre message a été envoyé avec succès ! Notre équipe vous répondra dans les plus brefs délais.",
    errorMsg: "Veuillez vérifier les champs du formulaire.",
  },
  EN: {
    badge: "Get in Touch",
    title: "Contact the APTIC-R Team",
    subtitle:
      "Questions about our programs, partnership inquiries, or volunteer applications? We are eager to hear from you.",
    addressTitle: "Headquarters & FabLab",
    addressLine1: "Agbélouvé Community Hub",
    addressLine2: "Zio Prefecture, Maritime Region",
    addressLine3: "Togo (West Africa)",
    accessInfo: "Located 65 km north of Lomé along highway RN1. Easily accessible by intercity minibus or taxi from Agbalépédogan station in Lomé.",
    phoneTitle: "Phone & WhatsApp",
    phoneNum: "+228 91 20 19 90",
    phoneDesc: "Available Monday to Friday, 08:00 - 18:00 GMT",
    whatsappBtn: "Chat on WhatsApp",
    hoursTitle: "Working Hours",
    hoursFablab: "Monday – Friday: 08:00 – 18:00 GMT",
    hoursSat: "Saturday: 09:00 – 14:00 (Youth workshops)",
    hoursSun: "Sunday: Closed",
    emailsTitle: "Direct Inboxes",
    formTitle: "Send Us a Message",
    formSubtitle: "Fill in this form and a program coordinator will get back to you within 48 hours.",
    fieldName: "Full Name *",
    namePlaceholder: "e.g., Sarah Smith",
    fieldEmail: "Email Address *",
    emailPlaceholder: "e.g., sarah@example.org",
    fieldOrg: "Organization / University (optional)",
    orgPlaceholder: "e.g., Foundation, University, NGO...",
    fieldPhone: "Phone / WhatsApp Number",
    phonePlaceholder: "+1 555 123 4567 or +228 90 00 00 00",
    fieldSubject: "Subject *",
    subjectSelect: "Select an inquiry topic",
    subjectGeneral: "General Information",
    subjectVolontariat: "Volunteering questions",
    subjectPartenariat: "Partnership proposal",
    subjectFablab: "FabLab activities & training",
    subjectMedia: "Press & Media",
    subjectOther: "Other inquiry",
    fieldMessage: "Your Message *",
    messagePlaceholder: "Please describe your project or question in detail...",
    fieldConsent: "I agree to have my details processed by APTIC-R to handle my inquiry in accordance with the privacy policy.",
    submitBtn: "SEND MESSAGE",
    submitting: "Sending...",
    successMsg: "Your message has been sent successfully! Our team will get back to you shortly.",
    errorMsg: "Please check all required fields.",
  },
  DE: {
    badge: "Kontakt aufnehmen",
    title: "Kontaktieren Sie APTIC-R",
    subtitle:
      "Fragen zu unseren Programmen, Partnerschaftsangebote oder Freiwilligenarbeit? Wir helfen Ihnen gerne weiter.",
    addressTitle: "Hauptsitz & FabLab",
    addressLine1: "Agbélouvé Gemeindezentrum",
    addressLine2: "Präfektur Zio, Maritime Region",
    addressLine3: "Togo (Westafrika)",
    accessInfo: "65 km nördlich von Lomé an der Nationalstraße RN1 gelegen. Regelmäßige Minibus-Verbindungen von Lomé.",
    phoneTitle: "Telefon & WhatsApp",
    phoneNum: "+228 91 20 19 90",
    phoneDesc: "Montag bis Freitag, 08:00 - 18:00 Uhr GMT",
    whatsappBtn: "Über WhatsApp chatten",
    hoursTitle: "Öffnungszeiten",
    hoursFablab: "Montag – Freitag: 08:00 – 18:00 Uhr GMT",
    hoursSat: "Samstag: 09:00 – 14:00 Uhr (Jugendworkshops)",
    hoursSun: "Sonntag: Geschlossen",
    emailsTitle: "Fachbereiche",
    formTitle: "Schreiben Sie uns",
    formSubtitle: "Füllen Sie das Formular aus, wir antworten innerhalb von 48 Stunden.",
    fieldName: "Vollständiger Name *",
    namePlaceholder: "z.B. Anna Schmidt",
    fieldEmail: "E-Mail-Adresse *",
    emailPlaceholder: "z.B. anna@beispiel.de",
    fieldOrg: "Organisation / Institution (optional)",
    orgPlaceholder: "z.B. Universität, Stiftung, NGO...",
    fieldPhone: "Telefonnummer / WhatsApp",
    phonePlaceholder: "+49 170 1234567",
    fieldSubject: "Betreff *",
    subjectSelect: "Thema auswählen",
    subjectGeneral: "Allgemeine Auskunft",
    subjectVolontariat: "Freiwilligendienst",
    subjectPartenariat: "Partnerschaft",
    subjectFablab: "FabLab & Kurse",
    subjectMedia: "Presse",
    subjectOther: "Sonstiges",
    fieldMessage: "Ihre Nachricht *",
    messagePlaceholder: "Beschreiben Sie Ihr Anliegen...",
    fieldConsent: "Ich willige in die Verarbeitung meiner Daten zur Bearbeitung der Anfrage ein.",
    submitBtn: "NACHRICHT ABSENDEN",
    submitting: "Wird gesendet...",
    successMsg: "Ihre Nachricht wurde erfolgreich gesendet! Wir melden uns in Kürze bei Ihnen.",
    errorMsg: "Bitte überprüfen Sie die Pflichtfelder.",
  },
}

const EMAIL_POLES = [
  { pole: "Informations Générales", email: "contact@aptic-r.org", desc: "Accueil et renseignements généraux" },
  { pole: "Volontariat & Missions", email: "volontariat@aptic-r.org", desc: "Candidatures, stages et séjours solidaires" },
  { pole: "Programmes & Partenariats", email: "programmes@aptic-r.org", desc: "Coopérations institutionnelles et projets de terrain" },
  { pole: "Direction Exécutive", email: "direction@aptic-r.org", desc: "Gouvernance, plaidoyer et relations officielles" },
]

export default function ContactView({ lang }: ContactViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

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
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="contact" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>📬</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Contact Cards Grid & Form ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Direct Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Headquarters card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#174F7A]/10 text-[#174F7A] flex items-center justify-center text-2xl">
                  📍
                </div>
                <h3 className="text-xl font-bold text-[#142332]">
                  {t.addressTitle}
                </h3>
                <div className="text-slate-600 text-sm leading-relaxed">
                  <p className="font-semibold text-slate-800">{t.addressLine1}</p>
                  <p>{t.addressLine2}</p>
                  <p>{t.addressLine3}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-700">Accès : </span>
                  {t.accessInfo}
                </div>
              </div>

              {/* Phone & WhatsApp Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#35A85A]/10 text-[#35A85A] flex items-center justify-center text-2xl">
                  📱
                </div>
                <h3 className="text-xl font-bold text-[#142332]">
                  {t.phoneTitle}
                </h3>
                <div>
                  <a
                    href={`tel:${t.phoneNum.replace(/\s+/g, "")}`}
                    className="text-2xl font-extrabold text-[#174F7A] hover:underline"
                  >
                    {t.phoneNum}
                  </a>
                  <p className="text-xs text-slate-500 mt-1">{t.phoneDesc}</p>
                </div>
                <div>
                  <a
                    href={`https://wa.me/22891201990?text=Bonjour%20APTIC-R,%20je%20vous%20contacte%20depuis%20le%20site%20internet.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#35A85A] text-white hover:bg-[#2e924e] transition-colors shadow-sm"
                  >
                    <span>💬</span>
                    <span>{t.whatsappBtn}</span>
                  </a>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl">
                  🕒
                </div>
                <h3 className="text-xl font-bold text-[#142332]">
                  {t.hoursTitle}
                </h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                  <p>{t.hoursFablab}</p>
                  <p>{t.hoursSat}</p>
                  <p className="text-slate-400">{t.hoursSun}</p>
                </div>
              </div>

              {/* Email Poles */}
              <div className="bg-gradient-to-br from-[#174F7A] to-[#0F3452] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
                <h3 className="text-lg font-bold">
                  {t.emailsTitle}
                </h3>
                <div className="space-y-3 text-xs">
                  {EMAIL_POLES.map((ep, i) => (
                    <div key={i} className="pb-2 border-b border-white/10 last:border-0 last:pb-0">
                      <div className="font-semibold text-white/90">{ep.pole}</div>
                      <a
                        href={`mailto:${ep.email}`}
                        className="text-[#35A85A] font-bold hover:underline break-all"
                      >
                        {ep.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142332]">
                    {t.formTitle}
                  </h2>
                  <p className="text-slate-600 text-sm mt-2">
                    {t.formSubtitle}
                  </p>
                </div>

                {status === "SUCCESS" ? (
                  <div className="p-8 rounded-2xl bg-[#35A85A]/10 border border-[#35A85A]/30 text-center space-y-4">
                    <div className="text-5xl">🎉</div>
                    <h3 className="text-xl font-bold text-[#35A85A]">
                      Message Envoyé !
                    </h3>
                    <p className="text-slate-700 text-sm max-w-md mx-auto">
                      {t.successMsg}
                    </p>
                    <button
                      onClick={() => setStatus("IDLE")}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {status === "ERROR" && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                        {errorMessage || t.errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t.fieldName}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t.namePlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t.fieldEmail}
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t.emailPlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t.fieldOrg}
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder={t.orgPlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t.fieldPhone}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t.phonePlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t.fieldSubject}
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm bg-white"
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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t.fieldMessage}
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t.messagePlaceholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm resize-y"
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="consent"
                        required
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300"
                      />
                      <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                        {t.fieldConsent}
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={status === "SUBMITTING"}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-md disabled:opacity-50 text-sm"
                      >
                        {status === "SUBMITTING" ? t.submitting : t.submitBtn}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
