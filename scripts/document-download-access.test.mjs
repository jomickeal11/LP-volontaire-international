import { test } from "node:test"
import assert from "node:assert/strict"
import {
  authorizeDocumentDownload,
  isCandidateDocumentAssociatedWithApplication,
  isPartnerDocumentAssociatedWithRecord,
} from "../src/lib/document-download-access.ts"

const adminSession = { userId: "admin-test", role: "ADMIN" }

test("un administrateur autorisé obtient une URL signée pour un document de candidature associé", async () => {
  const document = { id: "document-test", applicationId: "application-test", storageKey: "candidate-test.pdf" }
  const result = await authorizeDocumentDownload({
    session: adminSession,
    findDocument: async () => document,
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: async (item) => `https://storage.test/${item.storageKey}`,
  })

  assert.deepEqual(result, {
    kind: "ready",
    document,
    signedUrl: "https://storage.test/candidate-test.pdf",
  })
})

test("un administrateur autorisé obtient une URL signée pour un document partenaire associé", async () => {
  const document = { id: "document-test", partnerId: null, partnerRequestId: "request-test", storageKey: "partner-test.pdf" }
  const result = await authorizeDocumentDownload({
    session: adminSession,
    findDocument: async () => document,
    isAssociatedWithRecord: isPartnerDocumentAssociatedWithRecord,
    createSignedUrl: async (item) => `https://storage.test/${item.storageKey}`,
  })

  assert.equal(result.kind, "ready")
  assert.equal(result.kind === "ready" ? result.signedUrl : null, "https://storage.test/partner-test.pdf")
})

test("un utilisateur non authentifié est refusé avant la recherche et la signature", async () => {
  let lookedUp = false
  let signed = false
  const result = await authorizeDocumentDownload({
    session: null,
    findDocument: async () => { lookedUp = true; return null },
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: async () => { signed = true; return "https://storage.test/should-not-exist" },
  })

  assert.deepEqual(result, { kind: "unauthenticated" })
  assert.equal(lookedUp, false)
  assert.equal(signed, false)
})

test("les rôles non administratifs ne peuvent pas obtenir de lien signé", async () => {
  let signed = false
  const result = await authorizeDocumentDownload({
    session: { userId: "editor-test", role: "EDITOR" },
    findDocument: async () => ({ applicationId: "application-test" }),
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: async () => { signed = true; return "https://storage.test/should-not-exist" },
  })

  assert.deepEqual(result, { kind: "forbidden" })
  assert.equal(signed, false)
})

test("un document inexistant ou sans enregistrement associé ne reçoit jamais d'URL signée", async () => {
  let signedCount = 0
  const sign = async () => { signedCount += 1; return "https://storage.test/should-not-exist" }
  const missing = await authorizeDocumentDownload({
    session: adminSession,
    findDocument: async () => null,
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: sign,
  })
  const unattachedApplicationDoc = await authorizeDocumentDownload({
    session: adminSession,
    findDocument: async () => ({ applicationId: "" }),
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: sign,
  })
  const unattachedPartnerDoc = await authorizeDocumentDownload({
    session: adminSession,
    findDocument: async () => ({ partnerId: null, partnerRequestId: null }),
    isAssociatedWithRecord: isPartnerDocumentAssociatedWithRecord,
    createSignedUrl: sign,
  })

  assert.deepEqual(missing, { kind: "not-found" })
  assert.deepEqual(unattachedApplicationDoc, { kind: "not-found" })
  assert.deepEqual(unattachedPartnerDoc, { kind: "not-found" })
  assert.equal(signedCount, 0)
})
