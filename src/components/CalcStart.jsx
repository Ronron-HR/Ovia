import { calcHref, hero, purposes } from '../content.js'
import { Arrow } from './Shots.jsx'

/**
 * BEREGNERENS FØRSTE SPØRGSMÅL
 *
 * Bruges i heroen og øverst på hjemmesidesiden. Et svar er et link til
 * /prisberegner/ med formålet i adresselinjen, så valget følger med videre
 * og beregneren ikke starter forfra. Ingen pris vises her.
 */
export default function CalcStart({ className = '' }) {
  return (
    <div className={`rounded-[var(--radius-panel)] border border-rule bg-surface p-4 md:p-5 ${className}`}>
      <p className="text-[17px] font-medium">{hero.question}</p>
      <p className="mt-0.5 text-[13px] text-muted">{hero.questionHint}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {purposes.map((p) => (
          <li key={p.id}>
            <a
              href={calcHref({ purpose: p.id })}
              className="opt flex min-h-12 items-center justify-between gap-2 rounded-md border border-rule bg-paper px-3 py-2 text-[14px] leading-tight font-medium text-ink"
            >
              {p.short}
              <Arrow className="shrink-0 text-accent" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
