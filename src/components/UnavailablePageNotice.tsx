import type { Language } from "@/types"
import { unavailablePageMessage } from "@/lib/page-publication"

export default function UnavailablePageNotice({ lang }: { lang: Language }) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-5 py-20 text-center">
      <p className="max-w-xl text-base leading-relaxed text-slate-600">
        {unavailablePageMessage(lang)}
      </p>
    </section>
  )
}