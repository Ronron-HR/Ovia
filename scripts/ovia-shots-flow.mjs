/**
 * Skærmbilleder af driftvalg, prisresultat, rundvisning og eksempler (375, 768, 1440 px).
 * Brug: node scripts/ovia-shots-flow.mjs <mappe> (kræver kørende `npm run preview`).
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const dir = process.argv[2] ?? 'docs/shots-efter'
mkdirSync(dir, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (const width of [375, 768, 1440]) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport({ width, height: width < 768 ? 812 : 900, isMobile: width < 768, hasTouch: width < 768 })
  const toCalc = async () => {
    await page.evaluate(() => document.querySelector('#beregner')?.scrollIntoView())
    await wait(400)
  }
  await page.goto(`${SITE}/?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=3`, { waitUntil: 'networkidle0' })
  await wait(600)
  await toCalc()
  await page.screenshot({ path: `${dir}/${width}-driftvalg.png` })
  await page.goto(`${SITE}/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4`, { waitUntil: 'networkidle0' })
  await wait(600)
  await toCalc()
  await page.screenshot({ path: `${dir}/${width}-prisresultat.png` })
  await page.goto(`${SITE}/`, { waitUntil: 'networkidle0' })
  await wait(600)
  await page.evaluate(() => document.querySelector('#eksempler')?.scrollIntoView())
  await wait(900)
  await page.screenshot({ path: `${dir}/${width}-eksempler.png` })
  await page.evaluate(() => window.scrollTo(0, 0))
  await wait(300)
  await page.evaluate(() => document.querySelector('[data-tour-launcher]')?.click())
  await wait(1200)
  await page.screenshot({ path: `${dir}/${width}-rundvisning-1.png` })
  for (const n of [2, 3]) {
    await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => /Næste/.test(b.textContent))?.click())
    await wait(900)
    await page.screenshot({ path: `${dir}/${width}-rundvisning-${n}.png` })
  }
  await ctx.close()
}
await browser.close()
console.log(`Skærmbilleder gemt i ${dir}`)
