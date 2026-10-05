"use client"

import React from "react"
import { useParams } from "next/navigation"
import AboutView from "@/views/AboutView"
import type { Language } from "@/types"

export default function AboutPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return <AboutView lang={lang} />
}
