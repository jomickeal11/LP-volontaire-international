"use client"

import React from "react"
import { useParams } from "next/navigation"
import SupportView from "@/views/SupportView"
import type { Language } from "@/types"

export default function SoutenirPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <SupportView lang={lang} />
}
