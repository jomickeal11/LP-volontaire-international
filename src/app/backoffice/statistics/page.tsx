import AdminAnalyticsClientWrapper from "./AdminAnalyticsClientWrapper"
import { getAnalyticsPageStats } from "@/lib/dashboard"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const VALID_PERIODS = [7, 30, 90, 365] as const

function parsePeriod(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return VALID_PERIODS.includes(parsed as (typeof VALID_PERIODS)[number]) ? parsed : 30
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[] }>
}) {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"
  const params = await searchParams
  const period = parsePeriod(params.period)
  const data = await getAnalyticsPageStats(period, lang)
  return <AdminAnalyticsClientWrapper data={data} period={period} />
}