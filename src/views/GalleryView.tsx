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

const BG = "#F5F7F9"

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

const MEDIA_ITEMS = [
  {
    id: "1",
    album: "FABLAB",
    titleFr: "Atelier de modélisation et impression 3D au FabLab",
    descFr: "Des jeunes d'Agbélouvé conçoivent et impriment leurs premières pièces de rechange.",
    tag: "FabLab",
    icon: "⚙️",
    accent: "#E65100",
  },
  {
    id: "2",
    album: "CARAVANE",
    titleFr: "Étape de la Caravane Numérique à l'école de Gbatopé",
    descFr: "Découverte de l'ordinateur portable solaire par les élèves de CM2.",
    tag: "Caravane",
    icon: "💻",
    accent: "#174F7A",
  },
  {
    id: "3",
    album: "VOLONTAIRES",
    titleFr: "Accueil chaleureux d'une volontaire par la communauté",
    descFr: "Cérémonie d'intégration traditionnelle et présentation à l'équipe locale.",
    tag: "Volontariat",
    icon: "🤝",
    accent: "#35A85A",
  },
  {
    id: "4",
    album: "AGRI",
    titleFr: "Test de capteur d'humidité solaire sur parcelle maraîchère",
    descFr: "Vérification in situ du système d'irrigation goutte-à-goutte automatisé.",
    tag: "Low-Tech",
    icon: "🌱",
    accent: "#2E7D32",
  },
  {
    id: "5",
    album: "FABLAB",
    titleFr: "Séance de soudure électronique et recyclage de matériel",
    descFr: "Démontage pédagogique d'anciennes alimentations pour récupérer des composants utiles.",
    tag: "FabLab",
    icon: "⚡",
    accent: "#E65100",
  },
  {
    id: "6",
    album: "VOLONTAIRES",
    titleFr: "Cours de développement web animé par un volontaire",
    descFr: "Introduction à HTML/CSS pour une promotion de lycéens motivés.",
    tag: "Volontariat",
    icon: "🚀",
    accent: "#35A85A",
  },
  {
    id: "7",
    album: "CARAVANE",
    titleFr: "Installation d'un serveur Kiwix hors-ligne dans un collège de brousse",
    descFr: "Des milliers d'articles encyclopédiques accessibles sans aucune connexion Internet.",
    tag: "Caravane",
    icon: "📚",
    accent: "#174F7A",
  },
  {
    id: "8",
    album: "AGRI",
    titleFr: "Fabrication d'un séchoir solaire artisanal avec les artisans locaux",
    descFr: "Valorisation des mangues et légumes séchés pour éviter le gaspillage post-récolte.",
    tag: "Low-Tech",
    icon: "☀️",
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

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>🖼️</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight mb-6">
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
              { id: "FABLAB", label: `⚙️ ${t.albumFablab}` },
              { id: "CARAVANE", label: `💻 ${t.albumCaravane}` },
              { id: "VOLONTAIRES", label: `🤝 ${t.albumVolontaires}` },
              { id: "AGRI", label: `🌱 ${t.albumAgri}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveAlbum(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  activeAlbum === tab.id
                    ? "bg-[#174F7A] text-white shadow-md"
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
                    <span>{item.icon}</span>
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

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-[#174F7A]">
                  <span>Agrandir</span>
                  <span>🔍</span>
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
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#174F7A]/10 text-[#174F7A]">
                  {filteredItems[lightboxIndex]?.tag}
                </span>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div
                className="w-full h-64 rounded-2xl flex flex-col items-center justify-center text-6xl shadow-inner"
                style={{
                  backgroundColor: `${filteredItems[lightboxIndex]?.accent}15`,
                }}
              >
                <span>{filteredItems[lightboxIndex]?.icon}</span>
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
