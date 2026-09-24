"use client"

import React, { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface GalleryViewProps {
  lang: Language
}

const BG = "#F7F8FA"

const I18N = {
  FR: {
    badge: "Immersion Visuelle & Mémoire de Terrain",
    title: "Galerie d'APTIC-R",
    subtitle:
      "Des visages, des sourires, des lignes de code et des ateliers : plongez au cœur de nos actions quotidiennes à Agbélouvé et dans les villages du Zio.",
    filterAll: "Tous les albums",
    albumFablab: "FabLab & Makers",
    albumCaravane: "Caravane Numérique",
    albumVolontaires: "Volontaires Internationaux",
    albumAgri: "Agro-écologie & Low-Tech",
    lightboxClose: "Fermer",
    prevBtn: "Précédente",
    nextBtn: "Suivante",
  },
  EN: {
    badge: "Visual Immersion & Field Memories",
    title: "APTIC-R Photo Gallery",
    subtitle:
      "Smiles, code, workshops, and village life: explore our everyday initiatives across Agbélouvé and remote communities in Zio.",
    filterAll: "All albums",
    albumFablab: "FabLab & Makers",
    albumCaravane: "Digital Caravan",
    albumVolontaires: "International Volunteers",
    albumAgri: "Agro-ecology & Low-Tech",
    lightboxClose: "Close",
    prevBtn: "Previous",
    nextBtn: "Next",
  },
  DE: {
    badge: "Bilder & Eindrücke vor Ort",
    title: "APTIC-R Fotogalerie",
    subtitle:
      "Eindrücke aus unserem Alltag in Agbélouvé und den Dörfern der Region Zio.",
    filterAll: "Alle Alben",
    albumFablab: "FabLab & Tüftler",
    albumCaravane: "Digitale Karawane",
    albumVolontaires: "Freiwillige",
    albumAgri: "Öko-Landwirtschaft",
    lightboxClose: "Schließen",
    prevBtn: "Zurück",
    nextBtn: "Weiter",
  },
}

function getAlbumIcon(album: string, className = "w-10 h-10") {
  switch (album) {
    case "FABLAB":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case "CARAVANE":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case "VOLONTAIRES":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case "AGRI":
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
  }
}

const MEDIA_ITEMS = [
  {
    id: "1",
    album: "FABLAB",
    titleFr: "Atelier de modélisation et impression 3D au FabLab",
    descFr: "Des jeunes d'Agbélouvé conçoivent et impriment leurs premières pièces de rechange.",
    tag: "FabLab",
    accent: "#E65100",
  },
  {
    id: "2",
    album: "CARAVANE",
    titleFr: "Étape de la Caravane Numérique à l'école de Gbatopé",
    descFr: "Découverte de l'ordinateur portable solaire par les élèves de CM2.",
    tag: "Caravane",
    accent: "#003366",
  },
  {
    id: "3",
    album: "VOLONTAIRES",
    titleFr: "Accueil chaleureux d'une volontaire par la communauté",
    descFr: "Cérémonie d'intégration traditionnelle et présentation à l'équipe locale.",
    tag: "Volontariat",
    accent: "#28A745",
  },
  {
    id: "4",
    album: "AGRI",
    titleFr: "Test de capteur d'humidité solaire sur parcelle maraîchère",
    descFr: "Vérification in situ du système d'irrigation goutte-à-goutte automatisé.",
    tag: "Low-Tech",
    accent: "#2E7D32",
  },
  {
    id: "5",
    album: "FABLAB",
    titleFr: "Séance de soudure électronique et recyclage de matériel",
    descFr: "Démontage pédagogique d'anciennes alimentations pour récupérer des composants utiles.",
    tag: "FabLab",
    accent: "#E65100",
  },
  {
    id: "6",
    album: "VOLONTAIRES",
    titleFr: "Cours de développement web animé par un volontaire",
    descFr: "Introduction à HTML/CSS pour une promotion de lycéens motivés.",
    tag: "Volontariat",
    accent: "#28A745",
  },
  {
    id: "7",
    album: "CARAVANE",
    titleFr: "Installation d'un serveur Kiwix hors-ligne dans un collège de brousse",
    descFr: "Des milliers d'articles encyclopédiques accessibles sans aucune connexion Internet.",
    tag: "Caravane",
    accent: "#003366",
  },
  {
    id: "8",
    album: "AGRI",
    titleFr: "Fabrication d'un séchoir solaire artisanal avec les artisans locaux",
    descFr: "Valorisation des mangues et légumes séchés pour éviter le gaspillage post-récolte.",
    tag: "Low-Tech",
    accent: "#2E7D32",
  },
]

export default function GalleryView({ lang }: GalleryViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const [activeAlbum, setActiveAlbum] = useState("ALL")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const filteredItems =
    activeAlbum === "ALL"
      ? MEDIA_ITEMS
      : MEDIA_ITEMS.filter((item) => item.album === activeAlbum)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="gallery" navigate={navigate} />

      <main className="flex-1">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 text-center bg-gradient-to-b from-[#003366]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#003366] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#003366]" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Album Filters ── */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
            {[
              { id: "ALL", label: t.filterAll },
              { id: "FABLAB", label: t.albumFablab },
              { id: "CARAVANE", label: t.albumCaravane },
              { id: "VOLONTAIRES", label: t.albumVolontaires },
              { id: "AGRI", label: t.albumAgri },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveAlbum(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  activeAlbum === tab.id
                    ? "bg-[#003366] text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Media Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-full h-44 rounded-2xl flex flex-col items-center justify-center text-4xl mb-4 transition-transform group-hover:scale-[1.02] shadow-inner"
                    style={{ backgroundColor: `${item.accent}12` }}
                  >
                    <span style={{ color: item.accent }}>{getAlbumIcon(item.album, "w-12 h-12")}</span>
                    <span className="text-xs font-bold mt-2" style={{ color: item.accent }}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#142332] mb-1.5 line-clamp-2">
                    {item.titleFr}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.descFr}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-[#003366]">
                  <span>Agrandir</span>
                  <svg className="w-4 h-4 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Lightbox Modal ── */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#003366]/10 text-[#003366]">
                  {filteredItems[lightboxIndex]?.tag}
                </span>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Fermer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div
                className="w-full h-64 rounded-2xl flex flex-col items-center justify-center shadow-inner"
                style={{
                  backgroundColor: `${filteredItems[lightboxIndex]?.accent}15`,
                  color: filteredItems[lightboxIndex]?.accent,
                }}
              >
                <span>{filteredItems[lightboxIndex] && getAlbumIcon(filteredItems[lightboxIndex].album, "w-20 h-20")}</span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#142332] mb-2">
                  {filteredItems[lightboxIndex]?.titleFr}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {filteredItems[lightboxIndex]?.descFr}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
                    )
                  }
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  ← {t.prevBtn}
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>

                <button
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  {t.nextBtn} →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
