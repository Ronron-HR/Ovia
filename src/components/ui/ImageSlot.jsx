/**
 * Billedplads med tydeligt filnavn.
 *
 * Læg billedet i src/assets/billeder/ og giv det pladsens navn (fx
 * palmy-desktop.webp, .jpg, .png eller .avif). Så bruges det automatisk, uden
 * at koden ændres. Findes filen ikke, vises en tom plads med filnavnet, så det
 * er tydeligt, hvad der skal i. Listen over pladser står i
 * src/assets/billeder/README.md.
 */
const files = import.meta.glob('../../assets/billeder/*.{avif,webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' })

const urlFor = (name) => {
  const hit = Object.entries(files).find(([path]) => path.replace(/^.*\//, '').replace(/\.[a-z]+$/, '') === name)
  return hit ? hit[1] : null
}

/**
 * name   pladsens navn (filnavn uden endelse)
 * ratio  fx '16 / 10' eller '9 / 19.5'
 * alt    alt-tekst; tom streng markerer et rent dekorativt billede
 * gray   sort/hvid via filter:grayscale(1) (portræt)
 */
export default function ImageSlot({ name, ratio, alt = '', gray = false, className = '', fill = 'bg-paper' }) {
  const src = urlFor(name)
  return (
    <div className={`relative overflow-hidden ${fill} ${className}`} style={{ aspectRatio: ratio }} data-image-slot={name}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={gray ? { filter: 'grayscale(1)' } : undefined} />
      ) : (
        <span className="absolute inset-0 flex items-end p-3 font-mono text-[12px] leading-tight break-all text-muted-2" style={{ fontFamily: 'var(--font-mono)' }}>
          {name}
        </span>
      )}
    </div>
  )
}
