-- Native OS — Supabase Schema
-- Run this in your Supabase SQL editor: Project → SQL Editor → New query → paste → Run

-- ============================================================
-- BRANDS
-- ============================================================
create table if not exists brands (
  id text primary key,
  name text not null,
  full_name text,
  genre text,
  color text,
  platforms text[] default '{}',
  created_at timestamptz default now()
);

insert into brands (id, name, full_name, genre, color, platforms) values
  ('xrxs',        'XRXS',               'Xerxes',                  'Christian Pop',       '#c9a84c', array['spotify','apple','tiktok','instagram']),
  ('m3k1',        'M3K1',               'Mekki',                   'Pop Rap',             '#8b5cf6', array['spotify','apple','tiktok','instagram','youtube']),
  ('fortis',      'Fortis Mane',        'Fortis Mane',             'Luxury Fitness',      '#10b981', array['instagram','tiktok','shopify']),
  ('philosopher', 'Philosopher Stoned', 'The Philosopher Stoned',  'YouTube / Lifestyle', '#4c7fc9', array['youtube','instagram'])
on conflict (id) do nothing;

-- ============================================================
-- BRAND LINKS (websites, streaming, social, storefronts)
-- ============================================================
create table if not exists brand_links (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id) unique,
  website text,
  etsy_url text,
  shopify_url text,
  spotify_url text,
  apple_music_url text,
  youtube_url text,
  tiktok_url text,
  instagram_url text,
  soundcloud_url text,
  linktree_url text,
  updated_at timestamptz default now()
);

insert into brand_links (brand_id, website) values
  ('fortis', 'https://fortismane.com')
on conflict (brand_id) do nothing;

-- ============================================================
-- CONTENT QUEUE (Production Floor)
-- ============================================================
create table if not exists content_queue (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  title text not null,
  platform text not null,
  content_type text not null,
  status text not null default 'draft',  -- draft | legal_review | ready | posted | failed
  due_at timestamptz,
  posted_at timestamptz,
  media_url text,
  caption text,
  hashtags text[],
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ASSETS (Studio library)
-- ============================================================
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  name text not null,
  asset_type text not null,  -- track | video | design | image
  status text not null default 'draft',  -- draft | writing | mixing | editing | in_review | ready
  file_url text,
  bpm integer,
  key text,
  duration_seconds integer,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed initial assets
insert into assets (brand_id, name, asset_type, status, bpm, key) values
  ('m3k1',        'Already Gone – demo v3',      'track',  'mixing',    94, 'Am'),
  ('xrxs',        'Refiner – final master',       'track',  'ready',     76, 'G'),
  ('xrxs',        'Chosen (feat. unnamed)',        'track',  'writing',   88, 'E'),
  ('philosopher', 'Ep.7 – Why We Dream',           'video',  'editing',   null, null),
  ('fortis',      'Fortis Mane S/S Collection',    'design', 'in_review', null, null)
on conflict do nothing;

-- ============================================================
-- LEGAL SCANS
-- ============================================================
create table if not exists legal_scans (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  asset_name text not null,
  scan_type text not null,   -- audio | visual | trademark
  result text not null,      -- clear | flagged | pending
  detail text,
  action_required text,
  scanned_at timestamptz default now()
);

-- Seed initial scans
insert into legal_scans (brand_id, asset_name, scan_type, result, detail) values
  ('m3k1',   'Already Gone (M3K1 – demo v3)',  'audio',     'clear',   'No copyright matches found'),
  ('fortis',  'Fortis Mane Lion Logo v2',       'visual',    'clear',   'No trademark conflicts detected'),
  ('xrxs',    'Worship snippet – bridge vocal', 'audio',     'flagged', 'Possible match: Hillsong United – Oceans (85% confidence)'),
  ('xrxs',    'XRXS brand name',               'trademark', 'clear',   'No USPTO conflicts on XRXS in music/apparel classes'),
  ('m3k1',    'M3K1 brand name',               'trademark', 'clear',   'No USPTO conflicts on M3K1 in music/apparel classes'),
  ('fortis',  'Fortis Mane brand name',        'trademark', 'pending', 'USPTO search in progress...')
on conflict do nothing;

-- ============================================================
-- MERCH PRODUCTS
-- ============================================================
create table if not exists merch_products (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  name text not null,
  printful_id text,
  shopify_id text,
  status text not null default 'draft',  -- draft | review | live | archived
  base_cost numeric(10,2),
  sale_price numeric(10,2),
  units_sold integer default 0,
  revenue numeric(10,2) default 0,
  image_url text,
  design_prompt text,
  created_at timestamptz default now()
);

-- Seed initial products
insert into merch_products (brand_id, name, status, sale_price, units_sold, revenue) values
  ('m3k1',        'M3K1 Logo Tee',              'live',   25.00, 12, 156.00),
  ('fortis',      'Fortis Mane Hoodie – Black', 'live',   65.00,  7, 245.00),
  ('xrxs',        'XRXS Refiner Lyric Tee',     'review', 28.00,  0,   0.00),
  ('fortis',      'Fortis Mane Water Bottle',   'live',   35.00,  3,  89.00),
  ('philosopher', 'Philosopher Stoned Mug',      'draft',  22.00,  0,   0.00)
on conflict do nothing;

-- ============================================================
-- FINANCE ENTRIES
-- ============================================================
create table if not exists finance_entries (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  type text not null,        -- income | expense
  category text not null,    -- streams | merch | youtube | platform | automation | ai | ads
  description text not null,
  amount numeric(10,2) not null,
  entry_date date not null default current_date,
  created_at timestamptz default now()
);

-- Seed initial finance entries
insert into finance_entries (brand_id, type, category, description, amount, entry_date) values
  ('m3k1',   'income',  'streams',    'Spotify royalties – M3K1',          18.00, '2026-05-01'),
  ('xrxs',   'income',  'streams',    'Spotify royalties – XRXS',          10.00, '2026-05-01'),
  ('fortis',  'income',  'merch',      'Merch – Fortis Hoodie',             87.00, '2026-05-15'),
  ('philosopher', 'income', 'youtube', 'YouTube AdSense',                  14.00, '2026-05-01'),
  (null,      'expense', 'platform',   'Printful base cost',               -24.00, '2026-05-01'),
  (null,      'expense', 'platform',   'Shopify subscription',              -9.00, '2026-05-01'),
  (null,      'expense', 'automation', 'n8n self-hosted VPS',               -6.00, '2026-05-01'),
  (null,      'expense', 'ai',         'Midjourney subscription',           -3.00, '2026-05-01')
on conflict do nothing;

-- ============================================================
-- GENERATED CONTENT (AI outputs — Studio + Content Factory)
-- ============================================================
create table if not exists generated_content (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  content_type text not null,   -- hook | verse | caption | merch_prompt | vsl | thumbnail | ad_copy
  prompt text,
  output text not null,
  model text default 'claude-sonnet-4-6',
  used boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- MERCH DESIGN JOBS (Content Factory pipeline)
-- ============================================================
create table if not exists merch_design_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  brief text not null,
  image_prompt text,
  image_url text,
  scan_result text,             -- pending | clear | flagged
  scan_detail text,
  printful_product_id text,
  shopify_product_id text,
  status text not null default 'queued',  -- queued | generating | scanning | uploading | live | failed
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- VIDEO JOBS (Content Factory — UGC/VSL pipeline)
-- ============================================================
create table if not exists video_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  job_type text not null,       -- ugc | vsl | thumbnail | ad_video
  script text,
  voiceover_url text,
  video_url text,
  thumbnail_url text,
  status text not null default 'queued',  -- queued | scripting | voiceover | generating | editing | ready | failed
  error text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PLATFORM SNAPSHOTS (daily follower/stats cache)
-- ============================================================
create table if not exists platform_snapshots (
  id uuid primary key default gen_random_uuid(),
  brand_id text references brands(id),
  platform text not null,
  followers integer,
  reach integer,
  impressions integer,
  engagement_rate numeric(5,2),
  snapshot_date date not null default current_date,
  raw jsonb default '{}',
  created_at timestamptz default now(),
  unique(brand_id, platform, snapshot_date)
);

-- ============================================================
-- ROW LEVEL SECURITY (enable for all tables)
-- ============================================================
alter table brands              enable row level security;
alter table brand_links         enable row level security;
alter table content_queue       enable row level security;
alter table assets              enable row level security;
alter table legal_scans         enable row level security;
alter table merch_products      enable row level security;
alter table finance_entries     enable row level security;
alter table generated_content   enable row level security;
alter table merch_design_jobs   enable row level security;
alter table video_jobs          enable row level security;
alter table platform_snapshots  enable row level security;

-- Allow full access via service role key (used server-side only)
-- Public anon read for brands
create policy "Public brands read" on brands for select using (true);

-- Service role bypass for all tables (server-side API routes use service key)
-- These policies allow your Next.js API routes full access
create policy "Service full access content_queue"      on content_queue      using (true) with check (true);
create policy "Service full access assets"             on assets             using (true) with check (true);
create policy "Service full access legal_scans"        on legal_scans        using (true) with check (true);
create policy "Service full access merch_products"     on merch_products     using (true) with check (true);
create policy "Service full access finance_entries"    on finance_entries    using (true) with check (true);
create policy "Service full access generated_content"  on generated_content  using (true) with check (true);
create policy "Service full access merch_design_jobs"  on merch_design_jobs  using (true) with check (true);
create policy "Service full access video_jobs"         on video_jobs         using (true) with check (true);
create policy "Service full access platform_snapshots" on platform_snapshots using (true) with check (true);
create policy "Service full access brand_links"        on brand_links        using (true) with check (true);
