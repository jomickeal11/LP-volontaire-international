import AdminAnalyticsClientWrapper from "./AdminAnalyticsClientWrapper"
import { getAnalyticsPageStats } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsPageStats(30)
  return <AdminAnalyticsClientWrapper data={data} />
}
