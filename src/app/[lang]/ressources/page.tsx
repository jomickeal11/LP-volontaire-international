"use client"

import React from "react"
import { useParams } from "next/navigation"
import ResourcesView from "@/views/ResourcesView"
import type { Language } from "@/types"

export default function ResourcesPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return <ResourcesView lang={lang} />
}
