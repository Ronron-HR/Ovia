// Rene funktioner. Ingen DOM, ingen state. Beregneren, /priser/, formularen og workeren bruger alle denne fil og src/data/prices.json.
// Prisen er fast: pakke + eventuelle tilvalg. Intet "fra", ingen interval.
import prices from '../data/prices.json' with { type: 'json' };

export const NBSP = ' ';
const MINUS = '−';

/** 8000 -> "8.000 kr." (hårdt mellemrum). monthly=true -> "398 kr./md." */
export function formatKr(n, monthly = false) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + NBSP + 'kr.' + (monthly ? '/md.' : '');
}

/** Beløb med fortegn: negative vises med rigtigt minus ("−2.850 kr."). */
export const formatSigned = (n, monthly = false) => (n < 0 ? MINUS + formatKr(-n, monthly) : formatKr(n, monthly));

export const emptySelection = () => ({ pkg: null, systems: [], custom: 0, english: false, intro: false });

/** Er introprisen i gang? Styres af ét felt: introSlotsLeft. Er det 0, findes introprisen ikke nogen steder. */
export const introActive = (cfg = prices) => Number(cfg.introSlotsLeft) > 0;

/**
 * selection = {
 *   pkg: 0|1|2|null,          // indeks i cfg.packages, null = intet valgt
 *   systems: ['booking', …],  // standardsystemer i den rækkefølge, de er valgt
 *   custom: 0..5,             // antal skræddersyede systemer (ét flow hver)
 *   english: boolean,         // engelsk version som tilvalg (Max har den med)
 *   intro: boolean,           // "Ja, I må vise siden som case" (kun mens der er intro-pladser)
 * }
 * clean() gør et vilkårligt input (fra adresselinjen eller fra browseren) til et gyldigt valg.
 */
export function clean(sel, cfg = prices) {
  const pkg = Number.isInteger(sel?.pkg) && cfg.packages[sel.pkg] ? sel.pkg : null;
  if (pkg === null) return emptySelection();
  const valid = new Set(cfg.systems.standard.map((s) => s.key));
  const systems = [...new Set((sel.systems ?? []).filter((k) => valid.has(k)))];
  const custom = Math.max(0, Math.min(cfg.systems.custom.max, Math.floor(Number(sel.custom) || 0)));
  return {
    pkg,
    systems,
    custom,
    english: cfg.packages[pkg].english === 'addon' ? Boolean(sel.english) : false,
    intro: introActive(cfg) ? Boolean(sel.intro) : false,
  };
}

/**
 * Regner pris og linjer ud. Inkluderede systemer koster ikke ekstra; er der valgt flere end pakken har plads til,
 * lægges tilvalgsprisen på (ekstra standardsystem: engang + pr. måned; skræddersyet: engang + pr. måned pr. flow).
 * Skræddersyede systemer bruger de inkluderede pladser først (det er billigst for kunden); standardsystemer fylder resten, i valgrækkefølge.
 * Intropris: rabat på pakkens ENGANGSPRIS (ikke på månedspris eller tilvalg).
 * Returnerer { once, monthly, onceNormal, introSaving, introApplied, lines, selection }.
 */
export function calculate(selection, cfg = prices) {
  const sel = clean(selection, cfg);
  const empty = { once: 0, monthly: 0, onceNormal: 0, introSaving: 0, introApplied: false, lines: [], selection: sel };
  if (sel.pkg === null) return empty;
  const pkg = cfg.packages[sel.pkg];
  const lines = [];
  const add = (key, label, detail, once, monthly, included = false) => lines.push({ key, label, package: detail, once, monthly, included });

  add('package', 'Pakke', pkg.name, pkg.once, pkg.monthly);
  const saving = sel.intro ? Math.round(pkg.once * cfg.intro.discount) : 0;
  if (saving) add('intro', 'Introduktionspris', `${Math.round(cfg.intro.discount * 100)}${NBSP}% på engangsprisen`, -saving, 0);

  const includedCustom = Math.min(sel.custom, pkg.customSlots, pkg.slots);
  const includedStandard = Math.min(sel.systems.length, pkg.slots - includedCustom);
  const a = cfg.addons;
  sel.systems.forEach((key, i) => {
    const sys = cfg.systems.standard.find((s) => s.key === key);
    const inc = i < includedStandard;
    add('sys-' + key, sys.name, inc ? 'Indgår' : 'Ekstra', inc ? 0 : a.extraStandard.once, inc ? 0 : a.extraStandard.monthly, inc);
  });
  for (let i = 0; i < sel.custom; i++) {
    const inc = i < includedCustom;
    add('custom-' + (i + 1), cfg.systems.custom.name, inc ? 'Indgår' : 'Ekstra', inc ? 0 : a.custom.once, inc ? 0 : a.custom.monthly, inc);
  }
  if (sel.english) add('english', a.english.name, 'Ekstra', a.english.once, 0);

  const sum = (k) => lines.reduce((n, l) => n + l[k], 0);
  const once = sum('once');
  return { once, monthly: sum('monthly'), onceNormal: once + saving, introSaving: saving, introApplied: saving > 0, lines, selection: sel };
}

/** Prisen (engang og pr. måned) for ét ekstra system af en given slags, hvis det lægges til det nuværende valg. */
export function nextSystemCost(selection, kind, cfg = prices) {
  const sel = clean(selection, cfg);
  if (sel.pkg === null) return null;
  const before = calculate(sel, cfg);
  const next =
    kind === 'custom'
      ? { ...sel, custom: Math.min(cfg.systems.custom.max, sel.custom + 1) }
      : { ...sel, systems: [...sel.systems, cfg.systems.standard.find((s) => !sel.systems.includes(s.key))?.key].filter(Boolean) };
  const after = calculate(next, cfg);
  return { once: after.once - before.once, monthly: after.monthly - before.monthly };
}

/**
 * Guidet hjælp. answers = { q1: 'A'|'B'|'C', q2: ['A'…'E'] (flervalg), q3: 'A'|'B'|'C' }
 *
 * q1 Hvor mange sider? A 1–3 → mindst Start · B op til 6 → mindst Anbefalet · C flere og engelsk → Max
 * q2 Hvad skal gæsterne kunne? Bogstav = standardsystem i listens rækkefølge (bordbooking, bestilling, gavekort, nyhedsbrev, anmeldelser)
 * q3 Skal noget bygges specielt? B = ét skræddersyet flow
 * Pakken er den billigste (engang + 12 måneder) blandt dem, der opfylder q1. Intet tilvalg foreslås, og intro slås ikke til.
 */
export function guidedHelp(answers, cfg = prices) {
  const min = { A: 0, B: 1, C: 2 }[answers.q1] ?? 0;
  const letters = 'ABCDE';
  const systems = (answers.q2 ?? []).map((l) => cfg.systems.standard[letters.indexOf(l)]?.key).filter(Boolean);
  const custom = answers.q3 === 'B' ? 1 : 0;
  let best = null;
  for (let p = min; p < cfg.packages.length; p++) {
    const sel = clean({ pkg: p, systems, custom }, cfg);
    const r = calculate(sel, cfg);
    const cost = r.once + 12 * r.monthly;
    if (!best || cost < best.cost) best = { cost, sel };
  }
  return best.sel;
}

/** Adresselinjen (del-link): ?p=1&y=bg&c=1&e=1&i=1&t=4  (p pakke, y systemer som koder, c skræddersyede, e engelsk, i intro, t trin) */
export function toQuery(sel, step = 1) {
  const q = new URLSearchParams();
  if (sel.pkg !== null && sel.pkg !== undefined) {
    q.set('p', sel.pkg);
    if (sel.systems?.length) q.set('y', sel.systems.map((k) => prices.systems.standard.find((s) => s.key === k)?.code ?? '').join(''));
    if (sel.custom) q.set('c', sel.custom);
    if (sel.english) q.set('e', '1');
    if (sel.intro) q.set('i', '1');
  }
  if (step > 1) q.set('t', step);
  return q.toString();
}

/** Gamle links (fra før pakkerne) brugte w, m, b, d, bk og x. De kan ikke regnes om og afvises. */
export const isOldLink = (str) => {
  const q = new URLSearchParams(str);
  return ['w', 'm', 'b', 'd', 'bk', 'x'].some((k) => q.has(k)) && !q.has('p');
};

export function fromQuery(str, cfg = prices) {
  const q = new URLSearchParams(str);
  const codes = q.get('y') ?? '';
  const systems = [...codes].map((c) => cfg.systems.standard.find((s) => s.code === c)?.key).filter(Boolean);
  const pkg = q.has('p') ? parseInt(q.get('p'), 10) : null;
  const selection = clean(
    { pkg: Number.isNaN(pkg) ? null : pkg, systems, custom: parseInt(q.get('c'), 10) || 0, english: q.get('e') === '1', intro: q.get('i') === '1' },
    cfg,
  );
  return { selection, step: Math.max(1, Math.min(4, parseInt(q.get('t'), 10) || 1)), old: isOldLink(str) };
}
