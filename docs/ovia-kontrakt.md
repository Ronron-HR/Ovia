# Kontrakt for runde 2 (redesign + drift + rundvisning)

Preview (hovedagent bygger): `npm run build && npm run preview` → :4173. Agenter bygger IKKE i projektmappen (dist/ deles); brug `npx vite --port <egen>` til dev og `SITE=http://localhost:<port> node scripts/<test>.mjs`.

## Ejerskab af filer (ingen andre redigerer dem)
- **Priser og tilstand (P):** src/data/pricing.js, src/data/services.js, src/calculator.js, src/guide.js, src/inquiry.js, src/useCalc.js, src/entry-server.jsx, src/pages/Priser.jsx, src/components/{PriceCalculator,NeedsGuide,PriceDetails,Packages,SendQuote}.jsx, src/calc.css (ny, importeres af PriceCalculator.jsx), worker/*, scripts/test-pricing|test-guide|test-inquiry|test-guide-e2e|test-calculator-e2e|test-tierswitch-e2e|test-form-e2e.mjs
- **Design og animation (D):** src/index.css, src/motion/*, src/stage.css, src/components/{Nav,Footer,MobileCallBar,HomeHero,HomeExamples,ContactSection,ContactButtons,ServiceCards,Steps,About,Work,ConceptGrid,Logo,Shots,DemoVisual,Faq,PilotSection,FreeCheck,ServicePage}.jsx, src/pages/{Home,Demoer}.jsx, src/Site.jsx, src/data/texts.js, public/demoer/* (nye beskårne forhåndsvisninger), scripts/demo-shots.mjs
- **Onboarding (O):** src/components/Tour*.jsx, src/tour.css (ny), src/data/tour.js (ny), src/components/Privatlivspolitik.jsx
- **Hovedagent:** integration i fælles filer, package.json, README, docs/, scripts/ovia-shots.mjs

## Datamodel for drift (P implementerer, andre læser)
- `driftPlans` i pricing.js: `basis` 99 kr./md (0 min), `plus` 199 (op til 15 min), `ekstra` 399 (op til 30 min). Alle tre: samme tekniske drift (kun det, der allerede står i pricing.js `services.hjemmeside.drift`).
- Beregnerens spørgsmål `drift` (hjemmeside) har svar `basis|plus|ekstra|egen`; URL `drift=...`. Ingen standardværdi. `egen` = egen konto/hosting (tillæg `ownAccount` 1.000 kr. engang, ingen månedlig betaling til OviaSpecs for drift).
- Gamle links: `drift=drift` migreres til planen med samme indhold som linket viste (Start/Vækst → plus 199, Fuld fart → ekstra 399). Manglende `drift` = ubesvaret; kunden vælger.
- Pakke (`sider`), drift og booking er uafhængige. Booking (+500 kr.) tvinger ingen plan.
- `quote().lines[i]` får `driftPlan` (id eller null) og `parts` (`[{id,label,once,monthly}]`: hvad der indgår i summen).

## data-tour-mål (rundvisningen finder elementer med `[data-tour="…"]`; manglende mål springes over)
`calc` (beregnerens kort, P), `guide` (guideindgangen, P), `drift` (driftvalget når det vises, P), `price` (prisresultatet, P), `examples` (eksempelsektionen, D), `contact` (kontaktsektionen, D). `TourLauncher` (O) placeres af D i hero: `import TourLauncher from './TourLauncher.jsx'`, prop `className`.

## Designtokens (D ejer; andre bruger kun klasser/variabler, ikke egne farver)
Eksisterende klassenavne må ikke omdøbes (de bruges af calculator-JSX): .calc*, .choice*, .btn*, .badge, .tag, .field, .send*, .amount*, .error-text, .shell, .t-*, .link-underline, .hit. D må omstyle dem og tilføje nye.
