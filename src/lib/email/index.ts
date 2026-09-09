import type { EmailProvider } from './types'
import { SmtpEmailProvider } from './providers/smtpProvider'
import { ResendEmailProvider } from './providers/resendProvider'

let cachedProvider: EmailProvider | null = null

/**
 * Factory retournant l'instance du fournisseur d'email selon la configuration active.
 * EMAIL_PROVIDER="smtp" (défaut) ➔ Mailtrap Sandbox / SMTP
 * EMAIL_PROVIDER="resend" ➔ Resend API
 */
export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider

  const providerType = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase()

  if (providerType === 'resend') {
    cachedProvider = new ResendEmailProvider()
  } else {
    cachedProvider = new SmtpEmailProvider()
  }

  return cachedProvider
}

export * from './types'
export * from './emailService'
