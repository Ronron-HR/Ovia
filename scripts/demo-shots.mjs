/**
 * Skærmbilleder af de fire koncepter til præsentationen (public/demoer).
 *
 *   npm run build && npm run preview     (i et andet vindue)
 *   npm run demo-shots
 *
 * Tager de øverste dele af hver demo direkte fra den byggede side: computer
 * (1440 × 2520, skaleret til 880 bred) og telefon (390 × 1500 ved dobbelt
 * pixeltæthed, skaleret til 340 bred). De er høje, fordi scroll-scenen
 * (components/DemoVisual.jsx) ruller siden igennem sit vindue. Gemmes som WebP:
 *   public/demoer/<id>-desktop.webp  og  public/demoer/<id>-mobile.webp
 * Målene (DESKTOP og MOBILE herunder) skal svare til `desktop` og `mobile` i
 * src/content.demos.js; scriptet fejler, hvis de ikke gør.
 *
 * Kræver puppeteer-core (npm i --no-save puppeteer-core) og en Chrome eller Edge.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const CHROME =
  process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const IDS = ['cafe', 'restaurant', 'salon', 'vinbar']

mkdirSync('public/demoer', { recursive: true })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

for (const id of IDS) {
  for (const [mode, viewport, quality, width] of [
    ['desktop', { width: 1440, height: 2520, deviceScaleFactor: 1 }, 62, 880],
    ['mobile', { width: 390, height: 1500, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 60, 340],
  ]) {
    const page = await browser.newPage()
    // Reduceret bevægelse: indtoningerne er færdige, og illustrationerne står på plads.
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.setViewport(viewport)
    await page.goto(`${SITE}/demoer/${id}/`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)
    const png = await page.screenshot({ type: 'png' })
    const out = `public/demoer/${id}-${mode}.webp`
    const info = await sharp(png).resize({ width }).webp({ quality, effort: 6 }).toFile(out)
    console.log(`${out}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} kB`)
    const want = mode === 'desktop' ? [880, 1540] : [340, 1308]
    if (info.width !== want[0] || info.height !== want[1]) {
      throw new Error(`${out}: målene skal være ${want.join('×')} (se src/content.demos.js)`)
    }
    await page.close()
  }
}

await browser.close()
