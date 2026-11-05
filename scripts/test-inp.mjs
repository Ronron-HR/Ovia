/**
 * INP i beregneren på en langsom telefon: 4× CPU-throttling, Moto G-agtig skærm, ægte tryk.
 *
 * Kræver en kørende `npm run preview` og Chrome. Måler hver interaktion med Event Timing API
 * (samme kilde som Chrome bruger til INP: tid fra tryk til næste billede er malet) og fejler,
 * hvis den værste ligger over 200 ms.
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const LIMIT = 200
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 412, height: 823, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 })
await page.emulateCPUThrottling(4)
await page.goto(SITE + '/', { waitUntil: 'networkidle0' })
await wait(600)

async function arm() {
await page.evaluate(() => {
  window.__inp = []
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (e.interactionId) window.__inp.push({
        name: e.name,
        duration: e.duration,
        target: (e.target?.textContent ?? '').replace(/\s+/g, ' ').slice(0, 28),
        delay: Math.round(e.processingStart - e.startTime),
        proc: Math.round(e.processingEnd - e.processingStart),
        present: Math.round(e.startTime + e.duration - e.processingEnd),
      })
  }).observe({ type: 'event', durationThreshold: 16, buffered: true })
  document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' })
})
await wait(500)
}
await arm()
const all = []

async function tap(text) {
  const box = await page.evaluate((text) => {
    const el = [...document.querySelectorAll('#prisberegner button, #prisberegner [role="button"]')].find(
      (b) => ((b.getAttribute('aria-label') ?? '') + ' ' + b.textContent.replace(/\s+/g, ' ')).includes(text) && b.offsetParent !== null && !b.closest('[inert]'),
    )
    if (!el) return null
    el.scrollIntoView({ block: 'center', behavior: 'instant' })
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, text)
  if (!box) throw new Error(`fandt ikke "${text}"`)
  await page.touchscreen.tap(box.x, box.y)
  await wait(700)
}

// Et realistisk forløb: vælg pakke, systemer, tilvalg og intropris, åbn og luk kvitteringen, guidet hjælp.
for (const t of ['Start', 'Max', 'Anbefalet', 'Næste: Vælg systemer', 'Bordbooking', 'Gavekort', 'Gavekort', 'Flere skræddersyede systemer', 'Færre skræddersyede systemer', 'Næste: Tilvalg', 'Engelsk version', 'Introduktionspris', 'Se kvittering', 'Luk', 'Se opsummering']) {
  try {
    await tap(t)
  } catch (e) {
    console.log('  (springer over: ' + e.message + ')')
  }
}
await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))
// Guidet hjælp på en frisk side.
all.push(...(await page.evaluate(() => window.__inp)))
await page.goto(SITE + '/', { waitUntil: 'networkidle0' })
await wait(600)
await arm()
for (const t of ['Hjælp mig med at vælge', 'Op til 6 sider', 'Bordbooking', 'Gavekort', 'Næste spørgsmål', 'Nej', 'Se opsummering']) {
  try {
    await tap(t)
  } catch (e) {
    console.log('  (springer over: ' + e.message + ')')
  }
}

const entries = all.concat(await page.evaluate(() => window.__inp))
// Pr. interaktion: den længste hændelse (pointerdown/up/click hører til samme tryk).
const worst = entries.sort((a, b) => b.duration - a.duration)
const inp = worst.length > 1 ? worst[Math.min(worst.length - 1, Math.floor(worst.length * 0.02))].duration : (worst[0]?.duration ?? 0)
console.log(`Interaktioner målt: ${entries.length}`)
console.log('Langsomste:', worst.slice(0, 5).map((e) => `${e.name} "${e.target}" ${Math.round(e.duration)} ms (venter ${e.delay}, kode ${e.proc}, maling ${e.present})`).join(' | ') || 'ingen over 16 ms')
console.log(`INP (4× CPU-throttling): ${Math.round(inp)} ms (grænse ${LIMIT} ms)`)
await browser.close()
process.exit(worst[0] && worst[0].duration > LIMIT ? 1 : 0)
