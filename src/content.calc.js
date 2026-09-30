/* =========================================================================
   PRISBEREGNER — tekster og prismodel.

   Prismodellen er samlet her og er den ENESTE kilde: heroen, hjemmesidesiden
   og /prisberegner/ bruger alle den samme beregner (components/Calculator.jsx)
   og priceFor(). Ret tallene her.

   Forsiden tæller med i antallet af sider. Virksomhedstype og valgt demo
   ændrer aldrig prisen. Mere end seks sider, webshop, betaling, login og
   specialudvikling giver "Særskilt tilbud" og aldrig en pris, der stopper på
   5.000 kr. "Jeg ved det ikke" giver en personlig afklaring uden en pris.
   ========================================================================= */

export const pricing = {
  tiers: [
    { id: '1-3', label: '1–3 sider', range: 'Forsiden og op til to undersider', price: 4000 },
    { id: '4-5', label: '4–5 sider', range: 'Forsiden og tre til fire undersider', price: 4500 },
    { id: '6', label: '6 sider', range: 'Forsiden og fem undersider', price: 5000 },
  ],
  custom: {
    id: 'custom',
    label: 'Mere end 6 sider, webshop eller specialfunktioner',
    range: 'Større opgaver får et særskilt tilbud',
  },
  unsure: {
    id: 'unsure',
    label: 'Jeg ved det ikke',
    range: 'Vi finder omfanget sammen',
  },
}

/** Alle valg i trin 2, i visningsrækkefølge. */
export const pageOptions = [...pricing.tiers, pricing.custom, pricing.unsure]

/**
 * Pris i kroner for et valg af sideantal, eller null. null betyder aldrig en
 * pris: "custom" er et særskilt tilbud, og "unsure" er en personlig afklaring.
 */
export function priceFor(pagesId) {
  return pricing.tiers.find((t) => t.id === pagesId)?.price ?? null
}

/** 4500 -> "4.500 kr." (manuelt, så server og klient altid giver samme tekst). */
export function formatKr(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kr.`
}

/** Virksomhedstype er valgfri og ændrer ikke prisen. */
export const businessTypes = [
  { id: 'mad', label: 'Café, restaurant eller bar' },
  { id: 'salon', label: 'Frisør, salon eller klinik' },
  { id: 'service', label: 'Håndværker eller servicefirma' },
  { id: 'butik', label: 'Butik' },
  { id: 'andet', label: 'Noget andet' },
]

/** Formål (trin 1). */
export const purposes = [
  { id: 'praesentere', label: 'Præsentere virksomheden' },
  { id: 'henvendelser', label: 'Få flere henvendelser' },
  { id: 'menu', label: 'Vise menu og åbningstider' },
  {
    id: 'booking',
    label: 'Gøre det nemt at booke',
    note: 'Selve bookingløsningen aftaler jeg med dig separat. Den er ikke med i prisen.',
  },
]

/**
 * MOMS. Skal udfyldes ud fra Ronnys dokumenterede status og må ikke gættes:
 *   'excl'   prisen er uden moms, og moms tilføjes
 *   'incl'   prisen er inklusive moms
 *   'exempt' prisen har ingen moms, fordi OviaSpecs ikke er momsregistreret
 *   null     ikke afklaret: siden siger da kun, at moms står i tilbuddet
 * TODO(afklar før publicering): momsstatus og CVR-nr. (se `legal` i content.js).
 */
export const vat = { status: null }

export const vatLine = () =>
  ({
    excl: 'Prisen er uden moms. Moms tilkommer.',
    incl: 'Prisen er inklusive moms.',
    exempt: 'Prisen er uden moms, da OviaSpecs ikke er momsregistreret.',
  })[vat.status] ?? 'Moms og betalingsvilkår står i det skriftlige tilbud, før noget aftales.'

export const calc = {
  title: 'Beregn din hjemmesidepris',
  intro:
    'Tre korte trin til prisen på selve hjemmesiden. Du behøver ikke oplyse noget for at se den.',
  scope: 'Beregneren gælder almindelige virksomhedshjemmesider. Andre opgaver aftaler vi personligt.',
  progress: (n) => `Trin ${n} af 3`,
  steps: ['Formål', 'Antal sider', 'Din pris'],
  back: 'Tilbage',
  next: 'Næste',
  seeResult: 'Se din pris',
  s1: {
    title: 'Hvad skal din nye hjemmeside hjælpe med?',
    hint: 'Vælg det, der passer bedst.',
    typeLabel: 'Virksomhedstype (valgfri)',
    typeNone: 'Vælg, hvis du vil',
    note: 'Virksomhedstypen ændrer ikke prisen. Den hjælper mig kun med at forstå, hvad siden skal kunne.',
    needPurpose: 'Vælg det, der passer bedst, for at gå videre.',
    fromDemo: (name) => `Udfyldt ud fra ${name}. Ret svarene, så de passer til din virksomhed.`,
  },
  s2: {
    title: 'Hvor mange sider skal hjemmesiden have?',
    hint: 'Forsiden tæller med. En side kan fx være Forside, Om os, Menu eller Kontakt.',
    needPages: 'Vælg, hvor mange sider du tror, du skal bruge.',
    customNote:
      'Mere end seks sider, webshop og specialfunktioner passer ikke ind i standardprisen. Du får et særskilt tilbud, når vi har talt om opgaven.',
    unsureNote:
      'Det er helt fint. Jeg hjælper dig med at finde ud af, hvor mange sider der giver mening, og giver dig derefter en pris. Jeg gætter ikke en pris på forhånd.',
  },
  s3: {
    title: 'Din pris',
    titleCustom: 'Et særskilt tilbud',
    titleUnsure: 'Lad os finde omfanget sammen',
    yourChoice: 'Dine valg',
    type: 'Virksomhed',
    purpose: 'Formål',
    pages: 'Sider (forsiden med)',
    demo: 'Inspireret af',
    edit: 'Ret',
    oneTime: 'Engangspris for selve hjemmesiden',
    quoteTitle: 'Særskilt tilbud',
    quoteText:
      'Det, du har valgt, ligger uden for standardprisen. Fortæl mig om opgaven, så vurderer jeg omfanget og giver dig et skriftligt tilbud.',
    unsureTitle: 'Personlig afklaring',
    unsureText:
      'Du har ikke valgt et antal sider endnu. Det er ikke et problem: skriv til mig, så finder vi omfanget sammen, og jeg giver dig derefter en pris.',
    includedTitle: 'Det er med',
    included: [
      'Mobiltilpasset hjemmeside med ét fælles design',
      'De aftalte almindelige indholdssider, forsiden med',
      'Sidetitler og metabeskrivelser til hver side',
      'Den aftalte kontaktmulighed på siden',
      'To samlede korrekturrunder inden for det aftalte omfang',
    ],
    yourPartTitle: 'Det sørger du for',
    yourPart: ['Tekst og billeder til siden. Skal jeg hjælpe med indholdet, aftaler vi det separat.'],
    notIncludedTitle: 'Det er ikke med i prisen',
    notIncluded: [
      'Ekstra sider, nye funktioner og større ændringer uden for det aftalte. Det er ekstraarbejde med et særskilt tilbud.',
      'Booking, integrationer, marketing og vedligeholdelse. Dem aftaler jeg personligt med dig.',
      'Webshop, betaling, login og specialudvikling.',
    ],
    separateTitle: 'Udgifter til andre udbydere',
    separate: 'Domæne, hosting og eksterne systemer kommer separat og betales til udbyderne.',
    statement:
      'Prisen gælder selve hjemmesiden. Booking, integrationer og vedligeholdelse aftaler vi sammen ud fra dine behov. Domæne, hosting og eksterne systemer kommer separat.',
    demoNote:
      'En demo er inspiration. Booking og andre ekstra funktioner, som demoen viser, aftales separat og er ikke med i standardprisen.',
    bookingNote: 'Du valgte booking. Selve bookingløsningen aftaler vi separat, og den er ikke med i prisen.',
    cta: 'Kontakt mig om din hjemmeside',
    ctaQuote: 'Bed om et tilbud',
    ctaUnsure: 'Skriv til mig',
    restart: 'Start forfra',
  },
  faq: [
    {
      q: 'Hvad er med i prisen?',
      a: 'Selve hjemmesiden: mobiltilpasset design, de aftalte almindelige indholdssider med forsiden, sidetitler og metabeskrivelser, den aftalte kontaktmulighed og to samlede korrekturrunder. Tekst og billeder leverer du. Se hele oversigten på resultatsiden.',
    },
    {
      q: 'Skal jeg oplyse noget for at se prisen?',
      a: 'Nej. Du ser prisen efter to valg, uden at oplyse navn, mail eller telefon. Først hvis du vil tale med mig, udfylder du en kort formular.',
    },
    {
      q: 'Hvad hvis jeg også har brug for booking eller vedligeholdelse?',
      a: 'Det er ikke med i prisen og har ingen pris i beregneren. Booking, integrationer, marketing og vedligeholdelse aftaler jeg personligt med dig, ud fra dit system og dine behov. Der følger intet abonnement med automatisk.',
    },
    {
      q: 'Hvad sker der, hvis jeg vil have mere, end der er aftalt?',
      a: 'Ekstra sider, nye funktioner og større ændringer uden for aftalen er ekstraarbejde, og du får et særskilt tilbud på det. Vedligeholdelse omfatter ikke automatisk nye sider eller et nyt design.',
    },
    {
      q: 'Er prisen det, jeg ender med at betale?',
      a: 'Beregneren giver prisen på selve hjemmesiden ud fra de valg, du har lavet. Omfanget står i det skriftlige tilbud, før noget går i gang. Domæne, hosting og eksterne systemer kommer separat og betales til udbyderne.',
    },
  ],
  form: {
    title: 'Kontakt mig om din hjemmeside',
    titleQuote: 'Bed om et tilbud',
    titleUnsure: 'Skriv til mig om omfanget',
    intro: 'Dine valg og din pris følger med beskeden. Du behøver ikke skrive mere, end du har lyst til.',
    name: 'Dit navn',
    email: 'Din e-mail',
    phone: 'Telefon (valgfrit)',
    wishes: 'Ønsker og spørgsmål (valgfrit)',
    wishesPlaceholder: 'Fx: Vi vil gerne have menuen på forsiden, og vi bruger allerede et bookingsystem.',
    submit: 'Send til Ronny',
  },
}
