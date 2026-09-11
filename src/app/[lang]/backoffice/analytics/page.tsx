import { redirect } from "next/navigation"

export default async function LegacyBackofficeAnalytics() {
  redirect("/backoffice/statistics")
}
