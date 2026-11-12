/**
 * Grå pladsholder, når et billede mangler (ikke opfundet eller hentet ét andet sted fra). Teksten siger, hvad der skal i.
 * Brug den kun til billeder, vi ikke har: fx skærmbilleder fra Google Business-profilen og Search Console.
 */
export default function ImagePlaceholder({ what, ratio = '16 / 10', className = '' }) {
  return (
    <div
      role="img"
      aria-label={`Billede mangler: ${what}`}
      data-image-missing=""
      className={`flex items-center justify-center bg-hairline p-5 text-center ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="text-[15px] leading-[1.3] font-semibold text-ink">BILLEDE MANGLER: {what}</span>
    </div>
  )
}
