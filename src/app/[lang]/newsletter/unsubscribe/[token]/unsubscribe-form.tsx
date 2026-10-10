"use client"

import { useState } from "react"

const COPY = {
  FR: {
    title: "Désinscription de la newsletter",
    intro: "Confirmez votre désinscription des courriels d’information d’APTIC-R.",
    button: "Confirmer ma désinscription",
    loading: "Traitement…",
    done: "Votre demande a été traitée. Si ce lien correspond à un abonnement actif, celui-ci a été désinscrit.",
    failed: "La demande n’a pas pu être traitée. Réessayez plus tard.",
  },
  EN: {
    title: "Unsubscribe from the newsletter",
    intro: "Confirm that you want to stop receiving APTIC-R information emails.",
    button: "Confirm unsubscribe",
    loading: "Processing…",
    done: "Your request has been processed. If this link belongs to an active subscription, it has been unsubscribed.",
    failed: "The request could not be processed. Please try again later.",
  },
  DE: {
    title: "Newsletter abbestellen",
    intro: "Bestätigen Sie, dass Sie keine Informations-E-Mails von APTIC-R mehr erhalten möchten.",
    button: "Abmeldung bestätigen",
    loading: "Wird verarbeitet…",
    done: "Ihre Anfrage wurde bearbeitet. Falls dieser Link zu einem aktiven Abonnement gehört, wurde es abgemeldet.",
    failed: "Die Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es später erneut.",
  },
} as const

export default function NewsletterUnsubscribeForm({
  lang,
  token,
}: {
  lang: "FR" | "EN" | "DE"
  token: string | null
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const copy = COPY[lang]

  async function submitUnsubscribe() {
    const unsubscribeToken = token ?? window.location.hash.slice(1)
    if (!/^[A-Za-z0-9_-]{43}$/.test(unsubscribeToken)) {
      setStatus("error")
      return
    }
    setStatus("loading")
    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ token: unsubscribeToken }),
      })
      const result = await response.json().catch(() => null)
      setStatus(response.ok && result?.success ? "done" : "error")
      if (response.ok && result?.success && !token) {
        window.history.replaceState(null, "", window.location.pathname)
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#003366]">{copy.title}</h1>
      <p className="mt-3 text-slate-600">{status === "done" ? copy.done : copy.intro}</p>
      {status === "error" && <p role="alert" className="mt-3 text-sm text-red-700">{copy.failed}</p>}
      {status !== "done" && (
        <button
          type="button"
          onClick={submitUnsubscribe}
          disabled={status === "loading"}
          className="mt-6 rounded-lg bg-[#003366] px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {status === "loading" ? copy.loading : copy.button}
        </button>
      )}
    </div>
  )
}
