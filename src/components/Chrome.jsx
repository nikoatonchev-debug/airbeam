import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { EDITIONS } from '../data'
import { Icon, Logo } from './ui'
import { startMusic, stopMusic } from '../audio'

const ease = [0.22, 1, 0.36, 1]

function useMusic() {
  const [on, setOn] = useState(false)
  const toggle = () => {
    if (on) stopMusic()
    else startMusic()
    setOn(!on)
  }
  useEffect(() => stopMusic, [])
  return [on, toggle]
}

export function Header({ ready, onMenu, onContact }) {
  const [soundOn, toggleSound] = useMusic()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <motion.header
      className="header"
      initial={{ y: -30, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, delay: 0.5, ease }}
    >
      <div className="progress" aria-hidden="true">
        <motion.div className="progress-fill" style={{ scaleX: progress }} />
      </div>
      <div className="header-row">
        <button className="sound" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Sound ausschalten' : 'Sound einschalten'}>
          <span>{soundOn ? 'ON' : 'OFF'}</span>
          <span className={`bars ${soundOn ? 'is-on' : ''}`} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </span>
        </button>
        <a href="#hero" className="header-logo" aria-label="Airbeam – nach oben">
          <Logo />
        </a>
        <div className="header-right">
          <button className="menu-btn" onClick={onMenu}>
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            MENÜ
          </button>
          <button className="contact-btn" onClick={onContact}>
            KONTAKT
          </button>
        </div>
      </div>
    </motion.header>
  )
}

export function Hud({ ready, stage, edition, setEdition }) {
  const showName = stage === 0
  const ed = EDITIONS[edition]
  return (
    <motion.div className="hud" data-step={stage} initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ duration: 1.2, delay: 0.7 }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      <div className="hud-left" aria-hidden="true">
        <span className="hud-no">{String(Math.min(stage + 1, 10)).padStart(2, '0')}</span>
        <span className="hud-line">
          <motion.i animate={{ scaleY: (stage + 1) / 10 }} transition={{ duration: 0.6, ease }} />
        </span>
        <span className="hud-no dim">10</span>
      </div>

      <nav className="rail" aria-label="Edition wählen">
        {EDITIONS.map((e, i) => (
          <button
            key={e.id}
            className={`rail-btn ${i === edition ? 'is-active' : ''}`}
            onClick={() => setEdition(i)}
            aria-label={`Edition ${e.name}`}
            aria-pressed={i === edition}
            style={{ '--sw': e.body, '--ac': e.accent }}
          >
            {i === edition && <motion.span layoutId="rail-ring" className="rail-ring" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <span className="rail-dot" />
            <span className="rail-label">{e.name}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {showName && (
          <motion.div
            key={ed.id}
            className="edition-name"
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease }}
          >
            <span>AIRBEAM</span>
            <span>{ed.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const LINKS = [
  ['Start', '#hero'],
  ['Sound', '#intro'],
  ['Features', '#f1'],
  ['Editionen', '#editions'],
  ['Technik', '#specs'],
  ['FAQ', '#faq'],
  ['Kontakt', '#join'],
]

export function Menu({ open, onClose, go }) {
  const first = useRef(null)
  useEffect(() => {
    if (!open) return
    first.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <button className="menu-close" onClick={onClose} aria-label="Menü schließen">
            <Icon.close />
          </button>
          <ul>
            {LINKS.map(([label, href], i) => (
              <motion.li
                key={href}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.25 + i * 0.05, ease }}
              >
                <a
                  ref={i === 0 ? first : undefined}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault()
                    onClose()
                    go(href)
                  }}
                >
                  <span className="menu-no">0{i + 1}</span>
                  {label}
                </a>
              </motion.li>
            ))}
          </ul>
          <div className="menu-foot">
            <span>Airbeam — Pure Sound. Zero Limits.</span>
            <span>Instagram · TikTok · YouTube</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
