import { redirect } from "next/navigation"

export default async function LegacyBackofficeLogin() {
  redirect("/backoffice/login")
}
