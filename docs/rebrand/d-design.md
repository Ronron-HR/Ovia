# D: design og komponenter (okt. 2026)

Model-ID: claude-sonnet-5-5.

## Tokens (src/index.css, @theme)

| Token | Før | Efter |
| --- | --- | --- |
| paper | #f5f8fc | #f8f5ef |
| paper-2 | #e9f0f8 | #efe9df |
| surface | #ffffff | #fffdf9 |
| ink | #0e1d2f | #1c1a17 |
| muted | #46566a | #5a5349 |
| cta (uændret) | #1c4fd8 | #1c4fd8 (hover #1640b0) |
| cta-soft | #e8efff | #e8edfb |
| rule / rule-strong | #dce4ee / #c5d1df | #e5dfd2 / #d6ccba |
| field | #6b7c92 | #857a68 |

Nyt: `--shadow-card`, `--shadow-pop`, `--icon-check`/`--icon-minus` (masker). Skala: hero op til 3,875 rem, h2 op til 2,625 rem, sektionsluft op til 6,5 rem.

Målte kontraster (WCAG 2.x): ink/paper 16,0; ink/surface 17,1; muted/paper 7,0; muted/paper-2 6,3; muted/surface 7,5; hvid/cta 6,7; hvid/cta-hover 8,8; cta/paper 6,1; cta/paper-2 5,5; cta/surface 6,5; cta/cta-soft 5,7; field/surface 4,2; field/paper 3,9; field/paper-2 3,5 (kanter, mindst 3:1); cta-on-dark/ink 9,7; hvid/ink 17,4. Kommentaren i index.css er opdateret. `npm run brand` kørt uden fejl (favicon, logoer, apple-touch-icon følger paper/ink/cta); `npm run og` kørt (`public/og.jpg` med ny palette, sætningsskrift og overskriften fra `home.hero.title`; kør `npm run og` igen, hvis den ændres).

## Filer

Ændret: `src/index.css`, `src/Site.jsx` (uændret), `src/pages/{Home,Demoer,Systemer}.jsx`, `src/components/{Nav,Footer,HomeHero,HomeExamples,Steps,About,Faq,ConceptGrid,FreeCheck,PilotSection,ContactButtons,Shots,ServicePage}.jsx`, `scripts/og/og.html`, `scripts/og.mjs` (kommentar), `public/{favicon.svg,logo*.svg,maerke*.svg,apple-touch-icon.png,og.jpg}` (genereret).
Nye: `src/components/{Icon,Problems,BuyModes,Terms}.jsx`.
Slettet: `src/components/ServiceCards.jsx` (de tre ydelseskort står ikke længere i forsidens rækkefølge; Problems fører til løsningssiderne).
Skærmbilleder: `docs/rebrand/shots-d/`.

## Opbygning

- **Ikoner**: `Icon.jsx` (24x24, streg 1,75, runde ender, currentColor, aria-hidden). `PhoneIcon/MailIcon/SmsIcon` (ContactButtons) og `Arrow` (Shots) er nu tynde skaller om `Icon`, så F's komponenter får den nye stil uden ændring. Spec-listens flueben er en maske i accentfarven.
- **Nav**: Løsninger er en disclosure-knap (`aria-expanded`, `aria-controls`), åbner ved klik/tryk (ikke hover), lukker med Escape (fokus tilbage), klik udenfor og når fokus forlader den; pil ned/op i panelet. Panelet ligger altid i HTML'en (visibility). Mobil: de fire løsninger som liste under overskriften, så Eksempler/Priser/Om og kontakt; fokusfælde, Escape og scroll-lås (kun mens menuen er åben) som før. Tekster fra `nav.solutions` / `nav.items`.
- **Forsiden** (`Home.jsx`): HomeHero (værdi, tilbudslinje + minimumsbetaling fra `home.hero.offer`, Se priser + Ring, fakta) → HomeExamples (restaurant, salon, arbejdsgangskort med tegnet skitse, alle mærket Demo) → Problems → BuyModes (`id="koebsmaader"`) → beregner i egen sektion (`PriceCalculator`, id="beregner" ligger kun inde i den; "Vis mig rundt" som tekstknap i sektionens overskrift) → Steps (fem trin, lodret tidslinje) → About → Faq (`homeFaq`) → ContactSection. Flader skifter lys/tonet; kontakt er mørk.
- **Systemer** (`Systemer.jsx`): hero med status-kort, spørg først, tre eksempler (med/uden/`skipIf`), sikkerhed + pris, demo (`id="demo"`, mærke, synlig disclaimer), kontakt. `<WorkflowDemo />` hentes via `import.meta.glob('../components/WorkflowDemo.jsx')`: findes filen ikke, bygger siden stadig, men sektionen viser kun overskrift og disclaimer. **WorkflowDemo.jsx fandtes ikke, da jeg afsluttede**; erstat glob med `import WorkflowDemo from '../components/WorkflowDemo.jsx'`, når F har filen (eller lad glob stå).
- **ServicePage**: hero med én primær handling (Se din pris → beregneren længere nede) + Ring/Mail; det får du; `page.modes` → BuyModes (/hjemmeside/), `page.scope` (/marketing/), `page.localSeo` (/booking-google/, fire blokke + engangsopgaver + måldisclaimer); ekstra sektion; pakker; beregner; Steps (offer.process); FAQ; kontakt. `page.terms` vises ikke på /hjemmeside/ (vilkårene står på /priser/#vilkaar, BuyModes linker dertil).
- **Demoer**: får et kort til arbejdsgangsdemoen (`demos.workflow`) efter de fire koncepter.
- **Bevægelse**: uændret motion-system (vagthund, .js-motion, reduced motion). Nyt: `:active` på kort, panel ind 200 ms/ud 140 ms (opacity+6 px), chevron-drejning; alt sat til ~1 ms og uden transform ved reduced motion.

## Verificeret

- Skærmbilleder 360/390/768/1440 af forside, /priser/, /systemer/, /hjemmeside/, /booking-google/, /marketing/, /demoer/ set; ingen vandret overflow (målt scrollWidth = clientWidth ved alle fire bredder på alle syv sider), ingen sidefejl i konsollen med den nuværende PriceCalculator.
- Nav-disclosure testet med Puppeteer: klik åbner, Escape lukker og returnerer fokus, pil ned åbner og flytter fokus, klik udenfor og tab ud lukker. Mobilmenu: åbner, Escape lukker, scroll-lås fjernes.
- Tryk-mål: scriptet fandt kun "Priser"/"Vilkår"-links 41-43 px brede (44 px høje); rettet med `min-w-11`. Ikke gentestet efter rettelsen.
- `npx oxlint` på mine filer: ren. Ingen hardkodede beløb i mine filer (grep).
- `npm test` fejler i `test-pricing.mjs` (`switchMismatches`, undefined `DIRECT[key]`): F's igangværende arbejde med beregneren, ikke mine filer.

Ikke verificeret: `npm run build`/forudrendering (må ikke bygge); mobilmenuens fokusfælde med tastatur; skærmlæser; Tour-trin (data-tour-mål `examples`, `contact`, `calc` bevaret, men `hero`-mål findes ikke); WorkflowDemo i siden.

## Afhængigheder jeg ventede på

`src/data/offer.js` og C's felter (kom undervejs, tilpasset), `WorkflowDemo.jsx` (kom ikke), F's PriceCalculator (var brudt midtvejs; testet med stub, derefter med den rigtige).

## Ønsker

- **S**: `theme-color` i index.html bør være paper `#f8f5ef`.
- **F**: tourens automatiske invitation vises stadig (kort nederst); `.calc`-trinlabel ("TRIN 1") er mono og tydeligt versal-agtig: ret til sætningsskrift; `ErrorText.jsx` har eget ikon (20-viewBox): brug `<Icon name="alert" />` fra `Icon.jsx`; `Priser.jsx`/`Packages.jsx` kan importere `Icon` i stedet for egne SVG'er; kald BuyModes med `tone`-prop (`paper|grey`) og Terms med `headingLevel`.
- **C**: `nav.solutions.ariaLabel` bruges ikke (knappens synlige tekst er navnet). UI-mikrotekster jeg selv har sat (kontrakten dækker dem ikke): "Det er med" / "Det er ikke med" (BuyModes, Systemer), "Læs vilkårene" (BuyModes), chipnavnene "Ny / Besvaret / Tilbud sendt" i arbejdsgangsskitsen. Flyt dem gerne til offer.js.
- **H**: `src/pages/Service.jsx` er uændret; ServicePage læser selv `modes`, `scope`, `localSeo`. Ret README (nævner stadig ServiceCards og trin i tre kolonner) og `scripts/ovia-shots*.mjs` kan stadig bruge `#beregner`.
