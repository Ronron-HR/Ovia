import { useState } from 'react'
import { kontakt, site } from '../content.js'

/**
 * Kontaktformular mod Formspree.
 *
 * Uden JS virker den stadig: action og method står på formularen, så en
 * almindelig POST går igennem, og Formspree kvitterer på sin egen side.
 * Med JS sendes den i baggrunden, og svaret vises på stedet — samme
 * formular, to veje ind.
 *
 * Knappen er sidens andet cursor-reaktive element (signature moment 05).
 * Den flytter sig ikke selv; det er fladen bag den, der bevæger sig.
 */
export default function KontaktForm({ children }) {
  const { form } = kontakt
  const action = `https://formspree.io/f/${form.endpoint}`
  const [state, setState] = useState('idle')

  async function onSubmit(event) {
    // Uden fetch falder vi tilbage på browserens egen POST.
    if (typeof fetch !== 'function') return
    event.preventDefault()

    const data = new FormData(event.target)
    setState('sending')

    try {
      const response = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      setState(response.ok ? 'ok' : 'error')
      if (response.ok) event.target.reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'ok') {
    return (
      <p className="text-[16px] leading-relaxed text-paper" role="status">
        {form.ok}
      </p>
    )
  }

  return (
    <form action={action} method="POST" onSubmit={onSubmit} className="flex flex-col gap-6">
      <Field name="name" label={form.name} type="text" autoComplete="name" />
      <Field name="email" label={form.email} type="email" autoComplete="email" />
      <Field name="message" label={form.message} textarea />

      {/* Fælde for bots. Formspree kasserer indsendelser, hvor den er udfyldt. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {children(
          <button
            type="submit"
            disabled={state === 'sending'}
            className="btn relative inline-block bg-paper px-8 py-4 text-[15px] font-medium text-ink hover:bg-accent-bright disabled:opacity-60"
          >
            {state === 'sending' ? form.sending : form.submit}
          </button>,
        )}

        <p aria-live="polite" className="text-[14px] text-paper/60">
          {state === 'error' && (
            <>
              {form.error}{' '}
              <a href={`mailto:${site.email}`} className="link-underline text-paper">
                {site.email}
              </a>
            </>
          )}
        </p>
      </div>
    </form>
  )
}

function Field({ name, label, type = 'text', textarea = false, autoComplete }) {
  const shared =
    'mt-2 w-full border-b border-paper/25 bg-transparent py-2 text-[16px] text-paper ' +
    'outline-none transition-colors duration-200 focus:border-paper'

  return (
    <label className="block">
      <span className="t-eyebrow text-paper/50">{label}</span>
      {textarea ? (
        <textarea name={name} rows={3} required className={`${shared} resize-y`} />
      ) : (
        <input name={name} type={type} required autoComplete={autoComplete} className={shared} />
      )}
    </label>
  )
}
