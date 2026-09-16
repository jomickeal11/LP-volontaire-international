"use client"

import React from "react"
import { useParams } from "next/navigation"
import GalleryView from "@/views/GalleryView"
import type { Language } from "@/types"

export default function GalleryPage() {
  const params = useParams()
  const lang = (params?.lang as Language) || "FR"

  return <GalleryView lang={lang} />
}
