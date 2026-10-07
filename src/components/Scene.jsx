import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { EDITIONS } from '../data'
import { readStage } from '../stage'
import { N, carousel, mod, mouse } from '../controls'

const MODEL_URL = import.meta.env.BASE_URL + 'models/airbeam.glb'
useGLTF.preload(MODEL_URL)

// Case centre / size and the lid hinge, measured from the source model (model units).
const CASE_CENTER = new THREE.Vector3(1.435, -0.54, 0.02)
const HINGE = new THREE.Vector3(1.435, 0.12, -0.85)
const NORMALIZE = 0.5
const LID_OPEN = -1.85
const BUD_LIFT = 2.7

// One pose per stage (see STAGES in data.js). x/y/z in world units, r* in radians.
const POSES = [
  { x: 0, y: -0.05, z: 0, rx: 0.18, ry: -0.55, rz: 0, s: 1.0, lid: 0, lift: 0, line: 0 }, // hero
  { x: 1.35, y: -0.1, z: 0, rx: 0.42, ry: -0.95, rz: 0.05, s: 1.05, lid: 1, lift: 0, line: 0 }, // intro
  { x: -1.4, y: -0.55, z: 0, rx: 0.15, ry: 0.65, rz: -0.08, s: 0.95, lid: 1, lift: 0.85, line: 0 }, // ANC
  { x: 1.4, y: -0.5, z: 0, rx: 0.2, ry: -2.6, rz: 0.1, s: 0.95, lid: 1, lift: 0.85, line: 0 }, // spatial
  { x: -1.4, y: -0.1, z: 0, rx: 0.75, ry: 0.35, rz: 0, s: 1.05, lid: 1, lift: 0.25, line: 0 }, // battery
  { x: 1.4, y: -0.55, z: 0, rx: -0.1, ry: -5.4, rz: 0.22, s: 0.95, lid: 1, lift: 0.85, line: 0 }, // fit
  { x: 0, y: 0.42, z: 0, rx: 0.12, ry: -6.28, rz: 0, s: 0.72, lid: 0, lift: 0, line: 1 }, // editions
  { x: -1.55, y: -0.1, z: 0, rx: 0.35, ry: -5.6, rz: 0, s: 0.95, lid: 1, lift: 0.55, line: 0 }, // specs
  { x: 0, y: 0.1, z: -3.5, rx: 0.2, ry: -7.4, rz: 0, s: 1.0, lid: 0, lift: 0, line: 0 }, // faq
  { x: 0, y: 0.1, z: -3.5, rx: 0.2, ry: -8.4, rz: 0, s: 1.0, lid: 1, lift: 0, line: 0 }, // join
]
const KEYS = Object.keys(POSES[0])
const smooth = (t) => t * t * (3 - 2 * t)

function samplePose(stage, out) {
  const i = Math.min(Math.floor(stage), POSES.length - 1)
  const j = Math.min(i + 1, POSES.length - 1)
  const t = smooth(stage - i)
  for (const k of KEYS) out[k] = POSES[i][k] + (POSES[j][k] - POSES[i][k]) * t
  return out
}

// Rebuilds the imported model with our own materials and animatable parts.
function buildModel(source, color) {
  const root = source.clone(true)
  const body = new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.18, metalness: 0.05 })
  const tip = new THREE.MeshPhysicalMaterial({ color, roughness: 0.75, sheen: 1, sheenRoughness: 0.6 })
  const metal = new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: 1, roughness: 0.25 })
  const dark = new THREE.MeshStandardMaterial({ color: '#0b0b0e', metalness: 0.2, roughness: 0.55 })
  const led = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveIntensity: 3 })

  root.traverse((o) => {
    if (!o.isMesh) return
    const pick = (m) => {
      const n = m.name
      if (n === 'Mat.1' || n === 'DefaultMaterial') return body
      if (n === 'Mat.2') return tip
      if (n === 'Mat.5') return metal
      if (n === 'Mat.4') return led
      return dark
    }
    o.material = Array.isArray(o.material) ? o.material.map(pick) : pick(o.material)
  })

  root.updateMatrixWorld(true)
  const lid = root.getObjectByName('Lid')
  const pivot = new THREE.Group()
  lid.parent.add(pivot)
  pivot.position.copy(lid.parent.worldToLocal(HINGE.clone()))
  pivot.updateMatrixWorld(true)
  pivot.attach(lid)

  const pods = root.getObjectByName('Airpods')
  const buds = new THREE.Group()
  root.add(buds)
  buds.attach(pods)

  const inner = new THREE.Group()
  inner.add(root)
  inner.scale.setScalar(NORMALIZE)
  inner.position.copy(CASE_CENTER).multiplyScalar(-NORMALIZE)

  return { object: inner, pivot, buds, body, tip, led }
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smoothRange = (a, b, v) => smooth(clamp01((v - a) / (b - a)))

// Where a product sits in the line-up, d = signed distance (in items) from the centre slot.
function lineupSlot(d, spread) {
  const ad = Math.min(Math.abs(d), 1)
  return {
    x: d * spread,
    z: -0.7 * ad - 0.25 * Math.max(Math.abs(d) - 1, 0),
    s: 0.72 - 0.12 * ad,
    ry: -0.55 * Math.max(-1, Math.min(1, d)),
  }
}

function Product({ editionRef, reducedMotion }) {
  const { scene } = useGLTF(MODEL_URL)
  const { viewport, size } = useThree()
  const main = useMemo(() => buildModel(scene, EDITIONS[0].body), [scene])
  // The line-up: one product per edition, scrollable left/right like Ciao's cans.
  const clones = useMemo(
    () =>
      EDITIONS.map((e) => {
        const m = buildModel(scene, e.body)
        m.led.emissive.set(e.accent)
        return m
      }),
    [scene],
  )
  const group = useRef()
  const cloneGroups = useRef([])
  const pose = useMemo(() => ({}), [])
  const cur = useRef(null)
  const car = useRef(0)
  const look = useRef({ x: 0, y: 0 })
  const target = useMemo(() => new THREE.Color(), [])

  useFrame((state, dt) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    samplePose(readStage(), pose)
    if (!cur.current) cur.current = { ...pose }
    const c = cur.current
    const lambda = reducedMotion ? 50 : 5
    for (const k of KEYS) c[k] = THREE.MathUtils.damp(c[k], pose[k], lambda, dt)

    // Lid and buds move in sequence so the buds never pass through the lid:
    // the lid stays open while the buds are out, and the buds only rise once the lid is open.
    const lid = Math.max(c.lid, clamp01(c.lift / 0.3))
    const lift = c.lift * smoothRange(0.55, 1, lid)

    // Product gently trails the mouse.
    const follow = reducedMotion ? 0 : 1
    look.current.x = THREE.MathUtils.damp(look.current.x, mouse.x * follow, 2.5, dt)
    look.current.y = THREE.MathUtils.damp(look.current.y, mouse.y * follow, 2.5, dt)
    const lx = look.current.x
    const ly = look.current.y

    const mobile = size.width < 768
    const xScale = mobile ? 0.12 : Math.min(1, viewport.width / 9)
    const sScale = mobile ? 0.56 : Math.min(1, viewport.width / 8.5)
    const spread = mobile ? 1.15 : 2.6
    const line = c.line

    const active = editionRef.current
    const dragging = carousel.drag !== 0
    car.current = THREE.MathUtils.damp(car.current, carousel.target + carousel.drag, dragging ? 18 : 5, dt)
    const wrapD = (j) => mod(j - car.current + N / 2, N) - N / 2

    const bobOf = (j) => Math.sin(t * 1.1 + j * 1.3) * 0.06
    const wobX = (j) => Math.sin(t * 0.6 + j) * 0.05
    const wobY = (j) => Math.sin(t * 0.5 + j) * 0.15

    // Main product: its scroll pose, blended into its line-up slot while the line-up is shown.
    const slot = lineupSlot(wrapD(active), spread)
    const g = group.current
    g.position.set(
      c.x * xScale + line * slot.x + lx * 0.15,
      c.y + (1 - line) * Math.sin(t * 1.1) * 0.06 + line * bobOf(active) + (mobile ? 1.05 * (1 - line) : 0) + ly * 0.1,
      c.z + line * slot.z,
    )
    g.rotation.set(
      c.rx + (1 - line) * Math.sin(t * 0.7) * 0.04 + line * wobX(active) - ly * 0.22,
      c.ry + (1 - line) * Math.sin(t * 0.4) * 0.12 + line * (slot.ry + wobY(active)) + lx * 0.38,
      c.rz,
    )
    g.scale.setScalar(c.s * sScale * (1 + line * (slot.s / 0.72 - 1)))
    main.pivot.rotation.x = LID_OPEN * lid
    main.buds.position.y = BUD_LIFT * lift
    main.buds.rotation.z = 0.12 * lift * lift

    // Colour: fade between editions, but switch instantly in the line-up so the swap is invisible.
    target.set(EDITIONS[active].body)
    const k = line > 0.3 ? 1 : 1 - Math.exp(-6 * dt)
    main.body.color.lerp(target, k)
    main.tip.color.copy(main.body.color)
    main.led.emissive.lerp(target.set(EDITIONS[active].accent), k)

    clones.forEach((m, j) => {
      const cg = cloneGroups.current[j]
      if (!cg) return
      cg.visible = line > 0.01 && j !== active
      if (!cg.visible) return
      const d = wrapD(j)
      const sl = lineupSlot(d, spread)
      const enter = 1 - line
      cg.position.set(sl.x * (1 + enter * 1.6) + lx * 0.15, 0.42 + bobOf(j) + enter * 0.4 + ly * 0.1, sl.z)
      cg.rotation.set(0.12 + wobX(j) - ly * 0.22, sl.ry + wobY(j) + enter * Math.sign(d) + lx * 0.38, 0)
      cg.scale.setScalar(sl.s * sScale * Math.max(line, 0.001))
    })
  })

  return (
    <>
      <group ref={group}>
        <primitive object={main.object} />
      </group>
      {clones.map((m, i) => (
        <group key={i} ref={(el) => (cloneGroups.current[i] = el)} visible={false}>
          <primitive object={m.object} />
        </group>
      ))}
    </>
  )
}

export default function Scene({ editionRef, reducedMotion }) {
  return (
    <Canvas
      className="scene"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-6, 2, -4]} intensity={1.2} color="#b9a6ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.5} position={[5, 1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, 6]} scale={4} />
      </Environment>
      <Product editionRef={editionRef} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
