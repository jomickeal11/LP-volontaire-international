/**
 * Données initiales et officielles pour la page Soutien & Mécénat (Support)
 * Permet de pré-remplir la base de données afin que le Back-office et le site
 * soient 100% synchronisés sans aucun fallback en dur.
 */

export const INITIAL_SUPPORT_SETTINGS: Record<string, string> = {
  // ── 01. HERO ──
  support_hero_badge_fr: "SOUTENIR APTIC-R",
  support_hero_title_fr: "Soutenez nos actions pour le développement rural",
  support_hero_desc_fr: "Mettre les compétences, le numérique et les technologies appropriées au service de l'autonomie durable des communautés rurales au Togo.",
  support_hero_cta_fr: "Nous contacter",
  support_hero_image: "https://images.unsplash.com/photo-1609252509229-364936a1d1a2?w=1000&h=750&fit=crop&auto=format",

  support_hero_badge_en: "SUPPORT APTIC-R",
  support_hero_title_en: "Support Our Actions for Rural Development",
  support_hero_desc_en: "Empowering rural communities in Togo through digital technology, shared skills, and appropriate low-tech solutions.",
  support_hero_cta_en: "Contact Us",

  support_hero_badge_de: "APTIC-R UNTERSTÜTZEN",
  support_hero_title_de: "Unterstützen Sie unsere Arbeit für den ländlichen Raum",
  support_hero_desc_de: "Digitale Kompetenzen, Technologien und Innovation für eine nachhaltige Selbstbestimmung ländlicher Gemeinschaften in Togo.",
  support_hero_cta_de: "Kontakt aufnehmen",

  // ── 02. AXES (4 FAÇONS D'ACCOMPAGNER) ──
  support_axes_count: "4",
  support_axes_tag_fr: "COMMENT SOUTENIR NOS ACTIONS ?",
  support_axes_title_fr: "Quatre façons d'accompagner nos projets",
  support_axes_subtitle_fr: "Chaque contribution (financière, matérielle, méthodologique ou institutionnelle) renforce directement l'impact de nos actions sur le terrain.",

  support_axes_tag_en: "HOW TO SUPPORT OUR INITIATIVES?",
  support_axes_title_en: "Four ways to stand alongside our mission",
  support_axes_subtitle_en: "Every contribution (financial, hardware, expertise, or institutional partnership) directly strengthens grassroots impact.",

  support_axes_tag_de: "WIE KÖNNEN SIE UNS UNTERSTÜTZEN?",
  support_axes_title_de: "Vier Wege, unsere Vorhaben zu begleiten",
  support_axes_subtitle_de: "Jeder Beitrag (finanziell, materiell, fachlich oder institutionell) stärkt direkt unsere Wirkung vor Ort.",

  // Axe 1
  support_axes_1_title_fr: "FINANCEMENT DE PROJETS",
  support_axes_1_desc_fr: "Soutenir directement l'équipement de centres numériques ruraux, le déploiement de kits solaires pour écoles hors-réseau ou des bourses de formation pour les jeunes et les femmes.",
  support_axes_1_link_fr: "Échanger avec l'équipe",

  support_axes_1_title_en: "PROJECT FUNDING",
  support_axes_1_desc_en: "Directly fund equipment for rural multimedia hubs, autonomous solar kits for off-grid schools, or training grants for youth and women.",
  support_axes_1_link_en: "Discuss with the team",

  support_axes_1_title_de: "PROJEKTFINANZIERUNG",
  support_axes_1_desc_de: "Fördern Sie direkt die Ausstattung ländlicher Computerräume, Solaranlagen für Dorfschulen oder Ausbildungsstipendien für junge Menschen.",
  support_axes_1_link_de: "Mit dem Team sprechen",

  // Axe 2
  support_axes_2_title_fr: "DON DE MATÉRIEL",
  support_axes_2_desc_fr: "Fournir des équipements informatiques fonctionnels ou reconditionnés (ordinateurs portables, serveurs locaux, routeurs) et du matériel photovoltaïque pour nos FabLabs et salles communautaires.",
  support_axes_2_link_fr: "Proposer un don",

  support_axes_2_title_en: "HARDWARE DONATIONS",
  support_axes_2_desc_en: "Donate functional or refurbished IT hardware (laptops, micro-servers, routers) and solar components for our community FabLabs.",
  support_axes_2_link_en: "Propose a donation",

  support_axes_2_title_de: "SACHSPENDEN",
  support_axes_2_desc_de: "Spenden Sie funktionierende oder aufbereitete IT-Geräte (Laptops, lokale Server, Router) und Photovoltaik-Komponenten für unsere FabLabs.",
  support_axes_2_link_de: "Sachspende vorschlagen",

  // Axe 3
  support_axes_3_title_fr: "MÉCÉNAT DE COMPÉTENCES",
  support_axes_3_desc_fr: "Mettre votre expertise technique, pédagogique ou organisationnelle à disposition de l'équipe locale : développement low-tech, cybersécurité, formation ou encadrement de projets.",
  support_axes_3_link_fr: "Partager vos compétences",

  support_axes_3_title_en: "PRO BONO & SKILLS SPONSORSHIP",
  support_axes_3_desc_en: "Share your technical, pedagogical, or organizational skills with our local team: low-tech engineering, cybersecurity, or project coaching.",
  support_axes_3_link_en: "Share your skills",

  support_axes_3_title_de: "KOMPETENZSPENDE",
  support_axes_3_desc_de: "Bringen Sie Ihr technisches oder pädagogisches Fachwissen ein: Low-Tech-Lösungen, Cybersicherheit, Schulungen oder Projektbegleitung.",
  support_axes_3_link_de: "Kompetenzen teilen",

  // Axe 4
  support_axes_4_title_fr: "PARTENARIATS & SPONSORING",
  support_axes_4_desc_fr: "Entreprises, fondations et institutions : co-construisez avec l'APTIC-R des programmes pluriannuels d'inclusion et d'émancipation rurale alignés sur vos engagements de responsabilité sociétale.",
  support_axes_4_link_fr: "Devenir organisation partenaire",

  support_axes_4_title_en: "PARTNERSHIPS & SPONSORSHIP",
  support_axes_4_desc_en: "Companies, foundations, and institutions: co-design multi-year rural digital inclusion programs aligned with your CSR goals.",
  support_axes_4_link_en: "Become a partner organization",

  support_axes_4_title_de: "PARTNERSCHAFTEN & SPONSORING",
  support_axes_4_desc_de: "Unternehmen und Stiftungen: Entwickeln Sie gemeinsam mit APTIC-R nachhaltige Förderprogramme im Rahmen Ihrer CSR-Strategie.",
  support_axes_4_link_de: "Partnerorganisation werden",

  // ── 03. WHY ──
  support_why_tag_fr: "POURQUOI VOTRE SOUTIEN COMPTE ?",
  support_why_title_fr: "Un impact direct et mesurable au cœur des territoires",
  support_why_desc_fr: "À Agbélouvé et dans les communautés rurales environnantes, chaque ressource mobilisée répond à un besoin prioritaire identifié avec les habitants : électrification solaire de salles de classe, accès à des ressources pédagogiques libres et formation pratique aux métiers de demain.",

  support_why_tag_en: "WHY YOUR SUPPORT MATTERS",
  support_why_title_en: "Direct and measurable impact in rural areas",
  support_why_desc_en: "In Agbélouvé and surrounding villages, every mobilized resource directly addresses prioritized community needs: solar electrification for classrooms, access to open educational content, and practical vocational training.",

  support_why_tag_de: "WARUM IHRE UNTERSTÜTZUNG ZÄHLT",
  support_why_title_de: "Direkte und messbare Wirkung im ländlichen Raum",
  support_why_desc_de: "In Agbélouvé und umliegenden Dörfern fließt jede Ressource gezielt in priorisierte Bedarfe: Solarenergie für Schulen, freie Bildungsinhalte und praxisnahe Berufsbildung.",

  support_why_1_title_fr: "Des projets ancrés dans le réel",
  support_why_1_desc_fr: "Toutes nos initiatives partent des besoins formulés par les acteurs locaux et sont co-construites pour durer.",
  support_why_1_title_en: "Locally anchored initiatives",
  support_why_1_desc_en: "All our projects originate from real community needs and are designed for long-term sustainability.",
  support_why_1_title_de: "Vor Ort verankerte Vorhaben",
  support_why_1_desc_de: "Alle Initiativen entstehen aus konkreten Bedürfnissen der Bevölkerung und sind auf Dauerhaftigkeit angelegt.",

  support_why_2_title_fr: "Un transfert durable de compétences",
  support_why_2_desc_fr: "Nous formons les jeunes et les femmes à maintenir, adapter et faire évoluer eux-mêmes les installations.",
  support_why_2_title_en: "Lasting skill transfers",
  support_why_2_desc_en: "We train local youth and women to maintain, adapt, and upgrade all installations independently.",
  support_why_2_title_de: "Nachhaltiger Wissenstransfer",
  support_why_2_desc_de: "Wir qualifizieren junge Menschen und Frauen, damit sie Einrichtungen selbstständig betreiben und weiterentwickeln.",

  support_why_3_title_fr: "Une gestion rigoureuse et concertée",
  support_why_3_desc_fr: "Chaque ressource est allouée avec discernement sous la supervision du Bureau Exécutif et des référents de projet.",
  support_why_3_title_en: "Rigorous and transparent management",
  support_why_3_desc_en: "Every resource is purposefully allocated under the supervision of the Executive Board and project coordinators.",
  support_why_3_title_de: "Verlässliche und abgestimmte Führung",
  support_why_3_desc_de: "Mittel werden sorgfältig eingesetzt unter der Aufsicht des Vorstands und der Projektkoordinatoren.",

  // ── 04. TRANSPARENCY ──
  support_transparency_tag_fr: "TRANSPARENCE & REDEVABILITÉ",
  support_transparency_title_fr: "Une gestion claire et responsable",
  support_transparency_desc_fr: "L'APTIC-R est une association officiellement reconnue au Togo (Récépissé N° 0586/MATDCL-DAPL-DOCA). Chaque contribution fait l'objet d'une information claire sur son affectation, selon les modalités définies en accord avec l'association.",
  support_transparency_receipt_fr: "Une attestation ou un reçu officiel de don est systématiquement délivré pour chaque contribution financière ou matérielle.",

  support_transparency_tag_en: "TRANSPARENCY & ACCOUNTABILITY",
  support_transparency_title_en: "Clear and responsible stewardship",
  support_transparency_desc_en: "APTIC-R is an officially registered non-profit organization in Togo (Reg. No. 0586/MATDCL-DAPL-DOCA). Every contribution is subject to clear reporting on its allocation, in line with associative guidelines.",
  support_transparency_receipt_en: "An official donation receipt or certificate is systematically provided for every financial or in-kind contribution.",

  support_transparency_tag_de: "TRANSPARENZ & RECHENSCHAFT",
  support_transparency_title_de: "Verlässliche und transparente Mittelverwendung",
  support_transparency_desc_de: "APTIC-R ist eine in Togo staatlich anerkannte Organisation (Registrierungs-Nr. 0586/MATDCL-DAPL-DOCA). Über jede Unterstützung wird transparent Bericht erstattet.",
  support_transparency_receipt_de: "Für jede finanzielle oder materielle Zuwendung wird eine offizielle Spendenbestätigung ausgestellt.",

  // ── 05. FUTURE ──
  support_future_tag_fr: "ÉVOLUTION FUTURE",
  support_future_title_fr: "Paiements et dons en ligne",
  support_future_desc_fr: "Une solution de don en ligne sécurisée pourra être intégrée ultérieurement, après validation officielle des modalités et des partenaires financiers par l'APTIC-R.",

  support_future_tag_en: "FUTURE EVOLUTION",
  support_future_title_en: "Online payments and donations",
  support_future_desc_en: "A secure online donation solution may be integrated at a later stage, following formal validation of terms and payment gateways by APTIC-R leadership.",

  support_future_tag_de: "ZUKÜNFTIGE ENTWICKLUNG",
  support_future_title_de: "Online-Spenden und Zahlungswege",
  support_future_desc_de: "Eine gesicherte Online-Spendenlösung kann zu einem späteren Zeitpunkt integriert werden, sobald Richtlinien und Partner freigegeben sind.",

  // ── 06. CTA ──
  support_cta_title_fr: "Vous souhaitez soutenir un projet spécifique ?",
  support_cta_desc_fr: "Notre équipe de coordination est à votre entière disposition pour vous présenter les besoins prioritaires sur le terrain et définir ensemble les modalités de votre soutien.",
  support_cta_btn_contact_fr: "Nous contacter",
  support_cta_btn_whatsapp_fr: "Échanger sur WhatsApp",

  support_cta_title_en: "Would you like to support a specific project?",
  support_cta_desc_en: "Our coordination team is at your disposal to share current field priorities and structure your involvement.",
  support_cta_btn_contact_en: "Contact Us",
  support_cta_btn_whatsapp_en: "Chat on WhatsApp",

  support_cta_title_de: "Möchten Sie ein bestimmtes Vorhaben unterstützen?",
  support_cta_desc_de: "Unser Koordinationsteam informiert Sie gerne über aktuelle Prioritäten vor Ort und bespricht Möglichkeiten der Zusammenarbeit.",
  support_cta_btn_contact_de: "Kontakt aufnehmen",
  support_cta_btn_whatsapp_de: "Auf WhatsApp austauschen",
}
