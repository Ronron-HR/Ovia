import { samarbejde } from '../content.js'

/**
 * SAMARBEJDET — fire trin i en rækkefølge, uden leveringstider og priser.
 *
 * Grå flade. Overskriften står fast i venstre side på bred skærm, mens
 * trinene løber forbi i højre: en anden opbygning end de øvrige sektioner.
 * Bruges på forsiden med de generelle trin og på ydelsessiderne med siden
 * egne trin (steps, title og lead kan overskrives).
 *
 * data-step: hvert trin tænder for sig, når man selv er nået ned til det
 * (se useReveal), ikke efter en forsinkelse pr. indeks. Uden JS står alle
 * trin synlige.
 */
export default function Samarbejde({
  steps = samarbejde.steps,
  title = samarbejde.title,
  eyebrow = samarbejde.eyebrow,
  lead = samarbejde.lead,
  showOwnership = true,
  id = samarbejde.id,
}) {
  return (
    <section id={id} className="on-grey">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
          <header data-reveal className="lg:sticky lg:top-[calc(var(--nav-h)+40px)] lg:col-span-5 lg:self-start">
            <p className="t-eyebrow t-eyebrow-accent">{eyebrow}</p>
            <h2 className="t-display t-h2 mt-4">{title}</h2>
            <p className="t-body t-lead mt-5 max-w-[42ch]">{lead}</p>
          </header>

          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="border-t border-ink">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  data-step
                  className="grid grid-cols-[52px_1fr] gap-x-4 border-b border-rule py-8 md:grid-cols-[84px_1fr]"
                >
                  <span className="text-[34px] leading-none font-medium tracking-tight text-accent md:text-[44px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="t-display t-h4">{step.title}</h3>
                    <p className="t-body mt-2 max-w-[46ch] text-[16px]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {showOwnership && <p className="mt-8 max-w-[56ch] text-[15px] text-muted">{samarbejde.ownership}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
