import { om } from '../content.js'
import { Pic } from './Shots.jsx'

/**
 * OM OVIASPECS — kort og personlig. Portrættet er kilden i 500 × 625 og vises
 * aldrig større end 1:1 af sin egen opløsning (max-width), så det ikke bliver
 * blødt. Alder og skole er bevidst udeladt.
 */
export default function Om() {
  return (
    <section id={om.id} className="on-grey">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-center">
          <div data-reveal className="lg:col-span-4">
            <div className="w-full max-w-[300px] overflow-hidden rounded-[var(--radius-panel)] bg-paper lg:max-w-[360px]">
              <Pic
                image={om.portrait}
                fallback="jpg"
                sizes="(min-width: 1024px) 360px, 300px"
                className="block h-auto w-full"
              />
            </div>
          </div>

          <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-7 lg:col-start-6">
            <p className="t-eyebrow t-eyebrow-accent">{om.eyebrow}</p>
            <h2 className="t-display t-h2 mt-4">{om.title}</h2>
            {om.body.map((p) => (
              <p key={p.slice(0, 24)} className="t-body t-lead mt-5 max-w-[56ch]">
                {p}
              </p>
            ))}

            <dl className="mt-9 max-w-[56ch] border-t border-ink">
              {om.facts.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[130px_1fr] gap-x-4 border-b border-rule py-3.5 text-[15px] sm:grid-cols-[170px_1fr]"
                >
                  <dt className="t-eyebrow self-center">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
