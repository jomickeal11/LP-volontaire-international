"use client"

import AdminAnalytics from "@/views/admin/AdminAnalytics"
import type { AnalyticsPageData } from "@/lib/dashboard"

export default function AdminAnalyticsClientWrapper({
  data,
  period,
}: {
  data: AnalyticsPageData
  period: number
}) {
  return <AdminAnalytics data={data} period={period} />
}