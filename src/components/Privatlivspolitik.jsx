import { company, contact } from '../data/pricing.js'
import { links, privacy } from '../data/texts.js'
import Logo from './Logo.jsx'

/**
 * Privatlivspolitik.
 *
 * Skrevet ud fra, hvad siden FAKTISK gør (tjekket i koden):
 * - ingen formularer, ingen backend: kontakt sker med telefon, SMS og mail
 * - ingen cookies og ingen reklame- eller sporingsværktøjer
 * - besøg tælles med Cloudflare Web Analytics: ét script fra
 *   static.cloudflareinsights.com (tilladt i CSP, public/_headers). Teksten bygger
 *   kun på Cloudflares egne udsagn (links i README) og en test af scriptet
 *   (ingen cookies, ingen localStorage/sessionStorage)
 * - skrifterne er selvhostede (public/fonts)
 * - prisberegnerens valg står kun i adresselinjen
 * - koncepterne husker i sessionStorage, hvilken side man kom fra (DemoShell)
 * Ændrer noget af det sig, skal politikken ændres SAMTIDIG.
 *
 * Det er en fornuftig standardtekst, ikke juridisk rådgivning.
 */

function Section({ title, children }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="t-display t-h3">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[16px] leading-relaxed text-ink/80">{children}</div>
    </section>
  )
}

const list = 'flex list-disc flex-col gap-2 pl-5 marker:text-accent'
const strong = 'font-medium text-ink'

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
          Kort version: Siden har ingen formularer og bruger ingen cookies. Besøg tælles med Cloudflare Web
          Analytics, som ifølge Cloudflare ikke indsamler personoplysninger. Jeg får kun de oplysninger,
          du selv giver mig, når du ringer, sender en SMS eller skriver en mail.
        </p>
        <p className="mt-2 text-[13px] text-muted">Sidst opdateret: {privacy.updated}</p>

        <div className="mt-16">
          <Section title="Hvem er ansvarlig">
            <p>OviaSpecs er dataansvarlig for de oplysninger, du giver mig.</p>
            <p>
              OviaSpecs v/ {contact.name}
              <br />
              {company.cvr && (
                <>
                  CVR: {company.cvr}
                  <br />
                </>
              )}
              <a href={links.mail} className="link-underline">
                {contact.email}
              </a>
              <br />
              <a href={links.tel} className="link-underline">
                {contact.phone}
              </a>
            </p>
          </Section>

          <Section title="Hvilke oplysninger jeg behandler">
            <ul className={list}>
              <li>
                <strong className={strong}>Når du ringer, sender en SMS eller skriver:</strong> dit navn, dit
                telefonnummer eller din mailadresse og det, du selv fortæller mig.
              </li>
              <li>
                <strong className={strong}>Hvis du bestiller en opgave:</strong> virksomhedens navn, kontaktperson og
                de oplysninger, der skal bruges til at skrive en faktura.
              </li>
              <li>
                <strong className={strong}>Tekniske oplysninger:</strong> når du åbner siden, registrerer
                hostingudbyderen din IP-adresse og din browsertype i serverlogs. Det er nødvendigt for, at siden kan
                leveres og holdes sikker.
              </li>
            </ul>
            <p>Jeg beder ikke om følsomme oplysninger. Skriv dem ikke til mig.</p>
          </Section>

          <Section title="Hvad jeg bruger dem til, og på hvilket grundlag">
            <ul className={list}>
              <li>
                <strong className={strong}>At svare dig</strong> og give dig et tilbud. Grundlaget er
                databeskyttelsesforordningens artikel 6, stk. 1, litra b (skridt, du selv beder om, inden en aftale)
                og litra f (min legitime interesse i at kunne svare dig).
              </li>
              <li>
                <strong className={strong}>At levere arbejdet og sende faktura.</strong> Grundlaget er artikel 6,
                stk. 1, litra b (opfyldelse af aftalen) og litra c (bogføringsloven).
              </li>
              <li>
                <strong className={strong}>At holde siden sikker og kørende.</strong> Grundlaget er artikel 6, stk.
                1, litra f.
              </li>
            </ul>
            <p>Jeg bruger ikke dine oplysninger til markedsføring og sælger dem aldrig.</p>
          </Section>

          <Section title="Hvem jeg deler dem med">
            <p>
              Kun med de udbydere, der skal til for at drive siden og modtage mail. De behandler oplysningerne på
              mine vegne og må ikke bruge dem til andet.
            </p>
            <ul className={list}>
              {privacy.providers.map(([name, what]) => (
                <li key={name}>
                  <strong className={strong}>{name}</strong>: {what}
                </li>
              ))}
            </ul>
            <p>Derudover videregiver jeg kun oplysninger, hvis jeg er retligt forpligtet til det, fx til Skattestyrelsen.</p>
          </Section>

          <Section title="Overførsel til lande uden for EU/EØS">
            <p>
              Udbyderne ovenfor er amerikanske eller har behandling i USA. Overførslen sker på et gyldigt
              overførselsgrundlag, fx EU-Kommissionens standardkontraktbestemmelser eller EU-US Data Privacy
              Framework.
            </p>
          </Section>

          <Section title="Hvor længe jeg gemmer dem">
            <ul className={list}>
              <li>
                Henvendelser, der ikke fører til en aftale, slettes senest {privacy.retentionMonths} måneder efter
                sidste kontakt.
              </li>
              <li>Bilag og fakturaer gemmes i 5 år efter udgangen af regnskabsåret, som bogføringsloven kræver.</li>
              <li>Serverlogs gemmes kort af hostingudbyderen og slettes automatisk.</li>
            </ul>
          </Section>

          <Section title="Cookies og besøgsstatistik">
            <p>
              Siden bruger Cloudflare Web Analytics til at tælle besøg. Et lille script fra Cloudflare
              (static.cloudflareinsights.com) måler sidevisninger, besøg og hvor hurtigt siden indlæses. Ifølge
              Cloudflare:
            </p>
            <ul className={list}>
              <li>indsamler og bruger Web Analytics ikke dine personoplysninger,</li>
              <li>bruges der ingen cookies eller lokal lagring (localStorage) til at indsamle tallene,</li>
              <li>laves der ikke &quot;fingeraftryk&quot; af dig ud fra din IP-adresse, din browser eller andre data,</li>
              <li>følger Cloudflare ikke den enkelte besøgende på tværs af hjemmesider.</li>
            </ul>
            <p>
              Siden bruger ingen andre analyse- eller reklameværktøjer og ingen cookies. Skrifterne ligger på siden
              selv og hentes ikke fra Google eller andre. Derfor er der intet cookiebanner.
            </p>
            <p>
              Prisberegneren gemmer ikke noget og sender ikke noget. Dine valg står kun i adresselinjen, så du kan
              dele eller gemme linket. Knapperne efter prisen åbner din egen telefon, SMS-app eller mail med en
              færdigskrevet besked, som du selv vælger, om du vil sende.
            </p>
            <p>
              Når du åbner et af koncepterne, husker din browserfane (sessionStorage), hvilken side du kom fra, så
              &quot;Tilbage til OviaSpecs&quot; fører det rigtige sted hen. Det forlader ikke din browser, er ikke en
              cookie og slettes, når du lukker fanen. Koncepterne er fiktive: formularer og knapper i dem sender og
              gemmer intet.
            </p>
          </Section>

          <Section title="Dine rettigheder">
            <p>Du har ret til at:</p>
            <ul className={list}>
              <li>få indsigt i, hvad jeg har om dig,</li>
              <li>få forkerte oplysninger rettet,</li>
              <li>få oplysninger slettet, medmindre jeg skal gemme dem ved lov,</li>
              <li>få behandlingen begrænset eller gøre indsigelse mod den,</li>
              <li>få dine oplysninger udleveret i et almindeligt format (dataportabilitet).</li>
            </ul>
            <p>
              Skriv til{' '}
              <a href={links.mail} className="link-underline">
                {contact.email}
              </a>
              , så svarer jeg senest inden for en måned.
            </p>
            <p>
              Er du utilfreds med, hvordan jeg behandler dine oplysninger, kan du klage til Datatilsynet på{' '}
              <a href="https://www.datatilsynet.dk" className="link-underline" rel="noopener noreferrer">
                datatilsynet.dk
              </a>
              .
            </p>
          </Section>

          <Section title="Ændringer">
            <p>Ændrer jeg, hvordan siden behandler oplysninger, opdaterer jeg denne side og datoen øverst.</p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-rule">
        <div className="shell py-8 text-[13px] text-muted">© 2026 OviaSpecs</div>
      </footer>
    </>
  )
}
