"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { submitMemberApplication } from "@/lib/cms-actions"

interface MembershipViewProps {
  lang: Language
}

const BG = "#F5F7F9"

const I18N = {
  FR: {
    badge: "Adhésion & Engagement Citoyen",
    title: "Devenir Membre d'APTIC-R",
    subtitle:
      "Rejoignez un collectif engagé pour la justice technologique, l'émancipation rurale et la souveraineté numérique au Togo.",
    whyTitle: "Pourquoi Adhérer ?",
    why1: "Participer aux décisions stratégiques et voter lors des Assemblées Générales.",
    why2: "Co-concevoir et animer des projets technologiques à fort impact humain.",
    why3: "Intégrer un réseau pluridisciplinaire d'ingénieurs, éducateurs et makers solidaires.",
    why4: "Accéder en priorité aux ateliers, ressources documentaires et au FabLab d'Agbélouvé.",
    formTitle: "Formulaire d'Adhésion",
    formSubtitle: "Votre candidature sera étudiée par le Bureau Exécutif sous 5 jours ouvrés.",
    sec1: "1. Identité & Coordonnées",
    firstName: "Prénom *",
    lastName: "Nom de famille *",
    email: "Adresse e-mail *",
    phone: "Téléphone / WhatsApp",
    profession: "Profession / Métier actuel",
    org: "Organisation / Entreprise / Université",
    country: "Pays de résidence *",
    city: "Ville de résidence",
    sec2: "2. Vos Domaines d'Intérêt",
    sec2Desc: "Sélectionnez au moins un domaine dans lequel vous souhaitez vous investir :",
    sec3: "3. Type de Contribution & Disponibilité",
    contribLabel: "Comment souhaitez-vous contribuer prioritairement ? *",
    contribComp: "Apport de compétences techniques ou pédagogiques",
    contribFin: "Soutien financier / cotisation bienfaiteur",
    contribVol: "Bénévolat de terrain ou volontariat",
    contribNet: "Mise en réseau, plaidoyer et partenariats",
    contribOther: "Autre forme de contribution",
    availLabel: "Quelle est votre disponibilité estimée ? *",
    availHebdo: "Régulière (quelques heures par semaine)",
    availMensuel: "Mensuelle (quelques jours par mois)",
    availPonctuel: "Ponctuelle (lors d'événements ou projets précis)",
    availFull: "Temps plein (mission longue durée ou stage)",
    sec4: "4. Motivation & Engagement",
    motivationLabel: "Expliquez vos motivations pour rejoindre APTIC-R *",
    motivationPlaceholder: "Partagez vos motivations, vos idées de projets et ce qui vous inspire dans notre mission (au moins 30 caractères)...",
    charteConsent: "Je m'engage à respecter les statuts, le règlement intérieur et la charte éthique d'APTIC-R.",
    dataConsent: "J'accepte que mes données personnelles soient traitées par APTIC-R aux fins de gestion de mon adhésion.",
    submitBtn: "SOUMETTRE MA DEMANDE D'ADHÉSION",
    submitting: "Traitement en cours...",
    successTitle: "Demande d'adhésion enregistrée !",
    successDesc: "Merci pour votre engagement. Votre demande porte la référence suivante :",
    successNext: "Notre équipe coordinatrice prendra contact avec vous par email pour finaliser votre intégration.",
    homeBtn: "RETOUR À L'ACCUEIL",
  },
  EN: {
    badge: "Membership & Civic Engagement",
    title: "Become a Member of APTIC-R",
    subtitle:
      "Join a dedicated collective striving for digital equity, rural empowerment, and technological sovereignty in Togo.",
    whyTitle: "Why Join?",
    why1: "Participate in strategic milestones and vote during General Assemblies.",
    why2: "Co-design and lead hands-on community technology initiatives.",
    why3: "Connect with an international network of makers, engineers, and educators.",
    why4: "Enjoy priority access to Agbélouvé FabLab facilities and resource libraries.",
    formTitle: "Membership Application Form",
    formSubtitle: "Your application will be reviewed by the Executive Board within 5 working days.",
    sec1: "1. Identity & Contact Details",
    firstName: "First Name *",
    lastName: "Last Name *",
    email: "Email Address *",
    phone: "Phone / WhatsApp",
    profession: "Current Profession",
    org: "Organization / University",
    country: "Country of Residence *",
    city: "City",
    sec2: "2. Fields of Interest",
    sec2Desc: "Select at least one domain where you want to contribute:",
    sec3: "3. Contribution & Availability",
    contribLabel: "How do you wish to contribute primarily? *",
    contribComp: "Technical, educational or scientific skills",
    contribFin: "Financial contribution / patron membership",
    contribVol: "Field volunteering or hands-on coaching",
    contribNet: "Networking, advocacy, and partnerships",
    contribOther: "Other type of contribution",
    availLabel: "Estimated availability *",
    availHebdo: "Weekly (a few hours per week)",
    availMensuel: "Monthly (a few days per month)",
    availPonctuel: "Occasional (during specific events or sprints)",
    availFull: "Full-time (long-term mission or placement)",
    sec4: "4. Statement of Motivation",
    motivationLabel: "What inspires you to join APTIC-R? *",
    motivationPlaceholder: "Share your background, project ideas, and motivations (at least 30 characters)...",
    charteConsent: "I agree to uphold the statutes, bylaws, and ethical charter of APTIC-R.",
    dataConsent: "I agree to have my personal data processed by APTIC-R for membership administration.",
    submitBtn: "SUBMIT APPLICATION",
    submitting: "Submitting...",
    successTitle: "Application Submitted!",
    successDesc: "Thank you for your commitment. Your application reference is:",
    successNext: "Our coordination team will contact you shortly via email to complete your onboarding.",
    homeBtn: "BACK TO HOME",
  },
  DE: {
    badge: "Mitgliedschaft & Engagement",
    title: "Mitglied bei APTIC-R werden",
    subtitle:
      "Schließen Sie sich einer engagierten Gemeinschaft für digitale Gerechtigkeit und ländliche Entwicklung in Togo an.",
    whyTitle: "Warum Mitglied werden?",
    why1: "Mitbestimmung bei strategischen Beschlüssen auf der Generalversammlung.",
    why2: "Gemeinsame Durchführung von wirkungsvollen Projekten.",
    why3: "Austausch in einem internationalen Netzwerk von Machern und Pädagogen.",
    why4: "Bevorzugter Zugang zu Einrichtungen und Workshops des FabLabs Agbélouvé.",
    formTitle: "Mitgliedsantrag",
    formSubtitle: "Ihr Antrag wird innerhalb von 5 Werktagen geprüft.",
    sec1: "1. Persönliche Angaben",
    firstName: "Vorname *",
    lastName: "Nachname *",
    email: "E-Mail-Adresse *",
    phone: "Telefon / WhatsApp",
    profession: "Beruf",
    org: "Organisation / Hochschule",
    country: "Wohnsitzland *",
    city: "Stadt",
    sec2: "2. Interessensgebiete",
    sec2Desc: "Wählen Sie mindestens ein Aktionsfeld aus:",
    sec3: "3. Beitrag & Verfügbarkeit",
    contribLabel: "Gewünschte Beitragsform *",
    contribComp: "Fachliche oder pädagogische Fähigkeiten",
    contribFin: "Finanzielle Unterstützung / Fördermitglied",
    contribVol: "Ehrenamtliche Mitarbeit vor Ort",
    contribNet: "Netzwerkaufbau und Partnerschaften",
    contribOther: "Sonstige Unterstützung",
    availLabel: "Geschätzte Verfügbarkeit *",
    availHebdo: "Wöchentlich (einige Stunden)",
    availMensuel: "Monatlich (einige Tage)",
    availPonctuel: "Projektbezogen (bei Bedarf)",
    availFull: "Vollzeit",
    sec4: "4. Motivation & Einwilligung",
    motivationLabel: "Ihre Motivation *",
    motivationPlaceholder: "Beschreiben Sie Ihre Beweggründe (mind. 30 Zeichen)...",
    charteConsent: "Ich erkenne die Satzung und Richtlinien von APTIC-R an.",
    dataConsent: "Ich willige in die Verarbeitung meiner Daten zur Mitgliederverwaltung ein.",
    submitBtn: "ANTRAG ABSENDEN",
    submitting: "Wird gesendet...",
    successTitle: "Antrag eingegangen!",
    successDesc: "Vielen Dank für Ihr Engagement. Ihre Referenznummer lautet:",
    successNext: "Unser Team wird sich in Kürze per E-Mail bei Ihnen melden.",
    homeBtn: "ZUR STARTSEITE",
  },
}

const DOMAINS_LIST = [
  { id: "inclusion-numerique", labelFr: "Inclusion numérique & alphabétisation", icon: "💻" },
  { id: "jeunesse-education", labelFr: "Jeunesse, éducation & compétences d'avenir", icon: "🚀" },
  { id: "cybersecurite-hygiene", labelFr: "Cybersécurité & citoyenneté numérique", icon: "🛡️" },
  { id: "agri-lowtech", labelFr: "Agriculture durable, écologie & Low-Tech", icon: "🌱" },
  { id: "data-innovation", labelFr: "Données ouvertes & innovation citoyenne", icon: "📊" },
  { id: "dev-rural-fablabs", labelFr: "Développement rural & FabLabs communautaires", icon: "⚙️" },
]

export default function MembershipView({ lang }: MembershipViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    organization: "",
    country: "Togo",
    city: "",
    domainsOfInterest: ["inclusion-numerique"] as string[],
    contributionType: "COMPETENCES",
    availability: "HEBDOMADAIRE",
    motivation: "",
    charteConsent: false,
    consentData: false,
  })

  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE")
  const [errorMessage, setErrorMessage] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")

  const toggleDomain = (id: string) => {
    setFormData((prev) => {
      const exists = prev.domainsOfInterest.includes(id)
      if (exists) {
        if (prev.domainsOfInterest.length === 1) return prev // au moins un domaine
        return { ...prev, domainsOfInterest: prev.domainsOfInterest.filter((d) => d !== id) }
      } else {
        return { ...prev, domainsOfInterest: [...prev.domainsOfInterest, id] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("SUBMITTING")
    setErrorMessage("")

    if (!formData.charteConsent || !formData.consentData) {
      setStatus("ERROR")
      setErrorMessage("Veuillez accepter la charte et le consentement au traitement des données.")
      return
    }

    try {
      const res = await submitMemberApplication({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        profession: formData.profession || null,
        organization: formData.organization || null,
        country: formData.country,
        city: formData.city || null,
        domainsOfInterest: formData.domainsOfInterest,
        contributionType: formData.contributionType,
        availability: formData.availability,
        motivation: formData.motivation,
        consentData: formData.consentData,
      })

      if (res.success && res.referenceNumber) {
        setReferenceNumber(res.referenceNumber)
        setStatus("SUCCESS")
      } else {
        setStatus("ERROR")
        setErrorMessage(res.error || "Une erreur est survenue lors de l'enregistrement.")
      }
    } catch (err: any) {
      setStatus("ERROR")
      setErrorMessage(err.message || "Erreur réseau.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="membership" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>🤝</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Why Join Cards ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-4 mb-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🗳️", text: t.why1 },
              { icon: "⚡", text: t.why2 },
              { icon: "🌐", text: t.why3 },
              { icon: "📚", text: t.why4 },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3"
              >
                <span className="text-2xl mt-0.5">{card.icon}</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Membership Form ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-md">
              {status === "SUCCESS" ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-[#35A85A]/10 text-[#35A85A] text-4xl flex items-center justify-center mx-auto shadow-sm">
                    ✓
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142332]">
                    {t.successTitle}
                  </h2>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    {t.successDesc}
                  </p>

                  <div className="inline-block px-6 py-3 rounded-2xl bg-[#174F7A]/10 border border-[#174F7A]/20">
                    <span className="text-xs text-[#174F7A] font-bold block uppercase tracking-wider">
                      Numéro de dossier
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#174F7A] font-mono tracking-wider">
                      {referenceNumber}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    {t.successNext}
                  </p>

                  <div className="pt-4">
                    <Link
                      href={getPageUrl("home", lang)}
                      className="px-8 py-3.5 rounded-xl font-bold bg-[#174F7A] text-white hover:bg-[#123e60] transition-colors shadow-md text-sm inline-block"
                    >
                      {t.homeBtn}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#142332]">
                      {t.formTitle}
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      {t.formSubtitle}
                    </p>
                  </div>

                  {status === "ERROR" && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* Section 1 : Identité */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#174F7A] uppercase tracking-wider">
                      {t.sec1}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.firstName}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.lastName}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.email}
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.phone}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+228 90 00 00 00"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.profession}
                        </label>
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          placeholder="ex: Développeur, Agronome, Enseignant..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.org}
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.country}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.city}
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="ex: Lomé, Tsévié, Paris, Berlin..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] focus:ring-2 focus:ring-[#174F7A]/20 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2 : Domaines */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-[#174F7A] uppercase tracking-wider">
                      {t.sec2}
                    </h3>
                    <p className="text-xs text-slate-500">{t.sec2Desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DOMAINS_LIST.map((dom) => {
                        const checked = formData.domainsOfInterest.includes(dom.id)
                        return (
                          <div
                            key={dom.id}
                            onClick={() => toggleDomain(dom.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                              checked
                                ? "bg-[#174F7A]/10 border-[#174F7A] text-[#174F7A] font-semibold"
                                : "bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xl">{dom.icon}</span>
                            <span className="text-xs">{dom.labelFr}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Section 3 : Contribution & Disponibilité */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-[#174F7A] uppercase tracking-wider">
                      {t.sec3}
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        {t.contribLabel}
                      </label>
                      <select
                        value={formData.contributionType}
                        onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-sm bg-white"
                      >
                        <option value="COMPETENCES">{t.contribComp}</option>
                        <option value="FINANCIER">{t.contribFin}</option>
                        <option value="VOLONTARIAT">{t.contribVol}</option>
                        <option value="RESEAU">{t.contribNet}</option>
                        <option value="AUTRE">{t.contribOther}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        {t.availLabel}
                      </label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-sm bg-white"
                      >
                        <option value="HEBDOMADAIRE">{t.availHebdo}</option>
                        <option value="MENSUEL">{t.availMensuel}</option>
                        <option value="PONCTUEL">{t.availPonctuel}</option>
                        <option value="TEMPS_PLEIN">{t.availFull}</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 4 : Motivation */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-[#174F7A] uppercase tracking-wider">
                      {t.sec4}
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.motivationLabel}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        placeholder={t.motivationPlaceholder}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#174F7A] outline-none text-sm resize-y"
                      />
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="charte"
                          required
                          checked={formData.charteConsent}
                          onChange={(e) => setFormData({ ...formData, charteConsent: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300"
                        />
                        <label htmlFor="charte" className="text-xs text-slate-700 cursor-pointer font-medium">
                          {t.charteConsent}
                        </label>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="consent"
                          required
                          checked={formData.consentData}
                          onChange={(e) => setFormData({ ...formData, consentData: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded text-[#174F7A] focus:ring-[#174F7A] border-slate-300"
                        />
                        <label htmlFor="consent" className="text-xs text-slate-700 cursor-pointer font-medium">
                          {t.dataConsent}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={status === "SUBMITTING"}
                      className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#35A85A] text-white hover:bg-[#2e924e] transition-colors shadow-lg disabled:opacity-50 tracking-wider"
                    >
                      {status === "SUBMITTING" ? t.submitting : t.submitBtn}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
