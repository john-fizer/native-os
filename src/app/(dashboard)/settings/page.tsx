"use client"

import PageHeader from "@/components/PageHeader"
import { Key, Globe, Palette, Bell } from "lucide-react"

const API_KEYS = [
  { label: "Claude API Key", key: "ANTHROPIC_API_KEY", status: "not set", hint: "Required for AI Brief, lyric gen, merch prompts" },
  { label: "TikTok Business API", key: "TIKTOK_API_KEY", status: "not set", hint: "Required for auto-posting to TikTok" },
  { label: "Instagram Graph API", key: "INSTAGRAM_ACCESS_TOKEN", status: "not set", hint: "Required for Instagram automation" },
  { label: "YouTube Data API v3", key: "YOUTUBE_API_KEY", status: "not set", hint: "Required for YouTube analytics" },
  { label: "Spotify Web API", key: "SPOTIFY_CLIENT_ID", status: "not set", hint: "Required for streaming stats" },
  { label: "ACRCloud (copyright)", key: "ACRCLOUD_ACCESS_KEY", status: "not set", hint: "Required for audio copyright scanning" },
  { label: "Printful API", key: "PRINTFUL_API_KEY", status: "not set", hint: "Required for merch automation" },
  { label: "Shopify Admin API", key: "SHOPIFY_ACCESS_TOKEN", status: "not set", hint: "Required for storefront sync" },
]

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="API keys · integrations · preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { icon: <Key size={16} />, label: "API Keys", count: "0/8 connected", color: "var(--accent-gold)" },
          { icon: <Globe size={16} />, label: "Integrations", count: "0 active", color: "var(--accent-blue)" },
          { icon: <Bell size={16} />, label: "Notifications", count: "Email off", color: "var(--accent-purple)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + "22", color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.label}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>API Keys & Integrations</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Keys are stored locally in .env.local — never committed to git</p>
        </div>
        {API_KEYS.map((api) => (
          <div
            key={api.key}
            className="px-4 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{api.label}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{api.key}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{api.hint}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ background: "var(--accent-red)22", color: "var(--accent-red)" }}
                >
                  {api.status}
                </span>
                <button
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  Add Key
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--accent-gold)" }}>Quick Start — Connect Your First Integration</p>
        <div className="space-y-1 text-xs" style={{ color: "var(--muted)" }}>
          <p>1. Get your <strong style={{ color: "var(--foreground)" }}>Claude API key</strong> from console.anthropic.com → enables AI briefs, merch generation, and the boardroom report</p>
          <p>2. Get your <strong style={{ color: "var(--foreground)" }}>ACRCloud key</strong> (free tier available) → unlocks the legal copyright scanner</p>
          <p>3. Connect <strong style={{ color: "var(--foreground)" }}>TikTok Business API</strong> → enables the auto-post pipeline for your biggest growth channel</p>
        </div>
      </div>
    </div>
  )
}
