/**
 * Introduktionspladser (30 % på engangsprisen til de første kunder, der lader siden vise som case).
 * Tallet bor ét sted: "introSlotsLeft" i src/data/prices.json. Når det er 0, findes introprisen ikke
 * længere på siden, i beregneren, i mailen eller i workeren.
 *
 *   npm run intro:status   viser kun antal pladser tilbage
 *   npm run intro:brugt    trækker 1 fra (aldrig under 0), kører npm test, committer og pusher til main
 *
 * intro:brugt NÆGTER at køre, hvis arbejdsmappen ikke er ren, hvis du ikke står på main, eller hvis main
 * ikke er ajour med origin. Fejler testene, sker der hverken commit eller push, og tallet rulles tilbage.
 *
 * Til test af scriptet selv:
 *   --config <fil>   arbejd på en kopi af prices.json (ingen git, ingen test, ingen push)
 *   INTRO_TEST_CMD   erstatter "npm test" (bruges af scripts/test-intro.mjs)
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_CONFIG = join(ROOT, 'src/data/prices.json')
const RE = /("introSlotsLeft"\s*:\s*)(-?\d+)/

const fail = (msg) => {
  console.error(`\nFEJL: ${msg}\n`)
  process.exit(1)
}

function readSlots(file) {
  const m = RE.exec(readFileSync(file, 'utf8'))
  if (!m) fail(`Fandt ikke "introSlotsLeft" i ${file}.`)
  return Number(m[2])
}

function writeSlots(file, n) {
  const text = readFileSync(file, 'utf8')
  writeFileSync(file, text.replace(RE, (_, a) => a + n))
}

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()

function guards() {
  if (git('status', '--porcelain') !== '') {
    fail('Arbejdsmappen er ikke ren. Commit eller gem dine ændringer først (git status viser, hvad der er ændret).')
  }
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
  if (branch !== 'main') fail(`Du står på "${branch}". Skift til main først (git switch main).`)
  try {
    git('fetch', 'origin', 'main')
  } catch {
    fail('Kunne ikke hente fra origin, så jeg kan ikke tjekke, om main er ajour. Tjek netværket og prøv igen.')
  }
  const local = git('rev-parse', 'main')
  const remote = git('rev-parse', 'origin/main')
  if (local !== remote) {
    fail('main er ikke ajour med origin. Kør git pull --ff-only (eller git push, hvis du er foran) og prøv igen.')
  }
}

function runTests() {
  const cmd = process.env.INTRO_TEST_CMD || 'npm test'
  console.log(`Kører ${cmd} ...`)
  return spawnSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true }).status === 0
}

const args = process.argv.slice(2)
const command = args[0]
const ci = args.indexOf('--config')
const copy = ci >= 0 ? args[ci + 1] : null
const file = copy || DEFAULT_CONFIG

if (command === 'status') {
  const n = readSlots(file)
  console.log(n === 1 ? '1 intro-plads tilbage' : `${n} intro-pladser tilbage`)
} else if (command === 'brugt') {
  if (copy) {
    // Testkopi: kun tallet ændres. Ingen git, ingen test, ingen push.
    const before = readSlots(copy)
    if (before <= 0) {
      console.log('Ingen intro-pladser tilbage (0). Intet ændret.')
    } else {
      writeSlots(copy, before - 1)
      console.log(`Intro-plads brugt – ${before - 1} tilbage (testkopi, ingen commit/push)`)
    }
  } else {
    guards()
    const before = readSlots(file)
    if (before <= 0) {
      console.log('Ingen intro-pladser tilbage (0). Intet ændret, ingen commit.')
      process.exit(0)
    }
    const after = before - 1
    writeSlots(file, after)
    if (!runTests()) {
      writeSlots(file, before)
      fail(`Testene fejler, så der er hverken committet eller pushet. Tallet er rullet tilbage til ${before}. Ret fejlen og kør kommandoen igen.`)
    }
    const message = `Intro-plads brugt – ${after} tilbage`
    git('add', 'src/data/prices.json')
    git('commit', '-m', message)
    try {
      git('push', 'origin', 'main')
    } catch {
      fail(`Committet lokalt (“${message}”), men pushen til main fejlede. Kør git push origin main, når du er online. Ret ikke tallet igen.`)
    }
    console.log(`${message}. Pushet til main; siden opdateres automatisk om et øjeblik.`)
  }
} else {
  fail('Brug: npm run intro:status  eller  npm run intro:brugt')
}
