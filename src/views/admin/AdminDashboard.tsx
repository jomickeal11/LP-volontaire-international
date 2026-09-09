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
} from "recharts"
import type { Page } from "../../types"
import type { DashboardData } from "../../lib/dashboard"
import { getAdminTranslations } from "../../i18n/adminTranslations"

// APTIC-R Official Brand Tokens
const BLUE = "#174F7A"
const GREEN = "#35A85A"
const BG = "#F5F7F9"
const TEXT_DARK = "#0F172A"
const TEXT_MID = "#475569"
const BORDER = "#EAF0F4"

function KpiCard({
  label,
  value,
  sublabel,
  icon,
  color,
  highlight = false,
}: {
  label: string
  value: number | string
  sublabel?: string
  icon: React.ReactNode
  color: string
  highlight?: boolean
}) {
  return (
    <div
      className="flex flex-col p-4 rounded-xl bg-white transition-all shadow-xs"
      style={{
        border: `1px solid ${highlight ? color + "30" : BORDER}`,
        backgroundColor: highlight ? "#F8FAFC" : "#FFFFFF",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + "14", color }}
        >
          {icon}
        </div>
      </div>
      <div
        className="text-2xl font-bold font-mono tracking-tight"
        style={{ color: TEXT_DARK }}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
          {sublabel}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard({
  data,
  navigate,
  lang = "fr",
}: {
  data: DashboardData
  navigate: (p: Page) => void
  lang?: string
}) {
  const t = getAdminTranslations(lang)
  const {
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
  } = data

  const [activeAnalysisTab, setActiveAnalysisTab] = useState<"geo" | "lang" | "source">("geo")

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Metadata & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: TEXT_DARK }}>
              {t.nav.dashboard}
            </h1>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: "#E6F4EC",
                color: GREEN,
                borderColor: "#C6E7D1",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PostgreSQL Direct
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pilotage opérationnel du Programme Volontaire International APTIC-R.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("admin-applications")}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg text-white transition-colors cursor-pointer shadow-xs"
            style={{ backgroundColor: BLUE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#123f63")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE)}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {t.nav.applications}
          </button>
        </div>
      </div>

      {/* 2. Core Recruitment KPI Grid (Mapped 1:1 to Business Statuses) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label={t.common.totalApplications}
          value={overview.totalApplications}
          sublabel="Base active"
          color={BLUE}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KpiCard
          label={t.common.newApplications}
          value={overview.newApplications}
          sublabel={t.statuses.NEW}
          color={BLUE}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <KpiCard
          label={t.common.inReview}
          value={overview.inReview}
          sublabel={t.statuses.REVIEW}
          color={BLUE}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <KpiCard
          label={t.common.interviews}
          value={overview.interviews}
          sublabel={t.statuses.INTERVIEW}
          color={BLUE}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <KpiCard
          label={t.common.selectedCandidates}
          value={overview.selected}
          sublabel={`${t.statuses.SELECTED} / ${t.statuses.CHOSEN}`}
          color={GREEN}
          highlight
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label={t.common.arrivedTogo}
          value={overview.arrived}
          sublabel={t.statuses.ARRIVED}
          color={GREEN}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* 3. Section: Évolution temporelle & Pipeline de recrutement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Évolution temporelle réelle (Candidatures par mois) */}
        <div
          className="bg-white rounded-xl p-5 shadow-xs flex flex-col justify-between"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: TEXT_DARK }}>
                Évolution des dépôts de candidature
              </h3>
              <p className="text-[11px] text-slate-500">
                Volume mensuel basé sur la date d'enregistrement (<code className="font-mono text-[10px]">createdAt</code>).
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              6 derniers mois
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  itemStyle={{ color: BLUE, fontWeight: 600 }}
                  labelStyle={{ color: TEXT_DARK, fontWeight: 700 }}
                />
                <Bar
                  dataKey="applications"
                  name="Candidatures reçues"
                  fill={BLUE}
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dernière mise à jour : Temps réel</span>
            <span className="font-semibold text-slate-700">
              Total période : {overview.totalApplications}
            </span>
          </div>
        </div>

        {/* Pipeline de recrutement (Funnel réel des étapes franchies) */}
        <div
          className="bg-white rounded-xl p-5 shadow-xs flex flex-col justify-between"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold" style={{ color: TEXT_DARK }}>
                Répartition par étape du parcours
              </h3>
              <p className="text-[11px] text-slate-500">
                Nombre de candidatures actives actuellement à chaque étape.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Temps réel</span>
          </div>

          <div className="divide-y divide-slate-100 py-1">
            {funnel.map((step, idx) => {
              const hasCount = step.count > 0
              return (
                <div
                  key={step.stage}
                  className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors ${
                    hasCount ? "bg-slate-50/70" : "hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[11px] font-mono font-bold inline-flex items-center justify-center shrink-0 ${
                        hasCount
                          ? idx === 0
                            ? "bg-[#174F7A] text-white"
                            : "bg-[#35A85A] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-xs truncate ${
                        hasCount ? "font-semibold text-slate-800" : "text-slate-500 font-normal"
                      }`}
                    >
                      {step.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <span
                      className={`text-xs font-bold text-right min-w-[20px] ${
                        hasCount ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.count}
                    </span>
                    <span
                      className={`text-[11px] font-semibold text-right min-w-[42px] px-1.5 py-0.5 rounded ${
                        hasCount
                          ? idx === 3
                            ? "bg-emerald-50 text-[#35A85A]"
                            : "bg-blue-50 text-[#174F7A]"
                          : "text-slate-400"
                      }`}
                    >
                      {step.percentage} %
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Règle : 100% basé sur le statut actuel du dossier</span>
            <span className="text-slate-600 font-medium">Données réelles</span>
          </div>
        </div>
      </div>

      {/* 4. Analyses demandées par le cahier : Statuts, Origine / Langue / Source, Métier & Durée */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne 1 : Statuts opérationnels */}
        <div
          className="bg-white rounded-xl p-5 shadow-xs flex flex-col justify-between"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: TEXT_DARK }}>
              Candidatures par statut
            </h3>
            <button
              onClick={() => navigate("admin-applications")}
              className="text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: BLUE }}
            >
              Gérer tout →
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {statusBreakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: item.color, color: item.textColor }}
                >
                  {item.label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => navigate("admin-applications")}
              className="w-full py-2 text-xs font-semibold rounded-lg text-white text-center transition-colors cursor-pointer"
              style={{ backgroundColor: BLUE }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#123f63")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE)}
            >
              Ouvrir la liste détaillée
            </button>
          </div>
        </div>

        {/* Colonne 2 : Géographie, Langues & Canaux de recrutement (Sources) */}
        <div
          className="bg-white rounded-xl p-5 shadow-xs flex flex-col justify-between"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: TEXT_DARK }}>
                Origine & Acquisition
              </h3>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-[11px] font-semibold">
                <button
                  onClick={() => setActiveAnalysisTab("geo")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                    activeAnalysisTab === "geo" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Pays
                </button>
                <button
                  onClick={() => setActiveAnalysisTab("lang")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                    activeAnalysisTab === "lang" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Langues
                </button>
                <button
                  onClick={() => setActiveAnalysisTab("source")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                    activeAnalysisTab === "source" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Sources
                </button>
              </div>
            </div>

            {activeAnalysisTab === "geo" && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">
                  Répartition des candidats selon le pays de résidence déclaré.
                </p>
                {countryDistribution.length === 0 ? (
                  <div className="text-xs text-slate-400 py-8 text-center italic">
                    Aucune donnée géographique enregistrée
                  </div>
                ) : (
                  <div className="space-y-2">
                    {countryDistribution.slice(0, 5).map((c) => (
                      <div key={c.country} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{c.country}</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {c.count} ({c.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.percentage}%`,
                              backgroundColor: BLUE,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeAnalysisTab === "lang" && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">
                  Langue choisie par les candidats lors du dépôt de dossier.
                </p>
                <div className="space-y-2">
                  {languageDistribution.map((l) => (
                    <div key={l.lang} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{l.label}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {l.count} ({l.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${l.percentage}%`,
                            backgroundColor: GREEN,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAnalysisTab === "source" && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">
                  Canal par lequel le candidat a découvert le programme.
                </p>
                <div className="space-y-2">
                  {sourceDistribution.length === 0 ? (
                    <div className="text-xs text-slate-400 py-8 text-center italic">
                      Aucune source déclarée
                    </div>
                  ) : (
                    sourceDistribution.map((s) => (
                      <div key={s.source} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-[170px]">{s.source}</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {s.count} ({s.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.percentage}%`,
                              backgroundColor: BLUE,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Analyses du cahier des charges</span>
            <span>Total : {overview.totalApplications}</span>
          </div>
        </div>

        {/* Colonne 3 : Métiers & Durée souhaitée (conforme au cahier) */}
        <div
          className="bg-white rounded-xl p-5 shadow-xs flex flex-col justify-between"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: TEXT_DARK }}>
              Métiers & Durée souhaitée
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Profils professionnels déclarés et engagement souhaité.
            </p>

            <div className="space-y-4">
              {/* Durée souhaitée */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Durée de mission souhaitée
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {durationDistribution.map((d) => (
                    <div
                      key={d.duration}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center"
                    >
                      <div className="text-[11px] text-slate-500 font-medium">{d.label}</div>
                      <div className="text-sm font-mono font-bold text-slate-800">{d.count}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métiers / Professions */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Métiers & Professions déclarés
                </span>
                <div className="space-y-1.5">
                  {professionDistribution.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Aucune profession renseignée</span>
                  ) : (
                    professionDistribution.map((p) => (
                      <div
                        key={p.profession}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100"
                      >
                        <span className="font-medium text-slate-700 truncate max-w-[180px]">
                          {p.profession}
                        </span>
                        <span className="font-mono font-semibold text-slate-900">
                          {p.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Domaines d'études complémentaires */}
              {fieldDistribution.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Filières d'études
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {fieldDistribution.map((f) => (
                      <span
                        key={f.field}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        <span>{f.field}</span>
                        <span className="font-mono font-bold text-slate-900">({f.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Champs <code className="font-mono text-[10px]">profession</code> & <code className="font-mono text-[10px]">duration</code>
          </div>
        </div>
      </div>

      {/* 5. Section Trafic Web & Audience (Ségrégation claire Analytics / PostgreSQL) */}
      <div
        className="rounded-xl p-4 bg-white border shadow-xs"
        style={{ borderColor: BORDER }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Trafic & Visiteurs Web (Google Analytics 4)
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {analyticsSource.connected ? "Connecté" : "Analytics non connecté"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {analyticsSource.message}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono self-end sm:self-auto shrink-0">
            Aucun chiffre fictif affiché
          </div>
        </div>
      </div>
    </div>
  )
}
