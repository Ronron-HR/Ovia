import { calculator, formatKr } from './data/pricing.js'
import { privacy } from './data/texts.js'
import { NONE, parse, priceParts, quote, quoteNotes, serialize, summaryLines } from './calculator.js'

/**
 * HENVENDELSER FRA PRISBEREGNEREN — fælles for formularen (SendQuote.jsx) og
 * workeren (worker/index.js), så browser og server validerer ens. Serveren
 * stoler aldrig på browseren: den tjekker felterne igen og regner selv
 * opsummeringen ud fra linket (adresselinjen), så mailen altid passer med
 * beregneren.
 *
 * Kun sendInquiry() rører fetch, og kun når den kaldes.
 */

export const inquiry = {
  /** Hvor længe en henvendelse gemmes (D1), før workeren sletter den. Samme tal som i privatlivspolitikken. */
  retentionMonths: privacy.retentionMonths,
  endpoint: '/api/henvendelse',
  title: 'Få tilbuddet sendt',
  contactLabel: 'Din mail eller dit telefonnummer',
  nameLabel: 'Navn / virksomhed',
  optional: '(valgfrit)',
  submit: 'Send til Ronny',
  sending: 'Sender …',
  /** UDFYLDES AF RONNY: hvornår du svarer (fx "inden for en hverdag"). Må ikke gå live sådan. */
  thanks: 'Tak. Jeg svarer [UDFYLDES AF RONNY].',
  /** Fejl: telefonnummeret sættes ind mellem de to dele (contact.phone). */
  failed: 'Det blev ikke sendt. Ring på',
  failedAfter: ', så tager jeg den derfra.',
  invalid: 'Skriv en gyldig mail eller et dansk telefonnummer (8 cifre).',
  /** Linjen under knappen: hvad oplysningerne bruges til. */
  privacy: 'Bruges kun til at svare dig.',
  privacyLink: 'Privatlivspolitik',
  mailSubject: (contact) => `Tilbud fra prisberegneren: ${contact}`,
}

export const LIMITS = { contact: 200, name: 160, link: 600 }

const EMAIL = /^[^\s@<>"',;()]+@[^\s@<>"',;()]+\.[^\s@<>"',;()]{2,}$/

/** Dansk nummer: 8 cifre, evt. med +45 eller 0045 foran. Mellemrum, punktum og bindestreg tillades. */
export function danishPhone(value) {
  const digits = String(value).replace(/[\s.-]/g, '')
  const m = /^(?:\+45|0045)?(\d{8})$/.exec(digits)
  return m ? m[1] : null
}

export const validEmail = (value) => EMAIL.test(value) && value.length <= LIMITS.contact

/** Gyldig mail ELLER dansk telefonnummer. */
export const validContact = (value) => {
  const v = String(value ?? '').trim()
  return Boolean(v) && (validEmail(v) || Boolean(danishPhone(v)))
}

/** Felterne renset (samme på klient og server). */
export function normalize(raw) {
  const s = (x, max) => String(x ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max)
  return {
    contact: s(raw?.contact, LIMITS.contact),
    name: s(raw?.name, LIMITS.name),
    link: s(raw?.link, LIMITS.link),
    honeypot: s(raw?.website, 200),
    turnstile: s(raw?.turnstile, 4096),
  }
}

/** Sider med beregneren; et link til andre stier peger på /priser/. */
const CALC_PATHS = ['/', '/hjemmeside/', '/marketing/', '/booking-google/', '/priser/']

/**
 * Linket til beregnerens resultat, bygget forfra ud fra det, kunden sendte:
 * kun kendte sider og kun gyldige svar. `null`, hvis der ikke er et resultat.
 */
export function canonicalLink(link, origin) {
  let url
  try {
    url = new URL(link, origin)
  } catch {
    return null
  }
  const state = parse(url.search, NONE)
  if (!state.selected.length) return null
  const path = CALC_PATHS.includes(url.pathname) ? url.pathname : '/priser/'
  const search = serialize({ ...state, step: state.selected.length + 1 }, NONE)
  return { url: `${origin}${path}${search}#beregner`, state }
}

/** Mailen til Ronny: kontakt, navn, opsummering med pakker, nu/pr. md og linket. */
export function composeMail({ contact, name, link, state }) {
  const q = quote(state)
  const { once, month } = priceParts(q.total)
  const phone = danishPhone(contact)
  return {
    subject: inquiry.mailSubject(contact),
    text: [
      'Ny henvendelse fra prisberegneren på oviaspecs.com',
      '',
      `Kontakt: ${phone ? `${phone} (telefon)` : `${contact} (mail)`}`,
      `Navn / virksomhed: ${name || '(ikke udfyldt)'}`,
      '',
      'Opsummering:',
      ...summaryLines(q).map((s) => `- ${s}`),
      '',
      `Nu: ${once || formatKr(0)}`,
      `Pr. md: ${month || `${formatKr(0)}/md`}`,
      ...(quoteNotes(q).length ? ['', ...quoteNotes(q)] : []),
      ...(calculator.finalNote ? ['', calculator.finalNote] : []),
      '',
      `Link til beregningen: ${link}`,
    ].join('\n'),
  }
}

/**
 * Sender henvendelsen. `true` KUN når serveren har svaret 200 med { ok: true };
 * alt andet (netværk, 4xx, 5xx, ikke-JSON) er `false`.
 */
export async function sendInquiry(payload) {
  try {
    const res = await fetch(inquiry.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    return res.ok && data?.ok === true
  } catch {
    return false
  }
}
