/**
 * Email Design Tokens & Reusable Structural Elements
 * Approche professionnelle, sobre, institutionnelle et compatible Light/Dark modes.
 */

export const EMAIL_COLORS = {
  light: {
    bg: "#FFFFFF",
    outerBg: "#F5F7F9",
    textPrimary: "#183247",
    textSecondary: "#5E6B76",
    border: "#EAF0F4",
    cta: "#35A85A",
    ctaText: "#FFFFFF",
    panelBg: "#FFFFFF",
    rowEven: "#FAFCFD",
  },
  dark: {
    outerBg: "#101C27",
    surface: "#172635",
    textPrimary: "#F5F7F9",
    textSecondary: "#B8C5CF",
    border: "#2A3A48",
    cta: "#35A85A",
    ctaText: "#FFFFFF",
    panelBg: "#101C27",
    rowEven: "#13202D",
  },
} as const

export function renderEmailHead(title: string): string {
  return `
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    /* Dark Mode Overrides (Apple Mail, iOS, Gmail Apps) */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #101C27 !important; }
      .email-card { background-color: #172635 !important; border-color: #2A3A48 !important; }
      .text-primary { color: #F5F7F9 !important; }
      .text-secondary { color: #B8C5CF !important; }
      .border-line { border-color: #2A3A48 !important; }
      .panel-bg { background-color: #101C27 !important; border-color: #2A3A48 !important; }
      .brand-title { color: #F5F7F9 !important; }
      .brand-subtitle { color: #B8C5CF !important; }
      .table-row-even { background-color: #13202D !important; }
      .footer-text { color: #B8C5CF !important; }
      .footer-link { color: #35A85A !important; }
    }

    /* Outlook.com & Office 365 Web Dark Mode */
    [data-ogsc] .email-bg { background-color: #101C27 !important; }
    [data-ogsc] .email-card { background-color: #172635 !important; border-color: #2A3A48 !important; }
    [data-ogsc] .text-primary { color: #F5F7F9 !important; }
    [data-ogsc] .text-secondary { color: #B8C5CF !important; }
    [data-ogsc] .border-line { border-color: #2A3A48 !important; }
    [data-ogsc] .panel-bg { background-color: #101C27 !important; border-color: #2A3A48 !important; }
    [data-ogsc] .brand-title { color: #F5F7F9 !important; }
    [data-ogsc] .brand-subtitle { color: #B8C5CF !important; }
    [data-ogsc] .table-row-even { background-color: #13202D !important; }
    [data-ogsc] .footer-text { color: #B8C5CF !important; }
    [data-ogsc] .footer-link { color: #35A85A !important; }
  </style>
</head>`.trim()
}

/**
 * En-tête institutionnel sobre avec le vrai logo officiel d'APTIC-R.
 * Le logo est encapsulé dans un fond protecteur assurant une lisibilité maximale en clair comme en sombre.
 */
export function renderEmailHeader(
  subtitle = "Programme de Volontariat International · Togo",
  logoUrl?: string
): string {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://aptic-rural.org"
  const finalLogoUrl = logoUrl || `${siteUrl}/aptic-logo.png`

  return `
<!-- En-tête institutionnel avec vrai logo APTIC-R -->
<tr>
  <td style="padding: 26px 32px 20px 32px; border-bottom: 1px solid #EAF0F4;" class="border-line">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="middle" style="padding-right: 14px;">
          <!-- Conteneur blanc protecteur pour contraste parfait en clair et sombre -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 44px; height: 44px; background-color: #FFFFFF; border: 1px solid #EAF0F4; border-radius: 8px; text-align: center; vertical-align: middle; padding: 2px;">
                <img src="${finalLogoUrl}" width="38" height="38" alt="APTIC-R Logo" style="display: block; margin: 0 auto; width: 38px; height: 38px; max-width: 38px; border: 0; outline: none; text-decoration: none;" />
              </td>
            </tr>
          </table>
        </td>
        <td valign="middle">
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; color: #183247; letter-spacing: -0.3px; line-height: 1.2;" class="brand-title">
            APTIC-R
          </div>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #5E6B76; margin-top: 2px; line-height: 1.2;" class="brand-subtitle">
            ${subtitle}
          </div>
        </td>
      </tr>
    </table>
  </td>
</tr>`.trim()
}

/**
 * Encadré sobre de mise en avant d'une référence de dossier (CAND-2026-XXXX ou PART-2026-XXXX).
 */
export function renderReferenceBox(label: string, reference: string): string {
  return `
<!-- Encadré Référence Dossier -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 22px 0; background-color: #FFFFFF; border: 1px solid #EAF0F4; border-radius: 6px;" class="panel-bg border-line">
  <tr>
    <td style="padding: 16px 20px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #5E6B76; letter-spacing: 0.8px;" class="text-secondary">
        ${label}
      </div>
      <div style="font-size: 20px; font-weight: 700; font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; color: #183247; margin-top: 4px; letter-spacing: 1px;" class="text-primary">
        ${reference}
      </div>
    </td>
  </tr>
</table>`.trim()
}

/**
 * Bouton d'action (CTA) sobre, utilisé uniquement lorsqu'il est utile.
 */
export function renderCtaButton(label: string, url: string): string {
  return `
<!-- Bouton CTA utile -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 12px 0;">
  <tr>
    <td align="left">
      <a href="${url}" target="_blank" style="background-color: #35A85A; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 11px 22px; border-radius: 6px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${label} &rarr;
      </a>
    </td>
  </tr>
</table>`.trim()
}

/**
 * Signature institutionnelle et pied de page avec coordonnées réelles (Tél +228 91 20 19 90).
 */
export function renderEmailFooter(options?: {
  customNote?: string
  contactEmail?: string
  contactPhone?: string
}): string {
  const customNote = options?.customNote || "Ce message vous est adressé par la coordination du programme de volontariat international d'APTIC-R."
  const contactEmail = options?.contactEmail || "contact@aptic-rural.org"
  const contactPhone = options?.contactPhone || "+228 91 20 19 90"

  return `
<!-- Signature institutionnelle et pied de page -->
<tr>
  <td style="padding: 24px 32px 28px 32px; border-top: 1px solid #EAF0F4;" class="border-line">
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #183247; margin-bottom: 4px;" class="text-primary">
      Coordination du Programme de Volontariat International
    </div>
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; color: #5E6B76; line-height: 1.6;" class="text-secondary">
      Association APTIC-R · Agbélouvé, Région Maritime, Togo<br>
      Tél. / WhatsApp : <a href="tel:+22891201990" style="color: #183247; font-weight: 600; text-decoration: none;" class="text-primary">${contactPhone}</a> · Email : <a href="mailto:${contactEmail}" style="color: #5E6B76; text-decoration: underline;" class="footer-link">${contactEmail}</a>
    </div>
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #5E6B76; margin-top: 14px; line-height: 1.4;" class="footer-text">
      ${customNote}
    </div>
  </td>
</tr>`.trim()
}
