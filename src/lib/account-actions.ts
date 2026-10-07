"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import bcrypt from "bcryptjs"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

/** Retry wrapper for Prisma queries — handles Neon cold starts (scale-to-zero). */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw new Error("Unreachable")
}

/**
 * Met à jour les informations personnelles du compte connecté uniquement.
 * Le rôle n'est volontairement jamais modifiable depuis cet écran.
 */
export async function updateOwnProfile(
  name: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    const cleanEmail = (email || "").trim()

    if (name.trim().length < 2) {
      return { success: false, error: "Le nom d'affichage doit contenir au moins 2 caractères." }
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, error: "Veuillez saisir une adresse e-mail valide." }
    }

    const duplicate = await withRetry(() =>
      prisma.utilisateur.findFirst({
        where: { email: cleanEmail, NOT: { id: session.userId } },
        select: { id: true },
      })
    )
    if (duplicate) {
      return { success: false, error: "Cette adresse e-mail est déjà utilisée par un autre compte." }
    }

    await withRetry(() =>
      prisma.utilisateur.update({
        where: { id: session.userId },
        data: { name: name.trim(), email: cleanEmail },
        select: { id: true },
      })
    )

    return { success: true }
  } catch (err) {
    console.error("updateOwnProfile error:", err)
    return { success: false, error: "Une erreur serveur est survenue. Veuillez réessayer." }
  }
}

/**
 * Change le mot de passe du compte connecté après vérification de l'ancien.
 * Le hachage reste bcrypt (bcryptjs), identique à l'authentification actuelle.
 */
export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Action non autorisée. Session administrateur requise." }
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "Veuillez renseigner tous les champs du mot de passe." }
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return {
        success: false,
        error: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
      }
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: "La confirmation ne correspond pas au nouveau mot de passe." }
    }

    const user = await withRetry(() =>
      prisma.utilisateur.findUnique({
        where: { id: session.userId },
        select: { passwordHash: true },
      })
    )
    if (!user) {
      return { success: false, error: "Compte introuvable." }
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!passwordMatch) {
      return { success: false, error: "L'ancien mot de passe est incorrect." }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await withRetry(() =>
      prisma.utilisateur.update({
        where: { id: session.userId },
        data: { passwordHash },
        select: { id: true },
      })
    )

    return { success: true }
  } catch (err) {
    console.error("changeOwnPassword error:", err)
    return { success: false, error: "Une erreur serveur est survenue. Veuillez réessayer." }
  }
}