import { om } from '../content.js'
import { Pic } from './Shots.jsx'

/**
 * OM OVIASPECS — kort og personlig. Portrættet er kilden i 500 × 625 og vises
 * aldrig større end 1:1 af sin egen opløsning (max-width), så det ikke bliver
 * blødt. Alder og skole er bevidst udeladt.
 *
 * Bruges som sidens øverste flade på /om/ (page): så er titlen sidens h1, og
 * der er plads til den faste navigation.
 */
export default function Om({ page = false }) {
  const Title = page ? 'h1' : 'h2'

  return (
    <section
      id={om.id}
      className={`on-grey ${page ? 'pt-[calc(var(--nav-h)+40px)] pb-[var(--space-block)] md:pt-[calc(var(--nav-h)+72px)]' : ''}`}
    >
      <div className={`shell ${page ? '' : 'section-y'}`}>
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
            <Title className="t-display t-h2 mt-4">{om.title}</Title>
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

/** Tre principper for samarbejdet, som rækker i en liste og ikke som kort. */
export function Principles({ under = false }) {
  const p = om.principles
  return (
    <section
      className={`bg-paper pt-[var(--space-section)] ${under ? 'under-sheet' : 'pb-[var(--space-section)]'}`}
      style={under ? { '--pad-b': '5rem' } : undefined}
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-4">
            <h2 className="t-display t-h3">{p.title}</h2>
          </header>
          <ol data-reveal style={{ '--d': '80ms' }} className="border-t border-ink lg:col-span-8">
            {p.items.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[52px_1fr] gap-x-4 border-b border-rule py-7 md:grid-cols-[84px_1fr]">
                <span className="text-[30px] leading-none font-medium tracking-tight text-accent md:text-[38px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="t-display t-h4">{item.title}</h3>
                  <p className="t-body mt-2 max-w-[52ch] text-[16px]">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
