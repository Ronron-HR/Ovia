import prices from './data/prices.json' with { type: 'json' }
import { fromQuery, formatKr, toQuery } from './lib/calculate.js'
import { buildReceipt, specId } from './lib/receipt.js'
import { retentionMonths } from './data/site.js'

/**
 * FORESPØRGSLER FRA BEREGNEREN — fælles for formularen (components/calculator/InquiryForm.jsx) og
 * workeren (worker/index.js), så browser og server validerer ens.
 *
 * Serveren stoler aldrig på browseren: den tjekker felterne igen og regner selv kvitteringen ud af
 * valgene i linket med calculate.js (lib/receipt.js). Tal fra browseren bruges ikke.
 *
 * Ren JavaScript uden React og uden adgang til window; kun sendInquiry() rører fetch.
 */

export const inquiry = {
  /** Hvor længe en forespørgsel gemmes (D1), før workeren sletter den. Samme tal som i privatlivspolitikken. */
  retentionMonths,
  endpoint: '/api/henvendelse',
}

/** Længste tegn pr. felt. Besked højst 1.000 tegn. MAX_BODY i worker/index.js skal kunne rumme dem alle. */
export const LIMITS = { name: 160, phone: 40, email: 200, company: 160, link: 600, message: 1000 }

const EMAIL = /^[^\s@<>"',;()]+@[^\s@<>"',;()]+\.[^\s@<>"',;()]{2,}$/

/** Dansk nummer: 8 cifre, evt. med +45 eller 0045 foran. Mellemrum, punktum og bindestreg tillades. */
export function danishPhone(value) {
  const digits = String(value ?? '').replace(/[\s.-]/g, '')
  const m = /^(?:\+45|0045)?(\d{8})$/.exec(digits)
  return m ? m[1] : null
}

export const validEmail = (value) => EMAIL.test(value) && value.length <= LIMITS.email

/** Beskeden: linjeskift bevares (højst to i træk), øvrige styretegn fjernes, højst LIMITS.message tegn. */
export function cleanMessage(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    // oxlint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, LIMITS.message)
}

/** Felterne renset (samme på klient og server). `website` er honeypot'en, `turnstile` en valgfri token. */
export function normalize(raw) {
  const s = (x, max) => String(x ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max)
  return {
    name: s(raw?.name, LIMITS.name),
    phone: s(raw?.phone, LIMITS.phone),
    email: s(raw?.email, LIMITS.email),
    company: s(raw?.company, LIMITS.company),
    message: cleanMessage(raw?.message),
    link: s(raw?.link, LIMITS.link),
    honeypot: s(raw?.website, 200),
    turnstile: s(raw?.turnstile, 4096),
  }
}

/**
 * Tjekker felterne. Returnerer { field, message } for den første fejl, ellers null.
 * Navn er påkrævet; telefon eller mail (mindst én) er påkrævet; udfyldte felter skal være gyldige.
 */
export function validate(p) {
  if (!p.name) return { field: 'name', message: 'Skriv dit navn.' }
  if (!p.phone && !p.email) return { field: 'phone', message: 'Skriv et telefonnummer eller en mail, så jeg kan svare.' }
  if (p.phone && !danishPhone(p.phone)) return { field: 'phone', message: 'Skriv et dansk telefonnummer med 8 cifre.' }
  if (p.email && !validEmail(p.email)) return { field: 'email', message: 'Skriv en gyldig mailadresse.' }
  return null
}

/**
 * Linket til valgene, bygget forfra ud fra det, kunden sendte: kun gyldige svar (fromQuery),
 * altid på forsiden. `null`, hvis der ikke er valgt noget.
 */
export function canonicalLink(link, origin) {
  let url
  try {
    url = new URL(link, origin)
  } catch {
    return null
  }
  const { selection } = fromQuery(url.search)
  if (!Object.values(selection.services).some((v) => v !== null)) return null
  return { url: `${origin}/?${toQuery(selection, 4)}#prisberegner`, selection }
}

const plain = (s) => String(s).replace(/ /g, ' ')

/**
 * Mailen til Ronny. Emne: "Ny forespørgsel: [navn], [virksomhed] – [engang] + [md]".
 * Indhold: kontakt, besked, alle valgte linjer med priser, totaler ekskl. moms og del-linket.
 */
export function composeMail({ name, company = '', phone = '', email = '', message = '', link, selection }) {
  const rc = buildReceipt(selection)
  const who = company ? `${name}, ${company}` : name
  const subject = `Ny forespørgsel: ${who} – ${plain(formatKr(rc.o))} + ${plain(formatKr(rc.m, true))}`
  const line = (l) => `- ${plain(l.label)} – ${plain(l.pkg)}: ${plain(l.price)}`
  return {
    subject,
    text: [
      'Ny forespørgsel fra oviaspecs.com (en forespørgsel, ikke en bestilling)',
      '',
      `Navn: ${name}`,
      `Virksomhed: ${company || '(ikke udfyldt)'}`,
      `Telefon: ${phone ? danishPhone(phone) : '(ikke udfyldt)'}`,
      `Mail: ${email || '(ikke udfyldt)'}`,
      ...(message ? ['', 'Besked (hver linje starter med >):', ...message.split('\n').map((l) => `> ${l}`)] : []),
      '',
      `Valg (${specId(selection)}):`,
      ...rc.all.map(line),
      '',
      `Engang: ${plain(formatKr(rc.o))}`,
      `Pr. måned: ${plain(formatKr(rc.m, true))}`,
      'Alle priser er ekskl. moms.',
      ...(rc.all.some((l) => l.key === 'book' || l.key === 'bookingAddon') ? [prices.addons.booking.note] : []),
      '',
      `Se valgene: ${link}`,
    ].join('\n'),
  }
}

/**
 * Sender forespørgslen. { ok: true } KUN når serveren har svaret 200 med { ok: true };
 * alt andet (netværk, 4xx, 5xx, ikke-JSON) er { ok: false, status }.
 */
export async function sendInquiry(payload) {
  try {
    const res = await fetch(inquiry.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    return res.ok && data?.ok === true ? { ok: true } : { ok: false, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
