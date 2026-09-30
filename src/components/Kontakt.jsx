import { useRef, useState } from 'react'
import {
  composeParts,
  footer,
  kontakt,
  legal,
  mailtoFrom,
  paths,
  site,
  topics,
} from '../content.js'
import { useSearch } from '../useSearch.js'
import Logo from './Logo.jsx'
import { Arrow } from './Shots.jsx'

/**
 * KONTAKT
 *
 * Sidens sidste flade: koksgrå, så den læses som afslutningen. Bruges på
 * /kontakt/ (med valg af emne) og nederst på hver ydelsesside (med emnet
 * valgt på forhånd og låst, så en henvendelse om SEO aldrig får en
 * hjemmesidepris eller et forkert emne).
 *
 * Der findes ingen formularbackend, så formularen sender ikke noget selv: den
 * samler beskeden i en mail og åbner besøgendes mailapp (mailto). Derfor viser
 * den aldrig en "sendt"-besked, kun en neutral note om, at mailappen er åbnet,
 * og adressen til dem, hvor mailappen ikke reagerer. Mail og telefon virker
 * altid, også uden JavaScript.
 */
function Form({ topic, setTopic, selectable }) {
  const [note, setNote] = useState(null)
  const form = useRef(null)
  const f = kontakt.form
  const current = topics.find((t) => t.id === topic)

  const read = () => {
    const data = new FormData(form.current)
    return {
      topic,
      name: String(data.get('name') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()
    window.location.href = mailtoFrom(composeParts(read()))
    setNote('opened')
  }

  // Til dem uden mailprogram: kopiér emne og besked, og indsæt dem i en
  // webmail. Intet sendes; siden siger kun, om kopieringen lykkedes.
  const onCopy = async () => {
    if (!form.current.reportValidity()) return
    const { subject, body } = composeParts(read())
    try {
      await navigator.clipboard.writeText(`Emne: ${subject}\n\n${body}`)
      setNote('copied')
    } catch {
      setNote('failed')
    }
  }

  return (
    <form ref={form} onSubmit={onSubmit} className="rounded-[var(--radius-panel)] border border-paper/20 bg-paper/[0.04] p-6 md:p-9">
      {selectable ? (
        <fieldset>
          <legend className="t-eyebrow">{f.topicLegend}</legend>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topics.map((t) => (
              <label key={t.id} className="block">
                <input
                  type="radio"
                  name="topic"
                  value={t.id}
                  checked={topic === t.id}
                  onChange={() => setTopic(t.id)}
                  className="sr-only"
                />
                <span className="topic">{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="t-eyebrow">
          Emne: <span className="text-paper">{current?.label}</span>
        </p>
      )}

      <div className="mt-7 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-2 block text-[15px] font-medium">
            {f.name}
          </label>
          <input id="c-name" name="name" type="text" autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="c-company" className="mb-2 block text-[15px] font-medium">
            {f.company}
          </label>
          <input id="c-company" name="company" type="text" autoComplete="organization" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-message" className="mb-2 block text-[15px] font-medium">
            {f.message}
          </label>
          <textarea
            id="c-message"
            name="message"
            required
            placeholder={f.messagePlaceholder}
            className="field"
          />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary shrink-0 cursor-pointer whitespace-nowrap">
          {f.submit}
          <Arrow />
        </button>
        <p className="max-w-[44ch] text-[13px] leading-snug text-paper/70">{f.note}</p>
      </div>

      <p className="mt-4 text-[14px] leading-snug text-paper/80">
        {f.noMail}{' '}
        <button type="button" onClick={onCopy} className="link-underline hit cursor-pointer font-medium text-paper">
          {f.copy}
        </button>
      </p>

      <p role="status" aria-live="polite" className="mt-5 text-[14px] leading-snug text-paper/85 empty:hidden">
        {note && (
          <span key={note} className="swap-in block">
            {note === 'opened' ? f.opened : note === 'copied' ? f.copied : f.copyFailed}{' '}
            <a href={`mailto:${site.email}`} className="link-underline break-all text-paper">
              {site.email}
            </a>
            .
          </span>
        )}
      </p>
    </form>
  )
}

/**
 * @param topic       emne, der er valgt på forhånd
 * @param selectable  true: kunden kan skifte emne (siden /kontakt/)
 */
export default function Kontakt({
  topic: initial = 'andet',
  selectable = false,
  title = kontakt.title,
  body = kontakt.body,
  eyebrow = kontakt.eyebrow,
}) {
  // Et emne i adresselinjen (?emne=seo) vælger det på forhånd. Kunden kan skifte det.
  const search = useSearch()
  const [picked, setTopic] = useState(null)
  const wanted = new URLSearchParams(search).get('emne')
  const fromUrl = selectable && topics.some((t) => t.id === wanted) ? wanted : null
  const topic = picked ?? fromUrl ?? initial

  return (
    <section id={kontakt.id} className="sheet on-dark bg-ink text-paper">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-14 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <p className="t-eyebrow t-eyebrow-accent">{eyebrow}</p>
            <h2 className="t-display t-h2 mt-5">{title}</h2>
            <p className="t-lead mt-7 max-w-[44ch] text-paper/80">{body}</p>

            <dl className="mt-10 border-t border-paper/25">
              <div className="border-b border-paper/15 py-5">
                <dt className="t-eyebrow">E-mail</dt>
                <dd className="mt-1.5 text-[18px]">
                  <a href={`mailto:${site.email}`} className="link-underline hit break-all">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div className="border-b border-paper/15 py-5">
                <dt className="t-eyebrow">{kontakt.phoneLabel}</dt>
                <dd className="mt-1.5 text-[18px]">
                  <a href={`tel:${site.phoneHref}`} className="link-underline hit">
                    +45 {site.phone}
                  </a>
                </dd>
              </div>
              <div className="border-b border-paper/15 py-5">
                <dt className="t-eyebrow">Sted</dt>
                <dd className="mt-1.5 text-[18px]">{site.place}</dd>
              </div>
            </dl>
          </div>

          <div data-reveal style={{ '--d': '100ms' }} className="lg:col-span-7">
            <Form topic={topic} setTopic={setTopic} selectable={selectable} />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * KORT KONTAKT (forsiden): en rolig afslutning med de direkte veje, og et
 * link til hele kontaktsiden. Selve formularen ligger på /kontakt/.
 */
export function ContactCta() {
  return (
    <section id="kontakt" className="sheet on-dark bg-ink text-paper">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-end">
          <div data-reveal className="lg:col-span-7">
            <p className="t-eyebrow t-eyebrow-accent">{kontakt.eyebrow}</p>
            <h2 className="t-display t-hero mt-5 max-w-[16ch]">{kontakt.ctaTitle}</h2>
            <p className="t-lead mt-7 max-w-[46ch] text-paper/80">{kontakt.bodyShort}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={paths.kontakt} className="btn btn-primary">
                Beskriv din opgave
                <Arrow />
              </a>
              <a href={paths.prisberegner} className="btn btn-ghost">
                Beregn din hjemmesidepris
              </a>
            </div>
          </div>

          <dl data-reveal style={{ '--d': '100ms' }} className="border-t border-paper/25 lg:col-span-4 lg:col-start-9">
            <div className="border-b border-paper/15 py-5">
              <dt className="t-eyebrow">E-mail</dt>
              <dd className="mt-1.5 text-[18px]">
                <a href={`mailto:${site.email}`} className="link-underline hit break-all">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="border-b border-paper/15 py-5">
              <dt className="t-eyebrow">{kontakt.phoneLabel}</dt>
              <dd className="mt-1.5 text-[18px]">
                <a href={`tel:${site.phoneHref}`} className="link-underline hit">
                  +45 {site.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
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
