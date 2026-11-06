// Rene funktioner. Ingen DOM, ingen state. Beregneren, /priser/, formularen og workeren bruger alle denne fil og src/data/prices.json.
// Prisen er fast: pakke + eventuelle ekstra funktioner. Intet "fra", ingen interval.
import prices from '../data/prices.json' with { type: 'json' };

export const NBSP = ' ';
const MINUS = '−';

/** 8000 -> "8.000 kr." (hårdt mellemrum). monthly=true -> "398 kr./md." */
export function formatKr(n, monthly = false) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + NBSP + 'kr.' + (monthly ? '/md.' : '');
}

/** Beløb med fortegn: negative vises med rigtigt minus ("−2.850 kr."). */
export const formatSigned = (n, monthly = false) => (n < 0 ? MINUS + formatKr(-n, monthly) : formatKr(n, monthly));

/** De tre veje gennem beregneren: kun hjemmeside, kun system til den hjemmeside kunden har, eller begge dele. */
export const PATHS = ['site', 'system', 'both'];

export const emptySelection = () => ({ path: null, pkg: null, systems: [], custom: 0, intro: false });

/** Er introprisen i gang? Styres af ét felt: introSlotsLeft. Er det 0, findes introprisen ikke nogen steder. */
export const introActive = (cfg = prices) => Number(cfg.introSlotsLeft) > 0;

/** Hører en hjemmeside med til valget? / Hører funktioner med til valget? */
export const usesSite = (sel) => sel.path === 'site' || sel.path === 'both';
export const usesSystems = (sel) => sel.path === 'system' || sel.path === 'both';

/**
 * selection = {
 *   path: 'site'|'system'|'both'|null, // hvad kunden har brug for (første trin)
 *   pkg: 0|1|2|null,          // indeks i cfg.packages (kun ved 'site' og 'both')
 *   systems: ['booking', …],  // almindelige funktioner i den rækkefølge, de er valgt (kun ved 'system' og 'both')
 *   custom: 0..5,             // antal bygget specielt til jer (kun ved 'system' og 'both')
 *   intro: boolean,           // "Ja, I må vise siden som case" (kun ved 'site' og 'both', og kun mens der er intro-pladser)
 * }
 * clean() gør et vilkårligt input (fra adresselinjen eller fra browseren) til et gyldigt valg. Felter, der ikke hører til
 * den valgte vej, bliver stående (så et skift af vej og tilbage ikke mister valg), men de påvirker hverken pris eller link.
 */
export function clean(sel, cfg = prices) {
  const path = PATHS.includes(sel?.path) ? sel.path : null;
  if (path === null) return emptySelection();
  const pkg = Number.isInteger(sel.pkg) && cfg.packages[sel.pkg] ? sel.pkg : null;
  const valid = new Set(cfg.systems.standard.map((s) => s.key));
  const systems = [...new Set((sel.systems ?? []).filter((k) => valid.has(k)))];
  const custom = Math.max(0, Math.min(cfg.systems.custom.max, Math.floor(Number(sel.custom) || 0)));
  return { path, pkg, systems, custom, intro: introActive(cfg) ? Boolean(sel.intro) : false };
}

/** Kun de felter, der gælder for den valgte vej. */
const effective = (sel) => ({
  path: sel.path,
  pkg: usesSite(sel) ? sel.pkg : null,
  systems: usesSystems(sel) ? sel.systems : [],
  custom: usesSystems(sel) ? sel.custom : 0,
  intro: usesSite(sel) ? sel.intro : false,
});

/** Er valget færdigt, så prisen kan sendes? Hjemmeside: pakke. System: mindst én funktion. Begge: pakke. */
export function isComplete(selection, cfg = prices) {
  const sel = clean(selection, cfg);
  if (sel.path === 'system') return sel.systems.length + sel.custom >= 1;
  if (sel.path === 'site' || sel.path === 'both') return sel.pkg !== null;
  return false;
}

/**
 * Regner pris og linjer ud.
 * Hjemmeside: pakkens pris. Begge: pakke + funktioner; funktioner, pakken har plads til, koster ikke ekstra, flere lægges til som ekstra
 * (almindelig: engang + pr. måned; bygget specielt til jer: engang + pr. måned pr. stk.). Bygget specielt til jer bruger de inkluderede
 * pladser først (det er billigst for kunden); almindelige funktioner fylder resten, i valgrækkefølge.
 * System alene: hver almindelig funktion og hver bygget specielt til jer koster sin egen pris (cfg.systemOnly), uden pakke og uden intro.
 * Intropris: rabat på pakkens ENGANGSPRIS (ikke på månedspris eller funktioner), kun når der er en hjemmeside med.
 * Returnerer { once, monthly, onceNormal, introSaving, introApplied, lines, selection }.
 */
export function calculate(selection, cfg = prices) {
  const sel = clean(selection, cfg);
  const e = effective(sel);
  const empty = { once: 0, monthly: 0, onceNormal: 0, introSaving: 0, introApplied: false, lines: [], selection: sel };
  if (sel.path === null) return empty;
  if (usesSite(sel) && e.pkg === null) return empty;
  const lines = [];
  const add = (key, label, detail, once, monthly, included = false) => lines.push({ key, label, package: detail, once, monthly, included });
  let saving = 0;

  if (usesSite(sel)) {
    const pkg = cfg.packages[e.pkg];
    add('package', 'Pakke', pkg.name, pkg.once, pkg.monthly);
    saving = e.intro ? Math.round(pkg.once * cfg.intro.discount) : 0;
    if (saving) add('intro', 'Introduktionspris', `${Math.round(cfg.intro.discount * 100)}${NBSP}% på engangsprisen`, -saving, 0);
  }

  if (sel.path === 'system') {
    const o = cfg.systemOnly;
    e.systems.forEach((key) => {
      const sys = cfg.systems.standard.find((s) => s.key === key);
      add('sys-' + key, sys.name, 'Funktion', o.standard.once, o.standard.monthly);
    });
    for (let i = 0; i < e.custom; i++) add('custom-' + (i + 1), cfg.systems.custom.name, 'Én opgave', o.custom.once, o.custom.monthly);
  } else if (sel.path === 'both') {
    const pkg = cfg.packages[e.pkg];
    const includedCustom = Math.min(e.custom, pkg.customSlots, pkg.slots);
    const includedStandard = Math.min(e.systems.length, pkg.slots - includedCustom);
    const a = cfg.addons;
    e.systems.forEach((key, i) => {
      const sys = cfg.systems.standard.find((s) => s.key === key);
      const inc = i < includedStandard;
      add('sys-' + key, sys.name, inc ? 'Indgår' : 'Ekstra', inc ? 0 : a.extraStandard.once, inc ? 0 : a.extraStandard.monthly, inc);
    });
    for (let i = 0; i < e.custom; i++) {
      const inc = i < includedCustom;
      add('custom-' + (i + 1), cfg.systems.custom.name, inc ? 'Indgår' : 'Ekstra', inc ? 0 : a.custom.once, inc ? 0 : a.custom.monthly, inc);
    }
  }

  const sum = (k) => lines.reduce((n, l) => n + l[k], 0);
  const once = sum('once');
  return { once, monthly: sum('monthly'), onceNormal: once + saving, introSaving: saving, introApplied: saving > 0, lines, selection: sel };
}

/** Prisen (engang og pr. måned) for ét ekstra system af en given slags, hvis det lægges til det nuværende valg. */
export function nextSystemCost(selection, kind, cfg = prices) {
  const sel = clean(selection, cfg);
  if (!usesSystems(sel) || (sel.path === 'both' && sel.pkg === null)) return null;
  if (sel.path === 'system') return { ...cfg.systemOnly[kind === 'custom' ? 'custom' : 'standard'] };
  const before = calculate(sel, cfg);
  const next =
    kind === 'custom'
      ? { ...sel, custom: Math.min(cfg.systems.custom.max, sel.custom + 1) }
      : { ...sel, systems: [...sel.systems, cfg.systems.standard.find((s) => !sel.systems.includes(s.key))?.key].filter(Boolean) };
  const after = calculate(next, cfg);
  return { once: after.once - before.once, monthly: after.monthly - before.monthly };
}

/**
 * Hvad en almindelig funktion står som i listen, så prisen er synlig før man trykker:
 *   'included' valgt og dækket af pakken (står som "Indgår") · 'free' ikke valgt, men pakken har en ledig plads (once/monthly = prisen, hvis pladsen er brugt)
 *   'extra' koster ekstra (once/monthly) · 'price' System alene: funktionens egen pris
 * null når der ikke er funktioner at vælge (ingen pakke endnu, eller kun hjemmeside).
 */
export function optionTag(selection, key, cfg = prices) {
  const sel = clean(selection, cfg);
  if (sel.path === 'system') return { kind: 'price', ...cfg.systemOnly.standard };
  if (sel.path !== 'both' || sel.pkg === null) return null;
  const extra = { once: cfg.addons.extraStandard.once, monthly: cfg.addons.extraStandard.monthly };
  if (sel.systems.includes(key)) {
    const line = calculate(sel, cfg).lines.find((l) => l.key === 'sys-' + key);
    return line.included ? { kind: 'included', once: 0, monthly: 0 } : { kind: 'extra', ...extra };
  }
  const before = calculate(sel, cfg);
  const after = calculate({ ...sel, systems: [...sel.systems, key] }, cfg);
  return after.once === before.once && after.monthly === before.monthly ? { kind: 'free', ...extra } : { kind: 'extra', ...extra };
}

/** "Bygget specielt til jer": prisen pr. stk. og om den næste er med i prisen (kun Max, når der er en ledig plads). */
export function customInfo(selection, cfg = prices) {
  const sel = clean(selection, cfg);
  if (sel.path === 'system') return { ...cfg.systemOnly.custom, free: false, atMax: sel.custom >= cfg.systems.custom.max };
  const next = nextSystemCost(sel, 'custom', cfg);
  const atMax = sel.custom >= cfg.systems.custom.max;
  return { once: cfg.addons.custom.once, monthly: cfg.addons.custom.monthly, free: Boolean(next) && !atMax && next.once === 0 && next.monthly === 0, atMax };
}

/**
 * Trinene for en vej. 'need' = Hvad har I brug for?, 'pkg' = Pakke, 'sys' = Funktioner, 'disc' = Rabat, 'sum' = Samlet pris.
 * Rabat-trinnet findes kun, når der er en hjemmeside med og introprisen er i gang.
 */
export function stepsFor(path, cfg = prices) {
  const disc = introActive(cfg) ? ['disc'] : [];
  if (path === 'site') return ['need', 'pkg', ...disc, 'sum'];
  if (path === 'system') return ['need', 'sys', 'sum'];
  if (path === 'both') return ['need', 'pkg', 'sys', ...disc, 'sum'];
  return ['need'];
}

/** Er et trin udfyldt, så man kan gå videre til det næste? */
function stepDone(sel, key) {
  if (key === 'need') return sel.path !== null;
  if (key === 'pkg') return sel.pkg !== null;
  if (key === 'sys') return sel.path === 'system' ? sel.systems.length + sel.custom >= 1 : true;
  return key === 'disc';
}

/**
 * Hvor man er, og hvor man kan komme hen. Et ugyldigt trin (fx 'disc', når der ikke er intro, eller et trin, der hører til en anden vej)
 * bliver til nærmeste gyldige. Man kan højst nå det første trin, der endnu ikke er udfyldt.
 * Returnerer { steps, step, index, total, reach, next, prev, canNext }.
 */
export function flowOf(selection, step, cfg = prices) {
  const sel = clean(selection, cfg);
  const steps = stepsFor(sel.path, cfg);
  let reach = 0;
  while (reach < steps.length - 1 && stepDone(sel, steps[reach])) reach++;
  let want = step;
  if (!steps.includes(want)) want = want === 'disc' ? 'sum' : (steps[1] ?? steps[0]);
  const index = Math.min(steps.indexOf(want), reach);
  return {
    steps,
    step: steps[index],
    index,
    total: steps.length,
    reach,
    next: steps[index + 1] ?? null,
    prev: steps[index - 1] ?? null,
    canNext: index < steps.length - 1 && stepDone(sel, steps[index]),
  };
}

/**
 * Guidet hjælp. answers = { q1: 'A'|'B'|'C', q2: ['A'…'E'] (flervalg), q3: 'A'|'B'|'C' }
 *
 * q1 Hvor mange sider? A 1–3 → mindst Start · B op til 6 → mindst Anbefalet · C så mange som nødvendigt → Max
 * q2 Hvad skal gæsterne kunne? Bogstav = almindelig funktion i listens rækkefølge (bordbooking, bestilling, gavekort, nyhedsbrev, anmeldelser)
 * q3 Skal noget bygges specielt? B = én ting bygget specielt til jer
 * Pakken er den billigste (engang + 12 måneder) blandt dem, der opfylder q1. Vejen er 'both', hvis der er valgt funktioner, ellers 'site'.
 * Intro slås ikke til.
 */
export function guidedHelp(answers, cfg = prices) {
  const min = { A: 0, B: 1, C: 2 }[answers.q1] ?? 0;
  const letters = 'ABCDE';
  const systems = (answers.q2 ?? []).map((l) => cfg.systems.standard[letters.indexOf(l)]?.key).filter(Boolean);
  const custom = answers.q3 === 'B' ? 1 : 0;
  const path = systems.length || custom ? 'both' : 'site';
  let best = null;
  for (let p = min; p < cfg.packages.length; p++) {
    const sel = clean({ path, pkg: p, systems, custom }, cfg);
    const r = calculate(sel, cfg);
    const cost = r.once + 12 * r.monthly;
    if (!best || cost < best.cost) best = { cost, sel };
  }
  return best.sel;
}

const PATH_CODE = { site: 'h', system: 's', both: 'b' };
const STEP_KEYS = ['need', 'pkg', 'sys', 'disc', 'sum'];

/**
 * Adresselinjen (del-link): ?v=b&p=1&y=bg&c=1&i=1&t=sum
 * (v vej: h hjemmeside, s system, b begge · p pakke · y funktioner som koder · c bygget specielt til jer · i intro · t trin).
 * Kun felter, der hører til vejen, kommer med.
 */
export function toQuery(sel, step = 'need') {
  const q = new URLSearchParams();
  if (sel.path) {
    q.set('v', PATH_CODE[sel.path]);
    if (usesSite(sel) && sel.pkg !== null && sel.pkg !== undefined) q.set('p', sel.pkg);
    if (usesSystems(sel)) {
      if (sel.systems?.length) q.set('y', sel.systems.map((k) => prices.systems.standard.find((s) => s.key === k)?.code ?? '').join(''));
      if (sel.custom) q.set('c', sel.custom);
    }
    if (usesSite(sel) && sel.intro) q.set('i', '1');
    if (step) q.set('t', step);
  }
  return q.toString();
}

/** Gamle links (fra før pakkerne) brugte w, m, b, d, bk og x. De kan ikke regnes om og afvises. */
export const isOldLink = (str) => {
  const q = new URLSearchParams(str);
  return ['w', 'm', 'b', 'd', 'bk', 'x'].some((k) => q.has(k)) && !q.has('p') && !q.has('v');
};

/**
 * Læser et del-link. Links fra pakke-versionen (uden v) får vejen ud fra indholdet: funktioner → 'both', ellers 'site'.
 * Trin: en nøgle (need, pkg, sys, disc, sum) eller et gammelt tal (1–4).
 */
export function fromQuery(str, cfg = prices) {
  const q = new URLSearchParams(str);
  const codes = q.get('y') ?? '';
  const systems = [...codes].map((c) => cfg.systems.standard.find((s) => s.code === c)?.key).filter(Boolean);
  const custom = parseInt(q.get('c'), 10) || 0;
  const pkgNum = q.has('p') ? parseInt(q.get('p'), 10) : null;
  const pkg = Number.isNaN(pkgNum) ? null : pkgNum;
  const fromCode = { h: 'site', s: 'system', b: 'both' }[q.get('v')];
  const path = fromCode ?? (pkg !== null ? (systems.length || custom ? 'both' : 'site') : null);
  const selection = clean({ path, pkg, systems, custom, intro: q.get('i') === '1' }, cfg);
  const t = q.get('t');
  const legacy = { 1: 'pkg', 2: 'sys', 3: 'disc', 4: 'sum' }[t];
  const asked = STEP_KEYS.includes(t) ? t : (legacy ?? (selection.path ? 'pkg' : 'need'));
  return { selection, step: flowOf(selection, asked, cfg).step, old: isOldLink(str) };
}
