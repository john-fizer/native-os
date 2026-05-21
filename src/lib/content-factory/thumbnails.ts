import Anthropic from "@anthropic-ai/sdk"
import { BRAND_VOICES } from "@/lib/claude"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ThumbnailBrief {
  brand: string
  videoTitle: string
  topic: string
  emotion?: string  // e.g. "shocked", "curious", "excited"
}

export interface ThumbnailVariant {
  title: string
  imagePrompt: string
  hook: string  // text overlay
  style: string
}

export async function generateThumbnailVariants(brief: ThumbnailBrief): Promise<ThumbnailVariant[]> {
  const voice = BRAND_VOICES[brief.brand as keyof typeof BRAND_VOICES]

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `You are a YouTube thumbnail strategist for ${brief.brand} (${voice?.genre}).
Brand vibe: ${voice?.vibe}.
Target audience: ${voice?.audience}.

Video topic: "${brief.topic}"
Video title: "${brief.videoTitle}"
${brief.emotion ? `Desired emotion: ${brief.emotion}` : ""}

Generate 3 YouTube thumbnail variants. For each return JSON with:
- title: the A/B test title (max 60 chars, high CTR)
- imagePrompt: Ideogram prompt for the thumbnail image (1280x720, cinematic, no text in image)
- hook: 2-4 word text overlay that goes on the thumbnail
- style: visual style description

Return a JSON array only, no explanation.`
    }]
  })

  const text = (response.content[0] as { text: string }).text
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("Failed to parse thumbnail variants")
  return JSON.parse(match[0])
}

export async function generateThumbnailImage(prompt: string): Promise<string> {
  const apiKey = process.env.IDEOGRAM_API_KEY
  if (!apiKey) throw new Error("IDEOGRAM_API_KEY not set")

  const res = await fetch("https://api.ideogram.ai/generate", {
    method: "POST",
    headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      image_request: {
        prompt: `${prompt}, YouTube thumbnail style, high contrast, cinematic lighting, no text`,
        model: "V_2",
        magic_prompt_option: "OFF",
        aspect_ratio: "ASPECT_16_9",
        style_type: "REALISTIC",
      }
    })
  })

  if (!res.ok) throw new Error(`Ideogram error: ${res.status}`)
  const data = await res.json()
  return data.data?.[0]?.url ?? ""
}
