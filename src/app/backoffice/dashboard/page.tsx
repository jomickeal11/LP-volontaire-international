import AdminDashboardClientWrapper from "./AdminDashboardClientWrapper"
import { getDashboardStats } from "@/lib/dashboard"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"
  const data = await getDashboardStats(lang)

  return <AdminDashboardClientWrapper data={data} lang={lang} />
}
