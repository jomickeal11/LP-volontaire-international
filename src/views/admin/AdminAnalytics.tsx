"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts"
import type { AnalyticsPageData } from "../../lib/dashboard"

// APTIC-R Official Brand Tokens
const BLUE = "#174F7A"
const GREEN = "#35A85A"
const BG = "#F5F7F9"
const TEXT_DARK = "#0F172A"
const TEXT_MID = "#5E6B76"
const BORDER = "#EAF0F4"

export default function AdminAnalytics({ data }: { data?: AnalyticsPageData }) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "90" | "365">("30")

  // Fallback safe state
  const ga4 = data?.ga4 || {
    connected: false,
    measurementId: null,
    visitors: null,
    sessions: null,
    newVisitors: null,
    engagementRate: null,
    trafficTrend: [],
    trafficSources: [],
  }

  const funnel = data?.funnel || {
    visitors: null,
    applyClicks: 0,
    formsStarted: 0,
    formsSubmitted: 0,
    clickToStartRate: null,
    startToSubmitRate: null,
    globalConversionRate: null,
  }

  const partnerFunnel = data?.partnerFunnel || {
    partnerClicks: 0,
    formsStarted: 0,
    requestsSubmitted: 0,
  }

  const recruitment = data?.recruitment || {
    totalApplications: 0,
    totalCandidates: 0,
    countries: [],
    languages: [],
    declaredSources: [],
    professions: [],
    durations: [],
  }

  const eventsSummary = data?.eventsSummary || []

  return (
    <div className="space-y-8 pb-12">
      {/* ── 1. En-tête ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Statistiques
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Analyse de l&apos;acquisition, de l&apos;engagement et des conversions du programme international APTIC-R.
          </p>
        </div>

        {/* Dropdown Période */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="appearance-none bg-white border border-[#EAF0F4] text-xs font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-lg shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#174F7A]/20 cursor-pointer"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
              <option value="365">12 derniers mois</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. BLOC ACQUISITION (GA4) ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Acquisition
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              Trafic Web (GA4)
            </span>
          </div>
          {!ga4.connected && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              GA4 non configuré
            </span>
          )}
        </div>

        {/* 4 KPIs d'acquisition */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#EAF0F4] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Visiteurs</span>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {ga4.visitors !== null ? ga4.visitors.toLocaleString() : "—"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {ga4.connected ? "Visiteurs uniques" : "Non connecté"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#EAF0F4] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Sessions</span>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {ga4.sessions !== null ? ga4.sessions.toLocaleString() : "—"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {ga4.connected ? "Sessions totales" : "Non connecté"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#EAF0F4] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Nouveaux visiteurs</span>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {ga4.newVisitors !== null ? ga4.newVisitors.toLocaleString() : "—"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {ga4.connected ? "Première visite" : "Non connecté"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#EAF0F4] shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Taux d&apos;engagement</span>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {ga4.engagementRate !== null ? `${ga4.engagementRate}%` : "—"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {ga4.connected ? "Sessions avec interaction" : "Non connecté"}
            </div>
          </div>
        </div>

        {/* Graphique Trafic + Sources GA4 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Évolution du trafic */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#EAF0F4] shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Évolution du trafic
              </h3>
              <span className="text-xs text-slate-400">Vue chronologique</span>
            </div>

            {ga4.connected && ga4.trafficTrend.length > 0 ? (
              <div className="flex-1 min-h-[190px]">
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={ga4.trafficTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="visitors" stroke={BLUE} strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-700">Données de trafic non disponibles</div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Configurez <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-600">GA4_MEASUREMENT_ID</code> pour afficher la courbe d&apos;évolution des visiteurs en temps réel.
                </p>
              </div>
            )}
          </div>

          {/* Sources de trafic web */}
          <div className="bg-white rounded-xl p-5 border border-[#EAF0F4] shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Sources de trafic web
              </h3>
              <span className="text-xs text-slate-400">Canaux GA4</span>
            </div>

            {ga4.connected ? (
              <div className="flex flex-col gap-3">
                {ga4.trafficSources.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{s.name}</span>
                    <span className="font-mono font-bold text-slate-800">{s.value ?? "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center space-y-3 p-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Google Search</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>LinkedIn</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Instagram</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Trafic direct / Partage</span>
                  <span className="font-mono text-slate-400">—</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400 italic text-center">
                  En attente de connexion Google Analytics
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. BLOC CONVERSION (Funnel & Candidatures) ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Conversion
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Parcours vers la candidature
          </span>
        </div>

        {/* Parcours de conversion Volontaires (Funnel pleine largeur) */}
        <div className="bg-white rounded-xl p-5 border border-[#EAF0F4] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Parcours de conversion des volontaires
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Progression mesurée du visiteur jusqu&apos;à la soumission du dossier.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Candidatures reçues : </span>
              <span className="text-sm font-bold font-mono text-[#174F7A]">
                {funnel.formsSubmitted}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Étape 1 : Visiteurs */}
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/70 relative flex flex-col">
              <span className="text-xs text-slate-500 block mb-1">1. Visiteurs</span>
              <div className="text-2xl font-bold font-mono text-slate-700">
                {ga4.visitors !== null ? ga4.visitors.toLocaleString() : "—"}
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Source : GA4</span>
              </div>
            </div>

            {/* Étape 2 : Clics Postuler */}
            <div className="p-4 rounded-xl border border-blue-100 bg-[#E8F2FA]/40 relative flex flex-col">
              <span className="text-xs text-[#174F7A] font-semibold block mb-1">2. Clics « Postuler »</span>
              <div className="text-2xl font-bold font-mono text-[#174F7A]">
                {funnel.applyClicks}
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-400/80">Source : GA4</span>
                <span className="text-[11px] font-medium text-slate-500">
                  {ga4.visitors ? `${Math.min(100, Math.round((funnel.applyClicks / ga4.visitors) * 100))}%` : "—"}
                </span>
              </div>
            </div>

            {/* Étape 3 : Formulaires commencés */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 relative flex flex-col">
              <span className="text-xs text-indigo-900 font-semibold block mb-1">3. Formulaires commencés</span>
              <div className="text-2xl font-bold font-mono text-indigo-900">
                {funnel.formsStarted}
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400/80">Source : GA4</span>
                <span className="text-[11px] font-medium text-slate-500">
                  {funnel.applyClicks > 0 ? `${Math.min(100, Math.round((funnel.formsStarted / funnel.applyClicks) * 100))}%` : "—"}
                </span>
              </div>
            </div>

            {/* Étape 4 : Candidatures envoyées */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-[#EAF5ED]/60 relative flex flex-col">
              <span className="text-xs text-[#2E7D52] font-semibold block mb-1">4. Candidatures soumises</span>
              <div className="text-2xl font-bold font-mono text-[#2E7D52]">
                {funnel.formsSubmitted}
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-500/80">Source : PostgreSQL</span>
                <span className="text-[11px] font-medium text-slate-600">
                  {funnel.formsStarted > 0 ? `${Math.min(100, Math.round((funnel.formsSubmitted / funnel.formsStarted) * 100))}%` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Parcours Partenaires (Compact) */}
        <div className="bg-white rounded-xl p-5 border border-[#EAF0F4] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Conversion Partenaires & Organisations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Organismes d&apos;envoi, universités et ONGs européennes.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#174F7A] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {partnerFunnel.requestsSubmitted} demande(s) officielle(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
              <span className="text-xs text-slate-500 block mb-1">Clics « Devenir partenaire »</span>
              <div className="text-xl font-bold font-mono text-slate-700">{partnerFunnel.partnerClicks}</div>
              <div className="mt-auto pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Source : GA4</span>
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col">
              <span className="text-xs text-slate-500 block mb-1">Formulaires partenariat commencés</span>
              <div className="text-xl font-bold font-mono text-slate-700">{partnerFunnel.formsStarted}</div>
              <div className="mt-auto pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Source : GA4</span>
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#EAF5ED]/60 border border-emerald-200 flex flex-col">
              <span className="text-xs text-[#2E7D52] font-semibold block mb-1">Demandes finalisées</span>
              <div className="text-xl font-bold font-mono text-[#2E7D52]">{partnerFunnel.requestsSubmitted}</div>
              <div className="mt-auto pt-2">
                <span className="text-[10px] uppercase font-bold text-emerald-500/80">Source : PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pays & Langues (2 colonnes) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Candidatures par pays */}
          <div className="bg-white rounded-xl p-5 border border-[#EAF0F4] shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Candidatures par pays
                </h3>
                <span className="text-xs text-slate-400">Origine déclarée des candidats</span>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {recruitment.countries.length} pays
              </span>
            </div>

            {recruitment.countries.length > 0 ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="h-[200px] mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={recruitment.countries.slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="country"
                        tick={{ fontSize: 11, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {recruitment.countries.slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={i === 0 ? BLUE : i === 1 ? "#206294" : i === 2 ? GREEN : "#94A3B8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {recruitment.countries.slice(0, 5).map((c) => (
                    <span key={c.country} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {c.country} <strong className="text-slate-800">{c.percentage}%</strong>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
                Aucune candidature sur la période
              </div>
            )}
          </div>

          {/* Candidatures par langue & Source déclarée */}
          <div className="bg-white rounded-xl p-5 border border-[#EAF0F4] shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Candidatures par langue & Découverte
                </h3>
                <span className="text-xs text-slate-400">Préférences et sources déclarées</span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {/* Langues */}
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Langue choisie
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {recruitment.languages.map((l) => (
                    <div key={l.lang} className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
                      <div className="text-lg font-bold font-mono text-[#174F7A]">{l.percentage}%</div>
                      <div className="text-xs text-slate-500 font-medium">{l.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{l.count} doss.</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source déclarée */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Comment nous ont-ils découverts ?
                </span>
                <div className="flex flex-col gap-2">
                  {recruitment.declaredSources.length > 0 ? (
                    recruitment.declaredSources.slice(0, 4).map((s) => (
                      <div key={s.source} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium truncate max-w-[200px]">{s.source}</span>
                        <span className="font-mono font-semibold text-slate-800">{s.count} ({s.percentage}%)</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">Aucune source renseignée</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BLOC ÉVÉNEMENTS MÉTIER (Tableau synthétique) ──────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Événements Métier
            </span>
            <span className="text-xs text-slate-400">
              Journal des actions métiers critiques (PostgreSQL)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#EAF0F4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Événement</th>
                  <th className="py-3 px-4">Identifiant technique</th>
                  <th className="py-3 px-4 text-right">Occurrences</th>
                  <th className="py-3 px-4 text-right">Dernière capture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventsSummary.map((ev) => (
                  <tr key={ev.eventName} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {ev.label}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {ev.eventName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#174F7A]">
                      {ev.count}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {ev.lastOccurred || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
