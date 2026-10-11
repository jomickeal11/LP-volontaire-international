import { spawn } from "node:child_process"
import { mkdtemp, mkdir, readFile, realpath, rm, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Files } from "files-sdk"
import { neon } from "files-sdk/neon"
import { TRANSFER_FORMAT, TRANSFER_VERSION, databaseFingerprint, decryptFile, sha256Buffer, sha256File, storageFingerprint, validateManifest, validateObjectKey, validatePassphrase } from "./portable-transfer-lib.mjs"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const expectedEmptyConfirmation = "RESTORE-INTO-EMPTY-DATABASE"

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (!arg.startsWith("--") || !argv[index + 1] || argv[index + 1].startsWith("--")) throw new Error(`Argument invalide : ${arg}`)
    const key = arg.slice(2)
    if (!["bundle", "workdir", "confirm-destination-host", "confirm-destination-database", "confirm-empty-database"].includes(key)) throw new Error(`Argument inconnu : ${arg}`)
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
    const child = spawn(command, args, { windowsHide: true, stdio: options.capture || options.onLine ? ["ignore", "pipe", "ignore"] : "ignore", env: options.env })
    let stdout = ""
    let pending = ""
    let outputSize = 0
    let callbackError = null
    if (options.capture || options.onLine) {
      child.stdout.setEncoding("utf8").on("data", (chunk) => {
        outputSize += Buffer.byteLength(chunk)
        if (outputSize > (options.maxOutputBytes || 64 * 1024 * 1024)) {
          callbackError = new Error(`${command} a produit une sortie trop volumineuse.`)
          child.kill()
          return
        }
        if (options.capture) stdout += chunk
        if (options.onLine) {
          pending += chunk
          let separator
          while ((separator = pending.indexOf("\n")) >= 0) {
            const line = pending.slice(0, separator).replace(/\r$/, "")
            pending = pending.slice(separator + 1)
            try { options.onLine(line) } catch (error) { callbackError = error; child.kill(); return }
          }
        }
      })
    }
    child.once("error", () => reject(new Error(`Outil requis introuvable ou impossible à démarrer : ${command}`)))
    child.once("close", (code) => {
      if (callbackError) return reject(callbackError)
      if (code !== 0) return reject(new Error(`${command} a échoué (code ${code}). Aucun détail susceptible de révéler une configuration n’est affiché.`))
      if (options.onLine && pending) {
        try { options.onLine(pending.replace(/\r$/, "")) } catch (error) { return reject(error) }
      }
      resolve(stdout)
    })
  })
}

function destinationDbEnv(databaseUrl) {
  const url = new URL(databaseUrl)
  if (!/^postgres(?:ql)?:$/.test(url.protocol)) throw new Error("APTIC_DEST_DATABASE_URL doit être une URL PostgreSQL.")
  if (!url.hostname.endsWith(".neon.tech") || url.hostname.includes("-pooler")) throw new Error("La restauration exige un endpoint direct d’un projet Neon.")
  if (!url.username || !url.password || !url.pathname || url.pathname === "/") throw new Error("L’URL de destination doit désigner explicitement un endpoint, un utilisateur, un mot de passe et une base.")
  const databaseName = decodeURIComponent(url.pathname.slice(1))
  return {
    url,
    databaseName,
    env: {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: databaseName,
      PGSSLMODE: url.searchParams.get("sslmode") || "require",
    },
  }
}

function makeFiles(bucket, endpoint, region, accessKeyId, secretAccessKey) {
  return new Files({ adapter: neon({ bucket, endpoint, region, accessKeyId, secretAccessKey }) })
}

function assertOutsideRepository(candidate, root) {
  const relative = path.relative(root, candidate)
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) throw new Error("Le dossier temporaire doit rester hors du dépôt Git.")
}

async function listKeys(files) {
  const objects = []
  for await (const item of files.listAll({ limit: 500 })) {
    if (!validateObjectKey(item.key)) throw new Error("Une clé non prise en charge est présente dans le bucket cible.")
    objects.push({ key: item.key, size: item.size })
  }
  objects.sort((left, right) => left.key.localeCompare(right.key))
  return objects
}

async function validateTarContents(archivePath) {
  const entries = new Set()
  await run("tar", ["-tzf", archivePath], {
    onLine(line) {
      let entry = line.replace(/\\/g, "/")
      while (entry.startsWith("./")) entry = entry.slice(2)
      entry = entry.replace(/\/$/, "")
      if (!entry || entry === ".") return
      if (path.posix.isAbsolute(entry) || entry.split("/").some((part) => part === ".." || part === "")) throw new Error("L’archive contient un chemin non sûr.")
      const allowed = entry === "database.dump" || entry === "manifest.json" || entry === "objects" || entry === "objects/documents" || entry === "objects/media" || /^objects\/(documents|media)\/\d{8}\.bin$/.test(entry)
      if (!allowed) throw new Error("L’archive contient un élément inattendu.")
      if (!entry.endsWith(".bin") && entries.has(entry)) throw new Error("L’archive contient une entrée dupliquée.")
      entries.add(entry)
    },
    maxOutputBytes: 256 * 1024 * 1024,
  })
  return entries
}

async function verifyPayload(payloadRoot, manifest) {
  const dbDump = path.join(payloadRoot, "database.dump")
  const dbInfo = await stat(dbDump)
  if (dbInfo.size !== manifest.database.bytes || await sha256File(dbDump) !== manifest.database.sha256) throw new Error("Le dump PostgreSQL ne correspond pas au manifeste.")
  await run("pg_restore", ["--list", dbDump])

  for (const bucket of ["documents", "media"]) {
    for (const object of manifest.buckets[bucket].objects) {
      const objectPath = path.join(payloadRoot, ...object.path.split("/"))
      const objectInfo = await stat(objectPath)
      if (objectInfo.size !== object.bytes || await sha256File(objectPath) !== object.sha256) throw new Error(`Un fichier du bucket ${bucket} ne correspond pas au manifeste.`)
    }
  }
}

function referencesSql() {
  return String.raw`
CREATE TEMP TABLE _apticr_transfer_refs(bucket text NOT NULL, object_key text NOT NULL);
INSERT INTO _apticr_transfer_refs SELECT 'documents', "storageKey" FROM "DocumentCandidature";
INSERT INTO _apticr_transfer_refs SELECT 'documents', "storageKey" FROM "DocumentPartenaire";
INSERT INTO _apticr_transfer_refs SELECT 'documents', "storageKey" FROM "DocumentPropositionProjet";
DO $apticr$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type IN ('text', 'character varying', 'character')
  LOOP
    EXECUTE format(
      'INSERT INTO _apticr_transfer_refs SELECT ''media'', (regexp_matches(%I, %L, ''g''))[1] FROM %I.%I WHERE %I LIKE %L',
      c.column_name, '/uploads/([A-Za-z0-9._/-]+)', c.table_schema, c.table_name, c.column_name, '%/uploads/%'
    );
  END LOOP;
END
$apticr$;
SELECT bucket || E'\t' || object_key FROM _apticr_transfer_refs ORDER BY bucket, object_key;
`
}

async function verifyDatabaseReferences(database, manifest) {
  const lines = (await run("psql", ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-c", referencesSql()], { env: database.env, capture: true, maxOutputBytes: 128 * 1024 * 1024 })).split(/\r?\n/).filter(Boolean)
  const available = {
    documents: new Set(manifest.buckets.documents.objects.map((object) => object.key)),
    media: new Set(manifest.buckets.media.objects.map((object) => object.key)),
  }
  let missing = 0
  for (const line of lines) {
    const separator = line.indexOf("\t")
    if (separator < 1) throw new Error("Impossible d’interpréter les références de fichiers de la base restaurée.")
    const bucket = line.slice(0, separator)
    const key = line.slice(separator + 1)
    if (!(bucket in available) || !available[bucket].has(key)) missing++
  }
  if (missing) throw new Error(`La base restaurée contient ${missing} référence(s) à des objets absents de l’archive. Le site ne doit pas être remis en service.`)
  return lines.length
}

async function verifyAvailableExtensions(database, extensions) {
  if (!Array.isArray(extensions)) throw new Error("Le manifeste ne contient pas la liste des extensions source.")
  if (!extensions.length) return
  const names = extensions.map((item) => item.name)
  if (names.some((name) => !/^[a-z0-9_]+$/i.test(name))) throw new Error("Nom d’extension invalide dans le manifeste.")
  const quotedNames = names.map((name) => `'${name.replace(/'/g, "''")}'`).join(",")
  const output = await run("psql", ["-X", "-qAt", "-F", "\t", "-v", "ON_ERROR_STOP=1", "-c", `SELECT name, version FROM pg_catalog.pg_available_extension_versions WHERE name IN (${quotedNames})`], { env: database.env, capture: true })
  const available = new Set(output.split(/\r?\n/).filter(Boolean))
  const missing = extensions.filter((extension) => !available.has(`${extension.name}\t${extension.version}`))
  if (missing.length) throw new Error(`Extensions source indisponibles dans la destination : ${missing.map((item) => item.name).join(", ")}. Aucune donnée n’a été restaurée.`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.bundle || !args.workdir || !args["confirm-destination-host"] || !args["confirm-destination-database"] || args["confirm-empty-database"] !== expectedEmptyConfirmation) {
    throw new Error(`Usage : node scripts/restore-portable-transfer.mjs --bundle <fichier .apticr> --workdir <dossier chiffré> --confirm-destination-host <hôte exact> --confirm-destination-database <base exacte> --confirm-empty-database ${expectedEmptyConfirmation}`)
  }
  const bundlePath = await realpath(path.resolve(args.bundle)).catch(() => null)
  if (!bundlePath || !(await stat(bundlePath)).isFile()) throw new Error("Fichier d’archive introuvable.")
  const passphrase = requiredEnv("APTIC_TRANSFER_PASSPHRASE")
  validatePassphrase(passphrase)
  const destination = destinationDbEnv(requiredEnv("APTIC_DEST_DATABASE_URL"))
  const endpoint = requiredEnv("APTIC_DEST_AWS_ENDPOINT_URL_S3")
  const accessKeyId = requiredEnv("APTIC_DEST_AWS_ACCESS_KEY_ID")
  const secretAccessKey = requiredEnv("APTIC_DEST_AWS_SECRET_ACCESS_KEY")
  const region = requiredEnv("APTIC_DEST_AWS_REGION")
  if (new URL(endpoint).protocol !== "https:") throw new Error("L’endpoint du stockage de destination doit utiliser HTTPS.")

  const confirmedHost = args["confirm-destination-host"].toLowerCase()
  const confirmedDatabase = args["confirm-destination-database"]
  if (confirmedHost !== destination.url.hostname.toLowerCase() || confirmedDatabase !== destination.databaseName) throw new Error("La confirmation de destination ne correspond pas à l’endpoint et à la base fournis.")

  const secureWorkdir = await realpath(args.workdir).catch(() => null)
  if (!secureWorkdir || !(await stat(secureWorkdir)).isDirectory()) throw new Error("Le dossier temporaire sécurisé doit déjà exister.")
  assertOutsideRepository(secureWorkdir, await realpath(repoRoot))
  const workRoot = await mkdtemp(path.join(secureWorkdir, "apticr-restore-"))
  const decryptedPath = path.join(workRoot, "payload.tar.gz")
  const payloadRoot = path.join(workRoot, "payload")
  await mkdir(payloadRoot)
  try {
    await decryptFile(bundlePath, decryptedPath, passphrase)
    const archiveEntries = await validateTarContents(decryptedPath)
    await run("tar", ["-xzf", decryptedPath, "-C", payloadRoot])
    const manifest = validateManifest(JSON.parse(await readFile(path.join(payloadRoot, "manifest.json"), "utf8")))
    if (databaseFingerprint(requiredEnv("APTIC_DEST_DATABASE_URL")) === manifest.source.databaseFingerprint) throw new Error("La destination correspond à la base source de l’archive ; restauration refusée.")
    if (storageFingerprint(endpoint) === manifest.source.storageFingerprint) throw new Error("Le stockage cible correspond au stockage source de l’archive ; restauration refusée.")

    const expectedEntries = new Set(["database.dump", "manifest.json", "objects", "objects/documents", "objects/media"])
    for (const bucket of ["documents", "media"]) for (const object of manifest.buckets[bucket].objects) expectedEntries.add(object.path)
    if (archiveEntries.size !== expectedEntries.size || [...expectedEntries].some((entry) => !archiveEntries.has(entry))) throw new Error("Le contenu de l’archive ne correspond pas au manifeste.")
    await verifyPayload(payloadRoot, manifest)
    await verifyAvailableExtensions(destination, manifest.extensions)

    const emptyCount = Number((await run("psql", ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-c", "SELECT count(*) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind IN ('r','p','v','m','S','f')"], { env: destination.env, capture: true })).trim())
    if (!Number.isSafeInteger(emptyCount) || emptyCount !== 0) throw new Error("La base cible n’est pas vide. Aucune table ne sera supprimée ni remplacée.")

    const targetBuckets = {
      documents: makeFiles("documents", endpoint, region, accessKeyId, secretAccessKey),
      media: makeFiles("media", endpoint, region, accessKeyId, secretAccessKey),
    }
    for (const bucket of ["documents", "media"]) {
      const current = await listKeys(targetBuckets[bucket])
      if (current.length) throw new Error(`Le bucket cible ${bucket} n’est pas vide. Aucun objet existant ne sera remplacé.`)
    }

    for (const bucket of ["documents", "media"]) {
      for (const object of manifest.buckets[bucket].objects) {
        const bytes = await readFile(path.join(payloadRoot, ...object.path.split("/")))
        const uploaded = await targetBuckets[bucket].upload(object.key, bytes, { contentType: object.contentType || "application/octet-stream", metadata: object.metadata || {} })
        if (uploaded.key !== object.key || uploaded.size !== object.bytes) throw new Error(`La vérification après téléversement a échoué dans le bucket ${bucket}.`)
        const downloaded = await targetBuckets[bucket].download(object.key)
        const restoredBytes = Buffer.from(await downloaded.arrayBuffer())
        if (restoredBytes.length !== object.bytes || sha256Buffer(restoredBytes) !== object.sha256) throw new Error(`La somme SHA-256 d’un objet restauré dans ${bucket} ne correspond pas.`)
      }
    }

    for (const bucket of ["documents", "media"]) {
      const actual = await listKeys(targetBuckets[bucket])
      const expected = manifest.buckets[bucket].objects.map((object) => ({ key: object.key, size: object.bytes })).sort((a, b) => a.key.localeCompare(b.key))
      if (actual.length !== expected.length || actual.some((item, index) => item.key !== expected[index].key || item.size !== expected[index].size)) throw new Error(`La liste restaurée du bucket ${bucket} ne correspond pas au manifeste.`)
    }

    await run("pg_restore", ["--exit-on-error", "--single-transaction", "--no-owner", "--no-privileges", "--dbname", destination.databaseName, path.join(payloadRoot, "database.dump")], {
      env: { ...destination.env, PGHOST: destination.url.hostname, PGPORT: destination.url.port || "5432", PGUSER: decodeURIComponent(destination.url.username), PGPASSWORD: decodeURIComponent(destination.url.password), PGSSLMODE: destination.url.searchParams.get("sslmode") || "require" },
    })
    const referencedCount = await verifyDatabaseReferences(destination, manifest)
    process.stdout.write(`Base et buckets restaurés. PostgreSQL : ${manifest.database.bytes} octets ; documents : ${manifest.buckets.documents.objectCount} ; médias : ${manifest.buckets.media.objectCount} ; références vérifiées : ${referencedCount}.\nVérifiez ensuite les migrations Prisma, les extensions disponibles et les parcours du site avant de le remettre en service.\n`)
  } finally {
    await rm(workRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Échec de la restauration portable."}\n`)
  process.exitCode = 1
})
