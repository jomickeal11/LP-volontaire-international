"use server"

/**
 * Service de Traduction Hybride & Intelligent pour le CMS APTIC-R
 * 1. Tente d'abord d'utiliser l'API DeepL (avec DEEPL_API_KEY)
 * 2. Si la clé est absente, épuisée ou invalide, bascule automatiquement sur le moteur public gratuit (MyMemory / LibreTranslate)
 */

interface TranslatePayload {
  texts: Record<string, string> // ex: { title: "Mon titre", summary: "Mon résumé", description: "..." }
  sourceLang?: "FR" | "EN" | "DE"
  targetLangs: Array<"EN" | "DE" | "FR">
}

interface TranslationResult {
  success: boolean
  providerUsed: "deepl" | "fallback_free" | "none"
  translations: Record<"EN" | "DE" | "FR", Record<string, string>>
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
    return data.translations?.[0]?.text || null
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
    if (!text || !text.trim()) return ""

    const sLang = sourceLang.toLowerCase()
    const tLang = targetLang.toLowerCase()
    const pair = `${sLang}|${tLang}`

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`
    const response = await fetch(url, { headers: { "User-Agent": "APTIC-R-Portal/1.0" } })

    if (!response.ok) return null

    const data = await response.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
    return null
  } catch (err) {
    console.warn("Free fallback translation error:", err)
    return null
  }
}

export async function translateCmsFieldsAction(
  payload: TranslatePayload
): Promise<TranslationResult> {
  const { texts, sourceLang = "FR", targetLangs } = payload
  const apiKey = process.env.DEEPL_API_KEY?.trim() || ""

  const resultTranslations: Record<"EN" | "DE" | "FR", Record<string, string>> = {
    EN: {},
    DE: {},
    FR: {},
  }

  let providerUsed: "deepl" | "fallback_free" | "none" = "none"

  for (const targetLang of targetLangs) {
    if (targetLang === sourceLang) continue

    for (const [key, textValue] of Object.entries(texts)) {
      if (!textValue || !textValue.trim()) {
        resultTranslations[targetLang][key] = ""
        continue
      }

      let translated: string | null = null

      // 1. Essai avec DeepL si la clé est présente
      if (apiKey) {
        translated = await translateWithDeepL(textValue, targetLang, apiKey)
        if (translated) {
          providerUsed = "deepl"
        }
      }

      // 2. Si DeepL a échoué ou pas de clé -> Bascule transparente sur le fallback gratuit
      if (!translated) {
        translated = await translateWithFreeFallback(textValue, sourceLang, targetLang)
        if (translated) {
          providerUsed = providerUsed === "deepl" ? "deepl" : "fallback_free"
        }
      }

      resultTranslations[targetLang][key] = translated || textValue
    }
  }

  return {
    success: true,
    providerUsed,
    translations: resultTranslations,
  }
}
