/**
 * Browsertest af pakkevælgeren i beregnerens resultat (390 px, touch).
 *
 *   npm run build && npm run preview     (i et andet vindue)
 *   npm run test:e2e
 *
 * Hjemmeside: svar 6-8 sider (Fuld fart) og driften Plus (eget trin), skift til Vækst
 * i resultatet, genindlæs, og tjek at resultatet er Vækst, at adresselinjen siger 2-5
 * sider og stadig drift=plus (pakkeskiftet overskriver ikke driftsvalget), og at
 * "Ret svarene" viser 2-5 sider (og driften på sit trin). Marketing: 12 videoer, jeg poster,
 * annoncer (Fuld fart) → Vækst → genindlæs → 8 videoer, jeg poster, ingen annoncer.
 * Vælgeren tjekkes også for legend, radioknapper og trykflader på mindst 44 px.
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 15000 })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function tap(selector) {
  const el = await page.waitForSelector(selector, { timeout: 3000 })
  await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await el.tap()
  await wait(120)
}

/** Svarer på det synlige trin og går videre. */
async function answerStep(answers) {
  for (const [name, value] of Object.entries(answers)) await tap(`#beregner label.choice:has(input[name="${name}"][value="${value}"])`)
  await tap('#beregner button[type=submit]')
}

/** Trinene for en ydelse: hjemmesiden har to (siderne og driften). */
async function answerSteps(steps) {
  for (const answers of steps) await answerStep(answers)
}

const result = () =>
  page.evaluate(() => {
    const lines = [...document.querySelectorAll('#beregner li > div > p:first-child')].map((p) => p.textContent.trim())
    const groups = [...document.querySelectorAll('#beregner fieldset')].map((f) => ({
      legend: f.querySelector('legend')?.textContent.trim(),
      checked: f.querySelector('input[type=radio]:checked')?.value,
      heights: [...f.querySelectorAll('.choice-box')].map((b) => Math.round(b.getBoundingClientRect().height)),
      status: f.querySelector('[role=status]')?.textContent.trim(),
    }))
    return { lines, groups, search: location.search }
  })

async function run({ name, service, steps, from, to, expectLine, expectParams }) {
  await page.bringToFront()
  await page.goto(`${SITE}/priser/`, { waitUntil: 'networkidle0' })
  await tap(`#beregner label.choice:has(input[name=ydelser][value=${service}])`)
  await tap('#beregner button[type=submit]')
  await answerSteps(steps)

  let r = await result()
  check(r.lines.some((l) => l.endsWith(from)), `${name}: forventede ${from} efter svarene (${JSON.stringify(r.lines)})`)
  const group = r.groups[0]
  check(group?.legend?.startsWith('Skift pakke'), `${name}: pakkevælgeren mangler legend (${JSON.stringify(group)})`)
  check(group?.heights.length === 3 && group.heights.every((h) => h >= 44), `${name}: trykflader under 44 px (${group?.heights})`)

  await tap(`#beregner label.choice:has(input[name="pakke-${service}"][value="${to.id}"])`)
  r = await result()
  check(r.lines.some((l) => l.endsWith(to.name)), `${name}: skiftet viste ikke ${to.name} (${JSON.stringify(r.lines)})`)
  check(r.groups[0]?.status?.startsWith('Nu:'), `${name}: ingen "Nu:"-linje efter skiftet (${r.groups[0]?.status})`)

  await page.reload({ waitUntil: 'networkidle0' })
  r = await result()
  const params = new URLSearchParams(r.search)
  check(r.lines.some((l) => l === expectLine), `${name}: efter genindlæsning forventede "${expectLine}" (${JSON.stringify(r.lines)})`)
  check(r.groups[0]?.checked === to.id, `${name}: ${to.name} er ikke markeret efter genindlæsning`)
  for (const [k, v] of Object.entries(expectParams)) {
    check(params.get(k) === v, `${name}: adresselinjen ${k}=${params.get(k)} (forventet ${v}) — ${r.search}`)
  }

  // Svarene passer også, når man går tilbage og retter dem (hvert trin viser sine svar).
  await page.evaluate(() => [...document.querySelectorAll('#beregner button.calc-link')].find((b) => b.textContent.trim() === 'Ret svarene').click())
  await wait(150)
  const checkedNow = () =>
    page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#beregner input[type=radio]:checked')].map((i) => [i.name, i.value])))
  let shown = await checkedNow()
  for (let i = 0; i < steps.length; i++) {
    for (const k of Object.keys(steps[i])) {
      if (k in expectParams) check(shown[k] === expectParams[k], `${name}: "Ret svarene" viser ${k}=${shown[k]} (forventet ${expectParams[k]})`)
    }
    if (i < steps.length - 1) {
      await tap('#beregner button[type=submit]')
      shown = await checkedNow()
    }
  }
  console.log(`  ${name}: ok`)
}

await run({
  name: 'Hjemmeside',
  service: 'hjemmeside',
  steps: [{ sider: '6-8', bestilling: 'nej' }, { drift: 'plus' }],
  from: 'Fuld fart',
  to: { id: 'vaekst', name: 'Vækst' },
  expectLine: 'Hjemmeside: Vækst',
  expectParams: { sider: '2-5', bestilling: 'nej', drift: 'plus' },
})

await run({
  name: 'Marketing',
  service: 'marketing',
  steps: [{ videoer: '12', poste: 'ja', annoncer: 'ja' }],
  from: 'Fuld fart',
  to: { id: 'vaekst', name: 'Vækst' },
  expectLine: 'Marketing: Vækst',
  expectParams: { videoer: '8', poste: 'ja', annoncer: 'nej' },
})

await browser.close()
if (errors.length) failures.push(...errors.map((e) => `sidefejl: ${e}`))
if (failures.length) {
  console.error(`Pakkeskift-test FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Pakkeskift-test bestået: hjemmeside og marketing, Fuld fart → Vækst, genindlæst (touch, 390 px).')
