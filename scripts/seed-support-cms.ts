import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SUPPORT_CONTENT = {
  FR: {
    support_hero_badge: "SOUTENIR APTIC-R",
    support_hero_title: "Soutenez nos actions pour le développement rural",
    support_hero_desc: "Mettre les compétences, le numérique et les technologies appropriées au service de l'autonomie durable des communautés rurales au Togo.",
    support_hero_cta: "Nous contacter",

    support_axes_tag: "COMMENT SOUTENIR NOS ACTIONS ?",
    support_axes_title: "Quatre façons d'accompagner nos projets",
    support_axes_subtitle: "Chaque contribution (financière, matérielle, méthodologique ou institutionnelle) renforce directement l'impact de nos actions sur le terrain.",
    support_axes_1_title: "FINANCEMENT DE PROJETS",
    support_axes_1_desc: "Soutenir directement l'équipement de centres numériques ruraux, le déploiement de kits solaires pour écoles hors-réseau ou des bourses de formation pour les jeunes et les femmes.",
    support_axes_1_link: "Échanger avec l'équipe",
    support_axes_2_title: "DON DE MATÉRIEL",
    support_axes_2_desc: "Fournir des équipements informatiques fonctionnels ou reconditionnés (ordinateurs portables, serveurs locaux, routeurs) et du matériel photovoltaïque pour nos FabLabs et salles communautaires.",
    support_axes_2_link: "Proposer un don",
    support_axes_3_title: "MÉCÉNAT DE COMPÉTENCES",
    support_axes_3_desc: "Mettre votre expertise technique, pédagogique ou organisationnelle à disposition de l'équipe locale : développement low-tech, cybersécurité, formation ou encadrement de projets.",
    support_axes_3_link: "Partager vos compétences",
    support_axes_4_title: "PARTENARIATS & SPONSORING",
    support_axes_4_desc: "Entreprises, fondations et institutions : co-construisez avec l'APTIC-R des programmes pluriannuels d'inclusion et d'émancipation rurale alignés sur vos engagements de responsabilité sociétale.",
    support_axes_4_link: "Devenir organisation partenaire",

    support_why_tag: "POURQUOI VOTRE SOUTIEN COMPTE ?",
    support_why_title: "Un impact direct et mesurable au cœur des territoires",
    support_why_desc: "À Agbélouvé et dans les communautés rurales environnantes, chaque ressource mobilisée répond à un besoin prioritaire identifié avec les habitants : électrification solaire de salles de classe, accès à des ressources pédagogiques libres et formation pratique aux métiers de demain.",
    support_why_1_title: "Des projets ancrés dans le réel",
    support_why_1_desc: "Toutes nos initiatives partent des besoins formulés par les acteurs locaux et sont co-construites pour durer.",
    support_why_2_title: "Un transfert durable de compétences",
    support_why_2_desc: "Nous formons les jeunes et les femmes à maintenir, adapter et faire évoluer eux-mêmes les installations.",
    support_why_3_title: "Une gestion rigoureuse et concertée",
    support_why_3_desc: "Chaque ressource est allouée avec discernement sous la supervision du Bureau Exécutif et des référents de projet.",

    support_transparency_tag: "TRANSPARENCE & REDEVABILITÉ",
    support_transparency_title: "Une gestion claire et responsable",
    support_transparency_desc: "L'APTIC-R est une association officiellement reconnue au Togo (Récépissé N° 0586/MATDCL-DAPL-DOCA). Chaque contribution fait l'objet d'une information claire sur son affectation, selon les modalités définies en accord avec l'association.",
    support_transparency_receipt: "Une attestation ou un reçu officiel de don est systématiquement délivré pour chaque contribution financière ou matérielle.",

    support_future_tag: "ÉVOLUTION FUTURE",
    support_future_title: "Paiements et dons en ligne",
    support_future_desc: "Une solution de don en ligne sécurisée pourra être intégrée ultérieurement, après validation officielle des modalités et des partenaires financiers par l'APTIC-R.",

    support_cta_title: "Vous souhaitez soutenir un projet spécifique ?",
    support_cta_desc: "Notre équipe de coordination est à votre entière disposition pour vous présenter les besoins prioritaires sur le terrain et définir ensemble les modalités de votre soutien.",
    support_cta_btn_contact: "Nous contacter",
    support_cta_btn_whatsapp: "Échanger sur WhatsApp",
  },
  EN: {
    support_hero_badge: "SUPPORT APTIC-R",
    support_hero_title: "Support Our Actions for Rural Development",
    support_hero_desc: "Empowering rural communities in Togo through digital technology, shared skills, and appropriate low-tech solutions.",
    support_hero_cta: "Contact Us",

    support_axes_tag: "HOW TO SUPPORT OUR INITIATIVES?",
    support_axes_title: "Four ways to stand alongside our mission",
    support_axes_subtitle: "Every contribution (financial, hardware, expertise, or institutional partnership) directly strengthens grassroots impact.",
    support_axes_1_title: "PROJECT FUNDING",
    support_axes_1_desc: "Directly fund equipment for rural multimedia hubs, autonomous solar kits for off-grid schools, or training grants for youth and women.",
    support_axes_1_link: "Discuss with the team",
    support_axes_2_title: "HARDWARE DONATION",
    support_axes_2_desc: "Provide working or refurbished IT hardware (laptops, local micro-servers, routers) and solar equipment for our community FabLabs.",
    support_axes_2_link: "Propose a donation",
    support_axes_3_title: "SKILLS-BASED SPONSORSHIP",
    support_axes_3_desc: "Share your technical, pedagogical, or organizational skills with our local teams: low-tech engineering, cybersecurity, or training.",
    support_axes_3_link: "Share your skills",
    support_axes_4_title: "PARTNERSHIPS & SPONSORSHIP",
    support_axes_4_desc: "Corporations, foundations, and institutions: co-build multi-year rural digital inclusion programs aligned with your CSR priorities.",
    support_axes_4_link: "Become a partner organization",

    support_why_tag: "WHY YOUR SUPPORT MATTERS",
    support_why_title: "Direct and measurable impact on the ground",
    support_why_desc: "In Agbélouvé and surrounding villages, every mobilized resource directly addresses real needs identified with local communities: solar power for classrooms, open educational resources, and practical digital training.",
    support_why_1_title: "Grassroots-anchored initiatives",
    support_why_1_desc: "All projects stem from real local needs and are designed alongside community leaders for long-term sustainability.",
    support_why_2_title: "Sustainable knowledge transfer",
    support_why_2_desc: "We train local youth and women to maintain, adapt, and expand technical installations autonomously.",
    support_why_3_title: "Accountable resource allocation",
    support_why_3_desc: "Every fund and item is carefully managed under the strict supervision of the Executive Board.",

    support_transparency_tag: "TRANSPARENCY & ACCOUNTABILITY",
    support_transparency_title: "Responsible and clear governance",
    support_transparency_desc: "APTIC-R is an officially registered non-profit organization in Togo (Receipt N° 0586/MATDCL-DAPL-DOCA). Every contribution is accounted for with complete transparency.",
    support_transparency_receipt: "An official donation receipt or certificate is systematically provided for every financial or material contribution.",

    support_future_tag: "FUTURE DEVELOPMENT",
    support_future_title: "Online Donations & Payments",
    support_future_desc: "A secure online donation portal may be integrated at a later stage, following official review and approval of payment partners by APTIC-R.",

    support_cta_title: "Looking to support a specific initiative?",
    support_cta_desc: "Our coordination team is available to discuss current priorities and structure a collaboration tailored to your organization.",
    support_cta_btn_contact: "Contact Us",
    support_cta_btn_whatsapp: "Message on WhatsApp",
  },
  DE: {
    support_hero_badge: "APTIC-R UNTERSTÜTZEN",
    support_hero_title: "Unterstützen Sie unsere Arbeit für die ländliche Entwicklung",
    support_hero_desc: "Digitale Kompetenzen und angepasste Technologien für eine nachhaltige Selbstständigkeit ländlicher Gemeinschaften in Togo einsetzen.",
    support_hero_cta: "Kontakt aufnehmen",

    support_axes_tag: "WIE KÖNNEN SIE HELFEN?",
    support_axes_title: "Vier Wege, unsere Projekte zu begleiten",
    support_axes_subtitle: "Jeder Beitrag (finanziell, materiell, fachlich oder institutionell) stärkt unsere Wirkung vor Ort.",
    support_axes_1_title: "PROJEKTFINANZIERUNG",
    support_axes_1_desc: "Fördern Sie direkt die Ausstattung ländlicher Computerräume, Solaranlagen für Dorfschulen oder Ausbildungsstipendien für junge Menschen.",
    support_axes_1_link: "Mit dem Team sprechen",
    support_axes_2_title: "SACHSPENDEN",
    support_axes_2_desc: "Spenden Sie funktionierende oder aufbereitete IT-Geräte (Laptops, lokale Server, Router) und Photovoltaik-Komponenten für unsere FabLabs.",
    support_axes_2_link: "Sachspende vorschlagen",
    support_axes_3_title: "KOMPETENZSPENDE",
    support_axes_3_desc: "Bringen Sie Ihr technisches oder pädagogisches Fachwissen ein: Low-Tech-Lösungen, Cybersicherheit, Schulungen oder Projektbegleitung.",
    support_axes_3_link: "Kompetenzen teilen",
    support_axes_4_title: "PARTNERSCHAFTEN & SPONSORING",
    support_axes_4_desc: "Unternehmen und Stiftungen: Entwickeln Sie gemeinsam mit APTIC-R nachhaltige Förderprogramme im Rahmen Ihrer CSR-Strategie.",
    support_axes_4_link: "Partnerorganisation werden",

    support_why_tag: "WARUM IHRE UNTERSTÜTZUNG ZÄHLT",
    support_why_title: "Direkte und messbare Wirkung in den Dörfern",
    support_why_desc: "In Agbélouvé und den umliegenden Dörfern beantwortet jede Unterstützung einen konkreten Bedarf: Solarstrom für Klassenzimmer, freie Bildungsressourcen und praktische Zukunftskompetenzen.",
    support_why_1_title: "Lokal verankerte Projekte",
    support_why_1_desc: "Alle Initiativen entstehen aus den Bedürfnissen der Menschen vor Ort und sind auf Dauerhaftigkeit ausgelegt.",
    support_why_2_title: "Nachhaltiger Wissenstransfer",
    support_why_2_desc: "Wir befähigen Jugendliche und Frauen, technische Einrichtungen eigenständig zu warten und weiterzuentwickeln.",
    support_why_3_title: "Gewissenhafte Mittelverwendung",
    support_why_3_desc: "Jedes Fördermittel wird transparent und zielgerichtet unter Aufsicht des Vorstands eingesetzt.",

    support_transparency_tag: "TRANSPARENZ & RECHENSCHAFT",
    support_transparency_title: "Verantwortungsvolle und klare Führung",
    support_transparency_desc: "APTIC-R ist ein offiziell anerkannter Verein in Togo (Reg.-Nr. 0586/MATDCL-DAPL-DOCA). Jede Unterstützung wird transparent und zweckgebunden ausgewiesen.",
    support_transparency_receipt: "Für jede finanzielle oder materielle Unterstützung stellen wir eine offizielle Spendenbescheinigung aus.",

    support_future_tag: "ZUKÜNFTIGE ENTWICKLUNG",
    support_future_title: "Online-Spenden",
    support_future_desc: "Eine sichere Online-Spendenfunktion kann zu einem späteren Zeitpunkt nach Prüfung und Freigabe durch APTIC-R integriert werden.",

    support_cta_title: "Möchten Sie ein konkretes Vorhaben unterstützen?",
    support_cta_desc: "Unser Koordinationsteam steht Ihnen gerne zur Verfügung, um über aktuelle Bedarfe und Möglichkeiten zu sprechen.",
    support_cta_btn_contact: "Kontakt aufnehmen",
    support_cta_btn_whatsapp: "Über WhatsApp schreiben",
  },
}

async function main() {
  console.log("🌱 Seeding Support CMS content into ParametreSite...")

  const commonSettings = [
    {
      key: "support_hero_image",
      value: "https://images.unsplash.com/photo-1609252509229-364936a1d1a2?w=1000&h=750&fit=crop&auto=format",
      group: "SUPPORT",
      description: "Photo principale (Hero) de la page Soutien",
    },
    {
      key: "support_contact_email",
      value: "contact@aptic-r.org",
      group: "SUPPORT",
      description: "Email de contact Soutien & Mécénat",
    },
  ]

  for (const s of commonSettings) {
    await prisma.parametreSite.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group, description: s.description },
      create: { key: s.key, value: s.value, group: s.group, description: s.description },
    })
    console.log(`  ✓ Common: ${s.key}`)
  }

  for (const [lang, dict] of Object.entries(SUPPORT_CONTENT)) {
    const l = lang.toLowerCase()
    for (const [fieldKey, text] of Object.entries(dict)) {
      const dbKey = `${fieldKey}_${l}`
      await prisma.parametreSite.upsert({
        where: { key: dbKey },
        update: { value: text, group: "SUPPORT", description: `Support CMS (${lang})` },
        create: { key: dbKey, value: text, group: "SUPPORT", description: `Support CMS (${lang})` },
      })
      console.log(`  ✓ [${lang}] ${dbKey}`)
    }
  }

  console.log("✅ Successfully seeded all Support CMS fields!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
