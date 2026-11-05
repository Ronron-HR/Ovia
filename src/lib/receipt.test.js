import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReceipt, mailtoHref, smsHref, specId } from './receipt.js';

const sel = (services, extra = {}) => ({ services: { web: null, mkt: null, book: null, ...services }, drift: 'basis', bookingAddon: false, extraPages: 0, ...extra });

test('Kvitteringen følger designets rækkefølge: Marketing før Drift', () => {
  const r = buildReceipt(sel({ web: 1, mkt: 1 }));
  assert.deepEqual(r.month.map((l) => l.key), ['mkt', 'drift']);
  assert.equal(r.o, 8000); assert.equal(r.m, 5198);
});
test('Kort form til bundbaren', () => {
  const r = buildReceipt(sel({ web: 2, book: 0 }, { bookingAddon: true, extraPages: 2, drift: 'egen' }));
  assert.deepEqual(r.once.map((l) => l.short), ['Hjemmeside Fuld fart', '+ Booking', '+2 sider', 'Egen hosting', 'Booking Start']);
});
test('Priser har hårdt mellemrum', () => {
  assert.equal(buildReceipt(sel({ web: 1 })).once[0].price, '8.000 kr.');
});
test('Id og mail', () => {
  const s = sel({ web: 1, mkt: 1, book: 0 }, { drift: 'plus' });
  assert.equal(specId(s), 'OVIA-221-P');
  const href = mailtoHref(s, 'https://oviaspecs.com/?w=1');
  assert.ok(href.startsWith('mailto:kontakt@oviaspecs.com?subject=Foresp%C3%B8rgsel%20OVIA-221-P'));
  assert.ok(decodeURIComponent(href).includes('Alle priser er ekskl. moms'));
  assert.ok(smsHref('https://x/y').startsWith('sms:+4553613699?body='));
});
