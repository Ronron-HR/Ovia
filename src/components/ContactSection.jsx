import { contact } from '../data/pricing.js'
import { contactSection as c, links } from '../data/texts.js'
import ContactButtons from './ContactButtons.jsx'

/**
 * KONTAKT — sidens sidste flade (mørk). Ingen formular: telefon, SMS og mail
 * er almindelige links. Nummeret og mailen står også som tekst, så de kan
 * læses og skrives af.
 */
export default function ContactSection({ title = c.title, body = c.body }) {
  return (
    <section id={c.id} data-callbar-hide aria-labelledby="kontakt-titel" className="on-dark section-y bg-ink text-paper">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-end">
          <div data-reveal className="lg:col-span-7">
            <p className="t-eyebrow text-paper">{c.eyebrow}</p>
            <h2 id="kontakt-titel" className="t-display t-h2 mt-4 max-w-[20ch]">
              {title}
            </h2>
            <p className="t-lead mt-5 max-w-[48ch] text-paper/75">{body}</p>
            <ContactButtons sms className="mt-8" stretch />
          </div>

          <dl data-reveal style={{ '--d': '80ms' }} className="border-t border-paper/25 lg:col-span-4 lg:col-start-9">
            <div className="border-b border-paper/15 py-4">
              <dt className="t-eyebrow text-paper/60">{c.phoneLabel}</dt>
              <dd className="mt-1">
                <a href={links.tel} className="link-underline hit text-[26px] font-medium tracking-tight tabular-nums">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div className="border-b border-paper/15 py-4">
              <dt className="t-eyebrow text-paper/60">{c.mailLabel}</dt>
              <dd className="mt-1">
                <a href={links.mail} className="link-underline hit text-[18px] break-all">
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
