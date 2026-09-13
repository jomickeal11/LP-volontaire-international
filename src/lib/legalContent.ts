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
  id: string
  number: string
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
  tocTitle: string
  sections: LegalSection[]
  contactBox: {
    title: string
    desc: string
    email: string
    address: string
    phone: string
  }
}

export const LEGAL_DOCS: Record<LegalDocType, Record<"FR" | "EN" | "DE", LegalDocument>> = {
  privacy: {
    FR: {
      docType: "privacy",
      tag: "Protection des Données",
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : 13 septembre 2026",
      disclaimer: "Document d'information sur la gouvernance des données du programme de volontariat international APTIC-R. Cadre type de transparence préparé pour validation formelle ultérieure par l'association.",
      intro: "L'Association pour la Promotion des TIC en milieu Rural (APTIC-R) s'engage à assurer la protection, la confidentialité et la sécurité des données personnelles des candidats, bénévoles, partenaires et visiteurs de son portail. Cette politique décrit de manière transparente nos pratiques de gestion des données.",
      tocTitle: "Sommaire du document",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Qui sommes-nous ?",
          content: [
            "L'Association pour la Promotion des TIC en milieu Rural (APTIC-R) est une organisation non gouvernementale à but non lucratif régie par la législation togolaise applicable aux associations.",
            "Siège social et base opérationnelle : Agbélouvé, Région Maritime, République Togolaise.",
            "Notre mission est de co-créer et de déployer des technologies adaptées, de promouvoir l'agriculture durable et de soutenir le développement communautaire en milieu rural togolais.",
            "Ce portail en ligne est exclusivement dédié à l'information sur nos missions de volontariat international et à la réception des candidatures et demandes de partenariats.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Quelles données collectons-nous ?",
          content: [
            "Nous collectons uniquement les informations nécessaires au traitement de votre candidature ou de votre prise de contact :",
            "• Identité & état civil : nom, prénom, date de naissance, nationalité, pays de résidence.",
            "• Coordonnées : adresse email, numéro de téléphone (WhatsApp / appel direct), adresse postale.",
            "• Parcours et compétences : niveau d'études, domaine de spécialité, compétences techniques déclarées, langues maîtrisées, curriculum vitae (CV) et lettre de motivation.",
            "• Projet d'engagement : dates de disponibilité souhaitées, durée envisagée, motivations et préférences de mission.",
            "• Demandes de partenariat : raison sociale de l'organisation, pays, type de collaboration sollicitée, message d'introduction.",
            "• Données techniques : adresse IP anonymisée, type de navigateur et préférence de langue (FR, EN, DE).",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Pourquoi utilisons-nous vos données ?",
          content: [
            "Les données recueillies via notre portail répondent à des finalités claires et d'intérêt général :",
            "• Évaluer la recevabilité et l'adéquation de votre candidature au regard des besoins exprimés par les communautés à Agbélouvé.",
            "• Organiser les échanges pré-mission (entretiens à distance, formalisation du projet de volontariat).",
            "• Préparer les démarches d'accueil logistique sur le terrain (hébergement, parrainage, encadrement de mission).",
            "• Instruire les demandes de partenariat émanant d'universités, écoles ou organisations associatives.",
            "• Assurer le fonctionnement technique régulier et sécurisé du portail.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Comment sont-elles utilisées ?",
          content: [
            "Vos données font l'objet d'un traitement loyal, proportionné et confidentiel :",
            "• Examen strictement humain : aucun processus automatisé de prise de décision ou de filtrage par algorithme n'est appliqué aux candidatures.",
            "• Accès restreint : seuls les coordinateurs d'APTIC-R et les référents de mission directement concernés ont accès à votre dossier.",
            "• Absence totale d'usage commercial : vos informations ne sont jamais exploitées à des fins mercantiles, publicitaires ou de prospection commerciale.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Combien de temps sont-elles conservées ?",
          content: [
            "Nous conservons vos données pour des durées limitées et justifiées :",
            "• Dossiers en cours d'instruction : durée de la phase de recrutement et de préparation de la mission.",
            "• Candidatures non retenues : archivage pendant une durée maximale de 24 mois afin de pouvoir vous contacter pour de futures opportunités, sauf demande expresse de suppression de votre part.",
            "• Missions accomplies : conservation des éléments nécessaires à la délivrance d'attestations de mission et au registre associatif des volontaires.",
          ],
        },
        {
          id: "section-06",
          number: "06",
          title: "Avec qui peuvent-elles être partagées ?",
          content: [
            "APTIC-R applique une stricte politique de non-divulgation :",
            "• Jamais de vente ni de cession : vos données ne sont ni vendues, ni louées, ni cédées à des tiers.",
            "• Sous-traitants techniques : nos hébergeurs et prestataires de services informatiques agissent sous des clauses strictes de confidentialité et de sécurité des données.",
            "• Partenaires institutionnels : dans le cas d'une mission organisée via un organisme d'envoi ou un programme conventionné, seules les données strictement nécessaires à l'établissement de la convention sont partagées avec ledit partenaire.",
          ],
        },
        {
          id: "section-07",
          number: "07",
          title: "Vos droits",
          content: [
            "Conformément aux principes directeurs de protection des données personnelles, vous disposez à tout moment des droits suivants :",
            "• Droit d'accès : obtenir la confirmation du traitement de vos données et en demander une copie.",
            "• Droit de rectification : solliciter la correction ou mise à jour de données erronées ou obsolètes.",
            "• Droit à l'effacement : demander la suppression définitive de votre dossier de candidature de nos bases.",
            "• Droit d'opposition et de retrait du consentement : retirer à tout moment votre consentement au traitement.",
            "Pour exercer l'un de ces droits, adressez simplement votre demande par email à aptic.rural19@gmail.com.",
          ],
        },
        {
          id: "section-08",
          number: "08",
          title: "Cookies et mesure d’audience",
          content: [
            "Notre portail privilégie la sobriété numérique :",
            "• Aucun cookie publicitaire ni traceur commercial tiers n'est implanté sur ce site.",
            "• Cookies de session : indispensables à la sécurité et à la navigation fluide dans le formulaire en ligne.",
            "• Cookie de langue : enregistre votre préférence linguistique (FR, EN, DE).",
            "• Analyse d'audience anonyme : outil de statistique de consultation configuré avec masquage systématique des adresses IP, afin de mesurer l'intérêt pour nos missions sans pister individuellement les visiteurs.",
          ],
        },
        {
          id: "section-09",
          number: "09",
          title: "Sécurité",
          content: [
            "Nous mettons en place des protocoles techniques et opérationnels pour préserver l'intégrité de vos informations :",
            "• Chiffrement de toutes les transmissions de données via le protocole sécurisé HTTPS / TLS.",
            "• Accès administrateurs sécurisés par authentification rigoureuse.",
            "• Sauvegardes régulières et compartimentage des espaces de stockage des documents sensibles.",
          ],
        },
        {
          id: "section-10",
          number: "10",
          title: "Nous contacter",
          content: [
            "Pour toute question relative à cette politique de confidentialité ou pour toute demande touchant à vos données personnelles :",
            "• Adresse email : aptic.rural19@gmail.com",
            "• Téléphone / WhatsApp : +228 91 20 19 90",
            "• Adresse postale : Association APTIC-R, Agbélouvé, Région Maritime, République Togolaise",
          ],
        },
      ],
      contactBox: {
        title: "Contact & Délégué à la protection des données",
        desc: "Notre équipe associative à Agbélouvé est disponible pour répondre à toute interrogation sur vos données.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Région Maritime, Togo",
        phone: "+228 91 20 19 90",
      },
    },
    EN: {
      docType: "privacy",
      tag: "Data Protection",
      title: "Privacy Policy",
      lastUpdated: "Last updated: September 13, 2026",
      disclaimer: "Informational document regarding data governance for the APTIC-R International Volunteer Program. Standard transparency framework prepared for formal legal validation by the association.",
      intro: "The Association for the Promotion of ICT in Rural Areas (APTIC-R) is committed to protecting the privacy, confidentiality, and security of applicants, volunteers, partners, and platform visitors. This policy transparently sets out our data management practices.",
      tocTitle: "Table of contents",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Who We Are",
          content: [
            "The Association for the Promotion of ICT in Rural Areas (APTIC-R) is a registered non-profit organization operating under Togolese association legislation.",
            "Headquarters and operational base: Agbélouvé, Maritime Region, Republic of Togo.",
            "Our mission is to co-create sustainable technology, advance agricultural innovation, and strengthen rural community development in Togo.",
            "This online portal serves exclusively to present volunteer opportunities, receive candidate submissions, and process partnership inquiries.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "What Data Do We Collect?",
          content: [
            "We collect strictly the information necessary to review your application or respond to your inquiry:",
            "• Identification details: full name, date of birth, nationality, country of residence.",
            "• Contact information: email address, phone number (WhatsApp / call), physical address.",
            "• Qualifications and background: level of education, specialization, declared technical skills, languages spoken, resume (CV), and cover letter.",
            "• Volunteering objectives: availability dates, expected duration, personal motivations, and preferred tracks.",
            "• Partnership inquiries: organization name, country of operation, collaboration scope, and inquiry message.",
            "• Technical data: anonymized IP addresses, browser specifications, and language preferences (FR, EN, DE).",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Why Do We Use Your Data?",
          content: [
            "Information submitted through our portal is collected for clear, public-interest purposes:",
            "• Assess candidate eligibility in light of on-the-ground community needs in Agbélouvé.",
            "• Coordinate pre-mission communication (online interviews, onboarding preparation).",
            "• Plan on-site logistical arrangements (housing, mentoring, mission orientation).",
            "• Review cooperation inquiries submitted by universities, NGOs, or institutional partners.",
            "• Maintain the stability, responsiveness, and security of our web platform.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "How Is Your Data Used?",
          content: [
            "Your data is processed in a fair, confidential, and proportionate manner:",
            "• Human review only: no automated profiling algorithms or automated decisions are applied to applicant records.",
            "• Restricted access: access is limited strictly to APTIC-R coordination members directly involved in selection and program delivery.",
            "• No commercial use: your information is never used for commercial advertising, marketing campaigns, or sales outreach.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "How Long Is Data Retained?",
          content: [
            "Data is stored only for justified and limited retention periods:",
            "• In-review applications: kept for the active review and deployment preparation phase.",
            "• Unselected applications: archived for up to 24 months to offer relevant upcoming mission openings, unless immediate erasure is requested.",
            "• Completed missions: administrative records retained for volunteer certificate issuance and organizational archives.",
          ],
        },
        {
          id: "section-06",
          number: "06",
          title: "Who May We Share Your Data With?",
          content: [
            "APTIC-R strictly enforces a non-disclosure policy:",
            "• No sale or leasing: we do not sell, rent, or trade your personal data to any third parties.",
            "• Technical service providers: secure hosting and infrastructure providers operate under confidentiality and data protection agreements.",
            "• Sending partners: if your assignment is arranged through a sending organization or formal agreement, only data required for agreement execution is shared.",
          ],
        },
        {
          id: "section-07",
          number: "07",
          title: "Your Rights",
          content: [
            "In accordance with international privacy principles, you have the right to:",
            "• Access your data: verify whether your data is being processed and request an electronic copy.",
            "• Rectification: request the correction or update of inaccurate information.",
            "• Erasure: ask for the permanent deletion of your application file.",
            "• Withdraw consent: retract your consent to data processing at any time.",
            "To exercise your rights, send an email with your request to aptic.rural19@gmail.com.",
          ],
        },
        {
          id: "section-08",
          number: "08",
          title: "Cookies & Audience Measurement",
          content: [
            "Our website practices digital sobriety:",
            "• No third-party commercial trackers or advertising cookies are deployed.",
            "• Essential session cookies: necessary for secure multi-step form navigation.",
            "• Preference cookies: saves your selected display language (FR, EN, DE).",
            "• Anonymized analytics: privacy-respecting audience statistics with IP masking, measuring page visits without individual profiling.",
          ],
        },
        {
          id: "section-09",
          number: "09",
          title: "Security",
          content: [
            "We employ technical and administrative safeguards to protect your information:",
            "• End-to-end data encryption across all pages using HTTPS / TLS protocols.",
            "• Access controls requiring strong administrative credentials.",
            "• Secure cloud storage partitioning for candidate documents (CVs, cover letters).",
          ],
        },
        {
          id: "section-10",
          number: "10",
          title: "Contact Us",
          content: [
            "For questions concerning this Privacy Policy or to exercise your privacy rights:",
            "• Email: aptic.rural19@gmail.com",
            "• Phone / WhatsApp: +228 91 20 19 90",
            "• Postal Address: Association APTIC-R, Agbélouvé, Maritime Region, Republic of Togo",
          ],
        },
      ],
      contactBox: {
        title: "Contact & Privacy Inquiries",
        desc: "Our coordination team in Agbélouvé is available to answer any questions regarding your personal data.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Maritime Region, Togo",
        phone: "+228 91 20 19 90",
      },
    },
    DE: {
      docType: "privacy",
      tag: "Datenschutz",
      title: "Datenschutzerklärung",
      lastUpdated: "Zuletzt aktualisiert: 13. September 2026",
      disclaimer: "Informationsdokument über den Datenschutz im Rahmen des internationalen Freiwilligenprogramms von APTIC-R. Vorbehaltlich der formalen rechtlichen Bestätigung durch den Verein.",
      intro: "Der Verein zur Förderung von IKT im ländlichen Raum (APTIC-R) verpflichtet sich zum Schutz der Vertraulichkeit und Sicherheit personenbezogener Daten von Bewerbern, Freiwilligen und Partnern. Diese Erklärung beschreibt transparent unsere Datenverarbeitung.",
      tocTitle: "Inhaltsverzeichnis",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Wer wir sind",
          content: [
            "Die Association pour la Promotion des TIC en milieu Rural (APTIC-R) ist eine nach togoischem Vereinsrecht registrierte gemeinnützige Organisation.",
            "Hauptsitz und Einsatzbasis: Agbélouvé, Region Maritime, Republik Togo.",
            "Unser Ziel ist die Entwicklung angepasster Technologien, nachhaltiger Landwirtschaft und Stärkung von Dorfgemeinschaften in Togo.",
            "Dieses Portal dient ausschließlich der Information über Freiwilligeneinsätze sowie der Annahme von Bewerbungen und Partnerschaftsanfragen.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Welche Daten erfassen wir?",
          content: [
            "Wir erfassen ausschließlich die zur Bewerbungsprüfung erforderlichen Angaben:",
            "• Persönliche Angaben: Name, Geburtsdatum, Nationalität, Wohnsitzland.",
            "• Kontaktdaten: E-Mail-Adresse, Telefonnummer (WhatsApp/Anruf), Anschrift.",
            "• Profil und Qualifikation: Ausbildung, Fachrichtung, Sprachkenntnisse, Lebenslauf (CV) und Motivationsschreiben.",
            "• Einsatzdaten: Verfügbarkeitszeitraum, geplante Dauer, persönliche Motivation und Einsatzschwerpunkte.",
            "• Partnerschaftsanfragen: Name der Organisation, Land, Anliegen der Kooperation.",
            "• Technische Daten: anonymisierte IP-Adressen, Browsertyp und Spracheinstellung (FR, EN, DE).",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Warum nutzen wir Ihre Daten?",
          content: [
            "Die Datenverarbeitung erfolgt zu gemeinnützigen Zwecken:",
            "• Prüfung der Eignung für Freiwilligenprojekte in Agbélouvé.",
            "• Vorbereitung des Einsatzes (Online-Gespräche, Einführung).",
            "• Organisation des Aufenthalts vor Ort (Unterkunft, Betreuung).",
            "• Bearbeitung von Anfragen von Universitäten oder Partnerorganisationen.",
            "• Gewährleistung der technischen Sicherheit des Online-Portals.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Wie werden Ihre Daten verwendet?",
          content: [
            "Ihre Daten werden vertraulich und zweckgebunden verarbeitet:",
            "• Ausschließlich menschliche Prüfung: es finden keine automatisierten Entscheidungen oder Profiling-Verfahren statt.",
            "• Eingeschränkter Zugriff: nur zuständige Koordinatoren in Agbélouvé haben Zugriff auf die Unterlagen.",
            "• Keine kommerzielle Nutzung: Ihre Daten werden niemals zu Werbe- oder Marketingzwecken verwendet.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Wie lange werden Ihre Daten aufbewahrt?",
          content: [
            "Daten werden nur so lange gespeichert, wie es für den Verwendungszweck nötig ist:",
            "• Laufende Bewerbungen: für die Dauer des Auswahlverfahrens.",
            "• Nicht berücksichtigte Bewerbungen: Speicherung für bis zu 24 Monate für spätere Einsatzmöglichkeiten, sofern keine frühere Löschung verlangt wird.",
            "• Durchgeführte Einsätze: Aufbewahrung für Nachweise und Bestätigungen.",
          ],
        },
        {
          id: "section-06",
          number: "06",
          title: "Mit wem können Daten geteilt werden?",
          content: [
            "APTIC-R hält strikte Geheimhaltungsregeln ein:",
            "• Kein Verkauf: Daten werden weder verkauft noch vermietet.",
            "• Technische Dienstleister: Hoster arbeiten unter vertraglicher Vertraulichkeitsverpflichtung.",
            "• Entsendeorganisationen: bei kooperativen Programmen werden nur vertragsrelevante Daten an die Partnerorganisation übermittelt.",
          ],
        },
        {
          id: "section-07",
          number: "07",
          title: "Ihre Rechte",
          content: [
            "Sie haben nach internationalen Datenschutzgrundsätzen folgende Rechte:",
            "• Recht auf Auskunft über die gespeicherten Daten.",
            "• Recht auf Berichtigung falscher Daten.",
            "• Recht auf Löschung der Bewerbungsunterlagen.",
            "• Recht auf Widerruf erteilter Einwilligungen.",
            "Zur Ausübung Ihrer Rechte senden Sie eine E-Mail an aptic.rural19@gmail.com.",
          ],
        },
        {
          id: "section-08",
          number: "08",
          title: "Cookies und Reichweitenmessung",
          content: [
            "Unsere Website setzt auf digitale Sparsamkeit:",
            "• Keine Werbe-Cookies oder Drittanbieter-Tracker.",
            "• Technisch notwendige Cookies zur Formularnutzung.",
            "• Sprach-Cookie zur Speicherung von FR, EN oder DE.",
            "• Anonymisierte Webanalyse mit IP-Maskierung zur statistischen Reichweitenmessung.",
          ],
        },
        {
          id: "section-09",
          number: "09",
          title: "Sicherheit",
          content: [
            "Wir schützen Ihre Daten durch zeitgemäße Sicherheitsmaßnahmen:",
            "• Verschlüsselte HTTPS-Verbindung auf allen Seiten.",
            "• Gesicherte administrative Zugänge.",
            "• Schutz gespeicherter Dokumente (Lebensläufe, Anschreiben).",
          ],
        },
        {
          id: "section-10",
          number: "10",
          title: "Kontakt",
          content: [
            "Bei Fragen zur Datenschutzerklärung oder zur Ausübung Ihrer Rechte:",
            "• E-Mail: aptic.rural19@gmail.com",
            "• Telefon / WhatsApp: +228 91 20 19 90",
            "• Anschrift: Association APTIC-R, Agbélouvé, Region Maritime, Republik Togo",
          ],
        },
      ],
      contactBox: {
        title: "Kontakt & Datenschutz",
        desc: "Unser Team in Agbélouvé steht Ihnen für Anfragen zur Verarbeitung Ihrer Daten gerne zur Verfügung.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Region Maritime, Togo",
        phone: "+228 91 20 19 90",
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
      tocTitle: "Sommaire du document",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Objet du portail",
          content: [
            "Le présent site a pour vocation de présenter les activités associatives d'APTIC-R à Agbélouvé (Togo), de diffuser les informations relatives au programme de volontariat international et de permettre aux candidats et partenaires de transmettre leurs dossiers et demandes.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Accès et gratuité du service",
          content: [
            "L'accès aux informations du portail et la soumission d'une candidature de volontariat sont entièrement gratuits.",
            "APTIC-R ne facture aucun frais de dossier ni droit d'inscription pour l'étude préalable des candidatures.",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Engagements de l'utilisateur",
          content: [
            "En utilisant notre plateforme et en transmettant un dossier de candidature, vous vous engagez à fournir des informations exactes, sincères et à jour, et à respecter les valeurs d'entraide communautaire et de solidarité portées par APTIC-R.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Propriété intellectuelle",
          content: [
            "L'ensemble des contenus figurant sur ce portail (textes, photographies du terrain, illustrations, logos) sont la propriété exclusive d'APTIC-R ou font l'objet d'une autorisation d'utilisation.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Cadre du volontariat international",
          content: [
            "La soumission d'une candidature sur ce site ne constitue en aucun cas un contrat de travail salarié ni une promesse d'embauche. Le volontariat international s'inscrit dans un engagement bénévole régi par une convention d'engagement spécifique.",
          ],
        },
        {
          id: "section-06",
          number: "06",
          title: "Disponibilité et responsabilité",
          content: [
            "APTIC-R s'efforce de maintenir le portail accessible en continu, mais ne saurait être tenue responsable des interruptions temporaires liées à des maintenances techniques.",
          ],
        },
        {
          id: "section-07",
          number: "07",
          title: "Contact et droit applicable",
          content: [
            "Les présentes conditions sont régies par le droit togolais applicable aux associations. Pour toute question : aptic.rural19@gmail.com.",
          ],
        },
      ],
      contactBox: {
        title: "Besoin d'un renseignement ?",
        desc: "Notre équipe associative répond à toutes vos interrogations relatives au fonctionnement du programme.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Région Maritime, Togo",
        phone: "+228 91 20 19 90",
      },
    },
    EN: {
      docType: "terms",
      tag: "General Terms",
      title: "Terms of Use",
      lastUpdated: "Last updated: September 13, 2026",
      disclaimer: "Informational document establishing operational terms for accessing the APTIC-R portal. Standard framework subject to formal legal ratification by the association.",
      intro: "Welcome to the official International Volunteer Portal of APTIC-R. Access to and use of this website are governed by these Terms of Use.",
      tocTitle: "Table of contents",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Purpose of the Platform",
          content: [
            "This website introduces APTIC-R's non-profit initiatives in Agbélouvé (Togo), provides details on our volunteer missions, and enables candidates to submit applications.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Free Access to Services",
          content: [
            "Access to website content and application submission are free of charge. APTIC-R never charges review or processing fees.",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "User Responsibilities",
          content: [
            "Users agree to provide truthful and updated information, and uphold community respect and cultural openness.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Intellectual Property",
          content: [
            "All materials published on this portal are the property of APTIC-R or used with permission. Commercial reproduction is prohibited.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Nature of International Volunteering",
          content: [
            "Submitting an application does not constitute an employment contract. Missions are governed by official volunteer agreements.",
          ],
        },
        {
          id: "section-06",
          number: "06",
          title: "Platform Availability",
          content: [
            "APTIC-R strives for uninterrupted availability but is not liable for temporary service interruptions.",
          ],
        },
        {
          id: "section-07",
          number: "07",
          title: "Applicable Law and Contact",
          content: [
            "Interpreted under Togolese association laws. Contact: aptic.rural19@gmail.com.",
          ],
        },
      ],
      contactBox: {
        title: "Need clarification?",
        desc: "Our team is here to assist with any questions regarding program participation.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Maritime Region, Togo",
        phone: "+228 91 20 19 90",
      },
    },
    DE: {
      docType: "terms",
      tag: "Nutzungsbedingungen",
      title: "Nutzungsbedingungen",
      lastUpdated: "Zuletzt aktualisiert: 13. September 2026",
      disclaimer: "Informationsdokument über die Bedingungen für die Nutzung der APTIC-R Plattform. Vorbehaltlich der formalen rechtlichen Bestätigung durch den Verein.",
      intro: "Willkommen auf dem offiziellen Portal für internationale Freiwilligendienste von APTIC-R. Die Nutzung dieser Webseite unterliegt diesen Bedingungen.",
      tocTitle: "Inhaltsverzeichnis",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Zweck der Plattform",
          content: [
            "Diese Website informiert über gemeinnützige Projekte in Agbélouvé (Togo) und ermöglicht Bewerbungen für Freiwilligendienste.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Kostenfreie Nutzung",
          content: [
            "Die Nutzung der Informationsangebote und Bewerbungseinreichungen ist vollständig kostenfrei.",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Pflichten der Nutzer",
          content: [
            "Nutzer verpflichten sich zu wahrheitsgemäßen Angaben und respektvollem Umgang im Sinne der Vereinswerte.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Urheberrechte",
          content: [
            "Inhalte sind urheberrechtlich geschützt und Eigentum von APTIC-R.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Charakter des Freiwilligendienstes",
          content: [
            "Eine Bewerbung begründet kein Arbeitsverhältnis. Einsätze basieren auf einer gesonderten Vereinbarung.",
          ],
        },
        {
          id: "section-06",
          number: "06",
          title: "Verfügbarkeit",
          content: [
            "Keine Haftung für vorübergehende technische Ausfälle.",
          ],
        },
        {
          id: "section-07",
          number: "07",
          title: "Anwendbares Recht und Kontakt",
          content: [
            "Es gilt togoisches Vereinsrecht. Kontakt: aptic.rural19@gmail.com.",
          ],
        },
      ],
      contactBox: {
        title: "Haben Sie Fragen?",
        desc: "Unser Team beantwortet gerne Ihre Anliegen rund um das Freiwilligenprogramm.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Region Maritime, Togo",
        phone: "+228 91 20 19 90",
      },
    },
  },
  cookies: {
    FR: {
      docType: "cookies",
      tag: "Transparence & Traceurs",
      title: "Politique de Cookies",
      lastUpdated: "Dernière mise à jour : 13 septembre 2026",
      disclaimer: "Document d'information sur les traceurs et technologies de mesure utilisés sur le portail APTIC-R. Cadre type soumis à validation formelle ultérieure par l'association.",
      intro: "Cette politique informe les visiteurs sur l'utilisation sobre et transparente des cookies et technologies de stockage sur notre portail de volontariat international.",
      tocTitle: "Sommaire du document",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Qu'est-ce qu'un cookie ou traceur ?",
          content: [
            "Un cookie ou traceur est un petit fichier texte ou un identifiant déposé et lu lors de la consultation d'un site web dans votre navigateur.",
            "APTIC-R applique un principe de sobriété numérique : nous limitons strictement les technologies employées à ce qui est nécessaire au fonctionnement du portail et, avec votre accord, à la mesure globale d'audience.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Cookies nécessaires et fonctionnels",
          content: [
            "Ces témoins sont indispensables à la navigation sécurisée et ne requièrent pas de consentement préalable :",
            "• Cookie de session d'administration (session) : authentification chiffrée des coordinateurs accédant au back-office.",
            "• Cookie de langue (NEXT_LOCALE) : mémorisation de la préférence linguistique d'affichage (FR, EN, DE).",
            "• Cookie de consentement (apticr_consent) : mémorisation de la preuve de votre choix relatif aux traceurs. Le choix de consentement est mémorisé pendant 6 mois, conformément à la durée retenue pour le projet.",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Mesure d'audience (Google Analytics 4)",
          content: [
            "Dans la configuration actuelle de GA4 utilisée par APTIC-R, nous retenons un fonctionnement avec consentement préalable et ne revendiquons pas l'exemption de mesure d'audience.",
            "• Traceurs concernés : cookies tiers émis par Google (_ga, _ga_<ID>) permettant de comptabiliser les visites uniques et d'analyser l'intérêt pour nos programmes de volontariat.",
            "• Durée de conservation par défaut : 24 mois.",
            "• Règle stricte d'activation : aucun script Google Analytics ni cookie associé n'est chargé avant que vous n'ayez expressément cliqué sur « Tout accepter » ou validé cette catégorie dans le volet de personnalisation.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Stockages locaux du navigateur",
          content: [
            "Certaines fonctionnalités s'appuient sur le stockage local de votre équipement :",
            "• Brouillons de formulaire (localStorage) : sauvegarde temporaire des réponses en cours de saisie pour éviter la perte de données en cas de rechargement fortuit. Fonctionnalité de confort d'utilisation qui s'efface automatiquement à la soumission du dossier.",
            "• Déduplication de session (sessionStorage) : variable technique temporaire s'effaçant dès la fermeture de votre onglet pour éviter d'enregistrer deux fois le démarrage d'un formulaire.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Gestion et retrait de votre consentement",
          content: [
            "Vous conservez à tout moment la pleine maîtrise de vos choix :",
            "• Panneau de préférences du site : vous pouvez modifier ou révoquer votre choix à tout instant en cliquant sur le lien « Gérer mes cookies » situé dans le pied de page de chaque écran.",
            "• Paramètres de votre navigateur : vous pouvez également bloquer, filtrer ou supprimer les cookies directement depuis les options de votre navigateur internet.",
          ],
        },
      ],
      contactBox: {
        title: "Une question sur les cookies ?",
        desc: "Écrivez-nous à aptic.rural19@gmail.com pour tout renseignement complémentaire.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Région Maritime, Togo",
        phone: "+228 91 20 19 90",
      },
    },
    EN: {
      docType: "cookies",
      tag: "Transparency & Trackers",
      title: "Cookie Policy",
      lastUpdated: "Last updated: September 13, 2026",
      disclaimer: "Informational document regarding cookies and analytics technologies used on the APTIC-R portal. Subject to formal legal ratification by the association.",
      intro: "This policy describes how APTIC-R uses cookies and local storage technologies responsibly and transparently when you browse our International Volunteer Portal.",
      tocTitle: "Table of contents",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "What is a Cookie or Tracker?",
          content: [
            "A cookie or tracker is a small text file or identifier placed on your browser when visiting a website.",
            "APTIC-R practices digital sobriety: we limit technologies strictly to essential platform operations and, with your consent, global audience measurement.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Essential & Functional Cookies",
          content: [
            "These cookies are strictly necessary for secure operation and do not require prior consent:",
            "• Admin session cookie (session): encrypted authentication token for back-office coordinators.",
            "• Language cookie (NEXT_LOCALE): saves your language preference (FR, EN, DE).",
            "• Consent cookie (apticr_consent): stores your consent choice so you are not prompted on every page. Consent choices are stored for 6 months in accordance with project retention rules.",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Audience Measurement (Google Analytics 4)",
          content: [
            "In the current GA4 setup used by APTIC-R, we operate on a prior consent basis and do not claim audience measurement exemption.",
            "• Trackers used: third-party cookies set by Google (_ga, _ga_<ID>) measuring unique visitors and interest in our missions.",
            "• Default retention period: 24 months.",
            "• Strict activation rule: no Google Analytics script or cookie is loaded before you explicitly click 'Accept all' or enable analytics in the customization panel.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Browser Local Storage",
          content: [
            "Certain user-friendly features utilize browser storage:",
            "• Application drafts (localStorage): temporary local autosave of your responses while completing the form. This convenience feature automatically clears upon submission.",
            "• Session deduplication (sessionStorage): ephemeral technical variable that clears upon closing your browser tab.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Managing & Withdrawing Consent",
          content: [
            "You maintain full control over your preferences at all times:",
            "• Site preference panel: you can modify or withdraw consent at any time via the 'Cookie settings' link in the footer.",
            "• Browser controls: you can also configure or delete cookies directly in your browser preferences.",
          ],
        },
      ],
      contactBox: {
        title: "Questions on cookies?",
        desc: "Contact us at aptic.rural19@gmail.com for technical or privacy inquiries.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Maritime Region, Togo",
        phone: "+228 91 20 19 90",
      },
    },
    DE: {
      docType: "cookies",
      tag: "Transparenz & Cookies",
      title: "Cookie-Richtlinie",
      lastUpdated: "Zuletzt aktualisiert: 13. September 2026",
      disclaimer: "Informationsdokument über den Einsatz von Cookies auf dem APTIC-R Portal. Vorbehaltlich der formalen rechtlichen Bestätigung durch den Verein.",
      intro: "Diese Richtlinie erläutert den verantwortungsvollen und transparenten Einsatz von Cookies und Speichertechnologien auf unserem Freiwilligenportal.",
      tocTitle: "Inhaltsverzeichnis",
      sections: [
        {
          id: "section-01",
          number: "01",
          title: "Was sind Cookies und Tracker?",
          content: [
            "Cookies oder Tracker sind kleine Textdateien, die beim Besuch einer Website in Ihrem Browser hinterlegt werden.",
            "APTIC-R setzt auf digitale Sparsamkeit: wir beschränken Technologien auf das technisch Notwendige und, mit Ihrer Einwilligung, auf die Reichweitenmessung.",
          ],
        },
        {
          id: "section-02",
          number: "02",
          title: "Notwendige & funktionale Cookies",
          content: [
            "Diese Cookies sind für den sicheren Betrieb unerlässlich und erfordern keine vorherige Einwilligung:",
            "• Administrations-Session (session): verschlüsseltes Authentifizierungs-Token für das Back-Office.",
            "• Sprachauswahl (NEXT_LOCALE): speichert die ausgewählte Sprache (FR, EN, DE).",
            "• Einwilligungsnachweis (apticr_consent): speichert Ihre getroffene Entscheidung. Die Einwilligungsauswahl wird gemäß den Projektvorgaben für 6 Monate gespeichert.",
          ],
        },
        {
          id: "section-03",
          number: "03",
          title: "Reichweitenmessung (Google Analytics 4)",
          content: [
            "In der aktuellen GA4-Konfiguration von APTIC-R arbeiten wir mit vorheriger Einwilligung und beanspruchen keine Ausnahme für die Reichweitenmessung.",
            "• Betroffene Tracker: von Google gesetzte Cookies (_ga, _ga_<ID>) zur anonymisierten Zählung von Besuchern.",
            "• Standard-Speicherdauer: 24 Monate.",
            "• Strikte Ladebedingung: es wird kein Google Analytics-Skript oder Cookie geladen, bevor Sie nicht ausdrücklich zugestimmt haben.",
          ],
        },
        {
          id: "section-04",
          number: "04",
          title: "Lokale Browserspeicher",
          content: [
            "Einzelne Funktionen nutzen den lokalen Speicher Ihres Geräts:",
            "• Formularentwürfe (localStorage): temporäre lokale Speicherung Ihrer Eingaben zur Vermeidung von Datenverlust. Wird bei Einreichung automatisch gelöscht.",
            "• Session-Deduplizierung (sessionStorage): flüchtige technische Variable, die sich beim Schließen des Browser-Tabs löscht.",
          ],
        },
        {
          id: "section-05",
          number: "05",
          title: "Widerruf & Verwaltung der Einwilligung",
          content: [
            "Sie haben jederzeit die volle Kontrolle über Ihre Einstellungen:",
            "• Einstellungsmenü: Sie können Ihre Einwilligung jederzeit über den Link 'Cookie-Einstellungen' im Footer anpassen oder widerrufen.",
            "• Browsereinstellungen: Sie können Cookies auch direkt in den Optionen Ihres Internetbrowsers verwalten.",
          ],
        },
      ],
      contactBox: {
        title: "Fragen zu Cookies?",
        desc: "Kontaktieren Sie uns unter aptic.rural19@gmail.com für weitere Auskünfte.",
        email: "aptic.rural19@gmail.com",
        address: "Agbélouvé, Region Maritime, Togo",
        phone: "+228 91 20 19 90",
      },
    },
  },
}
