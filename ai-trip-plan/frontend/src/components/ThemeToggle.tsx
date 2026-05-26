import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    }
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.localStorage.setItem('theme', next)
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.98 }}
      className="px-3 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 shadow-soft text-sm font-semibold"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? 'Dark' : 'Light'}
    </motion.button>
  )
}

