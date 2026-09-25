/**
 * Billeder og rammer.
 *
 * Pic leverer AVIF, falder tilbage på WebP (eller JPEG, hvis fallback er
 * sat) og har altid width/height, så browseren reserverer pladsen, og siden
 * ikke hopper, når billedet lander. Bruges til portrættet.
 *
 * Browser og Phone er rammer i HTML/CSS om konceptillustrationerne
 * (src/concepts), så kanterne er skarpe i alle størrelser.
 */
export function Pic({
  image,
  priority = false,
  eager = false,
  sizes,
  fallback = 'webp',
  alt = image.alt,
  className = '',
}) {
  return (
    <picture>
      <source srcSet={`${image.base}.avif`} type="image/avif" sizes={sizes} />
      {fallback !== 'webp' && (
        <source srcSet={`${image.base}.webp`} type="image/webp" sizes={sizes} />
      )}
      <img
        src={`${image.base}.${fallback}`}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority || eager ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        sizes={sizes}
        className={className}
      />
    </picture>
  )
}

export function Browser({ children, label, className = '' }) {
  return (
    <figure className={`browser ${className}`} role="img" aria-label={label}>
      <div className="browser-bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      {children}
    </figure>
  )
}

export function Phone({ children, label, className = '' }) {
  return (
    <div className={`phone ${className}`} role="img" aria-label={label}>
      {children}
    </div>
  )
}

/** Lille pil, tegnet som SVG (skrifterne har ikke pile). */
export function Arrow({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      className={`arrow ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
