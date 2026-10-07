import { Files } from "files-sdk"
import { neon } from "files-sdk/neon"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env", import.meta.url), "utf8")
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000"
const mediaFiles = new Files({ adapter: neon({ bucket: "media" }) })

let failures = 0
function check(name, condition, extra = "") {
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`)
  if (!condition) failures++
}

async function presign(kind, fileName, size, contentType) {
  const res = await fetch(`${BASE}/api/upload/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, fileName, size, contentType }),
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

async function confirm(kind, key, fileName, contentType) {
  const res = await fetch(`${BASE}/api/upload/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, key, fileName, contentType }),
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

async function directUpload(signed, bytes, fileName, contentType) {
  const form = new FormData()
  for (const [field, value] of Object.entries(signed.fields)) form.append(field, value)
  form.append("file", new Blob([bytes], { type: contentType }), fileName)
  const res = await fetch(signed.url, { method: "POST", body: form })
  return res.status
}

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3])
const FAKE_BYTES = new TextEncoder().encode("ceci n'est pas un pdf")

// ── 1. Garde-fous ────────────────────────────────────────────────────────────
let r = await presign("image", "photo.png", 1000, "image/png")
check("presign image sans session → 401", r.status === 401, `status=${r.status}`)

r = await presign("inconnu", "x.pdf", 10, "application/pdf")
check("kind invalide → 400", r.status === 400, `status=${r.status}`)

r = await presign("candidate-doc", "cv.pdf", 20 * 1024 * 1024, "application/pdf")
check("fichier > 15 Mo → 400", r.status === 400, `status=${r.status}`)

r = await presign("candidate-doc", "malware.exe", 100, "application/octet-stream")
check("extension refusée → 400", r.status === 400, `status=${r.status}`)

// ── 2. Upload direct valide (document privé) ─────────────────────────────────
r = await presign("candidate-doc", "cv-test.pdf", PDF_BYTES.length, "application/pdf")
check("presign candidate-doc → 200 + POST signé", r.status === 200 && r.body?.method === "POST" && r.body?.fields?.key, `status=${r.status}`)
const signed = r.body

const uploadStatus = await directUpload(signed, PDF_BYTES, "cv-test.pdf", "application/pdf")
check("envoi direct vers le stockage → 204", uploadStatus === 204, `status=${uploadStatus}`)

let c = await confirm("candidate-doc", signed.key, "cv-test.pdf", "application/pdf")
check("confirm PDF valide → 200", c.status === 200 && c.body?.success === true && c.body?.fileSize === PDF_BYTES.length, `status=${c.status} size=${c.body?.fileSize}`)

// ── 3. Magic bytes KO → rejet + suppression ──────────────────────────────────
r = await presign("candidate-doc", "faux.pdf", FAKE_BYTES.length, "application/pdf")
const badSigned = r.body
const badStatus = await directUpload(badSigned, FAKE_BYTES, "faux.pdf", "application/pdf")
c = await confirm("candidate-doc", badSigned.key, "faux.pdf", "application/pdf")
check("confirm contenu invalide → 400", badStatus === 204 && c.status === 400, `upload=${badStatus} confirm=${c.status} msg=${c.body?.error}`)
await new Promise((resolve) => setTimeout(resolve, 1500))
check("objet invalide supprimé du stockage", !(await mediaFiles.exists(badSigned.key)))

// ── 4. Service des médias publics ────────────────────────────────────────────
const LOCAL_KEY = "team/team_1789770290530_ca93f527.png"
const localRes = await fetch(`${BASE}/uploads/${LOCAL_KEY}`)
check(
  "média présent localement → 200 image/png",
  localRes.status === 200 && (localRes.headers.get("content-type") || "").includes("image/png"),
  `status=${localRes.status}`
)

const BUCKET_ONLY_KEY = "team/__runtime_probe.png"
await mediaFiles.upload(BUCKET_ONLY_KEY, PDF_BYTES.slice(0, 4), { contentType: "image/png" })
const bucketRes = await fetch(`${BASE}/uploads/${BUCKET_ONLY_KEY}`)
check(
  "média absent localement → redirection vers le bucket",
  bucketRes.status === 200 && bucketRes.url.startsWith(process.env.AWS_ENDPOINT_URL_S3 || "https://undefined"),
  `status=${bucketRes.status} url=${bucketRes.url}`
)

const traversal = await fetch(`${BASE}/uploads/team/..%2F..%2F.env`)
check("path traversal refusé → 404", traversal.status === 404, `status=${traversal.status}`)

// ── 5. Passage par next/image ────────────────────────────────────────────────
const imageLocal = await fetch(`${BASE}/_next/image?url=%2Fuploads%2F${encodeURIComponent(LOCAL_KEY)}&w=384&q=75`)
check("next/image (fichier local) → 200", imageLocal.status === 200, `status=${imageLocal.status}`)

const imageBucket = await fetch(`${BASE}/_next/image?url=%2Fuploads%2F${encodeURIComponent(BUCKET_ONLY_KEY)}&w=384&q=75`)
check("next/image (fichier bucket) → 200", imageBucket.status === 200, `status=${imageBucket.status}`)

await mediaFiles.delete(BUCKET_ONLY_KEY).catch(() => undefined)

console.log(failures === 0 ? "\nTOUS LES TESTS PASSENT" : `\n${failures} ÉCHEC(S)`)
process.exit(failures === 0 ? 0 : 1)
