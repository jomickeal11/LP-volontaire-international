import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connexion Back-office — APTIC-R",
  description: "Portail d'authentification réservé à l'équipe de gestion APTIC-R.",
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

export default function BackofficeLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
