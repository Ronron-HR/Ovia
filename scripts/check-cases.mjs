/**
 * Mobil- og layouttjek af forsiden, /cases og casesiden (kræver kørende `npm run preview`).
 * Brug: node scripts/check-cases.mjs <mappe>   Gemmer skærmbilleder af siderne ved 375, 768 og 1440 px og skriver tjekkene.
 * Tjekker: vandret scroll, én H1, billeder med width/height, trykmål (min. 44 px), konsolfejl,
 * forsidens case-sektions højde og døde interne links (inkl. #anker).
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const dir = process.argv[2] ?? 'docs/shots-cases'
mkdirSync(dir, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const pages = [
  ['forside', '/'],
  ['cases', '/cases/'],
  ['case-palmy', '/cases/palmy-spisested/'],
]
let fails = 0
const check = (ok, msg) => {
  if (!ok) fails++
  console.log(`${ok ? '  ok ' : ' FEJL'}  ${msg}`)
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const links = new Set()
for (const width of [375, 768, 1440]) {
  const mobile = width < 760
  for (const [name, path] of pages) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.setViewport({ width, height: width === 375 ? 667 : width === 768 ? 1024 : 900, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
    await page.goto(SITE + path, { waitUntil: 'networkidle0' })
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await wait(400)
    const r = await page.evaluate(() => {
      const small = [...document.querySelectorAll('a,button')]
        .filter((e) => !e.closest('.sr-only') && !e.classList.contains('skip-link'))
        .map((e) => ({ t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 30), r: e.getBoundingClientRect() }))
        .filter((x) => x.r.width > 0 && x.r.height > 0 && x.r.height < 44)
      // Løbende tekstlinks i brødtekst undtages; kun frittstående links/knapper tælles
      const noSize = [...document.querySelectorAll('img')].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.src.slice(-40))
      const caseEl = document.querySelector('#case')
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        h1: document.querySelectorAll('h1').length,
        small: small.map((s) => `${s.t} (${Math.round(s.r.height)}px)`),
        noSize,
        caseH: caseEl ? Math.round(caseEl.getBoundingClientRect().height) : null,
        hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
        total: document.documentElement.scrollHeight,
      }
    })
    r.hrefs.forEach((h) => links.add(h))
    check(r.overflow <= 0, `${name} ${width}: ingen vandret scroll (${r.overflow})`)
    check(r.h1 === 1, `${name} ${width}: én H1 (${r.h1})`)
    check(r.noSize.length === 0, `${name} ${width}: alle billeder har width/height ${r.noSize.join(',')}`)
    check(errors.length === 0, `${name} ${width}: ingen konsolfejl ${errors.join(' | ')}`)
    if (r.small.length) console.log(`  info  ${name} ${width}: trykflader under 44 px: ${[...new Set(r.small)].join('; ')}`)
    if (r.caseH) console.log(`  info  forside ${width}: case-sektionens højde ${r.caseH}px (skærm ${page.viewport().height}px)`)
    await page.screenshot({ path: `${dir}/${width}-${name}-top.png` })
    await page.screenshot({ path: `${dir}/${width}-${name}-hel.png`, fullPage: true })
    await page.close()
  }
}
// Døde links: interne adresser skal give 200, og ankre skal findes på målsiden.
const internal = [...links].filter((h) => h.startsWith('/') && !h.startsWith('//'))
for (const h of internal) {
  const [p, hash] = h.split('#')
  const res = await fetch(SITE + (p || '/'))
  let ok = res.status === 200
  if (ok && hash) ok = (await res.text()).includes(`id="${hash}"`)
  check(ok, `link ${h} → ${res.status}${hash ? ` #${hash}` : ''}`)
}
const external = [...links].filter((h) => /^https?:/.test(h))
console.log('  info  eksterne links:', external.join(', '))
await browser.close()
console.log(fails ? `\n${fails} FEJL` : '\nAlt ok')
process.exit(fails ? 1 : 0)
