"use client"

import React from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface AboutViewProps {
  lang: Language
  initialSettings?: Record<string, string>
}

const BLUE = "#003366"
const BLUE_ACTION = "#007BFF"
const GREEN = "#28A745"
const BG_SURFACE = "#F7F8FA"
const TEXT_MAIN = "#16324A"
const TEXT_MUTED = "#5E6B76"

const I18N = {
  FR: {
    badge: "Association togolaise · Enregistrée sous récépissé officiel",
    eyebrow: "À PROPOS D'APTIC-R",
    title: "Bâtir des ponts numériques durables\nau cœur du milieu rural.",
    subtitle:
      "Depuis sa fondation à Agbélouvé, APTIC-R œuvre pour que la révolution numérique et technologique ne laisse aucun village, aucune femme et aucun jeune de côté.",
    
    storyEyebrow: "NOTRE HISTOIRE",
    storyTimeline: (year: string) => `Depuis ${year}`,
    storyHeadline: "Une initiative née du terrain, pour combler la fracture numérique rurale.",
    storyP1: (year: string) =>
      `En ${year}, au cœur du canton d'Agbélouvé (préfecture du Zio, Togo), un constat s'impose avec acuité : alors que le monde s'accélère au rythme de l'intelligence artificielle et du numérique, les communautés villageoises restent privées d'infrastructures informatiques, de connexion stable et de formation technologique adaptée.`,
    storyP2:
      "Face au risque d'accroissement des inégalités territoriales et de marginalisation de la jeunesse rurale, un collectif d'ingénieurs, d'éducateurs et d'acteurs communautaires togolais décide d'agir. C'est ainsi que naît APTIC-R (Association Pour la Promotion des Technologies de l'Information et de la Communication en Milieu Rural).",
    storyP3:
      "En implantant des tiers-lieux d'apprentissage équipés de matériel reconditionné et alimentés à l'énergie solaire, APTIC-R a transformé Agbélouvé en un laboratoire vivant de l'innovation rurale frugale et de l'artisanat connecté.",
    storyOriginLabel: "Création à Agbélouvé",
    storyFormalLabel: "Formalisation officielle",
    storyNowYear: "Aujourd'hui",
    storyNowLabel: "Déploiement & Impact",

    pillarsEyebrow: "CADRE D'INTERVENTION",
    pillarsTitle: "Mission, Vision & Philosophie",
    missionNumber: "01",
    missionTitle: "NOTRE MISSION",
    missionDesc:
      "Démocratiser l'apprentissage technologique et les solutions numériques utiles dans les zones rurales et périurbaines du Togo à travers la formation continue, l'expérimentation concrète et le transfert durable de compétences.",
    visionNumber: "02",
    visionTitle: "NOTRE VISION",
    visionDesc:
      "Un milieu rural togolais et africain émancipé, où les technologies libres et les solutions low-tech renforcent durablement la souveraineté alimentaire, économique et civique des communautés locales.",
    approachNumber: "03",
    approachTitle: "NOTRE PHILOSOPHIE",
    approachDesc:
      "Le numérique sobre et adapté. Nous refusons la technologie superflue : chaque outil déployé doit être réparable localement, sobre en énergie, accessible à tous et directement utile aux besoins du village.",

    stats: [
      { value: "5+", label: "Années d'action sur le terrain" },
      { value: "3 200+", label: "Enfants, jeunes et artisans formés" },
      { value: "14", label: "Établissements scolaires partenaires" },
      { value: "100%", label: "Projets co-conçus localement" },
    ],

    valuesEyebrow: "PRINCIPES FONDAMENTAUX",
    valuesTitle: "Nos 5 valeurs cardinales",
    valuesSubtitle: "Des règles intangibles qui guident chacune de nos actions et collaborations.",
    values: [
      {
        num: "01",
        title: "Ancrage communautaire",
        desc: "Rien ne se fait sans l'accord, la participation active et la co-responsabilité des chefs traditionnels, des associations locales et des familles villageoises.",
      },
      {
        num: "02",
        title: "Sobriété numérique & Low-Tech",
        desc: "Privilégier le matériel reconditionné, l'énergie solaire et les formats légers pour un impact écologique minimal et une autonomie locale maximale.",
      },
      {
        num: "03",
        title: "Égalité des chances & mixité",
        desc: "Encourager prioritairement l'autonomisation des jeunes filles et des femmes à travers des programmes dédiés pour faire tomber les barrières de genre.",
      },
      {
        num: "04",
        title: "Souveraineté & culture libre",
        desc: "Promouvoir les logiciels libres, l'Open Data et le partage horizontal des connaissances contre toute forme de dépendance technologique.",
      },
      {
        num: "05",
        title: "Intégrité & transparence",
        desc: "Une gouvernance rigoureuse, des comptes vérifiés et des bilans d'activités publics garantissant une relation de confiance absolue.",
      },
    ],

    governanceEyebrow: "ORGANISATION",
    governanceTitle: "Gouvernance & Structure",
    governanceSubtitle: "Une gouvernance collégiale, démocratique et ancrée dans le respect des statuts associatifs togolais.",
    gov1Title: "Assemblée Générale",
    gov1Role: "Instance souveraine d'orientation",
    gov1Desc: "Réunit chaque année l'ensemble des membres adhérents pour approuver les rapports moraux, financiers et fixer les grandes orientations stratégiques.",
    gov2Title: "Bureau Exécutif & Direction",
    gov2Role: "Pilotage opérationnel & déploiement",
    gov2Desc: "Équipe opérationnelle chargée de la mise en œuvre quotidienne des programmes, de la gestion administrative, financière et de la coordination des volontaires.",
    gov3Title: "Comité Consultatif Communautaire",
    gov3Role: "Garant d'impact & ancrage local",
    gov3Desc: "Composé de représentants des villageois d'Agbélouvé, d'enseignants et d'artisans, veillant à la pertinence sociale et culturelle des actions menées.",

    ctaEyebrow: "ENGAGEMENT",
    ctaTitle: "PARTICIPEZ À L'AVENTURE APTIC-R",
    ctaSubtitle: "Vous souhaitez rejoindre la communauté, devenir volontaire de terrain ou construire un partenariat institutionnel ?",
    ctaMember: "Devenir membre",
    ctaVolunteer: "Devenir volontaire",
    ctaPartner: "Devenir partenaire",
  },
  EN: {
    badge: "Togolese Non-Profit Organization · Official Registry Status",
    eyebrow: "ABOUT APTIC-R",
    title: "Building lasting digital bridges\nin the heart of rural Africa.",
    subtitle:
      "Since its founding in Agbélouvé, APTIC-R has been dedicated to ensuring that the digital and technological revolution leaves no village, no woman, and no young person behind.",
    
    storyEyebrow: "OUR STORY",
    storyTimeline: (year: string) => `Since ${year}`,
    storyHeadline: "A grassroots initiative created to bridge the rural digital divide.",
    storyP1: (year: string) =>
      `In ${year}, in the rural canton of Agbélouvé (Zio Prefecture, Togo), an urgent reality became apparent: while the world was accelerating into artificial intelligence and high-tech connectivity, village communities remained deprived of computing facilities, reliable internet, and adapted vocational tech training.`,
    storyP2:
      "To prevent growing spatial inequality and youth disenfranchisement, a collective of Togolese engineers, educators, and community organizers decided to take action. Thus, APTIC-R (Association for the Promotion of ICT in Rural Areas) was founded.",
    storyP3:
      "By establishing grassroots learning labs powered by solar energy and refurbished hardware, APTIC-R turned Agbélouvé into a living laboratory for frugal innovation, youth empowerment, and connected craft.",
    storyOriginLabel: "Founded in Agbélouvé",
    storyFormalLabel: "Official Registration",
    storyNowYear: "Today",
    storyNowLabel: "Growth & Impact",

    pillarsEyebrow: "STRATEGIC FRAMEWORK",
    pillarsTitle: "Mission, Vision & Philosophy",
    missionNumber: "01",
    missionTitle: "OUR MISSION",
    missionDesc:
      "Democratize digital education and useful technology in rural and peri-urban areas through hands-on training, community experimentation, and sustainable skill transfer.",
    visionNumber: "02",
    visionTitle: "OUR VISION",
    visionDesc:
      "An empowered rural community where open-source technology and low-tech tools bolster local food sovereignty, economic resilience, and civic engagement.",
    approachNumber: "03",
    approachTitle: "OUR PHILOSOPHY",
    approachDesc:
      "Frugal, adapted technology. We reject tech for tech's sake: every tool we deploy must be locally repairable, energy-efficient, accessible, and directly beneficial to the village.",

    stats: [
      { value: "5+", label: "Years of grassroots action" },
      { value: "3,200+", label: "Youth, students & artisans trained" },
      { value: "14", label: "Partner schools & institutions" },
      { value: "100%", label: "Locally co-designed projects" },
    ],

    valuesEyebrow: "CORE PRINCIPLES",
    valuesTitle: "Our 5 core values",
    valuesSubtitle: "Guiding principles driving every initiative and partnership.",
    values: [
      {
        num: "01",
        title: "Community Roots",
        desc: "Nothing is undertaken without the full involvement, consent, and co-ownership of traditional leaders, grassroots groups, and local families.",
      },
      {
        num: "02",
        title: "Digital Frugality & Low-Tech",
        desc: "Prioritizing refurbished hardware, solar energy, simple sensors, and lightweight formats for minimal ecological footprint and maximum local autonomy.",
      },
      {
        num: "03",
        title: "Equal Opportunity & Inclusion",
        desc: "Actively fostering women's empowerment through tailored programs to break down gender barriers in science and technology.",
      },
      {
        num: "04",
        title: "Sovereignty & Open Culture",
        desc: "Promoting free/open-source software, Open Data, and horizontal knowledge sharing against all forms of technological dependency.",
      },
      {
        num: "05",
        title: "Integrity & Transparency",
        desc: "Strict management, audited records, and public activity reports maintaining full trust among members, partners, and beneficiaries.",
      },
    ],

    governanceEyebrow: "ORGANIZATION",
    governanceTitle: "Governance & Structure",
    governanceSubtitle: "Democratic, collaborative governance anchored in non-profit transparency.",
    gov1Title: "General Assembly",
    gov1Role: "Sovereign policy-setting body",
    gov1Desc: "Sovereign annual gathering of all members to review moral and financial reports and chart future strategic milestones.",
    gov2Title: "Executive Board & Management",
    gov2Role: "Operational leadership & delivery",
    gov2Desc: "Operational team responsible for program implementation, administrative oversight, volunteer safety, and daily coordination.",
    gov3Title: "Community Advisory Board",
    gov3Role: "Community relevance & local anchor",
    gov3Desc: "Comprising Agbélouvé elders, teachers, and local artisans ensuring relevance, cultural alignment, and genuine community benefit.",

    ctaEyebrow: "GET INVOLVED",
    ctaTitle: "JOIN THE APTIC-R ADVENTURE",
    ctaSubtitle: "Whether you want to join our membership community, volunteer in the field, or build an institutional partnership, we welcome you.",
    ctaMember: "Become a member",
    ctaVolunteer: "Become a volunteer",
    ctaPartner: "Become a partner",
  },
  DE: {
    badge: "Togoische gemeinnützige Organisation · Offizieller Registerstatus",
    eyebrow: "ÜBER APTIC-R",
    title: "Nachhaltige digitale Brücken\nim ländlichen Raum bauen.",
    subtitle:
      "Seit der Gründung in Agbélouvé setzt sich APTIC-R dafür ein, dass die technologische Revolution kein Dorf, keine Frau und keinen jungen Menschen zurücklässt.",
    
    storyEyebrow: "UNSERE GESCHICHTE",
    storyTimeline: (year: string) => `Seit ${year}`,
    storyHeadline: "Eine Initiative aus der Praxis, um die digitale Kluft auf dem Land zu überwinden.",
    storyP1: (year: string) =>
      `Im Jahr ${year} wurde im ländlichen Agbélouvé eine dringliche Realität sichtbar: Während die Welt in rasantem Tempo voranschreitet, blieben Dorfgemeinschaften von IT-Infrastruktur und Ausbildung abgeschnitten.`,
    storyP2:
      "Um dieser Chancenungleichheit entgegenzuwirken, schloss sich ein Kollektiv togoischer Ingenieure, Pädagogen und Gemeindemitglieder zusammen und gründete APTIC-R.",
    storyP3:
      "Mit solarbetriebenen Lernwerkstätten und wiederaufbereiteten Computern wurde Agbélouvé zu einem lebendigen Reallabor für ländliche Innovation.",
    storyOriginLabel: "Gründung in Agbélouvé",
    storyFormalLabel: "Offizielle Registrierung",
    storyNowYear: "Heute",
    storyNowLabel: "Wachstum & Wirkung",

    pillarsEyebrow: "STRATEGISCHER RAHMEN",
    pillarsTitle: "Mission, Vision & Philosophie",
    missionNumber: "01",
    missionTitle: "UNSERE MISSION",
    missionDesc:
      "Demokratisierung digitaler Bildung im ländlichen Raum durch praxisnahe Schulungen und nachhaltigen Kompetenztransfer.",
    visionNumber: "02",
    visionTitle: "UNSERE VISION",
    visionDesc:
      "Selbstbestimmte ländliche Gemeinschaften, in denen freie Technologie und Low-Tech die lokale Resilienz stärken.",
    approachNumber: "03",
    approachTitle: "UNSERE PHILOSOPHIE",
    approachDesc:
      "Sparsame, angepasste Technologie. Jedes Werkzeug muss lokal reparierbar, energieeffizient und unmittelbar nützlich sein.",

    stats: [
      { value: "5+", label: "Jahre Engagement vor Ort" },
      { value: "3.200+", label: "Ausgebildete Jugendliche & Handwerker" },
      { value: "14", label: "Partnerschulen" },
      { value: "100%", label: "Lokal mitgestaltete Projekte" },
    ],

    valuesEyebrow: "GRUNDPRINZIPIEN",
    valuesTitle: "Unsere 5 Grundwerte",
    valuesSubtitle: "Feste Leitprinzipien für unser tägliches Handeln vor Ort.",
    values: [
      {
        num: "01",
        title: "Gemeinschaftsverankerung",
        desc: "Enge Zusammenarbeit mit Dorfoberhäuptern, Basisgruppen und Familien vor Ort.",
      },
      {
        num: "02",
        title: "Low-Tech & Nachhaltigkeit",
        desc: "Priorisierung von Solarenergie und wiederaufbereiteter Hardware für maximale Autonomie.",
      },
      {
        num: "03",
        title: "Chancengleichheit & Inklusion",
        desc: "Gezielte Förderung von jungen Frauen in MINT-Fächern zur Überwindung von Hürden.",
      },
      {
        num: "04",
        title: "Freies Wissen & Open Source",
        desc: "Förderung freier Software und Open Data gegen technologische Abhängigkeiten.",
      },
      {
        num: "05",
        title: "Integrität & Transparenz",
        desc: "Sorgfältige Finanzführung und öffentlich zugängliche Jahresberichte für volles Vertrauen.",
      },
    ],

    governanceEyebrow: "ORGANISATION",
    governanceTitle: "Governance & Struktur",
    governanceSubtitle: "Demokratische und transparente Vereinsführung nach Verbandsstatut.",
    gov1Title: "Generalversammlung",
    gov1Role: "Souveränes Beschlussorgan",
    gov1Desc: "Jährliches Treffen aller Mitglieder zur Genehmigung der Berichte und strategischen Leitlinien.",
    gov2Title: "Vorstand & Leitung",
    gov2Role: "Operative Umsetzung & Steuerung",
    gov2Desc: "Operatives Team zur Durchführung von Programmen und Betreuung von Freiwilligen vor Ort.",
    gov3Title: "Gemeindebeirat",
    gov3Role: "Lokale Wirkung & Dialog",
    gov3Desc: "Zusammenschluss von Dorfvertretern, Lehrern und Handwerkern zur Qualitätssicherung vor Ort.",

    ctaEyebrow: "MITWIRKEN",
    ctaTitle: "WERDEN SIE TEIL DER INITIATIVE",
    ctaSubtitle: "Ob Mitglied werden, vor Ort als Freiwilliger aktiv sein oder eine Partnerschaft aufbauen — Ihre Unterstützung zählt.",
    ctaMember: "Mitglied werden",
    ctaVolunteer: "Freiwilliger werden",
    ctaPartner: "Partner werden",
  },
}

export default function AboutView({ lang, initialSettings = {} }: AboutViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [settings, setSettings] = React.useState<Record<string, string>>(initialSettings)

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      getSiteSettings("ABOUT").then((res) => {
        if (res.success && res.dict) {
          setSettings((prev) => ({ ...prev, ...res.dict }))
        }
      }).catch(console.error)
    })
  }, [])

  const storyImage = settings["about_story_image"] || "/photo-recit-documentaire.jpg"
  const storyLocationTag = settings["about_story_tag"] || "Ancrage communautaire"
  const storyLocationText = settings["about_story_location"] || "Agbélouvé, Région Maritime"
  const foundationYear = settings["foundation_year"] || "2018"
  const formalizationYear = settings["formalization_year"] || "2020"

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} setLang={handleSetLang} currentPage="about" navigate={navigate} />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* ── 1. Editorial Hero (#FFFFFF) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
              <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
                {t.eyebrow}
              </span>
            </div>
            
            <h1 
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] whitespace-pre-line"
              style={{ color: BLUE }}
            >
              {t.title}
            </h1>
            
            <p 
              className="text-base sm:text-xl max-w-3xl leading-relaxed"
              style={{ color: TEXT_MUTED }}
            >
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Notre Histoire (Narrative + Large Field Photo on #F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24" style={{ backgroundColor: BG_SURFACE }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Narrative */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-[#003366] tracking-widest uppercase">
                    {t.storyEyebrow}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-[#28A745]">
                    {t.storyTimeline(foundationYear)}
                  </span>
                </div>

                <h2 
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight"
                  style={{ color: BLUE }}
                >
                  {t.storyHeadline}
                </h2>

                <div className="space-y-4 text-base sm:text-lg leading-relaxed mb-8" style={{ color: TEXT_MUTED }}>
                  <p>{t.storyP1(foundationYear)}</p>
                  <p>{t.storyP2}</p>
                  <p className="font-medium text-[#16324A]">{t.storyP3}</p>
                </div>

                {/* Timeline Summary Line (2018 Création / 2020 Formalisation / Aujourd'hui) */}
                <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#003366]">{foundationYear}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{t.storyOriginLabel}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#003366]">{formalizationYear}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{t.storyFormalLabel}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#003366]">{t.storyNowYear}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{t.storyNowLabel}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: High Quality Field Photo */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/5] bg-white">
                  <img 
                    src={storyImage} 
                    alt="Action de terrain APTIC-R à Agbélouvé" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/85 via-[#003366]/20 to-transparent flex flex-col justify-end p-6">
                    <div className="text-white/90 text-xs uppercase tracking-wider font-semibold">
                      {storyLocationTag}
                    </div>
                    <div className="text-white text-lg font-bold">
                      {storyLocationText}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Mission · Vision · Philosophie (3 Editorial Columns on #FFFFFF) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <span className="text-xs font-bold text-[#28A745] tracking-widest uppercase block mb-2">
                {t.pillarsEyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003366]">
                {t.pillarsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {/* Mission */}
              <div className="flex flex-col border-t-2 border-[#003366] pt-6">
                <span className="text-3xl font-black text-slate-300 mb-4">{t.missionNumber}</span>
                <h3 className="text-xl font-bold text-[#003366] mb-3">
                  {t.missionTitle}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed">
                  {t.missionDesc}
                </p>
              </div>

              {/* Vision */}
              <div className="flex flex-col border-t-2 border-[#003366] pt-6">
                <span className="text-3xl font-black text-slate-300 mb-4">{t.visionNumber}</span>
                <h3 className="text-xl font-bold text-[#003366] mb-3">
                  {t.visionTitle}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed">
                  {t.visionDesc}
                </p>
              </div>

              {/* Philosophy */}
              <div className="flex flex-col border-t-2 border-[#003366] pt-6">
                <span className="text-3xl font-black text-slate-300 mb-4">{t.approachNumber}</span>
                <h3 className="text-xl font-bold text-[#003366] mb-3">
                  {t.approachTitle}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed">
                  {t.approachDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Chiffres Clés (Institutional #003366 Band, White Numbers) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 text-white" style={{ backgroundColor: BLUE }}>
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {t.stats.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                  {s.value}
                </div>
                <div className="w-6 h-0.5 bg-[#28A745] mb-3" />
                <div className="text-xs sm:text-sm text-white/80 font-medium max-w-[200px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Nos 5 Valeurs Cardinales (Editorial Wide Horizontal Layout on #FFFFFF) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold text-[#28A745] tracking-widest uppercase block mb-2">
                {t.valuesEyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003366] mb-3">
                {t.valuesTitle}
              </h2>
              <p className="text-[#5E6B76] text-base sm:text-lg">
                {t.valuesSubtitle}
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {t.values.map((v, idx) => (
                <div 
                  key={idx} 
                  className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start group"
                >
                  <div className="md:col-span-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#003366]/30 group-hover:text-[#007BFF] transition-colors">
                      {v.num}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#003366] uppercase tracking-wide leading-tight">
                      {v.title}
                    </h3>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-base text-[#5E6B76] leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Gouvernance & Structure (Compact Schema on #F7F8FA) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-slate-200/80" style={{ backgroundColor: BG_SURFACE }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#28A745] tracking-widest uppercase block mb-2">
                {t.governanceEyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#003366] mb-2">
                {t.governanceTitle}
              </h2>
              <p className="text-[#5E6B76] text-sm sm:text-base">
                {t.governanceSubtitle}
              </p>
            </div>

            {/* Compact Hierarchical Flow */}
            <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
              
              {/* Block 1: Assemblée Générale */}
              <div className="w-full bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#28A745] block mb-0.5">
                  {t.gov1Role}
                </span>
                <h3 className="text-lg font-extrabold text-[#003366] mb-1.5">
                  {t.gov1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6B76] max-w-lg mx-auto leading-relaxed">
                  {t.gov1Desc}
                </p>
              </div>

              {/* Connecting arrow */}
              <div className="text-[#003366] text-sm font-bold opacity-60 leading-none py-1">
                ↓
              </div>

              {/* Block 2: Bureau Exécutif & Direction */}
              <div className="w-full bg-white rounded-xl p-5 sm:p-6 border-2 border-[#003366]/20 shadow-2xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#007BFF] block mb-0.5">
                  {t.gov2Role}
                </span>
                <h3 className="text-lg font-extrabold text-[#003366] mb-1.5">
                  {t.gov2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6B76] max-w-lg mx-auto leading-relaxed">
                  {t.gov2Desc}
                </p>
              </div>

              {/* Connecting arrow */}
              <div className="text-[#003366] text-sm font-bold opacity-60 leading-none py-1">
                ↓
              </div>

              {/* Block 3: Comité Consultatif Communautaire */}
              <div className="w-full bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#28A745] block mb-0.5">
                  {t.gov3Role}
                </span>
                <h3 className="text-lg font-extrabold text-[#003366] mb-1.5">
                  {t.gov3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E6B76] max-w-lg mx-auto leading-relaxed">
                  {t.gov3Desc}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. Full-Width Generous CTA on #FFFFFF ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs sm:text-sm font-bold text-[#28A745] tracking-widest uppercase block mb-3">
              {t.ctaEyebrow}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#003366] mb-4 tracking-tight leading-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-[#5E6B76] text-base sm:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
              {t.ctaSubtitle}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                href={getPageUrl("membership", lang)}
                className="px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-[#003366] text-white hover:bg-[#002244] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {t.ctaMember}
              </Link>
              <Link
                href={getPageUrl("apply", lang)}
                className="px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-[#007BFF] text-white hover:bg-[#0060c8] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {t.ctaVolunteer}
              </Link>
              <Link
                href={getPageUrl("partner", lang)}
                className="px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-slate-100 text-[#003366] hover:bg-slate-200 transition-all border border-slate-300"
              >
                {t.ctaPartner}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
