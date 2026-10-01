import { company, contact } from '../data/pricing.js'
import { footer, links } from '../data/texts.js'
import Logo from './Logo.jsx'

/** Fodfelt: kontakt, links og CVR-nummer (vises, når det er udfyldt i pricing.js). Ingen adresse. */
export default function Footer() {
  return (
    <footer data-callbar-hide className="on-dark bg-ink text-[14px] leading-relaxed text-paper/70">
      <div className="shell">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-paper/15 py-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <Logo className="block h-[24px] text-paper" />
            <p className="mt-4 max-w-[34ch]">{footer.tagline}</p>
            <p className="mt-4">
              <a href={links.tel} className="link-underline hit text-paper/90 tabular-nums">
                {contact.phone}
              </a>
              <br />
              <a href={links.mail} className="link-underline hit break-all text-paper/90">
                {contact.email}
              </a>
            </p>
          </div>

          {footer.columns.map((col, i) => (
            <nav key={col.title} aria-label={col.title} className={`md:col-span-3 ${i === 0 ? 'md:col-start-7' : ''}`}>
              <p className="t-eyebrow text-paper/60">{col.title}</p>
              <ul className="mt-3 flex flex-col">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="inline-flex min-h-10 items-center text-paper/85 hover:text-paper">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-paper/15 py-6 text-[13px] md:flex-row md:justify-between">
          <p>{footer.copyright}</p>
          <p>
            {contact.name}
            {company.cvr && ` · CVR ${company.cvr}`}
          </p>
        </div>
      </div>
    </footer>
  )
}
