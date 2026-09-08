export type TKey = typeof translations[keyof typeof translations]

const translations = {
  EN: {
    nav: {
      about: "About APTIC-R",
      mission: "The Mission",
      activities: "Activities",
      lifeInTogo: "Life in Togo",
      apply: "Apply",
      faq: "FAQ",
      partners: "Partners",
      applyNow: "APPLY NOW",
    },
    hero: {
      badge: "Agbélouvé, Togo · 6-12 months · Open Applications",
      line1: "Volunteer in Togo.",
      line2: "Build technology",
      line3: "for rural communities.",
      desc: "Join APTIC-R and work alongside rural communities to co-create practical digital and low-tech solutions for agriculture, education, and local entrepreneurship.",
      cta1: "APPLY NOW",
      cta2: "DISCOVER THE MISSION",
      stat1Label: "6-12 months",
      stat1Sub: "Mission duration",
      stat2Label: "Agbélouvé",
      stat2Sub: "Togo, West Africa",
      stat3Label: "FR · EN · DE",
      stat3Sub: "Languages",
    },
    dualPath: {
      tagLine: "CHOOSE YOUR PATH",
      titleLine: "How would you like to get involved?",
      volunteerTag: "For Volunteers",
      volunteerTitle: "I want to become a volunteer",
      volunteerDesc:
        "Students, graduates, young professionals. Apply for a 6-12 month volunteer mission in Togo and work directly with rural communities.",
      volunteerCta: "APPLY NOW",
      orgTag: "For Organizations",
      orgTitle: "I represent an organization",
      orgDesc:
        "European volunteer-sending organizations. Explore a long-term partnership to send volunteers to APTIC-R in Togo.",
      orgCta: "BECOME A PARTNER",
    },
    whyMission: {
      tag: "Why APTIC-R",
      title: "Why volunteer with APTIC-R?",
      cards: [
        {
          title: "Rural Impact",
          desc: "Work directly alongside rural communities in Agbélouvé. Your contributions solve real problems that affect daily life.",
        },
        {
          title: "Digital Innovation",
          desc: "Use technology to solve concrete challenges. From SMS systems to offline apps - find creative solutions that actually work.",
        },
        {
          title: "Simple Technology",
          desc: "Design affordable, repairable, and accessible solutions. Innovation doesn't need to be complex - it needs to be useful.",
        },
        {
          title: "Cultural Exchange",
          desc: "Discover Togo while learning from local communities. Build lasting relationships that transcend professional boundaries.",
        },
      ],
    },
    challenge: {
      tag: "The Challenge",
      title: "Technology should be accessible to everyone.",
      p1: "In many rural communities, access to information, digital tools, and appropriate technologies remains limited. APTIC-R believes that innovation doesn't always have to be complex or expensive.",
      p2: "Sometimes a simple SMS system, an offline application, a low-cost sensor, or a digital training programme can make all the difference.",
      steps: [
        {
          tag: "PROBLEM",
          title: "Real Field Constraints",
          text: "Rural communities lack affordable, repairable digital tools and access to reliable agricultural insights.",
        },
        {
          tag: "INNOVATION",
          title: "Accessible Co-Creation",
          text: "Co-creating pragmatic solutions alongside farmers - SMS systems, offline mobile apps, and low-cost sensors.",
        },
        {
          tag: "IMPACT",
          title: "Autonomous Communities",
          text: "Open source documentation and local relay training so communities own and maintain the technology sustainably.",
        },
      ],
    },
    mission: {
      tag: "Your Mission",
      title: "What you will do on the ground",
      steps: [
        {
          title: "Field Diagnosis",
          desc: "Meet farmers and cooperatives. Understand local needs and existing practices before any solution is proposed.",
        },
        {
          title: "Rural Hackathons",
          desc: "Organize co-creation workshops bringing together community members, volunteers, and local innovators.",
        },
        {
          title: "Prototyping",
          desc: "Design and build low-tech solutions: sensors, apps, SMS tools, or training programmes tailored to local context.",
        },
        {
          title: "Training",
          desc: "Empower local relay actors. Transfer skills and knowledge so the community can operate solutions independently.",
        },
        {
          title: "Open Source Documentation",
          desc: "Document every solution developed in reproducible, openly accessible formats for other communities to benefit from.",
        },
      ],
    },
    build: {
      tag: "Projects",
      title: "What could you build?",
      featured: {
        badge: "IoT & Sensors",
        title: "Smart Irrigation",
        desc: "Design and deploy low-cost moisture sensors that help local farmers optimize water usage during the dry season. Built with Arduino and local materials.",
      },
      cards: [
        { title: "Weather Alert System", badge: "2G / SMS" },
        { title: "Offline Mobile Tools", badge: "Mobile" },
        { title: "Agricultural Dashboards", badge: "Data Vis" },
        { title: "Inventory Management", badge: "Coop Tools" },
      ],
    },
    profiles: {
      tag: "Profiles Sought",
      title: "Could it be you?",
      subtitle:
        "We welcome volunteers from a wide range of backgrounds. What matters most is curiosity, adaptability, and the desire to contribute.",
      cta: "CHECK YOUR ELIGIBILITY",
      categories: [
        {
          title: "Digital & IT",
          tags: "Computer Science · Web Development · Mobile · Data · Cybersecurity",
        },
        {
          title: "Agriculture",
          tags: "Agronomy · Agriculture · Environment · Rural Development",
        },
        {
          title: "Creative",
          tags: "UI/UX Design · Graphic Design · Content Creation · Communication",
        },
        {
          title: "Engineering / Fabrication",
          tags: "Mechanical · Electronics · IoT · Solar Energy · Woodworking",
        },
      ],
    },
    eligibility: {
      title: "Check your eligibility",
      q1: "Does your field match one of the sought profiles?",
      q2: "Are you available for a 6 to 12-month mission?",
      q3: "Are you ready to work directly with rural communities?",
      q4: "Are you interested in an experience in Togo?",
      q5: "Are you willing to learn and work as a team?",
      successMsg: "Your profile seems to match the mission.",
      cta: "START YOUR APPLICATION",
    },
    notExpert: {
      title: "You don't need to know everything.",
      subtitle: "All it takes is the desire to learn.",
      cta: "APPLY NOW",
      qualities: ["CURIOUS", "AUTONOMOUS", "PATIENT", "CREATIVE", "OPEN", "TEAM PLAYER", "FIELD-ORIENTED"],
    },
    week: {
      tag: "Weekly Rhythm",
      title: "A week with APTIC-R",
      dayLabels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      days: [
        {
          activity: "Digital Innovation",
          desc: "Morning workshop on local digital needs. Mapping sessions with community representatives.",
        },
        {
          activity: "Field Visit",
          desc: "Visit farmers, cooperatives, schools. Observe, listen, understand local realities.",
        },
        {
          activity: "Prototyping",
          desc: "Hands-on making session: build, test, iterate on solutions conceived with the community.",
        },
        {
          activity: "Training",
          desc: "Train local relay actors on the tools and systems developed during the week.",
        },
        {
          activity: "Rural Innovation Lab",
          desc: "Weekly showcase: present progress, gather feedback, plan next iteration.",
        },
        {
          activity: "Cultural Discovery",
          desc: "Explore Agbélouvé and surroundings. Language lessons, community events, cultural immersion.",
        },
        {
          activity: "Rest",
          desc: "Time for reflection, personal projects, reading, or simply enjoying the environment.",
        },
      ],
    },
    lifeInTogo: {
      tag: "Life in Togo",
      title: "More than a volunteer mission. A life experience.",
      items: [
        {
          label: "Togolese Culture",
          desc: "Rich traditions, hospitable communities, authentic social fabric.",
        },
        {
          label: "Tropical Environment",
          desc: "Lush landscapes, warm climate, rich agricultural biodiversity.",
        },
        {
          label: "Gastronomy",
          desc: "Local cuisine, fresh farm produce, shared community meals.",
        },
        {
          label: "Languages",
          desc: "French as official working language, Ewé, Kabiyé and local dialects.",
        },
        {
          label: "Human Connections",
          desc: "Profound relationships built with local families and cooperatives.",
        },
        {
          label: "Discovery",
          desc: "Local markets, crafts, ceremonies, and historical heritage.",
        },
      ],
    },
    agbelouve: {
      tag: "Your Base",
      title: "Agbélouvé, Togo",
      desc: "A welcoming rural town in the Maritime Region, Agbélouvé sits at the heart of agricultural Togo. The APTIC-R office is located here, surrounded by farming communities, local cooperatives, and a growing network of digital innovation actors.",
      facts: [
        { label: "Location", value: "Maritime Region, Togo" },
        { label: "Environment", value: "Tropical climate, agricultural area" },
        { label: "Access", value: "Close to Lomé (~80 km)" },
        { label: "Agriculture", value: "Subsistence & cash crops" },
        { label: "Community", value: "Active local cooperatives" },
        { label: "Living Conditions", value: "Accommodation provided locally" },
      ],
    },
    support: {
      tag: "Your Support",
      title: "You won't be alone.",
      subtitle:
        "APTIC-R provides a full support framework for all volunteers throughout their mission.",
      tableTitle: "What's included?",
      tableSummary: "Framework Summary",
      statusConfirmed: "Confirmed",
      statusPending: "Pending",
      statusVariable: "Variable",
      items: [
        { label: "Accommodation", value: "Provided" },
        { label: "Meals", value: "Local arrangements" },
        { label: "Transport", value: "Local travel covered" },
        { label: "Mentorship", value: "APTIC-R mentor" },
        { label: "Communication", value: "Local SIM + Internet" },
        { label: "Security", value: "On-site support" },
        { label: "Health", value: "Arrival orientation" },
        { label: "Accompaniment", value: "Full mission support" },
      ],
      tableItems: [
        ["Mission duration", "6 to 12 months", "Confirmed"],
        ["Accommodation", "Pending local details", "Pending"],
        ["Meals", "Pending local details", "Pending"],
        ["Local transport", "Pending local details", "Pending"],
        ["Insurance", "Program dependent", "Variable"],
        ["International travel", "Program dependent", "Variable"],
        ["Visa", "Program dependent", "Variable"],
        ["Allowance", "Program dependent", "Variable"],
        ["Local mentorship", "Yes - permanent contact person", "Confirmed"],
      ],
    },
    appProcess: {
      tag: "How to apply",
      title: "The application process",
      stepLabel: "Step",
      cta: "START YOUR APPLICATION",
      steps: [
        {
          title: "Discover",
          desc: "Explore the mission, the projects, and daily life in Agbélouvé.",
        },
        {
          title: "Apply",
          desc: "Complete our multi-step application form. It takes 15-20 minutes.",
        },
        {
          title: "Interview",
          desc: "A video call with the APTIC-R team to get to know you better.",
        },
        {
          title: "Selection",
          desc: "Assessment and selection based on profile, motivation, and availability.",
        },
        {
          title: "Preparation",
          desc: "Pre-departure briefing, administrative preparation, and cultural orientation.",
        },
        {
          title: "Welcome to Togo",
          desc: "Arrival in Agbélouvé, integration, and start of your mission.",
        },
      ],
    },
    partners: {
      titlePart1: "BUILDING BRIDGES BETWEEN",
      titlePart2: "EUROPE AND TOGO",
      tag: "European Partners",
      title: "EUROPEAN\nPARTNERSHIPS",
      desc: "Building long-term bridges\nbetween Europe and rural communities in Togo.",
      countries: ["France", "Germany", "Belgium", "Europe"],
      cta: "BECOME A PARTNER",
    },
    testimonials: {
      tag: "Volunteer Stories",
      title: "Voices from the field",
      disclaimer:
        "These testimonials are illustrative. Verified content to be provided by APTIC-R.",
      cards: [
        {
          name: "Jonas M.",
          country: "Germany",
          role: "Digital Innovation",
          quote:
            "Working with farmers on their SMS weather alert system was unlike anything I had done in a university lab. Real constraints inspired creative, low-tech solutions.",
          initials: "JM",
        },
        {
          name: "Claire D.",
          country: "France",
          role: "Rural Tech",
          quote:
            "J'avais peur de ne pas avoir un profil assez technique. Mais APTIC-R m'a montré que la pédagogie, l'écoute et l'animation d'ateliers sont des compétences indispensables.",
          initials: "CD",
        },
        {
          name: "Thomas L.",
          country: "Belgium",
          role: "Low-Tech Agri",
          quote:
            "As an agronomy student, I learned more about sustainable soil management and community collaboration in 9 months in Agbélouvé than during years of study.",
          initials: "TL",
        },
      ],
    },
    faq: {
      tag: "FAQ",
      title: "Frequently asked questions",
      items: [
        {
          q: "Do I need to speak French?",
          a: "French is the official working language in Togo and will be very helpful on a daily basis. Some knowledge of French is recommended, though we also use English for technical work and international collaboration.",
        },
        {
          q: "Do I need previous volunteer experience?",
          a: "No prior volunteer experience is required. Motivation, autonomy, cultural sensitivity and a genuine desire to learn with rural communities are what matter most.",
        },
        {
          q: "Do I need to be an IT engineer?",
          a: "Not necessarily. APTIC-R welcomes candidates from diverse backgrounds: agronomy, communication, design, science, and engineering. Low-tech innovation requires pedagogical and organizational skills as much as technical ones.",
        },
        {
          q: "Where will I live during the mission?",
          a: "Accommodation arrangements in Agbélouvé are currently being finalized according to the specific programme. (À préciser)",
        },
        {
          q: "How long does a mission last?",
          a: "Standard mission durations range from 6 to 12 months (e.g. 6, 9, or 12 months) depending on project scope and candidate availability.",
        },
        {
          q: "What about international flights, visa, and insurance?",
          a: "Travel costs, visa, and insurance coverage depend on the sending framework and European partner program (e.g. weltwärts, European Solidarity Corps). (Selon le programme)",
        },
        {
          q: "Will I have a local mentor in Agbélouvé?",
          a: "Yes. Every international volunteer is paired with a dedicated local mentor from APTIC-R for continuous accompaniment, cultural integration, and mission follow-up.",
        },
        {
          q: "What happens after I submit my application?",
          a: "Applications are reviewed within 1 to 2 weeks. Selected candidates will be invited for an online video interview with the APTIC-R coordination team.",
        },
      ],
    },
    finalCta: {
      title: "Ready to make an impact?",
      p1: "Your skills can become powerful tools for rural communities.",
      p2: "Your experience can become an opportunity for someone else.",
      p3: "Your next adventure could begin in Togo.",
      cta1: "APPLY NOW",
      cta2: "BECOME A PARTNER",
    },

    apply: {
      steps: {
        s1: 'Personal Info', s2: 'Profile', s3: 'Skills', s4: 'Availability', s5: 'Motivation', s6: 'Experience', s7: 'Documents', s8: 'Source', s9: 'Summary'
      },
      stepDescs: {
        s1: 'Your contact details and civil info', s2: 'Your academic background and languages', s3: 'Select the fields where you can contribute', s4: 'Desired period and duration for your mission', s5: 'Express the reasons for your commitment', s6: 'Share a significant achievement or experience', s7: 'Upload your CV and cover letter', s8: 'Help us know how you found out about the program', s9: 'Review your application before submitting'
      },
      sidebar: {
        progression: 'PROGRESSION',
        step: 'STEP',
        of: 'OF',
        ofLower: 'of',
        yourApplication: 'YOUR APPLICATION',
        country: 'Country:',
        duration: 'Duration:',
        skills: 'Skills:',
        arrival: 'Arrival:',
        notProvided: 'Not provided',
        toSpecify: 'To specify',
        none: 'None',
        selected: 'selected',
        checks: {
          infoComplete: 'Information complete',
          profileComplete: 'Profile complete',
          skillsSelected: 'Skills selected',
          availabilityIndicated: 'Availability indicated',
          documentsAdded: 'Documents added'
        },
        help: {
          title: 'Need some light?',
          desc: 'Any questions about the mission, Togo, or your application? Our team will gladly answer you.',
          contactBtn: 'Contact APTIC-R'
        }
      },
      review: {
        disclaimer: 'Please review your application details carefully below before submitting to the APTIC-R coordination.',
        sections: {
          contact: 'Contact Info',
          mission: 'Mission & Availability',
          docs: 'Documents'
        },
        edit: 'Edit',
        fields: {
          name: 'Name:', email: 'Email:', phone: 'Phone:', location: 'Country / City:',
          duration: 'Duration:', arrival: 'Desired arrival:', skills: 'Skills',
          cv: 'CV:', letter: 'Letter:'
        },
        notProvided: 'Not provided',
        none: 'None',
        notSent: 'Not provided',
        consentLabel: 'I certify the accuracy of the information provided and I agree that the APTIC-R association processes my personal data strictly for the evaluation of my international volunteer application.'
      },
      header: {
        tag: 'Volunteer Application',
        title: 'Build your experience in Togo',
        desc: 'Take a few minutes to present your profile, skills, and motivation.',
        context: '6–12 months · Agbélouvé, Togo · Confidential application',
        visitSite: 'Visit website'
      },
      progress: { step: 'Step', of: 'of', complete: 'completed' },
      nav: { back: 'Back', continue: 'Continue', submit: 'Send my application', submitting: 'Sending...' },
      trust: 'Your information is treated confidentially.',
      form: {
        personalInfo: 'Personal Information',
        firstName: 'First Name', firstNamePlaceholder: 'e.g. Koffi',
        lastName: 'Last Name', lastNamePlaceholder: 'e.g. Mensah',
        email: 'Email', emailPlaceholder: 'koffi.mensah@example.com',
        emailHelp: 'We will use this address to contact you regarding your application.',
        phone: 'Phone', phonePlaceholder: '90 12 34 56',
        country: 'Country',
        city: 'City', cityPlaceholder: 'e.g. Lomé, Tsévié, Kpalimé...',
        dob: 'Date of birth', dobHelp: 'Used only to verify your eligibility for the program.',
        select: 'Select...',
        optional: '— optional',
        remove: 'Remove',
        uploadTitle: 'Click to upload or drag and drop',
        uploadSubtitle: 'PDF, DOC, DOCX up to 10MB',
        profile: 'Your Profile',
        education: 'Level of education', educationPlaceholder: 'e.g. Bachelor / Master / Equivalent degree',
        field: 'Field of study', fieldPlaceholder: 'e.g. Agroecology, Computer Science, Management...',
        profession: 'Profession / current status', professionPlaceholder: 'e.g. Agronomist, Software Engineer, Teacher...',
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
        motivationPlaceholder: 'e.g. Describe what draws you to APTIC-R\'s mission in Togo (Agbélouvé projects, skills transfer, sustainable impact)...',
        charsRemaining: 'characters remaining',
        expTitle: 'Your Experience',
        expDesc: 'Tell us about a project you have worked on — technical, collaborative, or community-oriented.',
        expLabel: 'Describe a project you are proud of',
        expPlaceholder: 'e.g. Share a concrete technical project, community initiative, or associative work you have accomplished...',
        docsTitle: 'Documents',
        cv: 'CV / Résumé',
        coverLetter: 'Cover Letter / Lettre de motivation',
        portfolio: 'Portfolio',
        sourceTitle: 'How did you hear about APTIC-R? (Optional)',
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
    partner: {
      success: {
        title: 'Partnership request sent.',
        thanks: 'Thank you, ',
        received: '! Your partnership request has been received by APTIC-R.',
        review: 'We will review your enquiry and respond to ',
        timeframe: ' within 5 business days.',
        backHome: 'Back to Homepage'
      },
      hero: {
        tag: 'For Organizations',
        title: 'Are you a volunteer-sending organization?',
        desc: 'APTIC-R is seeking European organizations interested in developing long-term volunteer partnerships in Togo. Let\'s build something meaningful together.'
      },
      sidebar: {
        title: 'Why partner with APTIC-R?',
        reasons: [
          'Structured 6–12 month missions with clear objectives',
          'Meaningful field experience in West Africa',
          'Long-term institutional partnership',
          'Transparent reporting and follow-up',
          'Open-source documentation of all projects'
        ],
        frameworksTitle: 'Frameworks we work with'
      },
      form: {
        title: 'Partnership Request Form',
        orgName: 'Organization name',
        orgNamePlaceholder: 'e.g. XYZ Volunteer Organization',
        country: 'Country',
        website: 'Website',
        websitePlaceholder: 'https://example.org',
        contactPerson: 'Contact person',
        contactPersonPlaceholder: 'e.g. John Doe',
        email: 'Professional email',
        emailPlaceholder: 'contact@organization.org',
        orgType: 'Type of organization',
        orgTypeOptions: [
          'NGO / Association',
          'University',
          'Government agency',
          'European programme body',
          'Religious organization',
          'Other'
        ],
        volunteerCount: 'Potential number of volunteers per year',
        volunteerCountOptions: [
          '1–2', '3–5', '5–10', '10+', 'Unknown at this stage'
        ],
        targetCountries: 'Target countries of volunteers',
        targetCountriesPlaceholder: 'France, Germany, Belgium...',
        programme: 'Volunteer programme / framework',
        programmeOptions: [
          'weltwärts',
          'France Volontaires',
          'European Solidarity Corps',
          'Agir abcd',
          'SCI',
          'Internal programme',
          'University programme',
          'Other'
        ],
        message: 'Message',
        messagePlaceholder: 'Tell us about your organization, your experience sending volunteers to West Africa, and how you envision a partnership with APTIC-R...',
        doc: 'Presentation document',
        optional: '— optional',
        upload: 'Upload organization brochure or presentation',
        remove: 'Remove',
        consent: 'I consent to APTIC-R processing the information provided above for the purpose of evaluating a potential partnership. Our organization has the authority to submit this enquiry. I have read the ',
        privacy: 'privacy policy',
        submit: 'SEND PARTNERSHIP REQUEST →',
        submitting: 'Sending request...'
      },
      select: 'Select...'
    },
    footer: {
      tagline: "Association pour la Promotion des TIC en milieu Rural au Togo.",
      tagline2:
        "We connect European volunteers with rural communities to co-create practical digital and low-tech solutions.",
      nav: "Navigation",
      contact: "Contact",
      email: "Email",
      emailValue: "aptic.rural19@gmail.com",
      phone: "Phone",
      phoneValue: "+228 91 20 19 90",
      address: "Address",
      addressValue: "Agbélouvé, Togo",
      languages: "Languages",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      cookies: "Cookie Policy",
      copyright:
        "© 2026 APTIC-R - Association pour la Promotion des TIC en milieu Rural au Togo.",
    },
  },

  FR: {
    nav: {
      about: "À propos",
      mission: "La Mission",
      activities: "Activités",
      lifeInTogo: "Vie au Togo",
      apply: "Candidature",
      faq: "FAQ",
      partners: "Partenaires",
      applyNow: "POSTULEZ",
    },
    apply: {
      steps: {
        s1: 'Informations', s2: 'Profil', s3: 'Compétences', s4: 'Disponibilité', s5: 'Motivation', s6: 'Expérience', s7: 'Documents', s8: 'Source', s9: 'Vérification'
      },
      stepDescs: {
        s1: 'Vos coordonnées et informations civiles', s2: 'Votre parcours académique et compétences linguistiques', s3: 'Sélectionnez les domaines dans lesquels vous pouvez contribuer', s4: 'Période et durée souhaitées pour votre mission au Togo', s5: 'Exprimez les raisons de votre engagement avec APTIC-R', s6: 'Partagez une réalisation ou une expérience marquante', s7: 'Déposez votre CV et lettre de motivation', s8: 'Aidez-nous à savoir comment vous avez découvert le programme', s9: 'Relisez votre dossier avant de transmettre votre candidature'
      },
      sidebar: {
        progression: 'PROGRESSION',
        step: 'ÉTAPE',
        of: 'SUR',
        ofLower: 'sur',
        yourApplication: 'VOTRE CANDIDATURE',
        country: 'Pays :',
        duration: 'Durée :',
        skills: 'Compétences :',
        arrival: 'Arrivée :',
        notProvided: 'Non renseigné',
        toSpecify: 'À préciser',
        none: 'Aucune',
        selected: 'sélectionnée(s)',
        checks: {
          infoComplete: 'Informations complètes',
          profileComplete: 'Profil complété',
          skillsSelected: 'Compétences sélectionnées',
          availabilityIndicated: 'Disponibilité indiquée',
          documentsAdded: 'Documents ajoutés'
        },
        help: {
          title: 'Besoin d\'un éclairage ?',
          desc: 'Une question sur la mission, le Togo ou votre candidature ? Notre équipe vous répond avec plaisir.',
          contactBtn: 'Contacter APTIC-R'
        }
      },
      review: {
        disclaimer: 'Veuillez vérifier attentivement les détails de votre candidature ci-dessous avant transmission à la coordination APTIC-R.',
        sections: {
          contact: 'Coordonnées',
          mission: 'Mission & Disponibilité',
          docs: 'Documents'
        },
        edit: 'Modifier',
        fields: {
          name: 'Nom :', email: 'E-mail :', phone: 'Téléphone :', location: 'Pays / Ville :',
          duration: 'Durée :', arrival: 'Arrivée souhaitée :', skills: 'Compétences',
          cv: 'CV :', letter: 'Lettre :'
        },
        notProvided: 'Non renseigné',
        none: 'Aucune',
        notSent: 'Non fournie',
        consentLabel: 'J\'atteste de l\'exactitude des informations fournies et j\'accepte que l\'association APTIC-R traite mes données personnelles dans le cadre strict de l\'évaluation de ma candidature de volontariat international.'
      },
      header: {
        tag: 'CANDIDATURE VOLONTAIRE',
        title: 'Construisez votre expérience au Togo',
        desc: 'Quelques minutes suffisent pour nous présenter votre profil, vos compétences et votre motivation.',
        context: '6–12 mois · Agbélouvé, Togo · Candidature confidentielle',
        visitSite: 'Visiter le site'
      },
      progress: { step: 'Étape', of: 'sur', complete: 'complété' },
      nav: { back: 'Retour', continue: 'Continuer →', submit: 'Envoyer ma candidature →', submitting: 'ENVOI EN COURS...' },
      trust: 'Vos informations sont traitées de manière confidentielle.',
      form: {
        personalInfo: 'Informations personnelles',
        firstName: 'Prénom', firstNamePlaceholder: 'Ex: Koffi',
        lastName: 'Nom', lastNamePlaceholder: 'Ex: Mensah',
        email: 'E-mail', emailPlaceholder: 'koffi.mensah@exemple.tg',
        emailHelp: 'Nous utiliserons cette adresse pour vous contacter au sujet de votre candidature.',
        phone: 'Téléphone', phonePlaceholder: '90 12 34 56',
        country: 'Pays',
        city: 'Ville', cityPlaceholder: 'Ex: Lomé, Tsévié, Kpalimé...',
        dob: 'Date de naissance', dobHelp: 'Utilisée uniquement pour vérifier votre éligibilité au programme.',
        select: 'Sélectionner...',
        optional: '— optionnel',
        remove: 'Retirer',
        uploadTitle: 'Cliquez pour uploader ou glissez-déposez',
        uploadSubtitle: 'PDF, DOC, DOCX jusqu\'à 10Mo',
        profile: 'Votre profil',
        education: 'Niveau d\'études', educationPlaceholder: 'Ex: Licence / Master / Diplôme équivalent',
        field: 'Domaine d\'études', fieldPlaceholder: 'Ex: Agroécologie, Informatique, Gestion...',
        profession: 'Profession / statut actuel', professionPlaceholder: 'Ex: Agronome, Développeur web, Technicien...',
        experience: 'Niveau d\'expérience',
        expOptions: {
          LESS_THAN_1_YEAR: 'Moins d\'un an', ONE_TO_TWO_YEARS: '1–2 ans', TWO_TO_FIVE_YEARS: '2–5 ans', FIVE_PLUS_YEARS: '5+ ans'
        },
        digitalSkill: 'Niveau de compétences numériques',
        digitalOptions: { BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé', EXPERT: 'Expert' },
        skillsTitle: 'Vos compétences',
        skillsDesc: 'Sélectionnez toutes celles qui s\'appliquent à vous.',
        skillsSelected: 'compétences sélectionnées',
        skillSelected: 'compétence sélectionnée',
        availability: 'Votre disponibilité',
        arrivalDate: 'Date d\'arrivée souhaitée',
        duration: 'Durée de la mission',
        durationOptions: { SIX_MONTHS: '6 mois', NINE_MONTHS: '9 mois', TWELVE_MONTHS: '12 mois' },
        motivationTitle: 'Votre motivation',
        motivationDesc: 'Dites-nous avec vos propres mots pourquoi vous souhaitez devenir volontaire avec APTIC-R.',
        motivationLabel: 'Pourquoi souhaitez-vous devenir volontaire avec APTIC-R ?',
        motivationPlaceholder: 'Ex: Je souhaite mettre mes compétences au service des communautés rurales d\'Agbélouvé et soutenir les initiatives locales durablement...',
        charsRemaining: 'caractères restants',
        expTitle: 'Votre expérience',
        expDesc: 'Parlez-nous d\'un projet sur lequel vous avez travaillé — technique, collaboratif ou communautaire.',
        expLabel: 'Décrivez un projet dont vous êtes fier/fière',
        expPlaceholder: 'Ex: Présentez une action concrète, un projet communautaire, associatif ou technique dont vous êtes fier(ère)...',
        docsTitle: 'Vos documents',
        cv: 'CV / Résumé',
        coverLetter: 'Lettre de motivation',
        portfolio: 'Portfolio',
        sourceTitle: 'Comment avez-vous connu APTIC-R ? (Optionnel)',
        reviewTitle: 'Vérifiez votre candidature',
        reviewDesc: 'Veuillez vérifier vos informations avant de soumettre.',
        reviewEdit: 'Modifier',
        reviewName: 'Nom',
        reviewNotProvided: 'Non renseigné',
        reviewNotProvidedOpt: 'Non renseigné (optionnel)',
        consent: 'Je consens à ce que APTIC-R traite mes données personnelles dans le but d\'évaluer ma candidature. J\'ai lu et compris la ',
        privacyPolicy: 'politique de confidentialité',
        dataNote: 'Vos données personnelles sont traitées conformément à notre politique de confidentialité et utilisées uniquement dans le cadre de cette candidature.'
      },
      errors: {
        firstNameReq: 'Prénom obligatoire (min. 2 caractères)',
        lastNameReq: 'Nom obligatoire (min. 2 caractères)',
        emailInvalid: 'Adresse e-mail invalide',
        emailReq: 'L\'e-mail est obligatoire',
        dobReq: 'La date de naissance est obligatoire',
        countryReq: 'Veuillez sélectionner un pays.',
        skillsReq: 'Veuillez sélectionner au moins une compétence.',
        motivationLen: 'Veuillez détailler votre motivation (au moins 20 caractères).',
        motivationMax: 'La motivation ne doit pas dépasser 5000 caractères.',
        projectLen: 'Veuillez détailler votre expérience projet (au moins 20 caractères).',
        projectMax: 'L\'expérience projet ne doit pas dépasser 5000 caractères.',
        sourceReq: 'Veuillez indiquer comment vous avez connu APTIC-R.',
        consentReq: 'Veuillez accepter les conditions de traitement des données pour soumettre votre candidature.',
        submitError: 'Une erreur s\'est produite lors de la soumission.',
        min20: 'Minimum 20 caractères requis',
        max5000: 'Maximum 5000 caractères'
      },
      success: {
        ref: 'Référence : ',
        title: 'Candidature enregistrée avec succès !',
        p1_1: 'Merci, ',
        p1_2: ' ! Votre candidature a été transmise à l\'équipe de coordination d\'APTIC-R à Agbélouvé.',
        p2_1: 'Un e-mail de confirmation sera envoyé à ',
        p2_2: '. Notre équipe examinera votre candidature dans un délai d\'une à deux semaines.',
        backHome: 'Retour à l\'accueil',
        backOffice: 'Voir dans le Back-office →'
      }
    },
    partner: {
      success: {
        title: 'Demande de partenariat envoyée.',
        thanks: 'Merci, ',
        received: ' ! Votre demande de partenariat a bien été reçue par APTIC-R.',
        review: 'Nous étudierons votre demande et répondrons à ',
        timeframe: ' sous 5 jours ouvrés.',
        backHome: 'Retour à l\'accueil'
      },
      hero: {
        tag: 'Pour les organisations',
        title: 'Êtes-vous une organisation d\'envoi de volontaires ?',
        desc: 'APTIC-R recherche des organisations européennes intéressées par le développement de partenariats de volontariat à long terme au Togo. Construisons ensemble quelque chose de porteur de sens.'
      },
      sidebar: {
        title: 'Pourquoi devenir partenaire d\'APTIC-R ?',
        reasons: [
          'Missions structurées de 6 à 12 mois avec des objectifs clairs',
          'Expérience de terrain enrichissante en Afrique de l\'Ouest',
          'Partenariat institutionnel à long terme',
          'Rapports et suivi transparents',
          'Documentation open-source de tous les projets'
        ],
        frameworksTitle: 'Dispositifs avec lesquels nous travaillons'
      },
      form: {
        title: 'Formulaire de demande de partenariat',
        orgName: 'Nom de l\'organisation',
        orgNamePlaceholder: 'Ex: Organisation de Volontaires XYZ',
        country: 'Pays',
        website: 'Site web',
        websitePlaceholder: 'https://example.org',
        contactPerson: 'Personne de contact',
        contactPersonPlaceholder: 'Ex: Jean Dupont',
        email: 'E-mail professionnel',
        emailPlaceholder: 'contact@organisation.org',
        orgType: 'Type d\'organisation',
        orgTypeOptions: [
          'ONG / Association',
          'Université',
          'Agence gouvernementale',
          'Organisme de programme européen',
          'Organisation religieuse',
          'Autre'
        ],
        volunteerCount: 'Nombre potentiel de volontaires par an',
        volunteerCountOptions: [
          '1–2', '3–5', '5–10', '10+', 'Inconnu à ce stade'
        ],
        targetCountries: 'Pays cibles des volontaires',
        targetCountriesPlaceholder: 'France, Allemagne, Belgique...',
        programme: 'Programme de volontariat / dispositif',
        programmeOptions: [
          'weltwärts',
          'France Volontaires',
          'Corps de solidarité européen',
          'Agir abcd',
          'SCI',
          'Programme interne',
          'Programme universitaire',
          'Autre'
        ],
        message: 'Message',
        messagePlaceholder: 'Parlez-nous de votre organisation, de votre expérience dans l\'envoi de volontaires en Afrique de l\'Ouest, et de la façon dont vous envisagez un partenariat avec APTIC-R...',
        doc: 'Document de présentation',
        optional: '— optionnel',
        upload: 'Ajouter une brochure ou présentation',
        remove: 'Supprimer',
        consent: 'Je consens à ce que APTIC-R traite les informations fournies ci-dessus dans le but d\'évaluer un partenariat potentiel. Notre organisation a l\'autorité pour soumettre cette demande. J\'ai lu la ',
        privacy: 'politique de confidentialité',
        submit: 'ENVOYER LA DEMANDE DE PARTENARIAT →',
        submitting: 'Envoi en cours...'
      },
      select: 'Sélectionner...'
    },
    hero: {
      badge: "Agbélouvé, Togo · 6-12 mois · Candidatures ouvertes",
      line1: "Volontaire au Togo.",
      line2: "Bâtissez la technologie",
      line3: "pour les communautés rurales.",
      desc: "Rejoignez APTIC-R et travaillez avec les communautés rurales pour développer des solutions numériques et low-tech pratiques pour l'agriculture, l'éducation et l'entrepreneuriat local.",
      cta1: "POSTULEZ MAINTENANT",
      cta2: "DÉCOUVRIR LA MISSION",
      stat1Label: "6-12 mois",
      stat1Sub: "Durée de mission",
      stat2Label: "Agbélouvé",
      stat2Sub: "Togo, Afrique de l'Ouest",
      stat3Label: "FR · EN · DE",
      stat3Sub: "Langues",
    },
    dualPath: {
      tagLine: "CHOISISSEZ VOTRE VOIE",
      titleLine: "Comment souhaitez-vous vous engager ?",
      volunteerTag: "Pour les Volontaires",
      volunteerTitle: "Je veux devenir volontaire",
      volunteerDesc:
        "Étudiants, diplômés, jeunes professionnels. Postulez pour une mission de 6 à 12 mois au Togo et travaillez directement avec les communautés rurales.",
      volunteerCta: "POSTULEZ DÈS MAINTENANT",
      orgTag: "Pour les Organisations",
      orgTitle: "Je représente une organisation",
      orgDesc:
        "Organisations européennes d'envoi de volontaires. Explorez un partenariat de long terme pour envoyer des volontaires chez APTIC-R au Togo.",
      orgCta: "DEVENEZ PARTENAIRE",
    },
    whyMission: {
      tag: "Pourquoi APTIC-R",
      title: "Pourquoi faire du bénévolat avec APTIC-R ?",
      cards: [
        {
          title: "Impact rural",
          desc: "Travaillez directement avec les communautés rurales d'Agbélouvé. Vos contributions résolvent des problèmes réels qui affectent la vie quotidienne.",
        },
        {
          title: "Innovation numérique",
          desc: "Utilisez la technologie pour résoudre des défis concrets. Des systèmes SMS aux applications hors ligne - trouvez des solutions créatives qui fonctionnent vraiment.",
        },
        {
          title: "Technologie simple",
          desc: "Concevez des solutions abordables, réparables et accessibles. L'innovation n'a pas besoin d'être complexe - elle doit être utile.",
        },
        {
          title: "Échange culturel",
          desc: "Découvrez le Togo tout en apprenant auprès des communautés locales. Construisez des liens durables qui transcendent les frontières professionnelles.",
        },
      ],
    },
    challenge: {
      tag: "Le Défi",
      title: "La technologie devrait être accessible à tous.",
      p1: "Dans de nombreuses communautés rurales, l'accès à l'information, aux outils numériques et aux technologies appropriées reste limité. APTIC-R estime que l'innovation ne doit pas toujours être complexe ou coûteuse.",
      p2: "Parfois, un simple système de SMS, une application hors ligne, un capteur à bas coût ou un programme de formation numérique peuvent faire toute la différence.",
      steps: [
        {
          tag: "PROBLÈME",
          title: "Contraintes réelles",
          text: "Les communautés rurales manquent d'outils numériques abordables, réparables et d'informations agricoles fiables.",
        },
        {
          tag: "INNOVATION",
          title: "Co-création accessible",
          text: "Co-création de solutions pragmatiques avec les agriculteurs : systèmes SMS, applis hors ligne et capteurs low-cost.",
        },
        {
          tag: "IMPACT",
          title: "Communautés autonomes",
          text: "Documentation open source et formation de relais locaux pour une appropriation durable de la technologie.",
        },
      ],
    },
    mission: {
      tag: "Votre Mission",
      title: "Ce que vous ferez sur le terrain",
      steps: [
        {
          title: "Diagnostic sur le terrain",
          desc: "Rencontrer les agriculteurs et coopératives. Comprendre les besoins locaux et les pratiques existantes avant de proposer une solution.",
        },
        {
          title: "Hackathons ruraux",
          desc: "Organiser des ateliers de co-création réunissant membres de la communauté, volontaires et innovateurs locaux.",
        },
        {
          title: "Prototypage",
          desc: "Concevoir et construire des solutions low-tech : capteurs, applications, outils SMS, ou programmes de formation adaptés au contexte local.",
        },
        {
          title: "Formation",
          desc: "Former les relais locaux. Transférer les compétences et les connaissances pour que la communauté puisse opérer les solutions de manière indépendante.",
        },
        {
          title: "Documentation open source",
          desc: "Documenter chaque solution développée dans des formats reproductibles et librement accessibles pour que d'autres communautés puissent en bénéficier.",
        },
      ],
    },
    build: {
      tag: "Projets",
      title: "Que pourriez-vous construire ?",
      featured: {
        badge: "IoT & Capteurs",
        title: "Irrigation intelligente",
        desc: "Concevoir et déployer des capteurs d'humidité low-cost pour aider les agriculteurs à optimiser l'eau en saison sèche. Fabriqué avec Arduino et des matériaux locaux.",
      },
      cards: [
        { title: "Système d'alerte météo", badge: "2G / SMS" },
        { title: "Outils mobiles hors ligne", badge: "Mobile" },
        { title: "Tableaux de bord agricoles", badge: "Data Vis" },
        { title: "Gestion des stocks", badge: "Coop Tools" },
      ],
    },
    profiles: {
      tag: "Profils recherchés",
      title: "Et si c'était vous ?",
      subtitle:
        "Nous accueillons des volontaires de tous horizons. Ce qui compte le plus : la curiosité, l'adaptabilité et l'envie de contribuer.",
      cta: "VÉRIFIER MON ÉLIGIBILITÉ",
      categories: [
        {
          title: "Numérique & IT",
          tags: "Informatique · Développement Web · Mobile · Data · Cybersécurité",
        },
        {
          title: "Agriculture",
          tags: "Agronomie · Agriculture · Environnement · Développement rural",
        },
        {
          title: "Créatif",
          tags: "Design UI/UX · Graphisme · Création de contenu · Communication",
        },
        {
          title: "Ingénierie / Fabrication",
          tags: "Mécanique · Électronique · IoT · Énergie solaire · Menuiserie",
        },
      ],
    },
    eligibility: {
      title: "Vérifiez votre éligibilité",
      q1: "Votre domaine correspond-il à l'un des profils recherchés ?",
      q2: "Êtes-vous disponible pour une mission de 6 à 12 mois ?",
      q3: "Êtes-vous prêt à travailler directement avec des communautés rurales ?",
      q4: "Êtes-vous intéressé par une expérience au Togo ?",
      q5: "Avez-vous envie d'apprendre et de travailler en équipe ?",
      successMsg: "Votre profil semble correspondre à la mission.",
      cta: "COMMENCER VOTRE CANDIDATURE",
    },
    notExpert: {
      title: "Vous n'êtes pas obligé de tout savoir.",
      subtitle: "Il suffit d'avoir envie d'apprendre.",
      cta: "POSTULEZ MAINTENANT",
      qualities: ["CURIEUX", "AUTONOME", "PATIENT", "CRÉATIF", "OUVERT", "ESPRIT D'ÉQUIPE", "TERRAIN"],
    },
    week: {
      tag: "Rythme hebdomadaire",
      title: "Une semaine avec APTIC-R",
      dayLabels: ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"],
      days: [
        {
          activity: "Innovation numérique",
          desc: "Atelier matinal sur les besoins numériques locaux. Sessions de cartographie avec des représentants de la communauté.",
        },
        {
          activity: "Visite sur le terrain",
          desc: "Visite des agriculteurs, coopératives, écoles. Observer, écouter, comprendre les réalités locales.",
        },
        {
          activity: "Prototypage",
          desc: "Session de fabrication pratique : construire, tester, itérer sur les solutions conçues avec la communauté.",
        },
        {
          activity: "Formation",
          desc: "Former les relais locaux sur les outils et systèmes développés pendant la semaine.",
        },
        {
          activity: "Laboratoire d'innovation rurale",
          desc: "Présentation hebdomadaire : montrer les progrès, recueillir les retours, planifier la prochaine itération.",
        },
        {
          activity: "Découverte culturelle",
          desc: "Explorer Agbélouvé et ses environs. Cours de langue, événements communautaires, immersion culturelle.",
        },
        {
          activity: "Repos",
          desc: "Temps pour la réflexion, les projets personnels, la lecture ou simplement profiter de l'environnement.",
        },
      ],
    },
    lifeInTogo: {
      tag: "Vie au Togo",
      title: "Bien plus qu'une mission de bénévolat. Une expérience de vie.",
      items: [
        {
          label: "Culture togolaise",
          desc: "Traditions riches, communautés accueillantes, tissu social authentique.",
        },
        {
          label: "Environnement tropical",
          desc: "Paysages luxuriants, climat chaud, riche biodiversité agricole.",
        },
        {
          label: "Gastronomie",
          desc: "Cuisine locale, produits frais, repas communautaires partagés.",
        },
        {
          label: "Langues",
          desc: "Français comme langue de travail, Ewé, Kabiyé et dialectes locaux.",
        },
        {
          label: "Liens humains",
          desc: "Relations profondes tissées avec les familles locales et coopératives.",
        },
        {
          label: "Découverte",
          desc: "Marchés locaux, artisanat, cérémonies et patrimoine historique.",
        },
      ],
    },
    agbelouve: {
      tag: "Votre base",
      title: "Agbélouvé, Togo",
      desc: "Une ville rurale accueillante de la Région Maritime, Agbélouvé se situe au cœur du Togo agricole. Le bureau d'APTIC-R y est installé, entouré de communautés agricoles, de coopératives locales et d'un réseau croissant d'acteurs de l'innovation numérique.",
      facts: [
        { label: "Localisation", value: "Région Maritime, Togo" },
        { label: "Environnement", value: "Climat tropical, zone agricole" },
        { label: "Accès", value: "Proche de Lomé (~80 km)" },
        { label: "Agriculture", value: "Cultures vivrières & de rente" },
        { label: "Communauté", value: "Coopératives locales actives" },
        { label: "Conditions de vie", value: "Logement fourni sur place" },
      ],
    },
    support: {
      tag: "Votre soutien",
      title: "Vous ne serez pas seul.",
      subtitle:
        "APTIC-R fournit un cadre de soutien complet à tous les volontaires tout au long de leur mission.",
      tableTitle: "Qu'est-ce qui est inclus ?",
      tableSummary: "Résumé du cadre",
      statusConfirmed: "Confirmé",
      statusPending: "En attente",
      statusVariable: "Variable",
      items: [
        { label: "Logement", value: "Fourni" },
        { label: "Repas", value: "Arrangements locaux" },
        { label: "Transport", value: "Déplacements locaux couverts" },
        { label: "Mentorat", value: "Mentor APTIC-R" },
        { label: "Communication", value: "SIM locale + Internet" },
        { label: "Sécurité", value: "Soutien sur place" },
        { label: "Santé", value: "Orientation à l'arrivée" },
        {
          label: "Accompagnement",
          value: "Soutien tout au long de la mission",
        },
      ],
      tableItems: [
        ["Durée de mission", "6 à 12 mois", "Confirmé"],
        ["Logement", "En attente de détails locaux", "En attente"],
        ["Repas", "En attente de détails locaux", "En attente"],
        ["Transport local", "En attente de détails locaux", "En attente"],
        ["Assurance", "Selon le programme", "Variable"],
        ["Voyage international", "Selon le programme", "Variable"],
        ["Visa", "Selon le programme", "Variable"],
        ["Indemnité", "Selon le programme", "Variable"],
        ["Mentorat local", "Oui - personne de contact permanente", "Confirmé"],
      ],
    },
    appProcess: {
      tag: "Comment postuler",
      title: "Le processus de candidature",
      stepLabel: "Étape",
      cta: "COMMENCER MA CANDIDATURE",
      steps: [
        {
          title: "Découvrir",
          desc: "Explorer la mission, les projets et la vie quotidienne à Agbélouvé.",
        },
        {
          title: "Postuler",
          desc: "Remplir notre formulaire de candidature en plusieurs étapes. Cela prend 15 à 20 minutes.",
        },
        {
          title: "Entretien",
          desc: "Un appel vidéo avec l'équipe APTIC-R pour mieux vous connaître.",
        },
        {
          title: "Sélection",
          desc: "Évaluation et sélection basées sur le profil, la motivation et la disponibilité.",
        },
        {
          title: "Préparation",
          desc: "Séance d'information avant le départ, préparation administrative et orientation culturelle.",
        },
        {
          title: "Bienvenue au Togo",
          desc: "Arrivée à Agbélouvé, intégration et début de votre mission.",
        },
      ],
    },
    partners: {
      titlePart1: "CRÉER DES PONTS ENTRE",
      titlePart2: "L'EUROPE ET LE TOGO",
      tag: "Partenaires européens",
      title: "PARTENARIATS\nEUROPÉENS",
      desc: "Construire des ponts à long terme\nentre l'Europe et les communautés rurales au Togo.",
      countries: ["France", "Allemagne", "Belgique", "Europe"],
      cta: "DEVENEZ PARTENAIRE",
    },
    testimonials: {
      tag: "Histoires de volontaires",
      title: "Voix du terrain",
      disclaimer:
        "Ces témoignages sont illustratifs. Contenu à valider et remplacer par APTIC-R.",
      cards: [
        {
          name: "Jonas M.",
          country: "Allemagne",
          role: "Innovation Digitale",
          quote:
            "Travailler avec les agriculteurs sur leur système d'alerte météo SMS ne ressemblait à rien de ce que j'avais fait en labo. Les vraies contraintes inspirent des solutions créatives et low-tech.",
          initials: "JM",
        },
        {
          name: "Claire D.",
          country: "France",
          role: "Tech Rurale",
          quote:
            "J'avais peur de ne pas avoir un profil assez technique. Mais APTIC-R m'a montré que la pédagogie, l'écoute et l'animation d'ateliers sont des compétences indispensables.",
          initials: "CD",
        },
        {
          name: "Thomas L.",
          country: "Belgique",
          role: "Agri Low-Tech",
          quote:
            "En tant qu'étudiant en agronomie, j'ai plus appris sur la gestion durable des sols et la collaboration communautaire en 9 mois à Agbélouvé que pendant des années d'études.",
          initials: "TL",
        },
      ],
    },
    faq: {
      tag: "FAQ",
      title: "Questions fréquentes",
      items: [
        {
          q: "Dois-je parler français ?",
          a: "Le français est la langue de travail officielle au Togo et sera très utile au quotidien. Des bases en français sont recommandées, bien que nous utilisions aussi l'anglais pour le travail technique et la collaboration internationale.",
        },
        {
          q: "Ai-je besoin d'une expérience préalable en volontariat ?",
          a: "Aucune expérience préalable n'est requise. La motivation, l'autonomie, la sensibilité culturelle et un réel désir d'apprendre avec les communautés rurales sont les éléments les plus importants.",
        },
        {
          q: "Dois-je être ingénieur informaticien ?",
          a: "Pas nécessairement. APTIC-R accueille des candidats d'horizons divers : agronomie, communication, design, sciences et ingénierie. L'innovation low-tech requiert autant de compétences pédagogiques et organisationnelles que de compétences techniques.",
        },
        {
          q: "Où vais-je vivre pendant la mission ?",
          a: "Les modalités d'hébergement à Agbélouvé sont actuellement en cours de finalisation selon le programme spécifique.",
        },
        {
          q: "Combien de temps dure une mission ?",
          a: "La durée standard des missions varie de 6 à 12 mois (ex. 6, 9 ou 12 mois) selon l'envergure du projet et la disponibilité du candidat.",
        },
        {
          q: "Qu'en est-il des vols internationaux, du visa et de l'assurance ?",
          a: "Les frais de voyage, le visa et la couverture d'assurance dépendent de la structure d'envoi et du programme partenaire européen (ex. weltwärts, Corps Européen de Solidarité).",
        },
        {
          q: "Aurai-je un mentor local à Agbélouvé ?",
          a: "Oui. Chaque volontaire international est jumelé avec un mentor local dédié d'APTIC-R pour un accompagnement continu, l'intégration culturelle et le suivi de la mission.",
        },
        {
          q: "Que se passe-t-il après avoir soumis ma candidature ?",
          a: "Les candidatures sont examinées dans un délai de 1 à 2 semaines. Les candidats retenus seront invités à un entretien vidéo en ligne avec l'équipe de coordination d'APTIC-R.",
        },
      ],
    },
    finalCta: {
      title: "Prêt à avoir un impact ?",
      p1: "Vos compétences peuvent devenir des outils précieux pour les communautés rurales.",
      p2: "Votre expérience peut devenir une opportunité pour quelqu'un d'autre.",
      p3: "Votre prochaine aventure pourrait commencer au Togo.",
      cta1: "POSTULEZ DÈS MAINTENANT",
      cta2: "DEVENEZ PARTENAIRE",
    },

    footer: {
      tagline: "Association pour la Promotion des TIC en milieu Rural au Togo.",
      tagline2:
        "Nous connectons les volontaires européens aux communautés rurales pour co-créer des solutions numériques et low-tech pratiques.",
      nav: "Navigation",
      contact: "Contact",
      email: "E-mail",
      emailValue: "aptic.rural19@gmail.com",
      phone: "Téléphone",
      phoneValue: "+228 91 20 19 90",
      address: "Adresse",
      addressValue: "Agbélouvé, Togo",
      languages: "Langues",
      privacy: "Politique de confidentialité",
      terms: "Conditions d'utilisation",
      cookies: "Politique de cookies",
      copyright:
        "© 2026 APTIC-R - Association pour la Promotion des TIC en milieu Rural au Togo.",
    },
  },

  DE: {
    nav: {
      about: "Über APTIC-R",
      mission: "Die Mission",
      activities: "Aktivitäten",
      lifeInTogo: "Leben in Togo",
      apply: "Bewerben",
      faq: "FAQ",
      partners: "Partner",
      applyNow: "BEWERBEN",
    },
    hero: {
      badge: "Agbélouvé, Togo · 6-12 Monate · Bewerbungen offen",
      line1: "Freiwillig in Togo.",
      line2: "Technologie aufbauen",
      line3: "für ländliche Gemeinschaften.",
      desc: "Treten Sie APTIC-R bei und arbeiten Sie gemeinsam mit ländlichen Gemeinschaften, um praktische digitale und Low-Tech-Lösungen für Landwirtschaft, Bildung und lokales Unternehmertum zu entwickeln.",
      cta1: "JETZT BEWERBEN",
      cta2: "MISSION ENTDECKEN",
      stat1Label: "6-12 Monate",
      stat1Sub: "Missionsdauer",
      stat2Label: "Agbélouvé",
      stat2Sub: "Togo, Westafrika",
      stat3Label: "FR · EN · DE",
      stat3Sub: "Sprachen",
    },
    dualPath: {
      tagLine: "WÄHLEN SIE IHREN WEG",
      titleLine: "Wie möchten Sie sich engagieren?",
      volunteerTag: "Für Freiwillige",
      volunteerTitle: "Ich möchte Freiwilliger werden",
      volunteerDesc:
        "Studierende, Absolventen, Berufseinsteiger. Bewerben Sie sich für eine 6-12-monatige Freiwilligenmission in Togo und arbeiten Sie direkt mit ländlichen Gemeinschaften.",
      volunteerCta: "JETZT BEWERBEN",
      orgTag: "Für Organisationen",
      orgTitle: "Ich vertrete eine Organisation",
      orgDesc:
        "Europäische Entsendeorganisationen. Erkunden Sie eine langfristige Partnerschaft zur Entsendung von Freiwilligen zu APTIC-R in Togo.",
      orgCta: "PARTNER WERDEN",
    },
    whyMission: {
      tag: "Warum APTIC-R",
      title: "Warum als Freiwilliger bei APTIC-R?",
      cards: [
        {
          title: "Ländliche Wirkung",
          desc: "Arbeiten Sie direkt mit ländlichen Gemeinschaften in Agbélouvé. Ihre Beiträge lösen echte Probleme, die das tägliche Leben beeinflussen.",
        },
        {
          title: "Digitale Innovation",
          desc: "Nutzen Sie Technologie zur Lösung konkreter Herausforderungen. Von SMS-Systemen bis zu Offline-Apps - finden Sie kreative Lösungen, die wirklich funktionieren.",
        },
        {
          title: "Einfache Technologie",
          desc: "Gestalten Sie erschwingliche, reparierbare und zugängliche Lösungen. Innovation muss nicht komplex sein - sie muss nützlich sein.",
        },
        {
          title: "Kulturaustausch",
          desc: "Entdecken Sie Togo und lernen Sie von lokalen Gemeinschaften. Bauen Sie dauerhafte Beziehungen auf, die professionelle Grenzen überschreiten.",
        },
      ],
    },
    challenge: {
      tag: "Die Herausforderung",
      title: "Technologie sollte für alle zugänglich sein.",
      p1: "In vielen ländlichen Gemeinschaften ist der Zugang zu Informationen, digitalen Werkzeugen und geeigneten Technologien noch begrenzt. APTIC-R glaubt, dass Innovation nicht immer komplex oder teuer sein muss.",
      p2: "Manchmal kann ein einfaches SMS-System, eine Offline-Anwendung, ein kostengünstiger Sensor oder ein digitales Trainingsprogramm den entscheidenden Unterschied machen.",
      steps: [
        {
          tag: "PROBLEM",
          title: "Reale Feldbedingungen",
          text: "Ländlichen Gemeinden fehlen erschwingliche, reparierbare digitale Werkzeuge und zuverlässige landwirtschaftliche Daten.",
        },
        {
          tag: "INNOVATION",
          title: "Zugängliche Co-Kreation",
          text: "Gemeinsame Entwicklung pragmatischer Lösungen mit Bauern - SMS-Systeme, Offline-Apps und Low-Cost-Sensoren.",
        },
        {
          tag: "IMPACT",
          title: "Autonome Gemeinden",
          text: "Open-Source-Dokumentation und Schulung lokaler Multiplikatoren für eine nachhaltige Nutzung der Technologie.",
        },
      ],
    },
    mission: {
      tag: "Ihre Mission",
      title: "Was Sie vor Ort tun werden",
      steps: [
        {
          title: "Felddiagnose",
          desc: "Treffen Sie Bauern und Genossenschaften. Verstehen Sie lokale Bedürfnisse, bevor eine Lösung vorgeschlagen wird.",
        },
        {
          title: "Ländliche Hackathons",
          desc: "Organisieren Sie Co-Creation-Workshops mit Gemeindemitgliedern, Freiwilligen und lokalen Innovatoren.",
        },
        {
          title: "Prototyping",
          desc: "Entwickeln und bauen Sie Low-Tech-Lösungen: Sensoren, Apps, SMS-Tools oder Schulungsprogramme.",
        },
        {
          title: "Schulung",
          desc: "Befähigen Sie lokale Vermittler. Übertragen Sie Fähigkeiten, damit die Gemeinschaft Lösungen eigenständig betreiben kann.",
        },
        {
          title: "Open-Source-Dokumentation",
          desc: "Dokumentieren Sie jede entwickelte Lösung in reproduzierbaren, frei zugänglichen Formaten.",
        },
      ],
    },
    build: {
      tag: "Projekte",
      title: "Was könnten Sie entwickeln?",
      featured: {
        badge: "IoT & Sensoren",
        title: "Intelligente Bewässerung",
        desc: "Entwurf und Einsatz kostengünstiger Feuchtigkeitssensoren zur Wasseroptimierung in der Trockenzeit. Gebaut mit Arduino und lokalen Materialien.",
      },
      cards: [
        { title: "Wetterwarnsystem", badge: "2G / SMS" },
        { title: "Offline-Mobile-Tools", badge: "Mobile" },
        { title: "Landwirtschafts-Dashboards", badge: "Data Vis" },
        { title: "Lagerverwaltung", badge: "Coop Tools" },
      ],
    },
    profiles: {
      tag: "Gesuchte Profile",
      title: "Könnten Sie das sein?",
      subtitle:
        "Wir heißen Freiwillige mit unterschiedlichsten Hintergründen willkommen. Neugier, Anpassungsfähigkeit und der Wunsch beizutragen sind am wichtigsten.",
      cta: "EIGNUNG PRÜFEN",
      categories: [
        {
          title: "Digital & IT",
          tags: "Informatik · Webentwicklung · Mobile · Data · Cybersicherheit",
        },
        {
          title: "Landwirtschaft",
          tags: "Agronomie · Landwirtschaft · Umwelt · Ländliche Entwicklung",
        },
        {
          title: "Kreativ",
          tags: "UI/UX-Design · Grafikdesign · Inhaltserstellung · Kommunikation",
        },
        {
          title: "Ingenieurwesen / Fertigung",
          tags: "Mechanik · Elektronik · IoT · Solarenergie · Holzbearbeitung",
        },
      ],
    },
    eligibility: {
      title: "Prüfen Sie Ihre Eignung",
      q1: "Passt Ihr Bereich zu einem der gesuchten Profile?",
      q2: "Stehen Sie für einen 6- bis 12-monatigen Einsatz zur Verfügung?",
      q3: "Sind Sie bereit, direkt mit ländlichen Gemeinschaften zusammenzuarbeiten?",
      q4: "Sind Sie an einer Erfahrung in Togo interessiert?",
      q5: "Sind Sie lern- und teamfähig?",
      successMsg: "Ihr Profil scheint zur Mission zu passen.",
      cta: "BEWERBUNG STARTEN",
    },
    notExpert: {
      title: "Sie müssen nicht alles wissen.",
      subtitle: "Es genügt, lernen zu wollen.",
      cta: "JETZT BEWERBEN",
      qualities: ["NEUGIERIG", "AUTONOM", "GEDULDIG", "KREATIV", "OFFEN", "TEAMPLAYER", "PRAXISORIENTIERT"],
    },
    week: {
      tag: "Wöchentlicher Rhythmus",
      title: "Eine Woche mit APTIC-R",
      dayLabels: ["MON", "DIE", "MIT", "DON", "FRE", "SAM", "SON"],
      days: [
        {
          activity: "Digitale Innovation",
          desc: "Morgenworkshop zu lokalen digitalen Bedürfnissen. Kartierungssitzungen mit Gemeindevertretern.",
        },
        {
          activity: "Feldbesuch",
          desc: "Besuch bei Bauern, Genossenschaften, Schulen. Beobachten, zuhören, lokale Realitäten verstehen.",
        },
        {
          activity: "Prototyping",
          desc: "Praktische Machersitzung: Bauen, testen und iterieren an gemeinsam entwickelten Lösungen.",
        },
        {
          activity: "Schulung",
          desc: "Lokale Vermittler in den entwickelten Tools und Systemen schulen.",
        },
        {
          activity: "Ländliches Innovationslabor",
          desc: "Wöchentliche Präsentation: Fortschritt zeigen, Feedback sammeln, nächste Iteration planen.",
        },
        {
          activity: "Kulturentdeckung",
          desc: "Agbélouvé erkunden. Sprachkurse, Gemeinschaftsveranstaltungen, kulturelle Einblicke.",
        },
        {
          activity: "Erholung",
          desc: "Zeit für Reflexion, persönliche Projekte, Lesen oder einfach die Umgebung genießen.",
        },
      ],
    },
    lifeInTogo: {
      tag: "Leben in Togo",
      title: "Mehr als ein Freiwilligeneinsatz. Eine Lebenserfahrung.",
      items: [
        {
          label: "Togolesische Kultur",
          desc: "Reiche Traditionen, gastfreundliche Gemeinschaften, authentisches soziales Gefüge.",
        },
        {
          label: "Tropische Umgebung",
          desc: "Üppige Landschaften, warmes Klima, reiche landwirtschaftliche Biodiversität.",
        },
        {
          label: "Gastronomie",
          desc: "Lokale Küche, frische Produkte, gemeinsame Mahlzeiten in der Gemeinschaft.",
        },
        {
          label: "Sprachen",
          desc: "Französisch als Arbeitssprache, Ewé, Kabiyé und lokale Dialekte.",
        },
        {
          label: "Menschliche Verbindungen",
          desc: "Tiefe Beziehungen zu lokalen Familien und Genossenschaften.",
        },
        {
          label: "Entdeckung",
          desc: "Lokale Märkte, Handwerk, Zeremonien und historisches Erbe.",
        },
      ],
    },
    agbelouve: {
      tag: "Ihr Standort",
      title: "Agbélouvé, Togo",
      desc: "Eine gastfreundliche Kleinstadt in der Küstenregion. Agbélouvé liegt im Herzen des landwirtschaftlichen Togos. Das APTIC-R-Büro befindet sich hier, umgeben von Bauerngemeinschaften, lokalen Genossenschaften und einem wachsenden Netzwerk digitaler Innovatoren.",
      facts: [
        { label: "Standort", value: "Region Maritime, Togo" },
        {
          label: "Umgebung",
          value: "Tropisches Klima, landwirtschaftliches Gebiet",
        },
        { label: "Zugang", value: "Nah an Lomé (~80 km)" },
        { label: "Landwirtschaft", value: "Subsistenz- & Nutzpflanzen" },
        { label: "Gemeinschaft", value: "Aktive lokale Genossenschaften" },
        {
          label: "Lebensbedingungen",
          value: "Unterkunft wird vor Ort gestellt",
        },
      ],
    },
    support: {
      tag: "Ihre Unterstützung",
      title: "Sie werden nicht allein sein.",
      subtitle:
        "APTIC-R bietet allen Freiwilligen während ihrer gesamten Mission ein vollständiges Unterstützungsrahmen.",
      tableTitle: "Was ist inbegriffen?",
      tableSummary: "Rahmenübersicht",
      statusConfirmed: "Bestätigt",
      statusPending: "Ausstehend",
      statusVariable: "Variabel",
      items: [
        { label: "Unterkunft", value: "Gestellt" },
        { label: "Verpflegung", value: "Lokale Vereinbarungen" },
        { label: "Transport", value: "Lokale Reisen abgedeckt" },
        { label: "Mentoring", value: "APTIC-R Mentor" },
        { label: "Kommunikation", value: "Lokale SIM + Internet" },
        { label: "Sicherheit", value: "Vor-Ort-Unterstützung" },
        { label: "Gesundheit", value: "Ankunftsorientierung" },
        { label: "Begleitung", value: "Volle Missionsunterstützung" },
      ],
      tableItems: [
        ["Missionsdauer", "6 bis 12 Monate", "Bestätigt"],
        ["Unterkunft", "Lokale Details ausstehend", "Ausstehend"],
        ["Verpflegung", "Lokale Details ausstehend", "Ausstehend"],
        ["Lokaler Transport", "Lokale Details ausstehend", "Ausstehend"],
        ["Versicherung", "Programmabhängig", "Variabel"],
        ["Internationale Reise", "Programmabhängig", "Variabel"],
        ["Visum", "Programmabhängig", "Variabel"],
        ["Taschengeld", "Programmabhängig", "Variabel"],
        ["Lokales Mentoring", "Ja - feste Kontaktperson", "Bestätigt"],
      ],
    },
    appProcess: {
      tag: "Wie bewerben",
      title: "Der Bewerbungsprozess",
      stepLabel: "Schritt",
      cta: "BEWERBUNG STARTEN",
      steps: [
        {
          title: "Entdecken",
          desc: "Erkunden Sie die Mission, die Projekte und das tägliche Leben in Agbélouvé.",
        },
        {
          title: "Bewerben",
          desc: "Füllen Sie unser mehrstufiges Bewerbungsformular aus. Es dauert 15-20 Minuten.",
        },
        {
          title: "Gespräch",
          desc: "Ein Videoanruf mit dem APTIC-R-Team, um Sie besser kennenzulernen.",
        },
        {
          title: "Auswahl",
          desc: "Bewertung und Auswahl nach Profil, Motivation und Verfügbarkeit.",
        },
        {
          title: "Vorbereitung",
          desc: "Abreiseinformation, administrative Vorbereitung und kulturelle Orientierung.",
        },
        {
          title: "Willkommen in Togo",
          desc: "Ankunft in Agbélouvé, Integration und Beginn Ihrer Mission.",
        },
      ],
    },
    partners: {
      titlePart1: "BRÜCKEN BAUEN ZWISCHEN",
      titlePart2: "EUROPA UND TOGO",
      tag: "Europäische Partner",
      title: "EUROPÄISCHE\nPARTNERSCHAFTEN",
      desc: "Langfristige Brücken bauen\nzwischen Europa und ländlichen Gemeinden in Togo.",
      countries: ["Frankreich", "Deutschland", "Belgien", "Europa"],
      cta: "PARTNER WERDEN",
    },
    testimonials: {
      tag: "Freiwilligengeschichten",
      title: "Stimmen aus dem Feld",
      disclaimer:
        "Diese Erfahrungsberichte sind illustrativ. Inhalte sind durch APTIC-R zu validieren und zu ersetzen.",
      cards: [
        {
          name: "Jonas M.",
          country: "Deutschland",
          role: "Digitale Innovation",
          quote:
            "Die Arbeit mit den Bauern an ihrem SMS-Wetterwarnsystem war anders als alles, was ich in einem Uni-Labor gemacht hatte. Reale Bedingungen inspirieren zu kreativen Low-Tech-Lösungen.",
          initials: "JM",
        },
        {
          name: "Claire D.",
          country: "Frankreich",
          role: "Ländliche Tech",
          quote:
            "Ich hatte Angst, nicht technisch genug zu sein. Aber APTIC-R hat mir gezeigt, dass Pädagogik, Zuhören und das Leiten von Workshops unverzichtbare Fähigkeiten sind.",
          initials: "CD",
        },
        {
          name: "Thomas L.",
          country: "Belgien",
          role: "Low-Tech Agri",
          quote:
            "Als Agrarstudent habe ich in 9 Monaten in Agbélouvé mehr über nachhaltiges Bodenmanagement und die Zusammenarbeit in der Gemeinschaft gelernt als während meiner gesamten Studienzeit.",
          initials: "TL",
        },
      ],
    },
    faq: {
      tag: "FAQ",
      title: "Häufig gestellte Fragen",
      items: [
        {
          q: "Muss ich Französisch sprechen?",
          a: "Französisch ist die offizielle Arbeitssprache in Togo und im Alltag sehr hilfreich. Grundkenntnisse in Französisch werden empfohlen, obwohl wir für technische Arbeiten und internationale Zusammenarbeit auch Englisch verwenden.",
        },
        {
          q: "Brauche ich vorherige Freiwilligenerfahrung?",
          a: "Es ist keine vorherige Freiwilligenerfahrung erforderlich. Motivation, Selbstständigkeit, kulturelle Sensibilität und der echte Wunsch, mit ländlichen Gemeinschaften zu lernen, sind am wichtigsten.",
        },
        {
          q: "Muss ich IT-Ingenieur sein?",
          a: "Nicht unbedingt. APTIC-R heißt Kandidaten aus verschiedenen Bereichen willkommen: Agronomie, Kommunikation, Design, Naturwissenschaften und Ingenieurwesen. Low-Tech-Innovation erfordert ebenso pädagogische und organisatorische wie technische Fähigkeiten.",
        },
        {
          q: "Wo werde ich während des Einsatzes leben?",
          a: "Die Unterbringung in Agbélouvé wird derzeit je nach spezifischem Programm finalisiert.",
        },
        {
          q: "Wie lange dauert ein Einsatz?",
          a: "Standardeinsätze dauern in der Regel 6 bis 12 Monate (z. B. 6, 9 oder 12 Monate), abhängig vom Umfang des Projekts und der Verfügbarkeit der Kandidaten.",
        },
        {
          q: "Was ist mit internationalen Flügen, Visum und Versicherung?",
          a: "Reisekosten, Visum und Versicherungsschutz hängen von der Entsendeorganisation und dem europäischen Partnerprogramm (z. B. weltwärts, Europäisches Solidaritätskorps) ab.",
        },
        {
          q: "Werde ich einen lokalen Mentor in Agbélouvé haben?",
          a: "Ja. Jeder internationale Freiwillige wird mit einem engagierten lokalen Mentor von APTIC-R für kontinuierliche Begleitung, kulturelle Integration und Einsatzbetreuung zusammengebracht.",
        },
        {
          q: "Was passiert, nachdem ich meine Bewerbung eingereicht habe?",
          a: "Bewerbungen werden innerhalb von 1 bis 2 Wochen geprüft. Ausgewählte Kandidaten werden zu einem Online-Video-Interview mit dem Koordinationsteam von APTIC-R eingeladen.",
        },
      ],
    },
    finalCta: {
      title: "Bereit, etwas zu bewirken?",
      p1: "Ihre Fähigkeiten können zu wertvollen Werkzeugen für ländliche Gemeinschaften werden.",
      p2: "Ihre Erfahrung kann zu einer Chance für jemand anderen werden.",
      p3: "Ihr nächstes Abenteuer könnte in Togo beginnen.",
      cta1: "JETZT BEWERBEN",
      cta2: "PARTNER WERDEN",
    },

    apply: {
      steps: {
        s1: 'Persönliche Infos', s2: 'Profil', s3: 'Fähigkeiten', s4: 'Verfügbarkeit', s5: 'Motivation', s6: 'Erfahrung', s7: 'Dokumente', s8: 'Quelle', s9: 'Zusammenfassung'
      },
      header: {
        tag: 'Bewerbung als Freiwilliger',
        title: 'Sammeln Sie Erfahrung in Togo',
        desc: 'Diese Bewerbung dauert etwa 15-20 Minuten. Alle Informationen werden vertraulich behandelt.',
        context: 'Agbélouvé, Togo · 6–12 Monate · Vertrauliche Bewerbung',
        visitSite: 'Zur Website'
      },
      progress: { step: 'Schritt', of: 'von', complete: 'abgeschlossen' },
      nav: { back: 'Zurück', continue: 'Weiter', submit: 'Bewerbung senden', submitting: 'Wird gesendet...' },
      trust: 'Ihre Daten werden vertraulich behandelt.',
      form: {
        personalInfo: 'Persönliche Informationen',
        firstName: 'Vorname', firstNamePlaceholder: 'z. B. Koffi',
        lastName: 'Nachname', lastNamePlaceholder: 'z. B. Mensah',
        email: 'E-Mail', emailPlaceholder: 'koffi.mensah@example.com',
        emailHelp: 'Wir verwenden diese Adresse, um Sie zu kontaktieren.',
        phone: 'Telefon', phonePlaceholder: '90 12 34 56',
        country: 'Land',
        city: 'Stadt', cityPlaceholder: 'z. B. Lomé, Tsévié...',
        dob: 'Geburtsdatum',
        dobHelp: 'Sie müssen zu Beginn des Einsatzes mindestens 18 Jahre alt sein.',
        select: 'Auswählen...',
        optional: '— optional',
        remove: 'Entfernen',
        uploadTitle: 'Klicken zum Hochladen oder Drag & Drop',
        uploadSubtitle: 'PDF, DOC, DOCX bis zu 10MB',
        profile: 'Ihr Profil',
        education: 'Bildungsabschluss', educationPlaceholder: 'z. B. Bachelor / Master / Diplom',
        field: 'Studienfach', fieldPlaceholder: 'z. B. Agrarökologie, Informatik...',
        profession: 'Beruf / Aktueller Status', professionPlaceholder: 'z. B. Agrarwissenschaftler, Webentwickler...',
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
        motivationPlaceholder: 'z. B. Erläutern Sie Ihre Motivation für den Einsatz bei APTIC-R in Togo (Agbélouvé, ländliche Projekte, Wissenstransfer)...',
        charsRemaining: 'Zeichen verbleibend',
        expTitle: 'Ihre Erfahrung',
        expDesc: 'Erzählen Sie uns von einem Projekt, an dem Sie gearbeitet haben — technisch, kollaborativ oder gemeinschaftsorientiert.',
        expLabel: 'Beschreiben Sie ein Projekt, auf das Sie stolz sind',
        expPlaceholder: 'z. B. Beschreiben Sie ein konkretes Projekt oder eine Initiative...',
        docsTitle: 'Dokumente',
        cv: 'Lebenslauf (CV)',
        coverLetter: 'Motivationsschreiben',
        portfolio: 'Portfolio',
        sourceTitle: 'Wie haben Sie von APTIC-R erfahren? (Optional)',
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
    partner: {
      success: {
        title: "Partnerschaftsanfrage gesendet.",
        thanks: "Vielen Dank, ",
        received: "! Ihre Partnerschaftsanfrage ist bei APTIC-R eingegangen.",
        review: "Wir werden Ihre Anfrage prüfen und uns innerhalb von 5 Werktagen unter ",
        timeframe: " bei Ihnen melden.",
        backHome: "Zurück zur Startseite"
      },
      hero: {
        tag: "Für Organisationen",
        title: "Sind Sie eine Entsendeorganisation für Freiwillige?",
        desc: "APTIC-R sucht europäische Organisationen, die an einer langfristigen Partnerschaft für Freiwilligeneinsätze in Togo interessiert sind. Lassen Sie uns gemeinsam etwas Sinnvolles aufbauen."
      },
      sidebar: {
        title: "Warum Partner von APTIC-R werden?",
        reasons: [
          "Strukturierte 6- bis 12-monatige Einsätze mit klaren Zielen",
          "Bedeutungsvolle Praxiserfahrung in Westafrika",
          "Langfristige institutionelle Partnerschaft",
          "Transparente Berichterstattung und Begleitung",
          "Open-Source-Dokumentation aller Projekte"
        ],
        frameworksTitle: "Programme, mit denen wir zusammenarbeiten"
      },
      form: {
        title: "Formular für Partnerschaftsanfragen",
        orgName: "Name der Organisation",
        orgNamePlaceholder: "z. B. XYZ Freiwilligenorganisation",
        country: "Land",
        website: "Webseite",
        websitePlaceholder: "https://example.org",
        contactPerson: "Ansprechpartner/in",
        contactPersonPlaceholder: "z. B. Max Mustermann",
        email: "Geschäftliche E-Mail",
        emailPlaceholder: "kontakt@organisation.org",
        orgType: "Art der Organisation",
        orgTypeOptions: [
          "NGO / Verein",
          "Universität / Hochschule",
          "Staatliche Einrichtung",
          "Europäisches Programm",
          "Religiöse Organisation",
          "Andere"
        ],
        volunteerCount: "Mögliche Anzahl von Freiwilligen pro Jahr",
        volunteerCountOptions: [
          "1–2", "3–5", "5–10", "10+", "Zu diesem Zeitpunkt noch unbekannt"
        ],
        targetCountries: "Zielländer der Freiwilligen",
        targetCountriesPlaceholder: "Deutschland, Frankreich, Belgien...",
        programme: "Freiwilligenprogramm / Rahmenwerk",
        programmeOptions: [
          "weltwärts",
          "France Volontaires",
          "Europäisches Solidaritätskorps",
          "Agir abcd",
          "SCI",
          "Internes Programm",
          "Universitäres Programm",
          "Anderes"
        ],
        message: "Nachricht",
        messagePlaceholder: "Erzählen Sie uns von Ihrer Organisation, Ihrer Erfahrung mit Freiwilligen in Westafrika und wie Sie sich eine Partnerschaft mit APTIC-R vorstellen...",
        doc: "Präsentationsdokument",
        optional: "— optional",
        upload: "Broschüre oder Präsentation der Organisation hochladen",
        remove: "Entfernen",
        consent: "Ich bin damit einverstanden, dass APTIC-R die oben gemachten Angaben zur Bewertung einer potenziellen Partnerschaft verarbeitet. Ich habe die ",
        privacy: "Datenschutzerklärung",
        submit: "PARTNERSCHAFTSANFRAGE SENDEN →",
        submitting: "Anfrage wird gesendet..."
      },
      select: "Auswählen..."
    },

    footer: {
      tagline: "Association pour la Promotion des TIC en milieu Rural au Togo.",
      tagline2:
        "Wir verbinden europäische Freiwillige mit ländlichen Gemeinschaften, um praktische digitale und Low-Tech-Lösungen gemeinsam zu entwickeln.",
      nav: "Navigation",
      contact: "Kontakt",
      email: "E-Mail",
      emailValue: "aptic.rural19@gmail.com",
      phone: "Telefon",
      phoneValue: "+228 91 20 19 90",
      address: "Adresse",
      addressValue: "Agbélouvé, Togo",
      languages: "Sprachen",
      privacy: "Datenschutzerklärung",
      terms: "Nutzungsbedingungen",
      cookies: "Cookie-Richtlinie",
      copyright:
        "© 2026 APTIC-R - Association pour la Promotion des TIC en milieu Rural au Togo.",
    },
  },
} as const

export default translations
