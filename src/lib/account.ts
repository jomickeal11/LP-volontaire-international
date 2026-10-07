import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"

/**
 * Compte réellement connecté, lu depuis la session signée (cookie JWT)
 * puis hydraté depuis la base. Aucune donnée n'est inventée : seuls les
 * champs présents dans le modèle `Utilisateur` sont exposés.
 */
export interface CurrentAccount {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const session = await verifySession()
  if (!session?.userId) return null

  return prisma.utilisateur.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}