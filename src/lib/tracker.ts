import { trackAnalyticsEvent } from "./actions"

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
  // 1. Google Analytics 4
  if (typeof window !== "undefined") {
    try {
      const payload = {
        event_category: "Engagement",
        event_label: data?.source || eventName,
        language: data?.lang,
        ...data?.metadata,
      }
      
      console.log(`[Tracker] Sending GA4 event: ${eventName}`, payload)

      if (typeof (window as any).gtag === "function") {
        ;(window as any).gtag("event", eventName, payload)
      } else if ((window as any).dataLayer) {
        ;(window as any).dataLayer.push({
          event: eventName,
          ...payload,
        })
      } else {
        console.warn("[Tracker] GA4 not loaded yet")
      }
    } catch (e) {
      console.error("[Tracker] Error sending to GA4:", e)
    }
  }

  // 2. PostgreSQL Audit via Server Action (non-blocking)
  trackAnalyticsEvent(eventName, data).catch((err) => {
    console.error("Failed to track event:", err)
  })
}
