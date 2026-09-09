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
      subject: `Accusé de réception - Demande de partenariat APTIC-R [Réf: ${referenceNumber}]`,
      greeting: `Bonjour ${contactPerson},`,
      title: "Demande de partenariat bien reçue",
      subtitle: "Collaboration & Accueil de Volontaires Internationaux",
      thankYou: `Nous vous remercions pour l'intérêt porté par ${orgName} envers l'association APTIC-R pour le développement de projets de volontariat au Togo.`,
      refLabel: "Référence officielle de votre demande",
      detailsTitle: "Détails de l'organisation",
      fieldOrg: "Organisation",
      fieldContact: "Personne de contact",
      fieldCountry: "Pays d'implantation",
      fieldType: "Type de structure",
      stepsTitle: "Processus d'instruction du partenariat",
      step1: "1. Analyse de votre dossier et adéquation des profils recherchés par la direction d'APTIC-R (3 à 5 jours ouvrés).",
      step2: "2. Échange bilatéral (visio-conférence) pour définir les modalités opérationnelles et d'accueil.",
      step3: "3. Rédaction et signature conjointe de la convention cadre de partenariat.",
      advice: "Notre équipe de coordination reviendra vers vous très prochainement à cette adresse.",
      footerNote: "APTIC-R · Programme Partenariats & Volontariat International · Agbélouvé, Togo.",
    },
    EN: {
      subject: `Acknowledgment of Receipt - APTIC-R Partnership Request [Ref: ${referenceNumber}]`,
      greeting: `Dear ${contactPerson},`,
      title: "Partnership Request Successfully Received",
      subtitle: "Collaboration & International Volunteer Hosting",
      thankYou: `Thank you very much for the interest of ${orgName} in collaborating with the APTIC-R association on international volunteering projects in Togo.`,
      refLabel: "Official request reference number",
      detailsTitle: "Organization details",
      fieldOrg: "Organization",
      fieldContact: "Contact person",
      fieldCountry: "Country",
      fieldType: "Organization type",
      stepsTitle: "Partnership review process",
      step1: "1. Review of your organization profile and mutual volunteer goals by APTIC-R management (3 to 5 business days).",
      step2: "2. Bilateral video meeting to define operational logistics and volunteer support.",
      step3: "3. Drafting and joint signature of the formal partnership framework agreement.",
      advice: "Our coordination team will contact you shortly regarding the next steps.",
      footerNote: "APTIC-R · International Partnerships & Volunteer Coordination · Agbélouvé, Togo.",
    },
    DE: {
      subject: `Eingangsbestätigung - APTIC-R Partnerschaftsanfrage [Ref: ${referenceNumber}]`,
      greeting: `Sehr geehrte(r) ${contactPerson},`,
      title: "Partnerschaftsanfrage erfolgreich eingegangen",
      subtitle: "Kooperation & Internationaler Freiwilligendienst in Togo",
      thankYou: `Vielen Dank für das Interesse von ${orgName} an einer Zusammenarbeit mit dem Verein APTIC-R.`,
      refLabel: "Offizielle Referenznummer Ihrer Anfrage",
      detailsTitle: "Angaben zur Organisation",
      fieldOrg: "Organisation",
      fieldContact: "Ansprechpartner(in)",
      fieldCountry: "Land",
      fieldType: "Organisationstyp",
      stepsTitle: "Ablauf der Prüfung",
      step1: "1. Prüfung Ihres Profils und Abstimmung der Einsatzmöglichkeiten durch den Vorstand von APTIC-R (3 bis 5 Werktage).",
      step2: "2. Bilaterales Video-Gespräch zur Klärung der Rahmenbedingungen und Vor-Ort-Begleitung.",
      step3: "3. Erstellung und beiderseitige Unterzeichnung der Partnerschaftsvereinbarung.",
      advice: "Unser Koordinationsteam wird sich in Kürze mit Ihnen in Verbindung setzen.",
      footerNote: "APTIC-R · Programm für internationale Partnerschaften · Agbélouvé, Togo.",
    },
  }[currentLang as "FR" | "EN" | "DE"] || {
    subject: `Accusé de réception - Demande de partenariat APTIC-R [Réf: ${referenceNumber}]`,
    greeting: `Bonjour ${contactPerson},`,
    title: "Demande de partenariat bien reçue",
    subtitle: "Collaboration & Accueil de Volontaires Internationaux",
    thankYou: `Nous vous remercions pour l'intérêt porté par ${orgName}.`,
    refLabel: "Référence officielle",
    detailsTitle: "Détails de l'organisation",
    fieldOrg: "Organisation",
    fieldContact: "Contact",
    fieldCountry: "Pays",
    fieldType: "Type",
    stepsTitle: "Processus d'instruction",
    step1: "1. Analyse de votre dossier.",
    step2: "2. Échange bilatéral.",
    step3: "3. Signature de la convention.",
    advice: "Notre équipe reviendra vers vous rapidement.",
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
              <div style="color: #94A3B8; font-size: 13px; font-weight: 500; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Partenariats Internationaux</div>
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
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500; width: 40%;">${copy.fieldOrg}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${orgName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9; background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">${copy.fieldContact}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${contactPerson}</td>
                </tr>
                ${country ? `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">${copy.fieldCountry}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${country}</td>
                </tr>` : ''}
                ${orgType ? `
                <tr style="background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">${copy.fieldType}</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${orgType}</td>
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
- ${copy.fieldOrg} : ${orgName}
- ${copy.fieldContact} : ${contactPerson}
${country ? `- ${copy.fieldCountry} : ${country}\n` : ''}${orgType ? `- ${copy.fieldType} : ${orgType}\n` : ''}
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
