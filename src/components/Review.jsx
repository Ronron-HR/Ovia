import { review } from '../content.js'

/**
 * ANMELDELSE — Copenhagen Ease.
 *
 * Godkendt feedback på siden, brugt som feedback efter en SAMTALE, ikke som en
 * udtalelse om en leveret hjemmeside. Én udtalelse, stort sat på en rolig
 * paper-flade med god luft: ingen stjerner, ingen tal og ingen flere citater.
 * Virksomhedsnavnet står som tekst; der er intet godkendt logo. Den diskrete
 * betegnelse over citatet gør sammenhængen klar.
 *
 * `under` gør plads i bunden, når næste sektion er et ark (.sheet).
 */
export default function Review({ under = false }) {
  return (
    <section
      id={review.id}
      className={`bg-paper ${under ? 'under-sheet pt-[var(--space-section)]' : ''}`}
    >
      <div className={`shell ${under ? '' : 'section-y'}`}>
        <figure data-reveal className="mx-auto max-w-[62rem]">
          <p className="t-eyebrow">{review.eyebrow}</p>
          <span aria-hidden="true" className="quote-rule mt-6" />

          <blockquote className="mt-8 md:mt-10">
            <p className="t-display text-[length:var(--text-quote)] leading-[1.14] tracking-[-0.025em] text-balance">
              <span aria-hidden="true">“</span>
              {review.quote}
              <span aria-hidden="true">”</span>
            </p>
          </blockquote>

          <figcaption className="mt-8 flex items-center gap-4 md:mt-10">
            <span aria-hidden="true" className="h-px w-10 bg-ink" />
            <span className="text-[17px] font-medium">{review.source}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
