import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const BRAND_VOICES = {
  M3K1: {
    genre: "Pop Rap",
    vibe: "confident, urban, authentic, aspirational",
    audience: "18-30 year olds into rap, street fashion, hustle culture",
    avoid: "religious references, soft language, corporate tone",
  },
  XRXS: {
    genre: "Christian Pop",
    vibe: "worship, uplifting, honest, emotional, spiritual depth",
    audience: "Christian millennials and gen Z, worship culture",
    avoid: "secular slang, anything that contradicts faith values",
  },
  "Fortis Mane": {
    genre: "Luxury Fitness Lifestyle",
    vibe: "premium, disciplined, powerful, clean aesthetic",
    audience: "fitness-minded professionals, luxury lifestyle enthusiasts",
    avoid: "budget language, casual slang, anything that feels cheap",
  },
  "Philosopher Stoned": {
    genre: "YouTube Lifestyle / Philosophy",
    vibe: "curious, deep, conversational, slightly irreverent",
    audience: "intellectually curious 20-35 year olds, self-improvement crowd",
    avoid: "overly academic tone, corporate speak, shallow takes",
  },
}

export async function generateBrief({
  brand,
  type,
  context,
}: {
  brand: string
  type: string
  context?: string
}) {
  const voice = BRAND_VOICES[brand as keyof typeof BRAND_VOICES]

  const systemPrompt = `You are the AI creative director for ${brand}, a ${voice?.genre} brand.
Brand voice: ${voice?.vibe}.
Target audience: ${voice?.audience}.
Avoid: ${voice?.avoid}.
Be concise, punchy, and on-brand. No fluff.`

  const userPrompt = buildPrompt(type, brand, context)

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  return (response.content[0] as { type: string; text: string }).text
}

export async function generateBoardroomReport(data: {
  brands: Array<{ name: string; followers: Record<string, number>; genre: string }>
  weeklyPosts: number
  target: number
  revenue: number
  expenses: number
}) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: `You are the AI executive advisor for Native OS, a multi-brand creative enterprise.
Be direct, insightful, and actionable. Use plain language. No corporate BS.
Format your response as JSON with keys: wins (array), misses (array), priorities (array of 5), insight (string).`,
    messages: [
      {
        role: "user",
        content: `Generate a weekly executive brief for the week of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.

Brands and follower data:
${data.brands.map(b => `- ${b.name} (${b.genre}): ${Object.entries(b.followers).map(([p, f]) => `${p}: ${f}`).join(", ")}`).join("\n")}

Performance:
- Posts this week: ${data.weeklyPosts} (target: ${data.target})
- Revenue this month: $${data.revenue}
- Expenses this month: $${data.expenses}
- Net: $${data.revenue - data.expenses}

Give me 4 wins, 4 gaps, 5 priorities, and 1 key insight. JSON only.`,
      },
    ],
  })

  try {
    const text = (response.content[0] as { type: string; text: string }).text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {}

  return null
}

export async function generateMarketingBrief(data: {
  date: string
  brands: Array<{
    name: string
    platformStats: Array<{ platform: string; followers: number; engagement?: string; postsThisWeek: number }>
  }>
  queueStats: { total: number; posted: number; ready: number; draft: number }
  financeThisMonth: { income: number; expenses: number }
  topCategories: string[]
}) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: `You are the head of marketing for Native OS, a multi-brand creative enterprise managing music, fitness, and lifestyle brands.
Your job: analyze this week's data and produce a tight, actionable strategy brief.
Be direct. No fluff. Think like a growth marketer who has seen hundreds of brand accounts.
Return JSON only — no markdown, no explanation outside the JSON.`,
    messages: [
      {
        role: "user",
        content: `Generate a marketing strategy brief for the week of ${data.date}.

BRAND PERFORMANCE:
${data.brands.map(b => `
${b.name}:
${b.platformStats.map(p => `  ${p.platform}: ${p.followers} followers${p.engagement ? `, ${p.engagement} engagement` : ""}, ${p.postsThisWeek} posts this week`).join("\n")}
`).join("")}

CONTENT PIPELINE:
- Total queue: ${data.queueStats.total} items
- Posted this period: ${data.queueStats.posted}
- Ready to post: ${data.queueStats.ready}
- Still in draft: ${data.queueStats.draft}

FINANCIALS THIS MONTH:
- Income: $${data.financeThisMonth.income.toFixed(2)}
- Expenses: $${data.financeThisMonth.expenses.toFixed(2)}
- Net: $${(data.financeThisMonth.income - data.financeThisMonth.expenses).toFixed(2)}
- Top revenue categories: ${data.topCategories.join(", ") || "n/a"}

Return this exact JSON shape:
{
  "weekOf": "${data.date}",
  "topPriority": "single most important action this week",
  "brandActions": [
    { "brand": "...", "focus": "one-line strategic focus", "actions": ["action 1", "action 2", "action 3"], "alert": "any risk or opportunity to flag, or null" }
  ],
  "contentStrategy": { "increase": ["..."], "cut": ["..."], "test": ["..."] },
  "growthLever": "the single highest-leverage growth move across all brands right now",
  "revenueNote": "one sentence on the financial picture and what to do about it"
}`,
      },
    ],
  })

  try {
    const text = (response.content[0] as { type: string; text: string }).text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {}
  return null
}

function buildPrompt(type: string, brand: string, context?: string): string {
  const ctx = context ? `\nContext: ${context}` : ""

  switch (type) {
    case "Hook (TikTok)":
      return `Write 3 TikTok hook options for ${brand}. Each hook must be under 8 words, designed for the first 2 seconds of a video to stop the scroll. Label them Hook 1, Hook 2, Hook 3.${ctx}`

    case "Verse lyrics":
      return `Write one verse (8-12 lines) for a ${brand} song. Match the brand voice perfectly. Include rhyme scheme.${ctx}`

    case "Caption copy":
      return `Write 3 Instagram/TikTok caption options for ${brand}. Each should be 1-3 sentences, include a strong CTA, and feel authentic to the brand. Include 5 relevant hashtags at the end of each.${ctx}`

    case "Merch prompt":
      return `Write 3 AI image generation prompts for ${brand} merch designs. Each prompt should describe a specific apparel graphic — style, colors, composition. Make them production-ready for Midjourney.${ctx}`

    case "Content script":
      return `Write a short-form video script for ${brand} (30-60 seconds). Include: hook (0-3s), body (3-25s), CTA (25-30s). Format with timestamps.${ctx}`

    default:
      return `Generate creative content for ${brand}: ${type}.${ctx}`
  }
}
