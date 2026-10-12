/**
 * QA af rebrandet (okt. 2026): browser- og indholdstest mod en kørende preview af den integrerede version.
 * Kriterierne står i docs/rebrand/qa-kriterier.md (AC-1 ... AC-69); scriptet udskriver PASS/FAIL pr. AC-id
 * og afslutter med exit-kode 1, hvis mindst ét AC fejler. AC'er uden automatisk kontrol vises som MANUEL.
 *
 *   npm run preview                                     (i en anden terminal; dist skal være bygget)
 *   SITE=http://localhost:4173 node scripts/test-rebrand-e2e.mjs
 *
 *   ONLY=sider,nav,beregner,guide,formular,seo,a11y,teknik   kun disse grupper (standard: alle)
 *   CHROME=<sti til chrome.exe>                              standard: Chrome i Program Files
 *   RUN_NPM_TEST=1                                           kører også `npm test` (AC-63)
 *   ALLOW_PROD=1                                             nødvendigt, hvis SITE peger på oviaspecs.com
 *
 * Sikkerhed: POST /api/henvendelse besvares ALTID af en efterligning (request interception); andre POST afvises, og
 * forespørgsler til andre værter end SITE afbrydes (ingen analytics, ingen rigtige afsendelser).
 *
 * Selektorer og forventede tekster står som konstanter i "KONFIGURATION" lige herunder, så de er nemme at justere,
 * når den endelige markup kendes. Scriptet bruger tekst, roller og landemærker i stedet for klassenavne.
 *
 * Begrænsning: lab-test i Chrome headless. Ingen skærmlæser, ingen feltdata (INP/LCP fra rigtige brugere).
 */
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

/* =====================================================================
   KONFIGURATION (ret her)
   ===================================================================== */
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = (process.env.SITE ?? 'http://localhost:4173').replace(/\/+$/, '')
const PROD_ORIGIN = 'https://oviaspecs.com'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ONLY = process.env.ONLY?.split(',').map((s) => s.trim())

const VIEWPORTS = [360, 390, 768, 1440]
const PAGES = [
  '/',
  '/hjemmeside/',
  '/marketing/',
  '/booking-google/',
  '/systemer/',
  '/priser/',
  '/demoer/',
  '/demoer/cafe/',
  '/demoer/restaurant/',
  '/demoer/salon/',
  '/demoer/vinbar/',
  '/privatlivspolitik/',
]
/** Sider, hvor hele OviaSpecs-designet gælder (koncepterne under /demoer/<id>/ har hver deres udtryk og tjekkes ikke for kontrast). */
const SITE_PAGES = ['/', '/hjemmeside/', '/marketing/', '/booking-google/', '/systemer/', '/priser/', '/demoer/']
/** Adresser, der skal viderestilles med 301 (fra README), og som ingen intern side må linke til. */
const LEGACY = ['/hjemmesider/', '/seo/', '/google-ads/', '/sociale-medier-annoncering/', '/booking-integrationer/', '/prisberegner/', '/ai-automatisering/', '/om/', '/kontakt/']

const CONTACT = { tel: 'tel:+4553613699', phone: '53 61 36 99', mail: 'kontakt@oviaspecs.com' }

/** Gamle beregnerlinks (skal virke uændret som "Køb hjemmesiden"). once/monthly er håndregnet. */
const OLD_LINKS = [
  { q: 'ydelser=hjemmeside&sider=1&bestilling=nej&drift=basis&trin=4', once: 2500, monthly: 99 },
  { q: 'ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=4', once: 4000, monthly: 199 },
  { q: 'ydelser=hjemmeside&sider=6-8&bestilling=ja&drift=ekstra&trin=4', once: 5500, monthly: 399 },
  { q: 'ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=egen&trin=4', once: 5000, monthly: 0 },
  { q: 'ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=drift&trin=3', once: 4000, monthly: 199 }, // gammelt drift=drift: Vækst -> Plus
  { q: 'ydelser=hjemmeside&sider=6-8&bestilling=nej&drift=drift&trin=3', once: 5000, monthly: 399 }, // Fuld fart -> Ekstra
]
const FORM_URL = `/?${OLD_LINKS[1].q}`

/** Forsidens sektioner i den rækkefølge, briefet kræver. sel = id'er i prioriteret rækkefølge; heading = fallback på h1/h2-tekst. */
const HOME_SECTIONS = [
  { name: '1 hero', sel: ['main h1', 'h1'] },
  { name: '2 eksempler', sel: ['#eksempler'], heading: 'eksempl|demo' },
  { name: '3 tre problemer', sel: ['#problemer', '#problems'], heading: 'problem|udfordring|kender du' },
  { name: '4 to købsmåder', sel: ['#koebsmaader'] },
  { name: '5 beregner + guide', sel: ['#beregner'] },
  { name: '6 forløb', sel: ['#forloeb', '#proces', '#sadan-foregaar-det', '#trin'], heading: 'sådan foregår|forløb|fra første samtale|trin for trin|proces' },
  { name: '7a om Ronny', sel: ['#om'], heading: 'ronny|om mig|om oviaspecs' },
  { name: '7b FAQ', sel: ['#faq', '#spoergsmaal'], heading: 'spørgsmål|faq' },
  { name: '7c kontakt', sel: ['#kontakt'], heading: 'kontakt' },
]
/** /priser/: overskrift -> beregner -> købsmåder -> pakker -> vilkår -> kontakt. optional: manglende element er kun en advarsel. */
const PRICE_SECTIONS = [
  { name: 'overskrift', sel: ['main h1', 'h1'] },
  { name: 'beregner', sel: ['#beregner'] },
  { name: 'købsmåder', sel: ['#koebsmaader'] },
  { name: 'pakker', sel: ['#pakker'], heading: 'pakke|engangskøb|alle priser', optional: true },
  { name: 'vilkår', sel: ['#vilkaar'] },
  { name: 'kontakt', sel: ['#kontakt'], heading: 'kontakt|skriv til|ring', optional: true },
]

/** Navigation: tekster og adresser. */
const NAV = {
  disclosure: /^l(ø|o)sninger/i, // knappen "Løsninger" (desktop)
  menuButton: /^menu$/i, // mobilens menuknap
  solutions: [
    ['Hjemmesider', '/hjemmeside/'],
    ['Lokal synlighed', '/booking-google/'],
    ['Systemer', '/systemer/'],
    ['Marketing', '/marketing/'],
  ],
  top: [
    ['Eksempler', '/demoer/'],
    ['Priser', '/priser/'],
    ['Om', '/#om'], // "Om/Kontakt"
  ],
}

/** Beregneren og guiden (tekst-baserede). */
const CALC = {
  root: '#beregner',
  modeLokal: /løbende samarbejde/i,
  modeKoeb: /køb hjemmesiden/i,
  addons: /lokal synlighed|booking\s*&\s*google|marketing/i, // tilvalg, der IKKE må komme før købsmåderne
  next: /^(næste|videre|vis min pris|vis pris|se (min )?pris|vis (mit )?(forslag|resultat)|se (mit )?(forslag|resultat))/i,
  pricePanel: '[data-tour="price"]',
  contactLabel: /mail eller (dit )?telefon|din mail|kontaktoplysning/i,
  guideEntry: /hjælp mig med at vælge/i,
  skip: /spring (guiden )?over|spring over/i,
  // Tegn på, at guiden er nået til resultatet (må IKKE matche knapper som "Vis mit forslag" på spørgsmålssiderne).
  guideResult: /send til ronny|send din forespørgsel|dit forslag|jeg anbefaler|min anbefaling|din pris/i,
}
const MAX_GUIDE_QUESTIONS = 3
const MAX_GUIDE_NODES = 140

/** Formularen (under beregnerens resultat). */
const FORM = {
  contact: `${CALC.root} input[name=contact]`,
  name: `${CALC.root} input[name=name]`,
  honeypot: `${CALC.root} input[name=website]`,
  message: `${CALC.root} textarea:not([name=website])`,
  maxMessage: 1000,
}
const WORKFLOW_DEMO = '#demo' // på /systemer/

/** Tekster, der aldrig må stå på siden. */
const FORBIDDEN = [
  { re: /gratis\s+(hjemmeside|website|webside)/i, why: '"gratis hjemmeside" er ikke tilladt (brug "0 kr. i opstart - 995 kr./md. - mindst 6 måneder")' },
  { re: /ingen\s+udtrædelsesomkostning/i, why: '"ingen udtrædelsesomkostninger" modsiger frikøbet på 1.000 kr.' },
  { re: /(?<![\d.,])2\.?700(?!\d)/, why: 'historisk pris 2.700 kr. må ikke stå som offentlig pris' },
  { re: /webmaster/i, why: '"webmaster" (bruges i dag i driftsplanen Ekstra) er et stort bureau-ord og skal væk' },
  { re: /ekspert/i, why: '"ekspert" er udokumenteret' },
  { re: /revolutioner/i, why: '"revolutionerende" er buzzword' },
  { re: /digital transformation/i, why: '"digital transformation" er buzzword' },
]
/** Advarsler (kræver menneskeligt blik, fejler ikke scriptet): løfter om resultater. */
const RISKY = [
  /bliver\s+(du\s+)?fundet/i,
  /flere\s+kunder/i,
  /første\s*plads|førsteplads|nr\.?\s*1\b|top\s*3|forsiden\s+af\s+google|side\s*1\s+(på|i)\s+google/i,
  /ai-?\s?(citering|synlighed)/i,
  /\d+\s*%\s*(flere|mere|højere|øgning)/i,
  /100\s*\/\s*100/,
  /rating|anmeldelser fra|★|⭐|stjerner/i,
]
const NEGATION = /(ingen|ikke|uden|aldrig|kan\s+ikke|lover\s+ikke|giver\s+ikke|ingen\s+form\s+for)/i
/** Beløb (kr), der må stå på de statiske sider. Andre beløb giver en advarsel (kan være gamle priser eller summer). */
const ALLOWED_AMOUNTS = new Set([0, 99, 199, 200, 399, 400, 495, 500, 995, 1000, 1495, 1500, 2500, 4000, 5000, 5500, 5970, 6500, 8970, 11940, 17940])

/* =====================================================================
   AC-KATALOG (skal følge docs/rebrand/qa-kriterier.md)
   ===================================================================== */
const CATALOG = [
  // Priser og vilkår
  ['AC-1', 'Priser og vilkår', 'Lokal-tilbuddet (0 kr. opstart, 995 kr./md., mindst 6 mdr., minimum 5.970 kr.) i hero og på /priser/'],
  ['AC-2', 'Priser og vilkår', 'Lokal-omfang: 1-3 sider, 2 korrekturrunder, 45+15 min./md., domæneloft 200 kr./år, support på hverdage'],
  ['AC-3', 'Priser og vilkår', 'Systemmodulet sælges ikke til en pris, mens systemModule.ready=false (alle sider, JSON-LD, beregner, guide)'],
  ['AC-4', 'Priser og vilkår', 'Engangspriser Start 2.500 / Vækst 4.000 / Fuld fart 5.000'],
  ['AC-5', 'Priser og vilkår', 'Drift Basis 99 / Plus 199 (15 min.) / Ekstra 399 (30 min.); egen konto +1.000 én gang'],
  ['AC-6', 'Priser og vilkår', 'Frikøb/overførsel 1.000 kr. vist og forklaret; aldrig "ingen udtrædelsesomkostninger"'],
  ['AC-7', 'Priser og vilkår', 'Bookingintegration +500, ekstra side +400, udbyderens abonnement betales direkte'],
  ['AC-8', 'Priser og vilkår', 'Booking & Google 500/1.000/1.500; QR uden booking; Google + QR = 1.000; QR er engangsleverance'],
  ['AC-9', 'Priser og vilkår', 'Marketing 1.500/2.500/4.000 kr./md., annoncebudget separat'],
  ['AC-10', 'Priser og vilkår', 'Moms-note ("ekskl. moms"); ingen opdigtet CVR/adresse'],
  ['AC-11', 'Priser og vilkår', 'Vilkår som synlig sektion (#vilkaar) på /priser/, ikke gemt i FAQ'],
  ['AC-12', 'Priser og vilkår', 'Ingen skjult binding: opsigelse/minimum, filudlevering, brugsret, dataeksport er formuleret'],
  ['AC-13', 'Priser og vilkår', 'Ingen gamle eller modstridende beløb (samme købsmåder-priser på forside og /priser/)'],
  // Beregner
  ['AC-14', 'Beregner', 'Først de to købsmåder (gensidigt udelukkende), derefter tilvalg'],
  ['AC-15', 'Beregner', 'Ingen dobbeltbetaling (Lokal viser hverken drift eller engangspris)'],
  ['AC-16', 'Beregner', 'Gamle links virker uændret som "Køb hjemmesiden" med samme priser'],
  ['AC-17', 'Beregner', 'Samme pris på skærm, i afsendt link og ved uafhængig genberegning'],
  ['AC-18', 'Beregner', 'Lokal-resultat viser opstart, md., minimumsperiode, minimumsbetaling, eksterne udgifter, overdragelse FØR kontaktfeltet'],
  ['AC-19', 'Beregner', 'Valg og resultat bevares ved genindlæsning/delt link; kontaktoplysninger aldrig i adressen'],
  // Guide
  ['AC-20', 'Guide', 'Højst 3 spørgsmål i alle grene'],
  ['AC-21', 'Guide', 'Synlig "Spring over" på hvert spørgsmål'],
  ['AC-22', 'Guide', 'Google alene giver en engangsopgave (ikke booking-pakke)'],
  ['AC-23', 'Guide', 'QR uden booking tvinger ikke booking med (ikke 1.500)'],
  ['AC-24', 'Guide', 'Booking anbefales som integration af eksisterende system, ikke ny kalender'],
  ['AC-25', 'Guide', 'System kun ved relevant arbejdsgang; aldrig modul med pris'],
  ['AC-26', 'Guide', 'Guiden åbner kun på brugerens initiativ; forslag og beregner viser samme pris'],
  // Formular
  ['AC-27', 'Formular', 'Felter: kontakt (påkrævet), navn/virksomhed og besked (valgfri), skjult honeypot, intet andet'],
  ['AC-28', 'Formular', 'Validering: tom/ugyldig kontakt sender intet og viser fejltekst ved feltet'],
  ['AC-29', 'Formular', 'Serverfejl (500/503/ok:false): ingen tak, fejltekst, valg og felter bevaret'],
  ['AC-30', 'Formular', 'Succes ("Tak") først når serveren har svaret { ok: true }'],
  ['AC-31', 'Formular', 'Det er en forespørgsel, ikke en bestilling; payload indeholder kontakt, navn, besked og link; intet sendt rigtigt'],
  ['AC-32', 'Formular', 'Besked højst 1.000 tegn'],
  // Navigation og sider
  ['AC-33', 'Navigation og sider', 'Navigation: Løsninger (4 punkter), Eksempler, Priser, Om/Kontakt'],
  ['AC-34', 'Navigation og sider', 'Løsninger-disclosure virker med tastatur (Enter/Space, aria-expanded, Escape, klik udenfor)'],
  ['AC-35', 'Navigation og sider', 'Mobilmenu: åbner/lukker, viser de fire løsninger under en overskrift, Escape'],
  ['AC-36', 'Navigation og sider', '"Ring" og "Se din pris" bevaret'],
  ['AC-37', 'Navigation og sider', 'Forsidens sektioner i rækkefølge; ingen beregner i heroen; #koebsmaader findes'],
  ['AC-38', 'Navigation og sider', 'Alle sider svarer 200; /systemer/ har indhold (spørg først, status, særskilt tilbud, demo)'],
  ['AC-39', 'Navigation og sider', '/priser/ i rækkefølgen overskrift, beregner, købsmåder, pakker, vilkår, kontakt'],
  ['AC-40', 'Navigation og sider', 'Demoer er mærket, begrænsninger tydelige, arbejdsgangsdemoen (#demo) sender intet'],
  ['AC-41', 'Navigation og sider', 'Interne links og #-mål virker; ingen links til omdirigerede gamle adresser'],
  ['AC-42', 'Navigation og sider', '/booking-google/ hedder "Lokal synlighed" i menu og overskrift'],
  ['AC-43', 'Navigation og sider', 'Kontaktoplysninger korrekte (tel, mail); ingen opdigtet CVR/adresse'],
  // Tilgængelighed
  ['AC-44', 'Tilgængelighed', 'Tastatur: alle tab-stop har synlig fokusring og er ikke skjult bag faste elementer'],
  ['AC-45', 'Tilgængelighed', 'Kontrast mindst 4,5:1 (3:1 for stor tekst)'],
  ['AC-46', 'Tilgængelighed', 'Reduceret bevægelse: ingen bevægelses-animationer, indhold synligt'],
  ['AC-47', 'Tilgængelighed', 'Ingen hjælp/rundvisning/dialog åbner af sig selv (8 s og under guidebrug)'],
  ['AC-48', 'Tilgængelighed', 'Trykflader (mål 44 px; under 40 px er fejl)'],
  ['AC-49', 'Tilgængelighed', 'Landemærker, én h1, labels, alt-tekster, lang="da"'],
  // Responsivitet
  ['AC-50', 'Responsivitet', 'Ingen vandret overflow ved 360/390/768/1440 på alle sider'],
  ['AC-51', 'Responsivitet', 'Beregnerens resultat og formularen uden overflow ved 360 px'],
  ['AC-52', 'Responsivitet', 'Brødtekst/knapper ikke under 12 px (14 px anbefalet)'],
  // SEO
  ['AC-53', 'SEO', 'Unik titel og beskrivelse pr. side; én h1'],
  ['AC-54', 'SEO', 'Canonical pr. side; ingen noindex'],
  ['AC-55', 'SEO', 'sitemap.xml indeholder alle sider inkl. /systemer/; robots.txt peger på sitemap'],
  ['AC-56', 'SEO', 'JSON-LD parser, er ikke tom og har ingen rating/review/adresse/system-pris'],
  ['AC-57', 'SEO', 'Redirects: gamle adresser 301 til eksisterende sider, ingen kæder'],
  ['AC-58', 'SEO', 'Forsidens titel/beskrivelse følger briefets retning; delingsbillede og OG-tags'],
  // Ærlighed
  ['AC-59', 'Ærlighed', 'Ingen forbudte formuleringer'],
  ['AC-60', 'Ærlighed', '"garanti" kun i afvisende sammenhæng; ingen løfter om placering, flere kunder eller AI-citering'],
  ['AC-61', 'Ærlighed', 'Ingen opdigtede cases/anmeldelser/tal; marketing siger åbent at der ikke er cases'],
  ['AC-62', 'Ærlighed', 'Jeg-form og naturligt dansk; demoer udgives ikke som kundecases'],
  // Teknik
  ['AC-63', 'Teknik', '`npm test` består'],
  ['AC-64', 'Teknik', '`npm run build` og `npm run lint` består (kør af hovedagenten)'],
  ['AC-65', 'Teknik', 'Ingen konsolfejl, sidefejl eller fejlende interne ressourcer'],
  ['AC-66', 'Teknik', 'CLS højst 0,1 (lab)'],
  ['AC-67', 'Teknik', 'Indhold synligt uden JavaScript og ved scriptfejl'],
  ['AC-68', 'Teknik', 'Ingen eksterne ressourcer ud over det tilladte'],
  ['AC-69', 'Teknik', 'Mobil-LCP (lab) som vejledende måling'],
]

/* =====================================================================
   RESULTATER
   ===================================================================== */
const results = new Map()
const rec = (id) => {
  if (!results.has(id)) results.set(id, { pass: 0, fail: [], warn: [], skip: [], info: [] })
  return results.get(id)
}
const ok = (id, cond, msg) => {
  const r = rec(id)
  if (cond) r.pass++
  else r.fail.push(msg)
}
const warn = (id, cond, msg) => {
  const r = rec(id)
  if (cond) r.pass++
  else r.warn.push(msg)
}
const skip = (id, msg) => rec(id).skip.push(msg)
const info = (id, msg) => rec(id).info.push(msg)
const crashes = []
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const short = (s, n = 140) => (s.length > n ? `${s.slice(0, n)}...` : s)
const want = (group) => !ONLY || ONLY.includes(group)

/* ---- små hjælpere til tekst og beløb ---- */
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Beløb som regulært udtryk: "995 kr.", "5.970 kr.", "995 /md" (ikke en del af et større tal). */
const A = (n) => new RegExp(`(?<![\\d.,])${fmt(n).replace(/\./g, '\\.')}(?!\\d)(?:\\s*(?:kr|,-)|\\s*/\\s*md)`, 'i')
const hasAmount = (text, n) => A(n).test(text)
const amountsIn = (text) => [...text.matchAll(/(?<![\d.,])(\d{1,3}(?:\.\d{3})*|\d+)(?!\d)\s*(?:kr\b|,-)/gi)].map((m) => Number(m[1].replace(/\./g, '')))
const around = (text, index, len = 120) => text.slice(Math.max(0, index - len), index + len)
const MODULE_CONTEXT = /ikke klar|endnu ikke|ikke tilgængelig|planlagt|særskilt fast tilbud|findes ikke|under udvikling|ikke færdig|ikke udviklet|ikke endnu/i
/** Finder steder, hvor systemmodulet (1.495 kr./md. eller 8.970 kr. minimum) vises uden at være tydeligt mærket "ikke klar". */
function moduleViolations(text) {
  const out = []
  for (const m of text.matchAll(/(?<![\d.,])(?:1\.?495|8\.?970)(?!\d)/g)) {
    if (!MODULE_CONTEXT.test(around(text, m.index, 300))) out.push(`"${m[0]}" uden "ikke klar"-mærkning: ...${around(text, m.index, 60)}...`)
  }
  for (const m of text.matchAll(/(?:system|modul)[^.]{0,120}(?<![\d.,])500\s*kr\.?\s*\/\s*md|(?<![\d.,])500\s*kr\.?\s*\/\s*md[^.]{0,120}(?:system|modul)/gi)) {
    if (!MODULE_CONTEXT.test(around(text, m.index, 300))) out.push(`modulpris "+500 kr./md." uden "ikke klar"-mærkning: ...${short(m[0], 100)}...`)
  }
  return out
}

/* ---- repoets egne data (valgfrit; scriptet virker også uden) ---- */
let pricingData = null
let calc = null
try {
  pricingData = await import(pathToFileURL(path.join(ROOT, 'src/data/pricing.js')).href)
} catch (e) {
  info('AC-3', `kunne ikke læse src/data/pricing.js (${e.message}); systemModule.ready antages false`)
}
try {
  calc = await import(pathToFileURL(path.join(ROOT, 'src/calculator.js')).href)
} catch (e) {
  info('AC-17', `kunne ikke læse src/calculator.js (${e.message}); uafhængig genberegning springes over`)
}
const moduleReady = pricingData?.systemModule?.ready === true
const companyCvr = pricingData?.company?.cvr ?? null
const companyAddress = pricingData?.company?.address ?? ''

/* =====================================================================
   BROWSER
   ===================================================================== */
const siteUrl = new URL(SITE)
if (/(^|\.)oviaspecs\.com$/i.test(siteUrl.hostname) && !process.env.ALLOW_PROD) {
  console.error(`Afbryder: SITE peger på ${siteUrl.hostname}. Kør mod en lokal preview (npm run preview). ALLOW_PROD=1 tillader det.`)
  process.exit(2)
}
const SITE_HOST = siteUrl.host

const mock = { status: 200, body: { ok: true }, hold: null }
const posts = [] // henvendelser modtaget af efterligningen
const blockedPosts = [] // andre POST (afvist)
const externalHosts = new Map() // vært -> antal forespørgsler (afbrudt)
const badResponses = [] // 4xx/5xx fra egen vært

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 60000 })
const pageLogs = []

async function newPage(width, { reduceMotion = false, noJs = false, blockScripts = false, height, touch } = {}) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const log = { errors: [], tag: `${width}px${reduceMotion ? ' rm' : ''}${noJs ? ' nojs' : ''}${blockScripts ? ' blokeret-js' : ''}` }
  page.ctx = ctx
  page.noJs = noJs || blockScripts
  page.log = log
  pageLogs.push(log)
  page.on('pageerror', (e) => !blockScripts && log.errors.push(`${log.tag} ${page.url()} sidefejl: ${e.message ?? e}`))
  page.on('console', (m) => {
    if (m.type() !== 'error' || blockScripts) return
    const u = m.location()?.url ?? ''
    if (u && !u.startsWith(SITE)) return // afbrudte eksterne forespørgsler
    if (u.endsWith('/api/henvendelse')) return // den efterlignede serverfejl
    log.errors.push(`${log.tag} ${page.url()} konsol: ${short(m.text(), 220)}`)
  })
  page.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(SITE) && r.status() >= 400 && !u.endsWith('/api/henvendelse')) badResponses.push(`${r.status()} ${u} (fra ${page.url()})`)
  })
  await page.setViewport({ width, height: height ?? (width < 768 ? 812 : 900), isMobile: touch ?? width < 768, hasTouch: touch ?? width < 768 })
  if (reduceMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (noJs) await page.setJavaScriptEnabled(false)
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0
    window.__lcp = 0
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {}
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__lcp = e.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}
  })
  await page.setRequestInterception(true)
  page.on('request', async (req) => {
    let u
    try {
      u = new URL(req.url())
    } catch {
      return req.continue()
    }
    if (u.protocol === 'data:' || u.protocol === 'blob:') return req.continue()
    if (u.host !== SITE_HOST) {
      externalHosts.set(u.host, (externalHosts.get(u.host) ?? 0) + 1)
      return req.abort()
    }
    if (req.method() === 'POST') {
      if (u.pathname === '/api/henvendelse') {
        let body = {}
        try {
          body = JSON.parse(req.postData() ?? '{}')
        } catch {}
        posts.push(body)
        if (mock.hold) await mock.hold
        return req.respond({ status: mock.status, contentType: 'application/json', body: JSON.stringify(mock.body) })
      }
      blockedPosts.push(req.url())
      return req.abort()
    }
    if (blockScripts && req.resourceType() === 'script') return req.abort()
    req.continue()
  })
  return page
}
const closePage = (page) => page.ctx.close().catch(() => {})

async function open(page, p, { settle = 350 } = {}) {
  const res = await page.goto(SITE + p, { waitUntil: 'networkidle0', timeout: 45000 })
  if (!page.noJs) {
    await page.waitForFunction(() => Object.keys(document.getElementById('root') ?? {}).some((k) => k.startsWith('__reactContainer')), { timeout: 8000 }).catch(() => {})
  }
  await wait(settle)
  return res?.status() ?? 0
}
async function scrollAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 40))
    }
    window.scrollTo(0, 0)
  })
  await wait(300)
}

/** Klikker det mindste synlige element (label/knap/link), hvis tekst matcher. Returnerer true/false. */
async function clickText(page, re, { scope = 'body', sel = 'label, button, a[href], summary, [role=button], [role=radio], [role=tab]' } = {}) {
  const handle = await page.evaluateHandle(
    (src, flags, scope, sel) => {
      const re = new RegExp(src, flags)
      const root = document.querySelector(scope) ?? document
      const vis = (el) => {
        const cs = getComputedStyle(el)
        return el.getClientRects().length > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0
      }
      const c = [...root.querySelectorAll(sel)].filter((el) => vis(el) && re.test(el.textContent.replace(/\s+/g, ' ').trim()))
      c.sort((a, b) => a.textContent.length - b.textContent.length)
      return c[0] ?? null
    },
    re.source,
    re.flags,
    scope,
    sel,
  )
  const el = handle.asElement()
  if (!el) return false
  await el.evaluate((n) => n.scrollIntoView({ block: 'center' }))
  await wait(120)
  await el.click()
  await wait(250)
  return true
}
/** Prispanelets samlede pris foran pakke-/driftskifterne (de viser alle alternativer og må ikke regnes med). */
const head = (t) => (t ?? '').split(/Skift (?:pakke|drift)/i)[0]
const calcText = (page) => page.evaluate((sel) => (document.querySelector(sel)?.innerText ?? '').replace(/\s+/g, ' ').trim(), CALC.root)
const search = (page) => page.evaluate(() => location.search)

/** Vælger første valg i hver radiogruppe uden valg og trykker på næste, til resultatet (kontaktfeltet) står der. */
async function advance(page, maxSteps = 8) {
  for (let i = 0; i < maxSteps; i++) {
    if (await page.$(FORM.contact)) return true
    await page.evaluate((root) => {
      const groups = new Map()
      for (const r of document.querySelectorAll(`${root} input[type=radio]`)) {
        const g = groups.get(r.name) ?? []
        g.push(r)
        groups.set(r.name, g)
      }
      for (const [, list] of groups) {
        if (list.some((r) => r.checked)) continue
        const first = list.find((r) => (r.closest('label') ?? r).getClientRects().length > 0)
        ;(first?.closest('label') ?? first)?.click()
      }
    }, CALC.root)
    await wait(200)
    const clicked = await clickText(page, CALC.next, { scope: CALC.root, sel: 'button, a[href], [role=button]' })
    if (!clicked) break
    await wait(250)
  }
  return !!(await page.$(FORM.contact))
}

/* =====================================================================
   SNAPSHOT AF EN SIDE (kører i siden)
   ===================================================================== */
const snapshot = () => {
  const norm = (s) => s.replace(/\s+/g, ' ').trim()
  const clone = document.body.cloneNode(true)
  clone.querySelectorAll('script,style,noscript,template').forEach((e) => e.remove())
  const h1 = document.querySelector('h1')
  const heroEl = h1 ? (h1.closest('section') ?? h1.parentElement?.parentElement ?? h1.parentElement) : null
  const buy = document.querySelector('#koebsmaader')
  const terms = document.querySelector('#vilkaar')
  const offenders = []
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.right <= window.innerWidth + 1) continue
      let clipped = false
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const o = getComputedStyle(n)
        if (/(hidden|auto|scroll|clip)/.test(o.overflowX) || getComputedStyle(n).position === 'fixed') clipped = true
      }
      if (!clipped && getComputedStyle(el).position !== 'fixed' && offenders.length < 5) offenders.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} (${Math.round(r.right)}px)`)
    }
  }
  return {
    text: norm(clone.textContent),
    hero: heroEl ? norm(heroEl.textContent) : '',
    buy: buy ? norm(buy.textContent) : null,
    terms: terms ? { text: norm(terms.textContent), inDetails: !!terms.closest('details'), visible: terms.getClientRects().length > 0, headings: [...terms.querySelectorAll('h2,h3')].map((h) => norm(h.textContent)) } : null,
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ level: +h.tagName[1], text: norm(h.textContent) })),
    ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, attr: a.getAttribute('href'), text: norm(a.textContent || a.getAttribute('aria-label') || '') })),
    imgNoAlt: [...document.querySelectorAll('img:not([alt])')].map((i) => i.getAttribute('src')),
    landmarks: { header: document.querySelectorAll('header').length, nav: document.querySelectorAll('nav').length, main: document.querySelectorAll('main').length, footer: document.querySelectorAll('footer').length },
    lang: document.documentElement.lang,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    offenders,
    cls: window.__cls ?? 0,
    lcp: window.__lcp ?? 0,
  }
}

const SNAP = {} // SNAP[side][bredde]

/* =====================================================================
   GRUPPE: sider (alle sider x alle bredder) + tekstkontroller
   ===================================================================== */
async function testPages() {
  for (const vp of VIEWPORTS) {
    const page = await newPage(vp)
    for (const p of PAGES) {
      const status = await open(page, p)
      await scrollAll(page)
      const s = await page.evaluate(snapshot)
      s.status = status
      ;(SNAP[p] ??= {})[vp] = s
      ok('AC-50', s.scrollWidth <= s.innerWidth + 1, `${vp}px ${p}: vandret overflow (${s.scrollWidth} > ${s.innerWidth})${s.offenders.length ? ` - ${s.offenders.join(', ')}` : ''}`)
      if (vp === 1440 || vp === 390) {
        ok('AC-66', s.cls <= 0.1, `${vp}px ${p}: CLS ${s.cls.toFixed(3)} (over 0,1)`)
        warn('AC-66', s.cls <= 0.05, `${vp}px ${p}: CLS ${s.cls.toFixed(3)} (over 0,05)`)
      }
      if (vp === 390 && p === '/') {
        warn('AC-69', s.lcp === 0 || s.lcp <= 2500, `390px /: LCP (lab, localhost) ${Math.round(s.lcp)} ms (mål 2500 ms; kun vejledende)`)
        info('AC-69', `lab-LCP ${Math.round(s.lcp)} ms på 390 px; feltdata findes ikke og må ikke lyde som et salgsresultat`)
      }
      ok('AC-38', status === 200, `${vp}px ${p}: HTTP ${status}`)
    }
    await closePage(page)
  }
  analyseText()
  analyseStructure()
  analyseLinks()
}

function analyseText() {
  const allText = (p) => Object.values(SNAP[p] ?? {}).map((s) => s.text).join(' ')
  const t1440 = (p) => SNAP[p]?.[1440]?.text ?? ''

  // Påkrævede strenge pr. side.
  const OFFER = [
    ['"0 kr. i opstart"', /0\s*kr\.?\s*i\s*opstart/i],
    ['"995 kr./md."', A(995)],
    ['"mindst 6 måneder"', /mindst\s+(?:6|seks)\s+(?:abonnements)?måneder/i],
    ['minimumsbetaling "5.970 kr."', A(5970)],
  ]
  const amounts = (...ns) => ns.map((n) => [`${fmt(n)} kr.`, A(n)])
  const REQUIRED = [
    { ac: 'AC-1', pages: ['/', '/priser/'], items: OFFER },
    { ac: 'AC-1', pages: ['/hjemmeside/'], items: [['995 kr.', A(995)], ['5.970 kr.', A(5970)]] },
    { ac: 'AC-2', pages: ['/priser/'], items: [['45 min. SEO/status', /45\s*(?:min|minutter)/i], ['15 min. rettelser', /15\s*(?:min|minutter)/i], ['domæneloft 200 kr.', A(200)], ['1-3 sider', /1\s*[–-]\s*3\s*(?:indholds)?sider|op til\s+(?:3|tre)\s+(?:indholds)?sider/i], ['korrekturrunder', /korrekturrunde/i], ['support på hverdage', /hverdage/i], ['opsigelse/varsel', /varsel|opsig/i]] },
    { ac: 'AC-4', pages: ['/priser/', '/hjemmeside/'], items: amounts(2500, 4000, 5000) },
    { ac: 'AC-5', pages: ['/priser/', '/hjemmeside/'], items: [...amounts(99, 199, 399, 1000), ['15 min. (Plus)', /15\s*(?:min|minutter)/i], ['30 min. (Ekstra)', /30\s*(?:min|minutter)/i]] },
    { ac: 'AC-6', pages: ['/priser/'], items: [['frikøb/overførsel', /frikøb|overførsel/i], ['1.000 kr.', A(1000)]] },
    { ac: 'AC-7', pages: ['/priser/'], items: [...amounts(500, 400), ['bookingudbyder betales direkte', /direkte til (?:udbyderen|bookingudbyderen)|betaler du selv|betales direkte/i]] },
    { ac: 'AC-8', pages: ['/priser/', '/booking-google/'], items: [...amounts(500, 1000, 1500), ['QR-skilt', /qr/i]] },
    { ac: 'AC-9', pages: ['/priser/', '/marketing/'], items: [...amounts(1500, 2500, 4000), ['annoncebudget separat', /annoncebudget|annonce(?:ring)?budget|budget til annoncer/i]] },
    { ac: 'AC-10', pages: ['/priser/'], items: [['"ekskl. moms"', /ekskl\.?\s*moms/i]] },
    { ac: 'AC-11', pages: ['/priser/'], items: [['vilkår', /vilkår/i]] },
    { ac: 'AC-38', pages: ['/systemer/'], items: [['"særskilt" fast tilbud', /særskilt/i], ['modulets status (ikke klar endnu)', MODULE_CONTEXT], ['demo', /demo/i], ['spørg først', /spørg|hvor mange sager/i]] },
    { ac: 'AC-61', pages: ['/marketing/'], items: [['åbenhed om manglende cases', /(?:ingen|endnu ikke|ikke (?:endnu )?nogen|har ikke)[^.]{0,80}(?:cases|resultater|kunder)|(?:cases|resultater)[^.]{0,60}(?:endnu ikke|ingen)|pilot/i]] },
    { ac: 'AC-42', pages: ['/booking-google/'], items: [['"Lokal synlighed"', /lokal synlighed/i]] },
  ]
  if (moduleReady) skip('AC-3', 'systemModule.ready=true: kontrollér manuelt, at modulets pris og vilkår stemmer med det, der faktisk kan leveres')
  for (const { ac, pages, items } of REQUIRED) {
    for (const p of pages) {
      const text = t1440(p)
      if (!text) continue
      for (const [label, re] of items) ok(ac, re.test(text), `${p}: mangler ${label}`)
    }
  }
  // Tilbudslinjen i heroen (forsiden) ved 1440 og 390.
  for (const vp of [1440, 390]) {
    const hero = SNAP['/']?.[vp]?.hero ?? ''
    ok('AC-1', hasAmount(hero, 995) && hasAmount(hero, 5970), `/ ${vp}px: heroen (sektionen med h1) viser ikke både 995 kr./md. og minimum 5.970 kr. (fandt: "${short(hero, 120)}")`)
  }

  // Systemmodul: ingen pris uden "ikke klar" (alle sider, alle bredder).
  if (!moduleReady) {
    for (const p of PAGES) {
      const v = moduleViolations(allText(p))
      ok('AC-3', v.length === 0, `${p}: ${v[0] ?? ''}`)
    }
  }

  // Forbudte strenge.
  for (const p of PAGES) {
    const text = allText(p)
    for (const f of FORBIDDEN) {
      const m = f.re.exec(text)
      ok('AC-59', !m, `${p}: "${m?.[0]}" - ${f.why} (...${m ? around(text, m.index, 50) : ''}...)`)
      if (f.re.source.startsWith('ingen\\s+udtræd') && m) ok('AC-6', false, `${p}: "ingen udtrædelsesomkostninger" står på siden`)
      if (f.re.source.includes('2\\.?700') && m) ok('AC-13', false, `${p}: gammel pris 2.700 kr. står på siden`)
    }
    // "garanti": kun afvisende sammenhæng.
    for (const m of text.matchAll(/garanti\w*/gi)) {
      const before = text.slice(Math.max(0, m.index - 70), m.index)
      const negated = NEGATION.test(before) || /garanti\w*[^.]{0,30}(?:ikke|ingen)/i.test(text.slice(m.index, m.index + 60))
      if (negated) info('AC-60', `${p}: afvisende "garanti": ...${around(text, m.index, 60)}...`)
      else ok('AC-60', false, `${p}: "garanti" uden afvisning: ...${around(text, m.index, 80)}...`)
    }
    for (const re of RISKY) {
      for (const m of text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`))) {
        const ctx = around(text, m.index, 80)
        if (NEGATION.test(text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 20))) continue
        warn('AC-60', false, `${p}: muligt løfte "${m[0]}": ...${ctx}...`)
      }
    }
    // Opdigtede tal/udtalelser (advarsler).
    warn('AC-61', !/[„"“]([^"”]{25,})[”"]\s*[–—-]\s*[A-ZÆØÅ]/.test(text), `${p}: ligner en udtalelse med citat og navn`)
    warn('AC-61', !/\b\d{2,}\s*\+?\s*(tilfredse\s+)?kunder\b/i.test(text), `${p}: ligner et kundetal ("${text.match(/\b\d{2,}\s*\+?\s*(tilfredse\s+)?kunder\b/i)?.[0]}")`)
    if (p !== '/privatlivspolitik/' && !p.startsWith('/demoer/')) {
      const odd = [...new Set(amountsIn(text).filter((n) => !ALLOWED_AMOUNTS.has(n)))]
      warn('AC-13', odd.length === 0, `${p}: beløb uden for den godkendte prisliste (tjek, om de er gamle): ${odd.map(fmt).join(', ')}`)
    }
  }
  // Vi-sprog (jeg-form).
  for (const p of ['/', '/priser/', '/hjemmeside/', '/booking-google/', '/marketing/', '/systemer/']) {
    const text = t1440(p)
    const vi = (text.match(/(?<![\p{L}])(?:vi|vores|os)(?![\p{L}])/giu) ?? []).length
    warn('AC-62', vi === 0, `${p}: ${vi} forekomster af "vi/vores/os" (OviaSpecs er én person: jeg-form)`)
  }

  // Samme købsmåder-priser på forside og /priser/.
  const b1 = SNAP['/']?.[1440]?.buy
  const b2 = SNAP['/priser/']?.[1440]?.buy
  ok('AC-37', b1 !== null && b1 !== undefined, '/: #koebsmaader findes ikke')
  ok('AC-39', b2 !== null && b2 !== undefined, '/priser/: #koebsmaader findes ikke')
  if (b1 && b2) {
    const s1 = [...new Set(amountsIn(b1))].sort((a, b) => a - b).join(',')
    const s2 = [...new Set(amountsIn(b2))].sort((a, b) => a - b).join(',')
    ok('AC-13', s1 === s2, `købsmåder-beløb forskellige: forsiden [${s1}] mod /priser/ [${s2}]`)
    ok('AC-13', hasAmount(b1, 995) && hasAmount(b1, 5970), `#koebsmaader mangler 995 kr. eller 5.970 kr. (fandt [${s1}])`)
  }
  // Samme pakkepris på /hjemmeside/ og /priser/.
  for (const n of [2500, 4000, 5000, 99, 199, 399]) {
    ok('AC-13', hasAmount(t1440('/hjemmeside/'), n) === hasAmount(t1440('/priser/'), n), `${fmt(n)} kr. findes kun på én af /hjemmeside/ og /priser/`)
  }

  // Vilkår som synlig sektion.
  const terms = SNAP['/priser/']?.[1440]?.terms
  ok('AC-11', !!terms, '/priser/: #vilkaar findes ikke')
  if (terms) {
    ok('AC-11', terms.visible && !terms.inDetails, '/priser/: #vilkaar er skjult eller ligger i en <details> (FAQ-agtig)')
    ok('AC-11', /seks|6\s*måneder/i.test(terms.text) && /opsig|varsel/i.test(terms.text) && /domæne/i.test(terms.text) && /moms/i.test(terms.text) && /support|hverdage/i.test(terms.text) && /frikøb|overførsel/i.test(terms.text), `#vilkaar mangler et af: seks måneder, opsigelse, domæne, moms, support/hverdage, frikøb (fandt: ${short(terms.text, 200)})`)
    warn('AC-11', /forskel/i.test(terms.text), '#vilkaar forklarer ikke forskellen på abonnementsvilkår og engangsvilkår (ordet "forskel" mangler)')
    // Skjult binding / overdragelse (AC-12).
    warn('AC-12', /tidligst/i.test(terms.text) && /udgangen|måned (?:seks|6)|sjette/i.test(terms.text), '#vilkaar: opsigelse "tidligst til udgangen af måned seks" er ikke formuleret')
    warn('AC-12', /udlever|filer/i.test(terms.text), '#vilkaar: udlevering af filer efter minimumsperioden mangler')
    warn('AC-12', /brugsret/i.test(terms.text), '#vilkaar: brugsret til hjemmesiden mangler')
    warn('AC-12', /eksport/i.test(terms.text), '#vilkaar: eksport af systemdata mangler')
    warn('AC-12', /backend|licens|flytte/i.test(terms.text), '#vilkaar: forskellen på filudlevering og administreret backend/licenser/flytning mangler')
    ok('AC-12', !/binding|bundet/i.test(terms.text) || /(seks|6)\s*måneder/i.test(terms.text), '#vilkaar nævner binding uden at sige længden')
    ok('AC-6', /frikøb|overførsel/i.test(terms.text) && /dæk|omfatter|indeholder|inkluderer|betaler for|til gengæld/i.test(around(terms.text, terms.text.search(/frikøb|overførsel/i), 300)), '#vilkaar: frikøb/overførsel 1.000 kr. er ikke forklaret (hvad dækker beløbet?)')
  }
  // Frikøbsbeløbet står ved ordet frikøb/overførsel.
  {
    const text = t1440('/priser/')
    const i = text.search(/frikøb|overførsel/i)
    ok('AC-6', i >= 0 && hasAmount(around(text, i, 250), 1000), '/priser/: 1.000 kr. står ikke ved frikøb/overførsel')
  }
  // Moms, CVR, adresse.
  for (const p of ['/', '/priser/']) {
    const text = t1440(p)
    ok('AC-10', companyCvr || !/CVR[\s:.-]{0,6}\d{8}/i.test(text), `${p}: CVR-nummer vist, men company.cvr er ikke udfyldt`)
    ok('AC-43', companyAddress || !/(?:vej|gade|allé|plads|boulevard)\s+\d+/i.test(text), `${p}: ligner en opdigtet adresse`)
  }
  ok('AC-10', /ekskl\.?\s*moms/i.test(t1440('/')) || /ekskl\.?\s*moms/i.test(t1440('/priser/')), 'ingen moms-note på forside eller /priser/')
}

function analyseStructure() {
  for (const p of PAGES) {
    for (const vp of VIEWPORTS) {
      const s = SNAP[p]?.[vp]
      if (!s) continue
      if (vp === 1440 || vp === 390) {
        ok('AC-49', s.landmarks.main === 1 && s.landmarks.header >= 1 && s.landmarks.nav >= 1 && s.landmarks.footer >= 1, `${p} ${vp}px: landemærker ${JSON.stringify(s.landmarks)} (kræver ét main, header, nav, footer)`)
        ok('AC-49', s.headings.filter((h) => h.level === 1).length === 1, `${p} ${vp}px: ${s.headings.filter((h) => h.level === 1).length} h1 (kræver 1)`)
        ok('AC-49', s.imgNoAlt.length === 0, `${p} ${vp}px: billeder uden alt: ${s.imgNoAlt.slice(0, 3).join(', ')}`)
        ok('AC-49', s.lang === 'da', `${p}: lang="${s.lang}"`)
        let prev = 1
        for (const h of s.headings) {
          warn('AC-49', h.level <= prev + 1, `${p} ${vp}px: overskriftsniveau springer fra h${prev} til h${h.level} ("${short(h.text, 40)}")`)
          prev = h.level
        }
      }
    }
  }
  // /systemer/ findes og har indhold.
  const sys = SNAP['/systemer/']?.[1440]
  ok('AC-38', !!sys && sys.text.length > 800, `/systemer/ har næsten intet indhold (${sys?.text.length ?? 0} tegn)`)
  ok('AC-38', !!sys && sys.ids.includes('demo'), '/systemer/: #demo (arbejdsgangsdemoen) findes ikke')
  // Lokal synlighed i overskrift.
  const bg = SNAP['/booking-google/']?.[1440]
  ok('AC-42', !!bg && /lokal synlighed/i.test(bg.headings.find((h) => h.level === 1)?.text ?? ''), `/booking-google/: h1 er "${bg?.headings.find((h) => h.level === 1)?.text}" (skal indeholde "Lokal synlighed")`)
  // Demoer mærket.
  for (const p of ['/demoer/', '/demoer/cafe/', '/demoer/restaurant/', '/demoer/salon/', '/demoer/vinbar/']) {
    const t = SNAP[p]?.[1440]?.text ?? ''
    ok('AC-40', /demo|koncept/i.test(t), `${p}: ikke mærket som demo/koncept`)
    ok('AC-40', /ikke en kundeopgave|ikke et færdigt|ikke produktionsklar|eksempel|koncept|opfundet|fiktiv/i.test(t), `${p}: begrænsning ikke tydelig (ikke en kundeopgave / ikke et færdigt system)`)
  }
  const sysText = sys?.text ?? ''
  ok('AC-40', /demo[^.]{0,40}ikke (?:et )?(?:færdigt|produktionsklart)|ikke (?:et )?(?:færdigt|produktionsklart)[^.]{0,40}demo/i.test(sysText), '/systemer/: arbejdsgangsdemoen er ikke mærket "Demo, ikke et færdigt system"')
  // Kontaktoplysninger.
  const links = SNAP['/']?.[1440]?.links ?? []
  const tels = links.filter((l) => l.attr?.startsWith('tel:'))
  const mails = links.filter((l) => l.attr?.startsWith('mailto:'))
  ok('AC-43', tels.length >= 1 && tels.every((l) => l.attr === CONTACT.tel), `/: tel-links ${[...new Set(tels.map((l) => l.attr))].join(', ') || 'mangler'} (skal være ${CONTACT.tel})`)
  ok('AC-43', mails.length >= 1 && mails.every((l) => l.attr.startsWith(`mailto:${CONTACT.mail}`)), `/: mailto-links ${[...new Set(mails.map((l) => l.attr))].join(', ') || 'mangler'} (skal være ${CONTACT.mail})`)
  ok('AC-43', (SNAP['/']?.[1440]?.text ?? '').includes(CONTACT.phone), `/: telefonnummeret "${CONTACT.phone}" står ikke som tekst`)
  ok('AC-36', tels.some((l) => /ring/i.test(l.text)), '/: ingen "Ring"-link (tel:)')
  ok('AC-36', links.some((l) => /se din pris|se priser|se pris/i.test(l.text)), '/: "Se din pris"/"Se priser" mangler')
}

function analyseLinks() {
  const seen = new Map() // sti -> [side]
  const hashes = []
  for (const p of PAGES) {
    for (const l of SNAP[p]?.[1440]?.links ?? []) {
      let u
      try {
        u = new URL(l.href)
      } catch {
        continue
      }
      if (u.host !== SITE_HOST || /^(mailto|tel|sms):/.test(l.attr ?? '')) continue
      const key = u.pathname
      if (!seen.has(key)) seen.set(key, p)
      if (u.hash) hashes.push({ from: p, path: u.pathname, hash: u.hash.slice(1) })
      for (const old of LEGACY) ok('AC-41', u.pathname !== old, `${p}: linker til omdirigeret adresse ${old} ("${short(l.text, 30)}")`)
    }
  }
  for (const h of hashes) {
    if (!SNAP[h.path]) continue
    ok('AC-41', SNAP[h.path][1440].ids.includes(h.hash), `${h.from}: link til ${h.path}#${h.hash}, men siden har intet element med id="${h.hash}"`)
  }
  linkTargets.push(...seen.entries())
}
const linkTargets = []

/* =====================================================================
   GRUPPE: nav
   ===================================================================== */
async function findButton(page, re, scope = 'header') {
  const h = await page.evaluateHandle(
    (src, flags, scope) => {
      const re = new RegExp(src, flags)
      const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
      return [...document.querySelectorAll(`${scope} button, ${scope} [role=button]`)].find((b) => vis(b) && re.test(b.textContent.replace(/\s+/g, ' ').trim())) ?? null
    },
    re.source,
    re.flags,
    scope,
  )
  return h.asElement()
}
const expanded = (btn) => btn.evaluate((b) => b.getAttribute('aria-expanded'))
/** De synlige links i det område, knappen styrer (aria-controls), ellers i knappens nabolag. */
const regionLinks = (btn) =>
  btn.evaluate((b) => {
    const region = (b.getAttribute('aria-controls') && document.getElementById(b.getAttribute('aria-controls'))) || b.parentElement
    const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && +getComputedStyle(el).opacity > 0
    return [...region.querySelectorAll('a[href]')].filter(vis).map((a) => ({ text: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') }))
  })
const samePath = (href, p) => {
  const clean = (x) => x.replace(/^https?:\/\/[^/]+/, '').replace(/\/+(?=#|$)/, '') || '/'
  return clean(href) === clean(p)
}

async function testNav() {
  // Desktop.
  const page = await newPage(1440)
  await open(page, '/')
  const btn = await findButton(page, NAV.disclosure)
  ok('AC-33', !!btn, 'desktop: knappen "Løsninger" (header button) findes ikke - Løsninger skal være en disclosure-knap, ikke et link')
  ok('AC-34', !!btn, 'desktop: knappen "Løsninger" findes ikke')
  if (btn) {
    ok('AC-34', (await expanded(btn)) === 'false', `"Løsninger": aria-expanded er "${await expanded(btn)}" før åbning (skal være "false")`)
    await btn.focus()
    await page.keyboard.press('Enter')
    await wait(300)
    ok('AC-34', (await expanded(btn)) === 'true', 'Enter åbner ikke "Løsninger" (aria-expanded=true)')
    const links = await regionLinks(btn)
    for (const [label, href] of NAV.solutions) {
      const l = links.find((x) => x.text.toLowerCase().startsWith(label.toLowerCase()))
      ok('AC-33', !!l && samePath(l.href, href), `Løsninger-menuen mangler "${label}" -> ${href} (fandt: ${links.map((x) => `${x.text}->${x.href}`).join(' | ') || 'ingen synlige links'})`)
    }
    ok('AC-33', links.length === NAV.solutions.length, `Løsninger-menuen har ${links.length} punkter (skal være ${NAV.solutions.length})`)
    // Tab ind i menuen, Escape lukker og fokus går tilbage til knappen.
    await page.keyboard.press('Tab')
    await wait(150)
    const insideBefore = await page.evaluate(() => document.activeElement?.tagName === 'A')
    await page.keyboard.press('Escape')
    await wait(300)
    ok('AC-34', (await expanded(btn)) === 'false', 'Escape lukker ikke "Løsninger"')
    ok('AC-34', await page.evaluate(() => document.activeElement?.tagName === 'BUTTON' && /l(ø|o)sninger/i.test(document.activeElement.textContent)), `fokus kom ikke tilbage til "Løsninger"-knappen efter Escape${insideBefore ? '' : ' (fokus var ikke flyttet ind i menuen med Tab)'}`)
    // Mellemrum åbner, klik udenfor lukker.
    await btn.focus()
    await page.keyboard.press('Space')
    await wait(300)
    ok('AC-34', (await expanded(btn)) === 'true', 'Mellemrum åbner ikke "Løsninger"')
    await page.mouse.click(40, 700)
    await wait(300)
    ok('AC-34', (await expanded(btn)) === 'false', 'klik udenfor lukker ikke "Løsninger"')
    // Klik åbner og lukker (ikke kun hover).
    await btn.click()
    await wait(300)
    const afterClick = await expanded(btn)
    await page.mouse.move(700, 600)
    await wait(300)
    ok('AC-34', afterClick === 'true' && (await expanded(btn)) === 'true', 'Løsninger åbner ikke ved klik, eller lukker, når musen flyttes væk (skal være en klik-disclosure)')
    await btn.click()
    await wait(300)
    ok('AC-34', (await expanded(btn)) === 'false', 'andet klik lukker ikke "Løsninger"')
    // Lukket menu: punkterne må ikke kunne nås med Tab (usynlige tab-stop).
    const hiddenStops = await page.evaluate(() => {
      const b = [...document.querySelectorAll('header button')].find((x) => /l(ø|o)sninger/i.test(x.textContent))
      const region = (b?.getAttribute('aria-controls') && document.getElementById(b.getAttribute('aria-controls'))) || b?.parentElement
      return [...(region?.querySelectorAll('a[href]') ?? [])].filter((a) => a.getClientRects().length === 0 || getComputedStyle(a).visibility === 'hidden').filter((a) => a.tabIndex >= 0 && !a.closest('[hidden],[inert],[style*="display: none"]')).length
    })
    warn('AC-34', hiddenStops === 0, `lukket Løsninger-menu har ${hiddenStops} skjulte men fokuserbare links`)
  }
  // Øvrige punkter og knapper i headeren.
  const top = await page.evaluate(() => [...document.querySelectorAll('header a[href]')].filter((a) => a.getClientRects().length > 0).map((a) => ({ text: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') })))
  for (const [label, href] of NAV.top) {
    const l = top.find((x) => x.text.toLowerCase().startsWith(label.toLowerCase()))
    ok('AC-33', !!l && samePath(l.href, href), `headeren mangler "${label}" -> ${href} (fandt: ${top.map((x) => `${x.text}->${x.href}`).join(' | ')})`)
  }
  ok('AC-36', top.some((x) => x.href === CONTACT.tel), 'headeren mangler "Ring" (tel:)')
  ok('AC-36', top.some((x) => /se din pris|se priser|se pris/i.test(x.text)), 'headeren mangler "Se din pris"')
  ok('AC-33', !top.some((x) => /^(booking & google|hjemmeside)$/i.test(x.text)), 'headeren har stadig de gamle top-punkter "Hjemmeside"/"Booking & Google" ved siden af Løsninger')
  await closePage(page)

  // Mobil.
  for (const vp of [360, 390]) {
    const m = await newPage(vp)
    await open(m, '/')
    const mb = await findButton(m, NAV.menuButton)
    ok('AC-35', !!mb, `${vp}px: menuknappen "Menu" findes ikke`)
    if (mb) {
      ok('AC-35', (await expanded(mb)) === 'false', `${vp}px: menuknappens aria-expanded er "${await expanded(mb)}" før åbning`)
      await mb.click()
      await wait(450)
      ok('AC-35', (await expanded(mb)) === 'true', `${vp}px: Menu åbner ikke`)
      const menu = await m.evaluate(() => {
        const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
        const links = [...document.querySelectorAll('a[href]')].filter((a) => vis(a) && a.getBoundingClientRect().top >= 0).map((a) => ({ text: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') }))
        const headingEl = [...document.querySelectorAll('h1,h2,h3,h4,p,span,li,div')].find((e) => vis(e) && e.children.length === 0 && /^l(ø|o)sninger$/i.test(e.textContent.trim()))
        return { links, heading: !!headingEl, sw: document.documentElement.scrollWidth, iw: innerWidth }
      })
      for (const [label, href] of NAV.solutions) {
        const l = menu.links.find((x) => x.text.toLowerCase().startsWith(label.toLowerCase()))
        ok('AC-35', !!l && samePath(l.href, href), `${vp}px: mobilmenuen mangler "${label}" -> ${href}`)
      }
      ok('AC-35', menu.heading, `${vp}px: mobilmenuen har ingen overskrift "Løsninger" over de fire punkter`)
      ok('AC-35', menu.sw <= menu.iw + 1, `${vp}px: åben mobilmenu giver vandret overflow`)
      await m.keyboard.press('Escape')
      await wait(450)
      ok('AC-35', (await expanded(mb)) === 'false', `${vp}px: Escape lukker ikke mobilmenuen`)
      await mb.click()
      await wait(450)
      const closeBtn = (await findButton(m, /^(luk|lukke)/i)) ?? mb
      await closeBtn.click()
      await wait(450)
      ok('AC-35', (await expanded(mb)) === 'false', `${vp}px: menuen lukker ikke igen ved klik på knappen`)
    }
    await closePage(m)
  }
}

/* =====================================================================
   GRUPPE: sektionsrækkefølge (forside og /priser/)
   ===================================================================== */
async function sectionTops(page, specs) {
  return page.evaluate((specs) => {
    const top = (el) => el.getBoundingClientRect().top + window.scrollY
    return specs.map((s) => {
      let el = null
      let by = null
      for (const sel of s.sel) {
        el = document.querySelector(sel)
        if (el) {
          by = sel
          break
        }
      }
      if (!el && s.heading) {
        const re = new RegExp(s.heading, 'i')
        el = [...document.querySelectorAll('h1,h2')].find((h) => re.test(h.textContent))
        if (el) by = `overskrift "${el.textContent.trim().slice(0, 30)}"`
      }
      return { name: s.name, top: el ? Math.round(top(el)) : null, by, optional: !!s.optional }
    })
  }, specs)
}
async function testSections() {
  for (const vp of [1440, 390]) {
    const page = await newPage(vp)
    await open(page, '/')
    await scrollAll(page)
    const tops = await sectionTops(page, HOME_SECTIONS)
    const missing = tops.filter((t) => t.top === null)
    ok('AC-37', missing.length === 0, `/ ${vp}px: sektioner ikke fundet: ${missing.map((m) => m.name).join(', ')} (justér HOME_SECTIONS øverst i scriptet, hvis de findes under andre id'er)`)
    const found = tops.filter((t) => t.top !== null)
    for (let i = 1; i < found.length; i++) ok('AC-37', found[i].top >= found[i - 1].top, `/ ${vp}px: "${found[i].name}" (y=${found[i].top}) ligger før "${found[i - 1].name}" (y=${found[i - 1].top})`)
    info('AC-37', `${vp}px: ${tops.map((t) => `${t.name}@${t.top}`).join(' > ')}`)
    // Beregneren må ikke ligge i heroen.
    const inHero = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      const sec = h1?.closest('section') ?? h1?.parentElement?.parentElement
      return !!sec && !!document.querySelector('#beregner') && sec.contains(document.querySelector('#beregner'))
    })
    ok('AC-37', !inHero, `/ ${vp}px: beregneren ligger inde i heroen`)
    // Tre problemer og fem trin (kontrakt): vises som lister.
    await open(page, '/priser/')
    await scrollAll(page)
    const pt = await sectionTops(page, PRICE_SECTIONS)
    const pm = pt.filter((t) => t.top === null && !t.optional)
    ok('AC-39', pm.length === 0, `/priser/ ${vp}px: sektioner ikke fundet: ${pm.map((m) => m.name).join(', ')}`)
    const pf = pt.filter((t) => t.top !== null)
    for (let i = 1; i < pf.length; i++) ok('AC-39', pf[i].top >= pf[i - 1].top, `/priser/ ${vp}px: "${pf[i].name}" (y=${pf[i].top}) ligger før "${pf[i - 1].name}" (y=${pf[i - 1].top})`)
    for (const t of pt.filter((t) => t.top === null && t.optional)) warn('AC-39', false, `/priser/ ${vp}px: "${t.name}" ikke fundet (valgfri; justér PRICE_SECTIONS)`)
    await closePage(page)
  }
}

/* =====================================================================
   GRUPPE: beregner
   ===================================================================== */
async function testCalculator() {
  const page = await newPage(1440)
  await open(page, '/')
  // Første trin: de to købsmåder før tilvalg.
  const first = await calcText(page)
  const iLokal = first.search(CALC.modeLokal)
  const iKoeb = first.search(CALC.modeKoeb)
  ok('AC-14', iLokal >= 0 && iKoeb >= 0, `beregnerens første visning har ikke både "Løbende samarbejde" og "Køb hjemmesiden" (fandt: "${short(first, 160)}")`)
  const iAdd = first.search(CALC.addons)
  ok('AC-14', iLokal < 0 || iKoeb < 0 || iAdd < 0 || (iLokal < iAdd && iKoeb < iAdd), 'tilvalg (Lokal synlighed/Booking & Google/Marketing) står før de to købsmåder i beregneren')
  const radios = await page.evaluate(
    (root, a, b) => {
      const lab = (re) => [...document.querySelectorAll(`${root} label`)].find((l) => new RegExp(re, 'i').test(l.textContent))
      const ia = lab(a)?.querySelector('input') ?? document.getElementById(lab(a)?.htmlFor ?? '')
      const ib = lab(b)?.querySelector('input') ?? document.getElementById(lab(b)?.htmlFor ?? '')
      return { a: ia ? { type: ia.type, name: ia.name } : null, b: ib ? { type: ib.type, name: ib.name } : null }
    },
    CALC.root,
    CALC.modeLokal.source,
    CALC.modeKoeb.source,
  )
  ok('AC-14', !!radios.a && !!radios.b && radios.a.type === 'radio' && radios.b.type === 'radio' && radios.a.name === radios.b.name, `købsmåderne er ikke radioknapper i samme gruppe (gensidigt udelukkende): ${JSON.stringify(radios)}`)
  // Vælg Lokal, så Køb: kun ét valgt ad gangen.
  if (await clickText(page, CALC.modeLokal, { scope: CALC.root, sel: 'label' })) {
    await clickText(page, CALC.modeKoeb, { scope: CALC.root, sel: 'label' })
    const checked = await page.evaluate((root) => [...document.querySelectorAll(`${root} input:checked`)].map((i) => `${i.name}=${i.value}`), CALC.root)
    ok('AC-14', checked.length <= 1 || new Set(checked.map((c) => c.split('=')[0])).size === checked.length, `begge købsmåder valgt samtidig: ${checked.join(', ')}`)
  }

  // Lokal-flow til resultatet.
  for (const vp of [1440, 360]) {
    const p = vp === 1440 ? page : await newPage(vp)
    await open(p, '/')
    const clicked = await clickText(p, CALC.modeLokal, { scope: CALC.root, sel: 'label' })
    ok('AC-18', clicked, `${vp}px: kan ikke vælge "Løbende samarbejde"`)
    const reached = clicked ? await advance(p) : false
    ok('AC-18', reached, `${vp}px: nåede ikke resultatet med kontaktfeltet efter at have valgt Lokal (sidste tekst: "${short(await calcText(p), 160)}")`)
    if (reached) {
      const t = await calcText(p)
      const iContact = t.search(CALC.contactLabel)
      const checks = [
        ['opstart 0 kr.', t.search(/0\s*kr\.?[^.]{0,30}opstart|opstart[^.]{0,30}0\s*kr/i)],
        ['995 kr./md.', t.search(A(995))],
        ['minimumsperiode (mindst 6 måneder)', t.search(/(?:mindst|minimum)[^.]{0,25}(?:6|seks)\s+(?:abonnements)?måneder|minimumsperiode/i)],
        ['minimumsbetaling 5.970 kr.', t.search(A(5970))],
        ['eksterne udgifter', t.search(/eksterne|særskilt|betales direkte|ikke med/i)],
        ['overdragelse/udlevering', t.search(/overdrag|udlever|filerne|brugsret|efter (?:de )?(?:6|seks) måneder/i)],
      ]
      ok('AC-18', iContact > 0, `${vp}px: finder ikke kontaktfeltets label i resultatet`)
      for (const [label, i] of checks) {
        ok('AC-18', i >= 0 && (iContact < 0 || i < iContact), `${vp}px: Lokal-resultatet ${i < 0 ? 'mangler' : 'viser først efter kontaktfeltet'}: ${label}`)
      }
      const price = head(await p.evaluate((sel) => document.querySelector(sel)?.innerText.replace(/\s+/g, ' ') ?? '', CALC.pricePanel))
      if (price) {
        ok('AC-15', hasAmount(price, 995) && !hasAmount(price, 2500) && !hasAmount(price, 4000) && !hasAmount(price, 5000) && !hasAmount(price, 99) && !hasAmount(price, 199) && !hasAmount(price, 399), `${vp}px: Lokal-prisen blandes med engangspris eller drift (dobbeltbetaling): "${short(price, 200)}"`)
        ok('AC-3', moduleReady || moduleViolations(price).length === 0, `${vp}px: Lokal-resultatet sælger systemmodulet: ${moduleViolations(price)[0]}`)
      } else {
        skip('AC-15', `${vp}px: ${CALC.pricePanel} findes ikke i Lokal-resultatet (data-tour-målet skal bevares); dobbeltbetaling kontrolleres manuelt`)
      }
      ok('AC-51', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${vp}px: Lokal-resultatet giver vandret overflow`)
      ok('AC-3', moduleReady || moduleViolations(t).length === 0, `${vp}px: Lokal-resultatet nævner modulpris: ${moduleViolations(t)[0]}`)
    }
    if (vp !== 1440) await closePage(p)
  }

  // Køb hjemmesiden-flow (kun at resultatet findes og ikke blander Lokal ind).
  await open(page, '/')
  if (await clickText(page, CALC.modeKoeb, { scope: CALC.root, sel: 'label' })) {
    const reached = await advance(page)
    const price = head(await page.evaluate((sel) => document.querySelector(sel)?.innerText.replace(/\s+/g, ' ') ?? '', CALC.pricePanel))
    ok('AC-15', reached, `"Køb hjemmesiden" nåede ikke resultatet (sidste tekst: "${short(await calcText(page), 160)}")`)
    if (price) ok('AC-15', !hasAmount(price, 995) && !hasAmount(price, 5970), `"Køb hjemmesiden"-resultatet viser Lokal-abonnementet (dobbeltbetaling): "${short(price, 200)}"`)
  }

  // Gamle links.
  const orderCheck = []
  for (const { q, once, monthly } of OLD_LINKS) {
    for (const base of ['/', '/priser/']) {
      await open(page, `${base}?${q}`)
      const t = await calcText(page)
      const price = head(await page.evaluate((sel) => document.querySelector(sel)?.innerText.replace(/\s+/g, ' ') ?? '', CALC.pricePanel))
      const scope = price || t
      const id = `${base}?${q}`
      ok('AC-16', hasAmount(scope, once), `gammelt link ${id}: engangsprisen ${fmt(once)} kr. vises ikke (fandt: "${short(scope, 180)}")`)
      ok('AC-16', monthly === 0 ? !/\/\s*md/.test(price || '') : hasAmount(scope, monthly), `gammelt link ${id}: driften ${monthly ? fmt(monthly) + ' kr./md.' : '(ingen månedlig betaling)'} vises ikke korrekt`)
      ok('AC-16', !hasAmount(scope, 995), `gammelt link ${id}: viser Lokal-abonnementet i stedet for engangskøb`)
      ok('AC-19', (await search(page)).includes('ydelser=hjemmeside'), `gammelt link ${id}: adresselinjen mistede valgene (${await search(page)})`)
      orderCheck.push(id)
    }
  }
  info('AC-16', `${orderCheck.length} gamle links kontrolleret (forside og /priser/)`)

  // Genindlæsning og delt link.
  await open(page, `/${'?' + OLD_LINKS[1].q}`)
  const before = await calcText(page)
  await page.reload({ waitUntil: 'networkidle0' })
  await wait(500)
  ok('AC-19', (await calcText(page)) === before && (await search(page)).includes('trin=4'), 'genindlæsning på resultatet ændrede siden')
  const fresh = await newPage(390)
  await open(fresh, `/?${OLD_LINKS[1].q}`)
  ok('AC-19', hasAmount(await calcText(fresh), 4000) && hasAmount(await calcText(fresh), 199), 'delt link giver ikke samme pris i en frisk browser')
  await closePage(fresh)

  // Samme pris på skærm, afsendt link og genberegning. Intet sendes rigtigt (mock).
  mock.status = 200
  mock.body = { ok: true }
  for (const { q, once, monthly } of OLD_LINKS.slice(0, 4)) {
    await open(page, `/?${q}`)
    posts.length = 0
    await page.type(FORM.contact, 'qa-test@example.com')
    await submitForm(page)
    await wait(300)
    const sent = posts.at(-1)
    ok('AC-17', !!sent, `link ${q}: ingen henvendelse nåede efterligningen`)
    if (sent) {
      const u = new URL(sent.link ?? '/', SITE)
      const orig = new URLSearchParams(q)
      for (const k of ['ydelser', 'sider', 'bestilling', 'drift']) ok('AC-17', u.searchParams.get(k) === orig.get(k), `link ${q}: payload-link har ${k}=${u.searchParams.get(k)} (skal være ${orig.get(k)})`)
      ok('AC-19', !/qa-test|example\.com|@/.test(sent.link ?? '') && !/qa-test|example/.test(await search(page)), `link ${q}: kontaktoplysninger ligger i linket eller adressen`)
      if (calc?.quote && calc?.parse) {
        try {
          const total = calc.quote(calc.parse(u.search)).total
          ok('AC-17', total.once === once && total.monthly === monthly, `link ${q}: genberegning (calculator.js) giver ${total.once}/${total.monthly}, håndregnet ${once}/${monthly}`)
        } catch (e) {
          info('AC-17', `genberegning mislykkedes for ${q}: ${e.message}`)
        }
      }
    }
  }
  await closePage(page)
}

/* =====================================================================
   GRUPPE: guide
   ===================================================================== */
const guideState = (page) =>
  page.evaluate(
    (root, resultSrc, skipSrc) => {
      const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && +getComputedStyle(el).opacity > 0
      const r = document.querySelector(root) ?? document.body
      const norm = (s) => s.replace(/\s+/g, ' ').trim()
      const inputs = [...r.querySelectorAll('input[type=radio],input[type=checkbox]')].filter((i) => !i.closest('.send-trap') && (vis(i) || (i.closest('label') && vis(i.closest('label')))))
      const options = inputs.map((i) => norm(i.closest('label')?.textContent ?? i.getAttribute('aria-label') ?? i.value))
      const buttons = [...r.querySelectorAll('button,a[href],[role=button]')].filter(vis).map((b) => norm(b.textContent))
      const text = norm(r.innerText)
      const isResult = !!r.querySelector('[data-tour="price"]') || !!r.querySelector('input[name=contact]') || new RegExp(resultSrc, 'i').test(text)
      return { options, buttons, text, isResult, skip: buttons.some((b) => new RegExp(skipSrc, 'i').test(b)), legend: norm(r.querySelector('fieldset legend, h2, h3')?.textContent ?? ''), search: location.search }
    },
    CALC.root,
    CALC.guideResult.source,
    CALC.skip.source,
  )

async function startGuide(page) {
  await open(page, '/')
  return clickText(page, CALC.guideEntry, { scope: 'main' })
}
/** Spiller en sti (indeks pr. spørgsmål) igennem og returnerer tilstanden bagefter. */
async function replay(page, pathIdx) {
  if (!(await startGuide(page))) return { error: 'guide-indgangen "Hjælp mig med at vælge" findes ikke' }
  for (const idx of pathIdx) {
    const st = await guideState(page)
    if (st.isResult || !st.options.length) return { error: 'sti ikke mulig' }
    const labelText = st.options[idx]
    const ok2 = await page.evaluate(
      (root, i) => {
        const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
        const inputs = [...document.querySelectorAll(`${root} input[type=radio],${root} input[type=checkbox]`)].filter((x) => !x.closest('.send-trap') && (vis(x) || (x.closest('label') && vis(x.closest('label')))))
        const el = inputs[i]
        if (!el) return false
        ;(el.closest('label') ?? el).scrollIntoView({ block: 'center' })
        ;(el.closest('label') ?? el).click()
        return true
      },
      CALC.root,
      idx,
    )
    if (!ok2) return { error: `kunne ikke vælge "${labelText}"` }
    await wait(300)
    const beforeText = (await guideState(page)).text
    await clickText(page, CALC.next, { scope: CALC.root, sel: 'button, a[href], [role=button]' })
    // Vent til visningen har skiftet (næste spørgsmål eller resultat), højst 2,5 s.
    for (let i = 0; i < 10; i++) {
      await wait(250)
      if ((await guideState(page)).text !== beforeText) break
    }
    await wait(250)
  }
  // Vent på, at visningen er faldet til ro (indgangsanimationer): enten valg eller et resultat.
  let st = await guideState(page)
  for (let i = 0; i < 8 && !st.isResult && !st.options.length; i++) {
    await wait(250)
    st = await guideState(page)
  }
  return st
}

async function testGuide() {
  const page = await newPage(1440)
  await open(page, '/')
  const s0 = await search(page)
  ok('AC-26', !/hjaelp/.test(s0), 'guiden er åben fra start (hjaelp i adresselinjen)')
  const entryVisible = await page.evaluate((src) => [...document.querySelectorAll('button,a[href],[role=button],summary')].some((b) => new RegExp(src, 'i').test(b.textContent) && b.getClientRects().length > 0), CALC.guideEntry.source)
  ok('AC-26', entryVisible, 'indgangen "Hjælp mig med at vælge" er ikke synlig på forsiden')

  // Udforsk alle grene (dybde-først). Hver node genafspilles fra forsiden.
  const leaves = []
  const questionsSeen = []
  let nodes = 0
  let aborted = false
  async function walk(pathIdx, labels) {
    if (nodes++ > MAX_GUIDE_NODES) {
      aborted = true
      return
    }
    const st = await replay(page, pathIdx)
    if (st.error) {
      // Kan skyldes, at en gren ender tidligere end ved første gennemløb (flimmer), så kun en advarsel.
      warn('AC-20', false, `guide-sti [${labels.join(' > ')}]: kunne ikke genafspilles (${st.error})`)
      return
    }
    const questionNo = pathIdx.length + 1
    if (!st.isResult && st.options.length) {
      questionsSeen.push({ no: questionNo, legend: st.legend, options: st.options, path: labels.join(' > ') })
      ok('AC-20', questionNo <= MAX_GUIDE_QUESTIONS, `guide-sti [${labels.join(' > ')}]: spørgsmål nr. ${questionNo} (højst ${MAX_GUIDE_QUESTIONS}): "${short(st.legend, 60)}"`)
      ok('AC-21', st.skip, `guide-sti [${labels.join(' > ') || 'start'}]: spørgsmål ${questionNo} ("${short(st.legend, 50)}") har ingen synlig "Spring over"`)
      if (questionNo > MAX_GUIDE_QUESTIONS) return
      for (let i = 0; i < st.options.length; i++) await walk([...pathIdx, i], [...labels, st.options[i]])
    } else {
      leaves.push({ labels, text: st.text, buttons: st.buttons })
    }
  }
  const started = await startGuide(page)
  ok('AC-20', started, 'guiden kan ikke åbnes via "Hjælp mig med at vælge"')
  if (started) {
    await walk([], [])
    if (aborted) info('AC-20', `udforskningen stoppede efter ${MAX_GUIDE_NODES} noder (hæv MAX_GUIDE_NODES, hvis flere grene)`)
    info('AC-20', `${leaves.length} resultater og ${questionsSeen.length} spørgsmålsvisninger gennemgået`)
    for (const q of questionsSeen.slice(0, 40)) info('AC-20', `spørgsmål ${q.no} ("${short(q.legend, 60)}") efter [${q.path || 'start'}]: ${q.options.map((o) => short(o, 30)).join(' | ')}`)
  }
  const wantsBooking = (L) => /booking|tidsbestilling|tid\s*online/i.test(L) && !/(nej|ikke|uden|ingen)[^,.]{0,25}(booking|tidsbestilling)/i.test(L)
  for (const lf of leaves) {
    const L = lf.labels.join(' | ')
    const id = `[${lf.labels.map((l) => short(l, 28)).join(' > ')}]`
    ok('AC-25', moduleReady || moduleViolations(lf.text).length === 0, `guide ${id}: sælger systemmodulet: ${moduleViolations(lf.text)[0]}`)
    ok('AC-25', !(moduleReady === false && /(?<![\d.,])1\.?495/.test(lf.text)), `guide ${id}: viser 1.495 kr./md.`)
    ok('AC-3', moduleReady || moduleViolations(lf.text).length === 0, `guide ${id}: modulpris uden "ikke klar"`)
    if (/qr/i.test(L) && !wantsBooking(L)) {
      ok('AC-23', !hasAmount(lf.text, 1500) && !/fuld fart/i.test(lf.text.slice(0, 600)), `guide ${id}: QR uden booking giver alligevel 1.500 kr./Booking & Google Fuld fart (tvinger booking med)`)
      ok('AC-23', hasAmount(lf.text, 1000) || hasAmount(lf.text, 500) || /1\.000|500/.test(lf.text), `guide ${id}: QR uden booking viser hverken 1.000 kr. (Google + QR) eller 500 kr.`)
    }
    if (/google/i.test(L) && !/qr/i.test(L) && !wantsBooking(L) && !/hjemmeside/i.test(L)) {
      warn('AC-22', !hasAmount(lf.text, 1500) && !hasAmount(lf.text, 1000), `guide ${id}: Google alene giver 1.000/1.500 kr. i stedet for engangsopgaven (500 kr.)`)
    }
    if (/booking/i.test(L) && wantsBooking(L)) {
      warn('AC-24', /integr|eksisterende|dit system|din kalender/i.test(lf.text) && !/ny kalender|nyt bookingsystem/i.test(lf.text), `guide ${id}: booking omtales ikke som integration af eksisterende system`)
    }
    ok('AC-26', /kr\b|ring|snak|kontakt/i.test(lf.text), `guide ${id}: resultat uden pris eller kontakt (tom visning?): "${short(lf.text, 200)}"`)
  }
  skip('AC-22', 'ordlyden i guidens svar er ikke kendt på forhånd: kør grenen "Google-profil alene" manuelt og kontrollér, at resultatet er en engangsopgave (Booking & Google Start, 500 kr.)')
  skip('AC-24', 'kontrollér manuelt, at "booking" giver integration af et eksisterende system og ikke en ny kalender')

  // Spring over fører til beregneren, uden at noget går tabt.
  if (await startGuide(page)) {
    const clicked = await clickText(page, CALC.skip, { scope: 'main' })
    ok('AC-21', clicked, '"Spring over" kan ikke klikkes')
    if (clicked) {
      await wait(400)
      const st = await calcText(page)
      ok('AC-21', CALC.modeLokal.test(st) || CALC.modeKoeb.test(st) || /trin/i.test(st), `efter "Spring over" er beregneren ikke fremme (fandt: "${short(st, 140)}")`)
      ok('AC-21', !/hjaelp/.test(await search(page)), 'adresselinjen har stadig hjaelp=… efter "Spring over"')
    }
  }
  // Ingen automatisk invitation, mens guiden bruges.
  if (await startGuide(page)) {
    await wait(8500)
    const popups = await visibleHelp(page)
    ok('AC-47', popups.length === 0, `mens guiden bruges åbner hjælp af sig selv: ${popups.join(' | ')}`)
    const st = await guideState(page)
    ok('AC-47', st.options.length > 0 || st.isResult, 'guiden blev afbrudt/forstyrret efter 8,5 s')
  }
  await closePage(page)
}

/** Fixed/dialog-elementer med hjælp/rundvisning, der er synlige nu. */
const visibleHelp = (page) =>
  page.evaluate(() => {
    const out = []
    const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && +getComputedStyle(el).opacity > 0
    for (const el of document.querySelectorAll('[data-tour-invite],[data-tour-popup],[role=dialog],[role=alertdialog],dialog[open]')) {
      if (!vis(el)) continue
      const r = el.getBoundingClientRect()
      if (r.width < 40 || r.height < 20) continue
      out.push(`${el.tagName.toLowerCase()}[${el.getAttribute('role') ?? ''}] "${el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)}"`)
    }
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
      if (!vis(el)) continue
      const t = el.textContent.replace(/\s+/g, ' ').trim()
      if (/rundvisning|vis mig rundt|vil du (have|se)|kan jeg hjælpe|brug for hjælp/i.test(t) && !/^vis mig rundt$/i.test(t)) out.push(`fast element "${t.slice(0, 60)}"`)
    }
    return [...new Set(out)]
  })

/* =====================================================================
   GRUPPE: formular
   ===================================================================== */
async function typeInto(page, selector, text) {
  const el = await page.$(selector)
  if (!el) return false
  await el.evaluate((n) => n.scrollIntoView({ block: 'center' }))
  await el.click()
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
  if (text) await page.keyboard.type(text)
  return true
}
async function submitForm(page) {
  const h = await page.evaluateHandle((sel) => {
    const c = document.querySelector(sel)
    let n = c
    for (let i = 0; n && i < 6; i++, n = n.parentElement) {
      const b = [...n.querySelectorAll('button')].find((x) => (x.type === 'submit' || !x.getAttribute('type')) && /send|forespørg/i.test(x.textContent))
      if (b) return b
    }
    return null
  }, FORM.contact)
  const btn = h.asElement()
  if (!btn) return false
  await btn.evaluate((n) => n.scrollIntoView({ block: 'center' }))
  await btn.click()
  return true
}
const formState = (page) =>
  page.evaluate((F, root) => {
    const c = document.querySelector(F.contact)
    const rootEl = document.querySelector(root)
    const form = c ? (c.closest('form') ?? c.closest('.send') ?? rootEl) : rootEl
    const msg = document.querySelector(F.message)
    const alerts = [...(form?.querySelectorAll('[role=alert]') ?? []), ...(rootEl?.querySelectorAll('[role=alert]') ?? [])].map((a) => a.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
    const labelOf = (el) => (el?.labels?.[0]?.textContent ?? '').replace(/\s+/g, ' ').trim()
    return {
      hasForm: !!c,
      contact: c?.value ?? null,
      name: document.querySelector(F.name)?.value ?? null,
      message: msg?.value ?? null,
      invalid: c?.getAttribute('aria-invalid'),
      focusName: document.activeElement?.name ?? document.activeElement?.tagName,
      alerts: [...new Set(alerts)],
      text: (rootEl?.innerText ?? '').replace(/\s+/g, ' ').trim(),
      formText: (form?.innerText ?? '').replace(/\s+/g, ' ').trim(),
      checked: [...(rootEl?.querySelectorAll('input:checked') ?? [])].map((i) => `${i.name}=${i.value}`).sort(),
      search: location.search,
      labels: { contact: labelOf(c), name: labelOf(document.querySelector(F.name)), message: labelOf(msg) },
    }
  }, FORM, CALC.root)
const THANKS = /\btak\b/i

async function testForm() {
  const runs = [
    [1440, FORM_URL],
    [390, FORM_URL],
    [390, `/priser/?${OLD_LINKS[1].q}`],
  ]
  for (const [vp, url] of runs) {
    const tag = `${vp}px ${url.split('?')[0]}`
    const page = await newPage(vp)
    const reopen = async () => {
      await open(page, url)
      posts.length = 0
    }
    await reopen()
    const st0 = await formState(page)
    ok('AC-27', st0.hasForm, `${tag}: formularen (input[name=contact]) findes ikke i beregnerens resultat`)
    if (!st0.hasForm) {
      await closePage(page)
      continue
    }
    // Felter.
    const fields = await page.evaluate((root) => {
      const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
      const c = document.querySelector(`${root} input[name=contact]`)
      const scope = c.closest('form') ?? c.closest('.send') ?? document.querySelector(root)
      const inputs = [...scope.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]),textarea,select')].filter((i) => vis(i) && !i.closest('[aria-hidden="true"]') && i.tabIndex !== -1)
      const trap = document.querySelector(`${root} input[name=website]`)
      const msg = scope.querySelector('textarea')
      return {
        fields: inputs.map((i) => `${i.tagName.toLowerCase()}[${i.name}]${i.required || i.getAttribute('aria-required') === 'true' ? '*' : ''}`),
        trapHidden: !trap || trap.tabIndex === -1,
        msgMax: msg?.maxLength ?? null,
        newsletter: /nyhedsbrev|marketing\s*mails?|samtykke til/i.test(scope.textContent),
        hasMessage: !!msg,
      }
    }, CALC.root)
    ok('AC-27', fields.fields.length >= 1 && fields.fields.length <= 3, `${tag}: formularen har ${fields.fields.length} synlige felter (${fields.fields.join(', ')}); højst kontakt, navn og besked`)
    ok('AC-27', fields.hasMessage, `${tag}: formularen har intet beskedfelt (textarea)`)
    ok('AC-27', fields.trapHidden, `${tag}: honeypot-feltet er synligt eller kan nås med tab`)
    ok('AC-27', !fields.newsletter, `${tag}: nyhedsbrev/samtykke-tekst i formularen`)
    ok('AC-27', /mail|telefon/i.test(st0.labels.contact), `${tag}: kontaktfeltets label er "${st0.labels.contact}"`)
    ok('AC-27', /navn|virksomhed/i.test(st0.labels.name) && /valgfri|valgfrit/i.test(st0.labels.name + st0.formText), `${tag}: navnefeltet er ikke mærket valgfrit ("${st0.labels.name}")`)
    warn('AC-27', !fields.hasMessage || /valgfri|valgfrit/i.test(st0.labels.message + st0.formText), `${tag}: beskedfeltet er ikke mærket valgfrit`)
    warn('AC-32', fields.msgMax === FORM.maxMessage || fields.msgMax === null, `${tag}: beskedfeltets maxlength er ${fields.msgMax} (skal være ${FORM.maxMessage})`)

    // Validering.
    mock.status = 200
    mock.body = { ok: true }
    for (const bad of ['', 'abc', '1234', 'a@b']) {
      await reopen()
      await typeInto(page, FORM.contact, bad)
      await submitForm(page)
      await wait(300)
      const s = await formState(page)
      ok('AC-28', posts.length === 0, `${tag}: "${bad}" blev sendt til serveren`)
      ok('AC-28', s.invalid === 'true' || s.alerts.length > 0, `${tag}: "${bad}" gav ingen valideringsfejl ved feltet (aria-invalid/role=alert)`)
      ok('AC-28', s.focusName === 'contact', `${tag}: fokus flyttede ikke til kontaktfeltet efter "${bad}" (fokus: ${s.focusName})`)
      ok('AC-30', !THANKS.test(s.text), `${tag}: tak vist ved ugyldigt input`)
    }

    // Serverfejl: ingen tak, fejltekst, valg og felter bevaret.
    for (const r of [
      { status: 500, body: { ok: false, error: 'store_failed' } },
      { status: 503, body: { ok: false, error: 'not_configured' } },
      { status: 200, body: { ok: false } },
    ]) {
      await reopen()
      mock.status = r.status
      mock.body = r.body
      await typeInto(page, FORM.name, 'QA Testvirksomhed')
      await typeInto(page, FORM.contact, 'qa-test@example.com')
      if (fields.hasMessage) await typeInto(page, FORM.message, 'Dette er en testbesked fra QA')
      const before = await formState(page)
      await submitForm(page)
      await wait(500)
      const s = await formState(page)
      const lbl = `${tag} ${r.status} ${JSON.stringify(r.body)}`
      ok('AC-29', posts.length === 1, `${lbl}: ${posts.length} henvendelser sendt (forventet 1)`)
      ok('AC-29', s.hasForm && s.alerts.length > 0, `${lbl}: ingen fejltekst (role=alert) eller formularen forsvandt`)
      ok('AC-29', s.alerts.some((a) => /ikke sendt|fejl|prøv|ring/i.test(a)) && s.alerts.some((a) => /53\s?61\s?36\s?99/.test(a) || /ring/i.test(a)), `${lbl}: fejlteksten fortæller ikke, at det ikke blev sendt, eller hvordan man ringer (fik: "${s.alerts.join(' / ')}")`)
      ok('AC-30', !THANKS.test(s.text), `${lbl}: tak vist, selvom serveren afviste`)
      ok('AC-29', s.contact === 'qa-test@example.com' && s.name === 'QA Testvirksomhed' && (!fields.hasMessage || s.message === 'Dette er en testbesked fra QA'), `${lbl}: felterne blev ikke bevaret (kontakt="${s.contact}", navn="${s.name}", besked="${s.message}")`)
      ok('AC-29', JSON.stringify(s.checked) === JSON.stringify(before.checked) && s.search === before.search, `${lbl}: valg/adresse ændret efter fejl (før ${before.checked.join(',')} ${before.search}; efter ${s.checked.join(',')} ${s.search})`)
    }

    // Succes først efter svar.
    await reopen()
    mock.status = 200
    mock.body = { ok: true }
    let release
    mock.hold = new Promise((r) => (release = r))
    await typeInto(page, FORM.name, 'QA Testvirksomhed')
    await typeInto(page, FORM.contact, '+45 53 61 36 99')
    if (fields.hasMessage) await typeInto(page, FORM.message, 'Besked med æøå og linjeskift')
    await submitForm(page)
    await wait(500)
    const pending = await formState(page)
    warn('AC-30', !THANKS.test(st0.text), `${tag}: ordet "tak" står allerede i beregneren før afsendelse (testen af tak kan give falsk PASS)`)
    ok('AC-30', !THANKS.test(pending.text) && pending.hasForm, `${tag}: tak vist, før serveren har svaret`)
    warn('AC-30', /sender/i.test(pending.formText), `${tag}: knappen viser ikke "Sender ..." mens der ventes`)
    release()
    mock.hold = null
    await wait(500)
    const done = await formState(page)
    ok('AC-30', THANKS.test(done.text), `${tag}: ingen tak efter { ok: true } (tekst: "${short(done.text.slice(-200), 120)}")`)
    ok('AC-31', posts.length === 1, `${tag}: ${posts.length} henvendelser for ét tryk`)
    const sent = posts[0] ?? {}
    ok('AC-31', sent.contact === '+45 53 61 36 99' && sent.name === 'QA Testvirksomhed', `${tag}: payload har ikke kontakt/navn: ${JSON.stringify(sent).slice(0, 200)}`)
    ok('AC-31', !fields.hasMessage || JSON.stringify(sent).includes('Besked med æøå og linjeskift'), `${tag}: beskeden findes ikke i payload: ${JSON.stringify(sent).slice(0, 200)}`)
    ok('AC-31', typeof sent.link === 'string' && sent.link.includes('ydelser=hjemmeside'), `${tag}: payload-link mangler valgene: ${sent.link}`)
    ok('AC-31', sent.website === '' || sent.website === undefined, `${tag}: honeypot udfyldt i payload`)
    ok('AC-31', /forespørgsel/i.test(st0.formText), `${tag}: formularen siger ikke, at det er en forespørgsel`)
    ok('AC-31', !/bestil(?!ling af tid)\w*\s+nu|køb nu|bekræftet bestilling/i.test(st0.formText), `${tag}: formularen lyder som en bestilling`)
    warn('AC-31', /ikke en bestilling|ingen bestilling|uforpligtende|ikke bindende|ingen forpligtelse/i.test(st0.formText), `${tag}: formularen siger ikke tydeligt, at indsendelse er en forespørgsel, ikke en bestilling`)

    // Beskedens længde.
    if (fields.hasMessage) {
      await reopen()
      mock.status = 200
      mock.body = { ok: true }
      await typeInto(page, FORM.contact, 'qa-test@example.com')
      const mEl = await page.$(FORM.message)
      await mEl.click()
      await page.keyboard.sendCharacter('x'.repeat(FORM.maxMessage + 100))
      const len = await page.evaluate((s) => document.querySelector(s).value.length, FORM.message)
      if (len > FORM.maxMessage) {
        await submitForm(page)
        await wait(400)
        const s = await formState(page)
        ok('AC-32', posts.length === 0 && s.alerts.length > 0, `${tag}: besked på ${len} tegn blev sendt eller gav ingen fejl (grænsen er ${FORM.maxMessage})`)
      } else {
        ok('AC-32', len === FORM.maxMessage, `${tag}: besked afkortet til ${len} tegn (forventet ${FORM.maxMessage})`)
      }
    }
    await closePage(page)
  }
  mock.status = 200
  mock.body = { ok: true }
  ok('AC-31', blockedPosts.length === 0, `uventede POST-forespørgsler blev afvist: ${blockedPosts.join(', ')}`)
  info('AC-31', `${posts.length >= 0 ? 'alle' : ''} henvendelser blev besvaret af efterligningen; ingen nåede en rigtig server`)
}

/* =====================================================================
   GRUPPE: demoer (arbejdsgangsdemo sender intet)
   ===================================================================== */
async function testDemos() {
  const page = await newPage(1440)
  await open(page, `/systemer/`)
  const demo = await page.$(WORKFLOW_DEMO)
  ok('AC-40', !!demo, '/systemer/: arbejdsgangsdemoen (#demo) findes ikke')
  if (demo) {
    posts.length = 0
    const before = blockedPosts.length
    const res = await page.evaluate((sel) => {
      const root = document.querySelector(sel)
      const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
      const inputs = [...root.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(vis)
      return { n: inputs.length, text: root.innerText.replace(/\s+/g, ' ').trim(), labelled: inputs.filter((i) => !i.labels?.length && !i.getAttribute('aria-label')).length }
    }, WORKFLOW_DEMO)
    ok('AC-40', /demo/i.test(res.text) && /ikke (?:et )?(?:færdigt|produktionsklart)/i.test(res.text), `#demo: mærkningen "Demo, ikke et færdigt system" mangler (tekst: "${short(res.text, 120)}")`)
    ok('AC-40', res.n >= 2, `#demo har ${res.n} synlige felter (forventet formular med dato, antal, type, ønsker)`)
    ok('AC-49', res.labelled === 0, `#demo: ${res.labelled} felter uden label`)
    // Udfyld med tastatur og indsend.
    const filled = await page.evaluate((sel) => {
      const root = document.querySelector(sel)
      const vis = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
      const set = (el, v) => {
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }
      for (const el of root.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea,select')) {
        if (!vis(el)) continue
        if (el.tagName === 'SELECT') set(el, el.options[Math.min(1, el.options.length - 1)]?.value ?? '')
        else if (el.type === 'date') set(el, '2027-03-12')
        else if (el.type === 'number') set(el, '25')
        else if (el.type === 'email') set(el, 'qa@example.com')
        else set(el, 'QA test')
      }
      const btn = [...root.querySelectorAll('button')].find((b) => (b.type === 'submit' || !b.getAttribute('type')) && vis(b))
      btn?.click()
      return !!btn
    }, WORKFLOW_DEMO)
    await wait(600)
    if (filled) {
      const after = await page.evaluate((sel) => document.querySelector(sel).innerText.replace(/\s+/g, ' '), WORKFLOW_DEMO)
      ok('AC-40', /\bNy\b/.test(after) && /påmind/i.test(after), `#demo: efter indsendelse vises hverken status "Ny" eller en intern påmindelse (tekst: "${short(after, 160)}")`)
    } else {
      skip('AC-40', '#demo: fandt ingen indsend-knap; test arbejdsgangsdemoen manuelt')
    }
    ok('AC-40', posts.length === 0 && blockedPosts.length === before, '#demo sendte en forespørgsel til serveren (skal kun være React-state)')
  }
  await closePage(page)
}

/* =====================================================================
   GRUPPE: tilgængelighed (fokus, kontrast, bevægelse, auto-åbning)
   ===================================================================== */
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
      if (ratio < (large ? 3 : 4.5)) contrast.push({ ratio: +ratio.toFixed(2), fs, text: txt.slice(0, 40), at: where(el) })
    }
  }
  const sel = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button]'
  for (const el of document.querySelectorAll(sel)) {
    if (el.closest('.send-trap,[inert],[aria-hidden="true"]')) continue
    const box = el.matches('input[type=radio],input[type=checkbox]') ? (el.closest('label') ?? el) : el
    if (!visible(box)) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'inline' && el.tagName === 'A' && el.closest('p,li') && el.parentElement.textContent.trim().length > el.textContent.trim().length + 10) continue
    const r = box.getBoundingClientRect()
    const w = r.width + (el.classList.contains('hit') ? 12 : 0)
    const h = r.height + (el.classList.contains('hit') ? 24 : 0)
    if (w < 44 || h < 44) targets.push({ w: Math.round(w), h: Math.round(h), text: (el.innerText || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 30), at: where(el) })
  }
  return { small, contrast, targets }
}
const dedupe = (items, key) => [...new Map(items.map((i) => [key(i), i])).values()]

async function tabSweep(page, p, max) {
  await open(page, p)
  await page.evaluate(() => {
    window.scrollTo(0, 0)
    document.activeElement?.blur?.()
  })
  const stops = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    await wait(70)
    const s = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return { body: true }
      const ringOf = (n) => {
        const c = getComputedStyle(n)
        return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2) || (c.boxShadow !== 'none' && /rgb/.test(c.boxShadow))
      }
      let ring = ringOf(el)
      const box = el.closest('label')?.querySelector('[class*=choice],[class*=box],[class*=check]')
      if (!ring && box) ring = ringOf(box)
      for (let n = el.parentElement, k = 0; !ring && n && k < 4; n = n.parentElement, k++) ring = ringOf(n)
      const rr = (box ?? el).getBoundingClientRect()
      const cx = Math.min(Math.max(rr.left + rr.width / 2, 1), innerWidth - 2)
      const cy = Math.min(Math.max(rr.top + rr.height / 2, 1), innerHeight - 2)
      const top = document.elementFromPoint(cx, cy)
      const covered = top && !(el.contains(top) || top.contains(el) || el.closest('label')?.contains(top)) ? `${top.tagName.toLowerCase()}.${String(top.className).split(' ')[0]}` : null
      return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.getAttribute('aria-label') || el.name || '').trim().replace(/\s+/g, ' ').slice(0, 28), ring, covered, inView: rr.bottom > 0 && rr.top < innerHeight && rr.height > 0, visibleBox: rr.width > 0 }
    })
    if (s.body) {
      stops.push(s)
      if (stops.filter((x) => x.body).length > 1) break
      continue
    }
    stops.push(s)
  }
  return stops.filter((s) => !s.body)
}

async function testA11y() {
  // Tab-gennemgang (reduceret bevægelse, så scroll hopper).
  for (const vp of [1440, 390]) {
    for (const p of ['/', '/priser/', '/systemer/']) {
      const page = await newPage(vp, { reduceMotion: true })
      const stops = await tabSweep(page, p, 130)
      ok('AC-44', stops.length > 15, `${vp}px ${p}: kun ${stops.length} tab-stop`)
      const noRing = stops.filter((s) => !s.ring)
      ok('AC-44', noRing.length === 0, `${vp}px ${p}: uden synlig fokusring: ${[...new Set(noRing.map((s) => `${s.tag} "${s.text}"`))].slice(0, 6).join('; ')}`)
      const hidden = stops.filter((s) => s.covered || !s.inView || !s.visibleBox)
      ok('AC-44', hidden.length === 0, `${vp}px ${p}: fokus skjult bag/uden for skærmen: ${hidden.slice(0, 5).map((s) => `${s.tag} "${s.text}" -> ${s.covered ?? 'uden for skærm'}`).join('; ')}`)
      if (p === '/') warn('AC-44', /spring|skip|hop til/i.test(stops[0]?.text ?? ''), `${vp}px /: første tab-stop er "${stops[0]?.text}" (et "Gå til indhold"-link anbefales)`)
      await closePage(page)
    }
  }
  // Kontrast, tekststørrelse, trykflader.
  const smallNotes = new Set()
  const targetNotes = new Set()
  for (const vp of [1440, 390, 360]) {
    const page = await newPage(vp)
    for (const p of [...SITE_PAGES, `/?${OLD_LINKS[1].q}`]) {
      await open(page, p)
      await scrollAll(page)
      const m = await page.evaluate(measure)
      const contrast = dedupe(m.contrast, (c) => `${c.at}|${c.ratio}`)
      ok('AC-45', contrast.length === 0, `${vp}px ${p}: kontrast under grænsen: ${contrast.slice(0, 5).map((c) => `${c.ratio}:1 "${c.text}" (${c.at})`).join('; ')}`)
      const small = dedupe(m.small, (s) => `${s.fs}|${s.at}`)
      ok('AC-52', !small.some((s) => s.fs < 12), `${vp}px ${p}: tekst under 12 px: ${small.filter((s) => s.fs < 12).slice(0, 5).map((s) => `${s.fs}px "${s.text}" (${s.at})`).join('; ')}`)
      for (const s of small.filter((s) => s.fs >= 12)) smallNotes.add(`${vp}px ${s.fs}px "${s.text}"`)
      const tg = dedupe(m.targets, (t) => `${t.w}x${t.h}|${t.at}`)
      ok('AC-48', !tg.some((t) => t.w < 40 || t.h < 40), `${vp}px ${p}: trykflader under 40 px: ${tg.filter((t) => t.w < 40 || t.h < 40).slice(0, 6).map((t) => `${t.w}x${t.h} "${t.text}" (${t.at})`).join('; ')}`)
      for (const t of tg.filter((t) => t.w >= 40 && t.h >= 40)) targetNotes.add(`${vp}px ${t.w}x${t.h} "${t.text}"`)
    }
    await closePage(page)
  }
  if (smallNotes.size) info('AC-52', `tekst på 12-13 px (${smallNotes.size}), fx: ${[...smallNotes].slice(0, 6).join(' | ')}`)
  if (targetNotes.size) info('AC-48', `trykflader på 40-43 px (${targetNotes.size}; mål 44 px), fx: ${[...targetNotes].slice(0, 6).join(' | ')}`)

  // Labels og legend på beregnerens valg og felter.
  const lp = await newPage(390)
  for (const p of ['/', `/?${OLD_LINKS[1].q}`]) {
    await open(lp, p)
    const r = await lp.evaluate(() => {
      const radios = [...document.querySelectorAll('#beregner input[type=radio],#beregner input[type=checkbox]')]
      const bad = radios.filter((i) => !i.labels?.length || !i.labels[0].textContent.trim() || !i.closest('fieldset')?.querySelector('legend')?.textContent.trim())
      const inputs = [...document.querySelectorAll('#beregner input[type=text],#beregner input[type=email],#beregner input[type=tel],#beregner select,#beregner textarea')].filter((i) => !i.closest('.send-trap') && !i.closest('[aria-hidden="true"]'))
      return { bad: bad.map((i) => i.name || i.value), unlabelled: inputs.filter((i) => !i.labels?.length && !i.getAttribute('aria-label')).map((i) => i.name) }
    })
    ok('AC-49', r.bad.length === 0 && r.unlabelled.length === 0, `${p}: valg/felter uden label eller legend: ${[...r.bad, ...r.unlabelled].join(', ')}`)
  }
  await closePage(lp)

  // Reduceret bevægelse.
  for (const vp of [1440, 390]) {
    for (const p of ['/', '/priser/', '/systemer/']) {
      const page = await newPage(vp, { reduceMotion: true })
      await open(page, p)
      await scrollAll(page)
      const r = await page.evaluate(() => {
        const long = []
        const hiddenText = []
        const dur = (v) => v.split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000))
        for (const el of document.querySelectorAll('main *, header *, footer *')) {
          const cs = getComputedStyle(el)
          const props = cs.transitionProperty.split(',').map((x) => x.trim())
          const movesByTransition = dur(cs.transitionDuration).some((d) => d > 1) && props.some((x) => /^(all|transform|translate|scale|rotate|top|left|right|bottom|margin|width|height)/.test(x))
          const anim = cs.animationName !== 'none' && dur(cs.animationDuration).some((d) => d > 1)
          const movesByAnim = anim && !/fade/.test(cs.animationName)
          if (movesByTransition || movesByAnim) long.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${cs.transitionProperty} ${cs.transitionDuration} / ${cs.animationName} ${cs.animationDuration})`)
        }
        for (const el of document.querySelectorAll('main h1, main h2, main p, main li')) {
          const cs = getComputedStyle(el)
          if (el.getBoundingClientRect().width && +cs.opacity < 0.99 && !el.closest('[aria-hidden="true"],.sr-only')) hiddenText.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}" opacity ${cs.opacity}`)
        }
        return { long: [...new Set(long)], hiddenText, smooth: getComputedStyle(document.documentElement).scrollBehavior }
      })
      ok('AC-46', r.long.length === 0, `${vp}px ${p}: bevægelse trods reduceret bevægelse: ${r.long.slice(0, 4).join('; ')}`)
      ok('AC-46', r.hiddenText.length === 0, `${vp}px ${p}: tekst ikke fuldt synlig: ${r.hiddenText.slice(0, 4).join('; ')}`)
      ok('AC-46', r.smooth !== 'smooth', `${vp}px ${p}: scroll-behavior er "smooth" trods reduceret bevægelse`)
      await closePage(page)
    }
  }

  // Ingen auto-åbnende hjælp (frisk kontekst = første besøg, tom localStorage).
  for (const [vp, p] of [[1440, '/'], [390, '/'], [1440, '/priser/'], [390, '/priser/']]) {
    const page = await newPage(vp)
    await open(page, p)
    const at1 = await visibleHelp(page)
    await page.evaluate(() => document.querySelector('#beregner')?.scrollIntoView({ block: 'center' }))
    await wait(8500)
    const at8 = await visibleHelp(page)
    ok('AC-47', at8.length === 0, `${vp}px ${p}: hjælp/rundvisning dukker op af sig selv inden for 8 s: ${at8.join(' | ')}`)
    ok('AC-47', at1.length === 0, `${vp}px ${p}: hjælp/rundvisning er åben ved indlæsning: ${at1.join(' | ')}`)
    await closePage(page)
  }
}

/* =====================================================================
   GRUPPE: SEO (rå HTML, sitemap, robots, redirects)
   ===================================================================== */
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const attrsOf = (tag) => Object.fromEntries([...tag.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)].map((m) => [m[1].toLowerCase(), decode(m[2])]))
async function get(p, init = {}) {
  const res = await fetch(SITE + p, { redirect: 'manual', ...init })
  return { status: res.status, text: await res.text(), headers: res.headers }
}
const walkKeys = (v, out = []) => {
  if (Array.isArray(v)) v.forEach((x) => walkKeys(x, out))
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      out.push(k)
      walkKeys(x, out)
    }
  }
  return out
}

async function testSeo() {
  const titles = new Map()
  const descs = new Map()
  for (const p of PAGES) {
    const { status, text: html } = await get(p)
    ok('AC-38', status === 200, `${p}: rå HTML giver HTTP ${status}`)
    const title = decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').trim()
    const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrsOf(m[0]))
    const desc = (metas.find((m) => m.name?.toLowerCase() === 'description')?.content ?? '').trim()
    const robots = metas.find((m) => m.name?.toLowerCase() === 'robots')?.content ?? ''
    const og = (k) => metas.find((m) => m.property === k)?.content
    const canonical = attrsOf(/<link\b[^>]*rel="canonical"[^>]*>/i.exec(html)?.[0] ?? '').href
    ok('AC-53', title.length > 0, `${p}: titel mangler`)
    ok('AC-53', desc.length > 0, `${p}: metabeskrivelse mangler`)
    warn('AC-53', title.length <= 65, `${p}: titlen er ${title.length} tegn (over ca. 65 kan blive afkortet): "${title}"`)
    warn('AC-53', desc.length >= 70 && desc.length <= 170, `${p}: beskrivelsen er ${desc.length} tegn (anbefalet 70-170)`)
    if (titles.has(title)) ok('AC-53', false, `${p}: titlen er den samme som på ${titles.get(title)}: "${title}"`)
    else titles.set(title, p)
    if (descs.has(desc)) ok('AC-53', false, `${p}: beskrivelsen er den samme som på ${descs.get(desc)}`)
    else descs.set(desc, p)
    ok('AC-53', (html.match(/<h1\b/gi) ?? []).length === 1, `${p}: rå HTML har ${(html.match(/<h1\b/gi) ?? []).length} h1 (skal være 1)`)
    ok('AC-54', !!canonical, `${p}: canonical mangler`)
    if (canonical) {
      ok('AC-54', canonical === `${PROD_ORIGIN}${p}`, `${p}: canonical er "${canonical}" (forventet ${PROD_ORIGIN}${p})`)
    }
    ok('AC-54', !/noindex/i.test(robots), `${p}: robots-meta har noindex`)
    warn('AC-58', !!og('og:image') && !!og('og:title') && !!og('og:description'), `${p}: mangler og:title/og:description/og:image`)
    if (p === '/') {
      warn('AC-58', /aarhus/i.test(title) && /OviaSpecs/.test(title), `/: titlen "${title}" følger ikke briefets retning ("Hjemmesider og lokal SEO i Aarhus | OviaSpecs")`)
      warn('AC-58', /hjemmeside/i.test(desc) && /(google|synlighed)/i.test(desc) && /ronny/i.test(desc), `/: beskrivelsen "${short(desc, 100)}" følger ikke briefets retning (hjemmeside, lokal Google-synlighed, direkte kontakt med Ronny)`)
    }
    // JSON-LD.
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
    for (const b of blocks) {
      let data
      try {
        data = JSON.parse(b)
      } catch (e) {
        ok('AC-56', false, `${p}: JSON-LD kan ikke parses (${e.message})`)
        continue
      }
      ok('AC-56', data && typeof data === 'object' && Object.keys(data).length > 0, `${p}: JSON-LD er tomt ({})`)
      const keys = walkKeys(data).map((k) => k.toLowerCase())
      for (const bad of ['aggregaterating', 'review', 'reviews', 'ratingvalue', 'reviewcount', 'bestrating']) ok('AC-56', !keys.includes(bad), `${p}: JSON-LD indeholder "${bad}" (ingen opdigtede anmeldelser/stjerner)`)
      ok('AC-56', companyAddress || !keys.includes('address'), `${p}: JSON-LD indeholder "address", men der er ingen verificeret adresse (company.address er tom)`)
      ok('AC-56', moduleReady || !/(?<![\d.,])(?:1\.?495|8\.?970)(?!\d)/.test(JSON.stringify(data)), `${p}: JSON-LD indeholder systemmodulets pris`)
      const s = JSON.stringify(data)
      if (/telephone/i.test(s)) ok('AC-56', /(?:\+45)?\s?53\s?61\s?36\s?99/.test(s), `${p}: JSON-LD telefon passer ikke til ${CONTACT.phone}`)
      if (/"email"/i.test(s)) ok('AC-56', s.includes(CONTACT.mail), `${p}: JSON-LD e-mail passer ikke til ${CONTACT.mail}`)
      info('AC-56', `${p}: JSON-LD @type ${JSON.stringify(data['@type'] ?? (data['@graph'] ?? []).map((x) => x['@type']))}`)
    }
    if (p === '/') ok('AC-56', blocks.length > 0 && !blocks.every((b) => b.trim() === '{}'), '/: ingen udfyldt JSON-LD på forsiden')
  }

  // Sitemap og robots.
  const sm = await get('/sitemap.xml')
  ok('AC-55', sm.status === 200, `/sitemap.xml: HTTP ${sm.status}`)
  const locs = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  for (const p of PAGES) ok('AC-55', locs.includes(`${PROD_ORIGIN}${p}`), `sitemap.xml mangler ${p}`)
  ok('AC-55', locs.includes(`${PROD_ORIGIN}/systemer/`), 'sitemap.xml mangler /systemer/')
  for (const l of locs) ok('AC-55', PAGES.some((p) => l === `${PROD_ORIGIN}${p}`), `sitemap.xml har en adresse, scriptet ikke kender: ${l}`)
  ok('AC-55', new Set(locs).size === locs.length, 'sitemap.xml har dubletter')
  const rb = await get('/robots.txt')
  ok('AC-55', rb.status === 200 && /^sitemap:\s*\S*sitemap\.xml/im.test(rb.text), 'robots.txt mangler "Sitemap: .../sitemap.xml"')
  ok('AC-55', !/^disallow:\s*\/\s*$/im.test(rb.text), 'robots.txt blokerer hele sitet (Disallow: /)')
  const nf = await get('/findes-ikke-qa/')
  warn('AC-38', nf.status === 404, `/findes-ikke-qa/ giver HTTP ${nf.status} (preview kan give 200; på Cloudflare skal en ukendt adresse give 404)`)

  // Interne links: svarer de 200?
  for (const [pth, from] of linkTargets) {
    if (pth.startsWith('/api/')) continue
    const r = await get(pth)
    ok('AC-41', r.status === 200, `${from}: link til ${pth} giver HTTP ${r.status}`)
  }

  // Redirects (filerne i repoet; preview udfører ikke _redirects).
  const redirFile = ['public/_redirects', 'dist/_redirects'].map((f) => path.join(ROOT, f)).find((f) => existsSync(f))
  if (!redirFile) {
    ok('AC-57', false, 'public/_redirects findes ikke')
  } else {
    const rules = readFileSync(redirFile, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.replace(/#.*/, '').trim().split(/\s+/))
      .filter((p) => p.length >= 2 && p[0].startsWith('/'))
      .map(([from, to, status]) => ({ from, to, status: status ?? '302' }))
    const sources = new Set(rules.map((r) => r.from))
    for (const old of LEGACY) {
      const r = rules.find((x) => x.from === old)
      ok('AC-57', !!r, `_redirects: ${old} er ikke viderestillet`)
      if (r) ok('AC-57', r.status === '301', `_redirects: ${old} bruger ${r.status} (skal være 301)`)
    }
    for (const r of rules) {
      const target = r.to.split('#')[0]
      ok('AC-57', PAGES.includes(target) || /^https?:/.test(r.to), `_redirects: ${r.from} peger på ${r.to}, som ikke er en kendt side`)
      ok('AC-57', !sources.has(target) || target === r.from, `_redirects: ${r.from} -> ${r.to} er en kæde (målet er selv omdirigeret)`)
      ok('AC-57', !PAGES.includes(r.from), `_redirects: ${r.from} er en live side, men omdirigeres`)
    }
    info('AC-57', `${rules.length} regler i ${path.relative(ROOT, redirFile)}`)
  }
}

/* =====================================================================
   GRUPPE: teknik (uden JS, scriptfejl, konsol, eksterne ressourcer, npm test)
   ===================================================================== */
async function testTech() {
  // Uden JavaScript og med blokerede scripts.
  for (const mode of [{ noJs: true }, { blockScripts: true }]) {
    for (const p of ['/', '/priser/', '/hjemmeside/', '/systemer/', '/booking-google/', '/marketing/']) {
      const page = await newPage(390, mode)
      await open(page, p)
      const r = await page.evaluate(() => {
        const main = document.querySelector('main')
        const text = (main?.innerText ?? '').replace(/\s+/g, ' ')
        const hidden = [...document.querySelectorAll('main h1, main h2, main p, main li')].filter((e) => {
          const cs = getComputedStyle(e)
          return e.getBoundingClientRect().height > 0 && (+cs.opacity < 0.99 || cs.visibility === 'hidden')
        })
        return { len: text.length, text, h1: main?.querySelector('h1')?.textContent ?? '', hidden: hidden.slice(0, 4).map((e) => `${e.tagName} ${e.textContent.slice(0, 25)}`), sw: document.documentElement.scrollWidth }
      })
      const tag = `${Object.keys(mode)[0] === 'noJs' ? 'uden JS' : 'scripts blokeret'} ${p}`
      ok('AC-67', r.len > 400 && !!r.h1, `${tag}: indholdet mangler (tekst ${r.len} tegn, h1 "${r.h1}")`)
      ok('AC-67', r.hidden.length === 0, `${tag}: usynlig tekst: ${r.hidden.join('; ')}`)
      ok('AC-67', r.sw <= 391, `${tag}: vandret overflow (${r.sw})`)
      if (p === '/' || p === '/priser/') ok('AC-67', hasAmount(r.text, 995) && hasAmount(r.text, 5970), `${tag}: tilbudslinjen (995 kr./md., 5.970 kr.) mangler`)
      if (p === '/priser/') ok('AC-67', hasAmount(r.text, 2500) && hasAmount(r.text, 99), `${tag}: engangs- og driftspriser mangler`)
      await closePage(page)
    }
  }
  // Konsol- og sidefejl, fejlende ressourcer, eksterne værter.
  const errs = [...new Set(pageLogs.flatMap((l) => l.errors))]
  ok('AC-65', errs.length === 0, `konsol-/sidefejl (${errs.length}): ${errs.slice(0, 5).join(' || ')}`)
  const bad = [...new Set(badResponses)]
  ok('AC-65', bad.length === 0, `fejlende interne ressourcer (${bad.length}): ${bad.slice(0, 6).join(' | ')}`)
  const hosts = [...externalHosts.entries()]
  const ALLOWED_HOSTS = /(^|\.)cloudflareinsights\.com$/ // Cloudflare Web Analytics (README)
  for (const [h, n] of hosts) ok('AC-68', ALLOWED_HOSTS.test(h), `eksterne forespørgsler til ${h} (${n} stk.): kun Cloudflare Web Analytics er tilladt (CSP i public/_headers)`)
  if (!hosts.length) ok('AC-68', true, '')
  info('AC-68', `eksterne værter forsøgt (afbrudt af testen): ${hosts.map(([h, n]) => `${h}(${n})`).join(', ') || 'ingen'}`)
  // npm test.
  if (process.env.RUN_NPM_TEST) {
    const r = spawnSync('npm', ['test'], { cwd: ROOT, shell: true, encoding: 'utf8' })
    ok('AC-63', r.status === 0, `npm test fejlede (exit ${r.status}): ${short((r.stdout + r.stderr).split('\n').filter(Boolean).slice(-6).join(' | '), 400)}`)
  } else {
    skip('AC-63', 'sæt RUN_NPM_TEST=1 eller kør `npm test` manuelt')
  }
  skip('AC-64', 'hovedagenten kører `npm run build` og `npm run lint`; QA rapporterer kun, hvad der blev kørt')
}

/* =====================================================================
   KØRSEL
   ===================================================================== */
const GROUPS = [
  ['sider', testPages],
  ['nav', testNav],
  ['nav', testSections],
  ['beregner', testCalculator],
  ['guide', testGuide],
  ['formular', testForm],
  ['formular', testDemos],
  ['a11y', testA11y],
  ['seo', testSeo],
  ['teknik', testTech],
]
// sider-gruppen fylder SNAP, som seo/teknik-delene bruger: kør den altid først, hvis noget af det vælges.
const needsPages = ONLY && !ONLY.includes('sider') && (ONLY.includes('seo') || ONLY.includes('teknik'))
for (const [group, fn] of GROUPS) {
  if (!want(group) && !(group === 'sider' && needsPages)) continue
  const t0 = Date.now()
  try {
    await fn()
    console.log(`kørt ${group}/${fn.name} (${((Date.now() - t0) / 1000).toFixed(0)} s)`)
  } catch (e) {
    crashes.push(`${group}/${fn.name}: testen blev afbrudt: ${e.stack?.split('\n').slice(0, 3).join(' | ') ?? e}`)
    console.log(`AFBRUDT ${group}/${fn.name}`)
  }
}
await browser.close()

/* =====================================================================
   RAPPORT
   ===================================================================== */
const status = (r) => {
  if (!r) return 'MANUEL'
  if (r.fail.length) return 'FAIL'
  if (r.pass === 0) return r.skip.length ? 'SKIP' : 'MANUEL'
  return r.warn.length || r.skip.length ? 'PASS*' : 'PASS'
}
let failed = 0
let lastGroup = ''
console.log('')
for (const [id, group, title] of CATALOG) {
  if (group !== lastGroup) {
    console.log(`\n== ${group} ==`)
    lastGroup = group
  }
  const r = results.get(id)
  const st = status(r)
  if (st === 'FAIL') failed++
  console.log(`${st.padEnd(6)} ${id.padEnd(6)} ${title}`)
  if (!r) continue
  const uniq = (a) => [...new Set(a)]
  for (const m of uniq(r.fail).slice(0, 8)) console.log(`         FEJL  ${short(m, 330)}`)
  if (r.fail.length > 8) console.log(`         ... og ${uniq(r.fail).length - 8} flere fejl`)
  for (const m of uniq(r.warn).slice(0, 4)) console.log(`         ADVARSEL  ${short(m, 330)}`)
  if (uniq(r.warn).length > 4) console.log(`         ... og ${uniq(r.warn).length - 4} flere advarsler`)
  for (const m of uniq(r.skip).slice(0, 3)) console.log(`         MANUEL KONTROL  ${short(m, 330)}`)
  if (ONLY || process.env.VERBOSE) for (const m of uniq(r.info).slice(0, 12)) console.log(`         note  ${short(m, 330)}`)
}
const unknown = [...results.keys()].filter((id) => !CATALOG.some((c) => c[0] === id))
if (unknown.length) console.log(`\nUkendte AC-id'er i scriptet (ret CATALOG): ${unknown.join(', ')}`)
for (const c of crashes) console.log(`\nAFBRUDT: ${c}`)
const counts = { PASS: 0, 'PASS*': 0, FAIL: 0, SKIP: 0, MANUEL: 0 }
for (const [id] of CATALOG) counts[status(results.get(id))]++
console.log(`\nOpsummering: ${counts.PASS} PASS, ${counts['PASS*']} PASS med advarsel/manuel rest, ${counts.FAIL} FAIL, ${counts.SKIP} SKIP, ${counts.MANUEL} MANUEL (af ${CATALOG.length}).`)
if (!ONLY) console.log('PASS* = bestået, men med advarsler eller en manuel del. VERBOSE=1 viser noter.')
if (failed || crashes.length) {
  console.error(`\nREBRAND-QA FEJLEDE: ${failed} AC'er${crashes.length ? ` og ${crashes.length} afbrudte tests` : ''}.`)
  process.exit(1)
}
console.log('\nRebrand-QA bestået (se advarsler og manuelle punkter ovenfor).')
