"use server"

/**
 * Service de Traduction Hybride & Intelligent pour le CMS APTIC-R
 *
 * 1. Tente d'abord d'utiliser l'API DeepL (avec DEEPL_API_KEY)
 * 2. Si la clé est absente, épuisée ou invalide, bascule automatiquement sur le
 *    moteur public gratuit de secours (MyMemory)
 * 3. Si les deux moteurs échouent, le champ est explicitement marqué "failed".
 *    Le texte source n'est JAMAIS recopié comme s'il s'agissait d'une traduction.
 *
 * Chaque champ traduit porte son propre statut afin de ne jamais présenter un
 * résultat ambigu à l'administrateur :
 *   - "translated" : traduit par DeepL
 *   - "fallback"   : traduit par le moteur de secours (DeepL indisponible)
 *   - "failed"     : aucun moteur n'a pu produire de traduction (text vide)
 */

export type TranslationProvider = "deepl" | "mymemory" | null

export type TranslationStatus = "translated" | "fallback" | "failed"

export interface TranslationFieldResult {
  /** Texte traduit. Vaut "" lorsque status === "failed". */
  text: string
  provider: TranslationProvider
  status: TranslationStatus
}

export interface TranslationOutcome {
  /** true si au moins un champ a pu être traduit. */
  ok: boolean
  level: "success" | "warning" | "error"
  message: string
}

interface TranslatePayload {
  texts: Record<string, string> // ex: { title: "Mon titre", summary: "Mon résumé", description: "..." }
  sourceLang?: "FR" | "EN" | "DE"
  targetLangs: Array<"EN" | "DE" | "FR">
}

export interface TranslationResult {
  success: boolean
  translations: Record<"EN" | "DE" | "FR", Record<string, TranslationFieldResult>>
  outcome: TranslationOutcome
  error?: string
}

async function translateWithDeepL(
  text: string,
  targetLang: "EN" | "DE" | "FR",
  apiKey: string
): Promise<string | null> {
  try {
    const isFreePlan = apiKey.endsWith(":fx")
    const endpoint = isFreePlan
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate"

    const deeplTarget = targetLang === "EN" ? "EN-US" : targetLang

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text,
        target_lang: deeplTarget,
        source_lang: "FR",
      }),
    })

    if (!response.ok) {
      console.warn(`DeepL API failed with status ${response.status}: ${await response.text()}`)
      return null
    }

    const data = await response.json()
    const translated = data?.translations?.[0]?.text
    return typeof translated === "string" && translated.trim() ? translated : null
  } catch (err) {
    console.warn("DeepL translation error:", err)
    return null
  }
}

async function translateWithFreeFallback(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    if (!text || !text.trim()) return null

    const sLang = sourceLang.toLowerCase()
    const tLang = targetLang.toLowerCase()
    const pair = `${sLang}|${tLang}`

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`
    const response = await fetch(url, { headers: { "User-Agent": "APTIC-R-Portal/1.0" } })

    if (!response.ok) return null

    const data = await response.json()

    // MyMemory signale l'épuisement du quota caractères via quotaFinished / 429.
    if (data?.quotaFinished) return null

    const translated = data?.responseData?.translatedText
    const statusOk = Number(data?.responseStatus) === 200

    if (statusOk && typeof translated === "string" && translated.trim()) {
      return translated
    }
    return null
  } catch (err) {
    console.warn("Free fallback translation error:", err)
    return null
  }
}

function providerLabel(provider: TranslationProvider | "mixed" | "none"): string {
  switch (provider) {
    case "deepl":
      return "DeepL"
    case "mymemory":
      return "moteur de secours"
    case "mixed":
      return "DeepL + moteur de secours"
    default:
      return "aucun moteur"
  }
}

function summarizeLanguage(fields: TranslationFieldResult[]): {
  status: "ok" | "partial" | "failed"
  provider: "deepl" | "mymemory" | "mixed" | "none"
} {
  const succeeded = fields.filter((f) => f.status !== "failed")
  if (succeeded.length === 0) return { status: "failed", provider: "none" }

  const hasDeepL = succeeded.some((f) => f.provider === "deepl")
  const hasFallback = succeeded.some((f) => f.provider === "mymemory")

  const status: "ok" | "partial" = succeeded.length === fields.length ? "ok" : "partial"
  const provider = hasDeepL && hasFallback ? "mixed" : hasDeepL ? "deepl" : "mymemory"

  return { status, provider }
}

function summarizeTranslation(
  translations: Record<"EN" | "DE" | "FR", Record<string, TranslationFieldResult>>
): TranslationOutcome {
  const langs = (["EN", "DE", "FR"] as const).filter(
    (lang) => Object.keys(translations[lang] || {}).length > 0
  )

  if (langs.length === 0) {
    return {
      ok: false,
      level: "error",
      message:
        "❌ Traduction impossible. Aucun texte traduit n'a été généré. Vérifiez la configuration de DeepL ou réessayez plus tard.",
    }
  }

  const perLang = langs.map((lang) => ({ lang, ...summarizeLanguage(Object.values(translations[lang])) }))

  const anyOk = perLang.some((l) => l.status !== "failed")

  if (!anyOk) {
    return {
      ok: false,
      level: "error",
      message:
        "❌ Traduction impossible. Aucun texte traduit n'a été généré. Vérifiez la configuration de DeepL ou réessayez plus tard.",
    }
  }

  const allOk = perLang.every((l) => l.status === "ok")
  const anyDeepL = perLang.some((l) => l.provider === "deepl" || l.provider === "mixed")
  const anyFallback = perLang.some((l) => l.provider === "mymemory" || l.provider === "mixed")

  // Succès intégral via DeepL uniquement.
  if (allOk && anyDeepL && !anyFallback) {
    return { ok: true, level: "success", message: "✅ Traduction terminée avec DeepL." }
  }

  // Succès intégral via le moteur de secours uniquement.
  if (allOk && !anyDeepL && anyFallback) {
    return {
      ok: true,
      level: "warning",
      message:
        "⚠️ Traduction terminée avec le moteur automatique de secours. DeepL n'était pas disponible.",
    }
  }

  // Cas partiel : mélange de moteurs, champs non traduits ou langues incomplètes.
  const details = perLang.map((l) => `${l.lang} : ${providerLabel(l.provider)}`).join(" — ")

  return {
    ok: true,
    level: "warning",
    message: `⚠️ Traduction partiellement terminée. ${details}. Vérifiez les traductions avant publication.`,
  }
}

export async function translateCmsFieldsAction(
  payload: TranslatePayload
): Promise<TranslationResult> {
  const { texts, sourceLang = "FR", targetLangs } = payload
  const apiKey = process.env.DEEPL_API_KEY?.trim() || ""

  const translations: Record<"EN" | "DE" | "FR", Record<string, TranslationFieldResult>> = {
    EN: {},
    DE: {},
    FR: {},
  }

  for (const targetLang of targetLangs) {
    if (targetLang === sourceLang) continue

    for (const [key, rawValue] of Object.entries(texts)) {
      const textValue = (rawValue || "").trim()
      if (!textValue) continue

      let field: TranslationFieldResult = { text: "", provider: null, status: "failed" }

      // 1. Essai avec DeepL si la clé est présente.
      if (apiKey) {
        const deeplText = await translateWithDeepL(textValue, targetLang, apiKey)
        if (deeplText) {
          field = { text: deeplText, provider: "deepl", status: "translated" }
        }
      }

      // 2. Si DeepL a échoué ou est absent -> bascule sur le moteur de secours.
      if (field.status === "failed") {
        const fallbackText = await translateWithFreeFallback(textValue, sourceLang, targetLang)
        if (fallbackText) {
          field = { text: fallbackText, provider: "mymemory", status: "fallback" }
        }
      }

      // 3. Si les deux ont échoué, on conserve un statut "failed" explicite :
      //    jamais de recopie silencieuse du texte source.
      translations[targetLang][key] = field
    }
  }

  const outcome = summarizeTranslation(translations)

  return {
    success: outcome.ok,
    translations,
    outcome,
    error: outcome.ok ? undefined : outcome.message,
  }
}
