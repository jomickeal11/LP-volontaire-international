import { cookies } from "next/headers"
import AdminAccount from "@/views/admin/AdminAccount"
import { requireAccount } from "@/lib/account"

export const dynamic = "force-dynamic"

export default async function BackofficeAccountPage() {
  const account = await requireAccount()

  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"

  return (
    <AdminAccount
      account={{
        name: account.name,
        email: account.email,
        role: account.role,
        createdAt: account.createdAt.toISOString(),
        pendingEmailChange: account.emailChangeRequest ? {
          email: account.emailChangeRequest.newEmail,
          status: account.emailChangeRequest.status,
          expiresAt: account.emailChangeRequest.expiresAt.toISOString(),
        } : null,
      }}
      lang={lang}
    />
  )
}
