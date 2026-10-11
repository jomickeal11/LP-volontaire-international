"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createAdministratorInvitation, deleteAdministrator, getManagedAdministrators, invalidateAdministratorInvitation, resendAdministratorInvitation, updateAdministrator } from "@/lib/admin-management-actions"

type UserRow = { id: string; name: string; email: string; role: string; active: boolean; createdAt: string | Date }
type InvitationRow = { id: string; name: string; email: string; role: string; status: string; expiresAt: string | Date; createdAt: string | Date }
const roleLabels: Record<string, string> = { SUPER_ADMIN: "Super-administrateur", CONTENT_ADMIN: "Administrateur éditorial", REQUEST_MANAGER: "Gestionnaire des demandes", ADMIN: "Administrateur (ancien rôle)", SUPERADMIN: "Super-administrateur (ancien rôle)", CONTENT_MANAGER: "Responsable de contenu (ancien rôle)", COORDINATOR: "Coordinateur (ancien rôle)" }
const dateLabel = (date: string | Date) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date))

export default function AdminAdministrators({ actorId }: { actorId: string }) {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [invitations, setInvitations] = useState<InvitationRow[]>([])
  const [search, setSearch] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("CONTENT_ADMIN")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    const result = await getManagedAdministrators(search)
    if (result.success) {
      setUsers(result.users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() })))
      setInvitations(result.invitations.map((invite) => ({ ...invite, createdAt: invite.createdAt.toISOString(), expiresAt: invite.expiresAt.toISOString() })))
    } else setError(result.error)
    setLoading(false)
  }, [search])

  useEffect(() => { void refresh() }, [refresh])

  const run = async (operation: () => Promise<{ success: boolean; error?: string; message?: string; invitationCreated?: boolean; selfDeleted?: boolean; selfDeactivated?: boolean; selfRevoked?: boolean }>) => {
    setBusy(true); setMessage(""); setError("")
    try {
      const result = await operation()
      if (!result.success) { setError(result.error || "L’opération a échoué."); if (result.invitationCreated) await refresh() }
      else if (result.selfDeleted || result.selfDeactivated || result.selfRevoked) { router.replace("/backoffice/login"); router.refresh() }
      else { setMessage(result.message || "Modification enregistrée."); await refresh() }
    } catch { setError("Une erreur inattendue est survenue.") }
    finally { setBusy(false) }
  }

  const submitInvite = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Saisissez un nom et une adresse e-mail valides."); return }
    void run(async () => {
      const result = await createAdministratorInvitation({ name, email, role })
      if (result.success) { setName(""); setEmail("") }
      return result
    })
  }

  return <section className="mx-auto max-w-6xl space-y-6 pb-10">
    <header><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Administration</p><h1 className="mt-1 text-2xl font-bold text-[#003366]">Gestion des administrateurs</h1><p className="mt-1 text-sm text-slate-600">Invitations, rôles et état des comptes du back-office.</p></header>
    {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    <form onSubmit={submitInvite} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
      <div className="md:col-span-4"><h2 className="font-semibold text-slate-900">Inviter un administrateur</h2><p className="mt-1 text-sm text-slate-500">Le compte ne sera créé qu’après définition du mot de passe via le lien envoyé.</p></div>
      <label className="text-sm font-medium text-slate-700">Nom<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label className="text-sm font-medium text-slate-700">Adresse e-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label className="text-sm font-medium text-slate-700">Rôle<select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="CONTENT_ADMIN">Administrateur éditorial</option><option value="REQUEST_MANAGER">Gestionnaire des demandes</option><option value="SUPER_ADMIN">Super-administrateur</option></select></label>
      <div className="flex items-end"><button disabled={busy} className="w-full rounded-lg bg-[#003366] px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? "En cours…" : "Envoyer l’invitation"}</button></div>
    </form>
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-semibold text-slate-900">Comptes ({users.length})</h2><input aria-label="Rechercher un compte" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un nom ou un e-mail" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-sm" /></div>
      {loading ? <p className="py-5 text-sm text-slate-500">Chargement…</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="py-3">Compte</th><th>Rôle</th><th>État</th><th>Créé le</th><th>Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="py-3"><div className="font-medium text-slate-900">{user.name}</div><div className="text-slate-500">{user.email}</div></td><td><select aria-label={`Rôle de ${user.name}`} value={user.role} disabled={busy} onChange={(e) => void run(() => updateAdministrator({ userId: user.id, role: e.target.value }))} className="rounded-md border border-slate-300 bg-white px-2 py-1"><option value="SUPER_ADMIN">Super-administrateur</option><option value="CONTENT_ADMIN">Administrateur éditorial</option><option value="REQUEST_MANAGER">Gestionnaire des demandes</option>{!(["SUPER_ADMIN", "CONTENT_ADMIN", "REQUEST_MANAGER"].includes(user.role)) && <option value={user.role}>{roleLabels[user.role] || user.role}</option>}</select></td><td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{user.active ? "Actif" : "Désactivé"}</span></td><td>{dateLabel(user.createdAt)}</td><td><div className="flex gap-2"><button disabled={busy} onClick={() => { if (user.id !== actorId || window.confirm("Désactiver votre propre compte et fermer cette session ?")) void run(() => updateAdministrator({ userId: user.id, active: !user.active })) }} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs">{user.active ? "Désactiver" : "Réactiver"}</button><button disabled={busy} onClick={() => { if (window.confirm(`Supprimer définitivement le compte ${user.name} ?${user.id === actorId ? " Vous serez déconnecté." : ""}`)) void run(() => deleteAdministrator(user.id)) }} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-700">Supprimer</button></div></td></tr>)}</tbody></table>{users.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Aucun compte trouvé.</p>}</div>}
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 font-semibold text-slate-900">Invitations en attente</h2>{invitations.length === 0 ? <p className="text-sm text-slate-500">Aucune invitation active.</p> : <div className="divide-y divide-slate-100">{invitations.map((invite) => <div key={invite.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{invite.name} <span className="font-normal text-slate-500">· {invite.email}</span></p><p className="text-xs text-slate-500">{roleLabels[invite.role] || invite.role} · {invite.status === "SENT" ? "Envoyée" : invite.status === "FAILED" ? "Échec d’envoi" : "En cours"} · expire le {dateLabel(invite.expiresAt)}</p></div><div className="flex gap-2"><button disabled={busy} onClick={() => void run(() => resendAdministratorInvitation(invite.id))} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs">Renvoyer</button><button disabled={busy} onClick={() => void run(() => invalidateAdministratorInvitation(invite.id))} className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-700">Invalider</button></div></div>)}</div>}</div>
  </section>
}
