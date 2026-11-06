// Beregnerens tilstand: vej, valg, trin, skift af vej midt i, fjernelse (totaler, del-link og trin) og guidet hjælp.
// Kør: node --test src/components/calculator/useCalculator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { introActive, stepsFor, toQuery } from '../../lib/calculate.js';
import { buildReceipt } from '../../lib/receipt.js';
import { initialState, reducer } from './useCalculator.js';

const run = (...actions) => actions.reduce((s, a) => reducer(s, a), initialState);
const totals = (s) => {
  const r = buildReceipt(s.selection);
  return [r.o, r.m];
};
const path = (p) => ({ type: 'setPath', path: p });
const pkg = (n) => ({ type: 'togglePkg', pkg: n });
const sys = (key) => ({ type: 'toggleSystem', key });
const custom = (value) => ({ type: 'setCustom', value });
const go = (step) => ({ type: 'go', step });
const next = { type: 'next' };

test('Begge dele: Anbefalet, to funktioner, fjern den ene: totaler og del-link følger med', () => {
  let s = run(path('both'), pkg(1), sys('booking'), sys('gavekort'));
  assert.deepEqual(totals(s), [11500, 648]);
  s = reducer(s, sys('gavekort'));
  assert.deepEqual(totals(s), [9500, 549]);
  assert.equal(toQuery(s.selection, 'sys'), 'v=b&p=1&y=b&t=sys');
});

test('Tryk på den valgte pakke igen fjerner pakken: 0/0, vejen bliver stående, og trinnet går tilbage til Pakke', () => {
  let s = run(path('both'), pkg(2), sys('booking'), custom(1), go('sum'));
  assert.equal(s.step, 'sum');
  s = reducer(s, pkg(2));
  assert.deepEqual(totals(s), [0, 0]);
  assert.equal(s.step, 'pkg');
  assert.equal(s.selection.path, 'both');
  assert.equal(buildReceipt(s.selection).all.length, 0);
});

test('Uden vej findes kun første trin; vejen låser de rigtige trin op', () => {
  assert.equal(run(go('sum')).step, 'need');
  assert.equal(run(next).step, 'need');
  assert.equal(run(path('site'), next).step, 'pkg');
  // Uden pakke kommer man ikke videre.
  assert.equal(run(path('site'), next, next).step, 'pkg');
  const steps = stepsFor('site');
  assert.equal(run(path('site'), next, pkg(0), next).step, steps[2]);
  assert.equal(run(path('site'), next, pkg(0), go('sum')).step, 'sum');
});

test('Hjemmeside: Pakke → Rabat → Samlet pris (rabat kun mens der er intro-pladser), og ingen funktioner', () => {
  const s = run(path('site'), next, pkg(1));
  assert.deepEqual(stepsFor('site'), introActive() ? ['need', 'pkg', 'disc', 'sum'] : ['need', 'pkg', 'sum']);
  assert.equal(run(path('site'), next, pkg(1), go('sys')).step, 'pkg');
  assert.deepEqual(totals(s), [9500, 549]);
});

test('System alene: Funktioner → Samlet pris, uden pakke og uden rabat; mindst én funktion for at komme videre', () => {
  assert.equal(run(path('system'), next).step, 'sys');
  assert.equal(run(path('system'), next, next).step, 'sys');
  assert.equal(run(path('system'), next, go('sum')).step, 'sys');
  let s = run(path('system'), next, sys('booking'));
  assert.deepEqual(totals(s), [2500, 149]);
  s = reducer(s, next);
  assert.equal(s.step, 'sum');
  assert.equal(toQuery(s.selection, s.step), 'v=s&y=b&t=sum');
  // Kun bygget specielt til jer tæller også som valgt.
  assert.equal(run(path('system'), next, custom(1), next).step, 'sum');
  assert.deepEqual(totals(run(path('system'), next, custom(2))), [10000, 398]);
  // Fjernes det sidste, kan man ikke længere gå videre, og trinnet er Funktioner.
  s = run(path('system'), next, sys('booking'), next, { type: 'back' }, sys('booking'));
  assert.equal(s.step, 'sys');
  assert.equal(reducer(s, next).step, 'sys');
});

test('Skift af vej midt i: pris og valg er rigtige på hver vej, og intet mistes ved et skifte frem og tilbage', () => {
  let s = run(path('both'), pkg(1), sys('booking'), sys('gavekort'), custom(1), go('sum'));
  assert.deepEqual(totals(s), [16500, 847]);
  // Tilbage til første trin og skift til System alene: pakken er væk, funktionerne beholder deres nye pris.
  s = reducer(s, go('need'));
  assert.equal(s.step, 'need');
  s = reducer(s, path('system'));
  assert.deepEqual(totals(s), [10000, 497]);
  assert.equal(buildReceipt(s.selection).all.some((l) => l.key === 'package'), false);
  assert.equal(toQuery(s.selection, 'sys'), 'v=s&y=bg&c=1&t=sys');
  // Til Hjemmeside alene: kun pakken.
  s = reducer(s, path('site'));
  assert.deepEqual(totals(s), [9500, 549]);
  assert.equal(toQuery(s.selection, 'pkg'), 'v=h&p=1&t=pkg');
  // Tilbage til Begge: valgene er der stadig.
  s = reducer(s, path('both'));
  assert.deepEqual(totals(s), [16500, 847]);
  assert.deepEqual(s.selection.systems, ['booking', 'gavekort']);
  assert.equal(s.selection.custom, 1);
  // Næste fra første trin går til det første trin på den nye vej.
  assert.equal(reducer(run(path('system')), next).step, 'sys');
  assert.equal(reducer(run(path('both')), next).step, 'pkg');
});

test('Skift af vej fra et senere trin: trinnet bliver til nærmeste gyldige', () => {
  // På Funktioner (Begge) kan man ikke skifte til Hjemmeside alene uden at gå via første trin; kommer man dertil via adresselinjen, rettes trinnet.
  let s = run(path('both'), pkg(1), go('sys'));
  assert.equal(s.step, 'sys');
  s = reducer(s, path('site'));
  assert.equal(s.step, 'pkg');
  s = run(path('both'), pkg(1), go('sys'), path('system'));
  assert.equal(s.step, 'sys');
});

// Kun når der er intro-pladser tilbage i prices.json (ved 0 findes introprisen ikke; det dækker de øvrige tests).
test('Intro slås til og fra (så længe der er pladser), og tæller kun for hjemmeside og begge', { skip: !introActive() }, () => {
  let s = run(path('site'), pkg(1), { type: 'toggleIntro' });
  assert.equal(s.selection.intro, true);
  assert.deepEqual(totals(s), [6650, 549]);
  s = reducer(s, { type: 'toggleIntro' });
  assert.deepEqual(totals(s), [9500, 549]);
  s = run(path('both'), pkg(1), sys('booking'), sys('gavekort'), { type: 'toggleIntro' });
  assert.deepEqual(totals(s), [8650, 648]);
  s = reducer(s, path('system'));
  assert.deepEqual(totals(s), [5000, 298]);
  assert.equal(toQuery(s.selection, 'sys'), 'v=s&y=bg&t=sys');
});

test('Guidet hjælp lægger forslaget i beregneren (vej, pakke og funktioner)', () => {
  let s = run(path('site'), next, { type: 'helpStart' }, { type: 'helpAnswer', i: 1 }, { type: 'helpAnswer', i: 0 }, { type: 'helpNextQ' }, { type: 'helpAnswer', i: 0 });
  assert.equal(s.help.q, 3);
  assert.equal(s.selection.path, 'both');
  assert.equal(s.selection.pkg, 1);
  assert.deepEqual(s.selection.systems, ['booking']);
  assert.equal(s.selection.intro, false);
  s = reducer(s, { type: 'helpToSummary' });
  assert.equal(s.step, 'sum');
  assert.equal(s.help, null);
  // Med funktioner valgt bliver vejen Begge dele; "Tilpas selv" går til Funktioner.
  s = run(path('site'), next, { type: 'helpStart' }, { type: 'helpAnswer', i: 0 }, { type: 'helpAnswer', i: 0 }, { type: 'helpNextQ' }, { type: 'helpAnswer', i: 0 });
  assert.equal(s.selection.path, 'both');
  s = run(path('both'), next, { type: 'helpStart' }, { type: 'helpAnswer', i: 0 }, { type: 'helpAnswer', i: 4 }, { type: 'helpNextQ' }, { type: 'helpAnswer', i: 0 }, { type: 'helpCustomize' });
  assert.equal(s.step, 'sys');
});

test('Tilbage-knappen: ét trin ad gangen, aldrig forbi første trin', () => {
  let s = run(path('both'), next, pkg(1), next);
  assert.equal(s.step, 'sys');
  s = reducer(s, { type: 'back' });
  assert.equal(s.step, 'pkg');
  s = reducer(s, { type: 'back' });
  assert.equal(s.step, 'need');
  assert.equal(reducer(s, { type: 'back' }).step, 'need');
});

test('Gammelt link viser en besked og vælger intet', () => {
  const s = reducer(initialState, { type: 'oldLink' });
  assert.ok(s.notice.length > 10);
  assert.equal(s.selection.path, null);
});
