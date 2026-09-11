import { redirect } from "next/navigation"

// Legacy redirect — the middleware handles this, but this is a fallback
export default async function LegacyBackofficeIndex() {
  redirect("/backoffice/dashboard")
}
