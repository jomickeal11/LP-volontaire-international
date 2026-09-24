"use client"

import React, { useState, useEffect } from "react"
import {
  getContactMessagesAction,
  updateContactMessageStatusAction,
  deleteContactMessageAction,
  getContactMessagesStatsAction,
  type ContactMessageRecord,
} from "@/lib/contact-actions"

interface AdminMessagesProps {
  lang?: string
}

export default function AdminMessages({ lang = "fr" }: AdminMessagesProps) {
  const [messages, setMessages] = useState<ContactMessageRecord[]>([])
  const [stats, setStats] = useState({ total: 0, unread: 0, replied: 0, archived: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRecord | null>(null)
  const [internalNote, setInternalNote] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [msgRes, statsRes] = await Promise.all([
        getContactMessagesAction({
          status: statusFilter,
          search: searchQuery,
        }),
        getContactMessagesStatsAction(),
      ])

      if (msgRes.success) {
        setMessages(msgRes.messages)
      }
      if (statsRes.success) {
        setStats(statsRes)
      }
    } catch (err) {
      console.error("Erreur chargement messages :", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter, searchQuery])

  useEffect(() => {
    if (selectedMessage) {
      setInternalNote(selectedMessage.notes || "")
    }
  }, [selectedMessage])

  const showToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 2000)
  }

  const handleStatusChange = async (
    id: string,
    newStatus: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED",
    noteToSave?: string
  ) => {
    setActionLoading(true)
    try {
      const res = await updateContactMessageStatusAction(id, newStatus, noteToSave)
      if (res.success) {
        showToast(
          newStatus === "READ"
            ? "Message marqué comme lu"
            : newStatus === "REPLIED"
            ? "Message marqué comme répondu"
            : newStatus === "ARCHIVED"
            ? "Message archivé"
            : "Statut mis à jour"
        )
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: newStatus,
                  notes: noteToSave !== undefined ? noteToSave : m.notes,
                  repliedAt: newStatus === "REPLIED" ? new Date() : m.repliedAt,
                }
              : m
          )
        )
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  notes: noteToSave !== undefined ? noteToSave : prev.notes,
                  repliedAt: newStatus === "REPLIED" ? new Date() : prev.repliedAt,
                }
              : null
          )
        }
        // Rafraîchir les stats
        getContactMessagesStatsAction().then((s) => s.success && setStats(s))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce message ?")) return
    setActionLoading(true)
    try {
      const res = await deleteContactMessageAction(id)
      if (res.success) {
        showToast("Message supprimé")
        setMessages((prev) => prev.filter((m) => m.id !== id))
        if (selectedMessage?.id === id) setSelectedMessage(null)
        getContactMessagesStatsAction().then((s) => s.success && setStats(s))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "UNREAD":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Non lu
          </span>
        )
      case "READ":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Lu
          </span>
        )
      case "REPLIED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Répondu
          </span>
        )
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Archivé
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast de confirmation */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#003366] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideIn">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366] tracking-tight">
            Messages de Contact
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez, traitez et suivez l&apos;ensemble des messages reçus depuis le formulaire de contact du site.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin text-[#007BFF]" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Actualiser</span>
        </button>
      </div>


      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: "ALL", label: `Tous (${stats.total})` },
            { id: "UNREAD", label: `Non lus (${stats.unread})` },
            { id: "READ", label: `Lus (${stats.total - stats.unread - stats.replied - stats.archived})` },
            { id: "REPLIED", label: `Répondus (${stats.replied})` },
            { id: "ARCHIVED", label: `Archivés (${stats.archived})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#003366] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <input
            type="text"
            placeholder="Rechercher nom, email, sujet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none text-slate-800"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Messages List & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List (7 cols or full width) */}
        <div className={`${selectedMessage ? "lg:col-span-6" : "lg:col-span-12"} space-y-3`}>
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              Chargement des messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <svg
                className="w-12 h-12 text-slate-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-base font-bold text-slate-700">Aucun message trouvé</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aucun message ne correspond aux critères de filtre sélectionnés.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id
              const isUnread = msg.status === "UNREAD"

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg)
                    if (isUnread) {
                      handleStatusChange(msg.id, "READ")
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-50/40 border-[#003366] shadow-sm ring-1 ring-[#003366]"
                      : isUnread
                      ? "bg-white border-amber-200/90 hover:border-amber-300 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#003366]">{msg.name}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span>{msg.email}</span>
                    {msg.organization && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[160px]">{msg.organization}</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Objet : {msg.subject}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(msg.status)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {msg.lang || "FR"}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#007BFF] hover:underline">
                      Voir le détail →
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Selected Message Detail Panel (6 cols) */}
        {selectedMessage && (
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(selectedMessage.status)}
                  <span className="text-xs text-slate-400">
                    Reçu le {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#003366]">{selectedMessage.name}</h2>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Fermer le volet"
              >
                ✕
              </button>
            </div>

            {/* Sender Meta */}
            <div className="py-4 space-y-2 text-xs border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Adresse email :</span>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject
                  )}`}
                  className="font-bold text-[#007BFF] hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>

              {selectedMessage.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Téléphone / WhatsApp :</span>
                  <a
                    href={`tel:${selectedMessage.phone.replace(/\s+/g, "")}`}
                    className="font-semibold text-slate-700 hover:text-[#007BFF]"
                  >
                    {selectedMessage.phone}
                  </a>
                </div>
              )}

              {selectedMessage.organization && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Organisation :</span>
                  <span className="font-semibold text-slate-700">
                    {selectedMessage.organization}
                  </span>
                </div>
              )}

              {selectedMessage.routedTo && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Acheminé vers :</span>
                  <span className="font-mono">{selectedMessage.routedTo}</span>
                </div>
              )}
            </div>

            {/* Subject & Full Message */}
            <div className="py-4 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#003366] block">
                Objet de la demande : {selectedMessage.subject}
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="py-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                Notes internes & Suivi :
              </label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Ajouter une note de suivi interne..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#003366] outline-none"
              />
              <button
                disabled={actionLoading}
                onClick={() =>
                  handleStatusChange(selectedMessage.id, selectedMessage.status, internalNote)
                }
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              >
                Enregistrer la note
              </button>
            </div>

            {/* Action Bar */}
            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject
                  )}`}
                  onClick={() => handleStatusChange(selectedMessage.id, "REPLIED")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  <span>Répondre par email</span>
                </a>

                {selectedMessage.status !== "ARCHIVED" ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedMessage.id, "ARCHIVED")}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    Archiver
                  </button>
                ) : (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedMessage.id, "READ")}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    Désarchiver
                  </button>
                )}
              </div>

              <button
                disabled={actionLoading}
                onClick={() => handleDelete(selectedMessage.id)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-2 cursor-pointer transition-colors"
                title="Supprimer ce message"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
