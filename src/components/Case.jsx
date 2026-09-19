import { useRef } from 'react'
import { casePalmy as data } from '../content.js'
import { useProgress } from '../motion/useProgress.js'
import Slot from './Slot.jsx'

/**
 * SIGNATURE MOMENT 03 — MASKEREVEAL
 *
 * Sidens tungeste bevis får sidens bedste reveal. Masken åbner opad,
 * drevet af scroll-position, mens billedet indeni kører en modbevægelse,
 * så det virker forankret bag masken frem for slæbt op.
 *
 * Revealen er færdig efter 45vh scroll — altså før mockuppen når midten af
 * skærmen. Man kigger på et færdigt billede, ikke på et der bevæger sig.
 */
export default function Case() {
  const scene = useRef(null)
  useProgress(scene, { mode: 'enter', startVh: 0.85, distanceVh: 0.45 })

  return (
    <section id={data.id} className="bg-paper">
      <div className="shell py-24 md:py-36">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="t-eyebrow eyebrow-rule">
              {data.eyebrow}
            </p>
            <h2
              data-reveal="lg"
              style={{ '--d': '60ms' }}
              className="t-display mt-5 text-[clamp(38px,7vw,76px)]"
            >
              {data.title}
            </h2>
          </div>
          <ul data-reveal style={{ '--d': '120ms' }} className="flex flex-wrap gap-x-5 gap-y-1">
            {data.meta.map((m) => (
              <li key={m} className="t-eyebrow">
                {m}
              </li>
            ))}
          </ul>
        </header>

        <div ref={scene} className="mt-12 flex items-end gap-4 md:mt-16 md:gap-8">
          {/* Browser-mockup — det er den, masken ligger på. */}
          <figure className="reveal-mask min-w-0 flex-1">
            <div className="reveal-mask-inner border border-rule bg-paper-2">
              <div className="flex items-center gap-1.5 border-b border-rule px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-rule" />
                <span className="h-2 w-2 rounded-full bg-rule" />
                <span className="h-2 w-2 rounded-full bg-rule" />
                <span className="ml-3 font-mono text-[10px] tracking-wide text-muted/70">
                  {data.browser.url}
                </span>
              </div>
              <div className="overflow-hidden">
                <div className="reveal-mask-media">
                  <Slot image={data.browser} />
                </div>
              </div>
            </div>
          </figure>

          {/* Telefonen følger efter med standard-reveal, så de to ikke
              kæmper om opmærksomheden samtidigt. */}
          <figure
            data-reveal
            style={{ '--d': '60ms' }}
            className="w-[30%] shrink-0 md:w-[17%]"
          >
            <div className="overflow-hidden rounded-[18px] border border-rule bg-paper-2 p-1.5">
              <div className="overflow-hidden rounded-[12px]">
                <Slot image={data.phone} />
              </div>
            </div>
          </figure>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12">
          <div className="md:col-span-7">
            {data.body.map((p, i) => (
              <p
                key={p.slice(0, 24)}
                data-reveal
                style={{ '--d': `${i * 60}ms` }}
                className="t-body mt-0 mb-5 max-w-[56ch] text-[16px] last:mb-0"
              >
                {p}
              </p>
            ))}
          </div>
          <p
            data-reveal
            style={{ '--d': '120ms' }}
            className="rule pt-5 text-[14px] text-muted md:col-span-4 md:col-start-9"
          >
            {data.note}
          </p>
        </div>
      </div>
    </section>
  )
}
