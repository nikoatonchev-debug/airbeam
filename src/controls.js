import { EDITIONS } from './data'

export const N = EDITIONS.length
export const mod = (a, n = N) => ((a % n) + n) % n

// Shared, non-React state read every frame by the 3D scene.
// carousel.target is an unbounded integer so the line-up can loop endlessly;
// carousel.drag is the live drag offset in "items" while the user pulls the line-up.
export const carousel = { target: 0, drag: 0 }

// Normalised mouse position (-1..1, y up), updated from window events because the canvas
// itself ignores pointer events.
export const mouse = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
  document.addEventListener('pointerleave', () => {
    mouse.x = 0
    mouse.y = 0
  })
}

// Distance of the line-up in screen pixels between two neighbouring products.
export function spreadPx() {
  const worldSpread = window.innerWidth < 768 ? 1.15 : 2.6
  const viewHeight = 2 * 10 * Math.tan((15 * Math.PI) / 180) // camera z=10, fov 30
  return (worldSpread * window.innerHeight) / viewHeight
}
