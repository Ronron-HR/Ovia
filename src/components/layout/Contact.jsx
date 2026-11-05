import { contact, links } from '../../data/site.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

const tile =
  'press hov-surface flex min-h-20 flex-col justify-between gap-1 bg-paper px-5 py-[14px] text-ink no-underline [--press:.97] md:min-h-[200px] md:gap-7 md:p-6'

/** Mørk kontaktsektion: "Svar inden for 24 timer." og tre fliser. */
export default function Contact() {
  return (
    <section id="kontakt" aria-labelledby="kontakt-titel" className="dark-zone bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] section-pad px-5 md:px-14">
        <h2 id="kontakt-titel" className="display t-h2">
          Svar inden for 24 timer.
        </h2>
        <div className="mt-7 grid gap-2 md:mt-14 md:grid-cols-[2fr_1fr_1fr]">
          <a href={links.tel} className={tile}>
            <span className={`${heading} whitespace-nowrap text-[19px] tracking-[-0.025em] md:text-[26px]`}>
              Ring til Ronny
            </span>
            <span className="text-[15px] whitespace-nowrap">{contact.phone}</span>
          </a>
          <a href={links.sms()} className={tile}>
            <span className={`${heading} whitespace-nowrap text-[19px] tracking-[-0.025em] md:text-[26px]`}>Skriv en SMS</span>
            <span className="text-[15px] whitespace-nowrap">Svar samme dag</span>
          </a>
          <a href={links.mail} className={tile}>
            <span className={`${heading} whitespace-nowrap text-[19px] tracking-[-0.025em] md:text-[26px]`}>Send en mail</span>
            <span className="min-w-0 truncate text-[15px] whitespace-nowrap">{contact.email}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
