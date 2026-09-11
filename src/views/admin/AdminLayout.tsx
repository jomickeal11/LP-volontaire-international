import { useState } from "react"
import type { Page } from "../../types"
import { useAdminHeader, type BreadcrumbItem } from "../../lib/AdminHeaderContext"
import { getAdminTranslations } from "../../i18n/adminTranslations"

interface AdminLayoutProps {
  currentPage: Page
  navigate: (p: Page) => void
  onLogout: () => void
  applicationsCount?: number
  lang?: string
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
      },
      {
        page: "admin-candidates" as Page,
        label: "Candidats",
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Partenariats",
    items: [
      {
        page: "admin-partner-requests" as Page,
        label: "Demandes",
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
              d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
            />
          </svg>
        ),
      },
      {
        page: "admin-partners" as Page,
        label: "Partenaires",
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
    ],
  },
]

export default function AdminLayout({
  currentPage,
  navigate,
  onLogout,
  applicationsCount,
  lang = "fr",
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = getAdminTranslations(lang)

  const NAV_ITEMS_I18N = [
    {
      group: t.nav.overview,
      groupKey: "overview",
      items: [
        {
          page: "admin-dashboard" as Page,
          label: t.nav.dashboard,
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
          label: t.nav.analytics,
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
      group: t.nav.recruitment,
      groupKey: "recruitment",
      items: [
        {
          page: "admin-applications" as Page,
          label: t.nav.applications,
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
        },
        {
          page: "admin-candidates" as Page,
          label: t.nav.candidatesDirectory,
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      group: t.nav.partnerships,
      groupKey: "partnerships",
      items: [
        {
          page: "admin-partner-requests" as Page,
          label: t.nav.partnerRequests,
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
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              />
            </svg>
          ),
        },
        {
          page: "admin-partners" as Page,
          label: t.nav.partnersList,
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        },
      ],
    },
  ]

  const Sidebar = () => (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "#fff",
        borderRight: "1px solid #E8ECF2",
        width: 240,
      }}
    >
      {/* Logo & Identity */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#F0F3F6]">
        <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
          <img
            src="/logo-aptic.png"
            alt="APTIC-R"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm tracking-tight text-[#1A2B3C] truncate">
            APTIC-R
          </div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#8898AA]">
            {t.nav.backofficeTitle}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS_I18N.map((group) => (
          <div key={group.groupKey} className="mb-5">
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
          {t.common.visitSite}
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
          {t.nav.logout}
        </button>
      </div>
    </div>
  )

  const { breadcrumb } = useAdminHeader()

  // Default page title/breadcrumb when no custom breadcrumb is set by child page
  const getDefaultBreadcrumb = (): BreadcrumbItem[] => {
    switch (currentPage) {
      case "admin-dashboard":
        return [{ label: t.nav.dashboard }]
      case "admin-applications":
        return [{ label: t.nav.applications }]
      case "admin-candidates":
        return [{ label: t.nav.candidatesDirectory }]
      case "admin-analytics":
        return [{ label: t.nav.analytics }]
      case "admin-partner-requests":
        return [{ label: t.nav.partnerRequests }]
      case "admin-partners":
        return [{ label: t.nav.partnersList }]
      default:
        return [{ label: t.nav.overview }]
    }
  }

  const activeBreadcrumb: BreadcrumbItem[] = breadcrumb.length > 0 ? breadcrumb : getDefaultBreadcrumb()

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
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-3 bg-white border-b border-[#EAF0F4]"
          style={{ minHeight: 60 }}
        >
          {/* Left: Mobile toggle + Breadcrumb / Context */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Ouvrir le menu"
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

            {/* Breadcrumb / Context */}
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 truncate text-sm">
              {activeBreadcrumb.map((item, idx) => {
                const isLast = idx === activeBreadcrumb.length - 1
                return (
                  <div key={idx} className="flex items-center gap-2 truncate">
                    {idx > 0 && (
                      <span className="text-slate-300 select-none font-normal">/</span>
                    )}
                    {item.href ? (
                      <a
                        href={item.href}
                        className={`truncate transition-colors ${
                          isLast
                            ? "font-semibold text-slate-800 hover:text-[#174F7A]"
                            : "font-medium text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span
                        className={`truncate ${
                          isLast
                            ? "font-semibold text-slate-800"
                            : "font-medium text-slate-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Right: User account */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 py-1 px-2.5 rounded-full bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-700">Admin</span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs font-medium text-slate-500">APTIC-R</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs select-none"
                style={{ backgroundColor: "#174F7A" }}
                title="Administrateur APTIC-R"
              >
                AA
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:px-12 lg:py-8" style={{ backgroundColor: "#F5F7F9" }}>{children}</main>
      </div>
    </div>
  )
}
