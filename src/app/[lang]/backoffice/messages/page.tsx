import { redirect } from "next/navigation"

export default async function LegacyBackofficeMessages() {
  redirect("/backoffice/messages")
}
