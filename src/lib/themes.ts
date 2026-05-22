export interface Theme {
  id: string
  name: string
  desc: string
  group: string
  // preview colors [bg, surface, accent, accent2]
  preview: [string, string, string, string]
}

export const THEMES: Theme[] = [
  // ── Dark ──────────────────────────────────────────────
  {
    id: "native",
    name: "Native OS",
    desc: "Default dark gold",
    group: "Dark",
    preview: ["#0a0a0f", "#12121a", "#c9a84c", "#10b981"],
  },
  {
    id: "sleek",
    name: "Sleek",
    desc: "OLED minimal",
    group: "Dark",
    preview: ["#000000", "#111111", "#3b82f6", "#f5f5f7"],
  },
  {
    id: "noir",
    name: "Noir",
    desc: "Black & white film",
    group: "Dark",
    preview: ["#050505", "#111111", "#ffffff", "#888888"],
  },

  // ── Sci-Fi ────────────────────────────────────────────
  {
    id: "jarvis",
    name: "J.A.R.V.I.S",
    desc: "Iron Man HUD",
    group: "Sci-Fi",
    preview: ["#020b16", "#061624", "#ff7300", "#00c8ff"],
  },
  {
    id: "matrix",
    name: "Matrix",
    desc: "Green terminal",
    group: "Sci-Fi",
    preview: ["#000000", "#020d02", "#00ff41", "#004400"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    desc: "Neon city nights",
    group: "Sci-Fi",
    preview: ["#08001a", "#100025", "#ff00aa", "#00ffff"],
  },
  {
    id: "alien",
    name: "Alien",
    desc: "Bioluminescent",
    group: "Sci-Fi",
    preview: ["#000a08", "#001a12", "#00ff9d", "#00ccff"],
  },

  // ── Retro ─────────────────────────────────────────────
  {
    id: "win95",
    name: "Win95",
    desc: "Retro classic",
    group: "Retro",
    preview: ["#008080", "#c0c0c0", "#000080", "#d4d0c8"],
  },
  {
    id: "synthwave",
    name: "Synthwave",
    desc: "80s neon grid",
    group: "Retro",
    preview: ["#0d001a", "#1a0030", "#ff00ff", "#00eeff"],
  },

  // ── Cosmic ────────────────────────────────────────────
  {
    id: "cosmos",
    name: "Cosmos",
    desc: "Deep space",
    group: "Cosmic",
    preview: ["#04010e", "#0d0520", "#c084fc", "#818cf8"],
  },
  {
    id: "arctic",
    name: "Arctic",
    desc: "Ice cold minimal",
    group: "Cosmic",
    preview: ["#020810", "#061525", "#5bc8ff", "#00d4ff"],
  },
  {
    id: "bloodmoon",
    name: "Bloodmoon",
    desc: "Dark crimson",
    group: "Cosmic",
    preview: ["#080000", "#150000", "#cc2200", "#ff4400"],
  },
]

export type ThemeId =
  | "native" | "sleek" | "noir"
  | "jarvis" | "matrix" | "cyberpunk" | "alien"
  | "win95" | "synthwave"
  | "cosmos" | "arctic" | "bloodmoon"

export const THEME_GROUPS = ["Dark", "Sci-Fi", "Retro", "Cosmic"]
