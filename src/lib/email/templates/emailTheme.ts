/**
 * Email Structural Elements - Format simple, naturel et authentique.
 * Sans habillage lourd (pas de carte avec bordures, pas de design de dashboard ou de newsletter).
 * Rendu direct, fluide et parfaitement adapté au mode clair et au mode sombre natifs de chaque client.
 */

export function renderEmailHead(title: string): string {
  return `
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
    }
    a {
      color: #174F7A;
    }
    @media (prefers-color-scheme: dark) {
      body, .email-wrap {
        background-color: #121212 !important;
        color: #E0E0E0 !important;
      }
      .muted-text {
        color: #A0A0A0 !important;
      }
      .border-line {
        border-color: #2D2D2D !important;
      }
      a {
        color: #58A6FF !important;
      }
    }
  </style>
</head>`.trim()
}

/**
 * En-tête simple : Logo APTIC-R direct.
 */
export function renderEmailHeader(logoUrl?: string): string {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://aptic-rural.org"
  const finalLogoUrl = logoUrl || `${siteUrl}/aptic-logo.png`

  return `
<div style="margin-bottom: 24px;">
  <img src="${finalLogoUrl}" width="42" height="42" alt="APTIC-R" style="display: block; border: 0; outline: none; width: 42px; height: 42px; max-width: 42px;" />
</div>`.trim()
}

/**
 * Signature institutionnelle simple et directe (style e-mail standard d'équipe).
 */
export function renderEmailFooter(options?: {
  customNote?: string
  contactEmail?: string
  contactPhone?: string
}): string {
  const contactEmail = options?.contactEmail || "aptic.rural19@gmail.com"
  const contactPhone = options?.contactPhone || "+228 91 20 19 90"

  return `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 13px; line-height: 1.6; color: #64748B;" class="border-line muted-text">
  --<br>
  <strong>Coordination du Programme de Volontariat International</strong><br>
  Association APTIC-R · Agbélouvé, Région Maritime, Togo<br>
  Tél. / WhatsApp : <a href="tel:+22891201990" style="color: inherit; text-decoration: underline;">${contactPhone}</a><br>
  Email : <a href="mailto:${contactEmail}" style="color: inherit; text-decoration: underline;">${contactEmail}</a>
</div>`.trim()
}
