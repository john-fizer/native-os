"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Music2,
  Clapperboard,
  ShoppingBag,
  Scale,
  Megaphone,
  DollarSign,
  Users,
  Settings,
  Zap,
  Factory,
  ChevronRight,
} from "lucide-react"

const NAV = [
  { label: "Lobby", href: "/lobby", icon: LayoutDashboard, desc: "Overview" },
  { label: "Studio", href: "/studio", icon: Music2, desc: "Creative" },
  { label: "Factory", href: "/factory", icon: Factory, desc: "Content Engine" },
  { label: "Production", href: "/production", icon: Clapperboard, desc: "Content Queue" },
  { label: "Merch", href: "/merch", icon: ShoppingBag, desc: "POD Engine" },
  { label: "Legal", href: "/legal", icon: Scale, desc: "IP & Copyright" },
  { label: "Marketing", href: "/marketing", icon: Megaphone, desc: "Strategy & Ads" },
  { label: "Finance", href: "/finance", icon: DollarSign, desc: "Revenue & P&L" },
  { label: "Boardroom", href: "/boardroom", icon: Users, desc: "Reports" },
  { label: "Automation", href: "/automation", icon: Zap, desc: "Pipelines" },
  { label: "Settings", href: "/settings", icon: Settings, desc: "Config" },
]

// active check covers both "/" and "/lobby"


export default function Sidebar() {
  const path = usePathname()

  return (
    <aside
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
      className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            N
          </div>
          <div>
            <p className="text-sm font-bold tracking-wider" style={{ color: "var(--foreground)" }}>
              NATIVE OS
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Creative HQ</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item) => {
          const active = path === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 group transition-all",
                active
                  ? "text-white"
                  : "hover:bg-white/5"
              )}
              style={active ? { background: "var(--accent-gold)22", color: "var(--accent-gold)" } : { color: "var(--muted)" }}
            >
              <Icon size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-xs mt-0.5 opacity-70 truncate">{item.desc}</p>
              </div>
              {active && <ChevronRight size={12} style={{ color: "var(--accent-gold)" }} />}
            </Link>
          )
        })}
      </nav>

      {/* Brand selector */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs px-2 mb-2" style={{ color: "var(--muted)" }}>ACTIVE BRAND</p>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
          style={{ background: "var(--surface-2)" }}
        >
          <div
            className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
            style={{ background: "#8b5cf6", color: "white" }}
          >
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>M3K1</p>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>Pop Rap</p>
          </div>
          <ChevronRight size={12} style={{ color: "var(--muted)" }} />
        </div>
      </div>
    </aside>
  )
}
