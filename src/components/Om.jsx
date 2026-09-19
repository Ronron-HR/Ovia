import { useRef } from 'react'
import { om } from '../content.js'
import { useProgress } from '../motion/useProgress.js'
import { usePointer } from '../motion/usePointer.js'
import Logo from './Logo.jsx'

/**
 * SIGNATURE MOMENT 04 — LOGOET
 *
 * OviaSpecs-logoet er sektionens visuelle fokus. Bogstaverne rejser sig ét ad
 * gangen op fra en fælles grundlinje — samme maskerede rise som heroen og
 * kontakt-overskriften, bare tegn for tegn. Det er en indgang, der kører én
 * gang, når logoet kommer til syne, og derefter står helt stille.
 *
 * Selve animationen bor i Logo.jsx (reveal) og bruger det eksisterende
 * [data-reveal='rise'] i motion.css, så kurve, varighed og reduced-motion
 * følger med uden ny kode.
 *
 * Tekstkolonnen kører sin egen svage parallax og overlapper logoet.
 * Logoet reagerer desuden på cursoren, som billedet gjorde: maks 10px,
 * lerpet, og ikke på touch.
 */
export default function Om() {
  const scene = useRef(null)
  const logo = useRef(null)

  useProgress(scene, { mode: 'pass' })
  usePointer(scene, logo)

  return (
    <section id={om.id} ref={scene} className="bg-paper">
      <div className="shell py-28 md:py-44">
        <div className="grid grid-cols-12 items-start">
          <div className="col-span-12 md:col-span-5 md:col-start-1 md:row-start-1">
            <div ref={logo} className="pointer-shift">
              <Logo reveal className="block h-[min(clamp(92px,15.5vw,190px),calc((100vw_-_40px)*0.295))] text-ink" />
            </div>
          </div>

          <div className="par-txt relative z-10 col-span-12 mt-8 bg-paper md:col-span-8 md:col-start-5 md:row-start-1 md:mt-[22vh] md:pl-10">
            <p data-reveal className="t-eyebrow eyebrow-rule">
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
