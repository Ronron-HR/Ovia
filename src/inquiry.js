import { composeCalcParts, composeParts, inquiry, mailtoFrom } from './content.js'

/**
 * HENVENDELSER — fælles for formularerne og for worker/index.js.
 *
 * Reglerne for felterne står her, så klienten og serveren validerer ens. Klienten
 * viser fejlene ved feltet; serveren stoler aldrig på klienten og tjekker igen.
 *
 * Kun sendForm() rører window/fetch, og kun når den kaldes (aldrig under
 * forudrendering).
 */

export const LIMITS = { name: 120, email: 200, phone: 40, company: 160, message: 4000 }

const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/
const PHONE = /^[+\d][\d\s()+-]{5,}$/

/** @returns {Record<string,string>} fejlbeskeder pr. felt; tomt objekt = gyldigt. */
export function validateInquiry(v, { messageRequired = false } = {}) {
  const e = inquiry.errors
  const errors = {}
  const name = (v.name ?? '').trim()
  const email = (v.email ?? '').trim()
  const phone = (v.phone ?? '').trim()
  const message = (v.message ?? '').trim()

  if (!name) errors.name = e.name
  else if (name.length > LIMITS.name) errors.name = e.tooLong
  if (!email) errors.email = e.email
  else if (!EMAIL.test(email) || email.length > LIMITS.email) errors.email = e.emailInvalid
  if (phone && (!PHONE.test(phone) || phone.length > LIMITS.phone)) errors.phone = e.phone
  if (messageRequired && !message) errors.message = e.message
  if (message.length > LIMITS.message) errors.message = e.tooLong
  if ((v.company ?? '').length > LIMITS.company) errors.company = e.tooLong
  return errors
}

/** Felter fra en formular samlet til ét objekt (samme form på klient og server). */
export function normalize(raw) {
  const s = (x, max) => String(x ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max)
  const calc = raw.calc ?? {}
  return {
    source: raw.source === 'beregner' ? 'beregner' : 'kontakt',
    topic: s(raw.topic, 40),
    name: s(raw.name, LIMITS.name),
    email: s(raw.email, LIMITS.email),
    phone: s(raw.phone, LIMITS.phone),
    company: s(raw.company, LIMITS.company),
    message: s(raw.message, LIMITS.message),
    calc: {
      type: s(calc.type, 20),
      purpose: s(calc.purpose, 20),
      pages: s(calc.pages, 20),
      demo: s(calc.demo, 20),
    },
  }
}

/** Emne og tekst til mailen (samme tekst i reservemailen og i den, serveren sender). */
export function composeInquiry(p) {
  if (p.source === 'beregner') {
    return composeCalcParts({ ...p.calc, name: p.name, email: p.email, phone: p.phone, wishes: p.message })
  }
  return composeParts(p)
}

export const mailtoFromInquiry = (p) => mailtoFrom(composeInquiry(p))

/**
 * Sender til /api/kontakt. Returnerer:
 *   { status: 'sent' }                  serveren har accepteret beskeden
 *   { status: 'invalid', errors }       serveren afviste felterne
 *   { status: 'unavailable' }           afsendelse er ikke sat op (503/501/404)
 *   { status: 'failed', tooFast? }      netværk eller serverfejl
 * "sent" returneres kun ved et svar med ok: true.
 */
export async function sendForm(payload, { openedAt }) {
  let res
  try {
    res = await fetch('/api/kontakt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, openedAt }),
    })
  } catch {
    return { status: 'failed' }
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    /* ikke JSON: behandles nedenfor */
  }
  if (res.ok && data?.ok === true) return { status: 'sent' }
  if (res.status === 400 && data?.errors) return { status: 'invalid', errors: data.errors }
  if (res.status === 429) return { status: 'failed', tooFast: true }
  if ([404, 405, 501, 503].includes(res.status)) return { status: 'unavailable' }
  return { status: 'failed' }
}
