/* =========================================================================
   AL FÆLLES TEKST PÅ SIDEN BOR HER
   Ret frit — komponenterne indeholder ingen tekst. Tekster til de enkelte
   ydelsessider ligger i services.js.

   Positionering: OviaSpecs er en digital handyman for virksomheder.
   Én kontaktperson til hjemmesider, integrationer, praktisk automatisering
   og online markedsføring. Sproget er personligt (jeg/du) og konkret.

   Regler for teksten:
   - Skeln mellem det, jeg TILBYDER, og det, jeg HAR LAVET. Eksempler på
     mulige løsninger er ikke kundecases. Demoerne er demoer og skal stå som
     "Demo – koncept, ikke kundearbejde".
   - Ingen tal, kundenavne, ratings eller løfter, der ikke kan dokumenteres.
     Eneste anmeldelse: Copenhagen Ease (godkendt, se `review`).
   - Ingen løfter om placeringer, salgstal eller garanterede resultater.
   - Priser: KUN selve hjemmesiden har en pris (se `pricing`). Booking,
     integrationer, vedligeholdelse, marketing og automatisering aftales
     personligt og har ingen pris på siden. Opfind ikke priser på hosting,
     abonnementer eller bindingsperioder, og gæt ikke momsstatus.
   - Ingen løfter om ejerskab, support, svartider eller leveringstider,
     før Ronny har afklaret dem.

   Billeder: siden bruger ingen fotos, logoer, menukort eller tekster fra
   virksomhederne bag demoerne. Demoerne vises som illustrationer, tegnet til
   siden i src/concepts (HTML/CSS), og er mærket som demo. Det eneste foto er
   Ronnys eget portræt.
   ========================================================================= */

import { businessTypes, formatKr, pricing, purposes } from './content.calc.js'

import { demoById } from './content.demos.js'

export * from './content.calc.js'
export * from './content.demos.js'

export const site = {
  brand: 'OviaSpecs',
  url: 'https://oviaspecs.com/',
  owner: 'Ronny Hong',
  email: 'kontakt@oviaspecs.com',
  phone: '53 61 36 99',
  phoneHref: '+4553613699',
  place: 'Hjortshøj / Aarhus',
}

/** Adresser til de faste sider. Bruges af navigation, knapper og sitemap. */
export const paths = {
  home: '/',
  hjemmesider: '/hjemmesider/',
  booking: '/booking-integrationer/',
  seo: '/seo/',
  googleAds: '/google-ads/',
  sociale: '/sociale-medier-annoncering/',
  ai: '/ai-automatisering/',
  demoer: '/demoer/',
  om: '/om/',
  kontakt: '/kontakt/',
  prisberegner: '/prisberegner/',
  beregner: '/prisberegner/#beregner',
  privatliv: '/privatlivspolitik/',
}

/* -------------------------------------------------------------------------
   NAVIGATION
   Hjemmesider · Marketing ▾ · Integrationer ▾ · Demoer · Om OviaSpecs ·
   Kontakt · [Beregn din pris]
------------------------------------------------------------------------- */
export const nav = {
  brand: 'OviaSpecs',
  items: [
    { label: 'Hjemmesider', href: paths.hjemmesider },
    {
      label: 'Marketing',
      children: [
        { label: 'SEO', href: paths.seo, text: 'Bliv lettere at finde i Google' },
        { label: 'Google Ads', href: paths.googleAds, text: 'Annoncer i søgeresultaterne' },
        {
          label: 'Annoncering på sociale medier',
          href: paths.sociale,
          text: 'Meta (Facebook og Instagram) og TikTok',
        },
      ],
    },
    {
      label: 'Integrationer',
      children: [
        { label: 'Booking og integrationer', href: paths.booking, text: 'Koble booking og værktøjer på siden' },
        { label: 'AI-automatisering', href: paths.ai, text: 'Færre gentagne opgaver' },
      ],
    },
    { label: 'Demoer', href: paths.demoer },
    { label: 'Om OviaSpecs', href: paths.om },
    { label: 'Kontakt', href: paths.kontakt },
  ],
  cta: { label: 'Beregn din pris', href: paths.beregner },
  menu: 'Menu',
  close: 'Luk',
  mobileMore: 'Andet',
}

/* -------------------------------------------------------------------------
   HERO — ingen pris. Heroen rummer hele beregneren (components/Calculator.jsx);
   prisen vises først som resultat dér.
------------------------------------------------------------------------- */
export const hero = {
  eyebrow: 'Enkle hjemmesider, bygget i kode',
  lines: ['Hjemmesider, der', 'gør det nemt at', 'tage kontakt.'],
  deck: 'Jeg bygger hjemmesider til virksomheder i alle brancher og størrelser. Start her og se prisen på din hjemmeside.',
  secondary: { label: 'Se demoer', href: paths.demoer },
  other: { text: 'Brug for noget andet end en hjemmeside?', label: 'Skriv til mig', href: paths.kontakt },
}

/* -------------------------------------------------------------------------
   FORSIDEN: OVERBLIK OVER YDELSERNE
------------------------------------------------------------------------- */
export const overview = {
  eyebrow: 'Hvad jeg hjælper med',
  title: 'Tre indgange. Vælg den, du har brug for.',
  intro: 'Du behøver ikke vide, hvad løsningen hedder. Start dér, hvor det driller, så finder vi resten sammen.',
  main: {
    n: '01',
    title: 'Hjemmesider',
    text: 'En hjemmeside, hvor kunden hurtigt kan se, hvad I laver, og hvordan man tager kontakt. Bygget i kode, tilpasset jeres virksomhed.',
    cta: { label: 'Se hjemmesider', href: paths.hjemmesider },
    calc: { label: 'Beregn din pris', href: paths.beregner },
  },
  groups: [
    {
      n: '02',
      title: 'Marketing',
      text: 'Bliv fundet af dem, der leder efter jer, og vist for dem, der endnu ikke gør.',
      links: [
        { label: 'SEO', href: paths.seo },
        { label: 'Google Ads', href: paths.googleAds },
        { label: 'Annoncering på sociale medier', href: paths.sociale, note: 'Meta og TikTok' },
      ],
    },
    {
      n: '03',
      title: 'Integrationer',
      text: 'Booking på hjemmesiden og værktøjer, der arbejder sammen, så der er færre ting at gøre i hånden.',
      links: [
        { label: 'Booking og integrationer', href: paths.booking },
        { label: 'AI-automatisering', href: paths.ai },
      ],
    },
  ],
}

/** Adresse til beregneren med valg med i adresselinjen. */
export function calcHref({ type, purpose, pages, demo, step } = {}) {
  const q = new URLSearchParams()
  if (type) q.set('virksomhed', type)
  if (purpose) q.set('formaal', purpose)
  if (pages) q.set('sider', pages)
  if (demo) q.set('demo', demo)
  if (step) q.set('trin', String(step))
  const s = q.toString()
  return `${paths.prisberegner}${s ? `?${s}` : ''}#beregner`
}

/* -------------------------------------------------------------------------
   SAMARBEJDET — ingen leveringstider, ingen priser, ingen løfter om ejerskab
   eller support, før de er afklaret.
------------------------------------------------------------------------- */
export const samarbejde = {
  id: 'samarbejde',
  eyebrow: 'Sådan arbejder vi sammen',
  title: 'Fra første samtale til en løsning, der virker.',
  lead: 'Uanset om opgaven er en hjemmeside, en integration eller annoncering, foregår det på samme måde. Du har hele vejen den samme kontaktperson.',
  steps: [
    {
      title: 'Du fortæller om opgaven',
      body: 'Vi taler om, hvad virksomheden laver, og hvad der driller eller mangler. Du behøver ikke have et færdigt oplæg eller kende løsningens navn.',
    },
    {
      title: 'Aftalt omfang og pris',
      body: 'Du får skrevet ned, hvad der er med, hvad det koster, og hvad der ikke er med. Først når du siger ja, går jeg i gang.',
    },
    {
      title: 'Jeg løser opgaven, og du følger med',
      body: 'Du ser løsningen undervejs, for en hjemmeside i en browser og ikke som et billede. Du kommenterer, og jeg retter inden for det aftalte.',
    },
    {
      title: 'Aflevering og drift',
      body: 'Jeg sætter løsningen i drift og viser, hvordan den bruges. Om jeg også tager mig af opdateringer og vedligeholdelse, aftaler vi, før vi går i gang.',
    },
  ],
  ownership:
    'Hvem der ejer hvad, og hvad der er med i driften efter afleveringen, står i den skriftlige aftale.',
}

/* -------------------------------------------------------------------------
   ANMELDELSE — Copenhagen Ease har givet tilladelse til at bruge feedbacken
   som anmeldelse og virksomheden som reference. Citatet er ordret fra deres
   besked og handler om en SAMTALE, ikke om en leveret hjemmeside. Ingen
   stjerner, personnavne, tal eller flere udtalelser.
------------------------------------------------------------------------- */
export const review = {
  id: 'anmeldelse',
  eyebrow: 'Feedback efter en samtale med OviaSpecs',
  quote:
    'Vi havde en god og ligetil samtale med Ronny om vores digitale behov. Han lyttede og forklarede mulighederne på en forståelig måde.',
  source: 'Copenhagen Ease',
}

/* -------------------------------------------------------------------------
   OM OVIASPECS — alder og skole er bevidst udeladt.
------------------------------------------------------------------------- */
const portrait = {
  base: '/ronny',
  width: 500,
  height: 625,
  alt: 'Ronny Hong, der står bag OviaSpecs',
}

export const om = {
  id: 'om',
  eyebrow: 'Om OviaSpecs',
  title: 'Du taler med den, der løser opgaven.',
  body: [
    'Jeg hedder Ronny Hong og står bag OviaSpecs. Tænk på mig som en digital handyman: du har én kontaktperson, uanset om opgaven er en hjemmeside, en integration, en lille automatisering eller annoncering. Det er mig, du skriver eller ringer til, og mig, der laver arbejdet.',
    'Jeg bor i Hjortshøj ved Aarhus og arbejder med virksomheder i Aarhus-området og andre steder i Danmark. Siderne bygger jeg selv i kode og ikke på en færdig skabelon. Den side, du læser nu, er et eksempel: den bruger ingen cookies og ingen sporing.',
    'Ligger en opgave uden for det, jeg selv kan, siger jeg det, før vi går i gang.',
  ],
  facts: [
    ['Kontaktperson', 'Ronny Hong'],
    ['Sted', 'Hjortshøj / Aarhus'],
    ['Arbejder med', 'Hjemmesider, booking, marketing og automatisering'],
  ],
  principles: {
    title: 'Sådan arbejder jeg',
    items: [
      { title: 'Skriftligt, før jeg går i gang', text: 'Omfang, pris og afgrænsning står på skrift, så vi begge ved, hvad der er aftalt.' },
      { title: 'Ærlig om det, jeg ikke kan love', text: 'Jeg lover ingen placeringer i Google, salgstal eller resultater. Jeg fortæller, hvad jeg gør, og hvorfor.' },
      { title: 'Du bestiller kun det, du har brug for', text: 'Du behøver hverken have det hele eller være på alle platforme.' },
    ],
  },
  portrait,
}

/* -------------------------------------------------------------------------
   SPØRGSMÅL på kontaktsiden — kun det, der reelt afgør, om man skriver.
------------------------------------------------------------------------- */
export const faq = {
  id: 'sporgsmaal',
  eyebrow: 'Spørgsmål',
  title: 'Det, du sikkert vil vide først.',
  items: [
    {
      q: 'Kan du hjælpe med en hjemmeside, jeg allerede har?',
      a: 'Ja. Vi ser på, hvad der virker, og hvad der ikke gør. Nogle gange er få rettelser nok, andre gange giver en ny side mere mening. Du får at vide, hvilket, før noget aftales.',
    },
    {
      q: 'Kan jeg nøjes med én opgave?',
      a: 'Ja. Du bestiller kun det, du har brug for. Du skal hverken have det hele eller være på alle platforme.',
    },
    {
      q: 'Kan du hjælpe med noget, der ikke står her?',
      a: 'Måske. Beskriv, hvad der driller, så vurderer jeg, om og hvordan jeg kan hjælpe. Kan jeg ikke, siger jeg det ligeud.',
    },
    {
      q: 'Kan du love, at jeg kommer øverst på Google?',
      a: 'Nej, og det kan ingen ærligt love. Jeg fortæller, hvad jeg gør, og hvorfor, og du kan holde mig op på det.',
    },
    {
      q: 'Hvad koster det?',
      a: 'En almindelig virksomhedshjemmeside kan du få prisen på i prisberegneren, uden at oplyse noget. Booking, integrationer, vedligeholdelse, marketing og automatisering aftaler vi personligt. Annoncebudget, abonnementer og eksterne systemer betales til udbyderen.',
    },
  ],
}

/* -------------------------------------------------------------------------
   KONTAKT — mail og telefon virker altid. Formularerne (kontaktsiden og
   formularen efter prisberegneren) sender direkte til /api/kontakt
   (worker/index.js) og viser først "sendt", når serveren har accepteret
   beskeden. Er afsendelsen ikke sat op eller fejler den, er beskeden IKKE
   sendt, og siden tilbyder i stedet mailprogram eller kopiering med en ærlig
   forklaring (se `inquiry`).
------------------------------------------------------------------------- */
export const kontakt = {
  id: 'kontakt',
  eyebrow: 'Kontakt',
  title: 'Fortæl om din opgave.',
  body: 'Skriv et par linjer om, hvad virksomheden laver, og hvad du gerne vil have hjælp til. Du får svar fra mig, og vi ser på, hvad der giver mening at starte med.',
  bodyShort: 'Fortæl om virksomheden og opgaven. Du får svar fra mig, og vi finder ud af, hvad der giver mening at starte med.',
  ctaTitle: 'Skal vi tale om din opgave?',
  form: {
    topicLegend: 'Hvad drejer det sig om?',
    name: 'Dit navn',
    email: 'Din e-mail',
    phone: 'Telefon (valgfrit)',
    company: 'Virksomhed (valgfrit)',
    message: 'Hvad vil du have hjælp til?',
    messagePlaceholder: 'Fx: Vi er en café med en gammel hjemmeside og vil gerne kunne tage imod bordbestillinger.',
    submit: 'Send besked',
    note: 'Din besked går direkte til mig. Jeg bruger dine oplysninger til at svare dig, og ikke til andet.',
  },
  phoneLabel: 'Foretrækker du at ringe?',
  inline: {
    title: 'Beskriv din opgave',
    intro: 'Skriv et par linjer, så vender jeg tilbage. Ingen pris og ingen binding, før vi har talt sammen.',
  },
}

/** Afsendelse, fejl og reservevej. Bruges af begge formularer (src/inquiry.js). */
export const inquiry = {
  sending: 'Sender …',
  sentTitle: 'Tak, din besked er sendt.',
  sent: 'Jeg har modtaget den og svarer dig på den e-mail, du har oplyst.',
  errorSummary: 'Der mangler noget, før beskeden kan sendes:',
  errors: {
    name: 'Skriv dit navn.',
    email: 'Skriv din e-mailadresse, fx navn@firma.dk.',
    emailInvalid: 'E-mailadressen ser ikke ud til at være gyldig. Tjek den, fx navn@firma.dk.',
    phone: 'Telefonnummeret må kun indeholde tal, mellemrum og +.',
    message: 'Skriv et par linjer om opgaven.',
    tooLong: 'Teksten er for lang. Kort den lidt ned.',
  },
  fallbackTitle: 'Beskeden er ikke sendt.',
  unavailable:
    'Afsendelse direkte fra siden virker ikke lige nu. Din besked er ikke sendt endnu, men dine oplysninger står her. Send den i stedet fra dit eget mailprogram, eller kopiér den, og indsæt den i en mail til',
  failed:
    'Noget gik galt, og beskeden er ikke sendt. Prøv igen om lidt, eller send den i stedet fra dit eget mailprogram, eller kopiér den, og indsæt den i en mail til',
  tooFast: 'Formularen blev sendt for hurtigt. Vent et øjeblik, og prøv igen.',
  openMail: 'Åbn mailprogram med beskeden',
  copy: 'Kopiér beskeden',
  copied: 'Beskeden er kopieret. Indsæt den i en mail til',
  copyFailed: 'Kunne ikke kopiere automatisk. Skriv i stedet direkte til',
  mailOpened:
    'Jeg har forsøgt at åbne dit mailprogram. Husk at trykke send dér. Åbnede det sig ikke, kan du skrive direkte til',
}

/** Emner i kontaktformularen. Ydelsessiderne forvælger et af dem. */
export const topics = [
  { id: 'hjemmeside', label: 'Hjemmeside' },
  { id: 'booking', label: 'Booking og integrationer' },
  { id: 'vedligeholdelse', label: 'Vedligeholdelse' },
  { id: 'seo', label: 'SEO' },
  { id: 'google-ads', label: 'Google Ads' },
  { id: 'sociale', label: 'Annoncering på sociale medier' },
  { id: 'ai', label: 'AI-automatisering' },
  { id: 'andet', label: 'Noget andet' },
]

const topicLabel = (id) => topics.find((t) => t.id === id)?.label ?? 'Henvendelse'

/** Mailen, kontaktformularen samler: emne og brødtekst. */
export function composeParts({ topic, name, email, phone, company, message }) {
  const label = topicLabel(topic)
  const subject = `${label} – henvendelse fra oviaspecs.com`
  const body = [
    'Hej Ronny,',
    '',
    `Emne: ${label}`,
    `Navn: ${name || ''}`,
    `E-mail: ${email || ''}`,
    `Telefon: ${phone || ''}`,
    `Virksomhed: ${company || ''}`,
    '',
    message || 'Jeg vil gerne have hjælp til:',
    '',
    'Mvh',
    name || '',
  ].join('\n')
  return { subject, body }
}

/** Mailen, der følger med fra beregneren: valg, pris og eventuelt demovalg. */
export function composeCalcParts({ name, email, phone, wishes, type, purpose, pages, demo }) {
  const tier = pricing.tiers.find((t) => t.id === pages)
  const price = tier ? formatKr(tier.price) : null
  const unsure = pages === pricing.unsure.id
  const subject = price
    ? `Hjemmeside, ${tier.label.toLowerCase()} (${price}) – henvendelse fra oviaspecs.com`
    : unsure
      ? 'Hjemmeside, omfang skal afklares – henvendelse fra oviaspecs.com'
      : 'Hjemmeside, særskilt tilbud – henvendelse fra oviaspecs.com'
  const lines = [
    'Hej Ronny,',
    '',
    'Jeg har brugt prisberegneren på oviaspecs.com og vil gerne tale om min hjemmeside.',
    '',
    `Virksomhedstype: ${businessTypes.find((b) => b.id === type)?.label ?? 'ikke oplyst'}`,
    `Formål: ${purposes.find((p) => p.id === purpose)?.label ?? ''}`,
    `Antal sider (forsiden med): ${tier ? tier.label : unsure ? pricing.unsure.label : pricing.custom.label}`,
    price
      ? `Pris i beregneren (selve hjemmesiden): ${price}`
      : unsure
        ? 'Pris: ingen. Omfanget skal afklares personligt.'
        : 'Pris: særskilt tilbud (opgaven ligger uden for standardprisen)',
  ]
  if (purpose === 'booking') lines.push('Booking: ønsket. Bookingløsningen aftales separat.')
  if (demo) lines.push(`Demovalg: ${demoById(demo)?.name ?? demo}`)
  lines.push(
    '',
    `Navn: ${name || ''}`,
    `E-mail: ${email || ''}`,
    `Telefon: ${phone || ''}`,
    '',
    wishes || 'Ønsker og spørgsmål:',
    '',
    'Mvh',
    name || '',
  )
  return { subject, body: lines.join('\n') }
}

export function mailtoFrom({ subject, body }) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/* -------------------------------------------------------------------------
   JURIDISKE OPLYSNINGER — bruges af footeren og privatlivspolitikken.
   Adressen står allerede i footeren på den tidligere side og er hentet
   derfra; den bruges ikke i metadata eller strukturerede data.
   Er der et CVR-nr., skriv det i `cvr`, så vises det af sig selv.
------------------------------------------------------------------------- */
export const legal = {
  owner: 'Ronny Hong',
  address: null,
  cvr: null,
  hosting: 'Cloudflare',
  mailProvider: 'Google (Gmail)',
  retentionMonths: 12,
  updated: '30. september 2026',
}

export const footer = {
  left: '© 2026 OviaSpecs',
  tagline: 'Hjemmesider, marketing og integrationer til virksomheder.',
  columns: [
    {
      title: 'Hjemmesider',
      links: [
        { label: 'Hjemmesider', href: paths.hjemmesider },
        { label: 'Beregn din pris', href: paths.beregner },
        { label: 'Demoer', href: paths.demoer },
      ],
    },
    {
      title: 'Marketing',
      links: [
        { label: 'SEO', href: paths.seo },
        { label: 'Google Ads', href: paths.googleAds },
        { label: 'Annoncering på sociale medier', href: paths.sociale },
      ],
    },
    {
      title: 'Integrationer',
      links: [
        { label: 'Booking og integrationer', href: paths.booking },
        { label: 'AI-automatisering', href: paths.ai },
      ],
    },
    {
      title: 'OviaSpecs',
      links: [
        { label: 'Om OviaSpecs', href: paths.om },
        { label: 'Kontakt', href: paths.kontakt },
        { label: 'Privatlivspolitik', href: paths.privatliv },
      ],
    },
  ],
}
