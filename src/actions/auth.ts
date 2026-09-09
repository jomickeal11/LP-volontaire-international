"use server"

import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/auth"
import { checkRateLimit, getClientIp } from "@/lib/security"
import bcrypt from "bcryptjs"

export async function loginAction(email?: string, password?: string) {
  if (!email || !password) {
    return { error: "Please enter your email and password." }
  }

  try {
    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`login-attempt:${ip}`, 5, 15 * 60 * 1000) // Max 5 tentatives par 15 min
    if (!rateCheck.allowed) {
      return {
        error: "Trop de tentatives de connexion échouées. Par mesure de sécurité, votre accès est bloqué pendant 15 minutes."
      }
    }

    const user = await prisma.utilisateur.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Invalid email or password." }
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return { error: "Invalid email or password." }
    }

    await createSession(user.id, user.role)
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function logoutAction() {
  await deleteSession()
}
