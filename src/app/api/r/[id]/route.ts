import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const link = await prisma.lienCampagne.findUnique({ where: { id } })

    // Lien inconnu (ou identifiant invalide) : retour à l'accueil sans erreur 500.
    if (!link) {
      return NextResponse.redirect(new URL("/", request.url), { status: 307 })
    }

    const destination = new URL(link.destinationPath, request.url)

    destination.searchParams.set("utm_source", link.utmSource)
    destination.searchParams.set("utm_medium", link.utmMedium)
    destination.searchParams.set("utm_campaign", link.utmCampaign)
    if (link.utmContent) destination.searchParams.set("utm_content", link.utmContent)
    if (link.utmTerm) destination.searchParams.set("utm_term", link.utmTerm)

    // Comptage best-effort : ne bloque jamais la redirection.
    try {
      await prisma.lienCampagne.update({
        where: { id },
        data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
      })
    } catch (error) {
      console.error("Erreur comptage clic lien de campagne:", error)
    }

    return NextResponse.redirect(destination, { status: 307 })
  } catch (error) {
    console.error("Erreur lecture lien de campagne:", error)
    return NextResponse.redirect(new URL("/", request.url), { status: 307 })
  }
}