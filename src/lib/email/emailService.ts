import { getEmailProvider } from "./index"
import prisma from "../prisma"
import {
  renderCandidateWorkflowEmail,
  isStatusEmailSupported,
} from "./templates/candidateWorkflowTemplates"
import { renderPartnerConfirmationEmail } from "./templates/partnerConfirmation"
import { renderAdminNotificationEmail } from "./templates/adminNotification"
import { renderContactNotificationEmail, type ContactNotificationParams } from "./templates/contactNotification"
import type { CandidateStatus } from "@prisma/client"

export interface ContactMessageEmailInput {
  name: string
  email: string
  organization?: string
  phone?: string
  subject: string
  message: string
  routedTo: string
  lang?: "FR" | "EN" | "DE"
}

export interface CandidateEmailInput {
  applicationId?: string
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

export interface SendStatusEmailInput {
  applicationId: string
  candidateEmail: string
  candidateName: string
  referenceNumber: string
  status: string
  fromStatus?: string
  customSubject?: string
  customBody?: string
  interviewDetails?: {
    interviewDate?: string
    interviewTime?: string
    timezone?: string
    interviewMode?: string
    interviewLocation?: string
    interviewLink?: string
    additionalMessage?: string
  }
  lang?: "FR" | "EN" | "DE"
}

export class EmailService {
  private static getAdminEmail(): string {
    return process.env.MAIL_ADMIN || "aptic.rural19@gmail.com"
  }

  private static getOfficialContactEmail(): string {
    return "aptic.rural19@gmail.com"
  }

  /**
   * 1. Confirmation de candidature automatique (statut NOUVEAU)
   * Envoie l'accusé de réception officiel au candidat, notifie les coordinateurs APTIC-R,
   * et consigne l'opération dans le journal EmailLog.
   * Résilience totale : les incidents d'envoi n'interrompent jamais le processus métier.
   */
  static async sendCandidateApplicationEmails(input: CandidateEmailInput): Promise<{
    candidateEmailSent: boolean
    adminEmailSent: boolean
  }> {
    const provider = getEmailProvider()
    let candidateEmailSent = false
    let adminEmailSent = false

    const lang = (input.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"

    // 1. E-mail au candidat
    try {
      const template = renderCandidateWorkflowEmail({
        status: "NEW",
        context: {
          firstName: input.firstName,
          lastName: input.lastName,
          reference: input.referenceNumber,
          arrivalDate: input.arrivalDate,
          duration: input.duration,
          country: input.country,
        },
        lang,
      })

      const res = await provider.sendEmail({
        to: input.email,
        replyTo: this.getOfficialContactEmail(),
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      candidateEmailSent = res.success

      // Enregistrement dans le journal EmailLog
      try {
        await prisma.emailLog.create({
          data: {
            applicationId: input.applicationId || null,
            recipient: input.email,
            recipientName: `${input.firstName} ${input.lastName}`.trim(),
            subject: template.subject,
            bodyHtml: template.html,
            bodyText: template.text,
            status: res.success ? "SENT" : "FAILED",
            error: res.error || null,
            actionType: "APPLICATION_CONFIRMATION",
            toStatus: "NEW",
            templateKey: "NEW",
            metadata: {
              referenceNumber: input.referenceNumber,
              lang,
            },
          },
        })
      } catch (logErr) {
        console.warn("⚠️ [EmailService] Impossible de journaliser EmailLog (candidat):", logErr)
      }

      if (res.success) {
        console.log(`✉️ [EmailService] Accusé de réception envoyé au candidat: ${input.email} (Réf: ${input.referenceNumber})`)
      } else {
        console.warn(`⚠️ [EmailService] Échec envoi email candidat: ${res.error}`)
      }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception envoi candidat:", err)
    }

    // 2. Notification aux coordinateurs APTIC-R (pause de 1.1s pour réguler le flux SMTP)
    await new Promise((r) => setTimeout(r, 1100))

    try {
      const adminEmail = this.getAdminEmail()
      const adminTemplate = renderAdminNotificationEmail({
        type: "CANDIDATE",
        referenceNumber: input.referenceNumber,
        name: `${input.firstName} ${input.lastName}`.trim(),
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
      console.error("❌ [EmailService] Exception envoi alerte admin:", err)
    }

    return { candidateEmailSent, adminEmailSent }
  }

  /**
   * 2. Envoi d'email lors d'un changement de statut par l'administrateur
   * Utilisé pour ENTRETIEN, SÉLECTIONNÉ, RETENU (CHOSEN), PRÉPARATION, ARRIVÉ, TERMINÉ.
   */
  static async sendCandidateStatusEmail(input: SendStatusEmailInput): Promise<{
    success: boolean
    error?: string
    emailLogId?: string
  }> {
    const provider = getEmailProvider()
    const lang = (input.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"

    try {
      const [firstName, ...rest] = input.candidateName.split(" ")
      const lastName = rest.join(" ")

      const rendered = renderCandidateWorkflowEmail({
        status: input.status,
        context: {
          firstName: firstName || input.candidateName,
          lastName,
          reference: input.referenceNumber,
          status: input.status,
          interviewDate: input.interviewDetails?.interviewDate,
          interviewTime: input.interviewDetails?.interviewTime,
          timezone: input.interviewDetails?.timezone || "GMT / Heure de Lomé",
          interviewMode: input.interviewDetails?.interviewMode || "Visioconférence",
          interviewLocation: input.interviewDetails?.interviewLocation || input.interviewDetails?.interviewLink,
          interviewLink: input.interviewDetails?.interviewLink || input.interviewDetails?.interviewLocation,
          additionalMessage: input.interviewDetails?.additionalMessage || "",
        },
        customSubject: input.customSubject,
        customBody: input.customBody,
        lang,
      })

      const sendResult = await provider.sendEmail({
        to: input.candidateEmail,
        replyTo: this.getOfficialContactEmail(),
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      })

      // Journalisation dans EmailLog
      let createdLogId: string | undefined
      try {
        const log = await prisma.emailLog.create({
          data: {
            applicationId: input.applicationId,
            recipient: input.candidateEmail,
            recipientName: input.candidateName,
            subject: rendered.subject,
            bodyHtml: rendered.html,
            bodyText: rendered.text,
            status: sendResult.success ? "SENT" : "FAILED",
            error: sendResult.error || null,
            actionType: input.status === "INTERVIEW" ? "INTERVIEW_INVITATION" : "STATUS_CHANGE",
            fromStatus: (input.fromStatus as CandidateStatus) || null,
            toStatus: (input.status as CandidateStatus) || null,
            templateKey: input.status,
            metadata: {
              ...(input.interviewDetails || {}),
              referenceNumber: input.referenceNumber,
              lang,
            },
          },
        })
        createdLogId = log.id
      } catch (logErr) {
        console.warn("⚠️ [EmailService] Échec création EmailLog:", logErr)
      }

      if (sendResult.success) {
        console.log(`✉️ [EmailService] Email de statut "${input.status}" envoyé à: ${input.candidateEmail} (${input.referenceNumber})`)
        return { success: true, emailLogId: createdLogId }
      } else {
        console.warn(`⚠️ [EmailService] Échec envoi email statut "${input.status}": ${sendResult.error}`)
        return { success: false, error: sendResult.error, emailLogId: createdLogId }
      }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception sendCandidateStatusEmail:", err)
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erreur inattendue lors de l'envoi de l'email",
      }
    }
  }

  /**
   * 3. Réessai d'un email en échec depuis le Back-office
   */
  static async resendLoggedEmail(emailLogId: string): Promise<{ success: boolean; error?: string }> {
    const provider = getEmailProvider()

    try {
      const log = await prisma.emailLog.findUnique({
        where: { id: emailLogId },
      })

      if (!log) {
        return { success: false, error: "Journal d'email introuvable." }
      }

      const res = await provider.sendEmail({
        to: log.recipient,
        replyTo: this.getOfficialContactEmail(),
        subject: log.subject,
        html: log.bodyHtml,
        text: log.bodyText || undefined,
      })

      // Mise à jour de l'enregistrement EmailLog
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: res.success ? "SENT" : "FAILED",
          error: res.success ? null : res.error || "Échec lors de la relance",
          sentAt: new Date(),
        },
      })

      return res
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception resendLoggedEmail:", err)
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erreur lors de la réexpédition de l'email",
      }
    }
  }

  /**
   * 4. Confirmation de demande de partenariat
   */
  static async sendPartnerRequestEmails(input: PartnerEmailInput): Promise<{
    partnerEmailSent: boolean
    adminEmailSent: boolean
  }> {
    const provider = getEmailProvider()
    let partnerEmailSent = false
    let adminEmailSent = false

    const lang = (input.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"

    try {
      const template = renderPartnerConfirmationEmail({
        orgName: input.orgName,
        contactPerson: input.contactPerson,
        referenceNumber: input.referenceNumber,
        country: input.country,
        orgType: input.orgType,
        lang,
      })

      const res = await provider.sendEmail({
        to: input.email,
        replyTo: this.getOfficialContactEmail(),
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      partnerEmailSent = res.success
      if (res.success) {
        console.log(`✉️ [EmailService] Accusé de réception partenaire envoyé: ${input.email} (${input.referenceNumber})`)
      } else {
        console.warn(`⚠️ [EmailService] Échec envoi email partenaire: ${res.error}`)
      }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception envoi partenaire:", err)
    }

    await new Promise((r) => setTimeout(r, 1100))

    try {
      const adminEmail = this.getAdminEmail()
      const adminTemplate = renderAdminNotificationEmail({
        type: "PARTNER",
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
        console.log(`🔔 [EmailService] Alerte partenaire envoyée à l'équipe: ${adminEmail}`)
      }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception envoi alerte admin (partenaire):", err)
    }

    return { partnerEmailSent, adminEmailSent }
  }

  /**
   * 5. Notification d'un nouveau message de contact
   * Acheminé avec Reply-To pointant directement vers le visiteur.
   */
  static async sendContactMessageNotification(input: ContactMessageEmailInput): Promise<{
    emailSent: boolean
    error?: string
  }> {
    const provider = getEmailProvider()
    try {
      const template = renderContactNotificationEmail({
        name: input.name,
        email: input.email,
        organization: input.organization,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        routedTo: input.routedTo,
        lang: input.lang,
      })

      const fromAddress = process.env.MAIL_FROM || "aptic.rural19@gmail.com"
      const cleanSenderEmail = fromAddress.includes("<")
        ? fromAddress.match(/<([^>]+)>/)?.[1] || "aptic.rural19@gmail.com"
        : fromAddress

      const res = await provider.sendEmail({
        from: `"${input.name} (via APTIC-R)" <${cleanSenderEmail}>`,
        to: input.routedTo,
        replyTo: input.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      if (res.success) {
        console.log(`🔔 [EmailService] Message de contact (${input.subject}) acheminé vers : ${input.routedTo}`)
        return { emailSent: true }
      } else {
        console.warn(`⚠️ [EmailService] Échec routage email contact: ${res.error}`)
        return { emailSent: false, error: res.error }
      }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception envoi alerte contact:", err)
      return { emailSent: false, error: err instanceof Error ? err.message : String(err) }
    }
  }
}
