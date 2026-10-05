"use server"

import { prisma } from "./prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { verifySession } from "./auth"
import {
  CHANNEL_MAP,
  normalizeCampaignSlug,
  buildCampaignUrl,
} from "./campaign-utils"

// ─── Schéma de validation ─────────────────────────────────────────────────────

const CreateLinkSchema = z.object({
  label:           z.string().min(1).max(200),
  destinationPath: z.string().min(1).max(200),
  channel:         z.string().min(1),
  customSource:    z.string().max(100).optional(),
  campaignName:    z.string().min(1).max(200),
  utmContent:      z.string().max(200).optional(),
  utmTerm:         z.string().max(200).optional(),
  baseUrl:         z.string().url(),
  createdBy:       z.string().email().optional(),
})

export type CreateCampaignLinkInput = z.infer<typeof CreateLinkSchema>

export interface CreateCampaignLinkResult {
  success: boolean
  data?: {
    id: string
    generatedUrl: string
    utmCampaign: string
  }
  error?: string
}

// ─── Server Action : création d'un lien de campagne ──────────────────────────

export async function createCampaignLink(
  input: CreateCampaignLinkInput,
): Promise<CreateCampaignLinkResult> {
  const parsed = CreateLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Données invalides." }
  }

  const {
    label,
    destinationPath,
    channel,
    customSource,
    campaignName,
    utmContent,
    utmTerm,
    baseUrl,
    createdBy,
  } = parsed.data

  const channelDef = CHANNEL_MAP[channel]
  if (!channelDef) {
    return { success: false, error: "Canal inconnu." }
  }

  const utmSource = channelDef.sourceIsCustom
    ? normalizeCampaignSlug(customSource || channel)
    : channelDef.utmSource
  const utmMedium   = channelDef.utmMedium
  const utmCampaign = normalizeCampaignSlug(campaignName)

  if (!utmCampaign) {
    return { success: false, error: "Le nom de la campagne est invalide." }
  }

  const generatedUrl = buildCampaignUrl({
    baseUrl,
    destinationPath,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent: utmContent || undefined,
    utmTerm:    utmTerm    || undefined,
  })

  try {
    const record = await (prisma as any).lienCampagne.create({
      data: {
        label,
        destinationPath,
        channel,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent: utmContent || null,
        utmTerm:    utmTerm    || null,
        generatedUrl,
        createdBy:  createdBy  || null,
      },
    })

    return {
      success: true,
      data: { id: record.id, generatedUrl, utmCampaign },
    }
  } catch (err) {
    console.error("[createCampaignLink]", err)
    return { success: false, error: "Erreur lors de la sauvegarde." }
  }
}

// ─── Server Action : lecture des liens sauvegardés ───────────────────────────

export interface SavedCampaignLink {
  id:              string
  label:           string
  destinationPath: string
  channel:         string
  utmCampaign:     string
  utmContent:      string | null
  generatedUrl:    string
  createdAt:       string
}

export async function getSavedCampaignLinks(limit = 50): Promise<SavedCampaignLink[]> {
  try {
    const rows = await (prisma as any).lienCampagne.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id:              true,
        label:           true,
        destinationPath: true,
        channel:         true,
        utmCampaign:     true,
        utmContent:      true,
        generatedUrl:    true,
        createdAt:       true,
      },
    })

    return rows.map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  } catch {
    return []
  }
}

// ─── Server Action : suppression individuelle d'un lien de campagne ──────────

export async function deleteLienCampagne(
  id: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!id) {
      return { success: false, error: "Identifiant du lien manquant." }
    }

    const session = await verifySession()
    if (!session?.userId) {
      return { success: false, error: "Authentification requise." }
    }

    await (prisma as any).lienCampagne.delete({ where: { id } })

    try {
      revalidatePath("/backoffice/statistics")
    } catch {
      // ignore hors contexte Next.js
    }
    try {
      revalidatePath("/[lang]/backoffice/statistics")
    } catch {
      // ignore hors contexte Next.js
    }

    return { success: true, message: "Lien de campagne supprimé avec succès." }
  } catch (err: any) {
    console.error("[deleteLienCampagne]", err)
    return { success: false, error: "Erreur lors de la suppression du lien." }
  }
}
