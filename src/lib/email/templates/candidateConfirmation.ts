interface CandidateEmailParams {
  firstName: string
  lastName: string
  referenceNumber: string
  arrivalDate?: string
  duration?: string
  lang?: "FR" | "EN" | "DE"
}

export function renderCandidateConfirmationEmail({
  firstName,
  lastName,
  referenceNumber,
  arrivalDate,
  duration,
  lang = "FR",
}: CandidateEmailParams): { subject: string; html: string; text: string } {
  const currentLang = (lang || "FR").toUpperCase()

  const copy = {
    FR: {
      subject: `Confirmation de candidature APTIC-R [Réf: ${referenceNumber}]`,
      greeting: `Bonjour ${firstName},`,
      title: "Candidature reçue avec succès",
      subtitle: "Programme de Volontariat International au Togo",
      thankYou: "Nous vous remercions chaleureusement pour votre engagement et votre candidature auprès de l'association APTIC-R.",
      refLabel: "Votre référence unique de dossier",
      detailsTitle: "Récapitulatif de votre demande",
      fieldCandidate: "Candidat",
      fieldDate: "Arrivée souhaitée",
      fieldDuration: "Durée de mission",
      stepsTitle: "Prochaines étapes de votre sélection",
      step1: "1. Examen attentif de votre profil et de vos compétences par l'équipe de coordination (5 à 7 jours ouvrés).",
      step2: "2. Prise de contact par e-mail pour planifier un entretien vidéo de motivation et de cadrage.",
      step3: "3. Élaboration conjointe de votre convention d'engagement et préparation de votre départ à Agbélouvé.",
      advice: "Conservez précieusement cette référence pour toute correspondance avec nos équipes.",
      footerNote: "APTIC-R · Association de Promotion des Technologies de l'Information et de la Communication en milieu Rural · Agbélouvé, Région Maritime, Togo.",
    },
    EN: {
      subject: `APTIC-R Volunteer Application Confirmation [Ref: ${referenceNumber}]`,
      greeting: `Dear ${firstName},`,
      title: "Application Received Successfully",
      subtitle: "International Volunteer Program in Togo",
      thankYou: "Thank you very much for your commitment and application with the APTIC-R association.",
      refLabel: "Your unique application reference",
      detailsTitle: "Summary of your application",
      fieldCandidate: "Candidate",
      fieldDate: "Preferred arrival date",
      fieldDuration: "Mission duration",
      stepsTitle: "Next steps in your selection process",
      step1: "1. Thorough review of your profile and skills by the coordination team (5 to 7 business days).",
      step2: "2. Contact via email to schedule a video interview to discuss your motivation.",
      step3: "3. Preparation of your volunteer agreement and mission onboarding in Agbélouvé.",
      advice: "Please keep this reference number for any inquiries or correspondence with our team.",
      footerNote: "APTIC-R · Association for the Promotion of ICT in Rural Areas · Agbélouvé, Maritime Region, Togo.",
    },
    DE: {
      subject: `Bestätigung Ihrer APTIC-R Bewerbung [Ref: ${referenceNumber}]`,
      greeting: `Hallo ${firstName},`,
      title: "Bewerbung erfolgreich eingegangen",
      subtitle: "Internationaler Freiwilligendienst in Togo",
      thankYou: "Vielen Dank für Ihr Engagement und Ihre Bewerbung beim Verein APTIC-R.",
      refLabel: "Ihre persönliche Referenznummer",
      detailsTitle: "Zusammenfassung Ihrer Angaben",
      fieldCandidate: "Bewerber(in)",
      fieldDate: "Gewünschtes Anreisedatum",
      fieldDuration: "Einsatzdauer",
      stepsTitle: "Nächste Schritte im Auswahlverfahren",
      step1: "1. Sorgfältige Prüfung Ihrer Unterlagen durch das Koordinationsteam (5 bis 7 Werktage).",
      step2: "2. Kontaktaufnahme per E-Mail zur Vereinbarung eines Video-Kennenlerngesprächs.",
      step3: "3. Gemeinsame Vorbereitung Ihrer Einsatzvereinbarung und Ihres Aufenthalts in Agbélouvé.",
      advice: "Bitte bewahren Sie diese Referenznummer für alle weiteren Rückfragen auf.",
      footerNote: "APTIC-R · Verein zur Förderung von IKT im ländlichen Raum · Agbélouvé, Region Maritime, Togo.",
    },
  }[currentLang as "FR" | "EN" | "DE"] || {
    subject: `Confirmation de candidature APTIC-R [Réf: ${referenceNumber}]`,
    greeting: `Bonjour ${firstName},`,
    title: "Candidature reçue avec succès",
    subtitle: "Programme de Volontariat International au Togo",
    thankYou: "Nous vous remercions chaleureusement pour votre engagement et votre candidature auprès de l'association APTIC-R.",
    refLabel: "Votre référence unique de dossier",
    detailsTitle: "Récapitulatif de votre demande",
    fieldCandidate: "Candidat",
    fieldDate: "Arrivée souhaitée",
    fieldDuration: "Durée de mission",
    stepsTitle: "Prochaines étapes de votre sélection",
    step1: "1. Examen attentif de votre profil par l'équipe de coordination (5 à 7 jours ouvrés).",
    step2: "2. Prise de contact par e-mail pour planifier un entretien vidéo.",
    step3: "3. Élaboration de la convention et préparation de votre mission à Agbélouvé.",
    advice: "Conservez cette référence pour toute correspondance.",
    footerNote: "APTIC-R · Agbélouvé, Togo.",
  }

  const html = `
<!DOCTYPE html>
<html lang="${currentLang.toLowerCase()}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #174F7A 0%, #0F3554 100%); padding: 32px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">APTIC-R</div>
              <div style="color: #94A3B8; font-size: 13px; font-weight: 500; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Volontariat International</div>
            </td>
          </tr>

          <!-- Hero Body -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0F172A;">${copy.title}</h1>
              <div style="color: #35A85A; font-size: 14px; font-weight: 600; margin-bottom: 20px;">${copy.subtitle}</div>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">${copy.greeting}</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155;">${copy.thankYou}</p>

              <!-- Reference Badge Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px;">${copy.refLabel}</div>
                    <div style="font-size: 24px; font-weight: 800; font-family: monospace; color: #174F7A; margin-top: 6px; letter-spacing: 1.5px;">${referenceNumber}</div>
                  </td>
                </tr>
              </table>

              <!-- Details Summary -->
              <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${copy.detailsTitle}</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 28px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500; width: 40%;">${copy.fieldCandidate}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${firstName} ${lastName}</td>
                </tr>
                ${arrivalDate ? `
                <tr style="border-bottom: 1px solid #F1F5F9; background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">${copy.fieldDate}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${arrivalDate}</td>
                </tr>` : ''}
                ${duration ? `
                <tr>
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">${copy.fieldDuration}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${duration}</td>
                </tr>` : ''}
              </table>

              <!-- Next Steps -->
              <div style="background-color: #EFF6FF; border-left: 4px solid #174F7A; border-radius: 0 8px 8px 0; padding: 18px 20px; margin-bottom: 24px;">
                <div style="font-size: 14px; font-weight: 700; color: #174F7A; margin-bottom: 10px;">${copy.stepsTitle}</div>
                <div style="font-size: 13.5px; color: #1E293B; margin-bottom: 8px;">${copy.step1}</div>
                <div style="font-size: 13.5px; color: #1E293B; margin-bottom: 8px;">${copy.step2}</div>
                <div style="font-size: 13.5px; color: #1E293B;">${copy.step3}</div>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748B; font-style: italic;">${copy.advice}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8;">
              ${copy.footerNote}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
${copy.title} - ${copy.subtitle}
--------------------------------------------------

${copy.greeting}

${copy.thankYou}

${copy.refLabel} : ${referenceNumber}

${copy.detailsTitle} :
- ${copy.fieldCandidate} : ${firstName} ${lastName}
${arrivalDate ? `- ${copy.fieldDate} : ${arrivalDate}\n` : ''}${duration ? `- ${copy.fieldDuration} : ${duration}\n` : ''}
${copy.stepsTitle} :
${copy.step1}
${copy.step2}
${copy.step3}

${copy.advice}

--
${copy.footerNote}
  `.trim()

  return { subject: copy.subject, html, text }
}
