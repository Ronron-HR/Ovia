/**
 * Værktøj til konceptillustrationerne.
 *
 * Illustrationerne er tegnet til siden: egne former, egen tekst og egne
 * farver. De bruger ingen fotos, logoer, menukort, priser, anmeldelser eller
 * tekster fra virksomhederne. De er IKKE skærmbilleder og må ikke fremstilles
 * som det. De viser designretningen, som demoerne har.
 *
 * Alt er placeret i "designenheder": u = 100cqw ÷ sidens designbredde (1440
 * på computer, 390 på telefon). Illustrationen skalerer derfor skarpt til
 * enhver ramme og fylder ingen billedfiler.
 *
 * For at holde HTML'en lille skrives placering og størrelse som CSS-variabler
 * (--x, --y, --w, --h, --r, --s) på korte klasser (.b, .t i stage.css) frem
 * for som lange inline-stilarter.
 */

export const U = (n) => `calc(${n} * var(--u))`

const vars = (o) => {
  const out = {}
  for (const [k, v] of Object.entries(o)) if (v != null) out[`--${k}`] = v
  return out
}

/** Absolut placeret boks i designenheder. */
export function Box({ x, y, w, h, r, bg, border, style, className = '', children }) {
  return (
    <div
      className={`b ${className}`}
      style={{
        ...vars({ x, y, w, h, r }),
        background: bg,
        border: border ? `${U(border[0])} solid ${border[1]}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Tekst. Enkelt linje som standard; brug <br /> eller w til brud. */
export function Txt({
  x,
  y,
  w,
  size,
  color,
  weight,
  serif = false,
  italic = false,
  track,
  lh,
  align,
  caps = false,
  style,
  children,
}) {
  return (
    <div
      className={`t ${serif ? 't-serif' : ''} ${w ? '' : 't-nowrap'}`}
      style={{
        ...vars({ x, y, w, s: size, lh }),
        color,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : undefined,
        letterSpacing: track != null ? `${track}em` : undefined,
        textAlign: align,
        textTransform: caps ? 'uppercase' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Tekstlinjer tegnet som streger: brødtekst, der ikke skal læses. Ét element. */
export function Skel({ x, y, w, n = 3, gap = 20, h = 8, color = 'rgb(0 0 0 / .12)' }) {
  return (
    <div
      className="b sk"
      style={{
        ...vars({ x, y, w, h: (n - 1) * gap + h, sh: h, sg: gap }),
        '--sc': color,
      }}
    />
  )
}

/** En knap. */
export function Btn({ x, y, w, h = 48, label, bg, color, border, r = 4, size = 15, weight = 500 }) {
  return (
    <Box
      x={x}
      y={y}
      w={w}
      h={h}
      r={r}
      bg={bg}
      border={border}
      className="bt"
      style={{ ...vars({ s: size }), color, fontWeight: weight }}
    >
      {label}
    </Box>
  )
}

/* ---- Egne billedflader: former og farver i stedet for fotos ---------------- */

/** Rund lampe eller spejl. */
export function Orb({ x, y, d, from, to, ring, glow = false }) {
  return (
    <Box
      x={x}
      y={y}
      w={d}
      h={d}
      r={d / 2}
      style={{
        background: glow
          ? `radial-gradient(circle at 50% 50%, ${from} 0%, ${to} 70%)`
          : `radial-gradient(circle at 35% 30%, ${from}, ${to})`,
        boxShadow: ring ? `0 0 0 ${U(d * 0.035)} ${ring}` : undefined,
      }}
    />
  )
}

/** Flade med lodrette lister: træpaneler. */
export function Slats({ x, y, w, h, a, b, step = 26 }) {
  return (
    <Box
      x={x}
      y={y}
      w={w}
      h={h}
      style={{
        background: `repeating-linear-gradient(90deg, ${a} 0, ${a} ${U(step - 4)}, ${b} ${U(step - 4)}, ${b} ${U(step)})`,
      }}
    />
  )
}

/** Ternet dug. */
export function Checks({ x, y, w, h, a = '#b3262d', b = '#f4ece0', size = 44, opacity = 1 }) {
  return (
    <Box
      x={x}
      y={y}
      w={w}
      h={h}
      style={{
        opacity,
        background: `repeating-conic-gradient(${a} 0% 25%, ${b} 0% 50%) 0 0 / ${U(size)} ${U(size)}`,
      }}
    />
  )
}

/** Tallerken set ovenfra. */
export function Plate({ x, y, d, food = '#c9702d', rim = '#f6efe6', accent = '#5a7d3a' }) {
  return (
    <Box x={x} y={y} w={d} h={d} r={d / 2} bg={rim} style={{ boxShadow: `inset 0 0 0 ${U(d * 0.03)} rgb(0 0 0 / .06)` }}>
      <Box x={d * 0.2} y={d * 0.2} w={d * 0.6} h={d * 0.6} r={d * 0.3} bg={food} />
      <Box x={d * 0.36} y={d * 0.3} w={d * 0.22} h={d * 0.22} r={d * 0.11} bg={accent} />
      <Box x={d * 0.5} y={d * 0.5} w={d * 0.16} h={d * 0.16} r={d * 0.08} bg="rgb(255 255 255 / .35)" />
    </Box>
  )
}

/** Polaroid: hvid ramme om en farveflade. */
export function Polaroid({ x, y, w, h, fill, rot = 0, children }) {
  return (
    <Box
      x={x}
      y={y}
      w={w}
      h={h}
      bg="#fff"
      style={{
        transform: `rotate(${rot}deg)`,
        boxShadow: '0 6px 18px rgb(0 0 0 / .16)',
        padding: `${U(w * 0.06)} ${U(w * 0.06)} ${U(w * 0.2)}`,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', background: fill, overflow: 'hidden' }}>
        {children}
      </div>
    </Box>
  )
}

/** Sideskal: sætter enheden og skjuler indholdet for hjælpemidler. */
export function Page({ w, h, mode, bg, children }) {
  return (
    <div
      aria-hidden="true"
      className={`cp ${mode === 'm' ? 'cp-m' : 'cp-d'}`}
      style={{ aspectRatio: `${w} / ${h}`, background: bg }}
    >
      {children}
    </div>
  )
}
