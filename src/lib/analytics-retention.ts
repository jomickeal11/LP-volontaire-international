import { prisma } from "@/lib/prisma"

export interface PurgeAnalyticsEventsOptions {
  /** Nombre de mois de rétention (par défaut : 18) */
  retentionMonths?: number
  /** Taille des lots de suppression pour éviter les verrous de table (par défaut : 500) */
  batchSize?: number
}

export interface PurgeAnalyticsEventsResult {
  success: boolean
  deleted: number
  cutoffDate?: string
  error?: string
}

/**
 * Purge définitive et sécurisée des événements de télémétrie EvenementStatistique
 * antérieurs au seuil de rétention (18 mois par défaut).
 * 
 * RÈGLES APPLIQUÉES :
 * - Conservation des événements pendant 18 mois pour couvrir le cycle annuel et le dashboard.
 * - Suppression définitive uniquement des événements dont createdAt < maintenant - 18 mois.
 * - Suppression par lots (batching) pour éviter les verrous de longue durée sur PostgreSQL.
 * - Idempotente : une exécution répétée sans événements expirés renvoie { success: true, deleted: 0 }.
 * - Logs serveur stricts et minimaux (aucune exposition de données individuelles).
 */
export async function purgeExpiredAnalyticsEvents(
  options: PurgeAnalyticsEventsOptions = {}
): Promise<PurgeAnalyticsEventsResult> {
  const retentionMonths = options.retentionMonths ?? 18
  const batchSize = Math.max(1, Math.min(options.batchSize ?? 500, 2000))

  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths)

  console.log(
    `[Analytics Retention] Début de la purge des EvenementStatistique (seuil : ${retentionMonths} mois, antérieur au ${cutoffDate.toISOString()})...`
  )

  let totalDeleted = 0

  try {
    let hasMore = true

    while (hasMore) {
      // 1. Sélection des identifiants des événements expirés par lot
      const batch = await prisma.evenementStatistique.findMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
        },
        take: batchSize,
      })

      if (batch.length === 0) {
        hasMore = false
        break
      }

      const ids = batch.map((item) => item.id)

      // 2. Suppression ciblée du lot
      const deleteResult = await prisma.evenementStatistique.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      totalDeleted += deleteResult.count

      if (batch.length < batchSize) {
        hasMore = false
      }
    }

    console.log(
      `[Analytics Retention] Fin de la purge : ${totalDeleted} EvenementStatistique supprimé(s) avec succès.`
    )

    return {
      success: true,
      deleted: totalDeleted,
      cutoffDate: cutoffDate.toISOString(),
    }
  } catch (error: any) {
    console.error(
      "[Analytics Retention] Erreur lors de la purge des EvenementStatistique :",
      error?.message || error
    )

    return {
      success: false,
      deleted: totalDeleted,
      cutoffDate: cutoffDate.toISOString(),
      error: error?.message || "Erreur inattendue lors de la purge des événements.",
    }
  }
}
