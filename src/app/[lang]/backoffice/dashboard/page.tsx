import AdminDashboardClientWrapper from "./AdminDashboardClientWrapper"
import { getDashboardStats } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params
  const lang = resolvedParams.lang || "fr"
  const data = await getDashboardStats(lang)

  return <AdminDashboardClientWrapper data={data} lang={lang} />
}
