import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

const BLUE = "#1B4F7C"
const BLUE_LIGHT = "#3A8BC4"
const GREEN = "#2E7D52"
const BG = "#F4F6F9"
const TEXT_DARK = "#1A2B3C"
const TEXT_MID = "#4A5A6A"

const countryData = [
  { country: "Allemagne", applications: 22, color: BLUE },
  { country: "France", applications: 19, color: BLUE_LIGHT },
  { country: "Belgique", applications: 11, color: GREEN },
  { country: "Pays-Bas", applications: 8, color: "#7B3FC8" },
  { country: "Italie", applications: 6, color: "#C77B2B" },
  { country: "Danemark", applications: 5, color: "#3A8BC4" },
  { country: "Autriche", applications: 4, color: "#9AA8B4" },
  { country: "Autres", applications: 4, color: "#D1DCE5" },
]

const sourceData = [
  { name: "weltwärts", value: 18 },
  { name: "France Volontaires", value: 14 },
  { name: "Corps de solidarité", value: 11 },
  { name: "Université", value: 12 },
  { name: "LinkedIn", value: 8 },
  { name: "Google", value: 9 },
  { name: "Ami(e)", value: 4 },
  { name: "Autres", value: 3 },
]

const profileData = [
  { name: "Numérique & IT", value: 31, color: BLUE },
  { name: "Agriculture", value: 22, color: GREEN },
  { name: "Créatif", value: 18, color: "#7B3FC8" },
  { name: "Ingénierie", value: 29, color: "#C77B2B" },
]

const monthlyConversion = [
  { month: "Jan", visitors: 380, applications: 4, qualified: 2 },
  { month: "Fév", visitors: 420, applications: 6, qualified: 3 },
  { month: "Mar", visitors: 610, applications: 9, qualified: 4 },
  { month: "Avr", visitors: 540, applications: 7, qualified: 4 },
  { month: "Mai", visitors: 820, applications: 12, qualified: 6 },
  { month: "Juin", visitors: 1100, applications: 15, qualified: 7 },
  { month: "Juil", visitors: 1340, applications: 18, qualified: 9 },
  { month: "Aoû", visitors: 920, applications: 8, qualified: 4 },
]

const languageData = [
  { lang: "Anglais", pct: 48 },
  { lang: "Français", pct: 31 },
  { lang: "Allemand", pct: 21 },
]

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{
        border: "1.5px solid #E8ECF2",
        boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "#9AA8B4" }}
      >
        {label}
      </div>
      <div
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "JetBrains Mono, monospace", color }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs" style={{ color: TEXT_MID }}>
          {sub}
        </div>
      )}
    </div>
  )
}

const FUNNEL = [
  {
    label: "Visiteurs",
    value: 6130,
    rate: null,
    color: "#E8ECF2",
    text: "#4A5A6A",
  },
  {
    label: "Clic CTA",
    value: 1840,
    rate: "30.0%",
    color: "#DBEAFE",
    text: "#1E40AF",
  },
  {
    label: "Form. commencé",
    value: 312,
    rate: "16.9%",
    color: BLUE + "30",
    text: BLUE,
  },
  {
    label: "Form. soumis",
    value: 79,
    rate: "25.3%",
    color: "#E0E7FF",
    text: "#4338CA",
  },
  {
    label: "Qualifiés",
    value: 34,
    rate: "43.0%",
    color: "#D1FAE5",
    text: "#065F46",
  },
  {
    label: "Entretiens",
    value: 18,
    rate: "52.9%",
    color: "#E6F4EC",
    text: GREEN,
  },
  {
    label: "Sélectionnés",
    value: 9,
    rate: "50.0%",
    color: "#CCFBF1",
    text: "#065F46",
  },
  { label: "Arrivés", value: 4, rate: "44.4%", color: "#D1FAE5", text: GREEN },
]

export default function AdminAnalytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl mb-1" style={{ color: TEXT_DARK }}>
          Statistiques
        </h1>
        <p className="text-sm" style={{ color: TEXT_MID }}>
          Acquisition, conversion et engagement — Janvier à Août 2025
        </p>
      </div>

      {/* Acquisition KPIs */}
      <div className="mb-6">
        <h2
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "#9AA8B4" }}
        >
          Acquisition
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Visiteurs totaux"
            value="6,130"
            sub="+18% vs période préc."
            color={BLUE_LIGHT}
          />
          <KpiCard
            label="Pays uniques"
            value="14"
            sub="Européens + autres"
            color={BLUE}
          />
          <KpiCard
            label="Durée moy. session"
            value="3:24"
            sub="Minutes sur le site"
            color="#7B3FC8"
          />
          <KpiCard
            label="Demandes partenaires"
            value="6"
            sub="Des organisations"
            color={GREEN}
          />
        </div>
      </div>

      {/* Conversion KPIs */}
      <div className="mb-6">
        <h2
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "#9AA8B4" }}
        >
          Conversion
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Taux clic CTA"
            value="30.0%"
            sub="Visiteurs → Clic POSTULER"
            color={BLUE}
          />
          <KpiCard
            label="Taux début form."
            value="16.9%"
            sub="Clics CTA → Form. commencé"
            color="#C77B2B"
          />
          <KpiCard
            label="Taux de complétion"
            value="25.3%"
            sub="Commencé → Soumis"
            color="#7B3FC8"
          />
          <KpiCard
            label="Conv. globale"
            value="1.29%"
            sub="Visiteurs → Soumis"
            color={GREEN}
          />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Country distribution */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <h3 className="text-sm mb-4" style={{ color: TEXT_DARK }}>
            Candidatures par pays
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={countryData}
              layout="vertical"
              margin={{ left: 20, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F3F7"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9AA8B4" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="country"
                type="category"
                tick={{ fontSize: 11, fill: "#9AA8B4" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E8ECF2",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                itemStyle={{ color: TEXT_DARK }}
              />
              <Bar
                dataKey="applications"
                radius={[0, 4, 4, 0]}
                name="Candidatures"
              >
                {countryData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={i < 3 ? BLUE : i < 5 ? BLUE_LIGHT : "#D1DCE5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profile distribution */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <h3 className="text-sm mb-4" style={{ color: TEXT_DARK }}>
            Candidatures par profil
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={profileData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {profileData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #E8ECF2",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {profileData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: TEXT_MID }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: TEXT_DARK,
                    }}
                  >
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion funnel */}
      <div
        className="bg-white rounded-xl p-5 mb-6"
        style={{
          border: "1.5px solid #E8ECF2",
          boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
        }}
      >
        <h3 className="text-sm mb-5" style={{ color: TEXT_DARK }}>
          Entonnoir de conversion complet
        </h3>
        <div className="flex flex-col gap-2">
          {FUNNEL.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className="w-28 text-xs font-medium text-right flex-shrink-0"
                style={{ color: TEXT_MID }}
              >
                {step.label}
              </div>
              <div
                className="flex-1 h-8 rounded-lg overflow-hidden"
                style={{ backgroundColor: "#F4F6F9" }}
              >
                <div
                  className="h-full rounded-lg flex items-center justify-between px-3 transition-all"
                  style={{
                    width: `${Math.round((step.value / FUNNEL[0].value) * 100)}%`,
                    backgroundColor: step.color,
                    minWidth: 80,
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: step.text,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {step.value.toLocaleString()}
                  </span>
                  {step.rate && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: step.text, opacity: 0.7 }}
                    >
                      {step.rate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion trend */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <h3 className="text-sm mb-4" style={{ color: TEXT_DARK }}>
            Tendance de conversion
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={monthlyConversion}
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
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="applications"
                stroke={BLUE}
                strokeWidth={2}
                dot={false}
                name="Candidatures"
              />
              <Line
                type="monotone"
                dataKey="qualified"
                stroke={GREEN}
                strokeWidth={2}
                dot={false}
                name="Qualifiés"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Source + Language */}
        <div
          className="bg-white rounded-xl p-5"
          style={{
            border: "1.5px solid #E8ECF2",
            boxShadow: "0 1px 8px rgba(27,79,124,0.05)",
          }}
        >
          <h3 className="text-sm mb-4" style={{ color: TEXT_DARK }}>
            Sources de trafic
          </h3>
          <div className="flex flex-col gap-2.5 mb-6">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div
                  className="w-32 text-xs font-medium"
                  style={{ color: TEXT_MID }}
                >
                  {s.name}
                </div>
                <div
                  className="flex-1 h-5 rounded overflow-hidden"
                  style={{ backgroundColor: "#F4F6F9" }}
                >
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.round((s.value / 18) * 100)}%`,
                      backgroundColor: BLUE + "30",
                    }}
                  />
                </div>
                <div
                  className="w-6 text-xs font-bold text-right"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: TEXT_DARK,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <h4
            className="text-xs uppercase tracking-wider mb-3"
            style={{ color: "#9AA8B4" }}
          >
            Préférences linguistiques
          </h4>
          <div className="flex gap-3">
            {languageData.map((l) => (
              <div
                key={l.lang}
                className="flex-1 text-center p-3 rounded-lg"
                style={{ backgroundColor: BG }}
              >
                <div
                  className="text-xl font-bold mb-0.5"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: BLUE,
                  }}
                >
                  {l.pct}%
                </div>
                <div className="text-xs" style={{ color: TEXT_MID }}>
                  {l.lang}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
