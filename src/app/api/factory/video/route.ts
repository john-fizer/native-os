import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { runVideoPipeline } from "@/lib/content-factory/video"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("video_jobs")
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

  const { brand_id, job_type, script, metadata } = await req.json()

  const { data: job, error } = await supabaseAdmin
    .from("video_jobs")
    .insert({ brand_id, job_type: job_type ?? "ugc", script, metadata: metadata ?? {}, status: "queued" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  runVideoPipeline(job.id).catch(console.error)

  return NextResponse.json({ job })
}
