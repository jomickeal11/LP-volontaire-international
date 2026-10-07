"use client"

import { usePathname, useRouter } from "next/navigation"
import AdminLayout from "@/views/admin/AdminLayout"
import type { Page } from "@/types"
import { logoutAction } from "@/actions/auth"
import { getApplicationsCount } from "@/lib/actions"
import { getEventsUnreadParticipationCounts } from "@/lib/event-participation-actions"
import { useEffect, useState } from "react"
import { AdminHeaderProvider } from "@/lib/AdminHeaderContext"
import { ConfirmProvider } from "@/components/admin/ConfirmProvider"

export default function AdminClientLayout({
  user,
  children,
}: {
  user?: { name: string; email: string; role: string } | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [appCount, setAppCount] = useState<number>()
  /**
   * Demandes de participation jamais consultées.
   *
   * Indicateur interne discret : aucun e-mail, aucune notification navigateur,
   * aucun popup. Le compteur est relu quand l'administrateur ouvre ou ferme la
   * liste des demandes d'un événement.
   */
  const [eventsUnreadCount, setEventsUnreadCount] = useState(0)

  const refreshUnread = () => {
    getEventsUnreadParticipationCounts()
      .then((res) => {
        if (res.success) setEventsUnreadCount(res.total)
      })
      .catch(console.error)
  }

  useEffect(() => {
    getApplicationsCount().then(setAppCount).catch(console.error)
    refreshUnread()
  }, [])

  // Le compteur est relu au retour de focus et dès qu'un écran signale qu'une
  // liste de demandes vient d'être consultée (les demandes sont alors marquées
  // lues en base) : le point de la barre latérale retombe sans rechargement.
  useEffect(() => {
    const onFocus = () => refreshUnread()
    const onParticipationUpdated = () => refreshUnread()
    window.addEventListener("focus", onFocus)
    window.addEventListener("aptic:participation-updated", onParticipationUpdated)
    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("aptic:participation-updated", onParticipationUpdated)
    }
  }, [pathname])

  // Language is no longer part of the URL — read from cookie or default to "fr"
  const [lang, setLang] = useState("fr")
  useEffect(() => {
    const cookieLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1]
    if (cookieLang && ["fr", "en", "de"].includes(cookieLang)) {
      setLang(cookieLang)
    }
  }, [])

  let currentPage: Page = "admin-dashboard"
  if (pathname?.includes("/compte")) currentPage = "admin-account"
  else if (pathname?.includes("/analytics") || pathname?.includes("/statistics")) currentPage = "admin-analytics"
  else if (pathname?.includes("/members/applications"))
    currentPage = "admin-member-applications"
  else if (pathname?.includes("/members"))
    currentPage = "admin-members"
  else if (pathname?.includes("/articles"))
    currentPage = "admin-articles"
  else if (pathname?.includes("/projects"))
    currentPage = "admin-projects"
  else if (pathname?.includes("/domains"))
    currentPage = "admin-domains"
  else if (pathname?.includes("/events"))
    currentPage = "admin-events"
  else if (pathname?.includes("/resources"))
    currentPage = "admin-resources"
  else if (pathname?.includes("/newsletter"))
    currentPage = "admin-newsletter"
  else if (pathname?.includes("/messages"))
    currentPage = "admin-messages"
  else if (pathname?.includes("/partners/requests"))
    currentPage = "admin-partner-requests"
  else if (pathname?.includes("/partners"))
    currentPage = "admin-partners"
  else if (pathname?.includes("/candidates"))
    currentPage = "admin-candidates"
  else if (pathname?.includes("/applications"))
    currentPage = "admin-applications"
  else if (pathname?.includes("/temoignages"))
    currentPage = "admin-temoignages"
  else if (pathname?.includes("/medias"))
    currentPage = "admin-medias"
  else if (pathname?.includes("/settings"))
    currentPage = "admin-settings"
  else if (pathname?.includes("/login")) return <>{children}</>

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "admin-dashboard":
        router.push("/backoffice/dashboard")
        break
      case "admin-member-applications":
        router.push("/backoffice/members/applications")
        break
      case "admin-members":
        router.push("/backoffice/members")
        break
      case "admin-articles":
        router.push("/backoffice/articles")
        break
      case "admin-projects":
        router.push("/backoffice/projects")
        break
      case "admin-domains":
        router.push("/backoffice/domains")
        break
      case "admin-events":
        router.push("/backoffice/events")
        break
      case "admin-resources":
        router.push("/backoffice/resources")
        break
      case "admin-newsletter":
        router.push("/backoffice/newsletter")
        break
      case "admin-messages":
        router.push("/backoffice/messages")
        break
      case "admin-temoignages":
        router.push("/backoffice/temoignages")
        break
      case "admin-medias":
        router.push("/backoffice/medias")
        break
      case "admin-applications":
        router.push("/backoffice/applications")
        break
      case "admin-candidates":
        router.push("/backoffice/candidates")
        break
      case "admin-analytics":
        router.push("/backoffice/statistics")
        break
      case "admin-partner-requests":
        router.push("/backoffice/partners/requests")
        break
      case "admin-partners":
        router.push("/backoffice/partners")
        break
      case "admin-settings":
        router.push("/backoffice/settings")
        break
      case "admin-account":
        router.push("/backoffice/compte")
        break
      case "admin-login":
        router.push("/backoffice/login")
        break
      default:
        break
    }
  }

  const handleLogout = async () => {
    await logoutAction()
    window.location.replace("/backoffice/login")
  }

  return (
    <ConfirmProvider>
      <AdminHeaderProvider>
        <AdminLayout
          currentPage={currentPage}
          navigate={handleNavigate}
          onLogout={handleLogout}
          applicationsCount={appCount}
          eventsUnreadCount={eventsUnreadCount}
          lang={lang}
          user={user}
        >
          {children}
        </AdminLayout>
      </AdminHeaderProvider>
    </ConfirmProvider>
  )
}
