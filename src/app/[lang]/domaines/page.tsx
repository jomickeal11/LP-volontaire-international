"use client"

import React from "react"
import { useParams } from "next/navigation"
import DomainsView from "@/views/DomainsView"
import type { Language } from "@/types"

export default function DomainsPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <DomainsView lang={lang} />
}
