import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { formatKr } from '../../lib/calculate.js'
import Desktop from './Desktop.jsx'
import Mobile from './Mobile.jsx'
import { useCalculator } from './useCalculator.js'

const MOBILE_QUERY = '(max-width: 759.98px)'
const subscribe = (cb) => {
  const mq = window.matchMedia(MOBILE_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
/** Mobil først: serveren og første render er mobil; på desktop skifter hydreringen til desktop. */
const useIsMobile = () => useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches, () => true)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Beløbet, der flyver fra trykpunktet til bundbaren (mobil). 640 ms, fjernes efter 720 ms. */
function FlyingAmount({ fly }) {
  return (
    <div
      key={fly.id}
      aria-hidden="true"
      className="price pointer-events-none absolute z-30 bg-ink px-3 py-2 text-sm text-paper"
      style={{
        left: fly.tx,
        top: fly.ty,
        transform: 'translate(-50%,-50%)',
        '--dx': fly.dx + 'px',
        '--dy': fly.dy + 'px',
        animation: 'flyTo 640ms var(--ease-fly) both',
        outline: '2px solid var(--paper)',
      }}
    >
      {fly.text}
    </div>
  )
}

/**
 * Prisberegneren. Ejer tilstanden (useCalculator) og vælger layout:
 * desktop med sticky spec-ark, mobil med ét trin pr. skærm, bundbar og bottom sheet.
 */
export default function Calculator() {
  const isMobile = useIsMobile()
  const calc = useCalculator()
  const { receipt } = calc
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const tap = useRef(null)
  const prev = useRef({ o: receipt.o, m: receipt.m })
  const [fly, setFly] = useState(null)
  const [odoDelay, setOdoDelay] = useState(0)

  // Trykpunktet noteres, så beløbet kan flyve derfra, og tælleværket venter 420 ms på det.
  const onPointerDownCapture = (e) => {
    const root = rootRef.current
    if (!root || !isMobile) return
    const r = root.getBoundingClientRect()
    tap.current = { x: e.clientX - r.left, y: e.clientY - r.top, t: Date.now() }
    setOdoDelay(420)
    clearTimeout(tap.timer)
    tap.timer = setTimeout(() => setOdoDelay(0), 800)
  }

  useEffect(() => {
    const dO = receipt.o - prev.current.o
    const dM = receipt.m - prev.current.m
    prev.current = { o: receipt.o, m: receipt.m }
    if (!isMobile || !tap.current || Date.now() - tap.current.t > 700 || (!dO && !dM) || reducedMotion()) return
    const root = rootRef.current
    const bar = barRef.current
    if (!root || !bar) return
    const rr = root.getBoundingClientRect()
    const br = bar.getBoundingClientRect()
    if (br.height < 40) return
    const tx = br.left - rr.left + br.width / 2
    const ty = br.top - rr.top + 52
    const sign = (d) => (d > 0 ? '+' : '−')
    const parts = []
    if (dO) parts.push(sign(dO) + formatKr(Math.abs(dO)))
    if (dM) parts.push(sign(dM) + formatKr(Math.abs(dM), true))
    const next = { id: Date.now(), text: parts.join('   '), tx, ty, dx: tap.current.x - tx, dy: tap.current.y - ty }
    tap.current = { ...tap.current, t: 0 }
    setFly(next)
    const timer = setTimeout(() => setFly(null), 720)
    return () => clearTimeout(timer)
  }, [receipt.o, receipt.m, isMobile])

  const full = { ...calc, odoDelay }
  return (
    <section id="prisberegner" aria-label="Prisberegner" className="mx-auto max-w-[1440px] scroll-mt-[72px] md:scroll-mt-[84px]">
      <div
        ref={rootRef}
        onPointerDownCapture={onPointerDownCapture}
        className="relative bg-paper text-ink"
        style={isMobile ? { height: 'calc(100svh - 72px)', minHeight: 540 } : undefined}
      >
        {isMobile ? (
          <Mobile calc={full} barRef={barRef} fly={fly ? <FlyingAmount fly={fly} /> : null} />
        ) : (
          <Desktop calc={full} />
        )}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {`Engang ${formatKr(receipt.o)}. Pr. måned ${formatKr(receipt.m, true)}. Alle priser er ekskl. moms.`}
        </p>
      </div>
      <noscript>
        <p className="px-5 py-10 text-[17px] md:px-14">
          Prisberegneren kræver JavaScript. Se alle priser på <a href="/priser/">Priser</a>, eller ring på 53&nbsp;61&nbsp;36&nbsp;99.
        </p>
      </noscript>
    </section>
  )
}
