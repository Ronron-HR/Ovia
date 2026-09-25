import { faq } from '../content.js'

/**
 * SPØRGSMÅL — native <details>, så det virker uden JavaScript, med tastatur
 * og i skærmlæsere. Kun spørgsmål, der reelt afgør, om man skriver.
 */
export default function Faq() {
  return (
    <section id={faq.id} className="bg-paper">
      <div className="shell py-24 md:py-32">
        <div className="grid gap-x-14 gap-y-10 grid-cols-1 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-4">
            <p className="t-eyebrow">{faq.eyebrow}</p>
            <h2 className="t-display mt-4 text-[clamp(28px,3.4vw,44px)]">{faq.title}</h2>
          </header>

          <div data-reveal style={{ '--d': '80ms' }} className="border-t border-ink lg:col-span-8">
            {faq.items.map((item) => (
              <details key={item.q} className="faq border-b border-rule">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 text-[18px] leading-snug font-medium">
                  {item.q}
                  <span aria-hidden="true" className="faq-plus font-mono text-[22px] leading-none text-accent">
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
