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

export async function getYouTubeStats(channelId: string): Promise<YouTubeStats> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) throw new Error("YOUTUBE_API_KEY not set")

  // Channel stats
  const chanRes = await fetch(
    `${BASE}/channels?part=snippet,statistics&id=${channelId}&key=${key}`
  )
  if (!chanRes.ok) throw new Error(`YouTube API error: ${chanRes.status}`)
  const chanData = await chanRes.json()
  const chan = chanData.items?.[0]
  if (!chan) throw new Error(`Channel not found: ${channelId}`)

  // Recent videos
  const searchRes = await fetch(
    `${BASE}/search?part=snippet&channelId=${channelId}&order=date&maxResults=5&type=video&key=${key}`
  )
  const searchData = await searchRes.json()
  const videoIds = (searchData.items ?? []).map((v: { id: { videoId: string } }) => v.id.videoId).join(",")

  let recentVideos: YouTubeStats["recentVideos"] = []
  if (videoIds) {
    const vidRes = await fetch(
      `${BASE}/videos?part=snippet,statistics&id=${videoIds}&key=${key}`
    )
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
