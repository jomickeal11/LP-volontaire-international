"use client"

import React from "react"
import { useParams } from "next/navigation"
import MembershipView from "@/views/MembershipView"
import type { Language } from "@/types"

export default function MembershipPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return <MembershipView lang={lang} />
}
