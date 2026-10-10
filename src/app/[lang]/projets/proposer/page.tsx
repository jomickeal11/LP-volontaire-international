import { notFound } from "next/navigation"
import ProjectProposalView from "@/views/ProjectProposalView"
import type { Language } from "@/types"

export default async function ProjectProposalPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang = rawLang.toUpperCase()
  if (!["FR", "EN", "DE"].includes(lang)) notFound()

  return <ProjectProposalView lang={lang as Language} />
}
