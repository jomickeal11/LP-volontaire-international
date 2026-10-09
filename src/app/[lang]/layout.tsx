import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { JetBrains_Mono, Montserrat } from "next/font/google"
import "../globals.css"
import { getSiteUrl } from "@/lib/seo"

// Polices auto-hébergées : supprime la requête CSS bloquante vers fonts.googleapis.com
// (économie Lighthouse mesurée : 1 000–2 320 ms en mobile, 530–700 ms en desktop).
// Les fichiers variables couvrent toutes les graisses utilisées par le site
// (Montserrat 400–900 via font-normal/middle/semibold/bold/extrabold/black,
//  JetBrains Mono 400–600) avec une seule requête par famille, comme auparavant.
// Sous-ensemble `latin` : couvre intégralement les jeux FR / EN / DE. Ajouter
// `latin-ext` doublerait le volume de polices préchargées sans aucun caractère
// supplémentaire nécessaire sur ce site.
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-aptic-montserrat",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-aptic-jetbrains-mono",
})

const baseUrl = getSiteUrl()

interface LocalizedMeta {
  title: string
  description: string
  ogTitle: string
  ogDesc: string
  keywords: string[]
}

const metaByLang: Record<string, LocalizedMeta> = {
  fr: {
    title: "APTIC-R",
    description:
      "APTIC-R connecte les innovations numériques et low-tech aux besoins concrets des communautés rurales du Togo. Volontariat international, partenariats, projets d'impact.",
    ogTitle: "APTIC-R — Promotion des TIC en milieu Rural au Togo",
    ogDesc: "Solutions numériques et low-tech pour les communautés rurales d'Agbélouvé, Togo. Volontariat, partenariats et projets d'impact.",
    keywords: [
      "APTIC-R",
      "TIC rural Togo",
      "Agbélouvé",
      "Volontariat Togo",
      "Inclusion numérique",
      "Agriculture low-tech",
      "Développement rural",
      "Volontaire international",
    ],
  },
  en: {
    title: "APTIC-R",
    description:
      "APTIC-R connects digital and low-tech innovations to the real needs of rural communities in Togo. International volunteering, partnerships, impact projects.",
    ogTitle: "APTIC-R — ICT Promotion in Rural Togo",
    ogDesc: "Digital and low-tech solutions for rural communities in Agbélouvé, Togo. Volunteering, partnerships and impact projects.",
    keywords: [
      "APTIC-R",
      "Rural ICT Togo",
      "Agbélouvé",
      "Volunteer Togo",
      "Digital inclusion",
      "Low-tech agriculture",
      "Rural development",
      "International volunteers",
    ],
  },
  de: {
    title: "APTIC-R",
    description:
      "APTIC-R verbindet digitale und Low-Tech-Innovationen mit den Bedürfnissen ländlicher Gemeinschaften in Togo. Freiwilligendienst, Partnerschaften, Wirkungsprojekte.",
    ogTitle: "APTIC-R — IKT-Förderung im ländlichen Togo",
    ogDesc: "Digitale und Low-Tech-Lösungen für ländliche Gemeinschaften in Agbélouvé, Togo.",
    keywords: [
      "APTIC-R",
      "IKT ländlich Togo",
      "Agbélouvé",
      "Freiwilligendienst Togo",
      "Digitale Inklusion",
      "Low-Tech Landwirtschaft",
      "Ländliche Entwicklung",
    ],
  },
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const currentLang = (lang?.toLowerCase() in metaByLang) ? lang.toLowerCase() : "fr"
  const meta = metaByLang[currentLang]

  // La variable d'environnement doit contenir UNIQUEMENT le jeton Search Console.
  // Un éventuel préfixe `google-site-verification=` ou `google-site-verification-`
  // est toléré puis retiré, pour ne jamais produire une balise invalide.
  const rawVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()
  const googleVerification = rawVerification
    ? rawVerification.replace(/^google-site-verification[=\-]/i, "").trim()
    : undefined

  return {
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: "APTIC-R", url: baseUrl }],
    creator: "APTIC-R Agbélouvé",
    publisher: "APTIC-R",
    alternates: {
      canonical: `/${currentLang}`,
      languages: {
        fr: "/fr",
        en: "/en",
        de: "/de",
        "x-default": "/fr",
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${currentLang}`,
      siteName: "APTIC-R",
      images: [
        {
          url: "/hero_volunteer_collab.jpg",
          width: 1200,
          height: 630,
          alt: "Volontariat international APTIC-R à Agbélouvé, Togo",
        },
      ],
      locale: currentLang === "fr" ? "fr_FR" : currentLang === "de" ? "de_DE" : "en_US",
      alternateLocale: currentLang === "fr" ? ["en_US", "de_DE"] : currentLang === "de" ? ["fr_FR", "en_US"] : ["fr_FR", "de_DE"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDesc,
      images: ["/hero_volunteer_collab.jpg"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
        { url: "/logo-aptic-icon-32.png",  sizes: "32x32",   type: "image/png" },
        { url: "/logo-aptic-icon-64.png",  sizes: "64x64",   type: "image/png" },
        { url: "/logo-aptic-icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/logo-aptic-icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/logo-aptic-icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

import GoogleAnalyticsLoader from "@/components/GoogleAnalyticsLoader"
import CookieConsentBanner from "@/components/CookieConsentBanner"
import AttributionCapture from "@/components/AttributionCapture"

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const rawGaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID
  const gaId = rawGaId && /^G-[A-Za-z0-9]+$/.test(rawGaId.trim()) ? rawGaId.trim() : null

  return (
    <html
      lang={lang || "fr"}
      className={`scroll-smooth ${montserrat.variable} ${jetbrainsMono.variable}`}
    >
      <head />
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-[#007BFF]/20 selection:text-[#003366]">
        <AttributionCapture />
        <GoogleAnalyticsLoader gaId={gaId} />
        {children}
        <CookieConsentBanner lang={lang || "fr"} />
      </body>
    </html>
  )
}
