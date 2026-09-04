import type { Metadata, Viewport } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "APTIC-R — International Volunteers | Agbélouvé, Togo",
  description:
    "Join APTIC-R in Togo for 6–12 month international volunteer missions in digital innovation, low-tech agriculture, and rural community development.",
  keywords: [
    "Volontariat Togo",
    "Bénévolat Afrique",
    "International Volunteers Togo",
    "APTIC-R Agbélouvé",
    "Digital Agriculture",
    "Low-tech rural innovation",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "APTIC-R — International Volunteers",
    description: "Build technology for rural communities in Togo.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <html lang={lang} className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  )
}
