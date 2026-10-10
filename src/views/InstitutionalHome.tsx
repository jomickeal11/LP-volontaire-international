"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { trackEvent } from "@/lib/tracker"
import { getUtmSubmissionFields } from "@/lib/utm"
import { subscribeNewsletter } from "@/lib/cms-actions"
import { ApticNodeMarker, ApticDash, ApticEyebrow } from "@/components/ApticMarker"
import OptimizedPhoto from "@/components/OptimizedPhoto"

import { DomainCharterIcon } from "@/components/DomainIcons"
import SocialLinks from "@/components/SocialLinks"

interface InstitutionalHomeProps {
  lang: Language
  navigate: (page: Page) => void
}

/* ── Charte graphique officielle APTIC-R & Discipline Visuelle ─────────── */
const BLUE_INST  = "#003366"   /* Bleu institutionnel — Titres, bandeau impact, footer */
const BLUE_TECH  = "#007BFF"   /* Bleu technologique — Boutons d'action, liens, hover */
const GREEN      = "#28A745"   /* Vert naturel — Accent RARE (mini-eyebrows, traits, checks) */
const WHITE      = "#FFFFFF"   /* Fond blanc principal */
const LIGHT_BG   = "#F7F8FA"   /* Fond neutre gris très clair */
const BORDER     = "#E5EAF0"   /* Bordure sobre unifiée */
const TEXT_MAIN  = "#16324A"   /* Texte principal d'autorité */
const TEXT_MUTED = "#5E6B76"   /* Texte secondaire */

/* ── Textes & Contenus trilingues (FR / EN / DE) ─────────────────────────── */
const CONTENT = {
  FR: {
    hero: {
      territoryBadge: "AGBÉLOUVÉ · RÉGION MARITIME · TOGO",
      titleLine1: "Le numérique au service",
      titleLine2: "des territoires ruraux.",
      subtitle:
        "Depuis Agbélouvé, l\u2019APTIC-R co-construit avec les communautés paysannes et scolaires des solutions technologiques et solaires accessibles, réparables et émancipatrices.",
      ctaProjects: "DÉCOUVRIR NOS PROJETS DE TERRAIN",
      ctaGetInvolved: "COMMENT S\u2019ENGAGER AVEC NOUS",
      statYears: "2018",
      statYearsDesc: "Depuis la création",
      statVillages: "15+",
      statVillagesDesc: "Villages & écoles",
      statSolar: "100%",
      statSolarDesc: "Solaire & réparable",
    },
    about: {
      tag: "QUI SOMMES-NOUS ?",
      eyebrow: "DEPUIS 2018 · ANCRAGE AU TOGO",
      title: "Le numérique au service des territoires ruraux.",
      headline:
        "« Depuis 2018, l\u2019APTIC-R accompagne les communautés rurales au Togo en mettant les technologies, les compétences et l\u2019innovation au service des territoires. »",
      p1: "Née à Agbélouvé d\u2019une volonté collective de professionnels togolais et de leaders communautaires, l\u2019APTIC-R s\u2019est constituée pour refuser la fatalité de la fracture numérique qui isole les campagnes d\u2019Afrique de l\u2019Ouest.",
      p2: "Notre démarche repose sur une conviction éprouvée sur le terrain : la technologie ne doit pas être un bien de consommation passif importé, mais un levier d\u2019autonomie et de dignité maîtrisé, réparé et transmis localement par les jeunes et les femmes du milieu rural.",
      historyTitle: "Notre Histoire",
      historySummary: "Agbélouvé, Préfecture du Zio. Une racine villageoise inaltérable depuis 2018.",
      missionTitle: "Notre Mission",
      missionSummary: "Salles informatiques scolaires solaires, formation certifiante et low-tech agricole.",
      visionTitle: "Notre Vision",
      visionSummary: "Des territoires ruraux souverains, résilients et maîtres de leur destin numérique.",
      moreBtn: "En savoir plus sur l\u2019APTIC-R et notre gouvernance",
      photoTag: "TERRAIN · AGBÉLOUVÉ",
      photoLoc: "Zio · Togo",
      photoCaption: "Concertation avec les chefs de village et formateurs à Agbélouvé",
      altPhoto: "Atelier numérique et accompagnement des enfants à Agbélouvé, Togo",
    },
    domains: {
      tag: "NOS DOMAINES D\u2019INTERVENTION",
      title: "Six Domaines d\u2019Action Stratégiques",
      subtitle:
        "Une approche intégrée qui conjugue éducation, énergie solaire autonome, souveraineté alimentaire et compétences du XXIe siècle.",
      discoverLabel: "Découvrir ce domaine",
      list: [
        {
          num: "01",
          title: "Agriculture durable",
          desc: "Conception de capteurs d\u2019humidité solaires, systèmes d\u2019irrigation goutte-à-goutte automatisés et outils sobres adaptés aux groupements maraîchers.",
        },
        {
          num: "02",
          title: "Innovation numérique",
          desc: "Déploiement de salles informatiques alimentées à l\u2019énergie solaire, dotation en ordinateurs reconditionnés et alphabétisation digitale dès l\u2019école primaire.",
        },
        {
          num: "03",
          title: "Données & intelligence",
          desc: "Collecte participative et cartographie des données rurales pour mesurer l\u2019impact, orienter les politiques de développement et éclairer les bailleurs.",
        },
        {
          num: "04",
          title: "Cybersécurité",
          desc: "Sensibilisation des communautés aux bonnes pratiques en ligne, protection des données personnelles, hygiène numérique et lutte contre la désinformation.",
        },
        {
          num: "05",
          title: "Jeunesse & inclusion",
          desc: "Formations certifiantes en bureautique, codage, maintenance matérielle et mentorat pour favoriser l\u2019emploi et l\u2019entrepreneuriat local sans exode.",
        },
        {
          num: "06",
          title: "Développement rural",
          desc: "Renforcement des capacités des coopératives villageoises, autonomisation des groupements de femmes et maintenance technique 100% assurée sur place.",
        },
      ],
      moreLink: "Consulter la fiche détaillée de nos 6 domaines",
    },
    impact: {
      tag: "NOTRE IMPACT EN CHIFFRES",
      title: "Des résultats tangibles, mesurés avec les communautés",
      stat1Val: "2018",
      stat1Lbl: "Fondation d\u2019APTIC-R",
      stat1Sub: "Enregistrée sous le N° 0586/MATDCL",
      stat2Val: "06",
      stat2Lbl: "Domaines d\u2019action",
      stat2Sub: "Programme d\u2019intervention structuré",
      stat3Val: "15+",
      stat3Lbl: "Villages & Écoles",
      stat3Sub: "Bénéficiaires directs en Région Maritime",
      stat4Val: "100%",
      stat4Lbl: "Solutions réparables",
      stat4Sub: "Énergie solaire & matériel maintenable localement",
      legalNotice: "Données d\u2019impact certifiées sur le terrain · République Togolaise · Région Maritime",
    },
    projects: {
      tag: "SUR LE TERRAIN",
      title: "Initiatives Phares & Projets de Terrain",
      subtitle:
        "De la salle multimédia solaire au FabLab rural, découvrez les réalisations concrètes portées au quotidien par nos équipes.",
      allProjectsBtn: "Découvrir tous nos projets de terrain",
      projectLabel: "PROJET",
      flagshipBadge: "PROJET PHARE",
      flagshipTitle: "Caravane Numérique & Salles Multimédia Solaires",
      flagshipLoc: "Agbélouvé & Préfecture du Zio",
      flagshipProgram: "Programme permanent",
      flagshipDesc:
        "Face au manque d\u2019électricité dans les collèges de brousse, l\u2019APTIC-R déploie des salles autonomes alimentées par panneaux solaires et batteries stationnaires, équipées de 15 ordinateurs portables basse consommation et d\u2019encyclopédies hors-ligne. Plus de 350 élèves y sont formés chaque année.",
      flagshipKpi: "350+ collégiens formés par an",
      flagshipBtn: "Découvrir ce projet en détail",
      flagshipAlt: "Formatrice APTIC-R et élèves togolais autour d\u2019un ordinateur",
      project2Title: "FabLab Rural & Prototypage de Pièces Agricoles",
      project2Loc: "Atelier central d\u2019Agbélouvé",
      project2Desc:
        "Impression 3D de buses d\u2019irrigation et fabrication de pièces de rechange pour motopompes, réduisant drastiquement les pannes des maraîchers locaux.",
      project3Title: "Bourses Numériques & Autonomisation des Jeunes Femmes",
      project3Loc: "Région Maritime",
      project3Desc:
        "Programme d\u2019apprentissage intensif aux outils informatiques, bureautiques et web pour 50 jeunes femmes issues des villages environnants.",
      viewResultsBtn: "Consulter les résultats du projet",
    },
    fieldReport: {
      tag: "RÉCIT DOCUMENTAIRE",
      title: "« À Agbélouvé, la technologie n\u2019est pas importée : elle est adoptée et réparée sur place. »",
      quote:
        "Chaque poste informatique installé, chaque panneau solaire posé répond à une demande formelle d\u2019un conseil d\u2019école ou d\u2019un groupement paysan. Nous ne laissons aucun équipement sans former les tuteurs locaux chargés de sa maintenance durable.",
      author: "Équipe de coordination territoriale APTIC-R",
      location: "Agbélouvé · Préfecture du Zio · Togo",
      photoAlt: "École rurale et séance numérique sous l\u2019arbre à Agbélouvé, Togo",
    },
    getInvolved: {
      tag: "COMMENT AGIR AVEC NOUS",
      title: "Quatre Façons Concrètes d\u2019Agir avec Nous",
      subtitle:
        "Que vous soyez un citoyen togolais, un volontaire international, une université ou une fondation, votre apport construit l\u2019autonomie de demain.",
      path1Track: "PARCOURS 01 · IMMERSION TERRAIN",
      path1Duration: "6 à 12 mois à Agbélouvé",
      path1Title: "Devenir Volontaire de Terrain",
      path1Desc: "Engagez-vous en immersion complète à Agbélouvé. Partagez vos compétences informatiques, pédagogiques ou agronomiques au cœur des projets villageois.",
      path1Btn: "Postuler comme volontaire",
      path2Track: "PARCOURS 02 · GOUVERNANCE CIVIQUE",
      path2Tag: "Association N° 0586/MATDCL",
      path2Title: "Rejoindre l\u2019Association comme Membre",
      path2Desc: "Rejoignez l\u2019APTIC-R en tant que membre actif ou sympathisant. Participez aux orientations stratégiques, assemblées générales et à la vie démocratique.",
      path2Btn: "Rejoindre l\u2019association",
      path3Track: "PARCOURS 03 · COOPÉRATION MULTILATÉRALE",
      path3Tag: "ONG, Universités & Bailleurs",
      path3Title: "Bâtir un Partenariat Institutionnel",
      path3Desc: "Organismes d\u2019envoi de volontaires, établissements d\u2019enseignement supérieur et bailleurs : bâtissons une coopération pluriannuelle durable et structurée.",
      path3Btn: "Proposer un partenariat",
      path4Track: "PARCOURS 04 · SOLIDARITÉ & MÉCÉNAT",
      path4Tag: "Dons de matériel & Salles solaires",
      path4Title: "Soutenir nos Écoles & Ateliers Ruraux",
      path4Desc: "Don d\u2019ordinateurs reconditionnés, mécénat de compétences ou financement ciblé de salles solaires : chaque contribution a un impact villageois direct.",
      path4Btn: "Modalités de soutien & dons",
    },
    news: {
      tag: "LE JOURNAL D\u2019APTIC-R",
      title: "Dernières Actualités & Publications",
      subtitle: "Suivez nos interventions dans les villages, nos ateliers et nos communiqués officiels.",
      readMore: "Lire l\u2019article",
      allNewsBtn: "Consulter l\u2019ensemble du journal",
    },
    testimonials: {
      tag: "VOIX DU TERRAIN",
      eyebrow: "VOIX DU TERRAIN",
      title: "La Parole aux Acteurs Locaux",
      t1Quote:
        "Avant l\u2019installation de la salle solaire d\u2019APTIC-R, nos élèves n\u2019avaient jamais allumé un ordinateur de leur vie. Aujourd\u2019hui, ils effectuent leurs recherches documentaires sur place sans devoir marcher 15 km.",
      t1Author: "Kossi M.",
      t1Role: "Directeur de collège rural",
      t1Village: "Collège d\u2019Agbélouvé · Préfecture du Zio",
      t2Quote:
        "La formation au maraîchage assisté par capteurs low-tech m\u2019a permis d\u2019économiser 40% de mon eau d\u2019arrosage pendant la saison sèche. C\u2019est du concret pour nos familles.",
      t2Author: "Afiwa D.",
      t2Role: "Présidente de groupement maraîcher",
      t2Village: "Groupement maraîcher d\u2019Agbélouvé",
    },
    newsletter: {
      tag: "RESTEZ INFORMÉ",
      eyebrow: "RESTEZ INFORMÉ",
      title: "Actualités, projets et initiatives d\u2019APTIC-R",
      desc: "Recevez par courriel nos bilans de projets, annonces d\u2019ateliers et opportunités d\u2019engagement. Pas de spam, désinscription en 1 clic.",
      namePlaceholder: "Votre prénom",
      emailPlaceholder: "Votre adresse e-mail",
      consent: "J\u2019accepte de recevoir les courriels d\u2019information d\u2019APTIC-R.",
      btn: "S\u2019inscrire",
      btnLoading: "Inscription...",
      success: "Merci pour votre inscription à la lettre d\u2019information APTIC-R.",
      alreadySubscribed: "Cette adresse est déjà inscrite à la newsletter APTIC-R.",
      errName: "Veuillez entrer votre prénom.",
      errEmail: "Veuillez entrer une adresse email valide.",
      errConsent: "Veuillez accepter de recevoir la lettre d\u2019information.",
      errGeneral: "Une erreur est survenue lors de l\u2019inscription.",
    },
    contact: {
      tag: "CONTACT & TERRITOIRE",
      title: "Prenez Contact avec l\u2019APTIC-R",
      subtitle: "Vous souhaitez collaborer, devenir membre, proposer un projet de développement rural ou en savoir plus sur nos actions au Togo ?",
      addressLabel: "Siège de l\u2019association",
      phoneLabel: "Téléphone & WhatsApp direct",
      emailLabel: "Courriel officiel",
      accessBoxTitle: "Accès & Déplacements",
      legalRegStatus: "Association loi 1901 N° 0586/MATDCL",
      fieldPresenceBadge: "Présence terrain continue",
      whatsappBtn: "Écrire directement sur WhatsApp",
      contactBtn: "Formulaire & Page Contact",
    },
  },
  EN: {
    hero: {
      territoryBadge: "AGBÉLOUVÉ · MARITIME REGION · TOGO",
      titleLine1: "Digital technology at the service",
      titleLine2: "of rural communities.",
      subtitle:
        "From Agbélouvé, APTIC-R co-develops accessible, repairable, and empowering tech and solar solutions alongside rural farmers and schools in Togo.",
      ctaProjects: "EXPLORE OUR FIELD PROJECTS",
      ctaGetInvolved: "HOW TO GET INVOLVED",
      statYears: "2018",
      statYearsDesc: "Since foundation",
      statVillages: "15+",
      statVillagesDesc: "Villages & schools",
      statSolar: "100%",
      statSolarDesc: "Solar & repairable",
    },
    about: {
      tag: "WHO WE ARE",
      eyebrow: "SINCE 2018 · ROOTED IN TOGO",
      title: "Digital technology for rural communities.",
      headline:
        "\u201CSince 2018, APTIC-R has supported rural communities in Togo by putting technology, skills, and innovation at the service of local development.\u201D",
      p1: "Founded in Agbélouvé by local tech educators and community leaders, APTIC-R was born to counter the rural digital divide that isolates West African countryside communities.",
      p2: "Our approach rests on a proven field conviction: technology must not be an imported passive consumer good, but a lever of autonomy and dignity mastered, repaired, and passed on locally by rural youth and women.",
      historyTitle: "Our Story",
      historySummary: "Agbélouvé, Zio Prefecture. A lasting grassroots anchor since 2018.",
      missionTitle: "Our Mission",
      missionSummary: "Solar-powered school computer labs, certified training, and agricultural low-tech.",
      visionTitle: "Our Vision",
      visionSummary: "Sovereign, resilient rural territories shaping their own digital destiny.",
      moreBtn: "Learn more about APTIC-R and our governance",
      photoTag: "FIELDWORK · AGBÉLOUVÉ",
      photoLoc: "Zio · Togo",
      photoCaption: "Community consultation with village elders and trainers in Agbélouvé",
      altPhoto: "Digital workshop and mentoring of children in Agbélouvé, Togo",
    },
    domains: {
      tag: "STRATEGIC DOMAINS",
      title: "Six Strategic Intervention Domains",
      subtitle: "An integrated framework combining digital education, solar energy, sustainable farming, and modern skills.",
      discoverLabel: "Explore this domain",
      list: [
        { num: "01", title: "Sustainable Agriculture", desc: "Co-designing solar moisture sensors, automated drip irrigation, and repairable tools for smallholder farmers." },
        { num: "02", title: "Digital Innovation", desc: "Setting up solar-powered computer labs, providing refurbished laptops, and digital literacy in rural schools." },
        { num: "03", title: "Data & Intelligence", desc: "Community-based data mapping to guide rural interventions and evaluate genuine local impact." },
        { num: "04", title: "Cybersecurity", desc: "Raising community awareness on privacy protection, safe mobile habits, and responsible digital practices." },
        { num: "05", title: "Youth & Inclusion", desc: "Certified training in software, computer maintenance, and mentorship to unlock local economic opportunities." },
        { num: "06", title: "Rural Development", desc: "Empowering village co-ops and women\u2019s associations with 100% locally maintained technology." },
      ],
      moreLink: "Explore our 6 domains in detail",
    },
    impact: {
      tag: "OUR MEASURED IMPACT",
      title: "Concrete Results Built Alongside Communities",
      stat1Val: "2018", stat1Lbl: "Founded in Agbélouvé", stat1Sub: "Official NGO Registration N° 0586/MATDCL",
      stat2Val: "06", stat2Lbl: "Action Domains", stat2Sub: "Structured grassroots programs",
      stat3Val: "15+", stat3Lbl: "Villages & Schools", stat3Sub: "Direct community beneficiaries",
      stat4Val: "100%", stat4Lbl: "Repairable Solutions", stat4Sub: "Locally maintained solar & digital gear",
      legalNotice: "Certified field impact data · Republic of Togo · Maritime Region",
    },
    projects: {
      tag: "ON THE GROUND",
      title: "Flagship Initiatives & Field Projects",
      subtitle: "From off-grid solar labs to rural makerspaces, discover what our team builds every day.",
      allProjectsBtn: "View all field projects",
      projectLabel: "PROJECT",
      flagshipBadge: "FLAGSHIP PROJECT",
      flagshipTitle: "Digital Caravan & Autonomous Solar Computer Labs",
      flagshipLoc: "Agbélouvé & Zio Prefecture",
      flagshipProgram: "Ongoing program",
      flagshipDesc:
        "To solve the lack of electrical grid in rural middle schools, APTIC-R deploys autonomous solar stations powering 15 energy-efficient laptops and offline encyclopedias for 350+ students annually.",
      flagshipKpi: "350+ rural students trained each year",
      flagshipBtn: "Explore this project in detail",
      flagshipAlt: "APTIC-R trainer and Togolese students learning on a laptop",
      project2Title: "Rural FabLab & Agricultural Spare Parts",
      project2Loc: "Agbélouvé Central Workshop",
      project2Desc: "3D printing of irrigation fittings and water pump parts, minimizing downtime for rural farmers.",
      project3Title: "Digital Scholarships for Young Women",
      project3Loc: "Maritime Region",
      project3Desc: "Intensive training program in office software and web tools for 50 young women in vulnerable rural areas.",
      viewResultsBtn: "View project outcomes",
    },
    fieldReport: {
      tag: "DOCUMENTARY INSIGHT",
      title: "\u201CIn Agbélouvé, technology is never imposed: it is adopted and repaired by the community.\u201D",
      quote:
        "Every computer installed and every solar panel mounted responds to a direct community request. We never leave equipment behind without training local caretakers for sustainable maintenance.",
      author: "APTIC-R Territorial Coordination Team",
      location: "Agbélouvé · Zio Prefecture · Togo",
      photoAlt: "Rural school and digital session under the tree in Agbélouvé, Togo",
    },
    getInvolved: {
      tag: "GET INVOLVED",
      title: "Four Concrete Ways to Take Action with Us",
      subtitle: "Whether you are an international volunteer, partner NGO, academic institution, or donor, your contribution matters.",
      path1Track: "TRACK 01 · FIELD IMMERSION", path1Duration: "6 to 12 months in Agbélouvé",
      path1Title: "Become a Field Volunteer", path1Desc: "Join us for 6 to 12 months in Agbélouvé to share tech, educational, or agronomic skills with village projects.", path1Btn: "Apply as volunteer",
      path2Track: "TRACK 02 · CIVIC GOVERNANCE", path2Tag: "NGO Reg. N° 0586/MATDCL",
      path2Title: "Join the Association as a Member", path2Desc: "Join APTIC-R as an active member and participate in strategic orientations, assemblies, and democratic governance.", path2Btn: "Join as member",
      path3Track: "TRACK 03 · MULTILATERAL COOPERATION", path3Tag: "NGOs, Donors & Universities",
      path3Title: "Build an Institutional Partnership", path3Desc: "Volunteer-sending agencies, universities, and foundations: let\u2019s build lasting multi-year partnerships.", path3Btn: "Propose a partnership",
      path4Track: "TRACK 04 · SOLIDARITY & PHILANTHROPY", path4Tag: "Hardware & Solar Labs",
      path4Title: "Support our Rural Schools & Labs", path4Desc: "Donate refurbished hardware, offer pro bono expertise, or sponsor rural school solar stations directly.", path4Btn: "Support options & donations",
    },
    news: {
      tag: "APTIC-R JOURNAL", title: "Latest Field Updates & Press",
      subtitle: "Read about our school visits, workshops, and official announcements.",
      readMore: "Read article", allNewsBtn: "Browse all articles",
    },
    testimonials: {
      tag: "VOICES FROM THE FIELD", eyebrow: "VOICES FROM THE FIELD",
      title: "Voices from the Ground & Local Communities",
      t1Quote: "Before APTIC-R installed our solar lab, our students had never touched a computer. Today they conduct research on-site without walking 15 km to town.",
      t1Author: "Kossi M.", t1Role: "Rural Middle School Headmaster", t1Village: "Agbélouvé Middle School · Zio Prefecture",
      t2Quote: "The low-tech sensor training helped our cooperative reduce irrigation water consumption by 40% during the dry season. It makes a real difference.",
      t2Author: "Afiwa D.", t2Role: "Farmers\u2019 Cooperative President", t2Village: "Agbélouvé Farmers\u2019 Cooperative",
    },
    newsletter: {
      tag: "STAY INFORMED", eyebrow: "STAY INFORMED",
      title: "News, field projects, and initiatives from APTIC-R",
      desc: "Receive our quarterly project summaries, workshop announcements, and calls for volunteers. Unsubscribe anytime.",
      namePlaceholder: "First name", emailPlaceholder: "Email address",
      consent: "I agree to receive informative emails from APTIC-R.",
      btn: "Subscribe", btnLoading: "Subscribing...",
      success: "Thank you for subscribing to the APTIC-R newsletter.",
      alreadySubscribed: "This address is already subscribed to the APTIC-R newsletter.",
      errName: "Please enter your first name.",
      errEmail: "Please enter a valid email address.", errConsent: "Please agree to receive updates.", errGeneral: "An error occurred during subscription.",
    },
    contact: {
      tag: "CONTACT & TERRITORY", title: "Connect with APTIC-R",
      subtitle: "Interested in collaborating, joining as a member, proposing a rural development project, or learning more about our work in Togo?",
      addressLabel: "Headquarters",
      phoneLabel: "Phone & WhatsApp",
      emailLabel: "Official Email",
      accessBoxTitle: "Access & Directions",
      legalRegStatus: "Non-profit organization N° 0586/MATDCL",
      fieldPresenceBadge: "Continuous field presence",
      whatsappBtn: "Chat on WhatsApp", contactBtn: "Contact Form & Details",
    },
  },
  DE: {
    hero: {
      territoryBadge: "AGBÉLOUVÉ · REGION MARITIME · TOGO",
      titleLine1: "Digitale Technologien im Dienst",
      titleLine2: "ländlicher Räume.",
      subtitle:
        "Aus Agbélouvé entwickelt APTIC-R gemeinsam mit ländlichen Gemeinschaften zugängliche, reparierbare und solargetriebene Lösungen für Bildung und Landwirtschaft in Togo.",
      ctaProjects: "FELDPROJEKTE ENTDECKEN",
      ctaGetInvolved: "MITMACHEN & ENGAGIEREN",
      statYears: "2018",
      statYearsDesc: "Seit der Gründung",
      statVillages: "15+",
      statVillagesDesc: "Dörfer & Schulen",
      statSolar: "100%",
      statSolarDesc: "Solar & reparierbar",
    },
    about: {
      tag: "ÜBER UNS", eyebrow: "SEIT 2018 · VERANKERT IN TOGO",
      title: "Digitale Technologien für ländliche Räume.",
      headline: "\u201ESeit 2018 begleitet APTIC-R ländliche Gemeinden in Togo und stellt Technologie, Bildung und Innovation in den Dienst der Menschen vor Ort.\u201C",
      p1: "In Agbélouvé von lokalen Fachkräften und Gemeindevertretern gegründet, entstand APTIC-R, um der digitalen Isolation im ländlichen Westafrika aktiv entgegenzuwirken.",
      p2: "Unser Ansatz beruht auf einer festen Überzeugung: Technologie darf kein importiertes Konsumgut sein, sondern muss ein Werkzeug der Eigenständigkeit sein \u2013 lokal gewartet, verstanden und weitergegeben von jungen Menschen und Frauen.",
      historyTitle: "Unsere Geschichte", historySummary: "Agbélouvé, Präfektur Zio. Eine feste dörfliche Verwurzelung seit 2018.",
      missionTitle: "Unsere Mission", missionSummary: "Solare Schul-Computerräume, qualifizierte Ausbildung und landwirtschaftliche Low-Tech.",
      visionTitle: "Unsere Vision", visionSummary: "Selbstbestimmte, zukunftsfähige Dörfer, die ihren digitalen Weg eigenständig gestalten.",
      moreBtn: "Mehr über APTIC-R und unsere Organisationsstruktur",
      photoTag: "VOR ORT · AGBÉLOUVÉ",
      photoLoc: "Zio · Togo",
      photoCaption: "Gemeindetreffen mit Dorfältesten und Ausbildern in Agbélouvé",
      altPhoto: "Digital-Workshop und Betreuung von Kindern in Agbélouvé, Togo",
    },
    domains: {
      tag: "STRATEGISCHE BEREICHE",
      title: "Sechs Strategische Handlungsfelder",
      subtitle: "Ein ganzheitlicher Ansatz, der digitale Bildung, Solarenergie und nachhaltige Landwirtschaft vereint.",
      discoverLabel: "Bereich entdecken",
      list: [
        { num: "01", title: "Nachhaltige Landwirtschaft", desc: "Solare Feuchtigkeitssensoren und sparsame Bewässerungssysteme für Kleinbauern." },
        { num: "02", title: "Digitale Innovation", desc: "Aufbau solarbetriebener Computerräume und Vermittlung digitaler Grundkompetenzen in Dorfschulen." },
        { num: "03", title: "Daten & Intelligenz", desc: "Erfassung und Kartierung ländlicher Bedarfe zur gezielten Projektförderung." },
        { num: "04", title: "Cybersicherheit", desc: "Aufklärung über Datenschutz, sichere Smartphone-Nutzung und Medienkompetenz." },
        { num: "05", title: "Jugend & Inklusion", desc: "Praxisnahe IT-Ausbildungen, Wartungskurse und Mentoring zur Förderung lokaler Beschäftigung." },
        { num: "06", title: "Ländliche Entwicklung", desc: "Stärkung dörflicher Genossenschaften und Fraueninitiativen mit lokaler Technikwartung." },
      ],
      moreLink: "Alle 6 Bereiche im Detail ansehen",
    },
    impact: {
      tag: "WIRKUNG IN ZAHLEN", title: "Messbare Ergebnisse, gemeinsam mit den Dörfern erreicht",
      stat1Val: "2018", stat1Lbl: "Gründung in Agbélouvé", stat1Sub: "Registriert unter N° 0586/MATDCL",
      stat2Val: "06", stat2Lbl: "Bereiche", stat2Sub: "Strukturiertes Förderprogramm",
      stat3Val: "15+", stat3Lbl: "Dörfer & Schulen", stat3Sub: "Direkt begünstigte Gemeinschaften",
      stat4Val: "100%", stat4Lbl: "Reparierbar", stat4Sub: "Lokale Wartung von Solar- und IT-Technik",
      legalNotice: "Zertifizierte Wirkungsdaten aus der Praxis · Republik Togo · Region Maritime",
    },
    projects: {
      tag: "VOR ORT", title: "Schlüsselinitiativen & Feldprojekte",
      subtitle: "Vom netzunabhängigen Solarlabor bis zum dörflichen FabLab: Einblicke in unsere tägliche Arbeit.",
      allProjectsBtn: "Alle Projekte entdecken",
      projectLabel: "PROJEKT",
      flagshipBadge: "LEUCHTTURMPROJEKT",
      flagshipTitle: "Digitale Karawane & Autonome Solar-Computerräume",
      flagshipLoc: "Agbélouvé & Präfektur Zio", flagshipProgram: "Laufendes Programm",
      flagshipDesc: "Da ländliche Mittelschulen oft keinen Stromanschluss haben, errichtet APTIC-R solare Lernräume mit 15 energiesparenden Laptops. Über 350 Schüler werden jährlich geschult.",
      flagshipKpi: "350+ Schüler jährlich ausgebildet", flagshipBtn: "Projekt im Detail ansehen",
      flagshipAlt: "APTIC-R Trainerin und togoische Schülerinnen und Schüler an einem Laptop",
      project2Title: "Ländliches FabLab & Ersatzteile", project2Loc: "Werkstatt Agbélouvé",
      project2Desc: "3D-Druck von Bewässerungsdüsen und Pumpen-Ersatzteilen für örtliche Gemüsebauern.",
      project3Title: "Digitalstipendien für junge Frauen", project3Loc: "Region Maritime",
      project3Desc: "Intensivschulung in Bürosoftware und Internetanwendungen für 50 junge Frauen in ländlichen Gebieten.",
      viewResultsBtn: "Projektergebnisse ansehen",
    },
    fieldReport: {
      tag: "EINBLICK VOR ORT",
      title: "\u201EIn Agbélouvé wird Technologie nicht importiert, sondern von den Menschen selbst verstanden und gewartet.\u201C",
      quote: "Jeder installierte Rechner und jedes Solarmodul geht auf einen konkreten Wunsch der Schule oder Dorfgemeinschaft zurück. Keine Technik bleibt ohne ausgebildete Betreuer für eine nachhaltige Instandhaltung.",
      author: "APTIC-R Koordinationsteam vor Ort",
      location: "Agbélouvé · Präfektur Zio · Togo",
      photoAlt: "Dorfschule und Computer-Lernstunde unter dem Baum in Agbélouvé, Togo",
    },
    getInvolved: {
      tag: "MITMACHEN",
      title: "Vier konkrete Wege, sich zu engagieren",
      subtitle: "Ob Freiwilliger, Partnerorganisation, Universität oder Förderer: Ihr Beitrag baut die Zukunft vor Ort auf.",
      path1Track: "WEG 01 · PRAXIS-IMMERSION", path1Duration: "6 bis 12 Monate in Agbélouvé",
      path1Title: "Freiwilligendienst vor Ort", path1Desc: "Engagieren Sie sich direkt in Agbélouvé und teilen Sie Ihr technisches Wissen im Herzen der Dorfprojekte.", path1Btn: "Als Freiwilliger bewerben",
      path2Track: "WEG 02 · MITWIRKUNG & MITGLIEDSCHAFT", path2Tag: "Vereinsreg. N° 0586/MATDCL",
      path2Title: "Mitglied des Vereins werden", path2Desc: "Treten Sie APTIC-R als aktives Mitglied bei und bestimmen Sie die strategische Ausrichtung demokratisch mit.", path2Btn: "Mitglied werden",
      path3Track: "WEG 03 · INSTITUTIONELLE PARTNERSCHAFT", path3Tag: "NGOs, Förderer & Hochschulen",
      path3Title: "Eine langfristige Partnerschaft aufbauen", path3Desc: "Entsendeorganisationen, Hochschulen und Stiftungen: Gemeinsam nachhaltige Kooperationen gestalten.", path3Btn: "Partnerschaft vorschlagen",
      path4Track: "WEG 04 · SOLIDARITÄT & FÖRDERUNG", path4Tag: "Sachspenden & Solarräume",
      path4Title: "Unsere Dorfschulen & Werkstätten fördern", path4Desc: "Spende von Laptops, Fachwissen oder gezielte Finanzierung netzunabhängiger Solarräume.", path4Btn: "Förderwege & Spenden",
    },
    news: {
      tag: "APTIC-R JOURNAL", title: "Aktuelles & Berichte",
      subtitle: "Neuigkeiten aus den Dörfern, Werkstattberichte und offizielle Bekanntmachungen.",
      readMore: "Artikel lesen", allNewsBtn: "Zum gesamten Journal",
    },
    testimonials: {
      tag: "STIMMEN VOR ORT", eyebrow: "STIMMEN VOR ORT",
      title: "Stimmen aus den ländlichen Gemeinden",
      t1Quote: "Vor der Installation des Solarlabors hatten unsere Schüler noch nie einen Computer berührt. Heute recherchieren sie selbstständig vor Ort, ohne 15 km in die Stadt laufen zu müssen.",
      t1Author: "Kossi M.", t1Role: "Schulleiter in der Präfektur Zio", t1Village: "Mittelschule Agbélouvé · Präfektur Zio",
      t2Quote: "Die Schulung zur wassersparenden Bewässerung hat unseren Wasserverbrauch in der Trockenzeit um 40% gesenkt. Das ist eine spürbare Entlastung für unsere Familien.",
      t2Author: "Afiwa D.", t2Role: "Vorsitzende einer Kleinbauern-Kooperative", t2Village: "Gemüsebau-Kooperative Agbélouvé",
    },
    newsletter: {
      tag: "INFORMIERT BLEIBEN", eyebrow: "INFORMIERT BLEIBEN",
      title: "Neuigkeiten, Projekte und Initiativen von APTIC-R",
      desc: "Erhalten Sie Berichte, Werkstattankündigungen und Aufrufe für Freiwillige. Abmeldung jederzeit möglich.",
      namePlaceholder: "Vorname", emailPlaceholder: "E-Mail-Adresse",
      consent: "Ich stimme dem Erhalt von Informationen von APTIC-R zu.",
      btn: "Anmelden", btnLoading: "Anmeldung...",
      success: "Vielen Dank für Ihre Anmeldung zum APTIC-R Newsletter.",
      alreadySubscribed: "Diese Adresse ist bereits für den APTIC-R Newsletter registriert.",
      errName: "Bitte geben Sie Ihren Vornamen ein.",
      errEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.", errConsent: "Bitte stimmen Sie dem Erhalt des Rundbriefs zu.", errGeneral: "Bei der Anmeldung ist ein Fehler aufgetreten.",
    },
    contact: {
      tag: "KONTAKT & STANDORT", title: "Kontakt zu APTIC-R",
      subtitle: "Möchten Sie kooperieren, Mitglied werden, ein Entwicklungsprojekt vorschlagen oder mehr über unsere Arbeit in Togo erfahren?",
      addressLabel: "Vereinssitz",
      phoneLabel: "Telefon & WhatsApp",
      emailLabel: "Offizielle E-Mail",
      accessBoxTitle: "Anfahrt & Erreichbarkeit",
      legalRegStatus: "Eingetragener Verein N° 0586/MATDCL",
      fieldPresenceBadge: "Kontinuierliche Präsenz vor Ort",
      whatsappBtn: "Über WhatsApp schreiben", contactBtn: "Kontaktformular & Details",
    },
  },
}

export default function InstitutionalHome({ lang, navigate }: InstitutionalHomeProps) {
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"

  const DOMAIN_IDS = [
    "agri-lowtech",
    "inclusion-numerique",
    "data-innovation",
    "cybersecurite-hygiene",
    "jeunesse-education",
    "dev-rural-fablabs",
  ]

  const [settings, setSettings] = useState<Record<string, string>>({})
  const [dbDomains, setDbDomains] = useState<any[]>([])
  const [dbProjects, setDbProjects] = useState<any[]>([])
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([])
  const l = safeLang.toLowerCase()
  const c = {
    hero: {
      territoryBadge: settings[`home_hero_badge_${l}`] || "",
      titleLine1: (settings[`home_hero_title_${l}`] || "").split("\n")[0] || "",
      titleLine2: (settings[`home_hero_title_${l}`] || "").split("\n")[1] || "",
      subtitle: settings[`home_hero_subtitle_${l}`] || "",
      ctaProjects: settings[`home_hero_cta1_label_${l}`] || "",
      ctaGetInvolved: settings[`home_hero_cta2_label_${l}`] || "",
      statYears: settings[`home_hero_stat1_val_${l}`] || "",
      statYearsDesc: settings[`home_hero_stat1_lbl_${l}`] || "",
      statVillages: settings[`home_hero_stat2_val_${l}`] || "",
      statVillagesDesc: settings[`home_hero_stat2_lbl_${l}`] || "",
      statSolar: settings[`home_hero_stat3_val_${l}`] || "",
      statSolarDesc: settings[`home_hero_stat3_lbl_${l}`] || "",
      image: settings["home_hero_image"] || "/images/home/hero-aptic.jpg",
    },
    about: {
      tag: settings[`home_about_eyebrow_${l}`] || "",
      eyebrow: settings[`home_about_eyebrow_${l}`] || "",
      title: settings[`home_about_title_${l}`] || "",
      headline: settings[`home_about_quote_${l}`] || "",
      p1: settings[`home_about_p1_${l}`] || "",
      p2: settings[`home_about_p2_${l}`] || "",
      moreBtn: settings[`home_about_cta_label_${l}`] || "",
      photoTag: settings[`about_story_location_tag_${l}`] || "",
      photoLoc: settings[`about_story_location_${l}`] || "",
      altPhoto: settings[`about_story_image_alt_${l}`] || "",
      photoUrl: settings[`about_story_image`] || "",
      photoCaption: settings[`about_story_caption_${l}`] || settings[`about_story_location_${l}`] || "",
      historyTitle: settings[`about_history_title_${l}`] || (safeLang === "DE" ? "Geschichte" : safeLang === "EN" ? "Our History" : "Notre Histoire"),
      historySummary: settings[`about_history_summary_${l}`] || (safeLang === "DE" ? "Erfahren Sie mehr über die Gründung und Entwicklung der APTIC-R." : safeLang === "EN" ? "Learn about APTIC-R\'s founding story and evolution." : "Découvrez la fondation et l\'histoire de l\'APTIC-R."),
      missionTitle: settings[`about_mission_title_${l}`] || (safeLang === "DE" ? "Mission & Werte" : safeLang === "EN" ? "Mission & Values" : "Mission & Valeurs"),
      missionSummary: settings[`about_mission_summary_${l}`] || (safeLang === "DE" ? "Unsere Mission für ländliche digitale Inklusion." : safeLang === "EN" ? "Our mission for rural digital inclusion." : "Notre mission pour l\'inclusion numérique rurale."),
      visionTitle: settings[`about_vision_title_${l}`] || (safeLang === "DE" ? "Unsere Vision" : safeLang === "EN" ? "Our Vision" : "Notre Vision"),
      visionSummary: settings[`about_vision_summary_${l}`] || (safeLang === "DE" ? "Unsere Zukunftsvision für ländliche Gebiete." : safeLang === "EN" ? "Our vision for the future of rural communities." : "Notre vision pour l\'avenir des territoires ruraux."),
    },
    domains: {
      tag: settings[`home_domains_tag_${l}`] || "",
      title: settings[`home_domains_title_${l}`] || "",
      subtitle: settings[`home_domains_subtitle_${l}`] || "",
      discoverLabel: settings[`home_domains_cta_label_${l}`] || "",
    },
    impact: {
      tag: settings[`home_impact_tag_${l}`] || "",
      title: settings[`home_impact_title_${l}`] || "",
      stat1Val: settings[`home_impact_stat1_val_${l}`] || "",
      stat1Lbl: settings[`home_impact_stat1_lbl_${l}`] || "",
      stat1Sub: settings[`home_impact_stat1_sub_${l}`] || "",
      stat2Val: settings[`home_impact_stat2_val_${l}`] || (dbDomains.length > 0 ? String(dbDomains.length).padStart(2, "0") : ""),
      stat2Lbl: settings[`home_impact_stat2_lbl_${l}`] || "",
      stat2Sub: settings[`home_impact_stat2_sub_${l}`] || "",
      stat3Val: settings[`home_impact_stat3_val_${l}`] || "",
      stat3Lbl: settings[`home_impact_stat3_lbl_${l}`] || "",
      stat3Sub: settings[`home_impact_stat3_sub_${l}`] || "",
      stat4Val: settings[`home_impact_stat4_val_${l}`] || "",
      stat4Lbl: settings[`home_impact_stat4_lbl_${l}`] || "",
      stat4Sub: settings[`home_impact_stat4_sub_${l}`] || "",
      legalNotice: settings[`home_impact_legal_${l}`] || "",
    },
    projects: {
      tag: settings[`home_projects_tag_${l}`] || "",
      title: settings[`home_projects_title_${l}`] || "",
      allProjectsBtn: settings[`home_projects_cta_label_${l}`] || "",
      projectLabel: safeLang === "DE" ? "PROJEKT" : safeLang === "EN" ? "PROJECT" : "PROJET",
      flagshipBadge: safeLang === "DE" ? "LEUCHTTURMPROJEKT" : safeLang === "EN" ? "FLAGSHIP PROJECT" : "PROJET PHARE",
      flagshipBtn: safeLang === "DE" ? "Projekt im Detail ansehen" : safeLang === "EN" ? "Explore this project in detail" : "Découvrir ce projet en détail",
      viewResultsBtn: safeLang === "DE" ? "Projektergebnisse ansehen" : safeLang === "EN" ? "View project outcomes" : "Consulter les résultats du projet",
    },
    fieldReport: {
      tag: settings[`home_field_tag_${l}`] || "",
      title: settings[`home_field_quote_${l}`] || "",
      quote: settings[`home_field_quote_${l}`] || "",
      author: settings[`home_field_author_${l}`] || "",
      location: settings[`home_field_location_${l}`] || "",
      image: settings["home_field_image"] || "",
      photoAlt: settings[`home_field_image_alt_${l}`] || (safeLang === "DE" ? "Dokumentarisches Feldbild APTIC-R" : safeLang === "EN" ? "APTIC-R field documentary photo" : "Photo documentaire terrain APTIC-R"),
    },
    getInvolved: {
      tag: settings[`home_engagement_tag_${l}`] || "",
      title: settings[`home_engagement_title_${l}`] || "",
      subtitle: settings[`home_engagement_subtitle_${l}`] || "",
      path1Title: settings[`home_engagement_c1_title_${l}`] || "",
      path1Desc: settings[`home_engagement_c1_desc_${l}`] || "",
      path1Btn: settings[`home_engagement_c1_cta_${l}`] || "",
      path1Track: safeLang === "DE" ? "WEG 01" : safeLang === "EN" ? "TRACK 01" : "PARCOURS 01",
      path1Duration: safeLang === "DE" ? "6–12 MONATE" : safeLang === "EN" ? "6–12 MONTHS" : "6–12 MOIS",
      path2Title: settings[`home_engagement_c2_title_${l}`] || "",
      path2Desc: settings[`home_engagement_c2_desc_${l}`] || "",
      path2Btn: settings[`home_engagement_c2_cta_${l}`] || "",
      path2Track: safeLang === "DE" ? "WEG 02" : safeLang === "EN" ? "TRACK 02" : "PARCOURS 02",
      path2Tag: safeLang === "DE" ? "MITGLIED" : safeLang === "EN" ? "MEMBER" : "MEMBRE",
      path3Title: settings[`home_engagement_c3_title_${l}`] || "",
      path3Desc: settings[`home_engagement_c3_desc_${l}`] || "",
      path3Btn: settings[`home_engagement_c3_cta_${l}`] || "",
      path3Track: safeLang === "DE" ? "WEG 03" : safeLang === "EN" ? "TRACK 03" : "PARCOURS 03",
      path3Tag: safeLang === "DE" ? "PARTNER" : safeLang === "EN" ? "PARTNER" : "PARTENAIRE",
      path4Title: settings[`home_engagement_c4_title_${l}`] || "",
      path4Desc: settings[`home_engagement_c4_desc_${l}`] || "",
      path4Btn: settings[`home_engagement_c4_cta_${l}`] || "",
      path4Track: safeLang === "DE" ? "WEG 04" : safeLang === "EN" ? "TRACK 04" : "PARCOURS 04",
      path4Tag: safeLang === "DE" ? "FÖRDERN" : safeLang === "EN" ? "SUPPORT" : "SOUTIEN",
      socialFollow:
        settings[`home_engagement_social_follow_${l}`] ||
        (safeLang === "DE"
          ? "Verfolgen Sie unsere Aktionen und entdecken Sie unsere täglichen Projekte."
          : safeLang === "EN"
          ? "Follow our actions and discover our daily projects."
          : "Suivez nos actions et découvrez nos projets au quotidien."),
    },
    newsletter: {
      tag: settings[`home_newsletter_eyebrow_${l}`] || "",
      eyebrow: settings[`home_newsletter_eyebrow_${l}`] || "",
      title: settings[`home_newsletter_title_${l}`] || "",
      desc: settings[`home_newsletter_desc_${l}`] || "",
      namePlaceholder: safeLang === "DE" ? "Vorname" : safeLang === "EN" ? "First name" : "Votre prénom",
      emailPlaceholder: safeLang === "DE" ? "E-Mail-Adresse" : safeLang === "EN" ? "Email address" : "Votre adresse e-mail",
      consent: safeLang === "DE" ? "Ich stimme dem Erhalt von Informationen von APTIC-R zu." : safeLang === "EN" ? "I agree to receive informative emails from APTIC-R." : "J'accepte de recevoir les courriels d'information d'APTIC-R.",
      btn: safeLang === "DE" ? "Anmelden" : safeLang === "EN" ? "Subscribe" : "S'inscrire",
      btnLoading: safeLang === "DE" ? "Anmeldung..." : safeLang === "EN" ? "Subscribing..." : "Inscription...",
      success: safeLang === "DE" ? "Vielen Dank für Ihre Anmeldung zum APTIC-R Newsletter." : safeLang === "EN" ? "Thank you for subscribing to the APTIC-R newsletter." : "Merci pour votre inscription à la lettre d'information APTIC-R.",
      alreadySubscribed: safeLang === "DE" ? "Diese Adresse ist bereits für den APTIC-R Newsletter registriert." : safeLang === "EN" ? "This address is already subscribed to the APTIC-R newsletter." : "Cette adresse est déjà inscrite à la newsletter APTIC-R.",
      errName: safeLang === "DE" ? "Bitte geben Sie Ihren Vornamen ein." : safeLang === "EN" ? "Please enter your first name." : "Veuillez entrer votre prénom.",
      errEmail: safeLang === "DE" ? "Bitte geben Sie eine gültige E-Mail-Adresse ein." : safeLang === "EN" ? "Please enter a valid email address." : "Veuillez entrer une adresse email valide.",
      errConsent: safeLang === "DE" ? "Bitte stimmen Sie dem Erhalt des Rundbriefs zu." : safeLang === "EN" ? "Please agree to receive updates." : "Veuillez accepter de recevoir la lettre d'information.",
      errGeneral: safeLang === "DE" ? "Bei der Anmeldung ist ein Fehler aufgetreten." : safeLang === "EN" ? "An error occurred during subscription." : "Une erreur est survenue lors de l'inscription.",
    },
    contact: {
      tag: settings[`home_contact_tag_${l}`] || "",
      title: settings[`home_contact_title_${l}`] || "",
      subtitle: settings[`home_contact_subtitle_${l}`] || "",
      addressLabel: safeLang === "DE" ? "Vereinssitz" : safeLang === "EN" ? "Headquarters" : "Siège de l'association",
      phoneLabel: safeLang === "DE" ? "Telefon & WhatsApp" : safeLang === "EN" ? "Phone & WhatsApp" : "Téléphone & WhatsApp direct",
      emailLabel: safeLang === "DE" ? "Offizielle E-Mail" : safeLang === "EN" ? "Official Email" : "Courriel officiel",
      accessBoxTitle: safeLang === "DE" ? "Anfahrt & Erreichbarkeit" : safeLang === "EN" ? "Access & Directions" : "Accès & Déplacements",
      legalRegStatus: safeLang === "DE" ? "Eingetragener Verein N° 0586/MATDCL" : safeLang === "EN" ? "Non-profit organization N° 0586/MATDCL" : "Association loi 1901 N° 0586/MATDCL",
      fieldPresenceBadge: safeLang === "DE" ? "Kontinuierliche Präsenz vor Ort" : safeLang === "EN" ? "Continuous field presence" : "Présence terrain continue",
      whatsappBtn: safeLang === "DE" ? "Über WhatsApp schreiben" : safeLang === "EN" ? "Chat on WhatsApp" : "Écrire directement sur WhatsApp",
      contactBtn: safeLang === "DE" ? "Kontaktformular & Details" : safeLang === "EN" ? "Contact Form & Details" : "Formulaire & Page Contact",
    },
    testimonials: {
      tag: safeLang === "DE" ? "STIMMEN VOR ORT" : safeLang === "EN" ? "VOICES FROM THE FIELD" : "VOIX DU TERRAIN",
      eyebrow: safeLang === "DE" ? "STIMMEN VOR ORT" : safeLang === "EN" ? "VOICES FROM THE FIELD" : "VOIX DU TERRAIN",
      title: safeLang === "DE" ? "Stimmen aus den ländlichen Gemeinden" : safeLang === "EN" ? "Voices from the Ground & Local Communities" : "La Parole aux Acteurs Locaux",
    },
    socialBanner: {
      title:
        settings[`home_social_banner_title_${l}`] ||
        (safeLang === "DE"
          ? "Folgen Sie APTIC-R"
          : safeLang === "EN"
          ? "Follow APTIC-R"
          : "Suivez APTIC-R"),
      subtitle:
        settings[`home_social_banner_subtitle_${l}`] ||
        (safeLang === "DE"
          ? "Entdecken Sie unsere Projekte, Initiativen und Neuigkeiten aus unserer Gemeinschaft."
          : safeLang === "EN"
          ? "Discover our projects, initiatives and community news."
          : "Découvrez nos projets, nos initiatives et les actualités de notre communauté."),
    },
  }

  const contactEmail = settings.site_contact_email ?? ""
  const contactPhone = settings.site_contact_phone ?? ""
  const contactWhatsapp = settings.site_social_whatsapp ?? ""
  const contactWhatsappDigits = contactWhatsapp.replace(/\D/g, "")
  const publicAddress = [
    settings.site_location_address,
    settings.site_location_city,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part, index, parts) =>
      !parts.some(
        (other, otherIndex) =>
          otherIndex < index &&
          other.toLocaleLowerCase().includes(part.toLocaleLowerCase()),
      ),
    )
    .join(", ")
  const publicAddressDetail = [settings.site_location_region, settings.site_location_country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part) => !settings.site_location_address?.toLocaleLowerCase().includes(part.toLocaleLowerCase()))
    .join(", ")
  const mapLatitude = settings.contact_map_lat ?? ""
  const mapLongitude = settings.contact_map_lng ?? ""
  const mapZoom = (settings.contact_map_zoom ?? "").trim() || "13"
  const mapLabel = settings.contact_map_label ?? ""
  const mapConfigured = Boolean(mapLatitude.trim() && mapLongitude.trim() && mapZoom.trim())
  const contactAccessInfo = settings[`contact_access_info_${safeLang.toLowerCase()}`] ?? ""

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings, getDomaines, getProjects, getTestimonials }) => {
      getSiteSettings().then((res) => {
        if (res.success && res.dict) {
          setSettings((prev) => ({ ...prev, ...res.dict }))
        }
      }).catch(console.error)

      getDomaines({ activeOnly: true, lang: safeLang }).then((res) => {
        if (res && res.length > 0) {
          setDbDomains(res)
        }
      }).catch(console.error)

      getProjects({ limit: 6, lang: safeLang }).then((res) => {
        if (res && res.length > 0) {
          setDbProjects(res)
        }
      }).catch(console.error)

      getTestimonials({ featuredOnly: true }).then((res) => {
        if (res && res.length > 0) {
          setDbTestimonials(res)
        }
      }).catch(console.error)
    })
  }, [])

  const domainsList = React.useMemo(() => {
    if (dbDomains.length > 0) {
      // Filtrer strictement les domaines qui possèdent un titre et une description traduits dans la langue active
      const filtered = dbDomains.filter((d) => {
        if (safeLang === "DE") return !!(d.nameDe && d.descDe)
        if (safeLang === "EN") return !!(d.nameEn && d.descEn)
        return !!(d.nameFr && d.descFr)
      })

      if (filtered.length > 0) {
        return filtered.map((d, idx) => ({
          num: String(d.order || idx + 1).padStart(2, "0"),
          title: safeLang === "DE" ? d.nameDe : safeLang === "EN" ? d.nameEn : d.nameFr,
          desc: safeLang === "DE" ? d.descDe : safeLang === "EN" ? d.descEn : d.descFr,
          slug: d.slug,
          code: d.code,
        }))
      }
    }

    return []
  }, [dbDomains, safeLang])

  /* Projects list computation - Règle stricte : zéro mélange de langues */
  const { flagshipProject, secondaryProjects } = React.useMemo(() => {
    const validProjects = dbProjects.filter((project) => {
      if (safeLang === "DE") return Boolean(project.publishedDe && project.titleDe?.trim() && (project.summaryDe?.trim() || project.descriptionDe?.trim()))
      if (safeLang === "EN") return Boolean(project.publishedEn && project.titleEn?.trim() && (project.summaryEn?.trim() || project.descriptionEn?.trim()))
      return Boolean(project.publishedFr && project.titleFr?.trim() && (project.summaryFr?.trim() || project.descriptionFr?.trim()))
    })

    if (validProjects.length > 0) {
      const featured = validProjects.find((project) => project.isFeatured) || validProjects[0]
      const secondaries = validProjects.filter((project) => project.id !== featured.id).slice(0, 2)
      const localizedTitle = (project: any) => safeLang === "DE" ? project.titleDe : safeLang === "EN" ? project.titleEn : project.titleFr
      const localizedDescription = (project: any) => safeLang === "DE" ? project.summaryDe || project.descriptionDe : safeLang === "EN" ? project.summaryEn || project.descriptionEn : project.summaryFr || project.descriptionFr
      const localizedDomain = (project: any) => safeLang === "DE" ? project.domaine?.nameDe ?? "" : safeLang === "EN" ? project.domaine?.nameEn ?? "" : project.domaine?.nameFr ?? ""
      return {
        flagshipProject: {
          title: localizedTitle(featured),
          desc: localizedDescription(featured),
          loc: featured.location || featured.country || "",
          program: localizedDomain(featured),
          kpi: featured.beneficiaries ?? "",
          image: featured.featuredImage || "/photo-projet-phare.jpg",
          slug: featured.slug,
        },
        secondaryProjects: secondaries.map((project: any, index: number) => ({
          num: String(index + 2).padStart(2, "0"),
          title: localizedTitle(project),
          desc: localizedDescription(project),
          loc: project.location || project.country || "",
          slug: project.slug,
        })),
      }
    }

    return {
      flagshipProject: { title: "", desc: "", loc: "", program: "", kpi: "", image: "", slug: "" },
      secondaryProjects: [],
    }
  }, [dbProjects, safeLang])

  /* Testimonials list computation - Règle stricte : zéro mélange de langues.
     Repli localisé : si le CMS n'a aucune citation traduite dans la langue
     courante (quoteEn/quoteDe sont facultatifs), on affiche le contenu officiel
     statique de cette langue — jamais la version française. */
  const testimonialsList = React.useMemo(() => {
    const fromDb = dbTestimonials
      .map((testimonial) => ({
        quote: safeLang === "DE" ? testimonial.quoteDe : safeLang === "EN" ? testimonial.quoteEn : testimonial.quoteFr,
        author: testimonial.authorName as string,
        role: testimonial.authorRole as string,
        village: (testimonial.authorOrg ?? "") as string,
        photoUrl: testimonial.photoUrl as string | null | undefined,
      }))
      .filter((testimonial) => Boolean(testimonial.quote?.trim()))

    const fallback = [
      {
        quote: settings[`home_testimonial_1_quote_${l}`] || "",
        author: settings[`home_testimonial_1_author_${l}`] || "",
        role: settings[`home_testimonial_1_role_${l}`] || "",
        village: settings[`home_testimonial_1_location_${l}`] || "",
        photoUrl: undefined as string | undefined,
      },
      {
        quote: settings[`home_testimonial_2_quote_${l}`] || "",
        author: settings[`home_testimonial_2_author_${l}`] || "",
        role: settings[`home_testimonial_2_role_${l}`] || "",
        village: settings[`home_testimonial_2_location_${l}`] || "",
        photoUrl: undefined as string | undefined,
      },
      {
        quote: settings[`home_testimonial_3_quote_${l}`] || "",
        author: settings[`home_testimonial_3_author_${l}`] || "",
        role: settings[`home_testimonial_3_role_${l}`] || "",
        village: settings[`home_testimonial_3_location_${l}`] || "",
        photoUrl: undefined as string | undefined,
      },
    ].filter((testimonial) => Boolean(testimonial.quote?.trim()))

    const source = fromDb.length > 0 ? fromDb : fallback

    return source.map((testimonial, idx) => ({
      num: String(idx + 1).padStart(2, "0"),
      ...testimonial,
    }))
  }, [dbTestimonials, safeLang, c.testimonials])

  /* Newsletter state */
  const [nlEmail, setNlEmail] = useState("")
  const [nlName, setNlName] = useState("")
  const [nlConsent, setNlConsent] = useState(true)
  const [nlSubmitting, setNlSubmitting] = useState(false)
  const [nlMessage, setNlMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNlMessage(null)

    if (!nlName.trim()) {
      setNlMessage({ type: "error", text: c.newsletter.errName })
      return
    }
    if (!nlEmail || !nlEmail.includes("@")) {
      setNlMessage({ type: "error", text: c.newsletter.errEmail })
      return
    }
    if (!nlConsent) {
      setNlMessage({ type: "error", text: c.newsletter.errConsent })
      return
    }

    setNlSubmitting(true)
    try {
      const res = await subscribeNewsletter({
        email: nlEmail,
        firstName: nlName.trim(),
        lang: safeLang,
        consent: nlConsent,
        // Attribution first-touch (indépendante du consentement Analytics)
        ...getUtmSubmissionFields(),
      })
      if (res.success) {
        if ("alreadySubscribed" in res && res.alreadySubscribed) {
          setNlMessage({ type: "info", text: c.newsletter.alreadySubscribed })
        } else {
          setNlMessage({ type: "success", text: c.newsletter.success })
          setNlEmail("")
          setNlName("")
          trackEvent("newsletter_subscribe", { lang: safeLang })
        }
      } else {
        setNlMessage({ type: "error", text: c.newsletter.errGeneral })
      }
    } catch {
      setNlMessage({ type: "error", text: c.newsletter.errGeneral })
    } finally {
      setNlSubmitting(false)
    }
  }

  /* Testimonial carousel state */
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  /* Recalage de l'index si la liste change (changement de langue) */
  React.useEffect(() => {
    setActiveTestimonial((prev) => (prev >= testimonialsList.length ? 0 : prev))
  }, [testimonialsList.length])

  return (
    <div className="w-full bg-white text-[#16324A] antialiased overflow-x-clip" style={{ fontFamily: "var(--font-aptic-montserrat), system-ui, sans-serif" }}>

      {/* ═══════════════════════════════════════════════════════════════════════════
          01. HERO (FORTE) — PHOTO + OVERLAY #003366 + ACCENT #28A745 + CTA #007BFF
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[720px] lg:min-h-[820px] xl:min-h-[860px] flex items-center overflow-hidden">
        {/* Photographie de fond */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/hero-aptic-official.avif" type="image/avif" />
            <source srcSet="/hero-aptic-official.webp" type="image/webp" />
            <img
              src="/hero-aptic-official.jpg"
              width={1376}
              height={768}
              alt="APTIC-R — Le numérique au service des territoires ruraux"
              className="w-full h-full object-cover object-[center_35%] lg:object-[68%_40%]"
              fetchPriority="high"
              decoding="async"
            />
          </picture>

          {/* Overlay progressif horizontal sur desktop : sombre à gauche, lumineux à droite */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(0, 51, 102, 0.88) 0%, rgba(0, 51, 102, 0.70) 50%, rgba(0, 51, 102, 0.40) 100%)",
            }}
          />

          {/* Overlay vertical progressif sur mobile et tablette */}
          <div
            className="absolute inset-0 block lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 51, 102, 0.90) 0%, rgba(0, 51, 102, 0.76) 60%, rgba(0, 51, 102, 0.45) 100%)",
            }}
          />

          {/* Dégradé ultra-fin au ras du bas */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 lg:h-14 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 60%, #FFFFFF 100%)",
            }}
          />
        </div>

        {/* Conteneur global : contenu aligné à gauche avec grande largeur disponible */}
        <div className="relative z-10 max-w-[1350px] w-full mx-auto px-6 sm:px-10 lg:px-16 pt-36 sm:pt-44 lg:pt-48 pb-20 sm:pb-28 lg:pb-32">
          <div className="w-full max-w-[850px] lg:max-w-[960px] xl:max-w-[1050px] mr-auto text-left">
            
            {/* Badge territorial épuré et sobre */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm text-white text-xs sm:text-[13px] font-semibold tracking-[0.18em] uppercase mb-6">
              <span>{c.hero.territoryBadge}</span>
            </div>

            {/* H1 : Respiration horizontale en 2 lignes naturelles, 100% blanc */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] xl:text-[76px] font-black text-white leading-[1.04] tracking-tight mb-6 max-w-[1050px]">
              <span className="block">{c.hero.titleLine1}</span>
              <span className="block">{c.hero.titleLine2}</span>
            </h1>

            {/* Paragraphe sous-titre */}
            <p className="text-base sm:text-lg lg:text-[20px] text-white/85 font-normal leading-[1.65] mb-10 max-w-[760px]">
              {c.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 mb-14 max-w-[850px]">
              <button
                onClick={() => {
                  trackEvent("institutional_hero_projects", { lang: safeLang })
                  navigate("projects")
                }}
                className="inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 sm:py-4.5 rounded-xl font-bold text-sm sm:text-base text-white transition-all shadow-lg hover:brightness-105 cursor-pointer whitespace-nowrap shrink-0"
                style={{ backgroundColor: BLUE_TECH }}
              >
                <span>{c.hero.ctaProjects}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("engagement-section")
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                  else navigate("volunteering")
                }}
                className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-9 py-4 sm:py-4.5 rounded-xl font-bold text-sm sm:text-base text-white bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/35 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{c.hero.ctaGetInvolved}</span>
              </button>
            </div>

            {/* Repères / Chiffres du Hero — 100% blancs, sobres */}
            <div className="grid grid-cols-3 gap-8 sm:gap-12 pt-8 border-t border-white/15 max-w-[620px]">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">{c.hero.statYears}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1.5 leading-snug">{c.hero.statYearsDesc}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">{c.hero.statVillages}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1.5 leading-snug">{c.hero.statVillagesDesc}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">{c.hero.statSolar}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1.5 leading-snug">{c.hero.statSolarDesc}</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          02. À PROPOS (MOYENNE) — FOND BLANC (#FFFFFF)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: WHITE }}>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Colonne narrative gauche */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] mb-3 text-[#003366]">
                  {c.about.eyebrow}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black leading-[1.12] tracking-tight" style={{ color: BLUE_INST }}>
                  {c.about.title}
                </h2>
              </div>

              {/* Citation sobre */}
              <div className="p-7 sm:p-8 rounded-2xl border" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}>
                <p className="text-base sm:text-lg lg:text-[19px] font-semibold leading-relaxed italic" style={{ color: TEXT_MAIN }}>
                  {c.about.headline}
                </p>
              </div>

              {/* Paragraphes de récit */}
              <div className="space-y-5 text-base sm:text-[17px] leading-[1.8]" style={{ color: TEXT_MUTED }}>
                <p>{c.about.p1}</p>
                <p>{c.about.p2}</p>
              </div>

              {/* Triptyque institutionnel unifié avec ancres directes */}
              <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t" style={{ borderColor: BORDER }}>
                <Link 
                  href={`/${safeLang.toLowerCase()}/a-propos#histoire`} 
                  className="group/item block p-3.5 -m-3.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest group-hover/item:text-[#007BFF] transition-colors" style={{ color: BLUE_INST }}>
                      {c.about.historyTitle}
                    </h3>
                    <span className="text-xs text-slate-400 group-hover/item:translate-x-0.5 group-hover/item:text-[#007BFF] transition-all">{"\u2192"}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{c.about.historySummary}</p>
                </Link>

                <Link 
                  href={`/${safeLang.toLowerCase()}/a-propos#missions`} 
                  className="group/item block p-3.5 -m-3.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest group-hover/item:text-[#007BFF] transition-colors" style={{ color: BLUE_INST }}>
                      {c.about.missionTitle}
                    </h3>
                    <span className="text-xs text-slate-400 group-hover/item:translate-x-0.5 group-hover/item:text-[#007BFF] transition-all">{"\u2192"}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{c.about.missionSummary}</p>
                </Link>

                <Link 
                  href={`/${safeLang.toLowerCase()}/a-propos#missions`} 
                  className="group/item block p-3.5 -m-3.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest group-hover/item:text-[#007BFF] transition-colors" style={{ color: BLUE_INST }}>
                      {c.about.visionTitle}
                    </h3>
                    <span className="text-xs text-slate-400 group-hover/item:translate-x-0.5 group-hover/item:text-[#007BFF] transition-all">{"\u2192"}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{c.about.visionSummary}</p>
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href={`/${safeLang.toLowerCase()}/a-propos`}
                  className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider cursor-pointer group"
                  style={{ color: BLUE_TECH }}
                >
                  <span className="underline underline-offset-8 group-hover:no-underline">{c.about.moreBtn}</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1.5">{"\u2192"}</span>
                </Link>
              </div>
            </div>

            {/* Photo documentaire droite */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/5">
                  {settings["about_story_image"] ? (
                    <OptimizedPhoto
                      src={settings["about_story_image"]}
                      alt={c.about.altPhoto}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-[center_30%]"
                    />
                  ) : null}
                </div>
                <div className="p-6 sm:p-7 text-white" style={{ backgroundColor: BLUE_INST }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                      {settings["about_story_tag"] ?? ""}
                    </span>
                    <span className="text-[11px] font-mono text-white/50">
                      {settings["about_story_location"] ?? ""}
                    </span>
                  </div>
                  <p className="text-xs text-white/85 leading-relaxed">
                    {c.about.photoCaption}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          03. SIX DOMAINES (MOYENNE) — FOND GRIS TRÈS CLAIR (#F7F8FA)
          Cartes agrandies avec vraie présence (3 col x 2 lignes, titres 22px, icônes 44px)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: LIGHT_BG }}>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20">
          
          <div className="max-w-4xl mb-12 sm:mb-14">
            <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] mb-3 text-[#003366]">
              {c.domains.tag}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black leading-[1.12] tracking-tight mb-4" style={{ color: BLUE_INST }}>
              {domainsList.length > 0 ? `${domainsList.length} Domaines d'Action Stratégiques` : c.domains.title}
            </h2>
            <p className="text-base sm:text-lg lg:text-[19px] leading-relaxed max-w-3xl" style={{ color: TEXT_MUTED }}>
              {c.domains.subtitle}
            </p>
          </div>

          {/* Grille dynamique des Domaines CMS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {domainsList.map((d, index) => (
              <div
                key={d.slug || d.num}
                className="rounded-3xl p-8 sm:p-10 lg:p-11 border transition-all duration-300 flex flex-col justify-between min-h-[380px] sm:min-h-[410px] hover:shadow-xl group"
                style={{ backgroundColor: WHITE, borderColor: BORDER }}
              >
                <div>
                  {/* Entête numéro sobre + Icône agrandie et mise en valeur */}
                  <div className="flex items-center justify-between pb-6 mb-6 border-b" style={{ borderColor: BORDER }}>
                    <span className="font-mono text-3xl sm:text-4xl font-black text-[#003366]/20">
                      {d.num}
                    </span>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-[#003366]/5" style={{ color: BLUE_INST, backgroundColor: LIGHT_BG }}>
                      <DomainCharterIcon code={d.code} index={index} size={44} className="w-10 h-10" />
                    </div>
                  </div>

                  {/* Titre du domaine : 20–22px, fort et lisible */}
                  <h3 className="text-xl sm:text-[22px] font-black mb-4 leading-snug tracking-tight" style={{ color: BLUE_INST }}>
                    {d.title}
                  </h3>

                  {/* Description narrative : 15–16px avec bonne respiration */}
                  <p className="text-[15px] sm:text-[16px] leading-relaxed" style={{ color: TEXT_MUTED }}>
                    {d.desc}
                  </p>
                </div>

                {/* Lien d'action en #007BFF */}
                <div className="pt-6 mt-8 border-t" style={{ borderColor: BORDER }}>
                  <button
                    onClick={() => {
                      const url = getPageUrl("domains", lang)
                      window.location.href = `${url}#${d.slug}`
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer group-hover:translate-x-1.5 transition-transform"
                    style={{ color: BLUE_TECH }}
                  >
                    <span>{c.domains.discoverLabel}</span>
                    <span className="text-base">{"\u2192"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => navigate("domains")}
              className="inline-flex items-center gap-3 px-10 py-4.5 rounded-xl text-sm font-bold border transition-all cursor-pointer shadow-sm hover:shadow-md"
              style={{ color: BLUE_INST, borderColor: BORDER, backgroundColor: WHITE }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BLUE_INST; e.currentTarget.style.color = WHITE }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = BLUE_INST }}
            >
              <span>
                {safeLang === "DE"
                  ? `Alle ${domainsList.length} Bereiche im Detail ansehen`
                  : safeLang === "EN"
                  ? `Explore our ${domainsList.length} domains in detail`
                  : `Consulter la fiche détaillée de nos ${domainsList.length} domaines`}
              </span>
              <span className="text-base">{"\u2192"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          04. IMPACT / CHIFFRES (FORTE) — BLEU INSTITUTIONNEL MAJEUR (#003366)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 sm:py-36 w-full text-white relative overflow-hidden" style={{ backgroundColor: BLUE_INST }}>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20">
          
          <div className="mb-16 sm:mb-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold uppercase tracking-[0.2em] mb-4 text-white">
              <span>{c.impact.tag}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white mt-2 leading-tight">
              {c.impact.title}
            </h2>
          </div>

          {/* Grille des 4 chiffres — Tous en blanc pur, autorité et prestige */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { val: c.impact.stat1Val, lbl: c.impact.stat1Lbl, sub: c.impact.stat1Sub },
              {
                val: String(domainsList.length || 6).padStart(2, "0"),
                lbl: c.impact.stat2Lbl,
                sub: c.impact.stat2Sub,
              },
              { val: c.impact.stat3Val, lbl: c.impact.stat3Lbl, sub: c.impact.stat3Sub },
              { val: c.impact.stat4Val, lbl: c.impact.stat4Lbl, sub: c.impact.stat4Sub },
            ].map((s, i) => (
              <div key={i} className="p-6">
                <div className="text-5xl sm:text-7xl lg:text-[80px] font-black font-mono tracking-tight text-white leading-none">
                  {s.val}
                </div>
                <div className="text-sm sm:text-base font-bold text-white uppercase tracking-wide mt-6">
                  {s.lbl}
                </div>
                <div className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Mention d'accréditation légale officielle */}
          <div className="mt-16 pt-8 border-t border-white/15 text-center text-xs text-white/50 font-mono">
            {c.impact.legalNotice}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          05. PROJETS (FORTE) — FOND BLANC (#FFFFFF)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 sm:py-36" style={{ backgroundColor: WHITE }}>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 sm:mb-16">
            <div>
              <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] mb-3 text-[#003366]">
                {c.projects.tag}
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.08] tracking-tight" style={{ color: BLUE_INST }}>
                {c.projects.title}
              </h2>
            </div>
            <button
              onClick={() => navigate("projects")}
              className="text-sm sm:text-base font-bold hover:underline cursor-pointer self-start sm:self-auto flex items-center gap-2"
              style={{ color: BLUE_TECH }}
            >
              <span>{c.projects.allProjectsBtn}</span>
              <span className="text-lg">{"\u2192"}</span>
            </button>
          </div>

          {/* Projet phare : composition 7/5 avec photographie forte et fond neutre */}
          <div className="rounded-3xl border overflow-hidden shadow-lg mb-12 sm:mb-14" style={{ backgroundColor: WHITE, borderColor: BORDER }}>
            <div className="grid lg:grid-cols-12">
              
              <div className="lg:col-span-7 relative min-h-[420px] sm:min-h-[520px]" style={{ backgroundColor: LIGHT_BG }}>
                {flagshipProject.image ? (
                  <OptimizedPhoto
                    src={flagshipProject.image}
                    alt={flagshipProject.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                ) : null}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 shadow-sm" style={{ color: BLUE_INST }}>
                    {c.projects.flagshipBadge}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-10 sm:p-14 lg:p-16 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono mb-5" style={{ color: TEXT_MUTED }}>
                    <span>{"\uD83D\uDCCD"}</span>
                    <span>{flagshipProject.loc}</span>
                    <span>{"\u2022"}</span>
                    <span>{flagshipProject.program}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black mb-6 leading-snug" style={{ color: BLUE_INST }}>
                    {flagshipProject.title}
                  </h3>

                  <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: TEXT_MUTED }}>
                    {flagshipProject.desc}
                  </p>
                </div>

                <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: BORDER }}>
                  <div className="text-sm sm:text-base font-bold" style={{ color: TEXT_MAIN }}>
                    <span>{flagshipProject.kpi}</span>
                  </div>
                  <button
                    onClick={() => {
                      const url = getPageUrl("projects", lang)
                      window.location.href = `${url}#${flagshipProject.slug}`
                    }}
                    className="px-7 py-4 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:brightness-110 cursor-pointer self-start sm:self-auto"
                    style={{ backgroundColor: BLUE_TECH }}
                  >
                    {c.projects.flagshipBtn} {"\u2192"}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Deux projets secondaires avec bordures neutres unifiées */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
            {secondaryProjects.map((p, i) => (
              <div
                key={p.slug || i}
                className="rounded-3xl p-10 sm:p-14 border hover:shadow-md transition-all flex flex-col justify-between"
                style={{ backgroundColor: WHITE, borderColor: BORDER }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono block" style={{ color: TEXT_MUTED }}>{"\uD83D\uDCCD"} {p.loc}</span>
                    <span className="text-xs font-mono font-bold text-[#003366]/30">{c.projects.projectLabel} {p.num}</span>
                  </div>
                  <h4 className="text-2xl sm:text-[26px] font-bold mb-4 leading-snug" style={{ color: BLUE_INST }}>
                    {p.title}
                  </h4>
                  <p className="text-base leading-relaxed mb-8" style={{ color: TEXT_MUTED }}>
                    {p.desc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const url = getPageUrl("projects", lang)
                    window.location.href = `${url}#${p.slug}`
                  }}
                  className="inline-flex items-center gap-2 text-sm font-bold hover:underline self-start cursor-pointer"
                  style={{ color: BLUE_TECH }}
                >
                  <span>{c.projects.viewResultsBtn}</span>
                  <span>{"\u2192"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          06. PRÉSENCE TERRAIN (FORTE) — PHOTO PLEINE LARGEUR + OVERLAY #003366
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/photo-recit-documentaire.avif" type="image/avif" />
            <source srcSet="/photo-recit-documentaire.webp" type="image/webp" />
            <img
              src="/photo-recit-documentaire.jpg"
              width={1024}
              height={420}
              alt={c.fieldReport.photoAlt}
              className="w-full h-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 51, 102, 0.88) 0%, rgba(0, 51, 102, 0.80) 50%, rgba(13, 27, 42, 0.94) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-20 py-28 sm:py-36 text-center text-white">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8 text-white/90">
            {c.fieldReport.tag}
          </span>
          <blockquote className="text-3xl sm:text-5xl lg:text-[54px] font-black mb-8 sm:mb-10 leading-[1.12] tracking-tight max-w-4xl mx-auto">
            {c.fieldReport.title}
          </blockquote>
          <p className="text-lg sm:text-xl lg:text-[22px] text-white/90 leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
            {"\u00AB"} {c.fieldReport.quote} {"\u00BB"}
          </p>
          <div className="inline-flex flex-col items-center gap-1 border-t border-white/20 pt-6">
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              {c.fieldReport.author}
            </span>
            <span className="text-xs font-mono text-white/70">
              {c.fieldReport.location}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          07. ENGAGEMENT (MOYENNE) — FOND GRIS TRÈS CLAIR (#F7F8FA)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="engagement-section" className="py-20 sm:py-28" style={{ backgroundColor: LIGHT_BG }}>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20">
          
          <div className="max-w-4xl mb-12 sm:mb-14">
            <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] mb-3 text-[#003366]">
              {c.getInvolved.tag}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black leading-[1.12] tracking-tight mb-4" style={{ color: BLUE_INST }}>
              {c.getInvolved.title}
            </h2>
            <p className="text-base sm:text-lg lg:text-[19px] leading-relaxed max-w-3xl" style={{ color: TEXT_MUTED }}>
              {c.getInvolved.subtitle}
            </p>
          </div>

          {/* Grille 2×2 — 4 cartes unifiées */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
            {[
              {
                track: c.getInvolved.path1Track,
                tag: c.getInvolved.path1Duration,
                title: c.getInvolved.path1Title,
                desc: c.getInvolved.path1Desc,
                btn: c.getInvolved.path1Btn,
                targetPage: "volunteering" as Page,
              },
              {
                track: c.getInvolved.path2Track,
                tag: c.getInvolved.path2Tag,
                title: c.getInvolved.path2Title,
                desc: c.getInvolved.path2Desc,
                btn: c.getInvolved.path2Btn,
                targetPage: "membership" as Page,
              },
              {
                track: c.getInvolved.path3Track,
                tag: c.getInvolved.path3Tag,
                title: c.getInvolved.path3Title,
                desc: c.getInvolved.path3Desc,
                btn: c.getInvolved.path3Btn,
                targetPage: "partner" as Page,
              },
              {
                track: c.getInvolved.path4Track,
                tag: c.getInvolved.path4Tag,
                title: c.getInvolved.path4Title,
                desc: c.getInvolved.path4Desc,
                btn: c.getInvolved.path4Btn,
                targetPage: "support" as Page,
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="rounded-3xl p-10 sm:p-12 lg:p-14 border transition-all duration-300 flex flex-col justify-between min-h-[420px] hover:shadow-xl group"
                style={{ backgroundColor: WHITE, borderColor: BORDER }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BLUE_INST }}>
                      {card.track}
                    </span>
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full border" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER, color: TEXT_MUTED }}>
                      {card.tag}
                    </span>
                  </div>

                  {/* Titre H3 */}
                  <h3 className="text-2xl sm:text-3xl font-black mb-5 leading-tight" style={{ color: BLUE_INST }}>
                    {card.title}
                  </h3>

                  {/* Description narrative */}
                  <p className="text-base sm:text-lg leading-relaxed max-w-md mb-8" style={{ color: TEXT_MUTED }}>
                    {card.desc}
                  </p>
                </div>

                {/* Bouton d'action en #007BFF */}
                <div>
                  <button
                    onClick={() => navigate(card.targetPage)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm sm:text-base text-white transition-all shadow-md hover:brightness-110 cursor-pointer text-center inline-flex items-center justify-center gap-3"
                    style={{ backgroundColor: BLUE_TECH }}
                  >
                    <span>{card.btn}</span>
                    <span className="text-lg">{"\u2192"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Zone réseaux sociaux : Suivez nos actions et découvrez nos projets au quotidien */}
          <div
            className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 rounded-2xl px-6 py-5"
            style={{
              borderColor: BORDER,
              backgroundColor: "rgba(255, 255, 255, 0.75)",
            }}
          >
            <p
              className="text-sm sm:text-base font-semibold text-center sm:text-left"
              style={{ color: BLUE_INST }}
            >
              {c.getInvolved.socialFollow}
            </p>
            <div className="shrink-0">
              <SocialLinks variant="section" overrides={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          08. TÉMOIGNAGES (MOYENNE) — FOND BLANC (#FFFFFF)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: WHITE }}>
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-20">
          
          <div className="flex items-center justify-between mb-12 sm:mb-14">
            <div>
              <div className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] mb-3 text-[#003366]">
                {c.testimonials.eyebrow}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black" style={{ color: BLUE_INST }}>
                {c.testimonials.title}
              </h2>
            </div>
            {/* Sélecteur sobre */}
            <div className="flex items-center gap-2">
              {testimonialsList.map((item, idx) => (
                <button
                  key={item.num}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-11 h-11 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border ${
                    activeTestimonial === idx
                      ? "text-white shadow-sm"
                      : "hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor: activeTestimonial === idx ? BLUE_INST : WHITE,
                    borderColor: activeTestimonial === idx ? BLUE_INST : BORDER,
                    color: activeTestimonial === idx ? WHITE : TEXT_MUTED,
                  }}
                >
                  {item.num}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-14 lg:p-16 rounded-3xl border relative" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}>
            <span className="absolute top-8 right-10 text-7xl sm:text-8xl font-serif text-[#003366]/10 select-none pointer-events-none">
              “
            </span>
            <p className="text-lg sm:text-2xl lg:text-[28px] font-semibold leading-relaxed italic mb-10 relative z-10" style={{ color: BLUE_INST }}>
              {"\u00AB"} {testimonialsList[activeTestimonial]?.quote ?? ""} {"\u00BB"}
            </p>
            <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: BORDER }}>
              <div>
                <div className="text-lg sm:text-xl font-black" style={{ color: BLUE_INST }}>
                  {testimonialsList[activeTestimonial]?.author ?? ""}
                </div>
                <div className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
                  {testimonialsList[activeTestimonial]?.role ?? ""}
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1.5 rounded-full border bg-white" style={{ borderColor: BORDER, color: TEXT_MUTED }}>
                {"\uD83D\uDCCD"} {testimonialsList[activeTestimonial]?.village ?? ""}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          09. LETTRE D'INFORMATION (LÉGÈRE) — FOND GRIS TRÈS CLAIR (#F7F8FA)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: LIGHT_BG }}>
        <div className="max-w-[880px] mx-auto px-6 sm:px-12">
          <div className="text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[#003366]">
              {c.newsletter.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: BLUE_INST }}>
              {c.newsletter.title}
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: TEXT_MUTED }}>
              {c.newsletter.desc}
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="space-y-4 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder={c.newsletter.namePlaceholder}
                value={nlName}
                onChange={(e) => setNlName(e.target.value)}
                className="w-full sm:flex-1 px-5 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ backgroundColor: WHITE, borderColor: BORDER, color: TEXT_MAIN } as React.CSSProperties}
              />
              <input
                type="email"
                required
                placeholder={c.newsletter.emailPlaceholder}
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                className="w-full sm:flex-1 px-5 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ backgroundColor: WHITE, borderColor: BORDER, color: TEXT_MAIN } as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={nlSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-colors cursor-pointer disabled:opacity-60 shadow-sm whitespace-nowrap"
                style={{ backgroundColor: BLUE_TECH }}
              >
                {nlSubmitting ? c.newsletter.btnLoading : c.newsletter.btn}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs pt-1" style={{ color: TEXT_MUTED }}>
              <input
                type="checkbox"
                checked={nlConsent}
                onChange={(e) => setNlConsent(e.target.checked)}
                className="rounded border-gray-300 cursor-pointer"
                style={{ accentColor: BLUE_INST }}
              />
              <span>{c.newsletter.consent}</span>
            </div>

            {nlMessage && (
              <p
                role={nlMessage.type === "error" ? "alert" : "status"}
                className="text-xs sm:text-[13px] leading-relaxed pt-1"
                style={{
                  color:
                    nlMessage.type === "error"
                      ? "#B42318"
                      : nlMessage.type === "info"
                      ? BLUE_INST
                      : "#1B7A3D",
                }}
              >
                {nlMessage.text}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          10. CONTACT & TERRITOIRE (LÉGÈRE) — FOND BLANC (#FFFFFF)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: WHITE }}>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            <div className="lg:col-span-6 space-y-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2.5 text-[#003366]">
                  {c.contact.tag}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black leading-[1.12] tracking-tight mb-4" style={{ color: BLUE_INST }}>
                  {c.contact.title}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: TEXT_MUTED }}>
                  {c.contact.subtitle}
                </p>
              </div>

              <div className="border-t pt-8 space-y-6" style={{ borderColor: BORDER }}>
                {contactEmail && <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>
                    {c.contact.emailLabel}
                  </span>
                  <a
                    href={contactEmail ? `mailto:${contactEmail}` : undefined}
                    className="font-mono text-base sm:text-lg font-bold hover:underline"
                    style={{ color: BLUE_INST }}
                  >
                    {contactEmail}
                  </a>
                </div>}

                {contactPhone && <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>
                    {c.contact.phoneLabel}
                  </span>
                  <a
                    href={contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, "")}` : undefined}
                    className="font-mono text-base sm:text-lg font-bold hover:underline flex items-center gap-2"
                    style={{ color: BLUE_INST }}
                  >
                    <span>{contactPhone}</span>
                  </a>
                </div>}

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>
                    {c.contact.addressLabel}
                  </span>
                  <div className="text-sm sm:text-base font-bold" style={{ color: TEXT_MAIN }}>
                    {publicAddress}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                    {publicAddressDetail}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <button
                  onClick={() => navigate("contact")}
                  className="px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:brightness-110 cursor-pointer"
                  style={{ backgroundColor: BLUE_TECH }}
                >
                  {c.contact.contactBtn}
                </button>
                {contactWhatsappDigits && <a
                  href={contactWhatsappDigits ? `https://wa.me/${contactWhatsappDigits}` : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold border transition-colors inline-flex items-center gap-2"
                  style={{ borderColor: BORDER, color: BLUE_INST, backgroundColor: WHITE }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
                  <span>{c.contact.whatsappBtn}</span>
                </a>}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden border shadow-sm flex flex-col" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}>
                
                {/* Carte interactive OpenStreetMap */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-100 border-b" style={{ borderColor: BORDER }}>
                  <iframe
                    title="Carte Agbélouvé APTIC-R"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    loading="lazy"
                    src={mapConfigured ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapLongitude) - 0.035}%2C${Number(mapLatitude) - 0.03}%2C${Number(mapLongitude) + 0.035}%2C${Number(mapLatitude) + 0.03}&layer=mapnik&marker=${mapLatitude}%2C${mapLongitude}` : undefined}
                    className={`w-full h-full filter contrast-[1.02] ${mapConfigured ? "" : "hidden"}`}
                  />
                  
                  {/* Badge d'ancrage territorial superposé */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border shadow-xs text-xs space-y-0.5" style={{ borderColor: BORDER }}>
                    <div className="font-bold flex items-center gap-1.5" style={{ color: BLUE_INST }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
                      <span>{mapLabel}</span>
                    </div>
                    <div style={{ color: TEXT_MUTED }}>{publicAddressDetail}</div>
                  </div>

                  <a
                    href={mapConfigured ? `https://www.openstreetmap.org/#map=${mapZoom}/${mapLatitude}/${mapLongitude}` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border text-[11px] font-bold shadow-xs hover:bg-white transition-colors inline-flex items-center gap-1 ${mapConfigured ? "" : "hidden"}`}
                    style={{ color: BLUE_TECH, borderColor: BORDER }}
                  >
                    <span>OSM</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Détails d'accès sous la carte */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black" style={{ color: BLUE_INST }}>
                        {publicAddress}
                      </h3>
                      <p className="text-xs font-mono mt-0.5" style={{ color: TEXT_MUTED }}>
                        {publicAddressDetail}
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-white shrink-0" style={{ borderColor: BORDER, color: TEXT_MAIN }}>
                      {c.contact.fieldPresenceBadge}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border bg-white" style={{ borderColor: BORDER }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: BLUE_INST }}>
                      {c.contact.accessBoxTitle}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>
                      {contactAccessInfo}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-[#7A8A9A]">
                    <span>{c.contact.legalRegStatus}</span>
                    <button
                      onClick={() => navigate("contact")}
                      className="font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      style={{ color: BLUE_TECH }}
                    >
                      <span>Plan d&apos;accès détaillé</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BANDEAU COMPACT : SUIVEZ APTIC-R (AVANT LE FOOTER)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-10 sm:py-12 border-t"
        style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}
        aria-label="Réseaux sociaux APTIC-R"
      >
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-20">
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl bg-white border shadow-xs"
            style={{ borderColor: BORDER }}
          >
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-xl sm:text-2xl font-black" style={{ color: BLUE_INST }}>
                {c.socialBanner.title}
              </h3>
              <p className="text-xs sm:text-sm max-w-xl" style={{ color: TEXT_MUTED }}>
                {c.socialBanner.subtitle}
              </p>
            </div>
            <div className="shrink-0">
              <SocialLinks variant="banner" overrides={settings} />
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
