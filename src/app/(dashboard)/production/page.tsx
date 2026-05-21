"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { ContentQueueItem } from "@/lib/supabase"
import { BRANDS } from "@/lib/brands"
import { Clock, CheckCircle2, AlertCircle, Plus, Play, Camera, Tv2, Music, Trash2, X, Loader2 } from "lucide-react"

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ready:        { label: "Ready",        color: "var(--accent-green)", icon: <CheckCircle2 size={12} /> },
  legal_review: { label: "Legal Review", color: "var(--accent-gold)",  icon: <AlertCircle size={12} /> },
  processing:   { label: "Processing",   color: "var(--accent-blue)",  icon: <Clock size={12} /> },
  draft:        { label: "Draft",        color: "var(--muted)",        icon: <Clock size={12} /> },
  posted:       { label: "Posted",       color: "var(--accent-green)", icon: <CheckCircle2 size={12} /> },
  failed:       { label: "Failed",       color: "var(--accent-red)",   icon: <AlertCircle size={12} /> },
}

const PlatformIcon = ({ p }: { p: string }) => {
  if (p === "youtube") return <Tv2 size={12} style={{ color: "var(--muted)" }} />
  if (p === "instagram") return <Camera size={12} style={{ color: "var(--muted)" }} />
  return <Music size={12} style={{ color: "var(--muted)" }} />
}

interface NewItemForm {
  brand_id: string
  title: string
  platform: string
  content_type: string
  due_at: string
  caption: string
}

const BLANK_FORM: NewItemForm = {
  brand_id: "m3k1", title: "", platform: "tiktok",
  content_type: "Reel", due_at: "", caption: "",
}

export default function ProductionPage() {
  const [items, setItems] = useState<ContentQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewItemForm>(BLANK_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/queue")
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function addItem() {
    if (!form.title) return
    setSaving(true)
    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status: "draft",
        due_at: form.due_at || null,
      }),
    })
    setForm(BLANK_FORM)
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: status as ContentQueueItem["status"] } : i))
  }

  async function deleteItem(id: string) {
    await fetch("/api/queue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const readyCount = items.filter(i => i.status === "ready").length
  const postedCount = items.filter(i => i.status === "posted").length

  const brandColor = (id: string) => BRANDS.find(b => b.id === id)?.color ?? "var(--muted)"

  return (
    <div>
      <PageHeader
        title="Production Floor"
        subtitle="Content queue — live from database"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
          >
            <Plus size={12} /> New Content
          </button>
        }
      />

      {/* New item form */}
      {showForm && (
        <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--accent-gold)44" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Content Item</p>
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
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Platform</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {["tiktok","instagram","youtube","spotify"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Hook challenge – Already Gone"
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Type</label>
              <select value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                {["Reel","Story","Post","Long-form","Vlog","Shorts"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Due Date</label>
              <input type="datetime-local" value={form.due_at} onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Caption (optional)</label>
              <textarea rows={2} value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Post caption..."
                className="w-full text-sm px-3 py-2 rounded-lg resize-none"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            </div>
          </div>
          <button onClick={addItem} disabled={saving || !form.title}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Add to Queue
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "In Queue",       value: items.length,  color: "var(--foreground)" },
          { label: "Ready to Post",  value: readyCount,    color: "var(--accent-green)" },
          { label: "In Review",      value: items.filter(i => i.status === "legal_review").length, color: "var(--accent-gold)" },
          { label: "Posted",         value: postedCount,   color: "var(--accent-blue)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-4 py-3 border-b grid grid-cols-12 text-xs font-medium uppercase tracking-wider"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          <span className="col-span-1">Brand</span>
          <span className="col-span-4">Content</span>
          <span className="col-span-2">Platform</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1">Actions</span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--muted)" }} />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
            No content in queue. Add your first item above.
          </div>
        )}

        {!loading && items.map(item => {
          const status = STATUS_META[item.status] ?? STATUS_META.draft
          const color = brandColor(item.brand_id)
          return (
            <div key={item.id}
              className="px-4 py-3 border-b grid grid-cols-12 items-center hover:bg-white/5 transition-all"
              style={{ borderColor: "var(--border)" }}>
              <div className="col-span-1">
                <div className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center"
                  style={{ background: color + "33", color }}>
                  {item.brand_id?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="col-span-4 pr-2">
                <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{item.title}</p>
                {item.due_at && (
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Due {new Date(item.due_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <PlatformIcon p={item.platform} />
                <span className="text-xs capitalize" style={{ color: "var(--muted)" }}>{item.platform}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                  {item.content_type}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-1" style={{ color: status.color }}>
                {status.icon}
                <select
                  value={item.status}
                  onChange={e => updateStatus(item.id, e.target.value)}
                  className="text-xs bg-transparent border-none outline-none cursor-pointer"
                  style={{ color: status.color }}>
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <option key={k} value={k} style={{ color: "var(--foreground)", background: "var(--surface)" }}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                {item.status === "ready" && (
                  <button onClick={() => updateStatus(item.id, "posted")}
                    className="w-5 h-5 rounded flex items-center justify-center hover:opacity-80"
                    style={{ background: "var(--accent-green)" }}>
                    <Play size={9} fill="white" style={{ color: "white" }} />
                  </button>
                )}
                <button onClick={() => deleteItem(item.id)} className="hover:opacity-80">
                  <Trash2 size={13} style={{ color: "var(--muted)" }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
