import prices from './prices.json' with { type: 'json' }

/* =========================================================================
   Tekst og tabelrækker til /priser og ydelsessiderne. Beløb og pakkenavne
   kommer fra prices.json; her står kun det, der ikke er et beløb.
   ========================================================================= */

const YES = 1
const NO = 0

/**
 * Prisoversigten: pr. ydelse de rækker, der sammenligner de tre pakker.
 * Hver række er [tekst, Start, Vækst, Fuld fart]; 1 = indgår (flueben), 0 = indgår ikke (–), tekst = værdi.
 */
export const priceTables = {
  web: {
    id: 'p-hjemmeside',
    rows: [
      ['Sider', '1', 'Op til 5', 'Op til 8'],
      ['Google-profil sat op', NO, YES, YES],
      ['Sat op til at blive fundet på Google', NO, YES, YES],
      ['Lokal SEO', NO, NO, YES],
      ['Rettelserunder', '1', '2', '3'],
    ],
    note: 'Drift vælges for sig. Se driftsplaner længere nede.',
  },
  mkt: {
    id: 'p-marketing',
    rows: [
      ['Korte videoer om måneden', '3', '6', '9'],
      ['Opslag', NO, '4', '8'],
      ['Jeg poster for dig', NO, '2 kanaler', '3 kanaler'],
      ['Styring af Meta-annoncer', NO, NO, YES],
      ['Månedsrapport', NO, YES, YES],
    ],
    note: 'Annoncebudget betales direkte til Meta.',
  },
  book: {
    id: 'p-booking',
    rows: [
      ['Google-profil sat op eller rettet', YES, YES, YES],
      ['Booking på hjemmeside eller Instagram', NO, YES, YES],
      ['QR-skilt til anmeldelser', NO, NO, YES],
      ['Opfølgning efter 30 dage med tal', NO, NO, YES],
    ],
    note: 'Bookingsystemets abonnement betales direkte til udbyderen.',
  },
}

/** Tilvalg på /priser: noten er sidens egen tekst; beløbet kommer fra prices.json (addons). */
export const addonRows = [
  { key: 'booking', note: 'Abonnementet betales direkte til udbyderen.', plus: true },
  { key: 'ownHosting', note: 'Engang, i stedet for driftsplan.', plus: true },
  { key: 'extraPage', note: 'Pr. side ud over 8. Kun Fuld fart.', plus: true },
  { key: 'buyout', note: 'Hvis du stopper driften og vil beholde siden.', plus: false },
]

/** Ydelsessiderne. `param` er den adresseparameter, som beregneren læser (w, m, b). */
export const servicePages = {
  web: {
    title: 'Hjemmeside',
    lead: 'En hurtig side, der virker på telefonen og bliver fundet på Google.',
    param: 'w',
    unit: 'Engang · ekskl. moms',
    phone: true,
    drift: true,
  },
  mkt: {
    title: 'Marketing',
    lead: 'Korte videoer og opslag hver måned.',
    param: 'm',
    unit: 'Pr. måned · ekskl. moms',
    note: priceTables.mkt.note,
  },
  book: {
    title: 'Booking & Google',
    lead: 'Bliv fundet på Google og booket direkte.',
    param: 'b',
    unit: 'Engang · ekskl. moms',
    note: priceTables.book.note,
  },
}

/** "Online, sikker, domæne og backup" — det, alle driftsplaner indeholder (prices.json). */
export const includedText = prices.drift.includedInAll
  .map((s, i) => (i ? s.toLowerCase() : s))
  .join(", ")
  .replace(/, ([^,]*)$/, " og $1")
