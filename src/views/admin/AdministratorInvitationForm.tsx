"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { acceptAdministratorInvitation, isAdministratorInvitationAvailable } from "@/lib/admin-management-actions"

export default function AdministratorInvitationForm() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [available, setAvailable] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    const value = window.location.hash.slice(1)
    if (!value) return
    setToken(value)
    void isAdministratorInvitationAvailable(value).then((valid) => setAvailable(valid))
    window.history.replaceState(null, "", window.location.pathname)
  }, [])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("")
    if (!available || !token) { setError("Cette invitation est invalide, expirée ou déjà utilisée."); setBusy(false); return }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); setBusy(false); return }
    const result = await acceptAdministratorInvitation({ token, password })
    setBusy(false)
    if (!result.success) setError(result.error)
    else { setAvailable(false); setMessage(result.message); setPassword(""); setConfirm(""); setTimeout(() => router.replace("/backoffice/login"), 1800) }
  }
  return <form onSubmit={submit} className="mt-6 space-y-4">
    <label className="block text-sm font-medium text-slate-700">Nouveau mot de passe<input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"/><span className="mt-1 block text-xs font-normal text-slate-500">8 caractères minimum.</span></label>
    <label className="block text-sm font-medium text-slate-700">Confirmer le mot de passe<input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"/></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
    {!available && !error && <p role="status" className="text-sm text-slate-500">Vérification du lien d’invitation…</p>}
    {!available && error && <p role="alert" className="text-sm text-slate-600">Cette invitation est invalide, expirée ou déjà utilisée. Demandez une nouvelle invitation à un super-administrateur.</p>}
    <button disabled={busy || !available} className="w-full rounded-lg bg-[#003366] px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Activation…" : "Définir le mot de passe et activer"}</button>
  </form>
}
