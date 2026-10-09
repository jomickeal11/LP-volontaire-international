import React from "react"
import GalleryView from "@/views/GalleryView"
import { getMedia, getPublishedAlbums } from "@/lib/cms-actions"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 60

export default async function GalleryPage({ params }: PageProps) {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const [medias, albums] = await Promise.all([getMedia(), getPublishedAlbums()])

  return <GalleryView lang={upperLang} initialMedias={medias} initialAlbums={albums} />
}