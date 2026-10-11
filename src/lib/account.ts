import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { hasAdminPermission } from "@/lib/access-control"

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
  emailChangeRequest: {
    newEmail: string
    status: string
    expiresAt: Date
    lastAttemptAt: Date | null
  } | null
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
      emailChangeRequest: {
        select: { newEmail: true, status: true, expiresAt: true, lastAttemptAt: true },
      },
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
  if (!hasAdminPermission(account.role, "backoffice:access")) {
    redirect("/backoffice/forbidden")
  }
  return account
}
