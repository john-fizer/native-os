"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import {
  Zap, CheckCircle, Circle, AlertCircle, Play, Pause, Activity,
  ChevronDown, ChevronRight, Video, Clock, Cpu, Coins, Search
} from "lucide-react"

// ─── Pipelines (static) ─────────────────────────────────────────────────────

const PIPELINES = [
  { id: 1, name: "TikTok Auto-Post",  desc: "Picks queued content, formats, schedules via TikTok API",         status: "active",  runs: 14, lastRun: "1h ago",  nextRun: "5h",             brand: "All",                color: "var(--accent-green)" },
  { id: 2, name: "Copyright Scan",    desc: "ACRCloud audio scan before any post enters Ready state",           status: "active",  runs: 31, lastRun: "2h ago",  nextRun: "on trigger",     brand: "All",                color: "var(--accent-green)" },
  { id: 3, name: "YouTube → Clips",   desc: "Opus Clip API: auto-clip long-form into 5-7 shorts",              status: "paused",  runs: 2,  lastRun: "3d ago",   nextRun: "paused",         brand: "Philosopher Stoned", color: "var(--accent-gold)"  },
  { id: 4, name: "Merch Design Gen",  desc: "Brand brief → Midjourney → copyright scan → Printful upload",     status: "setup",   runs: 0,  lastRun: "never",    nextRun: "not configured", brand: "All",                color: "var(--muted)"        },
  { id: 5, name: "Weekly AI Brief",   desc: "Claude API generates boardroom report every Sunday 9AM",          status: "active",  runs: 3,  lastRun: "7d ago",   nextRun: "6d",             brand: "All",                color: "var(--accent-green)" },
  { id: 6, name: "Collab Outreach",   desc: "Scans similar accounts, drafts DM templates for review",         status: "setup",   runs: 0,  lastRun: "never",    nextRun: "not configured", brand: "M3K1",               color: "var(--muted)"        },
]

const STATUS_META = {
  active:  { label: "Active",          color: "var(--accent-green)", icon: <CheckCircle size={12} /> },
  paused:  { label: "Paused",          color: "var(--accent-gold)",  icon: <Pause size={12} /> },
  setup:   { label: "Setup Required",  color: "var(--muted)",        icon: <Circle size={12} /> },
  error:   { label: "Error",           color: "var(--accent-red)",   icon: <AlertCircle size={12} /> },
}

// ─── Agent Runs types ────────────────────────────────────────────────────────

interface StepLog {
  step: number
  tool: string
  input: Record<string, unknown>
  output: unknown
  duration_ms: number
  timestamp: string
}

interface AgentRun {
  id: string
  agent_type: string
  status: "running" | "completed" | "failed"
  input: Record<string, unknown>
  output: unknown
  steps: StepLog[]
  tokens_used: number | null
  duration_ms: number | null
  error: string | null
  created_at: string
}

interface RunStats {
  total: number
  completed: number
  failed: number
  running: number
  avgDurationMs: number
  totalTokens: number
}

// ─── RunCard ─────────────────────────────────────────────────────────────────

function RunCard({ run }: { run: AgentRun }) {
  const [open, setOpen] = useState(false)

  const statusColor =
    run.status === "completed" ? "var(--accent-green)" :
    run.status === "failed"    ? "var(--accent-red)"   :
                                  "var(--accent-gold)"

  const label = run.agent_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  const durationSec = run.duration_ms ? (run.duration_ms / 1000).toFixed(1) + "s" : "—"
  const tokens = run.tokens_used ? run.tokens_used.toLocaleString() : "—"
  const steps = run.steps ?? []
  const ts = new Date(run.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-80 transition-opacity"
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusColor + "22", color: statusColor }}>
              {run.status}
            </span>
            {run.status === "running" && (
              <span className="text-xs animate-pulse" style={{ color: "var(--accent-gold)" }}>live</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              <Clock size={10} className="inline mr-1" />{durationSec}
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              <Coins size={10} className="inline mr-1" />{tokens} tokens
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              <Activity size={10} className="inline mr-1" />{steps.length} steps
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>{ts}</span>
          </div>
        </div>
        {open ? <ChevronDown size={14} style={{ color: "var(--muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--muted)" }} />}
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--border)" }}>
          {run.error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--accent-red)15", color: "var(--accent-red)", border: "1px solid var(--accent-red)30" }}>
              {run.error}
            </div>
          )}

          {steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Step trace</p>
              {steps.map((s) => (
                <div key={s.step} className="rounded-lg p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold" style={{ color: "var(--accent)" }}>
                      [{s.step}] {s.tool}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{s.duration_ms}ms</span>
                  </div>
                  <details className="group">
                    <summary className="text-xs cursor-pointer list-none" style={{ color: "var(--muted)" }}>
                      Show input / output
                    </summary>
                    <div className="mt-2 space-y-1">
                      <pre className="text-xs overflow-auto rounded p-2 max-h-32" style={{ background: "var(--background)", color: "var(--muted)" }}>
                        {JSON.stringify(s.input, null, 2)}
                      </pre>
                      <pre className="text-xs overflow-auto rounded p-2 max-h-32" style={{ background: "var(--background)", color: "var(--foreground)" }}>
                        {typeof s.output === "string" ? s.output : JSON.stringify(s.output as Record<string, unknown>, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}

          {run.output != null && run.status === "completed" && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>Output</p>
              <pre className="text-xs overflow-auto rounded-lg p-3 max-h-48" style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {JSON.stringify(run.output as Record<string, unknown>, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── YouTube Research Form ────────────────────────────────────────────────────

function YouTubeResearchForm({ onClose, onLaunched }: { onClose: () => void; onLaunched: () => void }) {
  const [topic, setTopic] = useState("")
  const [brand, setBrand] = useState("Philosopher Stoned")
  const [niche, setNiche] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [thumbnails, setThumbnails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic || !brand) return
    setLoading(true)
    setErr("")
    try {
      const res = await fetch("/api/agent/youtube-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, brand, niche: niche || brand, videoTitle: videoTitle || undefined, generateThumbnails: thumbnails }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? "Failed")
      }
      onLaunched()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Video size={18} style={{ color: "var(--accent-red)" }} />
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>YouTube Research Agent</h2>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Topic *</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. home workout for beginners"
              required
              className="w-full text-sm px-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Brand *</label>
              <select
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option>XRXS</option>
                <option>M3K1</option>
                <option>Fortis Mane</option>
                <option>Philosopher Stoned</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Niche</label>
              <input
                value={niche}
                onChange={e => setNiche(e.target.value)}
                placeholder="fitness, pop rap…"
                className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Planned video title (optional)</label>
            <input
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              placeholder="Leave blank to get title suggestions"
              className="w-full text-sm px-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={thumbnails} onChange={e => setThumbnails(e.target.checked)} className="rounded" />
            <span className="text-xs" style={{ color: "var(--muted)" }}>Also generate SEO thumbnail variants</span>
          </label>
          {err && <p className="text-xs" style={{ color: "var(--accent-red)" }}>{err}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !topic}
              className="flex-1 text-sm px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-80 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "var(--accent-red)", color: "#fff" }}
            >
              {loading ? <><span className="animate-spin">⟳</span> Launching…</> : <><Play size={12} /> Run Agent</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", "youtube_research", "thumbnail_seo", "merch"] as const
type FilterTab = typeof FILTER_TABS[number]

export default function AutomationPage() {
  const active = PIPELINES.filter(p => p.status === "active").length

  const [runs, setRuns] = useState<AgentRun[]>([])
  const [stats, setStats] = useState<RunStats | null>(null)
  const [filter, setFilter] = useState<FilterTab>("All")
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<"pipelines" | "agents">("agents")

  const fetchRuns = useCallback(async () => {
    const params = new URLSearchParams({ limit: "30" })
    if (filter !== "All") params.set("type", filter)
    const res = await fetch(`/api/agent/runs?${params}`)
    if (!res.ok) return
    const data = await res.json()
    setRuns(data.runs ?? [])
    setStats(data.stats ?? null)
  }, [filter])

  useEffect(() => { fetchRuns() }, [fetchRuns])

  // Auto-refresh while any run is active
  useEffect(() => {
    const hasRunning = runs.some(r => r.status === "running")
    if (!hasRunning) return
    const id = setInterval(fetchRuns, 3000)
    return () => clearInterval(id)
  }, [runs, fetchRuns])

  const filterLabel = (f: FilterTab) =>
    f === "All" ? "All" : f.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div>
      {showForm && (
        <YouTubeResearchForm
          onClose={() => setShowForm(false)}
          onLaunched={() => { fetchRuns(); setTab("agents") }}
        />
      )}

      <PageHeader
        title="Automation"
        subtitle="Pipelines · AI agents · scheduled workflows"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--accent-red)22", color: "var(--accent-red)", border: "1px solid var(--accent-red)44" }}
            >
              <Video size={12} /> YouTube Research
            </button>
            <button
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
            >
              <Zap size={12} /> New Pipeline
            </button>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>{active}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Active pipelines</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stats?.total ?? 0}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Agent runs (last 30)</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>
            {stats ? Math.round(stats.avgDurationMs / 1000) + "s" : "—"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Avg agent duration</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {(["agents", "pipelines"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-xs px-4 py-1.5 rounded-lg font-medium capitalize transition-all"
            style={{
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--muted)",
            }}
          >
            {t === "agents" ? <><Cpu size={10} className="inline mr-1.5" />AI Agents</> : <><Zap size={10} className="inline mr-1.5" />Pipelines</>}
          </button>
        ))}
      </div>

      {/* AI Agents tab */}
      {tab === "agents" && (
        <div>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {FILTER_TABS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: filter === f ? "var(--accent)22" : "var(--surface)",
                  color: filter === f ? "var(--accent)" : "var(--muted)",
                  border: `1px solid ${filter === f ? "var(--accent)44" : "var(--border)"}`,
                }}
              >
                {filterLabel(f)}
              </button>
            ))}
            <button
              onClick={fetchRuns}
              className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              Refresh
            </button>
          </div>

          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Activity size={32} style={{ color: "var(--muted)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>No agent runs yet</p>
              <p className="text-xs text-center max-w-xs" style={{ color: "var(--muted)" }}>
                Launch a YouTube Research run to see live step-by-step agent activity here.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 mt-2"
                style={{ background: "var(--accent-red)", color: "#fff" }}
              >
                <Search size={12} /> Run YouTube Research
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map(run => <RunCard key={run.id} run={run} />)}
            </div>
          )}
        </div>
      )}

      {/* Pipelines tab */}
      {tab === "pipelines" && (
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
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
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
                      >Pause</button>
                    )}
                    {pipeline.status === "paused" && (
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80 flex items-center gap-1"
                        style={{ background: "var(--accent-green)22", color: "var(--accent-green)" }}
                      ><Play size={10} /> Resume</button>
                    )}
                    {pipeline.status === "setup" && (
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                        style={{ background: "var(--accent-gold)22", color: "var(--accent-gold)" }}
                      >Configure</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
