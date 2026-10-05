"use client"

import React from "react"
import { useParams } from "next/navigation"
import ProjectsView from "@/views/ProjectsView"
import type { Language } from "@/types"

export default function ProjectsPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return <ProjectsView lang={lang} />
}
