"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { DomainCharterIcon } from "@/components/DomainIcons"

interface DomainsViewProps {
  lang: Language
  initialSettings?: Record<string, string>
}

const I18N = {
  FR: {
    badge: "6 Domaines d'Intervention",
    title: "Nos Domaines d'Action",
    subtitle:
      "Six domaines d'action pour renforcer les capacités, l'autonomie et l'innovation dans les territoires ruraux.",
    filterAll: "Tous les domaines",
    objectivesTitle: "OBJECTIFS CLÉS",
    actionsTitle: "ACTIONS & PROJETS",
    audienceTitle: "PUBLICS CONCERNÉS",
    collabBtn: "Proposer un partenariat",
    ctaPreTitle: "COOPÉRATION & DÉPLOIEMENT",
    ctaTitle: "Vous souhaitez développer un projet avec l’APTIC-R ?",
    ctaDesc: "Nous concevons des collaborations adaptées aux besoins des territoires.",
    ctaContact: "Nous contacter",
    ctaPartner: "Devenir partenaire",
    domains: [
      {
        id: "inclusion-numerique",
        code: "INCLUSION_NUMERIQUE",
        officialTitle: "Inclusion numérique",
        subtitle: "Alphabétisation & Équipement solaire",
        fullDesc:
          "L'alphabétisation numérique est aujourd'hui une compétence vitale au même titre que la lecture et l'écriture. Dans les villages reculés, l'absence de matériel et d'accompagnement creuse un fossé géographique profond. APTIC-R déploie des ateliers mobiles et équipe les écoles rurales pour que chacun acquière une véritable autonomie numérique.",
        objectives: [
          "Former chaque année plus de 1 000 élèves aux fondamentaux de l'informatique",
          "Équiper les écoles de village de parcs d'ordinateurs reconditionnés à énergie solaire",
          "Accompagner les adultes et commerçants vers l'autonomie sur les services en ligne",
        ],
        actions: [
          "Caravane numérique itinérante dans les écoles rurales",
          "Ateliers hebdomadaires d'initiation et de bureautique au FabLab",
          "Mise à disposition de ressources éducatives hors-ligne (Kiwix)",
        ],
        audience: "Élèves, enseignants ruraux, artisans et commerçants locaux",
      },
      {
        id: "jeunesse-education",
        code: "JEUNESSE",
        officialTitle: "Jeunesse & inclusion",
        subtitle: "Formation aux métiers du web & Compétences d'avenir",
        fullDesc:
          "Pour offrir des perspectives d'avenir concrètes et freiner l'exode rural, APTIC-R dispense des formations qualifiantes accélérées aux métiers du numérique. Du développement web au graphisme, nous préparons les jeunes à générer des revenus sur place grâce au travail à distance et à l'entrepreneuriat local.",
        objectives: [
          "Dispenser des cursus intensifs en développement web et conception graphique",
          "Accompagner l'insertion professionnelle et la création de micro-entreprises locales",
          "Garantir une parité stricte femmes-hommes dans tous nos parcours techniques",
        ],
        actions: [
          "Bootcamps intensifs « Jeunes Codeurs » sur 3 mois",
          "Programme « Elles Codent » dédié aux jeunes femmes",
          "Incubation et mentorat de micro-services digitaux de proximité",
        ],
        audience: "Jeunes de 16 à 30 ans, diplômés ou en reconversion, porteurs de projets",
      },
      {
        id: "cybersecurite-hygiene",
        code: "CYBERSECURITE",
        officialTitle: "Cybersécurité",
        subtitle: "Citoyenneté numérique & Hygiène mobile",
        fullDesc:
          "L'adoption massive du smartphone et du paiement mobile expose les primo-utilisateurs à des fraudes financières et à la désinformation. APTIC-R mène des campagnes de sensibilisation de terrain pour transmettre les réflexes de sécurité essentiels et promouvoir une citoyenneté numérique éclairée.",
        objectives: [
          "Sensibiliser les populations aux fraudes et escroqueries sur le mobile money",
          "Former les jeunes à la protection de leur identité et de leurs données personnelles",
          "Développer l'esprit critique face aux fausses informations et au harcèlement",
        ],
        actions: [
          "Séances de sensibilisation « Cyber-Vigilance » sur les marchés et places publiques",
          "Guides pratiques illustrés en langues locales (Éwé et Français)",
          "Ateliers scolaires sur l'éthique et la sécurité en ligne",
        ],
        audience: "Grand public, usagers du mobile money, collégiens et associations locales",
      },
      {
        id: "agri-lowtech",
        code: "AGRI_LOWTECH",
        officialTitle: "Agriculture durable",
        subtitle: "Écologie & Low-Tech",
        fullDesc:
          "Face aux dérèglements climatiques, APTIC-R développe des solutions « Low-Tech » sobres, économiques, écologiques et entièrement réparables localement pour accompagner les agriculteurs vers une transition agro-écologique résiliente.",
        objectives: [
          "Co-concevoir des systèmes d'irrigation goutte-à-goutte automatisés à énergie solaire",
          "Déployer des capteurs simples de mesure d'humidité des sols et de pluviométrie",
          "Former les maraîchers aux pratiques agro-écologiques et à la gestion de l'eau",
        ],
        actions: [
          "Parcelle expérimentale Low-Tech connectée au FabLab d'Agbélouvé",
          "Fabrication artisanale de séchoirs solaires optimisés pour fruits et légumes",
          "Accompagnement numérique des groupements maraîchers et coopératives féminines",
        ],
        audience: "Agriculteurs, maraîchers, coopératives agricoles et groupements ruraux",
      },
      {
        id: "data-innovation",
        code: "DATA_INNOVATION",
        officialTitle: "Données & intelligence",
        subtitle: "Cartographie participative & Innovation citoyenne",
        fullDesc:
          "Les zones rurales souffrent souvent d'un manque crucial de données cartographiques et statistiques fiables. En mobilisant les données ouvertes et les outils collaboratifs, APTIC-R permet aux collectivités et communautés de cartographier leurs ressources pour mieux décider.",
        objectives: [
          "Cartographier collaborativement les pistes, infrastructures et points d'eau essentiels",
          "Accompagner les collectivités locales dans la prise de décision par la donnée ouverte",
          "Former les étudiants et techniciens aux logiciels SIG et à la géomatique libre",
        ],
        actions: [
          "Mapathons communautaires avec OpenStreetMap et les jeunes du territoire",
          "Relevés GPS de terrain pour le recensement des infrastructures hydrauliques et scolaires",
          "Diffusion de cartes physiques et numériques libres auprès des mairies",
        ],
        audience: "Collectivités territoriales, mairies, étudiants en géographie et citoyens",
      },
      {
        id: "dev-rural-fablabs",
        code: "DEV_RURAL",
        officialTitle: "Développement rural",
        subtitle: "FabLabs communautaires & Artisanat connecté",
        fullDesc:
          "Le FabLab d'Agbélouvé est un tiers-lieu d'apprentissage, d'artisanat numérique et de co-création. Il réunit outils modernes (impression 3D, découpeuse laser) et artisanat traditionnel pour concevoir et réparer localement les équipements du quotidien.",
        objectives: [
          "Maintenir un tiers-lieu d'innovation ouvert, accessible et gratuit pour les villageois",
          "Prototyper et réparer des pièces de rechange pour les machines agricoles et outillages",
          "Initier les artisans locaux à la modélisation 3D et aux techniques de fabrication assistée",
        ],
        actions: [
          "Animation quotidienne du FabLab Rural avec connexion haut débit partagée",
          "Ateliers de réparation solidaire d'équipements électroménagers et outillages",
          "Résidence et accueil de volontaires nationaux et internationaux",
        ],
        audience: "Artisans, réparateurs, porteurs de projets, inventeurs locaux et communauté",
      },
    ],
  },
  EN: {
    badge: "6 Action Domains",
    title: "Our Action Domains",
    subtitle:
      "Six domains of action to build local capacity, autonomy, and sustainable innovation in rural communities.",
    filterAll: "All domains",
    objectivesTitle: "KEY OBJECTIVES",
    actionsTitle: "ACTIONS & PROJECTS",
    audienceTitle: "TARGET AUDIENCES",
    collabBtn: "Propose a partnership",
    ctaPreTitle: "COOPERATION & DEPLOYMENT",
    ctaTitle: "Interested in developing a project with APTIC-R?",
    ctaDesc: "We design tailored collaborations adapted to the concrete needs of rural territories.",
    ctaContact: "Contact us",
    ctaPartner: "Become a partner",
    domains: [
      {
        id: "inclusion-numerique",
        code: "INCLUSION_NUMERIQUE",
        officialTitle: "Innovation numérique",
        subtitle: "Digital Literacy & Solar Labs",
        fullDesc:
          "Digital literacy is now an essential skill. In remote villages, the lack of equipment widens geographical inequalities. APTIC-R runs mobile caravans and solar-powered labs to ensure genuine digital autonomy for everyone.",
        objectives: [
          "Train over 1,000 students annually in computing fundamentals",
          "Equip rural schools with energy-efficient refurbished computer labs",
          "Help rural adults navigate digital administrative portals",
        ],
        actions: [
          "Mobile digital caravan across rural schools",
          "Weekly community computer workshops at Agbélouvé FabLab",
          "Distribution of offline educational toolkits (Kiwix)",
        ],
        audience: "Students, rural teachers, craftspeople, and market women",
      },
      {
        id: "jeunesse-education",
        code: "JEUNESSE",
        officialTitle: "Jeunesse & inclusion",
        subtitle: "Web Careers & Future Skills",
        fullDesc:
          "To curb forced rural migration, APTIC-R delivers vocational training in web design, coding, and remote work, empowering youth to build sustainable livelihoods locally.",
        objectives: [
          "Deliver intensive bootcamps in web coding and digital publishing",
          "Support local entrepreneurship and digital micro-enterprises",
          "Achieve strict gender parity in all technical classes",
        ],
        actions: [
          "3-month intensive 'Young Coders' bootcamp",
          "'Girls Code' initiative for young women",
          "Incubation and mentoring of local digital service shops",
        ],
        audience: "Youth aged 16–30, jobseekers, prospective entrepreneurs",
      },
      {
        id: "cybersecurite-hygiene",
        code: "CYBERSECURITE",
        officialTitle: "Cybersécurité",
        subtitle: "Digital Citizenship & Mobile Safety",
        fullDesc:
          "With the rise of smartphones, first-time users face cyber-fraud and disinformation. We run grassroots awareness campaigns to teach digital hygiene, fraud prevention, and responsible mobile habits.",
        objectives: [
          "Educate communities against mobile money fraud and scams",
          "Teach young students privacy protection and safe browsing habits",
          "Foster critical thinking against online fake news",
        ],
        actions: [
          "Cyber-safety awareness sessions in rural markets and public squares",
          "Illustrated bilingual guides in local languages and French",
          "School workshops on digital ethics and safety",
        ],
        audience: "General public, mobile money users, students, community groups",
      },
      {
        id: "agri-lowtech",
        code: "AGRI_LOWTECH",
        officialTitle: "Agriculture durable",
        subtitle: "Ecology & Low-Tech Solutions",
        fullDesc:
          "Facing climate instability, APTIC-R promotes simple, repairable, low-tech systems built with locally sourced parts to optimize crops and strengthen agricultural resilience.",
        objectives: [
          "Co-design solar-powered automated drip irrigation systems",
          "Deploy accessible soil moisture and rainfall sensors",
          "Train farmers in ecological practices and water conservation",
        ],
        actions: [
          "Connected agro-ecological test parcel at the Agbélouvé FabLab",
          "Workshops building optimized solar food dehydrators",
          "Digital harvest management support for women farming cooperatives",
        ],
        audience: "Smallholders, market gardeners, rural women cooperatives",
      },
      {
        id: "data-innovation",
        code: "DATA_INNOVATION",
        officialTitle: "Données & intelligence",
        subtitle: "Participatory Mapping & Civic Data",
        fullDesc:
          "Rural areas often suffer from a lack of reliable data. By mobilizing OpenStreetMap and community surveying, APTIC-R helps local leaders map community resources to plan sustainable development.",
        objectives: [
          "Collaboratively map rural roads, clinics, and clean water wells",
          "Assist local municipal councils with open geographic data",
          "Train students in free GIS software (QGIS)",
        ],
        actions: [
          "OpenStreetMap community mapathons with regional youth",
          "Field GPS surveys of water pumps and remote schools",
          "Free physical and digital maps distributed to local authorities",
        ],
        audience: "Municipal councils, geography students, volunteer mappers",
      },
      {
        id: "dev-rural-fablabs",
        code: "DEV_RURAL",
        officialTitle: "Développement rural",
        subtitle: "Community FabLabs & Connected Craft",
        fullDesc:
          "The Agbélouvé FabLab combines modern tools (3D printing, laser cutting) and traditional craftsmanship to prototype and repair essential local equipment.",
        objectives: [
          "Maintain a free, welcoming open tech space for all villagers",
          "Prototype custom replacement parts for farm tools and equipment",
          "Introduce local craftspeople to 3D design and computer-aided fabrication",
        ],
        actions: [
          "Daily operation of the Rural FabLab with shared high-speed broadband",
          "Community repair cafe for domestic electronics and tools",
          "Hosting and mentoring international and local volunteers",
        ],
        audience: "Craftspeople, local repair technicians, makers, and volunteers",
      },
    ],
  },
  DE: {
    badge: "6 Handlungsfelder",
    title: "Unsere Handlungsfelder",
    subtitle:
      "Sechs strategische Aktionsbereiche zur Stärkung der Autonomie und nachhaltigen Innovation im ländlichen Raum.",
    filterAll: "Alle Bereiche",
    objectivesTitle: "HAUPTZIELE",
    actionsTitle: "AKTIONEN & PROJEKTE",
    audienceTitle: "ZIELGRUPPEN",
    collabBtn: "Partnerschaft vorschlagen",
    ctaPreTitle: "KOOPERATION & PROJEKTE",
    ctaTitle: "Möchten Sie ein Projekt mit APTIC-R entwickeln?",
    ctaDesc: "Wir entwickeln passgenaue Kooperationen, die auf die Bedürfnisse der Regionen abgestimmt sind.",
    ctaContact: "Kontaktieren",
    ctaPartner: "Partner werden",
    domains: [
      {
        id: "inclusion-numerique",
        code: "INCLUSION_NUMERIQUE",
        officialTitle: "Inclusion numérique",
        subtitle: "Digitale Grundbildung & Solarausstattung",
        fullDesc:
          "Digitale Grundbildung ist eine Schlüsselkompetenz. APTIC-R baut mobile Lernwerkstätten auf, um Kindern und Erwachsenen digitale Selbstständigkeit zu ermöglichen.",
        objectives: [
          "Jährlich über 1.000 Schüler in IT-Grundlagen schulen",
          "Dorfschulen mit solarbetriebenen Computern ausstatten",
          "Erwachsene bei digitalen Verwaltungsdiensten unterstützen",
        ],
        actions: [
          "Mobile Schulkarawane im ländlichen Raum",
          "Wöchentliche Workshops im FabLab Agbélouvé",
          "Bereitstellung von Offline-Bildungsmaterialien (Kiwix)",
        ],
        audience: "Schüler, Lehrer, Handwerker und Händlerinnen",
      },
      {
        id: "jeunesse-education",
        code: "JEUNESSE",
        officialTitle: "Jeunesse & inclusion",
        subtitle: "Web-Berufe & Zukunftskompetenzen",
        fullDesc:
          "Praxisnahe Ausbildung in modernen IT-Berufen direkt vor Ort, um lokale Arbeitsplätze zu schaffen und der Landflucht entgegenzuwirken.",
        objectives: [
          "Intensive Bootcamps in Webentwicklung und Design",
          "Förderung lokaler digitaler Kleinstunternehmen",
          "Strikte Geschlechterparität in allen Lehrgängen",
        ],
        actions: [
          "3-monatiges Intensiv-Bootcamp 'Jeunes Codeurs'",
          "Frauenförderprogramm 'Elles Codent'",
          "Inkubation und Mentoring für digitale Dienste",
        ],
        audience: "Jugendliche zwischen 16 und 30 Jahren",
      },
      {
        id: "cybersecurite-hygiene",
        code: "CYBERSECURITE",
        officialTitle: "Cybersécurité",
        subtitle: "Digitale Mündigkeit & Mobilsicherheit",
        fullDesc:
          "Aufklärungskampagnen zum Schutz vor Mobile-Money-Betrug, Phishing und für eine sichere Nutzung sozialer Netzwerke.",
        objectives: [
          "Aufklärung über Betrug bei mobilen Zahlungen",
          "Schulung von Jugendlichen zum Datenschutz",
          "Stärkung der Medienkompetenz gegen Falschmeldungen",
        ],
        actions: [
          "Aufklärungssitzungen auf Marktplätzen",
          "Zweisprachige Leitfäden in Éwé und Französisch",
          "Schulworkshops zu digitaler Sicherheit",
        ],
        audience: "Allgemeinheit, Mobile-Money-Nutzer, Schüler",
      },
      {
        id: "agri-lowtech",
        code: "AGRI_LOWTECH",
        officialTitle: "Agriculture durable",
        subtitle: "Agrarökologie & Low-Tech",
        fullDesc:
          "Einfache, reparierbare und sparsame Technologien zur Unterstützung kleinbäuerlicher Betriebe bei der Anpassung an den Klimawandel.",
        objectives: [
          "Solarbetriebene automatisierte Tröpfchenbewässerung",
          "Einsatz einfacher Bodenfeuchtesensoren",
          "Schulung in agrarökologischen Anbaumethoden",
        ],
        actions: [
          "Low-Tech-Testfeld am FabLab Agbélouvé",
          "Bau solarer Fruchttrockner für Obst und Gemüse",
          "Digitale Unterstützung für Frauenkooperativen",
        ],
        audience: "Bauern, Kleinbauern, Kooperativen",
      },
      {
        id: "data-innovation",
        code: "DATA_INNOVATION",
        officialTitle: "Données & intelligence",
        subtitle: "Partizipative Kartierung & Open Data",
        fullDesc:
          "Gemeinsam mit OpenStreetMap kartieren wir Dörfer und Wasserstellen, damit lokale Behörden ihre Entwicklung gezielt planen können.",
        objectives: [
          "Kollaborative Kartierung von Infrastrukturen und Brunnen",
          "Unterstützung lokaler Behörden mit offenen Daten",
          "Ausbildung von Studenten in freier GIS-Software",
        ],
        actions: [
          "Mapathons mit Jugendlichen vor Ort",
          "GPS-Erfassung von Brunnen und Landschulen",
          "Bereitstellung digitaler und gedruckter Karten",
        ],
        audience: "Kommunen, Studenten, Freiwillige",
      },
      {
        id: "dev-rural-fablabs",
        code: "DEV_RURAL",
        officialTitle: "Développement rural",
        subtitle: "FabLabs & Vernetztes Handwerk",
        fullDesc:
          "Das FabLab Agbélouvé verbindet moderne digitale Werkzeuge mit traditionellem Handwerk zur Reparatur und Entwicklung lokaler Ausrüstungen.",
        objectives: [
          "Offener und kostenloser Zugang zum Tiers-Lieu für alle",
          "Prototyping von Ersatzteilen für Landmaschinen",
          "Schulung lokaler Handwerker in 3D-Modellierung",
        ],
        actions: [
          "Betrieb des ländlichen FabLab mit Breitbandanbindung",
          "Solidarische Reparaturwerkstatt für Haushaltsgeräte",
          "Begleitung von Freiwilligen und Maker-Projekten",
        ],
        audience: "Handwerker, Reparateure, Erfinder und Freiwillige",
      },
    ],
  },
}

const BG_HERO = "#F7F8FA"
const BG_SECTION_ALT = "#F7F8FA"

// Domain dedicated high-quality documentary photography
const DOMAIN_PHOTOS: Record<string, { src: string; caption: string }> = {
  "inclusion-numerique": {
    src: "/photo-ancrage-togo.png",
    caption: "Atelier d'alphabétisation numérique et équipement solaire à Agbélouvé",
  },
  "jeunesse-education": {
    src: "/hero-volunteer-collab.jpg",
    caption: "Formation des jeunes aux métiers du web et du code",
  },
  "cybersecurite-hygiene": {
    src: "/togo-volunteer.jpg",
    caption: "Sensibilisation communautaire à la sécurité mobile et numérique",
  },
  "agri-lowtech": {
    src: "/photo-projet-phare.jpg",
    caption: "Capteurs d'irrigation et innovations Low-Tech pour les groupements maraîchers",
  },
  "data-innovation": {
    src: "/photo-recit-documentaire.jpg",
    caption: "Collecte de données participative et cartographie des ressources rurales",
  },
  "dev-rural-fablabs": {
    src: "/meeting-org.jpg",
    caption: "Tiers-lieu FabLab et artisanat connecté au cœur du territoire",
  },
}

export default function DomainsView({ lang, initialSettings = {} }: DomainsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR
  const [selectedId, setSelectedId] = useState<string | "ALL">("ALL")
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings)

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      getSiteSettings("DOMAINS").then((res) => {
        if (res.success && res.dict) {
          setSettings((prev) => ({ ...prev, ...res.dict }))
        }
      }).catch(console.error)
    })
  }, [])

  // Check URL hash or query param on mount to select specific domain
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        const found = t.domains.find((d) => d.id === hash || d.code.toLowerCase() === hash.toLowerCase())
        if (found) {
          setSelectedId(found.id)
          const elem = document.getElementById(found.id)
          if (elem) {
            setTimeout(() => elem.scrollIntoView({ behavior: "smooth" }), 150)
          }
        }
      }
    }
  }, [t.domains])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const filteredDomains =
    selectedId === "ALL"
      ? t.domains
      : t.domains.filter((d) => d.id === selectedId)

  // Map settings keys to domains
  const getDomainVisual = (domId: string, defaultTitle: string) => {
    const fallback = DOMAIN_PHOTOS[domId] || {
      src: "/photo-ancrage-togo.png",
      caption: defaultTitle,
    }

    if (domId === "inclusion-numerique") {
      return {
        src: settings["domain_photo_inclusion"] || fallback.src,
        caption: settings["domain_caption_inclusion"] || fallback.caption,
      }
    }
    if (domId === "jeunesse-education") {
      return {
        src: settings["domain_photo_jeunesse"] || fallback.src,
        caption: settings["domain_caption_jeunesse"] || fallback.caption,
      }
    }
    if (domId === "cybersecurite-hygiene") {
      return {
        src: settings["domain_photo_cyber"] || fallback.src,
        caption: settings["domain_caption_cyber"] || fallback.caption,
      }
    }
    if (domId === "agri-lowtech") {
      return {
        src: settings["domain_photo_agri"] || fallback.src,
        caption: settings["domain_caption_agri"] || fallback.caption,
      }
    }
    if (domId === "data-innovation") {
      return {
        src: settings["domain_photo_data"] || fallback.src,
        caption: settings["domain_caption_data"] || fallback.caption,
      }
    }
    if (domId === "dev-rural-fablabs") {
      return {
        src: settings["domain_photo_rural"] || fallback.src,
        caption: settings["domain_caption_rural"] || fallback.caption,
      }
    }

    return fallback
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="domains" navigate={navigate} />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* ── 1. Hero (#F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20" style={{ backgroundColor: BG_HERO }}>
          <div className="max-w-[1260px] mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#28A745]"></span>
              <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
                {t.badge}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#003366] tracking-tight mb-5 leading-[1.15]">
              {t.title}
            </h1>
            <p className="text-base sm:text-xl text-[#5E6B76] max-w-3xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Sleek Tab Navigation / Filters (#FFFFFF) ── */}
        <section className="sticky top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-md border-y border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-[1260px] mx-auto flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedId("ALL")}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedId === "ALL"
                  ? "bg-[#003366] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.filterAll}
            </button>
            {t.domains.map((d, idx) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  selectedId === d.id
                    ? "bg-[#003366] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className="text-xs font-mono opacity-60">0{idx + 1}</span>
                <span>{d.officialTitle}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Six Large Editorial Alternating Sections (1260px container) ── */}
        <div className="divide-y divide-slate-150">
          {filteredDomains.map((dom, index) => {
            const originalIndex = t.domains.findIndex((d) => d.id === dom.id)
            const actualIndex = originalIndex >= 0 ? originalIndex : index
            const isReversed = actualIndex % 2 === 1
            const isAltBg = actualIndex % 2 === 1
            const photoInfo = getDomainVisual(dom.id, dom.officialTitle)
            const numStr = `0${actualIndex + 1}`

            return (
              <section
                key={dom.id}
                id={dom.id}
                className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 transition-colors"
                style={{ backgroundColor: isAltBg ? BG_SECTION_ALT : "#FFFFFF" }}
              >
                <div className="max-w-[1260px] mx-auto">
                  <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 xl:gap-20">
                    
                    {/* Visual Column: Large Prominent Photo (440–480px on desktop) */}
                    <div className={`w-full lg:w-[460px] xl:w-[490px] shrink-0 ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                      <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/90 aspect-[4/3] sm:aspect-[16/11] bg-slate-100 group">
                        <img
                          src={photoInfo.src}
                          alt={dom.officialTitle}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/90 via-[#003366]/20 to-transparent flex flex-col justify-end p-6">
                          <span className="text-[11px] uppercase font-bold tracking-widest text-[#28A745] mb-1">
                            Ancrage Terrain
                          </span>
                          <p className="text-white text-xs sm:text-sm font-medium leading-snug">
                            {photoInfo.caption}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Editorial Content Column: Expanded width (650–720px) */}
                    <div className={`flex-1 w-full ${isReversed ? "lg:order-1" : "lg:order-2"} flex flex-col`}>
                      
                      {/* Big Pale Number (46–64px in #DCE5EC) + Domain Icon + Pôle Header */}
                      <div className="flex items-baseline justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#003366]/10 text-[#003366] flex items-center justify-center shrink-0">
                            <DomainCharterIcon code={dom.code} size={20} color="#003366" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#28A745]">
                            Pôle Stratégique
                          </span>
                        </div>

                        <span className="text-5xl sm:text-6xl lg:text-[64px] font-black font-mono text-[#DCE5EC] select-none leading-none">
                          {numStr}
                        </span>
                      </div>

                      {/* Official Domain Title (28–34px font-bold/extrabold in #003366) */}
                      <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#003366] leading-tight mb-1">
                        {dom.officialTitle}
                      </h2>

                      {/* Descriptive Subtitle */}
                      <p className="text-sm sm:text-base font-semibold text-[#007BFF] mb-4">
                        {dom.subtitle}
                      </p>

                      {/* Presentation Paragraph (15–16px, leading-relaxed in #5E6B76) */}
                      <p className="text-base text-[#5E6B76] leading-relaxed mb-7">
                        {dom.fullDesc}
                      </p>

                      {/* 3 Structured Editorial Sub-sections */}
                      <div className="space-y-6 pt-6 border-t border-slate-200">
                        
                        {/* 1. OBJECTIFS CLÉS */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                              {t.objectivesTitle}
                            </span>
                            <div className="h-px bg-slate-200 flex-1 ml-2" />
                          </div>
                          <ul className="space-y-2">
                            {dom.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#5E6B76] leading-relaxed">
                                <span className="text-[#28A745] font-black text-sm shrink-0 leading-tight">●</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. ACTIONS & PROJETS */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                              {t.actionsTitle}
                            </span>
                            <div className="h-px bg-slate-200 flex-1 ml-2" />
                          </div>
                          <ul className="space-y-2">
                            {dom.actions.map((act, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#5E6B76] leading-relaxed">
                                <span className="text-[#007BFF] font-black text-sm shrink-0 leading-tight">●</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. PUBLICS CONCERNÉS */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                              {t.audienceTitle}
                            </span>
                            <div className="h-px bg-slate-200 flex-1 ml-2" />
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[15px] text-[#5E6B76]">
                            <p className="leading-relaxed">
                              {dom.audience}
                            </p>

                            <Link
                              href={getPageUrl("partner", lang)}
                              className="inline-flex items-center text-sm font-bold text-[#007BFF] hover:text-[#003366] transition-colors shrink-0 whitespace-nowrap"
                            >
                              {t.collabBtn} <span className="ml-1">→</span>
                            </Link>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              </section>
            )
          })}
        </div>

        {/* ── 4. Clean Institutional CTA Box (#F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white border-t border-slate-200">
          <div className="max-w-2xl mx-auto">
            <div 
              className="rounded-2xl p-8 sm:p-12 border border-slate-200 text-center shadow-xs"
              style={{ backgroundColor: BG_HERO }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#28A745] block mb-3">
                {t.ctaPreTitle}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] mb-3 leading-snug">
                {t.ctaTitle}
              </h2>
              <p className="text-[15px] sm:text-base text-[#5E6B76] max-w-lg mx-auto mb-8 leading-relaxed">
                {t.ctaDesc}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href={getPageUrl("contact", lang)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-xs"
                >
                  {t.ctaContact}
                </Link>
                <Link
                  href={getPageUrl("partner", lang)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-[#007BFF] text-white hover:bg-[#0060c8] transition-colors shadow-xs"
                >
                  {t.ctaPartner}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
