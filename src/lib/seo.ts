import type { Metadata } from "next"
import { getPageUrl, type Language, type Page } from "@/types"

/**
 * Source unique du domaine public.
 *
 * Le domaine RÉEL provient exclusivement de `NEXT_PUBLIC_SITE_URL`. Le repli
 * ci-dessous n'est utilisé que si la variable est absente (la valeur reste celle
 * déjà utilisée par le layout racine et le sitemap, aucune nouvelle invention de
 * domaine). Le domaine officiel définitif sera simplement injecté via la
 * variable d'environnement, sans changement de code.
 */
export const SITE_URL_FALLBACK = "https://apticr.org"

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK).replace(/\/+$/, "")
}

export function normalizeLang(lang?: string): Language {
  const upper = (lang || "").toUpperCase()
  return upper === "EN" || upper === "DE" ? upper : "FR"
}

export function localeCode(lang: Language): string {
  return lang === "EN" ? "en_US" : lang === "DE" ? "de_DE" : "fr_FR"
}

/**
 * Image Open Graph / Twitter de repli du site, utilisée uniquement lorsqu'aucune
 * image propre n'est disponible dans le contenu (ex. modèle Domaine qui n'a pas
 * de champ image). Il s'agit d'une image réellement présente dans /public, pas
 * d'une image fabriquée pour l'occasion.
 */
export const DEFAULT_OG_IMAGE = "/hero_volunteer_collab.jpg"

interface LocalizedText {
  title: string
  description: string
}

/**
 * Métadonnées éditoriales des pages d'institution (hors contenus dynamiques et
 * hors articles/projets/événements/domaines qui ont leurs propres générateurs).
 * Aucune de ces pages ne retombe sur le français pour EN/DE.
 */
const PAGE_SEO: Record<string, Record<Language, LocalizedText>> = {
  about: {
    FR: {
      title: "À propos d’APTIC-R | Promotion des TIC en milieu rural",
      description:
        "Découvrez l’APTIC-R, association togolaise qui met le numérique et les technologies appropriées au service de l’autonomie durable des communautés rurales d’Agbélouvé.",
    },
    EN: {
      title: "About APTIC-R | ICT Promotion in Rural Togo",
      description:
        "Discover APTIC-R, a Togolese non-profit connecting digital and low-tech innovation to the lasting autonomy of rural communities in Agbélouvé.",
    },
    DE: {
      title: "Über APTIC-R | IKT-Förderung im ländlichen Togo",
      description:
        "Lernen Sie APTIC-R kennen: ein togolesischer Verein, der digitale und Low-Tech-Innovationen in den Dienst der Selbstbestimmung ländlicher Gemeinschaften stellt.",
    },
  },
  projects: {
    FR: {
      title: "Nos projets | APTIC-R",
      description:
        "Découvrez les projets de terrain de l’APTIC-R à Agbélouvé et dans les communautés rurales du Togo : inclusion numérique, agroécologie low-tech et co-création.",
    },
    EN: {
      title: "Our projects | APTIC-R",
      description:
        "Explore APTIC-R field projects in Agbélouvé and rural communities across Togo: digital inclusion, low-tech agroecology and community co-creation.",
    },
    DE: {
      title: "Unsere Projekte | APTIC-R",
      description:
        "Entdecken Sie die Projekte von APTIC-R in Agbélouvé und ländlichen Gemeinden in Togo: digitale Inklusion, Low-Tech-Agroökologie und gemeinsames Gestalten.",
    },
  },
  team: {
    FR: {
      title: "Équipe & gouvernance | APTIC-R",
      description:
        "Rencontrez l’équipe de coordination, les membres et les bénévoles de l’APTIC-R engagés auprès des communautés rurales du Togo.",
    },
    EN: {
      title: "Team & governance | APTIC-R",
      description:
        "Meet the APTIC-R coordination team, members and volunteers committed to rural communities in Togo.",
    },
    DE: {
      title: "Team & Governance | APTIC-R",
      description:
        "Lernen Sie das Koordinationsteam, die Mitglieder und die Freiwilligen von APTIC-R für ländliche Gemeinden in Togo kennen.",
    },
  },
  news: {
    FR: {
      title: "Actualités & publications | APTIC-R",
      description:
        "Suivez les actualités, publications et temps forts de l’APTIC-R : projets de terrain, formations, partenariats et vie associative au Togo.",
    },
    EN: {
      title: "News & publications | APTIC-R",
      description:
        "Follow APTIC-R news, publications and highlights: field projects, training, partnerships and community life in Togo.",
    },
    DE: {
      title: "Aktuelles & Publikationen | APTIC-R",
      description:
        "Verfolgen Sie Neuigkeiten, Publikationen und Höhepunkte von APTIC-R: Projekte, Schulungen, Partnerschaften und Vereinsleben in Togo.",
    },
  },
  contact: {
    FR: {
      title: "Contact | APTIC-R",
      description:
        "Contactez l’équipe de l’APTIC-R à Agbélouvé, Togo : formulaire, coordonnées et informations pour volontaires, partenaires et membres.",
    },
    EN: {
      title: "Contact | APTIC-R",
      description:
        "Contact the APTIC-R team in Agbélouvé, Togo: form, contact details and information for volunteers, partners and members.",
    },
    DE: {
      title: "Kontakt | APTIC-R",
      description:
        "Kontaktieren Sie das APTIC-R-Team in Agbélouvé, Togo: Formular, Kontaktdaten und Informationen für Freiwillige, Partner und Mitglieder.",
    },
  },
  resources: {
    FR: {
      title: "Ressources & documents | APTIC-R",
      description:
        "Consultez et téléchargez les rapports, guides, fiches projets et documents publics de l’APTIC-R.",
    },
    EN: {
      title: "Resources & documents | APTIC-R",
      description:
        "Browse and download APTIC-R public reports, guides, project sheets and documents.",
    },
    DE: {
      title: "Ressourcen & Dokumente | APTIC-R",
      description:
        "Berichte, Leitfäden, Projektblätter und öffentliche Dokumente von APTIC-R ansehen und herunterladen.",
    },
  },
  gallery: {
    FR: {
      title: "Galerie | APTIC-R",
      description:
        "Découvrez en images les activités, formations et projets de l’APTIC-R sur le terrain à Agbélouvé, Togo.",
    },
    EN: {
      title: "Gallery | APTIC-R",
      description:
        "Explore photos of APTIC-R field activities, training sessions and projects in Agbélouvé, Togo.",
    },
    DE: {
      title: "Galerie | APTIC-R",
      description:
        "Bilder zu Aktivitäten, Schulungen und Projekten von APTIC-R vor Ort in Agbélouvé, Togo.",
    },
  },
  membership: {
    FR: {
      title: "Devenir membre | APTIC-R",
      description:
        "Rejoignez l’APTIC-R en tant que membre et soutenez l’émancipation numérique et technologique des communautés rurales du Togo.",
    },
    EN: {
      title: "Become a member | APTIC-R",
      description:
        "Join APTIC-R as a member and support the digital and technological empowerment of rural communities in Togo.",
    },
    DE: {
      title: "Mitglied werden | APTIC-R",
      description:
        "Werden Sie Mitglied bei APTIC-R und unterstützen Sie die digitale und technologische Stärkung ländlicher Gemeinschaften in Togo.",
    },
  },
  partner: {
    FR: {
      title: "Partenariats | APTIC-R",
      description:
        "Construisez un partenariat durable avec l’APTIC-R à Agbélouvé, Togo. Accueil et encadrement de volontaires (weltwärts, France Volontaires, CES, universités).",
    },
    EN: {
      title: "Partnerships | APTIC-R",
      description:
        "Build a long-term partnership with APTIC-R in Agbélouvé, Togo. Structured hosting and mentoring for volunteers (weltwärts, France Volontaires, ESC, universities).",
    },
    DE: {
      title: "Partnerschaften | APTIC-R",
      description:
        "Bauen Sie eine nachhaltige Partnerschaft mit APTIC-R in Agbélouvé, Togo auf. Strukturierte Einsätze und Begleitung für Freiwillige (weltwärts, FV, ESK).",
    },
  },
  "partner-apply": {
    FR: {
      title: "Demande de partenariat | APTIC-R",
      description:
        "Formulaire officiel de demande de partenariat avec l’APTIC-R à Agbélouvé, Togo.",
    },
    EN: {
      title: "Partnership request | APTIC-R",
      description:
        "Official partnership request form for APTIC-R in Agbélouvé, Togo.",
    },
    DE: {
      title: "Partnerschaftsanfrage | APTIC-R",
      description:
        "Offizielles Formular für eine Partnerschaftsanfrage bei APTIC-R in Agbélouvé, Togo.",
    },
  },
  support: {
    FR: {
      title: "Soutenez nos actions | APTIC-R",
      description:
        "Mettre les compétences, le numérique et les technologies appropriées au service de l’autonomie durable des communautés rurales au Togo.",
    },
    EN: {
      title: "Support our actions | APTIC-R",
      description:
        "Empowering rural communities in Togo through digital technology, shared skills and appropriate low-tech solutions.",
    },
    DE: {
      title: "Unterstützen Sie unsere Arbeit | APTIC-R",
      description:
        "Digitale Kompetenzen, Technologien und Innovation für eine nachhaltige Selbstbestimmung ländlicher Gemeinschaften in Togo.",
    },
  },
}

/**
 * Construit les métadonnées complètes d'une page d'institution :
 * - canonical exact et unique (URL réellement servie) ;
 * - hreflang fr/en/de + x-default pointant vers les routes réellement servies ;
 * - Open Graph / Twitter de base.
 */
export function buildPageMetadata(page: Page, lang?: string): Metadata {
  const current = normalizeLang(lang)
  const canonicalPath = getPageUrl(page, current)
  const seo = PAGE_SEO[page]?.[current]
  const title = seo?.title ?? "APTIC-R"
  const description = seo?.description

  const languages: Record<string, string> = {
    fr: getPageUrl(page, "FR"),
    en: getPageUrl(page, "EN"),
    de: getPageUrl(page, "DE"),
    "x-default": getPageUrl(page, "FR"),
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}${canonicalPath}`,
      siteName: "APTIC-R",
      locale: localeCode(current),
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}
