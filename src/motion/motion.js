/**
 * Motion-konstanter der kun bruges fra JS.
 * Alt visuelt (kurver, varigheder, afstande) bor i motion.css —
 * det er dér, du justerer sidens følelse.
 */

export const REVEAL_THRESHOLD = 0.2
export const STAGGER_MAX = 5

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
