import nodemailer, { type Transporter } from 'nodemailer'
import type { EmailProvider, EmailPayload, EmailSendResult } from '../types'

export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'SMTP / Mailtrap Sandbox'
  private transporter: Transporter | null = null

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter

    const host = process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io'
    const port = parseInt(process.env.MAIL_PORT || '2525', 10)
    const user = process.env.MAIL_USER?.trim()
    const pass = process.env.MAIL_PASSWORD?.trim()

    if (!user || !pass) {
      console.warn('⚠️ [SmtpEmailProvider] MAIL_USER ou MAIL_PASSWORD non défini. Les e-mails seront loggés dans la console au lieu d\'être transmis au SMTP.')
      return null
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
    })

    return this.transporter
  }

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    const fromAddress = payload.from || process.env.MAIL_FROM || '"APTIC-R Volontariat International" <contact@aptic-rural.org>'
    const transporter = this.getTransporter()

    if (!transporter) {
      console.log(`📨 [SIMULATION EMAIL - SMTP NON CONFIGURÉ] Destinataire: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to} | Objet: "${payload.subject}"`)
      return {
        success: true,
        messageId: `simulated-${Date.now()}`
      }
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('❌ [SmtpEmailProvider] Erreur lors de l\'envoi de l\'email:', errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }
}
