# OviaSpecs — instruktioner til Claude Code

Projektets opbygning, kommandoer og regler for tekst står i `README.md`. Priser og vilkår har én kilde: `src/data/pricing.js`. Rebrand-briefet (okt. 2026) står i `docs/rebrand/brief.md`.

## Skills til OviaSpecs (installeret okt. 2026, projekt-scope)

Skills supplerer briefet; de ændrer ikke aftalte priser, ydelser eller scope. Ingen opdigtede anmeldelser, kunder, resultater eller garantier om Google-placeringer.

| Skill | Kilde | Rolle | Brug når |
| --- | --- | --- | --- |
| `copywriting` | coreyhaines31/marketingskills | Naturligt dansk om ydelser, priser og næste skridt | Tekster i `src/data/*.js` skrives eller rettes |
| `cro` | coreyhaines31/marketingskills | Tilbud, prissammenligning, kontakt og formularer nemme at forstå | Beregner, prisside, formular og CTA'er ændres |
| `site-architecture` | coreyhaines31/marketingskills | Navigation, sidestruktur og interne links | Sider eller menu tilføjes/flyttes (husk `public/_redirects`) |
| `frontend-design` | anthropics/skills | OviaSpecs' egen visuelle identitet (typografi, farver, layout) | Nye sektioner/komponenter eller ændringer i `src/index.css` |
| `apple-design` | emilkowalski/skills | Hierarki, interaktion og bevægelse; reduced motion | Animationer og interaktionsfeedback |
| `seo-audit` | coreyhaines31/marketingskills | Teknisk SEO og indhold ud fra faktisk tilgængelige data | Før udgivelse og ved ændrede titler/URL'er |
| `schema` | coreyhaines31/marketingskills | JSON-LD, der stemmer med synligt, verificeret indhold | `organisationLd` i `src/entry-server.jsx` ændres |
| `local-seo-skills` (plugin, 39 skills) | garrettjsmith/localseoskills | Google Business Profile, lokale søgninger, lokale landingssider, NAP | Lokal synlighed for OviaSpecs eller kunder |
| `pricing-strategy`, `web-design-guidelines` | (fandtes før) | Prisstrategi; UI-review | Som før |

Local SEO-pluginnet er installeret med `claude plugin install local-seo-skills@garrettjsmith-localseo --scope project` (marketplace i `.claude/settings.json`). Flere af dets skills forventer eksterne datakilder (Search Console, GBP API, BrightLocal, Local Falcon, DataForSEO m.fl.). Ingen af dem er forbundet: brug kun data, der faktisk er adgang til, og opfind aldrig søgevolumen, placeringer, trafik eller auditresultater. Opret ingen betalte abonnementer eller automatiske opgaver.

## Arbejdsregler

- `git push origin main` udgiver. Arbejd på en gren; push/udgivelse kun efter Ronnys accept.
- Byg (`npm run build`) og kør `npm test` før en ændring meldes færdig. Browsertests (`npm run test:e2e` m.fl.) kræver `npm run preview`.
- Send aldrig testhenvendelser til den rigtige worker/mail.
