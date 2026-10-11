import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import {
  decryptFile,
  databaseFingerprint,
  encryptFile,
  sha256Buffer,
  storageFingerprint,
  validateManifest,
  validateObjectKey,
  validatePassphrase,
} from "./portable-transfer-lib.mjs"

const passphrase = "transfer-test-passphrase-long-enough"

async function withTempDir(callback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "apticr-transfer-test-"))
  try { await callback(directory) } finally { await rm(directory, { recursive: true, force: true }) }
}

test("le chiffrement authentifié restitue le contenu sans perte", async () => {
  await withTempDir(async (directory) => {
    const original = Buffer.from("contenu isolé de test\0avec octets UTF-8 é", "utf8")
    const input = path.join(directory, "plain.bin")
    const encrypted = path.join(directory, "archive.apticr")
    const decrypted = path.join(directory, "restored.bin")
    await writeFile(input, original)
    await encryptFile(input, encrypted, passphrase)
    const result = await decryptFile(encrypted, decrypted, passphrase)
    assert.equal(result.sha256, await import("node:crypto").then(({ createHash }) => createHash("sha256").update(original).digest("hex")))
    assert.deepEqual(await readFile(decrypted), original)
  })
})

test("phrase incorrecte et archive altérée sont refusées", async () => {
  await withTempDir(async (directory) => {
    const input = path.join(directory, "plain.bin")
    const encrypted = path.join(directory, "archive.apticr")
    await writeFile(input, Buffer.from("contenu à authentifier"))
    await encryptFile(input, encrypted, passphrase)
    await assert.rejects(decryptFile(encrypted, path.join(directory, "wrong.bin"), "une-autre-phrase-de-test-longue"))
    const bytes = await readFile(encrypted)
    bytes[bytes.length - 1] ^= 1
    const tampered = path.join(directory, "tampered.apticr")
    await writeFile(tampered, bytes)
    await assert.rejects(decryptFile(tampered, path.join(directory, "tampered.bin"), passphrase))
    await assert.rejects(stat(path.join(directory, "tampered.bin")))
  })
})

test("les clés, empreintes et manifeste rejettent les entrées dangereuses", () => {
  assert.equal(validateObjectKey("candidatures/2026/cv.pdf"), true)
  assert.equal(validateObjectKey("../secret"), false)
  assert.equal(validateObjectKey("a\\b"), false)

  const databaseUrl = "postgresql://private-user:private-password@ep-example.neon.tech/apticr?sslmode=require"
  const fingerprint = databaseFingerprint(databaseUrl)
  assert.equal(/^[a-f0-9]{64}$/.test(fingerprint), true)
  assert.equal(fingerprint.includes("private"), false)
  assert.notEqual(storageFingerprint("https://storage-source.example/buckets"), storageFingerprint("https://storage-target.example/buckets"))

  const manifest = {
    format: "apticr-portable-transfer",
    version: 1,
    source: { label: "test", databaseFingerprint: "a".repeat(64), storageFingerprint: "c".repeat(64) },
    extensions: [{ name: "plpgsql", version: "1.0" }],
    database: { path: "database.dump", bytes: 1, sha256: "b".repeat(64) },
    buckets: Object.fromEntries(["documents", "media"].map((bucket) => [bucket, { objectCount: 1, totalBytes: 3, objects: [{ key: "folder/file.pdf", path: `objects/${bucket}/00000001.bin`, bytes: 3, sha256: sha256Buffer(Buffer.from("abc")), contentType: "application/pdf", metadata: { source: "test" } }] }])),
  }
  assert.equal(validateManifest(manifest), manifest)
  assert.throws(() => validateManifest({ ...manifest, buckets: { ...manifest.buckets, documents: { ...manifest.buckets.documents, objects: [{ ...manifest.buckets.documents.objects[0], key: "../escape" }] } } }))
})

test("les phrases trop courtes sont rejetées", () => {
  assert.throws(() => validatePassphrase("short"))
  assert.doesNotThrow(() => validatePassphrase(passphrase))
})
