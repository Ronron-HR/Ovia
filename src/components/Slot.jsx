/**
 * Billed-slot med låst aspect-ratio.
 *
 * Pladsen er reserveret, uanset om billedet er der endnu — derfor giver
 * udskiftningen nul layout shift. Sæt base i content.js, og placeholderen
 * forsvinder. Slot leverer AVIF, falder tilbage på WebP og til sidst JPEG;
 * filerne laves af `npm run images`.
 *
 * Portrættet er et bevidst lille element, ikke et skrumpet stort et.
 * Derfor:
 *   - det vises aldrig større end 1:1 af sin egen opløsning
 *   - det sidder i en mat flade med en tydelig kant, så det ser placeret ud
 *   - det har et fint kornlag, så blødheden læses som tekstur
 *
 * maxVh: valgfrit loft på højden i svh. Bredden regnes ud fra forholdet,
 * så billedet aldrig bliver beskåret af et loft, det ikke kender til.
 */
/** Matten omkring billedet, i px. Sættes som style, så målene her og
 *  det, browseren tegner, ikke kan komme ud af trit. */
const FRAME_PAD = 10
const FRAME_BORDER = 1

export default function Slot({
  image,
  maxVh,
  priority = false,
  framed = false,
  className = '',
}) {
  const [rw, rh] = image.ratio.split('/').map((n) => Number(n.trim()))

  // Loftet gælder BILLEDET, ikke rammen. Matten er border-box, så dens
  // padding og kant ligger inden i den bredde, du sætter — sætter man
  // loftet på matten, bliver selve billedet mindre end 1:1 i nogle
  // bredder og større i andre. Derfor lægges rammens tykkelse oveni.
  const chrome = framed ? (FRAME_PAD + FRAME_BORDER) * 2 : 0

  const outer = {}
  if (maxVh) outer.width = `min(100%, calc(${maxVh}svh * ${rw} / ${rh} + ${chrome}px))`
  if (image.width) outer.maxWidth = `${image.width + chrome}px`
  if (framed) {
    outer.padding = `${FRAME_PAD}px`
    outer.borderWidth = `${FRAME_BORDER}px`
  }

  const media = (
    <div className="grain relative overflow-hidden bg-paper-2" style={{ aspectRatio: image.ratio }}>
      {image.base ? (
        <picture>
          <source srcSet={`${image.base}.avif`} type="image/avif" />
          <source srcSet={`${image.base}.webp`} type="image/webp" />
          <img
            src={`${image.base}.jpg`}
            alt={image.alt}
            width={image.width ?? rw * 100}
            height={image.height ?? rh * 100}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-end justify-start p-3"
          style={{ boxShadow: 'inset 0 0 0 1px var(--color-rule)' }}
        >
          <span className="font-mono text-[10px] leading-tight tracking-wider text-muted/70 uppercase">
            {image.spec}
          </span>
        </span>
      )}
    </div>
  )

  return (
    <div
      className={`${framed ? 'border-solid border-rule bg-paper-2' : ''} ${className}`}
      style={outer}
    >
      {media}
    </div>
  )
}
