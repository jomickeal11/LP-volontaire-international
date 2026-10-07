"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAdminTranslations } from "@/i18n/adminTranslations"
import { updateOwnProfile, changeOwnPassword } from "@/lib/account-actions"

interface AccountData {
  name: string
  email: string
  role: string
  createdAt: string | Date
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#1A2B3C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"

const labelClass = "block text-xs font-bold uppercase tracking-wide text-[#4A5A6A] mb-1.5"

function Feedback({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div
      className={`px-4 py-2.5 rounded-lg text-sm border ${
        type === "success"
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
      role="status"
    >
      {text}
    </div>
  )
}

export default function AdminAccount({ account, lang = "fr" }: { account: AccountData; lang?: string }) {
  const t = getAdminTranslations(lang)
  const a = t.account
  const router = useRouter()

  const [name, setName] = useState(account.name)
  const [email, setEmail] = useState(account.email)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const roleLabel =
    (a.roles as Record<string, string>)[account.role] || account.role

  const createdDate = new Date(account.createdAt).toLocaleDateString(
    lang === "en" ? "en-GB" : lang === "de" ? "de-DE" : "fr-FR",
    { day: "2-digit", month: "long", year: "numeric" }
  )

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileFeedback(null)
    setProfileSaving(true)
    try {
      const res = await updateOwnProfile(name, email)
      if (res.success) {
        setProfileFeedback({ type: "success", text: a.profileUpdated })
        router.refresh()
      } else {
        setProfileFeedback({ type: "error", text: res.error || a.genericError })
      }
    } catch {
      setProfileFeedback({ type: "error", text: a.genericError })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)
    setPasswordSaving(true)
    try {
      const res = await changeOwnPassword(currentPassword, newPassword, confirmPassword)
      if (res.success) {
        setPasswordFeedback({ type: "success", text: a.passwordUpdated })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordFeedback({ type: "error", text: res.error || a.genericError })
      }
    } catch {
      setPasswordFeedback({ type: "error", text: a.genericError })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#003366] tracking-tight">{a.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{a.subtitle}</p>
      </div>

      {/* ── Informations personnelles ─────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wide mb-5">
          {a.personalInfo}
        </h2>

        {profileFeedback && (
          <div className="mb-4">
            <Feedback type={profileFeedback.type} text={profileFeedback.text} />
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="account-name" className={labelClass}>
              {a.displayName}
            </label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="account-email" className={labelClass}>
              {a.email}
            </label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className={labelClass}>{a.role}</label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl">
              <span className="text-sm font-semibold text-[#1A2B3C]">{roleLabel}</span>
              <span className="text-[11px] text-gray-400">·</span>
              <span className="text-[11px] text-gray-500">{a.roleLocked}</span>
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002a52] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {profileSaving ? a.saving : a.save}
            </button>
          </div>
        </form>
      </section>

      {/* ── Sécurité ──────────────────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wide mb-1">
          {a.security}
        </h2>
        <p className="text-xs text-gray-500 mb-5">{a.changePassword}</p>

        {passwordFeedback && (
          <div className="mb-4">
            <Feedback type={passwordFeedback.type} text={passwordFeedback.text} />
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelClass}>{a.currentPassword}</label>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{a.newPassword}</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{a.confirmPassword}</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002a52] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {passwordSaving ? a.updating : a.updatePassword}
            </button>
          </div>
        </form>
      </section>

      {/* ── Informations de connexion ─────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wide mb-4">
          {a.loginInfo}
        </h2>
        <dl className="text-sm">
          <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">{a.createdAt}</dt>
            <dd className="font-medium text-[#1A2B3C]">{createdDate}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}