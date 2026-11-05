/**
 * Mærkefiler ud fra logoet (public/oviaspecs-logo.svg), som bruges præcis som filen er:
 *
 *   public/og.jpg               1200 × 630, logoet på #F5F0EA (delingsbilledet)
 *   public/apple-touch-icon.png 180 × 180, logoet på #F5F0EA
 *   public/favicon.svg          logoet på #F5F0EA, uden den indlejrede C2PA-metadata (21 kB → kun tegningen)
 *
 * Kør `npm run brand`, hvis logoet ændres, og commit filerne.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const LIGHT = '#F5F0EA'
const logo = readFileSync('public/oviaspecs-logo.svg')

/** Logoet i en given højde, med gennemsigtig baggrund. */
const render = (size) => sharp(logo, { density: 384 }).resize(size, size).png().toBuffer()

async function onLight(width, height, size, out, format) {
  const base = sharp({ create: { width, height, channels: 3, background: LIGHT } })
  const img = base.composite([{ input: await render(size), gravity: 'centre' }])
  await (format === 'jpg' ? img.jpeg({ quality: 90, mozjpeg: true }) : img.png({ compressionLevel: 9 })).toFile(out)
  console.log(`  ${out}  ${width}x${height}`)
}

await onLight(1200, 630, 600, 'public/og.jpg', 'jpg')
await onLight(180, 180, 180, 'public/apple-touch-icon.png', 'png')

// Favicon: samme tegning med lys flade bagved. <metadata> (C2PA) fjernes; stierne røres ikke.
const svg = logo.toString('utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '').replace(/ xmlns:c2pa="[^"]*"/, '')
const withBg = svg.replace(/(<svg[^>]*>)/, `$1<rect width="1000" height="1000" fill="${LIGHT}"/>`).replace(/ width="1000" height="1000"/, '')
writeFileSync('public/favicon.svg', withBg)
console.log(`  public/favicon.svg  ${(withBg.length / 1024).toFixed(1)} kB`)
