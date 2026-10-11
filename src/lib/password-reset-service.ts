import { createHash, randomBytes } from "crypto"
import { passwordResetRequestSchema, passwordResetSchema } from "./account-validation"

const RESET_TTL_MS = 30 * 60 * 1000
const GENERIC_REQUEST_MESSAGE = "Si cette adresse correspond à un compte, un lien pourra être envoyé si le service e-mail est disponible."
const INVALID_TOKEN_MESSAGE = "Ce lien de réinitialisation est invalide ou expiré. Demandez un nouveau lien."

export interface PasswordResetRecord {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  status: string
}

export interface PasswordResetRepository {
  findUserByEmail(email: string): Promise<{ id: string; email: string; name: string } | null>
  replaceResetRequest(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<PasswordResetRecord>
  setResetRequestStatus(id: string, tokenHash: string, status: "SENT" | "FAILED", attemptedAt: Date): Promise<boolean>
  findResetRequest(tokenHash: string): Promise<PasswordResetRecord | null>
  consumeResetAndUpdatePassword(input: {
    id: string
    userId: string
    tokenHash: string
    now: Date
    passwordHash: string
  }): Promise<boolean>
}

export interface PasswordHasher {
  hash(password: string): Promise<string>
}

function digestToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export async function requestPasswordReset(
  input: unknown,
  repository: PasswordResetRepository,
  dependencies: {
    sendResetEmail(input: { recipient: string; accountName: string; token: string; requestId: string }): Promise<boolean>
    now?: () => Date
    createToken?: () => string
    logFailure?: () => void
  },
) {
  const genericResponse = { success: true as const, message: GENERIC_REQUEST_MESSAGE }
  const parsed = passwordResetRequestSchema.safeParse(input)
  if (!parsed.success) return genericResponse

  try {
    const account = await repository.findUserByEmail(parsed.data.email)
    if (!account) return genericResponse

    const token = dependencies.createToken?.() || randomBytes(32).toString("base64url")
    const now = (dependencies.now || (() => new Date()))()
    const tokenHash = digestToken(token)
    const record = await repository.replaceResetRequest({
      userId: account.id,
      tokenHash,
      expiresAt: new Date(now.getTime() + RESET_TTL_MS),
    })

    let sent = false
    try {
      sent = await dependencies.sendResetEmail({
        recipient: account.email,
        accountName: account.name,
        token,
        requestId: record.id,
      })
    } catch {
      sent = false
    }

    await repository.setResetRequestStatus(record.id, tokenHash, sent ? "SENT" : "FAILED", now)
    return genericResponse
  } catch {
    dependencies.logFailure?.()
    return genericResponse
  }
}

export async function resetPasswordWithToken(
  input: unknown,
  repository: PasswordResetRepository,
  hasher: PasswordHasher,
  now = new Date(),
) {
  const parsed = passwordResetSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message || "Données invalides." }
  }

  try {
    const tokenHash = digestToken(parsed.data.token)
    const record = await repository.findResetRequest(tokenHash)
    if (!record || record.status !== "SENT" || record.expiresAt.getTime() <= now.getTime()) {
      return { success: false as const, error: INVALID_TOKEN_MESSAGE }
    }

    const passwordHash = await hasher.hash(parsed.data.newPassword)
    const consumed = await repository.consumeResetAndUpdatePassword({
      id: record.id,
      userId: record.userId,
      tokenHash,
      now,
      passwordHash,
    })
    if (!consumed) return { success: false as const, error: INVALID_TOKEN_MESSAGE }
    return { success: true as const, message: "Votre mot de passe a été modifié. Vous pouvez vous connecter." }
  } catch {
    return { success: false as const, error: "La réinitialisation n’a pas pu être traitée. Réessayez." }
  }
}
