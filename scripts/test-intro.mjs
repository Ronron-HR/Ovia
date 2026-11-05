/**
 * Test af scripts/intro.mjs i en midlertidig git-kopi med en lokal "origin" (bare repo).
 * Rører hverken det rigtige repo eller GitHub. Kør: node scripts/test-intro.mjs
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
let ok = 0
let bad = 0
const check = (name, cond, extra = '') => {
  if (cond) ok++
  else {
    bad++
    console.error(`  FEJL: ${name} ${extra}`)
  }
}
const sh = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim()

const base = mkdtempSync(join(tmpdir(), 'intro-'))
const origin = join(base, 'origin.git')
const work = join(base, 'work')
const other = join(base, 'other')
const CONFIG = 'src/data/prices.json'
const cfgOf = (dir) => JSON.parse(readFileSync(join(dir, CONFIG), 'utf8')).introSlotsLeft

try {
  sh(base, 'init', '--bare', '-b', 'main', origin)
  mkdirSync(work, { recursive: true })
  sh(work, 'init', '-b', 'main')
  sh(work, 'config', 'user.email', 't@example.com')
  sh(work, 'config', 'user.name', 'Test')
  mkdirSync(join(work, 'src/data'), { recursive: true })
  mkdirSync(join(work, 'scripts'), { recursive: true })
  writeFileSync(join(work, CONFIG), '{\n  "introSlotsLeft": 3,\n  "intro": { "total": 3 }\n}\n')
  cpSync(join(HERE, 'intro.mjs'), join(work, 'scripts/intro.mjs'))
  sh(work, 'add', '-A')
  sh(work, 'commit', '-m', 'start')
  sh(work, 'remote', 'add', 'origin', origin)
  sh(work, 'push', '-u', 'origin', 'main')

  const run = (cwd, args, env = {}) =>
    spawnSync(process.execPath, [join(cwd, 'scripts/intro.mjs'), ...args], { cwd, encoding: 'utf8', env: { ...process.env, INTRO_TEST_CMD: 'node -e "process.exit(0)"', ...env } })
  const originSubject = () => sh(origin, 'log', '-1', '--format=%s', 'main')

  console.log('intro:status')
  let r = run(work, ['status'])
  check('status viser 3', r.status === 0 && /3 intro-pladser tilbage/.test(r.stdout), r.stdout + r.stderr)

  console.log('testkopi 3→2→1→0→0 (ingen git)')
  const copy = join(base, 'kopi.json')
  writeFileSync(copy, readFileSync(join(work, CONFIG)))
  const seen = []
  for (let i = 0; i < 4; i++) {
    r = run(work, ['brugt', '--config', copy])
    seen.push(JSON.parse(readFileSync(copy, 'utf8')).introSlotsLeft)
  }
  check('3→2→1→0→0', seen.join(',') === '2,1,0,0', seen.join(','))
  check('testkopi rører ikke git', sh(work, 'status', '--porcelain') === '' && originSubject() === 'start')

  console.log('afvisninger')
  writeFileSync(join(work, 'snavs.txt'), 'x')
  r = run(work, ['brugt'])
  check('beskidt mappe afvises', r.status !== 0 && /ikke ren/.test(r.stderr) && cfgOf(work) === 3, r.stderr)
  rmSync(join(work, 'snavs.txt'))

  sh(work, 'switch', '-c', 'feature')
  r = run(work, ['brugt'])
  check('ikke main afvises', r.status !== 0 && /feature/.test(r.stderr) && cfgOf(work) === 3, r.stderr)
  sh(work, 'switch', 'main')

  sh(base, 'clone', origin, other)
  sh(other, 'config', 'user.email', 't@example.com')
  sh(other, 'config', 'user.name', 'Test')
  writeFileSync(join(other, 'ny.txt'), 'x')
  sh(other, 'add', '-A')
  sh(other, 'commit', '-m', 'andre')
  sh(other, 'push', 'origin', 'main')
  r = run(work, ['brugt'])
  check('main bagud for origin afvises', r.status !== 0 && /ikke ajour/.test(r.stderr) && cfgOf(work) === 3, r.stderr)
  sh(work, 'pull', '--ff-only')

  console.log('fejlende test: ingen commit/push, tal rulles tilbage')
  const before = sh(work, 'rev-parse', 'HEAD')
  r = run(work, ['brugt'], { INTRO_TEST_CMD: 'node -e "process.exit(1)"' })
  check('testfejl giver fejl på dansk', r.status !== 0 && /Testene fejler/.test(r.stderr), r.stderr)
  check('ingen commit, tal uændret, mappe ren', sh(work, 'rev-parse', 'HEAD') === before && cfgOf(work) === 3 && sh(work, 'status', '--porcelain') === '')
  check('intet pushet', sh(origin, 'rev-parse', 'main') === before)

  console.log('rigtigt forløb 3→2→1→0→0 med commit og push til (lokal) origin')
  for (const expect of [2, 1, 0]) {
    r = run(work, ['brugt'])
    check(`brugt → ${expect}`, r.status === 0 && cfgOf(work) === expect, r.stdout + r.stderr)
    check(`commit-tekst ${expect}`, sh(work, 'log', '-1', '--format=%s') === `Intro-plads brugt – ${expect} tilbage`)
    check(`pushet ${expect}`, originSubject() === `Intro-plads brugt – ${expect} tilbage` && sh(origin, 'rev-parse', 'main') === sh(work, 'rev-parse', 'HEAD'))
  }
  const head = sh(work, 'rev-parse', 'HEAD')
  r = run(work, ['brugt'])
  check('0 → 0, ingen ny commit', r.status === 0 && cfgOf(work) === 0 && sh(work, 'rev-parse', 'HEAD') === head && /Ingen intro-pladser/.test(r.stdout), r.stdout)
  r = run(work, ['status'])
  check('status ved 0', /0 intro-pladser tilbage/.test(r.stdout), r.stdout)
} finally {
  rmSync(base, { recursive: true, force: true })
}

console.log(`\nintro-scripts: ${ok} ok, ${bad} fejl`)
process.exit(bad ? 1 : 0)
