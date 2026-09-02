import { useState } from "react"
import type { Page } from "../../types"

interface AdminLayoutProps {
  currentPage: Page
  navigate: (p: Page) => void
  onLogout: () => void
  children: React.ReactNode
}

const BLUE = "#1B4F7C"
const TEXT_MID = "#4A5A6A"
const BG = "#F4F6F9"

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      {
        page: "admin-dashboard" as Page,
        label: "Dashboard",
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
        label: "Analytics",
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
    group: "Recruitment",
    items: [
      {
        page: "admin-applications" as Page,
        label: "Applications",
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
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: "1px solid #E8ECF2" }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm text-white"
          style={{
            backgroundColor: BLUE,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          A
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: BLUE }}>
            APTIC-R
          </div>
          <div className="text-xs" style={{ color: "#9AA8B4" }}>
            Admin Portal
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
                  className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left"
                  style={{
                    backgroundColor: active ? "#E8F2FA" : "transparent",
                    color: active ? BLUE : TEXT_MID,
                  }}
                  onMouseEnter={(e) =>
                    !active && (e.currentTarget.style.backgroundColor = BG)
                  }
                  onMouseLeave={(e) =>
                    !active &&
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: active ? BLUE : "#9AA8B4" }}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {"badge" in item && item.badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: BLUE,
                        color: "white",
                        fontSize: 10,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom area */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid #E8ECF2" }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg"
          style={{ backgroundColor: BG }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: BLUE }}
          >
            AD
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: "#1A2B3C" }}>
              Admin
            </div>
            <div className="text-xs" style={{ color: "#9AA8B4" }}>
              APTIC-R
            </div>
          </div>
        </div>
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
          Sign out
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
          className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8 py-4"
          style={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #E8ECF2",
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
              APTIC-R Admin · Demo mode
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: BLUE }}
            >
              AD
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
