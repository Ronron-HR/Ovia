import prices from './data/prices.json' with { type: 'json' }
import { NBSP, formatKr, fromQuery, isComplete, isOldLink, toQuery } from './lib/calculate.js'
import { buildReceipt, specId } from './lib/receipt.js'
import { retentionMonths } from './data/site.js'

/**
 * FORESPØRGSLER FRA BEREGNEREN — fælles for formularen (components/calculator/InquiryForm.jsx) og
 * workeren (worker/index.js), så browser og server validerer ens.
 *
 * Serveren stoler aldrig på browseren: den tjekker felterne igen og regner selv kvitteringen ud af valgene i linket
 * med calculate.js (lib/receipt.js), inkl. om introprisen gælder (kun mens prices.introSlotsLeft > 0). Tal fra
 * browseren bruges ikke.
 *
 * Ren JavaScript uden React og uden adgang til window; kun sendInquiry() rører fetch.
 */

export const inquiry = {
  /** Hvor længe en forespørgsel gemmes (D1), før workeren sletter den. Samme tal som i privatlivspolitikken. */
  retentionMonths,
  endpoint: '/api/henvendelse',
}

/** Svar til en klient, der sender et link fra før pakkerne (en cachet side): en venlig besked, ikke en fejl. */
export const OLD_LINK_MESSAGE = 'Beregneren er opdateret med nye pakker. Åbn siden igen og vælg dit tilbud på ny.'

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
  if (!p.phone && !p.email) return { field: 'phone', message: 'Skriv et telefonnummer eller en mail, så vi kan svare.' }
  if (p.phone && !danishPhone(p.phone)) return { field: 'phone', message: 'Skriv et dansk telefonnummer med 8 cifre.' }
  if (p.email && !validEmail(p.email)) return { field: 'email', message: 'Skriv en gyldig mailadresse.' }
  return null
}

/**
 * Linket til valgene, bygget forfra ud fra det, kunden sendte: kun gyldige svar (fromQuery), altid på forsiden.
 * `{ old: true }` for et gammelt link (fra før pakkerne), `null` hvis valget ikke er færdigt (hjemmeside: ingen pakke; system alene: ingen funktion).
 */
export function canonicalLink(link, origin, cfg = prices) {
  let url
  try {
    url = new URL(link, origin)
  } catch {
    return null
  }
  if (isOldLink(url.search)) return { old: true }
  const { selection } = fromQuery(url.search, cfg)
  if (!isComplete(selection, cfg)) return null
  return { url: `${origin}/?${toQuery(selection, 'sum')}#prisberegner`, selection }
}

const plain = (s) => String(s).replace(/ /g, ' ')

/**
 * Mailen til Ronny. Emne: "Ny forespørgsel: [navn], [virksomhed] – [engang] + [md]".
 * Indhold: kontakt, besked, hvad de har brug for (hjemmeside, system eller begge), pakke og funktioner med priser, om introprisen er valgt, totaler ekskl. moms og
 * del-linket. Er introprisen valgt (og der er pladser), står nederst, hvordan en plads tælles ned (npm run intro:brugt).
 */
export function composeMail({ name, company = '', phone = '', email = '', message = '', link, selection }, cfg = prices) {
  const rc = buildReceipt(selection, cfg)
  const who = company ? `${name}, ${company}` : name
  const subject = rc.quoteOnly ? `Ny forespørgsel: ${who} – pris aftales` : `Ny forespørgsel: ${who} – ${plain(formatKr(rc.o))} + ${plain(formatKr(rc.m, true))}`
  const line = (l) => `- ${plain(l.label)} – ${plain(l.pkg)}: ${plain(l.price)}`
  const hasSystem = rc.all.some((l) => l.key.startsWith('sys-')) // kun bordbooking og online bestilling har abonnementer hos andre
  const left = cfg.introSlotsLeft
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
      `Hvad de har brug for: ${rc.pathText}`,
      `Valg (${specId(selection, cfg)}):`,
      ...rc.all.map(line),
      '',
      ...(rc.quoteOnly
        ? ['Pris: aftales (kun noget bygget specielt er valgt).']
        : [
            `Engang: ${plain(formatKr(rc.o))}${rc.introApplied ? ` (normalpris ${plain(formatKr(rc.onceNormal))})` : ''}`,
            `Pr. måned: ${plain(formatKr(rc.m, true))}`,
            'Alle priser er ekskl. moms.',
          ]),
      ...(rc.introApplied ? ['Introduktionspris: valgt (siden må vises som case).'] : []),
      ...(hasSystem ? [cfg.systems.thirdParty] : []),
      '',
      `Se valgene: ${link}`,
      ...(rc.introApplied ? ['', `Intropris valgt. Lander du kunden, så kør: npm run intro:brugt (${left} ${left === 1 ? 'plads' : 'pladser'} tilbage nu).`] : []),
    ].join('\n'),
  }
}

/**
 * Sender forespørgslen. { ok: true } KUN når serveren har svaret 200 med { ok: true };
 * alt andet (netværk, 4xx, 5xx, ikke-JSON) er { ok: false, status, error }.
 */
export async function sendInquiry(payload) {
  try {
    const res = await fetch(inquiry.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    return res.ok && data?.ok === true ? { ok: true } : { ok: false, status: res.status, error: data?.error }
  } catch {
    return { ok: false, status: 0 }
  }
}

export { NBSP }
