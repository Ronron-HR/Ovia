# OviaSpecs UX-forbedring – checkpoint

Preview: `npm run build && npm run preview` → http://localhost:4173
Tests: `npm test` (pris, guide, henvendelse) · `npm run test:e2e` (kræver kørende preview) · `node scripts/test-guide-e2e.mjs` (guide + eksempler, 375/1440 px, skærmbilleder i docs/ovia-ux-shots/) · `npm run lint`

## Færdigt
- A: Behovsguide "Hjælp mig med at vælge" i beregneren (`src/guide.js`, `src/components/NeedsGuide.jsx`, tekster i `calculator.guide` i pricing.js, tilstand i adresselinjen `hjaelp=` + `g-*`, `useGuide` i useCalc.js)
- B: hjælpetekster (sider, drift/egen konto: `calculator.help`), "Hvad dækker månedsprisen?" (`PriceDetails.jsx`), moms ved første trin, formularen hedder nu "Send din forespørgsel" med ærlig tekst (`inquiry.js`), privatlivspolitik/README/test tilpasset
- C: to demoer (restaurant, salon) under hero (`HomeExamples.jsx`, tekst i `home.examples`), "Tilbage til OviaSpecs" i demoer bevarer beregnerens adresselinje også fra forsiden (`DemoShell.jsx`)
- Nye tests: `scripts/test-guide.mjs` (i `npm test` og build), `scripts/test-guide-e2e.mjs`

## Status
- Færdig. Reviewere (UX + Logic) kørt; 4 UX-fund og 3 P2-fund fra Logic rettet og gentestet.
- Kontroller: `npm test` OK, `npm run test:e2e` OK, `scripts/test-guide-e2e.mjs` OK, lint uden fejl, build OK.

## Åbne forretningsspørgsmål (ikke gættet)
- Hvad en hjemmeside koster med egen konto + booking (ikke muligt i dag; booking giver altid drift) – uændret
- Svartid for Ring/SMS/mail uden formular er ikke dokumenteret; guidens afklaring lover intet

---
# Runde 2: driftsplaner + redesign + rundvisning (påbegyndt)
Kontrakt og filejerskab: `docs/ovia-kontrakt.md`. Før-billeder: `docs/shots-foer/` (375/768/1440). Efter-billeder: `node scripts/ovia-shots.mjs docs/shots-efter`.
Skills: frontend-design og webapp-testing (example-skills) læst af hovedagent og underagenter via SKILL.md-stien; plugin vises som "disabled" i `claude plugin list` (project scope), men skillsene er indlæst i sessionen; intet installeret.
Runde 1 (parallelt): P (priser/tilstand), D (design/animation), O (onboarding/rundvisning). Runde 2: B (browser/tilgængelighed), R (slutreviewer).
Beslutninger: egen rundvisning uden bibliotek (lazy), booking tvinger ingen plan, gamle `drift=drift`-links → plan med samme månedspris.
Status: runde 1 færdig og integreret (P, D, O rapporteret). Build (inkl. pris-/guide-/henvendelsestests), lint og alle e2e (calculator, tierswitch, form, demos, guide, tour) består mod preview :4173. Efter-billeder i docs/shots-efter/ (ovia-shots.mjs + ovia-shots-flow.mjs).
Runde 2 kører: B (browser/a11y) og R (slutreview) – skrivebeskyttede. Derefter: ret fund, gentest, aflever.
Hovedagent-rettelser: privacy.updated 7. okt., introNote og About-tekst (tillid), brand/og regenereret.
Åbent: Atlantic.st kunne ikke observeres (WebFetch gav kun titel); ingen skærmlæsertest; maillevering kun mock.

## Slutstatus runde 2
- Reviewere B (browser/a11y) og R (slutreview) kørt; ingen P0/P1. P2-fund rettet: Anbefalet-begrundelse, fra-pris viser drift, JS-fri forside, invitation dækker fokus (trækker sig tilbage + Escape), driftfejl øverst og knyttet til valg. P3 rettet: månedspris samme vægt, reveal 320 ms, tekster, trykflader i topbjælke, små tekster.
- Kendte P3 (ikke rettet): browser-tilbage forlader siden fra resultatet (replaceState, bevidst), gammelt link `drift=egen` lander på driftstrinnet, enkelte trykflader 40-43 px (footer/ydelseslinks), heroens designudtryk kan opleves lidt generisk.
- Tests: `npm test`, e2e (calculator, tierswitch, form, demos, guide, tour) og a11y-e2e bestået mod preview :4173. Ingen skærmlæsertest. Maillevering kun mock.
