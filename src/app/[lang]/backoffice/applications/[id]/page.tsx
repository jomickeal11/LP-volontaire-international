import { redirect } from "next/navigation"

export default async function LegacyBackofficeApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/backoffice/applications/${id}`)
}
