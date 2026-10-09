import { SignJWT } from "jose/jwt/sign"
import { jwtVerify } from "jose/jwt/verify"

let cachedEncodedKey: Uint8Array | null = null

/**
 * Clé de signature de la session. Aucun secret par défaut n'est utilisé :
 * un secret absent fait échouer explicitement plutôt que de signer avec
 * une valeur connue de tous.
 */
function getEncodedKey(): Uint8Array {
  if (!cachedEncodedKey) {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      throw new Error(
        "NEXTAUTH_SECRET manquant : définissez-le dans les variables d'environnement (aucun secret par défaut n'est accepté)."
      )
    }
    cachedEncodedKey = new TextEncoder().encode(secret)
  }
  return cachedEncodedKey
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey())
}

export async function decrypt(session: string | undefined = "") {
  const encodedKey = getEncodedKey()
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error: unknown) {
    return null
  }
}