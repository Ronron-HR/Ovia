/* =========================================================================
   TEKSTER TIL YDELSESSIDERNE (/hjemmeside/, /marketing/, /booking-google/)
   Priser, pakkeindhold og vilkår hentes fra pricing.js og står ikke her.

   Regler: jeg-form. Ingen opdigtede tal, resultater eller statistikker og
   ingen løfter om flere kunder eller mere salg. Lov kun det, der leveres.
   ========================================================================= */

import { contact, formatKr, paidStartText, priceNote, services, tierName } from './pricing.js'
import { paths } from './texts.js'

const web = services.hjemmeside
/** "Start koster 3.000 kr., Vækst 5.500 kr. og Fuld fart 8.500 kr." (altid med punktum til sidst). */
const tierList = (service, unit = '') => {
  const parts = service.tiers.map((t) => `${tierName(t)} ${formatKr(t.price)}${unit}`)
  const s = `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`.replace(/^(\S+)/, '$1 koster')
  return s.endsWith('.') ? s : `${s}.`
}

/** "Hvornår kan vi starte?" — skjules, når paidStartText er tom. */
const startFaq = paidStartText ? [{ q: 'Hvornår kan vi starte?', a: paidStartText }] : []

const toCalculator = { label: 'Beregn din pris', href: paths.priser }

/* ---- Hjemmeside -------------------------------------------------------- */

const monthlies = [...new Set(web.tiers.map((t) => t.monthly))]

export const hjemmeside = {
  service: 'hjemmeside',
  meta: {
    title: 'Hjemmeside til lokale virksomheder | OviaSpecs',
    description: `En hjemmeside, der virker på mobilen. Tre faste pakker fra ${formatKr(web.tiers[0].price)} plus drift fra ${formatKr(monthlies[0])}/md. Ring ${contact.phone}.`,
  },
  eyebrow: 'Hjemmeside',
  title: 'Dine kunder leder efter dig på mobilen.',
  problem: [
    'Når nogen hører om dig, slår de dig op på telefonen. Mangler hjemmesiden, eller er den forældet, går de videre til den næste.',
    'Jeg laver en side, der viser, hvad du laver, hvornår du har åbent, og hvordan man kontakter dig.',
  ],
  toPackages: 'Se pakker og priser',
  get: {
    eyebrow: 'Det får du',
    title: 'En side, der gør det nemt at vælge dig.',
    items: [
      { title: 'Lavet til telefonen', text: 'Siden er bygget til mobilen først og virker også på computeren.' },
      { title: 'Det vigtigste øverst', text: 'Hvad du laver, dine åbningstider og en knap til at ringe eller skrive.' },
      { title: 'Synlig på Google', text: 'I Vækst og Fuld fart sætter jeg din Google-profil op og laver SEO.' },
      { title: 'Drift hver måned', text: 'Hosting, domæne, SSL, backup og op til 2 små ændringer om måneden.' },
    ],
  },
  concepts: {
    eyebrow: 'Koncepter',
    title: 'Sådan kan det se ud.',
    intro:
      'Fire hjemmesider, jeg har lavet som koncepter. De er ikke lavet for rigtige kunder, men de virker, så du kan prøve dem på din telefon.',
    more: 'Se alle koncepter',
  },
  packages: {
    eyebrow: 'Pakker',
    title: 'Tre pakker. Faste priser.',
    intro: 'Du betaler én gang for siden og derefter drift hver måned.',
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Hvad koster det?',
        a: `${tierList(web)} Dertil kommer drift på ${monthlies.map((m) => `${formatKr(m)}/md`).join(' eller ')} alt efter pakke. En ekstra underside koster ${formatKr(web.addons.extraPage.price)}. ${priceNote}`,
      },
      {
        q: 'Hvad er inkluderet i drift?',
        a: `${web.drift.included.join('. ')}. ${web.drift.fast} ${web.drift.notIncluded}`,
      },
      {
        q: 'Hvem ejer domænet og siden?',
        a: `${web.drift.domain} Vil du have siden på din egen konto fra starten, koster det ${formatKr(web.addons.ownAccount.price)} ekstra som engangskøb i stedet for drift. ${web.drift.buyout(formatKr(web.addons.ownAccount.price))}`,
      },
      {
        q: 'Hvad hvis jeg vil stoppe?',
        a: `${web.drift.binding} ${web.drift.buyout(formatKr(web.addons.ownAccount.price))}`,
      },
      { q: 'Hvor lang tid tager det?', a: web.leadTime },
      ...startFaq,
    ],
  },
  contact: {
    title: 'Skal vi kigge på din hjemmeside?',
    body: 'Ring eller skriv, så tager vi en snak om, hvad din side skal kunne.',
  },
}
