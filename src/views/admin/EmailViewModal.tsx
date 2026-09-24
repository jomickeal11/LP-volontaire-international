"use client"

import React, { useState } from "react"
import { resendCandidateEmailAction } from "@/lib/actions"

export interface EmailLogItem {
  id: string
  recipient: string
  recipientName?: string | null
  subject: string
  bodyHtml: string
  bodyText?: string | null
  status: string // "SENT" | "FAILED"
  error?: string | null
  actionType: string
  sentAt: string | Date
}

interface Props {
  isOpen: boolean
  emailLog: EmailLogItem | null
  onClose: () => void
  onResendSuccess?: () => void
}

export default function EmailViewModal({
  isOpen,
  emailLog,
  onClose,
  onResendSuccess,
}: Props) {
  const [viewMode, setViewMode] = useState<"html" | "text">("html")
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle")
  const [resendError, setResendError] = useState<string | null>(null)

  if (!isOpen || !emailLog) return null

  const isFailed = emailLog.status === "FAILED"
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(emailLog.sentAt))

  const handleResend = async () => {
    setResending(true)
    setResendStatus("idle")
    setResendError(null)

    try {
      const res = await resendCandidateEmailAction(emailLog.id)
      if (res.success) {
        setResendStatus("success")
        if (onResendSuccess) onResendSuccess()
      } else {
        setResendStatus("error")
        setResendError(res.error || "Impossible de réexpédier l'email.")
      }
    } catch (err: unknown) {
      setResendStatus("error")
      setResendError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#174F7A] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#174F7A] line-clamp-1">
                {emailLog.subject}
              </h3>
              <p className="text-xs text-slate-500">
                Transmis à <strong>{emailLog.recipientName || emailLog.recipient}</strong> le {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Email Meta Info Card */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div>
              <span className="text-slate-400 font-medium">Destinataire : </span>
              <span className="text-slate-700 font-semibold">{emailLog.recipient}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Expéditeur : </span>
              <span className="text-slate-700">APTIC-R Volontariat International &lt;aptic.rural19@gmail.com&gt;</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emailLog.status === "SENT" || resendStatus === "success" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Envoyé avec succès
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Échec de transmission
              </span>
            )}

            {isFailed && resendStatus !== "success" && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {resending ? "Envoi..." : "Réessayer l'envoi"}
              </button>
            )}
          </div>
        </div>

        {/* Error message alert if failed */}
        {(emailLog.error || resendError) && (
          <div className="px-6 py-2.5 bg-red-50/80 border-b border-red-100 text-xs text-red-700 flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Raison de l&apos;échec :</strong> {resendError || emailLog.error}
            </div>
          </div>
        )}

        {resendStatus === "success" && (
          <div className="px-6 py-2.5 bg-emerald-50 text-xs text-emerald-700 font-semibold border-b border-emerald-100">
            L&apos;e-mail a été réexpédié avec succès au destinataire.
          </div>
        )}

        {/* View Mode Switcher */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contenu réel expédié
          </span>

          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode("html")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === "html" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Rendu visuel (HTML)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("text")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Texte brut
            </button>
          </div>
        </div>

        {/* Email Content Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {viewMode === "html" ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto">
              <div
                className="email-render-preview"
                dangerouslySetInnerHTML={{
                  __html: emailLog.bodyHtml.replace(
                    /src="https?:\/\/(localhost|127\.0\.0\.1|aptic-rural\.org)[^"]*?logo-aptic\.png"/gi,
                    'src="/logo-aptic.png"'
                  ),
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {emailLog.bodyText || "Version texte non consignée."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
