/**
 * Browsertest af siden og beregneren (vej, pakker, funktioner, rabat): forside, /hjemmeside/, /priser/.
 * De tre veje og layout i alle bredder dækkes af test-veje-e2e.mjs; her ligger resten (Begge dele som eksempel).
 *
 * Kræver en kørende `npm run preview` (http://localhost:4173, eller SITE=…) og Chrome
 * (CHROME=… hvis den ikke ligger på standardstien). Skærmbilleder af hvert trin gemmes,
 * hvis SHOTS=<mappe> er sat.
 *
 * Tjekker: fejl i konsollen, vandret scroll, trykflader ≥ 48 px, at Næste-knappen ikke ligger bag
 * bundbaren, tælleværk og kvittering, flyvende beløb, bottom sheet, adresselinje og del-link, guidet
 * hjælp, intropris (tændt og slukket), fjernelse, reduceret bevægelse og tastaturets første stop.
 * Er der ingen intro-pladser tilbage i prices.json, springes intro-trinene over, og testen tjekker i stedet,
 * at introprisen ikke findes nogen steder.
 */
import { mkdirSync, readFileSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const INTRO = JSON.parse(readFileSync('src/data/prices.json', 'utf8')).introSlotsLeft > 0
/** Antal trin på vejen Begge dele: Behov, Pakke, Hvad skal løses?, Samlet pris (rabatten er ikke et trin). */
const N = 4

let failed = 0
let total = 0
const check = (ok, msg) => {
  total++
  if (!ok) failed++
  console.log(`${ok ? '  ok ' : '  FEJL'} ${msg}`)
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

async function open(width, height, mobile, path = '/', { reduced = false } = {}) {
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile })
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(SITE + path, { waitUntil: 'networkidle0' })
  await wait(400)
  return { page, errors }
}

const shot = async (page, name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` })

/** Klikker den første knap/link i `root`, hvis tekst indeholder `text` (rigtigt tryk i midten). */
async function press(page, text, root = '#prisberegner') {
  const el = await page.evaluateHandle(
    (text, root) => [...document.querySelectorAll(`${root} button, ${root} a`)].find((b) => ((b.getAttribute('aria-label') ?? '') + ' ' + b.textContent.replace(/\s+/g, ' ')).includes(text) && b.offsetParent !== null && !b.disabled),
    text,
    root,
  )
  if (!el.asElement()) throw new Error(`fandt ikke "${text}"`)
  // Som en bruger: knappen skal kunne ses og trykkes, ikke ligge bag den klæbende navigation eller bundbaren.
  const reachable = await el.asElement().evaluate((e) => {
    for (const block of ['nearest', 'center', 'start', 'end']) {
      e.scrollIntoView({ block, behavior: 'instant' })
      const r = e.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      if (hit && (e === hit || e.contains(hit))) return true
    }
    return false
  })
  if (!reachable) throw new Error(`"${text}" kan ikke trykkes: noget ligger ovenpå`)
  const box = await el.asElement().boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await wait(250)
}

/** Totalerne (aria-label på tælleværkerne) i en container, i rækkefølgen engang, pr. måned. */
const totals = (page, scope) => page.$$eval(`${scope} [role="img"][aria-label]`, (els) => els.map((e) => e.getAttribute('aria-label')).filter((l) => /^[\d.]+$/.test(l)))

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
const text = (page, sel = '#prisberegner') => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' '))
const scrollCalc = (page) => page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))

/** Alle synlige knapper i et område skal være mindst 48 px høje (trykflader). */
async function smallTargets(page, scope) {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope)
    if (!root) return ['(ikke fundet)']
    const out = []
    for (const e of root.querySelectorAll('button, a[href], [role="button"]')) {
      const r = e.getBoundingClientRect()
      const cs = getComputedStyle(e)
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') continue
      if (e.closest('[inert]')) continue
      if (r.height < 47.5 && e.tagName !== 'A') out.push(`${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)} (${Math.round(r.height)} px)`)
    }
    return out
  }, scope)
}

/* ------------------------------------------------------------------ mobil */
for (const [w, h] of [
  [375, 667],
  [390, 844],
]) {
  console.log(`\nMobil ${w}×${h}`)
  const { page, errors } = await open(w, h, true)
  const tag = `${w}x${h}`
  await shot(page, `${tag}-01-forside`)
  check((await overflow(page)) <= 0, 'ingen vandret scroll på forsiden')

  // Første tastaturstop er "Spring til indhold".
  await page.keyboard.press('Tab')
  check(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'Tab: første stop er skip-linket')
  await page.evaluate(() => document.activeElement.blur())

  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await wait(500)
  const top = await page.evaluate(() => Math.round(document.querySelector('#prisberegner > div').getBoundingClientRect().top))
  check(Math.abs(top - 72) <= 2, `beregneren ligger lige under navigationen (top ${top} px)`)
  const calcH = await page.evaluate(() => Math.round(document.querySelector('#prisberegner > div').getBoundingClientRect().height))
  check(Math.abs(calcH - (h - 72)) <= 2 || calcH >= 540, `beregneren fylder skærmen under navigationen (${calcH} px)`)
  await shot(page, `${tag}-02-trin1`)
  const small1 = await smallTargets(page, '#prisberegner')
  check(small1.length === 0, `trin 1: trykflader ≥ 48 px ${small1.join(', ')}`)
  const t0 = await text(page)
  check(t0.includes('Hvad har I brug for?') && t0.includes('Ny hjemmeside') && t0.includes('Løs et problem') && t0.includes('Begge dele'), 'trin 1: Hvad har I brug for?')
  check((await page.$eval('#prisberegner button:disabled', (b) => b.textContent)).includes('Vælg, hvad I har brug for'), 'Næste er slukket, til der er valgt, hvad I har brug for')
  await press(page, 'Begge dele') // ét tryk på vejen går videre (mobil)
  const t1 = await text(page)
  check(['Start', 'Anbefalet', 'Max'].every((n) => t1.includes(n)) && t1.includes('5.000') && t1.includes('9.500') && t1.includes('15.000'), 'pakketrinnet viser de tre pakker med faste priser')
  check(!/\bfra\s+\d/.test(t1), 'pakketrinnet: ingen "fra"-priser')
  check((await page.$eval('#prisberegner button:disabled', (b) => b.textContent)).includes('Næste: Hvad skal løses?'), 'Næste er slukket, til der er valgt en pakke')

  // Pakketrinnet: vælg Anbefalet.
  await press(page, 'Anbefalet')
  await wait(900)
  let t = await totals(page, '#prisberegner')
  check(t[0] === '9.500' && t[1] === '699', `tælleværk: Anbefalet = 9.500 engang og 699 pr. måned (${t.slice(0, 2)})`)
  await shot(page, `${tag}-03-pakke`)

  // Næste-knappen ligger over bundbaren, ikke bag den.
  const rects = await page.evaluate(() => {
    const next = [...document.querySelectorAll('#prisberegner button')].find((b) => b.textContent.startsWith('Næste')).getBoundingClientRect()
    const bar = document.querySelector('#prisberegner [aria-label*="dine valg"][role="button"]').getBoundingClientRect()
    return { nextBottom: next.bottom, barTop: bar.top }
  })
  check(rects.nextBottom <= rects.barTop + 0.5, `Næste ligger over bundbaren (${Math.round(rects.nextBottom)} ≤ ${Math.round(rects.barTop)})`)

  // Trin 2: systemer. Anbefalet har ét med.
  await press(page, 'Næste: Hvad skal løses?')
  await wait(600)
  check((await text(page)).includes(`Trin 3 af ${N} · Hvad skal løses?`), 'trin 3: Hvad skal løses?')
  await shot(page, `${tag}-04-systemer`)
  const small2 = await smallTargets(page, '#prisberegner')
  check(small2.length === 0, `trin 2: trykflader ≥ 48 px ${small2.join(', ')}`)
  await press(page, 'Gæsterne skal kunne booke bord')
  await wait(700)
  t = await totals(page, '#prisberegner')
  check(t[0] === '9.500' && t[1] === '699', `Bordbooking indgår i Anbefalet: uændret pris (${t.slice(0, 2)})`)
  check((await text(page)).includes('Indgår'), 'Bordbooking viser "Indgår"')
  await press(page, 'Gæsterne skal kunne bestille mad')
  const flyOk = await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]'))
  check(flyOk, 'flyvende beløb vises, når et tilvalg lægges til')
  await wait(900)
  t = await totals(page, '#prisberegner')
  check(t[0] === '13.000' && t[1] === '1.148', `Online bestilling som ekstra: 13.000 og 1.148 pr. måned (${t.slice(0, 2)})`)
  check((await text(page)).includes('+3.500'), 'Online bestilling viser tilvalgsprisen')

  // Kvitteringsarket.
  await page.click('#prisberegner [role="button"][aria-label="Se dine valg"]')
  await wait(700)
  check(await page.$eval('#prisberegner [role="dialog"]', (e) => !e.hasAttribute('inert')), 'kvitteringsarket åbner')
  const sheet = await page.$eval('#prisberegner [role="dialog"]', (e) => e.textContent)
  check(sheet.includes('Alle priser er ekskl. moms') && sheet.includes('Anbefalet') && sheet.includes('Online bestilling'), 'arket viser pakke, system og "Alle priser er ekskl. moms"')
  await shot(page, `${tag}-05-kvittering`)
  await page.keyboard.press('Escape')
  await wait(600)
  check(await page.$eval('#prisberegner [role="dialog"]', (e) => e.hasAttribute('inert')), 'Escape lukker arket')

  // Sidste trin: først prisen, så det stille spørgsmål om at vise siden som eksempel (kun mens der er intro-pladser).
  await press(page, 'Se samlet pris')
  await wait(700)
  await shot(page, `${tag}-06-opsummering`)
  check(!/Engelsk version/.test(await text(page)), 'ingen tilvalg "Engelsk version"')
  const hasIntro = await page.evaluate(() => [...document.querySelectorAll('#prisberegner button')].some((b) => b.textContent.includes('Må vi vise jeres side som eksempel')))
  check(hasIntro === INTRO, `spørgsmålet om at vise siden som eksempel vises kun, når der er pladser (${hasIntro}, pladser: ${INTRO})`)
  const t3 = await text(page)
  check(!/pladser? tilbage|første \d+ kunder/.test(t3), 'ingen knaphedstekst ("pladser tilbage")')
  check(!/Introduktionspris/.test(t3), 'ingen intropris, før kunden selv siger ja')
  t = await totals(page, '#prisberegner')
  check(t[0] === '13.000' && t[1] === '1.148', `før intro: 13.000 og 1.148 (${t.slice(0, 2)})`)
  if (INTRO) {
    const off = await page.evaluate(() => [...document.querySelectorAll('#prisberegner button')].find((b) => b.textContent.includes('Må vi vise jeres side som eksempel')).getAttribute('aria-pressed'))
    check(off === 'false', `intro er slået fra som standard (${off})`)
    await press(page, 'Må vi vise jeres side som eksempel')
    await wait(900)
    t = await totals(page, '#prisberegner')
    check(t[0] === '11.995' && t[1] === '1.148', `intro valgt: 11.995 engang (introOnce for Anbefalet 8.495 + 3.500) og 1.148 pr. måned (${t.slice(0, 2)})`)
    const struck = await page.$$eval('#prisberegner s, #prisberegner del, #prisberegner .line-through', (e) => e.length)
    check(struck === 0, 'ingen overstregede priser')
    await shot(page, `${tag}-07-intro`)
  }
  await wait(300)
  check((await text(page)).includes('Din pris er klar.'), 'opsummering vises')
  t = await totals(page, '#prisberegner')
  const wantOnce = INTRO ? '11.995' : '13.000'
  check(t[0] === wantOnce && t[1] === '1.148', `opsummering: ${wantOnce} engang og 1.148 pr. måned (${t.slice(0, 2)})`)
  await page.waitForSelector('#prisberegner form')
  check(await page.$eval('#prisberegner form button[type="submit"]', (e) => e.textContent.includes('Send mine valg')), 'opsummeringen har formularen med "Send mine valg"')
  check((await page.$eval('#prisberegner a[href^="sms:"]', (e) => e.getAttribute('href'))).startsWith('sms:+4553613699?body='), 'SMS-link står under formularen')
  const url = page.url()
  check(/[?&]v=b/.test(url) && /[?&]p=1/.test(url) && /[?&]y=bo/.test(url) && !/[?&]e=/.test(url) && (INTRO ? /[?&]i=1/.test(url) : !/[?&]i=/.test(url)) && /[?&]t=sum/.test(url), `adresselinjen følger valgene (${url.replace(SITE, '')})`)
  await shot(page, `${tag}-08-opsummering`)
  check((await overflow(page)) <= 0, 'ingen vandret scroll efter beregneren')
  check(errors.length === 0, `ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()

  // Del-link: åbnes igen på opsummeringen.
  const re = await open(w, h, true, new URL(url).pathname + new URL(url).search)
  await re.page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await wait(400)
  check((await text(re.page)).includes('Din pris er klar.'), 'del-linket åbner opsummeringen igen')
  t = await totals(re.page, '#prisberegner')
  check(t[0] === wantOnce && t[1] === '1.148', 'del-linket giver samme priser')
  await re.page.close()

  // Et gammelt link (fra før pakkerne) giver en venlig besked og vælger intet.
  const old = await open(w, h, true, '/?w=1&m=1&d=p&bk=1&s=4')
  await old.page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await wait(300)
  check((await text(old.page)).includes('Beregneren er opdateret med nye pakker'), 'gammelt link: venlig besked')
  check((await totals(old.page, '#prisberegner')).length === 0 || (await totals(old.page, '#prisberegner'))[0] === '0', 'gammelt link: intet er valgt')
  await old.page.close()

  // Guidet hjælp: op til 6 sider + Bordbooking + ingen special = Anbefalet med Bordbooking (9.500 + 549/md.).
  const g = await open(w, h, true)
  await g.page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await press(g.page, 'Ny hjemmeside')
  await press(g.page, 'Hjælp mig med at vælge')
  await shot(g.page, `${tag}-09-hjaelp`)
  await press(g.page, 'Op til 6 sider')
  await press(g.page, 'Gæsterne skal kunne booke bord')
  await press(g.page, 'Næste spørgsmål')
  await press(g.page, 'Nej')
  await wait(900)
  check((await text(g.page)).includes('Det her ville vi starte med.'), 'guidet hjælp viser forslaget')
  t = await totals(g.page, '#prisberegner')
  check(t[0] === '9.500' && t[1] === '699', `forslaget ligger i beregneren: 9.500 + 699/md. (${t.slice(0, 2)})`)
  await shot(g.page, `${tag}-10-forslag`)
  await g.page.close()
}

/* ---------------------------------------------------------------- desktop */
{
  console.log('\nDesktop 1440×900')
  const { page, errors } = await open(1440, 900, false)
  await shot(page, '1440-01-forside')
  check((await overflow(page)) <= 0, 'ingen vandret scroll på forsiden')
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await wait(500)
  const aside = await page.$eval('#prisberegner aside', (e) => ({ pos: getComputedStyle(e).position, w: Math.round(e.getBoundingClientRect().width) }))
  check(aside.pos === 'sticky' && aside.w === 440, `spec-arket er sticky og 440 px bredt (${aside.pos}, ${aside.w})`)
  await shot(page, '1440-02-trin1')

  await press(page, 'Begge dele')
  await press(page, 'Næste: Vælg pakke')
  await press(page, 'Max')
  await wait(900)
  let t = await totals(page, '#prisberegner aside')
  check(t[0] === '15.000' && t[1] === '1.295', `kvittering: Max = 15.000 og 1.295 pr. måned (${t.slice(0, 2)})`)
  await press(page, 'Næste: Hvad skal løses?')
  await shot(page, '1440-03-systemer')
  await press(page, 'Gæsterne skal kunne booke bord')
  await press(page, 'Gæsterne skal kunne bestille mad')
  await wait(900)
  t = await totals(page, '#prisberegner aside')
  check(t[0] === '15.000' && t[1] === '1.295', `Max: bordbooking og online bestilling indgår begge (${t.slice(0, 2)})`)
  await press(page, 'Lad et system tage det')
  await wait(900)
  t = await totals(page, '#prisberegner aside')
  check(t[0] === '15.000' && t[1] === '1.295', `Max: noget bygget specielt har ingen pris og ændrer ikke totalen (${t.slice(0, 2)})`)
  check((await text(page, '#prisberegner aside')).includes('Pris aftales'), 'kvitteringen viser "Pris aftales" ved bygget specielt')
  await press(page, 'Se samlet pris')
  await shot(page, '1440-04-opsummering')
  check(!/Engelsk version/.test(await text(page)), 'ingen tilvalg "Engelsk version"')
  await wait(700)
  await shot(page, '1440-05-opsummering')
  check((await text(page)).includes('Send mine valg'), 'opsummering med "Send mine valg"')
  const small = await smallTargets(page, '#prisberegner')
  check(small.length === 0, `desktop: trykflader ≥ 48 px ${small.join(', ')}`)
  check(errors.length === 0, `ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()

  // Navigation: under 1120 px foldes menuen ind i "Menu".
  const nav = await open(1100, 800, false)
  check(await nav.page.$eval('header', (e) => [...e.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Menu')), 'under 1120 px: "Menu"-knap')
  await press(nav.page, 'Menu', 'header')
  await wait(600)
  await shot(nav.page, '1100-menu')
  check(await nav.page.$eval('#fuldmenu', (e) => e.textContent.includes('Ring til Ronny')), 'fuldskærmsmenuen åbner med links og "Ring til Ronny"')
  await nav.page.keyboard.press('Escape')
  await wait(300)
  check(!(await nav.page.$('#fuldmenu')), 'Escape lukker menuen')
  await nav.page.close()
}

/* ------------------------------------------------------------- undersider */
for (const [w, h, mobile] of [
  [375, 667, true],
  [390, 844, true],
  [1440, 900, false],
]) {
  for (const path of ['/priser/', '/hjemmeside/', '/cases/', '/cases/palmy-spisested/', '/privatlivspolitik/']) {
    const { page, errors } = await open(w, h, mobile, path)
    const name = `${w}x${h}${path.replaceAll('/', '-')}`
    await shot(page, name)
    check((await overflow(page)) <= 0 && errors.length === 0, `${path} ${w}×${h}: ingen vandret scroll og ingen konsolfejl ${errors.join(' | ')}`)
    if (path === '/priser/') {
      const cells = await page.$$eval('[role="table"] [role="cell"]', (c) => c.length)
      check(cells === 48, `/priser/: tabelceller (${cells})`)
      const body = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '))
      check(body.includes('5.000') && body.includes('9.500') && body.includes('15.000') && body.includes('299') && body.includes('699') && body.includes('1.295'), '/priser/: alle tre pakkepriser')
      check(body.includes('Hvor lang tid tager det?') && body.includes('1–2 uger') && body.includes('2–3 uger'), '/priser/: leveringstid')
      check(INTRO ? body.includes('Introduktionspris') : !/ntro/.test(body), INTRO ? '/priser/: intropris vises' : '/priser/: ingen spor af intropris ved 0 pladser')
      check(!/pladser? tilbage|første \d+ kunder/.test(body), '/priser/: ingen knaphedstekst')
    }
    if (path === '/hjemmeside/') {
      check(await page.$('#prisberegner') !== null && (await page.$('#systemer')) !== null, '/hjemmeside/: beregner og systemsektion')
      const body = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' '))
      check(/bordbooking/i.test(body) && body.includes('Pris aftales') && body.includes('lager') && body.includes('Hvor lang tid tager det?'), '/hjemmeside/: funktioner, idéer og leveringstid')
    }
    await page.close()
  }
}

/* ------------------------------------------------------------- fjernelse */
// Fjernelse skal være roligt: intet flyvende beløb, "−99 kr./md."-chip i #7A766F, totalen tæller ned, linjen folder sammen,
// og når alt er fjernet, står der en rolig tom tilstand i stedet for "0 kr.".
for (const [label, w, h, mobile] of [
  ['Mobil 390×844', 390, 844, true],
  ['Desktop 1440×900', 1440, 900, false],
]) {
  console.log(`\nFjernelse, ${label}`)
  const { page, errors } = await open(w, h, mobile, '/?v=b&p=1&y=bo&t=sys')
  await scrollCalc(page)
  await wait(900)
  const scope = mobile ? '#prisberegner [role="button"][aria-label*="dine valg"]' : '#prisberegner aside'
  let t = await totals(page, '#prisberegner')
  check(t[0] === '13.000' && t[1] === '1.148', `før: 13.000 og 1.148 (${t.slice(0, 2)})`)
  const widthOf = () => page.$$eval(`${scope} [role="img"][aria-label]`, (els) => els.filter((e) => ['1.148', '699'].includes(e.getAttribute('aria-label'))).map((e) => Math.round(e.getBoundingClientRect().width)).at(-1))
  const wBefore = await widthOf()
  await page.evaluate((scope) => {
    window.__samples = []
    const id = setInterval(() => {
      const els = [...document.querySelectorAll(scope + ' [role="img"][aria-label]')].filter((e) => ['1.148', '699'].includes(e.getAttribute('aria-label')))
      window.__samples.push({ w: Math.round(els.at(-1)?.getBoundingClientRect().width ?? 0), ghosts: document.querySelectorAll('#prisberegner [data-exiting]').length })
    }, 20)
    setTimeout(() => clearInterval(id), 1400)
  }, scope)
  await press(page, 'Gæsterne skal kunne bestille mad')
  const mid = {
    fly: await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]')),
    chip: await page.$$eval('#prisberegner .delta-chip', (c) => c.map((x) => x.textContent)),
    color: await page.$eval('#prisberegner .delta-chip', (c) => getComputedStyle(c).color).catch(() => ''),
  }
  await wait(1300)
  const samples = await page.evaluate(() => window.__samples)
  check(!mid.fly, 'ingen flyvende beløb ved fjernelse')
  check(mid.chip.some((c) => c.includes('−449') && c.includes('kr./md.')), `"−449 kr./md." vises kort (${mid.chip})`)
  check(/rgb\(122, 118, 111\)/.test(mid.color), `chippen er #7A766F (${mid.color})`)
  t = await totals(page, '#prisberegner')
  check(t[0] === '9.500' && t[1] === '699', `efter: 9.500 og 699 (${t.slice(0, 2)})`)
  const widths = [...new Set(samples.map((x) => x.w))]
  const afterW = await widthOf()
  check(afterW <= wBefore, `totalen er ikke blevet bredere ved fjernelse (${wBefore} → ${widths.join(', ')} px)`)
  if (!mobile) check(Math.max(...samples.map((x) => x.ghosts)) > 0, 'linjen er stadig i kvitteringen, mens den folder sammen (exit)')
  check(/[?&]y=b(&|$)/.test(page.url()) && !/y=bo/.test(page.url()), `del-linket har ikke længere Online bestilling (${page.url().replace(SITE, '')})`)
  // Sænk pakken: også her intet flyvende beløb, og totalen falder.
  await page.goto(`${SITE}/?v=b&p=2&t=pkg`, { waitUntil: 'networkidle0' })
  await scrollCalc(page)
  await wait(500)
  await press(page, 'Start')
  await wait(700)
  t = await totals(page, '#prisberegner')
  check(t[0] === '5.000' && t[1] === '299', `pakken sænket til Start: 5.000 og 299 (${t.slice(0, 2)})`)
  check(!(await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]'))), 'ingen flyvende beløb, når en pakke sænkes')
  // Fjern alt: tryk på den valgte pakke igen giver den rolige tomme tilstand.
  await press(page, 'Start')
  await wait(1300)
  const empty = await page.evaluate(() => {
    const root = document.querySelector('#prisberegner')
    const vis = (el) => el && getComputedStyle(el).visibility === 'visible' && Number(getComputedStyle(el).opacity) > 0.9
    const msg = [...root.querySelectorAll('.swap-in')].find((e) => /Vælg[^.]*for at se prisen/.test(e.textContent))
    const off = [...root.querySelectorAll('.swap-out')].filter((e) => e.querySelector('[role="img"]'))
    return { msg: vis(msg), totalsHidden: off.length > 0 && off.every((e) => !vis(e)), url: location.search }
  })
  check(empty.msg, 'tom tilstand med "Vælg … for at se prisen", når alt er fjernet')
  check(empty.totalsHidden, 'totalerne ("0 kr.") er skjult i den tomme tilstand')
  check(!/[?&](p|y|c|i)=/.test(empty.url), `del-linket har ingen valg (${empty.url})`)
  check(errors.length === 0, `ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()
}

// Fjernelse midt i flowet (mobil): skift pakke på trin 1 efter at have været på trin 3. Trinene hopper ikke forkert.
{
  console.log('\nFjernelse midt i flowet (mobil)')
  const { page } = await open(390, 844, true)
  await scrollCalc(page)
  await press(page, 'Begge dele') // ét tryk på vejen går videre (mobil)
  await press(page, 'Max')
  await press(page, 'Næste: Hvad skal løses?')
  await press(page, 'Gæsterne skal kunne booke bord')
  await press(page, 'Se samlet pris')
  await wait(500)
  for (let i = 0; i < 6; i++) {
    if ((await text(page)).includes(`Trin 2 af ${N}`)) break
    const back = await page.evaluateHandle(() => [...document.querySelectorAll('#prisberegner button')].find((b) => /Tilbage/.test((b.getAttribute('aria-label') ?? '') + b.textContent) && b.offsetParent !== null))
    if (!back.asElement()) break
    await back.asElement().click()
    await wait(350)
  }
  check((await text(page)).includes(`Trin 2 af ${N}`), 'tilbage på pakketrinnet')
  await press(page, 'Max') // fjern pakken
  await wait(900)
  check(!/[?&](p|i)=/.test(page.url()), `pakken er fjernet fra del-linket (funktionerne bliver valgt) (${page.url().replace(SITE, '')})`)
  check(await page.$eval('#prisberegner button:disabled', (b) => b.textContent.includes('Næste: Hvad skal løses?')), 'uden pakke kan man ikke gå videre')
  await page.close()
}

/* ------------------------------------------------------ reduceret bevægelse */
{
  console.log('\nReduceret bevægelse')
  const { page } = await open(390, 844, true, '/', { reduced: true })
  await scrollCalc(page)
  await press(page, 'Begge dele') // ét tryk på vejen går videre (mobil)
  await press(page, 'Anbefalet')
  await press(page, 'Næste: Hvad skal løses?')
  await press(page, 'Gæsterne skal kunne booke bord')
  await press(page, 'Gæsterne skal kunne bestille mad')
  check(!(await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]'))), 'ingen flyvende beløb')
  await press(page, 'Gæsterne skal kunne bestille mad')
  await wait(150)
  check((await page.$$eval('#prisberegner .delta-chip', (c) => c.length)) === 0, 'reduceret bevægelse: ingen "−449 kr./md."-chip ved fjernelse')
  const dur = await page.evaluate(() => {
    const col = document.querySelector('#prisberegner [role="img"][aria-label] span span')
    return getComputedStyle(col).transitionDuration
  })
  check(dur === '0s', `tælleværket skifter uden overgang (${dur})`)
  await page.close()
}

await browser.close()
console.log(failed ? `\n${failed} fejl af ${total} kontroller` : `\nAlt ok (${total} kontroller)`)
process.exit(failed ? 1 : 0)
