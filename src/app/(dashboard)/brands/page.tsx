"use client"

import { useEffect, useState, useCallback } from "react"
import PageHeader from "@/components/PageHeader"
import { BRANDS } from "@/lib/brands"
import { Globe, ShoppingBag, Music, Tv2, Camera, ExternalLink, Edit2, Check, X, Loader2 } from "lucide-react"

interface BrandLinks {
  brand_id: string
  website?: string
  etsy_url?: string
  shopify_url?: string
  spotify_url?: string
  apple_music_url?: string
  youtube_url?: string
  tiktok_url?: string
  instagram_url?: string
  soundcloud_url?: string
  linktree_url?: string
}

const LINK_FIELDS: { key: keyof Omit<BrandLinks, "brand_id">; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { key: "website",        label: "Website",       icon: <Globe size={12} />,     placeholder: "https://fortismane.com" },
  { key: "shopify_url",    label: "Shopify",        icon: <ShoppingBag size={12} />, placeholder: "https://store.example.com" },
  { key: "etsy_url",       label: "Etsy",           icon: <ShoppingBag size={12} />, placeholder: "https://etsy.com/shop/..." },
  { key: "spotify_url",    label: "Spotify",        icon: <Music size={12} />,     placeholder: "https://open.spotify.com/artist/..." },
  { key: "apple_music_url",label: "Apple Music",    icon: <Music size={12} />,     placeholder: "https://music.apple.com/artist/..." },
  { key: "youtube_url",    label: "YouTube",        icon: <Tv2 size={12} />,       placeholder: "https://youtube.com/@..." },
  { key: "tiktok_url",     label: "TikTok",         icon: <Camera size={12} />,    placeholder: "https://tiktok.com/@..." },
  { key: "instagram_url",  label: "Instagram",      icon: <Camera size={12} />,    placeholder: "https://instagram.com/..." },
  { key: "soundcloud_url", label: "SoundCloud",     icon: <Music size={12} />,     placeholder: "https://soundcloud.com/..." },
  { key: "linktree_url",   label: "Linktree",       icon: <Globe size={12} />,     placeholder: "https://linktr.ee/..." },
]

function countLinks(links: BrandLinks) {
  return LINK_FIELDS.filter(f => links[f.key]).length
}

export default function BrandsPage() {
  const [allLinks, setAllLinks] = useState<Record<string, BrandLinks>>({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<BrandLinks>({ brand_id: "" })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/brands")
      const data = await res.json()
      const map: Record<string, BrandLinks> = {}
      for (const row of data.links ?? []) map[row.brand_id] = row
      setAllLinks(map)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(brandId: string) {
    setDraft({ ...(allLinks[brandId] ?? {}), brand_id: brandId })
    setEditing(brandId)
  }

  async function save() {
    setSaving(true)
    await fetch("/api/brands", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    setSaving(false)
    setEditing(null)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Brand Profiles"
        subtitle="Websites · storefronts · streaming · social links"
      />

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--muted)" }} />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {BRANDS.map(brand => {
            const links = allLinks[brand.id] ?? { brand_id: brand.id }
            const isEditing = editing === brand.id
            const linkCount = countLinks(links)

            return (
              <div key={brand.id} className="rounded-xl overflow-hidden"
                style={{ background: "var(--surface)", border: `1px solid ${brand.color}44` }}>

                {/* Brand header */}
                <div className="px-5 py-4 flex items-center gap-3"
                  style={{ background: brand.color + "11", borderBottom: `1px solid ${brand.color}33` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: brand.color + "33", color: brand.color }}>
                    {brand.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: brand.color }}>{brand.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{brand.fullName} · {brand.genre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                      {linkCount} link{linkCount !== 1 ? "s" : ""}
                    </span>
                    {!isEditing && (
                      <button onClick={() => startEdit(brand.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                        style={{ background: "var(--surface-2)" }}>
                        <Edit2 size={12} style={{ color: "var(--muted)" }} />
                      </button>
                    )}
                    {isEditing && (
                      <div className="flex gap-1">
                        <button onClick={save} disabled={saving}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                          style={{ background: brand.color }}>
                          {saving ? <Loader2 size={11} className="animate-spin" color="#000" /> : <Check size={11} color="#000" />}
                        </button>
                        <button onClick={() => setEditing(null)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                          style={{ background: "var(--surface-2)" }}>
                          <X size={11} style={{ color: "var(--muted)" }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="p-4 space-y-2">
                  {LINK_FIELDS.map(field => {
                    const value = isEditing ? (draft[field.key] ?? "") : (links[field.key] ?? "")
                    if (!isEditing && !value) return null

                    return (
                      <div key={field.key} className="flex items-center gap-2">
                        <span className="flex-shrink-0 w-5" style={{ color: "var(--muted)" }}>{field.icon}</span>
                        <span className="text-xs w-20 flex-shrink-0" style={{ color: "var(--muted)" }}>{field.label}</span>
                        {isEditing ? (
                          <input
                            type="url"
                            value={value}
                            onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="flex-1 text-xs px-2 py-1.5 rounded-lg"
                            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                          />
                        ) : (
                          <a href={value} target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-xs truncate flex items-center gap-1 hover:opacity-80 transition-all"
                            style={{ color: brand.color }}>
                            <span className="truncate">{value.replace(/^https?:\/\//, "")}</span>
                            <ExternalLink size={10} className="flex-shrink-0" />
                          </a>
                        )}
                      </div>
                    )
                  })}

                  {!isEditing && linkCount === 0 && (
                    <button onClick={() => startEdit(brand.id)}
                      className="w-full text-xs py-3 rounded-lg transition-all hover:opacity-80 text-center"
                      style={{ background: "var(--surface-2)", color: "var(--muted)", border: `1px dashed ${brand.color}44` }}>
                      + Add links for {brand.name}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
