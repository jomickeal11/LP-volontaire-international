import { spawn } from "node:child_process"
import { access, mkdtemp, mkdir, realpath, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Files } from "files-sdk"
import { neon } from "files-sdk/neon"
import { TRANSFER_FORMAT, TRANSFER_VERSION, databaseFingerprint, decryptFile, encryptFile, sha256Buffer, sha256File, storageFingerprint, validateObjectKey, validatePassphrase } from "./portable-transfer-lib.mjs"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const chunkSize = 1024 * 1024

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === "--allow-production-export") { args.allowProduction = true; continue }
    if (!arg.startsWith("--") || !argv[index + 1] || argv[index + 1].startsWith("--")) throw new Error(`Argument invalide : ${arg}`)
    const key = arg.slice(2)
    if (!["output", "source-label", "confirm-source-label", "workdir"].includes(key)) throw new Error(`Argument inconnu : ${arg}`)
    args[key] = argv[++index]
  }
  return args
}

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Variable requise absente : ${name}`)
  return value
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: options.capture ? ["ignore", "pipe", "ignore"] : "ignore", env: options.env })
    let stdout = ""
    if (options.capture) child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk })
    child.once("error", () => reject(new Error(`Outil requis introuvable ou impossible à démarrer : ${command}`)))
    child.once("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(`${command} a échoué (code ${code}). Aucun détail susceptible de révéler une configuration n’est affiché.`)))
  })
}

function dbProcessEnv(databaseUrl) {
  const url = new URL(databaseUrl)
  if (!/^postgres(?:ql)?:$/.test(url.protocol)) throw new Error("APTIC_SOURCE_DATABASE_URL doit être une URL PostgreSQL.")
  if (!url.hostname.endsWith(".neon.tech") || url.hostname.includes("-pooler")) throw new Error("Utilisez l’endpoint direct Neon de la base source, sans pooler.")
  if (!url.username || !url.password || !url.pathname || url.pathname === "/") throw new Error("L’URL PostgreSQL source doit désigner explicitement un endpoint, un utilisateur, un mot de passe et une base.")
  return {
    url,
    env: {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
      PGSSLMODE: url.searchParams.get("sslmode") || "require",
    },
  }
}

function assertOutsideRepository(candidate, root) {
  const relative = path.relative(root, candidate)
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) throw new Error("L’archive et le dossier temporaire doivent rester hors du dépôt Git.")
}

async function listSnapshot(files) {
  const objects = []
  for await (const item of files.listAll({ limit: 500 })) {
    if (!validateObjectKey(item.key)) throw new Error("Une clé de stockage contient un chemin non pris en charge ; export interrompu.")
    if (!Number.isSafeInteger(item.size) || item.size < 0) throw new Error("Le fournisseur a retourné une taille d’objet invalide.")
    const metadata = Object.fromEntries(Object.entries(item.metadata || {}).sort(([left], [right]) => left.localeCompare(right)))
    objects.push({ key: item.key, size: item.size, type: item.type || "application/octet-stream", etag: item.etag || null, metadata })
  }
  objects.sort((left, right) => left.key.localeCompare(right.key))
  for (let index = 1; index < objects.length; index++) {
    if (objects[index - 1].key === objects[index].key) throw new Error("Le fournisseur a retourné une clé dupliquée ; export interrompu.")
  }
  if (objects.length > 99_999_999) throw new Error("Le bucket dépasse la capacité d’indexation du format de transfert.")
  return objects
}

function sameSnapshot(left, right) {
  return left.length === right.length && left.every((item, index) => item.key === right[index].key && item.size === right[index].size && (!item.etag || !right[index].etag || item.etag === right[index].etag) && JSON.stringify(item.metadata) === JSON.stringify(right[index].metadata))
}

async function exportBucket(files, bucket, payloadRoot) {
  const before = await listSnapshot(files)
  const entries = []
  let totalBytes = 0
  const objectDir = path.join(payloadRoot, "objects", bucket)
  await mkdir(objectDir, { recursive: true })

  for (let index = 0; index < before.length; index++) {
    const listed = before[index]
    const relativePath = `objects/${bucket}/${String(index + 1).padStart(8, "0")}.bin`
    const destination = path.join(payloadRoot, ...relativePath.split("/"))
    const downloaded = await files.download(listed.key)
    if (downloaded.key !== listed.key) throw new Error(`Une clé a changé pendant la lecture du bucket ${bucket}.`)
    const bytes = Buffer.from(await downloaded.arrayBuffer())
    if (bytes.length !== listed.size || downloaded.size !== listed.size) throw new Error(`La taille d’un objet du bucket ${bucket} a changé pendant l’export.`)
    await writeFile(destination, bytes, { flag: "wx", mode: 0o600 })
    entries.push({
      key: listed.key,
      path: relativePath,
      bytes: bytes.length,
      sha256: sha256Buffer(bytes),
      contentType: downloaded.type || listed.type || "application/octet-stream",
      metadata: downloaded.metadata || listed.metadata || {},
    })
    totalBytes += bytes.length
  }

  const after = await listSnapshot(files)
  if (!sameSnapshot(before, after)) throw new Error(`Le bucket ${bucket} a changé pendant l’export. Recommencez pendant une période sans écritures.`)
  return { objectCount: entries.length, totalBytes, objects: entries }
}

async function readSourceExtensions(database) {
  const output = await run("psql", ["-X", "-qAt", "-F", "\t", "-v", "ON_ERROR_STOP=1", "-c", "SELECT extname, extversion FROM pg_catalog.pg_extension ORDER BY extname"], { env: database.env, capture: true })
  return output.split(/\r?\n/).filter(Boolean).map((line) => {
    const [name, version, extra] = line.split("\t")
    if (!name || !version || extra !== undefined) throw new Error("Impossible de lire la liste des extensions de la base source.")
    return { name, version }
  })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.output || !args.workdir || !args["source-label"] || args["confirm-source-label"] !== args["source-label"]) {
    throw new Error("Usage : node scripts/create-portable-transfer.mjs --source-label <étiquette> --confirm-source-label <même-étiquette> --workdir <dossier chiffré> --output <fichier .apticr> [--allow-production-export]")
  }
  const sourceLabel = args["source-label"].trim()
  if (!sourceLabel || sourceLabel.length > 80 || /[\u0000-\u001f]/.test(sourceLabel)) throw new Error("Étiquette source invalide.")
  if (sourceLabel.toLowerCase() === "production" && !args.allowProduction) throw new Error("Un export étiqueté production exige également --allow-production-export.")

  const outputPath = path.resolve(args.output)
  const outputParent = await realpath(path.dirname(outputPath)).catch(() => null)
  if (!outputParent) throw new Error("Le dossier parent de l’archive doit déjà exister.")
  assertOutsideRepository(outputParent, await realpath(repoRoot))
  if (path.extname(outputPath).toLowerCase() !== ".apticr" || await access(outputPath).then(() => true).catch(() => false)) {
    throw new Error("Choisissez un nouveau fichier .apticr ; aucun fichier existant ne sera remplacé.")
  }

  const passphrase = requiredEnv("APTIC_TRANSFER_PASSPHRASE")
  validatePassphrase(passphrase)
  const sourceDatabaseUrl = requiredEnv("APTIC_SOURCE_DATABASE_URL")
  const database = dbProcessEnv(sourceDatabaseUrl)
  const storageEndpoint = requiredEnv("APTIC_SOURCE_AWS_ENDPOINT_URL_S3")
  const storageAccessKey = requiredEnv("APTIC_SOURCE_AWS_ACCESS_KEY_ID")
  const storageSecretKey = requiredEnv("APTIC_SOURCE_AWS_SECRET_ACCESS_KEY")
  const storageRegion = requiredEnv("APTIC_SOURCE_AWS_REGION")
  const parsedStorageEndpoint = new URL(storageEndpoint)
  if (parsedStorageEndpoint.protocol !== "https:") throw new Error("L’endpoint du stockage source doit utiliser HTTPS.")

  await run("pg_dump", ["--version"])
  await run("pg_restore", ["--version"])
  await run("tar", ["--version"])

  const secureWorkdir = await realpath(args.workdir).catch(() => null)
  if (!secureWorkdir || !(await stat(secureWorkdir)).isDirectory()) throw new Error("Le dossier temporaire sécurisé doit déjà exister.")
  assertOutsideRepository(secureWorkdir, await realpath(repoRoot))
  assertOutsideRepository(outputParent, await realpath(repoRoot))
  const workRoot = await mkdtemp(path.join(secureWorkdir, "apticr-transfer-"))
  const payloadRoot = path.join(workRoot, "payload")
  const archivePath = path.join(workRoot, "payload.tar.gz")
  const verificationPath = path.join(workRoot, "verify.tar.gz")
  await mkdir(payloadRoot, { mode: 0o700 })
  await mkdir(path.join(payloadRoot, "objects"), { mode: 0o700 })

  try {
    const dbDumpPath = path.join(payloadRoot, "database.dump")
    await run("pg_dump", ["--format=custom", "--no-owner", "--no-acl", "--no-password", "--file", dbDumpPath], { env: database.env })
    const extensions = await readSourceExtensions(database)
    const dumpInfo = await stat(dbDumpPath)
    if (!dumpInfo.isFile() || dumpInfo.size <= 0) throw new Error("pg_dump n’a pas produit de fichier exploitable.")
    await run("pg_restore", ["--list", dbDumpPath])

    const makeFiles = (bucket) => new Files({ adapter: neon({ bucket, endpoint: storageEndpoint, region: storageRegion, accessKeyId: storageAccessKey, secretAccessKey: storageSecretKey }) })
    const [documents, media] = await Promise.all([
      exportBucket(makeFiles("documents"), "documents", payloadRoot),
      exportBucket(makeFiles("media"), "media", payloadRoot),
    ])

    const manifest = {
      format: TRANSFER_FORMAT,
      version: TRANSFER_VERSION,
      createdAt: new Date().toISOString(),
      source: { label: sourceLabel, databaseFingerprint: databaseFingerprint(sourceDatabaseUrl), storageFingerprint: storageFingerprint(storageEndpoint) },
      extensions,
      database: { path: "database.dump", format: "postgres-custom", bytes: dumpInfo.size, sha256: await sha256File(dbDumpPath) },
      buckets: { documents, media },
    }
    await writeFile(path.join(payloadRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx", mode: 0o600 })

    await run("tar", ["-czf", archivePath, "-C", payloadRoot, "database.dump", "manifest.json", "objects"])
    const encrypted = await encryptFile(archivePath, outputPath, passphrase)
    const decrypted = await decryptFile(outputPath, verificationPath, passphrase)
    if (decrypted.sha256 !== await sha256File(archivePath)) throw new Error("L’archive chiffrée n’a pas passé la vérification après création.")
    await run("tar", ["-tzf", verificationPath])

    const objectCount = documents.objectCount + media.objectCount
    const objectBytes = documents.totalBytes + media.totalBytes
    process.stdout.write(`Archive portable créée et vérifiée : ${outputPath}\nBase PostgreSQL : ${dumpInfo.size} octets ; objets : ${objectCount} ; volume objets : ${objectBytes} octets.\nAucune URL de connexion ni clé de stockage n’est incluse dans l’archive. Conservez séparément la phrase de chiffrement.\n`)
    if (encrypted.bytes <= 0) throw new Error("Taille d’archive invalide.")
  } finally {
    await rm(workRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Échec de l’export portable."}\n`)
  process.exitCode = 1
})
