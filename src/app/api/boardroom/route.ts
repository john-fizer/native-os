import { NextResponse } from "next/server"
import { generateBoardroomReport } from "@/lib/claude"
import { BRANDS } from "@/lib/brands"

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 503 })
  }

  try {
    const report = await generateBoardroomReport({
      brands: BRANDS.map(b => ({ name: b.name, followers: b.followers as Record<string, number>, genre: b.genre })),
      weeklyPosts: 11,
      target: 21,
      revenue: 129,
      expenses: 42,
    })
    return NextResponse.json({ report })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Report generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
