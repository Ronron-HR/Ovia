/**
 * Børstet metal som rå pixeldata (ingen DOM, ingen three.js), så det kan beregnes i en Web Worker.
 *
 * Fine riller: hver række (v) får sin egen dybde, der kun varierer svagt og uden fælles rytme langs
 * rillen (ellers ses et ternet mønster). Ud fra højderne laves et normal-kort og et roughness-kort,
 * der begge fliser sømløst. scene.js lægger dem i DataTextures.
 */
export const BRUSH_SIZE = 512 // langs rillerne (u)
export const BRUSH_ROWS = 1024 // på tværs (v)

const rand = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

export function brushedData(size = BRUSH_SIZE, rows = BRUSH_ROWS) {
  const rnd = rand(7)
  const rowBase = new Float32Array(rows)
  for (let y = 0; y < rows; y++) rowBase[y] = rnd() - 0.5 + (rnd() < 0.04 ? (rnd() - 0.5) * 2.2 : 0)
  // Let udglatning på tværs, så rillerne er bløde og ikke flimrer.
  const smooth = new Float32Array(rows)
  for (let y = 0; y < rows; y++) {
    smooth[y] = 0.25 * rowBase[(y + rows - 1) % rows] + 0.5 * rowBase[y] + 0.25 * rowBase[(y + 1) % rows]
  }
  const height = new Float32Array(size * rows)
  for (let y = 0; y < rows; y++) {
    const p = rnd() * Math.PI * 2
    const f = 1 + Math.floor(rnd() * 3)
    for (let x = 0; x < size; x++) {
      height[y * size + x] = smooth[y] * (1 + 0.1 * Math.sin((x / size) * Math.PI * 2 * f + p))
    }
  }
  const normal = new Uint8Array(size * rows * 4)
  const rough = new Uint8Array(size * rows * 4)
  const strength = 1.6
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x
      const dy = height[((y + 1) % rows) * size + x] - height[((y + rows - 1) % rows) * size + x]
      const dx = height[y * size + ((x + 1) % size)] - height[y * size + ((x + size - 1) % size)]
      let nx = -dx * strength * 0.2
      let ny = -dy * strength
      const l = Math.hypot(nx, ny, 1)
      nx /= l
      ny /= l
      const o = i * 4
      normal[o] = (nx * 0.5 + 0.5) * 255
      normal[o + 1] = (ny * 0.5 + 0.5) * 255
      normal[o + 2] = (1 / l) * 0.5 * 255 + 127.5
      normal[o + 3] = 255
      const g = Math.max(0, Math.min(255, (0.86 + height[i] * 0.22) * 255))
      rough[o] = rough[o + 1] = rough[o + 2] = g
      rough[o + 3] = 255
    }
  }
  return { normal, rough, size, rows }
}
