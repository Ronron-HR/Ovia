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
 *   3. rate limit pr. IP med Workers Rate Limiting-bindingen (RATE_LIMITER, ikke
 *      hukommelse) og Turnstile: uden gyldig token afvises henvendelsen. Er
 *      TURNSTILE_SECRET ikke sat, afvises alt (503), hellere end at åbne for spam.
 *   4. felterne tjekkes igen (src/inquiry.js); opsummeringen regnes ud fra linket
 *   5. henvendelsen GEMMES i D1 (DB) — først derefter sendes mailen
 *   6. mailen sendes med Cloudflare Email Routing (SEND_EMAIL, MAIL_FROM → MAIL_TO)
 *
 * Svaret er { ok: true } (200), når henvendelsen er gemt. Fejler mailen bagefter,
 * er henvendelsen stadig gemt (mail_status = 'failed'), og kunden får OK, fordi
 * intet er gået tabt. Kan den ikke gemmes, svares der med en fejl, og siden
 * beder kunden ringe. IP-adressen gemmes ikke; den bruges kun til rate limit.
 *
 * DAGLIG CRON (wrangler.jsonc: triggers.crons → scheduled → runDaily):
 *   - 'failed' (og 'pending' ældre end en time) sendes igen → 'sent' ved succes
 *   - efter MAX_RETRIES fejlede genforsøg → 'gave_up'
 *   - opsummeringsmail til MAIL_TO: opgivne henvendelser øverst (med hele
 *     teksten, indtil de har været med i en sendt opsummering), derefter
 *     døgnets henvendelser. Intet at fortælle = ingen mail.
 *   - henvendelser ældre end inquiry.retentionMonths slettes
 * Tabellen står i worker/schema.sql.
 */

const MAX_BODY = 8_000
/** Genforsøg fra den daglige cron, før en henvendelse markeres 'gave_up'. */
export const MAX_RETRIES = 3

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })

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

/**
 * Sender én mail til MAIL_TO med send_email-bindingen. Kaster ved fejl.
 * `deps.EmailMessage` (cloudflare:email) gives udefra, så testen kan køre i Node.
 */
async function sendMail(env, { subject, text, replyTo = '' }, deps) {
  if (!env.SEND_EMAIL || !env.MAIL_FROM || !env.MAIL_TO) throw new Error('mail er ikke sat op')
  const EmailMessage = deps?.EmailMessage ?? (await import('cloudflare:email')).EmailMessage
  const mime = buildMime({ from: env.MAIL_FROM, to: env.MAIL_TO, replyTo, subject, text })
  await env.SEND_EMAIL.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, mime))
}

const replyToFor = (contact) => (validEmail(contact) ? contact : '')
const errorText = (e) => String(e?.message ?? e).slice(0, 300)

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
  if (!env.TURNSTILE_SECRET) return json(503, { ok: false, error: 'not_configured' })
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, p.turnstile, ip))) return json(403, { ok: false, error: 'turnstile' })

  if (!validContact(p.contact)) return json(400, { ok: false, error: 'invalid_contact' })
  const link = canonicalLink(p.link, self.origin)
  if (!link) return json(400, { ok: false, error: 'invalid_link' })

  // 1. Gem. Uden database er der ingen garanti for, at henvendelsen ikke går tabt: fejl.
  if (!env.DB) return json(503, { ok: false, error: 'not_configured' })
  const mail = composeMail({ contact: p.contact, name: p.name, link: link.url, state: link.state })
  const id = crypto.randomUUID()
  try {
    await env.DB.prepare(
      'INSERT INTO henvendelser (id, created_at, contact, name, link, subject, summary, mail_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(id, new Date().toISOString(), p.contact, p.name, link.url, mail.subject, mail.text, 'pending')
      .run()
  } catch (e) {
    console.error('henvendelse: kunne ikke gemmes', e)
    return json(500, { ok: false, error: 'store_failed' })
  }

  // 2. Send. Fejler mailen, er henvendelsen gemt som 'failed', og den daglige cron prøver igen.
  let status = 'sent'
  let error = null
  try {
    await sendMail(env, { subject: mail.subject, text: mail.text, replyTo: replyToFor(p.contact) }, deps)
  } catch (e) {
    status = 'failed'
    error = errorText(e)
    console.error('henvendelse: mail fejlede (henvendelsen er gemt)', id, e)
  }
  try {
    await env.DB.prepare('UPDATE henvendelser SET mail_status = ?, last_error = ? WHERE id = ?').bind(status, error, id).run()
  } catch (e) {
    console.error('henvendelse: status kunne ikke skrives', id, e)
  }
  return json(200, { ok: true })
}

/* ---- Daglig cron --------------------------------------------------------- */

const fmtTime = (iso) =>
  new Date(iso).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen', dateStyle: 'short', timeStyle: 'short' })

const STATUS = { pending: 'ikke sendt endnu', sent: 'mail sendt', failed: 'mail fejlede, prøves igen', gave_up: 'OPGIVET' }
const count = (n) => `${n} ${n === 1 ? 'henvendelse' : 'henvendelser'}`

/** Den daglige opsummering: opgivne henvendelser øverst (hele teksten), derefter døgnets henvendelser. */
export function composeDigest({ gaveUp, recent, now = new Date() }) {
  const day = now.toLocaleDateString('da-DK', { timeZone: 'Europe/Copenhagen', dateStyle: 'long' })
  const text = []
  if (gaveUp.length) {
    text.push(
      `OPGIVET: ${count(gaveUp.length)}, hvor mailen ikke kunne sendes efter ${MAX_RETRIES} genforsøg.`,
      'Svar kunden direkte. Hele henvendelsen står herunder.',
      '',
    )
    for (const r of gaveUp) {
      text.push(`=== ${fmtTime(r.created_at)} · ${r.contact} · sidste fejl: ${r.last_error ?? 'ukendt'} ===`, r.summary, '')
    }
  }
  text.push(`Seneste døgn: ${count(recent.length)}`)
  for (const r of recent) {
    text.push(`- ${fmtTime(r.created_at)} · ${r.contact}${r.name ? ` · ${r.name}` : ''} · ${STATUS[r.mail_status] ?? r.mail_status}`)
  }
  return {
    subject: `${gaveUp.length ? `OPGIVET (${gaveUp.length}) · ` : ''}Daglig opsummering ${day}: ${count(recent.length)}`,
    text: text.join('\n'),
  }
}

/** Den daglige cron: genforsøg, opgivelse, opsummering og oprydning. */
export async function runDaily(env, deps, now = new Date()) {
  if (!env.DB) return { skipped: 'no_db' }
  const db = env.DB
  const ago = (ms) => new Date(now.getTime() - ms).toISOString()

  // 1. Genforsøg: fejlede og hængende (pending i over en time).
  const { results: due } = await db
    .prepare("SELECT * FROM henvendelser WHERE mail_status = 'failed' OR (mail_status = 'pending' AND created_at < ?) ORDER BY created_at")
    .bind(ago(3600_000))
    .all()
  let resent = 0
  for (const r of due) {
    const retries = r.retries + 1
    try {
      await sendMail(env, { subject: r.subject, text: r.summary, replyTo: replyToFor(r.contact) }, deps)
      await db.prepare("UPDATE henvendelser SET mail_status = 'sent', retries = ?, last_error = NULL WHERE id = ?").bind(retries, r.id).run()
      resent++
    } catch (e) {
      const status = retries >= MAX_RETRIES ? 'gave_up' : 'failed'
      await db
        .prepare('UPDATE henvendelser SET mail_status = ?, retries = ?, last_error = ? WHERE id = ?')
        .bind(status, retries, errorText(e), r.id)
        .run()
    }
  }

  // 2. Opsummering. Opgivne kommer med, indtil en opsummering faktisk er sendt.
  const { results: gaveUp } = await db
    .prepare("SELECT * FROM henvendelser WHERE mail_status = 'gave_up' AND reported_at IS NULL ORDER BY created_at")
    .all()
  const { results: recent } = await db
    .prepare('SELECT created_at, contact, name, mail_status FROM henvendelser WHERE created_at >= ? ORDER BY created_at DESC')
    .bind(ago(24 * 3600_000))
    .all()
  let digest = 'none'
  if (gaveUp.length || recent.length) {
    try {
      await sendMail(env, composeDigest({ gaveUp, recent, now }), deps)
      for (const r of gaveUp) {
        await db.prepare('UPDATE henvendelser SET reported_at = ? WHERE id = ?').bind(now.toISOString(), r.id).run()
      }
      digest = 'sent'
    } catch (e) {
      digest = 'failed'
      console.error('opsummering: mail fejlede', e)
    }
  }

  // 3. Opbevaring: ældre henvendelser end retentionMonths slettes.
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - inquiry.retentionMonths)
  await db.prepare('DELETE FROM henvendelser WHERE created_at < ?').bind(cutoff.toISOString()).run()
  return { retried: due.length, resent, gaveUp: gaveUp.length, digest }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === inquiry.endpoint) return handleInquiry(request, env)
    if (pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not_found' })
    return env.ASSETS.fetch(request)
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runDaily(env).then((r) => console.log('daglig cron', JSON.stringify(r))))
  },
}
