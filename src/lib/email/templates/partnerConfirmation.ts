import {
  renderEmailHead,
  renderEmailHeader,
  renderReferenceBox,
  renderEmailFooter,
} from "./emailTheme"

interface PartnerEmailParams {
  orgName: string
  contactPerson: string
  referenceNumber: string
  country?: string
  orgType?: string
  lang?: "FR" | "EN" | "DE"
}

export function renderPartnerConfirmationEmail({
  orgName,
  contactPerson,
  referenceNumber,
  country,
  orgType,
  lang = "FR",
}: PartnerEmailParams): { subject: string; html: string; text: string } {
  const currentLang = (lang || "FR").toUpperCase()

  const copy = {
    FR: {
      subject: `Accusé de réception - Demande de partenariat APTIC-R [${referenceNumber}]`,
      greeting: `Bonjour ${contactPerson},`,
      title: "Accusé de réception de votre demande de partenariat",
      subtitle: "Collaboration & Accueil de Volontaires Internationaux",
      intro: `Nous vous remercions pour l'intérêt manifesté par l'organisation ${orgName} envers l'association APTIC-R dans le cadre de notre programme de volontariat international au Togo.`,
      refLabel: "Numéro de référence du dossier partenaire",
      summaryTitle: "Informations transmises",
      fieldOrg: "Organisation",
      fieldContact: "Référent",
      fieldCountry: "Pays d'implantation",
      fieldType: "Type de structure",
      nextStepsTitle: "Instruction de votre demande",
      step1: "1. Analyse des objectifs de collaboration et des capacités d'accueil par la direction d'APTIC-R (3 à 5 jours ouvrés).",
      step2: "2. Organisation d'un échange vidéo bilatéral afin de préciser le périmètre des missions et l'accompagnement des volontaires.",
      step3: "3. Rédaction et signature conjointe de la convention cadre de partenariat.",
      reminder: "Notre équipe de coordination reviendra vers vous très prochainement à cette adresse.",
      footerNote: "Association APTIC-R · Pôle Partenariats & Coopération Internationale · Agbélouvé, Région Maritime, Togo.",
    },
    EN: {
      subject: `Acknowledgment of Receipt - Partnership Request APTIC-R [${referenceNumber}]`,
      greeting: `Dear ${contactPerson},`,
      title: "Partnership Request Acknowledgment",
      subtitle: "International Volunteer Hosting & Collaboration",
      intro: `Thank you for the interest expressed by ${orgName} in collaborating with the APTIC-R association through our international volunteer program in Togo.`,
      refLabel: "Partnership File Reference",
      summaryTitle: "Submitted Information",
      fieldOrg: "Organization",
      fieldContact: "Contact Person",
      fieldCountry: "Country of Operation",
      fieldType: "Organization Type",
      nextStepsTitle: "Next Steps",
      step1: "1. Review of your institutional objectives and volunteer hosting criteria by APTIC-R leadership (3 to 5 business days).",
      step2: "2. Organization of a bilateral video conference to define operational specifics and volunteer mentoring.",
      step3: "3. Drafting and mutual signing of the partnership framework agreement.",
      reminder: "Our coordination team will contact you shortly at this email address.",
      footerNote: "APTIC-R Association · International Partnerships & Cooperation · Agbélouvé, Maritime Region, Togo.",
    },
    DE: {
      subject: `Eingangsbestätigung - Partnerschaftsanfrage APTIC-R [${referenceNumber}]`,
      greeting: `Sehr geehrte(r) ${contactPerson},`,
      title: "Eingangsbestätigung Ihrer Partnerschaftsanfrage",
      subtitle: "Kooperation & Aufnahme Internationaler Freiwilliger",
      intro: `Vielen Dank für das Interesse von ${orgName} an einer Zusammenarbeit mit dem Verein APTIC-R im Rahmen unseres internationalen Freiwilligenprogramms in Togo.`,
      refLabel: "Referenznummer des Vorgangs",
      summaryTitle: "Übermittelte Angaben",
      fieldOrg: "Organisation",
      fieldContact: "Ansprechpartner(in)",
      fieldCountry: "Sitz / Land",
      fieldType: "Art der Organisation",
      nextStepsTitle: "Bearbeitungsschritte",
      step1: "1. Prüfung der gemeinsamen Zielsetzungen und Einsatzmöglichkeiten durch den Vorstand von APTIC-R (3 bis 5 Werktage).",
      step2: "2. Bilaterales Video-Gespräch zur Abstimmung des konkreten Einsatzrahmens.",
      step3: "3. Ausarbeitung und Unterzeichnung der Partnerschaftsvereinbarung.",
      reminder: "Unser Koordinationsteam wird sich in Kürze unter dieser Adresse bei Ihnen melden.",
      footerNote: "Verein APTIC-R · Partnerschaften & Internationale Zusammenarbeit · Agbélouvé, Region Maritime, Togo.",
    },
  }[currentLang as "FR" | "EN" | "DE"] || {
    subject: `Accusé de réception - Demande de partenariat APTIC-R [${referenceNumber}]`,
    greeting: `Bonjour ${contactPerson},`,
    title: "Accusé de réception de votre demande",
    subtitle: "Programme Partenariats APTIC-R",
    intro: `Nous vous remercions pour l'intérêt manifesté par l'organisation ${orgName} envers l'association APTIC-R.`,
    refLabel: "Numéro de référence",
    summaryTitle: "Informations transmises",
    fieldOrg: "Organisation",
    fieldContact: "Référent",
    fieldCountry: "Pays",
    fieldType: "Type",
    nextStepsTitle: "Instruction de votre demande",
    step1: "1. Analyse de votre dossier (3 à 5 jours ouvrés).",
    step2: "2. Organisation d'un échange vidéo bilatéral.",
    step3: "3. Signature de la convention cadre.",
    reminder: "Notre équipe reviendra vers vous très prochainement.",
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
                    ${copy.fieldOrg}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${orgName}
                  </td>
                </tr>
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    ${copy.fieldContact}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${contactPerson}
                  </td>
                </tr>
                ${country ? `
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    ${copy.fieldCountry}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${country}
                  </td>
                </tr>` : ""}
                ${orgType ? `
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76;" class="text-secondary">
                    ${copy.fieldType}
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600;" class="text-primary">
                    ${orgType}
                  </td>
                </tr>` : ""}
              </table>

              <!-- Processus en texte sobre -->
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
- ${copy.fieldOrg} : ${orgName}
- ${copy.fieldContact} : ${contactPerson}
${country ? `- ${copy.fieldCountry} : ${country}\n` : ""}${orgType ? `- ${copy.fieldType} : ${orgType}\n` : ""}
${copy.nextStepsTitle} :
${copy.step1}
${copy.step2}
${copy.step3}

${copy.reminder}

--
${copy.footerNote}
Contact : contact@aptic-rural.org
  `.trim()

  return { subject: copy.subject, html, text }
}
