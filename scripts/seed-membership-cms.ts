import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const MEMBERSHIP_CONTENT = {
  FR: {
    membership_hero_badge: "ADHÉSION & ENGAGEMENT",
    membership_hero_title: "Rejoignez la communauté APTIC-R",
    membership_hero_desc: "Participez à une communauté engagée pour mettre le numérique, les compétences et l'innovation au service des territoires ruraux.",
    membership_hero_cta: "DEVENIR MEMBRE",

    membership_why_tag: "POURQUOI DEVENIR MEMBRE ?",
    membership_why_title: "Quatre façons d'avoir un impact réel",
    membership_why_subtitle: "L'adhésion à APTIC-R vous ouvre les portes d'un engagement concret, démocratique et porteur de sens.",
    membership_why_card1_title: "PARTICIPER",
    membership_why_card1_desc: "Participer aux décisions et à la vie associative.",
    membership_why_card2_title: "CO-CONSTRUIRE",
    membership_why_card2_desc: "Concevoir et animer des projets concrets.",
    membership_why_card3_title: "INTÉGRER LE RÉSEAU",
    membership_why_card3_desc: "Rejoindre une communauté pluridisciplinaire.",
    membership_why_card4_title: "ACCÉDER AUX OPPORTUNITÉS",
    membership_why_card4_desc: "Participer aux activités, formations et projets.",

    membership_contribute_tag: "MODES D'ENGAGEMENT",
    membership_contribute_title: "Comment souhaitez-vous contribuer ?",
    membership_contribute_subtitle: "Chaque membre s'investit selon ses aspirations, son rythme et ses compétences.",
    membership_contribute_item1_title: "Participer aux activités",
    membership_contribute_item1_desc: "Prendre part aux ateliers de sensibilisation, aux événements communautaires et aux Assemblées Générales.",
    membership_contribute_item2_title: "Apporter votre expertise",
    membership_contribute_item2_desc: "Mettre vos compétences (tech, agronomie, gestion, droit, communication) au service des initiatives de terrain.",
    membership_contribute_item3_title: "Former et accompagner",
    membership_contribute_item3_desc: "Transmettre vos connaissances auprès des jeunes, des femmes et des porteurs de projets locaux.",
    membership_contribute_item4_title: "Contribuer aux projets",
    membership_contribute_item4_desc: "S'impliquer dans la conception et le déploiement de solutions numériques, solaires ou Low-Tech.",
    membership_contribute_item5_title: "Mobiliser des partenaires",
    membership_contribute_item5_desc: "Développer notre réseau d'alliances, de mécénat et de coopérations nationales ou internationales.",
    membership_contribute_item6_title: "Soutenir matériellement ou financièrement",
    membership_contribute_item6_desc: "Faire un don, fournir des équipements informatiques ou apporter un soutien matériel.",

    membership_who_tag: "PROFILS & ÉLIGIBILITÉ",
    membership_who_title: "Qui peut rejoindre APTIC-R ?",
    membership_who_text: "Étudiants, professionnels, entrepreneurs, enseignants, bénévoles, acteurs communautaires et toute personne partageant les valeurs de l'APTIC-R peuvent s'impliquer selon les modalités définies par l'association.",
    membership_who_subtext: "Aucun prérequis technique n'est exigé : c'est avant tout l'adhésion aux valeurs de solidarité et de développement rural qui rassemble notre communauté.",
    membership_who_badges: "Étudiants & Chercheurs, Professionnels & Experts, Makers & Bénévoles, Acteurs communautaires, Citoyens engagés",

    membership_cta_tag: "PASSEZ À L'ACTION",
    membership_cta_title: "Prêt à nous rejoindre ?",
    membership_cta_desc: "Rejoignez un collectif dynamique et contribuez concrètement à l'émancipation des communautés rurales au Togo.",
    membership_cta_btn: "DEVENIR MEMBRE",

    membership_form_tag: "ENGAGEMENT",
    membership_form_title: "Formulaire d'adhésion",
    membership_form_desc: "Remplissez les informations ci-dessous pour nous transmettre votre demande d'adhésion.",
  },
  EN: {
    membership_hero_badge: "MEMBERSHIP & ENGAGEMENT",
    membership_hero_title: "Join the APTIC-R Community",
    membership_hero_desc: "Be part of a dedicated community empowering rural territories through digital technology, skills, and innovation.",
    membership_hero_cta: "BECOME A MEMBER",

    membership_why_tag: "WHY BECOME A MEMBER?",
    membership_why_title: "Four ways to create lasting impact",
    membership_why_subtitle: "Joining APTIC-R opens the door to meaningful and community-driven action.",
    membership_why_card1_title: "PARTICIPATE",
    membership_why_card1_desc: "Take part in decisions and associative life.",
    membership_why_card2_title: "CO-BUILD",
    membership_why_card2_desc: "Design and lead practical community projects.",
    membership_why_card3_title: "CONNECT",
    membership_why_card3_desc: "Join a multidisciplinary network.",
    membership_why_card4_title: "ACCESS OPPORTUNITIES",
    membership_why_card4_desc: "Participate in activities, trainings, and projects.",

    membership_contribute_tag: "MODES OF CONTRIBUTION",
    membership_contribute_title: "How would you like to contribute?",
    membership_contribute_subtitle: "Each member contributes according to their personal aspirations, schedule, and skills.",
    membership_contribute_item1_title: "Participate in activities",
    membership_contribute_item1_desc: "Join outreach sessions, community workshops, and General Assemblies.",
    membership_contribute_item2_title: "Share your expertise",
    membership_contribute_item2_desc: "Lend technical, agronomic, legal, managerial, or communication skills to field projects.",
    membership_contribute_item3_title: "Train and mentor",
    membership_contribute_item3_desc: "Pass on practical knowledge to local youth, women cooperatives, and community leaders.",
    membership_contribute_item4_title: "Contribute to projects",
    membership_contribute_item4_desc: "Engage in designing and rolling out digital, solar, or Low-Tech community solutions.",
    membership_contribute_item5_title: "Mobilize partners",
    membership_contribute_item5_desc: "Expand our institutional network, advocacy initiatives, and funding alliances.",
    membership_contribute_item6_title: "Provide material or financial support",
    membership_contribute_item6_desc: "Donate refurbished equipment or provide financial support.",

    membership_who_tag: "PROFILES & ELIGIBILITY",
    membership_who_title: "Who can join APTIC-R?",
    membership_who_text: "Students, professionals, entrepreneurs, educators, volunteers, community actors, and anyone sharing the values of APTIC-R can get involved according to associative modalities.",
    membership_who_subtext: "No technical prerequisites required: what unites us is a shared commitment to rural empowerment.",
    membership_who_badges: "Students & Researchers, Professionals & Experts, Makers & Volunteers, Community Actors, Engaged Citizens",

    membership_cta_tag: "TAKE ACTION",
    membership_cta_title: "Ready to join us?",
    membership_cta_desc: "Join a dynamic collective and actively contribute to rural community autonomy in Togo.",
    membership_cta_btn: "BECOME A MEMBER",

    membership_form_tag: "APPLICATION",
    membership_form_title: "Membership Application Form",
    membership_form_desc: "Fill in the details below to submit your membership request.",
  },
  DE: {
    membership_hero_badge: "MITGLIEDSCHAFT & ENGAGEMENT",
    membership_hero_title: "Werden Sie Teil der APTIC-R Gemeinschaft",
    membership_hero_desc: "Beteiligen Sie sich an einer engagierten Gemeinschaft, die digitale Technologien, Kompetenzen und Innovation in den Dienst ländlicher Räume stellt.",
    membership_hero_cta: "MITGLIED WERDEN",

    membership_why_tag: "WARUM MITGLIED WERDEN?",
    membership_why_title: "Vier Wege, konkrete Wirkung zu erzielen",
    membership_why_subtitle: "Die Mitgliedschaft bei APTIC-R eröffnet Ihnen konkrete und sinnstiftende Mitgestaltungsmöglichkeiten.",
    membership_why_card1_title: "MITBESTIMMEN",
    membership_why_card1_desc: "Beteiligung an Entscheidungen und am Vereinsleben.",
    membership_why_card2_title: "GEMEINSAM GESTALTEN",
    membership_why_card2_desc: "Konzeption und Begleitung konkreter Projekte.",
    membership_why_card3_title: "NETZWERK NUTZEN",
    membership_why_card3_desc: "Austausch in einem interdisziplinären Netzwerk.",
    membership_why_card4_title: "CHANCEN NUTZEN",
    membership_why_card4_desc: "Teilnahme an Aktivitäten, Schulungen und Projekten.",

    membership_contribute_tag: "BEITRAGSFORMEN",
    membership_contribute_title: "Wie möchten Sie sich einbringen?",
    membership_contribute_subtitle: "Jedes Mitglied engagiert sich nach eigenen Interessen, Zeitressourcen und Fähigkeiten.",
    membership_contribute_item1_title: "An Aktivitäten teilnehmen",
    membership_contribute_item1_desc: "Teilnahme an Workshops, Vereinsveranstaltungen und Versammlungen.",
    membership_contribute_item2_title: "Fachwissen einbringen",
    membership_contribute_item2_desc: "Bereitstellung von Expertise (IT, Agronomie, Recht, Kommunikation) für Initiativen.",
    membership_contribute_item3_title: "Schulen und begleiten",
    membership_contribute_item3_desc: "Wissensvermittlung an Jugendliche, Frauenkooperativen und lokale Projektträger.",
    membership_contribute_item4_title: "Projekte vorantreiben",
    membership_contribute_item4_desc: "Mitwirkung an der Entwicklung und Umsetzung von Digital- und Low-Tech-Lösungen.",
    membership_contribute_item5_title: "Partner mobilisieren",
    membership_contribute_item5_desc: "Ausbau unseres Netzwerks an Partnerschaften, Förderern und Kooperationen.",
    membership_contribute_item6_title: "Unterstützung leisten",
    membership_contribute_item6_desc: "Spenden von Hardware oder Bereitstellung materieller Unterstützung.",

    membership_who_tag: "ZIELGRUPPEN & TEILNAHME",
    membership_who_title: "Wer kann bei APTIC-R mitmachen?",
    membership_who_text: "Studierende, Fachkräfte, Unternehmer, Lehrkräfte, Freiwillige, Gemeinschaftsakteure und alle, die die Werte von APTIC-R teilen, können sich engagieren.",
    membership_who_subtext: "Keine technischen Vorkenntnisse erforderlich: Entscheidend ist die Begeisterung für nachhaltige ländliche Entwicklung.",
    membership_who_badges: "Studierende & Forschende, Fachkräfte & Experten, Macher & Freiwillige, Akteure vor Ort, Engagierte Bürger",

    membership_cta_tag: "JETZT MITMACHEN",
    membership_cta_title: "Bereit für Ihr Engagement?",
    membership_cta_desc: "Schließen Sie sich einer dynamischen Gemeinschaft an und stärken Sie ländliche Regionen in Togo.",
    membership_cta_btn: "MITGLIED WERDEN",

    membership_form_tag: "ANTRAG",
    membership_form_title: "Mitgliedsantrag",
    membership_form_desc: "Füllen Sie das Formular aus, um Ihren Mitgliedsantrag einzureichen.",
  },
}

async function main() {
  console.log("Seeding Membership CMS settings...")

  // Multilingual fields
  for (const [lang, dict] of Object.entries(MEMBERSHIP_CONTENT)) {
    const langLower = lang.toLowerCase()
    for (const [baseKey, val] of Object.entries(dict)) {
      const key = `${baseKey}_${langLower}`
      await (prisma as any).parametreSite.upsert({
        where: { key },
        update: { value: val, group: "MEMBERSHIP" },
        create: {
          key,
          value: val,
          group: "MEMBERSHIP",
          description: `Contenu de la section Adhésion en ${lang}`,
        },
      })
    }
  }

  console.log("Membership CMS settings seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
