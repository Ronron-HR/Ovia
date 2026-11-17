/**
 * Heroens O: stillbillede og kontrolbilleder. Kræver `npm run dev` (http://localhost:5173).
 *
 *   node scripts/hero-o.mjs poster            src/assets/hero/ovia-o.{avif,webp}: pose ved t = 0
 *                                               (samme billede som første frame i animationen)
 *   node scripts/hero-o.mjs sheet <fil.png>   kontaktark med 10 frames over loopet (hvid baggrund)
 *   node scripts/hero-o.mjs frame <t> <fil.png> [w h]   én frame i stor størrelse (hvid baggrund)
 */
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:5173'
const [mode, ...args] = process.argv.slice(2)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
page.on('pageerror', (e) => console.error('sidefejl:', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('konsol:', m.text()))

const open = async (w, h, dpr) => {
  await page.goto(`${SITE}/scripts/hero-o/?w=${w}&h=${h}&dpr=${dpr}`, { waitUntil: 'networkidle0' })
  await page.waitForFunction('window.ready === true', { timeout: 60000 })
}
const shot = async (t) => {
  const url = await page.evaluate((tt) => window.renderAt(tt), t)
  return Buffer.from(url.split(',')[1], 'base64')
}
const onWhite = (buf) => sharp(buf).flatten({ background: '#ffffff' })

if (mode === 'poster') {
  // 480 × 520 CSS-px i 2× = skarpt på retina; samme forhold som pladsen i heroen.
  await open(480, 520, 2)
  const png = await shot(0)
  mkdirSync('src/assets/hero', { recursive: true })
  await sharp(png).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile('src/assets/hero/ovia-o.webp')
  await sharp(png).avif({ quality: 62, effort: 7 }).toFile('src/assets/hero/ovia-o.avif')
  console.log('Stillbillede gemt i src/assets/hero/')
} else if (mode === 'sheet') {
  const out = args[0] ?? 'docs/hero-o/sheet.png'
  const w = 360
  const h = 390
  await open(w, h, 1)
  const tiles = []
  for (let i = 0; i < 10; i++) tiles.push(await onWhite(await shot(i * 0.5)).png().toBuffer())
  mkdirSync(dirname(out), { recursive: true })
  await sharp({ create: { width: w * 5, height: h * 2, channels: 3, background: '#ffffff' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % 5) * w, top: Math.floor(i / 5) * h })))
    .png()
    .toFile(out)
  console.log(`Kontaktark (t = 0, 0.5 … 4.5 s) gemt i ${out}`)
} else if (mode === 'frame') {
  const [t, out, w = 900, h = 975] = args
  await open(Number(w), Number(h), 1)
  mkdirSync(dirname(out), { recursive: true })
  await onWhite(await shot(Number(t))).png().toFile(out)
  console.log(`Frame t=${t} gemt i ${out}`)
} else {
  console.error('Brug: poster | sheet <fil> | frame <t> <fil> [w h]')
  process.exitCode = 1
}
await browser.close()
