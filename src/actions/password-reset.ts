"use server"

import { createHash } from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { EmailService } from "@/lib/email/emailService"
import { escapeHtml } from "@/lib/email/variableEngine"
import { wrapEmailHtml } from "@/lib/email/templates/emailTheme"
import { getSiteUrl } from "@/lib/seo"
import { checkRateLimit, getClientIp } from "@/lib/security"
import {
  requestPasswordReset,
  resetPasswordWithToken,
  type PasswordResetRepository,
} from "@/lib/password-reset-service"

const passwordResetRepository: PasswordResetRepository = {
  findUserByEmail(email) {
    return prisma.utilisateur.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true, name: true },
    })
  },
  async replaceResetRequest(input) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.reinitialisationMotDePasse.findUnique({
        where: { userId: input.userId },
        select: { id: true },
      })
      if (current) {
        return transaction.reinitialisationMotDePasse.update({
          where: { userId: input.userId },
          data: { tokenHash: input.tokenHash, expiresAt: input.expiresAt, status: "PENDING", lastAttemptAt: null },
        })
      }
      return transaction.reinitialisationMotDePasse.create({ data: { ...input, status: "PENDING" } })
    })
  },
  async setResetRequestStatus(id, tokenHash, status, attemptedAt) {
    const updated = await prisma.reinitialisationMotDePasse.updateMany({
      where: { id, tokenHash, status: "PENDING" },
      data: { status, lastAttemptAt: attemptedAt },
    })
    return updated.count === 1
  },
  findResetRequest(tokenHash) {
    return prisma.reinitialisationMotDePasse.findUnique({ where: { tokenHash } })
  },
  async consumeResetAndUpdatePassword(input) {
    return prisma.$transaction(async (transaction) => {
      const claimed = await transaction.reinitialisationMotDePasse.updateMany({
        where: { id: input.id, userId: input.userId, tokenHash: input.tokenHash, status: "SENT", expiresAt: { gt: input.now } },
        data: { status: "USED" },
      })
      if (claimed.count !== 1) return false

      const updated = await transaction.utilisateur.updateMany({
        where: { id: input.userId },
        data: { passwordHash: input.passwordHash, sessionVersion: { increment: 1 } },
      })
      if (updated.count !== 1) throw new Error("PASSWORD_RESET_ACCOUNT_MISSING")
      return true
    })
  },
}

async function sendPasswordResetEmail(input: {
  recipient: string
  accountName: string
  token: string
  requestId: string
}) {
  const resetUrl = `${getSiteUrl()}/backoffice/reinitialiser-mot-de-passe#${input.token}`
  const greeting = `Bonjour ${input.accountName},`
  const intro = "Une demande de réinitialisation du mot de passe de votre compte administrateur APTIC-R a été effectuée."
  const action = "Choisir un nouveau mot de passe"
  const expiry = "Ce lien est valable 30 minutes et ne peut être utilisé qu’une seule fois. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message."
  const tokenHash = createHash("sha256").update(input.token, "utf8").digest("hex")
  const safeUrl = escapeHtml(resetUrl)

  const result = await EmailService.sendTrackedEmail({
    notificationKey: `admin-password-reset:${input.requestId}:${tokenHash}`,
    actionType: "ADMIN_PASSWORD_RESET",
    templateKey: "ADMIN_PASSWORD_RESET",
    metadata: { requestId: input.requestId },
    redactValues: [input.token, resetUrl],
    payload: {
      to: input.recipient,
      subject: "Réinitialisez votre mot de passe APTIC-R",
      html: wrapEmailHtml(`<p>${escapeHtml(greeting)}</p><p>${escapeHtml(intro)}</p><p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#003366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${escapeHtml(action)}</a></p><p>${escapeHtml(expiry)}</p>`, "FR"),
      text: `${greeting}\n\n${intro}\n\n${action}: ${resetUrl}\n\n${expiry}`,
    },
    logPayload: {
      to: input.recipient,
      subject: "Réinitialisez votre mot de passe APTIC-R",
      html: wrapEmailHtml(`<p>${escapeHtml(greeting)}</p><p>${escapeHtml(intro)}</p><p>[Reset link omitted from email log]</p><p>${escapeHtml(expiry)}</p>`, "FR"),
      text: `${greeting}\n\n${intro}\n\n[Reset link omitted from email log]\n\n${expiry}`,
    },
  })
  return result.success
}

export async function requestPasswordResetAction(email: unknown) {
  let rateAllowed = true
  try {
    const ip = await getClientIp()
    rateAllowed = checkRateLimit(`password-reset:${ip}`, 5, 15 * 60 * 1000).allowed
  } catch {
    rateAllowed = false
  }
  if (!rateAllowed) {
    return { success: true as const, message: "Si cette adresse correspond à un compte, un lien pourra être envoyé si le service e-mail est disponible." }
  }

  return requestPasswordReset(email, passwordResetRepository, {
    sendResetEmail: sendPasswordResetEmail,
    logFailure: () => console.error("[PasswordReset] La demande n’a pas pu être traitée (erreur interne)."),
  })
}

export async function resetPasswordAction(input: unknown) {
  return resetPasswordWithToken(input, passwordResetRepository, {
    hash: (password) => bcrypt.hash(password, 10),
  })
}
