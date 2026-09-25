import { footer, kontakt, legal, mailHref, site } from '../content.js'
import { Arrow } from './Shots.jsx'

/**
 * KONTAKT
 *
 * Sidens eneste farvebrud: blæk-mørk, så den læses som afslutningen. Der er
 * ingen formular, fordi der ikke findes en formularbackend, og en formular
 * uden modtager ville kunne vise "sendt", uden at noget blev sendt. Mail og
 * telefon virker altid. Mail-linket åbner mailappen med en kort skabelon.
 */
export default function Kontakt() {
  return (
    <section id={kontakt.id} className="on-dark bg-ink text-paper">
      <div className="shell py-24 md:py-32">
        <div className="grid gap-x-14 gap-y-14 grid-cols-1 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-7">
            <p className="t-eyebrow text-paper/60">{kontakt.eyebrow}</p>
            <h2 className="t-display mt-5 text-[clamp(40px,6.4vw,92px)]">{kontakt.title}</h2>
            <p className="mt-7 max-w-[52ch] text-[17px] leading-relaxed text-paper/75">
              {kontakt.body}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={mailHref()} className="btn btn-primary">
                {kontakt.mailLabel}
                <Arrow />
              </a>
              <a href={`tel:${site.phoneHref}`} className="btn btn-ghost">
                {kontakt.phoneLabel} {site.phone}
              </a>
            </div>
            <p className="mt-3 text-[13px] text-paper/60">{kontakt.mailNote}</p>
          </div>

          <div data-reveal style={{ '--d': '100ms' }} className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <dl className="border-t border-paper/25">
              <div className="border-b border-paper/15 py-5">
                <dt className="t-eyebrow text-paper/60">E-mail</dt>
                <dd className="mt-1.5 text-[18px]">
                  <a href={`mailto:${site.email}`} className="link-underline break-all">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div className="border-b border-paper/15 py-5">
                <dt className="t-eyebrow text-paper/60">Telefon</dt>
                <dd className="mt-1.5 text-[18px]">
                  <a href={`tel:${site.phoneHref}`} className="link-underline">
                    +45 {site.phone}
                  </a>
                </dd>
              </div>
              <div className="border-b border-paper/15 py-5">
                <dt className="t-eyebrow text-paper/60">Sted</dt>
                <dd className="mt-1.5 text-[18px]">{site.place}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <p className="t-eyebrow text-paper/60">{kontakt.helps.title}</p>
              <ul className="mt-3 flex flex-col gap-2 text-[15px] text-paper/80">
                {kontakt.helps.items.map((item) => (
                  <li key={item} className="grid grid-cols-[22px_1fr]">
                    <span aria-hidden="true" className="font-mono text-accent-soft">
                      +
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="on-dark bg-ink text-[13px] leading-relaxed text-paper/60">
      <div className="shell">
        <div className="flex flex-col gap-4 border-t border-paper/15 py-7 md:flex-row md:items-start md:justify-between">
          <div>
            <p>{footer.left}</p>
            <p className="mt-1">
              {legal.owner} · {legal.address}
              {legal.cvr && ` · CVR ${legal.cvr}`}
            </p>
          </div>
          <ul className="flex gap-6">
            {footer.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-underline hit inline-block text-paper/80">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
