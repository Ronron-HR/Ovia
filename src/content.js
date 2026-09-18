/* =========================================================================
   AL TEKST PÅ SIDEN BOR HER
   Ret frit — komponenterne indeholder ingen tekst.

   [MANGLER] betyder: her skal du skrive noget, og jeg har ikke villet
   finde på det for dig. Søg efter "MANGLER" for at se, hvad der udestår.

   To ting du ikke må ændre uden at læse med:

   1. hero.lines SKAL være præcis to strenge. Koreografien i hero-loadet
      er bygget på to maskerede rækker. En streng må gerne brække til to
      linjer på mobil (rækken rejser sig så som én blok) — men antallet af
      rækker er låst til to.

   2. kontakt.lines SKAL være to eller tre strenge, af samme grund.

   Billeder: sæt src på et slot, og placeholderen forsvinder. Dimensionerne
   er låst af aspect-ratio, så der sker ingen layoutskift ved udskiftning.
   ========================================================================= */

export const site = {
  brand: 'Ovia',
  email: 'ronnyhong723@gmail.com',
  phone: '53 61 36 99',
  phoneHref: '+4553613699',
}

export const nav = {
  brand: 'Ovia',
  cta: { label: 'Skriv til mig', href: '#kontakt' },
}

/* -------------------------------------------------------------------------
   HERO-OVERSKRIFT — FEM FORSLAG

   Alle fem siger alderen højt og vender den til noget, læseren får ud af
   det. Skift tallet i HERO_LINES for at vælge, eller skriv dine egne to
   linjer nedenunder.

   0  Adgang        Du taler med den, der faktisk bygger siden.
   1  Fokus         Ét projekt ad gangen, ingen kø.
   2  Opmærksomhed  Kortest, og derfor den største typografi.
   3  Tryghed       Fast pris aftalt på forhånd.
   4  Pris uden tal Ingen bureau-overhead at betale for.
------------------------------------------------------------------------- */

export const heroLineOptions = [
  ['Jeg er 17 og bygger websites.', 'Du taler med den, der koder.'],
  ['17 år, ét projekt ad gangen.', 'Ikke nummer ti i køen.'],
  ['Jeg er 17.', 'Du får hele min opmærksomhed.'],
  ['Jeg er 17 og går i gymnasiet.', 'Fast pris, aftalt på forhånd.'],
  ['17 år. Intet bureau bagved.', 'Du betaler for arbejdet.'],
]

const HERO_LINES = 2

/* Portrættet. base peger på public/ronny.{avif,webp,jpg} — Slot vælger
   selv formatet. width/height er filens FAKTISKE mål, ikke slottets:
   Slot viser aldrig billedet større end det, og browseren kan reservere
   pladsen korrekt.

   Kilde 500×667, beskåret til 500×625. Den hvide studiebaggrund er
   skiftet til papirfarven i scripts/images.mjs. Skifter du foto: læg det
   i Pictures/, ret stien i scriptet, kør `npm run images`, og sæt de
   width/height, scriptet skriver ud. */
const portrait = {
  base: '/ronny',
  width: 500,
  height: 625,
  alt: 'Ronny, der står bag Ovia',
  ratio: '4 / 5',
  spec: 'Founder-portræt · 4:5',
}

export const hero = {
  lines: heroLineOptions[HERO_LINES],
  deck: 'Jeg bygger websites til danske virksomheder ved siden af gymnasiet. Fast pris, aftalt efter et kort kald.',
  primary: { label: 'Skriv til mig', href: '#kontakt' },
  secondary: null, // fx { label: 'Se mit arbejde', href: '#case' } når casen tændes
  portrait,
}

export const ydelser = {
  id: 'ydelser',
  eyebrow: 'Hvad jeg laver',
  title: 'Tre ting. Ikke ti.',
  intro:
    'Jeg er én person, så jeg har skåret fra, indtil der kun var det tilbage, jeg er god til.',
  // Antallet af punkter er frit. Stagger-reglen holder op til fem.
  items: [
    {
      title: 'Websites',
      body: 'Jeg bygger siden fra bunden, ikke på en skabelon. Den skal loade hurtigt, virke på mobil og se ud som noget, der hører til jer. Du ejer alt bagefter.',
    },
    {
      title: 'Social media',
      body: 'Jeg filmer og klipper content til TikTok, Instagram og Facebook, eller står for hele driften, så der rent faktisk bliver lagt noget op.',
    },
    {
      title: 'Annoncer',
      body: 'Meta- og TikTok-annoncer, når der er noget at annoncere for. Jeg siger fra, hvis det ikke giver mening endnu.',
    },
  ],
}

/* Casen er bygget og klar, men slukket. Sæt enabled: true, når Palmy
   skal frem — koreografien skal ikke bygges om.
   NB: mens den er slukket, låner Om mig-portrættet casens maskereveal,
   så siden ikke står uden sit tungeste visuelle greb. Tænder du casen,
   giver Om mig masken tilbage af sig selv. */
export const casePalmy = {
  enabled: false,
  id: 'case',
  eyebrow: 'Udvalgt arbejde',
  title: 'Palmy',
  meta: ['[MANGLER]', '[MANGLER]'],
  body: [
    '[MANGLER — hvad var opgaven, og hvad var galt med det, de havde?]',
    '[MANGLER — hvad gjorde du konkret? Håndværket er pointen, ikke resultatet.]',
  ],
  note: '[MANGLER — eller slet linjen.]',
  browser: {
    src: null,
    alt: '[MANGLER]',
    ratio: '16 / 10',
    spec: 'Browser-mockup · 16:10 · min. 2000×1250',
    url: '[MANGLER]',
  },
  phone: {
    src: null,
    alt: '[MANGLER]',
    ratio: '9 / 19.5',
    spec: 'Telefon · 9:19.5 · min. 900×1950',
  },
}

/* Overskriften er din egen første sætning, løftet op som h2, så den ikke
   står to gange. Vil du hellere have den i brødteksten, så flyt den ned
   som første element i body og skriv en anden overskrift. */
export const om = {
  id: 'om',
  eyebrow: 'Om mig',
  title: 'Jeg er 17 år og går på HHX i Aarhus.',
  body: [
    'Jeg bygger websites ved siden af skolen.',
    'Jeg har brugt stort set hele min ungdom online. Det er ikke et kursus, jeg har taget — det er dét, jeg har lavet, siden jeg var barn. Jeg ved, hvordan folk scroller, hvad de klikker væk fra, og hvad der får dem til at blive.',
    'Jeg er ny, og det siger jeg højt. Fordelen er, at du taler med den, der laver arbejdet, og at du får svar samme dag.',
  ],
  portrait,
}

export const proces = {
  id: 'proces',
  eyebrow: 'Sådan foregår det',
  title: 'Fire skridt. Du ved altid, hvor vi er.',
  steps: [
    {
      title: 'Vi taler sammen, 20 minutter',
      body: 'Du fortæller, hvad I laver, og hvad siden skal kunne. Jeg spørger ind.',
    },
    {
      title: 'Du får en fast pris',
      body: 'Én pris og en dato. Ikke et estimat, der vokser undervejs.',
    },
    {
      title: 'Du ser den undervejs',
      body: 'Du kigger på noget rigtigt i browseren tidligt, ikke et billede af en hjemmeside. Du kommenterer, jeg retter.',
    },
    {
      title: 'Den går live, og du ejer den',
      body: 'Domæne, hosting og det hele sat op. Jeg viser dig, hvordan du selv retter teksten. Ingen låst platform, du skal betale dig ud af.',
    },
  ],
}

export const kontakt = {
  id: 'kontakt',
  eyebrow: 'Kontakt',
  lines: ['Skal vi bygge', 'noget sammen?'],
  body: 'Skriv eller ring, og fortæl kort hvad du har brug for.',
  price: 'Prisen aftaler vi fast efter et kort kald — du får den at vide, inden vi går i gang.',
  cta: { label: 'Skriv til mig' },
  footnote: 'Eller ring:',

  /* Kontaktformular.
     endpoint: dit Formspree-id, fx 'xayzabcd' fra formspree.io/f/xayzabcd.
     Så længe den er null, vises knappen med mailto som hidtil — så er
     der ikke noget i stykker, mens den mangler. */
  form: {
    endpoint: null,
    name: 'Navn',
    email: 'Mail',
    message: 'Hvad har du brug for?',
    submit: 'Send',
    sending: 'Sender…',
    ok: 'Tak. Jeg vender tilbage samme dag.',
    error: 'Det gik galt. Skriv i stedet direkte til',
  },
}

export const footer = {
  left: '© 2026 Ovia',
}
