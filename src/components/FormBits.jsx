import { inquiry, site } from '../content.js'

/**
 * Små dele, som begge formularer deler (mørk flade).
 */

/** Skjult felt for spam: mennesker ser og rører det ikke, simple robotter udfylder det. */
export function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Lad feltet stå tomt
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  )
}

/** Fejl ved et felt. `id` bruges af feltets aria-describedby. */
export function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="field-error mt-2 text-[14px] leading-snug">
      {message}
    </p>
  )
}

/** Samlet oversigt over fejl øverst i formularen (læses højt af skærmlæsere). */
export function ErrorSummary({ errors }) {
  const list = Object.values(errors)
  if (!list.length) return null
  return (
    <div role="alert" className="field-error-box mt-6 rounded-md px-4 py-3 text-[14px] leading-snug">
      <p className="font-medium">{inquiry.errorSummary}</p>
      <ul className="mt-1 list-disc pl-5">
        {list.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Resultatet af en afsendelse. "Sendt" vises kun ved status 'sent'. Ved
 * 'unavailable' og 'failed' står det tydeligt, at beskeden IKKE er sendt, og
 * kunden får mailprogram og kopiering som reserve.
 */
export function SendResult({ status, note, tooFast, onOpenMail, onCopy }) {
  if (status === 'sent') {
    return (
      <div role="status" className="swap-in mt-7 rounded-md border border-paper/40 px-5 py-4">
        <p className="t-display text-[22px] leading-tight">{inquiry.sentTitle}</p>
        <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-paper/85">{inquiry.sent}</p>
      </div>
    )
  }

  if (status === 'unavailable' || status === 'failed') {
    const text = tooFast ? inquiry.tooFast : status === 'unavailable' ? inquiry.unavailable : inquiry.failed
    return (
      <div role="alert" className="swap-in mt-7 rounded-md border border-paper/40 px-5 py-4">
        <p className="font-medium">{inquiry.fallbackTitle}</p>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-paper/85">
          {text}{' '}
          <a href={`mailto:${site.email}`} className="link-underline break-all text-paper">
            {site.email}
          </a>
          .
        </p>
        {!tooFast && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={onOpenMail} className="btn btn-ghost cursor-pointer">
              {inquiry.openMail}
            </button>
            <button type="button" onClick={onCopy} className="btn btn-text cursor-pointer">
              {inquiry.copy}
            </button>
          </div>
        )}
        <p role="status" aria-live="polite" className="mt-3 text-[14px] leading-snug text-paper/85 empty:hidden">
          {note && (
            <span key={note} className="swap-in block">
              {inquiry[note]}{' '}
              <a href={`mailto:${site.email}`} className="link-underline break-all text-paper">
                {site.email}
              </a>
              .
            </span>
          )}
        </p>
      </div>
    )
  }

  return null
}
