import { test } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import ts from "typescript"

const permissionsSource = await readFile(new URL("../src/lib/admin-permissions.ts", import.meta.url), "utf8")
const permissionsJs = ts.transpileModule(permissionsSource, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const permissionsUrl = `data:text/javascript;base64,${Buffer.from(permissionsJs).toString("base64")}`
async function importTypeScript(path, replacements = []) {
  let source = await readFile(new URL(path, import.meta.url), "utf8")
  for (const [from, to] of replacements) source = source.replaceAll(from, to)
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`)
}
const navigation = await importTypeScript("../src/lib/admin-navigation.ts", [[`from "./admin-permissions"`, `from "${permissionsUrl}"`]])
const policy = await importTypeScript("../src/lib/admin-management-policy.ts", [[`from "./admin-permissions"`, `from "${permissionsUrl}"`]])

test("chaque rôle ne voit que ses rubriques autorisées", () => {
  const pages = ["admin-dashboard", "admin-analytics", "admin-applications", "admin-articles", "admin-newsletter-campaigns", "admin-settings", "admin-users", "admin-account", "admin-events"]
  assert.deepEqual(navigation.getVisibleAdminPages("SUPER_ADMIN", pages), pages)
  assert.deepEqual(navigation.getVisibleAdminPages("CONTENT_ADMIN", pages), ["admin-dashboard", "admin-articles", "admin-newsletter-campaigns", "admin-settings", "admin-account", "admin-events"])
  assert.deepEqual(navigation.getVisibleAdminPages("REQUEST_MANAGER", pages), ["admin-dashboard", "admin-applications", "admin-account", "admin-events"])
})

test("les anciens rôles conservent leur correspondance temporaire sans conversion en base", () => {
  assert.equal(navigation.canRoleSeeAdminPage("ADMIN", "admin-users"), true)
  assert.equal(navigation.canRoleSeeAdminPage("CONTENT_MANAGER", "admin-articles"), true)
  assert.equal(navigation.canRoleSeeAdminPage("COORDINATOR", "admin-applications"), true)
  assert.equal(navigation.canRoleSeeAdminPage("EDITOR", "admin-articles"), false)
  assert.equal(navigation.canRoleSeeAdminPage("REVIEWER", "admin-applications"), false)
})

test("une invitation doit être envoyée et non expirée; les états consommés ou invalidés ne passent pas", () => {
  const now = new Date("2026-10-11T12:00:00.000Z")
  assert.equal(policy.isInvitationUsable({ status: "SENT", expiresAt: new Date("2026-10-12T12:00:00.000Z") }, now), true)
  for (const status of ["ACCEPTED", "INVALIDATED", "FAILED", "PENDING"]) {
    assert.equal(policy.isInvitationUsable({ status, expiresAt: new Date("2026-10-12T12:00:00.000Z") }, now), false)
  }
  assert.equal(policy.isInvitationUsable({ status: "SENT", expiresAt: now }, now), false)
})

test("le dernier super-administrateur actif ne peut pas être supprimé, désactivé ou rétrogradé", () => {
  assert.equal(policy.canRemoveActiveSuperAdmin(0), false)
  assert.equal(policy.canRemoveActiveSuperAdmin(1), false)
  assert.equal(policy.canRemoveActiveSuperAdmin(2), true)
  assert.equal(policy.isActiveSuperAdmin("ADMIN", true), true)
  assert.equal(policy.isActiveSuperAdmin("SUPER_ADMIN", false), false)
})

test("pages et actions de gestion exigent l'autorisation serveur et le schéma est additif", async () => {
  const [page, actions, migration] = await Promise.all([
    readFile(new URL("../src/app/backoffice/(protected)/administrateurs/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/admin-management-actions.ts", import.meta.url), "utf8"),
    readFile(new URL("../prisma/migrations/20261011140000_admin_roles_invitations/migration.sql", import.meta.url), "utf8"),
  ])
  assert.match(page, /requireAdminPagePermission\("admin-users:manage"\)/)
  assert.match(actions, /hasAdminPermission\(session\.role, "admin-users:manage"\)/)
  assert.match(actions, /randomBytes\(32\)/)
  assert.match(actions, /createHash\("sha256"\)/)
  assert.match(actions, /Serializable/)
  assert.match(migration, /ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true/)
  assert.match(migration, /CREATE TABLE "InvitationAdministrateur"/)
  assert.doesNotMatch(migration, /DROP TABLE|DROP COLUMN|UPDATE "Utilisateur"/i)
})

test("invalidation de session après désactivation et auto-suppression", async () => {
  const actions = await readFile(new URL("../src/lib/admin-management-actions.ts", import.meta.url), "utf8")
  const auth = await readFile(new URL("../src/lib/auth.ts", import.meta.url), "utf8")
  assert.match(actions, /sessionVersion: \{ increment: 1 \}/)
  assert.match(actions, /const selfRevoked = parsed\.data\.userId === actor\.userId && \(parsed\.data\.active === false \|\| parsed\.data\.role !== undefined\)/)
  assert.match(actions, /if \(userId === actor\.userId\) await deleteSession\(\)/)
  assert.match(actions, /updateMany\(\{ where: \{ assignedToId: userId \}, data: \{ assignedToId: null \} \}\)/)
  assert.match(actions, /updateMany\(\{ where: \{ authorId: userId \}, data: \{ authorId: null \} \}\)/)
  assert.match(auth, /if \(!user\.active \|\| user\.sessionVersion !== tokenSessionVersion\)/)
})
