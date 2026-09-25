import { samarbejde } from '../content.js'

/**
 * SAMARBEJDET — fire trin i en rækkefølge, uden leveringstider og priser.
 *
 * data-step: hvert trin tænder for sig, når man selv er nået ned til det
 * (se useReveal), ikke efter en forsinkelse pr. indeks. Uden JS står alle
 * trin synlige.
 */
export default function Samarbejde() {
  return (
    <section id={samarbejde.id} className="bg-paper-2">
      <div className="shell py-24 md:py-32">
        <header data-reveal className="max-w-[46ch]">
          <p className="t-eyebrow">{samarbejde.eyebrow}</p>
          <h2 className="t-display mt-4 text-[clamp(30px,4vw,52px)]">{samarbejde.title}</h2>
        </header>

        <ol className="mt-14 grid gap-x-8 gap-y-10 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
          {samarbejde.steps.map((step, i) => (
            <li key={step.title} data-step className="border-t border-ink pt-5">
              <span className="block font-mono text-[40px] leading-none text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="t-display mt-4 text-[24px]">{step.title}</h3>
              <p className="t-body mt-3 max-w-[36ch] text-[15px]">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="rule mt-14 max-w-[62ch] pt-5 text-[16px] md:mt-20">
          {samarbejde.ownership}
        </p>
      </div>
    </section>
  )
}
