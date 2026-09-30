/* =========================================================================
   YDELSESSIDE: AI-AUTOMATISERING
   Ingen pris på siden. Eksempler er mulige løsninger, ikke færdige cases.
   ========================================================================= */

import { paths } from './content.js'

export const ai = {
  path: paths.ai,
  metaTitle: 'AI-automatisering og praktiske løsninger | OviaSpecs',
  metaDescription:
    'Få færre gentagne opgaver: beskeder, dataoverførsel og påmindelser kan gøres automatiske. Jeg anbefaler det enkleste, der virker, og bruger kun AI, hvor det giver mening.',
  eyebrow: 'AI-automatisering',
  title: 'Færre gentagne opgaver i hverdagen.',
  lead: 'Beskeder, oplysninger der skrives ind to gange, påmindelser: jeg finder de opgaver, der æder tid, og gør nogle af dem automatiske.',
  primary: { label: 'Beskriv en opgave', href: '#kontakt' },
  secondary: { label: 'Se et eksempel', href: '#eksempel' },
  visual: 'flow-ai',
  need: {
    eyebrow: 'Behovet',
    title: 'Nogle opgaver gentager sig hver uge, og ingen har lyst til dem.',
    body: [
      'Det kan være at overføre oplysninger fra ét system til et andet, sende den samme bekræftelse igen og igen eller sortere indkommende beskeder.',
      'Det er ofte små opgaver hver for sig, men de æder tid, og de bliver nemt glemt.',
    ],
  },
  solution: {
    eyebrow: 'Løsningen',
    title: 'Jeg kortlægger opgaven først og anbefaler det enkleste, der virker.',
    intro:
      'Nogle opgaver kan en AI-model hjælpe med, fx at sortere henvendelser eller lave et udkast til et svar. Andre løses bedre af en simpel regel. Jeg bruger kun AI, hvor det giver mening, og anbefaler ikke at sende svar til kunder uden, at et menneske har set dem.',
    parts: [
      { title: 'Kortlægning', text: 'Hvad gør I i hånden i dag, hvor tit, og hvad kan gå galt?' },
      { title: 'Opsætning', text: 'Værktøjerne forbindes, så oplysninger flyttes eller beskeder sendes af sig selv.' },
      { title: 'Gennemgang', text: 'Jeg viser, hvad der er automatiseret, hvad I stadig gør selv, og hvad I gør, hvis noget går galt.' },
    ],
  },
  deliver: {
    eyebrow: 'Det får du',
    title: 'Typiske leverancer',
    items: [
      'En beskrivelse af opgaven, som den ser ud i dag, og hvad der foreslås automatiseret',
      'En opsætning forbundet til de værktøjer, I allerede bruger',
      'En gennemgang af, hvad der er automatiseret, og hvad der stadig gøres i hånden',
    ],
    limitsTitle: 'Afgrænsning',
    limits: [
      'Abonnementer og eksterne værktøjer betales til udbyderne.',
      'Før noget sættes op, gennemgår vi, hvilke oplysninger der flyttes, især hvis det er personoplysninger.',
      'Omfang og pris vurderes efter opgaven. Der er ingen fast pris på siden.',
    ],
  },
  uses: {
    eyebrow: 'Eksempler',
    title: 'Hvad det kan være',
    intro: 'Eksempler på mulige løsninger, ikke færdige kundecases.',
    items: [
      { title: 'Lageroverblik', text: 'Et samlet overblik over varer og beholdning, så I kan se, hvad der er på lager, uden at lede flere steder.' },
      { title: 'Registrering og optælling', text: 'Værktøjer, der gør det lettere at registrere og tælle produkter. Selve optællingen foregår stadig i hånden, medmindre vi konkret aftaler andet.' },
      { title: 'Dataoverførsel mellem systemer', text: 'Oplysninger flyttes fra det ene system til det andet, i stedet for at nogen skriver dem ind to gange.' },
      { title: 'Beskeder og påmindelser', text: 'Automatiske beskeder, fx en bekræftelse til kunden eller en påmindelse, der ellers skulle sendes i hånden.' },
    ],
  },
  steps: [
    { title: 'Du beskriver en opgave', body: 'Én ad gangen, den der irriterer mest.' },
    { title: 'Jeg kortlægger og foreslår', body: 'Og siger ærligt, hvis den ikke egner sig til automatisering.' },
    { title: 'Vi aftaler omfang og pris', body: 'Skriftligt, før jeg går i gang.' },
    { title: 'Jeg sætter det op og gennemgår det', body: 'Så du ved, hvordan det virker.' },
  ],
  costs: {
    title: 'Pris',
    text: 'Vurderes efter opgavens omfang, så der er ingen fast pris. Abonnementer og eksterne systemer betales til udbyderen.',
  },
  faq: [
    {
      q: 'Skal jeg forstå AI for at bruge det?',
      a: 'Nej. Jeg forklarer, hvad der sker, og hvad du selv skal gøre. Ofte er en enkel regel bedre end AI.',
    },
    {
      q: 'Kan AI svare mine kunder helt selv?',
      a: 'Det anbefaler jeg ikke. Jeg foreslår, at et menneske ser svar igennem, før de sendes, medmindre det er en helt fast besked.',
    },
    {
      q: 'Kan du hjælpe med noget, der ikke står her?',
      a: 'Måske. Beskriv, hvad der driller, så vurderer jeg, om og hvordan jeg kan hjælpe. Kan jeg ikke, siger jeg det ligeud.',
    },
    {
      q: 'Hvad koster det?',
      a: 'Det afhænger af opgaven. Jeg giver et bud skriftligt, før noget starter. Abonnementer og eksterne systemer betales til udbyderen.',
    },
  ],
  contact: { label: 'Beskriv din opgave', topic: 'ai' },
}
