export interface Theme {
  id: string
  name: string
  desc: string
  emoji: string
  colors: [string, string, string] // preview swatches
}

export const THEMES: Theme[] = [
  {
    id: "native",
    name: "Native OS",
    desc: "Default dark",
    emoji: "⬛",
    colors: ["#0a0a0f", "#c9a84c", "#10b981"],
  },
  {
    id: "sleek",
    name: "Sleek",
    desc: "OLED minimal",
    emoji: "◼",
    colors: ["#000000", "#3b82f6", "#ffffff"],
  },
  {
    id: "jarvis",
    name: "J.A.R.V.I.S",
    desc: "Iron Man HUD",
    emoji: "🔷",
    colors: ["#020b16", "#ff7300", "#00c8ff"],
  },
  {
    id: "matrix",
    name: "Matrix",
    desc: "Green terminal",
    emoji: "🟩",
    colors: ["#000000", "#00ff41", "#003300"],
  },
  {
    id: "win95",
    name: "Win95",
    desc: "Retro classic",
    emoji: "🪟",
    colors: ["#1a1a2e", "#0078d7", "#d4d0c8"],
  },
  {
    id: "cosmos",
    name: "Cosmos",
    desc: "Deep space",
    emoji: "🌌",
    colors: ["#04010e", "#c084fc", "#818cf8"],
  },
]

export type ThemeId = "native" | "sleek" | "jarvis" | "matrix" | "win95" | "cosmos"
