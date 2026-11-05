/** Logoet bruges præcis som filen er (public/oviaspecs-logo.svg). Må ikke tegnes om. */
export default function Logo({ size = 60, className = '' }) {
  return <img src="/oviaspecs-logo.svg" alt="OviaSpecs" width={size} height={size} className={`block ${className}`} style={{ width: size, height: size }} />
}
