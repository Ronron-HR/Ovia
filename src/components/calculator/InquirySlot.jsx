import { lazy, Suspense } from 'react'

/**
 * Forespørgselsformularen hentes først, når opsummeringen vises: forsidens JS vokser ikke af den.
 * Pladsholderen har formularens højde, så siden ikke hopper, når koden er kommet.
 */
const InquiryForm = lazy(() => import('./InquiryForm.jsx'))

export default function InquirySlot(props) {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Henter formularen" className="min-h-[640px] bg-surface" />}>
      <InquiryForm {...props} />
    </Suspense>
  )
}
