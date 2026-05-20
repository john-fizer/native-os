"use client"

import { useState, useEffect } from "react"
import PageHeader from "@/components/PageHeader"
import { Key, CheckCircle, XCircle, Eye, EyeOff, Save, Loader2 } from "lucide-react"

const API_KEYS = [
  { label: "Claude API Key", key: "ANTHROPIC_API_KEY", hint: "Enables AI briefs, lyric gen, boardroom report", required: true },
  { label: "TikTok Business API", key: "TIKTOK_API_KEY", hint: "Auto-posting to TikTok", required: false },
  { label: "Instagram Graph API", key: "INSTAGRAM_ACCESS_TOKEN", hint: "Instagram automation and analytics", required: false },
  { label: "YouTube Data API v3", key: "YOUTUBE_API_KEY", hint: "YouTube analytics and clip automation", required: false },
  { label: "Spotify Client ID", key: "SPOTIFY_CLIENT_ID", hint: "Streaming stats for XRXS and M3K1", required: false },
  { label: "ACRCloud (copyright)", key: "ACRCLOUD_ACCESS_KEY", hint: "Audio copyright scanning", required: false },
  { label: "Printful API", key: "PRINTFUL_API_KEY", hint: "Merch automation and order management", required: false },
  { label: "Shopify Admin API", key: "SHOPIFY_ACCESS_TOKEN", hint: "Storefront sync and order tracking", required: false },
]

export default function SettingsPage() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({})
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => setStatuses(d.statuses ?? {}))
      .catch(() => {})
  }, [])

  async function saveKey(key: string) {
    const value = inputs[key]?.trim()
    if (!value) return
    setSaving(s => ({ ...s, [key]: true }))

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      if (res.ok) {
        setStatuses(s => ({ ...s, [key]: true }))
        setInputs(i => ({ ...i, [key]: "" }))
        setSaved(s => ({ ...s, [key]: true }))
        setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 3000)
      }
    } finally {
      setSaving(s => ({ ...s, [key]: false }))
    }
  }

  const connectedCount = Object.values(statuses).filter(Boolean).length

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="API keys are saved to .env.local and never committed to git"
      />

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: connectedCount > 0 ? "var(--accent-green)" : "var(--muted)" }}>{connectedCount}/{API_KEYS.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Keys connected</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: `1px solid ${statuses["ANTHROPIC_API_KEY"] ? "var(--accent-green)" : "var(--accent-gold)"}44` }}>
          <div className="flex items-center gap-2">
            {statuses["ANTHROPIC_API_KEY"]
              ? <CheckCircle size={16} style={{ color: "var(--accent-green)" }} />
              : <XCircle size={16} style={{ color: "var(--accent-gold)" }} />
            }
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Claude API</p>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            {statuses["ANTHROPIC_API_KEY"] ? "AI features active" : "Required for AI features"}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Auto-post</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            {statuses["TIKTOK_API_KEY"] ? "TikTok connected" : "Connect TikTok to enable"}
          </p>
        </div>
      </div>

      {/* Keys */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>API Keys</p>
        </div>
        {API_KEYS.map((api) => {
          const connected = statuses[api.key]
          const isSaving = saving[api.key]
          const isSaved = saved[api.key]
          const isVisible = visible[api.key]

          return (
            <div key={api.key} className="px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: connected ? "var(--accent-green)22" : "var(--surface-2)" }}
                >
                  <Key size={13} style={{ color: connected ? "var(--accent-green)" : "var(--muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{api.label}</p>
                    {api.required && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent-gold)22", color: "var(--accent-gold)" }}>
                        required
                      </span>
                    )}
                    {connected && (
                      <span className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: "var(--accent-green)22", color: "var(--accent-green)" }}>
                        <CheckCircle size={10} /> connected
                      </span>
                    )}
                    {isSaved && (
                      <span className="text-xs" style={{ color: "var(--accent-green)" }}>Saved!</span>
                    )}
                  </div>
                  <p className="text-xs font-mono mb-2" style={{ color: "var(--muted)" }}>{api.key}</p>
                  <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{api.hint}</p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={isVisible ? "text" : "password"}
                        placeholder={connected ? "••••••••••••• (already set)" : "Paste key here..."}
                        value={inputs[api.key] ?? ""}
                        onChange={(e) => setInputs(i => ({ ...i, [api.key]: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-lg pr-8"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <button
                        onClick={() => setVisible(v => ({ ...v, [api.key]: !v[api.key] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted)" }}
                      >
                        {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <button
                      onClick={() => saveKey(api.key)}
                      disabled={!inputs[api.key]?.trim() || isSaving}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-40 flex-shrink-0"
                      style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
                    >
                      {isSaving
                        ? <Loader2 size={11} className="animate-spin" />
                        : <Save size={11} />
                      }
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-4 rounded-xl text-xs" style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)33", color: "var(--muted)" }}>
        <strong style={{ color: "var(--accent-gold)" }}>Note:</strong> After saving your Claude API key, restart the dev server (<code style={{ color: "var(--foreground)" }}>npm run dev</code>) for the key to take effect in API routes.
      </div>
    </div>
  )
}
