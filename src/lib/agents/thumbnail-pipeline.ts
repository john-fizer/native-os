import Anthropic from "@anthropic-ai/sdk"
import { BRAND_VOICES } from "@/lib/claude"
import { generateThumbnailImage } from "@/lib/content-factory/thumbnails"
import { YouTubeResearchOutput } from "./youtube-research"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CTR_FORMULAS = [
  { name: "Curiosity Gap",    template: "Why [X] actually [surprising outcome]" },
  { name: "Shocking Stat",    template: "[Number]% of people [surprising fact]" },
  { name: "Face + Emotion",   template: "Reaction shot + bold 2-word hook on thumbnail" },
  { name: "Before/After",     template: "I [did X] for [duration]. Here's what happened." },
  { name: "Contrarian",       template: "Stop [conventional advice]. Do this instead." },
  { name: "List / Number",    template: "[Number] [things] that [outcome]" },
  { name: "How To",           template: "How to [achieve outcome] (even if [objection])" },
  { name: "Secret/Revealed",  template: "The [thing] nobody talks about in [niche]" },
]

export interface ThumbnailVariantSEO {
  title: string           // SEO-optimized video title
  hook: string            // 2-4 word overlay text
  imagePrompt: string     // Ideogram prompt
  formula: string         // CTR formula used
  seoKeyword: string      // primary keyword this targets
  imageUrl?: string       // generated image URL
}

export async function generateSEOThumbnails({
  brand,
  topic,
  research,
}: {
  brand: string
  topic: string
  research: YouTubeResearchOutput
}): Promise<ThumbnailVariantSEO[]> {
  const voice = BRAND_VOICES[brand as keyof typeof BRAND_VOICES]
  const topKeywords = research.keywords.slice(0, 3).map(k => k.keyword).join(", ")
  const topFormulas = CTR_FORMULAS.map(f => `${f.name}: "${f.template}"`).join("\n")

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: `You are a YouTube thumbnail and title specialist with deep knowledge of CTR optimization.
Brand: ${brand} (${voice?.genre}). Vibe: ${voice?.vibe}. Audience: ${voice?.audience}.
Use the research data to create data-driven thumbnail variants that will outperform the competition.`,
    messages: [{
      role: "user",
      content: `Create 3 YouTube thumbnail variants for this video based on real research data.

Topic: "${topic}"
Top SEO keywords from research: ${topKeywords}
Recommended angle: ${research.recommendedAngle}
Content gaps to exploit: ${research.contentGaps.slice(0, 2).join(", ")}

Top performing title patterns in this niche:
${research.titleFormulas.slice(0, 3).map(f => `- ${f.formula}: "${f.example}"`).join("\n")}

Competitor thumbnail patterns:
${research.thumbnailPatterns.slice(0, 3).map(p => `- ${p.pattern}: ${p.description}`).join("\n")}

Available CTR formulas:
${topFormulas}

For each variant, use a DIFFERENT CTR formula and target a DIFFERENT keyword. Return JSON array:
[{
  "title": "SEO-optimized video title (max 60 chars, use researched keyword naturally)",
  "hook": "2-4 word thumbnail overlay (punchy, creates curiosity)",
  "imagePrompt": "Detailed Ideogram prompt for 16:9 thumbnail (no text in image, cinematic)",
  "formula": "CTR formula name used",
  "seoKeyword": "primary keyword this variant targets"
}]

JSON only.`
    }]
  })

  const text = (response.content[0] as { text: string }).text
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("Failed to parse thumbnail variants")
  const variants: ThumbnailVariantSEO[] = JSON.parse(match[0])

  // Generate images if Ideogram is configured
  if (process.env.IDEOGRAM_API_KEY) {
    return Promise.all(
      variants.map(async v => {
        try {
          const imageUrl = await generateThumbnailImage(v.imagePrompt)
          return { ...v, imageUrl }
        } catch {
          return v
        }
      })
    )
  }

  return variants
}
