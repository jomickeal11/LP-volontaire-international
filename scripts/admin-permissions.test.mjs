import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../src/lib/admin-permissions.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText
const permissions = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`)

test("SUPER_ADMIN has global, deletion, send, and user-management permissions", () => {
  for (const permission of ["content:write", "requests:delete", "requests:export", "newsletter:send", "admin-users:manage"]) {
    assert.equal(permissions.hasAdminPermission("SUPER_ADMIN", permission), true)
  }
})

test("CONTENT_ADMIN manages content and campaign preparation but not requests or campaign launch", () => {
  assert.equal(permissions.hasAdminPermission("CONTENT_ADMIN", "content:write"), true)
  assert.equal(permissions.hasAdminPermission("CONTENT_ADMIN", "newsletter:prepare"), true)
  assert.equal(permissions.hasAdminPermission("CONTENT_ADMIN", "newsletter:send"), false)
  assert.equal(permissions.hasAdminPermission("CONTENT_ADMIN", "requests:read"), false)
  assert.equal(permissions.hasAdminPermission("CONTENT_ADMIN", "requests:delete"), false)
})

test("REQUEST_MANAGER handles permitted dossiers and exports but cannot change content or permanently delete", () => {
  for (const permission of ["requests:read", "requests:process", "requests:export", "candidate-document:read", "contact:manage"]) {
    assert.equal(permissions.hasAdminPermission("REQUEST_MANAGER", permission), true)
  }
  for (const permission of ["content:write", "newsletter:prepare", "newsletter:send", "requests:delete", "admin-users:manage"]) {
    assert.equal(permissions.hasAdminPermission("REQUEST_MANAGER", permission), false)
  }
})

test("legacy roles map temporarily and unknown or absent roles deny access", () => {
  assert.equal(permissions.hasAdminPermission("ADMIN", "admin-users:manage"), true)
  assert.equal(permissions.hasAdminPermission("CONTENT_MANAGER", "content:write"), true)
  assert.equal(permissions.hasAdminPermission("COORDINATOR", "requests:process"), true)
  assert.equal(permissions.hasAdminPermission("EDITOR", "requests:process"), false)
  assert.equal(permissions.hasAdminPermission("EDITOR", "backoffice:access"), false)
  assert.equal(permissions.hasAdminPermission("REVIEWER", "backoffice:access"), false)
  assert.equal(permissions.hasAdminPermission("UNRECOGNIZED", "backoffice:access"), false)
  assert.equal(permissions.hasAdminPermission(null, "backoffice:access"), false)
})

test("sensitive server entry points use the centralized permissions", async () => {
  const cases = [
    ["../src/lib/actions.ts", ["hasCurrentAdminPermission(\"requests:process\")", "hasCurrentAdminPermission(\"requests:delete\")"]],
    ["../src/lib/contact-actions.ts", ["hasCurrentAdminPermission(\"contact:manage\")", "hasCurrentAdminPermission(\"requests:delete\")"]],
    ["../src/lib/campaign-actions.ts", ["hasCurrentAdminPermission(\"campaign-links:manage\")"]],
    ["../src/lib/cms-actions.ts", ["isAdminSession(\"newsletter:send\")", "isAdminSession(\"requests:process\")"]],
    ["../src/app/api/upload/presign/route.ts", ["hasAdminPermission(session.role, \"uploads:content\")"]],
    ["../src/app/api/upload/confirm/route.ts", ["hasAdminPermission(session.role, \"uploads:content\")"]],
    ["../src/app/backoffice/(protected)/applications/page.tsx", ["requireAdminPagePermission(\"requests:read\")"]],
    ["../src/app/backoffice/(protected)/articles/page.tsx", ["requireAdminPagePermission(\"content:read\")"]],
  ]
  for (const [path, expected] of cases) {
    const text = await readFile(new URL(path, import.meta.url), "utf8")
    for (const guard of expected) assert.ok(text.includes(guard), `${path} is missing a permission guard`)
  }
})
