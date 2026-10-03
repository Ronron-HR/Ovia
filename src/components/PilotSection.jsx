import { services } from '../data/pricing.js'
import ContactButtons from './ContactButtons.jsx'

/**
 * PILOTFORLØB — vises på marketingsiden, så længe flags.hasMarketingCases er
 * false. Vilkårene står i pricing.js (services.marketing.pilot).
 */
export default function PilotSection({ text }) {
  const pilot = services.marketing.pilot
  return (
    <section id="pilot" aria-labelledby="pilot-titel" className="on-dark section-y bg-ink text-paper">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-5">
            <p className="t-eyebrow text-paper">{text.eyebrow}</p>
            <h2 id="pilot-titel" className="t-display t-h2 mt-4">
              {text.title}
            </h2>
            <p className="t-lead mt-5 max-w-[44ch] text-paper/75">{text.intro}</p>
            <p className="badge mt-6 border-paper/30 bg-transparent text-paper">{pilot.limitText}</p>
          </header>

          <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-6 lg:col-start-7">
            <h3 className="t-eyebrow text-paper/60">{text.termsTitle}</h3>
            <ol className="mt-4 border-t border-paper/25">
              {pilot.terms.map((t, i) => (
                <li key={t} className="grid grid-cols-[36px_1fr] gap-x-3 border-b border-paper/15 py-4 text-[16px]">
                  <span className="font-mono text-[13px] leading-6 text-paper/60">0{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <ContactButtons
              sms
              smsText={text.smsText}
              mailSubject={text.mailSubject}
              className="mt-8"
              stretch
            />
          </div>
        </div>
      </div>
    </section>
  )
}
