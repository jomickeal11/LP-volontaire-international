import { trackAnalyticsEvent } from "./actions"
import { getCookieConsent } from "./cookieConsent"

export function trackEvent(
  eventName: string,
  data?: {
    lang?: string
    country?: string
    source?: string
    metadata?: Record<string, any>
  }
) {
  // Prevent duplicate funnel events per session
  if (typeof window !== "undefined") {
    const ONE_TIME_EVENTS = [
      "apply_now_click",
      "application_started",
      "partner_request_click",
      "partner_request_started"
    ]
    
    if (ONE_TIME_EVENTS.includes(eventName)) {
      if (sessionStorage.getItem(`tracked_${eventName}`)) {
        return // Already tracked in this session
      }
      sessionStorage.setItem(`tracked_${eventName}`, "true")
    }
  }

  // 1. Google Analytics 4 (uniquement si le visiteur a explicitement consenti)
  if (typeof window !== "undefined") {
    const consent = getCookieConsent()
    if (consent?.analytics) {
      try {
        const payload = {
          event_category: "Engagement",
          event_label: data?.source || eventName,
          language: data?.lang,
          ...data?.metadata,
        }

        if (typeof (window as any).gtag === "function") {
          ;(window as any).gtag("event", eventName, payload)
        } else if ((window as any).dataLayer) {
          ;(window as any).dataLayer.push({
            event: eventName,
            ...payload,
          })
        }
      } catch (e) {
        console.error("[Tracker] Error sending to GA4:", e)
      }
    }
  }

  // 2. PostgreSQL Audit via Server Action (non-blocking)
  trackAnalyticsEvent(eventName, data).catch((err) => {
    console.error("Failed to track event:", err)
  })
}
