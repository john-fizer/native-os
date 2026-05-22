"use client"

import { useState } from "react"
import { THEMES, THEME_GROUPS } from "@/lib/themes"
import { useTheme } from "@/context/ThemeContext"
import { Palette, X, Check } from "lucide-react"

function MiniPreview({ preview, active }: { preview: [string, string, string, string]; active: boolean }) {
  const [bg, surface, accent, accent2] = preview
  return (
    <div className="w-full rounded-lg overflow-hidden mb-2"
      style={{ background: bg, border: `1px solid ${active ? accent : accent + "44"}`, height: 64 }}>
      {/* Mini sidebar strip */}
      <div className="flex h-full">
        <div className="w-8 h-full flex flex-col justify-center items-center gap-1"
          style={{ background: surface, borderRight: `1px solid ${accent}22` }}>
          {[accent, accent2, accent + "88"].map((c, i) => (
            <div key={i} className="w-3 h-1 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="h-2 rounded-sm" style={{ background: surface, width: "70%" }} />
          <div className="h-1.5 rounded-sm" style={{ background: accent + "44", width: "90%" }} />
          <div className="h-1.5 rounded-sm" style={{ background: accent2 + "33", width: "60%" }} />
          <div className="flex gap-1 mt-auto">
            <div className="h-3 rounded-sm flex-1" style={{ background: accent + "33" }} />
            <div className="h-3 rounded-sm flex-1" style={{ background: surface }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const active = THEMES.find(t => t.id === theme)

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
        style={{ color: "var(--muted)" }}
      >
        <Palette size={15} />
        <span className="text-xs">Skins</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
          style={{ background: "var(--surface-2)", color: "var(--accent-gold)", fontSize: 10 }}>
          {active?.name ?? "Native OS"}
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={() => setOpen(false)} />
      )}

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-screen z-50 flex flex-col"
        style={{
          width: 320,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: open ? "-20px 0 60px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Skins</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Choose a look for Native OS</p>
          </div>
          <button onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all flex-shrink-0"
            style={{ background: "var(--surface-2)" }}>
            <X size={13} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {/* Scrollable theme list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {THEME_GROUPS.map(group => {
            const groupThemes = THEMES.filter(t => t.group === group)
            return (
              <div key={group}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
                  style={{ color: "var(--muted)" }}>
                  {group}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {groupThemes.map(t => {
                    const isActive = theme === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id as typeof theme); setOpen(false) }}
                        className="relative p-2.5 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: isActive ? t.preview[0] : "var(--surface-2)",
                          border: `1px solid ${isActive ? t.preview[2] : "var(--border)"}`,
                        }}
                      >
                        {isActive && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center z-10"
                            style={{ background: t.preview[2] }}>
                            <Check size={8} color={t.preview[0]} strokeWidth={3} />
                          </div>
                        )}
                        <MiniPreview preview={t.preview} active={isActive} />
                        <p className="text-xs font-semibold leading-tight" style={{ color: isActive ? t.preview[2] : "var(--foreground)" }}>
                          {t.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontSize: 10 }}>
                          {t.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Active: <span style={{ color: "var(--accent-gold)" }}>{active?.name}</span>
            {" · "}{active?.desc}
          </p>
        </div>
      </div>
    </>
  )
}
