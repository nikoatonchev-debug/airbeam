import { motion } from 'framer-motion'

export function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`} aria-label="Airbeam">
      <span className="logo-air">AIR</span>
      <span className="logo-beam">BEAM</span>
    </span>
  )
}

// Word-by-word blur-in headline, adapted from the 21st.dev "FAQ Accordion" component (scrollxui).
export function RevealText({ lines, as: Tag = 'h2', className = '', delay = 0 }) {
  let n = 0
  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span className="reveal-line" key={li}>
          {line.split(' ').map((word, wi) => {
            const i = n++
            return (
              <motion.span
                key={wi}
                className="reveal-word"
                initial={{ opacity: 0, filter: 'blur(10px)', y: '40%' }}
                whileInView={{ opacity: 1, filter: 'blur(0px)', y: '0%' }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 0.6, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

export function FadeUp({ children, delay = 0, className = '', as = 'div' }) {
  const C = motion[as]
  return (
    <C
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </C>
  )
}

// Small inline icons (stroke, currentColor) for the HUD and features.
export const Icon = {
  arrow: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
}
