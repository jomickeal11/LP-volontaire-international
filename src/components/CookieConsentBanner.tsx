"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from "@/lib/cookieConsent"
import type { Language } from "@/types"
import { LEGAL_SLUGS } from "@/lib/legalContent"

interface CookieConsentBannerProps {
  lang: Language | string
}

export default function CookieConsentBanner({ lang }: CookieConsentBannerProps) {
  const currentLang = (
    typeof lang === "string" ? lang.toUpperCase() : "FR"
  ) as "FR" | "EN" | "DE"
  const langKey = (typeof lang === "string" ? lang.toLowerCase() : "fr") as
    | "fr"
    | "en"
    | "de"

  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [analyticsToggle, setAnalyticsToggle] = useState(false)

  const cookiePolicySlug = LEGAL_SLUGS.cookies[langKey] || LEGAL_SLUGS.cookies.fr
  const cookiePolicyUrl = `/${langKey}/${cookiePolicySlug}`

  useEffect(() => {
    setIsMounted(true)
    const existing = getCookieConsent()
    setConsent(existing)
    if (existing) {
      setAnalyticsToggle(existing.analytics)
    }

    // Écouter l'événement d'ouverture depuis le Footer ("Gérer mes cookies")
    const handleOpen = () => {
      const current = getCookieConsent()
      setAnalyticsToggle(current ? current.analytics : false)
      setModalOpen(true)
    }

    window.addEventListener("open_cookie_preferences", handleOpen)
    return () => {
      window.removeEventListener("open_cookie_preferences", handleOpen)
    }
  }, [])

  const handleAcceptAll = () => {
    const updated = setCookieConsent(true)
    setConsent(updated)
    setAnalyticsToggle(true)
    setModalOpen(false)
  }

  const handleRejectAll = () => {
    const updated = setCookieConsent(false)
    setConsent(updated)
    setAnalyticsToggle(false)
    setModalOpen(false)
  }

  const handleSavePreferences = () => {
    const updated = setCookieConsent(analyticsToggle)
    setConsent(updated)
    setModalOpen(false)
  }

  // Traductions institutionnelles sobres pour FR, EN, DE
  const t = {
    FR: {
      title: "Gestion des cookies et confidentialité",
      bannerDesc:
        "Nous utilisons des cookies techniques nécessaires au fonctionnement du portail et de ses formulaires. Avec votre accord, nous activons également Google Analytics afin de mesurer l'audience et d'améliorer nos services. Votre choix est conservé pendant 6 mois.",
      btnAccept: "Tout accepter",
      btnReject: "Refuser",
      btnCustomize: "Personnaliser",
      modalTitle: "Préférences relatives aux cookies",
      modalDesc:
        "Vous pouvez choisir d'activer ou de désactiver les traceurs non indispensables. Votre choix peut être modifié à tout moment depuis « Gérer mes cookies ».",
      catEssentialTitle: "Cookies nécessaires et fonctionnels",
      catEssentialBadge: "Toujours actif",
      catEssentialDesc:
        "Indispensables au fonctionnement sécurisé du site (navigation, formulaires de candidature, authentification d'administration, mémorisation de votre choix de consentement). Ils ne peuvent être désactivés.",
      catAnalyticsTitle: "Mesure d'audience (Google Analytics 4)",
      catAnalyticsDesc:
        "Permet de mesurer la fréquentation et l'utilisation du portail afin de mieux comprendre son audience.",
      btnSave: "Enregistrer mes choix",
      learnMore: "Consulter notre politique de cookies",
      close: "Fermer",
    },
    EN: {
      title: "Cookie and Privacy Preferences",
      bannerDesc:
        "We use essential technical cookies necessary for this portal and its forms to operate. With your consent, we also enable Google Analytics to measure audience and improve our services. Your choice is stored for 6 months.",
      btnAccept: "Accept all",
      btnReject: "Decline",
      btnCustomize: "Customize",
      modalTitle: "Cookie Preferences",
      modalDesc:
        "You can choose to enable or disable optional trackers. Your choice can be modified at any time from 'Cookie settings'.",
      catEssentialTitle: "Essential & Functional Cookies",
      catEssentialBadge: "Always active",
      catEssentialDesc:
        "Strictly necessary for secure website operation (navigation, multi-step application forms, admin authentication, remembering your consent choice). These cannot be disabled.",
      catAnalyticsTitle: "Audience Measurement (Google Analytics 4)",
      catAnalyticsDesc:
        "Allows measuring portal traffic and usage to better understand its audience.",
      btnSave: "Save my preferences",
      learnMore: "Read our Cookie Policy",
      close: "Close",
    },
    DE: {
      title: "Cookie- und Datenschutzeinstellungen",
      bannerDesc:
        "Wir verwenden technisch notwendige Cookies für den fehlerfreien Betrieb des Portals und der Formulare. Mit Ihrer Einwilligung aktivieren wir auch Google Analytics zur Reichweitenmessung. Ihre Auswahl wird für 6 Monate gespeichert.",
      btnAccept: "Alle akzeptieren",
      btnReject: "Ablehnen",
      btnCustomize: "Anpassen",
      modalTitle: "Cookie-Einstellungen",
      modalDesc:
        "Sie können nicht notwendige Tracker aktivieren oder deaktivieren. Ihre Auswahl kann jederzeit unter 'Cookie-Einstellungen' geändert werden.",
      catEssentialTitle: "Notwendige & funktionale Cookies",
      catEssentialBadge: "Immer aktiv",
      catEssentialDesc:
        "Unentbehrlich für den sicheren Betrieb der Website (Navigation, Bewerbungsformulare, Administrator-Authentifizierung, Speicherung Ihrer Einwilligung). Sie können nicht deaktiviert werden.",
      catAnalyticsTitle: "Reichweitenmessung (Google Analytics 4)",
      catAnalyticsDesc:
        "Ermöglicht die Messung der Nutzung des Portals, um dessen Zielgruppe besser zu verstehen.",
      btnSave: "Auswahl speichern",
      learnMore: "Unsere Cookie-Richtlinie lesen",
      close: "Schließen",
    },
  }[currentLang] || {
    title: "Gestion des cookies",
    bannerDesc: "",
    btnAccept: "Tout accepter",
    btnReject: "Refuser",
    btnCustomize: "Personnaliser",
    modalTitle: "Préférences cookies",
    modalDesc: "",
    catEssentialTitle: "Cookies nécessaires",
    catEssentialBadge: "Toujours actif",
    catEssentialDesc: "",
    catAnalyticsTitle: "Google Analytics",
    catAnalyticsDesc: "",
    btnSave: "Enregistrer",
    learnMore: "En savoir plus",
    close: "Fermer",
  }

  if (!isMounted) return null

  // Affichage du bandeau uniquement si aucun choix n'a été enregistré
  const showBanner = consent === null && !modalOpen

  return (
    <>
      {/* BANDEAU FLOTTANT SOBRE EN BAS DE PAGE (Si aucun consentement enregistré) */}
      {showBanner && (
        <aside
          role="dialog"
          aria-live="polite"
          aria-label={t.title}
          className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-6 sm:right-6 md:max-w-xl md:left-6 md:right-auto z-50 bg-white rounded-xl border border-[#E2E8F0] shadow-lg p-5 text-xs text-[#1A2B3C]"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#003366]"></span>
              <span className="font-bold text-xs uppercase tracking-wider text-[#003366]">
                {t.title}
              </span>
            </div>

            <p className="text-xs text-[#4A5A6A] leading-relaxed">
              {t.bannerDesc}
            </p>

            <div className="pt-1">
              <Link
                href={cookiePolicyUrl}
                className="text-[11px] text-[#003366] underline hover:text-[#28A745] font-medium"
              >
                {t.learnMore}
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 min-w-[110px] py-2 px-3 rounded-lg bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs text-center transition-colors cursor-pointer"
              >
                {t.btnAccept}
              </button>

              <button
                type="button"
                onClick={handleRejectAll}
                className="flex-1 min-w-[90px] py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#1A2B3C] font-semibold text-xs text-center transition-colors cursor-pointer"
              >
                {t.btnReject}
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="py-2 px-2.5 text-xs text-[#7A8A9A] hover:text-[#003366] hover:underline transition-colors cursor-pointer font-medium"
              >
                {t.btnCustomize}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* PANNEAU MODAL DE PERSONNALISATION (Accessible via bouton ou lien Footer) */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 text-xs text-[#1A2B3C] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <h2
                id="cookie-modal-title"
                className="text-base font-bold text-[#003366]"
              >
                {t.modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#7A8A9A] hover:text-[#003366] text-lg font-bold p-1 cursor-pointer"
                aria-label={t.close}
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#4A5A6A] leading-relaxed mb-6">
              {t.modalDesc}
            </p>

            <div className="space-y-4 mb-6">
              {/* Catégorie 1 : Cookies nécessaires */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#003366] text-xs">
                    {t.catEssentialTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E2E8F0] text-[#4A5A6A]">
                    {t.catEssentialBadge}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  {t.catEssentialDesc}
                </p>
              </div>

              {/* Catégorie 2 : Mesure d'audience Google Analytics */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#003366] text-xs">
                    {t.catAnalyticsTitle}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsToggle}
                      onChange={(e) => setAnalyticsToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#003366]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  {t.catAnalyticsDesc}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <Link
                href={cookiePolicyUrl}
                onClick={() => setModalOpen(false)}
                className="text-[11px] text-[#7A8A9A] hover:text-[#003366] underline"
              >
                {t.learnMore}
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="py-2 px-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#4A5A6A] font-semibold text-xs cursor-pointer"
                >
                  {t.btnReject}
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="py-2 px-4 rounded-lg bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs cursor-pointer"
                >
                  {t.btnSave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
