import type { EmailProvider, EmailPayload, EmailSendResult } from '../types'

/**
 * Fournisseur Resend pour la production.
 * Prêt à l'emploi via l'API HTTPS officielle de Resend sans nécessiter de refactorisation.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = 'Resend API'
  private apiKey: string | null

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY?.trim() || null
  }

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    const fromAddress = payload.from || process.env.MAIL_FROM || 'APTIC-R Volontariat <aptic.rural19@gmail.com>'

    if (!this.apiKey) {
      console.warn('⚠️ [ResendEmailProvider] RESEND_API_KEY non défini dans l\'environnement.')
      return {
        success: false,
        error: 'RESEND_API_KEY manquante',
      }
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Erreur Resend HTTP ${response.status}`)
      }

      return {
        success: true,
        messageId: data.id,
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('❌ [ResendEmailProvider] Erreur lors de l\'envoi Resend:', errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }
}
