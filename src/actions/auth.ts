"use server"

import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/auth"
import { checkRateLimit, getClientIp } from "@/lib/security"
import bcrypt from "bcryptjs"

/** Retry wrapper for Prisma queries — handles Neon cold starts (scale-to-zero) */
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

export async function loginAction(email?: string, password?: string) {
  if (!email || !password) {
    return { error: "Veuillez saisir votre adresse e-mail et votre mot de passe." }
  }

  try {
    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`login-attempt:${ip}`, 5, 15 * 60 * 1000) // Max 5 tentatives par 15 min
    if (!rateCheck.allowed) {
      return {
        error: "Trop de tentatives de connexion échouées. Par mesure de sécurité, votre accès est bloqué pendant 15 minutes."
      }
    }

    const user = await withRetry(() =>
      prisma.utilisateur.findUnique({
        where: { email },
      })
    )

    if (!user) {
      return { error: "Adresse e-mail ou mot de passe incorrect." }
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return { error: "Adresse e-mail ou mot de passe incorrect." }
    }

    await createSession(user.id, user.role)
    return { success: true }
  } catch (error: unknown) {
    console.error("Login error:", error)

    // Detect Neon / Prisma connection errors
    const code = (error as { code?: string })?.code
    const message = (error as { message?: string })?.message ?? ""

    if (
      code === "P1001" ||
      code === "P1008" ||
      code === "P1017" ||
      code === "P2024" ||
      message.includes("Can't reach database") ||
      message.includes("ECONNREFUSED") ||
      message.includes("connection timed out")
    ) {
      return {
        error: "La base de données est en cours de démarrage. Veuillez patienter quelques secondes puis réessayer."
      }
    }

    return { error: "Une erreur serveur est survenue. Veuillez réessayer." }
  }
}

export async function logoutAction() {
  await deleteSession()
}
