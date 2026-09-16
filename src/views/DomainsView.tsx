"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface DomainsViewProps {
  lang: Language
}

const BG = "#F5F7F9"

const I18N = {
  FR: {
    badge: "6 Pôles d'Action Stratégiques",
    title: "Nos Domaines d'Intervention",
    subtitle:
      "Une approche globale et pragmatique pour mettre le meilleur de l'innovation numérique, sobre et durable au service des populations rurales.",
    filterAll: "Tous les domaines",
    objectivesTitle: "Objectifs Clés",
    actionsTitle: "Exemples d'Actions & Projets",
    audienceTitle: "Publics Cibles",
    collabBtn: "Proposer un partenariat sur ce domaine",
    projectsBtn: "Voir les projets associés",
    ctaTitle: "Vous souhaitez développer un projet dans l'un de ces domaines ?",
    ctaDesc: "Nous concevons des programmes conjoints avec universités, bailleurs, ONG et collectivités territoriales.",
    ctaPartner: "CONTACTER L'ÉQUIPE PROJETS",
    ctaVolunteer: "REJOINDRE COMME VOLONTAIRE",
    domains: [
      {
        id: "inclusion-numerique",
        code: "INCLUSION_NUMERIQUE",
        icon: "💻",
        color: "#174F7A",
        title: "Inclusion Numérique & Alphabétisation",
        shortDesc: "Démocratiser l'accès aux outils numériques fondamentaux en milieu rural.",
        fullDesc:
          "L'alphabétisation numérique est aujourd'hui une compétence vitale au même titre que la lecture et l'écriture. Dans les villages reculés, l'absence de matériel et d'accompagnement creuse un fossé générationnel et géographique profond. APTIC-R installe des pôles d'initiation et déploie des ateliers mobiles pour que chacun puisse utiliser un ordinateur, naviguer sur Internet en toute sécurité et accomplir ses démarches essentielles.",
        objectives: [
          "Former chaque année plus de 1 000 écoliers et collégiens aux bases de l'informatique",
          "Fournir aux écoles de village des parcs d'ordinateurs reconditionnés à faible consommation",
          "Former les enseignants ruraux à l'usage des ressources pédagogiques numériques libres",
          "Permettre aux adultes et commerçants locaux d'accéder aux services administratifs en ligne",
        ],
        actions: [
          "Caravane Numérique Itinérante dans les écoles de la préfecture du Zio",
          "Ateliers hebdomadaires d'alphabétisation numérique au FabLab d'Agbélouvé",
          "Distribution de clés USB et tablettes éducatives hors-ligne (Wikipédia Kiwix)",
        ],
        audience: "Élèves du primaire et secondaire, enseignants, artisans, femmes commerçantes",
      },
      {
        id: "jeunesse-education",
        code: "JEUNESSE",
        icon: "🚀",
        color: "#35A85A",
        title: "Jeunesse, Éducation & Compétences d'Avenir",
        shortDesc: "Former les jeunes aux métiers du web, du design et du code pour l'emploi local.",
        fullDesc:
          "Pour éviter l'exode rural forcé des jeunes talents vers Lomé ou l'étranger, APTIC-R propose des formations qualifiantes accélérées aux métiers du numérique. De la création de sites web à la gestion de contenu, en passant par le graphisme et la bureautique avancée, nous préparons les jeunes à générer des revenus sur place grâce au travail à distance et à l'entrepreneuriat local.",
        objectives: [
          "Dispenser des cursus intensifs en développement web (HTML, CSS, JS, CMS)",
          "Développer les compétences en conception graphique et production de contenus digitaux",
          "Accompagner la création de micro-entreprises de services numériques en zone rurale",
          "Favoriser l'insertion professionnelle des jeunes filles à parité stricte",
        ],
        actions: [
          "Bootcamps intensifs de 3 mois « Jeunes Codeurs du Zio »",
          "Programme spécial « Elles Codent pour le Changement » dédié aux jeunes femmes",
          "Incubation de micro-projets de services digitaux locaux (secrétariat public, maintenance)",
        ],
        audience: "Jeunes diplômés ou déscolarisés de 16 à 30 ans, porteurs de projets",
      },
      {
        id: "cybersecurite-hygiene",
        code: "CYBERSECURITE",
        icon: "🛡️",
        color: "#0F3452",
        title: "Cybersécurité & Citoyenneté Numérique",
        shortDesc: "Sensibiliser aux risques d'Internet, aux arnaques et à la protection des données.",
        fullDesc:
          "L'arrivée massive des smartphones bon marché et de l'Internet mobile expose des millions de primo-utilisateurs à des cyber-escroqueries (mobile money, phishing), au harcèlement en ligne et à la désinformation virale. APTIC-R conduit des campagnes de sensibilisation de proximité pour promouvoir l'hygiène numérique, la protection de la vie privée et un usage citoyen et éclairé des réseaux sociaux.",
        objectives: [
          "Sensibiliser les populations aux pièges et fraudes financières sur le mobile money",
          "Former les jeunes collégiens et lycéens à la protection de leur identité numérique",
          "Former des relais communautaires capables de vérifier l'information et débusquer les fake news",
          "Promouvoir les principes d'éthique et de respect dans l'espace public numérique",
        ],
        actions: [
          "Sessions de sensibilisation « Cyber-Vigilance » sur les marchés et places de village",
          "Guides pratiques illustrés en langues locales (Éwé et Français) sur la sécurité mobile",
          "Modules scolaires sur le cyber-harcèlement et la gestion du temps d'écran",
        ],
        audience: "Grand public, utilisateurs de mobile money, associations communautaires, scolaires",
      },
      {
        id: "agri-lowtech",
        code: "AGRI_LOWTECH",
        icon: "🌱",
        color: "#2E7D32",
        title: "Agriculture Durable, Écologie & Low-Tech",
        shortDesc: "Allier numérique sobre, énergie solaire et techniques agro-écologiques.",
        fullDesc:
          "L'agriculture est le cœur battant de l'économie rurale togolaise. Face aux dérèglements climatiques et aux coûts prohibitifs des technologies industrielles, APTIC-R promeut la « Low-Tech » : des solutions sobres, intelligentes, écologiques et entièrement fabricables et réparables avec des matériaux locaux pour optimiser les cultures et préserver les sols.",
        objectives: [
          "Co-concevoir des systèmes d'irrigation goutte-à-goutte automatisés à énergie solaire",
          "Déployer des capteurs simples de mesure d'humidité des sols et de pluviométrie",
          "Former les maraîchers à l'agro-écologie et à la cartographie de leurs parcelles",
          "Créer une filière locale de recyclage et valorisation des déchets électroniques (E-waste)",
        ],
        actions: [
          "Parcelle expérimentale Low-Tech connectée au FabLab d'Agbélouvé",
          "Ateliers de fabrication de séchoirs solaires optimisés pour fruits et légumes",
          "Formation de coopératives agricoles féminines à la gestion numérique de leurs récoltes",
        ],
        audience: "Agriculteurs, maraîchers, coopératives agricoles, groupements de femmes rurales",
      },
      {
        id: "data-innovation",
        code: "DATA_INNOVATION",
        icon: "📊",
        color: "#1976D2",
        title: "Données Ouvertes & Innovation Citoyenne",
        shortDesc: "Cartographie participative, données locales et outils au service du bien commun.",
        fullDesc:
          "Les zones rurales souffrent souvent d'une invisibilité statistique et géographique complète : pistes non cartographiées, points d'eau isolés, dispensaires non référencés. En mobilisant les outils OpenStreetMap et la collecte de données participative, APTIC-R aide les communautés et les municipalités à documenter leur territoire pour mieux planifier leur développement.",
        objectives: [
          "Cartographier collaborativement les villages, infrastructures et ressources du Zio",
          "Sensibiliser les décideurs locaux et mairies à l'utilisation des données ouvertes",
          "Initier les étudiants et passionnés à la géomatique et aux logiciels SIG libres (QGIS)",
          "Produire des cartographies thématiques sur l'accès à l'eau, à l'électricité et aux soins",
        ],
        actions: [
          "Mapathons communautaires OpenStreetMap avec les jeunes de la région",
          "Relevé GPS citoyen des forages d'eau potable et des écoles de brousse",
          "Mise à disposition de cartes physiques et numériques libres pour les collectivités",
        ],
        audience: "Collectivités locales, mairies, étudiants en géographie/SIG, bénévoles cartographes",
      },
      {
        id: "dev-rural-fablabs",
        code: "DEV_RURAL",
        icon: "⚙️",
        color: "#E65100",
        title: "Développement Rural & FabLabs Communautaires",
        shortDesc: "Implanter des tiers-lieux d'apprentissage, d'artisanat numérique et de fabrication.",
        fullDesc:
          "Le FabLab d'Agbélouvé est l'épicentre opérationnel d'APTIC-R. Cet espace hybride réunit machines à commande numérique (impression 3D, découpeuse laser), établis de menuiserie, poste de soudure électronique et espace de co-working connecté. C'est le lieu où les idées des villageois prennent vie et où les compétences techniques se transmettent de génération en génération.",
        objectives: [
          "Maintenir un tiers-lieu technologique ouvert, gratuit et accessible à tous les villageois",
          "Prototyper des pièces de rechange introuvables pour machines agricoles et vélos",
          "Initier les artisans locaux à la modélisation 3D et à la fabrication assistée par ordinateur",
          "Servir de centre de résidence et de travail pour nos volontaires internationaux et locaux",
        ],
        actions: [
          "Gestion quotidienne du FabLab Rural d'Agbélouvé avec accès Internet haut débit",
          "Réparation solidaire d'équipements électroménagers et outillages de ferme",
          "Accompagnement de projets maker : lampes solaires portatives, robots éducatifs simples",
        ],
        audience: "Artisans, réparateurs, bricoleurs, inventeurs locaux, volontaires et communauté entière",
      },
    ],
  },
  EN: {
    badge: "6 Strategic Action Pillars",
    title: "Our Action Domains",
    subtitle:
      "A comprehensive, pragmatic framework putting frugal, sustainable digital innovation at the direct service of rural communities.",
    filterAll: "All domains",
    objectivesTitle: "Key Objectives",
    actionsTitle: "Examples of Actions & Projects",
    audienceTitle: "Target Audiences",
    collabBtn: "Propose a partnership in this domain",
    projectsBtn: "Explore related projects",
    ctaTitle: "Interested in developing a project in one of these domains?",
    ctaDesc: "We co-create joint programs with universities, foundations, NGOs, and municipal authorities.",
    ctaPartner: "CONTACT PROJECT TEAM",
    ctaVolunteer: "APPLY AS VOLUNTEER",
    domains: [
      {
        id: "inclusion-numerique",
        code: "INCLUSION_NUMERIQUE",
        icon: "💻",
        color: "#174F7A",
        title: "Digital Inclusion & Literacy",
        shortDesc: "Democratize access to essential computing tools in rural communities.",
        fullDesc: "Digital literacy is an essential modern skill. APTIC-R deploys mobile caravans and community hubs equipped with refurbished, solar-powered computers so children and adults alike gain practical digital autonomy.",
        objectives: [
          "Train over 1,000 students annually in computer fundamentals",
          "Supply rural schools with energy-efficient refurbished computer labs",
          "Equip rural teachers with open-source educational software",
          "Help rural adults navigate digital administrative portals",
        ],
        actions: [
          "Mobile Digital Caravan traveling across remote schools in Zio",
          "Weekly community computer workshops at Agbélouvé FabLab",
          "Distribution of offline educational toolkits (Wikipedia Kiwix)",
        ],
        audience: "Primary & secondary students, rural teachers, local market women",
      },
      {
        id: "jeunesse-education",
        code: "JEUNESSE",
        icon: "🚀",
        color: "#35A85A",
        title: "Youth, Education & Future Skills",
        shortDesc: "Train young people in web development, design, and tech skills for local employment.",
        fullDesc: "To curb forced rural migration to major cities, APTIC-R provides intensive vocational training in web design, coding, and remote-work opportunities directly inside rural communities.",
        objectives: [
          "Deliver intensive bootcamps in web coding and digital publishing",
          "Develop graphic design and digital media creation skills",
          "Support the creation of rural tech micro-enterprises",
          "Achieve strict gender parity in all technical classes",
        ],
        actions: [
          "3-month intensive 'Zio Young Coders' coding bootcamp",
          "'Girls Code for Change' program for young women",
          "Incubation of local digital service shops",
        ],
        audience: "Youth aged 16–30, prospective local entrepreneurs",
      },
      {
        id: "cybersecurite-hygiene",
        code: "CYBERSECURITE",
        icon: "🛡️",
        color: "#0F3452",
        title: "Cybersecurity & Digital Citizenship",
        shortDesc: "Raise community awareness of online risks, mobile money scams, and privacy protection.",
        fullDesc: "With the rise of smartphones, first-time users face serious cyber risks. We run grassroots awareness campaigns to teach digital hygiene, fraud prevention, and responsible social media usage.",
        objectives: [
          "Educate communities against mobile money fraud and phishing",
          "Teach young students privacy protection and safe browsing habits",
          "Train community leaders to identify fake news and online misinformation",
          "Foster ethical, respectful dialogue in digital public spaces",
        ],
        actions: [
          "Open-air cyber safety workshops in local village markets",
          "Bilingual pocket guides (Ewe & French) on mobile phone protection",
          "School workshops on cyberbullying and digital well-being",
        ],
        audience: "General public, mobile money users, community groups, students",
      },
      {
        id: "agri-lowtech",
        code: "AGRI_LOWTECH",
        icon: "🌱",
        color: "#2E7D32",
        title: "Sustainable Agriculture & Low-Tech",
        shortDesc: "Combine frugal technology, solar power, and agro-ecological farming methods.",
        fullDesc: "Agriculture is the backbone of rural Togo. APTIC-R champions 'Low-Tech' solutions: simple, repairable, eco-friendly systems built with locally sourced parts to optimize crops and build climate resilience.",
        objectives: [
          "Co-design solar-powered automated drip irrigation systems",
          "Deploy accessible soil moisture and rainfall sensors",
          "Train farmers in ecological practices and field mapping",
          "Create a local repair and e-waste recycling workflow",
        ],
        actions: [
          "Connected agro-ecological test parcel at the Agbélouvé FabLab",
          "Workshops building optimized solar food dehydrators",
          "Digital harvest management courses for women farming cooperatives",
        ],
        audience: "Smallholders, market gardeners, rural women cooperatives",
      },
      {
        id: "data-innovation",
        code: "DATA_INNOVATION",
        icon: "📊",
        color: "#1976D2",
        title: "Open Data & Citizen Innovation",
        shortDesc: "Participatory mapping, civic open data, and technology serving community welfare.",
        fullDesc: "Rural areas are often statistically invisible. By mobilizing OpenStreetMap and community surveying, APTIC-R helps villages and local governments map resources to plan sustainable development.",
        objectives: [
          "Collaboratively map rural roads, clinics, and clean water wells",
          "Assist local municipal councils with open geographic data",
          "Train students in free GIS software (QGIS)",
          "Publish thematic maps highlighting community infrastructure needs",
        ],
        actions: [
          "OpenStreetMap community mapathons with regional students",
          "Field GPS surveys of water pumps and remote schools",
          "Free physical and digital maps distributed to local authorities",
        ],
        audience: "Municipal councils, geography students, volunteer mappers",
      },
      {
        id: "dev-rural-fablabs",
        code: "DEV_RURAL",
        icon: "⚙️",
        color: "#E65100",
        title: "Rural Development & Community FabLabs",
        shortDesc: "Operate community innovation hubs for learning, 3D repair, and digital fabrication.",
        fullDesc: "The Agbélouvé FabLab is our central operational hub: combining 3D printing, electronics soldering stations, woodworking benches, and a high-speed connected co-working space.",
        objectives: [
          "Maintain a free, welcoming open tech space for all villagers",
          "Prototype custom replacement parts for farm tools and bicycles",
          "Introduce local craftspeople to computer-aided design (CAD)",
          "Host and accommodate international and local volunteers",
        ],
        actions: [
          "Daily operation of the Agbélouvé Rural FabLab with satellite broadband",
          "Community repair cafe for domestic electronics and tools",
          "Mentoring maker initiatives: solar lanterns, educational robots",
        ],
        audience: "Craftspeople, local repair technicians, makers, volunteers",
      },
    ],
  },
  DE: {
    badge: "6 Strategische Aktionsfelder",
    title: "Unsere Handlungsfelder",
    subtitle:
      "Ein ganzheitlicher Ansatz, um nachhaltige digitale Innovation in den Dienst der ländlichen Bevölkerung zu stellen.",
    filterAll: "Alle Bereiche",
    objectivesTitle: "Hauptziele",
    actionsTitle: "Beispiele für Aktivitäten",
    audienceTitle: "Zielgruppen",
    collabBtn: "Partnerschaft vorschlagen",
    projectsBtn: "Zugehörige Projekte ansehen",
    ctaTitle: "Möchten Sie ein Projekt in einem dieser Bereiche unterstützen?",
    ctaDesc: "Wir entwickeln gemeinsame Programme mit Universitäten, Stiftungen und NGOs.",
    ctaPartner: "PROJEKTTEAM KONTAKTIEREN",
    ctaVolunteer: "ALS FREIWILLIGER BEWERBEN",
    domains: [
      {
        id: "inclusion-numerique",
        code: "INCLUSION_NUMERIQUE",
        icon: "💻",
        color: "#174F7A",
        title: "Digitale Inklusion & Grundbildung",
        shortDesc: "Zugang zu digitalen Werkzeugen in ländlichen Gebieten ermöglichen.",
        fullDesc: "Digitale Grundbildung ist eine Schlüsselkompetenz. APTIC-R baut mobile Lernwerkstätten auf, um Kindern und Erwachsenen digitale Selbstständigkeit zu ermöglichen.",
        objectives: ["Jährlich über 1.000 Schüler schulen", "Dorfschulen mit Solarräumen ausstatten"],
        actions: ["Mobile Schulkarawane", "Wöchentliche Workshops im FabLab Agbélouvé"],
        audience: "Schüler, Lehrer, Dorfbewohner",
      },
      {
        id: "jeunesse-education",
        code: "JEUNESSE",
        icon: "🚀",
        color: "#35A85A",
        title: "Jugend & Zukunftskompetenzen",
        shortDesc: "Ausbildung junger Menschen in Webentwicklung und Design für lokale Beschäftigung.",
        fullDesc: "Praxisnahe Ausbildung in modernen IT-Berufen direkt vor Ort zur Stärkung der ländlichen Wirtschaft.",
        objectives: ["Intensive Programmier-Bootcamps", "Gezielte Frauenförderung in MINT"],
        actions: ["Bootcamp 'Jeunes Codeurs'", "Frauenprogramm 'Girls Code'"],
        audience: "Jugendliche zwischen 16 und 30 Jahren",
      },
      {
        id: "cybersecurite-hygiene",
        code: "CYBERSECURITE",
        icon: "🛡️",
        color: "#0F3452",
        title: "Cybersicherheit & Bürgerrechte",
        shortDesc: "Sensibilisierung für Onlinerisiken und Datenschutz.",
        fullDesc: "Aufklärungskampagnen zum Schutz vor Onlinebetrug und für eine sichere Nutzung sozialer Netzwerke.",
        objectives: ["Schutz vor Mobile-Money-Betrug", "Digitale Selbstverteidigung an Schulen"],
        actions: ["Marktaufklärungen", "Zweisprachige Leitfäden"],
        audience: "Allgemeinheit, Handynutzer, Schüler",
      },
      {
        id: "agri-lowtech",
        code: "AGRI_LOWTECH",
        icon: "🌱",
        color: "#2E7D32",
        title: "Ökologische Landwirtschaft & Low-Tech",
        shortDesc: "Verbindung von sparsamer Technologie und Agrarökologie.",
        fullDesc: "Einfache, reparierbare Low-Tech-Lösungen zur Unterstützung von Kleinbauern und Klimaresilienz.",
        objectives: ["Solare Tropfbewässerung", "Bodenfeuchtemessung"],
        actions: ["Testfeld am FabLab", "Solar-Fruchttrockner"],
        audience: "Bauern, Kooperativen, Fraueninitiativen",
      },
      {
        id: "data-innovation",
        code: "DATA_INNOVATION",
        icon: "📊",
        color: "#1976D2",
        title: "Offene Daten & Bürgerinnovation",
        shortDesc: "Partizipative Kartierung und Open Data für das Gemeinwohl.",
        fullDesc: "Gemeinsam mit OpenStreetMap kartieren wir Dörfer und Wasserstellen für eine gerechte Entwicklung.",
        objectives: ["Kartierung entlegener Gebiete", "Nutzung freier Geodaten"],
        actions: ["Mapathons", "GPS-Erfassung von Brunnen"],
        audience: "Kommunen, Studenten, Freiwillige",
      },
      {
        id: "dev-rural-fablabs",
        code: "DEV_RURAL",
        icon: "⚙️",
        color: "#E65100",
        title: "Ländliche FabLabs & Werkstätten",
        shortDesc: "Gemeinschaftliche Werkstätten für 3D-Druck, Reparatur und Handwerk.",
        fullDesc: "Das FabLab Agbélouvé ist das kreative Zentrum für Reparatur, Prototyping und Erfahrungsaustausch.",
        objectives: ["Kostenloser Zugang zu modernen Werkzeugen", "Reparatur von Landwirtschaftsgeräten"],
        actions: ["Betrieb des FabLab Agbélouvé", "Maker-Projekte"],
        audience: "Handwerker, Tüftler, Freiwillige",
      },
    ],
  },
}

export default function DomainsView({ lang }: DomainsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR
  const [selectedId, setSelectedId] = useState<string | "ALL">("ALL")

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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="domains" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>🎯</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Filter Pills ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedId("ALL")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                selectedId === "ALL"
                  ? "bg-[#174F7A] text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.filterAll}
            </button>
            {t.domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  selectedId === d.id
                    ? "bg-[#174F7A] text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.title.split("&")[0].trim()}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Domains Detailed List ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto space-y-12">
            {filteredDomains.map((dom) => (
              <div
                key={dom.id}
                id={dom.id}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                      style={{ backgroundColor: `${dom.color}15`, color: dom.color }}
                    >
                      {dom.icon}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#142332]">
                        {dom.title}
                      </h2>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">
                        {dom.shortDesc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={getPageUrl("partner", lang)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#174F7A]/10 text-[#174F7A] hover:bg-[#174F7A] hover:text-white transition-all self-start sm:self-auto"
                  >
                    {t.collabBtn} →
                  </Link>
                </div>

                {/* Description */}
                <div className="py-6 text-slate-600 leading-relaxed text-base">
                  {dom.fullDesc}
                </div>

                {/* Grid 3 Columns: Objectives, Actions, Audience */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                  {/* Objectives */}
                  <div className="lg:col-span-5 bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/70">
                    <h3 className="text-sm font-bold text-[#142332] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span>🎯</span>
                      <span>{t.objectivesTitle}</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {dom.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="text-[#35A85A] font-bold mt-0.5">✓</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-4 bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/70">
                    <h3 className="text-sm font-bold text-[#142332] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span>⚡</span>
                      <span>{t.actionsTitle}</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {dom.actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="text-[#174F7A] font-bold mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Audience */}
                  <div className="lg:col-span-3 bg-gradient-to-br from-[#174F7A]/5 to-[#35A85A]/5 p-6 rounded-2xl border border-slate-200/70 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#142332] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>👥</span>
                        <span>{t.audienceTitle}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {dom.audience}
                      </p>
                    </div>

                    <div className="pt-6">
                      <Link
                        href={getPageUrl("projects", lang)}
                        className="w-full text-center block px-3 py-2 rounded-lg text-xs font-bold text-[#174F7A] bg-white border border-slate-200 hover:border-[#174F7A] transition-colors"
                      >
                        {t.projectsBtn}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. CTA ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#174F7A] text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              {t.ctaTitle}
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
              {t.ctaDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href={getPageUrl("partner", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-[#35A85A] text-white hover:bg-[#2e924e] transition-colors shadow-md"
              >
                {t.ctaPartner}
              </Link>
              <Link
                href={getPageUrl("apply", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-white text-[#174F7A] hover:bg-slate-100 transition-colors shadow-md"
              >
                {t.ctaVolunteer}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
