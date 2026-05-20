"use client"

import PageHeader from "@/components/PageHeader"
import { BRANDS } from "@/lib/brands"
import { Mic2, Wand2, FileText } from "lucide-react"

const ASSETS = [
  { id: 1, name: "Already Gone – demo v3", brand: "M3K1", color: "#8b5cf6", type: "Track", status: "Mixing", bpm: 94, key: "Am" },
  { id: 2, name: "Refiner – final master", brand: "XRXS", color: "#c9a84c", type: "Track", status: "Ready", bpm: 76, key: "G" },
  { id: 3, name: "Chosen (feat. unnamed)", brand: "XRXS", color: "#c9a84c", type: "Track", status: "Writing", bpm: 88, key: "E" },
  { id: 4, name: "Ep.7 – Why We Dream", brand: "Philosopher Stoned", color: "#4c7fc9", type: "Video", status: "Editing", bpm: null, key: null },
  { id: 5, name: "Fortis Mane S/S Collection", brand: "Fortis Mane", color: "#10b981", type: "Design", status: "In Review", bpm: null, key: null },
]

const STATUS_COLORS: Record<string, string> = {
  Ready: "var(--accent-green)",
  Mixing: "var(--accent-purple)",
  Writing: "var(--accent-gold)",
  Editing: "var(--accent-blue)",
  "In Review": "var(--muted)",
}

export default function StudioPage() {
  return (
    <div>
      <PageHeader
        title="Studio"
        subtitle="Creative assets — music, video, design across all brands"
        actions={
          <button
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-purple)", color: "white" }}
          >
            <Wand2 size={12} /> AI Brief
          </button>
        }
      />

      {/* Brand profiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {BRANDS.map((brand) => (
          <div
            key={brand.id}
            className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-all"
            style={{ background: "var(--surface)", border: `1px solid ${brand.color}44` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-3"
              style={{ background: brand.color + "33", color: brand.color }}
            >
              {brand.name[0]}
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{brand.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{brand.fullName}</p>
            <p className="text-xs mt-1" style={{ color: brand.color }}>{brand.genre}</p>
          </div>
        ))}
      </div>

      {/* Asset library */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Asset Library</p>
          <button
            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            <FileText size={11} /> All types
          </button>
        </div>
        {ASSETS.map((asset) => (
          <div
            key={asset.id}
            className="px-4 py-3 border-b hover:bg-white/5 transition-all flex items-center gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: asset.color + "33" }}
            >
              {asset.type === "Track"
                ? <Mic2 size={14} style={{ color: asset.color }} />
                : <FileText size={14} style={{ color: asset.color }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{asset.name}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{asset.brand} · {asset.type}</p>
            </div>
            {asset.bpm && (
              <div className="text-right mr-4">
                <p className="text-xs" style={{ color: "var(--muted)" }}>BPM: <span style={{ color: "var(--foreground)" }}>{asset.bpm}</span></p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Key: <span style={{ color: "var(--foreground)" }}>{asset.key}</span></p>
              </div>
            )}
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: (STATUS_COLORS[asset.status] || "var(--muted)") + "22", color: STATUS_COLORS[asset.status] || "var(--muted)" }}
            >
              {asset.status}
            </span>
          </div>
        ))}
      </div>

      {/* AI lyric / brief generator */}
      <div
        className="rounded-xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--accent-purple)44" }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "#8b5cf6" }}>AI Creative Brief Generator</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <select
            className="text-xs px-3 py-2 rounded-lg col-span-1"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <option>M3K1</option>
            <option>XRXS</option>
            <option>Fortis Mane</option>
            <option>Philosopher Stoned</option>
          </select>
          <select
            className="text-xs px-3 py-2 rounded-lg col-span-1"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <option>Hook (TikTok)</option>
            <option>Verse lyrics</option>
            <option>Caption copy</option>
            <option>Merch prompt</option>
            <option>Content script</option>
          </select>
          <button
            className="text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "#8b5cf6", color: "white" }}
          >
            Generate
          </button>
        </div>
        <div
          className="text-xs p-3 rounded-lg"
          style={{ background: "var(--surface-2)", color: "var(--muted)", minHeight: 60 }}
        >
          Output will appear here. Connect Claude API key in Settings to enable.
        </div>
      </div>
    </div>
  )
}
