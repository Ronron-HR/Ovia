// Kør: node --test tests/   (Node >= 20.10)
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, guidedHelp, toQuery, fromQuery } from './calculate.js';

const sel = (services, extra = {}) => ({ services: { web: null, mkt: null, book: null, ...services }, drift: 'basis', bookingAddon: false, extraPages: 0, ...extra });

test('1. Hjemmeside Vækst + drift Plus + booking-tilvalg = 9.000 kr. + 398 kr./md.', () => {
  const r = calculate(sel({ web: 1 }, { drift: 'plus', bookingAddon: true }));
  assert.equal(r.once, 9000); assert.equal(r.monthly, 398);
});
test('2. Hjemmeside Fuld fart + 2 ekstra undersider + drift Ekstra = 11.600 kr. + 798 kr./md.', () => {
  const r = calculate(sel({ web: 2 }, { drift: 'ekstra', extraPages: 2 }));
  assert.equal(r.once, 11600); assert.equal(r.monthly, 798);
});
test('3. Hjemmeside Start + egen konto/hosting = 7.000 kr. + 0 kr./md.', () => {
  const r = calculate(sel({ web: 0 }, { drift: 'egen' }));
  assert.equal(r.once, 7000); assert.equal(r.monthly, 0);
});
test('4. Hjemmeside Vækst + Booking & Google Vækst: booking indgår, 10.000 kr. engang', () => {
  const r = calculate(sel({ web: 1, book: 1 }, { bookingAddon: true }));
  assert.equal(r.bookingIncluded, true);
  assert.equal(r.lines.some(l => l.key === 'bookingAddon'), false);
  assert.equal(r.once, 10000);
});
test('5. Marketing Vækst + Booking & Google Fuld fart = 3.000 kr. + 5.000 kr./md.', () => {
  const r = calculate(sel({ mkt: 1, book: 2 }));
  assert.equal(r.once, 3000); assert.equal(r.monthly, 5000);
});
test('6. Guidet hjælp: Q1 A, Q2 A+C, Q3 B = Hjemmeside Vækst + Booking & Google Vækst + drift Plus', () => {
  const s = guidedHelp({ q1: 'A', q2: ['A', 'C'], q3: 'B' });
  assert.deepEqual(s.services, { web: 1, mkt: null, book: 1 });
  assert.equal(s.drift, 'plus');
  const r = calculate(s);
  assert.equal(r.once, 10000); assert.equal(r.monthly, 398);
});

// Ekstra: regler og kanttilfælde
test('Ekstra undersider tælles kun med Fuld fart', () => {
  assert.equal(calculate(sel({ web: 1 }, { extraPages: 3 })).once, 8000);
});
test('R3: Q1 C giver ingen hjemmeside og ingen drift', () => {
  const r = calculate(guidedHelp({ q1: 'C', q2: ['B'], q3: 'C' }));
  assert.equal(r.once, 0); assert.equal(r.monthly, 8000);
});
test('R7: Q2 C uden hjemmeside = Booking & Google Start / Fuld fart ved Q3 C', () => {
  assert.equal(guidedHelp({ q1: 'C', q2: ['C'], q3: 'A' }).services.book, 0);
  assert.equal(guidedHelp({ q1: 'C', q2: ['C'], q3: 'C' }).services.book, 2);
});
test('R7: Q2 A vinder over C, så der kun er én Booking & Google-pakke (min. Vækst)', () => {
  const s = guidedHelp({ q1: 'C', q2: ['A', 'C'], q3: 'A' });
  assert.equal(s.services.book, 1);
});
test('R6: Q2 C med hjemmeside løfter Hjemmeside til min. Vækst', () => {
  assert.equal(guidedHelp({ q1: 'B', q2: ['C'], q3: 'A' }).services.web, 1);
});
test('Del-link: valg overlever en tur gennem URL', () => {
  const s = sel({ web: 2, mkt: 0, book: 1 }, { drift: 'ekstra', bookingAddon: true, extraPages: 2 });
  const back = fromQuery(toQuery(s, 4));
  assert.deepEqual(back.selection, s); assert.equal(back.step, 4);
  assert.equal(calculate(back.selection).once, calculate(s).once);
});
