import { useRef } from 'react'
import { footer, kontakt, legal, site } from '../content.js'
import { usePointer } from '../motion/usePointer.js'
import KontaktForm from './KontaktForm.jsx'

/**
 * SIGNATURE MOMENT 05 — VÆGT TIL SIDST
 *
 * Oversized typografi afsløret linje for linje med samme maske som heroen,
 * plus ét cursor-reaktivt element omkring CTA'et.
 *
 * Fladen bag knappen bevæger sig — knappen gør ikke. Hit-arealet står
 * bomstille, for alt andet gør klik til gætteri. På touch står fladen
 * stille og læses som en del af designet.
 *
 * Sektionen inverterer til blæk-mørk. Det er sidens eneste farvebrud,
 * og det er dét, der gør den til en afslutning frem for endnu en sektion.
 */
export default function Kontakt() {
  const ctaScene = useRef(null)
  const halo = useRef(null)

  usePointer(ctaScene, halo)

  // Render-funktion, ikke en komponent: en komponent defineret herinde
  // ville blive gendannet ved hver render og remounte sit indhold.
  const withHalo = (control) => (
    <div ref={ctaScene} className="relative inline-block p-6">
      <span
        ref={halo}
        aria-hidden="true"
        className="pointer-shift pointer-events-none absolute inset-3 border border-paper/25"
      />
      {control}
    </div>
  )

  return (
    <section id={kontakt.id} className="bg-ink text-paper">
      <div className="shell py-24 md:py-36">
        <p data-reveal className="t-eyebrow text-paper/50">
          {kontakt.eyebrow}
        </p>

        <h2 className="t-display mt-8 text-[clamp(44px,13vw,168px)] md:mt-12">
          {kontakt.lines.map((line, i) => (
            <span key={line} className="mask" data-reveal="rise" style={{ '--d': `${i * 70}ms` }}>
              <span>{line}</span>
            </span>
          ))}
        </h2>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p
              data-reveal
              style={{ '--d': '120ms' }}
              className="max-w-[48ch] text-[16px] leading-relaxed text-paper/70"
            >
              {kontakt.body}
            </p>
            <p
              data-reveal
              style={{ '--d': '160ms' }}
              className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-paper/70"
            >
              {kontakt.price}
            </p>

            <ul className="mt-6 flex flex-col gap-1 text-[15px] text-paper/60">
              <li>
                <a href={`mailto:${site.email}`} className="link-underline text-paper">
                  {site.email}
                </a>
              </li>
              <li>
                {kontakt.footnote}{' '}
                <a href={`tel:${site.phoneHref}`} className="link-underline text-paper">
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>

          <div data-reveal style={{ '--d': '200ms' }} className="md:col-span-6 md:col-start-7">
            {kontakt.form.endpoint ? (
              <KontaktForm>{withHalo}</KontaktForm>
            ) : (
              withHalo(
                <a
                  href={`mailto:${site.email}`}
                  className="btn relative inline-block bg-paper px-8 py-4 text-[15px] font-medium text-ink hover:bg-accent-bright"
                >
                  {kontakt.cta.label}
                </a>,
              )
            )}
          </div>
        </div>

        <footer className="mt-20 border-t border-paper/15 pt-6 text-[13px] leading-relaxed text-paper/50 md:mt-28">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                  <a href={link.href} className="link-underline text-paper/70">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  )
}
