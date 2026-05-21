import crypto from "crypto"

export interface ACRCloudResult {
  result: "clear" | "flagged" | "error"
  match?: {
    title: string
    artist: string
    album: string
    label: string
    confidence: number
  }
  detail: string
}

export async function scanAudioUrl(audioUrl: string): Promise<ACRCloudResult> {
  const accessKey = process.env.ACRCLOUD_ACCESS_KEY
  const accessSecret = process.env.ACRCLOUD_ACCESS_SECRET
  const host = process.env.ACRCLOUD_HOST ?? "identify-eu-west-1.acrcloud.com"

  if (!accessKey || !accessSecret) throw new Error("ACRCloud credentials not configured")

  // Download the audio file
  const audioRes = await fetch(audioUrl)
  if (!audioRes.ok) throw new Error(`Failed to fetch audio: ${audioRes.status}`)
  const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

  // Build ACRCloud signature
  const httpMethod = "POST"
  const httpUri = "/v1/identify"
  const dataType = "audio"
  const signatureVersion = "1"
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const stringToSign = [httpMethod, httpUri, accessKey, dataType, signatureVersion, timestamp].join("\n")
  const signature = crypto.createHmac("sha1", accessSecret).update(stringToSign).digest("base64")

  const formData = new FormData()
  formData.append("sample", new Blob([audioBuffer]), "audio.mp3")
  formData.append("access_key", accessKey)
  formData.append("data_type", dataType)
  formData.append("signature_version", signatureVersion)
  formData.append("signature", signature)
  formData.append("sample_bytes", audioBuffer.length.toString())
  formData.append("timestamp", timestamp)

  const res = await fetch(`https://${host}${httpUri}`, { method: "POST", body: formData })
  if (!res.ok) throw new Error(`ACRCloud API error: ${res.status}`)

  const data = await res.json()
  const status = data.status?.code

  // 0 = match found, 1001 = no match
  if (status === 1001) {
    return { result: "clear", detail: "No copyright matches found in ACRCloud database" }
  }

  if (status === 0) {
    const music = data.metadata?.music?.[0]
    const confidence = music?.score ?? 0
    return {
      result: "flagged",
      match: {
        title: music?.title ?? "Unknown",
        artist: music?.artists?.[0]?.name ?? "Unknown",
        album: music?.album?.name ?? "Unknown",
        label: music?.label ?? "Unknown",
        confidence,
      },
      detail: `Match: "${music?.title}" by ${music?.artists?.[0]?.name} (${confidence}% confidence). Clear sample usage before posting.`,
    }
  }

  return { result: "error", detail: `ACRCloud returned unexpected status: ${status}` }
}

// Scan a raw audio buffer directly (for uploads)
export async function scanAudioBuffer(buffer: Buffer, filename: string): Promise<ACRCloudResult> {
  const accessKey = process.env.ACRCLOUD_ACCESS_KEY
  const accessSecret = process.env.ACRCLOUD_ACCESS_SECRET
  const host = process.env.ACRCLOUD_HOST ?? "identify-eu-west-1.acrcloud.com"

  if (!accessKey || !accessSecret) throw new Error("ACRCloud credentials not configured")

  const httpMethod = "POST"
  const httpUri = "/v1/identify"
  const dataType = "audio"
  const signatureVersion = "1"
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const stringToSign = [httpMethod, httpUri, accessKey, dataType, signatureVersion, timestamp].join("\n")
  const signature = crypto.createHmac("sha1", accessSecret).update(stringToSign).digest("base64")

  const formData = new FormData()
  formData.append("sample", new Blob([new Uint8Array(buffer)]), filename)
  formData.append("access_key", accessKey)
  formData.append("data_type", dataType)
  formData.append("signature_version", signatureVersion)
  formData.append("signature", signature)
  formData.append("sample_bytes", buffer.length.toString())
  formData.append("timestamp", timestamp)

  const res = await fetch(`https://${host}${httpUri}`, { method: "POST", body: formData })
  if (!res.ok) throw new Error(`ACRCloud error: ${res.status}`)

  const data = await res.json()
  const status = data.status?.code

  if (status === 1001) return { result: "clear", detail: "No copyright matches found" }

  if (status === 0) {
    const music = data.metadata?.music?.[0]
    const confidence = music?.score ?? 0
    return {
      result: "flagged",
      match: {
        title: music?.title ?? "Unknown",
        artist: music?.artists?.[0]?.name ?? "Unknown",
        album: music?.album?.name ?? "Unknown",
        label: music?.label ?? "Unknown",
        confidence,
      },
      detail: `Match: "${music?.title}" by ${music?.artists?.[0]?.name} (${confidence}% confidence)`,
    }
  }

  return { result: "error", detail: `Unexpected ACRCloud status: ${status}` }
}
