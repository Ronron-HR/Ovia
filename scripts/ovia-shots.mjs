/**
 * Skærmbilleder af forsiden og beregneren til før/efter-sammenligning.
 * Brug: node scripts/ovia-shots.mjs <mappe> (kræver kørende `npm run preview`).
 * Gemmer 375, 768 og 1440 px (100 % zoom): forside, resultat og demo-sektion.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const dir = process.argv[2] ?? 'docs/shots'
mkdirSync(dir, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (const width of [375, 768, 1440]) {
  const page = await browser.newPage()
  await page.setViewport({ width, height: width < 768 ? 812 : 900, isMobile: width < 768, hasTouch: width < 768 })
  await page.goto(`${SITE}/`, { waitUntil: 'networkidle0' })
  await wait(600)
  await page.screenshot({ path: `${dir}/${width}-forside-top.png` })
  await page.screenshot({ path: `${dir}/${width}-forside-hel.png`, fullPage: true })
  await page.goto(`${SITE}/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4`, { waitUntil: 'networkidle0' })
  await wait(600)
  await page.evaluate(() => document.querySelector('#beregner')?.scrollIntoView())
  await wait(300)
  await page.screenshot({ path: `${dir}/${width}-resultat.png` })
  await page.close()
}
await browser.close()
console.log(`Skærmbilleder gemt i ${dir}`)
