import { memo, useEffect, useState } from 'react'
import { formatKr } from '../../lib/calculate.js'

/**
 * Flueben i en hvid firkant. Ind: scale .4 → 1 med et lille spring. Ud: kort og roligt (ingen overshoot).
 */
export function Check({ on, size = 28 }) {
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center border-2 border-ink bg-paper text-ink"
      style={{ width: size, height: size }}
    >
      <span
        className="flex"
        style={{
          opacity: on ? 1 : 0,
          transform: `scale(${on ? 1 : 0.4})`,
          transition: on ? 'opacity 120ms ease-out, transform 300ms var(--spring-check)' : 'opacity 140ms ease-out, transform 180ms ease-out',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.2 6.4l2.4 2.4 5.2-5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
        </svg>
      </span>
    </span>
  )
}

const dots = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Cifre 0–9 og en tom plads (række 10), som søjlerne ruller til, når tallet bliver kortere. */
const ROWS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '']
const COL_TRANSITION = 'max-width 340ms var(--spring-odo) var(--odo-delay, 0ms), opacity 220ms ease-out var(--odo-delay, 0ms)'

/**
 * Tælleværk: hvert ciffer er en søjle 0–9, der ruller (translateY) på 340 ms, og tallet kan både tælle op og ned.
 *
 * Søjlerne nøgles efter plads fra højre og bliver stående, også når tallet bliver kortere: en søjle uden ciffer ruller
 * til en tom plads, mens bredden folder sammen (og omvendt, når tallet bliver længere). Så tæller "5.198" ned til "198"
 * i stedet for at miste de forreste cifre med ét ryk. Forsinkelsen (--odo-delay på bundbaren) lader tallet vente på det
 * flyvende beløb. Skærmlæsere får tallet som tekst. Med reduced motion fjerner motion.css overgangene.
 */
export const Odometer = memo(function Odometer({ value }) {
  const text = dots(value)
  const len = text.length
  // `shown` følger `len` ét billede senere, så en ny søjle først mountes tom og så ruller ind.
  const [shown, setShown] = useState(len)
  const [cols, setCols] = useState(len)
  if (len > cols) setCols(len)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(len))
    return () => cancelAnimationFrame(id)
  }, [len])

  const out = []
  for (let p = cols - 1; p >= 0; p--) {
    const visible = p < shown
    const sep = p % 4 === 3
    const ch = p < len ? text[len - 1 - p] : ''
    if (sep) {
      out.push(
        <span
          key={'s' + p}
          aria-hidden="true"
          className="inline-block overflow-hidden"
          style={{ height: '1em', lineHeight: '1em', maxWidth: visible ? '0.5em' : 0, opacity: visible ? 1 : 0, transition: COL_TRANSITION }}
        >
          .
        </span>,
      )
      continue
    }
    const d = visible && /\d/.test(ch) ? Number(ch) : 10
    out.push(
      <span
        key={'d' + p}
        aria-hidden="true"
        className="inline-block overflow-hidden"
        style={{ height: '1em', maxWidth: visible ? '0.75em' : 0, transition: COL_TRANSITION }}
      >
        <span className="flex flex-col" style={{ transform: `translateY(${-d}em)`, transition: 'transform 340ms var(--spring-odo) var(--odo-delay, 0ms)' }}>
          {ROWS.map((r, i) => (
            <span key={i} style={{ height: '1em', lineHeight: '1em' }}>
              {r}
            </span>
          ))}
        </span>
      </span>,
    )
  }
  return (
    <span role="img" aria-label={text} className="inline-flex items-end leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {out}
    </span>
  )
})

/**
 * Kort "−5.000 kr./md." ved en fjernelse, i #7A766F. Fader ind, står et øjeblik og fader ud (keyframes deltaChip i
 * index.css, ca. 1,4 s). `key` på `delta` genstarter animationen. Intet ved reduced motion (se Calculator.jsx).
 */
export function DeltaChip({ amount, monthly, className = '' }) {
  if (!amount) return null
  return (
    <span aria-hidden="true" className={`delta-chip price pointer-events-none absolute text-xs ${className}`} style={{ color: 'var(--muted)' }}>
      {`−${formatKr(Math.abs(amount), monthly)}`}
    </span>
  )
}

/** Stort beløb i kvitteringen: Archivo (normal bredde), tælleværk og enhed. */
export const Total = memo(function Total({ value, unit, size, unitSize, gap = 8, unitPad = 4 }) {
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
      <Odometer value={value} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: unitSize, fontWeight: 500, letterSpacing: 0, paddingBottom: unitPad }}>
        {unit}
      </span>
    </span>
  )
})

/** En kvitteringslinje: "Pakke · Anbefalet ..... 9.500 kr. + 549 kr./md.". Prisen flytter ned under teksten, hvis der ikke er plads ved siden af (smal kolonne). */
export const ReceiptLine = memo(function ReceiptLine({ line, dark = true, animate = false, priceSize = 14, labelSmall = 13, tight = false }) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[2px] ${tight ? 'py-2' : 'py-3'} ${dark ? 'border-b border-hairline-dark' : 'border-b border-hairline'} ${animate ? 'anim-line' : ''}`}>
      <span className="min-w-0 flex-[1_1_9rem] text-[15px]">
        {line.label}{' '}
        <span style={{ fontSize: labelSmall }} className={dark ? 'text-on-ink-2' : ''}>
          · {line.pkg}
        </span>
      </span>
      <span className="price ml-auto flex-none text-right" style={{ fontSize: priceSize }}>
        {line.price}
      </span>
    </div>
  )
})


/** Pakkens pris: engang + pr. måned. */
export function PkgPrice({ pkg }) {
  return (
    <span className="price">
      {formatKr(pkg.once)}
      {' + '}
      {formatKr(pkg.monthly, true)}
    </span>
  )
}
