/**
 * Browsertest af behovsguiden og eksemplerne mod `npm run preview` (puppeteer-core,
 * som de øvrige browsertests). Kører på 375 og 1440 px, tager skærmbilleder af
 * indgangen, guiden og resultatet (docs/ovia-ux-shots/) og efterligner serveren
 * (/api/henvendelse) – der sendes aldrig en rigtig henvendelse.
 *
 * Kunderejser: direkte beregning (siderne, så driften som eget trin uden forvalg), guide
 * uden hjemmeside, hjemmeside med spørgsmålet om ændringer efter lancering (mindste plan),
 * booking giver ikke ny hjemmeside, "Jeg er ikke sikker"/"Jeg ved det ikke", ændrede svar,
 * formularens payload (succes og fejl), demo og tilbage, genindlæsning, tastatur,
 * vandret scroll og konsolfejl.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const SHOTS = 'docs/ovia-ux-shots'
mkdirSync(SHOTS, { recursive: true })

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

/** Klik på en knap eller et label med præcis denne tekst (inde i beregneren). */
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

async function open(page, path = '/') {
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

  // ---- I: indgangen ----------------------------------------------------
  await open(page)
  let text = await calc(page)
  check(text.includes('Hjælp mig med at vælge') && text.includes('Er du usikker? Svar på et par korte spørgsmål.'), `${tag}: guidens indgang mangler`)
  check(text.includes('Alle priser er ekskl. moms'), `${tag}: moms mangler ved første trin`)
  check(!(await page.evaluate(() => /Hvad vil du gerne have hjælp til/.test(document.body.innerText))), `${tag}: guiden starter af sig selv`)
  check(await noOverflow(page), `${tag}: vandret scroll på forsiden`)
  await page.screenshot({ path: `${SHOTS}/${width}-1-indgang.png` })
  const examples = await page.evaluate(() => [...document.querySelectorAll('#eksempler li')].map((li) => ({ text: li.innerText, href: li.querySelector('a')?.getAttribute('href'), img: li.querySelector('img')?.loading })))
  check(examples.length === 2 && examples.every((e) => /demo/i.test(e.text) && e.href?.startsWith('/demoer/') && e.img === 'lazy'), `${tag}: eksempler: ${JSON.stringify(examples)}`)
  await page.evaluate(() => document.querySelector('#eksempler').scrollIntoView())
  await wait(300)
  await page.screenshot({ path: `${SHOTS}/${width}-1b-eksempler.png` })

  // ---- A: direkte beregning ---------------------------------------------
  await open(page)
  await click(page, 'Hjemmeside')
  await click(page, 'Næste')
  text = await calc(page)
  check(/forsiden, menukortet/.test(text), `${tag}: hjælpetekst om sider mangler`)
  await click(page, '2-5 sider')
  await click(page, 'Nej')
  await click(page, 'Næste')
  // Driftstrinnet: eget trin, tre planer + egen konto/hosting, ingen er forvalgt.
  text = await calc(page)
  check(/Trin 3 af 4/.test(text) && /Drift af din hjemmeside/.test(text), `${tag}: driftstrinnet mangler eller tæller forkert: ${text.slice(0, 120)}`)
  check(/Basis/.test(text) && /99\s*kr\./.test(text) && /Ingen inkluderede indholdsændringer/.test(text), `${tag}: Basis mangler`)
  check(/Plus/.test(text) && /199\s*kr\./.test(text) && /Hjælp til billeder, tekst og nyheder/.test(text), `${tag}: Plus mangler`)
  check(/Ekstra/.test(text) && /399\s*kr\./.test(text) && /Flere rettelser og nyt indhold hver måned/.test(text), `${tag}: Ekstra mangler`)
  check(/Egen konto\/hosting/.test(text) && /Ingen månedlig betaling til OviaSpecs for drift/.test(text) && /udgifter til hosting og domæne/.test(text), `${tag}: egen konto mangler`)
  check(/Hvad er drift\?/.test(text) && /Ubrugt tid overføres ikke/.test(text) && /ekskl\. moms/.test(text), `${tag}: forklaring eller moms mangler`)
  check(await page.evaluate(() => !!document.querySelector('#beregner [data-tour="drift"]') && !document.querySelector('#beregner input[name=drift]:checked')), `${tag}: data-tour=drift mangler, eller et valg er forvalgt`)
  check(await page.evaluate(() => !!document.querySelector('[data-tour="calc"]')) && (await noOverflow(page)), `${tag}: data-tour=calc eller vandret scroll på driftstrinnet`)
  await page.screenshot({ path: `${SHOTS}/${width}-1c-drift.png` })
  await click(page, 'Vis min pris') // intet valgt: gæt aldrig
  text = await calc(page)
  check(/Vælg en driftsplan eller egen konto\/hosting/.test(text) && /Trin 3 af 4/.test(text), `${tag}: manglende driftsvalg stoppes ikke`)
  check(await page.evaluate(() => document.activeElement?.name === 'drift'), `${tag}: fokus flyttes ikke til driftvalget`)
  await click(page, 'Plus')
  check(await page.evaluate(() => document.querySelector('#beregner input[name=drift]:checked')?.value === 'plus' && /Valgt/.test(document.querySelector('#beregner input[name=drift]:checked').closest('label').textContent)), `${tag}: valgt plan får ikke tydelig respons`)
  await click(page, 'Vis min pris')
  text = await calc(page)
  check(/4\.000\s*kr\./.test(text) && /199\s*kr\./.test(text) && /ekskl\. moms/.test(text), `${tag}: direkte pris: ${text.slice(0, 200)}`)
  check(/Hvad dækker månedsprisen/.test(text), `${tag}: månedsprisens forklaring mangler`)
  check(await page.evaluate(() => !!document.querySelector('#beregner [data-tour="price"]')), `${tag}: data-tour=price mangler`)
  // Driften kan skiftes i resultatet uden at pakken ændres, og pakkeskift bevarer driften.
  await click(page, 'Ekstra')
  text = await calc(page)
  check(/Hjemmeside: Vækst/.test(text) && /4\.000\s*kr\.\s*\+\s*399\s*kr\./.test(text) && /drift=ekstra/.test(await search(page)), `${tag}: skift af drift i resultatet: ${text.slice(0, 200)}`)
  await click(page, 'Fuld fart')
  text = await calc(page)
  check(/Hjemmeside: Fuld fart/.test(text) && /5\.000\s*kr\.\s*\+\s*399\s*kr\./.test(text) && /drift=ekstra/.test(await search(page)), `${tag}: pakkeskift bevarede ikke driften`)
  await click(page, 'Basis')
  text = await calc(page)
  check(/5\.000\s*kr\.\s*\+\s*99\s*kr\./.test(text) && /sider=6-8/.test(await search(page)), `${tag}: Fuld fart kræver ikke Ekstra: ${text.slice(0, 200)}`)
  await click(page, 'Egen konto/hosting')
  text = await calc(page)
  check(/6\.000\s*kr\./.test(text) && /Ingen månedlig betaling til OviaSpecs for drift/.test(text) && /udgifter til hosting og domæne/.test(text), `${tag}: egen konto i resultatet: ${text.slice(0, 200)}`)
  // Booking tvinger ingen plan: tilbage til siderne, vælg booking, driften står uændret.
  await click(page, 'Ret svarene')
  await click(page, 'Ja')
  await click(page, 'Næste')
  check(await page.evaluate(() => document.querySelector('#beregner input[name=drift]:checked')?.value === 'egen'), `${tag}: booking ændrede driftsvalget`)
  await click(page, 'Vis min pris')
  text = await calc(page)
  check(/6\.500\s*kr\./.test(text) && /Ikke med i priserne fra OviaSpecs/.test(text), `${tag}: booking + egen konto: ${text.slice(0, 200)}`)
  await page.screenshot({ path: `${SHOTS}/${width}-1d-resultat-drift.png` })
  // Gamle links (drift=drift) giver planen med samme månedspris.
  await open(page, '/priser/?ydelser=hjemmeside&sider=6-8&bestilling=nej&drift=drift&trin=3')
  text = await calc(page)
  check(/Din pris/.test(text) && /5\.000\s*kr\./.test(text) && /399\s*kr\./.test(text) && /Drift Ekstra/.test(text), `${tag}: gammelt link migreres ikke: ${text.slice(0, 160)}`)
  check(/Send din forespørgsel/.test(text) && !/tilbuddet sendt/i.test(text) && /Der sendes ikke et tilbud automatisk/.test(text), `${tag}: formulartekst`)
  check(/ydelser=hjemmeside/.test(await search(page)) && !/hjaelp/.test(await search(page)), `${tag}: adresselinje efter direkte beregning`)

  // ---- B: guide uden hjemmeside -----------------------------------------
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  text = await calc(page)
  check(/Hvad vil du gerne have hjælp til\?/.test(text) && /Spørgsmål 1/i.test(text) && /Tilbage/.test(text), `${tag}: guidens første spørgsmål`)
  check(/hjaelp=1/.test(await search(page)), `${tag}: guide-trin ikke i adresselinjen`)
  await click(page, 'Næste') // intet valgt
  text = await calc(page)
  check(/Vælg et svar/.test(text), `${tag}: fejlbesked uden svar mangler`)
  check(await page.evaluate(() => document.activeElement?.type === 'radio'), `${tag}: fokus flyttes ikke til svarene ved fejl`)
  await page.screenshot({ path: `${SHOTS}/${width}-2-guide.png` })
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  text = await calc(page)
  check(/Spørgsmål 2 af 3/i.test(text) && /Hvor stor skal hjemmesiden være/.test(text), `${tag}: opfølgende spørgsmål 2 af 3: ${text.slice(0, 120)}`)
  await click(page, 'Én side med det vigtigste')
  await click(page, 'Næste')
  check(/Spørgsmål 3 af 3/i.test(await calc(page)), `${tag}: spørgsmål 3 af 3`)
  check(/Skal du have lavet ændringer på siden/.test(await calc(page)) && !/booke eller bestille/.test(await calc(page)), `${tag}: spørgsmålet om ændringer mangler`)
  await click(page, 'Nej, siden skal bare ligge der')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Mit forslag til dig/.test(text) && /Hjemmeside: Start/.test(text) && /2\.500\s*kr\./.test(text) && /99\s*kr\./.test(text) && /Basis/.test(text) && !/199|399/.test(text), `${tag}: B forslag: ${text.slice(0, 300)}`)
  check(await page.evaluate(() => !!document.querySelector('#beregner [data-tour="price"]')), `${tag}: B data-tour=price mangler`)
  check(/Engangspris/.test(text) && /Pr\. måned/.test(text) && /ekskl\. moms/.test(text) && /Derfor foreslår jeg det/.test(text) && /Det er med/.test(text), `${tag}: B resultatets dele`)
  check(/Ret svarene/.test(text) && /Se og ret i beregneren/.test(text) && /Send din forespørgsel/.test(text), `${tag}: B handlinger`)
  check(await noOverflow(page), `${tag}: vandret scroll i resultatet`)
  await page.evaluate(() => document.querySelector('#beregner').scrollIntoView())
  await wait(300)
  await page.screenshot({ path: `${SHOTS}/${width}-3-resultat.png` })

  // genindlæsning bevarer resultatet
  const before = await search(page)
  await page.reload({ waitUntil: 'networkidle0' })
  await wait(400)
  check((await search(page)) === before && /Mit forslag til dig/.test(await calc(page)), `${tag}: genindlæsning mistede guidens resultat`)

  // ---- G: formular fra guidens resultat -----------------------------------
  requests.length = 0
  await page.type('input[name=contact]', 'forkert')
  await click(page, 'Send til Ronny', 'button')
  check(requests.length === 0 && /gyldig mail/.test(await calc(page)), `${tag}: G ugyldig kontakt sendte alligevel`)
  await page.$eval('input[name=contact]', (n) => (n.value = ''))
  reply = { status: 500, body: { ok: false } }
  await page.type('input[name=contact]', 'test@example.com')
  await page.type('input[name=name]', 'Testcafé')
  await click(page, 'Send til Ronny', 'button')
  await wait(300)
  check(requests.length === 1 && /Det blev ikke sendt/.test(await calc(page)) && !/Tak\. Jeg svarer/.test(await calc(page)), `${tag}: G serverfejl vises ikke korrekt`)
  reply = { status: 200, body: { ok: true } }
  await click(page, 'Send til Ronny', 'button')
  await wait(300)
  const sent = requests.at(-1)
  check(/Tak\. Jeg svarer inden for 24 timer/.test(await calc(page)), `${tag}: G tak mangler`)
  const link = new URL(sent?.link ?? '/', SITE)
  check(link.searchParams.get('ydelser') === 'hjemmeside' && link.searchParams.get('sider') === '1' && link.searchParams.get('bestilling') === 'nej' && link.searchParams.get('drift') === 'basis' && !link.search.includes('hjaelp') && !link.search.includes('test@'), `${tag}: G payload-link: ${sent?.link}`)
  check(sent?.contact === 'test@example.com' && sent?.name === 'Testcafé', `${tag}: G payload-kontakt`)

  // ---- C: har hjemmeside + booking -----------------------------------------
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'At gøre booking eller bestilling nemmere')
  await click(page, 'Næste')
  await click(page, 'Ja')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Booking & Google: Vækst/.test(text) && /1\.000\s*kr\./.test(text) && !/Hjemmeside:/.test(text) && /i stedet for at lave en ny/.test(text), `${tag}: C forslag: ${text.slice(0, 300)}`)
  check(/Ingen månedspris/.test(text), `${tag}: C månedspris vises ikke som ingen`)

  // ---- D: usikker ------------------------------------------------------------
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Jeg er ikke sikker')
  await click(page, 'Næste')
  check(/Hvad er vigtigst for dig lige nu/.test(await calc(page)), `${tag}: D opfølgning`)
  await click(page, 'Jeg ved det ikke')
  await click(page, 'Se resultatet')
  text = await calc(page)
  check(/Lad os tage en kort snak/.test(text) && /53 61 36 99/.test(text) && !/\d\.\d{3}\s*kr\./.test(text), `${tag}: D afklaring: ${text.slice(0, 200)}`)
  check(await page.evaluate(() => !!document.querySelector('#beregner a[href^="tel:"]') && !!document.querySelector('#beregner a[href^="sms:"]')), `${tag}: D Ring/SMS mangler`)
  await page.screenshot({ path: `${SHOTS}/${width}-4-afklaring.png` })
  // "Jeg ved det ikke" på teknisk valg
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  await click(page, 'Jeg ved det ikke')
  await click(page, 'Næste')
  await click(page, 'Jeg ved det ikke')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Hjemmeside: Start/.test(text) && /Du var i tvivl/.test(text), `${tag}: D ved-ikke giver ikke et forslag: ${text.slice(0, 200)}`)

  // ---- E: ændrede svar --------------------------------------------------------
  await open(page)
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'En ny eller bedre hjemmeside')
  await click(page, 'Næste')
  await click(page, '6-8 sider')
  await click(page, 'Næste')
  await click(page, 'Ja, jævnligt')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/5\.000\s*kr\./.test(text) && /399\s*kr\./.test(text) && /Ekstra/.test(text), `${tag}: E første forslag: ${text.slice(0, 200)}`)
  await click(page, 'Ret svarene')
  await click(page, 'At blive fundet på Google')
  check(!/g-sider|g-bestilling/.test(await search(page)), `${tag}: E gamle svar i adresselinjen: ${await search(page)}`)
  await click(page, 'Næste')
  await click(page, 'Nej, kun Google-profilen')
  await click(page, 'Vis mit forslag')
  text = await calc(page)
  check(/Booking & Google: Start/.test(text) && /500\s*kr\./.test(text) && !/5\.000|399|Hjemmeside:/.test(text), `${tag}: E gamle tilvalg hænger ved: ${text.slice(0, 300)}`)
  // tilbage-knappen i guiden bevarer svarene
  await click(page, 'Tilbage')
  check(await page.evaluate(() => document.querySelector('#beregner input[type=radio]:checked')?.closest('label')?.innerText.includes('Nej, kun Google-profilen')), `${tag}: E tilbage mistede svaret`)
  await click(page, 'Tilbage')
  check(await page.evaluate(() => document.querySelector('#beregner input[type=radio]:checked')?.closest('label')?.innerText.includes('At blive fundet på Google')), `${tag}: E tilbage mistede behovet`)
  await click(page, 'Tilbage') // forlader guiden
  text = await calc(page)
  check(/Hvad skal du bruge\?/.test(text) && !/hjaelp/.test(await search(page)), `${tag}: E vej tilbage til beregneren`)

  // kundens valg overlever, at guiden åbnes og forlades
  await open(page, '/priser/?ydelser=hjemmeside,marketing')
  await click(page, 'Hjælp mig med at vælge')
  await click(page, 'Vælg selv i beregneren')
  check(/ydelser=hjemmeside%2Cmarketing|ydelser=hjemmeside,marketing/.test(await search(page)) && !/hjaelp/.test(await search(page)), `${tag}: valg mistet efter guide: ${await search(page)}`)
  await page.screenshot({ path: `${SHOTS}/${width}-5-efter-guide.png` })

  // forslag åbnes i beregneren med samme pris
  await open(page, '/?hjaelp=4&g-behov=sociale&g-opslag=ja&g-annoncer=nej')
  text = await calc(page)
  check(/Marketing: Vækst/.test(text) && /2\.500\s*kr\./.test(text), `${tag}: marketingforslag: ${text.slice(0, 200)}`)
  await click(page, 'Se og ret i beregneren')
  text = await calc(page)
  check(/Din pris/.test(text) && /Marketing: Vækst/.test(text) && /2\.500\s*kr\./.test(text) && /ydelser=marketing/.test(await search(page)) && !/hjaelp/.test(await search(page)), `${tag}: forslag i beregneren: ${text.slice(0, 200)}`)

  // ---- H: demo og tilbage ----------------------------------------------------
  const calcUrl = '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4'
  await open(page, calcUrl)
  await page.evaluate(() => document.querySelector('#eksempler a').scrollIntoView())
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#eksempler li a')])
  check(/\/demoer\/restaurant\//.test(page.url()), `${tag}: H åbnede ikke demoen: ${page.url()}`)
  const backHref = await page.evaluate(() => document.querySelector('.dm-strip-back')?.getAttribute('href'))
  check(backHref === `${calcUrl}#eksempler`.replace('trin=3', 'trin=3'), `${tag}: H returlink: ${backHref}`)
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.dm-strip-back')])
  await wait(400)
  check((await search(page)) === calcUrl.slice(1) && /Din pris/.test(await calc(page)) && /4\.000\s*kr\./.test(await calc(page)), `${tag}: H valgene mistet efter retur: ${await search(page)}`)
  // browserens tilbage-knap
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#eksempler li a')])
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.goBack()])
  await wait(400)
  check((await search(page)) === calcUrl.slice(1) && /4\.000\s*kr\./.test(await calc(page)), `${tag}: H browser-tilbage mistede valg`)
  // guidens svar overlever en tur til en demo
  await open(page, '/?hjaelp=2&g-behov=hjemmeside')
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#eksempler li a')])
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.dm-strip-back')])
  await wait(400)
  check(/hjaelp=2/.test(await search(page)) && /Hvor stor skal hjemmesiden være/.test(await calc(page)), `${tag}: H guide mistet efter demo: ${await search(page)}`)

  // ---- J: tastatur -----------------------------------------------------------
  await open(page)
  let guard = 0
  while (guard++ < 60) {
    const label = await page.evaluate(() => document.activeElement?.innerText ?? '')
    if (label.trim().startsWith('Hjælp mig med at vælge')) break
    await page.keyboard.press('Tab')
  }
  check(guard < 60, `${tag}: J guideknappen kan ikke nås med tab`)
  const focusRing = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement)
    return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2
  })
  check(focusRing, `${tag}: J synligt fokus på guideknappen`)
  await page.keyboard.press('Enter')
  await wait(250)
  check(await page.evaluate(() => document.activeElement?.tagName === 'H2' && /Hvad vil du gerne/.test(document.activeElement.innerText)), `${tag}: J fokus går ikke til spørgsmålet`)
  await page.keyboard.press('Tab') // første radio
  await page.keyboard.press('ArrowDown') // andet valg: Google
  await page.keyboard.press('ArrowDown') // booking
  await wait(100)
  const checkedLabel = await page.evaluate(() => document.querySelector('#beregner input:checked')?.closest('label')?.innerText)
  check(/booking/i.test(checkedLabel ?? ''), `${tag}: J piletaster: ${checkedLabel}`)
  const labelled = await page.evaluate(() => {
    const radios = [...document.querySelectorAll('#beregner input[type=radio]')]
    return radios.length > 0 && radios.every((r) => r.closest('label')?.innerText.trim()) && !!document.querySelector('#beregner fieldset legend')
  })
  check(labelled, `${tag}: J labels/legend mangler`)
  await page.keyboard.press('Enter') // sender formularen
  await wait(250)
  check(/Har du en hjemmeside/.test(await calc(page)), `${tag}: J Enter går ikke videre`)

  await page.close()
}

await browser.close()
// 500 kommer fra den efterlignede serverfejl i formulartesten.
// Vite-udviklingsserverens websocket lukker, når siden går i browserens cache (kun med npx vite).
const unique = [...new Set(errors)].filter((e) => !/status of 500/.test(e) && !/Page entered Back-Forward Cache/.test(e))
check(unique.length === 0, `konsolfejl: ${unique.join(' | ')}`)
if (failures.length) {
  console.error(`Guide-browsertest FEJLET (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Guide-browsertest bestået (375 og 1440 px): indgang, direkte pris, guide (B-E), formular (G), demo og tilbage (H), tastatur (J), ingen konsolfejl.')
