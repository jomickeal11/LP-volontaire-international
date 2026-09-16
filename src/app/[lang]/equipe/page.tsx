"use client"

import React from "react"
import { useParams } from "next/navigation"
import TeamView from "@/views/TeamView"
import type { Language } from "@/types"

export default function TeamPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <TeamView lang={lang} />
}
