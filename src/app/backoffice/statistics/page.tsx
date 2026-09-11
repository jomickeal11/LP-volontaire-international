import AdminAnalyticsClientWrapper from "./AdminAnalyticsClientWrapper"
import { getAnalyticsPageStats } from "@/lib/dashboard"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"
  const data = await getAnalyticsPageStats(30, lang)
  return <AdminAnalyticsClientWrapper data={data} />
}
