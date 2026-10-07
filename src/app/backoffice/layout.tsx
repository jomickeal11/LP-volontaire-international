import type { Metadata } from "next"
import AdminClientLayout from "./AdminClientLayout"
import { getCurrentAccount } from "@/lib/account"
import "../globals.css"

export const metadata: Metadata = {
  title: "Tableau de bord | APTIC-R",
  description: "Espace de gestion réservé à l'équipe de coordination APTIC-R.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
}

export default async function BackofficeLayoutRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const account = await getCurrentAccount()
  const user = account
    ? { name: account.name, email: account.email, role: account.role }
    : null

  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <AdminClientLayout user={user}>{children}</AdminClientLayout>
      </body>
    </html>
  )
}
