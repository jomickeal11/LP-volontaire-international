import { cookies } from "next/headers"

export default async function ProjectProposalsLoading() {
  const locale = (await cookies()).get("NEXT_LOCALE")?.value?.toLowerCase()
  const label = locale === "en"
    ? "Loading project proposals…"
    : locale === "de"
      ? "Projektvorschläge werden geladen…"
      : "Chargement des propositions de projets…"

  return (
    <div className="flex min-h-64 items-center justify-center" role="status" aria-label={label}>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#007BFF]" aria-hidden="true" />
        {label}
      </div>
    </div>
  )
}
