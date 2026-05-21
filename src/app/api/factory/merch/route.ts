import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { runMerchPipeline } from "@/lib/content-factory/merch"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("merch_design_jobs")
    .select("*, brands(name, color)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data })
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 })
  }

  const { brand_id, brief } = await req.json()
  if (!brand_id || !brief) {
    return NextResponse.json({ error: "brand_id and brief are required" }, { status: 400 })
  }

  // Create the job record
  const { data: job, error } = await supabaseAdmin
    .from("merch_design_jobs")
    .insert({ brand_id, brief, status: "queued" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Run pipeline async (fire and forget — client polls for status)
  runMerchPipeline(job.id).catch(console.error)

  return NextResponse.json({ job })
}
