import { contact } from '../data/pricing.js'
import { contactSection as c, links } from '../data/texts.js'
import ContactButtons from './ContactButtons.jsx'

/**
 * KONTAKT — sidens sidste flade (mørk). Ingen formular her: telefon, SMS og
 * mail er almindelige links, og nummeret og mailen står også som tekst, så de
 * kan læses og skrives af. Teksten forklarer, at man taler direkte med
 * Ronny; en sidste linje nævner formularen i beregneren (svar inden for 24
 * timer) og udelades på sider uden beregner (form={false}).
 */
export default function ContactSection({ title = c.title, body = c.body, form = true }) {
  return (
    <section
      id={c.id}
      data-tour="contact"
      data-callbar-hide
      aria-labelledby="kontakt-titel"
      className="on-dark section-y bg-ink text-paper"
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12 lg:items-center">
          <div data-reveal className="lg:col-span-7">
            <h2 id="kontakt-titel" className="t-display t-h2 max-w-[20ch] text-surface">
              {title}
            </h2>
            <p className="t-lead mt-5 max-w-[52ch] text-surface/80">{body}</p>
            <ContactButtons sms primary className="mt-8" stretch />
            {form && <p className="mt-6 max-w-[52ch] text-[16px] text-surface/70">{c.formNote}</p>}
          </div>

          <dl data-reveal style={{ '--d': '80ms' }} className="lg:col-span-4 lg:col-start-9">
            <div className="rounded-[var(--radius-card)] border border-surface/20 bg-surface/[0.06] px-6 py-5">
              <dt className="text-[15px] font-semibold text-surface/70">{c.phoneLabel}</dt>
              <dd className="mt-1">
                <a href={links.tel} className="link-underline hit text-[30px] font-semibold tracking-tight tabular-nums">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div className="mt-3 rounded-[var(--radius-card)] border border-surface/20 bg-surface/[0.06] px-6 py-5">
              <dt className="text-[15px] font-semibold text-surface/70">{c.mailLabel}</dt>
              <dd className="mt-1">
                <a href={links.mail} className="link-underline hit text-[19px] font-medium break-all">
                  {contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
