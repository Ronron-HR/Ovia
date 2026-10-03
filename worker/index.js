import { canonicalLink, composeMail, inquiry, normalize, validContact, validEmail } from '../src/inquiry.js'

/**
 * HENVENDELSER FRA PRISBEREGNEREN (Cloudflare Worker)
 *
 * Siden er statiske filer (dist/). Kun /api/* rammer denne worker
 * (wrangler.jsonc: assets.run_worker_first); alt andet serveres direkte.
 *
 * POST /api/henvendelse:
 *   1. kun POST fra siden selv (same origin), højst 8 kB JSON
 *   2. honeypot: et udfyldt skjult felt får et almindeligt OK, men intet gemmes eller sendes
 *   3. rate limit pr. IP (RATE_LIMITER) og Turnstile, når TURNSTILE_SECRET er sat
 *   4. felterne tjekkes igen (src/inquiry.js); opsummeringen regnes ud fra linket
 *   5. henvendelsen GEMMES i D1 (DB) — først derefter sendes mailen
 *   6. mailen sendes med Cloudflare Email Routing (SEND_EMAIL, MAIL_FROM → MAIL_TO)
 *
 * Svaret er { ok: true } (200), når henvendelsen er gemt. Fejler mailen bagefter,
 * er henvendelsen stadig gemt (mail_status = 'failed'), og kunden får OK, fordi
 * intet er gået tabt. Kan den ikke gemmes, svares der med en fejl, og siden
 * beder kunden ringe. Henvendelser ældre end inquiry.retentionMonths slettes.
 * IP-adressen gemmes ikke; den bruges kun til rate limit.
 */

const MAX_BODY = 8_000

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })

const SCHEMA = `CREATE TABLE IF NOT EXISTS henvendelser (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  contact TEXT NOT NULL,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  summary TEXT NOT NULL,
  mail_status TEXT NOT NULL
)`

/** RFC 2047: emnelinjen med æ, ø, å sendes som UTF-8 i base64. */
const encodeHeader = (s) => `=?UTF-8?B?${toBase64(new TextEncoder().encode(s))}?=`

function toBase64(bytes) {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** Den rå mail (MIME), som send_email-bindingen forventer. */
export function buildMime({ from, to, replyTo, subject, text, now = new Date(), id = crypto.randomUUID() }) {
  const domain = from.split('@')[1]
  const body = toBase64(new TextEncoder().encode(text)).replace(/.{1,76}/g, '$&\r\n')
  return [
    `From: OviaSpecs <${from}>`,
    `To: ${to}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
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

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
    return (await res.json()).success === true
  } catch {
    return false
  }
}

/**
 * `deps.EmailMessage` (cloudflare:email) gives udefra, så testen
 * (scripts/test-inquiry.mjs) kan køre handleren i Node.
 */
export async function handleInquiry(request, env, deps) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, { Allow: 'POST' })

  const self = new URL(request.url)
  const origin = request.headers.get('Origin')
  if (origin && origin !== self.origin) return json(403, { ok: false, error: 'origin' })

  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return json(413, { ok: false, error: 'too_large' })
  let raw
  try {
    const text = await request.text()
    if (text.length > MAX_BODY) return json(413, { ok: false, error: 'too_large' })
    raw = JSON.parse(text)
  } catch {
    return json(400, { ok: false, error: 'bad_json' })
  }
  if (!raw || typeof raw !== 'object') return json(400, { ok: false, error: 'bad_json' })
  const p = normalize(raw)

  // Spam: en robot har udfyldt det skjulte felt. Den får OK, men intet gemmes eller sendes.
  if (p.honeypot) return json(200, { ok: true })

  const ip = request.headers.get('CF-Connecting-IP') ?? ''
  if (env.RATE_LIMITER) {
    const { success } = await env.RATE_LIMITER.limit({ key: ip || 'ukendt' })
    if (!success) return json(429, { ok: false, error: 'rate_limited' })
  }
  if (env.TURNSTILE_SECRET && !(await verifyTurnstile(env.TURNSTILE_SECRET, p.turnstile, ip))) {
    return json(403, { ok: false, error: 'turnstile' })
  }

  if (!validContact(p.contact)) return json(400, { ok: false, error: 'invalid_contact' })
  const link = canonicalLink(p.link, self.origin)
  if (!link) return json(400, { ok: false, error: 'invalid_link' })

  // 1. Gem. Uden database er der ingen garanti for, at henvendelsen ikke går tabt: fejl.
  if (!env.DB) return json(503, { ok: false, error: 'not_configured' })
  const mail = composeMail({ contact: p.contact, name: p.name, link: link.url, state: link.state })
  const id = crypto.randomUUID()
  try {
    await env.DB.prepare(SCHEMA).run()
    await env.DB.prepare(
      'INSERT INTO henvendelser (id, created_at, contact, name, link, summary, mail_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(id, new Date().toISOString(), p.contact, p.name, link.url, mail.text, 'pending')
      .run()
  } catch (e) {
    console.error('henvendelse: kunne ikke gemmes', e)
    return json(500, { ok: false, error: 'store_failed' })
  }

  // 2. Send. Fejler mailen, er henvendelsen gemt; status skrives, så den kan findes i D1.
  let status = 'sent'
  try {
    if (!env.SEND_EMAIL || !env.MAIL_FROM || !env.MAIL_TO) throw new Error('mail er ikke sat op')
    const EmailMessage = deps?.EmailMessage ?? (await import('cloudflare:email')).EmailMessage
    const replyTo = validEmail(p.contact) ? p.contact : ''
    const mime = buildMime({ from: env.MAIL_FROM, to: env.MAIL_TO, replyTo, subject: mail.subject, text: mail.text })
    await env.SEND_EMAIL.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, mime))
  } catch (e) {
    status = 'failed'
    console.error('henvendelse: mail fejlede (henvendelsen er gemt)', id, e)
  }

  try {
    await env.DB.prepare('UPDATE henvendelser SET mail_status = ? WHERE id = ?').bind(status, id).run()
    // Opbevaring: ældre henvendelser end retentionMonths slettes.
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - inquiry.retentionMonths)
    await env.DB.prepare('DELETE FROM henvendelser WHERE created_at < ?').bind(cutoff.toISOString()).run()
  } catch (e) {
    console.error('henvendelse: status/oprydning fejlede', id, e)
  }
  return json(200, { ok: true })
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === inquiry.endpoint) return handleInquiry(request, env)
    if (pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not_found' })
    return env.ASSETS.fetch(request)
  },
}
