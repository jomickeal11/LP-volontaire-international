import type { EmailProvider } from './types'
import { SmtpEmailProvider } from './providers/smtpProvider'
import { ResendEmailProvider } from './providers/resendProvider'

let cachedProvider: EmailProvider | null = null

/**
 * Factory retournant l'instance du fournisseur d'email selon la configuration active.
 * EMAIL_PROVIDER="smtp" ➔ Mailtrap Sandbox / SMTP
 * EMAIL_PROVIDER="resend" ➔ Resend API
 * Sans choix explicite, une clé Resend active sélectionne Resend; sinon SMTP.
 */
export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider

  const configuredProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase()
  const providerType =
    configuredProvider || (process.env.RESEND_API_KEY?.trim() ? 'resend' : 'smtp')

  if (providerType === 'resend') {
    cachedProvider = new ResendEmailProvider()
  } else {
    cachedProvider = new SmtpEmailProvider()
  }

  return cachedProvider
}

export * from './types'
export * from './emailService'
