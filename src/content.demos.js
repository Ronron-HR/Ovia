/* =========================================================================
   KONCEPTER — fire fiktive hjemmesider udviklet af OviaSpecs (siden /demoer/).
   De mærkes overalt "Koncept – ikke en kundeopgave".

   De er ikke kundearbejde og bygger ikke på rigtige virksomheder: ingen
   virksomhedsnavne, adresser, telefonnumre, logoer, anmeldelser, menukort
   eller fotografier. Tekster, layout og illustrationer (SVG/CSS) er skrevet
   og tegnet til demoerne (src/demos).

   Hver demo er en lille, fungerende hjemmeside på sin egen adresse. Funktionerne
   er lokale demonstrationer: en booking reserverer intet, en formular sender
   intet, og ingen knap fører til en virkelig virksomhed. Det står ved hver
   handling.

   Præsentationen bruger skærmbilleder af netop de nye demoer
   (public/demoer/<id>-desktop.webp og -mobile.webp, taget med
   `npm run demo-shots`).

   Kun adresser og stier, der ikke afhænger af content.js, står her (filen
   importeres af content.js).
   ========================================================================= */

/** Målene på skærmbillederne (se scripts/demo-shots.mjs). */
const DESKTOP = { width: 880, height: 1540 }
const MOBILE = { width: 340, height: 1308 }

export const demos = {
  id: 'demoer',
  eyebrow: 'Koncepter',
  title: 'Fire koncepter, du kan prøve.',
  intro:
    'Fire små hjemmesider, jeg har lavet som koncepter: en café, en restaurant, en salon og en vinbar. De er ikke lavet for rigtige kunder, men de virker, så du kan prøve menuer, faner og bookingeksempler på din telefon.',
  banner: 'Koncept – ikke en kundeopgave.',
  tag: 'Koncept – ikke en kundeopgave',
  tagShort: 'Koncept – ikke en kundeopgave',
  note: 'Koncepterne viser eksempler på design og funktioner. Din hjemmeside tilpasses din virksomhed. Hvilke funktioner der er med, afhænger af pakken: booking og bestilling er fx med i Fuld fart. Skærmbillederne er taget af koncepterne selv.',
  localNote:
    'Alt i koncepterne er lokalt: intet bliver sendt, bestilt eller booket, og ingen knap fører til en rigtig virksomhed.',
  open: 'Åbn konceptet',
  calcCta: 'Se priser på en hjemmeside',
  backToSite: 'Tilbage til OviaSpecs',
  allDemos: 'Alle koncepter',
  labels: { task: 'Formål', features: 'Funktioner i konceptet', design: 'Design' },
  seeAll: { label: 'Se alle koncepter', href: '/demoer/' },
  projects: [
    {
      id: 'cafe',
      path: '/demoer/cafe/',
      name: 'Cafédemo',
      kind: 'Café',
      panel: '#f2d16b',
      calcType: 'mad',
      calcPurpose: 'menu',
      design: 'Smørgul, varm hvid og mørkeblå med venlig typografi og egne illustrationer.',
      task: 'En café, hvor gæsten hurtigt vil se, hvad der er på menuen, hvornår der er åbent, og hvordan man skriver.',
      features: [
        'Eksempelmenu med kategorier, der kan skiftes',
        'Åbningstider',
        'Kontaktsektion med en lokal beskedformular',
      ],
      label: 'Skærmbillede af konceptet Cafédemo på computer.',
      labelMobile: 'Skærmbillede af konceptet Cafédemo på telefon.',
      desktop: { src: '/demoer/cafe-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/cafe-mobile.webp', ...MOBILE },
      metaTitle: 'Cafédemo | Koncept fra OviaSpecs',
      metaDescription:
        'Koncept – ikke en kundeopgave: en café-hjemmeside med menu i kategorier, åbningstider og kontakt.',
    },
    {
      id: 'restaurant',
      path: '/demoer/restaurant/',
      name: 'Restaurantdemo',
      kind: 'Restaurant',
      panel: '#b5573a',
      calcType: 'mad',
      calcPurpose: 'booking',
      design: 'Terracotta, creme og mørk brun med store flader og rolig typografi.',
      task: 'En restaurant, hvor stemningen kommer først, og hvor gæsten nemt kan se menukortet og bestille bord.',
      features: [
        'Menukort med fungerende faner',
        'Tydeligt eksempel på bordbestilling (intet bliver reserveret)',
        'Historie og åbningstider',
      ],
      label: 'Skærmbillede af konceptet Restaurantdemo på computer.',
      labelMobile: 'Skærmbillede af konceptet Restaurantdemo på telefon.',
      desktop: { src: '/demoer/restaurant-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/restaurant-mobile.webp', ...MOBILE },
      metaTitle: 'Restaurantdemo | Koncept fra OviaSpecs',
      metaDescription:
        'Koncept – ikke en kundeopgave: en restaurant-hjemmeside med menukort i faner og et eksempel på bordbestilling.',
    },
    {
      id: 'salon',
      path: '/demoer/salon/',
      name: 'Salondemo',
      kind: 'Frisør og salon',
      panel: '#8b9096',
      calcType: 'salon',
      calcPurpose: 'booking',
      design: 'Grå, knækket hvid og en diskret grøn accent. Stramt og enkelt.',
      task: 'En salon, hvor kunden hurtigt finder sin behandling, ser en eksempelpris og får et indtryk af, hvordan booking kan se ud.',
      features: [
        'Behandlinger med eksempelpriser og varighed',
        'Lokalt bookingeksempel (intet bliver booket)',
        'Åbningstider og kontakt',
      ],
      label: 'Skærmbillede af konceptet Salondemo på computer.',
      labelMobile: 'Skærmbillede af konceptet Salondemo på telefon.',
      desktop: { src: '/demoer/salon-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/salon-mobile.webp', ...MOBILE },
      metaTitle: 'Salondemo | Koncept fra OviaSpecs',
      metaDescription:
        'Koncept – ikke en kundeopgave: en salon-hjemmeside med behandlinger, eksempelpriser og et lokalt bookingeksempel.',
    },
    {
      id: 'vinbar',
      path: '/demoer/vinbar/',
      name: 'Vinbardemo',
      kind: 'Vinbar',
      panel: '#5a2a4e',
      calcType: 'mad',
      calcPurpose: 'menu',
      design: 'Blommefarvet, elfenben og kobber med elegant serifskrift og luft.',
      task: 'En vinbar, hvor gæsten kan bladre i vinkortet og se, hvordan en henvendelse fra en gruppe kan tage form.',
      features: [
        'Fiktivt vinkort med kategorier',
        'Eksempel på gruppehenvendelse (intet bliver sendt)',
        'Åbningstider og kontakt',
      ],
      label: 'Skærmbillede af konceptet Vinbardemo på computer.',
      labelMobile: 'Skærmbillede af konceptet Vinbardemo på telefon.',
      desktop: { src: '/demoer/vinbar-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/vinbar-mobile.webp', ...MOBILE },
      metaTitle: 'Vinbardemo | Koncept fra OviaSpecs',
      metaDescription:
        'Koncept – ikke en kundeopgave: en vinbar-hjemmeside med vinkort i kategorier og et eksempel på en gruppehenvendelse.',
    },
  ],
}

/** Finder et koncept. Ukendte id'er giver null. */
export function demoById(id) {
  return demos.projects.find((p) => p.id === id) ?? null
}
