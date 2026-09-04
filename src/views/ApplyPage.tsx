import { useState } from "react"
import type { Page, Language } from "../types"

interface ApplyPageProps {
  lang: Language
  navigate: (p: Page) => void
}

const BLUE = "#1B4F7C"
const GREEN = "#2E7D52"
const BG = "#F4F6F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"

const STEPS = [
  { num: 1, label: "Personal Info" },
  { num: 2, label: "Profile" },
  { num: 3, label: "Skills" },
  { num: 4, label: "Availability" },
  { num: 5, label: "Motivation" },
  { num: 6, label: "Experience" },
  { num: 7, label: "Documents" },
  { num: 8, label: "Source" },
  { num: 9, label: "Summary" },
]

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
        {label}
        {required && (
          <span style={{ color: "#DC2626" }} className="ml-0.5">
            *
          </span>
        )}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{
          border: error ? "1.5px solid #DC2626" : "1.5px solid #D1DCE5",
          backgroundColor: "#fff",
          color: TEXT_DARK,
        }}
        onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${error ? "#DC2626" : BLUE}`)}
        onBlur={(e) => (e.currentTarget.style.border = error ? "1.5px solid #DC2626" : "1.5px solid #D1DCE5")}
      />
      {error && <span className="text-xs" style={{ color: "#DC2626" }}>{error}</span>}
    </div>
  )
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{
          border: "1.5px solid #D1DCE5",
          backgroundColor: "#fff",
          color: value ? TEXT_DARK : "#9AA8B4",
        }}
        onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${BLUE}`)}
        onBlur={(e) => (e.currentTarget.style.border = "1.5px solid #D1DCE5")}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
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
  rows = 5,
  required,
  error,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  required?: boolean
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
        {label}
        {required && (
          <span style={{ color: "#DC2626" }} className="ml-0.5">
            *
          </span>
        )}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
        style={{
          border: error ? "1.5px solid #DC2626" : "1.5px solid #D1DCE5",
          backgroundColor: "#fff",
          color: TEXT_DARK,
        }}
        onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${error ? "#DC2626" : BLUE}`)}
        onBlur={(e) => (e.currentTarget.style.border = error ? "1.5px solid #DC2626" : "1.5px solid #D1DCE5")}
      />
      {error && <span className="text-xs" style={{ color: "#DC2626" }}>{error}</span>}
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
  onFile: (name: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
        {label}
        {optional && (
          <span
            className="ml-1 text-xs font-normal"
            style={{ color: "#9AA8B4" }}
          >
            — optional
          </span>
        )}
      </label>
      {fileName ? (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{ backgroundColor: "#E6F4EC", border: "1.5px solid #A7D9BC" }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              style={{ color: GREEN }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium" style={{ color: GREEN }}>
              {fileName}
            </span>
          </div>
          <button
            onClick={() => onFile("")}
            className="text-xs px-2 py-0.5 rounded"
            style={{ color: "#DC2626", backgroundColor: "#FEE2E2" }}
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg cursor-pointer transition-colors"
          style={{ border: "2px dashed #D1DCE5", backgroundColor: BG }}
          onDragOver={(e) => e.preventDefault()}
        >
          <svg
            className="w-8 h-8"
            style={{ color: "#9AA8B4" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-sm font-medium" style={{ color: TEXT_MID }}>
            Click to upload or drag and drop
          </div>
          <div className="text-xs" style={{ color: "#9AA8B4" }}>
            PDF, DOC, DOCX up to 10MB
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f.name)
            }}
          />
        </label>
      )}
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step - 1) / (total - 1)) * 100)
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: BLUE }}>
          Step {step} of {total}
        </span>
        <span className="text-xs" style={{ color: "#9AA8B4" }}>
          {pct}% complete
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "#E8ECF2" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: BLUE }}
        />
      </div>
    </div>
  )
}

// ── Step Navigation ───────────────────────────────────────────────────────────
function StepNav({
  step,
  onBack,
  onNext,
  nextLabel = "Continue →",
  isLast,
  disabled,
}: {
  step: number
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  isLast?: boolean
  disabled?: boolean
}) {
  return (
    <div
      className="flex justify-between items-center mt-8 pt-6"
      style={{ borderTop: "1px solid #E8ECF2" }}
    >
      {step > 1 ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ color: TEXT_MID, backgroundColor: BG }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#E8ECF2")
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG)}
        >
          ← Back
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: isLast ? GREEN : BLUE }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = isLast
              ? "#256643"
              : "#163f63"
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = isLast ? GREEN : BLUE
          }
        }}
      >
        {nextLabel}
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ApplyPage({ lang, navigate }: ApplyPageProps) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submittedRef, setSubmittedRef] = useState("APTIC-2025-001")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "France",
    city: "",
    dob: "",
    education: "",
    fieldOfStudy: "",
    profession: "",
    experience: "LESS_THAN_1_YEAR" as any,
    digitalSkillLevel: "",
    skills: [] as string[],
    arrivalDate: "",
    duration: "SIX_MONTHS" as any,
    motivation: "",
    projectExp: "",
    cvFile: "",
    motivationFile: "",
    portfolioFile: "",
    source: "",
    consent: false,
  })

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleSkill = (skill: string) => {
    const current = form.skills
    set(
      "skills",
      current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill],
    )
  }

  const next = () => {
    setErrorMessage("")
    setStep((s) => Math.min(s + 1, 9))
  }
  const back = () => {
    setErrorMessage("")
    setStep((s) => Math.max(s - 1, 1))
  }

  // ── Step validation ──────────────────────────────────────────────────────
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

  // Show inline errors when at least one required field in the step has been filled
  const step1HasActivity = [form.firstName, form.lastName, form.email, form.dob].some(v => v.trim().length > 0)
  const step1Errors = step1HasActivity ? {
    firstName: form.firstName.trim().length < 2 ? "Pr\u00e9nom obligatoire (min. 2 caract\u00e8res)" : undefined,
    lastName: form.lastName.trim().length < 2 ? "Nom obligatoire (min. 2 caract\u00e8res)" : undefined,
    email: form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Adresse e-mail invalide" : (!form.email ? "E-mail obligatoire" : undefined),
    dob: !form.dob ? "Date de naissance obligatoire" : undefined,
  } : {}

  const submit = async () => {
    setIsSubmitting(true)
    setErrorMessage("")

    // ── Frontend validation ──────────────────────────────────────────
    if (!form.firstName.trim() || form.firstName.trim().length < 2) {
      setErrorMessage("Veuillez renseigner votre prénom (au moins 2 caractères).")
      setIsSubmitting(false)
      return
    }
    if (!form.lastName.trim() || form.lastName.trim().length < 2) {
      setErrorMessage("Veuillez renseigner votre nom (au moins 2 caractères).")
      setIsSubmitting(false)
      return
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMessage("Veuillez renseigner une adresse e-mail valide.")
      setIsSubmitting(false)
      return
    }
    if (!form.country.trim()) {
      setErrorMessage("Veuillez sélectionner un pays.")
      setIsSubmitting(false)
      return
    }
    if (!form.dob) {
      setErrorMessage("Veuillez renseigner votre date de naissance.")
      setIsSubmitting(false)
      return
    }
    if (form.skills.length === 0) {
      setErrorMessage("Veuillez sélectionner au moins une compétence.")
      setIsSubmitting(false)
      return
    }
    if (form.motivation.trim().length < 20) {
      setErrorMessage("Veuillez détailler votre motivation (au moins 20 caractères).")
      setIsSubmitting(false)
      return
    }
    if (form.motivation.trim().length > 5000) {
      setErrorMessage("La motivation ne doit pas dépasser 5000 caractères.")
      setIsSubmitting(false)
      return
    }
    if (form.projectExp.trim().length < 20) {
      setErrorMessage("Veuillez détailler votre expérience projet (au moins 20 caractères).")
      setIsSubmitting(false)
      return
    }
    if (form.projectExp.trim().length > 5000) {
      setErrorMessage("L'expérience projet ne doit pas dépasser 5000 caractères.")
      setIsSubmitting(false)
      return
    }
    if (!form.source) {
      setErrorMessage("Veuillez indiquer comment vous avez connu APTIC-R.")
      setIsSubmitting(false)
      return
    }
    if (!form.consent) {
      setErrorMessage("Veuillez accepter le traitement des données pour soumettre votre candidature.")
      setIsSubmitting(false)
      return
    }

    // ── Server call — no fallback values ─────────────────────────────
    const { submitCandidateApplication } = await import("../lib/actions")
    const result = await submitCandidateApplication(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        country: form.country,
        city: form.city.trim() || undefined,
        dob: form.dob,
        education: form.education.trim() || undefined,
        fieldOfStudy: form.fieldOfStudy.trim() || undefined,
        profession: form.profession.trim() || undefined,
        experience: form.experience || undefined,
        digitalSkillLevel: (form.digitalSkillLevel || undefined) as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | undefined,
        skills: form.skills,
        arrivalDate: form.arrivalDate || undefined,
        duration: form.duration,
        motivation: form.motivation.trim(),
        projectExp: form.projectExp.trim(),
        cvFile: form.cvFile || undefined,
        motivationFile: form.motivationFile || undefined,
        portfolioFile: form.portfolioFile || undefined,
        source: form.source,
        consent: form.consent,
      },
      lang,
    )

    setIsSubmitting(false)
    if (result.success && result.data) {
      setSubmittedRef(result.data.referenceNumber)
      setSubmitted(true)
    } else {
      setErrorMessage(
        result.error || "Une erreur est survenue lors de la soumission.",
      )
    }
  }

  const SKILLS = [
    { label: "Computer Science", slug: "computer-science" },
    { label: "Data Science", slug: "data" },
    { label: "Web Development", slug: "web-development" },
    { label: "Mobile Development", slug: "mobile-development" },
    { label: "Cybersecurity", slug: "cybersecurity" },
    { label: "Agriculture", slug: "agriculture" },
    { label: "Graphic Design", slug: "graphic-design" },
    { label: "Communication", slug: "communication" },
    { label: "Content Creation", slug: "content-creation" },
    { label: "Arduino", slug: "arduino" },
    { label: "Raspberry Pi", slug: "raspberry-pi" },
    { label: "IoT", slug: "iot" },
    { label: "Digital Education", slug: "digital-education" },
    { label: "Project Management", slug: "project-management" },
  ]

  const SOURCES = [
    "Google",
    "LinkedIn",
    "Instagram",
    "Facebook",
    "University",
    "Volunteer organization",
    "France Volontaires",
    "weltwärts",
    "Corps de solidarité européen",
    "Friend",
    "Other",
  ]

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-24"
        style={{ paddingTop: 100, backgroundColor: BG }}
      >
        <div className="max-w-lg w-full text-center bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#E6F4EC", border: `3px solid ${GREEN}` }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: GREEN }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div
            className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: "#E8F2FA", color: BLUE }}
          >
            Référence : {submittedRef}
          </div>

          <h1
            className="text-3xl mb-3"
            style={{
              fontFamily: "DM Serif Display, Georgia, serif",
              color: TEXT_DARK,
            }}
          >
            Candidature enregistrée avec succès !
          </h1>
          <p className="text-sm mb-2" style={{ color: TEXT_MID }}>
            Merci, <strong>{form.firstName || "Candidat"}</strong> ! Votre
            candidature a été transmise à l'équipe de coordination d'APTIC-R à
            Agbélouvé.
          </p>
          <p className="text-xs mb-8" style={{ color: "#9AA8B4" }}>
            Un email de confirmation vous sera envoyé à{" "}
            <strong>{form.email}</strong>. Notre équipe étudiera votre dossier
            sous 1 à 2 semaines.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("home")}
              className="font-bold text-sm px-6 py-3 rounded-lg text-white transition-all shadow-sm cursor-pointer hover:shadow"
              style={{ backgroundColor: BLUE }}
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate("admin-applications")}
              className="font-semibold text-sm px-5 py-3 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Voir dans le Back-office →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ paddingTop: 80, backgroundColor: BG }}
    >
      {/* Page header */}
      <div className="py-10 lg:py-14" style={{ backgroundColor: BLUE }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Volunteer Application
          </div>
          <h1
            className="text-3xl lg:text-4xl text-white"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            Apply to volunteer with APTIC-R
          </h1>
          <p
            className="mt-3 text-sm"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            This application takes about 15–20 minutes. All information is kept
            confidential.
          </p>
        </div>
      </div>

      {/* Step indicator tabs */}
      <div className="overflow-x-auto" style={{ backgroundColor: "#163f63" }}>
        <div className="flex min-w-max max-w-3xl mx-auto px-4 sm:px-6">
          {STEPS.slice(0, 8).map((s) => (
            <button
              key={s.num}
              className="flex-shrink-0 py-3 px-3 text-xs font-medium transition-colors"
              style={{
                color: step === s.num ? "white" : "rgba(255,255,255,0.45)",
                borderBottom:
                  step === s.num ? `2px solid white` : "2px solid transparent",
              }}
              onClick={() => s.num < step && setStep(s.num)}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div
          className="bg-white rounded-2xl p-6 lg:p-10"
          style={{
            boxShadow: "0 2px 24px rgba(27,79,124,0.07)",
            border: "1px solid #E8ECF2",
          }}
        >
          <ProgressBar step={Math.min(step, 9)} total={9} />

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2 className="text-xl mb-6" style={{ color: TEXT_DARK }}>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  required
                  placeholder="Maria"
                  error={step1Errors.firstName}
                />
                <InputField
                  label="Last Name"
                  value={form.lastName}
                  onChange={(v) => set("lastName", v)}
                  required
                  placeholder="Dupont"
                  error={step1Errors.lastName}
                />
                <InputField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  required
                  placeholder="maria@example.com"
                  error={step1Errors.email}
                />
                <InputField
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  placeholder="+33 6 12 34 56 78"
                />
                <SelectField
                  label="Country"
                  value={form.country}
                  onChange={(v) => set("country", v)}
                  options={[
                    "France",
                    "Germany",
                    "Belgium",
                    "Switzerland",
                    "Netherlands",
                    "Austria",
                    "Sweden",
                    "Denmark",
                    "Norway",
                    "Spain",
                    "Italy",
                    "Portugal",
                    "Poland",
                    "Czech Republic",
                    "Hungary",
                    "Romania",
                    "Other",
                  ]}
                />
                <InputField
                  label="City"
                  value={form.city}
                  onChange={(v) => set("city", v)}
                  placeholder="Paris"
                />
                <InputField
                  label="Date of birth"
                  type="date"
                  value={form.dob}
                  onChange={(v) => set("dob", v)}
                  required
                  error={step1Errors.dob}
                />
              </div>
              <div
                className="mt-5 p-4 rounded-xl flex items-center gap-3 text-xs"
                style={{
                  backgroundColor: "#E8F2FA",
                  color: "#4A5A6A",
                  border: "1px solid #D8E5F0",
                }}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: BLUE }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>
                  Your personal data is processed in accordance with our privacy
                  policy and used only for the purpose of this application.
                </span>
              </div>
              <StepNav step={step} onBack={back} onNext={next} disabled={!isStepValid(1)} />
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div>
              <h2 className="text-xl mb-6" style={{ color: TEXT_DARK }}>
                Your Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Level of education"
                  value={form.education}
                  onChange={(v) => set("education", v)}
                  placeholder="Master's in Computer Science"
                />
                <InputField
                  label="Field of study"
                  value={form.fieldOfStudy}
                  onChange={(v) => set("fieldOfStudy", v)}
                  placeholder="Computer Science"
                />
                <InputField
                  label="Profession / current status"
                  value={form.profession}
                  onChange={(v) => set("profession", v)}
                  placeholder="Student / Developer / Agronomist..."
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
                    Level of experience
                  </label>
                  <select
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      border: "1.5px solid #D1DCE5",
                      backgroundColor: "#fff",
                      color: form.experience ? TEXT_DARK : "#9AA8B4",
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="LESS_THAN_1_YEAR">Less than 1 year</option>
                    <option value="ONE_TO_TWO_YEARS">1–2 years</option>
                    <option value="TWO_TO_FIVE_YEARS">2–5 years</option>
                    <option value="FIVE_PLUS_YEARS">5+ years</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="text-sm font-semibold mb-2 block"
                  style={{ color: TEXT_DARK }}
                >
                  Digital skills level
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Digital Skills level - we keep simple string mapping for now */}
                  {[
                    { label: "Beginner", value: "BEGINNER" },
                    { label: "Intermediate", value: "INTERMEDIATE" },
                    { label: "Advanced", value: "ADVANCED" },
                    { label: "Expert", value: "EXPERT" },
                  ].map((level) => {
                    const active = form.digitalSkillLevel === level.value
                    return (
                      <button
                        key={level.value}
                        onClick={() => set("digitalSkillLevel", level.value)}
                        className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
                        style={{
                          backgroundColor: active ? BLUE : BG,
                          color: active ? "white" : TEXT_MID,
                          border: `1.5px solid ${active ? BLUE : "#D1DCE5"}`,
                        }}
                      >
                        {active && "✓ "}{level.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <StepNav step={step} onBack={back} onNext={next} />
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div>
              <h2 className="text-xl mb-2" style={{ color: TEXT_DARK }}>
                Skills & Competencies
              </h2>
              <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
                Select all that apply to you.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {SKILLS.map((skill) => {
                  const active = form.skills.includes(skill.slug)
                  return (
                    <button
                      key={skill.slug}
                      onClick={() => toggleSkill(skill.slug)}
                      className="text-sm px-3.5 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: active ? BLUE : "#fff",
                        color: active ? "white" : TEXT_DARK,
                        border: `1.5px solid ${active ? BLUE : "#D1DCE5"}`,
                      }}
                    >
                      {active && "✓ "}
                      {skill.label}
                    </button>
                  )
                })}
              </div>
              {form.skills.length > 0 && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{ backgroundColor: "#E6F4EC", color: GREEN }}
                >
                  ✓ {form.skills.length} skill
                  {form.skills.length > 1 ? "s" : ""} selected
                </div>
              )}
              <StepNav step={step} onBack={back} onNext={next} disabled={!isStepValid(3)} />
            </div>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <div>
              <h2 className="text-xl mb-6" style={{ color: TEXT_DARK }}>
                Availability
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="Desired arrival date"
                  type="date"
                  value={form.arrivalDate}
                  onChange={(v) => set("arrivalDate", v)}
                />
              </div>
              <div>
                <label
                  className="text-sm font-semibold mb-3 block"
                  style={{ color: TEXT_DARK }}
                >
                  Mission duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "6 months", value: "SIX_MONTHS" },
                    { label: "9 months", value: "NINE_MONTHS" },
                    { label: "12 months", value: "TWELVE_MONTHS" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => set("duration", d.value)}
                      className="p-4 rounded-xl text-sm font-semibold transition-all text-center"
                      style={{
                        backgroundColor: form.duration === d.value ? BLUE : "#fff",
                        color: form.duration === d.value ? "white" : TEXT_DARK,
                        border: `2px solid ${
                          form.duration === d.value ? BLUE : "#D1DCE5"
                        }`,
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <StepNav step={step} onBack={back} onNext={next} />
            </div>
          )}

          {/* Step 5: Motivation */}
          {step === 5 && (
            <div>
              <h2 className="text-xl mb-2" style={{ color: TEXT_DARK }}>
                Your Motivation
              </h2>
              <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
                Tell us in your own words why you want to volunteer with
                APTIC-R.
              </p>
              <TextareaField
                label="Why do you want to volunteer with APTIC-R?"
                placeholder="I am motivated by the opportunity to apply my skills in a context that truly matters. I believe technology can be a powerful tool for rural development when it is designed with and for communities..."
                value={form.motivation}
                onChange={(v) => set("motivation", v)}
                rows={8}
                required
                error={form.motivation.length > 0 && form.motivation.trim().length < 20 ? "Minimum 20 caract\u00e8res requis" : (form.motivation.trim().length > 5000 ? "Maximum 5000 caract\u00e8res" : undefined)}
              />
              <div className="mt-2 flex justify-between">
                <span className="text-xs" style={{ color: form.motivation.trim().length > 5000 ? "#DC2626" : "#9AA8B4" }}>
                  {form.motivation.trim().length < 20 && form.motivation.length > 0 ? `${20 - form.motivation.trim().length} caract\u00e8res restants` : ""}
                </span>
                <span className="text-xs" style={{ color: form.motivation.trim().length > 5000 ? "#DC2626" : "#9AA8B4" }}>
                  {form.motivation.length} / 5000
                </span>
              </div>
              <StepNav step={step} onBack={back} onNext={next} disabled={!isStepValid(5)} />
            </div>
          )}

          {/* Step 6: Experience */}
          {step === 6 && (
            <div>
              <h2 className="text-xl mb-2" style={{ color: TEXT_DARK }}>
                Your Experience
              </h2>
              <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
                Tell us about a project you have worked on — technical,
                collaborative, or community-oriented.
              </p>
              <TextareaField
                label="Describe a project you are proud of"
                placeholder="I developed a soil moisture monitoring system for a community garden using Arduino and LoRa. The system sends automated SMS alerts to 12 gardeners, reducing water waste by 30%..."
                value={form.projectExp}
                onChange={(v) => set("projectExp", v)}
                rows={8}
                required
                error={form.projectExp.length > 0 && form.projectExp.trim().length < 20 ? "Minimum 20 caract\u00e8res requis" : (form.projectExp.trim().length > 5000 ? "Maximum 5000 caract\u00e8res" : undefined)}
              />
              <div className="mt-2 flex justify-between">
                <span className="text-xs" style={{ color: form.projectExp.trim().length > 5000 ? "#DC2626" : "#9AA8B4" }}>
                  {form.projectExp.trim().length < 20 && form.projectExp.length > 0 ? `${20 - form.projectExp.trim().length} caract\u00e8res restants` : ""}
                </span>
                <span className="text-xs" style={{ color: form.projectExp.trim().length > 5000 ? "#DC2626" : "#9AA8B4" }}>
                  {form.projectExp.length} / 5000
                </span>
              </div>
              <StepNav step={step} onBack={back} onNext={next} disabled={!isStepValid(6)} />
            </div>
          )}

          {/* Step 7: Documents */}
          {step === 7 && (
            <div>
              <h2 className="text-xl mb-6" style={{ color: TEXT_DARK }}>
                Documents
              </h2>
              <div className="flex flex-col gap-5">
                <FileUpload
                  label="CV / Résumé"
                  fileName={form.cvFile}
                  onFile={(n) => set("cvFile", n)}
                />
                <FileUpload
                  label="Cover Letter / Lettre de motivation"
                  fileName={form.motivationFile}
                  onFile={(n) => set("motivationFile", n)}
                />
                <FileUpload
                  label="Portfolio"
                  optional
                  fileName={form.portfolioFile}
                  onFile={(n) => set("portfolioFile", n)}
                />
              </div>
              <StepNav step={step} onBack={back} onNext={next} />
            </div>
          )}

          {/* Step 8: Source */}
          {step === 8 && (
            <div>
              <h2 className="text-xl mb-6" style={{ color: TEXT_DARK }}>
                How did you hear about APTIC-R?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SOURCES.map((src) => (
                  <button
                    key={src}
                    onClick={() => set("source", src)}
                    className="p-3 rounded-lg text-sm font-medium text-left transition-all"
                    style={{
                      backgroundColor: form.source === src ? "#E8F2FA" : "#fff",
                      color: form.source === src ? BLUE : TEXT_DARK,
                      border: `1.5px solid ${
                        form.source === src ? BLUE : "#D1DCE5"
                      }`,
                    }}
                  >
                    {form.source === src && "✓ "}
                    {src}
                  </button>
                ))}
              </div>
              <StepNav
                step={step}
                onBack={back}
                onNext={next}
                nextLabel="Review application \u2192"
                disabled={!isStepValid(8)}
              />
            </div>
          )}

          {/* Step 9: Summary */}
          {step === 9 && (
            <div>
              <h2 className="text-xl mb-2" style={{ color: TEXT_DARK }}>
                Review & Submit
              </h2>
              <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
                Please review your information before submitting.
              </p>

              <div className="flex flex-col gap-4 mb-6">
                {[
                  {
                    title: "Personal Information",
                    step: 1,
                    items: [
                      {
                        label: "Name",
                        value: `${form.firstName} ${form.lastName}`,
                      },
                      { label: "Email", value: form.email || "—" },
                      { label: "Country", value: form.country || "—" },
                      { label: "Date of birth", value: form.dob || "—" },
                    ],
                  },
                  {
                    title: "Profile",
                    step: 2,
                    items: [
                      { label: "Education", value: form.education || "—" },
                      { label: "Field", value: form.fieldOfStudy || "—" },
                      { label: "Profession", value: form.profession || "—" },
                    ],
                  },
                  {
                    title: "Skills",
                    step: 3,
                    items: [
                      {
                        label: "Selected skills",
                        value: form.skills.length
                          ? form.skills.join(", ")
                          : "—",
                      },
                    ],
                  },
                  {
                    title: "Availability",
                    step: 4,
                    items: [
                      { label: "Arrival date", value: form.arrivalDate || "—" },
                      { label: "Duration", value: form.duration || "—" },
                    ],
                  },
                  {
                    title: "Documents",
                    step: 7,
                    items: [
                      { label: "CV", value: form.cvFile || "Not provided" },
                      {
                        label: "Cover letter",
                        value: form.motivationFile || "Not provided",
                      },
                      {
                        label: "Portfolio",
                        value: form.portfolioFile || "Not provided (optional)",
                      },
                    ],
                  },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: BG, border: "1px solid #E8ECF2" }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm" style={{ color: TEXT_DARK }}>
                        {section.title}
                      </h4>
                      <button
                        onClick={() => setStep(section.step)}
                        className="text-xs font-semibold"
                        style={{ color: BLUE }}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {section.items.map((item) => (
                        <div key={item.label}>
                          <span
                            className="text-xs"
                            style={{ color: "#9AA8B4" }}
                          >
                            {item.label}:{" "}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: TEXT_DARK }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="p-4 rounded-xl mb-6"
                style={{
                  backgroundColor: "#E8F2FA",
                  border: `1.5px solid ${BLUE}30`,
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="mt-0.5 flex-shrink-0"
                    style={{ accentColor: BLUE, width: 16, height: 16 }}
                  />
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: TEXT_MID }}
                  >
                    I consent to APTIC-R processing my personal data for the
                    purpose of evaluating my volunteer application. I have read
                    and understood the{" "}
                    <button className="underline" style={{ color: BLUE }}>
                      privacy policy
                    </button>
                    .
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl mb-6 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <StepNav
                step={step}
                onBack={back}
                onNext={submit}
                nextLabel={
                  isSubmitting ? "ENVOI EN COURS..." : "SEND MY APPLICATION ✓"
                }
                isLast
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
