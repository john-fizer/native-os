import { NextRequest, NextResponse } from "next/server"
import { generateBrief } from "@/lib/claude"

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured. Add it to .env.local." }, { status: 503 })
  }

  try {
    const { brand, type, context } = await req.json()

    if (!brand || !type) {
      return NextResponse.json({ error: "brand and type are required" }, { status: 400 })
    }

    const output = await generateBrief({ brand, type, context })
    return NextResponse.json({ output })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
