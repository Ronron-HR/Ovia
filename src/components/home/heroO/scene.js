/**
 * Three.js-scenen til heroens O. Hentes først i browseren (dynamisk import fra HeroO.jsx),
 * så three.js aldrig ligger i forsidens første JavaScript eller i forudrenderingen.
 *
 * Alt er proceduralt og lokalt (sidens CSP tillader kun egne filer):
 * - geometri fra geometry.js og børstet tekstur fra brushed.js, beregnet én gang i en Web Worker
 * - børstet metal: fine riller på tværs af profilen som normal- og roughness-kort;
 *   MeshPhysicalMaterial med anisotropi langs rillerne (UV u = langs kurven)
 * - studiolys: et lille rum med store softboxe og smalle mørke flag, bagt til et PMREM-miljø
 * - skygge: en blød, statisk ellipse under figuren
 *
 * Renderloopet ændrer kun transformationer på eksisterende objekter. Tiden er den målte tid
 * mellem frames (uafhængig af skærmens opdateringsfrekvens) og står stille, når loopet er pauset.
 */
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CubeCamera,
  DataTexture,
  Group,
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  Vector2,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from 'three'
import { buildAll } from './build.js'
import { BASE, LOOP_SECONDS, createPose, createPoseBuffer } from './motion.js'

/** Rammen kameraet skal kunne se (O'et ved fuld åbning + skyggen), i scenens enheder. */
const FRAME = { centerY: -0.07, halfHeight: 1.38, halfWidth: 1.2 }
const FOV = 18
const SHADOW_Y = -1.13
const MAX_DPR = 2

/* ---------- børstet overflade ---------- */

/** Normal- og roughness-kort fra rå pixeldata (brushed.js), der fliser sømløst. */
function brushedMaps({ normal, rough, size, rows }) {
  const tex = (data) => {
    const t = new DataTexture(data, size, rows)
    t.wrapS = t.wrapT = RepeatWrapping
    t.magFilter = LinearFilter
    t.minFilter = LinearMipmapLinearFilter
    t.generateMipmaps = true
    t.anisotropy = 8
    // u = buelængde langs delen, v = position rundt i profilen.
    t.repeat.set(1.6, 2.4)
    t.needsUpdate = true
    return t
  }
  return { normal: tex(normal), roughness: tex(rough) }
}

/* ---------- tunge beregninger uden for hovedtråden ---------- */

/**
 * Geometri og tekstur beregnes i en Web Worker (build.worker.js), så hovedtråden ikke blokeres
 * (det gav lange opgaver og høj Total Blocking Time). Kan en worker ikke startes, regnes det her.
 */
function buildOffThread() {
  return new Promise((resolve) => {
    let worker
    try {
      worker = new Worker(new URL('./build.worker.js', import.meta.url), { type: 'module' })
    } catch {
      resolve(null)
      return
    }
    worker.onmessage = (e) => {
      resolve(e.data)
      worker.terminate()
    }
    worker.onerror = () => {
      resolve(null)
      worker.terminate()
    }
    worker.postMessage(0)
  })
}

/** Giv browseren pusterum mellem opstartens trin, så de bliver hver sin korte opgave. */
const nextTask = () =>
  globalThis.scheduler?.yield ? globalThis.scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0))

/* ---------- studiomiljø ---------- */

/**
 * Et lille fotostudie: et gråt rum, der er lysest foroven, store softboxe (HDR > 1), og smalle
 * sorte flag, der giver de mørke refleksionsbånd. Bages én gang til et PMREM-kort.
 */
async function studioEnvironment(renderer) {
  const env = new Scene()
  const disposables = []
  const add = (geometry, material, setup) => {
    const mesh = new Mesh(geometry, material)
    setup(mesh)
    env.add(mesh)
    disposables.push(geometry, material)
    return mesh
  }

  // Rummet: lodret toneforløb. Gulvet er lyst, så undersiden passer til den hvide side.
  const room = new SphereGeometry(20, 48, 24)
  const pos = room.attributes.position
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 20
    const x = pos.getX(i) / 20
    const v = y > 0 ? 0.17 + 0.2 * y : 0.17 + 0.2 * -y
    const warm = 1 + 0.03 * x
    colors[i * 3] = v * warm
    colors[i * 3 + 1] = v
    colors[i * 3 + 2] = v / warm
  }
  room.setAttribute('color', new BufferAttribute(colors, 3))
  add(room, new MeshBasicMaterial({ side: BackSide, vertexColors: true }), () => {})

  const panel = (w, h, intensity, x, y, z, tint = [1, 1, 1]) =>
    // lookAt vender planets forside (+Z) mod figuren.
    add(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(intensity * tint[0], intensity * tint[1], intensity * tint[2]) }), (m) => {
      m.position.set(x, y, z)
      m.lookAt(0, 0, 0)
    })

  // Store lyse flader
  panel(9, 6, 4.2, -6, 7, 6) // nøglelys: stor softbox oppe til venstre foran
  panel(14, 3.4, 1.35, 0, 1.4, 11) // bred front, giver de brede flader deres sølvtone
  panel(1.6, 12, 6, 9, 1, -3) // smal strip-light bag til højre: kantlys
  panel(1.2, 10, 3, -9, -1, -4) // svagere strip bag til venstre
  panel(7, 7, 2.6, 2, 12, -2) // ovenlys
  panel(10, 2.4, 1.1, 0, -9, 5, [1.03, 1, 0.96]) // varmt reflekskort fra gulvet

  // Smalle mørke flag: bånd, der glider over metallet, når delene bevæger sig
  panel(16, 0.7, 0, 0, 3.4, 10.6)
  panel(1.1, 14, 0, -10, 0, 2)
  panel(16, 0.45, 0, 0, -0.7, 10.8)
  panel(0.6, 10, 0, 6.5, 2, 9)
  panel(0.5, 10, 0, -3.2, 1, 10.4)

  // Svarer til pmrem.fromScene(env), men delt op i korte opgaver: studiets shadere kompileres
  // parallelt, terningen tegnes, og filtreringen kører hver for sig, så hovedtråden ikke blokeres
  // i flere hundrede ms på langsomme telefoner. (Uden fromScenes ekstra slør; GGX-filtreringen
  // slører allerede efter ruhed.)
  const cubeTarget = new WebGLCubeRenderTarget(256, { type: HalfFloatType })
  const cubeCamera = new CubeCamera(0.1, 50, cubeTarget)
  if (renderer.compileAsync) await renderer.compileAsync(env, cubeCamera)
  await nextTask()
  cubeCamera.update(renderer, env)
  await nextTask()
  const pmrem = new PMREMGenerator(renderer)
  pmrem.compileCubemapShader()
  await nextTask()
  const target = pmrem.fromCubemap(cubeTarget.texture)
  pmrem.dispose()
  cubeTarget.dispose()
  for (const d of disposables) d.dispose()
  return target
}

/* ---------- skygge ---------- */

function softShadow() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  // Glat aftagende (tilnærmet gaussisk), så kanten aldrig ses.
  for (let i = 0; i <= 16; i++) {
    const x = i / 16
    g.addColorStop(x, `rgba(255,255,255,${(Math.exp(-4.2 * x * x) - Math.exp(-4.2)) / (1 - Math.exp(-4.2))})`)
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const map = new CanvasTexture(c)
  const geometry = new PlaneGeometry(1, 1)
  const material = new MeshBasicMaterial({ map, color: new Color(0x1a1712), transparent: true, opacity: 0.24, depthWrite: false })
  const mesh = new Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.scale.set(2.2, 0.8, 1)
  mesh.position.y = SHADOW_Y
  mesh.renderOrder = -1
  return mesh
}

/* ---------- opsætning ---------- */

/**
 * Bygger scenen på `canvas`. Asynkron: de tunge trin kører i en worker eller som hver sin korte
 * opgave, så siden forbliver svarparat. Afviser, hvis WebGL ikke kan startes (HeroO viser så
 * stillbilledet). Returnerer et lille API; intet her rører React.
 */
export async function createHeroO(canvas, { onFirstFrame, onContextLost } = {}) {
  const data = (await buildOffThread()) ?? buildAll()
  await nextTask()

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.04
  await nextTask()

  const scene = new Scene()
  const envTarget = await studioEnvironment(renderer)
  scene.environment = envTarget.texture
  await nextTask()

  const maps = brushedMaps(data.brush)
  const steel = new MeshPhysicalMaterial({
    color: new Color(0.6, 0.6, 0.62),
    metalness: 1,
    roughness: 0.34,
    roughnessMap: maps.roughness,
    normalMap: maps.normal,
    normalScale: new Vector2(0.35, 0.35),
    anisotropy: 0.72,
    envMapIntensity: 1,
  })
  const champagne = new MeshPhysicalMaterial({
    color: new Color(0.78, 0.56, 0.38),
    metalness: 1,
    roughness: 0.3,
    roughnessMap: maps.roughness,
    normalMap: maps.normal,
    normalScale: new Vector2(0.18, 0.18),
    anisotropy: 0.45,
    envMapIntensity: 0.92,
  })

  const root = new Group() // drejning om lodret akse
  const tilt = new Group() // fast 3D-vinkel
  tilt.rotation.set(BASE.pitch, 0, BASE.roll)
  root.add(tilt)
  scene.add(root)

  const parts = data.parts.map((g) => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(g.positions, 3))
    geometry.setAttribute('normal', new BufferAttribute(g.normals, 3))
    geometry.setAttribute('tangent', new BufferAttribute(g.tangents, 4))
    geometry.setAttribute('uv', new BufferAttribute(g.uvs, 2))
    geometry.setIndex(new BufferAttribute(g.index, 1))
    for (const grp of g.groups) geometry.addGroup(grp.start, grp.count, grp.materialIndex)
    geometry.computeBoundingSphere()
    const mesh = new Mesh(geometry, [steel, champagne])
    mesh.position.fromArray(g.pivot)
    tilt.add(mesh)
    return { mesh, pivot: g.pivot, axes: g.axes }
  })

  const shadow = softShadow()
  scene.add(shadow)

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
  // Shaderne kompileres parallelt (KHR_parallel_shader_compile, hvor browseren har det), så den
  // første frame ikke blokerer hovedtråden med kompilering.
  if (renderer.compileAsync) await renderer.compileAsync(scene, camera)

  const pose = createPose(parts.map((p) => p.axes))
  const buf = createPoseBuffer()
  const apply = (t) => {
    pose(t, buf)
    root.rotation.y = buf.yaw
    for (let i = 0; i < 3; i++) {
      const { mesh, pivot } = parts[i]
      mesh.position.set(pivot[0] + buf.offset[3 * i], pivot[1] + buf.offset[3 * i + 1], pivot[2] + buf.offset[3 * i + 2])
      mesh.quaternion.set(buf.quat[4 * i], buf.quat[4 * i + 1], buf.quat[4 * i + 2], buf.quat[4 * i + 3])
    }
  }

  let width = 0
  let height = 0
  let dpr = 1
  let dprCap = MAX_DPR
  const setSize = (w, h, pixelRatio = window.devicePixelRatio || 1) => {
    if (!w || !h) return
    width = w
    height = h
    dpr = Math.min(pixelRatio, dprCap)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    const aspect = w / h
    camera.aspect = aspect
    // Fast kamera; afstanden vælges, så hele rammen altid er synlig (ingen beskæring).
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180)
    const dist = Math.max(FRAME.halfHeight / tan, FRAME.halfWidth / (tan * aspect))
    camera.position.set(0, FRAME.centerY + dist * 0.06, dist)
    camera.lookAt(0, FRAME.centerY, 0)
    camera.updateProjectionMatrix()
  }

  let elapsed = 0
  let last = -1
  let raf = 0
  let running = false
  let firstFrame = true
  // Adaptiv opløsning: er frames gennemsnitligt langsomme, sænkes pixelratio en smule.
  let slowAvg = 1 / 60
  let frames = 0

  const draw = () => {
    renderer.render(scene, camera)
    if (firstFrame) {
      firstFrame = false
      onFirstFrame?.()
    }
  }

  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    if (last >= 0) {
      const dt = Math.min((now - last) / 1000, 0.1)
      elapsed = (elapsed + dt) % LOOP_SECONDS
      frames++
      slowAvg += (dt - slowAvg) * 0.05
      if (frames > 90 && slowAvg > 1 / 40 && dprCap > 1) {
        dprCap = Math.max(1, dpr * 0.75)
        frames = 0
        setSize(width, height)
      }
    }
    last = now
    apply(elapsed)
    draw()
  }

  const onLost = (e) => {
    e.preventDefault()
    stop()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  function start() {
    if (running) return
    running = true
    last = -1
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  return {
    setSize,
    start,
    stop,
    /** Tegner et enkelt billede ved tiden t (stillbillede, reduceret bevægelse, kontrol). */
    renderAt(t) {
      elapsed = ((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS
      apply(elapsed)
      draw()
    },
    get time() {
      return elapsed
    },
    get pixelRatio() {
      return dpr
    },
    dispose() {
      stop()
      canvas.removeEventListener('webglcontextlost', onLost)
      for (const { mesh } of parts) mesh.geometry.dispose()
      shadow.geometry.dispose()
      shadow.material.map.dispose()
      shadow.material.dispose()
      steel.dispose()
      champagne.dispose()
      maps.normal.dispose()
      maps.roughness.dispose()
      envTarget.dispose()
      renderer.dispose()
    },
  }
}
