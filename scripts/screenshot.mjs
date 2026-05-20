import puppeteer from "puppeteer"
import { mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "../docs/screenshots")
mkdirSync(OUT, { recursive: true })

const PAGES = [
  { slug: "lobby",      label: "Lobby",       path: "/lobby" },
  { slug: "studio",     label: "Studio",      path: "/studio" },
  { slug: "production", label: "Production",  path: "/production" },
  { slug: "legal",      label: "Legal",       path: "/legal" },
  { slug: "merch",      label: "Merch",       path: "/merch" },
  { slug: "marketing",  label: "Marketing",   path: "/marketing" },
  { slug: "finance",    label: "Finance",     path: "/finance" },
  { slug: "boardroom",  label: "Boardroom",   path: "/boardroom" },
  { slug: "automation", label: "Automation",  path: "/automation" },
  { slug: "settings",   label: "Settings",    path: "/settings" },
]

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  defaultViewport: { width: 1440, height: 900 },
})

console.log("Taking screenshots...")

for (const page of PAGES) {
  const tab = await browser.newPage()
  await tab.goto(`http://localhost:3001${page.path}`, { waitUntil: "networkidle0", timeout: 15000 })
  await new Promise(r => setTimeout(r, 800)) // let charts animate in
  const file = join(OUT, `${page.slug}.png`)
  await tab.screenshot({ path: file, fullPage: false })
  console.log(`  ✓ ${page.label} → docs/screenshots/${page.slug}.png`)
  await tab.close()
}

await browser.close()
console.log("\nDone.")
