# Intern afprøvning af Lokal (de første tre kunder)

Intern styring. Hører ikke hjemme på hjemmesiden. Tallene er antagelser fra researchen (12. okt. 2026), ikke dokumentation for, at Lokal er rentabelt.

## Rammer

- Højst **tre samtidige kunder** i Lokal, mens modellen afprøves (kapacitet, ikke kunstig knaphed; nævnes ikke som pres på siden).
- Mål: mindst ca. 300 kr. i bidrag pr. arbejdstime over de første 6 måneder.
  - Formel: (månedspris × måneder − direkte omkostninger) / alle anvendte timer.
  - Lokal over 6 mdr.: 5.970 kr. Ved 100 kr./md i direkte omkostninger (600 kr.) giver 300 kr./time et timebudget på **17,9 timer** i alt (opstart + 6 måneders løbende arbejde).
  - Over ca. 25 timer de første 6 måneder er prisen for svag til målet. Så justeres omfang eller pris for **fremtidige** aftaler, ikke for indgåede.
- Ingen specialsystemer til en merpris på 500 kr./md. Systemer kun som afgrænset standardmodul (når et findes og er testet) eller som særskilt fast tilbud.

## Før aftalen (afklaringssamtale)

Notér for hver mulig kunde, også dem der siger nej:

| Felt | Svar |
| --- | --- |
| Virksomhed / branche | |
| Henvendelser pr. måned (ca.) | |
| Nuværende hjemmeside / system / booking | |
| Et eksempel på en besværlig sag | |
| Tid brugt pr. sag i dag (ca.) | |
| Konkret ønsket forbedring | |
| Google-profil: findes / verificeret / ejer | |
| Domæne: findes / hvem ejer og betaler | |
| Passer en lille engangsopgave bedre? (ja → sælg den) | |

Hvis problemet kun er et forkert telefonnummer eller en dårlig Google-profil: tilbyd en engangsopgave (Booking & Google Start), ikke Lokal.

## Leveranceliste pr. Lokal-kunde

Opstart (før lancering)
- [ ] Skriftligt aftalt omfang (1–3 indholdssider, ét sprog, én lokation, 2 korrekturrunder) sendt og accepteret
- [ ] Første måned betalt før fuld produktion (krediteres første abonnementsmåned)
- [ ] Materiale modtaget fra kunden (tekst, fakta, billeder)
- [ ] Udkast 1 → korrektur 1 → udkast 2 → korrektur 2
- [ ] Juridiske informationssider (privatlivspolitik m.m.) efter behov
- [ ] Domæne: eksisterende bliver i kundens navn; nyt registreres i kundens navn; fornyelse op til loftet aftalt; ingen dobbeltbetaling
- [ ] Hosting, SSL og versionsbackup (kode i versionsstyring) sat op
- [ ] Kontakt-/forespørgselsformular testet (testbesked til egen adresse, ikke til kundens kunder)
- [ ] Indledende SEO: titler, struktur, indekserbarhed, kontaktoplysninger
- [ ] Search Console tilsluttet med kunden som ejer
- [ ] Google Business Profile: berettigelse, kategori, åbningstider, links (verifikation afhænger af Google og kunden)
- [ ] Udgangspunkt noteret (se "Måling")
- [ ] Lancering; minimumsperioden (6 mdr.) starter

Hver måned
- [ ] Op til 45 min. prioriteret lokal SEO, kontrol og kort status
- [ ] Op til 15 min. små tekst-/billedrettelser (ubrugte minutter overføres ikke)
- [ ] Kort arbejdslog sendt til kunden (hvad, hvorfor, tal)
- [ ] Fejl i den aftalte leverance rettet som fejl, ikke solgt som tilvalg

## Tidslog

Én linje pr. arbejdsblok. Gem som regneark eller CSV (`docs/rebrand/tidslog.csv` lokalt; læg ikke kundedata i repoet, hvis det bliver offentligt).

```csv
dato,kunde,fase,minutter,beskrivelse,direkte_omkostning_kr
2027-02-03,Kunde A,salg,45,Afklaringssamtale,0
2027-02-05,Kunde A,onboarding,30,Materiale og adgange,0
2027-02-10,Kunde A,bygning,240,Udkast 1,0
2027-02-14,Kunde A,rettelser,60,Korrektur 1,0
2027-03-01,Kunde A,drift,20,Månedlig kontrol og status,0
2027-03-01,Kunde A,support,10,Spørgsmål om åbningstider,0
```

Faser: `salg` (også til dem, der siger nej; fordeles rimeligt på dem, der køber), `onboarding`, `bygning`, `rettelser`, `support`, `drift`, `seo`, `omkostning`.

## Måling (pr. kunde)

Adskil altid: visninger, klik, relevante henvendelser og faktiske salg.

| Mål | Udgangspunkt | 30 dage | 90 dage | Kilde / forbehold |
| --- | --- | --- | --- | --- |
| Search Console: visninger / klik | | | | Kræver adgang |
| Business Profile: visninger / klik på ringeknap / rutevejledning | | | | Et "opkald" er et klik på ringeknappen, ikke en gennemført samtale. Kan indeholde annonceaktivitet. |
| Relevante henvendelser via formularen | | | | |
| Svartid / komplette henvendelser | | | | |
| Accepterede tilbud (kundens oplysning) | | | | |

Notér sæson, tilbud, annoncering og andre ændringer. En før/efter-forskel er ikke i sig selv bevis for årsag. Opfind aldrig tal, hvor adgangen mangler.

## Evaluering

- **Efter 30 dage:** Kører drift og formular? Bruger kunden det? Hvor mange timer er brugt i forhold til budgettet (17,9 t over 6 mdr.)?
- **Efter 90 dage:** Tidsforbrug, tegn på værdi for kunden (tid sparet, bedre overblik, flere komplette henvendelser), bidrag pr. time.
- **Beslutning for fremtidige aftaler:** fortsæt / justér omfang / justér pris / justér kundetype.

Eksempel på kundens tidsværdi (ikke et løfte): 20 forespørgsler × 10 sparede minutter = 3 t 20 min. Ved kundens egen værdisætning på 300 kr./time er det 1.000 kr. i frigjort tid. Fem forespørgsler giver 250 kr. Tidsværdi er ikke nødvendigvis en kontant besparelse.
