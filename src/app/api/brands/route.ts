import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("brand_links")
    .select("*")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ links: data ?? [] })
}

export async function PUT(req: NextRequest) {
  const { brand_id, ...fields } = await req.json()
  if (!brand_id) return NextResponse.json({ error: "brand_id required" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("brand_links")
    .upsert({ brand_id, ...fields, updated_at: new Date().toISOString() }, { onConflict: "brand_id" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ links: data })
}
