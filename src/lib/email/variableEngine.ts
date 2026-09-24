/**
 * Moteur de remplacement dynamique des variables de modèles d'emails APTIC-R.
 * Prend en charge la syntaxe {{variable}} avec nettoyage sécurisé.
 */

export interface EmailVariableContext {
  firstName?: string
  lastName?: string
  reference?: string
  email?: string
  phone?: string
  country?: string
  status?: string
  arrivalDate?: string
  duration?: string
  interviewDate?: string
  interviewTime?: string
  timezone?: string
  interviewMode?: string
  interviewLocation?: string
  interviewLink?: string
  additionalMessage?: string
  message?: string
  backofficeUrl?: string
  [key: string]: string | undefined
}

/**
 * Remplace toutes les occurrences de {{clé}} dans le texte par la valeur correspondante.
 * Si une variable n'est pas renseignée, elle est remplacée par une chaîne vide ou une valeur par défaut cohérente.
 */
export function interpolateVariables(template: string, context: EmailVariableContext): string {
  if (!template) return ""

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = context[key]
    if (val !== undefined && val !== null) {
      return String(val)
    }
    // Si interviewLocation est demandé et qu'interviewLink existe, repli intelligent
    if (key === "interviewLocation" && context.interviewLink) {
      return context.interviewLink
    }
    if (key === "interviewLink" && context.interviewLocation) {
      return context.interviewLocation
    }
    return ""
  })
}

/**
 * Transforme un texte brut avec sauts de lignes en paragraphes HTML sûrs.
 * Rend les URLs et e-mails cliquables et formate élégamment le bloc de signature.
 */
export function formatTextToHtml(text: string): string {
  if (!text) return ""

  // Si le texte contient déjà des balises HTML (<p>, <div>, <ul>), on le retourne tel quel
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text
  }

  const linkify = (str: string) => {
    return str
      .replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color: #007BFF; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1" style="color: inherit; text-decoration: underline;">$1</a>'
      )
  }

  return text
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => {
      const isSignature =
        block.includes("aptic.rural19@gmail.com") ||
        block.includes("+228 91 20 19 90") ||
        block.includes("L'équipe APTIC-R") ||
        block.includes("The APTIC-R Team") ||
        block.includes("Ihr APTIC-R Team")

      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((l) => l.length > 0)
        .map((line) => linkify(line))
        .join("<br>")

      if (isSignature) {
        return `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 14px; line-height: 1.6; color: #475569;" class="border-line muted-text">${lines}</div>`
      }

      return `<p style="margin: 0 0 16px 0; line-height: 1.6;">${lines}</p>`
    })
    .join("\n")
}
