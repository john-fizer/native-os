const BASE = "https://api.spotify.com/v1"
const TOKEN_URL = "https://accounts.spotify.com/api/token"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set")

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`)
  const data = await res.json()
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.token
}

export interface SpotifyArtistStats {
  artistId: string
  name: string
  followers: number
  popularity: number
  genres: string[]
  imageUrl: string | null
  topTracks: Array<{ name: string; streams: number; previewUrl: string | null }>
}

export async function getSpotifyArtistStats(artistId: string): Promise<SpotifyArtistStats> {
  const token = await getAccessToken()

  const [artistRes, tracksRes] = await Promise.all([
    fetch(`${BASE}/artists/${artistId}`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${BASE}/artists/${artistId}/top-tracks?market=US`, { headers: { Authorization: `Bearer ${token}` } }),
  ])

  if (!artistRes.ok) throw new Error(`Spotify artist error: ${artistRes.status}`)
  const artist = await artistRes.json()
  const tracksData = tracksRes.ok ? await tracksRes.json() : { tracks: [] }

  return {
    artistId,
    name: artist.name,
    followers: artist.followers?.total ?? 0,
    popularity: artist.popularity ?? 0,
    genres: artist.genres ?? [],
    imageUrl: artist.images?.[0]?.url ?? null,
    topTracks: (tracksData.tracks ?? []).slice(0, 5).map((t: {
      name: string
      popularity: number
      preview_url: string | null
    }) => ({
      name: t.name,
      streams: t.popularity * 10000,
      previewUrl: t.preview_url,
    })),
  }
}
