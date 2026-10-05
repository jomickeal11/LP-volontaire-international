"use client"

import React from "react"
import { useParams } from "next/navigation"
import NewsView from "@/views/NewsView"
import type { Language } from "@/types"

export default function NewsPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return <NewsView lang={lang} />
}
