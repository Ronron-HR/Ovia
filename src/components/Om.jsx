import { om } from '../content.js'
import { Pic } from './Shots.jsx'

/**
 * OM OVIASPECS — portrættet er kilden i 500 × 625 og vises aldrig større end
 * 1:1 af sin egen opløsning (max-width), så det ikke bliver blødt. Alder og
 * skole er bevidst udeladt.
 */
export default function Om() {
  return (
    <section id={om.id} className="border-y border-rule bg-surface">
      <div className="shell py-24 md:py-32">
        <div className="grid gap-x-14 gap-y-10 grid-cols-1 lg:grid-cols-12 lg:items-start">
          <div data-reveal className="lg:col-span-4">
            <div className="w-full max-w-[300px] overflow-hidden rounded-xl bg-paper shadow-[14px_14px_0_var(--color-accent)] lg:max-w-[360px]">
              <Pic
                image={om.portrait}
                fallback="jpg"
                sizes="(min-width: 1024px) 360px, 300px"
                className="block h-auto w-full"
              />
            </div>
          </div>

          <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-7 lg:col-start-6">
            <p className="t-eyebrow">{om.eyebrow}</p>
            <h2 className="t-display mt-4 text-[clamp(30px,4vw,52px)]">{om.title}</h2>
            {om.body.map((p) => (
              <p key={p.slice(0, 24)} className="t-body mt-5 max-w-[54ch] text-[17px]">
                {p}
              </p>
            ))}

            <dl className="mt-9 max-w-[54ch] border-t border-rule">
              {om.facts.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[130px_1fr] gap-x-4 border-b border-rule py-3 text-[15px] sm:grid-cols-[170px_1fr]"
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
