/**
 * Browsertest af forespørgselsformularen (mobil 390 × 844 og desktop 1440 × 900).
 *
 * Kræver `npm run build` (dist/) og Chrome. Starter selv en lille lokal server, der serverer dist/ og lader
 * worker/index.js svare på POST /api/henvendelse med en simuleret D1 (SQLite) og en simuleret send_email-binding.
 * Der sendes ALDRIG rigtig mail herfra. Mailene gemmes som .eml i mappen EML=<mappe>, hvis den er sat.
 *
 * Tjekker: formularen hentes først på opsummeringen (lazy), korrekte felter (type, autocomplete, ≥ 48 px),
 * validering, honeypot, sender-tilstand med spinner, sendt-tilstand ("Tak, [navn]"), fejltilstand med Ring og SMS
 * og bevarede valg, at bundbaren er skjult, at Send-knappen kan nås, mens tastaturet er oppe, og at mailen
 * indeholder de rigtige linjer, totaler, Reply-To og del-link.
 */
import { createServer } from 'node:http'
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { extname, join, normalize as pathNormalize } from 'node:path'
import puppeteer from 'puppeteer-core'
import { handleInquiry } from '../worker/index.js'

process.removeAllListeners('warning')
const { DatabaseSync } = await import('node:sqlite')

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SHOTS = process.env.SHOTS
const EML = process.env.EML
for (const d of [SHOTS, EML]) if (d) mkdirSync(d, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

let failed = 0
const check = (ok, msg) => {
  if (!ok) failed++
  console.log(`${ok ? '  ok ' : '  FEJL'} ${msg}`)
}

/* ---- Lokal "Cloudflare": statiske filer + workeren med simuleret D1 og mail --------------------------------- */
const db = new DatabaseSync(':memory:')
db.exec(readFileSync('worker/schema.sql', 'utf8'))
const d1 = {
  prepare(sql) {
    let args = []
    const stmt = {
      bind: (...a) => ((args = a), stmt),
      async run() {
        db.prepare(sql).run(...args)
        return { success: true }
      },
      async all() {
        return { results: db.prepare(sql).all(...args) }
      },
    }
    return stmt
  },
}
class EmailMessage {
  constructor(from, to, raw) {
    Object.assign(this, { from, to, raw })
  }
}
const sim = { mails: [], failMail: false, failRequest: false, delay: 0 }
const env = {
  DB: d1,
  MAIL_FROM: 'kontakt@oviaspecs.com',
  MAIL_TO: 'ronnyhong723@gmail.com',
  SEND_EMAIL: {
    async send(m) {
      if (sim.failMail) throw new Error('simuleret mailfejl')
      sim.mails.push(m)
      if (EML) writeFileSync(join(EML, `forespoergsel-${sim.mails.length}.eml`), m.raw)
    },
  },
  RATE_LIMITER: { limit: async () => ({ success: true }) },
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.png': 'image/png' }
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname === '/api/henvendelse') {
    const body = await new Promise((r) => {
      let b = ''
      req.on('data', (c) => (b += c))
      req.on('end', () => r(b))
    })
    await wait(sim.delay)
    if (sim.failRequest) {
      res.writeHead(500, { 'Content-Type': 'application/json' }).end('{"ok":false}')
      return
    }
    const origin = `http://${req.headers.host}`
    const request = new Request(origin + url.pathname, { method: req.method, headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '203.0.113.9' }, body: req.method === 'POST' ? body : undefined })
    const out = await handleInquiry(request, env, { EmailMessage })
    res.writeHead(out.status, { 'Content-Type': 'application/json' }).end(await out.text())
    return
  }
  let file = join('dist', pathNormalize(decodeURIComponent(url.pathname)))
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(404).end('not found')
    return
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
})
await new Promise((r) => server.listen(0, r))
const SITE = `http://localhost:${server.address().port}`

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const decodeMail = (raw) => {
  const subject = /^Subject: =\?UTF-8\?B\?([^?]+)\?=/m.exec(raw)
  const body = raw.split('\r\n\r\n').slice(1).join('').replace(/\r\n/g, '')
  const utf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))
  return { subject: subject ? utf8(subject[1]) : '', text: utf8(body), replyTo: /^Reply-To: (.*)$/m.exec(raw)?.[1] }
}

async function run(label, width, height, mobile) {
  console.log(`\n${label}`)
  const page = await browser.newPage()
  const errors = []
  const requested = []
  // Svaret 500 er den simulerede serverfejl i fejltilstanden; browseren logger det som en fejl.
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !m.text().includes('status of 500') && errors.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('request', (r) => requested.push(r.url()))
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile })
  const shot = (n) => SHOTS && page.screenshot({ path: `${SHOTS}/${width}-${n}.png` })
  const base = { mails: sim.mails.length, rows: db.prepare('SELECT COUNT(*) n FROM henvendelser').get().n }
  const text = (sel) => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' '))

  // Formularen hentes først, når opsummeringen vises.
  await page.goto(`${SITE}/?w=1&m=1&d=p&bk=1`, { waitUntil: 'networkidle0' })
  check(!requested.some((u) => u.includes('InquiryForm')), 'formularens kode hentes ikke på forsiden (lazy)')
  await page.goto(`${SITE}/?w=1&m=1&d=p&bk=1&s=4`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))
  await page.waitForSelector('form[aria-describedby="inq-intro"]')
  check(requested.some((u) => u.includes('InquiryForm')), 'formularens kode hentes på opsummeringen')
  await shot('form-tom')

  // Felter: type, autocomplete og trykflade.
  const fields = await page.$$eval('#prisberegner form input:not([tabindex="-1"]), #prisberegner form textarea', (els) =>
    els.map((e) => ({ name: e.name, type: e.type, ac: e.autocomplete, h: Math.round(e.getBoundingClientRect().height), fs: parseFloat(getComputedStyle(e).fontSize) })),
  )
  const by = Object.fromEntries(fields.map((f) => [f.name, f]))
  check(by.name?.type === 'text' && by.name.ac === 'name', `navn: type/autocomplete (${JSON.stringify(by.name)})`)
  check(by.phone?.type === 'tel' && by.phone.ac === 'tel', `telefon: tel/tel (${JSON.stringify(by.phone)})`)
  check(by.email?.type === 'email' && by.email.ac === 'email', `mail: email/email (${JSON.stringify(by.email)})`)
  check(by.company?.ac === 'organization' && by.message, 'virksomhed og besked findes')
  check(fields.every((f) => f.h >= 48 && f.fs >= 16), `felter ≥ 48 px høje og ≥ 16 px skrift (${fields.map((f) => f.h).join(', ')})`)
  const btn = await page.$eval('#prisberegner form button[type="submit"]', (e) => Math.round(e.getBoundingClientRect().height))
  check(btn >= 48, `Send-knappen er ≥ 48 px (${btn})`)
  const formText = await text('#prisberegner form')
  check(formText.includes('Send mine valg') && formText.includes('Jeg svarer inden for 24 timer.') && formText.includes('Dine oplysninger bruges kun til at svare dig. Læs privatlivspolitikken.'), 'knaptekst og de to små linjer under knappen')
  check(await page.$eval('#prisberegner form a[href="/privatlivspolitik/"]', () => true), 'link til privatlivspolitikken')
  const links = await page.$$eval('#prisberegner a[href^="tel:"], #prisberegner a[href^="sms:"]', (a) => a.map((x) => x.getAttribute('href').slice(0, 20)))
  check(links.some((l) => l.startsWith('tel:')) && links.some((l) => l.startsWith('sms:')), 'Ring og SMS står under formularen')
  if (mobile) {
    const barH = await page.$eval('#prisberegner [role="button"][aria-label*="kvittering"]', (e) => e.parentElement.getBoundingClientRect().height)
    check(barH === 0, `bundbaren er skjult på opsummeringen (${barH} px)`)
  }

  // Validering.
  const send = () => page.click('#prisberegner form button[type="submit"]')
  await send()
  await wait(200)
  check((await text('#prisberegner form')).includes('Skriv dit navn.'), 'tomt navn giver fejl')
  check(await page.evaluate(() => document.activeElement?.name === 'name'), 'fokus går til første felt med fejl')
  await page.type('#prisberegner input[name="name"]', 'Mette Hansen')
  await send()
  await wait(200)
  check((await text('#prisberegner form')).includes('Skriv et telefonnummer eller en mail'), 'hverken telefon eller mail giver fejl')
  await page.type('#prisberegner input[name="phone"]', '1234')
  await send()
  await wait(200)
  check((await text('#prisberegner form')).includes('dansk telefonnummer med 8 cifre'), 'ugyldigt nummer giver fejl')
  await shot('form-fejl-felt')
  check(sim.mails.length === base.mails, 'intet sendt med ugyldige felter')
  await page.$eval('#prisberegner input[name="phone"]', (e) => (e.value = ''))
  await page.type('#prisberegner input[name="phone"]', '53 61 36 99')
  await page.type('#prisberegner input[name="email"]', 'mette@cafe.example')
  await page.type('#prisberegner input[name="company"]', 'Café Mette')
  await page.type('#prisberegner textarea[name="message"]', 'Hej Ronny.\nVi åbner i foråret.')

  // Tastatur oppe: Send-knappen kan stadig nås (siden får luft under formularen), og intet skjules.
  if (mobile) {
    await page.focus('#prisberegner textarea[name="message"]')
    await page.setViewport({ width, height: 400, isMobile: mobile, hasTouch: mobile })
    await wait(500)
    const reach = await page.$eval('#prisberegner form button[type="submit"]', (e) => {
      e.scrollIntoView({ block: 'center', behavior: 'instant' })
      const r = e.getBoundingClientRect()
      return r.top >= 0 && r.bottom <= window.innerHeight
    })
    check(reach, 'med tastatur oppe (viewport 400 px høj) kan Send-knappen rulles helt ind i billedet')
    await shot('form-tastatur')
    await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile })
    await page.evaluate(() => document.activeElement?.blur())
    await wait(400)
  }

  // Fejltilstand: serveren svarer 500. Valgene står, Ring og SMS er der, og et nyt forsøg kan lykkes.
  sim.failRequest = true
  await send()
  await wait(500)
  const errText = await text('#prisberegner [role="alert"]')
  check(errText.includes('Det blev ikke sendt.') && errText.includes('Ring eller SMS'), `fejltilstand: "${errText.slice(0, 60)}"`)
  check((await page.$eval('#prisberegner input[name="name"]', (e) => e.value)) === 'Mette Hansen', 'fejl: indtastede værdier er bevaret')
  check((await page.$$('#prisberegner a[href^="tel:"]')).length >= 1, 'fejl: Ring står der stadig')
  await shot('form-fejl')
  check(sim.mails.length === base.mails && db.prepare('SELECT COUNT(*) n FROM henvendelser').get().n === base.rows, 'fejl: intet sendt eller gemt')
  sim.failRequest = false

  // Sender-tilstand og sendt-tilstand.
  sim.delay = 900
  await send()
  await wait(250)
  const sending = await page.$eval('#prisberegner form button[type="submit"]', (e) => ({ disabled: e.disabled, busy: e.getAttribute('aria-busy'), text: e.textContent, spinner: !!e.querySelector('.animate-spin') }))
  check(sending.disabled && sending.busy === 'true' && sending.spinner && sending.text.includes('Sender'), `sender: knap deaktiveret med spinner (${JSON.stringify(sending)})`)
  await shot('form-sender')
  await page.waitForFunction(() => document.querySelector('#prisberegner [role="status"]')?.textContent.includes('Tak,'), { timeout: 8000 })
  sim.delay = 0
  const thanks = await text('#prisberegner [role="status"]')
  check(thanks.includes('Tak, Mette Hansen.') && thanks.includes('Jeg vender tilbage inden for 24 timer.'), `sendt: "${thanks.slice(0, 70)}"`)
  const sums = await page.$$eval('#prisberegner [role="status"] [role="img"][aria-label]', (els) => els.map((e) => e.getAttribute('aria-label')))
  check(thanks.includes('Hjemmeside') && sums.includes('9.000') && sums.includes('5.398') && thanks.includes('ekskl. moms'), `sendt: kvitteringen vises (${sums})`)
  await shot('form-sendt')

  // Mailen og D1.
  check(sim.mails.length === base.mails + 1, `præcis én mail sendt (${sim.mails.length - base.mails})`)
  const m = decodeMail(sim.mails.at(-1).raw)
  check(sim.mails.at(-1).to === 'ronnyhong723@gmail.com' && sim.mails.at(-1).from === 'kontakt@oviaspecs.com', 'afsender og modtager')
  check(m.subject === 'Ny forespørgsel: Mette Hansen, Café Mette – 9.000 kr. + 5.398 kr./md.', `emne: "${m.subject}"`)
  check(m.replyTo === 'mette@cafe.example', `Reply-To = kundens mail (${m.replyTo})`)
  for (const want of ['Navn: Mette Hansen', 'Virksomhed: Café Mette', 'Telefon: 53613699', 'Mail: mette@cafe.example', '> Hej Ronny.', '> Vi åbner i foråret.', '- Hjemmeside – Vækst: 8.000 kr.', '- Booking koblet på – Tilvalg: 1.000 kr.', '- Marketing – Vækst: 5.000 kr./md.', '- Drift – Plus: 398 kr./md.', 'Engang: 9.000 kr.', 'Pr. måned: 5.398 kr./md.', 'Alle priser er ekskl. moms.', `Se valgene: ${SITE}/?w=1&d=p&bk=1&m=1&s=4#prisberegner`]) {
    check(m.text.includes(want), `mailen indeholder "${want}"`)
  }
  const row = db.prepare('SELECT * FROM henvendelser ORDER BY created_at DESC').get()
  check(row?.mail_status === 'sent' && row.contact === 'mette@cafe.example · 53613699', `D1: ${row?.mail_status}, ${row?.contact}`)
  check(errors.length === 0, `ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()
}

await run('Mobil 390×844', 390, 844, true)
await run('Desktop 1440×900', 1440, 900, false)

// Honeypot: en robot, der udfylder det skjulte felt, får OK, men intet sendes.
{
  const before = sim.mails.length
  const res = await fetch(`${SITE}/api/henvendelse`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE }, body: JSON.stringify({ name: 'Bot', email: 'bot@example.com', link: '/?w=1&s=4', website: 'http://spam.example' }) })
  check(res.ok && sim.mails.length === before, `honeypot: OK uden mail (${res.status})`)
}

await browser.close()
server.close()
console.log(failed ? `\n${failed} fejl` : '\nAlt ok')
process.exit(failed ? 1 : 0)
