import AdminLayout from "@/views/admin/AdminLayout"
import AdminSettingsClientWrapper from "./AdminSettingsClientWrapper"

interface PageProps {
  params: Promise<{ lang: string }>
}

export const metadata = {
  title: "Paramètres & Médias du site | Administration APTIC-R",
}

export default async function AdminSettingsPage({ params }: PageProps) {
  const { lang } = await params
  return (
    <AdminLayout currentPage="admin-settings" navigate={() => {}} onLogout={() => {}} lang={lang}>
      <AdminSettingsClientWrapper lang={lang} />
    </AdminLayout>
  )
}
