"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { FinanceEntry } from "@/lib/supabase"
import { BRANDS } from "@/lib/brands"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, Trash2, Loader2, X } from "lucide-react"

const TOOLTIP_STYLE = {
  contentStyle: { background: "#12121a", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#6b7280" },
}

const CATEGORIES = ["streams", "merch", "youtube", "platform", "automation", "ai", "ads", "other"]

const BLANK_FORM = {
  brand_id: "m3k1",
  type: "income" as "income" | "expense",
  category: "merch",
  description: "",
  amount: "",
  entry_date: new Date().toISOString().split("T")[0],
}

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/finance?month=2026-05")
      const data = await res.json()
      setEntries(data.entries ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function addEntry() {
    if (!form.description || !form.amount) return
    setSaving(true)
    const amount = parseFloat(form.amount) * (form.type === "expense" ? -1 : 1)
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount }),
    })
    setForm(BLANK_FORM)
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteEntry(id: string) {
    await fetch("/api/finance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const income = entries.filter(e => e.amount > 0).reduce((a, e) => a + e.amount, 0)
  const expenses = entries.filter(e => e.amount < 0).reduce((a, e) => a + Math.abs(e.amount), 0)

  // Build monthly chart data from entries
  const monthlyMap: Record<string, { income: number; expenses: number }> = {}
  entries.forEach(e => {
    const month = e.entry_date.slice(0, 7)
    if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 }
    if (e.amount > 0) monthlyMap[month].income += e.amount
    else monthlyMap[month].expenses += Math.abs(e.amount)
  })
  const chartData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month: month.slice(5), ...v, net: v.income - v.expenses }))

  return (
    <div>
      <PageHeader
        title="Finance"
        subtitle="Revenue · expenses · P&L across all brands"
        actions={
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            <Plus size={12} /> Add Entry
          </button>
        }
      />

      {showForm && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Entry</p>
            <button onClick={() => setShowForm(false)}><X size={14} style={{ color: "var(--muted)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Type</label>
              <div className="flex gap-2">
                {(["income", "expense"] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      background: form.type === t ? (t === "income" ? "var(--accent-green)" : "var(--accent-red)") + "33" : "var(--surface-2)",
                      color: form.type === t ? (t === "income" ? "var(--accent-green)" : "var(--accent-red)") : "var(--muted)",
                      border: `1px solid ${form.type === t ? (t === "income" ? "var(--accent-green)" : "var(--accent-red)") : "var(--border)"}`,
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Amount ($)</label>
              <input type="number" min="0" step="0.01" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Spotify royalties – May"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Date</label>
              <input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          <button onClick={addEntry} disabled={saving || !form.description || !form.amount}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Save Entry
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Income</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>${income.toFixed(2)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Expenses</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-red)" }}>${expenses.toFixed(2)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: `1px solid ${income - expenses >= 0 ? "var(--accent-green)" : "var(--accent-red)"}44` }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Net</p>
          <p className="text-2xl font-bold" style={{ color: income - expenses >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
            ${(income - expenses).toFixed(2)}
          </p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>P&L — Live from Database</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
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
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `$${v}`} />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Entries</p>
        </div>
        {loading && <div className="flex justify-center py-12"><Loader2 size={16} className="animate-spin" style={{ color: "var(--muted)" }} /></div>}
        {!loading && entries.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
            No entries yet. Add your first income or expense.
          </div>
        )}
        {!loading && entries.map(entry => (
          <div key={entry.id} className="px-4 py-3 border-b flex items-center gap-3 hover:bg-white/5 transition-all"
            style={{ borderColor: "var(--border)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{entry.description}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{entry.category} · {entry.entry_date}</p>
            </div>
            <p className="text-sm font-semibold flex-shrink-0"
              style={{ color: entry.amount > 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
              {entry.amount > 0 ? "+" : ""}${Math.abs(entry.amount).toFixed(2)}
            </p>
            <button onClick={() => deleteEntry(entry.id)} className="hover:opacity-80 flex-shrink-0">
              <Trash2 size={13} style={{ color: "var(--muted)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
