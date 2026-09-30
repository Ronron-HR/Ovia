/**
 * Delingsbilledet (public/og.jpg, 1200 × 630).
 *
 *   npm i --no-save puppeteer-core
 *   npm run og
 *
 * Tegnes ud fra scripts/og/og.html i sidens egne skrifter. Motivet er
 * skærmbilleder af to af de fiktive demoer (public/demoer, se
 * `npm run demo-shots`), mærket "Fiktive demoer", så mærkningen følger med,
 * når siden deles. Ingen fotos, logoer eller materiale fra rigtige virksomheder.
 *
 * Kør igen, hvis farver, logo, tekst eller demoerne ændres (og `npm run brand`
 * først, hvis logoet er ændret).
 */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const CHROME =
  process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

// Delingsbilledet. Motivet er skærmbilleder af de fiktive demoer (public/demoer).
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
await page.goto(pathToFileURL(resolve('scripts/og/og.html')).href, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
const png = await page.screenshot()
await browser.close()

await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og.jpg')
console.log('  public/og.jpg  1200x630')
