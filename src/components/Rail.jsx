import { rail } from '../content.js'
import { Arrow } from './Shots.jsx'

/**
 * SIGNATURDETALJEN: SAMMENHÆNGEN
 *
 * Tre trin på én linje: kunden finder jer, forstår tilbuddet og kontakter
 * eller booker. Hvert trin peger på den ydelse, der hører til, så rækken
 * både forklarer og fungerer som indgang. Linjen mellem trinnene tegnes
 * fra venstre, når rækken kommer til syne (motion.css, .rail-line), og
 * står færdigtegnet, hvis JavaScript eller animation mangler.
 *
 * Det sidste trin er accent-farvet: det er dér, kunden bliver til en
 * henvendelse.
 */
export default function Rail() {
  return (
    <section
      id={rail.id}
      className="under-sheet border-t border-rule bg-surface pt-12 md:pt-16"
      style={{ '--pad-b': '4rem' }}
    >
      <div className="shell">
        <h2 className="t-eyebrow">{rail.label}</h2>

        <ol
          data-reveal
          data-rail
          className="relative mt-9 grid gap-y-10 md:grid-cols-3 md:gap-x-10"
        >
          <span
            aria-hidden="true"
            className="rail-line absolute top-[5px] right-0 left-0 hidden h-px bg-ink md:block"
          />
          <span
            aria-hidden="true"
            className="rail-line-y absolute top-2 bottom-2 left-[5px] w-px bg-ink md:hidden"
          />

          {rail.steps.map((step, i) => {
            const last = i === rail.steps.length - 1
            return (
              <li key={step.n} className="relative pl-9 md:pt-9 md:pl-0">
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-0 h-[11px] w-[11px] rounded-full border ${
                    last ? 'border-accent bg-accent' : 'border-ink bg-surface'
                  }`}
                />
                <span className="t-eyebrow">{step.n}</span>
                <h3 className="t-display mt-1 text-[24px] md:text-[26px]">{step.title}</h3>
                <p className="t-body mt-3 max-w-[38ch] text-[15px]">{step.body}</p>
                <a
                  href={step.link.href}
                  className="link-underline hit mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
                >
                  {step.link.label}
                  <Arrow />
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
