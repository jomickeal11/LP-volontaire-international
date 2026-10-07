import { Files } from "files-sdk"
import { neon } from "files-sdk/neon"
import { readFileSync } from "fs"
import { readdir, readFile, stat } from "fs/promises"
import path from "path"

const env = readFileSync(new URL("../.env", import.meta.url), "utf8")
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
}

const mediaFiles = new Files({ adapter: neon({ bucket: "media" }) })
const publicDir = path.join(process.cwd(), "public", "uploads")

async function migrateFolder(folder) {
  const source = path.join(publicDir, folder)
  let names
  try {
    names = (await readdir(source)).filter((name) => name !== "." && name !== "..")
  } catch {
    console.log(`- ${folder}/ : dossier absent, rien à migrer`)
    return 0
  }

  let migrated = 0
  for (const name of names) {
    const filePath = path.join(source, name)
    const info = await stat(filePath)
    if (!info.isFile()) continue

    const ext = (name.split(".").pop() || "").toLowerCase()
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream"
    const key = `${folder}/${name}`

    if (await mediaFiles.exists(key)) {
      console.log(`  = ${key} déjà présent dans le bucket`)
      continue
    }

    await mediaFiles.upload(key, await readFile(filePath), { contentType })
    console.log(`  + ${key} (${info.size} octets)`)
    migrated++
  }
  return migrated
}

const total = (await migrateFolder("team")) + (await migrateFolder("resources"))
console.log(`Migration terminée : ${total} objet(s) ajouté(s) au bucket media.`)
