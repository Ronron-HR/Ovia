/**
 * Browsertest af beregnerens tre veje: Ny hjemmeside · Løs et problem · Begge dele.
 *
 * Kræver en kørende `npm run preview` (http://localhost:4173, eller SITE=…) og Chrome (CHROME=… hvis den ikke ligger på
 * standardstien). SHOTS=<mappe> gemmer et skærmbillede af hvert trin for hver vej (navn: <bredde>-<vej>-<nr>-<trin>.png).
 *
 * Tjekker for hver bredde (mobil 360, 375, 390, 414, 430, 768 · desktop 1024, 1280, 1440, 1920) og hver vej:
 *  - trinene er de rigtige for vejen (trin-baren viser kun de relevante trin), og priserne er rigtige på hvert trin
 *  - på hvert trin: ingen vandret scroll, intet uden for skærmen, ingen tekst skåret af, ingen tekst oven i anden tekst,
 *    og trykflader (knapper) på mindst 44 × 44 px
 *  - det sorte opsummeringsfelt (desktop-kvitteringen) går aldrig ud over skærmkanten og skærer ingen tekst af
 *  - Hvad skal løses?: tre kort; "Indgår" står kun på de funktioner, pakken faktisk dækker lige nu; alle andre viser deres ekstrapris
 *  - "Lad et system tage det, der æder tid": idéer og "Pris aftales" (ingen pris i totalerne)
 *  - rabatten er et stille spørgsmål på sidste trin (ikke et trin), uden knaphedstekst og uden overstregede priser
 *  - skift af vej midt i: pris og valg er rigtige, og intet mistes ved at gå frem og tilbage
 */
import { mkdirSync, readFileSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const INTRO = JSON.parse(readFileSync('src/data/prices.json', 'utf8')).introSlotsLeft > 0

let failed = 0
let total = 0
const check = (ok, msg) => {
  total++
  if (!ok) failed++
  console.log(`${ok ? '  ok ' : '  FEJL'} ${msg}`)
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

async function open(width, height, path = '/') {
  const mobile = width <= 1023
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  await page.setViewport({ width, height, isMobile: mobile && width < 700, hasTouch: mobile })
  await page.goto(SITE + path, { waitUntil: 'networkidle0' })
  await wait(400)
  await page.evaluate(() => document.querySelector('#prisberegner').scrollIntoView({ behavior: 'instant' }))
  await wait(500)
  return { page, errors, mobile }
}

/** Klikker den første knap, hvis tekst indeholder `text`, som en bruger: den skal kunne ses og trykkes. */
async function press(page, text, root = '#prisberegner') {
  const el = await page.evaluateHandle(
    (text, root) =>
      [...document.querySelectorAll(`${root} button, ${root} a`)].find(
        (b) => ((b.getAttribute('aria-label') ?? '') + ' ' + b.textContent.replace(/\s+/g, ' ')).includes(text) && b.offsetParent !== null && !b.disabled && getComputedStyle(b).visibility !== 'hidden',
      ),
    text,
    root,
  )
  if (!el.asElement()) throw new Error(`fandt ikke "${text}"`)
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
  await wait(450)
}

const totals = (page) => page.$$eval('#prisberegner [role="img"][aria-label]', (els) => els.map((e) => e.getAttribute('aria-label')).filter((l) => /^[\d.]+$/.test(l)))
const text = (page) => page.$eval('#prisberegner', (e) => e.textContent.replace(/\s+/g, ' '))
const shot = async (page, name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` })
const buttonsText = (page) => page.$$eval('#prisberegner button', (b) => b.map((x) => x.textContent.replace(/\s+/g, ' ').trim()))

/** Knappens tekst for en funktion, fx "Gavekort … +2.000 kr. + 99 kr./md.". */
const optionText = (page, name) =>
  page.evaluate((name) => {
    const b = [...document.querySelectorAll('#prisberegner [role="group"][aria-label="Hvad skal løses?"] button')].find((x) => x.textContent.includes(name))
    return b ? b.textContent.replace(/\s+/g, ' ').trim() : null
  }, name)

/**
 * Layoutkontrol i siden: vandret scroll, tekst uden for skærmen eller skåret af (af en forælder med overflow), tekst oven
 * i anden tekst, og trykflader under 44 × 44 px. Returnerer en liste af fund (tom = ok).
 */
function layoutCheck() {
  const vw = document.documentElement.clientWidth
  const root = document.querySelector('#prisberegner')
  const out = []
  if (document.documentElement.scrollWidth > vw) out.push(`vandret scroll: ${document.documentElement.scrollWidth} > ${vw}`)
  const cs = (e) => getComputedStyle(e)
  const label = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36)
  const hidden = (e) => {
    let o = 1
    for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
      const s = cs(n)
      if (s.display === 'none' || s.visibility === 'hidden' || n.hasAttribute('inert')) return true
      if (n.classList.contains('sr-only') || n.classList.contains('delta-chip')) return true
      if (n.getAttribute('style')?.includes('flyTo')) return true
      o *= Number(s.opacity)
    }
    return o < 0.1
  }
  const clipOf = (e) => {
    const c = { l: 0, t: 0, r: vw, b: Infinity }
    let ellipsis = false
    for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
      const s = cs(n)
      if (s.textOverflow === 'ellipsis') ellipsis = true
      const r = n.getBoundingClientRect()
      if (s.overflowX !== 'visible') {
        c.l = Math.max(c.l, r.left)
        c.r = Math.min(c.r, r.right)
      }
      if (s.overflowY === 'hidden' || s.overflowY === 'clip' || s.overflowY === 'auto' || s.overflowY === 'scroll') {
        c.t = Math.max(c.t, r.top)
        c.b = Math.min(c.b, r.bottom)
      }
    }
    return { ...c, ellipsis }
  }
  const boxes = []
  const addBox = (el, r, name) => {
    if (r.width < 1 || r.height < 1 || r.left < -500) return
    const c = clipOf(el)
    const iw = Math.min(r.right, c.r) - Math.max(r.left, c.l)
    const ih = Math.min(r.bottom, c.b) - Math.max(r.top, c.t)
    if (iw <= 0.5 || ih <= 0.5) return // ikke synlig (foldet sammen eller uden for sit klip)
    if (!c.ellipsis && (r.right > c.r + 1 || r.left < c.l - 1)) out.push(`afskåret/uden for: "${name}" (${Math.round(r.left)}–${Math.round(r.right)}, klip ${Math.round(c.l)}–${Math.round(c.r)})`)
    boxes.push({ el, name, l: Math.max(r.left, c.l), r: Math.min(r.right, c.r), t: Math.max(r.top, c.t), b: Math.min(r.bottom, c.b) })
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue
    const p = n.parentElement
    if (hidden(p) || p.closest('[role="img"]') || p.closest('noscript') || p.closest('script,style')) continue
    const range = document.createRange()
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) addBox(p, r, n.nodeValue.trim().slice(0, 36))
  }
  for (const el of root.querySelectorAll('[role="img"][aria-label]')) {
    if (hidden(el)) continue
    addBox(el, el.getBoundingClientRect(), 'tal ' + el.getAttribute('aria-label'))
  }
  // Tekst oven i tekst: to synlige tekstlinjer, der overlapper, og som ikke hører til hinanden (forælder/barn). Elementer i en klæbende række
  // (handlingsknapperne, som ligger oven på indholdet under dem, mens man ruller) tælles ikke.
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue
      if (a.el.closest('.sticky') || b.el.closest('.sticky')) continue
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l)
      const h = Math.min(a.b, b.b) - Math.max(a.t, b.t)
      if (w > 2 && h > 3) out.push(`overlap: "${a.name}" og "${b.name}" (${Math.round(w)}×${Math.round(h)} px)`)
    }
  }
  // Trykflader.
  for (const e of root.querySelectorAll('button, [role="button"]')) {
    if (hidden(e)) continue
    const r = e.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const c = clipOf(e)
    if (Math.min(r.right, c.r) - Math.max(r.left, c.l) <= 1) continue
    if (r.width < 43.5 || r.height < 43.5) out.push(`lille trykflade: "${label(e) || e.getAttribute('aria-label')}" ${Math.round(r.width)}×${Math.round(r.height)} px`)
  }
  // Det sorte opsummeringsfelt (desktop): inden for skærmen.
  const aside = root.querySelector('aside')
  if (aside) {
    const r = aside.getBoundingClientRect()
    if (r.right > vw + 0.5 || r.left < 0) out.push(`opsummeringsfeltet går ud over skærmen: ${Math.round(r.left)}–${Math.round(r.right)} af ${vw}`)
    if (aside.scrollWidth > aside.clientWidth + 1) out.push(`opsummeringsfeltet har indhold bredere end sig selv: ${aside.scrollWidth} > ${aside.clientWidth}`)
  }
  return out
}

/** Kører layoutkontrollen med rullefeltet øverst, midt i og nederst, så alt indhold er set (kun det synlige tælles i hver stilling). */
const layout = async (page, tag) => {
  const found = new Set()
  const run = async () => (await page.evaluate(layoutCheck)).forEach((f) => found.add(f))
  const scrollers = await page.evaluate(() =>
    [...document.querySelectorAll('#prisberegner .overflow-y-auto')].filter((e) => e.scrollHeight > e.clientHeight + 4 && e.getBoundingClientRect().height > 0).map((e, i) => (e.dataset.sweep = String(i), i)),
  )
  await run()
  for (const i of scrollers) {
    const max = await page.evaluate((i) => {
      const e = document.querySelector(`#prisberegner [data-sweep="${i}"]`)
      return e.scrollHeight - e.clientHeight
    }, i)
    for (let y = Math.round(max / 3); y < max + 1; y += Math.max(Math.round(max / 3), 1)) {
      await page.evaluate((i, y) => document.querySelector(`#prisberegner [data-sweep="${i}"]`).scrollTo({ top: y, behavior: 'instant' }), i, Math.min(y, max))
      await wait(80)
      await run()
    }
    await page.evaluate((i) => document.querySelector(`#prisberegner [data-sweep="${i}"]`).scrollTo({ top: 0, behavior: 'instant' }), i)
  }
  check(found.size === 0, `${tag}: layout ${[...found].slice(0, 4).join(' | ')}`)
}

const NEED = { site: 'Ny hjemmeside', system: 'Løs et problem', both: 'Begge dele' }
const BOOK = 'Gæsterne skal kunne booke bord'
const ORDER = 'Gæsterne skal kunne bestille mad'
const IDEA = 'Lad et system tage det'

/** Trinene i den rigtige rækkefølge for en vej. Rabatten er ikke et trin. */
const stepsOf = (path) =>
  ({
    site: ['Behov', 'Pakke', 'Samlet pris'],
    system: ['Behov', 'Hvad skal løses?', 'Samlet pris'],
    both: ['Behov', 'Pakke', 'Hvad skal løses?', 'Samlet pris'],
  })[path]

/** Vælger en vej. På mobil går ét tryk videre af sig selv; på desktop skal Næste trykkes. */
async function choose(page, mobile, path) {
  await press(page, NEED[path])
  if (!mobile) await press(page, path === 'system' ? 'Næste: Hvad skal løses?' : 'Næste: Vælg pakke')
  await wait(300)
}

/** Går én vej igennem trin for trin og tjekker pris, trin og layout undervejs. */
async function walk(w, h, path) {
  const { page, errors, mobile } = await open(w, h)
  const tag = `${w} ${path}`
  const names = stepsOf(path)
  let n = 0
  const here = async (step) => {
    await wait(350)
    await shot(page, `${w}-${path}-${++n}-${step}`)
    await layout(page, `${tag}, trin "${step}"`)
  }
  // Trin 1: hvad har I brug for?
  const t0 = await text(page)
  check(t0.includes('Hvad har I brug for?') && Object.values(NEED).every((x) => t0.includes(x)), `${tag}: første trin viser "Hvad har I brug for?" og tre valg`)
  check((await buttonsText(page)).some((b) => b.startsWith('Vælg, hvad I har brug for')), `${tag}: Næste er slukket med "Vælg, hvad I har brug for", til der er valgt`)
  await here('behov')
  await press(page, NEED[path])
  if (mobile) check((await text(page)).includes(`Trin 2 af ${names.length} · ${names[1]}`), `${tag}: ét tryk på vejen går videre til "${names[1]}"`)
  else {
    const nav = await page.$$eval('#prisberegner nav[aria-label="Trin i beregneren"] li', (li) => li.map((x) => x.textContent.trim()))
    check(JSON.stringify(nav) === JSON.stringify(names), `${tag}: trin-baren viser kun de relevante trin (${nav.join(' → ')})`)
    await press(page, path === 'system' ? 'Næste: Hvad skal løses?' : 'Næste: Vælg pakke')
  }

  if (path !== 'system') {
    const tp = await text(page)
    check(tp.includes('Hjemmeside designet til jer') && tp.includes('Mobilvenlig') && tp.includes('på dansk og engelsk') && tp.includes('1–3 sider') && tp.includes('Op til 6 sider'), `${tag}: pakkerne viser "Hjemmeside designet til jer" og de konkrete dele`)
    check(!/Engelsk version/.test(tp), `${tag}: intet tilvalg "Engelsk version"`)
    check(!/pladser? tilbage|første \d+ kunder/.test(tp), `${tag}: ingen knaphedstekst på pakketrinnet`)
    check(!/Introduktionspris|Må vi vise jeres side/.test(tp), `${tag}: rabatten står ikke under pakkerne`)
    // Hjemmesiden står før funktioner og Google i hver pakke.
    const order = await page.$$eval('#prisberegner [role="group"][aria-label="Vælg pakke"] button', (bs) =>
      bs.map((b) => {
        const t = b.textContent
        return t.indexOf('Hjemmeside designet til jer') < t.search(/Google|bordbooking/i)
      }),
    )
    check(order.length === 3 && order.every(Boolean), `${tag}: hjemmesiden står før funktioner og Google i alle pakker`)
    await here('pakke')
    await press(page, 'Anbefalet')
    const t = await totals(page)
    check(t[0] === '9.500' && t[1] === '699', `${tag}: Anbefalet = 9.500 og 699 (${t.slice(0, 2)})`)
    await here('pakke-valgt')
    await press(page, path === 'both' ? 'Næste: Hvad skal løses?' : 'Se samlet pris')
  }

  if (path !== 'site') {
    const ts = await text(page)
    check(ts.includes(`Trin ${path === 'both' ? 3 : 2} af ${names.length} · Hvad skal løses?`) || !mobile, `${tag}: trinnet hedder "Hvad skal løses?"`)
    if (path === 'system') check(ts.includes('Har I en hjemmeside, kobler vi det på den') && ts.includes('Har I ikke, får det sit eget link'), `${tag}: siger, hvor løsningen sidder`)
    else check(ts.includes('Anbefalet har én af dem med i prisen: bordbooking eller online bestilling'), `${tag}: "Anbefalet har én af dem med i prisen"`)
    check(ts.includes('Lad et system tage det, der æder tid') && ts.includes('Poster indhold for jer') && ts.includes('Pris aftales'), `${tag}: idékortet viser titel, idéer og "Pris aftales"`)
    check((await page.$$eval('#prisberegner [role="group"][aria-label="Hvad skal løses?"] > button', (b) => b.length)) === 3, `${tag}: højst tre kort at vælge imellem`)
    check(!/gavekort|nyhedsbrev|anmeldelser fra/i.test(ts), `${tag}: gavekort, nyhedsbrev og anmeldelser er væk`)
    // Løs et problem: Se samlet pris er slukket, til der er valgt noget.
    if (path === 'system') check((await buttonsText(page)).some((b) => b === 'Se samlet pris') && (await page.$('#prisberegner button:disabled')) !== null, `${tag}: Se samlet pris er slukket uden et valg`)
    await here('hvad-skal-loeses')
    const free = await optionText(page, BOOK)
    if (path === 'both') check(!/Indgår/.test(free) && /Med i prisen/.test(free) && /\+2\.500 kr\. \+ 299 kr\.\/md\./.test(free), `${tag}: ledig plads: "Med i prisen", ikke "Indgår", ekstraprisen ved siden af (${free})`)
    else check(/2\.500 kr\. \+ 299 kr\.\/md\./.test(free) && !/Indgår/.test(free), `${tag}: bordbooking viser sin egen pris, 2.500 + 299/md. (${free})`)
    await press(page, BOOK)
    const booked = await optionText(page, BOOK)
    const other = await optionText(page, ORDER)
    if (path === 'both') {
      check(/Indgår/.test(booked), `${tag}: bordbooking er dækket af pakken: "Indgår"`)
      check(!/Indgår/.test(other) && /\+3\.500 kr\. \+ 449 kr\.\/md\./.test(other), `${tag}: online bestilling viser ekstrapris, ikke "Indgår" (${other})`)
      const t = await totals(page)
      check(t[0] === '9.500' && t[1] === '699', `${tag}: 1 funktion indgår: uændret pris (${t.slice(0, 2)})`)
    }
    await press(page, ORDER)
    let t = await totals(page)
    const [o2, m2] = path === 'both' ? ['13.000', '1.148'] : ['6.000', '748']
    check(t[0] === o2 && t[1] === m2, `${tag}: bordbooking + online bestilling = ${o2} og ${m2} (${t.slice(0, 2)})`)
    // Idékortet: ingen pris, ingen − / +, og totalerne ændres ikke.
    check((await page.$('#prisberegner [role="group"][aria-label="Antal bygget specielt til jer"]')) === null, `${tag}: ingen −/+-styring (bygget specielt er ét valg)`)
    await press(page, IDEA)
    await wait(500)
    t = await totals(page)
    check(t[0] === o2 && t[1] === m2, `${tag}: noget bygget specielt har ingen pris og ændrer ikke totalen (${t.slice(0, 2)})`)
    await here('hvad-skal-loeses-valgt')
    await press(page, 'Se samlet pris')
  }

  await page.waitForSelector('#prisberegner form', { timeout: 8000 })
  await wait(500)
  const ts = await text(page)
  check(ts.includes('Din pris er klar.') && ts.includes('Hvad I har brug for: ' + NEED[path]), `${tag}: samlet pris viser vejen (${NEED[path]})`)
  check(ts.includes(path === 'site' ? 'Leveringstid: 1–2 uger.' : 'Leveringstid: 2–3 uger.'), `${tag}: samlet pris viser leveringstiden`)
  check(path !== 'system' ? true : ts.includes('Pris aftales'), `${tag}: pris aftales vises for bygget specielt`)
  // Rabatten: ét stille spørgsmål, kun for hjemmesider og kun mens der er pladser.
  const hasOffer = await page.evaluate(() => [...document.querySelectorAll('#prisberegner button')].some((b) => b.textContent.includes('Må vi vise jeres side som eksempel')))
  check(hasOffer === (INTRO && path !== 'system'), `${tag}: spørgsmålet om at vise siden som eksempel vises kun med hjemmeside og pladser (${hasOffer})`)
  check(!/pladser? tilbage|første \d+ kunder/.test(ts) && !/Introduktionspris/.test(ts), `${tag}: ingen knaphedstekst og ingen intropris, før kunden siger ja`)
  if (hasOffer) {
    await press(page, 'Må vi vise jeres side som eksempel')
    await wait(700)
    check((await page.$$eval('#prisberegner s, #prisberegner del', (e) => e.length)) === 0, `${tag}: ingen overstregede priser`)
  }
  const t = await totals(page)
  const want = { site: INTRO ? ['8.495', '699'] : ['9.500', '699'], system: ['6.000', '748'], both: INTRO ? ['11.995', '1.148'] : ['13.000', '1.148'] }[path]
  check(t[0] === want[0] && t[1] === want[1], `${tag}: samlet pris ${want[0]} og ${want[1]} (${t.slice(0, 2)})`)
  const url = page.url()
  const wantUrl = { site: `v=h&p=1${INTRO ? '&i=1' : ''}&t=sum`, system: 'v=s&y=bo&c=1&t=sum', both: `v=b&p=1&y=bo&c=1${INTRO ? '&i=1' : ''}&t=sum` }[path]
  check(new URL(url).search === '?' + wantUrl, `${tag}: adresselinjen er ${wantUrl} (${url.replace(SITE, '')})`)
  check(!(await text(page)).includes('Engelsk version'), `${tag}: ingen "Engelsk version" på samlet pris`)
  await here('samlet-pris')
  check(errors.length === 0, `${tag}: ingen konsolfejl ${errors.join(' | ')}`)
  await page.close()

  // Del-linket åbner samme trin med samme priser.
  const re = await open(w, h, new URL(url).pathname + new URL(url).search)
  await wait(500)
  const rt = await totals(re.page)
  check((await text(re.page)).includes('Din pris er klar.') && rt[0] === want[0] && rt[1] === want[1], `${tag}: del-linket giver samme pris og samme trin`)
  await re.page.close()
}

const MOBILE = [360, 375, 390, 414, 430, 768]
const DESKTOP = [1024, 1280, 1440, 1920]
for (const w of [...MOBILE, ...DESKTOP]) {
  const h = w >= 1024 ? (w >= 1920 ? 1080 : 800) : w >= 768 ? 1024 : 844
  console.log(`\n${w >= 1024 ? 'Desktop' : 'Mobil'} ${w}×${h}`)
  for (const path of ['site', 'system', 'both']) await walk(w, h, path)
}

/* ---- Start: ingen funktioner med, så begge viser ekstrapris ------------------------------------------------------------ */
{
  console.log('\nStart: begge funktioner viser ekstrapris')
  const { page } = await open(390, 844, '/?v=b&p=0&t=sys')
  const b = await optionText(page, BOOK)
  const o = await optionText(page, ORDER)
  check(/\+2\.500 kr\. \+ 299 kr\.\/md\./.test(b) && !/Indgår|Med i prisen/.test(b), `Start: bordbooking viser ekstrapris (${b?.slice(-40)})`)
  check(/\+3\.500 kr\. \+ 449 kr\.\/md\./.test(o) && !/Indgår|Med i prisen/.test(o), `Start: online bestilling viser ekstrapris (${o?.slice(-40)})`)
  check((await text(page)).includes('Start har hverken bordbooking eller online bestilling med i prisen'), 'Start: "har hverken bordbooking eller online bestilling med i prisen"')
  await page.close()
  console.log('\nMax: begge funktioner er med i prisen')
  const m = await open(390, 844, '/?v=b&p=2&y=b&t=sys')
  check((await text(m.page)).includes('Max har både bordbooking og online bestilling med i prisen'), 'Max: "har både bordbooking og online bestilling med i prisen"')
  check(/Indgår/.test(await optionText(m.page, BOOK)) && /Med i prisen/.test(await optionText(m.page, ORDER)), 'Max: 1 valgt = Indgår, 1 ledig plads = Med i prisen')
  await press(m.page, ORDER)
  check(/Indgår/.test(await optionText(m.page, ORDER)) && /Indgår/.test(await optionText(m.page, BOOK)), 'Max: begge valgt = begge Indgår')
  await m.page.close()
}

/* ---- Skift af vej midt i ------------------------------------------------------------------------------------------------ */
for (const [w, h] of [
  [390, 844],
  [1280, 800],
]) {
  console.log(`\nSkift af vej midt i, ${w}×${h}`)
  const { page, mobile } = await open(w, h)
  const back = async () => {
    for (let i = 0; i < 6; i++) {
      const b = await page.evaluateHandle(() => [...document.querySelectorAll('#prisberegner button')].find((x) => /Tilbage/.test(x.getAttribute('aria-label') ?? '') || /^←\s*Tilbage$/.test(x.textContent.trim()) || /Tilbage og ret/.test(x.textContent)))
      if (!b.asElement() || (await text(page)).includes('Hvad har I brug for?')) break
      await b.asElement().evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await b.asElement().click()
      await wait(400)
    }
  }
  await choose(page, mobile, 'both')
  await press(page, 'Anbefalet')
  await press(page, 'Næste: Hvad skal løses?')
  await press(page, BOOK)
  await press(page, ORDER)
  await press(page, IDEA)
  let t = await totals(page)
  check(t[0] === '13.000' && t[1] === '1.148', `Begge: 13.000 og 1.148 (${t.slice(0, 2)})`)
  await back()
  check((await text(page)).includes('Hvad har I brug for?'), 'tilbage til første trin ad Tilbage-knappen')
  await choose(page, mobile, 'system')
  t = await totals(page)
  check(t[0] === '6.000' && t[1] === '748', `Begge → Løs et problem: 6.000 og 748, uden pakken (${t.slice(0, 2)})`)
  check((await text(page)).includes('Har I en hjemmeside, kobler vi det på den') && !(await text(page)).includes('Anbefalet'), 'Løs et problem: ingen pakke i teksten')
  check((await page.$$eval('#prisberegner [role="group"][aria-label="Hvad skal løses?"] button[aria-pressed="true"]', (b) => b.length)) === 3, 'Løs et problem: de tre valgte kort står stadig valgt')
  await back()
  await choose(page, mobile, 'site')
  t = await totals(page)
  check(t[0] === '9.500' && t[1] === '699', `Løs et problem → Ny hjemmeside: kun pakken, 9.500 og 699 (${t.slice(0, 2)})`)
  check((await page.$$eval('#prisberegner [role="group"][aria-label="Vælg pakke"] button[aria-pressed="true"]', (b) => b.length)) === 1, 'Ny hjemmeside: Anbefalet står stadig valgt')
  await back()
  await choose(page, mobile, 'both')
  t = await totals(page)
  check(t[0] === '13.000' && t[1] === '1.148', `Ny hjemmeside → Begge: alle valg er der igen, 13.000 og 1.148 (${t.slice(0, 2)})`)
  check(new URL(page.url()).search.startsWith('?v=b&p=1&y=bo&c=1'), `adresselinjen følger med (${page.url().replace(SITE, '')})`)
  // Fjern pakken på Begge: man kan ikke gå videre.
  await press(page, 'Anbefalet')
  await wait(400)
  check((await page.$$eval('#prisberegner button:disabled', (b) => b.length)) > 0, 'uden pakke kan man ikke gå videre')
  t = await totals(page)
  check(t.length === 0 || (t[0] === '0' && t[1] === '0'), `uden pakke: ingen pris (${t.slice(0, 2)})`)
  await page.close()
}

/* ---- Gamle links ---------------------------------------------------------------------------------------------------------- */
{
  console.log('\nLinks fra pakke-versionen og gamle links')
  const a = await open(390, 844, '/?p=1&y=bo&e=1&i=1&t=4')
  const t = await totals(a.page)
  check((await text(a.page)).includes('Din pris er klar.') && t[0] === (INTRO ? '11.995' : '13.000') && t[1] === '1.148', `link fra pakke-versionen (uden v) åbner samlet pris: ${t.slice(0, 2)}`)
  await a.page.close()
  const o = await open(390, 844, '/?w=1&m=1&d=p&bk=1&s=4')
  check((await text(o.page)).includes('Beregneren er opdateret med nye pakker'), 'gammelt link: venlig besked')
  await o.page.close()
}

await browser.close()
console.log(failed ? `\n${failed} fejl af ${total} kontroller` : `\nAlt ok (${total} kontroller)`)
process.exit(failed ? 1 : 0)
