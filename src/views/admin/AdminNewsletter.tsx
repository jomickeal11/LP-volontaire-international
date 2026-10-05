"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  getNewsletterSubscribers,
  toggleNewsletterSubscriberStatus,
  adminAddNewsletterSubscriber,
  exportNewsletterSubscribersCsv,
  exportNewsletterByLanguageZip,
} from "@/lib/cms-actions"
import { useConfirm } from "@/components/admin/ConfirmProvider"

interface SubscriberItem {
  id: string
  email: string
  firstName: string | null
  lang: string
  active: boolean
  consent: boolean
  subscribedAt: Date
  unsubscribedAt: Date | null
}

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"
type ExportLang = "ALL" | "FR" | "EN" | "DE"
type ExportStatus = "ACTIVE" | "ALL"

const EXPORT_LANGS: { value: ExportLang; label: string }[] = [
  { value: "ALL", label: "Toutes les langues" },
  { value: "FR", label: "Français (FR)" },
  { value: "EN", label: "English (EN)" },
  { value: "DE", label: "Deutsch (DE)" },
]

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function AdminNewsletter() {
  const confirm = useConfirm()
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [langFilter, setLangFilter] = useState<string>("ALL")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [exporting, setExporting] = useState<"csv" | "zip" | null>(null)

  // Modale d'ajout
  const [modalOpen, setModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLang, setNewLang] = useState<"FR" | "EN" | "DE">("FR")
  const [newConsent, setNewConsent] = useState(true)
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [modalError, setModalError] = useState("")

  // Modale d'export (critères indépendants des filtres de la table)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportLang, setExportLang] = useState<ExportLang>("ALL")
  const [exportStatus, setExportStatus] = useState<ExportStatus>("ACTIVE")

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getNewsletterSubscribers()
      setSubscribers(data as unknown as SubscriberItem[])
    } catch (e) {
      console.error("Error loading subscribers:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const notify = (type: "success" | "error", text: string) => {
    setNotification({ type, text })
    window.setTimeout(() => setNotification(null), 3000)
  }

  // Filtrage côté client : liste complète chargée une fois pour une synthèse exacte.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return subscribers.filter((s) => {
      if (statusFilter === "ACTIVE" && !s.active) return false
      if (statusFilter === "INACTIVE" && s.active) return false
      if (langFilter !== "ALL" && s.lang !== langFilter) return false
      if (term) {
        const haystack = `${s.email} ${s.firstName ?? ""}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [subscribers, search, statusFilter, langFilter])

  const counts = useMemo(() => {
    const active = subscribers.filter((s) => s.active).length
    return {
      total: subscribers.length,
      active,
      inactive: subscribers.length - active,
      fr: subscribers.filter((s) => s.lang === "FR").length,
      en: subscribers.filter((s) => s.lang === "EN").length,
      de: subscribers.filter((s) => s.lang === "DE").length,
    }
  }, [subscribers])

  // Statistiques pour le compteur d'export (indépendantes de la recherche).
  const exportStats = useMemo(() => {
    const byLang: Record<"FR" | "EN" | "DE", { active: number; all: number }> = {
      FR: { active: 0, all: 0 },
      EN: { active: 0, all: 0 },
      DE: { active: 0, all: 0 },
    }
    let totalActive = 0
    for (const s of subscribers) {
      const key: "FR" | "EN" | "DE" = s.lang === "EN" ? "EN" : s.lang === "DE" ? "DE" : "FR"
      byLang[key].all += 1
      if (s.active) {
        byLang[key].active += 1
        totalActive += 1
      }
    }
    return { totalAll: subscribers.length, totalActive, byLang }
  }, [subscribers])

  const exportPreviewCount = useMemo(() => {
    if (exportLang === "ALL") {
      return exportStatus === "ACTIVE" ? exportStats.totalActive : exportStats.totalAll
    }
    const stat = exportStats.byLang[exportLang]
    return exportStatus === "ACTIVE" ? stat.active : stat.all
  }, [exportLang, exportStatus, exportStats])

  const exportPreviewText = useMemo(() => {
    const n = exportPreviewCount
    if (n === 0) return "Aucun abonné ne correspond à cette sélection."
    const plural = n > 1
    const noun = plural ? "abonnés" : "abonné"
    const statusWord = exportStatus === "ACTIVE" ? (plural ? " actifs" : " actif") : ""
    const langWord = exportLang !== "ALL" ? ` ${exportLang}` : ""
    const verb = plural ? "seront exportés" : "sera exporté"
    return `${n} ${noun}${statusWord}${langWord} ${verb}.`
  }, [exportPreviewCount, exportStatus, exportLang])

  const zipSummary = useMemo(() => {
    return (["FR", "EN", "DE"] as const)
      .map((lang) => ({ lang, n: exportStats.byLang[lang].active }))
      .filter((item) => item.n > 0)
      .map((item) => `${item.n} ${item.lang}`)
      .join(" · ")
  }, [exportStats])

  const handleToggle = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await toggleNewsletterSubscriberStatus(id)
      if (res.success && res.subscriber) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === id ? (res.subscriber as unknown as SubscriberItem) : s))
        )
        notify("success", "Statut mis à jour.")
      } else {
        notify("error", res.error || "Erreur lors du changement de statut.")
      }
    } catch (e) {
      console.error(e)
      notify("error", "Erreur serveur.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setModalError("Veuillez saisir une adresse email valide.")
      return
    }
    if (!newConsent) {
      setModalError("Le consentement de l'abonné est requis pour l'ajouter.")
      return
    }

    setModalSubmitting(true)
    setModalError("")
    try {
      const res = await adminAddNewsletterSubscriber({
        email: newEmail.trim(),
        firstName: newFirstName.trim() || undefined,
        lang: newLang,
        consent: newConsent,
      })
      if (res.success) {
        setModalOpen(false)
        setNewEmail("")
        setNewFirstName("")
        setNewLang("FR")
        setNewConsent(true)
        notify("success", res.message || "Abonné ajouté.")
        await loadData()
      } else {
        setModalError(res.error || "Erreur lors de l'ajout.")
      }
    } catch (e) {
      console.error(e)
      setModalError("Erreur de communication avec le serveur.")
    } finally {
      setModalSubmitting(false)
    }
  }

  const handleExportCsv = async () => {
    const activeOnly = exportStatus === "ACTIVE"
    if (exportPreviewCount === 0) {
      notify("error", "Aucun abonné à exporter pour cette sélection.")
      return
    }

    setExporting("csv")
    try {
      const res = await exportNewsletterSubscribersCsv({ lang: exportLang, activeOnly })
      if (!res.success) {
        notify("error", res.error)
        return
      }
      downloadBlob(new Blob([res.csv], { type: "text/csv;charset=utf-8;" }), res.filename)
      setExportOpen(false)
      notify("success", `${res.count} abonné${res.count > 1 ? "s" : ""} exporté${res.count > 1 ? "s" : ""}.`)
    } catch (e) {
      console.error(e)
      notify("error", "Erreur lors de la génération de l'export.")
    } finally {
      setExporting(null)
    }
  }

  const handleExportZip = async () => {
    if (!zipSummary) {
      notify("error", "Aucun abonné actif à exporter.")
      return
    }
    const ok = await confirm({
      title: "Exporter les abonnés ?",
      message: zipSummary,
      confirmLabel: "Exporter",
      cancelLabel: "Annuler",
      confirmStyle: { backgroundColor: "#003366" },
    })
    if (!ok) return

    setExporting("zip")
    try {
      const res = await exportNewsletterByLanguageZip({ activeOnly: true })
      if (!res.success) {
        notify("error", res.error)
        return
      }
      const binary = atob(res.base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      downloadBlob(new Blob([bytes], { type: "application/zip" }), res.filename)
      setExportOpen(false)
      notify("success", `${res.files.length} fichier${res.files.length > 1 ? "s" : ""} exporté${res.files.length > 1 ? "s" : ""}.`)
    } catch (e) {
      console.error(e)
      notify("error", "Erreur lors de la génération de l'archive.")
    } finally {
      setExporting(null)
    }
  }

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("ALL")
    setLangFilter("ALL")
  }

  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="space-y-5">
      {/* Toast */}
      {notification && (
        <div
          className={`inline-flex w-fit max-w-full px-3 py-2 rounded-xl text-xs font-medium items-center justify-between gap-3 shadow-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification(null)}
            type="button"
            aria-label="Fermer le message"
            className="text-current opacity-60 hover:opacity-100 shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez les abonnés à la lettre d&apos;information APTIC-R et préparez leur export vers
            votre outil de diffusion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002a52] transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter les abonnés
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#007BFF] text-white rounded-xl text-xs font-bold hover:bg-[#0069db] transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un abonné
          </button>
        </div>
      </div>

      {/* Synthèse compacte */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: "Abonnés", value: counts.total },
          { label: "Actifs", value: counts.active },
          { label: "Désinscrits", value: counts.inactive },
          { label: "FR", value: counts.fr },
          { label: "EN", value: counts.en },
          { label: "DE", value: counts.de },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-center"
          >
            <div className="text-lg font-bold text-[#003366] font-mono leading-tight">
              {stat.value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Rechercher un email ou un prénom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-medium">
            {(
              [
                { key: "ALL", label: "Tous" },
                { key: "ACTIVE", label: "Actifs" },
                { key: "INACTIVE", label: "Désinscrits" },
              ] as { key: StatusFilter; label: string }[]
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === opt.key
                    ? "bg-white text-[#003366] font-bold shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les langues</option>
            <option value="FR">Français (FR)</option>
            <option value="EN">English (EN)</option>
            <option value="DE">Deutsch (DE)</option>
          </select>

          <button
            onClick={resetFilters}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            title="Réinitialiser les filtres"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-[#003366] border-t-transparent rounded-full mb-2" />
            <p>Chargement des abonnés...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold text-gray-600">Aucun abonné trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              Modifiez vos critères de recherche ou ajoutez un abonné manuellement.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Prénom</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Langue</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4">Date d&apos;inscription</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((item) => {
                    const isBusy = actionLoading === item.id
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          {item.firstName ? (
                            item.firstName
                          ) : (
                            <span className="italic font-normal text-gray-400">Non renseigné</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-700 break-all">{item.email}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 font-mono text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.lang}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {item.active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Désinscrit
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                          {formatDate(item.subscribedAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggle(item.id)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                              item.active
                                ? "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                                : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            } disabled:opacity-50`}
                          >
                            {item.active ? "Désactiver" : "Réactiver"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((item) => {
                const isBusy = actionLoading === item.id
                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {item.firstName || <span className="italic font-normal text-gray-400">Non renseigné</span>}
                        </div>
                        <div className="text-gray-500 text-[11px] break-all mt-0.5">{item.email}</div>
                      </div>
                      {item.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Désinscrit
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-3">
                      <div className="text-[11px] font-mono text-gray-400">
                        {item.lang} · Inscrit le {formatDate(item.subscribedAt)}
                      </div>
                      <button
                        disabled={isBusy}
                        onClick={() => handleToggle(item.id)}
                        className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                          item.active
                            ? "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        } disabled:opacity-50`}
                      >
                        {item.active ? "Désactiver" : "Réactiver"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modale : Ajouter un abonné */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#003366]">Ajouter un abonné</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Adresse email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="contact@exemple.org"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  placeholder="Ex : Koffi"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Langue de communication</label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value as "FR" | "EN" | "DE")}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                >
                  <option value="FR">Français (FR)</option>
                  <option value="EN">English (EN)</option>
                  <option value="DE">Deutsch (DE)</option>
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newConsent}
                  onChange={(e) => setNewConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#003366] cursor-pointer"
                />
                <span className="text-[11px] text-gray-600 leading-relaxed">
                  L&apos;abonné a donné son consentement pour recevoir la lettre d&apos;information
                  APTIC-R. <span className="text-red-500">*</span>
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002a52] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {modalSubmitting ? "Enregistrement..." : "Ajouter l'abonné"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale : Exporter les abonnés */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#003366] uppercase tracking-wide">
                Exporter les abonnés
              </h2>
              <button
                onClick={() => setExportOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-gray-700 mb-1">Langue</legend>
              {EXPORT_LANGS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700">
                  <input
                    type="radio"
                    name="export-lang"
                    checked={exportLang === opt.value}
                    onChange={() => setExportLang(opt.value)}
                    className="w-4 h-4 accent-[#003366] cursor-pointer"
                  />
                  {opt.label}
                </label>
              ))}
            </fieldset>

            <fieldset className="space-y-2 mt-4">
              <legend className="text-xs font-bold text-gray-700 mb-1">Statut</legend>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700">
                <input
                  type="radio"
                  name="export-status"
                  checked={exportStatus === "ACTIVE"}
                  onChange={() => setExportStatus("ACTIVE")}
                  className="w-4 h-4 accent-[#003366] cursor-pointer"
                />
                Abonnés actifs
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700">
                <input
                  type="radio"
                  name="export-status"
                  checked={exportStatus === "ALL"}
                  onChange={() => setExportStatus("ALL")}
                  className="w-4 h-4 accent-[#003366] cursor-pointer"
                />
                Tous les abonnés
              </label>
            </fieldset>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-[#003366]">{exportPreviewText}</p>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Les fichiers exportés peuvent être importés dans votre outil de mailing externe. La
                langue est conservée afin de faciliter la segmentation des abonnés.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportZip}
              disabled={exporting !== null}
              className="mt-3 w-full text-left text-[11px] font-semibold text-[#007BFF] hover:text-[#0069db] disabled:opacity-50 cursor-pointer"
              title="Un fichier distinct est généré pour chaque langue disponible."
            >
              {exporting === "zip" ? "Génération des fichiers..." : "Exporter par langue (ZIP)"}
            </button>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Un fichier distinct est généré pour chaque langue disponible.
            </p>

            <div className="pt-4 mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExportOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exporting !== null || exportPreviewCount === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002a52] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {exporting === "csv" ? "Export en cours..." : "Exporter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
