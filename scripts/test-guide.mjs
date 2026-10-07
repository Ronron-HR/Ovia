/**
 * Test af behovsguiden (src/guide.js). De forventede priser er regnet ud for hånd
 * ud fra prislisten, ikke hentet fra koden: hjemmeside 2.500 / 4.000 / 5.000 kr. engangs,
 * driftsplaner Basis 199 / Plus 299 / Ekstra 399 kr. om måneden, egen konto +1.000 kr.
 * engangs (ingen månedspris), booking på siden +500, Booking & Google 500 / 1.000 /
 * 1.500, marketing 1.500 / 2.500 / 4.000 pr. måned.
 *
 * Tjekker: højst 3 spørgsmål (første + to opfølgende), forventet pris og driftsplan pr.
 * forløb (den mindste plan, der dækker svaret om ændringer; aldrig en dyrere), at en
 * kunde med hjemmeside aldrig får en ny på grund af booking, at "Jeg ved det ikke"
 * giver et forslag eller en afklaring uden pris, at senere svar nulstilles, når et
 * tidligere ændres, at adresselinjen kan læses igen, og at forslaget giver samme pris
 * i beregneren.
 */
import { parse, quote } from '../src/calculator.js'
import { fitGuide, parseGuide, proposal, questionList, serializeGuide, withAnswer } from '../src/guide.js'

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}

const cases = [
  // [navn, svar, engangs, pr. md, ydelse]
  ['hjemmeside 1 side, ingen ændringer', { behov: 'hjemmeside', sider: '1', aendringer: 'nej' }, 2500, 199, 'hjemmeside'],
  ['hjemmeside 2-5, lidt ændringer', { behov: 'hjemmeside', sider: '2-5', aendringer: 'lidt' }, 4000, 299, 'hjemmeside'],
  ['hjemmeside 6-8, jævnlige ændringer', { behov: 'hjemmeside', sider: '6-8', aendringer: 'jaevnligt' }, 5000, 399, 'hjemmeside'],
  ['hjemmeside 6-8, ingen ændringer (ikke Ekstra)', { behov: 'hjemmeside', sider: '6-8', aendringer: 'nej' }, 5000, 199, 'hjemmeside'],
  ['hjemmeside 1 side, jævnlige ændringer', { behov: 'hjemmeside', sider: '1', aendringer: 'jaevnligt' }, 2500, 399, 'hjemmeside'],
  ['hjemmeside 2-5, egen konto', { behov: 'hjemmeside', sider: '2-5', aendringer: 'egen' }, 5000, 0, 'hjemmeside'],
  ['hjemmeside ved ikke', { behov: 'hjemmeside', sider: 'ved-ikke', aendringer: 'ved-ikke' }, 2500, 199, 'hjemmeside'],
  ['hjemmeside, ved ikke om ændringer', { behov: 'hjemmeside', sider: '2-5', aendringer: 'ved-ikke' }, 4000, 199, 'hjemmeside'],
  ['google uden QR', { behov: 'google', anmeldelser: 'nej' }, 500, 0, 'bookingGoogle'],
  ['google med QR', { behov: 'google', anmeldelser: 'ja' }, 1500, 0, 'bookingGoogle'],
  ['google ved ikke', { behov: 'google', anmeldelser: 'ved-ikke' }, 500, 0, 'bookingGoogle'],
  ['booking, har hjemmeside', { behov: 'booking', harSide: 'ja' }, 1000, 0, 'bookingGoogle'],
  ['booking, ved ikke om hjemmeside', { behov: 'booking', harSide: 'ved-ikke' }, 1000, 0, 'bookingGoogle'],
  ['booking, ingen side, vil have side (mindste plan)', { behov: 'booking', harSide: 'nej', ogsaaSide: 'ja' }, 3000, 199, 'hjemmeside'],
  ['booking, ingen side, nok med Instagram', { behov: 'booking', harSide: 'nej', ogsaaSide: 'nej' }, 1000, 0, 'bookingGoogle'],
  ['booking, ingen side, ved ikke', { behov: 'booking', harSide: 'nej', ogsaaSide: 'ved-ikke' }, 1000, 0, 'bookingGoogle'],
  ['sociale, poster selv', { behov: 'sociale', opslag: 'nej', annoncer: 'nej' }, 0, 1500, 'marketing'],
  ['sociale, jeg poster', { behov: 'sociale', opslag: 'ja', annoncer: 'nej' }, 0, 2500, 'marketing'],
  ['sociale, annoncer', { behov: 'sociale', opslag: 'nej', annoncer: 'ja' }, 0, 4000, 'marketing'],
  ['sociale ved ikke', { behov: 'sociale', opslag: 'ved-ikke', annoncer: 'ved-ikke' }, 0, 1500, 'marketing'],
  ['usikker, Google', { behov: 'usikker', fokus: 'google', anmeldelser: 'nej' }, 500, 0, 'bookingGoogle'],
  ['usikker, booking, har side', { behov: 'usikker', fokus: 'booking', harSide: 'ja' }, 1000, 0, 'bookingGoogle'],
  ['usikker, booking, ingen side', { behov: 'usikker', fokus: 'booking', harSide: 'nej' }, 1000, 0, 'bookingGoogle'],
  ['usikker, hjemmeside', { behov: 'usikker', fokus: 'hjemmeside', sider: '1' }, 2500, 199, 'hjemmeside'],
]

for (const [name, a, once, monthly, key] of cases) {
  const list = questionList(a)
  check(list.length <= 3, `${name}: ${list.length} spørgsmål (højst 3)`)
  check(list.every((k) => a[k]), `${name}: svar mangler til ${list.filter((k) => !a[k])}`)
  const rec = proposal(a)
  check(rec.kind === 'plan', `${name}: ingen anbefaling`)
  if (rec.kind !== 'plan') continue
  check(rec.state.selected.length === 1 && rec.state.selected[0] === key, `${name}: ydelse ${rec.state.selected} (forventet ${key})`)
  check(rec.quote.total.once === once, `${name}: engangspris ${rec.quote.total.once} (forventet ${once})`)
  check(rec.quote.total.monthly === monthly, `${name}: månedspris ${rec.quote.total.monthly} (forventet ${monthly})`)
  check(rec.reasons.length > 0, `${name}: ingen begrundelse`)
  const g = fitGuide({ step: list.length + 1, a })
  check(g.step === list.length + 1, `${name}: resultattrinnet nås ikke`)
  const again = parseGuide(serializeGuide(g))
  check(JSON.stringify(again) === JSON.stringify(g), `${name}: guidens adresselinje kan ikke læses igen`)
  // Beregneren, åbnet fra forslaget, giver samme pris.
  const search = '?' + new URLSearchParams({ ydelser: key, ...rec.state.answers, trin: String(rec.state.step + 1) })
  const total = quote(parse(search)).total
  check(total.once === once && total.monthly === monthly, `${name}: beregneren giver ${total.once}/${total.monthly}`)
}

// Hjemmesiden: spørgsmålet om ændringer afløser bookingspørgsmålet, og planen følger svaret.
check(questionList({ behov: 'hjemmeside' }).join() === 'behov,sider,aendringer', `hjemmesidens spørgsmål: ${questionList({ behov: 'hjemmeside' })}`)
for (const [aendringer, plan, maxMonthly] of [['nej', 'basis', 199], ['lidt', 'plus', 299], ['jaevnligt', 'ekstra', 399], ['egen', 'egen', 0], ['ved-ikke', 'basis', 199]]) {
  const rec = proposal({ behov: 'hjemmeside', sider: '2-5', aendringer })
  check(rec.state.answers.drift === plan, `ændringer=${aendringer} gav drift=${rec.state.answers.drift} (forventet ${plan})`)
  check(rec.state.answers.bestilling === 'nej', `ændringer=${aendringer}: booking blev lagt til af sig selv`)
  // Aldrig dyrere end svaret kræver: månedsprisen er højst planens egen.
  check(rec.quote.total.monthly <= maxMonthly, `ændringer=${aendringer}: for dyr plan (${rec.quote.total.monthly}/md)`)
  check(rec.reasons.some((r) => /Basis|Plus|Ekstra|egen konto/.test(r)), `ændringer=${aendringer}: begrundelsen nævner ikke planen`)
}
// Stilles spørgsmålet om ændringer ikke (usikker → hjemmeside), siger begrundelsen, at den mindste plan er valgt.
check(proposal({ behov: 'usikker', fokus: 'hjemmeside', sider: '1' }).reasons.some((r) => /mindste driftsplan/.test(r)), 'uden svar om ændringer siger begrundelsen ikke, at den mindste plan er valgt')

// En kunde med hjemmeside får aldrig en ny hjemmeside på grund af booking.
for (const harSide of ['ja', 'ved-ikke']) {
  const rec = proposal({ behov: 'booking', harSide })
  check(!rec.state.selected.includes('hjemmeside'), `booking med hjemmeside=${harSide} giver ny hjemmeside`)
  const via = proposal({ behov: 'usikker', fokus: 'booking', harSide })
  check(!via.state.selected.includes('hjemmeside'), `usikker/booking med hjemmeside=${harSide} giver ny hjemmeside`)
}

// "Jeg ved det ikke" først: ingen pris, ingen opfundet pakke.
const unclear = proposal({ behov: 'usikker', fokus: 'ved-ikke' })
check(unclear.kind === 'unclear' && !unclear.quote && !unclear.state, 'usikker + ved ikke giver ikke en afklaring uden pris')
check(questionList({ behov: 'usikker', fokus: 'ved-ikke' }).length === 2, 'usikker + ved ikke stiller flere end 2 spørgsmål')

// Ændrede svar: senere svar nulstilles, og gamle tilvalg hænger ikke ved.
let g = { step: 4, a: { behov: 'hjemmeside', sider: '6-8', aendringer: 'jaevnligt' } }
g = withAnswer(g, 'behov', 'google')
check(!('sider' in g.a) && !('aendringer' in g.a), `skift af behov rydder ikke: ${JSON.stringify(g.a)}`)
check(g.step <= 2, `trinnet efter skift er ${g.step}`)
g = withAnswer({ step: 3, a: { behov: 'hjemmeside', sider: '1', aendringer: 'lidt' } }, 'sider', '2-5')
check(g.a.sider === '2-5' && !('aendringer' in g.a), `skift af sider rydder ikke senere svar: ${JSON.stringify(g.a)}`)
const same = withAnswer({ step: 4, a: { behov: 'hjemmeside', sider: '1', aendringer: 'lidt' } }, 'sider', '1')
check(same.a.aendringer === 'lidt', 'samme svar igen mistede det senere svar')
// Ugyldige adresselinjer
check(parseGuide('?hjaelp=3&g-behov=hjemmeside')?.step === 2, 'trin foran ubesvaret spørgsmål blev ikke rettet')
check(parseGuide('?hjaelp=1&g-behov=noget-andet')?.a.behov === undefined, 'ugyldigt svar blev accepteret')
check(parseGuide('?ydelser=hjemmeside') === null, 'guiden åbnes uden hjaelp')

if (failures.length) {
  console.error(`Guidetest FEJLET (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`Guidetest bestået: ${cases.length} forløb med uafhængigt udregnede priser, nulstilling, adresselinje og "ved ikke".`)
