"use client"

import React, { useState } from "react"
import Image from "next/image"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { trackEvent } from "@/lib/tracker"
import { subscribeNewsletter } from "@/lib/cms-actions"

interface InstitutionalHomeProps {
  lang: Language
  navigate: (page: Page) => void
}

/* ── Charte graphique institutionnelle APTIC-R ─────────────────────────────── */
const BLUE = "#174F7A"
const GREEN = "#35A85A"
const BG = "#F5F7F9"
const DARK = "#142332"

/* ── Textes & Contenus trilingues (FR / EN / DE) ─────────────────────────────── */
const CONTENT = {
  FR: {
    hero: {
      territoryBadge: "Agbélouvé · Région Maritime · Togo",
      titleLine1: "Le numérique au service",
      titleLine2: "des territoires ruraux.",
      subtitle:
        "Depuis Agbélouvé, l'APTIC-R co-construit avec les communautés paysannes et scolaires des solutions technologiques et solaires accessibles, réparables et émancipatrices.",
      ctaProjects: "Découvrir nos projets de terrain",
      ctaGetInvolved: "Comment s'engager avec nous",
      statYears: "Depuis 2018",
      statYearsDesc: "Ancrage communautaire au Togo",
      statVillages: "15+ villages",
      statVillagesDesc: "Écoles & groupements accompagnés",
      statSolar: "100%",
      statSolarDesc: "Maintenance locale & solaire",
    },
    about: {
      tag: "QUI SOMMES-NOUS ?",
      eyebrow: "DEPUIS 2018 · ANCRAGE AU TOGO",
      title: "Le numérique au service des territoires ruraux.",
      headline:
        "« Depuis 2018, l'APTIC-R accompagne les communautés rurales au Togo en mettant les technologies, les compétences et l'innovation au service des territoires. »",
      p1: "Née à Agbélouvé d'une volonté collective de professionnels togolais et de leaders communautaires, l'APTIC-R s'est constituée pour refuser la fatalité de la fracture numérique qui isole les campagnes d'Afrique de l'Ouest.",
      p2: "Notre démarche repose sur une conviction éprouvée sur le terrain : la technologie ne doit pas être un bien de consommation passif importé, mais un levier d'autonomie et de dignité maîtrisé, réparé et transmis localement par les jeunes et les femmes du milieu rural.",
      historyTitle: "Notre Histoire",
      historySummary: "Agbélouvé, Préfecture du Zio. Une racine villageoise inaltérable depuis 2018.",
      missionTitle: "Notre Mission",
      missionSummary: "Salles informatiques scolaires solaires, formation certifiante et low-tech agricole.",
      visionTitle: "Notre Vision",
      visionSummary: "Des territoires ruraux souverains, résilients et maîtres de leur destin numérique.",
      moreBtn: "En savoir plus sur l'APTIC-R et notre gouvernance",
      photoTag: "TERRAIN · AGBÉLOUVÉ",
      photoCaption: "Concertation avec les chefs de village et formateurs à Agbélouvé",
    },
    domains: {
      tag: "CE QUE NOUS FAISONS",
      title: "6 Domaines d'Action Stratégiques",
      subtitle:
        "Une approche intégrée qui conjugue éducation, énergie solaire autonome, souveraineté alimentaire et compétences du XXIe siècle.",
      list: [
        {
          num: "01",
          title: "Inclusion numérique & Éducation",
          desc: "Déploiement de salles informatiques alimentées à l'énergie solaire, dotation en ordinateurs reconditionnés et alphabétisation digitale dès l'école primaire.",
        },
        {
          num: "02",
          title: "Jeunesse & Compétences professionnelles",
          desc: "Formations certifiantes en bureautique, codage, maintenance matérielle et mentorat pour favoriser l'emploi et l'entrepreneuriat local sans exode.",
        },
        {
          num: "03",
          title: "Cybersécurité & Citoyenneté numérique",
          desc: "Sensibilisation des communautés aux bonnes pratiques en ligne, protection des données personnelles, hygiène numérique et lutte contre la désinformation.",
        },
        {
          num: "04",
          title: "Agriculture durable & Low-Tech",
          desc: "Conception de capteurs d'humidité solaires, systèmes d'irrigation goutte-à-goutte automatisés et outils sobres adaptés aux groupements maraîchers.",
        },
        {
          num: "05",
          title: "Données & Innovation de terrain",
          desc: "Collecte participative et cartographie des données rurales pour mesurer l'impact, orienter les politiques de développement et éclairer les bailleurs.",
        },
        {
          num: "06",
          title: "Développement rural communautaire",
          desc: "Renforcement des capacités des coopératives villageoises, autonomisation des groupements de femmes et maintenance technique 100% assurée sur place.",
        },
      ],
      moreLink: "Consulter la fiche détaillée de nos 6 domaines",
    },
    impact: {
      tag: "NOTRE IMPACT EN CHIFFRES",
      title: "Des résultats tangibles, mesurés avec les communautés",
      stat1Val: "2018",
      stat1Lbl: "Fondation d'APTIC-R",
      stat1Sub: "Enregistrée sous le N° 0586/MATDCL",
      stat2Val: "6",
      stat2Lbl: "Domaines d'action",
      stat2Sub: "Programme d'intervention structuré",
      stat3Val: "15+",
      stat3Lbl: "Villages & Écoles",
      stat3Sub: "Bénéficiaires directs en Région Maritime",
      stat4Val: "100%",
      stat4Lbl: "Solutions réparables",
      stat4Sub: "Énergie solaire & matériel maintenable localement",
    },
    projects: {
      tag: "SUR LE TERRAIN",
      title: "Nos Projets Phares",
      subtitle:
        "De la salle multimédia solaire au FabLab rural, découvrez les réalisations concrètes portées au quotidien par nos équipes.",
      allProjectsBtn: "Découvrir tous nos projets de terrain",
      flagshipBadge: "PROJET PHARE",
      flagshipTitle: "Caravane Numérique & Salles Multimédia Solaires",
      flagshipLoc: "Agbélouvé & Préfecture du Zio",
      flagshipProgram: "Programme permanent",
      flagshipDesc:
        "Face au manque d'électricité dans les écoles secondaires de brousse, l'APTIC-R a conçu un modèle de salle informatique autonome dotée de 15 ordinateurs portables basse consommation et de panneaux solaires avec batteries stationnaires. Plus de 350 collégiens y sont formés chaque année.",
      flagshipKpi: "350+ collégiens formés par an",
      flagshipBtn: "Découvrir ce projet en détail",
      project2Title: "FabLab Rural & Prototypage de Pièces Agricoles",
      project2Loc: "Atelier central d'Agbélouvé",
      project2Desc:
        "Impression 3D de buses d'irrigation et pièces de rechange pour motopompes, réduisant les pannes des maraîchers locaux.",
      project3Title: "Bourses Numériques & Autonomisation des Jeunes Femmes",
      project3Loc: "Région Maritime",
      project3Desc:
        "Programme de mentorat et d'apprentissage intensif des outils du web pour 50 jeunes femmes en situation de vulnérabilité.",
      viewResultsBtn: "Consulter les résultats du projet",
    },
    fieldReport: {
      tag: "RÉCIT DOCUMENTAIRE",
      title: "« À Agbélouvé, la technologie n'est pas importée : elle est adoptée et réparée sur place. »",
      quote:
        "Chaque poste informatique installé, chaque panneau solaire posé répond à une demande formelle d'un conseil d'école ou d'un groupement paysan. Nous ne laissons aucun équipement sans former les tuteurs locaux chargés de sa maintenance.",
      author: "Équipe de coordination territoriale APTIC-R",
    },
    getInvolved: {
      tag: "COMMENT PARTICIPER",
      title: "Quatre Façons Concrètes de Vous Engager",
      subtitle:
        "Que vous soyez un citoyen togolais, un volontaire international, une université ou une fondation, votre apport construit l'autonomie de demain.",
      path1Track: "PARCOURS 01 · IMMERSION",
      path1Duration: "6 à 12 mois",
      path1Title: "Volontariat International",
      path1Desc: "Engagez-vous pour 6 à 12 mois en immersion complète à Agbélouvé. Partagez vos compétences informatiques ou agronomiques.",
      path1Btn: "Postuler comme volontaire",
      path2Track: "PARCOURS 02 · GOUVERNANCE",
      path2Tag: "Association N° 0586",
      path2Title: "Devenir Membre",
      path2Desc: "Rejoignez l'association APTIC-R en tant que membre actif ou sympathisant. Participez aux orientations et assemblées générales.",
      path2Btn: "Rejoindre l'association",
      path3Track: "PARCOURS 03 · COOPÉRATION",
      path3Tag: "ONG, Bailleurs & Universités",
      path3Title: "Partenariats & ONG",
      path3Desc: "Organismes d'envoi de volontaires, universités et institutions : bâtissons une coopération pluriannuelle durable.",
      path3Btn: "Devenir partenaire",
      path4Track: "PARCOURS 04 · SOLIDARITÉ",
      path4Tag: "Matériel & Mécénat",
      path4Title: "Soutenir nos actions",
      path4Desc: "Don de matériel informatique reconditionné, mécénat de compétences ou financement ciblé de salles scolaires solaires.",
      path4Btn: "Modalités de soutien",
    },
    news: {
      tag: "LE JOURNAL D'APTIC-R",
      title: "Dernières Actualités & Publications",
      subtitle: "Suivez nos interventions dans les villages, nos ateliers et nos communiqués officiels.",
      readMore: "Lire l'article",
      allNewsBtn: "Consulter l'ensemble du journal",
    },
    testimonials: {
      tag: "TÉMOIGNAGES DU TERRAIN",
      eyebrow: "LA PAROLE AU TERRAIN",
      title: "La Parole aux Acteurs Locaux",
      t1Quote:
        "Avant l'installation de la salle solaire d'APTIC-R, nos élèves n'avaient jamais allumé un ordinateur de leur vie. Aujourd'hui, ils effectuent leurs recherches documentaires sur place sans devoir marcher 15 km.",
      t1Author: "Kossi M.",
      t1Role: "Directeur de collège rural, Préfecture du Zio",
      t1Village: "Collège d'Agbélouvé · Préfecture du Zio",
      t2Quote:
        "La formation au maraîchage assisté par capteurs low-tech m'a permis d'économiser 40% de mon eau d'arrosage pendant la saison sèche. C'est du concret pour nos familles.",
      t2Author: "Afiwa D.",
      t2Role: "Présidente de groupement maraîcher à Agbélouvé",
      t2Village: "Groupement maraîcher d'Agbélouvé",
    },
    newsletter: {
      tag: "RESTEZ INFORMÉ",
      eyebrow: "RESTEZ INFORMÉ",
      title: "Actualités, projets et initiatives d'APTIC-R",
      desc: "Recevez par courriel nos bilans de projets, annonces d'ateliers et opportunités d'engagement. Pas de spam, désinscription en 1 clic.",
      namePlaceholder: "Votre prénom (optionnel)",
      emailPlaceholder: "Votre adresse e-mail",
      consent: "J'accepte de recevoir les courriels d'information d'APTIC-R.",
      btn: "S'inscrire",
      btnLoading: "Inscription...",
      success: "Merci ! Votre inscription a bien été enregistrée.",
      errEmail: "Veuillez entrer une adresse email valide.",
      errConsent: "Veuillez accepter de recevoir la lettre d'information.",
      errGeneral: "Une erreur est survenue lors de l'inscription.",
    },
    contact: {
      tag: "CONTACT & TERRITOIRE",
      title: "Prenez Contact avec l'APTIC-R",
      subtitle: "Vous souhaitez collaborer, devenir membre, proposer un projet de développement rural ou en savoir plus sur nos actions au Togo ?",
      addressLabel: "Siège de l'association",
      addressVal: "Agbélouvé, Préfecture du Zio, Région Maritime, Togo",
      addressDetail: "Route Nationale 1 (Axe Lomé - Tsévié - Atakpamé, 60 km au nord de la capitale).",
      phoneLabel: "Téléphone & WhatsApp direct",
      phoneVal: "+228 91 20 19 90",
      emailLabel: "Courriel officiel",
      emailVal: "aptic.rural19@gmail.com",
      mapNotice: "Accès routier : Nationale 1 (Axe Lomé - Tsévié - Atakpamé), arrêt central Agbélouvé.",
      mapRegion: "Préfecture du Zio · Région Maritime",
      gpsLabel: "Coordonnées GPS : 6.6833° N, 1.1667° E",
      whatsappBtn: "Écrire directement sur WhatsApp",
      contactBtn: "Formulaire & Page Contact",
    },
  },
  EN: {
    hero: {
      territoryBadge: "Agbélouvé · Maritime Region · Togo",
      titleLine1: "Digital technology",
      titleLine2: "for rural communities.",
      subtitle:
        "From Agbélouvé, APTIC-R co-develops accessible, repairable, and empowering tech and solar solutions alongside rural farmers and schools in Togo.",
      ctaProjects: "Explore our field projects",
      ctaGetInvolved: "How to get involved",
      statYears: "Since 2018",
      statYearsDesc: "Community-rooted in Togo",
      statVillages: "15+ villages",
      statVillagesDesc: "Schools & cooperatives supported",
      statSolar: "100%",
      statSolarDesc: "Local & solar maintenance",
    },
    about: {
      tag: "WHO WE ARE",
      eyebrow: "SINCE 2018 · ROOTED IN TOGO",
      title: "Digital technology for rural communities.",
      headline:
        "“Since 2018, APTIC-R has supported rural communities in Togo by putting technology, skills, and innovation at the service of local development.”",
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
      photoCaption: "Community consultation with village elders and trainers in Agbélouvé",
    },
    domains: {
      tag: "WHAT WE DO",
      title: "6 Strategic Intervention Domains",
      subtitle: "An integrated framework combining digital education, solar energy, sustainable farming, and modern skills.",
      list: [
        { num: "01", title: "Digital Inclusion & Education", desc: "Setting up solar-powered computer labs, providing refurbished laptops, and digital literacy in rural schools." },
        { num: "02", title: "Youth & Professional Skills", desc: "Certified training in software, computer maintenance, and mentorship to unlock local economic opportunities." },
        { num: "03", title: "Cybersecurity & Digital Rights", desc: "Raising community awareness on privacy protection, safe mobile habits, and responsible digital practices." },
        { num: "04", title: "Sustainable Agriculture & Low-Tech", desc: "Co-designing solar moisture sensors, automated drip irrigation, and repairable tools for smallholder farmers." },
        { num: "05", title: "Field Data & Innovation", desc: "Community-based data mapping to guide rural interventions and evaluate genuine local impact." },
        { num: "06", title: "Community Rural Development", desc: "Empowering village co-ops and women's associations with 100% locally maintained technology." },
      ],
      moreLink: "Explore our 6 domains in detail",
    },
    impact: {
      tag: "OUR MEASURED IMPACT",
      title: "Concrete Results Built Alongside Communities",
      stat1Val: "2018",
      stat1Lbl: "Founded in Agbélouvé",
      stat1Sub: "Official NGO Registration N° 0586/MATDCL",
      stat2Val: "6",
      stat2Lbl: "Action Domains",
      stat2Sub: "Structured grassroots programs",
      stat3Val: "15+",
      stat3Lbl: "Villages & Schools",
      stat3Sub: "Direct community beneficiaries",
      stat4Val: "100%",
      stat4Lbl: "Repairable Solutions",
      stat4Sub: "Locally maintained solar & digital gear",
    },
    projects: {
      tag: "ON THE GROUND",
      title: "Key Initiatives & Projects",
      subtitle: "From off-grid solar labs to rural makerspaces, discover what our team builds every day.",
      allProjectsBtn: "View all field projects",
      flagshipBadge: "FLAGSHIP PROJECT",
      flagshipTitle: "Digital Caravan & Autonomous Solar Computer Labs",
      flagshipLoc: "Agbélouvé & Zio Prefecture",
      flagshipProgram: "Ongoing program",
      flagshipDesc:
        "To solve the lack of electrical grid in rural middle schools, APTIC-R deploys autonomous solar stations powering 15 energy-efficient laptops and offline encyclopedias for 350+ students annually.",
      flagshipKpi: "350+ rural students trained each year",
      flagshipBtn: "Explore this project in detail",
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
      title: "“In Agbélouvé, technology is never imposed: it is adopted and repaired by the community.”",
      quote:
        "Every computer installed and every solar panel mounted responds to a direct community request. We never leave equipment behind without training local caretakers.",
      author: "APTIC-R Territorial Coordination Team",
    },
    getInvolved: {
      tag: "GET INVOLVED",
      title: "Four Meaningful Ways to Take Action",
      subtitle: "Whether you are a volunteer, partner NGO, academic institution, or donor, your contribution matters.",
      path1Track: "TRACK 01 · IMMERSION",
      path1Duration: "6 to 12 months",
      path1Title: "International Volunteer",
      path1Desc: "Join us for 6 to 12 months in Agbélouvé to share tech, educational, or agronomic skills.",
      path1Btn: "Apply as volunteer",
      path2Track: "TRACK 02 · GOVERNANCE",
      path2Tag: "NGO Reg. N° 0586",
      path2Title: "Become a Member",
      path2Desc: "Join APTIC-R as an active member and participate in strategic decisions and assemblies.",
      path2Btn: "Join as member",
      path3Track: "TRACK 03 · COOPERATION",
      path3Tag: "NGOs, Donors & Universities",
      path3Title: "Partner Organizations",
      path3Desc: "Volunteer-sending agencies, universities, and foundations: let's build a lasting partnership.",
      path3Btn: "Become a partner",
      path4Track: "TRACK 04 · SOLIDARITY",
      path4Tag: "Hardware & Pro Bono",
      path4Title: "Support Our Work",
      path4Desc: "Donate refurbished hardware, offer pro bono expertise, or sponsor rural school solar stations.",
      path4Btn: "Support options",
    },
    news: {
      tag: "APTIC-R JOURNAL",
      title: "Latest Field Updates & Press",
      subtitle: "Read about our school visits, workshops, and official announcements.",
      readMore: "Read article",
      allNewsBtn: "Browse all articles",
    },
    testimonials: {
      tag: "VOICES FROM THE FIELD",
      eyebrow: "VOICES FROM THE FIELD",
      title: "Direct Feedback from Local Beneficiaries",
      t1Quote:
        "Before APTIC-R installed our solar lab, our students had never touched a computer. Today they conduct research on-site without walking 15 km to town.",
      t1Author: "Kossi M.",
      t1Role: "Rural School Headmaster, Zio Prefecture",
      t1Village: "Agbélouvé Middle School · Zio Prefecture",
      t2Quote:
        "The low-tech sensor training helped our cooperative reduce irrigation water consumption by 40% during the dry season. It makes a real difference.",
      t2Author: "Afiwa D.",
      t2Role: "Farmers' Cooperative Leader in Agbélouvé",
      t2Village: "Agbélouvé Farmers' Cooperative",
    },
    newsletter: {
      tag: "STAY INFORMED",
      eyebrow: "STAY INFORMED",
      title: "News, field projects, and initiatives from APTIC-R",
      desc: "Receive our quarterly project summaries, workshop announcements, and calls for volunteers. Unsubscribe anytime.",
      namePlaceholder: "First name (optional)",
      emailPlaceholder: "Email address",
      consent: "I agree to receive informative emails from APTIC-R.",
      btn: "Subscribe",
      btnLoading: "Subscribing...",
      success: "Thank you! You are now subscribed.",
      errEmail: "Please enter a valid email address.",
      errConsent: "Please agree to receive updates.",
      errGeneral: "An error occurred during subscription.",
    },
    contact: {
      tag: "CONTACT & TERRITORY",
      title: "Connect with APTIC-R",
      subtitle: "Interested in collaborating, joining as a member, proposing a rural development project, or learning more about our work in Togo?",
      addressLabel: "Headquarters",
      addressVal: "Agbélouvé, Zio Prefecture, Maritime Region, Togo",
      addressDetail: "National Road 1 (Lomé - Tsévié - Atakpamé corridor, 60 km north of Lomé).",
      phoneLabel: "Phone & WhatsApp",
      phoneVal: "+228 91 20 19 90",
      emailLabel: "Official Email",
      emailVal: "aptic.rural19@gmail.com",
      mapNotice: "Road access: National Road 1 (Lomé - Tsévié - Atakpamé corridor), Agbélouvé central stop.",
      mapRegion: "Zio Prefecture · Maritime Region",
      gpsLabel: "GPS Coordinates: 6.6833° N, 1.1667° E",
      whatsappBtn: "Chat on WhatsApp",
      contactBtn: "Contact Form & Details",
    },
  },
  DE: {
    hero: {
      territoryBadge: "Agbélouvé · Region Maritime · Togo",
      titleLine1: "Digitale Technologien",
      titleLine2: "für ländliche Räume.",
      subtitle:
        "Aus Agbélouvé entwickelt APTIC-R gemeinsam mit ländlichen Gemeinschaften zugängliche, reparierbare und solargetriebene Lösungen für Bildung und Landwirtschaft in Togo.",
      ctaProjects: "Feldprojekte entdecken",
      ctaGetInvolved: "Mitmachen & Engagieren",
      statYears: "Seit 2018",
      statYearsDesc: "Lokal verankert in Togo",
      statVillages: "15+ Dörfer",
      statVillagesDesc: "Schulen & Kooperativen gefördert",
      statSolar: "100%",
      statSolarDesc: "Lokale & solare Wartung",
    },
    about: {
      tag: "ÜBER UNS",
      eyebrow: "SEIT 2018 · VERANKERT IN TOGO",
      title: "Digitale Technologien für ländliche Räume.",
      headline:
        "„Seit 2018 begleitet APTIC-R ländliche Gemeinden in Togo und stellt Technologie, Bildung und Innovation in den Dienst der Menschen vor Ort.“",
      p1: "In Agbélouvé von lokalen Fachkräften und Gemeindevertretern gegründet, entstand APTIC-R, um der digitalen Isolation im ländlichen Westafrika aktiv entgegenzuwirken.",
      p2: "Unser Ansatz beruht auf einer festen Überzeugung: Technologie darf kein importiertes Konsumgut sein, sondern muss ein Werkzeug der Eigenständigkeit sein – lokal gewartet, verstanden und weitergegeben von jungen Menschen und Frauen.",
      historyTitle: "Unsere Geschichte",
      historySummary: "Agbélouvé, Präfektur Zio. Eine feste dörfliche Verwurzelung seit 2018.",
      missionTitle: "Unsere Mission",
      missionSummary: "Solare Schul-Computerräume, qualifizierte Ausbildung und landwirtschaftliche Low-Tech.",
      visionTitle: "Unsere Vision",
      visionSummary: "Selbstbestimmte, zukunftsfähige Dörfer, die ihren digitalen Weg eigenständig gestalten.",
      moreBtn: "Mehr über APTIC-R und unsere Organisationsstruktur",
      photoTag: "VOR ORT · AGBÉLOUVÉ",
      photoCaption: "Gemeindetreffen mit Dorfältesten und Ausbildern in Agbélouvé",
    },
    domains: {
      tag: "UNSERE ARBEIT",
      title: "6 Strategische Handlungsfelder",
      subtitle: "Ein ganzheitlicher Ansatz, der digitale Bildung, Solarenergie und nachhaltige Landwirtschaft vereint.",
      list: [
        { num: "01", title: "Digitale Inklusion & Bildung", desc: "Aufbau solarbetriebener Computerräume und Vermittlung digitaler Grundkompetenzen in Dorfschulen." },
        { num: "02", title: "Jugend & Berufliche Bildung", desc: "Praxisnahe IT-Ausbildungen, Wartungskurse und Mentoring zur Förderung lokaler Beschäftigung." },
        { num: "03", title: "Cybersicherheit & Digitale Mündigkeit", desc: "Aufklärung über Datenschutz, sichere Smartphone-Nutzung und Medienkompetenz." },
        { num: "04", title: "Ökologische Landwirtschaft & Low-Tech", desc: "Solare Feuchtigkeitssensoren und sparsame Bewässerungssysteme für Kleinbauern." },
        { num: "05", title: "Felddaten & Lokale Innovation", desc: "Erfassung und Kartierung ländlicher Bedarfe zur gezielten Projektförderung." },
        { num: "06", title: "Ländliche Gemeindeentwicklung", desc: "Stärkung dörflicher Genossenschaften und Fraueninitiativen mit lokaler Technikwartung." },
      ],
      moreLink: "Alle 6 Bereiche im Detail ansehen",
    },
    impact: {
      tag: "WIRKUNG IN ZAHLEN",
      title: "Messbare Ergebnisse, gemeinsam mit den Dörfern erreicht",
      stat1Val: "2018",
      stat1Lbl: "Gründung in Agbélouvé",
      stat1Sub: "Registriert unter N° 0586/MATDCL",
      stat2Val: "6",
      stat2Lbl: "Bereiche",
      stat2Sub: "Strukturiertes Förderprogramm",
      stat3Val: "15+",
      stat3Lbl: "Dörfer & Schulen",
      stat3Sub: "Direkt begünstigte Gemeinschaften",
      stat4Val: "100%",
      stat4Lbl: "Reparierbar",
      stat4Sub: "Lokale Wartung von Solar- und IT-Technik",
    },
    projects: {
      tag: "VOR ORT",
      title: "Ausgewählte Projekte",
      subtitle: "Vom netzunabhängigen Solarlabor bis zum dörflichen FabLab: Einblicke in unsere tägliche Arbeit.",
      allProjectsBtn: "Alle Projekte entdecken",
      flagshipBadge: "LEUCHTTURMPROJEKT",
      flagshipTitle: "Digitale Karawane & Autonome Solar-Computerräume",
      flagshipLoc: "Agbélouvé & Präfektur Zio",
      flagshipProgram: "Laufendes Programm",
      flagshipDesc:
        "Da ländliche Mittelschulen oft keinen Stromanschluss haben, errichtet APTIC-R solare Lernräume mit 15 energiesparenden Laptops. Über 350 Schüler werden jährlich geschult.",
      flagshipKpi: "350+ Schüler jährlich ausgebildet",
      flagshipBtn: "Projekt im Detail ansehen",
      project2Title: "Ländliches FabLab & Ersatzteile",
      project2Loc: "Werkstatt Agbélouvé",
      project2Desc: "3D-Druck von Bewässerungsdüsen und Pumpen-Ersatzteilen für örtliche Gemüsebauern.",
      project3Title: "Digitalstipendien für junge Frauen",
      project3Loc: "Region Maritime",
      project3Desc: "Intensivschulung in Bürosoftware und Internetanwendungen für 50 junge Frauen in ländlichen Gebieten.",
      viewResultsBtn: "Projektergebnisse ansehen",
    },
    fieldReport: {
      tag: "EINBLICK VOR ORT",
      title: "„In Agbélouvé wird Technologie nicht importiert, sondern von den Menschen selbst verstanden und gewartet.“",
      quote:
        "Jeder installierte Rechner und jedes Solarmodul geht auf einen konkreten Wunsch der Schule oder Dorfgemeinschaft zurück. Keine Technik bleibt ohne ausgebildete Betreuer.",
      author: "APTIC-R Koordinationsteam vor Ort",
    },
    getInvolved: {
      tag: "MITMACHEN",
      title: "Vier Wege der Mitgestaltung",
      subtitle: "Ob Freiwilliger, Partnerorganisation, Universität oder Förderer: Ihr Beitrag zählt.",
      path1Track: "WEG 01 · IMMERSION",
      path1Duration: "6 bis 12 Monate",
      path1Title: "Freiwilligendienst",
      path1Desc: "Engagieren Sie sich 6 bis 12 Monate direkt in Agbélouvé und teilen Sie Ihr technisches Wissen.",
      path1Btn: "Als Freiwilliger bewerben",
      path2Track: "WEG 02 · MITWIRKUNG",
      path2Tag: "Verein N° 0586",
      path2Title: "Mitglied werden",
      path2Desc: "Treten Sie APTIC-R als aktives Mitglied bei und bestimmen Sie die Zukunft des Vereins mit.",
      path2Btn: "Mitglied werden",
      path3Track: "WEG 03 · KOOPERATION",
      path3Tag: "NGOs, Förderer & Universitäten",
      path3Title: "Partnerorganisationen",
      path3Desc: "Entsendeorganisationen, Hochschulen und Stiftungen: Gemeinsam langfristige Kooperationen aufbauen.",
      path3Btn: "Partner werden",
      path4Track: "WEG 04 · SOLIDARITÄT",
      path4Tag: "Sachspenden & Know-how",
      path4Title: "Unterstützen & Spenden",
      path4Desc: "Sachspenden von Laptops, Kompetenzspenden oder gezielte Förderung dörflicher Solarräume.",
      path4Btn: "Unterstützungsmöglichkeiten",
    },
    news: {
      tag: "APTIC-R JOURNAL",
      title: "Aktuelles & Berichte",
      subtitle: "Neuigkeiten aus den Dörfern, Werkstattberichte und offizielle Bekanntmachungen.",
      readMore: "Artikel lesen",
      allNewsBtn: "Zum gesamten Journal",
    },
    testimonials: {
      tag: "STIMMEN AUS DER REGION",
      eyebrow: "STIMMEN VOR ORT",
      title: "Erfahrungen unserer Partner vor Ort",
      t1Quote:
        "Vor der Installation des Solarlabors hatten unsere Schüler noch nie einen Computer berührt. Heute recherchieren sie selbstständig vor Ort.",
      t1Author: "Kossi M.",
      t1Role: "Schulleiter in der Präfektur Zio",
      t1Village: "Mittelschule Agbélouvé · Präfektur Zio",
      t2Quote:
        "Die Schulung zur wassersparenden Bewässerung hat unseren Wasserverbrauch in der Trockenzeit um 40% gesenkt. Das ist eine spürbare Entlastung.",
      t2Author: "Afiwa D.",
      t2Role: "Vorsitzende einer Kleinbauern-Kooperative",
      t2Village: "Gemüsebau-Kooperative Agbélouvé",
    },
    newsletter: {
      tag: "INFORMIERT BLEIBEN",
      eyebrow: "INFORMIERT BLEIBEN",
      title: "Neuigkeiten, Projekte und Initiativen von APTIC-R",
      desc: "Erhalten Sie Berichte, Werkstattankündigungen und Aufrufe für Freiwillige. Abmeldung jederzeit möglich.",
      namePlaceholder: "Vorname (optional)",
      emailPlaceholder: "E-Mail-Adresse",
      consent: "Ich stimme dem Erhalt von Informationen von APTIC-R zu.",
      btn: "Anmelden",
      btnLoading: "Anmeldung...",
      success: "Vielen Dank! Ihre Anmeldung war erfolgreich.",
      errEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      errConsent: "Bitte stimmen Sie dem Erhalt des Rundbriefs zu.",
      errGeneral: "Bei der Anmeldung ist ein Fehler aufgetreten.",
    },
    contact: {
      tag: "KONTAKT & STANDORT",
      title: "Kontakt zu APTIC-R",
      subtitle: "Möchten Sie kooperieren, Mitglied werden, ein Entwicklungsprojekt vorschlagen oder mehr über unsere Arbeit in Togo erfahren?",
      addressLabel: "Vereinssitz",
      addressVal: "Agbélouvé, Präfektur Zio, Region Maritime, Togo",
      addressDetail: "Nationalstraße 1 (Achse Lomé - Tsévié - Atakpamé, 60 km nördlich der Hauptstadt).",
      phoneLabel: "Telefon & WhatsApp",
      phoneVal: "+228 91 20 19 90",
      emailLabel: "Offizielle E-Mail",
      emailVal: "aptic.rural19@gmail.com",
      mapNotice: "Anfahrt: Nationalstraße 1 (Achse Lomé - Tsévié - Atakpamé), Haltestelle Agbélouvé Zentrum.",
      mapRegion: "Präfektur Zio · Region Maritime",
      gpsLabel: "GPS-Koordinaten: 6.6833° N, 1.1667° E",
      whatsappBtn: "Über WhatsApp schreiben",
      contactBtn: "Kontaktformular & Details",
    },
  },
}

export default function InstitutionalHome({ lang, navigate }: InstitutionalHomeProps) {
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const c = CONTENT[safeLang]

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
    {
      quote: c.testimonials.t1Quote,
      author: c.testimonials.t1Author,
      role: c.testimonials.t1Role,
      village: c.testimonials.t1Village,
      num: "01",
    },
    {
      quote: c.testimonials.t2Quote,
      author: c.testimonials.t2Author,
      role: c.testimonials.t2Role,
      village: c.testimonials.t2Village,
      num: "02",
    },
  ]

  return (
    <div className="w-full bg-white text-[#1A2B3C] font-sans antialiased overflow-x-clip">

      {/* ── 01. HERO FORT (Documentaire grand format, Ancrage territorial, min-h 680-740px) ──── */}
      <section className="relative min-h-[680px] lg:min-h-[760px] flex items-center overflow-hidden">
        {/* Photographie documentaire plein format */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/hero-volunteer-collab.avif" type="image/avif" />
            <source srcSet="/hero-volunteer-collab.webp" type="image/webp" />
            <img
              src="/hero-volunteer-collab.jpg"
              alt="Formation et collaboration technologique à Agbélouvé, Togo"
              className="w-full h-full object-cover object-[center_30%]"
              fetchPriority="high"
            />
          </picture>
          {/* Voile photographique doux et sombre texturé sans dégradé coloré artificiel */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,35,50,0.82) 0%, rgba(20,35,50,0.65) 55%, rgba(20,35,50,0.92) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-12 lg:px-16 py-28 sm:py-36 lg:py-44">
          <div className="max-w-4xl">
            {/* Eyebrow / Badge territorial sobre */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-[0.18em] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#35A85A]" />
              <span>{c.hero.territoryBadge}</span>
            </div>

            {/* Grand Titre : 56–72px */}
            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-black text-white leading-[1.06] tracking-tight mb-8">
              <span className="block">{c.hero.titleLine1}</span>
              <span className="block text-[#35A85A] font-extrabold">{c.hero.titleLine2}</span>
            </h1>

            {/* Texte d'accompagnement : 18–20px */}
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-normal leading-relaxed mb-12 max-w-2xl">
              {c.hero.subtitle}
            </p>

            {/* Actions principales */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 mb-16">
              <button
                onClick={() => {
                  trackEvent("institutional_hero_projects", { lang: safeLang })
                  navigate("projects")
                }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base text-white transition-all shadow-lg hover:shadow-xl hover:bg-[#2E914E] cursor-pointer"
                style={{ backgroundColor: GREEN }}
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
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 transition-all cursor-pointer"
              >
                <span>{c.hero.ctaGetInvolved}</span>
              </button>
            </div>

            {/* Repères institutionnels intégrés au Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 pt-8 border-t border-white/20 max-w-2xl">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">{c.hero.statYears}</div>
                <div className="text-xs sm:text-sm text-white/75 mt-1">{c.hero.statYearsDesc}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">{c.hero.statVillages}</div>
                <div className="text-xs sm:text-sm text-white/75 mt-1">{c.hero.statVillagesDesc}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 border-white/15 pt-4 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-black text-[#35A85A] font-mono">{c.hero.statSolar}</div>
                <div className="text-xs sm:text-sm text-white/75 mt-1">{c.hero.statSolarDesc}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02. PRÉSENTATION ÉDITORIALE MAJEURE (« DEPUIS 2018 » - Signature visuelle) ──── */}
      <section className="py-24 sm:py-32 lg:py-40 bg-white border-b border-[#EAF0F4]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Colonne Gauche : Composition éditoriale institutionnelle */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#174F7A]">
                  {c.about.eyebrow}
                </span>
                <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#174F7A] mt-4 mb-8 leading-[1.12] tracking-tight">
                  {c.about.title}
                </h2>
              </div>

              <div className="p-8 sm:p-10 rounded-2xl bg-[#F5F7F9] border border-[#EAF0F4] shadow-xs">
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#1A2B3C] leading-relaxed italic">
                  {c.about.headline}
                </p>
              </div>

              <div className="space-y-6 text-base sm:text-lg text-[#5E6B76] leading-relaxed">
                <p>{c.about.p1}</p>
                <p>{c.about.p2}</p>
              </div>

              {/* Triptyque Histoire / Mission / Vision épuré */}
              <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-[#EAF0F4]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#174F7A] mb-2">
                    {c.about.historyTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed">
                    {c.about.historySummary}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#35A85A] mb-2">
                    {c.about.missionTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed">
                    {c.about.missionSummary}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#174F7A] mb-2">
                    {c.about.visionTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed">
                    {c.about.visionSummary}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate("about")}
                  className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-[#174F7A] hover:text-[#133f63] cursor-pointer group"
                >
                  <span className="underline underline-offset-8">{c.about.moreBtn}</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* Colonne Droite : Grande Photographie documentaire de terrain */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#EAF0F4] bg-[#F5F7F9]">
                <picture>
                  <source srcSet="/meeting-org.avif" type="image/avif" />
                  <source srcSet="/meeting-org.webp" type="image/webp" />
                  <img
                    src="/meeting-org.jpg"
                    alt="Concertation et travail avec l'équipe locale d'APTIC-R à Agbélouvé"
                    className="w-full h-[420px] sm:h-[540px] object-cover"
                  />
                </picture>
                <div className="p-5 bg-[#142332] text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#35A85A] block mb-1">
                    {c.about.photoTag}
                  </span>
                  <p className="text-xs text-white/85 leading-relaxed">
                    {c.about.photoCaption}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 03. NOS DOMAINES D'ACTION (Grille 3 × 2 large, typographie forte, non-carte) ──── */}
      <section className="py-24 sm:py-32 lg:py-40" style={{ backgroundColor: BG }}>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#174F7A]">
              {c.domains.tag}
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-[#174F7A] mt-3 mb-6 leading-tight">
              {c.domains.title}
            </h2>
            <p className="text-base sm:text-lg text-[#5E6B76] leading-relaxed">
              {c.domains.subtitle}
            </p>
          </div>

          {/* Grille 3 × 2 très large et aérée */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {c.domains.list.map((d) => (
              <div
                key={d.num}
                className="bg-white rounded-2xl p-8 sm:p-10 border border-[#EAF0F4] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between border-b border-[#EAF0F4] pb-4 mb-6">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-[#174F7A]">
                      {d.num}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#142332] mb-3 leading-snug">
                    {d.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed">
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 sm:mt-16 text-center">
            <button
              onClick={() => navigate("domains")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold text-[#174F7A] bg-white border border-[#174F7A]/30 hover:bg-[#174F7A] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <span>{c.domains.moreLink}</span>
              <span className="text-base">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 04. NOTRE IMPACT EN CHIFFRES (Chiffres très imposants 48–64px) ──── */}
      <section className="py-20 sm:py-28 bg-white border-y border-[#EAF0F4]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#35A85A]">
              {c.impact.tag}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#174F7A] mt-2">
              {c.impact.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
            <div className="p-4 sm:p-6">
              <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#174F7A] font-mono tracking-tight">
                {c.impact.stat1Val}
              </div>
              <div className="text-base sm:text-lg font-bold text-[#142332] uppercase tracking-wide mt-3">
                {c.impact.stat1Lbl}
              </div>
              <div className="text-xs sm:text-sm text-[#5E6B76] mt-1">
                {c.impact.stat1Sub}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-l border-[#EAF0F4]">
              <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#35A85A] font-mono tracking-tight">
                {c.impact.stat2Val}
              </div>
              <div className="text-base sm:text-lg font-bold text-[#142332] uppercase tracking-wide mt-3">
                {c.impact.stat2Lbl}
              </div>
              <div className="text-xs sm:text-sm text-[#5E6B76] mt-1">
                {c.impact.stat2Sub}
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:border-l border-[#EAF0F4]">
              <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#174F7A] font-mono tracking-tight">
                {c.impact.stat3Val}
              </div>
              <div className="text-base sm:text-lg font-bold text-[#142332] uppercase tracking-wide mt-3">
                {c.impact.stat3Lbl}
              </div>
              <div className="text-xs sm:text-sm text-[#5E6B76] mt-1">
                {c.impact.stat3Sub}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-l border-[#EAF0F4]">
              <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#35A85A] font-mono tracking-tight">
                {c.impact.stat4Val}
              </div>
              <div className="text-base sm:text-lg font-bold text-[#142332] uppercase tracking-wide mt-3">
                {c.impact.stat4Lbl}
              </div>
              <div className="text-xs sm:text-sm text-[#5E6B76] mt-1">
                {c.impact.stat4Sub}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05. NOS PROJETS PHARES (1 Grand projet horizontal + 2 secondaires) ──── */}
      <section className="py-24 sm:py-32 lg:py-40" style={{ backgroundColor: BG }}>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#174F7A]">
                {c.projects.tag}
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-[#174F7A] mt-2 leading-tight">
                {c.projects.title}
              </h2>
            </div>
            <button
              onClick={() => navigate("projects")}
              className="text-sm font-bold text-[#174F7A] hover:underline cursor-pointer self-start sm:self-auto"
            >
              {c.projects.allProjectsBtn} →
            </button>
          </div>

          {/* GRAND PROJET PHARE (Composition horizontale pleine largeur) */}
          <div className="bg-white rounded-3xl border border-[#EAF0F4] overflow-hidden shadow-lg mb-12">
            <div className="grid lg:grid-cols-12">
              
              {/* Image grand format */}
              <div className="lg:col-span-6 bg-[#F5F7F9] relative min-h-[340px] sm:min-h-[460px]">
                <picture>
                  <source srcSet="/togo-volunteer.avif" type="image/avif" />
                  <source srcSet="/togo-volunteer.webp" type="image/webp" />
                  <img
                    src="/togo-volunteer.jpg"
                    alt="Atelier d'informatique scolaire avec les élèves à Agbélouvé"
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-[#174F7A] shadow-md">
                    {c.projects.flagshipBadge}
                  </span>
                </div>
              </div>

              {/* Contenu éditorial */}
              <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#5E6B76] mb-4">
                    <span>📍</span>
                    <span>{c.projects.flagshipLoc}</span>
                    <span>•</span>
                    <span className="text-[#35A85A] font-bold">{c.projects.flagshipProgram}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black text-[#142332] mb-6 leading-snug">
                    {c.projects.flagshipTitle}
                  </h3>

                  <p className="text-base sm:text-lg text-[#5E6B76] leading-relaxed mb-8">
                    {c.projects.flagshipDesc}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#EAF0F4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm sm:text-base font-bold text-[#35A85A]">
                    ✓ {c.projects.flagshipKpi}
                  </div>
                  <button
                    onClick={() => navigate("projects")}
                    className="px-6 py-3.5 bg-[#174F7A] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#133f63] transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {c.projects.flagshipBtn} →
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 2 Projets secondaires larges */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAF0F4] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#5E6B76] block mb-2">📍 {c.projects.project2Loc}</span>
                <h4 className="text-xl sm:text-2xl font-bold text-[#142332] mb-3 leading-snug">
                  {c.projects.project2Title}
                </h4>
                <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed mb-6">
                  {c.projects.project2Desc}
                </p>
              </div>
              <button
                onClick={() => navigate("projects")}
                className="text-sm font-bold text-[#174F7A] hover:underline self-start cursor-pointer"
              >
                {c.projects.viewResultsBtn} →
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAF0F4] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#5E6B76] block mb-2">📍 {c.projects.project3Loc}</span>
                <h4 className="text-xl sm:text-2xl font-bold text-[#142332] mb-3 leading-snug">
                  {c.projects.project3Title}
                </h4>
                <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed mb-6">
                  {c.projects.project3Desc}
                </p>
              </div>
              <button
                onClick={() => navigate("projects")}
                className="text-sm font-bold text-[#174F7A] hover:underline self-start cursor-pointer"
              >
                {c.projects.viewResultsBtn} →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── 06. SUR LE TERRAIN (Grande Respiration photographique & Récit court) ──── */}
      <section className="py-24 sm:py-32 bg-white border-b border-[#EAF0F4]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#35A85A]">
            {c.fieldReport.tag}
          </span>
          <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#174F7A] mt-6 mb-8 leading-[1.2] max-w-4xl mx-auto">
            {c.fieldReport.title}
          </blockquote>
          <p className="text-base sm:text-xl text-[#5E6B76] leading-relaxed max-w-3xl mx-auto mb-8 font-serif italic">
            « {c.fieldReport.quote} »
          </p>
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1A2B3C]">
            — {c.fieldReport.author}
          </div>
        </div>
      </section>

      {/* ── 07. QUATRE GRANDES PORTES D'ENGAGEMENT (2x2 Grille éditoriale unifiée) ──── */}
      <section id="engagement-section" className="py-24 sm:py-32 lg:py-40" style={{ backgroundColor: BG }}>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#174F7A]">
              {c.getInvolved.tag}
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-[#174F7A] mt-3 mb-4 leading-tight">
              {c.getInvolved.title}
            </h2>
            <p className="text-base sm:text-lg text-[#5E6B76] leading-relaxed">
              {c.getInvolved.subtitle}
            </p>
          </div>

          {/* Grille 2 × 2 : Traitement graphique institutionnel unifié (#174F7A, #35A85A, #FFFFFF, #F5F7F9) */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
            
            {/* Voie 1 : Volontaire */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAF0F4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#174F7A]">
                    {c.getInvolved.path1Track}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-[#F5F7F9] rounded-full text-[#174F7A]">
                    {c.getInvolved.path1Duration}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#142332] mb-4">
                  {c.getInvolved.path1Title}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed mb-8">
                  {c.getInvolved.path1Desc}
                </p>
              </div>
              <button
                onClick={() => navigate("volunteering")}
                className="w-full py-4 px-6 rounded-xl text-sm font-bold text-white bg-[#174F7A] hover:bg-[#133f63] transition-colors cursor-pointer text-center"
              >
                {c.getInvolved.path1Btn} →
              </button>
            </div>

            {/* Voie 2 : Membre */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAF0F4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#35A85A]">
                    {c.getInvolved.path2Track}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 rounded-full text-emerald-800">
                    {c.getInvolved.path2Tag}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#142332] mb-4">
                  {c.getInvolved.path2Title}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed mb-8">
                  {c.getInvolved.path2Desc}
                </p>
              </div>
              <button
                onClick={() => navigate("membership")}
                className="w-full py-4 px-6 rounded-xl text-sm font-bold text-white bg-[#35A85A] hover:bg-[#2E914E] transition-colors cursor-pointer text-center"
              >
                {c.getInvolved.path2Btn} →
              </button>
            </div>

            {/* Voie 3 : Partenaires */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAF0F4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#174F7A]">
                    {c.getInvolved.path3Track}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-[#F5F7F9] rounded-full text-[#174F7A]">
                    {c.getInvolved.path3Tag}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#142332] mb-4">
                  {c.getInvolved.path3Title}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed mb-8">
                  {c.getInvolved.path3Desc}
                </p>
              </div>
              <button
                onClick={() => navigate("partner")}
                className="w-full py-4 px-6 rounded-xl text-sm font-bold text-[#174F7A] bg-[#F5F7F9] hover:bg-[#EAF0F4] border border-[#174F7A]/20 transition-colors cursor-pointer text-center"
              >
                {c.getInvolved.path3Btn} →
              </button>
            </div>

            {/* Voie 4 : Soutenir */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAF0F4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#35A85A]">
                    {c.getInvolved.path4Track}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 rounded-full text-emerald-800">
                    {c.getInvolved.path4Tag}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#142332] mb-4">
                  {c.getInvolved.path4Title}
                </h3>
                <p className="text-base text-[#5E6B76] leading-relaxed mb-8">
                  {c.getInvolved.path4Desc}
                </p>
              </div>
              <button
                onClick={() => navigate("support")}
                className="w-full py-4 px-6 rounded-xl text-sm font-bold text-[#142332] bg-[#F5F7F9] hover:bg-[#EAF0F4] border border-[#EAF0F4] transition-colors cursor-pointer text-center"
              >
                {c.getInvolved.path4Btn} →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── 08. LA PAROLE AU TERRAIN (Grande Citation & Récit singulier avec navigation) ──── */}
      <section className="py-24 sm:py-32 bg-white border-y border-[#EAF0F4]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#174F7A]">
                {c.testimonials.eyebrow}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#142332] mt-2">
                {c.testimonials.title}
              </h2>
            </div>
            {/* Navigation pagination 01 / 02 */}
            <div className="flex items-center gap-3">
              {testimonialsList.map((item, idx) => (
                <button
                  key={item.num}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-10 h-10 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeTestimonial === idx
                      ? "bg-[#174F7A] text-white shadow-md"
                      : "bg-[#F5F7F9] text-[#5E6B76] hover:bg-gray-200"
                  }`}
                >
                  {item.num}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-14 lg:p-16 rounded-3xl bg-[#F5F7F9] border border-[#EAF0F4]">
            <p className="text-xl sm:text-3xl lg:text-4xl font-semibold text-[#142332] leading-relaxed italic mb-8">
              « {testimonialsList[activeTestimonial].quote} »
            </p>
            <div className="pt-6 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#174F7A]">
                  {testimonialsList[activeTestimonial].author}
                </div>
                <div className="text-xs sm:text-sm text-[#5E6B76] mt-0.5">
                  {testimonialsList[activeTestimonial].role}
                </div>
              </div>
              <span className="text-xs font-mono text-gray-500">
                📍 {testimonialsList[activeTestimonial].village}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 09. RESTEZ INFORMÉ (Newsletter sobre, élégante, fond blanc / #F5F7F9) ──── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-[900px] mx-auto px-6 sm:px-12">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#35A85A]">
              {c.newsletter.eyebrow}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-[#174F7A] mt-2 mb-3">
              {c.newsletter.title}
            </h3>
            <p className="text-sm sm:text-base text-[#5E6B76] max-w-xl mx-auto leading-relaxed">
              {c.newsletter.desc}
            </p>
          </div>

          {nlSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-sm font-bold text-emerald-800">
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
                  className="flex-1 px-5 py-3.5 bg-[#F5F7F9] border border-[#EAF0F4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#174F7A]"
                />
                <button
                  type="submit"
                  disabled={nlSubmitting}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#174F7A] hover:bg-[#133f63] transition-colors cursor-pointer disabled:opacity-60 shadow-sm whitespace-nowrap"
                >
                  {nlSubmitting ? c.newsletter.btnLoading : c.newsletter.btn}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#5E6B76] pt-1">
                <input
                  type="checkbox"
                  checked={nlConsent}
                  onChange={(e) => setNlConsent(e.target.checked)}
                  className="rounded border-gray-300 text-[#174F7A] focus:ring-[#174F7A] cursor-pointer"
                />
                <span>{c.newsletter.consent}</span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── 10. PRENDRE CONTACT AVEC L'APTIC-R (Grand format institutionnel & Carte) ──── */}
      <section className="py-24 sm:py-32 lg:py-40 border-t border-[#EAF0F4]" style={{ backgroundColor: BG }}>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Volet gauche : Informations directes et explications */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#174F7A]">
                  {c.contact.tag}
                </span>
                <h2 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-[#174F7A] mt-3 mb-4 leading-tight">
                  {c.contact.title}
                </h2>
                <p className="text-base sm:text-lg text-[#5E6B76] leading-relaxed">
                  {c.contact.subtitle}
                </p>
              </div>

              <div className="border-t border-[#EAF0F4] pt-8 space-y-6">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#5E6B76] mb-1">
                    {c.contact.emailLabel}
                  </span>
                  <a
                    href="mailto:aptic.rural19@gmail.com"
                    className="font-mono text-lg sm:text-xl font-bold text-[#174F7A] hover:underline"
                  >
                    aptic.rural19@gmail.com
                  </a>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#5E6B76] mb-1">
                    {c.contact.phoneLabel}
                  </span>
                  <a
                    href="https://wa.me/22891201990"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-lg sm:text-xl font-bold text-[#35A85A] hover:underline"
                  >
                    +228 91 20 19 90
                  </a>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#5E6B76] mb-1">
                    {c.contact.addressLabel}
                  </span>
                  <p className="text-base sm:text-lg text-[#142332] font-semibold">
                    {c.contact.addressVal}
                  </p>
                  <p className="text-xs text-[#5E6B76] mt-1">
                    {c.contact.addressDetail}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="https://wa.me/22891201990"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-sm font-bold text-white bg-[#35A85A] hover:bg-[#2E914E] transition-colors cursor-pointer shadow-sm"
                >
                  <span>💬</span>
                  <span>{c.contact.whatsappBtn}</span>
                </a>
                <button
                  onClick={() => navigate("contact")}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-bold text-[#174F7A] bg-white border border-[#174F7A]/20 hover:bg-white transition-colors cursor-pointer"
                >
                  {c.contact.contactBtn} →
                </button>
              </div>
            </div>

            {/* Volet droit : Vraie Carte territoriale d'Agbélouvé */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAF0F4] shadow-xl">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-[#EAF0F4] flex flex-col items-center justify-center p-8 relative overflow-hidden text-center">
                  {/* Tracé stylisé de l'Axe Routier RN1 Lomé - Agbélouvé */}
                  <div className="absolute inset-0 opacity-25 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 500 380" fill="none">
                      <path d="M50,360 Q200,220 250,160 T450,20" stroke="#174F7A" strokeWidth="5" />
                      <path d="M30,120 Q220,240 480,280" stroke="#35A85A" strokeWidth="3" strokeDasharray="8 8" />
                    </svg>
                  </div>

                  {/* Point repère Agbélouvé */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-[#174F7A] text-white flex items-center justify-center shadow-2xl mx-auto mb-4 text-3xl border-4 border-white animate-bounce">
                      📍
                    </div>
                    <h4 className="text-2xl font-black text-[#142332]">
                      Agbélouvé, Togo
                    </h4>
                    <p className="text-sm font-bold text-[#35A85A] mt-1">
                      {c.contact.mapRegion}
                    </p>
                    <div className="mt-4 inline-block px-4 py-1.5 bg-white/95 backdrop-blur-xs rounded-full text-xs font-mono text-[#5E6B76] border border-[#EAF0F4] shadow-xs">
                      {c.contact.gpsLabel}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#5E6B76] mt-5 leading-relaxed text-center">
                  {c.contact.mapNotice}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
