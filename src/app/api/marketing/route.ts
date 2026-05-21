import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { generateMarketingBrief } from "@/lib/claude"
import { BRANDS } from "@/lib/brands"

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 503 })
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch data in parallel
  const [financeRes, queueRes, snapshotRes] = await Promise.all([
    supabaseAdmin
      .from("finance_entries")
      .select("amount, category")
      .gte("entry_date", monthStart),
    supabaseAdmin
      .from("content_queue")
      .select("brand_id, platform, status, created_at"),
    supabaseAdmin
      .from("platform_snapshots")
      .select("brand_id, platform, followers, engagement_rate, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
  ])

  // Finance rollup
  const entries = financeRes.data ?? []
  const income = entries.filter(e => e.amount > 0).reduce((a, e) => a + e.amount, 0)
  const expenses = entries.filter(e => e.amount < 0).reduce((a, e) => a + Math.abs(e.amount), 0)

  const categoryTotals: Record<string, number> = {}
  entries.filter(e => e.amount > 0).forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount
  })
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat)

  // Queue stats
  const allItems = queueRes.data ?? []
  const recentItems = allItems.filter(i => i.created_at >= weekAgo)
  const queueStats = {
    total: allItems.length,
    posted: allItems.filter(i => i.status === "posted").length,
    ready: allItems.filter(i => i.status === "ready").length,
    draft: allItems.filter(i => i.status === "draft").length,
  }

  // Platform stats per brand — use snapshots if available, else fallback to BRANDS data
  const snapshots = snapshotRes.data ?? []
  const latestSnaps: Record<string, Record<string, { followers: number; engagement_rate: number | null }>> = {}
  snapshots.forEach(s => {
    if (!latestSnaps[s.brand_id]) latestSnaps[s.brand_id] = {}
    if (!latestSnaps[s.brand_id][s.platform]) {
      latestSnaps[s.brand_id][s.platform] = { followers: s.followers, engagement_rate: s.engagement_rate }
    }
  })

  const brandData = BRANDS.map(b => {
    const platformEntries = latestSnaps[b.id]
      ? Object.entries(latestSnaps[b.id]).map(([platform, stats]) => ({
          platform,
          followers: stats.followers,
          engagement: stats.engagement_rate ? `${stats.engagement_rate}%` : undefined,
          postsThisWeek: recentItems.filter(i => i.brand_id === b.id && i.platform === platform).length,
        }))
      : Object.entries(b.followers as Record<string, number>).map(([platform, followers]) => ({
          platform,
          followers,
          postsThisWeek: recentItems.filter(i => i.brand_id === b.id && i.platform === platform).length,
        }))

    return { name: b.name, platformStats: platformEntries }
  })

  try {
    const brief = await generateMarketingBrief({
      date: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      brands: brandData,
      queueStats,
      financeThisMonth: { income, expenses },
      topCategories,
    })

    return NextResponse.json({ brief, queueStats, financeThisMonth: { income, expenses } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Brief generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
