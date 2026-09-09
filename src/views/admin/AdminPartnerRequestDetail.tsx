"use client"

import { useState, useEffect } from "react"
import type { Page } from "../../types"
import { partnerStatusConfig, type PartnerRequestStatus } from "./AdminPartnerRequests"
import { useAdminHeader } from "../../lib/AdminHeaderContext"
import { sendPartnerDirectEmail } from "@/lib/actions"

interface DocumentUI {
  id: string
  originalName: string
  storageKey: string
  mimeType: string
  size: number
  createdAt: string
}

export interface PartnerRequestDetailData {
  id: string
  referenceNumber?: string | null
  orgName: string
  country: string
  website?: string | null
  orgType: string
  contactPerson: string
  email: string
  phone?: string | null
  volunteerCount?: string | null
  targetCountries?: string | null
  programme?: string | null
  message: string
  consent: boolean
  status: PartnerRequestStatus
  createdAt: string
  updatedAt: string
  partner?: {
    id: string
    orgName: string
    country: string
  } | null
  documents: DocumentUI[]
}

interface Props {
  data: PartnerRequestDetailData
  navigate: (p: Page) => void
  onStatusChange: (id: string, status: PartnerRequestStatus) => void
}

export default function AdminPartnerRequestDetail({
  data,
  navigate,
  onStatusChange,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState<PartnerRequestStatus>(data.status)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const { setBreadcrumb } = useAdminHeader()

  useEffect(() => {
    setBreadcrumb([
      { label: "Demandes de partenariat" },
    ])
    return () => {
      setBreadcrumb([])
    }
  }, [setBreadcrumb])

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState(
    `APTIC-R · Partenariat de volontariat international — ${data.orgName}`
  )
  const [emailBody, setEmailBody] = useState(
    `Bonjour ${data.contactPerson},\n\nNous vous remercions pour votre intérêt à collaborer avec APTIC-R dans le cadre du déploiement de volontaires internationaux au Togo.\n\n`
  )
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const cfg = partnerStatusConfig[currentStatus] || partnerStatusConfig.NEW

  const handleStatusSelect = (st: PartnerRequestStatus) => {
    setCurrentStatus(st)
    setStatusDropdownOpen(false)
    onStatusChange(data.id, st)
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return
    setEmailLoading(true)
    setEmailError(null)

    try {
      const res = await sendPartnerDirectEmail({
        requestId: data.id,
        recipientEmail: data.email,
        recipientName: data.contactPerson,
        subject: emailSubject,
        message: emailBody,
      })

      if (res.success) {
        setEmailLoading(false)
        setEmailSent(true)
        setTimeout(() => {
          setEmailModalOpen(false)
          setEmailSent(false)
        }, 1500)
      } else {
        setEmailLoading(false)
        setEmailError(res.error || "Une erreur est survenue lors de l'envoi de l'email.")
      }
    } catch (err: any) {
      setEmailLoading(false)
      setEmailError(err?.message || "Erreur de communication avec le serveur d'emails.")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-[1100px] mx-auto pb-16 space-y-6">
      {/* Top action bar: Back link */}
      <div>
        <button
          onClick={() => navigate("admin-partner-requests")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#174F7A] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Demandes de partenariat
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                {data.referenceNumber || `PART-${new Date().getFullYear()}-0001`}
              </span>
              <span className="text-xs text-slate-400">Reçue le {data.createdAt}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {data.orgName}
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-700">{data.country}</span>
              <span>·</span>
              <span>{data.orgType}</span>
              <span>·</span>
              <span>
                {data.volunteerCount ? `${data.volunteerCount} volontaires potentiels` : "Effectif non précisé"}
              </span>
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border shadow-2xs cursor-pointer transition-colors"
                style={{
                  backgroundColor: cfg.bg,
                  color: cfg.text,
                  borderColor: cfg.border,
                }}
              >
                <span>{cfg.label}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                    Changer le statut
                  </div>
                  {(["NEW", "REVIEW", "APPROVED", "REJECTED", "ARCHIVED"] as const).map((st) => {
                    const itemCfg = partnerStatusConfig[st]
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusSelect(st)}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          currentStatus === st ? "text-[#174F7A] font-bold" : "text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: itemCfg.text }}
                          />
                          {itemCfg.label}
                        </span>
                        {currentStatus === st && (
                          <svg className="w-3.5 h-3.5 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Contacter Button */}
            <button
              onClick={() => setEmailModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#174F7A] text-white hover:bg-[#123E60] shadow-xs cursor-pointer transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contacter
            </button>

            {/* Document presentation button if exists */}
            {data.documents.length > 0 && (
              <a
                href={`/api/documents/${data.documents[0].storageKey}`}
                download={data.documents[0].originalName}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Document
              </a>
            )}
          </div>
        </div>

        {/* Informational banner when approved */}
        {currentStatus === "APPROVED" && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cette demande est approuvée. L&apos;organisation est répertoriée dans la liste des <strong>Partenaires</strong>.</span>
            </div>
            <button
              onClick={() => navigate("admin-partners")}
              className="text-emerald-800 font-bold underline ml-2 cursor-pointer hover:text-emerald-950"
            >
              Voir la liste des partenaires →
            </button>
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Informations Organisation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Informations organisation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Nom légal</span>
                <span className="font-semibold text-slate-800">{data.orgName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Pays du siège</span>
                <span className="font-semibold text-slate-800">{data.country}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Type d&apos;organisation</span>
                <span className="font-semibold text-slate-800">{data.orgType}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Site web officiel</span>
                {data.website ? (
                  <a
                    href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#174F7A] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {data.website}
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Non renseigné</span>
                )}
              </div>
            </div>
          </div>

          {/* Programme de volontariat & Pays concernés */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Programme de volontariat
            </h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Cadre / Programme officiel</span>
                  <span className="font-semibold text-slate-800">
                    {data.programme || "Non spécifié (partenariat libre / bilatéral)"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Volontaires potentiels / an</span>
                  <span className="font-semibold text-slate-800">
                    {data.volunteerCount ? `${data.volunteerCount} personnes` : "À déterminer"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">Pays concernés</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {data.targetCountries || "Togo (principale zone d'intervention) et pays d'origine du partenaire"}
                </p>
              </div>
            </div>
          </div>

          {/* Message du partenaire */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#174F7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Message et motivation
            </h2>
            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed font-serif">
              {data.message || <span className="italic text-slate-400">Aucun message saisi.</span>}
            </div>
          </div>
        </div>

        {/* Right Column (Contact, Documents, Historique) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Personne de Contact */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Contact référent
            </h2>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-slate-900">{data.contactPerson}</div>
                <div className="text-xs text-slate-500">Responsable des partenariats</div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-[#174F7A] transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{data.email}</span>
                </a>

                {data.phone ? (
                  <a
                    href={`tel:${data.phone}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-[#174F7A] transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{data.phone}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 italic">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Téléphone non renseigné</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setEmailModalOpen(true)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer transition-colors text-center border"
                  style={{
                    backgroundColor: "#E8F2FA",
                    color: "#1B4F7C",
                    borderColor: "#D1DCE5",
                  }}
                >
                  Envoyer un e-mail direct
                </button>
              </div>
            </div>
          </div>

          {/* Document de présentation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Document de présentation
            </h2>
            {data.documents && data.documents.length > 0 ? (
              <div className="space-y-2">
                {data.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={doc.originalName}>
                        {doc.originalName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(doc.size)} · {doc.mimeType.split("/")[1]?.toUpperCase() || "DOC"}
                      </p>
                    </div>
                    <a
                      href={`/api/documents/${doc.storageKey}`}
                      download={doc.originalName}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-[#174F7A] bg-white border border-slate-200 hover:bg-blue-50 rounded cursor-pointer transition-colors flex-shrink-0"
                    >
                      Télécharger
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                Aucun document joint à cette demande.
              </div>
            )}
          </div>

          {/* Historique & Traçabilité */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Historique
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#174F7A] mt-1.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">
                    Statut actuel : {cfg.label}
                  </div>
                  <div className="text-slate-400 text-[11px]">Dernière mise à jour : {data.updatedAt}</div>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-700">Demande soumise en ligne</div>
                  <div className="text-slate-400 text-[11px]">{data.createdAt}</div>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-700">Consentement RGPD validé</div>
                  <div className="text-slate-400 text-[11px]">
                    {data.consent ? "Accord explicite donné" : "Non consenti"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Contacter {data.orgName}
              </h3>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Destinataire</label>
                <input
                  type="text"
                  disabled
                  value={`${data.contactPerson} <${data.email}>`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Sujet</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Message</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
                />
              </div>
            </div>

            {emailError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {emailError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={emailLoading}
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={emailLoading || emailSent}
                onClick={handleSendEmail}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {emailLoading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : emailSent ? (
                  "✓ Email envoyé !"
                ) : (
                  "Envoyer l'email"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
