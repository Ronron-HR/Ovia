/**
 * Test af forespørgsler fra beregneren: worker/index.js (handleInquiry og den daglige cron runDaily),
 * kørt i Node mod en rigtig SQLite-database med præcis worker/schema.sql (node:sqlite bag et lille
 * D1-lignende lag) og en falsk send_email-binding, hvor mailfejl kan slås til og fra.
 * Kører med `npm test`.
 *
 * Tjekker: validering (navn påkrævet, telefon eller mail, samme funktion i browser og på server),
 * ugyldigt input, honeypot, at forespørgslen GEMMES før mailen sendes og stadig er gemt, når mailen
 * fejler (fejltilstand), fejl uden database, rate limit, Turnstile (valgfrit: kun påkrævet med
 * TURNSTILE_SECRET), fremmed origin og mailens indhold: emne, kontakt, besked, alle valgte linjer med
 * priser og totaler (genregnet på serveren med calculate.js, så et snydt tal fra browseren ikke bruges),
 * Reply-To og del-link. Cron: genforsøg, gave_up efter 3, opsummering, hængende pending og sletning.
 */
import { readFileSync } from 'node:fs'
import { CRON_FROM, MAX_RETRIES, handleInquiry, runDaily } from '../worker/index.js'
import { LIMITS, canonicalLink, cleanMessage, composeMail, danishPhone, inquiry, normalize, validate } from '../src/inquiry.js'

// SQLite i Node er stadig mærket eksperimentel; advarslen holdes ude af outputtet.
process.removeAllListeners('warning')
const { DatabaseSync } = await import('node:sqlite')

// Workerens fejl-logning (forventet i testene) holdes ude af outputtet.
const logError = console.error
console.error = () => {}
const logInfo = console.log
console.log = () => {}

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const ORIGIN = 'https://oviaspecs.com'
/** Hjemmeside Vækst + Marketing Vækst + drift Plus + booking-tilvalg: 9.000 kr. + 5.398 kr./md. (håndregnet). */
const LINK = '/?w=1&m=1&d=p&bk=1&s=4'
const SCHEMA = readFileSync('worker/schema.sql', 'utf8')
const TOKEN_OK = 'gyldig-token'
const GOOD = { name: 'Café Test', company: 'Café Test ApS', email: 'kunde@example.com', phone: '', message: '', link: LINK }

/** D1-lignende lag over SQLite: prepare().bind().run()/all()/first(). */
function d1({ failInsert = false } = {}) {
  const db = new DatabaseSync(':memory:')
  db.exec(SCHEMA)
  return {
    raw: db,
    rows: () => db.prepare('SELECT * FROM henvendelser ORDER BY created_at').all(),
    prepare(sql) {
      let args = []
      const stmt = {
        bind: (...a) => ((args = a), stmt),
        async run() {
          if (failInsert && sql.startsWith('INSERT')) throw new Error('D1 nede')
          db.prepare(sql).run(...args)
          return { success: true }
        },
        async all() {
          return { results: db.prepare(sql).all(...args) }
        },
        async first() {
          return db.prepare(sql).get(...args) ?? null
        },
      }
      return stmt
    },
  }
}

class EmailMessage {
  constructor(from, to, raw) {
    Object.assign(this, { from, to, raw })
  }
}

/** Uden pause før baggrundens ene genforsøg, så testene ikke venter 2 s hver. */
const DEPS = { EmailMessage, retryDelayMs: 0 }

/** Miljø med falsk mail: `mail.down = true` simulerer en mailfejl. Uden TURNSTILE_SECRET som i dag. */
function env({ db = d1(), limited = false, ...rest } = {}) {
  const mail = { down: false, sent: [] }
  return {
    mail,
    DB: db,
    MAIL_FROM: 'kontakt@oviaspecs.com',
    MAIL_TO: 'modtager@example.com',
    SEND_EMAIL: {
      async send(m) {
        if (mail.down) throw new Error('Email Routing: simuleret fejl')
        mail.sent.push(m)
      },
    },
    RATE_LIMITER: { limit: async () => ({ success: !limited }) },
    ...rest,
  }
}

// Turnstiles siteverify efterlignes: kun TOKEN_OK er gyldig.
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  if (String(url).includes('turnstile/v0/siteverify')) {
    return Response.json({ success: init.body.get('response') === TOKEN_OK && init.body.get('secret') === 'hemmelig' })
  }
  return realFetch(url, init)
}

const post = (body, { origin = ORIGIN } = {}) =>
  new Request(`${ORIGIN}/api/henvendelse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '203.0.113.7' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

async function call(body, e = env(), opts) {
  const res = await handleInquiry(post(body, opts), e, DEPS)
  return { status: res.status, data: await res.json(), env: e }
}

const decode = (raw) => {
  const subject = /^Subject: =\?UTF-8\?B\?([^?]+)\?=/m.exec(raw)
  const body = raw.split('\r\n\r\n').slice(1).join('').replace(/\r\n/g, '')
  const utf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))
  return { subject: subject ? utf8(subject[1]) : '', text: utf8(body) }
}

/* ---- Validering (samme funktion i browseren og på serveren) ------------- */
for (const ok of ['53613699', '53 61 36 99', '+45 53 61 36 99', '+4553613699', '0045 5361 3699', '53-61-36-99']) {
  check(Boolean(danishPhone(ok)) && !validate(normalize({ name: 'A', phone: ok })), `afvist, men gyldigt nummer: "${ok}"`)
}
for (const bad of ['abc', '1234567', '123456789', '+46 53613699', '+45 5361369', 'ring mig', '53613699a']) {
  check(validate(normalize({ name: 'A', phone: bad }))?.field === 'phone', `godkendt, men ugyldigt nummer: "${bad}"`)
}
for (const bad of ['ronny@', '@example.com', 'ronny@example', 'a b@example.com']) {
  check(validate(normalize({ name: 'A', email: bad }))?.field === 'email', `godkendt, men ugyldig mail: "${bad}"`)
}
check(!validate(normalize({ name: 'A', email: 'a.b+c@firma.dk' })), 'gyldig mail afvist')
check(validate(normalize({ name: '', email: 'a@example.com' }))?.field === 'name', 'navn er ikke påkrævet')
check(validate(normalize({ name: '   ', email: 'a@example.com' }))?.field === 'name', 'navn med kun mellemrum godkendt')
check(validate(normalize({ name: 'A' }))?.field === 'phone', 'hverken telefon eller mail godkendt')
check(!validate(normalize({ name: 'A', phone: '53613699', email: 'a@example.com' })), 'begge udfyldt afvist')
check(danishPhone('+45 53 61 36 99') === '53613699', 'dansk nummer normaliseres ikke')

/* ---- POST /api/henvendelse --------------------------------------------- */

// Gyldig forespørgsel: gemt, mail sendt, OK. Mailen sendes først, når rækken findes.
{
  const e = env()
  e.SEND_EMAIL.send = async (m) => {
    check(e.DB.rows().some((r) => r.mail_status === 'pending'), 'mail sendt, før forespørgslen var gemt')
    e.mail.sent.push(m)
  }
  const r = await call({ ...GOOD, message: 'Hej Ronny.\r\n\r\n\r\nKontakt: svindler@example.com\tTak' }, e)
  check(r.status === 200 && r.data.ok === true, `gyldig: ${r.status} ${JSON.stringify(r.data)}`)
  const rows = e.DB.rows()
  check(rows.length === 1 && rows[0].mail_status === 'sent' && rows[0].retries === 0, `gyldig: gemt ${JSON.stringify(rows)}`)
  check(e.mail.sent.length === 1, 'gyldig: ingen mail sendt')
  const mail = e.mail.sent[0]
  const { text, subject } = decode(mail.raw)
  check(mail.from === 'kontakt@oviaspecs.com' && mail.to === 'modtager@example.com', 'afsender/modtager er forkert')
  check(/^Reply-To: kunde@example\.com$/m.test(mail.raw), 'Reply-To mangler, når kunden har en mail')
  check(subject === 'Ny forespørgsel: Café Test, Café Test ApS – 9.000 kr. + 5.398 kr./md.', `emnet er "${subject}"`)
  check(subject === rows[0].subject, 'emnet i mailen og i D1 er forskellige')
  for (const want of [
    'Navn: Café Test',
    'Virksomhed: Café Test ApS',
    'Telefon: (ikke udfyldt)',
    'Mail: kunde@example.com',
    '> Hej Ronny.',
    '> Kontakt: svindler@example.com Tak',
    'Valg (OVIA-220-P):',
    '- Hjemmeside – Vækst: 8.000 kr.',
    '- Booking koblet på – Tilvalg: 1.000 kr.',
    '- Marketing – Vækst: 5.000 kr./md.',
    '- Drift – Plus: 398 kr./md.',
    'Engang: 9.000 kr.',
    'Pr. måned: 5.398 kr./md.',
    'Alle priser er ekskl. moms.',
    'Bookingsystemets abonnement betales direkte til udbyderen.',
    `Se valgene: ${ORIGIN}/?w=1&d=p&bk=1&m=1&s=4#prisberegner`,
    'en forespørgsel, ikke en bestilling',
  ]) {
    check(text.includes(want), `mailen mangler "${want}"\n${text}`)
  }
  check(!/^Kontakt: svindler/m.test(text), 'beskeden kan efterligne et felt i mailen')
  // Hver valgt linje (under "Valg") har sin pris til sidst: "- Hjemmeside – Vækst: 8.000 kr.", "- Marketing – Vækst: 5.000 kr./md.".
  const valgLines = text.slice(text.indexOf('Valg (')).split('\n').filter((l) => l.startsWith('- '))
  check(valgLines.length === 4 && valgLines.every((l) => /: [\d.]+ kr\.(\/md\.)?$/.test(l)), `en valgt linje mangler pris:\n${valgLines.join('\n')}`)
  check(rows[0].summary.includes('Hej Ronny.') && rows[0].contact === 'kunde@example.com' && rows[0].name === 'Café Test (Café Test ApS)', `D1-rækken: ${JSON.stringify(rows[0])}`)
}

// Priserne regnes på serveren: et snydt tal fra browseren bruges aldrig, og kvitteringen følger valgene.
{
  const e = env()
  const r = await call({ ...GOOD, link: '/?w=2&x=2&d=e&s=4', total: 1, once: 1, monthly: 1, lines: [{ label: 'Gratis', price: '0 kr.' }] }, e)
  check(r.status === 200, `snydt tal: ${r.status}`)
  const { text, subject } = decode(e.mail.sent[0].raw)
  check(subject.endsWith('– 11.600 kr. + 798 kr./md.'), `snydt tal i emnet: "${subject}"`)
  check(text.includes('Engang: 11.600 kr.') && text.includes('Pr. måned: 798 kr./md.') && !text.includes('Gratis'), `snydt tal i mailen:\n${text}`)
  check(text.includes('- Ekstra undersider – 2 × 800 kr.: 1.600 kr.'), `ekstra sider mangler:\n${text}`)
}

// "Indgår"-reglen og egen hosting i mailen (håndregnet).
{
  const e = env()
  await call({ ...GOOD, link: '/?w=1&b=1&bk=1&d=p&s=4' }, e)
  const t = decode(e.mail.sent[0].raw).text
  check(!t.includes('Booking koblet på') && t.includes('Engang: 10.000 kr.'), `booking indgår, ingen dobbelt pris:\n${t}`)
  const e2 = env()
  await call({ ...GOOD, link: '/?w=0&d=h&s=4' }, e2)
  const t2 = decode(e2.mail.sent[0].raw).text
  check(t2.includes('Engang: 7.000 kr.') && t2.includes('Pr. måned: 0 kr./md.') && t2.includes('Egen konto/hosting'), `egen hosting:\n${t2}`)
}

// Uden virksomhed og med telefon: emnet uden komma, nummeret normaliseret, ingen Reply-To.
{
  const r = await call({ name: 'Mette', phone: '+45 53 61 36 99', link: '/?m=0&s=4' })
  check(r.status === 200 && r.data.ok, `telefon: ${r.status}`)
  const raw = r.env.mail.sent[0].raw
  const { text, subject } = decode(raw)
  check(subject === 'Ny forespørgsel: Mette – 0 kr. + 3.000 kr./md.', `emne uden virksomhed: "${subject}"`)
  check(text.includes('Telefon: 53613699') && text.includes('Mail: (ikke udfyldt)') && text.includes('Virksomhed: (ikke udfyldt)'), `telefon i mailen:\n${text}`)
  check(!/^Reply-To:/m.test(raw), 'Reply-To sat uden mail')
  check(r.env.DB.rows()[0].contact === '53613699', `kontakt i D1: ${r.env.DB.rows()[0].contact}`)
}

// Både mail og telefon: Reply-To er mailen, D1 har begge.
{
  const e = env()
  await call({ ...GOOD, phone: '53 61 36 99' }, e)
  check(/^Reply-To: kunde@example\.com$/m.test(e.mail.sent[0].raw), 'Reply-To ved begge')
  check(e.DB.rows()[0].contact === 'kunde@example.com · 53613699', `kontakt ved begge: ${e.DB.rows()[0].contact}`)
}

// Linket i mailen peger altid på det domæne, kunden brugte (aldrig et andet).
for (const host of ['https://oviaspecs.com', 'https://redesign-handoff-ovia.ronnyhong723.workers.dev']) {
  for (const link of [LINK, `https://evil.example${LINK}`, `https://redesign-handoff-ovia.ronnyhong723.workers.dev${LINK}`]) {
    const e = env()
    const req = new Request(`${host}/api/henvendelse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: host },
      body: JSON.stringify({ ...GOOD, link }),
    })
    await handleInquiry(req, e, DEPS)
    const got = /Se valgene: (\S+)/.exec(decode(e.mail.sent[0]?.raw ?? '').text)?.[1] ?? ''
    check(got.startsWith(`${host}/?w=1`), `link på ${host} (sendt: ${link.slice(0, 40)}…) blev ${got}`)
  }
}

// Besked: valgfri, højst 1.000 tegn; uden besked ingen tom blok; for stor krop afvises.
{
  check(LIMITS.message === 1000, `LIMITS.message er ${LIMITS.message}`)
  const e = env()
  await call(GOOD, e)
  check(!decode(e.mail.sent[0].raw).text.includes('Besked'), 'tom besked giver en tom blok')
  const long = 'æ'.repeat(LIMITS.message + 500)
  check(cleanMessage(long).length === LIMITS.message, `for lang besked: ${cleanMessage(long).length} tegn`)
  const big = { name: 'n'.repeat(160), company: 'c'.repeat(160), email: 'k'.repeat(180) + '@example.com', phone: '5'.repeat(8), message: '"'.repeat(LIMITS.message), link: LINK, website: '', turnstile: 't'.repeat(4096) }
  const bigRes = await call(big)
  check(bigRes.status === 200, `største gyldige forespørgsel: ${bigRes.status} ${JSON.stringify(bigRes.data)}`)
  const size = new TextEncoder().encode(JSON.stringify({ ...big, link: 'x'.repeat(LIMITS.link) })).length
  check(size < 10_000, `største forespørgsel fylder ${size} byte (MAX_BODY 10000)`)
  const huge = await call({ ...GOOD, message: 'x'.repeat(20_000) })
  check(huge.status === 413, `for stor krop: ${huge.status}`)
}

// Ugyldigt input: 400, intet gemt, intet sendt, og svaret siger, hvilket felt.
for (const [label, body, field] of [
  ['uden navn', { ...GOOD, name: '' }, 'invalid_name'],
  ['uden kontakt', { ...GOOD, email: '', phone: '' }, 'invalid_phone'],
  ['ugyldigt nummer', { ...GOOD, email: '', phone: '1234567' }, 'invalid_phone'],
  ['ugyldig mail', { ...GOOD, email: 'ronny@example' }, 'invalid_email'],
]) {
  const r = await call(body)
  check(r.status === 400 && r.data.ok === false && r.data.error === field, `${label}: ${r.status} ${JSON.stringify(r.data)}`)
  check(r.env.DB.rows().length === 0 && r.env.mail.sent.length === 0, `${label}: gemt eller sendt alligevel`)
}
{
  const r = await call('{ikke json')
  check(r.status === 400 && r.env.DB.rows().length === 0, `ikke-JSON: ${r.status}`)
  for (const link of ['/', '/?s=4', '/?d=p&bk=1', 'ikke et link']) {
    const n = await call({ ...GOOD, link })
    check(n.status === 400 && n.data.error === 'invalid_link', `link uden valg "${link}": ${n.status} ${n.data.error}`)
  }
  check(canonicalLink('/?w=9&m=-1&d=zzz', ORIGIN)?.url === `${ORIGIN}/?w=2&d=b&m=0&s=4#prisberegner`, 'canonicalLink renser ugyldige svar')
}

// Honeypot: OK til robotten, men intet gemt og intet sendt — med og uden Turnstile.
for (const [label, e] of [['uden Turnstile', env()], ['med Turnstile', env({ TURNSTILE_SECRET: 'hemmelig' })]]) {
  const r = await call({ ...GOOD, website: 'http://spam.example' }, e)
  check(r.status === 200 && r.data.ok === true, `honeypot ${label}: ${r.status}`)
  check(e.DB.rows().length === 0 && e.mail.sent.length === 0, `honeypot ${label}: gemt eller sendt`)
}

// Mailen fejler: forespørgslen er gemt som 'failed' med fejlen, og kunden får OK (intet er tabt).
{
  const e = env()
  e.mail.down = true
  const r = await call(GOOD, e)
  const rows = e.DB.rows()
  check(rows.length === 1 && rows[0].mail_status === 'failed', `mailfejl: ikke gemt som failed (${JSON.stringify(rows)})`)
  check(rows[0]?.summary.includes('- Hjemmeside – Vækst') && /simuleret/.test(rows[0]?.last_error), 'mailfejl: opsummering eller fejl ikke gemt')
  check(r.status === 200 && r.data.ok === true, `mailfejl: ${r.status}`)
}

// Kan ikke gemmes: fejl, og mailen sendes ikke (kunden får Ring og SMS i stedet).
{
  const e = env()
  delete e.DB
  const r = await call(GOOD, e)
  check(r.status === 503 && r.data.ok === false && e.mail.sent.length === 0, `uden database: ${r.status}`)
  const f = await call(GOOD, env({ db: d1({ failInsert: true }) }))
  check(f.status === 500 && f.data.ok === false && f.env.mail.sent.length === 0, `D1-fejl: ${f.status}`)
}

// Turnstile er et fejlflag: uden TURNSTILE_SECRET er den ikke påkrævet; med den kræves en gyldig token.
{
  const e = env()
  const r = await call({ ...GOOD, turnstile: '' }, e)
  check(r.status === 200 && r.data.ok === true && e.DB.rows().length === 1, `uden TURNSTILE_SECRET: ${r.status} ${JSON.stringify(r.data)}`)
  for (const [label, token] of [['uden token', ''], ['forkert token', 'falsk']]) {
    const t = env({ TURNSTILE_SECRET: 'hemmelig' })
    const x = await call({ ...GOOD, turnstile: token }, t)
    check(x.status === 403 && x.data.ok === false, `Turnstile ${label}: ${x.status} (forventet 403)`)
    check(t.DB.rows().length === 0 && t.mail.sent.length === 0, `Turnstile ${label}: gemt eller sendt`)
  }
  const ok = env({ TURNSTILE_SECRET: 'hemmelig' })
  const g = await call({ ...GOOD, turnstile: TOKEN_OK }, ok)
  check(g.status === 200 && ok.mail.sent.length === 1, `Turnstile med gyldig token: ${g.status}`)
}

// Rate limit (bindingen), fremmed origin og GET.
{
  const e = env({ limited: true })
  const r = await call(GOOD, e)
  check(r.status === 429 && e.DB.rows().length === 0 && e.mail.sent.length === 0, `rate limit: ${r.status}`)
  const keys = []
  const k = env({ RATE_LIMITER: { limit: async ({ key }) => (keys.push(key), { success: true }) } })
  await call(GOOD, k)
  check(keys[0] === '203.0.113.7', `rate limit-nøgle: ${keys[0]}`)
  const o = await call(GOOD, env(), { origin: 'https://evil.example' })
  check(o.status === 403 && o.env.DB.rows().length === 0, `fremmed origin: ${o.status}`)
  const g = await handleInquiry(new Request(`${ORIGIN}/api/henvendelse`), env(), DEPS)
  check(g.status === 405, `GET: ${g.status}`)
}

// composeMail kan også bruges direkte (samme tekst som workeren sender).
{
  const l = canonicalLink(LINK, ORIGIN)
  const m = composeMail({ name: 'X', link: l.url, selection: l.selection })
  check(m.subject === 'Ny forespørgsel: X – 9.000 kr. + 5.398 kr./md.', `composeMail emne: ${m.subject}`)
}

// Svar først, mail bagefter (ctx.waitUntil): kunden får OK lige efter validering og gem, mens send_email er langsom;
// rækken er 'pending', til mailen er sendt, og så 'sent'. Fejler mailen i baggrunden, står rækken som 'failed', og cron sender igen.
{
  const makeCtx = () => ({ promises: [], waitUntil(p) { this.promises.push(p) } })
  const slow = (ms) => {
    const e = env()
    e.SEND_EMAIL.send = async (m) => {
      await new Promise((r) => setTimeout(r, ms))
      if (e.mail.down) throw new Error('Email Routing: simuleret fejl')
      e.mail.sent.push(m)
    }
    return e
  }
  const e = slow(400)
  const ctx = makeCtx()
  const t0 = Date.now()
  const res = await handleInquiry(post(GOOD), e, DEPS, ctx)
  const took = Date.now() - t0
  check(res.status === 200 && (await res.json()).ok === true, `baggrundsmail: svar ${res.status}`)
  check(took < 250, `kunden får svar, før den langsomme mail (400 ms) er sendt (${took} ms)`)
  check(e.DB.rows().length === 1 && e.DB.rows()[0].mail_status === 'pending' && e.mail.sent.length === 0, `ved svaret er forespørgslen gemt som pending og mailen ikke sendt endnu (${e.DB.rows()[0]?.mail_status})`)
  check(ctx.promises.length === 1, 'mailen er lagt i ctx.waitUntil')
  await Promise.all(ctx.promises)
  check(e.mail.sent.length === 1 && e.DB.rows()[0].mail_status === 'sent', `bagefter er mailen sendt og rækken sent (${e.DB.rows()[0].mail_status}, ${e.mail.sent.length} mail)`)

  // Mailfejl i baggrunden: svaret er stadig OK, rækken er 'failed' med fejlen, og cron sender den igen.
  const f = slow(50)
  f.mail.down = true
  const fctx = makeCtx()
  const fres = await handleInquiry(post({ ...GOOD, email: 'fejl@example.com' }), f, DEPS, fctx)
  check(fres.status === 200, `baggrundsfejl: svar ${fres.status}`)
  await Promise.all(fctx.promises)
  const frow = f.DB.rows()[0]
  check(frow.mail_status === 'failed' && /simuleret/.test(frow.last_error), `mailfejl i baggrunden markerer rækken failed (${frow.mail_status}, ${frow.last_error})`)
  f.mail.down = false
  await runDaily(f, DEPS, new Date(Date.now() + 24 * 3600_000))
  check(f.DB.rows()[0].mail_status === 'sent' && f.mail.sent.length >= 1, `cron sender den fejlede mail igen (${f.DB.rows()[0].mail_status})`)

  // Afbrudt efter gem (workeren stoppet før baggrundsarbejdet): rækken står som pending, og cron sender den, når den er over en time gammel.
  const g = env()
  g.DB.raw.prepare('INSERT INTO henvendelser (id, created_at, contact, name, link, subject, summary, mail_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run('afbrudt', new Date(Date.now() - 2 * 3600_000).toISOString(), 'a@b.dk', 'X', LINK, 'Emne', 'Tekst', 'pending')
  await runDaily(g, DEPS, new Date())
  check(g.DB.rows()[0].mail_status === 'sent', 'afbrudt pending sendes af cron')
}

/* ---- Daglig cron (runDaily) med simuleret mailfejl ---------------------- */
{
  const e = env()
  const day = (n) => new Date(Date.now() + n * 24 * 3600_000)
  const status = (contact) => e.DB.rows().find((r) => r.contact === contact)

  // A fejler ved indsendelse og bliver ved med at fejle; B fejler ved indsendelse, men lykkes ved første genforsøg.
  e.mail.down = true
  await call({ ...GOOD, name: 'Opgivet ApS', email: 'a@example.com' }, e)
  await call({ ...GOOD, name: 'Bent', email: 'b@example.com' }, e)
  check(status('a@example.com').mail_status === 'failed' && status('b@example.com').mail_status === 'failed', 'cron: start er ikke failed')

  // Dag 1: mailen virker igen, undtagen A's egen forespørgselsmail (simuleret pr. emne).
  e.SEND_EMAIL.send = async (m) => {
    if (e.mail.down && decode(m.raw).subject.includes('Opgivet ApS')) throw new Error('Email Routing: simuleret fejl')
    e.mail.sent.push(m)
  }
  let res = await runDaily(e, DEPS, day(1))
  check(status('b@example.com').mail_status === 'sent' && status('b@example.com').retries === 1, `cron dag 1: B ikke sendt (${JSON.stringify(status('b@example.com'))})`)
  check(status('a@example.com').mail_status === 'failed' && status('a@example.com').retries === 1, `cron dag 1: A (${JSON.stringify(status('a@example.com'))})`)
  const resent = e.mail.sent.map((m) => m.raw).find((raw) => decode(raw).subject.includes('Bent'))
  check(/^Reply-To: b@example\.com$/m.test(resent ?? ''), 'cron: Reply-To mangler ved genforsøg')

  // Dag 2 og 3: A fejler igen → efter MAX_RETRIES genforsøg 'gave_up'.
  await runDaily(e, DEPS, day(2))
  check(status('a@example.com').mail_status === 'failed' && status('a@example.com').retries === 2, 'cron dag 2: A burde stadig være failed')
  e.mail.sent.length = 0
  res = await runDaily(e, DEPS, day(3))
  check(MAX_RETRIES === 3, `MAX_RETRIES er ${MAX_RETRIES}`)
  check(status('a@example.com').mail_status === 'gave_up' && status('a@example.com').retries === 3, `cron dag 3: A ikke gave_up (${JSON.stringify(status('a@example.com'))})`)
  check(res.gaveUp === 1 && res.digest === 'sent', `cron dag 3: ${JSON.stringify(res)}`)

  // Opsummeringen: A står øverst med hele forespørgslen.
  const digest = e.mail.sent.map((m) => decode(m.raw)).find((m) => m.subject.includes('Daglig opsummering'))
  check(digest?.subject.startsWith('OPGIVET (1)'), `opsummeringens emne: "${digest?.subject}"`)
  const first = digest?.text.split('\n').find((l) => l.trim())
  check(first?.startsWith('OPGIVET: 1 henvendelse'), `opsummeringen starter ikke med de opgivne: "${first}"`)
  check(digest?.text.includes('a@example.com') && digest.text.includes('Navn: Opgivet ApS') && digest.text.includes('- Hjemmeside – Vækst'), `opsummeringen mangler forespørgslen:\n${digest?.text}`)
  check(digest && digest.text.indexOf('OPGIVET') < digest.text.indexOf('Seneste døgn'), 'opgivne står ikke over døgnets liste')
  check(Boolean(status('a@example.com').reported_at), 'opgivet forespørgsel ikke markeret som rapporteret')

  // Dag 4: A sendes ikke igen og står ikke i opsummeringen igen; intet nyt = ingen mail.
  e.mail.sent.length = 0
  e.mail.down = false
  res = await runDaily(e, DEPS, day(4))
  check(status('a@example.com').mail_status === 'gave_up' && e.mail.sent.length === 0 && res.digest === 'none', `cron dag 4: ${JSON.stringify(res)}, ${e.mail.sent.length} mails`)
}

// Opgiven forespørgsel, mens også opsummeringen fejler: den kommer med, når mailen virker igen.
{
  const e = env()
  e.mail.down = true
  await call({ ...GOOD, email: 'c@example.com' }, e)
  const at = (n) => new Date(Date.now() + n * 24 * 3600_000)
  for (let n = 1; n <= 3; n++) await runDaily(e, DEPS, at(n))
  const row = e.DB.rows()[0]
  check(row.mail_status === 'gave_up' && !row.reported_at, `alt nede: ${JSON.stringify(row)}`)
  e.mail.down = false
  const res = await runDaily(e, DEPS, at(4))
  check(res.digest === 'sent' && e.DB.rows()[0].reported_at, `opgivet ikke rapporteret, da mailen virkede igen: ${JSON.stringify(res)}`)
}

// Hængende 'pending' (fx afbrudt efter gem) sendes af cron, og gamle forespørgsler slettes.
{
  const e = env()
  const now = new Date()
  const old = new Date(now)
  old.setMonth(old.getMonth() - inquiry.retentionMonths - 1)
  const insert = (id, created, status) =>
    e.DB.raw
      .prepare('INSERT INTO henvendelser (id, created_at, contact, name, link, subject, summary, mail_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, created, `${id}@example.com`, '', LINK, 'Emne', 'Tekst', status)
  insert('haenger', new Date(now - 2 * 3600_000).toISOString(), 'pending')
  insert('frisk', new Date(now - 60_000).toISOString(), 'pending')
  insert('gammel', old.toISOString(), 'sent')
  await runDaily(e, DEPS, now)
  const rows = Object.fromEntries(e.DB.rows().map((r) => [r.id, r.mail_status]))
  check(rows.haenger === 'sent', `hængende pending ikke sendt: ${rows.haenger}`)
  check(rows.frisk === 'pending', `frisk pending rørt af cron: ${rows.frisk}`)
  check(!('gammel' in rows), `forespørgsel ældre end ${inquiry.retentionMonths} md ikke slettet`)
}

// Ét genforsøg i baggrunden: fejler første send_email og lykkes den anden, er mailen sendt, og rækken er 'sent' (uden at cron skal gribe ind).
// Fejler begge, står rækken som 'failed' med fejlen, og cron sender den senere. Kunden får svar, før noget genforsøges.
{
  const makeCtx = () => ({ promises: [], waitUntil(p) { this.promises.push(p) } })
  const flaky = (failures, delayMs = 0) => {
    const e = env()
    let calls = 0
    e.calls = () => calls
    e.SEND_EMAIL.send = async (m) => {
      calls++
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs))
      if (calls <= failures) throw new Error('Email Routing: kortvarigt udfald ' + calls)
      e.mail.sent.push(m)
    }
    return e
  }

  // Fejl, så succes: sendt ved andet forsøg.
  const a = flaky(1)
  const actx = makeCtx()
  const ares = await handleInquiry(post(GOOD), a, DEPS, actx)
  check(ares.status === 200, `retry: svar ${ares.status}`)
  await Promise.all(actx.promises)
  check(a.calls() === 2 && a.mail.sent.length === 1, `retry: to forsøg, én mail sendt (${a.calls()} forsøg, ${a.mail.sent.length} mails)`)
  check(a.DB.rows()[0].mail_status === 'sent' && a.DB.rows()[0].last_error === null, `retry: rækken er sent uden fejl (${a.DB.rows()[0].mail_status})`)

  // Succes første gang: ingen ekstra forsøg.
  const b = flaky(0)
  const bctx = makeCtx()
  await handleInquiry(post(GOOD), b, DEPS, bctx)
  await Promise.all(bctx.promises)
  check(b.calls() === 1 && b.DB.rows()[0].mail_status === 'sent', `retry: ingen ekstra forsøg, når første lykkes (${b.calls()})`)

  // Fejl begge gange: præcis to forsøg, rækken failed med den sidste fejl, og cron sender den senere.
  const c = flaky(2)
  const cctx = makeCtx()
  const cres = await handleInquiry(post(GOOD), c, DEPS, cctx)
  check(cres.status === 200, `retry-fejl: kunden får stadig OK (${cres.status})`)
  await Promise.all(cctx.promises)
  const crow = c.DB.rows()[0]
  check(c.calls() === 2 && crow.mail_status === 'failed' && /kortvarigt udfald 2/.test(crow.last_error), `retry-fejl: to forsøg og failed med sidste fejl (${c.calls()}, ${crow.mail_status}, ${crow.last_error})`)
  await runDaily(c, DEPS, new Date(Date.now() + 24 * 3600_000))
  check(c.DB.rows()[0].mail_status === 'sent' && c.mail.sent.length >= 1, `retry-fejl: cron sender den (${c.DB.rows()[0].mail_status})`)

  // Svaret afventer hverken første forsøg, pausen eller genforsøget (langsom mail + 300 ms pause).
  const d = flaky(1, 200)
  const dctx = makeCtx()
  const t0 = Date.now()
  const dres = await handleInquiry(post(GOOD), d, { EmailMessage, retryDelayMs: 300 }, dctx)
  const took = Date.now() - t0
  check(dres.status === 200 && took < 200, `kunden får svar, før forsøg og pause (200 + 300 + 200 ms) er overstået (${took} ms)`)
  check(d.mail.sent.length === 0 && d.DB.rows()[0].mail_status === 'pending', 'ved svaret er mailen ikke sendt endnu, og rækken er pending')
  await Promise.all(dctx.promises)
  check(d.calls() === 2 && d.DB.rows()[0].mail_status === 'sent', `bagefter er mailen sendt efter retry (${d.calls()} forsøg)`)
}

// Gamle rækker i D1 (før redesignet) sendes ALDRIG igen af cron og kommer ikke med i opsummeringen, men slettes stadig efter retentionMonths.
{
  const e = env()
  const ins = (id, created, status, retries = 0) =>
    e.DB.raw
      .prepare('INSERT INTO henvendelser (id, created_at, contact, name, link, subject, summary, mail_status, retries) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, created, id + '@gammel.dk', '', LINK, 'Gammelt emne', 'Gammel tekst (Lokal)', status, retries)
  ins('gammel-failed', '2026-10-20T10:00:00.000Z', 'failed')
  ins('gammel-pending', '2026-11-04T20:00:00.000Z', 'pending')
  ins('gammel-gaveup', '2026-10-10T10:00:00.000Z', 'gave_up', 3)
  check(CRON_FROM === '2026-11-05T00:00:00.000Z', 'CRON_FROM er redesignets dato')
  const res = await runDaily(e, DEPS, new Date())
  const st = Object.fromEntries(e.DB.rows().map((r) => [r.id, r.mail_status]))
  check(e.mail.sent.length === 0 && res.digest === 'none' && res.retried === 0, `gamle rækker udløste mail eller opsummering: ${JSON.stringify(res)}, ${e.mail.sent.length} mails`)
  check(st['gammel-failed'] === 'failed' && st['gammel-pending'] === 'pending' && st['gammel-gaveup'] === 'gave_up', `gamle rækker blev ændret: ${JSON.stringify(st)}`)
}

// Uden database gør cron ingenting (og fejler ikke).
check((await runDaily({}, DEPS)).skipped === 'no_db', 'cron uden database')

console.error = logError
console.log = logInfo
globalThis.fetch = realFetch
if (failures.length) {
  console.error(`Forespørgselstest FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  'Forespørgselstest bestået: validering, honeypot, gem-før-mail, fejltilstand ved mailfejl, Turnstile som valgfrit fejlflag, rate limit, mailens emne og indhold med priser genregnet på serveren, Reply-To og daglig cron (genforsøg, gave_up efter 3, opsummering, oprydning).',
)
