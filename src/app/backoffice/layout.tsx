import type { Metadata } from "next"
import AdminClientLayout from "./AdminClientLayout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Back-office — APTIC-R",
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

export default function BackofficeLayoutRoute({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <AdminClientLayout>{children}</AdminClientLayout>
      </body>
    </html>
  )
}
