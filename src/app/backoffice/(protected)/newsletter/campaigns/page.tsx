import { requireAdminPagePermission } from "@/lib/access-control"
import AdminNewsletterCampaigns from "@/views/admin/AdminNewsletterCampaigns"

export default async function BackofficeNewsletterCampaignsPage() {
  await requireAdminPagePermission("newsletter:prepare")
  return <AdminNewsletterCampaigns />
}
