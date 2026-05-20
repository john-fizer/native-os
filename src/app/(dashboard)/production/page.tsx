"use client"

import PageHeader from "@/components/PageHeader"
import { Clock, CheckCircle2, AlertCircle, Plus, Play, Camera, Tv2, Music } from "lucide-react"

const QUEUE = [
  { id: 1, brand: "M3K1", color: "#8b5cf6", title: "Hook challenge – 'Already Gone'", platform: "tiktok", status: "ready", due: "Today 6PM", type: "Reel" },
  { id: 2, brand: "XRXS", color: "#c9a84c", title: "Worship snippet – bridge vocal", platform: "instagram", status: "legal_review", due: "Today 8PM", type: "Story" },
  { id: 3, brand: "Philosopher", color: "#4c7fc9", title: "Ep.7 – 'Why We Dream' full upload", platform: "youtube", status: "processing", due: "Tomorrow 12PM", type: "Long-form" },
  { id: 4, brand: "Fortis Mane", color: "#10b981", title: "AM workout routine #12", platform: "instagram", status: "draft", due: "Tomorrow 7AM", type: "Reel" },
  { id: 5, brand: "M3K1", color: "#8b5cf6", title: "Studio vlog – tracking session", platform: "youtube", status: "draft", due: "Wed", type: "Vlog" },
  { id: 6, brand: "XRXS", color: "#c9a84c", title: "Lyrics reveal – 'Refiner'", platform: "instagram", status: "ready", due: "Wed", type: "Post" },
]

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ready: { label: "Ready", color: "var(--accent-green)", icon: <CheckCircle2 size={12} /> },
  legal_review: { label: "Legal Review", color: "var(--accent-gold)", icon: <AlertCircle size={12} /> },
  processing: { label: "Processing", color: "var(--accent-blue)", icon: <Clock size={12} /> },
  draft: { label: "Draft", color: "var(--muted)", icon: <Clock size={12} /> },
}

const PlatformIcon = ({ p }: { p: string }) => {
  if (p === "youtube") return <Tv2 size={12} style={{ color: "var(--muted)" }} />
  if (p === "instagram") return <Camera size={12} style={{ color: "var(--muted)" }} />
  return <Music size={12} style={{ color: "var(--muted)" }} />
}

export default function ProductionPage() {
  const readyCount = QUEUE.filter(q => q.status === "ready").length

  return (
    <div>
      <PageHeader
        title="Production Floor"
        subtitle="Content queue — scheduled posts and pipeline status"
        actions={
          <button
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            <Plus size={12} /> New Content
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "In Queue", value: QUEUE.length, color: "var(--foreground)" },
          { label: "Ready to Post", value: readyCount, color: "var(--accent-green)" },
          { label: "In Review", value: 1, color: "var(--accent-gold)" },
          { label: "Posted Today", value: 3, color: "var(--accent-blue)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="px-4 py-3 border-b grid grid-cols-12 text-xs font-medium uppercase tracking-wider"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          <span className="col-span-1">Brand</span>
          <span className="col-span-4">Content</span>
          <span className="col-span-2">Platform</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1">Due</span>
        </div>
        {QUEUE.map((item) => {
          const status = STATUS_META[item.status]
          return (
            <div
              key={item.id}
              className="px-4 py-3 border-b grid grid-cols-12 items-center hover:bg-white/5 transition-all cursor-pointer"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="col-span-1">
                <div
                  className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                  style={{ background: item.color + "33", color: item.color }}
                >
                  {item.brand[0]}
                </div>
              </div>
              <div className="col-span-4 pr-2">
                <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{item.title}</p>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <PlatformIcon p={item.platform} />
                <span className="text-xs capitalize" style={{ color: "var(--muted)" }}>{item.platform}</span>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                  {item.type}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-1" style={{ color: status.color }}>
                {status.icon}
                <span className="text-xs">{status.label}</span>
              </div>
              <div className="col-span-1 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--muted)" }}>{item.due}</span>
                {item.status === "ready" && (
                  <button
                    className="w-5 h-5 rounded flex items-center justify-center hover:opacity-80"
                    style={{ background: "var(--accent-green)" }}
                  >
                    <Play size={9} fill="white" style={{ color: "white" }} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
