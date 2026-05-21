"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { MerchProduct } from "@/lib/supabase"
import { BRANDS } from "@/lib/brands"
import { Plus, Trash2, Loader2, Wand2, X, RefreshCw } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  live:     "var(--accent-green)",
  review:   "var(--accent-gold)",
  draft:    "var(--muted)",
  archived: "var(--muted)",
}

const BLANK_PRODUCT = {
  brand_id: "m3k1",
  name: "",
  status: "draft" as MerchProduct["status"],
  sale_price: "",
  design_prompt: "",
}

const BLANK_JOB = { brand_id: "m3k1", brief: "" }

export default function MerchPage() {
  const [products, setProducts] = useState<MerchProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState(BLANK_PRODUCT)
  const [jobForm, setJobForm] = useState(BLANK_JOB)
  const [jobStatus, setJobStatus] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/merch")
      const data = await res.json()
      setProducts(data.products ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function addProduct() {
    if (!form.name) return
    setSaving(true)
    await fetch("/api/merch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      }),
    })
    setForm(BLANK_PRODUCT)
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteProduct(id: string) {
    await fetch("/api/merch", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/merch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: status as MerchProduct["status"] } : p))
  }

  async function generateDesign() {
    if (!jobForm.brief) return
    setGenerating(true)
    setJobStatus("Queuing design job...")
    try {
      const res = await fetch("/api/factory/merch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setJobStatus(`Job started — ID: ${data.job?.id ?? "unknown"}. Design will appear in Products once complete.`)
      setJobForm(BLANK_JOB)
      setTimeout(() => {
        setJobStatus("")
        setShowGenerate(false)
        load()
      }, 4000)
    } catch (err) {
      setJobStatus(err instanceof Error ? err.message : "Failed to start job")
    } finally {
      setGenerating(false)
    }
  }

  const totalRevenue = products.reduce((a, p) => a + (p.revenue ?? 0), 0)
  const totalSales = products.reduce((a, p) => a + (p.units_sold ?? 0), 0)
  const liveCount = products.filter(p => p.status === "live").length

  return (
    <div>
      <PageHeader
        title="Merch Engine"
        subtitle="Print-on-demand automation — design, scan, list, fulfill"
        actions={
          <div className="flex gap-2">
            <button onClick={load}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={() => setShowGenerate(v => !v)}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
              <Wand2 size={12} /> Generate Design
            </button>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              <Plus size={12} /> Add Product
            </button>
          </div>
        }
      />

      {/* AI Generate Design */}
      {showGenerate && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Design Generator</p>
            <button onClick={() => setShowGenerate(false)}><X size={14} style={{ color: "var(--muted)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select value={jobForm.brand_id} onChange={e => setJobForm(f => ({ ...f, brand_id: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Design Brief</label>
              <textarea rows={2} value={jobForm.brief} onChange={e => setJobForm(f => ({ ...f, brief: e.target.value }))}
                placeholder="e.g. XRXS minimalist cross crown hoodie, gold on black, streetwear aesthetic"
                className="w-full text-sm px-3 py-2 rounded-lg resize-none"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          {jobStatus && (
            <div className="text-xs p-3 rounded-lg mb-3"
              style={{ background: "var(--accent-gold)11", border: "1px solid var(--accent-gold)44", color: "var(--accent-gold)" }}>
              {jobStatus}
            </div>
          )}
          <button onClick={generateDesign} disabled={generating || !jobForm.brief}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Generate & Queue
          </button>
        </div>
      )}

      {/* Manual add form */}
      {showForm && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Add Product</p>
            <button onClick={() => setShowForm(false)}><X size={14} style={{ color: "var(--muted)" }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
              <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MerchProduct["status"] }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {["draft", "review", "live", "archived"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Product Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. M3K1 Logo Tee"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Sale Price ($)</label>
              <input type="number" min="0" step="0.01" value={form.sale_price}
                onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))}
                placeholder="29.99"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          <button onClick={addProduct} disabled={saving || !form.name}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Save Product
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-green)" }}>${totalRevenue.toFixed(2)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Total merch revenue</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{totalSales}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Items sold</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>{liveCount}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Live products</p>
        </div>
      </div>

      {/* Product list */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Products</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--muted)" }} />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
            No products yet. Generate a design or add one manually.
          </div>
        )}

        {!loading && products.map(p => {
          const brandColor = BRANDS.find(b => b.id === p.brand_id)?.color ?? "var(--muted)"
          const statusColor = STATUS_COLORS[p.status] ?? "var(--muted)"
          return (
            <div key={p.id} className="px-4 py-3 border-b hover:bg-white/5 transition-all flex items-center gap-3"
              style={{ borderColor: "var(--border)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: brandColor + "33", color: brandColor }}>
                {(BRANDS.find(b => b.id === p.brand_id)?.name ?? p.brand_id)[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {BRANDS.find(b => b.id === p.brand_id)?.name ?? p.brand_id}
                  {p.sale_price ? ` · $${p.sale_price}` : ""}
                </p>
              </div>
              <div className="text-right mr-2">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>${(p.revenue ?? 0).toFixed(2)}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{p.units_sold ?? 0} sold</p>
              </div>
              <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                className="text-xs px-2 py-1 rounded-full capitalize cursor-pointer border-none outline-none"
                style={{ background: statusColor + "22", color: statusColor }}>
                {["draft", "review", "live", "archived"].map(s => (
                  <option key={s} value={s} style={{ background: "var(--surface)", color: "var(--foreground)" }}>{s}</option>
                ))}
              </select>
              <button onClick={() => deleteProduct(p.id)} className="hover:opacity-80 flex-shrink-0">
                <Trash2 size={13} style={{ color: "var(--muted)" }} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
