import { redirect } from "next/navigation"

export default async function LegacyBackofficeDashboard() {
  redirect("/backoffice/dashboard")
}
