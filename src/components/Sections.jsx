import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EDITIONS, FAQ, FEATURES, SPECS } from '../data'
import { FadeUp, Icon, RevealText } from './ui'
import { carousel, spreadPx } from '../controls'

const ease = [0.22, 1, 0.36, 1]

export function Hero({ ready }) {
  return (
    <section id="hero" data-stage className="section hero">
      <motion.p
        className="hero-kicker"
        initial={{ opacity: 0, y: 20 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.9, ease }}
      >
        Pure Sound. Zero Limits.
      </motion.p>
      <motion.div
        className="scroll-cue"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.3 }}
      >
        <span className="scroll-track">
          <i />
        </span>
        <span>Scrollen, um zu entdecken</span>
      </motion.div>
    </section>
  )
}

export function Intro() {
  return (
    <section id="intro" data-stage className="section split left">
      <div className="copy">
        <FadeUp as="p" className="kicker">
          Der neue Airbeam
        </FadeUp>
        <RevealText lines={['Der Sound,', 'der dich trägt.']} className="display" />
        <FadeUp as="p" className="lead" delay={0.25}>
          Airbeam denkt In-Ear neu: adaptive Geräuschunterdrückung, räumlicher Klang und ein Akku, der länger durchhält als
          dein Tag. Öffne das Case – der Rest ist Musik.
        </FadeUp>
      </div>
    </section>
  )
}

export function Features() {
  return FEATURES.map((f, i) => (
    <section key={f.no} id={`f${i + 1}`} data-stage className={`section split ${i % 2 ? 'left' : 'right'}`}>
      <div className="copy">
        <FadeUp as="p" className="kicker">
          <span className="kicker-no">{f.no}</span> {f.kicker}
        </FadeUp>
        <RevealText lines={f.title} className="display" />
        <FadeUp as="p" className="lead" delay={0.2}>
          {f.text}
        </FadeUp>
        <FadeUp className="stat" delay={0.35}>
          <span className="stat-value">{f.stat}</span>
          <span className="stat-unit">{f.unit}</span>
        </FadeUp>
      </div>
    </section>
  ))
}

// Lets the user pull the 3D line-up left/right (drag, swipe, trackpad, arrows, keyboard).
function useLineupControls(step, active) {
  const panned = useRef(false)
  const wheel = useRef({ acc: 0, lock: 0 })

  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.target.closest('input, textarea')) return
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, step])

  return {
    onPanStart: () => {
      panned.current = true
    },
    onPan: (_, info) => {
      carousel.drag = -info.offset.x / spreadPx()
    },
    onPanEnd: (_, info) => {
      const px = spreadPx()
      const moved = -info.offset.x / px
      const fling = Math.max(-0.35, Math.min(0.35, (-info.velocity.x / px) * 0.1))
      let n = Math.round(moved + fling)
      if (n === 0 && Math.abs(info.offset.x) > 40) n = Math.sign(moved)
      carousel.drag = 0
      if (n) step(n)
    },
    onTap: (e, info) => {
      if (panned.current) {
        panned.current = false
        return
      }
      if (e.target.closest('button')) return
      const dx = info.point.x - window.scrollX - window.innerWidth / 2
      const n = Math.round(dx / spreadPx())
      if (n) step(n)
    },
    onPointerDown: () => {
      panned.current = false
    },
    onWheel: (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      const w = wheel.current
      const now = performance.now()
      if (now < w.lock) return
      w.acc += e.deltaX
      if (Math.abs(w.acc) > 45) {
        step(Math.sign(w.acc))
        w.acc = 0
        w.lock = now + 420
      }
    },
  }
}

export function Editions({ edition, setEdition, step, active, go }) {
  const ed = EDITIONS[edition]
  const controls = useLineupControls(step, active)
  return (
    <section id="editions" data-stage className="section editions">
      <div className="editions-head">
        <FadeUp as="p" className="kicker">
          Fünf Editionen
        </FadeUp>
        <RevealText lines={['Wähle deinen', 'Sound-Style']} className="display center" />
      </div>
      <motion.div className="lineup" {...controls} aria-label="Editionen durchblättern">
        <motion.button className="lineup-arrow prev" onClick={() => step(-1)} aria-label="Vorherige Edition" whileTap={{ scale: 0.9 }}>
          <Icon.arrow style={{ transform: 'rotate(180deg)' }} />
        </motion.button>
        <span className="lineup-hint" aria-hidden="true">
          <i />
          Ziehen oder wischen
          <i />
        </span>
        <motion.button className="lineup-arrow next" onClick={() => step(1)} aria-label="Nächste Edition" whileTap={{ scale: 0.9 }}>
          <Icon.arrow />
        </motion.button>
      </motion.div>
      <div className="editions-foot">
        <AnimatePresence mode="wait">
          <motion.h3
            key={ed.id + '-name'}
            className="editions-name"
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease }}
          >
            {ed.name}
          </motion.h3>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={ed.id}
            className="editions-tag"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {ed.tagline}
          </motion.p>
        </AnimatePresence>
        <div className="swatches" role="radiogroup" aria-label="Edition">
          {EDITIONS.map((e, i) => (
            <button
              key={e.id}
              role="radio"
              aria-checked={i === edition}
              className={`swatch ${i === edition ? 'is-active' : ''}`}
              style={{ '--sw': e.body, '--ac': e.accent }}
              onClick={() => setEdition(i)}
            >
              <span className="swatch-dot" />
              {e.name}
            </button>
          ))}
        </div>
        <motion.button className="cta" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => go('#join')}>
          Vorbestellen · 249 € <Icon.arrow />
        </motion.button>
      </div>
    </section>
  )
}

export function Specs() {
  return (
    <section id="specs" data-stage className="section split right specs">
      <div className="copy wide">
        <FadeUp as="p" className="kicker">
          Technische Daten
        </FadeUp>
        <RevealText lines={['Unter der', 'Haube']} className="display" />
        <dl className="spec-grid">
          {SPECS.map((s, i) => (
            <motion.div
              key={s.label}
              className="spec"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease }}
            >
              <dt>{s.label}</dt>
              <dd>
                <strong>{s.value}</strong>
                <span>{s.note}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// Accordion adapted from the 21st.dev "FAQ Accordion" (scrollxui): staggered entrance,
// rebuilt without Radix using framer-motion height animation.
export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" data-stage className="section faq">
      <div className="faq-inner">
        <RevealText lines={['Häufige', 'Fragen']} className="display huge" />
        <ul className="faq-list">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <motion.li
                key={i}
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
              >
                <h3>
                  <button aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span>{item.q}</span>
                    <motion.span className="faq-icon" animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                      <Icon.plus />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function Join() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  const submit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState('error')
    setState('done')
  }
  return (
    <section id="join" data-stage className="section join">
      <div className="join-inner">
        <RevealText lines={['Bleib auf', 'Empfang']} className="display huge center" />
        <FadeUp as="p" className="lead center">
          Sei die erste Person, die von neuen Editionen, Drops und Vorverkäufen erfährt.
        </FadeUp>
        <AnimatePresence mode="wait">
          {state === 'done' ? (
            <motion.p key="done" className="join-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              Du bist dabei. Check dein Postfach.
            </motion.p>
          ) : (
            <motion.form key="form" className="join-form" onSubmit={submit} noValidate exit={{ opacity: 0 }}>
              <label htmlFor="email">Deine E-Mail-Adresse</label>
              <div className="join-row">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@mail.de"
                  value={email}
                  aria-invalid={state === 'error'}
                  aria-describedby="email-msg"
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setState('idle')
                  }}
                />
                <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Anmelden
                </motion.button>
              </div>
              <p id="email-msg" className={`join-msg ${state === 'error' ? 'is-error' : ''}`}>
                {state === 'error' ? 'Bitte gib eine gültige E-Mail-Adresse ein.' : 'Mit der Anmeldung akzeptierst du unsere Datenschutzerklärung.'}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <footer className="footer">
        <span>© 2026 Airbeam Audio</span>
        <nav aria-label="Rechtliches">
          <a href="#join">Impressum</a>
          <a href="#join">AGB</a>
          <a href="#join">Datenschutz</a>
        </nav>
        <nav aria-label="Social Media">
          <a href="#join">Instagram</a>
          <a href="#join">TikTok</a>
        </nav>
      </footer>
    </section>
  )
}
