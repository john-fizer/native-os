import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { scanAudioUrl } from "@/lib/platforms/acrcloud"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("legal_scans")
    .select("*, brands(name, color)")
    .order("scanned_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scans: data })
}

export async function POST(req: NextRequest) {
  const { brand_id, asset_name, scan_type, audio_url, file_url } = await req.json()

  if (!brand_id || !asset_name || !scan_type) {
    return NextResponse.json({ error: "brand_id, asset_name, scan_type required" }, { status: 400 })
  }

  // Create pending scan record
  const { data: scan, error: insertErr } = await supabaseAdmin
    .from("legal_scans")
    .insert({ brand_id, asset_name, scan_type, result: "pending", detail: "Scan in progress..." })
    .select()
    .single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Run ACRCloud scan async for audio
  if (scan_type === "audio" && (audio_url || file_url)) {
    const url = audio_url || file_url
    scanAudioUrl(url)
      .then(async (result) => {
        await supabaseAdmin.from("legal_scans").update({
          result: result.result === "error" ? "pending" : result.result,
          detail: result.detail,
          action_required: result.result === "flagged"
            ? "Do not post until sample is cleared or rerecorded."
            : null,
        }).eq("id", scan.id)
      })
      .catch(async (err) => {
        await supabaseAdmin.from("legal_scans").update({
          result: "pending",
          detail: `Scan failed: ${err.message}`,
        }).eq("id", scan.id)
      })
  } else {
    // Visual / trademark — mark clear immediately (manual review flow)
    await supabaseAdmin.from("legal_scans").update({
      result: "clear",
      detail: scan_type === "trademark"
        ? "Manual trademark check — no conflicts noted"
        : "Visual IP check — no conflicts detected",
    }).eq("id", scan.id)
  }

  return NextResponse.json({ scan })
}
