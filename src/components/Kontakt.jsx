import { useCallback, useState } from 'react'
import { inquiry, kontakt, paths, site, topics } from '../content.js'
import { useInquiryForm } from '../useInquiryForm.js'
import { useSearch } from '../useSearch.js'
import { ErrorSummary, FieldError, Honeypot, SendResult } from './FormBits.jsx'
import { Arrow } from './Shots.jsx'

/**
 * KONTAKT
 *
 * Sidens sidste flade: koksgrå, så den læses som afslutningen. Bruges på
 * /kontakt/ (med valg af emne) og nederst på hver ydelsesside (med emnet
 * valgt på forhånd og låst, så en henvendelse om SEO aldrig får en
 * hjemmesidepris eller et forkert emne).
 *
 * Formularen sender direkte til /api/kontakt (worker/index.js) og viser først
 * "sendt", når serveren har accepteret beskeden. Er afsendelsen ikke sat op
 * eller fejler den, står det, at beskeden IKKE er sendt, og mailprogram og
 * kopiering tilbydes som reserve (FormBits.jsx). Mail og telefon virker altid,
 * også uden JavaScript.
 */
function Form({ topic, setTopic, selectable }) {
  const f = kontakt.form
  const current = topics.find((t) => t.id === topic)

  const read = useCallback(
    (d) => ({
      source: 'kontakt',
      topic,
      name: d.get('name'),
      email: d.get('email'),
      phone: d.get('phone'),
      company: d.get('company'),
      message: d.get('message'),
    }),
    [topic],
  )
  const { form, status, errors, note, tooFast, submit, openMail, copy } = useInquiryForm({
    read,
    messageRequired: true,
  })
  const sending = status === 'sending'
  const fieldProps = (name) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `c-${name}-error` : undefined,
  })

  return (
    <form
      ref={form}
      onSubmit={submit}
      noValidate
      className="relative rounded-[var(--radius-panel)] border border-paper/20 bg-paper/[0.04] p-6 md:p-9"
    >
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

      <ErrorSummary errors={errors} />

      <div className="mt-7 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-2 block text-[15px] font-medium">
            {f.name}
          </label>
          <input id="c-name" name="name" type="text" autoComplete="name" className="field" {...fieldProps('name')} />
          <FieldError id="c-name-error" message={errors.name} />
        </div>
        <div>
          <label htmlFor="c-email" className="mb-2 block text-[15px] font-medium">
            {f.email}
          </label>
          <input id="c-email" name="email" type="email" autoComplete="email" className="field" {...fieldProps('email')} />
          <FieldError id="c-email-error" message={errors.email} />
        </div>
        <div>
          <label htmlFor="c-phone" className="mb-2 block text-[15px] font-medium">
            {f.phone}
          </label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" className="field" {...fieldProps('phone')} />
          <FieldError id="c-phone-error" message={errors.phone} />
        </div>
        <div>
          <label htmlFor="c-company" className="mb-2 block text-[15px] font-medium">
            {f.company}
          </label>
          <input id="c-company" name="company" type="text" autoComplete="organization" className="field" {...fieldProps('company')} />
          <FieldError id="c-company-error" message={errors.company} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-message" className="mb-2 block text-[15px] font-medium">
            {f.message}
          </label>
          <textarea
            id="c-message"
            name="message"
            placeholder={f.messagePlaceholder}
            className="field"
            {...fieldProps('message')}
          />
          <FieldError id="c-message-error" message={errors.message} />
        </div>
      </div>
      <Honeypot />

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending || status === 'sent'}
          className="btn btn-primary shrink-0 cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? inquiry.sending : f.submit}
          {!sending && <Arrow />}
        </button>
        <p className="max-w-[44ch] text-[13px] leading-snug text-paper/70">{f.note}</p>
      </div>

      <SendResult status={status} note={note} tooFast={tooFast} onOpenMail={openMail} onCopy={copy} />
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
              <a href={paths.beregner} className="btn btn-ghost">
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
