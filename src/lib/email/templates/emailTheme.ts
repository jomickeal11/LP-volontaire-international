/**
 * Email Structural Elements - Format sobre, administratif, humain et hautement lisible.
 * Pas de carte avec bordures lourdes, pas de design de dashboard, pas d'habillage marketing ou newsletter.
 * Respect strict de la hiérarchie visuelle :
 *   1. Logo APTIC-R centré seul en haut (160px)
 *   2. Espace vertical
 *   3. Salutation (Bonjour ...)
 *   4. Contenu sobre et naturel
 *   5. Détails éventuels (listes simples)
 *   6. Signature institutionnelle
 *
 * L'objet (Subject) n'apparaît JAMAIS dans le corps du message.
 */

export function renderEmailHead(): string {
  return `
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
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
      color: #1A2B3C;
      background-color: #FFFFFF;
      -webkit-font-smoothing: antialiased;
    }
    a {
      color: #003366;
    }
    p {
      margin: 0 0 16px 0;
    }
    ul {
      margin: 0 0 20px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 6px;
    }
    @media (prefers-color-scheme: dark) {
      body, .email-wrap {
        background-color: #121212 !important;
        color: #E2E8F0 !important;
      }
      .muted-text {
        color: #94A3B8 !important;
      }
      .border-line {
        border-color: #2D3748 !important;
      }
      a {
        color: #60A5FA !important;
      }
    }
  </style>
</head>`.trim()
}

/**
 * Résout l'URL publique absolue et accessible pour le logo dans les clients e-mails.
 * Évite scrupuleusement localhost ou des domaines fictifs qui cassent l'affichage.
 */
export function getPublicLogoUrl(customUrl?: string): string {
  if (customUrl) return customUrl

  // 1. Variable d'environnement explicite pour le logo d'e-mail si définie
  if (process.env.EMAIL_LOGO_URL) {
    return process.env.EMAIL_LOGO_URL
  }

  // 2. URL de site configurée si elle est publique et résoluble (non localhost / non fictive)
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  ).trim().replace(/\/+$/, "")

  if (
    siteUrl &&
    !siteUrl.includes("localhost") &&
    !siteUrl.includes("127.0.0.1") &&
    !siteUrl.includes("aptic-rural.org")
  ) {
    return `${siteUrl}/logo-aptic.png`
  }

  // 3. URL CDN HTTPS officielle et certifiée, accessible par tous les clients e-mails (Mailtrap, Gmail, Outlook, etc.)
  return "https://raw.githubusercontent.com/jomickeal11/LP-volontaire-international/main/public/logo-aptic.png"
}

/**
 * En-tête officiel : Logo APTIC-R seul, centré horizontalement, avec espace vertical.
 * Taille normalisée : 160 px (conforme aux 140–180 px demandés).
 */
export function renderEmailHeader(logoUrl?: string): string {
  const finalLogoUrl = getPublicLogoUrl(logoUrl)

  return `
<div style="text-align: center; margin: 0 auto 32px auto; padding-top: 8px;">
  <img src="${finalLogoUrl}" width="160" alt="APTIC-R" style="display: block; margin: 0 auto; width: 160px; max-width: 160px; height: auto; border: 0; outline: none;" />
</div>`.trim()
}

/**
 * Signature institutionnelle officielle APTIC-R.
 * Sobre, professionnelle et humaine.
 */
export function renderEmailFooter(options?: {
  lang?: "FR" | "EN" | "DE"
  contactEmail?: string
  contactPhone?: string
  customNote?: string
}): string {
  const currentLang = (options?.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const contactEmail = options?.contactEmail || "aptic.rural19@gmail.com"
  const contactPhone = options?.contactPhone || "+228 91 20 19 90"

  const signatureText = {
    FR: {
      closing: "Cordialement",
      team: "L'équipe APTIC-R",
      dept: "Volontariat International",
      location: "Agbélouvé, Togo",
    },
    EN: {
      closing: "Best regards",
      team: "The APTIC-R Team",
      dept: "International Volunteering",
      location: "Agbélouvé, Togo",
    },
    DE: {
      closing: "Mit freundlichen Grüßen",
      team: "Ihr APTIC-R Team",
      dept: "Internationaler Freiwilligendienst",
      location: "Agbélouvé, Togo",
    },
  }[currentLang]

  return `
<div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 14px; line-height: 1.6; color: #475569;" class="border-line muted-text">
  ${options?.customNote ? `<p style="margin: 0 0 16px 0; font-size: 13px; font-style: italic; color: #64748B;">${options.customNote}</p>` : ""}
  <p style="margin: 0 0 12px 0;">${signatureText.closing},</p>
  <p style="margin: 0 0 2px 0; font-weight: 600; color: #1E293B;">${signatureText.team}</p>
  <p style="margin: 0 0 2px 0;">${signatureText.dept}</p>
  <p style="margin: 0 0 2px 0;">${signatureText.location}</p>
  <p style="margin: 0 0 2px 0;"><a href="mailto:${contactEmail}" style="color: inherit; text-decoration: underline;">${contactEmail}</a></p>
  <p style="margin: 0;"><a href="tel:+22891201990" style="color: inherit; text-decoration: underline;">${contactPhone}</a></p>
</div>`.trim()
}

/**
 * Signature en texte brut pour les versions text/plain.
 */
export function renderEmailTextFooter(options?: {
  lang?: "FR" | "EN" | "DE"
  contactEmail?: string
  contactPhone?: string
  customNote?: string
}): string {
  const currentLang = (options?.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const contactEmail = options?.contactEmail || "aptic.rural19@gmail.com"
  const contactPhone = options?.contactPhone || "+228 91 20 19 90"

  const signatureText = {
    FR: {
      closing: "Cordialement",
      team: "L'équipe APTIC-R",
      dept: "Volontariat International",
      location: "Agbélouvé, Togo",
    },
    EN: {
      closing: "Best regards",
      team: "The APTIC-R Team",
      dept: "International Volunteering",
      location: "Agbélouvé, Togo",
    },
    DE: {
      closing: "Mit freundlichen Grüßen",
      team: "Ihr APTIC-R Team",
      dept: "Internationaler Freiwilligendienst",
      location: "Agbélouvé, Togo",
    },
  }[currentLang]

  return `
${options?.customNote ? `${options.customNote}\n\n` : ""}${signatureText.closing},

${signatureText.team}
${signatureText.dept}
${signatureText.location}
${contactEmail}
${contactPhone}`.trim()
}

/**
 * Enveloppe HTML complète : Doctype, Head, Conteneur centré, Header (Logo), Corps, Footer (Signature).
 */
export function wrapEmailHtml(
  contentHtml: string,
  lang: "FR" | "EN" | "DE" = "FR",
  customFooterNote?: string,
  options?: { includeFooter?: boolean }
): string {
  const shouldIncludeFooter =
    options?.includeFooter !== undefined
      ? options.includeFooter
      : !contentHtml.includes("aptic.rural19@gmail.com") &&
        !contentHtml.includes("+228 91 20 19 90")

  return `<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
${renderEmailHead()}
<body style="margin: 0; padding: 28px 16px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1A2B3C;">
  <div style="max-width: 580px; margin: 0 auto;" class="email-wrap">
    ${renderEmailHeader()}
    ${contentHtml}
    ${shouldIncludeFooter ? renderEmailFooter({ lang, customNote: customFooterNote }) : ""}
  </div>
</body>
</html>`.trim()
}
