/* =========================================================================
   Kontakt, adresser og navigation. Priser står i prices.json, ikke her.
   ========================================================================= */

const NBSP = ' '

export const contact = {
  name: 'Ronny Hong',
  /** Hårde mellemrum, så nummeret aldrig brydes over to linjer. */
  phone: `53${NBSP}61${NBSP}36${NBSP}99`,
  phoneHref: '+4553613699',
  email: 'kontakt@oviaspecs.com',
}

export const links = {
  tel: `tel:${contact.phoneHref}`,
  mail: `mailto:${contact.email}`,
  sms: (body) => `sms:${contact.phoneHref}${body ? `?body=${encodeURIComponent(body)}` : ''}`,
}

/** Sidernes adresser (med efterstillet skråstreg, som de forudrenderede filer). */
export const paths = {
  home: '/',
  hjemmeside: '/hjemmeside/',
  marketing: '/marketing/',
  bookingGoogle: '/booking-google/',
  priser: '/priser/',
  demoer: '/demoer/',
  privatliv: '/privatlivspolitik/',
  /** Beregneren bor på forsiden. */
  beregner: '/#prisberegner',
}

export const navLinks = [
  { label: 'Hjemmeside', href: paths.hjemmeside },
  { label: 'Marketing', href: paths.marketing },
  { label: 'Booking & Google', href: paths.bookingGoogle },
  { label: 'Priser', href: paths.priser },
  { label: 'Eksempler', href: paths.demoer },
]

/** Hvor længe en forespørgsel gemmes i D1, før workeren sletter den (også i privatlivspolitikken). */
export const retentionMonths = 12

export const flags = {
  /**
   * Palmy-casen er skjult (mangler adresse til "Besøg siden"). Komponenten
   * (PalmyCase i Examples.jsx) er bevaret; sæt til true for at vise den.
   */
  showPalmy: false,
}

/** Er adressen den aktuelle side? Sammenlignes uden efterstillet skråstreg. */
export const isCurrent = (path, href) => {
  const clean = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p)
  return clean(path) === clean(href)
}
