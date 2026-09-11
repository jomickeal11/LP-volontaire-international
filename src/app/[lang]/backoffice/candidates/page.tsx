import { redirect } from "next/navigation"

export default async function LegacyBackofficeCandidates() {
  redirect("/backoffice/candidates")
}
