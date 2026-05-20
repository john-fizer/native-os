import { NextResponse } from "next/server"
import { cachedFetch } from "@/lib/platforms/cache"
import { getYouTubeStats } from "@/lib/platforms/youtube"
import { getSpotifyArtistStats } from "@/lib/platforms/spotify"
import { getTikTokStats } from "@/lib/platforms/tiktok"
import { getInstagramStats } from "@/lib/platforms/instagram"

// Brand-to-platform ID mapping
// Update these with your real channel/artist IDs once you have them
const PLATFORM_IDS = {
  youtube: {
    philosopher: process.env.YOUTUBE_CHANNEL_PHILOSOPHER ?? "",
    m3k1: process.env.YOUTUBE_CHANNEL_M3K1 ?? "",
  },
  spotify: {
    xrxs: process.env.SPOTIFY_ARTIST_XRXS ?? "",
    m3k1: process.env.SPOTIFY_ARTIST_M3K1 ?? "",
  },
}

async function tryFetch<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await fn(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function GET() {
  const results: Record<string, { data: unknown; error: string | null; connected: boolean }> = {}

  // YouTube
  if (process.env.YOUTUBE_API_KEY) {
    for (const [brand, channelId] of Object.entries(PLATFORM_IDS.youtube)) {
      if (!channelId) continue
      const res = await cachedFetch(
        `youtube:${channelId}`,
        () => tryFetch(() => getYouTubeStats(channelId)),
      )
      results[`youtube_${brand}`] = { ...res, connected: true }
    }
  }

  // Spotify
  if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
    for (const [brand, artistId] of Object.entries(PLATFORM_IDS.spotify)) {
      if (!artistId) continue
      const res = await cachedFetch(
        `spotify:${artistId}`,
        () => tryFetch(() => getSpotifyArtistStats(artistId)),
      )
      results[`spotify_${brand}`] = { ...res, connected: true }
    }
  }

  // TikTok
  if (process.env.TIKTOK_ACCESS_TOKEN) {
    const res = await cachedFetch(
      "tiktok:me",
      () => tryFetch(() => getTikTokStats(process.env.TIKTOK_ACCESS_TOKEN!)),
    )
    results.tiktok = { ...res, connected: true }
  }

  // Instagram
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    const res = await cachedFetch(
      "instagram:me",
      () => tryFetch(() => getInstagramStats(process.env.INSTAGRAM_ACCESS_TOKEN!)),
    )
    results.instagram = { ...res, connected: true }
  }

  // Which platforms are configured (key exists, even if empty)
  const configured = {
    youtube: !!process.env.YOUTUBE_API_KEY,
    spotify: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
    tiktok: !!process.env.TIKTOK_ACCESS_TOKEN,
    instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
  }

  return NextResponse.json({ results, configured })
}
