"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { Asset } from "@/lib/supabase"
import { BRANDS } from "@/lib/brands"
import { Mic2, Wand2, FileText, Video, Loader2, Copy, Check, Plus, X } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  ready:      "var(--accent-green)",
  mixing:     "var(--accent-purple)",
  writing:    "var(--accent-gold)",
  editing:    "var(--accent-blue)",
  in_review:  "var(--muted)",
  draft:      "var(--muted)",
}

const CONTENT_TYPES = [
  "Hook (TikTok)",
  "Verse lyrics",
  "Caption copy",
  "Merch prompt",
  "Content script",
]

const AssetIcon = ({ type, color }: { type: string; color: string }) => {
  if (type === "track") return <Mic2 size={14} style={{ color }} />
  if (type === "video") return <Video size={14} style={{ color }} />
  return <FileText size={14} style={{ color }} />
}

const BLANK_ASSET = { brand_id: "m3k1", name: "", asset_type: "track", status: "draft" }

export default function StudioPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [assetForm, setAssetForm] = useState(BLANK_ASSET)
  const [savingAsset, setSavingAsset] = useState(false)

  const [brand, setBrand] = useState("M3K1")
  const [type, setType] = useState("Hook (TikTok)")
  const [context, setContext] = useState("")
  const [output, setOutput] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const activeBrand = BRANDS.find(b => b.name === brand)

  const loadAssets = useCallback(async () => {
    setLoadingAssets(true)
    try {
      const res = await fetch("/api/assets")
      const data = await res.json()
      setAssets(data.assets ?? [])
    } finally {
      setLoadingAssets(false)
    }
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])

  async function addAsset() {
    if (!assetForm.name) return
    setSavingAsset(true)
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetForm),
    })
    setAssetForm(BLANK_ASSET)
    setShowForm(false)
    setSavingAsset(false)
    loadAssets()
  }

  async function generate() {
    setGenerating(true)
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
      setGenerating(false)
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
        actions={
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            <Plus size={12} /> Add Asset
          </button>
        }
      />

      {/* Brand profiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {BRANDS.map((b) => (
          <div key={b.id} onClick={() => setBrand(b.name)}
            className="rounded-xl p-4 cursor-pointer transition-all"
            style={{
              background: brand === b.name ? b.color + "22" : "var(--surface)",
              border: `1px solid ${brand === b.name ? b.color : b.color + "44"}`,
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-3"
              style={{ background: b.color + "33", color: b.color }}>
              {b.name[0]}
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{b.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{b.fullName}</p>
            <p className="text-xs mt-1" style={{ color: b.color }}>{b.genre}</p>
          </div>
        ))}
      </div>

      {/* Add asset form */}
      {showForm && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Asset</p>
            <button onClick={() => setShowForm(false)}><X size={14} style={{ color: "var(--muted)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select value={assetForm.brand_id} onChange={e => setAssetForm(f => ({ ...f, brand_id: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Type</label>
              <select value={assetForm.asset_type} onChange={e => setAssetForm(f => ({ ...f, asset_type: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {["track", "video", "design", "sample", "other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Name</label>
              <input type="text" value={assetForm.name} onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Already Gone – demo v3"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Status</label>
              <select value={assetForm.status} onChange={e => setAssetForm(f => ({ ...f, status: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {["draft", "writing", "mixing", "editing", "in_review", "ready"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button onClick={addAsset} disabled={savingAsset || !assetForm.name}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            {savingAsset ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Save Asset
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Asset library */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Asset Library</p>
          </div>

          {loadingAssets && (
            <div className="flex justify-center py-12">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--muted)" }} />
            </div>
          )}

          {!loadingAssets && assets.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
              No assets yet. Add your first track, video, or design.
            </div>
          )}

          {!loadingAssets && assets.map((asset) => {
            const brandColor = BRANDS.find(b => b.id === asset.brand_id)?.color ?? "var(--muted)"
            const statusColor = STATUS_COLORS[asset.status] ?? "var(--muted)"
            return (
              <div key={asset.id} className="px-4 py-3 border-b hover:bg-white/5 transition-all flex items-center gap-3"
                style={{ borderColor: "var(--border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: brandColor + "33" }}>
                  <AssetIcon type={asset.asset_type} color={brandColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{asset.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {BRANDS.find(b => b.id === asset.brand_id)?.name ?? asset.brand_id} · {asset.asset_type}
                  </p>
                </div>
                {asset.bpm && (
                  <div className="text-right mr-4 hidden sm:block">
                    <p className="text-xs" style={{ color: "var(--muted)" }}>BPM: <span style={{ color: "var(--foreground)" }}>{asset.bpm}</span></p>
                    {asset.key && <p className="text-xs" style={{ color: "var(--muted)" }}>Key: <span style={{ color: "var(--foreground)" }}>{asset.key}</span></p>}
                  </div>
                )}
                <span className="text-xs px-2 py-1 rounded-full flex-shrink-0 capitalize"
                  style={{ background: statusColor + "22", color: statusColor }}>
                  {asset.status.replace("_", " ")}
                </span>
              </div>
            )
          })}
        </div>

        {/* AI Brief Generator */}
        <div className="rounded-xl p-4 flex flex-col"
          style={{ background: "var(--surface)", border: `1px solid ${activeBrand?.color ?? "#8b5cf6"}44` }}>
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={14} style={{ color: activeBrand?.color ?? "#8b5cf6" }} />
            <p className="text-sm font-semibold" style={{ color: activeBrand?.color ?? "#8b5cf6" }}>
              AI Creative Brief — {brand}
            </p>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {BRANDS.map(b => <option key={b.id} value={b.name}>{b.name} — {b.genre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Content Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Context (optional)</label>
              <textarea value={context} onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. song is about overcoming doubt, targeting 18-24 year olds..."
                rows={2} className="w-full text-sm px-3 py-2 rounded-lg resize-none"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
          </div>

          <button onClick={generate} disabled={generating}
            className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-80 mb-4 disabled:opacity-50"
            style={{ background: activeBrand?.color ?? "#8b5cf6", color: "white" }}>
            {generating
              ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
              : <><Wand2 size={14} /> Generate</>
            }
          </button>

          {error && (
            <div className="text-xs p-3 rounded-lg mb-3"
              style={{ background: "var(--accent-red)11", border: "1px solid var(--accent-red)44", color: "var(--accent-red)" }}>
              {error}
            </div>
          )}

          {output && (
            <div className="flex-1 relative">
              <div className="text-sm p-3 rounded-lg whitespace-pre-wrap leading-relaxed"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)", minHeight: 120 }}>
                {output}
              </div>
              <button onClick={copyOutput}
                className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                style={{ background: "var(--surface)", color: copied ? "var(--accent-green)" : "var(--muted)" }}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {!output && !generating && !error && (
            <div className="flex-1 flex items-center justify-center text-xs rounded-lg"
              style={{ background: "var(--surface-2)", color: "var(--muted)", minHeight: 80, border: "1px solid var(--border)" }}>
              Output appears here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
