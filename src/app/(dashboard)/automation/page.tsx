"use client"

import PageHeader from "@/components/PageHeader"
import { Zap, CheckCircle, Circle, AlertCircle, Play, Pause } from "lucide-react"

const PIPELINES = [
  {
    id: 1,
    name: "TikTok Auto-Post",
    desc: "Picks queued content, formats, schedules via TikTok API",
    status: "active",
    runs: 14,
    lastRun: "1h ago",
    nextRun: "5h",
    brand: "All",
    color: "var(--accent-green)",
  },
  {
    id: 2,
    name: "Copyright Scan",
    desc: "ACRCloud audio scan before any post enters Ready state",
    status: "active",
    runs: 31,
    lastRun: "2h ago",
    nextRun: "on trigger",
    brand: "All",
    color: "var(--accent-green)",
  },
  {
    id: 3,
    name: "YouTube → Clips",
    desc: "Opus Clip API: auto-clip long-form into 5-7 shorts",
    status: "paused",
    runs: 2,
    lastRun: "3d ago",
    nextRun: "paused",
    brand: "Philosopher Stoned",
    color: "var(--accent-gold)",
  },
  {
    id: 4,
    name: "Merch Design Gen",
    desc: "Brand brief → Midjourney → copyright scan → Printful upload",
    status: "setup",
    runs: 0,
    lastRun: "never",
    nextRun: "not configured",
    brand: "All",
    color: "var(--muted)",
  },
  {
    id: 5,
    name: "Weekly AI Brief",
    desc: "Claude API generates boardroom report every Sunday 9AM",
    status: "active",
    runs: 3,
    lastRun: "7d ago",
    nextRun: "6d",
    brand: "All",
    color: "var(--accent-green)",
  },
  {
    id: 6,
    name: "Collab Outreach",
    desc: "Scans similar accounts, drafts DM templates for review",
    status: "setup",
    runs: 0,
    lastRun: "never",
    nextRun: "not configured",
    brand: "M3K1",
    color: "var(--muted)",
  },
]

const STATUS_META = {
  active: { label: "Active", color: "var(--accent-green)", icon: <CheckCircle size={12} /> },
  paused: { label: "Paused", color: "var(--accent-gold)", icon: <Pause size={12} /> },
  setup: { label: "Setup Required", color: "var(--muted)", icon: <Circle size={12} /> },
  error: { label: "Error", color: "var(--accent-red)", icon: <AlertCircle size={12} /> },
}

export default function AutomationPage() {
  const active = PIPELINES.filter(p => p.status === "active").length

  return (
    <div>
      <PageHeader
        title="Automation"
        subtitle="n8n pipelines · AI agents · scheduled workflows"
        actions={
          <button
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            <Zap size={12} /> New Pipeline
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>{active}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Active pipelines</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>50</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Total runs this month</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>2</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Awaiting setup</p>
        </div>
      </div>

      <div className="space-y-3">
        {PIPELINES.map((pipeline) => {
          const meta = STATUS_META[pipeline.status as keyof typeof STATUS_META]
          return (
            <div
              key={pipeline.id}
              className="rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: meta.color + "22" }}
                  >
                    <Zap size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{pipeline.name}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: meta.color + "22", color: meta.color }}
                      >
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{pipeline.desc}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Brand: <span style={{ color: "var(--foreground)" }}>{pipeline.brand}</span></span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Runs: <span style={{ color: "var(--foreground)" }}>{pipeline.runs}</span></span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Last: <span style={{ color: "var(--foreground)" }}>{pipeline.lastRun}</span></span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Next: <span style={{ color: "var(--foreground)" }}>{pipeline.nextRun}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {pipeline.status === "active" && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                      style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      Pause
                    </button>
                  )}
                  {pipeline.status === "paused" && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80 flex items-center gap-1"
                      style={{ background: "var(--accent-green)22", color: "var(--accent-green)" }}
                    >
                      <Play size={10} /> Resume
                    </button>
                  )}
                  {pipeline.status === "setup" && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                      style={{ background: "var(--accent-gold)22", color: "var(--accent-gold)" }}
                    >
                      Configure
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
