import { requireAdminPagePermission } from "@/lib/access-control"
import AdminAlbums from "@/views/admin/AdminAlbums"

export const metadata = {
  title: "Albums — Backoffice APTIC-R",
}

export default async function AlbumsPage() {
  await requireAdminPagePermission("content:read")
  return <AdminAlbums />
}
