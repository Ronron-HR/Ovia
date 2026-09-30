/**
 * Illustrationer og små mærker til demoerne. Tegnet til demoerne som SVG med
 * egne former og farver: ingen fotos, logoer eller billeder fra rigtige
 * virksomheder. De er dekorative (aria-hidden); betydningen står i teksten.
 */

const svgProps = { 'aria-hidden': true, focusable: 'false', className: 'dm-art' }

/* ---- Cafédemo: kop, damp og småkager ---------------------------------------- */
export function CafeArt() {
  return (
    <svg viewBox="0 0 480 440" {...svgProps}>
      <circle cx="240" cy="210" r="188" fill="#fff8ea" />
      <circle cx="240" cy="210" r="188" fill="none" stroke="#1b2a41" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" />
      {/* damp */}
      <g fill="none" stroke="#1b2a41" strokeWidth="9" strokeLinecap="round">
        <path d="M200 150c-18-20 18-34 0-58" />
        <path d="M242 140c-18-20 18-34 0-58" />
        <path d="M284 150c-18-20 18-34 0-58" />
      </g>
      {/* underkop */}
      <ellipse cx="236" cy="346" rx="146" ry="26" fill="#e0b93f" />
      <ellipse cx="236" cy="338" rx="146" ry="26" fill="#1b2a41" />
      {/* kop */}
      <path d="M140 196h192v68c0 56-42 86-96 86s-96-30-96-86z" fill="#1b2a41" />
      <ellipse cx="236" cy="196" rx="96" ry="20" fill="#2f4668" />
      <ellipse cx="236" cy="198" rx="80" ry="14" fill="#8a5a3c" />
      <path d="M332 218c52 0 52 82-4 82" fill="none" stroke="#1b2a41" strokeWidth="20" strokeLinecap="round" />
      <path d="M176 232c4 34 22 54 50 62" fill="none" stroke="#fff8ea" strokeOpacity=".35" strokeWidth="8" strokeLinecap="round" />
      {/* småkager */}
      <g>
        <circle cx="388" cy="380" r="40" fill="#d99a4e" />
        <circle cx="374" cy="368" r="5" fill="#6b3f1f" />
        <circle cx="400" cy="384" r="5" fill="#6b3f1f" />
        <circle cx="380" cy="396" r="5" fill="#6b3f1f" />
        <circle cx="92" cy="386" r="32" fill="#e9b25c" />
        <circle cx="82" cy="378" r="4" fill="#6b3f1f" />
        <circle cx="100" cy="394" r="4" fill="#6b3f1f" />
      </g>
      <g fill="#1b2a41">
        <circle cx="62" cy="120" r="7" />
        <circle cx="430" cy="110" r="9" />
        <circle cx="410" cy="170" r="5" />
      </g>
    </svg>
  )
}

export function CafeMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="17" fill="#f4d35e" />
      <path d="M8 14h14v6a7 7 0 0 1-14 0z" fill="#1b2a41" />
      <path d="M22 15c4 0 4 6 0 6" fill="none" stroke="#1b2a41" strokeWidth="2" />
    </svg>
  )
}

/* ---- Restaurantdemo: buevindue, lampe og dækket bord ------------------------- */
export function RestaurantArt() {
  return (
    <svg viewBox="0 0 480 440" {...svgProps}>
      <path d="M70 430V200a170 170 0 0 1 340 0v230z" fill="#fbf3e6" />
      <path d="M70 430V200a170 170 0 0 1 340 0v230z" fill="none" stroke="#3a2418" strokeWidth="5" />
      <circle cx="240" cy="178" r="82" fill="#e3a07a" />
      <path d="M150 230c40-26 140-26 180 0" fill="none" stroke="#a64b2a" strokeWidth="6" strokeLinecap="round" />
      <path d="M170 256c30-16 110-16 140 0" fill="none" stroke="#a64b2a" strokeWidth="6" strokeLinecap="round" />
      {/* lampe */}
      <path d="M240 20v78" stroke="#3a2418" strokeWidth="4" />
      <path d="M204 132a36 36 0 0 1 72 0z" fill="#3a2418" />
      <path d="M212 138h56" stroke="#e7b48f" strokeWidth="6" strokeLinecap="round" />
      {/* bord */}
      <rect x="40" y="342" width="400" height="16" rx="3" fill="#3a2418" />
      <path d="M78 358v72M402 358v72" stroke="#3a2418" strokeWidth="10" />
      {/* tallerken */}
      <ellipse cx="240" cy="336" rx="86" ry="14" fill="#fbf3e6" stroke="#3a2418" strokeWidth="4" />
      <path d="M190 330c4-26 26-38 50-38s46 12 50 38z" fill="#a64b2a" />
      <path d="M240 282v-14" stroke="#3a2418" strokeWidth="4" strokeLinecap="round" />
      {/* glas */}
      <g fill="none" stroke="#3a2418" strokeWidth="4" strokeLinecap="round">
        <path d="M118 262c0 30 14 42 28 42s28-12 28-42z" fill="#fbf3e6" />
        <path d="M146 304v34M128 340h36" />
        <path d="M306 262c0 30 14 42 28 42s28-12 28-42z" fill="#fbf3e6" />
        <path d="M334 304v34M316 340h36" />
      </g>
      <path d="M124 280c6 14 40 14 44 0" fill="#a64b2a" />
      <path d="M312 280c6 14 40 14 44 0" fill="#a64b2a" />
    </svg>
  )
}

export function RestaurantMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="3" fill="#a64b2a" />
      <path d="M8 27V16a9 9 0 0 1 18 0v11z" fill="none" stroke="#fbf3e6" strokeWidth="2" />
      <circle cx="17" cy="15" r="3" fill="#fbf3e6" />
    </svg>
  )
}

/* ---- Salondemo: saks, kam og et grønt skud ----------------------------------- */
export function SalonArt() {
  return (
    <svg viewBox="0 0 480 440" {...svgProps}>
      <rect x="90" y="30" width="300" height="380" fill="none" stroke="#c9c8c1" strokeWidth="2" />
      <rect x="110" y="50" width="260" height="340" fill="#ebeae5" />
      {/* saks */}
      <g fill="none" stroke="#2b2e31" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M240 232 184 70" />
        <path d="M240 232 296 70" />
        <path d="M240 232 204 322" />
        <path d="M240 232 276 322" />
        <circle cx="190" cy="350" r="34" />
        <circle cx="290" cy="350" r="34" />
      </g>
      <circle cx="240" cy="232" r="9" fill="#3d6a57" />
      {/* grønt skud */}
      <g fill="none" stroke="#3d6a57" strokeWidth="4" strokeLinecap="round">
        <path d="M398 410c0-70 10-130 40-200" />
      </g>
      <g fill="#3d6a57">
        <ellipse cx="420" cy="330" rx="26" ry="11" transform="rotate(-35 420 330)" />
        <ellipse cx="444" cy="278" rx="24" ry="10" transform="rotate(35 444 278)" />
        <ellipse cx="424" cy="236" rx="22" ry="9" transform="rotate(-40 424 236)" />
      </g>
    </svg>
  )
}

export function SalonMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <g fill="none" stroke="#2b2e31" strokeWidth="2" strokeLinecap="round">
        <path d="M15 14 9 3M15 14 21 3M15 14l-4 8M15 14l4 8" />
        <circle cx="10" cy="25" r="3.2" />
        <circle cx="20" cy="25" r="3.2" />
      </g>
    </svg>
  )
}

/* ---- Vinbardemo: glas, flaske og drue ----------------------------------------- */
export function VinbarArt() {
  return (
    <svg viewBox="0 0 480 440" {...svgProps}>
      <circle cx="240" cy="220" r="190" fill="none" stroke="#e0a66a" strokeWidth="3" />
      <circle cx="240" cy="220" r="170" fill="none" stroke="#e0a66a" strokeOpacity=".4" strokeWidth="1.5" />
      {/* flaske */}
      <path d="M352 420V250c0-26 24-34 24-70V86h30v94c0 36 24 44 24 70v170z" transform="translate(-44 0)" fill="#7b2a66" />
      <rect x="318" y="86" width="30" height="18" fill="#e0a66a" />
      <rect x="302" y="286" width="62" height="76" fill="#f8f2e4" opacity=".92" />
      <path d="M314 324h38" stroke="#7b2a66" strokeWidth="3" />
      <path d="M314 338h38" stroke="#7b2a66" strokeWidth="3" />
      {/* glas */}
      <path d="M170 70c-6 110 26 170 70 170s76-60 70-170z" fill="#f8f2e4" />
      <path d="M176 150c6 62 30 88 64 88s58-26 64-88z" fill="#8e2f5e" />
      <path d="M240 240v112" stroke="#f8f2e4" strokeWidth="9" />
      <ellipse cx="240" cy="356" rx="62" ry="11" fill="#f8f2e4" />
      {/* druer */}
      <g fill="#a8558f">
        <circle cx="96" cy="300" r="18" />
        <circle cx="128" cy="300" r="18" />
        <circle cx="112" cy="328" r="18" />
        <circle cx="80" cy="328" r="18" />
        <circle cx="144" cy="328" r="18" />
        <circle cx="112" cy="356" r="18" />
      </g>
      <path d="M112 282c0-18 8-30 26-36" fill="none" stroke="#e0a66a" strokeWidth="5" strokeLinecap="round" />
      <path d="M124 258c18-14 38-6 40 10-18 6-34 2-40-10z" fill="#e0a66a" />
    </svg>
  )
}

export function VinbarMark() {
  return (
    <svg width="30" height="34" viewBox="0 0 30 34" aria-hidden="true">
      <path d="M6 3c-1 10 3 15 9 15s10-5 9-15z" fill="#4a1942" />
      <path d="M15 18v11M9 30h12" stroke="#4a1942" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M7.6 10c1 5 4 7.4 7.4 7.4s6.4-2.4 7.4-7.4z" fill="#b87333" />
    </svg>
  )
}
