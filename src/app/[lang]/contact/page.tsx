"use client"

import React, { Suspense } from "react"
import { useParams } from "next/navigation"
import ContactView from "@/views/ContactView"
import type { Language } from "@/types"

export default function ContactPage() {
  const params = useParams()
  const rawLang = ((params?.lang as string) || "FR").toUpperCase()
  const lang = (["FR", "EN", "DE"].includes(rawLang) ? rawLang : "FR") as Language

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ContactView lang={lang} />
    </Suspense>
  )
}
