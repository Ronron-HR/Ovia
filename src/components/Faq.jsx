/**
 * SPØRGSMÅL — teksterne gives med (src/data/services.js). Native <details>, så det virker uden JavaScript, med tastatur
 * og i skærmlæsere. Kun spørgsmål, der reelt afgør, om man skriver.
 * `under` gør plads i bunden, når næste sektion er et ark (.sheet).
 */
export default function Faq({ items, title, eyebrow, id = 'faq', under = false }) {
  return (
    <section
      id={id}
      className={`bg-paper pt-[var(--space-section)] ${under ? 'under-sheet' : 'pb-[var(--space-section)]'}`}
      style={under ? { '--pad-b': '5rem' } : undefined}
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-4">
            <p className="t-eyebrow t-eyebrow-accent">{eyebrow}</p>
            <h2 className="t-display t-h3 mt-4">{title}</h2>
          </header>

          <div data-reveal style={{ '--d': '80ms' }} className="border-t border-ink lg:col-span-8">
            {items.map((item) => (
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
