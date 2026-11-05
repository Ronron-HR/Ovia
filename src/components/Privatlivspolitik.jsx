import { contact, links, retentionMonths } from '../data/site.js'
import Logo from './ui/Logo.jsx'

/**
 * PRIVATLIVSPOLITIK. Beskriver præcis det, siden gør:
 * - ingen cookies, og ingen sporing ud over Cloudflare Web Analytics
 * - forespørgselsformularen under prisberegneren (components/calculator/InquiryForm.jsx, worker/index.js): sendes som mail via
 *   Cloudflare Email Routing og gemmes først i D1 (slettes efter retentionMonths); spamværn er honeypot og rate limit, ikke Turnstile
 *   (slås Turnstile til, skal politikken nævne det)
 * - skrifterne er selvhostede (@fontsource-variable, ingen Google Fonts)
 * - prisberegnerens valg står i adresselinjen og forlader kun browseren, hvis du selv sender dem
 * - koncepterne husker i sessionStorage, hvilken side man kom fra (DemoShell)
 * Ændrer noget af det sig, skal politikken ændres SAMTIDIG.
 *
 * Det er en fornuftig standardtekst, ikke juridisk rådgivning.
 */

const UPDATED = '5. november 2026'
const RETENTION_MONTHS = retentionMonths
const PROVIDERS = [
  ['Cloudflare', 'hosting af siden, serverlogs, besøgsstatistik (Web Analytics), modtagelse af formularen (Workers), databasen med forespørgsler (D1) og afsendelse og videresendelse af mail (Email Routing).'],
  ['Google (Gmail)', 'den mailboks, forespørgsler og mails bliver modtaget i.'],
]

function Section({ title, children }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="text-[clamp(22px,3vw,30px)] leading-[1.1] tracking-[-0.03em]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-base leading-relaxed">{children}</div>
    </section>
  )
}

const list = 'm-0 flex list-disc flex-col gap-2 pl-5 marker:text-muted'
const strong = 'font-semibold'

export default function Privatlivspolitik() {
  return (
    <>
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:h-[84px] md:px-14">
          <a href="/" aria-label="OviaSpecs, til forsiden" className="block">
            <Logo />
          </a>
          <a href="/" className="flex min-h-12 items-center text-[15px] font-medium">
            Til forsiden
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-5 py-14 md:py-24">
        <h1 className="display display-hero text-[clamp(40px,7vw,72px)]">Privatlivspolitik</h1>
        <p className="mt-6 max-w-[56ch] text-base leading-normal">
          Kort version: Siden bruger ingen cookies. Besøg tælles med Cloudflare Web Analytics, som ifølge Cloudflare ikke indsamler
          personoplysninger. Jeg får kun de oplysninger, du selv giver mig: når du sender formularen under prisberegneren, ringer, sender en SMS eller skriver en mail. Dem bruger
          jeg kun til at svare dig.
        </p>
        <p className="mt-2 text-sm text-muted-2">Sidst opdateret: {UPDATED}</p>

        <div className="mt-16">
          <Section title="Hvem er ansvarlig">
            <p>OviaSpecs er dataansvarlig for de oplysninger, du giver mig.</p>
            <p>
              OviaSpecs v/ {contact.name}
              <br />
              <a href={links.mail}>{contact.email}</a>
              <br />
              <a href={links.tel}>{contact.phone}</a>
            </p>
          </Section>

          <Section title="Hvilke oplysninger jeg behandler">
            <ul className={list}>
              <li>
                <strong className={strong}>Når du sender formularen under prisberegneren (&quot;Send mine valg&quot;):</strong> dit navn, dit
                telefonnummer og/eller din mailadresse, virksomhed og besked, hvis du skriver dem, og dine valg i beregneren (pakker, priser og et
                link til dem). Valgene sendes med automatisk, og jeg regner priserne ud igen på serveren. Din IP-adresse bruges kun kortvarigt til
                at begrænse, hvor mange forespørgsler der kan sendes fra samme sted (spambeskyttelse); den gemmes ikke sammen med forespørgslen.
                Et skjult felt, som kun robotter udfylder, bruges til samme formål.
              </li>
              <li>
                <strong className={strong}>Når du ringer, sender en SMS eller skriver:</strong> dit navn, dit telefonnummer eller din
                mailadresse og det, du selv fortæller mig. Knapperne Ring og SMS åbner din egen telefon eller SMS-app med en færdigskrevet
                besked med et link til dine valg. Du bestemmer selv, om du sender den.
              </li>
              <li>
                <strong className={strong}>Hvis du bestiller en opgave:</strong> virksomhedens navn, kontaktperson og de oplysninger, der skal
                bruges til at skrive en faktura.
              </li>
              <li>
                <strong className={strong}>Tekniske oplysninger:</strong> når du åbner siden, registrerer hostingudbyderen din IP-adresse og din
                browsertype i serverlogs. Det er nødvendigt for, at siden kan leveres og holdes sikker.
              </li>
            </ul>
            <p>Jeg beder ikke om følsomme oplysninger. Skriv dem ikke til mig.</p>
          </Section>

          <Section title="Hvad jeg bruger dem til, og på hvilket grundlag">
            <ul className={list}>
              <li>
                <strong className={strong}>At svare på din forespørgsel</strong> (formular, mail, SMS eller telefon) og give dig et tilbud. Formularen sender dine oplysninger til mig som mail og bruges kun til det; ikke til nyhedsbreve eller markedsføring. Grundlaget er databeskyttelsesforordningens artikel 6,
                stk. 1, litra b (skridt, du selv beder om, inden en aftale) og litra f (min legitime interesse i at kunne svare dig og i at beskytte formularen mod spam).
              </li>
              <li>
                <strong className={strong}>At levere arbejdet og sende faktura.</strong> Grundlaget er artikel 6, stk. 1, litra b (opfyldelse
                af aftalen) og litra c (bogføringsloven).
              </li>
              <li>
                <strong className={strong}>At holde siden sikker og kørende.</strong> Grundlaget er artikel 6, stk. 1, litra f.
              </li>
            </ul>
            <p>Jeg bruger ikke dine oplysninger til markedsføring og sælger dem aldrig.</p>
          </Section>

          <Section title="Hvem jeg deler dem med">
            <p>
              Kun med de udbydere, der skal til for at drive siden og modtage mail. De behandler oplysningerne på mine vegne og må ikke bruge
              dem til andet.
            </p>
            <ul className={list}>
              {PROVIDERS.map(([name, what]) => (
                <li key={name}>
                  <strong className={strong}>{name}</strong>: {what}
                </li>
              ))}
            </ul>
            <p>Derudover videregiver jeg kun oplysninger, hvis jeg er retligt forpligtet til det, fx til Skattestyrelsen.</p>
          </Section>

          <Section title="Overførsel til lande uden for EU/EØS">
            <p>
              Udbyderne ovenfor er amerikanske eller har behandling i USA. Overførslen sker på et gyldigt overførselsgrundlag, fx EU-Kommissionens
              standardkontraktbestemmelser eller EU-US Data Privacy Framework.
            </p>
          </Section>

          <Section title="Hvor de gemmes, og hvor længe">
            <p>
              En forespørgsel fra formularen sendes som mail til min indbakke hos Google (Gmail). Den gemmes først i en database hos Cloudflare (D1),
              så den ikke går tabt, hvis mailen fejler, og så den kan sendes igen. Mails og SMS-beskeder gemmes i min indbakke hos Google (Gmail) og
              på min telefon.
            </p>
            <ul className={list}>
              <li>Forespørgsler fra formularen slettes automatisk fra databasen {RETENTION_MONTHS} måneder efter, de er sendt.</li>
              <li>Henvendelser, der ikke fører til en aftale, slettes senest {RETENTION_MONTHS} måneder efter sidste kontakt.</li>
              <li>Bilag og fakturaer gemmes i 5 år efter udgangen af regnskabsåret, som bogføringsloven kræver.</li>
              <li>Serverlogs gemmes kort af hostingudbyderen og slettes automatisk.</li>
            </ul>
          </Section>

          <Section title="Cookies og besøgsstatistik">
            <p>
              Siden bruger Cloudflare Web Analytics til at tælle besøg. Et lille script fra Cloudflare (static.cloudflareinsights.com) måler
              sidevisninger, besøg og hvor hurtigt siden indlæses. Ifølge Cloudflare:
            </p>
            <ul className={list}>
              <li>indsamler og bruger Web Analytics ikke dine personoplysninger,</li>
              <li>bruges der ingen cookies eller lokal lagring (localStorage) til at indsamle tallene,</li>
              <li>laves der ikke &quot;fingeraftryk&quot; af dig ud fra din IP-adresse, din browser eller andre data,</li>
              <li>følger Cloudflare ikke den enkelte besøgende på tværs af hjemmesider.</li>
            </ul>
            <p>
              Siden bruger ingen andre analyse- eller reklameværktøjer og ingen cookies. Skrifterne ligger på siden selv og hentes ikke fra
              Google eller andre. Derfor er der intet cookiebanner.
            </p>
            <p>
              Prisberegnerens valg står i adresselinjen, så du kan dele eller gemme linket. De forlader kun din browser, hvis du selv sender
              formularen &quot;Send mine valg&quot; eller en SMS. Ring og SMS åbner din egen telefon eller SMS-app med en færdigskrevet besked, som du
              selv vælger, om du vil sende.
            </p>
            <p>
              Når du åbner et af koncepterne, husker din browserfane (sessionStorage), hvilken side du kom fra, så &quot;Tilbage til OviaSpecs&quot;
              fører det rigtige sted hen. Det forlader ikke din browser, er ikke en cookie og slettes, når du lukker fanen. Koncepterne er
              fiktive: formularer og knapper i dem sender og gemmer intet.
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
              Skriv til <a href={links.mail}>{contact.email}</a>, så svarer jeg senest inden for en måned.
            </p>
            <p>
              Er du utilfreds med, hvordan jeg behandler dine oplysninger, kan du klage til Datatilsynet på{' '}
              <a href="https://www.datatilsynet.dk" rel="noopener noreferrer">
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

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-[760px] px-5 py-8 text-sm text-muted-2">© 2026 OviaSpecs</div>
      </footer>
    </>
  )
}
