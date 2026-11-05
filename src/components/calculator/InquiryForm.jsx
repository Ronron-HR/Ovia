import { useId, useRef, useState } from 'react'
import { LIMITS, normalize, sendInquiry, validate } from '../../inquiry.js'
import { turnstileEnabled, turnstileToken } from '../../lib/turnstile.js'
import { contact, links, paths } from '../../data/site.js'
import { smsHref } from '../../lib/receipt.js'
import { ReceiptLine, Total } from './parts.jsx'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'
const field =
  'block w-full min-h-14 rounded-none border-0 bg-surface px-4 text-base text-ink placeholder:text-muted-2 aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-ink'

const isMobile = () => window.matchMedia('(max-width: 759.98px)').matches

function Field({ label, name, error, hint, children }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-medium">
        {label}
        {hint && <span className="font-normal text-muted-2"> {hint}</span>}
      </label>
      {children({ id, describedBy: error ? `${id}-e` : undefined, invalid: Boolean(error) })}
      {error && (
        <p id={`${id}-e`} role="alert" className="m-0 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Forespørgselsformularen på opsummeringen. Lazy-loadet (InquirySlot.jsx), så den ikke vejer på forsiden.
 *
 * Kvitteringen og del-linket sendes automatisk med (kunden skriver dem ikke); workeren regner priserne ud
 * igen af valgene i linket. Tilstande: sender (spinner), sendt (tak + kvittering), fejl (forklaring; Ring og
 * SMS står under formularen hele tiden). På mobil får siden luft under formularen, mens tastaturet er oppe,
 * så Send-knappen ikke dækkes.
 */
export default function InquiryForm({ receipt, hrefs }) {
  const [values, setValues] = useState({ name: '', phone: '', email: '', company: '', message: '', website: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [oldLink, setOldLink] = useState(false) // serveren siger, at siden er en gammel version (før pakkerne)
  const [typing, setTyping] = useState(false)
  const [sentName, setSentName] = useState('')
  const formRef = useRef(null)
  const tsRef = useRef(null)
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const p = normalize({ ...values, link: hrefs.url })
    const bad = validate(p)
    if (bad) {
      setErrors({ [bad.field]: bad.message })
      formRef.current?.querySelector(`[name="${bad.field}"]`)?.focus()
      return
    }
    setErrors({})
    setStatus('sending')
    let token = ''
    if (turnstileEnabled) {
      try {
        token = await turnstileToken(tsRef.current)
      } catch {
        // Uden token svarer workeren 403, hvis Turnstile er slået til hos den; ellers sendes den uden.
      }
    }
    const res = await sendInquiry({ ...p, website: values.website, turnstile: token })
    if (res.ok) {
      setSentName(p.name)
      setStatus('sent')
    } else {
      setOldLink(res.error === 'old_selection')
      setStatus('error')
    }
  }

  // Mobil: det felt, man skriver i, rulles ind midt på skærmen, og siden får luft under formularen, mens tastaturet er oppe.
  const onFocus = (e) => {
    setTyping(true)
    if (isMobile() && /INPUT|TEXTAREA/.test(e.target.tagName)) {
      const el = e.target
      setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
    }
  }
  const onBlur = () =>
    setTimeout(() => {
      if (!formRef.current?.contains(document.activeElement)) setTyping(false)
    }, 150)

  if (status === 'sent') {
    return (
      <div className="flex flex-col gap-4">
        <div role="status" className="bg-surface p-5 md:p-7">
          <h3 className="text-[clamp(24px,7vw,36px)] leading-none tracking-[-0.03em]">Tak, {sentName}.</h3>
          <p className="mt-3 mb-0 text-base leading-normal">Vi vender tilbage inden for 24 timer.</p>
          <div className="mt-5">
            {receipt.all.map((l) => (
              <ReceiptLine key={l.key + l.pkg} line={l} dark={false} priceSize={13} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px]">Én gang</span>
              <Total value={receipt.o} unit="kr." size={26} unitSize={12} gap={5} unitPad={2} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px]">Hver måned</span>
              <Total value={receipt.m} unit="kr./md." size={26} unitSize={12} gap={5} unitPad={2} />
            </div>
          </div>
          <p className="mt-3 mb-0 text-[13px]">Alle priser er ekskl. moms</p>
        </div>
      </div>
    )
  }

  return (
    <div className={typing ? 'pb-[50svh] md:pb-0' : undefined}>
      <form ref={formRef} onSubmit={submit} onFocus={onFocus} onBlur={onBlur} noValidate className="flex flex-col gap-5" aria-describedby="inq-intro">
        <p id="inq-intro" className="m-0 text-[15px] leading-normal text-muted-2">
          Dine valg og priser sendes med. Skriv, hvordan vi når jer.
        </p>

        <Field label="Navn" error={errors.name}>
          {({ id, describedBy, invalid }) => (
            <input id={id} name="name" type="text" autoComplete="name" required maxLength={LIMITS.name} value={values.name} onChange={set('name')} aria-describedby={describedBy} aria-invalid={invalid} className={field} />
          )}
        </Field>

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-2 p-0 text-[15px] font-medium">
            Telefon eller mail <span className="font-normal text-muted-2">(mindst én)</span>
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Telefon" error={errors.phone}>
              {({ id, describedBy, invalid }) => (
                <input id={id} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phone} value={values.phone} onChange={set('phone')} aria-describedby={describedBy} aria-invalid={invalid} className={field} />
              )}
            </Field>
            <Field label="Mail" error={errors.email}>
              {({ id, describedBy, invalid }) => (
                <input id={id} name="email" type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email} value={values.email} onChange={set('email')} aria-describedby={describedBy} aria-invalid={invalid} className={field} />
              )}
            </Field>
          </div>
        </fieldset>

        <Field label="Virksomhed" hint="(valgfri)">
          {({ id }) => <input id={id} name="company" type="text" autoComplete="organization" maxLength={LIMITS.company} value={values.company} onChange={set('company')} className={field} />}
        </Field>

        <Field label="Besked" hint="(valgfri)">
          {({ id }) => (
            <textarea id={id} name="message" rows={4} maxLength={LIMITS.message} value={values.message} onChange={set('message')} className={`${field} min-h-[120px] py-3`} />
          )}
        </Field>

        {/* Honeypot: usynligt for mennesker og skærmlæsere. En robot udfylder det, og workeren kasserer så forespørgslen. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Lad dette felt stå tomt
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
          </label>
        </div>
        <div ref={tsRef} />

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className="btn btn-ink hov-ink-soft min-h-14 justify-center gap-3">
            {status === 'sending' ? (
              <>
                <span aria-hidden="true" className="size-4 animate-spin border-2 border-paper border-t-transparent" />
                <span>Sender …</span>
              </>
            ) : (
              <>
                <span>Send mine valg</span>
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
          <p className="m-0 text-[15px]">Svar inden for 24 timer.</p>
          <p className="m-0 text-[13px] leading-normal text-muted-2">
            Dine oplysninger bruges kun til at svare dig. <a href={paths.privatliv}>Læs privatlivspolitikken</a>.
          </p>
        </div>

        <div aria-live="polite">
          {status === 'error' && (
            <div role="alert" className="dark-zone bg-ink p-5 text-paper">
              <p className="m-0 text-base font-semibold">Det blev ikke sendt.</p>
              {oldLink ? (
                <p className="mt-2 mb-0 text-[15px] leading-normal">
                  Beregneren er opdateret med nye pakker. <a href="/">Åbn siden igen</a> og vælg dit tilbud på ny, eller brug Ring eller SMS herunder.
                </p>
              ) : (
                <p className="mt-2 mb-0 text-[15px] leading-normal">
                  Dine valg og din besked står stadig her. Prøv igen, eller brug Ring eller SMS herunder. Du kan også sende valgene fra din egen mailapp:{' '}
                  <a href={hrefs.mail}>åbn mail</a>.
                </p>
              )}
            </div>
          )}
        </div>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <a href={links.tel} className="btn btn-surface min-h-14 justify-center text-[15px]">
          Ring {contact.phone}
        </a>
        <a href={smsHref(hrefs.url, contact.phoneHref)} className="btn btn-surface min-h-14 justify-center text-[15px]">
          Skriv en SMS
        </a>
      </div>
    </div>
  )
}
