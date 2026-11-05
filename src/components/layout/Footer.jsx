import { contact, links, navLinks, paths } from '../../data/site.js'
import Logo from '../ui/Logo.jsx'

const row = 'flex min-h-12 items-center no-underline'

// Rækkefølgen i designet: to kolonner, læst række for række.
const order = ['Hjemmeside', 'Priser', 'Marketing', 'Eksempler', 'Booking & Google']

/** Footer uden skyline: logo, kontakt, links og ophavsret. */
export default function Footer() {
  const items = [...order.map((label) => navLinks.find((l) => l.label === label)), { label: 'Privatlivspolitik', href: paths.privatliv }]
  return (
    <footer className="bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 pt-12 pb-10 md:grid-cols-[4fr_3fr_3fr_2fr] md:gap-10 md:px-14 md:pt-[72px] md:pb-14">
        <Logo size={72} className="md:!h-24 md:!w-24" />
        <div className="flex flex-col gap-1 text-[15px]">
          <a href={links.tel} className={`${row} whitespace-nowrap`}>
            {contact.phone}
          </a>
          <a href={links.mail} className={row}>
            {contact.email}
          </a>
        </div>
        <nav aria-label="Sider" className="grid grid-cols-2 gap-x-6 text-[15px]">
          {items.map((l) => (
            <a key={l.href} href={l.href} className={`${row} whitespace-nowrap`}>
              {l.label}
            </a>
          ))}
        </nav>
        <span className="self-end text-sm text-muted-2">© 2026 OviaSpecs</span>
      </div>
    </footer>
  )
}
