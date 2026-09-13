import type { Language } from "@/types"

export type LegalDocType = "privacy" | "terms" | "cookies"

export const LEGAL_SLUGS: Record<LegalDocType, Record<string, string>> = {
  privacy: {
    fr: "politique-de-confidentialite",
    en: "privacy-policy",
    de: "datenschutzerklaerung",
  },
  terms: {
    fr: "conditions-utilisation",
    en: "terms-of-use",
    de: "nutzungsbedingungen",
  },
  cookies: {
    fr: "politique-cookies",
    en: "cookie-policy",
    de: "cookie-richtlinie",
  },
}

export function getDocTypeFromSlug(slug: string): LegalDocType | null {
  for (const [docType, slugs] of Object.entries(LEGAL_SLUGS)) {
    if (Object.values(slugs).includes(slug.toLowerCase())) {
      return docType as LegalDocType
    }
  }
  return null
}

export function getCanonicalLegalPath(docType: LegalDocType, lang: string): string {
  const safeLang = ["fr", "en", "de"].includes(lang.toLowerCase()) ? lang.toLowerCase() : "fr"
  const slug = LEGAL_SLUGS[docType][safeLang]
  return `/${safeLang}/${slug}`
}

export interface LegalSection {
  title: string
  content: string[]
}

export interface LegalDocument {
  docType: LegalDocType
  tag: string
  title: string
  lastUpdated: string
  disclaimer: string
  intro: string
  sections: LegalSection[]
  contactBox: {
    title: string
    desc: string
    email: string
    address: string
  }
}

export const LEGAL_DOCS: Record<LegalDocType, Record<"FR" | "EN" | "DE", LegalDocument>> = {
  privacy: {
    FR: {
      docType: "privacy",
      tag: "Protection des Données",
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : 13 septembre 2026",
      disclaimer: "Document d'information sur la gouvernance des données du programme APTIC-R. Cadre type de transparence soumis à validation formelle ultérieure par l'association.",
      intro: "L'Association pour la Promotion des TIC en milieu Rural (APTIC-R), basée à Agbélouvé (Togo), accorde une importance primordiale au respect de la vie privée et à la protection des données personnelles des candidats au volontariat international, des partenaires associatifs et des visiteurs de sa plateforme.",
      sections: [
        {
          title: "1. Responsable du traitement des données",
          content: [
            "Le traitement des données personnelles collectées via le présent portail est placé sous la responsabilité d'APTIC-R, organisation à but non lucratif enregistrée au Togo.",
            "Siège opérationnel : Agbélouvé, Région Maritime, République Togolaise.",
            "Contact dédié à la protection des données : aptic.rural19@gmail.com.",
          ],
        },
        {
          title: "2. Données personnelles collectées",
          content: [
            "Dans le cadre des candidatures de volontaires et demandes de partenariats, APTIC-R peut être amenée à recueillir les catégories de données suivantes :",
            "• Identité et état civil : nom, prénom, date de naissance, nationalité, pays de résidence.",
            "• Coordonnées : adresse email, numéro de téléphone (WhatsApp / appel), adresse postale.",
            "• Profil académique et professionnel : niveau d'études, domaine d'expertise, langues parlées, curriculum vitae (CV), lettre de motivation.",
            "• Projet d'engagement : motivations, disponibilités, préférences de mission et compétences techniques déclarées.",
            "• Demandes partenaires : nom de l'organisation, pays, type de partenariat recherché, message de contact.",
            "• Données techniques : adresse IP anonymisée, logs de connexion et préférences de navigation (langue sélectionnée).",
          ],
        },
        {
          title: "3. Finalités et bases légales du traitement",
          content: [
            "Les informations collectées sont exclusivement destinées à :",
            "• L'instruction, l'évaluation et le suivi des candidatures au volontariat international.",
            "• L'organisation logistique de l'accueil des volontaires à Agbélouvé (logement, mentorat, missions sur le terrain).",
            "• La gestion des échanges avec les organisations partenaires et institutions éducatives.",
            "• L'amélioration continue de l'ergonomie et de la sécurité de notre plateforme web.",
            "Le traitement repose sur votre consentement explicite lors de la soumission du formulaire et sur l'intérêt légitime d'APTIC-R à organiser ses missions d'intérêt général.",
          ],
        },
        {
          title: "4. Durée de conservation des données",
          content: [
            "Les dossiers de candidature sont conservés pendant le temps nécessaire à leur évaluation et à la préparation de la mission.",
            "En cas de non-sélection, sauf demande expresse de suppression de votre part, les dossiers peuvent être archivés pour une durée maximale de 24 mois afin de vous proposer d'éventuelles missions ultérieures.",
            "Les données relatives aux volontaires ayant réalisé une mission sont archivées à des fins d'attestation de mission et de mémoire associative.",
          ],
        },
        {
          title: "5. Destinataires et absence de commercialisation",
          content: [
            "Les données personnelles ne sont JAMAIS vendues, louées, cédées ni partagées à des fins publicitaires ou commerciales.",
            "Seuls ont accès à vos données : l'équipe de coordination d'APTIC-R à Agbélouvé, les encadrants de mission concernés, et nos prestataires techniques d'hébergement sous engagement strict de confidentialité.",
          ],
        },
        {
          title: "6. Vos droits sur vos données",
          content: [
            "Conformément aux standards de protection des données personnelles, vous disposez des droits suivants :",
            "• Droit d'accès : obtenir la confirmation que vos données sont traitées et en recevoir une copie.",
            "• Droit de rectification : demander la correction d'informations inexactes ou incomplètes.",
            "• Droit à l'effacement : solliciter la suppression définitive de votre dossier de candidature.",
            "• Droit d'opposition et de retrait du consentement : retirer votre consentement à tout moment.",
            "Pour exercer ces droits, il vous suffit d'adresser un courriel à aptic.rural19@gmail.com en précisant l'objet de votre demande.",
          ],
        },
        {
          title: "7. Sécurité des informations",
          content: [
            "APTIC-R met en œuvre des mesures techniques et organisationnelles appropriées (chiffrement des transferts via HTTPS/TLS, contrôle des accès administratifs) pour protéger vos données contre toute destruction, perte ou altération accidentelle ou illicite.",
          ],
        },
      ],
      contactBox: {
        title: "Une question sur vos données ?",
        desc: "Notre équipe de coordination est à votre écoute pour toute demande d'accès ou de rectification.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Région Maritime, Togo",
      },
    },
    EN: {
      docType: "privacy",
      tag: "Data Protection",
      title: "Privacy Policy",
      lastUpdated: "Last updated: September 13, 2026",
      disclaimer: "Informational document regarding data governance for the APTIC-R international volunteer program. Standard transparency framework subject to final legal validation by the association.",
      intro: "The Association for the Promotion of ICT in Rural Areas (APTIC-R), based in Agbélouvé (Togo), places the utmost importance on privacy and data protection for international volunteer applicants, partner organizations, and visitors to our platform.",
      sections: [
        {
          title: "1. Data Controller",
          content: [
            "The processing of personal data collected through this portal is the responsibility of APTIC-R, a non-profit organization registered in Togo.",
            "Operational headquarters: Agbélouvé, Maritime Region, Republic of Togo.",
            "Dedicated privacy contact: aptic.rural19@gmail.com.",
          ],
        },
        {
          title: "2. Personal Data Collected",
          content: [
            "As part of volunteer applications and partnership inquiries, APTIC-R may collect the following categories of information:",
            "• Identity details: full name, date of birth, nationality, country of residence.",
            "• Contact information: email address, phone number (WhatsApp / call), physical address.",
            "• Academic and professional background: educational level, field of study, spoken languages, resume (CV), motivation letter.",
            "• Volunteering objectives: motivations, availability dates, preferred tracks, and self-declared skills.",
            "• Partner inquiries: organization name, country, partnership scope, and inquiry message.",
            "• Technical data: anonymized IP addresses, access logs, and language preferences.",
          ],
        },
        {
          title: "3. Purposes and Legal Basis for Processing",
          content: [
            "Collected information is exclusively utilized to:",
            "• Review, evaluate, and process international volunteer applications.",
            "• Coordinate on-site logistics for volunteer arrivals in Agbélouvé (housing, mentoring, rural field assignments).",
            "• Maintain communication with academic and institutional partners.",
            "• Ensure platform stability, security, and responsive performance.",
            "Processing is founded upon your explicit consent when submitting forms and APTIC-R's legitimate mission to coordinate community development initiatives.",
          ],
        },
        {
          title: "4. Data Retention Period",
          content: [
            "Application materials are retained for the duration required to evaluate qualifications and prepare missions.",
            "Unselected applications may be retained for up to 24 months to offer future opportunities, unless deletion is requested earlier.",
            "Records of completed volunteer missions are preserved for administrative certification and institutional memory.",
          ],
        },
        {
          title: "5. Data Recipients & Non-Commercialization",
          content: [
            "Personal data is NEVER sold, rented, leased, or monetized for advertising purposes.",
            "Only authorized members of the APTIC-R coordination team in Agbélouvé and secure technical hosting providers have access to your data under strict confidentiality obligations.",
          ],
        },
        {
          title: "6. Your Rights",
          content: [
            "In alignment with international privacy principles, you hold the following rights:",
            "• Right of access: obtain confirmation and a copy of your personal data.",
            "• Right to rectification: update or correct incomplete or inaccurate data.",
            "• Right to erasure: request the deletion of your application file.",
            "• Right to withdraw consent: revoke prior consent at any time.",
            "To exercise any of these rights, please email aptic.rural19@gmail.com with your request.",
          ],
        },
        {
          title: "7. Security Measures",
          content: [
            "APTIC-R applies reasonable technical and operational safeguards (HTTPS/TLS encryption, restricted administrative access) to prevent accidental loss, unauthorized disclosure, or data alteration.",
          ],
        },
      ],
      contactBox: {
        title: "Questions about your data?",
        desc: "Our coordination team is available to assist you with any data inquiries or removal requests.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Maritime Region, Togo",
      },
    },
    DE: {
      docType: "privacy",
      tag: "Datenschutz",
      title: "Datenschutzerklärung",
      lastUpdated: "Zuletzt aktualisiert: 13. September 2026",
      disclaimer: "Informationsdokument zur Datenverwaltung des internationalen Freiwilligenprogramms von APTIC-R. Transparenzrahmen vorbehaltlich der formalen rechtlichen Bestätigung durch den Verein.",
      intro: "Der Verein zur Förderung von IKT im ländlichen Raum (APTIC-R) mit Sitz in Agbélouvé (Togo) legt größten Wert auf den Schutz der Privatsphäre und personenbezogener Daten von internationalen Freiwilligen, Partnerorganisationen und Webseitenbesuchern.",
      sections: [
        {
          title: "1. Verantwortliche Stelle",
          content: [
            "Verantwortlich für die Datenverarbeitung auf dieser Plattform ist APTIC-R, eine in Togo registrierte gemeinnützige Organisation.",
            "Hauptsitz: Agbélouvé, Region Maritime, Republik Togo.",
            "Kontakt für Datenschutzfragen: aptic.rural19@gmail.com.",
          ],
        },
        {
          title: "2. Erfasste personenbezogene Daten",
          content: [
            "Im Rahmen von Freiwilligenbewerbungen und Partnerschaftsanfragen können folgende Daten erhoben werden:",
            "• Personenangaben: Vor- und Nachname, Geburtsdatum, Nationalität, Wohnsitzland.",
            "• Kontaktdaten: E-Mail-Adresse, Telefonnummer (WhatsApp/Anruf), Anschrift.",
            "• Werdegang & Qualifikation: Bildungsabschluss, Fachbereich, Sprachkenntnisse, Lebenslauf (CV), Motivationsschreiben.",
            "• Einsatzdaten: Motivation, Verfügbarkeit, bevorzugte Einsatzbereiche und angegebene Kompetenzen.",
            "• Partnerangaben: Name der Organisation, Land, Anliegen der Partnerschaft.",
            "• Technische Daten: anonymisierte IP-Adressen, Verbindungsprotokolle und Sprachauswahl.",
          ],
        },
        {
          title: "3. Zwecke der Datenverarbeitung",
          content: [
            "Die Daten werden ausschließlich verwendet für:",
            "• Die Prüfung und Begleitung von Bewerbungen für den internationalen Freiwilligendienst.",
            "• Die organisatorische Vorbereitung des Aufenthalts in Agbélouvé (Unterkunft, Betreuung, Projekteinsatz).",
            "• Den Austausch mit Kooperationspartnern und Bildungseinrichtungen.",
            "• Die Gewährleistung der technischen Sicherheit und Funktionalität des Portals.",
            "Rechtsgrundlage ist Ihre ausdrückliche Einwilligung bei Absenden des Formulars sowie das berechtigte Interesse von APTIC-R an der Organisation gemeinnütziger Projekte.",
          ],
        },
        {
          title: "4. Speicherdauer",
          content: [
            "Bewerbungsdaten werden für die Dauer des Auswahlverfahrens und der Einsatzvorbereitung gespeichert.",
            "Nicht berücksichtigte Bewerbungen werden maximal 24 Monate archiviert, um künftige Möglichkeiten anzubieten, sofern keine frühere Löschung verlangt wird.",
            "Nachweise abgeschlossener Einsätze werden für administrative Bestätigungen archiviert.",
          ],
        },
        {
          title: "5. Weitergabe und Ausschluss kommerzieller Nutzung",
          content: [
            "Personenbezogene Daten werden unter keinen Umständen verkauft, vermietet oder zu Werbezwecken weitergegeben.",
            "Zugang haben ausschließlich befugte Mitglieder des APTIC-R Koordinationsteams in Agbélouvé sowie technische Dienstleister unter strikter Geheimhaltungsvereinbarung.",
          ],
        },
        {
          title: "6. Ihre Rechte",
          content: [
            "Sie haben das Recht auf Auskunft über Ihre gespeicherten Daten, Berichtigung unrichtiger Angaben, Löschung Ihrer Bewerbungsunterlagen sowie Widerruf Ihrer Einwilligung.",
            "Wenden Sie sich zur Ausübung Ihrer Rechte per E-Mail an aptic.rural19@gmail.com.",
          ],
        },
        {
          title: "7. Datensicherheit",
          content: [
            "APTIC-R setzt angemessene technische und organisatorische Schutzmaßnahmen (HTTPS-Verschlüsselung, Zugriffskontrollen) ein, um Ihre Daten vor Verlust oder unbefugtem Zugriff zu schützen.",
          ],
        },
      ],
      contactBox: {
        title: "Fragen zum Datenschutz?",
        desc: "Unser Team in Agbélouvé steht Ihnen für Auskünfte oder Löschanträge gerne zur Verfügung.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Region Maritime, Togo",
      },
    },
  },
  terms: {
    FR: {
      docType: "terms",
      tag: "Cadre Général",
      title: "Conditions d'Utilisation",
      lastUpdated: "Dernière mise à jour : 13 septembre 2026",
      disclaimer: "Document d'information définissant les modalités d'accès et d'utilisation du portail APTIC-R. Cadre type soumis à validation juridique formelle ultérieure par l'association.",
      intro: "Bienvenue sur le portail officiel du programme de Volontariat International de l'association APTIC-R. L'accès et l'utilisation de ce site sont régis par les présentes conditions générales d'utilisation.",
      sections: [
        {
          title: "1. Objet du portail",
          content: [
            "Le présent site a pour vocation de présenter les activités associatives d'APTIC-R à Agbélouvé (Togo), de diffuser les informations relatives au programme de volontariat international et de permettre aux candidats et partenaires de transmettre leurs dossiers et demandes.",
          ],
        },
        {
          title: "2. Accès et gratuité du service",
          content: [
            "L'accès aux informations du portail et la soumission d'une candidature de volontariat sont entièrement gratuits.",
            "APTIC-R ne facture aucun frais de dossier ni droit d'inscription pour l'étude préalable des candidatures.",
          ],
        },
        {
          title: "3. Engagements du candidat et de l'utilisateur",
          content: [
            "En utilisant notre plateforme et en transmettant un dossier de candidature, vous vous engagez à :",
            "• Fournir des informations exactes, sincères et à jour sur votre identité, vos compétences et votre parcours.",
            "• Ne pas usurper l'identité d'un tiers ni soumettre des documents frauduleux.",
            "• Respecter les valeurs de respect mutuel, d'entraide communautaire et de solidarité portées par APTIC-R.",
            "• Ne pas perturber le bon fonctionnement technique du portail.",
          ],
        },
        {
          title: "4. Propriété intellectuelle et contenus",
          content: [
            "L'ensemble des contenus figurant sur ce portail (textes, photographies du terrain, illustrations, logos, charte graphique) sont la propriété exclusive d'APTIC-R ou font l'objet d'une autorisation d'utilisation.",
            "Toute reproduction ou diffusion non autorisée de ces éléments à des fins commerciales est interdite.",
          ],
        },
        {
          title: "5. Nature du volontariat international",
          content: [
            "La soumission d'une candidature sur ce site ne constitue en aucun cas un contrat de travail salarié ni une promesse d'embauche.",
            "Le volontariat international avec APTIC-R s'inscrit dans un cadre d'engagement solidaire, bénévole et formateur, régi par une convention d'engagement spécifique conclue avant tout départ sur le terrain.",
          ],
        },
        {
          title: "6. Disponibilité et limitation de responsabilité",
          content: [
            "APTIC-R s'efforce de maintenir le portail accessible en continu, mais ne saurait être tenue responsable des interruptions temporaires liées à des maintenances techniques ou aléas de télécommunication.",
            "Les informations fournies sur la vie locale et les missions sont données à titre indicatif et peuvent évoluer selon les besoins réels des communautés agricoles d'Agbélouvé.",
          ],
        },
        {
          title: "7. Droit applicable et contact",
          content: [
            "Les présentes conditions sont régies par les règles de droit togolais applicables aux organisations associatives.",
            "Pour toute question relative à l'utilisation du site, vous pouvez contacter l'équipe : aptic.rural19@gmail.com.",
          ],
        },
      ],
      contactBox: {
        title: "Besoin d'un renseignement ?",
        desc: "Notre équipe associative répond à toutes vos interrogations relatives au fonctionnement du programme.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Région Maritime, Togo",
      },
    },
    EN: {
      docType: "terms",
      tag: "General Terms",
      title: "Terms of Use",
      lastUpdated: "Last updated: September 13, 2026",
      disclaimer: "Informational document establishing operational terms for accessing the APTIC-R portal. Standard framework subject to formal legal ratification by the association.",
      intro: "Welcome to the official International Volunteer Portal of APTIC-R. Access to and use of this website are governed by these Terms of Use.",
      sections: [
        {
          title: "1. Purpose of the Platform",
          content: [
            "This website is designed to introduce APTIC-R's non-profit initiatives in Agbélouvé (Togo), provide clear details regarding our international volunteering missions, and enable candidates and partners to submit applications and inquiries.",
          ],
        },
        {
          title: "2. Free Access to Services",
          content: [
            "Access to website content and submission of volunteer applications are completely free of charge.",
            "APTIC-R never charges application fees or registration costs for reviewing candidate submissions.",
          ],
        },
        {
          title: "3. User and Candidate Responsibilities",
          content: [
            "By utilizing this platform and submitting an application, you agree to:",
            "• Provide accurate, truthful, and updated details concerning your identity, qualifications, and background.",
            "• Refrain from impersonating third parties or providing fraudulent credentials.",
            "• Uphold community respect, cultural openness, and solidarity principles championed by APTIC-R.",
            "• Not attempt to interfere with the technical integrity or security of the site.",
          ],
        },
        {
          title: "4. Intellectual Property",
          content: [
            "All materials published on this portal (texts, field photography, graphics, brand identifiers, logo) are the property of APTIC-R or used with permission.",
            "Any unauthorized reproduction or commercial exploitation is strictly prohibited.",
          ],
        },
        {
          title: "5. Nature of International Volunteering",
          content: [
            "Submitting an application via this portal does not constitute an employment contract or an offer of paid employment.",
            "International volunteering with APTIC-R is a solidarity engagement governed by an official volunteer agreement formalized prior to mission commencement.",
          ],
        },
        {
          title: "6. Platform Availability & Liability",
          content: [
            "While APTIC-R strives for uninterrupted availability, we cannot be held liable for temporary technical outages or network disruptions.",
            "Program descriptions and local conditions are provided for informational purposes and may adapt to evolving community priorities in Agbélouvé.",
          ],
        },
        {
          title: "7. Applicable Law and Inquiries",
          content: [
            "These Terms of Use are interpreted under the laws governing non-profit associations in the Republic of Togo.",
            "For questions regarding platform use, contact: aptic.rural19@gmail.com.",
          ],
        },
      ],
      contactBox: {
        title: "Need clarification?",
        desc: "Our team is here to assist with any questions regarding program participation and platform terms.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Maritime Region, Togo",
      },
    },
    DE: {
      docType: "terms",
      tag: "Nutzungsbedingungen",
      title: "Nutzungsbedingungen",
      lastUpdated: "Zuletzt aktualisiert: 13. September 2026",
      disclaimer: "Informationsdokument über die Bedingungen für die Nutzung der APTIC-R Plattform. Vorbehaltlich der formalen rechtlichen Bestätigung durch den Verein.",
      intro: "Willkommen auf dem offiziellen Portal für internationale Freiwilligendienste von APTIC-R. Der Zugriff und die Nutzung dieser Webseite unterliegen den folgenden Nutzungsbedingungen.",
      sections: [
        {
          title: "1. Zweck der Plattform",
          content: [
            "Diese Webseite dient der Information über die gemeinnützige Arbeit von APTIC-R in Agbélouvé (Togo) sowie der Entgegennahme von Bewerbungen für Freiwilligeneinsätze und Partnerschaften.",
          ],
        },
        {
          title: "2. Kostenfreie Nutzung",
          content: [
            "Die Bereitstellung der Informationen und die Einreichung von Bewerbungen sind vollständig kostenfrei.",
            "APTIC-R erhebt keinerlei Gebühren für die Sichtung oder Bearbeitung von Bewerbungsunterlagen.",
          ],
        },
        {
          title: "3. Pflichten der Nutzer und Bewerber",
          content: [
            "Mit der Nutzung des Portals verpflichten Sie sich zu:",
            "• Wahrheitsgemäßen und vollständigen Angaben zu Ihrer Person, Ihren Qualifikationen und Ihrer Motivation.",
            "• Unterlassung von Identitätstäuschungen oder missbräuchlichen Dateneingaben.",
            "• Respektvollem Umgang im Sinne der gemeinnützigen Werte und der Solidarität von APTIC-R.",
            "• Verzicht auf Handlungen, die den Betrieb der Plattform beeinträchtigen könnten.",
          ],
        },
        {
          title: "4. Urheberrechte und geistiges Eigentum",
          content: [
            "Alle auf dieser Website veröffentlichten Inhalte (Texte, Bildmaterial, Logos und Design) sind urheberrechtlich geschützt und Eigentum von APTIC-R oder entsprechend lizenziert.",
          ],
        },
        {
          title: "5. Charakter des Freiwilligendienstes",
          content: [
            "Eine Bewerbung über diese Plattform begründet kein Arbeitsverhältnis und keinen Anspruch auf ein Angestelltengehalt.",
            "Der Freiwilligendienst bei APTIC-R ist ein zivilgesellschaftliches Engagement, das durch eine gesonderte Vereinbarung vor Beginn des Einsatzes geregelt wird.",
          ],
        },
        {
          title: "6. Verfügbarkeit und Haftung",
          content: [
            "APTIC-R bemüht sich um eine ständige Erreichbarkeit der Website, übernimmt jedoch keine Gewährleistung für unterbrechungsfreie Verfügbarkeit.",
            "Die Angaben zu Einsatzbereichen und Rahmenbedingungen basieren auf den Gegebenheiten vor Ort und können sich den Bedürfnissen der Dorfgemeinschaften anpassen.",
          ],
        },
        {
          title: "7. Anwendbares Recht & Kontakt",
          content: [
            "Es gilt das für gemeinnützige Vereine maßgebliche Recht der Republik Togo.",
            "Bei Fragen zur Nutzung der Webseite wenden Sie sich an: aptic.rural19@gmail.com.",
          ],
        },
      ],
      contactBox: {
        title: "Haben Sie Fragen?",
        desc: "Unser Team beantwortet gerne Ihre Anliegen rund um das Freiwilligenprogramm.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Region Maritime, Togo",
      },
    },
  },
  cookies: {
    FR: {
      docType: "cookies",
      tag: "Transparence & Traceurs",
      title: "Politique de Cookies",
      lastUpdated: "Dernière mise à jour : 13 septembre 2026",
      disclaimer: "Document d'information sur les traceurs et technologies de mesure utilisés sur le portail APTIC-R. Cadre type de transparence soumis à validation formelle ultérieure par l'association.",
      intro: "Cette politique a pour but d'informer clairement les visiteurs sur la manière dont APTIC-R utilise les cookies et technologies similaires lors de votre navigation sur notre portail de volontariat international.",
      sections: [
        {
          title: "1. Qu'est-ce qu'un cookie ?",
          content: [
            "Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site internet.",
            "Il permet de mémoriser vos préférences (telles que la langue choisie) et d'assurer le fonctionnement fluide et sécurisé de nos services.",
          ],
        },
        {
          title: "2. Les cookies utilisés sur notre portail",
          content: [
            "Notre plateforme utilise un nombre restreint de cookies strictement nécessaires ou utiles à l'expérience utilisateur :",
            "• Cookies techniques strictement nécessaires : essentiels au maintien de la navigation, à la sécurité du formulaire de candidature en plusieurs étapes et à la protection contre les soumissions automatisées abusives.",
            "• Cookies de préférences de langue : permettent de conserver votre sélection linguistique (Français, Anglais ou Allemand) tout au long de votre navigation.",
            "• Mesure d'audience respectueuse de la vie privée (Google Analytics anonymisé) : nous aide à comprendre quelles rubriques sont les plus consultées (profils recherchés, vie au Togo) afin d'ajuster l'information pour les futurs volontaires. Les adresses IP sont systématiquement masquées.",
          ],
        },
        {
          title: "3. Absence totale de cookies publicitaires",
          content: [
            "APTIC-R est une organisation associative à vocation sociale et rurale.",
            "Nous n'utilisons AUCUN cookie publicitaire, aucun traceur de reciblage commercial (retargeting) et ne vendons aucune donnée à des réseaux publicitaires tiers.",
          ],
        },
        {
          title: "4. Durée de conservation des cookies",
          content: [
            "• Les cookies de session s'effacent automatiquement à la fermeture de votre navigateur.",
            "• Les cookies de préférence (langue) sont conservés pour une durée maximale de 12 mois.",
            "• Les données d'analyse agrégées sont conservées pour une durée n'excédant pas 14 mois.",
          ],
        },
        {
          title: "5. Comment gérer ou refuser les cookies ?",
          content: [
            "Vous pouvez à tout moment configurer votre navigateur pour accepter ou refuser les cookies :",
            "• Google Chrome : Paramètres > Confidentialité et sécurité > Cookies et autres données des sites.",
            "• Mozilla Firefox : Paramètres > Vie privée et sécurité > Cookies et données de sites.",
            "• Apple Safari : Préférences > Confidentialité > Bloquer tous les cookies.",
            "• Microsoft Edge : Paramètres > Cookies et autorisations de site.",
            "Veuillez noter que le blocage complet des cookies techniques essentiels peut altérer le fonctionnement du formulaire de candidature multi-étapes.",
          ],
        },
      ],
      contactBox: {
        title: "Une question sur notre gestion des cookies ?",
        desc: "Écrivez-nous à aptic.rural19@gmail.com pour tout renseignement complémentaire.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Région Maritime, Togo",
      },
    },
    EN: {
      docType: "cookies",
      tag: "Transparency & Trackers",
      title: "Cookie Policy",
      lastUpdated: "Last updated: September 13, 2026",
      disclaimer: "Informational document regarding cookies and analytics technologies used on the APTIC-R portal. Standard framework subject to formal legal ratification by the association.",
      intro: "This policy explains transparently how APTIC-R uses cookies and similar technologies when you navigate our International Volunteer Portal.",
      sections: [
        {
          title: "1. What is a Cookie?",
          content: [
            "A cookie is a small text file placed on your device (computer, tablet, or smartphone) when visiting a website.",
            "It helps remember your preferences (such as selected language) and ensures smooth, secure operation of our services.",
          ],
        },
        {
          title: "2. Cookies Used on Our Portal",
          content: [
            "Our platform uses a minimal set of cookies strictly required for usability and security:",
            "• Strictly necessary technical cookies: essential for maintaining session integrity, multi-step application form navigation, and protecting against automated spam.",
            "• Preference cookies: remember your chosen language setting (English, French, or German) across page views.",
            "• Privacy-respecting audience analytics (anonymized Google Analytics): helps us analyze which volunteer mission pages receive the most interest, allowing us to enhance informational clarity. IP addresses are masked.",
          ],
        },
        {
          title: "3. Absolute Absence of Advertising Cookies",
          content: [
            "APTIC-R is a non-profit community development organization.",
            "We do NOT deploy advertising cookies, behavioral tracking pixels, or commercial retargeting tools, nor do we share browsing behavior with ad networks.",
          ],
        },
        {
          title: "4. Cookie Lifespan",
          content: [
            "• Session cookies are automatically deleted when your browser closes.",
            "• Language preference cookies remain stored for a maximum period of 12 months.",
            "• Aggregated analytics records are stored for no longer than 14 months.",
          ],
        },
        {
          title: "5. Managing Cookie Settings",
          content: [
            "You can control, restrict, or delete cookies at any time through your browser preferences:",
            "• Google Chrome: Settings > Privacy and Security > Third-party cookies.",
            "• Mozilla Firefox: Settings > Privacy & Security > Cookies and Site Data.",
            "• Apple Safari: Preferences > Privacy > Block all cookies.",
            "• Microsoft Edge: Settings > Cookies and site permissions.",
            "Please note that disabling strictly necessary cookies may impact the multi-step application process.",
          ],
        },
      ],
      contactBox: {
        title: "Questions on our cookie policy?",
        desc: "Reach out to us at aptic.rural19@gmail.com for any further technical or privacy information.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Maritime Region, Togo",
      },
    },
    DE: {
      docType: "cookies",
      tag: "Transparenz & Cookies",
      title: "Cookie-Richtlinie",
      lastUpdated: "Zuletzt aktualisiert: 13. September 2026",
      disclaimer: "Informationsdokument über den Einsatz von Cookies auf dem APTIC-R Portal. Vorbehaltlich der formalen rechtlichen Bestätigung durch den Verein.",
      intro: "Diese Richtlinie erläutert transparent, wie APTIC-R Cookies und ähnliche Technologien beim Besuch unseres internationalen Freiwilligenportals einsetzt.",
      sections: [
        {
          title: "1. Was sind Cookies?",
          content: [
            "Ein Cookie ist eine kleine Textdatei, die beim Besuch einer Website auf Ihrem Endgerät (Computer, Smartphone, Tablet) gespeichert wird.",
            "Cookies dienen dazu, Einstellungen (wie die gewählte Sprache) zu speichern und die sichere Bereitstellung unserer Dienste zu gewährleisten.",
          ],
        },
        {
          title: "2. Auf unserem Portal verwendete Cookies",
          content: [
            "Unsere Plattform nutzt ausschließlich eine begrenzte Auswahl an technisch notwendigen oder nützlichen Cookies:",
            "• Technisch notwendige Cookies: erforderlich für die sichere Navigation im mehrstufigen Bewerbungsformular und den Schutz vor Missbrauch.",
            "• Präferenz-Cookies: merken sich Ihre gewählte Sprache (Deutsch, Französisch oder Englisch) für künftige Seitenaufrufe.",
            "• Anonymisierte Reichweitenmessung (Google Analytics): hilft uns zu verstehen, welche Informationsbereiche für Freiwillige am relevantesten sind. IP-Adressen werden dabei gekürzt.",
          ],
        },
        {
          title: "3. Kein Einsatz von Werbe-Cookies",
          content: [
            "APTIC-R ist ein gemeinnütziger Verein mit Fokus auf ländliche Entwicklung.",
            "Wir setzen KEINE Werbe-Cookies, Retargeting-Pixel oder kommerzielle Tracking-Tools ein und geben keine Nutzungsdaten an Werbenetzwerke weiter.",
          ],
        },
        {
          title: "4. Speicherdauer",
          content: [
            "• Sitzungs-Cookies werden nach Schließen des Browsers gelöscht.",
            "• Spracheinstellungen bleiben maximal 12 Monate gespeichert.",
            "• Anonymisierte Analysedaten werden für höchstens 14 Monate aufbewahrt.",
          ],
        },
        {
          title: "5. Verwaltung und Ablehnung von Cookies",
          content: [
            "Sie können das Setzen von Cookies in Ihren Browsereinstellungen jederzeit einschränken oder deaktivieren:",
            "• Chrome: Einstellungen > Datenschutz und Sicherheit > Cookies von Drittanbietern.",
            "• Firefox: Einstellungen > Datenschutz & Sicherheit > Cookies und Website-Daten.",
            "• Safari: Einstellungen > Datenschutz > Alle Cookies blockieren.",
            "• Edge: Einstellungen > Cookies und Websiteberechtigungen.",
            "Bitte beachten Sie, dass das Deaktivieren technisch notwendiger Cookies das Ausfüllen des Bewerbungsformulars beeinträchtigen kann.",
          ],
        },
      ],
      contactBox: {
        title: "Fragen zu Cookies?",
        desc: "Kontaktieren Sie uns unter aptic.rural19@gmail.com für weitere Auskünfte.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Region Maritime, Togo",
      },
    },
  },
}
