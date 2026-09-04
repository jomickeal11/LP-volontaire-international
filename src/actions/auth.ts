"use server"

import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function loginAction(email?: string, password?: string) {
  if (!email || !password) {
    return { error: "Please enter your email and password." }
  }

  try {
    const user = await prisma.user.findUnique({
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
