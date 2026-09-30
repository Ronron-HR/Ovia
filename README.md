# OviaSpecs — hjemmeside

Hjemmesiden for OviaSpecs (oviaspecs.com): hjemmesider, booking og markedsføring til mindre danske virksomheder. React 19, Vite og Tailwind 4, uden animationsbiblioteker. Al tekst ligger i `src/content.js`.

Status: **færdig og pushet til GitHub (main).** Se "Før udgivelse" nederst.

## Sidestruktur (gren ny-struktur)

Hver adresse har sin egen forudrenderede HTML-fil: / , /hjemmesider/ , /booking-integrationer/ , /seo/ , /google-ads/ , /sociale-medier-annoncering/ , /ai-automatisering/ , /demoer/ , /om/ , /kontakt/ , /prisberegner/ og /privatlivspolitik/. Adresserne og metadata står i `src/routes.js`; `scripts/prerender.mjs` skriver siderne og sitemap.xml ved build. Tekster: `src/content.js` (fælles, prismodel `pricing`, demoer `demos`) og `src/services.*.js` (ydelsessiderne). Gamle ankerlinks på forsiden (#ydelser, #arbejde …) føres videre i `src/main.jsx`.

Prisberegneren (`components/Calculator.jsx`) gælder kun selve hjemmesiden: 1–3 sider 4.000 kr., 4–5 sider 4.500 kr., 6 sider 5.000 kr.; mere, webshop og specialudvikling giver særskilt tilbud. Ret priserne i `pricing`. Demoerne er egne, fungerende sider under /demoer/.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm install` | Henter afhængigheder |
| `npm run dev` | Udviklingsserver (renderes på klienten) |
| `npm run build` | Bygger til `dist/` og forudrenderer HTML (se nedenfor) |
| `npm run preview` | Serverer `dist/` lokalt på http://localhost:4173 |
| `npm run lint` | oxlint |
| `npm run og` | Tegner delingsbilledet `public/og.jpg` (kræver kørende preview og `npm i --no-save puppeteer-core`) |
| `npm run brand` | Tegner favicon, apple-touch-icon og logo-filer ud fra farverne i `src/index.css` |
| `npm run images` | Beskærer portrættet og lægger sidens papirfarve bag det |

## Opbygning

```
src/content.js          Al tekst, links og indstillinger. Ret her.
src/index.css           Farver, skrifter, knapper, rammer (Tailwind @theme)
src/stage.css           Ark, scener, annoteringer og reglerne til illustrationerne
src/demos/              De fire fiktive demoer (sider, SVG-illustrationer, demos.css)
src/calcStore.js        Beregnerens tilstand (adresselinje + sessionStorage)
worker/index.js         POST /api/kontakt (formularer)
src/motion/             Bevægelse: motion.css og hooks (useScene, useReveal, useNavSpy)
src/components/         Hero, Rail, Work + Stage, Ydelser, Annotated, BookingDemo,
                        SearchSketch, Samarbejde, Om, Faq, Kontakt, Nav, Privatlivspolitik
src/entry-server.jsx    Bruges kun ved build til forudrendering
scripts/                Build- og billedværktøjer (prerender, og, brand, images)
public/                 Skrifter, portræt, favicon, robots, sitemap og _headers
privatlivspolitik/      Egen indgang, så politikken kan deles som link
```

Sektioner: Hero, Sammenhængen, Udvalgt arbejde (mørkt ark), Ydelser (lyst ark: Hjemmesider, Booking med eksempel, Synlighed), Samarbejdet, Om OviaSpecs, Spørgsmål, Kontakt.

## Demoer: fire fiktive koncepter

De fire demoer (Cafédemo, Restaurantdemo, Salondemo, Vinbardemo) er mine egne, fiktive koncepter med egne tekster, SVG-/CSS-illustrationer og farver. De bygger ikke på rigtige virksomheder og bruger ingen virksomhedsnavne, adresser, telefonnumre, logoer, anmeldelser, menukort eller fotos. De tidligere demoer (og deres illustrationer) er fjernet fra siden. GitHub-demoerne er ikke aktiveret, og ingen repositories er slettet.

- Hver demo er en lille side med mobilmenu og lokale funktioner på /demoer/cafe/, /restaurant/, /salon/ og /vinbar/ (`src/demos`). Formularer sender intet, bookinger reserverer intet, og ingen knap fører til en rigtig virksomhed; hver handling viser en besked om det.
- Alle er mærket "Fiktiv demo – koncept udviklet af OviaSpecs, ikke kundearbejde." (stribe øverst på demoen og i præsentationerne).
- Præsentationen (forside og /demoer/) bruger skærmbilleder af netop demoerne: `npm run build && npm run preview`, derefter `npm run demo-shots` (skriver `public/demoer/*.webp`). Kør igen, hvis en demo ændres.
- "Beregn en lignende hjemmeside" åbner `/prisberegner/?demo=<id>#beregner`. Ukendte eller udgåede id'er (også gamle) giver en neutral beregning.

## Bevægelse

Håndskrevet, uden bibliotek, i `motion.css`, `stage.css` og `useScene.js`:

1. **Indgang** (ren CSS, første frame): overskriften rejser sig i to rækker; skærmen og de to telefoner i heroen kommer op efter hinanden.
2. **Scroll-drevet dybde** (`useScene`): heroens tre lag og projektscenerne glider med hver sin hastighed, og siderne i scenerne ruller igennem i browser og telefon, mens man scroller forbi. Bevægelsen er lineær, bruger kun `transform`, og transforms skrives direkte på lagene (ikke som CSS-variabler, der ville blive arvet af hele illustrationen). Ingen scroll-kapring; intet holdes fast eller forsinkes. Der lyttes kun, mens en scene er nær skærmen.
3. **Indtoning** (`useReveal`): sektionsoverskrifter og scener tændes én gang.
4. **Respons**: knapper, menu, spørgsmål og bookingeksemplet svarer på det, man gør.

Uden JavaScript, med blokeret bundle og med `prefers-reduced-motion` står alt synligt og stille; scenerne viser da toppen af siderne, og udsnittene under dem viser resten (udsnittene tegnes dog først, når JavaScript er kørt, og mangler uden JavaScript).

## Forudrendering og hastighed

`npm run build` kører `vite build`, `vite build --ssr` og `scripts/prerender.mjs`, som lægger den færdige HTML ind i `dist/*.html` og indlejrer forsidens stylesheet (én forespørgsel mindre før første maling). Klienten hydrerer bagefter. Fejler forudrenderingen, fejler bygget. Komponenter må ikke røre `window` eller `document` under render.

Hastighed: forsiden henter 7 filer og ca. 172 KiB (gzip). Ingen billeder over folden: heroen er tekst og HTML, og eneste billede er portrættet (16 KB AVIF, lazy). Skrifterne er selvhostede og preloadet. `content-visibility: auto` på projektscenerne springer layout og maling over uden for skærmen. `public/_headers` giver lange cache-tider til hash-navngivne filer.

Byggets størrelser (gzip): forside-HTML 31 KB (med indlejret CSS), React/vendor 68 KB, sidens egen JS 24 KB, skrifter 51 KB.

### Målinger (laboratorie, ikke rigtige brugere)

Lighthouse 13.5.0, Chrome 153 (headless) på Windows, mod den byggede side fra en lokal statisk server med gzip (`serve`), standard-throttling for mobil (simuleret langsom 4G, 4× CPU) og desktop-preset. Fem mobilkørsler og én desktopkørsel, 25. september 2026:

| | Ydeevne | Tilgængelighed | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mobil (5 kørsler) | 97–98 | 100 | 100 | 100 | 1,5–1,6 s | 2,0–2,1 s | 50–120 ms | 0 |
| Desktop (1 kørsel) | 100 | 100 | 100 | 100 | 0,4 s | 0,5 s | 0 ms | 0 |

**Begrænsninger:** lokale laboratoriemålinger, ingen Core Web Vitals fra rigtige brugere (der er ingen trafik at måle på), ingen Brotli, ingen CDN og ingen rigtig mobil. Facit for den udgivne side er et Cloudflare Pages preview og senere feltdata. Det er ikke målt her, fordi der ikke er adgang til et autoriseret hosted preview.

## Test

Kontrolleret lokalt på den byggede side:

- **Edge 153, Chrome 153, Firefox 150** (Windows): ingen vandret overflow ved 320, 390, 768, 1024, 1440 og 1920 px, ingen konsolfejl, scenernes og heroens bevægelse følger scroll, mobilmenu og Escape, bookingeksemplet og tastaturnavigation.
- **Kun Edge og Chrome:** reduceret bevægelse (alt står stille og synligt, udsnittene er der), uden JavaScript, blokeret bundle (indhold synligt efter vagthunden), touch-swipe og PageDown scroller scenen.
- **Ikke testet:** Safari, rigtige telefoner og tablets, skærmlæser (kun automatiske tilgængelighedstjek i Lighthouse), Firefox uden JavaScript og med reduceret bevægelse (kan ikke emuleres i testværktøjet).

## Tekst, kilder og licenser

| Fil | Kilde |
| --- | --- |
| `public/ronny.*` | Ronnys eget portræt (`Pictures/brugerfoto (1).jpg`), beskåret med `npm run images`. Kilden er 500 × 625 px, så det vises højst i 1:1. |
| `public/og.jpg` | Tegnet af `scripts/og.mjs` ud fra logo, sidens skrifter og skærmbilleder af to af de fiktive demoer. |
| `public/logo*.svg`, `maerke*.svg`, `favicon.svg`, `apple-touch-icon.png` | Ronnys wordmark, tegnet som SVG-stier (`scripts/brand/`). |
| `public/demoer/*` | Skærmbilleder af de fiktive demoer (`npm run demo-shots`). |

Ingen stockfotos, ingen AI-genererede billeder, ingen hotlinking.

Skrifter (selvhostet i `public/fonts`, SIL Open Font License 1.1, licenstekster ved siden af): Instrument Sans (variabel, `@fontsource-variable/instrument-sans` 5.3.0) og JetBrains Mono 400 (`@fontsource/jetbrains-mono` 5.3.0). Ingen kald til Google Fonts.

Ingen cookies, ingen analyse og ingen tracking. Formularerne sender via `/api/kontakt`; mail og telefon virker altid. Hosting er Cloudflare. Privatlivspolitikken (`Privatlivspolitik.jsx`) beskriver præcis dette; ændres noget, skal den ændres samtidig.

## Prisberegner og formularer

Beregneren (`components/Calculator.jsx`) er én komponent, der bruges i forsidens hero og på /prisberegner/. Tilstanden (`src/calcStore.js`) lever i adresselinjen (stien ændres aldrig) og i sessionStorage, så valg bevares ved genindlæsning og skift mellem siderne. Prisen (`src/content.calc.js`): 1–3 sider 4.000 kr., 4–5 sider 4.500 kr., 6 sider 5.000 kr.; mere end seks sider, webshop, betaling, login og specialudvikling giver "Særskilt tilbud", og "Jeg ved det ikke" giver en personlig afklaring uden pris. Moms: `vat.status` (se nedenfor).

Formularerne sender til `/api/kontakt` (`worker/index.js`, Cloudflare Worker): validering på både klient og server (`src/inquiry.js`), skjult felt og tidsstempel mod spam, same-origin-tjek og størrelsesgrænse. "Sendt" vises kun, når serveren har accepteret beskeden. Er afsendelse ikke sat op, svarer workeren 503, og siden siger ærligt, at beskeden ikke er sendt, og tilbyder mailprogram og kopiering.

## Før udgivelse (afklar)

1. **Afsendelse af formularer er ikke sat op.** Vælg én (se `wrangler.jsonc`): A) Cloudflare Email Routing med `send_email`-binding (gratis; kræver Email Routing på domænet og bekræftet modtager) og variablen `MAIL_FROM`, eller B) Resend (`RESEND_API_KEY` som hemmelighed og `MAIL_FROM`). Test bagefter med en rigtig afsendelse til dig selv, og opdatér privatlivspolitikken med navnet på tjenesten. Valgfrit: Cloudflare Turnstile eller en rate limiting-binding (`RATE_LIMITER`).
2. **Moms og CVR.** `vat.status` i `src/content.calc.js` er `null`: resultatet siger da kun, at moms og vilkår står i tilbuddet. Sæt den til `'excl'`, `'incl'` eller `'exempt'` ud fra den dokumenterede status, og udfyld `legal.cvr` i `src/content.js`, hvis der er et CVR-nr.
3. **Løfter:** siden lover hverken ejerskab, support, svartider eller leveringstider. Ronny afgør, hvad han vil love.
4. **Adressen** (Hjortshøj Stationsvej 6) står i footeren og privatlivspolitikken. Den bruges ikke i metadata.
5. **Lokale mapper:** `screenshots/` og `Pictures/` i projektmappen er ikke en del af siden, men kan indeholde skærmbilleder af de tidligere demoer. Slet eller flyt dem, før der committes med `git add .`.
6. **Udgivelse:** `git push origin main` udgiver (Cloudflare bygger med `npm run build`). Brug en anden gren for et preview først.

## Ydelse, bevægelse og sikkerhed

- **Sider hentes enkeltvis.** `src/pageLoaders.js` henter kun den side, adressen viser (før hydreringen), og `scripts/prerender.mjs` forhåndshenter sidens JS (`modulepreload`, ud fra byggets manifest). Nøglerne står i `src/pageKeys.js`, `src/pages.jsx` og `src/routes.js`; bygget fejler, hvis de ikke passer sammen.
- **Scroll-effekten** (`src/motion/useScene.js`, hentet fra Git-historikken) bruges af demoscenerne (`components/DemoVisual.jsx`) og demoernes hero (`demos/kit.jsx`). Kun `transform` og `opacity`, kun mens scenen er nær skærmen; på telefon kører kun siden, der ruller igennem sit vindue; slået fra ved `prefers-reduced-motion`.
- **Skærmbillederne** er høje WebP-udsnit (880 og 340 bred) fra `npm run demo-shots`.
- **Tilbage til OviaSpecs** i hver demo (`demos/DemoShell.jsx`) går til den side, kunden kom fra, og til demoens plads dér (`#demo-<id>`); åbnes demoen direkte, går den til `/demoer/#demo-<id>`.
- **Sikkerhedsheaders** (CSP, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS, COOP) står i `public/_headers`; prerender udfylder script-hashen til det ene indlejrede script.
