/**
 * Motion-konstanter der kun bruges fra JS.
 * Alt visuelt (kurver, varigheder, afstande) bor i motion.css —
 * det er dér, du justerer sidens følelse.
 */

/** Hvor stor en del af et element, der skal være synlig, før det tændes. */
export const REVEAL_THRESHOLD = 0.2

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
