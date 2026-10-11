import { test } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import ts from "typescript"

const permissionSource = await readFile(new URL("../src/lib/admin-permissions.ts", import.meta.url), "utf8")
const permissionJs = ts.transpileModule(permissionSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText
const permissionUrl = `data:text/javascript;base64,${Buffer.from(permissionJs).toString("base64")}`
const accessSource = await readFile(new URL("../src/lib/document-download-access.ts", import.meta.url), "utf8")
const accessJs = ts.transpileModule(accessSource.replace('from "./admin-permissions"', `from "${permissionUrl}"`), {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText
const {
  authorizeDocumentDownload,
  isCandidateDocumentAssociatedWithApplication,
  isPartnerDocumentAssociatedWithRecord,
} = await import(`data:text/javascript;base64,${Buffer.from(accessJs).toString("base64")}`)

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

test("REQUEST_MANAGER peut obtenir un document de dossier et CONTENT_ADMIN en est refusé", async () => {
  const document = { id: "document-test", applicationId: "application-test", storageKey: "candidate-test.pdf" }
  const requestManager = await authorizeDocumentDownload({
    session: { userId: "request-test", role: "REQUEST_MANAGER" },
    findDocument: async () => document,
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: async () => "https://storage.test/signed",
  })
  assert.equal(requestManager.kind, "ready")

  let signed = false
  const contentAdmin = await authorizeDocumentDownload({
    session: { userId: "content-test", role: "CONTENT_ADMIN" },
    findDocument: async () => document,
    isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
    createSignedUrl: async () => { signed = true; return "https://storage.test/signed" },
  })
  assert.equal(contentAdmin.kind, "forbidden")
  assert.equal(signed, false)
})
