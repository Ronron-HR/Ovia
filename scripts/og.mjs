/**
 * Delingsbilledet (public/og.jpg, 1200 × 630).
 *
 *   npm i --no-save puppeteer-core
 *   npm run og
 *
 * Tegnes ud fra scripts/og/og.html i sidens egne skrifter. Motivet er heroens
 * konceptillustration (tegnet til siden, ingen fotos eller logoer fra
 * virksomheder), taget direkte fra den byggede side og mærket
 * "Konceptillustration", så mærkningen følger med, når siden deles.
 *
 * Kræver, at den byggede side kører:
 *   npm run build && npm run preview     (i et andet vindue)
 * Kør igen, hvis farver, logo eller heroens motiv ændres (og `npm run brand`
 * først, hvis logoet er ændret).
 */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const CHROME =
  process.env.CHROME ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

const SITE = process.env.SITE ?? 'http://localhost:4173/'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

// 1. Heroens motiv, taget fra den byggede side.
const shot = await browser.newPage()
await shot.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await shot.goto(SITE, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2200))
const art = await shot.$('.hero-inner')
await art.screenshot({ path: 'scripts/og/hero.png' })
await shot.close()

// 2. Delingsbilledet.
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
await page.goto(pathToFileURL(resolve('scripts/og/og.html')).href, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
const png = await page.screenshot()
await browser.close()

await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og.jpg')
console.log('  public/og.jpg  1200x630')
