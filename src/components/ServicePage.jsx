import { demoById, paths } from '../content.js'
import { flows, searchSketch } from '../sketches.js'
import { services } from '../services.js'
import BookingDemo from './BookingDemo.jsx'
import CalcStart from './CalcStart.jsx'
import DemoTeasers from './DemoTeasers.jsx'
import Faq from './Faq.jsx'
import FlowDiagram from './FlowDiagram.jsx'
import Kontakt from './Kontakt.jsx'
import PageHead from './PageHead.jsx'
import Samarbejde from './Samarbejde.jsx'
import SearchSketch from './SearchSketch.jsx'
import { Arrow } from './Shots.jsx'
import SocialSketch from './SocialSketch.jsx'

/**
 * YDELSESSIDE — én skabelon, seks sider.
 *
 * Rækkefølgen er den samme, men hver side har sin egen tekst, sit eget
 * visuelle eksempel og sine egne spørgsmål (services.*.js):
 *
 *   overskrift        det kunden har brug for, og en handling
 *   behovet           en stor sætning og to korte afsnit
 *   løsningen         grå flade: hvad jeg gør, i tre dele
 *   eksemplet         et interaktivt eller tegnet eksempel (visual)
 *   det får du        mørk flade: leverancer, afgrænsning og udgifter
 *   eksempler         hvad det kan bruges til, med link til relevante demoer
 *   sådan foregår det fire trin, siden egne
 *   spørgsmål         de vigtigste svar
 *   kontakt           en kort formular med ydelsen valgt på forhånd
 *
 * Kun hjemmesiden har en pris (via beregneren). De andre sider viser ingen
 * priser og starter et kontaktforløb i stedet, med emnet valgt og låst, så
 * en henvendelse om annoncering aldrig får en hjemmesidepris.
 */

const VISUALS = {
  booking: {
    title: 'Sådan kan et bookingflow føles',
    text: 'Prøv selv. Det er kun et eksempel: intet reserveres, og der sendes ingenting. I et rigtigt flow går kunden videre til jeres eget system.',
  },
  search: {
    title: 'Tre veje til at blive fundet',
    text: 'Når nogen søger, kan de møde jer på tre måder. Numrene i skitsen svarer til listen her.',
  },
  'flow-ads': {
    title: 'Sådan hænger en annonce sammen',
    text: 'Du sætter et budget, og annoncen vises på de søgninger, vi har valgt. Du betaler for klikkene til Google.',
  },
  social: {
    title: 'To kanaler, to formater',
    text: 'Meta viser annoncer mellem opslag fra venner og sider. TikTok viser dem som video mellem andre videoer. Formaterne kræver forskelligt materiale.',
  },
  'flow-ai': {
    title: 'Et eksempel på en automatisk sortering',
    text: 'Illustrationen viser én mulig opsætning. Hvad der giver mening at automatisere, afhænger helt af din hverdag.',
  },
}

function Need({ need }) {
  return (
    <section className="bg-paper pb-[var(--space-block)]">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 border-t border-ink pt-10 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-6">
            <p className="t-eyebrow t-eyebrow-accent">{need.eyebrow}</p>
            <h2 className="t-display t-h3 mt-4 max-w-[26ch]">{need.title}</h2>
          </div>
          <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-5 lg:col-start-8">
            {need.body.map((p) => (
              <p key={p.slice(0, 24)} className="t-body t-lead mt-0 mb-5 last:mb-0">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Solution({ solution }) {
  return (
    <section className="on-grey">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-5">
            <p className="t-eyebrow t-eyebrow-accent">{solution.eyebrow}</p>
            <h2 className="t-display t-h3 mt-4 max-w-[22ch]">{solution.title}</h2>
            <p className="t-body t-lead mt-5 max-w-[46ch]">{solution.intro}</p>
          </header>

          <dl data-reveal style={{ '--d': '80ms' }} className="border-t border-ink lg:col-span-6 lg:col-start-7">
            {solution.parts.map((part) => (
              <div key={part.title} className="border-b border-rule py-6">
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <span className="t-display t-h4">{part.title}</span>
                  {part.kind && <span className="t-eyebrow">{part.kind}</span>}
                </dt>
                <dd className="t-body mt-2 max-w-[52ch] text-[16px]">{part.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Visual({ visual }) {
  const v = VISUALS[visual]
  const wide = visual === 'flow-ads' || visual === 'flow-ai'

  return (
    <section
      id="eksempel"
      className="under-sheet bg-paper pt-[var(--space-section)]"
      style={{ '--pad-b': '5rem' }}
    >
      <div className="shell">
        {wide ? (
          <>
            <header data-reveal className="max-w-[56ch]">
              <h2 className="t-display t-h3">{v.title}</h2>
              <p className="t-body t-lead mt-4">{v.text}</p>
            </header>
            <div data-reveal className="mt-8 md:mt-10">
              <FlowDiagram flow={visual === 'flow-ads' ? flows.ads : flows.ai} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12 lg:items-start">
            <header data-reveal className="lg:col-span-5">
              <h2 className="t-display t-h3 max-w-[20ch]">{v.title}</h2>
              <p className="t-body t-lead mt-4 max-w-[44ch]">{v.text}</p>
              {visual === 'search' && (
                <ol className="mt-7 border-t border-ink">
                  {searchSketch.keys.map((k) => (
                    <li key={k.n} className="grid grid-cols-[34px_1fr] gap-x-2 border-b border-rule py-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[12px] leading-none font-medium text-white"
                      >
                        {k.n}
                      </span>
                      <span>
                        <span className="block text-[16px] font-medium">{k.title}</span>
                        <span className="t-body block text-[14px]">{k.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </header>
            <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-7">
              {visual === 'booking' && (
                <div className="backdrop">
                  <BookingDemo />
                </div>
              )}
              {visual === 'search' && <SearchSketch />}
              {visual === 'social' && <SocialSketch />}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Deliver({ data, costs }) {
  return (
    <section className="sheet on-dark bg-ink text-paper">
      <div className="shell section-y">
        <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-6">
            <p className="t-eyebrow t-eyebrow-accent">{data.eyebrow}</p>
            <h2 className="t-display t-h3 mt-4">{data.title}</h2>
            <ul className="spec-list mt-8 max-w-[56ch]">
              {data.items.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-5 lg:col-start-8">
            <p className="t-eyebrow">{data.limitsTitle}</p>
            <ul className="mt-4 flex flex-col gap-3 border-l border-paper/25 pl-5 text-[15px] leading-relaxed text-paper/80">
              {data.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="mt-14 grid grid-cols-1 gap-x-14 gap-y-3 border-t border-paper/20 pt-7 lg:grid-cols-12">
          <p className="t-eyebrow lg:col-span-4">{costs.title}</p>
          <p className="max-w-[62ch] text-[16px] leading-relaxed text-paper/85 lg:col-span-8">{costs.text}</p>
        </div>
      </div>
    </section>
  )
}

function Uses({ uses }) {
  return (
    <section className="bg-paper">
      <div className="shell section-y">
        <header data-reveal className="max-w-[54ch]">
          <p className="t-eyebrow t-eyebrow-accent">{uses.eyebrow}</p>
          <h2 className="t-display t-h3 mt-4">{uses.title}</h2>
          <p className="t-body mt-4 max-w-[56ch]">{uses.intro}</p>
        </header>

        <dl className="mt-9 grid grid-cols-1 border-t border-ink md:grid-cols-2 md:gap-x-14">
          {uses.items.map((item) => {
            const demo = item.demo ? demoById(item.demo) : null
            return (
              <div key={item.title} data-reveal className="border-b border-rule py-6">
                <dt className="t-display t-h4">{item.title}</dt>
                <dd className="t-body mt-2 max-w-[48ch] text-[15px]">{item.text}</dd>
                {demo && (
                  <dd className="mt-3">
                    <a
                      href={paths.demoer}
                      className="link-underline hit inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
                    >
                      Se {demo.name}
                      <Arrow />
                    </a>
                  </dd>
                )}
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

function Maintenance({ data }) {
  return (
    <section className="bg-paper pb-[var(--space-section)]">
      <div className="shell">
        <div
          data-reveal
          className="grid grid-cols-1 items-center gap-x-14 gap-y-6 rounded-[var(--radius-panel)] bg-paper-2 p-7 md:p-10 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <p className="t-eyebrow">{data.eyebrow}</p>
            <h2 className="t-display t-h4 mt-3">{data.title}</h2>
            <p className="t-body mt-3 max-w-[60ch] text-[16px]">{data.body}</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <a href={`${paths.kontakt}?emne=${data.cta.topic}`} className="btn btn-ghost">
              {data.cta.label}
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ServicePage({ id }) {
  const s = services[id]

  return (
    <>
      <PageHead
        eyebrow={s.eyebrow}
        title={s.title}
        lead={s.lead}
        aside={id === 'hjemmesider' ? <CalcStart /> : null}
      >
        <a href={s.primary.href} className="btn btn-primary">
          {s.primary.label}
        </a>
        <a href={s.secondary.href} className="btn btn-ghost">
          {s.secondary.label}
        </a>
      </PageHead>

      <Need need={s.need} />
      <Solution solution={s.solution} />
      {s.visual === 'demos' ? <DemoTeasers under /> : <Visual visual={s.visual} />}
      <Deliver data={s.deliver} costs={s.costs} />
      <Uses uses={s.uses} />
      {s.maintenance && <Maintenance data={s.maintenance} />}
      <Samarbejde
        id="sadan-foregar-det"
        eyebrow="Sådan foregår det"
        title="Fra første besked til færdigt resultat."
        lead="Fire trin, og du har hele vejen den samme kontaktperson."
        steps={s.steps}
        showOwnership={false}
      />
      <Faq items={s.faq} title="Korte svar på det, du sikkert vil vide." under />
      <Kontakt
        topic={s.contact.topic}
        eyebrow="Kontakt"
        title={s.contact.label}
        body="Skriv et par linjer, så vender jeg tilbage. Ingen binding, før vi har talt sammen og du har fået et skriftligt tilbud."
      />
    </>
  )
}
