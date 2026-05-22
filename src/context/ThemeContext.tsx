"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeId, THEMES } from "@/lib/themes"

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "native",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("native")

  useEffect(() => {
    const saved = localStorage.getItem("native-os-theme") as ThemeId | null
    const valid = THEMES.map(t => t.id)
    if (saved && valid.includes(saved)) apply(saved)
  }, [])

  function apply(t: ThemeId) {
    setThemeState(t)
    document.documentElement.setAttribute("data-theme", t)
    localStorage.setItem("native-os-theme", t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: apply }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
