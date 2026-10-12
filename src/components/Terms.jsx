import { terms } from '../data/offer.js'
import Icon from './Icon.jsx'

/**
 * VILKÅR (id="vilkaar"): en synlig sektion på /priser/ og ikke gemt i FAQ.
 * Først forskellen på de to købsmåder i én sætning, så vilkårene for Lokal og
 * for engangskøb side om side, og til sidst det, der gælder begge. Teksterne
 * står i src/data/offer.js (terms); tallene kommer derfra via pricing.js.
 *
 * headingLevel: 2 som standard. tone: 'paper' | 'grey'.
 */
function Block({ block, level, id }) {
  const H = `h${level}`
  return (
    <div className="term-block">
      <H id={id} className="t-display t-h4">
        {block.title}
      </H>
      <ul className="rows" aria-labelledby={id}>
        {block.items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function Terms({ headingLevel = 2, tone = 'paper' }) {
  const H = `h${headingLevel}`
  const sub = headingLevel + 1
  return (
    <section id="vilkaar" aria-labelledby="vilkaar-titel" className={`section-y ${tone === 'grey' ? 'bg-paper-2' : 'bg-paper'}`}>
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          {terms.eyebrow && <p className="t-eyebrow t-eyebrow-strong">{terms.eyebrow}</p>}
          <H id="vilkaar-titel" className="t-display t-h2 mt-3">
            {terms.title}
          </H>
          <p className="t-body t-lead mt-4 max-w-[60ch]">{terms.intro}</p>
        </header>

        <div data-reveal className="callout mt-7 md:mt-9">
          <Icon name="info" size={22} className="mt-0.5 text-cta" />
          <p className="max-w-[78ch] text-[16px] font-medium">{terms.difference}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 md:mt-8 lg:grid-cols-2 lg:gap-6">
          <div data-reveal>
            <Block block={terms.lokal} level={sub} id="vilkaar-lokal" />
          </div>
          <div data-reveal style={{ '--d': '80ms' }}>
            <Block block={terms.koeb} level={sub} id="vilkaar-koeb" />
          </div>
        </div>

        <div data-reveal className="mt-5 lg:mt-6">
          <Block block={terms.both} level={sub} id="vilkaar-begge" />
        </div>
      </div>
    </section>
  )
}
