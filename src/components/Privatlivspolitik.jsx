import { legal, site, work } from '../content.js'
import Logo from './Logo.jsx'

/**
 * Privatlivspolitik.
 *
 * Skrevet ud fra, hvad siden FAKTISK gør: ingen cookies, ingen analyse, ingen
 * tredjepartsskrifter (de er selvhostede), ingen formular og kun én vej ind
 * for personlige oplysninger: mail og telefon. Ændrer det sig (formular,
 * analyse, nyhedsbrev, indlejret video), skal politikken ændres SAMTIDIG,
 * ellers står der noget forkert.
 *
 * Det er en fornuftig standardtekst, ikke juridisk rådgivning. Navn, adresse
 * og CVR-nr. hentes fra `legal` i content.js.
 */

function Section({ title, children }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="t-display text-[28px] md:text-[34px]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[16px] leading-relaxed text-ink/80">
        {children}
      </div>
    </section>
  )
}

const list = 'flex list-disc flex-col gap-2 pl-5 marker:text-accent'

export default function Privatlivspolitik() {
  return (
    <>
      <header className="border-b border-rule">
        <div className="shell flex h-[64px] items-center justify-between">
          <a href="/" aria-label="OviaSpecs, til forsiden" className="inline-flex min-h-11 items-center text-ink">
            <Logo className="block h-[26px]" />
          </a>
          <a href="/" className="link-underline hit text-[13px] font-medium text-ink">
            Til forsiden
          </a>
        </div>
      </header>

      <main className="shell max-w-[760px] py-16 md:py-24">
        <p className="t-eyebrow">Privatliv</p>
        <h1 className="t-display mt-5 text-[clamp(40px,7vw,72px)]">Privatlivspolitik</h1>
        <p className="t-body mt-6 max-w-[56ch] text-[16px]">
          Kort version: jeg gemmer kun det, du selv sender mig, jeg bruger det til at svare dig og
          lave arbejdet, og jeg deler det ikke med andre end de værktøjer, jeg skal bruge til det.
          Siden bruger ingen cookies og ingen tracking.
        </p>
        <p className="mt-2 text-[13px] text-muted">Sidst opdateret: {legal.updated}</p>

        <div className="mt-16">
          <Section title="Hvem er ansvarlig">
            <p>
              OviaSpecs er dataansvarlig for de oplysninger, der behandles gennem denne side.
            </p>
            <p>
              OviaSpecs v/ {legal.owner}
              <br />
              {legal.address}
              <br />
              {legal.cvr && (
                <>
                  CVR: {legal.cvr}
                  <br />
                </>
              )}
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
              <br />
              <a href={`tel:${site.phoneHref}`} className="link-underline">
                {site.phone}
              </a>
            </p>
          </Section>

          <Section title="Hvilke oplysninger jeg behandler">
            <ul className={list}>
              <li>
                <strong className="font-medium text-ink">Når du skriver eller ringer:</strong> dit
                navn, din mailadresse, dit telefonnummer og det, du selv fortæller mig.
              </li>
              <li>
                <strong className="font-medium text-ink">Hvis vi laver en aftale:</strong>{' '}
                virksomhedens navn, kontaktperson og de oplysninger, der skal bruges til at skrive
                en faktura.
              </li>
              <li>
                <strong className="font-medium text-ink">Tekniske oplysninger:</strong> når du
                åbner siden, registrerer hostingudbyderen din IP-adresse og din browsertype i
                serverlogs. Det er nødvendigt for, at siden kan leveres og holdes sikker.
              </li>
            </ul>
            <p>
              Jeg beder ikke om følsomme oplysninger og indsamler ikke oplysninger om børn. Skriv
              dem ikke til mig.
            </p>
          </Section>

          <Section title="Hvad jeg bruger dem til, og på hvilket grundlag">
            <ul className={list}>
              <li>
                <strong className="font-medium text-ink">At svare på din henvendelse</strong> og
                give dig et tilbud. Grundlaget er databeskyttelsesforordningens artikel 6, stk. 1,
                litra b (skridt, du selv beder om, inden en aftale) og litra f (min legitime
                interesse i at kunne svare dig).
              </li>
              <li>
                <strong className="font-medium text-ink">At levere arbejdet og sende faktura.</strong>{' '}
                Grundlaget er artikel 6, stk. 1, litra b (opfyldelse af aftalen) og litra c
                (bogføringsloven).
              </li>
              <li>
                <strong className="font-medium text-ink">At holde siden sikker og køre.</strong>{' '}
                Grundlaget er artikel 6, stk. 1, litra f.
              </li>
            </ul>
            <p>Jeg bruger ikke dine oplysninger til markedsføring og sælger dem aldrig.</p>
          </Section>

          <Section title="Hvem jeg deler dem med">
            <p>
              Kun med de udbydere, der skal til for at drive siden og læse dine henvendelser. De
              behandler oplysningerne på mine vegne og må ikke bruge dem til andet.
            </p>
            <ul className={list}>
              <li>
                <strong className="font-medium text-ink">{legal.hosting}</strong> — hosting af siden
                og serverlogs.
              </li>
              <li>
                <strong className="font-medium text-ink">{legal.mailProvider}</strong> — modtagelse
                af mails.
              </li>
            </ul>
            <p>
              Derudover videregiver jeg kun oplysninger, hvis jeg er retligt forpligtet til det,
              fx til SKAT.
            </p>
          </Section>

          <Section title="Overførsel til lande uden for EU/EØS">
            <p>
              Nogle af udbyderne ovenfor er amerikanske eller har behandling i USA. Sker det, er det
              på et gyldigt overførselsgrundlag, fx EU-Kommissionens standardkontraktbestemmelser
              eller EU-US Data Privacy Framework.
            </p>
          </Section>

          <Section title="Hvor længe jeg gemmer dem">
            <ul className={list}>
              <li>
                Henvendelser, der ikke fører til en aftale, slettes senest {legal.retentionMonths}{' '}
                måneder efter sidste kontakt.
              </li>
              <li>
                Bilag og fakturaer gemmes i 5 år efter udgangen af regnskabsåret, som
                bogføringsloven kræver.
              </li>
              <li>Serverlogs gemmes kort af hostingudbyderen og slettes automatisk.</li>
            </ul>
          </Section>

          <Section title="Cookies og tracking">
            <p>
              Siden bruger ingen cookies og ingen analyse- eller reklameværktøjer. Skrifterne
              ligger på siden selv og hentes ikke fra Google eller andre, så din IP-adresse ikke
              sendes videre. Derfor er der intet cookiebanner.
            </p>
            <p>
              Siden har ingen formular. Skriver du til mig, sker det i din egen mailapp eller på
              telefonen, og der sendes intet fra siden.{work.showDemoLinks && ' Under "Udvalgt arbejde" er der links til tre demoer, der ligger hos GitHub Pages. Åbner du dem, forlader du oviaspecs.com, og de behandler dine oplysninger efter deres egne regler.'}
            </p>
          </Section>

          <Section title="Dine rettigheder">
            <p>Du har ret til at:</p>
            <ul className={list}>
              <li>få indsigt i, hvad jeg har om dig,</li>
              <li>få forkerte oplysninger rettet,</li>
              <li>få oplysninger slettet, medmindre jeg skal gemme dem ved lov,</li>
              <li>få behandlingen begrænset eller gøre indsigelse mod den,</li>
              <li>få dine oplysninger udleveret i et almindeligt format (dataportabilitet),</li>
              <li>trække et samtykke tilbage, hvis behandlingen bygger på et.</li>
            </ul>
            <p>
              Skriv til{' '}
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
              , så svarer jeg senest inden for en måned.
            </p>
            <p>
              Er du utilfreds med, hvordan jeg behandler dine oplysninger, kan du klage til
              Datatilsynet på{' '}
              <a
                href="https://www.datatilsynet.dk"
                className="link-underline"
                rel="noopener noreferrer"
              >
                datatilsynet.dk
              </a>
              . Jeg vil dog gerne have chancen for at rette det først.
            </p>
          </Section>

          <Section title="Ændringer">
            <p>
              Ændrer jeg, hvordan siden behandler oplysninger, opdaterer jeg denne side og datoen
              øverst.
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-rule">
        <div className="shell py-8 text-[13px] text-muted">© 2026 OviaSpecs</div>
      </footer>
    </>
  )
}
