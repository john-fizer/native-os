"use client"

import { useState } from "react"
import { THEMES } from "@/lib/themes"
import { useTheme } from "@/context/ThemeContext"
import { Palette, X, Check } from "lucide-react"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
        style={{ color: "var(--muted)" }}
        title="Switch theme"
      >
        <Palette size={15} />
        <span className="text-xs">Theme</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
          style={{ background: "var(--surface-2)", color: "var(--accent-gold)", fontSize: 10 }}>
          {THEMES.find(t => t.id === theme)?.name ?? "Native OS"}
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Themes</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Choose a skin for Native OS</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                style={{ background: "var(--surface-2)" }}>
                <X size={14} style={{ color: "var(--muted)" }} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => {
                const active = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id as typeof theme); setOpen(false) }}
                    className="relative p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                    style={{
                      background: active ? "var(--accent-gold)18" : "var(--surface-2)",
                      border: `1px solid ${active ? "var(--accent-gold)" : "var(--border)"}`,
                    }}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "var(--accent-gold)" }}>
                        <Check size={9} color="#000" strokeWidth={3} />
                      </span>
                    )}

                    {/* Color swatches */}
                    <div className="flex gap-1 mb-2">
                      {t.colors.map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-white/10"
                          style={{ background: c }} />
                      ))}
                    </div>

                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
