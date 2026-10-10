import { createHash, randomBytes } from "node:crypto"

export const NEWSLETTER_CONSENT_VERSION = "newsletter-consent-v1"

export type NewsletterConsentSource = "PUBLIC_FORM" | "ADMIN_FORM"
export type NewsletterLanguage = "FR" | "EN" | "DE"

export interface NewsletterSubscriberState {
  id: string
  email: string
  firstName: string | null
  lang: NewsletterLanguage
  active: boolean
  consent: boolean
  consentAt: Date | null
  consentSource: string | null
  consentVersion: string | null
}

export interface NewsletterConsentInput {
  email: string
  firstName?: string | null
  lang?: NewsletterLanguage
  consent: boolean
}

export interface NewsletterRegistrationRepository {
  findByEmail(email: string): Promise<NewsletterSubscriberState | null>
  createSubscriber(data: {
    email: string
    firstName: string | null
    lang: NewsletterLanguage
    consent: true
    consentAt: Date
    consentSource: NewsletterConsentSource
    consentVersion: string
    active: true
  }): Promise<NewsletterSubscriberState>
  reactivateSubscriber(
    id: string,
    data: {
      firstName: string | null
      lang: NewsletterLanguage
      consent: true
      consentAt: Date
      consentSource: NewsletterConsentSource
      consentVersion: string
      active: true
      subscribedAt: Date
      unsubscribedAt: null
    },
  ): Promise<NewsletterSubscriberState>
  addUnsubscribeToken(subscriberId: string, tokenHash: string): Promise<void>
}

export function isNewsletterConsentVerifiable(
  subscriber: Pick<NewsletterSubscriberState, "consent" | "consentAt" | "consentSource" | "consentVersion">,
): boolean {
  return Boolean(
    subscriber.consent &&
      subscriber.consentAt &&
      subscriber.consentSource?.trim() &&
      subscriber.consentVersion?.trim(),
  )
}

export function isNewsletterEligibleForCampaign(
  subscriber: Pick<NewsletterSubscriberState, "active" | "consent" | "consentAt" | "consentSource" | "consentVersion">,
): boolean {
  return subscriber.active && isNewsletterConsentVerifiable(subscriber)
}

export function createNewsletterUnsubscribeToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url")
  return { token, tokenHash: hashNewsletterUnsubscribeToken(token)! }
}

export function hashNewsletterUnsubscribeToken(token: unknown): string | null {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export function newsletterUnsubscribePath(lang: NewsletterLanguage, token: string): string {
  // URL fragments are never sent in the HTTP request URL, so platform access
  // logs record the route without recording the bearer token.
  return `/${lang.toLowerCase()}/newsletter/unsubscribe#${token}`
}

export async function registerNewsletterSubscriber(
  repository: NewsletterRegistrationRepository,
  input: NewsletterConsentInput,
  source: NewsletterConsentSource,
  now = new Date(),
): Promise<
  | { success: true; alreadySubscribed: true }
  | { success: true; alreadySubscribed: false; subscriberId: string; unsubscribePath: string }
  | { success: false; error: string }
> {
  if (input.consent !== true) {
    return { success: false, error: "Le consentement explicite est requis." }
  }

  const email = input.email.trim().toLowerCase()
  const lang = input.lang || "FR"
  const existing = await repository.findByEmail(email)
  if (existing?.active) {
    return source === "PUBLIC_FORM"
      ? { success: true, alreadySubscribed: true }
      : { success: false, error: "Cet email est déjà abonné." }
  }

  const consentData = {
    consent: true as const,
    consentAt: now,
    consentSource: source,
    consentVersion: NEWSLETTER_CONSENT_VERSION,
  }

  const subscriber = existing
    ? await repository.reactivateSubscriber(existing.id, {
        firstName: input.firstName?.trim() || existing.firstName,
        lang,
        ...consentData,
        active: true,
        subscribedAt: now,
        unsubscribedAt: null,
      })
    : await repository.createSubscriber({
        email,
        firstName: input.firstName?.trim() || null,
        lang,
        ...consentData,
        active: true,
      })

  const { token, tokenHash } = createNewsletterUnsubscribeToken()
  await repository.addUnsubscribeToken(subscriber.id, tokenHash)

  return {
    success: true,
    alreadySubscribed: false,
    subscriberId: subscriber.id,
    unsubscribePath: newsletterUnsubscribePath(lang, token),
  }
}

export interface NewsletterUnsubscribeRepository {
  findToken(tokenHash: string): Promise<{ subscriberId: string; expiresAt: Date | null } | null>
  deactivateIfActive(subscriberId: string, at: Date): Promise<void>
}

export async function processNewsletterUnsubscribe(
  repository: NewsletterUnsubscribeRepository,
  rawToken: unknown,
  now = new Date(),
): Promise<"processed" | "invalid" | "expired"> {
  const tokenHash = hashNewsletterUnsubscribeToken(rawToken)
  if (!tokenHash) return "invalid"

  const stored = await repository.findToken(tokenHash)
  if (!stored) return "invalid"
  if (stored.expiresAt && stored.expiresAt.getTime() <= now.getTime()) return "expired"

  // The token row is retained so replaying the same link remains harmless and
  // older links still work after an explicit resubscription.
  await repository.deactivateIfActive(stored.subscriberId, now)
  return "processed"
}
