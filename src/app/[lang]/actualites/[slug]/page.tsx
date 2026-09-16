"use client"

import React from "react"
import { useParams } from "next/navigation"
import ArticleDetailView from "@/views/ArticleDetailView"
import type { Language } from "@/types"

export default function ArticleDetailPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"
  const slug = (params?.slug as string) || ""

  return <ArticleDetailView lang={lang} slug={slug} />
}
