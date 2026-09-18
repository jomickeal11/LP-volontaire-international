"use client"

import React, { useState } from "react"
import Image from "next/image"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { trackEvent } from "@/lib/tracker"
import { subscribeNewsletter } from "@/lib/cms-actions"
import { ApticNodeMarker, ApticDash, ApticEyebrow } from "@/components/ApticMarker"

import { DomainCharterIcon } from "@/components/DomainIcons"

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
      namePlaceholder: "Votre prénom (optionnel)",
      emailPlaceholder: "Votre adresse e-mail",
      consent: "J\u2019accepte de recevoir les courriels d\u2019information d\u2019APTIC-R.",
      btn: "S\u2019inscrire",
      btnLoading: "Inscription...",
      success: "Merci ! Votre inscription a bien été enregistrée.",
      errEmail: "Veuillez entrer une adresse email valide.",
      errConsent: "Veuillez accepter de recevoir la lettre d\u2019information.",
      errGeneral: "Une erreur est survenue lors de l\u2019inscription.",
    },
    contact: {
      tag: "CONTACT & TERRITOIRE",
      title: "Prenez Contact avec l\u2019APTIC-R",
      subtitle: "Vous souhaitez collaborer, devenir membre, proposer un projet de développement rural ou en savoir plus sur nos actions au Togo ?",
      addressLabel: "Siège de l\u2019association",
      addressVal: "Agbélouvé, Préfecture du Zio, Région Maritime, Togo",
      addressDetail: "Route Nationale 1 (Axe Lomé - Tsévié - Atakpamé, 60 km au nord de la capitale).",
      phoneLabel: "Téléphone & WhatsApp direct",
      phoneVal: "+228 91 20 19 90",
      emailLabel: "Courriel officiel",
      emailVal: "aptic.rural19@gmail.com",
      accessBoxTitle: "Accès & Déplacements",
      mapNotice: "Accès routier : Nationale 1 (Axe Lomé - Tsévié - Atakpamé), arrêt central Agbélouvé.",
      mapRegion: "Préfecture du Zio · Région Maritime",
      gpsLabel: "Coordonnées GPS : 6.6833° N, 1.1667° E",
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
      namePlaceholder: "First name (optional)", emailPlaceholder: "Email address",
      consent: "I agree to receive informative emails from APTIC-R.",
      btn: "Subscribe", btnLoading: "Subscribing...",
      success: "Thank you! You are now subscribed.",
      errEmail: "Please enter a valid email address.", errConsent: "Please agree to receive updates.", errGeneral: "An error occurred during subscription.",
    },
    contact: {
      tag: "CONTACT & TERRITORY", title: "Connect with APTIC-R",
      subtitle: "Interested in collaborating, joining as a member, proposing a rural development project, or learning more about our work in Togo?",
      addressLabel: "Headquarters", addressVal: "Agbélouvé, Zio Prefecture, Maritime Region, Togo",
      addressDetail: "National Road 1 (Lomé - Tsévié - Atakpamé corridor, 60 km north of Lomé).",
      phoneLabel: "Phone & WhatsApp", phoneVal: "+228 91 20 19 90",
      emailLabel: "Official Email", emailVal: "aptic.rural19@gmail.com",
      accessBoxTitle: "Access & Directions",
      mapNotice: "Road access: National Road 1 (Lomé - Tsévié - Atakpamé corridor), Agbélouvé central stop.",
      mapRegion: "Zio Prefecture · Maritime Region",
      gpsLabel: "GPS Coordinates: 6.6833° N, 1.1667° E",
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
      namePlaceholder: "Vorname (optional)", emailPlaceholder: "E-Mail-Adresse",
      consent: "Ich stimme dem Erhalt von Informationen von APTIC-R zu.",
      btn: "Anmelden", btnLoading: "Anmeldung...",
      success: "Vielen Dank! Ihre Anmeldung war erfolgreich.",
      errEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.", errConsent: "Bitte stimmen Sie dem Erhalt des Rundbriefs zu.", errGeneral: "Bei der Anmeldung ist ein Fehler aufgetreten.",
    },
    contact: {
      tag: "KONTAKT & STANDORT", title: "Kontakt zu APTIC-R",
      subtitle: "Möchten Sie kooperieren, Mitglied werden, ein Entwicklungsprojekt vorschlagen oder mehr über unsere Arbeit in Togo erfahren?",
      addressLabel: "Vereinssitz", addressVal: "Agbélouvé, Präfektur Zio, Region Maritime, Togo",
      addressDetail: "Nationalstraße 1 (Achse Lomé - Tsévié - Atakpamé, 60 km nördlich der Hauptstadt).",
      phoneLabel: "Telefon & WhatsApp", phoneVal: "+228 91 20 19 90",
      emailLabel: "Offizielle E-Mail", emailVal: "aptic.rural19@gmail.com",
      accessBoxTitle: "Anfahrt & Erreichbarkeit",
      mapNotice: "Anfahrt: Nationalstraße 1 (Achse Lomé - Tsévié - Atakpamé), Haltestelle Agbélouvé Zentrum.",
      mapRegion: "Präfektur Zio · Region Maritime",
      gpsLabel: "GPS-Koordinaten: 6.6833° N, 1.1667° E",
      legalRegStatus: "Eingetragener Verein N° 0586/MATDCL",
      fieldPresenceBadge: "Kontinuierliche Präsenz vor Ort",
      whatsappBtn: "Über WhatsApp schreiben", contactBtn: "Kontaktformular & Details",
    },
  },
}

export default function InstitutionalHome({ lang, navigate }: InstitutionalHomeProps) {
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const c = CONTENT[safeLang]

  const DOMAIN_IDS = [
    "agri-lowtech",
    "inclusion-numerique",
    "data-innovation",
    "cybersecurite-hygiene",
    "jeunesse-education",
    "dev-rural-fablabs",
  ]

  const [settings, setSettings] = useState<Record<string, string>>({})

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      getSiteSettings().then((res) => {
        if (res.success && res.dict) {
          setSettings((prev) => ({ ...prev, ...res.dict }))
        }
      }).catch(console.error)
    })
  }, [])

  /* Newsletter state */
  const [nlEmail, setNlEmail] = useState("")
  const [nlName, setNlName] = useState("")
  const [nlConsent, setNlConsent] = useState(true)
  const [nlSubmitting, setNlSubmitting] = useState(false)
  const [nlSuccess, setNlSuccess] = useState(false)
  const [nlError, setNlError] = useState("")

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlEmail || !nlEmail.includes("@")) {
      setNlError(c.newsletter.errEmail)
      return
    }
    if (!nlConsent) {
      setNlError(c.newsletter.errConsent)
      return
    }

    setNlSubmitting(true)
    setNlError("")
    try {
      const res = await subscribeNewsletter({
        email: nlEmail,
        firstName: nlName.trim() || undefined,
        lang: safeLang,
        consent: nlConsent,
      })
      if (res.success) {
        setNlSuccess(true)
        setNlEmail("")
        setNlName("")
        trackEvent("newsletter_subscribe", { lang: safeLang })
      } else {
        setNlError(res.error || c.newsletter.errGeneral)
      }
    } catch {
      setNlError(c.newsletter.errGeneral)
    } finally {
      setNlSubmitting(false)
    }
  }

  /* Testimonial carousel state */
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonialsList = [
    { quote: c.testimonials.t1Quote, author: c.testimonials.t1Author, role: c.testimonials.t1Role, village: c.testimonials.t1Village, num: "01" },
    { quote: c.testimonials.t2Quote, author: c.testimonials.t2Author, role: c.testimonials.t2Role, village: c.testimonials.t2Village, num: "02" },
  ]

  return (
    <div className="w-full bg-white text-[#16324A] antialiased overflow-x-clip" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>

      {/* ═══════════════════════════════════════════════════════════════════════════
          01. HERO (FORTE) — PHOTO + OVERLAY #003366 + ACCENT #28A745 + CTA #007BFF
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[720px] lg:min-h-[820px] xl:min-h-[860px] flex items-center overflow-hidden">
        {/* Photographie de fond */}
        <div className="absolute inset-0">
          <picture>
            <img
              src="/hero-aptic-official.jpg"
              alt="APTIC-R — Le numérique au service des territoires ruraux"
              className="w-full h-full object-cover object-[center_35%] lg:object-[68%_40%]"
              fetchPriority="high"
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

              {/* Triptyque institutionnel unifié */}
              <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t" style={{ borderColor: BORDER }}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: BLUE_INST }}>
                    {c.about.historyTitle}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{c.about.historySummary}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: BLUE_INST }}>
                    {c.about.missionTitle}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{c.about.missionSummary}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: BLUE_INST }}>
                    {c.about.visionTitle}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{c.about.visionSummary}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate("about")}
                  className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider cursor-pointer group"
                  style={{ color: BLUE_TECH }}
                >
                  <span className="underline underline-offset-8 group-hover:no-underline">{c.about.moreBtn}</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1.5">{"\u2192"}</span>
                </button>
              </div>
            </div>

            {/* Photo documentaire droite */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER }}>
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/5">
                  <picture>
                    <img
                      src={settings["about_story_image"] || "/photo-ancrage-togo.png"}
                      alt={c.about.altPhoto}
                      className="w-full h-full object-cover object-[center_30%]"
                    />
                  </picture>
                </div>
                <div className="p-6 sm:p-7 text-white" style={{ backgroundColor: BLUE_INST }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                      {settings["about_story_tag"] || c.about.photoTag}
                    </span>
                    <span className="text-[11px] font-mono text-white/50">
                      {settings["about_story_location"] || c.about.photoLoc}
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
              {c.domains.title}
            </h2>
            <p className="text-base sm:text-lg lg:text-[19px] leading-relaxed max-w-3xl" style={{ color: TEXT_MUTED }}>
              {c.domains.subtitle}
            </p>
          </div>

          {/* Grille 3x2 — Cartes plus hautes et spacieuses */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {c.domains.list.map((d, index) => (
              <div
                key={d.num}
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
                      <DomainCharterIcon index={index} size={44} className="w-10 h-10" />
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
                      const domId = DOMAIN_IDS[index] || "inclusion-numerique"
                      const url = getPageUrl("domains", lang)
                      window.location.href = `${url}#${domId}`
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
              <span>{c.domains.moreLink}</span>
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
              { val: c.impact.stat2Val, lbl: c.impact.stat2Lbl, sub: c.impact.stat2Sub },
              { val: c.impact.stat3Val, lbl: c.impact.stat3Lbl, sub: c.impact.stat3Sub },
              { val: c.impact.stat4Val, lbl: c.impact.stat4Lbl, sub: c.impact.stat4Sub },
            ].map((s, i) => (
              <div key={i} className={`p-6 ${i > 0 ? "lg:border-l border-white/15" : ""}`}>
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
                <picture>
                  <img
                    src="/photo-projet-phare.jpg"
                    alt={c.projects.flagshipAlt}
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
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
                    <span>{c.projects.flagshipLoc}</span>
                    <span>{"\u2022"}</span>
                    <span>{c.projects.flagshipProgram}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black mb-6 leading-snug" style={{ color: BLUE_INST }}>
                    {c.projects.flagshipTitle}
                  </h3>

                  <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: TEXT_MUTED }}>
                    {c.projects.flagshipDesc}
                  </p>
                </div>

                <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: BORDER }}>
                  <div className="text-sm sm:text-base font-bold" style={{ color: TEXT_MAIN }}>
                    <span>{c.projects.flagshipKpi}</span>
                  </div>
                  <button
                    onClick={() => navigate("projects")}
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
            {[
              { loc: c.projects.project2Loc, title: c.projects.project2Title, desc: c.projects.project2Desc, num: "02" },
              { loc: c.projects.project3Loc, title: c.projects.project3Title, desc: c.projects.project3Desc, num: "03" },
            ].map((p, i) => (
              <div
                key={i}
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
                  onClick={() => navigate("projects")}
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
          <img
            src="/photo-recit-documentaire.jpg"
            alt={c.fieldReport.photoAlt}
            className="w-full h-full object-cover object-center"
          />
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
              {"\u00AB"} {testimonialsList[activeTestimonial].quote} {"\u00BB"}
            </p>
            <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: BORDER }}>
              <div>
                <div className="text-lg sm:text-xl font-black" style={{ color: BLUE_INST }}>
                  {testimonialsList[activeTestimonial].author}
                </div>
                <div className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
                  {testimonialsList[activeTestimonial].role}
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1.5 rounded-full border bg-white" style={{ borderColor: BORDER, color: TEXT_MUTED }}>
                {"\uD83D\uDCCD"} {testimonialsList[activeTestimonial].village}
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

          {nlSuccess ? (
            <div className="p-5 rounded-2xl border text-center text-sm font-bold" style={{ backgroundColor: "#E6F7ED", borderColor: "#A8E6C3", color: "#1B7A3D" }}>
              {c.newsletter.success}
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="space-y-4 max-w-xl mx-auto">
              {nlError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {nlError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder={c.newsletter.emailPlaceholder}
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: WHITE, borderColor: BORDER, color: TEXT_MAIN } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={nlSubmitting}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-colors cursor-pointer disabled:opacity-60 shadow-sm whitespace-nowrap"
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
            </form>
          )}
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
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>
                    {c.contact.emailLabel}
                  </span>
                  <a
                    href="mailto:aptic.rural19@gmail.com"
                    className="font-mono text-base sm:text-lg font-bold hover:underline"
                    style={{ color: BLUE_INST }}
                  >
                    aptic.rural19@gmail.com
                  </a>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>
                    {c.contact.phoneLabel}
                  </span>
                  <a
                    href="https://wa.me/22891201990"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-base sm:text-lg font-bold hover:underline flex items-center gap-2"
                    style={{ color: BLUE_INST }}
                  >
                    <span>+228 91 20 19 90</span>
                    <span className="text-xs uppercase font-sans font-bold px-2 py-0.5 rounded border" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER, color: TEXT_MUTED }}>
                      WhatsApp
                    </span>
                  </a>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>
                    {c.contact.addressLabel}
                  </span>
                  <div className="text-sm sm:text-base font-bold" style={{ color: TEXT_MAIN }}>
                    {c.contact.addressVal}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                    {c.contact.addressDetail}
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
                <a
                  href="https://wa.me/22891201990"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold border transition-colors inline-flex items-center gap-2"
                  style={{ borderColor: BORDER, color: BLUE_INST, backgroundColor: WHITE }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
                  <span>{c.contact.whatsappBtn}</span>
                </a>
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
                    src="https://www.openstreetmap.org/export/embed.html?bbox=1.1550%2C6.5500%2C1.2250%2C6.6100&amp;layer=mapnik&amp;marker=6.5786%2C1.1894"
                    className="w-full h-full filter contrast-[1.02]"
                  />
                  
                  {/* Badge d'ancrage territorial superposé */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border shadow-xs text-xs space-y-0.5" style={{ borderColor: BORDER }}>
                    <div className="font-bold flex items-center gap-1.5" style={{ color: BLUE_INST }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
                      <span>Siège & FabLab APTIC-R</span>
                    </div>
                    <div style={{ color: TEXT_MUTED }}>Agbélouvé, RN1 (65 km nord Lomé)</div>
                  </div>

                  <a
                    href="https://www.openstreetmap.org/#map=13/6.5786/1.1894"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border text-[11px] font-bold shadow-xs hover:bg-white transition-colors"
                    style={{ color: BLUE_TECH, borderColor: BORDER }}
                  >
                    OSM ↗
                  </a>
                </div>

                {/* Détails d'accès sous la carte */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black" style={{ color: BLUE_INST }}>
                        Agbélouvé, Togo
                      </h3>
                      <p className="text-xs font-mono mt-0.5" style={{ color: TEXT_MUTED }}>
                        {c.contact.gpsLabel} · {c.contact.mapRegion}
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
                      {c.contact.mapNotice}
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

    </div>
  )
}
