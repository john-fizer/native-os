"use client"

import { useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { BRANDS } from "@/lib/brands"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts"
import { Wand2, Loader2, RefreshCw, TrendingUp, AlertTriangle, Zap, DollarSign } from "lucide-react"

const PLATFORM_STATS = [
  { platform: "TikTok",    brand: "M3K1",               color: "#8b5cf6", followers: 831,  reach: 12400, engagement: "6.2%", postsWk: 4 },
  { platform: "Instagram", brand: "M3K1",               color: "#8b5cf6", followers: 654,  reach: 4200,  engagement: "3.1%", postsWk: 3 },
  { platform: "TikTok",    brand: "XRXS",               color: "#c9a84c", followers: 412,  reach: 8900,  engagement: "7.8%", postsWk: 3 },
  { platform: "Instagram", brand: "Fortis Mane",        color: "#10b981", followers: 1240, reach: 6700,  engagement: "4.3%", postsWk: 5 },
  { platform: "YouTube",   brand: "Philosopher Stoned", color: "#4c7fc9", followers: 312,  reach: 2100,  engagement: "5.1%", postsWk: 1 },
]

const contentMix = [
  { type: "Reels/TikTok", value: 45 },
  { type: "Static Post",  value: 20 },
  { type: "Stories",      value: 15 },
  { type: "Long-form",    value: 12 },
  { type: "Collab",       value: 8  },
]

const radarData = [
  { metric: "Consistency", M3K1: 70, XRXS: 55, Fortis: 80, Philosopher: 40 },
  { metric: "Engagement",  M3K1: 62, XRXS: 78, Fortis: 43, Philosopher: 51 },
  { metric: "Reach",       M3K1: 52, XRXS: 44, Fortis: 67, Philosopher: 21 },
  { metric: "Hooks",       M3K1: 80, XRXS: 65, Fortis: 55, Philosopher: 70 },
  { metric: "CTA",         M3K1: 55, XRXS: 40, Fortis: 72, Philosopher: 60 },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: "#12121a", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#6b7280" },
}

interface BrandAction {
  brand: string
  focus: string
  actions: string[]
  alert: string | null
}

interface Brief {
  weekOf: string
  topPriority: string
  brandActions: BrandAction[]
  contentStrategy: { increase: string[]; cut: string[]; test: string[] }
  growthLever: string
  revenueNote: string
}

export default function MarketingPage() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const runBrief = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/marketing")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBrief(data.brief)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate brief")
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Marketing"
        subtitle="Platform performance · content strategy · growth analytics"
        actions={
          <button
            onClick={runBrief}
            disabled={loading}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            {loading
              ? <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
              : <><Wand2 size={12} /> Run AI Analysis</>
            }
          </button>
        }
      />

      {/* Platform cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {PLATFORM_STATS.map((p, i) => (
          <div key={i} className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: `1px solid ${p.color}44` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                style={{ background: p.color + "33", color: p.color }}>
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
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Brand Performance Radar</p>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Consistency · Engagement · Reach · Hooks · CTA</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a3a" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Radar name="M3K1"        dataKey="M3K1"       stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              <Radar name="XRXS"        dataKey="XRXS"       stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.1}  />
              <Radar name="Fortis"      dataKey="Fortis"     stroke="#10b981" fill="#10b981" fillOpacity={0.1}  />
              <Radar name="Philosopher" dataKey="Philosopher" stroke="#4c7fc9" fill="#4c7fc9" fillOpacity={0.1}  />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Content mix */}
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
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

      {/* AI Strategy Brief */}
      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm"
          style={{ background: "var(--accent-red)11", border: "1px solid var(--accent-red)44", color: "var(--accent-red)" }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl p-8 flex flex-col items-center gap-3"
          style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
          <p className="text-sm" style={{ color: "var(--muted)" }}>Pulling live data and generating strategy brief...</p>
        </div>
      )}

      {!loading && !brief && !error && (
        <div className="rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:opacity-90 transition-all"
          onClick={runBrief}
          style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <Wand2 size={20} style={{ color: "var(--accent-gold)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Run AI Marketing Analysis</p>
          <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
            Claude will pull your live content queue, finance data, and platform stats to generate a real-time strategy brief.
          </p>
        </div>
      )}

      {brief && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top priority */}
            <div className="lg:col-span-2 rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)66" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} style={{ color: "var(--accent-gold)" }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                  Top Priority — Week of {brief.weekOf}
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{brief.topPriority}</p>
            </div>

            {/* Growth lever */}
            <div className="rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--accent-green)44" }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} style={{ color: "var(--accent-green)" }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
                  Growth Lever
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{brief.growthLever}</p>
            </div>
          </div>

          {/* Brand actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {brief.brandActions.map((b) => {
              const brandColor = BRANDS.find(br => br.name === b.brand)?.color ?? "var(--muted)"
              return (
                <div key={b.brand} className="rounded-xl p-4"
                  style={{ background: "var(--surface)", border: `1px solid ${brandColor}44` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                      style={{ background: brandColor + "33", color: brandColor }}>
                      {b.brand[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: brandColor }}>{b.brand}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{b.focus}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {b.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: brandColor + "33", color: brandColor }}>{i + 1}</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                  {b.alert && (
                    <div className="flex items-start gap-2 p-2 rounded-lg text-xs"
                      style={{ background: "var(--accent-gold)11", border: "1px solid var(--accent-gold)33", color: "var(--accent-gold)" }}>
                      <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
                      {b.alert}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Content strategy + Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Content Strategy</p>
              <div className="space-y-3">
                {[
                  { label: "Double down on", items: brief.contentStrategy.increase, color: "var(--accent-green)" },
                  { label: "Cut or reduce",  items: brief.contentStrategy.cut,      color: "var(--accent-red)"   },
                  { label: "A/B test",       items: brief.contentStrategy.test,     color: "var(--accent-gold)"  },
                ].map(({ label, items, color }) => (
                  <div key={label}>
                    <p className="text-xs font-medium mb-1" style={{ color }}>{label}</p>
                    <ul className="space-y-0.5">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs" style={{ color: "var(--muted)" }}>· {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={14} style={{ color: "var(--accent-green)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Revenue Snapshot</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{brief.revenueNote}</p>
              <button onClick={runBrief}
                className="mt-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                <RefreshCw size={11} /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
