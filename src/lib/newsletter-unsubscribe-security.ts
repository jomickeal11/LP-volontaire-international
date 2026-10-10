/** Validate browser POST provenance against the application's configured origin. */
export function isAllowedNewsletterUnsubscribeOrigin(input: {
  origin: string | null
  referer: string | null
  requestOrigin: string
  expectedOrigin: string
}): boolean {
  let expectedOrigin: string
  let requestOrigin: string
  try {
    expectedOrigin = new URL(input.expectedOrigin).origin
    requestOrigin = new URL(input.requestOrigin).origin
  } catch {
    return false
  }

  if (requestOrigin !== expectedOrigin) return false

  // Prefer Origin for POST; when absent, accept only a parseable same-origin Referer.
  const suppliedOrigin = input.origin ?? (input.referer ? (() => {
    try {
      return new URL(input.referer!).origin
    } catch {
      return null
    }
  })() : null)

  return suppliedOrigin === expectedOrigin
}

/** Invalid, expired and successful tokens deliberately share the public result. */
export function genericNewsletterUnsubscribeResult(
  _result: "processed" | "invalid" | "expired",
): { success: true } {
  return { success: true }
}
