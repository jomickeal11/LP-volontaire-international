import { useState } from "react"
import type { Page } from "../../types"

interface AdminLayoutProps {
  currentPage: Page
  navigate: (p: Page) => void
  onLogout: () => void
  applicationsCount?: number
  children: React.ReactNode
}

const BLUE = "#1B4F7C"
const TEXT_MID = "#4A5A6A"
const BG = "#F4F6F9"

const NAV_ITEMS = [
  {
    group: "Vue d'ensemble",
    items: [
      {
        page: "admin-dashboard" as Page,
        label: "Tableau de bord",
        icon: (
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width={18}
            height={18}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      {
        page: "admin-analytics" as Page,
        label: "Statistiques",
        icon: (
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width={18}
            height={18}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Recrutement",
    items: [
      {
        page: "admin-applications" as Page,
        label: "Candidatures",
        icon: (
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width={18}
            height={18}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        badge: 8,
      },
    ],
  },
]

export default function AdminLayout({
  currentPage,
  navigate,
  onLogout,
  applicationsCount,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const Sidebar = () => (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "#fff",
        borderRight: "1px solid #E8ECF2",
        width: 240,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-6"
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: "#174F7A",
            color: "white",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          A
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide" style={{ color: "#1A2B3C" }}>
            APTIC-R
          </div>
          <div className="text-[11px] font-medium tracking-wider uppercase mt-0.5" style={{ color: "#9AA8B4" }}>
            Portail Admin
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-5">
            <div
              className="text-xs font-bold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: "#9AA8B4" }}
            >
              {group.group}
            </div>
            {group.items.map((item) => {
              const active = currentPage === item.page
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    navigate(item.page)
                    setSidebarOpen(false)
                  }}
                  className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-left"
                  style={{
                    backgroundColor: active ? "#EAF3F8" : "transparent",
                    color: active ? "#174F7A" : TEXT_MID,
                  }}
                  onMouseEnter={(e) =>
                    !active && (e.currentTarget.style.backgroundColor = "#F5F7F9")
                  }
                  onMouseLeave={(e) =>
                    !active &&
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: active ? "#174F7A" : "#9AA8B4" }}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {"badge" in item && (item.badge || item.page === "admin-applications") && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "#EEF5F8",
                        color: "#174F7A",
                        fontSize: 11,
                      }}
                    >
                      {item.page === "admin-applications" && applicationsCount !== undefined
                        ? applicationsCount
                        : item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom area */}
      <div className="px-3 py-4 mt-auto">
        <div
          className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg"
        >
          <img
            src="https://ui-avatars.com/api/?name=Admin+Aptic&background=174F7A&color=fff"
            alt="Admin"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="text-sm font-semibold" style={{ color: "#1A2B3C" }}>
              Admin
            </div>
            <div className="text-xs" style={{ color: "#5E6B76" }}>
              APTIC-R
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("home")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1"
          style={{ color: "#9AA8B4" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BG
            e.currentTarget.style.color = BLUE
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#9AA8B4"
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Visiter le site
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "#9AA8B4" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BG
            e.currentTarget.style.color = "#DC2626"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#9AA8B4"
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8 py-3"
          style={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #EAF0F4",
            minHeight: 60,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded"
            style={{ color: TEXT_MID }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div
              className="text-xs font-medium hidden sm:block"
              style={{ color: "#9AA8B4" }}
            >
              Admin · APTIC-R
            </div>
            <img
              src="https://ui-avatars.com/api/?name=Admin+Aptic&background=174F7A&color=fff"
              alt="Admin"
              className="w-8 h-8 rounded-full shadow-sm"
            />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:px-12 lg:py-8" style={{ backgroundColor: "#F5F7F9" }}>{children}</main>
      </div>
    </div>
  )
}
