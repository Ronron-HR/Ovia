/**
 * Sidens ikoner: én stil overalt. Inline SVG, 24 x 24, streg 1,75, runde
 * ender og hjørner, ingen fyld, currentColor (farven sættes udefra), skjult
 * for skærmlæsere (teksten ved siden af bærer meningen). Ingen
 * ikonbibliotek-afhængighed.
 *
 *   <Icon name="phone" />            18 px
 *   <Icon name="pin" size={24} className="text-cta" />
 *
 * Tegningerne er egne og enkle: en kurve pr. form, ingen detaljer under 1,75 px.
 * Tilføj et ikon her og ikke som løs SVG i en komponent.
 */
const PATHS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-up-right': <path d="M7 17 17 7M9 7h8v8" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  phone: (
    <path d="M7.9 3.4 5.3 4a1.9 1.9 0 0 0-1.4 2c.7 7.3 6.8 13.4 14.2 14.2a1.9 1.9 0 0 0 2-1.4l.6-2.6a1.2 1.2 0 0 0-.7-1.3l-3.1-1.3a1.2 1.2 0 0 0-1.3.4l-1.2 1.4a10.8 10.8 0 0 1-5.3-5.3l1.4-1.2a1.2 1.2 0 0 0 .4-1.3L9.2 4.1a1.2 1.2 0 0 0-1.3-.7Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 8 6 8-6" />
    </>
  ),
  sms: <path d="M5 4.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4.5 3.5V17.5H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />,
  browser: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 9.5h18M7 7h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="4" width="7" height="5" rx="1.5" />
      <rect x="14" y="4" width="7" height="5" rx="1.5" />
      <rect x="8.5" y="15" width="7" height="5" rx="1.5" />
      <path d="M6.5 9v1.5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9M12 12.5V15" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" />
    </>
  ),
  inbox: <path d="M4 13 6.5 6.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Zm0 0h4.5l1 2.5h5l1-2.5H20" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8h.01" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.5h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.5-3.6 3.3-5.5 7-5.5s6.5 1.9 7 5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" />
      <path d="m9 12 2.2 2.2L15 10.4" />
    </>
  ),
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.75 }) {
  const shape = PATHS[name]
  if (!shape) return null
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`.trim()}
    >
      {shape}
    </svg>
  )
}

export const iconNames = Object.keys(PATHS)
