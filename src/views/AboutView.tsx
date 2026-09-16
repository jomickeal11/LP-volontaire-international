"use client"

import React from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"

interface AboutViewProps {
  lang: Language
}

const BLUE = "#174F7A"
const GREEN = "#35A85A"
const BG = "#F5F7F9"
const DARK = "#142332"

const I18N = {
  FR: {
    badge: "Association togolaise · Enregistrée sous récépissé officiel",
    title: "Bâtir des ponts numériques durables au cœur du milieu rural",
    subtitle:
      "Depuis sa fondation à Agbélouvé, APTIC-R œuvre pour que la révolution numérique et technologique ne laisse aucun village, aucune femme et aucun jeune de côté.",
    storyTitle: "Notre Histoire",
    storyBadge: "Aux origines du projet",
    storyP1:
      "En 2019, au cœur du canton d'Agbélouvé (préfecture du Zio, Togo), un constat s'impose avec acuité : alors que le monde s'accélère au rythme de l'intelligence artificielle et du numérique, les communautés villageoises restent privées d'infrastructures informatiques, de connexion stable et de formation technologique adaptée.",
    storyP2:
      "Face au risque d'accroissement des inégalités territoriales et de marginalisation de la jeunesse rurale, un collectif d'ingénieurs, d'éducateurs et d'acteurs communautaires togolais décide d'agir. C'est ainsi que naît APTIC-R (Association Pour la Promotion des Technologies de l'Information et de la Communication en Milieu Rural).",
    storyP3:
      "En implantant des tiers-lieux d'apprentissage équipés de matériel reconditionné et alimentés à l'énergie solaire, APTIC-R a transformé Agbélouvé en un laboratoire vivant de l'innovation rurale frugale et de l'artisanat connecté.",

    pillarsTitle: "Mission, Vision & Philosophie",
    missionTitle: "Notre Mission",
    missionDesc:
      "Démocratiser l'apprentissage technologique et les solutions numériques utiles dans les zones rurales et périurbaines du Togo à travers la formation, l'expérimentation concrète et le transfert de compétences durables.",
    visionTitle: "Notre Vision",
    visionDesc:
      "Un milieu rural togolais et africain émancipé, où les technologies libres et les solutions low-tech renforcent la souveraineté alimentaire, économique et civique des communautés locales.",
    approachTitle: "Notre Philosophie",
    approachDesc:
      "Le numérique sobre et adapté. Nous refusons les technologies gadget : chaque outil déployé doit être réparable localement, sobre en énergie, accessible à tous et directement utile aux besoins du village.",

    valuesTitle: "Nos 5 Valeurs Cardinales",
    valuesSubtitle: "Des principes intangibles qui guident chacune de nos actions sur le terrain.",
    values: [
      {
        icon: "🤝",
        title: "Ancrage Communautaire",
        desc: "Rien ne se fait sans l'accord, la participation et la co-responsabilité des chefs traditionnels, des associations locales et des familles villageoises.",
      },
      {
        icon: "🌱",
        title: "Sobriété Numérique & Low-Tech",
        desc: "Privilégier le matériel reconditionné, l'énergie solaire, les capteurs accessibles et les formats légers pour un impact écologique minimal et une autonomie maximale.",
      },
      {
        icon: "⚖️",
        title: "Égalité des Chances & Mixité",
        desc: "Encourager prioritairement l'autonomisation des jeunes filles et des femmes à travers des programmes dédiés pour faire tomber les barrières de genre dans les STEM.",
      },
      {
        icon: "🔓",
        title: "Souveraineté & Culture Libre",
        desc: "Promouvoir les logiciels libres, les données ouvertes (Open Data) et le partage horizontal des connaissances contre toute forme de dépendance technologique.",
      },
      {
        icon: "🛡️",
        title: "Intégrité & Transparence",
        desc: "Une gestion rigoureuse, des comptes vérifiés et des bilans d'activités publics pour garantir la confiance totale de nos membres, partenaires et bénéficiaires.",
      },
    ],

    stats: [
      { value: "5+", label: "Années d'action sur le terrain" },
      { value: "3 200+", label: "Enfants, jeunes et artisans formés" },
      { value: "14", label: "Établissements scolaires partenaires" },
      { value: "100%", label: "Projets co-conçus localement" },
    ],

    governanceTitle: "Gouvernance & Structure",
    governanceSubtitle: "Une gouvernance collégiale, démocratique et ancrée dans le respect des statuts associatifs.",
    gov1Title: "Assemblée Générale",
    gov1Desc: "Instance souveraine réunissant chaque année l'ensemble des membres adhérents pour approuver les rapports moraux, financiers et les orientations stratégiques.",
    gov2Title: "Bureau Exécutif & Direction",
    gov2Desc: "Équipe opérationnelle chargée de la mise en œuvre quotidienne des programmes, de la gestion administrative, financière et de la sécurité des volontaires.",
    gov3Title: "Comité Consultatif Communautaire",
    gov3Desc: "Composé de représentants des villageois d'Agbélouvé, d'enseignants et d'artisans, veillant à la pertinence et à l'impact social réel des projets.",

    ctaTitle: "Participez à notre aventure humaine et technologique",
    ctaSubtitle: "Que vous soyez un citoyen engagé, un volontaire potentiel ou une organisation solidaire, votre place est à nos côtés.",
    ctaMember: "DEVENIR MEMBRE",
    ctaVolunteer: "CANDIDATER COMME VOLONTAIRE",
    ctaPartner: "DEVENIR PARTENAIRE",
  },
  EN: {
    badge: "Togolese Non-Profit Organization · Official Registry Status",
    title: "Building lasting digital bridges in the heart of rural Africa",
    subtitle:
      "Since its founding in Agbélouvé, APTIC-R has been dedicated to ensuring that the digital and technological revolution leaves no village, no woman, and no young person behind.",
    storyTitle: "Our Story",
    storyBadge: "Project Origins",
    storyP1:
      "In 2019, in the rural canton of Agbélouvé (Zio Prefecture, Togo), an urgent reality became apparent: while the world was accelerating into artificial intelligence and high-tech connectivity, village communities remained deprived of computing facilities, reliable internet, and adapted vocational tech training.",
    storyP2:
      "To prevent growing spatial inequality and youth disenfranchisement, a collective of Togolese engineers, educators, and community organizers decided to take action. Thus, APTIC-R (Association for the Promotion of ICT in Rural Areas) was founded.",
    storyP3:
      "By establishing grassroots learning labs powered by solar energy and refurbished hardware, APTIC-R turned Agbélouvé into a living laboratory for frugal innovation, youth empowerment, and connected craft.",

    pillarsTitle: "Mission, Vision & Philosophy",
    missionTitle: "Our Mission",
    missionDesc:
      "Democratize digital education and useful technology in rural and peri-urban areas through hands-on training, community experimentation, and sustainable skill transfer.",
    visionTitle: "Our Vision",
    visionDesc:
      "An empowered rural community where open-source technology and low-tech tools bolster local food sovereignty, economic resilience, and civic engagement.",
    approachTitle: "Our Philosophy",
    approachDesc:
      "Frugal, adapted technology. We reject tech for tech's sake: every tool we deploy must be locally repairable, energy-efficient, accessible, and directly beneficial to the village.",

    valuesTitle: "Our 5 Core Values",
    valuesSubtitle: "Guiding principles that drive every project we conduct in the field.",
    values: [
      {
        icon: "🤝",
        title: "Community Roots",
        desc: "Nothing is undertaken without the full involvement and co-ownership of traditional leaders, grassroots groups, and local families.",
      },
      {
        icon: "🌱",
        title: "Digital Frugality & Low-Tech",
        desc: "Prioritizing refurbished hardware, solar energy, simple sensors, and lightweight formats for minimal ecological footprint and maximum local autonomy.",
      },
      {
        icon: "⚖️",
        title: "Equal Opportunity & Inclusion",
        desc: "Actively fostering women's empowerment through tailored programs to break down gender barriers in science and technology.",
      },
      {
        icon: "🔓",
        title: "Sovereignty & Open Culture",
        desc: "Promoting free/open-source software, Open Data, and horizontal knowledge sharing against all forms of technological dependency.",
      },
      {
        icon: "🛡️",
        title: "Integrity & Transparency",
        desc: "Strict management, audited records, and public activity reports to maintain full trust among our members, partners, and beneficiaries.",
      },
    ],

    stats: [
      { value: "5+", label: "Years of grassroots action" },
      { value: "3,200+", label: "Youth, students & artisans trained" },
      { value: "14", label: "Partner schools & institutions" },
      { value: "100%", label: "Locally co-designed projects" },
    ],

    governanceTitle: "Governance & Organization",
    governanceSubtitle: "Democratic, collaborative governance anchored in non-profit transparency.",
    gov1Title: "General Assembly",
    gov1Desc: "Sovereign annual gathering of all members to review moral and financial reports and chart future strategic milestones.",
    gov2Title: "Executive Board & Management",
    gov2Desc: "Operational team responsible for program implementation, administrative oversight, volunteer safety, and daily coordination.",
    gov3Title: "Community Advisory Board",
    gov3Desc: "Comprising Agbélouvé elders, teachers, and local artisans ensuring relevance, cultural alignment, and genuine community benefit.",

    ctaTitle: "Join our human and technological journey",
    ctaSubtitle: "Whether you are a passionate citizen, a prospective volunteer, or a partner organization, there is a place for you here.",
    ctaMember: "BECOME A MEMBER",
    ctaVolunteer: "APPLY AS VOLUNTEER",
    ctaPartner: "BECOME A PARTNER",
  },
  DE: {
    badge: "Togoische gemeinnützige Organisation · Offizieller Registerstatus",
    title: "Nachhaltige digitale Brücken im ländlichen Raum bauen",
    subtitle:
      "Seit der Gründung in Agbélouvé setzt sich APTIC-R dafür ein, dass die technologische Revolution kein Dorf, keine Frau und keinen jungen Menschen zurücklässt.",
    storyTitle: "Unsere Geschichte",
    storyBadge: "Ursprung des Projekts",
    storyP1:
      "Im Jahr 2019 wurde im ländlichen Agbélouvé eine dringliche Realität sichtbar: Während die Welt in rasantem Tempo voranschreitet, blieben Dorfgemeinschaften von IT-Infrastruktur und Ausbildung abgeschnitten.",
    storyP2:
      "Um dieser Chancenungleichheit entgegenzuwirken, schloss sich ein Kollektiv togoischer Ingenieure, Pädagogen und Gemeindemitglieder zusammen und gründete APTIC-R.",
    storyP3:
      "Mit solarbetriebenen Lernwerkstätten und wiederaufbereiteten Computern wurde Agbélouvé zu einem lebendigen Reallabor für ländliche Innovation.",

    pillarsTitle: "Mission, Vision & Philosophie",
    missionTitle: "Unsere Mission",
    missionDesc:
      "Demokratisierung digitaler Bildung im ländlichen Raum durch praxisnahe Schulungen und nachhaltigen Kompetenztransfer.",
    visionTitle: "Unsere Vision",
    visionDesc:
      "Selbstbestimmte ländliche Gemeinschaften, in denen freie Technologie und Low-Tech die lokale Resilienz stärken.",
    approachTitle: "Unsere Philosophie",
    approachDesc:
      "Sparsame, angepasste Technologie. Jedes Werkzeug muss lokal reparierbar, energieeffizient und unmittelbar nützlich sein.",

    valuesTitle: "Unsere 5 Grundwerte",
    valuesSubtitle: "Feste Leitprinzipien für unser tägliches Handeln vor Ort.",
    values: [
      { icon: "🤝", title: "Gemeinschaftsverankerung", desc: "Enge Zusammenarbeit mit Dorfoberhäuptern und Familien vor Ort." },
      { icon: "🌱", title: "Low-Tech & Nachhaltigkeit", desc: "Priorisierung von Solarenergie und wiederaufbereiteter Hardware." },
      { icon: "⚖️", title: "Chancengleichheit", desc: "Gezielte Förderung von jungen Frauen in MINT-Fächern." },
      { icon: "🔓", title: "Freies Wissen", desc: "Förderung von Open Source und Open Data gegen technologische Abhängigkeiten." },
      { icon: "🛡️", title: "Integrität & Transparenz", desc: "Sorgfältige Finanzführung und öffentlich zugängliche Jahresberichte." },
    ],

    stats: [
      { value: "5+", label: "Jahre Engagement vor Ort" },
      { value: "3.200+", label: "Ausgebildete Jugendliche & Handwerker" },
      { value: "14", label: "Partnerschulen" },
      { value: "100%", label: "Lokal mitgestaltete Projekte" },
    ],

    governanceTitle: "Governance & Struktur",
    governanceSubtitle: "Demokratische und transparente Vereinsführung.",
    gov1Title: "Generalversammlung",
    gov1Desc: "Jährliches Treffen aller Mitglieder zur Genehmigung der Berichte und strategischen Leitlinien.",
    gov2Title: "Vorstand & Koordination",
    gov2Desc: "Operatives Team zur Durchführung von Programmen und Betreuung von Freiwilligen.",
    gov3Title: "Gemeindebeirat",
    gov3Desc: "Zusammenschluss von Dorfvertretern, Lehrern und Handwerkern zur Qualitätssicherung vor Ort.",

    ctaTitle: "Werden Sie Teil unserer Initiative",
    ctaSubtitle: "Ob engagierter Bürger, Freiwilliger oder Partnerorganisation — Ihre Unterstützung zählt.",
    ctaMember: "MITGLIED WERDEN",
    ctaVolunteer: "ALS FREIWILLIGER BEWERBEN",
    ctaPartner: "PARTNER WERDEN",
  },
}

export default function AboutView({ lang }: AboutViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = I18N[lang] || I18N.FR

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, lang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${lang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <Header lang={lang} setLang={handleSetLang} currentPage="about" navigate={navigate} />

      <main className="flex-1 pt-24 lg:pt-32">
        {/* ── 1. Hero Section ── */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-[#174F7A]/10 via-transparent to-transparent">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-[#174F7A] mb-6">
              <span>🏛️</span>
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142332] tracking-tight leading-tight max-w-4xl mx-auto mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Story Section ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 rounded-md bg-[#35A85A]/10 text-[#35A85A] font-semibold text-xs tracking-wider uppercase">
                {t.storyBadge}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#142332]">
                {t.storyTitle}
              </h2>
              <p className="text-slate-600 leading-relaxed">{t.storyP1}</p>
              <p className="text-slate-600 leading-relaxed">{t.storyP2}</p>
              <p className="text-slate-600 leading-relaxed font-medium text-slate-800">
                {t.storyP3}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-[#174F7A] to-[#0F3452] text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-8">
                  <div className="text-5xl">📍</div>
                  <div>
                    <div className="text-white/70 text-sm font-semibold tracking-wider uppercase">
                      Siège Social & Ancrage
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold mt-1">
                      Agbélouvé, Région Maritime
                    </div>
                    <p className="text-white/80 mt-2 text-sm">
                      À 65 km au nord de Lomé, sur le corridor RN1. Carrefour agricole et rural de la préfecture du Zio.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#35A85A]">
                        2019
                      </div>
                      <div className="text-xs text-white/70">Année de fondation</div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#35A85A]">
                        Loi 1901
                      </div>
                      <div className="text-xs text-white/70">Statut association</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Pillars Section ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#F5F7F9]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#142332]">
                {t.pillarsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-[#174F7A]/10 text-[#174F7A] flex items-center justify-center text-2xl mb-6">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-[#142332] mb-3">
                  {t.missionTitle}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t.missionDesc}
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-[#35A85A]/10 text-[#35A85A] flex items-center justify-center text-2xl mb-6">
                  👁️
                </div>
                <h3 className="text-xl font-bold text-[#142332] mb-3">
                  {t.visionTitle}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t.visionDesc}
                </p>
              </div>

              {/* Philosophy */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-[#E65100]/10 text-[#E65100] flex items-center justify-center text-2xl mb-6">
                  ⚙️
                </div>
                <h3 className="text-xl font-bold text-[#142332] mb-3">
                  {t.approachTitle}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t.approachDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Key Stats ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#174F7A] text-white">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {t.stats.map((s, idx) => (
              <div key={idx} className="p-4">
                <div className="text-3xl sm:text-5xl font-black text-[#35A85A] mb-2 tracking-tight">
                  {s.value}
                </div>
                <div className="text-sm sm:text-base text-white/80 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Values Section ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#142332]">
                {t.valuesTitle}
              </h2>
              <p className="text-slate-600 mt-3 text-base sm:text-lg">
                {t.valuesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.values.map((v, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#174F7A]/30 transition-all hover:translate-y-[-2px]"
                >
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <h3 className="text-lg font-bold text-[#142332] mb-2">
                    {v.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Governance Section ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#F5F7F9] border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#142332]">
                {t.governanceTitle}
              </h2>
              <p className="text-slate-600 mt-3 text-base sm:text-lg">
                {t.governanceSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <div className="text-2xl mb-4">🗳️</div>
                <h3 className="text-lg font-bold text-[#142332] mb-2">
                  {t.gov1Title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t.gov1Desc}
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <div className="text-2xl mb-4">👥</div>
                <h3 className="text-lg font-bold text-[#142332] mb-2">
                  {t.gov2Title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t.gov2Desc}
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <div className="text-2xl mb-4">🌾</div>
                <h3 className="text-lg font-bold text-[#142332] mb-2">
                  {t.gov3Title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t.gov3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Call To Action ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#174F7A] to-[#0d3250] text-white p-8 sm:p-14 text-center shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
              {t.ctaSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={getPageUrl("membership", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-[#35A85A] text-white hover:bg-[#2e924e] transition-colors shadow-md"
              >
                {t.ctaMember}
              </Link>
              <Link
                href={getPageUrl("apply", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-white text-[#174F7A] hover:bg-slate-100 transition-colors shadow-md"
              >
                {t.ctaVolunteer}
              </Link>
              <Link
                href={getPageUrl("partner", lang)}
                className="px-6 py-3.5 rounded-xl font-bold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-colors"
              >
                {t.ctaPartner}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
