"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import RequiredAsterisk from "@/components/RequiredAsterisk"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import { submitMemberApplication, getSiteSettings } from "@/lib/cms-actions"
import {
  ArrowRightIcon,
  MonitorIcon,
  GraduationCapIcon,
  ShieldIcon,
  WheatIcon,
  BarChartIcon,
  CpuIcon,
} from "@/components/Icons"

interface MembershipViewProps {
  lang: Language
}

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const BG_PAGE = "#F7F8FA"
const BLUE_INSTITUTIONAL = "#003366"
const BLUE_TECH = "#007BFF"
const GREEN_ACCENT = "#28A745"

// ─── Editorial Content & Translations ──────────────────────────────────────────
const CONTENT = {
  FR: {
    hero: {
      badge: "ADHÉSION & ENGAGEMENT",
      title: "Rejoignez la communauté APTIC-R",
      desc: "Participez à une communauté engagée pour mettre le numérique, les compétences et l'innovation au service des territoires ruraux.",
      cta: "DEVENIR MEMBRE",
    },
    why: {
      tag: "POURQUOI DEVENIR MEMBRE ?",
      title: "Quatre façons d'avoir un impact réel",
      subtitle: "L'adhésion à APTIC-R vous ouvre les portes d'un engagement concret, démocratique et porteur de sens.",
      items: [
        {
          num: "01",
          title: "PARTICIPER",
          desc: "Participer aux décisions et à la vie associative.",
        },
        {
          num: "02",
          title: "CO-CONSTRUIRE",
          desc: "Concevoir et animer des projets concrets.",
        },
        {
          num: "03",
          title: "INTÉGRER LE RÉSEAU",
          desc: "Rejoindre une communauté pluridisciplinaire.",
        },
        {
          num: "04",
          title: "ACCÉDER AUX OPPORTUNITÉS",
          desc: "Participer aux activités, formations et projets.",
        },
      ],
    },
    contribute: {
      tag: "MODES D'ENGAGEMENT",
      title: "Comment souhaitez-vous contribuer ?",
      subtitle: "Chaque membre s'investit selon ses aspirations, son rythme et ses compétences.",
      items: [
        {
          title: "Participer aux activités",
          desc: "Prendre part aux ateliers de sensibilisation, aux événements communautaires et aux Assemblées Générales.",
        },
        {
          title: "Apporter votre expertise",
          desc: "Mettre vos compétences (tech, agronomie, gestion, droit, communication) au service des initiatives de terrain.",
        },
        {
          title: "Former et accompagner",
          desc: "Transmettre vos connaissances auprès des jeunes, des femmes et des porteurs de projets locaux.",
        },
        {
          title: "Contribuer aux projets",
          desc: "S'impliquer dans la conception et le déploiement de solutions numériques, solaires ou Low-Tech.",
        },
        {
          title: "Mobiliser des partenaires",
          desc: "Développer notre réseau d'alliances, de mécénat et de coopérations nationales ou internationales.",
        },
        {
          title: "Soutenir matériellement ou financièrement",
          desc: "Faire un don, fournir des équipements informatiques ou apporter un soutien matériel.",
        },
      ],
    },
    who: {
      tag: "PROFILS & ÉLIGIBILITÉ",
      title: "Qui peut rejoindre APTIC-R ?",
      text: "Étudiants, professionnels, entrepreneurs, enseignants, bénévoles, acteurs communautaires et toute personne partageant les valeurs de l'APTIC-R peuvent s'impliquer selon les modalités définies par l'association.",
      subtext: "Aucun prérequis technique n'est exigé : c'est avant tout l'adhésion aux valeurs de solidarité et de développement rural qui rassemble notre communauté.",
      badges: ["Étudiants & Chercheurs", "Professionnels & Experts", "Makers & Bénévoles", "Acteurs communautaires", "Citoyens engagés"],
    },
    ctaBanner: {
      tag: "PASSEZ À L'ACTION",
      title: "Prêt à nous rejoindre ?",
      desc: "Rejoignez un collectif dynamique et contribuez concrètement à l'émancipation des communautés rurales au Togo.",
      btn: "DEVENIR MEMBRE",
    },
    form: {
      tag: "ENGAGEMENT",
      title: "Formulaire d'adhésion",
      desc: "Remplissez les informations ci-dessous pour nous transmettre votre demande d'adhésion.",
      sec1: "1. IDENTITÉ & COORDONNÉES",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      country: "Pays",
      city: "Ville",
      profession: "Profession",
      org: "Organisation",
      sec2: "2. DOMAINES D'INTÉRÊT",
      sec2Desc: "Sélectionnez les domaines d'action dans lesquels vous souhaitez vous impliquer :",
      sec3: "3. CONTRIBUTION & DISPONIBILITÉ",
      contribLabel: "Type de contribution souhaité",
      contribOptions: {
        COMPETENCES: "Apport d'expertise technique, pédagogique ou scientifique",
        VOLONTARIAT: "Bénévolat de terrain ou accompagnement direct",
        RESEAU: "Mise en réseau, partenariats et plaidoyer",
        FINANCIER: "Soutien financier / cotisation membre bienfaiteur",
        AUTRE: "Autre forme d'implication",
      },
      availLabel: "Disponibilité estimée",
      availOptions: {
        HEBDOMADAIRE: "Régulière (quelques heures par semaine)",
        MENSUEL: "Mensuelle (quelques jours par mois)",
        PONCTUEL: "Ponctuelle (lors d'événements, ateliers ou sprints)",
        TEMPS_PLEIN: "Temps plein (mission dédiée)",
      },
      sec4: "4. MOTIVATION",
      motivationLabel: "Expliquez vos motivations pour rejoindre APTIC-R",
      motivationPlaceholder: "Partagez vos motivations, vos compétences clés et vos idées de projets (au moins 30 caractères)...",
      charteConsent: "Je m'engage à respecter les statuts, le règlement intérieur et la charte éthique d'APTIC-R.",
      dataConsent: "J'accepte que mes données personnelles soient traitées par APTIC-R aux fins de gestion de mon adhésion.",
      submitBtn: "Envoyer",
      submitting: "Envoi en cours...",
      successTitle: "Demande d'adhésion enregistrée !",
      successDesc: "Merci pour votre engagement. Votre demande a bien été transmise.",
      referenceLabel: "Numéro de référence",
      successNext: "Notre Bureau Exécutif prendra contact avec vous par e-mail pour finaliser votre intégration.",
      homeBtn: "RETOUR À L'ACCUEIL",
    },
  },

  EN: {
    hero: {
      badge: "MEMBERSHIP & ENGAGEMENT",
      title: "Join the APTIC-R Community",
      desc: "Be part of a dedicated community empowering rural territories through digital technology, skills, and innovation.",
      cta: "BECOME A MEMBER",
    },
    why: {
      tag: "WHY BECOME A MEMBER?",
      title: "Four ways to create lasting impact",
      subtitle: "Joining APTIC-R opens the door to meaningful and community-driven action.",
      items: [
        {
          num: "01",
          title: "PARTICIPATE",
          desc: "Take part in decisions and associative life.",
        },
        {
          num: "02",
          title: "CO-BUILD",
          desc: "Design and lead practical community projects.",
        },
        {
          num: "03",
          title: "CONNECT",
          desc: "Join a multidisciplinary network.",
        },
        {
          num: "04",
          title: "ACCESS OPPORTUNITIES",
          desc: "Participate in activities, trainings, and projects.",
        },
      ],
    },
    contribute: {
      tag: "MODES OF CONTRIBUTION",
      title: "How would you like to contribute?",
      subtitle: "Each member contributes according to their personal aspirations, schedule, and skills.",
      items: [
        {
          title: "Participate in activities",
          desc: "Join outreach sessions, community workshops, and General Assemblies.",
        },
        {
          title: "Share your expertise",
          desc: "Lend technical, agronomic, legal, managerial, or communication skills to field projects.",
        },
        {
          title: "Train and mentor",
          desc: "Pass on practical knowledge to local youth, women cooperatives, and community leaders.",
        },
        {
          title: "Contribute to projects",
          desc: "Engage in designing and rolling out digital, solar, or Low-Tech community solutions.",
        },
        {
          title: "Mobilize partners",
          desc: "Expand our institutional network, advocacy initiatives, and funding alliances.",
        },
        {
          title: "Provide material or financial support",
          desc: "Donate refurbished equipment or provide financial support.",
        },
      ],
    },
    who: {
      tag: "PROFILES & ELIGIBILITY",
      title: "Who can join APTIC-R?",
      text: "Students, professionals, entrepreneurs, educators, volunteers, community actors, and anyone sharing the values of APTIC-R can get involved according to associative modalities.",
      subtext: "No technical prerequisites required: what unites us is a shared commitment to rural empowerment.",
      badges: ["Students & Researchers", "Professionals & Experts", "Makers & Volunteers", "Community Actors", "Engaged Citizens"],
    },
    ctaBanner: {
      tag: "TAKE ACTION",
      title: "Ready to join us?",
      desc: "Join a dynamic collective and actively contribute to rural community autonomy in Togo.",
      btn: "BECOME A MEMBER",
    },
    form: {
      tag: "APPLICATION",
      title: "Membership Application Form",
      desc: "Fill in the details below to submit your membership request.",
      sec1: "1. IDENTITY & CONTACT DETAILS",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      country: "Country",
      city: "City",
      profession: "Profession",
      org: "Organization",
      sec2: "2. FIELDS OF INTEREST",
      sec2Desc: "Select the areas of action you would like to be involved in:",
      sec3: "3. CONTRIBUTION & AVAILABILITY",
      contribLabel: "Preferred contribution type",
      contribOptions: {
        COMPETENCES: "Technical, pedagogical, or scientific expertise",
        VOLONTARIAT: "Field volunteering and local support",
        RESEAU: "Networking, advocacy, and partnerships",
        FINANCIER: "Financial support / patron membership",
        AUTRE: "Other form of involvement",
      },
      availLabel: "Estimated availability",
      availOptions: {
        HEBDOMADAIRE: "Regular (a few hours per week)",
        MENSUEL: "Monthly (a few days per month)",
        PONCTUEL: "Occasional (during specific events or sprints)",
        TEMPS_PLEIN: "Full-time (dedicated mission)",
      },
      sec4: "4. MOTIVATION",
      motivationLabel: "Explain your motivations for joining APTIC-R",
      motivationPlaceholder: "Share your motivations, key skills, and project ideas (at least 30 characters)...",
      charteConsent: "I agree to uphold the statutes, bylaws, and ethical charter of APTIC-R.",
      dataConsent: "I agree to have my personal data processed by APTIC-R for membership administration.",
      submitBtn: "Send",
      submitting: "Sending...",
      successTitle: "Application Submitted!",
      successDesc: "Thank you for your commitment. Your application has been successfully forwarded.",
      referenceLabel: "Reference Number",
      successNext: "Our Executive Board will review your application and contact you via email to complete your onboarding.",
      homeBtn: "BACK TO HOME",
    },
  },

  DE: {
    hero: {
      badge: "MITGLIEDSCHAFT & ENGAGEMENT",
      title: "Werden Sie Teil der APTIC-R Gemeinschaft",
      desc: "Beteiligen Sie sich an einer engagierten Gemeinschaft, die digitale Technologien, Kompetenzen und Innovation in den Dienst ländlicher Räume stellt.",
      cta: "MITGLIED WERDEN",
    },
    why: {
      tag: "WARUM MITGLIED WERDEN?",
      title: "Vier Wege, konkrete Wirkung zu erzielen",
      subtitle: "Die Mitgliedschaft bei APTIC-R eröffnet Ihnen konkrete und sinnstiftende Mitgestaltungsmöglichkeiten.",
      items: [
        {
          num: "01",
          title: "MITBESTIMMEN",
          desc: "Beteiligung an Entscheidungen und am Vereinsleben.",
        },
        {
          num: "02",
          title: "GEMEINSAM GESTALTEN",
          desc: "Konzeption und Begleitung konkreter Projekte.",
        },
        {
          num: "03",
          title: "NETZWERK NUTZEN",
          desc: "Austausch in einem interdisziplinären Netzwerk.",
        },
        {
          num: "04",
          title: "CHANCEN NUTZEN",
          desc: "Teilnahme an Aktivitäten, Schulungen und Projekten.",
        },
      ],
    },
    contribute: {
      tag: "BEITRAGSFORMEN",
      title: "Wie möchten Sie sich einbringen?",
      subtitle: "Jedes Mitglied engagiert sich nach eigenen Interessen, Zeitressourcen und Fähigkeiten.",
      items: [
        {
          title: "An Aktivitäten teilnehmen",
          desc: "Teilnahme an Workshops, Vereinsveranstaltungen und Versammlungen.",
        },
        {
          title: "Fachwissen einbringen",
          desc: "Bereitstellung von Expertise (IT, Agronomie, Recht, Kommunikation) für Initiativen.",
        },
        {
          title: "Schulen und begleiten",
          desc: "Wissensvermittlung an Jugendliche, Frauenkooperativen und lokale Projektträger.",
        },
        {
          title: "Projekte vorantreiben",
          desc: "Mitwirkung an der Entwicklung und Umsetzung von Digital- und Low-Tech-Lösungen.",
        },
        {
          title: "Partner mobilisieren",
          desc: "Ausbau unseres Netzwerks an Partnerschaften, Förderern und Kooperationen.",
        },
        {
          title: "Materiell oder finanziell unterstützen",
          desc: "Spenden, Bereitstellung von Geräten oder materielle Unterstützung.",
        },
      ],
    },
    who: {
      tag: "PROFILE & ZUGANG",
      title: "Wer kann APTIC-R beitreten?",
      text: "Studierende, Fachkräfte, Unternehmer, Lehrkräfte, Freiwillige, Gemeinschaftsakteure und alle, die die Werte von APTIC-R teilen, können sich engagieren.",
      subtext: "Keine technischen Vorkenntnisse erforderlich: Entscheidend ist die Begeisterung für nachhaltige ländliche Entwicklung.",
      badges: ["Studierende & Forschende", "Fachkräfte & Experten", "Macher & Freiwillige", "Akteure vor Ort", "Engagierte Bürger"],
    },
    ctaBanner: {
      tag: "JETZT MITMACHEN",
      title: "Bereit für Ihr Engagement?",
      desc: "Schließen Sie sich einer dynamischen Gemeinschaft an und stärken Sie ländliche Regionen in Togo.",
      btn: "MITGLIED WERDEN",
    },
    form: {
      tag: "ANTRAG",
      title: "Mitgliedsantrag",
      desc: "Füllen Sie das Formular aus, um Ihren Mitgliedsantrag einzureichen.",
      sec1: "1. PERSÖNLICHE ANGABEN",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      phone: "Telefon",
      country: "Land",
      city: "Stadt",
      profession: "Beruf",
      org: "Organisation",
      sec2: "2. INTERESSENSGEBIETE",
      sec2Desc: "Wählen Sie die Aktionsfelder aus, in denen Sie mitwirken möchten:",
      sec3: "3. BEITRAG & VERFÜGBARKEIT",
      contribLabel: "Wie möchten Sie sich primär einbringen?",
      contribOptions: {
        COMPETENCES: "Fachliche, pädagogische oder wissenschaftliche Expertise",
        VOLONTARIAT: "Freiwilligenarbeit vor Ort und direkte Begleitung",
        RESEAU: "Netzwerkaufbau, Kooperationen und Fürsprache",
        FINANCIER: "Finanzielle Unterstützung / Fördermitgliedschaft",
        AUTRE: "Sonstige Form der Mitwirkung",
      },
      availLabel: "Geschätzte zeitliche Verfügbarkeit",
      availOptions: {
        HEBDOMADAIRE: "Regelmäßig (einige Stunden pro Woche)",
        MENSUEL: "Monatlich (einige Tage pro Monat)",
        PONCTUEL: "Projektbezogen (bei konkreten Aktionen)",
        TEMPS_PLEIN: "Vollzeit (vollständige Mission)",
      },
      sec4: "4. MOTIVATION",
      motivationLabel: "Ihre Motivation für APTIC-R",
      motivationPlaceholder: "Beschreiben Sie Ihre Beweggründe, Kompetenzen und Ideen (mind. 30 Zeichen)...",
      charteConsent: "Ich erkenne die Satzung, Geschäftsordnung und ethische Charta von APTIC-R an.",
      dataConsent: "Ich willige in die Verarbeitung meiner Daten zur Mitgliederverwaltung ein.",
      submitBtn: "Absenden",
      submitting: "Wird gesendet...",
      successTitle: "Antrag erfolgreich eingegangen!",
      successDesc: "Vielen Dank für Ihr Engagement. Ihr Antrag wurde an unser Team übermittelt.",
      referenceLabel: "Referenznummer",
      successNext: "Der Vorstand wird Ihren Antrag prüfen und sich per E-Mail bei Ihnen melden.",
      homeBtn: "ZUR STARTSEITE",
    },
  },
} as const

// ─── Domains with Icons ────────────────────────────────────────────────────────
const DOMAINS_DATA = [
  { id: "inclusion-numerique", labelFr: "Inclusion numérique & alphabétisation", labelEn: "Digital inclusion & literacy", labelDe: "Digitale Inklusion & Alphabetisierung", icon: MonitorIcon },
  { id: "jeunesse-education", labelFr: "Jeunesse, éducation & compétences d'avenir", labelEn: "Youth, education & future skills", labelDe: "Jugend, Bildung & Zukunftskompetenzen", icon: GraduationCapIcon },
  { id: "cybersecurite-hygiene", labelFr: "Cybersécurité & citoyenneté numérique", labelEn: "Cybersecurity & digital citizenship", labelDe: "Cybersicherheit & digitale Bürgerschaft", icon: ShieldIcon },
  { id: "agri-lowtech", labelFr: "Agriculture durable, écologie & Low-Tech", labelEn: "Sustainable agriculture, ecology & Low-Tech", labelDe: "Nachhaltige Landwirtschaft & Low-Tech", icon: WheatIcon },
  { id: "data-innovation", labelFr: "Données ouvertes & innovation citoyenne", labelEn: "Open data & civic innovation", labelDe: "Offene Daten & Bürgerinnovation", icon: BarChartIcon },
  { id: "dev-rural-fablabs", labelFr: "Développement rural & FabLabs communautaires", labelEn: "Rural development & community FabLabs", labelDe: "Ländliche Entwicklung & FabLabs", icon: CpuIcon },
]

// ─── Small Badge Component ─────────────────────────────────────────────────────
function SectionBadge({ text, centered = false }: { text: string; centered?: boolean }) {
  return (
    <div className={`flex items-center gap-2 mb-4 ${centered ? "justify-center" : ""}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path d="M4 11H8 M6 11V5 M6 5L2.5 2 M6 5L9.5 2" stroke={GREEN_ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#003366]">
        {text}
      </span>
    </div>
  )
}

// ─── Main Membership View ──────────────────────────────────────────────────────
export default function MembershipView({ lang }: MembershipViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const safeLang = (lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const langLower = (lang || "fr").toLowerCase()
  const c = CONTENT[safeLang] || CONTENT.FR

  const [settings, setSettings] = useState<Record<string, string>>({})
  const [dbDomains, setDbDomains] = useState<any[]>([])

  useEffect(() => {
    Promise.all([getSiteSettings("MEMBERSHIP"), getSiteSettings("GENERAL")])
      .then(([resMbr, resGen]) => {
        const merged: Record<string, string> = {}
        if (resMbr.success && resMbr.dict) Object.assign(merged, resMbr.dict)
        if (resGen.success && resGen.dict) Object.assign(merged, resGen.dict)
        setSettings((prev) => ({ ...prev, ...merged }))
      })
      .catch((err) => {
        console.error("Error fetching membership settings:", err)
      })
  }, [])

  // 1. Hero
  const heroBadge = settings[`membership_hero_badge_${langLower}`] || c.hero.badge
  const heroTitle = settings[`membership_hero_title_${langLower}`] || c.hero.title
  const heroDesc = settings[`membership_hero_desc_${langLower}`] || c.hero.desc
  const heroCta = settings[`membership_hero_cta_${langLower}`] || c.hero.cta

  // 2. Why (dynamique, responsive aux cartes réellement présentes)
  const whyTag = settings[`membership_why_tag_${langLower}`] || c.why.tag
  const whyTitle = settings[`membership_why_title_${langLower}`] || c.why.title
  const whySubtitle = settings[`membership_why_subtitle_${langLower}`] || c.why.subtitle

  const rawWhyItems = [
    {
      title: settings[`membership_why_card1_title_${langLower}`] || c.why.items[0]?.title || "",
      desc: settings[`membership_why_card1_desc_${langLower}`] || c.why.items[0]?.desc || "",
    },
    {
      title: settings[`membership_why_card2_title_${langLower}`] || c.why.items[1]?.title || "",
      desc: settings[`membership_why_card2_desc_${langLower}`] || c.why.items[1]?.desc || "",
    },
    {
      title: settings[`membership_why_card3_title_${langLower}`] || c.why.items[2]?.title || "",
      desc: settings[`membership_why_card3_desc_${langLower}`] || c.why.items[2]?.desc || "",
    },
    {
      title: settings[`membership_why_card4_title_${langLower}`] || c.why.items[3]?.title || "",
      desc: settings[`membership_why_card4_desc_${langLower}`] || c.why.items[3]?.desc || "",
    },
  ]
  const whyItems = rawWhyItems
    .filter((item) => item.title.trim().length > 0 || item.desc.trim().length > 0)
    .map((item, idx) => ({
      ...item,
      num: String(idx + 1).padStart(2, "0"),
    }))

  // 3. Contribute (dynamique)
  const contributeTag = settings[`membership_contribute_tag_${langLower}`] || c.contribute.tag
  const contributeTitle = settings[`membership_contribute_title_${langLower}`] || c.contribute.title
  const contributeSubtitle = settings[`membership_contribute_subtitle_${langLower}`] || c.contribute.subtitle

  const rawContributeItems = [
    {
      title: settings[`membership_contribute_item1_title_${langLower}`] || c.contribute.items[0]?.title || "",
      desc: settings[`membership_contribute_item1_desc_${langLower}`] || c.contribute.items[0]?.desc || "",
    },
    {
      title: settings[`membership_contribute_item2_title_${langLower}`] || c.contribute.items[1]?.title || "",
      desc: settings[`membership_contribute_item2_desc_${langLower}`] || c.contribute.items[1]?.desc || "",
    },
    {
      title: settings[`membership_contribute_item3_title_${langLower}`] || c.contribute.items[2]?.title || "",
      desc: settings[`membership_contribute_item3_desc_${langLower}`] || c.contribute.items[2]?.desc || "",
    },
    {
      title: settings[`membership_contribute_item4_title_${langLower}`] || c.contribute.items[3]?.title || "",
      desc: settings[`membership_contribute_item4_desc_${langLower}`] || c.contribute.items[3]?.desc || "",
    },
    {
      title: settings[`membership_contribute_item5_title_${langLower}`] || c.contribute.items[4]?.title || "",
      desc: settings[`membership_contribute_item5_desc_${langLower}`] || c.contribute.items[4]?.desc || "",
    },
    {
      title: settings[`membership_contribute_item6_title_${langLower}`] || c.contribute.items[5]?.title || "",
      desc: settings[`membership_contribute_item6_desc_${langLower}`] || c.contribute.items[5]?.desc || "",
    },
  ]
  const contributeItems = rawContributeItems.filter(
    (item) => item.title.trim().length > 0 || item.desc.trim().length > 0
  )

  // 4. Who
  const whoTag = settings[`membership_who_tag_${langLower}`] || c.who.tag
  const whoTitle = settings[`membership_who_title_${langLower}`] || c.who.title
  const whoText = settings[`membership_who_text_${langLower}`] || c.who.text
  const whoSubtext = settings[`membership_who_subtext_${langLower}`] || c.who.subtext
  const whoBadgesRaw = settings[`membership_who_badges_${langLower}`]
  const whoBadges = whoBadgesRaw
    ? whoBadgesRaw.split(",").map((b) => b.trim()).filter(Boolean)
    : c.who.badges

  // 5. CTA
  const ctaTag = settings[`membership_cta_tag_${langLower}`] || c.ctaBanner.tag
  const ctaTitle = settings[`membership_cta_title_${langLower}`] || c.ctaBanner.title
  const ctaDesc = settings[`membership_cta_desc_${langLower}`] || c.ctaBanner.desc
  const ctaBtn = settings[`membership_cta_btn_${langLower}`] || c.ctaBanner.btn

  // 6. Form
  const formTag = settings[`membership_form_tag_${langLower}`] || c.form.tag
  const formTitle = settings[`membership_form_title_${langLower}`] || c.form.title
  const formDesc = settings[`membership_form_desc_${langLower}`] || c.form.desc

  useEffect(() => {
    import("@/lib/cms-actions").then(({ getDomaines }) => {
      getDomaines({ activeOnly: true })
        .then((res) => {
          if (res && res.length > 0) {
            setDbDomains(res)
          }
        })
        .catch(console.error)
    })
  }, [])

  const availableDomains = React.useMemo(() => {
    if (dbDomains.length > 0) {
      return dbDomains.map((d) => {
        const label =
          safeLang === "DE"
            ? d.nameDe || d.nameFr
            : safeLang === "EN"
            ? d.nameEn || d.nameFr
            : d.nameFr

        let IconComp = MonitorIcon
        if (d.icon === "GraduationCapIcon" || d.code === "JEUNESSE") IconComp = GraduationCapIcon
        else if (d.icon === "ShieldIcon" || d.code === "CYBERSECURITE") IconComp = ShieldIcon
        else if (d.icon === "WheatIcon" || d.code === "AGRI_LOWTECH") IconComp = WheatIcon
        else if (d.icon === "BarChartIcon" || d.code === "DATA_INNOVATION") IconComp = BarChartIcon
        else if (d.icon === "CpuIcon" || d.code === "DEV_RURAL") IconComp = CpuIcon

        return {
          id: d.slug,
          code: d.code,
          label,
          icon: IconComp,
        }
      })
    }

    return DOMAINS_DATA.map((d) => ({
      id: d.id,
      code: d.id,
      label: safeLang === "DE" ? d.labelDe : safeLang === "EN" ? d.labelEn : d.labelFr,
      icon: d.icon,
    }))
  }, [dbDomains, safeLang])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const scrollToForm = () => {
    const el = document.getElementById("formulaire-adhesion")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // ── Form State ──
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    organization: "",
    country: safeLang === "DE" ? "Deutschland" : safeLang === "EN" ? "Togo" : "Togo",
    city: "",
    domainsOfInterest: ["inclusion-numerique"] as string[],
    contributionType: "COMPETENCES",
    customContributionType: "",
    availability: "HEBDOMADAIRE",
    motivation: "",
    charteConsent: false,
    consentData: false,
  })

  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE")
  const [errorMessage, setErrorMessage] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")

  const toggleDomain = (id: string) => {
    setFormData((prev) => {
      const exists = prev.domainsOfInterest.includes(id)
      if (exists) {
        if (prev.domainsOfInterest.length === 1) return prev
        return { ...prev, domainsOfInterest: prev.domainsOfInterest.filter((d) => d !== id) }
      } else {
        return { ...prev, domainsOfInterest: [...prev.domainsOfInterest, id] }
      }
    })
  }

  // Validation: Check that every required field is filled
  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.email.includes("@") &&
    formData.country.trim().length > 0 &&
    formData.domainsOfInterest.length > 0 &&
    formData.motivation.trim().length >= 10 &&
    formData.charteConsent &&
    formData.consentData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || status === "SUBMITTING") return

    setStatus("SUBMITTING")
    setErrorMessage("")

    try {
      const res = await submitMemberApplication({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        profession: formData.profession || null,
        organization: formData.organization || null,
        country: formData.country,
        city: formData.city || null,
        domainsOfInterest: formData.domainsOfInterest,
        contributionType:
          formData.contributionType === "AUTRE" && formData.customContributionType.trim()
            ? `Autre : ${formData.customContributionType.trim()}`
            : formData.contributionType,
        availability: formData.availability,
        motivation: formData.motivation,
        consentData: formData.consentData,
      })

      if (res.success && res.referenceNumber) {
        setReferenceNumber(res.referenceNumber)
        setStatus("SUCCESS")
        setTimeout(() => {
          document.getElementById("formulaire-adhesion")?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } else {
        setStatus("ERROR")
        setErrorMessage(res.error || "Une erreur est survenue lors de l'enregistrement.")
      }
    } catch (err: any) {
      setStatus("ERROR")
      setErrorMessage(err.message || "Erreur réseau.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG_PAGE }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="membership" navigate={navigate} />

      <main className="flex-1">
        {/* ═════════════════════════════════════════════════════════════════════════
            01. HERO (Élégant, institutionnel & compact)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 bg-[#003366] text-white pt-36 pb-20 sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-white/[0.07] via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#007BFF]/10 blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-[0.18em] text-[#28A745] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#28A745]" />
              <span>{heroBadge}</span>
            </div>

            {/* H1 Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['DM_Serif_Display'] leading-[1.12] mb-6 tracking-tight">
              {heroTitle}
            </h1>

            {/* Lead text */}
            <p className="text-base sm:text-lg lg:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              {heroDesc}
            </p>

            {/* Main CTA */}
            <div>
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-xl text-white transition-all shadow-lg hover:scale-105 cursor-pointer bg-[#007BFF] hover:bg-[#0069d9]"
              >
                <span>{heroCta}</span>
                <ArrowRightIcon size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            02. POURQUOI DEVENIR MEMBRE ? (Blocs éditoriaux numérotés dynamiques)
        ═════════════════════════════════════════════════════════════════════════ */}
        {whyItems.length > 0 && (
          <section className="py-20 sm:py-24 lg:py-28 bg-[#FFFFFF]">
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="text-center mb-14 sm:mb-18">
                <SectionBadge text={whyTag} centered />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em] font-['DM_Serif_Display'] font-normal">
                  {whyTitle}
                </h2>
                <p className="text-base sm:text-lg text-[#5E6B76] max-w-xl mx-auto mt-3 font-medium">
                  {whySubtitle}
                </p>
              </div>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  whyItems.length === 3
                    ? "lg:grid-cols-3"
                    : whyItems.length === 2
                    ? "lg:grid-cols-2"
                    : "lg:grid-cols-4"
                } gap-6`}
              >
                {whyItems.map((item) => (
                  <div
                    key={item.num}
                    className="bg-[#F7F8FA] p-7 rounded-2xl border border-[#EAF0F4] hover:border-[#003366]/20 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-[#28A745] block mb-3">
                        {item.num}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#003366] mb-3 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#5E6B76] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#EAF0F4] flex items-center gap-1.5 text-xs font-bold text-[#007BFF] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>APTIC-R</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            03. COMMENT CONTRIBUER ? (Grande composition éditoriale dynamique)
        ═════════════════════════════════════════════════════════════════════════ */}
        {contributeItems.length > 0 && (
          <section className="py-20 sm:py-24 lg:py-28 bg-[#F7F8FA]">
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="text-center mb-14 sm:mb-18">
                <SectionBadge text={contributeTag} centered />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em] font-['DM_Serif_Display'] font-normal">
                  {contributeTitle}
                </h2>
                <p className="text-base sm:text-lg text-[#5E6B76] max-w-xl mx-auto mt-3 font-medium">
                  {contributeSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contributeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FFFFFF] p-7 rounded-2xl border border-[#EAF0F4] shadow-xs flex flex-col justify-start"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#003366]/5 text-[#003366] font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                        0{idx + 1}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#003366]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#5E6B76] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            04. QUI PEUT REJOINDRE APTIC-R ? (Section éditoriale sobre)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-[#FFFFFF]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <SectionBadge text={whoTag} centered />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em] mb-6 font-['DM_Serif_Display'] font-normal">
              {whoTitle}
            </h2>

            <div className="p-8 sm:p-10 rounded-3xl bg-[#F7F8FA] border border-[#EAF0F4] mb-8 text-left sm:text-center">
              <p className="text-base sm:text-lg text-[#142332] leading-relaxed font-medium mb-4">
                « {whoText} »
              </p>
              <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed">
                {whoSubtext}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {whoBadges.map((b) => (
                <span
                  key={b}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FFFFFF] border border-[#EAF0F4] text-[#003366] shadow-2xs"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            05. PRÊT À NOUS REJOINDRE ? (Bannière CTA intermédiaire)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 relative overflow-hidden flex items-center justify-center min-h-[40vh] bg-[#003366]">
          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center text-white">
            <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#28A745] mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full">
              {ctaTag}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl text-white mb-4 tracking-tight font-['DM_Serif_Display']">
              {ctaTitle}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-8 max-w-xl mx-auto leading-relaxed text-white/85">
              {ctaDesc}
            </p>

            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl text-white transition-all shadow-lg hover:scale-105 cursor-pointer bg-[#007BFF] hover:bg-[#0069d9]"
            >
              <span>{ctaBtn}</span>
              <ArrowRightIcon size={15} strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            06. FORMULAIRE D'ADHÉSION (Grande section institutionnelle structurée)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section id="formulaire-adhesion" className="py-20 sm:py-24 lg:py-28 bg-[#F7F8FA]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            {/* Header de section */}
            <div className="text-center mb-12 sm:mb-16">
              <SectionBadge text={formTag} centered />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em] font-['DM_Serif_Display'] font-normal">
                {formTitle}
              </h2>
              <p className="text-base sm:text-lg text-[#5E6B76] max-w-xl mx-auto mt-3 font-medium">
                {formDesc}
              </p>
            </div>

            {/* Container du formulaire */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#EAF0F4] shadow-sm">
              {status === "SUCCESS" ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-[#28A745]/10 text-[#28A745] text-4xl flex items-center justify-center mx-auto shadow-xs">
                    ✓
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#003366] font-['DM_Serif_Display']">
                    {c.form.successTitle}
                  </h3>
                  <p className="text-[#5E6B76] text-sm sm:text-base max-w-md mx-auto">
                    {c.form.successDesc}
                  </p>

                  <div className="inline-block px-6 py-3 rounded-2xl bg-[#003366]/5 border border-[#003366]/15">
                    <span className="text-xs text-[#003366] font-bold block uppercase tracking-wider mb-1">
                      {c.form.referenceLabel}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#003366] font-mono tracking-wider">
                      {referenceNumber}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5E6B76] max-w-md mx-auto">
                    {c.form.successNext}
                  </p>

                  <div className="pt-4">
                    <Link
                      href={getPageUrl("home", lang)}
                      className="px-8 py-3.5 rounded-xl font-bold bg-[#003366] text-white hover:bg-[#002244] transition-colors shadow-sm text-xs sm:text-sm inline-block"
                    >
                      {c.form.homeBtn}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-12">
                  {status === "ERROR" && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* ── 1. IDENTITÉ & COORDONNÉES ── */}
                  <div className="space-y-6">
                    <div className="border-b border-[#EAF0F4] pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-[#003366] uppercase tracking-wider">
                        {c.form.sec1}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                          <span>{c.form.lastName}</span>
                          <RequiredAsterisk />
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                          <span>{c.form.firstName}</span>
                          <RequiredAsterisk />
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                          <span>{c.form.email}</span>
                          <RequiredAsterisk />
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5">
                          {c.form.phone}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+228 90 00 00 00"
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                          <span>{c.form.country}</span>
                          <RequiredAsterisk />
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5">
                          {c.form.city}
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="ex: Lomé, Tsévié, Paris, Berlin..."
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5">
                          {c.form.profession}
                        </label>
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          placeholder="ex: Développeur, Agronome, Enseignant..."
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5">
                          {c.form.org}
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── 2. DOMAINES D'INTÉRÊT ── */}
                  <div className="space-y-6">
                    <div className="border-b border-[#EAF0F4] pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-[#003366] uppercase tracking-wider">
                        {c.form.sec2}
                      </h3>
                      <p className="text-xs text-[#5E6B76] mt-1">{c.form.sec2Desc}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {availableDomains.map((dom) => {
                        const checked = formData.domainsOfInterest.includes(dom.id)
                        const IconComponent = dom.icon

                        return (
                          <div
                            key={dom.id}
                            onClick={() => toggleDomain(dom.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                              checked
                                ? "bg-[#003366]/5 border-[#003366] text-[#003366] font-semibold shadow-2xs"
                                : "bg-[#F7F8FA] border-[#EAF0F4] text-[#5E6B76] hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                checked ? "bg-[#003366] text-white" : "bg-white text-[#003366] border border-[#EAF0F4]"
                              }`}
                            >
                              <IconComponent size={16} color="currentColor" strokeWidth={2} />
                            </div>
                            <span className="text-xs sm:text-sm">{dom.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── 3. CONTRIBUTION & DISPONIBILITÉ ── */}
                  <div className="space-y-6">
                    <div className="border-b border-[#EAF0F4] pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-[#003366] uppercase tracking-wider">
                        {c.form.sec3}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                          <span>{c.form.contribLabel}</span>
                          <RequiredAsterisk />
                        </label>
                        <select
                          value={formData.contributionType}
                          onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] outline-none text-sm text-[#142332] cursor-pointer"
                        >
                          <option value="COMPETENCES">{c.form.contribOptions.COMPETENCES}</option>
                          <option value="VOLONTARIAT">{c.form.contribOptions.VOLONTARIAT}</option>
                          <option value="RESEAU">{c.form.contribOptions.RESEAU}</option>
                          <option value="FINANCIER">{c.form.contribOptions.FINANCIER}</option>
                          <option value="AUTRE">{c.form.contribOptions.AUTRE}</option>
                        </select>

                        {formData.contributionType === "AUTRE" && (
                          <div className="mt-2 animate-fadeIn">
                            <input
                              type="text"
                              required
                              value={formData.customContributionType}
                              onChange={(e) => setFormData({ ...formData, customContributionType: e.target.value })}
                              placeholder={safeLang === "DE" ? "Bitte Art des Beitrags genauer angeben..." : safeLang === "EN" ? "Please specify your contribution..." : "Précisez la nature de votre contribution..."}
                              className="w-full px-4 py-2.5 rounded-xl border border-[#003366] bg-white outline-none text-sm text-[#142332] shadow-2xs"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                          <span>{c.form.availLabel}</span>
                          <RequiredAsterisk />
                        </label>
                        <select
                          value={formData.availability}
                          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] outline-none text-sm text-[#142332] cursor-pointer"
                        >
                          <option value="HEBDOMADAIRE">{c.form.availOptions.HEBDOMADAIRE}</option>
                          <option value="MENSUEL">{c.form.availOptions.MENSUEL}</option>
                          <option value="PONCTUEL">{c.form.availOptions.PONCTUEL}</option>
                          <option value="TEMPS_PLEIN">{c.form.availOptions.TEMPS_PLEIN}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── 4. MOTIVATION & CONSENTEMENT ── */}
                  <div className="space-y-6">
                    <div className="border-b border-[#EAF0F4] pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-[#003366] uppercase tracking-wider">
                        {c.form.sec4}
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#003366] mb-1.5 flex items-center">
                        <span>{c.form.motivationLabel}</span>
                        <RequiredAsterisk />
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        placeholder={c.form.motivationPlaceholder}
                        className="w-full px-4 py-3 rounded-xl border border-[#EAF0F4] bg-[#F7F8FA] focus:bg-white focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-sm text-[#142332] resize-y transition-all"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F8FA] border border-[#EAF0F4]">
                        <input
                          type="checkbox"
                          id="charte"
                          required
                          checked={formData.charteConsent}
                          onChange={(e) => setFormData({ ...formData, charteConsent: e.target.checked })}
                          className="mt-0.5 h-4 w-4 rounded text-[#007BFF] focus:ring-[#007BFF] border-slate-300 cursor-pointer"
                        />
                        <label htmlFor="charte" className="text-xs text-[#5E6B76] cursor-pointer font-medium leading-relaxed">
                          <span>{c.form.charteConsent}</span>
                          <RequiredAsterisk />
                        </label>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F8FA] border border-[#EAF0F4]">
                        <input
                          type="checkbox"
                          id="consent"
                          required
                          checked={formData.consentData}
                          onChange={(e) => setFormData({ ...formData, consentData: e.target.checked })}
                          className="mt-0.5 h-4 w-4 rounded text-[#007BFF] focus:ring-[#007BFF] border-slate-300 cursor-pointer"
                        />
                        <label htmlFor="consent" className="text-xs text-[#5E6B76] cursor-pointer font-medium leading-relaxed">
                          <span>{c.form.dataConsent}</span>
                          <RequiredAsterisk />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de soumission sobre, dimensionné et verrouillé si invalide */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={!isFormValid || status === "SUBMITTING"}
                      className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md ${
                        isFormValid && status !== "SUBMITTING"
                          ? "bg-[#007BFF] hover:bg-[#0069d9] hover:shadow-lg cursor-pointer"
                          : "bg-slate-300 cursor-not-allowed opacity-70 shadow-none"
                      }`}
                    >
                      <span>{status === "SUBMITTING" ? c.form.submitting : c.form.submitBtn}</span>
                      <ArrowRightIcon size={14} strokeWidth={2} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
