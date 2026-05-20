"use client"

import PageHeader from "@/components/PageHeader"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts"

const PLATFORM_STATS = [
  { platform: "TikTok", brand: "M3K1", color: "#8b5cf6", followers: 831, reach: 12400, engagement: "6.2%", postsWk: 4 },
  { platform: "Instagram", brand: "M3K1", color: "#8b5cf6", followers: 654, reach: 4200, engagement: "3.1%", postsWk: 3 },
  { platform: "TikTok", brand: "XRXS", color: "#c9a84c", followers: 412, reach: 8900, engagement: "7.8%", postsWk: 3 },
  { platform: "Instagram", brand: "Fortis Mane", color: "#10b981", followers: 1240, reach: 6700, engagement: "4.3%", postsWk: 5 },
  { platform: "YouTube", brand: "Philosopher Stoned", color: "#4c7fc9", followers: 312, reach: 2100, engagement: "5.1%", postsWk: 1 },
]

const contentMix = [
  { type: "Reels/TikTok", value: 45 },
  { type: "Static Post", value: 20 },
  { type: "Stories", value: 15 },
  { type: "Long-form", value: 12 },
  { type: "Collab", value: 8 },
]

const radarData = [
  { metric: "Consistency", M3K1: 70, XRXS: 55, Fortis: 80, Philosopher: 40 },
  { metric: "Engagement", M3K1: 62, XRXS: 78, Fortis: 43, Philosopher: 51 },
  { metric: "Reach", M3K1: 52, XRXS: 44, Fortis: 67, Philosopher: 21 },
  { metric: "Hooks", M3K1: 80, XRXS: 65, Fortis: 55, Philosopher: 70 },
  { metric: "CTA", M3K1: 55, XRXS: 40, Fortis: 72, Philosopher: 60 },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: "#12121a", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#6b7280" },
}

export default function MarketingPage() {
  return (
    <div>
      <PageHeader
        title="Marketing"
        subtitle="Platform performance · content strategy · growth analytics"
      />

      {/* Platform cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {PLATFORM_STATS.map((p, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: `1px solid ${p.color}44` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                style={{ background: p.color + "33", color: p.color }}
              >
                {p.brand[0]}
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: p.color }}>{p.brand}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{p.platform}</p>
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{p.followers.toLocaleString()}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>followers</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Reach</span>
                <span className="text-xs" style={{ color: "var(--foreground)" }}>{p.reach.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Engage</span>
                <span className="text-xs" style={{ color: p.color }}>{p.engagement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Posts/wk</span>
                <span className="text-xs" style={{ color: "var(--foreground)" }}>{p.postsWk}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Radar */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Brand Performance Radar</p>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Consistency · Engagement · Reach · Hooks · CTA</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a3a" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Radar name="M3K1" dataKey="M3K1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              <Radar name="XRXS" dataKey="XRXS" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.1} />
              <Radar name="Fortis" dataKey="Fortis" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Radar name="Philosopher" dataKey="Philosopher" stroke="#4c7fc9" fill="#4c7fc9" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Content mix */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Content Mix</p>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Distribution of post types this month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={contentMix} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy AI box */}
      <div
        className="rounded-xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--accent-gold)" }}>AI Strategy Brief — Week of May 18</p>
        <div className="space-y-2 text-xs" style={{ color: "var(--muted)" }}>
          <p>🎯 <strong style={{ color: "var(--foreground)" }}>M3K1 TikTok:</strong> Engagement spiked 6.2% — double down on hook challenge format. Post at 7PM EST Tue/Thu/Sat.</p>
          <p>🎵 <strong style={{ color: "var(--foreground)" }}>XRXS:</strong> Highest engagement rate (7.8%) despite lowest post volume. Increase to 5/week — the audience is primed.</p>
          <p>💪 <strong style={{ color: "var(--foreground)" }}>Fortis Mane:</strong> Instagram performing well. Add TikTok fitness content to cross-pollinate. Target: 500 new TikTok followers.</p>
          <p>🎬 <strong style={{ color: "var(--foreground)" }}>Philosopher Stoned:</strong> Clip Ep.7 into 5 shorts immediately. Long-form → short-form pipeline will 3x your reach.</p>
        </div>
      </div>
    </div>
  )
}
