import React, { useState } from "react"
import type { Page, Language } from "../types"
import translations, { type TKey } from "../i18n/translations"
import {
  MonitorIcon,
  CodeIcon,
  CpuIcon,
  WheatIcon,
  SproutIcon,
  PenToolIcon,
  PaletteIcon,
  WrenchIcon,
  CloudSunIcon,
  DropletsIcon,
  BarChartIcon,
  PackageIcon,
  HouseIcon,
  UtensilsIcon,
  BusIcon,
  UserCheckIcon,
  SmartphoneIcon,
  ShieldCheckIcon,
  HeartPulseIcon,
  LifeBuoyIcon,
  MapPinIcon,
  PlaneIcon,
  ThermometerIcon,
  SignalIcon,
  UsersIcon,
  GlobeIcon,
  CompassIcon,
  SparklesIcon,
  GraduationCapIcon,
  LightbulbIcon,
  SearchIcon,
  FileTextIcon,
  VideoIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  QuoteIcon,
  PlusIcon,
} from "../components/Icons"
import EligibilityModal from "../components/EligibilityModal"
import { trackEvent } from "../lib/tracker"

interface HomeProps {
  lang: Language
  navigate: (p: Page) => void
}

// ─── Shared Components ────────────────────────────────────────────────────────────
function Badge({
  text,
  centered = false,
}: {
  text: string
  centered?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 mb-6 ${
        centered ? "justify-center" : ""
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path
          d="M4 11H8 M6 11V5 M6 5L2.5 2 M6 5L9.5 2"
          stroke="#35A85A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#174F7A]">
        {text}
      </span>
    </div>
  )
}

// ─── 1. Hero ───────────────────────────────────────────────────────────────────
function Hero({ t, navigate }: { t: TKey; navigate: (p: Page) => void }) {
  const h = t.hero;
  return (
    <section className="relative z-10 min-h-[95vh] lg:min-h-screen flex flex-col">
      {/* Background Layer with overflow hidden */}
      <div className="absolute inset-0 overflow-hidden">
        <picture>
          <source srcSet="/hero-volunteer-collab.avif" type="image/avif" />
          <source srcSet="/hero-volunteer-collab.webp" type="image/webp" />
          <img
            src="/hero-volunteer-collab.jpg"
            alt="Collaboration in Togo"
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(18,59,90,0.27)" }}
        />
        {/* Short gradient fade to white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 lg:h-24"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, #FFFFFF 100%)",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center pt-32 pb-8 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 relative z-10 max-w-7xl w-full mx-auto px-5 sm:px-6 lg:px-8">
        <div
          className="text-center mx-auto mb-10 sm:mb-16 lg:mb-20 w-full"
          style={{ maxWidth: "900px" }}
        >
          <h1
            className="leading-[1.05] sm:leading-[1.1] tracking-tight mb-6 sm:mb-8"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.14)" }}
          >
            {/* Niveau 1 - Principal */}
            <span className="text-3xl sm:text-5xl lg:text-[72px] block mb-2 sm:mb-3 text-[#FFFFFF]">
              {h.line1}
            </span>
            {/* Niveau 2 - Accent */}
            <span
              className="text-[26px] sm:text-5xl lg:text-[64px] block mb-2 sm:mb-3 text-[#35A85A] font-extrabold whitespace-nowrap sm:whitespace-normal tracking-tighter sm:tracking-tight"
              style={{
                textShadow: "0 2px 12px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              {h.line2}
            </span>
            {/* Niveau 3 - Complément */}
            <span className="text-2xl sm:text-4xl lg:text-[58px] block text-[#FFFFFF] font-medium opacity-90">
              {h.line3}
            </span>
          </h1>

          <p
            className="text-base sm:text-lg lg:text-xl font-medium leading-[1.6] sm:leading-relaxed max-w-[320px] sm:max-w-[640px] mx-auto mb-10 sm:mb-12"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {h.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-5 sm:gap-4">
            <button
              onClick={() => {
                trackEvent("apply_now_click", { source: "hero_primary" })
                navigate("apply")
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 font-bold text-sm px-6 py-3.5 sm:px-10 sm:py-4 rounded-xl transition-all shadow-lg cursor-pointer"
              style={{ backgroundColor: "#35A85A", color: "#FFFFFF" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2E914E")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#35A85A")
              }
            >
              <span>{h.cta1}</span>
              <ArrowRightIcon size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("mission")
                el?.scrollIntoView({ behavior: "smooth" })
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 font-bold text-sm px-6 py-3.5 sm:px-10 sm:py-4 rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: "transparent",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.10)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {h.cta2}
            </button>
          </div>
        </div>

        {/* Key Facts - intentionally overlapping the next section */}
        <div className="relative mt-2 sm:mt-8 mb-4 sm:-mb-12 max-w-4xl mx-auto z-20">
          <div
            className="absolute inset-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            style={{
              backgroundColor: "rgba(23,79,122,0.72)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: "20px",
            }}
          />
          <div className="relative grid grid-cols-3 gap-2 sm:gap-8 text-center py-4 sm:py-6 px-2 sm:px-6">
            {[
              { label: h.stat1Label, sub: h.stat1Sub },
              { label: h.stat2Label, sub: h.stat2Sub },
              { label: h.stat3Label, sub: h.stat3Sub },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5 sm:gap-1 relative px-1 sm:px-0">
                <span
                  className="text-sm sm:text-xl lg:text-2xl font-bold tracking-tight truncate sm:whitespace-normal"
                  style={{ color: "#FFFFFF" }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[8px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-widest leading-tight"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {s.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 2. Dual Path ──────────────────────────────────────────────────────────────
function DualPath({ t, navigate }: { t: TKey; navigate: (p: Page) => void }) {
  const d = t.dualPath
  return (
    <section className="pt-24 pb-20 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-32 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <Badge text={d.tagLine} centered />
          <h2 className="text-3xl lg:text-4xl text-[#174F7A] mt-4">
            {d.titleLine}
          </h2>
        </div>

        {/* Volunteer Path */}
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-16 mb-20 sm:mb-24 lg:mb-24">
          <div className="flex-1 w-full rounded-[2.5rem] overflow-hidden h-[280px] sm:h-[350px] lg:h-[450px] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              alt="Volunteer"
            />
          </div>
          <div className="flex-1 flex flex-col items-start mt-2 sm:mt-0">
            <Badge text={d.volunteerTag} />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 mt-4 sm:mt-0 leading-tight text-[#174F7A] tracking-[-0.02em]">
              {d.volunteerTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#5E6B76] mb-8 sm:mb-10 leading-relaxed max-w-xl">
              {d.volunteerDesc}
            </p>
            <button
              onClick={() => {
                trackEvent("apply_now_click", { source: "dual_path_volunteer" })
                navigate("apply")
              }}
              className="inline-flex items-center justify-center gap-3 font-bold text-sm px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl transition-all text-white hover:scale-105 shadow-sm cursor-pointer"
              style={{ backgroundColor: "#35A85A" }}
            >
              <span>{d.volunteerCta}</span>
              <ArrowRightIcon size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Organization Path */}
        <div className="flex flex-col-reverse lg:flex-row-reverse items-center gap-8 sm:gap-10 lg:gap-16">
          <div className="flex-1 w-full rounded-[2.5rem] overflow-hidden h-[280px] sm:h-[350px] lg:h-[450px] shadow-sm">
            <img
              src="/meeting-org.jpg"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              alt="Organization"
            />
          </div>
          <div className="flex-1 flex flex-col items-start mb-2 sm:mb-0">
            <Badge text={d.orgTag} />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 mt-4 sm:mt-0 leading-tight text-[#174F7A] tracking-[-0.02em]">
              {d.orgTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#5E6B76] mb-8 sm:mb-10 leading-relaxed max-w-xl">
              {d.orgDesc}
            </p>
            <button
              onClick={() => {
                trackEvent("partner_request_click", { source: "dual_path_org" })
                navigate("partner")
              }}
              className="inline-flex items-center justify-center gap-3 font-bold text-sm px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl transition-all text-white hover:scale-105 shadow-sm cursor-pointer"
              style={{ backgroundColor: "#174F7A" }}
            >
              <span>{d.orgCta}</span>
              <ArrowRightIcon size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 3. Why Volunteer (WhyMission) ─────────────────────────────────────────────
function WhyMission({ t }: { t: TKey }) {
  const wm = t.whyMission

  return (
    <section id="why" className="py-20 sm:py-24 lg:py-32 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-24">
          <Badge text={wm.tag} centered />
          <h2 className="text-5xl sm:text-6xl lg:text-7xl leading-tight text-[#174F7A] tracking-tight">
            {wm.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {wm.cards.map((card, i) => (
            <div
              key={card.title}
              className="relative flex flex-col items-start text-left group"
            >
              <div
                className="text-[48px] sm:text-[80px] lg:text-[100px] leading-none mb-2 sm:mb-4 lg:mb-6 font-['DM_Serif_Display'] transition-transform duration-500 group-hover:-translate-y-2"
                style={{ color: "#EAF0F4" }}
              >
                0{i + 1}
              </div>
              <div className="w-full mb-2 sm:mb-4 border-b-2 border-[#EAF0F4] pb-2 sm:pb-4 min-h-[auto] sm:min-h-[5rem] lg:min-h-[6rem] flex flex-col justify-start">
                <h3 className="text-xl sm:text-2xl lg:text-3xl text-[#174F7A] tracking-tight">
                  {card.title}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-[#5E6B76] font-medium leading-relaxed mt-1 sm:mt-2">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 4. The Challenge (Problem -> Innovation -> Impact) ─────────────────────────
function TheChallenge({ t }: { t: TKey }) {
  const c = t.challenge

  return (
    <section id="about" className="py-20 sm:py-24 lg:py-32 bg-[#F5F7F9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-32">
            <Badge text={c.tag} />
            <h2 className="text-3xl sm:text-5xl lg:text-6xl leading-tight mb-6 sm:mb-8 tracking-tight text-[#174F7A]">
              {c.title}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed mb-4 sm:mb-6 text-[#5E6B76]">
              {c.p1}
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-[#5E6B76]">
              {c.p2}
            </p>
          </div>

          {/* Vertical Timeline / Strong Graphic Element */}
          <div className="relative ml-6 lg:ml-12 pl-12 lg:pl-16 flex flex-col gap-20 lg:gap-24 py-8">
            {/* The strong vertical line */}
            <div className="absolute left-0 top-12 bottom-12 w-2 rounded-full bg-[#EAF0F4]" />

            {c.steps.map((item, i) => {
              const isCenter = i === 1;
              return (
                <div key={item.tag} className="relative group">
                  {/* Connecting dash to the dot */}
                  <div className="absolute -left-12 lg:-left-16 top-6 w-8 h-[2px] bg-[#EAF0F4]" />

                  {/* Visual Anchor Dot on the main line */}
                  <div
                    className={`absolute -left-[44px] sm:-left-[54px] lg:-left-[70px] top-4 w-7 h-7 rounded-full border-4 transition-transform duration-500 group-hover:scale-125 z-10`}
                    style={{ backgroundColor: "#35A85A", borderColor: "#F5F7F9" }}
                  />

                  <div className="flex flex-col gap-3">
                    <span
                      className="text-sm font-black uppercase tracking-[0.2em]"
                      style={{ color: "#5E6B76" }}
                    >
                      {item.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "#174F7A" }}>
                      {item.title}
                    </h3>
                    <p className="text-base sm:text-lg leading-relaxed font-medium mt-1 sm:mt-0" style={{ color: "#5E6B76" }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 5. Your Mission ───────────────────────────────────────────────────────────
function YourMission({ t }: { t: TKey }) {
  const m = t.mission

  return (
    <section id="mission" className="py-20 sm:py-24 lg:py-32 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-24">
          <Badge text={m.tag} />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.02em] text-[#174F7A]">
            {m.title}
          </h2>
        </div>

        <div className="flex flex-col gap-24 lg:gap-32">
          {m.steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start group">
              <div className="absolute -top-12 -left-4 sm:-top-16 sm:-left-4 md:-top-24 md:-left-8 text-[80px] sm:text-[120px] md:text-[200px] font-black leading-none text-[#EAF0F4] select-none z-0 transition-transform duration-700 group-hover:translate-x-4">
                0{i + 1}
              </div>
              <div className="relative z-10 w-full md:w-1/3 pt-6 md:pt-12">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#174F7A] tracking-tight">
                  {s.title}
                </h3>
              </div>
              <div className="relative z-10 w-full md:w-2/3 md:pt-12 mt-2 sm:mt-0">
                <p className="text-base sm:text-xl leading-relaxed text-[#5E6B76] font-medium max-w-2xl">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 6. What Could You Build? (Editorial Asymmetric Layout) ────────────────────
function WhatCouldYouBuild({ t }: { t: TKey }) {
  const b = t.build
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(null)

  return (
    <section id="activities" className="py-20 sm:py-24 lg:py-32 bg-[#F5F7F9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <Badge text={b.tag} centered />
          <h2 className="text-3xl sm:text-5xl lg:text-6xl leading-tight text-[#174F7A] tracking-[-0.02em]">
            {b.title}
          </h2>
        </div>

        {/* Project Gallery Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Primary Project: Smart Irrigation */}
          <div className="lg:col-span-12 xl:col-span-7 rounded-[2.5rem] overflow-hidden flex flex-col bg-white border border-[#EAF0F4] group shadow-sm">
            <div className="relative h-80 sm:h-[400px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&q=80"
                alt="Agriculture Challenge"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-sm font-bold uppercase tracking-widest text-[#35A85A] mb-2 block">
                  {b.featured.badge}
                </span>
                <h3 className="text-3xl lg:text-4xl">{b.featured.title}</h3>
              </div>
            </div>
            <div className="p-10 text-lg text-[#5E6B76] font-medium leading-relaxed">
              {b.featured.desc}
            </div>
          </div>

          {/* 4 Secondary Projects Grid / Mobile Accordion */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col sm:grid sm:grid-cols-2 gap-0 sm:gap-6">
            {b.cards.map((p, i) => {
              const icons = [
                <SmartphoneIcon size={24} color="#174F7A" />,
                <CodeIcon size={24} color="#174F7A" />,
                <BarChartIcon size={24} color="#174F7A" />,
                <PackageIcon size={24} color="#174F7A" />,
              ]
              const isOpen = openCardIndex === i;
              
              return (
                <div
                  key={p.title}
                  onClick={() => setOpenCardIndex(isOpen ? null : i)}
                  className="flex flex-col py-5 sm:py-0 border-b border-[#EAF0F4] last:border-b-0 sm:border-b-0 sm:p-8 sm:rounded-[2rem] sm:bg-white sm:border sm:border-[#EAF0F4] justify-center items-start transition-all duration-300 sm:hover:shadow-md group cursor-pointer"
                >
                  {/* Desktop Layout Header (Icon + Badge) */}
                  <div className="hidden sm:flex flex-col w-full">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F5F7F9] mb-6 transition-transform group-hover:scale-110">
                      {icons[i]}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-[#35A85A]">
                      {p.badge}
                    </div>
                  </div>

                  {/* Mobile Accordion Header & Desktop Title */}
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center gap-4">
                      {/* Mobile Number */}
                      <span className="sm:hidden text-lg font-['DM_Serif_Display'] text-[#174F7A]/50 w-6">
                        0{i + 1}
                      </span>
                      {/* Title */}
                      <h4 className="text-lg sm:text-xl text-[#174F7A] font-bold sm:font-normal">{p.title}</h4>
                    </div>
                    {/* Mobile Arrow */}
                    <div className={`sm:hidden transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                       <ArrowRightIcon size={18} color="#174F7A" />
                    </div>
                  </div>

                  {/* Mobile Description (Accordion Body) */}
                  {/* @ts-ignore */}
                  <div 
                    className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out w-full ${isOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    {/* @ts-ignore */}
                    <div className="text-sm text-[#5E6B76] leading-relaxed pr-4 pl-10">
                       {/* @ts-ignore */}
                       {p.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 7. Profiles Sought ────────────────────────────────────────────────────────
function ProfilesSought({
  t,
  navigate,
}: {
  t: TKey; navigate: (p: Page) => void
}) {
  const p = t.profiles
  const [isEligibilityOpen, setEligibilityOpen] = useState(false)

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-[#FFFFFF] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <Badge text={p.tag} centered />
          <h2 className="text-3xl sm:text-5xl lg:text-6xl leading-tight mb-4 sm:mb-6 text-[#174F7A] tracking-[-0.02em]">
            {p.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl font-medium text-[#5E6B76] leading-relaxed">
            {p.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-8 sm:gap-y-16 max-w-6xl mx-auto mb-16 sm:mb-24">
          {p.categories.map((cat, index) => {
            const icons = [
              <MonitorIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#174F7A" />,
              <WheatIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#35A85A" />,
              <PenToolIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#174F7A" />,
              <CpuIcon className="w-8 h-8 sm:w-12 sm:h-12" color="#174F7A" />,
            ]
            return (
              <div key={cat.title} className="relative flex flex-col p-4 sm:p-8 lg:p-12 group overflow-hidden rounded-2xl border border-transparent sm:border-none">
                {/* Huge Pale Number Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] sm:text-[200px] lg:text-[280px] font-black text-[#F5F7F9] leading-none select-none z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  0{index + 1}
                </div>

                <div className="relative z-10 flex flex-col items-start text-left lg:items-center lg:text-center">
                  <div className="mb-4 sm:mb-8">{icons[index]}</div>
                  <h3 className="text-lg sm:text-3xl lg:text-4xl text-[#174F7A] font-['DM_Serif_Display'] mb-2 sm:mb-6">
                    {cat.title}
                  </h3>

                  <p className="text-[11px] sm:text-base lg:text-lg leading-relaxed text-[#5E6B76] font-medium">
                    {cat.tags.split("·").map((tag, i, arr) => (
                      <span key={i} className="inline-block">
                        {tag.trim()}
                        {i < arr.length - 1 && (
                          <span className="text-[#EAF0F4] mx-1 sm:mx-2">·</span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setEligibilityOpen(true)}
            className="inline-flex items-center gap-2 font-bold text-[13px] uppercase tracking-wider transition-opacity hover:opacity-70"
            style={{ color: "#174F7A" }}
          >
            <span style={{ borderBottom: "1px solid #174F7A", paddingBottom: "2px" }}>
              {p.cta}
            </span>
            <ArrowRightIcon size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      
      <EligibilityModal 
        isOpen={isEligibilityOpen} 
        onClose={() => setEligibilityOpen(false)} 
        t={t.eligibility} 
        navigate={navigate} 
      />
    </section>
  )
}

// ─── 8. Not an Expert ──────────────────────────────────────────────────────────
function NotAnExpert({ t, navigate }: { t: TKey; navigate: (p: Page) => void }) {
  const n = t.notExpert

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-[#174F7A]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-7xl text-white mb-3 sm:mb-8 leading-tight tracking-tight">
            {n.title}
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-white/80">
            {n.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-0 sm:mb-20 max-w-4xl mx-auto">
          {n.qualities.map((q) => (
            <div
              key={q}
              className="px-6 py-3 rounded-full border border-white/28 transition-transform hover:scale-105"
              style={{ backgroundColor: "transparent" }}
            >
              <span className="text-sm font-bold tracking-widest text-white uppercase">
                {q}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─── 9. A Week with APTIC-R ───────────────────────────────────────────────────
function WeekWithAptic({ t }: { t: TKey }) {
  const w = t.week
  const dayLabels = w.dayLabels

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#F5F7F9]">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-24">
          <Badge text={w.tag} centered />
          <h2 className="text-3xl sm:text-4xl lg:text-6xl leading-tight text-[#174F7A] tracking-[-0.02em]">
            {w.title.split("APTIC-R").map((part, idx, array) => (
              <span key={idx}>
                {part}
                {idx < array.length - 1 && <span className="whitespace-nowrap">APTIC-R</span>}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex flex-col">
          {w.days.map((d, i) => (
            <div
              key={d.activity}
              className="group flex flex-col md:flex-row border-b border-[#EAF0F4] last:border-b-0 py-5 md:py-8 lg:py-12 items-start md:items-center transition-colors md:hover:bg-white"
            >
              {/* Day Label */}
              <div className="w-full md:w-1/4 mb-1 md:mb-0 md:pl-8">
                <span className="text-base md:text-xl lg:text-2xl font-black text-[#174F7A] uppercase tracking-widest">
                  {dayLabels[i]}
                </span>
              </div>
              
              {/* Activity details */}
              <div className="w-full md:w-3/4 md:border-l md:border-[#EAF0F4] md:pl-12">
                <h4 className="text-xl md:text-2xl lg:text-3xl font-['DM_Serif_Display'] mb-2 md:mb-4 text-[#174F7A] md:group-hover:text-[#35A85A] transition-colors">
                  {d.activity}
                </h4>
                <p className="text-base md:text-lg leading-relaxed text-[#5E6B76] max-w-xl">
                  {d.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 10. Life in Togo ─────────────────────────────────────────────────────────
function LifeInTogo({ t }: { t: TKey }) {
  const l = t.lifeInTogo

  return (
    <section className="py-24 lg:py-40 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center mb-16 lg:mb-24">
        <Badge text={l.tag} centered />
        <h2 className="text-5xl lg:text-7xl leading-tight mt-6 mb-8 text-[#174F7A] font-['DM_Serif_Display'] font-normal">
          {l.title}
        </h2>
      </div>

      {/* Grande composition photographique */}
      <div className="max-w-[100rem] mx-auto px-5 sm:px-6 lg:px-8 mb-24 lg:mb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 h-auto md:h-[600px] lg:h-[800px]">
          {/* Left vertical image */}
          <div className="col-span-1 md:col-span-1 rounded-[2rem] overflow-hidden group shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1637149253733-44ef8365db1c?w=900&h=1200&fit=crop&auto=format"
              alt="Togo landscape"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          {/* Middle stack */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4 md:gap-6 lg:gap-8">
            <div className="flex-1 rounded-[2rem] overflow-hidden group shadow-sm min-h-[160px] sm:min-h-[220px]">
              <img
                src="https://images.unsplash.com/photo-1609252509229-364936a1d1a2?w=800&h=600&fit=crop&auto=format"
                alt="Community members"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="rounded-[2rem] overflow-hidden shadow-sm bg-[#174F7A] p-4 sm:p-8 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[180px]">
              <span className="text-white font-['DM_Serif_Display'] text-2xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3">Agbélouvé</span>
              <span className="text-[#35A85A] font-black uppercase tracking-widest text-[10px] sm:text-sm">Base Camp</span>
            </div>
          </div>
          {/* Right vertical image */}
          <div className="col-span-2 md:col-span-1 h-[250px] sm:h-[350px] md:h-full rounded-[2rem] overflow-hidden group shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&h=1200&fit=crop&auto=format"
              alt="Nature in Togo"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 sm:gap-y-16">
          {l.items?.map((item: any) => (
            <div key={item.label} className="flex flex-col border-t border-t-[#EAF0F4] sm:border-t-2 pt-4 sm:pt-8 group">
              <div className="text-xl sm:text-2xl font-bold mb-1 sm:mb-4 text-[#174F7A] md:group-hover:text-[#35A85A] transition-colors">
                {item.label}
              </div>
              <div className="text-[15px] sm:text-base font-medium leading-relaxed text-[#5E6B76]">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 11. Agbélouvé ─────────────────────────────────────────────────────────────
function Agbelouve({ t }: { t: TKey }) {
  const a = t.agbelouve

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#F5F7F9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-center">
          <div
            className="lg:col-span-6 relative rounded-[2.5rem] overflow-hidden shadow-sm border border-[#EAF0F4] h-[300px] sm:h-[400px] lg:h-[500px]"
          >
            <img
              src="https://images.unsplash.com/photo-1611502029437-54521b5e6ada?w=900&h=700&fit=crop&auto=format"
              alt="Village and community scenery in Togo"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div
              className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white uppercase tracking-widest"
              style={{
                backgroundColor: "rgba(23,79,122,0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              <MapPinIcon size={16} color="#35A85A" />
              Agbélouvé
            </div>
          </div>

          <div className="lg:col-span-6">
            <Badge text={a.tag} />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 lg:mb-8 text-[#174F7A] tracking-[-0.02em]">
              {a.title}
            </h2>
            <p className="text-base sm:text-lg leading-snug sm:leading-relaxed mb-8 lg:mb-12 text-[#5E6B76] text-left">
              {a.desc}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-8">
              {a.facts.map((f, i) => {
                const icons = [
                  <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6" color="#174F7A" />,
                  <CompassIcon className="w-5 h-5 sm:w-6 sm:h-6" color="#174F7A" />,
                  <PlaneIcon className="w-5 h-5 sm:w-6 sm:h-6" color="#174F7A" />,
                  <WheatIcon className="w-5 h-5 sm:w-6 sm:h-6" color="#174F7A" />,
                  <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" color="#174F7A" />,
                  <HouseIcon className="w-5 h-5 sm:w-6 sm:h-6" color="#174F7A" />,
                ]
                return (
                  <div key={f.label} className="flex gap-2 sm:gap-4 items-center text-left">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-white border border-[#EAF0F4] flex-shrink-0">
                      {icons[i]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#5E6B76] font-bold mb-0.5 sm:mb-1 truncate">
                        {f.label}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#174F7A] leading-tight">
                        {f.value}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 12. Support & What's Included ─────────────────────────────────────────────
function Support({ t }: { t: TKey }) {
  const s = t.support

  return (
    <>
      <section className="py-24 lg:py-32 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge text={s.tag} centered />
            <h2 className="text-5xl lg:text-6xl leading-tight mb-6 text-[#174F7A] tracking-[-0.02em]">
              {s.title}
            </h2>
            <p className="text-lg lg:text-xl font-medium text-[#5E6B76]">
              {s.subtitle}
            </p>
          </div>

          {/* 8 Support Cards Grid (Grille Légère) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-12">
            {s.items.map((item, i) => {
              const icons = [
                <HouseIcon size={32} color="#174F7A" />,
                <UtensilsIcon size={32} color="#174F7A" />,
                <BusIcon size={32} color="#174F7A" />,
                <UserCheckIcon size={32} color="#174F7A" />,
                <SmartphoneIcon size={32} color="#174F7A" />,
                <ShieldCheckIcon size={32} color="#174F7A" />,
                <HeartPulseIcon size={32} color="#174F7A" />,
                <LifeBuoyIcon size={32} color="#174F7A" />,
              ]
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-[#F5F7F9] transition-transform group-hover:scale-110">
                    {icons[i]}
                  </div>
                  <div className="text-xl font-bold mb-2 text-[#174F7A]">
                    {item.label}
                  </div>
                  <div className="text-base font-medium text-[#5E6B76]">
                    {item.value}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Institutional 'What's Included?' Table */}
      <section className="py-24 lg:py-32 bg-[#F5F7F9]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2rem] border border-[#EAF0F4] overflow-hidden shadow-sm">
            <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between border-b border-[#EAF0F4] bg-[#FFFFFF]">
              <h3 className="text-2xl text-[#174F7A] font-['DM_Serif_Display']">{s.tableTitle}</h3>
              <span className="text-sm font-bold uppercase tracking-widest text-[#35A85A] mt-2 md:mt-0">
                {s.tableSummary}
              </span>
            </div>
            <div className="flex flex-col w-full">
              {s.tableItems.map(([el, info, status], i) => {
                const statusStyle = {
                  backgroundColor:
                    status === s.statusConfirmed
                      ? "#EAF5EA"
                      : status === s.statusPending
                        ? "#F5F7F9"
                        : "#F5F7F9",
                  color:
                    status === s.statusConfirmed
                      ? "#35A85A"
                      : status === s.statusPending
                        ? "#174F7A"
                        : "#5E6B76",
                }

                return (
                  <div
                    key={el}
                    className="flex flex-col sm:flex-row sm:items-center border-b border-[#EAF0F4] last:border-b-0 hover:bg-[#F5F7F9] transition-colors p-5 sm:p-0"
                  >
                    {/* Mobile Top Row: Label + Status / Desktop: Col 1 */}
                    <div className="flex justify-between items-start sm:items-center sm:w-1/3 sm:py-6 sm:pl-8 sm:pr-6 mb-3 sm:mb-0">
                      <div className="text-[15px] sm:text-base lg:text-lg font-bold text-[#174F7A] pr-4">
                        {el}
                      </div>
                      <span
                        className="sm:hidden text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0"
                        style={statusStyle}
                      >
                        {status}
                      </span>
                    </div>
                    
                    {/* Mobile Bottom Row: Info / Desktop: Col 2 */}
                    <div className="text-[14px] sm:text-base lg:text-lg text-[#5E6B76] font-medium sm:flex-1 sm:py-6 sm:px-6 leading-relaxed">
                      {info}
                    </div>
                    
                    {/* Desktop Badge / Desktop: Col 3 */}
                    <div className="hidden sm:block sm:py-6 sm:pl-6 sm:pr-8 text-right">
                      <span
                        className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg whitespace-nowrap"
                        style={statusStyle}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── 13. Application Process ───────────────────────────────────────────────────
function ApplicationProcess({
  t,
  navigate,
}: {
  t: TKey; navigate: (p: Page) => void
}) {
  const ap = t.appProcess

  return (
    <section className="py-24 lg:py-32 bg-[#FFFFFF]">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <Badge text={ap.tag} centered />
          <h2 className="text-5xl lg:text-6xl leading-tight text-[#174F7A] tracking-[-0.02em]">
            {ap.title}
          </h2>
        </div>

        <div className="relative border-l-4 border-[#35A85A]/30 ml-6 lg:ml-12 py-8 flex flex-col gap-16 lg:gap-24">
          {ap.steps.map((s, i) => (
            <div key={s.title} className="relative group">
              <div className="absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 border-[#FFFFFF] bg-[#35A85A] transition-transform duration-500 group-hover:scale-125 shadow-sm" />
              <div className="ml-10 lg:ml-16">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-[#35A85A] mb-3 block">
                  {ap.stepLabel} 0{i + 1}
                </span>
                <h3 className="text-3xl lg:text-4xl text-[#174F7A] mb-4 font-['DM_Serif_Display']">
                  {s.title}
                </h3>
                <p className="text-xl text-[#5E6B76] leading-relaxed max-w-2xl font-medium">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 lg:mt-16 flex justify-center">
          <button
            onClick={() => navigate("apply")}
            className="inline-flex items-center gap-3 sm:gap-4 font-black text-sm sm:text-base px-6 py-4 sm:px-12 sm:py-6 rounded-xl sm:rounded-2xl text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl w-auto max-w-full"
            style={{
              backgroundColor: "#35A85A",
              boxShadow: "0 10px 25px rgba(53,168,90,0.3)",
            }}
          >
            <span className="tracking-wide leading-tight">{ap.cta}</span>
            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── 14. Partners ──────────────────────────────────────────────────────────────
function Partners({ t, navigate }: { t: TKey; navigate: (p: Page) => void }) {
  const p = t.partners

  return (
    <section className="py-16 sm:py-24 lg:py-40 bg-[#F5F7F9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge text={p.tag} centered />
        <h2 className="text-3xl sm:text-5xl lg:text-7xl leading-snug sm:leading-tight mt-4 sm:mt-6 mb-8 sm:mb-12 text-[#174F7A] font-black uppercase tracking-tight">
          {p.titlePart1} <br className="hidden sm:block" />
          <span className="text-[#35A85A]">{p.titlePart2}</span>
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-20 text-lg lg:text-2xl font-bold text-[#5E6B76] tracking-[0.2em] uppercase">
          <span>{p.countries[0]}</span>
          <span className="text-[#EAF0F4]">·</span>
          <span>{p.countries[1]}</span>
          <span className="text-[#EAF0F4]">·</span>
          <span>{p.countries[2]}</span>
          <span className="text-[#EAF0F4]">·</span>
          <span className="text-[#174F7A]">{p.countries[3]}</span>
        </div>

        <button
          onClick={() => navigate("partner")}
          className="inline-flex items-center gap-4 font-black text-sm lg:text-base px-10 py-5 rounded-xl text-white transition-all hover:scale-105"
          style={{
            backgroundColor: "#174F7A",
            boxShadow: "0 10px 25px rgba(23,79,122,0.2)",
          }}
        >
          <span className="tracking-wide uppercase">{p.cta}</span>
          <ArrowRightIcon size={18} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  )
}

// ─── 15. Testimonials ──────────────────────────────────────────────────────────
function Testimonials({ t }: { t: TKey }) {
  const ts = t.testimonials
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft
      const clientWidth = scrollRef.current.clientWidth
      const index = Math.round(scrollLeft / clientWidth)
      setActiveIndex(index)
    }
  }

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#F5F7F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
          <Badge text={ts.tag} centered />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-tight text-[#174F7A] tracking-[-0.02em]">
            {ts.title}
          </h2>
          <p className="text-sm text-[#5E6B76] mt-6 italic">{ts.disclaimer}</p>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-6 sm:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {ts.cards.map((c: any) => (
            <div
              key={c.name}
              className="flex flex-col justify-between p-8 sm:p-10 rounded-[2.5rem] bg-white border border-[#EAF0F4] md:hover:-translate-y-2 transition-transform duration-500 shadow-sm shrink-0 w-[85%] md:w-auto snap-center md:snap-align-none"
            >
              <div>
                <QuoteIcon size={32} color="#EAF0F4" className="mb-4 sm:mb-6" />
                <p className="text-lg leading-relaxed mb-6 sm:mb-8 font-medium text-[#174F7A]">
                  "{c.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-[#EAF0F4]">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-[#35A85A]">
                  {c.initials}
                </div>
                <div>
                  <div className="text-lg font-bold text-[#174F7A]">
                    {c.name}
                  </div>
                  <div className="text-sm text-[#5E6B76]">
                    {c.country} · {c.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {ts.cards.map((_: any, idx: number) => (
            <button 
              key={idx}
              onClick={() => {
                if (scrollRef.current && scrollRef.current.children[idx]) {
                   scrollRef.current.children[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-[#174F7A]' : 'w-2 bg-[#EAF0F4]'}`}
              aria-label={`Aller au témoignage ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 16. FAQ ───────────────────────────────────────────────────────────────────
function FAQ({ t, lang }: { t: TKey; lang: string }) {
  const f = t.faq
  const [open, setOpen] = useState<number | null>(null)



  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#FFFFFF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-24">
          <Badge text={f.tag} centered />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-[#174F7A] tracking-[-0.02em]">
            {f.title}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {f.items?.map((item: { q: string; a: string }, i: number) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className="rounded-2xl transition-all duration-300 bg-[#F5F7F9] overflow-hidden border border-[#EAF0F4]"
              >
                <button
                  className="w-full flex items-center justify-between gap-5 sm:gap-6 p-5 sm:p-6 lg:p-8 text-left cursor-pointer hover:bg-white transition-colors"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-lg lg:text-xl font-bold text-[#174F7A]">
                    {item.q}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm flex-shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                  >
                    <PlusIcon size={20} color="#174F7A" />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-2 text-[#5E6B76] text-base sm:text-lg leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact direct si question supplémentaire */}
        <div className="mt-8 sm:mt-12 p-5 sm:p-8 rounded-2xl bg-[#F5F7F9] border border-[#EAF0F4] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <h3 className="text-lg font-bold text-[#174F7A] mb-1">
              Vous avez d'autres questions ?
            </h3>
            <p className="text-sm text-[#5E6B76]">
              Notre équipe à Agbélouvé est disponible pour échanger directement avec vous.
            </p>
          </div>
          <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start overflow-hidden mt-4 lg:mt-0">
            <a
              href={`mailto:aptic.rural19@gmail.com?subject=${encodeURIComponent(lang === "DE" ? "Frage zum APTIC-R Freiwilligendienst" : lang === "EN" ? "APTIC-R Volunteering Question" : "Question Volontariat APTIC-R")}`}
              onClick={(e) => {
                e.preventDefault()
                trackEvent("contact_click", { source: "faq_email" })
                const target = e.currentTarget.href
                setTimeout(() => { window.location.href = target }, 150)
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-[#174F7A] text-white text-[10px] sm:text-xs font-bold hover:bg-[#123E60] transition-colors shadow-xs whitespace-nowrap min-w-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">aptic.rural19@gmail.com</span>
            </a>
            <a
              href="tel:+22891201990"
              onClick={(e) => {
                e.preventDefault()
                trackEvent("contact_click", { source: "faq_phone" })
                const target = e.currentTarget.href
                setTimeout(() => { window.location.href = target }, 150)
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white border border-[#D8E2E9] text-[#174F7A] text-[10px] sm:text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap min-w-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#35A85A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="truncate">+228 91 20 19 90</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 17. Final CTA ─────────────────────────────────────────────────────────────
function FinalCTA({ t, navigate }: { t: TKey; navigate: (p: Page) => void }) {
  const fc = t.finalCta
  return (
    <section className="py-32 lg:py-48 relative overflow-hidden flex items-center justify-center min-h-[70vh]">
      <img
        src="https://images.unsplash.com/photo-1652971876875-05db98fab376?w=1920&h=1080&fit=crop&auto=format"
        alt="Rural landscape in West Africa with community gathering"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(23,79,122,0.9) 0%, rgba(23,79,122,0.4) 100%)",
        }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-auto">
        <h2 className="text-4xl sm:text-6xl lg:text-8xl text-white mb-8 tracking-tighter leading-none font-['DM_Serif_Display']">
          {fc.title}
        </h2>
        <p
          className="text-xl sm:text-2xl lg:text-3xl mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed font-medium px-5 sm:px-0"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {fc.p1} {fc.p2} {fc.p3}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <button
            onClick={() => {
              trackEvent("apply_now_click", { source: "final_cta_volunteer" })
              navigate("apply")
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 font-black text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 rounded-2xl text-white transition-all shadow-2xl hover:scale-105 cursor-pointer"
            style={{ backgroundColor: "#35A85A" }}
          >
            <span className="uppercase tracking-wide">{fc.cta1}</span>
            <ArrowRightIcon size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => {
              trackEvent("partner_request_click", { source: "final_cta_partner" })
              navigate("partner")
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 rounded-2xl transition-all shadow-2xl hover:scale-105 cursor-pointer text-white"
            style={{
              backgroundColor: "#174F7A",
            }}
          >
            {fc.cta2}
            <ArrowRightIcon size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function Home({ lang, navigate }: HomeProps) {
  const currentLang = (lang || "FR").toUpperCase() as keyof typeof translations
  const t = translations[currentLang] || translations.FR

  return (
    <main>
      <Hero t={t} navigate={navigate} />
      <DualPath t={t} navigate={navigate} />
      <WhyMission t={t} />
      <TheChallenge t={t} />
      <YourMission t={t} />
      <WhatCouldYouBuild t={t} />
      <ProfilesSought t={t} navigate={navigate} />
      <NotAnExpert t={t} navigate={navigate} />
      <WeekWithAptic t={t} />
      <LifeInTogo t={t} />
      <Agbelouve t={t} />
      <Support t={t} />
      <ApplicationProcess t={t} navigate={navigate} />
      <Partners t={t} navigate={navigate} />
      <Testimonials t={t} />
      <FAQ t={t} lang={currentLang} />
      <FinalCTA t={t} navigate={navigate} />
    </main>
  )
}
