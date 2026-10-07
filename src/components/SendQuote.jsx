import { useEffect, useId, useRef, useState } from 'react'
import { contact } from '../data/pricing.js'
import { cta, links, paths } from '../data/texts.js'
import { inquiry, sendInquiry, validContact } from '../inquiry.js'
import { PhoneIcon, SmsIcon } from './ContactButtons.jsx'
import ErrorText from './ErrorText.jsx'

/** Turnstiles site key sættes ved bygget (Cloudflare Builds: VITE_TURNSTILE_SITE_KEY). Tom = ingen Turnstile. */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * "SEND DIN FORESPØRGSEL" — slutningen af prisberegneren (samme komponent på alle
 * sider med beregneren).
 *
 * Et felt til mail eller telefon, et valgfrit felt til navn/virksomhed og
 * "Send til Ronny". Ring og SMS står under som sekundære links. Formularen
 * sender linket med valgene; serveren regner selv opsummeringen ud fra det.
 *
 * Tak vises KUN, når serveren har svaret OK (sendInquiry). Ved fejl står
 * telefonnummeret. Skjult honeypot-felt ("website"). Turnstile (usynlig)
 * hentes først, når nogen begynder at udfylde formularen, så den ikke koster
 * noget ved indlæsning; uden site key bruges den ikke.
 */
export default function SendQuote({ smsText, link }) {
  const id = useId()
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [invalid, setInvalid] = useState(false)
  const contactRef = useRef(null)
  const doneRef = useRef(null)
  const token = useTurnstile(id)

  useEffect(() => {
    if (status === 'sent' || status === 'failed') doneRef.current?.focus()
  }, [status])

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    const data = new FormData(event.currentTarget)
    const value = String(data.get('contact') ?? '').trim()
    if (!validContact(value)) {
      setInvalid(true)
      contactRef.current?.focus()
      return
    }
    setInvalid(false)
    setStatus('sending')
    const ok = await sendInquiry({
      contact: value,
      name: data.get('name'),
      website: data.get('website'),
      link: link ?? `${window.location.pathname}${window.location.search}`,
      turnstile: SITE_KEY ? await token.get() : '',
    })
    setStatus(ok ? 'sent' : 'failed')
  }

  if (status === 'sent') {
    return (
      <div className="send mt-8">
        <p ref={doneRef} tabIndex={-1} role="status" className="t-display t-h4 outline-none">
          {inquiry.thanks}
        </p>
      </div>
    )
  }

  const errorId = `${id}-fejl`
  return (
    <div className="send mt-8">
      <h3 className="t-display t-h4">{inquiry.title}</h3>
      <p className="t-body mt-2 max-w-[52ch] text-[15px]">{inquiry.intro}</p>
      <form onSubmit={submit} onFocus={token.load} noValidate className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor={`${id}-kontakt`} className="block text-[15px] font-medium">
            {inquiry.contactLabel}
          </label>
          <input
            ref={contactRef}
            id={`${id}-kontakt`}
            name="contact"
            type="text"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={200}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={() => invalid && setInvalid(false)}
            className="field mt-2"
          />
          {invalid && (
            <ErrorText id={errorId} className="mt-2 text-[14px]">
              {inquiry.invalid}
            </ErrorText>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-navn`} className="block text-[15px] font-medium">
            {inquiry.nameLabel} <span className="font-normal text-muted">{inquiry.optional}</span>
          </label>
          <input id={`${id}-navn`} name="name" type="text" autoComplete="organization" maxLength={160} className="field mt-2" />
        </div>
        {/* Honeypot: skjult for mennesker og skærmlæsere; en robot, der udfylder den, får intet sendt. */}
        <div className="send-trap" aria-hidden="true">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div>
          <button type="submit" className="btn btn-cta w-full sm:w-auto" disabled={status === 'sending'}>
            {status === 'sending' ? inquiry.sending : inquiry.submit}
          </button>
          <p className="t-body mt-2 text-[14px]">
            {inquiry.privacy}{' '}
            <a href={paths.privatliv} className="link-underline">
              {inquiry.privacyLink}
            </a>
          </p>
        </div>
        {status === 'failed' && (
          <ErrorText ref={doneRef} tabIndex={-1} role="alert" className="text-[15px] outline-none">
            {inquiry.failed}{' '}
            <a href={links.tel} className="link-underline whitespace-nowrap tabular-nums">
              {contact.phone}
            </a>
            {inquiry.failedAfter}
          </ErrorText>
        )}
      </form>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
        <a href={links.tel} className="calc-link inline-flex items-center gap-2 no-underline">
          <PhoneIcon />
          <span className="underline decoration-rule underline-offset-4">
            {cta.call} <span className="tabular-nums">{contact.phone}</span>
          </span>
        </a>
        <a href={links.sms(smsText)} className="calc-link inline-flex items-center gap-2 no-underline">
          <SmsIcon />
          <span className="underline decoration-rule underline-offset-4">{cta.sms}</span>
        </a>
      </div>
      <div id={`${id}-turnstile`} className="send-turnstile" />
    </div>
  )
}

/**
 * Usynlig Turnstile, hentet først ved fokus i formularen. `get()` venter på
 * en token (højst 8 s); uden en token sender formularen alligevel, og serveren
 * afviser den, hvis Turnstile er slået til på serveren (kunden ser da fejlen med nummeret).
 */
function useTurnstile(id) {
  const state = useRef({ loading: false, widget: null, token: '', waiters: [] })
  const load = () => {
    const s = state.current
    if (!SITE_KEY || s.loading) return
    s.loading = true
    window.onTurnstileLoad = () => {
      s.widget = window.turnstile.render(`#${CSS.escape(`${id}-turnstile`)}`, {
        sitekey: SITE_KEY,
        callback: (t) => {
          s.token = t
          s.waiters.splice(0).forEach((fn) => fn(t))
        },
      })
    }
    const script = document.createElement('script')
    script.src = `${TURNSTILE_SRC}&onload=onTurnstileLoad`
    script.async = true
    document.head.append(script)
  }
  /** En token kan kun bruges én gang: den tages, og widgetten nulstilles til et nyt forsøg. */
  const get = async () => {
    load()
    const s = state.current
    const t =
      s.token ||
      (await new Promise((resolve) => {
        s.waiters.push(resolve)
        setTimeout(() => resolve(''), 8000)
      }))
    s.token = ''
    if (s.widget !== null) window.turnstile?.reset(s.widget)
    return t
  }
  return { load, get }
}
