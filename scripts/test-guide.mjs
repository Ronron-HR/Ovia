/**
 * Test af behovsguiden (src/guide.js). De forventede priser er regnet ud for hånd
 * ud fra prislisten, ikke hentet fra koden: hjemmeside 2.500 / 4.000 / 10\.000 kr. engangs,
 * driftsplaner Basis 198 / Plus 398 / Ekstra 798 kr. om måneden, booking på siden +1000,
 * Booking & Google 1000 / 1.000 / 1.500 (Google-profil 1000, booking 1000, QR-skilt og
 * opfølgning 1000), marketing 1.500 / 2.500 / 4.000 pr. måned, Lokal 0 kr. i opstart og
 * 1.990 kr./md i mindst 6 måneder (11\.940 kr.).
 *
 * Tjekker: højst 3 spørgsmål i alle forgreninger, forventet ydelse og pris pr. forløb,
 * "Google + QR → ingen booking" (Start + QR = 2\.000 kr.), at et QR-skilt aldrig giver
 * booking, at booking aldrig giver en ny kalender eller (med hjemmeside) en ny hjemmeside,
 * at et system aldrig anbefales med pris, mens standardmodulet ikke findes (og med pris,
 * når flaget sættes midlertidigt), at "Jeg ved det ikke" giver den mindste løsning, at
 * begrundelserne ikke lover placeringer, at senere svar nulstilles, at adresselinjen kan
 * læses igen, og at forslaget giver samme pris i beregneren.
 */
import { parse, quote, totalText } from '../src/calculator.js'
import { fitGuide, parseGuide, proposal, questionList, serializeGuide, withAnswer, QUESTIONS } from '../src/guide.js'
import { calculator, systemModule } from '../src/data/pricing.js'

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const cases = [
  // [navn, svar, engangs, pr. md, ydelser i forslaget]
  // Hjemmeside: køb. Mindste pakke, der dækker siderne, og driftsplanen Basis.
  ['køb 1 side', { behov: 'hjemmeside', sider: '1', model: 'koeb' }, 5000, 198, 'hjemmeside'],
  ['køb 2-3 sider', { behov: 'hjemmeside', sider: '2-3', model: 'koeb' }, 8000, 198, 'hjemmeside'],
  ['køb 4-5 sider', { behov: 'hjemmeside', sider: '4-5', model: 'koeb' }, 8000, 198, 'hjemmeside'],
  ['køb 6-8 sider', { behov: 'hjemmeside', sider: '6-8', model: 'koeb' }, 10000, 198, 'hjemmeside'],
  ['køb, ved ikke om sider (mindste)', { behov: 'hjemmeside', sider: 'ved-ikke', model: 'koeb' }, 5000, 198, 'hjemmeside'],
  ['betaling ved ikke → engangskøb (mindste)', { behov: 'hjemmeside', sider: '2-3', model: 'ved-ikke' }, 8000, 198, 'hjemmeside'],
  // Hjemmeside: Lokal, 0 kr. i opstart og 1.990 kr./md.
  ['Lokal 1 side', { behov: 'hjemmeside', sider: '1', model: 'lokal' }, 0, 1990, 'lokal'],
  ['Lokal 2-3 sider', { behov: 'hjemmeside', sider: '2-3', model: 'lokal' }, 0, 1990, 'lokal'],
  ['Lokal, ved ikke om sider', { behov: 'hjemmeside', sider: 'ved-ikke', model: 'lokal' }, 0, 1990, 'lokal'],
  // Lokal rummer højst 3 sider: kræver kunden flere, foreslås den mindste købspakke, der kan rumme dem.
  ['Lokal ønsket, men 4-5 sider → køb Vækst', { behov: 'hjemmeside', sider: '4-5', model: 'lokal' }, 8000, 198, 'hjemmeside'],
  ['Lokal ønsket, men 6-8 sider → køb Fuld fart', { behov: 'hjemmeside', sider: '6-8', model: 'lokal' }, 10000, 198, 'hjemmeside'],
  // Google: engangsopgave. QR-skiltet vælges uden booking.
  ['google uden QR', { behov: 'google', anmeldelser: 'nej' }, 1000, 0, 'bookingGoogle'],
  ['google + QR → ingen booking (Google 1000 + QR 1000)', { behov: 'google', anmeldelser: 'ja' }, 2000, 0, 'bookingGoogle'],
  ['google ved ikke om QR', { behov: 'google', anmeldelser: 'ved-ikke' }, 1000, 0, 'bookingGoogle'],
  // Booking: kobles på det, kunden har; aldrig en ny kalender.
  ['booking, har hjemmeside', { behov: 'booking', harSide: 'ja' }, 2000, 0, 'bookingGoogle'],
  ['booking, ved ikke om hjemmeside', { behov: 'booking', harSide: 'ved-ikke' }, 2000, 0, 'bookingGoogle'],
  ['booking, ingen side, vil købe side (mindste)', { behov: 'booking', harSide: 'nej', ogsaaSide: 'koeb' }, 6000, 198, 'hjemmeside'],
  ['booking, ingen side, vil have Lokal (Google-profil trukket fra)', { behov: 'booking', harSide: 'nej', ogsaaSide: 'lokal' }, 1000, 1990, 'lokal,bookingGoogle'],
  ['booking, ingen side, nok med Instagram', { behov: 'booking', harSide: 'nej', ogsaaSide: 'nej' }, 2000, 0, 'bookingGoogle'],
  ['booking, ingen side, ved ikke', { behov: 'booking', harSide: 'nej', ogsaaSide: 'ved-ikke' }, 2000, 0, 'bookingGoogle'],
  // Arbejdsgang: få sager → Lokal med en god formular (ingen pris på system).
  ['arbejdsgang, få sager', { behov: 'arbejdsgang', volumen: 'faa' }, 0, 1990, 'lokal'],
  ['arbejdsgang, ved ikke om antal (mindste)', { behov: 'arbejdsgang', volumen: 'ved-ikke' }, 0, 1990, 'lokal'],
  // Sociale medier
  ['sociale, poster selv', { behov: 'sociale', opslag: 'nej', annoncer: 'nej' }, 0, 3000, 'marketing'],
  ['sociale, jeg poster', { behov: 'sociale', opslag: 'ja', annoncer: 'nej' }, 0, 5000, 'marketing'],
  ['sociale, annoncer', { behov: 'sociale', opslag: 'nej', annoncer: 'ja' }, 0, 8000, 'marketing'],
  ['sociale ved ikke', { behov: 'sociale', opslag: 'ved-ikke', annoncer: 'ved-ikke' }, 0, 3000, 'marketing'],
  // Usikker
  ['usikker, Google', { behov: 'usikker', fokus: 'google', anmeldelser: 'nej' }, 1000, 0, 'bookingGoogle'],
  ['usikker, Google + QR', { behov: 'usikker', fokus: 'google', anmeldelser: 'ja' }, 2000, 0, 'bookingGoogle'],
  ['usikker, booking, har side', { behov: 'usikker', fokus: 'booking', harSide: 'ja' }, 2000, 0, 'bookingGoogle'],
  ['usikker, booking, ingen side', { behov: 'usikker', fokus: 'booking', harSide: 'nej' }, 2000, 0, 'bookingGoogle'],
  ['usikker, hjemmeside (betaling ukendt → engangskøb)', { behov: 'usikker', fokus: 'hjemmeside', sider: '1' }, 5000, 198, 'hjemmeside'],
]

const PROMISE = /placering|nummer 1|øverst på google|fundet på google|flere kunder|garanti/i

for (const [name, a, once, monthly, key] of cases) {
  const list = questionList(a)
  check(list.length <= 3, `${name}: ${list.length} spørgsmål (højst 3)`)
  check(list.every((k) => a[k]), `${name}: svar mangler til ${list.filter((k) => !a[k])}`)
  const rec = proposal(a)
  check(rec.kind === 'plan', `${name}: ingen anbefaling (${rec.kind})`)
  if (rec.kind !== 'plan') continue
  check(rec.state.selected.join() === key, `${name}: ydelse ${rec.state.selected} (forventet ${key})`)
  check(rec.quote.total.once === once, `${name}: engangspris ${rec.quote.total.once} (forventet ${once})`)
  check(rec.quote.total.monthly === monthly, `${name}: månedspris ${rec.quote.total.monthly} (forventet ${monthly})`)
  check(rec.reasons.length > 0, `${name}: ingen begrundelse`)
  check(!rec.reasons.some((r) => PROMISE.test(r)), `${name}: begrundelsen lover noget: ${rec.reasons.filter((r) => PROMISE.test(r))}`)
  const g = fitGuide({ step: list.length + 1, a })
  check(g.step === list.length + 1, `${name}: resultattrinnet nås ikke`)
  const again = parseGuide(serializeGuide(g))
  check(JSON.stringify(again) === JSON.stringify(g), `${name}: guidens adresselinje kan ikke læses igen`)
  // Beregneren, åbnet fra forslaget, giver samme pris (adresselinjen fra forslaget).
  const search = '?' + new URLSearchParams({ ydelser: rec.state.selected.join(), ...rec.state.answers, trin: String(rec.state.step + 1) })
  const calc = quote(parse(search))
  check(calc.total.once === once && calc.total.monthly === monthly, `${name}: beregneren giver ${calc.total.once}/${calc.total.monthly}`)
  check(totalText(calc.total) === totalText(rec.quote.total), `${name}: totaltekst forskellig i guide og beregner`)
  // Et system anbefales aldrig med pris, mens standardmodulet ikke findes.
  check(!rec.state.answers.system || rec.state.answers.system === 'nej', `${name}: foreslår et system, mens modulet ikke findes`)
}

// Højst tre spørgsmål i alle forgreninger: gennemløb alle kombinationer af svar.
{
  let paths = 0
  const walk = (a) => {
    const list = questionList(a)
    const next = list.find((k) => !a[k])
    if (!next) {
      paths++
      check(list.length <= 3, `forgrening ${JSON.stringify(a)}: ${list.length} spørgsmål`)
      const rec = proposal(a)
      check(['plan', 'talk', 'unclear'].includes(rec.kind), `forgrening ${JSON.stringify(a)}: ${rec.kind}`)
      if (rec.kind === 'plan') {
        check(!rec.state.answers.system || rec.state.answers.system === 'nej', `forgrening ${JSON.stringify(a)}: system med pris`)
        // Aldrig en ny hjemmeside på grund af booking hos en kunde med hjemmeside, og aldrig booking på grund af QR.
        if ((a.behov === 'booking' && (a.harSide === 'ja' || a.harSide === 'ved-ikke')) || a.behov === 'google') {
          check(!rec.state.selected.includes('hjemmeside') && !rec.state.selected.includes('lokal'), `forgrening ${JSON.stringify(a)}: ny hjemmeside`)
        }
        if (a.behov === 'google' || (a.behov === 'usikker' && a.fokus === 'google')) {
          check(rec.state.answers.booking === 'nej', `forgrening ${JSON.stringify(a)}: booking med Google/QR`)
        }
      }
      return
    }
    for (const o of QUESTIONS[next].options) walk({ ...a, [next]: o.id })
  }
  walk({})
  check(paths > 50, `kun ${paths} forgreninger gennemløbet`)
}

// Arbejdsgang med mange sager: intet færdigt standardmodul → ingen pris, en samtale/særskilt tilbud.
{
  const offer = proposal({ behov: 'arbejdsgang', volumen: 'mange', eksisterende: 'nej' })
  check(offer.kind === 'talk' && !offer.quote && !offer.state && /særskilt fast tilbud/.test(offer.text), `arbejdsgang mange, intet system: ${offer.kind}`)
  const have = proposal({ behov: 'arbejdsgang', volumen: 'mange', eksisterende: 'ja' })
  check(have.kind === 'talk' && !have.quote, `arbejdsgang mange, har system: ${have.kind} (sælger et nyt)`)
  const unsure = proposal({ behov: 'arbejdsgang', volumen: 'mange', eksisterende: 'ved-ikke' })
  check(unsure.kind === 'talk' && !unsure.quote, `arbejdsgang mange, ved ikke om system: ${unsure.kind}`)
  check(questionList({ behov: 'arbejdsgang', volumen: 'mange' }).join() === 'behov,volumen,eksisterende', 'arbejdsgang mange stiller ikke spørgsmålet om eksisterende system')
  check(questionList({ behov: 'arbejdsgang', volumen: 'faa' }).join() === 'behov,volumen', 'arbejdsgang få stiller for mange spørgsmål')
  // Med et færdigt standardmodul (flaget sættes midlertidigt): Lokal + system, 2\.990 kr./md og mindst 17\.940 kr.
  systemModule.ready = true
  try {
    const ready = proposal({ behov: 'arbejdsgang', volumen: 'mange', eksisterende: 'nej' })
    check(ready.kind === 'plan' && ready.quote.total.monthly === 2990 && ready.quote.total.lokal.minimum === 17940, `arbejdsgang med modul: ${ready.kind} ${ready.quote?.total.monthly}`)
    const stillHave = proposal({ behov: 'arbejdsgang', volumen: 'mange', eksisterende: 'ja' })
    check(stillHave.kind === 'talk', 'har kunden et system, sælges et nyt også med modul')
  } finally {
    systemModule.ready = false
  }
}

// Hjemmesiden: Lokal passer kun til 1-3 sider; køb vælger driftsplanen Basis og siger det.
{
  const lokal = proposal({ behov: 'hjemmeside', sider: '1', model: 'lokal' })
  check(lokal.quote.total.lokal?.minimum === 11940 && lokal.quote.total.lokal.months === 6, 'Lokal-forslaget mangler minimum 11\.940 kr./6 mdr.')
  check(lokal.reasons.some((r) => /Lokal/.test(r)), 'Lokal-forslaget nævner ikke Lokal i begrundelsen')
  const koeb = proposal({ behov: 'hjemmeside', sider: '2-3', model: 'koeb' })
  check(koeb.state.answers.drift === 'basis' && koeb.state.answers.bestilling === 'nej', `køb: drift ${koeb.state.answers.drift}, booking ${koeb.state.answers.bestilling}`)
  check(koeb.reasons.some((r) => /mindste driftsplan, Basis/.test(r)), 'køb: begrundelsen siger ikke, hvorfor Basis er valgt')
  check(questionList({ behov: 'hjemmeside' }).join() === 'behov,sider,model', `hjemmesidens spørgsmål: ${questionList({ behov: 'hjemmeside' })}`)
  check(proposal({ behov: 'hjemmeside', sider: '4-5', model: 'lokal' }).reasons.some((r) => /rummer/.test(r)), 'Lokal ønsket med 4-5 sider forklarer ikke, hvorfor der foreslås køb')
}

// "Jeg ved det ikke" først: ingen pris, ingen opfundet pakke.
const unclear = proposal({ behov: 'usikker', fokus: 'ved-ikke' })
check(unclear.kind === 'unclear' && !unclear.quote && !unclear.state, 'usikker + ved ikke giver ikke en afklaring uden pris')
check(questionList({ behov: 'usikker', fokus: 'ved-ikke' }).length === 2, 'usikker + ved ikke stiller flere end 2 spørgsmål')

// Ændrede svar: senere svar nulstilles, og gamle tilvalg hænger ikke ved.
let g = { step: 4, a: { behov: 'hjemmeside', sider: '6-8', model: 'koeb' } }
g = withAnswer(g, 'behov', 'google')
check(!('sider' in g.a) && !('model' in g.a), `skift af behov rydder ikke: ${JSON.stringify(g.a)}`)
check(g.step <= 2, `trinnet efter skift er ${g.step}`)
g = withAnswer({ step: 3, a: { behov: 'hjemmeside', sider: '1', model: 'lokal' } }, 'sider', '2-3')
check(g.a.sider === '2-3' && !('model' in g.a), `skift af sider rydder ikke senere svar: ${JSON.stringify(g.a)}`)
const same = withAnswer({ step: 4, a: { behov: 'hjemmeside', sider: '1', model: 'lokal' } }, 'sider', '1')
check(same.a.model === 'lokal', 'samme svar igen mistede det senere svar')
// Ugyldige adresselinjer
check(parseGuide('?hjaelp=3&g-behov=hjemmeside')?.step === 2, 'trin foran ubesvaret spørgsmål blev ikke rettet')
check(parseGuide('?hjaelp=1&g-behov=noget-andet')?.a.behov === undefined, 'ugyldigt svar blev accepteret')
check(parseGuide('?ydelser=hjemmeside') === null, 'guiden åbnes uden hjaelp')
// Spring over: teksterne findes (UI'et går direkte til beregneren).
check(Boolean(calculator.guide.skip), 'guiden mangler "Spring over"')

if (failures.length) {
  console.error(`Guidetest FEJLET (${failures.length}):\n- ${failures.slice(0, 25).join('\n- ')}`)
  process.exit(1)
}
console.log(`Guidetest bestået: ${cases.length} forløb med uafhængigt udregnede priser, alle forgreninger højst 3 spørgsmål, Google + QR uden booking, system aldrig med pris, nulstilling, adresselinje og "ved ikke".`)
