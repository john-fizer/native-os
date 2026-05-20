// TikTok Business API — requires OAuth 2.0 app approval from TikTok for Business
// Apply at: https://developers.tiktok.com/
// Scopes needed: user.info.basic, video.list

const BASE = "https://open.tiktokapis.com/v2"

export interface TikTokStats {
  username: string
  displayName: string
  followers: number
  following: number
  likes: number
  videoCount: number
  recentVideos: Array<{
    id: string
    title: string
    views: number
    likes: number
    comments: number
    shares: number
    createTime: number
  }>
}

export async function getTikTokStats(accessToken: string): Promise<TikTokStats> {
  if (!accessToken) throw new Error("TikTok access token not provided")

  const userRes = await fetch(`${BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userRes.ok) {
    const err = await userRes.json().catch(() => ({}))
    throw new Error(`TikTok API error: ${userRes.status} — ${err?.error?.message ?? "unknown"}`)
  }

  const userData = await userRes.json()
  const user = userData.data?.user

  const videoRes = await fetch(`${BASE}/video/list/?fields=id,title,create_time,share_url,view_count,like_count,comment_count,share_count`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ max_count: 10 }),
  })

  const videoData = videoRes.ok ? await videoRes.json() : { data: { videos: [] } }

  return {
    username: user?.display_name ?? "unknown",
    displayName: user?.display_name ?? "unknown",
    followers: user?.follower_count ?? 0,
    following: user?.following_count ?? 0,
    likes: user?.likes_count ?? 0,
    videoCount: user?.video_count ?? 0,
    recentVideos: (videoData.data?.videos ?? []).map((v: {
      id: string
      title: string
      view_count: number
      like_count: number
      comment_count: number
      share_count: number
      create_time: number
    }) => ({
      id: v.id,
      title: v.title,
      views: v.view_count,
      likes: v.like_count,
      comments: v.comment_count,
      shares: v.share_count,
      createTime: v.create_time,
    })),
  }
}

// OAuth helpers — use these to get the initial access token
export function getTikTokAuthUrl(clientKey: string, redirectUri: string) {
  const scope = "user.info.basic,video.list"
  const state = Math.random().toString(36).slice(2)
  return {
    url: `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
    state,
  }
}

export async function exchangeTikTokCode(code: string, clientKey: string, clientSecret: string, redirectUri: string) {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) throw new Error(`TikTok token exchange failed: ${res.status}`)
  return res.json()
}
