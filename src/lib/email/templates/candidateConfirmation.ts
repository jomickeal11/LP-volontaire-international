/**
 * Template de confirmation de candidature APTIC-R.
 * Conforme à la spécification :
 *   - Objet normal : APTIC-R — Candidature reçue — {{reference}}
 *   - Corps avec logo centré, pas d'objet dans le corps, texte simple et signature officielle.
 */

import { renderCandidateWorkflowEmail } from "./candidateWorkflowTemplates"

interface CandidateEmailParams {
  firstName: string
  lastName?: string
  referenceNumber: string
  arrivalDate?: string
  duration?: string
  lang?: "FR" | "EN" | "DE"
}

export function renderCandidateConfirmationEmail({
  firstName,
  lastName = "",
  referenceNumber,
  arrivalDate = "",
  duration = "",
  lang = "FR",
}: CandidateEmailParams): { subject: string; html: string; text: string } {
  return renderCandidateWorkflowEmail({
    status: "NEW",
    context: {
      firstName,
      lastName,
      reference: referenceNumber,
      arrivalDate,
      duration,
    },
    lang,
  })
}
