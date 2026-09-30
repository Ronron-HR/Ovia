import { useCallback, useEffect, useRef, useState } from 'react'
import { composeInquiry, mailtoFromInquiry, normalize, sendForm, validateInquiry } from './inquiry.js'

/**
 * Fælles logik for formularerne (kontaktsiden og efter prisberegneren).
 *
 *   status  'idle' | 'sending' | 'sent' | 'unavailable' | 'failed'
 *   errors  fejl pr. felt (vises ved feltet; første fejl får fokus)
 *   note    'copied' | 'copyFailed' | 'mailOpened' efter reservevejen
 *   payload den sidste, validerede besked (bruges af reservevejen)
 *
 * "sent" sættes kun, når serveren har accepteret beskeden (sendForm). Er
 * afsendelsen ikke sat op, eller fejler den, er beskeden ikke sendt, og
 * formularen tilbyder mailprogram eller kopiering i stedet.
 *
 * @param read  (FormData) => rå besked (source, topic, name, …, calc)
 */
export function useInquiryForm({ read, messageRequired = false }) {
  const form = useRef(null)
  const openedAt = useRef(0)
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})
  const [note, setNote] = useState(null)
  const [tooFast, setTooFast] = useState(false)
  const [payload, setPayload] = useState(null)

  // Tidspunktet, formularen kom frem: serveren afviser beskeder, der kommer
  // alt for hurtigt (spam). Sættes først på klienten.
  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  const collect = useCallback(() => {
    const data = new FormData(form.current)
    const p = normalize(read(data))
    p.website = String(data.get('website') ?? '')
    return p
  }, [read])

  const submit = useCallback(
    async (event) => {
      event.preventDefault()
      if (status === 'sending') return
      const p = collect()
      const found = validateInquiry(p, { messageRequired })
      setErrors(found)
      setNote(null)
      setTooFast(false)
      if (Object.keys(found).length) {
        // Første fejl får fokus, så tastatur og skærmlæser lander det rigtige sted.
        const first = Object.keys(found)[0]
        form.current?.elements[first]?.focus()
        return
      }
      setPayload(p)
      setStatus('sending')
      const result = await sendForm(p, { openedAt: openedAt.current })
      if (result.status === 'invalid') {
        setErrors(result.errors)
        setStatus('idle')
        const first = Object.keys(result.errors)[0]
        form.current?.elements[first]?.focus()
        return
      }
      setTooFast(Boolean(result.tooFast))
      setStatus(result.status)
    },
    [collect, messageRequired, status],
  )

  const openMail = useCallback(() => {
    if (!payload) return
    window.location.href = mailtoFromInquiry(payload)
    setNote('mailOpened')
  }, [payload])

  const copy = useCallback(async () => {
    if (!payload) return
    const { subject, body } = composeInquiry(payload)
    try {
      await navigator.clipboard.writeText(`Emne: ${subject}\n\n${body}`)
      setNote('copied')
    } catch {
      setNote('copyFailed')
    }
  }, [payload])

  const reset = useCallback(() => {
    setStatus('idle')
    setErrors({})
    setNote(null)
  }, [])

  return { form, status, errors, note, tooFast, submit, openMail, copy, reset }
}
