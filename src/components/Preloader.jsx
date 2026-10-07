import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { Logo } from './ui'

// Full-screen loader with a real percentage; exits with the curved slide-up
// from the 21st.dev "Preloader" component, rebuilt with framer-motion.
export default function Preloader({ onDone }) {
  const { progress, active } = useProgress()
  const [shown, setShown] = useState(0)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [visible, setVisible] = useState(true)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 1400)
    return () => clearTimeout(t)
  }, [])

  // Count up smoothly towards the real loading progress.
  useEffect(() => {
    let raf
    let last = performance.now()
    // Time-based so it finishes even when the browser throttles frames.
    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.5)
      last = now
      setShown((s) => {
        const goal = Math.min(progress, minTimePassed ? 100 : 92)
        return s < goal ? Math.min(goal, s + Math.max(40 * dt, (goal - s) * (1 - Math.exp(-5 * dt)))) : s
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress, minTimePassed])

  useEffect(() => {
    if (shown >= 100 && !active && minTimePassed) {
      const t = setTimeout(() => {
        setVisible(false)
        doneRef.current()
      }, 250)
      return () => clearTimeout(t)
    }
  }, [shown, active, minTimePassed])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          exit={{ y: '-105%', borderBottomLeftRadius: '50% 20%', borderBottomRightRadius: '50% 20%' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="preloader-logo"
            exit={{ scale: 2.4, opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="preloader-fill" style={{ clipPath: `inset(${100 - shown}% 0 0 0)` }}>
              <Logo />
            </div>
            <div className="preloader-ghost">
              <Logo />
            </div>
          </motion.div>
          <div className="preloader-count" aria-live="polite">
            {Math.round(shown)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
