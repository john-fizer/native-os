const BASE = "https://www.googleapis.com/youtube/v3"

export interface YouTubeStats {
  channelId: string
  title: string
  subscribers: number
  totalViews: number
  videoCount: number
  recentVideos: Array<{
    id: string
    title: string
    views: number
    likes: number
    publishedAt: string
    thumbnail: string
  }>
}

export interface VideoSearchResult {
  id: string
  title: string
  channelTitle: string
  publishedAt: string
  thumbnail: string
  description: string
}

export interface VideoStats {
  id: string
  title: string
  channelTitle: string
  views: number
  likes: number
  comments: number
  duration: string
  publishedAt: string
  thumbnail: string
  tags: string[]
  description: string
}

export interface KeywordResearch {
  keyword: string
  topVideoCount: number
  avgViews: number
  maxViews: number
  topTitles: string[]
}

function key() {
  const k = process.env.YOUTUBE_API_KEY
  if (!k) throw new Error("YOUTUBE_API_KEY not set")
  return k
}

export async function getYouTubeStats(channelId: string): Promise<YouTubeStats> {
  const chanRes = await fetch(`${BASE}/channels?part=snippet,statistics&id=${channelId}&key=${key()}`)
  if (!chanRes.ok) throw new Error(`YouTube API error: ${chanRes.status}`)
  const chanData = await chanRes.json()
  const chan = chanData.items?.[0]
  if (!chan) throw new Error(`Channel not found: ${channelId}`)

  const searchRes = await fetch(`${BASE}/search?part=snippet&channelId=${channelId}&order=date&maxResults=5&type=video&key=${key()}`)
  const searchData = await searchRes.json()
  const videoIds = (searchData.items ?? []).map((v: { id: { videoId: string } }) => v.id.videoId).join(",")

  let recentVideos: YouTubeStats["recentVideos"] = []
  if (videoIds) {
    const vidRes = await fetch(`${BASE}/videos?part=snippet,statistics&id=${videoIds}&key=${key()}`)
    const vidData = await vidRes.json()
    recentVideos = (vidData.items ?? []).map((v: {
      id: string
      snippet: { title: string; publishedAt: string; thumbnails: { default: { url: string } } }
      statistics: { viewCount: string; likeCount: string }
    }) => ({
      id: v.id,
      title: v.snippet.title,
      views: parseInt(v.statistics.viewCount ?? "0"),
      likes: parseInt(v.statistics.likeCount ?? "0"),
      publishedAt: v.snippet.publishedAt,
      thumbnail: v.snippet.thumbnails.default.url,
    }))
  }

  return {
    channelId,
    title: chan.snippet.title,
    subscribers: parseInt(chan.statistics.subscriberCount ?? "0"),
    totalViews: parseInt(chan.statistics.viewCount ?? "0"),
    videoCount: parseInt(chan.statistics.videoCount ?? "0"),
    recentVideos,
  }
}

export async function searchYouTube({
  query,
  maxResults = 10,
  order = "relevance",
}: {
  query: string
  maxResults?: number
  order?: "relevance" | "viewCount" | "date"
}): Promise<VideoSearchResult[]> {
  const res = await fetch(
    `${BASE}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=${order}&type=video&key=${key()}`
  )
  if (!res.ok) throw new Error(`YouTube search error: ${res.status}`)
  const data = await res.json()

  return (data.items ?? []).map((item: {
    id: { videoId: string }
    snippet: {
      title: string
      channelTitle: string
      publishedAt: string
      thumbnails: { medium: { url: string } }
      description: string
    }
  }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails.medium?.url ?? "",
    description: item.snippet.description,
  }))
}

export async function getVideoStats(videoIds: string[]): Promise<VideoStats[]> {
  if (!videoIds.length) return []
  const ids = videoIds.slice(0, 20).join(",")
  const res = await fetch(`${BASE}/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${key()}`)
  if (!res.ok) throw new Error(`YouTube video details error: ${res.status}`)
  const data = await res.json()

  return (data.items ?? []).map((v: {
    id: string
    snippet: {
      title: string
      channelTitle: string
      publishedAt: string
      thumbnails: { medium: { url: string } }
      tags?: string[]
      description: string
    }
    statistics: { viewCount: string; likeCount: string; commentCount: string }
    contentDetails: { duration: string }
  }) => ({
    id: v.id,
    title: v.snippet.title,
    channelTitle: v.snippet.channelTitle,
    views: parseInt(v.statistics.viewCount ?? "0"),
    likes: parseInt(v.statistics.likeCount ?? "0"),
    comments: parseInt(v.statistics.commentCount ?? "0"),
    duration: v.contentDetails.duration,
    publishedAt: v.snippet.publishedAt,
    thumbnail: v.snippet.thumbnails.medium?.url ?? "",
    tags: v.snippet.tags ?? [],
    description: v.snippet.description?.slice(0, 200) ?? "",
  }))
}

export async function researchKeywords(keywords: string[]): Promise<KeywordResearch[]> {
  const results: KeywordResearch[] = []

  for (const keyword of keywords.slice(0, 5)) {
    const searchResults = await searchYouTube({ query: keyword, maxResults: 5, order: "viewCount" })
    if (!searchResults.length) continue

    const stats = await getVideoStats(searchResults.map(v => v.id))
    const views = stats.map(v => v.views).filter(Boolean)

    results.push({
      keyword,
      topVideoCount: stats.length,
      avgViews: views.length ? Math.round(views.reduce((a, b) => a + b, 0) / views.length) : 0,
      maxViews: views.length ? Math.max(...views) : 0,
      topTitles: stats.slice(0, 3).map(v => v.title),
    })
  }

  return results
}
