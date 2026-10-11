"use server"

import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifySession, createSession } from "@/lib/auth"
import { EmailService } from "@/lib/email/emailService"
import { wrapEmailHtml } from "@/lib/email/templates/emailTheme"
import { escapeHtml } from "@/lib/email/variableEngine"
import { getSiteUrl } from "@/lib/seo"
import {
  changeOwnPassword as changePassword,
  confirmOwnEmailChange as confirmEmailChange,
  requestOwnEmailChange as requestEmailChange,
  updateOwnDisplayName,
  type AccountServiceRepository,
} from "@/lib/account-service"
import bcrypt from "bcryptjs"

const accountRepository: AccountServiceRepository = {
  async updateDisplayName(userId, name) {
    await prisma.utilisateur.update({ where: { id: userId }, data: { name }, select: { id: true } })
  },
  findAccount(userId) {
    return prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, passwordHash: true, role: true, sessionVersion: true },
    })
  },
  async isEmailUnavailable(email, excludingUserId) {
    const [existingUser, pendingChange] = await Promise.all([
      prisma.utilisateur.findFirst({ where: { email, id: { not: excludingUserId } }, select: { id: true } }),
      prisma.changementEmailUtilisateur.findFirst({
        where: { newEmail: email, userId: { not: excludingUserId }, expiresAt: { gt: new Date() } },
        select: { id: true },
      }),
    ])
    return Boolean(existingUser || pendingChange)
  },
  async replacePendingEmailChange(input) {
    return prisma.$transaction(async (transaction) => {
      await transaction.changementEmailUtilisateur.deleteMany({
        where: { newEmail: input.newEmail, expiresAt: { lte: new Date() } },
      })
      const active = await transaction.changementEmailUtilisateur.findUnique({
        where: { userId: input.userId },
        select: { id: true, status: true },
      })
      if (active?.status === "CONFIRMING") throw new Error("EMAIL_CHANGE_CONFIRMING")
      await transaction.changementEmailUtilisateur.deleteMany({ where: { userId: input.userId } })
      return transaction.changementEmailUtilisateur.create({
        data: { ...input, status: "PENDING" },
      })
    })
  },
  async setEmailChangeStatus(id, tokenHash, status, attemptedAt) {
    const updated = await prisma.changementEmailUtilisateur.updateMany({
      where: { id, tokenHash, status: "PENDING" },
      data: { status, lastAttemptAt: attemptedAt },
    })
    return updated.count === 1
  },
  findPendingEmailChange(tokenHash) {
    return prisma.changementEmailUtilisateur.findUnique({ where: { tokenHash } })
  },
  async confirmPendingEmailChange(input) {
    try {
      return await prisma.$transaction(async (transaction) => {
        const claimed = await transaction.changementEmailUtilisateur.updateMany({
          where: { id: input.id, tokenHash: input.tokenHash, status: "SENT", expiresAt: { gt: input.now } },
          data: { status: "CONFIRMING" },
        })
        if (claimed.count !== 1) return "INVALID" as const

        const duplicate = await transaction.utilisateur.findFirst({
          where: { email: input.newEmail, id: { not: input.userId } },
          select: { id: true },
        })
        if (duplicate) {
          await transaction.changementEmailUtilisateur.update({ where: { id: input.id }, data: { status: "SENT" } })
          return "EMAIL_TAKEN" as const
        }

        const changed = await transaction.utilisateur.updateMany({
          where: { id: input.userId },
          data: { email: input.newEmail },
        })
        if (changed.count !== 1) return "INVALID" as const
        await transaction.changementEmailUtilisateur.delete({ where: { id: input.id } })
        return "CONFIRMED" as const
      })
    } catch (error) {
      if ((error as { code?: string })?.code === "P2002") return "EMAIL_TAKEN" as const
      throw error
    }
  },
  async updatePasswordHash(userId, passwordHash) {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
      select: { role: true, sessionVersion: true },
    })
  },
}

function getEmailChangeCopy(lang: "FR" | "EN" | "DE") {
  return {
    FR: {
      subject: "Confirmez votre nouvelle adresse e-mail APTIC-R",
      intro: "Une demande de changement d’adresse e-mail a été faite pour votre compte administrateur APTIC-R.",
      action: "Confirmer ma nouvelle adresse",
      expiry: "Ce lien est valable 30 minutes. Votre adresse actuelle reste inchangée jusqu’à la confirmation.",
      ignore: "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.",
    },
    EN: {
      subject: "Confirm your new APTIC-R email address",
      intro: "A request was made to change the email address on your APTIC-R administrator account.",
      action: "Confirm my new address",
      expiry: "This link expires in 30 minutes. Your current address will not change until you confirm.",
      ignore: "If you did not request this change, you can ignore this message.",
    },
    DE: {
      subject: "Bestätigen Sie Ihre neue APTIC-R-E-Mail-Adresse",
      intro: "Für Ihr APTIC-R-Administratorkonto wurde eine Änderung der E-Mail-Adresse beantragt.",
      action: "Neue Adresse bestätigen",
      expiry: "Dieser Link ist 30 Minuten gültig. Ihre aktuelle Adresse bleibt bis zur Bestätigung unverändert.",
      ignore: "Wenn Sie diese Änderung nicht angefordert haben, ignorieren Sie diese Nachricht.",
    },
  }[lang]
}

async function sendEmailChangeConfirmation(input: {
  recipient: string
  accountName: string
  token: string
  lang: "FR" | "EN" | "DE"
  requestId: string
}) {
  const copy = getEmailChangeCopy(input.lang)
  const confirmationUrl = `${getSiteUrl()}/backoffice/confirmer-email?lang=${input.lang.toLowerCase()}#${input.token}`
  const safeUrl = escapeHtml(confirmationUrl)
  const safeAction = escapeHtml(copy.action)
  const body = `<p>${escapeHtml(copy.intro)}</p><p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#003366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${safeAction}</a></p><p>${escapeHtml(copy.expiry)}</p><p>${escapeHtml(copy.ignore)}</p>`
  const logBody = `<p>${escapeHtml(copy.intro)}</p><p>[Confirmation link omitted from email log]</p><p>${escapeHtml(copy.expiry)}</p>`
  const notificationKey = `account-email-change:${input.requestId}:${createHash("sha256").update(input.token).digest("hex")}`
  const result = await EmailService.sendTrackedEmail({
    notificationKey,
    actionType: "ADMIN_ACCOUNT_EMAIL_CHANGE",
    templateKey: "ADMIN_ACCOUNT_EMAIL_CHANGE",
    metadata: { requestId: input.requestId, lang: input.lang },
    redactValues: [input.token, confirmationUrl],
    payload: {
      to: input.recipient,
      subject: copy.subject,
      html: wrapEmailHtml(body, input.lang),
      text: `${copy.intro}\n\n${copy.action}: ${confirmationUrl}\n\n${copy.expiry}\n\n${copy.ignore}`,
    },
    logPayload: {
      to: input.recipient,
      subject: copy.subject,
      html: wrapEmailHtml(logBody, input.lang),
      text: `${copy.intro}\n\n[Confirmation link omitted from email log]\n\n${copy.expiry}`,
    },
  })
  return result.success
}

export async function updateOwnProfile(name: unknown) {
  const session = await verifySession()
  return updateOwnDisplayName(session?.userId || null, { name }, accountRepository)
}

export async function requestOwnEmailChange(input: unknown) {
  const session = await verifySession()
  return requestEmailChange(session?.userId || null, input, accountRepository, {
    sendConfirmation: sendEmailChangeConfirmation,
  })
}

export async function confirmOwnEmailChangeAction(token: unknown) {
  return confirmEmailChange(token, accountRepository)
}

export async function changeOwnPassword(input: unknown) {
  const session = await verifySession()
  const userId = session?.userId || null
  const result = await changePassword(userId, input, accountRepository, {
    compare: (plainText, hash) => bcrypt.compare(plainText, hash),
    hash: (plainText) => bcrypt.hash(plainText, 10),
  })
  if (result.success && userId) {
    await createSession(userId, result.role, result.sessionVersion)
  }
  if (!result.success) return result
  return { success: true as const }
}
