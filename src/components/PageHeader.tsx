"use client"

import React from "react"
import type { Language, Page } from "@/types"
import Header from "./Header"
import SimplifiedHeader from "./SimplifiedHeader"
import { HEADER_MODES, type HeaderMode } from "@/lib/pageLayout"

interface PageHeaderProps {
  /**
   * Mode de header, issu du registre centralisé `getHeaderMode(routePattern)`.
   * Ne jamais décider ici : le mode vient de la convention.
   */
  mode: HeaderMode
  /** Page courante, requise par le header complet (soulignement de l'actif). */
  currentPage: Page
  lang: Language
  setLang: (l: Language) => void
  navigate: (p: Page) => void
  /** Options du header simplifié (parcours de formulaire). */
  backTo?: Page
}

/**
 * Point d'entrée unique du header public.
 *
 * La décision fullHeader / simplifiedHeader / noHeader est prise par la
 * convention (`src/lib/pageLayout.ts`) et appliquée ici. `Header.tsx` reste
 * intact : ce composant choisit quoi rendre, il ne modifie pas le header.
 */
export default function PageHeader({
  mode,
  currentPage,
  lang,
  setLang,
  navigate,
  backTo,
}: PageHeaderProps) {
  if (mode === HEADER_MODES.none) {
    // Page de détail immersive : aucun header global, la vue affiche son
    // propre lien de retour. Le Footer global reste présent.
    return null
  }

  if (mode === HEADER_MODES.simplified) {
    return (
      <SimplifiedHeader lang={lang} setLang={setLang} backTo={backTo} />
    )
  }

  return (
    <Header currentPage={currentPage} lang={lang} setLang={setLang} navigate={navigate} />
  )
}
