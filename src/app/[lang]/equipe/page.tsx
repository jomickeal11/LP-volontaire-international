import React from "react"
import TeamView from "@/views/TeamView"
import { getTeamMembers } from "@/lib/cms-actions"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 60

export default async function TeamPage({ params }: PageProps) {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const res = await getTeamMembers({ activeOnly: true })
  const initialMembers = res.success && Array.isArray(res.members) ? res.members : []

  return <TeamView lang={upperLang} initialMembers={initialMembers} />
}
