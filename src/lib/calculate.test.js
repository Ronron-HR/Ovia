// Kør: node --test src/lib/calculate.test.js   (Node >= 20.10)
// Alle forventede priser er regnet i hånden (ikke ud fra calculate), så en fejl i reglerne ikke kan skjule sig selv.
import test from 'node:test';
import assert from 'node:assert/strict';
import prices from '../data/prices.json' with { type: 'json' };
import {
  calculate,
  clean,
  emptySelection,
  flowOf,
  fromQuery,
  guidedHelp,
  introActive,
  isComplete,
  isOldLink,
  optionTag,
  stepsFor,
  toQuery,
} from './calculate.js';

const withSlots = (n) => ({ ...prices, introSlotsLeft: n });
const S = (path, extra = {}) => ({ ...emptySelection(), path, ...extra });
const site = (pkg, extra = {}) => S('site', { pkg, ...extra });
const both = (pkg, extra = {}) => S('both', { pkg, ...extra });
const sys = (extra = {}) => S('system', extra);
const sum = (r) => [r.once, r.monthly];

test('1. Hjemmeside alene: hver pakke (Start, Anbefalet, Max) = pakkens pris', () => {
  assert.deepEqual(sum(calculate(site(0))), [5000, 299]);
  assert.deepEqual(sum(calculate(site(1))), [9500, 699]);
  assert.deepEqual(sum(calculate(site(2))), [15000, 1295]);
});
test('2. Intet valgt giver 0/0 og ingen linjer (ingen vej, eller vej uden pakke/funktion)', () => {
  for (const sel of [emptySelection(), S('site'), S('both'), S('system')]) {
    const r = calculate(sel);
    assert.deepEqual(sum(r), [0, 0]);
    assert.equal(r.lines.length, 0);
  }
});
test('3. Løs et problem alene: bordbooking 2.500 + 299/md., online bestilling 3.500 + 449/md.; bygget specielt har ingen pris', () => {
  assert.deepEqual(sum(calculate(sys({ systems: ['booking'] }))), [2500, 299]);
  assert.deepEqual(sum(calculate(sys({ systems: ['bestilling'] }))), [3500, 449]);
  assert.deepEqual(sum(calculate(sys({ systems: ['booking', 'bestilling'] }))), [6000, 748]);
  const custom = calculate(sys({ custom: 1 }));
  assert.deepEqual(sum(custom), [0, 0]);
  assert.equal(custom.hasQuote, true);
  assert.deepEqual(custom.lines.map((l) => [l.key, l.quote, l.once, l.monthly]), [['custom-1', true, 0, 0]]);
  assert.deepEqual(sum(calculate(sys({ systems: ['booking'], custom: 1 }))), [2500, 299]);
  assert.equal(calculate(sys({ systems: ['booking'] })).hasQuote, false);
});
test('4. Løs et problem alene: ingen pakke, ingen intro, og en valgt pakke eller intro fra en anden vej tæller ikke med', () => {
  const r = calculate(sys({ pkg: 2, systems: ['booking'], intro: true }), withSlots(3));
  assert.deepEqual(sum(r), [2500, 299]);
  assert.equal(r.introApplied, false);
  assert.deepEqual(r.lines.map((l) => l.key), ['sys-booking']);
  assert.equal(r.lines[0].included, false);
});
test('5. Hjemmeside alene: funktioner fra en anden vej tæller ikke med', () => {
  const r = calculate(site(1, { systems: ['booking', 'bestilling'], custom: 1 }));
  assert.deepEqual(sum(r), [9500, 699]);
  assert.equal(r.hasQuote, false);
});
test('6. Begge: Anbefalet har 1 funktion med; den næste er ekstra med sin egen pris', () => {
  assert.deepEqual(sum(calculate(both(1))), [9500, 699]);
  assert.deepEqual(sum(calculate(both(1, { systems: ['booking'] }))), [9500, 699]);
  const two = calculate(both(1, { systems: ['booking', 'bestilling'] }));
  assert.deepEqual(sum(two), [13000, 1148]);
  assert.equal(two.lines.find((l) => l.key === 'sys-booking').included, true);
  assert.equal(two.lines.find((l) => l.key === 'sys-bestilling').included, false);
  // Rækkefølgen af valg bestemmer, hvilken der indgår.
  assert.deepEqual(sum(calculate(both(1, { systems: ['bestilling', 'booking'] }))), [9500 + 2500, 699 + 299]);
});
test('7. Begge: bygget specielt har ingen pris, tager ingen plads i pakken og ændrer ikke totalerne', () => {
  const c = calculate(both(1, { custom: 1 }));
  assert.deepEqual(sum(c), [9500, 699]);
  assert.equal(c.hasQuote, true);
  assert.equal(c.lines.find((l) => l.key === 'custom-1').quote, true);
  assert.deepEqual(sum(calculate(both(1, { systems: ['booking'], custom: 1 }))), [9500, 699]);
  assert.deepEqual(sum(calculate(both(1, { systems: ['booking', 'bestilling'], custom: 1 }))), [13000, 1148]);
});
test('8. Begge: Max har 2 pladser, så bordbooking og online bestilling begge er med i prisen', () => {
  const both2 = calculate(both(2, { systems: ['booking', 'bestilling'] }));
  assert.deepEqual(sum(both2), [15000, 1295]);
  assert.deepEqual(both2.lines.filter((l) => l.key.startsWith('sys-')).map((l) => l.included), [true, true]);
  assert.deepEqual(sum(calculate(both(2, { systems: ['booking'] }))), [15000, 1295]);
  assert.deepEqual(sum(calculate(both(2, { systems: ['booking', 'bestilling'], custom: 1 }))), [15000, 1295]);
});
test('9. Begge: Start har ingen funktioner med, så hver koster ekstra', () => {
  assert.deepEqual(sum(calculate(both(0, { systems: ['booking'] }))), [7500, 598]);
  assert.deepEqual(sum(calculate(both(0, { systems: ['booking', 'bestilling'] }))), [11000, 1047]);
  assert.deepEqual(sum(calculate(both(0, { custom: 1 }))), [5000, 299]);
});
test('10. Intropris (3 pladser): pakkens introOnce (4.495 / 8.495 / 13.495), ikke måned og ikke funktioner; kun hjemmeside og begge', () => {
  const cfg = withSlots(3);
  const r = calculate(both(1, { systems: ['booking', 'bestilling'], intro: true }), cfg);
  assert.equal(r.introSaving, 1005);
  assert.deepEqual(sum(r), [13000 - 1005, 1148]);
  assert.equal(r.onceNormal, 13000);
  assert.equal(r.introApplied, true);
  assert.deepEqual(sum(calculate(site(0, { intro: true }), cfg)), [4495, 299]);
  assert.deepEqual(sum(calculate(site(1, { intro: true }), cfg)), [8495, 699]);
  assert.deepEqual(sum(calculate(site(2, { intro: true }), cfg)), [13495, 1295]);
  assert.deepEqual(sum(calculate(both(2, { systems: ['booking'], custom: 1, intro: true }), cfg)), [15000 - 1505, 1295]);
  assert.equal(calculate(sys({ systems: ['booking'], intro: true }), cfg).introApplied, false);
});
test('11. Ved 0 pladser findes intro ikke: valget ignoreres og der er ingen intro-linje', () => {
  const cfg = withSlots(0);
  assert.equal(introActive(cfg), false);
  const r = calculate(site(1, { intro: true }), cfg);
  assert.equal(r.introApplied, false);
  assert.equal(r.introSaving, 0);
  assert.equal(r.lines.some((l) => l.key === 'intro'), false);
  assert.deepEqual(sum(r), [9500, 699]);
  assert.equal(clean(site(1, { intro: true }), cfg).intro, false);
  assert.equal(fromQuery('v=h&p=1&i=1', cfg).selection.intro, false);
  assert.deepEqual(stepsFor('site'), ['need', 'pkg', 'sum']);
  assert.deepEqual(stepsFor('both'), ['need', 'pkg', 'sys', 'sum']);
});
test('12. Der findes ikke noget engelsk-tilvalg: ikke i prisen, ikke i valget, og et gammelt e=1 ændrer intet', () => {
  assert.equal(JSON.stringify(prices).toLowerCase().includes('"english"'), false);
  assert.equal('english' in emptySelection(), false);
  assert.equal(fromQuery('v=h&p=1&e=1').selection.english, undefined);
  assert.deepEqual(sum(calculate(fromQuery('p=0&e=1').selection)), [5000, 299]);
  assert.equal(prices.website.parts.includes('På dansk og engelsk'), true);
});
test('13. clean() afviser ugyldigt input og beholder valg fra de andre veje', () => {
  assert.deepEqual(clean({ path: 'ukendt', pkg: 1 }), emptySelection());
  assert.deepEqual(clean({ pkg: 7 }), emptySelection());
  const c = clean({ path: 'both', pkg: 1, systems: ['booking', 'booking', 'findesikke'], custom: 99 });
  assert.deepEqual(c.systems, ['booking']);
  assert.equal(c.custom, prices.systems.custom.max);
  assert.equal(clean({ path: 'site', pkg: 9 }).pkg, null);
  // Skift af vej og tilbage mister ikke noget.
  const kept = clean({ path: 'system', pkg: 2, systems: ['booking'], custom: 1 });
  assert.equal(kept.pkg, 2);
});
test('14. isComplete: hjemmeside og begge kræver en pakke, system alene mindst én funktion', () => {
  assert.equal(isComplete(emptySelection()), false);
  assert.equal(isComplete(site(null)), false);
  assert.equal(isComplete(site(0)), true);
  assert.equal(isComplete(both(null, { systems: ['booking'] })), false);
  assert.equal(isComplete(both(0)), true);
  assert.equal(isComplete(sys()), false);
  assert.equal(isComplete(sys({ systems: ['booking'] })), true);
  assert.equal(isComplete(sys({ custom: 1 })), true);
  assert.equal(isComplete(sys({ pkg: 2 })), false);
});
test('15. Trin pr. vej: hjemmeside = Behov, Pakke, Samlet pris · løs et problem = Behov, Hvad skal løses?, Samlet pris · begge = alle (rabatten er ikke et trin)', () => {
  assert.deepEqual(stepsFor(null), ['need']);
  assert.deepEqual(stepsFor('site'), ['need', 'pkg', 'sum']);
  assert.deepEqual(stepsFor('system'), ['need', 'sys', 'sum']);
  assert.deepEqual(stepsFor('both'), ['need', 'pkg', 'sys', 'sum']);
});
test('16. flowOf: man kan højst nå det første ufærdige trin; et trin fra en anden vej bliver til nærmeste gyldige', () => {
  assert.equal(flowOf(emptySelection(), 'sum').step, 'need');
  assert.equal(flowOf(S('site'), 'sum').step, 'pkg');
  assert.equal(flowOf(site(1), 'sum').step, 'sum');
  assert.equal(flowOf(site(1), 'sys').step, 'pkg');
  assert.equal(flowOf(sys(), 'sum').step, 'sys');
  assert.equal(flowOf(sys({ custom: 1 }), 'sum').step, 'sum');
  assert.equal(flowOf(both(null), 'sys').step, 'pkg');
  assert.equal(flowOf(both(1), 'sys').step, 'sys');
  const f = flowOf(site(1), 'pkg', withSlots(3));
  assert.deepEqual([f.index, f.total, f.next, f.prev, f.canNext], [1, 3, 'sum', 'need', true]);
  assert.equal(flowOf(S('site'), 'pkg').canNext, false);
  assert.equal(flowOf(sys(), 'sys').canNext, false);
  assert.equal(flowOf(sys({ systems: ['booking'] }), 'sys').canNext, true);
  assert.equal(flowOf(site(1), 'disc', withSlots(0)).step, 'sum');
  assert.equal(flowOf(site(1), 'disc', withSlots(3)).step, 'sum');
});
test('17. optionTag: Indgår kun på valgte funktioner, pakken dækker; alle andre viser deres pris', () => {
  const booking = { once: 2500, monthly: 299 };
  const bestilling = { once: 3500, monthly: 449 };
  // Start: ingen funktioner med, alle koster ekstra (også de valgte).
  assert.deepEqual(optionTag(both(0), 'booking'), { kind: 'extra', ...booking });
  assert.equal(optionTag(both(0, { systems: ['booking'] }), 'booking').kind, 'extra');
  // Anbefalet: 1 plads. Ingen valgt: pladsen er ledig. Én valgt: den står som Indgår, den anden som ekstra.
  assert.equal(optionTag(both(1), 'booking').kind, 'free');
  assert.equal(optionTag(both(1, { systems: ['booking'] }), 'booking').kind, 'included');
  assert.deepEqual(optionTag(both(1, { systems: ['booking'] }), 'bestilling'), { kind: 'extra', ...bestilling });
  const two = both(1, { systems: ['booking', 'bestilling'] });
  assert.equal(optionTag(two, 'booking').kind, 'included');
  assert.deepEqual(optionTag(two, 'bestilling'), { kind: 'extra', ...bestilling });
  // Max: 2 pladser. Bygget specielt tager ingen plads.
  assert.equal(optionTag(both(2, { systems: ['booking'] }), 'bestilling').kind, 'free');
  assert.equal(optionTag(both(2, { systems: ['booking', 'bestilling'] }), 'bestilling').kind, 'included');
  assert.equal(optionTag(both(2, { systems: ['booking'], custom: 1 }), 'bestilling').kind, 'free');
  // Løs et problem alene: funktionens egen pris. Hjemmeside alene eller uden pakke: ingen tag.
  assert.deepEqual(optionTag(sys(), 'booking'), { kind: 'price', ...booking });
  assert.deepEqual(optionTag(sys(), 'bestilling'), { kind: 'price', ...bestilling });
  assert.equal(optionTag(site(1), 'booking'), null);
  assert.equal(optionTag(both(null), 'booking'), null);
});
test('18. Funktionerne: kun bordbooking og online bestilling har en pris; bygget specielt aftales (højst ét valg)', () => {
  assert.deepEqual(prices.systems.standard.map((s) => s.key), ['booking', 'bestilling']);
  assert.ok(prices.systems.standard.every((s) => s.once > 0 && s.monthly > 0));
  assert.equal(prices.systems.custom.max, 1);
  assert.equal(prices.systems.custom.once, undefined);
  assert.equal(prices.systems.custom.monthly, undefined);
  assert.equal(clean(sys({ custom: 5 })).custom, 1);
  assert.equal(clean(sys({ systems: ['gavekort', 'nyhedsbrev', 'anmeldelser', 'booking'] })).systems.join(), 'booking');
});
test('19. Guidet hjælp vælger den billigste pakke, der opfylder behovet, og vejen (hjemmeside eller begge)', () => {
  assert.equal(guidedHelp({ q1: 'A', q2: [], q3: 'A' }).pkg, 0);
  assert.equal(guidedHelp({ q1: 'A', q2: [], q3: 'A' }).path, 'site');
  assert.equal(guidedHelp({ q1: 'B', q2: ['A'], q3: 'A' }).pkg, 1);
  assert.equal(guidedHelp({ q1: 'B', q2: ['A'], q3: 'A' }).path, 'both');
  assert.equal(guidedHelp({ q1: 'C', q2: ['A', 'B'], q3: 'B' }).pkg, 2);
  const g = guidedHelp({ q1: 'A', q2: ['A', 'B'], q3: 'A' });
  assert.equal(g.intro, false);
  assert.equal(g.path, 'both');
  assert.deepEqual(g.systems, ['booking', 'bestilling']);
  assert.equal(guidedHelp({ q1: 'A', q2: [], q3: 'B' }).custom, 1);
});
test('20. Del-link: rundtur pr. vej, kun felter der hører til vejen, og trin', () => {
  const cfg = withSlots(3);
  const b = both(1, { systems: ['booking', 'bestilling'], custom: 1, intro: true });
  assert.equal(toQuery(b, 'sum'), 'v=b&p=1&y=bo&c=1&i=1&t=sum');
  const back = fromQuery(toQuery(b, 'sum'), cfg);
  assert.deepEqual(back.selection, clean(b, cfg));
  assert.equal(back.step, 'sum');
  assert.equal(toQuery(site(1, { systems: ['booking'], custom: 2, intro: true }), 'pkg'), 'v=h&p=1&i=1&t=pkg');
  assert.equal(toQuery(sys({ pkg: 2, systems: ['booking', 'bestilling'], custom: 1, intro: true }), 'sum'), 'v=s&y=bo&c=1&t=sum');
  assert.equal(toQuery(emptySelection(), 'need'), '');
  assert.equal(toQuery(S('both'), 'need'), 'v=b&t=need');
  // Samme pris før og efter en rundtur, for hver vej.
  for (const sel of [site(0), site(2, { intro: true }), sys({ systems: ['booking'], custom: 1 }), both(2, { systems: ['booking', 'bestilling'], custom: 1 })]) {
    const again = fromQuery(toQuery(sel, 'sum'), cfg).selection;
    assert.deepEqual(sum(calculate(again, cfg)), sum(calculate(sel, cfg)));
  }
  // Et trin, der ikke findes for vejen, bliver til nærmeste gyldige.
  assert.equal(fromQuery('v=s&y=b&t=pkg', cfg).step, 'sys');
  assert.equal(fromQuery('v=h&p=1&t=sum', cfg).step, 'sum');
  assert.equal(fromQuery('v=h&t=sum', cfg).step, 'pkg');
});
test('21. Links fra pakke-versionen (uden v) og gamle links', () => {
  // Pakke-versionens links: funktioner eller bygget specielt → begge, ellers hjemmeside. Trin var et tal.
  const a = fromQuery('p=1&y=bg&c=1&e=1&i=1&t=4', withSlots(3)); // g (gavekort) findes ikke længere og droppes
  assert.equal(a.selection.path, 'both');
  assert.equal(a.step, 'sum');
  assert.equal(fromQuery('p=2&t=3', withSlots(3)).selection.path, 'site');
  assert.equal(fromQuery('p=2&t=3', withSlots(3)).step, 'sum'); // 'Rabat' findes ikke længere som trin
  assert.equal(fromQuery('').selection.path, null);
  assert.equal(isOldLink('w=1&d=b'), true);
  assert.equal(isOldLink('p=1&y=b'), false);
  assert.equal(isOldLink('v=h'), false);
  assert.equal(fromQuery('w=1&m=2').old, true);
});
