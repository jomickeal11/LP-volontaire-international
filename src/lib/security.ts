import { headers } from "next/headers"

/**
 * APTIC-R Security Utility Module
 * Compliant with OWASP Top 10 & Defense-in-Depth guidelines.
 */

// ── 1. RATE LIMITING EN MÉMOIRE (Token Bucket / Sliding Window) ─────────────
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyage régulier toutes les 10 minutes pour éviter les fuites de mémoire
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

/**
 * Limite le taux de requêtes par IP / clé
 * @param key Identifiant de limitation (ex: "submit:192.168.1.1" ou "login:admin")
 * @param maxRequests Nombre maximum de requêtes autorisées
 * @param windowMs Fenêtre de temps en millisecondes (ex: 60_000 pour 1 min)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime <= now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count += 1
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
}

/**
 * Récupère l'adresse IP du client depuis les en-têtes HTTP de la requête
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers()
    const forwardedFor = headerList.get("x-forwarded-for")
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim()
    }
    const realIp = headerList.get("x-real-ip")
    if (realIp) {
      return realIp.trim()
    }
    return "127.0.0.1"
  } catch {
    return "unknown-ip"
  }
}

// ── 2. VALIDATION DU CONTENU RÉEL DES FICHIERS (MAGIC BYTES) ─────────────────
/**
 * Signatures binaires standard (Magic Bytes) pour vérifier la nature réelle des fichiers
 */
const MAGIC_SIGNATURES: Record<string, { matches: (buf: Buffer) => boolean; desc: string }> = {
  // PDF : commence par %PDF- (0x25, 0x50, 0x44, 0x46)
  pdf: {
    matches: (buf) => buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46,
    desc: "Adobe Portable Document Format (PDF)",
  },
  // JPEG / JPG : commence par 0xFF, 0xD8, 0xFF
  jpg: {
    matches: (buf) => buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
    desc: "JPEG Image",
  },
  jpeg: {
    matches: (buf) => buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
    desc: "JPEG Image",
  },
  // PNG : commence par 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  png: {
    matches: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4E &&
      buf[3] === 0x47 &&
      buf[4] === 0x0D &&
      buf[5] === 0x0A &&
      buf[6] === 0x1A &&
      buf[7] === 0x0A,
    desc: "Portable Network Graphics (PNG)",
  },
  // Formats Microsoft Office modernes & OpenDocument (ZIP container) : PK\x03\x04
  docx: {
    matches: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04,
    desc: "Microsoft Word (DOCX / OpenXML)",
  },
  pptx: {
    matches: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04,
    desc: "Microsoft PowerPoint (PPTX / OpenXML)",
  },
  odt: {
    matches: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04,
    desc: "OpenDocument Text (ODT)",
  },
  // Anciens formats Office OLE2 / Compound File : 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1
  doc: {
    matches: (buf) =>
      buf.length >= 8 &&
      ((buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0) ||
       (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04)), // Accepte aussi OpenXML
    desc: "Microsoft Word (DOC)",
  },
  ppt: {
    matches: (buf) =>
      buf.length >= 8 &&
      ((buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0) ||
       (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04)),
    desc: "Microsoft PowerPoint (PPT)",
  },
}

/**
 * Valide en profondeur qu'un buffer correspond aux octets magiques de son extension annoncée
 */
export function verifyMagicBytes(buffer: Buffer, filename: string): { valid: boolean; reason?: string } {
  const ext = (filename.split(".").pop() || "").toLowerCase()

  const validator = MAGIC_SIGNATURES[ext]
  if (!validator) {
    return {
      valid: false,
      reason: `Extension non autorisée ou format non reconnu (.${ext}).`,
    }
  }

  if (!validator.matches(buffer)) {
    return {
      valid: false,
      reason: `Le contenu réel du fichier "${filename}" ne correspond pas à une structure ${validator.desc} valide (signature binaire invalide ou fichier corrompu/falsifié).`,
    }
  }

  // Détection complémentaire de scripts masqués dans des fichiers (anti-polyglot)
  // Vérifie si les 2048 premiers octets contiennent des balises HTML/PHP/JS exécutables
  const snippet = buffer.subarray(0, Math.min(buffer.length, 2048)).toString("utf-8", 0, Math.min(buffer.length, 2048)).toLowerCase()
  if (snippet.includes("<?php") || snippet.includes("<script") || snippet.includes("<html") || snippet.includes("eval(") || snippet.includes("base64_decode(")) {
    return {
      valid: false,
      reason: `Le fichier "${filename}" contient des balises exécutables ou des scripts interdits.`,
    }
  }

  return { valid: true }
}
