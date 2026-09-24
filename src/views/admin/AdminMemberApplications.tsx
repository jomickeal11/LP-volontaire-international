"use client"

import React, { useState, useEffect } from "react"
import type { Language, Page } from "@/types"
import {
  getMemberApplications,
  approveMemberApplication,
  rejectMemberApplication,
  setMemberApplicationPending,
  resetMemberApplicationToPending,
  revokeMembership,
  updateMemberApplicationData,
} from "@/lib/cms-actions"

interface MemberApplicationRecord {
  id: string
  referenceNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  profession?: string | null
  organization?: string | null
  country: string
  city?: string | null
  domainsOfInterest: string
  contributionType: string
  availability: string
  motivation: string
  status: string // "PENDING" | "APPROVED" | "REJECTED"
  notes?: string | null
  memberId?: string | null
  member?: {
    id: string
    referenceNumber: string
    membershipStatus: string
  } | null
  history?: Array<{
    id: string
    action: string
    fromStatus?: string | null
    toStatus?: string | null
    authorName: string
    note?: string | null
    createdAt: Date | string
  }>
  createdAt: Date | string
}

interface AdminMemberApplicationsProps {
  lang?: Language
  navigate?: (page: Page) => void
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", label: "En attente" },
  APPROVED: { bg: "#DEF7EC", text: "#03543F", border: "#BCF0DA", label: "Validée" },
  REJECTED: { bg: "#FDE8E8", text: "#9B1C1C", border: "#FBD5D5", label: "Refusée" },
}

export default function AdminMemberApplications({}: AdminMemberApplicationsProps) {
  const [applications, setApplications] = useState<MemberApplicationRecord[]>([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedApp, setSelectedApp] = useState<MemberApplicationRecord | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [actionModal, setActionModal] = useState<{
    type: "RESET_TO_PENDING" | "REVOKE" | "REJECT" | "SET_PENDING" | "APPROVE"
    app: MemberApplicationRecord
  } | null>(null)
  const [modalReason, setModalReason] = useState("")
  const [modalError, setModalError] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleAll = () => {
    if (selectedIds.size === applications.length && applications.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  // Édition de données sans changement de statut
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<MemberApplicationRecord>>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getMemberApplications({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search || undefined,
      })
      const apps = (res.applications || []) as MemberApplicationRecord[]
      setApplications(apps)
      setCounts(res.counts)
      return apps
    } catch (e) {
      console.error(e)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [feedbackMessage])

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [feedbackMessage])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const openActionModal = (
    type: "RESET_TO_PENDING" | "REVOKE" | "REJECT" | "SET_PENDING" | "APPROVE",
    app: MemberApplicationRecord
  ) => {
    setActionModal({ type, app })
    setModalReason("")
    setModalError("")
  }

  const startEditing = () => {
    if (!selectedApp) return
    setEditFormData({
      firstName: selectedApp.firstName,
      lastName: selectedApp.lastName,
      email: selectedApp.email,
      phone: selectedApp.phone || "",
      profession: selectedApp.profession || "",
      organization: selectedApp.organization || "",
      country: selectedApp.country,
      city: selectedApp.city || "",
      contributionType: selectedApp.contributionType,
      availability: selectedApp.availability,
      motivation: selectedApp.motivation,
    })
    setIsEditing(true)
    setEditError("")
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return
    setEditLoading(true)
    setEditError("")
    try {
      const res = await updateMemberApplicationData(selectedApp.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phone: editFormData.phone,
        profession: editFormData.profession,
        organization: editFormData.organization,
        country: editFormData.country,
        city: editFormData.city,
        contributionType: editFormData.contributionType,
        availability: editFormData.availability,
        motivation: editFormData.motivation,
      })

      if (res.success && res.application) {
        setIsEditing(false)
        setFeedbackMessage({
          type: "success",
          text: "Données du dossier mises à jour avec succès.",
        })
        const freshList = await loadData()
        const refreshed = freshList.find((a) => a.id === selectedApp.id)
        if (refreshed) {
          setSelectedApp(refreshed)
        }
      } else {
        setEditError(res.error || "Une erreur est survenue.")
      }
    } catch (err: any) {
      setEditError(err.message || "Erreur de connexion.")
    } finally {
      setEditLoading(false)
    }
  }

  const handleModalSubmit = async () => {
    if (!actionModal) return
    const { type, app } = actionModal

    if (type !== "APPROVE" && !modalReason.trim()) {
      setModalError("Le motif officiel est obligatoire pour cette opération.")
      return
    }

    setActionLoading(app.id)
    setModalError("")
    try {
      let res: { success: boolean; message?: string; error?: string }

      if (type === "RESET_TO_PENDING") {
        res = await resetMemberApplicationToPending(app.id, "Admin APTIC-R", modalReason.trim())
      } else if (type === "REVOKE") {
        res = await revokeMembership(app.id, "Admin APTIC-R", modalReason.trim())
      } else if (type === "REJECT") {
        res = await rejectMemberApplication(app.id, "Admin APTIC-R", modalReason.trim())
      } else if (type === "SET_PENDING") {
        res = await setMemberApplicationPending(app.id, "Admin APTIC-R", modalReason.trim())
      } else {
        // APPROVE
        res = await approveMemberApplication(app.id, "Admin APTIC-R", modalReason.trim() || undefined)
      }

      if (res.success) {
        setFeedbackMessage({
          type: "success",
          text: res.message || "Opération effectuée avec succès.",
        })
        setActionModal(null)
        setModalReason("")
        setModalError("")
        const freshList = await loadData()
        if (selectedApp?.id === app.id) {
          const refreshed = freshList.find((a) => a.id === app.id)
          if (refreshed) {
            setSelectedApp(refreshed)
          } else {
            setSelectedApp(null)
          }
        }
      } else {
        setModalError(res.error || "Une erreur est survenue.")
      }
    } catch (e: any) {
      setModalError(e.message || "Erreur de connexion.")
    } finally {
      setActionLoading(null)
    }
  }

  const parseDomains = (jsonStr: string) => {
    try {
      const arr = JSON.parse(jsonStr)
      return Array.isArray(arr) ? arr : [jsonStr]
    } catch {
      return [jsonStr]
    }
  }

  const exportCSV = () => {
    const headers = [
      "Référence Demande",
      "Statut Demande",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Pays",
      "Ville",
      "Profession",
      "Organisation",
      "Contribution souhaitée",
      "Disponibilité",
      "Date de soumission",
      "Membre lié",
    ]

    const itemsToExport = selectedIds.size > 0 ? applications.filter((a) => selectedIds.has(a.id)) : applications
    const rows = itemsToExport.map((a) => [
      `"${a.referenceNumber}"`,
      `"${a.status}"`,
      `"${a.lastName}"`,
      `"${a.firstName}"`,
      `"${a.email}"`,
      `"${a.phone || ""}"`,
      `"${a.country}"`,
      `"${a.city || ""}"`,
      `"${a.profession || ""}"`,
      `"${a.organization || ""}"`,
      `"${a.contributionType}"`,
      `"${a.availability}"`,
      `"${new Date(a.createdAt).toISOString().split("T")[0]}"`,
      `"${a.member?.referenceNumber || "Aucun"}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `demandes_adhesion_apticr_${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">
            Demandes d&apos;adhésion
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Examinez, validez ou refusez les candidatures reçues avant création officielle des membres.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Exporter en CSV</span>
        </button>
      </div>

      {/* ── Feedback Banner ── */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
          <input
            type="text"
            placeholder="Rechercher demandeur, email, pays, réf..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#174F7A]"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Filtrer
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: `Toutes (${counts.total})` },
            { id: "PENDING", label: `En attente (${counts.pending})` },
            { id: "APPROVED", label: `Validées (${counts.approved})` },
            { id: "REJECTED", label: `Refusées (${counts.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#174F7A] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 bg-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Applications Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#174F7A] focus:ring-[#174F7A] accent-[#174F7A] cursor-pointer" checked={applications.length > 0 && selectedIds.size === applications.length} onChange={toggleAll} />
                </th>
                <th className="py-3 px-4">Réf. Demande</th>
                <th className="py-3 px-4">Demandeur</th>
                <th className="py-3 px-4">Localisation</th>
                <th className="py-3 px-4">Domaines</th>
                <th className="py-3 px-4">Statut Demande</th>
                <th className="py-3 px-4">Soumission</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Chargement des demandes d&apos;adhésion...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucune demande d&apos;adhésion trouvée avec ces critères.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => toggleOne(app.id)}>
                      <td className="py-3.5 px-4 w-12 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#174F7A] focus:ring-[#174F7A] accent-[#174F7A] cursor-pointer" checked={selectedIds.has(app.id)} onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                          {app.referenceNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          className="font-semibold text-slate-800 hover:text-[#174F7A] transition-colors cursor-pointer select-text"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedApp(app)
                          }}
                        >
                          {app.firstName} {app.lastName}
                        </div>
                        <div className="text-slate-400 text-[11px]">{app.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {app.country} {app.city && <span className="text-slate-400">({app.city})</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {parseDomains(app.domainsOfInterest).slice(0, 2).map((d: string, i: number) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 truncate max-w-[90px]"
                            >
                              {d}
                            </span>
                          ))}
                          {parseDomains(app.domainsOfInterest).length > 2 && (
                            <span className="text-[10px] text-slate-400 font-semibold self-center">
                              +{parseDomains(app.domainsOfInterest).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                          style={{
                            backgroundColor: sc.bg,
                            color: sc.text,
                            borderColor: sc.border,
                          }}
                        >
                          {sc.label}
                        </span>
                        {app.status === "APPROVED" && app.member && (
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                            Membre : {app.member.referenceNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#174F7A] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Consulter la demande"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {app.status === "PENDING" && (
                            <>
                              <button
                                disabled={actionLoading === app.id}
                                onClick={(e) => { e.stopPropagation(); openActionModal("APPROVE", app); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="Valider la demande et créer le membre officiel"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Valider</span>
                              </button>
                              <button
                                disabled={actionLoading === app.id}
                                onClick={(e) => { e.stopPropagation(); openActionModal("REJECT", app); }}
                                className="p-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Refuser la demande (motif obligatoire)"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}

                          {app.status === "APPROVED" && (
                            <>
                              <button
                                disabled={actionLoading === app.id}
                                onClick={(e) => { e.stopPropagation(); openActionModal("RESET_TO_PENDING", app); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200"
                                title="Erreur de validation / Réexamen : Remettre en attente et neutraliser le membre actuel"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
                                </svg>
                                <span>Réexamen</span>
                              </button>
                              <button
                                disabled={actionLoading === app.id}
                                onClick={(e) => { e.stopPropagation(); openActionModal("REVOKE", app); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                                title="Révocation de l'adhésion (motif obligatoire)"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>Révoquer</span>
                              </button>
                            </>
                          )}

                          {app.status === "REJECTED" && (
                            <button
                              disabled={actionLoading === app.id}
                              onClick={(e) => { e.stopPropagation(); openActionModal("SET_PENDING", app); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Remettre la demande en attente d'examen (motif obligatoire)"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Réexaminer</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Détail de la Demande ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    Demande d&apos;adhésion
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 border border-slate-200">
                    {selectedApp.referenceNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Soumise le {new Date(selectedApp.createdAt).toLocaleDateString("fr-FR")} par {selectedApp.firstName} {selectedApp.lastName}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedApp(null)
                  setIsEditing(false)
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Statut actuel de la demande */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Statut de traitement :</span>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: STATUS_CONFIG[selectedApp.status]?.bg,
                    color: STATUS_CONFIG[selectedApp.status]?.text,
                    borderColor: STATUS_CONFIG[selectedApp.status]?.border,
                  }}
                >
                  {STATUS_CONFIG[selectedApp.status]?.label}
                </span>
              </div>

              {selectedApp.status === "APPROVED" && selectedApp.member && (
                <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Membre officiel actif : <strong className="font-mono">{selectedApp.member.referenceNumber}</strong>
                </div>
              )}

              {selectedApp.status === "PENDING" && selectedApp.history?.some((h) => h.action === "APPLICATION_RESET_TO_PENDING") && (
                <div className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  En réexamen (ancien matricule neutralisé)
                </div>
              )}
            </div>

            {/* Formulaire de modification ou Consultation */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <strong>Modification des données du dossier :</strong>
                  <p className="mt-0.5 text-[11px] text-blue-800">
                    Cette action met à jour les informations sans modifier le statut de la demande. Si un membre officiel est lié, ses coordonnées sont également actualisées en conservant son matricule.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.firstName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.lastName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={editFormData.phone || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pays *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.country || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ville</label>
                    <input
                      type="text"
                      value={editFormData.city || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Profession</label>
                    <input
                      type="text"
                      value={editFormData.profession || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, profession: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Organisation</label>
                    <input
                      type="text"
                      value={editFormData.organization || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Disponibilité</label>
                    <input
                      type="text"
                      value={editFormData.availability || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contribution souhaitée</label>
                    <input
                      type="text"
                      value={editFormData.contributionType || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, contributionType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 text-xs">Motivation</label>
                  <textarea
                    rows={3}
                    value={editFormData.motivation || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, motivation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#174F7A] resize-none"
                  />
                </div>

                {editError && (
                  <p className="text-xs text-rose-600 font-medium">{editError}</p>
                )}

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    {editLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Informations personnelles */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Email</span>
                    <span className="font-medium text-slate-800">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Téléphone</span>
                    <span className="font-medium text-slate-800">{selectedApp.phone || "Non renseigné"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Localisation</span>
                    <span className="font-medium text-slate-800">{selectedApp.country} {selectedApp.city && `(${selectedApp.city})`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Profession</span>
                    <span className="font-medium text-slate-800">{selectedApp.profession || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Organisation</span>
                    <span className="font-medium text-slate-800">{selectedApp.organization || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Disponibilité</span>
                    <span className="font-medium text-slate-800">{selectedApp.availability}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Contribution souhaitée</span>
                    <span className="font-bold text-[#174F7A]">{selectedApp.contributionType}</span>
                  </div>
                </div>

                {/* Domaines d'intérêt */}
                <div>
                  <span className="text-xs text-slate-400 block font-semibold mb-2">
                    Domaines d&apos;intérêt
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parseDomains(selectedApp.domainsOfInterest).map((d: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <span className="text-xs text-slate-400 block font-semibold mb-1">
                    Motivation exprimée
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.motivation}
                  </div>
                </div>

                {/* ── Historique de la décision (Audit trail) ── */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      Historique d&apos;audit & traçabilité
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {selectedApp.history?.length || 0} événement(s)
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {selectedApp.history && selectedApp.history.length > 0 ? (
                      selectedApp.history.map((h) => {
                        const getActionBadgeStyle = () => {
                          if (h.action === "APPLICATION_APPROVED" || h.action === "MEMBER_ACTIVATED") {
                            return "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }
                          if (h.action === "APPLICATION_RESET_TO_PENDING") {
                            return "bg-amber-50 text-amber-800 border-amber-200"
                          }
                          if (h.action === "APPLICATION_REJECTED" || h.action === "MEMBERSHIP_REVOKED") {
                            return "bg-rose-50 text-rose-800 border-rose-200"
                          }
                          return "bg-slate-100 text-slate-700 border-slate-200"
                        }

                        return (
                          <div
                            key={h.id}
                            className="text-xs p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span>{h.authorName}</span>
                                <span className="text-slate-400 font-normal">→</span>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight border ${getActionBadgeStyle()}`}
                                >
                                  {h.action}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono">
                                {new Date(h.createdAt).toLocaleDateString("fr-FR")} à{" "}
                                {new Date(h.createdAt).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {h.note && (
                              <div className="text-xs text-slate-700 whitespace-pre-wrap pl-2.5 border-l-2 border-slate-300 font-sans leading-relaxed mt-0.5">
                                {h.note}
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Aucun événement d&apos;historique enregistré pour le moment.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions in Modal Footer */}
                <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-100">
                  <div>
                    {/* Statut PENDING : Jamais de bouton 'Remettre en attente'. Modifier la fiche disponible à gauche */}
                    {selectedApp.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={startEditing}
                        className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer font-medium"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Modifier les informations</span>
                      </button>
                    )}

                    {/* Statut APPROVED : Remise en attente (Erreur / Réexamen) avec neutralisation traçable */}
                    {selectedApp.status === "APPROVED" && (
                      <button
                        disabled={actionLoading === selectedApp.id}
                        onClick={() => openActionModal("RESET_TO_PENDING", selectedApp)}
                        className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer font-medium"
                        title="Remettre en attente et neutraliser le membre actuel"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
                        </svg>
                        <span>Remettre en attente (Erreur / Réexamen)</span>
                      </button>
                    )}

                    {/* Statut REJECTED : Remettre en attente d'examen */}
                    {selectedApp.status === "REJECTED" && (
                      <button
                        disabled={actionLoading === selectedApp.id}
                        onClick={() => openActionModal("SET_PENDING", selectedApp)}
                        className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Remettre en attente d&apos;examen</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedApp.status === "APPROVED" && (
                      <>
                        <button
                          type="button"
                          onClick={startEditing}
                          className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer font-medium"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span>Modifier</span>
                        </button>
                        <button
                          disabled={actionLoading === selectedApp.id}
                          onClick={() => openActionModal("REVOKE", selectedApp)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                          title="Révoquer l'adhésion et retirer le membre du répertoire"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          <span>Révoquer l&apos;adhésion</span>
                        </button>
                      </>
                    )}

                    {selectedApp.status === "REJECTED" && (
                      <button
                        type="button"
                        onClick={startEditing}
                        className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer font-medium"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Modifier</span>
                      </button>
                    )}

                    {/* Statut PENDING : Seulement Refuser et Valider */}
                    {selectedApp.status === "PENDING" && (
                      <>
                        <button
                          disabled={actionLoading === selectedApp.id}
                          onClick={() => openActionModal("REJECT", selectedApp)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Refuser la demande</span>
                        </button>

                        <button
                          disabled={actionLoading === selectedApp.id}
                          onClick={() => openActionModal("APPROVE", selectedApp)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#174F7A] text-white hover:bg-[#123E60] transition-colors cursor-pointer shadow-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Valider et créer le membre</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal d'Action Officielle (Confirmation & Motif Obligatoire) ── */}
      {actionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    actionModal.type === "APPROVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : actionModal.type === "RESET_TO_PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : actionModal.type === "SET_PENDING"
                      ? "bg-slate-100 text-slate-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {actionModal.type === "APPROVE" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {actionModal.type === "RESET_TO_PENDING" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
                    </svg>
                  )}
                  {actionModal.type === "SET_PENDING" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {(actionModal.type === "REJECT" || actionModal.type === "REVOKE") && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {actionModal.type === "APPROVE" && "Validation de la demande d'adhésion"}
                    {actionModal.type === "RESET_TO_PENDING" && "Remise en attente d'examen / Réexamen"}
                    {actionModal.type === "SET_PENDING" && "Réexamen de la demande refusée"}
                    {actionModal.type === "REVOKE" && "Révocation de l'adhésion"}
                    {actionModal.type === "REJECT" && "Refus de la candidature"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dossier {actionModal.app.referenceNumber} — {actionModal.app.firstName} {actionModal.app.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Note explicative selon le cas */}
            {actionModal.type === "APPROVE" && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed space-y-1">
                <p className="font-semibold">Validation officielle &amp; création de membre :</p>
                <p>
                  La demande passera au statut <strong>Validée</strong>. Un compte membre officiel sera automatiquement créé dans le répertoire actif avec un nouveau numéro de matricule unique (ex: <code>MBR-{new Date().getFullYear()}-XXXX</code>).
                </p>
              </div>
            )}

            {actionModal.type === "RESET_TO_PENDING" && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1.5">
                <p className="font-semibold">Neutralisation et dissociation du membre officiel :</p>
                <p>
                  Cette demande avait généré le matricule membre{" "}
                  <strong>{actionModal.app.member?.referenceNumber}</strong>. En remettant la demande en attente :
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                  <li>La demande repasse au statut « En attente » (actions possibles : Valider ou Refuser).</li>
                  <li>Le membre actuel est neutralisé et dissocié de la demande (conservé dans l&apos;historique d&apos;audit, retiré du répertoire actif).</li>
                  <li>Règle stricte : ce numéro de matricule ne sera jamais réutilisé. Si la demande est validée à nouveau plus tard, un tout nouveau matricule sera automatiquement généré.</li>
                </ul>
              </div>
            )}

            {actionModal.type === "REVOKE" && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed space-y-1">
                <p className="font-semibold">Révocation de l&apos;adhésion active :</p>
                <p>
                  Le membre <strong>{actionModal.app.firstName} {actionModal.app.lastName}</strong> (
                  {actionModal.app.member?.referenceNumber}) sera immédiatement retiré du répertoire actif (statut RÉVOQUÉ). La demande passera au statut Refusée/Révoquée.
                </p>
                <p className="text-[11px] text-rose-800 italic">
                  L&apos;intégralité du dossier et l&apos;historique d&apos;audit sont conservés pour conformité.
                </p>
              </div>
            )}

            {actionModal.type === "REJECT" && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <p>
                  La candidature sera marquée comme refusée. Aucun membre ne sera créé. Le motif est obligatoire et restera consigné dans l&apos;historique d&apos;audit du dossier.
                </p>
              </div>
            )}

            {actionModal.type === "SET_PENDING" && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <p>
                  La demande refusée va être réexaminée et repasser en attente. Un motif est obligatoire pour justifier la réouverture du dossier.
                </p>
              </div>
            )}

            {/* Champ motif */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {actionModal.type === "APPROVE" ? (
                  <span>Observation ou note d&apos;examen (optionnelle)</span>
                ) : (
                  <>
                    <span>Motif obligatoire de la décision</span>{" "}
                    <span className="text-rose-500">*</span>
                  </>
                )}
              </label>
              <textarea
                rows={3}
                required={actionModal.type !== "APPROVE"}
                value={modalReason}
                onChange={(e) => {
                  setModalReason(e.target.value)
                  if (modalError) setModalError("")
                }}
                placeholder={
                  actionModal.type === "APPROVE"
                    ? "Ex: Dossier complet validé lors de la réunion du bureau..."
                    : actionModal.type === "RESET_TO_PENDING"
                    ? "Ex: Erreur de validation lors de la séance - pièces manquantes..."
                    : actionModal.type === "SET_PENDING"
                    ? "Ex: Nouvelles pièces justificatives reçues pour réexamen..."
                    : actionModal.type === "REVOKE"
                    ? "Ex: Non-respect de la charte de l'association, cessation d'activité volontaire..."
                    : "Ex: Profil ne correspondant pas aux domaines prioritaires actuels de l'association..."
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#174F7A] resize-none"
              />
              {modalError && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 inline shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{modalError}</span>
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading === actionModal.app.id}
                onClick={handleModalSubmit}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                  actionModal.type === "APPROVE"
                    ? "bg-[#174F7A] hover:bg-[#123E60]"
                    : actionModal.type === "RESET_TO_PENDING"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : actionModal.type === "SET_PENDING"
                    ? "bg-slate-700 hover:bg-slate-800"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading === actionModal.app.id ? (
                  <span>Enregistrement...</span>
                ) : (
                  <span>
                    {actionModal.type === "APPROVE" && "Valider et créer le membre"}
                    {actionModal.type === "RESET_TO_PENDING" && "Confirmer la remise en attente"}
                    {actionModal.type === "SET_PENDING" && "Confirmer le réexamen"}
                    {actionModal.type === "REVOKE" && "Confirmer la révocation"}
                    {actionModal.type === "REJECT" && "Confirmer le refus"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
