# C: Tekst og tilbud (rapport)

Model-ID: claude-sonnet-5-5 (Sonnet 5.5).

## Ændrede filer

- `src/data/offer.js` (ny): `buyModes`, `problems` (3), `process` (5, peger på `home.steps`), `homeFaq`, `terms`, `systems`, `localSeo`. Alle beløb via `formatKr` og tal fra pricing.js. Importerer `texts.js` (ikke omvendt).
- `src/data/texts.js`: nav, hero, calc, cards, examples (+ workflow), steps (5), about, contactSection, footer, nye `paths`. `meta` og `privacy` urørt.
- `src/data/services.js`: hjemmeside, marketing, bookingGoogle (Lokal synlighed), priser. `meta` urørt. Importerer nu `offer.js`.
- `src/content.demos.js`: `note` rettet (booking er tilvalg, ikke "med i Fuld fart"), nyt felt `workflow`.
- `npm test`: mine filer giver ingen fejl. De øvrige fejl (pakkeskift/overlap for `bookingGoogle`, "Vækst + B&G") ligger i F's igangværende arbejde med pricing.js/calculator.js.

## Nye felter (form)

```js
// texts.js
nav.solutions = { label: 'Løsninger', ariaLabel, items: [{ label, href, text }] }  // Hjemmesider, Lokal synlighed, Systemer, Marketing
nav.items     = [{ label, href }]   // Eksempler, Priser, Om og kontakt (/#om)
// rækkefølge i menuen: solutions, derefter items. nav.call/price/priceShort/menu/close uændret.

home.hero = { title, short, cta: 'Se priser', ctaHref: '#koebsmaader',
  secondary: { label: 'Se eksempler', href },
  offer: { heading: 'Hjemmeside uden opstartspris',
           line: '0 kr. i opstart · 995 kr./md. · mindst 6 måneder',   // bygget af data
           minimum: 'I alt mindst 5.970 kr.',                           // bygget af lokalMinimum()
           note, link: { label, href: '#koebsmaader' } },
  factsTitle, facts }               // facts-boksen bevaret (nu "Det er med i Lokal")
home.calc = { title: 'Beregn din pris', intro }
home.examples.workflow = { title, text, href: '/systemer/#demo', tag: 'Demo',
  label: 'Demo – ikke et færdigt system. Intet sendes eller gemmes.', open }
home.steps = { eyebrow, title, items: [5 × { title, text }] }   // også offer.process
paths.om, paths.koebsmaader, paths.vilkaar ('/priser/#vilkaar'), paths.workflowDemo

// offer.js (som kontrakten) + tilføjede felter
buyModes.lokal/koeb: { label, name, headline, priceLine, minimumLine, includes, excludes, cta, note }, compareNote
terms: { eyebrow, title, intro, lokal, koeb, both, difference }
systems: { eyebrow, title, lead, status, questionsFirst{title,note,items}, examplesTitle, examplesIntro,
           examples[{id,title,fits,includes,notIncluded,skipIf}], pricing, safety, demo{..,disclaimer}, contact }
localSeo: { eyebrow, title, intro, atStart, monthly, measurement, reviews, oneOff, excluded, goalNote }

// services.js (nyt)
hjemmeside.modes = { eyebrow, title, lead }, hjemmeside.terms (= offer.terms)
marketing.scope = { eyebrow, title, intro, items[{title,text}] }
bookingGoogle.localSeo (= offer.localSeo), bookingGoogle.packages.intro
priser.termsLink = { label, href }, priser.lead (ny: to købsmåder)
// content.demos.js: demos.workflow = { title, text, href, label, open }
```

## Ønsker til F (pricing.js m.m.)

F har allerede indsat `domainText`, `binding` ("Ingen bindingsperiode. Opsigelse med 1 måneds varsel."), `buyout` og `limit` på planerne. Resterende:

1. `services.marketing.binding`: `'Ingen bindingsperiode. Opsigelse med 1 måneds varsel.'` (services.js skriver allerede dette lokalt).
2. `services.marketing.pilot.terms`: erstat `'Er du tilfreds, giver du en ærlig udtalelse'` med `'Du er ikke forpligtet til at give en udtalelse'`. Overvej `'Gratis i 2 uger'` og `'Til gengæld må jeg bruge resultaterne som case'` (case-retten er stadig Ronnys beslutning). Tilføj evt. `'En pilot giver ikke ret til en positiv anmeldelse'`.
3. `driftPlans.*.summary` (vi-form og overløfte fjernes; minutterne vises). Forslag, med `${minutes}` fra planen:
   - basis: `'Hosting, sikkerhed og versionsbackup af hjemmesiden. Ingen indholdsrettelser. Til dig, der ikke regner med at skulle have ændret noget.'`
   - plus: `'Op til 15 minutters små rettelser pr. måned med tekst og billeder, du leverer, oveni driften. Ubrugte minutter overføres ikke.'`
   - ekstra: `'Op til 30 minutters små rettelser pr. måned med tekst og billeder, du leverer, oveni driften. Ubrugte minutter overføres ikke.'`
   `content` kan blive, hvis testen (`Drift: Plus, 199 kr./md, hjælp til billeder, tekst og nyheder`) skal bestå uændret; ellers `content`: Basis "Ingen indholdsrettelser", Plus/Ekstra "Op til N minutters små rettelser pr. måned". Overvej en fælles hjælper, så minutterne aldrig står som tekst alene.
4. `services.hjemmeside.drift.included`: `['Siden holdes online og sikker, med hosting, versionsbackup af hjemmesiden og almindelig fornyelse af ét standarddomæne op til ' + formatKr(domain.capPerYear) + ' om året']` (nu: "med backup og almindelig domænefornyelse": mangler loftet og ordet "versionsbackup"; "backup" alene kan læses som mere end det, der er etableret).
5. `bookingGoogle`-tier-tekster (lov arbejde, ikke resultat):
   - `startNow` (B&G): fjern "Jeg laver også op til 3 gratis opsætninger mod at bruge resultatet som case" eller bekræft med Ronny, at tilbuddet findes.
   - vaekst.summary `'Kunderne kan booke selv.'` → `'Booking koblet på det system, du har, eller et jeg finder sammen med dig.'`
   - fuld-fart.summary → `'Booking, QR-skilt til anmeldelser og opfølgning efter 30 dage.'`; features: `'QR-skilt, der fører til din anmeldelsesside (layout; print og forsendelse er ikke med)'`, `'Opfølgning efter 30 dage med tal fra Google-profilen'`.
   - Hjemmeside-tiers: vaekst.summary `'Flere sider, og du bliver fundet på Google.'` → `'Flere sider og din Google-profil sat op.'`; vaekst.features `'Sat op til at blive fundet på Google'` → `'Siden sat op, så Google kan læse den'`; fuld-fart.features `'Fundet på Google, også når folk søger i dit område'` → `'Lokalt SEO-fundament: titler, struktur og indhold til dit område'`.
   - `recommendedFor.label` (nu "Anbefalet, hvis du vil have Google-profilen sat op") er fin.
6. `services.hjemmeside.startNow` ("Du kan få en gratis demo nu. Opstart og betaling fra februar 2027.") og `paidStartText` ("Betalte opgaver fra februar 2027."): se åbne punkter.
7. `calcIntro`/trin 0 i beregneren skal bruge ordene "Løbende samarbejde" og "Køb hjemmesiden" (`buyModes.lokal.label` / `buyModes.koeb.label`).
8. Hvis du viser BuyModes-kortenes `cta.href` (`#beregner`) forvalgt til den rigtige købsmåde, så sig til; ellers ignorér href og forvælg ud fra kortet.

## Ønsker til D (hvor tekster skal vises)

- Nav: `nav.solutions` (disclosure) + `nav.items`. Mobil: `solutions.items` som liste under overskriften `solutions.label`.
- HomeHero: `hero.offer` som tilbudsboks (heading, line, minimum, note, link); `hero.cta` + `ctaHref`; `hero.secondary`; `facts`. Abonnementet står altid i `offer.line`, aldrig under en gratis-overskrift.
- HomeExamples: tredje kort fra `home.examples.workflow` (tag/label "Demo – ikke et færdigt system. Intet sendes eller gemmes."), uden skærmbillede.
- `Problems` ← `offer.problems`; `BuyModes` ← `offer.buyModes` (Lokal først; vis `priceLine` + `minimumLine` før `includes`; `compareNote` under; link til `paths.vilkaar`); `Terms` (`id="vilkaar"`) ← `offer.terms` (tre grupper + `difference` øverst); `Steps` har nu fem trin (grid-cols-3 passer ikke; brug `home.steps`/`offer.process`).
- `/hjemmeside/`: `hjemmeside.modes` (eyebrow/title/lead) + `offer.buyModes` (Lokal først) før pakkerne; evt. `hjemmeside.terms`.
- `/booking-google/` (Lokal synlighed): sektion fra `bookingGoogle.localSeo` (atStart / monthly / measurement / reviews / oneOff / excluded / goalNote). Pakkerne er engangsopgaver (`packages.intro`).
- `/marketing/`: ny sektion `marketing.scope` (før pakkerne eller efter piloten).
- `/systemer/`: `offer.systems` i rækkefølge: lead, status (synlig, ikke gemt i FAQ), questionsFirst, examples (med `skipIf`), pricing, safety, demo (`id="demo"` med `disclaimer` som synlig mærkning), contact.
- `/priser/`: `priser.lead`, `priser.termsLink` til `#vilkaar`.
- Footer: `footer.columns` (Løsninger / OviaSpecs inkl. Vilkår og Om og kontakt).

## Åbne punkter (kan ikke afgøres uden at opfinde fakta)

1. Startdato: `paidStartText` og hjemmesidens `startNow` siger "Betalte opgaver fra februar 2027" og "gratis demo nu". Lokal og abonnement kan så ikke tegnes før februar 2027. Skal tekstens "Hvornår kan vi starte?" gælde Lokal? Jeg har ikke ændret den.
2. B&G `startNow`: "op til 3 gratis opsætninger mod at bruge resultatet som case" findes ikke i briefet; bekræft eller fjern (pricing.js).
3. Pilotens "må bruge resultaterne som case" er bevaret; briefet kræver kun, at en positiv udtalelse ikke kan kræves.
4. Marketing: "kun indhold, du har godkendt" før publicering er min formulering af publiceringsansvaret; bekræft med Ronny. Der er ingen tal for videolængde, rettelsesrunder, råmateriale eller transport: teksten siger, at de aftales skriftligt. Google Ads er udeladt.
5. Systemer: grænserne 2 brugere / 100 sager pr. måned er ikke nævnt (kapacitet ikke kontrolleret). 30 minutters støtte står kun som "når et standardmodul er klar".
6. Momsregistrering og CVR er uverificeret; teksterne bruger kun `priceNote` og nævner intet om CVR.
7. Backup: kun "versionsbackup af hjemmesiden" er lovet. Teksten antager, at koden ligger i versionsstyring (som briefet siger); bekræft.
8. Svarmålet "inden for 24 timer på hverdage" er Ronnys eksisterende svartid, nu tilføjet "på hverdage".
9. `home.hero.short` siger ikke "Aarhus" (basen står i Om og footer). SEO-agenten kan lægge Aarhus i titel/metabeskrivelse.
