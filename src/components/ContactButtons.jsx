import { contact } from '../data/pricing.js'
import { cta, links } from '../data/texts.js'
import Icon from './Icon.jsx'

/**
 * "Ring" og "Mail" — sidens vigtigste knapper. Ring viser altid nummeret,
 * så det også kan læses og tastes af, og begge er almindelige links
 * (tel:/mailto:/sms:), der virker uden JavaScript.
 *
 * `primary` gør "Ring" til den fyldte knap (bruges på den mørke kontaktflade).
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
  primary = false,
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
      <a href={links.tel} className={`btn ${primary ? 'btn-primary' : 'btn-ghost'} whitespace-nowrap ${wide}`}>
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

export const PhoneIcon = () => <Icon name="phone" />
export const MailIcon = () => <Icon name="mail" />
export const SmsIcon = () => <Icon name="sms" />
