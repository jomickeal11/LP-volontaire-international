import { useState, useEffect, useRef } from "react"
import type { Page } from "../../types"
import { useAdminHeader, type BreadcrumbItem } from "../../lib/AdminHeaderContext"
import { getAdminTranslations } from "../../i18n/adminTranslations"

interface AdminLayoutProps {
  currentPage: Page
  navigate: (p: Page) => void
  onLogout: () => void
  applicationsCount?: number
  /** Demandes de participation jamais consultées, pour l'entrée « Événements ». */
  eventsUnreadCount?: number
  lang?: string
  /** Utilisateur réellement authentifié (jamais de valeur codée en dur). */
  user?: { name: string; email: string; role: string } | null
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
    group: "Recrutement & Engagement",
    items: [
      {
        page: "admin-applications" as Page,
        label: "Candidatures Volontaires",
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
        label: "Répertoire Candidats",
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
    group: "Membres",
    items: [
      {
        page: "admin-member-applications" as Page,
        label: "Demandes d'adhésion",
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        ),
      },
      {
        page: "admin-members" as Page,
        label: "Membres",
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
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
        page: "admin-project-proposals" as Page,
        label: "Propositions de projets",
        icon: (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 5v14m-7-7h14M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
        ),
      },
      {
        page: "admin-project-proposals" as Page,
        label: "Propositions de projets",
        icon: (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 5v14m-7-7h14M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
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
  {
    group: "Contenu",
    items: [
      {
        page: "admin-articles" as Page,
        label: "Articles & Actualités",
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
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        ),
      },
      {
        page: "admin-projects" as Page,
        label: "Projets Terrain",
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
      },
      {
        page: "admin-domains" as Page,
        label: "Domaines d'action",
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        ),
      },
      {
        page: "admin-events" as Page,
        label: "Événements & Formations",
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        page: "admin-resources" as Page,
        label: "Ressources Documentaires",
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Communication",
    items: [
      {
        page: "admin-messages" as Page,
        label: "Messages de contact",
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
              d="M7 8h10M7 12h6m-9 7V6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6.828a2 2 0 00-1.414.586L3 21z"
            />
          </svg>
        ),
      },
      {
        page: "admin-newsletter" as Page,
        label: "Newsletter & Abonnés",
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        page: "admin-newsletter-campaigns" as Page,
        label: "Campagnes newsletter",
        icon: (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5h18v14H3zM3 7l9 6 9-6" />
          </svg>
        ),
      },
      {
        page: "admin-settings" as Page,
        label: "Paramètres",
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
  eventsUnreadCount = 0,
  lang = "fr",
  user,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const t = getAdminTranslations(lang)

  const displayName = user?.name?.trim() || t.account.myAccount
  const roleLabel = user?.role
    ? (t.account.roles as Record<string, string>)[user.role] || user.role
    : ""
  const initials = (() => {
    const source = user?.name?.trim() || ""
    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "•"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  })()

  // Fermeture du menu utilisateur au clic extérieur / touche Échap.
  useEffect(() => {
    if (!userMenuOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [userMenuOpen])

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
    group: "Membres",
    groupKey: "members",
    items: [
      {
        page: "admin-member-applications" as Page,
        label: "Demandes d'adhésion",
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        ),
      },
      {
        page: "admin-members" as Page,
        label: "Membres",
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
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
          page: "admin-project-proposals" as Page,
          label: lang.toLowerCase() === "en"
            ? "Project proposals"
            : lang.toLowerCase() === "de"
              ? "Projektvorschläge"
              : "Propositions de projets",
          icon: (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 5v14m-7-7h14M5 3h14a2 2 0 012 2v14a2 2 0 01-2-2V5a2 2 0 012-2z" />
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
    {
      group: "Contenu",
      groupKey: "cms",
      items: [
        {
          page: "admin-articles" as Page,
          label: "Articles & Actualités",
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          ),
        },
        {
          page: "admin-projects" as Page,
          label: "Projets Terrain",
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ),
        },
        {
          page: "admin-domains" as Page,
          label: "Domaines d'action",
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          ),
        },
        {
          page: "admin-events" as Page,
          label: "Événements & Formations",
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        },
        {
          page: "admin-resources" as Page,
          label: "Ressources",
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        },
        {
          page: "admin-temoignages" as Page,
          label: "Témoignages",
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
                d="M8 10h8m-8 4h5m8-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          page: "admin-medias" as Page,
          label: "Médias & Galerie",
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
                d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 12l3.5-4 2.5 2.5L15 12l5 5H7z"
              />
            </svg>
          ),
        },
        {
          page: "admin-albums" as Page,
          label: "Albums",
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ),
        },
    ],
  },
  {
    group: "Communication",
    groupKey: "communication",
    items: [
      {
        page: "admin-messages" as Page,
        label: "Messages de contact",
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
              d="M7 8h10M7 12h6m-9 7V6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6.828a2 2 0 00-1.414.586L3 21z"
            />
          </svg>
        ),
      },
      {
        page: "admin-newsletter" as Page,
        label: "Newsletter & Abonnés",
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        page: "admin-newsletter-campaigns" as Page,
        label: "Campagnes newsletter",
        icon: (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5h18v14H3zM3 7l9 6 9-6" />
          </svg>
        ),
      },
        {
          page: "admin-settings" as Page,
          label: "Paramètres",
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
      ],
    },
  ]

  const desktopNavRef = useRef<HTMLElement>(null)

  // Restaurer le scroll de la sidebar à chaque changement de page
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_sidebar_scroll")
    if (saved && desktopNavRef.current) {
      desktopNavRef.current.scrollTop = Number(saved)
    }
  }, [currentPage])

  const handleNavScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem("admin_sidebar_scroll", String(e.currentTarget.scrollTop))
  }

  const Sidebar = () => (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "#fff",
        borderRight: "1px solid #E8ECF2",
        width: 240,
      }}
    >
      {/* Logo & Identity — Symbole + APTIC-R + libellé BACK OFFICE */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#F0F3F6]">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
          <img
            src="/logo-aptic-emblem.png"
            alt="APTIC-R"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <span
            className="font-black text-[17px] tracking-tight leading-none"
            style={{ color: "#003366" }}
          >
            APTIC-R
          </span>
          <span
            className="font-semibold uppercase leading-none mt-1.5"
            style={{
              color: "#8898AA",
              fontSize: "10.5px",
              letterSpacing: "0.12em",
            }}
          >
            Back Office
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        ref={desktopNavRef}
        onScroll={handleNavScroll}
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        {NAV_ITEMS_I18N.map((group) => (
          <div key={group.groupKey} className="mb-5">
            <div
              className="text-xs font-bold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: "#9AA8B4" }}
            >
              {group.group}
            </div>
            {group.items
              .filter((item) => item.page !== "admin-project-proposals" || ["SUPERADMIN", "ADMIN", "COORDINATOR", "CONTENT_MANAGER"].includes(user?.role || ""))
              .map((item) => {
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
                    {/* Indicateur « non lu » : un point suivi du nombre, jamais un gros badge. */}
                    {item.page === "admin-events" && eventsUnreadCount > 0 && (
                      <span
                        className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#007BFF]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#007BFF]"
                        title={`${eventsUnreadCount} demande(s) de participation non consultée(s)`}
                        aria-label={`${eventsUnreadCount} demande(s) non consultée(s)`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#007BFF]" />
                        {eventsUnreadCount}
                      </span>
                    )}
                  </div>
                </button>
              )
              })}
          </div>
        ))}
      </nav>

      {/* Bottom area */}
      <div className="px-3 py-4 mt-auto">
        <button
          type="button"
          onClick={() => {
            navigate("admin-account")
            setSidebarOpen(false)
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg transition-colors text-left"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BG
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
          title={t.account.myAccount}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 select-none"
            style={{ backgroundColor: "#174F7A" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: "#1A2B3C" }}>
              {displayName}
            </div>
            <div className="text-xs truncate" style={{ color: "#5E6B76" }}>
              {roleLabel}
            </div>
          </div>
        </button>
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
      case "admin-project-proposals":
        return [{
          label: lang.toLowerCase() === "en"
            ? "Project proposals"
            : lang.toLowerCase() === "de"
              ? "Projektvorschläge"
              : "Propositions de projets",
        }]
      case "admin-partners":
        return [{ label: t.nav.partnersList }]
      case "admin-resources":
        return [{ label: "Ressources" }]
      case "admin-temoignages":
        return [{ label: "Témoignages" }]
      case "admin-medias":
        return [{ label: "Médias & Galerie" }]
      case "admin-albums":
        return [{ label: "Albums" }]
      case "admin-account":
        return [{ label: t.account.myAccount }]
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
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className="flex items-center gap-3 rounded-full py-1 pl-2.5 pr-1 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold text-slate-700">{displayName}</span>
                <span className="text-[11px] font-medium text-slate-500">{roleLabel}</span>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs select-none"
                style={{ backgroundColor: "#174F7A" }}
                title={displayName}
              >
                {initials}
              </div>
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50"
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-800 truncate">{displayName}</div>
                  {user?.email && (
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</div>
                  )}
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false)
                    navigate("admin-account")
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {t.account.myAccount}
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false)
                    onLogout()
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:px-12 lg:py-8" style={{ backgroundColor: "#F5F7F9" }}>{children}</main>
      </div>
    </div>
  )
}
