import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { processNewsletterUnsubscribe } from "@/lib/newsletter-consent"
import { getSiteUrl } from "@/lib/seo"
import { isAllowedNewsletterUnsubscribeOrigin, genericNewsletterUnsubscribeResult } from "@/lib/newsletter-unsubscribe-security"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const GENERIC_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedNewsletterUnsubscribeOrigin({
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      requestOrigin: request.nextUrl.origin,
      expectedOrigin: getSiteUrl(),
    })) {
      return NextResponse.json({ success: false, error: "Origine de requête invalide." }, {
        status: 403,
        headers: GENERIC_HEADERS,
      })
    }
  } catch {
    return NextResponse.json({ success: false, error: "Origine de requête invalide." }, {
      status: 403,
      headers: GENERIC_HEADERS,
    })
  }

  const body = await request.json().catch(() => null)
  const token = body && typeof body.token === "string" ? body.token : null

  try {
    const result = await processNewsletterUnsubscribe(
      {
        findToken: (tokenHash) =>
          prisma.newsletterUnsubscribeToken.findUnique({
            where: { tokenHash },
            select: { subscriberId: true, expiresAt: true },
          }),
        deactivateIfActive: async (subscriberId, at) => {
          await prisma.newsletterAbonne.updateMany({
            where: { id: subscriberId, active: true },
            data: { active: false, unsubscribedAt: at },
          })
        },
      },
      token,
    )

    // Invalid and expired links receive the same response as valid links.
    return NextResponse.json(genericNewsletterUnsubscribeResult(result), { status: 200, headers: GENERIC_HEADERS })
  } catch {
    console.error("[Newsletter unsubscribe] Request failed.")
    return NextResponse.json(
      { success: false, error: "La demande n’a pas pu être traitée. Réessayez plus tard." },
      { status: 503, headers: GENERIC_HEADERS },
    )
  }
}
