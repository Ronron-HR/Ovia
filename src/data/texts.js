/* =========================================================================
   TEKSTER — forside, navigation, kontakt og footer.
   Priser og pakker står IKKE her, men i src/data/pricing.js.

   Sprog: jeg-form overalt (OviaSpecs er én person). "Vi" kun om dig og kunden
   sammen (fx "Vi mødes"), aldrig om OviaSpecs.
   Ærlighed: ingen udtalelser, kundetal, logoer eller resultater, der ikke
   kan dokumenteres. Ingen løfter om placeringer eller salg.
   Svartid: inden for 24 timer (besluttet af Ronny, okt. 2026).
   ========================================================================= */

import { contact } from './pricing.js'

export const paths = {
  home: '/',
  hjemmeside: '/hjemmeside/',
  marketing: '/marketing/',
  bookingGoogle: '/booking-google/',
  priser: '/priser/',
  demoer: '/demoer/',
  privatliv: '/privatlivspolitik/',
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

export const nav = {
  brand: 'OviaSpecs',
  items: [
    { label: 'Hjemmeside', href: paths.hjemmeside },
    { label: 'Marketing', href: paths.marketing },
    { label: 'Booking & Google', href: paths.bookingGoogle },
    { label: 'Priser', href: paths.priser },
  ],
  call: 'Ring',
  /** Knappen til prisberegneren: lang på desktop, kort på mobil. */
  price: 'Se din pris',
  priceShort: 'Se din pris',
  menu: 'Menu',
  close: 'Luk',
}

/** Den korte linje over prisberegneren på ydelsessiderne. */
export const calcIntro = 'Svar på et par spørgsmål, så ser du prisen med det samme.'

/** Teksterne på knapperne "Ring" og "Mail". */
export const cta = {
  call: 'Ring',
  write: 'Mail',
  sms: 'SMS',
  price: 'Se din pris',
}

/* ---- Forsiden ---------------------------------------------------------- */

export const home = {
  hero: {
    title: 'Hjemmeside, Google og booking til virksomheder',
    /** Den korte forklaring under overskriften. */
    short: 'Jeg laver det hele selv, og du taler direkte med mig. Svar på et par spørgsmål, så ser du prisen med det samme.',
    /** Hovedhandlingen (hopper til beregneren). */
    cta: 'Se din pris',
    /** Faktaboksen: kun det, siden i forvejen lover. */
    factsTitle: 'Det får du',
    facts: [
      'En hjemmeside, der virker på telefonen',
      'Google-profil og online booking',
      'Korte videoer til de sociale medier',
      'Et udkast, du kan se, før noget går live',
    ],
  },

  /** Overskriften over prisberegneren på forsiden (selve beregneren har sin egen overskrift). */
  calc: {
    title: 'Se din pris',
    intro: 'Svar på et par spørgsmål, så ser du prisen med det samme. Du kan altid ringe i stedet.',
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
        title: 'Booking & Google',
        text: 'En Google-profil, der er i orden, online booking og et skilt, der hjælper dig med at få anmeldelser.',
        href: paths.bookingGoogle,
      },
    ],
    more: 'Se pakker',
  },

  /** To demoer lige under beregneren (id fra src/content.demos.js). Kun egne, fiktive demoer. */
  examples: {
    title: 'Se, hvordan en hjemmeside kan se ud',
    note: 'To eksempler, jeg selv har lavet, så du kan se stil og funktioner. Indholdet er opdigtet, og intet sendes, bestilles eller bookes.',
    tag: 'Demo',
    open: 'Åbn demoen',
    all: 'Se alle fire eksempler',
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
  },

  steps: {
    eyebrow: 'Sådan foregår det',
    title: 'Tre trin, og så er det live.',
    items: [
      {
        title: 'Vi mødes',
        text: 'Vi gennemgår det, du har valgt, og jeg bekræfter prisen.',
      },
      {
        title: 'Du ser en demo',
        text: 'Jeg laver et udkast, du kan åbne på din egen telefon. Du siger til, hvad der skal ændres.',
      },
      {
        title: 'Det går live',
        text: 'Når du er tilfreds, går det live. Jeg viser dig, hvordan det virker, og du ved, hvem du skal ringe til bagefter.',
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
    'Jeg hedder Ronny Hong, og OviaSpecs er mig. Der er ingen sælger, ingen projektleder og ingen kundeservice. Den, du taler med, er den, der laver arbejdet.',
    'OviaSpecs er nyt. Du får klare priser, et udkast du kan se, før det går live, og én at ringe til, når noget skal rettes.',
    'Hvis en opgave ligger uden for det, jeg kan, siger jeg det, før jeg går i gang.',
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
  /** Kun om formularen under prisberegneren (svartiden er besluttet af Ronny). */
  formNote: 'Foretrækker du at skrive, kan du sende en forespørgsel med dine valg fra prisberegneren. Jeg svarer inden for 24 timer.',
  phoneLabel: 'Telefon',
  mailLabel: 'Mail',
  smsHint: 'Eller send en SMS',
}

/* ---- Footer ------------------------------------------------------------ */

export const footer = {
  tagline: 'Hjemmeside, Google-profil, booking og korte videoer til virksomheder. Du taler direkte med mig.',
  columns: [
    {
      title: 'Ydelser',
      links: [
        { label: 'Hjemmeside', href: paths.hjemmeside },
        { label: 'Marketing', href: paths.marketing },
        { label: 'Booking & Google', href: paths.bookingGoogle },
      ],
    },
    {
      title: 'OviaSpecs',
      links: [
        { label: 'Priser', href: paths.priser },
        { label: 'Eksempler', href: paths.demoer },
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
  updated: '7. oktober 2026',
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
