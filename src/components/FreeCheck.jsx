import { services } from '../data/pricing.js'
import ContactButtons from './ContactButtons.jsx'

/**
 * GRATIS GOOGLE-TJEK — den uforpligtende indgang på /booking-google/.
 * Titel og tekst står i pricing.js (services.bookingGoogle.freeCheck).
 */
export default function FreeCheck({ text }) {
  const c = services.bookingGoogle.freeCheck
  return (
    <section id="tjek" aria-labelledby="tjek-titel" className="section-y bg-paper">
      <div className="shell">
        <div data-reveal className="free-check grid grid-cols-1 gap-x-14 gap-y-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="t-eyebrow t-eyebrow-accent">{text.eyebrow}</p>
            <h2 id="tjek-titel" className="t-display t-h2 mt-4">
              {c.title}
            </h2>
            <p className="t-body t-lead mt-4 max-w-[48ch]">{c.text}</p>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[32px] leading-none font-medium tracking-tight">{text.priceLabel}</p>
            <ContactButtons sms smsText={text.smsText} mailSubject={text.mailSubject} className="mt-6" stretch />
          </div>
        </div>
      </div>
    </section>
  )
}
