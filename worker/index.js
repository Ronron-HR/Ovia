import { site } from '../src/content.js'
import { composeInquiry, normalize, validateInquiry } from '../src/inquiry.js'

/**
 * AFSENDELSE AF HENVENDELSER (Cloudflare Worker)
 *
 * Siden er statiske filer (dist/). Kun POST /api/kontakt rammer denne worker
 * (wrangler.jsonc: assets.run_worker_first). Alt andet serveres direkte som
 * statiske filer.
 *
 * Formularerne (kontaktsiden og efter prisberegneren) sender JSON hertil. Workeren
 *   1. afviser alt andet end POST fra siden selv (same origin) og for store beskeder,
 *   2. tjekker felterne igen (samme regler som klienten, src/inquiry.js),
 *   3. afviser spam: skjult felt (honeypot) og en formular, der sendes for hurtigt,
 *   4. sender mailen til Ronny, med kundens e-mail som Reply-To.
 *
 * Svaret er kun { ok: true } (200), når mailen er ACCEPTERET af afsendelsestjenesten.
 * Er ingen tjeneste sat op, svarer workeren 503 { ok: false, error: 'not_configured' },
 * og siden viser da, at beskeden ikke er sendt, og tilbyder mailprogram/kopiering.
 *
 * AFSENDELSESTJENESTE (vælg én; ingen er sat op endnu, se README):
 *   A. Cloudflare Email Routing + send_email-binding (gratis, ingen nøgle):
 *      bindingen SEND_EMAIL (wrangler.jsonc) og variablen MAIL_FROM (en adresse på
 *      domænet, fx kontakt@oviaspecs.com). Kræver, at Email Routing er slået til
 *      for domænet, og at modtageradressen er bekræftet dér.
 *   B. Resend (kræver konto og nøgle): hemmeligheden RESEND_API_KEY og MAIL_FROM
 *      (en adresse på et bekræftet domæne).
 * Modtager: MAIL_TO, ellers adressen fra site.email.
 *
 * Valgfrit: en rate limiting-binding RATE_LIMITER ({ limit({ key }) }) bremser misbrug pr. IP.
 */

const MAX_BODY = 20_000
const MIN_FILL_MS = 2_000
const MAX_FILL_MS = 24 * 60 * 60 * 1000

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })

const clean = (s) => String(s).replace(/[\r\n]+/g, ' ').trim()

/** RFC 2047: emnelinjen med æ, ø, å sendes som UTF-8 i base64. */
const encodeHeader = (s) => `=?UTF-8?B?${toBase64(new TextEncoder().encode(s))}?=`

function toBase64(bytes) {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** Den rå mail (MIME), som Cloudflares send_email-binding forventer. */
export function buildMime({ from, to, replyTo, subject, text, now = new Date(), id = crypto.randomUUID() }) {
  const domain = from.split('@')[1] ?? 'oviaspecs.com'
  const body = toBase64(new TextEncoder().encode(text)).replace(/.{1,76}/g, '$&\r\n')
  return [
    `From: OviaSpecs <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].join('\r\n')
}

async function deliver(env, { replyTo, subject, text }) {
  const to = env.MAIL_TO || site.email
  const from = env.MAIL_FROM

  if (env.SEND_EMAIL && from) {
    const { EmailMessage } = await import('cloudflare:email')
    await env.SEND_EMAIL.send(new EmailMessage(from, to, buildMime({ from, to, replyTo, subject, text })))
    return true
  }

  if (env.RESEND_API_KEY && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `OviaSpecs <${from}>`, to: [to], reply_to: replyTo, subject, text }),
    })
    if (!res.ok) throw new Error(`Resend ${res.status}`)
    return true
  }

  return false
}

export async function handleContact(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, { Allow: 'POST' })

  // Kun fra siden selv.
  const origin = request.headers.get('Origin')
  if (origin) {
    let same = false
    try {
      same = new URL(origin).host === new URL(request.url).host
    } catch {
      /* "null" eller ugyldig oprindelse */
    }
    if (!same) return json(403, { ok: false, error: 'origin' })
  }

  const length = Number(request.headers.get('Content-Length') ?? 0)
  if (length > MAX_BODY) return json(413, { ok: false, error: 'too_large' })

  let raw
  try {
    const text = await request.text()
    if (text.length > MAX_BODY) return json(413, { ok: false, error: 'too_large' })
    raw = JSON.parse(text)
  } catch {
    return json(400, { ok: false, error: 'bad_json' })
  }
  if (!raw || typeof raw !== 'object') return json(400, { ok: false, error: 'bad_json' })

  // Spam: et udfyldt skjult felt er en robot. Den får et almindeligt svar uden at få noget sendt.
  if (String(raw.website ?? '').trim()) return json(200, { ok: true })

  // Formularen sender altid, hvornår den kom frem. Mangler det, eller er det i fremtiden
  // eller for gammelt, kommer beskeden ikke fra siden: afvises.
  const opened = Number(raw.openedAt)
  const age = Date.now() - opened
  if (!Number.isFinite(opened) || age < 0 || age > MAX_FILL_MS) return json(400, { ok: false, error: 'bad_request' })
  if (age < MIN_FILL_MS) return json(429, { ok: false, error: 'too_fast' })

  if (env.RATE_LIMITER) {
    const key = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    const { success } = await env.RATE_LIMITER.limit({ key })
    if (!success) return json(429, { ok: false, error: 'rate_limited' })
  }

  const p = normalize(raw)
  const errors = validateInquiry(p, { messageRequired: p.source === 'kontakt' })
  if (Object.keys(errors).length) return json(400, { ok: false, errors })

  const { subject, body } = composeInquiry(p)
  const message = {
    replyTo: clean(p.email),
    subject: clean(subject),
    text: body,
  }

  try {
    const sent = await deliver(env, message)
    if (!sent) return json(503, { ok: false, error: 'not_configured' })
  } catch {
    return json(502, { ok: false, error: 'delivery_failed' })
  }
  return json(200, { ok: true })
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/kontakt') return handleContact(request, env)
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 })
  },
}
