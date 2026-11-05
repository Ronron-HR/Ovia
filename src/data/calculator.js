/* =========================================================================
   Beregnerens tekster. Priser og pakker kommer fra prices.json via
   lib/calculate.js; her står kun teksten omkring dem.
   ========================================================================= */

/** Rækkefølgen af ydelser i beregneren. */
export const SERVICE_KEYS = ['web', 'mkt', 'book']

/** Kort beskrivelse og adresse pr. ydelse. `month` = prisen er pr. måned. */
export const serviceMeta = {
  web: { desc: 'Hurtig side, der bliver fundet.', href: '/hjemmeside/', month: false },
  mkt: { desc: 'Korte videoer og opslag hver måned.', href: '/marketing/', month: true },
  book: { desc: 'Bliv fundet og booket direkte.', href: '/booking-google/', month: false },
}

/** Korte punkter pr. pakke til telefonen (README: flyt til prisdata, hvis de skal oversættes). */
export const shortPoints = {
  web: [
    ['Én side med det vigtigste', '1 rettelserunde'],
    ['Op til 5 sider', 'Google-profil, fundet på Google', '2 rettelserunder'],
    ['Op til 8 sider', 'Google-profil og lokal SEO', '3 rettelserunder'],
  ],
  mkt: [
    ['3 korte videoer om måneden', 'Du poster selv'],
    ['6 videoer og 4 opslag', 'Jeg poster på 2 kanaler', 'Månedsrapport'],
    ['9 videoer, 8 opslag, 3 kanaler', 'Meta-annoncer', 'Månedsrapport'],
  ],
  book: [
    ['Google-profil sat op eller rettet'],
    ['Google-profil', 'Booking på hjemmeside eller Instagram'],
    ['QR-skilt til anmeldelser', 'Opfølgning efter 30 dage med tal'],
  ],
}

/** Driftsvalg. "Egen hosting" er et engangsbeløb, der erstatter driftsplanen. */
export const driftChoices = [
  { key: 'basis', desc: 'Drift og sikkerhed. Ingen indholdsændringer.' },
  { key: 'plus', desc: 'Hjælp til billeder, tekst og nyheder.' },
  { key: 'ekstra', desc: 'Fast webmaster. Flere rettelser hver måned.' },
  { key: 'egen', name: 'Egen hosting', desc: 'Din egen konto i stedet for driftsplan.' },
]

/** Trinnene på desktop. */
export const stepLabels = ['Ydelser', 'Pakker', 'Drift og tilvalg', 'Opsummering']

/** Guidet hjælp: tre spørgsmål. Spørgsmål 2 er flervalg. */
export const helpQuestions = [
  { title: 'Har du en hjemmeside i dag?', options: ['Nej', 'Ja, men den trænger til at blive lavet om', 'Ja, og den virker'] },
  { title: 'Hvad skal der komme mere af?', options: ['Bordbestillinger', 'Følgere og synlighed', 'Bliv fundet på Google'] },
  { title: 'Hvor meget vil du selv stå for?', options: ['Det meste', 'Lidt', 'Helst intet'] },
]
