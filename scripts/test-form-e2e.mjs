/**
 * Browsertest af "Send din forespørgsel" (390 px, touch) mod `npm run preview`.
 * Serveren (/api/henvendelse) efterlignes med request interception; workeren
 * selv testes i scripts/test-inquiry.mjs.
 *
 * Tjekker:
 * - ugyldigt input: ingen request, fejltekst ved feltet, fokus i feltet
 * - honeypot-feltet er skjult og ikke i tab-rækkefølgen
 * - "Tak" vises først, NÅR serveren har svaret OK (ikke mens den svarer)
 * - serverfejl (500) og { ok: false }: fejltekst med telefonnummeret, ingen tak
 * - requesten indeholder kontakt, navn, besked (valgfri, højst 1.000 tegn) og linket med valgene
 * - ved en serverfejl står alle felter og valg uændrede, og teksten siger, at det er en forespørgsel, ikke en bestilling
 * - Lokal (løbende samarbejde): vilkårene står FØR formularen
 * - Ring og SMS står som sekundære links
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const RESULT = `${SITE}/priser/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4`
const LOKAL = `${SITE}/priser/?ydelser=lokal&system=nej&trin=3`

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 15000 })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// Efterlignet server: svaret styres pr. test; et svar kan holdes tilbage.
let reply = { status: 200, body: { ok: true } }
let hold = null
const requests = []
await page.setRequestInterception(true)
page.on('request', async (req) => {
  if (!req.url().endsWith('/api/henvendelse')) return req.continue()
  requests.push(JSON.parse(req.postData()))
  if (hold) await hold
  req.respond({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) })
})

const form = () =>
  page.evaluate(() => {
    const box = document.querySelector('#beregner .send')
    return {
      text: box?.textContent ?? '',
      thanks: /Tak\. Jeg svarer/.test(box?.textContent ?? ''),
      alert: document.querySelector('#beregner .send [role=alert]')?.textContent.trim() ?? '',
      invalid: document.querySelector('#beregner input[name=contact]')?.getAttribute('aria-invalid'),
      focused: document.activeElement?.name ?? document.activeElement?.tagName,
      values: { contact: document.querySelector('#beregner input[name=contact]')?.value, name: document.querySelector('#beregner input[name=name]')?.value, message: document.querySelector('#beregner textarea[name=message]')?.value },
      search: location.pathname + location.search,
    }
  })

async function open() {
  await page.bringToFront()
  await page.goto(RESULT, { waitUntil: 'networkidle0' })
  requests.length = 0
}

async function fill(contact, name = '', message = '') {
  const c = await page.waitForSelector('#beregner input[name=contact]')
  await c.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await c.tap()
  await page.keyboard.type(contact)
  if (name) {
    await (await page.$('#beregner input[name=name]')).tap()
    await page.keyboard.type(name)
  }
  if (message) {
    await (await page.$('#beregner textarea[name=message]')).tap()
    await page.keyboard.type(message)
  }
  await (await page.$('#beregner .send button[type=submit]')).tap()
  await wait(150)
}

// Opbygning: overskrift, felter, knap, Ring/SMS og honeypot.
await open()
{
  const ui = await page.evaluate(() => {
    const box = document.querySelector('#beregner .send')
    const trap = box.querySelector('input[name=website]')
    const r = trap.getBoundingClientRect()
    return {
      title: box.querySelector('h3')?.textContent.trim(),
      labels: [...box.querySelectorAll('label[for]')].map((l) => l.textContent.trim()),
      button: box.querySelector('button[type=submit]')?.textContent.trim(),
      tel: Boolean(box.querySelector('a[href^="tel:"]')),
      sms: Boolean(box.querySelector('a[href^="sms:"]')),
      mailto: Boolean(box.querySelector('a[href^="mailto:"]')),
      trapHidden: trap.tabIndex === -1 && r.right <= 0,
      newsletter: /nyhedsbrev/i.test(box.textContent),
      messageMax: box.querySelector('textarea[name=message]')?.maxLength,
      messageHelp: /bruger den kun til at forstå din forespørgsel/.test(box.textContent),
      requestNotOrder: /forespørgsel, ikke en bestilling/.test(box.textContent),
    }
  })
  check(ui.title === 'Send din forespørgsel', `overskrift: ${ui.title}`)
  check(ui.labels[0] === 'Din mail eller dit telefonnummer' && ui.labels[1]?.startsWith('Navn / virksomhed') && ui.labels[2]?.startsWith('Besked'), `labels: ${ui.labels}`)
  check(ui.messageMax === 1000 && ui.messageHelp && ui.requestNotOrder, `beskedfelt (maks ${ui.messageMax}, hjælp ${ui.messageHelp}) eller teksten om forespørgsel/bestilling mangler`)
  check(ui.button === 'Send til Ronny', `knap: ${ui.button}`)
  check(ui.tel && ui.sms && !ui.mailto, 'Ring/SMS mangler, eller mailto står stadig')
  check(ui.trapHidden, 'honeypot-feltet er synligt eller kan nås med tab')
  check(!ui.newsletter, 'nyhedsbrev nævnt i formularen')
}

// Ugyldigt input: intet sendes.
for (const bad of ['abc', '1234567', 'ronny@example']) {
  await open()
  await fill(bad)
  const f = await form()
  check(requests.length === 0, `ugyldigt "${bad}": sendt alligevel`)
  check(f.invalid === 'true' && f.focused === 'contact' && !f.thanks, `ugyldigt "${bad}": ${JSON.stringify(f)}`)
}

// OK fra serveren: tak først, når svaret er kommet.
await open()
let release
hold = new Promise((r) => (release = r))
reply = { status: 200, body: { ok: true } }
await fill('+45 53 61 36 99', 'Café Test', 'Vi er 20 personer og vil gerne høre om Lokal.')
await wait(400)
let f = await form()
check(!f.thanks, 'tak vist, før serveren har svaret')
check(/Sender/.test(f.text), 'knappen viser ikke "Sender …" mens der ventes')
release()
hold = null
await wait(300)
f = await form()
check(f.thanks, `ingen tak efter OK: ${JSON.stringify(f)}`)
check(requests.length === 1, `${requests.length} requests for ét tryk`)
const sent = requests[0] ?? {}
check(sent.contact === '+45 53 61 36 99' && sent.name === 'Café Test' && sent.message === 'Vi er 20 personer og vil gerne høre om Lokal.' && sent.website === '', `request: ${JSON.stringify(sent)}`)
check(sent.link?.startsWith('/priser/?ydelser=hjemmeside') && sent.link.includes('sider=2-5') && sent.link.includes('drift=plus') && !sent.link.includes('example'), `link: ${sent.link}`)

// Fejl fra serveren: ingen tak, telefonnummeret står.
for (const r of [
  { status: 500, body: { ok: false, error: 'store_failed' } },
  { status: 503, body: { ok: false, error: 'not_configured' } },
  { status: 200, body: { ok: false } },
]) {
  await open()
  reply = r
  await fill('kunde@example.com', 'Café', 'Besked, der skal blive stående')
  await wait(300)
  f = await form()
  check(!f.thanks, `tak vist ved ${r.status} ${JSON.stringify(r.body)}`)
  check(/^Det blev ikke sendt\. Dine valg og din besked står stadig her\. Ring på 53 61 36 99, så tager jeg den derfra\.$/.test(f.alert), `fejltekst ved ${r.status}: "${f.alert}"`)
  check(f.values.contact === 'kunde@example.com' && f.values.name === 'Café' && f.values.message === 'Besked, der skal blive stående' && f.search === RESULT.slice(SITE.length), `felter eller valg mistet efter fejl ${r.status}: ${JSON.stringify(f.values)} ${f.search}`)
}

// Lokal: vilkårene (opstart, månedspris, minimum, eksterne udgifter, overdragelse) står før formularen.
{
  await page.bringToFront()
  await page.goto(LOKAL, { waitUntil: 'networkidle0' })
  const order = await page.evaluate(() => {
    const terms = document.querySelector('#beregner [data-lokal-terms]')
    const form = document.querySelector('#beregner .send')
    return {
      terms: terms?.textContent ?? '',
      before: !!terms && !!form && Boolean(terms.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING),
      total: document.querySelector('#beregner [data-lokal-minimum]')?.textContent ?? '',
    }
  })
  check(order.before, 'Lokal: vilkårene står ikke før formularen')
  for (const want of ['Opstart', '1.990', 'Minimumsperiode', '11.940', 'Eksterne udgifter', 'filer', 'frikøb']) check(order.terms.includes(want), `Lokal-vilkår mangler "${want}"`)
  check(/mindst 6 mdr\. = mindst 11\.940 kr\./.test(order.total), `Lokal-minimum: "${order.total}"`)
}

await browser.close()
if (errors.length) failures.push(...errors.map((e) => `sidefejl: ${e}`))
if (failures.length) {
  console.error(`Formulartest FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Formulartest bestået: ugyldigt input, honeypot, tak kun efter OK, fejl med telefonnummer (touch, 390 px).')
