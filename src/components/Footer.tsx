import type { Page, Language } from "../types"
import { getPageUrl } from "../types"
import Image from "next/image"
import Link from "next/link"
import translations from "../i18n/translations"
import { LEGAL_SLUGS } from "@/lib/legalContent"
import ApticLogo from "./ApticLogo"

interface FooterProps {
  lang: Language
  navigate: (p: Page) => void
}

export default function Footer({ lang, navigate }: FooterProps) {
  const currentLang = (lang || "FR").toUpperCase() as keyof typeof translations
  const safeLang = translations[currentLang] ? currentLang : "FR"
  const t = translations[safeLang].footer
  const n = translations[safeLang].nav

  /* ── Footer navigation groups ──────────────────────────────────── */
  const ORG_NAV = [
    { label: n.aboutInstitutional || "À propos", page: "about" as Page },
    { label: n.domains || "Domaines", page: "domains" as Page },
    { label: n.projects || "Projets", page: "projects" as Page },
    { label: n.team || "Équipe", page: "team" as Page },
  ]

  const ENGAGEMENT_NAV = [
    { label: n.volunteering || "Volontariat", page: "volunteering" as Page },
    { label: n.membership || "Devenir membre", page: "membership" as Page },
    { label: n.partners || "Partenaires", page: "partner" as Page },
    { label: (n as any).support || "Soutenir", page: "support" as Page },
  ]

  const RESOURCES_NAV = [
    { label: n.news || "Actualités", page: "news" as Page },
    { label: n.resources || "Ressources", page: "resources" as Page },
    { label: n.gallery || "Galerie", page: "gallery" as Page },
  ]

  const currentLangLower = safeLang.toLowerCase()
  const privacyUrl = `/${currentLangLower}/${LEGAL_SLUGS.privacy[currentLangLower] || LEGAL_SLUGS.privacy.fr}`
  const termsUrl = `/${currentLangLower}/${LEGAL_SLUGS.terms[currentLangLower] || LEGAL_SLUGS.terms.fr}`
  const cookiesUrl = `/${currentLangLower}/${LEGAL_SLUGS.cookies[currentLangLower] || LEGAL_SLUGS.cookies.fr}`

  const handleNavigate = (page: Page) => {
    const url = getPageUrl(page, lang)
    window.location.href = url
  }

  return (
    <footer style={{ backgroundColor: "#003366" }} className="text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 lg:grid-cols-5 gap-x-6 gap-y-10">
          {/* Brand (Column 1) */}
          <div className="col-span-2 md:col-span-12 lg:col-span-1.5 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <ApticLogo variant="footer" lang={safeLang} />
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-5 max-w-xs">
                {t.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              {[
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/ApticRural",
                  icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/le-tic-rural/",
                  icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
                },
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/apticr/",
                  icon: "M8 2.1A5.9 5.9 0 002.1 8v8A5.9 5.9 0 008 21.9h8A5.9 5.9 0 0021.9 16V8A5.9 5.9 0 0016 2.1H8zm0 2h8A3.9 3.9 0 0119.9 8v8A3.9 3.9 0 0116 19.9H8A3.9 3.9 0 014.1 16V8A3.9 3.9 0 018 4.1zM12 7a5 5 0 100 10A5 5 0 0012 7zm0 2a3 3 0 110 6 3 3 0 010-6zm5.2-2.5a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z",
                },
                {
                  label: "WhatsApp",
                  href: "https://wa.me/22891201990",
                  icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-[#003366] text-white"
                  aria-label={s.label}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: L'Organisation */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#28A745]">
              {safeLang === "FR" ? "L'Organisation" : safeLang === "DE" ? "Organisation" : "Organization"}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {ORG_NAV.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigate(item.page)}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: S'engager */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#28A745]">
              {n.getInvolved}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {ENGAGEMENT_NAV.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigate(item.page)}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Ressources */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#28A745]">
              {safeLang === "FR" ? "Ressources" : safeLang === "DE" ? "Ressourcen" : "Resources"}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {RESOURCES_NAV.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigate(item.page)}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Territoire */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#28A745]">
              {t.contact}
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li>
                <span className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                  {safeLang === "FR" ? "Siège & Territoire" : safeLang === "DE" ? "Sitz & Region" : "Headquarters & Region"}
                </span>
                <span className="text-gray-300">
                  {safeLang === "DE" ? "Agbélouvé, Region Maritime, Togo" : safeLang === "EN" ? "Agbélouvé, Maritime Region, Togo" : "Agbélouvé, Région Maritime, Togo"}
                </span>
              </li>
              <li>
                <span className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                  {safeLang === "FR" ? "Tél. & WhatsApp" : safeLang === "DE" ? "Tel. & WhatsApp" : "Phone & WhatsApp"}
                </span>
                <a
                  href="https://wa.me/22891201990"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-white hover:text-[#28A745] transition-colors"
                >
                  +228 91 20 19 90
                </a>
              </li>
              <li>
                <span className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                  {safeLang === "FR" ? "Email officiel" : safeLang === "DE" ? "Offizielle E-Mail" : "Official Email"}
                </span>
                <a
                  href="mailto:aptic.rural19@gmail.com"
                  className="font-mono text-white hover:text-[#28A745] transition-colors break-all"
                >
                  aptic.rural19@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Languages & Legal */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "#6A7A8A",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-500">{t.languages} :</span>
            <div className="flex gap-2">
              {[
                { code: "FR", label: "Français" },
                { code: "EN", label: "English" },
                { code: "DE", label: "Deutsch" },
              ].map((l) => (
                <span
                  key={l.code}
                  className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#9AA8B4",
                  }}
                >
                  <span className="font-mono text-[10px] text-gray-400 font-bold">
                    {l.code}
                  </span>
                  <span>{l.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "#6A7A8A",
          }}
        >
          <p>{t.copyright}</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              href={privacyUrl}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              {t.privacy}
            </Link>
            <Link
              href={termsUrl}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              {t.terms}
            </Link>
            <Link
              href={cookiesUrl}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              {t.cookies}
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open_cookie_preferences"))
                }
              }}
              className="hover:text-gray-300 transition-colors cursor-pointer"
            >
              {lang === "DE"
                ? "Cookie-Einstellungen"
                : lang === "EN"
                ? "Cookie settings"
                : "Gérer mes cookies"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
