import {
  renderEmailHead,
  renderEmailHeader,
  renderEmailFooter,
} from "./emailTheme"

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
      subject: `Confirmation de candidature APTIC-R - Réf. ${referenceNumber}`,
      greeting: `Bonjour ${firstName},`,
      intro: "Nous avons bien reçu votre dossier de candidature pour le Programme de Volontariat International de l'association APTIC-R à Agbélouvé (Togo).",
      refLabel: "Votre référence de dossier",
      summaryTitle: "Récapitulatif de votre demande :",
      fieldCandidate: "Candidat",
      fieldArrival: "Date d'arrivée souhaitée",
      fieldDuration: "Durée de mission",
      nextStepsTitle: "Prochaines étapes :",
      step1: "1. Notre équipe de coordination étudie votre profil et vos compétences sous 5 à 7 jours ouvrés.",
      step2: "2. Nous vous recontacterons par e-mail afin de convenir d'un échange vidéo.",
      step3: "3. Si votre candidature est retenue, nous préparerons ensemble votre convention d'engagement et votre mission sur place.",
      reminder: "Conservez précieusement votre référence pour toute correspondance.",
    },
    EN: {
      subject: `Application Confirmation APTIC-R - Ref. ${referenceNumber}`,
      greeting: `Dear ${firstName},`,
      intro: "We have safely received your application for the APTIC-R International Volunteer Program in Agbélouvé, Togo.",
      refLabel: "Your application reference",
      summaryTitle: "Summary of your application:",
      fieldCandidate: "Applicant",
      fieldArrival: "Preferred arrival date",
      fieldDuration: "Mission duration",
      nextStepsTitle: "Next steps:",
      step1: "1. The coordination team is reviewing your profile and skills within 5 to 7 business days.",
      step2: "2. We will contact you by email to schedule an introductory video interview.",
      step3: "3. Once selected, we will prepare your volunteer agreement and mission onboarding.",
      reminder: "Please keep this reference number for all future communications.",
    },
    DE: {
      subject: `Bestätigung Ihrer Bewerbung APTIC-R - Ref. ${referenceNumber}`,
      greeting: `Hallo ${firstName},`,
      intro: "Wir haben Ihre Bewerbung für den internationalen Freiwilligendienst des Vereins APTIC-R in Agbélouvé (Togo) erhalten.",
      refLabel: "Ihre Referenznummer",
      summaryTitle: "Zusammenfassung Ihrer Angaben:",
      fieldCandidate: "Bewerber(in)",
      fieldArrival: "Gewünschtes Anreisedatum",
      fieldDuration: "Geplante Dauer",
      nextStepsTitle: "Nächste Schritte:",
      step1: "1. Unser Koordinationsteam prüft Ihre Bewerbung innerhalb von 5 bis 7 Werktagen.",
      step2: "2. Wir melden uns per E-Mail zur Vereinbarung eines Video-Kennenlerngesprächs.",
      step3: "3. Nach Zusage bereiten wir gemeinsam Ihre Einsatzvereinbarung vor.",
      reminder: "Bitte bewahren Sie diese Referenznummer für alle Rückfragen auf.",
    },
  }[currentLang as "FR" | "EN" | "DE"] || {
    subject: `Confirmation de candidature APTIC-R - Réf. ${referenceNumber}`,
    greeting: `Bonjour ${firstName},`,
    intro: "Nous avons bien reçu votre dossier de candidature pour le Programme de Volontariat International d'APTIC-R.",
    refLabel: "Votre référence de dossier",
    summaryTitle: "Récapitulatif de votre demande :",
    fieldCandidate: "Candidat",
    fieldArrival: "Date d'arrivée souhaitée",
    fieldDuration: "Durée de mission",
    nextStepsTitle: "Prochaines étapes :",
    step1: "1. Examen de votre dossier sous 5 à 7 jours ouvrés.",
    step2: "2. Prise de contact par e-mail pour un entretien vidéo.",
    step3: "3. Préparation conjointe de votre mission.",
    reminder: "Conservez précieusement votre référence.",
  }

  const html = `
<!DOCTYPE html>
<html lang="${currentLang.toLowerCase()}">
${renderEmailHead(copy.subject)}
<body style="margin: 0; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #183247;">
  <div style="max-width: 580px; margin: 0 auto;" class="email-wrap">
    ${renderEmailHeader()}

    <p style="margin: 0 0 16px 0;">${copy.greeting}</p>

    <p style="margin: 0 0 16px 0;">${copy.intro}</p>

    <p style="margin: 0 0 16px 0;">
      ${copy.refLabel} : <strong>${referenceNumber}</strong>
    </p>

    <p style="margin: 20px 0 6px 0; font-weight: 600;">
      ${copy.summaryTitle}
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px;">
      <li style="margin-bottom: 4px;">${copy.fieldCandidate} : ${firstName} ${lastName}</li>
      ${arrivalDate ? `<li style="margin-bottom: 4px;">${copy.fieldArrival} : ${arrivalDate}</li>` : ""}
      ${duration ? `<li style="margin-bottom: 4px;">${copy.fieldDuration} : ${duration}</li>` : ""}
    </ul>

    <p style="margin: 20px 0 6px 0; font-weight: 600;">
      ${copy.nextStepsTitle}
    </p>
    <p style="margin: 0 0 8px 0;">${copy.step1}</p>
    <p style="margin: 0 0 8px 0;">${copy.step2}</p>
    <p style="margin: 0 0 16px 0;">${copy.step3}</p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #5E6B76;" class="muted-text">
      ${copy.reminder}
    </p>

    ${renderEmailFooter()}
  </div>
</body>
</html>
  `.trim()

  const text = `
${copy.subject}
==================================================

${copy.greeting}

${copy.intro}

${copy.refLabel} : ${referenceNumber}

${copy.summaryTitle}
- ${copy.fieldCandidate} : ${firstName} ${lastName}
${arrivalDate ? `- ${copy.fieldArrival} : ${arrivalDate}\n` : ""}${duration ? `- ${copy.fieldDuration} : ${duration}\n` : ""}
${copy.nextStepsTitle}
${copy.step1}
${copy.step2}
${copy.step3}

${copy.reminder}

--
Coordination du Programme de Volontariat International
Association APTIC-R · Agbélouvé, Région Maritime, Togo
Tél. / WhatsApp : +228 91 20 19 90
Email : aptic.rural19@gmail.com
  `.trim()

  return { subject: copy.subject, html, text }
}
