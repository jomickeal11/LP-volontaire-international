"use client"

import React, { useEffect, useMemo, useState } from "react"
import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface GalleryViewProps {
  lang: Language
  initialMedias?: GalleryMedia[]
}

/**
 * Représentation d'un média publiable, alignée sur le modèle Prisma `Media`.
 */
export interface GalleryMedia {
  id: string
  titleFr: string
  titleEn?: string | null
  titleDe?: string | null
  captionFr?: string | null
  captionEn?: string | null
  captionDe?: string | null
  url: string
  thumbnailUrl?: string | null
  type?: string | null
  album?: string | null
  category?: string | null
  order?: number | null
  featured?: boolean | null
  createdAt?: string | Date | null
}

// Interne à la vue, avec les contenus déjà résolus pour la langue courante
interface ProcessedGalleryMedia extends GalleryMedia {
  _locTitle: string
  _locCaption: string
}

const BG = "#F7F8FA"
const BLUE = "#003366"
const GREEN = "#28A745"

const I18N = {
  FR: {
    title: "Galerie",
    subtitle:
      "Images, vidéos et moments de terrain qui racontent les projets et les communautés accompagnées par APTIC-R.",
    filterAll: "Toutes",
    filterPhotos: "Photos",
    filterVideos: "Vidéos",
    featuredTitle: "À la une",
    filterCategories: "Thématiques",
    emptyTitle: "Notre galerie sera bientôt disponible.",
    emptyDesc:
      "Découvrez prochainement les images et vidéos de nos projets, formations et activités de terrain.",
    emptyFilteredTitle: "Aucun média pour cette sélection.",
    emptyFilteredDesc: "Choisissez un autre filtre pour parcourir la galerie.",
    lightboxClose: "Fermer",
    openVideo: "Ouvrir la vidéo",
    videoUnavailable: "Vidéo non disponible",
    prev: "Média précédent",
    next: "Média suivant",
    albumsTab: "Albums",
    generalGallery: "Galerie générale",
    backToAlbums: "Retour aux albums",
    mediaCount: "médias",
  },
  EN: {
    title: "Gallery",
    subtitle:
      "Images, videos and moments from the field telling the story of the projects and communities APTIC-R supports.",
    filterAll: "All",
    filterPhotos: "Photos",
    filterVideos: "Videos",
    featuredTitle: "Featured",
    filterCategories: "Themes",
    emptyTitle: "Our gallery will be available soon.",
    emptyDesc:
      "Images and videos from our projects, trainings and field activities will be published shortly.",
    emptyFilteredTitle: "No media for this selection.",
    emptyFilteredDesc: "Choose another filter to browse the gallery.",
    lightboxClose: "Close",
    openVideo: "Open the video",
    videoUnavailable: "Video unavailable",
    prev: "Previous media",
    next: "Next media",
    albumsTab: "Albums",
    generalGallery: "General Gallery",
    backToAlbums: "Back to albums",
    mediaCount: "media",
  },
  DE: {
    title: "Galerie",
    subtitle:
      "Bilder, Videos und Momente aus der Feldarbeit, die die Projekte und Gemeinschaften rund um APTIC-R zeigen.",
    filterAll: "Alle",
    filterPhotos: "Fotos",
    filterVideos: "Videos",
    featuredTitle: "Im Fokus",
    filterCategories: "Themen",
    emptyTitle: "Unsere Galerie wird bald verfügbar sein.",
    emptyDesc:
      "Bilder und Videos aus unseren Projekten, Schulungen und Aktivitäten vor Ort erscheinen in Kürze.",
    emptyFilteredTitle: "Keine Medien für diese Auswahl.",
    emptyFilteredDesc: "Wählen Sie einen anderen Filter, um die Galerie zu durchsuchen.",
    lightboxClose: "Schließen",
    openVideo: "Video öffnen",
    videoUnavailable: "Video nicht verfügbar",
    prev: "Vorheriges Medium",
    next: "Nächstes Medium",
    albumsTab: "Alben",
    generalGallery: "Allgemeine Galerie",
    backToAlbums: "Zurück zu den Alben",
    mediaCount: "Medien",
  },
}

type TypeFilter = "ALL" | "PHOTO" | "VIDEO"

const EDITORIAL_PATTERN = [
  "lg:col-span-4 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
] as const

const MAX_CATEGORY_FILTERS = 6

function normalizeType(media: ProcessedGalleryMedia): TypeFilter {
  const raw = String(media.type || "PHOTO").toUpperCase()
  return raw === "VIDEO" ? "VIDEO" : "PHOTO"
}

function isVideo(media: ProcessedGalleryMedia) {
  return normalizeType(media) === "VIDEO"
}

function getThumbnail(media: ProcessedGalleryMedia) {
  return (media.thumbnailUrl && media.thumbnailUrl.trim()) || media.url
}

function getCategory(media: ProcessedGalleryMedia) {
  return (media.category && media.category.trim()) || ""
}

function getYear(media: ProcessedGalleryMedia) {
  if (!media.createdAt) return null
  const date = new Date(media.createdAt)
  if (Number.isNaN(date.getTime())) return null
  return String(date.getFullYear())
}

function sortMedias(medias: ProcessedGalleryMedia[]) {
  return [...medias].sort((a, b) => {
    const orderDiff = (a.order ?? 9999) - (b.order ?? 9999)
    if (orderDiff !== 0) return orderDiff
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
}

const DIRECT_VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i

function isDirectVideoFile(url: string) {
  return DIRECT_VIDEO_EXT.test(url)
}

function getEmbedUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
      const id = parsed.searchParams.get("v")
      if (id) return `https://www.youtube.com/embed/${id}`
      if (parsed.pathname.startsWith("/embed/")) return url
      if (parsed.pathname.startsWith("/shorts/")) {
        const shortId = parsed.pathname.split("/")[2]
        return shortId ? `https://www.youtube.com/embed/${shortId}` : null
      }
      return null
    }

    if (host.endsWith("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }

    return null
  } catch {
    return null
  }
}

function MediaPlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5v13.5H3.75zM3.75 15.75l4.5-4.5 4.5 4.5M9 9.75h.008v.008H9V9.75z" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  )
}

export default function GalleryView({ lang, initialMedias = [] }: GalleryViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [viewMode, setViewMode] = useState<"GALLERY" | "ALBUMS">("GALLERY")
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const medias = useMemo(() => {
    return (Array.isArray(initialMedias) ? initialMedias : [])
      .map((media) => {
        let locTitle = ""
        let locCaption = ""

        if (lang === "EN") {
          locTitle = media.titleEn || ""
          locCaption = media.captionEn || ""
        } else if (lang === "DE") {
          locTitle = media.titleDe || ""
          locCaption = media.captionDe || ""
        } else {
          locTitle = media.titleFr || ""
          locCaption = media.captionFr || ""
        }

        return {
          ...media,
          _locTitle: locTitle.trim(),
          _locCaption: locCaption.trim(),
        }
      })
      .filter((m) => m._locTitle.length > 0) // On exclut les médias non traduits dans cette langue
  }, [initialMedias, lang])

  const featured = useMemo(() => sortMedias(medias.filter((m) => m.featured === true)), [medias])

  const albumsList = useMemo(() => {
    const map = new Map<string, ProcessedGalleryMedia[]>()
    for (const media of medias) {
      const album = media.album?.trim()
      if (!album) continue
      if (!map.has(album)) map.set(album, [])
      map.get(album)!.push(media)
    }
    return Array.from(map.entries())
      .map(([name, items]) => {
        const sorted = sortMedias(items)
        return {
          name,
          items: sorted,
          cover: sorted.find((m) => m.thumbnailUrl || m.url) || sorted[0],
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [medias])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const media of medias) {
      const category = getCategory(media)
      if (!category) continue
      counts.set(category, (counts.get(category) || 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_CATEGORY_FILTERS)
      .map(([label, count]) => ({ label, count }))
  }, [medias])

  const hasActiveFilter = typeFilter !== "ALL" || categoryFilter !== null

  const filtered = useMemo(() => {
    let source = medias
    if (selectedAlbum) {
      source = medias.filter(m => m.album?.trim() === selectedAlbum)
    }
    return source.filter((media) => {
      if (typeFilter !== "ALL" && normalizeType(media) !== typeFilter) return false
      if (categoryFilter !== null && getCategory(media) !== categoryFilter) return false
      return true
    })
  }, [medias, typeFilter, categoryFilter, selectedAlbum])

  const showFeatured = featured.length > 0 && !hasActiveFilter && !selectedAlbum && viewMode === "GALLERY"
  const gridItems = showFeatured ? filtered.filter((m) => m.featured !== true) : filtered

  const activeMedia = lightboxIndex !== null ? filtered[lightboxIndex] : null

  const closeLightbox = () => setLightboxIndex(null)

  const goPrev = () =>
    setLightboxIndex((prev) =>
      prev === null ? null : prev > 0 ? prev - 1 : filtered.length - 1
    )

  const goNext = () =>
    setLightboxIndex((prev) =>
      prev === null ? null : prev < filtered.length - 1 ? prev + 1 : 0
    )

  useEffect(() => {
    if (lightboxIndex === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox()
      if (event.key === "ArrowLeft") goPrev()
      if (event.key === "ArrowRight") goNext()
    }

    document.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxIndex, filtered.length])

  useEffect(() => {
    setLightboxIndex(null)
  }, [typeFilter, categoryFilter])

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const typeFilters: { id: TypeFilter; label: string; count: number }[] = [
    { id: "ALL", label: t.filterAll, count: medias.length },
    { id: "PHOTO", label: t.filterPhotos, count: medias.filter((m) => !isVideo(m)).length },
    { id: "VIDEO", label: t.filterVideos, count: medias.filter(isVideo).length },
  ]

  const renderTypeFilter = (tab: { id: TypeFilter; label: string; count: number }) => {
    const isActive = typeFilter === tab.id
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => setTypeFilter(tab.id)}
        aria-pressed={isActive}
        className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
          isActive ? "text-white" : "text-slate-600 hover:text-[#003366]"
        }`}
        style={isActive ? { backgroundColor: BLUE } : undefined}
      >
        {tab.label}
        <span className={`ml-2 text-[10px] font-medium ${isActive ? "text-white/70" : "text-slate-400"}`}>
          {tab.count}
        </span>
      </button>
    )
  }

  const renderMediaFrame = (media: ProcessedGalleryMedia, { withOverlay }: { withOverlay: boolean }) => {
    const src = getThumbnail(media)
    const isSelfContained =
      /^(https?:\/\/|\/)/.test(src || "") && !src.startsWith("data:")

    return (
      <>
        {src && isSelfContained ? (
          <img
            src={src}
            alt={media._locTitle || ""}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
            }}
          />
        ) : (
          <MediaPlaceholder label={media._locTitle} />
        )}

        {isVideo(media) ? (
          <span className="absolute left-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#003366]">
            <svg className="w-3.5 h-3.5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v13.72a1 1 0 001.54.84l10.5-6.86a1 1 0 000-1.68L9.54 4.3A1 1 0 008 5.14z" />
            </svg>
          </span>
        ) : null}

        {withOverlay ? (
          <div className="absolute inset-0 z-10 flex items-end bg-black/0 opacity-0 transition-opacity duration-300 group-hover:bg-black/35 group-hover:opacity-100">
            <div className="w-full px-4 pb-4 space-y-0.5">
              <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                {media._locTitle}
              </p>
              {getCategory(media) ? (
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                  {getCategory(media)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const renderGridCell = (media: ProcessedGalleryMedia, index: number, keyPrefix: string) => {
    const mediaIndex = filtered.findIndex((m) => m.id === media.id)
    const desktopSpan = EDITORIAL_PATTERN[index % EDITORIAL_PATTERN.length]
    const mobileSpan = index % 3 === 0 ? "col-span-2" : "col-span-1"

    return (
      <button
        key={`${keyPrefix}-${media.id}`}
        type="button"
        onClick={() => setLightboxIndex(mediaIndex >= 0 ? mediaIndex : 0)}
        aria-label={media._locTitle}
        className={`group relative overflow-hidden bg-slate-100 ${mobileSpan} ${desktopSpan} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] focus-visible:ring-offset-2`}
      >
        {renderMediaFrame(media, { withOverlay: true })}
      </button>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <PageHeader
        mode={getHeaderMode(ROUTES.gallery)}
        lang={lang}
        setLang={handleSetLang}
        currentPage="gallery"
        navigate={navigate}
      />

      <main className="flex-1">
        {/* ── 1. Hero + Toggle intégré ── */}
        <section className="bg-white border-b border-slate-200/80">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14 sm:pt-40 sm:pb-16 text-center">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5"
              style={{ color: BLUE }}
            >
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
              {t.subtitle}
            </p>
            {/* Toggle Galerie / Albums */}
            <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <button
                onClick={() => { setViewMode("GALLERY"); setSelectedAlbum(null); }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  viewMode === "GALLERY" && !selectedAlbum
                    ? "bg-[#003366] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {t.generalGallery}
              </button>
              <button
                onClick={() => { setViewMode("ALBUMS"); setSelectedAlbum(null); }}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  viewMode === "ALBUMS" || selectedAlbum
                    ? "bg-[#003366] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {t.albumsTab}
              </button>
            </div>
          </div>
        </section>

        {viewMode === "ALBUMS" && !selectedAlbum ? (
          <section className="bg-slate-50 py-14 lg:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {albumsList.length === 0 ? (
                <div className="text-center text-slate-400 py-20">
                  <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M3.75 5.25h16.5v13.5H3.75zM3.75 15.75l4.5-4.5 4.5 4.5" />
                  </svg>
                  <p className="font-medium text-slate-500">Aucun album disponible.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albumsList.map(album => (
                    <button
                      key={album.name}
                      onClick={() => { setSelectedAlbum(album.name); setViewMode("ALBUMS"); }}
                      className="group relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]"
                    >
                      {/* Cover image */}
                      {(album.cover.thumbnailUrl || album.cover.url) ? (
                        <img
                          src={(album.cover.thumbnailUrl || album.cover.url) as string}
                          alt={album.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : null}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col items-start gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/70">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {album.items.length} {t.mediaCount}
                        </span>
                        <h3 className="text-white font-bold text-lg leading-tight text-left line-clamp-2 drop-shadow-sm">
                          {album.name}
                        </h3>
                        <span className="inline-flex items-center text-[#7EC8E3] text-xs font-semibold group-hover:gap-2 gap-1 transition-all duration-200">
                          Voir l'album
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {selectedAlbum && (
              <div className="relative bg-[#003366] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-end gap-6">
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedAlbum(null)}
                      className="inline-flex items-center text-xs font-semibold text-white/60 hover:text-white transition-colors mb-4 uppercase tracking-wider"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      {t.backToAlbums}
                    </button>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">{selectedAlbum}</h2>
                    <p className="text-white/60 text-sm">{filtered.length} {t.mediaCount}</p>
                  </div>
                </div>
              </div>
            )}

        {/* ── 2. Filtres ── */}
        {medias.length > 0 ? (
          <section className="bg-white border-b border-slate-200/80">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {typeFilters.map(renderTypeFilter)}
              </div>

              {categories.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter(null)}
                    aria-pressed={categoryFilter === null}
                    className={`text-xs font-semibold uppercase tracking-[0.14em] pb-1 border-b-2 transition-colors ${
                      categoryFilter === null
                        ? "text-[#003366] border-[#35A85A]"
                        : "text-slate-400 border-transparent hover:text-slate-600"
                    }`}
                  >
                    {t.filterCategories}
                  </button>
                  {categories.map((category) => {
                    const isActive = categoryFilter === category.label
                    return (
                      <button
                        key={category.label}
                        type="button"
                        onClick={() => setCategoryFilter(isActive ? null : category.label)}
                        aria-pressed={isActive}
                        className={`text-xs font-semibold uppercase tracking-[0.14em] pb-1 border-b-2 transition-colors ${
                          isActive
                            ? "text-[#003366] border-[#28A745]"
                            : "text-slate-400 border-transparent hover:text-slate-600"
                        }`}
                      >
                        {category.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ── 3. À la une ── */}
        {showFeatured ? (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-4">
            <div className="flex items-center gap-4 mb-6">
              <h2
                className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em]"
                style={{ color: BLUE }}
              >
                {t.featuredTitle}
              </h2>
              <span className="h-px flex-1" style={{ backgroundColor: GREEN }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {featured[0] ? (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(filtered.findIndex((m) => m.id === featured[0].id))}
                  aria-label={featured[0]._locTitle}
                  className="group relative overflow-hidden bg-slate-100 h-64 sm:h-[420px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]"
                >
                  {renderMediaFrame(featured[0], { withOverlay: true })}
                </button>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {featured.slice(1, 3).map((media, index) => (
                  <button
                    key={`featured-${media.id}`}
                    type="button"
                    onClick={() => setLightboxIndex(filtered.findIndex((m) => m.id === media.id))}
                    aria-label={media._locTitle}
                    className="group relative overflow-hidden bg-slate-100 h-64 sm:h-auto sm:min-h-[204px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]"
                  >
                    {renderMediaFrame(media, { withOverlay: true })}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── 4. Grille éditoriale ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {medias.length === 0 ? (
            <div className="max-w-xl mx-auto text-center py-12 sm:py-16">
              <h2 className="text-xl sm:text-2xl font-bold text-[#142332] mb-3">
                {t.emptyTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                {t.emptyDesc}
              </p>
            </div>
          ) : gridItems.length === 0 ? (
            <div className="max-w-xl mx-auto text-center py-12 sm:py-16">
              <h2 className="text-xl font-bold text-[#142332] mb-3">
                {t.emptyFilteredTitle}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t.emptyFilteredDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-6 lg:grid-flow-dense gap-3 sm:gap-4 auto-rows-[150px] sm:auto-rows-[190px] lg:auto-rows-[200px]">
              {gridItems.map((media, index) => renderGridCell(media, index, "grid"))}
            </div>
          )}
        </section>
          </>
        )}
      </main>

      {/* ── 5. Lightbox ── */}
      {activeMedia ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeMedia._locTitle}
          className="fixed inset-0 z-50 flex flex-col bg-[#0b1117]/95"
          onClick={closeLightbox}
        >
          <div className="flex items-start justify-between gap-4 px-4 sm:px-8 pt-5 sm:pt-7">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/45 pt-2">
              {getCategory(activeMedia) || (isVideo(activeMedia) ? t.filterVideos : t.filterPhotos)}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label={t.lightboxClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center px-4 sm:px-20 py-4 min-h-0"
            onClick={(event) => event.stopPropagation()}
          >
            {isVideo(activeMedia) ? (
              <VideoStage media={activeMedia} fallbackLabel={t.videoUnavailable} openLabel={t.openVideo} />
            ) : (
              <img
                src={activeMedia.url}
                alt={activeMedia._locTitle || ""}
                className="max-h-full max-w-full object-contain"
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden"
                }}
              />
            )}
          </div>

          <div
            className="px-4 sm:px-8 pb-6 sm:pb-8 pt-2 flex items-end justify-between gap-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-xl font-semibold text-white leading-snug">
                {activeMedia._locTitle}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                {[getCategory(activeMedia), getYear(activeMedia)].filter(Boolean).join(" · ")}
              </p>
              {activeMedia._locCaption ? (
                <p className="mt-3 hidden sm:block max-w-2xl text-sm text-white/60 leading-relaxed">
                  {activeMedia._locCaption}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={goPrev}
                aria-label={t.prev}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-xs font-medium text-white/45 tabular-nums">
                {(lightboxIndex ?? 0) + 1} / {filtered.length}
              </span>
              <button
                type="button"
                onClick={goNext}
                aria-label={t.next}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}

function VideoStage({
  media,
  fallbackLabel,
  openLabel,
}: {
  media: ProcessedGalleryMedia
  fallbackLabel: string
  openLabel: string
}) {
  const url = media.url || ""
  const embedUrl = getEmbedUrl(url)

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={media._locTitle || "video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full max-h-full aspect-video bg-black"
      />
    )
  }

  if (url && isDirectVideoFile(url)) {
    return (
      <video
        src={url}
        poster={media.thumbnailUrl || undefined}
        controls
        autoPlay
        playsInline
        preload="metadata"
        className="max-h-full max-w-full bg-black"
      />
    )
  }

  return (
    <div className="w-full max-w-2xl bg-white/5 border border-white/10 px-6 py-10 text-center">
      <p className="text-sm text-white/60 mb-4">{fallbackLabel}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-white underline underline-offset-4 hover:text-white/70 transition-colors"
        >
          {openLabel}
        </a>
      ) : null}
    </div>
  )
}