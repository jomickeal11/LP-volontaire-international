import AdminAnalyticsClientWrapper from "./AdminAnalyticsClientWrapper"
import { getAnalyticsPageStats } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params
  const data = await getAnalyticsPageStats(30, resolvedParams.lang)
  return <AdminAnalyticsClientWrapper data={data} />
}
