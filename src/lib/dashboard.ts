import prisma from "./prisma"
import type { CandidateStatus, MissionDuration, LanguageCode } from "@prisma/client"

export interface DashboardData {
  overview: {
    totalApplications: number
    newApplications: number
    inReview: number
    interviews: number
    selected: number
    preparation: number
    arrived: number
    completed: number
  }
  monthlyTrend: {
    month: string // e.g. "Jan 26", "Fév 26"
    yearMonth: string // "2026-09"
    applications: number
  }[]
  funnel: {
    stage: string
    count: number
    percentage: number
    description: string
  }[]
  statusBreakdown: {
    status: CandidateStatus
    label: string
    count: number
    color: string
    textColor: string
  }[]
  countryDistribution: {
    country: string
    count: number
    percentage: number
  }[]
  languageDistribution: {
    lang: LanguageCode
    label: string
    count: number
    percentage: number
  }[]
  durationDistribution: {
    duration: MissionDuration
    label: string
    count: number
    percentage: number
  }[]
  professionDistribution: {
    profession: string
    count: number
  }[]
  fieldDistribution: {
    field: string
    count: number
  }[]
  sourceDistribution: {
    source: string
    count: number
    percentage: number
  }[]
  analyticsSource: {
    connected: boolean
    provider: string
    message: string
  }
}

export interface AnalyticsPageData {
  period: string
  // Web Analytics (GA4)
  ga4: {
    connected: boolean
    measurementId: string | null
    visitors: number | null
    sessions: number | null
    newVisitors: number | null
    engagementRate: number | null
    trafficTrend: { date: string; visitors: number | null }[]
    trafficSources: { source: string; sessions: number | null; percentage: number | null }[]
  }
  // Funnel conversion events (from Postgres)
  funnel: {
    visitors: number | null // from GA4 or null
    applyClicks: number
    formsStarted: number
    formsSubmitted: number
    clickToStartRate: number | null
    startToSubmitRate: number | null
    globalConversionRate: number | null
  }
  // Partner conversion
  partnerFunnel: {
    partnerClicks: number
    formsStarted: number
    requestsSubmitted: number
  }
  // Recruitment analytics (from Postgres candidates)
  recruitment: {
    totalApplications: number
    totalCandidates: number
    countries: { country: string; count: number; percentage: number }[]
    languages: { lang: string; label: string; count: number; percentage: number }[]
    declaredSources: { source: string; count: number; percentage: number }[]
    professions: { profession: string; count: number }[]
    durations: { label: string; count: number; percentage: number }[]
  }
  // System Events Table
  eventsSummary: {
    eventName: string
    label: string
    count: number
    lastOccurred: string | null
  }[]
}

export async function getDashboardStats(): Promise<DashboardData> {
  // 1. Fetch all candidatures with candidate and skill relations
  const applications = await prisma.candidature.findMany({
    include: {
      candidate: true,
      skills: {
        include: { skill: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const totalApplications = applications.length

  // Exact current status counts (strictly 1:1 with DB application.status)
  const statusCounts: Record<CandidateStatus, number> = {
    NEW: 0,
    REVIEW: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    CHOSEN: 0,
    PARTNER_VALIDATION: 0,
    PREPARATION: 0,
    ARRIVED: 0,
    COMPLETED: 0,
    REJECTED: 0,
    ARCHIVED: 0,
  }

  applications.forEach((app) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++
    }
  })

  // 2. Overview metrics (strictly based on CURRENT status)
  const overview = {
    totalApplications,
    newApplications: statusCounts.NEW,
    inReview: statusCounts.REVIEW,
    interviews: statusCounts.INTERVIEW,
    selected: statusCounts.SELECTED + statusCounts.CHOSEN,
    preparation: statusCounts.PREPARATION + statusCounts.PARTNER_VALIDATION,
    arrived: statusCounts.ARRIVED,
    completed: statusCounts.COMPLETED,
  }

  // 3. Monthly Trend (last 6 months dynamically generated based on createdAt)
  const monthNamesFr = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"]
  const now = new Date()
  const monthlyTrendMap: Record<string, { month: string; yearMonth: string; applications: number }> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthlyTrendMap[ym] = {
      month: `${monthNamesFr[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
      yearMonth: ym,
      applications: 0,
    }
  }

  applications.forEach((app) => {
    const d = new Date(app.createdAt)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (monthlyTrendMap[ym]) {
      monthlyTrendMap[ym].applications++
    }
  })

  const monthlyTrend = Object.values(monthlyTrendMap)

  // 4. Pipeline par étape actuelle (Recruitment stages distribution)
  // Reflects the exact count of candidates CURRENTLY located at each step of the pipeline
  // Candidatures déposées = Total des candidatures
  // Évaluation = dossiers actuellement en REVIEW
  // Entretiens = dossiers actuellement en INTERVIEW
  // Sélectionnés = dossiers actuellement en SELECTED ou CHOSEN
  // Préparation = dossiers actuellement en PREPARATION ou PARTNER_VALIDATION
  // Arrivés = dossiers actuellement en ARRIVED ou COMPLETED
  const countInEvaluation = statusCounts.REVIEW
  const countInInterview = statusCounts.INTERVIEW
  const countSelected = statusCounts.SELECTED + statusCounts.CHOSEN
  const countPreparation = statusCounts.PREPARATION + statusCounts.PARTNER_VALIDATION
  const countArrived = statusCounts.ARRIVED + statusCounts.COMPLETED

  const funnel = [
    {
      stage: "Total candidatures reçues",
      count: totalApplications,
      percentage: totalApplications > 0 ? 100 : 0,
      description: "Total des dossiers enregistrés dans le système",
    },
    {
      stage: "Dossiers en cours d'évaluation",
      count: countInEvaluation,
      percentage: totalApplications > 0 ? Math.round((countInEvaluation / totalApplications) * 100) : 0,
      description: "Candidatures actuellement au statut En révision",
    },
    {
      stage: "Candidats en phase d'entretien",
      count: countInInterview,
      percentage: totalApplications > 0 ? Math.round((countInInterview / totalApplications) * 100) : 0,
      description: "Candidatures actuellement au statut Entretien",
    },
    {
      stage: "Candidats retenus & sélectionnés",
      count: countSelected,
      percentage: totalApplications > 0 ? Math.round((countSelected / totalApplications) * 100) : 0,
      description: "Candidatures actuellement au statut Sélectionné ou Retenu",
    },
    {
      stage: "En préparation & logistique départ",
      count: countPreparation,
      percentage: totalApplications > 0 ? Math.round((countPreparation / totalApplications) * 100) : 0,
      description: "Candidatures en validation partenaire ou préparation",
    },
    {
      stage: "Volontaires arrivés en mission",
      count: countArrived,
      percentage: totalApplications > 0 ? Math.round((countArrived / totalApplications) * 100) : 0,
      description: "Candidatures actuellement arrivées sur le terrain",
    },
  ]

  // 5. Status Breakdown (Consistent branding tokens)
  const statusLabels: Record<CandidateStatus, { label: string; color: string; textColor: string }> = {
    NEW: { label: "Nouveau", color: "#E8F2FA", textColor: "#174F7A" },
    REVIEW: { label: "En révision", color: "#F1F5F9", textColor: "#334155" },
    INTERVIEW: { label: "Entretien", color: "#EAF2F8", textColor: "#174F7A" },
    SELECTED: { label: "Sélectionné", color: "#EAF5ED", textColor: "#277543" },
    CHOSEN: { label: "Retenu", color: "#EAF5ED", textColor: "#277543" },
    PARTNER_VALIDATION: { label: "Val. Partenaire", color: "#F8FAFC", textColor: "#475569" },
    PREPARATION: { label: "Préparation", color: "#F8FAFC", textColor: "#475569" },
    ARRIVED: { label: "Arrivé", color: "#EAF5ED", textColor: "#1E5E35" },
    COMPLETED: { label: "Terminé", color: "#F1F5F9", textColor: "#334155" },
    REJECTED: { label: "Non retenu", color: "#FEE2E2", textColor: "#991B1B" },
    ARCHIVED: { label: "Archivé", color: "#F1F5F9", textColor: "#64748B" },
  }

  const statusBreakdown = (Object.keys(statusLabels) as CandidateStatus[]).map((st) => ({
    status: st,
    label: statusLabels[st].label,
    count: statusCounts[st] || 0,
    color: statusLabels[st].color,
    textColor: statusLabels[st].textColor,
  }))

  // 6. Geographic Distribution (Countries)
  const countryMap: Record<string, number> = {}
  applications.forEach((app) => {
    const c = app.candidate.country?.trim() || "Non spécifié"
    countryMap[c] = (countryMap[c] || 0) + 1
  })
  const countryDistribution = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count,
      percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // 7. Language Distribution
  const langMap: Record<LanguageCode, number> = { FR: 0, EN: 0, DE: 0 }
  applications.forEach((app) => {
    if (langMap[app.lang] !== undefined) {
      langMap[app.lang]++
    }
  })
  const langNames: Record<LanguageCode, string> = {
    FR: "Français",
    EN: "Anglais",
    DE: "Allemand",
  }
  const languageDistribution = (Object.keys(langMap) as LanguageCode[]).map((lang) => ({
    lang,
    label: langNames[lang],
    count: langMap[lang],
    percentage: totalApplications > 0 ? Math.round((langMap[lang] / totalApplications) * 100) : 0,
  }))

  // 8. Desired Duration Distribution
  const durationMap: Record<MissionDuration, number> = {
    SIX_MONTHS: 0,
    NINE_MONTHS: 0,
    TWELVE_MONTHS: 0,
  }
  applications.forEach((app) => {
    if (durationMap[app.duration] !== undefined) {
      durationMap[app.duration]++
    }
  })
  const durationLabels: Record<MissionDuration, string> = {
    SIX_MONTHS: "6 mois",
    NINE_MONTHS: "9 mois",
    TWELVE_MONTHS: "12 mois",
  }
  const durationDistribution = (Object.keys(durationMap) as MissionDuration[]).map((dur) => ({
    duration: dur,
    label: durationLabels[dur],
    count: durationMap[dur],
    percentage: totalApplications > 0 ? Math.round((durationMap[dur] / totalApplications) * 100) : 0,
  }))

  // 9. Profession / Métier Distribution (Strictly from candidate profession field)
  const profMap: Record<string, number> = {}
  applications.forEach((app) => {
    const p = app.profession?.trim() || "Non spécifié"
    profMap[p] = (profMap[p] || 0) + 1
  })
  const professionDistribution = Object.entries(profMap)
    .map(([profession, count]) => ({ profession, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 10. Field of Study Distribution
  const fieldMap: Record<string, number> = {}
  applications.forEach((app) => {
    const f = app.fieldOfStudy?.trim() || "Non spécifié"
    fieldMap[f] = (fieldMap[f] || 0) + 1
  })
  const fieldDistribution = Object.entries(fieldMap)
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 11. Acquisition Source Distribution (Cahier des charges: analyse par source)
  const sourceMap: Record<string, number> = {}
  applications.forEach((app) => {
    const s = app.source?.trim() || "Candidature directe"
    sourceMap[s] = (sourceMap[s] || 0) + 1
  })
  const sourceDistribution = Object.entries(sourceMap)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // 12. Analytics Source Status (GA4)
  const analyticsSource = {
    connected: false,
    provider: "Google Analytics 4",
    message: "Source de données web non connectée. Le suivi des visiteurs sera activé dès la configuration de GA4_MEASUREMENT_ID.",
  }

  return {
    overview,
    monthlyTrend,
    funnel,
    statusBreakdown,
    countryDistribution,
    languageDistribution,
    durationDistribution,
    professionDistribution,
    fieldDistribution,
    sourceDistribution,
    analyticsSource,
  }
}

export async function getAnalyticsPageStats(days = 30): Promise<AnalyticsPageData> {
  const periodLabel = `Derniers ${days} jours`
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // 1. Check GA4 environment variable
  const ga4Id = process.env.NEXT_PUBLIC_GA_ID || process.env.GA4_MEASUREMENT_ID || null
  const isGa4Connected = Boolean(ga4Id)

  // 2. Query Postgres applications
  const [applications, totalCandidates, events] = await Promise.all([
    prisma.candidature.findMany({
      where: { createdAt: { gte: cutoffDate } },
      include: { candidate: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidat.count(),
    (prisma as any).evenementStatistique.findMany({
      where: { createdAt: { gte: cutoffDate } },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ])

  // Count events
  const eventCounts: Record<string, { count: number; lastDate: Date | null }> = {
    apply_now_click: { count: 0, lastDate: null },
    application_started: { count: 0, lastDate: null },
    application_submitted: { count: 0, lastDate: null },
    partner_request_click: { count: 0, lastDate: null },
    partner_request_started: { count: 0, lastDate: null },
    partner_request_submitted: { count: 0, lastDate: null },
    volunteer_guide_download: { count: 0, lastDate: null },
    language_switch: { count: 0, lastDate: null },
    contact_click: { count: 0, lastDate: null },
  }

  events.forEach((ev: any) => {
    if (!eventCounts[ev.name]) {
      eventCounts[ev.name] = { count: 0, lastDate: null }
    }
    eventCounts[ev.name].count++
    if (!eventCounts[ev.name].lastDate || new Date(ev.createdAt) > eventCounts[ev.name].lastDate!) {
      eventCounts[ev.name].lastDate = new Date(ev.createdAt)
    }
  })

  // Ensure submitted matches DB counts if events weren't triggered prior
  const formsSubmitted = Math.max(eventCounts.application_submitted.count, applications.length)
  const applyClicks = eventCounts.apply_now_click.count
  const formsStarted = Math.max(eventCounts.application_started.count, formsSubmitted)

  // Partner counts
  const partnerRequestsSubmitted = await (prisma as any).demandePartenariat.count({
    where: { createdAt: { gte: cutoffDate } },
  }).catch(() => 0)

  // Countries
  const countryMap: Record<string, number> = {}
  applications.forEach((app) => {
    const c = app.candidate.country?.trim() || "Non spécifié"
    countryMap[c] = (countryMap[c] || 0) + 1
  })
  const countries = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count,
      percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Languages
  const langMap: Record<string, number> = { FR: 0, EN: 0, DE: 0 }
  applications.forEach((app) => {
    const l = app.lang || "FR"
    langMap[l] = (langMap[l] || 0) + 1
  })
  const langLabels: Record<string, string> = {
    FR: "Français",
    EN: "Anglais",
    DE: "Allemand",
  }
  const languages = Object.entries(langMap).map(([lang, count]) => ({
    lang,
    label: langLabels[lang] || lang,
    count,
    percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0,
  }))

  // Declared Sources
  const sourceMap: Record<string, number> = {}
  applications.forEach((app) => {
    const s = app.source?.trim() || "Candidature directe"
    sourceMap[s] = (sourceMap[s] || 0) + 1
  })
  const declaredSources = Object.entries(sourceMap)
    .map(([source, count]) => ({
      source,
      count,
      percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Professions
  const profMap: Record<string, number> = {}
  applications.forEach((app) => {
    const p = app.profession?.trim() || "Non spécifié"
    profMap[p] = (profMap[p] || 0) + 1
  })
  const professions = Object.entries(profMap)
    .map(([profession, count]) => ({ profession, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Durations
  const durMap: Record<string, number> = { SIX_MONTHS: 0, NINE_MONTHS: 0, TWELVE_MONTHS: 0 }
  applications.forEach((app) => {
    if (durMap[app.duration] !== undefined) {
      durMap[app.duration]++
    }
  })
  const durLabels: Record<string, string> = {
    SIX_MONTHS: "6 mois",
    NINE_MONTHS: "9 mois",
    TWELVE_MONTHS: "12 mois",
  }
  const durations = Object.entries(durMap).map(([dur, count]) => ({
    label: durLabels[dur] || dur,
    count,
    percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0,
  }))

  // Events summary list
  const eventMeta: Record<string, string> = {
    apply_now_click: "Clic sur « Postuler »",
    application_started: "Formulaire volontaire commencé",
    application_submitted: "Candidature soumise",
    partner_request_click: "Clic sur « Devenir partenaire »",
    partner_request_started: "Formulaire partenaire commencé",
    partner_request_submitted: "Demande de partenariat soumise",
    volunteer_guide_download: "Téléchargement guide du volontaire",
    language_switch: "Changement de langue",
    contact_click: "Clic contact / WhatsApp / Email",
  }

  const eventsSummary = Object.keys(eventMeta).map((name) => ({
    eventName: name,
    label: eventMeta[name],
    count: eventCounts[name]?.count || (name === "application_submitted" ? applications.length : name === "partner_request_submitted" ? partnerRequestsSubmitted : 0),
    lastOccurred: eventCounts[name]?.lastDate
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(eventCounts[name].lastDate!)
      : null,
  }))

  return {
    period: periodLabel,
    ga4: {
      connected: isGa4Connected,
      measurementId: ga4Id,
      visitors: null,
      sessions: null,
      newVisitors: null,
      engagementRate: null,
      trafficTrend: [
        { date: "Sem 1", visitors: null },
        { date: "Sem 2", visitors: null },
        { date: "Sem 3", visitors: null },
        { date: "Sem 4", visitors: null },
      ],
      trafficSources: [
        { source: "Google Search", sessions: null, percentage: null },
        { source: "LinkedIn", sessions: null, percentage: null },
        { source: "Instagram", sessions: null, percentage: null },
        { source: "Direct", sessions: null, percentage: null },
      ],
    },
    funnel: {
      visitors: null,
      applyClicks,
      formsStarted,
      formsSubmitted,
      clickToStartRate: applyClicks > 0 ? Math.round((formsStarted / applyClicks) * 100) : null,
      startToSubmitRate: formsStarted > 0 ? Math.round((formsSubmitted / formsStarted) * 100) : null,
      globalConversionRate: null,
    },
    partnerFunnel: {
      partnerClicks: eventCounts.partner_request_click?.count || 0,
      formsStarted: eventCounts.partner_request_started?.count || partnerRequestsSubmitted,
      requestsSubmitted: partnerRequestsSubmitted,
    },
    recruitment: {
      totalApplications: applications.length,
      totalCandidates,
      countries,
      languages,
      declaredSources,
      professions,
      durations,
    },
    eventsSummary,
  }
}
