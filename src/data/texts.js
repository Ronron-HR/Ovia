/* =========================================================================
   TEKSTER — forside, navigation, kontakt og footer.
   Priser og pakker står IKKE her, men i src/data/pricing.js.

   Sprog: jeg-form overalt (OviaSpecs er én person). "Vi" kun om dig og kunden
   sammen (fx "Vi mødes"), aldrig om OviaSpecs.
   Ærlighed: ingen udtalelser, kundetal, logoer eller resultater, der ikke
   kan dokumenteres. Ingen løfter om svartider, placeringer eller salg.
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
  menu: 'Menu',
  close: 'Luk',
}

/** Teksterne på knapperne "Ring" og "Skriv". */
export const cta = {
  call: 'Ring',
  write: 'Skriv',
  sms: 'SMS',
}

/* ---- Forsiden ---------------------------------------------------------- */

export const home = {
  hero: {
    eyebrow: 'Til lokale virksomheder',
    title: 'Jeg sørger for, at kunderne finder dig online og har let ved at tage kontakt.',
    lead: 'Hjemmeside, Google-profil, booking og korte videoer. Du får klare priser, og det er mig, der laver arbejdet.',
    who: `Du taler med mig, ${contact.name.split(' ')[0]}. Hele vejen.`,
    prices: { label: 'Se priser', href: paths.priser },
  },

  cards: {
    eyebrow: 'Det kan jeg hjælpe med',
    title: 'Vælg det, du mangler.',
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

  steps: {
    eyebrow: 'Sådan foregår det',
    title: 'Tre trin, og så er det live.',
    items: [
      {
        title: 'Vi mødes',
        text: 'Jeg kigger forbi eller ringer til dig. Du fortæller, hvad du har brug for, og jeg siger, hvad det koster.',
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
    'Jeg er en lille virksomhed i Aarhus-området og har ikke en lang kundeliste at vise frem endnu. Til gengæld får du klare priser, et udkast du kan se, før det går live, og én at ringe til, når noget skal rettes.',
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
  title: 'Ring eller skriv. Så tager jeg den derfra.',
  body: 'Fortæl kort, hvad du laver, og hvad du mangler. Det koster ikke noget at spørge.',
  phoneLabel: 'Telefon',
  mailLabel: 'Mail',
  smsHint: 'Eller send en SMS',
}

/* ---- Footer ------------------------------------------------------------ */

export const footer = {
  tagline: 'Hjemmesider, marketing og booking til lokale virksomheder.',
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
        { label: 'Koncepter', href: paths.demoer },
        { label: 'Privatlivspolitik', href: paths.privatliv },
      ],
    },
  ],
  copyright: '© 2026 OviaSpecs',
}

/* ---- Metadata pr. side ------------------------------------------------- */

export const meta = {
  home: {
    title: 'OviaSpecs | Hjemmeside, marketing og booking til lokale virksomheder',
    description:
      'Jeg hjælper lokale virksomheder med hjemmeside, Google-profil, booking og korte videoer. Klare priser, og du taler med den, der laver arbejdet. Ring 53 61 36 99.',
  },
}

/* ---- Privatlivspolitik ------------------------------------------------- */

export const privacy = {
  updated: '1. oktober 2026',
  retentionMonths: 12,
  /** [udbyder, hvad den bruges til] */
  providers: [
    ['Cloudflare', 'hosting af siden, serverlogs og videresendelse af mail til kontakt@oviaspecs.com (Email Routing).'],
    ['Google (Gmail)', 'den mailboks, mailen bliver modtaget i.'],
  ],
}
