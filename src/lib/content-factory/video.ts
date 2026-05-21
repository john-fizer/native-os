import Anthropic from "@anthropic-ai/sdk"
import { BRAND_VOICES } from "@/lib/claude"
import { supabaseAdmin } from "@/lib/supabase"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── ElevenLabs voiceover ────────────────────────────────────
const VOICE_IDS: Record<string, string> = {
  M3K1: "pNInz6obpgDQGcFmaJgB",              // Adam — deep, confident
  XRXS: "EXAVITQu4vr4xnSDxMaL",              // Bella — warm, emotive
  "Fortis Mane": "VR6AewLTigWG4xSOukaG",      // Arnold — powerful, authoritative
  "Philosopher Stoned": "yoZ06aMxZJJ28mfd3POQ", // Sam — thoughtful, conversational
}

export async function generateVoiceover(script: string, brand: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set")

  const voiceId = VOICE_IDS[brand] ?? VOICE_IDS["Philosopher Stoned"]

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: script,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`)

  // Upload audio blob to Supabase Storage
  const audioBuffer = await res.arrayBuffer()
  const fileName = `voiceover_${Date.now()}.mp3`

  const { data, error } = await supabaseAdmin.storage
    .from("media")
    .upload(`voiceovers/${fileName}`, audioBuffer, { contentType: "audio/mpeg", upsert: false })

  if (error) throw new Error(`Storage upload error: ${error.message}`)

  const { data: urlData } = supabaseAdmin.storage.from("media").getPublicUrl(`voiceovers/${fileName}`)
  return urlData.publicUrl
}

// ─── Kling/Runway video generation ───────────────────────────
export async function generateVideo(prompt: string, imageUrl?: string): Promise<string> {
  const apiKey = process.env.KLING_API_KEY
  if (!apiKey) throw new Error("KLING_API_KEY not set — sign up at klingai.com")

  const body: Record<string, unknown> = {
    model: "kling-v1",
    prompt,
    duration: 5,
    aspect_ratio: "9:16",
    cfg_scale: 0.5,
  }
  if (imageUrl) body.image = imageUrl  // image-to-video for character consistency

  const res = await fetch("https://api.klingai.com/v1/videos/text2video", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Kling error: ${res.status} ${await res.text()}`)
  const data = await res.json()

  // Kling is async — poll for result
  const taskId = data.data?.task_id
  if (!taskId) throw new Error("No task ID from Kling")

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 10000))
    const poll = await fetch(`https://api.klingai.com/v1/videos/text2video/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const pollData = await poll.json()
    const status = pollData.data?.task_status
    if (status === "succeed") {
      return pollData.data.task_result?.videos?.[0]?.url ?? ""
    }
    if (status === "failed") throw new Error("Kling generation failed")
  }

  throw new Error("Kling timed out after 5 minutes")
}

// ─── UGC Script generator ─────────────────────────────────────
export async function generateUGCScript(brief: {
  brand: string
  hook: string
  offer: string
  duration: 15 | 30 | 60
}): Promise<string> {
  const voice = BRAND_VOICES[brief.brand as keyof typeof BRAND_VOICES]

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: `Write a ${brief.duration}-second UGC-style TikTok/Reels script for ${brief.brand}.
Brand voice: ${voice?.vibe}.
Hook: "${brief.hook}"
Offer/topic: "${brief.offer}"

Format:
[0:00-0:03] Hook line (spoken)
[0:03-...] Body (natural, conversational, NOT salesy)
[last 3s] CTA

Keep it authentic — like a real person talking, not an ad. Short sentences. Pauses. Energy.`
    }]
  })

  return (response.content[0] as { text: string }).text
}

// ─── Full UGC video pipeline ──────────────────────────────────
export async function runVideoPipeline(jobId: string) {
  const { data: job } = await supabaseAdmin
    .from("video_jobs")
    .select("*, brands(name)")
    .eq("id", jobId)
    .single()

  if (!job) throw new Error("Video job not found")
  const brandName = (job.brands as { name: string })?.name ?? job.brand_id

  const update = (patch: Record<string, unknown>) =>
    supabaseAdmin.from("video_jobs").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", jobId)

  try {
    // Generate script if not provided
    let script = job.script
    if (!script) {
      await update({ status: "scripting" })
      const meta = job.metadata as Record<string, unknown>
      script = await generateUGCScript({
        brand: brandName,
        hook: (meta.hook as string) ?? "Watch this",
        offer: (meta.offer as string) ?? brandName,
        duration: (meta.duration as 15 | 30 | 60) ?? 30,
      })
      await update({ script })
    }

    // Generate voiceover
    if (process.env.ELEVENLABS_API_KEY) {
      await update({ status: "voiceover" })
      const voiceoverUrl = await generateVoiceover(script, brandName)
      await update({ voiceover_url: voiceoverUrl })
    }

    // Generate video
    if (process.env.KLING_API_KEY) {
      await update({ status: "generating" })
      const meta = job.metadata as Record<string, unknown>
      const videoUrl = await generateVideo(
        `${brandName} brand video, ${script.slice(0, 200)}`,
        meta.reference_image as string | undefined
      )
      await update({ video_url: videoUrl, status: "ready" })
    } else {
      await update({ status: "ready" })
    }

    return { ok: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await update({ status: "failed", error })
    throw err
  }
}
