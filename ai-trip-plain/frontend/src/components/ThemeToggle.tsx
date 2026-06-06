import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getPreferredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.body.classList.toggle('dark', theme === 'dark')
}

function SunIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={false}
      animate={{ opacity: active ? 1 : 0.0, scale: active ? 1 : 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ willChange: 'transform, opacity' }}
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={false}
      animate={{ opacity: active ? 1 : 0.0, scale: active ? 1 : 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ willChange: 'transform, opacity' }}
    >
      <path
        d="M21 13.2A8.2 8.2 0 0 1 10.8 3a6.8 6.8 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getPreferredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const isDark = theme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  // Light mode: Sun icon must be white and visible.
  const sunColor = 'text-white'


  // Dark mode: Sun icon can be warm.
  const sunDarkColor = 'text-[#fbbf24]'

  // Force Sun to black always (regardless of theme), per request.
  const sunAlwaysBlackColor = 'text-black'

  const moonColor = 'dark:text-[#f7deb2] text-[#111827]'


  const toggle = () => {
    setTheme(nextTheme)
    window.localStorage.setItem('theme', nextTheme)
  }


  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 520, damping: 26, mass: 0.9 }}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        'relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#23466a] bg-[#08203d] text-white shadow-sm shadow-slate-900/10 backdrop-blur transition ' +
        'hover:shadow-md dark:border-[#23466a] dark:bg-[#08203d]'
      }
    >
      <motion.span
        aria-hidden="true"
        className={
          'absolute inset-0 rounded-full opacity-0 transition-opacity ' +
          (isDark ? 'bg-[#0ea5e9]/15' : 'bg-[#fbbf24]/15')
        }
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Fixed-size centered icon area to prevent shifting/flicker */}
      <span className="relative z-10 flex h-6 w-6 items-center justify-center">
        <span className={'absolute inset-0 flex items-center justify-center ' + sunColor}>
          <SunIcon active={!isDark} />
        </span>

        <span className={'absolute inset-0 flex items-center justify-center ' + moonColor}>
          <MoonIcon active={isDark} />
        </span>
      </span>


      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full ring-0 transition group-focus-visible:ring-4 group-focus-visible:ring-[#d5b487]/35"
      />
    </motion.button>
  )
}
