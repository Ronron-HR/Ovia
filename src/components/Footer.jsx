import { footer, legal, site } from '../content.js'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="on-dark bg-ink text-[14px] leading-relaxed text-paper/70">
      <div className="shell">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-paper/15 py-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo className="block h-[24px] text-paper" />
            <p className="mt-4 max-w-[30ch]">{footer.tagline}</p>
            <p className="mt-4">
              <a href={`mailto:${site.email}`} className="link-underline hit break-all text-paper/90">
                {site.email}
              </a>
              <br />
              <a href={`tel:${site.phoneHref}`} className="link-underline hit text-paper/90">
                +45 {site.phone}
              </a>
            </p>
          </div>

          {footer.columns.map((col, i) => (
            <nav key={col.title} aria-label={col.title} className={`md:col-span-2 ${i === 0 ? 'md:col-start-6' : ''}`}>
              <p className="t-eyebrow">{col.title}</p>
              <ul className="mt-3 flex flex-col">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="inline-flex min-h-9 items-center text-paper/85 hover:text-paper">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-paper/15 py-6 text-[13px] md:flex-row md:justify-between">
          <p>{footer.left}</p>
          <p>
            {legal.owner} · {legal.address}
            {legal.cvr && ` · CVR ${legal.cvr}`}
          </p>
        </div>
      </div>
    </footer>
  )
}
