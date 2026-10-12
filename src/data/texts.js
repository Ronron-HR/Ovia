/* =========================================================================
   TEKSTER — forside, navigation, kontakt og footer.
   Priser og pakker står IKKE her, men i src/data/pricing.js. Beløb skrives
   aldrig som tekst: brug formatKr(...) med tal derfra.

   Sprog: jeg-form overalt (OviaSpecs er én person). "Vi" kun om dig og kunden
   sammen (fx "Vi mødes"), aldrig om OviaSpecs.
   Ærlighed: ingen udtalelser, kundetal, logoer eller resultater, der ikke
   kan dokumenteres. Ingen løfter om placeringer eller salg.
   Svartid: inden for 24 timer på hverdage (Ronnys eksisterende svartid).

   Importer ikke offer.js herfra: offer.js importerer denne fil.
   ========================================================================= */

import { contact, formatKr, lokal, lokalMinimum, priceNote } from './pricing.js'

export const paths = {
  home: '/',
  hjemmeside: '/hjemmeside/',
  marketing: '/marketing/',
  bookingGoogle: '/booking-google/',
  priser: '/priser/',
  demoer: '/demoer/',
  systemer: '/systemer/',
  privatliv: '/privatlivspolitik/',
  /** Ankre på forsiden og prissiden. */
  om: '/#om',
  koebsmaader: '/#koebsmaader',
  vilkaar: '/priser/#vilkaar',
  workflowDemo: '/systemer/#demo',
}

/** Sider med prisberegneren. "Se din pris" hopper til den på siden, ellers til /priser/. */
const calcPages = [paths.home, paths.hjemmeside, paths.marketing, paths.bookingGoogle, paths.priser]

/** Adressen til prisberegneren set fra en given side. */
export const calcHref = (path) => {
  const clean = path.endsWith('/') ? path : `${path}/`
  return calcPages.includes(clean) ? '#beregner' : `${paths.priser}#beregner`
}

/** Klikbare kontaktadresser. Bruges af alle knapper. */
export const links = {
  tel: `tel:${contact.phoneHref}`,
  mail: `mailto:${contact.email}`,
  sms: (text = contact.smsText) => `sms:${contact.phoneHref}?&body=${encodeURIComponent(text)}`,
}

/**
 * Navigationen. Formen:
 *   nav.solutions = { label, ariaLabel, items: [{ label, href, text }] }  // "Løsninger" (disclosure på desktop, liste under overskrift på mobil)
 *   nav.items     = [{ label, href }]                                       // resten: Eksempler, Priser, Om og kontakt
 * Rækkefølgen i menuen: solutions, derefter items.
 */
export const nav = {
  brand: 'OviaSpecs',
  solutions: {
    label: 'Løsninger',
    ariaLabel: 'Vis løsninger',
    items: [
      { label: 'Hjemmesider', href: paths.hjemmeside, text: 'Hjemmeside til din virksomhed' },
      { label: 'Lokal synlighed', href: paths.bookingGoogle, text: 'Google-profil, lokal SEO, booking og QR-skilt' },
      { label: 'Systemer', href: paths.systemer, text: 'Små arbejdsgange, når du har brug for dem' },
      { label: 'Marketing', href: paths.marketing, text: 'Korte videoer og opslag hver måned' },
    ],
  },
  items: [
    { label: 'Eksempler', href: paths.demoer },
    { label: 'Priser', href: paths.priser },
    { label: 'Om og kontakt', href: paths.om },
  ],
  call: 'Ring',
  /** Knappen til prisberegneren: lang på desktop, kort på mobil. */
  price: 'Se din pris',
  priceShort: 'Se din pris',
  menu: 'Menu',
  close: 'Luk',
}

/** Den korte linje over prisberegneren på ydelsessiderne. */
export const calcIntro = 'Vælg først, om du vil have et løbende samarbejde eller købe hjemmesiden. Så ser du prisen med det samme.'

/** Teksterne på knapperne "Ring" og "Mail". */
export const cta = {
  call: 'Ring',
  write: 'Mail',
  sms: 'SMS',
  price: 'Se din pris',
}

/* ---- Forsiden ---------------------------------------------------------- */

/** Tilbudslinjen (opstart, månedspris og minimumsperiode) bygget af tallene i pricing.js. */
const offerLine = `${formatKr(lokal.start)} i opstart · ${formatKr(lokal.monthly)}/md. · mindst ${lokal.minMonths} måneder`

export const home = {
  hero: {
    title: 'En hjemmeside, der gør det nemt at vælge din virksomhed.',
    /** Den korte forklaring under overskriften: hjemmeside, lokal synlighed, direkte kontakt og tilbuddet. */
    short:
      'Jeg laver hjemmesiden, forbedrer din synlighed på Google i dit lokalområde og gør det nemt for kunderne at kontakte dig direkte. Nyt er en hjemmeside uden opstartspris, hvor du betaler en fast månedspris.',
    /** Hovedhandlingen (hopper til købsmåderne med priser og minimumsbetaling). */
    cta: 'Se priser',
    ctaHref: '#koebsmaader',
    /** Den sekundære handling ved siden af (Ring og Mail står i kontaktlinjen). */
    secondary: { label: 'Se eksempler', href: paths.demoer },
    /**
     * Tilbuddet. Overskriften nævner ikke "gratis": abonnementet står altid ved siden af.
     * line + minimum bygges af pricing.js; link fører til købsmåderne og vilkårene.
     */
    offer: {
      heading: 'Hjemmeside uden opstartspris',
      line: offerLine,
      minimum: `I alt mindst ${formatKr(lokalMinimum())}`,
      note: `${priceNote} Du kan i stedet købe hjemmesiden som et engangsbeløb.`,
      link: { label: 'Se begge måder at købe på', href: '#koebsmaader' },
    },
    /** Faktaboksen: kun det, tilbuddet i forvejen lover. */
    factsTitle: 'Det er med i Lokal',
    facts: [
      `${lokal.pages.min}–${lokal.pages.max} indholdssider, der virker på telefonen`,
      'Indledende SEO og hjælp til din Google-profil',
      `Op til ${lokal.minutes.seo} minutters lokal SEO og ${lokal.minutes.content} minutters rettelser hver måned`,
      'Et udkast, du kan se, før noget går live',
    ],
  },

  /** Overskriften over prisberegneren på forsiden (selve beregneren har sin egen overskrift). */
  calc: {
    title: 'Beregn din pris',
    intro:
      'Vælg først, om du vil have et løbende samarbejde eller købe hjemmesiden. Så ser du opstart, månedspris og minimumsbetaling med det samme. Du kan altid ringe i stedet.',
  },

  cards: {
    title: 'Det kan jeg hjælpe med',
    intro: 'Vælg en eller flere ydelser. Prisen ser du i beregneren.',
    items: [
      {
        service: 'hjemmeside',
        title: 'Hjemmeside',
        text: 'En hurtig side, der virker på telefonen og viser, hvad du laver, hvornår du har åbent, og hvordan man kontakter dig.',
        href: paths.hjemmeside,
      },
      {
        service: 'marketing',
        title: 'Marketing',
        text: 'Korte videoer og opslag hver måned, så dine kunder ser dig på de sociale medier.',
        href: paths.marketing,
      },
      {
        service: 'bookingGoogle',
        title: 'Lokal synlighed',
        text: 'Din Google-profil i orden, booking koblet på og et QR-skilt, der gør det nemt at give dig en anmeldelse.',
        href: paths.bookingGoogle,
      },
    ],
    more: 'Se pakker',
  },

  /** Demoer lige under tilbuddet (id fra src/content.demos.js). Kun egne, fiktive demoer. */
  examples: {
    title: 'Se, hvad jeg selv har lavet',
    note: 'Tre eksempler, jeg har lavet selv, så du kan se stil og funktioner. Indholdet er opdigtet, og intet sendes, bestilles eller bookes.',
    tag: 'Demo',
    open: 'Åbn demoen',
    all: 'Se alle eksempler',
    /** Beskårne udsnit (uden OviaSpecs-striben), lavet af scripts/demo-shots.mjs --crops-only. */
    items: [
      {
        id: 'restaurant',
        preview: {
          desktop: { src: '/demoer/restaurant-udsnit-desktop.webp', width: 680, height: 470 },
          mobile: { src: '/demoer/restaurant-udsnit-mobile.webp', width: 340, height: 600 },
        },
        fits: 'Passer til en restaurant eller café, der vil vise menukortet. Bordbestilling kan lægges til som tilvalg.',
      },
      {
        id: 'salon',
        preview: {
          desktop: { src: '/demoer/salon-udsnit-desktop.webp', width: 680, height: 470 },
          mobile: { src: '/demoer/salon-udsnit-mobile.webp', width: 340, height: 600 },
        },
        fits: 'Passer til en salon eller frisør, der vil vise behandlinger og priser. Online booking kan lægges til som tilvalg.',
      },
    ],
    /** Det tredje kort: arbejdsgangsdemoen på /systemer/#demo. Ingen forhåndsvisning; D tegner kortet. */
    workflow: {
      title: 'Prøv en arbejdsgang',
      text: 'En lille demo af en forespørgsel om et selskab. Du udfylder en formular og ser forespørgslen i et overblik med status og en påmindelse.',
      href: paths.workflowDemo,
      tag: 'Demo',
      label: 'Demo – ikke et færdigt system. Intet sendes eller gemmes.',
      open: 'Prøv demoen',
    },
  },

  /** Forløbet i fem trin (genbruges som offer.process og på ydelsessiderne). */
  steps: {
    eyebrow: 'Sådan foregår det',
    title: 'Fra første samtale til løbende hjælp.',
    items: [
      {
        title: 'Afklaring',
        text: 'Vi taler om din virksomhed, dine kunder og det, du har brug for. Jeg siger det, hvis noget ikke giver mening for dig.',
      },
      {
        title: 'Aftalt omfang',
        text: 'Jeg skriver sider, pris og vilkår ned, og du godkender, før jeg går i gang. I Lokal betales første måned, før jeg bygger færdigt. Beløbet fratrækkes første abonnementsmåned og er ikke et startgebyr.',
      },
      {
        title: 'Udkast og godkendelse',
        text: 'Jeg laver et udkast, du kan åbne på din egen telefon. Du siger til, hvad der skal rettes. Antallet af korrekturrunder står i det aftalte omfang.',
      },
      {
        title: 'Lancering',
        text: 'Når du har godkendt, går siden live. Jeg viser dig, hvordan den virker, og hvordan du kontakter mig bagefter.',
      },
      {
        title: 'Løbende hjælp',
        text: 'I Lokal får du hver måned lidt SEO-arbejde og en kort status. Køber du hjemmesiden som engangsbeløb, vælger du selv en driftsplan.',
      },
    ],
  },
}

/* ---- Om ---------------------------------------------------------------- */

export const about = {
  id: 'om',
  eyebrow: 'Om OviaSpecs',
  title: 'Jeg er én person. Det er mig, du taler med.',
  body: [
    'Jeg hedder Ronny Hong, og OviaSpecs er mig. Min base er Aarhusområdet. Der er ingen sælger, ingen projektleder og ingen kundeservice. Den, du taler med, er den, der laver arbejdet.',
    'OviaSpecs er nyt, og eksemplerne på siden er mine egne, ikke kundeopgaver. Derfor fortæller jeg på forhånd, hvad du får, og hvad det koster.',
    'Ligger en opgave uden for det, jeg kan, siger jeg det, før jeg går i gang. Har du ikke brug for et system eller et nyt bookingsystem, siger jeg også det.',
  ],
  portrait: {
    base: '/ronny',
    width: 500,
    height: 625,
    alt: 'Portræt af Ronny Hong, der står bag OviaSpecs',
  },
}

/* ---- Kontakt (bunden af hver side) ------------------------------------- */

export const contactSection = {
  id: 'kontakt',
  eyebrow: 'Kontakt',
  title: 'Tal direkte med mig',
  body: 'Ring, skriv eller send en SMS, og fortæl kort, hvad du laver, og hvad du mangler. Jeg hjælper dig med at finde ud af, hvad der giver mening, og du taler med mig selv, ikke en sælger. Det koster ikke noget at spørge.',
  /** Kun om formularen under prisberegneren (svartiden er Ronnys eksisterende). */
  formNote:
    'Foretrækker du at skrive, kan du sende en forespørgsel med dine valg fra beregneren. Det er en forespørgsel og ikke en bestilling. Jeg svarer inden for 24 timer på hverdage.',
  phoneLabel: 'Telefon',
  mailLabel: 'Mail',
  smsHint: 'Eller send en SMS',
}

/* ---- Footer ------------------------------------------------------------ */

export const footer = {
  tagline: 'Hjemmesider, lokal synlighed på Google, små systemer og korte videoer til mindre virksomheder. Du taler direkte med Ronny, som har base i Aarhusområdet.',
  columns: [
    {
      title: 'Løsninger',
      links: [
        { label: 'Hjemmesider', href: paths.hjemmeside },
        { label: 'Lokal synlighed', href: paths.bookingGoogle },
        { label: 'Systemer', href: paths.systemer },
        { label: 'Marketing', href: paths.marketing },
      ],
    },
    {
      title: 'OviaSpecs',
      links: [
        { label: 'Eksempler', href: paths.demoer },
        { label: 'Priser', href: paths.priser },
        { label: 'Vilkår', href: paths.vilkaar },
        { label: 'Om og kontakt', href: paths.om },
        { label: 'Privatlivspolitik', href: paths.privatliv },
      ],
    },
  ],
  copyright: '© 2026 OviaSpecs',
}

/* ---- Metadata pr. side ------------------------------------------------- */

export const meta = {
  home: {
    title: 'OviaSpecs | Hjemmeside, marketing og booking til virksomheder',
    description:
      'Jeg hjælper virksomheder med hjemmeside, Google-profil, booking og korte videoer. Klare priser, og du taler med den, der laver arbejdet. Ring 53 61 36 99.',
  },
}

/* ---- Privatlivspolitik ------------------------------------------------- */

export const privacy = {
  updated: '12. oktober 2026',
  /** Henvendelser slettes efter så mange måneder (også automatisk i databasen, worker/index.js). */
  retentionMonths: 12,
  /** [udbyder, hvad den bruges til] */
  providers: [
    [
      'Cloudflare',
      'hosting af siden, serverlogs, besøgsstatistik (Web Analytics), databasen med henvendelser fra formularen (D1), spamfilter på formularen (Turnstile) og afsendelse og videresendelse af mail (Email Routing).',
    ],
    ['Google (Gmail)', 'den mailboks, mailen bliver modtaget i.'],
  ],
}
