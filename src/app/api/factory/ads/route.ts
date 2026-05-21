import { NextRequest, NextResponse } from "next/server"
import { generateAdSet, generateVSL } from "@/lib/content-factory/ads"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 })
  }

  const { type, brand_id, ...brief } = await req.json()

  try {
    let output: unknown
    let contentType: string

    if (type === "vsl") {
      output = await generateVSL({ brand: brand_id, ...brief })
      contentType = "vsl"
    } else {
      output = await generateAdSet({ brand: brand_id, ...brief })
      contentType = "ad_copy"
    }

    await supabaseAdmin.from("generated_content").insert({
      brand_id: brand_id?.toLowerCase(),
      content_type: contentType,
      prompt: JSON.stringify(brief),
      output: JSON.stringify(output),
    })

    return NextResponse.json({ output })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    )
  }
}
