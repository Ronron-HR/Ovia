import { Fragment, useRef } from 'react'
import { ConceptWindow } from '../concepts/index.jsx'
import { hero } from '../content.js'
import { useScene } from '../motion/useScene.js'
import { Arrow, Browser, Phone } from './Shots.jsx'

/**
 * FØRSTE SKÆRMBILLEDE
 *
 * Tilbud, målgruppe, to handlinger og et motiv, der viser arbejdet: tre
 * konceptillustrationer af tre forskellige designretninger i tre lag —
 * frisør på computer bagest, brasserie og café på telefon foran. Tre udtryk
 * på ét blik viser, at siderne ikke ligner hinanden. Illustrationerne er
 * tegnet til siden (src/concepts), er mærket "Konceptillustration" og fylder
 * ingen billedfiler: første skærm er tekst og HTML.
 *
 * Koreografien er ren CSS (se motion.css) og starter på første frame,
 * uafhængigt af React:
 *
 *   0ms    overskrift, række 1     typografien leder
 *   80ms   overskrift, række 2
 *   200ms  underrubrik
 *   240ms  skærmen
 *   340ms  knapperne
 *   420ms  første telefon
 *   560ms  anden telefon
 *
 * Bagefter giver scroll dybde: de tre lag glider med hver sin hastighed
 * (useScene, mode "leave"), så telefonerne løfter sig hurtigere end skærmen.
 * Skærmen løber ud til skærmkanten på brede skærme (--gutter).
 */
export default function Hero() {
  const stage = useRef(null)
  useScene(stage, { mode: 'leave' })

  return (
    <section
      id="hero"
      className="relative overflow-x-clip pt-[calc(var(--nav-h)+32px)] pb-12 md:pb-16 lg:pt-[calc(var(--nav-h)+56px)] lg:pb-20"
    >
      <div aria-hidden="true" className="spec-grid" />

      <div className="shell relative z-10">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-center lg:gap-x-10">
          <div className="lg:col-span-6">
            <p data-hero="fade" className="t-eyebrow">
              {hero.eyebrow}
            </p>

            <h1 className="t-display mt-5 text-[clamp(35px,4.1vw,58px)]">
              {hero.lines.map((line, i) => (
                <Fragment key={line}>
                  {/* Mellemrummet gør, at rækkerne læses som ét udsagn. */}
                  {i > 0 && ' '}
                  <span className="mask">
                    <span className="hero-rise" style={{ '--d': `${i * 80}ms` }}>
                      {line}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h1>

            <p
              data-hero="fade"
              style={{ '--d': '200ms' }}
              className="t-body mt-6 max-w-[46ch] text-[17px] md:text-[18px]"
            >
              {hero.deck}
            </p>

            <div
              data-hero="fade"
              style={{ '--d': '340ms' }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-10"
            >
              <a href={hero.primary.href} className="btn btn-primary">
                {hero.primary.label}
              </a>
              <a href={hero.secondary.href} className="btn btn-ghost">
                {hero.secondary.label}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 lg:-mr-[var(--gutter)]">
            <div ref={stage} className="hero-stage">
              <div data-hero="media" style={{ '--d': '240ms' }} className="hero-inner">
                <div className="hero-browser" data-par="34">
                  <Browser label={hero.labels.browser}>
                    <ConceptWindow id={hero.shots.browser} mode="desktop" />
                  </Browser>
                </div>

                {hero.shots.phones.map((id, i) => (
                  <div
                    key={id}
                    className={`hero-phone ${i === 0 ? 'hero-phone-a' : 'hero-phone-b'}`}
                    data-par={i === 0 ? 72 : 120}
                  >
                    <div data-hero="phone" style={{ '--d': `${180 + i * 140}ms` }}>
                      <Phone label={hero.labels.phones[i]}>
                        <ConceptWindow id={id} mode="mobile" />
                      </Phone>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 flex max-w-[58%] flex-wrap items-center gap-x-3 gap-y-2 text-[13px] leading-snug text-muted md:max-w-[62%]">
                <span className="tag">{hero.tag}</span>
                <a
                  href={hero.captionHref}
                  className="link-underline hit inline-flex items-center gap-1.5 text-ink"
                >
                  {hero.caption}
                  <Arrow />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
