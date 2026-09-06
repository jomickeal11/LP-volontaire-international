import { useState } from "react"
import type { Page, Language } from "../types"
import translations from "../i18n/translations"
import {
  MonitorIcon,
  BarChartIcon,
  CodeIcon,
  SmartphoneIcon,
  WheatIcon,
  CpuIcon,
  ShieldIcon,
  GraduationCapIcon,
  MessageSquareIcon,
  FileTextIcon,
  CheckIcon,
  PlusIcon,
  InfoIcon,
  LockIcon,
  LightbulbIcon,
} from "../components/Icons"
import { FREQUENT_COUNTRIES, ALL_COUNTRY_CODES } from "../data/countryPhoneCodes"


interface ApplyPageProps {
  lang: Language
  navigate: (p: Page) => void
  setLang?: (l: Language) => void
}

const BLUE = "#174F7A"
const GREEN = "#35A85A"
const BG_LIGHT = "#F5F7F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#5E6B76"

// ── Form Input Helpers ────────────────────────────────────────────────────────
function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
  helpText,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  helpText?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 rounded-xl outline-none transition-all duration-200"
        style={{
          height: "48px",
          fontSize: "14px",
          border: error ? "1.5px solid #EF4444" : "1.5px solid #D8E2E9",
          backgroundColor: "#FFFFFF",
          color: TEXT_DARK,
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = error ? "1.5px solid #EF4444" : `1.5px solid ${BLUE}`
          e.currentTarget.style.boxShadow = error
            ? "0 0 0 3px rgba(239,68,68,0.12)"
            : "0 0 0 3px rgba(23,79,122,0.10)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = error ? "1.5px solid #EF4444" : "1.5px solid #D8E2E9"
          e.currentTarget.style.boxShadow = "none"
        }}
      />
      {helpText && !error && <span className="text-xs text-slate-500 leading-tight">{helpText}</span>}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}

function PhoneInputField({
  label,
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  placeholder,
  required,
}: {
  label: string
  countryCode: string
  onCountryCodeChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {required ? (
          <span className="text-red-500 font-bold">*</span>
        ) : (
          <span className="text-xs font-normal text-slate-400">— optionnel</span>
        )}
      </label>
      <div
        className="flex items-center w-full rounded-xl transition-all duration-200 overflow-hidden bg-white"
        style={{
          height: "48px",
          border: "1.5px solid #D8E2E9",
        }}
      >
        <div className="relative shrink-0 border-r border-[#D8E2E9] bg-[#F8FAFC] h-full flex items-center">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className="h-full pl-3 pr-7 text-xs sm:text-sm font-medium outline-none bg-transparent cursor-pointer appearance-none text-slate-700"
            style={{ minWidth: "120px", maxWidth: "160px" }}
            aria-label="Indicatif téléphonique international"
          >
            <option value="">Indicatif...</option>
            <optgroup label="Fréquents">
              {FREQUENT_COUNTRIES.map((c) => (
                <option key={`freq-${c.code}-${c.dial}`} value={c.dial}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </optgroup>
            <optgroup label="Tous les pays">
              {ALL_COUNTRY_CODES.map((c) => (
                <option key={`all-${c.code}-${c.dial}`} value={c.dial}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </optgroup>
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={
            countryCode === "+228"
              ? "Ex: 90 12 34 56"
              : countryCode
              ? "Ex: 6 12 34 56 78"
              : placeholder || "Ex: 90 12 34 56"
          }
          className="flex-1 h-full px-3.5 text-sm outline-none bg-transparent"
          style={{ color: TEXT_DARK }}
        />
      </div>
    </div>
  )
}

function SelectField({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 rounded-xl outline-none transition-all duration-200 cursor-pointer"
        style={{
          height: "48px",
          fontSize: "14px",
          border: "1.5px solid #D8E2E9",
          backgroundColor: "#FFFFFF",
          color: value ? TEXT_DARK : "#9AA8B4",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = `1.5px solid ${BLUE}`
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,79,122,0.10)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = "1.5px solid #D8E2E9"
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        <option value="">Sélectionner...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextareaField({
  label,
  placeholder,
  value,
  onChange,
  rows = 6,
  required,
  error,
  maxLength,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  required?: boolean
  error?: string
  maxLength?: number
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all duration-200"
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          border: error ? "1.5px solid #EF4444" : "1.5px solid #D8E2E9",
          backgroundColor: "#FFFFFF",
          color: TEXT_DARK,
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = error ? "1.5px solid #EF4444" : `1.5px solid ${BLUE}`
          e.currentTarget.style.boxShadow = error
            ? "0 0 0 3px rgba(239,68,68,0.12)"
            : "0 0 0 3px rgba(23,79,122,0.10)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = error ? "1.5px solid #EF4444" : "1.5px solid #D8E2E9"
          e.currentTarget.style.boxShadow = "none"
        }}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}

function FileUpload({
  label,
  optional,
  fileName,
  onFile,
}: {
  label: string
  optional?: boolean
  fileName: string
  onFile: (file: File | null) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {optional ? (
          <span className="text-xs font-normal text-slate-400">— optionnel</span>
        ) : (
          <span className="text-red-500 font-bold">*</span>
        )}
      </label>
      {fileName ? (
        <div
          className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
          style={{ backgroundColor: "#EAF5ED", border: "1.5px solid #35A85A" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#35A85A] text-white flex items-center justify-center shrink-0">
              <CheckIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium truncate" style={{ color: "#1A4D2E" }}>
              {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="text-xs font-semibold px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors shrink-0 ml-3"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center gap-2 px-4 py-7 rounded-xl cursor-pointer transition-all hover:border-[#174F7A] group"
          style={{ border: "2px dashed #D1DCE5", backgroundColor: "#FAFCFD" }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#E8F2FA] group-hover:text-[#174F7A] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-sm font-medium text-slate-700 text-center">
            Cliquez pour ajouter un fichier <span className="text-slate-400 font-normal">ou glissez-déposez</span>
          </div>
          <div className="text-xs text-slate-400">PDF, DOC, DOCX jusqu'à 10 Mo</div>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
        </label>
      )}
    </div>
  )
}

// ── Application Page Component ────────────────────────────────────────────────
export default function ApplyPage({ lang, navigate, setLang }: ApplyPageProps) {
  const currentLang = (lang || "FR").toUpperCase() as keyof typeof translations
  const t = translations[currentLang] || translations.FR

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submittedRef, setSubmittedRef] = useState("APTIC-2026-001")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "",
    phone: "",
    country: "",
    city: "",
    dob: "",
    nationality: "",
    education: "",
    fieldOfStudy: "",
    profession: "",
    experience: "",
    digitalSkillLevel: "",
    skills: [] as string[],
    arrivalDate: "",
    duration: "",
    motivation: "",
    projectExp: "",
    cvFile: null as File | null,
    motivationFile: null as File | null,
    portfolioFile: null as File | null,
    source: "",
    consent: false,
    languages: {
      french: "",
      english: "",
      german: "",
    },
  })

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleSkill = (skillSlug: string) => {
    const current = form.skills
    set(
      "skills",
      current.includes(skillSlug)
        ? current.filter((s) => s !== skillSlug)
        : [...current, skillSlug]
    )
  }

  const next = () => {
    setErrorMessage("")
    setStep((s) => Math.min(s + 1, 9))
    window.scrollTo({ top: 400, behavior: "smooth" })
  }

  const back = () => {
    setErrorMessage("")
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 400, behavior: "smooth" })
  }

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setErrorMessage("")
      setStep(targetStep)
      window.scrollTo({ top: 400, behavior: "smooth" })
    }
  }

  // Validation
  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1:
        return (
          form.firstName.trim().length >= 2 &&
          form.lastName.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
          form.country.trim().length > 0 &&
          form.dob.length > 0
        )
      case 3:
        return form.skills.length > 0
      case 4:
        return form.duration.length > 0
      case 5:
        return form.motivation.trim().length >= 20
      case 6:
        return form.projectExp.trim().length >= 20
      case 8:
        return form.source.length > 0
      case 9:
        return form.consent
      default:
        return true
    }
  }

  const step1HasActivity = [form.firstName, form.lastName, form.email, form.dob].some((v) => v.trim().length > 0)
  const step1Errors = step1HasActivity
    ? {
        firstName: form.firstName.trim().length < 2 ? "Prénom obligatoire (min. 2 caractères)" : undefined,
        lastName: form.lastName.trim().length < 2 ? "Nom obligatoire (min. 2 caractères)" : undefined,
        email:
          form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
            ? "Adresse e-mail invalide"
            : !form.email
            ? "E-mail obligatoire"
            : undefined,
        dob: !form.dob ? "Date de naissance obligatoire" : undefined,
      }
    : {}

  // Submission handler
  const submit = async () => {
    setIsSubmitting(true)
    setErrorMessage("")

    if (!form.firstName.trim() || form.firstName.trim().length < 2) {
      setErrorMessage(t.apply.errors.firstNameReq)
      setIsSubmitting(false)
      return
    }
    if (!form.lastName.trim() || form.lastName.trim().length < 2) {
      setErrorMessage(t.apply.errors.lastNameReq)
      setIsSubmitting(false)
      return
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMessage(t.apply.errors.emailInvalid)
      setIsSubmitting(false)
      return
    }
    if (!form.country.trim()) {
      setErrorMessage(t.apply.errors.countryReq)
      setIsSubmitting(false)
      return
    }
    if (!form.dob) {
      setErrorMessage(t.apply.errors.dobReq)
      setIsSubmitting(false)
      return
    }
    if (form.skills.length === 0) {
      setErrorMessage(t.apply.errors.skillsReq)
      setIsSubmitting(false)
      return
    }
    if (form.motivation.trim().length < 20) {
      setErrorMessage(t.apply.errors.motivationLen)
      setIsSubmitting(false)
      return
    }
    if (form.motivation.trim().length > 5000) {
      setErrorMessage(t.apply.errors.motivationMax)
      setIsSubmitting(false)
      return
    }
    if (form.projectExp.trim().length < 20) {
      setErrorMessage(t.apply.errors.projectLen)
      setIsSubmitting(false)
      return
    }
    if (form.projectExp.trim().length > 5000) {
      setErrorMessage(t.apply.errors.projectMax)
      setIsSubmitting(false)
      return
    }
    if (!form.source) {
      setErrorMessage(t.apply.errors.sourceReq)
      setIsSubmitting(false)
      return
    }
    if (!form.consent) {
      setErrorMessage(t.apply.errors.consentReq)
      setIsSubmitting(false)
      return
    }

    try {
      const { submitCandidateApplicationFormData } = await import("../lib/actions")
      const formData = new FormData()
      formData.append("firstName", form.firstName.trim())
      formData.append("lastName", form.lastName.trim())
      formData.append("email", form.email.trim())
      const fullPhone = form.phoneCountryCode
        ? `${form.phoneCountryCode} ${form.phone.trim()}`.trim()
        : form.phone.trim()
      if (fullPhone) formData.append("phone", fullPhone)
      formData.append("country", form.country)
      if (form.city.trim()) formData.append("city", form.city.trim())
      formData.append("dob", form.dob)
      if (form.education.trim()) formData.append("education", form.education.trim())
      if (form.fieldOfStudy.trim()) formData.append("fieldOfStudy", form.fieldOfStudy.trim())
      if (form.profession.trim()) formData.append("profession", form.profession.trim())
      if (form.experience) formData.append("experience", form.experience)
      if (form.digitalSkillLevel) formData.append("digitalSkillLevel", form.digitalSkillLevel)

      form.skills.forEach((skill) => formData.append("skills", skill))

      if (form.arrivalDate) formData.append("arrivalDate", form.arrivalDate)
      formData.append("duration", form.duration)
      formData.append("motivation", form.motivation.trim())
      formData.append("projectExp", form.projectExp.trim())
      formData.append("source", form.source)
      formData.append("consent", "true")

      if (form.cvFile) formData.append("cvFile", form.cvFile)
      if (form.motivationFile) formData.append("motivationFile", form.motivationFile)
      if (form.portfolioFile) formData.append("portfolioFile", form.portfolioFile)

      const result = await submitCandidateApplicationFormData(formData, lang)
      setIsSubmitting(false)
      if (result.success && result.data) {
        setSubmittedRef(result.data.referenceNumber)
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setErrorMessage(result.error || t.apply.errors.submitError)
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setErrorMessage(err.message || t.apply.errors.submitError)
    }
  }

  // Step definitions
  const STEPS_CONFIG = [
    { num: 1, label: t.apply.steps?.s1 || "Informations", title: t.apply.form?.personalInfo || "Informations personnelles", desc: "Vos coordonnées et informations civiles" },
    { num: 2, label: t.apply.steps?.s2 || "Profil", title: t.apply.form?.profile || "Profil & Formation", desc: "Votre parcours académique et compétences linguistiques" },
    { num: 3, label: t.apply.steps?.s3 || "Compétences", title: t.apply.form?.skillsTitle || "Compétences & Domaines", desc: "Sélectionnez les domaines dans lesquels vous pouvez contribuer" },
    { num: 4, label: t.apply.steps?.s4 || "Disponibilité", title: t.apply.form?.availability || "Disponibilité & Durée", desc: "Période et durée souhaitées pour votre mission au Togo" },
    { num: 5, label: t.apply.steps?.s5 || "Motivation", title: t.apply.form?.motivationTitle || "Votre Motivation", desc: "Exprimez les raisons de votre engagement avec APTIC-R" },
    { num: 6, label: t.apply.steps?.s6 || "Expérience", title: t.apply.form?.expTitle || "Expérience & Projets", desc: "Partagez une réalisation ou une expérience marquante" },
    { num: 7, label: t.apply.steps?.s7 || "Documents", title: t.apply.form?.docsTitle || "Documents & Pièces jointes", desc: "Déposez votre CV et lettre de motivation" },
    { num: 8, label: t.apply.steps?.s8 || "Source", title: t.apply.form?.sourceTitle || "Comment nous avez-vous connus ?", desc: "Aidez-nous à savoir comment vous avez découvert le programme" },
    { num: 9, label: t.apply.steps?.s9 || "Vérification", title: t.apply.form?.reviewTitle || "Vérification & Envoi", desc: "Relisez votre dossier avant de transmettre votre candidature" },
  ]

  // Skills catalogue with SVG library icons
  const SKILLS_CATALOGUE = [
    { slug: "computer-science", title: "Informatique & Systèmes", desc: "Architecture, réseau, infrastructure & outils", icon: MonitorIcon },
    { slug: "data", title: "Données & Analyse", desc: "Traitement de données agricoles, SIG & reporting", icon: BarChartIcon },
    { slug: "web-development", title: "Développement Web", desc: "Applications web, CMS, portails & API", icon: CodeIcon },
    { slug: "mobile-development", title: "Développement Mobile", desc: "Applications Android, offline-first & alertes SMS", icon: SmartphoneIcon },
    { slug: "agriculture", title: "Agriculture & Agroécologie", desc: "Suivi des cultures, maraîchage & durabilité", icon: WheatIcon },
    { slug: "iot", title: "IoT & Systèmes embarqués", desc: "Arduino, Raspberry Pi, capteurs LoRa & météo", icon: CpuIcon },
    { slug: "cybersecurity", title: "Cybersécurité & Réseaux", desc: "Sécurisation des postes et données locales", icon: ShieldIcon },
    { slug: "digital-education", title: "Éducation Numérique", desc: "Pédagogie, animation d'ateliers & formation", icon: GraduationCapIcon },
    { slug: "communication", title: "Communication & Médias", desc: "Photos, vidéos, réseaux & récits de terrain", icon: MessageSquareIcon },
    { slug: "project-management", title: "Gestion de Projet", desc: "Coordination, organisation & lien associatif", icon: FileTextIcon },
  ]

  const SOURCES_LIST = [
    "Google / Moteur de recherche",
    "LinkedIn",
    "Instagram",
    "Facebook",
    "Université / École",
    "France Volontaires",
    "weltwärts",
    "Corps européen de solidarité",
    "Recommandation d'un proche",
    "Autre",
  ]

  // Helper duration label
  const durationText =
    form.duration === "SIX_MONTHS"
      ? "6 mois"
      : form.duration === "NINE_MONTHS"
      ? "9 mois"
      : form.duration === "TWELVE_MONTHS"
      ? "12 mois"
      : "À préciser"

  // ── Success State ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{ backgroundColor: BG_LIGHT }}>
        <div className="max-w-xl w-full text-center bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#EAF0F4]">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#EAF5ED", border: `3px solid ${GREEN}` }}
          >
            <svg className="w-10 h-10 text-[#35A85A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div
            className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: "#E8F2FA", color: BLUE }}
          >
            {t.apply.success.ref} {submittedRef}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-[#1A2B3C]">
            {t.apply.success.title}
          </h1>
          <p className="text-sm sm:text-base mb-2 text-slate-600">
            {t.apply.success.p1_1}<strong>{form.firstName || "Candidat"}</strong>{t.apply.success.p1_2}
          </p>
          <p className="text-xs sm:text-sm mb-8 text-slate-400">
            {t.apply.success.p2_1}<strong>{form.email}</strong>{t.apply.success.p2_2}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("home")}
              className="font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all shadow-sm hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: BLUE }}
            >
              {t.apply.success.backHome}
            </button>
            <button
              onClick={() => navigate("admin-applications")}
              className="font-semibold text-sm px-5 py-3.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {t.apply.success.backOffice}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Page Layout ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: BG_LIGHT,
        fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
      }}
    >

      {/* ── 1. HEADER (Simple, barre d'identité) ──────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "#EAF0F4" }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Gauche : Logo + APTIC-R International Volunteers */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-3 cursor-pointer text-left group"
            aria-label="APTIC-R Accueil"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-[#D8E2E9] flex items-center justify-center p-0.5 shadow-2xs group-hover:border-[#174F7A] transition-colors">
              <img src="/aptic-logo.png" alt="APTIC-R Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-sm leading-none tracking-tight text-[#174F7A]">APTIC-R</div>
              <div className="text-[9px] font-bold tracking-[0.12em] uppercase mt-0.5 text-slate-500">
                International Volunteers
              </div>
            </div>
          </button>

          {/* Droite : CANDIDATURE + Sélecteur FR EN DE */}
          <div className="flex items-center gap-4">
            <span
              className="text-[12px] font-bold tracking-[0.14em] uppercase hidden sm:inline-block"
              style={{ color: BLUE }}
            >
              CANDIDATURE
            </span>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1 bg-[#F5F7F9] p-1 rounded-lg border border-[#EAF0F4]">
              {(["FR", "EN", "DE"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang?.(l)}
                  className="px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer uppercase"
                  style={{
                    backgroundColor: currentLang === l ? "#FFFFFF" : "transparent",
                    color: currentLang === l ? BLUE : "#5E6B76",
                    boxShadow: currentLang === l ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. UNIVERS APTIC-R (Bloc horizontal avec photo modeste épurée à droite) ── */}
      <section className="border-b" style={{ backgroundColor: BG_LIGHT, borderColor: "#EAF0F4" }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Texte à gauche */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white text-[#174F7A] border border-[#D8E2E9] shadow-2xs mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#35A85A]" />
                {t.apply.header?.tag || "CANDIDATURE VOLONTAIRE"}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-[#1A2B3C] mb-2 leading-tight">
                {t.apply.header?.title || "Construisez votre expérience au Togo"}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                {t.apply.header?.desc || "Quelques minutes suffisent pour nous présenter votre profil, vos compétences et votre motivation."}
              </p>

              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#174F7A] bg-white border border-[#D8E2E9] shadow-2xs">
                  <span>{t.apply.header?.context || "6–12 mois · Agbélouvé, Togo · Candidature confidentielle"}</span>
                </div>
              </div>
            </div>

            {/* Photo modeste intégrée à droite — pure, sans aucun texte dessus */}
            <div className="w-full sm:w-[360px] lg:w-[390px] shrink-0">
              <div className="h-[190px] sm:h-[210px] rounded-2xl overflow-hidden shadow-sm border-2 border-white bg-slate-200">
                <img
                  src="/volunteer-togo.jpg"
                  alt="Volontaires et communauté locale au Togo"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FORMULAIRE DE CANDIDATURE (Structure 2 colonnes) ───────────────── */}
      <section className="pt-7 sm:pt-9 pb-16 flex-1" style={{ backgroundColor: BG_LIGHT }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">

            {/* ── COLONNE PRINCIPALE : LE FORMULAIRE (~73%) ─────────────────────── */}
            <div className="w-full lg:w-[73%]">
              <div className="bg-white rounded-3xl p-6 sm:p-9 lg:p-11 shadow-sm border border-[#D8E2E9]">

                {/* En-tête de l'étape active */}
                <div className="mb-8 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#E8F2FA] text-[#174F7A]">
                      ÉTAPE {step} SUR 9
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      · {Math.round((step / 9) * 100)} %
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A2B3C] mb-1.5">
                    {STEPS_CONFIG[step - 1].title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {STEPS_CONFIG[step - 1].desc}
                  </p>

                  {/* Barre fine de progression */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-5">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.round((step / 9) * 100)}%`,
                        backgroundColor: GREEN,
                      }}
                    />
                  </div>
                </div>

                {/* ── ÉTAPE 1 : Informations personnelles ──────────────────────── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.apply.form.firstName}
                        value={form.firstName}
                        onChange={(v) => set("firstName", v)}
                        required
                        placeholder={t.apply.form.firstNamePlaceholder}
                        error={step1Errors.firstName}
                      />
                      <InputField
                        label={t.apply.form.lastName}
                        value={form.lastName}
                        onChange={(v) => set("lastName", v)}
                        required
                        placeholder={t.apply.form.lastNamePlaceholder}
                        error={step1Errors.lastName}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.apply.form.email}
                        type="email"
                        value={form.email}
                        onChange={(v) => set("email", v)}
                        required
                        placeholder={t.apply.form.emailPlaceholder}
                        error={step1Errors.email}
                      />
                      <PhoneInputField
                        label={t.apply.form.phone}
                        countryCode={form.phoneCountryCode}
                        onCountryCodeChange={(v) => set("phoneCountryCode", v)}
                        phone={form.phone}
                        onPhoneChange={(v) => set("phone", v)}
                        placeholder={t.apply.form.phonePlaceholder}
                      />
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed -mt-1">
                      {t.apply.form.emailHelp}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.apply.form.country}
                        value={form.country}
                        onChange={(v) => set("country", v)}
                        required
                        placeholder="Ex: Togo, France, Allemagne, Bénin..."
                      />
                      <InputField
                        label={t.apply.form.city}
                        value={form.city}
                        onChange={(v) => set("city", v)}
                        placeholder="Ex: Lomé, Tsévié, Kpalimé, Kara..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.apply.form.dob}
                        type="date"
                        value={form.dob}
                        onChange={(v) => set("dob", v)}
                        required
                        error={step1Errors.dob}
                      />
                      <InputField
                        label="Nationalité"
                        value={form.nationality}
                        onChange={(v) => set("nationality", v)}
                        placeholder="Ex: Togolaise, Française, Béninoise..."
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                      <LockIcon size={13} className="shrink-0 text-slate-400" />
                      <span>{t.apply.form.dobHelp}</span>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 2 : Profil & Formation ────────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField
                        label={t.apply.form.education}
                        value={form.education}
                        onChange={(v) => set("education", v)}
                        placeholder={t.apply.form.educationPlaceholder}
                      />
                      <InputField
                        label={t.apply.form.field}
                        value={form.fieldOfStudy}
                        onChange={(v) => set("fieldOfStudy", v)}
                        placeholder={t.apply.form.fieldPlaceholder}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField
                        label={t.apply.form.profession}
                        value={form.profession}
                        onChange={(v) => set("profession", v)}
                        placeholder={t.apply.form.professionPlaceholder}
                      />
                      <SelectField
                        label="Niveau d'expérience globale"
                        value={form.experience}
                        onChange={(v) => set("experience", v)}
                        options={[
                          { label: "Étudiant / Débutant (moins d'1 an)", value: "LESS_THAN_1_YEAR" },
                          { label: "Junior (1 à 2 ans)", value: "ONE_TO_TWO_YEARS" },
                          { label: "Intermédiaire (2 à 5 ans)", value: "TWO_TO_FIVE_YEARS" },
                          { label: "Expérimenté (5 ans et plus)", value: "FIVE_PLUS_YEARS" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-3 block text-slate-800">
                        Niveau de langues
                      </label>
                      <div className="space-y-3 pt-1">
                        {[
                          { key: "french" as const, name: "Français" },
                          { key: "english" as const, name: "Anglais" },
                          { key: "german" as const, name: "Allemand" },
                        ].map(({ key, name }) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                            <span className="text-sm font-medium text-slate-700 w-24">{name}</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {[
                                { value: "none", label: "Aucun" },
                                { value: "basic", label: "Notions" },
                                { value: "intermediate", label: "Intermédiaire" },
                                { value: "advanced", label: "Courant" },
                                { value: "native", label: "Langue maternelle" },
                              ].map((lvl) => {
                                const active = form.languages[key] === lvl.value
                                return (
                                  <button
                                    key={lvl.value}
                                    type="button"
                                    onClick={() =>
                                      set("languages", { ...form.languages, [key]: lvl.value })
                                    }
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1"
                                    style={{
                                      backgroundColor: active ? "#EAF5ED" : "#FFFFFF",
                                      color: active ? BLUE : "#5E6B76",
                                      border: `1.5px solid ${active ? GREEN : "#D8E2E9"}`,
                                    }}
                                  >
                                    {active && <CheckIcon size={11} strokeWidth={2.5} />}
                                    <span>{lvl.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 3 : Compétences (Grille de cartes exploitant la largeur) ─ */}
                {step === 3 && (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-slate-600">
                        Sélectionnez les domaines dans lesquels vous pouvez contribuer activement lors de votre mission.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                      {SKILLS_CATALOGUE.map((item) => {
                        const isSelected = form.skills.includes(item.slug)
                        return (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => toggleSkill(item.slug)}
                            className="flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all cursor-pointer hover:shadow-xs"
                            style={{
                              backgroundColor: isSelected ? "#EAF5ED" : "#FFFFFF",
                              border: `1.5px solid ${isSelected ? GREEN : "#D8E2E9"}`,
                            }}
                          >
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                              style={{
                                backgroundColor: isSelected ? GREEN : "#F1F5F9",
                                color: isSelected ? "#FFFFFF" : "#94A3B8",
                              }}
                            >
                              {isSelected ? (
                                <CheckIcon size={12} strokeWidth={2.5} />
                              ) : (
                                <PlusIcon size={12} strokeWidth={2} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: isSelected ? BLUE : TEXT_DARK }}>
                                <item.icon size={16} strokeWidth={2} className={isSelected ? "text-[#174F7A]" : "text-slate-500"} />
                                <span>{item.title}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {form.skills.length > 0 ? (
                      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#EAF5ED] text-[#1A4D2E] text-xs font-semibold">
                        <span className="w-5 h-5 rounded-full bg-[#35A85A] text-white flex items-center justify-center shrink-0">
                          <CheckIcon size={11} strokeWidth={3} />
                        </span>
                        <span>{form.skills.length} compétence{form.skills.length > 1 ? "s" : ""} sélectionnée{form.skills.length > 1 ? "s" : ""}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        Veuillez choisir au moins une compétence pour continuer.
                      </div>
                    )}
                  </div>
                )}

                {/* ── ÉTAPE 4 : Disponibilité & Durée ─────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="max-w-md">
                      <InputField
                        label="Date d'arrivée souhaitée au Togo"
                        type="date"
                        value={form.arrivalDate}
                        onChange={(v) => set("arrivalDate", v)}
                        helpText="Indiquez une date indicative de début souhaitée"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-3 block text-slate-800">
                        Durée de la mission
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          { label: "6 mois", value: "SIX_MONTHS", desc: "Immersion & premier projet" },
                          { label: "9 mois", value: "NINE_MONTHS", desc: "Déploiement complet & relais" },
                          { label: "12 mois", value: "TWELVE_MONTHS", desc: "Transmission approfondie" },
                        ].map((d) => {
                          const isSelected = form.duration === d.value
                          return (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => set("duration", d.value)}
                              className="p-4 rounded-2xl text-left transition-all cursor-pointer"
                              style={{
                                backgroundColor: isSelected ? "#EAF5ED" : "#FFFFFF",
                                border: `1.5px solid ${isSelected ? GREEN : "#D8E2E9"}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-base" style={{ color: isSelected ? BLUE : TEXT_DARK }}>
                                  {d.label}
                                </span>
                                {isSelected && <CheckIcon className="w-4 h-4 text-[#35A85A]" />}
                              </div>
                              <span className="text-xs text-slate-500">{d.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 5 : Motivation ────────────────────────────────────── */}
                {step === 5 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t.apply.form.motivationDesc}
                    </p>
                    <TextareaField
                      label={t.apply.form.motivationLabel}
                      placeholder={t.apply.form.motivationPlaceholder}
                      value={form.motivation}
                      onChange={(v) => set("motivation", v)}
                      rows={8}
                      maxLength={5000}
                      required
                    />
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>
                        {form.motivation.trim().length < 20 ? (
                          "Minimum 20 caractères"
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#35A85A] font-medium">
                            <CheckIcon className="w-3.5 h-3.5" /> Longueur suffisante
                          </span>
                        )}
                      </span>
                      <span>{form.motivation.length} / 5000</span>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 6 : Expérience ────────────────────────────────────── */}
                {step === 6 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t.apply.form.expDesc}
                    </p>
                    <TextareaField
                      label={t.apply.form.expLabel}
                      placeholder={t.apply.form.expPlaceholder}
                      value={form.projectExp}
                      onChange={(v) => set("projectExp", v)}
                      rows={8}
                      maxLength={5000}
                      required
                    />
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>
                        {form.projectExp.trim().length < 20 ? (
                          "Minimum 20 caractères"
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#35A85A] font-medium">
                            <CheckIcon className="w-3.5 h-3.5" /> Longueur suffisante
                          </span>
                        )}
                      </span>
                      <span>{form.projectExp.length} / 5000</span>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 7 : Documents ─────────────────────────────────────── */}
                {step === 7 && (
                  <div className="space-y-5">
                    <FileUpload
                      label={t.apply.form.cv}
                      fileName={form.cvFile?.name || ""}
                      onFile={(f) => set("cvFile", f)}
                    />
                    <FileUpload
                      label={t.apply.form.coverLetter}
                      optional
                      fileName={form.motivationFile?.name || ""}
                      onFile={(f) => set("motivationFile", f)}
                    />
                    <FileUpload
                      label={t.apply.form.portfolio}
                      optional
                      fileName={form.portfolioFile?.name || ""}
                      onFile={(f) => set("portfolioFile", f)}
                    />
                  </div>
                )}

                {/* ── ÉTAPE 8 : Source ────────────────────────────────────────── */}
                {step === 8 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-5">
                      {t.apply.form.sourceTitle}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SOURCES_LIST.map((src) => {
                        const isSelected = form.source === src
                        return (
                          <button
                            key={src}
                            type="button"
                            onClick={() => set("source", src)}
                            className="p-3.5 px-4 rounded-xl text-left text-sm font-medium transition-all cursor-pointer"
                            style={{
                              backgroundColor: isSelected ? "#EAF5ED" : "#FFFFFF",
                              color: isSelected ? BLUE : TEXT_DARK,
                              border: `1.5px solid ${isSelected ? GREEN : "#D8E2E9"}`,
                            }}
                          >
                            {isSelected && <CheckIcon size={14} strokeWidth={2.5} className="text-[#35A85A] mr-2 shrink-0 inline-block" />}
                            <span>{src}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 9 : Vérification finale & Envoi ────────────────────── */}
                {step === 9 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-600">
                      Veuillez vérifier attentivement les détails de votre candidature ci-dessous avant transmission à la coordination APTIC-R.
                    </p>

                    {/* Synthèse épurée sans sous-cartes (pas d'effet dashboard) */}
                    <div className="divide-y divide-slate-100 border-y border-slate-100">
                      {/* Section Coordonnées */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">Coordonnées</span>
                          <button type="button" onClick={() => goToStep(1)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">Modifier</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">Nom :</span> <strong className="text-slate-800 ml-1">{form.firstName} {form.lastName}</strong></div>
                          <div><span className="text-slate-400">E-mail :</span> <strong className="text-slate-800 ml-1">{form.email}</strong></div>
                          <div><span className="text-slate-400">Téléphone :</span> <strong className="text-slate-800 ml-1">{form.phoneCountryCode ? `${form.phoneCountryCode} ${form.phone}`.trim() : form.phone || "Non renseigné"}</strong></div>
                          <div><span className="text-slate-400">Pays / Ville :</span> <strong className="text-slate-800 ml-1">{form.country} {form.city ? `(${form.city})` : ""}</strong></div>
                        </div>
                      </div>

                      {/* Section Mission */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">Mission & Disponibilité</span>
                          <button type="button" onClick={() => goToStep(4)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">Modifier</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">Durée :</span> <strong className="text-slate-800 ml-1">{durationText}</strong></div>
                          <div><span className="text-slate-400">Arrivée souhaitée :</span> <strong className="text-slate-800 ml-1">{form.arrivalDate || "À convenir"}</strong></div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400">Compétences ({form.skills.length}) :</span>{" "}
                            <strong className="text-slate-800 ml-1">{form.skills.join(", ") || "Aucune"}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Section Pièces jointes */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">Documents</span>
                          <button type="button" onClick={() => goToStep(7)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">Modifier</button>
                        </div>
                        <div className="text-xs sm:text-sm space-y-1">
                          <div><span className="text-slate-400">CV :</span> <strong className="text-slate-800 ml-1">{form.cvFile ? form.cvFile.name : "Non transmis"}</strong></div>
                          <div><span className="text-slate-400">Lettre :</span> <strong className="text-slate-800 ml-1">{form.motivationFile ? form.motivationFile.name : "Non fournie"}</strong></div>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox de consentement épurée */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(e) => set("consent", e.target.checked)}
                          className="mt-1 w-4 h-4 rounded text-[#174F7A] cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          J'atteste de l'exactitude des informations fournies et j'accepte que l'association APTIC-R traite mes données personnelles dans le cadre strict de l'évaluation de ma candidature de volontariat international.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Message d'erreur s'il y en a */}
                {errorMessage && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs sm:text-sm flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-xs">!</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ── BOUTONS DE NAVIGATION DU FORMULAIRE ────────────────────── */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      ← Retour
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 9 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!isStepValid(step)}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                      style={{ backgroundColor: GREEN }}
                    >
                      <span>Continuer</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={isSubmitting || !form.consent}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                      style={{ backgroundColor: BLUE }}
                    >
                      {isSubmitting ? (
                        <span>Transmission en cours...</span>
                      ) : (
                        <>
                          <span>Envoyer ma candidature</span>
                          <CheckIcon size={15} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* ── COLONNE LATÉRALE D'ACCOMPAGNEMENT (~27%) ───────────────────── */}
            <aside className="w-full lg:w-[27%] lg:sticky lg:top-24 space-y-5">

              {/* BLOC 1 : PROGRESSION (Verticale & Contrastée) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D8E2E9]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#174F7A] mb-5 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#174F7A]" />
                    PROGRESSION
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2FA] text-[#174F7A]">
                    {step} sur 9
                  </span>
                </div>

                {/* Liste verticale avec ligne continue bien visible */}
                <div className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-3 before:w-[2px] before:bg-[#D8E2E9] space-y-3.5">
                  {STEPS_CONFIG.map((s) => {
                    const isCompleted = s.num < step
                    const isCurrent = s.num === step
                    const isFuture = s.num > step

                    return (
                      <div
                        key={s.num}
                        className={`relative flex items-center gap-3 transition-all ${
                          isCurrent ? "bg-[#F0F5FA] rounded-xl py-1.5 px-2.5 -ml-2.5" : "py-0.5"
                        }`}
                      >
                        {/* Point d'état avec fort contraste */}
                        <div
                          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all absolute -left-6 bg-white"
                          style={{
                            backgroundColor: isCompleted ? GREEN : isCurrent ? BLUE : "#FFFFFF",
                            color: isCompleted || isCurrent ? "#FFFFFF" : "#64748B",
                            border: isFuture ? "2px solid #CBD5E1" : `2px solid ${isCompleted ? GREEN : BLUE}`,
                            boxShadow: isCurrent ? "0 0 0 4px rgba(23,79,122,0.18)" : "none",
                          }}
                        >
                          {isCompleted ? <CheckIcon size={11} strokeWidth={3} /> : s.num}
                        </div>

                        {/* Intitulé cliquable si complété */}
                        <button
                          type="button"
                          onClick={() => goToStep(s.num)}
                          disabled={!isCompleted}
                          className="text-left text-xs transition-colors"
                          style={{
                            color: isCurrent ? BLUE : isCompleted ? TEXT_DARK : "#64748B",
                            fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                            cursor: isCompleted ? "pointer" : "default",
                          }}
                        >
                          {s.label}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BLOC 2 : VOTRE CANDIDATURE (Synthèse en direct contrastée) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D8E2E9]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#174F7A] mb-4 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#35A85A]" />
                  VOTRE CANDIDATURE
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#5E6B76] font-medium">Pays :</span>
                    <strong className="text-[#1A2B3C] font-bold">{form.country || "Non renseigné"}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-100">
                    <span className="text-[#5E6B76] font-medium">Durée :</span>
                    <strong className="text-[#1A2B3C] font-bold">{durationText}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-100">
                    <span className="text-[#5E6B76] font-medium">Compétences :</span>
                    <strong className="text-[#1A2B3C] font-bold">
                      {form.skills.length > 0 ? `${form.skills.length} sélectionnée${form.skills.length > 1 ? "s" : ""}` : "0"}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-100">
                    <span className="text-[#5E6B76] font-medium">Arrivée :</span>
                    <strong className="text-[#1A2B3C] font-bold">{form.arrivalDate || "À préciser"}</strong>
                  </div>
                </div>

                {step === 9 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>Informations complètes</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>Profil complété</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>Compétences sélectionnées</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>Disponibilité indiquée</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>Documents ajoutés</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BLOC 3 : BESOIN D'AIDE ? */}
              <div className="bg-[#F8FAFC] rounded-3xl p-6 shadow-sm border border-[#D8E2E9]">
                <div className="text-sm font-bold text-[#1A2B3C] mb-1.5 flex items-center gap-2">
                  <LightbulbIcon size={17} className="text-[#174F7A] shrink-0" />
                  <span>Besoin d'un éclairage ?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Une question sur la mission, le Togo ou votre candidature ? Notre équipe vous répond avec plaisir.
                </p>
                <a
                  href="mailto:contact@apticr.tg?subject=Question%20Candidature%20Volontaire"
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#174F7A] bg-white border border-[#D8E2E9] px-4 py-2.5 rounded-xl hover:border-[#174F7A] hover:bg-[#F0F5FA] transition-all shadow-2xs w-full cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contacter APTIC-R</span>
                </a>
              </div>

            </aside>

          </div>
        </div>
      </section>

    </div>
  )
}