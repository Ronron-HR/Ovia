import { faq } from '../content.js'

/**
 * SPØRGSMÅL — native <details>, så det virker uden JavaScript, med tastatur
 * og i skærmlæsere. Kun spørgsmål, der reelt afgør, om man skriver. Sektionen
 * ligger under kontaktfladen, som skubber ind over den (.under-sheet).
 */
export default function Faq() {
  return (
    <section
      id={faq.id}
      className="under-sheet bg-paper pt-[var(--space-section)]"
      style={{ '--pad-b': '5rem' }}
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-4">
            <p className="t-eyebrow t-eyebrow-accent">{faq.eyebrow}</p>
            <h2 className="t-display t-h3 mt-4">{faq.title}</h2>
          </header>

          <div data-reveal style={{ '--d': '80ms' }} className="border-t border-ink lg:col-span-8">
            {faq.items.map((item) => (
              <details key={item.q} className="faq border-b border-rule">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 text-[18px] leading-snug font-medium">
                  {item.q}
                  <span aria-hidden="true" className="faq-plus text-[24px] leading-none font-normal text-accent">
                    +
                  </span>
                </summary>
                <p className="faq-body t-body max-w-[60ch] pb-6 text-[16px]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
