import { redirect } from "next/navigation"

export default async function BackofficeDomainsRedirect() {
  redirect("/backoffice/domains")
}
