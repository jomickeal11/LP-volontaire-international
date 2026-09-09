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

  const lang = pathname.split("/")[1] || "fr"

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
        router.push(`/${lang}/backoffice/dashboard`)
        break
      case "admin-applications":
        router.push(`/${lang}/backoffice/applications`)
        break
      case "admin-candidates":
        router.push(`/${lang}/backoffice/candidates`)
        break
      case "admin-analytics":
        router.push(`/${lang}/backoffice/statistics`)
        break
      case "admin-partner-requests":
        router.push(`/${lang}/backoffice/partners/requests`)
        break
      case "admin-partners":
        router.push(`/${lang}/backoffice/partners`)
        break
      case "admin-login":
        router.push(`/${lang}/backoffice/login`)
        break
      default:
        break
    }
  }

  const handleLogout = async () => {
    await logoutAction()
    // Use window.location.replace to clear Next.js client cache and replace history state
    window.location.replace(`/${lang}/backoffice/login`)
  }

  return (
    <AdminHeaderProvider>
      <AdminLayout
        currentPage={currentPage}
        navigate={handleNavigate}
        onLogout={handleLogout}
        applicationsCount={appCount}
      >
        {children}
      </AdminLayout>
    </AdminHeaderProvider>
  )
}
