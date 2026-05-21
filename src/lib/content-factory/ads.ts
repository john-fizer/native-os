import Anthropic from "@anthropic-ai/sdk"
import { BRAND_VOICES } from "@/lib/claude"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AdBrief {
  brand: string
  offer: string         // e.g. "M3K1 debut EP", "Fortis Mane hoodie drop"
  objective: string     // awareness | traffic | conversion
  budget?: string       // e.g. "$10/day"
}

export interface AdSet {
  headline: string
  primaryText: string
  cta: string
  audiences: Array<{
    name: string
    interests: string[]
    ageRange: string
    behaviors: string[]
  }>
  variants: Array<{
    label: string
    headline: string
    primaryText: string
    angle: string
  }>
}

export async function generateAdSet(brief: AdBrief): Promise<AdSet> {
  const voice = BRAND_VOICES[brief.brand as keyof typeof BRAND_VOICES]

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    messages: [{
      role: "user",
      content: `You are a performance marketing strategist for ${brief.brand} (${voice?.genre}).
Brand voice: ${voice?.vibe}.
Audience: ${voice?.audience}.

Create a Meta/TikTok ad set for this offer: "${brief.offer}"
Objective: ${brief.objective}
${brief.budget ? `Budget: ${brief.budget}` : ""}

Return JSON with:
- headline: primary headline (max 40 chars)
- primaryText: main ad copy (2-3 sentences, hooks immediately)
- cta: call to action text
- audiences: array of 3 targeting audiences, each with name, interests[], ageRange, behaviors[]
- variants: array of 3 A/B test variants, each with label, headline, primaryText, angle

JSON only, no explanation.`
    }]
  })

  const text = (response.content[0] as { text: string }).text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Failed to parse ad set")
  return JSON.parse(match[0])
}

export interface VSLBrief {
  brand: string
  offer: string
  pain: string          // core pain point
  transformation: string // what they get
  proof?: string        // social proof or credentials
  price?: string
}

export interface VSLScript {
  hook: string          // 0-5s
  problem: string       // 5-30s
  agitation: string     // 30-60s
  solution: string      // 60-120s
  proof: string         // 120-180s
  offer: string         // 180-210s
  cta: string           // 210-240s
  fullScript: string    // complete formatted script with timestamps
}

export async function generateVSL(brief: VSLBrief): Promise<VSLScript> {
  const voice = BRAND_VOICES[brief.brand as keyof typeof BRAND_VOICES]

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `You are a direct response copywriter for ${brief.brand} (${voice?.genre}).
Brand voice: ${voice?.vibe}.
Audience: ${voice?.audience}.

Write a 3-4 minute VSL (video sales letter) script.

Offer: ${brief.offer}
Pain point: ${brief.pain}
Transformation: ${brief.transformation}
${brief.proof ? `Proof/credentials: ${brief.proof}` : ""}
${brief.price ? `Price/offer: ${brief.price}` : ""}

Return JSON with these keys:
- hook: (0-5s) scroll-stopping opening line
- problem: (5-30s) identify the pain
- agitation: (30-60s) make the pain real
- solution: (60-120s) introduce the solution
- proof: (120-180s) social proof / results
- offer: (180-210s) present the offer
- cta: (210-240s) call to action
- fullScript: complete script with [0:00] timestamps, stage directions in (parentheses)

JSON only.`
    }]
  })

  const text = (response.content[0] as { text: string }).text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Failed to parse VSL")
  return JSON.parse(match[0])
}
