import { redirect } from "next/navigation"
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

/**
 * Garde serveur des pages protégées. Vérifie la session ET l'existence réelle
 * du compte en base avant toute récupération de données. Un compte supprimé
 * est redirigé vers la connexion avec le marqueur `session=invalid`.
 *
 * Cette garde est appliquée au niveau de chaque page qui lit des données
 * côté serveur : Next.js peut rendre la page en parallèle du layout, et une
 * redirection appelée seulement dans le layout ne garantit pas que les données
 * de la page ne soient pas déjà sérialisées dans la réponse.
 */
export async function requireAccount(): Promise<CurrentAccount> {
  const account = await getCurrentAccount()
  if (!account) {
    redirect("/backoffice/login?session=invalid")
  }
  return account
}