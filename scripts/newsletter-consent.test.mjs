import { test } from "node:test"
import assert from "node:assert/strict"
import {
  adminNewsletterSubscriberSchema,
  newsletterSubscriptionSchema,
} from "../src/lib/cms-validations.ts"
import {
  isNewsletterEligibleForCampaign,
  processNewsletterUnsubscribe,
  registerNewsletterSubscriber,
} from "../src/lib/newsletter-consent.ts"
import {
  genericNewsletterUnsubscribeResult,
  isAllowedNewsletterUnsubscribeOrigin,
} from "../src/lib/newsletter-unsubscribe-security.ts"

class MemoryNewsletterRepository {
  subscribers = new Map()
  tokens = new Map()
  nextId = 1

  async findByEmail(email) {
    return [...this.subscribers.values()].find((subscriber) => subscriber.email === email) ?? null
  }

  async createSubscriber(data) {
    const subscriber = { id: `subscriber-${this.nextId++}`, ...data, unsubscribedAt: null }
    this.subscribers.set(subscriber.id, subscriber)
    return subscriber
  }

  async reactivateSubscriber(id, data) {
    const subscriber = { ...this.subscribers.get(id), ...data }
    this.subscribers.set(id, subscriber)
    return subscriber
  }

  async addUnsubscribeToken(subscriberId, tokenHash) {
    this.tokens.set(tokenHash, { subscriberId, expiresAt: null })
  }

  async findToken(tokenHash) {
    return this.tokens.get(tokenHash) ?? null
  }

  async deactivateIfActive(subscriberId, at) {
    const subscriber = this.subscribers.get(subscriberId)
    if (subscriber?.active) {
      this.subscribers.set(subscriberId, { ...subscriber, active: false, unsubscribedAt: at })
    }
  }
}

const validSignup = {
  email: "subscriber@example.test",
  firstName: "Test",
  lang: "FR",
  consent: true,
}

const expectedOrigin = "https://apticr.org"

test("origine configurée autorisée et origine étrangère refusée", () => {
  assert.equal(isAllowedNewsletterUnsubscribeOrigin({
    origin: expectedOrigin,
    referer: null,
    requestOrigin: expectedOrigin,
    expectedOrigin,
  }), true)
  assert.equal(isAllowedNewsletterUnsubscribeOrigin({
    origin: "https://attacker.invalid",
    referer: null,
    requestOrigin: expectedOrigin,
    expectedOrigin,
  }), false)
})

test("origine absente exige un Referer même origine", () => {
  assert.equal(isAllowedNewsletterUnsubscribeOrigin({
    origin: null,
    referer: null,
    requestOrigin: expectedOrigin,
    expectedOrigin,
  }), false)
  assert.equal(isAllowedNewsletterUnsubscribeOrigin({
    origin: null,
    referer: `${expectedOrigin}/fr/newsletter/unsubscribe/token`,
    requestOrigin: expectedOrigin,
    expectedOrigin,
  }), true)
})

test("le résultat public reste identique indépendamment du jeton", () => {
  const invalid = genericNewsletterUnsubscribeResult("invalid")
  const expired = genericNewsletterUnsubscribeResult("expired")
  const processed = genericNewsletterUnsubscribeResult("processed")
  assert.deepEqual(invalid, { success: true })
  assert.deepEqual(expired, invalid)
  assert.deepEqual(processed, invalid)
})

test("inscription refusée sans consentement explicite", async () => {
  const repository = new MemoryNewsletterRepository()
  assert.equal(newsletterSubscriptionSchema.safeParse({ ...validSignup, consent: false }).success, false)
  assert.equal(newsletterSubscriptionSchema.safeParse({ ...validSignup, consent: undefined }).success, false)
  const result = await registerNewsletterSubscriber(repository, { ...validSignup, consent: false }, "PUBLIC_FORM")
  assert.equal(result.success, false)
  assert.equal(repository.subscribers.size, 0)
})

test("inscription avec consentement conserve les preuves et émet un lien", async () => {
  const repository = new MemoryNewsletterRepository()
  const result = await registerNewsletterSubscriber(repository, validSignup, "PUBLIC_FORM")
  assert.equal(result.success, true)
  if (!result.success || result.alreadySubscribed) return
  const subscriber = repository.subscribers.get(result.subscriberId)
  assert.equal(subscriber.consent, true)
  assert.ok(subscriber.consentAt instanceof Date)
  assert.equal(subscriber.consentSource, "PUBLIC_FORM")
  assert.match(result.unsubscribePath, /newsletter\/unsubscribe#[A-Za-z0-9_-]{43}$/)
})

test("ajout admin refuse le consentement absent ou faux", () => {
  assert.equal(adminNewsletterSubscriberSchema.safeParse({ ...validSignup, consent: false }).success, false)
  assert.equal(adminNewsletterSubscriberSchema.safeParse({ email: validSignup.email }).success, false)
  assert.equal(adminNewsletterSubscriberSchema.safeParse({ ...validSignup, consent: true }).success, true)
})

test("désinscription valide et réutilisation du lien sont idempotentes", async () => {
  const repository = new MemoryNewsletterRepository()
  const registration = await registerNewsletterSubscriber(repository, validSignup, "PUBLIC_FORM")
  assert.equal(registration.success && !registration.alreadySubscribed, true)
  if (!registration.success || registration.alreadySubscribed) return
  const token = registration.unsubscribePath.split("#").at(-1)
  assert.equal(await processNewsletterUnsubscribe(repository, token), "processed")
  assert.equal([...repository.subscribers.values()][0].active, false)
  assert.equal(await processNewsletterUnsubscribe(repository, token), "processed")
  assert.equal([...repository.subscribers.values()][0].active, false)
})

test("jetons invalides et expirés sont traités sans trouver une adresse", async () => {
  const repository = new MemoryNewsletterRepository()
  assert.equal(await processNewsletterUnsubscribe(repository, "invalid"), "invalid")
  const registration = await registerNewsletterSubscriber(repository, validSignup, "PUBLIC_FORM")
  if (!registration.success || registration.alreadySubscribed) return
  const token = registration.unsubscribePath.split("#").at(-1)
  const tokenHash = [...repository.tokens.keys()][0]
  repository.tokens.set(tokenHash, { subscriberId: registration.subscriberId, expiresAt: new Date(0) })
  assert.equal(await processNewsletterUnsubscribe(repository, token), "expired")
  assert.equal([...repository.subscribers.values()][0].active, true)
})

test("réinscription exige un nouveau consentement et rend l'éligibilité explicite", async () => {
  const repository = new MemoryNewsletterRepository()
  const registration = await registerNewsletterSubscriber(repository, validSignup, "PUBLIC_FORM")
  if (!registration.success || registration.alreadySubscribed) return
  const subscriber = repository.subscribers.get(registration.subscriberId)
  subscriber.consent = true
  subscriber.consentAt = null
  subscriber.consentSource = null
  subscriber.consentVersion = null
  assert.equal(isNewsletterEligibleForCampaign(subscriber), false)

  const token = registration.unsubscribePath.split("#").at(-1)
  await processNewsletterUnsubscribe(repository, token)
  const refused = await registerNewsletterSubscriber(repository, { ...validSignup, consent: false }, "PUBLIC_FORM")
  assert.equal(refused.success, false)

  const resubscribed = await registerNewsletterSubscriber(repository, validSignup, "PUBLIC_FORM")
  assert.equal(resubscribed.success && !resubscribed.alreadySubscribed, true)
  if (!resubscribed.success || resubscribed.alreadySubscribed) return
  const updated = repository.subscribers.get(resubscribed.subscriberId)
  assert.equal(updated.active, true)
  assert.equal(isNewsletterEligibleForCampaign(updated), true)
  assert.equal(repository.tokens.size, 2)
})

test("un abonné désinscrit ne peut pas être éligible à une campagne", () => {
  const subscriber = {
    active: false,
    consent: true,
    consentAt: new Date(),
    consentSource: "PUBLIC_FORM",
    consentVersion: "newsletter-consent-v1",
  }
  assert.equal(isNewsletterEligibleForCampaign(subscriber), false)
})
