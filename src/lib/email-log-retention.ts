import { prisma } from "@/lib/prisma"

export interface PurgeEmailLogsOptions {
  /** Nombre de mois de rétention (par défaut : 18) */
  retentionMonths?: number
  /** Taille des lots de suppression pour éviter de verrouiller la table (par défaut : 500) */
  batchSize?: number
}

export interface PurgeEmailLogsResult {
  success: boolean
  deleted: number
  cutoffDate?: string
  error?: string
}

/**
 * Purge définitive et sécurisée des enregistrements EmailLog antérieurs au seuil de rétention.
 * 
 * RÈGLES APPLIQUÉES :
 * - Conservation des EmailLog pendant 18 mois (par défaut).
 * - Suppression définitive uniquement des logs dont sentAt < maintenant - 18 mois.
 * - bodyHtml et bodyText sont conservés intacts pour les emails récents (< 18 mois).
 * - Suppression par lots (batching) pour éviter les transactions lourdes sur PostgreSQL.
 * - Idempotente : une exécution répétée sans logs expirés renvoie { success: true, deleted: 0 }.
 * - Aucun contenu d'email ni donnée personnelle n'est consigné dans les logs serveur.
 */
export async function purgeExpiredEmailLogs(
  options: PurgeEmailLogsOptions = {}
): Promise<PurgeEmailLogsResult> {
  const retentionMonths = options.retentionMonths ?? 18
  const batchSize = Math.max(1, Math.min(options.batchSize ?? 500, 2000))

  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths)

  console.log(
    `[EmailLog Retention] Début de la purge des EmailLog (seuil : ${retentionMonths} mois, antérieur au ${cutoffDate.toISOString()})...`
  )

  let totalDeleted = 0

  try {
    let hasMore = true

    while (hasMore) {
      // Sélection des IDs expirés par lot
      const batch = await prisma.emailLog.findMany({
        where: {
          sentAt: {
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

      const deleteResult = await prisma.emailLog.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      totalDeleted += deleteResult.count

      // Si le lot retourné était inférieur à la taille demandée, il n'y a plus de logs expirés
      if (batch.length < batchSize) {
        hasMore = false
      }
    }

    console.log(
      `[EmailLog Retention] Fin de la purge : ${totalDeleted} EmailLog supprimé(s) avec succès.`
    )

    return {
      success: true,
      deleted: totalDeleted,
      cutoffDate: cutoffDate.toISOString(),
    }
  } catch (error: any) {
    console.error(
      "[EmailLog Retention] Erreur lors de la purge des EmailLog :",
      error?.message || error
    )

    return {
      success: false,
      deleted: totalDeleted,
      cutoffDate: cutoffDate.toISOString(),
      error: error?.message || "Erreur inattendue lors de la purge.",
    }
  }
}
