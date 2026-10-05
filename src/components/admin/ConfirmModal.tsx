"use client"

import React from "react"

const BRAND = "#003366"
const BTN_NEUTRAL =
  "rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
const BTN_BASE =
  "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message?: React.ReactNode
  cancelLabel?: string
  confirmLabel?: string
  confirmStyle?: React.CSSProperties
  onCancel: () => void
  onConfirm: () => void
  disabled?: boolean
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  cancelLabel = "Annuler",
  confirmLabel = "Confirmer",
  confirmStyle,
  onCancel,
  onConfirm,
  disabled = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#003366]/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h3 className="text-sm font-bold" style={{ color: BRAND }}>
          {title}
        </h3>
        {message && (
          <div className="mt-3 text-xs leading-relaxed text-slate-600">
            {message}
          </div>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={disabled} className={BTN_NEUTRAL}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            style={confirmStyle || { backgroundColor: "#C0392B" }}
            className={`${BTN_BASE} text-white`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
