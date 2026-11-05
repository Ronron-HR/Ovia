// Kør: node --test src/lib/calculate.test.js   (Node >= 20.10)
import test from 'node:test';
import assert from 'node:assert/strict';
import prices from '../data/prices.json' with { type: 'json' };
import { calculate, clean, emptySelection, fromQuery, guidedHelp, introActive, isOldLink, nextSystemCost, toQuery } from './calculate.js';

const withSlots = (n) => ({ ...prices, introSlotsLeft: n });
const S = (pkg, extra = {}) => ({ ...emptySelection(), pkg, ...extra });
const sum = (r) => [r.once, r.monthly];

test('1. Hver pakke alene: Start, Anbefalet, Max', () => {
  assert.deepEqual(sum(calculate(S(0))), [5000, 299]);
  assert.deepEqual(sum(calculate(S(1))), [9500, 549]);
  assert.deepEqual(sum(calculate(S(2))), [15000, 895]);
});
test('2. Intet valgt giver 0/0 og ingen linjer', () => {
  const r = calculate(emptySelection());
  assert.deepEqual(sum(r), [0, 0]);
  assert.equal(r.lines.length, 0);
});
test('3. Anbefalet: ét system indgår, to systemer giver ét tilvalg (2.000 + 99/md.)', () => {
  assert.deepEqual(sum(calculate(S(1, { systems: ['booking'] }))), [9500, 549]);
  const two = calculate(S(1, { systems: ['booking', 'gavekort'] }));
  assert.deepEqual(sum(two), [11500, 648]);
  assert.equal(two.lines.find((l) => l.key === 'sys-booking').included, true);
  assert.equal(two.lines.find((l) => l.key === 'sys-gavekort').included, false);
});
test('4. Start har ingen systemer med: hvert standardsystem er et tilvalg', () => {
  assert.deepEqual(sum(calculate(S(0, { systems: ['booking'] }))), [7000, 398]);
});
test('5. Max: to systemer indgår, et skræddersyet bruger en plads, ekstra koster tilvalgspris', () => {
  assert.deepEqual(sum(calculate(S(2, { systems: ['booking', 'bestilling'] }))), [15000, 895]);
  assert.deepEqual(sum(calculate(S(2, { systems: ['booking'], custom: 1 }))), [15000, 895]);
  assert.deepEqual(sum(calculate(S(2, { systems: ['booking', 'bestilling'], custom: 1 }))), [17000, 994]);
  assert.deepEqual(sum(calculate(S(2, { custom: 2 }))), [20000, 1094]);
});
test('6. Skræddersyet system til Anbefalet er altid et tilvalg (pakken har ingen skræddersyet plads)', () => {
  assert.deepEqual(sum(calculate(S(1, { custom: 1 }))), [14500, 748]);
  assert.deepEqual(sum(calculate(S(1, { systems: ['booking'], custom: 1 }))), [14500, 748]);
});
test('7. Engelsk version: 1.500 til Start/Anbefalet, indgår i Max (og ignoreres der)', () => {
  assert.deepEqual(sum(calculate(S(0, { english: true }))), [6500, 299]);
  assert.deepEqual(sum(calculate(S(1, { english: true }))), [11000, 549]);
  assert.deepEqual(sum(calculate(S(2, { english: true }))), [15000, 895]);
});
test('8. Intropris (3 pladser): 30 % af pakkens engangspris, ikke måned og ikke tilvalg', () => {
  const r = calculate(S(1, { systems: ['booking', 'gavekort'], english: true, intro: true }), withSlots(3));
  assert.equal(r.introSaving, 2850);
  assert.deepEqual(sum(r), [11500 + 1500 - 2850, 648]);
  assert.equal(r.onceNormal, 13000);
  assert.equal(r.introApplied, true);
  assert.deepEqual(sum(calculate(S(0, { intro: true }), withSlots(3))), [3500, 299]);
  assert.deepEqual(sum(calculate(S(2, { intro: true }), withSlots(3))), [10500, 895]);
});
test('9. Ved 0 pladser findes intro ikke: valget ignoreres, ingen intro-linje', () => {
  const cfg = withSlots(0);
  assert.equal(introActive(cfg), false);
  const r = calculate(S(1, { intro: true }), cfg);
  assert.equal(r.introApplied, false);
  assert.equal(r.introSaving, 0);
  assert.equal(r.lines.some((l) => l.key === 'intro'), false);
  assert.deepEqual(sum(r), [9500, 549]);
  assert.equal(clean(S(1, { intro: true }), cfg).intro, false);
  assert.equal(fromQuery('p=1&i=1', cfg).selection.intro, false);
});
test('10. clean() afviser ugyldigt input', () => {
  assert.deepEqual(clean({ pkg: 7 }), emptySelection());
  const c = clean({ pkg: 1, systems: ['booking', 'booking', 'findesikke'], custom: 99, english: 'ja' });
  assert.deepEqual(c.systems, ['booking']);
  assert.equal(c.custom, prices.systems.custom.max);
  assert.equal(c.english, true);
});
test('11. nextSystemCost: hvad næste system koster', () => {
  assert.deepEqual(nextSystemCost(S(1), 'standard'), { once: 0, monthly: 0 });
  assert.deepEqual(nextSystemCost(S(1, { systems: ['booking'] }), 'standard'), { once: 2000, monthly: 99 });
  assert.deepEqual(nextSystemCost(S(1, { systems: ['booking'] }), 'custom'), { once: 5000, monthly: 199 });
  assert.equal(nextSystemCost(emptySelection(), 'standard'), null);
});
test('12. Guidet hjælp vælger den billigste pakke, der opfylder behovet', () => {
  assert.equal(guidedHelp({ q1: 'A', q2: [], q3: 'A' }).pkg, 0);
  assert.equal(guidedHelp({ q1: 'B', q2: ['A'], q3: 'A' }).pkg, 1);
  assert.equal(guidedHelp({ q1: 'C', q2: ['A', 'B'], q3: 'B' }).pkg, 2);
  const g = guidedHelp({ q1: 'A', q2: ['A', 'B', 'C'], q3: 'A' });
  assert.equal(g.intro, false);
  assert.equal(g.english, false);
});
test('13. Del-link: rundtur og gamle links', () => {
  const sel = S(1, { systems: ['booking', 'gavekort'], custom: 1, english: true, intro: true });
  const q = toQuery(sel, 4);
  assert.equal(q, 'p=1&y=bg&c=1&e=1&i=1&t=4');
  const back = fromQuery(q, withSlots(3));
  assert.deepEqual(back.selection, clean(sel, withSlots(3)));
  assert.equal(back.step, 4);
  assert.equal(toQuery(emptySelection(), 1), '');
  assert.equal(isOldLink('w=1&d=b'), true);
  assert.equal(isOldLink('p=1&y=b'), false);
  assert.equal(fromQuery('w=1&m=2').old, true);
});
