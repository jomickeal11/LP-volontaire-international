"use client"

import React from "react"
import { useRouter } from "next/navigation"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import ApticLogo from "./ApticLogo"
import { trackEvent } from "@/lib/tracker"

interface SimplifiedHeaderProps {
  lang: Language
  setLang: (l: Language) => void
  /** Page vers laquelle renvoie le bouton retour (portail d'origine). */
  backTo?: Page
  /** Destination du logo. Repli : page d'accueil. */
  logoTo?: Page
}

const BLUE = "#003366"

const BACK_LABELS: Record<Language, string> = {
  FR: "Retour",
  EN: "Back",
  DE: "Zurück",
}

/**
 * Header simplifié des parcours de formulaire.
 *
 * Composition dédiée, mais bâtie strictement sur le design system du header
 * normal (`Header.tsx`) : même carte flottante, mêmes rayons, même hauteur
 * (`h-14 lg:h-16`), même fond translucide et même sélecteur de langue.
 *
 * Ne conserve que l'identité APTIC-R (logo + slogan officiels) et les
 * contrôles utiles : retour vers le portail d'origine + FR / EN / DE.
 * Aucune navigation principale, aucun CTA, aucun bloc secondaire.
 */
export default function SimplifiedHeader({
  lang,
  setLang,
  backTo,
  logoTo = "home",
}: SimplifiedHeaderProps) {
  const router = useRouter()
  const currentLang = (lang || "FR").toUpperCase() as Language
  const label = BACK_LABELS[currentLang] || BACK_LABELS.FR

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-3 sm:pt-3 lg:px-4 lg:pt-4">
      <div
        className="rounded-xl px-4 sm:px-6 h-14 lg:h-16 flex items-center justify-between gap-2 sm:gap-3 transition-all duration-300"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 4px 20px rgba(18,59,90,0.08)",
          border: "1px solid rgba(255,255,255,0.55)",
        }}
      >
        {/* Gauche : logo APTIC-R officiel + slogan (identique au header normal) */}
        <button
          onClick={() => router.push(getPageUrl(logoTo, currentLang))}
          className="flex items-center min-w-0 shrink-0 group text-left cursor-pointer transition-transform hover:scale-[1.02]"
          aria-label="APTIC-R"
        >
          <ApticLogo variant="header" lang={currentLang} hideTaglineOnMobile />
        </button>

        {/* Droite : retour + séparateur + sélecteur de langue */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {backTo && (
            <>
              <button
                onClick={() => router.push(getPageUrl(backTo, currentLang))}
                title={label}
                aria-label={label}
                className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-1 rounded-full border transition-colors cursor-pointer whitespace-nowrap hover:bg-[#EAF0F4]"
                style={{
                  color: BLUE,
                  backgroundColor: "#F5F7F9",
                  borderColor: "rgba(0,51,102,0.12)",
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">{label}</span>
              </button>
              <span
                className="hidden sm:block h-5 w-[1px] shrink-0"
                style={{ backgroundColor: "rgba(0,51,102,0.12)" }}
                aria-hidden="true"
              />
            </>
          )}

          {/* Sélecteur de langue — identique au header normal */}
          <div
            className="flex items-center p-0.5 rounded-full border"
            style={{ borderColor: "rgba(0,51,102,0.10)" }}
          >
            {(["FR", "EN", "DE"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  trackEvent("language_switch", { lang: l, metadata: { from: lang, to: l } })
                  setLang(l)
                }}
                className="px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-full transition-all cursor-pointer uppercase"
                style={{
                  backgroundColor: currentLang === l ? "rgba(0,51,102,0.06)" : "transparent",
                  color: currentLang === l ? BLUE : "#233B4D",
                }}
                aria-current={currentLang === l ? "true" : undefined}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
