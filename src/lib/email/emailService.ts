import { getEmailProvider } from "./index"
import prisma from "../prisma"
import {
  renderCandidateWorkflowEmail,
  isStatusEmailSupported,
} from "./templates/candidateWorkflowTemplates"
import { renderPartnerConfirmationEmail } from "./templates/partnerConfirmation"
import { renderAdminNotificationEmail } from "./templates/adminNotification"
import { renderContactNotificationEmail, type ContactNotificationParams } from "./templates/contactNotification"
import {
  renderEventParticipationEmail,
  type EventParticipationDecision,
} from "./templates/eventParticipationTemplates"
import { wrapEmailHtml } from "./templates/emailTheme"
import { escapeHtml } from "./variableEngine"
import type { CandidateStatus } from "@prisma/client"
import { createHash } from "crypto"
import type { EmailPayload } from "./types"

export interface ProjectProposalStatusEmailInput {
  notificationKey: string
  email: string
  proposerName: string
  title: string
  referenceNumber: string
  status: "NOUVEAU" | "EN_EXAMEN" | "INFORMATIONS_COMPLEMENTAIRES" | "ACCEPTE_COLLABORATION" | "REFUSE"
  lang: "FR" | "EN" | "DE"
  adminMessage?: string
}

export interface ContactMessageEmailInput {
  notificationKey: string
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

export interface WorkflowDecisionEmailInput {
  notificationKey: string
  email: string
  firstName: string
  referenceNumber: string
  status: "APPROVED" | "REJECTED"
  lang?: "FR" | "EN" | "DE"
  memberReference?: string
}

/** Notification d'une demande de participation à un événement. */
export interface EventParticipationEmailInput {
  requestId?: string
  decision: EventParticipationDecision
  firstName: string
  lastName: string
  email: string
  eventTitle: string
  eventDate?: string
  eventLocation?: string | null
  rejectionReason?: string | null
  lang?: "FR" | "EN" | "DE"
}

export interface SendStatusEmailInput {
  applicationId: string
  notificationKey: string
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

  static async sendTrackedEmail(input: {
    notificationKey: string
    payload: EmailPayload
    /** Optional redacted copy stored in EmailLog; the provider still gets payload. */
    logPayload?: EmailPayload
    /** Values that must not escape through provider errors or application logs. */
    redactValues?: string[]
    recipientName?: string
    actionType: string
    applicationId?: string
    eventParticipationRequestId?: string
    fromStatus?: CandidateStatus
    toStatus?: CandidateStatus
    templateKey?: string
    metadata?: Record<string, unknown>
  }): Promise<{ success: boolean; error?: string; emailLogId?: string; duplicate?: boolean }> {
    const recipients = Array.isArray(input.payload.to) ? input.payload.to : [input.payload.to]
    if (recipients.some((recipient) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim()))) {
      return { success: false, error: "Adresse e-mail du destinataire invalide." }
    }
    const id = `notification_${createHash("sha256").update(input.notificationKey).digest("hex")}`
    const logPayload = input.logPayload || input.payload
    let emailLogId = id

    try {
      await prisma.emailLog.create({
        data: {
          id,
          applicationId: input.applicationId || null,
          eventParticipationRequestId: input.eventParticipationRequestId || null,
          recipient: Array.isArray(logPayload.to) ? logPayload.to.join(", ") : logPayload.to,
          recipientName: input.recipientName || null,
          subject: logPayload.subject,
          bodyHtml: logPayload.html,
          bodyText: logPayload.text || null,
          status: "PENDING",
          actionType: input.actionType,
          fromStatus: input.fromStatus || null,
          toStatus: input.toStatus || null,
          templateKey: input.templateKey || null,
          metadata: input.metadata as object | undefined,
        },
      })
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === "P2002") {
        const previous = await prisma.emailLog.findUnique({ where: { id } })
        if (previous?.status === "SENT") return { success: true, emailLogId: id, duplicate: true }
        return {
          success: false,
          error: previous?.status === "FAILED"
            ? "Notification déjà échouée ; utilisez la relance depuis le back-office."
            : "Notification déjà en cours de traitement.",
          emailLogId: id,
          duplicate: true,
        }
      }
      console.error("[EmailService] Impossible de réserver le journal de notification:", error)
      return {
        success: false,
        error: "Impossible de journaliser la notification ; aucun e-mail n’a été envoyé.",
      }
    }

    const redactError = (error: string | undefined) => {
      if (!error) return error
      return (input.redactValues || []).filter(Boolean).reduce(
        (safe, value) => safe.split(value).join("[redacted]"),
        error,
      )
    }

    let result: { success: boolean; error?: string }
    try {
      const sent = await getEmailProvider().sendEmail(input.payload)
      result = { success: sent.success, error: redactError(sent.error) }
    } catch (error: unknown) {
      result = {
        success: false,
        error: redactError(error instanceof Error ? error.message : "Erreur inattendue lors de l'envoi."),
      }
    }

    try {
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: result.success ? "SENT" : "FAILED",
          error: result.success ? null : result.error || "Échec de l'envoi.",
          sentAt: new Date(),
        },
      })
    } catch (error: unknown) {
      console.error("[EmailService] E-mail traité mais journal impossible à actualiser:", error)
    }

    if (!result.success) {
      console.error(`[EmailService] Notification ${input.actionType} échouée:`, result.error)
    }
    return { ...result, emailLogId }
  }

  static async sendAdminSubmissionNotification(input: {
    notificationKey: string
    formName: string
    subject: string
    details: string
    lang?: "FR" | "EN" | "DE"
    replyTo?: string
    recipientName?: string
  }): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
    const lang = input.lang || "FR"
    const title = {
      FR: `Nouvelle soumission — ${input.formName}`,
      EN: `New submission — ${input.formName}`,
      DE: `Neue Einreichung — ${input.formName}`,
    }[lang]
    const html = wrapEmailHtml(
      `<p>${escapeHtml(title)}</p><p>${escapeHtml(input.details).replace(/\n/g, "<br>")}</p>`,
      lang,
      undefined
    )
    return this.sendTrackedEmail({
      notificationKey: input.notificationKey,
      actionType: "ADMIN_SUBMISSION_NOTIFICATION",
      recipientName: input.recipientName,
      templateKey: input.formName,
      metadata: { lang, formName: input.formName },
      payload: {
        to: this.getAdminEmail(),
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
        subject: input.subject,
        html,
        text: `${title}\n\n${input.details}`,
      },
    })
  }

  static async sendMembershipDecisionEmail(input: WorkflowDecisionEmailInput): Promise<{
    success: boolean
    error?: string
    emailLogId?: string
  }> {
    const lang = input.lang || "FR"
    const copy = {
      FR: {
        subject: input.status === "APPROVED" ? "Votre demande d’adhésion APTIC-R est validée" : "Suite donnée à votre demande d’adhésion APTIC-R",
        greeting: `Bonjour ${input.firstName},`,
        body: input.status === "APPROVED"
          ? `Nous avons le plaisir de vous informer que votre demande d’adhésion a été validée. Votre référence membre est ${input.memberReference || "indiquée par notre équipe"}.`
          : "Après examen, votre demande d’adhésion n’a pas été retenue. Nous vous remercions de l’intérêt porté à APTIC-R et vous souhaitons le meilleur pour la suite.",
        signature: "L’équipe APTIC-R",
      },
      EN: {
        subject: input.status === "APPROVED" ? "Your APTIC-R membership application has been approved" : "Update on your APTIC-R membership application",
        greeting: `Hello ${input.firstName},`,
        body: input.status === "APPROVED"
          ? `We are pleased to inform you that your membership application has been approved. Your member reference is ${input.memberReference || "available from our team"}.`
          : "After review, we are unable to approve your membership application. Thank you for your interest in APTIC-R, and we wish you all the best.",
        signature: "The APTIC-R team",
      },
      DE: {
        subject: input.status === "APPROVED" ? "Ihr APTIC-R-Mitgliedsantrag wurde angenommen" : "Aktualisierung zu Ihrem APTIC-R-Mitgliedsantrag",
        greeting: `Guten Tag ${input.firstName},`,
        body: input.status === "APPROVED"
          ? `Wir freuen uns, Ihnen mitzuteilen, dass Ihr Mitgliedsantrag angenommen wurde. Ihre Mitgliedsreferenz lautet ${input.memberReference || "erhalten Sie von unserem Team"}.`
          : "Nach Prüfung können wir Ihren Mitgliedsantrag leider nicht annehmen. Vielen Dank für Ihr Interesse an APTIC-R. Für Ihren weiteren Weg wünschen wir Ihnen alles Gute.",
        signature: "Das APTIC-R-Team",
      },
    }[lang]
    const content = `${copy.greeting}\n\n${copy.body}\n\n${copy.signature}\n\n${input.referenceNumber}`
    return this.sendTrackedEmail({
      notificationKey: input.notificationKey,
      recipientName: input.firstName,
      actionType: "MEMBERSHIP_DECISION",
      templateKey: input.status,
      metadata: { lang, status: input.status, referenceNumber: input.referenceNumber },
      payload: {
        to: input.email,
        replyTo: this.getOfficialContactEmail(),
        subject: copy.subject,
        html: wrapEmailHtml(`<p>${escapeHtml(copy.greeting)}</p><p>${escapeHtml(copy.body)}</p><p>${escapeHtml(copy.signature)}</p><p>${escapeHtml(input.referenceNumber)}</p>`, lang, undefined),
        text: content,
      },
    })
  }

  static async sendPartnerDecisionEmail(input: WorkflowDecisionEmailInput & {
    organization: string
  }): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
    const lang = input.lang || "FR"
    const copy = {
      FR: {
        subject: input.status === "APPROVED" ? "Suite favorable à votre demande de partenariat APTIC-R" : "Suite donnée à votre demande de partenariat APTIC-R",
        greeting: `Bonjour ${input.firstName},`,
        body: input.status === "APPROVED"
          ? `La demande de partenariat de ${input.organization} a été approuvée et l’organisation a été ajoutée au répertoire des partenaires. Notre équipe reste disponible pour échanger sur les prochaines étapes.`
          : `Après examen, nous ne sommes pas en mesure de donner une suite favorable à la demande de partenariat de ${input.organization}. Nous vous remercions de l’intérêt porté à APTIC-R.`,
        signature: "L’équipe APTIC-R",
      },
      EN: {
        subject: input.status === "APPROVED" ? "Your APTIC-R partnership request has been approved" : "Update on your APTIC-R partnership request",
        greeting: `Hello ${input.firstName},`,
        body: input.status === "APPROVED"
          ? `${input.organization}'s partnership request has been approved and the organization has been added to the partner directory. Our team is available to discuss next steps.`
          : `After review, we are unable to proceed with ${input.organization}'s partnership request. Thank you for your interest in APTIC-R.`,
        signature: "The APTIC-R team",
      },
      DE: {
        subject: input.status === "APPROVED" ? "Ihr APTIC-R-Partnerschaftsantrag wurde angenommen" : "Aktualisierung zu Ihrem APTIC-R-Partnerschaftsantrag",
        greeting: `Guten Tag ${input.firstName},`,
        body: input.status === "APPROVED"
          ? `Der Partnerschaftsantrag von ${input.organization} wurde angenommen und die Organisation in das Partnerverzeichnis aufgenommen. Unser Team steht für den Austausch über die nächsten Schritte zur Verfügung.`
          : `Nach Prüfung können wir dem Partnerschaftsantrag von ${input.organization} leider nicht entsprechen. Vielen Dank für Ihr Interesse an APTIC-R.`,
        signature: "Das APTIC-R-Team",
      },
    }[lang]
    const content = `${copy.greeting}\n\n${copy.body}\n\n${copy.signature}\n\n${input.referenceNumber}`
    return this.sendTrackedEmail({
      notificationKey: input.notificationKey,
      recipientName: input.firstName,
      actionType: "PARTNER_STATUS_CHANGE",
      templateKey: input.status,
      metadata: { lang, status: input.status, referenceNumber: input.referenceNumber },
      payload: {
        to: input.email,
        replyTo: this.getOfficialContactEmail(),
        subject: copy.subject,
        html: wrapEmailHtml(`<p>${escapeHtml(copy.greeting)}</p><p>${escapeHtml(copy.body)}</p><p>${escapeHtml(copy.signature)}</p><p>${escapeHtml(input.referenceNumber)}</p>`, lang, undefined),
        text: content,
      },
    })
  }

  static async sendProjectProposalStatusEmail(input: ProjectProposalStatusEmailInput): Promise<{
    success: boolean
    error?: string
    emailLogId?: string
  }> {
    const copy = {
      FR: {
        subject: "Mise à jour de votre proposition de projet APTIC-R",
        greeting: `Bonjour ${input.proposerName},`,
        intro: "Le statut de votre proposition de projet a été mis à jour.",
        title: "Projet",
        reference: "Référence",
        status: {
          NOUVEAU: "Nouveau",
          EN_EXAMEN: "En examen",
          INFORMATIONS_COMPLEMENTAIRES: "Informations complémentaires demandées",
          ACCEPTE_COLLABORATION: "Collaboration acceptée pour la suite des échanges",
          REFUSE: "Proposition non retenue",
        },
        note: "Cette mise à jour concerne le traitement de votre proposition. Elle ne constitue pas une promesse de financement.",
        information: "Afin de poursuivre l’examen de votre proposition, merci de nous transmettre les informations suivantes :",
        positive: "Nous souhaitons poursuivre les échanges autour de votre proposition. Cette étape ne constitue pas une promesse de financement.",
        negative: "Après examen, nous ne sommes pas en mesure de donner une suite favorable à votre proposition. Nous vous remercions de l’intérêt porté à APTIC-R.",
        signature: "L’équipe APTIC-R",
      },
      EN: {
        subject: "Update on your APTIC-R project proposal",
        greeting: `Hello ${input.proposerName},`,
        intro: "The status of your project proposal has been updated.",
        title: "Project",
        reference: "Reference",
        status: {
          NOUVEAU: "New",
          EN_EXAMEN: "Under review",
          INFORMATIONS_COMPLEMENTAIRES: "Additional information requested",
          ACCEPTE_COLLABORATION: "Collaboration accepted for further discussion",
          REFUSE: "Proposal not selected",
        },
        note: "This update concerns the review of your proposal. It is not a funding commitment.",
        information: "To continue reviewing your proposal, please provide the following information:",
        positive: "We would like to continue discussions about your proposal. This step is not a funding commitment.",
        negative: "After review, we are unable to proceed with your proposal. Thank you for your interest in APTIC-R.",
        signature: "The APTIC-R team",
      },
      DE: {
        subject: "Aktualisierung Ihres APTIC-R-Projektvorschlags",
        greeting: `Guten Tag ${input.proposerName},`,
        intro: "Der Status Ihres Projektvorschlags wurde aktualisiert.",
        title: "Projekt",
        reference: "Referenz",
        status: {
          NOUVEAU: "Neu",
          EN_EXAMEN: "In Prüfung",
          INFORMATIONS_COMPLEMENTAIRES: "Weitere Informationen angefordert",
          ACCEPTE_COLLABORATION: "Zusammenarbeit für weitere Gespräche angenommen",
          REFUSE: "Vorschlag nicht ausgewählt",
        },
        note: "Diese Aktualisierung betrifft die Bearbeitung Ihres Vorschlags. Sie ist keine Finanzierungszusage.",
        information: "Bitte übermitteln Sie uns die folgenden Informationen, damit wir Ihren Vorschlag weiter prüfen können:",
        positive: "Wir möchten den Austausch zu Ihrem Vorschlag fortsetzen. Dies ist keine Finanzierungszusage.",
        negative: "Nach Prüfung können wir Ihrem Vorschlag leider nicht weiter folgen. Vielen Dank für Ihr Interesse an APTIC-R.",
        signature: "Das APTIC-R-Team",
      },
    }[input.lang]
    const statusLabel = copy.status[input.status]
    const adminMessage = input.adminMessage?.trim()
    const statusMessage = input.status === "INFORMATIONS_COMPLEMENTAIRES"
      ? `${copy.information}${adminMessage ? `\n\n${adminMessage}` : ""}`
      : input.status === "ACCEPTE_COLLABORATION"
        ? copy.positive
        : input.status === "REFUSE"
          ? copy.negative
          : copy.note
    const html = wrapEmailHtml(
      `<p>${escapeHtml(copy.greeting)}</p><p>${escapeHtml(copy.intro)}</p><p><strong>${escapeHtml(copy.title)}:</strong> ${escapeHtml(input.title)}<br><strong>${escapeHtml(copy.reference)}:</strong> ${escapeHtml(input.referenceNumber)}<br><strong>${escapeHtml(statusLabel)}</strong></p><p>${escapeHtml(statusMessage).replace(/\n/g, "<br>")}</p><p>${escapeHtml(copy.signature)}</p>`,
      input.lang,
      undefined
    )
    const text = `${copy.greeting}\n\n${copy.intro}\n\n${copy.title}: ${input.title}\n${copy.reference}: ${input.referenceNumber}\nStatus: ${statusLabel}\n\n${statusMessage}\n\n${copy.signature}`

    return this.sendTrackedEmail({
      notificationKey: input.notificationKey,
      recipientName: input.proposerName,
      actionType: "PROJECT_PROPOSAL_STATUS",
      templateKey: input.status,
      metadata: { referenceNumber: input.referenceNumber, lang: input.lang, status: input.status },
      payload: {
        to: input.email,
        replyTo: this.getOfficialContactEmail(),
        subject: `${copy.subject} — ${statusLabel}`,
        html,
        text,
      },
    })
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

      const res = await this.sendTrackedEmail({
        notificationKey: `candidate-submission:${input.applicationId || input.referenceNumber}:visitor`,
        applicationId: input.applicationId,
        recipientName: `${input.firstName} ${input.lastName}`.trim(),
        actionType: "APPLICATION_CONFIRMATION",
        toStatus: "NEW",
        templateKey: "NEW",
        metadata: { referenceNumber: input.referenceNumber, lang },
        payload: {
          to: input.email,
          replyTo: this.getOfficialContactEmail(),
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
      })

      candidateEmailSent = res.success

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

      const adminRes = await this.sendTrackedEmail({
        notificationKey: `candidate-submission:${input.applicationId || input.referenceNumber}:admin`,
        applicationId: input.applicationId,
        recipientName: `${input.firstName} ${input.lastName}`.trim(),
        actionType: "ADMIN_SUBMISSION_NOTIFICATION",
        templateKey: "CANDIDATE_APPLICATION",
        metadata: { referenceNumber: input.referenceNumber, lang },
        payload: {
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          text: adminTemplate.text,
        },
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

      const sendResult = await this.sendTrackedEmail({
        notificationKey: input.notificationKey,
        applicationId: input.applicationId,
        recipientName: input.candidateName,
        actionType: input.status === "INTERVIEW" ? "INTERVIEW_INVITATION" : "STATUS_CHANGE",
        fromStatus: (input.fromStatus as CandidateStatus) || undefined,
        toStatus: (input.status as CandidateStatus) || undefined,
        templateKey: input.status,
        metadata: {
          ...(input.interviewDetails || {}),
          referenceNumber: input.referenceNumber,
          lang,
        },
        payload: {
          to: input.candidateEmail,
          replyTo: this.getOfficialContactEmail(),
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        },
      })

      if (sendResult.success) {
        console.log(`✉️ [EmailService] Email de statut "${input.status}" envoyé à: ${input.candidateEmail} (${input.referenceNumber})`)
        return { success: true, emailLogId: sendResult.emailLogId }
      } else {
        console.warn(`⚠️ [EmailService] Échec envoi email statut "${input.status}": ${sendResult.error}`)
        return { success: false, error: sendResult.error, emailLogId: sendResult.emailLogId }
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
      if (log.status !== "FAILED") {
        return { success: false, error: "Seuls les e-mails en échec peuvent être réexpédiés." }
      }

      const claim = await prisma.emailLog.updateMany({
        where: { id: emailLogId, status: "FAILED" },
        data: { status: "PENDING", error: null },
      })
      if (claim.count !== 1) {
        return { success: false, error: "Cet e-mail a déjà été pris en charge." }
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
      try {
        await prisma.emailLog.updateMany({
          where: { id: emailLogId, status: "PENDING" },
          data: {
            status: "FAILED",
            error: err instanceof Error ? err.message : "Erreur lors de la réexpédition.",
            sentAt: new Date(),
          },
        })
      } catch (logError) {
        console.error("[EmailService] Impossible de journaliser l'échec de la relance:", logError)
      }
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

      const res = await this.sendTrackedEmail({
        notificationKey: `partner-submission:${input.referenceNumber}:visitor`,
        recipientName: input.contactPerson,
        actionType: "PARTNER_CONFIRMATION",
        templateKey: "PARTNER_REQUEST_RECEIVED",
        metadata: { referenceNumber: input.referenceNumber, lang },
        payload: {
          to: input.email,
          replyTo: this.getOfficialContactEmail(),
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
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

      const adminRes = await this.sendTrackedEmail({
        notificationKey: `partner-submission:${input.referenceNumber}:admin`,
        recipientName: input.contactPerson,
        actionType: "ADMIN_SUBMISSION_NOTIFICATION",
        templateKey: "PARTNER_REQUEST",
        metadata: { referenceNumber: input.referenceNumber, lang },
        payload: {
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          text: adminTemplate.text,
        },
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
    emailLogId?: string
  }> {
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

      // Le nom d'affichage provient d'un formulaire public : neutralisation des
      // retours-chariot (injection d'en-têtes SMTP), guillemets et autres caractères de contrôle.
      const safeSenderName = (input.name || "Visiteur")
        .replace(/[\r\n]+/g, " ")
        .replace(/[\x00-\x1f\x7f]+/g, "")
        .replace(/["\\]/g, "'")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 90)

      const res = await this.sendTrackedEmail({
        notificationKey: input.notificationKey,
        recipientName: input.name,
        actionType: "CONTACT_NOTIFICATION",
        templateKey: "CONTACT_MESSAGE",
        metadata: { lang: input.lang || "FR", subject: input.subject },
        payload: {
        from: `"${safeSenderName} (via APTIC-R)" <${cleanSenderEmail}>`,
        to: input.routedTo,
        replyTo: input.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        },
      })

      if (res.success) {
        console.log(`🔔 [EmailService] Message de contact (${input.subject}) acheminé vers : ${input.routedTo}`)
        return { emailSent: true, emailLogId: res.emailLogId }
      } else {
        console.warn(`⚠️ [EmailService] Échec routage email contact: ${res.error}`)
        return { emailSent: false, error: res.error, emailLogId: res.emailLogId }
      }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception envoi alerte contact:", err)
      return { emailSent: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  /**
   * 6. Demande de participation à un événement (accusé PENDING, ou décision
   *    APPROVED / REJECTED / CANCELLED).
   *
   * Contrat strict : CETTE MÉTHODE NE FAIT JAMAIS ÉCHOUER L'OPÉRATION MÉTIER.
   * Elle ne lève jamais et retourne toujours un objet. Une erreur SMTP est
   * journalisée puis ignorée : valider une participation ne doit pas dépendre
   * de la disponibilité d'un serveur d'e-mail.
   */
  static async sendEventParticipationEmails(input: EventParticipationEmailInput): Promise<{
    emailSent: boolean
    error?: string
  }> {
    try {
      const template = renderEventParticipationEmail({
        decision: input.decision,
        firstName: input.firstName,
        lastName: input.lastName,
        eventTitle: input.eventTitle,
        eventDate: input.eventDate,
        eventLocation: input.eventLocation,
        lang: input.lang,
        rejectionReason: input.rejectionReason,
      })

      const res = await this.sendTrackedEmail({
        notificationKey: `event-participation:${input.requestId || input.email}:${input.decision}`,
        eventParticipationRequestId: input.requestId,
        recipientName: `${input.firstName} ${input.lastName}`.trim(),
        actionType:
          input.decision === "PENDING"
            ? "EVENT_PARTICIPATION_REQUEST"
            : "EVENT_PARTICIPATION_DECISION",
        templateKey: input.decision,
        metadata: {
          decision: input.decision,
          lang: input.lang || "FR",
          eventTitle: input.eventTitle,
        },
        payload: {
          to: input.email,
          replyTo: this.getOfficialContactEmail(),
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
      })

      if (res.success) {
        console.log(
          `✉️ [EmailService] Demande de participation [${input.decision}] notifiée : ${input.email}`
        )
        return { emailSent: true }
      }

      console.warn(
        `⚠️ [EmailService] Échec envoi email participation [${input.decision}]: ${res.error}`
      )
      return { emailSent: false, error: res.error }
    } catch (err: unknown) {
      console.error("❌ [EmailService] Exception envoi email participation:", err)
      return { emailSent: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  static async sendEventParticipationAdminNotification(input: Omit<EventParticipationEmailInput, "decision">): Promise<{
      success: boolean
      error?: string
    }> {
      const lang = input.lang || "FR"
      const copy = {
        FR: {
          subject: `Nouvelle demande de participation — ${input.eventTitle}`,
          title: "Nouvelle demande de participation à un événement",
          name: "Participant",
          email: "Adresse e-mail",
          event: "Événement",
          date: "Date",
          location: "Lieu",
        },
        EN: {
          subject: `New event participation request — ${input.eventTitle}`,
          title: "New event participation request",
          name: "Participant",
          email: "Email address",
          event: "Event",
          date: "Date",
          location: "Location",
        },
        DE: {
          subject: `Neue Veranstaltungsanfrage — ${input.eventTitle}`,
          title: "Neue Anfrage zur Veranstaltungsteilnahme",
          name: "Teilnehmende Person",
          email: "E-Mail-Adresse",
          event: "Veranstaltung",
          date: "Datum",
          location: "Ort",
        },
      }[lang]
      const details = [
        `${copy.name}: ${input.firstName} ${input.lastName}`,
        `${copy.email}: ${input.email}`,
        `${copy.event}: ${input.eventTitle}`,
        input.eventDate ? `${copy.date}: ${input.eventDate}` : "",
        input.eventLocation ? `${copy.location}: ${input.eventLocation}` : "",
      ].filter(Boolean).join("\n")
      return this.sendAdminSubmissionNotification({
        notificationKey: `event-participation:${input.requestId}:admin`,
        formName: "EVENT_PARTICIPATION",
        subject: copy.subject,
        details: `${copy.title}\n\n${details}`,
        lang,
        replyTo: input.email,
        recipientName: `${input.firstName} ${input.lastName}`.trim(),
      })
    }
}
