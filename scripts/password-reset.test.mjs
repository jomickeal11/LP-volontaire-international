import { test } from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const ts = require("typescript")
require.extensions[".ts"] = (module, filename) => {
  const source = require("node:fs").readFileSync(filename, "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  })
  module._compile(compiled.outputText, filename)
}

const { requestPasswordReset, resetPasswordWithToken } = require("../src/lib/password-reset-service.ts")
const fixedToken = "b".repeat(43)
const hashToken = (token) => createHash("sha256").update(token, "utf8").digest("hex")

class FakeResetRepository {
  account = { id: "admin-1", email: "admin@apticr.example", name: "Admin", passwordHash: "old-hash", sessionVersion: 0 }
  request = null

  async findUserByEmail(email) {
    return email === this.account.email ? { id: this.account.id, email: this.account.email, name: this.account.name } : null
  }
  async replaceResetRequest(input) {
    this.request = { id: "reset-1", ...input, status: "PENDING" }
    return { ...this.request }
  }
  async setResetRequestStatus(id, tokenHash, status) {
    if (!this.request || this.request.id !== id || this.request.tokenHash !== tokenHash || this.request.status !== "PENDING") return false
    this.request.status = status
    return true
  }
  async findResetRequest(tokenHash) {
    return this.request?.tokenHash === tokenHash ? { ...this.request } : null
  }
  async consumeResetAndUpdatePassword(input) {
    if (!this.request || this.request.id !== input.id || this.request.userId !== input.userId || this.request.status !== "SENT" || this.request.tokenHash !== input.tokenHash || this.request.expiresAt <= input.now) return false
    this.request.status = "USED"
    this.account.passwordHash = input.passwordHash
    this.account.sessionVersion += 1
    return true
  }
}

const now = new Date("2026-10-11T10:00:00Z")
const makeRequest = (repository, sendResetEmail = async () => true) => requestPasswordReset(
  { email: "ADMIN@apticr.example" },
  repository,
  { createToken: () => fixedToken, now: () => now, sendResetEmail },
)
const makeReset = (repository, token = fixedToken, when = new Date(now.getTime() + 1000)) => resetPasswordWithToken(
  { token, newPassword: "SecureNewPass123!", confirmPassword: "SecureNewPass123!" },
  repository,
  { hash: async (password) => `bcrypt:${password}` },
  when,
)

test("une demande connue stocke un hash et envoie un lien à usage limité", async () => {
  const repository = new FakeResetRepository()
  let sentTo = ""
  const result = await makeRequest(repository, async (input) => {
    sentTo = input.recipient
    assert.equal(input.token, fixedToken)
    return true
  })
  assert.equal(result.success, true)
  assert.equal(sentTo, repository.account.email)
  assert.equal(repository.request.tokenHash, hashToken(fixedToken))
  assert.notEqual(repository.request.tokenHash, fixedToken)
  assert.equal(repository.request.status, "SENT")
  assert.equal(repository.request.expiresAt.getTime() - now.getTime(), 30 * 60 * 1000)
})

test("adresse inconnue et échec d’envoi gardent la même réponse publique générique", async () => {
  const unknownRepository = new FakeResetRepository()
  let unknownSendCount = 0
  const unknown = await requestPasswordReset({ email: "unknown@apticr.example" }, unknownRepository, {
    sendResetEmail: async () => { unknownSendCount += 1; return true },
  })
  const failedRepository = new FakeResetRepository()
  const failed = await makeRequest(failedRepository, async () => false)
  assert.deepEqual(unknown, failed)
  assert.equal(unknownSendCount, 0)
  assert.equal(failedRepository.request.status, "FAILED")
  assert.equal((await makeReset(failedRepository)).success, false)
})

test("jeton invalide, expiré ou déjà utilisé ne change pas le mot de passe", async () => {
  const repository = new FakeResetRepository()
  await makeRequest(repository)
  const invalid = await makeReset(repository, "c".repeat(43))
  assert.equal(invalid.success, false)
  assert.match(invalid.error, /invalide ou expiré/i)

  repository.request.expiresAt = new Date(now.getTime())
  const expired = await makeReset(repository)
  assert.equal(expired.success, false)
  assert.equal(repository.account.passwordHash, "old-hash")

  repository.request.expiresAt = new Date(now.getTime() + 60_000)
  const accepted = await makeReset(repository)
  assert.equal(accepted.success, true)
  assert.equal(repository.account.passwordHash, `bcrypt:SecureNewPass123!`)
  assert.equal(repository.account.sessionVersion, 1)
  const reused = await makeReset(repository)
  assert.equal(reused.success, false)
  assert.equal(repository.account.sessionVersion, 1)
})
