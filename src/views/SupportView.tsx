"use client"

import React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter } from "next/navigation"

interface SupportViewProps {
  lang: Language
}

const BLUE = "#003366"
const GREEN = "#28A745"
const DARK = "#142332"
const BG = "#F7F8FA"

const CONTENT = {
  FR: {
    tag: "MOBILISATION & ENGAGEMENT",
    title: "Soutenir les actions de l'APTIC-R",
    subtitle:
      "Votre engagement permet de désenclaver numériquement les villages, d'équiper les écoles rurales en énergie solaire et d'offrir des opportunités concrètes d'autonomisation aux jeunes et aux femmes.",
    pillarsTitle: "Les différentes manières de nous soutenir",
    pillarsSubtitle: "Chaque forme de soutien, qu'elle soit financière, matérielle ou humaine, renforce directement notre impact communautaire sur le terrain.",
    pillar1Title: "1. Financement de projets & Dons",
    pillar1Desc:
      "Soutenez financièrement l'équipement de salles multimédia rurales, le déploiement de kits solaires pour écoles hors-réseau, ou financez des bourses de formation au numérique pour des jeunes femmes vulnérables.",
    pillar1Action: "Échanger avec notre trésorerie",
    pillar2Title: "2. Don de matériel informatique & Low-Tech",
    pillar2Desc:
      "Faites don d'équipements informatiques fonctionnels ou reconditionnés (ordinateurs portables, serveurs locaux, disques SSD, routeurs) et de matériel solaire (panneaux, régulateurs, batteries) pour équiper nos centres communautaires.",
    pillar2Action: "Proposer un don de matériel",
    pillar3Title: "3. Mécénat de compétences & Bénévolat",
    pillar3Desc:
      "Mettez votre expertise technique à disposition de notre équipe locale : développement de solutions low-tech, cybersécurité, mentorat à distance de nos formateurs ou encadrement de projets.",
    pillar3Action: "Proposer mes compétences",
    pillar4Title: "4. Sponsoring & Partenariats institutionnels",
    pillar4Desc:
      "Entreprises, fondations d'entreprise ou ONG : co-construisez avec l'APTIC-R un programme pluriannuel d'inclusion numérique rurale s'inscrivant dans votre politique RSE ou vos objectifs de développement durable.",
    pillar4Action: "Devenir organisation partenaire",
    architectureTitle: "Paiements et dons en ligne",
    architectureBadge: "Évolution prévue",
    architectureNotice:
      "Conformément au plan de développement de l'APTIC-R, un module de paiement en ligne sécurisé (Mobile Money et cartes bancaires) sera intégré prochainement. Actuellement, les contributions financières font l'objet d'une convention de don directe et transparente.",
    transparencyTitle: "Transparence & Redevabilité",
    transparencySubtitle: "L'APTIC-R est une association officiellement reconnue au Togo (Récépissé N° 0586/MATDCL-DAPL-DOCA). Nous garantissons une traçabilité rigoureuse de chaque ressource mobilisée.",
    pieField: "85% - Actions directes de terrain et équipements communautaires",
    pieMaintenance: "10% - Suivi technique, logistique et maintenance des installations",
    pieAdmin: "5% - Frais administratifs et bancaires minimaux",
    receiptNotice: "Une attestation et un reçu officiel de don sont systématiquement délivrés pour chaque contribution financière ou matérielle.",
    contactCtaTitle: "Vous souhaitez soutenir un projet spécifique ?",
    contactCtaDesc: "Notre équipe de coordination est à votre disposition pour vous présenter les besoins prioritaires sur le terrain et convenir ensemble des modalités d'accompagnement.",
    contactBtn: "Prendre contact avec l'équipe",
    whatsappBtn: "Échanger sur WhatsApp",
  },
  EN: {
    tag: "MOBILIZATION & COMMITMENT",
    title: "Support APTIC-R Initiatives",
    subtitle:
      "Your support helps bridge the digital divide in rural villages, equip schools with autonomous solar energy, and unlock real opportunities for youth and women in Togo.",
    pillarsTitle: "Ways You Can Support Us",
    pillarsSubtitle: "Every contribution—financial, hardware, or voluntary skills—directly strengthens our grassroots community impact.",
    pillar1Title: "1. Project Funding & Direct Donations",
    pillar1Desc:
      "Support the equipment of rural multimedia centers, the deployment of solar energy kits for off-grid schools, or fund ICT training scholarships for young women.",
    pillar1Action: "Contact our treasury team",
    pillar2Title: "2. Computer & Low-Tech Hardware Donations",
    pillar2Desc:
      "Donate working or refurbished IT hardware (laptops, local micro-servers, SSDs, Wi-Fi routers) and solar equipment (panels, charge controllers, batteries) for community centers.",
    pillar2Action: "Propose hardware donation",
    pillar3Title: "3. Skills Sponsorship & Pro Bono Mentorship",
    pillar3Desc:
      "Share your expertise with our local team: low-tech development, cybersecurity, remote mentoring for local trainers, or technical advisory.",
    pillar3Action: "Offer my skills",
    pillar4Title: "4. Corporate Sponsorship & Foundation Grants",
    pillar4Desc:
      "Companies, corporate foundations, and international NGOs: co-design sustainable rural digital inclusion programs with APTIC-R aligned with your CSR goals.",
    pillar4Action: "Become a partner organization",
    architectureTitle: "Online Payments & Donations",
    architectureBadge: "Upcoming Feature",
    architectureNotice:
      "In accordance with APTIC-R's roadmap, direct online payment processing (Mobile Money & credit cards) will be integrated in a subsequent release. Currently, donations and sponsorships are formalized directly and transparently through gift agreements.",
    transparencyTitle: "Transparency & Accountability",
    transparencySubtitle: "APTIC-R is an officially registered non-profit organization in Togo (Reg. No. 0586/MATDCL-DAPL-DOCA). We guarantee complete traceability for every mobilized resource.",
    pieField: "85% - Direct field operations and community equipment",
    pieMaintenance: "10% - Technical maintenance, local logistics, and solar upkeep",
    pieAdmin: "5% - Minimal administrative and banking costs",
    receiptNotice: "An official donation receipt and certificate are systematically provided for every financial or in-kind contribution.",
    contactCtaTitle: "Want to support a specific project?",
    contactCtaDesc: "Our coordination team is at your service to discuss current field priorities and formalize our partnership.",
    contactBtn: "Contact the coordination team",
    whatsappBtn: "Chat on WhatsApp",
  },
  DE: {
    tag: "MOBILISIERUNG & ENGAGEMENT",
    title: "Unterstützen Sie die Arbeit von APTIC-R",
    subtitle:
      "Ihr Beitrag hilft, Dörfer digital anzubinden, Schulen mit Solarenergie auszustatten und jungen Menschen sowie Frauen neue Zukunftsperspektiven zu eröffnen.",
    pillarsTitle: "Möglichkeiten der Unterstützung",
    pillarsSubtitle: "Jede Unterstützung – finanziell, materiell oder durch Fachwissen – stärkt unsere Wirkung vor Ort.",
    pillar1Title: "1. Projektfinanzierung & Spenden",
    pillar1Desc:
      "Finanzieren Sie die Ausstattung ländlicher Computerräume, Solaranlagen für netzferne Dorfschulen oder Bildungsstipendien für junge Frauen.",
    pillar1Action: "Kontakt zur Finanzabteilung",
    pillar2Title: "2. Sachspenden: IT- und Solarausrüstung",
    pillar2Desc:
      "Spenden Sie funktionierende oder aufbereitete Laptops, lokale Server, Router sowie Solarkomponenten für dörfliche Lernzentren.",
    pillar2Action: "Sachspende anbieten",
    pillar3Title: "3. Kompetenzspende & Fachberatung",
    pillar3Desc:
      "Bringen Sie Ihr technisches Fachwissen ein: Low-Tech-Entwicklung, Cybersicherheit, Schulung lokaler Ausbilder oder Projektbegleitung.",
    pillar3Action: "Kompetenzen einbringen",
    pillar4Title: "4. Sponsoring & Partnerschaften",
    pillar4Desc:
      "Unternehmen und Stiftungen: Entwickeln Sie gemeinsam mit APTIC-R nachhaltige Förderprogramme im Rahmen Ihrer CSR-Strategie.",
    pillar4Action: "Partnerorganisation werden",
    architectureTitle: "Online-Spenden",
    architectureBadge: "In Vorbereitung",
    architectureNotice:
      "Gemäß der Entwicklungs-Roadmap von APTIC-R wird ein Online-Zahlungsmodul in Kürze integriert. Derzeit werden Förderungen direkt und transparent über Vereinbarungen abgewickelt.",
    transparencyTitle: "Transparenz und Rechenschaft",
    transparencySubtitle: "APTIC-R ist eine offiziell anerkannte Organisation in Togo (Reg.-Nr. 0586/MATDCL-DAPL-DOCA). Wir garantieren vollkommene Nachvollziehbarkeit aller Mittel.",
    pieField: "85% - Direkte Projektarbeit und Ausrüstung vor Ort",
    pieMaintenance: "10% - Technische Wartung und Solarenergie",
    pieAdmin: "5% - Minimale Verwaltungskosten",
    receiptNotice: "Für jede finanzielle oder materielle Unterstützung stellen wir eine offizielle Spendenbescheinigung aus.",
    contactCtaTitle: "Möchten Sie ein konkretes Vorhaben unterstützen?",
    contactCtaDesc: "Unser Koordinationsteam steht Ihnen jederzeit zur Verfügung, um über aktuelle Bedarfe zu sprechen.",
    contactBtn: "Kontakt aufnehmen",
    whatsappBtn: "Über WhatsApp schreiben",
  },
}

export default function SupportView({ lang }: SupportViewProps) {
  const router = useRouter()
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const t = CONTENT[safeLang]

  const PILLARS = [
    {
      icon: "💡",
      title: t.pillar1Title,
      desc: t.pillar1Desc,
      btnLabel: t.pillar1Action,
      href: `mailto:aptic.rural19@gmail.com?subject=${encodeURIComponent("Soutien financier / Don de projet - APTIC-R")}`,
      isExternal: true,
      color: "#003366",
    },
    {
      icon: "💻",
      title: t.pillar2Title,
      desc: t.pillar2Desc,
      btnLabel: t.pillar2Action,
      href: `mailto:aptic.rural19@gmail.com?subject=${encodeURIComponent("Proposition de don de matériel - APTIC-R")}`,
      isExternal: true,
      color: "#28A745",
    },
    {
      icon: "🤝",
      title: t.pillar3Title,
      desc: t.pillar3Desc,
      btnLabel: t.pillar3Action,
      href: getPageUrl("contact", safeLang),
      isExternal: false,
      color: "#D97706",
    },
    {
      icon: "🏢",
      title: t.pillar4Title,
      desc: t.pillar4Desc,
      btnLabel: t.pillar4Action,
      href: getPageUrl("partner", safeLang),
      isExternal: false,
      color: "#4F46E5",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header
        lang={safeLang}
        currentPage="support"
        navigate={(p: Page) => router.push(getPageUrl(p, safeLang))}
        setLang={(newLang) => router.push(getPageUrl("support", newLang))}
      />

      <main className="flex-1 pb-24">
        {/* ── 1. Hero Section ────────────────────────────────────────── */}
        <section
          className="relative py-20 lg:py-28 overflow-hidden text-white"
          style={{
            background: `linear-gradient(135deg, ${DARK} 0%, ${BLUE} 60%, #1a6b3a 100%)`,
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#28A745]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#007BFF]/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 border border-white/15">
              {t.tag}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. The 4 Support Pillars (Conformes au cahier des charges) ── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5 shadow-sm"
                    style={{ backgroundColor: `${p.color}15`, color: p.color }}
                  >
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                    {p.desc}
                  </p>
                </div>

                {p.isExternal ? (
                  <a
                    href={p.href}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: p.color }}
                  >
                    <span>{p.btnLabel}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : (
                  <button
                    onClick={() => router.push(p.href)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: p.color }}
                  >
                    <span>{p.btnLabel}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Architecture Notice (Prévue au cahier des charges) ──── */}
        <section className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-[#003366]/10 text-[#003366] flex items-center justify-center text-2xl shrink-0">
              ⚙️
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm sm:text-base font-bold text-gray-900">
                  {t.architectureTitle}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {t.architectureBadge}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.architectureNotice}
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. Transparence & Redevabilité ─────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 mt-12">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#003366]">
                Redevabilité
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 mb-2">
                {t.transparencyTitle}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.transparencySubtitle}
              </p>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: "85%", backgroundColor: GREEN }} title="85% Terrain" />
                <div style={{ width: "10%", backgroundColor: BLUE }} title="10% Suivi & Maintenance" />
                <div style={{ width: "5%", backgroundColor: "#F59E0B" }} title="5% Fonctionnement" />
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: GREEN }} />
                  <span className="text-gray-700 font-medium">{t.pieField}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: BLUE }} />
                  <span className="text-gray-700 font-medium">{t.pieMaintenance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0 bg-amber-500" />
                  <span className="text-gray-700 font-medium">{t.pieAdmin}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
              {t.receiptNotice}
            </div>
          </div>
        </section>

        {/* ── 5. Contact Direct CTA ──────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 mt-12 text-center">
          <div className="bg-gradient-to-br from-[#003366] to-[#142332] rounded-3xl p-8 sm:p-10 text-white shadow-xl">
            <h3 className="text-xl sm:text-2xl font-black mb-3">
              {t.contactCtaTitle}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto mb-6 leading-relaxed">
              {t.contactCtaDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => router.push(getPageUrl("contact", safeLang))}
                className="px-6 py-3 rounded-xl text-xs font-bold text-[#003366] bg-white hover:bg-gray-100 transition-all shadow-md cursor-pointer"
              >
                {t.contactBtn}
              </button>
              <a
                href="https://wa.me/22891201990?text=Bonjour%20APTIC-R,%20je%20souhaite%20des%20informations%20pour%20soutenir%20vos%20actions."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#218838] hover:bg-[#1B7A3D] transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>💬</span>
                <span>{t.whatsappBtn}</span>
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
