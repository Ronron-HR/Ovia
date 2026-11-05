// Kvitteringen: gør resultatet af calculate() til de linjer, der vises, og bygger mail, SMS og id.
// Rene funktioner uden DOM, så de kan testes med `node --test`.
import prices from '../data/prices.json' with { type: 'json' };
import { calculate, formatKr } from './calculate.js';

const NBSP = ' ';
const ONCE_ORDER = ['web', 'bookingAddon', 'extraPages', 'ownHosting', 'book'];
const MONTH_ORDER = ['mkt', 'drift'];

/** Kort form til bundbaren, fx "Hjemmeside Vækst", "+ Booking". */
const short = (l) =>
  ({
    web: `Hjemmeside ${l.package}`,
    bookingAddon: '+ Booking',
    extraPages: `+${l.amount / prices.addons.extraPage.price} sider`,
    ownHosting: 'Egen hosting',
    book: `Booking ${l.package}`,
    mkt: `Marketing ${l.package}`,
    drift: `Drift ${l.package}`,
  })[l.key] ?? l.label;

/**
 * Alt, kvitteringen skal vise. once/month er linjerne i designets rækkefølge
 * (Marketing før Drift); o/m er totalerne.
 */
export function buildReceipt(selection) {
  const r = calculate(selection);
  const order = (list, keys) => keys.flatMap((k) => list.filter((l) => l.key === k));
  const line = (l) => ({
    key: l.key,
    label: l.label,
    pkg: l.package.split(' kr.').join(NBSP + 'kr.').replace(' × ', NBSP + '×' + NBSP),
    amount: l.amount,
    monthly: l.period === 'month',
    price: formatKr(l.amount, l.period === 'month'),
    short: short(l),
  });
  const once = order(r.lines.filter((l) => l.period === 'once'), ONCE_ORDER).map(line);
  const month = order(r.lines.filter((l) => l.period === 'month'), MONTH_ORDER).map(line);
  return { once, month, all: [...once, ...month], o: r.once, m: r.monthly, bookingIncluded: r.bookingIncluded };
}

/** Henvendelses-id i emnet, fx OVIA-121-P (ydelsernes pakkenummer, 0 = ikke valgt, og driftens bogstav). */
export function specId(selection) {
  const s = selection.services;
  const digits = ['web', 'mkt', 'book'].map((k) => (s[k] === null ? '0' : s[k] + 1)).join('');
  return 'OVIA-' + digits + (s.web !== null ? '-' + selection.drift[0].toUpperCase() : '');
}

const plain = (s) => String(s).split(NBSP).join(' ');

/** mailto: med hele kvitteringen og del-linket. Ingen navn eller mail kræves. */
export function mailtoHref(selection, url, to = 'kontakt@oviaspecs.com') {
  const rc = buildReceipt(selection);
  const id = specId(selection);
  const body = [`Spec-ark ${id}`, '']
    .concat(rc.all.map((l) => plain(`${l.label} – ${l.pkg}: ${l.price}`)))
    .concat(['', plain(`Engang i alt: ${formatKr(rc.o)}`), plain(`Pr. måned: ${formatKr(rc.m, true)}`), 'Alle priser er ekskl. moms', '', `Se valgene: ${url}`])
    .join('\n');
  return `mailto:${to}?subject=${encodeURIComponent('Forespørgsel ' + id)}&body=${encodeURIComponent(body)}`;
}

/** sms: med del-linket. */
export function smsHref(url, phone = '+4553613699') {
  return `sms:${phone}?body=${encodeURIComponent('Hej Ronny. Mine valg: ' + url)}`;
}
