import { createClient, SupabaseClient } from "@supabase/supabase-js"

const PLACEHOLDER = "https://placeholder.supabase.co"
const PLACEHOLDER_KEY = "placeholder"

function makeClient(key?: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER
  const k = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY
  return createClient(url, k)
}

// Browser client — uses anon key, respects RLS
export const supabase = makeClient()

// Server client — uses service role key, bypasses RLS
// Only use in API routes (server-side)
export const supabaseAdmin = makeClient(
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ============================================================
// Typed helpers
// ============================================================

export type ContentStatus = "draft" | "legal_review" | "ready" | "posted" | "failed"
export type AssetStatus = "draft" | "writing" | "mixing" | "editing" | "in_review" | "ready"
export type ScanResult = "clear" | "flagged" | "pending"
export type MerchStatus = "draft" | "review" | "live" | "archived"
export type JobStatus = "queued" | "generating" | "scanning" | "uploading" | "live" | "failed"
export type FinanceType = "income" | "expense"

export interface ContentQueueItem {
  id: string
  brand_id: string
  title: string
  platform: string
  content_type: string
  status: ContentStatus
  due_at: string | null
  posted_at: string | null
  media_url: string | null
  caption: string | null
  hashtags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  brand_id: string
  name: string
  asset_type: string
  status: AssetStatus
  file_url: string | null
  bpm: number | null
  key: string | null
  duration_seconds: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface LegalScan {
  id: string
  brand_id: string
  asset_name: string
  scan_type: string
  result: ScanResult
  detail: string | null
  action_required: string | null
  scanned_at: string
}

export interface MerchProduct {
  id: string
  brand_id: string
  name: string
  printful_id: string | null
  shopify_id: string | null
  status: MerchStatus
  base_cost: number | null
  sale_price: number | null
  units_sold: number
  revenue: number
  image_url: string | null
  design_prompt: string | null
  created_at: string
}

export interface FinanceEntry {
  id: string
  brand_id: string | null
  type: FinanceType
  category: string
  description: string
  amount: number
  entry_date: string
  created_at: string
}

export interface GeneratedContent {
  id: string
  brand_id: string
  content_type: string
  prompt: string | null
  output: string
  model: string
  used: boolean
  created_at: string
}

export interface MerchDesignJob {
  id: string
  brand_id: string
  brief: string
  image_prompt: string | null
  image_url: string | null
  scan_result: ScanResult | null
  scan_detail: string | null
  printful_product_id: string | null
  shopify_product_id: string | null
  status: string
  error: string | null
  created_at: string
  updated_at: string
}

export interface VideoJob {
  id: string
  brand_id: string
  job_type: string
  script: string | null
  voiceover_url: string | null
  video_url: string | null
  thumbnail_url: string | null
  status: string
  error: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}
