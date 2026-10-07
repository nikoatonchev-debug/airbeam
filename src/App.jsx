import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Scene from './components/Scene'
import Preloader from './components/Preloader'
import { Header, Hud, Menu } from './components/Chrome'
import { Editions, Faq, Features, Hero, Intro, Join, Specs } from './components/Sections'
import { EDITIONS } from './data'
import { measureStages, readStage } from './stage'
import { N, carousel, mod } from './controls'
import { playBlip } from './audio'

export default function App() {
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [edition, setEditionState] = useState(0)
  const [stage, setStage] = useState(0)
  const editionRef = useRef(0)
  const lenis = useRef(null)

  const applyTarget = useCallback((t) => {
    carousel.target = t
    const i = mod(t)
    if (i !== editionRef.current) playBlip()
    editionRef.current = i
    setEditionState(i)
  }, [])
  // Jump to an edition the shortest way round the looping line-up.
  const setEdition = useCallback(
    (i) => {
      const half = Math.floor(N / 2)
      applyTarget(carousel.target + mod(i - mod(carousel.target) + half) - half)
    },
    [applyTarget],
  )
  const step = useCallback((n) => applyTarget(carousel.target + n), [applyTarget])

  // Smooth scrolling (off for reduced motion) + stage tracking for the HUD.
  useEffect(() => {
    if (!reducedMotion) lenis.current = new Lenis({ autoRaf: true, lerp: 0.09 })
    // Polled per frame: scroll events can be skipped while Lenis is stopped/started.
    let raf
    const tick = () => {
      setStage(Math.round(readStage()))
      raf = requestAnimationFrame(tick)
    }
    measureStages()
    tick()
    const ro = new ResizeObserver(measureStages)
    ro.observe(document.body)
    document.fonts?.ready.then(measureStages)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      lenis.current?.destroy()
    }
  }, [reducedMotion])

  // Lock scroll while loading or while the menu is open.
  useEffect(() => {
    const locked = !ready || menuOpen
    document.documentElement.style.overflow = locked ? 'hidden' : ''
    if (locked) lenis.current?.stop()
    else lenis.current?.start()
  }, [ready, menuOpen])

  const go = useCallback((href) => {
    const el = document.querySelector(href)
    if (!el) return
    if (lenis.current) lenis.current.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView()
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      e.preventDefault()
      go(a.getAttribute('href'))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [go])

  const { scrollY } = useScroll()
  const heroWordOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const heroWordY = useTransform(scrollY, [0, 500], [0, -120])

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        {EDITIONS.map((e, i) => (
          <motion.div
            key={e.id}
            className="backdrop-layer"
            style={{ '--glow': e.glow, '--deep': e.deep }}
            animate={{ opacity: i === edition ? 1 : 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
        ))}
        <div className="backdrop-grain" />
      </div>

      <motion.div className="hero-word" aria-hidden="true" style={{ opacity: heroWordOpacity, y: heroWordY }}>
        <motion.span
          initial={{ opacity: 0, scale: 1.15, filter: 'blur(20px)' }}
          animate={ready ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          AIRBEAM
        </motion.span>
      </motion.div>

      <Scene editionRef={editionRef} reducedMotion={!!reducedMotion} />

      <Header ready={ready} onMenu={() => setMenuOpen(true)} onContact={() => go('#join')} />
      <Hud ready={ready} stage={stage} edition={edition} setEdition={setEdition} />
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} go={go} />

      <main>
        <Hero ready={ready} />
        <Intro />
        <Features />
        <Editions edition={edition} setEdition={setEdition} step={step} active={stage === 6} go={go} />
        <Specs />
        <Faq />
        <Join />
      </main>

      <Preloader onDone={() => setReady(true)} />
    </>
  )
}
