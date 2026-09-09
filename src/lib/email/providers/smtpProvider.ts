import net from 'net'
import type { EmailProvider, EmailPayload, EmailSendResult } from '../types'

/**
 * Fournisseur SMTP natif robuste pour Mailtrap Email Sandbox & serveurs SMTP standards.
 * Conçu pour une fiabilité maximale sur toutes les versions de Node.js (y compris Node 22/24 sur Windows).
 * Intègre une gestion automatique du rate-limit Mailtrap Sandbox (retry automatique en cas de 550).
 */
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'SMTP / Mailtrap Sandbox'

  async sendEmail(payload: EmailPayload, retryCount = 0): Promise<EmailSendResult> {
    const host = process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io'
    const port = parseInt(process.env.MAIL_PORT || '2525', 10)
    const user = process.env.MAIL_USER?.trim()
    const pass = process.env.MAIL_PASSWORD?.trim()
    const fromAddress = payload.from || process.env.MAIL_FROM || 'APTIC-R Volontariat International <contact@aptic-rural.org>'

    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to]

    if (!user || !pass) {
      console.warn('⚠️ [SmtpEmailProvider] MAIL_USER ou MAIL_PASSWORD non configuré. Mode simulation actif.')
      console.log(`📨 [SIMULATION EMAIL] Destinataire: ${recipients.join(', ')} | Objet: "${payload.subject}"`)
      return {
        success: true,
        messageId: `simulated-${Date.now()}`
      }
    }

    return new Promise((resolve) => {
      const socket = net.createConnection(port, host)
      let step = 0
      let recipientIndex = 0
      let messageId = `mailtrap-${Date.now()}`
      let resolved = false

      const cleanup = (result: EmailSendResult) => {
        if (resolved) return
        resolved = true
        socket.removeAllListeners()
        try {
          socket.write('QUIT\r\n')
          socket.end()
        } catch {}
        resolve(result)
      }

      // Timeout de sécurité de 10s
      const timer = setTimeout(() => {
        cleanup({ success: false, error: 'Délai d\'attente dépassé (timeout 10s) lors de la communication avec le serveur SMTP' })
      }, 10000)

      socket.on('error', (err) => {
        clearTimeout(timer)
        console.error('❌ [SmtpEmailProvider] Erreur socket SMTP:', err.message)
        cleanup({ success: false, error: err.message })
      })

      // Extraction de l'email pur pour les commandes SMTP (ex: "Nom <email@dom.com>" -> "email@dom.com")
      const extractCleanEmail = (addr: string) => {
        const match = addr.match(/<([^>]+)>/)
        return match ? match[1] : addr.trim()
      }

      const cleanFrom = extractCleanEmail(fromAddress)

      socket.on('data', async (chunk) => {
        const res = chunk.toString()

        if (res.includes('Too many emails per second') && retryCount < 2) {
          clearTimeout(timer)
          if (!resolved) {
            resolved = true
            socket.removeAllListeners()
            try { socket.end() } catch {}
            console.log(`⏳ [SmtpEmailProvider] Pause de régulation Mailtrap Sandbox (essai ${retryCount + 1}/2)...`)
            await new Promise(r => setTimeout(r, 2500))
            const retryRes = await this.sendEmail(payload, retryCount + 1)
            resolve(retryRes)
            return
          }
        }

        if (step === 0 && res.includes('220')) {
          step = 1
          socket.write('EHLO localhost\r\n')
        } else if (step === 1 && res.includes('250')) {
          step = 2
          socket.write('AUTH LOGIN\r\n')
        } else if (step === 2 && res.includes('334 VXNlcm5hbWU6')) {
          step = 3
          socket.write(Buffer.from(user).toString('base64') + '\r\n')
        } else if (step === 3 && res.includes('334 UGFzc3dvcmQ6')) {
          step = 4
          socket.write(Buffer.from(pass).toString('base64') + '\r\n')
        } else if (step === 4 && res.includes('235')) {
          // Authentifié avec succès !
          step = 5
          socket.write(`MAIL FROM:<${cleanFrom}>\r\n`)
        } else if (step === 5 && res.includes('250')) {
          // Envoi des destinataires
          step = 6
          socket.write(`RCPT TO:<${extractCleanEmail(recipients[recipientIndex])}>\r\n`)
        } else if (step === 6 && res.includes('250')) {
          recipientIndex++
          if (recipientIndex < recipients.length) {
            socket.write(`RCPT TO:<${extractCleanEmail(recipients[recipientIndex])}>\r\n`)
          } else {
            step = 7
            socket.write('DATA\r\n')
          }
        } else if (step === 7 && res.includes('354')) {
          step = 8

          // Encodage RFC 2047 de l'objet pour les caractères accentués
          const encodedSubject = `=?UTF-8?B?${Buffer.from(payload.subject, 'utf-8').toString('base64')}?=`

          const emailData = [
            `From: ${fromAddress}`,
            `To: ${recipients.join(', ')}`,
            `Subject: ${encodedSubject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            '',
            payload.html,
            '.',
            ''
          ].join('\r\n')

          socket.write(emailData)
        } else if (step === 8 && res.includes('250')) {
          clearTimeout(timer)
          // Capture ID de file d'attente si disponible
          const match = res.match(/queued\s+([a-zA-Z0-9_-]+)/i)
          if (match) messageId = match[1]

          cleanup({ success: true, messageId })
        } else if (res.startsWith('4') || res.startsWith('5')) {
          clearTimeout(timer)
          cleanup({ success: false, error: `Refus SMTP: ${res.trim()}` })
        }
      })
    })
  }
}
