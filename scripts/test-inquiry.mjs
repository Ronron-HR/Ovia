/**
 * Test af henvendelser fra prisberegneren: worker/index.js (handleInquiry) med
 * en falsk D1-database og en falsk send_email-binding, kørt i Node.
 * Kører med `npm test` og som en del af `npm run build`.
 *
 * Tjekker: gyldig mail/dansk nummer (samme regler i browser og på server),
 * ugyldigt input, honeypot, at henvendelsen GEMMES før mailen sendes og stadig
 * er gemt, når mailen fejler, at der svares fejl uden database, rate limit,
 * Turnstile, fremmed origin, ugyldigt link, mailens indhold og oprydning efter
 * retentionMonths.
 */
import { handleInquiry } from '../worker/index.js'
import { danishPhone, inquiry, validContact } from '../src/inquiry.js'

// Workerens fejl-logning (forventet i testene) holdes ude af outputtet.
const logError = console.error
console.error = () => {}

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const ORIGIN = 'https://oviaspecs.com'
const LINK = '/priser/?ydelser=hjemmeside%2Cmarketing&sider=2-5&bestilling=nej&drift=drift&videoer=8&poste=ja&annoncer=nej&trin=4'

function fakeDB({ failInsert = false } = {}) {
  const rows = new Map()
  const log = []
  return {
    rows,
    log,
    prepare(sql) {
      let args = []
      const stmt = {
        bind: (...a) => ((args = a), stmt),
        async run() {
          log.push(sql.split(' ')[0])
          if (sql.startsWith('INSERT')) {
            if (failInsert) throw new Error('D1 nede')
            const [id, created_at, contact, name, link, summary, mail_status] = args
            rows.set(id, { created_at, contact, name, link, summary, mail_status })
          }
          if (sql.startsWith('UPDATE')) rows.get(args[1]).mail_status = args[0]
          if (sql.startsWith('DELETE')) log.push(`cutoff:${args[0]}`)
          return {}
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

function env({ db = fakeDB(), mailFails = false, limited = false, ...rest } = {}) {
  const sent = []
  return {
    sent,
    DB: db,
    MAIL_FROM: 'kontakt@oviaspecs.com',
    MAIL_TO: 'modtager@example.com',
    SEND_EMAIL: {
      async send(m) {
        // Mailen må først sendes, når henvendelsen er gemt.
        check([...db.rows.values()].some((r) => r.mail_status === 'pending'), 'mail sendt, før henvendelsen var gemt')
        if (mailFails) throw new Error('Email Routing fejl')
        sent.push(m)
      },
    },
    RATE_LIMITER: { limit: async () => ({ success: !limited }) },
    ...rest,
  }
}

const post = (body, { origin = ORIGIN } = {}) =>
  new Request(`${ORIGIN}/api/henvendelse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '203.0.113.7' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

async function call(body, e = env(), opts) {
  const res = await handleInquiry(post(body, opts), e, { EmailMessage })
  return { status: res.status, data: await res.json(), env: e }
}

const decode = (raw) => {
  const body = raw.split('\r\n\r\n').slice(1).join('').replace(/\r\n/g, '')
  return new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0)))
}

// 1. Validering (samme funktion i browseren og på serveren).
for (const ok of ['ronny@example.com', 'a.b+c@firma.dk', '53613699', '53 61 36 99', '+45 53 61 36 99', '+4553613699', '0045 5361 3699', '53-61-36-99']) {
  check(validContact(ok), `afvist, men gyldig: "${ok}"`)
}
for (const bad of ['', '  ', 'abc', 'ronny@', '@example.com', 'ronny@example', '1234567', '123456789', '+46 53613699', '+45 5361369', 'ring mig', '53613699a']) {
  check(!validContact(bad), `godkendt, men ugyldig: "${bad}"`)
}
check(danishPhone('+45 53 61 36 99') === '53613699', 'dansk nummer normaliseres ikke')

// 2. Gyldig henvendelse: gemt, mail sendt, OK.
{
  const r = await call({ contact: 'kunde@example.com', name: 'Café Test', website: '', link: LINK })
  check(r.status === 200 && r.data.ok === true, `gyldig mail: ${r.status} ${JSON.stringify(r.data)}`)
  const rows = [...r.env.DB.rows.values()]
  check(rows.length === 1 && rows[0].mail_status === 'sent', `gyldig: gemt ${JSON.stringify(rows.map((x) => x.mail_status))}`)
  check(r.env.sent.length === 1, 'gyldig: ingen mail sendt')
  const mail = r.env.sent[0]
  const text = decode(mail.raw)
  check(mail.from === 'kontakt@oviaspecs.com' && mail.to === 'modtager@example.com', 'afsender/modtager er forkert')
  check(/^Reply-To: kunde@example\.com$/m.test(mail.raw), 'Reply-To mangler ved mail')
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
  check(r.env.DB.log.some((l) => l.startsWith('cutoff:')), 'gamle henvendelser ryddes ikke op')
  const cutoff = new Date(r.env.DB.log.find((l) => l.startsWith('cutoff:')).slice(7))
  const months = (Date.now() - cutoff) / (30.44 * 24 * 3600 * 1000)
  check(Math.abs(months - inquiry.retentionMonths) < 0.2, `oprydning efter ${months.toFixed(1)} md (forventet ${inquiry.retentionMonths})`)
}

// 3. Dansk telefonnummer: ingen Reply-To, nummeret står i mailen.
{
  const r = await call({ contact: '+45 53 61 36 99', name: '', link: LINK })
  check(r.status === 200 && r.data.ok, `telefon: ${r.status}`)
  const text = decode(r.env.sent[0].raw)
  check(text.includes('Kontakt: 53613699 (telefon)') && text.includes('Navn / virksomhed: (ikke udfyldt)'), `telefon i mailen:\n${text}`)
  check(!/^Reply-To:/m.test(r.env.sent[0].raw), 'Reply-To sat ved telefonnummer')
}

// 4. Ugyldigt input: 400, intet gemt, intet sendt.
for (const contact of ['abc', '1234567', '', 'ronny@example']) {
  const r = await call({ contact, link: LINK })
  check(r.status === 400 && r.data.ok === false, `ugyldig "${contact}": ${r.status}`)
  check(r.env.DB.rows.size === 0 && r.env.sent.length === 0, `ugyldig "${contact}": gemt eller sendt alligevel`)
}
{
  const r = await call('{ikke json')
  check(r.status === 400 && r.env.DB.rows.size === 0, `ikke-JSON: ${r.status}`)
  const noLink = await call({ contact: 'kunde@example.com', link: '/priser/' })
  check(noLink.status === 400 && noLink.data.error === 'invalid_link', `link uden valg: ${noLink.status}`)
}

// 5. Honeypot: OK til robotten, men intet gemt og intet sendt.
{
  const r = await call({ contact: 'kunde@example.com', link: LINK, website: 'http://spam.example' })
  check(r.status === 200 && r.data.ok === true, `honeypot: ${r.status}`)
  check(r.env.DB.rows.size === 0 && r.env.sent.length === 0, 'honeypot: gemt eller sendt')
}

// 6. Mailen fejler: henvendelsen er stadig gemt (mail_status failed), og kunden får OK.
{
  const r = await call({ contact: 'kunde@example.com', link: LINK }, env({ mailFails: true }))
  const rows = [...r.env.DB.rows.values()]
  check(rows.length === 1 && rows[0].mail_status === 'failed', `mailfejl: ikke gemt som failed (${JSON.stringify(rows)})`)
  check(rows[0]?.summary.includes('Hjemmeside, Vækst'), 'mailfejl: opsummeringen er ikke gemt')
  check(r.status === 200 && r.data.ok === true, `mailfejl: ${r.status}`)
}

// 7. Mail ikke sat op (ingen binding): gemt som failed, OK.
{
  const e = env()
  delete e.SEND_EMAIL
  const r = await call({ contact: 'kunde@example.com', link: LINK }, e)
  check(r.status === 200 && [...e.DB.rows.values()][0]?.mail_status === 'failed', `uden mail: ${r.status}`)
}

// 8. Kan ikke gemmes: fejl, og mailen sendes ikke (kunden får nummeret i stedet).
{
  const e = env()
  delete e.DB
  const r = await call({ contact: 'kunde@example.com', link: LINK }, e)
  check(r.status === 503 && r.data.ok === false && e.sent.length === 0, `uden database: ${r.status}, ${e.sent.length} mails`)
  const f = await call({ contact: 'kunde@example.com', link: LINK }, env({ db: fakeDB({ failInsert: true }) }))
  check(f.status === 500 && f.data.ok === false && f.env.sent.length === 0, `D1-fejl: ${f.status}`)
}

// 9. Rate limit, Turnstile og fremmed origin.
{
  const r = await call({ contact: 'kunde@example.com', link: LINK }, env({ limited: true }))
  check(r.status === 429 && r.env.DB.rows.size === 0, `rate limit: ${r.status}`)
  const t = await call({ contact: 'kunde@example.com', link: LINK }, env({ TURNSTILE_SECRET: 'hemmelig' }))
  check(t.status === 403 && t.env.DB.rows.size === 0, `Turnstile uden token: ${t.status}`)
  const o = await call({ contact: 'kunde@example.com', link: LINK }, env(), { origin: 'https://evil.example' })
  check(o.status === 403 && o.env.DB.rows.size === 0, `fremmed origin: ${o.status}`)
  const g = await handleInquiry(new Request(`${ORIGIN}/api/henvendelse`), env(), { EmailMessage })
  check(g.status === 405, `GET: ${g.status}`)
}

console.error = logError
if (failures.length) {
  console.error(`Henvendelsestest FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Henvendelsestest bestået: validering, honeypot, gem-før-mail, mailfejl, rate limit, Turnstile og mailens indhold.')
