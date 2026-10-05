"use client"

import React, { useEffect, useRef } from "react"

/**
 * Modale du module « Événements & Formations ».
 *
 * La fiche événement n'affiche JAMAIS le formulaire de participation dans la
 * page : elle affiche un bouton, et ce bouton ouvre cette modale. Elle ne porte
 * que la coquille d'affichage — fond, panneau, titre, fermeture — et reçoit son
 * contenu en `children` : la logique de soumission reste dans la vue, qui
 * possède déjà l'état métier de la demande.
 *
 * Comportements repris de l'existant du projet (`modal-scroll-locked`,
 * `modal-viewport-fit`) : la page ne défile plus derrière la modale, la touche
 * Échap ferme, un clic sur le fond ferme.
 */

interface EventParticipationModalProps {
  open: boolean
  onClose: () => void
  /** Titre de la modale, déjà traduit. */
  title: string
  /** Ligne de contexte facultative (titre de l'événement). */
  subtitle?: string
  /** Libellé accessible du bouton de fermeture, déjà traduit. */
  closeLabel: string
  children: React.ReactNode
}

export default function EventParticipationModal({
  open,
  onClose,
  title,
  subtitle,
  closeLabel,
  children,
}: EventParticipationModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = "hidden"
    body.classList.add("modal-scroll-locked")

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)

    // Le panneau reçoit le focus à l'ouverture : la tabulation démarre dans la
    // modale au lieu de repartir du lien de retour en tête de page.
    panelRef.current?.focus()

    return () => {
      body.style.overflow = previousOverflow
      body.classList.remove("modal-scroll-locked")
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#003366]/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-viewport-fit w-full sm:max-w-2xl max-h-[var(--modal-max-h)] overflow-y-auto overscroll-contain outline-none rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* En-tête collant : le bouton de fermeture reste atteignable même quand
            le formulaire est long. */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
          <div className="min-w-0">
            <h2 className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#003366]">
              {title}
            </h2>
            {subtitle && <p className="mt-1.5 truncate text-[13px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#003366] cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
      </div>
    </div>
  )
}
