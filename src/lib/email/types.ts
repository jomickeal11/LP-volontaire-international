export interface EmailPayload {
  to: string | string[]
  from?: string
  subject: string
  html: string
  text?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailProvider {
  readonly name: string
  sendEmail(payload: EmailPayload): Promise<EmailSendResult>
}
