import { BELLI_DESKTOP, BELLI_MOBILE, BelliDesktop, BelliMobile } from './Belli.jsx'
import { CAFE_DESKTOP, CAFE_MOBILE, CafeDesktop, CafeMobile } from './Cafe.jsx'
import { SALON_DESKTOP, SALON_MOBILE, SalonDesktop, SalonMobile } from './Salon.jsx'

/**
 * Konceptillustrationerne og det, der skal til for at vise dem i en ramme.
 * Se kit.jsx: de er tegnet til siden og er ikke skærmbilleder.
 */
export const concepts = {
  salon: {
    desktop: { Comp: SalonDesktop, ...SALON_DESKTOP },
    mobile: { Comp: SalonMobile, ...SALON_MOBILE },
  },
  belli: {
    desktop: { Comp: BelliDesktop, ...BELLI_DESKTOP },
    mobile: { Comp: BelliMobile, ...BELLI_MOBILE },
  },
  cafe: {
    desktop: { Comp: CafeDesktop, ...CAFE_DESKTOP },
    mobile: { Comp: CafeMobile, ...CAFE_MOBILE },
  },
}

const WINDOW = { desktop: 16 / 10, mobile: 9 / 19.5 }

/** Hvor mange designenheder vinduet viser. */
export const windowHeight = (mode, w) => w / WINDOW[mode]

/** Hvor langt siden kan rulle i vinduet, i procent af sidens egen højde. */
export function travelPercent(id, mode) {
  const { w, h } = concepts[id][mode]
  return Math.max(0, ((h - windowHeight(mode, w)) / h) * 100)
}

/**
 * Et vindue ind til en konceptillustration. `at` er hvor langt nede, vinduet
 * står, i designenheder (0 = toppen). `scroll` gør siden klar til at rulle
 * (useScene styrer den via data-travel).
 */
export function ConceptWindow({ id, mode = 'desktop', at = 0, scroll = false, className = '' }) {
  const c = concepts[id][mode]
  const y = Math.min(at, c.h - windowHeight(mode, c.w))
  const start = (y / c.h) * 100

  return (
    <div className={`scroll-view ${mode === 'mobile' ? 'scroll-view--phone' : ''} ${className}`}>
      <div
        className="scroll-img"
        data-travel={scroll ? travelPercent(id, mode).toFixed(3) : undefined}
        style={{ transform: start ? `translate3d(0, -${start.toFixed(3)}%, 0)` : undefined }}
      >
        <c.Comp />
      </div>
    </div>
  )
}
