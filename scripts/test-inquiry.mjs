/**
 * Test af henvendelser fra prisberegneren: worker/index.js (handleInquiry og
 * den daglige cron runDaily), kørt i Node mod en rigtig SQLite-database med
 * præcis worker/schema.sql (node:sqlite bag et lille D1-lignende lag) og en
 * falsk send_email-binding, hvor mailfejl kan slås til og fra.
 * Kører med `npm test` og som en del af `npm run build`.
 *
 * Tjekker: gyldig mail/dansk nummer (samme regler i browser og på server),
 * ugyldigt input, honeypot, at henvendelsen GEMMES før mailen sendes og stadig
 * er gemt, når mailen fejler, fejl uden database, rate limit (altid), Turnstile
 * (påkrævet med TURNSTILE_SECRET, sprunget over uden),
 * fremmed origin, ugyldigt link og mailens indhold. Cron: genforsøg → 'sent',
 * 3 fejlede genforsøg → 'gave_up' øverst i opsummeringen (kun én gang),
 * hængende 'pending', ingen mail uden nyt, og sletning efter retentionMonths.
 */
import { readFileSync } from 'node:fs'
import { MAX_RETRIES, handleInquiry, runDaily } from '../worker/index.js'
import { danishPhone, inquiry, validContact } from '../src/inquiry.js'

// SQLite i Node er stadig mærket eksperimentel; advarslen holdes ude af outputtet.
process.removeAllListeners('warning')
const { DatabaseSync } = await import('node:sqlite')

// Workerens fejl-logning (forventet i testene) holdes ude af outputtet.
const logError = console.error
console.error = () => {}

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const ORIGIN = 'https://oviaspecs.com'
const LINK = '/priser/?ydelser=hjemmeside%2Cmarketing&sider=2-5&bestilling=nej&drift=drift&videoer=8&poste=ja&annoncer=nej&trin=4'
const SCHEMA = readFileSync('worker/schema.sql', 'utf8')
const TOKEN_OK = 'gyldig-token'

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

/** Miljø med falsk mail: `mail.down = true` simulerer en mailfejl. */
function env({ db = d1(), limited = false, ...rest } = {}) {
  const mail = { down: false, sent: [] }
  return {
    mail,
    DB: db,
    MAIL_FROM: 'kontakt@oviaspecs.com',
    MAIL_TO: 'modtager@example.com',
    TURNSTILE_SECRET: 'hemmelig',
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
    body: typeof body === 'string' ? body : JSON.stringify({ turnstile: TOKEN_OK, ...body }),
  })

async function call(body, e = env(), opts) {
  const res = await handleInquiry(post(body, opts), e, { EmailMessage })
  return { status: res.status, data: await res.json(), env: e }
}

const decode = (raw) => {
  const subject = /^Subject: =\?UTF-8\?B\?([^?]+)\?=/m.exec(raw)
  const body = raw.split('\r\n\r\n').slice(1).join('').replace(/\r\n/g, '')
  const utf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))
  return { subject: subject ? utf8(subject[1]) : '', text: utf8(body) }
}

/* ---- Validering (samme funktion i browseren og på serveren) ------------- */
for (const ok of ['ronny@example.com', 'a.b+c@firma.dk', '53613699', '53 61 36 99', '+45 53 61 36 99', '+4553613699', '0045 5361 3699', '53-61-36-99']) {
  check(validContact(ok), `afvist, men gyldig: "${ok}"`)
}
for (const bad of ['', '  ', 'abc', 'ronny@', '@example.com', 'ronny@example', '1234567', '123456789', '+46 53613699', '+45 5361369', 'ring mig', '53613699a']) {
  check(!validContact(bad), `godkendt, men ugyldig: "${bad}"`)
}
check(danishPhone('+45 53 61 36 99') === '53613699', 'dansk nummer normaliseres ikke')

/* ---- POST /api/henvendelse --------------------------------------------- */

// Gyldig henvendelse: gemt, mail sendt, OK. Mailen sendes først, når rækken findes.
{
  const e = env()
  e.SEND_EMAIL.send = async (m) => {
    check(e.DB.rows().some((r) => r.mail_status === 'pending'), 'mail sendt, før henvendelsen var gemt')
    e.mail.sent.push(m)
  }
  const r = await call({ contact: 'kunde@example.com', name: 'Café Test', website: '', link: LINK }, e)
  check(r.status === 200 && r.data.ok === true, `gyldig mail: ${r.status} ${JSON.stringify(r.data)}`)
  const rows = e.DB.rows()
  check(rows.length === 1 && rows[0].mail_status === 'sent' && rows[0].retries === 0, `gyldig: gemt ${JSON.stringify(rows)}`)
  check(e.mail.sent.length === 1, 'gyldig: ingen mail sendt')
  const mail = e.mail.sent[0]
  const { text, subject } = decode(mail.raw)
  check(mail.from === 'kontakt@oviaspecs.com' && mail.to === 'modtager@example.com', 'afsender/modtager er forkert')
  check(/^Reply-To: kunde@example\.com$/m.test(mail.raw), 'Reply-To mangler ved mail')
  check(subject === rows[0].subject, `emnet i mailen og i D1 er forskellige: "${subject}" / "${rows[0].subject}"`)
  for (const want of [
    'Kontakt: kunde@example.com (mail)',
    'Navn / virksomhed: Café Test',
    'Hjemmeside, Vækst: 4.000 kr. + 299 kr./md',
    'Marketing, Vækst: 2.500 kr./md',
    'Nu: 4.000 kr.',
    'Pr. md: 2.799 kr./md',
    'I alt: 4.000 kr. nu + 2.799 kr./md',
    `Link til beregningen: ${ORIGIN}/priser/?ydelser=hjemmeside%2Cmarketing&sider=2-5&bestilling=nej&drift=drift&videoer=8&poste=ja&annoncer=nej&trin=4#beregner`,
  ]) {
    check(text.includes(want), `mailen mangler "${want}"\n${text}`)
  }
}

// Linket i mailen peger altid på det domæne, kunden brugte (aldrig et andet).
for (const host of ['https://oviaspecs.com', 'https://beregner-cta-scroll-ovia.ronnyhong723.workers.dev']) {
  for (const link of [LINK, `https://evil.example${LINK}`, `https://beregner-cta-scroll-ovia.ronnyhong723.workers.dev${LINK}`]) {
    const e = env({ TURNSTILE_SECRET: undefined })
    const req = new Request(`${host}/api/henvendelse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: host },
      body: JSON.stringify({ contact: 'kunde@example.com', link }),
    })
    await handleInquiry(req, e, { EmailMessage })
    const got = /Link til beregningen: (\S+)/.exec(decode(e.mail.sent[0]?.raw ?? '').text)?.[1] ?? ''
    check(got.startsWith(`${host}/priser/?ydelser=`), `link på ${host} (sendt: ${link.slice(0, 40)}…) blev ${got}`)
  }
}

// Dansk telefonnummer: ingen Reply-To, nummeret står i mailen.
{
  const r = await call({ contact: '+45 53 61 36 99', name: '', link: LINK })
  check(r.status === 200 && r.data.ok, `telefon: ${r.status}`)
  const { text } = decode(r.env.mail.sent[0].raw)
  check(text.includes('Kontakt: 53613699 (telefon)') && text.includes('Navn / virksomhed: (ikke udfyldt)'), `telefon i mailen:\n${text}`)
  check(!/^Reply-To:/m.test(r.env.mail.sent[0].raw), 'Reply-To sat ved telefonnummer')
}

// Ugyldigt input: 400, intet gemt, intet sendt.
for (const contact of ['abc', '1234567', '', 'ronny@example']) {
  const r = await call({ contact, link: LINK })
  check(r.status === 400 && r.data.ok === false, `ugyldig "${contact}": ${r.status}`)
  check(r.env.DB.rows().length === 0 && r.env.mail.sent.length === 0, `ugyldig "${contact}": gemt eller sendt alligevel`)
}
{
  const r = await call('{ikke json')
  check(r.status === 400 && r.env.DB.rows().length === 0, `ikke-JSON: ${r.status}`)
  const noLink = await call({ contact: 'kunde@example.com', link: '/priser/' })
  check(noLink.status === 400 && noLink.data.error === 'invalid_link', `link uden valg: ${noLink.status}`)
}

// Honeypot: OK til robotten, men intet gemt og intet sendt — med og uden Turnstile.
for (const [label, e] of [['med Turnstile', env()], ['uden Turnstile', env({ TURNSTILE_SECRET: undefined })]]) {
  const r = await call({ contact: 'kunde@example.com', link: LINK, website: 'http://spam.example' }, e)
  check(r.status === 200 && r.data.ok === true, `honeypot ${label}: ${r.status}`)
  check(e.DB.rows().length === 0 && e.mail.sent.length === 0, `honeypot ${label}: gemt eller sendt`)
}

// Mailen fejler: henvendelsen er gemt som 'failed' med fejlen, og kunden får OK.
{
  const e = env()
  e.mail.down = true
  const r = await call({ contact: 'kunde@example.com', link: LINK }, e)
  const rows = e.DB.rows()
  check(rows.length === 1 && rows[0].mail_status === 'failed', `mailfejl: ikke gemt som failed (${JSON.stringify(rows)})`)
  check(rows[0]?.summary.includes('Hjemmeside, Vækst') && /simuleret/.test(rows[0]?.last_error), 'mailfejl: opsummering eller fejl ikke gemt')
  check(r.status === 200 && r.data.ok === true, `mailfejl: ${r.status}`)
}

// Kan ikke gemmes: fejl, og mailen sendes ikke (kunden får nummeret i stedet).
{
  const e = env()
  delete e.DB
  const r = await call({ contact: 'kunde@example.com', link: LINK }, e)
  check(r.status === 503 && r.data.ok === false && e.mail.sent.length === 0, `uden database: ${r.status}`)
  const f = await call({ contact: 'kunde@example.com', link: LINK }, env({ db: d1({ failInsert: true }) }))
  check(f.status === 500 && f.data.ok === false && f.env.mail.sent.length === 0, `D1-fejl: ${f.status}`)
}

// Turnstile, når TURNSTILE_SECRET er sat: uden eller med forkert token → 403, intet gemt.
for (const [label, body] of [
  ['uden token', { turnstile: '' }],
  ['forkert token', { turnstile: 'falsk' }],
]) {
  const e = env()
  const r = await call({ contact: 'kunde@example.com', link: LINK, ...body }, e)
  check(r.status === 403 && r.data.ok === false, `Turnstile ${label}: ${r.status} (forventet 403)`)
  check(e.DB.rows().length === 0 && e.mail.sent.length === 0, `Turnstile ${label}: gemt eller sendt`)
}
// Uden TURNSTILE_SECRET springes Turnstile over: gyldig henvendelse uden token gemmes og sendes.
{
  const e = env({ TURNSTILE_SECRET: undefined })
  const r = await call({ contact: 'kunde@example.com', link: LINK, turnstile: '' }, e)
  check(r.status === 200 && r.data.ok === true, `uden TURNSTILE_SECRET: ${r.status} ${JSON.stringify(r.data)}`)
  check(e.DB.rows().length === 1 && e.mail.sent.length === 1, 'uden TURNSTILE_SECRET: ikke gemt og sendt')
}

// Rate limit (bindingen), fremmed origin og GET.
{
  for (const [label, e] of [['med Turnstile', env({ limited: true })], ['uden Turnstile', env({ limited: true, TURNSTILE_SECRET: undefined })]]) {
    const r = await call({ contact: 'kunde@example.com', link: LINK }, e)
    check(r.status === 429 && e.DB.rows().length === 0 && e.mail.sent.length === 0, `rate limit ${label}: ${r.status}`)
  }
  // Rate limit pr. IP: nøglen er klientens IP.
  const keys = []
  const k = env({ TURNSTILE_SECRET: undefined, RATE_LIMITER: { limit: async ({ key }) => (keys.push(key), { success: true }) } })
  await call({ contact: 'kunde@example.com', link: LINK }, k)
  check(keys[0] === '203.0.113.7', `rate limit-nøgle: ${keys[0]}`)
  const o = await call({ contact: 'kunde@example.com', link: LINK }, env(), { origin: 'https://evil.example' })
  check(o.status === 403 && o.env.DB.rows().length === 0, `fremmed origin: ${o.status}`)
  const g = await handleInquiry(new Request(`${ORIGIN}/api/henvendelse`), env(), { EmailMessage })
  check(g.status === 405, `GET: ${g.status}`)
}

/* ---- Daglig cron (runDaily) med simuleret mailfejl ---------------------- */
{
  const e = env()
  const day = (n) => new Date(Date.now() + n * 24 * 3600_000)
  const status = (contact) => e.DB.rows().find((r) => r.contact === contact)

  // A fejler ved indsendelse og bliver ved med at fejle; B fejler ved indsendelse, men lykkes ved første genforsøg.
  e.mail.down = true
  await call({ contact: 'a@example.com', name: 'Opgivet ApS', link: LINK }, e)
  await call({ contact: 'b@example.com', link: LINK }, e)
  check(status('a@example.com').mail_status === 'failed' && status('b@example.com').mail_status === 'failed', 'cron: start er ikke failed')

  // Dag 1: mailen virker igen, undtagen A's egen henvendelsesmail (simuleret pr. emne).
  e.SEND_EMAIL.send = async (m) => {
    if (e.mail.down && decode(m.raw).subject.endsWith('a@example.com')) throw new Error('Email Routing: simuleret fejl')
    e.mail.sent.push(m)
  }
  let res = await runDaily(e, { EmailMessage }, day(1))
  check(status('b@example.com').mail_status === 'sent' && status('b@example.com').retries === 1, `cron dag 1: B ikke sendt (${JSON.stringify(status('b@example.com'))})`)
  check(status('a@example.com').mail_status === 'failed' && status('a@example.com').retries === 1, `cron dag 1: A (${JSON.stringify(status('a@example.com'))})`)

  // Dag 2 og 3: A fejler igen → efter MAX_RETRIES genforsøg 'gave_up'.
  await runDaily(e, { EmailMessage }, day(2))
  check(status('a@example.com').mail_status === 'failed' && status('a@example.com').retries === 2, 'cron dag 2: A burde stadig være failed')
  e.mail.sent.length = 0
  res = await runDaily(e, { EmailMessage }, day(3))
  check(MAX_RETRIES === 3, `MAX_RETRIES er ${MAX_RETRIES}`)
  check(status('a@example.com').mail_status === 'gave_up' && status('a@example.com').retries === 3, `cron dag 3: A ikke gave_up (${JSON.stringify(status('a@example.com'))})`)
  check(res.gaveUp === 1 && res.digest === 'sent', `cron dag 3: ${JSON.stringify(res)}`)

  // Opsummeringen: A står øverst med hele henvendelsen.
  const digest = e.mail.sent.map((m) => decode(m.raw)).find((m) => m.subject.includes('Daglig opsummering'))
  check(digest?.subject.startsWith('OPGIVET (1)'), `opsummeringens emne: "${digest?.subject}"`)
  const first = digest?.text.split('\n').find((l) => l.trim())
  check(first?.startsWith('OPGIVET: 1 henvendelse'), `opsummeringen starter ikke med de opgivne: "${first}"`)
  check(digest?.text.includes('a@example.com') && digest.text.includes('Navn / virksomhed: Opgivet ApS') && digest.text.includes('Hjemmeside, Vækst'), `opsummeringen mangler henvendelsen:\n${digest?.text}`)
  check(digest && digest.text.indexOf('OPGIVET') < digest.text.indexOf('Seneste døgn'), 'opgivne står ikke over døgnets liste')
  check(Boolean(status('a@example.com').reported_at), 'opgivet henvendelse ikke markeret som rapporteret')

  // Dag 4: A sendes ikke igen og står ikke i opsummeringen igen; intet nyt = ingen mail.
  e.mail.sent.length = 0
  e.mail.down = false
  res = await runDaily(e, { EmailMessage }, day(4))
  check(status('a@example.com').mail_status === 'gave_up' && e.mail.sent.length === 0 && res.digest === 'none', `cron dag 4: ${JSON.stringify(res)}, ${e.mail.sent.length} mails`)
}

// Opgiven henvendelse, mens også opsummeringen fejler: den kommer med, når mailen virker igen.
{
  const e = env()
  e.mail.down = true
  await call({ contact: 'c@example.com', link: LINK }, e)
  const at = (n) => new Date(Date.now() + n * 24 * 3600_000)
  for (let n = 1; n <= 3; n++) await runDaily(e, { EmailMessage }, at(n))
  const row = e.DB.rows()[0]
  check(row.mail_status === 'gave_up' && !row.reported_at, `alt nede: ${JSON.stringify(row)}`)
  e.mail.down = false
  const res = await runDaily(e, { EmailMessage }, at(4))
  check(res.digest === 'sent' && e.DB.rows()[0].reported_at, `opgivet ikke rapporteret, da mailen virkede igen: ${JSON.stringify(res)}`)
}

// Hængende 'pending' (fx afbrudt efter gem) sendes af cron, og gamle henvendelser slettes.
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
  await runDaily(e, { EmailMessage }, now)
  const rows = Object.fromEntries(e.DB.rows().map((r) => [r.id, r.mail_status]))
  check(rows.haenger === 'sent', `hængende pending ikke sendt: ${rows.haenger}`)
  check(rows.frisk === 'pending', `frisk pending rørt af cron: ${rows.frisk}`)
  check(!('gammel' in rows), `henvendelse ældre end ${inquiry.retentionMonths} md ikke slettet`)
}

// Uden database gør cron ingenting (og fejler ikke).
check((await runDaily({}, { EmailMessage })).skipped === 'no_db', 'cron uden database')

console.error = logError
globalThis.fetch = realFetch
if (failures.length) {
  console.error(`Henvendelsestest FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(
  'Henvendelsestest bestået: validering, honeypot, gem-før-mail, mailfejl, Turnstile (valgfri), honeypot og rate limit uden Turnstile, mailens indhold og daglig cron (genforsøg, gave_up efter 3, opsummering, oprydning).',
)
