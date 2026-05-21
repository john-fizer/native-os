"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { LegalScan } from "@/lib/supabase"
import { BRANDS } from "@/lib/brands"
import { ShieldCheck, ShieldAlert, Search, RefreshCw, Plus, Loader2, Clock } from "lucide-react"

const RESULT_META = {
  clear:   { label: "Clear",    color: "var(--accent-green)", icon: <ShieldCheck size={13} /> },
  flagged: { label: "Flagged",  color: "var(--accent-red)",   icon: <ShieldAlert size={13} /> },
  pending: { label: "Pending",  color: "var(--accent-gold)",  icon: <RefreshCw size={13} /> },
  error:   { label: "Error",    color: "var(--muted)",        icon: <Clock size={13} /> },
}

export default function LegalPage() {
  const [scans, setScans] = useState<(LegalScan & { brands?: { name: string; color: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [form, setForm] = useState({
    brand_id: "m3k1",
    asset_name: "",
    scan_type: "audio",
    audio_url: "",
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/legal")
      const data = await res.json()
      setScans(data.scans ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 5s if any scans are pending
  useEffect(() => {
    const hasPending = scans.some(s => s.result === "pending")
    if (!hasPending) return
    const t = setTimeout(load, 5000)
    return () => clearTimeout(t)
  }, [scans, load])

  async function runScan() {
    if (!form.asset_name) return
    setScanning(true)
    await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm(f => ({ ...f, asset_name: "", audio_url: "" }))
    setShowForm(false)
    setScanning(false)
    load()
  }

  const flagged = scans.filter(s => s.result === "flagged").length
  const clear = scans.filter(s => s.result === "clear").length
  const pending = scans.filter(s => s.result === "pending").length

  return (
    <div>
      <PageHeader
        title="Legal Department"
        subtitle="IP protection · copyright scanning · trademark monitoring"
        actions={
          <div className="flex gap-2">
            <button onClick={load}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
              <Plus size={12} /> New Scan
            </button>
          </div>
        }
      />

      {/* New scan form */}
      {showForm && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Run New Scan</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Scan Type</label>
              <select value={form.scan_type} onChange={e => setForm(f => ({ ...f, scan_type: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                <option value="audio">Audio (ACRCloud)</option>
                <option value="visual">Visual / Logo</option>
                <option value="trademark">Trademark</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Asset Name</label>
              <input type="text" value={form.asset_name} onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))}
                placeholder="e.g. Already Gone – demo v3"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            {form.scan_type === "audio" && (
              <div className="col-span-2">
                <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Audio URL (optional — for ACRCloud scan)</label>
                <input type="text" value={form.audio_url} onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))}
                  placeholder="https://... (mp3 or wav)"
                  className="w-full text-sm px-3 py-2 rounded-lg"
                  style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
                {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    ACRCloud keys required in Settings for live audio scanning
                  </p>
                )}
              </div>
            )}
          </div>
          <button onClick={runScan} disabled={scanning || !form.asset_name}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            {scanning ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            Run Scan
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>{clear}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Cleared assets</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-red)" }}>{flagged}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Needs review</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{pending}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Scanning...</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Scan Log</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--muted)" }} />
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
            No scans yet. Run a scan to protect your content.
          </div>
        )}

        {!loading && scans.map(scan => {
          const meta = RESULT_META[scan.result as keyof typeof RESULT_META] ?? RESULT_META.pending
          const brandColor = BRANDS.find(b => b.id === scan.brand_id)?.color ?? "var(--muted)"

          return (
            <div key={scan.id} className="px-4 py-4 border-b hover:bg-white/5 transition-all"
              style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: brandColor + "33", color: brandColor }}>
                    {scan.brand_id?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{scan.asset_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{scan.detail}</p>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--muted)" }}>
                      {scan.scan_type} scan · {new Date(scan.scanned_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0"
                  style={{ background: meta.color + "22", color: meta.color }}>
                  {meta.icon} {meta.label}
                </span>
              </div>
              {scan.result === "flagged" && scan.action_required && (
                <div className="mt-3 ml-10 p-3 rounded-lg text-xs"
                  style={{ background: "var(--accent-red)11", border: "1px solid var(--accent-red)44", color: "var(--accent-red)" }}>
                  Action required: {scan.action_required}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
