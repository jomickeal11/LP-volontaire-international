"use client"

import React, { useState, type ReactNode } from "react"

/**
 * Modale de création admin générique.
 *
 * Réutilise exactement le design du back-office (cartes blanches, bordures
 * slate-200, boutons `bg-[#174F7A]`, titres tracking-wider) afin de rester
 * cohérent avec les autres écrans d'administration.
 *
 * N'envoie aucun événement analytics : la création est une action
 * strictement administrative, pas une soumission publique.
 */
export default function AdminCreateModal({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel = "Créer",
  error,
  success,
  children,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitLabel?: string
  error?: string | null
  success?: string | null
  children: ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm px-4 py-8 sm:py-12">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-[#F7F8FA]">
          <div>
            <h2 className="text-base font-bold text-[#003366]">{title}</h2>
            {subtitle ? (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {children}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-lg border border-[#28A745]/30 bg-[#28A745]/5 px-4 py-3 text-xs font-semibold text-[#1e7e34]">
              {success}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const inputClass =
  "w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"

export const labelClass =
  "block text-xs font-semibold text-slate-700 mb-1.5"

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wider text-[#174F7A] border-b border-slate-200 pb-2">
      {children}
    </div>
  )
}