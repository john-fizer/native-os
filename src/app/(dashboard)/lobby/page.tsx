"use client"

import { BRANDS } from "@/lib/brands"
import MetricCard from "@/components/MetricCard"
import PageHeader from "@/components/PageHeader"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts"
import { Music2, ShoppingBag, Users, TrendingUp, Bell, CheckCircle, AlertCircle } from "lucide-react"

const growthData = [
  { week: "W1", m3k1: 421, xrxs: 280, fortis: 890, philosopher: 201 },
  { week: "W2", m3k1: 534, xrxs: 310, fortis: 967, philosopher: 234 },
  { week: "W3", m3k1: 612, xrxs: 355, fortis: 1043, philosopher: 267 },
  { week: "W4", m3k1: 831, xrxs: 412, fortis: 1240, philosopher: 312 },
]

const revenueData = [
  { month: "Jan", merch: 0, streams: 12, youtube: 0 },
  { month: "Feb", merch: 0, streams: 18, youtube: 0 },
  { month: "Mar", merch: 45, streams: 22, youtube: 4 },
  { month: "Apr", merch: 120, streams: 31, youtube: 9 },
  { month: "May", merch: 87, streams: 28, youtube: 14 },
]

const alerts = [
  { type: "warn", msg: "XRXS — 2 posts due today", time: "now" },
  { type: "ok", msg: "Legal scan passed — Fortis drop #3", time: "1h ago" },
  { type: "warn", msg: "M3K1 — no TikTok post in 3 days", time: "3h ago" },
  { type: "ok", msg: "Merch order #1042 fulfilled", time: "5h ago" },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: "#12121a", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#6b7280" },
}

export default function LobbyPage() {
  const totalFollowers = BRANDS.reduce((acc, b) => {
    return acc + Object.values(b.followers).reduce((a, v) => a + v, 0)
  }, 0)

  return (
    <div>
      <PageHeader
        title="HQ Lobby"
        subtitle="Sunday, May 18, 2026 — All systems active"
        actions={
          <button
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            <Bell size={12} /> 4 alerts
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Followers"
          value={totalFollowers.toLocaleString()}
          sub="across all brands"
          delta={12}
          color="var(--accent-gold)"
          icon={<Users size={14} />}
        />
        <MetricCard
          label="Monthly Streams"
          value="562"
          sub="XRXS + M3K1 combined"
          delta={8}
          color="var(--accent-purple)"
          icon={<Music2 size={14} />}
        />
        <MetricCard
          label="Merch Revenue"
          value="$87"
          sub="May 2026"
          delta={-27}
          color="var(--accent-green)"
          icon={<ShoppingBag size={14} />}
        />
        <MetricCard
          label="Posts This Week"
          value="11"
          sub="target: 21"
          delta={-4}
          color="var(--accent-blue)"
          icon={<TrendingUp size={14} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Follower growth chart */}
        <div
          className="lg:col-span-2 rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Follower Growth — All Brands</p>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Total followers per brand over 4 weeks</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={growthData}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="m3k1" stroke="#8b5cf6" strokeWidth={2} dot={false} name="M3K1" />
              <Line type="monotone" dataKey="xrxs" stroke="#c9a84c" strokeWidth={2} dot={false} name="XRXS" />
              <Line type="monotone" dataKey="fortis" stroke="#10b981" strokeWidth={2} dot={false} name="Fortis" />
              <Line type="monotone" dataKey="philosopher" stroke="#4c7fc9" strokeWidth={2} dot={false} name="Philosopher" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[
              { label: "M3K1", color: "#8b5cf6" },
              { label: "XRXS", color: "#c9a84c" },
              { label: "Fortis Mane", color: "#10b981" },
              { label: "Philosopher", color: "#4c7fc9" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Activity Feed</p>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                {a.type === "ok"
                  ? <CheckCircle size={14} style={{ color: "var(--accent-green)", marginTop: 1, flexShrink: 0 }} />
                  : <AlertCircle size={14} style={{ color: "var(--accent-gold)", marginTop: 1, flexShrink: 0 }} />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "var(--foreground)" }}>{a.msg}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue bar chart */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Revenue Breakdown</p>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Merch · Streams · YouTube — last 5 months</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `$${v}`} />
            <Bar dataKey="merch" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Merch" />
            <Bar dataKey="streams" stackId="a" fill="#8b5cf6" name="Streams" />
            <Bar dataKey="youtube" stackId="a" fill="#4c7fc9" radius={[4, 4, 0, 0]} name="YouTube" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Brand cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BRANDS.map((brand) => {
          const total = Object.values(brand.followers).reduce((a, v) => a + v, 0)
          return (
            <div
              key={brand.id}
              className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-all"
              style={{
                background: "var(--surface)",
                border: `1px solid ${brand.color}44`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: brand.color + "33", color: brand.color }}
                >
                  {brand.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{brand.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{brand.genre}</p>
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: brand.color }}>{total.toLocaleString()}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>total followers</p>
              <div
                className="mt-3 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min((total / 100000) * 100, 100)}%`, background: brand.color }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {((total / 100000) * 100).toFixed(1)}% to 100K
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
