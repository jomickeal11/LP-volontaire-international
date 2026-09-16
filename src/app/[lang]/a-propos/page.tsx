"use client"

import React from "react"
import { useParams } from "next/navigation"
import AboutView from "@/views/AboutView"
import type { Language } from "@/types"

export default function AboutPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <AboutView lang={lang} />
}
