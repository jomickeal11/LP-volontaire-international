import { redirect } from "next/navigation"

export default async function LegacyBackofficePartnerRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/backoffice/partners/requests/${id}`)
}
