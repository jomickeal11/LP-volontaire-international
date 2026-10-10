import type { Metadata } from "next"
import NewsletterUnsubscribeForm from "./[token]/unsubscribe-form"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Désinscription newsletter | APTIC-R",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default async function NewsletterUnsubscribeLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const normalizedLang = ["EN", "DE"].includes(lang.toUpperCase()) ? lang.toUpperCase() : "FR"

  return (
    <main className="min-h-[70vh] bg-[#F7F8FA] px-5 py-16">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <NewsletterUnsubscribeForm lang={normalizedLang as "FR" | "EN" | "DE"} token={null} />
      </section>
    </main>
  )
}
