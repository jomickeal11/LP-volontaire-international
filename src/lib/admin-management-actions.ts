"use server"

import "server-only"
import { createHash, randomBytes } from "crypto"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession, deleteSession } from "@/lib/auth"
import { hasAdminPermission } from "@/lib/admin-permissions"
import { EmailService } from "@/lib/email/emailService"
import { escapeHtml } from "@/lib/email/variableEngine"
import { wrapEmailHtml } from "@/lib/email/templates/emailTheme"
import { getSiteUrl } from "@/lib/seo"
import { accountEmailChangeTokenSchema, accountPasswordChangeSchema } from "@/lib/account-validation"
import { canRemoveActiveSuperAdmin, isActiveSuperAdmin, isInvitationUsable, isManagedAdminRole } from "@/lib/admin-management-policy"

const accountInput = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  role: z.string().refine(isManagedAdminRole),
})
const manageInput = z.object({ userId: z.string().min(1), role: z.string().optional(), active: z.boolean().optional() })
const INVITATION_TTL_MS = 48 * 60 * 60 * 1000
const GENERIC_INVITATION_ERROR = "Cette invitation est invalide, expirée ou déjà utilisée. Demandez une nouvelle invitation à un super-administrateur."

async function requireSuperAdmin() {
  const session = await verifySession()
  return session?.userId && hasAdminPermission(session.role, "admin-users:manage") ? session : null
}

function digest(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export async function getManagedAdministrators(search = "") {
  if (!(await requireSuperAdmin())) return { success: false as const, error: "Accès refusé." }
  const normalizedSearch = search.trim().slice(0, 120)
  const [users, invitations] = await Promise.all([
    prisma.utilisateur.findMany({
      where: normalizedSearch ? { OR: [{ name: { contains: normalizedSearch, mode: "insensitive" } }, { email: { contains: normalizedSearch, mode: "insensitive" } }] } : undefined,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invitationAdministrateur.findMany({
      where: { status: { in: ["PENDING", "SENT", "FAILED"] }, ...(normalizedSearch ? { OR: [{ name: { contains: normalizedSearch, mode: "insensitive" } }, { email: { contains: normalizedSearch, mode: "insensitive" } }] } : {}) },
      select: { id: true, name: true, email: true, role: true, status: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ])
  return { success: true as const, users, invitations }
}

async function sendInvitation(input: { id: string; token: string; name: string; email: string }) {
  const url = `${getSiteUrl()}/backoffice/invitation#${encodeURIComponent(input.token)}`
  const safeName = escapeHtml(input.name)
  const safeUrl = escapeHtml(url)
  const subject = "Invitation à rejoindre le back-office APTIC-R"
  const body = `<p>Bonjour ${safeName},</p><p>Vous avez été invité(e) à rejoindre le back-office APTIC-R.</p><p><a href="${safeUrl}">Créer votre mot de passe et activer le compte</a></p><p>Ce lien expire dans 48 heures et ne peut être utilisé qu'une fois.</p>`
  const logBody = `<p>Une invitation au back-office a été préparée.</p><p>[Lien d’activation omis du journal]</p>`
  const sent = await EmailService.sendTrackedEmail({
    notificationKey: `admin-invitation:${input.id}:${digest(input.token)}`,
    actionType: "ADMIN_INVITATION",
    templateKey: "ADMIN_INVITATION",
    metadata: { invitationId: input.id },
    redactValues: [input.token, url],
    payload: { to: input.email, subject, html: wrapEmailHtml(body, "FR"), text: `Bonjour ${input.name},\n\nCréez votre mot de passe et activez votre compte : ${url}\n\nLe lien expire dans 48 heures.` },
    logPayload: { to: input.email, subject, html: wrapEmailHtml(logBody, "FR"), text: "Invitation au back-office. [Lien d’activation omis du journal]" },
  })
  return sent.success
}

export async function createAdministratorInvitation(input: unknown) {
  const actor = await requireSuperAdmin()
  if (!actor) return { success: false as const, error: "Accès refusé." }
  const parsed = accountInput.safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Nom, adresse e-mail ou rôle invalide." }
  const token = randomBytes(32).toString("base64url")
  const now = new Date()
  let invitation: { id: string }
  try {
    invitation = await prisma.$transaction(async (tx) => {
      const existing = await tx.utilisateur.findFirst({ where: { email: { equals: parsed.data.email, mode: "insensitive" } }, select: { id: true } })
      if (existing) throw new Error("EMAIL_EXISTS")
      await tx.invitationAdministrateur.updateMany({
        where: { email: parsed.data.email, status: { in: ["PENDING", "SENT", "FAILED"] } },
        data: { status: "INVALIDATED" },
      })
      return tx.invitationAdministrateur.create({
        data: { ...parsed.data, tokenHash: digest(token), expiresAt: new Date(now.getTime() + INVITATION_TTL_MS), createdById: actor.userId },
        select: { id: true },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if ((error as { message?: string }).message === "EMAIL_EXISTS" || (error as { code?: string }).code === "P2002") {
      return { success: false as const, error: "Cette adresse e-mail est déjà associée à un compte." }
    }
    return { success: false as const, error: "Impossible de créer l’invitation. Réessayez." }
  }

  let sent = false
  try { sent = await sendInvitation({ id: invitation.id, token, name: parsed.data.name, email: parsed.data.email }) } catch { sent = false }
  await prisma.invitationAdministrateur.updateMany({
    where: { id: invitation.id, status: "PENDING", tokenHash: digest(token) },
    data: { status: sent ? "SENT" : "FAILED" },
  })
  if (!sent) return { success: false as const, invitationCreated: true, error: "Le fournisseur n’a pas confirmé l’envoi. Aucun compte actif n’a été créé ; vérifiez la configuration e-mail puis renvoyez une invitation." }
  return { success: true as const, message: "Invitation envoyée." }
}

export async function resendAdministratorInvitation(invitationId: string) {
  const actor = await requireSuperAdmin()
  if (!actor) return { success: false as const, error: "Accès refusé." }
  if (!z.string().min(1).safeParse(invitationId).success) return { success: false as const, error: "Invitation invalide." }
  const previous = await prisma.invitationAdministrateur.findUnique({ where: { id: invitationId } })
  if (!previous || !["PENDING", "SENT", "FAILED"].includes(previous.status)) return { success: false as const, error: "Invitation introuvable ou inactive." }
  const token = randomBytes(32).toString("base64url")
  const now = new Date()
  let next
  try {
    next = await prisma.$transaction(async (tx) => {
      const invalidated = await tx.invitationAdministrateur.updateMany({ where: { id: previous.id, status: { in: ["PENDING", "SENT", "FAILED"] } }, data: { status: "INVALIDATED" } })
      if (invalidated.count !== 1) throw new Error("INVITATION_CHANGED")
      return tx.invitationAdministrateur.create({
        data: { name: previous.name, email: previous.email, role: previous.role, createdById: actor.userId, tokenHash: digest(token), expiresAt: new Date(now.getTime() + INVITATION_TTL_MS) },
        select: { id: true },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch { return { success: false as const, error: "Impossible de renouveler cette invitation." } }
  let sent = false
  try { sent = await sendInvitation({ id: next.id, token, name: previous.name, email: previous.email }) } catch { sent = false }
  await prisma.invitationAdministrateur.updateMany({ where: { id: next.id, status: "PENDING", tokenHash: digest(token) }, data: { status: sent ? "SENT" : "FAILED" } })
  return sent ? { success: true as const, message: "Nouvelle invitation envoyée." } : { success: false as const, invitationCreated: true, error: "L’envoi a échoué. L’invitation reste inactive jusqu’à une nouvelle tentative." }
}

export async function invalidateAdministratorInvitation(invitationId: string) {
  if (!(await requireSuperAdmin())) return { success: false as const, error: "Accès refusé." }
  const result = await prisma.invitationAdministrateur.updateMany({ where: { id: invitationId, status: { in: ["PENDING", "SENT", "FAILED"] } }, data: { status: "INVALIDATED" } })
  return result.count === 1 ? { success: true as const } : { success: false as const, error: "Invitation introuvable ou déjà inactive." }
}

export async function updateAdministrator(input: unknown) {
  const actor = await requireSuperAdmin()
  if (!actor) return { success: false as const, error: "Accès refusé." }
  const parsed = manageInput.safeParse(input)
  if (!parsed.success || (parsed.data.role === undefined && parsed.data.active === undefined) || (parsed.data.role !== undefined && !isManagedAdminRole(parsed.data.role))) return { success: false as const, error: "Modification invalide." }
  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.utilisateur.findUnique({ where: { id: parsed.data.userId }, select: { id: true, role: true, active: true } })
      if (!target) throw new Error("USER_NOT_FOUND")
      const resultingRole = parsed.data.role ?? target.role
      const resultingActive = parsed.data.active ?? target.active
      const removesSuper = isActiveSuperAdmin(target.role, target.active) && !isActiveSuperAdmin(resultingRole, resultingActive)
      if (removesSuper) {
        const count = await tx.utilisateur.count({ where: { active: true, role: { in: ["SUPER_ADMIN", "SUPERADMIN", "ADMIN"] } } })
        if (!canRemoveActiveSuperAdmin(count)) throw new Error("LAST_SUPER_ADMIN")
      }
      await tx.utilisateur.update({ where: { id: target.id }, data: { ...(parsed.data.role ? { role: parsed.data.role } : {}), ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}), sessionVersion: { increment: 1 } } })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    const message = (error as { message?: string }).message
    if (message === "LAST_SUPER_ADMIN") return { success: false as const, error: "Le dernier super-administrateur actif doit rester actif et conserver ce rôle." }
    if (message === "USER_NOT_FOUND") return { success: false as const, error: "Compte introuvable." }
    return { success: false as const, error: "La modification a échoué. Réessayez." }
  }
  const selfRevoked = parsed.data.userId === actor.userId && (parsed.data.active === false || parsed.data.role !== undefined)
  if (selfRevoked) await deleteSession()
  return { success: true as const, selfRevoked }
}

export async function deleteAdministrator(userId: string) {
  const actor = await requireSuperAdmin()
  if (!actor) return { success: false as const, error: "Accès refusé." }
  if (!z.string().min(1).safeParse(userId).success) return { success: false as const, error: "Compte invalide." }
  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.utilisateur.findUnique({ where: { id: userId }, select: { id: true, role: true, active: true } })
      if (!target) throw new Error("USER_NOT_FOUND")
      if (isActiveSuperAdmin(target.role, target.active)) {
        const count = await tx.utilisateur.count({ where: { active: true, role: { in: ["SUPER_ADMIN", "SUPERADMIN", "ADMIN"] } } })
        if (!canRemoveActiveSuperAdmin(count)) throw new Error("LAST_SUPER_ADMIN")
      }
      // Keep application history and authored notes while removing the account identity links.
      await tx.candidature.updateMany({ where: { assignedToId: userId }, data: { assignedToId: null } })
      await tx.historiqueCandidature.updateMany({ where: { changedById: userId }, data: { changedById: null } })
      await tx.noteCandidature.updateMany({ where: { authorId: userId }, data: { authorId: null } })
      await tx.utilisateur.delete({ where: { id: userId } })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    const message = (error as { message?: string }).message
    if (message === "LAST_SUPER_ADMIN") return { success: false as const, error: "Le dernier super-administrateur actif ne peut pas être supprimé." }
    if (message === "USER_NOT_FOUND") return { success: false as const, error: "Compte introuvable." }
    if ((error as { code?: string }).code === "P2003") return { success: false as const, error: "Ce compte est référencé dans l’historique. Désactivez-le plutôt que de supprimer ces traces." }
    return { success: false as const, error: "La suppression a échoué. Réessayez." }
  }
  if (userId === actor.userId) await deleteSession()
  return { success: true as const, selfDeleted: userId === actor.userId }
}

export async function acceptAdministratorInvitation(input: unknown) {
  const parsed = z.object({ token: accountEmailChangeTokenSchema, password: accountPasswordChangeSchema.shape.newPassword }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: GENERIC_INVITATION_ERROR }
  const tokenHash = digest(parsed.data.token)
  const now = new Date()
  try {
    const result = await prisma.$transaction(async (tx) => {
      const invite = await tx.invitationAdministrateur.findUnique({ where: { tokenHash } })
      if (!invite || !isInvitationUsable(invite, now) || !isManagedAdminRole(invite.role)) return null
      const consumed = await tx.invitationAdministrateur.updateMany({ where: { id: invite.id, tokenHash, status: "SENT", expiresAt: { gt: now } }, data: { status: "ACCEPTED", acceptedAt: now } })
      if (consumed.count !== 1) return null
      const emailTaken = await tx.utilisateur.findFirst({ where: { email: { equals: invite.email, mode: "insensitive" } }, select: { id: true } })
      if (emailTaken) throw new Error("EMAIL_TAKEN")
      const passwordHash = await bcrypt.hash(parsed.data.password, 12)
      const user = await tx.utilisateur.create({ data: { name: invite.name, email: invite.email, role: invite.role, passwordHash, active: true }, select: { id: true, role: true, sessionVersion: true } })
      return user
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    if (!result) return { success: false as const, error: GENERIC_INVITATION_ERROR }
    return { success: true as const, message: "Compte activé. Vous pouvez maintenant vous connecter." }
  } catch (error) {
    if ((error as { message?: string }).message === "EMAIL_TAKEN" || (error as { code?: string }).code === "P2002") return { success: false as const, error: "Cette adresse e-mail est désormais associée à un compte. Contactez un super-administrateur." }
    return { success: false as const, error: "L’activation n’a pas pu être effectuée. Demandez une nouvelle invitation." }
  }
}

export async function isAdministratorInvitationAvailable(token: unknown) {
  const parsed = accountEmailChangeTokenSchema.safeParse(token)
  if (!parsed.success) return false
  try {
    const invite = await prisma.invitationAdministrateur.findUnique({ where: { tokenHash: digest(parsed.data) }, select: { status: true, expiresAt: true } })
    return Boolean(invite && isInvitationUsable(invite))
  } catch { return false }
}
