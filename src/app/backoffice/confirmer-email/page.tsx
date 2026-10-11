"use client"

import { useEffect, useState } from "react"
import ApticLogo from "@/components/ApticLogo"
import { confirmOwnEmailChangeAction } from "@/lib/account-actions"

type Lang = "FR" | "EN" | "DE"
const COPY: Record<Lang, {
  title: string
  intro: string
  confirm: string
  confirming: string
  missing: string
  success: string
  invalid: string
}> = {
  FR: {
    title: "Confirmer la nouvelle adresse",
    intro: "Confirmez explicitement le changement demandé pour votre compte administrateur. Le lien expire après 30 minutes.",
    confirm: "Confirmer mon adresse e-mail",
    confirming: "Confirmation…",
    missing: "Ce lien est invalide ou expiré. Demandez un nouveau lien depuis Mon compte.",
    success: "Votre adresse e-mail a été confirmée. Utilisez-la lors de votre prochaine connexion.",
    invalid: "Ce lien est invalide ou expiré. Demandez un nouveau lien depuis Mon compte.",
  },
  EN: {
    title: "Confirm your new address",
    intro: "Explicitly confirm the requested change to your administrator account. This link expires after 30 minutes.",
    confirm: "Confirm my email address",
    confirming: "Confirming…",
    missing: "This link is invalid or expired. Request a new one from My Account.",
    success: "Your email address has been confirmed. Use it the next time you sign in.",
    invalid: "This link is invalid or expired. Request a new one from My Account.",
  },
  DE: {
    title: "Neue Adresse bestätigen",
    intro: "Bestätigen Sie ausdrücklich die beantragte Änderung Ihres Administratorkontos. Dieser Link läuft nach 30 Minuten ab.",
    confirm: "E-Mail-Adresse bestätigen",
    confirming: "Wird bestätigt…",
    missing: "Dieser Link ist ungültig oder abgelaufen. Fordern Sie unter Mein Konto einen neuen an.",
    success: "Ihre E-Mail-Adresse wurde bestätigt. Verwenden Sie sie bei Ihrer nächsten Anmeldung.",
    invalid: "Dieser Link ist ungültig oder abgelaufen. Fordern Sie unter Mein Konto einen neuen an.",
  },
}

export default function ConfirmAccountEmailPage() {
  const [token, setToken] = useState("")
  const [lang, setLang] = useState<Lang>("FR")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const copy = COPY[lang]

  useEffect(() => {
    const rawLang = new URLSearchParams(window.location.search).get("lang")?.toUpperCase()
    if (rawLang === "EN" || rawLang === "DE") setLang(rawLang)
    const fragmentToken = window.location.hash.slice(1)
    setToken(fragmentToken)
    if (!fragmentToken) setMessage(COPY[rawLang === "EN" || rawLang === "DE" ? rawLang : "FR"].missing)
  }, [])

  async function confirmAddress() {
    if (!token || busy) return
    setBusy(true)
    setMessage("")
    try {
      const result = await confirmOwnEmailChangeAction(token)
      if (result.success) {
        setSuccess(true)
        setToken("")
        setMessage(copy.success)
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
      } else {
        setMessage(copy.invalid)
      }
    } catch {
      setMessage(copy.invalid)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex justify-center"><ApticLogo variant="vertical" lang={lang} /></div>
        <h1 className="text-center text-xl font-bold text-[#003366]">{copy.title}</h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">{copy.intro}</p>
        {message && <p role="status" className={`mt-5 rounded-xl border px-4 py-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{message}</p>}
        {!success && <button
          type="button"
          disabled={!token || busy}
          onClick={() => void confirmAddress()}
          className="mt-6 w-full rounded-xl bg-[#003366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#002a52] disabled:cursor-not-allowed disabled:opacity-50"
        >{busy ? copy.confirming : copy.confirm}</button>}
        <p className="mt-5 text-center text-xs text-slate-500">APTIC-R · Back-office</p>
      </section>
    </main>
  )
}
