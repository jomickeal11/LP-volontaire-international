"use client"

import { useEffect, useState } from "react"
import ApticLogo from "@/components/ApticLogo"
import { resetPasswordAction } from "@/actions/password-reset"
import { passwordResetSchema } from "@/lib/account-validation"

const inputClass = "w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 disabled:bg-slate-50"

export default function ResetAdminPasswordPage() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fragment = window.location.hash.slice(1)
    setToken(fragment)
    if (!fragment) setError("Ce lien de réinitialisation est invalide ou expiré. Demandez un nouveau lien.")
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || busy) return
    setError("")
    const parsed = passwordResetSchema.safeParse({ token, newPassword: password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Vérifiez les informations saisies.")
      return
    }

    setBusy(true)
    try {
      const result = await resetPasswordAction(parsed.data)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSuccess(true)
      setPassword("")
      setConfirmPassword("")
      setToken("")
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
    } catch {
      setError("La réinitialisation n’a pas pu être traitée. Réessayez.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex justify-center"><ApticLogo variant="vertical" lang="FR" /></div>
        <h1 className="text-center text-xl font-bold text-[#003366]">Réinitialiser le mot de passe</h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">Choisissez un nouveau mot de passe pour votre compte administrateur. Le lien ne peut être utilisé qu’une seule fois.</p>

        {success ? (
          <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Mot de passe modifié. <a className="font-semibold underline" href="/backoffice/login">Connectez-vous avec votre nouveau mot de passe.</a>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="reset-password">Nouveau mot de passe
              <input id="reset-password" type="password" autoComplete="new-password" minLength={8} required disabled={!token || busy} value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} mt-1.5`} />
            </label>
            <p className="-mt-2 text-xs text-slate-500">Au moins 8 caractères. Maximum 72 octets.</p>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="reset-password-confirm">Confirmer le nouveau mot de passe
              <input id="reset-password-confirm" type="password" autoComplete="new-password" required disabled={!token || busy} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={`${inputClass} mt-1.5`} />
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={!token || busy} className="w-full rounded-xl bg-[#003366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#002a52] disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-500">APTIC-R · Back-office</p>
      </section>
    </main>
  )
}
