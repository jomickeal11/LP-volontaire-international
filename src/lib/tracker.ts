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
  // 1. Google Analytics 4 (if loaded on window.gtag)
  if (typeof window !== "undefined" && (window as any).gtag) {
    try {
      ;(window as any).gtag("event", eventName, {
        event_category: "Engagement",
        event_label: data?.source || eventName,
        language: data?.lang,
        ...data?.metadata,
      })
    } catch {
      // ignore
    }
  }

  // 2. PostgreSQL Audit via Server Action (non-blocking)
  trackAnalyticsEvent(eventName, data).catch((err) => {
    console.error("Failed to track event:", err)
  })
}
