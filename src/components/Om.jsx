import { useRef } from 'react'
import { casePalmy, om } from '../content.js'
import { useProgress } from '../motion/useProgress.js'
import { usePointer } from '../motion/usePointer.js'
import Slot from './Slot.jsx'

/**
 * SIGNATURE MOMENT 04 — PARALLAX OG CURSOR
 *
 * Billedet er designelementet her. Billedkolonnen rejser 80px gennem
 * sektionens gennemløb, tekstkolonnen kun 24px — forskellen er det, der
 * skaber overlappet. Kolonnerne overlapper i grid'et fra starten, ikke
 * med absolut positionering lagt på bagefter.
 *
 * Cursoren ligger på et indre element, så parallax og cursor ikke kæmper
 * om den samme transform. Maks 10px, lerpet. På touch findes den ikke.
 *
 * MENS CASEN ER SLUKKET låner portrættet casens maskereveal, så sidens
 * bedste greb ikke står ubrugt, og Om mig bliver det tungeste visuelle
 * moment efter heroen. Tændes casen, falder masken væk af sig selv —
 * to steder med samme gestus ville udvande begge.
 *
 * De to progress-scener kolliderer ikke: sektionen driver parallaxen
 * (hele gennemløbet), maske-wrapperen driver sin egen (færdig tidligt),
 * og hver skriver --p i sit eget undertræ.
 */
export default function Om() {
  const scene = useRef(null)
  const maskScene = useRef(null)
  const idle = useRef(null)
  const portrait = useRef(null)

  const heavy = !casePalmy.enabled

  useProgress(scene, { mode: 'pass' })
  // Er casen tændt, peger hooket på en tom ref og starter aldrig noget.
  useProgress(heavy ? maskScene : idle, { mode: 'enter', startVh: 0.85, distanceVh: 0.45 })
  usePointer(scene, portrait)

  return (
    <section id={om.id} ref={scene} className="bg-paper">
      <div className="shell py-28 md:py-44">
        <div className="grid grid-cols-12 items-start">
          {/* BEGGE kolonner skal placeres eksplicit — række OG startkolonne.
              Grid-overlap er kun tilladt for eksplicit placerede elementer.
              Mangler billedet sin col-start, forsøger auto-placeringen at
              undgå tekstkolonnen, finder ikke fem ledige kolonner i rækken
              og skubber billedet ud i implicitte kolonner, der er 0px brede.
              Resultatet er et billede med bredde nul. */}
          <div className="par-img col-span-10 md:col-span-5 md:col-start-1 md:row-start-1">
            <div ref={maskScene} className={heavy ? 'reveal-mask' : undefined}>
              <div className={heavy ? 'reveal-mask-inner' : undefined}>
                <div className={heavy ? 'reveal-mask-media' : undefined}>
                  <div ref={portrait} className="pointer-shift">
                    <Slot image={om.portrait} framed />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="par-txt relative z-10 col-span-12 -mt-12 bg-paper pt-10 md:col-span-8 md:col-start-5 md:row-start-1 md:mt-[22vh] md:pt-0 md:pl-10">
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
