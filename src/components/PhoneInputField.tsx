"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { FREQUENT_COUNTRIES, ALL_COUNTRY_CODES, type CountryPhoneCode } from "@/data/countryPhoneCodes"
import { GlobeIcon, SearchIcon } from "@/components/Icons"
import RequiredAsterisk from "@/components/RequiredAsterisk"
import type { Language } from "@/types"

/**
 * Champ téléphone international partagé par tous les formulaires du site.
 *
 * Un numéro n'est jamais saisi seul : le sélecteur d'indicatif fait partie du
 * champ, et la valeur transmise est toujours le numéro complet
 * (`indicant + numéro national`). Le composant expose donc deux sorties :
 * - un `<input type="hidden">` portant le nom du champ, lisible par `FormData`
 *   dans les formulaires HTML classiques ;
 * - un rappel `onChange` pour les formulaires React pilotés par état.
 *
 * Le champ visible reste `required` : la validation HTML porte sur la saisie
 * locale, pas sur la valeur technique du champ caché.
 */

export interface PhoneInputFieldProps {  /** Libellé affiché au-dessus du champ. */
  label: string
  /** Nom du champ caché qui porte le numéro complet (formulaires HTML). */
  name?: string
  /** Numéro national déjà saisi, sans indicatif. */
  value?: string
  /** Rappel de saisie : reçoit le numéro local, puis complet à la validation. */
  onChange?: (local: string) => void
  /** Rappel de changement d'indicatif : `(dial, iso)`. */
  onCountryChange?: (dial: string, iso: string) => void
  /** Indicatif initial au format `+XXX`. */
  defaultDial?: string
  /** Code ISO pays initial, prioritaire sur `defaultDial`. */
  defaultIso?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
  lang?: Language
  /** `sm` : champs compacts des modales. `md` : formulaires pleine page. */
  size?: "sm" | "md"
  className?: string
}

const DEFAULTS: Record<Language, { iso: string; dial: string }> = {
  FR: { iso: "TG", dial: "+228" },
  EN: { iso: "TG", dial: "+228" },
  DE: { iso: "TG", dial: "+228" },
}

/**
 * Sépare un numéro stocké en indicatif et numéro national.
 *
 * Les valeurs enregistrées dans la base sont toujours complètes
 * (« +228 90 12 34 56 »). Les écrans d'édition s'en servent pour réafficher le
 * bon indicatif dans le sélecteur au lieu de le laisser dans le champ texte.
 */
export function splitPhoneNumber(stored: string | null | undefined): {
  dial: string
  iso: string
  local: string
} {
  const raw = (stored ?? "").trim()
  const match = /^\s*(\+\d{1,4})\s*(.*)$/.exec(raw)
  if (!match) {
    return { dial: DEFAULTS.FR.dial, iso: DEFAULTS.FR.iso, local: raw }
  }
  const dial = match[1]
  const known =
    ALL_COUNTRY_CODES.find((c) => c.dial === dial) || FREQUENT_COUNTRIES.find((c) => c.dial === dial)
  return { dial, iso: known?.code ?? DEFAULTS.FR.iso, local: match[2].trim() }
}

export default function PhoneInputField({
  label,
  name,
  value = "",
  onChange,
  onCountryChange,
  defaultDial,
  defaultIso,
  required = false,
  autoComplete = "tel",
  placeholder,
  lang = "FR",
  size = "md",
  className = "",
}: PhoneInputFieldProps) {
  const currentLang = (lang || "FR").toUpperCase() as Language
  const fallback = DEFAULTS[currentLang] ?? DEFAULTS.FR

  const [iso, setIso] = useState(defaultIso ?? fallback.iso)
  const [dial, setDial] = useState(defaultDial ?? fallback.dial)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = useMemo(
    () =>
      ALL_COUNTRY_CODES.find((c) => (iso ? c.code === iso : c.dial === dial)) ||
      FREQUENT_COUNTRIES.find((c) => (iso ? c.code === iso : c.dial === dial)),
    [iso, dial]
  )

  /** Numéro toujours complet : aucun champ ne peut transmettre un numéro nu. */
  const fullNumber = useMemo(() => {
    const local = value.trim()
    if (!local) return ""
    return dial ? `${dial} ${local}` : local
  }, [dial, value])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  /**
   * Un `form.reset()` du parent doit vider aussi l'indicatif : sinon la saisie
   * réapparaît alors que le formulaire vient d'être renvoyé.
   */
  useEffect(() => {
    const form = containerRef.current?.closest("form")
    if (!form) return
    function onReset() {
      setSearch("")
      setOpen(false)
    }
    form.addEventListener("reset", onReset)
    return () => form.removeEventListener("reset", onReset)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const needle = search.trim().toLowerCase()
  const matches = (c: CountryPhoneCode) =>
    c.name.toLowerCase().includes(needle) ||
    c.code.toLowerCase().includes(needle) ||
    c.dial.includes(needle)

  const frequent = needle ? FREQUENT_COUNTRIES.filter(matches) : FREQUENT_COUNTRIES
  const all = needle ? ALL_COUNTRY_CODES.filter(matches) : ALL_COUNTRY_CODES

  function select(c: CountryPhoneCode) {
    setIso(c.code)
    setDial(c.dial)
    onCountryChange?.(c.dial, c.code)
    setOpen(false)
    setSearch("")
    inputRef.current?.focus()
  }

  const t = {
    optional: currentLang === "DE" ? "— optional" : currentLang === "EN" ? "— optional" : "— optionnel",
    code: currentLang === "DE" ? "Vorwahl" : currentLang === "EN" ? "Code" : "Indicatif",
    search:
      currentLang === "DE"
        ? "Land oder Vorwahl suchen (z. B. Togo, +228)..."
        : currentLang === "EN"
          ? "Search country or dial code (e.g. Togo, +228)..."
          : "Rechercher pays ou indicatif (ex: Togo, +228)...",
    frequent: currentLang === "DE" ? "Häufige Länder" : currentLang === "EN" ? "Frequent countries" : "Pays fréquents",
    all: currentLang === "DE" ? "Alle Länder" : currentLang === "EN" ? "All countries" : "Tous les pays",
    none: currentLang === "DE" ? "Kein Land gefunden" : currentLang === "EN" ? "No country found" : "Aucun pays trouvé",
  }

  const compact = size === "sm"
  const fieldHeight = compact ? 38 : 48
  const triggerWidth = compact ? 92 : 105
  const labelClass = compact
    ? "block text-[11px] font-bold text-slate-700 mb-1"
    : "text-xs font-bold text-[#003366] uppercase flex items-center justify-between"
  const listWidth = compact ? "w-full sm:w-[320px]" : "w-full sm:w-[360px]"

  function renderOption(c: CountryPhoneCode, keyPrefix: string) {
    const isSelected = current?.code === c.code
    return (
      <button
        key={`${keyPrefix}-${c.code}`}
        type="button"
        onClick={() => select(c)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
          isSelected ? "bg-[#EAF2F9] font-bold text-[#003366]" : "text-slate-700"
        } hover:bg-[#F0F5FA]`}
      >
        <img
          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
          alt={c.name}
          className="w-5 h-3.5 object-cover rounded-xs shrink-0"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <span className="flex-1 truncate">{c.name}</span>
        <span className="text-slate-500 font-mono text-[11px] shrink-0 font-semibold">{c.dial}</span>
      </button>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={containerRef}>
      <label className={labelClass}>
        <span className={compact ? "" : "flex items-center gap-1"}>
          {label}
          {compact && required && <span className="text-rose-500"> *</span>}
        </span>
        {!compact &&
          (required ? <RequiredAsterisk /> : <span className="text-[10px] text-slate-400 font-normal lowercase">{t.optional}</span>)}
      </label>

      {/* Numéro complet transmis au formulaire, indicatif compris. */}
      {name && <input type="hidden" name={name} value={fullNumber} />}

      <div
        className={`flex items-center w-full rounded-xl transition-all duration-200 overflow-hidden bg-white focus-within:border-[#007BFF] focus-within:ring-2 focus-within:ring-[#007BFF]/15 ${
          compact ? "border border-slate-200" : "border border-[#EAF0F4] bg-[#F7F8FA]"
        }`}
        style={{ height: fieldHeight }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={t.code}
          className={`h-full px-2.5 flex items-center gap-1.5 border-r border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0 ${
            compact ? "" : "px-3 gap-2"
          }`}
          style={{ minWidth: triggerWidth }}
        >
          {current ? (
            <>
              <img
                src={`https://flagcdn.com/w40/${current.code.toLowerCase()}.png`}
                alt={current.name}
                className="w-5 h-3.5 object-cover rounded-xs shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <span className={`font-semibold text-slate-800 font-mono ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}>
                {current.dial}
              </span>
            </>
          ) : (
            <>
              <GlobeIcon size={compact ? 14 : 16} className="shrink-0 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">{t.code}</span>
            </>
          )}
          <svg
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ml-auto ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange?.(e.target.value.replace(/\D/g, ""))}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder || (currentLang === "FR" ? "90 12 34 56" : "90 12 34 56")}
          className={`flex-1 h-full outline-none bg-transparent text-[#142332] ${compact ? "px-2.5 text-[13px]" : "px-3.5 text-sm"}`}
        />
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 z-50 ${listWidth} bg-white rounded-2xl shadow-xl border border-[#D8E2E9] overflow-hidden`}
            style={{ top: compact ? 58 : 76, maxHeight: 380 }}
          >
            <div className="p-2.5 border-b border-slate-100 bg-[#FAFCFD]">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 focus-within:border-[#003366]">
                <SearchIcon size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.search}
                  className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-50" style={{ maxHeight: 310 }}>
              {!needle && frequent.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                    {t.frequent}
                  </div>
                  {frequent.map((c) => renderOption(c, "freq"))}
                </div>
              )}

              <div>
                {!needle && (
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                    {t.all}
                  </div>
                )}
                {all.length > 0 ? all.map((c) => renderOption(c, "all")) : (
                  <div className="p-4 text-center text-xs text-slate-400">{t.none}</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
