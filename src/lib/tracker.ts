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
