import {
  renderEmailHead,
  renderEmailHeader,
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
      intro: `Nous avons bien reçu la demande de partenariat transmise pour l'organisation ${orgName} auprès de l'association APTIC-R au Togo.`,
      refLabel: "Votre référence de dossier partenaire",
      summaryTitle: "Informations transmises :",
      fieldOrg: "Organisation",
      fieldContact: "Référent",
      fieldCountry: "Pays d'implantation",
      fieldType: "Type de structure",
      nextStepsTitle: "Instruction de votre demande :",
      step1: "1. Analyse de votre projet et de vos besoins par la direction d'APTIC-R (3 à 5 jours ouvrés).",
      step2: "2. Organisation d'un échange vidéo afin de définir le cadre de coopération.",
      step3: "3. Rédaction et signature conjointe de la convention de partenariat.",
      reminder: "Notre équipe reviendra vers vous très rapidement à cette adresse.",
    },
    EN: {
      subject: `Acknowledgment of Receipt - Partnership Request APTIC-R [${referenceNumber}]`,
      greeting: `Dear ${contactPerson},`,
      intro: `We have safely received the partnership request submitted on behalf of ${orgName} to the APTIC-R association in Togo.`,
      refLabel: "Partnership file reference",
      summaryTitle: "Submitted information:",
      fieldOrg: "Organization",
      fieldContact: "Contact person",
      fieldCountry: "Country",
      fieldType: "Organization type",
      nextStepsTitle: "Next steps:",
      step1: "1. Review of your project and volunteer hosting needs by APTIC-R management (3 to 5 business days).",
      step2: "2. Video conference to define collaboration framework and logistics.",
      step3: "3. Drafting and signing of the formal partnership agreement.",
      reminder: "Our coordination team will contact you shortly.",
    },
    DE: {
      subject: `Eingangsbestätigung - Partnerschaftsanfrage APTIC-R [${referenceNumber}]`,
      greeting: `Sehr geehrte(r) ${contactPerson},`,
      intro: `Wir haben Ihre Partnerschaftsanfrage für die Organisation ${orgName} beim Verein APTIC-R in Togo erhalten.`,
      refLabel: "Referenznummer des Vorgangs",
      summaryTitle: "Übermittelte Angaben:",
      fieldOrg: "Organisation",
      fieldContact: "Ansprechpartner(in)",
      fieldCountry: "Land",
      fieldType: "Art der Organisation",
      nextStepsTitle: "Nächste Schritte:",
      step1: "1. Prüfung Ihres Projekts durch den Vorstand von APTIC-R (3 bis 5 Werktage).",
      step2: "2. Video-Gespräch zur Abstimmung der Kooperation.",
      step3: "3. Ausarbeitung und Unterzeichnung der Vereinbarung.",
      reminder: "Unser Koordinationsteam wird sich in Kürze bei Ihnen melden.",
    },
  }[currentLang as "FR" | "EN" | "DE"] || {
    subject: `Accusé de réception - Demande de partenariat APTIC-R [${referenceNumber}]`,
    greeting: `Bonjour ${contactPerson},`,
    intro: `Nous avons bien reçu votre demande de partenariat pour ${orgName}.`,
    refLabel: "Référence",
    summaryTitle: "Informations transmises :",
    fieldOrg: "Organisation",
    fieldContact: "Référent",
    fieldCountry: "Pays",
    fieldType: "Type",
    nextStepsTitle: "Instruction de votre demande :",
    step1: "1. Analyse de votre dossier sous 3 à 5 jours ouvrés.",
    step2: "2. Échange vidéo de cadrage.",
    step3: "3. Signature de la convention.",
    reminder: "Notre équipe reviendra vers vous très prochainement.",
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
      <li style="margin-bottom: 4px;">${copy.fieldOrg} : ${orgName}</li>
      <li style="margin-bottom: 4px;">${copy.fieldContact} : ${contactPerson}</li>
      ${country ? `<li style="margin-bottom: 4px;">${copy.fieldCountry} : ${country}</li>` : ""}
      ${orgType ? `<li style="margin-bottom: 4px;">${copy.fieldType} : ${orgType}</li>` : ""}
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
- ${copy.fieldOrg} : ${orgName}
- ${copy.fieldContact} : ${contactPerson}
${country ? `- ${copy.fieldCountry} : ${country}\n` : ""}${orgType ? `- ${copy.fieldType} : ${orgType}\n` : ""}
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
