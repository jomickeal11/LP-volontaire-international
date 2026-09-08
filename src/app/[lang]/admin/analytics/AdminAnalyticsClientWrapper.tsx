"use client"

import AdminAnalytics from "@/views/admin/AdminAnalytics"
import type { AnalyticsPageData } from "@/lib/dashboard"

export default function AdminAnalyticsClientWrapper({
  data,
}: {
  data: AnalyticsPageData
}) {
  return <AdminAnalytics data={data} />
}
