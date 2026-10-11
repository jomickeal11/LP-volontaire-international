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

const {
  changeOwnPassword,
  confirmOwnEmailChange,
  requestOwnEmailChange,
  updateOwnDisplayName,
} = require("../src/lib/account-service.ts")

class FakeAccountRepository {
  account = {
    id: "admin-1",
    name: "Admin",
    email: "admin@apticr.example",
    passwordHash: "stored-hash",
    role: "ADMIN",
    sessionVersion: 0,
  }
  otherEmails = new Set(["taken@apticr.example"])
  pending = null
  lastPasswordHash = null

  async updateDisplayName(userId, name) {
    assert.equal(userId, this.account.id)
    this.account.name = name
  }
  async findAccount(userId) {
    return userId === this.account.id ? { ...this.account } : null
  }
  async isEmailUnavailable(email, excludingUserId) {
    return this.otherEmails.has(email) || Boolean(this.pending && this.pending.userId !== excludingUserId && this.pending.newEmail === email)
  }
  async replacePendingEmailChange(input) {
    this.pending = { id: "request-1", ...input, status: "PENDING" }
    return { ...this.pending }
  }
  async setEmailChangeStatus(id, tokenHash, status) {
    if (!this.pending || this.pending.id !== id || this.pending.tokenHash !== tokenHash) return false
    this.pending.status = status
    return true
  }
  async findPendingEmailChange(tokenHash) {
    return this.pending?.tokenHash === tokenHash ? { ...this.pending } : null
  }
  async confirmPendingEmailChange(input) {
    if (!this.pending || this.pending.id !== input.id || this.pending.status !== "SENT" || this.pending.tokenHash !== input.tokenHash || this.pending.expiresAt <= input.now) return "INVALID"
    if (this.otherEmails.has(input.newEmail)) return "EMAIL_TAKEN"
    this.account.email = input.newEmail
    this.pending = null
    return "CONFIRMED"
  }
  async updatePasswordHash(userId, passwordHash) {
    assert.equal(userId, this.account.id)
    this.lastPasswordHash = passwordHash
    this.account.passwordHash = passwordHash
    this.account.sessionVersion += 1
    return { role: this.account.role, sessionVersion: this.account.sessionVersion }
  }
}

const fixedToken = "a".repeat(43)
const hashToken = (token) => createHash("sha256").update(token, "utf8").digest("hex")

test("le profil autorisé ne modifie que son nom; une session absente et un nom invalide sont refusés", async () => {
  const repository = new FakeAccountRepository()
  assert.deepEqual(await updateOwnDisplayName("admin-1", { name: "  Responsable APTIC-R  " }, repository), { success: true })
  assert.equal(repository.account.name, "Responsable APTIC-R")
  assert.equal(repository.account.email, "admin@apticr.example")
  assert.equal((await updateOwnDisplayName(null, { name: "Autre compte" }, repository)).success, false)
  assert.equal((await updateOwnDisplayName("admin-1", { name: "x" }, repository)).success, false)
})

test("une adresse invalide ou déjà utilisée ne déclenche aucun envoi", async () => {
  const repository = new FakeAccountRepository()
  let sendCount = 0
  const dependencies = { createToken: () => fixedToken, sendConfirmation: async () => { sendCount += 1; return true } }
  assert.equal((await requestOwnEmailChange("admin-1", { email: "invalid", lang: "FR" }, repository, dependencies)).success, false)
  assert.equal((await requestOwnEmailChange("admin-1", { email: "taken@apticr.example", lang: "FR" }, repository, dependencies)).success, false)
  assert.equal((await requestOwnEmailChange(null, { email: "new@apticr.example", lang: "FR" }, repository, dependencies)).success, false)
  assert.equal(sendCount, 0)
  assert.equal(repository.pending, null)
})

test("l’échec du fournisseur est signalé et conserve l’adresse actuelle; seul le hash du jeton est stocké", async () => {
  const repository = new FakeAccountRepository()
  const result = await requestOwnEmailChange("admin-1", { email: "new@apticr.example", lang: "FR" }, repository, {
    createToken: () => fixedToken,
    sendConfirmation: async () => false,
    now: () => new Date("2026-10-11T10:00:00Z"),
  })
  assert.equal(result.success, false)
  assert.equal(result.code, "EMAIL_SEND_FAILED")
  assert.equal(result.status, "FAILED")
  assert.equal(repository.account.email, "admin@apticr.example")
  assert.equal(repository.pending.tokenHash, hashToken(fixedToken))
  assert.notEqual(repository.pending.tokenHash, fixedToken)
})

test("un jeton invalide, expiré ou déjà utilisé ne change pas l’adresse", async () => {
  const repository = new FakeAccountRepository()
  const now = new Date("2026-10-11T10:00:00Z")
  const invalid = await confirmOwnEmailChange("invalid", repository, now)
  assert.equal(invalid.success, false)
  assert.match(invalid.error, /invalide ou expiré/i)

  repository.pending = {
    id: "expired-request",
    userId: "admin-1",
    newEmail: "new@apticr.example",
    tokenHash: hashToken(fixedToken),
    expiresAt: new Date(now.getTime() - 1),
    status: "SENT",
  }
  const expired = await confirmOwnEmailChange(fixedToken, repository, now)
  assert.equal(expired.success, false)
  assert.equal(repository.account.email, "admin@apticr.example")
})

test("la nouvelle adresse n’est activée qu’après confirmation valide; le lien est à usage unique", async () => {
  const repository = new FakeAccountRepository()
  const result = await requestOwnEmailChange("admin-1", { email: "new@apticr.example", lang: "EN" }, repository, {
    createToken: () => fixedToken,
    sendConfirmation: async ({ recipient, token, lang }) => recipient === "new@apticr.example" && token === fixedToken && lang === "EN",
    now: () => new Date("2026-10-11T10:00:00Z"),
  })
  assert.equal(result.success, true)
  assert.equal(repository.account.email, "admin@apticr.example")
  const confirmed = await confirmOwnEmailChange(fixedToken, repository, new Date("2026-10-11T10:01:00Z"))
  assert.equal(confirmed.success, true)
  assert.equal(repository.account.email, "new@apticr.example")
  assert.equal((await confirmOwnEmailChange(fixedToken, repository, new Date("2026-10-11T10:02:00Z"))).success, false)
})

test("le mot de passe actuel est vérifié avant tout hachage ou invalidation de session", async () => {
  const repository = new FakeAccountRepository()
  let hashCount = 0
  const hasher = {
    compare: async (plain, stored) => plain === "correct-current" && stored === "stored-hash",
    hash: async () => { hashCount += 1; return "new-bcrypt-hash" },
  }
  const wrong = await changeOwnPassword("admin-1", {
    currentPassword: "wrong-current",
    newPassword: "SecureNewPass123!",
    confirmPassword: "SecureNewPass123!",
  }, repository, hasher)
  assert.equal(wrong.success, false)
  assert.equal(hashCount, 0)
  assert.equal(repository.account.sessionVersion, 0)

  const changed = await changeOwnPassword("admin-1", {
    currentPassword: "correct-current",
    newPassword: "SecureNewPass123!",
    confirmPassword: "SecureNewPass123!",
  }, repository, hasher)
  assert.equal(changed.success, true)
  assert.equal(changed.sessionVersion, 1)
  assert.equal(repository.lastPasswordHash, "new-bcrypt-hash")
  assert.notEqual(repository.lastPasswordHash, "SecureNewPass123!")
})
