import { NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const ENV_PATH = join(process.cwd(), ".env.local")

function parseEnv(content: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return map
}

function serializeEnv(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n"
}

export async function GET() {
  try {
    const raw = readFileSync(ENV_PATH, "utf-8")
    const map = parseEnv(raw)
    const statuses: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(map)) {
      statuses[k] = v.length > 0
    }
    return NextResponse.json({ statuses })
  } catch {
    return NextResponse.json({ statuses: {} })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

    let raw = ""
    try { raw = readFileSync(ENV_PATH, "utf-8") } catch {}
    const map = parseEnv(raw)
    map[key] = value ?? ""
    writeFileSync(ENV_PATH, serializeEnv(map))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
