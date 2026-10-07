import { NextRequest, NextResponse } from "next/server"
import { purgeExpiredAnalyticsEvents } from "@/lib/analytics-retention"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Validation stricte de l'autorisation par Bearer Token (CRON_SECRET).
 * Identique au mécanisme utilisé pour cleanup-email-logs (B1).
 * Aucun token dans la query string n'est accepté.
 */
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[Cron Retention] ERREUR : La variable d'environnement CRON_SECRET n'est pas définie sur le serveur.")
    return false
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return false
  }

  // Format requis : Authorization: Bearer <CRON_SECRET>
  const expectedHeader = `Bearer ${cronSecret}`
  return authHeader === expectedHeader
}

async function handleCleanup(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Non autorisé. Jeton d'authentification Bearer manquant ou invalide." },
      { status: 401 }
    )
  }

  try {
    // Purge limitée exclusivement aux EvenementStatistique > 18 mois
    const result = await purgeExpiredAnalyticsEvents({ retentionMonths: 18 })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          deleted: result.deleted,
          error: "Une erreur est survenue pendant l'exécution de la purge.",
        },
        { status: 500 }
      )
    }

    // Réponse minimale sécurisée, sans exposition de données statistiques individuelles
    return NextResponse.json(
      {
        success: true,
        deleted: result.deleted,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error("[Cron Analytics Retention] Exception non interceptée :", err?.message || err)
    return NextResponse.json(
      {
        success: false,
        deleted: 0,
        error: "Erreur interne du serveur lors du nettoyage des événements analytiques.",
      },
      { status: 500 }
    )
  }
}

/**
 * Support GET (utilisé nativement par Vercel Cron).
 */
export async function GET(request: NextRequest) {
  return handleCleanup(request)
}

/**
 * Support POST (utilisable par webhooks externes / scripts curl).
 */
export async function POST(request: NextRequest) {
  return handleCleanup(request)
}
