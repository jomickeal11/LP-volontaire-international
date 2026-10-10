import { test } from "node:test"
import assert from "node:assert/strict"
import { newsletterCampaignSchema, newsletterCampaignTestEmailSchema } from "../src/lib/cms-validations.ts"
import {
  buildNewsletterCampaignSendPayload,
  buildNewsletterCampaignTestPayload,
  selectEligibleNewsletterRecipients,
} from "../src/lib/newsletter-campaign.ts"

const validDraft = {
  name: "Test isolé",
  lang: "FR",
  subjectFr: "Actualités APTIC-R",
  subjectEn: "APTIC-R news",
  subjectDe: "APTIC-R Neuigkeiten",
  contentFr: "Bonjour\nContenu <script>neutralisé</script>",
  contentEn: "Hello",
  contentDe: "Hallo",
}

test("validation des brouillons trilingues et rejet des sujets avec retours de ligne", () => {
  assert.equal(newsletterCampaignSchema.safeParse(validDraft).success, true)
  assert.equal(newsletterCampaignSchema.safeParse({ ...validDraft, subjectFr: "Sujet\r\nBcc:x@example.test" }).success, false)
  assert.equal(newsletterCampaignSchema.safeParse({ ...validDraft, contentDe: "x".repeat(30001) }).success, false)
})

test("adresse de test explicitement fournie et validée", () => {
  assert.equal(newsletterCampaignTestEmailSchema.safeParse({ campaignId: "test", recipient: "test@example.test" }).success, true)
  assert.equal(newsletterCampaignTestEmailSchema.safeParse({ campaignId: "test", recipient: "bad" }).success, false)
})

test("payload de test sélectionne la langue et échappe le contenu", () => {
  const payload = buildNewsletterCampaignTestPayload(validDraft, "FR")
  assert.equal(payload.subject, "[TEST] Actualités APTIC-R")
  assert.match(payload.htmlContent, /&lt;script&gt;/)
  assert.doesNotMatch(payload.htmlContent, /<script>/)
  assert.match(payload.text, /ceci n’est pas un envoi de campagne/)
})

test("payload de campagne sélectionne la langue et garde le jeton hors du contenu journalisé", () => {
  const token = "safeRandomTokenValue"
  const unsubscribeUrl = `https://example.test/fr/newsletter/unsubscribe#${token}`
  const payload = buildNewsletterCampaignSendPayload(validDraft, "FR", unsubscribeUrl)
  assert.equal(payload.subject, "Actualités APTIC-R")
  assert.match(payload.htmlContent, new RegExp(token))
  assert.match(payload.text, new RegExp(token))
  assert.doesNotMatch(payload.logHtmlContent, new RegExp(token))
  assert.doesNotMatch(payload.logText, new RegExp(token))
  assert.match(buildNewsletterCampaignSendPayload(validDraft, "DE", unsubscribeUrl).subject, /Neuigkeiten/)
})

test("la préparation de l’audience exclut les désinscrits et consentements invérifiables", () => {
  const verifiedActive = {
    id: "1", email: "eligible@example.test", firstName: null, lang: "FR", active: true, consent: true,
    consentAt: new Date(), consentSource: "PUBLIC_FORM", consentVersion: "newsletter-consent-v1",
  }
  const unsubscribed = { ...verifiedActive, id: "2", email: "inactive@example.test", active: false }
  const oldConsent = {
    ...verifiedActive, id: "3", email: "legacy@example.test", consentAt: null, consentSource: null, consentVersion: null,
  }
  assert.deepEqual(selectEligibleNewsletterRecipients([verifiedActive, unsubscribed, oldConsent]), [verifiedActive])
})
