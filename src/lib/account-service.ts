import { createHash, randomBytes } from "crypto"
import {
  accountDisplayNameSchema,
  accountEmailChangeSchema,
  accountEmailChangeTokenSchema,
  accountPasswordChangeSchema,
} from "./account-validation"

const EMAIL_CHANGE_TTL_MS = 30 * 60 * 1000
const GENERIC_CONFIRMATION_ERROR = "Ce lien de confirmation est invalide ou expiré. Demandez un nouveau lien."

export interface PendingAccountEmailChange {
  id: string
  userId: string
  newEmail: string
  tokenHash: string
  expiresAt: Date
  status: string
}

export interface AccountServiceRepository {
  updateDisplayName(userId: string, name: string): Promise<void>
  findAccount(userId: string): Promise<{ id: string; name: string; email: string; passwordHash: string; role: string; sessionVersion: number } | null>
  isEmailUnavailable(email: string, excludingUserId: string): Promise<boolean>
  replacePendingEmailChange(input: Omit<PendingAccountEmailChange, "id" | "status">): Promise<PendingAccountEmailChange>
  setEmailChangeStatus(id: string, tokenHash: string, status: "SENT" | "FAILED", attemptedAt: Date): Promise<boolean>
  findPendingEmailChange(tokenHash: string): Promise<PendingAccountEmailChange | null>
  confirmPendingEmailChange(input: {
    id: string
    userId: string
    newEmail: string
    tokenHash: string
    now: Date
  }): Promise<"CONFIRMED" | "EMAIL_TAKEN" | "INVALID">
  updatePasswordHash(userId: string, passwordHash: string): Promise<{ role: string; sessionVersion: number }>
}

export interface AccountPasswordHasher {
  compare(plainText: string, hash: string): Promise<boolean>
  hash(plainText: string): Promise<string>
}

function tokenDigest(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export async function updateOwnDisplayName(
  authenticatedUserId: string | null,
  input: unknown,
  repository: AccountServiceRepository,
) {
  if (!authenticatedUserId) return { success: false as const, error: "Session administrateur requise." }
  const parsed = accountDisplayNameSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Nom invalide." }

  try {
    await repository.updateDisplayName(authenticatedUserId, parsed.data.name)
    return { success: true as const }
  } catch {
    return { success: false as const, error: "Impossible d’enregistrer le nom. Réessayez." }
  }
}

export async function requestOwnEmailChange(
  authenticatedUserId: string | null,
  input: unknown,
  repository: AccountServiceRepository,
  dependencies: {
    sendConfirmation(input: { recipient: string; accountName: string; token: string; lang: "FR" | "EN" | "DE"; requestId: string }): Promise<boolean>
    now?: () => Date
    createToken?: () => string
  },
) {
  if (!authenticatedUserId) return { success: false as const, error: "Session administrateur requise." }
  const parsed = accountEmailChangeSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Adresse e-mail invalide." }

  try {
    const account = await repository.findAccount(authenticatedUserId)
    if (!account) return { success: false as const, error: "Compte introuvable." }
    if (parsed.data.email === account.email.trim().toLowerCase()) {
      return { success: false as const, error: "Cette adresse est déjà celle de votre compte." }
    }
    if (await repository.isEmailUnavailable(parsed.data.email, authenticatedUserId)) {
      return { success: false as const, error: "Cette adresse e-mail est déjà utilisée ou réservée." }
    }

    const token = dependencies.createToken?.() || randomBytes(32).toString("base64url")
    const now = (dependencies.now || (() => new Date()))()
    const expiresAt = new Date(now.getTime() + EMAIL_CHANGE_TTL_MS)
    const tokenHash = tokenDigest(token)
    const pending = await repository.replacePendingEmailChange({
      userId: authenticatedUserId,
      newEmail: parsed.data.email,
      tokenHash,
      expiresAt,
    })

    let sent = false
    try {
      sent = await dependencies.sendConfirmation({
        recipient: parsed.data.email,
        accountName: account.name,
        token,
        lang: parsed.data.lang,
        requestId: pending.id,
      })
    } catch {
      sent = false
    }

    const status = sent ? "SENT" : "FAILED"
    const statusRecorded = await repository.setEmailChangeStatus(pending.id, tokenHash, status, now)
    if (!statusRecorded) {
      return {
        success: false as const,
        code: "EMAIL_REQUEST_REPLACED" as const,
        error: "Cette demande a été remplacée par une demande plus récente. Vérifiez son état avant de réessayer.",
        pendingEmail: pending.newEmail,
        status: "PENDING",
        expiresAt: expiresAt.toISOString(),
      }
    }
    if (!sent) {
      return {
        success: false as const,
        code: "EMAIL_SEND_FAILED" as const,
        error: "Le message de confirmation n’a pas été envoyé. L’adresse actuelle reste inchangée. Vous pouvez réessayer.",
        pendingEmail: pending.newEmail,
        status,
        expiresAt: expiresAt.toISOString(),
      }
    }
    return {
      success: true as const,
      pendingEmail: pending.newEmail,
      status,
      expiresAt: expiresAt.toISOString(),
      message: "Un lien de confirmation a été envoyé à la nouvelle adresse. L’adresse actuelle ne changera qu’après confirmation.",
    }
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false as const, error: "Cette adresse e-mail est déjà utilisée ou réservée." }
    }
    return { success: false as const, error: "Impossible de préparer la confirmation. Réessayez." }
  }
}

export async function confirmOwnEmailChange(
  input: unknown,
  repository: AccountServiceRepository,
  now = new Date(),
) {
  const tokenResult = accountEmailChangeTokenSchema.safeParse(input)
  if (!tokenResult.success) return { success: false as const, error: GENERIC_CONFIRMATION_ERROR }

  try {
    const tokenHash = tokenDigest(tokenResult.data)
    const pending = await repository.findPendingEmailChange(tokenHash)
    if (!pending || pending.status !== "SENT" || pending.expiresAt.getTime() <= now.getTime()) {
      return { success: false as const, error: GENERIC_CONFIRMATION_ERROR }
    }
    const result = await repository.confirmPendingEmailChange({
      id: pending.id,
      userId: pending.userId,
      newEmail: pending.newEmail,
      tokenHash,
      now,
    })
    if (result === "EMAIL_TAKEN") {
      return { success: false as const, error: "Cette adresse e-mail est désormais utilisée. Demandez une nouvelle confirmation avec une autre adresse." }
    }
    if (result !== "CONFIRMED") return { success: false as const, error: GENERIC_CONFIRMATION_ERROR }
    return { success: true as const, message: "Votre adresse e-mail a été confirmée. Utilisez-la lors de votre prochaine connexion." }
  } catch {
    return { success: false as const, error: "La confirmation n’a pas pu être traitée. Réessayez." }
  }
}

export async function changeOwnPassword(
  authenticatedUserId: string | null,
  input: unknown,
  repository: AccountServiceRepository,
  hasher: AccountPasswordHasher,
) {
  if (!authenticatedUserId) return { success: false as const, error: "Session administrateur requise." }
  const parsed = accountPasswordChangeSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Données du mot de passe invalides." }

  try {
    const account = await repository.findAccount(authenticatedUserId)
    if (!account) return { success: false as const, error: "Compte introuvable." }
    if (!(await hasher.compare(parsed.data.currentPassword, account.passwordHash))) {
      return { success: false as const, error: "Le mot de passe actuel est incorrect." }
    }
    const passwordHash = await hasher.hash(parsed.data.newPassword)
    const updated = await repository.updatePasswordHash(authenticatedUserId, passwordHash)
    return { success: true as const, ...updated }
  } catch {
    return { success: false as const, error: "Impossible de modifier le mot de passe. Réessayez." }
  }
}
