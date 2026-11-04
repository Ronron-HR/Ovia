/**
 * Browsertest af beregnerens trin 0, behovsguiden og formularen på /priser/ mod en kørende
 * server (puppeteer-core, som de øvrige browsertests):
 *
 *   npx vite --port 5182
 *   SITE=http://localhost:5182 node scripts/test-guide-e2e.mjs
 *
 * Kører på 375 og 1440 px, og efterligner serveren (/api/henvendelse): der sendes aldrig en
 * rigtig henvendelse. Kunderejser:
 * - A: trin 0 skelner først mellem "Løbende samarbejde" og "Køb hjemmesiden" (gensidigt
 *   udelukkende, kan fravælges), derefter tilvalg; Køb: sider → drift som eget trin uden forvalg
 * - L: Lokal: spørgsmål om system, så resultat med 0 kr. nu, pris pr. måned, minimum og vilkår FØR formularen;
 *   systemtilvalget har ingen pris, mens modulet ikke findes
 * - O: Lokal + Booking & Google: Google-profilen trækkes fra; QR uden booking = ét tilvalg
 * - G: guiden: højst tre spørgsmål, "Spring over", Google + QR giver ikke booking, hjemmeside med
 *   betalingsmodel, arbejdsgang uden pris, "Jeg ved det ikke", ændrede svar, tilbage
 * - F: formularen fra guidens resultat (payload, fejl, tak)
 * - K: gamle links, genindlæsning, tastatur, vandret scroll og konsolfejl
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 20000 })
const errors = []

async function newPage(width) {
  const page = await browser.newPage()
  page.on('pageerror', (e) => errors.push(`${width}px ${page.url()}: ${e}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${width}px ${page.url()}: ${m.text()}`))
  await page.setViewport({ width, height: width < 768 ? 812 : 900, isMobile: width < 768, hasTouch: width < 768 })
  return page
}

// textContent: etiketter som "Spørgsmål 2 af 3" står med store bogstaver i innerText (CSS).
const calc = (page) => page.evaluate(() => document.querySelector('#beregner')?.textContent ?? '')
const search = (page) => page.evaluate(() => window.location.search)

/** Klik på en knap eller et label, hvis tekst starter med denne tekst (inde i beregneren). */
async function click(page, text, selector = '#beregner label, #beregner button, #beregner a') {
  const ok = await page.evaluate(
    (text, selector) => {
      const el = [...document.querySelectorAll(selector)].find((n) => n.textContent.replace(/\s+/g, ' ').trim().replace(/^← /, '').startsWith(text))
      if (!el) return false
      el.click()
      return true
    },
    text,
    selector,
  )
  if (!ok) failures.push(`fandt ikke "${text}"`)
  await wait(120)
}

const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)

async function open(page, path = '/priser/') {
  await page.goto(`${SITE}${path}`, { waitUntil: 'networkidle0' })
  await wait(400)
}

for (const width of [375, 1440]) {
  const tag = `${width}px`
  const page = await newPage(width)
  const requests = []
  let reply = { status: 200, body: { ok: true } }
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    if (!req.url().endsWith('/api/henvendelse')) return req.continue()
    requests.push(JSON.parse(req.postData()))
    req.respond({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) })
  })

  // ---- A: trin 0 ----------------------------------------------------------
  await open(page)
  let text = await calc(page)
  check(/Hvordan vil du have hjemmesiden/.test(text) && /Løbende samarbejde/.test(text) && /Køb hjemmesiden/.test(text), `${tag}: A trin 0 mangler de to købsmåder`)
  check(/Lokal synlighed/.test(text) && /Marketing/.test(text) && /Alle priser er ekskl\. moms/.test(text), `${tag}: A tilvalg eller moms mangler`)
  check(text.indexOf('Løbende samarbejde') < text.indexOf('Lokal synlighed'), `${tag}: A tilvalg står før købsmåderne`)
  check(/Hjælp mig med at vælge/.test(text) && !(await page.evaluate(() => /Hvad vil du gerne have hjælp til/.test(document.body.innerText))), `${tag}: A guidens indgang mangler eller guiden starter af sig selv`)
  check(await page.evaluate(() => document.querySelectorAll('#beregner input[name=maade]').length === 3 && document.querySelectorAll('#beregner input[name=maade]:checked').length === 0), `${tag}: A købsmåderne er ikke tre radioknapper uden forvalg`)
  // gensidigt udelukkende, og kan fravælges
  await click(page, 'Løbende samarbejde')
  check((await search(page)).includes('ydelser=lokal'), `${tag}: A Lokal blev ikke valgt: ${await search(page)}`)
  await click(page, 'Køb hjemmesiden')
  check(/ydelser=hjemmeside/.test(await search(page)) && !/lokal/.test(await search(page)), `${tag}: A Lokal og Køb er valgt samtidig: ${await search(page)}`)
  check(await page.evaluate(() => [...document.querySelectorAll('#beregner input[name=maade]:checked')].length === 1), `${tag}: A flere købsmåder er afkrydset`)
  await click(page, 'Jeg skal ikke have en hjemmeside')
  check((await search(page)) === '?ydelser=' || !/hjemmeside|lokal/.test(await search(page)), `${tag}: A hjemmesiden kan ikke fravælges: ${await search(page)}`)
  check(await noOverflow(page), `${tag}: A vandret scroll på trin 0`)

  // Køb hjemmesiden: sider, drift som eget trin uden forvalg (uændret)
  await open(page)
  await click(page, 'Køb hjemmesiden')
  await click(page, 'Næste')
  text = await calc(page)
  check(/forsiden, menukortet/.test(text), `${tag}: A hjælpetekst om sider mangler`)
  await click(page, '2-5 sider')
  await click(page, 'Nej')
  await click(page, 'Næste')
  text = await calc(page)
  check(/Trin 3 af 4/.test(text) && /Drift af din hjemmeside/.test(text), `${tag}: A driftstrinnet: ${text.slice(0, 120)}`)
  check(/Op til 15 min\. små rettelser pr\. måned/.test(text) && /Op til 30 min\. små rettelser pr\. måned/.test(text) && /Ingen indholdsrettelser/.test(text), `${tag}: A minutterne vises ikke ved driftsplanerne`)
  check(await page.evaluate(() => !!document.querySelector('#beregner [data-tour="drift"]') && !document.querySelector('#beregner input[name=drift]:checked')), `${tag}: A data-tour=drift mangler, eller et valg er forvalgt`)
  await click(page, 'Vis min pris')
  check(/Vælg en driftsplan eller egen konto\/hosting/.test(await calc(page)), `${tag}: A manglende driftsvalg stoppes ikke`)
  await click(page, 'Plus')
  await click(page, 'Vis min pris')
  text = await calc(page)
  check(/8\.000\s*kr\./.test(text) && /398\s*kr\./.test(text) && /ekskl\. moms/.test(text) && /Hvad dækker månedsprisen/.test(text), `${tag}: A direkte pris: ${text.slice(0, 200)}`)
  check(await page.evaluate(() => !!document.querySelector('#beregner [data-tour="price"]') && !!document.querySelector('[data-tour="calc"]')), `${tag}: A data-tour=price/calc mangler`)
  check(!/Det forpligter du dig til/.test(text), `${tag}: A Lokal-vilkår vises ved et engangskøb`)
  // Gamle links virker uændret som "Køb hjemmesiden"
  await open(page, '/priser/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4')
  text = await calc(page)
  check(/Din pris/.test(text) && /Hjemmeside: Vækst/.test(text) && /8\.000\s*kr\./.test(text) && /398\s*kr\./.test(text), `${tag}: A gammelt link: ${text.slice(0, 160)}`)
  await open(page, '/priser/?ydelser=hjemmeside&sider=6-8&bestilling=nej&drift=drift&trin=3')
  text = await calc(page)
  check(/Drift Ekstra/.test(text) && /10\.000\s*kr\./.test(text) && /798\s*kr\./.test(text), `${tag}: A gammelt drift=drift-link: ${text.slice(0, 160)}`)

  // ---- L: Lokal ---------------------------------------------------------------
  await open(page)
  await click(page, 'Løbende samarbejde')
  await click(page, 'Næste')
  text = await calc(page)
  check(/Trin 2 af 3/.test(text) && /Har du en arbejdsgang/.test(text), `${tag}: L spørgsmålet om system: ${text.slice(0, 160)}`)
  await click(page, 'Vis min pris') // intet valgt
  check(/Svar på:/.test(await calc(page)), `${tag}: L manglende svar stoppes ikke`)
  await click(page, 'Nej, jeg har brug for hjemmesiden')
  await click(page, 'Vis min pris')
  text = await calc(page)
  check(/Løbende samarbejde: Lokal/.test(text) && /0\s*kr\./.test(text) && /1\.990\s*kr\./.test(text) && /mindst 6 mdr\. = mindst 11\.940\s*kr\./.test(text), `${tag}: L resultat: ${text.slice(0, 300)}`)
  check(/Det forpligter du dig til/.test(text) && /Minimumsperiode/.test(text) && /Mindste betaling i alt/.test(text) && /Eksterne udgifter/.test(text) && /Når minimumsperioden er slut/.test(text) && /uden særskilt frikøb/.test(text), `${tag}: L vilkår mangler`)
  check(await page.evaluate(() => {
    const t = document.querySelector('#beregner [data-lokal-terms]')
    const f = document.querySelector('#beregner .send')
    return !!t && !!f && Boolean(t.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING)
  }), `${tag}: L vilkårene står ikke før formularen`)
  check(!(await page.evaluate(() => !!document.querySelector('#beregner input[name^="pakke-"]'))) && /Hellere købe hjemmesiden/.test(text), `${tag}: L pakkevælger eller skift til køb mangler/er forkert`)
  check(await noOverflow(page), `${tag}: L vandret scroll i resultatet`)
  // Skift til køb og tilbage
  await click(page, 'Hellere købe hjemmesiden')
  check(/Hvor mange sider/.test(await calc(page)) && /ydelser=hjemmeside/.test(await search(page)), `${tag}: L skift til køb: ${await search(page)}`)
  // Systemtilvalg uden færdigt modul: ingen pris
  await open(page, '/priser/?ydelser=lokal&system=ja&trin=3')
  text = await calc(page)
  check(/særskilt fast tilbud/.test(text) && /1\.990\s*kr\./.test(text) && !/2\.990|17\.940/.test(text), `${tag}: L system uden modul viser en pris eller mangler noten: ${text.slice(0, 200)}`)

  // ---- O: Lokal + Booking & Google, QR uden booking -------------------------------
  await open(page, '/priser/?ydelser=lokal,bookingGoogle&system=nej&booking=ja&anmeldelser=nej&trin=4')
  text = await calc(page)
  check(/Booking & Google: Vækst/.test(text) && /Trukket fra: Google-profil/.test(text) && /Lokal/.test(text) && /1\.000\s*kr\. nu|1\.000\s*kr\.\s*Pr\. måned/.test(text.replace(/\s+/g, ' ')) || /1\.000\s*kr\./.test(text), `${tag}: O Lokal + B&G: ${text.slice(0, 300)}`)
  await open(page, '/priser/?ydelser=bookingGoogle&booking=nej&anmeldelser=ja&trin=3')
  text = await calc(page)
  check(/Booking & Google: Start/.test(text) && /QR-skilt og opfølgning/.test(text) && /2\.000\s*kr\./.test(text) && !/Booking koblet/.test(text), `${tag}: O QR uden booking: ${text.slice(0, 260)}`)

  // ---- G: guiden --------------------------------------------------------------------
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  text = await calc(page)
  check(/Hvad vil du gerne have hjælp til\?/.test(text) && /Spørgsmål 1/i.test(text) && /Spring over/.test(text), `${tag}: G første spørgsmål eller "Spring over" mangler`)
  check(/hjaelp=1/.test(await search(page)), `${tag}: G guide-trin ikke i adresselinjen`)
  await click(page, 'Næste') // intet valgt
  check(/Vælg et svar/.test(await calc(page)) && (await page.evaluate(() => document.activeElement?.type === 'radio')), `${tag}: G fejlbesked uden svar mangler, eller fokus flyttes ikke`)
  // Spring over → direkte til beregneren
  await click(page, 'Spring over', '#beregner button')
  text = await calc(page)
  check(/Hvordan vil du have hjemmesiden/.test(text) && !/hjaelp/.test(await search(page)), `${tag}: G "Spring over" fører ikke til beregneren`)

  // Google + QR → ingen booking (Start + QR = 2\.000 kr.)
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Min Google-profil eller flere anmeldelser')
  await click(page, 'Næste')
  text = await calc(page)
  check(/Spørgsmål 2 af 2/i.test(text), `${tag}: G Google har ikke 2 spørgsmål: ${text.slice(0, 100)}`)
  await click(page, 'Ja')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Booking & Google: Start/.test(text) && /2\.000\s*kr\./.test(text) && !/Fuld fart/.test(text) && !/Booking koblet/.test(text) && /uden booking/.test(text), `${tag}: G Google + QR: ${text.slice(0, 300)}`)
  check(/Spring over/.test(text) && /Se og ret i beregneren/.test(text) && /Send din forespørgsel/.test(text), `${tag}: G resultatets handlinger`)
  check(await page.evaluate(() => !!document.querySelector('#beregner [data-tour="price"]')), `${tag}: G data-tour=price mangler`)
  await click(page, 'Se og ret i beregneren')
  text = await calc(page)
  check(/Din pris/.test(text) && /Booking & Google: Start/.test(text) && /2\.000\s*kr\./.test(text) && /anmeldelser=ja/.test(await search(page)) && /booking=nej/.test(await search(page)), `${tag}: G forslaget i beregneren: ${await search(page)}`)

  // Hjemmeside: betalingsmodel. Lokal → 0 kr. i opstart; køb → mindste pakke og Basis.
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  check(/Spørgsmål 2 af 3/i.test(await calc(page)), `${tag}: G hjemmeside spørgsmål 2 af 3`)
  await click(page, '2-3 sider')
  await click(page, 'Næste')
  text = await calc(page)
  check(/Spørgsmål 3 af 3/i.test(text) && /Hvordan vil du helst betale/.test(text), `${tag}: G betalingsmodel er ikke spørgsmål 3`)
  await click(page, 'Løbende:')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Løbende samarbejde: Lokal/.test(text) && /1\.990\s*kr\./.test(text) && /11\.940\s*kr\./.test(text) && /Det forpligter du dig til/.test(text), `${tag}: G Lokal-forslag: ${text.slice(0, 300)}`)
  await click(page, 'Ret svarene')
  await click(page, 'Næste')
  await click(page, 'Næste')
  await click(page, 'Én gang:')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Hjemmeside: Vækst/.test(text) && /8\.000\s*kr\./.test(text) && /198\s*kr\./.test(text) && /Basis/.test(text) && !/Det forpligter du dig til/.test(text), `${tag}: G køb-forslag: ${text.slice(0, 300)}`)
  check(/Engangspris/.test(text) && /Pr\. måned/.test(text) && /ekskl\. moms/.test(text) && /Derfor foreslår jeg det/.test(text), `${tag}: G resultatets dele`)
  check(await noOverflow(page), `${tag}: G vandret scroll i resultatet`)

  // Arbejdsgang med mange sager og intet system: ingen pris, kort snak
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Styr på forespørgsler eller en arbejdsgang')
  await click(page, 'Næste')
  await click(page, 'Mange, og jeg mister overblikket')
  await click(page, 'Næste')
  await click(page, 'Nej, indbakke, papir eller regneark')
  await click(page, 'Se resultatet')
  text = await calc(page)
  check(/Særskilt fast tilbud/.test(text) && /53 61 36 99/.test(text) && !/\d\.?\d{3}\s*kr\./.test(text) && !/Din pris/.test(text), `${tag}: G arbejdsgang giver en pris: ${text.slice(0, 260)}`)
  check(await page.evaluate(() => !!document.querySelector('#beregner a[href^="tel:"]') && !!document.querySelector('#beregner a[href^="sms:"]')), `${tag}: G Ring/SMS mangler`)

  // Usikker og "Jeg ved det ikke"
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Jeg er ikke sikker')
  await click(page, 'Næste')
  await click(page, 'Jeg ved det ikke')
  await click(page, 'Se resultatet')
  text = await calc(page)
  check(/Lad os tage en kort snak/.test(text) && !/\d\.?\d{3}\s*kr\./.test(text), `${tag}: G afklaring: ${text.slice(0, 200)}`)

  // Ændrede svar og tilbage
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  await click(page, '6-8 sider')
  await click(page, 'Næste')
  await click(page, 'Én gang:')
  await click(page, 'Vis mit forslag')
  check(/10\.000\s*kr\./.test(await calc(page)), `${tag}: G første forslag`)
  await click(page, 'Ret svarene')
  await click(page, 'Min Google-profil')
  check(!/g-sider|g-model/.test(await search(page)), `${tag}: G gamle svar i adresselinjen: ${await search(page)}`)
  await click(page, 'Næste')
  await click(page, 'Nej, kun Google-profilen')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Booking & Google: Start/.test(text) && /1\.000\s*kr\./.test(text) && !/5\.000|Hjemmeside:/.test(text), `${tag}: G gamle tilvalg hænger ved: ${text.slice(0, 200)}`)
  await click(page, 'Tilbage')
  check(await page.evaluate(() => document.querySelector('#beregner input[type=radio]:checked')?.closest('label')?.innerText.includes('Nej, kun Google-profilen')), `${tag}: G tilbage mistede svaret`)

  // Beregnerens valg overlever, at guiden åbnes og springes over
  await open(page, '/priser/?ydelser=hjemmeside,marketing')
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Spring over', '#beregner button')
  check(/ydelser=hjemmeside%2Cmarketing|ydelser=hjemmeside,marketing/.test(await search(page)) && !/hjaelp/.test(await search(page)), `${tag}: G valg mistet efter guide: ${await search(page)}`)

  // ---- F: formular fra guidens resultat -----------------------------------------------
  await open(page, '/priser/?hjaelp=4&g-behov=hjemmeside&g-sider=1&g-model=koeb')
  check(/Mit forslag til dig/.test(await calc(page)) && /Hjemmeside: Start/.test(await calc(page)), `${tag}: F forslaget vises ikke efter genindlæsning`)
  requests.length = 0
  await page.type('input[name=contact]', 'forkert')
  await click(page, 'Send til Ronny', 'button')
  check(requests.length === 0 && /gyldig mail/.test(await calc(page)), `${tag}: F ugyldig kontakt sendte alligevel`)
  await page.$eval('input[name=contact]', (n) => (n.value = ''))
  reply = { status: 500, body: { ok: false } }
  await page.type('input[name=contact]', 'test@example.com')
  await page.type('input[name=name]', 'Testcafé')
  await page.type('textarea[name=message]', 'Kort besked')
  await click(page, 'Send til Ronny', 'button')
  await wait(300)
  check(requests.length === 1 && /Det blev ikke sendt/.test(await calc(page)) && !/Tak\. Jeg svarer/.test(await calc(page)), `${tag}: F serverfejl vises ikke korrekt`)
  check(await page.evaluate(() => document.querySelector('textarea[name=message]').value === 'Kort besked' && document.querySelector('input[name=name]').value === 'Testcafé'), `${tag}: F felter mistet efter fejl`)
  reply = { status: 200, body: { ok: true } }
  await click(page, 'Send til Ronny', 'button')
  await wait(300)
  const sent = requests.at(-1)
  check(/Tak\. Jeg svarer inden for 24 timer/.test(await calc(page)), `${tag}: F tak mangler`)
  const link = new URL(sent?.link ?? '/', SITE)
  check(link.searchParams.get('ydelser') === 'hjemmeside' && link.searchParams.get('sider') === '1' && link.searchParams.get('drift') === 'basis' && !link.search.includes('hjaelp') && !link.search.includes('test@'), `${tag}: F payload-link: ${sent?.link}`)
  check(sent?.contact === 'test@example.com' && sent?.name === 'Testcafé' && sent?.message === 'Kort besked', `${tag}: F payload: ${JSON.stringify(sent)}`)

  // ---- K: tastatur -----------------------------------------------------------------------
  await open(page)
  let guard = 0
  while (guard++ < 80) {
    const label = await page.evaluate(() => document.activeElement?.innerText ?? '')
    if (label.trim().startsWith('Hjælp mig med at vælge')) break
    await page.keyboard.press('Tab')
  }
  check(guard < 80, `${tag}: K guideknappen kan ikke nås med tab`)
  check(await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement)
    return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2
  }), `${tag}: K synligt fokus på guideknappen`)
  await page.keyboard.press('Enter')
  await wait(250)
  check(await page.evaluate(() => document.activeElement?.tagName === 'H2' && /Hvad vil du gerne/.test(document.activeElement.innerText)), `${tag}: K fokus går ikke til spørgsmålet`)
  await page.keyboard.press('Tab')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await wait(100)
  const checkedLabel = await page.evaluate(() => document.querySelector('#beregner input:checked')?.closest('label')?.innerText)
  check(/booking/i.test(checkedLabel ?? ''), `${tag}: K piletaster: ${checkedLabel}`)
  await page.keyboard.press('Enter')
  await wait(250)
  check(/Har du en hjemmeside/.test(await calc(page)), `${tag}: K Enter går ikke videre`)

  await page.close()
}

await browser.close()
// 500 kommer fra den efterlignede serverfejl i formulartesten. Vite-udviklingsserverens websocket lukker, når siden går i browserens cache.
const unique = [...new Set(errors)].filter((e) => !/status of 500/.test(e) && !/Page entered Back-Forward Cache/.test(e))
check(unique.length === 0, `konsolfejl: ${unique.join(' | ')}`)
if (failures.length) {
  console.error(`Guide-browsertest FEJLET (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Guide-browsertest bestået (375 og 1440 px): trin 0, Lokal, overlap, QR uden booking, guide (3 spørgsmål, Spring over, betalingsmodel, arbejdsgang uden pris), formular, gamle links, tastatur, ingen konsolfejl.')
