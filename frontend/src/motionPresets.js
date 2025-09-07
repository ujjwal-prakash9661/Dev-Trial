// Reusable Framer Motion variants for consistent animations across the app
// These are deliberately subtle to avoid disrupting UX

export const pageVariants = {
  initial: { opacity: 0, y: 8, filter: 'blur(2px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)' },
  out: { opacity: 0, y: -8, filter: 'blur(2px)' },
}

export const pageTransition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.6,
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 }
  }),
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.06 }
  }
}