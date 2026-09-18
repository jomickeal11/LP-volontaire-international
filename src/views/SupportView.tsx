"use client"

import React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter } from "next/navigation"
import { ArrowRightIcon } from "@/components/Icons"

interface SupportViewProps {
  lang: Language
}

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const BG_PAGE = "#F7F8FA"
const BLUE_INSTITUTIONAL = "#003366"
const BLUE_TECH = "#007BFF"
const GREEN_ACCENT = "#28A745"
const TEXT_SECONDARY = "#5E6B76"
const BORDER_COLOR = "#E5EAF0"

// ─── Editorial Content & Translations ──────────────────────────────────────────
const CONTENT = {
  FR: {
    hero: {
      badge: "SOUTENIR APTIC-R",
      title: "Soutenez nos actions pour le développement rural",
      desc: "Mettre les compétences, le numérique et les technologies appropriées au service de l'autonomie durable des communautés rurales au Togo.",
      cta: "Nous contacter",
    },
    axes: {
      tag: "COMMENT SOUTENIR NOS ACTIONS ?",
      title: "Quatre façons d'accompagner nos projets",
      subtitle: "Chaque contribution (financière, matérielle, méthodologique ou institutionnelle) renforce directement l'impact de nos actions sur le terrain.",
      items: [
        {
          num: "01",
          title: "FINANCEMENT DE PROJETS",
          desc: "Soutenir directement l'équipement de centres numériques ruraux, le déploiement de kits solaires pour écoles hors-réseau ou des bourses de formation pour les jeunes et les femmes.",
          linkText: "Échanger avec l'équipe",
        },
        {
          num: "02",
          title: "DON DE MATÉRIEL",
          desc: "Fournir des équipements informatiques fonctionnels ou reconditionnés (ordinateurs portables, serveurs locaux, routeurs) et du matériel photovoltaïque pour nos FabLabs et salles communautaires.",
          linkText: "Proposer un don",
        },
        {
          num: "03",
          title: "MÉCÉNAT DE COMPÉTENCES",
          desc: "Mettre votre expertise technique, pédagogique ou organisationnelle à disposition de l'équipe locale : développement low-tech, cybersécurité, formation ou encadrement de projets.",
          linkText: "Partager vos compétences",
        },
        {
          num: "04",
          title: "PARTENARIATS & SPONSORING",
          desc: "Entreprises, fondations et institutions : co-construisez avec l'APTIC-R des programmes pluriannuels d'inclusion et d'émancipation rurale alignés sur vos engagements de responsabilité sociétale.",
          linkText: "Devenir organisation partenaire",
        },
      ],
    },
    why: {
      tag: "POURQUOI VOTRE SOUTIEN COMPTE ?",
      title: "Un impact direct et mesurable au cœur des territoires",
      desc: "À Agbélouvé et dans les communautés rurales environnantes, chaque ressource mobilisée répond à un besoin prioritaire identifié avec les habitants : électrification solaire de salles de classe, accès à des ressources pédagogiques libres et formation pratique aux métiers de demain.",
      points: [
        {
          title: "Des projets ancrés dans le réel",
          desc: "Toutes nos initiatives partent des besoins formulés par les acteurs locaux et sont co-construites pour durer.",
        },
        {
          title: "Un transfert durable de compétences",
          desc: "Nous formons les jeunes et les femmes à maintenir, adapter et faire évoluer eux-mêmes les installations.",
        },
        {
          title: "Une gestion rigoureuse et concertée",
          desc: "Chaque ressource est allouée avec discernement sous la supervision du Bureau Exécutif et des référents de projet.",
        },
      ],
    },
    transparency: {
      tag: "TRANSPARENCE & REDEVABILITÉ",
      title: "Une gestion claire et responsable",
      desc: "L'APTIC-R est une association officiellement reconnue au Togo (Récépissé N° 0586/MATDCL-DAPL-DOCA). Chaque contribution fait l'objet d'une information claire sur son affectation, selon les modalités définies en accord avec l'association.",
      receiptNotice: "Une attestation ou un reçu officiel de don est systématiquement délivré pour chaque contribution financière ou matérielle.",
    },
    future: {
      tag: "ÉVOLUTION FUTURE",
      title: "Paiements et dons en ligne",
      desc: "Une solution de don en ligne sécurisée pourra être intégrée ultérieurement, après validation officielle des modalités et des partenaires financiers par l'APTIC-R.",
    },
    contactCta: {
      title: "Vous souhaitez soutenir un projet spécifique ?",
      desc: "Notre équipe de coordination est à votre entière disposition pour vous présenter les besoins prioritaires sur le terrain et définir ensemble les modalités de votre soutien.",
      btnContact: "Nous contacter",
      btnWhatsApp: "Échanger sur WhatsApp",
    },
  },

  EN: {
    hero: {
      badge: "SUPPORT APTIC-R",
      title: "Support Our Actions for Rural Development",
      desc: "Empowering rural communities in Togo through digital technology, shared skills, and appropriate low-tech solutions.",
      cta: "Contact Us",
    },
    axes: {
      tag: "HOW TO SUPPORT OUR INITIATIVES?",
      title: "Four ways to stand alongside our mission",
      subtitle: "Every contribution (financial, hardware, expertise, or institutional partnership) directly strengthens grassroots impact.",
      items: [
        {
          num: "01",
          title: "PROJECT FUNDING",
          desc: "Directly fund equipment for rural multimedia hubs, autonomous solar kits for off-grid schools, or training grants for youth and women.",
          linkText: "Discuss with the team",
        },
        {
          num: "02",
          title: "HARDWARE DONATIONS",
          desc: "Donate functional or refurbished IT hardware (laptops, micro-servers, routers) and solar components for our community FabLabs.",
          linkText: "Propose a donation",
        },
        {
          num: "03",
          title: "PRO BONO & SKILLS SPONSORSHIP",
          desc: "Share your technical, pedagogical, or organizational skills with our local team: low-tech engineering, cybersecurity, or project coaching.",
          linkText: "Share your skills",
        },
        {
          num: "04",
          title: "PARTNERSHIPS & SPONSORSHIP",
          desc: "Companies, foundations, and institutions: co-design multi-year rural digital inclusion programs aligned with your CSR goals.",
          linkText: "Become a partner organization",
        },
      ],
    },
    why: {
      tag: "WHY YOUR SUPPORT MATTERS",
      title: "Direct and measurable impact in rural areas",
      desc: "In Agbélouvé and surrounding villages, every mobilized resource directly addresses prioritized community needs: solar electrification for classrooms, access to open educational content, and practical vocational training.",
      points: [
        {
          title: "Locally anchored initiatives",
          desc: "All our projects originate from real community needs and are designed for long-term sustainability.",
        },
        {
          title: "Lasting skill transfers",
          desc: "We train local youth and women to maintain, adapt, and upgrade all installations independently.",
        },
        {
          title: "Rigorous and transparent management",
          desc: "Every resource is purposefully allocated under the supervision of the Executive Board and project coordinators.",
        },
      ],
    },
    transparency: {
      tag: "TRANSPARENCY & ACCOUNTABILITY",
      title: "Clear and responsible stewardship",
      desc: "APTIC-R is an officially registered non-profit organization in Togo (Reg. No. 0586/MATDCL-DAPL-DOCA). Every contribution is subject to clear reporting on its allocation, in line with associative guidelines.",
      receiptNotice: "An official donation receipt or certificate is systematically provided for every financial or in-kind contribution.",
    },
    future: {
      tag: "FUTURE EVOLUTION",
      title: "Online payments and donations",
      desc: "A secure online donation solution may be integrated at a later stage, following formal validation of terms and payment gateways by APTIC-R leadership.",
    },
    contactCta: {
      title: "Would you like to support a specific project?",
      desc: "Our coordination team is at your disposal to share current field priorities and structure your involvement.",
      btnContact: "Contact Us",
      btnWhatsApp: "Chat on WhatsApp",
    },
  },

  DE: {
    hero: {
      badge: "APTIC-R UNTERSTÜTZEN",
      title: "Unterstützen Sie unsere Arbeit für den ländlichen Raum",
      desc: "Digitale Kompetenzen, Technologien und Innovation für eine nachhaltige Selbstbestimmung ländlicher Gemeinschaften in Togo.",
      cta: "Kontakt aufnehmen",
    },
    axes: {
      tag: "WIE KÖNNEN SIE UNS UNTERSTÜTZEN?",
      title: "Vier Wege, unsere Vorhaben zu begleiten",
      subtitle: "Jeder Beitrag (finanziell, materiell, fachlich oder institutionell) stärkt direkt unsere Wirkung vor Ort.",
      items: [
        {
          num: "01",
          title: "PROJEKTFINANZIERUNG",
          desc: "Fördern Sie direkt die Ausstattung ländlicher Computerräume, Solaranlagen für Dorfschulen oder Ausbildungsstipendien für junge Menschen.",
          linkText: "Mit dem Team sprechen",
        },
        {
          num: "02",
          title: "SACHSPENDEN",
          desc: "Spenden Sie funktionierende oder aufbereitete IT-Geräte (Laptops, lokale Server, Router) und Photovoltaik-Komponenten für unsere FabLabs.",
          linkText: "Sachspende vorschlagen",
        },
        {
          num: "03",
          title: "KOMPETENZSPENDE",
          desc: "Bringen Sie Ihr technisches oder pädagogisches Fachwissen ein: Low-Tech-Lösungen, Cybersicherheit, Schulungen oder Projektbegleitung.",
          linkText: "Kompetenzen teilen",
        },
        {
          num: "04",
          title: "PARTNERSCHAFTEN & SPONSORING",
          desc: "Unternehmen und Stiftungen: Entwickeln Sie gemeinsam mit APTIC-R nachhaltige Förderprogramme im Rahmen Ihrer CSR-Strategie.",
          linkText: "Partnerorganisation werden",
        },
      ],
    },
    why: {
      tag: "WARUM IHRE UNTERSTÜTZUNG ZÄHLT",
      title: "Direkte und messbare Wirkung in den Dörfern",
      desc: "In Agbélouvé und den umliegenden Dörfern beantwortet jede Unterstützung einen konkreten Bedarf: Solarstrom für Klassenzimmer, freie Bildungsressourcen und praktische Zukunftskompetenzen.",
      points: [
        {
          title: "Lokal verankerte Projekte",
          desc: "Alle Initiativen entstehen aus den Bedürfnissen der Menschen vor Ort und sind auf Dauerhaftigkeit ausgelegt.",
        },
        {
          title: "Nachhaltiger Wissenstransfer",
          desc: "Wir befähigen Jugendliche und Frauen, technische Einrichtungen eigenständig zu warten und weiterzuentwickeln.",
        },
        {
          title: "Gewissenhafte Mittelverwendung",
          desc: "Jedes Fördermittel wird transparent und zielgerichtet unter Aufsicht des Vorstands eingesetzt.",
        },
      ],
    },
    transparency: {
      tag: "TRANSPARENZ & RECHENSCHAFT",
      title: "Verantwortungsvolle und klare Führung",
      desc: "APTIC-R ist ein offiziell anerkannter Verein in Togo (Reg.-Nr. 0586/MATDCL-DAPL-DOCA). Jede Unterstützung wird transparent und zweckgebunden ausgewiesen.",
      receiptNotice: "Für jede finanzielle oder materielle Unterstützung stellen wir eine offizielle Spendenbescheinigung aus.",
    },
    future: {
      tag: "ZUKÜNFTIGE ENTWICKLUNG",
      title: "Online-Spenden",
      desc: "Eine sichere Online-Spendenfunktion kann zu einem späteren Zeitpunkt nach Prüfung und Freigabe durch APTIC-R integriert werden.",
    },
    contactCta: {
      title: "Möchten Sie ein konkretes Vorhaben unterstützen?",
      desc: "Unser Koordinationsteam steht Ihnen gerne zur Verfügung, um über aktuelle Bedarfe und Möglichkeiten zu sprechen.",
      btnContact: "Kontakt aufnehmen",
      btnWhatsApp: "Über WhatsApp schreiben",
    },
  },
} as const

// ─── Small Badge Component ─────────────────────────────────────────────────────
function SectionBadge({ text, centered = false }: { text: string; centered?: boolean }) {
  return (
    <div className={`flex items-center gap-2 mb-4 ${centered ? "justify-center" : ""}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path d="M4 11H8 M6 11V5 M6 5L2.5 2 M6 5L9.5 2" stroke={GREEN_ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#003366]">
        {text}
      </span>
    </div>
  )
}

// ─── Main Support View ─────────────────────────────────────────────────────────
export default function SupportView({ lang, initialSettings = {} }: SupportViewProps & { initialSettings?: Record<string, string> }) {
  const router = useRouter()
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const c = CONTENT[safeLang]

  const [settings, setSettings] = React.useState<Record<string, string>>(initialSettings)

  React.useEffect(() => {
    import("@/lib/cms-actions").then(({ getSiteSettings }) => {
      getSiteSettings("SUPPORT").then((res) => {
        if (res.success && res.dict) {
          setSettings((prev) => ({ ...prev, ...res.dict }))
        }
      }).catch(console.error)
    })
  }, [])

  const heroImage = settings["support_hero_image"] || "https://images.unsplash.com/photo-1609252509229-364936a1d1a2?w=1000&h=750&fit=crop&auto=format"

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, safeLang))
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG_PAGE }}>
      <Header
        lang={safeLang}
        currentPage="support"
        navigate={navigate}
        setLang={(newLang) => router.push(getPageUrl("support", newLang))}
      />

      <main className="flex-1">
        {/* ═════════════════════════════════════════════════════════════════════════
            01. HERO (Institutionnel, sobre, avec photo de terrain)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Colonne de gauche : Titre & Texte */}
              <div className="lg:col-span-7 text-left">
                <SectionBadge text={c.hero.badge} />
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['DM_Serif_Display'] leading-[1.12] text-[#003366] tracking-tight mb-6">
                  {c.hero.title}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-[#5E6B76] leading-relaxed mb-8 max-w-2xl font-normal">
                  {c.hero.desc}
                </p>
                <div>
                  <button
                    onClick={() => navigate("contact")}
                    className="inline-flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl text-white transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer bg-[#007BFF] hover:bg-[#0069d9]"
                  >
                    <span>{c.hero.cta}</span>
                    <ArrowRightIcon size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Colonne de droite : Photo de terrain sobre */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl overflow-hidden shadow-sm border border-[#E5EAF0] aspect-[4/3] bg-white">
                  <img
                    src={heroImage}
                    alt="Community collaboration in Togo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            02. COMMENT SOUTENIR NOS ACTIONS ? (4 Grands axes éditoriaux unifiés)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-[#FFFFFF]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-14 sm:mb-18">
              <SectionBadge text={c.axes.tag} centered />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em] font-['DM_Serif_Display'] font-normal">
                {c.axes.title}
              </h2>
              <p className="text-base sm:text-lg text-[#5E6B76] max-w-xl mx-auto mt-3 font-medium">
                {c.axes.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {c.axes.items.map((axe, i) => (
                <div
                  key={axe.num}
                  className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#E5EAF0] hover:border-[#003366]/20 transition-all duration-300 flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#28A745] block mb-3">
                      {axe.num}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#003366] mb-3 leading-snug">
                      {axe.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed mb-6">
                      {axe.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5EAF0]">
                    <button
                      onClick={() => {
                        if (i === 3) {
                          navigate("partner")
                        } else {
                          navigate("contact")
                        }
                      }}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#007BFF] hover:text-[#0056b3] transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                    >
                      <span>{axe.linkText}</span>
                      <ArrowRightIcon size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            03. POURQUOI VOTRE SOUTIEN COMPTE ? (Section éditoriale + Photo + Points)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 lg:py-28 bg-[#F7F8FA]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-14 sm:mb-18">
              <SectionBadge text={c.why.tag} centered />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#003366] tracking-[-0.02em] font-['DM_Serif_Display'] font-normal">
                {c.why.title}
              </h2>
              <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl mx-auto mt-3 font-normal leading-relaxed">
                {c.why.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {c.why.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] p-7 rounded-2xl border border-[#E5EAF0] shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#003366]/5 text-[#003366] font-bold text-xs flex items-center justify-center mb-4">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#003366] mb-2">
                    {pt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E6B76] leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            04. TRANSPARENCE & REDEVABILITÉ (Sobre & textuelle)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-[#FFFFFF]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#F7F8FA] border border-[#E5EAF0] text-center">
              <SectionBadge text={c.transparency.tag} centered />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003366] mb-4 font-['DM_Serif_Display']">
                {c.transparency.title}
              </h2>
              <p className="text-sm sm:text-base text-[#5E6B76] leading-relaxed max-w-2xl mx-auto mb-6">
                {c.transparency.desc}
              </p>
              <div className="pt-4 border-t border-[#E5EAF0] text-xs text-[#5E6B76] font-medium">
                {c.transparency.receiptNotice}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            05. ÉVOLUTION FUTURE (Discret et sobre)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-8 bg-[#FFFFFF]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="p-6 rounded-2xl border border-dashed border-[#E5EAF0] bg-white text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6B76] block mb-1">
                {c.future.tag}
              </span>
              <h4 className="text-sm font-bold text-[#003366] mb-1.5">
                {c.future.title}
              </h4>
              <p className="text-xs text-[#5E6B76] leading-relaxed max-w-lg mx-auto">
                {c.future.desc}
              </p>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════════
            06. CTA FINAL LÉGER (Fond #F7F8FA, boutons harmonisés)
        ═════════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-[#F7F8FA]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#003366] mb-4 font-['DM_Serif_Display']">
              {c.contactCta.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5E6B76] max-w-xl mx-auto mb-8 leading-relaxed">
              {c.contactCta.desc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => navigate("contact")}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#007BFF] hover:bg-[#0069d9] transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{c.contactCta.btnContact}</span>
                <ArrowRightIcon size={14} strokeWidth={2} />
              </button>

              <a
                href="https://wa.me/22891201990?text=Bonjour%20APTIC-R,%20je%20souhaite%20des%20informations%20pour%20soutenir%20vos%20actions."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#28A745] hover:bg-[#218838] transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>💬</span>
                <span>{c.contactCta.btnWhatsApp}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer
        lang={safeLang}
        navigate={(p: Page) => router.push(getPageUrl(p, safeLang))}
      />
    </div>
  )
}
