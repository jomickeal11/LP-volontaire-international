import { normalizeAdminRole, requireAdminPagePermission } from "@/lib/access-control"
import AdminDashboardClientWrapper from "./AdminDashboardClientWrapper"
import { getDashboardStats } from "@/lib/dashboard"
import { requireAccount } from "@/lib/account"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await requireAdminPagePermission("dashboard:read")

  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"
  const role = normalizeAdminRole(session.role)
  if (role !== "SUPER_ADMIN") {
    const contentAdmin = role === "CONTENT_ADMIN"
    const links = contentAdmin
      ? [{ label: lang === "en" ? "Articles and news" : lang === "de" ? "Artikel und Neuigkeiten" : "Articles et actualités", href: "/backoffice/articles" }, { label: lang === "en" ? "Projects and events" : lang === "de" ? "Projekte und Veranstaltungen" : "Projets et événements", href: "/backoffice/projects" }, { label: lang === "en" ? "Newsletter campaigns" : lang === "de" ? "Newsletter-Kampagnen" : "Campagnes newsletter", href: "/backoffice/newsletter/campaigns" }]
      : [{ label: lang === "en" ? "Applications" : lang === "de" ? "Bewerbungen" : "Candidatures", href: "/backoffice/applications" }, { label: lang === "en" ? "Partnership requests" : lang === "de" ? "Partnerschaftsanfragen" : "Demandes de partenariat", href: "/backoffice/partners/requests" }, { label: lang === "en" ? "Project proposals" : lang === "de" ? "Projektvorschläge" : "Propositions de projets", href: "/backoffice/project-proposals" }, { label: lang === "en" ? "Contact messages" : lang === "de" ? "Kontakt-Nachrichten" : "Messages de contact", href: "/backoffice/messages" }]
    return <section className="mx-auto max-w-5xl space-y-6"><header><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">APTIC-R</p><h1 className="mt-1 text-2xl font-bold text-[#003366]">{lang === "en" ? "Your workspace" : lang === "de" ? "Ihr Arbeitsbereich" : "Votre espace de travail"}</h1><p className="mt-2 text-sm text-slate-600">{contentAdmin ? (lang === "en" ? "Editorial tools available for your role." : lang === "de" ? "Für Ihre Rolle verfügbare redaktionelle Werkzeuge." : "Les outils éditoriaux accessibles selon votre rôle.") : (lang === "en" ? "Request handling tools available for your role." : lang === "de" ? "Für Ihre Rolle verfügbare Vorgangswerkzeuge." : "Les outils de traitement accessibles selon votre rôle.")}</p></header><div className="grid gap-4 sm:grid-cols-2">{links.map((link) => <a key={link.href} href={link.href} className="rounded-xl border border-slate-200 bg-white p-5 font-semibold text-[#003366] shadow-sm transition hover:border-blue-300 hover:shadow">{link.label}<span className="float-right" aria-hidden="true">→</span></a>)}</div></section>
  }
  const data = await getDashboardStats(lang)

  return <AdminDashboardClientWrapper data={data} lang={lang} />
}
