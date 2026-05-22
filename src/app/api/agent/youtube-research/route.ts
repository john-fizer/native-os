import { NextRequest, NextResponse } from "next/server"
import { runYouTubeResearchAgent } from "@/lib/agents/youtube-research"
import { generateSEOThumbnails } from "@/lib/agents/thumbnail-pipeline"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 })
  }

  const { topic, brand, niche, videoTitle, generateThumbnails = false } = await req.json()

  if (!topic || !brand) {
    return NextResponse.json({ error: "topic and brand required" }, { status: 400 })
  }

  try {
    // Run YouTube research agent
    const researchResult = await runYouTubeResearchAgent({ topic, brand, niche: niche || brand, videoTitle })

    let thumbnails = null

    // Optionally run thumbnail pipeline with research output
    if (generateThumbnails && researchResult.research) {
      thumbnails = await generateSEOThumbnails({
        brand,
        topic,
        research: researchResult.research,
      })

      // Save thumbnails to generated_content
      await supabaseAdmin.from("generated_content").insert({
        brand_id: brand.toLowerCase().replace(/ /g, "_"),
        content_type: "thumbnail_seo",
        prompt: JSON.stringify({ topic, brand, researchRunId: researchResult.runId }),
        output: JSON.stringify(thumbnails),
      })
    }

    return NextResponse.json({
      runId: researchResult.runId,
      research: researchResult.research,
      thumbnails,
      steps: researchResult.steps.length,
      tokensUsed: researchResult.tokensUsed,
      durationMs: researchResult.durationMs,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Research failed" },
      { status: 500 }
    )
  }
}
