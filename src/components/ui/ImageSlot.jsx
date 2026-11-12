/**
 * Billedplads med tydeligt filnavn.
 *
 * Læg billedet i src/assets/billeder/ og giv det pladsens navn (fx palmy-desktop). Ligger der
 * flere formater med samme navn (.avif, .webp og .jpg/.png), bruges de som <picture>: AVIF først,
 * så WebP, så originalen. Så bruges billedet automatisk, uden at koden ændres. Findes ingen fil, vises
 * en tom plads med filnavnet, så det er tydeligt, hvad der skal i. Listen over pladser står i
 * src/assets/billeder/README.md.
 *
 * Pladsen har fast billedformat (aspect-ratio), så siden ikke hopper, når billedet indlæses.
 * Billeder er lazy-loadede; kun et billede, der er sidens største element over folden, sættes `eager`.
 */
const files = import.meta.glob('../../assets/billeder/*.{avif,webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' })

/** { avif, webp, jpg … } for en plads. */
const formatsFor = (name) => {
  const out = {}
  for (const [path, url] of Object.entries(files)) {
    const file = path.replace(/^.*\//, '')
    const base = file.replace(/\.[a-z]+$/, '')
    if (base === name) out[file.slice(base.length + 1).replace('jpeg', 'jpg')] = url
  }
  return out
}

const MIME = { avif: 'image/avif', webp: 'image/webp' }

/**
 * name    pladsens navn (filnavn uden endelse)
 * ratio   fx '16 / 10' eller '9 / 19.5'
 * alt     alt-tekst; tom streng markerer et rent dekorativt billede
 * gray    sort/hvid via filter:grayscale(1) (portræt)
 * eager   hentes med det samme (kun hvis billedet er sidens LCP-element)
 * width / height   billedets egne mål, så browseren kender formatet, før filen er hentet
 * position  hvilken del af billedet der vises, når formatet beskærer det (CSS object-position; standard: toppen)
 */
export default function ImageSlot({ name, ratio, alt = '', gray = false, eager = false, width, height, position = 'top', className = '', fill = 'bg-paper' }) {
  const formats = formatsFor(name)
  const original = formats.jpg ?? formats.png ?? formats.webp ?? formats.avif
  const src = original
  const style = { objectPosition: position, ...(gray ? { filter: 'grayscale(1)' } : {}) }
  return (
    <div className={`relative overflow-hidden ${fill} ${className}`} style={{ aspectRatio: ratio }} data-image-slot={name}>
      {src ? (
        <picture>
          {original &&
            ['avif', 'webp']
              .filter((f) => formats[f] && formats[f] !== original)
              .map((f) => <source key={f} type={MIME[f]} srcSet={formats[f]} />)}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={style}
          />
        </picture>
      ) : (
        <span className="absolute inset-0 flex items-end p-3 text-[12px] leading-tight break-all text-muted-2" style={{ fontFamily: 'var(--font-mono)' }}>
          {name}
        </span>
      )}
    </div>
  )
}
