export type NewsletterCampaignLanguage = "FR" | "EN" | "DE"

export interface NewsletterCampaignContent {
  subjectFr: string
  subjectEn: string
  subjectDe: string
  contentFr: string
  contentEn: string
  contentDe: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatContent(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("\n")
}

export function getNewsletterCampaignCopy(campaign: NewsletterCampaignContent, lang: NewsletterCampaignLanguage) {
  const suffix = lang[0] + lang.slice(1).toLowerCase()
  return {
    subject: campaign[`subject${suffix}` as "subjectFr" | "subjectEn" | "subjectDe"],
    content: campaign[`content${suffix}` as "contentFr" | "contentEn" | "contentDe"],
  }
}

export function buildNewsletterCampaignTestPayload(
  campaign: NewsletterCampaignContent,
  lang: NewsletterCampaignLanguage,
) {
  const copy = getNewsletterCampaignCopy(campaign, lang)
  const testBanner = {
    FR: "Message de test — ceci n’est pas un envoi de campagne.",
    EN: "Test message — this is not a campaign send.",
    DE: "Testnachricht — dies ist kein Kampagnenversand.",
  }[lang]

  return {
    subject: `[TEST] ${copy.subject}`,
    htmlContent: `<p><strong>${testBanner}</strong></p>${formatContent(copy.content)}`,
    text: `${testBanner}\n\n${copy.content}`,
  }
}

export function buildNewsletterCampaignSendPayload(
  campaign: NewsletterCampaignContent,
  lang: NewsletterCampaignLanguage,
  unsubscribeUrl: string,
) {
  const copy = getNewsletterCampaignCopy(campaign, lang)
  const unsubscribeLabel = {
    FR: "Pour ne plus recevoir ces messages, désinscrivez-vous ici.",
    EN: "To stop receiving these messages, unsubscribe here.",
    DE: "Wenn Sie diese Nachrichten nicht mehr erhalten möchten, melden Sie sich hier ab.",
  }[lang]
  const safeUrl = escapeHtml(unsubscribeUrl)
  return {
    subject: copy.subject,
    htmlContent: `${formatContent(copy.content)}<p>${unsubscribeLabel} <a href="${safeUrl}">${lang === "FR" ? "Me désinscrire" : lang === "EN" ? "Unsubscribe" : "Abmelden"}</a></p>`,
    text: `${copy.content}\n\n${unsubscribeLabel} ${unsubscribeUrl}`,
    logHtmlContent: formatContent(copy.content),
    logText: copy.content,
  }
}

export function selectEligibleNewsletterRecipients<T extends {
  active: boolean
  consent: boolean
  consentAt: Date | null
  consentSource: string | null
  consentVersion: string | null
}>(subscribers: T[]): T[] {
  return subscribers.filter((subscriber) => Boolean(
    subscriber.active && subscriber.consent && subscriber.consentAt &&
      subscriber.consentSource?.trim() && subscriber.consentVersion?.trim(),
  ))
}
