"use client"
import { useState } from "react"
import { loginAction } from "@/actions/auth"
import ApticLogo from "@/components/ApticLogo"

// ─── Inline SVG Icons (private to this component) ──────────────────────────────

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function Spinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
      role="status"
      aria-label="Chargement"
    />
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [forgotSent, setForgotSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez saisir votre adresse e-mail et votre mot de passe.")
      return
    }
    setError("")
    setLoading(true)

    try {
      const result = await loginAction(email, password)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else if (result.success) {
        onLogin()
      }
    } catch {
      setError("Une erreur serveur est survenue. Veuillez réessayer.")
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* ── Header: Logo vertical officiel APTIC-R ── */}
        <div className="flex flex-col items-center mb-8">
          <ApticLogo variant="vertical" lang="FR" />
          <span
            className="font-semibold uppercase leading-none mt-5"
            style={{ color: "#8898AA", fontSize: "10.5px", letterSpacing: "0.13em" }}
          >
            Espace d&apos;administration
          </span>
        </div>

        {!showForgot ? (
          <>
            {/* ── Error Banner ── */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm mb-5 bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                <AlertIcon className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Form ── */}
            <div className="flex flex-col gap-5 mb-6">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="login-email"
                  className="text-sm font-semibold text-[#1A2B3C]"
                >
                  Adresse e-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="admin@apticr.tg"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-[#1A2B3C]"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="login-input pr-11"
                    placeholder="Entrez votre mot de passe"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A9A] hover:text-[#003366] transition-colors cursor-pointer"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end mb-5">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs text-[#003366] hover:text-[#002244] transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="login-btn"
            >
              {loading ? (
                <>
                  <Spinner />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </>
        ) : (
          /* ── Forgot Password View ── */
          <div>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="flex items-center gap-1.5 text-sm text-[#4A5A6A] hover:text-[#1A2B3C] transition-colors mb-6 cursor-pointer"
            >
              ← Retour à la connexion
            </button>
            <h2 className="text-xl font-bold text-[#1A2B3C] mb-1">
              Réinitialiser le mot de passe
            </h2>
            <p className="text-sm text-[#4A5A6A] mb-6">
              Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.
            </p>
            {forgotSent ? (
              <div className="flex items-center gap-3 px-4 py-4 rounded-lg bg-[#E6F4EC] border-[1.5px] border-[#A7D9BC]">
                <CheckCircle className="flex-shrink-0 text-[#2E7D52]" />
                <span className="text-sm text-[#2E7D52]">
                  Lien envoyé à <strong>{email}</strong>
                </span>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 mb-4">
                  <label
                    htmlFor="forgot-email"
                    className="text-sm font-semibold text-[#1A2B3C]"
                  >
                    Adresse e-mail
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="admin@apticr.tg"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="login-btn"
                >
                  Envoyer le lien
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="login-footer">
        <div>APTIC-R · Togo</div>
        <div className="mt-0.5">Accès réservé à l&apos;équipe d&apos;administration.</div>
      </div>
    </div>
  )
}
