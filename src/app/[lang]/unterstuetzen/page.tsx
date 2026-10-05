"use client"

import React from "react"
import { useParams } from "next/navigation"
import SupportView from "@/views/SupportView"
import type { Language } from "@/types"

export default function UnterstuetzenPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return <SupportView lang={lang} />
}
