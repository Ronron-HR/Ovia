/** Vises kun i udvikling; i produktion svarer værten med 404.html. */
export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-16 pb-24 md:px-14 md:pt-28">
      <h1 className="display display-hero text-[clamp(40px,12vw,56px)] md:text-[clamp(72px,9vw,140px)]">404</h1>
      <p className="mt-5 mb-0 max-w-[36ch] text-[17px] leading-[1.45]">Den side findes ikke. Forsiden har det hele.</p>
      <a href="/" className="btn btn-ink hov-ink-soft mt-7 w-full md:w-fit">
        Til forsiden
      </a>
    </section>
  )
}
