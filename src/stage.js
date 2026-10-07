// Tracks scroll position as a continuous "stage" number:
// 0 when the first [data-stage] section is centred in the viewport, 1 for the second, …
let centers = []

export function measureStages() {
  const els = [...document.querySelectorAll('section[data-stage]')]
  centers = els.map((el) => {
    const r = el.getBoundingClientRect()
    return r.top + window.scrollY + r.height / 2
  })
}

export function readStage() {
  if (!centers.length) return 0
  const y = window.scrollY + window.innerHeight / 2
  if (y <= centers[0]) return 0
  for (let i = 0; i < centers.length - 1; i++) {
    if (y < centers[i + 1]) return i + (y - centers[i]) / (centers[i + 1] - centers[i])
  }
  return centers.length - 1
}
