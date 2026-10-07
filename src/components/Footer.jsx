import { company, contact } from '../data/pricing.js'
import { footer, links } from '../data/texts.js'
import Logo from './Logo.jsx'

/** Fodfelt: kontakt, links, CVR og adresse (hver vises, når den er udfyldt i pricing.js). Lys flade under den mørke kontaktsektion. */
export default function Footer() {
  return (
    <footer data-callbar-hide className="border-t border-rule-strong bg-surface text-[16px] leading-relaxed text-muted">
      <div className="shell">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 md:grid-cols-12 md:py-14">
          <div className="col-span-2 md:col-span-5">
            <Logo className="block h-[26px] text-ink" />
            <p className="mt-4 max-w-[40ch]">{footer.tagline}</p>
            <p className="mt-4">
              <a href={links.tel} className="link-underline hit font-medium text-ink tabular-nums">
                {contact.phone}
              </a>
              <br />
              <a href={links.mail} className="link-underline hit font-medium break-all text-ink">
                {contact.email}
              </a>
            </p>
          </div>

          {footer.columns.map((col, i) => (
            <nav key={col.title} aria-label={col.title} className={`md:col-span-3 ${i === 0 ? 'md:col-start-7' : ''}`}>
              <p className="text-[16px] font-semibold text-ink">{col.title}</p>
              <ul className="mt-3 flex flex-col">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="inline-flex min-h-10 items-center text-muted hover:text-ink hover:underline hover:underline-offset-4">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-rule py-6 text-[14px] md:flex-row md:justify-between">
          <p>{footer.copyright}</p>
          <p>
            {contact.name}
            {company.cvr && ` · CVR ${company.cvr}`}
            {company.address && ` · ${company.address}`}
          </p>
        </div>
      </div>
    </footer>
  )
}
