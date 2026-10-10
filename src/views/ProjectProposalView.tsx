"use client"

import { useState, type FormEvent, type FormEventHandler } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import Footer from "@/components/Footer"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import { getPageUrl, type Language, type Page } from "@/types"
import { uploadPrivateFile } from "@/lib/upload-client"
import { submitProjectProposalFormData } from "@/lib/actions"

const COPY = {
  FR: {
    eyebrow: "Projets & collaborations",
    title: "Proposer un projet",
    intro: "Présentez votre initiative ou une collaboration envisagée avec APTIC-R. Chaque proposition est étudiée par notre équipe ; l’envoi ne vaut ni acceptation ni engagement de financement.",
    required: "Champs obligatoires",
    optional: "Optionnel",
    proposerName: "Nom du porteur ou de la porteuse",
    organization: "Organisation",
    email: "Adresse e-mail professionnelle",
    country: "Pays",
    titleField: "Titre du projet",
    domain: "Domaine du projet",
    description: "Description du projet",
    objectives: "Objectifs",
    targetAudience: "Public cible et bénéficiaires",
    expectedResults: "Résultats attendus",
    collaboration: "Type de collaboration souhaitée",
    timeline: "Durée ou calendrier envisagé",
    budget: "Budget estimatif ou besoins de financement",
    message: "Message complémentaire",
    document: "Document de présentation",
    fileHelp: "PDF, DOC, DOCX, ODT, PPT, PPTX, JPG ou PNG — 15 Mo maximum.",
    consent: "J’accepte le traitement des informations fournies afin que l’équipe APTIC-R puisse examiner cette proposition.",
    submit: "Envoyer la proposition",
    submitting: "Envoi en cours…",
    back: "Retour aux projets",
    success: "Votre proposition a bien été enregistrée.",
    reference: "Référence",
    error: "L’envoi a échoué. Vérifiez les informations et réessayez.",
    uploadError: "Le document n’a pas pu être téléversé.",
    successNote: "Notre équipe étudiera votre proposition. Cet accusé de réception ne constitue pas une promesse de financement ou d’acceptation.",
  },
  EN: {
    eyebrow: "Projects & collaboration",
    title: "Propose a project",
    intro: "Tell us about your initiative or a possible collaboration with APTIC-R. Our team will review every proposal; submission does not imply acceptance or a funding commitment.",
    required: "Required fields",
    optional: "Optional",
    proposerName: "Project lead’s name",
    organization: "Organization",
    email: "Professional email address",
    country: "Country",
    titleField: "Project title",
    domain: "Project field",
    description: "Project description",
    objectives: "Objectives",
    targetAudience: "Target audience and beneficiaries",
    expectedResults: "Expected results",
    collaboration: "Preferred type of collaboration",
    timeline: "Proposed duration or timeline",
    budget: "Estimated budget or funding needs",
    message: "Additional message",
    document: "Presentation document",
    fileHelp: "PDF, DOC, DOCX, ODT, PPT, PPTX, JPG or PNG — up to 15 MB.",
    consent: "I agree to the processing of the information provided so the APTIC-R team can review this proposal.",
    submit: "Submit proposal",
    submitting: "Submitting…",
    back: "Back to projects",
    success: "Your proposal has been recorded.",
    reference: "Reference",
    error: "Submission failed. Check the information and try again.",
    uploadError: "The document could not be uploaded.",
    successNote: "Our team will review your proposal. This acknowledgement is not a promise of funding or acceptance.",
  },
  DE: {
    eyebrow: "Projekte & Zusammenarbeit",
    title: "Projekt vorschlagen",
    intro: "Stellen Sie Ihre Initiative oder eine mögliche Zusammenarbeit mit APTIC-R vor. Unser Team prüft jeden Vorschlag; die Einreichung bedeutet weder Annahme noch eine Finanzierungszusage.",
    required: "Pflichtfelder",
    optional: "Optional",
    proposerName: "Name der Projektleitung",
    organization: "Organisation",
    email: "Geschäftliche E-Mail-Adresse",
    country: "Land",
    titleField: "Projekttitel",
    domain: "Projektbereich",
    description: "Projektbeschreibung",
    objectives: "Ziele",
    targetAudience: "Zielgruppe und Begünstigte",
    expectedResults: "Erwartete Ergebnisse",
    collaboration: "Gewünschte Art der Zusammenarbeit",
    timeline: "Geplante Dauer oder Zeitplan",
    budget: "Geschätztes Budget oder Finanzierungsbedarf",
    message: "Zusätzliche Nachricht",
    document: "Präsentationsdokument",
    fileHelp: "PDF, DOC, DOCX, ODT, PPT, PPTX, JPG oder PNG — maximal 15 MB.",
    consent: "Ich stimme der Verarbeitung meiner Angaben zu, damit das APTIC-R-Team diesen Vorschlag prüfen kann.",
    submit: "Vorschlag senden",
    submitting: "Wird gesendet…",
    back: "Zurück zu den Projekten",
    success: "Ihr Vorschlag wurde gespeichert.",
    reference: "Referenz",
    error: "Senden fehlgeschlagen. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.",
    uploadError: "Das Dokument konnte nicht hochgeladen werden.",
    successNote: "Unser Team wird Ihren Vorschlag prüfen. Diese Bestätigung ist keine Finanzierungs- oder Annahmezusage.",
  },
} as const

type FieldName =
  | "proposerName"
  | "organization"
  | "email"
  | "country"
  | "titleField"
  | "domain"
  | "description"
  | "objectives"
  | "targetAudience"
  | "expectedResults"
  | "collaboration"
  | "timeline"
  | "budget"
  | "message"

const requiredFields: FieldName[] = [
  "proposerName", "email", "country", "titleField", "domain", "description",
  "objectives", "targetAudience", "expectedResults", "collaboration", "timeline",
]

const requiredMinLength: Partial<Record<FieldName, number>> = {
  proposerName: 2,
  country: 2,
  titleField: 3,
  domain: 2,
  description: 30,
  objectives: 10,
  targetAudience: 5,
  expectedResults: 10,
  collaboration: 2,
  timeline: 2,
}

const longFields = new Set<FieldName>([
  "description", "objectives", "targetAudience", "expectedResults", "budget", "message",
])

export default function ProjectProposalView({ lang }: { lang: Language }) {
  const router = useRouter()
  const t = COPY[lang]
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [reference, setReference] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [formIsValid, setFormIsValid] = useState(false)

  const navigate = (page: Page) => router.push(getPageUrl(page, lang))
  const changeLanguage = (next: Language) => router.push(`/${next.toLowerCase()}/projets/proposer`)
  const updateFormValidity: FormEventHandler<HTMLFormElement> = (event) => {
    setFormIsValid(event.currentTarget.checkValidity())
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setError("")
    setPending(true)
    try {
      const formData = new FormData(form)
      formData.delete("documentFile")
      formData.append("consent", String(formData.get("consent") === "on"))
      if (file) {
        const upload = await uploadPrivateFile(file, "project-proposal-doc")
        if (!upload.success) {
          setError(upload.error || t.uploadError)
          return
        }
        formData.append("document", JSON.stringify({
          storageKey: upload.key,
          originalName: file.name,
          mimeType: upload.mimeType || file.type,
        }))
      }
      const result = await submitProjectProposalFormData(formData, lang)
      if (!result.success) {
        setError(result.error || t.error)
        return
      }
      setReference(result.referenceNumber)
      form.reset()
      setFile(null)
      setFormIsValid(false)
    } catch (submitError) {
      console.error("Project proposal submission failed:", submitError)
      setError(t.error)
    } finally {
      setPending(false)
    }
  }

  const field = (name: FieldName) => {
    const required = requiredFields.includes(name)
    const label = name === "titleField" ? t.titleField : t[name]
    const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#007BFF] focus:ring-2 focus:ring-blue-100"
    return (
      <label key={name} className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[#18344F]">
          {label} {!required && <span className="font-normal text-slate-400">({t.optional})</span>}
          {required && <span className="text-red-600"> *</span>}
        </span>
        {longFields.has(name) ? (
          <textarea
            name={name === "titleField" ? "title" : name}
            required={required}
            minLength={requiredMinLength[name]}
            maxLength={name === "description" ? 8000 : 5000}
            rows={name === "description" ? 5 : 4}
            className={inputClass}
          />
        ) : (
          <input
            name={name === "titleField" ? "title" : name}
            type={name === "email" ? "email" : "text"}
            required={required}
            minLength={requiredMinLength[name]}
            maxLength={name === "email" ? 254 : 180}
            className={inputClass}
          />
        )}
      </label>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <PageHeader
        mode={getHeaderMode(ROUTES.projectsList)}
        lang={lang}
        setLang={changeLanguage}
        currentPage="projects"
        navigate={navigate}
      />
      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href={getPageUrl("projects", lang)} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#315A7D] hover:text-[#007BFF]">
            <span aria-hidden="true">←</span> {t.back}
          </Link>

          {reference ? (
            <section className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm sm:p-12" role="status">
              <span className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">{t.eyebrow}</span>
              <h1 className="text-3xl font-bold tracking-tight text-[#003366] sm:text-4xl">{t.success}</h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">{t.successNote}</p>
              <p className="mt-6 text-sm font-semibold text-[#18344F]">{t.reference}: <span className="font-mono">{reference}</span></p>
              <Link href={getPageUrl("projects", lang)} className="mt-8 inline-flex rounded-xl bg-[#003366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#007BFF]">{t.back}</Link>
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#28A745]">{t.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#003366] sm:text-4xl">{t.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{t.intro}</p>
              <p className="mt-5 text-xs text-slate-500">{t.required} <span className="text-red-600">*</span> · {t.optional}</p>

              <form onInput={updateFormValidity} onChange={updateFormValidity} onSubmit={onSubmit} className="mt-8 space-y-6">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[10000px] h-px w-px opacity-0" />
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("proposerName")}
                  {field("organization")}
                  {field("email")}
                  {field("country")}
                  {field("titleField")}
                  {field("domain")}
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  {field("description")}
                  {field("objectives")}
                  {field("targetAudience")}
                  {field("expectedResults")}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("collaboration")}
                  {field("timeline")}
                  {field("budget")}
                  {field("message")}
                </div>

                <label className="flex flex-col gap-2 text-sm font-semibold text-[#18344F]">
                  {t.document} <span className="font-normal text-slate-400">({t.optional})</span>
                  <input
                    name="documentFile"
                    type="file"
                    accept=".pdf,.doc,.docx,.odt,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={(event) => setFile(event.currentTarget.files?.[0] || null)}
                    className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-[#003366]"
                  />
                  <span className="text-xs font-normal text-slate-500">{t.fileHelp}</span>
                </label>

                <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#007BFF]" />
                  <span>{t.consent} <span className="text-red-600">*</span></span>
                </label>

                {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}

                <button
                  type="submit"
                  disabled={pending || !formIsValid}
                  className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition sm:w-auto ${
                    pending || !formIsValid
                      ? "cursor-not-allowed bg-slate-300 text-slate-500"
                      : "bg-[#007BFF] text-white hover:bg-[#003366]"
                  }`}
                >
                  {pending ? t.submitting : t.submit}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
      <Footer lang={lang} navigate={navigate} />
    </div>
  )
}
