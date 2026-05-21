import { NextRequest, NextResponse } from "next/server"
import { generateThumbnailVariants, generateThumbnailImage } from "@/lib/content-factory/thumbnails"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 })
  }

  const brief = await req.json()

  try {
    const variants = await generateThumbnailVariants(brief)

    // Generate images if Ideogram is configured
    if (process.env.IDEOGRAM_API_KEY) {
      const withImages = await Promise.all(
        variants.map(async (v) => {
          try {
            const imageUrl = await generateThumbnailImage(v.imagePrompt)
            return { ...v, imageUrl }
          } catch {
            return { ...v, imageUrl: null }
          }
        })
      )

      // Save to generated_content
      await supabaseAdmin.from("generated_content").insert({
        brand_id: brief.brand?.toLowerCase().replace(/ /g, "_") ?? brief.brand,
        content_type: "thumbnail",
        prompt: JSON.stringify(brief),
        output: JSON.stringify(withImages),
      })

      return NextResponse.json({ variants: withImages })
    }

    return NextResponse.json({ variants })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    )
  }
}
