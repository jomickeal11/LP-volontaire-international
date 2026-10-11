import { cookies } from "next/headers"
import { decrypt, encrypt } from "./jwt"
import { prisma } from "./prisma"

export { decrypt, encrypt } from "./jwt"

const SESSION_COOKIE = "session"

export interface VerifiedSession {
  isAuth: true
  userId: string
  role: string
  sessionVersion: number
}

/**
 * Cache mémoire strictement NÉGATIF : un identifiant de compte confirmé
 * absent de la base reste signalé pendant quelques minutes. Cela évite de
 * marteler la base avec les JWT restés valides d'un compte supprimé.
 *
 * Le résultat positif (compte existant) n'est JAMAIS mis en cache : la
 * suppression ou la modification d'un compte prend ainsi effet immédiatement.
 */
interface NegativeCacheEntry {
  expiresAt: number
}
const negativeUserCache = new Map<string, NegativeCacheEntry>()
const NEGATIVE_CACHE_TTL_MS = 10 * 60 * 1000

function pruneNegativeCache(now: number = Date.now()) {
  for (const [userId, entry] of negativeUserCache.entries()) {
    if (entry.expiresAt <= now) {
      negativeUserCache.delete(userId)
    }
  }
}

export async function createSession(userId: string, role: string, sessionVersion = 0) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, role, sessionVersion, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Vérifie la session courante : signature et expiration du JWT, puis
 * existence réelle (et rôle actuel) du compte en base. Un JWT correctement
 * signé mais émis pour un compte supprimé est refusé ici : on ne se fie
 * jamais uniquement à la signature et à l'expiration.
 *
 * Pendant une indisponibilité de la base, l'accès est refusé (échec fermé)
 * sans supprimer le cookie, pour ne pas déconnecter tous les administrateurs
 * lors d'un redémarrage à froid, tout en ne laissant passer personne.
 */
export async function verifySession(): Promise<VerifiedSession | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE)?.value
  if (!cookie) {
    return null
  }

  const session = await decrypt(cookie)
  const userId =
    typeof session?.userId === "string" && session.userId ? session.userId : null
  if (!userId) {
    return null
  }
  const tokenSessionVersion = typeof session?.sessionVersion === "number" ? session.sessionVersion : 0

  const now = Date.now()
  const cached = negativeUserCache.get(userId)
  if (cached && cached.expiresAt > now) {
    await clearSessionSilently()
    return null
  }

  let user: { id: string; role: string; sessionVersion: number; active: boolean } | null
  try {
    user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, role: true, sessionVersion: true, active: true },
    })
  } catch (error: unknown) {
    return null
  }

  if (!user) {
    pruneNegativeCache(now)
    negativeUserCache.set(userId, { expiresAt: now + NEGATIVE_CACHE_TTL_MS })
    await clearSessionSilently()
    return null
  }

  if (!user.active || user.sessionVersion !== tokenSessionVersion) {
    await clearSessionSilently()
    return null
  }

  return { isAuth: true, userId: user.id, role: user.role, sessionVersion: user.sessionVersion }
}

async function clearSessionSilently() {
  try {
    await deleteSession()
  } catch (error: unknown) {
    // Contexte en lecture seule (page ou layout rendu côté serveur) :
    // la suppression du cookie est ignorée, l'accès reste refusé.
  }
}
