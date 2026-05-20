"use client"

import { useState } from "react"
import PageHeader from "@/components/PageHeader"
import { BRANDS } from "@/lib/brands"
import { Mic2, Wand2, FileText, Loader2, Copy, Check } from "lucide-react"

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

const CONTENT_TYPES = [
  "Hook (TikTok)",
  "Verse lyrics",
  "Caption copy",
  "Merch prompt",
  "Content script",
]

export default function StudioPage() {
  const [brand, setBrand] = useState("M3K1")
  const [type, setType] = useState("Hook (TikTok)")
  const [context, setContext] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const activeBrand = BRANDS.find(b => b.name === brand)

  async function generate() {
    setLoading(true)
    setError("")
    setOutput("")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, type, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutput(data.output)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setLoading(false)
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Studio"
        subtitle="Creative assets — music, video, design across all brands"
      />

      {/* Brand profiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {BRANDS.map((b) => (
          <div
            key={b.id}
            onClick={() => setBrand(b.name)}
            className="rounded-xl p-4 cursor-pointer transition-all"
            style={{
              background: brand === b.name ? b.color + "22" : "var(--surface)",
              border: `1px solid ${brand === b.name ? b.color : b.color + "44"}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-3"
              style={{ background: b.color + "33", color: b.color }}
            >
              {b.name[0]}
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{b.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{b.fullName}</p>
            <p className="text-xs mt-1" style={{ color: b.color }}>{b.genre}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Asset library */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Asset Library</p>
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
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>BPM: <span style={{ color: "var(--foreground)" }}>{asset.bpm}</span></p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>Key: <span style={{ color: "var(--foreground)" }}>{asset.key}</span></p>
                </div>
              )}
              <span
                className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                style={{ background: (STATUS_COLORS[asset.status] || "var(--muted)") + "22", color: STATUS_COLORS[asset.status] || "var(--muted)" }}
              >
                {asset.status}
              </span>
            </div>
          ))}
        </div>

        {/* AI Brief Generator */}
        <div
          className="rounded-xl p-4 flex flex-col"
          style={{ background: "var(--surface)", border: `1px solid ${activeBrand?.color ?? "#8b5cf6"}44` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={14} style={{ color: activeBrand?.color ?? "#8b5cf6" }} />
            <p className="text-sm font-semibold" style={{ color: activeBrand?.color ?? "#8b5cf6" }}>
              AI Creative Brief — {brand}
            </p>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                {BRANDS.map(b => <option key={b.id} value={b.name}>{b.name} — {b.genre}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Content Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Context (optional)</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. song is about overcoming doubt, targeting 18-24 year olds..."
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-lg resize-none"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              />
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-80 mb-4 disabled:opacity-50"
            style={{ background: activeBrand?.color ?? "#8b5cf6", color: "white" }}
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
              : <><Wand2 size={14} /> Generate</>
            }
          </button>

          {error && (
            <div
              className="text-xs p-3 rounded-lg mb-3"
              style={{ background: "var(--accent-red)11", border: "1px solid var(--accent-red)44", color: "var(--accent-red)" }}
            >
              {error}
            </div>
          )}

          {output && (
            <div className="flex-1 relative">
              <div
                className="text-sm p-3 rounded-lg whitespace-pre-wrap leading-relaxed"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)", minHeight: 120 }}
              >
                {output}
              </div>
              <button
                onClick={copyOutput}
                className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                style={{ background: "var(--surface)", color: copied ? "var(--accent-green)" : "var(--muted)" }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {!output && !loading && !error && (
            <div
              className="flex-1 flex items-center justify-center text-xs rounded-lg"
              style={{ background: "var(--surface-2)", color: "var(--muted)", minHeight: 80, border: "1px solid var(--border)" }}
            >
              Output appears here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
