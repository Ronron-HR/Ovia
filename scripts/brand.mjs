/**
 * Brand-assets. Kør efter en farveændring:
 *
 *   npm run brand
 *
 * Skabelonerne i scripts/brand/*.svg bruger {{ink}}, {{paper}} og {{accent}}.
 * Farverne læses fra @theme i src/index.css — det er den eneste kilde. Ud
 * kommer:
 *
 *   public/favicon.svg, logo*.svg, maerke*.svg   (SVG, farverne sat ind)
 *   public/apple-touch-icon.png                  (180 × 180)
 *   public/og.jpg                                (1200 × 630, til delinger)
 *
 * Bogstavformerne er Instrument Serif tegnet som stier, så intet af det
 * afhænger af, at skriften er hentet. Skift tegningen ved at ændre
 * skabelonerne (og stierne i src/components/Logo.jsx, som er samme tegning).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const css = readFileSync('src/index.css', 'utf8')
const token = (name) => {
  const m = css.match(new RegExp(`--color-${name}: *(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`--color-${name} findes ikke i src/index.css`)
  return m[1].toUpperCase()
}
const colors = { ink: token('ink'), paper: token('paper'), accent: token('accent') }
const fill = (svg) => svg.replace(/\{\{(ink|paper|accent)\}\}/g, (_, k) => colors[k])

const RASTER = {
  'apple-touch-icon': { to: 'public/apple-touch-icon.png', w: 180, h: 180, png: true },
  og: { to: 'public/og.jpg', w: 1200, h: 630 },
}

console.log('farver', colors)

for (const file of readdirSync('scripts/brand').filter((f) => f.endsWith('.svg'))) {
  const name = file.replace(/\.svg$/, '')
  const svg = fill(readFileSync(`scripts/brand/${file}`, 'utf8'))
  const job = RASTER[name]

  if (!job) {
    writeFileSync(`public/${file}`, svg)
    console.log(`  public/${file}`)
    continue
  }

  // Høj tæthed ved indlæsning, så kanterne bliver rene efter nedskalering.
  let img = sharp(Buffer.from(svg), { density: 288 }).resize(job.w, job.h)
  img = job.png ? img.png() : img.jpeg({ quality: 90, mozjpeg: true })
  await img.toFile(job.to)
  console.log(`  ${job.to}  ${job.w}x${job.h}`)
}
