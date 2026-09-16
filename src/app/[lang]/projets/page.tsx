"use client"

import React from "react"
import { useParams } from "next/navigation"
import ProjectsView from "@/views/ProjectsView"
import type { Language } from "@/types"

export default function ProjectsPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <ProjectsView lang={lang} />
}
