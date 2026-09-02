import { useState } from "react"

const BLUE = "#1B4F7C"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"
const BG = "#F4F6F9"

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@apticr.tg")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [forgotSent, setForgotSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }
    setError("")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (password === "wrong") {
        setError("Invalid email or password. Please try again.")
      } else {
        onLogin()
      }
    }, 1200)
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-96 flex-shrink-0 p-12"
        style={{ backgroundColor: BLUE }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base text-white"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              A
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-tight">
                APTIC-R
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Admin Portal
              </div>
            </div>
          </div>
          <h2
            className="text-3xl text-white mb-4 leading-tight"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            Volunteer Management Platform
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Manage applications, track candidates through the selection
            workflow, and analyse recruitment performance.
          </p>
        </div>
        <div
          className="p-4 rounded-xl text-xs"
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          🔒 Restricted access. Authorised personnel only.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm text-white"
              style={{
                backgroundColor: BLUE,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              A
            </div>
            <span className="font-bold text-base" style={{ color: BLUE }}>
              APTIC-R Admin
            </span>
          </div>

          {!showForgot ? (
            <div>
              <h1 className="text-2xl mb-1" style={{ color: TEXT_DARK }}>
                Sign in
              </h1>
              <p className="text-sm mb-8" style={{ color: TEXT_MID }}>
                Administration portal — APTIC-R
              </p>

              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-5"
                  style={{
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: TEXT_DARK }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      border: "1.5px solid #D1DCE5",
                      backgroundColor: "#fff",
                      color: TEXT_DARK,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `1.5px solid ${BLUE}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = "1.5px solid #D1DCE5")
                    }
                    placeholder="admin@apticr.tg"
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: TEXT_DARK }}
                    >
                      Password
                    </label>
                    <button
                      onClick={() => setShowForgot(true)}
                      className="text-xs"
                      style={{ color: BLUE }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      border: "1.5px solid #D1DCE5",
                      backgroundColor: "#fff",
                      color: TEXT_DARK,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `1.5px solid ${BLUE}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = "1.5px solid #D1DCE5")
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-lg text-white transition-all mb-4"
                style={{
                  backgroundColor: loading ? "#9AA8B4" : BLUE,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <p className="text-xs text-center" style={{ color: "#9AA8B4" }}>
                Demo: type any password to log in
              </p>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowForgot(false)}
                className="flex items-center gap-1.5 text-sm mb-6"
                style={{ color: TEXT_MID }}
              >
                ← Back to login
              </button>
              <h1 className="text-2xl mb-1" style={{ color: TEXT_DARK }}>
                Reset password
              </h1>
              <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
                Enter your email address and we'll send you a reset link.
              </p>
              {forgotSent ? (
                <div
                  className="flex items-center gap-3 px-4 py-4 rounded-lg"
                  style={{
                    backgroundColor: "#E6F4EC",
                    border: "1.5px solid #A7D9BC",
                  }}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#2E7D52" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm" style={{ color: "#2E7D52" }}>
                    Reset link sent to <strong>{email}</strong>
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: TEXT_DARK }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                      style={{
                        border: "1.5px solid #D1DCE5",
                        backgroundColor: "#fff",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setForgotSent(true)}
                    className="w-full font-bold text-sm py-3 rounded-lg text-white"
                    style={{ backgroundColor: BLUE }}
                  >
                    Send reset link
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
