import AdminClientLayout from "../AdminClientLayout"
import { requireAccount } from "@/lib/account"

/**
 * Layout de protection du back-office.
 *
 * Toutes les pages administratives (hors /backoffice/login) passent par ce
 * groupe : la session signée n'est pas suffisante, le compte doit exister
 * réellement en base. Un JWT valide signé pour un compte supprimé est ainsi
 * redirigé vers la page de connexion avec le marqueur `session=invalid`.
 */
export default async function ProtectedBackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const account = await requireAccount()

  const user = {
    name: account.name,
    email: account.email,
    role: account.role,
  }

  return <AdminClientLayout user={user}>{children}</AdminClientLayout>
}
