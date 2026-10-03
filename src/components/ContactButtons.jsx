import { contact } from '../data/pricing.js'
import { cta, links } from '../data/texts.js'

/**
 * "Ring" og "Mail" — sidens vigtigste knapper. Ring viser altid nummeret,
 * så det også kan læses og tastes af, og begge er almindelige links
 * (tel:/mailto:/sms:), der virker uden JavaScript.
 *
 * `stack` lægger alle knapper på hver sin linje på mobil.
 * `sms` tilføjer en tredje knap; `smsText` og `mailSubject`/`mailBody`
 * forudfylder beskeden (bruges af prisberegneren).
 */
export default function ContactButtons({
  sms = false,
  smsText,
  mailSubject,
  mailBody,
  writeLabel = cta.write,
  className = '',
  stretch = false,
  stack = false,
}) {
  const query = [
    mailSubject && `subject=${encodeURIComponent(mailSubject)}`,
    mailBody && `body=${encodeURIComponent(mailBody)}`,
  ]
    .filter(Boolean)
    .join('&')
  const mail = query ? `${links.mail}?${query}` : links.mail
  // stretch (mobil): "Ring" fylder hele bredden, så nummeret aldrig brydes.
  // Med SMS deler de to andre knapper rækken under; uden står "Mail" alene.
  const box = stretch ? 'grid grid-cols-2 gap-3 sm:flex sm:flex-wrap' : 'flex flex-wrap gap-3'
  const wide = stretch ? 'col-span-2 sm:col-auto' : ''
  const rest = stretch && (!sms || stack) ? 'col-span-2 sm:col-auto' : ''

  return (
    <div className={`${box} ${className}`}>
      <a href={links.tel} className={`btn btn-primary whitespace-nowrap ${wide}`}>
        <PhoneIcon />
        <span>
          {cta.call} <span className="tabular-nums">{contact.phone}</span>
        </span>
      </a>
      {sms && (
        <a href={links.sms(smsText)} className={`btn btn-ghost ${stack ? rest : ''}`}>
          <SmsIcon />
          {cta.sms}
        </a>
      )}
      <a href={mail} className={`btn btn-ghost ${rest}`}>
        <MailIcon />
        {writeLabel}
      </a>
    </div>
  )
}

const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 20 20',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function PhoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6.6 2.8 4.4 3.3a1.6 1.6 0 0 0-1.2 1.7c.6 6.1 5.7 11.2 11.8 11.8a1.6 1.6 0 0 0 1.7-1.2l.5-2.2a1 1 0 0 0-.6-1.1l-2.6-1.1a1 1 0 0 0-1.1.3l-1 1.2a9 9 0 0 1-4.4-4.4l1.2-1a1 1 0 0 0 .3-1.1L7.7 3.4a1 1 0 0 0-1.1-.6Z" />
    </svg>
  )
}

export function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2.75" y="4.25" width="14.5" height="11.5" rx="1.5" />
      <path d="m3.5 5.5 6.5 5 6.5-5" />
    </svg>
  )
}

export function SmsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4.5 3.75h11a1.75 1.75 0 0 1 1.75 1.75v7a1.75 1.75 0 0 1-1.75 1.75H9l-3.75 3v-3H4.5a1.75 1.75 0 0 1-1.75-1.75v-7A1.75 1.75 0 0 1 4.5 3.75Z" />
    </svg>
  )
}
