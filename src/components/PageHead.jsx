/**
 * OVERSKRIFT PÅ EN UNDERSIDE
 *
 * Mærkat, stor overskrift, kort indledning og eventuelt knapper. Ligger på
 * papir under den faste navigation (derfor toppadding fra --nav-h). `under`
 * gør plads i bunden, hvis næste sektion er et ark (.sheet), der skubber ind
 * over denne.
 */
export default function PageHead({ eyebrow, title, lead, children, aside, under = false }) {
  return (
    <section
      id="top"
      className={`bg-paper pt-[calc(var(--nav-h)+40px)] pb-14 md:pt-[calc(var(--nav-h)+72px)] md:pb-20 ${under ? 'under-sheet' : ''}`}
      style={under ? { '--pad-b': '3.5rem' } : undefined}
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-end">
          <div className={aside ? 'lg:col-span-7' : 'lg:col-span-9'}>
            <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
              {eyebrow}
            </p>
            <h1 className="t-display t-hero mt-5 max-w-[20ch]">
              <span className="mask">
                <span className="hero-rise">{title}</span>
              </span>
            </h1>
            {lead && (
              <p data-hero="fade" style={{ '--d': '160ms' }} className="t-body t-lead mt-6 max-w-[54ch]">
                {lead}
              </p>
            )}
            {children && (
              <div
                data-hero="fade"
                style={{ '--d': '260ms' }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                {children}
              </div>
            )}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  )
}
