import { requireAdminPagePermission } from "@/lib/access-control"
import AdminSettings from "@/views/admin/AdminSettings"

export default async function AdminSettingsPage() {
  await requireAdminPagePermission("content:read")
  return <AdminSettings />
}
