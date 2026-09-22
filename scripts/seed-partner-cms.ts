import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const PARTNER_CONTENT = {
  FR: {
    partner_hero_badge: "Partenariats & Coopération Internationale",
    partner_hero_line1: "Construisons ensemble",
    partner_hero_line2: "un partenariat à fort impact",
    partner_hero_line3: "au Togo.",
    partner_hero_desc: "Accueillez et déployez des volontaires, engagez votre mécénat de compétences et co-développez des projets durables d'inclusion numérique et d'agroécologie à Agbélouvé.",
    partner_hero_cta_primary: "PROPOSER UN PARTENARIAT",
    partner_hero_cta_secondary: "DÉCOUVRIR LE CADRE",
    partner_hero_stat1_label: "6 à 12 mois",
    partner_hero_stat1_sub: "Durée modulable",
    partner_hero_stat2_label: "Agbélouvé",
    partner_hero_stat2_sub: "Ancrage communautaire",
    partner_hero_stat3_label: "Conventions",
    partner_hero_stat3_sub: "VSI · Césure · Co-projets",

    partner_why_tag: "POURQUOI COOPÉRER AVEC APTIC-R",
    partner_why_title: "Quatre garanties pour une collaboration réussie",
    partner_why_card1_title: "Missions structurées & encadrées",
    partner_why_card1_desc: "Chaque mission s'appuie sur une fiche de poste précise, des objectifs mesurables et un accompagnement de proximité assuré par notre équipe permanente sur place.",
    partner_why_card2_title: "Sécurité & intégration quotidienne",
    partner_why_card2_desc: "Agbélouvé bénéficie d'une situation géographique privilégiée (axe direct RN1 à 60 km de Lomé). Logement sécurisé, tuteur dédié et intégration communautaire bienveillante.",
    partner_why_card3_title: "Transparence & redevabilité",
    partner_why_card3_desc: "Association officiellement enregistrée au Togo (N° 0586/MATDCL). Bilans d'étape réguliers, suivi budgétaire rigoureux et évaluation continue des résultats.",
    partner_why_card4_title: "Open-source & pérennité",
    partner_why_card4_desc: "Toutes les solutions numériques et low-tech créées sont documentées librement pour garantir l'autonomie et l'appropriation totale par les populations locales.",

    partner_frameworks_tag: "MODALITÉS DE PARTENARIAT",
    partner_frameworks_title: "Des formats de coopération adaptés à vos besoins",
    partner_frameworks_subtitle: "Que vous soyez un organisme d'envoi, une université, une entreprise ou une fondation, nous structurons une convention sur-mesure.",

    partner_logistics_tag: "CADRE LOGISTIQUE & TERRAIN",
    partner_logistics_title: "Un accueil sécurisé et structuré à Agbélouvé",
    partner_logistics_subtitle: "Située à 60 km au nord de Lomé sur la route nationale RN1, la commune d'Agbélouvé combine accessibilité, tranquillité rurale et proximité des services essentiels.",

    partner_process_tag: "DÉMARCHE EN 4 ÉTAPES",
    partner_process_title: "Comment construire notre partenariat ?",
    partner_process_subtitle: "Un processus fluide et transparent pour officialiser et déployer notre collaboration.",
    partner_process_step1_title: "Prise de contact & Note de cadrage",
    partner_process_step1_desc: "Remplissez le formulaire en ligne pour nous présenter votre organisation, vos objectifs et vos besoins de coopération.",
    partner_process_step2_title: "Échange vidéo de cadrage",
    partner_process_step2_desc: "Un rendez-vous de 30 minutes avec l'équipe de coordination d'APTIC-R pour aligner les calendriers, profils et modalités d'accueil.",
    partner_process_step3_title: "Signature de la convention",
    partner_process_step3_desc: "Établissement d'une convention formelle précisant les rôles, les engagements logistiques et les modalités de suivi mutuel.",
    partner_process_step4_title: "Lancement opérationnel & Suivi",
    partner_process_step4_desc: "Accueil des volontaires ou déploiement des actions sur le terrain avec comptes-rendus réguliers et bilans d'impact partagés.",

    partner_faq_tag: "FAQ PARTENAIRES",
    partner_faq_title: "Questions fréquentes des organisations",
    partner_faq_subtitle: "Toutes les réponses pour cadrer juridiquement et logistiquement votre partenariat avec APTIC-R.",

    partner_cta_badge: "CO-CONSTRUISONS L'AVENIR",
    partner_cta_title: "Prêt à officialiser un partenariat avec APTIC-R ?",
    partner_cta_desc: "Rejoignez notre réseau d'organisations partenaires en Europe et en Afrique de l'Ouest pour donner à vos volontaires une expérience de terrain inoubliable.",
    partner_cta_btn_primary: "REMPLIR LE FORMULAIRE DE PARTENARIAT",
    partner_cta_btn_secondary: "Découvrir l'espace des volontaires",
  },
  EN: {
    partner_hero_badge: "Partnerships & International Cooperation",
    partner_hero_line1: "Let's build together",
    partner_hero_line2: "a high-impact partnership",
    partner_hero_line3: "in Togo.",
    partner_hero_desc: "Host and deploy volunteers, engage your corporate skills sponsorship, and co-create sustainable digital and agroecological initiatives in Agbélouvé.",
    partner_hero_cta_primary: "PROPOSE A PARTNERSHIP",
    partner_hero_cta_secondary: "DISCOVER THE FRAMEWORK",
    partner_hero_stat1_label: "6 to 12 months",
    partner_hero_stat1_sub: "Flexible duration",
    partner_hero_stat2_label: "Agbélouvé",
    partner_hero_stat2_sub: "Community anchored",
    partner_hero_stat3_label: "Agreements",
    partner_hero_stat3_sub: "VSI · Gap Year · Joint projects",

    partner_why_tag: "WHY PARTNER WITH APTIC-R",
    partner_why_title: "Four guarantees for a successful collaboration",
    partner_why_card1_title: "Structured & mentored missions",
    partner_why_card1_desc: "Each mission relies on a clear job description, measurable goals, and continuous local mentoring provided by our permanent on-site team.",
    partner_why_card2_title: "Safety & daily community integration",
    partner_why_card2_desc: "Agbélouvé enjoys a privileged location on the national road RN1 (60 km north of Lomé). Secure housing, dedicated mentors, and authentic village integration.",
    partner_why_card3_title: "Transparency & accountability",
    partner_why_card3_desc: "Officially registered non-profit in Togo (N° 0586/MATDCL). Regular progress reports, strict budget monitoring, and transparent follow-up.",
    partner_why_card4_title: "Open-source & sustainability",
    partner_why_card4_desc: "All digital and low-tech tools developed are openly documented to ensure total local ownership and autonomy.",

    partner_frameworks_tag: "COOPERATION FRAMEWORKS",
    partner_frameworks_title: "Partnership formats tailored to your structure",
    partner_frameworks_subtitle: "Whether you are a volunteer-sending NGO, a university, a corporate foundation, or an institutional funder, we build a customized agreement.",

    partner_logistics_tag: "LOGISTICS & FIELD FRAMEWORK",
    partner_logistics_title: "Safe, structured hosting in Agbélouvé",
    partner_logistics_subtitle: "Located 60 km north of Lomé on the main highway RN1, Agbélouvé combines accessibility, serene rural life, and proximity to essential services.",

    partner_process_tag: "4-STEP ROADMAP",
    partner_process_title: "How to set up our partnership?",
    partner_process_subtitle: "A smooth and transparent pathway to formalize and roll out our collaboration.",
    partner_process_step1_title: "Contact & Scoping Note",
    partner_process_step1_desc: "Complete our online partnership form to introduce your organization, your objectives, and your collaboration framework.",
    partner_process_step2_title: "Video Scoping Call",
    partner_process_step2_desc: "A 30-minute introductory call with the APTIC-R coordination team to align calendars, profiles, and logistics.",
    partner_process_step3_title: "Agreement Signing",
    partner_process_step3_desc: "Drafting and signature of a formal partnership memorandum outlining mutual roles, logistical commitments, and milestones.",
    partner_process_step4_title: "Operational Launch & Follow-up",
    partner_process_step4_desc: "Volunteer welcoming and project deployment with regular progress reviews and shared impact evaluation.",

    partner_faq_tag: "PARTNER FAQ",
    partner_faq_title: "Frequently asked questions by organizations",
    partner_faq_subtitle: "Everything you need to know regarding legal, organizational, and operational aspects.",

    partner_cta_badge: "SHAPE THE FUTURE TOGETHER",
    partner_cta_title: "Ready to establish a partnership with APTIC-R?",
    partner_cta_desc: "Join our network of partner institutions across Europe and West Africa to provide your volunteers and teams with an unforgettable field experience.",
    partner_cta_btn_primary: "FILL IN THE PARTNERSHIP FORM",
    partner_cta_btn_secondary: "Explore the volunteer space",
  },
  DE: {
    partner_hero_badge: "Partnerschaften & Internationale Zusammenarbeit",
    partner_hero_line1: "Gemeinsam aufbauen",
    partner_hero_line2: "wirkungsvolle Partnerschaften",
    partner_hero_line3: "in Togo.",
    partner_hero_desc: "Entsenden Sie Freiwillige, engagieren Sie sich im Rahmen von Corporate Volunteering und entwickeln Sie nachhaltige Digital- und Agrarprojekte in Agbélouvé.",
    partner_hero_cta_primary: "PARTNERSCHAFT VORSCHLAGEN",
    partner_hero_cta_secondary: "RAHMENBEDINGUNGEN ENTDECKEN",
    partner_hero_stat1_label: "6 bis 12 Monate",
    partner_hero_stat1_sub: "Flexible Dauer",
    partner_hero_stat2_label: "Agbélouvé",
    partner_hero_stat2_sub: "Lokale Verankerung",
    partner_hero_stat3_label: "Vereinbarungen",
    partner_hero_stat3_sub: "weltwärts · Praxissemester",

    partner_why_tag: "WARUM EINE PARTNERSCHAFT MIT APTIC-R",
    partner_why_title: "Vier Garantien für eine erfolgreiche Kooperation",
    partner_why_card1_title: "Strukturierte & betreute Einsätze",
    partner_why_card1_desc: "Jeder Einsatz basiert auf einer klaren Aufgabenbeschreibung, messbaren Zielen und kontinuierlicher Betreuung durch unser festes Team vor Ort.",
    partner_why_card2_title: "Sicherheit & herzliche Integration",
    partner_why_card2_desc: "Agbélouvé liegt verkehrsgünstig an der Nationalstraße RN1 (60 km nördlich von Lomé). Sichere Unterkunft und feste Ansprechpartner.",
    partner_why_card3_title: "Transparenz & Rechenschaftspflicht",
    partner_why_card3_desc: "Offiziell eingetragener Verein in Togo (N° 0586/MATDCL). Regelmäßige Zwischenberichte, strikte Mittelverwendung und offene Kommunikation.",
    partner_why_card4_title: "Open Source & Nachhaltigkeit",
    partner_why_card4_desc: "Alle entwickelten Low-Tech- und IT-Lösungen werden offen dokumentiert, um dauerhafte lokale Eigenständigkeit zu gewährleisten.",

    partner_frameworks_tag: "KOOPERATIONSMÖGLICHKEITEN",
    partner_frameworks_title: "Passende Partnerschaftsformate für Ihre Organisation",
    partner_frameworks_subtitle: "Ob Entsendeorganisation, Hochschule, Stiftung oder Unternehmen – wir erarbeiten eine maßgeschneiderte Kooperationsvereinbarung.",

    partner_logistics_tag: "LOGISTIK & SICHERHEIT",
    partner_logistics_title: "Sichere und strukturierte Aufnahme in Agbélouvé",
    partner_logistics_subtitle: "60 km nördlich von Lomé an der Hauptachse RN1 gelegen, verbindet Agbélouvé Erreichbarkeit, ländliche Ruhe und Nähe zu grundlegenden Dienstleistungen.",

    partner_process_tag: "IN 4 SCHRITTEN",
    partner_process_title: "Wie entsteht unsere Partnerschaft?",
    partner_process_subtitle: "Ein klarer, transparenter Ablauf von der ersten Idee bis zur gemeinsamen Umsetzung.",
    partner_process_step1_title: "Kontaktaufnahme & Profil",
    partner_process_step1_desc: "Füllen Sie das Online-Formular aus und stellen Sie uns Ihre Organisation und Ihre Ziele kurz vor.",
    partner_process_step2_title: "Video-Kennenlerngespräch",
    partner_process_step2_desc: "Ein 30-minütiger Austausch mit dem Leitungsteam von APTIC-R zur Abstimmung von Zeitplänen und Einsatzprofilen.",
    partner_process_step3_title: "Kooperationsvereinbarung",
    partner_process_step3_desc: "Unterzeichnung einer schriftlichen Vereinbarung mit klaren Rollen, Aufgaben und logistischen Zusagen.",
    partner_process_step4_title: "Start & Kontinuierlicher Austausch",
    partner_process_step4_desc: "Begrüßung der Freiwilligen vor Ort und kontinuierliche gemeinsame Begleitung mit regelmäßigen Berichten.",

    partner_faq_tag: "PARTNER-FAQ",
    partner_faq_title: "Häufige Fragen von Organisationen",
    partner_faq_subtitle: "Rechtliche, organisatorische und praktische Antworten auf einen Blick.",

    partner_cta_badge: "GEMEINSAM ZUKUNFT GESTALTEN",
    partner_cta_title: "Bereit für eine Partnerschaft mit APTIC-R?",
    partner_cta_desc: "Werden Sie Teil unseres Partnernetzwerks in Europa und Westafrika und ermöglichen Sie Ihren Teams und Freiwilligen wirkungsvolle Praxiserfahrungen.",
    partner_cta_btn_primary: "PARTNERSCHAFTSFORMULAR AUSFÜLLEN",
    partner_cta_btn_secondary: "Freiwilligenbereich entdecken",
  },
}

async function main() {
  console.log("Seeding Partner CMS settings...")
  
  // 1. Shared Image
  await (prisma as any).parametreSite.upsert({
    where: { key: "partner_hero_image" },
    update: { value: "/meeting-org.jpg", group: "PARTNER" },
    create: {
      key: "partner_hero_image",
      value: "/meeting-org.jpg",
      group: "PARTNER",
      description: "Photo d'illustration de la section Hero Partenaires",
    },
  })

  // 2. Multilingual fields
  for (const [lang, dict] of Object.entries(PARTNER_CONTENT)) {
    const langLower = lang.toLowerCase()
    for (const [baseKey, val] of Object.entries(dict)) {
      const key = `${baseKey}_${langLower}`
      await (prisma as any).parametreSite.upsert({
        where: { key },
        update: { value: val, group: "PARTNER" },
        create: {
          key,
          value: val,
          group: "PARTNER",
          description: `Contenu de la section Partenaires en ${lang}`,
        },
      })
    }
  }

  console.log("Partner CMS settings seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
