import fs from "node:fs"
import path from "node:path"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const root = process.cwd()
const envRaw = fs.existsSync(path.join(root, ".env"))
  ? fs.readFileSync(path.join(root, ".env"), "utf8")
  : ""
const env = {}
for (const line of envRaw.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}
process.env.DATABASE_URL = env.DATABASE_URL || ""

const hasSecret = Boolean(env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length >= 16)
console.log("NEXTAUTH_SECRET present & >=16 chars:", hasSecret)
console.log("DATABASE_URL present:", Boolean(env.DATABASE_URL))

if (!env.DATABASE_URL) {
  console.log("DB : non testable (.env sans DATABASE_URL)")
  process.exit(0)
}

const { PrismaClient } = await import("@prisma/client")
const prisma = new PrismaClient()

try {
  const users = await prisma.utilisateur.findMany({ select: { id: true, role: true, passwordHash: true } })
  const withHash = users.filter((u) => u.passwordHash && u.passwordHash.startsWith("$2"))
  console.log("DB reachable: yes")
  console.log("utilisateur count:", users.length)
  console.log("admins (roles):", users.map((u) => u.role).join(",") || "aucun")
  console.log("users with bcrypt hash:", withHash.length)
  if (users[0]) console.log("example user id:", users[0].id)
} catch (err) {
  console.log("DB reachable: no —", err.message || err)
} finally {
  await prisma.$disconnect().catch(() => {})
}

const BASE = process.env.PROBE_BASE || "http://localhost:3000"

async function mint(secret, { expired = false, ghost = false } = {}) {
  const expMs = Date.now() + (expired ? -60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)
  return await new SignJWT({
    userId: ghost ? "ghost-user-id-not-in-db" : (env.PROBE_USER_ID || "cmtwt5x090000i0okwp6eja0y"),
    role: "SUPERADMIN",
    expiresAt: new Date(expMs).toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expired ? "-1h" : "7d")
    .sign(new TextEncoder().encode(secret))
}

const scenarios = {
  "NO-COOKIE (état post-logout / jamais connecté)": null,
  "SESSION VALIDE (minté, signature réelle)": null,
  "SESSION EXPIRÉE (exp = -1h)": "exp",
  "SESSION INVALIDE (garbage signé autrement)": "invalid",
  "SESSION GHOST (utilisateur inexistant en DB)": "ghost",
}

const probes = [
  ["GET", "/backoffice/dashboard"],
  ["GET", "/backoffice/members/applications"],
  ["GET", "/api/documents/00000000-0000-4000-8000-000000000000"],
  ["POST", "/api/upload/presign", JSON.stringify({ kind: "image", fileName: "probe.png", size: 1024, contentType: "image/png" })],
]

function label(status, bodyText, location) {
  if (status === 307) return `307 → ${location || "?"}`
  if (!bodyText) return String(status)
  const hint = bodyText.slice(0, 60).replace(/\s+/g, " ")
  return `${status} ${hint}${status === 200 ? (hint.includes("success") ? " [OK] " : " [PAGE]") : ""}`
}

for (const [name, mode] of Object.entries(scenarios)) {
  let cookie
  if (mode === "invalid") {
    cookie = "session=" + Buffer.from("forged-value").toString("base64url") + "." + Buffer.from("forged-value").toString("base64url") + ".sig"
  } else if (mode === "exp" || mode === "ghost") {
    cookie = "session=" + (await mint(env.NEXTAUTH_SECRET, { expired: mode === "exp", ghost: mode === "ghost" }))
  } else if (mode === null && name.startsWith("SESSION VALIDE")) {
    cookie = "session=" + (await mint(env.NEXTAUTH_SECRET))
  } else if (mode === null) {
    cookie = ""
  }
  console.log(`\n=== ${name} ===`)
  for (const [method, url, body] of probes) {
    try {
      const res = await fetch(BASE + url, {
        method,
        headers: {
          cookie,
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.2",
        },
        body: method === "POST" ? body : undefined,
        redirect: "manual",
      })
      const text = res.status === 307 ? "" : await res.text().catch(() => "")
      console.log(`  ${method} ${url} → ${label(res.status, text, res.headers.get("location"))}`)
    } catch (err) {
      console.log(`  ${method} ${url} → ERREUR ${err.message}`)
    }
  }
}