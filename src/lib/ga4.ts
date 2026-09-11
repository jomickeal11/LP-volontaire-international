import { BetaAnalyticsDataClient } from "@google-analytics/data"

export interface GA4Data {
  connected: boolean
  measurementId: string | null
  visitors: number | null
  sessions: number | null
  newVisitors: number | null
  engagementRate: number | null
  trafficTrend: { date: string; visitors: number; sessions: number }[]
  trafficSources: { name: string; value: number }[]
  events?: Record<string, number>
}

// Ensure the private key is properly formatted with newlines
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined
  return key.replace(/\\n/g, "\n")
}

export async function getGA4Data(days: number): Promise<GA4Data> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const clientEmail = process.env.GA4_CLIENT_EMAIL
  const privateKey = formatPrivateKey(process.env.GA4_PRIVATE_KEY)

  const defaultData: GA4Data = {
    connected: false,
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || null,
    visitors: null,
    sessions: null,
    newVisitors: null,
    engagementRate: null,
    trafficTrend: [],
    trafficSources: [],
  }

  if (!propertyId || !clientEmail || !privateKey) {
    return defaultData
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    })

    const startDate = `${days}daysAgo`
    const endDate = "today"

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "engagementRate" },
      ],
    })

    const totalsRow = response.rows?.[0]
    const visitors = totalsRow ? parseInt(totalsRow.metricValues?.[0].value || "0") : 0
    const sessions = totalsRow ? parseInt(totalsRow.metricValues?.[1].value || "0") : 0
    const newVisitors = totalsRow ? parseInt(totalsRow.metricValues?.[2].value || "0") : 0
    const engagementRate = totalsRow ? parseFloat(totalsRow.metricValues?.[3].value || "0") * 100 : 0

    // Fetch Trend Data
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    })

    const trafficTrend = (trendResponse.rows || []).map((row) => {
      const dateStr = row.dimensionValues?.[0].value || ""
      // Format YYYYMMDD to DD/MM
      const formattedDate = dateStr.length === 8 ? `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}` : dateStr
      return {
        date: formattedDate,
        visitors: parseInt(row.metricValues?.[0].value || "0"),
        sessions: parseInt(row.metricValues?.[1].value || "0"),
      }
    })

    // Fetch Traffic Sources
    const [sourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 5,
    })

    const trafficSources = (sourceResponse.rows || []).map((row) => ({
      name: row.dimensionValues?.[0].value || "Direct",
      value: parseInt(row.metricValues?.[0].value || "0"),
    }))

    // Fetch Events Counts
    const [eventsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: [
              "apply_now_click",
              "application_started",
              "partner_request_click",
              "partner_request_started",
            ],
          },
        },
      },
    })

    const events: Record<string, number> = {
      apply_now_click: 0,
      application_started: 0,
      partner_request_click: 0,
      partner_request_started: 0,
    }

    if (eventsResponse.rows) {
      eventsResponse.rows.forEach((row) => {
        const eventName = row.dimensionValues?.[0].value
        const count = parseInt(row.metricValues?.[0].value || "0")
        if (eventName && events[eventName] !== undefined) {
          events[eventName] = count
        }
      })
    }

    return {
      connected: true,
      measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || null,
      visitors,
      sessions,
      newVisitors,
      engagementRate,
      trafficTrend,
      trafficSources,
      events,
    }
  } catch (error) {
    console.error("Error fetching GA4 data:", error)
    return defaultData
  }
}
