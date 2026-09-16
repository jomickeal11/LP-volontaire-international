"use client"

import React from "react"
import { useParams } from "next/navigation"
import NewsView from "@/views/NewsView"
import type { Language } from "@/types"

export default function NewsPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <NewsView lang={lang} />
}
