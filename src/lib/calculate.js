// Rene funktioner. Ingen DOM, ingen state. Samme logik som Prisberegner.dc.html.
import prices from '../data/prices.json' with { type: 'json' };

const NBSP = '\u00a0';
const PKG = ['start', 'vaekst', 'fuldfart'];
export const DRIFT_KEYS = ['basis', 'plus', 'ekstra', 'egen'];

/** 8000 -> "8.000 kr."  (hårdt mellemrum). monthly=true -> "398 kr./md." */
export function formatKr(n, monthly = false) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + NBSP + 'kr.' + (monthly ? '/md.' : '');
}

/**
 * selection = {
 *   services: { web: 0|1|2|null, mkt: 0|1|2|null, book: 0|1|2|null },  // index i PKG, null = ikke valgt
 *   drift: 'basis'|'plus'|'ekstra'|'egen',   // kun relevant når web er valgt
 *   bookingAddon: boolean,                    // kun relevant når web er valgt
 *   extraPages: number                        // kun relevant når web === 2 (Fuld fart)
 * }
 * Returnerer { once, monthly, lines, bookingIncluded }
 */
export function calculate(selection) {
  const { services = {}, drift = 'basis', bookingAddon = false } = selection;
  const web = services.web ?? null, mkt = services.mkt ?? null, book = services.book ?? null;
  const lines = [];
  let once = 0, monthly = 0;
  const add = (key, label, pkg, amount, period) => {
    lines.push({ key, label, package: pkg, amount, period });
    if (period === 'month') monthly += amount; else once += amount;
  };

  const bookPkg = book !== null ? prices.services.book.packages[book] : null;
  const bookingIncluded = !!(bookPkg && bookPkg.includesBooking);

  if (web !== null) {
    const p = prices.services.web.packages[web];
    add('web', 'Hjemmeside', p.name, p.price, 'once');
    // "Indgår"-reglen: Booking & Google Vækst/Fuld fart indeholder booking, så tilvalget kan ikke tilkøbes to gange.
    if (bookingAddon && !bookingIncluded) add('bookingAddon', prices.addons.booking.name, 'Tilvalg', prices.addons.booking.price, 'once');
    // Ekstra undersider kun med Fuld fart.
    const extra = web === 2 ? Math.max(0, Math.floor(selection.extraPages || 0)) : 0;
    if (extra > 0) add('extraPages', 'Ekstra undersider', extra + ' × 800 kr.', extra * prices.addons.extraPage.price, 'once');
    // Egen hosting erstatter driftsplanen (månedspris 0).
    if (drift === 'egen') add('ownHosting', prices.addons.ownHosting.name, 'I stedet for drift', prices.addons.ownHosting.price, 'once');
    else {
      const d = prices.drift.plans.find(x => x.key === drift) || prices.drift.plans[0];
      add('drift', 'Drift', d.name, d.price, 'month');
    }
  }
  if (book !== null) add('book', 'Booking & Google', bookPkg.name, bookPkg.price, 'once');
  if (mkt !== null) { const p = prices.services.mkt.packages[mkt]; add('mkt', 'Marketing', p.name, p.price, 'month'); }

  return { once, monthly, lines, bookingIncluded };
}

/**
 * Guidet hjælp. answers = { q1: 'A'|'B'|'C', q2: ['A','B','C' (flervalg)], q3: 'A'|'B'|'C' }
 * Returnerer en selection, klar til calculate().
 *
 * R1 Q3 A/B/C = niveau 0/1/2 (Start/Vækst/Fuld fart)
 * R2 Q1 A eller B = Hjemmeside på niveauet
 * R3 Q1 C = ingen Hjemmeside
 * R4 Q2 A = Booking & Google på niveauet, min. Vækst
 * R5 Q2 B = Marketing på niveauet
 * R6 Q2 C med Hjemmeside = Hjemmeside min. Vækst
 * R7 Q2 C uden Hjemmeside = Booking & Google Start (Fuld fart ved Q3 C), men R4 vinder hvis Q2 A også er valgt
 * R8 Med Hjemmeside følger drift niveauet: Basis/Plus/Ekstra. Ingen tilvalg foreslås.
 */
export function guidedHelp(answers) {
  const lvl = { A: 0, B: 1, C: 2 }[answers.q3];
  const q2 = answers.q2 || [];
  const services = { web: null, mkt: null, book: null };
  if (answers.q1 !== 'C') services.web = q2.includes('C') ? Math.max(lvl, 1) : lvl;       // R2, R3, R6
  if (q2.includes('A')) services.book = Math.max(lvl, 1);                                   // R4
  if (q2.includes('B')) services.mkt = lvl;                                                 // R5
  if (q2.includes('C') && services.web === null && services.book === null) services.book = lvl === 2 ? 2 : 0; // R7
  return { services, drift: ['basis', 'plus', 'ekstra'][lvl], bookingAddon: false, extraPages: 0 }; // R8
}

/** URL-format (matcher prototypen): ?w=1&m=0&b=2&d=p&bk=1&x=2&s=4  d: b|p|e|h */
const D_CODE = { basis: 'b', plus: 'p', ekstra: 'e', egen: 'h' };
export function toQuery(sel, step = 1) {
  const q = new URLSearchParams(), s = sel.services;
  if (s.web !== null) { q.set('w', s.web); q.set('d', D_CODE[sel.drift]); if (sel.bookingAddon) q.set('bk', '1'); if (s.web === 2 && sel.extraPages) q.set('x', sel.extraPages); }
  if (s.mkt !== null) q.set('m', s.mkt);
  if (s.book !== null) q.set('b', s.book);
  if (step > 1) q.set('s', step);
  return q.toString();
}
export function fromQuery(str) {
  const q = new URLSearchParams(str), iv = k => (q.has(k) ? Math.max(0, Math.min(2, parseInt(q.get(k), 10) || 0)) : null);
  const inv = { b: 'basis', p: 'plus', e: 'ekstra', h: 'egen' };
  return { selection: { services: { web: iv('w'), mkt: iv('m'), book: iv('b') }, drift: inv[q.get('d')] || 'basis', bookingAddon: q.get('bk') === '1', extraPages: parseInt(q.get('x'), 10) || 0 }, step: Math.max(1, Math.min(4, parseInt(q.get('s'), 10) || 1)) };
}
