/* =========================================================================
   TEKSTER TIL YDELSESSIDERNE (/hjemmeside/, /marketing/, /booking-google/)
   Priser, pakkeindhold og vilkår hentes fra pricing.js og står ikke her.

   Regler: jeg-form. Ingen opdigtede tal, resultater eller statistikker og
   ingen løfter om flere kunder eller mere salg. Lov kun det, der leveres.
   ========================================================================= */

import {
  bookingSubscriptionNote,
  calculator,
  contact,
  driftFrom,
  driftPlanList,
  formatKr,
  fromPrice,
  paidStartText,
  priceNote,
  services,
  tierName,
} from './pricing.js'
import { paths } from './texts.js'

const web = services.hjemmeside
/** "Start koster X kr., Vækst Y kr. og Fuld fart Z kr." ud fra pricing.js (altid med punktum til sidst). */
const tierList = (service, unit = '') => {
  const parts = service.tiers.map((t) => `${tierName(t)} ${formatKr(t.price)}${unit}`)
  const s = `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`.replace(/^(\S+)/, '$1 koster')
  return s.endsWith('.') ? s : `${s}.`
}

/** "Hvornår kan vi starte?": ydelsens startNow, ellers paidStartText. Skjules, når begge er tomme. */
const startFaq = (service) => {
  const a = service.startNow || paidStartText
  return a ? [{ q: 'Hvornår kan vi starte?', a }] : []
}

const toCalculator = { label: 'Se din pris', href: paths.priser }

/* ---- Hjemmeside -------------------------------------------------------- */

/** Planerne med månedspris ("Basis ..., Plus ... og Ekstra ...") ud fra driftPlans i pricing.js. */
const planList = () => {
  const parts = driftPlanList.map((p) => `${p.name} ${formatKr(p.monthly)}/md`)
  return `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`
}

export const hjemmeside = {
  service: 'hjemmeside',
  meta: {
    title: 'Hjemmeside til lokale virksomheder | OviaSpecs',
    description: `En hjemmeside, der virker på mobilen. Tre faste pakker fra ${formatKr(web.tiers[0].price)} plus drift fra ${formatKr(driftFrom)}/md. Ring ${contact.phone}.`,
  },
  eyebrow: 'Hjemmeside',
  title: 'Dine kunder leder efter dig på mobilen.',
  problem: [
    'Når nogen hører om dig, slår de dig op på telefonen. Mangler hjemmesiden, eller er den forældet, går de videre til den næste.',
    'Jeg laver en side, der viser, hvad du laver, hvornår du har åbent, og hvordan man kontakter dig.',
  ],
  toPackages: 'Se pakker',
  get: {
    eyebrow: 'Det får du',
    title: 'En side, der gør det nemt at vælge dig.',
    items: [
      { title: 'Lavet til telefonen', text: 'Siden er bygget til mobilen først og virker også på computeren.' },
      { title: 'Det vigtigste øverst', text: 'Hvad du laver, dine åbningstider og en knap til at ringe eller skrive.' },
      { title: 'Synlig på Google', text: 'I Vækst og Fuld fart sætter jeg din Google-profil op, så du kan blive fundet.' },
      { title: 'Drift hver måned', text: `Siden holdes online og sikker, med domæne og backup. Du vælger Basis, Plus eller Ekstra, alt efter hvor meget indholdsarbejde du vil have med.` },
    ],
  },
  concepts: {
    eyebrow: 'Eksempler',
    title: 'Sådan kan det se ud.',
    intro:
      'Fire hjemmesider, jeg har lavet som eksempler. De er ikke lavet for rigtige kunder, men de virker, så du kan prøve dem på din telefon.',
    more: 'Se alle eksempler',
  },
  packages: {
    eyebrow: 'Pakker',
    title: 'Tre pakker. Klare priser.',
    intro: 'Du vælger to ting: pakken, du betaler én gang, og driftsplanen, du betaler hver måned.',
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Hvad koster det?',
        a: `${tierList(web)} Dertil kommer drift hver måned: ${planList()}. Du kan vælge en hvilken som helst plan til en hvilken som helst pakke. ${web.upgradeNote} I Fuld fart koster en ekstra underside ud over 8 sider ${formatKr(web.addons.extraPage.price)}. ${priceNote && !priceNote.endsWith('.') ? `${priceNote}.` : priceNote}`,
      },
      {
        q: 'Hvad er inkluderet i drift?',
        a: `${web.drift.included.join('. ')}, i alle tre planer. Forskellen er indholdsarbejde: ${driftPlanList.map((p) => `${p.name}: ${p.content.toLowerCase()}`).join('. ')}. ${web.drift.contentWork} ${web.drift.notContentWork} ${web.drift.unusedTime} ${web.drift.extraWork} ${web.drift.morePagesFaq(formatKr(web.addons.extraPage.price))}`,
      },
      {
        q: 'Hvilken driftsplan skal jeg vælge?',
        a: `Den mindste, der dækker dit behov. Skal du ikke have ændret noget, er ${driftPlanList[0].name} nok. ${driftPlanList[1].name} passer til små ændringer nu og da, og ${driftPlanList[2].name} til dig, der jævnligt skal have ændret tekst og billeder. Planen er uafhængig af, hvilken pakke du vælger.`,
      },
      {
        q: 'Hvem ejer domænet og siden?',
        a: `${web.drift.domain} Vil du have siden på din egen konto fra starten, koster det ${formatKr(web.addons.ownAccount.price)} ekstra én gang i stedet for en driftsplan (på alle pakker). ${web.addons.ownAccount.note} ${web.drift.buyout(formatKr(web.drift.buyoutPrice))}`,
      },
      {
        q: 'Hvad hvis jeg vil stoppe?',
        a: `${web.drift.binding} ${web.drift.buyout(formatKr(web.drift.buyoutPrice))}`,
      },
      { q: 'Hvor lang tid tager det?', a: web.leadTime },
      ...startFaq(web),
    ],
  },
  contact: {
    title: 'Skal jeg kigge på din hjemmeside?',
    body: 'Ring eller skriv, og fortæl mig, hvad din side skal kunne.',
  },
}

/* ---- Marketing --------------------------------------------------------- */

const mk = services.marketing
const pilot = mk.pilot

export const marketing = {
  service: 'marketing',
  meta: {
    title: 'Marketing: korte videoer og opslag | OviaSpecs',
    description: `Korte videoer og opslag til dine sociale medier hver måned. Tre faste pakker fra ${formatKr(mk.tiers[0].price)}/md. Ingen binding. Ring ${contact.phone}.`,
  },
  eyebrow: 'Marketing',
  title: 'Korte videoer er det, folk ser.',
  problem: [
    'Men det tager tid at filme, klippe og lægge dem op, når du også skal passe din forretning.',
    'Jeg laver videoerne og opslagene for dig hver måned.',
  ],
  toPackages: 'Se pakker',
  get: {
    eyebrow: 'Det får du',
    title: 'Indhold hver måned. Uden at du skal lave det.',
    items: [
      { title: 'Korte videoer', text: 'Jeg laver korte videoer til dine sociale medier. Antallet står i pakken.' },
      { title: 'Opslag', text: 'I Vækst og Fuld fart får du også opslag hver måned.' },
      { title: 'Jeg poster for dig', text: 'I Vækst og Fuld fart lægger jeg indholdet op. I Start poster du selv.' },
      { title: 'Månedsrapport', text: 'I Vækst og Fuld fart får du en rapport hver måned.' },
      { title: 'Meta-annoncer', text: 'I Fuld fart styrer jeg dine annoncer på Meta. Annoncebudgettet betaler du selv.' },
      { title: 'Ingen binding', text: mk.binding },
    ],
  },
  pilot: {
    eyebrow: 'Pilotforløb',
    title: `Prøv det gratis i ${pilot.weeks} uger.`,
    intro: 'Jeg har ingen marketingcases at vise endnu. Derfor tilbyder jeg et pilotforløb i stedet for at fortælle om resultater, jeg ikke har.',
    termsTitle: 'Sådan fungerer piloten',
    mailSubject: 'Pilotforløb (marketing)',
    smsText: 'Hej Ronny. Jeg er interesseret i et pilotforløb med marketing.',
  },
  packages: {
    eyebrow: 'Pakker',
    title: 'Tre pakker. Fast pris hver måned.',
    intro: mk.binding,
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Hvad er et pilotforløb?',
        a: `${pilot.weeks} uger gratis med ${pilot.scope}. Til gengæld må jeg bruge resultaterne som case, og er du tilfreds, giver du en ærlig udtalelse. Det er uforpligtende, og bagefter kan du fortsætte på ${tierName({ id: pilot.continueOn })}. Jeg har max ${pilot.maxAtOnce} piloter ad gangen.`,
      },
      {
        q: 'Skal jeg selv poste?',
        a: 'I Start poster du selv. I Vækst og Fuld fart lægger jeg indholdet op for dig. Hvor mange kanaler, står i pakken.',
      },
      {
        q: 'Hvem betaler annoncerne?',
        a: 'Du betaler selv annoncebudgettet direkte til Meta. I Fuld fart styrer jeg annoncerne, og det er med i månedsprisen.',
      },
      { q: 'Er der binding?', a: mk.binding },
      ...startFaq(mk),
    ],
  },
  contact: {
    title: 'Skal jeg lave dine videoer?',
    body: 'Ring eller skriv, så hjælper jeg dig med at vælge mellem en pilot og en pakke.',
  },
}

/* ---- Booking & Google -------------------------------------------------- */

const bg = services.bookingGoogle

export const bookingGoogle = {
  service: 'bookingGoogle',
  meta: {
    title: 'Booking & Google-profil til lokale virksomheder | OviaSpecs',
    description: `Google-profil i orden, online booking og et QR-skilt til anmeldelser. Klare priser fra ${formatKr(bg.tiers[0].price)} Start med et gratis tjek af din Google-profil.`,
  },
  eyebrow: 'Booking & Google',
  title: 'Det første, kunderne ser, er din Google-profil.',
  problem: [
    'Forkerte åbningstider, få billeder eller ingen booking-knap koster dig henvendelser.',
    'Jeg sætter profilen i orden og gør det nemt at booke dig og at give dig en anmeldelse.',
  ],
  toPackages: 'Se pakker',
  /** Ekstra link i toppen til det gratis tjek (#tjek). */
  heroLink: { label: 'Start med et gratis tjek af din Google-profil', href: '#tjek' },
  get: {
    eyebrow: 'Det får du',
    title: 'En profil, der passer, og en nem vej ind.',
    items: [
      { title: 'Rigtige oplysninger', text: 'Åbningstider, kontakt og billeder på din Google-profil, så de passer.' },
      { title: 'Booking-knap', text: 'I Vækst og Fuld fart kobler jeg booking på din hjemmeside eller Instagram.' },
      { title: 'QR-skilt', text: 'I Fuld fart får du et skilt, der beder alle kunder om en anmeldelse.' },
      { title: 'Opfølgning', text: 'I Fuld fart følger jeg op efter 30 dage og viser dig tallene.' },
    ],
  },
  check: {
    eyebrow: 'Start her',
    priceLabel: formatKr(bg.freeCheck.price),
    mailSubject: 'Gratis tjek af min Google-profil',
    smsText: 'Hej Ronny. Vil du tjekke min Google-profil?',
  },
  packages: {
    eyebrow: 'Pakker',
    title: 'Tre pakker. Du betaler én gang.',
    notes: [calculator.bookingDriftNote, bookingSubscriptionNote],
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Hvilke bookingsystemer kan du koble på?',
        a: `Fx Planway, Booksy eller det system, du allerede bruger. Bookingsystemerne er lavet af andre firmaer, så jeg kan ikke give garanti for dem. ${bookingSubscriptionNote}`,
      },
      {
        q: 'Kan du skaffe mig anmeldelser?',
        a: 'Nej. Jeg gør det nemt for alle dine kunder at give en anmeldelse, fx med QR-skiltet. Jeg køber ikke anmeldelser, og jeg sorterer ikke i, hvem der bliver spurgt.',
      },
      ...startFaq(bg),
    ],
  },
  contact: {
    title: 'Skal jeg kigge på din Google-profil?',
    body: 'Ring eller skriv, så tjekker jeg den gratis og fortæller, hvad der mangler.',
  },
}

/* ---- Priser ------------------------------------------------------------ */

export const priser = {
  meta: {
    title: 'Priser og prisberegner | OviaSpecs',
    description: `Se din pris med det samme. Hjemmeside ${fromPrice(web)}, marketing ${fromPrice(mk)} og booking & Google ${fromPrice(bg)} Faste pakker, og du skal ikke oplyse noget.`,
  },
  eyebrow: 'Priser',
  title: 'Hvad koster det?',
  lead: 'Svar på et par spørgsmål, så ser du prisen med det samme. Du skal ikke oplyse navn eller mail.',
  all: {
    eyebrow: 'Alle pakker',
    title: 'Alle pakker side om side.',
    more: 'Læs mere',
  },
  contact: {
    title: 'Spørgsmål til priserne?',
    body: 'Ring eller skriv, så hjælper jeg dig med at finde den pakke, der passer.',
  },
}
