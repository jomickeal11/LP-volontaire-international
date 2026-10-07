"use client"

import { useState, useMemo, useCallback, useEffect, useTransition } from "react"
import {
  PUBLIC_PAGES,
  normalizeCampaignSlug,
  buildCampaignUrl,
} from "@/lib/campaign-utils"
import {
  createCampaignLink,
  deleteLienCampagne,
  type SavedCampaignLink,
} from "@/lib/campaign-actions"
import { getSiteUrl } from "@/lib/seo"

// ─── Constantes ───────────────────────────────────────────────────────────────

const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : getSiteUrl()

/** Suggestions datalist pour le canal de diffusion */
const CHANNEL_SUGGESTIONS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Google",
  "WhatsApp",
  "Newsletter",
  "Site partenaire",
  "QR Code",
  "TikTok",
  "YouTube",
  "Twitter / X",
]

/** Suggestions datalist pour le nom de campagne */
const CAMPAIGN_SUGGESTIONS = [
  "Recrutement volontaires",
  "Recrutement volontaires octobre 2026",
  "Campagne partenaires",
  "Promotion événement",
  "Newsletter",
  "Communication institutionnelle",
  "Appel à candidatures",
]

/** Suggestions datalist pour le contenu */
const CONTENT_SUGGESTIONS = [
  "Vidéo",
  "Image",
  "Publication",
  "Story",
  "Annonce",
  "Bannière",
  "Article",
  "Flyer",
]

/** Suggestions datalist pour utm_term */
const TERM_SUGGESTIONS = [
  "volontariat Togo",
  "service civique international",
  "bénévolat international",
  "volontariat Afrique",
  "mission humanitaire",
]

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Traduit une valeur saisie librement par l'utilisateur vers
 * utm_source + utm_medium cohérents.
 */
function inferUtmFromChannel(channelInput: string): {
  utmSource: string
  utmMedium: string
} {
  const v = channelInput.trim().toLowerCase()

  const knownMap: Record<string, { utmSource: string; utmMedium: string }> = {
    facebook:          { utmSource: "facebook",   utmMedium: "social" },
    instagram:         { utmSource: "instagram",  utmMedium: "social" },
    linkedin:          { utmSource: "linkedin",   utmMedium: "social" },
    google:            { utmSource: "google",     utmMedium: "cpc" },
    whatsapp:          { utmSource: "whatsapp",   utmMedium: "messaging" },
    newsletter:        { utmSource: "newsletter", utmMedium: "email" },
    "site partenaire": { utmSource: "partenaire", utmMedium: "referral" },
    "qr code":         { utmSource: "qrcode",     utmMedium: "offline" },
    qrcode:            { utmSource: "qrcode",     utmMedium: "offline" },
    tiktok:            { utmSource: "tiktok",     utmMedium: "social" },
    youtube:           { utmSource: "youtube",    utmMedium: "social" },
    "twitter / x":     { utmSource: "twitter",    utmMedium: "social" },
    twitter:           { utmSource: "twitter",    utmMedium: "social" },
  }

  if (knownMap[v]) return knownMap[v]

  // Valeur libre : on normalise comme source, medium = "other"
  return {
    utmSource: normalizeCampaignSlug(channelInput) || "autre",
    utmMedium: "other",
  }
}

function formatDateFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ─── Bouton Copier ─────────────────────────────────────────────────────────────

function CopyButton({ url, variant = "primary" }: { url: string; variant?: "primary" | "small" }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement("textarea")
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (variant === "small") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
          copied
            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
            : "bg-white border-slate-200 text-slate-600 hover:border-[#003366] hover:text-[#003366]"
        }`}
      >
        {copied ? "✓ Copié" : "Copier"}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        copied
          ? "bg-emerald-600 text-white"
          : "bg-[#003366] text-white hover:bg-[#002244]"
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Lien copié
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copier le lien
        </>
      )}
    </button>
  )
}

// ─── Indicateur d'étapes ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? "bg-[#003366] w-6"
              : i === current
              ? "bg-[#007BFF] w-6"
              : "bg-slate-200 w-3"
          }`}
        />
      ))}
      <span className="text-[11px] text-slate-400 ml-1 font-medium">
        {current + 1} / {total}
      </span>
    </div>
  )
}

// ─── Modale ────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4

interface ModalProps {
  onClose: () => void
  onCreated: (link: SavedCampaignLink) => void
}

function CampaignModal({ onClose, onCreated }: ModalProps) {
  const [step, setStep]                   = useState(0)
  const [destinationPath, setDest]        = useState("/volontariat")
  const [channelInput, setChannelInput]   = useState("")
  const [campaignName, setCampaignName]   = useState("")
  const [utmContent, setUtmContent]       = useState("")
  const [showAdvanced, setShowAdvanced]   = useState(false)
  const [utmTerm, setUtmTerm]             = useState("")
  const [saveError, setSaveError]         = useState("")
  const [isPending, startTransition]      = useTransition()

  const isDirty = !!(channelInput || campaignName || utmContent)

  // Prévisualisation live de l'URL
  const { utmSource, utmMedium } = useMemo(
    () => inferUtmFromChannel(channelInput),
    [channelInput]
  )

  const previewUrl = useMemo(() => {
    if (!campaignName.trim()) return ""
    const slug = normalizeCampaignSlug(campaignName)
    if (!slug) return ""
    return buildCampaignUrl({
      baseUrl: BASE_URL,
      destinationPath,
      utmSource,
      utmMedium,
      utmCampaign: slug,
      utmContent: utmContent || undefined,
      utmTerm:    utmTerm    || undefined,
    })
  }, [destinationPath, utmSource, utmMedium, campaignName, utmContent, utmTerm])

  // Empêcher fermeture accidentelle si des données ont été saisies
  function handleOverlayClick() {
    if (!isDirty) onClose()
  }

  // Empêcher la fermeture via Escape si dirty
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDirty) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isDirty, onClose])

  const canContinue = [
    !!destinationPath,
    !!channelInput.trim(),
    !!campaignName.trim(),
    true, // étape 4 : toujours valide
  ][step]

  function handleSave() {
    setSaveError("")
    startTransition(async () => {
      const result = await createCampaignLink({
        label: campaignName,
        destinationPath,
        channel: normalizeCampaignSlug(channelInput) || "autre",
        customSource: channelInput,
        campaignName,
        utmContent: utmContent || undefined,
        utmTerm:    utmTerm    || undefined,
        baseUrl: BASE_URL,
      })
      if (result.success && result.data) {
        onCreated({
          id:              result.data.id,
          label:           campaignName,
          destinationPath,
          channel:         channelInput,
          utmCampaign:     result.data.utmCampaign,
          utmContent:      utmContent || null,
          generatedUrl:    result.data.generatedUrl,
          clicks:          0,
          lastClickedAt:   null,
          createdAt:       new Date().toISOString(),
        })
        onClose()
      } else {
        setSaveError(result.error ?? "Erreur inconnue.")
      }
    })
  }

  const destLabel = PUBLIC_PAGES.find((p) => p.path === destinationPath)?.label ?? destinationPath

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={handleOverlayClick}
      />

      {/* Panneau */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Créer un lien de campagne</h2>
            <div className="mt-2">
              <StepIndicator current={step} total={TOTAL_STEPS} />
            </div>
          </div>
          <button
            type="button"
            onClick={isDirty ? undefined : onClose}
            title={isDirty ? "Des informations ont déjà été saisies" : "Fermer"}
            className={`ml-4 rounded-full p-1.5 transition-colors ${
              isDirty
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* ── ÉTAPE 1 : DESTINATION ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-slate-800">
                  Où voulez-vous envoyer les visiteurs ?
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Choisissez la page qu&apos;ils verront après avoir cliqué sur votre lien.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Page de destination
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {PUBLIC_PAGES.map((p) => (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => setDest(p.path)}
                      className={`text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${
                        destinationPath === p.path
                          ? "bg-[#003366] text-white border-[#003366] font-semibold"
                          : "bg-white text-slate-700 border-slate-200 hover:border-[#003366]/40"
                      }`}
                    >
                      {p.label}
                      <span className={`ml-2 text-xs font-mono ${destinationPath === p.path ? "text-blue-200" : "text-slate-400"}`}>
                        {p.path}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : CANAL ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-slate-800">
                  Où allez-vous partager ce lien ?
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Indiquez la plateforme, le canal ou le partenaire où vous publierez ce lien.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="channel-input" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Canal de diffusion
                </label>
                <input
                  id="channel-input"
                  type="text"
                  list="channel-suggestions"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder="ex : Facebook, Newsletter, Université de Lomé…"
                  autoFocus
                  className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/30 focus:border-[#007BFF] placeholder:text-slate-400"
                />
                <datalist id="channel-suggestions">
                  {CHANNEL_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cette information permettra de savoir d&apos;où proviennent les visiteurs.
                  Vous pouvez saisir n&apos;importe quelle valeur, même si elle n&apos;est pas dans la liste.
                </p>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : CAMPAGNE & CONTENU ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-base font-semibold text-slate-800">
                  Comment voulez-vous identifier cette campagne ?
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Choisissez un nom facile à reconnaître plus tard dans vos statistiques.
                </p>
              </div>

              {/* Nom de campagne */}
              <div className="space-y-2">
                <label htmlFor="campaign-name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nom de la campagne
                </label>
                <input
                  id="campaign-name"
                  type="text"
                  list="campaign-suggestions"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="ex : Recrutement volontaires octobre 2026"
                  autoFocus
                  className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/30 focus:border-[#007BFF] placeholder:text-slate-400"
                />
                <datalist id="campaign-suggestions">
                  {CAMPAIGN_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                {campaignName && (
                  <p className="text-[11px] text-slate-400">
                    Identifiant généré :{" "}
                    <code className="text-slate-600 bg-slate-100 px-1 rounded">
                      {normalizeCampaignSlug(campaignName)}
                    </code>
                  </p>
                )}
              </div>

              {/* Contenu */}
              <div className="space-y-2">
                <label htmlFor="utm-content" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Quel contenu utilisez-vous ?{" "}
                  <span className="font-normal text-slate-400 normal-case">(facultatif)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Utile si vous publiez plusieurs visuels ou formats pour la même campagne.
                </p>
                <input
                  id="utm-content"
                  type="text"
                  list="content-suggestions"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="ex : Vidéo témoignage, Flyer forum étudiant…"
                  className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/30 focus:border-[#007BFF] placeholder:text-slate-400"
                />
                <datalist id="content-suggestions">
                  {CONTENT_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Paramètres avancés */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Paramètres avancés
                </button>
                {showAdvanced && (
                  <div className="mt-3 pl-4 border-l-2 border-slate-100 space-y-2">
                    <label htmlFor="utm-term" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Mot-clé{" "}
                      <span className="font-normal text-slate-400 normal-case">(utm_term — facultatif)</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Pour les campagnes de référencement payant : indiquez le mot-clé ciblé.
                    </p>
                    <input
                      id="utm-term"
                      type="text"
                      list="term-suggestions"
                      value={utmTerm}
                      onChange={(e) => setUtmTerm(e.target.value)}
                      placeholder="ex : volontariat Togo, service civique international"
                      className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/30 focus:border-[#007BFF] placeholder:text-slate-400"
                    />
                    <datalist id="term-suggestions">
                      {TERM_SUGGESTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : VÉRIFICATION ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-base font-semibold text-slate-800">Votre lien est prêt</p>
                <p className="text-sm text-slate-500 mt-1">
                  Ce lien permettra à APTIC-R d&apos;identifier l&apos;origine des visiteurs et de
                  mesurer les candidatures provenant de cette campagne.
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-sm">
                {[
                  { label: "Destination", value: destLabel },
                  { label: "Canal", value: channelInput },
                  { label: "Campagne", value: campaignName },
                  ...(utmContent ? [{ label: "Contenu", value: utmContent }] : []),
                  ...(utmTerm    ? [{ label: "Mot-clé", value: utmTerm }]    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex px-4 py-2.5">
                    <span className="w-28 shrink-0 text-slate-400 font-medium">{label}</span>
                    <span className="text-slate-800 font-semibold">{value}</span>
                  </div>
                ))}
              </div>

              {/* URL */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aperçu de l&apos;URL de destination</p>
                <p className="text-xs font-mono text-slate-700 break-all leading-relaxed select-all">
                  {previewUrl}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Le lien de suivi (qui compte les clics) est généré à l&apos;enregistrement. Copiez-le ensuite depuis la liste ci-dessous.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ← Modifier
                </button>
              </div>

              {saveError && (
                <p className="text-xs text-red-600 font-medium">✗ {saveError}</p>
              )}
            </div>
          )}
        </div>

        {/* Pied de page — navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button
            type="button"
            onClick={() => {
              if (step === 0) onClose()
              else setStep((s) => s - 1)
            }}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
          >
            {step === 0 ? "Annuler" : "← Retour"}
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continuer →
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending || !previewUrl}
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#28A745] text-white hover:bg-[#22923d] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? "Enregistrement…" : "Enregistrer le lien"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────────────────────────

interface Props {
  savedLinks: SavedCampaignLink[]
}

export default function CampaignLinkGenerator({ savedLinks: initialLinks }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [savedLinks, setSavedLinks] = useState<SavedCampaignLink[]>(initialLinks)
  const [pendingDelete, setPendingDelete] = useState<SavedCampaignLink | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState("")
  const [isDeletePending, startDeleteTransition] = useTransition()

  const handleCreated = useCallback((link: SavedCampaignLink) => {
    setSavedLinks((prev) => [link, ...prev])
  }, [])

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    const target = pendingDelete
    setDeleteError("")
    setDeletingId(target.id)
    startDeleteTransition(async () => {
      const result = await deleteLienCampagne(target.id)
      if (result.success) {
        setSavedLinks((prev) => prev.filter((lien) => lien.id !== target.id))
        setPendingDelete(null)
      } else {
        setDeleteError(result.error ?? "Erreur inconnue.")
      }
      setDeletingId(null)
    })
  }, [pendingDelete])

  return (
    <>
      {/* ── Modale ── */}
      {showModal && (
        <CampaignModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* ── Confirmation de suppression individuelle ── */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => !isDeletePending && setPendingDelete(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-base font-bold text-slate-800">
                Supprimer ce lien de campagne ?
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Le lien
                <span className="font-semibold text-slate-800"> « {pendingDelete.label} » </span>
                sera définitivement supprimé de la liste des liens sauvegardés.
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Cette action est irréversible. Les statistiques déjà collectées ne sont pas
                affectées.
              </p>
              {deleteError && (
                <p className="text-xs text-red-600 font-medium mt-3">✗ {deleteError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
              <button
                type="button"
                disabled={isDeletePending}
                onClick={() => {
                  setDeleteError("")
                  setPendingDelete(null)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeletePending}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                {isDeletePending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bloc compact dans la page ── */}
      <div className="bg-white rounded-xl border border-[#EAF0F4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Campagnes et liens de suivi</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Créez des liens personnalisés pour identifier l&apos;origine de vos visiteurs et candidatures.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#002244] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un lien de campagne
          </button>
        </div>

        {/* Historique des liens */}
        {savedLinks.length > 0 && (
          <div className="border-t border-[#EAF0F4] overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Campagne</th>
                  <th className="py-2.5 px-4">Canal</th>
                  <th className="py-2.5 px-4">Page</th>
                  <th className="py-2.5 px-4 text-right">Clics</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savedLinks.map((lien) => (
                  <tr key={lien.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-800 max-w-[180px]">
                      <span className="block truncate" title={lien.label}>{lien.label}</span>
                      <span className="block font-mono font-normal text-[10px] text-slate-400 truncate">
                        {lien.utmCampaign}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{lien.channel}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">{lien.destinationPath}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className="inline-block font-mono font-bold text-slate-800 tabular-nums"
                        title={lien.lastClickedAt ? `Dernier clic : ${formatDateFr(lien.lastClickedAt)}` : "Aucun clic enregistré"}
                      >
                        {lien.clicks}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDateFr(lien.createdAt)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <CopyButton url={lien.generatedUrl} variant="small" />
                        <button
                          type="button"
                          disabled={deletingId === lien.id}
                          onClick={() => {
                            setDeleteError("")
                            setPendingDelete(lien)
                          }}
                          title="Supprimer ce lien"
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-40"
                        >
                          {deletingId === lien.id ? "…" : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {savedLinks.length === 0 && (
          <p className="px-5 pb-5 text-xs text-slate-400">
            Aucun lien créé pour le moment. Cliquez sur « Créer un lien de campagne » pour commencer.
          </p>
        )}
      </div>
    </>
  )
}
