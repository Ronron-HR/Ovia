// Beregnerens tilstand: valg, fjernelse (totaler, del-link og trin) og guidet hjælp. Kør: node --test src/components/calculator/useCalculator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { introActive, toQuery } from '../../lib/calculate.js';
import { buildReceipt } from '../../lib/receipt.js';
import { initialState, reducer } from './useCalculator.js';

const run = (...actions) => actions.reduce((s, a) => reducer(s, a), initialState);
const totals = (s) => {
  const r = buildReceipt(s.selection);
  return [r.o, r.m];
};
const pkg = (n) => ({ type: 'togglePkg', pkg: n });
const sys = (key) => ({ type: 'toggleSystem', key });

test('Vælg Anbefalet, tilføj to systemer, fjern det ene: totaler og del-link følger med', () => {
  let s = run(pkg(1), sys('booking'), sys('gavekort'));
  assert.deepEqual(totals(s), [11500, 648]);
  s = reducer(s, sys('gavekort'));
  assert.deepEqual(totals(s), [9500, 549]);
  assert.equal(toQuery(s.selection, s.step), 'p=1&y=b');
});

test('Tryk på den valgte pakke igen fjerner alt: tom tilstand, trin 1, tomt del-link og 0/0', () => {
  let s = run(pkg(2), sys('booking'), { type: 'setCustom', value: 1 }, { type: 'go', step: 3 });
  assert.equal(s.step, 3);
  s = reducer(s, pkg(2));
  assert.deepEqual(totals(s), [0, 0]);
  assert.equal(s.step, 1);
  assert.equal(toQuery(s.selection, s.step), '');
  assert.equal(buildReceipt(s.selection).all.length, 0);
});

test('Skift af pakke bevarer systemer; engelsk nulstilles, når Max har den med', () => {
  let s = run(pkg(1), sys('booking'), { type: 'toggleEnglish' });
  assert.equal(s.selection.english, true);
  s = reducer(s, pkg(2));
  assert.equal(s.selection.english, false);
  assert.deepEqual(s.selection.systems, ['booking']);
});

test('Uden pakke findes kun trin 1', () => {
  assert.equal(run({ type: 'go', step: 3 }).step, 1);
  assert.equal(run({ type: 'next' }).step, 1);
  assert.equal(run(pkg(0), { type: 'next' }).step, 2);
});

// Kun når der er intro-pladser tilbage i prices.json (ved 0 findes introprisen ikke; det dækker de øvrige tests).
test('Intro slås til og fra (så længe der er pladser)', { skip: !introActive() }, () => {
  let s = run(pkg(1), { type: 'toggleIntro' });
  assert.equal(s.selection.intro, true);
  assert.deepEqual(totals(s), [6650, 549]);
  s = reducer(s, { type: 'toggleIntro' });
  assert.deepEqual(totals(s), [9500, 549]);
});

test('Guidet hjælp lægger forslaget i beregneren', () => {
  let s = run({ type: 'helpStart' }, { type: 'helpAnswer', i: 1 }, { type: 'helpAnswer', i: 0 }, { type: 'helpNextQ' }, { type: 'helpAnswer', i: 0 });
  assert.equal(s.help.q, 3);
  assert.equal(s.selection.pkg, 1);
  assert.deepEqual(s.selection.systems, ['booking']);
  assert.equal(s.selection.intro, false);
  s = reducer(s, { type: 'helpToSummary' });
  assert.equal(s.step, 4);
  assert.equal(s.help, null);
});

test('Gammelt link viser en besked og vælger intet', () => {
  const s = reducer(initialState, { type: 'oldLink' });
  assert.ok(s.notice.length > 10);
  assert.equal(s.selection.pkg, null);
});
