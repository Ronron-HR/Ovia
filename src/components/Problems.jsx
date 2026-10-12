import { problems } from '../data/offer.js'
import Icon from './Icon.jsx'
import { Arrow } from './Shots.jsx'

/**
 * TRE PROBLEMER (forsiden): en utilstrækkelig hjemmeside, svag lokal synlighed og
 * besværlige henvendelser. Hvert kort fører til den løsningsside, der hører til
 * (ét link pr. kort; hele fladen er trykbar, se .card-link). Teksterne står i
 * src/data/offer.js.
 */
const ICON = { hjemmeside: 'browser', synlighed: 'pin', henvendelser: 'inbox' }

export default function Problems({ tone = 'paper' }) {
  return (
    <section aria-labelledby="problemer-titel" className={`section-y ${tone === 'grey' ? 'bg-paper-2' : 'bg-paper'}`}>
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          {problems.eyebrow && <p className="t-eyebrow t-eyebrow-strong">{problems.eyebrow}</p>}
          <h2 id="problemer-titel" className="t-display t-h2 mt-3">
            {problems.title}
          </h2>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
          {problems.items.map((item, i) => (
            <li key={item.id} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <article className="problem card card-hover">
                <span className="icon-tile">
                  <Icon name={ICON[item.id] ?? 'info'} size={22} />
                </span>
                <h3 className="t-display t-h4 mt-5">{item.title}</h3>
                <p className="t-body mt-3 text-[16px]">{item.text}</p>
                <p className="mt-auto pt-6">
                  <a href={item.href} className="card-link btn-text inline-flex items-center gap-2">
                    {item.linkLabel}
                    <Arrow />
                  </a>
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
