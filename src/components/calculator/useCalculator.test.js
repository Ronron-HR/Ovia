// Beregnerens tilstand: tilføjelse og især FJERNELSE (totaler, del-link og trin). Kør: node --test src/components/calculator/useCalculator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { toQuery } from '../../lib/calculate.js';
import { buildReceipt } from '../../lib/receipt.js';
import { initialState, reducer } from './useCalculator.js';

const run = (...actions) => actions.reduce((s, a) => reducer(s, a), initialState);
const totals = (s) => {
  const r = buildReceipt(s.selection);
  return [r.o, r.m];
};
const toggle = (key) => ({ type: 'toggleService', key });

test('Tilføj Hjemmeside + Marketing, fjern Marketing: totaler og del-link følger med', () => {
  let s = run(toggle('web'), toggle('mkt'));
  assert.deepEqual(totals(s), [8000, 5198]);
  s = reducer(s, toggle('mkt'));
  assert.deepEqual(totals(s), [8000, 198]);
  assert.equal(s.selection.services.mkt, null);
  assert.equal(toQuery(s.selection, s.step), 'w=1&d=b');
});

test('Fjern alt: tom tilstand, trin 1, tomt del-link og 0/0', () => {
  let s = run(toggle('web'), toggle('book'), { type: 'go', step: 2 });
  s = reducer(s, toggle('web'));
  s = reducer(s, toggle('book'));
  assert.deepEqual(totals(s), [0, 0]);
  assert.equal(s.step, 1);
  assert.equal(toQuery(s.selection, s.step), '');
  assert.equal(buildReceipt(s.selection).all.length, 0);
});

test('Fjernes Hjemmeside på trin 3, falder trinnet til 2, og alt der hører til den nulstilles', () => {
  let s = run(toggle('web'), toggle('mkt'), { type: 'setService', key: 'web', value: 2 }, { type: 'setDrift', drift: 'ekstra' }, { type: 'toggleBooking' }, { type: 'setExtra', value: 3 }, { type: 'go', step: 3 });
  assert.equal(s.step, 3);
  s = reducer(s, toggle('web'));
  assert.equal(s.step, 2, 'trin 3 findes ikke uden Hjemmeside');
  assert.equal(s.selection.drift, 'basis');
  assert.equal(s.selection.bookingAddon, false);
  assert.equal(s.selection.extraPages, 0);
  assert.deepEqual(totals(s), [0, 5000]);
  // Vælges Hjemmeside igen, starter den forfra (Vækst, Basis, ingen tilvalg), ikke med de gamle valg.
  s = reducer(s, toggle('web'));
  assert.equal(s.selection.services.web, 1);
  assert.deepEqual(totals(s), [8000, 5198]);
  assert.equal(s.selection.bookingAddon, false);
});

test('En fjernet ydelses pakke nulstilles: Marketing Fuld fart fjernet og valgt igen er Vækst', () => {
  let s = run(toggle('mkt'), { type: 'setService', key: 'mkt', value: 2 });
  assert.deepEqual(totals(s), [0, 8000]);
  s = reducer(reducer(s, toggle('mkt')), toggle('mkt'));
  assert.equal(s.selection.services.mkt, 1);
  assert.deepEqual(totals(s), [0, 5000]);
});

test('Mobil: fjernes en ydelse, mens delskridtet peger på den sidste, holdes delskridtet inden for de valgte', () => {
  let s = run(toggle('web'), toggle('mkt'), toggle('book'), { type: 'go', step: 2 });
  s = reducer(reducer(s, { type: 'mNext' }), { type: 'mNext' });
  assert.equal(s.sub, 2);
  s = reducer(s, toggle('book'));
  assert.equal(s.step, 2);
  assert.equal(s.sub, 1, 'delskridtet klemmes til den sidste valgte ydelse');
  s = reducer(s, toggle('mkt'));
  assert.equal(s.sub, 0);
});

test('Booking-tilvalg og "Indgår": fjernes Booking & Google, kan tilvalget tælle igen', () => {
  let s = run(toggle('web'), toggle('book'), { type: 'toggleBooking' });
  assert.equal(s.selection.bookingAddon, false, 'tilvalget kan ikke slås til, når booking indgår');
  assert.deepEqual(totals(s), [10000, 198]);
  s = reducer(reducer(s, toggle('book')), { type: 'toggleBooking' });
  assert.deepEqual(totals(s), [9000, 198]);
});

test('Sænkes en pakke eller driftsplan, falder totalen, og del-linket følger', () => {
  let s = run(toggle('web'), { type: 'setService', key: 'web', value: 2 }, { type: 'setDrift', drift: 'ekstra' });
  assert.deepEqual(totals(s), [10000, 798]);
  s = reducer(reducer(s, { type: 'setService', key: 'web', value: 0 }), { type: 'setDrift', drift: 'basis' });
  assert.deepEqual(totals(s), [5000, 198]);
  assert.equal(toQuery(s.selection, s.step), 'w=0&d=b');
});

test('Ekstra sider nulstilles, når pakken sænkes fra Fuld fart', () => {
  let s = run(toggle('web'), { type: 'setService', key: 'web', value: 2 }, { type: 'setExtra', value: 2 });
  assert.deepEqual(totals(s), [11600, 198]);
  s = reducer(s, { type: 'setService', key: 'web', value: 1 });
  assert.equal(s.selection.extraPages, 0);
  assert.deepEqual(totals(s), [8000, 198]);
});
