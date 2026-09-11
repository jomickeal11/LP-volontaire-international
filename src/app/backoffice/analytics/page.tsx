import { redirect } from "next/navigation"

export default async function AdminAnalyticsRedirect() {
  redirect("/backoffice/statistics")
}
