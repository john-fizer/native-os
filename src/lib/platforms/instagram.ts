// Instagram Graph API — requires Facebook Business account + Instagram Professional account
// Setup: https://developers.facebook.com/ → create app → add Instagram Graph API product
// Then connect your Instagram professional account via Facebook

const BASE = "https://graph.instagram.com/v21.0"

export interface InstagramStats {
  username: string
  name: string
  followers: number
  following: number
  mediaCount: number
  profilePicture: string | null
  recentMedia: Array<{
    id: string
    caption: string
    mediaType: string
    timestamp: string
    likeCount: number
    commentsCount: number
    permalink: string
    thumbnailUrl: string | null
  }>
  insights: {
    reach: number
    impressions: number
    profileViews: number
  } | null
}

export async function getInstagramStats(accessToken: string): Promise<InstagramStats> {
  if (!accessToken) throw new Error("Instagram access token not provided")

  const userRes = await fetch(
    `${BASE}/me?fields=id,username,name,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`
  )
  if (!userRes.ok) {
    const err = await userRes.json().catch(() => ({}))
    throw new Error(`Instagram API error: ${userRes.status} — ${err?.error?.message ?? "unknown"}`)
  }
  const user = await userRes.json()

  // Recent media
  const mediaRes = await fetch(
    `${BASE}/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink,thumbnail_url&limit=10&access_token=${accessToken}`
  )
  const mediaData = mediaRes.ok ? await mediaRes.json() : { data: [] }

  // Basic insights (requires business/creator account)
  let insights = null
  try {
    const insightRes = await fetch(
      `${BASE}/me/insights?metric=reach,impressions,profile_views&period=day&access_token=${accessToken}`
    )
    if (insightRes.ok) {
      const insightData = await insightRes.json()
      const getValue = (name: string) =>
        insightData.data?.find((d: { name: string; values: Array<{ value: number }> }) => d.name === name)?.values?.slice(-1)[0]?.value ?? 0
      insights = {
        reach: getValue("reach"),
        impressions: getValue("impressions"),
        profileViews: getValue("profile_views"),
      }
    }
  } catch {}

  return {
    username: user.username,
    name: user.name,
    followers: user.followers_count ?? 0,
    following: user.follows_count ?? 0,
    mediaCount: user.media_count ?? 0,
    profilePicture: user.profile_picture_url ?? null,
    recentMedia: (mediaData.data ?? []).map((m: {
      id: string
      caption?: string
      media_type: string
      timestamp: string
      like_count?: number
      comments_count?: number
      permalink: string
      thumbnail_url?: string
    }) => ({
      id: m.id,
      caption: m.caption ?? "",
      mediaType: m.media_type,
      timestamp: m.timestamp,
      likeCount: m.like_count ?? 0,
      commentsCount: m.comments_count ?? 0,
      permalink: m.permalink,
      thumbnailUrl: m.thumbnail_url ?? null,
    })),
    insights,
  }
}

// Get a long-lived token from a short-lived one (valid 60 days)
export async function refreshInstagramToken(shortToken: string, appId: string, appSecret: string) {
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${shortToken}`
  )
  if (!res.ok) throw new Error("Instagram token refresh failed")
  return res.json()
}
