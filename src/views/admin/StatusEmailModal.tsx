"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  getCandidateTemplateDefinition,
  renderCandidateWorkflowEmail,
  buildInterviewBodyText,
  buildStatusBodyText,
  formatHumanDate,
} from "@/lib/email/templates/candidateWorkflowTemplates"
import { formatTextToHtml } from "@/lib/email/variableEngine"
import { getStatusLabel } from "@/i18n/adminTranslations"
import { statusColors } from "@/data/mockCandidates"
import type { CandidateStatus } from "@/data/mockCandidates"

interface Props {
  isOpen: boolean
  targetStatus: CandidateStatus | null
  currentStatus: CandidateStatus
  candidate: {
    id: string
    firstName: string
    lastName: string
    email: string
    reference: string
    language?: string
    communicationLanguage?: "FR" | "EN" | "DE"
    country?: string
  }
  lang?: string
  onClose: () => void
  onConfirm: (options: {
    sendEmail: boolean
    customSubject?: string
    customBody?: string
    interviewDetails?: {
      interviewDate?: string
      interviewTime?: string
      timezone?: string
      interviewMode?: string
      interviewLocation?: string
      interviewLink?: string
      additionalMessage?: string
    }
  }) => Promise<void>
}

export default function StatusEmailModal({
  isOpen,
  targetStatus,
  currentStatus: _currentStatus,
  candidate,
  lang = "fr",
  onClose,
  onConfirm,
}: Props) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [loading, setLoading] = useState(false)

  // Champs spécifiques à l'entretien
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewTime, setInterviewTime] = useState("14:00")
  const [timezone, setTimezone] = useState("GMT / Heure de Lomé")
  const [interviewMode, setInterviewMode] = useState("Visioconférence Google Meet")
  const [interviewLocation, setInterviewLocation] = useState("")
  const [additionalMessage, setAdditionalMessage] = useState("")

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [isCustomEdited, setIsCustomEdited] = useState(false)

  // Détection de la langue de communication officielle du candidat
  const candidateLang: "FR" | "EN" | "DE" = useMemo(() => {
    if (candidate.communicationLanguage) {
      return candidate.communicationLanguage
    }
    const raw = (candidate.language || "").toLowerCase()
    if (raw.includes("anglais") || raw.includes("en")) return "EN"
    if (raw.includes("allemand") || raw.includes("de")) return "DE"
    return "FR"
  }, [candidate.communicationLanguage, candidate.language])

  // Initialisation à l'ouverture du modal
  useEffect(() => {
    if (!isOpen || !targetStatus || !candidate) return

    // 1. Sujet sans variables brutes
    const def = getCandidateTemplateDefinition(targetStatus, candidateLang)
    if (def) {
      setSubject(def.subject.replace(/\{\{\s*reference\s*\}\}/g, candidate.reference))
    } else {
      setSubject(`APTIC-R — ${getStatusLabel(targetStatus, candidateLang)} — ${candidate.reference}`)
    }

    // 2. Corps du message
    if (targetStatus === "INTERVIEW") {
      const defaultTime = "14:00"
      const defaultTz =
        candidateLang === "EN"
          ? "GMT / Lomé Time (UTC+0)"
          : candidateLang === "DE"
          ? "GMT / Lomé Zeit (UTC+0)"
          : "GMT / Heure de Lomé"
      const defaultMode =
        candidateLang === "EN"
          ? "Google Meet Videoconference"
          : candidateLang === "DE"
          ? "Google Meet Videokonferenz"
          : "Visioconférence Google Meet"

      setInterviewDate("")
      setInterviewTime(defaultTime)
      setTimezone(defaultTz)
      setInterviewMode(defaultMode)
      setInterviewLocation("")
      setAdditionalMessage("")

      const generated = buildInterviewBodyText({
        candidateFirstName: candidate.firstName,
        date: "",
        time: defaultTime,
        timezone: defaultTz,
        mode: defaultMode,
        location: "",
        additionalMessage: "",
        lang: candidateLang,
      })
      setBody(generated)
    } else {
      const generated = buildStatusBodyText({
        status: targetStatus,
        candidateFirstName: candidate.firstName,
        lang: candidateLang,
      })
      setBody(generated)
    }

    setIsCustomEdited(false)
  }, [isOpen, targetStatus, candidate, candidateLang])

  // Injection immédiate des champs d'entretien
  const handleInterviewFieldChange = (field: string, value: string) => {
    let newDate = interviewDate
    let newTime = interviewTime
    let newTz = timezone
    let newMode = interviewMode
    let newLoc = interviewLocation
    let newMsg = additionalMessage

    if (field === "date") {
      newDate = value
      setInterviewDate(value)
    } else if (field === "time") {
      newTime = value
      setInterviewTime(value)
    } else if (field === "timezone") {
      newTz = value
      setTimezone(value)
    } else if (field === "mode") {
      newMode = value
      setInterviewMode(value)
    } else if (field === "location") {
      newLoc = value
      setInterviewLocation(value)
    } else if (field === "message") {
      newMsg = value
      setAdditionalMessage(value)
    }

    const generated = buildInterviewBodyText({
      candidateFirstName: candidate.firstName,
      date: newDate,
      time: newTime,
      timezone: newTz,
      mode: newMode,
      location: newLoc,
      additionalMessage: newMsg,
      lang: candidateLang,
    })

    setBody(generated)
    setIsCustomEdited(false)
  }

  const handleResetBody = () => {
    if (targetStatus === "INTERVIEW") {
      const generated = buildInterviewBodyText({
        candidateFirstName: candidate.firstName,
        date: interviewDate,
        time: interviewTime,
        timezone: timezone,
        mode: interviewMode,
        location: interviewLocation,
        additionalMessage: additionalMessage,
        lang: candidateLang,
      })
      setBody(generated)
    } else if (targetStatus) {
      const generated = buildStatusBodyText({
        status: targetStatus,
        candidateFirstName: candidate.firstName,
        lang: candidateLang,
      })
      setBody(generated)
    }
    setIsCustomEdited(false)
  }

  if (!isOpen || !targetStatus) return null

  const isInterview = targetStatus === "INTERVIEW"

  const handleConfirm = async (withEmail: boolean) => {
    setLoading(true)
    try {
      await onConfirm({
        sendEmail: withEmail,
        customSubject: withEmail ? subject.trim() : undefined,
        customBody: withEmail ? body.trim() : undefined,
        interviewDetails:
          withEmail && isInterview
            ? {
                interviewDate: formatHumanDate(interviewDate, candidateLang),
                interviewTime: interviewTime.trim(),
                timezone: timezone.trim(),
                interviewMode: interviewMode.trim(),
                interviewLocation: interviewLocation.trim(),
                interviewLink: interviewLocation.trim(),
                additionalMessage: additionalMessage.trim(),
              }
            : undefined,
      })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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
        {/* En-tête */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#174F7A] flex items-center gap-2">
              <span>Changement de statut</span>
              <span className="text-slate-400 font-normal">➔</span>
              <span
                className="px-2.5 py-0.5 rounded-md text-xs font-bold"
                style={{
                  backgroundColor: statusColors[targetStatus]?.bg || "#EEF5F8",
                  color: statusColors[targetStatus]?.text || "#174F7A",
                }}
              >
                {getStatusLabel(targetStatus, lang)}
              </span>
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
              <span>
                Candidat : <strong className="text-slate-700">{candidate.firstName} {candidate.lastName}</strong> ({candidate.reference})
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                <span>Langue d&apos;envoi :</span>
                <strong className="text-[#174F7A]">
                  {candidateLang === "EN" ? "English" : candidateLang === "DE" ? "Deutsch" : "Français"}
                </strong>
              </span>
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

        {/* Corps principal */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {/* Onglets : Édition / Aperçu */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-[#174F7A] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Personnaliser le contenu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-[#174F7A] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Aperçu de l&apos;e-mail
              </button>
            </div>

            {activeTab === "edit" ? (
              <div className="space-y-4">
                {/* Paramètres de l'entretien */}
                {isInterview && (
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Paramètres de l&apos;entretien
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Date de l&apos;entretien
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={interviewDate}
                            onChange={(e) => handleInterviewFieldChange("date", e.target.value)}
                            placeholder="ex: 25 septembre 2026"
                            className="w-full text-xs pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                          />
                          <input
                            type="date"
                            tabIndex={-1}
                            title="Choisir dans le calendrier"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleInterviewFieldChange("date", formatHumanDate(e.target.value, candidateLang))
                              }
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 hover:opacity-100 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Heure
                        </label>
                        <input
                          type="text"
                          value={interviewTime}
                          onChange={(e) => handleInterviewFieldChange("time", e.target.value)}
                          placeholder="ex: 14:00"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Fuseau horaire
                        </label>
                        <input
                          type="text"
                          value={timezone}
                          onChange={(e) => handleInterviewFieldChange("timezone", e.target.value)}
                          placeholder="ex: GMT / Heure de Lomé"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Mode d&apos;échange
                        </label>
                        <input
                          type="text"
                          value={interviewMode}
                          onChange={(e) => handleInterviewFieldChange("mode", e.target.value)}
                          placeholder="ex: Visioconférence Google Meet"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Lieu ou lien de connexion
                        </label>
                        <input
                          type="text"
                          value={interviewLocation}
                          onChange={(e) => handleInterviewFieldChange("location", e.target.value)}
                          placeholder="ex: https://meet.google.com/xxx ou Bureau APTIC-R"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Message ou consignes complémentaires (optionnel)
                        </label>
                        <input
                          type="text"
                          value={additionalMessage}
                          onChange={(e) => handleInterviewFieldChange("message", e.target.value)}
                          placeholder="ex: Merci de tester votre micro avant la séance."
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Champ Objet */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Objet de l&apos;e-mail
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                  />
                </div>

                {/* Champ Corps */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <span>Corps du message</span>
                      {isCustomEdited && (
                        <span className="text-[10px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Modifié
                        </span>
                      )}
                    </label>
                    {isCustomEdited && (
                      <button
                        type="button"
                        onClick={handleResetBody}
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={12}
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value)
                      setIsCustomEdited(true)
                    }}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans text-slate-800 leading-relaxed resize-y"
                  />
                </div>
              </div>
            ) : (
              /* Aperçu réel de l'e-mail */
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                {/* En-tête de boîte de réception simulée */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs space-y-1">
                  <div>
                    <span className="text-slate-400 font-medium">De : </span>
                    <span className="text-slate-700 font-semibold">
                      APTIC-R Volontariat International &lt;aptic.rural19@gmail.com&gt;
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">À : </span>
                    <span className="text-slate-700">{candidate.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Objet : </span>
                    <span className="font-bold text-[#174F7A]">{subject}</span>
                  </div>
                </div>

                {/* Corps avec logo centré */}
                <div className="p-6 bg-white max-h-[420px] overflow-y-auto">
                  <div className="text-center mb-6">
                    <img
                      src="/logo-aptic.png"
                      alt="APTIC-R"
                      className="inline-block w-40 max-w-[160px] h-auto"
                    />
                  </div>

                  <div
                    className="text-sm text-slate-800 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatTextToHtml(body),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action du pied de page */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleConfirm(false)}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Changer sans e-mail
            </button>

            <button
              type="button"
              onClick={() => handleConfirm(true)}
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#174F7A" }}
            >
              {loading ? "Traitement..." : "Confirmer et envoyer l'e-mail"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
