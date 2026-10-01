/**
 * Browsertest af prisberegnerens forvalg (fx Marketing på /marketing/).
 *
 *   npm run build && npm run preview     (i et andet vindue)
 *   npm run test:e2e
 *
 * Kræver puppeteer-core (npm i --no-save puppeteer-core) og Chrome. Kører
 * under mobilemulering (390 px) med rigtige touch-events (tap). Fem gange i
 * træk: fravælg forvalget, genindlæs, vælg det igen og fravælg igen. Efter
 * hvert tryk tjekkes, at siden svarer inden for 2 sekunder, at valget og
 * adresselinjen passer, og at adresselinjen er skrevet præcis én gang pr.
 * tryk (flere skrivninger ville betyde en løkke mellem tilstand og URL).
 *
 * Fanen holdes forrest (bringToFront): i en baggrundsfane sætter Chrome
 * animation frames på pause, og så hænger puppeteers klik/tap, selv om siden
 * svarer. Det var årsagen til hængningen i en tidligere test.
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const PAGE = `${SITE}/marketing/`
const ROUNDS = 5

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 15000 })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// Tæller skrivninger til adresselinjen (sat før sidens egne scripts).
await page.evaluateOnNewDocument(() => {
  window.__urlWrites = 0
  const replace = history.replaceState.bind(history)
  history.replaceState = (...args) => {
    window.__urlWrites++
    return replace(...args)
  }
})

/** Svarer siden? (fejler, hvis hovedtråden er blokeret i mere end 2 s) */
const responsive = () =>
  Promise.race([
    page.evaluate(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
  ])

const state = () =>
  page.evaluate(() => ({
    search: location.search,
    checked: [...document.querySelectorAll('#beregner input[name=ydelser]:checked')].map((i) => i.value),
    writes: window.__urlWrites,
  }))

async function tapMarketing() {
  await page.$eval('#beregner', (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const label = await page.$('#beregner label.choice:has(input[value=marketing])')
  const before = (await state()).writes
  await label.tap()
  await new Promise((r) => setTimeout(r, 150))
  check(await responsive(), 'siden svarer ikke efter tryk')
  const after = await state()
  check(after.writes - before === 1, `adresselinjen skrevet ${after.writes - before} gange for ét tryk (forventet 1)`)
  return after
}

for (let round = 1; round <= ROUNDS; round++) {
  await page.bringToFront()
  await page.goto(PAGE, { waitUntil: 'networkidle0' })
  let s = await state()
  check(s.checked.join() === 'marketing' && s.search === '', `omgang ${round}: forvalget mangler ved start (${JSON.stringify(s)})`)

  s = await tapMarketing()
  check(s.checked.length === 0 && s.search === '?ydelser=', `omgang ${round}: fravalg virkede ikke (${JSON.stringify(s)})`)

  await page.reload({ waitUntil: 'networkidle0' })
  check(await responsive(), `omgang ${round}: siden svarer ikke efter genindlæsning`)
  s = await state()
  check(s.checked.length === 0, `omgang ${round}: fravalget blev ikke husket efter genindlæsning (${JSON.stringify(s)})`)

  s = await tapMarketing()
  check(s.checked.join() === 'marketing', `omgang ${round}: genvalg virkede ikke (${JSON.stringify(s)})`)

  s = await tapMarketing()
  check(s.checked.length === 0 && s.search === '?ydelser=', `omgang ${round}: andet fravalg virkede ikke (${JSON.stringify(s)})`)
  console.log(`  omgang ${round}: ok`)
}

await browser.close()
if (errors.length) failures.push(...errors.map((e) => `sidefejl: ${e}`))
if (failures.length) {
  console.error(`Browsertest FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`Browsertest bestået: ${ROUNDS} omgange med fravalg, genindlæsning og fravalg igen (touch, 390 px).`)
