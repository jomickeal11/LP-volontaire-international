import { createHash, createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto"
import { createReadStream } from "node:fs"
import { open, rm, stat } from "node:fs/promises"

export const TRANSFER_FORMAT = "apticr-portable-transfer"
export const TRANSFER_VERSION = 1
const MAGIC = Buffer.from("APTICR01", "ascii")
const SALT_BYTES = 16
const IV_BYTES = 12
const TAG_BYTES = 16
const CHUNK_BYTES = 1024 * 1024
const HEADER_BYTES = MAGIC.length + SALT_BYTES + 4 + 4 + 8
const MIN_PASSPHRASE_LENGTH = 20

export function validatePassphrase(passphrase) {
  if (typeof passphrase !== "string" || Buffer.byteLength(passphrase, "utf8") < MIN_PASSPHRASE_LENGTH) {
    throw new Error(`La phrase de chiffrement doit contenir au moins ${MIN_PASSPHRASE_LENGTH} octets.`)
  }
}

function deriveKey(passphrase, salt) {
  validatePassphrase(passphrase)
  return scryptSync(passphrase, salt, 32, { N: 1 << 15, r: 8, p: 1, maxmem: 128 * 1024 * 1024 })
}

function aad(header, index) {
  const indexBytes = Buffer.alloc(4)
  indexBytes.writeUInt32BE(index)
  return Buffer.concat([MAGIC, header.subarray(MAGIC.length, HEADER_BYTES), indexBytes])
}

async function writeAll(handle, buffer) {
  let offset = 0
  while (offset < buffer.length) {
    const { bytesWritten } = await handle.write(buffer, offset, buffer.length - offset)
    if (bytesWritten <= 0) throw new Error("Écriture incomplète du fichier de transfert.")
    offset += bytesWritten
  }
}

class AsyncFileReader {
  constructor(filePath) {
    this.iterator = createReadStream(filePath, { highWaterMark: CHUNK_BYTES })[Symbol.asyncIterator]()
    this.buffer = Buffer.alloc(0)
    this.ended = false
  }

  async readExactly(length, allowCleanEof = false) {
    while (this.buffer.length < length && !this.ended) {
      const next = await this.iterator.next()
      if (next.done) this.ended = true
      else this.buffer = this.buffer.length ? Buffer.concat([this.buffer, next.value]) : next.value
    }
    if (this.buffer.length < length) {
      if (allowCleanEof && this.buffer.length === 0) return null
      throw new Error("Archive tronquée ou invalide.")
    }
    const result = this.buffer.subarray(0, length)
    this.buffer = this.buffer.subarray(length)
    return result
  }

  async assertEnd() {
    if (this.buffer.length) throw new Error("Données inattendues après la fin de l’archive.")
    if (!this.ended) {
      const next = await this.iterator.next()
      if (!next.done) throw new Error("Données inattendues après la fin de l’archive.")
      this.ended = true
    }
  }
}

export async function encryptFile(inputPath, outputPath, passphrase) {
  validatePassphrase(passphrase)
  const inputInfo = await stat(inputPath)
  if (!inputInfo.isFile() || inputInfo.size <= 0 || inputInfo.size > Number.MAX_SAFE_INTEGER) {
    throw new Error("Le flux compressé est vide ou trop volumineux pour le format de transfert.")
  }
  const totalBytes = inputInfo.size
  const chunks = Math.ceil(totalBytes / CHUNK_BYTES)
  if (chunks > 0xffffffff) throw new Error("Le flux dépasse la limite du format de transfert.")

  const salt = randomBytes(SALT_BYTES)
  const key = deriveKey(passphrase, salt)
  const header = Buffer.alloc(HEADER_BYTES)
  MAGIC.copy(header, 0)
  salt.copy(header, MAGIC.length)
  header.writeUInt32BE(CHUNK_BYTES, MAGIC.length + SALT_BYTES)
  header.writeUInt32BE(chunks, MAGIC.length + SALT_BYTES + 4)
  header.writeBigUInt64BE(BigInt(totalBytes), MAGIC.length + SALT_BYTES + 8)

  let output
  try {
    output = await open(outputPath, "wx", 0o600)
    await writeAll(output, header)
    const reader = createReadStream(inputPath, { highWaterMark: CHUNK_BYTES })[Symbol.asyncIterator]()
    let index = 0
    let actualBytes = 0
    for (;;) {
      const next = await reader.next()
      if (next.done) break
      const plain = next.value
      const iv = randomBytes(IV_BYTES)
      const cipher = createCipheriv("aes-256-gcm", key, iv)
      cipher.setAAD(aad(header, index))
      const encrypted = Buffer.concat([cipher.update(plain), cipher.final()])
      const length = Buffer.alloc(4)
      length.writeUInt32BE(plain.length)
      await writeAll(output, Buffer.concat([length, iv, cipher.getAuthTag(), encrypted]))
      index++
      actualBytes += plain.length
    }
    if (index !== chunks || actualBytes !== totalBytes) throw new Error("Le fichier source a changé pendant le chiffrement.")
    await output.sync()
    await output.close()
    output = null
    return { bytes: (await stat(outputPath)).size, sha256: await sha256File(outputPath) }
  } catch (error) {
    await output?.close().catch(() => undefined)
    await rm(outputPath, { force: true }).catch(() => undefined)
    throw error
  }
}

export async function decryptFile(inputPath, outputPath, passphrase) {
  validatePassphrase(passphrase)
  let output
  try {
    const reader = new AsyncFileReader(inputPath)
    const header = await reader.readExactly(HEADER_BYTES)
    if (!header.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error("Format d’archive APTIC-R inconnu.")
    const salt = header.subarray(MAGIC.length, MAGIC.length + SALT_BYTES)
    const chunkSize = header.readUInt32BE(MAGIC.length + SALT_BYTES)
    const chunkCount = header.readUInt32BE(MAGIC.length + SALT_BYTES + 4)
    const totalBytes = Number(header.readBigUInt64BE(MAGIC.length + SALT_BYTES + 8))
    if (chunkSize !== CHUNK_BYTES || !Number.isSafeInteger(totalBytes) || totalBytes <= 0 || chunkCount !== Math.ceil(totalBytes / chunkSize)) {
      throw new Error("En-tête de l’archive invalide.")
    }
    const key = deriveKey(passphrase, salt)
    output = await open(outputPath, "wx", 0o600)
    let actualBytes = 0
    for (let index = 0; index < chunkCount; index++) {
      const lengthBytes = await reader.readExactly(4)
      const length = lengthBytes.readUInt32BE(0)
      const expectedLength = Math.min(chunkSize, totalBytes - actualBytes)
      if (length !== expectedLength) throw new Error("Taille d’un bloc de l’archive invalide.")
      const iv = await reader.readExactly(IV_BYTES)
      const tag = await reader.readExactly(TAG_BYTES)
      const encrypted = await reader.readExactly(length)
      const decipher = createDecipheriv("aes-256-gcm", key, iv)
      decipher.setAAD(aad(header, index))
      decipher.setAuthTag(tag)
      const plain = Buffer.concat([decipher.update(encrypted), decipher.final()])
      await writeAll(output, plain)
      actualBytes += plain.length
    }
    if (actualBytes !== totalBytes) throw new Error("La taille déchiffrée ne correspond pas à l’en-tête.")
    await reader.assertEnd()
    await output.sync()
    await output.close()
    output = null
    return { bytes: actualBytes, sha256: await sha256File(outputPath) }
  } catch (error) {
    await output?.close().catch(() => undefined)
    await rm(outputPath, { force: true }).catch(() => undefined)
    throw error
  }
}

export async function sha256File(filePath) {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(filePath)) hash.update(chunk)
  return hash.digest("hex")
}

export function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex")
}

export function validateObjectKey(key) {
  if (typeof key !== "string" || !key || Buffer.byteLength(key, "utf8") > 1024) return false
  if (key.startsWith("/") || key.includes("\\") || /[\u0000-\u001f\u007f]/.test(key)) return false
  return key.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..")
}

export function databaseFingerprint(databaseUrl) {
  const url = new URL(databaseUrl)
  const identity = `${url.hostname.toLowerCase()}|${url.port || "5432"}|${decodeURIComponent(url.pathname).replace(/^\//, "").toLowerCase()}`
  return createHash("sha256").update(identity, "utf8").digest("hex")
}

export function storageFingerprint(storageEndpoint) {
  const url = new URL(storageEndpoint)
  const identity = `${url.hostname.toLowerCase()}|${url.port || "443"}|${url.pathname.replace(/\/$/, "")}`
  return createHash("sha256").update(identity, "utf8").digest("hex")
}

export function validateManifest(manifest) {
  if (manifest?.format !== TRANSFER_FORMAT || manifest?.version !== TRANSFER_VERSION) throw new Error("Version du manifeste non prise en charge.")
  if (!/^[a-f0-9]{64}$/.test(manifest.source?.databaseFingerprint || "")) throw new Error("Empreinte source absente ou invalide.")
  if (!/^[a-f0-9]{64}$/.test(manifest.source?.storageFingerprint || "")) throw new Error("Empreinte du stockage source absente ou invalide.")
  if (!manifest.database || manifest.database.path !== "database.dump" || !Number.isSafeInteger(manifest.database.bytes) || manifest.database.bytes <= 0 || !/^[a-f0-9]{64}$/.test(manifest.database.sha256 || "")) {
    throw new Error("Entrée de sauvegarde de base invalide dans le manifeste.")
  }
  if (!Array.isArray(manifest.extensions) || manifest.extensions.some((extension) => !/^[a-z0-9_]+$/i.test(extension?.name || "") || typeof extension?.version !== "string" || !extension.version)) {
    throw new Error("Liste des extensions PostgreSQL invalide dans le manifeste.")
  }
  const seen = new Set()
  for (const bucket of ["documents", "media"]) {
    const section = manifest.buckets?.[bucket]
    if (!section || !Array.isArray(section.objects) || !Number.isSafeInteger(section.objectCount) || !Number.isSafeInteger(section.totalBytes)) {
      throw new Error(`Manifeste du bucket ${bucket} invalide.`)
    }
    if (section.objectCount !== section.objects.length) throw new Error(`Nombre d’objets incohérent pour ${bucket}.`)
    let total = 0
    for (const object of section.objects) {
      if (!validateObjectKey(object.key) || !Number.isSafeInteger(object.bytes) || object.bytes < 0 || !/^[a-f0-9]{64}$/.test(object.sha256 || "")) {
        throw new Error(`Métadonnées d’objet invalides dans ${bucket}.`)
      }
      if (object.metadata !== undefined && (!object.metadata || typeof object.metadata !== "object" || Array.isArray(object.metadata) || Object.entries(object.metadata).some(([key, value]) => !key || typeof value !== "string"))) {
        throw new Error(`Métadonnées personnalisées invalides dans ${bucket}.`)
      }
      if (!/^objects\/(documents|media)\/\d{8}\.bin$/.test(object.path) || !object.path.startsWith(`objects/${bucket}/`)) {
        throw new Error(`Chemin de contenu invalide dans ${bucket}.`)
      }
      const identity = `${bucket}\0${object.key}`
      if (seen.has(identity)) throw new Error(`Clé d’objet dupliquée dans ${bucket}.`)
      seen.add(identity)
      total += object.bytes
      if (!Number.isSafeInteger(total)) throw new Error(`Volume trop important pour le manifeste du bucket ${bucket}.`)
    }
    if (total !== section.totalBytes) throw new Error(`Volume incohérent pour ${bucket}.`)
  }
  return manifest
}
