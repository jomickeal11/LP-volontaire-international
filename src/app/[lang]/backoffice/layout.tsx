import type { Metadata } from "next"
import AdminClientLayout from "./AdminClientLayout"

export const metadata: Metadata = {
  title: "Tableau de bord | APTIC-R",
  description: "Espace de gestion réservé à l'équipe de coordination APTIC-R.",
  icons: {
    icon: [
      { url: "/logo-aptic-icon-32.png",  sizes: "32x32",   type: "image/png" },
      { url: "/logo-aptic-icon-64.png",  sizes: "64x64",   type: "image/png" },
      { url: "/logo-aptic-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-aptic-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo-aptic-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo-aptic-icon-32.png",
  },
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
  return <AdminClientLayout>{children}</AdminClientLayout>
}
