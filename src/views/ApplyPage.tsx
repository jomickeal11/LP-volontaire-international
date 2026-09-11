import { useState, useRef, useEffect } from "react"
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
  GlobeIcon,
  SearchIcon,
  PaletteIcon,
  PenToolIcon,
  SignalIcon,
} from "../components/Icons"
import { FREQUENT_COUNTRIES, ALL_COUNTRY_CODES } from "../data/countryPhoneCodes"
import { trackEvent } from "../lib/tracker"

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

const LANGUAGE_LEVEL_LABELS: Record<string, Record<string, string>> = {
  FR: { none: "Aucun", basic: "Notions", intermediate: "Intermédiaire", advanced: "Courant", native: "Langue maternelle" },
  EN: { none: "None", basic: "Basic", intermediate: "Intermediate", advanced: "Fluent", native: "Native" },
  DE: { none: "Keine", basic: "Grundkenntnisse", intermediate: "Mittelstufe", advanced: "Fließend", native: "Muttersprache" },
}

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
  min,
  max,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  helpText?: string
  min?: string
  max?: string
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
        min={min}
        max={max}
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

function DatalistField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
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
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          list={`${id}-list`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "..."}
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
  const searchPlaceholder = currentLang === "DE" ? "Land oder Vorwahl suchen (z. B. Togo, +228)..." : currentLang === "EN" ? "Search country or dial code (e.g. Togo, +228)..." : "Rechercher pays ou indicatif (ex: Togo, +228)..."
  const frequentLabel = currentLang === "DE" ? "Häufige Länder" : currentLang === "EN" ? "Frequent countries" : "Pays fréquents"
  const allCountriesLabel = currentLang === "DE" ? "Alle Länder" : currentLang === "EN" ? "All countries" : "Tous les pays"
  const noCountryText = currentLang === "DE" ? `Kein Land gefunden für "${search}"` : currentLang === "EN" ? `No country found for "${search}"` : `Aucun pays trouvé pour "${search}"`

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {required ? (
          <span className="text-red-500 font-bold">*</span>
        ) : (
          <span className="text-xs font-normal text-slate-400">{optionalText}</span>
        )}
      </label>

      <div
        className="flex items-center w-full rounded-xl transition-all duration-200 bg-white"
        style={{
          height: "48px",
          border: "1.5px solid #D8E2E9",
        }}
      >
        {/* Trigger Button with Flag */}
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
          className="flex-1 h-full px-3.5 text-sm outline-none bg-transparent"
          style={{ color: TEXT_DARK }}
        />
      </div>

      {/* Dropdown Popover with Flags */}
      {open && (
        <>
          {/* Backdrop to close on any outside click */}
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
            {/* Search bar inside dropdown */}
            <div className="p-2.5 border-b border-slate-100 bg-[#FAFCFD]">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 focus-within:border-[#174F7A]">
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

            {/* Scrollable list */}
            <div className="overflow-y-auto divide-y divide-slate-50" style={{ maxHeight: "310px" }}>
              {/* Frequent section */}
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
                          isSelected ? "bg-[#EAF2F9] font-bold text-[#174F7A]" : "text-slate-700"
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

              {/* All countries section */}
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
                          isSelected ? "bg-[#EAF2F9] font-bold text-[#174F7A]" : "text-slate-700"
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

function SelectField({
  label,
  options,
  value,
  onChange,
  required,
  lang = "FR",
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  required?: boolean
  lang?: Language
}) {
  const currentLang = (lang || "FR").toUpperCase()
  const selectPlaceholder = currentLang === "DE" ? "Auswählen..." : currentLang === "EN" ? "Select..." : "Sélectionner..."

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
        <option value="">{selectPlaceholder}</option>
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
  lang = "FR",
}: {
  label: string
  optional?: boolean
  fileName: string
  onFile: (file: File | null) => void
  lang?: Language
}) {
  const currentLang = (lang || "FR").toUpperCase()
  const optionalText = currentLang === "DE" ? "— optional" : currentLang === "EN" ? "— optional" : "— optionnel"
  const removeText = currentLang === "DE" ? "Entfernen" : currentLang === "EN" ? "Remove" : "Supprimer"
  const clickText = currentLang === "DE" ? "Klicken zum Hochladen" : currentLang === "EN" ? "Click to upload" : "Cliquez pour ajouter un fichier"
  const dragText = currentLang === "DE" ? "oder Drag & Drop" : currentLang === "EN" ? "or drag and drop" : "ou glissez-déposez"
  const formatsText = currentLang === "DE" ? "PDF, DOC oder DOCX bis zu 10 MB" : currentLang === "EN" ? "PDF, DOC or DOCX up to 10 MB" : "PDF, DOC, DOCX jusqu'à 10 Mo"

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold flex items-center gap-1" style={{ color: TEXT_DARK }}>
        <span>{label}</span>
        {optional ? (
          <span className="text-xs font-normal text-slate-400">{optionalText}</span>
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
            className="text-xs font-semibold px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors shrink-0 ml-3 cursor-pointer"
          >
            {removeText}
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
            {clickText} <span className="text-slate-400 font-normal">{dragText}</span>
          </div>
          <div className="text-xs text-slate-400">{formatsText}</div>
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
  const t: any = translations[currentLang] || translations.FR

  const [step, setStep] = useState(1)
  const [maxStepReached, setMaxStepReached] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submittedRef, setSubmittedRef] = useState(`CAND-${new Date().getFullYear()}-0001`)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMaxStepReached((prev) => Math.max(prev, step))
  }, [step])

  const defaultFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+228",
    phoneCountryIso: "TG",
    phone: "",
    country: "",
    city: "",
    dob: "",
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
  }

  // Form state initialized from localStorage if available
  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("apticFormDraft")
        if (saved) {
          const parsed = JSON.parse(saved)
          return {
            ...defaultFormState,
            ...parsed,
            cvFile: null,
            motivationFile: null,
            portfolioFile: null,
          }
        }
      } catch (e) {
        console.error("Failed to load form draft", e)
      }
    }
    return defaultFormState
  })

  // Save to localStorage on change
  useEffect(() => {
    const formToSave = { ...form }
    // Remove files before saving to avoid serialization errors and size limits
    delete (formToSave as any).cvFile
    delete (formToSave as any).motivationFile
    delete (formToSave as any).portfolioFile
    localStorage.setItem("apticFormDraft", JSON.stringify(formToSave))
  }, [form])

  // Track application_started event once on mount
  useEffect(() => {
    trackEvent("application_started", { lang, source: "apply_page_load" })
  }, [lang])

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f: typeof defaultFormState) => ({ ...f, [key]: value }))

  const toggleSkill = (skillSlug: string) => {
    const current = form.skills
    set(
      "skills",
      current.includes(skillSlug)
        ? current.filter((s: string) => s !== skillSlug)
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
    if (targetStep >= 1 && targetStep <= 9) {
      setErrorMessage("")
      setStep(targetStep)
      window.scrollTo({ top: 400, behavior: "smooth" })
    }
  }

  // Real-time progress calculation based on filled required fields
  const progressPercentage = (() => {
    let score = 0
    const total = 19
    
    // Personal info (5)
    if (form.firstName.trim().length >= 2) score++
    if (form.lastName.trim().length >= 2) score++
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) score++
    if (form.country.trim().length > 0) score++
    if (form.dob.length > 0) score++
    
    // Profile (6)
    if (form.education.trim().length > 0) score++
    if (form.fieldOfStudy.trim().length > 0) score++
    if (form.profession.trim().length > 0) score++
    if (form.experience.length > 0) score++
    if (form.digitalSkillLevel.length > 0) score++
    if (Boolean(form.languages.french) && Boolean(form.languages.english)) score++
    
    // Skills (1)
    if (form.skills.length > 0) score++
    
    // Availability (2)
    if (form.duration.length > 0) score++
    if (form.arrivalDate.length > 0) score++
    
    // Motivation (1)
    if (form.motivation.trim().length >= 50) score++
    
    // Experience (1)
    if (form.projectExp.trim().length >= 50) score++
    
    // Documents (2)
    if (form.cvFile !== null) score++
    if (form.motivationFile !== null) score++
    
    // Consent (1)
    if (form.consent) score++
    
    return Math.round((score / total) * 100)
  })()

  // Validation
  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1:
        const dobDate = new Date(form.dob)
        const today = new Date()
        const minDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
        const dobValid =
          form.dob.length > 0 &&
          !isNaN(dobDate.getTime()) &&
          dobDate <= today &&
          dobDate <= minDate
        return (
          form.firstName.trim().length >= 2 &&
          form.lastName.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
          form.country.trim().length > 0 &&
          dobValid
        )
      case 2:
        return (
          form.education.trim().length > 0 &&
          form.fieldOfStudy.trim().length > 0 &&
          form.profession.trim().length > 0 &&
          form.experience.length > 0 &&
          form.digitalSkillLevel.length > 0 &&
          Boolean(form.languages.french) &&
          Boolean(form.languages.english)
        )
      case 3:
        return form.skills.length > 0
      case 4: {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isDateValid =
          form.arrivalDate.length > 0 && new Date(form.arrivalDate) >= today
        return form.duration.length > 0 && isDateValid
      }
      case 5:
        return form.motivation.trim().length >= 50
      case 6:
        return form.projectExp.trim().length >= 50
      case 7:
        return form.cvFile !== null && form.motivationFile !== null
      case 9:
        return form.consent
      default:
        return true
    }
  }

  const step1Errors = {
    firstName: form.firstName.length > 0 && form.firstName.trim().length < 2 ? t.apply.errors?.firstNameReq || "Prénom obligatoire (min. 2 caractères)" : undefined,
    lastName: form.lastName.length > 0 && form.lastName.trim().length < 2 ? t.apply.errors?.lastNameReq || "Nom obligatoire (min. 2 caractères)" : undefined,
    email: form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? t.apply.errors?.emailInvalid || "Adresse e-mail invalide" : undefined,
    dob: (() => {
      if (!form.dob || form.dob.length === 0) return undefined
      const birth = new Date(form.dob)
      if (isNaN(birth.getTime())) return t.apply.errors?.dobInvalid || "Date invalide"
      if (birth > new Date()) return t.apply.errors?.dobFuture || "Date future interdite"
      const today = new Date()
      const minDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
      if (birth > minDate) return t.apply.errors?.dobMinAge || "Vous devez avoir au moins 16 ans"
      return undefined
    })(),
  }

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
    const dobDate = new Date(form.dob)
    if (isNaN(dobDate.getTime())) {
      setErrorMessage(t.apply.errors.dobInvalid || "Date de naissance invalide")
      setIsSubmitting(false)
      return
    }
    if (dobDate > new Date()) {
      setErrorMessage(t.apply.errors.dobFuture || "Date future interdite")
      setIsSubmitting(false)
      return
    }
    const _today = new Date()
    const _minDate = new Date(_today.getFullYear() - 16, _today.getMonth(), _today.getDate())
    if (dobDate > _minDate) {
      setErrorMessage(t.apply.errors.dobMinAge || "Vous devez avoir au moins 16 ans")
      setIsSubmitting(false)
      return
    }
    if (!form.education.trim()) {
      setErrorMessage(t.apply.errors.educationReq || "Veuillez renseigner votre formation")
      setIsSubmitting(false)
      return
    }
    if (!form.fieldOfStudy.trim()) {
      setErrorMessage(t.apply.errors.fieldReq || "Veuillez renseigner votre domaine d'études")
      setIsSubmitting(false)
      return
    }
    if (!form.profession.trim()) {
      setErrorMessage(t.apply.errors.professionReq || "Veuillez renseigner votre profession")
      setIsSubmitting(false)
      return
    }
    if (!form.experience) {
      setErrorMessage(t.apply.errors.experienceReq || "Veuillez renseigner votre niveau d'expérience")
      setIsSubmitting(false)
      return
    }
    if (!form.digitalSkillLevel) {
      setErrorMessage(t.apply.errors.digitalReq || "Veuillez renseigner votre niveau de compétences numériques")
      setIsSubmitting(false)
      return
    }
    if (!form.languages.french || !form.languages.english) {
      setErrorMessage(t.apply.errors.languagesReq || (currentLang === "DE" ? "Bitte bewerten Sie Ihre Sprachkenntnisse (Französisch und Englisch erforderlich)." : currentLang === "EN" ? "Please indicate your language level (French and English are required)." : "Veuillez renseigner votre niveau de langues (Français et Anglais obligatoires)."))
      setIsSubmitting(false)
      return
    }
    if (form.skills.length === 0) {
      setErrorMessage(t.apply.errors.skillsReq)
      setIsSubmitting(false)
      return
    }
    if (!form.arrivalDate) {
      setErrorMessage(t.apply.errors.arrivalReq || "Veuillez renseigner votre date d'arrivée souhaitée")
      setIsSubmitting(false)
      return
    }
    if (!form.duration) {
      setErrorMessage(t.apply.errors.durationReq || "Veuillez renseigner la durée souhaitée")
      setIsSubmitting(false)
      return
    }
    if (form.motivation.trim().length < 50) {
      setErrorMessage(t.apply.errors.motivationLen)
      setIsSubmitting(false)
      return
    }
    if (form.motivation.trim().length > 5000) {
      setErrorMessage(t.apply.errors.motivationMax)
      setIsSubmitting(false)
      return
    }
    if (form.projectExp.trim().length < 50) {
      setErrorMessage(t.apply.errors.projectLen)
      setIsSubmitting(false)
      return
    }
    if (form.projectExp.trim().length > 5000) {
      setErrorMessage(t.apply.errors.projectMax)
      setIsSubmitting(false)
      return
    }
    if (!form.cvFile) {
      setErrorMessage(t.apply.errors.cvReq || "Le CV est obligatoire")
      setIsSubmitting(false)
      return
    }
    if (!form.motivationFile) {
      setErrorMessage(t.apply.errors.letterReq || "La lettre de motivation est obligatoire")
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
      formData.append("languages", JSON.stringify(form.languages))

      form.skills.forEach((skill: string) => formData.append("skills", skill))

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
        trackEvent("application_submitted", {
          lang,
          country: form.country,
          source: form.source || "direct",
          metadata: { reference: result.data.referenceNumber },
        })
        localStorage.removeItem("apticFormDraft")
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
    { num: 1, label: t.apply.steps?.s1 || "Informations", title: t.apply.form?.personalInfo || "Informations personnelles", desc: t.apply.stepDescs?.s1 || "Vos coordonnées et informations civiles" },
    { num: 2, label: t.apply.steps?.s2 || "Profil", title: t.apply.form?.profile || "Profil & Formation", desc: t.apply.stepDescs?.s2 || "Votre parcours académique et compétences linguistiques" },
    { num: 3, label: t.apply.steps?.s3 || "Compétences", title: t.apply.form?.skillsTitle || "Compétences & Domaines", desc: t.apply.stepDescs?.s3 || "Sélectionnez les domaines dans lesquels vous pouvez contribuer" },
    { num: 4, label: t.apply.steps?.s4 || "Disponibilité", title: t.apply.form?.availability || "Disponibilité & Durée", desc: t.apply.stepDescs?.s4 || "Période et durée souhaitées pour votre mission au Togo" },
    { num: 5, label: t.apply.steps?.s5 || "Motivation", title: t.apply.form?.motivationTitle || "Votre Motivation", desc: t.apply.stepDescs?.s5 || "Exprimez les raisons de votre engagement avec APTIC-R" },
    { num: 6, label: t.apply.steps?.s6 || "Expérience", title: t.apply.form?.expTitle || "Expérience & Projets", desc: t.apply.stepDescs?.s6 || "Partagez une réalisation ou une expérience marquante" },
    { num: 7, label: t.apply.steps?.s7 || "Documents", title: t.apply.form?.docsTitle || "Documents & Pièces jointes", desc: t.apply.stepDescs?.s7 || "Déposez votre CV et lettre de motivation" },
    { num: 8, label: t.apply.steps?.s8 || "Source", title: t.apply.form?.sourceTitle || "Comment nous avez-vous connus ?", desc: t.apply.stepDescs?.s8 || "Aidez-nous à savoir comment vous avez découvert le programme" },
    { num: 9, label: t.apply.steps?.s9 || "Vérification", title: t.apply.form?.reviewTitle || "Vérification & Envoi", desc: t.apply.stepDescs?.s9 || "Relisez votre dossier avant de transmettre votre candidature" },
  ]

  // Skills catalogue with multilingual titles and descriptions
  const SKILLS_CATALOGUE = [
    {
      slug: "computer-science",
      title: currentLang === "DE" ? "Informatik" : currentLang === "EN" ? "Computer Science" : "Informatique",
      desc: currentLang === "DE" ? "Architektur, Netzwerke, Infrastruktur & Tools" : currentLang === "EN" ? "Architecture, networking, infrastructure & tools" : "Architecture, réseau, infrastructure & outils",
      icon: MonitorIcon
    },
    {
      slug: "data",
      title: currentLang === "DE" ? "Datenanalyse" : currentLang === "EN" ? "Data Analysis" : "Données",
      desc: currentLang === "DE" ? "Verarbeitung landwirtschaftlicher Daten, GIS & Berichterstattung" : currentLang === "EN" ? "Agricultural data processing, GIS & reporting" : "Traitement de données agricoles, SIG & reporting",
      icon: BarChartIcon
    },
    {
      slug: "web-development",
      title: currentLang === "DE" ? "Webentwicklung" : currentLang === "EN" ? "Web Development" : "Développement web",
      desc: currentLang === "DE" ? "Webanwendungen, CMS, Portale & APIs" : currentLang === "EN" ? "Web applications, CMS, portals & APIs" : "Applications web, CMS, portails & API",
      icon: CodeIcon
    },
    {
      slug: "mobile-development",
      title: currentLang === "DE" ? "Mobile Entwicklung" : currentLang === "EN" ? "Mobile Development" : "Développement mobile",
      desc: currentLang === "DE" ? "Android-Apps, Offline-First & SMS-Warnungen" : currentLang === "EN" ? "Android apps, offline-first & SMS alerts" : "Applications Android, offline-first & alertes SMS",
      icon: SmartphoneIcon
    },
    {
      slug: "agriculture",
      title: currentLang === "DE" ? "Landwirtschaft" : currentLang === "EN" ? "Agriculture" : "Agriculture",
      desc: currentLang === "DE" ? "Anbaubegleitung, Gartenbau & Nachhaltigkeit" : currentLang === "EN" ? "Crop monitoring, market gardening & sustainability" : "Suivi des cultures, maraîchage & durabilité",
      icon: WheatIcon
    },
    {
      slug: "graphic-design",
      title: currentLang === "DE" ? "Grafikdesign" : currentLang === "EN" ? "Graphic Design" : "Conception graphique",
      desc: currentLang === "DE" ? "Visuelle Gestaltung, Illustration & Markenidentität" : currentLang === "EN" ? "Visual design, illustration & branding" : "Design visuel, illustration & identité de marque",
      icon: PaletteIcon
    },
    {
      slug: "communication",
      title: currentLang === "DE" ? "Kommunikation" : currentLang === "EN" ? "Communication" : "Communication",
      desc: currentLang === "DE" ? "Soziale Medien, Öffentlichkeitsarbeit & Strategie" : currentLang === "EN" ? "Social media, PR & strategy" : "Réseaux sociaux, relations publiques & stratégie",
      icon: MessageSquareIcon
    },
    {
      slug: "content-creation",
      title: currentLang === "DE" ? "Content-Erstellung" : currentLang === "EN" ? "Content Creation" : "Création de contenu",
      desc: currentLang === "DE" ? "Foto, Video, Text & Feldberichte" : currentLang === "EN" ? "Photo, video, writing & field storytelling" : "Photos, vidéos, rédaction & récits de terrain",
      icon: PenToolIcon
    },
    {
      slug: "arduino",
      title: "Arduino",
      desc: currentLang === "DE" ? "Mikrocontroller, Prototyping & Sensoren" : currentLang === "EN" ? "Microcontrollers, prototyping & basic sensors" : "Microcontrôleurs, prototypage & capteurs basiques",
      icon: CpuIcon
    },
    {
      slug: "raspberry-pi",
      title: "Raspberry Pi",
      desc: currentLang === "DE" ? "Einplatinencomputer, lokale Server & Automatisierung" : currentLang === "EN" ? "Mini-computers, local servers & automation" : "Mini-ordinateurs, serveurs locaux & automatisation",
      icon: CpuIcon
    },
    {
      slug: "iot",
      title: "IoT",
      desc: currentLang === "DE" ? "Internet der Dinge, Vernetzung & LoRa-Netzwerke" : currentLang === "EN" ? "Internet of things, connectivity & LoRa networks" : "Internet des objets, connectivité & réseaux LoRa",
      icon: SignalIcon
    },
    {
      slug: "digital-education",
      title: currentLang === "DE" ? "Digitale Bildung" : currentLang === "EN" ? "Digital Education" : "Éducation numérique",
      desc: currentLang === "DE" ? "Pädagogik, Workshop-Leitung & Schulungen" : currentLang === "EN" ? "Pedagogy, workshop facilitation & training" : "Pédagogie, animation d'ateliers & formation",
      icon: GraduationCapIcon
    },
    {
      slug: "project-management",
      title: currentLang === "DE" ? "Projektmanagement" : currentLang === "EN" ? "Project Management" : "Gestion de projet",
      desc: currentLang === "DE" ? "Koordination, Organisation & Vereinszusammenarbeit" : currentLang === "EN" ? "Coordination, organization & NGO liaisons" : "Coordination, organisation & lien associatif",
      icon: FileTextIcon
    },
  ]

  const SOURCES_LIST = [
    currentLang === "DE" ? "Google / Suchmaschine" : currentLang === "EN" ? "Google / Search Engine" : "Google / Moteur de recherche",
    "LinkedIn",
    "Instagram",
    "Facebook",
    currentLang === "DE" ? "Universität / Hochschule" : currentLang === "EN" ? "University / College" : "Université / École",
    "France Volontaires",
    "weltwärts",
    currentLang === "DE" ? "Europäisches Solidaritätskorps" : currentLang === "EN" ? "European Solidarity Corps" : "Corps européen de solidarité",
    currentLang === "DE" ? "Empfehlung von Bekannten" : currentLang === "EN" ? "Friend / Colleague recommendation" : "Recommandation d'un proche",
    currentLang === "DE" ? "Andere" : currentLang === "EN" ? "Other" : "Autre",
  ]

  // Helper duration label
  const durationText =
    form.duration === "SIX_MONTHS"
      ? t.apply.form.durationOptions?.SIX_MONTHS || "6 mois"
      : form.duration === "NINE_MONTHS"
      ? t.apply.form.durationOptions?.NINE_MONTHS || "9 mois"
      : form.duration === "TWELVE_MONTHS"
      ? t.apply.form.durationOptions?.TWELVE_MONTHS || "12 mois"
      : t.apply.sidebar?.toSpecify || "À préciser"

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
            {t.apply.success.p1_1}<strong>{form.firstName || (currentLang === "DE" ? "Bewerber" : currentLang === "EN" ? "Applicant" : "Candidat")}</strong>{t.apply.success.p1_2}
          </p>
          <p className="text-xs sm:text-sm mb-8 text-slate-400">
            {t.apply.success.p2_2}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("home")}
              className="font-bold text-sm px-6 py-3.5 rounded-xl text-white transition-all shadow-sm hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: BLUE }}
            >
              {t.apply.success.backHome}
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

          {/* Droite : Bouton Visite + Sélecteur FR EN DE */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("home")}
              className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
              style={{ color: BLUE, backgroundColor: "#E8F2FA" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t.apply.header?.visitSite || "Visiter le site"}
            </button>

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
                <picture>
                  <source srcSet="/volunteer-togo.avif" type="image/avif" />
                  <source srcSet="/volunteer-togo.webp" type="image/webp" />
                  <img
                    src="/volunteer-togo.jpg"
                    alt="Volontaires et communauté locale au Togo"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
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
                      {t.apply.sidebar?.step || (currentLang === "DE" ? "SCHRITT" : currentLang === "EN" ? "STEP" : "ÉTAPE")} {step} {t.apply.sidebar?.of || (currentLang === "DE" ? "VON" : currentLang === "EN" ? "OF" : "SUR")} 9
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      · {progressPercentage} %
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
                        width: `${progressPercentage}%`,
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
                        countryIso={form.phoneCountryIso}
                        onCountrySelect={(dial, iso) => {
                          setForm((f: typeof defaultFormState) => ({ ...f, phoneCountryCode: dial, phoneCountryIso: iso }))
                        }}
                        phone={form.phone}
                        onPhoneChange={(v) => set("phone", v)}
                        placeholder={t.apply.form.phonePlaceholder}
                        lang={lang}
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
                        placeholder={currentLang === "DE" ? "z. B. Togo, Deutschland, Frankreich, Benin..." : currentLang === "EN" ? "e.g. Togo, France, Germany, Ghana..." : "Ex: Togo, France, Allemagne, Bénin..."}
                      />
                      <InputField
                        label={t.apply.form.city}
                        value={form.city}
                        onChange={(v) => set("city", v)}
                        placeholder={currentLang === "DE" ? "z. B. Lomé, Tsévié, Kpalimé, Kara..." : currentLang === "EN" ? "e.g. Lomé, Tsévié, Kpalimé, Kara..." : "Ex: Lomé, Tsévié, Kpalimé, Kara..."}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                      <InputField
                        label={t.apply.form.dob}
                        type="date"
                        value={form.dob}
                        onChange={(v) => set("dob", v)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                        error={step1Errors.dob}
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
                        required
                      />
                      <InputField
                        label={t.apply.form.field}
                        value={form.fieldOfStudy}
                        onChange={(v) => set("fieldOfStudy", v)}
                        placeholder={t.apply.form.fieldPlaceholder}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField
                        label={t.apply.form.profession}
                        value={form.profession}
                        onChange={(v) => set("profession", v)}
                        placeholder={t.apply.form.professionPlaceholder}
                        required
                      />
                      <SelectField
                        label={t.apply.form.experience || (currentLang === "DE" ? "Gesamterfahrung" : currentLang === "EN" ? "Overall experience" : "Niveau d'expérience globale")}
                        value={form.experience}
                        onChange={(v) => set("experience", v)}
                        required
                        lang={lang}
                        options={[
                          { label: t.apply.form.expOptions?.LESS_THAN_1_YEAR || (currentLang === "DE" ? "Weniger als 1 Jahr" : currentLang === "EN" ? "Less than 1 year" : "Moins d'un an"), value: "LESS_THAN_1_YEAR" },
                          { label: t.apply.form.expOptions?.ONE_TO_TWO_YEARS || (currentLang === "DE" ? "1–2 Jahre" : currentLang === "EN" ? "1–2 years" : "1–2 ans"), value: "ONE_TO_TWO_YEARS" },
                          { label: t.apply.form.expOptions?.TWO_TO_FIVE_YEARS || (currentLang === "DE" ? "2–5 Jahre" : currentLang === "EN" ? "2–5 years" : "2–5 ans"), value: "TWO_TO_FIVE_YEARS" },
                          { label: t.apply.form.expOptions?.FIVE_PLUS_YEARS || (currentLang === "DE" ? "5+ Jahre" : currentLang === "EN" ? "5+ years" : "5+ ans"), value: "FIVE_PLUS_YEARS" },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <SelectField
                        label={t.apply.form.digitalSkill}
                        value={form.digitalSkillLevel}
                        onChange={(v) => set("digitalSkillLevel", v)}
                        required
                        lang={lang}
                        options={[
                          { label: t.apply.form.digitalOptions.BEGINNER, value: "BEGINNER" },
                          { label: t.apply.form.digitalOptions.INTERMEDIATE, value: "INTERMEDIATE" },
                          { label: t.apply.form.digitalOptions.ADVANCED, value: "ADVANCED" },
                          { label: t.apply.form.digitalOptions.EXPERT, value: "EXPERT" },
                        ]}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold flex items-center gap-1 text-slate-800">
                          <span>{currentLang === "DE" ? "Sprachkenntnisse" : currentLang === "EN" ? "Language Proficiency" : "Niveau de langues"}</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <span className="text-xs text-slate-400">
                          {currentLang === "DE" ? "Französisch & Englisch erforderlich" : currentLang === "EN" ? "French & English required" : "Français & Anglais obligatoires"}
                        </span>
                      </div>
                      <div className="space-y-3 pt-1">
                        {[
                          { key: "french" as const, name: currentLang === "DE" ? "Französisch" : currentLang === "EN" ? "French" : "Français", req: true },
                          { key: "english" as const, name: currentLang === "DE" ? "Englisch" : currentLang === "EN" ? "English" : "Anglais", req: true },
                          { key: "german" as const, name: currentLang === "DE" ? "Deutsch" : currentLang === "EN" ? "German" : "Allemand", req: false },
                        ].map(({ key, name, req }) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                            <span className="text-sm font-medium text-slate-700 w-28 flex items-center gap-1">
                              {name}
                              {req ? (
                                <span className="text-red-500 font-bold">*</span>
                              ) : (
                                <span className="text-slate-400 text-xs font-normal">
                                  ({currentLang === "DE" ? "fakultativ" : currentLang === "EN" ? "optional" : "optionnel"})
                                </span>
                              )}
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              {[
                                { value: "none", label: currentLang === "DE" ? "Keine" : currentLang === "EN" ? "None" : "Aucun" },
                                { value: "basic", label: currentLang === "DE" ? "Grundkenntnisse" : currentLang === "EN" ? "Basic" : "Notions" },
                                { value: "intermediate", label: currentLang === "DE" ? "Mittelstufe" : currentLang === "EN" ? "Intermediate" : "Intermédiaire" },
                                { value: "advanced", label: currentLang === "DE" ? "Fließend" : currentLang === "EN" ? "Fluent" : "Courant" },
                                { value: "native", label: currentLang === "DE" ? "Muttersprache" : currentLang === "EN" ? "Native" : "Langue maternelle" },
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

                      {(!form.languages.french || !form.languages.english) && (
                        <p className="text-xs text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-xl px-3 py-2 mt-3 flex items-center gap-2">
                          <span className="shrink-0 font-bold">ℹ️</span>
                          <span>
                            {currentLang === "DE"
                              ? "Bitte wählen Sie Ihr Niveau für Französisch und Englisch aus, um fortzufahren."
                              : currentLang === "EN"
                              ? "Please select your level for both French and English to continue."
                              : "Veuillez sélectionner votre niveau en français et en anglais pour pouvoir continuer."}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── ÉTAPE 3 : Compétences (Grille de cartes exploitant la largeur) ─ */}
                {step === 3 && (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-slate-600">
                        {currentLang === "DE"
                          ? "Wählen Sie die Bereiche aus, in denen Sie sich während Ihres Einsatzes aktiv einbringen können."
                          : currentLang === "EN"
                          ? "Select the fields where you can actively contribute during your mission."
                          : "Sélectionnez les domaines dans lesquels vous pouvez contribuer activement lors de votre mission."}
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
                        <span>
                          {currentLang === "DE"
                            ? `${form.skills.length} Fähigkeit${form.skills.length > 1 ? "en" : ""} ausgewählt`
                            : currentLang === "EN"
                            ? `${form.skills.length} skill${form.skills.length > 1 ? "s" : ""} selected`
                            : `${form.skills.length} compétence${form.skills.length > 1 ? "s" : ""} sélectionnée${form.skills.length > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        {currentLang === "DE"
                          ? "Bitte wählen Sie mindestens eine Fähigkeit aus, um fortzufahren."
                          : currentLang === "EN"
                          ? "Please choose at least one skill to continue."
                          : "Veuillez choisir au moins une compétence pour continuer."}
                      </div>
                    )}
                  </div>
                )}

                {/* ── ÉTAPE 4 : Disponibilité & Durée ─────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="max-w-md">
                      <InputField
                        label={t.apply.form.arrivalDate || "Date d'arrivée souhaitée au Togo"}
                        type="date"
                        value={form.arrivalDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(v) => set("arrivalDate", v)}
                        helpText={currentLang === "DE" ? "Geben Sie ein gewünschtes Startdatum an" : currentLang === "EN" ? "Indicate an indicative start date" : "Indiquez une date indicative de début souhaitée"}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-3 block text-slate-800">
                        {t.apply.form.duration || "Durée de la mission"}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          {
                            label: t.apply.form.durationOptions?.SIX_MONTHS || "6 mois",
                            value: "SIX_MONTHS",
                            desc: currentLang === "DE" ? "Einführung & erstes Projekt" : currentLang === "EN" ? "Immersion & first project" : "Immersion & premier projet"
                          },
                          {
                            label: t.apply.form.durationOptions?.NINE_MONTHS || "9 mois",
                            value: "NINE_MONTHS",
                            desc: currentLang === "DE" ? "Vollständiger Einsatz & Wissenstransfer" : currentLang === "EN" ? "Full deployment & knowledge transfer" : "Déploiement complet & relais"
                          },
                          {
                            label: t.apply.form.durationOptions?.TWELVE_MONTHS || "12 mois",
                            value: "TWELVE_MONTHS",
                            desc: currentLang === "DE" ? "Vertiefte Wirkung & Nachhaltigkeit" : currentLang === "EN" ? "Deep transmission & sustainability" : "Transmission approfondie"
                          },
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
                        {form.motivation.trim().length < 50 ? (
                          currentLang === "DE" ? "Mindestens 50 Zeichen" : currentLang === "EN" ? "Minimum 50 characters" : "Minimum 50 caractères"
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#35A85A] font-medium">
                            <CheckIcon className="w-3.5 h-3.5" /> {currentLang === "DE" ? "Ausreichende Länge" : currentLang === "EN" ? "Sufficient length" : "Longueur suffisante"}
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
                        {form.projectExp.trim().length < 50 ? (
                          currentLang === "DE" ? "Mindestens 50 Zeichen" : currentLang === "EN" ? "Minimum 50 characters" : "Minimum 50 caractères"
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#35A85A] font-medium">
                            <CheckIcon className="w-3.5 h-3.5" /> {currentLang === "DE" ? "Ausreichende Länge" : currentLang === "EN" ? "Sufficient length" : "Longueur suffisante"}
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
                      lang={lang}
                    />
                    <FileUpload
                      label={t.apply.form.coverLetter}
                      fileName={form.motivationFile?.name || ""}
                      onFile={(f) => set("motivationFile", f)}
                      lang={lang}
                    />
                    <FileUpload
                      label={t.apply.form.portfolio}
                      optional
                      fileName={form.portfolioFile?.name || ""}
                      onFile={(f) => set("portfolioFile", f)}
                      lang={lang}
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
                        const otherLabel = currentLang === "DE" ? "Andere" : currentLang === "EN" ? "Other" : "Autre"
                        const isOther = src === otherLabel
                        const isSelected = form.source === src || (isOther && (form.source.startsWith(`${otherLabel} : `) || form.source.startsWith("Autre : ") || (!SOURCES_LIST.includes(form.source) && form.source !== "")))
                        return (
                          <button
                            key={src}
                            type="button"
                            onClick={() => {
                              if (isOther) {
                                if (SOURCES_LIST.includes(form.source)) {
                                  set("source", `${otherLabel} : `)
                                }
                              } else {
                                set("source", src)
                              }
                            }}
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

                    {(() => {
                      const otherLabel = currentLang === "DE" ? "Andere" : currentLang === "EN" ? "Other" : "Autre"
                      const isOtherActive = form.source.startsWith(`${otherLabel} : `) || form.source.startsWith("Autre : ") || (!SOURCES_LIST.includes(form.source) && form.source !== "")
                      if (!isOtherActive) return null
                      const cleanVal = form.source.replace(`${otherLabel} : `, "").replace("Autre : ", "")
                      return (
                        <div className="mt-4">
                          <InputField
                            label={currentLang === "DE" ? "Bitte genauer angeben" : currentLang === "EN" ? "Please specify your source" : "Précisez votre source"}
                            value={cleanVal === otherLabel || cleanVal === "Autre" ? "" : cleanVal}
                            onChange={(v) => set("source", v ? `${otherLabel} : ${v}` : otherLabel)}
                            placeholder={currentLang === "DE" ? "z. B. Vereinsveranstaltung, Podcast, Mundpropaganda..." : currentLang === "EN" ? "e.g. Community event, podcast, word of mouth..." : "Ex: Événement associatif, podcast, bouche à oreille..."}
                            required
                          />
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* ── ÉTAPE 9 : Vérification finale & Envoi ────────────────────── */}
                {step === 9 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-600">
                      {t.apply.review?.disclaimer || (currentLang === "DE" ? "Bitte überprüfen Sie die Angaben zu Ihrer Bewerbung sorgfältig, bevor Sie diese an das APTIC-R-Team übermitteln." : currentLang === "EN" ? "Please review your application details carefully below before submitting to the APTIC-R coordination." : "Veuillez vérifier attentivement les détails de votre candidature ci-dessous avant transmission à la coordination APTIC-R.")}
                    </p>

                    {/* Synthèse épurée sans sous-cartes (pas d'effet dashboard) */}
                    <div className="divide-y divide-slate-100 border-y border-slate-100">
                      {/* Section Coordonnées */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {t.apply.review?.sections?.contact || (currentLang === "DE" ? "Kontaktdaten" : currentLang === "EN" ? "Contact Info" : "Coordonnées")}
                          </span>
                          <button type="button" onClick={() => goToStep(1)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">
                            {t.apply.review?.edit || (currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier")}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">{t.apply.review?.fields?.name || (currentLang === "DE" ? "Name :" : currentLang === "EN" ? "Name:" : "Nom :")}</span> <strong className="text-slate-800 ml-1">{form.firstName} {form.lastName}</strong></div>
                          <div><span className="text-slate-400">{t.apply.review?.fields?.email || (currentLang === "DE" ? "E-Mail :" : currentLang === "EN" ? "Email:" : "E-mail :")}</span> <strong className="text-slate-800 ml-1">{form.email}</strong></div>
                          <div><span className="text-slate-400">{t.apply.review?.fields?.phone || (currentLang === "DE" ? "Telefon :" : currentLang === "EN" ? "Phone:" : "Téléphone :")}</span> <strong className="text-slate-800 ml-1">{form.phoneCountryCode ? `${form.phoneCountryCode} ${form.phone}`.trim() : form.phone || (t.apply.review?.notProvided || (currentLang === "DE" ? "Nicht angegeben" : currentLang === "EN" ? "Not provided" : "Non renseigné"))}</strong></div>
                          <div><span className="text-slate-400">{t.apply.review?.fields?.location || (currentLang === "DE" ? "Land / Stadt :" : currentLang === "EN" ? "Country / City:" : "Pays / Ville :")}</span> <strong className="text-slate-800 ml-1">{form.country} {form.city ? `(${form.city})` : ""}</strong></div>
                        </div>
                      </div>

                      {/* Section Profil & Formation */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {currentLang === "DE" ? "Profil & Ausbildung" : currentLang === "EN" ? "Profile & Background" : "Profil & Formation"}
                          </span>
                          <button type="button" onClick={() => goToStep(2)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">
                            {t.apply.review?.edit || (currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier")}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">{t.apply.form.education} :</span> <strong className="text-slate-800 ml-1">{form.education}</strong></div>
                          <div><span className="text-slate-400">{t.apply.form.field} :</span> <strong className="text-slate-800 ml-1">{form.fieldOfStudy}</strong></div>
                          <div><span className="text-slate-400">{t.apply.form.profession} :</span> <strong className="text-slate-800 ml-1">{form.profession}</strong></div>
                          <div><span className="text-slate-400">{t.apply.form.experience} :</span> <strong className="text-slate-800 ml-1">{t.apply.form.expOptions?.[form.experience as keyof typeof t.apply.form.expOptions] || form.experience}</strong></div>
                          <div className="sm:col-span-2 pt-1.5 mt-1 border-t border-slate-100 flex flex-wrap items-center gap-2">
                            <span className="text-slate-400">{currentLang === "DE" ? "Sprachen :" : currentLang === "EN" ? "Languages :" : "Langues :"}</span>
                            {form.languages.french && (
                              <span className="bg-[#EAF5ED] text-[#174F7A] font-semibold text-xs px-2 py-0.5 rounded-md border border-[#D8E2E9]">
                                {currentLang === "DE" ? "Französisch" : currentLang === "EN" ? "French" : "Français"} : {LANGUAGE_LEVEL_LABELS[currentLang]?.[form.languages.french] || form.languages.french}
                              </span>
                            )}
                            {form.languages.english && (
                              <span className="bg-[#EAF5ED] text-[#174F7A] font-semibold text-xs px-2 py-0.5 rounded-md border border-[#D8E2E9]">
                                {currentLang === "DE" ? "Englisch" : currentLang === "EN" ? "English" : "Anglais"} : {LANGUAGE_LEVEL_LABELS[currentLang]?.[form.languages.english] || form.languages.english}
                              </span>
                            )}
                            {form.languages.german && form.languages.german !== "none" && (
                              <span className="bg-[#EAF5ED] text-[#174F7A] font-semibold text-xs px-2 py-0.5 rounded-md border border-[#D8E2E9]">
                                {currentLang === "DE" ? "Deutsch" : currentLang === "EN" ? "German" : "Allemand"} : {LANGUAGE_LEVEL_LABELS[currentLang]?.[form.languages.german] || form.languages.german}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section Mission */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {t.apply.review?.sections?.mission || (currentLang === "DE" ? "Einsatz & Verfügbarkeit" : currentLang === "EN" ? "Mission & Availability" : "Mission & Disponibilité")}
                          </span>
                          <button type="button" onClick={() => goToStep(4)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">
                            {t.apply.review?.edit || (currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier")}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-xs sm:text-sm">
                          <div><span className="text-slate-400">{t.apply.review?.fields?.duration || (currentLang === "DE" ? "Dauer :" : currentLang === "EN" ? "Duration:" : "Durée :")}</span> <strong className="text-slate-800 ml-1">{durationText}</strong></div>
                          <div><span className="text-slate-400">{t.apply.review?.fields?.arrival || (currentLang === "DE" ? "Gewünschte Ankunft :" : currentLang === "EN" ? "Desired arrival:" : "Arrivée souhaitée :")}</span> <strong className="text-slate-800 ml-1">{form.arrivalDate || (t.apply.sidebar?.toSpecify || (currentLang === "DE" ? "Noch festzulegen" : currentLang === "EN" ? "To specify" : "À convenir"))}</strong></div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400">{t.apply.review?.fields?.skills || (currentLang === "DE" ? "Fähigkeiten" : currentLang === "EN" ? "Skills" : "Compétences")} ({form.skills.length}) :</span>{" "}
                            <strong className="text-slate-800 ml-1">
                              {form.skills.map((slug: string) => {
                                const skillItem = SKILLS_CATALOGUE.find((s) => s.slug === slug)
                                return skillItem ? skillItem.title : slug
                              }).join(", ") || (t.apply.review?.none || (currentLang === "DE" ? "Keine" : currentLang === "EN" ? "None" : "Aucune"))}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Section Pièces jointes */}
                      <div className="py-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#174F7A]">
                            {t.apply.review?.sections?.docs || (currentLang === "DE" ? "Dokumente" : currentLang === "EN" ? "Documents" : "Documents")}
                          </span>
                          <button type="button" onClick={() => goToStep(7)} className="text-xs font-bold text-slate-400 hover:text-[#174F7A] cursor-pointer">
                            {t.apply.review?.edit || (currentLang === "DE" ? "Bearbeiten" : currentLang === "EN" ? "Edit" : "Modifier")}
                          </button>
                        </div>
                        <div className="text-xs sm:text-sm space-y-1">
                          <div><span className="text-slate-400">{t.apply.review?.fields?.cv || (currentLang === "DE" ? "Lebenslauf :" : currentLang === "EN" ? "CV:" : "CV :")}</span> <strong className="text-slate-800 ml-1">{form.cvFile ? form.cvFile.name : (t.apply.review?.notSent || (currentLang === "DE" ? "Nicht übermittelt" : currentLang === "EN" ? "Not provided" : "Non transmis"))}</strong></div>
                          <div><span className="text-slate-400">{t.apply.review?.fields?.letter || (currentLang === "DE" ? "Motivationsschreiben :" : currentLang === "EN" ? "Cover letter:" : "Lettre :")}</span> <strong className="text-slate-800 ml-1">{form.motivationFile ? form.motivationFile.name : (t.apply.review?.notSent || (currentLang === "DE" ? "Nicht übermittelt" : currentLang === "EN" ? "Not provided" : "Non fournie"))}</strong></div>
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
                          {t.apply.review?.consentLabel || (currentLang === "DE" ? "Ich versichere die Richtigkeit der angegebenen Informationen und stimme zu, dass der Verein APTIC-R meine personenbezogenen Daten ausschließlich im Rahmen der Prüfung meiner Bewerbung für den internationalen Freiwilligendienst verarbeitet." : currentLang === "EN" ? "I certify the accuracy of the information provided and I agree that the APTIC-R association processes my personal data strictly for the evaluation of my international volunteer application." : "J'atteste de l'exactitude des informations fournies et j'accepte que l'association APTIC-R traite mes données personnelles dans le cadre strict de l'évaluation de ma candidature de volontariat international.")}
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
                      ← {t.apply.nav?.back || (currentLang === "DE" ? "Zurück" : currentLang === "EN" ? "Back" : "Retour")}
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 9 ? (
                    <div className="flex gap-3 items-center justify-end">
                      {(progressPercentage === 100 || maxStepReached >= 9) && (
                        <button
                          type="button"
                          onClick={() => goToStep(9)}
                          className="px-4 sm:px-6 py-3.5 rounded-xl text-sm font-bold text-[#174F7A] bg-white border border-[#D8E2E9] hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <span className="hidden sm:inline">
                            {currentLang === "DE" ? "Zum Abschluss springen" : currentLang === "EN" ? "Jump to summary" : "Retourner à la fin"}
                          </span>
                          <span className="sm:hidden">
                            {currentLang === "DE" ? "Abschluss" : currentLang === "EN" ? "Summary" : "À la fin"}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={next}
                        disabled={!isStepValid(step)}
                        className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        style={{ backgroundColor: GREEN }}
                      >
                        <span>{t.apply.nav?.continue || (currentLang === "DE" ? "Weiter" : currentLang === "EN" ? "Continue" : "Continuer")}</span>
                        <span>→</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={isSubmitting || !form.consent}
                      className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                      style={{ backgroundColor: BLUE }}
                    >
                      {isSubmitting ? (
                        <span>{t.apply.nav?.submitting || (currentLang === "DE" ? "Wird gesendet..." : currentLang === "EN" ? "Sending..." : "Transmission en cours...")}</span>
                      ) : (
                        <>
                          <span>{t.apply.nav?.submit || (currentLang === "DE" ? "Bewerbung senden" : currentLang === "EN" ? "Send my application" : "Envoyer ma candidature")}</span>
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
                    {t.apply.sidebar?.progression || (currentLang === "DE" ? "FORTSCHRITT" : currentLang === "EN" ? "PROGRESS" : "PROGRESSION")}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2FA] text-[#174F7A]">
                    {step} {t.apply.sidebar?.ofLower || (currentLang === "DE" ? "von" : currentLang === "EN" ? "of" : "sur")} 9
                  </span>
                </div>

                {/* Liste verticale avec ligne continue bien visible */}
                <div className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-3 before:w-[2px] before:bg-[#D8E2E9] space-y-3.5">
                  {STEPS_CONFIG.map((s) => {
                    const isCompleted = s.num < step
                    const isCurrent = s.num === step
                    const isFuture = s.num > step
                    const isAccessible = s.num <= maxStepReached

                    return (
                      <div
                        key={s.num}
                        className={`relative flex items-center gap-3 transition-all ${
                          isCurrent ? "bg-[#F0F5FA] rounded-xl py-1.5 px-2.5 -ml-2.5" : "py-0.5"
                        }`}
                      >
                        {/* Point d'état avec fort contraste */}
                        <div
                          className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all absolute bg-white ${isCurrent ? '-left-[14px]' : '-left-6'}`}
                          style={{
                            backgroundColor: isCompleted ? GREEN : isCurrent ? BLUE : "#FFFFFF",
                            color: isCompleted || isCurrent ? "#FFFFFF" : "#64748B",
                            border: isFuture ? "2px solid #CBD5E1" : `2px solid ${isCompleted ? GREEN : BLUE}`,
                            boxShadow: isCurrent ? "0 0 0 4px rgba(23,79,122,0.18)" : "none",
                          }}
                        >
                          {isCompleted ? <CheckIcon size={11} strokeWidth={3} /> : s.num}
                        </div>

                        {/* Intitulé cliquable si accessible */}
                        <button
                          type="button"
                          onClick={() => goToStep(s.num)}
                          disabled={!isAccessible}
                          className="text-left text-xs transition-colors"
                          style={{
                            color: isCurrent ? BLUE : isCompleted ? TEXT_DARK : "#64748B",
                            fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                            cursor: isAccessible ? "pointer" : "default",
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
                  {t.apply.sidebar?.yourApplication || (currentLang === "DE" ? "IHRE BEWERBUNG" : currentLang === "EN" ? "YOUR APPLICATION" : "VOTRE CANDIDATURE")}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#5E6B76] font-medium">{t.apply.sidebar?.country || (currentLang === "DE" ? "Land :" : currentLang === "EN" ? "Country:" : "Pays :")}</span>
                    <strong className="text-[#1A2B3C] font-bold">{form.country || (t.apply.sidebar?.notProvided || (currentLang === "DE" ? "Nicht angegeben" : currentLang === "EN" ? "Not provided" : "Non renseigné"))}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-100">
                    <span className="text-[#5E6B76] font-medium">{t.apply.sidebar?.duration || (currentLang === "DE" ? "Dauer :" : currentLang === "EN" ? "Duration:" : "Durée :")}</span>
                    <strong className="text-[#1A2B3C] font-bold">{durationText}</strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-100">
                    <span className="text-[#5E6B76] font-medium">{t.apply.sidebar?.skills || (currentLang === "DE" ? "Fähigkeiten :" : currentLang === "EN" ? "Skills:" : "Compétences :")}</span>
                    <strong className="text-[#1A2B3C] font-bold">
                      {form.skills.length > 0 ? `${form.skills.length} ${(t.apply.sidebar?.selected || (currentLang === "DE" ? "ausgewählt" : currentLang === "EN" ? "selected" : "sélectionnée(s)"))}` : "0"}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-100">
                    <span className="text-[#5E6B76] font-medium">{t.apply.sidebar?.arrival || (currentLang === "DE" ? "Ankunft :" : currentLang === "EN" ? "Arrival:" : "Arrivée :")}</span>
                    <strong className="text-[#1A2B3C] font-bold">{form.arrivalDate || (t.apply.sidebar?.toSpecify || (currentLang === "DE" ? "Noch festzulegen" : currentLang === "EN" ? "To specify" : "À préciser"))}</strong>
                  </div>
                </div>

                {step === 9 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>{(t.apply as any).sidebar?.checks?.infoComplete || (currentLang === "DE" ? "Informationen vollständig" : currentLang === "EN" ? "Information complete" : "Informations complètes")}</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>{(t.apply as any).sidebar?.checks?.profileComplete || (currentLang === "DE" ? "Profil ausgefüllt" : currentLang === "EN" ? "Profile complete" : "Profil complété")}</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>{(t.apply as any).sidebar?.checks?.skillsSelected || (currentLang === "DE" ? "Fähigkeiten ausgewählt" : currentLang === "EN" ? "Skills selected" : "Compétences sélectionnées")}</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>{(t.apply as any).sidebar?.checks?.availabilityIndicated || (currentLang === "DE" ? "Verfügbarkeit angegeben" : currentLang === "EN" ? "Availability indicated" : "Disponibilité indiquée")}</span>
                    </div>
                    <div className="text-[#35A85A] font-bold flex items-center gap-1.5">
                      <CheckIcon size={12} strokeWidth={3} className="shrink-0" />
                      <span>{(t.apply as any).sidebar?.checks?.documentsAdded || (currentLang === "DE" ? "Dokumente hochgeladen" : currentLang === "EN" ? "Documents added" : "Documents ajoutés")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BLOC 3 : BESOIN D'AIDE ? */}
              <div className="bg-[#F8FAFC] rounded-3xl p-6 shadow-sm border border-[#D8E2E9]">
                <div className="text-sm font-bold text-[#1A2B3C] mb-1.5 flex items-center gap-2">
                  <LightbulbIcon size={17} className="text-[#174F7A] shrink-0" />
                  <span>{(t.apply as any).sidebar?.help?.title || (currentLang === "DE" ? "Benötigen Sie Hilfe?" : currentLang === "EN" ? "Need some light?" : "Besoin d'un éclairage ?")}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {(t.apply as any).sidebar?.help?.desc || (currentLang === "DE" ? "Fragen zum Einsatz, zu Togo oder zu Ihrer Bewerbung? Unser Team beantwortet diese gerne." : currentLang === "EN" ? "Any questions about the mission, Togo, or your application? Our team will gladly answer you." : "Une question sur la mission, le Togo ou votre candidature ? Notre équipe vous répond avec plaisir.")}
                </p>
                <div className="space-y-2">
                  <a
                    href={`mailto:aptic.rural19@gmail.com?subject=${encodeURIComponent(currentLang === "DE" ? "Frage zur Freiwilligenbewerbung" : currentLang === "EN" ? "Volunteer Application Question" : "Question Candidature Volontaire")}`}
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#174F7A] bg-white border border-[#D8E2E9] px-4 py-2.5 rounded-xl hover:border-[#174F7A] hover:bg-[#F0F5FA] transition-all shadow-2xs w-full cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{(t.apply as any).sidebar?.help?.contactBtn || (currentLang === "DE" ? "Per E-Mail kontaktieren" : currentLang === "EN" ? "Contact by email" : "Contacter par email")}</span>
                  </a>
                  <a
                    href="tel:+22891201990"
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-[#174F7A] transition-all w-full cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+228 91 20 19 90</span>
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