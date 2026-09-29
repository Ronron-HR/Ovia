import { useState } from 'react'
import { composeMail, footer, kontakt, legal, site, topics } from '../content.js'
import { setTopic, useTopic } from '../topic.js'
import { Arrow } from './Shots.jsx'

/**
 * KONTAKT
 *
 * Sidens sidste flade: koksgrå, så den læses som afslutningen. Næste skridt er
 * tydeligt: vælg emne, skriv et par linjer og tryk på knappen.
 *
 * Der findes ingen formularbackend, så formularen sender ikke noget selv: den
 * samler beskeden i en mail og åbner besøgendes mailapp (mailto). Derfor viser
 * den aldrig en "sendt"-besked, kun en neutral note om, at mailappen er åbnet,
 * og adressen til dem, hvor mailappen ikke reagerer. Mail og telefon virker
 * altid, også uden JavaScript. Ydelsesknapperne forvælger emnet (topic.js).
 */
function Form() {
  const topic = useTopic()
  const [opened, setOpened] = useState(false)
  const f = kontakt.form

  const onSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    window.location.href = composeMail({
      topic,
      name: String(data.get('name') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    })
    setOpened(true)
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-panel)] border border-paper/20 bg-paper/[0.04] p-6 md:p-9">
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

      <p role="status" aria-live="polite" className="mt-5 text-[14px] leading-snug text-paper/85 empty:hidden">
        {opened && (
          <span className="swap-in block">
            {f.opened}{' '}
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

export default function Kontakt() {
  return (
    <section id={kontakt.id} className="sheet on-dark bg-ink text-paper">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-14 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <p className="t-eyebrow t-eyebrow-accent">{kontakt.eyebrow}</p>
            <h2 className="t-display t-hero mt-5">{kontakt.title}</h2>
            <p className="t-lead mt-7 max-w-[44ch] text-paper/80">{kontakt.body}</p>

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
            <Form />
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="on-dark bg-ink text-[13px] leading-relaxed text-paper/70">
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
                <a href={link.href} className="link-underline hit inline-block text-paper/85">
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
