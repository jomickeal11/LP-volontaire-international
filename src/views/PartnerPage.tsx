"use client"

import { useState, useRef, useEffect } from "react"
import type { Page, Language } from "../types"
import translations from "../i18n/translations"
import {
  CheckIcon,
  GlobeIcon,
  BuildingIcon,
  UsersIcon,
  FileTextIcon,
  ArrowRightIcon,
  LockIcon,
} from "../components/Icons"
import { FREQUENT_COUNTRIES, ALL_COUNTRY_CODES } from "../data/countryPhoneCodes"
import { trackEvent } from "../lib/tracker"

interface PartnerPageProps {
  lang: Language
  navigate: (p: Page) => void
  setLang?: (l: Language) => void
}

const BLUE = "#174F7A"
const GREEN = "#35A85A"
const BG_LIGHT = "#F5F7F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#5E6B76"

// ── Reusable Input Helpers (Identical to ApplyPage design system) ────────────
function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
  helpText,
  list,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  helpText?: string
  list?: string
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
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={list}
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

function DatalistField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Sélectionner ou saisir...",
  required,
  error,
  helpText,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
  required?: boolean
  error?: string
  helpText?: string
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
      <div className="relative w-full">
        <input
          id={id}
          list={`${id}-list`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-4 pr-10 rounded-xl outline-none transition-all duration-200"
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
        <datalist id={`${id}-list`}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {helpText && !error && <span className="text-xs text-slate-500 leading-tight">{helpText}</span>}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}

function PhoneInputField({
  label,
  countryCode,
  countryIso,
  onCountrySelect,
  phone,
  onPhoneChange,
  placeholder,
  required,
}: {
  label: string
  countryCode: string
  countryIso: string
  onCountrySelect: (dial: string, iso: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentCountry =
    ALL_COUNTRY_CODES.find((c) => (countryIso ? c.code === countryIso : c.dial === countryCode)) ||
    FREQUENT_COUNTRIES.find((c) => (countryIso ? c.code === countryIso : c.dial === countryCode))

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

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {required ? (
          <span className="text-red-500 font-bold">*</span>
        ) : (
          <span className="text-xs font-normal text-slate-400">— optionnel</span>
        )}
      </label>

      <div
        className="flex items-center w-full rounded-xl transition-all duration-200 bg-white"
        style={{
          height: "48px",
          border: "1.5px solid #D8E2E9",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-full px-3 flex items-center gap-2 border-r border-[#D8E2E9] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
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
              <span className="text-xs font-medium">Indicatif</span>
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

        <input
          ref={inputRef}
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={placeholder || "01 23 45 67 89"}
          className="flex-1 h-full px-3.5 text-sm outline-none bg-transparent"
          style={{ color: TEXT_DARK }}
        />
      </div>

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
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-full sm:w-[320px] bg-white rounded-2xl shadow-xl border border-[#D8E2E9] overflow-hidden flex flex-col"
            style={{ maxHeight: "320px" }}
          >
            <div className="p-2.5 border-b border-slate-100 bg-[#FAFCFD]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher pays ou indicatif..."
                className="w-full px-3 py-2 text-xs rounded-lg outline-none bg-white border border-[#D8E2E9] focus:border-[#174F7A]"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
              {!search && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                    Pays fréquents
                  </div>
                  {filteredFrequent.map((c) => {
                    const isSelected = countryIso === c.code || (!countryIso && countryCode === c.dial)
                    return (
                      <button
                        key={`freq-${c.code}`}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer hover:bg-[#F0F5FA] ${
                          isSelected ? "bg-[#EAF2F9] font-bold text-[#174F7A]" : "text-slate-700"
                        }`}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-xs shrink-0 shadow-2xs"
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
                    Tous les pays
                  </div>
                )}
                {filteredAll.length > 0 ? (
                  filteredAll.map((c) => {
                    const isSelected = countryIso === c.code || (!countryIso && countryCode === c.dial)
                    return (
                      <button
                        key={`all-${c.code}`}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer hover:bg-[#F0F5FA] ${
                          isSelected ? "bg-[#EAF2F9] font-bold text-[#174F7A]" : "text-slate-700"
                        }`}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-xs shrink-0 shadow-2xs"
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
                    Aucun pays trouvé pour "{search}"
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

function SelectField({
  label,
  options,
  value,
  onChange,
  required,
  error,
  placeholder = "Sélectionner...",
}: {
  label: string
  options: { label: string; value: string }[] | readonly string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  placeholder?: string
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 rounded-xl outline-none transition-all duration-200 cursor-pointer"
        style={{
          height: "48px",
          fontSize: "14px",
          border: error ? "1.5px solid #EF4444" : "1.5px solid #D8E2E9",
          backgroundColor: "#FFFFFF",
          color: value ? TEXT_DARK : "#9AA8B4",
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
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value
          const lab = typeof opt === "string" ? opt : opt.label
          return (
            <option key={val} value={val}>
              {lab}
            </option>
          )
        })}
      </select>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
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
        {required ? (
          <span className="text-red-500 font-bold">*</span>
        ) : (
          <span className="text-xs font-normal text-slate-400">— optionnel</span>
        )}
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
  optional = true,
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
          <div className="text-xs text-slate-400">PDF, DOC, DOCX ou PPT jusqu'à 15 Mo</div>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
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

// ── Main Partner Page Component ─────────────────────────────────────────────
export default function PartnerPage({ navigate, lang }: PartnerPageProps) {
  const currentLang = (lang || "FR").toUpperCase() as keyof typeof translations
  const t = translations[currentLang] || translations.FR

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submittedRef, setSubmittedRef] = useState("PART-2026-001")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const defaultFormState = {
    orgName: "",
    country: "",
    website: "",
    contactPerson: "",
    email: "",
    phoneCountryCode: "+33",
    phoneCountryIso: "FR",
    phone: "",
    orgType: "",
    volunteerCount: "",
    targetCountries: "",
    programme: "",
    message: "",
    docFile: null as File | null,
    consent: false,
  }

  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("apticPartnerFormDraft")
        if (saved) {
          const parsed = JSON.parse(saved)
          return {
            ...defaultFormState,
            ...parsed,
            docFile: null,
          }
        }
      } catch (e) {
        console.error("Failed to load draft", e)
      }
    }
    return defaultFormState
  })

  useEffect(() => {
    const toSave = { ...form }
    delete (toSave as any).docFile
    localStorage.setItem("apticPartnerFormDraft", JSON.stringify(toSave))
  }, [form])

  // Track partner_request_started on page mount
  useEffect(() => {
    trackEvent("partner_request_started", { lang, source: "partner_page_load" })
  }, [lang])

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f: typeof defaultFormState) => ({ ...f, [key]: value }))

  const next = () => {
    setErrorMessage("")
    setStep((s) => Math.min(s + 1, 4))
    window.scrollTo({ top: 320, behavior: "smooth" })
  }

  const back = () => {
    setErrorMessage("")
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 320, behavior: "smooth" })
  }

  const goToStep = (target: number) => {
    if (target < step) {
      setErrorMessage("")
      setStep(target)
      window.scrollTo({ top: 320, behavior: "smooth" })
    }
  }

  // Steps definition
  const STEPS = [
    {
      num: 1,
      title: currentLang === "DE" ? "Organisation" : currentLang === "EN" ? "Organization Info" : "Informations organisation",
      desc: currentLang === "DE" ? "Kontaktdaten Ihrer Einrichtung und Ansprechpartner/in" : currentLang === "EN" ? "Details of your organization and contact person" : "Coordonnées de votre structure et personne de contact",
      icon: BuildingIcon,
    },
    {
      num: 2,
      title: currentLang === "DE" ? "Programm / Partnerschaft" : currentLang === "EN" ? "Program / Partnership" : "Programme / partenariat",
      desc: currentLang === "DE" ? "Einsatzrahmen, Freiwilligenkontingent und Zielländer" : currentLang === "EN" ? "Framework, volunteer volume, and target countries" : "Cadre d'intervention, flux de volontaires et pays cibles",
      icon: UsersIcon,
    },
    {
      num: 3,
      title: currentLang === "DE" ? "Nachricht & Dokument" : currentLang === "EN" ? "Message & Document" : "Message & document",
      desc: currentLang === "DE" ? "Detaillierte Vorstellung Ihres Partnerschaftsvorhabens" : currentLang === "EN" ? "Detailed presentation of your partnership project" : "Présentation détaillée de votre projet de partenariat",
      icon: FileTextIcon,
    },
    {
      num: 4,
      title: currentLang === "DE" ? "Prüfung & Absenden" : currentLang === "EN" ? "Review & Submit" : "Vérification & Envoi",
      desc: currentLang === "DE" ? "Zusammenfassung Ihrer Anfrage vor der Übermittlung an APTIC-R" : currentLang === "EN" ? "Summary of your request before sending to APTIC-R" : "Récapitulatif de votre demande avant transmission à APTIC-R",
      icon: CheckIcon,
    },
  ]

  // Validation per step
  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1:
        return (
          form.orgName.trim().length >= 2 &&
          form.country.trim().length >= 2 &&
          form.contactPerson.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
          form.orgType.trim().length > 0
        )
      case 2:
        return form.volunteerCount.trim().length > 0
      case 3:
        return form.message.trim().length >= 10
      case 4:
        return form.consent
      default:
        return true
    }
  }

  const progressPercentage = Math.round(((step - 1) / (STEPS.length - 1)) * 100)

  // Submit Handler
  const handleSubmit = async () => {
    setLoading(true)
    setErrorMessage("")

    if (!form.orgName.trim() || form.orgName.trim().length < 2) {
      setErrorMessage(currentLang === "DE" ? "Der Name der Organisation ist erforderlich (min. 2 Zeichen)." : currentLang === "EN" ? "Organization name is required (min. 2 characters)." : "Le nom de l'organisation est obligatoire (min. 2 caractères).")
      setLoading(false)
      return
    }
    if (!form.country.trim()) {
      setErrorMessage(currentLang === "DE" ? "Bitte wählen Sie das Land der Organisation aus." : currentLang === "EN" ? "Please select the organization's country." : "Veuillez sélectionner ou renseigner le pays de l'organisation.")
      setLoading(false)
      return
    }
    if (!form.contactPerson.trim() || form.contactPerson.trim().length < 2) {
      setErrorMessage(currentLang === "DE" ? "Der Name der Kontaktperson ist erforderlich." : currentLang === "EN" ? "Contact person name is required." : "Le nom de la personne de contact est obligatoire.")
      setLoading(false)
      return
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMessage(currentLang === "DE" ? "Bitte geben Sie eine gültige geschäftliche E-Mail-Adresse an." : currentLang === "EN" ? "Please provide a valid professional email address." : "Veuillez renseigner une adresse e-mail professionnelle valide.")
      setLoading(false)
      return
    }
    if (!form.orgType) {
      setErrorMessage(currentLang === "DE" ? "Bitte wählen Sie die Art der Organisation aus." : currentLang === "EN" ? "Please specify the organization type." : "Veuillez préciser le type d'organisation.")
      setLoading(false)
      return
    }
    if (!form.volunteerCount) {
      setErrorMessage(currentLang === "DE" ? "Bitte geben Sie die potenzielle Anzahl der Freiwilligen an." : currentLang === "EN" ? "Please indicate the potential number of volunteers." : "Veuillez indiquer le nombre potentiel de volontaires.")
      setLoading(false)
      return
    }
    if (form.message.trim().length < 10) {
      setErrorMessage(currentLang === "DE" ? "Ihre Nachricht muss mindestens 10 Zeichen lang sein." : currentLang === "EN" ? "Your message must be at least 10 characters." : "Votre message doit comporter au moins 10 caractères.")
      setLoading(false)
      return
    }
    if (!form.consent) {
      setErrorMessage(currentLang === "DE" ? "Bitte stimmen Sie den Bedingungen zu, um die Anfrage abzusenden." : currentLang === "EN" ? "Please accept the terms to submit your request." : "Veuillez accepter le consentement pour soumettre la demande.")
      setLoading(false)
      return
    }

    try {
      const { submitPartnerRequestFormData } = await import("../lib/actions")
      const formData = new FormData()
      formData.append("orgName", form.orgName.trim())
      formData.append("country", form.country.trim())
      if (form.website.trim()) formData.append("website", form.website.trim())
      formData.append("contactPerson", form.contactPerson.trim())
      formData.append("email", form.email.trim())
      
      const fullPhone = form.phoneCountryCode
        ? `${form.phoneCountryCode} ${form.phone.trim()}`.trim()
        : form.phone.trim()
      if (fullPhone) formData.append("phone", fullPhone)

      formData.append("orgType", form.orgType)
      formData.append("volunteerCount", form.volunteerCount)
      if (form.targetCountries.trim()) formData.append("targetCountries", form.targetCountries.trim())
      if (form.programme.trim()) formData.append("programme", form.programme.trim())
      formData.append("message", form.message.trim())
      formData.append("consent", "true")

      if (form.docFile) {
        formData.append("docFile", form.docFile)
      }

      const res = await submitPartnerRequestFormData(formData)
      setLoading(false)

      if (res.success && res.data) {
        trackEvent("partner_request_submitted", {
          lang,
          country: form.country,
          source: form.orgType || "organisation",
          metadata: { orgName: form.orgName, reference: res.data.referenceNumber },
        })
        localStorage.removeItem("apticPartnerFormDraft")
        setSubmittedRef(res.data.referenceNumber || "PART-2026-001")
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setErrorMessage(res.error || "Une erreur est survenue lors de la soumission.")
      }
    } catch (err: any) {
      setLoading(false)
      setErrorMessage(err.message || "Erreur de connexion au serveur.")
    }
  }

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24" style={{ backgroundColor: BG_LIGHT }}>
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
            Référence : {submittedRef}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-[#1A2B3C]">
            {t.partner?.success?.title || "Demande de partenariat envoyée."}
          </h1>
          <p className="text-sm sm:text-base mb-2 text-slate-600 leading-relaxed">
            {t.partner?.success?.thanks || "Merci, "}<strong>{form.orgName}</strong>{t.partner?.success?.received || " ! Votre demande de partenariat a bien été reçue par APTIC-R."}
          </p>
          <p className="text-xs sm:text-sm mb-8 text-slate-400 leading-relaxed">
            {t.partner?.success?.review || "Nous étudierons votre demande et répondrons à "}
            <strong className="text-slate-600">{form.email}</strong>
            {t.partner?.success?.timeframe || " sous 5 jours ouvrés."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("home")}
              className="font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all shadow-sm hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: BLUE }}
            >
              {t.partner?.success?.backHome || "Retour à l'accueil"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: BG_LIGHT,
        fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── 1. HEADER BANNER / CONTEXTE (Directement inspiré de ApplyPage) ──── */}
      <section className="border-b" style={{ backgroundColor: BG_LIGHT, borderColor: "#EAF0F4", paddingTop: 80 }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Texte de présentation */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white text-[#174F7A] border border-[#D8E2E9] shadow-2xs mb-3">
                <span className="w-2 h-2 rounded-full bg-[#35A85A]" />
                <span>{t.partner?.hero?.tag || (currentLang === "DE" ? "FÜR ORGANISATIONEN" : currentLang === "EN" ? "FOR ORGANIZATIONS" : "POUR LES ORGANISATIONS")}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#1A2B3C] mb-3 leading-tight">
                {t.partner?.hero?.title || (currentLang === "DE" ? "Werden Sie Partner von APTIC-R" : currentLang === "EN" ? "Become a Partner of APTIC-R" : "Devenez partenaire d’APTIC-R")}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-4">
                {t.partner?.hero?.desc || (currentLang === "DE" ? "APTIC-R sucht europäische Organisationen für langfristige Freiwilligenpartnerschaften in Togo." : currentLang === "EN" ? "APTIC-R is seeking European organizations interested in developing long-term volunteer partnerships in Togo." : "APTIC-R recherche des organisations intéressées par le développement de partenariats de volontariat à long terme au Togo.")}
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#174F7A]">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#D8E2E9] shadow-2xs">
                  {currentLang === "DE" ? "6 bis 12 Monate" : currentLang === "EN" ? "6 to 12 month missions" : "Missions de 6 à 12 mois"}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#D8E2E9] shadow-2xs">
                  Agbélouvé, Région Maritime, Togo
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#D8E2E9] shadow-2xs">
                  {currentLang === "DE" ? "Nachhaltige institutionelle Partnerschaft" : currentLang === "EN" ? "Sustainable institutional partnership" : "Partenariat institutionnel durable"}
                </span>
              </div>
            </div>

            {/* Photo modeste intégrée à droite */}
            <div className="w-full sm:w-[360px] lg:w-[400px] shrink-0">
              <div className="h-[200px] sm:h-[220px] rounded-2xl overflow-hidden shadow-sm border-2 border-white bg-slate-200">
                <img
                  src="/org_meeting.jpg"
                  alt="Partenariat organisation et volontariat Togo"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FORMULAIRE EN 2 COLONNES (73% Formulaire / 27% Sidebar) ──────── */}
      <section className="pt-8 pb-20 flex-1" style={{ backgroundColor: BG_LIGHT }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">

            {/* ── COLONNE PRINCIPALE : LE FORMULAIRE (~73%) ─────────────────────── */}
            <div className="w-full lg:w-[73%]">
              <div className="bg-white rounded-3xl p-6 sm:p-9 lg:p-11 shadow-sm border border-[#D8E2E9]">

                {/* En-tête de l'étape active */}
                <div className="mb-8 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#E8F2FA] text-[#174F7A]">
                      {currentLang === "DE" ? `SCHRITT ${step} VON 4` : currentLang === "EN" ? `STEP ${step} OF 4` : `ÉTAPE ${step} SUR 4`}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      · {progressPercentage} %
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A2B3C] mb-1.5">
                    {STEPS[step - 1].title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {STEPS[step - 1].desc}
                  </p>

                  {/* Barre fine de progression */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-5">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.max(progressPercentage, 10)}%`,
                        backgroundColor: GREEN,
                      }}
                    />
                  </div>
                </div>

                {/* ── ÉTAPE 1 : Informations organisation ──────────────────────── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.partner?.form?.orgName || "Organisation"}
                        value={form.orgName}
                        onChange={(v) => set("orgName", v)}
                        required
                        placeholder={t.partner?.form?.orgNamePlaceholder || (currentLang === "DE" ? "z. B. XYZ Freiwilligenorganisation" : currentLang === "EN" ? "e.g. XYZ Volunteer Organization" : "Ex: Association Solidarité Internationale")}
                      />
                      <DatalistField
                        id="partner-country"
                        label={t.partner?.form?.country || "Pays"}
                        value={form.country}
                        onChange={(v) => set("country", v)}
                        required
                        placeholder={currentLang === "DE" ? "Land auswählen oder eingeben..." : currentLang === "EN" ? "Select or enter a country..." : "Sélectionner ou saisir un pays..."}
                        options={[
                          "France",
                          "Allemagne / Deutschland",
                          "Belgique / Belgium",
                          "Suisse / Switzerland",
                          "Luxembourg",
                          "Espagne / Spain",
                          "Italie / Italy",
                          "Pays-Bas / Netherlands",
                          "Autriche / Austria",
                          "Suède / Sweden",
                          "Danemark / Denmark",
                          "Norvège / Norway",
                          "Portugal",
                          "Canada",
                          "Royaume-Uni / United Kingdom",
                          "États-Unis / United States",
                          "Togo",
                          "Bénin",
                          "Sénégal",
                          "Côte d'Ivoire",
                          "Ghana",
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.partner?.form?.website || "Site web"}
                        type="url"
                        value={form.website}
                        onChange={(v) => set("website", v)}
                        placeholder={t.partner?.form?.websitePlaceholder || "https://organisation.org"}
                      />
                      <DatalistField
                        id="partner-org-type"
                        label={t.partner?.form?.orgType || "Type d'organisation"}
                        value={form.orgType}
                        onChange={(v) => set("orgType", v)}
                        required
                        placeholder={currentLang === "DE" ? "Art der Organisation auswählen..." : currentLang === "EN" ? "Select organization type..." : "Sélectionner ou préciser le type..."}
                        options={t.partner?.form?.orgTypeOptions || [
                          "ONG / Association",
                          "Université / Établissement d'enseignement",
                          "Organisme de programme européen (weltwärts, CES...)",
                          "Agence gouvernementale",
                          "Fondation / Entreprise sociale",
                          "Organisation confessionnelle",
                          "Collectivité territoriale / Ville",
                          "Réseau associatif international",
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.partner?.form?.contactPerson || "Personne de contact"}
                        value={form.contactPerson}
                        onChange={(v) => set("contactPerson", v)}
                        required
                        placeholder={t.partner?.form?.contactPersonPlaceholder || (currentLang === "DE" ? "z. B. Max Mustermann" : currentLang === "EN" ? "e.g. John Doe" : "Ex: Sophie Martin (Responsable partenariats)")}
                      />
                      <InputField
                        label={t.partner?.form?.email || "E-mail professionnel"}
                        type="email"
                        value={form.email}
                        onChange={(v) => set("email", v)}
                        required
                        placeholder={t.partner?.form?.emailPlaceholder || "contact@organisation.org"}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <PhoneInputField
                        label={currentLang === "DE" ? "Telefonnummer" : currentLang === "EN" ? "Phone number" : "Numéro de téléphone"}
                        countryCode={form.phoneCountryCode}
                        countryIso={form.phoneCountryIso}
                        onCountrySelect={(dial, iso) => {
                          setForm((f: typeof defaultFormState) => ({
                            ...f,
                            phoneCountryCode: dial,
                            phoneCountryIso: iso,
                          }))
                        }}
                        phone={form.phone}
                        onPhoneChange={(v) => set("phone", v)}
                        placeholder="01 23 45 67 89"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                      <LockIcon size={13} className="shrink-0 text-slate-400" />
                      <span>
                        {currentLang === "DE"
                          ? "Diese Kontaktdaten werden vom APTIC-R-Team ausschließlich für den Austausch über die Partnerschaft verwendet."
                          : currentLang === "EN"
                          ? "These details will only be used by the APTIC-R team to discuss the partnership."
                          : "Ces coordonnées serviront uniquement à l'équipe APTIC-R pour échanger au sujet du partenariat."}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 2 : Programme / partenariat ────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold mb-3 block text-slate-800">
                        {t.partner?.form?.volunteerCount || "Nombre potentiel de volontaires par an"} <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          {
                            label: currentLang === "DE" ? "1 bis 2 Freiwillige" : currentLang === "EN" ? "1 to 2 volunteers" : "1 à 2 volontaires",
                            value: "1–2",
                            desc: currentLang === "DE" ? "Erste Pilotpartnerschaft" : currentLang === "EN" ? "First pilot partnership" : "Premier partenariat pilote",
                          },
                          {
                            label: currentLang === "DE" ? "3 bis 5 Freiwillige" : currentLang === "EN" ? "3 to 5 volunteers" : "3 à 5 volontaires",
                            value: "3–5",
                            desc: currentLang === "DE" ? "Reguläres Jahresprogramm" : currentLang === "EN" ? "Regular annual program" : "Programme régulier annuel",
                          },
                          {
                            label: currentLang === "DE" ? "5 bis 10 Freiwillige" : currentLang === "EN" ? "5 to 10 volunteers" : "5 à 10 volontaires",
                            value: "5–10",
                            desc: currentLang === "DE" ? "Umfangreiche Partnerschaft" : currentLang === "EN" ? "Large-scale partnership" : "Partenariat d'envergure",
                          },
                          {
                            label: currentLang === "DE" ? "Mehr als 10" : currentLang === "EN" ? "More than 10" : "Plus de 10",
                            value: "10+",
                            desc: currentLang === "DE" ? "Netzwerk oder Konsortium" : currentLang === "EN" ? "Network or consortium" : "Réseau ou consortia",
                          },
                          {
                            label: currentLang === "DE" ? "Noch festzulegen" : currentLang === "EN" ? "To be defined" : "À définir",
                            value: "A_DEFINIR",
                            desc: currentLang === "DE" ? "Wird noch evaluiert" : currentLang === "EN" ? "Under evaluation" : "En cours d'évaluation",
                          },
                        ].map((item) => {
                          const isSelected = form.volunteerCount === item.value
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => set("volunteerCount", item.value)}
                              className="p-4 rounded-2xl text-left transition-all cursor-pointer"
                              style={{
                                backgroundColor: isSelected ? "#EAF5ED" : "#FFFFFF",
                                border: `1.5px solid ${isSelected ? GREEN : "#D8E2E9"}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm" style={{ color: isSelected ? BLUE : TEXT_DARK }}>
                                  {item.label}
                                </span>
                                {isSelected && <CheckIcon className="w-4 h-4 text-[#35A85A]" />}
                              </div>
                              <span className="text-xs text-slate-500">{item.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.partner?.form?.targetCountries || "Pays concernés"}
                        value={form.targetCountries}
                        onChange={(v) => set("targetCountries", v)}
                        placeholder={t.partner?.form?.targetCountriesPlaceholder || "Ex: France, Allemagne, Belgique..."}
                        helpText={currentLang === "DE" ? "Gewöhnliche Herkunftsländer Ihrer Freiwilligen" : currentLang === "EN" ? "Usual origin countries of your volunteers" : "Pays d'origine habituels de vos volontaires"}
                      />

                      <DatalistField
                        id="partner-programme"
                        label={t.partner?.form?.programme || "Programme de volontariat"}
                        value={form.programme}
                        onChange={(v) => set("programme", v)}
                        placeholder={currentLang === "DE" ? "Programm auswählen oder eingeben..." : currentLang === "EN" ? "Select or enter a program..." : "Sélectionner ou saisir un programme..."}
                        options={t.partner?.form?.programmeOptions || [
                          "weltwärts (Allemagne)",
                          "France Volontaires (VSI / Service Civique)",
                          "Corps européen de solidarité (CES)",
                          "Service Civil International (SCI)",
                          "Agir abcd",
                          "Programme universitaire / stage solidaire",
                          "Dispositif interne à l'organisation",
                          "Partenariat bilatéral sur mesure",
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 3 : Message & document ─────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        {currentLang === "DE"
                          ? "Stellen Sie Ihre Organisation, Ihre Erwartungen und die Ziele vor, die Sie mit dieser Freiwilligenpartnerschaft in Togo verfolgen möchten."
                          : currentLang === "EN"
                          ? "Briefly describe your organization, your expectations, and the goals you envision for this volunteer partnership in Togo."
                          : "Présentez brièvement votre structure, vos attentes et les objectifs que vous souhaitez donner à ce partenariat de volontariat au Togo."}
                      </p>
                      <TextareaField
                        label={t.partner?.form?.message || "Message"}
                        placeholder={t.partner?.form?.messagePlaceholder || "Présentez brièvement votre projet de partenariat..."}
                        value={form.message}
                        onChange={(v) => set("message", v)}
                        rows={7}
                        maxLength={4000}
                        required
                      />
                      <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                        <span>
                          {form.message.trim().length < 10 ? (
                            currentLang === "DE" ? "Mindestens 10 Zeichen" : currentLang === "EN" ? "Minimum 10 characters" : "Minimum 10 caractères"
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#35A85A] font-medium">
                              <CheckIcon className="w-3.5 h-3.5" /> {currentLang === "DE" ? "Ausreichende Länge" : currentLang === "EN" ? "Sufficient length" : "Longueur suffisante"}
                            </span>
                          )}
                        </span>
                        <span>{form.message.length} / 4000</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <FileUpload
                        label={t.partner?.form?.doc || "Document de présentation"}
                        optional
                        fileName={form.docFile?.name || ""}
                        onFile={(f) => set("docFile", f)}
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        {currentLang === "DE"
                          ? "Broschüre Ihrer Organisation, Rahmenvereinbarung oder Jahresbericht."
                          : currentLang === "EN"
                          ? "Brochure of your organization, standard framework agreement, or annual report."
                          : "Brochure de votre organisation, accord-cadre type ou rapport d'activité annuel."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 4 : Vérification & Envoi ────────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-600">
                      {currentLang === "DE"
                        ? "Bitte überprüfen Sie die Angaben zu Ihrer Organisation, bevor Sie Ihre Partnerschaftsanfrage an das Team von APTIC-R senden."
                        : currentLang === "EN"
                        ? "Please check your organization details before sending your partnership request to the APTIC-R team."
                        : "Veuillez vérifier les informations de votre organisation avant de transmettre votre demande de partenariat à l'équipe APTIC-R."}
                    </p>

                    <div className="divide-y divide-slate-100 border-y border-slate-100">
                      {/* Section Organisation */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {STEPS[0].title}
                          </span>
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer"
                          >
                            {currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">{t.partner?.form?.orgName || "Organisation"} :</span> <strong className="text-slate-800 ml-1">{form.orgName}</strong></div>
                          <div><span className="text-slate-400">{t.partner?.form?.country || "Pays"} :</span> <strong className="text-slate-800 ml-1">{form.country}</strong></div>
                          <div><span className="text-slate-400">{t.partner?.form?.orgType || "Type"} :</span> <strong className="text-slate-800 ml-1">{form.orgType}</strong></div>
                          <div><span className="text-slate-400">{t.partner?.form?.website || "Site web"} :</span> <strong className="text-slate-800 ml-1">{form.website || (currentLang === "DE" ? "Nicht angegeben" : currentLang === "EN" ? "Not provided" : "Non renseigné")}</strong></div>
                          <div><span className="text-slate-400">{t.partner?.form?.contactPerson || "Contact"} :</span> <strong className="text-slate-800 ml-1">{form.contactPerson}</strong></div>
                          <div><span className="text-slate-400">{t.partner?.form?.email || "E-mail"} :</span> <strong className="text-slate-800 ml-1">{form.email}</strong></div>
                          <div><span className="text-slate-400">{currentLang === "DE" ? "Telefon" : currentLang === "EN" ? "Phone" : "Téléphone"} :</span> <strong className="text-slate-800 ml-1">{form.phone ? `${form.phoneCountryCode} ${form.phone}` : (currentLang === "DE" ? "Nicht angegeben" : currentLang === "EN" ? "Not provided" : "Non renseigné")}</strong></div>
                        </div>
                      </div>

                      {/* Section Programme */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {STEPS[1].title}
                          </span>
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer"
                          >
                            {currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">{currentLang === "DE" ? "Freiwillige / Jahr" : currentLang === "EN" ? "Volunteers / year" : "Volontaires / an"} :</span> <strong className="text-slate-800 ml-1">{form.volunteerCount}</strong></div>
                          <div><span className="text-slate-400">{t.partner?.form?.programme || "Programme"} :</span> <strong className="text-slate-800 ml-1">{form.programme || (currentLang === "DE" ? "Gemeinsam zu definieren" : currentLang === "EN" ? "To be co-designed" : "À co-construire")}</strong></div>
                          <div className="sm:col-span-2"><span className="text-slate-400">{t.partner?.form?.targetCountries || "Pays cibles"} :</span> <strong className="text-slate-800 ml-1">{form.targetCountries || (currentLang === "DE" ? "Alle europäischen Länder" : currentLang === "EN" ? "All European countries" : "Tous pays européens")}</strong></div>
                        </div>
                      </div>

                      {/* Section Message & Document */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {STEPS[2].title}
                          </span>
                          <button
                            type="button"
                            onClick={() => goToStep(3)}
                            className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer"
                          >
                            {currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier"}
                          </button>
                        </div>
                        <div className="text-xs sm:text-sm space-y-2">
                          <div>
                            <span className="text-slate-400 block mb-1">{currentLang === "DE" ? "Übermittelte Nachricht :" : currentLang === "EN" ? "Submitted message:" : "Message transmis :"}</span>
                            <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {form.message}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">{currentLang === "DE" ? "Angehängtes Dokument :" : currentLang === "EN" ? "Attached document:" : "Document joint :"}</span>{" "}
                            <strong className="text-slate-800 ml-1">{form.docFile ? form.docFile.name : (currentLang === "DE" ? "Keine Datei angehängt" : currentLang === "EN" ? "No file attached" : "Aucun fichier joint")}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case de consentement */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(e) => set("consent", e.target.checked)}
                          className="mt-1 w-4 h-4 rounded text-[#174F7A] cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          {t.partner?.form?.consent || "Je consens à ce que APTIC-R traite les informations fournies ci-dessus dans le but d'évaluer un partenariat potentiel. Notre organisation dispose de l'autorité requise pour soumettre cette demande."}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Message d'erreur éventuel */}
                {errorMessage && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs sm:text-sm flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-xs">!</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Boutons de navigation */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {currentLang === "DE" ? "← Zurück" : currentLang === "EN" ? "← Back" : "← Retour"}
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!isStepValid(step)}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                      style={{ backgroundColor: GREEN }}
                    >
                      <span>{currentLang === "DE" ? "Weiter" : currentLang === "EN" ? "Continue" : "Continuer"}</span>
                      <ArrowRightIcon size={16} strokeWidth={2} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !form.consent}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                      style={{ backgroundColor: BLUE }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>{t.partner?.form?.submitting || (currentLang === "DE" ? "Anfrage wird gesendet..." : currentLang === "EN" ? "Sending request..." : "Transmission de la demande...")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.partner?.form?.submit || (currentLang === "DE" ? "Anfrage senden" : currentLang === "EN" ? "Send request" : "Envoyer la demande")}</span>
                          <CheckIcon size={16} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* ── COLONNE LATÉRALE D'ACCOMPAGNEMENT (~27%) ───────────────────── */}
            <aside className="w-full lg:w-[27%] lg:sticky lg:top-24 space-y-5">

              {/* BLOC 1 : ÉTAPES DU FORMULAIRE */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D8E2E9]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#174F7A] mb-5 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#174F7A]" />
                    <span>{currentLang === "DE" ? "FORTSCHRITT" : currentLang === "EN" ? "PROGRESS" : "PROGRESSION"}</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2FA] text-[#174F7A]">
                    {step} {currentLang === "DE" ? "von" : currentLang === "EN" ? "of" : "sur"} 4
                  </span>
                </div>

                <div className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-3 before:w-[2px] before:bg-[#D8E2E9] space-y-3.5">
                  {STEPS.map((s) => {
                    const isCompleted = s.num < step
                    const isCurrent = s.num === step

                    return (
                      <div
                        key={s.num}
                        className={`relative flex items-center gap-3 transition-all ${
                          isCurrent ? "bg-[#F0F5FA] rounded-xl py-1.5 px-2.5 -ml-2.5" : "py-0.5"
                        }`}
                      >
                        <div
                          className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all absolute bg-white ${
                            isCurrent ? "-left-[14px]" : "-left-6"
                          }`}
                          style={{
                            backgroundColor: isCompleted ? GREEN : isCurrent ? BLUE : "#FFFFFF",
                            color: isCompleted || isCurrent ? "#FFFFFF" : "#64748B",
                            border: isCompleted || isCurrent ? "none" : "2px solid #CBD5E1",
                          }}
                        >
                          {isCompleted ? <CheckIcon size={12} strokeWidth={3} /> : s.num}
                        </div>
                        <span
                          className="text-xs font-medium cursor-pointer hover:underline"
                          style={{
                            color: isCurrent ? BLUE : isCompleted ? TEXT_DARK : "#94A3B8",
                            fontWeight: isCurrent ? "700" : isCompleted ? "600" : "500",
                          }}
                          onClick={() => s.num < step && goToStep(s.num)}
                        >
                          {s.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BLOC 2 : POURQUOI UN PARTENARIAT AVEC APTIC-R */}
              <div
                className="rounded-3xl p-6 shadow-sm border border-[#D8E2E9]"
                style={{ backgroundColor: "#E8F2FA" }}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#174F7A] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#35A85A]" />
                  <span>{currentLang === "DE" ? "PARTNERRAHMEN" : currentLang === "EN" ? "PARTNER FRAMEWORK" : "CADRE PARTENAIRE"}</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  {(t.partner?.sidebar?.reasons || [
                    "Missions de 6 à 12 mois adaptées à vos programmes",
                    "Accompagnement et mentorat local continu à Agbélouvé",
                    "Suivi transparent, rapports réguliers et conventionnement officiel",
                  ]).slice(0, 3).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckIcon size={14} className="text-[#35A85A] mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* BLOC 3 : CONTACT DIRECT */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D8E2E9] text-xs">
                <h4 className="font-bold text-sm text-[#174F7A] mb-1">
                  {currentLang === "DE" ? "Eine konkrete Frage?" : currentLang === "EN" ? "A specific question?" : "Une question spécifique ?"}
                </h4>
                <p className="text-slate-500 mb-3 leading-relaxed">
                  {currentLang === "DE"
                    ? "Unser Koordinationsteam beantwortet gerne Ihre rechtlichen und logistischen Fragen."
                    : currentLang === "EN"
                    ? "Our coordination team directly answers your questions regarding legal and logistical aspects."
                    : "Notre équipe de coordination répond directement à vos interrogations sur les aspects juridiques et logistiques."}
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:aptic.rural19@gmail.com?subject=Demande%20Partenariat%20APTIC-R"
                    className="font-bold text-[#174F7A] hover:underline flex items-center gap-1.5"
                  >
                    <span>aptic.rural19@gmail.com</span>
                    <span>→</span>
                  </a>
                  <a
                    href="tel:+22891201990"
                    className="font-semibold text-slate-600 hover:text-[#174F7A] flex items-center gap-1.5"
                  >
                    <span>{currentLang === "DE" ? "Tel" : "Tél"} : +228 91 20 19 90</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

            </aside>

          </div>
        </div>
      </section>
    </div>
  )
}
