// Kør: node --test src/lib/receipt.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import prices from '../data/prices.json' with { type: 'json' };
import { NBSP, emptySelection } from './calculate.js';
import { buildReceipt, mailtoHref, priceText, smsHref, specId } from './receipt.js';

const S = (pkg, extra = {}) => ({ ...emptySelection(), pkg, ...extra });
const withSlots = (n) => ({ ...prices, introSlotsLeft: n });
const plain = (s) => s.split(NBSP).join(' ');

test('Id: pakke, systemer, skræddersyede, engelsk og intro', () => {
  assert.equal(specId(emptySelection()), 'OVIA-0');
  assert.equal(specId(S(1)), 'OVIA-2');
  assert.equal(specId(S(1, { systems: ['booking', 'gavekort'], custom: 1, english: true, intro: true }), withSlots(3)), 'OVIA-2bg-C1-E-I');
  assert.equal(specId(S(1, { intro: true }), withSlots(0)), 'OVIA-2');
});
test('priceText: Indgår, minus, engang + måned', () => {
  assert.equal(priceText({ included: true, once: 0, monthly: 0 }), 'Indgår');
  assert.equal(plain(priceText({ once: -2850, monthly: 0 })), '−2.850 kr.');
  assert.equal(plain(priceText({ once: 2000, monthly: 99 })), '2.000 kr. + 99 kr./md.');
  assert.equal(plain(priceText({ once: 1500, monthly: 0 })), '1.500 kr.');
});
test('Kvittering: totaler, normalpris og intro-linje', () => {
  const rc = buildReceipt(S(1, { systems: ['booking'], intro: true }), withSlots(3));
  assert.equal(rc.o, 6650);
  assert.equal(rc.m, 549);
  assert.equal(rc.onceNormal, 9500);
  assert.equal(rc.introApplied, true);
  assert.deepEqual(rc.all.map((l) => l.key), ['package', 'intro', 'sys-booking']);
  assert.equal(rc.all[2].price, 'Indgår');
});
test('Kvittering uden intro ved 0 pladser: ingen spor', () => {
  const rc = buildReceipt(S(1, { intro: true }), withSlots(0));
  assert.equal(rc.introApplied, false);
  assert.equal(rc.onceNormal, rc.o);
  assert.equal(JSON.stringify(rc.all).toLowerCase().includes('intro'), false);
});
test('Mail- og SMS-link bærer id og del-link', () => {
  const href = mailtoHref(S(1), 'https://oviaspecs.com/?p=1');
  assert.match(href, /^mailto:kontakt@oviaspecs\.com\?subject=/);
  assert.match(decodeURIComponent(href), /OVIA-2/);
  assert.match(decodeURIComponent(href), /Alle priser er ekskl\. moms/);
  assert.match(decodeURIComponent(smsHref('https://oviaspecs.com/?p=1')), /https:\/\/oviaspecs\.com\/\?p=1/);
});
