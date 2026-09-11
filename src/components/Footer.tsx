import type { Page, Language } from "../types"
import Image from "next/image"
import translations from "../i18n/translations"

interface FooterProps {
  lang: Language
  navigate: (p: Page) => void
}

export default function Footer({ lang, navigate }: FooterProps) {
  const currentLang = (lang || "FR").toUpperCase() as keyof typeof translations
  const safeLang = translations[currentLang] ? currentLang : "FR"
  const t = translations[safeLang].footer

  const FOOTER_NAV = [
    { label: translations[safeLang].nav.about, page: "home" as Page },
    { label: translations[safeLang].nav.mission, page: "home" as Page },
    { label: translations[safeLang].nav.apply, page: "apply" as Page },
    { label: translations[safeLang].nav.partners, page: "partner" as Page },
    { label: translations[safeLang].nav.faq, page: "home" as Page },
  ]

  return (
    <footer style={{ backgroundColor: "#142332" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white shrink-0 shadow-sm">
                <Image src="/aptic-logo.png" alt="APTIC-R Logo" width={40} height={40} className="w-full h-full object-contain p-0.5" />
              </div>
              <div>
                <div className="font-bold text-lg text-white leading-none">
                  APTIC-R
                </div>
                <div
                  className="text-xs uppercase tracking-wider mt-1"
                  style={{ color: "#7A8A9A" }}
                >
                  International Volunteers
                </div>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-2"
              style={{ color: "#9AA8B4", maxWidth: 360 }}
            >
              {t.tagline}
            </p>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#7A8A9A", maxWidth: 360 }}
            >
              {t.tagline2}
            </p>
            <div className="flex items-center gap-3">
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
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#174F7A")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.06)")
                  }
                  aria-label={s.label}
                  title={`Suivre APTIC-R sur ${s.label}`}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "#7A8A9A" }}
            >
              {t.nav}
            </h4>
            <ul className="space-y-3">
              {FOOTER_NAV.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page)}
                    className="text-sm transition-colors text-left cursor-pointer"
                    style={{ color: "#9AA8B4" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9AA8B4")
                    }
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Language */}
          <div>
            <h4
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "#7A8A9A" }}
            >
              {t.contact}
            </h4>
            <ul className="space-y-3 mb-6">
              <li className="text-sm" style={{ color: "#9AA8B4" }}>
                <span
                  className="block text-xs uppercase tracking-wide mb-0.5"
                  style={{ color: "#6A7A8A" }}
                >
                  {t.email}
                </span>
                <a
                  href={`mailto:${t.emailValue}`}
                  className="font-mono text-xs hover:text-white transition-colors underline decoration-slate-600 underline-offset-2"
                >
                  {t.emailValue}
                </a>
              </li>
              {(t as any).phone && (t as any).phoneValue && (
                <li className="text-sm" style={{ color: "#9AA8B4" }}>
                  <span
                    className="block text-xs uppercase tracking-wide mb-0.5"
                    style={{ color: "#6A7A8A" }}
                  >
                    {(t as any).phone}
                  </span>
                  <a
                    href={`tel:${((t as any).phoneValue as string).replace(/\s+/g, "")}`}
                    className="font-mono text-xs hover:text-white transition-colors underline decoration-slate-600 underline-offset-2"
                  >
                    {(t as any).phoneValue}
                  </a>
                </li>
              )}
              <li className="text-sm" style={{ color: "#9AA8B4" }}>
                <span
                  className="block text-xs uppercase tracking-wide mb-0.5"
                  style={{ color: "#6A7A8A" }}
                >
                  {t.address}
                </span>
                {t.addressValue}
              </li>
            </ul>

            <h4
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: "#7A8A9A" }}
            >
              {t.languages}
            </h4>
            <div className="flex gap-2 flex-wrap">
              {[
                { code: "FR", label: "Français" },
                { code: "EN", label: "English" },
                { code: "DE", label: "Deutsch" },
              ].map((l) => (
                <span
                  key={l.code}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md"
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
          <div className="flex gap-6">
            <button className="hover:text-gray-300 transition-colors cursor-pointer">
              {t.privacy}
            </button>
            <button className="hover:text-gray-300 transition-colors cursor-pointer">
              {t.terms}
            </button>
            <button className="hover:text-gray-300 transition-colors cursor-pointer">
              {t.cookies}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
