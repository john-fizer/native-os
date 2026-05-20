"use client"

import PageHeader from "@/components/PageHeader"
import { Plus, Package, TrendingUp, ShoppingCart } from "lucide-react"

const PRODUCTS = [
  { id: 1, name: "M3K1 Logo Tee", brand: "M3K1", color: "#8b5cf6", status: "live", sales: 12, revenue: 156, image: "👕" },
  { id: 2, name: "Fortis Mane Hoodie – Black", brand: "Fortis Mane", color: "#10b981", status: "live", sales: 7, revenue: 245, image: "🧥" },
  { id: 3, name: "XRXS 'Refiner' Lyric Tee", brand: "XRXS", color: "#c9a84c", status: "review", sales: 0, revenue: 0, image: "👕" },
  { id: 4, name: "Fortis Mane Water Bottle", brand: "Fortis Mane", color: "#10b981", status: "live", sales: 3, revenue: 89, image: "🍶" },
  { id: 5, name: "Philosopher Stoned Mug", brand: "Philosopher Stoned", color: "#4c7fc9", status: "draft", sales: 0, revenue: 0, image: "☕" },
]

const IDEAS = [
  { prompt: "XRXS minimalist cross crown hoodie, gold on black", brand: "XRXS", color: "#c9a84c" },
  { prompt: "M3K1 graffiti logo all-over print shorts", brand: "M3K1", color: "#8b5cf6" },
  { prompt: "Fortis Mane lion silhouette compression shirt", brand: "Fortis Mane", color: "#10b981" },
]

const STATUS_COLORS: Record<string, string> = {
  live: "var(--accent-green)",
  review: "var(--accent-gold)",
  draft: "var(--muted)",
}

export default function MerchPage() {
  const totalRevenue = PRODUCTS.reduce((a, p) => a + p.revenue, 0)
  const totalSales = PRODUCTS.reduce((a, p) => a + p.sales, 0)

  return (
    <div>
      <PageHeader
        title="Merch Engine"
        subtitle="Print-on-demand automation — design, scan, list, fulfill"
        actions={
          <button
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            <Plus size={12} /> Generate Design
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>${totalRevenue}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Total merch revenue</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{totalSales}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Items sold</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>3</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Live products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Product list */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Products</p>
          </div>
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="px-4 py-3 border-b hover:bg-white/5 transition-all flex items-center gap-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "var(--surface-2)" }}
              >
                {p.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{p.brand}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>${p.revenue}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{p.sales} sold</p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full ml-2 capitalize"
                style={{ background: STATUS_COLORS[p.status] + "22", color: STATUS_COLORS[p.status] }}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>

        {/* AI Design Ideas */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>AI Design Queue</p>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Pending generation → legal scan → upload</p>
          <div className="space-y-3">
            {IDEAS.map((idea, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{ background: "var(--surface-2)", border: `1px solid ${idea.color}33` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded text-xs flex items-center justify-center font-bold"
                    style={{ background: idea.color + "33", color: idea.color }}
                  >
                    {idea.brand[0]}
                  </div>
                  <span className="text-xs font-medium" style={{ color: idea.color }}>{idea.brand}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{idea.prompt}</p>
                <button
                  className="mt-2 text-xs px-2 py-1 rounded font-medium w-full transition-all hover:opacity-80"
                  style={{ background: idea.color + "22", color: idea.color }}
                >
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
