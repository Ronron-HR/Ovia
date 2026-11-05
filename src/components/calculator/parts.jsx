import prices from '../../data/prices.json'
import { formatKr } from '../../lib/calculate.js'

/** Flueben i en hvid firkant. Springer ind (scale .4 → 1) når `on`. */
export function Check({ on, size = 28 }) {
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center bg-paper text-ink"
      style={{ width: size, height: size }}
    >
      <span
        className="flex"
        style={{
          opacity: on ? 1 : 0,
          transform: `scale(${on ? 1 : 0.4})`,
          transition: 'opacity 120ms ease-out, transform 300ms var(--spring-check)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.2 6.4l2.4 2.4 5.2-5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
        </svg>
      </span>
    </span>
  )
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const dots = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/**
 * Tælleværk: hvert ciffer er en søjle 0–9, der ruller (translateY) på 340 ms.
 * Søjlerne nøgles efter plads fra højre, så de samme elementer genbruges og
 * overgangen kan løbe. `delay` lader tallet vente på det flyvende beløb.
 * Skærmlæsere får tallet som tekst. Med reduced motion fjerner motion.css
 * overgangen, og tallet skifter med det samme.
 */
export function Odometer({ value, delay = 0 }) {
  const text = dots(value)
  const chars = text.split('')
  const n = chars.length
  return (
    <span
      role="img"
      aria-label={text}
      className="inline-flex items-end leading-none"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {chars.map((c, i) => {
        const pos = n - 1 - i
        if (!/\d/.test(c)) {
          return (
            <span key={'s' + pos} aria-hidden="true" className="inline-block" style={{ height: '1em', lineHeight: '1em' }}>
              {c}
            </span>
          )
        }
        return (
          <span key={'d' + pos} aria-hidden="true" className="inline-block overflow-hidden" style={{ height: '1em' }}>
            <span
              className="flex flex-col"
              style={{
                transform: `translateY(${-Number(c)}em)`,
                transition: `transform 340ms var(--spring-odo) ${delay}ms`,
              }}
            >
              {DIGITS.map((d) => (
                <span key={d} style={{ height: '1em', lineHeight: '1em' }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/** Stort beløb i kvitteringen: Archivo (normal bredde), tælleværk og enhed. */
export function Total({ value, unit, delay, size, unitSize, gap = 8, unitPad = 4 }) {
  return (
    <span
      className="flex items-end font-bold"
      style={{
        gap,
        fontFamily: 'var(--font-display)',
        fontStretch: '100%',
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <Odometer value={value} delay={delay} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: unitSize, fontWeight: 500, letterSpacing: 0, paddingBottom: unitPad }}>
        {unit}
      </span>
    </span>
  )
}

/** En kvitteringslinje: "Hjemmeside · Vækst ..... 8.000 kr." */
export function ReceiptLine({ line, dark = true, animate = false, priceSize = 14, labelSmall = 13 }) {
  return (
    <div
      className={`grid items-baseline gap-4 py-3 ${dark ? 'border-b border-hairline-dark' : 'border-b border-hairline'} ${animate ? 'anim-line' : ''}`}
      style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}
    >
      <span className="text-[15px]">
        {line.label}{' '}
        <span style={{ fontSize: labelSmall }} className={dark ? 'text-on-ink-2' : ''}>
          · {line.pkg}
        </span>
      </span>
      <span className="price" style={{ fontSize: priceSize }}>
        {line.price}
      </span>
    </div>
  )
}

export const TERMS_SHORT = `Ingen binding. 1 md. opsigelse. Frikøb af siden ${formatKr(prices.addons.buyout.price)}`
