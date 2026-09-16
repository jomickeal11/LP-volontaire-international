"use client"

import React from "react"
import { useParams } from "next/navigation"
import ContactView from "@/views/ContactView"
import type { Language } from "@/types"

export default function ContactPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <ContactView lang={lang} />
}
