import { Fragment, useRef } from 'react'
import { ConceptWindow } from '../concepts/index.jsx'
import { hero } from '../content.js'
import { useScene } from '../motion/useScene.js'
import CalcStart from './CalcStart.jsx'
import { Arrow, Browser, Phone } from './Shots.jsx'

/**
 * FØRSTE SKÆRMBILLEDE
 *
 * Handling først, ingen pris. Heroen fortæller kort, hvem jeg hjælper og med
 * hvad, og stiller beregnerens første spørgsmål direkte: "Hvad skal din nye
 * hjemmeside hjælpe med?" Et svar er et link til /prisberegner/ med formålet i
 * adresselinjen, så valget følger med og ikke nulstilles. Bagved står de to
 * knapper (Beregn din hjemmesidepris, Se demoer) og en let vej til kontakt om
 * andre opgaver. Der er ingen pris og ingen liste over alle ydelser her.
 *
 * Motivet er tre illustrationer af tre forskellige designretninger (frisør på
 * computer, restaurant og café på telefon) i tre lag. De er tegnet til siden
 * (src/concepts), er mærket "Demo · koncept" og fylder ingen billedfiler.
 *
 * Koreografien er ren CSS (se motion.css) og starter på første frame,
 * uafhængigt af React. Bagefter giver scroll dybde: de tre lag glider med hver
 * sin hastighed (useScene, mode "leave"). Skærmen løber ud til skærmkanten på
 * brede skærme (--gutter).
 */
export default function Hero() {
  const stage = useRef(null)
  useScene(stage, { mode: 'leave' })

  return (
    <section
      id="hero"
      className="relative overflow-x-clip pt-[calc(var(--nav-h)+32px)] pb-14 md:pb-20 lg:pt-[calc(var(--nav-h)+48px)] lg:pb-24"
    >
      <div className="shell relative z-10">
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-10">
          <div className="lg:col-span-6">
            <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
              {hero.eyebrow}
            </p>

            <h1 className="t-display t-hero mt-5">
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
              className="t-body t-lead mt-6 max-w-[46ch]"
            >
              {hero.deck}
            </p>

            {/* Beregnerens første spørgsmål */}
            <div data-hero="fade" style={{ '--d': '300ms' }} className="mt-8">
              <CalcStart />
            </div>

            <div
              data-hero="fade"
              style={{ '--d': '400ms' }}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <a href={hero.primary.href} className="btn btn-primary">
                {hero.primary.label}
              </a>
              <a href={hero.secondary.href} className="btn btn-ghost">
                {hero.secondary.label}
              </a>
            </div>

            <p
              data-hero="fade"
              style={{ '--d': '480ms' }}
              className="mt-5 text-[14px] text-muted"
            >
              {hero.other.text}{' '}
              <a href={hero.other.href} className="link-underline hit font-medium text-ink">
                {hero.other.label}
              </a>
            </p>
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
