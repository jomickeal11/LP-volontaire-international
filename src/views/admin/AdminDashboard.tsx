import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { getLiveCandidates } from "../../data/mockCandidates"
import { store } from "../../lib/store"
import type { Page } from "../../types"

const BLUE = "#1B4F7C"
const BLUE_LIGHT = "#3A8BC4"
const GREEN = "#2E7D52"
const BG = "#F4F6F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"

const monthlyData = [
  { month: "Jan", applications: 4, visitors: 380 },
  { month: "Feb", applications: 6, visitors: 420 },
  { month: "Mar", applications: 9, visitors: 610 },
  { month: "Apr", applications: 7, visitors: 540 },
  { month: "May", applications: 12, visitors: 820 },
  { month: "Jun", applications: 15, visitors: 1100 },
  { month: "Jul", applications: 18, visitors: 1340 },
  { month: "Aug", applications: 8, visitors: 920 },
]

function KpiCard({
  label,
  value,
  delta,
  positive,
  icon,
  color,
}: {
  label: string
  value: string | number
  delta?: string
  positive?: boolean
  icon: React.ReactNode
  color: string
}) {
  return (
    <div
      className="flex flex-col p-5 rounded-xl bg-white"
      style={{
        border: "1.5px solid #E8ECF2",
        boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "18", color }}
        >
          {icon}
        </div>
        {delta && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: positive ? "#E6F4EC" : "#FEE2E2",
              color: positive ? GREEN : "#DC2626",
            }}
          >
            {positive ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <div
        className="text-2xl font-bold mb-0.5"
        style={{ fontFamily: "JetBrains Mono, monospace", color: TEXT_DARK }}
      >
        {value}
      </div>
      <div className="text-xs font-medium" style={{ color: TEXT_MID }}>
        {label}
      </div>
    </div>
  )
}

export default function AdminDashboard({
  navigate,
}: {
  navigate: (p: Page) => void
}) {
  const [candidates, setCandidates] = useState(getLiveCandidates())

  useEffect(() => {
    setCandidates(getLiveCandidates())
    return store.subscribe(() => {
      setCandidates(getLiveCandidates())
    })
  }, [])

  const totalApplications = candidates.length
  const inReviewCount = candidates.filter(
    (c) => c.status === "REVIEW" || c.status === "NEW",
  ).length
  const interviewCount = candidates.filter(
    (c) => c.status === "INTERVIEW",
  ).length
  const selectedCount = candidates.filter(
    (c) => c.status === "SELECTED" || c.status === "CHOSEN",
  ).length
  const preparationCount = candidates.filter(
    (c) => c.status === "PREPARATION" || c.status === "PARTNER_VALIDATION",
  ).length
  const arrivedCount = candidates.filter((c) => c.status === "ARRIVED").length

  const statusData = [
    {
      name: "Nouveau",
      value: candidates.filter((c) => c.status === "NEW").length,
      color: "#EEF1F6",
      textColor: "#4A5A6A",
    },
    {
      name: "Révision",
      value: candidates.filter((c) => c.status === "REVIEW").length,
      color: "#FEF3C7",
      textColor: "#92400E",
    },
    {
      name: "Sélectionné",
      value: candidates.filter((c) => c.status === "SELECTED").length,
      color: "#DBEAFE",
      textColor: "#1E40AF",
    },
    {
      name: "Entretien",
      value: candidates.filter((c) => c.status === "INTERVIEW").length,
      color: "#E0E7FF",
      textColor: "#4338CA",
    },
    {
      name: "Choisi",
      value: candidates.filter((c) => c.status === "CHOSEN").length,
      color: "#D1FAE5",
      textColor: "#065F46",
    },
    {
      name: "Val. Partenaire",
      value: candidates.filter((c) => c.status === "PARTNER_VALIDATION").length,
      color: "#FDE68A",
      textColor: "#78350F",
    },
    {
      name: "Préparation",
      value: candidates.filter((c) => c.status === "PREPARATION").length,
      color: "#E6F4EC",
      textColor: "#2E7D52",
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-1" style={{ color: TEXT_DARK }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: TEXT_MID }}>
          Overview of APTIC-R volunteer recruitment — August 2025
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KpiCard
          label="Total Visitors"
          value="6,130"
          delta="18%"
          positive
          color={BLUE_LIGHT}
          icon={
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <KpiCard
          label="Applications"
          value={totalApplications}
          delta="Actif"
          positive
          color={BLUE}
          icon={
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <KpiCard
          label="In Review"
          value={inReviewCount}
          color="#C77B2B"
          icon={
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KpiCard
          label="Interviews"
          value={interviewCount}
          color="#7B3FC8"
          icon={
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
        />
        <KpiCard
          label="Selected / Chosen"
          value={selectedCount}
          color={GREEN}
          icon={
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
        />
        <KpiCard
          label="Preparation / Val."
          value={preparationCount}
          color="#2E7D52"
          icon={
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Applications chart */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm" style={{ color: TEXT_DARK }}>
                Applications per month
              </h3>
              <p className="text-xs" style={{ color: TEXT_MID }}>
                January – August 2025
              </p>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E6F4EC", color: GREEN }}
            >
              ↑ +22%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={monthlyData}
              margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F3F7"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9AA8B4" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9AA8B4" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E8ECF2",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: TEXT_DARK }}
                labelStyle={{ color: TEXT_MID, fontWeight: 600 }}
              />
              <Bar
                dataKey="applications"
                fill={BLUE}
                radius={[4, 4, 0, 0]}
                name="Applications"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visitors chart */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm" style={{ color: TEXT_DARK }}>
                Visitor trend
              </h3>
              <p className="text-xs" style={{ color: TEXT_MID }}>
                Monthly unique visitors
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={monthlyData}
              margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient
                  id="visitorGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={BLUE_LIGHT} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={BLUE_LIGHT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F3F7"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9AA8B4" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9AA8B4" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E8ECF2",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                itemStyle={{ color: TEXT_DARK }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke={BLUE_LIGHT}
                strokeWidth={2}
                fill="url(#visitorGradient)"
                name="Visitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <h3 className="text-sm mb-4" style={{ color: TEXT_DARK }}>
            Recruitment pipeline
          </h3>
          <div className="flex flex-col gap-2">
            {[
              {
                label: "Visitors",
                value: 6130,
                pct: 100,
                color: "#E8ECF2",
                text: "#4A5A6A",
              },
              {
                label: "Applications",
                value: 79,
                pct: 65,
                color: "#DBEAFE",
                text: "#1E40AF",
              },
              {
                label: "Qualified",
                value: 34,
                pct: 45,
                color: BLUE + "30",
                text: BLUE,
              },
              {
                label: "Interviews",
                value: 18,
                pct: 32,
                color: "#E0E7FF",
                text: "#4338CA",
              },
              {
                label: "Selected",
                value: 9,
                pct: 20,
                color: "#D1FAE5",
                text: "#065F46",
              },
              {
                label: "Arrived",
                value: 4,
                pct: 10,
                color: "#E6F4EC",
                text: GREEN,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <div
                  className="w-24 text-xs font-medium text-right flex-shrink-0"
                  style={{ color: TEXT_MID }}
                >
                  {row.label}
                </div>
                <div
                  className="flex-1 h-7 rounded"
                  style={{ backgroundColor: "#F4F6F9" }}
                >
                  <div
                    className="h-full rounded flex items-center px-2 transition-all"
                    style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: row.text,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {row.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications by status + quick actions */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm" style={{ color: TEXT_DARK }}>
              Applications by status
            </h3>
            <button
              onClick={() => navigate("admin-applications")}
              className="text-xs font-semibold"
              style={{ color: BLUE }}
            >
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: s.color, color: s.textColor }}
                  >
                    {s.name}
                  </span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: TEXT_DARK,
                  }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("admin-applications")}
            className="w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: BLUE }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#163f63")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE)}
          >
            Manage Applications
          </button>
        </div>
      </div>
    </div>
  )
}
