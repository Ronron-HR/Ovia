/**
 * Motion-konstanter der kun bruges fra JS.
 * Alt visuelt (kurver, varigheder, afstande) bor i motion.css —
 * det er dér, du justerer sidens følelse.
 */

export const REVEAL_THRESHOLD = 0.2
export const STAGGER_MAX = 5

/**
 * Afstand mellem to led i en sekvens (useSequence), i ms.
 *
 * Tallet er ikke valgt på fornemmelse. Indgangskurven lægger ~90% af
 * distancen i de første 40% af tiden, så et rul på --dur-odo (760ms)
 * LÆSER som færdigt efter ~300ms; læg cifrenes egen indrykning på ~120ms
 * til, og det står stille omkring 420. Derfor 420: det næste tal går i
 * gang præcis når det forrige har sat sig. Ændrer du --dur-odo, skal det
 * her følge med, ellers overlapper de.
 */
export const SEQ_GAP = 420

/** Cursor-dæmpning. 0.07 pr. frame ≈ 200ms tidskonstant ved 60fps. */
export const LERP = 0.07

/** Maks forskydning for de to cursor-reaktive elementer. */
export const POINTER_MAX = 10

/** Under denne værdi stopper cursor-loopet — ingen rAF på et element i ro. */
export const POINTER_EPSILON = 0.1

export const clamp = (n, min = 0, max = 1) => (n < min ? min : n > max ? max : n)

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches
