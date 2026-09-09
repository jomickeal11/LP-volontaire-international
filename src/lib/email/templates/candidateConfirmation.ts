import {
  renderEmailHead,
  renderEmailHeader,
  renderReferenceBox,
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
      subject: `Confirmation de réception de candidature APTIC-R [${referenceNumber}]`,
      greeting: `Bonjour ${firstName},`,
      title: "Confirmation de votre candidature",
      subtitle: "Programme de Volontariat International au Togo",
      intro: "Nous accusons réception de votre dossier de candidature au programme de volontariat international de l'association APTIC-R à Agbélouvé (Togo).",
      refLabel: "Numéro de référence de votre dossier",
      summaryTitle: "Récapitulatif de votre demande",
      fieldCandidate: "Candidat",
      fieldArrival: "Date d'arrivée souhaitée",
      fieldDuration: "Durée envisagée",
      nextStepsTitle: "Modalités d'instruction",
      step1: "1. Examen attentif de vos compétences et motivations par l'équipe de coordination (5 à 7 jours ouvrés).",
      step2: "2. Prise de contact par e-mail afin de convenir d'un entretien vidéo de présentation réciproque.",
      step3: "3. En cas de sélection, transmission de la convention d'engagement et des détails logistiques d'accueil.",
      reminder: "Merci de conserver précieusement cette référence pour toute future communication avec notre équipe.",
      footerNote: "Association APTIC-R · Agbélouvé, Région Maritime, Togo · Récépissé de déclaration N° 1245/MATDCL-DAPL-DOCA.",
    },
    EN: {
      subject: `Confirmation of Application Receipt - APTIC-R [${referenceNumber}]`,
      greeting: `Dear ${firstName},`,
      title: "Application Receipt Confirmation",
      subtitle: "International Volunteer Program in Togo",
      intro: "We hereby confirm the receipt of your application for the APTIC-R international volunteer program in Agbélouvé, Togo.",
      refLabel: "Application Reference Number",
      summaryTitle: "Summary of Information",
      fieldCandidate: "Applicant",
      fieldArrival: "Preferred Arrival Date",
      fieldDuration: "Proposed Duration",
      nextStepsTitle: "Review Process",
      step1: "1. Thorough assessment of your profile and motivation by the coordination committee (5 to 7 business days).",
      step2: "2. Email contact to arrange an introductory video interview.",
      step3: "3. Upon mutual agreement, issuance of the volunteer agreement and logistical onboarding guidance.",
      reminder: "Please retain this reference number for all future correspondence with our team.",
      footerNote: "APTIC-R Association · Agbélouvé, Maritime Region, Togo · Official Non-profit Registration N° 1245/MATDCL-DAPL-DOCA.",
    },
    DE: {
      subject: `Eingangsbestätigung Ihrer Bewerbung - APTIC-R [${referenceNumber}]`,
      greeting: `Hallo ${firstName},`,
      title: "Bestätigung Ihrer Bewerbung",
      subtitle: "Internationaler Freiwilligendienst in Togo",
      intro: "Wir bestätigen den Eingang Ihrer Bewerbung für den internationalen Freiwilligendienst des Vereins APTIC-R in Agbélouvé (Togo).",
      refLabel: "Ihre Referenznummer",
      summaryTitle: "Zusammenfassung Ihrer Angaben",
      fieldCandidate: "Bewerber(in)",
      fieldArrival: "Gewünschtes Anreisedatum",
      fieldDuration: "Geplante Dauer",
      nextStepsTitle: "Nächste Schritte",
      step1: "1. Sorgfältige Prüfung Ihrer Unterlagen durch das Koordinationsteam (5 bis 7 Werktage).",
      step2: "2. Kontaktaufnahme per E-Mail zur Terminierung eines Video-Kennenlerngesprächs.",
      step3: "3. Nach Zusage gemeinsame Abstimmung der Einsatzvereinbarung und Reisevorbereitung.",
      reminder: "Bitte bewahren Sie diese Referenznummer für alle weiteren Anfragen sorgfältig auf.",
      footerNote: "Verein APTIC-R · Agbélouvé, Region Maritime, Togo · Registrierung N° 1245/MATDCL-DAPL-DOCA.",
    },
  }[currentLang as "FR" | "EN" | "DE"] || {
    subject: `Confirmation de réception de candidature APTIC-R [${referenceNumber}]`,
    greeting: `Bonjour ${firstName},`,
    title: "Confirmation de votre candidature",
    subtitle: "Programme de Volontariat International au Togo",
    intro: "Nous accusons réception de votre dossier de candidature au programme de volontariat international d'APTIC-R.",
    refLabel: "Numéro de référence",
    summaryTitle: "Récapitulatif de votre demande",
    fieldCandidate: "Candidat",
    fieldArrival: "Date d'arrivée souhaitée",
    fieldDuration: "Durée envisagée",
    nextStepsTitle: "Modalités d'instruction",
    step1: "1. Examen attentif de votre dossier (5 à 7 jours ouvrés).",
    step2: "2. Prise de contact pour convenir d'un entretien vidéo.",
    step3: "3. Transmission de la convention d'engagement.",
    reminder: "Merci de conserver précieusement cette référence.",
    footerNote: "Association APTIC-R · Agbélouvé, Togo.",
  }

  const html = `
<!DOCTYPE html>
<html lang="${currentLang.toLowerCase()}">
${renderEmailHead(copy.title)}
<body class="email-bg" style="margin: 0; padding: 0; background-color: #F5F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #183247; line-height: 1.6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F7F9;" class="email-bg">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Container principal sobre max-width 580px -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAF0F4; border-radius: 8px; overflow: hidden;" class="email-card border-line">
          ${renderEmailHeader(copy.subtitle)}

          <!-- Contenu du message -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #183247; line-height: 1.3;" class="text-primary">
                ${copy.title}
              </h1>

              <p style="margin: 0 0 14px 0; font-size: 15px; color: #183247; line-height: 1.6;" class="text-primary">
                ${copy.greeting}
              </p>

              <p style="margin: 0 0 18px 0; font-size: 14.5px; color: #5E6B76; line-height: 1.6;" class="text-secondary">
                ${copy.intro}
              </p>

              ${renderReferenceBox(copy.refLabel, referenceNumber)}

              <!-- Tableau récapitulatif sobre -->
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #183247; margin: 24px 0 8px 0;" class="text-primary">
                ${copy.summaryTitle}
              </div>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #EAF0F4; border-radius: 6px; font-size: 13.5px; margin-bottom: 24px;" class="border-line">
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76; width: 42%; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    ${copy.fieldCandidate}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${firstName} ${lastName}
                  </td>
                </tr>
                ${arrivalDate ? `
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    ${copy.fieldArrival}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${arrivalDate}
                  </td>
                </tr>` : ""}
                ${duration ? `
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76;" class="text-secondary">
                    ${copy.fieldDuration}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600;" class="text-primary">
                    ${duration}
                  </td>
                </tr>` : ""}
              </table>

              <!-- Prochaines étapes en texte clair et lisible -->
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #183247; margin-bottom: 10px;" class="text-primary">
                ${copy.nextStepsTitle}
              </div>

              <div style="font-size: 13.5px; color: #5E6B76; line-height: 1.6; margin-bottom: 8px;" class="text-secondary">
                ${copy.step1}
              </div>
              <div style="font-size: 13.5px; color: #5E6B76; line-height: 1.6; margin-bottom: 8px;" class="text-secondary">
                ${copy.step2}
              </div>
              <div style="font-size: 13.5px; color: #5E6B76; line-height: 1.6; margin-bottom: 20px;" class="text-secondary">
                ${copy.step3}
              </div>

              <p style="margin: 0; font-size: 13px; color: #5E6B76; line-height: 1.5; font-style: italic;" class="text-secondary">
                ${copy.reminder}
              </p>
            </td>
          </tr>

          ${renderEmailFooter({ customNote: copy.footerNote })}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
${copy.title} - ${copy.subtitle}
==================================================

${copy.greeting}

${copy.intro}

${copy.refLabel} : ${referenceNumber}

${copy.summaryTitle} :
- ${copy.fieldCandidate} : ${firstName} ${lastName}
${arrivalDate ? `- ${copy.fieldArrival} : ${arrivalDate}\n` : ""}${duration ? `- ${copy.fieldDuration} : ${duration}\n` : ""}
${copy.nextStepsTitle} :
${copy.step1}
${copy.step2}
${copy.step3}

${copy.reminder}

--
${copy.footerNote}
Contact : contact@aptic-rural.org | Tél / WhatsApp : +228 91 20 19 90
  `.trim()

  return { subject: copy.subject, html, text }
}
