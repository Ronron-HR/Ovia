# OviaSpecs — hjemmeside

Hjemmesiden for OviaSpecs (oviaspecs.com): hjemmeside, marketing og booking & Google til lokale virksomheder. React 19, Vite og Tailwind 4, forudrenderet til statiske filer og hostet på Cloudflare (Workers Static Assets). Ingen backend, ingen formularer, ingen cookies og ingen tracking.

## Her retter du

| Fil | Indhold |
| --- | --- |
| `src/data/pricing.js` | **Alle priser og pakker**, drift, tilvalg, beregnerens spørgsmål, pilotvilkår, gratis Google-tjek, momstekst (`priceNote`), `paidStartText`, `flags.hasMarketingCases`, telefon, mail og CVR (`company.cvr`, vises i footeren, når det er udfyldt). |
| `src/data/texts.js` | Forsiden, navigation, kontakt, footer, privatlivspolitikkens udbydere og metadata for forsiden. |
| `src/data/services.js` | Ydelsessiderne (/hjemmeside/, /marketing/, /booking-google/) og /priser/: problem, "det får du", FAQ og metadata. |
| `src/content.demos.js` | De fire koncepter under /demoer/. |

Regler for teksten: jeg-form (OviaSpecs er én person). Ingen udtalelser, kundetal, logoer eller resultater, der ikke kan dokumenteres. Koncepterne mærkes "Koncept – ikke en kundeopgave". Ingen rabatkoder, nedtællinger eller popularitetsmærker.

## Sider

`/` · `/hjemmeside/` · `/marketing/` · `/booking-google/` · `/priser/` · `/demoer/` (+ `/demoer/cafe|restaurant|salon|vinbar/`) · `/privatlivspolitik/`

Adresser og metadata: `src/routes.js`. Nøglerne skal passe med `src/pageKeys.js`, `src/pages.jsx` og `src/pageLoaders.js` (bygget fejler ellers). Gamle adresser (/hjemmesider/, /seo/, /google-ads/, /sociale-medier-annoncering/, /booking-integrationer/, /prisberegner/, /ai-automatisering/, /om/, /kontakt/) viderestilles med 301 i `public/_redirects`.

## Prisberegneren

`src/components/PriceCalculator.jsx` + `src/calculator.js`. Trin 1 er flervalg af ydelser, derefter ét trin pr. valgt ydelse og så resultatet (højst 5 trin). Hvert svar peger på en pakke, og den højeste vinder. Prisen er fast: pakkeprisen plus eventuelle tilvalg (fx egen konto). Alle ydelser har `buffer: 0`, og `npm test` fejler, hvis et interval sniger sig ind. Valgene står kun i adresselinjen. Resultatet har Ring, SMS og "Send mig tilbuddet" (mailto) med forudfyldt opsummering.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm run dev` | Udviklingsserver |
| `npm run build` | Bygger til `dist/`, forudrenderer HTML, skriver sitemap og JSON-LD (fra pricing.js) |
| `npm run preview` | Serverer `dist/` på http://localhost:4173 |
| `npm run lint` | oxlint |
| `npm run demo-shots` | Skærmbilleder af koncepterne til `public/demoer/` (kræver kørende preview og puppeteer-core) |
| `npm run og` | Tegner delingsbilledet `public/og.jpg` |
| `npm run brand` | Tegner favicon og logo-filer ud fra farverne i `src/index.css` |

## Opbygning

```
src/data/            Konfiguration og tekster (se ovenfor)
src/pages/           Home, Service (de tre ydelsessider), Priser, Demoer
src/components/      Nav, Footer, MobileCallBar, ContactButtons, ContactSection,
                     HomeHero, ServiceCards, Steps, About, ServicePage, Packages,
                     ConceptGrid, PilotSection, FreeCheck, Faq, PriceCalculator, …
src/demos/           De fire koncepter (egne små sider)
src/index.css        Farver, skrifter, knapper og komponenter (Tailwind @theme)
scripts/prerender.mjs  Forudrendering, sitemap, JSON-LD og CSP-hash
public/_headers      Sikkerhedsheaders og cache
public/_redirects    Viderestillinger fra gamle adresser
privatlivspolitik/   Egen indgang, så politikken kan deles som link
```

Skrifterne (Instrument Sans og JetBrains Mono, SIL OFL) er selvhostede i `public/fonts`. Ingen eksterne scripts eller stylesheets. Privatlivspolitikken (`src/components/Privatlivspolitik.jsx`) beskriver præcis dette; ændres noget, skal den ændres samtidig.

## Udgivelse

`git push origin main` udgiver (Cloudflare bygger med `npm run build`). Brug en anden gren til et preview først.
