import { requireAdminPagePermission } from "@/lib/access-control"
import AdminAdministrators from "@/views/admin/AdminAdministrators"

export const dynamic = "force-dynamic"

export default async function AdministratorsPage() {
  const session = await requireAdminPagePermission("admin-users:manage")
  return <AdminAdministrators actorId={session.userId} />
}
