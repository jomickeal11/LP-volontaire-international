import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import AdminAccount from "@/views/admin/AdminAccount"
import { getCurrentAccount } from "@/lib/account"

export const dynamic = "force-dynamic"

export default async function BackofficeAccountPage() {
  const account = await getCurrentAccount()
  if (!account) {
    redirect("/backoffice/login")
  }

  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"

  return (
    <AdminAccount
      account={{
        name: account.name,
        email: account.email,
        role: account.role,
        createdAt: account.createdAt.toISOString(),
      }}
      lang={lang}
    />
  )
}