import React, { useState } from "react"
import type { Page, Language } from "../types"
import {
  BuildingIcon,
  UsersIcon,
  FileTextIcon,
  CheckIcon,
  ArrowRightIcon,
  PlusIcon,
  MonitorIcon,
  WheatIcon,
  GraduationCapIcon,
  GlobeIcon,
} from "../components/Icons"
import { trackEvent } from "../lib/tracker"

interface PartnerLandingViewProps {
  lang: Language
  navigate: (p: Page) => void
}

// ─── Shared Badge Component (Identique à la page Volontariat) ─────────────────
function Badge({
  text,
  centered = false,
}: {
  text: string
  centered?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 mb-6 ${
        centered ? "justify-center" : ""
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path
          d="M4 11H8 M6 11V5 M6 5L2.5 2 M6 5L9.5 2"
          stroke="#28A745"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#003366]">
        {text}
      </span>
    </div>
  )
}

const CONTENT = {
  FR: {
    hero: {
      badge: "Partenariats & Coopération Internationale",
      line1: "Construisons ensemble",
      line2: "un partenariat à fort impact",
      line3: "au Togo.",
      desc: "Accueillez et déployez des volontaires, engagez votre mécénat de compétences et co-développez des projets durables d'inclusion numérique et d'agroécologie à Agbélouvé.",
      ctaPrimary: "PROPOSER UN PARTENARIAT",
      ctaSecondary: "DÉCOUVRIR LE CADRE",
      stat1Label: "6 à 12 mois",
      stat1Sub: "Durée modulable",
      stat2Label: "Agbélouvé",
      stat2Sub: "Ancrage communautaire",
      stat3Label: "Conventions",
      stat3Sub: "VSI · Césure · Co-projets",
    },
    why: {
      tag: "POURQUOI COOPÉRER AVEC APTIC-R",
      title: "Quatre garanties pour une collaboration réussie",
      subtitle: "Un ancrage local solide et une gouvernance transparente pour maximiser l'impact de chaque initiative.",
      cards: [
        {
          num: "01",
          title: "Missions structurées & encadrées",
          desc: "Chaque mission s'appuie sur une fiche de poste précise, des objectifs mesurables et un accompagnement de proximité assuré par notre équipe permanente sur place.",
        },
        {
          num: "02",
          title: "Sécurité & intégration quotidienne",
          desc: "Agbélouvé bénéficie d'une situation géographique privilégiée (axe direct RN1 à 60 km de Lomé). Logement sécurisé, tuteur dédié et intégration communautaire bienveillante.",
        },
        {
          num: "03",
          title: "Transparence & redevabilité",
          desc: "Association officiellement enregistrée au Togo (N° 0586/MATDCL). Bilans d'étape réguliers, suivi budgétaire rigoureux et évaluation continue des résultats.",
        },
        {
          num: "04",
          title: "Open-source & pérennité",
          desc: "Toutes les solutions numériques et low-tech créées sont documentées librement pour garantir l'autonomie et l'appropriation totale par les populations locales.",
        },
      ],
    },
    frameworks: {
      tag: "MODALITÉS DE PARTENARIAT",
      title: "Des formats de coopération adaptés à vos besoins",
      subtitle: "Que vous soyez un organisme d'envoi, une université, une entreprise ou une fondation, nous structurons une convention sur-mesure.",
      items: [
        {
          title: "Envoi de volontaires internationaux",
          badge: "Organismes & ONG",
          desc: "Accueil de volontaires (VSI, Service Civique, chantiers solidaires) sur des missions d'ingénierie low-tech, agronomie, enseignement du numérique et communication.",
          points: ["Missions de 6 à 12 mois", "Tutorat technique et logistique sur site", "Rapports semestriels de mission"],
        },
        {
          title: "Stages universitaires & Césures",
          badge: "Grandes Écoles & Universités",
          desc: "Immersion de terrain pour étudiants et jeunes diplômés (agronomie, informatique, sciences sociales, énergies renouvelables) dans le cadre de stages conventionnés.",
          points: ["Conventions bilatérales d'établissement", "Validation de crédits académiques", "Co-encadrement de projets de fin d'études"],
        },
        {
          title: "Mécénat de compétences & RSE",
          badge: "Entreprises & Fondations",
          desc: "Mobilisation de vos collaborateurs pour des missions techniques à distance ou sur place, soutien en matériel informatique reconditionné et co-financement d'équipements solaires.",
          points: ["Engagement RSE à fort impact mesurable", "Défiscalisation et valorisation de marque", "Visibilité auprès des bénéficiaires"],
        },
        {
          title: "Co-développement de projets",
          badge: "Bailleurs & Partenaires techniques",
          desc: "Réponse conjointe à des appels à projets internationaux pour déployer des infrastructures solaires, des réseaux low-tech ou des programmes d'inclusion féminine.",
          points: ["Portage conjoint de subventions", "Gestion opérationnelle terrain éprouvée", "Mesure d'impact communautaire"],
        },
      ],
    },
    lifeAndSafety: {
      tag: "CADRE LOGISTIQUE & TERRAIN",
      title: "Un accueil sécurisé et structuré à Agbélouvé",
      subtitle: "Située à 60 km au nord de Lomé sur la route nationale RN1, la commune d'Agbélouvé combine accessibilité, tranquillité rurale et proximité des services essentiels.",
      points: [
        {
          title: "Hébergement & Logistique",
          desc: "Maisons d'accueil sécurisées, accès à l'eau, électricité et connexion internet pour le travail technique quotidien.",
        },
        {
          title: "Accompagnement & Santé",
          desc: "Tuteur local bilingue dédié, liaison médicale avec les centres de santé de référence et assistance d'urgence 24h/24.",
        },
        {
          title: "Conventionnement officiel",
          desc: "Assistance pour l'obtention des visas, autorisations de séjour et enregistrement auprès des autorités préfectorales.",
        },
      ],
    },
    process: {
      tag: "DÉMARCHE EN 4 ÉTAPES",
      title: "Comment construire notre partenariat ?",
      subtitle: "Un processus fluide et transparent pour officialiser et déployer notre collaboration.",
      stepLabel: "Étape",
      steps: [
        {
          title: "Prise de contact & Note de cadrage",
          desc: "Remplissez le formulaire en ligne pour nous présenter votre organisation, vos objectifs et vos besoins de coopération.",
        },
        {
          title: "Échange vidéo de cadrage",
          desc: "Un rendez-vous de 30 minutes avec l'équipe de coordination d'APTIC-R pour aligner les calendriers, profils et modalités d'accueil.",
        },
        {
          title: "Signature de la convention",
          desc: "Établissement d'une convention formelle précisant les rôles, les engagements logistiques et les modalités de suivi mutuel.",
        },
        {
          title: "Lancement opérationnel & Suivi",
          desc: "Accueil des volontaires ou déploiement des actions sur le terrain avec comptes-rendus réguliers et bilans d'impact partagés.",
        },
      ],
    },
    faq: {
      tag: "FAQ PARTENAIRES",
      title: "Questions fréquentes des organisations",
      subtitle: "Toutes les réponses pour cadrer juridiquement et logistiquement votre partenariat avec APTIC-R.",
      items: [
        {
          q: "Quel est le statut juridique d'APTIC-R ?",
          a: "APTIC-R est une association officiellement reconnue et enregistrée auprès du Ministère de l'Administration Territoriale du Togo sous le récépissé N° 0586/MATDCL-DAPL-DOCA. Nous disposons de tous les agréments légaux pour accueillir des volontaires internationaux et porter des projets de coopération.",
        },
        {
          q: "Quelles sont les durées habituelles des partenariats et missions ?",
          a: "Nos partenariats s'inscrivent généralement dans la durée (accords-cadres de 1 à 3 ans renouvelables). Les missions individuelles de volontariat ou de stage s'étendent de 6 à 12 mois pour garantir une réelle montée en compétences et un impact pérenne.",
        },
        {
          q: "Comment est assurée la prise en charge logistique et sécuritaire sur place ?",
          a: "APTIC-R assure l'accueil dès l'aéroport de Lomé (AIGE), le transfert vers Agbélouvé, la mise à disposition d'un logement sécurisé, l'orientation culturelle et la supervision quotidienne par un mentor permanent de l'association.",
        },
        {
          q: "Pouvons-nous définir des fiches de poste personnalisées pour nos volontaires ou étudiants ?",
          a: "Oui, absolument. Nous co-construisons les fiches de mission selon les domaines d'intervention prioritaires d'APTIC-R (agriculture connectée, formation numérique, fabrication low-tech, communication) et les compétences spécifiques de vos candidats.",
        },
        {
          q: "Délivrez-vous des rapports d'étape et attestations pour les universités et bailleurs ?",
          a: "Oui. Nous fournissons des évaluations intermédiaires, des attestations officielles de stage ou de volontariat, ainsi que des bilans narratifs et financiers complets pour les bailleurs et directions des relations internationales.",
        },
      ],
      contactBoxTitle: "Une question sur un accord-cadre ou une convention ?",
      contactBoxSubtitle: "L'équipe de direction d'APTIC-R vous répond rapidement.",
      whatsappText: "Bonjour APTIC-R, nous souhaitons échanger sur un partenariat.",
    },
    links: {
      about: "À propos d'APTIC-R",
      projects: "Découvrir nos projets de terrain",
      contact: "Découvrir Agbélouvé & accès",
    },
    finalCta: {
      badge: "CO-CONSTRUISONS L'AVENIR",
      title: "Prêt à officialiser un partenariat avec APTIC-R ?",
      desc: "Rejoignez notre réseau d'organisations partenaires en Europe et en Afrique de l'Ouest pour donner à vos volontaires une expérience de terrain inoubliable.",
      btnPrimary: "REMPLIR LE FORMULAIRE DE PARTENARIAT",
      btnSecondary: "Découvrir l'espace des volontaires",
    },
  },
  EN: {
    hero: {
      badge: "Partnerships & International Cooperation",
      line1: "Let's build together",
      line2: "a high-impact partnership",
      line3: "in Togo.",
      desc: "Host and deploy volunteers, engage your corporate skills sponsorship, and co-create sustainable digital and agroecological initiatives in Agbélouvé.",
      ctaPrimary: "PROPOSE A PARTNERSHIP",
      ctaSecondary: "DISCOVER THE FRAMEWORK",
      stat1Label: "6 to 12 months",
      stat1Sub: "Flexible duration",
      stat2Label: "Agbélouvé",
      stat2Sub: "Community anchored",
      stat3Label: "Agreements",
      stat3Sub: "VSI · Gap Year · Joint projects",
    },
    why: {
      tag: "WHY PARTNER WITH APTIC-R",
      title: "Four guarantees for a successful collaboration",
      subtitle: "A strong local presence and transparent governance to maximize the impact of every initiative.",
      cards: [
        {
          num: "01",
          title: "Structured & mentored missions",
          desc: "Each mission relies on a clear job description, measurable goals, and continuous local mentoring provided by our permanent on-site team.",
        },
        {
          num: "02",
          title: "Safety & daily community integration",
          desc: "Agbélouvé enjoys a privileged location on the national road RN1 (60 km north of Lomé). Secure housing, dedicated mentors, and authentic village integration.",
        },
        {
          num: "03",
          title: "Transparency & accountability",
          desc: "Officially registered non-profit in Togo (N° 0586/MATDCL). Regular progress reports, strict budget monitoring, and transparent follow-up.",
        },
        {
          num: "04",
          title: "Open-source & sustainability",
          desc: "All digital and low-tech tools developed are openly documented to ensure total local ownership and autonomy.",
        },
      ],
    },
    frameworks: {
      tag: "COOPERATION FRAMEWORKS",
      title: "Partnership formats tailored to your structure",
      subtitle: "Whether you are a volunteer-sending NGO, a university, a corporate foundation, or an institutional funder, we build a customized agreement.",
      items: [
        {
          title: "International Volunteer Deployment",
          badge: "NGOs & Sending Agencies",
          desc: "Hosting international volunteers on low-tech engineering, agroecology, digital literacy, and community communication assignments.",
          points: ["6 to 12-month placements", "On-site technical and pastoral mentoring", "Comprehensive bi-annual reporting"],
        },
        {
          title: "University Internships & Gap Years",
          badge: "Universities & Academic Institutions",
          desc: "Field immersions for students and graduates in agronomy, computer science, social innovation, and renewable energy under official agreements.",
          points: ["Bilateral institutional agreements", "Academic credit validation (ECTS)", "Joint supervision of master's theses"],
        },
        {
          title: "Skills Sponsorship & CSR",
          badge: "Enterprises & Foundations",
          desc: "Mobilize your employees for on-site or remote technical missions, donate refurbished IT hardware, and co-fund solar setups.",
          points: ["High-impact measurable CSR engagement", "Tax benefits & positive brand visibility", "Direct connection with grassroots beneficiaries"],
        },
        {
          title: "Joint Project Co-development",
          badge: "Funders & Technical Partners",
          desc: "Joint bids for international development grants to deploy solar infrastructure, low-tech networks, and women's empowerment initiatives.",
          points: ["Consortium grant applications", "Proven on-the-ground operational execution", "Community impact assessment"],
        },
      ],
    },
    lifeAndSafety: {
      tag: "LOGISTICS & FIELD FRAMEWORK",
      title: "Safe, structured hosting in Agbélouvé",
      subtitle: "Located 60 km north of Lomé on the main highway RN1, Agbélouvé combines accessibility, serene rural life, and proximity to essential services.",
      points: [
        {
          title: "Accommodation & Logistics",
          desc: "Secure community houses, running water, electricity, and reliable internet access for daily technical work.",
        },
        {
          title: "Support & Health",
          desc: "Dedicated bilingual mentor, medical referral to regional healthcare centers, and 24/7 emergency coordination.",
        },
        {
          title: "Official Formalities",
          desc: "Full administrative support for visa extensions, residency permits, and official local authority registration.",
        },
      ],
    },
    process: {
      tag: "4-STEP ROADMAP",
      title: "How to set up our partnership?",
      subtitle: "A smooth and transparent pathway to formalize and roll out our collaboration.",
      stepLabel: "Step",
      steps: [
        {
          title: "Contact & Scoping Note",
          desc: "Complete our online partnership form to introduce your organization, your objectives, and your collaboration framework.",
        },
        {
          title: "Video Scoping Call",
          desc: "A 30-minute introductory call with the APTIC-R coordination team to align calendars, profiles, and logistics.",
        },
        {
          title: "Agreement Signing",
          desc: "Drafting and signature of a formal partnership memorandum outlining mutual roles, logistical commitments, and milestones.",
        },
        {
          title: "Operational Launch & Follow-up",
          desc: "Volunteer welcoming and project deployment with regular progress reviews and shared impact evaluation.",
        },
      ],
    },
    faq: {
      tag: "PARTNER FAQ",
      title: "Frequently asked questions by organizations",
      subtitle: "Everything you need to know regarding legal, organizational, and operational aspects.",
      items: [
        {
          q: "What is the legal status of APTIC-R?",
          a: "APTIC-R is an officially recognized non-profit organization registered with the Ministry of Territorial Administration of Togo under N° 0586/MATDCL-DAPL-DOCA.",
        },
        {
          q: "What are the standard partnership and mission durations?",
          a: "Partnership agreements usually span 1 to 3 renewable years. Individual volunteer assignments typically run from 6 to 12 months.",
        },
        {
          q: "How are on-site safety and logistics handled?",
          a: "We provide airport pickup at Lomé (AIGE), safe transport to Agbélouvé, secure housing, cultural orientation, and full-time local mentor support.",
        },
        {
          q: "Can we customize job descriptions for our volunteers or students?",
          a: "Yes, absolutely. We tailor role descriptions to match your candidates' skills with APTIC-R's field needs.",
        },
        {
          q: "Do you issue official certificates and reporting for universities and funders?",
          a: "Yes. We deliver formal internship evaluations, mission certificates, and complete narrative/financial reports.",
        },
      ],
      contactBoxTitle: "A question about a framework or agreement?",
      contactBoxSubtitle: "APTIC-R leadership will respond promptly.",
      whatsappText: "Hello APTIC-R, we would like to discuss a partnership.",
    },
    links: {
      about: "About APTIC-R",
      projects: "Explore our field projects",
      contact: "Discover Agbélouvé & access",
    },
    finalCta: {
      badge: "SHAPE THE FUTURE TOGETHER",
      title: "Ready to establish a partnership with APTIC-R?",
      desc: "Join our network of partner institutions across Europe and West Africa to provide your volunteers and teams with an unforgettable field experience.",
      btnPrimary: "FILL IN THE PARTNERSHIP FORM",
      btnSecondary: "Explore the volunteer space",
    },
  },
  DE: {
    hero: {
      badge: "Partnerschaften & Internationale Zusammenarbeit",
      line1: "Gemeinsam aufbauen",
      line2: "wirkungsvolle Partnerschaften",
      line3: "in Togo.",
      desc: "Entsenden Sie Freiwillige, engagieren Sie sich im Rahmen von Corporate Volunteering und entwickeln Sie nachhaltige Digital- und Agrarprojekte in Agbélouvé.",
      ctaPrimary: "PARTNERSCHAFT VORSCHLAGEN",
      ctaSecondary: "RAHMENBEDINGUNGEN ENTDECKEN",
      stat1Label: "6 bis 12 Monate",
      stat1Sub: "Flexible Dauer",
      stat2Label: "Agbélouvé",
      stat2Sub: "Lokale Verankerung",
      stat3Label: "Vereinbarungen",
      stat3Sub: "weltwärts · Praxissemester",
    },
    why: {
      tag: "WARUM EINE PARTNERSCHAFT MIT APTIC-R",
      title: "Vier Garantien für eine erfolgreiche Kooperation",
      subtitle: "Eine starke lokale Präsenz und transparente Abläufe für maximale Wirkung vor Ort.",
      cards: [
        {
          num: "01",
          title: "Strukturierte & betreute Einsätze",
          desc: "Jeder Einsatz basiert auf einer klaren Aufgabenbeschreibung, messbaren Zielen und kontinuierlicher Betreuung durch unser festes Team vor Ort.",
        },
        {
          num: "02",
          title: "Sicherheit & herzliche Integration",
          desc: "Agbélouvé liegt verkehrsgünstig an der Nationalstraße RN1 (60 km nördlich von Lomé). Sichere Unterkunft und feste Ansprechpartner.",
        },
        {
          num: "03",
          title: "Transparenz & Rechenschaftspflicht",
          desc: "Offiziell eingetragener Verein in Togo (N° 0586/MATDCL). Regelmäßige Zwischenberichte, strikte Mittelverwendung und offene Kommunikation.",
        },
        {
          num: "04",
          title: "Open Source & Nachhaltigkeit",
          desc: "Alle entwickelten Low-Tech- und IT-Lösungen werden offen dokumentiert, um dauerhafte lokale Eigenständigkeit zu gewährleisten.",
        },
      ],
    },
    frameworks: {
      tag: "KOOPERATIONSMÖGLICHKEITEN",
      title: "Passende Partnerschaftsformate für Ihre Organisation",
      subtitle: "Ob Entsendeorganisation, Hochschule, Stiftung oder Unternehmen – wir erarbeiten eine maßgeschneiderte Kooperationsvereinbarung.",
      items: [
        {
          title: "Entsendung von Freiwilligen",
          badge: "Organisationen & NGOs",
          desc: "Aufnahme von Freiwilligen (z.B. weltwärts, europäische Freiwilligendienste) in den Bereichen Low-Tech, Agroökologie und digitale Bildung.",
          points: ["6 bis 12 Monate Einsatzdauer", "Lokales Mentoring und Logistik vor Ort", "Umfassende Zwischen- und Abschlussberichte"],
        },
        {
          title: "Hochschulpraktika & Studienprojekte",
          badge: "Universitäten & Hochschulen",
          desc: "Praxissemester und Abschlussarbeiten für Studierende (Agrarwissenschaften, Informatik, Erneuerbare Energien) mit offizieller Praktikumsvereinbarung.",
          points: ["Bilaterale Hochschulabkommen", "Anerkennung von ECTS-Leistungspunkten", "Fachliche Co-Betreuung von Masterarbeiten"],
        },
        {
          title: "Unternehmenskooperation & CSR",
          badge: "Unternehmen & Stiftungen",
          desc: "Corporate Volunteering, Spenden von wiederaufbereiteter IT-Hardware und Co-Finanzierung von Solaranlagen für ländliche Zentren.",
          points: ["Messbare Wirkung im Rahmen Ihrer CSR-Strategie", "Transparente Berichte für Förderer", "Direkte Wirkung bei den Menschen vor Ort"],
        },
        {
          title: "Gemeinsame Projektentwicklung",
          badge: "Förderpartner & Geber",
          desc: "Gemeinsame Antragsstellung bei internationalen Förderprogrammen für Solarinfrastruktur, Low-Tech-Netzwerke und Frauenförderung.",
          points: ["Konsortium-Bewerbungen für Fördergelder", "Erprobte operative Durchführung vor Ort", "Umfassende Wirkungsmessung"],
        },
      ],
    },
    lifeAndSafety: {
      tag: "LOGISTIK & SICHERHEIT",
      title: "Sichere und strukturierte Aufnahme in Agbélouvé",
      subtitle: "60 km nördlich von Lomé an der Hauptachse RN1 gelegen, verbindet Agbélouvé Erreichbarkeit, ländliche Ruhe und Nähe zu grundlegenden Dienstleistungen.",
      points: [
        {
          title: "Unterkunft & Arbeitsumfeld",
          desc: "Sichere Gästehäuser, fließendes Wasser, Strom und stabiler Internetzugang für die tägliche Projektarbeit.",
        },
        {
          title: "Begleitung & Gesundheit",
          desc: "Fester zweisprachiger Mentor, Anbindung an regionale Gesundheitszentren und 24/7-Notfallkoordination.",
        },
        {
          title: "Offizielle Formalitäten",
          desc: "Volle Unterstützung bei Visaverlängerungen, Aufenthaltsgenehmigungen und behördlicher Registrierung.",
        },
      ],
    },
    process: {
      tag: "IN 4 SCHRITTEN",
      title: "Wie entsteht unsere Partnerschaft?",
      subtitle: "Ein klarer, transparenter Ablauf von der ersten Idee bis zur gemeinsamen Umsetzung.",
      stepLabel: "Schritt",
      steps: [
        {
          title: "Kontaktaufnahme & Profil",
          desc: "Füllen Sie das Online-Formular aus und stellen Sie uns Ihre Organisation und Ihre Ziele kurz vor.",
        },
        {
          title: "Video-Kennenlerngespräch",
          desc: "Ein 30-minütiger Austausch mit dem Leitungsteam von APTIC-R zur Abstimmung von Zeitplänen und Einsatzprofilen.",
        },
        {
          title: "Kooperationsvereinbarung",
          desc: "Unterzeichnung einer schriftlichen Vereinbarung mit klaren Rollen, Aufgaben und logistischen Zusagen.",
        },
        {
          title: "Start & Kontinuierlicher Austausch",
          desc: "Begrüßung der Freiwilligen vor Ort und kontinuierliche gemeinsame Begleitung mit regelmäßigen Berichten.",
        },
      ],
    },
    faq: {
      tag: "PARTNER-FAQ",
      title: "Häufige Fragen von Organisationen",
      subtitle: "Rechtliche, organisatorische und praktische Antworten auf einen Blick.",
      items: [
        {
          q: "Welchen Rechtsstatus hat APTIC-R?",
          a: "APTIC-R ist ein offiziell registrierter gemeinnütziger Verein in Togo (Zulassung N° 0586/MATDCL-DAPL-DOCA). Wir verfügen über alle formalen Genehmigungen zur Aufnahme internationaler Freiwilliger.",
        },
        {
          q: "Wie lange dauern Kooperationen und Freiwilligeneinsätze?",
          a: "Partnerschaftsabkommen werden in der Regel für 1 bis 3 Jahre geschlossen. Einzelne Freiwilligeneinsätze dauern typischerweise 6 bis 12 Monate.",
        },
        {
          q: "Wie wird die Sicherheit und Logistik vor Ort gewährleistet?",
          a: "Wir organisieren die Flughafenabholung in Lomé (AIGE), sicheren Transport, Unterbringung, Orientierungswoche und durchgehendes Mentoring.",
        },
        {
          q: "Können Einsatzprofile individuell an unsere Vorgaben angepasst werden?",
          a: "Ja, selbstverständlich. Wir stimmen die Einsatzbeschreibungen präzise auf die Qualifikationen Ihrer Bewerber und die Bedarfe unserer Projekte ab.",
        },
        {
          q: "Stellen Sie Zwischenberichte und Nachweise für Universitäten und Geldgeber aus?",
          a: "Ja. Wir erstellen offizielle Praktikumsbewertungen, Einsatznachweise sowie inhaltliche und finanzielle Berichte.",
        },
      ],
      contactBoxTitle: "Fragen zu Rahmenverträgen oder Vereinbarungen?",
      contactBoxSubtitle: "Das Leitungsteam von APTIC-R antwortet Ihnen zeitnah.",
      whatsappText: "Hallo APTIC-R, wir möchten uns über eine Partnerschaft austauschen.",
    },
    links: {
      about: "Über APTIC-R",
      projects: "Unsere Feldprojekte entdecken",
      contact: "Agbélouvé & Anfahrt entdecken",
    },
    finalCta: {
      badge: "GEMEINSAM ZUKUNFT GESTALTEN",
      title: "Bereit für eine Partnerschaft mit APTIC-R?",
      desc: "Werden Sie Teil unseres Partnernetzwerks in Europa und Westafrika und ermöglichen Sie Ihren Teams und Freiwilligen wirkungsvolle Praxiserfahrungen.",
      btnPrimary: "PARTNERSCHAFTSFORMULAR AUSFÜLLEN",
      btnSecondary: "Freiwilligenbereich entdecken",
    },
  },
}

export default function PartnerLandingView({ lang, navigate }: PartnerLandingViewProps) {
  const currentLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const c = CONTENT[currentLang]
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="w-full overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════════════
          01. HERO (Exactement même forme, structure et typographie que Volontariat)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[95vh] lg:min-h-screen flex flex-col">
        {/* Background Layer with overflow hidden */}
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source srcSet="/meeting-org.avif" type="image/avif" />
            <source srcSet="/meeting-org.webp" type="image/webp" />
            <img
              src="/meeting-org.jpg"
              alt="Partenariat institutionnel et volontariat au Togo"
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(18,59,90,0.27)" }}
          />
          {/* Short gradient fade to white */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 lg:h-24"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, #FFFFFF 100%)",
            }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center pt-32 pb-8 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 relative z-10 max-w-7xl w-full mx-auto px-5 sm:px-6 lg:px-8">
          <div
            className="text-center mx-auto mb-10 sm:mb-16 lg:mb-20 w-full"
            style={{ maxWidth: "900px" }}
          >
            <h1
              className="leading-[1.05] sm:leading-[1.1] tracking-tight mb-6 sm:mb-8"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.14)" }}
            >
              {/* Niveau 1 - Principal */}
              <span className="text-3xl sm:text-5xl lg:text-[72px] block mb-2 sm:mb-3 text-[#FFFFFF]">
                {c.hero.line1}
              </span>
              {/* Niveau 2 - Accent */}
              <span
                className="text-[26px] sm:text-5xl lg:text-[64px] block mb-2 sm:mb-3 text-[#28A745] font-extrabold whitespace-nowrap sm:whitespace-normal tracking-tighter sm:tracking-tight"
                style={{
                  textShadow: "0 2px 12px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.35)",
                }}
              >
                {c.hero.line2}
              </span>
              {/* Niveau 3 - Complément */}
              <span className="text-2xl sm:text-4xl lg:text-[58px] block text-[#FFFFFF] font-medium opacity-90">
                {c.hero.line3}
              </span>
            </h1>

            <p
              className="text-base sm:text-lg lg:text-xl font-medium leading-[1.6] sm:leading-relaxed max-w-[320px] sm:max-w-[640px] mx-auto mb-10 sm:mb-12"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              {c.hero.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4">
              <button
                onClick={() => {
                  trackEvent("partner_request_click", { source: "hero_primary", lang: currentLang })
                  navigate("partner-apply")
                }}
                className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl transition-all shadow-md cursor-pointer text-white bg-[#28A745] hover:bg-[#218838] hover:scale-105"
              >
                <span>{c.hero.ctaPrimary}</span>
                <ArrowRightIcon size={15} strokeWidth={2} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("why-section")
                  el?.scrollIntoView({ behavior: "smooth" })
                }}
                className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl transition-all cursor-pointer text-white border border-white/50 hover:bg-white/10 backdrop-blur-md"
              >
                <span>{c.hero.ctaSecondary}</span>
              </button>
            </div>
          </div>

          {/* Key Facts - intentionally overlapping next section */}
          <div className="relative mt-2 sm:mt-8 mb-4 sm:-mb-12 max-w-4xl mx-auto z-20">
            <div
              className="absolute inset-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              style={{
                backgroundColor: "rgba(23,79,122,0.72)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "20px",
              }}
            />
            <div className="relative grid grid-cols-3 gap-2 sm:gap-8 text-center py-4 sm:py-6 px-2 sm:px-6">
              {[
                { label: c.hero.stat1Label, sub: c.hero.stat1Sub },
                { label: c.hero.stat2Label, sub: c.hero.stat2Sub },
                { label: c.hero.stat3Label, sub: c.hero.stat3Sub },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5 sm:gap-1 relative px-1 sm:px-0">
                  <span
                    className="text-sm sm:text-xl lg:text-2xl font-bold tracking-tight truncate sm:whitespace-normal"
                    style={{ color: "#FFFFFF" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="text-[8px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-widest leading-tight"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          02. POURQUOI COOPÉRER AVEC APTIC-R (Forme identique à WhyMission)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="why-section" className="py-20 sm:py-24 lg:py-32 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-24">
            <Badge text={c.why.tag} centered />
            <h2 className="text-3xl sm:text-5xl lg:text-6xl leading-tight text-[#003366] tracking-[-0.02em]">
              {c.why.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {c.why.cards.map((card, i) => (
              <div
                key={card.title}
                className="relative flex flex-col items-start text-left group"
              >
                <div
                  className="text-[48px] sm:text-[80px] lg:text-[100px] leading-none mb-2 sm:mb-4 lg:mb-6 font-['DM_Serif_Display'] transition-transform duration-500 group-hover:-translate-y-2"
                  style={{ color: "#EAF0F4" }}
                >
                  {card.num}
                </div>
                <div className="w-full mb-2 sm:mb-4 border-b-2 border-[#EAF0F4] pb-2 sm:pb-4 min-h-[auto] sm:min-h-[5rem] lg:min-h-[6rem] flex flex-col justify-start">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl text-[#003366] tracking-tight">
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-[#5E6B76] font-medium leading-relaxed mt-1 sm:mt-2">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          03. MODALITÉS DE PARTENARIAT (Forme identique à ProfilesSought)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 lg:py-32 bg-[#F7F8FA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <Badge text={c.frameworks.tag} centered />
            <h2 className="text-3xl sm:text-5xl lg:text-6xl leading-tight mb-4 sm:mb-6 text-[#003366] tracking-[-0.02em]">
              {c.frameworks.title}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl font-medium text-[#5E6B76] leading-relaxed">
              {c.frameworks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-16 sm:mb-20">
            {c.frameworks.items.map((item, index) => {
              const icons = [
                <UsersIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#003366" />,
                <GraduationCapIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#28A745" />,
                <BuildingIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#003366" />,
                <GlobeIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#003366" />,
              ]
              return (
                <div key={item.title} className="relative flex flex-col p-6 sm:p-10 bg-white rounded-3xl border border-[#EAF0F4] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F7F8FA]">
                      {icons[index]}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8F2FA] text-[#003366]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#003366] mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#5E6B76] font-medium leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  <div className="mt-auto border-t border-[#EAF0F4] pt-4 text-xs sm:text-sm text-[#5E6B76] font-medium">
                    {item.points.map((pt, i, arr) => (
                      <span key={i} className="inline-block">
                        {pt}
                        {i < arr.length - 1 && (
                          <span className="text-[#28A745] font-bold mx-2">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("partner-apply")}
              className="inline-flex items-center gap-2 font-bold text-[13px] uppercase tracking-wider transition-opacity hover:opacity-70 cursor-pointer"
              style={{ color: "#003366" }}
            >
              <span style={{ borderBottom: "1px solid #003366", paddingBottom: "2px" }}>
                {c.hero.ctaPrimary}
              </span>
              <ArrowRightIcon size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          04. CADRE LOGISTIQUE & TERRAIN (Forme identique à LifeInTogo)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="togo" className="py-20 sm:py-24 lg:py-28 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
          <Badge text={c.lifeAndSafety.tag} centered />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight mt-3 mb-4 text-[#003366] font-['DM_Serif_Display'] font-normal">
            {c.lifeAndSafety.title}
          </h2>
          <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl mx-auto font-medium">
            {c.lifeAndSafety.subtitle}
          </p>
        </div>

        {/* Composition photographique compacte et dynamique */}
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 h-auto md:h-[340px]">
            <div className="rounded-2xl overflow-hidden group shadow-sm h-[220px] md:h-full">
              <img
                src="https://images.unsplash.com/photo-1637149253733-44ef8365db1c?w=800&h=600&fit=crop&auto=format"
                alt="Togo landscape"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="rounded-2xl overflow-hidden group shadow-sm h-[220px] md:h-full">
              <img
                src="https://images.unsplash.com/photo-1609252509229-364936a1d1a2?w=800&h=600&fit=crop&auto=format"
                alt="Community members in Agbelouve"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="rounded-2xl overflow-hidden group shadow-sm h-[220px] md:h-full">
              <img
                src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop&auto=format"
                alt="Nature and village surroundings"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Points clés synthétiques */}
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pb-10">
            {c.lifeAndSafety.points.map((pt, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#F7F8FA] border border-[#EAF0F4]">
                <div className="text-lg font-bold text-[#003366] mb-2">{pt.title}</div>
                <p className="text-sm text-[#5E6B76] leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Liens institutionnels contextuels */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-[#EAF0F4] text-xs sm:text-sm font-bold text-[#003366]">
            <button
              onClick={() => navigate("about" as any)}
              className="hover:text-[#28A745] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{c.links.about}</span>
              <ArrowRightIcon size={14} strokeWidth={2} />
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => navigate("projects" as any)}
              className="hover:text-[#28A745] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{c.links.projects}</span>
              <ArrowRightIcon size={14} strokeWidth={2} />
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => navigate("contact" as any)}
              className="hover:text-[#28A745] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{c.links.contact}</span>
              <ArrowRightIcon size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          05. DÉMARCHE EN 4 ÉTAPES (Forme identique à ApplicationProcess)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 lg:py-28 bg-[#F7F8FA]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <Badge text={c.process.tag} centered />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em]">
              {c.process.title}
            </h2>
            <p className="text-base sm:text-lg text-[#5E6B76] max-w-xl mx-auto mt-3 font-medium">
              {c.process.subtitle}
            </p>
          </div>

          <div className="relative border-l-4 border-[#28A745]/30 ml-4 sm:ml-8 lg:ml-12 py-4 flex flex-col gap-10 sm:gap-14">
            {c.process.steps.map((s, i) => (
              <div key={s.title} className="relative group">
                <div className="absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 border-[#FFFFFF] bg-[#28A745] transition-transform duration-500 group-hover:scale-125 shadow-sm" />
                <div className="ml-8 sm:ml-12 lg:ml-16">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#28A745] mb-2 block">
                    {c.process.stepLabel} 0{i + 1}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl text-[#003366] mb-2 font-['DM_Serif_Display']">
                    {s.title}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-[#5E6B76] leading-relaxed max-w-2xl font-medium">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12 flex justify-center">
            <button
              onClick={() => navigate("partner-apply")}
              className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl text-white shadow-md transition-all hover:scale-105 bg-[#28A745] hover:bg-[#218838] cursor-pointer"
            >
              <span>{c.hero.ctaPrimary}</span>
              <ArrowRightIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          06. FAQ PARTENAIRES (Forme identique à FAQ)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 sm:py-24 bg-[#FFFFFF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge text={c.faq.tag} centered />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#003366] tracking-[-0.02em]">
              {c.faq.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5E6B76] mt-3">
              {c.faq.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {c.faq.items?.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={i}
                  className="rounded-2xl transition-all duration-300 bg-[#F7F8FA] overflow-hidden border border-[#EAF0F4]"
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-[#003366]">
                      {item.q}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-2xs flex-shrink-0 transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                    >
                      <PlusIcon size={18} color="#003366" />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-[#5E6B76] text-sm sm:text-base leading-relaxed border-t border-slate-200/60">
                      {item.a}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact direct si question supplémentaire */}
          <div className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-[#F7F8FA] border border-[#EAF0F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#003366] mb-1">
                {c.faq.contactBoxTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#5E6B76]">
                {c.faq.contactBoxSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="mailto:aptic.rural19@gmail.com?subject=Demande%20Partenariat"
                onClick={() => {
                  trackEvent("contact_click", { source: "faq_email" })
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] text-white text-xs font-bold hover:bg-[#002244] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>aptic.rural19@gmail.com</span>
              </a>

              <a
                href={`https://wa.me/22891201990?text=${encodeURIComponent(c.faq.whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackEvent("contact_click", { source: "faq_whatsapp" })
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#28A745] text-white text-xs font-bold hover:bg-[#218838] transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
                <span>WhatsApp : +228 91 20 19 90</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          07. CTA FINAL (Forme identique à FinalCTA)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden flex items-center justify-center min-h-[48vh]">
        <img
          src="https://images.unsplash.com/photo-1652971876875-05db98fab376?w=1920&h=1080&fit=crop&auto=format"
          alt="Rural landscape in West Africa with community gathering"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] md:object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,51,102,0.92) 0%, rgba(0,51,102,0.65) 100%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#28A745] mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full">
            {c.finalCta.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl text-white mb-4 tracking-tight font-['DM_Serif_Display']">
            {c.finalCta.title}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg mb-8 max-w-2xl mx-auto leading-relaxed font-medium text-white/90">
            {c.finalCta.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <button
              onClick={() => {
                trackEvent("partner_request_click", { source: "final_cta_partner", lang: currentLang })
                navigate("partner-apply")
              }}
              className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl text-white transition-all shadow-lg hover:scale-105 cursor-pointer bg-[#28A745] hover:bg-[#218838]"
            >
              <span>{c.finalCta.btnPrimary}</span>
              <ArrowRightIcon size={15} strokeWidth={2} />
            </button>

            <button
              onClick={() => navigate("volunteering")}
              className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/15 border border-white/30 cursor-pointer backdrop-blur-sm"
            >
              <span>{c.finalCta.btnSecondary}</span>
              <ArrowRightIcon size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

    </main>
  )
}
