import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

type LoginNavigationState = {
  showLoginSuccess?: boolean
  showLogoutSuccess?: boolean
}

export default function LoginSuccessPopup() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const state = location.state as LoginNavigationState | null
  const searchParams = new URLSearchParams(location.search)
  const searchStatus = searchParams.get('success') as 'login' | 'logout' | null
  const status = searchStatus === 'logout'
    ? 'logout'
    : searchStatus === 'login'
    ? 'login'
    : state?.showLogoutSuccess
    ? 'logout'
    : state?.showLoginSuccess
    ? 'login'
    : undefined

  const message = status === 'logout'
    ? 'You have been logged out successfully.'
    : 'Welcome back to TripZenAI!'
  const title = status === 'logout' ? 'Logout Successful' : 'Login Successful'

  useEffect(() => {
    if (!status) return

    setIsVisible(true)
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: null,
    })
  }, [
    status,
    location.hash,
    location.pathname,
    location.search,
    navigate,
  ])

  useEffect(() => {
    if (!isVisible) return

    const timeoutId = window.setTimeout(() => setIsVisible(false), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-labelledby="login-success-title"
            aria-describedby="login-success-message"
            className="pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-2xl border border-white/70 bg-white px-5 py-3 pr-12 shadow-xl shadow-emerald-950/20 dark:border-slate-700 dark:bg-slate-900"
            initial={{ opacity: 0, scale: 0.95, y: -18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            </div>

            <button
              type="button"
              onClick={() => setIsVisible(false)}
              aria-label="Close login success popup"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <h2
                id="login-success-title"
                className="font-black tracking-tight text-slate-900 dark:text-white"
              >
                {title}
              </h2>
              <p
                id="login-success-message"
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                {message}
              </p>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-emerald-500"
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
