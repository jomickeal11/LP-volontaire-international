import { useState } from "react"
import type { Page, Language } from "../types"

interface PartnerPageProps {
  lang: Language
  navigate: (p: Page) => void
}

const BLUE = "#1B4F7C"
const GREEN = "#2E7D52"
const BG = "#F4F6F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
        {label}
        {required && (
          <span style={{ color: "#DC2626" }} className="ml-0.5">
            *
          </span>
        )}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{
          border: "1.5px solid #D1DCE5",
          backgroundColor: "#fff",
          color: TEXT_DARK,
        }}
        onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${BLUE}`)}
        onBlur={(e) => (e.currentTarget.style.border = "1.5px solid #D1DCE5")}
      />
    </div>
  )
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
        style={{
          border: "1.5px solid #D1DCE5",
          backgroundColor: "#fff",
          color: value ? TEXT_DARK : "#9AA8B4",
        }}
        onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${BLUE}`)}
        onBlur={(e) => (e.currentTarget.style.border = "1.5px solid #D1DCE5")}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function PartnerPage({ navigate }: PartnerPageProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    orgName: "",
    country: "",
    website: "",
    contactPerson: "",
    email: "",
    orgType: "",
    volunteerCount: "",
    targetCountries: "",
    programme: "",
    message: "",
    docFile: "",
    consent: false,
  })

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    const { submitPartnerRequest } = await import("../lib/actions")
    await submitPartnerRequest({
      orgName: form.orgName || "Organisation",
      country: form.country || "France",
      website: form.website || undefined,
      contactPerson: form.contactPerson || "Contact",
      email: form.email || "contact@example.org",
      orgType: form.orgType || "NGO / Association",
      volunteerCount: form.volunteerCount,
      targetCountries: form.targetCountries,
      programme: form.programme,
      message: form.message || "Demande de partenariat avec APTIC-R",
      docFile: form.docFile,
      consent: form.consent,
    })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-24"
        style={{ paddingTop: 100, backgroundColor: BG }}
      >
        <div className="max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#E6F4EC", border: `3px solid ${GREEN}` }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: GREEN }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1
            className="text-3xl mb-4"
            style={{
              fontFamily: "DM Serif Display, Georgia, serif",
              color: TEXT_DARK,
            }}
          >
            Partnership request sent.
          </h1>
          <p className="text-base mb-2" style={{ color: TEXT_MID }}>
            Thank you, <strong>{form.orgName}</strong>! Your partnership request
            has been received by APTIC-R.
          </p>
          <p className="text-sm mb-8" style={{ color: "#9AA8B4" }}>
            We will review your enquiry and respond to{" "}
            <strong>{form.email}</strong> within 5 business days.
          </p>
          <button
            onClick={() => navigate("home")}
            className="font-semibold text-sm px-6 py-3 rounded-lg text-white transition-colors"
            style={{ backgroundColor: BLUE }}
          >
            Back to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div
        className="relative py-16 lg:py-24 overflow-hidden"
        style={{ backgroundColor: BLUE }}
      >
        <img
          src="https://images.unsplash.com/photo-1722481748713-76be8905d29a?w=1920&h=400&fit=crop&auto=format"
          alt="Group of people, West Africa community"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            For Organizations
          </div>
          <h1
            className="text-4xl lg:text-5xl text-white mb-4"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            Are you a volunteer-sending organization?
          </h1>
          <p
            className="text-lg max-w-2xl"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            APTIC-R is seeking European organizations interested in developing
            long-term volunteer partnerships in Togo. Let's build something
            meaningful together.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar info */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                backgroundColor: "#E8F2FA",
                border: `1.5px solid ${BLUE}20`,
              }}
            >
              <h3 className="text-base mb-4" style={{ color: TEXT_DARK }}>
                Why partner with APTIC-R?
              </h3>
              <ul className="flex flex-col gap-3.5">
                {[
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        style={{ color: BLUE }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                        <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
                        <circle cx="12" cy="12" r="2" strokeWidth={1.5} />
                      </svg>
                    ),
                    text: "Structured 6–12 month missions with clear objectives",
                  },
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        style={{ color: BLUE }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                        <path
                          strokeWidth={1.5}
                          d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                        />
                      </svg>
                    ),
                    text: "Meaningful field experience in West Africa",
                  },
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        style={{ color: BLUE }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                        />
                        <circle cx="9" cy="7" r="4" strokeWidth={1.5} />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                        />
                      </svg>
                    ),
                    text: "Long-term institutional partnership",
                  },
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        style={{ color: BLUE }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    ),
                    text: "Transparent reporting and follow-up",
                  },
                  {
                    icon: (
                      <svg
                        className="w-4 h-4"
                        style={{ color: BLUE }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    ),
                    text: "Open-source documentation of all projects",
                  },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex gap-3 items-start text-sm"
                    style={{ color: TEXT_MID }}
                  >
                    <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: BG, border: "1.5px solid #E8ECF2" }}
            >
              <h3 className="text-base mb-3" style={{ color: TEXT_DARK }}>
                Frameworks we work with
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "weltwärts",
                  "France Volontaires",
                  "Corps de solidarité européen",
                  "SCI",
                  "Universities",
                  "NGOs",
                ].map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2.5 py-1 rounded-md font-medium"
                    style={{ backgroundColor: "#E8F2FA", color: BLUE }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl p-6 lg:p-8"
              style={{
                boxShadow: "0 2px 24px rgba(27,79,124,0.07)",
                border: "1px solid #E8ECF2",
              }}
            >
              <h2 className="text-xl mb-6" style={{ color: TEXT_DARK }}>
                Partnership Request Form
              </h2>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Organization name"
                    value={form.orgName}
                    onChange={(v) => set("orgName", v)}
                    required
                    placeholder="Organisation de Volontaires XYZ"
                  />
                  <SelectField
                    label="Country"
                    value={form.country}
                    onChange={(v) => set("country", v)}
                    options={[
                      "France",
                      "Germany",
                      "Belgium",
                      "Switzerland",
                      "Netherlands",
                      "Austria",
                      "Sweden",
                      "Denmark",
                      "Norway",
                      "Spain",
                      "Italy",
                      "Portugal",
                      "Poland",
                      "Other EU",
                      "Non-EU",
                    ]}
                  />
                  <Field
                    label="Website"
                    type="url"
                    value={form.website}
                    onChange={(v) => set("website", v)}
                    placeholder="https://example.org"
                  />
                  <Field
                    label="Contact person"
                    value={form.contactPerson}
                    onChange={(v) => set("contactPerson", v)}
                    required
                    placeholder="Jean Dupont"
                  />
                  <Field
                    label="Professional email"
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    required
                    placeholder="contact@organisation.org"
                  />
                  <SelectField
                    label="Type of organization"
                    value={form.orgType}
                    onChange={(v) => set("orgType", v)}
                    options={[
                      "NGO / Association",
                      "University",
                      "Government agency",
                      "European programme body",
                      "Religious organization",
                      "Other",
                    ]}
                  />
                  <SelectField
                    label="Potential number of volunteers per year"
                    value={form.volunteerCount}
                    onChange={(v) => set("volunteerCount", v)}
                    options={[
                      "1–2",
                      "3–5",
                      "5–10",
                      "10+",
                      "Unknown at this stage",
                    ]}
                  />
                  <Field
                    label="Target countries of volunteers"
                    value={form.targetCountries}
                    onChange={(v) => set("targetCountries", v)}
                    placeholder="France, Germany, Belgium..."
                  />
                </div>

                <SelectField
                  label="Volunteer programme / framework"
                  value={form.programme}
                  onChange={(v) => set("programme", v)}
                  options={[
                    "weltwärts",
                    "France Volontaires",
                    "Corps de solidarité européen",
                    "Agir abcd",
                    "SCI",
                    "Internal programme",
                    "University programme",
                    "Other",
                  ]}
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: TEXT_DARK }}
                  >
                    Message
                  </label>
                  <textarea
                    placeholder="Tell us about your organization, your experience sending volunteers to West Africa, and how you envision a partnership with APTIC-R..."
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
                    style={{
                      border: "1.5px solid #D1DCE5",
                      backgroundColor: "#fff",
                      color: TEXT_DARK,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `1.5px solid ${BLUE}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = "1.5px solid #D1DCE5")
                    }
                  />
                </div>

                {/* Document upload */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: TEXT_DARK }}
                  >
                    Presentation document{" "}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "#9AA8B4" }}
                    >
                      — optional
                    </span>
                  </label>
                  {form.docFile ? (
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: "#E6F4EC",
                        border: "1.5px solid #A7D9BC",
                      }}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: GREEN }}
                      >
                        ✓ {form.docFile}
                      </span>
                      <button
                        onClick={() => set("docFile", "")}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ color: "#DC2626", backgroundColor: "#FEE2E2" }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label
                      className="flex items-center justify-center gap-3 px-4 py-5 rounded-lg cursor-pointer"
                      style={{
                        border: "2px dashed #D1DCE5",
                        backgroundColor: BG,
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: "#9AA8B4" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm" style={{ color: TEXT_MID }}>
                        Upload organization brochure or presentation
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) set("docFile", f.name)
                        }}
                      />
                    </label>
                  )}
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "#E8F2FA",
                    border: `1.5px solid ${BLUE}30`,
                  }}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                      className="mt-0.5 flex-shrink-0"
                      style={{ accentColor: BLUE, width: 16, height: 16 }}
                    />
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: TEXT_MID }}
                    >
                      I consent to APTIC-R processing the information provided
                      above for the purpose of evaluating a potential
                      partnership. Our organization has the authority to submit
                      this enquiry. I have read the{" "}
                      <button className="underline" style={{ color: BLUE }}>
                        privacy policy
                      </button>
                      .
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-xl text-white transition-all"
                  style={{
                    backgroundColor: loading ? "#9AA8B4" : BLUE,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending request...
                    </>
                  ) : (
                    "SEND PARTNERSHIP REQUEST →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
