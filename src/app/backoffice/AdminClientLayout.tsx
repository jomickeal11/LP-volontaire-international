"use client"

import { usePathname, useRouter } from "next/navigation"
import AdminLayout from "@/views/admin/AdminLayout"
import type { Page } from "@/types"
import { logoutAction } from "@/actions/auth"
import { getApplicationsCount } from "@/lib/actions"
import { useEffect, useState } from "react"
import { AdminHeaderProvider } from "@/lib/AdminHeaderContext"

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [appCount, setAppCount] = useState<number>()

  useEffect(() => {
    getApplicationsCount().then(setAppCount).catch(console.error)
  }, [])

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
  if (pathname?.includes("/analytics") || pathname?.includes("/statistics")) currentPage = "admin-analytics"
  else if (pathname?.includes("/partners/requests"))
    currentPage = "admin-partner-requests"
  else if (pathname?.includes("/partners"))
    currentPage = "admin-partners"
  else if (pathname?.includes("/candidates"))
    currentPage = "admin-candidates"
  else if (pathname?.includes("/applications"))
    currentPage = "admin-applications"
  else if (pathname?.includes("/login")) return <>{children}</>

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "admin-dashboard":
        router.push("/backoffice/dashboard")
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
    <AdminHeaderProvider>
      <AdminLayout
        currentPage={currentPage}
        navigate={handleNavigate}
        onLogout={handleLogout}
        applicationsCount={appCount}
        lang={lang}
      >
        {children}
      </AdminLayout>
    </AdminHeaderProvider>
  )
}
