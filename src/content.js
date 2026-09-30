/* =========================================================================
   AL FÆLLES TEKST PÅ SIDEN BOR HER
   Ret frit — komponenterne indeholder ingen tekst. Tekster til de enkelte
   ydelsessider ligger i services.js.

   Positionering: OviaSpecs er en digital handyman for lokale virksomheder.
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

export const site = {
  brand: 'OviaSpecs',
  url: 'https://oviaspecs.com/',
  owner: 'Ronny Hong',
  email: 'ronnyhong723@gmail.com',
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
  cta: { label: 'Beregn din pris', href: paths.prisberegner },
  menu: 'Menu',
  close: 'Luk',
  mobileMore: 'Andet',
}

/* -------------------------------------------------------------------------
   PRISBEREGNER — kun selve hjemmesiden.

   Prismodellen er samlet her og er den ENESTE kilde: heroen, hjemmesidesiden
   og beregneren bruger alle priceFor(). Ret tallene her.
   Forsiden tæller med i antallet af sider. Virksomhedstype, formål og valgt
   demo ændrer aldrig prisen. Mere end seks sider, webshop og specialudvikling
   giver ikke en pris, men "Særskilt tilbud".
------------------------------------------------------------------------- */
export const pricing = {
  tiers: [
    { id: '1-3', label: '1–3 sider', range: 'Forside og op til to undersider', price: 4000 },
    { id: '4-5', label: '4–5 sider', range: 'Forside og tre til fire undersider', price: 4500 },
    { id: '6', label: '6 sider', range: 'Forside og fem undersider', price: 5000 },
  ],
  custom: {
    id: 'custom',
    label: 'Mere end 6 sider, webshop eller specialudvikling',
    range: 'Større opgaver får et særskilt tilbud',
  },
}

/** Pris i kroner for et valg af sideantal, eller null (= særskilt tilbud). */
export function priceFor(pagesId) {
  return pricing.tiers.find((t) => t.id === pagesId)?.price ?? null
}

/** 4500 -> "4.500 kr." (manuelt, så server og klient altid giver samme tekst). */
export function formatKr(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kr.`
}

export const businessTypes = [
  { id: 'mad', label: 'Café, restaurant eller bar' },
  { id: 'salon', label: 'Frisør, salon eller klinik' },
  { id: 'service', label: 'Håndværker eller servicefirma' },
  { id: 'butik', label: 'Butik' },
  { id: 'andet', label: 'Noget andet' },
]

/** Formål. `short` bruges i heroen, `label` i beregneren. */
export const purposes = [
  { id: 'praesentere', short: 'Vise, hvem vi er', label: 'Vise, hvem vi er, og hvad vi tilbyder' },
  { id: 'henvendelser', short: 'Få flere henvendelser', label: 'Få flere henvendelser' },
  { id: 'menu', short: 'Vise menu og tider', label: 'Vise menu, priser eller åbningstider' },
  { id: 'booking', short: 'Gøre booking nemt', label: 'Gøre det nemt at booke' },
]

export const calc = {
  title: 'Beregn din hjemmesidepris',
  intro:
    'Tre korte trin til prisen på selve hjemmesiden. Du behøver ikke oplyse noget for at se den.',
  scope: 'Beregneren gælder almindelige virksomhedshjemmesider. Andre opgaver aftaler vi personligt.',
  progress: (n) => `Trin ${n} af 3`,
  steps: ['Om din virksomhed', 'Antal sider', 'Din pris'],
  back: 'Tilbage',
  next: 'Næste',
  s1: {
    title: 'Hvem er du, og hvad skal siden hjælpe med?',
    type: 'Virksomhedstype',
    purpose: 'Formål',
    note: 'Svarene ændrer ikke prisen. De hjælper mig med at forstå, hvad siden skal kunne.',
    fromDemo: (name) =>
      `Udfyldt ud fra ${name}. Ret svarene, så de passer til din virksomhed.`,
  },
  s2: {
    title: 'Hvor mange sider skal hjemmesiden have?',
    hint: 'Forsiden tæller med. En side kan fx være Forside, Om os, Menu eller Kontakt.',
    customNote:
      'Webshop, specialudvikling og større opgaver passer ikke ind i standardprisen. Du får et særskilt tilbud, når vi har talt om opgaven.',
  },
  s3: {
    title: 'Din pris',
    yourChoice: 'Din valgte løsning',
    type: 'Virksomhed',
    purpose: 'Formål',
    pages: 'Sider (forsiden med)',
    demo: 'Inspireret af',
    edit: 'Ret',
    oneTime: 'Engangspris for selve hjemmesiden',
    quoteTitle: 'Særskilt tilbud',
    quoteText:
      'Det, du har valgt, ligger uden for standardprisen. Fortæl mig om opgaven, så vurderer jeg omfanget og giver dig et skriftligt tilbud.',
    includedTitle: 'Det er med',
    included: [
      'Mobiltilpasset hjemmeside',
      'De aftalte sider, forsiden med',
      'Kontaktmulighed på siden: telefon, mail eller en knap til jeres kontaktvej',
      'Sidetitler og metabeskrivelser sat op til hver side',
    ],
    yourPartTitle: 'Det sørger du for',
    yourPart: [
      'Tekst og billeder til siden. Skal jeg hjælpe med indholdet, aftaler vi det separat.',
      'Feedback undervejs. Antallet af korrekturrunder står i tilbuddet, og rettelser uden for det aftalte er en ny opgave.',
    ],
    notIncludedTitle: 'Det er ikke med i prisen',
    notIncluded: [
      'Booking, integrationer og vedligeholdelse. Det aftaler vi personligt ud fra dine behov.',
      'Webshop, betalingsløsninger og specialfunktioner.',
    ],
    separateTitle: 'Udgifter til andre udbydere',
    separate:
      'Domæne, hosting og eksterne systemer betales til udbyderne, ikke til mig. Hvad du får brug for, gennemgår vi sammen, før noget aftales. Moms og betalingsvilkår står i det skriftlige tilbud.',
    statement:
      'Prisen gælder selve hjemmesiden. Booking, integrationer og vedligeholdelse aftaler vi sammen ud fra dine behov.',
    demoNote:
      'En demo er inspiration. Specialfunktioner, som demoen viser, er ikke automatisk med i standardprisen.',
    bookingNote: 'Du valgte booking som formål. Selve bookingen er ikke med i prisen, men vi taler om den bagefter.',
    cta: 'Tal med mig om din hjemmeside',
    ctaQuote: 'Beskriv din opgave',
    restart: 'Start forfra',
  },
  faq: [
    {
      q: 'Hvad er med i prisen?',
      a: 'Selve hjemmesiden: mobiltilpasset design, de aftalte sider med forsiden, en kontaktmulighed og sidetitler og metabeskrivelser. Tekst og billeder leverer du. Se hele oversigten på resultatsiden.',
    },
    {
      q: 'Skal jeg oplyse noget for at se prisen?',
      a: 'Nej. Du ser prisen efter tre spørgsmål uden at oplyse navn, mail eller telefon. Først hvis du vil tale med mig, udfylder du en kort formular.',
    },
    {
      q: 'Hvad hvis jeg også har brug for booking eller vedligeholdelse?',
      a: 'Det er ikke med i prisen og har ingen pris i beregneren. Det taler vi om personligt, ud fra dit system og dine behov.',
    },
    {
      q: 'Er prisen det, jeg ender med at betale?',
      a: 'Beregneren giver prisen på selve hjemmesiden ud fra de valg, du har lavet. Omfang, vilkår, moms og betaling står i det skriftlige tilbud, før noget går i gang. Domæne, hosting og eksterne systemer betales til udbyderne.',
    },
  ],
  form: {
    title: 'Tal med mig om din hjemmeside',
    intro: 'Dine valg og prisestimatet følger med i mailen. Du behøver ikke skrive mere, end du har lyst til.',
    name: 'Dit navn',
    email: 'Din e-mail',
    phone: 'Telefon (valgfrit)',
    wishes: 'Ønsker og spørgsmål (valgfrit)',
    wishesPlaceholder: 'Fx: Vi vil gerne have menuen på forsiden, og vi bruger allerede et bookingsystem.',
  },
}

/* -------------------------------------------------------------------------
   HERO — ingen pris. Spørgsmålet er beregnerens første trin; svaret følger
   med til /prisberegner/.
------------------------------------------------------------------------- */
export const hero = {
  eyebrow: 'Til lokale virksomheder · Hjortshøj og Aarhus',
  lines: ['Din virksomheds', 'digitale handyman.'],
  deck: 'Jeg bygger hjemmesider til lokale virksomheder og får booking, annoncering og automatisering til at spille sammen.',
  question: 'Hvad skal din nye hjemmeside hjælpe med?',
  questionHint: 'Vælg det, der passer bedst, så går du videre til prisen.',
  primary: { label: 'Beregn din hjemmesidepris', href: paths.prisberegner },
  secondary: { label: 'Se demoer', href: paths.demoer },
  other: { text: 'Brug for noget andet end en hjemmeside?', label: 'Skriv til mig', href: paths.kontakt },
  shots: { browser: 'salon', phones: ['belli', 'cafe'] },
  labels: {
    browser: 'Illustration af en frisør-hjemmeside, set på computer.',
    phones: [
      'Illustration af en restaurant-hjemmeside, set på telefon.',
      'Illustration af en café-hjemmeside, set på telefon.',
    ],
  },
  tag: 'Demo · koncept',
  caption: 'Se alle demoer',
  captionHref: paths.demoer,
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
    calc: { label: 'Beregn din pris', href: paths.prisberegner },
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

/* -------------------------------------------------------------------------
   DEMOER — mine egne demoer, ingen kunder.

   Hver demo vises som en illustration, tegnet til siden i src/concepts. De
   fire demoer findes som færdige sider hos GitHub Pages (`href`), men de
   indeholder virksomhedernes egne fotos, logoer, menukort og tekster, som
   jeg ikke har dokumenteret tilladelse til at vise. Derfor:
     - siden bruger intet af det materiale,
     - virksomhedernes navne står ikke på siden (generiske visningsnavne),
     - "Se live-demo" vises kun, når showLiveLinks er true.
   Sæt showLiveLinks til true, når demoerne er ryddet for tredjepartsmateriale
   OG de valgte adresser er kontrolleret. Privatlivspolitikken ændrer sig selv.

   `features` må kun nævne det, kilde-demoen faktisk indeholder.
   calcType / calcPurpose forudfylder beregneren; kunden kan ændre dem.
------------------------------------------------------------------------- */
export const demos = {
  id: 'demoer',
  eyebrow: 'Demoer',
  title: 'Sådan kan en hjemmeside se ud.',
  intro:
    'Det er mine egne demoer, ikke kundeopgaver. De viser, hvordan jeg griber en hjemmeside an, når en frisør, en restaurant, en café og en vinbar har hver sin stemning og hvert sit behov.',
  homeTitle: 'Tre demoer af mit arbejde.',
  homeIntro:
    'Tre forskellige retninger: en mørk og redaktionel frisørside, en varm restaurant og en farverig café.',
  tag: 'Demo – koncept, ikke kundearbejde',
  tagShort: 'Demo · koncept',
  note: 'Demoerne viser eksempler på design og funktioner. Din hjemmeside tilpasses din virksomhed, og standardprisen indeholder ikke automatisk alle de funktioner, en demo viser. Illustrationerne er tegnet til denne side og er ikke skærmbilleder: de bruger ingen fotos, logoer, menukort eller tekster fra virksomhederne.',
  showLiveLinks: false,
  open: 'Se live-demo',
  more: 'Vil du se en demo i en rigtig browser, så skriv til mig, så viser jeg den.',
  calcCta: 'Beregn en lignende hjemmeside',
  labels: { task: 'Formål', features: 'Funktioner i demoen', views: 'Udsnit', design: 'Design' },
  seeAll: { label: 'Se alle demoer', href: paths.demoer },
  projects: [
    {
      id: 'salon',
      variant: 'feature',
      panel: '#241b14',
      name: 'Frisør- og barberdemo',
      kind: 'Frisør og barber',
      href: 'https://ronron-hr.github.io/salonmatin-demo/',
      calcType: 'salon',
      calcPurpose: 'booking',
      design:
        'Mørkt og redaktionelt: store overskrifter, rolige flader og god plads til billeder.',
      task: 'En frisør, hvor nogle kommer forbi, og andre booker. Siden skal få behandlinger og booking frem, før man begynder at lede.',
      features: [
        'Behandlinger med priser og varighed',
        'Bookingknap ved hver behandling, der fører til et eksisterende bookingsystem',
        'Holdet, historie og galleri',
        'Åbningstider, kort og kontaktoplysninger',
      ],
      label:
        'Illustration af frisør- og barberdemoen: mørk forside, historie, tre værdier og en behandlingsliste med bookingknapper.',
      labelMobile: 'Frisør- og barberdemoen, illustration på telefon.',
      excerpts: [
        { label: 'Forside', text: 'Tilbud og booking på første skærm', y: 0 },
        { label: 'Historien', text: 'Kort om salonen og håndværket', y: 1000 },
        { label: 'Behandlinger', text: 'Hver behandling har sin egen bookingknap', y: 2700 },
      ],
    },
    {
      id: 'belli',
      variant: 'wide',
      panel: '#6a1b22',
      name: 'Restaurantdemo',
      kind: 'Fransk brasserie',
      href: 'https://ronron-hr.github.io/belli-demo/',
      calcType: 'mad',
      calcPurpose: 'menu',
      design:
        'Bordeaux og lyse flader, stor typografi og en tidslinje, der fortæller husets historie.',
      task: 'Et hus med en lang historie og et menukort, der skifter. Siden skal vise stemningen først og gøre det nemt at bestille bord.',
      features: [
        'Menukort med faner til frokost, aften og vin',
        'Links til et eksisterende bordbookingsystem',
        'Historie, åbningstider og kort',
      ],
      label:
        'Illustration af restaurantdemoen: mørk forside med lamper og ternet dug, præsentation af huset, en bordeauxrød historiesektion og menuen.',
      labelMobile: 'Restaurantdemoen, illustration på telefon.',
      excerpts: [
        { label: 'Forside', text: 'Stemning først, bordbestilling lige ved siden af', y: 0 },
        { label: 'Huset', text: 'Kort præsentation og aktuelle beskeder', y: 850 },
        { label: 'Historien', text: 'Tidslinje i husets egne farver', y: 1550 },
      ],
    },
    {
      id: 'cafe',
      variant: 'tall',
      panel: '#f4c343',
      name: 'Cafédemo',
      kind: 'Café uden bordbestilling',
      href: 'https://ronron-hr.github.io/dengulecafe-demo/',
      calcType: 'mad',
      calcPurpose: 'menu',
      design: 'Kraftige farver i gul, lilla og rosa, runde former og billeder, der kastes ind som fotos på et bord.',
      task: 'En café, hvor gæsten bare skal vide, hvad der er på menuen, hvornår der er åbent, og hvordan man finder derhen.',
      features: [
        'Menu og åbningstider samlet på forsiden',
        'Billedgalleri',
        'Vejvisning med kort',
      ],
      label:
        'Illustration af cafédemoen: gul forside med polaroids, lyserød stribe med åbningstider og en lilla menu.',
      labelMobile: 'Cafédemoen, illustration på telefon.',
      excerpts: [
        { label: 'Forside', text: 'Hvad stedet er, og en knap til at finde vej', y: 0 },
        { label: 'Menu', text: 'Seks slags mad og drikke på ét blik', y: 718 },
        { label: 'Åbningstider', text: 'Dage og tider uden at lede', y: 1600 },
      ],
    },
    {
      id: 'vinbar',
      variant: 'feature',
      panel: '#1f221b',
      name: 'Vinbardemo',
      kind: 'Vinbar med cocktails',
      href: 'https://ronron-hr.github.io/manon-demo/',
      calcType: 'mad',
      calcPurpose: 'menu',
      design: 'Grønne og cremefarvede flader med serifskrift: stille og eftertænksomt.',
      task: 'En bar, hvor gæsten kan se, hvad der er åbent lige nu, og hvordan man kommer forbi eller booker til en gruppe.',
      features: [
        'Månedens vin og årstidens drink',
        'Kort med vin og cocktails',
        'Åbningstider med besked om, om der er åbent lige nu',
        'Kort, der først indlæses, når man trykker på det',
        'Bookinghenvendelse via e-mail',
      ],
      label:
        'Illustration af vinbardemoen: mørkegrøn forside med serifskrift, månedens vin og drink, et kort med vin og cocktails og en fortælling om stedet.',
      labelMobile: 'Vinbardemoen, illustration på telefon.',
      excerpts: [
        { label: 'Forside', text: 'Stemning og åbningstider først', y: 0 },
        { label: 'Denne måned', text: 'Månedens vin og årstidens drink', y: 900 },
        { label: 'Kortet', text: 'Vin og cocktails på et roligt kort', y: 1500 },
      ],
    },
  ],
}

export function demoById(id) {
  return demos.projects.find((p) => p.id === id) ?? null
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
  return `${paths.prisberegner}${s ? `?${s}` : ''}`
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
   KONTAKT — mail og telefon virker altid. Formularen sender ikke selv noget:
   den samler det, du skriver, i en mail og åbner din mailapp. Derfor viser
   den aldrig en "sendt"-besked. Der er ingen formularbackend.
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
    company: 'Virksomhed',
    message: 'Hvad vil du have hjælp til?',
    messagePlaceholder: 'Fx: Vi er en café med en gammel hjemmeside og vil gerne kunne tage imod bordbestillinger.',
    submit: 'Åbn e-mail med din besked',
    copy: 'Kopiér beskeden',
    copied: 'Beskeden er kopieret. Indsæt den i en mail til',
    copyFailed: 'Kunne ikke kopiere automatisk. Skriv i stedet direkte til',
    noMail: 'Har du ikke et mailprogram sat op?',
    note: 'Beskeden sendes i dit eget mailprogram, ikke fra denne side. Knappen åbner en færdig mail til mig, og først når du trykker send dér, når den mig.',
    opened:
      'Jeg har forsøgt at åbne dit mailprogram med beskeden. Husk at trykke send dér. Åbnede det sig ikke, kan du skrive direkte til',
  },
  phoneLabel: 'Foretrækker du at ringe?',
  inline: {
    title: 'Beskriv din opgave',
    intro: 'Skriv et par linjer, så vender jeg tilbage. Ingen pris og ingen binding, før vi har talt sammen.',
  },
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
export function composeParts({ topic, name, company, message }) {
  const label = topicLabel(topic)
  const subject = `${label} – henvendelse fra oviaspecs.com`
  const body = [
    'Hej Ronny,',
    '',
    `Emne: ${label}`,
    `Navn: ${name || ''}`,
    `Virksomhed: ${company || ''}`,
    '',
    message || 'Jeg vil gerne have hjælp til:',
    '',
    'Mvh',
    name || '',
  ].join('\n')
  return { subject, body }
}

/** Mailen, der følger med fra beregneren: valg, prisestimat og eventuel demo. */
export function composeCalcParts({ name, email, phone, wishes, type, purpose, pages, demo }) {
  const tier = pricing.tiers.find((t) => t.id === pages)
  const price = tier ? formatKr(tier.price) : null
  const subject = price
    ? `Hjemmeside, ${tier.label.toLowerCase()} (${price}) – henvendelse fra oviaspecs.com`
    : 'Hjemmeside, særskilt tilbud – henvendelse fra oviaspecs.com'
  const lines = [
    'Hej Ronny,',
    '',
    'Jeg har brugt prisberegneren på oviaspecs.com og vil gerne tale om min hjemmeside.',
    '',
    `Virksomhedstype: ${businessTypes.find((b) => b.id === type)?.label ?? ''}`,
    `Formål: ${purposes.find((p) => p.id === purpose)?.label ?? ''}`,
    `Antal sider (forsiden med): ${tier ? tier.label : pricing.custom.label}`,
    price
      ? `Prisestimat for selve hjemmesiden: ${price}`
      : 'Prisestimat: særskilt tilbud (opgaven ligger uden for standardprisen)',
  ]
  if (demo) lines.push(`Inspireret af: ${demoById(demo)?.name ?? demo}`)
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
  address: 'Hjortshøj Stationsvej 6, 8530 Hjortshøj',
  cvr: null,
  hosting: 'Cloudflare',
  mailProvider: 'Google (Gmail)',
  retentionMonths: 12,
  updated: '30. september 2026',
}

export const footer = {
  left: '© 2026 OviaSpecs',
  tagline: 'Hjemmesider, marketing og integrationer til lokale virksomheder.',
  columns: [
    {
      title: 'Hjemmesider',
      links: [
        { label: 'Hjemmesider', href: paths.hjemmesider },
        { label: 'Beregn din pris', href: paths.prisberegner },
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
