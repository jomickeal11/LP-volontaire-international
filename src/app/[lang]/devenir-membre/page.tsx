"use client"

import React from "react"
import { useParams } from "next/navigation"
import MembershipView from "@/views/MembershipView"
import type { Language } from "@/types"

export default function MembershipPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <MembershipView lang={lang} />
}
