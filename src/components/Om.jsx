import { useRef } from 'react'
import { om } from '../content.js'
import { useProgress } from '../motion/useProgress.js'
import { usePointer } from '../motion/usePointer.js'

/**
 * SIGNATURE MOMENT 04 — ORDMÆRKET
 *
 * OVIA er sektionens visuelle fokus. Bogstaverne rejser sig ét ad gangen
 * op fra en fælles grundlinje — samme maskerede rise som heroen og
 * kontakt-overskriften, bare tegn for tegn. Det er en indgang, der kører
 * én gang, når ordet kommer til syne, og derefter står helt stille.
 *
 * Revealen bruger det eksisterende [data-reveal='rise'] (se motion.css),
 * så kurve, varighed og reduced-motion-adfærd følger med uden ny kode.
 * Rækkefølgen er FAST (venstre mod højre) og ikke tilfældig.
 *
 * Tekstkolonnen kører sin egen svage parallax og overlapper ordmærket.
 * Ordet reagerer desuden på cursoren, som billedet gjorde: maks 10px,
 * lerpet, og ikke på touch.
 */

/** Forsinkelse mellem bogstaverne. Kort nok til at læses som ét ord. */
const LETTER_STAGGER = 90

export default function Om() {
  const scene = useRef(null)
  const wordmark = useRef(null)

  useProgress(scene, { mode: 'pass' })
  usePointer(scene, wordmark)

  return (
    <section id={om.id} ref={scene} className="bg-paper">
      <div className="shell py-28 md:py-44">
        <div className="grid grid-cols-12 items-start">
          <div className="col-span-12 md:col-span-5 md:col-start-1 md:row-start-1">
            <div ref={wordmark} className="pointer-shift">
              <p className="t-display text-[clamp(88px,20vw,240px)] leading-none uppercase">
                <span className="sr-only">{om.wordmark}</span>
                <span aria-hidden="true" data-reveal="rise" className="mask wordmark">
                  {[...om.wordmark].map((letter, i) => (
                    <span
                      key={`${letter}-${i}`}
                      className="wordmark-letter"
                      style={{ '--d': `${i * LETTER_STAGGER}ms` }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              </p>
            </div>
          </div>

          <div className="par-txt relative z-10 col-span-12 -mt-6 bg-paper pt-10 md:col-span-8 md:col-start-5 md:row-start-1 md:mt-[22vh] md:pt-0 md:pl-10">
            <p data-reveal className="t-eyebrow">
              {om.eyebrow}
            </p>
            <h2
              data-reveal="lg"
              style={{ '--d': '60ms' }}
              className="t-display mt-5 max-w-[16ch] text-[clamp(32px,5.6vw,60px)]"
            >
              {om.title}
            </h2>
            {om.body.map((p, i) => (
              <p
                key={p.slice(0, 24)}
                data-reveal
                style={{ '--d': `${Math.min(i + 2, 4) * 60}ms` }}
                className="t-body mt-5 max-w-[50ch] text-[16px]"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
