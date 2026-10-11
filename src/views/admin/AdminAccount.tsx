"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, CheckCircle2, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react"
import { getAdminTranslations } from "@/i18n/adminTranslations"
import { changeOwnPassword, requestOwnEmailChange, updateOwnProfile } from "@/lib/account-actions"
import { accountDisplayNameSchema, accountEmailChangeSchema, accountPasswordChangeSchema } from "@/lib/account-validation"

interface AccountData {
  name: string
  email: string
  role: string
  createdAt: string | Date
  pendingEmailChange: { email: string; status: string; expiresAt: string | Date } | null
}

type FeedbackState = { type: "success" | "error"; text: string }

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
const labelClass = "mb-1.5 block text-xs font-bold text-slate-700"

function Feedback({ feedback }: { feedback: FeedbackState }) {
  const isSuccess = feedback.type === "success"
  return (
    <div role="status" className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
      {isSuccess ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <ShieldCheck size={16} className="mt-0.5 shrink-0" />}
      <span>{feedback.text}</span>
    </div>
  )
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
    <div className="rounded-xl bg-blue-50 p-2.5 text-[#003366]">{icon}</div>
    <div><h2 className="text-sm font-bold text-[#003366]">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div>
  </div>
}

function formatDate(value: Date | string, locale: string) {
  return new Date(value).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })
}

export default function AdminAccount({ account, lang = "fr" }: { account: AccountData; lang?: string }) {
  const t = getAdminTranslations(lang)
  const a = t.account
  const router = useRouter()
  const locale = lang.toLowerCase().startsWith("en") ? "en-GB" : lang.toLowerCase().startsWith("de") ? "de-DE" : "fr-FR"

  const [name, setName] = useState(account.name)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [pendingEmail, setPendingEmail] = useState(account.pendingEmailChange)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState<FeedbackState | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [nextPassword, setNextPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState | null>(null)

  const displayNameValidation = useMemo(() => accountDisplayNameSchema.safeParse({ name }), [name])
  const passwordValidation = useMemo(() => accountPasswordChangeSchema.safeParse({
    currentPassword,
    newPassword: nextPassword,
    confirmPassword,
  }), [currentPassword, nextPassword, confirmPassword])
  const roleLabel = (a.roles as Record<string, string>)[account.role] || account.role
  const pendingStatusFailed = pendingEmail?.status === "FAILED"

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileFeedback(null)
    const parsed = accountDisplayNameSchema.safeParse({ name })
    if (!parsed.success) {
      setProfileFeedback({ type: "error", text: parsed.error.issues[0]?.message || a.genericError })
      return
    }
    setProfileSaving(true)
    try {
      const result = await updateOwnProfile(parsed.data.name)
      if (!result.success) {
        setProfileFeedback({ type: "error", text: result.error || a.genericError })
        return
      }
      setName(parsed.data.name)
      setProfileFeedback({ type: "success", text: a.profileUpdated })
      router.refresh()
    } catch {
      setProfileFeedback({ type: "error", text: a.genericError })
    } finally {
      setProfileSaving(false)
    }
  }

  async function submitEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailFeedback(null)
    const requestedEmail = newEmail.trim() || (pendingStatusFailed ? pendingEmail?.email : "") || ""
    const parsed = accountEmailChangeSchema.safeParse({ email: requestedEmail, lang: locale.startsWith("en") ? "EN" : locale.startsWith("de") ? "DE" : "FR" })
    if (!parsed.success) {
      setEmailFeedback({ type: "error", text: parsed.error.issues[0]?.message || a.genericError })
      return
    }
    if (parsed.data.email === account.email.toLowerCase()) {
      setEmailFeedback({ type: "error", text: "Cette adresse est déjà celle de votre compte." })
      return
    }
    if (pendingEmail && parsed.data.email !== pendingEmail.email && !window.confirm("Une nouvelle demande invalidera le lien précédent. Continuer ?")) return

    setEmailSaving(true)
    try {
      const result = await requestOwnEmailChange(parsed.data)
      if ("pendingEmail" in result && result.pendingEmail) {
        setPendingEmail({ email: result.pendingEmail, status: result.status, expiresAt: result.expiresAt })
      }
      if (result.success) {
        setNewEmail("")
        setEmailFeedback({ type: "success", text: result.message || a.emailConfirmationSent })
      } else {
        setEmailFeedback({ type: "error", text: result.error || a.emailConfirmationFailed })
      }
    } catch {
      setEmailFeedback({ type: "error", text: a.emailConfirmationFailed })
    } finally {
      setEmailSaving(false)
    }
  }

  async function submitPasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordFeedback(null)
    const parsed = accountPasswordChangeSchema.safeParse({ currentPassword, newPassword: nextPassword, confirmPassword })
    if (!parsed.success) {
      setPasswordFeedback({ type: "error", text: parsed.error.issues[0]?.message || a.genericError })
      return
    }
    setPasswordSaving(true)
    try {
      const result = await changeOwnPassword(parsed.data)
      if (!result.success) {
        setPasswordFeedback({ type: "error", text: result.error || a.genericError })
        return
      }
      setCurrentPassword("")
      setNextPassword("")
      setConfirmPassword("")
      setPasswordFeedback({ type: "success", text: a.passwordUpdated })
      router.refresh()
    } catch {
      setPasswordFeedback({ type: "error", text: a.genericError })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="mb-1">
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#003366]">{a.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{a.subtitle}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <SectionHeader icon={<UserRound size={18} />} title={a.personalInfo} description="Modifiez le nom utilisé dans les écrans du back-office." />
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <label className={labelClass} htmlFor="account-display-name">{a.displayName} <span className="text-red-600">*</span>
              <input id="account-display-name" type="text" value={name} maxLength={80} autoComplete="name" required disabled={profileSaving} onChange={(event) => setName(event.target.value)} className={`${inputClass} mt-1.5`} aria-invalid={!displayNameValidation.success} />
            </label>
            <div>
              <span className={labelClass}>{a.email}</span>
              <div className={`${inputClass} flex items-center gap-2 bg-slate-50 text-slate-600`}><Mail size={15} className="shrink-0 text-slate-400" /><span className="break-all">{account.email}</span></div>
            </div>
            <button type="submit" disabled={profileSaving || !displayNameValidation.success || name.trim() === account.name} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#002a52] disabled:cursor-not-allowed disabled:opacity-50">
              {profileSaving ? a.saving : a.save}
            </button>
          </div>
          {profileFeedback && <Feedback feedback={profileFeedback} />}
        </form>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-[#003366]">{a.email}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{a.emailChangeDescription}</p>
          </div>
          {emailFeedback && <div className="mb-4"><Feedback feedback={emailFeedback} /></div>}
          {pendingEmail && <div className={`mb-4 rounded-xl border px-3.5 py-3 text-xs ${pendingStatusFailed ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900"}`}>
            <p className="font-bold">{pendingStatusFailed ? a.emailConfirmationFailed : a.emailConfirmationPending}</p>
            <p className="mt-1 break-all">{pendingEmail.email} · {a.emailConfirmationExpiresAt}: {formatDate(pendingEmail.expiresAt, locale)}</p>
          </div>}
          <form onSubmit={submitEmailChange} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className={labelClass} htmlFor="account-new-email">{a.newEmail} <span className="text-red-600">*</span>
              <input id="account-new-email" type="email" value={newEmail} maxLength={254} autoComplete="email" required={!pendingStatusFailed} disabled={emailSaving} onChange={(event) => setNewEmail(event.target.value)} placeholder={pendingStatusFailed ? pendingEmail?.email : "nom@exemple.org"} className={`${inputClass} mt-1.5`} />
            </label>
            <button type="submit" disabled={emailSaving || (!newEmail.trim() && !pendingStatusFailed)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#003366]/20 bg-white px-4 py-2.5 text-xs font-bold text-[#003366] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
              <Mail size={15} />{emailSaving ? a.sendingEmailConfirmation : pendingStatusFailed && !newEmail.trim() ? a.retryEmailConfirmation : a.requestEmailChange}
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeader icon={<KeyRound size={18} />} title={a.security} description={a.passwordPolicy} />
          {passwordFeedback && <div className="mb-4"><Feedback feedback={passwordFeedback} /></div>}
          <form onSubmit={submitPasswordChange} className="space-y-4">
            <label className={labelClass} htmlFor="account-current-password">{a.currentPassword} <span className="text-red-600">*</span>
              <input id="account-current-password" type="password" autoComplete="current-password" required value={currentPassword} disabled={passwordSaving} onChange={(event) => setCurrentPassword(event.target.value)} className={`${inputClass} mt-1.5`} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass} htmlFor="account-new-password">{a.newPassword} <span className="text-red-600">*</span>
                <input id="account-new-password" type="password" autoComplete="new-password" required value={nextPassword} disabled={passwordSaving} onChange={(event) => setNextPassword(event.target.value)} className={`${inputClass} mt-1.5`} aria-invalid={nextPassword.length > 0 && !passwordValidation.success} />
              </label>
              <label className={labelClass} htmlFor="account-confirm-password">{a.confirmPassword} <span className="text-red-600">*</span>
                <input id="account-confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} disabled={passwordSaving} onChange={(event) => setConfirmPassword(event.target.value)} className={`${inputClass} mt-1.5`} aria-invalid={confirmPassword.length > 0 && !passwordValidation.success} />
              </label>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button type="submit" disabled={passwordSaving || !passwordValidation.success} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#002a52] disabled:cursor-not-allowed disabled:opacity-50">
                {passwordSaving ? a.updating : a.updatePassword}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeader icon={<ShieldCheck size={18} />} title={a.loginInfo} description="Informations du compte enregistrées dans APTIC-R." />
          <dl className="divide-y divide-slate-100">
            <div className="flex items-start justify-between gap-3 py-3 first:pt-0">
              <dt className="text-xs text-slate-500">{a.email}</dt><dd className="max-w-[65%] break-all text-right text-xs font-semibold text-slate-800">{account.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-xs text-slate-500">{a.role}</dt><dd className="rounded-full bg-blue-50 px-2.5 py-1 text-right text-[11px] font-bold text-[#003366]">{roleLabel}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 py-3 last:pb-0">
              <dt className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} />{a.createdAt}</dt><dd className="text-right text-xs font-semibold text-slate-800">{formatDate(account.createdAt, locale)}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-500">{a.roleLocked}</p>
        </section>
      </div>
    </div>
  )
}
