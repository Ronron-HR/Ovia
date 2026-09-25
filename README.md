# OviaSpecs — hjemmeside

Hjemmesiden for OviaSpecs (oviaspecs.com): hjemmesider, booking og markedsføring til mindre danske virksomheder. React 19, Vite og Tailwind 4, uden animationsbiblioteker. Al tekst ligger i `src/content.js`.

Status: **færdig til gennemgang, ikke udgivet.** Se "Før udgivelse" nederst.

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
src/concepts/           Konceptillustrationerne (HTML/CSS) af de tre designretninger
src/motion/             Bevægelse: motion.css og hooks (useScene, useReveal, useNavSpy)
src/components/         Hero, Rail, Work + Stage, Ydelser, Annotated, BookingDemo,
                        SearchSketch, Samarbejde, Om, Faq, Kontakt, Nav, Privatlivspolitik
src/entry-server.jsx    Bruges kun ved build til forudrendering
scripts/                Build- og billedværktøjer (prerender, og, brand, images)
public/                 Skrifter, portræt, favicon, robots, sitemap og _headers
privatlivspolitik/      Egen indgang, så politikken kan deles som link
```

Sektioner: Hero, Sammenhængen, Udvalgt arbejde (mørkt ark), Ydelser (lyst ark: Hjemmesider, Booking med eksempel, Synlighed), Samarbejdet, Om OviaSpecs, Spørgsmål, Kontakt.

## Portfolioen: konceptillustrationer, ikke skærmbilleder

Demoerne (Salon Matin, Brasserie Belli, Den Gule Café) bruger de omtalte virksomheders egne fotos, logoer, menukort og tekster. Der er ingen dokumenteret tilladelse til at vise dem, så **siden bruger ingen af dem**. Projekterne vises som **konceptillustrationer** af designretningen, tegnet til siden i `src/concepts` med egne former, egen tekst og egne farver. De er mærket "Konceptillustration" og må ikke fremstilles som skærmbilleder.

- Salon Matin-konceptet har egen, rigtig tekst; Belli og Café bruger stadig grå tekststreger som pladsholdere og er mindre færdige.
- Hver illustration er en HTML/CSS-side, placeret i "designenheder" (`kit.jsx`), så den skalerer skarpt og fylder ingen billedfiler.
- Ved hvert projekt står tre statiske udsnit (Forside, midterdel, bund), så arbejdet kan vurderes uden at ramme et scrollpunkt, og også med reduceret bevægelse.
- Alt er mærket "Demo / koncept": ikke en kundeopgave, og virksomhederne er ikke kunder eller samarbejdspartnere.
- Siden linker **ikke** til demoerne på GitHub Pages, fordi de stadig indeholder det uafklarede materiale. Slå linkene til med `work.showDemoLinks = true` i `content.js`, når demoerne er ryddet.
- Søgeskitsen under Synlighed og bookingeksemplet er illustrationer med opdigtede navne og tider og er mærket som eksempler. De viser ikke rigtige søgeresultater, placeringer eller bookinger.

De tidligere skærmbilleder og optagelsesscripts ligger uden for projektet i `C:\Users\Ronny\Desktop\Webly\arkiv-uafklarede-billeder` og bruges ikke.

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
| `public/og.jpg` | Tegnet af `scripts/og.mjs` ud fra logo, sidens skrifter og heroens konceptillustration. |
| `public/logo*.svg`, `maerke*.svg`, `favicon.svg`, `apple-touch-icon.png` | Ronnys wordmark, tegnet som SVG-stier (`scripts/brand/`). |
| `src/concepts/*` | Egne illustrationer. Ingen fotos, logoer, menukort, priser, anmeldelser eller tekster fra virksomheder. |

Ingen stockfotos, ingen AI-genererede billeder, ingen hotlinking.

Skrifter (selvhostet i `public/fonts`, SIL Open Font License 1.1, licenstekster ved siden af): Instrument Sans (variabel, `@fontsource-variable/instrument-sans` 5.3.0) og JetBrains Mono 400 (`@fontsource/jetbrains-mono` 5.3.0). Ingen kald til Google Fonts.

Ingen cookies, ingen analyse, ingen tracking og ingen formular. Kontakt sker via `mailto:` og `tel:`. Hosting er Cloudflare. Privatlivspolitikken (`Privatlivspolitik.jsx`) beskriver præcis dette; ændres noget, skal den ændres samtidig.

## Før udgivelse

Konkrete, resterende punkter:

1. **Demoerne på GitHub Pages** (`Ronron-HR/salonmatin-demo`, `belli-demo`, `dengulecafe-demo`) indeholder stadig virksomhedernes fotos, logoer, menukort og tekster, og Belli/Café indeholder påstande som prisnominering og Michelin-anbefaling, der ikke er dokumenteret. Siden linker ikke til dem. Ryd dem, eller lad linkene være slået fra. I Salon Matins lokale kilde (`Desktop\Salon Matin\salonmatin-demo`) er stjerner, "4,8", anmeldelsessektionen og Trustpilot-links fjernet (45 linjer, **ikke committet eller pushet**). Originalen ligger i arkivmappen.
2. **Løfter:** siden lover hverken ejerskab, support, svartider, leveringstider eller priser. Ronny skal selv afgøre, hvad han vil love, før det skrives ind.
3. **Adressen** (Hjortshøj Stationsvej 6) står i footeren og i privatlivspolitikken, som på den tidligere side. Den bruges ikke i metadata. Der er intet CVR-nummer (`legal.cvr`).
4. **Ingen kalender.** Primær handling er "Fortæl om din opgave" (kontakt). Findes der senere en rigtig kalender, kan "Book en samtale" tilføjes.
5. **Udgivelse:** `git push origin main` udgiver (Cloudflare bygger med `npm run build` og udgiver `dist/`). Brug en anden gren for at få et preview-deploy først. Der er ikke pushet noget.
