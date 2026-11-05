// Kvitteringen: gør resultatet af calculate() til de linjer, der vises, og bygger mail, SMS og id.
// Rene funktioner uden DOM, så de kan testes med `node --test`.
import prices from '../data/prices.json' with { type: 'json' };
import { NBSP, calculate, clean, formatKr, formatSigned, toQuery } from './calculate.js';

/** Prisen på en linje som tekst: "Indgår", "−2.850 kr.", "2.000 kr. + 99 kr./md." eller "9.500 kr. + 549 kr./md.". */
export function priceText(line) {
  if (line.included) return 'Indgår';
  if (line.once < 0) return formatSigned(line.once);
  const parts = [];
  if (line.once) parts.push(formatKr(line.once));
  if (line.monthly) parts.push(formatKr(line.monthly, true));
  return parts.join(' + ') || formatKr(0);
}

/** Kort form til bundbaren, fx "Anbefalet", "Gavekort", "Intro −30 %". */
const short = (l) => (l.key === 'intro' ? `Intro${NBSP}−30${NBSP}%` : l.key === 'package' ? l.package : l.key.startsWith('custom-') ? 'Skræddersyet' : l.key === 'english' ? 'Engelsk' : l.label);

/**
 * Alt, kvitteringen skal vise. `all` er linjerne i rækkefølge; o/m er totalerne (engang efter intropris, pr. måned);
 * onceNormal er engangsprisen uden intro (vises overstreget, når intro er valgt).
 */
export function buildReceipt(selection, cfg = prices) {
  const r = calculate(selection, cfg);
  const all = r.lines.map((l) => ({
    key: l.key,
    label: l.label,
    pkg: l.package,
    once: l.once,
    monthly: l.monthly,
    included: l.included,
    price: priceText(l),
    short: short(l),
  }));
  return { all, o: r.once, m: r.monthly, onceNormal: r.onceNormal, introSaving: r.introSaving, introApplied: r.introApplied, selection: r.selection };
}

/** Henvendelses-id i emnet, fx OVIA-2bg-C1-E-I (pakke 1–3, systemkoder, C = skræddersyede, E = engelsk, I = intro). */
export function specId(selection, cfg = prices) {
  const sel = clean(selection, cfg);
  if (sel.pkg === null) return 'OVIA-0';
  const codes = sel.systems.map((k) => cfg.systems.standard.find((s) => s.key === k).code).join('');
  return `OVIA-${sel.pkg + 1}${codes}${sel.custom ? '-C' + sel.custom : ''}${sel.english ? '-E' : ''}${sel.intro ? '-I' : ''}`;
}

const plain = (s) => String(s).split(NBSP).join(' ');

/** mailto: med hele kvitteringen og del-linket (bruges som reserve, hvis formularen ikke kan sende). */
export function mailtoHref(selection, url, to = 'kontakt@oviaspecs.com', cfg = prices) {
  const rc = buildReceipt(selection, cfg);
  const id = specId(selection, cfg);
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

export { toQuery };
