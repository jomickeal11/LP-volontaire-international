import AdminDashboardClientWrapper from "./AdminDashboardClientWrapper"
import { getDashboardStats } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const data = await getDashboardStats()

  return <AdminDashboardClientWrapper data={data} />
}
