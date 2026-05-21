"use client"

import { useState } from "react"
import PageHeader from "@/components/PageHeader"
import { BRANDS } from "@/lib/brands"
import {
  Wand2, ShoppingBag, Image, Megaphone, Film, Loader2, Copy, Check, ChevronDown, ChevronUp
} from "lucide-react"

type FactoryTab = "merch" | "thumbnails" | "ads" | "vsl" | "video"

const TABS: { id: FactoryTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "merch",      label: "Merch Generator",     icon: <ShoppingBag size={14} />, desc: "Brief → image → copyright scan → Printful" },
  { id: "thumbnails", label: "Thumbnails",           icon: <Image size={14} />,       desc: "Topic → 3 A/B thumbnail variants" },
  { id: "ads",        label: "Ad Copy",              icon: <Megaphone size={14} />,   desc: "Offer → full Meta/TikTok ad set" },
  { id: "vsl",        label: "VSL Script",           icon: <Film size={14} />,        desc: "Offer → 3-4min video sales letter" },
  { id: "video",      label: "UGC Video",            icon: <Film size={14} />,        desc: "Hook → script → voiceover → Kling video" },
]

function BrandSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Brand</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-lg"
        style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
      >
        {BRANDS.map(b => <option key={b.id} value={b.name}>{b.name} — {b.genre}</option>)}
      </select>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, rows = 1 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>{label}</label>
      {rows > 1
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full text-sm px-3 py-2 rounded-lg resize-none"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full text-sm px-3 py-2 rounded-lg"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
      }
    </div>
  )
}

function OutputBlock({ output, loading, error }: { output: unknown; loading: boolean; error: string }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const text = typeof output === "string" ? output : JSON.stringify(output, null, 2)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center gap-2 p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
      <span className="text-sm" style={{ color: "var(--muted)" }}>Generating...</span>
    </div>
  )

  if (error) return (
    <div className="p-4 rounded-xl text-sm" style={{ background: "var(--accent-red)11", border: "1px solid var(--accent-red)44", color: "var(--accent-red)" }}>
      {error}
    </div>
  )

  if (!output) return null

  // Array output (thumbnails, ad variants)
  if (Array.isArray(output)) {
    return (
      <div className="space-y-3">
        {(output as Record<string, string>[]).map((item, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <button
              onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-all"
            >
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {(item.title as string) || (item.label as string) || `Variant ${i + 1}`}
              </span>
              {expanded[i] ? <ChevronUp size={14} style={{ color: "var(--muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted)" }} />}
            </button>
            {expanded[i] && (
              <div className="px-4 pb-4 space-y-2">
                {item.imageUrl && (
                  <img src={item.imageUrl as string} alt="Generated" className="w-full rounded-lg" />
                )}
                {Object.entries(item).filter(([k]) => !["imageUrl", "title", "label"].includes(k)).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{k}</p>
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>{String(v)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Object output (VSL, ad set)
  if (typeof output === "object" && output !== null) {
    const obj = output as Record<string, unknown>
    return (
      <div className="rounded-xl overflow-hidden relative" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded"
          style={{ background: "var(--surface)", color: copied ? "var(--accent-green)" : "var(--muted)" }}>
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
        </button>
        <div className="p-4 space-y-3">
          {Object.entries(obj).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{k.replace(/_/g, " ")}</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>
                {Array.isArray(v) ? v.map((item, i) => (
                  <span key={i} className="block mb-1">{typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}</span>
                )) : String(v)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl p-4 whitespace-pre-wrap text-sm" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
      <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded"
        style={{ background: "var(--surface)", color: copied ? "var(--accent-green)" : "var(--muted)" }}>
        {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
      </button>
      {text}
    </div>
  )
}

export default function FactoryPage() {
  const [tab, setTab] = useState<FactoryTab>("merch")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [output, setOutput] = useState<unknown>(null)

  // Merch
  const [merchBrand, setMerchBrand] = useState("M3K1")
  const [merchBrief, setMerchBrief] = useState("")

  // Thumbnails
  const [thumbBrand, setThumbBrand] = useState("Philosopher Stoned")
  const [thumbTitle, setThumbTitle] = useState("")
  const [thumbTopic, setThumbTopic] = useState("")

  // Ads
  const [adBrand, setAdBrand] = useState("M3K1")
  const [adOffer, setAdOffer] = useState("")
  const [adObjective, setAdObjective] = useState("conversion")

  // VSL
  const [vslBrand, setVslBrand] = useState("Fortis Mane")
  const [vslOffer, setVslOffer] = useState("")
  const [vslPain, setVslPain] = useState("")
  const [vslTransformation, setVslTransformation] = useState("")

  // Video
  const [videoBrand, setVideoBrand] = useState("M3K1")
  const [videoHook, setVideoHook] = useState("")
  const [videoOffer, setVideoOffer] = useState("")
  const [videoDuration, setVideoDuration] = useState<15 | 30 | 60>(30)

  async function run() {
    setLoading(true)
    setError("")
    setOutput(null)

    try {
      let res: Response
      if (tab === "merch") {
        res = await fetch("/api/factory/merch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_id: BRANDS.find(b => b.name === merchBrand)?.id ?? "m3k1",
            brief: merchBrief,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOutput({ status: "Job queued!", jobId: data.job?.id, message: "Pipeline running: prompt → image → scan → Printful. Check the Merch page for status." })
      } else if (tab === "thumbnails") {
        res = await fetch("/api/factory/thumbnails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: thumbBrand, videoTitle: thumbTitle, topic: thumbTopic }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOutput(data.variants)
      } else if (tab === "ads") {
        res = await fetch("/api/factory/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "adset", brand_id: adBrand, offer: adOffer, objective: adObjective }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOutput(data.output)
      } else if (tab === "vsl") {
        res = await fetch("/api/factory/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "vsl", brand_id: vslBrand, offer: vslOffer, pain: vslPain, transformation: vslTransformation }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOutput(data.output)
      } else {
        res = await fetch("/api/factory/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_id: BRANDS.find(b => b.name === videoBrand)?.id ?? "m3k1",
            job_type: "ugc",
            metadata: { hook: videoHook, offer: videoOffer, duration: videoDuration },
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOutput({ status: "Video job queued!", jobId: data.job?.id, message: "Script → voiceover → Kling video. Check back in a few minutes." })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setLoading(false)
    }
  }

  const activeBrand = BRANDS.find(b => b.name === [merchBrand, thumbBrand, adBrand, vslBrand, videoBrand][[
    "merch", "thumbnails", "ads", "vsl", "video"].indexOf(tab)])

  return (
    <div>
      <PageHeader
        title="Content Factory"
        subtitle="AI-powered merch, thumbnails, ad copy, VSLs, and UGC video"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setOutput(null); setError("") }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? (activeBrand?.color ?? "var(--accent-gold)") + "22" : "var(--surface)",
              color: tab === t.id ? (activeBrand?.color ?? "var(--accent-gold)") : "var(--muted)",
              border: `1px solid ${tab === t.id ? (activeBrand?.color ?? "var(--accent-gold)") + "66" : "var(--border)"}`,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {TABS.find(t => t.id === tab)?.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {TABS.find(t => t.id === tab)?.desc}
            </p>
          </div>

          {tab === "merch" && <>
            <BrandSelect value={merchBrand} onChange={setMerchBrand} />
            <TextInput label="Design Brief" value={merchBrief} onChange={setMerchBrief}
              placeholder="e.g. minimalist lion crown, gold on black, luxury streetwear vibe" rows={3} />
          </>}

          {tab === "thumbnails" && <>
            <BrandSelect value={thumbBrand} onChange={setThumbBrand} />
            <TextInput label="Video Title" value={thumbTitle} onChange={setThumbTitle}
              placeholder="e.g. Why Most People Never Find Their Purpose" />
            <TextInput label="Topic / Angle" value={thumbTopic} onChange={setThumbTopic}
              placeholder="e.g. philosophy of identity, self-discovery, surprising truth" rows={2} />
          </>}

          {tab === "ads" && <>
            <BrandSelect value={adBrand} onChange={setAdBrand} />
            <TextInput label="Offer" value={adOffer} onChange={setAdOffer}
              placeholder="e.g. M3K1 debut EP drop — stream now on Spotify" />
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Objective</label>
              <select value={adObjective} onChange={e => setAdObjective(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                <option value="awareness">Awareness</option>
                <option value="traffic">Traffic</option>
                <option value="conversion">Conversion</option>
              </select>
            </div>
          </>}

          {tab === "vsl" && <>
            <BrandSelect value={vslBrand} onChange={setVslBrand} />
            <TextInput label="Offer" value={vslOffer} onChange={setVslOffer}
              placeholder="e.g. Fortis Mane Elite Training Program" />
            <TextInput label="Core Pain Point" value={vslPain} onChange={setVslPain}
              placeholder="e.g. Working out for years with no real results" rows={2} />
            <TextInput label="Transformation" value={vslTransformation} onChange={setVslTransformation}
              placeholder="e.g. Build a body that commands attention in 90 days" rows={2} />
          </>}

          {tab === "video" && <>
            <BrandSelect value={videoBrand} onChange={setVideoBrand} />
            <TextInput label="Hook (first 3 seconds)" value={videoHook} onChange={setVideoHook}
              placeholder="e.g. Nobody talks about this in rap music..." />
            <TextInput label="Offer / Topic" value={videoOffer} onChange={setVideoOffer}
              placeholder="e.g. M3K1 new single Already Gone" />
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Duration</label>
              <div className="flex gap-2">
                {([15, 30, 60] as const).map(d => (
                  <button key={d} onClick={() => setVideoDuration(d)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: videoDuration === d ? "var(--accent-purple)33" : "var(--surface-2)",
                      color: videoDuration === d ? "#8b5cf6" : "var(--muted)",
                      border: `1px solid ${videoDuration === d ? "#8b5cf6" : "var(--border)"}`,
                    }}>
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </>}

          <button
            onClick={run}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: activeBrand?.color ?? "var(--accent-gold)", color: "#0a0a0f" }}
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Running...</>
              : <><Wand2 size={14} /> Generate</>
            }
          </button>
        </div>

        {/* Output panel */}
        <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Output</p>
          <OutputBlock output={output} loading={loading} error={error} />
          {!output && !loading && !error && (
            <div className="flex items-center justify-center h-40 text-xs rounded-xl"
              style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              Output appears here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
