"use client"

import PageHeader from "@/components/PageHeader"
import { ShieldCheck, ShieldAlert, Search, RefreshCw } from "lucide-react"

const SCANS = [
  { id: 1, asset: "Already Gone (M3K1 – demo v3)", type: "Audio", result: "clear", detail: "No copyright matches found", time: "2h ago", brand: "M3K1", color: "#8b5cf6" },
  { id: 2, asset: "Fortis Mane Lion Logo v2", type: "Visual", result: "clear", detail: "No trademark conflicts detected", time: "5h ago", brand: "Fortis Mane", color: "#10b981" },
  { id: 3, asset: "Worship snippet – bridge vocal", type: "Audio", result: "flagged", detail: "Possible match: Hillsong United – 'Oceans' (85% confidence). Review sample usage.", time: "6h ago", brand: "XRXS", color: "#c9a84c" },
  { id: 4, asset: "XRXS brand name", type: "Trademark", result: "clear", detail: "No USPTO conflicts on XRXS in music/apparel classes", time: "2d ago", brand: "XRXS", color: "#c9a84c" },
  { id: 5, asset: "M3K1 brand name", type: "Trademark", result: "clear", detail: "No USPTO conflicts on M3K1 in music/apparel classes", time: "2d ago", brand: "M3K1", color: "#8b5cf6" },
  { id: 6, asset: "Fortis Mane brand name", type: "Trademark", result: "pending", detail: "USPTO search in progress...", time: "1d ago", brand: "Fortis Mane", color: "#10b981" },
]

const RESULT_META = {
  clear: { label: "Clear", color: "var(--accent-green)", icon: <ShieldCheck size={13} /> },
  flagged: { label: "Flagged", color: "var(--accent-red)", icon: <ShieldAlert size={13} /> },
  pending: { label: "Pending", color: "var(--accent-gold)", icon: <RefreshCw size={13} /> },
}

export default function LegalPage() {
  const flagged = SCANS.filter(s => s.result === "flagged").length
  const clear = SCANS.filter(s => s.result === "clear").length

  return (
    <div>
      <PageHeader
        title="Legal Department"
        subtitle="IP protection, copyright scanning, trademark monitoring"
        actions={
          <button
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <Search size={12} /> Run New Scan
          </button>
        }
      />

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
          <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>1</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Pending scan</p>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Scan Log</p>
        </div>
        {SCANS.map((scan) => {
          const meta = RESULT_META[scan.result as keyof typeof RESULT_META]
          return (
            <div
              key={scan.id}
              className="px-4 py-4 border-b hover:bg-white/5 transition-all"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: scan.color + "33", color: scan.color }}
                  >
                    {scan.brand[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{scan.asset}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{scan.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"
                    style={{ background: meta.color + "22", color: meta.color }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{scan.time}</span>
                </div>
              </div>
              {scan.result === "flagged" && (
                <div
                  className="mt-3 ml-10 p-3 rounded-lg text-xs"
                  style={{ background: "var(--accent-red)11", border: "1px solid var(--accent-red)44", color: "var(--accent-red)" }}
                >
                  Action required: Review sample clearance or rerecord the section. Do not post until resolved.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
