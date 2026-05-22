import Anthropic from "@anthropic-ai/sdk"
import { runAgent } from "./runner"
import { searchYouTube, getVideoStats, researchKeywords } from "@/lib/platforms/youtube"

export interface YouTubeResearchInput {
  topic: string
  brand: string
  niche: string
  videoTitle?: string
}

export interface YouTubeResearchOutput {
  keywords: Array<{ keyword: string; avgViews: number; competition: "low" | "medium" | "high"; recommendation: string }>
  titleFormulas: Array<{ formula: string; example: string; whyItWorks: string }>
  thumbnailPatterns: Array<{ pattern: string; description: string; usedBy: string }>
  contentGaps: string[]
  topPerformers: Array<{ title: string; views: number; whyItWorks: string }>
  recommendedAngle: string
  seoTitle: string
  seoBrief: string
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_youtube",
    description: "Search YouTube for videos on a query. Returns video IDs, titles, channels, and publish dates. Use multiple searches with different angles to get comprehensive coverage.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "YouTube search query" },
        max_results: { type: "number", description: "Number of results (5-15)" },
        order: { type: "string", enum: ["relevance", "viewCount", "date"], description: "Sort order" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_video_stats",
    description: "Get detailed stats (views, likes, comments, duration, tags) for specific YouTube video IDs. Use after searching to analyze top performers.",
    input_schema: {
      type: "object" as const,
      properties: {
        video_ids: { type: "array", items: { type: "string" }, description: "YouTube video IDs to get stats for" },
      },
      required: ["video_ids"],
    },
  },
  {
    name: "research_keywords",
    description: "Research multiple keyword variations to find the best angle. Returns avg views and competition level for each keyword.",
    input_schema: {
      type: "object" as const,
      properties: {
        keywords: { type: "array", items: { type: "string" }, description: "List of keyword phrases to research (max 5)" },
      },
      required: ["keywords"],
    },
  },
]

const TOOL_HANDLERS = {
  search_youtube: async (input: unknown) => {
    const { query, max_results = 10, order = "relevance" } = input as { query: string; max_results?: number; order?: "relevance" | "viewCount" | "date" }
    return searchYouTube({ query, maxResults: max_results, order })
  },
  get_video_stats: async (input: unknown) => {
    const { video_ids } = input as { video_ids: string[] }
    return getVideoStats(video_ids)
  },
  research_keywords: async (input: unknown) => {
    const { keywords } = input as { keywords: string[] }
    return researchKeywords(keywords)
  },
}

const SYSTEM_PROMPT = `You are an elite YouTube SEO strategist and content researcher. Your job is to deeply research a topic on YouTube and produce actionable intelligence.

Your research process:
1. Search YouTube with the main topic and 2-3 related angles
2. Get detailed stats on top-performing videos to understand what works
3. Research 3-5 keyword variations to find the best SEO angle
4. Search by viewCount to find the highest-performing content in this space
5. Identify patterns in titles (curiosity gap, numbers, controversy, "how to")
6. Identify thumbnail patterns from top performers
7. Find content gaps — what's NOT being covered that has demand

Always do at least 3 searches and get stats on at least 8 videos before concluding.

Return your findings as a JSON object with this exact structure:
{
  "keywords": [{ "keyword": "...", "avgViews": 0, "competition": "low|medium|high", "recommendation": "..." }],
  "titleFormulas": [{ "formula": "...", "example": "...", "whyItWorks": "..." }],
  "thumbnailPatterns": [{ "pattern": "...", "description": "...", "usedBy": "..." }],
  "contentGaps": ["gap 1", "gap 2"],
  "topPerformers": [{ "title": "...", "views": 0, "whyItWorks": "..." }],
  "recommendedAngle": "The best angle for this content based on research",
  "seoTitle": "The optimized video title (max 60 chars)",
  "seoBrief": "2-3 sentence brief on what the video should cover for maximum SEO impact"
}`

export async function runYouTubeResearchAgent(input: YouTubeResearchInput) {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY not configured — add it in Settings to enable YouTube research")
  }

  const userMessage = `Research this YouTube topic for ${input.brand} (${input.niche}):

Topic: "${input.topic}"
${input.videoTitle ? `Planned video title: "${input.videoTitle}"` : ""}

Perform thorough research:
1. Search the main topic and 2-3 related angles
2. Get stats on top performers
3. Research keyword variations for best SEO angle
4. Find what content gaps exist in this space

Return your complete research report as JSON.`

  const result = await runAgent({
    agentType: "youtube_research",
    input: input as unknown as Record<string, unknown>,
    systemPrompt: SYSTEM_PROMPT,
    userMessage,
    tools: TOOLS,
    toolHandlers: TOOL_HANDLERS,
    maxIterations: 12,
  })

  return {
    runId: result.runId,
    research: result.output as YouTubeResearchOutput,
    steps: result.steps,
    tokensUsed: result.tokensUsed,
    durationMs: result.durationMs,
  }
}
