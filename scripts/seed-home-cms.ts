import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const CONTENT = {
  FR: {
    hero: {
      territoryBadge: "AGBÉLOUVÉ · RÉGION MARITIME · TOGO",
      titleLine1: "Le numérique au service",
      titleLine2: "des territoires ruraux.",
      subtitle:
        "Depuis Agbélouvé, l’APTIC-R co-construit avec les communautés paysannes et scolaires des solutions technologiques et solaires accessibles, réparables et émancipatrices.",
      ctaProjects: "DÉCOUVRIR NOS PROJETS DE TERRAIN",
      ctaGetInvolved: "COMMENT S’ENGAGER AVEC NOUS",
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
        "« Depuis 2018, l’APTIC-R accompagne les communautés rurales au Togo en mettant les technologies, les compétences et l’innovation au service des territoires. »",
      p1: "Née à Agbélouvé d’une volonté collective de professionnels togolais et de leaders communautaires, l’APTIC-R s’est constituée pour refuser la fatalité de la fracture numérique qui isole les campagnes d’Afrique de l’Ouest.",
      p2: "Notre démarche repose sur une conviction éprouvée sur le terrain : la technologie ne doit pas être un bien de consommation passif importé, mais un levier d’autonomie et de dignité maîtrisé, réparé et transmis localement par les jeunes et les femmes du milieu rural.",
      moreBtn: "En savoir plus sur l’APTIC-R et notre gouvernance",
    },
    domains: {
      tag: "NOS DOMAINES D’INTERVENTION",
      title: "Six Domaines d’Action Stratégiques",
      subtitle:
        "Une approche intégrée qui conjugue éducation, énergie solaire autonome, souveraineté alimentaire et compétences du XXIe siècle.",
      discoverLabel: "Découvrir ce domaine",
    },
    impact: {
      tag: "NOTRE IMPACT EN CHIFFRES",
      title: "Des résultats tangibles, mesurés avec les communautés",
      stat1Val: "2018",
      stat1Lbl: "Fondation d’APTIC-R",
      stat1Sub: "Enregistrée sous le N° 0586/MATDCL",
      stat2Val: "06",
      stat2Lbl: "Domaines d’action",
      stat2Sub: "Programme d’intervention structuré",
      stat3Val: "15+",
      stat3Lbl: "Villages & Écoles",
      stat3Sub: "Bénéficiaires directs en Région Maritime",
      stat4Val: "100%",
      stat4Lbl: "Solutions réparables",
      stat4Sub: "Énergie solaire & matériel maintenable localement",
      legalNotice: "Données d’impact certifiées sur le terrain · République Togolaise · Région Maritime",
    },
    projects: {
      tag: "SUR LE TERRAIN",
      title: "Initiatives Phares & Projets de Terrain",
      allProjectsBtn: "Découvrir tous nos projets de terrain",
    },
    fieldReport: {
      tag: "RÉCIT DOCUMENTAIRE",
      title: "« À Agbélouvé, la technologie n’est pas importée : elle est adoptée et réparée sur place. »",
      quote:
        "Chaque poste informatique installé, chaque panneau solaire posé répond à une demande formelle d’un conseil d’école ou d’un groupement paysan. Nous ne laissons aucun équipement sans former les tuteurs locaux chargés de sa maintenance durable.",
      author: "Équipe de coordination territoriale APTIC-R",
      location: "Agbélouvé · Préfecture du Zio · Togo",
    },
    getInvolved: {
      tag: "COMMENT AGIR AVEC NOUS",
      title: "Quatre Façons Concrètes d’Agir avec Nous",
      subtitle:
        "Que vous soyez un citoyen togolais, un volontaire international, une université ou une fondation, votre apport construit l’autonomie de demain.",
      path1Title: "Devenir Volontaire de Terrain",
      path1Desc: "Engagez-vous en immersion complète à Agbélouvé. Partagez vos compétences informatiques, pédagogiques ou agronomiques au cœur des projets villageois.",
      path1Btn: "Postuler comme volontaire",
      path2Title: "Rejoindre l’Association comme Membre",
      path2Desc: "Rejoignez l’APTIC-R en tant que membre actif ou sympathisant. Participez aux orientations stratégiques, assemblées générales et à la vie démocratique.",
      path2Btn: "Rejoindre l’association",
      path3Title: "Bâtir un Partenariat Institutionnel",
      path3Desc: "Organismes d’envoi de volontaires, établissements d’enseignement supérieur et bailleurs : bâtissons une coopération pluriannuelle durable et structurée.",
      path3Btn: "Proposer un partenariat",
      path4Title: "Soutenir nos Écoles & Ateliers Ruraux",
      path4Desc: "Don d’ordinateurs reconditionnés, mécénat de compétences ou financement ciblé de salles solaires : chaque contribution a un impact villageois direct.",
      path4Btn: "Modalités de soutien & dons",
    },
    newsletter: {
      eyebrow: "RESTEZ INFORMÉ",
      title: "Actualités, projets et initiatives d’APTIC-R",
      desc: "Recevez par courriel nos bilans de projets, annonces d’ateliers et opportunités d’engagement. Pas de spam, désinscription en 1 clic.",
    },
    contact: {
      tag: "CONTACT & TERRITOIRE",
      title: "Prenez Contact avec l’APTIC-R",
      subtitle: "Vous souhaitez collaborer, devenir membre, proposer un projet de développement rural ou en savoir plus sur nos actions au Togo ?",
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
        "“Since 2018, APTIC-R has supported rural communities in Togo by putting technology, skills, and innovation at the service of local development.”",
      p1: "Founded in Agbélouvé by local tech educators and community leaders, APTIC-R was born to counter the rural digital divide that isolates West African countryside communities.",
      p2: "Our approach rests on a proven field conviction: technology must not be an imported passive consumer good, but a lever of autonomy and dignity mastered, repaired, and passed on locally by rural youth and women.",
      moreBtn: "Learn more about APTIC-R and our governance",
    },
    domains: {
      tag: "STRATEGIC DOMAINS",
      title: "Six Strategic Intervention Domains",
      subtitle: "An integrated framework combining digital education, solar energy, sustainable farming, and modern skills.",
      discoverLabel: "Explore this domain",
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
      allProjectsBtn: "View all field projects",
    },
    fieldReport: {
      tag: "DOCUMENTARY INSIGHT",
      title: "“In Agbélouvé, technology is never imposed: it is adopted and repaired by the community.”",
      quote:
        "Every computer installed and every solar panel mounted responds to a direct community request. We never leave equipment behind without training local caretakers for sustainable maintenance.",
      author: "APTIC-R Territorial Coordination Team",
      location: "Agbélouvé · Zio Prefecture · Togo",
    },
    getInvolved: {
      tag: "GET INVOLVED",
      title: "Four Concrete Ways to Take Action with Us",
      subtitle: "Whether you are an international volunteer, partner NGO, academic institution, or donor, your contribution matters.",
      path1Title: "Become a Field Volunteer", path1Desc: "Join us for 6 to 12 months in Agbélouvé to share tech, educational, or agronomic skills with village projects.", path1Btn: "Apply as volunteer",
      path2Title: "Join the Association as a Member", path2Desc: "Join APTIC-R as an active member and participate in strategic orientations, assemblies, and democratic governance.", path2Btn: "Join as member",
      path3Title: "Build an Institutional Partnership", path3Desc: "Volunteer-sending agencies, universities, and foundations: let’s build lasting multi-year partnerships.", path3Btn: "Propose a partnership",
      path4Title: "Support our Rural Schools & Labs", path4Desc: "Donate refurbished hardware, offer pro bono expertise, or sponsor rural school solar stations directly.", path4Btn: "Support options & donations",
    },
    newsletter: {
      eyebrow: "STAY INFORMED",
      title: "News, field projects, and initiatives from APTIC-R",
      desc: "Receive our quarterly project summaries, workshop announcements, and calls for volunteers. Unsubscribe anytime.",
    },
    contact: {
      tag: "CONTACT & TERRITORY", title: "Connect with APTIC-R",
      subtitle: "Interested in collaborating, joining as a member, proposing a rural development project, or learning more about our work in Togo?",
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
      headline: "„Seit 2018 begleitet APTIC-R ländliche Gemeinden in Togo und stellt Technologie, Bildung und Innovation in den Dienst der Menschen vor Ort.“",
      p1: "In Agbélouvé von lokalen Fachkräften und Gemeindevertretern gegründet, entstand APTIC-R, um der digitalen Isolation im ländlichen Westafrika aktiv entgegenzuwirken.",
      p2: "Unser Ansatz beruht auf einer festen Überzeugung: Technologie darf kein importiertes Konsumgut sein, sondern muss ein Werkzeug der Eigenständigkeit sein – lokal gewartet, verstanden und weitergegeben von jungen Menschen und Frauen.",
      moreBtn: "Mehr über APTIC-R und unsere Organisationsstruktur",
    },
    domains: {
      tag: "STRATEGISCHE BEREICHE",
      title: "Sechs Strategische Handlungsfelder",
      subtitle: "Ein ganzheitlicher Ansatz, der digitale Bildung, Solarenergie und nachhaltige Landwirtschaft vereint.",
      discoverLabel: "Bereich entdecken",
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
      allProjectsBtn: "Alle Projekte entdecken",
    },
    fieldReport: {
      tag: "EINBLICK VOR ORT",
      title: "„In Agbélouvé wird Technologie nicht importiert, sondern von den Menschen selbst verstanden und gewartet.“",
      quote: "Jeder installierte Rechner und jedes Solarmodul geht auf einen konkreten Wunsch der Schule oder Dorfgemeinschaft zurück. Keine Technik bleibt ohne ausgebildete Betreuer für eine nachhaltige Instandhaltung.",
      author: "APTIC-R Koordinationsteam vor Ort",
      location: "Agbélouvé · Präfektur Zio · Togo",
    },
    getInvolved: {
      tag: "MITMACHEN",
      title: "Vier konkrete Wege, sich zu engagieren",
      subtitle: "Ob Freiwilliger, Partnerorganisation, Universität oder Förderer: Ihr Beitrag baut die Zukunft vor Ort auf.",
      path1Title: "Freiwilligendienst vor Ort", path1Desc: "Engagieren Sie sich direkt in Agbélouvé und teilen Sie Ihr technisches Wissen im Herzen der Dorfprojekte.", path1Btn: "Als Freiwilliger bewerben",
      path2Title: "Mitglied des Vereins werden", path2Desc: "Treten Sie APTIC-R als aktives Mitglied bei und bestimmen Sie die strategische Ausrichtung demokratisch mit.", path2Btn: "Mitglied werden",
      path3Title: "Eine langfristige Partnerschaft aufbauen", path3Desc: "Entsendeorganisationen, Hochschulen und Stiftungen: Gemeinsam nachhaltige Kooperationen gestalten.", path3Btn: "Partnerschaft vorschlagen",
      path4Title: "Unsere Dorfschulen & Werkstätten fördern", path4Desc: "Spende von Laptops, Fachwissen oder gezielte Finanzierung netzunabhängiger Solarräume.", path4Btn: "Förderwege & Spenden",
    },
    newsletter: {
      eyebrow: "INFORMIERT BLEIBEN",
      title: "Neuigkeiten, Projekte und Initiativen von APTIC-R",
      desc: "Erhalten Sie Berichte, Werkstattankündigungen und Aufrufe für Freiwillige. Abmeldung jederzeit möglich.",
    },
    contact: {
      tag: "KONTAKT & STANDORT", title: "Kontakt zu APTIC-R",
      subtitle: "Möchten Sie kooperieren, Mitglied werden, ein Entwicklungsprojekt vorschlagen oder mehr über unsere Arbeit in Togo erfahren?",
    },
  },
}

async function main() {
  const toUpsert: { key: string; value: string; group: string; description?: string }[] = []

  const languages = ["FR", "EN", "DE"] as const

  for (const lang of languages) {
    const l = lang.toLowerCase()
    const src = CONTENT[lang]

    // HERO
    toUpsert.push({ key: `home_hero_badge_${l}`, value: src.hero.territoryBadge, group: "HOME" })
    toUpsert.push({ key: `home_hero_title_${l}`, value: `${src.hero.titleLine1}\n${src.hero.titleLine2}`, group: "HOME" })
    toUpsert.push({ key: `home_hero_subtitle_${l}`, value: src.hero.subtitle, group: "HOME" })
    toUpsert.push({ key: `home_hero_cta1_label_${l}`, value: src.hero.ctaProjects, group: "HOME" })
    toUpsert.push({ key: `home_hero_cta2_label_${l}`, value: src.hero.ctaGetInvolved, group: "HOME" })
    toUpsert.push({ key: `home_hero_stat1_val_${l}`, value: src.hero.statYears, group: "HOME" })
    toUpsert.push({ key: `home_hero_stat1_lbl_${l}`, value: src.hero.statYearsDesc, group: "HOME" })
    toUpsert.push({ key: `home_hero_stat2_val_${l}`, value: src.hero.statVillages, group: "HOME" })
    toUpsert.push({ key: `home_hero_stat2_lbl_${l}`, value: src.hero.statVillagesDesc, group: "HOME" })
    toUpsert.push({ key: `home_hero_stat3_val_${l}`, value: src.hero.statSolar, group: "HOME" })
    toUpsert.push({ key: `home_hero_stat3_lbl_${l}`, value: src.hero.statSolarDesc, group: "HOME" })

    // ABOUT
    toUpsert.push({ key: `home_about_eyebrow_${l}`, value: src.about.eyebrow, group: "HOME" })
    toUpsert.push({ key: `home_about_title_${l}`, value: src.about.title, group: "HOME" })
    toUpsert.push({ key: `home_about_quote_${l}`, value: src.about.headline, group: "HOME" })
    toUpsert.push({ key: `home_about_p1_${l}`, value: src.about.p1, group: "HOME" })
    toUpsert.push({ key: `home_about_p2_${l}`, value: src.about.p2, group: "HOME" })
    toUpsert.push({ key: `home_about_cta_label_${l}`, value: src.about.moreBtn, group: "HOME" })

    // DOMAINS
    toUpsert.push({ key: `home_domains_tag_${l}`, value: src.domains.tag, group: "HOME" })
    toUpsert.push({ key: `home_domains_title_${l}`, value: src.domains.title, group: "HOME" })
    toUpsert.push({ key: `home_domains_subtitle_${l}`, value: src.domains.subtitle, group: "HOME" })
    toUpsert.push({ key: `home_domains_cta_label_${l}`, value: src.domains.discoverLabel, group: "HOME" })

    // IMPACT
    toUpsert.push({ key: `home_impact_tag_${l}`, value: src.impact.tag, group: "HOME" })
    toUpsert.push({ key: `home_impact_title_${l}`, value: src.impact.title, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat1_val_${l}`, value: src.impact.stat1Val, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat1_lbl_${l}`, value: src.impact.stat1Lbl, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat1_sub_${l}`, value: src.impact.stat1Sub, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat2_val_${l}`, value: src.impact.stat2Val, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat2_lbl_${l}`, value: src.impact.stat2Lbl, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat2_sub_${l}`, value: src.impact.stat2Sub, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat3_val_${l}`, value: src.impact.stat3Val, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat3_lbl_${l}`, value: src.impact.stat3Lbl, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat3_sub_${l}`, value: src.impact.stat3Sub, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat4_val_${l}`, value: src.impact.stat4Val, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat4_lbl_${l}`, value: src.impact.stat4Lbl, group: "HOME" })
    toUpsert.push({ key: `home_impact_stat4_sub_${l}`, value: src.impact.stat4Sub, group: "HOME" })
    toUpsert.push({ key: `home_impact_legal_${l}`, value: src.impact.legalNotice, group: "HOME" })

    // PROJECTS
    toUpsert.push({ key: `home_projects_tag_${l}`, value: src.projects.tag, group: "HOME" })
    toUpsert.push({ key: `home_projects_title_${l}`, value: src.projects.title, group: "HOME" })
    toUpsert.push({ key: `home_projects_cta_label_${l}`, value: src.projects.allProjectsBtn, group: "HOME" })

    // STORY
    toUpsert.push({ key: `home_field_tag_${l}`, value: src.fieldReport.tag, group: "HOME" })
    toUpsert.push({ key: `home_field_quote_${l}`, value: src.fieldReport.quote, group: "HOME" })
    toUpsert.push({ key: `home_field_author_${l}`, value: src.fieldReport.author, group: "HOME" })
    toUpsert.push({ key: `home_field_location_${l}`, value: src.fieldReport.location, group: "HOME" })

    // ENGAGEMENT
    toUpsert.push({ key: `home_engagement_tag_${l}`, value: src.getInvolved.tag, group: "HOME" })
    toUpsert.push({ key: `home_engagement_title_${l}`, value: src.getInvolved.title, group: "HOME" })
    toUpsert.push({ key: `home_engagement_subtitle_${l}`, value: src.getInvolved.subtitle, group: "HOME" })
    
    toUpsert.push({ key: `home_engagement_c1_title_${l}`, value: src.getInvolved.path1Title, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c1_desc_${l}`, value: src.getInvolved.path1Desc, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c1_cta_${l}`, value: src.getInvolved.path1Btn, group: "HOME" })

    toUpsert.push({ key: `home_engagement_c2_title_${l}`, value: src.getInvolved.path2Title, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c2_desc_${l}`, value: src.getInvolved.path2Desc, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c2_cta_${l}`, value: src.getInvolved.path2Btn, group: "HOME" })

    toUpsert.push({ key: `home_engagement_c3_title_${l}`, value: src.getInvolved.path3Title, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c3_desc_${l}`, value: src.getInvolved.path3Desc, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c3_cta_${l}`, value: src.getInvolved.path3Btn, group: "HOME" })

    toUpsert.push({ key: `home_engagement_c4_title_${l}`, value: src.getInvolved.path4Title, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c4_desc_${l}`, value: src.getInvolved.path4Desc, group: "HOME" })
    toUpsert.push({ key: `home_engagement_c4_cta_${l}`, value: src.getInvolved.path4Btn, group: "HOME" })

    // NEWSLETTER
    toUpsert.push({ key: `home_newsletter_eyebrow_${l}`, value: src.newsletter.eyebrow, group: "HOME" })
    toUpsert.push({ key: `home_newsletter_title_${l}`, value: src.newsletter.title, group: "HOME" })
    toUpsert.push({ key: `home_newsletter_desc_${l}`, value: src.newsletter.desc, group: "HOME" })

    // CONTACT
    toUpsert.push({ key: `home_contact_tag_${l}`, value: src.contact.tag, group: "HOME" })
    toUpsert.push({ key: `home_contact_title_${l}`, value: src.contact.title, group: "HOME" })
    toUpsert.push({ key: `home_contact_subtitle_${l}`, value: src.contact.subtitle, group: "HOME" })

    // SEO
    toUpsert.push({ key: `home_meta_title_${l}`, value: "Le numérique au service des territoires ruraux | APTIC-R", group: "HOME" })
    toUpsert.push({ key: `home_meta_description_${l}`, value: src.hero.subtitle, group: "HOME" })
  }

  // Common images
  toUpsert.push({ key: `home_hero_image`, value: "/images/home/hero-aptic.jpg", group: "HOME" })
  toUpsert.push({ key: `home_field_image`, value: "/images/home/field-report.jpg", group: "HOME" })

  console.log(`Seeding ${toUpsert.length} HOME CMS keys...`)

  for (const item of toUpsert) {
    await prisma.parametreSite.upsert({
      where: { key: item.key },
      update: {
        group: item.group,
        description: item.description,
      },
      create: {
        key: item.key,
        value: item.value,
        group: item.group,
        description: item.description,
      },
    })
  }

  console.log("Done seeding HOME CMS.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
