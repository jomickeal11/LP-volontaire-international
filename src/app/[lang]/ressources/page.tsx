"use client"

import React from "react"
import { useParams } from "next/navigation"
import ResourcesView from "@/views/ResourcesView"
import type { Language } from "@/types"

export default function ResourcesPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <ResourcesView lang={lang} />
}
