import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const agentType = searchParams.get("type")
  const status = searchParams.get("status")

  let query = supabaseAdmin
    .from("agent_runs")
    .select("id, agent_type, status, input, output, steps, tokens_used, duration_ms, error, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (agentType) query = query.eq("agent_type", agentType)
  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate stats
  const allRuns = data ?? []
  const stats = {
    total: allRuns.length,
    completed: allRuns.filter(r => r.status === "completed").length,
    failed: allRuns.filter(r => r.status === "failed").length,
    running: allRuns.filter(r => r.status === "running").length,
    avgDurationMs: allRuns.filter(r => r.duration_ms).reduce((a, r) => a + (r.duration_ms ?? 0), 0) / (allRuns.filter(r => r.duration_ms).length || 1),
    totalTokens: allRuns.reduce((a, r) => a + (r.tokens_used ?? 0), 0),
  }

  return NextResponse.json({ runs: allRuns, stats })
}
