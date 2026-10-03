/**
 * Browsertest af indgangen i de fire koncepter (src/demos/useEntrance.js) mod
 * `npm run preview`, på 390 og 1440 px.
 *
 * Tjekker for hvert koncept:
 * - intet i første skærmbillede er skjult (synligt, ingen data-enter)
 * - blokke under skærmen venter (data-enter) og står alle fremme efter scroll
 *   til bunden, og de bliver stående, når man scroller op igen
 * - layoutforskydning under hele scrollet (CLS) ≤ 0,05
 * - prefers-reduced-motion: intet skjules, ingen transition
 * - uden JavaScript: intet skjules
 * - ingen konsolfejl
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const DEMOS = ['cafe', 'restaurant', 'salon', 'vinbar']

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 30000 })
const errors = []

async function newPage(width, { reduced = false, js = true } = {}) {
  const page = await browser.newPage()
  page.on('pageerror', (e) => errors.push(`${page.url()}: ${e}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${page.url()}: ${m.text()}`))
  await page.setViewport({ width, height: width < 768 ? 844 : 900, isMobile: width < 768, hasTouch: width < 768 })
  await page.setJavaScriptEnabled(js)
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  // Layoutforskydninger tælles fra første frame.
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  return page
}

const blocks = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.dm-section .dm-wrap > *, .dm-footer-in > *')].map((n) => {
      const r = n.getBoundingClientRect()
      return { top: r.top + window.scrollY, enter: n.dataset.enter ?? null, opacity: Number(getComputedStyle(n).opacity) }
    }),
  )

for (const width of [390, 1440]) {
  const page = await newPage(width)
  for (const id of DEMOS) {
    const name = `${id} @ ${width}px`
    await page.bringToFront()
    await page.goto(`${SITE}/demoer/${id}/`, { waitUntil: 'networkidle0' })
    await wait(300)
    const fold = await page.evaluate(() => window.innerHeight)
    let list = await blocks(page)
    const firstView = list.filter((b) => b.top < fold)
    check(firstView.every((b) => b.enter === null && b.opacity > 0.5), `${name}: noget i første skærmbillede er skjult`)
    const waiting = list.filter((b) => b.enter === '')
    check(waiting.length > 0, `${name}: ingen blokke venter på at komme ind`)

    // Scroll ned i trin, som en bruger.
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y <= height; y += Math.round(fold * 0.6)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
      await wait(120)
    }
    await wait(900)
    list = await blocks(page)
    check(list.every((b) => b.enter !== '' && b.opacity > 0.5), `${name}: ikke alle blokke er kommet frem efter scroll (${list.filter((b) => b.enter === '' || b.opacity <= 0.5).length} skjult)`)

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await wait(300)
    list = await blocks(page)
    check(list.every((b) => b.enter !== '' && b.opacity > 0.5), `${name}: blokke forsvandt igen ved scroll op`)

    const cls = await page.evaluate(() => window.__cls)
    check(cls <= 0.05, `${name}: CLS ${cls.toFixed(3)} > 0,05`)
    console.log(`  ${name}: ${waiting.length} blokke med indgang, CLS ${cls.toFixed(3)}`)
  }
  await page.close()
}

// Reduceret bevægelse og uden JavaScript: intet skjules.
for (const [label, opts] of [
  ['reduceret bevægelse', { reduced: true }],
  ['uden JavaScript', { js: false }],
]) {
  const page = await newPage(390, opts)
  for (const id of DEMOS) {
    await page.goto(`${SITE}/demoer/${id}/`, { waitUntil: 'networkidle0' })
    await wait(200)
    const list = await blocks(page)
    const hidden = list.filter((b) => b.enter !== null || b.opacity <= 0.5)
    check(hidden.length === 0, `${id}, ${label}: ${hidden.length} blokke skjult`)
  }
  await page.close()
}

await browser.close()
if (errors.length) failures.push(...errors.map((e) => `konsolfejl: ${e}`))
if (failures.length) {
  console.error(`Koncept-test FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Koncept-test bestået: indgang én gang, intet skjult i første billede, CLS ≤ 0,05, reduceret bevægelse og uden JS.')
