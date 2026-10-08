/**
 * Browser- og tilgængelighedstest af hele kunderejsen mod `npm run preview` (puppeteer-core,
 * som de øvrige browsertests). Starter ingen server og bygger intet:
 *
 *   SITE=http://localhost:4173 node scripts/test-a11y-e2e.mjs
 *
 * Der sendes ALDRIG en rigtig henvendelse: POST /api/henvendelse efterlignes (mock).
 * Skærmbilleder: docs/b-agent/.
 *
 * Dækker (kun det stabile):
 *  1. Priser: pakke x plan (+ egen konto/hosting) x booking via klik i beregneren, sammenlignet med
 *     håndregnede beløb (resultat, formularens payload-link og en uafhængig beregning af linket).
 *     Skift af pakke og drift i resultatet, skift mellem plan og egen konto og tilbage.
 *  2. Tilstand: genindlæsning på hvert trin, delbare links, gamle links (drift=drift), link uden
 *     drift, guidens svar, guide til beregner, hjaelp/g-* og kontaktoplysninger aldrig i link/adresse.
 *  3. Rundvisning (375/768/1440): start, næste, tilbage, spring over, Escape, færdig, genåbning,
 *     invitation ved første besøg, valg/adresse uændret, fokus tilbage til knappen.
 *  4. Henvendelse (mock): validering knyttet til feltet, succes, serverfejl, payload med plan.
 *  5. Visuelt/tastatur: vandret scroll, tab-gennemgang med synlig fokusring (og fokus der ikke er
 *     skjult bag faste elementer), labels/legend, trykflader, kontrast og tekststørrelser
 *     (beregnet ud fra computed style), reduceret bevægelse, uden JavaScript, konsolfejl.
 *  6. Regressioner: demo og retur, ydelsessiderne, kontaktlinks, guidens afklaring.
 *
 * Begrænsning: der testes IKKE med en rigtig skærmlæser. aria-attributter, labels og fokus
 * kontrolleres i DOM'en, men hvordan en skærmlæser udtaler siden, er ikke afprøvet.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'
import { parse, quote } from '../src/calculator.js'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const SHOTS = 'docs/b-agent'
mkdirSync(SHOTS, { recursive: true })

const failures = []
const notes = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}
const note = (msg) => notes.push(msg)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 40000 })
const errors = []
const requests = [] // POST /api/henvendelse (mock)
let reply = { status: 200, body: { ok: true } }

/** Ny side i egen (ren) browserkontekst. Henvendelser efterlignes; intet sendes. */
async function newPage(width, { reduceMotion = false, noJs = false, height } = {}) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const tag = `${width}px`
  page.on('pageerror', (e) => errors.push(`${tag} ${page.url()}: ${e}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag} ${page.url()}: ${m.text()}`))
  await page.setViewport({ width, height: height ?? (width < 768 ? 812 : 900), isMobile: width < 768, hasTouch: width < 768 })
  if (reduceMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (noJs) await page.setJavaScriptEnabled(false)
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().endsWith('/api/henvendelse')) {
      requests.push(JSON.parse(req.postData() ?? '{}'))
      return req.respond({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) })
    }
    req.continue()
  })
  page.ctx = ctx
  return page
}
const closePage = (page) => page.ctx.close()
/** Tømmer feltet (Ctrl+A) og skriver teksten, som en bruger ville. */
async function fill(page, selector, text) {
  const input = await page.$(selector)
  await input.click()
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
  await input.type(text)
}
const open = async (page, path = '/') => {
  await page.goto(`${SITE}${path}`, { waitUntil: 'networkidle0' })
  // Klik før React har overtaget siden (hydrering) giver ustabile test: vent på rodens React-container.
  await page.waitForFunction(() => Object.keys(document.getElementById('root') ?? {}).some((k) => k.startsWith('__reactContainer')), { timeout: 8000 }).catch(() => {})
  await wait(350)
}
const search = (page) => page.evaluate(() => window.location.search)
const calc = (page) => page.evaluate(() => document.querySelector('#beregner')?.textContent ?? '')

/** Klik (rigtig musehændelse) på det første element i beregneren, hvis tekst starter med `text`. */
async function click(page, text, selector = '#beregner label, #beregner button, #beregner a', root = '') {
  const handle = await page.evaluateHandle(
    (text, selector, root) => {
      const scope = root ? document.querySelector(root) : document
      // "=Nej" betyder præcis denne tekst (også når andre valg starter med "Nej, ...").
      const exact = text.startsWith('=')
      const want = exact ? text.slice(1) : text
      return [...(scope?.querySelectorAll(selector) ?? [])].find((n) => {
        const t = n.textContent.replace(/\s+/g, ' ').trim().replace(/^← /, '')
        return exact ? (n.querySelector('.choice-title')?.textContent.trim() ?? t) === want : t.startsWith(want)
      }) ?? null
    },
    text,
    selector,
    root,
  )
  const el = handle.asElement()
  if (!el) {
    failures.push(`fandt ikke "${text}"`)
    return false
  }
  await el.evaluate((n) => n.scrollIntoView({ block: 'center' }))
  // Vent til elementet står stille (trinskift animeres), ellers rammer klikket ved siden af.
  let last = ''
  for (let i = 0; i < 20; i++) {
    const box = JSON.stringify(await el.boundingBox())
    if (box === last) break
    last = box
    await wait(60)
  }
  await el.click()
  await wait(180)
  return true
}

/* =====================================================================
   1. PRISER
   ===================================================================== */
const PACK = {
  start: { label: 'Én side med det hele', sider: '1', once: 2500, name: 'Start' },
  vaekst: { label: '2-5 sider', sider: '2-5', once: 4000, name: 'Vækst' },
  'fuld-fart': { label: '6-8 sider', sider: '6-8', once: 5000, name: 'Fuld fart' },
}
const PLAN = {
  basis: { label: 'Basis', monthly: 99, extra: 0 },
  plus: { label: 'Plus', monthly: 199, extra: 0 },
  ekstra: { label: 'Ekstra', monthly: 399, extra: 0 },
  egen: { label: 'Egen konto/hosting', monthly: 0, extra: 1000 },
}
const kr = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Håndregnet forventning: engang = pakke + egen konto + booking; måned = plan (egen konto: 0). */
const expected = (pack, plan, booking) => ({ once: PACK[pack].once + PLAN[plan].extra + (booking ? 500 : 0), monthly: PLAN[plan].monthly })

/** Det, resultatet viser: total (Nu/Pr. måned), live-tekst og første linje. */
const shown = (page) =>
  page.evaluate(() => {
    const root = document.querySelector('#beregner [data-tour="price"]')
    const parts = [...(root?.querySelectorAll('.calc-total-part') ?? [])]
    const num = (el) => Number((el?.querySelector('.amount-num')?.textContent ?? '0').replace(/[^\d]/g, '')) || 0
    const nu = parts.find((p) => /^Nu/i.test(p.textContent.trim()))
    const md = parts.find((p) => /Pr\. måned/i.test(p.textContent))
    return {
      once: num(nu),
      monthly: num(md),
      live: document.querySelector('#beregner [aria-live="polite"]')?.textContent ?? '',
      line: root?.querySelector('ul > li')?.innerText.replace(/\s+/g, ' ') ?? '',
      text: root?.innerText ?? '',
    }
  })

/** Hele vejen fra forsiden til resultatet via klik. */
async function runThrough(page, pack, plan, booking) {
  await open(page, '/')
  await click(page, 'Hjemmeside')
  await click(page, 'Næste')
  await click(page, PACK[pack].label)
  await click(page, booking ? 'Ja' : 'Nej')
  await click(page, 'Næste')
  await click(page, PLAN[plan].label)
  await click(page, 'Vis min pris')
}

async function submitInquiry(page, contact = 'test@example.com') {
  requests.length = 0
  await fill(page, '#beregner input[name=contact]', contact)
  await click(page, 'Send til Ronny', 'button')
  await wait(250)
  return requests.at(-1)
}

async function testPrices() {
  const page = await newPage(1440)
  reply = { status: 200, body: { ok: true } }
  let n = 0
  for (const booking of [false, true]) {
    for (const pack of Object.keys(PACK)) {
      for (const plan of Object.keys(PLAN)) {
        const want = expected(pack, plan, booking)
        const id = `${PACK[pack].name} + ${plan}${booking ? ' + booking' : ''}`
        await runThrough(page, pack, plan, booking)
        const s = await shown(page)
        check(s.once === want.once && s.monthly === want.monthly, `PRIS ${id}: viser ${s.once}/${s.monthly}, forventet ${want.once}/${want.monthly} (${s.text.slice(0, 120).replace(/\n/g, ' ')})`)
        const liveOnce = `${kr(want.once)} kr. nu`
        check(s.live.includes(liveOnce) && (want.monthly ? s.live.includes(`${want.monthly} kr./md`) : !/\/md/.test(s.live)), `PRIS ${id}: skærmlæser-tekst "${s.live}"`)
        const sea = await search(page)
        check(sea.includes(`sider=${PACK[pack].sider}`) && sea.includes(`drift=${plan}`) && sea.includes(`bestilling=${booking ? 'ja' : 'nej'}`) && sea.includes('trin=4'), `PRIS ${id}: adresselinje ${sea}`)
        check(booking === /Booking koblet på/.test(s.text) && (plan === 'egen') === /Egen konto\/hosting/.test(s.text.split('Skift')[0]), `PRIS ${id}: linjens dele passer ikke: ${s.text.slice(0, 200).replace(/\n/g, ' ')}`)
        // Formularens payload-link, og samme link regnet uafhængigt af browseren.
        const sent = await submitInquiry(page)
        const url = new URL(sent?.link ?? '/', SITE)
        check(url.searchParams.get('sider') === PACK[pack].sider && url.searchParams.get('drift') === plan && url.searchParams.get('bestilling') === (booking ? 'ja' : 'nej'), `PRIS ${id}: payload-link ${sent?.link}`)
        const q = quote(parse(url.search)).total
        check(q.once === want.once && q.monthly === want.monthly, `PRIS ${id}: linket regner til ${q.once}/${q.monthly}, forventet ${want.once}/${want.monthly}`)
        n++
      }
    }
  }
  note(`priser: ${n} kombinationer (3 pakker x 4 driftvalg x med/uden booking) klikket igennem og sammenlignet med håndregnede beløb`)

  await closePage(page)
  // Rigtige tryk på mobil (375 px, bundbjælke og fast topbjælke kan ligge i vejen for knapperne).
  const phone = await newPage(375)
  for (const [pack, plan, booking] of [['start', 'egen', true], ['fuld-fart', 'ekstra', false], ['vaekst', 'basis', true]]) {
    const want = expected(pack, plan, booking)
    await runThrough(phone, pack, plan, booking)
    const s = await shown(phone)
    check(s.once === want.once && s.monthly === want.monthly, `PRIS 375px ${PACK[pack].name} + ${plan}${booking ? ' + booking' : ''}: viser ${s.once}/${s.monthly}, forventet ${want.once}/${want.monthly}`)
  }
  await closePage(phone)
  const page2 = await newPage(1440)

  // Skift i resultatet: pakke uden at driften ændres, drift uden at pakken ændres, plan <-> egen konto.
  for (const booking of [false, true]) {
    await runThrough(page2, 'vaekst', 'ekstra', booking)
    const bk = booking ? 500 : 0
    for (const [pack, label] of [['start', 'Start'], ['fuld-fart', 'Fuld fart'], ['vaekst', 'Vækst']]) {
      await click(page2, label, 'label', '[data-tour="price"] fieldset:not([data-tour="drift"])')
      const s = await shown(page2)
      const checked = await page2.evaluate(() => document.querySelector('#beregner input[name=drift]:checked')?.value)
      check(checked === 'ekstra' && s.once === PACK[pack].once + bk && s.monthly === 399, `SKIFT pakke ${label}${booking ? ' + booking' : ''}: drift ${checked}, ${s.once}/${s.monthly}`)
    }
    for (const plan of ['egen', 'basis', 'egen', 'plus', 'ekstra']) {
      await click(page2, PLAN[plan].label, 'label', '[data-tour="drift"]')
      const s = await shown(page2)
      const want = expected('vaekst', plan, booking)
      const pack = await page2.evaluate(() => document.querySelector('#beregner input[name="pakke-hjemmeside"]:checked')?.value)
      check(pack === 'vaekst' && s.once === want.once && s.monthly === want.monthly && (await search(page2)).includes(`drift=${plan}`), `SKIFT drift ${plan}${booking ? ' + booking' : ''}: pakke ${pack}, ${s.once}/${s.monthly}`)
    }
  }
  await closePage(page2)
}

/* =====================================================================
   2. TILSTAND
   ===================================================================== */
async function testState() {
  const page = await newPage(1440)
  const base = '/?ydelser=hjemmeside&sider=2-5&bestilling=ja&drift=egen'
  // Genindlæsning på hvert trin: samme trin, samme valg.
  for (const trin of [1, 2, 3, 4]) {
    await open(page, `${base}&trin=${trin}`)
    const before = await calc(page)
    await page.reload({ waitUntil: 'networkidle0' })
    await wait(350)
    check((await calc(page)) === before && (await search(page)).includes(`trin=${trin}`), `TILSTAND genindlæsning trin ${trin} ændrede siden (${await search(page)})`)
    if (trin === 4) check((await shown(page)).once === 5500, `TILSTAND resultat efter genindlæsning: ${(await shown(page)).once}`)
  }
  await open(page, `${base}&trin=2`)
  check(await page.evaluate(() => document.querySelector('#beregner input[name=sider]:checked')?.value === '2-5' && document.querySelector('#beregner input[name=bestilling]:checked')?.value === 'ja'), 'TILSTAND trin 2 har ikke de valgte svar')
  await open(page, `${base}&trin=3`)
  check(await page.evaluate(() => document.querySelector('#beregner input[name=drift]:checked')?.value === 'egen'), 'TILSTAND trin 3 har ikke driftvalget')

  // Browser-tilbage/frem: beregneren bruger replaceState, så tilbage forlader siden og frem gendanner valgene.
  await open(page, '/priser/')
  await open(page, '/')
  await click(page, 'Hjemmeside')
  await click(page, 'Næste')
  await click(page, '2-5 sider')
  await click(page, 'Nej')
  await click(page, 'Næste')
  await click(page, 'Plus')
  await click(page, 'Vis min pris')
  const resultUrl = await search(page)
  const hist = await page.evaluate(() => history.length)
  await page.goBack()
  await wait(400)
  const backUrl = await page.evaluate(() => location.pathname + location.search)
  await page.goForward()
  await wait(400)
  check((await search(page)) === resultUrl && (await shown(page)).once === 4000, 'TILSTAND browser-frem gendannede ikke resultatet')
  note(`browser-tilbage fra resultatet (${hist} historikposter) gik til "${backUrl}" (ikke et trin tilbage; beregneren bruger replaceState)`)

  // Delbart link i frisk kontekst (ingen delt tilstand).
  const fresh = await newPage(375)
  await open(fresh, resultUrl.startsWith('?') ? `/${resultUrl}` : resultUrl)
  check((await shown(fresh)).once === 4000 && (await shown(fresh)).monthly === 199, 'TILSTAND delt link giver ikke samme pris i en frisk browser')
  // Gamle links.
  await open(fresh, '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=drift&trin=3')
  let s = await shown(fresh)
  check(s.once === 4000 && s.monthly === 199, `GAMMELT link Vækst: ${s.once}/${s.monthly} ${await search(fresh)}`)
  await open(fresh, '/?ydelser=hjemmeside&sider=6-8&bestilling=nej&drift=drift&trin=3')
  s = await shown(fresh)
  check(s.once === 5000 && s.monthly === 399, `GAMMELT link Fuld fart: ${s.once}/${s.monthly} ${await search(fresh)}`)
  await open(fresh, '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=egen&trin=3')
  const egenCalc = await calc(fresh)
  check(await fresh.evaluate(() => document.querySelector('#beregner input[name=drift]:checked')?.value === 'egen' || /5\.000/.test(document.querySelector('#beregner')?.textContent ?? '')), `GAMMELT link egen: egen konto er ikke bevaret (${egenCalc.slice(0, 80)})`)
  note(`gammelt link ...drift=egen&trin=3 lander på ${/Din pris/.test(egenCalc) ? 'resultatet' : 'driftstrinnet (egen konto valgt), ikke resultatet'}`)
  // Link uden drift: kunden vælger selv, intet forvalgt og ingen pris.
  await open(fresh, '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=4')
  const t = await calc(fresh)
  check(/Drift af din hjemmeside/.test(t) && !(await fresh.$('#beregner input[name=drift]:checked')) && !(await fresh.$('#beregner [data-tour="price"]')), `LINK uden drift: viser ikke driftvalget uden forvalg (${t.slice(0, 80)})`)
  await closePage(fresh)

  // Guide: ændrede svar, guide -> beregner og tilbage; hjaelp/g-* aldrig i formularens link.
  reply = { status: 200, body: { ok: true } }
  await open(page, '/')
  await click(page, 'Hjælp mig med at vælge')
  check(/hjaelp=1/.test(await search(page)), 'GUIDE trin 1 ikke i adresselinjen')
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  await click(page, '6-8 sider')
  await click(page, 'Næste')
  await click(page, 'Ja, jævnligt')
  await click(page, 'Vis mit forslag')
  check(/5\.000/.test(await calc(page)) && /399/.test(await calc(page)) && /hjaelp=4/.test(await search(page)), `GUIDE forslag Fuld fart + Ekstra: ${(await calc(page)).slice(0, 160)}`)
  let sent = await submitInquiry(page, '53 61 36 99')
  check(sent && !/hjaelp|g-/.test(sent.link) && new URL(sent.link, SITE).searchParams.get('drift') === 'ekstra' && new URL(sent.link, SITE).searchParams.get('sider') === '6-8', `GUIDE payload-link: ${sent?.link}`)
  check(!/53|36|99/.test(await search(page)), 'KONTAKT telefonnummeret ligger i adresselinjen')
  await open(page, '/')
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  await click(page, '2-5 sider')
  await click(page, 'Næste')
  await click(page, 'Lidt, en gang imellem')
  await click(page, 'Vis mit forslag')
  await click(page, 'Se og ret i beregneren')
  const afterGuide = await search(page)
  check(!/hjaelp|g-/.test(afterGuide) && /drift=plus/.test(afterGuide) && /sider=2-5/.test(afterGuide), `GUIDE -> beregner: adresselinje ${afterGuide}`)
  await click(page, 'Egen konto/hosting', 'label', '[data-tour="drift"]')
  s = await shown(page)
  check(s.once === 5000 && s.monthly === 0, `GUIDE -> beregner, skift til egen: ${s.once}/${s.monthly}`)
  // Retur til guiden efter ændring: guiden åbner igen uden at beregnerens valg går tabt.
  await click(page, 'Start forfra')
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Vælg selv i beregneren')
  check(!/hjaelp|g-/.test(await search(page)), `GUIDE ud igen: ${await search(page)}`)
  // Kontaktoplysninger i URL'en efter udfyldning og afsendelse.
  await open(page, `${base}&trin=4`)
  await page.type('#beregner input[name=contact]', 'hemmelig@example.com')
  await page.type('#beregner input[name=name]', 'Hemmelig Virksomhed')
  check(!/hemmelig|Hemmelig/i.test(await search(page)), 'KONTAKT oplysninger i adresselinjen under udfyldning')
  await click(page, 'Send til Ronny', 'button')
  await wait(250)
  sent = requests.at(-1)
  check(sent && !/hemmelig/i.test(sent.link) && !/hemmelig/i.test(await search(page)), 'KONTAKT oplysninger i link eller adresse efter afsendelse')
  await closePage(page)
}

/* =====================================================================
   3. RUNDVISNING
   ===================================================================== */
const tourBtn = (page, text) => page.evaluateHandle((t) => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === t) ?? null, text)
const tourInfo = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('[data-tour-popup]')
    return d ? { step: d.dataset.tourStep, count: d.querySelector('.tour-count')?.textContent.trim(), buttons: [...d.querySelectorAll('button')].map((b) => b.textContent.trim()), active: d.contains(document.activeElement) } : null
  })
const tourChoice = (page) => page.evaluate(() => localStorage.getItem('oviaspecs-tour'))

async function testTour() {
  for (const width of [375, 768, 1440]) {
    const tag = `${width}px`
    const page = await newPage(width)
    const url = '/?ydelser=hjemmeside&sider=2-5&bestilling=ja&drift=ekstra&trin=4'
    await open(page, url)
    const startUrl = await search(page)
    const startCalc = await calc(page)
    check(!(await page.$('[data-tour-invite]')), `RUNDVISNING ${tag}: invitationen vises med det samme`)
    // Invitationen ved første besøg (frisk kontekst): kommer efter kort tid, påvirker ikke valg.
    await wait(5300)
    check(!!(await page.$('[data-tour-invite]')), `RUNDVISNING ${tag}: invitationen vises ikke ved første besøg`)
    check((await search(page)) === startUrl && (await calc(page)) === startCalc, `RUNDVISNING ${tag}: invitationen ændrede valg/adresse`)
    await page.screenshot({ path: `${SHOTS}/${tag}-tour-invitation.png` })
    const yes = await page.$('[data-tour-invite-yes]')
    await yes?.click()
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 }).catch(() => failures.push(`RUNDVISNING ${tag}: "Ja" starter ikke touren`))
    await wait(500)
    let info = await tourInfo(page)
    check(!!info && info.count?.startsWith('1 af ') && info.buttons.includes('Spring over'), `RUNDVISNING ${tag}: trin 1 ${JSON.stringify(info)}`)
    const total = Number(info?.count?.split(' af ')[1] ?? 0)
    check(total >= 3, `RUNDVISNING ${tag}: kun ${total} trin`)
    await wait(600)
    await page.screenshot({ path: `${SHOTS}/${tag}-tour-trin1.png` })
    for (let i = 1; i < total; i++) {
      await (await tourBtn(page, 'Næste')).asElement()?.click()
      await wait(450)
    }
    await wait(500)
    await page.screenshot({ path: `${SHOTS}/${tag}-tour-sidste.png` })
    info = await tourInfo(page)
    check(info?.count === `${total} af ${total}` && info.buttons.includes('Færdig'), `RUNDVISNING ${tag}: sidste trin ${JSON.stringify(info)}`)
    await (await tourBtn(page, 'Tilbage')).asElement()?.click()
    await wait(400)
    check((await tourInfo(page))?.count === `${total - 1} af ${total}`, `RUNDVISNING ${tag}: Tilbage gik ikke et trin tilbage`)
    await (await tourBtn(page, 'Næste')).asElement()?.click()
    await wait(400)
    await (await tourBtn(page, 'Færdig')).asElement()?.click()
    await wait(350)
    check(!(await page.$('[data-tour-popup]')) && (await tourChoice(page)) === 'done', `RUNDVISNING ${tag}: Færdig lukkede ikke / husker ikke`)
    check((await search(page)) === startUrl && (await calc(page)) === startCalc, `RUNDVISNING ${tag}: kundens valg eller adresse ændret af touren`)
    check(await page.evaluate(() => document.activeElement === document.querySelector('[data-tour-launcher]')), `RUNDVISNING ${tag}: fokus kom ikke tilbage til "Vis mig rundt" efter Færdig`)
    // Genåbning, Escape, Spring over.
    await page.evaluate(() => document.querySelector('[data-tour-launcher]').scrollIntoView({ block: 'center' }))
    await page.click('[data-tour-launcher]')
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    await wait(400)
    check((await tourInfo(page))?.count === `1 af ${total}`, `RUNDVISNING ${tag}: genåbning starter ikke ved trin 1`)
    await (await tourBtn(page, 'Næste')).asElement()?.click()
    await wait(350)
    await page.keyboard.press('Escape')
    await wait(350)
    check(!(await page.$('[data-tour-popup]')) && (await search(page)) === startUrl, `RUNDVISNING ${tag}: Escape lukkede ikke rent`)
    check(await page.evaluate(() => document.activeElement === document.querySelector('[data-tour-launcher]')), `RUNDVISNING ${tag}: fokus tilbage efter Escape`)
    await page.click('[data-tour-launcher]')
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    await wait(300)
    await (await tourBtn(page, 'Spring over')).asElement()?.click()
    await wait(350)
    check(!(await page.$('[data-tour-popup]')) && (await tourChoice(page)) === 'skipped', `RUNDVISNING ${tag}: Spring over`)
    check(await page.evaluate(() => document.activeElement === document.querySelector('[data-tour-launcher]')), `RUNDVISNING ${tag}: fokus tilbage efter Spring over`)
    // Efter afvist/afsluttet kommer invitationen ikke igen.
    await page.reload({ waitUntil: 'networkidle0' })
    await wait(5300)
    check(!(await page.$('[data-tour-invite]')), `RUNDVISNING ${tag}: invitationen kom igen efter afsluttet rundvisning`)
    check((await search(page)) === startUrl, `RUNDVISNING ${tag}: adresse ændret`)
    await closePage(page)
  }
}

/* =====================================================================
   4. HENVENDELSE (mock)
   ===================================================================== */
async function testInquiry() {
  for (const width of [375, 1440]) {
    const tag = `${width}px`
    const page = await newPage(width)
    await open(page, '/?ydelser=hjemmeside&sider=1&bestilling=nej&drift=basis&trin=4')
    requests.length = 0
    await click(page, 'Send til Ronny', 'button') // tomt felt
    let st = await page.evaluate(() => {
      const input = document.querySelector('#beregner input[name=contact]')
      const err = document.getElementById(input.getAttribute('aria-describedby') ?? '')
      return { invalid: input.getAttribute('aria-invalid'), err: err?.textContent ?? '', focus: document.activeElement === input, label: input.labels?.[0]?.textContent ?? '' }
    })
    check(requests.length === 0 && st.invalid === 'true' && /gyldig mail/.test(st.err) && st.focus && /mail eller dit telefonnummer/.test(st.label), `HENVENDELSE ${tag}: tom validering ${JSON.stringify(st)}`)
    await page.screenshot({ path: `${SHOTS}/${tag}-henvendelse-fejl.png` })
    for (const bad of ['forkert', '1234', 'a@b']) {
      await fill(page, '#beregner input[name=contact]', bad)
      await click(page, 'Send til Ronny', 'button')
      check(requests.length === 0 && /gyldig mail/.test(await calc(page)), `HENVENDELSE ${tag}: "${bad}" blev sendt eller afvist uden besked`)
    }
    // Serverfejl: ærlig besked med telefonnummer, intet tak.
    reply = { status: 500, body: { ok: false } }
    let sent = await submitInquiry(page, '53 61 36 99')
    await wait(200)
    st = await page.evaluate(() => ({ alert: document.querySelector('#beregner [role=alert]')?.textContent ?? '', tel: !!document.querySelector('#beregner [role=alert] a[href^="tel:"]'), focus: document.activeElement?.getAttribute('role') }))
    check(requests.length === 1 && /Det blev ikke sendt/.test(st.alert) && st.tel && st.focus === 'alert' && !/Tak\. Jeg svarer/.test(await calc(page)), `HENVENDELSE ${tag}: serverfejl ${JSON.stringify(st)}`)
    await page.screenshot({ path: `${SHOTS}/${tag}-henvendelse-serverfejl.png` })
    // Succes.
    reply = { status: 200, body: { ok: true } }
    sent = await submitInquiry(page, '53 61 36 99')
    await wait(200)
    check(/Tak\. Jeg svarer inden for 24 timer/.test(await calc(page)) && (await page.evaluate(() => document.activeElement?.getAttribute('role'))) === 'status', `HENVENDELSE ${tag}: succes uden tak eller fokus`)
    const url = new URL(sent?.link ?? '/', SITE)
    check(sent?.contact === '53 61 36 99' && url.searchParams.get('drift') === 'basis' && url.searchParams.get('sider') === '1' && !/hjaelp|g-/.test(url.search), `HENVENDELSE ${tag}: payload ${JSON.stringify(sent)}`)
    await page.screenshot({ path: `${SHOTS}/${tag}-henvendelse-tak.png` })
    await closePage(page)
  }
}

/* =====================================================================
   5. VISUELT / TASTATUR
   ===================================================================== */
/** Kører i siden: kontrast, tekststørrelser og trykflader beregnet ud fra computed style. */
const measure = () => {
  const lum = (c) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
  }
  const color = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/)
    if (m) {
      const p = m[1].split(/[ ,/]+/).map(Number)
      return [p[0], p[1], p[2], p[3] ?? 1]
    }
    const m2 = s.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/)
    return m2 ? [m2[1] * 255, m2[2] * 255, m2[3] * 255, m2[4] === undefined ? 1 : +m2[4]] : null
  }
  const blend = (f, b) => [f[0] * f[3] + b[0] * (1 - f[3]), f[1] * f[3] + b[1] * (1 - f[3]), f[2] * f[3] + b[2] * (1 - f[3]), 1]
  const bgOf = (el) => {
    const stack = []
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n)
      // Gradient/billede som baggrund kan ikke måles; understregninger (link-underline) på selve linket ignoreres.
      if (cs.backgroundImage !== 'none' && !(n === el && el.matches('a'))) return { img: true }
      const c = color(cs.backgroundColor)
      if (c && c[3] > 0) {
        stack.push(c)
        if (c[3] === 1) break
      }
    }
    let base = [255, 255, 255, 1]
    for (const c of stack.reverse()) base = blend(c, base)
    return { c: base }
  }
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 && !el.closest('[aria-hidden="true"],.sr-only,[inert]')
  }
  const where = (el) => {
    const out = []
    for (let n = el; n && out.length < 3; n = n.parentElement) out.push(n.tagName.toLowerCase() + (typeof n.className === 'string' && n.className ? `.${n.className.trim().split(/\s+/)[0]}` : ''))
    return out.join('<')
  }
  const small = []
  const contrast = []
  const targets = []
  const minRatio = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  while (walker.nextNode()) {
    const t = walker.currentNode
    const txt = t.textContent.trim()
    const el = t.parentElement
    if (!txt || !el || seen.has(el) || el.closest('script,style,noscript') || !visible(el)) continue
    seen.add(el)
    const cs = getComputedStyle(el)
    const fs = parseFloat(cs.fontSize)
    if (fs < 14) small.push({ fs, text: txt.slice(0, 40), at: where(el) })
    const fg = color(cs.color)
    const bg = bgOf(el)
    if (fg && bg.c) {
      const f = fg[3] < 1 ? blend(fg, bg.c) : fg
      const a = lum(f)
      const b = lum(bg.c)
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      const large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700)
      minRatio.push(ratio)
      if (ratio < (large ? 3 : 4.5)) contrast.push({ ratio: +ratio.toFixed(2), fs, text: txt.slice(0, 40), at: where(el) })
    }
  }
  const sel = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button]'
  for (const el of document.querySelectorAll(sel)) {
    if (el.closest('.send-trap,[inert],[aria-hidden="true"]')) continue
    const box = el.matches('input[type=radio],input[type=checkbox]') ? (el.closest('label') ?? el) : el
    if (!visible(box)) continue
    const cs = getComputedStyle(el)
    // Almindelige tekstlinks midt i en sætning er undtaget (WCAG 2.5.8).
    if (cs.display === 'inline' && el.tagName === 'A' && el.closest('p,li') && el.parentElement.textContent.trim().length > el.textContent.trim().length + 10) continue
    const r = box.getBoundingClientRect()
    // .hit udvider trykfladen med et pseudo-element (inset: -12px -6px).
    const w = r.width + (el.classList.contains('hit') ? 12 : 0)
    const h = r.height + (el.classList.contains('hit') ? 24 : 0)
    if (w < 44 || h < 44) targets.push({ w: Math.round(w), h: Math.round(h), text: (el.innerText || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 30), at: where(el) })
  }
  const paragraphs = {}
  for (const p of document.querySelectorAll('main p')) {
    if (!visible(p) || p.closest('.sr-only')) continue
    const fs = parseFloat(getComputedStyle(p).fontSize)
    paragraphs[fs] = (paragraphs[fs] ?? 0) + 1
  }
  return { small, contrast, targets, paragraphs, minRatio: [Math.min(21, ...minRatio)], scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }
}

const smallNotes = new Set()
const targetNotes = new Set()
let minContrast = 21
const dedupe = (items, key) => [...new Map(items.map((i) => [key(i), i])).values()]

async function scrollAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 450) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 50))
    }
    window.scrollTo(0, 0)
  })
  await wait(400)
}

const FLOW_URLS = [
  '/',
  '/?ydelser=hjemmeside&trin=2',
  '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=3',
  '/?ydelser=hjemmeside&sider=2-5&bestilling=ja&drift=plus&trin=4',
  '/?hjaelp=1',
  '/priser/',
]

async function testVisual() {
  for (const width of [375, 768, 1440]) {
    const tag = `${width}px`
    const page = await newPage(width)
    for (const path of FLOW_URLS) {
      await open(page, path)
      await scrollAll(page)
      const m = await page.evaluate(measure)
      check(m.scrollWidth <= m.innerWidth + 1, `VISUELT ${tag} ${path}: vandret scroll (${m.scrollWidth} > ${m.innerWidth})`)
      const contrast = dedupe(m.contrast, (c) => `${c.at}|${c.ratio}`)
      check(contrast.length === 0, `KONTRAST ${tag} ${path}: ${contrast.slice(0, 4).map((c) => `${c.ratio}:1 "${c.text}" (${c.at})`).join('; ')}`)
      // Tekst under 12 px er en fejl; 12-13 px (trintæller, mærker, priser i valgkort) noteres, så de ikke overses.
      const small = dedupe(m.small, (s) => `${s.fs}|${s.at}`)
      check(!small.some((s) => s.fs < 12), `TEKSTSTØRRELSE ${tag} ${path}: under 12 px: ${small.filter((s) => s.fs < 12).slice(0, 5).map((s) => `${s.fs}px "${s.text}" (${s.at})`).join('; ')}`)
      for (const s of small) smallNotes.add(`${tag}: ${s.fs}px "${s.text}" (${s.at})`)
      // Trykflader: under 40 px er en fejl; 40-43 px noteres (kravet i brieffet er 44 px).
      const tg = dedupe(m.targets, (t) => `${t.w}x${t.h}|${t.at}`)
      check(!tg.some((t) => t.w < 40 || t.h < 40), `TRYKFLADE ${tag} ${path}: under 40 px: ${tg.filter((t) => t.w < 40 || t.h < 40).slice(0, 6).map((t) => `${t.w}x${t.h} "${t.text}" (${t.at})`).join('; ')}`)
      for (const t of tg) targetNotes.add(`${tag}: ${t.w}x${t.h} "${t.text}" (${t.at})`)
      minContrast = Math.min(minContrast, ...m.minRatio)
      if (width === 375 && path === '/') note(`brødtekst-størrelser (afsnit i main, 375 px): ${JSON.stringify(m.paragraphs)}`)
    }
    for (const [name, path] of [['forside', '/'], ['trin3-drift', '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=3'], ['resultat', '/?ydelser=hjemmeside&sider=2-5&bestilling=ja&drift=plus&trin=4']]) {
      await open(page, path)
      await scrollAll(page)
      if (name === 'forside') await page.screenshot({ path: `${SHOTS}/${tag}-${name}.png`, fullPage: true })
      else await (await page.$('#beregner')).screenshot({ path: `${SHOTS}/${tag}-${name}.png` })
    }
    await closePage(page)
  }
}

/** Tab gennem hele siden: hvert stop skal have synlig fokusring og ikke ligge bag faste elementer. */
async function tabSweep(page, tag, path, { max = 200 } = {}) {
  await open(page, path)
  const stops = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    await wait(420)
    const s = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return { body: true }
      const ringOf = (n) => {
        const c = getComputedStyle(n)
        return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2
      }
      const box = el.closest('label')?.querySelector('.choice-box')
      let ring = ringOf(el)
      if (!ring && box) {
        const c = getComputedStyle(box)
        ring = c.outlineStyle !== 'none' || c.boxShadow !== 'none'
      }
      // Eksempelkortene tegner ringen om hele kortet (.example:has(:focus-visible)).
      for (let n = el.parentElement, k = 0; !ring && n && k < 4; n = n.parentElement, k++) ring = ringOf(n)
      const rr = (box ?? el).getBoundingClientRect()
      const cx = Math.min(Math.max(rr.left + rr.width / 2, 1), innerWidth - 2)
      const cy = Math.min(Math.max(rr.top + rr.height / 2, 1), innerHeight - 2)
      const top = document.elementFromPoint(cx, cy)
      const covered = top && !(el.contains(top) || top.contains(el) || el.closest('label')?.contains(top)) ? `${top.tagName.toLowerCase()}.${String(top.className).split(' ')[0]}` : null
      return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.getAttribute('aria-label') || el.name || '').trim().replace(/\s+/g, ' ').slice(0, 28), ring, covered, inView: rr.bottom > 0 && rr.top < innerHeight && rr.height > 0 }
    })
    if (s.body) {
      stops.push(s)
      if (stops.filter((x) => x.body).length > 1) break
      continue
    }
    stops.push(s)
  }
  const real = stops.filter((s) => !s.body)
  check(real.length > 20, `TASTATUR ${tag} ${path}: kun ${real.length} tab-stop`)
  const noRing = real.filter((s) => !s.ring)
  check(noRing.length === 0, `TASTATUR ${tag} ${path}: uden synlig fokusring: ${[...new Set(noRing.map((s) => `${s.tag} "${s.text}"`))].slice(0, 5).join('; ')}`)
  return real
}

async function testKeyboard() {
  for (const width of [375, 1440]) {
    const tag = `${width}px`
    // Reduceret bevægelse: scroll hopper til målet, så dæk-målingen ikke afhænger af glidende scroll.
    // Invitationen kommer efter ca. 4,5 s; en tab-gennemgang er hurtigere end det, hvis den afbrydes her.
    for (const path of ['/', '/?ydelser=hjemmeside&sider=2-5&bestilling=ja&drift=plus&trin=4']) {
      const page = await newPage(width, { reduceMotion: true })
      const stops = await tabSweep(page, tag, path, { max: 150 })
      const hidden = stops.filter((s) => s.covered || !s.inView)
      const byInvite = hidden.filter((s) => /tour-invite/.test(s.covered ?? ''))
      check(hidden.length - byInvite.length === 0, `TASTATUR ${tag} ${path}: fokus skjult bag fast element: ${hidden.slice(0, 5).map((s) => `${s.tag} "${s.text}" -> ${s.covered}`).join('; ')}`)
      check(byInvite.length === 0, `TASTATUR ${tag} ${path}: rundvisningens invitation dækker det fokuserede element (WCAG 2.4.11) for ${byInvite.length} tab-stop, fx ${byInvite.slice(0, 3).map((s) => `${s.tag} "${s.text}"`).join('; ')}`)
      await closePage(page)
    }
  }

  // Labels, legend og aria på valgfelter, fejlbesked knyttet til feltet (beregneren trin for trin).
  const page = await newPage(375)
  for (const path of ['/', '/?ydelser=hjemmeside&trin=2', '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=3', '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4']) {
    await open(page, path)
    const r = await page.evaluate(() => {
      const radios = [...document.querySelectorAll('#beregner input[type=radio],#beregner input[type=checkbox]')]
      const bad = radios.filter((i) => !i.labels?.length || !i.labels[0].textContent.trim() || !i.closest('fieldset')?.querySelector('legend')?.textContent.trim())
      const inputs = [...document.querySelectorAll('#beregner input[type=text],#beregner select,#beregner textarea')].filter((i) => !i.closest('.send-trap'))
      const unlabelled = inputs.filter((i) => !i.labels?.length)
      const h = document.querySelector('#beregner h2')
      return { radios: radios.length, bad: bad.map((i) => i.name || i.value), unlabelled: unlabelled.map((i) => i.name), heading: h?.textContent ?? '', headingFocusable: h?.getAttribute('tabindex') }
    })
    check(r.bad.length === 0 && r.unlabelled.length === 0, `LABELS ${path}: uden label/legend: ${[...r.bad, ...r.unlabelled].join(', ')}`)
    check(!r.radios || r.radios >= 2, `LABELS ${path}: ${r.radios} valg`)
  }
  // Driftstrinnet uden valg: fejlen står ved feltet, og fokus går til valget.
  await open(page, '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=3')
  await click(page, 'Vis min pris')
  await wait(900)
  const err = await page.evaluate(() => {
    const a = document.activeElement
    const id = a?.getAttribute('aria-describedby') ?? a?.closest('fieldset')?.getAttribute('aria-describedby') ?? ''
    const fs = a?.closest('fieldset')
    const msg = id.split(' ').map((i) => document.getElementById(i)?.textContent ?? '').join(' ')
    return { name: a?.name, msg, invalid: a?.getAttribute('aria-invalid') ?? fs?.getAttribute('aria-invalid'), text: document.querySelector('#beregner')?.textContent ?? '' }
  })
  check(err.name === 'drift' && /Vælg en driftsplan/.test(err.text), `FEJLBESKED drift uden valg: fokus ${err.name}`)
  // Beskeden skal kunne ses, når fokus flyttes til valget (375 px), og helst være knyttet til feltet.
  const vis = await page.evaluate(() => {
    const e = document.querySelector('#beregner [role=alert]')
    const r = e?.getBoundingClientRect()
    return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } : null
  })
  check(!!vis && vis.top >= 0 && vis.bottom <= vis.vh, `FEJLBESKED drift uden valg ligger uden for skærmen når fokus flyttes (${JSON.stringify(vis)})`)
  check(!!err.msg.trim() || err.invalid === 'true', `FEJLBESKED drift uden valg er ikke knyttet til valget med aria-describedby/aria-invalid (kun role=alert)`)
  await page.screenshot({ path: `${SHOTS}/375-drift-uden-valg.png` })
  await closePage(page)
}

async function testMotionAndNoJs() {
  // Reduceret bevægelse: ingen transitions/animationer på det animerede, og indholdet er synligt.
  for (const width of [375, 1440]) {
    const page = await newPage(width, { reduceMotion: true })
    await open(page, '/')
    await scrollAll(page)
    const r = await page.evaluate(() => {
      const long = []
      const hiddenText = []
      const soft = []
      for (const el of document.querySelectorAll('main *, header *, footer *')) {
        const cs = getComputedStyle(el)
        const dur = (v) => v.split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000))
        const props = cs.transitionProperty.split(',').map((x) => x.trim())
        const movesByTransition = dur(cs.transitionDuration).some((d) => d > 1) && props.some((p) => /^(all|transform|translate|scale|rotate|top|left|right|bottom|margin|width|height)/.test(p))
        const anim = cs.animationName !== 'none' && dur(cs.animationDuration).some((d) => d > 1)
        // Kun opacity/farve (fade-only) er ikke bevægelse; resten tæller som fejl.
        const movesByAnim = anim && !/fade/.test(cs.animationName)
        if (movesByTransition || movesByAnim) long.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${cs.transitionProperty} ${cs.transitionDuration} / ${cs.animationName} ${cs.animationDuration})`)
        else if (dur(cs.transitionDuration).some((d) => d > 1) || anim) soft.push(`${cs.transitionProperty} ${cs.transitionDuration} / ${cs.animationName} ${cs.animationDuration}`)
      }
      for (const el of document.querySelectorAll('main h1, main h2, main p, main li')) {
        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        if (r.width && +cs.opacity < 0.99 && !el.closest('[aria-hidden="true"],.sr-only')) hiddenText.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}" opacity ${cs.opacity}`)
      }
      return { long: [...new Set(long)], soft: [...new Set(soft)].slice(0, 4), hiddenText }
    })
    check(r.long.length === 0, `BEVÆGELSE ${width}px: transitions/animationer >1ms trods reduceret bevægelse: ${r.long.slice(0, 5).join('; ')}`)
    if (r.soft.length) note(`reduceret bevægelse ${width}px: kun farve/opacity-overgange tilbage: ${r.soft.join(' | ')}`)
    check(r.hiddenText.length === 0, `BEVÆGELSE ${width}px: indhold ikke fuldt synligt: ${r.hiddenText.slice(0, 4).join('; ')}`)
    await closePage(page)
  }

  // Uden JavaScript: indholdet er synligt og læseligt (forprærenderet), og beregneren siger, hvorfor den mangler.
  for (const path of ['/', '/priser/', '/hjemmeside/']) {
    const page = await newPage(375, { noJs: true })
    await open(page, path)
    const r = await page.evaluate(() => {
      const main = document.querySelector('main')
      const text = main?.innerText ?? ''
      const hidden = [...document.querySelectorAll('main h1, main h2, main p')].filter((e) => {
        const cs = getComputedStyle(e)
        return e.getBoundingClientRect().height > 0 && (+cs.opacity < 0.99 || cs.visibility === 'hidden')
      })
      const calcText = document.querySelector('#beregner')?.textContent ?? ''
      return { len: text.length, h1: main?.querySelector('h1')?.textContent ?? '', prices: /\d\.\d{3}\s*kr\./.test(document.body.textContent), hidden: hidden.map((e) => `${e.tagName} ${e.textContent.slice(0, 25)}`), calcText, sw: document.documentElement.scrollWidth }
    })
    check(path === '/priser/' ? /2\.500/.test(await page.evaluate(() => document.body.textContent)) && /5\.000/.test(await page.evaluate(() => document.body.textContent)) && /b99b/.test(await page.evaluate(() => document.body.textContent)) : true, `UDEN JS ${path}: pakke- og driftspriser mangler`)
    check(r.len > 400 && r.h1 && r.prices, `UDEN JS ${path}: indhold mangler (tekst ${r.len}, h1 "${r.h1}", priser ${r.prices})`)
    check(r.hidden.length === 0, `UDEN JS ${path}: usynlig tekst: ${r.hidden.join('; ')}`)
    check(r.sw <= 376, `UDEN JS ${path}: vandret scroll ${r.sw}`)
    if (path === '/') {
      await page.screenshot({ path: `${SHOTS}/375-uden-js.png`, fullPage: true })
      check(/kræver JavaScript|JavaScript/.test(r.calcText), `UDEN JS: beregneren forklarer ikke, at den kræver JavaScript`)
    }
    await closePage(page)
  }
}

/* =====================================================================
   6. REGRESSIONER
   ===================================================================== */
async function testRegressions() {
  const page = await newPage(1440)
  // Demo og retur med valg i adresselinjen.
  const calcUrl = '/?ydelser=hjemmeside&sider=6-8&bestilling=ja&drift=egen&trin=4'
  await open(page, calcUrl)
  await page.evaluate(() => document.querySelector('#eksempler a').scrollIntoView())
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#eksempler li a')])
  const back = await page.evaluate(() => document.querySelector('.dm-strip-back')?.getAttribute('href') ?? '')
  check(/\/demoer\//.test(page.url()) && back.startsWith(calcUrl), `DEMO retur-link ${back}`)
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.dm-strip-back')])
  await wait(400)
  check((await shown(page)).once === 6500 && (await search(page)) === calcUrl.slice(1), `DEMO valg mistet efter retur: ${await search(page)}`)

  // Ydelsessiderne: beregneren virker (forvalgt ydelse), og siden har ingen fejl.
  for (const path of ['/hjemmeside/', '/marketing/', '/booking-google/', '/priser/']) {
    await open(page, path)
    check(!!(await page.$('#beregner')) && /Trin 1|Trin \d/.test(await calc(page)), `YDELSESSIDE ${path}: beregneren mangler`)
    if (path === '/hjemmeside/') {
      await click(page, 'Næste')
      await click(page, '2-5 sider')
      await click(page, 'Nej')
      await click(page, 'Næste')
      await click(page, 'Ekstra')
      await click(page, 'Vis min pris')
      const s = await shown(page)
      check(s.once === 4000 && s.monthly === 399, `YDELSESSIDE ${path}: pris ${s.once}/${s.monthly}`)
    } else if (path === '/marketing/') {
      await click(page, 'Næste')
      await click(page, '8 videoer')
      await click(page, 'Ja, gerne')
      await click(page, '=Nej')
      await click(page, 'Vis min pris')
      check(/2\.500\s*kr\./.test(await calc(page)) && /\/md|måned/.test(await calc(page)), `YDELSESSIDE ${path}: pris ${(await calc(page)).slice(0, 120)}`)
    } else if (path === '/booking-google/') {
      await click(page, 'Næste')
      await click(page, '=Ja')
      await click(page, '=Nej')
      await click(page, 'Vis min pris')
      check(/1\.000\s*kr\./.test(await calc(page)), `YDELSESSIDE ${path}: pris ${(await calc(page)).slice(0, 120)}`)
    }
    check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `YDELSESSIDE ${path}: vandret scroll`)
  }

  // Kontaktlinks: tel, sms (med forudfyldt tekst) og mail.
  await open(page, '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4')
  const links = await page.evaluate(() => ({
    tel: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
    sms: [...document.querySelectorAll('a[href^="sms:"]')].map((a) => a.getAttribute('href')),
    mail: [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')),
  }))
  check(links.tel.length >= 2 && links.tel.every((h) => h === 'tel:+4553613699'), `KONTAKT tel-links: ${links.tel}`)
  check(links.sms.length >= 2 && links.sms.every((h) => h.startsWith('sms:+4553613699')), `KONTAKT sms-links: ${links.sms.map((h) => h.slice(0, 30))}`)
  check(links.mail.length >= 1 && links.mail.every((h) => h.startsWith('mailto:kontakt@oviaspecs.com')), `KONTAKT mail-links: ${links.mail}`)
  const smsBody = decodeURIComponent(links.sms.find((h) => h.includes('body='))?.split('body=')[1] ?? '')
  check(/4\.000 kr\./.test(smsBody) && /199 kr\./.test(smsBody) && /Plus/.test(smsBody), `KONTAKT sms i beregneren indeholder ikke valg og pris: ${smsBody.slice(0, 120)}`)

  // Guidens afklaring: "Jeg er ikke sikker" -> "Jeg ved det ikke" giver ingen pris, men Ring/SMS.
  await open(page, '/')
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Jeg er ikke sikker')
  await click(page, 'Næste')
  await click(page, 'Jeg ved det ikke')
  await click(page, 'Se resultatet')
  const t = await calc(page)
  check(/Lad os tage en kort snak/.test(t) && !/\d\.\d{3}\s*kr\./.test(t) && /53 61 36 99/.test(t), `GUIDE afklaring: ${t.slice(0, 160)}`)
  check(await page.evaluate(() => !!document.querySelector('#beregner a[href^="tel:"]') && !!document.querySelector('#beregner a[href^="sms:"]')), 'GUIDE afklaring: Ring/SMS mangler')
  await closePage(page)
}

/* ===================================================================== */
const only = process.env.ONLY?.split(',')
const sections = { priser: testPrices, tilstand: testState, rundvisning: testTour, henvendelse: testInquiry, visuelt: testVisual, tastatur: testKeyboard, bevaegelse: testMotionAndNoJs, regression: testRegressions }
for (const [name, fn] of Object.entries(sections)) {
  if (only && !only.includes(name)) continue
  const before = failures.length
  const t0 = Date.now()
  try {
    await fn()
  } catch (e) {
    failures.push(`${name}: testen blev afbrudt: ${e.stack?.split('\n').slice(0, 3).join(' | ') ?? e}`)
  }
  console.log(`${failures.length === before ? 'ok  ' : 'FEJL'} ${name} (${((Date.now() - t0) / 1000).toFixed(0)} s)`)
}

await browser.close()
// 500 kommer fra den efterlignede serverfejl; resten er rigtige fejl.
const unique = [...new Set(errors)].filter((e) => !/status of 500/.test(e) && !/Page entered Back-Forward Cache/.test(e))
check(unique.length === 0, `KONSOL: ${unique.slice(0, 5).join(' | ')}`)
for (const n of notes) console.log(`note: ${n}`)
if (smallNotes.size) console.log(`note: tekst på 12-13 px (${smallNotes.size}): ${[...smallNotes].filter((x) => x.startsWith('375px')).join(' | ')}`)
if (targetNotes.size) console.log(`note: trykflader på 40-43 px (${targetNotes.size}): ${[...targetNotes].filter((x) => x.startsWith('375px')).join(' | ')}`)
if (minContrast < 21) console.log(`note: laveste målte tekstkontrast: ${minContrast.toFixed(2)}:1 (tekst over gradient/billede kan ikke måles)`)
if (failures.length) {
  console.error(`A11y/browsertest FEJLET (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('A11y/browsertest bestået.')
