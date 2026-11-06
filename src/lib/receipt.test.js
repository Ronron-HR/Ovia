// Kør: node --test src/lib/receipt.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import prices from '../data/prices.json' with { type: 'json' };
import { NBSP, emptySelection } from './calculate.js';
import { buildReceipt, mailtoHref, pathText, priceText, smsHref, specId } from './receipt.js';

const S = (path, extra = {}) => ({ ...emptySelection(), path, ...extra });
const withSlots = (n) => ({ ...prices, introSlotsLeft: n });
const plain = (s) => s.split(NBSP).join(' ');

test('Id: vej, pakke, funktioner, bygget specielt til jer og intro', () => {
  assert.equal(specId(emptySelection()), 'OVIA-0');
  assert.equal(specId(S('site')), 'OVIA-0');
  assert.equal(specId(S('site', { pkg: 1 })), 'OVIA-H2');
  assert.equal(specId(S('site', { pkg: 0, intro: true }), withSlots(3)), 'OVIA-H1-I');
  assert.equal(specId(S('both', { pkg: 1, systems: ['booking', 'gavekort'], custom: 1, intro: true }), withSlots(3)), 'OVIA-B2bg-C1-I');
  assert.equal(specId(S('both', { pkg: 1, intro: true }), withSlots(0)), 'OVIA-B2');
  assert.equal(specId(S('system', { systems: ['booking', 'gavekort'], custom: 1 })), 'OVIA-Sbg-C1');
  // Valg fra en anden vej kommer ikke med i id'et.
  assert.equal(specId(S('system', { pkg: 2, systems: ['booking'], intro: true }), withSlots(3)), 'OVIA-Sb');
  assert.equal(specId(S('site', { pkg: 2, systems: ['booking'], custom: 2 })), 'OVIA-H3');
});
test('priceText: Indgår, minus, engang + måned', () => {
  assert.equal(priceText({ included: true, once: 0, monthly: 0 }), 'Indgår');
  assert.equal(plain(priceText({ once: -2850, monthly: 0 })), '−2.850 kr.');
  assert.equal(plain(priceText({ once: 2000, monthly: 99 })), '2.000 kr. + 99 kr./md.');
  assert.equal(plain(priceText({ once: 1500, monthly: 0 })), '1.500 kr.');
});
test('Kvittering: totaler, normalpris og intro-linje', () => {
  const rc = buildReceipt(S('both', { pkg: 1, systems: ['booking'], intro: true }), withSlots(3));
  assert.equal(rc.o, 6650);
  assert.equal(rc.m, 549);
  assert.equal(rc.onceNormal, 9500);
  assert.equal(rc.introApplied, true);
  assert.deepEqual(rc.all.map((l) => l.key), ['package', 'intro', 'sys-booking']);
  assert.equal(rc.all[2].price, 'Indgår');
  assert.equal(rc.path, 'both');
});
test('Kvittering: system alene har kun funktioner, med deres egne priser', () => {
  const rc = buildReceipt(S('system', { systems: ['booking'], custom: 1 }));
  assert.deepEqual(rc.all.map((l) => l.key), ['sys-booking', 'custom-1']);
  assert.equal(plain(rc.all[0].price), '2.500 kr. + 149 kr./md.');
  assert.equal(plain(rc.all[1].price), '5.000 kr. + 199 kr./md.');
  assert.deepEqual([rc.o, rc.m], [7500, 348]);
  assert.equal(rc.all.some((l) => l.key === 'package'), false);
});
test('Kvittering uden intro ved 0 pladser: ingen spor', () => {
  const rc = buildReceipt(S('site', { pkg: 1, intro: true }), withSlots(0));
  assert.equal(rc.introApplied, false);
  assert.equal(rc.onceNormal, rc.o);
  assert.equal(JSON.stringify(rc.all).toLowerCase().includes('intro'), false);
});
test('pathText: hvad kunden har brug for, i mailens ord', () => {
  assert.equal(pathText('site'), 'Kun en hjemmeside');
  assert.equal(pathText('system'), 'Kun et system til deres nuværende hjemmeside');
  assert.equal(pathText('both'), 'Hjemmeside og system (begge dele)');
  assert.equal(pathText(null), '');
});
test('Mail- og SMS-link bærer id, vej og del-link', () => {
  const href = mailtoHref(S('site', { pkg: 1 }), 'https://oviaspecs.com/?v=h&p=1');
  assert.match(href, /^mailto:kontakt@oviaspecs\.com\?subject=/);
  assert.match(decodeURIComponent(href), /OVIA-H2/);
  assert.match(decodeURIComponent(href), /Hvad I har brug for: Kun en hjemmeside/);
  assert.match(decodeURIComponent(href), /Alle priser er ekskl\. moms/);
  assert.match(decodeURIComponent(smsHref('https://oviaspecs.com/?v=h&p=1')), /https:\/\/oviaspecs\.com\/\?v=h&p=1/);
});
