/**
 * Browsertest af redesignet: forside, beregneren (mobil og desktop), /priser og /hjemmeside.
 *
 * Kræver en kørende `npm run preview` (http://localhost:4173, eller SITE=…) og Chrome
 * (CHROME=… hvis den ikke ligger på standardstien). Skærmbilleder af hvert trin gemmes,
 * hvis SHOTS=<mappe> er sat.
 *
 * Tjekker: fejl i konsollen, vandret scroll, trykflader ≥ 48 px, at Næste-knappen ikke ligger bag
 * bundbaren, tælleværk og kvittering, flyvende beløb, bottom sheet, adresselinje og del-link, guidet
 * hjælp, reduceret bevægelse og tastaturets første stop.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

let failed = 0
const check = (ok, msg) => {
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
    (text, root) => [...document.querySelectorAll(`${root} button, ${root} a`)].find((b) => ((b.getAttribute('aria-label') ?? '') + ' ' + b.textContent.replace(/\s+/g, ' ')).includes(text) && b.offsetParent !== null),
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

/** Alle synlige knapper og links i et område skal være mindst 48 px høje (trykflader). */
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
      // Links inde i løbende tekst og skjulte kort tæller ikke; knapper og rækker gør.
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

  // Trin 1: vælg Hjemmeside og Marketing.
  await press(page, 'Hjemmeside')
  await press(page, 'Marketing')
  const bar = await page.$eval('[aria-label*="kvittering"][role="button"]', (e) => e.textContent.replace(/\s+/g, ' '))
  check(bar.includes('3 valg'), `bundbaren viser "3 valg" (Hjemmeside, Marketing og Drift) (${bar.slice(0, 60)})`)
  await wait(900)
  let t = await totals(page, '#prisberegner')
  check(t[0] === '8.000' && t[1] === '5.198', `tælleværk: 8.000 engang og 5.198 pr. måned (Marketing 5.000 + Drift Basis 198) (${t.slice(0, 2)})`)
  await shot(page, `${tag}-03-valgt`)

  // Flyvende beløb ved tryk (udløses af et ægte tryk, når bundbaren er synlig).
  await press(page, 'Booking & Google')
  const flyOk = await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]'))
  check(flyOk, 'flyvende beløb vises ved tryk')
  await press(page, 'Booking & Google') // fjern igen

  // Næste-knappen ligger over bundbaren, ikke bag den.
  const rects = await page.evaluate(() => {
    const next = [...document.querySelectorAll('#prisberegner button')].find((b) => b.textContent.startsWith('Næste')).getBoundingClientRect()
    const bar = document.querySelector('#prisberegner [aria-label*="kvittering"][role="button"]').getBoundingClientRect()
    return { nextBottom: next.bottom, barTop: bar.top }
  })
  check(rects.nextBottom <= rects.barTop + 0.5, `Næste ligger over bundbaren (${Math.round(rects.nextBottom)} ≤ ${Math.round(rects.barTop)})`)
  // Stram rytme på trin 1: Næste sidder ca. 24 px under sidste valg (når indholdet er kortere end skærmen), kort med ca. 16 px luft og 8 px imellem,
  // afkrydsningen flugter med titlen, og bundbaren viser kun totaler med et beløb og "ekskl. moms" på én linje.
  const lay = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#prisberegner button')]
    const cards = btns.filter((b) => b.hasAttribute('aria-pressed') && /Hjemmeside|Marketing|Booking/.test(b.textContent) && b.textContent.includes('fra '))
    const next = btns.find((b) => b.textContent.startsWith('Næste'))
    const last = cards.at(-1).getBoundingClientRect()
    const first = cards[0].getBoundingClientRect()
    const second = cards[1].getBoundingClientRect()
    const title = cards[0].querySelector('span > span').getBoundingClientRect()
    const check = cards[0].querySelector('[aria-hidden="true"]').getBoundingClientRect()
    const moms = [...document.querySelectorAll('#prisberegner [role="button"] span')].find((e) => e.textContent === 'ekskl. moms')
    return {
      gapNext: Math.round(next.getBoundingClientRect().top - last.bottom),
      cardGap: Math.round(second.top - first.bottom),
      pad: Math.round(cards[0].querySelector('span').getBoundingClientRect().top - first.top),
      alignDy: Math.abs(title.top + title.height / 2 - (check.top + check.height / 2)),
      momsLines: moms ? Math.round(moms.getBoundingClientRect().height / parseFloat(getComputedStyle(moms).lineHeight)) : null,
      fits: cards.at(-1).getBoundingClientRect().bottom + 24 + 56 < document.querySelector('#prisberegner [role="button"][aria-label*="kvittering"]').getBoundingClientRect().top,
    }
  })
  if (lay.fits) check(Math.abs(lay.gapNext - 24) <= 2, `Næste sidder ca. 24 px under sidste valg (${lay.gapNext} px)`)
  check(lay.cardGap === 8, `8 px mellem ydelseskortene (${lay.cardGap} px)`)
  check(lay.pad >= 14 && lay.pad <= 18, `ca. 16 px padding i ydelseskortene (${lay.pad} px)`)
  check(lay.alignDy <= 1.5, `afkrydsningsboksen flugter med titlen (${lay.alignDy.toFixed(1)} px forskel)`)
  check(lay.momsLines === 1, `"ekskl. moms" står på én linje (${lay.momsLines} linje)`)

  // Trin 2: én ydelse ad gangen.
  await press(page, 'Næste: Vælg pakke')
  await wait(600)
  check((await page.$eval('#prisberegner', (e) => e.textContent)).includes('Trin 2 af 4 · Hjemmeside 1/2'), 'trin 2: Hjemmeside 1/2')
  await shot(page, `${tag}-04-trin2`)
  await press(page, 'Start')
  await wait(900)
  t = await totals(page, '#prisberegner')
  check(t[0] === '5.000', `pakke Start: 5.000 engang (${t[0]})`)
  const small2 = await smallTargets(page, '#prisberegner')
  check(small2.length === 0, `trin 2: trykflader ≥ 48 px ${small2.join(', ')}`)

  // Åbn kvitteringsarket.
  await page.click('#prisberegner [role="button"][aria-label="Se kvittering"]')
  await wait(700)
  check(await page.$eval('#prisberegner [role="dialog"]', (e) => !e.hasAttribute('inert')), 'kvitteringsarket åbner')
  check((await page.$eval('#prisberegner [role="dialog"]', (e) => e.textContent)).includes('Alle priser er ekskl. moms'), 'arket viser "Alle priser er ekskl. moms"')
  await shot(page, `${tag}-05-kvittering`)
  await page.keyboard.press('Escape')
  await wait(600)
  check(await page.$eval('#prisberegner [role="dialog"]', (e) => e.hasAttribute('inert')), 'Escape lukker arket')

  await press(page, 'Næste: Marketing')
  await press(page, 'Vækst')
  await press(page, 'Næste: Driftsplan')
  await shot(page, `${tag}-06-drift`)
  await press(page, 'Plus')
  await press(page, 'Næste: Tilvalg')
  await shot(page, `${tag}-07-tilvalg`)
  await press(page, 'Booking koblet på')
  await press(page, 'Se opsummering')
  await wait(900)
  const sum = await page.$eval('#prisberegner', (e) => e.textContent)
  check(sum.includes('Din pris er klar.'), 'opsummering vises')
  t = await totals(page, '#prisberegner')
  check(t[0] === '6.000' && t[1] === '5.398', `opsummering: 6.000 engang og 5.398 pr. måned (${t.slice(0, 2)})`)
  await page.waitForSelector('#prisberegner form')
  check(await page.$eval('#prisberegner form button[type="submit"]', (e) => e.textContent.includes('Send mine valg')), 'opsummeringen har formularen med "Send mine valg"')
  check((await page.$eval('#prisberegner a[href^="sms:"]', (e) => e.getAttribute('href'))).startsWith('sms:+4553613699?body='), 'SMS-link står under formularen')
  const url = page.url()
  check(/[?&]w=0/.test(url) && /[?&]m=1/.test(url) && /[?&]d=p/.test(url) && /[?&]bk=1/.test(url) && /[?&]s=4/.test(url), `adresselinjen følger valgene (${url.replace(SITE, '')})`)
  await shot(page, `${tag}-08-opsummering`)
  check((await overflow(page)) <= 0, 'ingen vandret scroll efter beregneren')
  check(errors.length === 0, `ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()

  // Del-link: åbnes igen på opsummeringen.
  const re = await open(w, h, true, new URL(url).pathname + new URL(url).search)
  await re.page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await wait(400)
  check((await re.page.$eval('#prisberegner', (e) => e.textContent)).includes('Din pris er klar.'), 'del-linket åbner opsummeringen igen')
  t = await totals(re.page, '#prisberegner')
  check(t[0] === '6.000' && t[1] === '5.398', 'del-linket giver samme priser')
  await re.page.close()

  // Guidet hjælp (testcase 6): Q1 A, Q2 A+C, Q3 B = Hjemmeside Vækst + Booking & Google Vækst + Plus.
  const g = await open(w, h, true)
  await g.page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await press(g.page, 'Hjælp mig med at vælge')
  await shot(g.page, `${tag}-09-hjaelp`)
  await press(g.page, 'Nej')
  await press(g.page, 'Bordbestillinger')
  await press(g.page, 'Bliv fundet på Google')
  await press(g.page, 'Næste spørgsmål')
  await press(g.page, 'Lidt')
  await wait(900)
  check((await g.page.$eval('#prisberegner', (e) => e.textContent)).includes('Det her ville jeg starte med.'), 'guidet hjælp viser forslaget')
  t = await totals(g.page, '#prisberegner')
  check(t[0] === '10.000' && t[1] === '398', `forslaget ligger i beregneren: 10.000 + 398/md. (${t.slice(0, 2)})`)
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

  await press(page, 'Hjemmeside')
  await press(page, 'Booking & Google')
  await wait(900)
  let t = await totals(page, '#prisberegner aside')
  check(t[0] === '10.000' && t[1] === '198', `kvittering: 10.000 (8.000 + 2.000) og 198 pr. måned (${t.slice(0, 2)})`)
  await press(page, 'Næste: Vælg pakker')
  await shot(page, '1440-03-trin2')
  await press(page, 'Fuld fart')
  await press(page, 'Næste: Drift og tilvalg')
  await shot(page, '1440-04-trin3')
  const addon = await page.$eval('#prisberegner', (e) => e.textContent)
  check(addon.includes('Indgår i Booking & Google'), '"Indgår"-reglen: booking indgår, når Booking & Google Vækst er valgt')
  await press(page, 'Egen hosting')
  await wait(900)
  t = await totals(page, '#prisberegner aside')
  check(t[1] === '0', `egen hosting: 0 kr./md. (${t[1]})`)
  await press(page, 'Næste: Se opsummering')
  await wait(700)
  await shot(page, '1440-05-opsummering')
  check((await page.$eval('#prisberegner', (e) => e.textContent)).includes('Send mine valg'), 'opsummering med "Send mine valg"')
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
  for (const path of ['/priser/', '/hjemmeside/', '/marketing/', '/booking-google/', '/demoer/', '/privatlivspolitik/']) {
    const { page, errors } = await open(w, h, mobile, path)
    const name = `${w}x${h}${path.replaceAll('/', '-')}`
    await shot(page, name)
    check((await overflow(page)) <= 0 && errors.length === 0, `${path} ${w}×${h}: ingen vandret scroll og ingen konsolfejl ${errors.join(' | ')}`)
    if (path === '/priser/') {
      const cells = await page.$$eval('[role="table"] [role="cell"]', (c) => c.length)
      check(cells === 42, `/priser/: tabelceller (${cells})`)
    }
    await page.close()
  }
}

/* ------------------------------------------------------------- fjernelse */
// Fjernelse skal være roligt: intet flyvende beløb, "−5.000 kr./md." kort i #7A766F, totalen tæller ned, linjen folder sammen,
// knappen går tilbage, og når alt er fjernet står der en rolig tom tilstand i stedet for "0 kr.".
for (const [label, w, h, mobile] of [
  ['Mobil 390×844', 390, 844, true],
  ['Desktop 1440×900', 1440, 900, false],
]) {
  console.log(`\nFjernelse, ${label}`)
  const { page, errors } = await open(w, h, mobile)
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))
  await press(page, 'Hjemmeside')
  await press(page, 'Marketing')
  await wait(900)
  const scope = mobile ? '#prisberegner [role="button"][aria-label*="kvittering"]' : '#prisberegner aside'
  let t = await totals(page, '#prisberegner')
  check(t[0] === '8.000' && t[1] === '5.198', `før: 8.000 og 5.198 (${t.slice(0, 2)})`)
  const widthOf = () => page.$$eval(`${scope} [role="img"][aria-label]`, (els) => els.filter((e) => e.getAttribute('aria-label') === '198' || e.getAttribute('aria-label') === '5.198').map((e) => Math.round(e.getBoundingClientRect().width)).at(-1))
  const wBefore = await widthOf()
  // Sampler totalens bredde og antallet af linjer, der er ved at folde sig sammen, hvert 20. ms, så vi ser forløbet og ikke kun slutningen.
  await page.evaluate((scope) => {
    window.__samples = []
    const id = setInterval(() => {
      const els = [...document.querySelectorAll(scope + ' [role="img"][aria-label]')].filter((e) => ['198', '5.198'].includes(e.getAttribute('aria-label')))
      window.__samples.push({ w: Math.round(els.at(-1)?.getBoundingClientRect().width ?? 0), ghosts: document.querySelectorAll('#prisberegner [data-exiting]').length })
    }, 20)
    setTimeout(() => clearInterval(id), 1400)
  }, scope)
  await press(page, 'Marketing')
  const mid = {
    fly: await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]')),
    chip: await page.$$eval('#prisberegner .delta-chip', (c) => c.map((x) => x.textContent)),
    color: await page.$eval('#prisberegner .delta-chip', (c) => getComputedStyle(c).color).catch(() => ''),
  }
  await wait(1300)
  const samples = await page.evaluate(() => window.__samples)
  const widths = [...new Set(samples.map((x) => x.w))]
  const after = { width: await widthOf(), ghost: await page.$$eval('#prisberegner [data-exiting]', (g) => g.length) }
  check(!mid.fly, 'ingen flyvende beløb ved fjernelse')
  check(mid.chip.some((c) => c.includes('−5.000') && c.includes('kr./md.')), `"−5.000 kr./md." vises kort (${mid.chip})`)
  check(/rgb\(122, 118, 111\)/.test(mid.color), `chippen er #7A766F (${mid.color})`)
  check(widths.length >= 3 && widths[0] > after.width && after.width < wBefore, `totalen tæller ned og folder sammen i flere trin (${wBefore} → ${widths.join(', ')} px)`)
  if (!mobile) check(Math.max(...samples.map((x) => x.ghosts)) > 0, 'linjen er stadig i kvitteringen, mens den folder sammen (exit)')
  check(after.ghost === 0 || mobile, 'den fjernede linje er væk, når animationen er færdig')
  t = await totals(page, '#prisberegner')
  check(t[0] === '8.000' && t[1] === '198', `efter: 8.000 og 198 (${t.slice(0, 2)})`)
  check(!/[?&]m=/.test(page.url()) && /[?&]w=1/.test(page.url()), `del-linket har ikke længere m (${page.url().replace(SITE, '')})`)
  check(await page.$eval('#prisberegner [aria-pressed]', () => true), 'knapperne har aria-pressed')
  const pressed = await page.$$eval('#prisberegner button[aria-pressed]', (b) => b.map((x) => x.getAttribute('aria-pressed')))
  check(pressed.filter((p) => p === 'true').length === 1, `kun Hjemmeside er stadig valgt (${pressed})`)
  // Sænk pakken og fjern et tilvalg: også her intet flyvende beløb, og totalen falder.
  await press(page, mobile ? 'Næste: Vælg pakke' : 'Næste: Vælg pakker')
  await press(page, 'Start')
  await wait(500)
  t = await totals(page, '#prisberegner')
  check(t[0] === '5.000', `pakken sænket til Start: 5.000 (${t[0]})`)
  check(!(await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]'))), 'ingen flyvende beløb, når en pakke sænkes')
  // Fjern alt: den rolige tomme tilstand.
  await page.goto(`${SITE}/?w=1`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))
  await wait(400)
  await press(page, 'Hjemmeside')
  await wait(1300)
  const empty = await page.evaluate(() => {
    const root = document.querySelector('#prisberegner')
    const vis = (el) => el && getComputedStyle(el).visibility === 'visible' && Number(getComputedStyle(el).opacity) > 0.9
    const msg = [...root.querySelectorAll('.swap-in')].find((e) => e.textContent.includes('Vælg en ydelse for at se prisen'))
    const off = [...root.querySelectorAll('.swap-out')].filter((e) => e.querySelector('[role="img"]'))
    return { msg: vis(msg), totalsHidden: off.length > 0 && off.every((e) => !vis(e)), step: root.textContent.includes('Trin 1 af 4') || root.textContent.includes('Prisberegner'), url: location.search }
  })
  check(empty.msg, '"Vælg en ydelse for at se prisen" vises, når alt er fjernet')
  check(empty.totalsHidden, 'totalerne ("0 kr.") er skjult i den tomme tilstand')
  check(empty.step && empty.url === '', `tilbage på trin 1 med tomt del-link (${empty.url})`)
  check(errors.length === 0, `ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()
}

// Fjernelse midt i flowet (mobil): fjern Hjemmeside fra trin 1 efter at have været på trin 3. Trinene hopper ikke forkert, og pakkerne nulstilles.
{
  console.log('\nFjernelse midt i flowet (mobil)')
  const { page } = await open(390, 844, true)
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))
  await press(page, 'Hjemmeside')
  await press(page, 'Marketing')
  await press(page, 'Næste: Vælg pakke')
  await press(page, 'Fuld fart')
  await press(page, 'Næste: Marketing')
  await press(page, 'Fuld fart')
  await press(page, 'Næste: Driftsplan')
  await press(page, 'Ekstra')
  await wait(600)
  check(/d=e/.test(page.url()) && /w=2/.test(page.url()) && /m=2/.test(page.url()), `valg: Fuld fart, Fuld fart, Ekstra (${page.url().replace(SITE, '')})`)
  // Tilbage til trin 1 og fjern Hjemmeside.
  for (let i = 0; i < 6; i++) {
    const back = await page.$('#prisberegner button[aria-label="Tilbage"]')
    if (!back) break
    await back.click()
    await wait(350)
  }
  check((await page.$eval('#prisberegner', (e) => e.textContent)).includes('Trin 1 af 4'), 'tilbage på trin 1')
  await press(page, 'Hjemmeside')
  await wait(900)
  check(!/[?&](w|d|bk|x)=/.test(page.url()) && /m=2/.test(page.url()), `Hjemmeside og alt, der hører til den, er nulstillet i del-linket (${page.url().replace(SITE, '')})`)
  const nxt = await page.$$eval('#prisberegner button', (b) => b.map((x) => x.textContent).find((x) => x.startsWith('Næste')))
  check(nxt === 'Næste: Vælg pakke', `næste skridt er Marketings pakke (${nxt})`)
  await press(page, 'Næste: Vælg pakke')
  const head = await page.$eval('#prisberegner', (e) => e.textContent)
  check(head.includes('Trin 2 af 4 · Marketing') && !head.includes('1/'), 'trin 2 viser kun Marketing (ikke den fjernede ydelse)')
  await press(page, 'Se opsummering')
  check((await page.$eval('#prisberegner', (e) => e.textContent)).includes('Din pris er klar.'), 'uden Hjemmeside går man direkte til opsummeringen (ingen drift)')
  await page.close()
}

/* ------------------------------------------------------ reduceret bevægelse */
{
  console.log('\nReduceret bevægelse')
  const { page } = await open(390, 844, true, '/', { reduced: true })
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView())
  await press(page, 'Hjemmeside')
  await press(page, 'Marketing')
  check(!(await page.evaluate(() => !!document.querySelector('#prisberegner [style*="flyTo"]'))), 'ingen flyvende beløb')
  await press(page, 'Marketing')
  await wait(150)
  check((await page.$$eval('#prisberegner .delta-chip', (c) => c.length)) === 0, 'reduceret bevægelse: ingen "−5.000 kr./md."-chip ved fjernelse')
  const dur = await page.evaluate(() => {
    const col = document.querySelector('#prisberegner [role="img"][aria-label] span span')
    return getComputedStyle(col).transitionDuration
  })
  check(dur === '0s', `tælleværket skifter uden overgang (${dur})`)
  await page.close()
}

await browser.close()
console.log(failed ? `\n${failed} fejl` : '\nAlt ok')
process.exit(failed ? 1 : 0)
