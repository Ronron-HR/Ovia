/* =========================================================================
   Kontakt, adresser og navigation. Priser står i prices.json, ikke her.
   ========================================================================= */

const NBSP = ' '

export const contact = {
  name: 'Ronny Hong',
  cvr: '46893727',
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
  priser: '/priser/',
  cases: '/cases/',
  casePalmy: '/cases/palmy-spisested/',
  privatliv: '/privatlivspolitik/',
  /** Beregneren bor på forsiden. */
  beregner: '/#prisberegner',
  systemer: '/hjemmeside/#systemer',
}

export const navLinks = [
  { label: 'Hjemmeside', href: paths.hjemmeside },
  { label: 'Priser', href: paths.priser },
  { label: 'Cases', href: paths.cases },
]

/** Palmy Spisested: live-adressen (sitets egen canonical), brugt af casen. */
export const palmyUrl = 'https://www.palmyspisested.com/'

/** Hvor længe en forespørgsel gemmes i D1, før workeren sletter den (også i privatlivspolitikken). */
export const retentionMonths = 12

/** Sider med prisberegneren: "Se din pris" hopper til den på siden, ellers til forsiden. */
export const calcPages = [paths.home, paths.hjemmeside]

/** Er adressen den aktuelle side? Sammenlignes uden efterstillet skråstreg. */
export const isCurrent = (path, href) => {
  const clean = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p)
  return clean(path) === clean(href)
}
