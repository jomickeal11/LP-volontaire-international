const fs = require('fs');

let content = fs.readFileSync('src/i18n/translations.ts', 'utf-8');

const apply_en = `
    apply: {
      steps: {
        s1: 'Personal Info', s2: 'Profile', s3: 'Skills', s4: 'Availability', s5: 'Motivation', s6: 'Experience', s7: 'Documents', s8: 'Source', s9: 'Summary'
      },
      header: {
        tag: 'Volunteer Application',
        title: 'Apply to volunteer with APTIC-R',
        desc: 'This application takes about 15–20 minutes. All information is kept confidential.'
      },
      progress: { step: 'Step', of: 'of', complete: 'complete' },
      nav: { back: '← Back', continue: 'Continue →', submit: 'SEND MY APPLICATION ✓', submitting: 'SENDING...' },
      form: {
        personalInfo: 'Personal Information',
        firstName: 'First Name', firstNamePlaceholder: 'Maria',
        lastName: 'Last Name', lastNamePlaceholder: 'Dupont',
        email: 'Email', emailPlaceholder: 'maria@example.com',
        phone: 'Phone', phonePlaceholder: '+33 6 12 34 56 78',
        country: 'Country',
        city: 'City', cityPlaceholder: 'Paris',
        dob: 'Date of birth',
        select: 'Select...',
        optional: '— optional',
        remove: 'Remove',
        uploadTitle: 'Click to upload or drag and drop',
        uploadSubtitle: 'PDF, DOC, DOCX up to 10MB',
        profile: 'Your Profile',
        education: 'Level of education', educationPlaceholder: 'Master\\'s in Computer Science',
        field: 'Field of study', fieldPlaceholder: 'Computer Science',
        profession: 'Profession / current status', professionPlaceholder: 'Student / Developer / Agronomist...',
        experience: 'Level of experience',
        expOptions: {
          LESS_THAN_1_YEAR: 'Less than 1 year', ONE_TO_TWO_YEARS: '1–2 years', TWO_TO_FIVE_YEARS: '2–5 years', FIVE_PLUS_YEARS: '5+ years'
        },
        digitalSkill: 'Digital skills level',
        digitalOptions: { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced', EXPERT: 'Expert' },
        skillsTitle: 'Skills & Competencies',
        skillsDesc: 'Select all that apply to you.',
        skillsSelected: 'skills selected',
        skillSelected: 'skill selected',
        availability: 'Availability',
        arrivalDate: 'Desired arrival date',
        duration: 'Mission duration',
        durationOptions: { SIX_MONTHS: '6 months', NINE_MONTHS: '9 months', TWELVE_MONTHS: '12 months' },
        motivationTitle: 'Your Motivation',
        motivationDesc: 'Tell us in your own words why you want to volunteer with APTIC-R.',
        motivationLabel: 'Why do you want to volunteer with APTIC-R?',
        motivationPlaceholder: 'I am motivated by the opportunity to apply my skills in a context that truly matters. I believe technology can be a powerful tool for rural development when it is designed with and for communities...',
        charsRemaining: 'characters remaining',
        expTitle: 'Your Experience',
        expDesc: 'Tell us about a project you have worked on — technical, collaborative, or community-oriented.',
        expLabel: 'Describe a project you are proud of',
        expPlaceholder: 'I developed a soil moisture monitoring system for a community garden using Arduino and LoRa. The system sends automated SMS alerts to 12 gardeners, reducing water waste by 30%...',
        docsTitle: 'Documents',
        cv: 'CV / Résumé',
        coverLetter: 'Cover Letter / Lettre de motivation',
        portfolio: 'Portfolio',
        sourceTitle: 'How did you hear about APTIC-R?',
        reviewTitle: 'Review & Submit',
        reviewDesc: 'Please review your information before submitting.',
        reviewEdit: 'Edit',
        reviewName: 'Name',
        reviewNotProvided: 'Not provided',
        reviewNotProvidedOpt: 'Not provided (optional)',
        consent: 'I consent to APTIC-R processing my personal data for the purpose of evaluating my volunteer application. I have read and understood the ',
        privacyPolicy: 'privacy policy',
        dataNote: 'Your personal data is processed in accordance with our privacy policy and used only for the purpose of this application.'
      },
      errors: {
        firstNameReq: 'First name is required (min. 2 characters)',
        lastNameReq: 'Last name is required (min. 2 characters)',
        emailInvalid: 'Invalid email address',
        emailReq: 'Email is required',
        dobReq: 'Date of birth is required',
        countryReq: 'Please select a country.',
        skillsReq: 'Please select at least one skill.',
        motivationLen: 'Please detail your motivation (at least 20 characters).',
        motivationMax: 'Motivation must not exceed 5000 characters.',
        projectLen: 'Please detail your project experience (at least 20 characters).',
        projectMax: 'Project experience must not exceed 5000 characters.',
        sourceReq: 'Please indicate how you heard about APTIC-R.',
        consentReq: 'Please accept the data processing terms to submit your application.',
        submitError: 'An error occurred during submission.',
        min20: 'Minimum 20 characters required',
        max5000: 'Maximum 5000 characters'
      },
      success: {
        ref: 'Reference: ',
        title: 'Application successfully registered!',
        p1_1: 'Thank you, ',
        p1_2: '! Your application has been sent to the APTIC-R coordination team in Agbélouvé.',
        p2_1: 'A confirmation email will be sent to ',
        p2_2: '. Our team will review your application within 1 to 2 weeks.',
        backHome: 'Back to Home',
        backOffice: 'View in Back-office →'
      }
    },
`;

const apply_fr = `
    apply: {
      steps: {
        s1: 'Infos Perso', s2: 'Profil', s3: 'Compétences', s4: 'Disponibilité', s5: 'Motivation', s6: 'Expérience', s7: 'Documents', s8: 'Source', s9: 'Résumé'
      },
      header: {
        tag: 'Candidature Volontaire',
        title: 'Postuler pour devenir volontaire avec APTIC-R',
        desc: 'Cette candidature prend environ 15 à 20 minutes. Toutes les informations restent confidentielles.'
      },
      progress: { step: 'Étape', of: 'sur', complete: 'complété' },
      nav: { back: '← Retour', continue: 'Continuer →', submit: 'ENVOYER MA CANDIDATURE ✓', submitting: 'ENVOI EN COURS...' },
      form: {
        personalInfo: 'Informations Personnelles',
        firstName: 'Prénom', firstNamePlaceholder: 'Maria',
        lastName: 'Nom', lastNamePlaceholder: 'Dupont',
        email: 'E-mail', emailPlaceholder: 'maria@example.com',
        phone: 'Téléphone', phonePlaceholder: '+33 6 12 34 56 78',
        country: 'Pays',
        city: 'Ville', cityPlaceholder: 'Paris',
        dob: 'Date de naissance',
        select: 'Sélectionner...',
        optional: '— facultatif',
        remove: 'Retirer',
        uploadTitle: 'Cliquez ou glissez-déposez pour uploader',
        uploadSubtitle: 'PDF, DOC, DOCX jusqu\\'à 10Mo',
        profile: 'Votre Profil',
        education: 'Niveau d\\'études', educationPlaceholder: 'Master en Informatique',
        field: 'Domaine d\\'études', fieldPlaceholder: 'Informatique',
        profession: 'Profession / statut actuel', professionPlaceholder: 'Étudiant / Développeur / Agronome...',
        experience: 'Niveau d\\'expérience',
        expOptions: {
          LESS_THAN_1_YEAR: 'Moins d\\'un an', ONE_TO_TWO_YEARS: '1–2 ans', TWO_TO_FIVE_YEARS: '2–5 ans', FIVE_PLUS_YEARS: '5+ ans'
        },
        digitalSkill: 'Niveau de compétences numériques',
        digitalOptions: { BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé', EXPERT: 'Expert' },
        skillsTitle: 'Compétences & Aptitudes',
        skillsDesc: 'Sélectionnez tout ce qui s\\'applique à vous.',
        skillsSelected: 'compétences sélectionnées',
        skillSelected: 'compétence sélectionnée',
        availability: 'Disponibilité',
        arrivalDate: 'Date d\\'arrivée souhaitée',
        duration: 'Durée de la mission',
        durationOptions: { SIX_MONTHS: '6 mois', NINE_MONTHS: '9 mois', TWELVE_MONTHS: '12 mois' },
        motivationTitle: 'Votre Motivation',
        motivationDesc: 'Dites-nous dans vos propres mots pourquoi vous souhaitez être volontaire avec APTIC-R.',
        motivationLabel: 'Pourquoi souhaitez-vous être volontaire avec APTIC-R ?',
        motivationPlaceholder: 'Je suis motivé(e) par l\\'opportunité d\\'appliquer mes compétences dans un contexte qui compte vraiment...',
        charsRemaining: 'caractères restants',
        expTitle: 'Votre Expérience',
        expDesc: 'Parlez-nous d\\'un projet sur lequel vous avez travaillé — technique, collaboratif ou communautaire.',
        expLabel: 'Décrivez un projet dont vous êtes fier(ère)',
        expPlaceholder: 'J\\'ai développé un système de surveillance de l\\'humidité des sols...',
        docsTitle: 'Documents',
        cv: 'CV / Résumé',
        coverLetter: 'Lettre de motivation',
        portfolio: 'Portfolio',
        sourceTitle: 'Comment avez-vous connu APTIC-R ?',
        reviewTitle: 'Vérifier & Soumettre',
        reviewDesc: 'Veuillez vérifier vos informations avant de soumettre.',
        reviewEdit: 'Modifier',
        reviewName: 'Nom',
        reviewNotProvided: 'Non fourni',
        reviewNotProvidedOpt: 'Non fourni (facultatif)',
        consent: 'Je consens à ce qu\\'APTIC-R traite mes données personnelles pour évaluer ma candidature. J\\'ai lu et compris la ',
        privacyPolicy: 'politique de confidentialité',
        dataNote: 'Vos données personnelles sont traitées conformément à notre politique de confidentialité et utilisées uniquement dans le cadre de cette candidature.'
      },
      errors: {
        firstNameReq: 'Prénom obligatoire (min. 2 caractères)',
        lastNameReq: 'Nom obligatoire (min. 2 caractères)',
        emailInvalid: 'Adresse e-mail invalide',
        emailReq: 'E-mail obligatoire',
        dobReq: 'Date de naissance obligatoire',
        countryReq: 'Veuillez sélectionner un pays.',
        skillsReq: 'Veuillez sélectionner au moins une compétence.',
        motivationLen: 'Veuillez détailler votre motivation (au moins 20 caractères).',
        motivationMax: 'La motivation ne doit pas dépasser 5000 caractères.',
        projectLen: 'Veuillez détailler votre expérience projet (au moins 20 caractères).',
        projectMax: 'L\\'expérience projet ne doit pas dépasser 5000 caractères.',
        sourceReq: 'Veuillez indiquer comment vous avez connu APTIC-R.',
        consentReq: 'Veuillez accepter le traitement des données pour soumettre votre candidature.',
        submitError: 'Une erreur est survenue lors de la soumission.',
        min20: 'Minimum 20 caractères requis',
        max5000: 'Maximum 5000 caractères'
      },
      success: {
        ref: 'Référence : ',
        title: 'Candidature enregistrée avec succès !',
        p1_1: 'Merci, ',
        p1_2: ' ! Votre candidature a été transmise à l\\'équipe de coordination d\\'APTIC-R à Agbélouvé.',
        p2_1: 'Un email de confirmation vous sera envoyé à ',
        p2_2: '. Notre équipe étudiera votre dossier sous 1 à 2 semaines.',
        backHome: 'Retour à l\\'accueil',
        backOffice: 'Voir dans le Back-office →'
      }
    },
`;

const apply_de = `
    apply: {
      steps: {
        s1: 'Persönliche Infos', s2: 'Profil', s3: 'Fähigkeiten', s4: 'Verfügbarkeit', s5: 'Motivation', s6: 'Erfahrung', s7: 'Dokumente', s8: 'Quelle', s9: 'Zusammenfassung'
      },
      header: {
        tag: 'Bewerbung als Freiwilliger',
        title: 'Bewerben Sie sich als Freiwilliger bei APTIC-R',
        desc: 'Diese Bewerbung dauert etwa 15-20 Minuten. Alle Informationen werden vertraulich behandelt.'
      },
      progress: { step: 'Schritt', of: 'von', complete: 'abgeschlossen' },
      nav: { back: '← Zurück', continue: 'Weiter →', submit: 'BEWERBUNG SENDEN ✓', submitting: 'WIRD GESENDET...' },
      form: {
        personalInfo: 'Persönliche Informationen',
        firstName: 'Vorname', firstNamePlaceholder: 'Maria',
        lastName: 'Nachname', lastNamePlaceholder: 'Dupont',
        email: 'E-Mail', emailPlaceholder: 'maria@example.com',
        phone: 'Telefon', phonePlaceholder: '+33 6 12 34 56 78',
        country: 'Land',
        city: 'Stadt', cityPlaceholder: 'Berlin',
        dob: 'Geburtsdatum',
        select: 'Auswählen...',
        optional: '— optional',
        remove: 'Entfernen',
        uploadTitle: 'Klicken zum Hochladen oder Drag & Drop',
        uploadSubtitle: 'PDF, DOC, DOCX bis zu 10MB',
        profile: 'Ihr Profil',
        education: 'Bildungsabschluss', educationPlaceholder: 'Master in Informatik',
        field: 'Studienfach', fieldPlaceholder: 'Informatik',
        profession: 'Beruf / Aktueller Status', professionPlaceholder: 'Student / Entwickler / Agronom...',
        experience: 'Erfahrungsstufe',
        expOptions: {
          LESS_THAN_1_YEAR: 'Weniger als 1 Jahr', ONE_TO_TWO_YEARS: '1–2 Jahre', TWO_TO_FIVE_YEARS: '2–5 Jahre', FIVE_PLUS_YEARS: '5+ Jahre'
        },
        digitalSkill: 'Digitale Kompetenzen',
        digitalOptions: { BEGINNER: 'Anfänger', INTERMEDIATE: 'Mittel', ADVANCED: 'Fortgeschritten', EXPERT: 'Experte' },
        skillsTitle: 'Fähigkeiten & Kompetenzen',
        skillsDesc: 'Wählen Sie alle zutreffenden aus.',
        skillsSelected: 'Fähigkeiten ausgewählt',
        skillSelected: 'Fähigkeit ausgewählt',
        availability: 'Verfügbarkeit',
        arrivalDate: 'Gewünschtes Ankunftsdatum',
        duration: 'Einsatzdauer',
        durationOptions: { SIX_MONTHS: '6 Monate', NINE_MONTHS: '9 Monate', TWELVE_MONTHS: '12 Monate' },
        motivationTitle: 'Ihre Motivation',
        motivationDesc: 'Erzählen Sie uns in Ihren eigenen Worten, warum Sie sich bei APTIC-R ehrenamtlich engagieren möchten.',
        motivationLabel: 'Warum möchten Sie sich bei APTIC-R ehrenamtlich engagieren?',
        motivationPlaceholder: 'Ich bin motiviert von der Möglichkeit, meine Fähigkeiten in einem wirklich wichtigen Kontext anzuwenden...',
        charsRemaining: 'Zeichen verbleibend',
        expTitle: 'Ihre Erfahrung',
        expDesc: 'Erzählen Sie uns von einem Projekt, an dem Sie gearbeitet haben — technisch, kollaborativ oder gemeinschaftsorientiert.',
        expLabel: 'Beschreiben Sie ein Projekt, auf das Sie stolz sind',
        expPlaceholder: 'Ich habe ein Bodenfeuchte-Überwachungssystem entwickelt...',
        docsTitle: 'Dokumente',
        cv: 'Lebenslauf (CV)',
        coverLetter: 'Motivationsschreiben',
        portfolio: 'Portfolio',
        sourceTitle: 'Wie haben Sie von APTIC-R erfahren?',
        reviewTitle: 'Überprüfen & Absenden',
        reviewDesc: 'Bitte überprüfen Sie Ihre Informationen vor dem Absenden.',
        reviewEdit: 'Bearbeiten',
        reviewName: 'Name',
        reviewNotProvided: 'Nicht angegeben',
        reviewNotProvidedOpt: 'Nicht angegeben (optional)',
        consent: 'Ich stimme zu, dass APTIC-R meine personenbezogenen Daten zur Bewertung meiner Bewerbung verarbeitet. Ich habe die ',
        privacyPolicy: 'Datenschutzerklärung',
        dataNote: 'Ihre personenbezogenen Daten werden gemäß unserer Datenschutzerklärung verarbeitet und nur für den Zweck dieser Bewerbung verwendet.'
      },
      errors: {
        firstNameReq: 'Vorname ist erforderlich (min. 2 Zeichen)',
        lastNameReq: 'Nachname ist erforderlich (min. 2 Zeichen)',
        emailInvalid: 'Ungültige E-Mail-Adresse',
        emailReq: 'E-Mail ist erforderlich',
        dobReq: 'Geburtsdatum ist erforderlich',
        countryReq: 'Bitte wählen Sie ein Land aus.',
        skillsReq: 'Bitte wählen Sie mindestens eine Fähigkeit aus.',
        motivationLen: 'Bitte detaillieren Sie Ihre Motivation (mindestens 20 Zeichen).',
        motivationMax: 'Die Motivation darf 5000 Zeichen nicht überschreiten.',
        projectLen: 'Bitte detaillieren Sie Ihre Projekterfahrung (mindestens 20 Zeichen).',
        projectMax: 'Die Projekterfahrung darf 5000 Zeichen nicht überschreiten.',
        sourceReq: 'Bitte geben Sie an, wie Sie von APTIC-R erfahren haben.',
        consentReq: 'Bitte akzeptieren Sie die Datenverarbeitungsbedingungen, um Ihre Bewerbung einzureichen.',
        submitError: 'Ein Fehler ist beim Senden aufgetreten.',
        min20: 'Mindestens 20 Zeichen erforderlich',
        max5000: 'Maximal 5000 Zeichen'
      },
      success: {
        ref: 'Referenz: ',
        title: 'Bewerbung erfolgreich registriert!',
        p1_1: 'Vielen Dank, ',
        p1_2: '! Ihre Bewerbung wurde an das APTIC-R Koordinationsteam in Agbélouvé weitergeleitet.',
        p2_1: 'Eine Bestätigungs-E-Mail wird an ',
        p2_2: ' gesendet. Unser Team wird Ihre Bewerbung innerhalb von 1 bis 2 Wochen prüfen.',
        backHome: 'Zurück zur Startseite',
        backOffice: 'Im Back-Office ansehen →'
      }
    },
`;

let p1 = content.indexOf('    footer: {');
content = content.slice(0, p1) + apply_en + content.slice(p1);

let p2 = content.indexOf('    footer: {', p1 + apply_en.length + 100);
content = content.slice(0, p2) + apply_fr + content.slice(p2);

let p3 = content.indexOf('    footer: {', p2 + apply_fr.length + 100);
content = content.slice(0, p3) + apply_de + content.slice(p3);

fs.writeFileSync('src/i18n/translations.ts', content, 'utf-8');
console.log('Successfully patched translations.ts');
