import { getEmailProvider } from './index'
import { renderCandidateConfirmationEmail } from './templates/candidateConfirmation'
import { renderPartnerConfirmationEmail } from './templates/partnerConfirmation'
import { renderAdminNotificationEmail } from './templates/adminNotification'

export interface CandidateEmailInput {
  firstName: string
  lastName: string
  email: string
  referenceNumber: string
  country: string
  profession?: string
  skills?: string[]
  arrivalDate?: string
  duration?: string
  lang?: "FR" | "EN" | "DE"
}

export interface PartnerEmailInput {
  orgName: string
  contactPerson: string
  email: string
  referenceNumber: string
  country: string
  orgType: string
  lang?: "FR" | "EN" | "DE"
}

export class EmailService {
  private static getAdminEmail(): string {
    return process.env.MAIL_ADMIN || 'aptic.rural19@gmail.com'
  }

  /**
   * Envoie l'e-mail de confirmation au candidat et notifie les coordinateurs APTIC-R.
   * Totalement résilient : les erreurs d'envoi n'interrompent pas le flux métier.
   */
  static async sendCandidateApplicationEmails(input: CandidateEmailInput): Promise<{
    candidateEmailSent: boolean
    adminEmailSent: boolean
  }> {
    const provider = getEmailProvider()
    let candidateEmailSent = false
    let adminEmailSent = false

    // 1. E-mail au candidat
    try {
      const template = renderCandidateConfirmationEmail({
        firstName: input.firstName,
        lastName: input.lastName,
        referenceNumber: input.referenceNumber,
        arrivalDate: input.arrivalDate,
        duration: input.duration,
        lang: input.lang,
      })

      const res = await provider.sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      candidateEmailSent = res.success
      if (res.success) {
        console.log(`✉️ [EmailService] Accusé de réception envoyé au candidat: ${input.email} (Réf: ${input.referenceNumber})`)
      } else {
        console.warn(`⚠️ [EmailService] Échec envoi email candidat: ${res.error}`)
      }
    } catch (err: unknown) {
      console.error('❌ [EmailService] Exception envoi candidat:', err)
    }

    // 2. Notification aux coordinateurs APTIC-R (pause de 1.1s pour respecter le rate-limit Mailtrap Sandbox)
    await new Promise((r) => setTimeout(r, 1100))

    try {
      const adminEmail = this.getAdminEmail()
      const adminTemplate = renderAdminNotificationEmail({
        type: 'CANDIDATE',
        referenceNumber: input.referenceNumber,
        name: `${input.firstName} ${input.lastName}`,
        email: input.email,
        country: input.country,
        profession: input.profession,
        skills: input.skills,
      })

      const adminRes = await provider.sendEmail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text,
      })

      adminEmailSent = adminRes.success
      if (adminRes.success) {
        console.log(`🔔 [EmailService] Alerte équipe APTIC-R envoyée à: ${adminEmail} (Réf: ${input.referenceNumber})`)
      }
    } catch (err: unknown) {
      console.error('❌ [EmailService] Exception envoi alerte admin:', err)
    }

    return { candidateEmailSent, adminEmailSent }
  }

  /**
   * Envoie l'e-mail de confirmation au partenaire et notifie l'équipe APTIC-R.
   */
  static async sendPartnerRequestEmails(input: PartnerEmailInput): Promise<{
    partnerEmailSent: boolean
    adminEmailSent: boolean
  }> {
    const provider = getEmailProvider()
    let partnerEmailSent = false
    let adminEmailSent = false

    // 1. E-mail à l'organisation partenaire
    try {
      const template = renderPartnerConfirmationEmail({
        orgName: input.orgName,
        contactPerson: input.contactPerson,
        referenceNumber: input.referenceNumber,
        country: input.country,
        orgType: input.orgType,
        lang: input.lang,
      })

      const res = await provider.sendEmail({
        to: input.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      partnerEmailSent = res.success
      if (res.success) {
        console.log(`✉️ [EmailService] Accusé de réception envoyé au partenaire: ${input.email} (Réf: ${input.referenceNumber})`)
      } else {
        console.warn(`⚠️ [EmailService] Échec envoi email partenaire: ${res.error}`)
      }
    } catch (err: unknown) {
      console.error('❌ [EmailService] Exception envoi partenaire:', err)
    }

    // 2. Notification aux coordinateurs APTIC-R (pause de 1.1s pour respecter le rate-limit Mailtrap Sandbox)
    await new Promise((r) => setTimeout(r, 1100))

    try {
      const adminEmail = this.getAdminEmail()
      const adminTemplate = renderAdminNotificationEmail({
        type: 'PARTNER',
        referenceNumber: input.referenceNumber,
        orgName: input.orgName,
        contactPerson: input.contactPerson,
        email: input.email,
        country: input.country,
        orgType: input.orgType,
      })

      const adminRes = await provider.sendEmail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text,
      })

      adminEmailSent = adminRes.success
      if (adminRes.success) {
        console.log(`🔔 [EmailService] Alerte équipe APTIC-R envoyée à: ${adminEmail} (Demande Partenaire Réf: ${input.referenceNumber})`)
      }
    } catch (err: unknown) {
      console.error('❌ [EmailService] Exception envoi alerte admin (partenaire):', err)
    }

    return { partnerEmailSent, adminEmailSent }
  }
}
