"use client"

import PageHeader from "@/components/PageHeader"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const monthly = [
  { month: "Jan", income: 12, expenses: 0, net: 12 },
  { month: "Feb", income: 18, expenses: 20, net: -2 },
  { month: "Mar", income: 71, expenses: 35, net: 36 },
  { month: "Apr", income: 160, expenses: 60, net: 100 },
  { month: "May", income: 129, expenses: 42, net: 87 },
]

const EXPENSES = [
  { item: "Printful base cost", category: "Merch", amount: 24, month: "May" },
  { item: "Shopify subscription", category: "Platform", amount: 9, month: "May" },
  { item: "n8n (self-hosted VPS)", category: "Automation", amount: 6, month: "May" },
  { item: "Midjourney subscription", category: "AI", amount: 3, month: "May" },
]

const INCOME = [
  { source: "Spotify royalties – M3K1", amount: 18, category: "Streams" },
  { source: "Spotify royalties – XRXS", amount: 10, category: "Streams" },
  { source: "Merch – Fortis Hoodie", amount: 87, category: "Merch" },
  { source: "YouTube AdSense", amount: 14, category: "YouTube" },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: "#12121a", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#6b7280" },
}

export default function FinancePage() {
  const totalIncome = INCOME.reduce((a, i) => a + i.amount, 0)
  const totalExpenses = EXPENSES.reduce((a, e) => a + e.amount, 0)

  return (
    <div>
      <PageHeader title="Finance" subtitle="Revenue · expenses · P&L across all brands" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>May Income</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>${totalIncome}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>May Expenses</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-red)" }}>${totalExpenses}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: `1px solid ${totalIncome - totalExpenses > 0 ? "var(--accent-green)" : "var(--accent-red)"}44` }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Net Profit</p>
          <p className="text-2xl font-bold" style={{ color: totalIncome - totalExpenses > 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
            ${totalIncome - totalExpenses}
          </p>
        </div>
      </div>

      {/* P&L Chart */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>P&L Overview</p>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Income · Expenses · Net — last 5 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `$${v}`} />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Income breakdown */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--accent-green)" }}>Income — May</p>
          </div>
          {INCOME.map((item, i) => (
            <div key={i} className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{item.source}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{item.category}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--accent-green)" }}>+${item.amount}</p>
            </div>
          ))}
        </div>

        {/* Expense breakdown */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--accent-red)" }}>Expenses — May</p>
          </div>
          {EXPENSES.map((item, i) => (
            <div key={i} className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{item.item}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{item.category}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--accent-red)" }}>-${item.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
