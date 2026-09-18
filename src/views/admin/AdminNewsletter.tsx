"use client"

import React, { useState, useEffect } from "react"
import {
  getNewsletterSubscribers,
  toggleNewsletterSubscriberStatus,
  deleteNewsletterSubscriber,
  adminAddNewsletterSubscriber,
} from "@/lib/cms-actions"

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

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [langFilter, setLangFilter] = useState<string>("ALL")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLang, setNewLang] = useState<"FR" | "EN" | "DE">("FR")
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [modalError, setModalError] = useState("")
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getNewsletterSubscribers({
        search: search.trim() || undefined,
        lang: langFilter !== "ALL" ? langFilter : undefined,
        active: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
      })
      setSubscribers(data as any)
    } catch (e) {
      console.error("Error loading subscribers:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter, langFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleToggle = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await toggleNewsletterSubscriberStatus(id)
      if (res.success && res.subscriber) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === id ? (res.subscriber as any) : s))
        )
        setNotification({
          type: "success",
          text: `Statut modifié avec succès pour ${res.subscriber.email}`,
        })
      } else {
        setNotification({ type: "error", text: res.error || "Erreur lors du changement de statut" })
      }
    } catch (e) {
      console.error(e)
      setNotification({ type: "error", text: "Erreur serveur" })
    } finally {
      setActionLoading(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'abonné ${email} ?`)) {
      return
    }
    setActionLoading(id)
    try {
      const res = await deleteNewsletterSubscriber(id)
      if (res.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id))
        setNotification({ type: "success", text: `Abonné ${email} supprimé.` })
      } else {
        setNotification({ type: "error", text: res.error || "Erreur lors de la suppression" })
      }
    } catch (e) {
      console.error(e)
      setNotification({ type: "error", text: "Erreur serveur" })
    } finally {
      setActionLoading(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setModalError("Veuillez saisir une adresse email valide.")
      return
    }

    setModalSubmitting(true)
    setModalError("")
    try {
      const res = await adminAddNewsletterSubscriber({
        email: newEmail.trim(),
        firstName: newFirstName.trim() || undefined,
        lang: newLang,
      })
      if (res.success) {
        setModalOpen(false)
        setNewEmail("")
        setNewFirstName("")
        setNewLang("FR")
        setNotification({ type: "success", text: res.message || "Abonné ajouté avec succès." })
        await loadData()
      } else {
        setModalError(res.error || "Erreur lors de l'ajout.")
      }
    } catch (e) {
      console.error(e)
      setModalError("Erreur de communication avec le serveur.")
    } finally {
      setModalSubmitting(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const exportToCSV = () => {
    if (subscribers.length === 0) {
      alert("Aucun abonné à exporter.")
      return
    }
    const headers = ["ID", "Email", "Prenom", "Langue", "Statut", "Date_Inscription", "Date_Desinscription"]
    const rows = subscribers.map((s) => [
      s.id,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.firstName || "").replace(/"/g, '""')}"`,
      s.lang,
      s.active ? "ACTIF" : "DESINSCRIT",
      new Date(s.subscribedAt).toISOString(),
      s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : "",
    ])

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `aptic_newsletter_abonnes_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // KPIs
  const totalCount = subscribers.length
  const activeCount = subscribers.filter((s) => s.active).length
  const inactiveCount = totalCount - activeCount
  const frCount = subscribers.filter((s) => s.lang === "FR").length
  const enCount = subscribers.filter((s) => s.lang === "EN").length
  const deCount = subscribers.filter((s) => s.lang === "DE").length

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-md transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs uppercase font-bold opacity-60 hover:opacity-100 ml-4"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Abonnés à la Newsletter
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez la liste de diffusion, suivez l'évolution des inscriptions et exportez pour vos campagnes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
            title="Télécharger la liste sous format CSV compatible Excel / Brevo / Mailchimp"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter CSV
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#174F7A] text-white rounded-xl text-xs font-bold hover:bg-[#133f63] transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un abonné
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {/* KPI Cards (Design sobre & institutionnel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Inscrits
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">{totalCount}</div>
          <div className="text-xs text-slate-500 mt-1">Base complète d&apos;abonnés</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Abonnés Actifs
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">{activeCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% de délivrabilité active
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Désinscrits
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-mono">{inactiveCount}</div>
          <div className="text-xs text-slate-500 mt-1">Ne reçoivent plus les envois</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Par Langue
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
              FR : {frCount}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
              EN : {enCount}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
              DE : {deCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Rechercher email, prénom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-medium">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ALL" ? "bg-white text-gray-900 font-bold shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ACTIVE" ? "bg-white text-emerald-700 font-bold shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "INACTIVE" ? "bg-white text-amber-700 font-bold shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Désinscrits
            </button>
          </div>

          {/* Lang Filter */}
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
            onClick={() => {
              setSearch("")
              setStatusFilter("ALL")
              setLangFilter("ALL")
              loadData()
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            title="Réinitialiser les filtres"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-[#174F7A] border-t-transparent rounded-full mb-2" />
            <p>Chargement des abonnés...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold text-gray-600">Aucun abonné trouvé</p>
            <p className="text-xs text-gray-400 mt-1">Modifiez vos critères de recherche ou ajoutez un abonné manuellement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Email & Prénom</th>
                  <th className="py-3.5 px-4">Langue</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Date Inscription</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((item) => {
                  const isBusy = actionLoading === item.id
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{item.email}</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">
                          {item.firstName ? item.firstName : <span className="italic">Prénom non renseigné</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                            item.lang === "FR"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : item.lang === "EN"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
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
                        {new Date(item.subscribedAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggle(item.id)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                              item.active
                                ? "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                                : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            } disabled:opacity-50`}
                          >
                            {item.active ? "Désinscrire" : "Réactiver"}
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => handleDelete(item.id, item.email)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Supprimer définitivement"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal : Ajouter un abonné */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Ajouter un abonné
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@exemple.org"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Prénom (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Koffi"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Langue de communication
                </label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value as "FR" | "EN" | "DE")}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 focus:border-[#174F7A]"
                >
                  <option value="FR">Français (FR)</option>
                  <option value="EN">English (EN)</option>
                  <option value="DE">Deutsch (DE)</option>
                </select>
              </div>

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
                  className="px-5 py-2 text-xs font-bold text-white bg-[#174F7A] hover:bg-[#133f63] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {modalSubmitting ? "Enregistrement..." : "Ajouter l'abonné"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
